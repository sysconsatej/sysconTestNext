import React, { useEffect, useRef } from "react";
import PropTypes from "prop-types";
import { DateDivider } from "../ChatIcons/ChatIcons";
import { MessageBubble } from "./MessageBubble";


export const MessagesArea = ({ messages }) => {
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  let lastDate = null;
  return (
    <div className="flex-1 overflow-y-auto px-5 py-4 bg-gray-50 dark:bg-gray-950 space-y-0.5 scrollbar-thin scrollbar-thumb-gray-200 dark:scrollbar-thumb-gray-700">
      {messages.map((msg) => {
        const showDate = msg.date !== lastDate;
        lastDate = msg.date;
        return (
          <div key={msg.id}>
            {showDate && <DateDivider label={msg.date} />}
            <MessageBubble message={msg} />
          </div>
        );
      })}
      <div ref={bottomRef} />
    </div>
  );
};


MessagesArea.propTypes = {
  messages: PropTypes.array.isRequired,
};
