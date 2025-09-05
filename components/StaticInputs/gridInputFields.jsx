"use client";
import React, { useState, useRef, useEffect, useCallback } from "react";
import styles from "@/components/common.module.css";
import TextField from "@mui/material/TextField";
import { styled } from "@mui/material/styles";
import dayjs from "dayjs";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { TimePicker } from "@mui/x-date-pickers/TimePicker";
import { renderTimeViewClock } from "@mui/x-date-pickers/timeViewRenderers";
import { DateTimePicker } from "@mui/x-date-pickers/DateTimePicker";
import Radio from "@mui/material/Radio";
import RadioGroup from "@mui/material/RadioGroup";
import FormControlLabel from "@mui/material/FormControlLabel";
import Checkbox from "@mui/material/Checkbox";
import FormGroup from "@mui/material/FormGroup";
import * as formControlValidation from "@/helper/formControlValidation";
import PropTypes from "prop-types";
import LightTooltip from "../Tooltip/customToolTip";
import { TextareaAutosize } from "@mui/base/TextareaAutosize";
import Button from "@mui/material/Button";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import { dynamicDropDownFieldsData } from "@/services/auth/FormControl.services";
import {
  customDataPickerStyleCss,
  customDateTimePickerStyleCss,
  customTimePickerStyleCss,
  fileInputStyle,
  textInputStyle,
  numberInputStyle,
  checkBoxStyle,
  multiCheckBoxStyle,
  radioGroupStyle,
  customRadioCheckBoxStyle,
  customTextFieldStyles,
  customWidthCheckBoxGridStyle,
  customWidthTextGridStyle,
  menuListStyles,
  menuStyles,
} from "@/app/globalCss.js";
// import { withStyles } from "@mui/styles"; // or '@mui/material/styles' depending on your MUI version
import { debounce } from "@/helper/debounceFile";
import Select from "react-select";
import { components } from "react-select";

const VisuallyHiddenInput = styled("input")({
  clip: "rect(0 0 0 0)",
  clipPath: "inset(50%)",
  height: 1,
  overflow: "hidden",
  position: "absolute",
  bottom: 0,
  left: 0,
  whiteSpace: "nowrap",
  width: 1,
});

const CustomeTextField = styled(TextField)({
  ...customTextFieldStyles,
});

GridInputFields.propTypes = {
  fieldData: PropTypes.any,
  indexValue: PropTypes.any,
  onChangeHandler: PropTypes.any,
  onBlurHandler: PropTypes.any,
  onValuesChange: PropTypes.any,
  values: PropTypes.any,
  inEditMode: PropTypes.any,
  isView: PropTypes.bool,
};
export default function GridInputFields({
  fieldData,
  indexValue,
  onChangeHandler,
  onBlurHandler,
  onValuesChange,
  values,
  inEditMode,
  // isView
}) {
  // const [fileName, setFileName] = useState("");
  // const [isFocused, setIsFocused] =useState(false);

  const handleChange = (value, field) => {
    let formattedValue = value;
    let updatedValues = {};

    // For checkbox component
    if (field?.controlname?.toLowerCase() === "checkbox") {
      updatedValues[`${field?.fieldname}`] = value; // Adjust the format as needed
    }

    // file upload
    if (field?.controlname.toLowerCase() === "file") {
      // Update the state with the file name for the specific file input
      Object.assign(updatedValues, { [field?.fieldname]: value });
    }

    // For DatePicker component
    if (value && typeof value.format === "function") {
      formattedValue = dayjs(value).format("YYYY-MM-DD HH:mm:ss");
      updatedValues[`${field?.fieldname}`] = formattedValue; // Adjust the format as needed
    }
    // For Autocomplete component (single-select)
    if (
      Array.isArray(value) &&
      field?.controlname.toLowerCase() === "dropdown"
    ) {
      Object.assign(updatedValues, { [`${field?.fieldname}dropdown`]: value });
      formattedValue = value.map((item) => {
        return item.value;
      });
      Object.assign(updatedValues, {
        [`${field?.fieldname}Dropdown`]: value[0]?.label,
      });
      formattedValue = value.map((item) => {
        return parseInt(item.value);
      });
    }

    if (
      Array.isArray(value) &&
      field?.controlname.toLowerCase() === "multiselect"
    ) {
      Object.assign(updatedValues, {
        [`${field?.fieldname}multiselect`]: value,
      });
      formattedValue = value.map((item) => {
        return item.value;
      });
    }

    // Update the state or context with the new value
    Object.assign(updatedValues, {
      [field?.fieldname]:
        Array.isArray(formattedValue) &&
        field?.controlname.toLowerCase() === "dropdown"
          ? formattedValue.join(",")
          : formattedValue,
    });

    // console.log("updatedValues", updatedValues);
    if (onValuesChange) {
      onValuesChange(updatedValues);
    }
  };

  // Render different types of inputs
  const renderInputField = (field, index) => {
    const [switchToText, setswitchToText] = useState(true);
    const [dropDownValues, setdropDownValues] = useState([]);
    const [isFocused, setIsFocused] = useState(false);
    const inputRef = useRef(null);
    const [pageNo, setPageNo] = useState(1);
    const [inputValueForDataFetch, setInputValueForDataFetch] = useState("");
    const dropdownRef = useRef(null);
    const [isNextPageNull, setIsNextPageNull] = useState(false);

    useEffect(() => {
      const handleFocus = () => {
        setIsFocused(true);
      };

      if (
        field?.controlname?.toLowerCase() === "dropdown" ||
        (field?.controlname?.toLowerCase() === "multiselect" &&
          values[field?.fieldname] !== undefined)
      ) {
        console.log("field", field);
        console.log(" values", values);
        console.log(" values[field?.fieldname]", values[field?.fieldname]);
        fetchData(
          field,
          pageNo,
          inputValueForDataFetch,
          values?.[field?.fieldname],
          "first"
        );
      } else if (
        field?.controlname?.toLowerCase() === "dropdown" ||
        field?.controlname?.toLowerCase() === "multiselect"
      ) {
        setdropDownValues(field?.data);
      }

      const handleBlur = () => {
        setIsFocused(false);
      };

      const inputElement = inputRef.current;

      if (inputElement) {
        inputElement.addEventListener("focus", handleFocus);
        inputElement.addEventListener("blur", handleBlur);

        return () => {
          inputElement.removeEventListener("focus", handleFocus);
          inputElement.removeEventListener("blur", handleBlur);
        };
      }
      // }, [pageNo]);
    }, [values?.[field?.fieldname]]);

    async function fetchData(field, pageNo, inputValueForDataFetch, value) {
      const requestData = {
        onfilterkey: "status",
        onfiltervalue: 1,
        referenceTable: field?.referenceTable,
        referenceColumn: field?.referenceColumn,
        dropdownFilter: field?.dropdownFilter,
        search: inputValueForDataFetch,
        pageNo: inputValueForDataFetch.length > 0 ? 1 : pageNo,
        value: typeof value == "object" ? value?.value : value,
      };
      try {
        if (isNextPageNull) {
          return false;
        } else {
          const apiResponse = await dynamicDropDownFieldsData(requestData);

          if (apiResponse.nextPage === null) {
            // Handle the case where apiResponse is falsy (e.g., null, undefined)
            setIsNextPageNull(true);
            // return false;
          }

          // A helper function to update state, reducing redundancy
          const updateState = (data) => {
            setdropDownValues((prev) => [
              ...(Array.isArray(prev) ? prev : []),
              ...data,
            ]);
            // setRenderedData((prev) => [
            //   ...(Array.isArray(prev) ? prev : []),
            //   ...data,
            // ]);
          };

          // For the first page, replace the existing values; for others, append to them
          if (pageNo == 1 || inputValueForDataFetch.length > 0) {
            // console.log("apiResponse.data", apiResponse.data);
            setdropDownValues([]);
            setdropDownValues(apiResponse.data);
          } else {
            // console.log("else");
            updateState(apiResponse.data);
          }

          return true;
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        return false;
      }
    }

    // const inputChangeSubject = useRef(new Subject());
    const prevPageNo = useRef();

    // Debounced fetch call
    const debouncedFetch = useCallback(
      debounce((searchValue) => {
        // Your fetch logic here
        console.log("Fetching data for:", searchValue);
        fetchData(
          field,
          pageNo,
          searchValue,
          values?.[field?.fieldname],
          "search"
        );
        // fetchData(searchValue); // Uncomment this line to call your fetch function
      }, 50),
      []
    ); // 50ms debounce time
    const handleInputChange = (newInputValue) => {
      debouncedFetch(newInputValue);
    };

    useEffect(() => {
      if (pageNo > 1) {
        // Check if the parameters have changed in a meaningful way
        if (prevPageNo.current !== pageNo) {
          fetchData(field, pageNo, inputValueForDataFetch, "", "pageNo");
        }
        // Update refs after fetch
        prevPageNo.current = pageNo;
      }
    }, [pageNo]);

    // const handleScroll = () => {
    //   console.log("You have reached the bottom of the scroll.");
    //   // Increase pageNo by one
    //   setPageNo((prevPageNo) => prevPageNo + 1);
    //   // const container = menuRef.current;
    //   // if (container) {
    //   //   const { scrollTop, scrollHeight, clientHeight } = container;
    //   //   const isAtBottom = scrollTop + clientHeight >= scrollHeight - 20;
    //   //   if (isAtBottom) {
    //   //     console.log("You have reached the bottom of the scroll.");
    //   //     // Increase pageNo by one
    //   //     setPageNo((prevPageNo) => prevPageNo + 1);
    //   //   }
    //   // }
    // };

    const customStyles = {
      menu: (base) => ({
        ...base,
        ...menuStyles,
      }),
      menuPortal: (provided) => ({
        ...provided,
        backgroundColor: "var(--page-bg-color)",
        zIndex: 9999, // Set zIndex to a very high value
      }),
      option: (provided) => ({
        ...provided,
        backgroundColor: "var(--accordian-summary-bg)",
        color: "var(--table-text-color)", // Normal text color
        ":hover": {
          ...provided[":hover"],
          backgroundColor: "var(--accordion-summary-bg)", // Background color on hover
        },
      }),
      menuList: () => ({
        ...menuListStyles,
      }),

      control: (base) => ({
        ...base,
        minHeight: "27px",
        borderWidth: 1,
        borderColor: "#d9d9d9",
        backgroundColor: "var(--page-bg-color)",
        boxShadow: "none",
        "&:hover": { borderColor: "#d9d9d9" },
        borderRadius: "5px",
        flexWrap: "nowrap",
        width: "fit-content",
        whiteSpace: "nowrap",
        maxWidth: "12rem",
        height: "27px ",
        zindex: 999,
        fontSize: "10px",
        position: "relative",
      }),
      indicatorSeparator: (base) => ({
        ...base,
        display: "none",
      }),
      placeholder: (base) => ({
        ...base,
        color: "rgba(0, 0, 0, 0.75)",
        margin: 0,
        padding: 0,
        fontSize: "10px",
        position: "relative",
        bottom: "2px",
      }),
      dropdownIndicator: (base) => ({
        ...base,
        "& svg": {
          width: "12px !important", // Adjust the size of the arrow icon
          height: "12px !important", // Adjust the size of the arrow icon
        },
      }),

      // Style for the clear indicator (clear icon)
      clearIndicator: (base) => ({
        ...base,
        "& svg": {
          width: "12px !important", // Adjust the size of the clear icon
          height: "12px !important", // Adjust the size of the clear icon
        },
      }),
      singleValue: (base) => ({
        ...base,
        overflow: "visible",
        position: "relative",
        // bottom: "1em",
        color: "var(--table-text-color)",
      }),
      valueContainer: (provided) => ({
        ...provided,
        flexWrap: "nowrap", // Set selected values to not wrap
        // overflow: "hidden", // Optional: hides overflowed content
      }),
      input: (base) => ({
        ...base,
        color: "var(--table-text-color)", // Set color of typed text to pink
      }),
    };

    const [scrollPosition, setScrollPosition] = useState(0);
    const CustomMenuList = (props) => {
      const { pageNo, setPageNo, setScrollPosition, scrollPosition } = props; // Assuming these are passed as props now
      const menuListRef = useRef(null);
      // Adding a flag to control when to adjust scroll
      const localScrollPosition = useRef(scrollPosition); // To track scroll position locally

      useEffect(() => {
        const menuList = menuListRef.current;
        if (menuList) {
          const onScroll = () => {
            const { scrollHeight, scrollTop, clientHeight } = menuList;
            localScrollPosition.current = scrollTop;
            // const isBottom = scrollHeight - scrollTop === clientHeight;
            // if (isBottom && scrollPosition !== scrollTop) {
            //   setScrollPosition(scrollTop);
            //   setPageNo((prevPageNo) => prevPageNo + 1);
            // }
            const threshold = 10; // You can adjust the threshold value as needed
            const isNearBottom =
              scrollHeight - scrollTop <= clientHeight + threshold;

            if (isNearBottom && scrollPosition !== scrollTop) {
              setScrollPosition(scrollTop);
              setPageNo((prevPageNo) => prevPageNo + 1);
            }
          };

          menuList.addEventListener("scroll", onScroll);
          return () => {
            menuList.removeEventListener("scroll", onScroll);
          };
        }
      }, []); // Updated the dependencies

      useEffect(() => {
        const menuList = menuListRef.current;

        if (menuList && pageNo > 1) {
          // Use requestAnimationFrame to ensure the DOM updates are complete
          requestAnimationFrame(() => {
            // menuList.scrollTop = scrollPosition;
            menuList.scrollTop = localScrollPosition.current;
          });
        }
      }, [pageNo]); // Added adjustScrollNeeded as a dependency

      return (
        <components.MenuList {...props} innerRef={menuListRef}>
          {props.children}
        </components.MenuList>
      );
    };

    CustomMenuList.propTypes = {
      props: PropTypes.any,
      selectProps: PropTypes.any,
      children: PropTypes.any,
      pageNo: PropTypes.any,
      setPageNo: PropTypes.any,
      setScrollPosition: PropTypes.any,
      scrollPosition: PropTypes.any,
    };

    function handleFuncChangeCall(functionData) {
      const funcNameMatch = functionData?.match(/^(\w+)/);
      // Check for the presence of parentheses to confirm the argument list, even if it's empty
      const argsMatch = functionData?.match(/\((.*)\)/);

      // console.log("funcNameMatch", funcNameMatch?.[1]);
      // This will log the entire match including empty parentheses
      // console.log("argsMatch", argsMatch?.[1]);

      // Check if we have a function name match, and we have an argsMatch (even if there are no arguments)
      if (funcNameMatch && argsMatch !== null) {
        const funcName = funcNameMatch[1];
        const argsStr = argsMatch[1] || ""; // argsStr could be an empty string
        // Find the function in formControlValidation by the extracted name
        const func = formControlValidation?.[funcName];
        if (typeof func === "function") {
          // Prepare arguments: If there are no arguments, argsStr will be an empty string
          let args;
          if (argsStr === "") {
            args = {}; // No arguments, so pass an empty object or as per the function's expected parameters
          } else {
            args = { argsStr, values }; // Has arguments, pass them as an object
          }

          // Call the function with the prepared arguments
          const updatedValues = func(args);
          // console.log("OUTPUT:", updatedValues);
          onChangeHandler(updatedValues); // Assuming you have an onChangeHandler function to handle the updated values
        }
      }
    }

    function handleFuncBlurCall(functionData) {
      const funcNameMatch = functionData?.match(/^(\w+)/);
      // Check for the presence of parentheses to confirm the argument list, even if it's empty
      const argsMatch = functionData?.match(/\((.*)\)/);

      // console.log("funcNameMatch", funcNameMatch?.[1]);
      // This will log the entire match including empty parentheses
      // console.log("argsMatch", argsMatch?.[1]);

      // Check if we have a function name match, and we have an argsMatch (even if there are no arguments)
      if (funcNameMatch && argsMatch !== null) {
        const funcName = funcNameMatch[1];
        const argsStr = argsMatch[1] || ""; // argsStr could be an empty string
        // Find the function in formControlValidation by the extracted name
        const func = formControlValidation?.[funcName];
        if (typeof func === "function") {
          // Prepare arguments: If there are no arguments, argsStr will be an empty string
          let args;
          if (argsStr === "") {
            args = {}; // No arguments, so pass an empty object or as per the function's expected parameters
          } else {
            args = { argsStr, values }; // Has arguments, pass them as an object
          }

          // Call the function with the prepared arguments
          const updatedValues = func(args);
          // console.log("OUTPUT:", updatedValues);
          onChangeHandler(updatedValues); // Assuming you have an onChangeHandler function to handle the updated values
        }
      }
    }

    let callInputChangeFunc = true;
    let uniqueId = `${field?.controlname}_${field?.fieldname}_${field?._id}_${index}`;
    let inputLabel = field?.yourlabel;
    if (field?.isControlShow === false) {
      return null;
    }

    switch (field?.controlname?.toLowerCase()) {
      case "dropdown":
        return (
          <LightTooltip key={uniqueId} title={field?.yourlabel}>
            {switchToText ? (
              <div className="relative ">
                <Select
                  menuPortalTarget={document.body}
                  backspaceRemovesValue={true}
                  isClearable={true}
                  styles={customStyles}
                  placeholder={
                    field?.isRequired ? (
                      <span className={`${styles.inputTextColor}`}>
                        {inputLabel} <span style={{ color: "red" }}>*</span>
                      </span>
                    ) : (
                      <span className={`${styles.inputTextColor}`}>
                        {inputLabel}
                      </span>
                    )
                  }
                  menuPlacement="auto"
                  options={dropDownValues}
                  className={` ${styles.inputField}  `}
                  components={{
                    MenuList: (props) => (
                      <CustomMenuList
                        {...props}
                        pageNo={pageNo}
                        setPageNo={setPageNo}
                        setScrollPosition={setScrollPosition}
                        scrollPosition={scrollPosition}
                      />
                    ),
                  }}
                  isDisabled={
                    inEditMode?.isEditMode
                      ? inEditMode?.isCopy == true
                        ? !field?.isCopyEditable
                        : !field.isEditable
                      : !field.isEditable
                  }
                  value={
                    dropDownValues.find(
                      (item) =>
                        item.value === parseInt(values[field?.fieldname])
                    ) || null
                  }
                  noOptionsMessage={() => "No records found"}
                  onMenuOpen={() => {
                    setInputValueForDataFetch("");
                    setPageNo(1);
                    setIsFocused(true);
                    // if (!values?.[field?.fieldname]) {
                    //   fetchData(field, 1, inputValueForDataFetch, "", "onPoen");
                    // }
                    fetchData(field, 1, inputValueForDataFetch, "", "onPoen");
                  }}
                  onMenuClose={() => {
                    setInputValueForDataFetch("");
                    // setPageNo(1);
                    setIsFocused(true);
                    setIsNextPageNull(false);
                    // fetchData(field, 1, inputValueForDataFetch, "", "onClose");
                  }}
                  onFocus={() => {
                    setIsFocused(true);
                    setInputValueForDataFetch("");
                    setPageNo(1);
                  }}
                  onChange={(newValue) => {
                    callInputChangeFunc = false;
                    handleChange(newValue ? [newValue] : [], field);

                    values[field?.fieldname] = newValue;
                    const funcCallString = field?.functionOnChange;
                    if (
                      funcCallString === undefined ||
                      funcCallString === null ||
                      funcCallString === ""
                    ) {
                      // console.log("No function call string found.");
                    } else {
                      let multiCallFunctions = funcCallString.split(";");

                      console.log("multiCallFunctions", multiCallFunctions);

                      multiCallFunctions.forEach((funcCall) => {
                        // console.log("funcCall", funcCall);
                        handleFuncChangeCall(funcCall);
                      });

                      // const funcNameMatch = funcCallString?.match(/^(\w+)/);
                      // // Check for the presence of parentheses to confirm the argument list, even if it's empty
                      // const argsMatch = funcCallString?.match(/\((.*)\)/);

                      // // console.log("funcNameMatch", funcNameMatch?.[1]);
                      // // This will log the entire match including empty parentheses
                      // // console.log("argsMatch", argsMatch?.[1]);

                      // // Check if we have a function name match, and we have an argsMatch (even if there are no arguments)
                      // if (funcNameMatch && argsMatch !== null) {
                      //   const funcName = funcNameMatch[1];
                      //   const argsStr = argsMatch[1] || ""; // argsStr could be an empty string
                      //   // Find the function in formControlValidation by the extracted name
                      //   const func = formControlValidation?.[funcName];
                      //   if (typeof func === "function") {
                      //     // Prepare arguments: If there are no arguments, argsStr will be an empty string
                      //     let args;
                      //     if (argsStr === "") {
                      //       args = {}; // No arguments, so pass an empty object or as per the function's expected parameters
                      //     } else {
                      //       args = { argsStr, values }; // Has arguments, pass them as an object
                      //     }

                      //     // Call the function with the prepared arguments
                      //     const updatedValues = func(args);
                      //     // console.log("OUTPUT:", updatedValues);
                      //     onChangeHandler(updatedValues); // Assuming you have an onChangeHandler function to handle the updated values
                      //   }
                      // }
                    }
                    callInputChangeFunc = true;
                  }}
                  onBlur={(e) => {
                    if (field) {
                      setIsFocused(false);
                    } else {
                      setIsFocused(true);
                    }
                    // setIsFocused(true);

                    setInputValueForDataFetch("");
                    // setPageNo(1);
                    typeof formControlValidation?.[field?.functionOnBlur] ===
                      "function" &&
                      onBlurHandler((state) => {
                        return formControlValidation?.[field?.functionOnBlur](
                          state,
                          field?.fieldname,
                          e.target.value
                        );
                      });

                    // values[field?.fieldname] = newValue;
                    const funcCallString = field?.functionOnBlur;
                    if (
                      funcCallString === undefined ||
                      funcCallString === null ||
                      funcCallString === ""
                    ) {
                      // console.log("No function call string found.");
                    } else {
                      let multiCallFunctions = funcCallString.split(";");

                      console.log("multiCallFunctions", multiCallFunctions);

                      multiCallFunctions.forEach((funcCall) => {
                        // console.log("funcCall", funcCall);
                        handleFuncBlurCall(funcCall);
                      });

                      // const funcNameMatch = funcCallString?.match(/^(\w+)/);
                      // // console.log("funcNameMatch", funcNameMatch?.[1]);
                      // // Check for the presence of parentheses to confirm the argument list, even if it's empty
                      // const argsMatch = funcCallString?.match(/\((.*)\)/);

                      // // console.log("funcNameMatch", funcNameMatch?.[1]);
                      // // This will log the entire match including empty parentheses
                      // // console.log("argsMatch", argsMatch?.[1]);

                      // // Check if we have a function name match, and we have an argsMatch (even if there are no arguments)
                      // if (funcNameMatch && argsMatch !== null) {
                      //   const funcName = funcNameMatch[1];
                      //   const argsStr = argsMatch[1] || ""; // argsStr could be an empty string
                      //   // Find the function in formControlValidation by the extracted name
                      //   const func = formControlValidation?.[funcName];
                      //   if (typeof func === "function") {
                      //     // Prepare arguments: If there are no arguments, argsStr will be an empty string
                      //     let args;
                      //     if (argsStr === "") {
                      //       args = {}; // No arguments, so pass an empty object or as per the function's expected parameters
                      //     } else {
                      //       args = { argsStr, values }; // Has arguments, pass them as an object
                      //     }

                      //     // Call the function with the prepared arguments
                      //     const updatedValues = func(args);
                      //     // console.log("OUTPUT:", updatedValues);
                      //     onBlurHandler(updatedValues); // Assuming you have an onChangeHandler function to handle the updated values
                      //   }
                      // }
                    }
                  }}
                  onInputChange={(value, e) => {
                    // console.log("callInputChangeFunc", e);
                    if (callInputChangeFunc && e.action === "input-change") {
                      handleInputChange(value);
                    }
                  }}
                />
              </div>
            ) : (
              <CustomeTextField
                id={uniqueId}
                onDoubleClick={() => {
                  setswitchToText((prev) => !prev);
                }}
                // label={
                //   <>
                //     {inputLabel}
                //     {/* {field?.isRequired && (
                //       <span style={{ color: "red" }}> *</span>
                //     )} */}
                //   </>
                // }
                onFocus={() => {
                  setIsFocused(true);
                }}
                sx={{
                  ...textInputStyle({
                    fieldname: values?.[`${field?.fieldname}`],
                    isFocused,
                    value: values?.[field?.fieldname],
                  }),
                }}
                variant="outlined"
                size="small"
                name={field?.fieldname}
                required={field?.isRequired}
                className={` ${styles.inputField}`}
                value={values?.[field?.fieldname] || ""}
                onChange={(e, newValue) => {
                  // if (
                  //   e.target.value.toString().length <= field?.size ||!field?.size
                  // ) {
                  //   handleChange(e.target.value, field);
                  // }
                  if (
                    !field?.size ||
                    e.target.value.toString().length <= field?.size
                  ) {
                    handleChange(e.target.value, field);
                  }

                  values[field?.fieldname] = newValue;
                  const funcCallString = field?.functionOnChange;
                  if (
                    funcCallString === undefined ||
                    funcCallString === null ||
                    funcCallString === ""
                  ) {
                    // console.log("No function call string found.");
                  } else {
                    let multiCallFunctions = funcCallString.split(";");

                    console.log("multiCallFunctions", multiCallFunctions);

                    multiCallFunctions.forEach((funcCall) => {
                      // console.log("funcCall", funcCall);
                      handleFuncChangeCall(funcCall);
                    });

                    // const funcNameMatch = funcCallString?.match(/^(\w+)/);
                    // // Check for the presence of parentheses to confirm the argument list, even if it's empty
                    // const argsMatch = funcCallString?.match(/\((.*)\)/);

                    // // console.log("funcNameMatch", funcNameMatch?.[1]);
                    // // This will log the entire match including empty parentheses
                    // // console.log("argsMatch", argsMatch?.[1]);

                    // // Check if we have a function name match, and we have an argsMatch (even if there are no arguments)
                    // if (funcNameMatch && argsMatch !== null) {
                    //   const funcName = funcNameMatch[1];
                    //   const argsStr = argsMatch[1] || ""; // argsStr could be an empty string
                    //   // Find the function in formControlValidation by the extracted name
                    //   const func = formControlValidation?.[funcName];
                    //   if (typeof func === "function") {
                    //     // Prepare arguments: If there are no arguments, argsStr will be an empty string
                    //     let args;
                    //     if (argsStr === "") {
                    //       args = {}; // No arguments, so pass an empty object or as per the function's expected parameters
                    //     } else {
                    //       args = { argsStr, values }; // Has arguments, pass them as an object
                    //     }

                    //     // Call the function with the prepared arguments
                    //     const updatedValues = func(args);
                    //     // console.log("OUTPUT:", updatedValues);
                    //     onChangeHandler(updatedValues); // Assuming you have an onChangeHandler function to handle the updated values
                    //   }
                    // }
                  }
                }}
                onBlur={(e) => {
                  setIsFocused(false);
                  typeof formControlValidation?.[field?.functionOnBlur] ===
                    "function" &&
                    onBlurHandler((state) => {
                      return formControlValidation?.[field?.functionOnBlur]({
                        state: state,
                        fieldName: field?.fieldname,
                        value: e.target.value,
                      });
                    });

                  // values[field?.fieldname] = newValue;
                  const funcCallString = field?.functionOnBlur;
                  if (
                    funcCallString === undefined ||
                    funcCallString === null ||
                    funcCallString === ""
                  ) {
                    // console.log("No function call string found.");
                  } else {
                    let multiCallFunctions = funcCallString.split(";");

                    console.log("multiCallFunctions", multiCallFunctions);

                    multiCallFunctions.forEach((funcCall) => {
                      // console.log("funcCall", funcCall);
                      handleFuncBlurCall(funcCall);
                    });

                    // const funcNameMatch = funcCallString?.match(/^(\w+)/);
                    // // console.log("funcNameMatch", funcNameMatch?.[1]);
                    // // Check for the presence of parentheses to confirm the argument list, even if it's empty
                    // const argsMatch = funcCallString?.match(/\((.*)\)/);

                    // // console.log("funcNameMatch", funcNameMatch?.[1]);
                    // // This will log the entire match including empty parentheses
                    // // console.log("argsMatch", argsMatch?.[1]);

                    // // Check if we have a function name match, and we have an argsMatch (even if there are no arguments)
                    // if (funcNameMatch && argsMatch !== null) {
                    //   const funcName = funcNameMatch[1];
                    //   const argsStr = argsMatch[1] || ""; // argsStr could be an empty string
                    //   // Find the function in formControlValidation by the extracted name
                    //   const func = formControlValidation?.[funcName];
                    //   if (typeof func === "function") {
                    //     // Prepare arguments: If there are no arguments, argsStr will be an empty string
                    //     let args;
                    //     if (argsStr === "") {
                    //       args = {}; // No arguments, so pass an empty object or as per the function's expected parameters
                    //     } else {
                    //       args = { argsStr, values }; // Has arguments, pass them as an object
                    //     }

                    //     // Call the function with the prepared arguments
                    //     const updatedValues = func(args);
                    //     // console.log("OUTPUT:", updatedValues);
                    //     onBlurHandler(updatedValues); // Assuming you have an onChangeHandler function to handle the updated values
                    //   }
                    // }
                  }
                }}
                // disabled={
                //   inEditMode?.isEditMode &&
                //   (inEditMode?.isCopy == true
                //     ? !field?.isCopyEditable
                //     : !field?.isEditable)
                // }
                disabled={
                  inEditMode?.isEditMode
                    ? inEditMode?.isCopy == true
                      ? !field?.isCopyEditable
                      : !field?.isEditable
                    : !field?.isEditable
                }
                InputLabelProps={{
                  classes: {
                    asterisk: "required-asterisk",
                  },
                }}
              />
            )}
          </LightTooltip>
        );
      case "multiselect":
        return (
          <LightTooltip title={inputLabel}>
            <Select
              isMulti
              menuPortalTarget={document.body}
              styles={customStyles}
              placeholder={inputLabel}
              options={dropDownValues}
              className={` ${styles.inputField}  `}
              components={{
                MenuList: (props) => (
                  <CustomMenuList
                    {...props}
                    pageNo={pageNo}
                    setPageNo={setPageNo}
                    setScrollPosition={setScrollPosition}
                    scrollPosition={scrollPosition}
                  />
                ),
              }}
              isDisabled={
                inEditMode?.isEditMode
                  ? inEditMode?.isCopy == true
                    ? !field?.isCopyEditable
                    : !field?.isEditable
                  : !field?.isEditable
              }
              ref={dropdownRef}
              value={values?.[`${field?.fieldname}multiselect`] || []}
              noOptionsMessage={() =>
                dropDownValues.length === 0
                  ? "No records found"
                  : "Searching..."
              }
              onMenuOpen={() => {
                console.log("open");
                setInputValueForDataFetch("");
                setPageNo(1);
                setIsFocused(true);
              }}
              onMenuClose={() => {
                console.log("Close");
                setInputValueForDataFetch("");
                setIsFocused(true);
                setIsNextPageNull(false);
              }}
              onFocus={() => {
                console.log("Focus");
                setIsFocused(true);
                setInputValueForDataFetch("");
                setPageNo(1);
              }}
              onChange={(newValue) => {
                console.log("newValue", newValue);
                handleChange(newValue ? [newValue] : [], field);

                values[field?.fieldname] = newValue;
                const funcCallString = field?.functionOnChange;
                if (
                  funcCallString === undefined ||
                  funcCallString === null ||
                  funcCallString === ""
                ) {
                  // console.log("No function call string found.");
                } else {
                  let multiCallFunctions = funcCallString.split(";");

                  console.log("multiCallFunctions", multiCallFunctions);

                  multiCallFunctions.forEach((funcCall) => {
                    // console.log("funcCall", funcCall);
                    handleFuncChangeCall(funcCall);
                  });

                  // const funcNameMatch = funcCallString?.match(/^(\w+)/);
                  // // Check for the presence of parentheses to confirm the argument list, even if it's empty
                  // const argsMatch = funcCallString?.match(/\((.*)\)/);

                  // // console.log("funcNameMatch", funcNameMatch?.[1]);
                  // // This will log the entire match including empty parentheses
                  // // console.log("argsMatch", argsMatch?.[1]);

                  // // Check if we have a function name match, and we have an argsMatch (even if there are no arguments)
                  // if (funcNameMatch && argsMatch !== null) {
                  //   const funcName = funcNameMatch[1];
                  //   const argsStr = argsMatch[1] || ""; // argsStr could be an empty string
                  //   // Find the function in formControlValidation by the extracted name
                  //   const func = formControlValidation?.[funcName];
                  //   if (typeof func === "function") {
                  //     // Prepare arguments: If there are no arguments, argsStr will be an empty string
                  //     let args;
                  //     if (argsStr === "") {
                  //       args = {}; // No arguments, so pass an empty object or as per the function's expected parameters
                  //     } else {
                  //       args = { argsStr, values }; // Has arguments, pass them as an object
                  //     }

                  //     // Call the function with the prepared arguments
                  //     const updatedValues = func(args);
                  //     // console.log("OUTPUT:", updatedValues);
                  //     onChangeHandler(updatedValues); // Assuming you have an onChangeHandler function to handle the updated values
                  //   }
                  // }
                }
              }}
              onBlur={(e) => {
                if (field) {
                  setIsFocused(false);
                } else {
                  setIsFocused(true);
                }
                // setIsFocused(true);

                setInputValueForDataFetch("");
                // setPageNo(1);
                typeof formControlValidation?.[field?.functionOnBlur] ===
                  "function" &&
                  onBlurHandler((state) => {
                    return formControlValidation?.[field?.functionOnBlur](
                      state,
                      field?.fieldname,
                      e.target.value
                    );
                  });

                // values[field?.fieldname] = newValue;
                const funcCallString = field?.functionOnBlur;
                if (
                  funcCallString === undefined ||
                  funcCallString === null ||
                  funcCallString === ""
                ) {
                  // console.log("No function call string found.");
                } else {
                  let multiCallFunctions = funcCallString.split(";");

                  console.log("multiCallFunctions", multiCallFunctions);

                  multiCallFunctions.forEach((funcCall) => {
                    // console.log("funcCall", funcCall);
                    handleFuncBlurCall(funcCall);
                  });

                  // const funcNameMatch = funcCallString?.match(/^(\w+)/);
                  // // console.log("funcNameMatch", funcNameMatch?.[1]);
                  // // Check for the presence of parentheses to confirm the argument list, even if it's empty
                  // const argsMatch = funcCallString?.match(/\((.*)\)/);

                  // // console.log("funcNameMatch", funcNameMatch?.[1]);
                  // // This will log the entire match including empty parentheses
                  // // console.log("argsMatch", argsMatch?.[1]);

                  // // Check if we have a function name match, and we have an argsMatch (even if there are no arguments)
                  // if (funcNameMatch && argsMatch !== null) {
                  //   const funcName = funcNameMatch[1];
                  //   const argsStr = argsMatch[1] || ""; // argsStr could be an empty string
                  //   // Find the function in formControlValidation by the extracted name
                  //   const func = formControlValidation?.[funcName];
                  //   if (typeof func === "function") {
                  //     // Prepare arguments: If there are no arguments, argsStr will be an empty string
                  //     let args;
                  //     if (argsStr === "") {
                  //       args = {}; // No arguments, so pass an empty object or as per the function's expected parameters
                  //     } else {
                  //       args = { argsStr, values }; // Has arguments, pass them as an object
                  //     }

                  //     // Call the function with the prepared arguments
                  //     const updatedValues = func(args);
                  //     // console.log("OUTPUT:", updatedValues);
                  //     onBlurHandler(updatedValues); // Assuming you have an onChangeHandler function to handle the updated values
                  //   }
                  // }
                }
              }}
              onInputChange={(value, e) => {
                console.log("callInputChangeFunc", e);
                if (callInputChangeFunc && e.action === "input-change") {
                  handleInputChange(value);
                }
              }}
            />
          </LightTooltip>
        );
      case "radio":
        return (
          <LightTooltip title={inputLabel}>
            <div className={`${customRadioCheckBoxStyle} ${styles.inputField}`}>
              style={customWidthCheckBoxGridStyle}
              {/* <div
                id={uniqueId}
                key={index}
                className="absolute px-2 inline top-[-8px] left-[8px] p-0 bg-white text-[10px] "
              >
                <span className="text-[8px]">
                  {field?.isRequired ? (
                    <>
                      {inputLabel} <span style={{ color: "red" }}> *</span>
                    </>
                  ) : (
                    inputLabel
                  )}
                </span>
              </div> */}
              <div>
                <RadioGroup
                  row
                  sx={{
                    ...radioGroupStyle,
                  }}
                  // sx={{ '& .MuiFormControlLabel-label': { fontSize: '0.9rem' } }}
                  // required={field?.isRequired}
                  defaultValue="top"
                  aria-labelledby={uniqueId}
                  name="postion"
                  value={
                    values?.[field?.fieldname] !== undefined
                      ? values?.[field?.fieldname]?.toString()
                      : null
                  }
                  onChange={(e) => {
                    // Check if the clicked radio button is already selected
                    const newValue =
                      e.target.value === values?.[field?.fieldname]
                        ? null
                        : e.target.value;
                    handleChange(newValue, field);

                    values[field?.fieldname] = newValue;
                    const funcCallString = field?.functionOnChange;
                    if (
                      funcCallString === undefined ||
                      funcCallString === null ||
                      funcCallString === ""
                    ) {
                      // console.log("No function call string found.");
                    } else {
                      let multiCallFunctions = funcCallString.split(";");

                      console.log("multiCallFunctions", multiCallFunctions);

                      multiCallFunctions.forEach((funcCall) => {
                        // console.log("funcCall", funcCall);
                        handleFuncChangeCall(funcCall);
                      });

                      // const funcNameMatch = funcCallString?.match(/^(\w+)/);
                      // // Check for the presence of parentheses to confirm the argument list, even if it's empty
                      // const argsMatch = funcCallString?.match(/\((.*)\)/);

                      // // console.log("funcNameMatch", funcNameMatch?.[1]);
                      // // This will log the entire match including empty parentheses
                      // // console.log("argsMatch", argsMatch?.[1]);

                      // // Check if we have a function name match, and we have an argsMatch (even if there are no arguments)
                      // if (funcNameMatch && argsMatch !== null) {
                      //   const funcName = funcNameMatch[1];
                      //   const argsStr = argsMatch[1] || ""; // argsStr could be an empty string
                      //   // Find the function in formControlValidation by the extracted name
                      //   const func = formControlValidation?.[funcName];
                      //   if (typeof func === "function") {
                      //     // Prepare arguments: If there are no arguments, argsStr will be an empty string
                      //     let args;
                      //     if (argsStr === "") {
                      //       args = {}; // No arguments, so pass an empty object or as per the function's expected parameters
                      //     } else {
                      //       args = { argsStr, values }; // Has arguments, pass them as an object
                      //     }

                      //     // Call the function with the prepared arguments
                      //     const updatedValues = func(args);
                      //     // console.log("OUTPUT:", updatedValues);
                      //     onChangeHandler(updatedValues); // Assuming you have an onChangeHandler function to handle the updated values
                      //   }
                      // }
                    }
                  }}
                >
                  {field?.dropDownValues.map((item, index) => (
                    <FormControlLabel
                      key={index}
                      value={item.id}
                      // required={field?.isRequired}
                      control={
                        <Radio
                          disabled={
                            inEditMode?.isEditMode
                              ? inEditMode?.isCopy == true
                                ? !field?.isCopyEditable
                                : !field?.isEditable
                              : !field?.isEditable
                          }
                          sx={{
                            "&.Mui-checked": {
                              color: (theme) =>
                                theme.palette.mode === "light"
                                  ? "#106ba3"
                                  : "#80deea",
                            },
                          }}
                          // required={field?.isRequired}
                        />
                      }
                      label={item.value.toString()}
                      labelPlacement="start"
                      // componentsProps={{
                      //   typography: { component: "div" }, // Wraps the label text in a div to avoid inheriting required asterisk styles
                      // }}
                    />
                  ))}
                </RadioGroup>
              </div>
            </div>
          </LightTooltip>
        );
      case "checkbox":
        return (
          <LightTooltip title={inputLabel}>
            <div
              className={`${customRadioCheckBoxStyle}   ${styles.inputField}`}
              style={customWidthCheckBoxGridStyle}
            >
              {/* <div className="absolute px-2 inline top-[-8px] left-[8px]  bg-white text-[10px] ">
                <span>
                  {field?.isRequired ? (
                    <>
                      {inputLabel} <span style={{ color: "red" }}> *</span>
                    </>
                  ) : (
                    inputLabel
                  )}
                </span>
              </div> */}
              <div key={index} className="ml-4 ">
                <FormGroup aria-label="position" row className="flex">
                  <FormControlLabel
                    key={index}
                    control={
                      <Checkbox
                        checked={values?.[field?.fieldname] ? true : false}
                        onChange={(e) => {
                          handleChange(e.target.checked, field); // Join array into a string when updating

                          values[field?.fieldname] = e.target.checked;
                          const funcCallString = field?.functionOnChange;
                          if (
                            funcCallString === undefined ||
                            funcCallString === null ||
                            funcCallString === ""
                          ) {
                            // console.log("No function call string found.");
                          } else {
                            let multiCallFunctions = funcCallString.split(";");

                            console.log(
                              "multiCallFunctions",
                              multiCallFunctions
                            );

                            multiCallFunctions.forEach((funcCall) => {
                              // console.log("funcCall", funcCall);
                              handleFuncChangeCall(funcCall);
                            });

                            // const funcNameMatch = funcCallString?.match(/^(\w+)/);
                            // // Check for the presence of parentheses to confirm the argument list, even if it's empty
                            // const argsMatch = funcCallString?.match(/\((.*)\)/);

                            // // console.log("funcNameMatch", funcNameMatch?.[1]);
                            // // This will log the entire match including empty parentheses
                            // // console.log("argsMatch", argsMatch?.[1]);

                            // // Check if we have a function name match, and we have an argsMatch (even if there are no arguments)
                            // if (funcNameMatch && argsMatch !== null) {
                            //   const funcName = funcNameMatch[1];
                            //   const argsStr = argsMatch[1] || ""; // argsStr could be an empty string
                            //   // Find the function in formControlValidation by the extracted name
                            //   const func = formControlValidation?.[funcName];
                            //   if (typeof func === "function") {
                            //     // Prepare arguments: If there are no arguments, argsStr will be an empty string
                            //     let args;
                            //     if (argsStr === "") {
                            //       args = {}; // No arguments, so pass an empty object or as per the function's expected parameters
                            //     } else {
                            //       args = { argsStr, values }; // Has arguments, pass them as an object
                            //     }

                            //     // Call the function with the prepared arguments
                            //     const updatedValues = func(args);
                            //     // console.log("OUTPUT:", updatedValues);
                            //     onChangeHandler(updatedValues); // Assuming you have an onChangeHandler function to handle the updated values
                            //   }
                            // }
                          }
                        }}
                        sx={{
                          ...checkBoxStyle,
                        }}
                        onBlur={(e) => {
                          typeof formControlValidation?.[
                            field?.functionOnBlur
                          ] === "function" &&
                            onBlurHandler((state) => {
                              return formControlValidation?.[
                                field?.functionOnBlur
                              ](state, field?.fieldname, e.target.value);
                            });

                          // values[field?.fieldname] = e.target.checked;
                          const funcCallString = field?.functionOnBlur;
                          if (
                            funcCallString === undefined ||
                            funcCallString === null ||
                            funcCallString === ""
                          ) {
                            // console.log("No function call string found.");
                          } else {
                            let multiCallFunctions = funcCallString.split(";");

                            console.log(
                              "multiCallFunctions",
                              multiCallFunctions
                            );

                            multiCallFunctions.forEach((funcCall) => {
                              // console.log("funcCall", funcCall);
                              handleFuncBlurCall(funcCall);
                            });

                            // const funcNameMatch = funcCallString?.match(/^(\w+)/);
                            // // console.log("funcNameMatch", funcNameMatch?.[1]);
                            // // Check for the presence of parentheses to confirm the argument list, even if it's empty
                            // const argsMatch = funcCallString?.match(/\((.*)\)/);

                            // // console.log("funcNameMatch", funcNameMatch?.[1]);
                            // // This will log the entire match including empty parentheses
                            // // console.log("argsMatch", argsMatch?.[1]);

                            // // Check if we have a function name match, and we have an argsMatch (even if there are no arguments)
                            // if (funcNameMatch && argsMatch !== null) {
                            //   const funcName = funcNameMatch[1];
                            //   const argsStr = argsMatch[1] || ""; // argsStr could be an empty string
                            //   // Find the function in formControlValidation by the extracted name
                            //   const func = formControlValidation?.[funcName];
                            //   if (typeof func === "function") {
                            //     // Prepare arguments: If there are no arguments, argsStr will be an empty string
                            //     let args;
                            //     if (argsStr === "") {
                            //       args = {}; // No arguments, so pass an empty object or as per the function's expected parameters
                            //     } else {
                            //       args = { argsStr, values }; // Has arguments, pass them as an object
                            //     }

                            //     // Call the function with the prepared arguments
                            //     const updatedValues = func(args);
                            //     // console.log("OUTPUT:", updatedValues);
                            //     onBlurHandler(updatedValues); // Assuming you have an onChangeHandler function to handle the updated values
                            //   }
                            // }
                          }
                        }}
                        inputProps={{ "aria-label": "controlled" }}
                        disabled={
                          inEditMode?.isEditMode
                            ? inEditMode?.isCopy == true
                              ? !field?.isCopyEditable
                              : !field?.isEditable
                            : !field?.isEditable
                        }
                      />
                    }
                    labelPlacement="end"
                  />
                </FormGroup>
              </div>
            </div>
          </LightTooltip>
        );
      case "multicheckbox":
        return (
          <LightTooltip title={inputLabel}>
            <div
              className={`${customRadioCheckBoxStyle}  ${styles.inputField}`}
            >
              {/* <div className="absolute px-2 inline top-[-8x] left-[8px]  bg-white text-[10px] ">
                <span>
                  {field?.isRequired ? (
                    <>
                      {inputLabel} <span style={{ color: "red" }}> *</span>
                    </>
                  ) : (
                    inputLabel
                  )}
                </span>
              </div> */}
              <div key={index} className="ml-2 ">
                <FormGroup aria-label="position" row className="flex">
                  {field?.dropDownValues.map((item, index) => {
                    let isCheck = values?.[field?.fieldname]
                      ?.split(",")
                      ?.includes(item.id.toString());
                    return (
                      <FormControlLabel
                        key={index}
                        control={
                          <Checkbox
                            checked={isCheck ? true : false}
                            sx={{
                              ...multiCheckBoxStyle,
                            }}
                            onChange={(e) => {
                              let updatedValues = values?.[field?.fieldname]
                                ? values[field?.fieldname].split(",")
                                : [];
                              if (e.target.checked) {
                                // Add value to array if not already present
                                if (
                                  !updatedValues.includes(item.id.toString())
                                ) {
                                  updatedValues.push(item.id.toString()); // Ensure item.id is a string
                                }
                              } else {
                                // Remove value from array
                                updatedValues = updatedValues.filter(
                                  (val) => val !== item.id.toString()
                                );
                              }
                              handleChange(updatedValues.join(","), field); // Join array into a string when updating

                              values[field?.fieldname] = e.target.checked;
                              const funcCallString = field?.functionOnChange;
                              if (
                                funcCallString === undefined ||
                                funcCallString === null ||
                                funcCallString === ""
                              ) {
                                // console.log("No function call string found.");
                              } else {
                                let multiCallFunctions =
                                  funcCallString.split(";");

                                console.log(
                                  "multiCallFunctions",
                                  multiCallFunctions
                                );

                                multiCallFunctions.forEach((funcCall) => {
                                  // console.log("funcCall", funcCall);
                                  handleFuncChangeCall(funcCall);
                                });

                                // const funcNameMatch = funcCallString?.match(/^(\w+)/);
                                // // Check for the presence of parentheses to confirm the argument list, even if it's empty
                                // const argsMatch = funcCallString?.match(/\((.*)\)/);

                                // // console.log("funcNameMatch", funcNameMatch?.[1]);
                                // // This will log the entire match including empty parentheses
                                // // console.log("argsMatch", argsMatch?.[1]);

                                // // Check if we have a function name match, and we have an argsMatch (even if there are no arguments)
                                // if (funcNameMatch && argsMatch !== null) {
                                //   const funcName = funcNameMatch[1];
                                //   const argsStr = argsMatch[1] || ""; // argsStr could be an empty string
                                //   // Find the function in formControlValidation by the extracted name
                                //   const func = formControlValidation?.[funcName];
                                //   if (typeof func === "function") {
                                //     // Prepare arguments: If there are no arguments, argsStr will be an empty string
                                //     let args;
                                //     if (argsStr === "") {
                                //       args = {}; // No arguments, so pass an empty object or as per the function's expected parameters
                                //     } else {
                                //       args = { argsStr, values }; // Has arguments, pass them as an object
                                //     }

                                //     // Call the function with the prepared arguments
                                //     const updatedValues = func(args);
                                //     // console.log("OUTPUT:", updatedValues);
                                //     onChangeHandler(updatedValues); // Assuming you have an onChangeHandler function to handle the updated values
                                //   }
                                // }
                              }
                            }}
                            onBlur={(e) => {
                              typeof formControlValidation?.[
                                field?.functionOnBlur
                              ] === "function" &&
                                onBlurHandler((state) => {
                                  return formControlValidation?.[
                                    field?.functionOnBlur
                                  ](state, field?.fieldname, e.target.value);
                                });

                              // values[field?.fieldname] = e.target.checked;
                              const funcCallString = field?.functionOnBlur;
                              if (
                                funcCallString === undefined ||
                                funcCallString === null ||
                                funcCallString === ""
                              ) {
                                // console.log("No function call string found.");
                              } else {
                                let multiCallFunctions =
                                  funcCallString.split(";");

                                console.log(
                                  "multiCallFunctions",
                                  multiCallFunctions
                                );

                                multiCallFunctions.forEach((funcCall) => {
                                  // console.log("funcCall", funcCall);
                                  handleFuncBlurCall(funcCall);
                                });

                                // const funcNameMatch = funcCallString?.match(/^(\w+)/);
                                // // console.log("funcNameMatch", funcNameMatch?.[1]);
                                // // Check for the presence of parentheses to confirm the argument list, even if it's empty
                                // const argsMatch = funcCallString?.match(/\((.*)\)/);

                                // // console.log("funcNameMatch", funcNameMatch?.[1]);
                                // // This will log the entire match including empty parentheses
                                // // console.log("argsMatch", argsMatch?.[1]);

                                // // Check if we have a function name match, and we have an argsMatch (even if there are no arguments)
                                // if (funcNameMatch && argsMatch !== null) {
                                //   const funcName = funcNameMatch[1];
                                //   const argsStr = argsMatch[1] || ""; // argsStr could be an empty string
                                //   // Find the function in formControlValidation by the extracted name
                                //   const func = formControlValidation?.[funcName];
                                //   if (typeof func === "function") {
                                //     // Prepare arguments: If there are no arguments, argsStr will be an empty string
                                //     let args;
                                //     if (argsStr === "") {
                                //       args = {}; // No arguments, so pass an empty object or as per the function's expected parameters
                                //     } else {
                                //       args = { argsStr, values }; // Has arguments, pass them as an object
                                //     }

                                //     // Call the function with the prepared arguments
                                //     const updatedValues = func(args);
                                //     // console.log("OUTPUT:", updatedValues);
                                //     onBlurHandler(updatedValues); // Assuming you have an onChangeHandler function to handle the updated values
                                //   }
                                // }
                              }
                            }}
                            inputProps={{ "aria-label": "controlled" }}
                            disabled={
                              inEditMode?.isEditMode
                                ? inEditMode?.isCopy == true
                                  ? !field?.isCopyEditable
                                  : !field?.isEditable
                                : !field?.isEditable
                            }
                          />
                        }
                        label={item.value}
                        labelPlacement="end"
                      />
                    );
                  })}
                </FormGroup>
              </div>
            </div>
          </LightTooltip>
        );
      case "number":
        return (
          <LightTooltip title={inputLabel}>
            <CustomeTextField
              id={uniqueId}
              //   label={
              //     <span>
              //       {inputLabel}
              //       {/* {field?.isRequired && <span style={{ color: "red" }}> *</span>} */}
              //     </span>
              //   }
              variant="outlined"
              size="small"
              name={field?.fieldname}
              sx={{
                ...numberInputStyle({
                  fieldname: values?.[`${field?.fieldname}`],
                  isFocused,
                }),
              }}
              style={customWidthCheckBoxGridStyle}
              onFocus={() => {
                setIsFocused(true);
              }}
              required={field?.isRequired}
              className={` ${styles.inputField}`}
              type="number"
              value={values?.[field?.fieldname] || ""}
              onChange={(e) => {
                if (
                  e.target.value.toString().length <= field?.size ||
                  !field?.size
                ) {
                  handleChange(e.target.value, field);

                  const onChangeFunction =
                    formControlValidation?.[field?.functionOnChange];
                  console.log("onChangeFunction", onChangeFunction);
                  if (typeof onChangeFunction === "function") {
                    values[field?.fieldname] = e.target.value;
                    const updatedValues = onChangeFunction({
                      mainJson: values,
                      value: e.target.value,
                      targetFieldName: "buyAmount",
                    });
                    onChangeHandler(updatedValues);
                  }

                  // Example field?.functionOnChange value: "grossAndNetWeight(grossWt, netWt)"

                  values[field?.fieldname] = e.target.value;
                  const funcCallString = field?.functionOnChange;
                  if (
                    funcCallString === undefined ||
                    funcCallString === null ||
                    funcCallString === ""
                  ) {
                    // console.log("No function call string found.");
                  } else {
                    let multiCallFunctions = funcCallString.split(";");

                    console.log("multiCallFunctions", multiCallFunctions);

                    multiCallFunctions.forEach((funcCall) => {
                      // console.log("funcCall", funcCall);
                      handleFuncChangeCall(funcCall);
                    });

                    // const funcNameMatch = funcCallString?.match(/^(\w+)/);
                    // // Check for the presence of parentheses to confirm the argument list, even if it's empty
                    // const argsMatch = funcCallString?.match(/\((.*)\)/);

                    // // console.log("funcNameMatch", funcNameMatch?.[1]);
                    // // This will log the entire match including empty parentheses
                    // // console.log("argsMatch", argsMatch?.[1]);

                    // // Check if we have a function name match, and we have an argsMatch (even if there are no arguments)
                    // if (funcNameMatch && argsMatch !== null) {
                    //   const funcName = funcNameMatch[1];
                    //   const argsStr = argsMatch[1] || ""; // argsStr could be an empty string
                    //   // Find the function in formControlValidation by the extracted name
                    //   const func = formControlValidation?.[funcName];
                    //   if (typeof func === "function") {
                    //     // Prepare arguments: If there are no arguments, argsStr will be an empty string
                    //     let args;
                    //     if (argsStr === "") {
                    //       args = {}; // No arguments, so pass an empty object or as per the function's expected parameters
                    //     } else {
                    //       args = { argsStr, values }; // Has arguments, pass them as an object
                    //     }

                    //     // Call the function with the prepared arguments
                    //     const updatedValues = func(args);
                    //     // console.log("OUTPUT:", updatedValues);
                    //     onChangeHandler(updatedValues); // Assuming you have an onChangeHandler function to handle the updated values
                    //   }
                    // }
                  }
                }
              }}
              onBlur={(e) => {
                setIsFocused(false);
                typeof formControlValidation?.[field?.functionOnBlur] ===
                  "function" &&
                  onBlurHandler((state) => {
                    return formControlValidation?.[field?.functionOnBlur]({
                      key1: "date1",
                      state: state,
                      fieldName: field?.fieldname,
                      value: e.target.value,
                    });
                  });

                // values[field?.fieldname] = e.target.value;
                const funcCallString = field?.functionOnBlur;
                if (
                  funcCallString === undefined ||
                  funcCallString === null ||
                  funcCallString === ""
                ) {
                  // console.log("No function call string found.");
                } else {
                  let multiCallFunctions = funcCallString.split(";");

                  console.log("multiCallFunctions", multiCallFunctions);

                  multiCallFunctions.forEach((funcCall) => {
                    // console.log("funcCall", funcCall);
                    handleFuncBlurCall(funcCall);
                  });

                  // const funcNameMatch = funcCallString?.match(/^(\w+)/);
                  // // console.log("funcNameMatch", funcNameMatch?.[1]);
                  // // Check for the presence of parentheses to confirm the argument list, even if it's empty
                  // const argsMatch = funcCallString?.match(/\((.*)\)/);

                  // // console.log("funcNameMatch", funcNameMatch?.[1]);
                  // // This will log the entire match including empty parentheses
                  // // console.log("argsMatch", argsMatch?.[1]);

                  // // Check if we have a function name match, and we have an argsMatch (even if there are no arguments)
                  // if (funcNameMatch && argsMatch !== null) {
                  //   const funcName = funcNameMatch[1];
                  //   const argsStr = argsMatch[1] || ""; // argsStr could be an empty string
                  //   // Find the function in formControlValidation by the extracted name
                  //   const func = formControlValidation?.[funcName];
                  //   if (typeof func === "function") {
                  //     // Prepare arguments: If there are no arguments, argsStr will be an empty string
                  //     let args;
                  //     if (argsStr === "") {
                  //       args = {}; // No arguments, so pass an empty object or as per the function's expected parameters
                  //     } else {
                  //       args = { argsStr, values }; // Has arguments, pass them as an object
                  //     }

                  //     // Call the function with the prepared arguments
                  //     const updatedValues = func(args);
                  //     // console.log("OUTPUT:", updatedValues);
                  //     onBlurHandler(updatedValues); // Assuming you have an onChangeHandler function to handle the updated values
                  //   }
                  // }
                }
              }}
              disabled={
                inEditMode?.isEditMode
                  ? inEditMode?.isCopy == true
                    ? !field?.isCopyEditable
                    : !field?.isEditable
                  : !field?.isEditable
              }
              InputLabelProps={{
                classes: {
                  asterisk: "required-asterisk",
                },
              }}
            />
          </LightTooltip>
        );
      case "date":
        return (
          <LightTooltip title={inputLabel}>
            <DatePicker
              id={uniqueId}
              key={index}
              //   label={
              //     <span>
              //       {inputLabel}
              //       {field?.isRequired && <span style={{ color: "red" }}> *</span>}
              //     </span>
              //   }
              onOpen={() => {
                setIsFocused(true);
              }}
              onClose={() => {
                setIsFocused(false);
              }}
              inputRef={inputRef}
              name={field?.fieldname}
              value={
                values[`${field?.fieldname}`]
                  ? dayjs(values[`${field?.fieldname}`])
                  : null
              } // Use the state value, converted to a Day.js object
              onChange={(date) => {
                handleChange(date, field);

                let formattedValue = date;
                if (date && typeof date.format === "function") {
                  formattedValue = dayjs(date).format("YYYY-MM-DD HH:mm:ss");
                  values[`${field?.fieldname}`] = formattedValue; // Adjust the format as needed
                }
                const funcCallString = field?.functionOnChange;
                if (
                  funcCallString === undefined ||
                  funcCallString === null ||
                  funcCallString === ""
                ) {
                  // console.log("No function call string found.");
                } else {
                  let multiCallFunctions = funcCallString.split(";");

                  console.log("multiCallFunctions", multiCallFunctions);

                  multiCallFunctions.forEach((funcCall) => {
                    // console.log("funcCall", funcCall);
                    handleFuncChangeCall(funcCall);
                  });

                  // const funcNameMatch = funcCallString?.match(/^(\w+)/);
                  // // Check for the presence of parentheses to confirm the argument list, even if it's empty
                  // const argsMatch = funcCallString?.match(/\((.*)\)/);

                  // // console.log("funcNameMatch", funcNameMatch?.[1]);
                  // // This will log the entire match including empty parentheses
                  // // console.log("argsMatch", argsMatch?.[1]);

                  // // Check if we have a function name match, and we have an argsMatch (even if there are no arguments)
                  // if (funcNameMatch && argsMatch !== null) {
                  //   const funcName = funcNameMatch[1];
                  //   const argsStr = argsMatch[1] || ""; // argsStr could be an empty string
                  //   // Find the function in formControlValidation by the extracted name
                  //   const func = formControlValidation?.[funcName];
                  //   if (typeof func === "function") {
                  //     // Prepare arguments: If there are no arguments, argsStr will be an empty string
                  //     let args;
                  //     if (argsStr === "") {
                  //       args = {}; // No arguments, so pass an empty object or as per the function's expected parameters
                  //     } else {
                  //       args = { argsStr, values }; // Has arguments, pass them as an object
                  //     }

                  //     // Call the function with the prepared arguments
                  //     const updatedValues = func(args);
                  //     // console.log("OUTPUT:", updatedValues);
                  //     onChangeHandler(updatedValues); // Assuming you have an onChangeHandler function to handle the updated values
                  //   }
                  // }
                }
              }}
              slotProps={{
                field: { clearable: true },
              }}
              // onOpen={() => {
              //   setIsFocused(false);
              // }}
              onBlur={(e) => {
                console.log("onBlur", e.target.value);
                typeof formControlValidation?.[field?.functionOnBlur] ===
                  "function" &&
                  onBlurHandler((state) => {
                    return formControlValidation?.[field?.functionOnBlur](
                      state,
                      field?.fieldname,
                      e.target.value
                    );
                  });

                // values[field?.fieldname] = e.target.value;
                const funcCallString = field?.functionOnBlur;
                if (
                  funcCallString === undefined ||
                  funcCallString === null ||
                  funcCallString === ""
                ) {
                  // console.log("No function call string found.");
                } else {
                  let multiCallFunctions = funcCallString.split(";");

                  console.log("multiCallFunctions", multiCallFunctions);

                  multiCallFunctions.forEach((funcCall) => {
                    // console.log("funcCall", funcCall);
                    handleFuncBlurCall(funcCall);
                  });

                  // const funcNameMatch = funcCallString?.match(/^(\w+)/);
                  // // console.log("funcNameMatch", funcNameMatch?.[1]);
                  // // Check for the presence of parentheses to confirm the argument list, even if it's empty
                  // const argsMatch = funcCallString?.match(/\((.*)\)/);

                  // // console.log("funcNameMatch", funcNameMatch?.[1]);
                  // // This will log the entire match including empty parentheses
                  // // console.log("argsMatch", argsMatch?.[1]);

                  // // Check if we have a function name match, and we have an argsMatch (even if there are no arguments)
                  // if (funcNameMatch && argsMatch !== null) {
                  //   const funcName = funcNameMatch[1];
                  //   const argsStr = argsMatch[1] || ""; // argsStr could be an empty string
                  //   // Find the function in formControlValidation by the extracted name
                  //   const func = formControlValidation?.[funcName];
                  //   if (typeof func === "function") {
                  //     // Prepare arguments: If there are no arguments, argsStr will be an empty string
                  //     let args;
                  //     if (argsStr === "") {
                  //       args = {}; // No arguments, so pass an empty object or as per the function's expected parameters
                  //     } else {
                  //       args = { argsStr, values }; // Has arguments, pass them as an object
                  //     }

                  //     // Call the function with the prepared arguments
                  //     const updatedValues = func(args);
                  //     // console.log("OUTPUT:", updatedValues);
                  //     onBlurHandler(updatedValues); // Assuming you have an onChangeHandler function to handle the updated values
                  //   }
                  // }
                }
              }}
              required={field?.isRequired}
              format="LL"
              sx={{
                ...customDataPickerStyleCss({
                  fieldname: values?.[`${field?.fieldname}`],
                  isFocused,
                }),
              }}
              className={styles.inputField}
              disabled={
                inEditMode?.isEditMode
                  ? inEditMode?.isCopy == true
                    ? !field?.isCopyEditable
                    : !field?.isEditable
                  : !field?.isEditable
              }
            />
          </LightTooltip>
        );
      case "time":
        return (
          <LightTooltip title={inputLabel}>
            <TimePicker
              id={uniqueId}
              key={index}
              //   label={
              //     <span>
              //       {inputLabel}
              //       {field?.isRequired && <span style={{ color: "red" }}> *</span>}
              //     </span>
              //   }
              ampm={false}
              viewRenderers={{
                hours: renderTimeViewClock,
                minutes: renderTimeViewClock,
                seconds: renderTimeViewClock,
              }}
              slotProps={{
                field: { clearable: true },
              }}
              inputRef={inputRef}
              onOpen={() => {
                setIsFocused(true);
              }}
              onClose={() => {
                setIsFocused(false);
              }}
              value={
                values[`${field?.fieldname}`]
                  ? dayjs(values[`${field?.fieldname}`])
                  : null
              } // Use the state value, converted to a Day.js object
              // value={
              //   typeof values?.[`${field?.fieldname}datetime`] === "string"
              //     ? null
              //     : dayjs(values?.[`${field?.fieldname}datetime`])
              // } // Day.js objects or null
              onChange={(time) => {
                handleChange(time, field);

                let formattedValue = time;
                if (time && typeof time.format === "function") {
                  formattedValue = dayjs(time).format("YYYY-MM-DD HH:mm:ss");
                  values[`${field?.fieldname}`] = formattedValue; // Adjust the format as needed
                }
                const funcCallString = field?.functionOnChange;
                if (
                  funcCallString === undefined ||
                  funcCallString === null ||
                  funcCallString === ""
                ) {
                  // console.log("No function call string found.");
                } else {
                  let multiCallFunctions = funcCallString.split(";");

                  console.log("multiCallFunctions", multiCallFunctions);

                  multiCallFunctions.forEach((funcCall) => {
                    // console.log("funcCall", funcCall);
                    handleFuncChangeCall(funcCall);
                  });

                  // const funcNameMatch = funcCallString?.match(/^(\w+)/);
                  // // Check for the presence of parentheses to confirm the argument list, even if it's empty
                  // const argsMatch = funcCallString?.match(/\((.*)\)/);

                  // // console.log("funcNameMatch", funcNameMatch?.[1]);
                  // // This will log the entire match including empty parentheses
                  // // console.log("argsMatch", argsMatch?.[1]);

                  // // Check if we have a function name match, and we have an argsMatch (even if there are no arguments)
                  // if (funcNameMatch && argsMatch !== null) {
                  //   const funcName = funcNameMatch[1];
                  //   const argsStr = argsMatch[1] || ""; // argsStr could be an empty string
                  //   // Find the function in formControlValidation by the extracted name
                  //   const func = formControlValidation?.[funcName];
                  //   if (typeof func === "function") {
                  //     // Prepare arguments: If there are no arguments, argsStr will be an empty string
                  //     let args;
                  //     if (argsStr === "") {
                  //       args = {}; // No arguments, so pass an empty object or as per the function's expected parameters
                  //     } else {
                  //       args = { argsStr, values }; // Has arguments, pass them as an object
                  //     }

                  //     // Call the function with the prepared arguments
                  //     const updatedValues = func(args);
                  //     // console.log("OUTPUT:", updatedValues);
                  //     onChangeHandler(updatedValues); // Assuming you have an onChangeHandler function to handle the updated values
                  //   }
                  // }
                }
              }}
              onBlur={(e) => {
                typeof formControlValidation?.[field?.functionOnBlur] ===
                  "function" &&
                  onBlurHandler((state) => {
                    return formControlValidation?.[field?.functionOnBlur](
                      state,
                      field?.fieldname,
                      e.target.value
                    );
                  });

                // values[field?.fieldname] = e.target.value;
                const funcCallString = field?.functionOnBlur;
                if (
                  funcCallString === undefined ||
                  funcCallString === null ||
                  funcCallString === ""
                ) {
                  // console.log("No function call string found.");
                } else {
                  let multiCallFunctions = funcCallString.split(";");

                  console.log("multiCallFunctions", multiCallFunctions);

                  multiCallFunctions.forEach((funcCall) => {
                    // console.log("funcCall", funcCall);
                    handleFuncBlurCall(funcCall);
                  });

                  // const funcNameMatch = funcCallString?.match(/^(\w+)/);
                  // // console.log("funcNameMatch", funcNameMatch?.[1]);
                  // // Check for the presence of parentheses to confirm the argument list, even if it's empty
                  // const argsMatch = funcCallString?.match(/\((.*)\)/);

                  // // console.log("funcNameMatch", funcNameMatch?.[1]);
                  // // This will log the entire match including empty parentheses
                  // // console.log("argsMatch", argsMatch?.[1]);

                  // // Check if we have a function name match, and we have an argsMatch (even if there are no arguments)
                  // if (funcNameMatch && argsMatch !== null) {
                  //   const funcName = funcNameMatch[1];
                  //   const argsStr = argsMatch[1] || ""; // argsStr could be an empty string
                  //   // Find the function in formControlValidation by the extracted name
                  //   const func = formControlValidation?.[funcName];
                  //   if (typeof func === "function") {
                  //     // Prepare arguments: If there are no arguments, argsStr will be an empty string
                  //     let args;
                  //     if (argsStr === "") {
                  //       args = {}; // No arguments, so pass an empty object or as per the function's expected parameters
                  //     } else {
                  //       args = { argsStr, values }; // Has arguments, pass them as an object
                  //     }

                  //     // Call the function with the prepared arguments
                  //     const updatedValues = func(args);
                  //     // console.log("OUTPUT:", updatedValues);
                  //     onBlurHandler(updatedValues); // Assuming you have an onChangeHandler function to handle the updated values
                  //   }
                  // }
                }
              }}
              required={field?.isRequired}
              sx={{
                ...customTimePickerStyleCss({
                  fieldname: values?.[`${field?.fieldname}`],
                  isFocused,
                }),
              }}
              className={styles.inputField}
              disabled={
                inEditMode?.isEditMode
                  ? inEditMode?.isCopy == true
                    ? !field?.isCopyEditable
                    : !field?.isEditable
                  : !field?.isEditable
              }
            />
          </LightTooltip>
        );
      case "datetime":
        return (
          <LightTooltip title={inputLabel}>
            <DateTimePicker
              size="small"
              id={uniqueId}
              key={index}
              //   label={
              //     <span>
              //       {inputLabel}
              //       {field?.isRequired && <span style={{ color: "red" }}> *</span>}
              //     </span>
              //   }
              inputRef={inputRef}
              onOpen={() => {
                setIsFocused(true);
              }}
              onClose={() => {
                setIsFocused(false);
              }}
              ampm={false}
              viewRenderers={{
                hours: renderTimeViewClock,
                minutes: renderTimeViewClock,
                seconds: renderTimeViewClock,
              }}
              slotProps={{
                field: { clearable: true },
              }}
              // value={
              //   typeof values?.[`${field?.fieldname}datetime`] === "string"
              //     ? null
              //     : dayjs(values?.[`${field?.fieldname}datetime`])
              // } // Day.js objects or null value={values?.[field?.fieldname] || null} // Day.js objects or null
              value={
                values[`${field?.fieldname}`]
                  ? dayjs(values[`${field?.fieldname}`])
                  : null
              } // Use the state value, converted to a Day.js object
              onChange={(time) => {
                handleChange(time, field);

                let formattedValue = time;
                if (time && typeof time.format === "function") {
                  formattedValue = dayjs(time).format("YYYY-MM-DD HH:mm:ss");
                  values[`${field?.fieldname}`] = formattedValue; // Adjust the format as needed
                }
                const funcCallString = field?.functionOnChange;
                if (
                  funcCallString === undefined ||
                  funcCallString === null ||
                  funcCallString === ""
                ) {
                  // console.log("No function call string found.");
                } else {
                  let multiCallFunctions = funcCallString.split(";");

                  console.log("multiCallFunctions", multiCallFunctions);

                  multiCallFunctions.forEach((funcCall) => {
                    // console.log("funcCall", funcCall);
                    handleFuncChangeCall(funcCall);
                  });

                  // const funcNameMatch = funcCallString?.match(/^(\w+)/);
                  // // Check for the presence of parentheses to confirm the argument list, even if it's empty
                  // const argsMatch = funcCallString?.match(/\((.*)\)/);

                  // // console.log("funcNameMatch", funcNameMatch?.[1]);
                  // // This will log the entire match including empty parentheses
                  // // console.log("argsMatch", argsMatch?.[1]);

                  // // Check if we have a function name match, and we have an argsMatch (even if there are no arguments)
                  // if (funcNameMatch && argsMatch !== null) {
                  //   const funcName = funcNameMatch[1];
                  //   const argsStr = argsMatch[1] || ""; // argsStr could be an empty string
                  //   // Find the function in formControlValidation by the extracted name
                  //   const func = formControlValidation?.[funcName];
                  //   if (typeof func === "function") {
                  //     // Prepare arguments: If there are no arguments, argsStr will be an empty string
                  //     let args;
                  //     if (argsStr === "") {
                  //       args = {}; // No arguments, so pass an empty object or as per the function's expected parameters
                  //     } else {
                  //       args = { argsStr, values }; // Has arguments, pass them as an object
                  //     }

                  //     // Call the function with the prepared arguments
                  //     const updatedValues = func(args);
                  //     // console.log("OUTPUT:", updatedValues);
                  //     onChangeHandler(updatedValues); // Assuming you have an onChangeHandler function to handle the updated values
                  //   }
                  // }
                }
              }}
              onBlur={(e) => {
                typeof formControlValidation?.[field?.functionOnBlur] ===
                  "function" &&
                  onBlurHandler((state) => {
                    return formControlValidation?.[field?.functionOnBlur](
                      state,
                      field?.fieldname,
                      e.target.value
                    );
                  });

                // values[field?.fieldname] = e.target.value;
                const funcCallString = field?.functionOnBlur;
                if (
                  funcCallString === undefined ||
                  funcCallString === null ||
                  funcCallString === ""
                ) {
                  // console.log("No function call string found.");
                } else {
                  let multiCallFunctions = funcCallString.split(";");

                  console.log("multiCallFunctions", multiCallFunctions);

                  multiCallFunctions.forEach((funcCall) => {
                    // console.log("funcCall", funcCall);
                    handleFuncBlurCall(funcCall);
                  });

                  // const funcNameMatch = funcCallString?.match(/^(\w+)/);
                  // // console.log("funcNameMatch", funcNameMatch?.[1]);
                  // // Check for the presence of parentheses to confirm the argument list, even if it's empty
                  // const argsMatch = funcCallString?.match(/\((.*)\)/);

                  // // console.log("funcNameMatch", funcNameMatch?.[1]);
                  // // This will log the entire match including empty parentheses
                  // // console.log("argsMatch", argsMatch?.[1]);

                  // // Check if we have a function name match, and we have an argsMatch (even if there are no arguments)
                  // if (funcNameMatch && argsMatch !== null) {
                  //   const funcName = funcNameMatch[1];
                  //   const argsStr = argsMatch[1] || ""; // argsStr could be an empty string
                  //   // Find the function in formControlValidation by the extracted name
                  //   const func = formControlValidation?.[funcName];
                  //   if (typeof func === "function") {
                  //     // Prepare arguments: If there are no arguments, argsStr will be an empty string
                  //     let args;
                  //     if (argsStr === "") {
                  //       args = {}; // No arguments, so pass an empty object or as per the function's expected parameters
                  //     } else {
                  //       args = { argsStr, values }; // Has arguments, pass them as an object
                  //     }

                  //     // Call the function with the prepared arguments
                  //     const updatedValues = func(args);
                  //     // console.log("OUTPUT:", updatedValues);
                  //     onBlurHandler(updatedValues); // Assuming you have an onChangeHandler function to handle the updated values
                  //   }
                  // }
                }
              }}
              required={field?.isRequired}
              sx={{
                ...customDateTimePickerStyleCss({
                  fieldname: values?.[`${field?.fieldname}`],
                  isFocused,
                }),
              }}
              className={styles.inputField}
              disabled={
                inEditMode?.isEditMode
                  ? inEditMode?.isCopy == true
                    ? !field?.isCopyEditable
                    : !field?.isEditable
                  : !field?.isEditable
              }
            />
          </LightTooltip>
        );
      case "textarea":
        return (
          <LightTooltip title={inputLabel}>
            {/* <TextareaAutosize
              sx={{
                ...textAreaStyle,
              }}
              // className={`  ${styles.inputField}`}
              className={` h-[27px] text-[10px] text-black leading-normal p-3 rounded-xl rounded-br-none  focus:shadow-lg border border-solid border-slate-300 hover:border-gray-500 dark:hover:border-gray-500 focus:border-gray-500 dark:focus:border-gray-500 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-300 focus-visible:outline-0 box-border ${styles.inputField}`}
              aria-label="empty textarea"
              placeholder={`${inputLabel}${field?.isRequired ? " *" : ""}`}
              required={field?.isRequired}
              value={values?.[field?.fieldname] || ""}
              onChange={(e) => {
                if (
                  e.target.value.toString().length <= field?.size ||
                  !field?.size
                ) {
                  handleChange(e.target.value, field);
                }
              }}
              disabled={
                inEditMode?.isEditMode
                  ? inEditMode?.isCopy == true
                    ? !field?.isCopyEditable
                    : !field?.isEditable
                  : !field?.isEditable
              }
            /> */}
            <div
              className={`textarea-container ${styles.inputField}`}
              style={{ position: "relative" }}
            >
              {/* {(values?.[field?.fieldname] === "" ||
                !values?.[field?.fieldname]) && (
                <label
                  className="custom-placeholder"
                  style={{
                    position: "absolute",
                    left: "12px", // Adjust based on your styling
                    top: "7px", // Adjust based on your styling
                    color: "#757575", // Placeholder text color
                    fontSize: "10px", // Match your textarea font size
                    pointerEvents: "none",
                  }}
                >
                  {inputLabel}
                  {field?.isRequired && <span style={{ color: "red" }}>*</span>}
                </label>
              )} */}
              <TextareaAutosize
                className={` h-[27px] text-[10px] text-black leading-normal p-3 rounded-xl rounded-br-none focus:shadow-lg border border-solid border-slate-300 hover:border-gray-500 dark:hover:border-gray-500 focus:border-gray-500 dark:focus:border-gray-500 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-300 focus-visible:outline-0 box-border ${styles.inputField}`}
                aria-label="empty textarea"
                required={field?.isRequired}
                value={values?.[field?.fieldname] || ""}
                onChange={(e) => {
                  if (
                    e.target.value.toString().length <= field?.size ||
                    !field?.size
                  ) {
                    handleChange(e.target.value, field);
                  }

                  values[field?.fieldname] = e.target.value;
                  const funcCallString = field?.functionOnChange;
                  if (
                    funcCallString === undefined ||
                    funcCallString === null ||
                    funcCallString === ""
                  ) {
                    // console.log("No function call string found.");
                  } else {
                    let multiCallFunctions = funcCallString.split(";");

                    console.log("multiCallFunctions", multiCallFunctions);

                    multiCallFunctions.forEach((funcCall) => {
                      // console.log("funcCall", funcCall);
                      handleFuncChangeCall(funcCall);
                    });

                    // const funcNameMatch = funcCallString?.match(/^(\w+)/);
                    // // Check for the presence of parentheses to confirm the argument list, even if it's empty
                    // const argsMatch = funcCallString?.match(/\((.*)\)/);

                    // // console.log("funcNameMatch", funcNameMatch?.[1]);
                    // // This will log the entire match including empty parentheses
                    // // console.log("argsMatch", argsMatch?.[1]);

                    // // Check if we have a function name match, and we have an argsMatch (even if there are no arguments)
                    // if (funcNameMatch && argsMatch !== null) {
                    //   const funcName = funcNameMatch[1];
                    //   const argsStr = argsMatch[1] || ""; // argsStr could be an empty string
                    //   // Find the function in formControlValidation by the extracted name
                    //   const func = formControlValidation?.[funcName];
                    //   if (typeof func === "function") {
                    //     // Prepare arguments: If there are no arguments, argsStr will be an empty string
                    //     let args;
                    //     if (argsStr === "") {
                    //       args = {}; // No arguments, so pass an empty object or as per the function's expected parameters
                    //     } else {
                    //       args = { argsStr, values }; // Has arguments, pass them as an object
                    //     }

                    //     // Call the function with the prepared arguments
                    //     const updatedValues = func(args);
                    //     // console.log("OUTPUT:", updatedValues);
                    //     onChangeHandler(updatedValues); // Assuming you have an onChangeHandler function to handle the updated values
                    //   }
                    // }
                  }
                }}
                onBlur={() => {
                  setIsFocused(false);
                  // typeof formControlValidation?.[field?.functionOnBlur] ===
                  //   "function" &&
                  //   onBlurHandler((state) => {
                  //     return formControlValidation?.[field?.functionOnBlur]({
                  //       state: state,
                  //       fieldName: field?.fieldname,
                  //       value: e.target.value,
                  //     });
                  //   });

                  // values[field?.fieldname] = e.target.value;
                  const funcCallString = field?.functionOnBlur;
                  if (
                    funcCallString === undefined ||
                    funcCallString === null ||
                    funcCallString === ""
                  ) {
                    // console.log("No function call string found.");
                  } else {
                    let multiCallFunctions = funcCallString.split(";");

                    console.log("multiCallFunctions", multiCallFunctions);

                    multiCallFunctions.forEach((funcCall) => {
                      // console.log("funcCall", funcCall);
                      handleFuncBlurCall(funcCall);
                    });

                    // const funcNameMatch = funcCallString?.match(/^(\w+)/);
                    // // console.log("funcNameMatch", funcNameMatch?.[1]);
                    // // Check for the presence of parentheses to confirm the argument list, even if it's empty
                    // const argsMatch = funcCallString?.match(/\((.*)\)/);

                    // // console.log("funcNameMatch", funcNameMatch?.[1]);
                    // // This will log the entire match including empty parentheses
                    // // console.log("argsMatch", argsMatch?.[1]);

                    // // Check if we have a function name match, and we have an argsMatch (even if there are no arguments)
                    // if (funcNameMatch && argsMatch !== null) {
                    //   const funcName = funcNameMatch[1];
                    //   const argsStr = argsMatch[1] || ""; // argsStr could be an empty string
                    //   // Find the function in formControlValidation by the extracted name
                    //   const func = formControlValidation?.[funcName];
                    //   if (typeof func === "function") {
                    //     // Prepare arguments: If there are no arguments, argsStr will be an empty string
                    //     let args;
                    //     if (argsStr === "") {
                    //       args = {}; // No arguments, so pass an empty object or as per the function's expected parameters
                    //     } else {
                    //       args = { argsStr, values }; // Has arguments, pass them as an object
                    //     }

                    //     // Call the function with the prepared arguments
                    //     const updatedValues = func(args);
                    //     // console.log("OUTPUT:", updatedValues);
                    //     onBlurHandler(updatedValues); // Assuming you have an onChangeHandler function to handle the updated values
                    //   }
                    // }
                  }
                }}
                disabled={
                  inEditMode?.isEditMode
                    ? inEditMode?.isCopy === true
                      ? !field?.isCopyEditable
                      : !field?.isEditable
                    : !field?.isEditable
                }
              />
            </div>
          </LightTooltip>
        );
      case "file":
        return (
          <LightTooltip title={inputLabel}>
            <Button
              component="label"
              className={` h-10 text-sm text-black leading-normal p-3 rounded-xl rounded-br-none  focus:shadow-lg border-gray-300 border  hover:border-gray-500 dark:hover:border-gray-500 focus:border-gray-500 dark:focus:border-gray-500 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-300 focus-visible:outline-0 box-border ${styles.inputField}`}
              role={undefined}
              onChange={(e) => {
                handleChange(e.target.files[0], field);

                values[field?.fieldname] = e.target.files[0];
                const funcCallString = field?.functionOnChange;
                if (
                  funcCallString === undefined ||
                  funcCallString === null ||
                  funcCallString === ""
                ) {
                  // console.log("No function call string found.");
                } else {
                  let multiCallFunctions = funcCallString.split(";");

                  console.log("multiCallFunctions", multiCallFunctions);

                  multiCallFunctions.forEach((funcCall) => {
                    // console.log("funcCall", funcCall);
                    handleFuncChangeCall(funcCall);
                  });

                  // const funcNameMatch = funcCallString?.match(/^(\w+)/);
                  // // Check for the presence of parentheses to confirm the argument list, even if it's empty
                  // const argsMatch = funcCallString?.match(/\((.*)\)/);

                  // // console.log("funcNameMatch", funcNameMatch?.[1]);
                  // // This will log the entire match including empty parentheses
                  // // console.log("argsMatch", argsMatch?.[1]);

                  // // Check if we have a function name match, and we have an argsMatch (even if there are no arguments)
                  // if (funcNameMatch && argsMatch !== null) {
                  //   const funcName = funcNameMatch[1];
                  //   const argsStr = argsMatch[1] || ""; // argsStr could be an empty string
                  //   // Find the function in formControlValidation by the extracted name
                  //   const func = formControlValidation?.[funcName];
                  //   if (typeof func === "function") {
                  //     // Prepare arguments: If there are no arguments, argsStr will be an empty string
                  //     let args;
                  //     if (argsStr === "") {
                  //       args = {}; // No arguments, so pass an empty object or as per the function's expected parameters
                  //     } else {
                  //       args = { argsStr, values }; // Has arguments, pass them as an object
                  //     }

                  //     // Call the function with the prepared arguments
                  //     const updatedValues = func(args);
                  //     // console.log("OUTPUT:", updatedValues);
                  //     onChangeHandler(updatedValues); // Assuming you have an onChangeHandler function to handle the updated values
                  //   }
                  // }
                }
              }}
              sx={{
                ...fileInputStyle,
              }}
              variant="outlined"
              tabIndex={-1}
              startIcon={<CloudUploadIcon />}
              disabled={
                inEditMode?.isEditMode
                  ? inEditMode?.isCopy == true
                    ? !field?.isCopyEditable
                    : !field?.isEditable
                  : !field?.isEditable
              }
            >
              {/* <span>
                {field?.isRequired ? (
                  <>
                    {inputLabel} <span style={{ color: "red" }}> *</span>
                    {fileName[field?.fieldname] && (
                      <span className="ml-2">{fileName[field?.fieldname]}</span>
                    )}
                  </>
                ) : (
                  <>
                    {inputLabel}
                    {fileName[field?.fieldname] && (
                      <span className="ml-2">{fileName[field?.fieldname]}</span>
                    )}
                  </>
                )}
              </span> */}
              <VisuallyHiddenInput type="file" />
            </Button>
          </LightTooltip>
        );
      case "text":
      default:
        return (
          <LightTooltip title={inputLabel}>
            <CustomeTextField
              id={uniqueId}
              type={field?.type}
              //   label={
              //     <>
              //       {inputLabel}
              //       {/* {field?.isRequired && <span style={{ color: "red" }}> *</span>} */}
              //     </>
              //   }
              onFocus={() => {
                setIsFocused(true);
              }}
              sx={{
                ...textInputStyle({
                  fieldname: values?.[`${field?.fieldname}`],
                  isFocused,
                }),
              }}
              variant="outlined"
              size="small"
              name={field?.fieldname}
              required={field?.isRequired}
              style={customWidthTextGridStyle}
              className={`  ${styles.inputField}`}
              value={values?.[field?.fieldname] || ""}
              onChange={(e) => {
                if (
                  e.target.value.toString().length <= field?.size ||
                  !field?.size
                ) {
                  handleChange(e.target.value, field);
                }

                values[field?.fieldname] = e.target.value;
                const funcCallString = field?.functionOnChange;
                if (
                  funcCallString === undefined ||
                  funcCallString === null ||
                  funcCallString === ""
                ) {
                  // console.log("No function call string found.");
                } else {
                  let multiCallFunctions = funcCallString.split(";");

                  console.log("multiCallFunctions", multiCallFunctions);

                  multiCallFunctions.forEach((funcCall) => {
                    // console.log("funcCall", funcCall);
                    handleFuncChangeCall(funcCall);
                  });

                  // const funcNameMatch = funcCallString?.match(/^(\w+)/);
                  // // Check for the presence of parentheses to confirm the argument list, even if it's empty
                  // const argsMatch = funcCallString?.match(/\((.*)\)/);

                  // // console.log("funcNameMatch", funcNameMatch?.[1]);
                  // // This will log the entire match including empty parentheses
                  // // console.log("argsMatch", argsMatch?.[1]);

                  // // Check if we have a function name match, and we have an argsMatch (even if there are no arguments)
                  // if (funcNameMatch && argsMatch !== null) {
                  //   const funcName = funcNameMatch[1];
                  //   const argsStr = argsMatch[1] || ""; // argsStr could be an empty string
                  //   // Find the function in formControlValidation by the extracted name
                  //   const func = formControlValidation?.[funcName];
                  //   if (typeof func === "function") {
                  //     // Prepare arguments: If there are no arguments, argsStr will be an empty string
                  //     let args;
                  //     if (argsStr === "") {
                  //       args = {}; // No arguments, so pass an empty object or as per the function's expected parameters
                  //     } else {
                  //       args = { argsStr, values }; // Has arguments, pass them as an object
                  //     }

                  //     // Call the function with the prepared arguments
                  //     const updatedValues = func(args);
                  //     // console.log("OUTPUT:", updatedValues);
                  //     onChangeHandler(updatedValues); // Assuming you have an onChangeHandler function to handle the updated values
                  //   }
                  // }
                }
              }}
              onBlur={(e) => {
                setIsFocused(false);
                typeof formControlValidation?.[field?.functionOnBlur] ===
                  "function" &&
                  onBlurHandler((state) => {
                    return formControlValidation?.[field?.functionOnBlur]({
                      state: state,
                      fieldName: field?.fieldname,
                      value: e.target.value,
                    });
                  });

                // values[field?.fieldname] = e.target.value;
                const funcCallString = field?.functionOnBlur;
                if (
                  funcCallString === undefined ||
                  funcCallString === null ||
                  funcCallString === ""
                ) {
                  // console.log("No function call string found.");
                } else {
                  let multiCallFunctions = funcCallString.split(";");

                  console.log("multiCallFunctions", multiCallFunctions);

                  multiCallFunctions.forEach((funcCall) => {
                    // console.log("funcCall", funcCall);
                    handleFuncBlurCall(funcCall);
                  });

                  // const funcNameMatch = funcCallString?.match(/^(\w+)/);
                  // // console.log("funcNameMatch", funcNameMatch?.[1]);
                  // // Check for the presence of parentheses to confirm the argument list, even if it's empty
                  // const argsMatch = funcCallString?.match(/\((.*)\)/);

                  // // console.log("funcNameMatch", funcNameMatch?.[1]);
                  // // This will log the entire match including empty parentheses
                  // // console.log("argsMatch", argsMatch?.[1]);

                  // // Check if we have a function name match, and we have an argsMatch (even if there are no arguments)
                  // if (funcNameMatch && argsMatch !== null) {
                  //   const funcName = funcNameMatch[1];
                  //   const argsStr = argsMatch[1] || ""; // argsStr could be an empty string
                  //   // Find the function in formControlValidation by the extracted name
                  //   const func = formControlValidation?.[funcName];
                  //   if (typeof func === "function") {
                  //     // Prepare arguments: If there are no arguments, argsStr will be an empty string
                  //     let args;
                  //     if (argsStr === "") {
                  //       args = {}; // No arguments, so pass an empty object or as per the function's expected parameters
                  //     } else {
                  //       args = { argsStr, values }; // Has arguments, pass them as an object
                  //     }

                  //     // Call the function with the prepared arguments
                  //     const updatedValues = func(args);
                  //     // console.log("OUTPUT:", updatedValues);
                  //     onBlurHandler(updatedValues); // Assuming you have an onChangeHandler function to handle the updated values
                  //   }
                  // }
                }
              }}
              // disabled={
              //   inEditMode?.isEditMode &&
              //   (inEditMode?.isCopy == true
              //     ? !field?.isCopyEditable
              //     : !field?.isEditable)
              // }
              disabled={
                (inEditMode?.isEditMode
                  ? inEditMode?.isCopy == true
                    ? !field?.isCopyEditable
                    : !field?.isEditable
                  : !field?.isEditable) || field?.isDummy
              }
              InputLabelProps={{
                classes: {
                  asterisk: "required-asterisk",
                },
              }}
            />
          </LightTooltip>
        );
    }
  };

  return (
    <div className="flex flex-wrap gap-1">
      <div key={indexValue} className={`flex flex-col `}>
        {renderInputField(fieldData, indexValue)}
      </div>
    </div>
  );
}
