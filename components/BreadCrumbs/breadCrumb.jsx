"use client";
import * as React from "react";
import { useEffect, useState } from "react";
import Breadcrumbs from "@mui/material/Breadcrumbs";
import Typography from "@mui/material/Typography";
import Stack from "@mui/material/Stack";
import NavigateNextIcon from "@mui/icons-material/NavigateNext";
import { useSearchParams } from "next/navigation";

export default function CustomeBreadCrumb() {
  const [breadcrumbs, setBreadcrumbs] = useState();
  const [menuName, setMenuName] = useState("");
  const searchParams = useSearchParams();

  useEffect(() => {
    // Function to extract menuName from query parameters
    const getMenuNameFromQueryParams = () => {
      return searchParams.get("menuName");
    };

    // Function to extract menuName from JSON-like structures in the URL path
    const getMenuNameFromPath = () => {
      if (typeof window !== 'undefined') {
        const path = window.location.pathname;
        const regex = /%7B.*?%7D/;
        const match = path.match(regex);
        if (match) {
          try {
            const jsonString = decodeURIComponent(match[0]);
            const params = JSON.parse(jsonString);
            return params.menuName;
          } catch (error) {
            console.error("Failed to parse params:", error);
          }
        }
      }
      return null;
    };

    // Extract menuName from both possible locations
    const menuNameFromQueryParams = getMenuNameFromQueryParams();
    const menuNameFromPath = getMenuNameFromPath();

    // Set the menuName based on which one is available
    const menuNameValue = menuNameFromQueryParams || menuNameFromPath || "";

    // Set the extracted menuName to state
    setMenuName(menuNameValue);
    const storedOpenItems = sessionStorage.getItem("breadCrumbs");
    if (storedOpenItems) {
      const openItems = JSON.parse(storedOpenItems);
      setBreadcrumbs(openItems);
    }
  }, [searchParams]);

  const updatedBreadCrumb = breadcrumbs?.split(",").map((item, index) => (
    <Typography
      key={index}
      sx={{ fontSize: "12px", color: "var(--commonTextColor)" }}
      onClick={(event) => event.preventDefault()}
    >
      {item}
    </Typography>
  ));

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
          {menuName !== null ? updatedBreadCrumb : null}
        </Breadcrumbs>
      </Stack>
    </div>
  );
}
