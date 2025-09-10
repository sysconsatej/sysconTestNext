"use client";

import * as React from "react";
import styles from "@/app/app.module.css";
import Image from "next/image";
import Stack from "@mui/material/Stack";
import PropTypes from "prop-types";
import { expandAllIcon, closeIconRed } from "@/assets";
import IconButton from "@mui/material/IconButton";
import { fontFamilyStyles } from "@/app/globalCss";
import LightTooltip from "@/components/Tooltip/customToolTip";

CustomizedButtons.propTypes = {
  button: PropTypes.any,
  onClickFunc: PropTypes.any,
};

export default function CustomizedButtons({ button, onClickFunc }) {
  if (!button) {
    // You can return a loading indicator or null if there's no data yet
    return null;
  }

  return (
    <button
      className={`${styles.commonBtn} font-[${fontFamilyStyles}]`}
      type="button"
      onClick={onClickFunc ? () => onClickFunc() : null}
    >
      {button.buttonName}
    </button>
  );
}

ButtonPanel.propTypes = {
  buttonsData: PropTypes.any,
  handleButtonClick: PropTypes.object,
  expandAll: PropTypes.bool,
  setExpandAll: PropTypes.func,
  topSide: PropTypes.bool,
  isView: PropTypes.bool,
  isReport: PropTypes.bool,
};
export function ButtonPanel({
  buttonsData,
  handleButtonClick,
  expandAll,
  setExpandAll,
  topSide,
  isView,
  isReport,
}) {
  return (
    <div className={`flex ${!isReport ? "mx-2" : ""} my-2 justify-between `}>
      <div className="flex justify-start ">
        {!isView && (
          <Stack spacing={1} direction="row">
            {buttonsData ? (
              buttonsData.map((button, index) => (
                <CustomizedButtons
                  key={index}
                  button={button}
                  onClickFunc={handleButtonClick?.[button.functionOnClick]}
                />
              ))
            ) : (
              <div>Loading...</div>
            )}
          </Stack>
        )}
      </div>
      {topSide && (
        <div className="flex justify-end  w-8 h-8 gap-2">
          <LightTooltip title={expandAll ? "Collapse All" : "Expand All"}>
            <IconButton
              onClick={() => setExpandAll((expand) => !expand)}
              sx={{
                width: "80%",
                height: "80%",
                padding: "7px",
                backgroundColor: "var(--accordion-summary-bg)",
              }}
              className={`${styles.accordianSummaryBg} rounded-full shadow-md`}
            >
              <Image
                src={expandAllIcon}
                alt={expandAll ? "Collapse All" : "Expand All"}
                className={`cursor-pointer opacity-60 ${
                  expandAll
                    ? "rotate-180 transition-all duration-300"
                    : "transition-all duration-300"
                }`}
              />
            </IconButton>
          </LightTooltip>
          <LightTooltip title={"Close"}>
            <IconButton
              onClick={handleButtonClick.handleClose}
              sx={{
                width: "80%",
                height: "80%",
                padding: "7px",
                backgroundColor: "var(--accordion-summary-bg)",
              }}
              className=" rounded-full shadow-md"
            >
              <Image src={closeIconRed} alt="Close" />
            </IconButton>
          </LightTooltip>
        </div>
      )}
    </div>
  );
}
