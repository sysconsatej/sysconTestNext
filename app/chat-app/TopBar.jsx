/* eslint-disable react/prop-types */
import React from "react";

export function TopBar({
  serverOnline,
  serverStatus,
  notif,
  onRequestNotifications,
}) {
  return (
    <div className="topbar">
      <span className="topbar-logo">ChatApp</span>
      <div className="topbar-right">
        <button
          className={notif.className}
          disabled={notif.disabled}
          onClick={onRequestNotifications}
          type="button"
        >
          <span>{notif.icon}</span>
          <span>{notif.label}</span>
        </button>
        <div className={`srv-dot${serverOnline ? " on" : ""}`} />
        <span className="srv-label">{serverStatus}</span>
      </div>
    </div>
  );
}
