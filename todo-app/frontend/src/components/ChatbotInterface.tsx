"use client";

import React, { useState } from "react";
import ChatbotToggle from "./ChatbotToggle";
import ChatWindow from "./ChatWindow";

type ChatbotInterfaceProps = {
  onTodoUpdate?: (todos: any[]) => void;
};

const ChatbotInterface: React.FC<ChatbotInterfaceProps> = ({ onTodoUpdate }) => {
  const [isChatOpen, setIsChatOpen] = useState(false);

  return (
    <div className="relative z-[1000]">
      <ChatbotToggle isOpen={isChatOpen} onToggle={setIsChatOpen} />
      <ChatWindow
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
        onTodoUpdate={onTodoUpdate ?? (() => {})}
      />
    </div>
  );
};

export default ChatbotInterface;
