
// /* eslint-disable react/prop-types */
// import React from "react";

// export function fmtT(ts) {
//   return new Date(ts).toLocaleTimeString([], {
//     hour: "2-digit",
//     minute: "2-digit",
//   });
// }

// export function fmtDate(ts) {
//   return new Date(ts).toLocaleDateString([], {
//     weekday: "long",
//     month: "long",
//     day: "numeric",
//   });
// }

// export function fileExt(name) {
//   return (name.split(".").pop() || "").toLowerCase();
// }

// export function fileSizeLabel(bytes) {
//   if (bytes < 1024) return `${bytes} B`;
//   if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
//   return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
// }

// export const FILE_ICONS = {
//   pdf: { icon: "PDF", cls: "pdf" },
//   doc: { icon: "DOC", cls: "word" },
//   docx: { icon: "DOC", cls: "word" },
//   xls: { icon: "XLS", cls: "excel" },
//   xlsx: { icon: "XLS", cls: "excel" },
//   csv: { icon: "CSV", cls: "csv" },
// };

// export function fileIconInfo(name) {
//   return FILE_ICONS[fileExt(name)] || { icon: "FILE", cls: "csv" };
// }

// export function previewText(message) {
//   if (!message) return null;
//   if (message.type === "file") {
//     try {
//       const file = JSON.parse(message.text);
//       return `File: ${file.originalName || "File"}`;
//     } catch {
//       return "File";
//     }
//   }
//   return message.text;
// }

// export function Avatar({
//   user,
//   size = 46,
//   online = false,
//   children,
//   className = "",
// }) {
//   const label = children || user?.name?.charAt(0) || "?";
//   return (
//     <div
//       className={`avatar${online ? " av-online" : ""}${className ? ` ${className}` : ""}`}
//       style={{
//         background: user?.color || "#1f6e5e",
//         width: size,
//         height: size,
//         fontSize: Math.round(size * 0.38),
//       }}
//     >
//       {label}
//       <div className="av-ring" />
//     </div>
//   );
// }

// export function MentionedText({ text, users }) {
//   const parts = String(text || "").split(/(@\w+)/g);
//   return (
//     <>
//       {parts.map((part, index) => {
//         const name = part.startsWith("@") ? part.slice(1) : "";
//         const user = users.find(
//           (u) => u.name.toLowerCase() === name.toLowerCase(),
//         );
//         if (!user) return <React.Fragment key={index}>{part}</React.Fragment>;
//         return (
//           <span
//             key={index}
//             className="at-mention"
//             style={{ color: user.color }}
//           >
//             {part}
//           </span>
//         );
//       })}
//     </>
//   );
// }
