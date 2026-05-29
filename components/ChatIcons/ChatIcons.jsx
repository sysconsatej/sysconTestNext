import PropTypes from "prop-types";
import React from "react";

export const SearchIcon = () => (
  <svg width="16" height="16" fill="none" viewBox="0 0 24 24">
    <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="1.8" />
    <path
      d="m16.5 16.5 4 4"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
    />
  </svg>
);

export const VideoIcon = () => (
  <svg width="16" height="16" fill="none" viewBox="0 0 24 24">
    <rect
      x="2"
      y="6"
      width="14"
      height="12"
      rx="2"
      stroke="currentColor"
      strokeWidth="1.8"
    />
    <path
      d="m16 9 6-3v12l-6-3V9Z"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinejoin="round"
    />
  </svg>
);

export const DotsVertical = () => (
  <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24">
    <circle cx="12" cy="5" r="1.5" />
    <circle cx="12" cy="12" r="1.5" />
    <circle cx="12" cy="19" r="1.5" />
  </svg>
);

export const EditIcon = () => (
  <svg width="16" height="16" fill="none" viewBox="0 0 24 24">
    <path
      d="M21 14a7 7 0 0 1-7 7H3l3.5-3.5A7 7 0 0 1 3 12a7 7 0 0 1 7-7h4"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
    />
    <path
      d="M18 3v6M15 6h6"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
    />
  </svg>
);

export const EmojiIcon = () => (
  <svg width="20" height="20" fill="none" viewBox="0 0 24 24">
    <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.7" />
    <path
      d="M8.5 14.5s1 1.5 3.5 1.5 3.5-1.5 3.5-1.5"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
    />
    <circle cx="9" cy="10" r="1" fill="currentColor" />
    <circle cx="15" cy="10" r="1" fill="currentColor" />
  </svg>
);

export const AttachIcon = () => (
  <svg width="20" height="20" fill="none" viewBox="0 0 24 24">
    <path
      d="M21.44 11.05 12.25 20.24a5 5 0 0 1-7.07-7.07l9.19-9.19a3 3 0 0 1 4.24 4.24l-8.49 8.48a1 1 0 1 1-1.41-1.41l7.07-7.07"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
    />
  </svg>
);

export const SendIcon = () => (
  <svg width="100" height="100" fill="none" viewBox="0 0 24 24">
    <path
      d="M22 2 11 13"
      stroke="#000000"
      strokeWidth="2"
      strokeLinecap="round"
    />
    <path
      d="m22 2-7 20-4-9-9-4 20-7Z"
      stroke="white"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export const DoubleCheckIcon = () => (
  <svg width="16" height="11" fill="none" viewBox="0 0 16 11">
    <path
      d="M1 5.5 5 9.5 11 2"
      stroke="#34D399"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M5 9.5 11 2"
      stroke="#34D399"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      opacity="0.5"
      transform="translate(3,0)"
    />
  </svg>
);

export const MuteIcon = () => (
  <svg width="12" height="12" fill="none" viewBox="0 0 24 24">
    <path
      d="M11 5 6 9H2v6h4l5 4V5Z"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinejoin="round"
    />
    <path
      d="M17 7s2 2 2 5-2 5-2 5M3 3l18 18"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
    />
  </svg>
);

// ─── Avatar ──────────────────────────────────────────────────────────────────

export const Avatar = ({ initials, colorClass, size = "md" }) => {
  const sizeMap = {
    sm: "w-8 h-8 text-xs",
    md: "w-10 h-10 text-sm",
    lg: "w-11 h-11 text-sm",
  };
  return (
    <div
      className={`${sizeMap[size]} ${colorClass} rounded-full flex items-center justify-center font-semibold flex-shrink-0`}
    >
      {initials}
    </div>
  );
};

// ─── IconButton ──────────────────────────────────────────────────────────────

export const IconButton = ({ children, title, onClick }) => (
  <button
    title={title}
    onClick={onClick}
    className="chat-message w-8 h-8 rounded-full flex items-center justify-center text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 dark:text-gray-400 transition-colors"
  >
    {children}
  </button>
);

// ─── UnreadBadge ─────────────────────────────────────────────────────────────

export const UnreadBadge = ({ count }) => (
  <span className="min-w-[18px] h-[18px] bg-emerald-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1 flex-shrink-0">
    {count}
  </span>
);

// ─── OnlineDot ───────────────────────────────────────────────────────────────

export const OnlineDot = () => (
  <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 mr-1" />
);

// ─── DateDivider ─────────────────────────────────────────────────────────────

export const DateDivider = ({ label }) => (
  <div className="flex justify-center my-3">
    <span className="bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 text-[11px] px-3 py-1 rounded-full">
      {label}
    </span>
  </div>
);

//  propTypes for all components
DateDivider.propTypes = {
  label: PropTypes.string.isRequired,
};

UnreadBadge.propTypes = {
  count: PropTypes.number.isRequired,
};

IconButton.propTypes = {
  children: PropTypes.node.isRequired,
  title: PropTypes.string,
  onClick: PropTypes.func,
};

Avatar.propTypes = {
  initials: PropTypes.string.isRequired,
  colorClass: PropTypes.string.isRequired,
  size: PropTypes.oneOf(["sm", "md", "lg"]),
};
