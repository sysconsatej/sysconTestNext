// "use client";
// /* eslint-disable react/prop-types */
// import React from "react";
// import { Avatar } from "./ChatUtils";
// import { Messages } from "./Messages";

// function EmptyState({ picked }) {
//   return (
//     <div className="empty-state">
//       <svg
//         width="80"
//         height="80"
//         viewBox="0 0 24 24"
//         fill="none"
//         stroke="currentColor"
//         strokeWidth=".8"
//       >
//         <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
//       </svg>
//       <h3>ChatApp Web</h3>
//       <p>
//         {picked
//           ? "Select a conversation to start messaging"
//           : "Pick your identity, then open a chat"}
//       </p>
//     </div>
//   );
// }

// export function ChatArea({
//   me,
//   activePeer,
//   onlineIds,
//   activeMessages,
//   users,
//   reactions,
//   onReact,
//   onReply,
//   typingText,
//   replyingTo,
//   onCancelReply,
//   draft,
//   onDraftChange,
//   onKeyDown,
//   onSendMsg,
//   onAttachClick,
//   fileInputRef,
//   onFileChosen,
//   uploadProgress,
//   mention,
//   mentionCandidates,
//   onPickMention,
//   onStartCall,
// }) {
//   if (!activePeer)
//     return (
//       <div className="chat-area">
//         <EmptyState picked={Boolean(me)} />
//       </div>
//     );

//   return (
//     <div className="chat-area">
//       {/* Header */}
//       <div className="chat-header">
//         <Avatar
//           user={
//             activePeer === "group"
//               ? { color: "#1f6e5e", name: "G" }
//               : activePeer
//           }
//           size={38}
//           online={activePeer === "group" || onlineIds.has(activePeer.id)}
//         >
//           {activePeer === "group" ? "👥" : undefined}
//         </Avatar>
//         <div>
//           <div className="ch-name">
//             {activePeer === "group" ? "Group · general" : activePeer.name}
//           </div>
//           <div className="ch-sub">
//             {activePeer === "group"
//               ? `${onlineIds.size} of 10 online`
//               : onlineIds.has(activePeer.id)
//                 ? "online"
//                 : "last seen recently"}
//           </div>
//         </div>
//         <div className="chat-h-icons">
//           {activePeer !== "group" ? (
//             <button
//               className="call-start-btn"
//               type="button"
//               onClick={() => onStartCall(activePeer.id)}
//               title="Video call"
//             >
//               ▷
//             </button>
//           ) : null}
//           {/* <button className="icon-btn" type="button">
//             🔍
//           </button>
//           <button className="icon-btn" type="button">
//             📎
//           </button>
//           <button className="icon-btn" type="button">
//             ⋮
//           </button> */}
//         </div>
//       </div>

//       {/* Messages */}
//       <Messages
//         messages={activeMessages}
//         me={me}
//         users={users}
//         activePeer={activePeer}
//         reactions={reactions}
//         onReact={onReact}
//         onReply={onReply}
//       />

//       {/* Typing indicator */}
//       <div className="typing-bar">
//         {typingText ? (
//           <>
//             <div className="tdots">
//               <span />
//               <span />
//               <span />
//             </div>
//             <span>
//               {activePeer === "group" ? `${typingText} typing...` : typingText}
//             </span>
//           </>
//         ) : null}
//       </div>

//       {/* Reply preview bar */}
//       <div className={`reply-bar${replyingTo ? " show" : ""}`}>
//         <div className="reply-bar-inner">
//           <div className="reply-bar-sender">
//             {users.find((u) => u.id === replyingTo?.senderId)?.name ||
//               replyingTo?.senderName ||
//               ""}
//           </div>
//           <div className="reply-bar-text">
//             {replyingTo?.type === "file"
//               ? "File"
//               : String(replyingTo?.content || "").slice(0, 80)}
//           </div>
//         </div>
//         <button
//           className="reply-cancel"
//           type="button"
//           onClick={onCancelReply}
//           title="Cancel reply"
//         >
//           ×
//         </button>
//       </div>

//       {/* Input bar */}
//       <div className="input-bar" style={{ position: "relative" }}>
//         <input
//           ref={fileInputRef}
//           type="file"
//           accept=".pdf,.docx,.doc,.xlsx,.xls,.csv"
//           style={{ display: "none" }}
//           onChange={(e) => onFileChosen(e.target.files?.[0])}
//         />
//         <button
//           className="attach-btn"
//           type="button"
//           onClick={onAttachClick}
//           title="Attach document"
//         >
//           📎
//         </button>

//         <div className="input-wrap" style={{ position: "relative" }}>
//           <input
//             type="text"
//             placeholder="Type a message"
//             value={draft}
//             onKeyDown={onKeyDown}
//             onChange={onDraftChange}
//           />
//           <div className={`mention-popup${mention.show ? " show" : ""}`}>
//             {mention.show ? (
//               <>
//                 <div className="mention-header">Mention someone</div>
//                 {mentionCandidates.map((u, i) => (
//                   <div
//                     className={`mention-item${i === mention.index ? " active" : ""}`}
//                     key={u.id}
//                     onMouseDown={() => onPickMention(u.name)}
//                   >
//                     <div className="mention-av" style={{ background: u.color }}>
//                       {u.name.charAt(0)}
//                     </div>
//                     <span className="mention-name">{u.name}</span>
//                   </div>
//                 ))}
//               </>
//             ) : null}
//           </div>
//         </div>

//         <button className="send-btn" type="button" onClick={onSendMsg}>
//           <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
//             <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
//           </svg>
//         </button>

//         <div
//           className={`upload-progress${uploadProgress === null ? "" : " show"}`}
//         >
//           <div
//             className="upload-progress-bar"
//             style={{ width: `${uploadProgress || 0}%` }}
//           />
//         </div>
//       </div>
//     </div>
//   );
// }
