"use client";

import React from "react";
import NavbarPage from "@/components/Navbar/navbar";
import SideBarMenu from "@/components/Sidebar/sidebarTree";
import styles from "@/app/app.module.css";
import PropTypes from "prop-types";

RootLayout.propTypes = {
  children: PropTypes.node.isRequired,
};

export default function RootLayout({ children }) {
  return (
    <div className="flex h-screen w-full overflow-hidden">
      {/* Sidebar */}
      <div className="shrink-0">
        <SideBarMenu />
      </div>

      {/* Main content area */}
      <div className="flex flex-col min-w-0 min-h-0 overflow-hidden w-full">
        {/* Navbar */}
        <div className="shrink-0 flex">
          <NavbarPage />
        </div>

        {/* ✅ Children scroll area */}
        <div
          className={`min-h-0 overflow-auto pl-2 mt-1 ${styles.hideScrollbar}`}
        >
          <div className="pr-[10px]">{children}</div>
        </div>
      </div>
    </div>
  );
}
