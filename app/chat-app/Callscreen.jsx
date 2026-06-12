/* eslint-disable react/prop-types */

import React from "react";
export function CallScreen({
  callState,
  callToast,
  remoteVideoRef,
  localVideoRef,
  onAccept,
  onReject,
  onHangUp,
  onToggleMute,
  onToggleCam,
}) {
  return (
    <>
      {/* Incoming call toast */}
      <div className={`call-toast${callToast ? " show" : ""}`}>
        <div className="ct-caller">
          <div
            className="ct-avatar"
            style={{ background: callToast?.color || "#8696a0" }}
          >
            {callToast?.name?.charAt(0) || "?"}
          </div>
          <div className="ct-info">
            <div className="ct-name">{callToast?.name || "Someone"}</div>
            <div className="ct-label">
              <span>●</span> Incoming video call...
            </div>
          </div>
        </div>
        <div className="ct-btns">
          <button className="ct-btn reject" type="button" onClick={onReject}>
            Decline
          </button>
          <button className="ct-btn accept" type="button" onClick={onAccept}>
            Accept
          </button>
        </div>
      </div>

      {/* Active call screen */}
      <div className={`call-screen${callState.show ? " show" : ""}`}>
        <video ref={remoteVideoRef} id="remoteVideo" autoPlay playsInline />
        <video ref={localVideoRef} id="localVideo" autoPlay playsInline muted />
        <div className="call-waiting">
          <div
            className="call-waiting-avatar"
            style={{ background: callState.peer?.color || "#8696a0" }}
          >
            {callState.peer?.name?.charAt(0) || "?"}
          </div>
          <div className="call-waiting-name">{callState.peer?.name || ""}</div>
          <div className="call-waiting-status">{callState.status}</div>
        </div>
        <div className={`call-timer${callState.show ? " show" : ""}`}>
          {Math.floor(callState.timer / 60)}:
          {String(callState.timer % 60).padStart(2, "0")}
        </div>
        <div className="call-controls">
          <button
            className={`cc-btn mute${callState.muted ? " off" : ""}`}
            type="button"
            onClick={onToggleMute}
            title="Mute"
          >
            {callState.muted ? "🔇" : "🎤"}
          </button>
          <button
            className={`cc-btn cam${callState.camOff ? " off" : ""}`}
            type="button"
            onClick={onToggleCam}
            title="Camera"
          >
            {callState.camOff ? "🚫" : "📷"}
          </button>
          <button
            className="cc-btn hangup"
            type="button"
            onClick={onHangUp}
            title="Hang up"
          >
            📵
          </button>
        </div>
      </div>
    </>
  );
}
