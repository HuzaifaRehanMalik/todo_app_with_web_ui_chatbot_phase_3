/**
 * Chatbot Toggle Component
 * Fixed button in the bottom-left corner to toggle the chatbot panel
 */

import React, { useState } from 'react';
import './ChatbotToggle.css';

const ChatbotToggle = ({ onToggle }) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleClick = () => {
    const newState = !isOpen;
    setIsOpen(newState);
    if (onToggle) {
      onToggle(newState);
    }
  };

  return (
    <button
      className={`chatbot-toggle ${isOpen ? 'open' : ''}`}
      onClick={handleClick}
      aria-label={isOpen ? 'Close chatbot' : 'Open chatbot'}
      title={isOpen ? 'Close chatbot' : 'Open chatbot'}
    >
      <div className="chatbot-icon">
        {isOpen ? (
          // Close icon (X)
          <>
            <span className="line line-1"></span>
            <span className="line line-2"></span>
          </>
        ) : (
          // Chat bubble icon
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M21 15C21 15.5304 20.7893 16.0391 20.4142 16.4142C20.0391 16.7893 19.5304 17 19 17H17L14 20V17H5C4.46957 17 3.96086 16.7893 3.58579 16.4142C3.21071 16.0391 3 15.5304 3 15V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H19C19.5304 3 20.0391 3.21071 20.4142 3.58579C20.7893 3.96086 21 4.46957 21 5V15Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        )}
      </div>
    </button>
  );
};

export default ChatbotToggle;