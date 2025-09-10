"use client";

import React from "react";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { ThemeProvider } from "@mui/material/styles";
import { ToastContainer } from "react-toastify";
import { BrowserRouter } from "react-router-dom"; // ✅ Add this line
import "react-toastify/dist/ReactToastify.css";
import theme from "@/components/Theme/theme";
import PropTypes from "prop-types";
import { ThemeProviderData } from "@/context/themeProviderDataContext";

Main.propTypes = {
  children: PropTypes.node,
};

function Main({ children }) {
  return (
    <>
      <BrowserRouter> {/* ✅ Wrap everything inside this */}
        <ThemeProviderData>
          <ThemeProvider theme={theme}>
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              {children}
              <ToastContainer autoClose={4000} closeOnClick />
            </LocalizationProvider>
          </ThemeProvider>
        </ThemeProviderData>
      </BrowserRouter>
    </>
  );
}

export default Main;
