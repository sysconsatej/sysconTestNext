import React, { useState, useRef, useEffect } from "react";
import { twMerge } from "tailwind-merge";
import PropTypes from "prop-types";

const useOutsideClick = (ref, callback) => {
  const handleClickOutside = (event) => {
    if (ref.current && !ref.current.contains(event.target)) {
      // callback();
    }
  };

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [ref, callback]);
};

Dropdown.propTypes = {
  variant: PropTypes.string,
  utilities: PropTypes.string,
  children: PropTypes.node,
  className: PropTypes.string,
  closeOnClickOutside: PropTypes.bool,
  isEnlarge: PropTypes.bool,
};

export default function Dropdown({
  variant,
  utilities,
  isEnlarge,
  children,
  className = "",
  closeOnClickOutside = true,
  ...rest
}) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const handleDropdownClick = () => {
    setIsOpen(!isOpen);
  };

  useOutsideClick(dropdownRef, closeOnClickOutside ? undefined : undefined);

  const childrenWithProps = React.Children.map(children, (child) => {
    return React.createElement(child.type, {
      isOpen,
      handleDropdownClick,
      ...child.props,
    });
  });

  const variants = {};
  const buttonClass = variants[variant] || variants["variant0"];

  return (
    <div
      ref={dropdownRef}
      className={twMerge(
        ` relative ${isEnlarge ? "w-[210px]" : "w-auto"}`,
        buttonClass,
        utilities,
        className
      )}
      {...rest}
    >
      {childrenWithProps}
    </div>
  );
}

// ${isEnlarge?'w-[220px]':'w-[80px]'}
