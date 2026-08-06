from typing import Annotated
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jose import JWTError
from sqlmodel.ext.asyncio.session import AsyncSession
from app.core.security import decode_token
from app.db.session import get_session
from app.models.user import User, UserRole

bearer_scheme = HTTPBearer(auto_error=False)


async def get_current_user(
    credentials: Annotated[HTTPAuthorizationCredentials | None, Depends(bearer_scheme)],
    session: Annotated[AsyncSession, Depends(get_session)],
) -> User:
    """Extract and validate the JWT token, return the authenticated User."""
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    if not credentials:
        raise credentials_exception

    try:
        payload = decode_token(credentials.credentials)
        user_id: str = payload.get("sub")
        token_type: str = payload.get("type")
        if user_id is None or token_type != "access":
            raise credentials_exception
    except JWTError:
        raise credentials_exception

    user = await session.get(User, int(user_id))
    if user is None or not user.is_active:
        raise credentials_exception
    return user


def require_role(*roles: str | UserRole):
    """Factory that returns a dependency enforcing one of the given roles."""
    allowed_roles = [r if isinstance(r, UserRole) else UserRole(r) for r in roles]

    async def role_checker(
        current_user: Annotated[User, Depends(get_current_user)],
    ) -> User:
        if current_user.role not in allowed_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Access restricted. Required role(s): {[r.value for r in allowed_roles]}",
            )
        return current_user

    return role_checker


# Convenience role dependencies
CurrentUser = Annotated[User, Depends(get_current_user)]
RequireCustomer = Annotated[User, Depends(require_role(UserRole.customer))]
RequireProvider = Annotated[User, Depends(require_role(UserRole.provider))]
RequireAdmin = Annotated[User, Depends(require_role(UserRole.admin))]
RequireCustomerOrProvider = Annotated[
    User, Depends(require_role(UserRole.customer, UserRole.provider))
]
