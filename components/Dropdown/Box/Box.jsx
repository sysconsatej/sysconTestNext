import { twMerge } from "tailwind-merge";
import React from "react";
import PropTypes from "prop-types";

Box.propTypes = {
  variant: PropTypes.string,
  component: PropTypes.string,
  utilities: PropTypes.string,
  children: PropTypes.node,
  className: PropTypes.string,
};

export default function Box({
  component,
  utilities,
  children,
  className = "",
  ...rest
}) {
  // const variants = {
  //   "outline-button":
  //     "lg:pt-[20px] lg:flex lg:flex-col lg:gap-[15px] lg:text-[#0b2330]",
  //   card: "lg:grid lg:grid-cols-1 lg:grid-rows-1 lg:gap-[10px] lg:w-[294px]",
  //   "template-card":
  //     "lg:bg-[#fbfbf9] lg:p-[20px] lg:border-[1px] lg:border-solid lg:flex lg:items-center lg:justify-center lg:max-h-[200px] lg:h-[100%] lg:max-w-[294px] lg:w-[294px]",
  //   "sharing-link":
  //     "lg:flex lg:flex-row lg:items-center lg:gap-x-[5px] lg:w-[294px]",
  // };
  // const buttonClass = variants[variant] || variants["variant0"];

  const validContainerElements = [
    "div",
    "span",
    "p",
    "header",
    "footer",
    "main",
    "article",
    "section",
    "nav",
    "aside",
  ];

  const Component = validContainerElements.includes(component)
    ? component
    : "div";

  return (
    <Component className={twMerge(utilities, className)} {...rest}>
      {children}
    </Component>
  );
}
