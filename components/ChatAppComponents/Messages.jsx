// /* eslint-disable react/prop-types */

// import React, { useEffect, useRef } from "react";
// import {
//   fmtT,
//   fmtDate,
//   fileSizeLabel,
//   fileIconInfo,
//   MentionedText,
// } from "./ChatUtils";

// function MessageBubble({
//   msg,
//   isMe,
//   sender,
//   isGroup,
//   users,
//   currentUserId,
//   reactions,
//   onReact,
//   onReply,
// }) {
//   const tc = msg.status || "sent";
//   const ticks = { sent: "✓", delivered: "✓✓", read: "✓✓" };
//   const reactionEntries = Object.entries(reactions || {}).filter(
//     ([, ids]) => ids.length > 0,
//   );

//   let fileData = null;
//   if (msg.type === "file") {
//     try {
//       fileData = JSON.parse(msg.content);
//     } catch {
//       fileData = null;
//     }
//   }

//   return (
//     <div className={`bwrap ${isMe ? "out" : "in"}`} data-msg-id={msg.id}>
//       <div className="msg-actions">
//         {["❤", "👍", "😂", "😮", "😢"].map((emoji) => (
//           <button
//             key={emoji}
//             type="button"
//             onClick={() => onReact(msg.id, emoji)}
//             title={emoji}
//           >
//             {emoji}
//           </button>
//         ))}
//         <div className="act-divider" />
//         <button type="button" onClick={() => onReply(msg)} title="Reply">
//           ↩
//         </button>
//       </div>

//       {!isMe && isGroup ? (
//         <div className="bsender" style={{ color: sender?.color || "#8696a0" }}>
//           {sender?.name || ""}
//         </div>
//       ) : null}

//       <div className="bubble">
//         {msg.replyTo ? (
//           <div className="reply-quote">
//             <div
//               className="rq-sender"
//               style={{
//                 color:
//                   users.find((u) => u.id === msg.replyTo.senderId)?.color ||
//                   "#8696a0",
//               }}
//             >
//               {users.find((u) => u.id === msg.replyTo.senderId)?.name ||
//                 msg.replyTo.senderName ||
//                 "Unknown"}
//             </div>
//             <div className="rq-text">
//               {msg.replyTo.type === "file"
//                 ? "File"
//                 : String(msg.replyTo.content || "").slice(0, 80)}
//             </div>
//           </div>
//         ) : null}

//         {fileData ? (
//           <a
//             className="file-bubble"
//             href={fileData.url}
//             target="_blank"
//             rel="noopener noreferrer"
//             download={fileData.originalName || ""}
//           >
//             <div
//               className={`file-icon ${fileIconInfo(fileData.originalName || fileData.storedName || "").cls}`}
//             >
//               {
//                 fileIconInfo(fileData.originalName || fileData.storedName || "")
//                   .icon
//               }
//             </div>
//             <div className="file-details">
//               <div className="file-name">
//                 {fileData.originalName || fileData.storedName}
//               </div>
//               <div className="file-meta">
//                 {fileData.label || "FILE"} · {fileSizeLabel(fileData.size || 0)}
//               </div>
//             </div>
//             <span className="file-dl">↓</span>
//           </a>
//         ) : (
//           <MentionedText text={msg.content} users={users} />
//         )}

//         <div className="bmeta">
//           <span>{fmtT(msg.createdAt)}</span>
//           {isMe ? (
//             <span className={`ticks ${tc}`}>{ticks[tc] || "✓"}</span>
//           ) : null}
//         </div>
//       </div>

//       <div className="reactions">
//         {reactionEntries.map(([emoji, ids]) => (
//           <span
//             key={emoji}
//             className={`reaction-pill${ids.includes(currentUserId) ? " mine" : ""}`}
//             onClick={() => onReact(msg.id, emoji)}
//             title={ids.join(", ")}
//           >
//             {emoji}
//             <span className="r-count">{ids.length}</span>
//           </span>
//         ))}
//       </div>
//     </div>
//   );
// }

// export function Messages({
//   messages,
//   me,
//   users,
//   activePeer,
//   reactions,
//   onReact,
//   onReply,
// }) {
//   const boxRef = useRef(null);

//   useEffect(() => {
//     if (boxRef.current) boxRef.current.scrollTop = boxRef.current.scrollHeight;
//   }, [messages]);

//   let lastDate = "";
//   const isGroup = activePeer === "group";

//   return (
//     <div className="messages" ref={boxRef}>
//       {messages.map((msg) => {
//         const date = fmtDate(msg.createdAt);
//         const showDate = date !== lastDate;
//         lastDate = date;
//         const sender = users.find((u) => u.id === msg.senderId);
//         const isMe = msg.senderId === me?.id;
//         return (
//           <React.Fragment key={msg.id}>
//             {showDate ? (
//               <div className="date-div">
//                 <span>{date}</span>
//               </div>
//             ) : null}
//             <MessageBubble
//               msg={msg}
//               isMe={isMe}
//               sender={sender}
//               isGroup={isGroup}
//               users={users}
//               currentUserId={me?.id}
//               reactions={reactions[msg.id]}
//               onReact={onReact}
//               onReply={onReply}
//             />
//           </React.Fragment>
//         );
//       })}
//     </div>
//   );
// }
