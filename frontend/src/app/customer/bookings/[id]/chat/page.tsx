"use client";

import { useEffect, useRef, useState } from "react";
import { useParams } from "next/navigation";
import { Send, MessageCircle, Loader2 } from "lucide-react";
import api from "@/lib/api";
import { authStorage } from "@/lib/auth";

interface Message {
  id: number;
  sender_id: number;
  content: string;
  created_at: string;
}

export default function ChatPage() {
  const { id: bookingId } = useParams<{ id: string }>();
  const [messages, setMessages] = useState<Message[]>([]);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    // Load current user
    api.get("/users/me/profile").then(r => setCurrentUserId(r.data.id)).catch(() => {});

    // Load message history
    api.get<Message[]>(`/chat/${bookingId}/messages`)
      .then(r => setMessages(r.data))
      .finally(() => setLoading(false));

    // Connect WebSocket using cookie-based token
    const token = authStorage.getAccessToken();
    if (!token) { setLoading(false); return; }

    const wsUrl = `ws://localhost:8000/api/v1/chat/ws/${bookingId}`;
    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;

    ws.onopen = () => {
      ws.send(JSON.stringify({ token }));
    };

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === "message" && data.sender_id !== currentUserId) {
        // Only add messages from the OTHER person (we add our own optimistically)
        setMessages(prev => [...prev, { id: data.id, sender_id: data.sender_id, content: data.content, created_at: data.created_at }]);
      }
    };

    return () => { ws.close(); };
  }, [bookingId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const send = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;
    const content = text.trim();
    setText("");
    setSending(true);

    // Optimistic UI: add own message immediately
    const optimistic: Message = {
      id: Date.now(),
      sender_id: currentUserId ?? -1,
      content,
      created_at: new Date().toISOString(),
    };
    setMessages(prev => [...prev, optimistic]);

    try {
      await api.post(`/chat/${bookingId}/messages`, { content });
    } catch {
      // message may still deliver via WS
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="flex flex-col h-screen max-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 px-4 py-3 flex items-center gap-3 flex-shrink-0">
        <div className="w-9 h-9 rounded-xl bg-violet-100 flex items-center justify-center">
          <MessageCircle className="w-5 h-5 text-violet-600" />
        </div>
        <div>
          <p className="font-semibold text-gray-900 text-sm">Booking #{bookingId} Chat</p>
          <p className="text-xs text-gray-400">Messages are private between you and the provider</p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
        {loading ? (
          <div className="flex justify-center py-8"><Loader2 className="w-6 h-6 animate-spin text-gray-300" /></div>
        ) : messages.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <MessageCircle className="w-10 h-10 mx-auto mb-3 opacity-30" />
            <p className="text-sm">No messages yet. Start the conversation!</p>
          </div>
        ) : (
          messages.map(msg => {
            const isMe = msg.sender_id === currentUserId;
            return (
              <div key={msg.id} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-xs lg:max-w-sm px-4 py-2.5 rounded-2xl text-sm ${
                  isMe
                    ? "bg-violet-600 text-white rounded-br-sm"
                    : "bg-white border border-gray-100 text-gray-800 shadow-sm rounded-bl-sm"
                }`}>
                  <p>{msg.content}</p>
                  <p className={`text-[10px] mt-1 ${isMe ? "text-violet-200" : "text-gray-400"}`}>
                    {new Date(msg.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </p>
                </div>
              </div>
            );
          })
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="bg-white border-t border-gray-100 px-4 py-3 flex-shrink-0">
        <form onSubmit={send} className="flex items-center gap-2">
          <input
            type="text"
            value={text}
            onChange={e => setText(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-violet-300 text-sm"
          />
          <button type="submit" disabled={sending || !text.trim()} className="w-10 h-10 rounded-xl bg-violet-600 hover:bg-violet-700 flex items-center justify-center text-white disabled:opacity-40 transition-colors flex-shrink-0">
            {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          </button>
        </form>
      </div>
    </div>
  );
}
