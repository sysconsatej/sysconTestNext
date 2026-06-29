"use client";
import React, { useEffect, useMemo, useRef, useState } from "react";
import PropTypes from "prop-types";
import "./ChatApp.css";
//hooks start
import { useChatSocket } from "./useChatSocket";
import { useCall } from "./useCall";
import { useFileUpload } from "./useFileUpload";
import { useMention } from "./useMention";
import { useReactions } from "./useReaction";

// fetch all the user from the api
import { useUsers } from "./useUsers";

// components
import { TopBar } from "./TopBar";
import { ChatSidebar } from "./ChatSideBar";
import { ChatArea } from "./ChatArea";
import { CallScreen } from "./CallScreen";
import { getUserDetails } from "@/helper/userDetails";

export default function ChatApp({
  socketUrl,
  ioFactory,
  socketFactory,
  destroySocket,
  apiBase = "",
  closeWindow,
}) {
  // ── User roster from API ────────────────────────────────────────────
  const userDetails = getUserDetails();
  const {
    users,
    loading: usersLoading,
    error: usersError,
    inActiveUsers,
  } = useUsers();
  console.log(users, "users");
  const me = users?.find((u) => u.id === userDetails?.userId) || null;

  const [activePeerKey, setActivePeerKey] = useState(null);
  const [filterStr, setFilterStr] = useState("");
  const [draft, setDraft] = useState("");
  const [replyingTo, setReplyingTo] = useState(null);
  const [notif, setNotif] = useState({
    label: "Enable Notifications",
    className: "notif-btn",
    disabled: false,
    icon: "🔔",
  });
  const [isActive, setIsactive] = useState(true);

  const inputRef = useRef(null);

  // ── Derived active peer ──────────────────────────────────────────────────
  const activePeer = useMemo(() => {
    if (activePeerKey === "group") return "group";
    return users.find((u) => u.id === activePeerKey) || null;
  }, [activePeerKey, users]);

  // ── Hooks ────────────────────────────────────────────────────────────────
  const { reactions, toggleReaction } = useReactions();

  // socketRef is wired below after useChatSocket initialises it

  const chat = useChatSocket({
    socketUrl,
    ioFactory,
    socketFactory,
    destroySocket,
    users,
  });
  const call = useCall({ socketRef: chat.socketRef, users, me });
  chat.setWireCallEvents(call.wireCallEvents);

  // Patch call's socketRef to use chat's socketRef
  // call.socketRef = chat.socketRef;

  // Keep chat's activePeerKeyRef in sync
  useEffect(() => {
    chat.syncActivePeerKey(activePeerKey);
  }, [activePeerKey]);

  const { fileInputRef, uploadToast, uploadProgress, onFileChosen } =
    useFileUpload({
      apiBase,
      me,
      activePeer,
      socketRef: chat.socketRef,
    });

  const {
    mention,
    mentionCandidates,
    detectMention,
    pickMention,
    handleMentionKeyDown,
    clearMention,
  } = useMention({ users, me, activePeer, inputRef, draft, setDraft });

  // ── Notifications
  useEffect(() => {
    fetch(`${apiBase}/api/health`)
      .then(() => {}) // serverStatus is managed in useChatSocket
      .catch(() => {});
  }, [apiBase]);

  useEffect(() => {
    if (!("Notification" in window)) {
      setNotif((n) => ({
        ...n,
        label: "Not supported",
        disabled: true,
        icon: "🚫",
      }));
      return;
    }
    if (Notification.permission === "granted")
      setNotif({
        label: "Notifications on",
        className: "notif-btn granted",
        disabled: true,
        icon: "🔔",
      });
    if (Notification.permission === "denied")
      setNotif({
        label: "Blocked",
        className: "notif-btn denied",
        disabled: true,
        icon: "🔕",
      });
  }, []);

  // ── Auto-connect once user is resolved
  useEffect(() => {
    if (!me) return;
    chat.connectSocket(me);
    return () => {
      chat.disconnectSocket();
      call.cleanupCall();
    };
  }, [me?.id]);

  async function requestNotifications() {
    if (!("Notification" in window)) return;
    const permission = await Notification.requestPermission();
    if (permission === "granted")
      setNotif({
        label: "Notifications on",
        className: "notif-btn granted",
        disabled: true,
        icon: "🔔",
      });
    if (permission === "denied")
      setNotif({
        label: "Blocked",
        className: "notif-btn denied",
        disabled: true,
        icon: "🔕",
      });
  }

  const checkIsActiveOrNot = () => {
    setIsactive((prev) => !prev);
  };

  // ── Open chat ────────────────────────────────────────────────────────────
  function openChat(key) {
    if (!me) return;
    setActivePeerKey(key);
    chat.markRead(key);
    if (key !== "group") chat.getDmHistory(key);
  }

  // ── Messaging ────────────────────────────────────────────────────────────
  function handleSend() {
    if (!me || !activePeer || !draft.trim()) return;
    chat.sendMessage({ activePeer, draft, replyingTo });
    setDraft("");
    setReplyingTo(null);
    clearMention();
  }

  function handleDraftChange(e) {
    const value = e.target.value;
    setDraft(value);
    chat.emitTyping(activePeer);
    detectMention(value, e.target.selectionStart);
  }

  function handleKeyDown(e) {
    if (mention.show) {
      const handled = handleMentionKeyDown(e, mentionCandidates);
      if (handled) return;
    }
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  function beginReply(msg) {
    setReplyingTo({
      id: msg.id,
      senderId: msg.senderId,
      senderName: msg.senderName,
      content: msg.content,
      type: msg.type,
    });
    inputRef.current?.focus();
  }

  // ── Typing text ──────────────────────────────────────────────────────────
  const typingText =
    activePeer === "group"
      ? users
          .filter((u) => u.id !== me?.id && chat.peerTyping[u.id])
          .map((u) => u.name)
          .join(", ")
      : activePeer && chat.dmTyping[activePeer?.id]
        ? `${activePeer.name} is typing`
        : "";

  const activeMessages =
    activePeer === "group"
      ? chat.groupMessages
      : chat.dmMessages[activePeer?.id] || [];

  if (usersLoading) {
    return (
      <div
        className="chat-app-shell"
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          height: "80vh",
          color: "var(--muted)",
        }}
      >
        Loading…
      </div>
    );
  }

  if (usersError) {
    return (
      <div
        className="chat-app-shell"
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          height: "80vh",
          color: "var(--muted)",
        }}
      >
        Could not load users: {usersError}
      </div>
    );
  }

  return (
    <div className="chat-app-shell">
      <TopBar
        serverOnline={chat.serverOnline}
        serverStatus={chat.serverStatus}
        notif={notif}
        onRequestNotifications={requestNotifications}
        closeWindow={closeWindow}
        checkIsActiveOrNot={checkIsActiveOrNot}
        isActive={isActive}
      />

      <div className="app">
        <ChatSidebar
          me={me}
          users={isActive ? users : inActiveUsers}
          onlineIds={chat.onlineIds}
          unread={chat.unread}
          lastMsgInfo={chat.lastMsgInfo}
          activePeerKey={activePeerKey}
          filterStr={filterStr}
          // peerTyping={chat.peerTyping}
          dmTyping={chat.dmTyping}
          onOpenChat={openChat}
          onFilterChange={setFilterStr}
          isActive={isActive}
        />

        <ChatArea
          me={me}
          activePeer={activePeer}
          onlineIds={chat.onlineIds}
          activeMessages={activeMessages}
          users={users}
          reactions={reactions}
          onReact={(msgId, emoji) => toggleReaction(msgId, emoji, me?.id)}
          onReply={beginReply}
          typingText={typingText}
          replyingTo={replyingTo}
          onCancelReply={() => setReplyingTo(null)}
          draft={draft}
          onDraftChange={handleDraftChange}
          onKeyDown={handleKeyDown}
          onSendMsg={handleSend}
          onAttachClick={() => fileInputRef.current?.click()}
          fileInputRef={fileInputRef}
          onFileChosen={onFileChosen}
          uploadProgress={uploadProgress}
          mention={mention}
          mentionCandidates={mentionCandidates}
          onPickMention={pickMention}
          onStartCall={call.startCall}
        />
      </div>

      <div className={`upload-toast${uploadToast ? " show" : ""}`}>
        {uploadToast}
      </div>

      <CallScreen
        callState={call.callState}
        callToast={call.callToast}
        remoteVideoRef={call.remoteVideoRef}
        localVideoRef={call.localVideoRef}
        onAccept={call.acceptCall}
        onReject={call.rejectCall}
        onHangUp={call.hangUp}
        onToggleMute={call.toggleMute}
        onToggleCam={call.toggleCam}
      />
    </div>
  );
}

ChatApp.propTypes = {
  socketUrl: PropTypes.string,
  ioFactory: PropTypes.func,
  socketFactory: PropTypes.func,
  destroySocket: PropTypes.any,
  apiBase: PropTypes.string,
  closeWindow: PropTypes.func,
};
