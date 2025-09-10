export const fontFamilyStyles = "Lato !important";

//  display table and createform styles
export const displayTablePaperStyles = {
  width: "100%",
  overflow: "hidden",
  height: "calc(100vh - 140px)",

  position: "relative",
};

export const customWidthCheckBoxGridStyle = {
  width: "6rem",
  whiteSpace: "nowrap",
};
export const customWidthTextGridStyle = {
  width: "9rem",
  whiteSpace: "nowrap",
};

export const displayTableContainerStyles = {
  height: "calc(100vh - 140px)",
  overflow: "auto",
  backgroundColor: "var(--tableRowBg)",
};

export const displaytableHeadStyles = {
  ".MuiTableCell-root": {
    height: "30px",
    padding: "0 15px",
    fontSize: "var(--tableHeaderFontSize)",
    fontWeight: "var(--tableHeaderFontWeight)",
    textTransform: "capitalize",
    // background: "#0766AD",
    background: "var(--tableHeaderBg)",
    zIndex: 12,
    color: "var(--tableHeaderTextColor)",
  },
  // "& .MuiTableRow-root th:first-child": {
  //   borderTopLeftRadius: "4px",
  // },
  "& .MuiTableRow-root th:first-of-type": {
    borderTopLeftRadius: "4px",
  },
  "& .MuiTableRow-root th:last-child": {
    borderTopRightRadius: "4px",
  },
};

export const displaytableRowStyles = {
  ".MuiTableCell-root": {
    padding: "0 15px",
    fontSize: "var(--tableRowFontSize)",
    fontWeight: "var(--tableRowFontWeight)",
    color: "var(--tableRowTextColor)",
  },
  "&.MuiTableRow-root:hover": {
    backgroundColor: "var(--tableRowBgHover)", // Ensure this is not overridden elsewhere
  },
  "&.MuiTableRow-root": {
    backgroundColor: "var(--tableRowBg)",
  },
  height: "25px",
};

export const displayTableRowStylesNoHover = {
  ".MuiTableCell-root": {
    padding: "0 15px",
    fontSize: "var(--tableRowFontSize)",
    fontWeight: "var(--tableRowFontWeight)",
    color: "var(--tableRowTextColor)",
  },
  "&.MuiTableRow-root:hover": {
    backgroundColor: "var(--tableRowBgHover)", // Ensure this is not overridden elsewhere
    color: "black", // Change text color to black on hover
    ".MuiTableCell-root": {
      color: "black", // Ensure cell text color is also black on hover
    },
  },
  "&.MuiTableRow-root": {
    backgroundColor: "var(--tableRowBg)",
  },
  height: "25px",
};

// added Code Aakash-y

export const displaytableRowStyles_two = () => {
  return {
    ".MuiTableCell-root": {
      padding: "0 15px",
      fontSize: "var(--tableRowFontSize)",
      fontWeight: "var(--tableRowFontWeight)",
      color: "var(--tableRowTextColor)",
    },
    "&.MuiTableRow-root:hover": {
      backgroundColor: "var(--tableRowBgHover)", // Ensure this is not overridden elsewhere
    },
    "&.MuiTableRow-root:hover .MuiTableCell-root": {
      color: "var(--tableRowTextColorHover)",
    },
    "&.MuiTableRow-root": {
      backgroundColor: "var(--tableRowBg)",
    },
    height: "25px",
  };
};

//  code ends here

export const formChildTableRowStyles = {
  "&.MuiTableHead-root": {
    backgroundColor: "red",
  },
  "&.MuiTableRow-root": {
    backgroundColor: "var(--tableRowBg)",
  },
  "&.MuiTableRow-root:hover": {
    backgroundColor: "var(--tableRowBgHover)", // Ensure this is not overridden elsewhere
  },
  "&.MuiTableRow-root .MuiTableCell-root": {
    fontSize: "var(--tableRowFontSize)",
    fontWeight: "var(--tableRowFontWeight)",
    color: "var(--tableRowTextColor)",
  },
  "&.MuiTableRow-root:hover .MuiTableCell-root": {
    color: "var(--tableRowTextColorHover)",
  },
};

//advance search styles
export const dropDownStyleCSS2 = ({ fieldname, isFocused4, value }) => {
  // console.log('isfocusee =========================== ', isFocused4)
  // console.log('value =================================', value)
  // if (fieldname == "selectedHeader") {
  //   console.log(
  //     `${fieldname} =================`,
  //     isFocused4
  //       ? "5px"
  //       : fieldname?.length > 0 && value?.length > 0
  //         ? "5px"
  //         : fieldname?.length > 0 && value?.length === 0
  //           ? "-2px"
  //           : "-2px"
  //   );
  // }
  return {
    width: "12rem",
    height: "27px",
    "& .MuiFormLabel-root": {
      fontWeight: "var(--inputFontWeight)",
      fontSize: "var(--inputFontSize)",
    },
    "& label.Mui-focused": {
      color: "#A0AAB4",
    },
    "& .MuiInput-underline:after": {
      borderBottomColor: "#B2BAC2",
    },
    "& .MuiOutlinedInput-root": {
      height: "27px",
      width: "12rem",
      "& fieldset": {
        borderColor: "var(--inputBorderColor)",
      },
      "&:hover fieldset": {
        borderColor: "var(--inputBorderHoverColor)",
      },
      "&.Mui-focused fieldset": {
        borderColor: "var(--inputBorderHoverColor)",
      },
    },

    "& .MuiAutocomplete-input ": {
      minWidth: "75% !important",
      // width:'auto',
      fontSize: "10px",
      position: "absolute",
      top: "4px",
    },
    // "& .MuiInputLabel-root": {
    //   // fontSize: "0.8rem",
    //   lineHeight: "auto",
    //   position: "absolute",
    //   // top: "-1px",
    //   top: isFocused || fieldname ? "5px" : "-2px",
    //   //  top: isFocused ? "5px" : "-2px",

    //   // color: isFocused ? "red" : "green",
    // },
    "& .MuiInputLabel-root": {
      // fontSize: "0.8rem",
      lineHeight: "auto",
      position: "absolute",
      top: isFocused4
        ? "5px"
        : fieldname?.length > 0 && value?.length > 0
        ? "5px"
        : fieldname?.length > 0 && value?.length === 0
        ? "-2px"
        : "-2px",
    },
    "& .MuiAutocomplete-input": {
      position: "absolute",
      top: fieldname ? "4px" : "5px",
    },
  };
};

export const dropDownStyleCSS3 = ({ fieldname, isFocused3, value }) => {
  // console.log('isFocused3', isFocused3)
  // console.log('value', value)
  // console.log('length', fieldname?.length, value?.length)
  // if (fieldname == "selectedOption") {
  //   console.log(
  //     `${fieldname}`,
  //     isFocused3
  //       ? "5px"
  //       : fieldname?.length > 0 && value?.length > 0
  //         ? "5px"
  //         : fieldname?.length > 0 && value?.length === 0
  //           ? "-2px"
  //           : "-9px value empyty"
  //   );
  // }
  return {
    width: "12rem",
    height: "27px",
    "& .MuiFormLabel-root": {
      fontWeight: "var(--inputFontWeight)",
      fontSize: "var(--inputFontSize)",
    },
    "& label.Mui-focused": {
      color: "#A0AAB4",
    },
    "& .MuiInput-underline:after": {
      borderBottomColor: "#B2BAC2",
    },
    "& .MuiOutlinedInput-root": {
      height: "27px",
      width: "12rem",
      "& fieldset": {
        borderColor: "var(--inputBorderColor)",
      },
      "&:hover fieldset": {
        borderColor: "var(--inputBorderHoverColor)",
      },
      "&.Mui-focused fieldset": {
        borderColor: "var(--inputBorderHoverColor)",
      },
    },

    "& .MuiAutocomplete-input ": {
      minWidth: "75% !important",
      // width:'auto',
      fontSize: "10px",
      position: "absolute",
      top: "4px",
    },
    // "& .MuiInputLabel-root": {
    //   // fontSize: "0.8rem",
    //   lineHeight: "auto",
    //   position: "absolute",
    //   // top: "-1px",
    //   top: isFocused || fieldname ? "5px" : "-2px",
    //   //  top: isFocused ? "5px" : "-2px",

    //   // color: isFocused ? "red" : "green",
    // },
    "& .MuiInputLabel-root": {
      // fontSize: "0.8rem",
      position: "absolute",
      top: isFocused3
        ? "5px"
        : fieldname?.length > 0 && value?.length > 0
        ? "5px"
        : fieldname?.length > 0 && value?.length === 0
        ? "-2px"
        : "-9px",

      // top: isFocused3 ? '5px' : '-10px'
    },
    "& .MuiAutocomplete-input": {
      position: "absolute",
      top: fieldname ? "-1px" : "0px",
    },
  };
};

export const textInputStyle2 = () => {
  // console.log("isFocused2 : : : :", isFocused2);
  // console.log('fieldname : : : :', fieldname);
  // console.log('active Index' , index)
  return {
    width: "12rem",
    "& label": {
      // color: "#A0AAB4",
      color: "var(--table-text-color) !important",
    },
    "& .MuiFormLabel-root": {
      fontWeight: "var(--inputFontWeight)",
      fontSize: "var(--inputFontSize)",
    },
    "& label.Mui-focused": {
      // color: "#A0AAB4",
      color: "var(--table-text-color) !important",
    },
    "& .MuiInput-underline:after": {
      borderBottomColor: "#B2BAC2",
    },
    "& .MuiOutlinedInput-root": {
      backgroundColor: "var(--page-bg-color)",
      "& fieldset": {
        borderColor: "var(--inputBorderColor)",
      },
      "&:hover fieldset": {
        borderColor: "var(--inputBorderHoverColor)",
      },
      "&.Mui-focused fieldset": {
        borderColor: "var(--inputBorderHoverColor)",
      },
    },
    "& .MuiInputBase-input": {
      fontSize: "10px",
      marginLeft: "15px",
      color: "var(--table-text-color) !important",
    },
    "& .MuiOutlinedInput-input": {
      padding: 0,
      height: "27px",
      width: "12rem",
    },

    "& .MuiInputLabel-root": {
      position: "absolute",
      // top: "4px",
      top: "0px",
      // color: "red"
      color: "var(--table-text-color) !important",

      // paddingLeft: "4px",
    },
  };
};

export const customDatePickerStyleCss22 = ({ isFocused }) => {
  // console.log('fromDate',fieldname)
  // console.log('toDate',fieldname)
  // console.log('dateFOcused000', isFocused)
  // if (fieldname == "ToDate" || fieldname == "FromDate") {
  //   console.log("value", value, isFocused);
  //   // console.log(`${fieldname} : : : :`, isFocused ? "5px" : fieldname?.length > 0 && value?.length > 0 ? "5px" : fieldname?.length > 0 && value?.length === 0 ? "-9px" : "-9px")
  //   console.log(`${fieldname} : : : :`, isFocused ? "-9px" : "-10px");

  // }
  // console.log('form date fieldName', fieldname)
  // console.log('from date value', value)

  return {
    width: "12rem",
    "& label": {
      // color: "#A0AAB4",
      color: "var(--table-text-color) !important",
    },
    "& label.Mui-focused": {
      // color: "#A0AAB4",
      color: "var(--table-text-color) !important",
    },

    "& .MuiInputBase-input": {
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      // position:'absolute',
      // top: isFocused ? "4px" : "-9px",
      // marginTop: fieldname ? "0px" : "3px",
      fontSize: "10px",
    },
    "& .MuiOutlinedInput-root": {
      backgroundColor: "var(--inputBg)",
      height: "27px",
      width: "12rem",
      "& fieldset": {
        borderColor: "var(--inputBorderColor)",
      },
      "&:hover fieldset": {
        borderColor: "var(--inputBorderHoverColor)",
      },
      "&.Mui-focused fieldset": {
        borderColor: "var(--inputBorderColor)",
      },
    },
    "& .MuiInputLabel-root": {
      fontSize: "10px",
      position: "absolute",
      // color: `${isFocused ? "red" : "green"}`,
      // top: isFocused ? "5px" : fieldname?.length > 0 && value?.length > 0 ? "5px" : fieldname?.length > 0 && value?.length === 0 ? "-9px" : "-9px",
      // top: isFocused4 || fieldname ? "-5px" : "-10px",
      // top: isFocused
      //   ? value?.length > 0
      //     ? value?.length === 0
      //       ? "5px"
      //       : "-9px"
      //     : "-9px"
      //   : "-10px",
      top: isFocused ? "3px" : "-10px",
    },
    "& .MuiSvgIcon-root": {
      color: "var(--table-text-color) !important",
    },
  };
};

export const customDatePickerStyleCss23 = ({ isFocused5 }) => {
  // console.log('fromDate',fieldname)
  // console.log('toDate',fieldname)
  // console.log('dateFOcused000', isFocused)
  // if (fieldname == "ToDate" || fieldname == "FromDate") {
  //   console.log("value", value, isFocused);
  //   // console.log(`${fieldname} : : : :`, isFocused ? "5px" : fieldname?.length > 0 && value?.length > 0 ? "5px" : fieldname?.length > 0 && value?.length === 0 ? "-9px" : "-9px")
  //   console.log(`${fieldname} : : : :`, isFocused ? "-9px" : "-10px");

  // }

  return {
    width: "12rem",
    "& label": {
      // color: "#A0AAB4",
      color: "var(--table-text-color) !important",
    },
    "& label.Mui-focused": {
      // color: "#A0AAB4",
      color: "var(--table-text-color) !important",
    },

    "& .MuiInputBase-input": {
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      // position:'absolute',
      // top: isFocused ? "4px" : "-9px",
      // marginTop: fieldname ? "0px" : "3px",
      fontSize: "10px",
    },
    "& .MuiOutlinedInput-root": {
      backgroundColor: "var(--inputBg)",
      height: "27px",
      width: "12rem",
      "& fieldset": {
        borderColor: "var(--inputBorderColor)",
      },
      "&:hover fieldset": {
        borderColor: "var(--inputBorderHoverColor)",
      },
      "&.Mui-focused fieldset": {
        borderColor: "var(--inputBorderHoverColor)",
      },
    },
    "& .MuiInputLabel-root": {
      fontSize: "10px",
      position: "absolute",
      // color: `${isFocused ? "red" : "green"}`,
      // top: isFocused ? "5px" : fieldname?.length > 0 && value?.length > 0 ? "5px" : fieldname?.length > 0 && value?.length === 0 ? "-9px" : "-9px",
      // top: isFocused4 || fieldname ? "-5px" : "-10px",
      // top: isFocused
      //   ? value?.length > 0
      //     ? value?.length === 0
      //       ? "5px"
      //       : "-9px"
      //     : "-9px"
      //   : "-10px",
      top: isFocused5 ? "3px" : "-10px",
    },
    "& .MuiSvgIcon-root": {
      color: "var(--table-text-color) !important",
    },
  };
};

// inputs styling
export const customTextFieldStyles = {
  "& .MuiFormLabel-root": {
    fontSize: "var(--inputFontSize) !important",
    fontWeight: "var(--inputFontWeight)",
  },
  "& .MuiInputBase-input": {
    color: "var(--inputTextColor) !important",
    fontSize: "var(--inputFontSize)",
    fontWeight: "var(--inputFontWeight)",
  },
  "& .MuiInputBase-input.Mui-disabled": {
    "-webkit-text-fill-color": "var(--inputTextColor) ",
    opacity: "0.7",
  },
  "& label.Mui-focused": {
    // color: "#A0AAB4",
    color: "var(--table-text-color) !important",
  },
  "& label": {
    // color: "#A0AAB4",
    color: "var(--table-text-color) !important",
  },
  "& .MuiInput-underline:after": {
    borderBottomColor: "#B2BAC2",
  },
  "& .MuiOutlinedInput-root": {
    "& fieldset": {
      borderColor: "var(--inputBorderColor)",
    },
    "&:hover fieldset": {
      borderColor: "var(--inputBorderHoverColor)",
    },
    "&.Mui-focused fieldset": {
      borderColor: "var(--inputBorderHoverColor)",
    },
    "&.Mui-disabled fieldset": {
      borderColor: "#B2BAC2",
    },
  },
};

export const dropDownStyleCSS = ({ isFocused }) => {
  // if (fieldname == 'selectedHeader') {
  //   console.log("value", fieldname, isFocused, value)
  //   console.log('fieldname 3', isFocused ? "5px" : fieldname?.length > 0 && value?.length > 0 ? "5px" : fieldname?.length > 0 && value?.length === 0 ? "-2px" : "-2px")

  // }

  // if(fieldname=='Department'){
  // console.log('fieldanem',fieldname)
  // }
  // console.log("dropDOwnFIeldName", fieldname);
  // console.log(isFocused || fieldname == "dropdown" ? "5px" : "-2px");

  // const topValue = isFocused || fieldname ? "5px" : "-2px";

  return {
    width: "12rem",
    height: "27px",
    "& .MuiFormLabel-root": {
      fontWeight: "var(--inputFontWeight)",
      fontSize: "var(--inputFontSize)",
    },
    "& label.Mui-focused": {
      color: "#A0AAB4",
    },
    "& .MuiInput-underline:after": {
      borderBottomColor: "#B2BAC2",
    },
    "& .MuiOutlinedInput-root": {
      height: "27px",
      width: "12rem",

      "& fieldset": {
        borderColor: "var(--inputBorderColor)",
      },
      "&:hover fieldset": {
        borderColor: "var(--inputBorderHoverColor)",
      },
      "&.Mui-focused fieldset": {
        borderColor: "var(--inputBorderHoverColor)",
      },
    },

    "& .MuiAutocomplete-input ": {
      width: "75% !important",
      // width:'auto',
      fontSize: "10px",
      position: "absolute",
      top: "5px",
    },
    "& .MuiInputLabel-root": {
      // fontSize: "0.8rem",
      lineHeight: "auto",
      position: "absolute",
      // top: isFocused ? "5px" : fieldname?.length > 0 && value?.length > 0 ? "5px" : fieldname?.length > 0 && value?.length === 0 ? "-2px" : "-2px",
      top: isFocused ? "5px" : "-1px",
    },
    "& .MuiAutocomplete-endAdornment": {
      // position: "absolute",
      // top: "1px",
    },
  };
};

export const listboxStyles = {
  maxHeight: "250px",
  overflow: "auto !important",
  width: "100%",
  zIndex: "700 !important",
  fontSize: "10px",
  // position:'absolute',
};

export const customDataPickerStyleCss = ({ fieldname, isFocused }) => {
  return {
    width: "12rem",
    "& .MuiFormLabel-root": {
      fontSize: "var(--inputFontSize)",
      fontWeight: "var(--inputFontWeight)",
    },
    "& label": {
      // color: "#A0AAB4",
      color: "var(--table-text-color) !important",
    },
    "& label.Mui-focused": {
      // color: "#A0AAB4",
      color: "var(--table-text-color) !important",
    },
    "& .MuiInput-underline:after": {
      borderBottomColor: "#B2BAC2",
    },
    "& .MuiOutlinedInput-root": {
      backgroundColor: "var(--inputBg)",
      height: "27px",
      width: "12rem",
      "& fieldset": {
        borderColor: "var(--inputBorderColor)",
      },
      "&:hover fieldset": {
        borderColor: "var(--inputBorderHoverColor)",
      },
      "&.Mui-focused fieldset": {
        borderColor: "var(--inputBorderHoverColor)",
      },
    },
    "& .MuiInputBase-input": {
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      marginTop: fieldname ? "0px" : "3px",
      color: "var(--inputTextColor) !important",
      fontSize: "var(--inputFontSize)",
      fontWeight: "var(--inputFontWeight)",
    },
    "& .MuiInputLabel-root": {
      fontSize: "var(--inputFontSize)",
      fontWeight: "var(--inputFontWeight)",
      position: "absolute",
      top: isFocused || fieldname ? "3px" : "-10px",
    },
    "& .MuiInputLabel-root.MuiInputLabel-shrink":{
      transform: 'translate(14px, -9px) scale(1)',
    },
    "& .MuiSvgIcon-root": {
      color: "var(--table-text-color) !important",
    },
  };
};

export const customDataPickerStyleCssForStaticPage = ({ fieldname, isFocused }) => {
  return {
    width: "10rem",
    "& .MuiFormLabel-root": {
      fontSize: "var(--inputFontSize)",
      fontWeight: "var(--inputFontWeight)",
    },
    "& label": {
      // color: "#A0AAB4",
      color: "var(--table-text-color) !important",
    },
    "& label.Mui-focused": {
      // color: "#A0AAB4",
      color: "var(--table-text-color) !important",
    },
    "& .MuiInput-underline:after": {
      borderBottomColor: "#B2BAC2",
    },
    "& .MuiOutlinedInput-root": {
      backgroundColor: "var(--inputBg)",
      height: "27px",
      width: "10rem",
      "& fieldset": {
        borderColor: "var(--inputBorderColor)",
      },
      "&:hover fieldset": {
        borderColor: "var(--inputBorderHoverColor)",
      },
      "&.Mui-focused fieldset": {
        borderColor: "var(--inputBorderHoverColor)",
      },
    },
    "& .MuiInputBase-input": {
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      marginTop: fieldname ? "0px" : "3px",
      color: "var(--inputTextColor) !important",
      fontSize: "var(--inputFontSize)",
      fontWeight: "var(--inputFontWeight)",
    },
    "& .MuiInputLabel-root": {
      fontSize: "var(--inputFontSize)",
      fontWeight: "var(--inputFontWeight)",
      position: "absolute",
      top: isFocused || fieldname ? "3px" : "-10px",
    },
    "& .MuiInputLabel-root.MuiInputLabel-shrink":{
      transform: 'translate(14px, -9px) scale(1)',
    },
    "& .MuiSvgIcon-root": {
      color: "var(--table-text-color) !important",
    },
  };
};

export const customTimePickerStyleCss = ({ fieldname, isFocused }) => {
  return {
    width: "12rem",
    "& .MuiInputBase-input": {
      fontSize: "10px",
      marginTop: fieldname ? "3px" : "0px",
      color: "var(--text-color-500)",
    },
    "& .MuiOutlinedInput-root": {
      backgroundColor: "var(--inputBg)",
      height: "27px",
      width: "12rem",
      "& fieldset": {
        borderColor: "var(--inputBorderColor)",
      },
      "&:hover fieldset": {
        borderColor: "var(--inputBorderHoverColor)",
      },
      "&.Mui-focused fieldset": {
        borderColor: "var(--inputBorderHoverColor)",
      },
    },
    "& .MuiInputLabel-root": {
      lineHeight: "20px",
      fontSize: "10px",
      position: "absolute",
      top: isFocused || fieldname ? "5px" : "-12px",
    },
    "& .MuiSvgIcon-root": {
      color: "var(--text-color-500)",
    },
  };
};

export const customDateTimePickerStyleCss = ({ fieldname, isFocused }) => {
  return {
    width: "12rem",
    "& .MuiFormLabel-root": {
      fontSize: "var(--inputFontSize) !important",
      fontWeight: "var(--inputFontWeight)",
    },
    "& label": {
      // color: "#A0AAB4",
      color: "var(--table-text-color) !important",
    },
    "& label.Mui-focused": {
      // color: "#A0AAB4",
      color: "var(--table-text-color) !important",
    },
    "& .MuiInput-underline:after": {
      borderBottomColor: "#B2BAC2",
    },
    "& .MuiOutlinedInput-root": {
      backgroundColor: "var(--inputBg)",
      height: "27px",
      width: "12rem",
      "& fieldset": {
        borderColor: "var(--inputBorderColor)",
      },
      "&:hover fieldset": {
        borderColor: "var(--inputBorderHoverColor)",
      },
      "&.Mui-focused fieldset": {
        borderColor: "var(--inputBorderHoverColor)",
      },
    },
    "& .MuiInputBase-input": {
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      marginTop: fieldname ? "0px" : "3px",
      fontSize: "10px !important",
      color: "var(--table-text-color) !important",
    },
    "& .MuiInputLabel-root": {
      lineHeight: "20px",
      fontSize: "0.8rem",
      position: "absolute",
      top: isFocused || fieldname ? "5px" : "-10px",
    },
    "& .MuiSvgIcon-root": {
      color: "var(--table-text-color) !important",
    },
  };
};

export const customDatePickerStyleCss2 = {
  width: "12rem",
  height: "27px",

  "& .MuiInputBase-input": {
    fontSize: "10px",
  },
  "& .MuiOutlinedInput-root": {
    height: "27px",
    width: "12rem",
  },
  "& .MuiInputLabel-root": {
    // marginBottom:'8px'
    // lineHeight: "20px",
    // fontSize: "0.8rem",

    // marginTop: "-6px",
    fontSize: "10px",
    position: "absolute",

    // top: isFocused || fieldname ? "0px" : "-10px",
  },
};

export const textAreaStyle = {
  // "& .MuiInputBase-input": { color: "black" },
  // height: "40px",
  width: "12rem",
  fontSize: "10px",
  color: "#A0AAB4",

  "& .MuiFormLabel-root": {
    fontSize: "var(--inputFontSize)",
    fontWeight: "var(--inputFontWeight)",
  },
  "& label.Mui-focused": {
    color: "#A0AAB4",
  },
  "& .MuiInput-underline:after": {
    borderBottomColor: "#B2BAC2",
  },
  "& .MuiOutlinedInput-root": {
    "& fieldset": {
      borderColor: "var(--inputBorderColor)",
    },
    "&:hover fieldset": {
      borderColor: "var(--inputBorderHoverColor)",
    },
    "&.Mui-focused fieldset": {
      borderColor: "var(--inputBorderHoverColor)",
    },
  },
  "& .MuiInputBase-input": {
    fontSize: "10px",
    marginLeft: "15px",
  },
  "& .MuiOutlinedInput-input": {
    padding: 0,
    height: "27px",
    width: "12rem",
  },
};

export const fileInputStyle = {
  justifyContent: "flex-start",
  borderColor: "#00000029",
  color: "#00000099",
  "& .MuiInputBase-input": { color: "black" },
  height: "27px",
  width: "12rem",
  ".MuiButtonBase-root-MuiButton-root": {
    justifyContent: "flex-start",
  },
};

export const textInputStyle = ({ fieldname, isFocused }) => {
  // console.log("fieldname", fieldname, "check", isFocused || fieldname || fieldname?.length > 0 ? "5px" : "-2px");
  return {
    width: "12rem",
    "& .MuiFormLabel-root": {
      fontWeight: "var(--inputFontWeight)",
      fontSize: "var(--inputFontSize)",
      color: "var(--table-text-color)",
    },
    "& label.Mui-focused": {
      // color: "var(--text-color-500)",
      color: "var(--table-text-color)",
    },
    "& .MuiInput-underline:after": {
      borderBottomColor: "#B2BAC2",
    },
    "& .MuiOutlinedInput-root": {
      backgroundColor: "var(--inputBg)",
      "& fieldset": {
        borderColor: "var(--inputBorderColor)",
      },
      "&:hover fieldset": {
        borderColor: "var(--inputBorderHoverColor)",
      },
      "&.Mui-focused fieldset": {
        borderColor: "var(--inputBorderHoverColor)",
      },
    },
    "& .MuiInputBase-input": {
      fontSize: "10px",
      marginLeft: "15px",
      marginRight: "15px",
      color: "var(--table-text-color)",
      backgroundColor: "var(--inputBg)",
    },
    "& .MuiOutlinedInput-input": {
      padding: 0,
      height: "27px",
      width: "12rem",
      // width: "calc(100% - 30px)"
    },

    "& .MuiInputLabel-root": {
      position: "absolute",
      color: "var(--inputTextColor)",
      fontWeight: "var(--inputFontWeight)",
      top: isFocused || (fieldname && fieldname?.length > 0) ? "3px" : "-2px",
    },
    "& .MuiInputLabel-root.MuiInputLabel-shrink":{
      top: "4px",
      transform: 'translate(14px, -9px) scale(1)',
    }
  };
};

export const textInputStyleForStaticPage = ({ fieldname, isFocused }) => {
  // console.log("fieldname", fieldname, "check", isFocused || fieldname || fieldname?.length > 0 ? "5px" : "-2px");
  return {
    width: "10rem",
    "& .MuiFormLabel-root": {
      fontWeight: "var(--inputFontWeight)",
      fontSize: "var(--inputFontSize)",
      color: "var(--table-text-color)",
    },
    "& label.Mui-focused": {
      // color: "var(--text-color-500)",
      color: "var(--table-text-color)",
    },
    "& .MuiInput-underline:after": {
      borderBottomColor: "#B2BAC2",
    },
    "& .MuiOutlinedInput-root": {
      backgroundColor: "var(--inputBg)",
      "& fieldset": {
        borderColor: "var(--inputBorderColor)",
      },
      "&:hover fieldset": {
        borderColor: "var(--inputBorderHoverColor)",
      },
      "&.Mui-focused fieldset": {
        borderColor: "var(--inputBorderHoverColor)",
      },
    },
    "& .MuiInputBase-input": {
      fontSize: "10px",
      marginLeft: "15px",
      marginRight: "15px",
      color: "var(--table-text-color)",
      backgroundColor: "var(--inputBg)",
    },
    "& .MuiOutlinedInput-input": {
      padding: 0,
      height: "27px",
      width: "10rem",
      // width: "calc(100% - 30px)"
    },

    "& .MuiInputLabel-root": {
      position: "absolute",
      color: "var(--inputTextColor)",
      fontWeight: "var(--inputFontWeight)",
      top: isFocused || (fieldname && fieldname?.length > 0) ? "3px" : "-2px",
    },
    "& .MuiInputLabel-root.MuiInputLabel-shrink":{
      top: "4px",
      transform: 'translate(14px, -9px) scale(1)',
    }
  };
};

export const numberInputStyle = ({ fieldname, isFocused }) => {
  return {
    width: "12rem",
    // "& .MuiInputBase-input": { fontSize: "0.9rem" },
    "& .MuiInputBase-input": {
      fontSize: "var(--inputFontSize)",
      marginX: "15px",
      color: "var(--inputTextColor)",
      backgroundColor: "var(--inputBg)",
    },
    "& .MuiOutlinedInput-root": {
      backgroundColor: "var(--inputBg)",
    },
    "& .MuiOutlinedInput-input": {
      backgroundColor: "var(--inputBg)",
      padding: 0,
      height: "27px",
      width: "12rem",
    },
    "& .MuiInputLabel-root": {
      position: "absolute",
      top: isFocused || fieldname ? "3px" : "-2px",
      paddingLeft: "4px",
    },
    "& .MuiInputLabel-root.MuiInputLabel-shrink":{
      transform: 'translate(14px, -9px) scale(1)',
    }
  };
};

export const numberInputStyleForStaticPage = ({ fieldname, isFocused }) => {
  return {
    width: "10rem",
    // "& .MuiInputBase-input": { fontSize: "0.9rem" },
    "& .MuiInputBase-input": {
      fontSize: "var(--inputFontSize)",
      marginX: "15px",
      color: "var(--inputTextColor)",
      backgroundColor: "var(--inputBg)",
    },
    "& .MuiOutlinedInput-root": {
      backgroundColor: "var(--inputBg)",
    },
    "& .MuiOutlinedInput-input": {
      backgroundColor: "var(--inputBg)",
      padding: 0,
      height: "27px",
      width: "10rem",
    },
    "& .MuiInputLabel-root": {
      position: "absolute",
      top: isFocused || fieldname ? "3px" : "-2px",
      paddingLeft: "4px",
    },
    "& .MuiInputLabel-root.MuiInputLabel-shrink":{
      transform: 'translate(14px, -9px) scale(1)',
    }
  };
};

export const customRadioCheckBoxStyle =
  "relative flex items-center  border-gray-300  w-[12rem] text-[10px] border";
  export const customRadioCheckBoxStyleForStaticPage =
  "relative flex items-center  border-gray-300  w-[10rem] text-[10px] border";

export const checkBoxStyle = {
  height: "27px",

  "&.MuiCheckbox-root": {
    color: "var(--table-text-color)", // This sets the color of the border (which is the unchecked state icon color)
    "&:hover": {
      backgroundColor: "transparent", // Optional: handle hover state background
    },
  },
  // Style when checked
  "&.Mui-checked": {
    color: "#0766AD",
    borderColor: "white", // If you want to retain or change the border color when checked
  },

  "& .MuiSvgIcon-root": {
    height: "14px",
    width: "14px",
  },
};

export const multiCheckBoxStyle = {
  height: "27px",
  // width: "12rem",

  "&.MuiCheckbox-root": {
    color: "var(--table-text-color)", // This sets the color of the border (which is the unchecked state icon color)
    "&:hover": {
      backgroundColor: "transparent", // Optional: handle hover state background
    },
  },
  // Style when checked
  "&.Mui-checked": {
    color: "#0766AD",
    borderColor: "white", // If you want to retain or change the border color when checked
  },
  "& .MuiSvgIcon-root": {
    height: "14px",
    width: "14px",
  },
};

export const radioGroupStyle = {
  //   height: "27px",
  width: "12rem",
  "& .MuiFormLabel-root": {
    fontWeight: "var(--inputFontWeight)",
    fontSize: "var(--inputFontSize) !important",
  },
  "& .MuiFormControlLabel-label": { fontSize: "20px" },

  "& .MuiSvgIcon-root": {
    height: "14px",
    width: "14px",
  },
  "& .MuiTypography-root": {
    fontSize: "var(--inputFontSize) !important",
  },

  "& .MuiRadioGroup-root": {
    color: "var(--table-text-color)", // This sets the color of the border (which is the unchecked state icon color)
    "&:hover": {
      backgroundColor: "transparent", // Optional: handle hover state background
    },
  },
};
export const radioControlStyle = {
  //   height: "27px",
  height: "24px",
  color: "var(--inputTextColor)",

  "&.Mui-checked": {
    color: "var(--inputTextColor)",
    borderColor: "white", // If you want to retain or change the border color when checked
  },
  "&.MuiRadio-root": {
    "&:hover": {
      backgroundColor: "transparent", // Optional: handle hover state background
    },
  },
};

export const multiSelectStyle = {
  // width: "306px",
  "& .MuiOutlinedInput-root": {
    height: "27px",
    width: "12rem",
  },
  "& .MuiAutocomplete-input ": {
    minWidth: "100% !important",
    // width:'auto',
    fontSize: "0.7rem",
    position: "absolute",
    top: "2px",
  },
  "& .MuiInputLabel-root": {
    fontSize: "10px",
    lineHeight: "auto",
    position: "absolute",
    top: "-1px",
  },
};

// Acordion styles
export const parentAccordionSection = {
  // backgroundColor: "#f9f9f9 !important",
  backgroundColor: "var(--accordionParentHeaderBg) !important",
  marginBottom: "6px",
  borderRadius: "4px",
  borderBottom: "1px solid var(--commonBg)",
  borderLeft: "0.5px solid var(--commonBg)",
  borderRight: "0.5px solid var(--commonBg)",
  color: "var(--accordionParentHeaderTextColor) !important",

  "& .MuiAccordionSummary-root": {
    minHeight: "0 !important",
    height: "27px !important",
  },
  "& .MuiPaper-root.MuiAccordion-root": {
    borderTopLeftRadius: "4px",
    borderTopRightRadius: "4px",
    borderBottomRightRadius: "4px",
    borderBottomLeftRadius: "4px",
    // marginTop: "10px !important",
    fontSize: "12px !important",
    width: "100% !important",
  },

  "& .MuiTypography-root": {
    fontSize: "var(--accordionParentHeaderFontSize)",
    fontWeight: "var(--accordionParentHeaderFontWeight)",
  },

  "& .MuiAccordion-root.Mui-expanded": {
    margin: "0px !important",
  },

  "& .MuiAccordionSummary-root .MuiSvgIcon-root": {
    color: "var(--accordionParentHeaderTextColor)",
  },
};

export const expandIconStyle = {
  color: "var(--accordion-summary-text-color) !important",
};

export const accordianDetailsStyleForm = {
  // backgroundColor: "white !important",
  backgroundColor: "var(--accordionBodyBg) !important",
  padding: "0 !important",
  paddingLeft: "8px !important",
  paddingTop: "2px !important",
};
export const accordianDetailsStyle = {
  // backgroundColor: "white !important",
  backgroundColor: "var(--accordionBodyBg) !important",
  padding: "0 !important",
  paddingLeft: "8px !important",
  paddingTop: "8px !important",
  paddingBottom: "8px !important",
};

export const childaccordianDetailsStyle = {
  // backgroundColor: "white !important",
  backgroundColor: "var(--accordionBodyBg) !important",
  padding: "0 !important",
  paddingLeft: "16px !important",
  paddingTop: "8px !important",
  paddingBottom: "8px !important",
};

export const childAccordionSection = {
  backgroundColor: "var(--accordionChildHeaderBg) !important",
  marginTop: "6px !important",
  borderRadius: "4px",
  "& .MuiAccordionSummary-root": {
    minHeight: "0 !important",
    height: "27px !important",
  },
  borderBottom: "1px solid var(--commonBg)",
  borderLeft: "0.5px solid var(--commonBg)",
  borderRight: "0.5px solid var(--commonBg)",

  "& .MuiPaper-root.MuiAccordion-root": {
    borderTopLeftRadius: "4px",
    borderTopRightRadius: "4px",
    borderBottomRightRadius: "4px",
    borderBottomLeftRadius: "4px",
    fontSize: "12px !important",
    width: "100% !important",
  },

  "& .MuiTypography-root": {
    color: "var(--accordionChildHeaderTextColor)",
    fontSize: "var(--accordionChildHeaderFontSize)",
    fontWeight: "var(--accordionChildHeaderFontWeight)",
  },

  "& .MuiFormControlLabel-root .MuiTypography-root": {
    color: "var(--inputTextColor)",
    fontSize: "var(--inputFontSize)",
    fontWeight: "var(--inputFontWeight)",
  },

  "& .MuiAccordion-root::before": {
    position: "static !important",
  },

  "& .MuiAccordionDetails-root": {
    background: "var(--accordionBodyBg) !important",
  },
  "& .MuiPaper-root-MuiAccordion-root::before ": {
    position: "static !important",
    height: "0px !important",
  },

  "& .MuiAccordionSummary-root .MuiSvgIcon-root": {
    color: "var(--accordionChildHeaderTextColor)",
  },
};

export const SummaryStyles = {
  "& .MuiAccordionSummary-root.Mui-expanded": {
    minWidth: "0px",
    height: "27px",
  },
};
//grid-Search Styling
export const createAddEditPaperStyles = {
  position: "absolute",
  fontSize: "10px",
  display: "flex",
  alignItems: "center",
  // width: "fit-content",
  border: "1px solid #d9d9d9",
  borderRadius: "5px",
  // height: "40px",
  boxShadow: "0px 0px 0px 0px",
  top: "30px",
  width: "12rem",
  height: "27px !important",
  left: "0px",
  backgroundColor: "var(--tableRowBg)",
};

export const searchInputStyling = {
  ml: 1,
  flex: 1,
  fontSize: "10px",
  color: "var(--tableRowTextColor)",
  backgroundColor: "var(--tableRowBg)",
};

// child & subchild Table Styling
export const childTableHeaderStyle = {
  minWidth: 0,
  whiteSpace: "nowrap",
  minHeight: "auto !important",
  height: "auto !important",
  // width: "auto !important",
  padding: "0 !important",
  // paddingLeft: "0.5 !important",
  color: "var(--tableHeaderTextColor)",

  fontSize: "var(--tableHeaderFontSize)",
  fontWeight: "var(--tableHeaderFontWeight)",
  // lineHeight: "10px",
  backgroundColor: "var(--tableHeaderBg)", // Ensure a solid background color
  position: "sticky", // Make sure it's sticky if it's not already from stickyHeader
  top: 0, // This ensures it sticks to the top
  opacity: 1,
  // zIndex: (theme) => theme.zIndex.appBar + 1, // Use a zIndex higher than the page content
  userSelect: "none", // Disable text selection
};

export const childTableRowStyles =
  "h-[25px] flex items-center text-[10px] w-max pr-4";

// navabr styling
export const navbarStyles =
  "relative mt-1 max-w-full bg-bgColor z-20 w-full px-0 my-0 py-0 border-0 ";

export const CompanyLogostyles1 =
  "mx-auto flex flex-row lg:flex-row items-center justify-between flex-nowrap text-blue-gray-900";

export const middleDataStyles =
  "flex flex-row w-full ml-auto mr-auto";

export const gridEditIconStyles = {
  color: "white",
  width: "18px !important",
  height: "18px !important",
  cursor: "pointer",
};

// attachments styles
export const mainContainer = "text-black flex items-center gap-[28px]";

export const uploadFIleContainer =
  "bg-[var(--accordion-summary-bg)] flex justify-center drop-shadow-xl rounded-[10px] items-center flex-col gap-[14px]";

export const fileImageStyles = "object-cover h-[70px] w-[70px]";

export const filePaperStyles =
  "bg-[var(--accordion-summary-bg)] z-0 w-[6rem] h-[6rem] flex justify-center items-center rounded-[10px] drop-shadow-xl";

export const fileContainer = "text-black flex flex-row z-0  flex-wrap  ";

export const gridSubChildIconStyles = {
  color: "#636363",
  width: "18px !important",
  height: "18px !important",
  cursor: "pointer",
  marginLeft: "8px",
};

//forgot password style
export const textInputStyle3 = () => {
  return {
    width: "100%",
    "& .MuiFormLabel-root": {
      fontWeight: "var(--inputFontWeight)",
      fontSize: "var(--inputFontSize)",
    },
    "& label.Mui-focused": {
      color: "#A0AAB4",
    },
    "& .MuiInput-underline:after": {
      borderBottomColor: "#B2BAC2",
    },
    "& .MuiOutlinedInput-root": {
      "& fieldset": {
        borderColor: "var(--inputBorderColor)",
      },
      "&:hover fieldset": {
        borderColor: "var(--inputBorderHoverColor)",
      },
      "&.Mui-focused fieldset": {
        borderColor: "var(--inputBorderHoverColor)",
      },
      "& .MuiInputBase-input": {
        fontSize: "10px",
        marginLeft: "15px", // Ensure this does not push the input too far, causing alignment issues.
      },
      "& .MuiOutlinedInput-input": {
        padding: 0,
        height: "27px",
        width: "calc(100% - 24px)", // Adjust width to compensate for icon space
      },
      "& .MuiInputAdornment-positionEnd": {
        marginRight: "-12px", // Adjust this value to better align the icon
      },
    },
    "& .MuiInputLabel-root": {
      position: "absolute",
      top: "0px",
    },
  };
};
//  display table and createform styles
export const displayReportTablePaperStyles = {
  width: "100%",
  overflow: "hidden",
  height: "calc(100vh - 29vh)",
  position: "relative",
  backgroundColor: "var(--page-bg-color)",
};

export const displayReportTableContainerStyles = {
  height: "calc(100vh - 29vh)",
  overflow: "auto",
};
export const displayReportTablePaperToggleStyles = {
  width: "100%",
  overflow: "hidden",
  height: "calc(90vh - 29vh)",
  position: "relative",
  backgroundColor: "var(--page-bg-color)",
};

export const displayReportTableContainerToggleStyles = {
  height: "calc(90vh - 29vh)",
  overflow: "auto",
};

export const menuListStyles = {
  maxHeight: "300px",
  overflowX: "hidden",
  overflowY: "scroll",
  width: "100%",
  fontSize: "10px",
  scrollbarColor: "#7e9bcf", // Set scrollbar color
  color: "var(--table-text-color)",
  "&::-webkit-scrollbar": {
    width: "0.6em",
    height: "0.6rem",
  },
  "&::-webkit-scrollbar-track": {
    // backgroundColor: "#ffffff",
    backgroundColor: "var(--accordionBodyBg)",
  },
  "&::-webkit-scrollbar-thumb": {
    backgroundColor: "var(--sidebarBg)",
    borderRadius: "10px",
    transition: "width 0.2s ease",
  },
  "&::-webkit-scrollbar-thumb:hover": {
    // cursor: 'pointer',
    backgroundColor: "#577dac",
  },
};

export const menuStyles = {
  backgroundColor: "var(--commonBg)",
  color: "var(--inputTextColor)",
  borderColor: "var(--inputBorderColor)", // Set the border color
  borderWidth: "1px", // Set the border width
  borderStyle: "solid", // Set the border style
  boxShadow: "none", // Optional: remove or modify the existing box-shadow if it interferes with the border visibility
};

export const advanceSearchPaperStyles = {
  width: "100%",
  fontSize: "10px",
  display: "flex",
  alignItems: "center",
  border: "1px solid #d9d9d9",
  borderRadius: "5px",
  boxShadow: "0px 0px 0px 0px",
  top: "30px",
  height: "27px !important",
  left: "0px",
  backgroundColor: "var(--page-bg-color)",
};

export const totalSumChildStyle = {
  padding: "0",
  lineHeight: "0",
  fontSize: "12px",
  backgroundColor: "#e0e0e0",
};

export const paginationStyle = {
  " .MuiPaginationItem-page.Mui-selected": {
    backgroundColor: "var(--buttonBg)",
    color: "var(--buttonTextColor)",
  },
  "& .MuiPaginationItem-page.Mui-selected:hover": {
    backgroundColor: "var(--buttonHoverBg)",
    color: "var(--buttonTextHoverColor)",
  },
};
export const textAreaLabelStyle = {
  position: "absolute",
  left: "12px", // Adjust based on your styling
  color: "var(--inputLabelTextColor)", // Placeholder text color
  background: "var(--inputBg)",
  paddingLeft: "4px",
  fontSize: "var(--inputFontSize)", // Match your textarea font size
  fontWeight: "var(--inputFontWeight)",
  pointerEvents: "none",
  transition: "top 0.3s ease-in-out", // Adding the transition effect
};

export const gridSectionStyles = {
  padding: "0",
  lineHeight: "0",
  fontSize: "10px",
  height: "25px !important",
};

export const uploadContainerStyle = {
  position: "relative",
  width: "6rem",
  height: "6rem",
  backgroundColor: "var(--accordion-summary-bg) !important",
};

export const pageTableCellInlineStyle = (scrollLeft, rowIndex) => {
  return {
    display: "flex",
    height: "20px",
    position: "absolute",
    right: `-${scrollLeft}px`,
    flexWrap: "wrap",
    justifyContent: "flex-end",
    alignItems: "center",
    marginTop: rowIndex ? "-13px" : "-10px",
    zIndex: "5",
    backgroundColor: "var(--table-hover-bg) ",
  };
};
