"use client";
import * as React from "react";
import Pagination from "@mui/material/Pagination";
import PaginationItem from "@mui/material/PaginationItem";
import Stack from "@mui/material/Stack";
import { useTheme } from "@mui/material/styles";
import useMediaQuery from "@mui/material/useMediaQuery";

import KeyboardDoubleArrowRightIcon from "@mui/icons-material/KeyboardDoubleArrowRight";
import KeyboardArrowRightIcon from "@mui/icons-material/KeyboardArrowRight";
import KeyboardArrowLeftIcon from "@mui/icons-material/KeyboardArrowLeft";
import KeyboardDoubleArrowLeftIcon from "@mui/icons-material/KeyboardDoubleArrowLeft";

import PropTypes from "prop-types";
import styles from "@/components/common.module.css";
import { paginationStyle } from "@/app/globalCss";

PaginationButtons.propTypes = {
  totalPages: PropTypes.number,
  pageSelected: PropTypes.func,
  selectedPageNumber: PropTypes.number,
};

export default function PaginationButtons({
  totalPages = 0,
  pageSelected,
  selectedPageNumber = 1,
}) {
  const theme = useTheme();
  const isSmDown = useMediaQuery(theme.breakpoints.down("sm")); // mobile
  const isMdDown = useMediaQuery(theme.breakpoints.down("md")); // tab

  function handleChange(page) {
    pageSelected?.(page);
  }

  return (
    <div style={{ display: "inline-flex" }}>
      <Stack>
        <Pagination
          count={totalPages}
          page={selectedPageNumber}
          showFirstButton={!isSmDown} // ✅ hide << >> on mobile
          showLastButton={!isSmDown}
          siblingCount={isSmDown ? 0 : isMdDown ? 0 : 1} // ✅ compact on small screens
          boundaryCount={isSmDown ? 0 : 1}
          size="small"
          sx={{
            ...paginationStyle,

            // ✅ prevent wrapping and keep compact
            "& .MuiPagination-ul": {
              flexWrap: "nowrap",
              justifyContent: "flex-start",
              gap: isSmDown ? "2px" : "4px",
              padding: 0,
              margin: 0,
            },
          }}
          onChange={(event, value) => handleChange(value)}
          renderItem={(item) => (
            <PaginationItem
              className={`${styles.txtColorDark}`}
              components={{
                first: KeyboardDoubleArrowLeftIcon,
                last: KeyboardDoubleArrowRightIcon,
                previous: KeyboardArrowLeftIcon,
                next: KeyboardArrowRightIcon,
              }}
              {...item}
              sx={{
                fontSize: isSmDown ? 9 : 10,
                height: isSmDown ? 22 : 21,
                width: isSmDown ? 22 : 21,
                minWidth: isSmDown ? 22 : 0,
                color: "var(--text-color-dark)",
              }}
            />
          )}
        />
      </Stack>
    </div>
  );
}
