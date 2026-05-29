import React from "react";
import { Avatar, MuteIcon, UnreadBadge } from "../ChatIcons/ChatIcons";
import { getLastMsg, getLastTime } from "@/helper";
import PropTypes from "prop-types";


export const ChatListItem = ({ contact, isActive, onClick }) => (
  <div
    onClick={onClick}
    className={`flex items-center gap-3 px-4 py-2.5 cursor-pointer border-b border-gray-50 dark:border-gray-800 transition-colors relative ${
      isActive
        ? "bg-gray-100 dark:bg-gray-800"
        : "hover:bg-gray-50 dark:hover:bg-gray-800/50"
    }`}
  >
    {isActive && (
      <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-emerald-500 rounded-r" />
    )}
    <Avatar
      initials={contact.initials}
      colorClass={contact.colorClass}
      size="lg"
    />
    <div className="flex-1 min-w-0">
      <div className="flex items-baseline justify-between mb-0.5">
        <span className="text-[13.5px] font-medium text-gray-900 dark:text-white truncate max-w-[150px] flex items-center gap-1">
          {contact.name}
          {contact.isGroup && (
            <span className="text-[9px] bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300 px-1 py-0.5 rounded font-semibold leading-none">
              group
            </span>
          )}
        </span>
        <span className="text-[10.5px] text-gray-400 dark:text-gray-500 flex-shrink-0 ml-1">
          {getLastTime(contact)}
        </span>
      </div>
      <div className="flex items-center justify-between gap-1">
        <span className="text-[12px] text-gray-400 dark:text-gray-500 truncate flex items-center gap-1">
          {contact.muted && (
            <span className="text-gray-400">
              <MuteIcon />
            </span>
          )}
          {getLastMsg(contact)}
        </span>
        {contact.unread > 0 && <UnreadBadge count={contact.unread} />}
      </div>
    </div>
  </div>
);



ChatListItem.propTypes = {
  contact: PropTypes.any.isRequired,
  isActive: PropTypes.bool,
  onClick: PropTypes.func,
};