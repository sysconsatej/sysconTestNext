"use client";
/* eslint-disable */
import * as React from "react";
import {  useState } from "react";
import Breadcrumbs from "@mui/material/Breadcrumbs";
import Typography from "@mui/material/Typography";
import Stack from "@mui/material/Stack";
import NavigateNextIcon from "@mui/icons-material/NavigateNext";

export default function CustomeBreadCrumb({ name }) {
  const [breadcrumbs] = useState([
    <Typography
      key="2"
      fontSize="small"
      sx={{ margin: "0", color: "var(--commonTextColor)" }}
    >
      {name}
    </Typography>,
  ]);

  return (
    <div className="relative top-4 pl-1">
      <Stack spacing={1}>
        <Breadcrumbs
          separator={
            <NavigateNextIcon
              fontSize="large"
              sx={{ margin: "0", color: "var(--commonTextColor)" }}
            />
          }
          aria-label="breadcrumb"
        >
          {breadcrumbs}
        </Breadcrumbs>
      </Stack>
    </div>
  );
}
