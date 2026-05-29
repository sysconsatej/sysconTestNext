import React from "react";
import {
  Avatar,
  IconButton,
  SearchIcon,
  DotsVertical,
  VideoIcon,
  OnlineDot,
} from "../ChatIcons/ChatIcons";
import PropTypes from "prop-types";


export const ChatHeader = ({ contact }) => (
  <div className="px-5 py-3 flex items-center gap-3 bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800">
    <Avatar
      initials={contact?.initials}
      colorClass={contact?.colorClass}
      size="md"
    />
    <div className="flex-1 min-w-0">
      <p className="text-sm font-semibold text-gray-900 dark:text-white flex items-center gap-1.5">
        {contact?.name}
        {contact?.isGroup && (
          <span className="text-[10px] bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300 px-1.5 py-0.5 rounded font-medium">
            group
          </span>
        )}
      </p>
      <p className="text-[12px] text-emerald-600 dark:text-emerald-400 flex items-center">
        {contact?.status === "online" && <OnlineDot />}
        {contact?.lastSeen}
      </p>
    </div>
    <div className="flex gap-0.5">
      <IconButton title="Search">
        <SearchIcon />
      </IconButton>
      <IconButton title="Video call">
        <VideoIcon />
      </IconButton>
      <IconButton title="More">
        <DotsVertical />
      </IconButton>
    </div>
  </div>
);



ChatHeader.propTypes = {
  contact: PropTypes.any.isRequired,
};