import React from "react";
import PropTypes from "prop-types";
import { ChatHeader } from "./ChatHeader";
import { MessagesArea } from "./MessagesArea";
import { MessageInput } from "./MessageInput";
import { EmptyState } from "./EmptyState";

export const ChatWindow = ({ contact, onSend }) => {
  if (!contact) return <EmptyState />;
  return (
    <div className="flex-1 flex flex-col min-w-0">
      <ChatHeader contact={contact} />
      <MessagesArea messages={contact.messages} />
      <MessageInput onSend={onSend} />
    </div>
  );
};

ChatWindow.propTypes = {
  contact: PropTypes.any,
  onSend: PropTypes.func.isRequired,
};
