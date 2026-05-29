import React, { useState } from "react";
import { CHAT_DATA } from "./sample_chat_data";
import { getNow } from "../../helper/chat_utils";
import { ChatSidebar } from "./ChatSidebar";
import { ChatWindow } from "./ChatWindow";

export default function ChatApp() {
  const [contacts, setContacts] = useState(CHAT_DATA);
  const [activeId, setActiveId] = useState(1);
  const [search, setSearch] = useState("");

  const activeContact = contacts.find((c) => c.id === activeId) || null;

  const handleSelect = (id) => {
    setActiveId(id);
    setContacts((prev) =>
      prev.map((c) => (c.id === id ? { ...c, unread: 0 } : c)),
    );
  };

  const handleSend = (text) => {
    setContacts((prev) =>
      prev.map((c) =>
        c.id === activeId
          ? {
              ...c,
              messages: [
                ...c.messages,
                {
                  id: Date.now(),
                  from: "me",
                  text,
                  time: getNow(),
                  date: "Today",
                },
              ],
            }
          : c,
      ),
    );
  };

  return (
    <div className="flex h-[600px] rounded-2xl overflow-hidden border border-gray-200 dark:border-gray-800 shadow-xl font-sans bg-white dark:bg-gray-900">
      <ChatSidebar
        contacts={contacts}
        activeId={activeId}
        onSelect={handleSelect}
        search={search}
        onSearchChange={setSearch}
      />
      <ChatWindow contact={activeContact} onSend={handleSend} />
    </div>
  );
}
