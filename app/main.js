"use client";

import React from "react";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { ThemeProvider } from "@mui/material/styles";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import theme from "@/components/Theme/theme";
import PropTypes from "prop-types";
import { ThemeProviderData } from "@/context/themeProviderDataContext";
import Assistant from "@/components/Assistant/Assistant";
import { usePathname } from "next/navigation";

const ASSISTANT_HIDDEN_ROUTES = [
  "/login",
  "/forgotpassword",
  "/loginreset",
  "/loginhelp",
];

function shouldHideAssistant(pathname) {
  const path = String(pathname || "").toLowerCase();
  return ASSISTANT_HIDDEN_ROUTES.some(
    (route) => path === route || path.startsWith(`${route}/`),
  );
}

Main.propTypes = {
  children: PropTypes.node,
};

function Main({ children }) {
  const pathname = usePathname();
  const hideAssistant = shouldHideAssistant(pathname);

  return (
    <>
        <ThemeProviderData>
          <ThemeProvider theme={theme}>
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              {children}
              {!hideAssistant && <Assistant />}
              <ToastContainer autoClose={4000} closeOnClick />
            </LocalizationProvider>
          </ThemeProvider>
        </ThemeProviderData>
    </>
  );
}

export default Main;
