"use client";
import React, { useState, useRef, useEffect, useCallback } from "react";
import styles from "@/components/common.module.css";
import TextField from "@mui/material/TextField";
import { styled } from "@mui/material/styles";
import dayjs from "dayjs";
import { DemoContainer } from "@mui/x-date-pickers/internals/demo";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { TimePicker } from "@mui/x-date-pickers/TimePicker";
import { renderTimeViewClock } from "@mui/x-date-pickers/timeViewRenderers";
import { DateTimePicker } from "@mui/x-date-pickers/DateTimePicker";
import Radio from "@mui/material/Radio";
import RadioGroup from "@mui/material/RadioGroup";
import FormControlLabel from "@mui/material/FormControlLabel";
import Checkbox from "@mui/material/Checkbox";
import FormGroup from "@mui/material/FormGroup";
import PropTypes from "prop-types";
import LightTooltip from "../Tooltip/customToolTip";
import { TextareaAutosize } from "@mui/base/TextareaAutosize";
// import { Textarea } from "@material-tailwind/react";
import { getUserDetails } from "@/helper/userDetails";
import Button from "@mui/material/Button";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import { dynamicDropDownFieldsDataCreateForm } from "@/services/auth/FormControl.services";
import {
  customDataPickerStyleCss,
  customDateTimePickerStyleCss,
  customTimePickerStyleCss,
  // textAreaStyle,
  fileInputStyle,
  textInputStyle,
  numberInputStyle,
  checkBoxStyle,
  multiCheckBoxStyle,
  radioGroupStyle,
  customTextFieldStyles,
  menuListStyles,
  textAreaLabelStyle,
  radioControlStyle,
  menuStyles,
} from "@/app/globalCss";

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

CustomeInputFields.propTypes = {
  inputFieldData: PropTypes.any,
  onChangeHandler: PropTypes.any,
  onBlurHandler: PropTypes.any,
  onValuesChange: PropTypes.any,
  values: PropTypes.any,
  filterData: PropTypes.any,
  newState: PropTypes.any,
};
/* eslint-disable no-unused-vars */
export default function CustomeInputFields({
  inputFieldData,
  // onChangeHandler,
  onBlurHandler,
  onValuesChange,
  values,
  filterData,
  newState,
}) {
  // const [fileName, setFileName] = useState("");
  const { dateFormat } = getUserDetails();
  const acceptButtonRef = useRef(null);
  const handleChange = (value, field) => {
    let formattedValue = value;
    let updatedValues = {};

    // For checkbox component
    if (field.controlname.toLowerCase() === "checkbox") {
      updatedValues[`${field.fieldname}`] = value; // Adjust the format as needed
    }

    // For DatePicker component
    if (value && typeof value.format === "function") {
      formattedValue = dayjs(value).format("YYYY-MM-DD HH:mm:ss");
      updatedValues[`${field.fieldname}`] = formattedValue; // Adjust the format as needed
    }
    // For Autocomplete component (single-select)
    if (
      Array.isArray(value) &&
      field.controlname.toLowerCase() === "dropdown"
    ) {
      Object.assign(updatedValues, { [`${field.fieldname}dropdown`]: value });
      formattedValue = value.map((item) => {
        return field.fieldname == "controlname" || field.fieldname == "type"
          ? item.value
          : item.label;
      });
      if (formattedValue[0] == "reference Column") {
        console.log("reference Column", formattedValue);
        // Object.assign(updatedValues, {
        //   isControlShow: false,
        //   isGridView:true,
        //   isDummy:true
        // })
      }
    }
    if (
      Array.isArray(value) &&
      field.controlname.toLowerCase() === "multiselect"
    ) {
      Object.assign(updatedValues, {
        [`${field.fieldname}multiselect`]: value,
      });
      console.log("value", value);

      formattedValue = value.map((item) => item.value).join(",");
      console.log("formattedValue", formattedValue);
    }
    // Update the state or context with the new value
    Object.assign(updatedValues, {
      [field.fieldname]:
        Array.isArray(formattedValue) &&
        field.controlname.toLowerCase() === "dropdown"
          ? formattedValue.join(",")
          : formattedValue,
    });

    if (onValuesChange) {
      console.log("updatedValues", updatedValues);

      onValuesChange(updatedValues);
    }
  };

  // Render different types of inputs
  const renderInputField = (field, index) => {
    // const [renderedData, setRenderedData] = useState(field?.data?.slice(0, 50));
    const [isFocused, setIsFocused] = useState(false);
    const [dropDownValues, setdropDownValues] = useState([]);
    const [pageNo, setPageNo] = useState(1);
    const [inputValueForDataFetch, setInputValueForDataFetch] = useState("");
    const acceptButtonRef = useRef(null);
    const inputRef = useRef(null);
    const [isNextPageNull, setIsNextPageNull] = useState(false);

    useEffect(() => {
      const handleFocus = () => {
        setIsFocused(true);
      };

      if (
        (field.controlname.toLowerCase() === "dropdown" &&
          field?.data?.length == 0) ||
        (field.controlname.toLowerCase() === "multiselect" &&
          field?.data?.length == 0)
      ) {
        fetchData(
          field,
          pageNo,
          inputValueForDataFetch,
          values?.[field.fieldname],
          "first"
        );
      } else if (
        field.controlname.toLowerCase() === "dropdown" ||
        field.controlname.toLowerCase() === "multiselect"
      ) {
        // setdropDownValues(field.data);
        // setRenderedData(field.data);
        fetchData(
          field,
          pageNo,
          inputValueForDataFetch,
          values?.[field.fieldname],
          "first"
        );
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
    }, [pageNo, values]);

    useEffect(() => {
      const shouldFetchData =
        (field.controlname.toLowerCase() === "dropdown" &&
          field.dropDownValues?.length === 0) ||
        (field.controlname.toLowerCase() === "multiselect" &&
          field.dropDownValues?.length === 0 &&
          values[field.fieldname] !== undefined);

      if (shouldFetchData) {
        fetchData(
          field,
          pageNo,
          inputValueForDataFetch,
          values[field.fieldname],
          "first"
        );
      } else if (
        field.controlname.toLowerCase() === "dropdown" ||
        field.controlname.toLowerCase() === "multiselect"
      ) {
        setdropDownValues(field.data);
      }
    }, [field, values?.[field.fieldname]]);

    function dynamicValuReplace(inputString) {
      // Convert double quotes string to backtick string
      inputString = inputString.replace(/"/g, "`");

      // Extract variable names from the inputString
      let variableNames = inputString.match(/\${(.*?)}/g);

      // If no variables are found, return the input string as is
      if (!variableNames) {
        return inputString;
      }

      // Replace all variables in inputString with their corresponding values
      for (let i = 0; i < variableNames.length; i++) {
        let variableName = variableNames[i].replace("${", "").replace("}", "");
        let variableValue = eval(variableName); // Note: This is potentially unsafe, use with caution
        inputString = inputString.replace(
          new RegExp("\\${" + variableName + "}", "g"),
          variableValue
        );
      }
      return inputString;
    }

    async function fetchData(field, pageNo, inputValueForDataFetch, value) {
      const requestData = {
        // onfilterkey: filterData.key.length > 0 ? filterData.key : "status",
        onfilterkey: "status",
        // onfiltervalue: filterData.value.length > 0 ? filterData.value : 1,
        onfiltervalue: 1,
        referenceTable: field.referenceTable,
        referenceColumn: field.referenceColumn,
        dropdownFilter:
          field.dropdownFilter &&
          field.dropdownFilter !== null &&
          field.dropdownFilter !== ""
            ? dynamicValuReplace(field.dropdownFilter)
            : "",
        search: inputValueForDataFetch,
        pageNo: inputValueForDataFetch.length > 0 ? 1 : pageNo,
        value: "",
        // value: typeof value == "object" ? value?.value : value,
      };
      try {
        if (isNextPageNull) {
          return false;
        } else {
          const apiResponse = await dynamicDropDownFieldsDataCreateForm(
            requestData
          );
          if (apiResponse.success == false) {
            return false;
          }
          if (apiResponse.nextPage === null) {
            // Handle the case where apiResponse is falsy (e.g., null, undefined)
            setIsNextPageNull(true);
          }

          // A helper function to update state, reducing redundancy
          const updateState = (data) => {
            setdropDownValues((prev) => [
              ...(Array.isArray(prev) ? prev : []),
              ...data,
            ]);
          };

          // For the first page, replace the existing values; for others, append to them
          if (pageNo == 1 || inputValueForDataFetch.length > 0) {
            setdropDownValues(apiResponse.data);
            // setRenderedData(apiResponse.data);
          } else {
            updateState(apiResponse.data);
          }

          return true;
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        return false;
      }
    }
    const [showLabel, setShowLabel] = useState(false);

    // const handleScroll = () => {
    //   setPageNo((prevPageNo) => prevPageNo + 1);
    //   console.log("You have reached the bottom of the scroll.");
    //   // const container = menuRef.current;
    //   // if (container) {
    //   //   const { scrollTop, scrollHeight, clientHeight } = container;
    //   //   const isAtBottom = scrollTop + clientHeight >= scrollHeight - 5;
    //   //   if (isAtBottom) {

    //   //   }
    //   // }
    // };

    const uniqueId = `${field.controlname}_${field.fieldname}`;
    let inputLabel = field.yourlabel;
    // const inputChangeSubject = useRef(new Subject());
    const prevPageNo = useRef();

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

    const debouncedFetch = useCallback(
      debounce((searchValue) => {
        // Your fetch logic here
        console.log("Fetching data for:", searchValue);
        fetchData(
          field,
          pageNo,
          searchValue,
          values?.[field.fieldname],
          "search"
        );
      }, 50),
      []
    ); // 50ms debounce time

    const handleInputChange = (newInputValue) => {
      // console.log("drop values ", dropDownValues);
      debouncedFetch(newInputValue);
    };

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
      menuList: () => ({
        ...menuListStyles,
      }),
      option: (provided) => ({
        ...provided,
        backgroundColor: "var(--accordian-summary-bg)",
        color: "var(--table-text-color)", // Normal text color
        ":hover": {
          ...provided[":hover"],
          backgroundColor: "var(--inputBorderColor)", // Background color on hover
          color: "var(--inputBg)",
        },
      }),

      control: (base) => ({
        ...base,
        minHeight: "27px",
        borderWidth: 1,
        borderColor: "var(--inputBorderColor)",
        backgroundColor: "var(--inputBg)",
        boxShadow: "none",
        borderRadius: "4px",
        "&:hover": { borderColor: "var(--inputBorderHoverColor)" },
        // color: "#00000099",
        color: "var(--inputTextColor)",
        width: "12rem",
        height: "27px ",
        zindex: 999,
        fontSize: "10px",
        position: "relative",
      }),
      indicatorSeparator: (base) => ({
        ...base,
        display: "none",
      }),
      placeholder: () => ({
        // ...base,
        color: "rgba(0, 0, 0, 0.75)",
        margin: 0,
        padding: 0,
        fontSize: "10px",
        position: "relative",
        bottom: "2px",
        display: !showLabel ? "inline" : "none",
      }),
      dropdownIndicator: (base) => ({
        ...base,
        "& svg": {
          width: "12px !important", // Adjust the size of the arrow icon
          height: "12px !important", // Adjust the size of the arrow icon
        },
      }),

      clearIndicator: (base) => ({
        ...base,
        "& svg": {
          width: "12px !important", // Adjust the size of the clear icon
          height: "12px !important", // Adjust the size of the clear icon
        },
      }),
      singleValue: (base) => ({
        ...base,
        // color: "#FFFFFF",
        color: "var(--inputTextColor)",
        fontSize: "var(--inputFontSize)",
        fontWeight: "var(--inputFontWeight)",
      }),
      valueContainer: (provided) => ({
        ...provided,
        flexWrap: "nowrap", // Set selected values to not wrap
        // overflow: "hidden", // Optional: hides overflowed content
      }),
      input: (base) => ({
        ...base,
        color: "var(--inputTextColor)", // Set color of typed text to "var(--table-text-color)"
      }),
    };

    let callInputChangeFunc = true;
    const [inputValueChange, setInputValueChange] = useState("");
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
            const isBottom = scrollHeight - scrollTop === clientHeight + 10;
            if (isBottom && scrollPosition !== scrollTop) {
              setScrollPosition(scrollTop);
              setPageNo((prevPageNo) => prevPageNo + 1);
            }
            // const threshold = 10; // You can adjust the threshold value as needed
            // const isNearBottom =
            //   scrollHeight - scrollTop <= clientHeight + threshold;

            // if (isNearBottom && scrollPosition !== scrollTop) {
            //   setScrollPosition(scrollTop);
            //   setPageNo((prevPageNo) => prevPageNo + 1);
            // }
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

    const selectRef = useRef(null);
    const [menuOpen, setMenuOpen] = useState(false);

    switch (field.controlname.toLowerCase()) {
      case "dropdown":
        return (
          <LightTooltip title={isFocused ? "" : field.yourlabel}>
            <div className="relative ">
              <p
                className={` absolute left-[11px] z-[1] px-2 transition-all duration-200 ${
                  showLabel ||
                  values?.[field.fieldname] ||
                  inputValueChange.length > 0
                    ? "bg-[--inputBg] pr-[10%] leading-[0.8px] top-[0px] scale-75 opacity-100" // Label moves to the top
                    : inputValueChange.length == 0 || !values[field.fieldname]
                    ? "top-[calc(100%-1.2rem)] opacity-100"
                    : "" // Label sits at the bottom, emulating a placeholder
                }`}
                style={{ fontSize: "var(--inputFontSize)" }}
              >
                <span
                  onClick={() => {
                    setShowLabel(true);
                    if (selectRef.current) {
                      setMenuOpen(true);
                      selectRef.current.focus();
                    }
                  }}
                  style={{ color: "rgba(0, 0, 0, 0.75)" }}
                >
                  {field.isRequired ? (
                    <span className={`${styles.inputTextColor}`}>
                      {inputLabel} <span style={{ color: "red" }}> *</span>
                    </span>
                  ) : (
                    <span className={`${styles.inputTextColor}`}>
                      {inputLabel}
                    </span>
                  )}
                </span>
              </p>

              <Select
                ref={selectRef}
                menuPortalTarget={document.body}
                backspaceRemovesValue={true}
                isClearable={true}
                styles={customStyles}
                menuPlacement="auto"
                placeholder=""
                options={dropDownValues}
                className={`w-[12rem] ${styles.inputField}  `}
                // onMenuScrollToBottom={() => {
                //   console.log("scrolling");
                //   handleScroll();
                // }}
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
                value={
                  dropDownValues?.find((item) =>
                    field.fieldname == "controlname" ||
                    field.fieldname == "type"
                      ? item.value == values?.[field.fieldname]
                      : item.label === values?.[field.fieldname]
                  ) || null
                }
                noOptionsMessage={() => "No records found"}
                onMenuOpen={() => {
                  setMenuOpen(true);
                  setInputValueForDataFetch("");
                  setPageNo(1);
                  setIsFocused(true);
                  setShowLabel(true);
                  // if (!values?.[field.fieldname]) {
                  fetchData(field, 1, inputValueForDataFetch, "", "onOpen");
                  // }
                }}
                menuIsOpen={menuOpen}
                onMenuClose={() => {
                  setMenuOpen(false);
                  setInputValueForDataFetch("");
                  // setPageNo(1);
                  setIsFocused(true);
                  setIsNextPageNull(false);
                  setShowLabel(false);
                  // fetchData(field, 1, inputValueForDataFetch, "", "onClose");
                }}
                onFocus={() => {
                  if (values[field.fieldname] !== null) {
                    // values[field.fieldname] = "";
                    setIsFocused(true);
                  }
                  setIsFocused(true);
                  setInputValueForDataFetch("");
                  setPageNo(1);
                  setShowLabel(true);
                }}
                onChange={(newValue) => {
                  callInputChangeFunc = false;
                  handleChange(newValue ? [newValue] : [], field);

                  callInputChangeFunc = true;
                }}
                onBlur={() => {
                  if (field) {
                    setIsFocused(false);
                  } else {
                    setIsFocused(true);
                  }
                  // setIsFocused(true);
                  setMenuOpen(false);
                  setInputValueForDataFetch("");
                  // setPageNo(1);
                  if (inputLabel.length == 0 && values?.[field.fieldname]) {
                    setShowLabel(false);
                  }
                }}
                onInputChange={(value, e) => {
                  setInputValueChange(value);
                  if (callInputChangeFunc && e.action === "input-change") {
                    handleInputChange(value);
                  }
                }}
              />
            </div>
          </LightTooltip>
        );
      case "multiselect":
        return (
          <LightTooltip title={field.yourlabel}>
            <div className="relative ">
              <p
                className={` absolute left-[11px] z-[1] px-2 transition-all duration-200 ${
                  showLabel ||
                  values?.[field.fieldname] ||
                  inputValueChange.length > 0
                    ? "bg-[--inputBg] pr-[10%] leading-[0.8px] top-[0px] scale-75 opacity-100" // Label moves to the top
                    : inputValueChange.length == 0 || !values[field.fieldname]
                    ? "top-[calc(100%-1.2rem)] opacity-100"
                    : "" // Label sits at the bottom, emulating a placeholder
                }`}
                style={{ fontSize: "var(--inputFontSize)" }}
              >
                <span
                  onClick={() => {
                    setShowLabel(true);
                    if (selectRef.current) {
                      setMenuOpen(true);
                      selectRef.current.focus();
                    }
                  }}
                  style={{ color: "rgba(0, 0, 0, 0.75)" }}
                >
                  {field.isRequired ? (
                    <span className={`${styles.inputTextColor}`}>
                      {inputLabel} <span style={{ color: "red" }}> *</span>
                    </span>
                  ) : (
                    <span className={`${styles.inputTextColor}`}>
                      {inputLabel}
                    </span>
                  )}
                </span>
              </p>
              <Select
                isMulti
                menuPortalTarget={document.body}
                backspaceRemovesValue={true}
                isClearable={true}
                styles={customStyles}
                menuPlacement="auto"
                placeholder=""
                options={dropDownValues}
                className={`w-[12rem] ${styles.inputField}  `}
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
                // onMenuScrollToBottom={() => {
                //   console.log("scrolling");
                //   handleScroll();
                // }}
                value={
                  values?.[`${field.fieldname}multiselect`] ||
                  dropDownValues?.length > 0
                    ? dropDownValues?.filter((value) =>
                        values?.[`${field.fieldname}`]
                          ?.split(",")
                          ?.includes(value.value.toString())
                      )
                    : [] || []
                }
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
                  setPageNo(1);
                  setIsFocused(true);
                  setIsNextPageNull(false);
                  fetchData(field, 1, inputValueForDataFetch, "", "onClose");
                }}
                onFocus={() => {
                  console.log("Focus");
                  setIsFocused(true);
                  setInputValueForDataFetch("");
                  setPageNo(1);
                }}
                onChange={(newValue) => {
                  console.log("newValue", newValue);
                  handleChange(newValue ? newValue : [], field);
                }}
                onBlur={() => {
                  if (field) {
                    setIsFocused(false);
                  } else {
                    setIsFocused(true);
                  }
                  // setIsFocused(true);

                  setInputValueForDataFetch("");
                  // setPageNo(1);
                }}
                onInputChange={(value, e) => {
                  console.log("callInputChangeFunc", e);
                  if (callInputChangeFunc && e.action === "input-change") {
                    handleInputChange(value);
                  }
                }}
              />
            </div>
          </LightTooltip>
        );
      case "radio":
        return (
          <LightTooltip title={inputLabel}>
            <div
              className={` relative flex items-center w-[12rem] border border-gray-300  ${styles.inputField}`}
            >
              <div
                id={uniqueId}
                key={index}
                className={`absolute px-2 inline bg-[--inputBg] pr-[10%] leading-[0.8px] top-[-1px] scale-75 left-[8px] p-0 `}
                style={{ fontSize: "var(--inputFontSize)" }}
              >
                {
                  <span className={`${styles.inputTextColor}`}>
                    {inputLabel}
                    {field.isRequired && (
                      <span style={{ color: "red" }}>*</span>
                    )}
                  </span>
                }
              </div>
              <RadioGroup
                row
                aria-labelledby={uniqueId}
                name="position"
                defaultValue="top"
                className=""
                value={
                  values?.[field.fieldname] !== undefined
                    ? values?.[field.fieldname]
                    : null
                }
                onChange={(e) => {
                  // Check if the clicked radio button is already selected
                  const newValue =
                    e.target.value === values?.[field.fieldname]
                      ? null
                      : e.target.value;
                  handleChange(newValue, field);
                }}
                sx={{
                  ...radioGroupStyle,
                }}

                // onBlur={formControlValidation[field.functionOnBlur]}
              >
                {JSON.parse(field.dropDownValues)?.map((item, index) => (
                  <FormControlLabel
                    key={index}
                    value={item.id}
                    control={
                      <Radio
                        sx={{
                          ...radioControlStyle,
                        }}
                      />
                    }
                    label={item.value.toString()}
                    labelPlacement="start"
                    sx={{
                      ...radioControlStyle,
                    }}
                  />
                ))}
              </RadioGroup>
            </div>
          </LightTooltip>
        );
      case "checkbox":
        return (
          <LightTooltip title={field.yourlabel}>
            <div
              className={`relative flex items-center h-[27px] border-gray-300 hover:border-[var(--inputBorderHoverColor)]  w-[12rem] border ${styles.inputField}`}
            >
              <div
                className={`absolute px-2 inline bg-[--inputBg] pr-[10%] leading-[0.8px] top-[-1px] scale-75 left-[8px]`}
                style={{
                  fontSize: "var(--inputFontSize)",
                  fontWeight: "var(--inputFontWeight)",
                }}
              >
                {
                  <span className={`${styles.inputTextColor}`}>
                    {inputLabel}
                    {field.isRequired && (
                      <span style={{ color: "red" }}>*</span>
                    )}
                  </span>
                }
              </div>
              <div key={index} className="ml-4  h-6">
                <FormGroup aria-label="position" row className="h-6 inline">
                  <FormControlLabel
                    key={index}
                    control={
                      <Checkbox
                        sx={{
                          ...checkBoxStyle,
                        }}
                        color="secondary"
                        checked={values?.[field.fieldname] ? true : false}
                        onChange={(e) => {
                          handleChange(e.target.checked, field);
                        }}
                        inputProps={{ "aria-label": "controlled" }}
                      />
                    }
                    labelPlacement="end"
                  />
                </FormGroup>
              </div>
            </div>
          </LightTooltip>
        );
      // case "checkbox":
      //   return (
      //     <LightTooltip title={field.yourlabel}>
      //       <div
      //         className={`relative flex items-center h-[27px]  w-max ${styles.pageBackground} ${styles.inputField}`}
      //       >
      //         {/* <div
      //           className={`absolute px-2 inline top-[10px] left-[30px] text-[8px] ${styles.pageBackground}`}
      //         >
      //           {
      //             <span className={`${styles.inputTextColor}`}>
      //               {inputLabel}
      //               {field.isRequired && (
      //                 <span style={{ color: "red" }}>*</span>
      //               )}
      //             </span>
      //           }
      //         </div> */}
      //         <div key={index} className="h-6">
      //           <FormGroup aria-label="position" row className="h-6 inline">
      //             <FormControlLabel
      //               key={index}
      //               control={
      //                 <Checkbox
      //                   sx={{
      //                     ...checkBoxStyle,
      //                   }}
      //                   color="secondary"
      //                   checked={values?.[field.fieldname] ? true : false}
      //                   onChange={(e) => {
      //                     handleChange(e.target.checked, field);
      //                   }}
      //                   inputProps={{ "aria-label": "controlled" }}
      //                 />
      //               }
      //               label={field.yourlabel}
      //               labelPlacement="start"
      //               className={`${styles.pageBackground}`}
      //               sx={{
      //                 margin: "0px 5px",
      //               }}
      //             />
      //           </FormGroup>
      //         </div>
      //       </div>
      //     </LightTooltip>
      //   );
      case "multicheckbox":
        return (
          <LightTooltip title={field.yourlabel}>
            <div
              className={`relative flex items-center h-[38px] border-gray-300  w-[12rem] border  ${styles.inputField}`}
            >
              {/* <FormLabel component="legend" className="flex-none">
                {field.isRequired ? `${field.yourlabel} *` : field.yourlabel}
              </FormLabel> */}
              <div className="absolute px-2 inline top-[-8px] left-[8px]  bg-white text-[8px] ">
                {
                  <span>
                    {inputLabel}
                    {field.isRequired && (
                      <span style={{ color: "red" }}>*</span>
                    )}
                  </span>
                }
              </div>
              <div key={index} className="ml-2">
                <FormGroup aria-label="position" row className="flex">
                  {field.dropDownValues.map((item, index) => {
                    console.log("item", values?.[field.fieldname]);
                    // const isChecked = values?.[field.fieldname]?.includes(
                    //   item.value
                    // );
                    let isCheck = values?.[field.fieldname]
                      ?.split(",")
                      ?.includes(item.id.toString());

                    return (
                      <FormControlLabel
                        key={index}
                        control={
                          <Checkbox
                            checked={isCheck ? true : false}
                            sx={{
                              // "& .MuiSvgIcon-root": {
                              //   height: 14,
                              //   width: 14,
                              // },
                              ...multiCheckBoxStyle,
                            }}
                            onChange={(e) => {
                              let updatedValues = values?.[field.fieldname]
                                ? [...values[field.fieldname]]
                                : [];
                              if (e.target.checked) {
                                // Add value to array if not already present
                                if (!updatedValues.includes(item.value)) {
                                  updatedValues.push(item.value);
                                }
                              } else {
                                // Remove value from array
                                updatedValues = updatedValues.filter(
                                  (val) => val !== item.value
                                );
                              }
                              handleChange(updatedValues.join(","), field);
                            }}
                            inputProps={{ "aria-label": "controlled" }}
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
              label={
                <span
                  className={`${styles.inputTextColor}`}
                  style={{ fontSize: "var(--inputFontSize)" }}
                >
                  {inputLabel}
                  {field.isRequired && <span style={{ color: "red" }}>*</span>}
                </span>
              }
              variant="outlined"
              size="small"
              sx={{
                // "& .MuiInputBase-input": { fontSize: "0.9rem" },
                // "& .MuiInputBase-input": {
                //   fontSize: "10px",
                //   marginX: "15px",
                // },
                // "& .MuiOutlinedInput-input": {
                //   padding: 0,
                //   height: "27px",
                // },
                // "& .MuiInputLabel-root": {
                //   position: "absolute",
                //   top: "-1px",
                //   paddingLeft: "4px",
                // },
                ...numberInputStyle({
                  fieldname: values?.[`${field.fieldname}`],
                  isFocused,
                }),
              }}
              onFocus={() => {
                setIsFocused(true);
              }}
              onBlur={() => {
                onBlurHandler;
                setIsFocused(false);
              }}
              name={field.fieldname}
              required={field.isRequired}
              className={` w-[12rem] ${styles.inputField}`}
              type="number"
              value={values?.[field.fieldname] || ""}
              onChange={(e) => handleChange(e.target.value, field)}
              // onBlur={onBlurHandler}
              inputProps={{
                min: "1", // Minimum value allowed
                max: "10", // Maximum value allowed
              }}
            />
          </LightTooltip>
        );
      case "date":
        return (
          <LightTooltip title={field.yourlabel}>
            <DatePicker
              id={uniqueId}
              key={index}
              label={
                <span className={`${styles.inputTextColor}`}>
                  {inputLabel}
                  {field.isRequired && <span style={{ color: "red" }}>*</span>}
                </span>
              }
              onOpen={() => {
                setIsFocused(true);
              }}
              inputRef={inputRef}
              value={
                values[`${field.fieldname}`]
                  ? dayjs(values[`${field.fieldname}`])
                  : null
              } // Use the state value, converted to a Day.js object
              onChange={(date) => {
                handleChange(date, field);

                let formattedValue = date;
                if (date && typeof date.format === "function") {
                  if (dateFormat === "" || dateFormat === null) {
                    formattedValue = dayjs(date)
                      .format("DD-MM-YYYY")
                      .toUpperCase();
                  } else {
                    formattedValue = dayjs(date)
                      .format(dateFormat)
                      .toUpperCase();
                  }
                  values[`${field.fieldname}`] = formattedValue; // Adjust the format as needed
                }
                // Automatically click the accept button when a date is selected
                if (acceptButtonRef.current) {
                  acceptButtonRef.current.click();
                }
              }}
              slotProps={{
                field: { clearable: true },
                actionBar: {
                  // The actions will be the same between desktop and mobile
                  actions: ["cancel"],
                },
                switchViewIcon: {
                  sx: {
                    color: "var(--table-text-color)",
                    backgroundColor: "var(--accordion-summary-bg)",
                  },
                },
                day: {
                  sx: {
                    color: "var(--table-text-color)",
                    backgroundColor: "var(--accordion-summary-bg)",
                  },
                },

                layout: {
                  sx: {
                    color: "var(--table-text-color)",
                    borderRadius: "2px",
                    borderWidth: "1px",
                    borderColor: "var(--accordion-summary-bg)",
                    border: "1px solid",
                    backgroundColor: "var(--accordion-summary-bg)",
                  },
                },
                leftArrowIcon: {
                  sx: {
                    color: "var(--table-text-color)",
                    backgroundColor: "var(--accordion-summary-bg)",
                  },
                },
                rightArrowIcon: {
                  sx: {
                    color: "var(--table-text-color)",
                    backgroundColor: "var(--accordion-summary-bg)",
                  },
                },
                calendarHeader: {
                  sx: {
                    color: "var(--table-text-color)",
                    backgroundColor: "var(--accordion-summary-bg)",
                  },
                },
                weekDayLabel: {
                  sx: {
                    color: "var(--table-text-color)",
                    backgroundColor: "var(--accordion-summary-bg)",
                  },
                },
              }}
              onBlur={onBlurHandler}
              required={field.isRequired}
              format="LL"
              sx={{
                // width: "15rem",
                // "& .MuiInputBase-input": {
                //   fontSize: "0.8rem",
                // },
                // "& .MuiOutlinedInput-root": {
                //   height: "27px",
                // },
                // "& .MuiInputLabel-root": {
                //   // marginBottom:'8px'
                //   // lineHeight: "20px",
                //   // fontSize: "0.8rem",

                //   // marginTop: "-6px",
                //   fontSize: "10px",
                //   position: "absolute",
                //   top:
                //     isFocused || values?.[`${field.fieldname}`]
                //       ? "0px"
                //       : "-10px",
                // },
                ...customDataPickerStyleCss({
                  fieldname: values?.[`${field.fieldname}`],
                  isFocused,
                }),
              }}
              className={styles.inputField}
            />
          </LightTooltip>
        );
      case "time":
        return (
          <LightTooltip title={field.yourlabel}>
            <DemoContainer components={["TimePicker"]}>
              <TimePicker
                id={uniqueId}
                key={index}
                onOpen={() => {
                  setIsFocused(true);
                }}
                inputRef={inputRef}
                label={
                  <span>
                    {inputLabel}
                    {field.isRequired && (
                      <span style={{ color: "red" }}> *</span>
                    )}
                  </span>
                }
                ampm={false}
                viewRenderers={{
                  hours: renderTimeViewClock,
                  minutes: renderTimeViewClock,
                  seconds: renderTimeViewClock,
                }}
                slotProps={{
                  field: { clearable: true },
                  actionBar: {
                    // The actions will be the same between desktop and mobile
                    actions: ["cancel"],
                  },
                  switchViewIcon: {
                    sx: {
                      color: "var(--table-text-color)",
                      backgroundColor: "var(--accordion-summary-bg)",
                    },
                  },
                  layout: {
                    sx: {
                      color: "var(--table-text-color)",
                      borderRadius: "2px",
                      borderWidth: "1px",
                      borderColor: "var(--accordion-summary-bg)",
                      border: "1px solid",
                      backgroundColor: "var(--accordion-summary-bg)",
                    },
                  },
                  leftArrowIcon: {
                    sx: {
                      color: "var(--table-text-color)",
                      backgroundColor: "var(--accordion-summary-bg)",
                    },
                  },
                  rightArrowIcon: {
                    sx: {
                      color: "var(--table-text-color)",
                      backgroundColor: "var(--accordion-summary-bg)",
                    },
                  },
                  calendarHeader: {
                    sx: {
                      color: "var(--table-text-color)",
                      backgroundColor: "var(--accordion-summary-bg)",
                    },
                  },
                }}
                value={
                  values[`${field.fieldname}`]
                    ? dayjs(values[`${field.fieldname}`])
                    : null
                } // Use the state value, converted to a Day.js object
                onChange={(time) => handleChange(time, field)}
                onBlur={onBlurHandler}
                required={field.isRequired}
                sx={{
                  // width: "15rem",
                  // "& .MuiInputBase-input": {
                  //   fontSize: "0.8rem",
                  // },
                  // "& .MuiOutlinedInput-root": {
                  //   height: "27px",
                  // },
                  // "& .MuiInputLabel-root": {
                  //   // marginBottom:'8px'
                  //   lineHeight: "20px",
                  //   // fontSize: "0.8rem",

                  //   // marginTop: "-6px",
                  //   fontSize: "0.8rem",
                  //   position: "absolute",
                  //   // top: "0px",
                  //   top:
                  //     isFocused || values?.[`${field.fieldname}`]
                  //       ? "0px"
                  //       : "-10px",
                  // },
                  ...customTimePickerStyleCss({
                    fieldname: values?.[`${field.fieldname}`],
                    isFocused,
                  }),
                }}
                className={styles.inputField}
              />
            </DemoContainer>
          </LightTooltip>
        );
      case "datetime":
        return (
          <LightTooltip title={field.yourlabel}>
            <DateTimePicker
              id={uniqueId}
              key={index}
              onOpen={() => {
                setIsFocused(true);
              }}
              inputRef={inputRef}
              label={
                <span>
                  {inputLabel}
                  {field.isRequired && <span style={{ color: "red" }}>*</span>}
                </span>
              }
              ampm={false}
              viewRenderers={{
                hours: renderTimeViewClock,
                minutes: renderTimeViewClock,
                seconds: renderTimeViewClock,
              }}
              slotProps={{
                field: { clearable: true },
                actionBar: {
                  // The actions will be the same between desktop and mobile
                  actions: ["cancel"],
                },
                switchViewIcon: {
                  sx: {
                    color: "var(--table-text-color)",
                    backgroundColor: "var(--accordion-summary-bg)",
                  },
                },
                day: {
                  sx: {
                    color: "var(--table-text-color)",
                    backgroundColor: "var(--accordion-summary-bg)",
                  },
                },

                layout: {
                  sx: {
                    color: "var(--table-text-color)",
                    borderRadius: "2px",
                    borderWidth: "1px",
                    borderColor: "var(--accordion-summary-bg)",
                    border: "1px solid",
                    backgroundColor: "var(--accordion-summary-bg)",
                  },
                },
                leftArrowIcon: {
                  sx: {
                    color: "var(--table-text-color)",
                    backgroundColor: "var(--accordion-summary-bg)",
                  },
                },
                rightArrowIcon: {
                  sx: {
                    color: "var(--table-text-color)",
                    backgroundColor: "var(--accordion-summary-bg)",
                  },
                },
                calendarHeader: {
                  sx: {
                    color: "var(--table-text-color)",
                    backgroundColor: "var(--accordion-summary-bg)",
                  },
                },
                weekDayLabel: {
                  sx: {
                    color: "var(--table-text-color)",
                    backgroundColor: "var(--accordion-summary-bg)",
                  },
                },
              }}
              value={
                values[`${field.fieldname}`]
                  ? dayjs(values[`${field.fieldname}`])
                  : null
              } // Use the state value, converted to a Day.js object
              onChange={(time) => handleChange(time, field)}
              onBlur={onBlurHandler}
              required={field.isRequired}
              sx={{
                // width: "15rem",
                // "& .MuiInputBase-input": {
                //   fontSize: "0.8rem",
                // },
                // "& .MuiOutlinedInput-root": {
                //   height: "27px",
                // },
                // "& .MuiInputLabel-root": {
                //   // marginBottom:'8px'
                //   // lineHeight: "20px",
                //   // fontSize: "0.8rem",

                //   // marginTop: "-6px",
                //   fontSize: "0.8rem",
                //   position: "absolute",
                //   // top: "0px",
                //   top:
                //     isFocused || values?.[`${field.fieldname}`]
                //       ? "0px"
                //       : "-10px",
                // },
                ...customDateTimePickerStyleCss({
                  fieldname: values?.[`${field.fieldname}`],
                  isFocused,
                }),
              }}
              className={styles.inputField}
            />
          </LightTooltip>
        );
      case "file":
        return (
          <LightTooltip title={inputLabel}>
            <Button
              component="label"
              className={` h-10 text-sm text-black leading-normal p-3 rounded-xl rounded-br-none  focus:shadow-lg border-gray-300 border  hover:border-gray-500 dark:hover:border-gray-500 focus:border-gray-500 dark:focus:border-gray-500 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-300 focus-visible:outline-0 box-border ${styles.inputField}`}
              role={undefined}
              sx={{
                // justifyContent: "flex-start",
                // borderColor: "#00000029",
                // color: "#00000099",
                // "& .MuiInputBase-input": { color: "black" },
                // height: "27px",
                // ".MuiButtonBase-root-MuiButton-root": {
                //   justifyContent: "flex-start",
                // },
                ...fileInputStyle,
              }}
              variant="outlined"
              tabIndex={-1}
              startIcon={<CloudUploadIcon />}
            >
              <span>
                {field.isRequired ? (
                  <>
                    {inputLabel} <span style={{ color: "red" }}>*</span>
                  </>
                ) : (
                  inputLabel
                )}
              </span>
              <VisuallyHiddenInput type="file" />
            </Button>
          </LightTooltip>
        );
      case "textarea":
        return (
          <LightTooltip title={inputLabel}>
            <div
              className={`textarea-container `}
              style={{ position: "relative", minHeight: "27px" }}
            >
              {(values?.[field.fieldname] === "" ||
                !values?.[field.fieldname]) && (
                <label
                  className="custom-placeholder"
                  style={{
                    ...textAreaLabelStyle,
                    top: "7px", // Adjust based on your styling
                  }}
                >
                  {inputLabel}
                  {field.isRequired && <span style={{ color: "red" }}>*</span>}
                </label>
              )}
              <TextareaAutosize
                className={`resize w-[12rem]  disabled:border-[#B2BAC2] hover:border-[#B2BAC2] disabled:text-[#B2BAC2] focus:outline-none focus:border-[#B2BAC2] overflow-none h-[27px] text-[10px] pt-[6px] pl-[10px]  leading-normal rounded-xl rounded-br-none  border border-[#E0E3E7]  ${styles.inputField}`}
                aria-label="empty textarea"
                placeholder={field.yourlabel}
                required={field.isRequired}
                maxRows={"27px"}
                value={values?.[field.fieldname] || ""}
                onChange={(e) => {
                  handleChange(e.target.value, field);
                }}
              />
            </div>
          </LightTooltip>
        );
      case "text":
      default:
        return (
          <LightTooltip title={inputLabel}>
            <CustomeTextField
              id={uniqueId}
              label={
                <span className={`${styles.inputTextColor}`}>
                  {inputLabel}
                  {field.isRequired && <span style={{ color: "red" }}>*</span>}
                </span>
              }
              variant="outlined"
              size="small"
              sx={{
                ...textInputStyle({
                  fieldname: values?.[`${field.fieldname}`],
                  isFocused,
                  value: values?.[`${field.fieldname}`],
                }),
              }}
              onFocus={() => {
                setIsFocused(true);
              }}
              onBlur={() => {
                setIsFocused(false);
              }}
              name={field.fieldname}
              required={field.isRequired}
              className={` w-[12rem] ${styles.inputField}`}
              // value={values?.[field.fieldname] || ""}
              value={
                Array.isArray(values?.[field.fieldname])
                  ? values[field.fieldname]
                      .map((item) => `${item.id}.${item.value}`)
                      .join(",")
                  : values?.[field.fieldname] || ""
              }
              onChange={(e) => handleChange(e.target.value, field)}
              // onBlur={onBlurHandler}
            />
          </LightTooltip>
        );
    }
  };

  return (
    <div className="flex flex-wrap gap-[10px] ">
      {inputFieldData?.map((field, index) => (
        <div key={index} className={`flex flex-col `}>
          {renderInputField(field, index)}
        </div>
      ))}
    </div>
  );
}
