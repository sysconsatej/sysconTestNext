// import { useState } from "react";

// export function useMention({ users, me, activePeer, inputRef, draft, setDraft }) {
//     const [mention, setMention] = useState({
//         show: false,
//         query: "",
//         index: 0,
//         start: -1,
//     });

//     function getMentionCandidates(query) {
//         const q = query.toLowerCase();
//         const candidates =
//             activePeer === "group"
//                 ? users.filter((u) => u.id !== me?.id)
//                 : activePeer
//                     ? [activePeer]
//                     : [];
//         return candidates.filter((u) => u.name.toLowerCase().startsWith(q));
//     }

//     function detectMention(value, cursor) {
//         let atPos = -1;
//         for (let i = cursor - 1; i >= 0; i -= 1) {
//             if (value[i] === "@") {
//                 if (i === 0 || /\s/.test(value[i - 1])) {
//                     atPos = i;
//                     break;
//                 }
//             }
//             if (/\s/.test(value[i])) break;
//         }

//         if (atPos >= 0) {
//             const query = value.slice(atPos + 1, cursor);
//             if (/^[\w]*$/.test(query)) {
//                 setMention({
//                     show: getMentionCandidates(query).length > 0,
//                     query,
//                     index: 0,
//                     start: atPos,
//                 });
//                 return;
//             }
//         }
//         setMention({ show: false, query: "", index: 0, start: -1 });
//     }

//     function pickMention(name) {
//         const cursor = inputRef.current?.selectionStart || draft.length;
//         const before = draft.slice(0, mention.start);
//         const after = draft.slice(cursor);
//         const next = `${before}@${name} ${after}`;
//         setDraft(next);
//         setMention({ show: false, query: "", index: 0, start: -1 });
//         requestAnimationFrame(() => {
//             const pos = before.length + name.length + 2;
//             inputRef.current?.setSelectionRange(pos, pos);
//             inputRef.current?.focus();
//         });
//     }

//     function handleMentionKeyDown(e, candidates) {
//         if (e.key === "ArrowDown") {
//             e.preventDefault();
//             setMention((m) => ({ ...m, index: Math.min(m.index + 1, candidates.length - 1) }));
//             return true;
//         }
//         if (e.key === "ArrowUp") {
//             e.preventDefault();
//             setMention((m) => ({ ...m, index: Math.max(m.index - 1, 0) }));
//             return true;
//         }
//         if (e.key === "Enter" || e.key === "Tab") {
//             e.preventDefault();
//             if (candidates[mention.index]) pickMention(candidates[mention.index].name);
//             return true;
//         }
//         if (e.key === "Escape") {
//             setMention({ show: false, query: "", index: 0, start: -1 });
//             return true;
//         }
//         return false;
//     }

//     function clearMention() {
//         setMention({ show: false, query: "", index: 0, start: -1 });
//     }

//     const mentionCandidates = mention.show ? getMentionCandidates(mention.query) : [];

//     return { mention, mentionCandidates, detectMention, pickMention, handleMentionKeyDown, clearMention };
// }