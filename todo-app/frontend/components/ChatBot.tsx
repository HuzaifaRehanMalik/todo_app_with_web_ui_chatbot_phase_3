"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { Icon } from "@/components/ui";
import { todayKey } from "@/lib/dates";

type ChatRole = "user" | "assistant";

type ChatMessage = {
  id: string;
  role: ChatRole;
  content: string;
};

export type ChatBotProps = {
  isOpen?: boolean;
  onOpen?: () => void;
  onClose?: () => void;
  onTodoUpdate?: () => void;
};

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000/api/v1";

const SUGGESTIONS = ["What's due today?", "Add buy milk tomorrow", "Move my first task to Friday"];

export default function ChatBot({
  isOpen,
  onOpen,
  onClose,
  onTodoUpdate,
}: ChatBotProps) {
  const isControlled = typeof isOpen === "boolean";

  const [internalOpen, setInternalOpen] = useState(false);
  const open = isControlled ? (isOpen as boolean) : internalOpen;

  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: cryptoRandomId(),
      role: "assistant",
      content:
        "Hello — I can add, schedule and finish tasks for you. Try “add call mom tomorrow” or “what’s due today?”.",
    },
  ]);

  const canSend = useMemo(
    () => input.trim().length > 0 && !loading,
    [input, loading]
  );

  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
  }, [messages, loading, open]);

  const closeChat = () => {
    if (isControlled) onClose?.();
    else setInternalOpen(false);
  };

  const openChat = () => {
    if (isControlled) onOpen?.();
    else setInternalOpen(true);
  };

  async function sendMessage(override?: string) {
    const text = (override ?? input).trim();
    if (!text || loading) return;

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
        // Send the local calendar day so "today"/"tomorrow" resolve in the user's timezone.
        body: JSON.stringify({ message: text, today: todayKey() }),
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
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          id: cryptoRandomId(),
          role: "assistant",
          content: `⚠️ ${(err instanceof Error && err.message) || "Something went wrong."}`,
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  /* Floating launcher */
  if (!open) {
    return (
      <div className="fixed bottom-5 right-4 z-40 md:bottom-8 md:right-8">
        {(!isControlled || onOpen) && (
          <button
            onClick={openChat}
            aria-label="Open assistant"
            className="group animate-rise flex items-center gap-3 rounded-full bg-ink py-1.5 pl-5 pr-1.5 text-sm text-paper shadow-[0_24px_48px_-20px_rgba(0,0,0,0.9)] transition-all duration-500 ease-spring hover:-translate-y-0.5 active:scale-[0.98]"
          >
            <span className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-sage-soft" />
              Ask Todoify
            </span>
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-paper/10 transition-transform duration-500 ease-spring group-hover:scale-105 group-hover:rotate-[-8deg]">
              <Icon name="chat" />
            </span>
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="fixed inset-x-3 bottom-3 z-40 animate-rise md:inset-x-auto md:bottom-8 md:right-8 md:w-[400px]">
      <div className="rounded-[2rem] bg-ink/[0.05] p-1.5 ring-1 ring-ink/[0.08] shadow-[0_40px_80px_-30px_rgba(0,0,0,0.9)] backdrop-blur-2xl">
        <div className="flex h-[min(560px,calc(100dvh-6rem))] flex-col overflow-hidden rounded-[calc(2rem-0.375rem)] bg-card shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]">
          {/* Header */}
          <div className="flex items-center justify-between px-5 pb-3 pt-4">
            <div className="flex items-center gap-3">
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-ink text-paper">
                <Icon name="spark" />
              </span>
              <div>
                <h3 className="font-display text-xl leading-none">Todoify</h3>
                <p className="mt-1 flex items-center gap-1.5 text-[11px] text-muted">
                  <span className="h-1.5 w-1.5 rounded-full bg-sage" />
                  Assistant
                </p>
              </div>
            </div>
            <button
              onClick={closeChat}
              aria-label="Close assistant"
              className="flex h-9 w-9 items-center justify-center rounded-full text-muted transition-all duration-500 ease-spring hover:bg-ink/[0.06] hover:text-ink active:scale-90"
            >
              <Icon name="close" />
            </button>
          </div>

          <div className="mx-5 h-px bg-ink/[0.06]" />

          {/* Messages */}
          <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto px-4 py-5">
            {messages.map((m) => (
              <div
                key={m.id}
                className={`animate-rise flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[85%] whitespace-pre-wrap px-4 py-2.5 text-sm leading-relaxed ${
                    m.role === "user"
                      ? "rounded-[1.25rem] rounded-br-md bg-ink text-paper"
                      : "rounded-[1.25rem] rounded-bl-md bg-paper text-ink ring-1 ring-ink/[0.05]"
                  }`}
                >
                  {m.content}
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex justify-start">
                <div className="flex items-center gap-1 rounded-[1.25rem] rounded-bl-md bg-paper px-4 py-3.5 ring-1 ring-ink/[0.05]">
                  {[0, 1, 2].map((i) => (
                    <span
                      key={i}
                      className="dot-breathe h-1.5 w-1.5 rounded-full bg-ink/50"
                      style={{ animationDelay: `${i * 150}ms` }}
                    />
                  ))}
                </div>
              </div>
            )}

            {messages.length === 1 && !loading && (
              <div className="flex flex-wrap gap-2 pt-2">
                {SUGGESTIONS.map((s) => (
                  <button
                    key={s}
                    onClick={() => sendMessage(s)}
                    className="rounded-full px-3 py-1.5 text-xs text-ink-soft ring-1 ring-ink/10 transition-all duration-500 ease-spring hover:bg-ink hover:text-paper hover:ring-ink active:scale-[0.97]"
                  >
                    {s}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Input */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              sendMessage();
            }}
            className="p-3"
          >
            <div className="flex items-center gap-2 rounded-full bg-paper/80 p-1.5 pl-5 ring-1 ring-ink/[0.07] transition-all duration-500 ease-spring focus-within:bg-card focus-within:ring-ink/20">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask about your list…"
                aria-label="Message"
                className="min-w-0 flex-1 bg-transparent text-sm text-ink caret-ink outline-none placeholder:text-muted"
              />
              <button
                type="submit"
                disabled={!canSend}
                aria-label="Send"
                className="group flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-ink text-paper transition-all duration-500 ease-spring active:scale-90 disabled:bg-ink/15 disabled:text-ink/40"
              >
                <Icon
                  name="send"
                  className="w-4 h-4 transition-transform duration-500 ease-spring group-hover:translate-x-0.5 group-hover:-translate-y-px"
                  strokeWidth={1.5}
                />
              </button>
            </div>
          </form>
        </div>
      </div>
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
