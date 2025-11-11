"use client";

import React from "react";
import LightTooltip from "../Tooltip/customToolTip";
import Image from "next/image";
import { Box, IconButton } from "@mui/material";
import { func, string } from "prop-types";

export const ActionButton = ({ onDelete, deleteImagePath }) => {
  return (
    <>
      <Box className="flex pl-1 w-12">
        <LightTooltip title="Delete Record">
          <IconButton aria-label="Delete" onClick={onDelete}>
            <Image
              src={deleteImagePath}
              alt="Delete Icon"
              priority={false}
              className="gridIcons2"
            />
          </IconButton>
        </LightTooltip>
      </Box>
    </>
  );
};

ActionButton.propTypes = {
  onDelete: func.isRequired,
  deleteImagePath: string,
};
