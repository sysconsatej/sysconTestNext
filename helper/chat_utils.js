
export const getNow  = () => {
    const d = new Date();
    const h = d.getHours() % 12 || 12;
    const m = String(d.getMinutes()).padStart(2, "0");
    return `${h}:${m} ${d.getHours() >= 12 ? "PM" : "AM"}`;
}

export const getLastMsg  = (contact) => {
    const msgs = contact.messages;
    if (!msgs.length) return "";
    const last = msgs[msgs.length - 1];
    const text = last.text.length > 38 ? last.text.slice(0, 38) + "…" : last.text;
    return last.from === "me" ? `You: ${text}` : text;
}

export const getLastTime  = (contact) => {
    const msgs = contact.messages;
    return msgs.length ? msgs[msgs.length - 1].time : "";
}

