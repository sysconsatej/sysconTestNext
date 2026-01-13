"use client";
import * as React from "react";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer
      className="
        fixed left-0 right-0 bottom-0 z-[1000]
        flex items-center justify-end
        px-4 py-3
        bg-blue-600/95 backdrop-blur-md
        border-t border-white/20
      "
      style={{ paddingBottom: "calc(env(safe-area-inset-bottom, 0px) + 12px)" }}
    >
      <p className="text-white text-[13px] sm:text-[14px] font-semibold tracking-wide">
        © {currentYear} SYSCON PVT LTD.
      </p>
    </footer>
  );
}
