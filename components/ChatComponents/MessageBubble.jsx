import React from "react";
import { DoubleCheckIcon } from "../ChatIcons/ChatIcons";
import PropTypes from "prop-types";

export const MessageBubble = ({ message }) => {
  const isSent = message?.from === "me";
  return (
    <div className={`flex mb-0.5 ${isSent ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-[68%] px-3 py-2 rounded-xl relative bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 border border-gray-100 dark:border-gray-700 rounded-bl-sm`}
      >
        <p className="text-[13.5px] leading-relaxed break-words  text-black ">
          {message?.text}
        </p>
        <div className="flex items-center justify-end gap-1 mt-1">
          <span
            className={`text-[10px] ${isSent ? "text-emerald-600 dark:text-emerald-400" : "text-gray-400"}`}
          >
            {message?.time}
          </span>
          {isSent && <DoubleCheckIcon />}
        </div>
      </div>
    </div>
  );
};

MessageBubble.propTypes = {
  message: PropTypes.any.isRequired,
};
