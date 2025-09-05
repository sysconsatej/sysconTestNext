import React, { useState } from "react";
import { IconButton } from "@mui/material";
import Image from "next/image";
import styles from "@/components/common.module.css"; // Your CSS module
import LightTooltip from "@/components/Tooltip/customToolTip";
import PropTypes from "prop-types";

// Custom Icon component that handles hover state
const GridHoverIcon = ({
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
    <LightTooltip title={isDisabled ? `${title} disabled ` : title}>
      <span className={isDisabled ? ` ${styles.disabledButton} ` : ""}>
        <IconButton
          aria-label={altText}
          className={className}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          onClick={onClick}
          disabled={isDisabled}
          sx={{paddingTop: "0px", paddingBottom: "0px"}}
        >
          <Image
            src={isHovered ? hoverIcon : defaultIcon}
            alt={altText}
            priority={true}
            className="gridIcons2"
          />
        </IconButton>
      </span>
    </LightTooltip>
  );
};

GridHoverIcon.propTypes = {
  defaultIcon: PropTypes.any,
  hoverIcon: PropTypes.any,
  altText: PropTypes.any,
  onClick: PropTypes.any,
  title: PropTypes.any,
  className: PropTypes.any,
  isDisabled: PropTypes.any,
};
export default GridHoverIcon;
