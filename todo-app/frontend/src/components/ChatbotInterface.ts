/**
 * Chatbot Interface Component
 * Main component that manages the chatbot toggle and window
 */

import React, { useState } from 'react';
import ChatbotToggle from './ChatbotToggle';
import ChatWindow from './ChatWindow';
import apiService from '../services/api.service';
import './ChatbotInterface.css';

const ChatbotInterface = ({ onTodoUpdate }) => {
  const [isChatOpen, setIsChatOpen] = useState(false);

  const handleToggle = (isOpen) => {
    setIsChatOpen(isOpen);
  };

  const handleClose = () => {
    setIsChatOpen(false);
  };

  return (
    <div className="chatbot-interface">
      <ChatbotToggle onToggle={handleToggle} />
      <ChatWindow isOpen={isChatOpen} onClose={handleClose} onTodoUpdate={onTodoUpdate} />
    </div>
  );
};

export default ChatbotInterface;