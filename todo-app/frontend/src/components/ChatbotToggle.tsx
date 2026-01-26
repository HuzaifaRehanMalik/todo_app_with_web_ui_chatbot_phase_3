"use client";

import React from "react";

type ChatbotToggleProps = {
  isOpen: boolean;
  onToggle: (isOpen: boolean) => void;
};

export default function ChatbotToggle({ isOpen, onToggle }: ChatbotToggleProps) {
  return (
    <button
      type="button"
      onClick={() => onToggle(!isOpen)}
      aria-label={isOpen ? "Close chatbot" : "Open chatbot"}
      className={[
        "fixed bottom-5 left-5 z-[1000] h-14 w-14 rounded-full",
        "flex items-center justify-center shadow-lg",
        "transition duration-300 ease-in-out transform hover:scale-105",
        isOpen ? "bg-red-500 hover:bg-red-600" : "bg-blue-500 hover:bg-blue-600",
      ].join(" ")}
    >
      {isOpen ? (
        <div className="relative h-6 w-6">
          <span className="absolute left-1/2 top-1/2 h-[2px] w-5 -translate-x-1/2 -translate-y-1/2 rotate-45 bg-white rounded" />
          <span className="absolute left-1/2 top-1/2 h-[2px] w-5 -translate-x-1/2 -translate-y-1/2 -rotate-45 bg-white rounded" />
        </div>
      ) : (
        <svg className="h-6 w-6 text-white" viewBox="0 0 24 24" fill="none">
          <path
            d="M12 3C7.03 3 3 6.58 3 11c0 2.15.96 4.1 2.52 5.57L5 21l4.64-2.02c.75.2 1.54.32 2.36.32 4.97 0 9-3.58 9-8s-4.03-8-9-8Z"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinejoin="round"
          />
        </svg>
      )}
    </button>
  );
}
