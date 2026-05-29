import PropTypes from "prop-types";
import React, { useState } from "react";
import { EmojiIcon, AttachIcon, SendIcon } from "../ChatIcons/ChatIcons";

export const MessageInput = ({ onSend }) => {
  const [value, setValue] = useState("");

  const handleSend = () => {
    const trimmed = value.trim();
    if (!trimmed) return;
    onSend(trimmed);
    setValue("");
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="px-4 py-3 flex items-center gap-2.5 bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800">
      <button className="chat-message  text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
        <EmojiIcon />
      </button>
      <button className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
        <AttachIcon />
      </button>
      <input
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Type a message"
        className="flex-1 bg-gray-100 dark:bg-gray-800 border-none rounded-full px-4 py-2 text-[13.5px] text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 outline-none"
      />
      <button
        onClick={handleSend}
        className="chat-message  w-9 h-9 rounded-full bg-emerald-500 hover:bg-emerald-600 flex items-center justify-center transition-colors flex-shrink-0 active:scale-95"
      >
        <SendIcon />
      </button>
    </div>
  );
};

MessageInput.propTypes = {
  onSend: PropTypes.func.isRequired,
};
