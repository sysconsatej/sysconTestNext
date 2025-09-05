import { twMerge } from "tailwind-merge";
import React from "react";
import PropTypes from "prop-types";
import { useThemeProvider } from "@/context/themeProviderDataContext";

Card.propTypes = {
  variant: PropTypes.string,
  utilities: PropTypes.string,
  children: PropTypes.node,
  className: PropTypes.string,
};
export default function Card({ children, className = "", ...rest }) {
  const { themeDetails } = useThemeProvider();
  return (
    <div
      style={{
        borderColor: themeDetails.primaryBorder,
        hover: {
          backgroundColor: themeDetails.primaryHover,
        },
      }}
      className={twMerge(
        "shadow-lg border-[1px] border-solid  w-[294px] rounded-[10px] ",
        className
      )}
      {...rest}
    >
      {children}
    </div>
  );
}
