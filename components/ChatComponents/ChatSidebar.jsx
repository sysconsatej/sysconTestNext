import React from "react";
import {
  EditIcon,
  DotsVertical,
  SearchIcon,
  Avatar,
  IconButton,
} from "../ChatIcons/ChatIcons";
import PropTypes from "prop-types";
import { ChatListItem } from "./ChatListItem";



export const ChatSidebar = ({
  contacts,
  activeId,
  onSelect,
  search,
  onSearchChange,
}) => (
  <div className=" w-[320px] flex flex-col border-r border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 flex-shrink-0">
    {/* Top bar */}
    <div className="px-4 py-3 flex items-center justify-between border-b border-gray-100 dark:border-gray-800">
      <Avatar
        initials="ME"
        colorClass="bg-violet-100 text-violet-800"
        size="sm"
      />
      <div className="flex gap-1">
        <IconButton title="New chat">
          <EditIcon />
        </IconButton>
        <IconButton title="Menu">
          <DotsVertical />
        </IconButton>
      </div>
    </div>

    {/* Search */}
    <div className="px-3 py-2 border-b border-gray-50 dark:border-gray-800">
      <div className="flex items-center gap-2 bg-gray-100 dark:bg-gray-800 rounded-full px-3 py-1.5">
        <span className="text-gray-400 chat-message ">
          <SearchIcon />
        </span>
        <input
          type="text"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search or start a chat"
          className="flex-1 bg-transparent text-[13px] text-gray-800 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 outline-none"
        />
      </div>
    </div>

    {/* Chat list */}
    <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-200 dark:scrollbar-thumb-gray-700">
      {contacts
        .filter((c) => c.name.toLowerCase().includes(search.toLowerCase()))
        .map((contact) => (
          <ChatListItem
            key={contact.id}
            contact={contact}
            isActive={contact.id === activeId}
            onClick={() => onSelect(contact.id)}
          />
        ))}
    </div>
  </div>
);


ChatSidebar.propTypes = {
  contacts: PropTypes.array.isRequired,
  activeId: PropTypes.number,
  onSelect: PropTypes.func.isRequired,
  search: PropTypes.string,
  onSearchChange: PropTypes.func.isRequired,
};