import React, { useMemo, useState } from "react";

type Message = {
  id: number;
  text: string;
  sender: "user" | "bot" | "error";
};

type ChatWindowProps = {
  isOpen: boolean;
  onClose: () => void;
  onTodoUpdate: (todos: any[]) => void;
};

const ChatWindow = ({ isOpen, onClose }: ChatWindowProps) => {
  const [messages, setMessages] = useState<Message[]>([
    { id: 1, text: "Hi! How can I help you today?", sender: "bot" },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const apiBase = useMemo(() => {
    // If you already have env var, use it:
    // return process.env.NEXT_PUBLIC_API_BASE_URL ?? "";
    return ""; // same-origin default
  }, []);

  if (!isOpen) return null;

  const getToken = () => {
    // IMPORTANT: store access_token in localStorage after login/signin
    return localStorage.getItem("access_token");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const text = input.trim();
    if (!text || loading) return;

    const userMsg: Message = { id: Date.now(), text, sender: "user" };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const token = getToken();
      if (!token) {
        setMessages((prev) => [
          ...prev,
          {
            id: Date.now() + 1,
            text: "You are not logged in. Please login again to use the chatbot.",
            sender: "error",
          },
        ]);
        setLoading(false);
        return;
      }

      const res = await fetch(`${apiBase}/api/v1/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`, // ✅ required by backend auth :contentReference[oaicite:2]{index=2}
        },
        body: JSON.stringify({ message: text }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err?.detail || `Request failed (${res.status})`);
      }

      const data = await res.json();
      const botText = data?.response ?? "No response";

      setMessages((prev) => [
        ...prev,
        { id: Date.now() + 2, text: botText, sender: "bot" },
      ]);
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 3,
          text: err?.message || "Something went wrong.",
          sender: "error",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className={[
        "fixed left-5 bottom-[90px] z-[999]",
        "w-[350px] h-[500px] rounded-xl overflow-hidden",
        "bg-slate-50 shadow-2xl flex flex-col",
        "transition-all duration-300 ease-in-out",
        "opacity-100 translate-y-0",
      ].join(" ")}
    >
      {/* Header */}
      <div className="bg-blue-500 text-white px-4 py-4 flex items-center justify-between">
        <h3 className="text-sm font-semibold">Chat Assistant</h3>
        <button
          onClick={onClose}
          className="p-1 rounded hover:bg-white/10 transition"
          aria-label="Close"
        >
          ✕
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 p-4 overflow-y-auto flex flex-col gap-3 bg-black">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={[
              "max-w-[80%] px-3 py-2 rounded-2xl text-sm leading-snug",
              "animate-[fadeIn_0.3s_ease]",
              msg.sender === "user"
                ? "self-end bg-blue-500 text-black rounded-br-md"
                : msg.sender === "bot"
                ? "self-start bg-indigo-50 text-blue-500 rounded-bl-md"
                : "self-start bg-red-100 text-red-600",
            ].join(" ")}
          >
            {msg.text}
          </div>
        ))}

        {loading && (
          <div className="self-start bg-indigo-50 text-blue-500 px-3 py-2 rounded-2xl text-sm">
            Typing...
          </div>
        )}
      </div>

      {/* Input */}
      <form onSubmit={handleSubmit} className="flex gap-2 p-3 bg-white border-t">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type a message..."
          className="flex-1 px-4 py-2 border rounded-full outline-none text-sm focus:border-blue-500"
        />
        <button
          type="submit"
          disabled={loading}
          className={[
            "h-10 w-10 rounded-full flex items-center justify-center",
            loading
              ? "bg-gray-300 cursor-not-allowed"
              : "bg-indigo-600 hover:bg-indigo-700 text-white",
            "transition",
          ].join(" ")}
        >
          ➤
        </button>
      </form>

      {/* Tailwind keyframes (needs to be in global css normally; keeping tiny inline workaround) */}
      <style jsx global>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
};

export default ChatWindow;
