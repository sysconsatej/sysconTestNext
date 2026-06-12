
'use client';
import { useRef, useState } from "react";

const ROOM = "general";

function dmRoomId(a, b) {
    return "dm:" + [a, b].sort().join(":");
}

export function useChatSocket({ socketUrl, ioFactory, socketFactory, destroySocket, users, wireCallEvents }) {
    const socketRef = useRef(null);
    const activePeerKeyRef = useRef(null);
    const typingTimerRef = useRef(null);
    const typingActiveRef = useRef(false);

    const [serverStatus, setServerStatus] = useState("—");
    const [serverOnline, setServerOnline] = useState(false);
    const [onlineIds, setOnlineIds] = useState(new Set());
    const [unread, setUnread] = useState({});
    const [lastMsgInfo, setLastMsgInfo] = useState({});
    const [groupMessages, setGroupMessages] = useState([]);
    const [dmMessages, setDmMessages] = useState({});
    const [peerTyping, setPeerTyping] = useState({});
    const [dmTyping, setDmTyping] = useState({});

    // Keep activePeerKeyRef in sync (set externally via syncActivePeerKey)
    function syncActivePeerKey(key) {
        activePeerKeyRef.current = key;
    }

    function notify(msg, sender) {
        if (!("Notification" in window) || Notification.permission !== "granted") return;
        const n = new Notification(sender.name, {
            body: msg.content.length > 80 ? `${msg.content.slice(0, 80)}...` : msg.content,
            tag: `chat-${sender.id}`,
            renotify: true,
        });
        n.onclick = (e) => { e.preventDefault(); window.focus(); n.close(); };
        setTimeout(() => n.close(), 5000);
    }

    function updateMessageStatus(messageId, status) {
        setGroupMessages((msgs) => msgs.map((m) => (m.id === messageId ? { ...m, status } : m)));
        setDmMessages((map) =>
            Object.fromEntries(
                Object.entries(map).map(([key, msgs]) => [
                    key,
                    msgs.map((m) => (m.id === messageId ? { ...m, status } : m)),
                ]),
            ),
        );
    }

    function disconnectSocket() {
        if (socketRef.current) {
            socketRef.current.disconnect();
            socketRef.current = null;
        }
        if (destroySocket) destroySocket();
    }

    function connectSocket(nextMe) {
        const factory = socketFactory || ioFactory || window.io;
        if (!factory) {
            setServerStatus("socket.io client missing");
            setServerOnline(false);
            return;
        }

        const socket = socketFactory
            ? factory({ serverUrl: socketUrl })
            : socketUrl
                ? factory(socketUrl)
                : factory();
        socketRef.current = socket;

        // Wire call events via injected function
        wireCallEvents(socket);

        socket.on("connect", () => {
            setServerOnline(true);
            setServerStatus("connected");
            socket.emit("auth", { userId: nextMe.id, username: nextMe.name });
            socket.emit("join_room", { roomId: ROOM, roomName: "general" });
        });

        socket.on("disconnect", () => {
            setServerOnline(false);
            setServerStatus("disconnected");
        });

        socket.on("auth_success", ({ onlineUsers }) => {
            setOnlineIds(new Set((onlineUsers || []).map((u) => u.userId)));
        });

        socket.on("online_users", (onlineUsers) => {
            setOnlineIds(new Set((onlineUsers || []).map((u) => u.userId)));
        });

        socket.on("user_online", (d) => setOnlineIds((ids) => new Set([...ids, d.userId])));
        socket.on("user_offline", (d) => {
            setOnlineIds((ids) => { const next = new Set(ids); next.delete(d.userId); return next; });
        });

        socket.on("room_history", ({ messages }) => {
            const msgs = messages || [];
            setGroupMessages(msgs);
            if (msgs.length) {
                const last = msgs[msgs.length - 1];
                setLastMsgInfo((info) => ({ ...info, group: { text: last.content, time: last.createdAt, type: last.type } }));
            }
        });

        socket.on("dm_history", ({ toUserId, messages }) => {
            const msgs = messages || [];
            setDmMessages((map) => ({ ...map, [toUserId]: msgs }));
            if (msgs.length) {
                const last = msgs[msgs.length - 1];
                setLastMsgInfo((info) => ({ ...info, [toUserId]: { text: last.content, time: last.createdAt, type: last.type } }));
            }
        });

        socket.on("new_message", (msg) => {
            setGroupMessages((msgs) => [...msgs, msg]);
            setLastMsgInfo((info) => ({ ...info, group: { text: msg.content, time: msg.createdAt, type: msg.type } }));
            if (msg.senderId !== nextMe.id) {
                setUnread((u) => (activePeerKeyRef.current === "group" ? u : { ...u, group: (u.group || 0) + 1 }));
                const sender = users.find((user) => user.id === msg.senderId);
                if (sender) notify(msg, sender);
                socket.emit("message_delivered", { roomId: ROOM, messageId: msg.id });
            }
        });

        socket.on("new_dm", (msg) => {
            const isMe = msg.senderId === nextMe.id;
            const peerId = isMe ? msg.toUserId : msg.senderId;
            setDmMessages((map) => ({ ...map, [peerId]: [...(map[peerId] || []), msg] }));
            setLastMsgInfo((info) => ({ ...info, [peerId]: { text: msg.content, time: msg.createdAt, type: msg.type } }));
            if (!isMe) {
                setUnread((u) => (activePeerKeyRef.current === peerId ? u : { ...u, [peerId]: (u[peerId] || 0) + 1 }));
                const sender = users.find((user) => user.id === msg.senderId);
                if (sender) notify(msg, sender);
                socket.emit("message_delivered", { roomId: dmRoomId(nextMe.id, peerId), messageId: msg.id });
            }
        });

        socket.on("typing_update", (data) => {
            const typing = new Set(data.typingUsers || []);
            setPeerTyping(Object.fromEntries(users.map((u) => [u.id, typing.has(u.id) && u.id !== nextMe.id])));
        });

        socket.on("dm_typing_update", ({ fromUserId, isTyping }) => {
            setDmTyping((typing) => ({ ...typing, [fromUserId]: isTyping }));
        });

        socket.on("message_status", (data) => {
            updateMessageStatus(data.messageId, data.status);
        });

        if (!socket.connected && typeof socket.connect === "function") socket.connect();
    }

    function resetChatState() {
        setUnread({});
        setLastMsgInfo({});
        setGroupMessages([]);
        setDmMessages({});
        setPeerTyping({});
        setDmTyping({});
        setOnlineIds(new Set());
    }

    function sendMessage({ activePeer, draft, replyingTo }) {
        const socket = socketRef.current;
        if (!socket || !activePeer || !draft.trim()) return;
        const isGroup = activePeer === "group";
        if (typingActiveRef.current) {
            socket.emit(
                isGroup ? "typing_stop" : "dm_typing_stop",
                isGroup ? { roomId: ROOM } : { toUserId: activePeer.id },
            );
            typingActiveRef.current = false;
        }
        const payload = { content: draft.trim(), replyTo: replyingTo || undefined };
        socket.emit(
            isGroup ? "send_message" : "send_dm",
            isGroup ? { roomId: ROOM, ...payload } : { toUserId: activePeer.id, ...payload },
        );
    }

    function emitTyping(activePeer) {
        const socket = socketRef.current;
        if (!socket || !activePeer) return;
        const isGroup = activePeer === "group";
        if (!typingActiveRef.current) {
            socket.emit(
                isGroup ? "typing_start" : "dm_typing_start",
                isGroup ? { roomId: ROOM } : { toUserId: activePeer.id },
            );
            typingActiveRef.current = true;
        }
        clearTimeout(typingTimerRef.current);
        typingTimerRef.current = setTimeout(() => {
            socket.emit(
                isGroup ? "typing_stop" : "dm_typing_stop",
                isGroup ? { roomId: ROOM } : { toUserId: activePeer.id },
            );
            typingActiveRef.current = false;
        }, 2000);
    }

    function getDmHistory(toUserId) {
        socketRef.current?.emit("get_dm_history", { toUserId });
    }

    function markRead(key) {
        setUnread((u) => ({ ...u, [key]: 0 }));
    }

    return {
        socketRef,
        serverStatus, serverOnline,
        onlineIds, unread,
        lastMsgInfo, groupMessages, dmMessages,
        peerTyping, dmTyping,
        syncActivePeerKey,
        connectSocket, disconnectSocket, resetChatState,
        sendMessage, emitTyping, getDmHistory, markRead,
    };
}