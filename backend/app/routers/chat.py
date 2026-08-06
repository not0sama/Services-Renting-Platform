"""In-app chat router — WebSocket + REST (FR-40)."""
from __future__ import annotations

import json
import logging
from collections import defaultdict
from typing import Annotated, Any

from fastapi import APIRouter, Depends, HTTPException, WebSocket, WebSocketDisconnect, status
from sqlmodel import select

from app.core.deps import get_current_user, get_session
from app.db.session import get_session as get_db_session
from app.models.message import Message
from app.models.booking import Booking
from app.models.user import User
from sqlalchemy.ext.asyncio import AsyncSession

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/chat", tags=["Chat"])

# In-memory connection manager (no Redis — as per plan)
_connections: dict[int, list[WebSocket]] = defaultdict(list)


class ConnectionManager:
    def connect(self, booking_id: int, ws: WebSocket) -> None:
        _connections[booking_id].append(ws)

    def disconnect(self, booking_id: int, ws: WebSocket) -> None:
        if ws in _connections[booking_id]:
            _connections[booking_id].remove(ws)

    async def broadcast(self, booking_id: int, data: dict) -> None:
        for ws in list(_connections.get(booking_id, [])):
            try:
                await ws.send_json(data)
            except Exception:
                pass


manager = ConnectionManager()


# ─── REST: fetch message history ───────────────────────────────────────────

@router.get("/{booking_id}/messages", summary="Get chat history")
async def get_messages(
    booking_id: int,
    db: Annotated[AsyncSession, Depends(get_session)],
    current_user: Annotated[User, Depends(get_current_user)],
) -> list[dict]:
    # Verify user is participant
    b_res = await db.execute(select(Booking).where(Booking.id == booking_id))
    booking = b_res.scalar_one_or_none()
    if not booking:
        raise HTTPException(404, "Booking not found")
    if current_user.id not in (booking.customer_id, booking.provider_user_id):
        raise HTTPException(403, "Not a participant in this booking")

    result = await db.execute(
        select(Message).where(Message.booking_id == booking_id).order_by(Message.created_at)
    )
    msgs = result.scalars().all()
    return [
        {
            "id": m.id,
            "sender_id": m.sender_id,
            "content": m.content,
            "attachment_url": m.attachment_url,
            "created_at": m.created_at.isoformat(),
        }
        for m in msgs
    ]


# ─── REST: send message (fallback if WS unavailable) ───────────────────────

@router.post("/{booking_id}/messages", summary="Send a chat message")
async def send_message(
    booking_id: int,
    body: dict,
    db: Annotated[AsyncSession, Depends(get_session)],
    current_user: Annotated[User, Depends(get_current_user)],
) -> dict:
    b_res = await db.execute(select(Booking).where(Booking.id == booking_id))
    booking = b_res.scalar_one_or_none()
    if not booking:
        raise HTTPException(404, "Booking not found")
    if current_user.id not in (booking.customer_id, booking.provider_user_id):
        raise HTTPException(403, "Not a participant")

    msg = Message(
        booking_id=booking_id,
        sender_id=current_user.id,
        content=body.get("content", "")[:4000],
    )
    db.add(msg)
    await db.commit()
    await db.refresh(msg)

    out = {
        "id": msg.id,
        "sender_id": msg.sender_id,
        "content": msg.content,
        "created_at": msg.created_at.isoformat(),
    }
    await manager.broadcast(booking_id, {"type": "message", **out})
    return out


# ─── WebSocket ─────────────────────────────────────────────────────────────

@router.websocket("/ws/{booking_id}")
async def chat_ws(
    websocket: WebSocket,
    booking_id: int,
) -> None:
    """
    WebSocket endpoint for real-time chat.
    Client must send { token: "<jwt>" } as first message for authentication.
    Then send { content: "..." } to post messages.
    """
    await websocket.accept()

    # Simple auth: expect { token: "..." } as first message
    try:
        auth_data = await websocket.receive_json()
        token = auth_data.get("token", "")
        from app.core.security import decode_access_token
        payload = decode_access_token(token)
        if not payload:
            await websocket.close(code=4001, reason="Unauthorized")
            return
        user_id = payload.get("sub")
    except Exception:
        await websocket.close(code=4001, reason="Auth failed")
        return

    manager.connect(booking_id, websocket)
    logger.info("WS connected: user %s → booking %s", user_id, booking_id)

    try:
        while True:
            data = await websocket.receive_json()
            content = data.get("content", "")[:4000]
            if not content:
                continue

            # Persist via DB session
            async for db in get_db_session():
                msg = Message(booking_id=booking_id, sender_id=int(user_id), content=content)
                db.add(msg)
                await db.commit()
                await db.refresh(msg)
                out = {
                    "id": msg.id,
                    "sender_id": msg.sender_id,
                    "content": msg.content,
                    "created_at": msg.created_at.isoformat(),
                }
                break

            await manager.broadcast(booking_id, {"type": "message", **out})
    except WebSocketDisconnect:
        manager.disconnect(booking_id, websocket)
        logger.info("WS disconnected: user %s from booking %s", user_id, booking_id)
