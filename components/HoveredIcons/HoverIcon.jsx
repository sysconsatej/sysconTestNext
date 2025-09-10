import React, { useState } from "react";
import { IconButton } from "@mui/material";
import Image from "next/image";
import LightTooltip from "@/components/Tooltip/customToolTip";
import PropTypes from "prop-types";

// Custom Icon component that handles hover state
const HoverIcon = ({
  defaultIcon,
  hoverIcon,
  altText,
  onClick,
  title,
  className,
  isDisabled,
}) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <LightTooltip title={isDisabled ? `${title} (disabled)` : title}>
      <IconButton
        aria-label={altText}
        className={className}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onClick={onClick}
        disabled={isDisabled}
      >
        <Image
          src={isHovered ? hoverIcon : defaultIcon}
          alt={altText}
          priority={false}
          className="gridIcons2"
        />
      </IconButton>
    </LightTooltip>
  );
};

HoverIcon.propTypes = {
  defaultIcon: PropTypes.any,
  hoverIcon: PropTypes.any,
  altText: PropTypes.any,
  onClick: PropTypes.any,
  title: PropTypes.any,
  className: PropTypes.any,
  isDisabled: PropTypes.any,
};
export default HoverIcon;
