"use client";
import ChatApp from "@/components/ChatComponents/ChatApp";
import React from "react";

export default function Page() {
  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Chat Interface</h1>
      <ChatApp />
    </div>
  );
}
