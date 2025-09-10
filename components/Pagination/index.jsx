"use client";
import * as React from "react";
import Pagination from "@mui/material/Pagination";
import PaginationItem from "@mui/material/PaginationItem";
import Stack from "@mui/material/Stack";
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
  totalPages,
  pageSelected,
  selectedPageNumber,
}) {
  function handleChange(page) {
    pageSelected(page);
  }
  return (
    <div className="mr-5 ">
      <Stack>
        <Pagination
          count={totalPages}
          page={selectedPageNumber}
          showFirstButton
          showLastButton
          sx={{
            ...paginationStyle,
          }}
          onChange={(event, value) => {
            handleChange(value);
            // Add your logic to handle the selected pagination value here
          }}
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
                fontSize: 10,
                height: 21,
                width: 21,
                minWidth: 0,
                color: "var(--text-color-dark)",
              }}
            />
          )}
        />
      </Stack>
    </div>
  );
}
