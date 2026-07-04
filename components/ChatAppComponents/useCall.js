// import { useEffect, useRef, useState } from "react";

// const ICE_SERVERS = {
//     iceServers: [
//         { urls: "stun:stun.l.google.com:19302" },
//         { urls: "stun:stun1.l.google.com:19302" },
//     ],
// };

// export function useCall({ socketRef, users, me }) {
//     const pcRef = useRef(null);
//     const localStreamRef = useRef(null);
//     const remoteVideoRef = useRef(null);
//     const localVideoRef = useRef(null);

//     const [callToast, setCallToast] = useState(null);
//     const [callState, setCallState] = useState({
//         show: false,
//         peer: null,
//         status: "Calling...",
//         timer: 0,
//         muted: false,
//         camOff: false,
//     });

//     // Timer
//     useEffect(() => {
//         if (!callState.show) return undefined;
//         const timer = setInterval(() => {
//             setCallState((s) => ({ ...s, timer: s.timer + 1 }));
//         }, 1000);
//         return () => clearInterval(timer);
//     }, [callState.show]);

//     // Attach local stream to video element when call screen opens
//     useEffect(() => {
//         if (callState.show && localVideoRef.current && localStreamRef.current) {
//             localVideoRef.current.srcObject = localStreamRef.current;
//         }
//     }, [callState.show]);

//     function cleanupCall() {
//         if (pcRef.current) { pcRef.current.close(); pcRef.current = null; }
//         if (localStreamRef.current) {
//             localStreamRef.current.getTracks().forEach((t) => t.stop());
//             localStreamRef.current = null;
//         }
//         if (remoteVideoRef.current) remoteVideoRef.current.srcObject = null;
//         if (localVideoRef.current) localVideoRef.current.srcObject = null;
//     }

//     function createPC(peerId) {
//         const conn = new RTCPeerConnection(ICE_SERVERS);
//         conn.onicecandidate = (e) => {
//             if (e.candidate)
//                 socketRef.current?.emit("ice_candidate", { toUserId: peerId, candidate: e.candidate });
//         };
//         conn.ontrack = (e) => {
//             if (remoteVideoRef.current) remoteVideoRef.current.srcObject = e.streams[0];
//             setCallState((s) => ({ ...s, status: "Connected" }));
//         };
//         conn.onconnectionstatechange = () => {
//             if (conn.connectionState === "failed" || conn.connectionState === "disconnected") hangUp();
//         };
//         return conn;
//     }

//     function hangUp() {
//         if (callState.peer)
//             socketRef.current?.emit("end_call", { toUserId: callState.peer.id });
//         cleanupCall();
//         setCallToast(null);
//         setCallState({ show: false, peer: null, status: "Calling...", timer: 0, muted: false, camOff: false });
//     }

//     async function startCall(toUserId) {
//         const socket = socketRef.current;
//         if (!socket || !me) return;
//         const peer = users.find((u) => u.id === toUserId);
//         try {
//             localStreamRef.current = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
//         } catch { localStreamRef.current = null; }
//         pcRef.current = createPC(toUserId);
//         if (localStreamRef.current) {
//             localStreamRef.current.getTracks().forEach((t) => pcRef.current.addTrack(t, localStreamRef.current));
//             if (localVideoRef.current) localVideoRef.current.srcObject = localStreamRef.current;
//         }
//         const offer = await pcRef.current.createOffer();
//         await pcRef.current.setLocalDescription(offer);
//         socket.emit("call_user", { toUserId });
//         setCallState({ show: true, peer, status: "Calling...", timer: 0, muted: false, camOff: false });
//     }

//     async function acceptCall() {
//         const peer = callToast;
//         setCallToast(null);
//         if (!peer) return;
//         try {
//             localStreamRef.current = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
//         } catch { localStreamRef.current = null; }
//         pcRef.current = createPC(peer.id);
//         if (localStreamRef.current) {
//             localStreamRef.current.getTracks().forEach((t) => pcRef.current.addTrack(t, localStreamRef.current));
//             if (localVideoRef.current) localVideoRef.current.srcObject = localStreamRef.current;
//         }
//         socketRef.current?.emit("call_accepted", { toUserId: peer.id });
//         setCallState({ show: true, peer, status: "Connecting...", timer: 0, muted: false, camOff: false });
//     }

//     function rejectCall() {
//         if (callToast) socketRef.current?.emit("call_rejected", { toUserId: callToast.id });
//         setCallToast(null);
//     }

//     function toggleMute() {
//         localStreamRef.current?.getAudioTracks().forEach((t) => { t.enabled = callState.muted; });
//         setCallState((s) => ({ ...s, muted: !s.muted }));
//     }

//     function toggleCam() {
//         localStreamRef.current?.getVideoTracks().forEach((t) => { t.enabled = callState.camOff; });
//         setCallState((s) => ({ ...s, camOff: !s.camOff }));
//     }

//     // Wire call-related socket events — called once per socket instance
//     function wireCallEvents(socket) {
//         socket.on("incoming_call", ({ fromUserId, fromUsername }) => {
//             const peer = users.find((u) => u.id === fromUserId) || { id: fromUserId, name: fromUsername, color: "#8696a0" };
//             setCallToast(peer);
//         });
//         socket.on("call_accepted", async ({ fromUserId }) => {
//             if (!pcRef.current) return;
//             const offer = pcRef.current.localDescription;
//             socket.emit("call_offer", { toUserId: fromUserId, sdp: offer });
//             setCallState((s) => ({ ...s, status: "Ringing..." }));
//         });
//         socket.on("call_offer", async ({ fromUserId, sdp }) => {
//             if (!pcRef.current) return;
//             await pcRef.current.setRemoteDescription(new RTCSessionDescription(sdp));
//             const answer = await pcRef.current.createAnswer();
//             await pcRef.current.setLocalDescription(answer);
//             socket.emit("call_answer", { toUserId: fromUserId, sdp: answer });
//         });
//         socket.on("call_answer", async ({ sdp }) => {
//             if (pcRef.current) await pcRef.current.setRemoteDescription(new RTCSessionDescription(sdp));
//         });
//         socket.on("ice_candidate", async ({ candidate }) => {
//             try { if (pcRef.current) await pcRef.current.addIceCandidate(new RTCIceCandidate(candidate)); }
//             catch { /* Ignore late candidates after teardown */ }
//         });
//         socket.on("call_rejected", hangUp);
//         socket.on("call_unavailable", hangUp);
//         socket.on("call_ended", hangUp);
//     }

//     return {
//         callState, callToast,
//         remoteVideoRef, localVideoRef,
//         startCall, acceptCall, rejectCall, hangUp,
//         toggleMute, toggleCam,
//         wireCallEvents, cleanupCall,
//         socketRef,
//     };
// }