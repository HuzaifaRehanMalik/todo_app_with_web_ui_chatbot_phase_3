"use client";

import React, { useMemo, useState } from "react";

type ChatRole = "user" | "assistant";

type ChatMessage = {
  id: string;
  role: ChatRole;
  content: string;
};

export type ChatBotProps = {
  /**
   * Optional: If you pass isOpen, the widget behaves like a controlled component.
   * If you DON'T pass it, it behaves like an uncontrolled widget with its own open/close button.
   */
  isOpen?: boolean;
  onClose?: () => void;

  /**
   * Optional callback if your chatbot actions change todos (create/update/delete) and you want to refresh list.
   */
  onTodoUpdate?: () => void;
};

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000/api/v1";

/**
 * ChatBot (self-contained)
 * - No external CSS file required
 * - Props are optional, so <ChatBot /> compiles
 */
export default function ChatBot({ isOpen, onClose, onTodoUpdate }: ChatBotProps) {
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
        "Hi! I can help you with your todos. Tell me what you want to do (e.g., “add buy milk”, “show my todos”).",
    },
  ]);

  const closeChat = () => {
    if (isControlled) {
      onClose?.();
    } else {
      setInternalOpen(false);
    }
  };

  const openChat = () => {
    if (!isControlled) setInternalOpen(true);
  };

  const canSend = useMemo(() => input.trim().length > 0 && !loading, [input, loading]);

  async function sendMessage() {
    if (!canSend) return;

    const text = input.trim();
    setInput("");

    const userMsg: ChatMessage = {
      id: cryptoRandomId(),
      role: "user",
      content: text,
    };

    setMessages((prev) => [...prev, userMsg]);
    setLoading(true);

    try {
      // Adjust this endpoint to your backend chatbot route.
      // Common choices:
      //  - /chat
      //  - /chatbot
      //  - /assistant
      //  - /ai/chat
      //
      // If your backend route is different, just change CHAT_ENDPOINT below.
      const CHAT_ENDPOINT = "/chat";

      const res = await fetch(`${API_BASE_URL}${CHAT_ENDPOINT}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text }),
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        const msg =
          errJson?.detail ||
          `Chat API failed: ${res.status} ${res.statusText}`;
        throw new Error(msg);
      }

      const data = await res.json().catch(() => null);

      // Accept a few common response shapes
      const assistantText =
        (data && (data.reply || data.message || data.response || data.content)) ??
        "Done.";

      const botMsg: ChatMessage = {
        id: cryptoRandomId(),
        role: "assistant",
        content: String(assistantText),
      };

      setMessages((prev) => [...prev, botMsg]);

      // If your backend returns something like { todo_changed: true }
      // you can trigger refresh
      if (data?.todo_changed || data?.todos_updated) {
        onTodoUpdate?.();
      }
    } catch (e: any) {
      const botMsg: ChatMessage = {
        id: cryptoRandomId(),
        role: "assistant",
        content: `⚠️ ${e?.message || "Something went wrong."}`,
      };
      setMessages((prev) => [...prev, botMsg]);
    } finally {
      setLoading(false);
    }
  }

  // If closed, show a small floating button (only when uncontrolled)
  if (!open) {
    return (
      <div style={styles.fabWrap}>
        {!isControlled && (
          <button style={styles.fab} onClick={openChat} aria-label="Open ChatBot">
            💬
          </button>
        )}
      </div>
    );
  }

  return (
    <div style={styles.overlay}>
      <div style={styles.panel}>
        <div style={styles.header}>
          <div style={styles.title}>ChatBot</div>
          <button style={styles.closeBtn} onClick={closeChat} aria-label="Close ChatBot">
            ✕
          </button>
        </div>

        <div style={styles.body}>
          {messages.map((m) => (
            <div
              key={m.id}
              style={{
                ...styles.bubbleRow,
                justifyContent: m.role === "user" ? "flex-end" : "flex-start",
              }}
            >
              <div
                style={{
                  ...styles.bubble,
                  ...(m.role === "user" ? styles.userBubble : styles.botBubble),
                }}
              >
                {m.content}
              </div>
            </div>
          ))}

          {loading && (
            <div style={{ ...styles.bubbleRow, justifyContent: "flex-start" }}>
              <div style={{ ...styles.bubble, ...styles.botBubble }}>Typing…</div>
            </div>
          )}
        </div>

        <div style={styles.footer}>
          <input
            style={styles.input}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type a message…"
            onKeyDown={(e) => {
              if (e.key === "Enter") sendMessage();
            }}
          />
          <button
            style={{
              ...styles.sendBtn,
              opacity: canSend ? 1 : 0.6,
              cursor: canSend ? "pointer" : "not-allowed",
            }}
            onClick={sendMessage}
            disabled={!canSend}
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}

function cryptoRandomId(): string {
  // Safe fallback if crypto is unavailable
  try {
    // @ts-ignore
    return crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random()}`;
  } catch {
    return `${Date.now()}-${Math.random()}`;
  }
}

const styles: Record<string, React.CSSProperties> = {
  fabWrap: {
    position: "fixed",
    right: 18,
    bottom: 18,
    zIndex: 50,
  },
  fab: {
    width: 54,
    height: 54,
    borderRadius: 999,
    border: "none",
    background: "#111827",
    color: "white",
    fontSize: 22,
    boxShadow: "0 10px 25px rgba(0,0,0,0.2)",
  },
  overlay: {
    position: "fixed",
    right: 18,
    bottom: 18,
    width: 360,
    maxWidth: "calc(100vw - 36px)",
    height: 520,
    maxHeight: "calc(100vh - 36px)",
    zIndex: 60,
  },
  panel: {
    width: "100%",
    height: "100%",
    background: "white",
    borderRadius: 14,
    boxShadow: "0 12px 30px rgba(0,0,0,0.25)",
    overflow: "hidden",
    display: "flex",
    flexDirection: "column",
    border: "1px solid rgba(0,0,0,0.08)",
  },
  header: {
    padding: "12px 12px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    borderBottom: "1px solid rgba(0,0,0,0.08)",
    background: "#F9FAFB",
  },
  title: {
    fontWeight: 700,
    fontSize: 14,
    color: "#111827",
  },
  closeBtn: {
    width: 34,
    height: 34,
    borderRadius: 10,
    border: "none",
    background: "#111827",
    color: "white",
    cursor: "pointer",
  },
  body: {
    flex: 1,
    padding: 12,
    overflowY: "auto",
    background: "white",
  },
  bubbleRow: {
    display: "flex",
    marginBottom: 10,
  },
  bubble: {
    maxWidth: "85%",
    padding: "10px 12px",
    borderRadius: 14,
    fontSize: 13,
    lineHeight: 1.35,
    whiteSpace: "pre-wrap",
  },
  userBubble: {
    background: "#111827",
    color: "white",
    borderBottomRightRadius: 6,
  },
  botBubble: {
    background: "#F3F4F6",
    color: "#111827",
    borderBottomLeftRadius: 6,
  },
  footer: {
    padding: 10,
    display: "flex",
    gap: 8,
    borderTop: "1px solid rgba(0,0,0,0.08)",
    background: "#F9FAFB",
  },
  input: {
    flex: 1,
    padding: "10px 12px",
    borderRadius: 12,
    border: "1px solid rgba(0,0,0,0.12)",
    outline: "none",
    fontSize: 13,
  },
  sendBtn: {
    padding: "10px 12px",
    borderRadius: 12,
    border: "none",
    background: "#111827",
    color: "white",
    fontWeight: 600,
  },
};
