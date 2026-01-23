import React, { useState } from "react";
import "./ChatWindow.css";

type Message = {
  id: number;
  text: string;
  sender: "user" | "bot" | "error";
};

type ChatWindowProps = {
  isOpen: boolean;
  onClose: () => void;
  onTodoUpdate: (todos: any[]) => void; // replace `any` later if you have a Todo type
};

const ChatWindow = ({ isOpen, onClose, onTodoUpdate }: ChatWindowProps) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      text: "Hi! How can I help you today?",
      sender: "bot",
    },
  ]);

  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  return (
    <div className={`chat-window open`}>
      <div className="chat-header">
        <h3>Chat Assistant</h3>
        <button className="close-button" onClick={onClose}>
          ✕
        </button>
      </div>

      <div className="chat-messages">
        {messages.map((msg) => (
          <div key={msg.id} className={`message ${msg.sender}`}>
            <div className="message-text">{msg.text}</div>
          </div>
        ))}
      </div>

      <form className="chat-input-form">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type a message..."
        />
        <button type="submit" disabled={loading}>
          ➤
        </button>
      </form>
    </div>
  );
};

export default ChatWindow;
