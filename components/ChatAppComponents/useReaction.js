// import { useState } from "react";

// export function useReactions() {
//     const [reactions, setReactions] = useState({});

//     function toggleReaction(messageId, emoji, userId) {
//         setReactions((current) => {
//             const next = { ...current };
//             const msgReactions = { ...(next[messageId] || {}) };
//             const ids = new Set(msgReactions[emoji] || []);
//             if (ids.has(userId)) ids.delete(userId);
//             else ids.add(userId);
//             msgReactions[emoji] = [...ids];
//             next[messageId] = msgReactions;
//             return next;
//         });
//     }

//     return { reactions, toggleReaction };
// }