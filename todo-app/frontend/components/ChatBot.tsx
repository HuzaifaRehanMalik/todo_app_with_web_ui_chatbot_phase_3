"use client";

import React, { useState } from "react";


type ChatRole = "user" | "assistant";

interface ChatMessage {
  id: number;
  role: ChatRole;
  content: string;
}

interface ChatBotProps {
  isOpen: boolean;
  onClose: () => void;
  onTodoUpdate?: () => void;
}

const ChatBot: React.FC<ChatBotProps> = ({ isOpen, onClose, onTodoUpdate }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 1,
      role: "assistant",
      content: "Hi! I’m your Todo Assistant. Tell me what you want to do.",
    },
  ]);

  const [input, setInput] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  if (!isOpen) return null;

  const sendMessage = async () => {
    const text = input.trim();
    if (!text) return;

    const userMsg: ChatMessage = {
      id: Date.now(),
      role: "user",
      content: text,
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      // ✅ safer base url handling
      const base = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000/api/v1";

      // Change this endpoint if your backend route is different
      const res = await fetch(`${base}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text }),
      });

      const data = (await res.json().catch(() => ({}))) as { response?: string; detail?: string };

      if (!res.ok) {
        throw new Error(data.detail || `Request failed: ${res.status}`);
      }

      const botMsg: ChatMessage = {
        id: Date.now() + 1,
        role: "assistant",
        content: data.response ?? "I didn’t understand that. Try again.",
      };

      setMessages((prev) => [...prev, botMsg]);

      if (onTodoUpdate) onTodoUpdate();
    } catch (err) {
      const botMsg: ChatMessage = {
        id: Date.now() + 2,
        role: "assistant",
        content: err instanceof Error ? err.message : "Something went wrong.",
      };
      setMessages((prev) => [...prev, botMsg]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="chatbot">
      <div className="chatbot-header">
        <h3>Todo Chatbot</h3>
        <button type="button" onClick={onClose} aria-label="Close chatbot">
          ✕
        </button>
      </div>

      <div className="chatbot-messages">
        {messages.map((m) => (
          <div key={m.id} className={`chatbot-message ${m.role}`}>
            {m.content}
          </div>
        ))}
        {loading && <div className="chatbot-message assistant">Typing...</div>}
      </div>

      <div className="chatbot-input">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type your message…"
          onKeyDown={(e) => {
            if (e.key === "Enter") sendMessage();
          }}
        />
        <button type="button" onClick={sendMessage} disabled={loading}>
          Send
        </button>
      </div>
    </div>
  );
};

export default ChatBot;
