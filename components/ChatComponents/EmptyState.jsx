import React from "react";

export const EmptyState = () => (
  <div className="flex-1 flex flex-col items-center justify-center gap-3 bg-gray-50 dark:bg-gray-950 text-gray-400">
    <div className="w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
      <svg width="28" height="28" fill="none" viewBox="0 0 24 24">
        <path
          d="M21 14a7 7 0 0 1-7 7H3l3.5-3.5A7 7 0 1 1 21 7v7Z"
          stroke="currentColor"
          strokeWidth="1.7"
          strokeLinejoin="round"
        />
      </svg>
    </div>
    <p className="text-sm text-gray-400 dark:text-gray-500">
      Select a chat to start messaging
    </p>
  </div>
);
