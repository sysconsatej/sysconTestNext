"use client";
import * as React from "react";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    // Footer section
    <footer
      className="flex  justify-end items-center p-4 bg-blue-600 "
      style={{
        position: "fixed",
        bottom: "-10px",
        width: "100%",
        zIndex: "1000",
      }}
    >
      <p className="text-white text-align-right ">
        © {currentYear} SYSCON PVT LTD.
      </p>
    </footer>
  );
}
