"use client";

import React, { useState } from "react";
import ChatbotToggle from "./ChatbotToggle";
import ChatWindow from "./ChatWindow";
import "./ChatbotInterface.css";

type ChatbotInterfaceProps = {
  onTodoUpdate?: (todos: any[]) => void; // replace any[] with Todo[] later
};

const ChatbotInterface: React.FC<ChatbotInterfaceProps> = ({ onTodoUpdate }) => {
  const [isChatOpen, setIsChatOpen] = useState(false);

  const handleToggle = (isOpen: boolean) => {
    setIsChatOpen(isOpen);
  };

  const handleClose = () => {
    setIsChatOpen(false);
  };

  return (
    <div className="chatbot-interface">
      <ChatbotToggle isOpen={isChatOpen} onToggle={handleToggle} />
      <ChatWindow isOpen={isChatOpen} onClose={handleClose} onTodoUpdate={onTodoUpdate ?? (() => {})} />
    </div>
  );
};

export default ChatbotInterface;
