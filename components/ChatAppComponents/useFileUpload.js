import { useRef, useState } from "react";

const FILE_MAX_MB = 5;
const FILE_MAX_B = FILE_MAX_MB * 1024 * 1024;
const FILE_ALLOWED = new Set([".pdf", ".docx", ".doc", ".xlsx", ".xls", ".csv"]);

function fileExt(name) {
    return (name.split(".").pop() || "").toLowerCase();
}

function fileSizeLabel(bytes) {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
}

export function useFileUpload({ apiBase, me, activePeer, socketRef }) {
    const fileInputRef = useRef(null);
    const [uploadToast, setUploadToast] = useState("");
    const [uploadProgress, setUploadProgress] = useState(null);

    function showToast(message) {
        setUploadToast(message);
        setTimeout(() => setUploadToast(""), 3500);
    }

    function uploadWithProgress(formData, onProgress) {
        return new Promise((resolve, reject) => {
            const xhr = new XMLHttpRequest();
            xhr.open("POST", `${apiBase}/api/upload?username=${encodeURIComponent(me.name)}`);
            xhr.upload.addEventListener("progress", (e) => {
                if (e.lengthComputable) onProgress(Math.round((e.loaded / e.total) * 95));
            });
            xhr.addEventListener("load", () => {
                try { resolve(JSON.parse(xhr.responseText)); }
                catch { reject(new Error("Invalid server response")); }
            });
            xhr.addEventListener("error", () => reject(new Error("Network error")));
            xhr.addEventListener("abort", () => reject(new Error("Upload aborted")));
            xhr.send(formData);
        });
    }

    async function onFileChosen(file) {
        if (!file || !me || !activePeer) return;
        const ext = `.${fileExt(file.name)}`;
        if (!FILE_ALLOWED.has(ext)) {
            showToast("File type not allowed. Use PDF, DOCX, XLSX or CSV.");
            return;
        }
        if (file.size > FILE_MAX_B) {
            showToast(`File too large (${fileSizeLabel(file.size)}). Max is ${FILE_MAX_MB} MB.`);
            return;
        }

        const formData = new FormData();
        formData.append("file", file);
        formData.append("username", me.name);

        try {
            setUploadProgress(0);
            const result = await uploadWithProgress(formData, (pct) => setUploadProgress(pct));
            if (!result.ok) {
                showToast(result.error || "Upload failed.");
                return;
            }
            const ROOM = "general";
            const filePayload = JSON.stringify(result.file);
            socketRef.current.emit(
                activePeer === "group" ? "send_message" : "send_dm",
                activePeer === "group"
                    ? { roomId: ROOM, content: filePayload, type: "file" }
                    : { toUserId: activePeer.id, content: filePayload, type: "file" },
            );
            setUploadProgress(100);
            setTimeout(() => setUploadProgress(null), 600);
        } catch (e) {
            showToast(`Upload failed: ${e.message}`);
        } finally {
            if (fileInputRef.current) fileInputRef.current.value = "";
            setTimeout(() => setUploadProgress(null), 650);
        }
    }

    return { fileInputRef, uploadToast, uploadProgress, onFileChosen };
}