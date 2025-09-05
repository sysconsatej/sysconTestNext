import React from "react";
import { twMerge } from "tailwind-merge";
// import { createStyles } from "@mantine/styles";
import PropTypes from "prop-types";

// const useRowContainerStyles = createStyles(() => ({
//   rowContainer: {
//     gap: 'var(--gap)',
//   },
// }));

RowContainer.propTypes = {
  variant: PropTypes.string,
  utilities: PropTypes.string,
  children: PropTypes.node,
  className: PropTypes.string,
  gap: PropTypes.string,
  style: PropTypes.object,
};

export default function RowContainer({
  variant,
  utilities,
  children,
  className = "",
  gap,
  style,
  ...rest
}) {
  const variants = {
    "sharing-link":
      "lg:flex lg:flex-row lg:items-center lg:gap-x-[5px] lg:w-[fit-content]",
  };
  const buttonClass = variants[variant] || variants["variant0"];

  // const { classes } = useRowContainerStyles();
  return (
    <div
      className={twMerge(
        "flex flex-row",
        "var(--gap)",
        buttonClass,
        utilities,
        className
      )}
      style={{ "--gap": gap, ...style }}
      {...rest}
    >
      {children}
    </div>
  );
}
