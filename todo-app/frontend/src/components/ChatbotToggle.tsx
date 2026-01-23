"use client";

import React from "react";
import "./ChatbotToggle.css";

type ChatbotToggleProps = {
  isOpen: boolean;
  onToggle: (isOpen: boolean) => void;
};

export default function ChatbotToggle({ isOpen, onToggle }: ChatbotToggleProps) {
  return (
    <button
      type="button"
      className={`chatbot-toggle ${isOpen ? "open" : ""}`}
      onClick={() => onToggle(!isOpen)}
      aria-label={isOpen ? "Close chatbot" : "Open chatbot"}
    >
      <span className="chatbot-icon">
        {isOpen ? (
          <>
            <span className="line line-1" />
            <span className="line line-2" />
          </>
        ) : (
          <svg viewBox="0 0 24 24" fill="none">
            <path
              d="M12 3C7.03 3 3 6.58 3 11c0 2.15.96 4.1 2.52 5.57L5 21l4.64-2.02c.75.2 1.54.32 2.36.32 4.97 0 9-3.58 9-8s-4.03-8-9-8Z"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinejoin="round"
            />
          </svg>
        )}
      </span>
    </button>
  );
}
