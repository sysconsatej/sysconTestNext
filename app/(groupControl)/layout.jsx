"use client";

import React from "react";
import NavbarPage from "@/components/Navbar/navbar"; // Navbar import
import SideBarMenu from "@/components/Sidebar/sidebarTree"; // Sidebar import
import styles from "@/app/app.module.css";
import PropTypes from "prop-types";

RootLayout.propTypes = {
  children: PropTypes.node.isRequired,
};
export default function RootLayout({ children }) {

  return (
    <div className="flex overflow-hidden">
      {/* Sidebar */}
      <SideBarMenu  />

      {/* Main content area */}
      <div className={`flex flex-col flex-grow  flex-container w-80 mr-0 `}>
        {/* Navbar */}
        <NavbarPage />

        {/* Children */}
        <div
          className={`flex-grow overflow-y-hidden pl-2  mt-1 ${styles.hideScrollbar}  ${styles.childrenHeight}`}
        >
          <div className="pr-[10px]">{children}</div>
        </div>
      </div>
    </div>
  );
}
