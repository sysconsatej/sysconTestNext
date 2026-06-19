/* eslint-disable react/prop-types */

import React from "react";
import { Avatar, fmtT, previewText } from "./ChatUtils";

export function ChatSidebar({
  me,
  users,
  onlineIds,
  unread,
  lastMsgInfo,
  activePeerKey,
  filterStr,
  peerTyping,
  dmTyping,
  onOpenChat,
  onFilterChange,
}) {
  const filteredUsers = users
    .filter((u) => u.id !== me?.id)
    .filter(
      (u) =>
        !filterStr || u.name.toLowerCase().includes(filterStr.toLowerCase()),
    );

  const groupTypingText = users
    .filter((u) => u.id !== me?.id && peerTyping[u.id])
    .map((u) => u.name)
    .join(", ");

  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <div
          className="you-avatar"
          style={{ background: me?.color, cursor: "default" }}
        >
          {me ? me.name.charAt(0) : "?"}
          {me ? (
            <div
              className="av-ring"
              style={{ display: "block", borderColor: "var(--header)" }}
            />
          ) : null}
        </div>
        <div>
          <div className="you-name">{me ? me.name : "Not logged in"}</div>
          <div className="you-status">{me ? "online" : ""}</div>
        </div>
        <div className="sidebar-icons">
          {/* <button className="icon-btn" type="button">
            💬
          </button>
          <button className="icon-btn" type="button">
            ⋮
          </button> */}
        </div>
      </div>

      <div className="sidebar-search">
        <div className="search-wrap">
          <span style={{ color: "var(--muted)", fontSize: 14 }}>🔍</span>
          <input
            type="text"
            placeholder="Search or start new chat"
            value={filterStr}
            onChange={(e) => onFilterChange(e.target.value)}
          />
        </div>
      </div>

      <div className="user-list">
        {!filterStr || "group general".includes(filterStr.toLowerCase()) ? (
          <div
            className={`user-item${activePeerKey === "group" ? " active" : ""}`}
            onClick={() => onOpenChat("group")}
          >
            <Avatar user={{ color: "#1f6e5e", name: "G" }} online>
              👥
            </Avatar>
            <div className="user-info">
              <div className="user-info-top">
                <span className="ui-name">Group · general</span>
                <span className={`ui-time${unread.group ? " unread-t" : ""}`}>
                  {lastMsgInfo.group ? fmtT(lastMsgInfo.group.time) : ""}
                </span>
              </div>
              <div className="user-info-bot">
                <span className="ui-preview">
                  {groupTypingText && activePeerKey !== "group"
                    ? `${groupTypingText} typing...`
                    : lastMsgInfo.group
                      ? previewText(lastMsgInfo.group)
                      : "10 members"}
                </span>
                <span className={`badge${unread.group ? " show" : ""}`}>
                  {unread.group || ""}
                </span>
              </div>
            </div>
          </div>
        ) : null}

        {filteredUsers.map((u) => {
          const active = activePeerKey === u.id;
          const lm = lastMsgInfo[u.id];
          return (
            <div
              className={`user-item${active ? " active" : ""}`}
              key={u.id}
              onClick={() => onOpenChat(u.id)}
            >
              <Avatar user={u} online={onlineIds.has(u.id)} />
              <div className="user-info">
                <div className="user-info-top">
                  <span className="ui-name">{u.name}</span>
                  <span className={`ui-time${unread[u.id] ? " unread-t" : ""}`}>
                    {lm ? fmtT(lm.time) : ""}
                  </span>
                </div>
                <div className="user-info-bot">
                  <span className="ui-preview">
                    {dmTyping[u.id]
                      ? "typing..."
                      : lm
                        ? previewText(lm)
                        : onlineIds.has(u.id)
                          ? "online"
                          : "last seen recently"}
                  </span>
                  <span className={`badge${unread[u.id] ? " show" : ""}`}>
                    {unread[u.id] || ""}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
