/* eslint-disable no-unused-vars */
"use client";
import React, { useState, useRef, useEffect } from "react";

import styles from "@/components/common.module.css";
import TextField from "@mui/material/TextField";
import { styled } from "@mui/material/styles";
import dayjs from "dayjs";
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
import LightTooltip from "@/components/Tooltip/customToolTip";
import Button from "@mui/material/Button";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import { TextareaAutosize } from "@mui/base/TextareaAutosize";
import {
  dynamicDropDownFieldsData,
  fetchReportData,
} from "@/services/auth/FormControl.services";
import { getUserDetails } from "@/helper/userDetails";
import {
  customDataPickerStyleCss,
  customDateTimePickerStyleCss,
  customTimePickerStyleCss,
  fileInputStyle,
  textInputStyleForStaticPage,
  customDataPickerStyleCssForStaticPage,
  checkBoxStyle,
  numberInputStyleForStaticPage,
  radioGroupStyle,
  customRadioCheckBoxStyleForStaticPage,
  customTextFieldStyles,
  menuListStyles,
  textAreaLabelStyle,
  radioControlStyle,
  menuStyles,
} from "@/app/globalCss.js";
// import { debounce } from "@/helper/debounceFile";
import Select from "react-select";
import { components } from "react-select";
import { toast } from "react-toastify";
import { useThemeProvider } from "@/context/themeProviderDataContext";
// import { InputAdornment } from "@mui/material";
// import InsertInvitationIcon from '@mui/icons-material/InsertInvitation';
// import { MobileDatePicker } from "@mui/x-date-pickers";
import { CustomLabel } from "@/components/Label";
import { DialogActions, MenuItem } from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers";
import { MuiColorInput } from "mui-color-input";
import { useDispatch, useSelector } from "react-redux";
//import { useSearchParams } from "react-router-dom";
import { useSearchParams } from "next/navigation";

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

const customStyles = (showLabel) => {
  return {
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

    control: (base, { isDisabled }) => ({
      ...base,
      minHeight: "27px",
      borderWidth: 1,
      borderColor: isDisabled ? "#B2BAC2" : "var(--inputBorderColor)",
      backgroundColor: "var(--inputBg)",
      boxShadow: "none",
      borderRadius: "4px",
      "&:hover": { borderColor: "var(--inputBorderHoverColor)" },
      color: "#00000099",
      cursor: "text !important",
      width: "10rem",
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
      color: "#00000099",
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
      cursor: "pointer !important",
    }),

    clearIndicator: (base) => ({
      ...base,
      "& svg": {
        width: "12px !important", // Adjust the size of the clear icon
        height: "12px !important", // Adjust the size of the clear icon
        cursor: "pointer !important",
      },
    }),

    singleValue: (base) => ({
      ...base,
      color: "var(--inputTextColor)",
      fontSize: "var(--inputFontSize)",
      fontWeight: "var(--inputFontWeight)",
    }),
    // Other custom styles can go here
    valueContainer: (provided) => ({
      ...provided,
      flexWrap: "nowrap", // Set selected values to not wrap
    }),
    input: (base) => ({
      ...base,
      color: "var(--inputTextColor)", // Set color of typed text to "var(--table-text-color)"
      fontSize: "var(--inputFontSize)",
      fontWeight: "var(--inputFontWeight)",
    }),
  };
};

CustomeInputFields.propTypes = {
  inputFieldData: PropTypes.any,
  onChangeHandler: PropTypes.any,
  onKeyDown: PropTypes.any,
  onBlurHandler: PropTypes.any,
  onValuesChange: PropTypes.any,
  values: PropTypes.any,
  inEditMode: PropTypes.any,
  isView: PropTypes.any,
  handleFieldValuesChange2: PropTypes.func,
  clearFlag: PropTypes.any,
  newState: PropTypes.any,
  tableName: PropTypes.any,
  formControlData: PropTypes.any,
  setFormControlData: PropTypes.any,
  setStateVariable: PropTypes.any,
  getLabelValue: PropTypes.any,
  wrap: PropTypes.bool,
  callSaveFunctionOnLastTab: PropTypes.func,
  hideColumnsId: PropTypes.any,
  formDataChange: PropTypes.any,
  setBankExTrigger: PropTypes.any,
};
export default function CustomeInputFields({
  inputFieldData,
  onChangeHandler,
  onBlurHandler,
  onValuesChange,
  onKeyDown,
  values,
  inEditMode,
  isView,
  handleFieldValuesChange2,
  clearFlag,
  newState,
  tableName,
  formControlData,
  setFormControlData,
  setStateVariable,
  getLabelValue,
  callSaveFunctionOnLastTab,
  hideColumnsId,
  formDataChange,
  setBankExTrigger,
}) {
  const { companyId, financialYear, branchId } = useThemeProvider();
  const [fileName, setFileName] = useState("");
  const { userDetails } = useThemeProvider();
  const { dateFormat } = getUserDetails();
  const [dynamicFormData, setDynamicFormData] = useState({});
  const selectedIndex = useSelector((state) => state?.counter?.selectedIndex);
  const searchParams = useSearchParams();
  //const menuId = searchParams.get("menuName");
  const menuId = "1384";
  const [menuName, setMenuName] = useState(null);
  useEffect(() => {
    const fetchMenuType = async () => {
      const requestBodyMenu = {
        columns: "menuName,menuType",
        tableName: "tblMenu",
        whereCondition: `id = ${menuId}`,
        clientIdCondition: `status = 1 FOR JSON PATH`,
      };
      try {
        const data = await fetchReportData(requestBodyMenu);
        if (data?.data?.length > 0) {
          setMenuName(data.data[0].menuName);
        }
      } catch (err) {
        console.error("Menu fetch error:", err);
      }
    };

    if (menuId) {
      fetchMenuType();
    }
  }, [menuId]);
  console.log("MenuId", menuId);

  const handleChange = (value, field, switchToText) => {
    let formattedValue = value;
    let updatedValues = {};

    if (field.isSwitchToText && switchToText) {
      updatedValues[`${field.fieldname}Text`] = value;
      return onValuesChange(updatedValues);
    }

    if (field.controlname.toLowerCase() === "checkbox") {
      updatedValues[`${field.fieldname}`] = value;
    }

    if (field.controlname.toLowerCase() === "file") {
      const file = value;
      Object.assign(updatedValues, { [field.fieldname]: value });
      setFileName((prevFileNames) => ({
        ...prevFileNames,
        [field.fieldname]: file.name,
      }));
    }

    if (value && typeof value.format === "function") {
      formattedValue = dayjs(value).format("YYYY-MM-DD HH:mm:ss");
      updatedValues[`${field.fieldname}`] = formattedValue;
    }

    if (
      Array.isArray(value) &&
      field.controlname.toLowerCase() === "dropdown"
    ) {
      Object.assign(updatedValues, { [`${field.fieldname}dropdown`]: value });
      formattedValue = value.map((item) => item.value);
      if (
        field?.isDataFlow &&
        field?.copyMappingName !== null &&
        inEditMode?.isEditMode === false
      ) {
        handleFieldValuesChange2(field, formattedValue, field);
      }
    }

    if (
      Array.isArray(value) &&
      field.controlname?.toLowerCase() === "multiselect"
    ) {
      Object.assign(updatedValues, {
        [`${field.fieldname}multiselect`]: value,
      });
      formattedValue = value.map((item) => item.value).join(",");
      if (
        field?.isDataFlow &&
        field?.copyMappingName !== null &&
        inEditMode?.isEditMode === false
      ) {
        handleFieldValuesChange2(field, formattedValue.split(","), field);
      }
    }

    Object.assign(updatedValues, {
      [field.fieldname]:
        Array.isArray(formattedValue) &&
        field.controlname?.toLowerCase() === "dropdown"
          ? formattedValue.join(",")
          : formattedValue,
    });

    // Handle empty string specifically
    if (updatedValues[field?.fieldname] === "") {
      //console.warn("Updating state with empty string value:", field.fieldname);
    }
    if (onValuesChange) {
      if (field?.typeValue?.toLowerCase() == "decimal") {
        const val = updatedValues[field.fieldname];
        const ok = checkDecimal(val, field.size);
        if (ok || val === "") {
          onValuesChange(updatedValues);
        } else {
          if (val?.length > field?.size?.split(",")[0])
            toast.error(
              `can not enter more characters in ${field?.yourlabel} field`
            );
        }
        return;
      }
      if (field.controlname?.toLowerCase() === "checkbox") {
        onValuesChange(updatedValues);
        return;
      }
      if (updatedValues[`${field?.fieldname}`]?.length > field?.size) {
        return toast.error(
          `can not enter more than ${field?.size} characters in ${field?.yourlabel} field`
        );
      } else {
        onValuesChange(updatedValues);
      }
    }
  };
  const handleChangeDynamic = (value, field, switchToText) => {
    let formattedValue = value;
    let updatedValues = {};

    if (field.isSwitchToText && switchToText) {
      updatedValues[`${field.fieldname}Text`] = value;
      return onValuesChange(updatedValues);
    }

    if (field.controlname.toLowerCase() === "checkbox") {
      updatedValues[`${field.fieldname}`] = value;
    }

    if (field.controlname.toLowerCase() === "file") {
      const file = value;
      Object.assign(updatedValues, { [field.fieldname]: value });
      setFileName((prevFileNames) => ({
        ...prevFileNames,
        [field.fieldname]: file.name,
      }));
    }

    if (value && typeof value.format === "function") {
      formattedValue = dayjs(value).format("YYYY-MM-DD HH:mm:ss");
      updatedValues[`${field.fieldname}`] = formattedValue;
    }

    if (
      Array.isArray(value) &&
      field.controlname.toLowerCase() === "dropdown"
    ) {
      Object.assign(updatedValues, { [`${field.fieldname}dropdown`]: value });
      formattedValue = value.map((item) => item.value);
      if (
        field?.isDataFlow &&
        field?.copyMappingName !== null &&
        inEditMode?.isEditMode === false
      ) {
        handleFieldValuesChange2(field, formattedValue, field);
      }
    }

    if (
      Array.isArray(value) &&
      field.controlname?.toLowerCase() === "multiselect"
    ) {
      Object.assign(updatedValues, {
        [`${field.fieldname}multiselect`]: value,
      });
      formattedValue = value.map((item) => item.value).join(",");
      if (
        field?.isDataFlow &&
        field?.copyMappingName !== null &&
        inEditMode?.isEditMode === false
      ) {
        handleFieldValuesChange2(field, formattedValue.split(","), field);
      }
    }

    Object.assign(updatedValues, {
      [field.fieldname]:
        Array.isArray(formattedValue) &&
        field.controlname?.toLowerCase() === "dropdown"
          ? formattedValue.join(",")
          : formattedValue,
    });

    // Handle empty string specifically
    if (updatedValues[field?.fieldname] === "") {
      //console.warn("Updating state with empty string value:", field.fieldname);
    }
    if (onValuesChange) {
      if (field?.typeValue?.toLowerCase() == "decimal") {
        const val = updatedValues[field.fieldname];
        const ok = checkDecimal(val, field.size);
        if (ok || val === "") {
          onValuesChange(updatedValues);
        } else {
          if (val?.length > field?.size?.split(",")[0])
            toast.error(
              `can not enter more characters in ${field?.yourlabel} field`
            );
        }
        return;
      }
      if (field.controlname?.toLowerCase() === "checkbox") {
        onValuesChange(updatedValues);
        return;
      }
      if (updatedValues[`${field?.fieldname}`]?.length > field?.size) {
        return toast.error(
          `can not enter more than ${field?.size} characters in ${field?.yourlabel} field`
        );
      } else {
        if (menuId == "1384") {
          //onKeyDown(updatedValues);
        }
      }
    }
  };

  const handleDateChange = (e, field) => {
    const dateStr = e.target.value;
    const fmt = "DD/MM/YYYY";
    const dateObj = dayjs(dateStr, fmt, true);
    if (dateStr !== "DD/MM/YYYY") {
      if (!dateObj.isValid()) {
        toast.error(`Invalid date`);
        return;
      }
      handleChange(dateObj, field);
    }
  };

  const handleDateTimeChange = (e, field) => {
    const dateStr = e.target.value;
    const fmt = "YYYY-MM-DD HH:mm:ss";
    const dateObj = dayjs(dateStr, fmt, true);
    if (dateStr !== "YYYY-MM-DD HH:mm:ss") {
      if (!dateObj.isValid()) {
        toast.error(`Invalid date`);
        return;
      }
      handleChange(dateObj, field);
    }
  };

  function checkDecimal(rawVal, sizeSpec) {
    if (!sizeSpec) return true;
    const [precision, scale] = sizeSpec.split(",").map((n) => parseInt(n, 10));

    const str = String(rawVal).trim();
    const parts = str.split(".");
    if (parts.length > 2) return false; // more than one “.”

    const [intPart, fracPart = ""] = parts;
    // both parts must be purely digits
    if (!/^\d+$/.test(intPart) || (fracPart && !/^\d+$/.test(fracPart))) {
      return false;
    }

    // — FRACTION check: no more than `scale` digits after the dot
    if (fracPart.length > scale) return false;

    // — INTEGER check:
    //    precision total = int + dot + frac
    //    so int ≤ precision − scale − 1
    const maxIntLen = precision - scale - 1;
    if (intPart.length > maxIntLen) {
      return false;
    }

    return true;
  }

  function checkCorrectDate(dateStr) {
    // 1) Quick format check via regex
    const match = /^(\d{4})-(\d{2})-(\d{2}) (\d{2}):(\d{2}):(\d{2})$/.exec(
      dateStr
    );
    if (!match) return false;

    // 2) Pull out numbers
    const [, yearS, monthS, dayS, hourS, minuteS, secondS] = match;
    const year = parseInt(yearS, 10);
    const month = parseInt(monthS, 10);
    const day = parseInt(dayS, 10);
    const hour = parseInt(hourS, 10);
    const minute = parseInt(minuteS, 10);
    const second = parseInt(secondS, 10);

    // 3) Build a Date object (JS months are 0–11)
    const d = new Date(year, month - 1, day, hour, minute, second);

    // 4) Verify the Date “snapped back” to the same components
    return (
      d.getFullYear() === year &&
      d.getMonth() === month - 1 &&
      d.getDate() === day &&
      d.getHours() === hour &&
      d.getMinutes() === minute &&
      d.getSeconds() === second
    );
  }

  useEffect(() => {
    setDynamicFormData(formDataChange);
  }, [formDataChange]);

  // Render different types of inputs
  const renderInputField = (field, index) => {
    if (field.isControlShow !== true) {
      return null;
    }
    const [pageNo, setPageNo] = useState(1);
    const [isFocused, setIsFocused] = useState(false);
    const [Controller, setController] = useState(null);
    const [onFocusValue, setonFocusValue] = useState(null);
    const [switchToText, setswitchToText] = useState(false);
    const [dropDownValues, setdropDownValues] = useState([]);
    const [textareaLabel, settextareaLabel] = useState(false);
    const [isNextPageNull, setIsNextPageNull] = useState(false);
    const [inputValueForDataFetch, setInputValueForDataFetch] = useState("");
    const [inputValueChange, setInputValueChange] = useState("");
    const [scrollPosition, setScrollPosition] = useState(0);
    const [showLabel, setShowLabel] = useState(false);
    const [menuOpen, setMenuOpen] = useState(false);
    const [textAreaErrorLimit, setTextAreaErrorLimit] = useState(0);
    const prevPageNo = useRef();
    const inputRef = useRef(null);
    const selectRef = useRef(null);
    const acceptButtonRef = useRef(null);
    const firstRender = useRef(true);

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
        fetchData(
          field,
          pageNo,
          inputValueForDataFetch,
          values[field.fieldname],
          "first"
        );
      }
    }, [field, values?.[field.fieldname]]);

    useEffect(() => {
      if (firstRender.current && values?.[field.fieldname] !== undefined) {
        firstRender.current = false;
        return;
      }
      if (
        isFocused == false &&
        values?.[field.fieldname] !== undefined &&
        values?.[field.fieldname] !== null
      ) {
        const funcCallString = field.functionOnChange;

        if (funcCallString) {
          const multiCallFunctions = funcCallString.split(";");
          let updatedValues = values;

          multiCallFunctions.forEach((funcCall) => {
            if (funcCall.trim()) {
              updatedValues = handleFuncChangeCall(
                funcCall,
                updatedValues,
                field.fieldname,
                tableName
              );
            }
          });
          setStateVariable((prev) => {
            let temp = { ...prev, ...updatedValues };
            return temp;
          });
        }

        if (selectRef.current) {
          selectRef.current.focus();
          selectRef.current.blur();
        }
      }
    }, [values?.[field.fieldname]]);
    const handleBlur = () => {
      //      console.log("handleBlur called");
      setIsFocused(false);
      if (onFocusValue !== values[field.fieldname]) {
        const funcCallString = field.functionOnChange;

        if (
          funcCallString !== undefined &&
          funcCallString !== null &&
          funcCallString !== ""
        ) {
          let multiCallFunctions = funcCallString.split(";");

          multiCallFunctions.forEach((funcCall) => {
            handleFuncChangeCall(funcCall, values, field.fieldname, tableName);
          });
        }
      }
      if (index == inputFieldData.length - 1) {
        if (typeof callSaveFunctionOnLastTab === "function") {
          // callSaveFunctionOnLastTab();
        }
      }
    };
    const handleFocus = () => {
      setIsFocused(true);
      setonFocusValue(values[field.fieldname]);
    };

    useEffect(() => {
      const inputElement = inputRef.current;
      if (inputElement?.addEventListener) {
        inputElement?.addEventListener("focus", handleFocus);
        inputElement?.addEventListener("blur", handleBlur);

        return () => {
          inputElement.removeEventListener("focus", handleFocus);
          inputElement.removeEventListener("blur", handleBlur);
        };
      }
      // }, [inputRef, onFocusValue, values[field.fieldname], isFocused]);
    }, [inputRef.current]);

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

        // Detect if it's matching the pattern regardless of index
        const patternMatch = variableName.match(
          /newState\.tblJob\[(\d+)\]\.id/
        );

        if (patternMatch) {
          // Replace index with selectedIndex
          const updatedVariableName = variableName.replace(
            /\[\d+\]/,
            `[${selectedIndex}]`
          );

          const variableValue = eval(updatedVariableName); // Get the ID value

          inputString = inputString.replace(
            "${" + variableName + "}",
            variableValue
          );
        } else {
          const variableValue = eval(variableName);

          inputString = inputString.replace(
            "${" + variableName + "}",
            variableValue
          );
        }
      }

      console.log("inputString", inputString);

      return inputString;
    }

    async function fetchData(
      field,
      pageNo,
      inputValueForDataFetch,
      value,
      action
    ) {
      if (Controller) {
        Controller.abort();
      }
      setController(new AbortController());

      const requestData = {
        onfilterkey: "status",
        onfiltervalue: 1,
        referenceTable: field.referenceTable,
        referenceColumn: field.referenceColumn,
        referenceView: field.referenceView,
        dropdownFilter:
          field.dropdownFilter &&
          field.dropdownFilter !== null &&
          field.dropdownFilter !== ""
            ? dynamicValuReplace(field.dropdownFilter)
            : "",
        search: inputValueForDataFetch,
        pageNo: inputValueForDataFetch.length > 0 ? 1 : pageNo,
        value: typeof value == "object" ? value?.value : value || null,
      };

      try {
        if (isNextPageNull && action !== "search") {
          return false;
        } else {
          const apiResponse = await dynamicDropDownFieldsData(
            requestData,
            Controller
          );
          if (apiResponse.nextPage === null) {
            // Handle the response where apiResponse is falsy (e.g., null, undefined)
            setIsNextPageNull(true);
          }

          // A helper function to update state, reducing redundancy
          const updateState = (data) => {
            setdropDownValues((prev) => [
              ...(Array.isArray(prev) ? prev : []),
              ...data,
            ]);
          };

          if (pageNo == 1 || inputValueForDataFetch.length > 0) {
            setdropDownValues(apiResponse.data);
          } else {
            updateState(apiResponse.data);
          }
          //          // console.log(field.fieldname,dropDownValues);
          return true;
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        return false;
      }
    }

    const handleInputChange = (newInputValue) => {
      fetchData(
        field,
        pageNo,
        newInputValue,
        values?.[field.fieldname],
        "search"
      );
    };

    useEffect(() => {
      if (pageNo > 1 && prevPageNo.current !== pageNo) {
        fetchData(field, pageNo, inputValueForDataFetch, "", "pageNo");
        prevPageNo.current = pageNo;
      }
    }, [pageNo]);

    let uniqueId = `${field.controlname}_${field.fieldname}_${field?.id}_${index}`;
    let fieldId = `${field.fieldname}_${field?.id}_${index}`;
    let inputLabel = field.yourlabel;

    let callInputChangeFunc = true;

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

    // eslint-disable-next-line no-unused-vars
    function handleFuncChangeCall(
      functionData,
      values,
      fieldName,
      tableName,
      valueToupdate
    ) {
      const funcNameMatch = functionData?.match(/^(\w+)/);
      // Check for the presence of parentheses to confirm the argument list, even if it's empty
      const argsMatch = functionData?.match(/\((.*)\)/);
      // const jsonMatch = functionData.match(/\[([\s\S]*)\]/);
      const jsonMatch = functionData.match(/\[([\s\S]*)\]/);
      console.log("jsonMatch", jsonMatch);
      console.log("funcNameMatch", funcNameMatch);
      console.log("argsMatch", argsMatch);

      setonFocusValue(null);
      // Check if we have a function name match, and we have an argsMatch (even if there are no arguments)
      if (
        funcNameMatch &&
        (argsMatch !== null || (jsonMatch && jsonMatch[1]))
      ) {
        const funcName = funcNameMatch[1];
        const argsStr = argsMatch?.[1] || ""; // argsStr could be an empty string
        // Find the function in formControlValidation by the extracted name
        const func = formControlValidation?.[funcName];
        if (typeof func === "function") {
          // Prepare arguments: If there are no arguments, argsStr will be an empty string
          let args;
          if (jsonMatch && jsonMatch[1]) {
            try {
              // Clean the string by:
              // 1. Removing trailing commas
              // 2. Fixing unquoted property names (optional in JavaScript but required in strict JSON)
              const cleanedJson = jsonMatch[1]
                .replace(/,\s*$/, "") // Remove trailing comma
                .replace(/([{,]\s*)([a-zA-Z0-9_]+)(\s*:)/g, '$1"$2"$3'); // Add quotes to property names

              args = JSON.parse(`[${cleanedJson}]`);
              console.log("Extracted JSON:", args);
            } catch (e) {
              console.error("Error parsing JSON:", e);
            }
          } else if (argsStr === "") {
            args = {}; // No arguments, so pass an empty object or as per the function's expected parameters
          } else {
            args = argsStr; // Has arguments, pass them as an object
          }
          // Call the function with the prepared arguments
          //          console.log(
          //   "setFormControlData setFormControlData",
          //   setFormControlData
          // );
          const updatedValues = func({
            args,
            values,
            fieldName,
            newState,
            formControlData,
            setFormControlData,
            tableName,
            setStateVariable,
            onChangeHandler,
          });
          // valueToupdate = updatedValues.value
          //          console.log("valueToupdate", functionData, updatedValues);

          onChangeHandler(updatedValues); // Assuming you have an onChangeHandler function to handle the updated values
          return updatedValues?.values;
        }
      }
    }

    // eslint-disable-next-line no-unused-vars
    async function handleFuncBlurCall(
      functionData,
      values,
      fieldName,
      tableName
    ) {
      const funcNameMatch = functionData?.match(/^(\w+)/);
      // Check for the presence of parentheses to confirm the argument list, even if it's empty
      const argsMatch = functionData?.match(/\((.*)\)/);
      // This will log the entire match including empty parentheses
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
            args = argsStr; // Has arguments, pass them as an object
          }
          const updatedValues = await func({
            args,
            values,
            fieldName,
            newState,
            formControlData,
            setFormControlData,
            tableName,
            setStateVariable,
          });
          onBlurHandler(updatedValues); // Assuming you have an onChangeHandler function to handle the updated values
          return updatedValues.values;
        }
      }
    }

    const handlePaste = (e) => {
      const pastedData = e.clipboardData.getData("text");
      const newValue = values[field.fieldname] + pastedData;
      if (newValue.length > field.size) {
        e.preventDefault(); // prevent paste if it results in exceeding the limit
        toast.error("Value exceeds limit");
      }
    };

    const textAreaLimitErrorFun = () => {
      //      // console.log("textAreaErrorLimit", textAreaErrorLimit);
      if (textAreaErrorLimit === 1) {
        toast.error(`${field.size} character limit reached`);
      }
    };

    useEffect(() => {
      try {
        if (
          dropDownValues?.length === 1 &&
          field.controlname.toLowerCase() === "dropdown" &&
          !inEditMode?.isEditMode &&
          !isView
        ) {
          handleChange(dropDownValues[0] ? [dropDownValues[0]] : [], field);
          setStateVariable((prevValues) => ({
            ...prevValues,
            [field.fieldname]: dropDownValues[0].value,
            [`${field.fieldname}dropdown`]: dropDownValues,
          }));
        }
      } catch (error) {
        console.error("Error in useEffect: ", error);
      }
    }, [dropDownValues]);

    //
    // eslint-disable-next-line no-unused-vars

    function CustomActionBar(props) {
      const { onAccept, onCancel, actions, className } = props;
      if (actions == null || actions.length === 0) {
        return null;
      }
      const menuItems = actions?.map((actionType) => {
        switch (actionType) {
          case "cancel":
            return (
              <MenuItem
                className=" text-transparent w-0 h-0 absolute left-0  overflow-hidden "
                onClick={() => {
                  onCancel();
                }}
                key={actionType}
              >
                cancel
              </MenuItem>
            );
          case "accept":
            return (
              <MenuItem
                className=" text-transparent w-0 h-0  absolute left-0 overflow-hidden "
                ref={acceptButtonRef}
                onClick={() => {
                  setTimeout(onAccept, 100);
                }}
                key={actionType}
              >
                ok
              </MenuItem>
            );
          default:
            return null;
        }
      });
      return (
        <DialogActions className={className}>
          <Button>{menuItems}</Button>
        </DialogActions>
      );
    }

    CustomActionBar.propTypes = {
      onAccept: PropTypes.func.isRequired,
      onCancel: PropTypes.func.isRequired,
      actions: PropTypes.arrayOf(
        PropTypes.shape({
          id: PropTypes.oneOfType([PropTypes.string, PropTypes.number])
            .isRequired,
          label: PropTypes.string.isRequired,
          handler: PropTypes.func.isRequired,
        })
      ).isRequired,
      className: PropTypes.string,
    };

    switch (field.controlname.toLowerCase()) {
      case "dropdown":
        return (
          <LightTooltip
            key={uniqueId}
            title={inputValueChange.length ? "" : field.yourlabel}
          >
            {field.isSwitchToText && switchToText ? (
              <CustomeTextField
                autoComplete="off"
                id={uniqueId}
                onDoubleClick={() => {
                  setswitchToText(false);
                }}
                ref={inputRef}
                label={
                  <span className={`${styles.inputTextColor} `}>
                    {inputLabel}
                  </span>
                }
                onFocus={(e) => {
                  setIsFocused(true);
                  setonFocusValue(e.target.value);
                }}
                sx={{
                  ...textInputStyleForStaticPage({
                    fieldname: values?.[`${field.fieldname}Text`],
                    isFocused,
                  }),
                }}
                variant="outlined"
                size="small"
                name={`${field.fieldname}Text`}
                required={field.isRequired}
                className={`w-[10rem] ${styles.inputField}`}
                value={
                  // `${values[field.fieldname] + "Text"}`
                  dropDownValues?.find(
                    (item) => item.value === values[field.fieldname]
                  )?.label || null
                }
                onChange={(e) => {
                  //                  console.log("onChange", e.target.value);
                  if (
                    !field.size ||
                    e.target.value.toString().length <= field.size
                  ) {
                    handleChange(e.target.value, field, switchToText);
                  }
                  values[field.fieldname] = e.target.value;
                }}
                onBlur={(e) => {
                  setIsFocused(false);
                  if (
                    onFocusValue !== e.target.value &&
                    e.target.value !== ""
                  ) {
                    // values[field.fieldname] = e.target.value;
                    const funcCallString = field.functionOnChange;
                    if (
                      funcCallString !== undefined &&
                      funcCallString !== null &&
                      funcCallString !== ""
                    ) {
                      let multiCallFunctions = funcCallString.split(";");
                      multiCallFunctions.forEach((funcCall) => {
                        //                        // console.log("funcCall", funcCall);
                        handleFuncChangeCall(
                          funcCall,
                          values,
                          field.fieldname,
                          tableName
                        );
                      });
                    }
                  }

                  typeof formControlValidation?.[field.functionOnBlur] ===
                    "function" &&
                    onBlurHandler((state) => {
                      return formControlValidation?.[field.functionOnBlur]({
                        state: state,
                        fieldName: field.fieldname,
                        value: e.target.value,
                      });
                    });

                  // values[field.fieldname] = newValue;
                  const funcCallString = field.functionOnBlur;
                  if (
                    funcCallString !== undefined &&
                    funcCallString !== null &&
                    funcCallString !== ""
                  ) {
                    let multiCallFunctions = funcCallString.split(";");
                    multiCallFunctions.forEach((funcCall) => {
                      handleFuncBlurCall(
                        funcCall,
                        values,
                        field.fieldname,
                        tableName
                      );
                    });
                  }
                }}
                disabled={
                  isView ||
                  (inEditMode?.isEditMode
                    ? inEditMode?.isCopy === true
                      ? !field?.isCopyEditable
                      : ["e", "b"].includes(
                          field.isEditableMode?.toLowerCase()
                        ) && !field.isEditable
                    : ["a", "b"].includes(
                        field.isEditableMode?.toLowerCase()
                      ) && !field.isEditable)
                }
                InputLabelProps={{
                  classes: {
                    asterisk: "required-asterisk",
                  },
                }}
              />
            ) : (
              <div
                className="relative "
                onDoubleClick={() => {
                  setswitchToText(true);
                }}
              >
                <p
                  className={`absolute left-[11px] z-10 px-2 transition-all duration-200 ${
                    showLabel ||
                    values[field.fieldname] ||
                    inputValueChange.length > 0
                      ? "bg-[--inputBg] pr-[10%] leading-[0.8px] top-[0px] scale-100 opacity-100" // Label moves to the top
                      : inputValueChange.length == 0 || !values[field.fieldname]
                      ? "top-[calc(100%-1.2rem)] opacity-100"
                      : "" // Label sits at the bottom, emulating a placeholder
                  }`}
                  style={{ fontSize: "var(--inputFontSize)" }}
                >
                  <span
                    onClick={() => {
                      if (!isView) {
                        setShowLabel(true);
                      }
                      if (selectRef.current) {
                        setMenuOpen(true);
                        selectRef.current.focus();
                      }
                    }}
                    style={{
                      color: !isView ? "rgba(0, 0, 0, 0.6)" : "#B2BAC2",
                    }}
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
                  id={uniqueId}
                  placeholder=""
                  menuPortalTarget={document.body}
                  backspaceRemovesValue={true}
                  isClearable={true}
                  styles={customStyles(showLabel)}
                  options={dropDownValues}
                  className={`w-[10rem] ${styles.inputField} `}
                  menuPlacement="auto"
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
                    isView ||
                    (inEditMode?.isEditMode
                      ? inEditMode?.isCopy === true
                        ? !field?.isCopyEditable
                        : ["e", "b"].includes(
                            field.isEditableMode?.toLowerCase()
                          ) && !field.isEditable
                      : ["a", "b"].includes(
                          field.isEditableMode?.toLowerCase()
                        ) && !field.isEditable)
                  }
                  value={
                    Array.isArray(dropDownValues)
                      ? dropDownValues?.find(
                          (item) => item.value == values?.[field.fieldname]
                        )
                      : null
                  }
                  noOptionsMessage={() =>
                    dropDownValues?.length === 0
                      ? "No records found"
                      : "Loading..."
                  }
                  menuIsOpen={menuOpen}
                  onFocus={() => {
                    setonFocusValue(values?.[field.fieldname]);
                    fetchData(field, 1, inputValueForDataFetch, "", "onPoen");
                  }}
                  onMenuOpen={() => {
                    setMenuOpen(true);
                    setInputValueForDataFetch("");
                    setPageNo(1);
                    setIsFocused(true);
                    setShowLabel(true);
                    fetchData(field, 1, inputValueForDataFetch, "", "onPoen");
                  }}
                  onMenuClose={() => {
                    setMenuOpen(false);
                    setInputValueForDataFetch("");
                    setShowLabel(false);
                    setIsFocused(true);
                    setIsNextPageNull(false);
                  }}
                  onChange={(newValue) => {
                    callInputChangeFunc = false;
                    handleChange(newValue ? [newValue] : [], field);
                    values[field.fieldname] = newValue?.value;
                    callInputChangeFunc = true;
                  }}
                  onBlur={(e) => {
                    //                    console.log("on Blur", field.fieldname, e.target.value);

                    setMenuOpen(false);
                    if (inputLabel.length == 0 && values?.[field.fieldname]) {
                      setShowLabel(false);
                    }
                    setIsFocused(!field);
                    setInputValueForDataFetch("");
                    if (onFocusValue !== values?.[field.fieldname]) {
                      // values[field.fieldname] = e.target.value;
                      const funcCallString = field.functionOnChange;
                      if (
                        funcCallString !== undefined &&
                        funcCallString !== null &&
                        funcCallString !== ""
                      ) {
                        let multiCallFunctions = funcCallString.split(";");
                        multiCallFunctions.forEach((funcCall) => {
                          handleFuncChangeCall(
                            funcCall,
                            values,
                            field.fieldname,
                            tableName
                          );
                        });
                      }
                    }
                    // setPageNo(1);
                    typeof formControlValidation?.[field.functionOnBlur] ===
                      "function" &&
                      onBlurHandler((state) => {
                        return formControlValidation?.[field.functionOnBlur](
                          state,
                          field.fieldname,
                          e.target.value
                        );
                      });

                    // values[field.fieldname] = newValue;
                    const funcCallString = field.functionOnBlur;
                    if (
                      funcCallString !== undefined &&
                      funcCallString !== null &&
                      funcCallString !== ""
                    ) {
                      let multiCallFunctions = funcCallString.split(";");
                      multiCallFunctions.forEach((funcCall) => {
                        handleFuncBlurCall(
                          funcCall,
                          values,
                          field.fieldname,
                          tableName
                        );
                      });
                    }
                    if (index == inputFieldData.length - 1) {
                      if (typeof callSaveFunctionOnLastTab === "function") {
                        callSaveFunctionOnLastTab();
                      }
                    }
                  }}
                  onInputChange={(value, e) => {
                    setInputValueChange(value);
                    if (callInputChangeFunc && e.action === "input-change") {
                      fetchData(
                        field,
                        pageNo,
                        value,
                        values?.[field.fieldname],
                        "search"
                      );
                    }
                  }}
                />
              </div>
            )}
          </LightTooltip>
        );
      case "multiselect":
        return (
          <LightTooltip title={inputLabel}>
            <div className="relative ">
              <p
                className={`text-[8px] absolute left-[11px] z-10 px-2 transition-all duration-200 ${
                  showLabel ||
                  values[field.fieldname] ||
                  inputValueChange.length > 0
                    ? "bg-[--inputBg] pr-[10%] leading-[0.8px] top-[0px] scale-75 opacity-100" // Label moves to the top
                    : inputValueChange.length == 0 || !values[field.fieldname]
                    ? "top-[calc(100%-1.2rem)] opacity-100"
                    : "" // Label sits at the bottom, emulating a placeholder
                }`}
              >
                <span
                  onClick={() => {
                    setShowLabel(true);
                    setMenuOpen(true);
                  }}
                  style={{ color: "rgba(0, 0, 0, 0.75)" }}
                  className={`${
                    (showLabel || inputValueChange.length > 0) &&
                    values[field.fieldname]
                      ? "text-[8px]"
                      : "text-[9px]"
                  }`}
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
                isMulti={true}
                menuPortalTarget={document.body}
                backspaceRemovesValue={true}
                isClearable={true}
                styles={{
                  ...customStyles(showLabel),
                  control: (base) => ({
                    ...base,
                    minHeight: "27px",
                    borderWidth: 1,
                    borderColor: "var(--inputBorderColor)",
                    backgroundColor: "var(--inputBg)",
                    boxShadow: "none",
                    borderRadius: "4px",
                    "&:hover": { borderColor: "var(--inputBorderHoverColor)" },
                    color: "var(--inputTextColor)",
                    cursor: "text !important",
                    width: "auto",
                    height: "27px ",
                    zindex: 999,
                    fontSize: "var(--inputFontSize)",
                    fontWeight: "var(--inputFontWeight)",
                    position: "relative",
                  }),
                  valueContainer: (base) => ({
                    ...base,
                    overflow: "none",
                  }),
                }}
                ref={inputRef}
                placeholder=""
                options={dropDownValues}
                menuPlacement="auto"
                className={`w-auto min-w-[10rem] ${styles.inputField}  `}
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
                  isView ||
                  (inEditMode?.isEditMode
                    ? inEditMode?.isCopy === true
                      ? !field?.isCopyEditable
                      : ["e", "b"].includes(
                          field.isEditableMode?.toLowerCase()
                        ) && !field.isEditable
                    : ["a", "b"].includes(
                        field.isEditableMode?.toLowerCase()
                      ) && !field.isEditable)
                }
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
                  dropDownValues?.length === 0
                    ? "No records found"
                    : "Searching..."
                }
                menuIsOpen={menuOpen}
                onMenuOpen={() => {
                  setMenuOpen(true);
                  setInputValueForDataFetch("");
                  setPageNo(1);
                  setIsFocused(true);
                  setShowLabel(true);
                  fetchData(field, 1, inputValueForDataFetch, "", "onPoen");
                }}
                onMenuClose={() => {
                  setMenuOpen(false);
                  setInputValueForDataFetch("");
                  setIsFocused(true);
                  setIsNextPageNull(false);
                  setShowLabel(false);
                }}
                onFocus={() => {
                  setIsFocused(true);
                  setInputValueForDataFetch("");
                  fetchData(field, 1, inputValueForDataFetch, "", "onPoen");
                  setPageNo(1);
                  setShowLabel(true);
                  setonFocusValue(values?.[field.fieldname]);
                }}
                onChange={(newValue) => {
                  handleChange(newValue ? newValue : [], field);
                }}
                onBlur={(e) => {
                  setMenuOpen(false);
                  if (inputLabel.length == 0 && values?.[field.fieldname]) {
                    setShowLabel(false);
                  }

                  setInputValueForDataFetch("");
                  if (onFocusValue !== values?.[field.fieldname]) {
                    // values[field.fieldname] = e.target.value;
                    const funcCallString = field.functionOnChange;
                    if (
                      funcCallString !== undefined &&
                      funcCallString !== null &&
                      funcCallString !== ""
                    ) {
                      let multiCallFunctions = funcCallString.split(";");
                      multiCallFunctions.forEach((funcCall) => {
                        handleFuncChangeCall(
                          funcCall,
                          values,
                          field.fieldname,
                          tableName
                        );
                      });
                    }
                  }
                  typeof formControlValidation?.[field.functionOnBlur] ===
                    "function" &&
                    onBlurHandler((state) => {
                      return formControlValidation?.[field.functionOnBlur](
                        state,
                        field.fieldname,
                        e.target.value
                      );
                    });

                  // values[field.fieldname] = newValue;
                  const funcCallString = field.functionOnBlur;
                  if (
                    funcCallString !== undefined &&
                    funcCallString !== null &&
                    funcCallString !== ""
                  ) {
                    let multiCallFunctions = funcCallString.split(";");
                    multiCallFunctions.forEach((funcCall) => {
                      handleFuncBlurCall(
                        funcCall,
                        values,
                        field.fieldname,
                        tableName
                      );
                    });
                  }
                  if (index == inputFieldData.length - 1) {
                    if (typeof callSaveFunctionOnLastTab === "function") {
                      callSaveFunctionOnLastTab();
                    }
                  }
                }}
                onInputChange={(value, e) => {
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
              className={`${customRadioCheckBoxStyleForStaticPage} ${styles.inputField} hover:border-[var(--inputBorderHoverColor)]`}
            >
              {/* Label */}
              <div
                id={uniqueId}
                key={index}
                className="absolute px-2 inline bg-[--inputBg] pr-[10%] leading-[0.8px] top-[-1px] left-[8px] p-0 scale-100"
              >
                <span
                  className={`${
                    isView ? "text-[#B2BAC2]" : styles.inputTextColor
                  } font-[var(--inputFontWeight)]`}
                  style={{ fontSize: "var(--inputFontSize)" }}
                >
                  {field.isRequired ? (
                    <span className={styles.inputTextColor}>
                      {inputLabel} <span style={{ color: "red" }}>*</span>
                    </span>
                  ) : (
                    inputLabel
                  )}
                </span>
              </div>

              {/* RadioGroup */}
              <RadioGroup
                row
                sx={radioGroupStyle}
                aria-labelledby={uniqueId}
                name={field.fieldname}
                // Controlled value: null means “nothing selected”

                value={
                  values[field.fieldname] !== null && !values[field.fieldname]
                    ? "0"
                    : values[field.fieldname] === true
                    ? "1"
                    : values[field.fieldname]
                }
                onFocus={(e) => {
                  setonFocusValue(e.target.value);
                }}
                onBlur={(e) => {
                  if (onFocusValue !== e.target.value) {
                    values[field.fieldname] = e.target.value;
                    if (field.functionOnChange) {
                      field.functionOnChange
                        .split(";")
                        .forEach((fn) =>
                          handleFuncChangeCall(
                            fn,
                            values,
                            field.fieldname,
                            tableName
                          )
                        );
                    }
                  }
                  if (
                    index === inputFieldData.length - 1 &&
                    callSaveFunctionOnLastTab
                  ) {
                    callSaveFunctionOnLastTab();
                  }
                }}
                onChange={(e) => {
                  // Normal selection
                  const newVal = e.target.value;
                  handleChange(newVal, field);
                  values[field.fieldname] = newVal;
                }}
              >
                {/* Array source */}
                {Array.isArray(field.dropDownValues)
                  ? field.dropDownValues.map((item, idx) => {
                      const optionValue = item.id.toString();
                      const optionLabel = item.value.toString();
                      return (
                        <FormControlLabel
                          key={idx}
                          value={optionValue}
                          label={optionLabel}
                          labelPlacement="start"
                          sx={radioControlStyle}
                          control={
                            <Radio
                              disabled={
                                isView ||
                                (inEditMode?.isEditMode
                                  ? inEditMode?.isCopy === true
                                    ? !field?.isCopyEditable
                                    : ["e", "b"].includes(
                                        field.isEditableMode?.toLowerCase()
                                      ) && !field.isEditable
                                  : ["a", "b"].includes(
                                      field.isEditableMode?.toLowerCase()
                                    ) && !field.isEditable)
                              }
                              sx={radioControlStyle}
                              onClick={(e) => {
                                // Deselect when clicking the already-selected radio
                                const current =
                                  values[field.fieldname]?.toString() ?? null;
                                if (current === optionValue) {
                                  e.stopPropagation();
                                  handleChange(null, field);
                                  values[field.fieldname] = null;
                                }
                              }}
                            />
                          }
                        />
                      );
                    })
                  : /* CSV string source */
                    field.dropDownValues.split(",").map((item, idx) => {
                      const parts = item.split(".");
                      const optionValue = parts[0].trim();
                      const optionLabel = parts[1]?.trim() || optionValue;
                      return (
                        <FormControlLabel
                          key={idx}
                          value={optionValue}
                          label={optionLabel}
                          labelPlacement="start"
                          sx={radioControlStyle}
                          control={
                            <Radio
                              disabled={
                                isView ||
                                (inEditMode?.isEditMode
                                  ? inEditMode?.isCopy === true
                                    ? !field?.isCopyEditable
                                    : ["e", "b"].includes(
                                        field.isEditableMode?.toLowerCase()
                                      ) && !field.isEditable
                                  : ["a", "b"].includes(
                                      field.isEditableMode?.toLowerCase()
                                    ) && !field.isEditable)
                              }
                              sx={radioControlStyle}
                              onClick={(e) => {
                                const current =
                                  values[field.fieldname]?.toString() ?? null;
                                if (current === optionValue) {
                                  e.stopPropagation();
                                  handleChange(null, field);
                                  values[field.fieldname] = null;
                                }
                              }}
                            />
                          }
                        />
                      );
                    })}
              </RadioGroup>
            </div>
          </LightTooltip>
        );
      case "checkbox":
        return (
          <LightTooltip title={inputLabel}>
            <div
              className={`${customRadioCheckBoxStyleForStaticPage} bg-[var(--inputBg)] hover:border-[var(--inputBorderHoverColor)]  ${styles.inputField}`}
            >
              <div
                className={`absolute px-2 inline left-[8px] bg-[--inputBg] pr-[10%] leading-[0.8px] top-[-1px] scale-100 text-[8px] `}
              >
                <span
                  className={`${
                    isView ? "text-[#B2BAC2]" : `${styles.inputTextColor}`
                  }`}
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
              </div>
              <div key={index} className="ml-2 ">
                <FormGroup aria-label="position" row className="flex">
                  <FormControlLabel
                    key={index}
                    control={
                      <Checkbox
                        checked={values?.[field.fieldname] ? true : false}
                        onChange={(e) => {
                          handleChange(e.target.checked, field); // Join array into a string when updating

                          values[field.fieldname] = e.target.checked;
                          const funcCallString = field.functionOnChange;
                          if (
                            funcCallString !== undefined &&
                            funcCallString !== null &&
                            funcCallString !== ""
                          ) {
                            let multiCallFunctions = funcCallString.split(";");
                            multiCallFunctions.forEach((funcCall) => {
                              handleFuncChangeCall(
                                funcCall,
                                values,
                                field.fieldname,
                                tableName
                              );
                            });
                          }
                        }}
                        sx={{
                          ...checkBoxStyle,
                        }}
                        onBlur={(e) => {
                          typeof formControlValidation?.[
                            field.functionOnBlur
                          ] === "function" &&
                            onBlurHandler((state) => {
                              return formControlValidation?.[
                                field.functionOnBlur
                              ](state, field.fieldname, e.target.value);
                            });

                          // values[field.fieldname] = e.target.checked;
                          const funcCallString = field.functionOnBlur;
                          if (
                            funcCallString !== undefined &&
                            funcCallString !== null &&
                            funcCallString !== ""
                          ) {
                            let multiCallFunctions = funcCallString.split(";");
                            multiCallFunctions.forEach((funcCall) => {
                              handleFuncBlurCall(
                                funcCall,
                                values,
                                field.fieldname,
                                tableName
                              );
                            });
                          }
                          if (index == inputFieldData.length - 1) {
                            if (
                              typeof callSaveFunctionOnLastTab === "function"
                            ) {
                              callSaveFunctionOnLastTab();
                            }
                          }
                        }}
                        inputProps={{ "aria-label": "controlled" }}
                        disabled={
                          isView ||
                          (inEditMode?.isEditMode
                            ? inEditMode?.isCopy === true
                              ? !field?.isCopyEditable
                              : ["e", "b"].includes(
                                  field.isEditableMode?.toLowerCase()
                                ) && !field.isEditable
                            : ["a", "b"].includes(
                                field.isEditableMode?.toLowerCase()
                              ) && !field.isEditable)
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
              className={`${customRadioCheckBoxStyleForStaticPage} ${styles.pageBackground}  ${styles.inputField}`}
            >
              <div
                className={`absolute px-2 inline top-[-8px] left-[8px] text-[8px] ${styles.pageBackground}`}
              >
                <span
                  className={`${
                    isView ? "text-[#B2BAC2]" : `${styles.inputTextColor}`
                  }`}
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
              </div>
              <div key={index} className="ml-2 ">
                <FormGroup aria-label="position" row className="flex">
                  {field.dropDownValues.map((item, index) => {
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
                              ...checkBoxStyle,
                            }}
                            onChange={(e) => {
                              let updatedValues = values?.[field.fieldname]
                                ? values[field.fieldname].split(",")
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

                              values[field.fieldname] = e.target.checked;
                              const funcCallString = field.functionOnChange;
                              if (
                                funcCallString !== undefined &&
                                funcCallString !== null &&
                                funcCallString !== ""
                              ) {
                                let multiCallFunctions =
                                  funcCallString.split(";");
                                multiCallFunctions.forEach((funcCall) => {
                                  handleFuncChangeCall(
                                    funcCall,
                                    values,
                                    field.fieldname,
                                    tableName
                                  );
                                });
                              }
                            }}
                            onBlur={(e) => {
                              typeof formControlValidation?.[
                                field.functionOnBlur
                              ] === "function" &&
                                onBlurHandler((state) => {
                                  return formControlValidation?.[
                                    field.functionOnBlur
                                  ](state, field.fieldname, e.target.value);
                                });

                              // values[field.fieldname] = e.target.checked;
                              const funcCallString = field.functionOnBlur;
                              if (
                                funcCallString !== undefined &&
                                funcCallString !== null &&
                                funcCallString !== ""
                              ) {
                                let multiCallFunctions =
                                  funcCallString.split(";");
                                multiCallFunctions.forEach((funcCall) => {
                                  handleFuncBlurCall(
                                    funcCall,
                                    values,
                                    field.fieldname,
                                    tableName
                                  );
                                });
                              }
                              if (index == inputFieldData.length - 1) {
                                if (
                                  typeof callSaveFunctionOnLastTab ===
                                  "function"
                                ) {
                                  callSaveFunctionOnLastTab();
                                }
                              }
                            }}
                            inputProps={{ "aria-label": "controlled" }}
                            disabled={
                              isView ||
                              (inEditMode?.isEditMode
                                ? inEditMode?.isCopy === true
                                  ? !field?.isCopyEditable
                                  : ["e", "b"].includes(
                                      field.isEditableMode?.toLowerCase()
                                    ) && !field.isEditable
                                : ["a", "b"].includes(
                                    field.isEditableMode?.toLowerCase()
                                  ) && !field.isEditable)
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
              autoComplete="off"
              label={<CustomLabel inputLabel={inputLabel} />}
              variant="outlined"
              size="small"
              name={field.fieldname}
              ref={inputRef}
              sx={{
                ...numberInputStyleForStaticPage({
                  fieldname: values?.[`${field.fieldname}`],
                  isFocused,
                }),
              }}
              onFocus={(e) => {
                setIsFocused(true);
                setonFocusValue(e.target.value);
              }}
              required={field.isRequired}
              className={`w-[9rem] ${styles.inputField}`}
              type="number"
              // value={
              //   values?.[field.fieldname] || field.controlDefaultValue || ""
              // }
              value={
                values?.[field.fieldname] !== undefined &&
                values?.[field.fieldname] !== null
                  ? values[field.fieldname]
                  : field.controlDefaultValue !== undefined &&
                    field.controlDefaultValue !== null &&
                    field.controlDefaultValue !== ""
                  ? parseInt(field.controlDefaultValue, 10)
                  : ""
              }
              onKeyDown={(e) => {
                if (menuId == "1384") {
                  if (
                    e.key === "Tab" &&
                    (field.fieldname === "bankCharges" ||
                      field.fieldname === "exGainLoss")
                  ) {
                    if (e.key === "Tab") {
                      setBankExTrigger((prev) => prev + 1);
                    }
                  }
                }
              }}
              onChange={(e) => {
                const inputVal = e.target.value;
                const isInteger = /^-?\d*$/.test(inputVal); // Optional: add logic for positive-only with /^\d*$/
                //alert(field.type)
                // Show warning if value is not a valid integer
                if (!isInteger && field.typeValue == "number") {
                  toast.warning(
                    `${inputLabel} does not support decimal values`
                  );
                  return;
                }

                if (inputVal.toString().length <= field.size || !field.size) {
                  handleChange(inputVal, field);

                  const onChangeFunction =
                    formControlValidation?.[field.functionOnChange];
                  if (typeof onChangeFunction === "function") {
                    values[field.fieldname] = inputVal;
                    const updatedValues = onChangeFunction({
                      mainJson: values,
                      value: inputVal,
                      targetFieldName: "buyAmount",
                    });
                    onChangeHandler(updatedValues);
                  }

                  values[field.fieldname] = inputVal;
                } else if (field?.typeValue.toLowerCase() == "decimal") {
                  handleChange(inputVal, field);
                  const onChangeFunction =
                    formControlValidation?.[field.functionOnChange];
                  if (typeof onChangeFunction === "function") {
                    values[field.fieldname] = inputVal;
                    const updatedValues = onChangeFunction({
                      mainJson: values,
                      value: inputVal,
                      targetFieldName: "buyAmount",
                    });
                    onChangeHandler(updatedValues);
                  }

                  values[field.fieldname] = inputVal;
                }
              }}
              onBlur={(e) => {
                setIsFocused(false);
                if (onFocusValue !== e.target.value) {
                  values[field.fieldname] = e.target.value;
                  const funcCallString = field.functionOnChange;

                  if (funcCallString) {
                    const multiCallFunctions = funcCallString.split(";");
                    let updatedValues = values;

                    multiCallFunctions.forEach((funcCall) => {
                      if (funcCall.trim()) {
                        updatedValues = handleFuncChangeCall(
                          funcCall,
                          updatedValues,
                          field.fieldname,
                          tableName
                        );
                      }
                    });
                    onChangeHandler(updatedValues);
                  }
                }

                if (
                  typeof formControlValidation?.[field.functionOnBlur] ===
                  "function"
                ) {
                  onBlurHandler((state) =>
                    formControlValidation?.[field.functionOnBlur]({
                      key1: "date1",
                      state: state,
                      fieldName: field.fieldname,
                      value: e.target.value,
                    })
                  );
                }

                values[field.fieldname] = e.target.value;
                const funcCallString = field.functionOnBlur;
                if (funcCallString) {
                  const multiCallFunctions = funcCallString.split(";");
                  let updatedValues = values;

                  multiCallFunctions.forEach((funcCall) => {
                    updatedValues = handleFuncBlurCall(
                      funcCall,
                      updatedValues,
                      field.fieldname,
                      tableName
                    );
                  });
                  onBlurHandler(updatedValues);
                }

                if (index === inputFieldData.length - 1) {
                  if (typeof callSaveFunctionOnLastTab === "function") {
                    callSaveFunctionOnLastTab();
                  }
                }
              }}
              disabled={
                isView ||
                (inEditMode?.isEditMode
                  ? inEditMode?.isCopy === true
                    ? !field?.isCopyEditable
                    : ["e", "b"].includes(
                        field.isEditableMode?.toLowerCase()
                      ) && !field.isEditable
                  : ["a", "b"].includes(field.isEditableMode?.toLowerCase()) &&
                    !field.isEditable)
              }
              InputLabelProps={{
                classes: {
                  asterisk: "required-asterisk",
                },
              }}
            />
          </LightTooltip>
        );
      case "color":
        return (
          <LightTooltip title={inputLabel}>
            <MuiColorInput
              id={uniqueId}
              ref={inputRef}
              label={
                <span className={`${styles.inputTextColor} `}>
                  {inputLabel}
                </span>
              }
              onFocus={(e) => {
                setIsFocused(true);
                setonFocusValue(e.target.value);
              }}
              sx={{
                ...textInputStyleForStaticPage({
                  fieldname: values?.[`${field.fieldname}`],
                  isFocused,
                }),
                "& .MuiButtonBase-root": {
                  width: "10px",
                  height: "10px",
                },
              }}
              variant="outlined"
              size="small"
              name={field.fieldname}
              required={field.isRequired}
              className={` w-[9rem] ${styles.inputField}`}
              value={
                values?.[field.fieldname] ?? field.controlDefaultValue ?? ""
              }
              onChange={(e) => {
                handleChange(e, field);
              }}
              onBlur={(e) => {
                if (onFocusValue !== e.target.value) {
                  values[field.fieldname] = e.target.value;
                  const funcCallString = field.functionOnChange;

                  if (funcCallString) {
                    const multiCallFunctions = funcCallString.split(";");

                    // Initialize a variable to hold the result of each function call
                    let updatedValues = values;

                    multiCallFunctions.forEach((funcCall) => {
                      if (funcCall.trim()) {
                        // Pass the result of the previous function call as the new 'values'
                        //                        // console.log(handleFuncChangeCall(funcCall, updatedValues, field.fieldname, tableName));
                        updatedValues = handleFuncChangeCall(
                          funcCall,
                          updatedValues,
                          field.fieldname,
                          tableName
                        );
                        // updatedValues=result
                      }
                    });
                    //                    console.log("updatedValues", updatedValues);

                    // After chaining all functions, the final updatedValues will be used
                    onChangeHandler(updatedValues);
                  }
                }
                setIsFocused(false);
                typeof formControlValidation?.[field.functionOnBlur] ===
                  "function" &&
                  onBlurHandler((state) => {
                    return formControlValidation?.[field.functionOnBlur]({
                      state: state,
                      fieldName: field.fieldname,
                      value: e.target.value,
                    });
                  });

                const funcCallString = field.functionOnBlur;
                if (
                  funcCallString !== undefined &&
                  funcCallString !== null &&
                  funcCallString !== ""
                ) {
                  let multiCallFunctions = funcCallString.split(";");
                  let updatedValues = values;

                  multiCallFunctions.forEach((funcCall) => {
                    updatedValues = handleFuncBlurCall(
                      funcCall,
                      updatedValues,
                      field.fieldname,
                      tableName
                    );
                  });
                  //                  console.log("updatedValues", updatedValues);

                  // After chaining all functions, the final updatedValues will be used
                  onBlurHandler(updatedValues);
                }
                if (index == inputFieldData.length - 1) {
                  if (typeof callSaveFunctionOnLastTab === "function") {
                    callSaveFunctionOnLastTab();
                  }
                }
              }}
              disabled={
                isView ||
                (inEditMode?.isEditMode
                  ? inEditMode?.isCopy === true
                    ? !field?.isCopyEditable
                    : !field.isEditable
                  : false)
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
          <LightTooltip key={uniqueId} title={isFocused ? "" : inputLabel}>
            <div
              onBlur={() => {
                if (index == inputFieldData.length - 1) {
                  if (typeof callSaveFunctionOnLastTab === "function") {
                    callSaveFunctionOnLastTab();
                  }
                }
              }}
            >
              <DatePicker
                closeOnSelect={false}
                autoFocus={clearFlag?.isClear} // Automatically focus if clearDateFlag is true
                id={uniqueId}
                key={index}
                f
                ref={inputRef}
                label={
                  <span className={`${styles.inputTextColor}`}>
                    {inputLabel}
                    {field.isRequired && (
                      <span style={{ color: "red" }}> *</span>
                    )}
                  </span>
                }
                onOpen={() => {
                  setIsFocused(true);
                  setonFocusValue(values[field.fieldname]);
                }}
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
                onClose={() => {
                  setIsFocused(false);
                  if (onFocusValue !== values[field.fieldname]) {
                    const funcCallString = field.functionOnChange;
                    if (
                      funcCallString !== undefined &&
                      funcCallString !== null &&
                      funcCallString !== ""
                    ) {
                      let multiCallFunctions = funcCallString.split(";");
                      multiCallFunctions.forEach((funcCall) => {
                        handleFuncChangeCall(
                          funcCall,
                          values,
                          field.fieldname,
                          tableName
                        );
                      });
                    }
                  }
                  const funcCallString = field.functionOnBlur;
                  if (
                    funcCallString !== undefined &&
                    funcCallString !== null &&
                    funcCallString !== ""
                  ) {
                    let multiCallFunctions = funcCallString.split(";");
                    multiCallFunctions.forEach((funcCall) => {
                      handleFuncChangeCall(
                        funcCall,
                        values,
                        field.fieldname,
                        tableName
                      );
                    });
                  }
                  if (index == inputFieldData.length - 1) {
                    if (typeof callSaveFunctionOnLastTab === "function") {
                      callSaveFunctionOnLastTab();
                    }
                  }
                }}
                name={field.fieldname}
                value={
                  values[`${field.fieldname}`]
                    ? dayjs(values[`${field.fieldname}`])
                    : null
                } // Use the state value, converted to a Day.js object
                slots={{
                  actionBar: CustomActionBar,
                }}
                slotProps={{
                  textField: {
                    style: {
                      background: "white",
                    },
                    inputProps: {
                      onBlur: (e) => handleDateChange(e, field),
                    },
                  },
                  field: { clearable: true },
                  actionBar: {
                    actions: ["cancel", "accept"],
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
                onBlur={(e) => {
                  typeof formControlValidation?.[field.functionOnBlur] ===
                    "function" &&
                    onBlurHandler((state) => {
                      return formControlValidation?.[field.functionOnBlur](
                        state,
                        field.fieldname,
                        e.target.value
                      );
                    });

                  const funcCallString = field.functionOnBlur;
                  if (
                    funcCallString !== undefined &&
                    funcCallString !== null &&
                    funcCallString !== ""
                  ) {
                    let multiCallFunctions = funcCallString.split(";");
                    multiCallFunctions.forEach((funcCall) => {
                      handleFuncBlurCall(
                        funcCall,
                        values,
                        field.fieldname,
                        tableName
                      );
                    });
                  }
                }}
                required={field.isRequired}
                format={
                  dateFormat === "" || dateFormat === null
                    ? "DD-MM-YYYY"
                    : dateFormat
                }
                sx={{
                  ...customDataPickerStyleCssForStaticPage({
                    fieldname: values?.[`${field.fieldname}`],
                    isFocused,
                  }),
                }}
                className={styles.inputField}
                disabled={
                  isView ||
                  (inEditMode?.isEditMode
                    ? inEditMode?.isCopy === true
                      ? !field?.isCopyEditable
                      : ["e", "b"].includes(
                          field.isEditableMode?.toLowerCase()
                        ) && !field.isEditable
                    : ["a", "b"].includes(
                        field.isEditableMode?.toLowerCase()
                      ) && !field.isEditable)
                }
              />
            </div>
          </LightTooltip>
        );
      case "time":
        return (
          <LightTooltip title={inputLabel}>
            <div>
              <TimePicker
                autoFocus={clearFlag.isClear} // Automatically focus if clearDateFlag is true
                id={uniqueId}
                key={index}
                label={
                  <CustomLabel
                    inputLabel={inputLabel}
                    field={field?.isRequired}
                  />
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
                inputRef={inputRef}
                onOpen={() => {
                  setIsFocused(true);
                  setonFocusValue(values?.[field.fieldname]);
                }}
                onClose={() => {
                  setIsFocused(false);
                  if (onFocusValue !== values[field.fieldname]) {
                    // values[field.fieldname] = e.target.value;
                    const funcCallString = field.functionOnChange;
                    if (
                      funcCallString !== undefined &&
                      funcCallString !== null &&
                      funcCallString !== ""
                    ) {
                      let multiCallFunctions = funcCallString.split(";");
                      multiCallFunctions.forEach((funcCall) => {
                        //                        // console.log("funcCall", funcCall);
                        handleFuncChangeCall(
                          funcCall,
                          values,
                          field.fieldname,
                          tableName
                        );
                      });
                    }
                  }
                  const funcCallString = field.functionOnBlur;
                  if (
                    funcCallString !== undefined &&
                    funcCallString !== null &&
                    funcCallString !== ""
                  ) {
                    let multiCallFunctions = funcCallString.split(";");
                    multiCallFunctions.forEach((funcCall) => {
                      handleFuncChangeCall(
                        funcCall,
                        values,
                        field.fieldname,
                        tableName
                      );
                    });
                  }
                  if (index == inputFieldData.length - 1) {
                    if (typeof callSaveFunctionOnLastTab === "function") {
                      callSaveFunctionOnLastTab();
                    }
                  }
                }}
                value={
                  values[`${field.fieldname}`]
                    ? dayjs(values[`${field.fieldname}`])
                    : null
                } // Use the state value, converted to a Day.js object
                onChange={(time) => {
                  handleChange(time, field);

                  let formattedValue = time;
                  if (time && typeof time.format === "function") {
                    formattedValue = dayjs(time).format("YYYY-MM-DD HH:mm:ss");
                    values[`${field.fieldname}`] = formattedValue; // Adjust the format as needed
                  }
                }}
                onBlur={(e) => {
                  if (
                    onFocusValue !== values[field.fieldname] &&
                    values[field.fieldname] !== ""
                  ) {
                    // values[field.fieldname] = e.target.value;
                    const funcCallString = field.functionOnChange;
                    if (
                      funcCallString !== undefined &&
                      funcCallString !== null &&
                      funcCallString !== ""
                    ) {
                      let multiCallFunctions = funcCallString.split(";");
                      multiCallFunctions.forEach((funcCall) => {
                        //                        // console.log("funcCall", funcCall);
                        handleFuncChangeCall(
                          funcCall,
                          values,
                          field.fieldname,
                          tableName
                        );
                      });
                    }
                  }
                  typeof formControlValidation?.[field.functionOnBlur] ===
                    "function" &&
                    onBlurHandler((state) => {
                      return formControlValidation?.[field.functionOnBlur](
                        state,
                        field.fieldname,
                        e.target.value
                      );
                    });

                  // values[field.fieldname] = e.target.value;
                  const funcCallString = field.functionOnBlur;
                  if (
                    funcCallString !== undefined &&
                    funcCallString !== null &&
                    funcCallString !== ""
                  ) {
                    let multiCallFunctions = funcCallString.split(";");
                    multiCallFunctions.forEach((funcCall) => {
                      handleFuncBlurCall(
                        funcCall,
                        values,
                        field.fieldname,
                        tableName
                      );
                    });
                  }
                  if (index == inputFieldData.length - 1) {
                    if (typeof callSaveFunctionOnLastTab === "function") {
                      callSaveFunctionOnLastTab();
                    }
                  }
                }}
                required={field.isRequired}
                sx={{
                  ...customTimePickerStyleCss({
                    fieldname: values?.[`${field.fieldname}`],
                    isFocused,
                  }),
                }}
                className={styles.inputField}
                disabled={
                  isView ||
                  (inEditMode?.isEditMode
                    ? inEditMode?.isCopy === true
                      ? !field?.isCopyEditable
                      : ["e", "b"].includes(
                          field.isEditableMode?.toLowerCase()
                        ) && !field.isEditable
                    : ["a", "b"].includes(
                        field.isEditableMode?.toLowerCase()
                      ) && !field.isEditable)
                }
              />
            </div>
          </LightTooltip>
        );
      case "datetime":
        return (
          <LightTooltip title={inputLabel}>
            <div>
              <DateTimePicker
                autoFocus={clearFlag.isClear} // Automatically focus if clearDateFlag is true
                size="small"
                id={uniqueId}
                key={index}
                label={
                  <span className={`${styles.inputTextColor}`}>
                    {inputLabel}
                    {field.isRequired && (
                      <span style={{ color: "red" }}> *</span>
                    )}
                  </span>
                }
                inputRef={inputRef}
                onOpen={() => {
                  setIsFocused(true);
                  setonFocusValue(values?.[field.fieldname]);
                }}
                onClose={() => {
                  setIsFocused(false);
                  if (onFocusValue !== values[field.fieldname]) {
                    const funcCallString = field.functionOnChange;
                    if (
                      funcCallString !== undefined &&
                      funcCallString !== null &&
                      funcCallString !== ""
                    ) {
                      let multiCallFunctions = funcCallString.split(";");
                      multiCallFunctions.forEach((funcCall) => {
                        handleFuncChangeCall(
                          funcCall,
                          values,
                          field.fieldname,
                          tableName
                        );
                      });
                    }
                  }
                  const funcCallString = field.functionOnBlur;
                  if (
                    funcCallString !== undefined &&
                    funcCallString !== null &&
                    funcCallString !== ""
                  ) {
                    let multiCallFunctions = funcCallString.split(";");
                    multiCallFunctions.forEach((funcCall) => {
                      handleFuncChangeCall(
                        funcCall,
                        values,
                        field.fieldname,
                        tableName
                      );
                    });
                  }
                  if (index == inputFieldData.length - 1) {
                    if (typeof callSaveFunctionOnLastTab === "function") {
                      callSaveFunctionOnLastTab();
                    }
                  }
                }}
                ampm={false}
                viewRenderers={{
                  hours: renderTimeViewClock,
                  minutes: renderTimeViewClock,
                  seconds: renderTimeViewClock,
                }}
                slotProps={{
                  textField: {
                    style: {
                      background: "white",
                    },
                    inputProps: {
                      onBlur: (e) => handleDateTimeChange(e, field),
                    },
                  },
                  field: { clearable: true },
                  actionBar: {
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
                onChange={(time) => {
                  handleChange(time, field);

                  let formattedValue = time;
                  if (time && typeof time.format === "function") {
                    formattedValue = dayjs(time).format("YYYY-MM-DD HH:mm:ss");
                    values[`${field.fieldname}`] = formattedValue; // Adjust the format as needed
                  }
                }}
                onBlur={(e) => {
                  if (
                    onFocusValue !== values[field.fieldname] &&
                    values[field.fieldname] !== ""
                  ) {
                    // values[field.fieldname] = e.target.value;
                    const funcCallString = field.functionOnChange;
                    if (
                      funcCallString !== undefined &&
                      funcCallString !== null &&
                      funcCallString !== ""
                    ) {
                      let multiCallFunctions = funcCallString.split(";");
                      multiCallFunctions.forEach((funcCall) => {
                        handleFuncChangeCall(
                          funcCall,
                          values,
                          field.fieldname,
                          tableName
                        );
                      });
                    }
                  }
                  typeof formControlValidation?.[field.functionOnBlur] ===
                    "function" &&
                    onBlurHandler((state) => {
                      return formControlValidation?.[field.functionOnBlur](
                        state,
                        field.fieldname,
                        e.target.value
                      );
                    });

                  // values[field.fieldname] = e.target.value;
                  const funcCallString = field.functionOnBlur;
                  if (
                    funcCallString !== undefined &&
                    funcCallString !== null &&
                    funcCallString !== ""
                  ) {
                    let multiCallFunctions = funcCallString.split(";");
                    multiCallFunctions.forEach((funcCall) => {
                      //                      // console.log("funcCall", funcCall);
                      handleFuncBlurCall(
                        funcCall,
                        values,
                        field.fieldname,
                        tableName
                      );
                    });
                  }
                  if (index == inputFieldData.length - 1) {
                    if (typeof callSaveFunctionOnLastTab === "function") {
                      callSaveFunctionOnLastTab();
                    }
                  }
                }}
                required={field.isRequired}
                sx={{
                  ...customDateTimePickerStyleCss({
                    fieldname: values?.[`${field.fieldname}`],
                    isFocused,
                  }),
                }}
                className={styles.inputField}
                disabled={
                  isView ||
                  (inEditMode?.isEditMode
                    ? inEditMode?.isCopy === true
                      ? !field?.isCopyEditable
                      : ["e", "b"].includes(
                          field.isEditableMode?.toLowerCase()
                        ) && !field.isEditable
                    : ["a", "b"].includes(
                        field.isEditableMode?.toLowerCase()
                      ) && !field.isEditable)
                }
              />
            </div>
          </LightTooltip>
        );
      case "textarea":
        return (
          <LightTooltip title={inputLabel}>
            <div
              className={`textarea-container `}
              style={{
                position: "relative",
                minHeight: "27px",
                width: "10rem",
              }}
            >
              <p
                className={`custom-placeholder ${
                  textareaLabel || values?.[field.fieldname]
                    ? "bg-[--inputBg] pr-[10%] leading-[0.8px] top-[0px] scale-100 "
                    : "top-[7px]"
                } `}
                style={{
                  ...textAreaLabelStyle,
                }}
              >
                {inputLabel}
                {field.isRequired && <span style={{ color: "red" }}>*</span>}
              </p>
              <TextareaAutosize
                className={`resize w-[10rem] bg-[var(--inputBg)] disabled:border-[#B2BAC2] hover:border-[var(--inputBorderHoverColor)] disabled:text-[#B2BAC2] focus:outline-none focus:border-[var(--inputBorderHoverColor)] overflow-none h-[27px] text-[10px] pt-[6px] pl-[10px]  leading-normal rounded-xl rounded-br-none  border ${styles.inputField}`}
                aria-label="empty textarea"
                required={field.isRequired}
                maxRows={"27px"}
                ref={inputRef}
                value={values?.[field.fieldname] || ""}
                disabled={
                  isView ||
                  (inEditMode?.isEditMode
                    ? inEditMode?.isCopy === true
                      ? !field?.isCopyEditable
                      : ["e", "b"].includes(
                          field.isEditableMode?.toLowerCase()
                        ) && !field.isEditable
                    : ["a", "b"].includes(
                        field.isEditableMode?.toLowerCase()
                      ) && !field.isEditable)
                }
                onPaste={handlePaste}
                onChange={(e) => {
                  //                  console.log("e.target.value", e.target.value);
                  if (
                    e.target.value.toString().length <= field.size ||
                    !field.size
                  ) {
                    handleChange(e.target.value, field);
                    // setTextAreaValueChange(e.target.value);
                    values[field.fieldname] = e.target.value;
                    setTextAreaErrorLimit(0);
                  } else {
                    setTextAreaErrorLimit((prev) => prev + 1);
                    textAreaLimitErrorFun();
                    e.preventDefault();
                  }
                }}
                onBlur={(e) => {
                  settextareaLabel(false);
                  //                  console.log("onBlured value", e.target.value);
                  if (index == inputFieldData.length - 1) {
                    if (typeof callSaveFunctionOnLastTab === "function") {
                      callSaveFunctionOnLastTab();
                    }
                  }

                  if (inputLabel.length == 0 && values?.[field.fieldname]) {
                    setShowLabel(false);
                  }

                  if (field) {
                    setIsFocused(false);
                  } else {
                    setIsFocused(true);
                  }
                  //                  console.log("onFocusValue", onFocusValue, e.target.value);

                  if (onFocusValue !== e.target.value) {
                    values[field.fieldname] = e.target.value;
                    const funcCallString = field.functionOnChange;
                    if (
                      funcCallString !== undefined &&
                      funcCallString !== null &&
                      funcCallString !== ""
                    ) {
                      let multiCallFunctions = funcCallString.split(";");
                      multiCallFunctions.forEach((funcCall) => {
                        handleFuncChangeCall(
                          funcCall,
                          values,
                          field.fieldname,
                          tableName
                        );
                      });
                    }
                  }
                  const funcCallString = field.functionOnBlur;
                  if (
                    funcCallString !== undefined &&
                    funcCallString !== null &&
                    funcCallString !== ""
                  ) {
                    let multiCallFunctions = funcCallString.split(";");
                    multiCallFunctions.forEach((funcCall) => {
                      //                      // console.log("funcCall", funcCall);
                      handleFuncBlurCall(
                        funcCall,
                        values,
                        field.fieldname,
                        tableName
                      );
                    });
                  }
                }}
                onFocus={(e) => {
                  settextareaLabel(true);
                  setIsFocused(true);
                  setShowLabel(true);
                  setonFocusValue(e.target.value);
                }}
              />
            </div>
          </LightTooltip>
        );
      case "file":
        return (
          <LightTooltip title={inputLabel}>
            <div className="flex flex-col ">
              <Button
                component="label"
                className={`w-[25rem] h-[27px] text-sm ${styles.inputTextColor} leading-normal p-3 rounded-xl rounded-br-none  focus:shadow-lg border-gray-300 border  hover:border-gray-500 dark:hover:border-gray-500 focus:border-gray-500 dark:focus:border-gray-500 dark:border-slate-600  dark:bg-slate-900 text-slate-900 dark:text-slate-300 focus-visible:outline-0 box-border ${styles.inputField}`}
                role={undefined}
                onChange={(e) => {
                  handleChange(e.target.files[0], field);

                  values[field.fieldname] = e.target.files[0];
                  const funcCallString = field.functionOnChange;
                  if (
                    funcCallString !== undefined &&
                    funcCallString !== null &&
                    funcCallString !== ""
                  ) {
                    let multiCallFunctions = funcCallString.split(";");
                    multiCallFunctions.forEach((funcCall) => {
                      handleFuncChangeCall(
                        funcCall,
                        values,
                        field.fieldname,
                        tableName
                      );
                    });
                  }
                }}
                sx={{
                  ...fileInputStyle,
                }}
                variant="outlined"
                tabIndex={-1}
                startIcon={<CloudUploadIcon />}
                disabled={
                  isView ||
                  (inEditMode?.isEditMode
                    ? inEditMode?.isCopy === true
                      ? !field?.isCopyEditable
                      : ["e", "b"].includes(
                          field.isEditableMode?.toLowerCase()
                        ) && !field.isEditable
                    : ["a", "b"].includes(
                        field.isEditableMode?.toLowerCase()
                      ) && !field.isEditable)
                }
              >
                <span className="text-[10px]">
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
                <VisuallyHiddenInput type="file" />
              </Button>
              {fileName[field.fieldname] && (
                <span className=" mt-[1px] text-[10px] ml-[2px] ">
                  {fileName[field.fieldname]}
                </span>
              )}
            </div>
          </LightTooltip>
        );
      case "label":
        return (
          <LightTooltip title={inputLabel}>
            <div
              className={`${styles.labelStyles}`}
              style={{ display: "block" }}
            >
              <span className="text-[10px]">
                {field.isDummy && (
                  <span className={`${styles.dummyLabelStyles} `}>
                    {inputLabel} {values?.[`${field.fieldname}`]}
                  </span>
                )}
              </span>
            </div>
          </LightTooltip>
        );
      case "hyperlink":
        return (
          <LightTooltip title={field.hyperlinkValue}>
            <div className={`${styles.labelStyles}`}>
              <a
                onClick={() => {
                  console.log("selectedIndex", selectedIndex);
                  let url = field.hyperlinkValue;
                  const pattern = "${newState.tblJob[0].id}";
                  if (url.includes(pattern)) {
                    url = url.replace(
                      pattern,
                      `\${newState.tblJob[${selectedIndex}].id}`
                    );
                  } else {
                    url = field.hyperlinkValue;
                  }
                  let encodedData;
                  let fullUrl = url;

                  // Check if the URL already contains a protocol (http:// or https://)
                  if (!/^https?:\/\//i.test(url)) {
                    // If the URL doesn't contain a protocol, prepend the current page's base URL
                    const baseUrl =
                      window.location.protocol +
                      "//" +
                      window.location.hostname;
                    // In case the current URL is localhost, append the port number if necessary
                    if (window.location.port) {
                      fullUrl =
                        baseUrl + ":" + window.location.port + "/" + url;
                    } else {
                      fullUrl = baseUrl + "/" + url;
                    }
                  }
                  const urlObj = new URL(fullUrl); // Create a URL object to easily handle the parts of the URL

                  // Get the last segment of the pathname (ignoring query parameters)
                  const pathSegments = urlObj.pathname.split("/");
                  console.log("pathSegments", pathSegments);

                  // Check if URL is valid and if there’s encoded data at the end
                  try {
                    // In case there's no encoded data, we'll just proceed with the URL as is
                    const urlParts = url.split("/");
                    encodedData = pathSegments.pop();
                    console.log(
                      "encodedData",
                      decodeURIComponent(encodedData).startsWith("{")
                    );
                    // Get the last part of the URL

                    if (!decodeURIComponent(encodedData).startsWith("{")) {
                      // If no encoded data is found, just open the URL as is
                      console.log(
                        "No encoded data found, opening URL directly:",
                        url
                      );
                      window.open(url, "_blank");
                      return; // Exit early
                    }
                  } catch (error) {
                    console.error("Error extracting encoded data:", error);
                    return; // Exit early if URL is invalid
                  }

                  // Step 1: Decode the URL-encoded string
                  let decodedString;
                  try {
                    decodedString = decodeURIComponent(encodedData);
                    console.log("decodedString", decodedString);
                  } catch (error) {
                    console.error("Error decoding URL-encoded data:", error);
                    return; // Exit early if URL-decoding fails
                  }

                  // Step 2: Function for dynamic value replacement
                  function dynamicValueReplace(inputString) {
                    try {
                      // Convert double quotes string to backtick string (assuming this is your intent)
                      inputString = inputString.replace(/"/g, '"');

                      // Extract variable names from the inputString
                      let variableNames = inputString.match(/\${(.*?)}/g);

                      // If no variables are found, return the input string as is
                      if (!variableNames) {
                        return inputString;
                      }

                      // Replace all variables in inputString with their corresponding values
                      for (let i = 0; i < variableNames.length; i++) {
                        let variableName = variableNames[i]
                          .replace("${", "")
                          .replace("}", "");

                        // Detect if it's matching the pattern regardless of index
                        const patternMatch = variableName.match(
                          /newState\.tblJob\[(\d+)\]\.id/
                        );

                        if (patternMatch) {
                          // Replace index with selectedIndex
                          const updatedVariableName = variableName.replace(
                            /\[\d+\]/,
                            `[${selectedIndex}]`
                          );

                          const variableValue = eval(updatedVariableName); // Get the ID value

                          inputString = inputString.replace(
                            "${" + variableName + "}",
                            variableValue
                          );
                        } else {
                          const variableValue = eval(variableName);

                          inputString = inputString.replace(
                            "${" + variableName + "}",
                            variableValue
                          );
                        }
                      }

                      console.log("Processed inputString:", inputString);
                      return inputString;
                    } catch (error) {
                      console.error(
                        "Error during dynamic value replacement:",
                        error
                      );
                      return inputString; // Return the input string unchanged in case of error
                    }
                  }

                  // Step 3: Parse the JSON string into a JavaScript object (if needed)
                  let dataObject;
                  try {
                    const processedString = dynamicValueReplace(decodedString);
                    dataObject = JSON.parse(processedString);
                    console.log("dataObject parsed:", dataObject);
                  } catch (error) {
                    console.error("Error parsing the JSON string:", error);
                    return; // Exit early if JSON parsing fails
                  }

                  // Step 4: Modify the dataObject if needed
                  try {
                    dataObject.modifiedKey = "New Value"; // Modify as per your requirements
                  } catch (error) {
                    console.error("Error modifying the dataObject:", error);
                    return; // Exit early if modification fails
                  }

                  // Step 5: Re-encode the modified dataObject
                  let modifiedEncodedData;
                  try {
                    modifiedEncodedData = encodeURIComponent(
                      JSON.stringify(dataObject)
                    );
                  } catch (error) {
                    console.error("Error encoding the modified data:", error);
                    return; // Exit early if encoding fails
                  }

                  // Step 6: Construct new URL and open it
                  try {
                    const baseUrl = url.substring(0, url.lastIndexOf("/") + 1);
                    const newUrl = baseUrl + modifiedEncodedData;
                    console.log("Modified URL:", newUrl);

                    // Open the modified URL
                    window.open(newUrl, "_blank");
                  } catch (error) {
                    console.error("Error opening the new URL:", error);
                  }
                }}
                // href={field.hyperlinkValue}
                // target="_blank"
                rel="noopener noreferrer"
                className="text-[10px] underline text-blue-600 hover:text-blue-800 cursor-pointer"
              >
                {inputLabel || "Open Google"}
              </a>
            </div>
          </LightTooltip>
        );
      case "text":
      default:
        return (
          <LightTooltip title={inputLabel}>
            <CustomeTextField
              // style={{
              //   display: "none",
              // }}
              autoComplete="off"
              id={uniqueId}
              ref={inputRef}
              type={field.type === "decimal" ? "number" : field.type}
              label={
                <span className={`${styles.inputTextColor} `}>
                  {inputLabel}
                </span>
              }
              onFocus={(e) => {
                setIsFocused(true);
                setonFocusValue(e.target.value);
              }}
              sx={{
                ...textInputStyleForStaticPage({
                  fieldname: values?.[`${field.fieldname}`],
                  isFocused,
                }),
              }}
              variant="outlined"
              size="small"
              name={field.fieldname}
              required={field.isRequired}
              className={`${styles.inputField} ${
                field.type === "decimal" || field.type === "number"
                  ? "w-[10rem]"
                  : ""
              }`}
              value={
                values?.[field.fieldname] ?? field.controlDefaultValue ?? ""
              }
              onChange={(e) => {
                if (
                  e.target.value.toString().length <= field.size ||
                  !field.size
                ) {
                  handleChange(e.target.value, field);
                }
              }}
              onKeyDown={(e) => {
                if (menuId === "1384") {
                  if (e.key === "Tab") {
                    handleChangeDynamic(e.target.value, field);
                  }
                }
              }}
              onBlur={(e) => {
                if (onFocusValue !== e.target.value) {
                  values[field.fieldname] = e.target.value;
                  const funcCallString = field.functionOnChange;

                  if (funcCallString) {
                    const multiCallFunctions = funcCallString.split(";");
                    let updatedValues = values;

                    multiCallFunctions.forEach((funcCall) => {
                      if (funcCall.trim()) {
                        updatedValues = handleFuncChangeCall(
                          funcCall,
                          updatedValues,
                          field.fieldname,
                          tableName
                        );
                      }
                    });

                    onChangeHandler(updatedValues);
                  }
                }

                setIsFocused(false);

                // Call form validation if defined
                if (
                  typeof formControlValidation?.[field.functionOnBlur] ===
                  "function"
                ) {
                  onBlurHandler((state) => {
                    return formControlValidation?.[field.functionOnBlur]({
                      state: state,
                      fieldName: field.fieldname,
                      value: e.target.value,
                    });
                  });
                }

                // Handle any functionOnBlur logic
                const funcCallString = field.functionOnBlur;
                if (funcCallString) {
                  let multiCallFunctions = funcCallString.split(";");
                  let updatedValues = values;

                  multiCallFunctions.forEach((funcCall) => {
                    updatedValues = handleFuncBlurCall(
                      funcCall,
                      updatedValues,
                      field.fieldname,
                      tableName
                    );
                  });

                  onBlurHandler(updatedValues);
                }

                // Save if it's the last field
                if (index === inputFieldData.length - 1) {
                  if (typeof callSaveFunctionOnLastTab === "function") {
                    callSaveFunctionOnLastTab();
                  }
                }

                // Also trigger handleChangeDynamic on blur (if needed like on Tab)
                if (menuId === "1384") {
                  handleChangeDynamic(e.target.value, field);
                }
              }}
              disabled={
                isView ||
                (inEditMode?.isEditMode
                  ? inEditMode?.isCopy === true
                    ? !field?.isCopyEditable
                    : ["e", "b"].includes(
                        field.isEditableMode?.toLowerCase()
                      ) && !field.isEditable
                  : ["a", "b"].includes(field.isEditableMode?.toLowerCase()) &&
                    !field.isEditable)
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
    <div
      className={`flex flex-wrap py-[3px] ${
        inputFieldData?.map((field) => field.isBreak).includes(true)
          ? ""
          : "mr-2 "
      }
      `}
    >
      {inputFieldData?.map((field, index, array) => {
        const startNewLine = index > 0 && array[index - 1]?.isBreak;
        //        console.log("inputFieldData", inputFieldData);
        //        console.log("field.controlname", field.controlname);
        field.controlname =
          typeof field.controlname === "string"
            ? field.controlname.toLowerCase()
            : "text";
        const numberOfEnter =
          index > 0 && array[index - 1]?.isBreak
            ? Number(field.numberOfEnter) || 1
            : 0;
        let fieldId = `${field.controlname}_${field.fieldname}_${field?.id}`;
        return (
          <React.Fragment key={index}>
            {startNewLine && (
              <div className="w-full">
                {[...Array(numberOfEnter)].map((_, i) => (
                  <div key={i} className="h-[0px]" />
                ))}
              </div>
            )}
            <div
              id={fieldId}
              style={
                field?.columnsToBeVisible === false ? { display: "none" } : {}
              }
              className={`${startNewLine ? "mr-2 " : "mr-2 mb-2"}`}
            >
              {renderInputField(field, index)}
            </div>
          </React.Fragment>
        );
      })}
    </div>
  );
}
