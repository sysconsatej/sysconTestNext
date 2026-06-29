/* eslint-disable react/prop-types */
import React from "react";
import CloseIcon from "@mui/icons-material/Close";
import MinimizeIcon from "@mui/icons-material/Minimize";
import { Box, Checkbox, } from "@mui/material";

export function TopBar({
  serverOnline,
  serverStatus,
  notif,
  onRequestNotifications,
  closeWindow,
  checkIsActiveOrNot,
  isActive,
}) {
  return (
    <Box className="topbar">
      <Box>
        <Checkbox checked={isActive} onChange={checkIsActiveOrNot}  value={isActive  ?   "Online users"  :  "Offline Users"} />
      </Box>

      <Box className="topbar-right">
        <button
          className={notif.className}
          disabled={notif.disabled}
          onClick={onRequestNotifications}
          type="button"
        >
          <span>{notif.icon}</span>
          <span>{notif.label}</span>
        </button>
        <Box className={`srv-dot${serverOnline ? " on" : ""}`} />
        <span className="srv-label">{serverStatus}</span>
      </Box>
      <Box className="flex flex-row flex-end justify-between">
        <CloseIcon onClick={closeWindow} />
        <MinimizeIcon onClick={closeWindow} />
      </Box>
    </Box>
  );
}
