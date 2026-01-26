"use client";

import React, { useMemo, useState } from "react";

type ChatRole = "user" | "assistant";

type ChatMessage = {
  id: string;
  role: ChatRole;
  content: string;
};

export type ChatBotProps = {
  isOpen?: boolean;
  onClose?: () => void;
  onTodoUpdate?: () => void;
};

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000/api/v1";

export default function ChatBot({
  isOpen,
  onClose,
  onTodoUpdate,
}: ChatBotProps) {
  const isControlled = typeof isOpen === "boolean";

  const [internalOpen, setInternalOpen] = useState(false);
  const open = isControlled ? (isOpen as boolean) : internalOpen;

  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: cryptoRandomId(),
      role: "assistant",
      content:
        "Hi! 👋 I can help you manage your todos. Try: “add buy milk” or “show my todos”.",
    },
  ]);

  const canSend = useMemo(
    () => input.trim().length > 0 && !loading,
    [input, loading]
  );

  const closeChat = () => {
    if (isControlled) onClose?.();
    else setInternalOpen(false);
  };

  const openChat = () => {
    if (!isControlled) setInternalOpen(true);
  };

  async function sendMessage() {
    if (!canSend) return;

    const text = input.trim();
    setInput("");

    setMessages((prev) => [
      ...prev,
      { id: cryptoRandomId(), role: "user", content: text },
    ]);

    setLoading(true);

    try {
      const token =
        typeof window !== "undefined"
          ? localStorage.getItem("access_token")
          : null;

      if (!token) {
        throw new Error("Please login to use the chatbot.");
      }

      const res = await fetch(`${API_BASE_URL}/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ message: text }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err?.detail || "Chat request failed");
      }

      const data = await res.json();

      const reply =
        data?.reply ||
        data?.message ||
        data?.response ||
        data?.content ||
        "Done.";

      setMessages((prev) => [
        ...prev,
        { id: cryptoRandomId(), role: "assistant", content: String(reply) },
      ]);

      if (data?.todo_changed || data?.todos_updated) {
        onTodoUpdate?.();
      }
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        {
          id: cryptoRandomId(),
          role: "assistant",
          content: `⚠️ ${err.message || "Something went wrong."}`,
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  /* Floating button */
  if (!open) {
    return (
      <div className="fixed bottom-5 right-5 z-50">
        {!isControlled && (
          <button
            onClick={openChat}
            className="flex h-14 w-14 items-center justify-center rounded-full bg-blue-600 text-xl text-white shadow-lg hover:bg-blue-700"
          >
            💬
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="fixed bottom-5 right-5 z-50 h-[520px] w-[360px] max-w-[calc(100vw-40px)] rounded-2xl bg-slate-50 shadow-2xl flex flex-col border">
      {/* Header */}
      <div className="flex items-center justify-between rounded-t-2xl bg-blue-600 px-4 py-3 text-white">
        <h3 className="font-semibold text-sm">Todo ChatBot</h3>
        <button
          onClick={closeChat}
          className="rounded-lg bg-blue-700 px-2 py-1 text-sm hover:bg-blue-800"
        >
          ✕
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-3">
        {messages.map((m) => (
          <div
            key={m.id}
            className={`flex ${
              m.role === "user" ? "justify-end" : "justify-start"
            }`}
          >
            <div
              className={`max-w-[85%] rounded-2xl px-3 py-2 text-sm leading-relaxed ${
                m.role === "user"
                  ? "bg-blue-600 text-white rounded-br-md"
                  : "bg-blue-100 text-blue-700 rounded-bl-md"
              }`}
            >
              {m.content}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex justify-start">
            <div className="rounded-2xl rounded-bl-md bg-blue-100 px-3 py-2 text-sm text-blue-700">
              Typing…
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          sendMessage();
        }}
        className="flex gap-2 border-t bg-white p-3"
      >
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type a message…"
          className="flex-1 rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm !text-black !caret-black placeholder-gray-400 outline-none focus:border-blue-500"

        />
        <button
          type="submit"
          disabled={!canSend}
          className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
        >
          Send
        </button>
      </form>
    </div>
  );
}

function cryptoRandomId(): string {
  try {
    return crypto.randomUUID();
  } catch {
    return `${Date.now()}-${Math.random()}`;
  }
}
