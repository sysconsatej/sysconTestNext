/* eslint-disable */
/* eslint-disable no-unused-vars */
"use client";

import { toast } from "react-toastify";
import {
  getTaxDetails,
  getTDSDetails,
  getJobCharge,
  getJobChargeDetails,
  fetchDataAPI,
  checkDuplicateAPI,
  getCharges,
  fetchReportData,
  dynamicDropDownFieldsData,
  getInvoice,
  getVoucherInvoiceData,
  getGLChargeDetails,
  getBlChargeDetails,
  getTaxDetailsQuotation,
  getValidateForDo,
  getGeneralLegerBillingParty,
  getContainerRepairDetails,
  fetchThirdLevelDetailsFromApi,
  getDetentionDetails,
  getThridDatePurchaseData,
  calculateDetentionRateData,
  fetchContainerNoData,
  getVoucher,
  getVoucherThirdLevelData,
} from "@/services/auth/FormControl.services";
import { getUserDetails } from "@/helper/userDetails";
import moment from "moment";
import { decrypt } from "@/helper/security";
const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;
const { clientId } = getUserDetails();
const CheckPrice = (MainJson, fieldName, event) => {
  // console.log("event", event, "value", MainJson[fieldName], "from", fieldName);
  if (MainJson[fieldName] == "8057532605") {
    MainJson["demo_data"] = "kunal";
  }
  return MainJson;
};
const calculateData = (obj) => {
  // console.log("obj", obj);
  const { mainJson, value, targetFieldName } = obj;
  mainJson[targetFieldName] = value;
  // console.log("mainJson", mainJson);
  return mainJson;
};
// const grossAndNetWeight = (obj) => {
//   const {
//     args,
//     values,
//     fieldName,
//     newState,
//     formControlData,
//     setStateVariable,
//   } = obj;
//   let argNames; // destructure the argsStr and values
//   // console.log("values", values, "args", typeof args)

//   if (args === undefined || args === null || args === "") {
//     argNames = args;
//   } else {
//     argNames = args.split(",").map((arg) => arg.trim());
//   }

//   // function logic
//   const grossWt =
//     values[argNames[0]] !== undefined ? Number(values[argNames[0]]) : 0;
//   const netWt =
//     values[argNames[1]] !== undefined ? Number(values[argNames[1]]) : 0;
//   // console.log("grossWt", grossWt, "netWt", netWt);

//   if (
//     netWt > grossWt &&
//     grossWt !== 0 &&
//     (values[fieldName] != null || values[fieldName] != "")
//   ) {
//     values[fieldName] = null;

//     setStateVariable((prev) => ({
//       ...prev,
//       [fieldName]: null,
//     }));

//     return {
//       isCheck: false,
//       type: "error",
//       message: `${argNames[1]} should be less than ${argNames[0]}`,
//       alertShow: true,
//       fieldName: fieldName,
//       values: values,
//       newState: newState,
//       formControlData: formControlData,
//     };
//   }
//   return {
//     isCheck: false,
//     type: "error",
//     message: `${argNames[1]} should be less than ${argNames[0]}`,
//     alertShow: false,
//     fieldName: fieldName,
//     values: values,
//     newState: newState,
//     formControlData: formControlData,
//   };
// };
const demoFunctionOnChange = (obj) => {
  const { args, values, fieldName, newState } = obj;
  console.log("values - - - ", values);
  let argNames;

  if (
    args === undefined ||
    args === null ||
    args === "" ||
    (typeof args === "object" && Object.keys(args).length === 0)
  ) {
    argNames = args;
  } else {
    argNames = args.split(",").map((arg) => arg.trim());
  }

  let endResult = {
    isCheck: false,
    type: "success",
    message: "OnChange function triggered",
    values: values,
    alertShow: true,
    fieldName: fieldName,
    newState: newState,
  };
  return endResult;
};
const demoFunctionOnBlur = (obj) => {
  const { args, values, fieldName, newState } = obj;
  // console.log("values", values, "args", typeof args)
  let argNames;

  if (
    args === undefined ||
    args === null ||
    args === "" ||
    (typeof args === "object" && Object.keys(args).length === 0)
  ) {
    argNames = args;
  } else {
    argNames = args.split(",").map((arg) => arg.trim());
  }
  let endResult = {
    isCheck: false,
    type: "success",
    message: `onBlur function triggered`,
    values: values,
    alertShow: false,
    fieldName: fieldName,
    newState: newState,
  };
  return endResult;
};
const copyTableFunction = (obj) => {
  // console.log("copyTableFunction");
  const { args, values, fieldName, newState } = obj;
  // console.log("values", values, "args", typeof args)
  let argNames;

  if (
    args === undefined ||
    args === null ||
    args === "" ||
    (typeof args === "object" && Object.keys(args).length === 0)
  ) {
    argNames = args;
  } else {
    argNames = args.split(",").map((arg) => arg.trim());
  }

  // function logic
  const plrId = values[argNames[0]] ? values[argNames[0]] : "";
  const polId = values[argNames[1]] ? values[argNames[1]] : "";
  // console.log("plrId", plrId, "polId", polId);

  values[argNames[1]] = plrId;
  // console.log("values", values);

  let endResult = {
    isCheck: true,
    type: "success",
    message: "copyTableFunction function triggered",
    values: values,
    alertShow: false,
    fieldName: fieldName,
    newState: newState,
  };
  return endResult;
};
const dateCheck = (obj) => {
  const { args, values, fieldName, newState } = obj;
  let argNames;
  // console.log("values", values, "args", args)

  if (
    args === undefined ||
    args === null ||
    args === "" ||
    (typeof args === "object" && Object.keys(args).length === 0)
  ) {
    argNames = args;
  } else {
    argNames = args.split(",").map((arg) => arg.trim());
  }

  // function logic
  const date = values[fieldName] ? values[fieldName] : "";
  // console.log("date", date);
  let endResult = {
    type: "success",
    values: values,
    isCheck: false,
    alertShow: false,
    fieldName: fieldName,
    newState: newState,
  };

  const today = moment().format("DD-MMM-YYYY");

  if (moment(date).isBefore(today)) {
    endResult.message = `Date cannot be less than today's date (${today})`;
    endResult.alertShow = true;
    values[fieldName] = "";
  }
  return endResult;
};
const textFieldOnChangeFunction = (obj) => {
  const { args, values, fieldName, newState } = obj;
  let argNames;
  // console.log("values", values, "args", args)

  if (
    args === undefined ||
    args === null ||
    args === "" ||
    (typeof args === "object" && Object.keys(args).length === 0)
  ) {
    argNames = args;
  } else {
    argNames = args.split(",").map((arg) => arg.trim());
  }

  let endResult = {
    type: "success",
    values: values,
    isCheck: false,
    alertShow: false,
    fieldName: fieldName,
    newState: newState,
    message: "textFieldOnChangeFunction function triggered",
  };
  return endResult;
};
const SetDecimalsGeneric = (obj) => {
  const {
    args,
    fieldName,
    values,
    newState,
    formControlData,
    setStateVariable,
  } = obj;
  const argNames = args.split(",").map((arg) => arg.trim());
  const decimalSize = argNames[1];
  const decimalCheck = parseInt(argNames[1], 10); // Convert to integer using base-10
  const fieldSize = 10;
  const size = fieldSize;
  const data = values && values[fieldName];
  if (data < "0") {
    return {
      isCheck: false,
      type: "success",
      message: "Error fetching company parameters",
      alertShow: false,
      fieldName: fieldName,
      values: values,
      newState: newState,
      formControlData: formControlData,
    };
  } else {
    if (data != null) {
      const decimalNumber = Number(data).toFixed(decimalSize);
      const dataLength = decimalNumber.length;
      if (dataLength > size) {
        values[fieldName] = null;

        setStateVariable((prev) => ({
          ...prev,
          [fieldName]: null,
        }));
        return {
          isCheck: false,
          type: "success",
          message: `You can enter Max ${fieldSize - decimalCheck - 1
            } Characters`,
          alertShow: true,
          fieldName: fieldName,
          values: values,
          newState: newState,
          formControlData: formControlData,
        };
      } else {
        values[fieldName] = decimalNumber;

        setStateVariable((prev) => ({
          ...prev,
          [fieldName]: decimalNumber,
        }));
        return {
          isCheck: false,
          type: "success",
          message: "Error fetching company parameters",
          alertShow: false,
          fieldName: fieldName,
          values: values,
          newState: newState,
          formControlData: formControlData,
        };
      }
    }
  }
};
const GetCurrentData = (obj) => {
  const {
    args,
    fieldName,
    values,
    newState,
    formControlData,
    setStateVariable,
  } = obj;
  const argNames = args.split(",").map((arg) => arg.trim());
  const currentDate = new Date();

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0"); // Months are zero-based
    const day = String(date.getDate()).padStart(2, "0");
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
    const seconds = String(date.getSeconds()).padStart(2, "0");
    const formattedDate = `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
    return formattedDate;
  };

  newState[argNames[0]] = formatDate(currentDate);
  setStateVariable((prev) => ({
    ...prev,
    [argNames[0]]: formatDate(currentDate),
  }));
  //return { ...obj, values: { ...values }, newState: newState };
  return {
    isCheck: false,
    type: "success",
    message: "Error fetching company parameters",
    alertShow: false,
    fieldName: fieldName,
    values: values,
    newState: newState,
    formControlData: formControlData,
  };
};
const validateDate = (obj) => {
  const {
    args,
    fieldName,
    values,
    newState,
    formControlData,
    setStateVariable,
  } = obj;

  // Function to extract arguments inside curly braces
  const extractArgsInCurlyBraces = (argString) => {
    const regex = /{([^}]+)}/g;
    const matches = argString.match(regex);
    return matches ? matches.map((match) => match.slice(1, -1)) : [];
  };

  // Parse the args to get field comparisons and operators
  const argNamesInCurlyBraces = extractArgsInCurlyBraces(args);
  const otherArgs = args
    .replace(/,{[^}]+}/, "")
    .split(",")
    .map((arg) => arg.trim());

  // Identify the operator and fields to compare
  let operator = "";
  let fieldToCompare = "";
  let comparisonFields = [];

  otherArgs.forEach((arg) => {
    if (["<", "<=", ">", ">="].includes(arg)) {
      operator = arg;
    } else {
      fieldToCompare = arg;
    }
  });

  if (argNamesInCurlyBraces.length > 0) {
    comparisonFields = argNamesInCurlyBraces[0]
      .split(",")
      .map((arg) => arg.trim());
  }

  if (!operator || !fieldToCompare) {
    console.error("Operator or field for comparison not found in otherArgs.");
    return;
  }

  const fieldValue = newState[fieldToCompare] ?? values[fieldToCompare];
  const fieldToCompareLabel = formControlData?.fields?.find(
    (f) => f.fieldname === fieldToCompare
  );
  const labelToCompare = fieldToCompareLabel
    ? fieldToCompareLabel.yourlabel
    : fieldToCompare;

  if (!fieldValue) {
    return {
      isCheck: false,
      type: "success",
      message: "Error fetching company parameters",
      alertShow: false,
      fieldName: fieldName,
      values: values,
      newState: newState,
      formControlData: formControlData,
    };
  }

  const currentDate = new Date();
  const trimmedFieldValueDate = new Date(fieldValue.split(" ")[0]).getTime();

  const trimmedCurrentDate = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth(),
    currentDate.getDate()
  ).getTime();

  let alertMessages = [];

  const operatorWords = {
    "<": "greater than",
    "<=": "less than or equal to",
    ">": "less than",
    ">=": "greater than or equal to",
  };

  // Check each field to compare
  for (const field of comparisonFields) {
    if (!newState[field] && !values[field]) continue;

    const dateValue = new Date(
      newState[field]
        ? newState[field].split(" ")[0]
        : values[field].split(" ")[0]
    ).getTime();

    const fieldlabel = formControlData?.fields?.find(
      (f) => f.fieldname === field
    );
    const yourlabel = fieldlabel ? fieldlabel.yourlabel : field;

    // Check for "now" comparison
    if (field === "now") {
      switch (operator) {
        case "<":
          if (trimmedCurrentDate <= trimmedFieldValueDate) {
            alertMessages.push(
              `${labelToCompare} is ${operatorWords[operator]} Current Date`
            );
          }
          break;
        case "<=":
          if (
            trimmedCurrentDate > trimmedFieldValueDate &&
            trimmedCurrentDate !== trimmedFieldValueDate
          ) {
            alertMessages.push(
              `${labelToCompare} is ${operatorWords[operator]} Current Date`
            );
          }
          break;
        case ">":
          if (trimmedCurrentDate >= trimmedFieldValueDate) {
            alertMessages.push(
              `${labelToCompare} is ${operatorWords[operator]} Current Date`
            );
          }
          break;
        case ">=":
          if (
            trimmedCurrentDate < trimmedFieldValueDate &&
            trimmedCurrentDate !== trimmedFieldValueDate
          ) {
            alertMessages.push(
              `${labelToCompare} is ${operatorWords[operator]} Current Date`
            );
          }
          break;
        default:
          break;
      }
    } else {
      // Existing comparison logic for other fields
      switch (operator) {
        case "<":
          if (dateValue <= trimmedFieldValueDate) {
            alertMessages.push(
              `${labelToCompare} is ${operatorWords[operator]} ${yourlabel}`
            );
          }
          break;
        case "<=":
          if (
            dateValue > trimmedFieldValueDate &&
            dateValue !== trimmedFieldValueDate
          ) {
            alertMessages.push(
              `${labelToCompare} is ${operatorWords[operator]} ${yourlabel}`
            );
          }
          break;
        case ">":
          if (dateValue >= trimmedFieldValueDate) {
            alertMessages.push(
              `${labelToCompare} is ${operatorWords[operator]} ${yourlabel}`
            );
          }
          break;
        case ">=":
          if (
            dateValue < trimmedFieldValueDate &&
            dateValue !== trimmedFieldValueDate
          ) {
            alertMessages.push(
              `${labelToCompare} is ${operatorWords[operator]} ${yourlabel}`
            );
          }
          break;
        default:
          break;
      }
    }
  }

  const errorMessage = alertMessages.join(" , ");
  if (alertMessages.length > 0) {
    newState[fieldName] = null;
    values[fieldName] = null;
    setStateVariable((prev) => ({
      ...prev,
      [fieldName]: null,
    }));
    return {
      isCheck: false,
      type: "error",
      message: errorMessage,
      alertShow: true,
      fieldName: fieldName,
      values: values,
      newState: newState,
      formControlData: formControlData,
    };
  }

  return {
    isCheck: false,
    type: "success",
    message: "Error fetching company parameters",
    alertShow: false,
    fieldName: fieldName,
    values: values,
    newState: newState,
    formControlData: formControlData,
  };
};
const validateSameValues = (obj) => {
  const {
    args,
    fieldName,
    values,
    newState,
    formControlData,
    setStateVariable,
  } = obj;
  const argNames = args.split(",").map((arg) => arg.trim());
  const [originKey, destinationKey] = argNames;

  // Extract values based on provided keys
  const originCol = values[originKey];
  const destinationCol = values[destinationKey];
  const originColValue = String(originCol);

  const originField = formControlData?.fields?.find(
    (f) => f.fieldname === originKey
  );
  const originlabel = originField ? originField.yourlabel : field;

  const destinationField = formControlData?.fields?.find(
    (f) => f.fieldname === destinationKey
  );
  let field = null;
  const destinationlabel = destinationField
    ? destinationField?.yourlabel
    : field;

  const destinationColValue = String(destinationCol);

  if (!originColValue || !destinationColValue) {
    return {
      isCheck: false,
      type: "error",
      message: `one of the field is empty`,
      alertShow: false,
      fieldName: fieldName,
      values: values,
      newState: newState,
      formControlData: formControlData,
    };
  }

  if (originColValue === destinationColValue) {
    const fieldsToCheck = [fieldName].map((key) => `${key}dropdown`);

    fieldsToCheck.forEach((field) => {
      if (newState.hasOwnProperty(field)) {
        if (Array.isArray(newState[field])) {
          newState[field].forEach((item) => {
            if (
              item &&
              typeof item === "object" &&
              item.hasOwnProperty("label")
            ) {
              // Set the label to null
              item.label = null;
            }
          });
        } else {
          // If the field is not an array, set it to null
          newState[field] = null;
        }
      }
    });
    newState[fieldName] = null;
    setStateVariable((prev) => ({
      ...prev,
      [fieldName]: null,
    }));
    return {
      isCheck: false,
      type: "error",
      message: `${originlabel} and ${destinationlabel} cannot be same`,
      alertShow: true,
      fieldName: fieldName,
      values: values,
      newState: newState,
      formControlData: formControlData,
    };
  }

  return {
    isCheck: false,
    type: "success",
    message: "Error",
    alertShow: false,
    fieldName: fieldName,
    values: values,
    newState: newState,
    formControlData: formControlData,
  };
};
const setSameDDValues = (obj) => {
  const {
    args,
    fieldName,
    values,
    newState,
    formControlData,
    setStateVariable,
  } = obj;
  const argNames = args.split(",").map((arg) => arg.trim());
  const dropdown = values[fieldName];
  var dropdownValue;

  // Process dropdown
  if (dropdown && dropdown.hasOwnProperty("value")) {
    dropdownValue = dropdown.value;
  } else {
    dropdownValue = dropdown;
  }
  if (values[argNames[1]] == "" || values[argNames[1]] == null) {
    // Set values for dropdowns
    if (values.hasOwnProperty(argNames[1])) {
      values[argNames[1]] = dropdownValue;

      setStateVariable((prev) => ({
        ...prev,
        [argNames[1]]: dropdownValue,
      }));
    }

    return {
      isCheck: false,
      type: "success",
      message: "Error fetching company parameters",
      alertShow: false,
      fieldName: fieldName,
      values: values,
      newState: newState,
      formControlData: formControlData,
    };
  } else {
    return {
      isCheck: false,
      type: "success",
      message: "Error fetching company parameters",
      alertShow: false,
      fieldName: fieldName,
      values: values,
      newState: newState,
      formControlData: formControlData,
    };
  }
};
const handleArrayCase = (currentObj, sizeIdDropdownKey, labelKey, valueKey) => {
  let sizeObj = {};
  currentObj[sizeIdDropdownKey].forEach((dropdownObj) => {
    if (
      dropdownObj.hasOwnProperty(labelKey) &&
      dropdownObj.hasOwnProperty(valueKey)
    ) {
      sizeObj = {
        sizeId: dropdownObj[valueKey], // Set sizeId as the value of the dropdown object
        sizeIdDropdown: dropdownObj[labelKey], // Set sizeIdDropdown as the label of the dropdown object
      };
      // resultArray.push(sizeObj);
      console.log("handleArrayCase - Pushe  d sizeObj:", sizeObj); // Logging inside handleArrayCase
    }
  });

  return [sizeObj];
};
const handleNonArrayCase = (currentObj, sizeIdDropdownKey) => {
  let sizeObj = {
    sizeId: currentObj.sizeId,
    sizeIdDropdown: currentObj[sizeIdDropdownKey],
  };
  console.log("handleNonArrayCase - Created sizeObj:", sizeObj); // Logging inside handleNonArrayCase

  return [sizeObj];
};
const setUserName = (obj) => {
  const { args, fieldName, values, newState, formControlData } = obj;
  const storedUserData = localStorage.getItem("userData");
  let userData;

  if (storedUserData) {
    const decryptedData = decrypt(storedUserData);
    try {
      userData = JSON.parse(decryptedData);
    } catch (e) {
      console.error("Error parsing decrypted data:", e);
      return;
    }
  } else {
    console.error("No user data found in local storage");
    return;
  }

  if (!newState[args]) {
    if (Array.isArray(userData) && userData.length > 0 && userData[0].name) {
      newState[args] = userData[0].name;
    } else {
      console.error("Invalid user data structure or name is missing");
    }
  }
  return {
    isCheck: true,
    type: "success",
    values: values,
    fieldName: fieldName,
    newState: newState,
    formControlData: formControlData,
  };
};
const setBranch = async (obj) => {
  const { args, values, fieldName, newState, setdropDownValues } = obj;
  const argNames = args.split(",").map((arg) => arg.trim());

  const [
    originCol,
    companyBranchId,
    onfilterkey,
    onfiltervalue,
    referenceTable,
    referenceColumn,
  ] = argNames;
  const companyIdValue = values[originCol];

  const companyId =
    companyIdValue !== null && Object.keys(companyIdValue).length === 4
      ? companyIdValue.oldId
      : companyIdValue;
  const dropdownFilter = `{_id:${companyId.toString().replace(/['"]+/g, "")}}`;

  const requestBody = {
    onfilterkey: `${onfilterkey}`,
    onfiltervalue: parseInt(onfiltervalue),
    referenceTable: `${referenceTable}`,
    referenceColumn: `${referenceColumn}`,
    dropdownFilter: `${dropdownFilter}`,
  };
  const token =
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MTIsInVzZXJOYW1lIjoiYWthc2hAc3lzY29uaW5mb3RlY2guY29tIiwiaWF0IjoxNzE1NjYzNzI5MTYzLCJudW1iZXJGb3JtYXQiOm51bGwsImNsaWVudENvZGUiOiJOQ0xQIiwiZXhwIjoxNzE1NjcwOTI5MTYzfQ.reOUDa6BuGg5PqM72kJG9tNTO-0MX3RdP1-6ybVunXQ";
  try {
    const response = await fetch(`${baseUrl}/api/FormControl/DropDownList`, {
      method: "POST",
      headers: {
        "x-access-token": token,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    });
    const responseData = await response.json();
    setdropDownValues(responseData.data);

    let endResult = {
      isCheck: true,
      type: "success",
      message: "Rohit",
      values: values,
      alertShow: true,
      fieldName: fieldName,
      newState: newState,
    };
    return endResult;
  } catch (error) {
    console.error(error);
    return false;
  }
};
const setNoOfContainer = (obj) => {
  let { args, newState, formControlData, fieldName, values, setStateVariable } =
    obj;
  let argsArray = args.split(",");
  let sizeId = values?.sizeId;
  let typeId = values?.typeId;
  let parts = argsArray[0].split(/(?=[A-Z])/);
  let gridName = parts[parts.length - 1];

  console.log("container name", gridName);

  let parentCommonItem = newState[argsArray[1]].filter(
    (item) => item.sizeId === sizeId && item.typeId === typeId
  );

  let childItemQty = newState[argsArray[0]].filter(
    (item) => item.sizeId === sizeId && item.typeId === typeId
  ).length;

  let childCommonItem = newState[argsArray[0]].filter(
    (item) => item.sizeId === sizeId && item.typeId === typeId
  );

  if (values?.qty) {
    if (fieldName === "qty" && childCommonItem.length !== 0) {
      let parentCommonItemQty = parentCommonItem[0]?.qty;
      let sizeLabel =
        childCommonItem[0].sizeIdDropdown ||
        childCommonItem[0].sizeIddropdown[0].label;
      let typeLabel =
        childCommonItem[0].typeIdDropdown ||
        childCommonItem[0].typeIddropdown[0].label;

      if (values[fieldName] < childItemQty) {
        values[fieldName] = "";
        setStateVariable((prev) => ({
          ...prev,
          values: { ...prev.values, [fieldName]: "" },
        }));
        return {
          isCheck: false,
          type: "error",
          message: `For size ${sizeLabel} and type ${typeLabel}, the number of containers should not be less than the number of entries in the ${gridName} Grid.`,
          alertShow: true,
          values: values,
          newState: newState,
          formControlData: formControlData,
        };
      } else if (values[fieldName] > childItemQty) {
        return {
          isCheck: false,
          type: "error",
          message: `For size ${sizeLabel} and type ${typeLabel}, the number of containers should be equal to the number of entries in the ${gridName} grid. Kindly increase the number of entries in ${gridName} grid.`,
          alertShow: true,
          values: values,
          newState: newState,
          formControlData: formControlData,
        };
      }
      return {
        isCheck: false,
        type: "error",
        message: "",
        alertShow: false,
        values: values,
        newState: newState,
        formControlData: formControlData,
      };
    } else if (fieldName == "sizeId" || fieldName == "typeId") {
      let sizeIdDropdown = values.sizeIdDropdown;
      let typeIdDropdown = values.typeIdDropdown;

      let parentCommonItem = newState[argsArray[1]].filter(
        (item) =>
          (item.sizeIdDropdown === sizeIdDropdown ||
            (item.sizeIddropdown &&
              item.sizeIddropdown[0]?.label === sizeIdDropdown)) &&
          (item.typeIdDropdown === typeIdDropdown ||
            (item.typeIddropdown &&
              item.typeIddropdown[0]?.label === typeIdDropdown))
      );

      let childCommonItem = newState[argsArray[0]].filter(
        (item) =>
          (item.sizeIdDropdown === sizeIdDropdown ||
            (item.sizeIddropdown &&
              item.sizeIddropdown[0]?.label === sizeIdDropdown)) &&
          (item.typeIdDropdown === typeIdDropdown ||
            (item.typeIddropdown &&
              item.typeIddropdown[0]?.label === typeIdDropdown))
      );

      let currentItem = newState[argsArray[1]].filter(
        (item) => item.indexValue === values.indexValue
      );

      let size = currentItem.length
        ? currentItem[0].sizeIdDropdown ||
        currentItem[0].sizeIddropdown[0]?.label
        : "";
      let type = currentItem.length
        ? currentItem[0].typeIdDropdown ||
        currentItem[0].typeIddropdown[0]?.label
        : "";

      if (fieldName === "sizeId" && childCommonItem.length !== 0) {
        if (values.qty === childCommonItem.length) {
          let sizeIddropdown = values.sizeIddropdown[0].label;
          if (sizeIddropdown === "" || size !== sizeIddropdown) {
            values[fieldName] = "";
            setStateVariable((prev) => ({
              ...prev,
              values: { ...prev.values, [fieldName]: "" },
            }));
            return {
              isCheck: false,
              type: "error",
              message: `For type ${typeIdDropdown || type
                } and No Of Containers ${values.qty}, the size should be ${sizeIdDropdown || size
                }.`,
              alertShow: true,
              values: values,
              newState: newState,
              formControlData: formControlData,
            };
          }
          return {
            isCheck: false,
            type: "error",
            message: "",
            alertShow: false,
            values: values,
            newState: newState,
            formControlData: formControlData,
          };
        }
      } else if (fieldName === "typeId") {
        if (values.qty === childCommonItem.length) {
          let typeIddropdown = values.typeIddropdown[0].label;
          if (typeIddropdown === "" || type !== typeIddropdown) {
            values[fieldName] = "";
            setStateVariable((prev) => ({
              ...prev,
              values: { ...prev.values, [fieldName]: "" },
            }));
            return {
              isCheck: false,
              type: "error",
              message: `For size ${sizeIdDropdown || size
                } and No Of Container ${values.qty} the type should be ${typeIdDropdown || type
                } `,
              alertShow: true,
              values: values,
              newState: newState,
              formControlData: formControlData,
            };
          }
          return {
            isCheck: false,
            type: "error",
            message: "",
            alertShow: false,
            values: values,
            newState: newState,
            formControlData: formControlData,
          };
        }
      }
    } else {
      return {
        isCheck: false,
        type: "error",
        message: "",
        alertShow: false,
        values: values,
        newState: newState,
        formControlData: formControlData,
      };
    }
  } else {
    if (parentCommonItem.length === 0) {
      return {
        isCheck: false,
        type: "error",
        message: "",
        alertShow: false,
        values: values,
        newState: newState,
        formControlData: formControlData,
      };
    }
    let parentCommonItemQty = parentCommonItem[0].qty;
    let sizeLabel = values.sizeIddropdown[0]?.label || "";
    let typeLabel = values.typeIddropdown[0]?.label || "";
    if (parentCommonItemQty === childItemQty) {
      values[fieldName] = "";
      setStateVariable((prev) => ({
        ...prev,
        values: { ...prev.values, [fieldName]: "" },
      }));
      return {
        isCheck: false,
        type: "error",
        message: `For size ${sizeLabel} and type ${typeLabel}, the number of containers should be ${parentCommonItemQty}.`,
        alertShow: true,
        values: values,
        newState: newState,
        formControlData: formControlData,
      };
    }
  }
};
const calculateAndUpdateValues = (obj) => {
  const {
    args,
    values,
    fieldName,
    newState,
    formControlData,
    setStateVariable,
  } = obj;
  let argNames, operator;
  console.log("calculateAndUpdateValues", values);

  // debugger

  // Check if args is provided and not empty
  if (!args) {
    argNames = [];
    operator = "+"; // Default to addition if no operator is provided
  } else {
    let parts = args.split(",");
    operator = parts.pop().trim().toLowerCase(); // Normalize and extract the operator
    argNames = parts.map((arg) => arg.trim());
  }

  // Helper function to get the value based on whether it comes from a specific table or from the values object
  const getValue = (arg) => {
    const [tableName, field] = arg.split(".");
    if (tableName === formControlData?.tableName) {
      const value = parseFloat(newState[field]);
      if (isNaN(value)) {
        console.warn(
          `Value for ${field} in table ${tableName} is invalid or not provided, skipping.`
        );
        return null;
      }
      return value;
    } else {
      const value = parseFloat(values[arg]);
      if (isNaN(value)) {
        console.warn(`Value for ${arg} is invalid or not provided, skipping.`);
        return {
          isCheck: false,
          type: "success",
          message: "Error",
          alertShow: false,
          fieldName: fieldName,
          values: values,
          newState: newState,
          formControlData: formControlData,
        };
      }
      return value;
    }
  };

  // Fetch and parse values dynamically, filtering out undefined or invalid ones
  const params = argNames
    .slice(0, -1)
    .map((arg) => getValue(arg))
    .filter((value) => value !== null);

  if (params.length === 0) {
    console.warn("No valid values provided for calculation.");
    return;
  }

  const resultField = argNames[argNames.length - 1];
  console.log("Params before calculation:", params); // Log params before any calculations

  let result;
  let isSuccess = true; // Flag to indicate if the calculation is successful

  // Calculate based on the operator provided
  switch (operator) {
    case "add":
    case "+":
      result = params.reduce((acc, curr) => acc + curr, 0);
      break;
    case "subtract":
    case "-":
      result = params.reduce((acc, curr) => acc - curr, params.shift() || 0);
      break;
    case "multiply":
    case "*":
      result = params.reduce((acc, curr) => acc * curr, 1);
      break;
    case "divide":
    case "/":
      if (params.slice(1).some((param) => param === 0)) {
        console.warn("Division by zero encountered.");
        result = 0;
        isSuccess = false;
      } else {
        result = params.reduce((acc, curr) => acc / curr, params.shift());
      }
      break;
    case "max":
    case ">":
      result = Math.max(...params);
      break;
    case "min":
    case "<":
      result = Math.min(...params);
      break;

    default:
      console.warn("Unrecognized operator. Defaulting to addition.");
      result = params.reduce((acc, curr) => acc + curr, 0);
      break;
  }

  // Check if result is NaN and handle it
  if (isNaN(result)) {
    console.warn("Calculation resulted in NaN, setting result to 0.");
    result = 0;
    isSuccess = false;
  }

  // Update the state and log the changes
  setStateVariable((prev) => {
    const updatedState = { ...prev, [resultField]: result.toFixed(2) };
    return updatedState;
  });

  const updatedValues = {
    ...values,
    [resultField]: result.toFixed(2),
  };

  if (isSuccess) {
    return {
      isCheck: true,
      type: "success",
      message: "Calculation completed successfully",
      values: updatedValues,
      alertShow: false,
      fieldName: fieldName,
      newState: newState,
    };
  } else {
    return {
      isCheck: false,
      type: "error",
      message: "Calculation failed due to missing or invalid parameters",
      values: updatedValues,
      alertShow: false,
      fieldName: fieldName,
      newState: newState,
      formControlData: formControlData,
    };
  }
};
const emptyTargetField = (obj) => {
  let {
    args,
    newState,
    formControlData,
    setFormControlData,
    values,
    fieldName,
  } = obj;

  let argNames;
  let splitArgs = [];
  if (
    args === undefined ||
    args === null ||
    args === "" ||
    (typeof args === "object" && Object.keys(args).length === 0)
  ) {
    argNames = args;
  } else {
    argNames = args.split(",").map((arg) => arg.trim());
    for (const iterator of argNames) {
      splitArgs.push(iterator.split("."));
    }
  }

  console.log("splitArgs", splitArgs);

  // Function logic...
  const targetFieldData = (arg, formControl, values, fieldName) => {
    // Helper function to recursively check children
    const checkChildren = (children) => {
      for (const child of children) {
        if (child.tableName === arg[0][0]) {
          for (const iterator of child.fields) {
            if (iterator.fieldname === arg[1][1]) {
              iterator.controlDefaultValue = values[fieldName];
              return formControl;
            }
          }
        }
        // Check subChild if it exists
        if (
          child.subChild &&
          child.subChild.length &&
          checkChildren(child.subChild)
        ) {
          for (const iterator of child.subChild.fields) {
            if (iterator.fieldname === arg[1][1]) {
              iterator.controlDefaultValue = values[fieldName];
              return formControl;
            }
          }
        }
      }
      return formControl;
    };

    // Check top-level tableName
    if (formControl.tableName === arg[0][0]) {
      for (const iterator of formControl.fields) {
        if (iterator.fieldname === arg[1][1]) {
          console.log("iterator", iterator, arg[1][1]);
          iterator.controlDefaultValue = values[fieldName];
          return formControl;
        }
      }
    }

    // Check child array
    if (formControl.child && checkChildren(formControl.child)) {
      return formControl;
    }
  };

  // splitArgs.forEach((arg) => {
  formControlData = targetFieldData(
    splitArgs,
    formControlData,
    values,
    fieldName
  );
  // });

  let endResult = {
    type: "success",
    result: true,
    newState: newState,
    formControlData: formControlData,
    message: "OnLoad function triggered",
  };
  return endResult;
};
const onLoadFunction = (obj) => {
  let { args, newState, formControlData, setFormControlData } = obj;

  let argNames;
  let splitArgs = [];
  if (
    args === undefined ||
    args === null ||
    args === "" ||
    (typeof args === "object" && Object.keys(args).length === 0)
  ) {
    argNames = args;
  } else {
    argNames = args.split(",").map((arg) => arg.trim());
    for (const iterator of argNames) {
      splitArgs.push(iterator.split("."));
    }
  }

  // Function logic...

  const checkTableName = (arg, formControl) => {
    // Helper function to recursively check children
    const checkChildren = (children) => {
      for (const child of children) {
        if (child.tableName === arg[0]) {
          for (const iterator of child.fields) {
            if (iterator.fieldname === arg[1]) {
              iterator.controlDefaultValue = "5100";
              return formControl;
            }
          }
        }
        // Check subChild if it exists
        if (
          child.subChild &&
          child.subChild.length &&
          checkChildren(child.subChild)
        ) {
          for (const iterator of child.subChild.fields) {
            if (iterator.fieldname === arg[1]) {
              iterator.controlDefaultValue = "8500";
              return formControl;
            }
          }
        }
      }
      return formControl;
    };

    // Check top-level tableName
    if (formControl.tableName === arg[0]) {
      for (const iterator of formControl.fields) {
        if (iterator.fieldname === arg[1]) {
          iterator.controlDefaultValue = "58654";
          return formControl;
        }
      }
    }

    // Check child array
    if (formControl.child && checkChildren(formControl.child)) {
      return formControl;
    }
  };

  splitArgs.forEach((arg) => {
    formControlData = checkTableName(arg, formControlData);
  });

  let endResult = {
    type: "success",
    result: true,
    newState: newState,
    formControlData: formControlData,
    message: "OnLoad function triggered",
  };
  return endResult;
};
const setStateCodeAndPanNumber = async (obj) => {
  const {
    args,
    fieldName,
    values,
    newState,
    formControlData,
    setStateVariable,
  } = obj;
  const argNames = args.split(",").map((arg) => arg.trim());

  let [
    originCol,
    onfilterkey,
    onfiltervalue,
    referenceTable,
    referenceColumn,
    stateId,
    gstinNo,
  ] = argNames;
  const state = values[stateId];
  const stateIdValue =
    state !== null && Object.keys(state).length === 4 ? state.oldId : state;
  const dropdownFilter = `and id=${stateIdValue
    .toString()
    .replace(/['"]+/g, "")}`;
  //const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6NCwidXNlck5hbWUiOiJyb2hpdEBnbWFpbC5jb20iLCJpYXQiOjE3MTU1OTk2ODExMzYsIm51bWJlckZvcm1hdCI6bnVsbCwiY2xpZW50Q29kZSI6Ik5DTFAiLCJleHAiOjE3MTU2MDY4ODExMzZ9.5fFdjl01-azSJcgCZZCfo8d82hGsOn8VjMligtl4cLo'; // Replace with your actual token
  //const token = localStorage.getItem("token");

  const requestBody = {
    onfilterkey: `${onfilterkey}`,
    onfiltervalue: parseInt(onfiltervalue),
    referenceTable: `${referenceTable}`,
    referenceColumn: `${referenceColumn}`,
    dropdownFilter: `${dropdownFilter}`,
    search: null,
    pageNo: 1,
    value: null,
  };

  try {
    const response = await dynamicDropDownFieldsData(requestBody);

    const responseData = await response;
    console.log("Response Data:", responseData);

    const namesAndIds = responseData.data.map((item) => ({
      name: item.label,
      value: item.value,
    }));

    console.log("Names and IDs:", namesAndIds);
    const stateName =
      namesAndIds.length > 0 ? namesAndIds[0].name.slice(0, 2) : null;
    const panNumber = values[originCol];
    values[gstinNo] = "";
    // Check if both state code and PAN number are not null before setting GST number
    if (stateName !== null && panNumber !== null) {
      const stateAndPan = stateName + panNumber;
      values[gstinNo] = stateAndPan;

      const updatedValues = {
        ...values,
        [gstinNo]: stateAndPan,
      };
      setStateVariable((prev) => ({
        ...prev,
        [gstinNo]: stateAndPan,
      }));
      let endResult = {
        type: "success",
        result: true,
        newState: {
          ...newState,
          [gstinNo]: stateAndPan,
        },
        values: updatedValues,
        message: "Country phone code updated, and state/city fields cleared.",
      };
      return endResult;
    } else {
      // If either state code or PAN number is null, do not set GST number
      return {
        isCheck: false,
        type: "error",
        message: "Error fetching data",
        values: values,
        newState: newState,
        fieldName: fieldName,
        formControlData: formControlData,
      };
    }
  } catch (error) {
    console.error("Error fetching state code:", error);
    return {
      isCheck: false,
      type: "error",
      message: "Error fetching state code",
      values: values,
      newState: newState,
      fieldName: fieldName,
      formControlData: formControlData,
    };
  }
};
const validateGST = async (obj) => {
  const {
    args,
    fieldName,
    values,
    newState,
    setStateVariable,
    formControlData,
  } = obj;
  const argNames = args.split(",").map((arg) => arg.trim());
  let [originCol] = argNames; // Added gstinNoFieldName
  const gstinNo = values[originCol];

  const gstPattern =
    /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[0-9]{1}[A-Z]{1}[0-9A-Z]{1}$/;

  // Check if the GST number matches the pattern
  if (gstinNo.match(gstPattern)) {
    // GST number is valid
    return {
      isCheck: false,
      type: "error",
      message: "valid GST number",
      alertShow: false,
      values: values,
      newState: newState,
      fieldName: fieldName,
      formControlData: formControlData,
    };
  } else {
    const updatedValues = {
      ...values,
      [originCol]: null,
    };

    // Update the state variable with the cleared GST value
    setStateVariable((prev) => ({
      ...prev,
      [originCol]: null,
    }));

    // Return structured error message
    return {
      values: updatedValues,
      isCheck: false,
      type: "error",
      message: "Invalid GST number. Please enter a valid GST number.",
      alertShow: true,
      newState: newState,
      fieldName: fieldName,
      formControlData: formControlData,
    };
  }
};

const setExchangeRate = async (obj) => {
  const { args, fieldName, values, newState, formControlData } = obj;
  const argNames = args.split(",").map((arg) => arg.trim());
  let [originCol, tableName, sellexchangeRate] = argNames;

  const sellCurrencyId = values[originCol];

  const whereCondition = {
    fromCurrencyId: sellCurrencyId.toString().replace(/['"]+/g, ""),
    status: 1,
  };
  const requestBody = {
    tableName: tableName,
    whereCondition: whereCondition,
  };
  const companyRequestBody = {
    tableName: "tblCompanyParameter",
  };

  let companyResponseData;

  try {
    const token = localStorage.getItem("token");
    console.log("Sending request to fetch company parameters...");
    const companyResponse = await fetch(
      `${baseUrl}/api/validations/formControlValidation/fetchData`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-access-token": JSON.parse(token),
        },
        body: JSON.stringify(companyRequestBody),
      }
    );

    if (!companyResponse.ok) {
      throw new Error(
        `Error fetching company parameters: ${companyResponse.statusText}`
      );
    }

    companyResponseData = await companyResponse.json();
    console.log("Company Response Data:", companyResponseData);
  } catch (error) {
    console.error("Error fetching company parameters:", error);
    return {
      isCheck: false,
      type: "error",
      message: "Error fetching company parameters",
      alertShow: true,
      values: values,
      newState: newState,
      fieldName: fieldName,
      formControlData: formControlData,
    };
  }

  try {
    console.log("Sending request to fetch exchange rates...");
    const response = await fetch(
      `${baseUrl}/api/validations/formControlValidation/fetchData`,
      {
        method: "POST",
        headers: {
          "x-access-token": token,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      }
    );

    if (!response.ok) {
      throw new Error(`Error fetching exchange rates: ${response.statusText}`);
    }

    const responseData = await response.json();
    console.log("Response Data:", responseData);

    const fromCurrencyId =
      responseData.data.length > 0 ? responseData.data[0].fromCurrencyId : null;
    const exportExchangeRate =
      responseData.data.length > 0
        ? responseData.data[0].exportExchangeRate
        : null;
    const companyCurrencyId =
      companyResponseData.data.length > 0
        ? companyResponseData.data[0].currencyId
        : null;

    console.log("From Currency ID:", fromCurrencyId);
    console.log("Company Currency ID:", companyCurrencyId);

    // Now use these variables for further logic
    if (fromCurrencyId && companyCurrencyId) {
      if (fromCurrencyId === companyCurrencyId) {
        values[sellexchangeRate] = 1; // Set sell rate to 1 if currency IDs match
        return {
          isCheck: true,
          type: "success",
          message: "Exchange rate set to 1 due to matching currency IDs",
          alertShow: true,
          values: values,
          newState: newState,
          fieldName: fieldName,
          formControlData: formControlData,
        };
      } else {
        values[sellexchangeRate] = exportExchangeRate; // Set sell rate to export exchange rate if currency IDs don't match
        return {
          isCheck: true,
          type: "success",
          message: `Exchange rate set to ${exportExchangeRate} due to non-matching currency IDs`,
          alertShow: true,
          values: values,
          newState: newState,
          fieldName: fieldName,
          formControlData: formControlData,
        };
      }
    } else {
      return {
        isCheck: false,
        type: "error",
        message: "No matching currency ID found",
        alertShow: true,
        values: values,
        newState: newState,
        fieldName: fieldName,
        formControlData: formControlData,
      };
    }
  } catch (error) {
    console.error("Error fetching exchange rates:", error);
    return {
      isCheck: false,
      type: "error",
      message: "Error fetching exchange rates",
      alertShow: true,
      newState: newState,
      fieldName: fieldName,
      values: values,
      newState: newState,
      formControlData: formControlData,
    };
  }
};

const validateNegativeValue = async (obj) => {
  const {
    args,
    values,
    fieldName,
    formControlData,
    newState,
    setStateVariable,
  } = obj;

  // Handle optional arguments like in negativeWarning
  let argNames;
  if (!args || (typeof args === "object" && Object.keys(args).length === 0)) {
    argNames = args;
  } else {
    argNames = args.split(",").map((arg) => arg.trim());
  }

  const popupType = argNames?.[argNames.length - 1]?.toLowerCase();
  let popup = "error";
  if (popupType === "w") {
    popup = "warning";
  }

  const field = formControlData?.fields?.find((f) => f.fieldname === fieldName);
  const yourlabel = field ? field.yourlabel : fieldName;

  const fieldValue = newState[fieldName] ?? values[fieldName];

  // Ensure valid number before proceeding
  if (fieldValue !== "" && !isNaN(fieldValue) && fieldValue !== null) {
    const CntrlValue = Number(fieldValue);

    if (CntrlValue < 0) {
      if (popup === "warning") {
        return {
          isCheck: false,
          type: "warning",
          message: `${yourlabel} is negative. Are you sure you want to continue?`,
          alertShow: true,
          fieldName,
          values,
          newState,
          formControlData,
        };
      } else {
        // Error case: Reset field and update state
        if (newState[fieldName] !== "" || values[fieldName] !== "") {
          const updatedValues = { ...values, [fieldName]: "" };

          setStateVariable((prev) => ({
            ...prev,
            [fieldName]: "",
          }));

          return {
            values: updatedValues,
            isCheck: false,
            type: "error",
            message: "Value cannot be negative.",
            alertShow: true,
            fieldName,
            newState,
            formControlData,
          };
        }
      }
    }
  } else if (fieldValue !== "" && isNaN(fieldValue)) {
    // Invalid input: Reset field and update state
    const updatedValues = { ...values, [fieldName]: "" };

    setStateVariable((prev) => ({
      ...prev,
      [fieldName]: "",
    }));

    return {
      values: updatedValues,
      isCheck: false,
      type: "error",
      message:
        "Please enter a valid number. No special characters or alphabets allowed.",
      alertShow: true,
      fieldName,
      newState,
      formControlData,
    };
  }

  // Default return if no issues are found
  return {
    isCheck: true,
    message: "",
    alertShow: false,
    fieldName,
    values,
    newState,
    formControlData,
  };
};
const setTaxDetails = async (obj) => {
  let {
    args,
    newState,
    formControlData,
    setFormControlData,
    values,
    fieldName,
    tableName,
    setStateVariable,
    onChangeHandler,
  } = obj;

  const { companyId, clientId, branchId, userId, financialYear } =
    getUserDetails();

  let argNames;
  let splitArgs = [];
  if (
    args === undefined ||
    args === null ||
    args === "" ||
    (typeof args === "object" && Object.keys(args).length === 0)
  ) {
    argNames = args;
  } else {
    argNames = args.split(",").map((arg) => arg.trim());
    for (const iterator of argNames) {
      splitArgs.push(iterator.split("."));
    }
  }
  const {
    invoiceDate,
    businessSegmentId,
    placeOfSupplyStateId,
    sez,
    billingPartyId,
    ownStateId,
    taxType,
    billingPartyBranchId,
    billingPartyStateId,
    totalInvoiceAmountFc,
  } = newState;
  const { chargeId, chargeGlId, SelectedParentInvId } = values;
  const requestData = {
    chargeId: chargeId,
    invoiceDate: moment(invoiceDate).format("YYYY-MM-DD"),
    departmentId: businessSegmentId,
    glId: chargeGlId,
    placeOfSupply_state: placeOfSupplyStateId,
    SelectedParentInvId: SelectedParentInvId || null,
    sez: sez,
    customerId: billingPartyId,
    ownStateId: ownStateId,
    formControlId: newState.menuID,
    totalAmount: values.totalAmount,
    totalAmountFc: values.totalAmountFc,
    sacCodeId: values.sacId,
    totalAmountHc: values?.totalAmountHc || values?.totalAmount,
    taxType: taxType || "G",
    companyId: companyId,
    branchId: branchId,
    finYearId: financialYear,
    userId: userId,
    clientId: clientId,
    totalAmtInvoiceCurr: totalInvoiceAmountFc,
    billingPartyBranch: billingPartyBranchId,
    billingPartyState: billingPartyStateId,
  };
  console.log("RequestData", requestData);

  const fetchTaxDetails = await getTaxDetails(requestData);
  if (fetchTaxDetails) {
    const { tblTax } = fetchTaxDetails;
    values.tblInvoiceChargeTax = tblTax;
    setStateVariable((prev) => {
      const tempData = { ...prev };
      tempData.tblInvoiceChargeTax = tblTax;
      return tempData;
    });
  }
};
const setTDSDetails = async (obj) => {
  let {
    args,
    newState,
    formControlData,
    setFormControlData,
    values,
    fieldName,
    tableName,
    setStateVariable,
  } = obj;

  let argNames;
  let splitArgs = [];
  if (
    args === undefined ||
    args === null ||
    args === "" ||
    (typeof args === "object" && Object.keys(args).length === 0)
  ) {
    argNames = args;
  } else {
    argNames = args.split(",").map((arg) => arg.trim());
    for (const iterator of argNames) {
      splitArgs.push(iterator.split("."));
    }
  }
  const {
    invoiceDate,
    businessSegmentId,
    placeOfSupplyStateId,
    sez,
    billingPartyId,
    ownStateId,
  } = newState;
  const { chargeId, chargeGlId, SelectedParentInvId } = values;

  const requestData = {
    // "chargeId": chargeId,
    invoiceDate: moment(invoiceDate).format("YYYY-MM-DD"),
    //"departmentId": departmentId,
    glId: chargeGlId,
    partyId: billingPartyId,
    formControlId: newState.menuID,
    totalAmount: values.totalAmount,
    exchangeRateGrid: values.exchangeRate,
  };

  const fetchTDSDetails = await getTDSDetails(requestData);
  if (fetchTDSDetails) {
    const { data } = fetchTDSDetails;
    // console.log("tblTax", tblTax);
    // values.tblInvoiceChargeTax = tblTax;
    setStateVariable((prev) => {
      const tempData = { ...prev };
      tempData.tblInvoiceChargeTds = data;
      return tempData;
    });
  }

  let endResult = {
    type: "success",
    result: true,
    newState: newState,
    formControlData: formControlData,
    message: "OnLoad function triggered",
  };
  return endResult;
};
// const getJobCharges = async (obj) => {
//   let {
//     args,
//     newState,
//     formControlData,
//     setFormControlData,
//     values,
//     fieldName,
//     tableName,
//     setStateVariable,
//   } = obj;
//   console.log("newState", obj);

//   let argNames;
//   let splitArgs = [];
//   if (
//     args === undefined ||
//     args === null ||
//     args === "" ||
//     (typeof args === "object" && Object.keys(args).length === 0)
//   ) {
//     argNames = args;
//   } else {
//     argNames = args.split(",").map((arg) => arg.trim());
//     for (const iterator of argNames) {
//       splitArgs.push(iterator.split("."));
//     }
//   }

//   const {
//     invoiceDate,
//     businessSegmentId,
//     placeOfSupplyStateId,
//     sez,
//     billingPartyId,
//     ownStateId,
//     jobId,
//   } = values;

//   const {
//     taxType,
//     billingPartyBranchId,
//     billingPartyStateId,
//     totalInvoiceAmountFc,
//   } = newState;

//   const { companyId, clientId, branchId, financialYear, userId } =
//     getUserDetails();

//   console.log("values", values);

//   const requestData = {
//     clientId: clientId,
//     voucherType: newState?.voucherTypeId,//"E_F_BL",
//     DepartmentId: newState?.businessSegmentId || businessSegmentId || 0,
//     jobIds: newState?.jobId || jobId || 0,
//     billingPartyId: newState?.billingPartyId || billingPartyId || 0,
//     companyId: companyId,
//     companyBranchId: branchId,
//   };

//   const fetchTaxDetails = await getJobChargeDetails(requestData);

//   if (fetchTaxDetails) {
//     console.log(fetchTaxDetails);
//     const { Chargers } = fetchTaxDetails;

//     for (let index = 0; index < (Chargers?.length || 0); index++) {
//       Chargers[index].idx = index;
//       Chargers[index].index = index;
//       Chargers[index].indexValue = index;

//       const chargeValues = Chargers[index];

//       // ✅ Fix: Default all numeric fields to 0 to avoid NaN
//       const safeTotalAmount = Number(chargeValues.totalAmount) || 0;
//       const safeTotalAmountFc = Number(chargeValues.totalAmountFc) || 0;
//       const safeChargeGlId = chargeValues.chargeGlId || 0;
//       const safeSacId = chargeValues.sacId || 0;

//       const requestData = {
//         chargeId: chargeValues.chargeId || 0,
//         invoiceDate: invoiceDate
//           ? moment(invoiceDate).format("YYYY-MM-DD")
//           : null,
//         departmentId: businessSegmentId || 0,
//         glId: safeChargeGlId,
//         placeOfSupply_state: placeOfSupplyStateId || 0,
//         SelectedParentInvId: null,
//         sez: sez || false,
//         customerId: billingPartyId || 0,
//         ownStateId: ownStateId || 0,
//         formControlId: newState?.menuID || 0,
//         totalAmount: safeTotalAmount,
//         totalAmountFc: safeTotalAmountFc,
//         sacCodeId: safeSacId,
//         totalAmountHc: safeTotalAmount,
//         taxType: taxType || "G",
//         companyId: companyId,
//         branchId: branchId,
//         finYearId: financialYear,
//         userId: userId,
//         clientId: clientId,
//         totalAmtInvoiceCurr: Number(totalInvoiceAmountFc) || 0,
//         billingPartyBranch: billingPartyBranchId || 0,
//         billingPartyState: billingPartyStateId || 0,
//       };

//       let fetchGST = await getTaxDetails(requestData);

//       if (fetchGST) {
//         const { tblTax } = fetchGST;
//         Chargers[index].tblInvoiceChargeTax =
//           tblTax || chargeValues.tblInvoiceChargeTax || [];
//       }
//     }
//     // ✅ Fix: Always set array safely
//     values.tblInvoiceCharge = Array.isArray(Chargers) ? Chargers : [];

//     setStateVariable((prev) => {
//       return { ...prev, ...values };
//     });
//   }
// };

// const getBlCharges = async (obj) => {
//   let {
//     args,
//     newState,
//     formControlData,
//     setFormControlData,
//     values,
//     fieldName,
//     tableName,
//     setStateVariable,
//   } = obj;
//   console.log("newState", obj);
//   let argNames;
//   let splitArgs = [];
//   if (
//     args === undefined ||
//     args === null ||
//     args === "" ||
//     (typeof args === "object" && Object.keys(args).length === 0)
//   ) {
//     argNames = args;
//   } else {
//     argNames = args.split(",").map((arg) => arg.trim());
//     for (const iterator of argNames) {
//       splitArgs.push(iterator.split("."));
//     }
//   }
//   const {
//     invoiceDate,
//     businessSegmentId,
//     placeOfSupplyStateId,
//     sez,
//     billingPartyId,
//     ownStateId,
//     blId,
//   } = values;
//   // const { chargeId, chargeGlId, SelectedParentInvId } = values;
//   const { companyId, clientId, branchId } = getUserDetails();

//   console.log("values", values);

//   // const requestData = {
//   //   clientId: clientId,
//   //   voucherType: "E_F_BL",
//   //   DepartmentId: 1,
//   //   jobIds: 137,
//   //   billingPartyId: 10,
//   //   companyId: 1,
//   //   companyBranchId: 1,
//   // };

//   const requestData = {
//     clientId: clientId,
//     voucherType: newState?.voucherTypeId,
//     DepartmentId: newState?.businessSegmentId,
//     jobIds: newState?.jobId,
//     blIds: newState?.blId || values?.blId,
//     billingPartyId: newState?.billingPartyId,
//     companyId: companyId,
//     companyBranchId: branchId,
//   };

//   const fetchTaxDetails = await getBlChargeDetails(requestData);
//   if (fetchTaxDetails) {
//     console.log(fetchTaxDetails);
//     const { Chargers } = fetchTaxDetails;
//     for (let index = 0; index < Chargers?.length; index++) {
//       Chargers[index].idx = index;
//       Chargers[index].index = index;
//       Chargers[index].indexValue = index;
//     }
//     console.log(Chargers);
//     // if (Chargers.length == 0) {
//     //   return
//     // }
//     values.tblInvoiceCharge = Array.isArray(Chargers) ? Chargers : [];
//     // newState.tblInvoiceCharge = Chargers
//     // values.tblInvoiceChargeTds = data;
//     setStateVariable((prev) => {
//       return { ...prev, ...values };
//     });
//   }
//   // newState = values;
//   // let endResult = {
//   //   type: "success",
//   //   result: true,
//   //   newState: newState,
//   //   values: values,
//   //   formControlData: formControlData,
//   //   message: "OnLoad function triggered",
//   // };
//   // return endResult;
// };

const getJobCharges = async (obj) => {
  let {
    args,
    newState,
    formControlData,
    setFormControlData,
    values,
    fieldName,
    tableName,
    setStateVariable,
  } = obj;
  console.log("newState", obj);

  let argNames;
  let splitArgs = [];
  if (
    args === undefined ||
    args === null ||
    args === "" ||
    (typeof args === "object" && Object.keys(args).length === 0)
  ) {
    argNames = args;
  } else {
    argNames = args.split(",").map((arg) => arg.trim());
    for (const iterator of argNames) {
      splitArgs.push(iterator.split("."));
    }
  }

  const {
    invoiceDate,
    businessSegmentId,
    placeOfSupplyStateId,
    sez,
    billingPartyId,
    ownStateId,
    jobId,
  } = values;

  const {
    taxType,
    billingPartyBranchId,
    billingPartyStateId,
    totalInvoiceAmountFc,
  } = newState;

  const { companyId, clientId, branchId, financialYear, userId } =
    getUserDetails();

  console.log("values", values);

  const requestData = {
    clientId: clientId,
    voucherType: newState?.voucherTypeId, // "E_F_BL",
    DepartmentId: newState?.businessSegmentId || businessSegmentId || 0,
    jobIds: newState?.jobId || jobId || 0,
    billingPartyId: newState?.billingPartyId || billingPartyId || 0,
    companyId: companyId,
    companyBranchId: branchId,
  };

  const fetchTaxDetails = await getJobChargeDetails(requestData);

  if (fetchTaxDetails) {
    console.log(fetchTaxDetails);
    const { Chargers } = fetchTaxDetails;

    for (let index = 0; index < (Chargers?.length || 0); index++) {
      Chargers[index].idx = index;
      Chargers[index].index = index;
      Chargers[index].indexValue = index;

      const chargeValues = Chargers[index];

      // default numeric fields
      const safeTotalAmount = Number(chargeValues.totalAmount) || 0;
      const safeTotalAmountFc = Number(chargeValues.totalAmountFc) || 0;
      const safeChargeGlId = chargeValues.chargeGlId || 0;
      const safeSacId = chargeValues.sacId || 0;

      const taxReq = {
        chargeId: chargeValues.chargeId || 0,
        invoiceDate: invoiceDate
          ? moment(invoiceDate).format("YYYY-MM-DD")
          : null,
        departmentId: businessSegmentId || 0,
        glId: safeChargeGlId,
        placeOfSupply_state: placeOfSupplyStateId || 0,
        SelectedParentInvId: null,
        sez: sez || false,
        customerId: newState?.billingPartyId || billingPartyId || 0,
        ownStateId: ownStateId || 0,
        formControlId: newState?.menuID || 0,
        totalAmount: safeTotalAmount,
        totalAmountFc: safeTotalAmountFc,
        sacCodeId: safeSacId,
        totalAmountHc: safeTotalAmount,
        taxType: taxType || "G",
        companyId: companyId,
        branchId: branchId,
        finYearId: financialYear,
        userId: userId,
        clientId: clientId,
        totalAmtInvoiceCurr: Number(totalInvoiceAmountFc) || 0,
        billingPartyBranch: billingPartyBranchId || 0,
        billingPartyState: billingPartyStateId || 0,
      };

      let fetchGST = await getTaxDetails(taxReq);

      if (fetchGST) {
        const { tblTax } = fetchGST;
        Chargers[index].tblInvoiceChargeTax =
          tblTax || chargeValues.tblInvoiceChargeTax || [];
      }
    }

    const updatedCharges = Array.isArray(Chargers) ? Chargers : [];

    // ✅ Only update tblInvoiceCharge; do NOT spread all `values` (which may have stale billingPartyId)
    setStateVariable((prev) => ({
      ...prev,
      tblInvoiceCharge: updatedCharges,
    }));
  }
};

const validateContainerNo = (obj) => {
  const {
    args,
    values,
    fieldName,
    newState,
    formControlData,
    setStateVariable,
  } = obj;
  const argNames = args.split(",").map((arg) => arg.trim());
  const containerNo = values[argNames[0]];

  // Define the alphabet mapping and numerical values
  const alphabetMapping = [
    [
      "A",
      "10",
      "B",
      "12",
      "C",
      "13",
      "D",
      "14",
      "E",
      "15",
      "F",
      "16",
      "G",
      "17",
      "H",
      "18",
      "I",
      "19",
      "J",
      "20",
      "K",
      "21",
      "L",
      "23",
      "M",
      "24",
    ],
    [
      "N",
      "25",
      "O",
      "26",
      "P",
      "27",
      "Q",
      "28",
      "R",
      "29",
      "S",
      "30",
      "T",
      "31",
      "U",
      "32",
      "V",
      "34",
      "W",
      "35",
      "X",
      "36",
      "Y",
      "37",
      "Z",
      "38",
    ],
  ];
  const numericalValues = [1, 2, 4, 8, 16, 32, 64, 128, 256, 512];

  try {
    // Validate the container number
    let actualSum = 0;
    for (let i = 1; i <= containerNo.length - 7; i++) {
      const char = containerNo.charAt(i - 1);
      for (let j = 1; j <= 2; j++) {
        for (let k = 1; k <= 26; k++) {
          const index = alphabetMapping[j - 1][k - 1].indexOf(char);
          if (index === 0) {
            const value = parseInt(alphabetMapping[j - 1][k], 10);
            actualSum += value * numericalValues[i - 1];
          }
        }
      }
    }

    let actualValue = 0;
    for (let i = 5; i <= containerNo.length - 1; i++) {
      const char = containerNo.charAt(i - 1);
      const multipliedValue = parseInt(char, 10) * numericalValues[i - 1];
      actualValue += multipliedValue;
    }

    actualValue += actualSum;
    let containerCheckDigit = parseInt(actualValue % 11, 10);
    if (containerCheckDigit === 10) {
      containerCheckDigit = 0;
    }

    const actualCheckDigit = parseInt(containerNo.slice(-1), 10);
    const isValid = actualCheckDigit === containerCheckDigit;

    // Define the alert message based on validity
    if (isValid == false) {
      // alert("container no is not valid");
      values[argNames[0]] = null;

      setStateVariable((prev) => ({
        ...prev,
        [argNames[0]]: null,
      }));
      return {
        isCheck: false,
        type: "error",
        message: `container no is not valid`,
        alertShow: true,
        values: values,
        newState: newState,
        fieldName: fieldName,
        formControlData: formControlData,
      };
    }
    return {
      isCheck: false,
      type: "error",
      message: `container no is not valid`,
      alertShow: false,
      values: values,
      newState: newState,
      formControlData: formControlData,
    };
  } catch (ex) {
    return {
      isCheck: false,
      type: "error",
      message: `container no is not valid`,
      alertShow: true,
      values: values,
      newState: newState,
      formControlData: formControlData,
    };
  }
};
const validateTemperatureValue = (obj) => {
  const {
    args,
    values,
    fieldName,
    formControlData,
    newState,
    setStateVariable,
  } = obj;

  let argNames = [];
  if (args && typeof args === "string") {
    argNames = args.split(",").map((arg) => arg.trim());
  }

  const toastTypeArg = argNames[argNames.length - 1]?.toLowerCase();
  let messageType = "error";
  if (toastTypeArg === "w") {
    messageType = "warning";
  }

  const fieldValue = values[fieldName] !== undefined ? values[fieldName] : "0";

  if (fieldValue !== "" && !isNaN(fieldValue) && Number(fieldValue)) {
    const temperatureValue = Number(fieldValue);

    if (temperatureValue < -25 || temperatureValue > 25) {
      const updatedValues = {
        ...values,
        [fieldName]: "",
      };

      setStateVariable((prev) => ({
        ...prev,
        [fieldName]: "",
      }));

      return {
        values: updatedValues,
        isCheck: false,
        type: "error",
        message: "Refer temperature should be between -25 and 25 degrees.",
        alertShow: true,
        fieldName: fieldName,
        newState: newState,
        formControlData: formControlData,
      };
    }
  } else if (fieldValue !== "0" && fieldValue !== "") {
    const updatedValues = {
      ...values,
      [fieldName]: "",
    };

    setStateVariable((prev) => ({
      ...prev,
      [fieldName]: "",
    }));

    return {
      isCheck: false,
      type: messageType,
      message:
        "Please enter a valid number. No special characters or alphabets allowed.",
      alertShow: true,
      fieldName: fieldName,
      values: updatedValues,
      newState: newState,
      formControlData: formControlData,
    };
  }

  return {
    values: updatedValues,
    type: messageType,
    message: "Return",
    alertShow: false,
    fieldName: fieldName,
    isCheck: false,
    newState: newState,
    formControlData: formControlData,
  };
};
const checkMatchingCountries = async (obj) => {
  const {
    args,
    values,
    fieldName,
    newState,
    formControlData,
    setStateVariable,
  } = obj;

  let argNames;
  if (!args || (typeof args === "object" && Object.keys(args).length === 0)) {
    argNames = [];
  } else {
    argNames = args.split(",").map((arg) => arg.trim());
  }

  const field1 = argNames[0];
  const field2 = argNames[1];
  const tableName = argNames[2];

  const popupTypeArg = argNames[argNames.length - 1]?.toLowerCase();
  let popup = "warning";
  if (popupTypeArg === "e") {
    popup = "error";
  } else if (popupTypeArg === "w") {
    popup = "warning";
  }

  const field1Label =
    formControlData.fields.find((f) => f.fieldname === field1)?.yourlabel ||
    field1;
  const field2Label =
    formControlData.fields.find((f) => f.fieldname === field2)?.yourlabel ||
    field2;

  let dropdownValue;
  const param1 = values[field1];
  const param2 = values[field2];

  if (param1 && param1.hasOwnProperty("value")) {
    dropdownValue = param1.value;
  } else {
    dropdownValue = param1;
  }

  const storedUserData = localStorage.getItem("userData");
  const decryptedData = decrypt(storedUserData);
  const userData = JSON.parse(decryptedData);
  const clientCode = userData[0].clientCode;

  const requestData = {
    columns: "countryId",
    tableName: tableName,
    whereCondition: `id = ${param1}`,
    clientIdCondition: `status = 1 FOR JSON PATH`,
  };

  const fetchCountryId = await fetchReportData(requestData);
  const fetchedCountryId = fetchCountryId?.data[0]?.countryId;

  if (parseInt(param2) === fetchedCountryId) {
    // Matching condition
    return {
      values: values,
      isCheck: true,
      type: "success",
      message: `${field1Label} country matches ${field2Label} country.`,
      alertShow: true,
      fieldName: fieldName,
      newState: newState,
      formControlData: formControlData,
    };
  } else {
    const fieldsToCheck = [field1].map((key) => `${key}dropdown`);

    fieldsToCheck.forEach((field) => {
      if (newState.hasOwnProperty(field)) {
        if (Array.isArray(newState[field])) {
          newState[field].forEach((item) => {
            if (
              item &&
              typeof item === "object" &&
              item.hasOwnProperty("label")
            ) {
              // Set the label to null
              item.label = null;
            }
          });
        } else {
          // If the field is not an array, set it to null
          newState[field] = null;
        }
      }
    });
    console.log("not matches");

    if (popup === "error") {
      setStateVariable((prev) => ({
        ...prev,
        [field1]: null,
      }));
      return {
        values: values,
        isCheck: false,
        type: "error",
        message: `${field1Label} country should match ${field2Label}. Value reset.`,
        alertShow: true,
        fieldName: fieldName,
        newState: newState,
        formControlData: formControlData,
      };
    } else if (popup === "warning") {
      return {
        values: values,
        isCheck: false,
        type: "warning",
        message: `${field1Label} country should match ${field2Label}. Please review.`,
        alertShow: true,
        fieldName: fieldName,
        newState: newState,
        formControlData: formControlData,
      };
    }
  }
};
const checkDifferentCountries = async (obj) => {
  const {
    args,
    values,
    fieldName,
    formControlData,
    newState,
    setStateVariable,
  } = obj;

  let argNames;
  if (!args || (typeof args === "object" && Object.keys(args).length === 0)) {
    argNames = args;
  } else {
    argNames = args.split(",").map((arg) => arg.trim());
  }

  const field1 = argNames[0];
  const field2 = argNames[1];

  const toastTypeArg = argNames[argNames.length - 1]?.toLowerCase();
  let messageType = "error";
  if (toastTypeArg === "w") {
    messageType = "warning";
  }
  if (!values) {
    console.error("values object is undefined");
    return;
  }
  const param1 = values[field1];
  const param2 = values[field2];

  const field1Label =
    formControlData.fields.find((f) => f.fieldname === param1)?.yourlabel ||
    param1;
  const field2Label =
    formControlData.fields.find((f) => f.fieldname === param1)?.yourlabel ||
    param1;

  // Check if both fields have values
  if (!param1 || !param2) {
    return {
      isCheck: true,
      type: "success",
      message: "Prepared By Field Updated!",
      values: values,
      alertShow: true,
      fieldName: fieldName,
      newState: newState,
      formControlData: formControlData,
    };
  }

  let dropdownValue1, dropdownValue2;
  if (param1 && param1.hasOwnProperty("value")) {
    dropdownValue1 = param1.value;
  } else {
    dropdownValue1 = param1;
  }

  if (param2 && param2.hasOwnProperty("value")) {
    dropdownValue2 = param2.value;
  } else {
    dropdownValue2 = param2;
  }
  console.log(param1, param2);

  const storedUserData = localStorage.getItem("userData");
  const decryptedData = decrypt(storedUserData);
  const userData = JSON.parse(decryptedData);
  const clientCode = userData[0].clientCode;

  // Prepare request data
  const requestData1 = {
    tableName: "tblCompany",
    whereCondition: {
      status: 1,
      clientCode: clientCode,
      _id: dropdownValue1,
    },
    projection: {
      countryId: 1,
    },
  };

  const requestData2 = {
    tableName: "tblCompany",
    whereCondition: {
      status: 1,
      clientCode: clientCode,
      _id: dropdownValue2,
    },
    projection: {
      countryId: 1,
    },
  };

  // Fetch country IDs
  const fetchCountryId1 = await fetchDataAPI(requestData1);
  const fetchedCountryId1 = fetchCountryId1.data[0].countryId;

  const fetchCountryId2 = await fetchDataAPI(requestData2);
  const fetchedCountryId2 = fetchCountryId2.data[0].countryId;

  // Compare country IDs
  if (fetchedCountryId1 !== fetchedCountryId2) {
    // Countries are different
    return {
      isCheck: false,
      type: "error",
      values: values,
      message: `${field1Label} country and ${field2Label} country are different.`,
      alertShow: true,
      fieldName: fieldName,
      newState: newState,
      formControlData: formControlData,
    };
  } else {
    // Countries should be different
    return {
      isCheck: false,
      type: messageType,
      values: values,
      message: `${field1Label} country and ${field2Label} country should be different.`,
      alertShow: true,
      fieldName: fieldName,
      newState: newState,
      formControlData: formControlData,
    };
  }
};
const removeFilterCondition = (obj) => {
  let { args, newState, formControlData, fieldName, values, setStateVariable } =
    obj;
  let argNames = args.split(",");
  let param = values[argNames[0]];

  // Ensure formControlData and formControlData.fields exist
  if (!formControlData || !formControlData.fields) {
    return {
      isCheck: false,
      type: "error",
      values: values,
      message: "formControlData or its fields are undefined.",
      alertShow: true,
      fieldName: fieldName,
      newState: newState,
      formControlData: formControlData,
    };
  }

  // Find the target field in formControlData
  let targetField = formControlData.fields.find(
    (field) => field.fieldname === fieldName
  );

  if (targetField) {
    // Clear the dropdown filter
    targetField.dropdownFilter = null;

    // Update the state, ensuring prev.formControlData and fields are defined
    setStateVariable((prev) => ({
      ...prev,
      formControlData: {
        ...prev.formControlData,
        fields: prev.formControlData?.fields
          ? prev.formControlData.fields.map((field) =>
            field.fieldname === fieldName
              ? { ...field, dropdownFilter: null }
              : field
          )
          : [],
      },
    }));

    // Return success message
    return {
      isCheck: true,
      type: "success",
      values: values,
      message: `Dropdown filter for field ${fieldName} removed successfully.`,
      alertShow: true,
      fieldName: fieldName,
      newState: newState,
      formControlData: formControlData,
    };
  } else {
    // Return error message if field is not found
    return {
      isCheck: false,
      type: "error",
      values: values,
      message: `Field with fieldname ${fieldName} not found.`,
      alertShow: true,
      fieldName: fieldName,
      newState: newState,
      formControlData: formControlData,
    };
  }
};
const validateTotalGrossWeight = (obj) => {
  const { args, values, newState, setStateVariable } = obj;
  const argNames = args.split(",").map((arg) => arg.trim());

  const cargoGrossWeight = values[argNames[0]]
    ? parseFloat(values[argNames[0]])
    : undefined;
  const containerGrossWeightField = argNames[1]
    ? values[argNames[1]]
    : undefined;

  const cargoUnit = argNames[2] ? values[argNames[2]] : undefined;
  const containerUnit = argNames[3] ? values[argNames[3]] : undefined;
  const tblJobContainer = newState[argNames[4]] || [];

  if (containerUnit) {
    const firstUnit = values[argNames[3]];
    const isUnitInconsistent = tblJobContainer.some(
      (container) => container[argNames[3]] !== firstUnit
    );
    if (isUnitInconsistent) {
      const updatedValues = {
        ...values,
        [argNames[3]]: "",
      };

      setStateVariable((prev) => ({
        ...prev,
        [argNames[3]]: "",
      }));

      return {
        values: updatedValues,
        isCheck: false,
        type: "warning",
        message: "All units should be the same.",
        alertShow: true,
      };
    }
  }

  const isCargoUnitInconsistent =
    cargoUnit &&
    tblJobContainer.some((container) => container[argNames[3]] !== cargoUnit);

  if (isCargoUnitInconsistent) {
    const updatedValues = {
      ...values,
      [argNames[2]]: "",
    };

    setStateVariable((prev) => ({
      ...prev,
      [argNames[2]]: "",
    }));

    return {
      values: updatedValues,
      isCheck: false,
      type: "warning",
      message: "Cargo unit must be consistent with container units.",
      alertShow: true,
    };
  }

  const containerGrossWeight = tblJobContainer.reduce(
    (total, container) => total + parseFloat(container[argNames[1]]),
    0
  );

  if (!cargoGrossWeight || !containerGrossWeight) {
    return { obj };
  }

  if (cargoGrossWeight !== containerGrossWeight) {
    const updatedValues = {
      ...values,
      [argNames[0]]: "",
    };

    setStateVariable((prev) => ({
      ...prev,
      [argNames[0]]: "",
    }));

    return {
      values: updatedValues,
      isCheck: false,
      type: "error",
      message:
        "Total gross weight in container grid should match with booking gross cargo weight column.",
      alertShow: true,
    };
  }

  return { obj };
};
const validateEmail = (obj) => {
  const { fieldName, values, formControlData, newState, setStateVariable } =
    obj;
  const emailPattern = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;

  // Check if the email matches the pattern
  if (values[fieldName].match(emailPattern)) {
    return { ...obj, values: { ...values } };
  } else {
    // Update state variable to null for invalid email
    const updatedValues = {
      ...values,
      [fieldName]: null,
    };

    setStateVariable((prev) => ({
      ...prev,
      [fieldName]: null,
    }));

    // Return the error structure without toast
    return {
      values: updatedValues,
      isCheck: false,
      type: "error",
      message: "Invalid email address. Please enter a valid email.",
      alertShow: true,
      fieldName: fieldName,
      newState: newState,
      formControlData: formControlData,
    };
  }
};
const setUniqueCopyTableName = async (obj) => {
  const { args, fieldName, newState } = obj;
  const argNames = args.split(",").map((arg) => arg.trim());
  const storedUserData = localStorage.getItem("userData");
  let userData;
  if (storedUserData) {
    const decryptedData = decrypt(storedUserData);
    try {
      userData = JSON.parse(decryptedData);
    } catch (e) {
      console.error("Error parsing decrypted data:", e);
      return;
    }
  } else {
    console.error("No user data found in local storage");
    return;
  }
  const userClientCode = userData[0].clientCode; // Assuming the first user's clientCode is relevant
  const tableName = newState.tableName;
  const currentName = newState[argNames[0]];
  const mappingName = argNames[0];
  const clientCode = argNames[1];
  // Prepare request data to fetch existing mapping names for the given client code
  const requestData = {
    tableName: tableName,
    whereCondition: {
      status: 1,
    },
    projection: {},
  };

  // Fetch existing mapping names for the given client code
  const fetchMappingNameField = await fetchDataAPI(requestData);
  let data = fetchMappingNameField.data;

  // Check for duplicate mapping names
  const isDuplicate = data.some(
    (item) =>
      item.clientCode === userClientCode && item.mappingName === currentName
  );

  // If duplicate found
  if (isDuplicate) {
    if (newState.clientCode === null) {
      newState.clientCode = userClientCode;
    }
    newState[mappingName] = "";
    return {
      obj,
      newState,
      isCheck: false,
      type: "error",
      message: `For client code ${userClientCode} the mapping name ${currentName} is already taken. Kindly use another name.`,
      alertShow: true,
    };
  }
  if (newState.clientCode === null) {
    newState[clientCode] = userClientCode;
  }
  let endResult = {
    type: "success",
    result: true,
    newState: newState,
    message: "OnLoad function triggered",
  };
  return;
};
const poNoFlow = async (obj) => {
  const {
    args,
    fieldName,
    values,
    formControlData,
    newState,
    setFormControlData,
  } = obj;
  const argNames = args.split(",").map((arg) => arg.trim());
  let [originCol, tableName, destinationCol] = argNames;
  let parentReferenceNoId = values[originCol];

  if (parentReferenceNoId !== null && parentReferenceNoId !== undefined) {
    // Assuming parentReferenceNoIdmultiselect is an array with objects containing label and value
    console.log("newState", newState);
    const selectedItems = newState.parentReferenceNoIdmultiselect.map(
      (item) => ({
        _id: item._id,
        value: item.value,
        label: item.label,
      })
    );

    console.log(
      "formControlData - ",
      formControlData.child[0].fields[0].dropdownFilter
    );
    formControlData.child[0].fields[0].dropdownFilter =
      "{_id:" + parentReferenceNoId + "," + " transactionType:PO}";
    console.log(
      "dropdown - ",
      "{_id:" + parentReferenceNoId + " , " + " transactionType:PO}"
    );
    console.log(
      "formControlData 2 - ",
      formControlData.child[0].fields[0].dropdownFilter
    );
    // Set the entire array of selected items
    newState.tblWhTransactionDetails[0].parentReferenceNoIddropdown =
      selectedItems;
    newState.tblWhTransactionDetails[0].parentReferenceNoIddropdown =
      selectedItems;

    return {
      obj: { ...obj },
      values: { ...values },
      isCheck: false,
      type: "success",
      message: "PO No. Flow successfully.",
      alertShow: false,
    };
  } else {
    return {
      obj: { ...obj },
      values: { ...values },
      isCheck: false,
      type: "error",
      message: "PO No. Flow failed.",
      alertShow: true,
    };
  }
};
const calculateMultipleValues = (obj) => {
  // const { args, values: originalValues, fieldName, newState: originalNewState, formControlData, setStateVariable } = obj;
  const {
    args,
    values,
    fieldName,
    newState,
    formControlData,
    setStateVariable,
  } = obj;
  console.log("calculateMultipleValues", args);
  console.log("calculateMultipleValues", values);
  console.log("formControlData", formControlData);
  // const values = JSON.parse(JSON.stringify(originalValues));
  // const newState = JSON.parse(JSON.stringify(originalNewState));

  if (!args) {
    return {
      isCheck: false,
      type: "error",
      message: "No arguments provided for calculation.",
      values: values,
      alertShow: false,
      fieldName: fieldName,
      newState: newState,
      formControlData: formControlData,
    };
  }

  const getValue = (field) => {
    let value;
    if (field.includes(".")) {
      const [, actualField] = field.split(".");
      value = parseFloat(newState[actualField]);
    } else {
      value = parseFloat(values[field]);
    }
    return isNaN(value) ? 0 : value;
  };

  // Function to apply BODMAS by handling operator precedence
  const applyBODMAS = (tokens) => {
    const applyOperation = (tokens, operators) => {
      for (let i = 0; i < tokens.length; i++) {
        if (operators.includes(tokens[i])) {
          const operand1 = parseFloat(tokens[i - 1]);
          const operand2 = parseFloat(tokens[i + 1]);
          const operator = tokens[i];

          if (isNaN(operand1) || isNaN(operand2)) {
            console.warn(
              `Invalid operand encountered: operand1=${operand1}, operand2=${operand2}`
            );
            return NaN; // Return NaN if any operand is not a number
          }

          const result = evaluateSimpleExpression(operand1, operator, operand2);
          tokens.splice(i - 1, 3, result); // Replace the three tokens with the result
          i--; // Adjust index after splice
        }
      }
    };

    // First, handle multiplication, division, and modulus
    applyOperation(tokens, ["*", "/", "%"]);

    // Then, handle addition and subtraction
    applyOperation(tokens, ["+", "-"]);

    return tokens.length === 1 ? tokens[0] : NaN;
  };

  // Helper function to evaluate a simple operation
  const evaluateSimpleExpression = (operand1, operator, operand2) => {
    switch (operator) {
      case "+":
        return operand1 + operand2;
      case "-":
        return operand1 - operand2;
      case "*":
        return operand1 * operand2;
      case "%":
        return (operand1 * operand2) / 100;
      case "/":
        return operand2 === 0 ? NaN : operand1 / operand2;
      default:
        return operand1;
    }
  };
  const parseAndEvaluate = (expression) => {
    const tokens = expression.match(/(\(|\)|\w+|\+|\-|\*|\/|\%)/g);

    const stack = [];
    let currentTokens = [];

    for (const token of tokens) {
      if (token === "(") {
        stack.push(currentTokens);
        currentTokens = [];
      } else if (token === ")") {
        const subResult = applyBODMAS(currentTokens);
        if (isNaN(subResult)) {
          return NaN; // Return NaN if any sub-result is NaN
        }
        currentTokens = stack.pop();
        currentTokens.push(subResult.toString());
      } else {
        const isOperator = ["+", "-", "*", "/", "%"].includes(token);
        if (isOperator) {
          currentTokens.push(token);
        } else {
          const value = getValue(token);
          currentTokens.push(value);
        }
      }
    }

    return applyBODMAS(currentTokens);
  };

  const parts = args.split(",");
  const tokens = parts.map((part) => part.trim());

  // The last token is the field where we want to display the result
  const resultField = tokens.pop();

  // Evaluate the expression and calculate the result
  const expression = tokens.join(" ");
  const result = parseAndEvaluate(expression);

  if (isNaN(result)) {
    console.warn("Final result is NaN.");
    return {
      isCheck: false,
      type: "error",
      message: "Calculation resulted in NaN.",
      values: { ...values },
      alertShow: false,
      fieldName: fieldName,
      newState: newState,
    };
  }

  // setStateVariable((prev) => ({
  //   ...prev,
  //   [resultField]: result?.toFixed(2), // Format the result to 2 decimal places
  // }));

  setStateVariable((prev) => ({
    ...prev,
    [resultField]: !isNaN(parseFloat(result))
      ? parseFloat(result).toFixed(2) // safely convert and format
      : "0.00", // fallback if result is invalid
  }));

  // Update the values object with the result in the specified field
  // const updatedValues = {
  //   ...values,
  //   [resultField]: result?.toFixed(2), // Format the result to 2 decimal places
  // };

  const updatedValues = {
    ...values,
    [resultField]: !isNaN(parseFloat(result))
      ? parseFloat(result).toFixed(2) // always format as number with 2 decimals
      : "0.00", // fallback if result is invalid
  };

  return {
    isCheck: true,
    type: "success",
    message: "Calculation completed successfully.",
    values: updatedValues,
    alertShow: false,
    fieldName: fieldName,
    newState: newState,
  };
};
// const setVesselSec = async (obj) => {
//     const { args, fieldName, values, formControlData, newState, setFormControlData } = obj;
//     const argNames = args.split(",").map(arg => arg.trim());
//     const storedUserData = localStorage.getItem("userData");
//     let userData;
//     if (storedUserData) {
//         const decryptedData = decrypt(storedUserData);
//         try {
//             userData = JSON.parse(decryptedData);
//         } catch (e) {
//             console.error("Error parsing decrypted data:", e);
//             return;
//         }
//     } else {
//         console.error("No user data found in local storage");
//         return;
//     }
//     const userClientCode = userData[0].clientCode; // Assuming the first user's clientCode is relevant
//     const tableName = newState.tableName;
//     const currentName = newState[argNames[0]];
//     const mappingName = argNames[0];
//     const clientCode = argNames[1];

//     // Prepare request data to fetch existing mapping names for the given client code
//     const requestData = {
//         tableName: "tblVesselSchedule",
//         whereCondition: {
//             status: 1,
//         },
//         projection: {},
//     };

//     // Fetch existing mapping names for the given client code
//     const fetchMappingNameField = await fetchDataAPI(requestData);
//     let data = fetchMappingNameField.data;

//     // Check if data contains the expected structure
//     if (data && data.length > 0) {
//         // Access the first item in the array and then the tblVesselScheduleDetails
//         const vesselSchedule = data[0];
//         const vesselScheduleDetails = vesselSchedule.tblVesselScheduleDetails[0];

//         if (vesselScheduleDetails) {
//             // Now, let's set the values for the fields in the formControlData or newState
//             const updatedFields = formControlData.child[2].fields.map(fields => {
//                 switch (fields.fieldname) {
//                     case 'etd':
//                         return { ...fields, value: vesselScheduleDetails.ETD || '' };
//                     case 'eta':
//                         return { ...fields, value: vesselScheduleDetails.ETA || '' };
//                     case 'transitTime':
//                         return { ...fields, value: vesselScheduleDetails.transitTime || '' };
//                     case 'originFreeDays':
//                         return { ...fields, value: vesselScheduleDetails.freeDaysOrigin || '' };
//                     case 'destinationFreeDays':
//                         return { ...fields, value: vesselScheduleDetails.freeDaysDestination || '' };
//                     default:
//                         return fields;
//                 }
//             });

//             // Update the formControlData with the new field values
//             setFormControlData(prevState => ({
//                 ...prevState,
//                 child: prevState.child.map((child, index) =>
//                     index === 2 ? { ...child, fields: updatedFields } : child
//                 ),
//             }));

//             let endResult = {
//                 type: "success",
//                 result: true,
//                 newState: { ...newState, fields: updatedFields }, // Assuming you want to update newState as well
//                 message: "OnLoad function triggered",
//             };

//             return endResult;
//         } else {
//             console.error("No vessel schedule details found.");
//         }
//     } else {
//         console.error("No vessel schedule data found.");
//     }

//     // Return a default result in case of errors
//     return {
//         type: "error",
//         result: false,
//         newState,
//         message: "No valid data found to update fields.",
//     };
// };
// const setVesselSec = async (obj) => {
//     const { args, fieldName, values, formControlData, newState, setFormControlData } = obj;
//     const argNames = args.split(",").map(arg => arg.trim());
//     const storedUserData = localStorage.getItem("userData");
//     let userData;
//     if (storedUserData) {
//         const decryptedData = decrypt(storedUserData);
//         try {
//             userData = JSON.parse(decryptedData);
//         } catch (e) {
//             console.error("Error parsing decrypted data:", e);
//             return;
//         }
//     } else {
//         console.error("No user data found in local storage");
//         return;
//     }
//     const userClientCode = userData[0].clientCode; // Assuming the first user's clientCode is relevant
//     const tableName = newState.tableName;
//     const polId = newState[argNames[0]];
//     const pod = newState[argNames[1]];
//     const vendor = values[argNames[2]];
//     // const vendorName=
//     // Prepare request data to fetch existing mapping names for the given client code

//     const requestData = {
//         tableName: "tblVesselSchedule",
//         whereCondition: {
//             status: 1,
//         },
//         projection: {},
//     };

//     // Fetch existing mapping names for the given client code
//     const fetchMappingNameField = await fetchDataAPI(requestData);
//     let data = fetchMappingNameField.data;

//     // Check if data contains the expected structure
//     if (data && data.length > 0) {
//         const vesselSchedule = data[0];
//         const vesselScheduleDetails = vesselSchedule.tblVesselScheduleDetails[0];
//         console.log("vesselScheduleDetails",vesselScheduleDetails)
//         if (vesselScheduleDetails) {
//             // Update tblRateRequestPlan with vesselScheduleDetails
//             const updatedTblRateRequestPlan = newState.tblRateRequestPlan.map(plan => ({
//                 ...plan,
//                 etd: vesselScheduleDetails.ETD || plan.etd,
//                 eta: vesselScheduleDetails.ETA || plan.eta,
//                 transitTime: vesselScheduleDetails.transitTime || plan.transitTime,
//                 originFreeDays: vesselScheduleDetails.freeDaysOrigin || plan.originFreeDays,
//                 destinationFreeDays: vesselScheduleDetails.freeDaysDestination || plan.destinationFreeDays,
//                 vesselScheduleId: vesselSchedule._id || plan.vesselScheduleId,
//                 vesselScheduleIddropdown: [
//                     {
//                         label: vesselSchedule.vesselScheduleName,
//                         value: vesselSchedule._id
//                     }
//                 ],
//                 fromPort: vesselScheduleDetails.fromPort || plan.fromPort,
//                 toPort: vesselScheduleDetails.toPort || plan.toPort,
//                 isChecked: vesselScheduleDetails.isChecked !== undefined ? vesselScheduleDetails.isChecked : plan.isChecked,
//             }));

//             // Update the state with the new tblRateRequestPlan data
//             setFormControlData(prevState => ({
//                 ...prevState,
//                 tblRateRequestPlan: updatedTblRateRequestPlan,
//             }));

//             let endResult = {
//                 type: "success",
//                 result: true,
//                 newState: { ...newState, tblRateRequestPlan: updatedTblRateRequestPlan },
//                 formControlData: formControlData,
//                 message: "Vessel schedule details have been set in tblRateRequestPlan.",
//             }
//             return endResult

//             // return {
//             //     type: "success",
//             //     result: true,
//             //     newState: { ...newState, tblRateRequestPlan: updatedTblRateRequestPlan },
//             //     message: "Vessel schedule details have been set in tblRateRequestPlan.",
//             // };
//         } else {
//             console.error("No vessel schedule details found.");
//         }
//     } else {
//         console.error("No vessel schedule data found.");
//     }

//     // Return a default result in case of errors
//     return {
//         type: "error",
//         result: false,
//         newState,
//         message: "No valid data found to update tblRateRequestPlan.",
//     };
// };

const setNewBranch = (obj) => {
  let { args, newState, setStateVariable, values } = obj;
  let companyName = newState.name;
  let companyAddress = newState.address;

  // Ensure both company name and address are provided
  if (companyAddress && companyName) {
    // Find the index of the existing branch with the same name or address
    const branchIndex = newState[args].findIndex(
      (branch) =>
        branch.name === companyName || branch.address === companyAddress
    );

    let updatedBranches;

    if (branchIndex !== -1) {
      // If the branch exists, update the existing branch with the new name and address
      updatedBranches = newState[args].map((branch, index) =>
        index === branchIndex
          ? { ...branch, name: companyName, address: companyAddress }
          : branch
      );
    } else {
      // If the branch does not exist, add a new branch entry
      updatedBranches = [
        ...newState[args],
        {
          name: companyName,
          address: companyAddress,
          tblCompanyBranchPerson: [],
        },
      ];
    }

    // Update the state immutably using setStateVariable
    setStateVariable((prevState) => ({
      ...prevState,
      [args]: updatedBranches,
    }));

    return {
      type: "success",
      message: "Branch details updated successfully.",
      newState: {
        ...newState,
        [args]: updatedBranches,
      },
      values: {
        ...values,
        [args]: updatedBranches,
      },
      isCheck: true,
      alertShow: true,
    };
  } else {
    // Handle case where either name or address is missing
    return {
      type: "error",
      message: "Company name or address is missing.",
      newState,
      values,
      isCheck: false,
      alertShow: true,
    };
  }
};
const checkParentDuplications = async (obj) => {
  const {
    args,
    values,
    fieldName,
    newState,
    formControlData,
    setStateVariable,
  } = obj;
  const { clientCode } = getUserDetails();

  let argNames;
  if (!args || (typeof args === "object" && Object.keys(args).length === 0)) {
    argNames = [];
  } else {
    argNames = args.split(",").map((arg) => arg.trim());
  }

  const fieldToCheck = values[fieldName].trim();
  const tableName = argNames[1] ? argNames[1] : "tblCompany";

  const projection = {};
  projection[fieldName] = 1;

  const requestData = {
    tableName: tableName,
    whereCondition: {
      status: 1,
      clientCode: clientCode,
    },
    projection: projection,
  };

  const fetchedFields = await fetchDataAPI(requestData);
  const toCheckFrom = fetchedFields.data
    .map((i) => (i[fieldName] ? i[fieldName].toLowerCase().trim() : "")) // Also trim spaces from database values
    .filter(Boolean);

  const field = formControlData.fields.find((f) => f.fieldname === fieldName);
  const label = field ? field.yourlabel : fieldName;

  let endResult = {
    type: "success",
    values: values,
    isCheck: true,
    alertShow: false,
    fieldName: fieldName,
    newState: newState,
    fieldName: fieldName,
    formControlData: formControlData,
  };

  // Check for duplicate company name
  const isDuplicate = toCheckFrom.some(
    (existingField) => existingField === fieldToCheck.toLowerCase()
  );

  if (isDuplicate) {
    const updatedValues = {
      ...values,
      [argNames[0]]: "",
    };

    // Update the state variable
    setStateVariable((prev) => ({
      ...prev,
      [fieldName]: "",
    }));

    return {
      values: updatedValues,
      isCheck: false,
      type: "error",
      message: `${label} is duplicate. Please enter a different ${label}.`,
      alertShow: true,
      fieldName: fieldName,
      newState: newState,
      formControlData: formControlData,
    };
  }

  // If no duplicate is found, return the default success object
  return endResult;
};
const resetFields = (obj) => {
  let { args, values = {} } = obj;
  let argsArray = args.split(",");
  let mainDropdown = argsArray[0] + "dropdown";
  if (values[mainDropdown]) {
    for (let i = 1; i < argsArray.length; i++) {
      let dropdown = argsArray[i] + "dropdown";
      values[argsArray[i]] = null;
      values[dropdown] ? (values[dropdown][0].label = "") : "";
    }
  }
  return obj;
};
const setCountryPhoneCode = async (obj) => {
  const { args, fieldName, values, newState, setStateVariable } = obj;
  const argNames = args.split(",").map((arg) => arg.trim());
  const storedUserData = localStorage.getItem("userData");
  let userData;

  if (storedUserData) {
    const decryptedData = decrypt(storedUserData);
    try {
      userData = JSON.parse(decryptedData);
    } catch (e) {
      console.error("Error parsing decrypted data:", e);
      return;
    }
  } else {
    console.error("No user data found in local storage");
    return;
  }

  const userClientCode = userData[0].clientCode; // Assuming the first user's clientCode is relevant
  const countryId = newState[argNames[0]]; // First argument is assumed to be the country ID
  const phoneField = argNames[1]; // Second argument is assumed to be the telephone number field
  const stateField = argNames[2]; // Assuming stateId field is called 'stateId'
  const cityField = argNames[3]; // Assuming cityId field is called 'cityId'

  // Validation: if countryId is empty or undefined, reset the phoneField, stateId, and cityId
  if (!countryId) {
    // Logic to clear state and city using dropdowns
    let mainDropdown = argNames[0] + "dropdown";
    if (values[mainDropdown]) {
      for (let i = 2; i < argNames.length; i++) {
        // Start from the second index (state and city)
        let dropdown = argNames[i] + "dropdown";
        values[argNames[i]] = null; // Clear the value
        if (values[dropdown]) {
          values[dropdown][0].label = ""; // Clear the label of the dropdown
        }
      }
    }

    setStateVariable((prev) => ({
      ...prev,
      [phoneField]: "", // Clear the telephone field
      [stateField]: "", // Clear the stateId
      [cityField]: "", // Clear the cityId
    }));

    return {
      type: "success",
      result: true,
      newState: {
        ...newState,
        [phoneField]: "",
        [stateField]: "",
        [cityField]: "",
      },
      values: {
        ...values,
        [phoneField]: "",
        [stateField]: "",
        [cityField]: "",
      },
      message:
        "Country ID is empty, telephone, state, and city fields cleared.",
    };
  }

  // Prepare request data to fetch the necessary country details
  const requestData = {
    tableName: "tblCountry",
    whereCondition: {
      _id: countryId,
    },
    projection: {
      countryPhoneCode: 1,
    },
  };

  // Fetch the relevant country details
  const fetchMappingNameField = await fetchDataAPI(requestData);
  let data = fetchMappingNameField.data;
  const phoneCode = data[0]?.countryPhoneCode;

  // Check if phoneCode is available
  if (phoneCode) {
    const currentPhone = newState[phoneField] || "";

    // If the current phone doesn't start with the countryPhoneCode, update it
    let updatedPhone;
    if (!currentPhone.startsWith(phoneCode)) {
      // Set the countryPhoneCode and allow the user to append their phone number
      updatedPhone = `${phoneCode}`;
    } else {
      // Keep the existing phone number intact if the countryPhoneCode is already there
      updatedPhone = currentPhone;
    }

    const updatedValues = {
      ...values,
      [phoneField]: updatedPhone,
      [stateField]: "", // Reset stateId when country is changed
      [cityField]: "", // Reset cityId when country is changed
    };

    // Logic to clear state and city using dropdowns when country is changed
    let mainDropdown = argNames[0] + "dropdown";
    if (values[mainDropdown]) {
      for (let i = 2; i < argNames.length; i++) {
        // Start from the second index (state and city)
        let dropdown = argNames[i] + "dropdown";
        values[argNames[i]] = null; // Clear the value
        if (values[dropdown]) {
          values[dropdown][0].label = ""; // Clear the label of the dropdown
        }
      }
    }

    // Preserve user input and prevent overriding the phone number
    setStateVariable((prev) => ({
      ...prev,
      [phoneField]: updatedPhone, // Set the phone number to the countryPhoneCode and allow typing afterward
      [stateField]: "", // Reset stateId in state variable
      [cityField]: "", // Reset cityId in state variable
    }));

    // Return the result
    let endResult = {
      type: "success",
      result: true,
      newState: {
        ...newState,
        [phoneField]: updatedPhone,
        [stateField]: "", // Reset stateId in newState
        [cityField]: "", // Reset cityId in newState
      },
      values: updatedValues,
      message: "Country phone code updated, and state/city fields cleared.",
    };
    return endResult;
  } else {
    console.error("Phone code not found for the country.");
    return {
      type: "error",
      result: false,
      message: "Phone code not found.",
    };
  }
};
const qtyCheck = (obj) => {
  const { args, fieldName, values, newState, formControlData } = obj;
  const argsArray = args.split(",").map((arg) => arg.trim());
  let sizeId = values.sizeId;
  let typeId = values.typeId;
  // let parts = argsArray[1].split(/(?=[A-Z])/);
  // let gridName = parts[parts.length - 1];
  // console.log("container name", gridName);
  let parentCommonItem = newState[argsArray[0]].filter(
    (item) => item.sizeId === sizeId && item.typeId === typeId
  );

  let childItemQty = newState[argsArray[1]].filter(
    (item) => item.sizeId === sizeId && item.typeId === typeId
  ).length;
  let childCommonItem = newState[argsArray[1]].filter(
    (item) => item.sizeId === sizeId && item.typeId === typeId
  );
  if (parentCommonItem) {
    if (values.qty > parentCommonItem[0].qty) {
      values[fieldName] = null;
      return {
        isCheck: false,
        type: "error",
        message: `Qty can't be greater`,
        alertShow: true,
        values: values,
        newState: newState,
        formControlData: formControlData,
      };
    }
  }

  return {
    isCheck: false,
    type: "error",
    message: `Qty can't be greater`,
    alertShow: false,
    values: values,
    newState: newState,
    fieldName: fieldName,
    formControlData: formControlData,
  };
};
const checkGridsDuplication = (obj) => {
  const {
    args,
    values,
    fieldName,
    newState,
    formControlData,
    setStateVariable,
    rowIndex,
  } = obj;
  const argNames = args.split(",").map((arg) => arg.trim());
  const gridType = argNames[0];
  const gridName = argNames[1];
  const listOfFields = argNames[2].split("$");

  let gridData;

  // Handling "sub-child" grid type
  if (gridType === "sub-child") {
    const listOfTables = gridName.split(".");
    const childTableName = listOfTables[0];
    const subChildTableName = listOfTables[1];
    const childData = newState[childTableName];

    if (childData && Array.isArray(childData)) {
      for (let i = 0; i < childData.length; i++) {
        const relevantChild = childData[i];
        if (relevantChild) {
          gridData = relevantChild[subChildTableName];
        } else {
          return {
            isCheck: false,
            type: "error",
            message: "Sub-child data not found or empty.",
            values: values,
            indexValue: i,
            alertShow: true,
            fieldName: fieldName,
            newState: newState,
          };
        }
      }
    } else {
      return {
        isCheck: false,
        type: "error",
        message: "Child data is not in expected format.",
        values: values,
        alertShow: true,
        fieldName: fieldName,
        newState: newState,
      };
    }
  } else {
    gridData = newState[gridName]; // For "child" type
  }

  const sanitizedFields = listOfFields.map((field) =>
    field.replace(/[\[\]]/g, "")
  );
  const labels = sanitizedFields.map((field) => {
    let label = field;

    // Determine the label based on gridType and fieldName
    if (gridType === "child") {
      formControlData.child[0].fields.forEach((childField) => {
        if (childField.fieldname === field) {
          label = childField.yourlabel;
        }
      });
    } else if (gridType === "sub-child") {
      formControlData.child[0].subChild[0].fields.forEach((subChildField) => {
        if (subChildField.fieldname === field) {
          label = subChildField.yourlabel;
        }
      });
    }
    return label;
  });

  if (argNames.length !== 3) {
    return {
      isCheck: false,
      type: "error",
      message: "Failed to check duplication.",
      values: values,
      alertShow: true,
      fieldName: fieldName,
      newState: newState,
    };
  }

  const handleDuplicate = () => {
    const updatedValues = { ...values };

    sanitizedFields.forEach((field) => {
      if (values[field + "dropdown"]) {
        // Handle dropdown clearing (clear the selected value and labels)
        updatedValues[field] = ""; // Clear only the selected value

        // Optionally clear dropdown label if needed
        values[field + "dropdown"].forEach((item) => {
          if (item && typeof item === "object") {
            item.label = ""; // Clear the label if needed
          }
        });
      } else {
        // Clear regular field values
        updatedValues[field] = "";
      }

      // Clear only the current row in newState
      if (newState[gridName]?.[rowIndex]) {
        newState[gridName][rowIndex][field] = ""; // Reset only for the current row in newState
      }
    });

    // Update the component state without affecting previous entries
    setStateVariable((prev) => ({
      ...prev,
      ...updatedValues, // Clear the updatedValues into state
    }));

    const fieldsList =
      labels.slice(0, -1).join(", ") +
      (labels.length > 1 ? `, and ${labels.slice(-1)}` : labels[0]);
    const message = `Duplicate entry found for ${fieldsList}. Please enter different ${labels[labels.length - 1]
      }.`;

    return {
      type: "error",
      message: message,
      values: updatedValues,
      alertShow: true,
      fieldName: fieldName,
      isCheck: false,
      newState: newState,
    };
  };

  // Check for duplicates based on gridType and sanitized fields
  if (sanitizedFields.length > 0 && gridType === "child") {
    const isDuplicate = gridData.some((item, index) => {
      if (index === rowIndex) return false; // Exclude current row from check
      return sanitizedFields.every((field) => {
        const gridValue =
          item[field] !== undefined && item[field] !== null
            ? item[field].toString().trim()
            : "";
        const valueToCheck =
          values[field] !== undefined && values[field] !== null
            ? values[field].toString().trim()
            : "";
        return gridValue === valueToCheck;
      });
    });

    if (isDuplicate) {
      const dropdownField = fieldName + "dropdown";
      if (values[dropdownField] && Array.isArray(values[dropdownField])) {
        values[dropdownField].forEach((item) => {
          if (item && typeof item === "object") {
            item.label = ""; // Clear the label if needed
          }
        });
      }
      return handleDuplicate();
    }
  } else if (sanitizedFields.length > 0 && gridType === "sub-child") {
    const isDuplicate = gridData.some((item, index) => {
      if (index === rowIndex) return false; // Exclude current row from check
      return sanitizedFields.every((field) => {
        const gridValue =
          item[field] !== undefined && item[field] !== null
            ? item[field].toString().trim()
            : "";
        const valueToCheck =
          values[field] !== undefined && values[field] !== null
            ? values[field].toString().trim()
            : "";
        return gridValue === valueToCheck;
      });
    });

    if (isDuplicate) {
      return handleDuplicate();
    }
  }

  return {
    isCheck: true,
    type: "success",
    message: "No duplicates found.",
    values: values,
    alertShow: false,
    fieldName: fieldName,
    newState: newState,
  };
};
const setSameDDValuesWithCondition = async (obj) => {
  const {
    args,
    values,
    fieldName,
    newState,
    formControlData,
    setStateVariable,
  } = obj;

  const { clientCode } = getUserDetails();

  const argNames = args.split(",").map((arg) => arg.trim());
  const field1 = argNames[0];
  const field2 = argNames[1];
  const destinationCountryField = argNames[2];
  const tableName = argNames[3];
  const popupTypeArg = argNames[argNames.length - 1]?.toLowerCase();

  let popup = "warning";
  if (popupTypeArg === "e") {
    popup = "error";
  } else if (popupTypeArg === "w") {
    popup = "warning";
  }

  const field1Label =
    formControlData.fields.find((f) => f.fieldname === field1)?.yourlabel ||
    field1;
  const field2Label =
    formControlData.fields.find((f) => f.fieldname === field2)?.yourlabel ||
    field2;
  const field3Label =
    formControlData.fields.find((f) => f.fieldname === destinationCountryField)
      ?.yourlabel || destinationCountryField;

  const param1 = values[field1];
  const param2 = values[destinationCountryField];

  // Prepare API request to fetch countryId for the first dropdown value
  const requestData = {
    tableName: tableName,
    whereCondition: {
      status: 1,
      clientCode: clientCode,
      _id: param1,
    },
    projection: {
      countryId: 1,
    },
  };

  // Fetch the country ID
  const fetchCountryId = await fetchDataAPI(requestData);
  const fetchedCountryId = fetchCountryId?.data[0]?.countryId;

  // Check if the countries match
  if (param2 === fetchedCountryId) {
    const dropdownValue = values[field1];

    if (values[field2] === "" || values[field2] == null) {
      values[field2] = dropdownValue;

      setStateVariable((prev) => ({
        ...prev,
        [field2]: dropdownValue,
      }));

      return {
        values: { ...values },
        isCheck: true,
        type: "success",
        message: `${field1Label} country matches ${field2Label} country. Value set.`,
        alertShow: true,
        fieldName: fieldName,
        newState: newState,
      };
    } else {
      return {
        values: { ...values },
        type: "info",
        // message: `${field2Label} already has a value.`,
        // alertShow: true,
        fieldName: fieldName,
        isCheck: false,
        newState: newState,
      };
    }
  } else {
    if (popup === "error") {
      setStateVariable((prev) => ({
        ...prev,
        [field1]: "",
      }));

      return {
        values: { ...values },
        isCheck: false,
        type: "error",
        message: `${field1Label} should match ${field3Label}. Value reset.`,
        alertShow: true,
        fieldName: fieldName,
        newState: newState,
      };
    } else if (popup === "warning") {
      return {
        values: { ...values }, // Warning: Keep the current value, do not reset
        isCheck: false,
        type: "warning",
        message: `${field1Label} should match ${field3Label} to set value in ${field2Label}. Please review.`,
        alertShow: true,
        fieldName: fieldName,
        newState: newState,
      };
    }
  }
};

const checkPortType = async (obj) => {
  const {
    args,
    values,
    fieldName,
    formControlData,
    setStateVariable,
    newState,
  } = obj;
  const { clientCode } = getUserDetails();

  let argNames;
  if (!args || (typeof args === "object" && Object.keys(args).length === 0)) {
    argNames = [];
  } else {
    argNames = args.split(",").map((arg) => arg.trim());
  }

  const field1 = argNames[0];
  const field2 = argNames[1];
  const tableName = argNames[2];
  const filterOut = argNames[3];

  const popupTypeArg = argNames[argNames.length - 1]?.toLowerCase();
  let popup = "warning";
  if (popupTypeArg === "e") {
    popup = "error";
  } else if (popupTypeArg === "w") {
    popup = "warning";
  }

  const field1Label =
    formControlData.fields.find((f) => f.fieldname === field1)?.yourlabel ||
    field1;
  const field2Label =
    formControlData.fields.find((f) => f.fieldname === field2)?.yourlabel ||
    field2;

  let dropdownValue;
  const param1 = values[field1];
  const param2 = values[field2];

  if (param1 && param1.hasOwnProperty("value")) {
    dropdownValue = param1.value;
  } else {
    dropdownValue = param1;
  }

  const requestData = {
    tableName: tableName,
    whereCondition: {
      status: 1,
      clientCode: clientCode,
      _id: param1,
    },
    projection: {
      portTypeId: 1,
    },
  };

  const fetchPortId = await fetchDataAPI(requestData);
  const fetchedPortId = fetchPortId?.data[0]?.portTypeId;

  const requestData2 = {
    tableName: "tblMasterData",
    whereCondition: {
      _id: fetchedPortId,
      status: 1,
    },
    projection: {
      name: 1,
    },
  };

  const portFromMaster = await fetchDataAPI(requestData2);
  const portType = portFromMaster?.data?.[0]?.name;

  if (portType === filterOut) {
    setStateVariable((prev) => ({
      ...prev,
      [field2]: dropdownValue,
    }));

    return {
      values: { ...values, [field2]: dropdownValue }, // Set dropdown value
      isCheck: true,
      type: "success",
      message: `${field1Label} port is SEA port. Value set in ${field2Label}.`,
      alertShow: true,
      formControlData: formControlData,
      newState: newState,
      fieldName: fieldName,
    };
  } else {
    const updatedValues = {
      ...values,
      [field1]: popup === "error" ? "" : values[field1],
    };

    if (popup === "error") {
      setStateVariable((prev) => ({
        ...prev,
        [field1]: "",
      }));
      return {
        values: updatedValues,
        isCheck: false,
        type: popup,
        message: `Cannot set value of ${field1Label} in ${field2Label} as ${field1Label} is not a SEA port`,
        alertShow: true,
        formControlData: formControlData,
        newState: newState,
        fieldName: fieldName,
      };
    } else if (popup === "warning") {
      return {
        values: updatedValues,
        isCheck: false,
        type: popup,
        message: `${field1Label} is not a SEA port. Please review.`,
        alertShow: true,
        formControlData: formControlData,
        newState: newState,
        fieldName: fieldName,
      };
    }
  }
};

const checkNoDecimals = ({
  values,
  fieldName,
  setStateVariable,
  newState,
  formControlData,
}) => {
  const fieldValue = values[fieldName];
  console.log("fieldValue", fieldValue);
  if (fieldValue && !Number.isInteger(Number(fieldValue))) {
    toast.error(
      `The value "${fieldValue}" cannot contain decimals. Please enter a whole number.`
    );

    const updatedValues = {
      ...values,
      [fieldName]: "", // Reset the field
    };

    // Update the state variable to reflect the reset value
    setStateVariable((prev) => ({
      ...prev,
      [fieldName]: "",
    }));

    return {
      values: updatedValues,
      type: "error",
      message: `The value "${fieldValue}" cannot contain decimals. Please enter a whole number.`,
      alertShow: true,
      fieldName: fieldName,
      isCheck: false,
      newState: newState,
      formControlData: formControlData,
    };
  }

  return {
    values,
    type: "success",
    alertShow: false,
    fieldName: fieldName,
    isCheck: false,
    newState: newState,
    formControlData: formControlData,
  };
};
const salesExecutiveFilter = async (obj) => {
  const { args, formControlData } = obj;
  const { branchId } = getUserDetails();

  const argNames = args.split(",").map((arg) => arg.trim());

  const salesExecutive = argNames[0];

  let formData = formControlData.fields.find(
    (field) => field.fieldname === salesExecutive
  );
  if (!formData.dropdownFilter) {
    formData.dropdownFilter = `and companyBranchId=${branchId}`;
  } else {
    formData.dropdownFilter = formData.dropdownFilter.replace(
      "${branchId}",
      branchId
    );
  }
};
const invoiceDate = async (obj) => {
  const {
    args,
    fieldName,
    values,
    newState,
    formControlData,
    setFormControlData,
    setStateVariable,
  } = obj;
  const argNames = args.split(",").map((arg) => arg.trim());
  const ginNoValue = newState[fieldName];
  const ginNoFieldName = argNames[0];
  const tableName = argNames[1];

  const requestInvoice = {
    tableName: "tblInvoice",
    whereCondition: {
      jobId: ginNoValue,
      status: 1,
    },
    projection: {
      jobId: 1,
      toDate: 1,
    },
  };

  try {
    const responseInvoice = await fetchDataAPI(requestInvoice);
    let fromDate = null;

    if (responseInvoice.success && responseInvoice.data.length > 0) {
      const maxToDate = responseInvoice.data.reduce((maxDate, item) => {
        const toDate = new Date(item.toDate);
        return toDate > maxDate ? toDate : maxDate;
      }, new Date(responseInvoice.data[0].toDate));

      fromDate = new Date(maxToDate); // Do not add +1 day here
    }

    if (!fromDate) {
      const requestBody = {
        tableName: tableName,
        whereCondition: {
          _id: ginNoValue,
          status: 1,
        },
        projection: {
          referenceDate: 1,
        },
      };

      try {
        const response = await fetchDataAPI(requestBody);
        if (response.success && response.data.length > 0) {
          const referenceDate = response.data[0].referenceDate;
          fromDate = new Date(referenceDate);

          const dayOfWeek = fromDate.getDay();
          const daysUntilSunday = (7 - dayOfWeek) % 7;
          const toDate = new Date(fromDate);
          toDate.setDate(fromDate.getDate() + daysUntilSunday);

          const updatedValues = {
            ...values,
            [argNames[2]]: fromDate,
            [argNames[3]]: toDate,
          };
          setStateVariable((prev) => ({
            ...prev,
            [argNames[2]]: fromDate,
            [argNames[3]]: toDate,
          }));

          return {
            type: "success",
            result: true,
            newState: {
              ...newState,
              [argNames[2]]: fromDate,
              [argNames[3]]: toDate,
            },
            values: updatedValues,
            message: "Data found from reference date!",
          };
        } else {
          return {
            isCheck: false,
            type: "error",
            message: "No data found for reference date!",
            alertShow: false,
            fieldName: fieldName,
            values: values,
            newState: newState,
            formControlData: formControlData,
          };
        }
      } catch (error) {
        return {
          isCheck: false,
          type: "error",
          message: "Error fetching reference date",
          alertShow: false,
          fieldName: fieldName,
          values: values,
          newState: newState,
          formControlData: formControlData,
        };
      }
    } else {
      fromDate.setDate(fromDate.getDate() + 1); // Add +1 day here
      const dayOfWeek = fromDate.getDay();
      const daysUntilSunday = (7 - dayOfWeek) % 7;
      const toDate = new Date(fromDate);
      toDate.setDate(fromDate.getDate() + daysUntilSunday);

      const updatedValues = {
        ...values,
        [argNames[2]]: fromDate, // Set fromDate
        [argNames[3]]: toDate,
      };
      setStateVariable((prev) => ({
        ...prev,
        [argNames[2]]: fromDate,
        [argNames[3]]: toDate,
      }));

      return {
        type: "success",
        result: true,
        newState: {
          ...newState,
          [argNames[2]]: fromDate,
          [argNames[3]]: toDate,
        },
        values: updatedValues,
        message: "Data found!",
      };
    }
  } catch (error) {
    return {
      isCheck: false,
      type: "error",
      message: "Error fetching company parameters",
      alertShow: false,
      fieldName: fieldName,
      values: values,
      newState: newState,
      formControlData: formControlData,
    };
  }
};
const invoiceSetBillingParty = async (obj) => {
  const {
    args,
    fieldName,
    values,
    newState,
    formControlData,
    setFormControlData,
    setStateVariable,
  } = obj;

  const argNames = args.split(",").map((arg) => arg.trim());
  const billingPartyId = newState[fieldName];
  const tableName = argNames[0];
  const jobId = newState[argNames[1]];
  const requestBody = {
    tableName: tableName,
    whereCondition: {
      _id: billingPartyId,
    },
    projection: {
      accCompanyId: 1,
    },
  };
  try {
    const response = await fetchDataAPI(requestBody);
    if (response.success && response.data.length > 0) {
      const accCompanyId = response.data[0].accCompanyId;
      let str = null;
      formControlData.fields.map((field) => {
        if (field.fieldname === argNames[1]) {
          str = field.dropdownFilter;
        }
        return field;
      });

      let filterCondition = str.replace(/^{|}$/g, "");

      formControlData.fields = formControlData.fields.map((field) => {
        if (field.fieldname === argNames[1]) {
          field.dropdownFilter = `{${filterCondition},customerId:${accCompanyId}}`;
          console.log("filterCondition - ", field.dropdownFilter);
        }
        return field;
      });

      const updatedValues = {
        ...values,
      };
      setStateVariable((prev) => ({
        ...prev,
      }));
      return {
        type: "success",
        result: true,
        newState: {
          ...newState,
        },
        values: updatedValues,
        message: "Data found !",
      };
    } else {
      return {
        isCheck: false,
        type: "error",
        message: "No data found !",
        alertShow: false,
        fieldName: fieldName,
        values: values,
        newState: newState,
        formControlData: formControlData,
      };
    }
  } catch (error) {
    return {
      isCheck: false,
      type: "error",
      message: "Error fetching company parameters",
      alertShow: false,
      fieldName: fieldName,
      values: values,
      newState: newState,
      formControlData: formControlData,
    };
  }
};
const invoiceChargeGrid = async (obj) => {
  const { clientCode } = getUserDetails();
  const {
    args,
    fieldName,
    values,
    newState,
    formControlData,
    setFormControlData,
    setStateVariable,
  } = obj;

  const argNames = args.split(",").map((arg) => arg.trim());
  const fromDate = newState[fieldName];
  const tableName = argNames[0];
  const jobId = newState[argNames[1]];
  // const warehouseRequestBody = {
  //   tableName: tableName,
  //   whereCondition: {
  //     _id: jobId,
  //   },
  //   projection: {},
  // };

  const warehouseRequestBody = {
    columns: "*",
    tableName: tableName,
    whereCondition: `id=${jobId}`,
    clientIdCondition: `clientId IN (${clientId}, (SELECT id FROM tblClient WHERE clientCode = 'SYSCON')) FOR JSON PATH`,
  };

  // const invoiceChargesRequestBody = {
  //   tableName: "tblCharge",
  //   whereCondition: {
  //     clientCode: clientCode,
  //     name: {
  //       $in: ["HANDLING OUT CHARGES", "STORAGE CHARGES", "HANDLING IN CHARGES"],
  //     },
  //   },
  //   projection: {
  //     name: 1,
  //     code: 1,
  //   },
  // };

  const invoiceChargesRequestBody = {
    columns: "name,code",
    tableName: "tblCharge",
    whereCondition: `name in ('HANDLING OUT CHARGES', 'STORAGE CHARGES', 'HANDLING IN CHARGES')`,
    clientIdCondition: `clientId IN (${clientId}, (SELECT id FROM tblClient WHERE clientCode = 'SYSCON')) FOR JSON PATH`,
  };

  try {
    const [response, invoiceChargesResponse] = await Promise.all([
      fetchReportData(warehouseRequestBody),
      fetchReportData(invoiceChargesRequestBody),
    ]);
    if (
      response.success &&
      response.data.length > 0 &&
      invoiceChargesResponse.success &&
      invoiceChargesResponse.data.length > 0
    ) {
      const charges = invoiceChargesResponse.data;
      const referenceDate = response.data[0].referenceDate;
      const tblWhTransactionDetails = response.data[0];
      const totalQty =
        tblWhTransactionDetails?.reduce((sum, item) => {
          return sum + (item?.qty || 0);
        }, 0) || 0;

      const fromDateObj = new Date(fromDate);
      const referenceDateObj = new Date(referenceDate);
      // Extract only the date parts (ignoring time)
      const fromDateOnly = fromDateObj.toISOString().split("T")[0];
      const referenceDateOnly = referenceDateObj.toISOString().split("T")[0];
      let newInvoiceCharges = [];
      if (fromDateOnly == referenceDateOnly) {
        // Create multiple new charge objects
        newInvoiceCharges = [
          {
            chargeIddropdown: [
              {
                _id: charges[0]._id,
                value: charges[0]._id,
                oldId: null,
                label: charges[0].name,
              },
            ],
            chargeId: charges[0]._id,
            qty: totalQty,
            totalAmountFc: null,
            totalAmount: null,
            rate: null,
            isChecked: true,
            indexValue: 0,
          },
          {
            chargeIddropdown: [
              {
                _id: charges[1]._id,
                value: charges[1]._id,
                oldId: null,
                label: charges[1].name,
              },
            ],
            chargeId: charges[1]._id,
            qty: totalQty,
            totalAmountFc: null,
            totalAmount: null,
            rate: null,
            isChecked: true,
            indexValue: 1,
          },
          {
            tblInvoiceChargeTax: [],
            chargeIddropdown: [
              {
                _id: charges[2]._id,
                value: charges[2]._id,
                oldId: null,
                label: charges[2].name,
              },
            ],
            chargeId: charges[2]._id,
            qty: null,
            totalAmountFc: null,
            totalAmount: null,
            rate: null,
            exchangeRate: null,
            isChecked: true,
            indexValue: 2,
          },
        ];
      } else if (fromDateOnly != referenceDateOnly) {
        // Create multiple new charge objects
        newInvoiceCharges = [
          {
            chargeIddropdown: [
              {
                _id: charges[1]._id,
                value: charges[1]._id,
                oldId: null,
                label: charges[1].name,
              },
            ],
            chargeId: charges[1]._id,
            qty: totalQty,
            totalAmountFc: null,
            totalAmount: null,
            rate: null,
            isChecked: true,
            indexValue: 0,
          },
          {
            tblInvoiceChargeTax: [],
            chargeIddropdown: [
              {
                _id: charges[2]._id,
                value: charges[2]._id,
                oldId: null,
                label: charges[2].name,
              },
            ],
            chargeId: charges[2]._id,
            qty: null,
            totalAmountFc: null,
            totalAmount: null,
            rate: null,
            exchangeRate: null,
            isChecked: true,
            indexValue: 1,
          },
        ];
      } else {
        newInvoiceCharges = [];
      }
      // Helper function to handle adding or updating charges
      const updateInvoiceCharges = (currentCharges, newCharges) => {
        return newCharges.reduce((valuess, newCharge) => {
          const existingChargeIndex = valuess.findIndex(
            (charge) => charge.chargeId === newCharge.chargeId
          );

          if (existingChargeIndex !== -1) {
            // Update the existing charge
            valuess = valuess.map((charge, index) =>
              index === existingChargeIndex
                ? { ...charge, ...newCharge }
                : charge
            );
          } else {
            // Add a new charge
            valuess = [...valuess, newCharge];
          }

          return valuess;
        }, currentCharges);
      };

      // Update or add the new charges immutably
      const updatedInvoiceCharge = updateInvoiceCharges(
        newState.tblInvoiceCharge,
        newInvoiceCharges
      );

      // Update newState with the updated tblInvoiceCharge array
      const updatedNewState = {
        ...newState,
        tblInvoiceCharge: updatedInvoiceCharge,
      };

      console.log("newState - ", updatedNewState);

      // Update state variable using the updated state
      setStateVariable((prev) => ({
        ...prev,
        ...updatedNewState,
      }));

      return {
        type: "success",
        isCheck: false,
        alertShow: false,
        fieldName: fieldName,
        newState: updatedNewState,
        values: values,
        message: "Data found!",
        formControlData: formControlData,
        setFormControlData: setFormControlData,
      };
    } else {
      return {
        isCheck: false,
        type: "error",
        message: "No data found!",
        alertShow: false,
        fieldName: fieldName,
        values: values,
        newState: { ...newState },
        formControlData: formControlData,
        setFormControlData: setFormControlData,
      };
    }
  } catch (error) {
    console.error("Error fetching company parameters: ", error);
    return {
      isCheck: false,
      type: "error",
      message: "Error fetching company parameters",
      alertShow: false,
      fieldName: fieldName,
      values: values,
      newState: newState,
      formControlData: formControlData,
    };
  }
};

// const wtCompareGrossWtVolWt = async (obj) => {
//   const {
//     args,
//     values,
//     fieldName,
//     newState,
//     formControlData,
//     setStateVariable,
//   } = obj;

//   // Extract the field names for GrossWt and volumeWt from args
//   const argNames = args.split(",").map((arg) => arg.trim());
//   const GrossWt = argNames[0];    // First argument is GrossWt
//   const volumeWt = argNames[1];   // Second argument is volumeWt

//   // Get the current values of gross weight and volume weight
//   let grossWtValue = values[GrossWt];
//   let volumeWtValue = values[volumeWt];

//   // Initialize chargeable weight
//   let chargeableWt = 0;

//   // Logic to set chargeableWt based on data presence
//   if (grossWtValue !== "" && volumeWtValue === "") {
//     // If only Gross Weight has data, set chargeableWt to grossWtValue
//     chargeableWt = parseFloat(grossWtValue).toFixed(2);
//   } else if (volumeWtValue !== "" && grossWtValue === "") {
//     // If only Volume Weight has data, set chargeableWt to volumeWtValue
//     chargeableWt = parseFloat(volumeWtValue).toFixed(2);
//   } else if (grossWtValue !== "" && volumeWtValue !== "") {
//     // If both fields have data, compare and set the higher value as chargeableWt
//     if (parseFloat(grossWtValue) >= parseFloat(volumeWtValue)) {
//       chargeableWt = parseFloat(grossWtValue).toFixed(2);
//     } else {
//       chargeableWt = parseFloat(volumeWtValue).toFixed(2);
//     }
//   }

//   // Update the state with the calculated chargeable weight
//   setStateVariable((prev) => ({
//     ...prev,
//     chargeableWt: chargeableWt,      // Update Chargeable Weight in state
//   }));

//   // Update the values object with the calculated chargeable weight
//   const updatedValues = {
//     ...values,
//     chargeableWt: chargeableWt,      // Set Chargeable Weight in values
//   };

//   return {
//     isCheck: true,
//     type: "success",
//     message: "Chargeable weight set successfully.",
//     values: updatedValues,
//     alertShow: false,
//     fieldName: fieldName,
//     newState: newState,
//   };
// };

const wtCompareGrossWtVolWt = async (obj) => {
  const {
    args,
    values,
    fieldName,
    newState,
    formControlData,
    setStateVariable,
  } = obj;
  // Extract the field names for GrossWt and volumeWt from args
  const argNames = args.split(",").map((arg) => arg.trim());
  const GrossWt = argNames[0];
  const volumeWt = argNames[1];
  const chargeableWt = argNames[2];
  let grossWtValue = newState[GrossWt] || 0;
  let volumeWtValue = newState[volumeWt] || 0;
  grossWtValue = grossWtValue ? parseFloat(grossWtValue) : 0;
  volumeWtValue = volumeWtValue ? parseFloat(volumeWtValue) : 0;
  let chargeWt = 0;
  if (grossWtValue > 0 && volumeWtValue === 0) {
    chargeWt = grossWtValue.toFixed(2);
  } else if (volumeWtValue > 0 && grossWtValue === 0) {
    chargeWt = volumeWtValue.toFixed(2);
  } else if (grossWtValue > 0 && volumeWtValue > 0) {
    chargeWt = Math.max(grossWtValue, volumeWtValue).toFixed(2);
  }
  setStateVariable((prev) => ({
    ...prev,
    chargeableWt: chargeWt,
  }));
  const updatedValues = {
    ...values,
    chargeableWt: chargeableWt,
  };

  return {
    isCheck: true,
    type: "success",
    message: "Chargeable weight set successfully.",
    values: updatedValues,
    alertShow: false,
    fieldName: fieldName,
    newState: newState,
  };
};

const setCalculateVolume = async (obj) => {
  const { values, fieldName, newState, setStateVariable } = obj;

  let volumeTotal = 0;
  let volumeWTotal = 0;

  // Iterate over each row to calculate total volume and volumetric weight
  values.forEach((row) => {
    const volume = parseFloat(row.volume) || 0; // Parse volume, default to 0 if NaN
    const volumeWt = parseFloat(row.volumeWt) || 0; // Parse volume weight, default to 0 if NaN

    volumeTotal += volume; // Accumulate total volume
    volumeWTotal += volumeWt; // Accumulate total volumetric weight
  });

  // Updating the state with the calculated totals
  setStateVariable({
    ...newState,
    volumeTotal: volumeTotal.toFixed(3), // Format to 3 decimal places
    volumeWTotal: volumeWTotal.toFixed(3), // Format to 3 decimal places
  });
};

const currency1 = async (obj) => {
  const {
    args,
    fieldName,
    values,
    newState,
    formControlData,
    setFormControlData,
    setStateVariable,
  } = obj;
  const argNames = args.split(",").map((arg) => arg.trim());
  const companyName = newState[argNames[0]];
  const { clientCode } = getUserDetails();

  // Prepare the request to fetch the currencyId for the given company
  const requestData = {
    columns: "currencyId",
    tableName: "tblCompany",
    whereCondition: `id = ${companyName} and status = 1`,
    clientIdCondition: `clientId IN (${clientId}, (SELECT id FROM tblClient WHERE clientCode = 'SYSCON')) FOR JSON PATH, INCLUDE_NULL_VALUES`,
  };

  try {
    // Fetch the currency data from the API
    const fetchedCurrency = await fetchReportData(requestData);
    const currency = fetchedCurrency?.data?.[0]?.currencyId;

    if (!currency) {
      return {
        isCheck: false,
        type: "error",
        message: "Currency data is missing",
        values: values,
        alertShow: true,
        fieldName: fieldName,
        newState: newState,
      };
    }

    // Prepare request to fetch the currency label (code) from tblMasterData

    const requestData2 = {
      columns: "code",
      tableName: "tblMasterData",
      whereCondition: `id = ${currency} and status = 1`,
      clientIdCondition: `clientId IN (${clientId}, (SELECT id FROM tblClient WHERE clientCode = 'SYSCON')) FOR JSON PATH, INCLUDE_NULL_VALUES`,
    };

    // Fetch the currency code (label) from the API
    const currencyCode = await fetchReportData(requestData2);
    console.log("Fetched Currency Code Data:", currencyCode); // Log to verify currency code

    const currencyLabel = currencyCode?.data?.[0]?.code;

    // Update the newState with the currencyId and currencyLabel
    //newState[argNames[1]] = currency;
    values[argNames[1]] = currency;

    const currencyIddropdown = {
      value: currency,
      label: currencyLabel, // Default to "N/A" if label is missing
    };

    setStateVariable((prev) => ({
      ...prev,
      [argNames[1]]: currency,
      currencyIddropdown: currencyIddropdown,
    }));

    const updatedValues = {
      ...values,
      [argNames[1]]: currency,
      currencyIddropdown: currencyIddropdown,
    };

    console.log("Updated values", updatedValues); // Log to verify updated values

    // Prepare and return the result
    return {
      isCheck: true,
      type: "success",
      message: "Currency Field Updated!",
      values: updatedValues,
      formControlData: formControlData,
      alertShow: true,
      fieldName: fieldName,
      newState: {
        ...newState,
        currencyId: currency,
        currencyIddropdown: currencyIddropdown,
      },
    };
  } catch (error) {
    console.error("Error fetching currency data:", error);

    // Handle the error case by returning an error result
    return {
      isCheck: false,
      type: "error",
      message: "Failed to update currency field",
      values: values,
      alertShow: true,
      fieldName: fieldName,
    };
  }
};

// const dueToFunc = async (obj) => {
//   const {
//     args,
//     values,
//     fieldName,
//     newState,
//     formControlData,
//     setStateVariable,
//   } = obj;

//   const argNames = args.split(",").map((arg) => arg.trim());
//   const dueTo = argNames[0];
//   const charge = values[fieldName];
//   const { clientCode } = getUserDetails();
//   const requestBody = {
//     tableName: "tblCharge",
//     whereCondition: {
//       _id: charge,
//       clientCode: clientCode,
//     },
//     projection: {
//       dueTo: 1,
//     },
//   };

//   try {
//     const response = await fetchDataAPI(requestBody);
//     const data = response.data;
//     const dueToValue = data[0].dueTo;
//     if (dueToValue != undefined || dueToValue != null) {
//       const dueToRequestBody = {
//         tableName: "tblMasterData",
//         whereCondition: {
//           _id: dueToValue,
//           clientCode: clientCode,
//         },
//         projection: {
//           name: 1,
//         },
//       };
//       try {
//         const dueToResponse = await fetchDataAPI(dueToRequestBody);
//         const dueToData = dueToResponse.data;
//         const dueToName = dueToData[0].name;

//         const updatedValues = {
//           ...values,
//           dueTo: dueToValue,
//           dueToIddropdown: dueToName,
//         };
//         setStateVariable((prev) => ({
//           ...prev,
//           dueTo: dueToValue,
//           dueToIddropdown: dueToName,
//         }));

//         return {
//           type: "success",
//           result: true,
//           newState: {
//             ...newState,
//           },
//           values: updatedValues,
//           message: "Data found !",
//         };
//       } catch (error) {
//         return {
//           isCheck: false,
//           type: "error",
//           message: "Error fetching company parameters",
//           alertShow: false,
//           fieldName: fieldName,
//           values: values,
//           newState: newState,
//           formControlData: formControlData,
//         };
//       }
//     }

//     const updatedValues = {
//       ...values,
//       dueTo: null,
//       dueToIddropdown: null,
//     };
//     setStateVariable((prev) => ({
//       ...prev,
//       dueTo: null,
//       dueToIddropdown: null,
//     }));

//     return {
//       type: "success",
//       result: true,
//       newState: {
//         ...newState,
//       },
//       values: updatedValues,
//       message: "Data found !",
//     };
//   } catch (error) {
//     return {
//       isCheck: false,
//       type: "error",
//       message: "Error fetching company parameters",
//       alertShow: false,
//       fieldName: fieldName,
//       values: values,
//       newState: newState,
//       formControlData: formControlData,
//     };
//   }
// };
const dueToFunc = (obj) => {
  const {
    args,
    values,
    fieldName,
    newState,
    formControlData,
    setStateVariable,
  } = obj;

  const argNames = args.split(",").map((arg) => arg.trim());
  const dueTo = argNames[0];
  const charge = values[fieldName];
  const { clientCode } = getUserDetails();
  const requestBody = {
    tableName: "tblCharge",
    whereCondition: {
      _id: charge,
      clientCode: clientCode,
    },
    projection: {
      dueTo: 1,
    },
  };

  return fetchDataAPI(requestBody)
    .then((response) => {
      const data = response.data;
      const dueToValue = data[0].dueTo;

      if (dueToValue !== undefined && dueToValue !== null) {
        const dueToRequestBody = {
          tableName: "tblMasterData",
          whereCondition: {
            _id: dueToValue,
            clientCode: clientCode,
          },
          projection: {
            name: 1,
          },
        };

        return fetchDataAPI(dueToRequestBody)
          .then((dueToResponse) => {
            const dueToData = dueToResponse.data;
            const dueToName = dueToData[0].name;

            const updatedValues = {
              ...values,
              dueTo: dueToValue,
              dueToIddropdown: dueToName,
            };
            setStateVariable((prev) => ({
              ...prev,
              dueTo: dueToValue,
              dueToIddropdown: dueToName,
            }));

            return {
              type: "success",
              result: true,
              newState: {
                ...newState,
              },
              values: updatedValues,
              message: "Data found !",
            };
          })
          .catch((error) => {
            return {
              isCheck: false,
              type: "error",
              message: "Error fetching company parameters",
              alertShow: false,
              fieldName: fieldName,
              values: values,
              newState: newState,
              formControlData: formControlData,
            };
          });
      } else {
        const updatedValues = {
          ...values,
          dueTo: null,
          dueToIddropdown: null,
        };
        setStateVariable((prev) => ({
          ...prev,
          dueTo: null,
          dueToIddropdown: null,
        }));

        return {
          type: "success",
          result: true,
          newState: {
            ...newState,
          },
          values: updatedValues,
          message: "Data found !",
        };
      }
    })
    .catch((error) => {
      return {
        isCheck: false,
        type: "error",
        message: "Error fetching company parameters",
        alertShow: false,
        fieldName: fieldName,
        values: values,
        newState: newState,
        formControlData: formControlData,
      };
    });
};

const setExchangeRateNew = async (obj) => {
  const {
    args,
    fieldName,
    newState,
    values,
    formControlData,
    setStateVariable,
  } = obj;

  const argNames = args.split(",").map((arg) => arg.trim());

  const parentCurrencyId = newState.currencyId;
  const parentExchangeRate = newState.exchangeRate;

  const { companyId, clientCode } = getUserDetails();

  const requestData = {
    tableName: "tblCompanyParameter",
    whereCondition: {
      clientCode: clientCode,
      status: 1,
      companyId: companyId,
      currencyId: parentCurrencyId,
    },
    projection: {},
  };

  const isHomeCurrency = await fetchDataAPI(requestData);

  console.log("is home currency", isHomeCurrency);
  console.log("is home currency length", isHomeCurrency.data.length);

  const isBuyCurrency = argNames[0] === "buyCurrencyId";
  const isSellCurrency = argNames[0] === "sellCurrencyId";

  if (isBuyCurrency) {
    // Logic for buyExchangeRate
    if (
      values.buyCurrencyId === parentCurrencyId &&
      values.buyExchangeRate !== 1
    ) {
      values.buyExchangeRate = 1;
    } else if (
      isHomeCurrency.data &&
      Array.isArray(isHomeCurrency.data) &&
      isHomeCurrency.data.length > 0
    ) {
      console.log("Setting buy exchange rate based on buy currency");

      const exchangeRateRequestData = {
        tableName: "tblExchangeRate",
        whereCondition: {
          clientCode: clientCode,
          status: 1,
          fromCurrencyId: parentCurrencyId,
          toCurrencyId: values.buyCurrencyId,
        },
        projection: {
          exportExchangeRate: 1,
        },
      };

      const fetchedData = await fetchDataAPI(exchangeRateRequestData);
      const buyExchangeRateFromMaster = fetchedData.data[0]?.exportExchangeRate;

      console.log("buyExchangeRateFromMaster", buyExchangeRateFromMaster);
      buyExchangeRateFromMaster
        ? (values.buyExchangeRate = buyExchangeRateFromMaster)
        : 1;
    } else if (isHomeCurrency.data.length == 0) {
      const exchangeRate = (1 / parentExchangeRate).toFixed(3);
      values.buyExchangeRate = parseFloat(exchangeRate);
    } else {
      values.buyExchangeRate = 1;
    }
  } else if (isSellCurrency) {
    // Logic for sellExchangeRate
    if (
      values.sellCurrencyId === parentCurrencyId &&
      values.sellExchangeRate !== 1
    ) {
      values.sellExchangeRate = 1;
    } else if (
      isHomeCurrency.data &&
      Array.isArray(isHomeCurrency.data) &&
      isHomeCurrency.data.length > 0
    ) {
      console.log("Setting sell exchange rate based on sell currency");
      const sellExchangeRateRequestData = {
        tableName: "tblExchangeRate",
        whereCondition: {
          clientCode: clientCode,
          status: 1,
          fromCurrencyId: parentCurrencyId,
          toCurrencyId: values.sellCurrencyId,
        },
        projection: {
          exportExchangeRate: 1,
        },
      };

      const fetchedSellData = await fetchDataAPI(sellExchangeRateRequestData);
      const sellExchangeRateFromMaster =
        fetchedSellData.data[0]?.exportExchangeRate;

      console.log("sellExchangeRateFromMaster", sellExchangeRateFromMaster);
      sellExchangeRateFromMaster
        ? (values.sellExchangeRate = sellExchangeRateFromMaster)
        : 1;
    } else if (isHomeCurrency.data.length == 0) {
      const exchangeRate = (1 / parentExchangeRate).toFixed(3);
      values.sellExchangeRate = parseFloat(exchangeRate);
    } else {
      values.sellExchangeRate = 1;
    }
  } else {
    console.log("no currency");
  }

  setStateVariable((prev) => ({
    ...prev,
    values: values,
  }));

  return {
    isCheck: true,
    type: "success",
    message: "Exchange rates updated successfully",
    alertShow: true,
    fieldName: fieldName,
    newState: newState,
    values: values,
    formControlData: formControlData,
  };
};
const setTaxCalculationbk = async (obj) => {
  let {
    args,
    newState,
    formControlData,
    setFormControlData,
    values,
    fieldName,
    tableName,
    setStateVariable,
  } = obj;

  let argNames;
  let splitArgs = [];
  if (
    args === undefined ||
    args === null ||
    args === "" ||
    (typeof args === "object" && Object.keys(args).length === 0)
  ) {
    argNames = args;
  } else {
    argNames = args.split(",").map((arg) => arg.trim());
    for (const iterator of argNames) {
      splitArgs.push(iterator.split("."));
    }
  }
  const calculateTax = argNames[0];
  const calculateTaxValue = newState[calculateTax];

  // If calculateTaxValue is false, set tax to 0
  if (!calculateTaxValue) {
    const gridData = newState.tblRateRequestCharge;
    // Map through the array and update buyTaxAmount to 0 for each object
    const updatedGridData = gridData.map((item) => {
      return {
        ...item,
        buyTaxAmount: 0, // Set buyTaxAmount to 0
      };
    });

    // Update the newState with the modified gridData
    setStateVariable((prevState) => ({
      ...prevState,
      tblRateRequestCharge: updatedGridData, // Set updated gridData
    }));

    const updatedValues = {
      ...values,
      buyTaxAmount: 0, // Set the tax field in values as well
    };
    return {
      isCheck: false,
      type: "success",
      message:
        "Tax calculation skipped as calculateTaxValue is false. Tax field set to 0.",
      values: updatedValues,
      alertShow: false,
      newState: newState,
    };
  }

  const { rateRequestDate, businessSegmentId } = newState;
  const { chargeId, buyRate } = values;

  const request = {
    tableName: "tblCharge",
    whereCondition: {
      _id: chargeId,
      status: 1,
    },
    projection: {
      "tblChargeDetails.glId": 1,
    },
  };

  const response = await fetchDataAPI(request);
  const responseData = response.data[0].tblChargeDetails[0].glId;

  // Check if glId is missing
  if (!responseData) {
    setStateVariable((prev) => ({
      ...prev,
      buyTaxAmount: 0,
    }));
    const updatedValues = {
      ...values,
      buyTaxAmount: 0,
    };
    return {
      isCheck: true,
      type: "warning",
      message: "Tax set to 0 due to missing glId.",
      values: updatedValues,
      alertShow: false,
      newState: newState,
    };
  }

  const requestData = {
    glId: responseData,
    department: businessSegmentId,
  };

  const fetchTaxDetails = await getTaxDetailsQuotation(requestData);
  const taxRate = fetchTaxDetails?.taxDetails?.taxRate;

  // Check if taxRate is missing
  if (!taxRate) {
    setStateVariable((prev) => ({
      ...prev,
      buyTaxAmount: 0,
    }));
    const updatedValues = {
      ...values,
      buyTaxAmount: 0,
    };
    return {
      isCheck: true,
      type: "warning",
      message: "Tax set to 0 due to missing taxRate.",
      values: updatedValues,
      alertShow: false,
      newState: newState,
    };
  }

  const taxAmount = (taxRate * buyRate) / 100;
  setStateVariable((prev) => ({
    ...prev,
    buyTaxAmount: taxAmount,
  }));
  const updatedValues = {
    ...values,
    buyTaxAmount: taxAmount,
  };

  return {
    isCheck: true,
    type: "success",
    message: "Tax calculated successfully.",
    values: updatedValues,
    alertShow: false,
    newState: newState,
  };
};

const balanceUpdate = async (obj) => {
  const {
    args,
    values,
    fieldName,
    newState,
    formControlData,
    setStateVariable,
  } = obj;

  const argNames = args.split(",").map((arg) => arg.trim());
  const newNoOfPackages = parseInt(values[argNames[0]]);

  const currentRowIndex = newState.tblVehicleOrderDetails.findIndex(
    (detail) => detail.indexValue === values.indexValue
  );

  if (currentRowIndex === -1) {
    const updatedValues = {
      ...values,
      [argNames[1]]: newNoOfPackages,
    };
    setStateVariable((prev) => ({
      ...prev,
      [argNames[1]]: newNoOfPackages,
    }));
    return {
      values: updatedValues,
      type: "success",
      message: `Balance updated successfully`,
      alertShow: true,
      fieldName: fieldName,
      isCheck: false,
      newState: newState,
      formControlData: formControlData,
    };
  }

  const currentRow = newState.tblVehicleOrderDetails[currentRowIndex];
  const oldNoOfPackages = parseInt(currentRow.noOfPackages) || 0;
  const currentBalNoOfPackages = parseInt(values[argNames[1]]) || 0;
  const updatedBalNoOfPackages =
    newNoOfPackages - oldNoOfPackages + currentBalNoOfPackages;

  const updatedValues = {
    ...values,
    [argNames[1]]: updatedBalNoOfPackages,
  };
  setStateVariable((prev) => ({
    ...prev,
    [argNames[1]]: updatedBalNoOfPackages,
    // ),
  }));

  return {
    values: updatedValues,
    type: "success",
    message: `Balance updated successfully`,
    alertShow: true,
    fieldName: fieldName,
    isCheck: false,
    newState: newState,
    formControlData: formControlData,
  };
};
const setGLSacDetails = async (obj) => {
  const {
    args,
    values,
    fieldName,
    newState,
    formControlData,
    setStateVariable,
  } = obj;

  const requestBody = {
    chargeId: values?.chargeId,
    voucherTypeId: newState?.voucherTypeId,
  };

  const response = await getGLChargeDetails(requestBody);

  if (response.data && response.data.length > 0) {
    const glId = response.data[0]?.glId;
    const sacId = response.data[0]?.sacId;
    const glName = response.data[0]?.glName;
    const sacName = response.data[0]?.sacName;

    // update state with proper dropdown objects
    setStateVariable((prev) => ({
      ...prev,
      chargeGlId: glId,
      sacId: sacId,
      sacIddropDown: sacId ? [{ value: sacId, label: sacName }] : null,
      chargeGlIddropdown: glId ? [{ value: glId, label: glName }] : null,
    }));

    const updatedValues = {
      ...values,
      glId: glId,
      sacId: sacId,
      sacIddropDown: sacId ? [{ value: sacId, label: sacName }] : null,
      chargeGlIddropdown: glId ? [{ value: glId, label: glName }] : null,
    };

    return {
      values: updatedValues,
      type: "success",
      message: `GL and SAC details fetched successfully`,
      alertShow: true,
      fieldName: fieldName,
      isCheck: false,
      newState: newState,
      formControlData: formControlData,
    };
  } else {
    return {
      values,
      type: "warning",
      message: "No GL/SAC details found",
      alertShow: true,
      fieldName: fieldName,
      isCheck: false,
      newState,
      formControlData,
    };
  }
};

const checkVehicleGridDuplicate = (obj) => {
  const {
    args,
    values,
    fieldName,
    newState,
    formControlData,
    setStateVariable,
  } = obj;

  const argNames = args.split(",").map((arg) => arg.trim());
  const commodity = argNames[0];
  const commodityId = values[fieldName];
  const gridData = newState.tblVehicleRouteDetails;
  const label = newState.tblVehicleRouteDetails[0].commodityDropdown;

  // Check for duplicate commodityId in gridData
  const isDuplicate = gridData.some((item) => item.commodity === commodityId);

  if (isDuplicate) {
    //alert("Duplicate commodity");

    const fieldsToCheck = [fieldName].map((key) => `${key}dropdown`);

    fieldsToCheck.forEach((field) => {
      if (values.hasOwnProperty(field)) {
        if (Array.isArray(values[field])) {
          values[field].forEach((item) => {
            if (
              item &&
              typeof item === "object" &&
              item.hasOwnProperty("label")
            ) {
              // Set the label to null
              item.label = null;
            }
          });
        } else {
          // If the field is not an array, set it to null
          values[field] = null;
        }
      }
    });
    values[fieldName] = null;
    setStateVariable((prev) => ({
      ...prev,
      [fieldName]: null,
    }));

    return {
      isCheck: false,
      type: "error",
      newState: newState,
      values: values,
      message: "Duplicate commodity found. Relevant fields cleared.",
      alertShow: true,
      fieldName: fieldName,
      formControlData: formControlData,
    };
  }
  return {
    isCheck: true,
    type: "success",
    message: "Data is valid.",
    values: values,
    alertShow: false,
    newState: newState,
  };
};

const chargeableWtCal = async (obj) => {
  const {
    args,
    values,
    fieldName,
    newState,
    formControlData,
    setStateVariable,
  } = obj;

  const argNames = args.split(",").map((arg) => arg.trim());
  const noOfPackages = argNames[0];
  const length = argNames[1];
  const width = argNames[2];
  const height = argNames[3];
  const dimension = argNames[4];
  const grossWt = argNames[5];
  const volumeWt = argNames[6];
  const chargeableWt = argNames[7];
  const noOfPackageValue = values[noOfPackages];
  const lengthValue = values[length];
  const widthValue = values[width];
  const heightValue = values[height];
  const dimensionValue = values[dimension];
  const grossWtValue = parseFloat(values[grossWt]) || 0; // Handle null by setting to 0

  let volume = 0;
  let volumetricWeight = 0;
  const request = {
    columns: "*",
    tableName: "tblMasterData",
    whereCondition: `id = ${dimensionValue} and status = 1`,
    clientIdCondition: `clientId IN (4, (SELECT id FROM tblClient WHERE clientCode = 'SYSCON')) FOR JSON PATH`,
  };

  const response = await fetchReportData(request);
  if (response.success && response.data.length > 0) {
    const codes = response.data[0].code;
    if (
      lengthValue &&
      widthValue &&
      heightValue &&
      noOfPackageValue &&
      dimensionValue
    ) {
      if (codes === "CM") {
        volume =
          (lengthValue * widthValue * heightValue * noOfPackageValue) / 1000000;
        volumetricWeight =
          (lengthValue * widthValue * heightValue * noOfPackageValue) / 6000;
      } else if (codes === "MM") {
        volume =
          (lengthValue * widthValue * heightValue * noOfPackageValue) /
          1000000000;
        volumetricWeight =
          (lengthValue * widthValue * heightValue * noOfPackageValue) / 6000000;
      } else if (codes === "INCH") {
        volume =
          (lengthValue *
            widthValue *
            heightValue *
            noOfPackageValue *
            2.54 *
            2.54 *
            2.54) /
          1000000;
        volumetricWeight =
          (lengthValue * widthValue * heightValue * noOfPackageValue) / 366;
      }
    }
  }

  const formattedVolume = volume.toFixed(2);
  const formattedVolumetricWeight =
    parseFloat(volumetricWeight.toFixed(2)) || 0;
  let chargeableWeight = 0;
  if (grossWtValue > formattedVolumetricWeight) {
    chargeableWeight = grossWtValue.toFixed(2);
  } else {
    chargeableWeight = formattedVolumetricWeight.toFixed(2);
  }

  setStateVariable((prev) => ({
    ...prev,
    volume: formattedVolume,
    volumeWt: formattedVolumetricWeight,
    chargeableWt: chargeableWeight,
  }));

  const updatedValues = {
    ...values,
    volume: formattedVolume,
    volumeWt: formattedVolumetricWeight,
    chargeableWt: chargeableWeight,
  };
  return {
    isCheck: true,
    type: "success",
    message: "Calculation completed successfully.",
    values: updatedValues,
    alertShow: false,
    fieldName: fieldName,
    newState: newState,
  };
};

const quotationDateValidation = async (obj) => {
  const {
    args,
    values,
    fieldName,
    newState,
    formControlData,
    setStateVariable,
  } = obj;
  // Handle optional arguments
  let argNames = [];
  if (args && typeof args === "string") {
    argNames = args.split(",").map((arg) => arg.trim());
  }

  // Get the toast type from arguments (warning or error)
  const toastTypeArg = argNames[argNames.length - 1]?.toLowerCase();
  const messageType = toastTypeArg === "e" ? "error" : "warning";

  // Get yourlabel for both field names from formControlData.fields
  const label1Info = formControlData.fields.find(
    (field) => field.fieldname === argNames[0]
  );
  const label2Info = formControlData.fields.find(
    (field) => field.fieldname === argNames[1]
  );

  const label1 = label1Info ? label1Info.yourlabel : argNames[0];
  const label2 = label2Info ? label2Info.yourlabel : argNames[1];

  const date1Field = newState[argNames[0]];
  const idField = newState[argNames[1]];
  const tableName = argNames[2];
  const operator = argNames[3];
  const operatorMappings = {
    "<": "less than",
    ">": "greater than",
    "<=": "less than or equal to",
    ">=": "greater than or equal to",
    "==": "equal to",
    "!=": "not equal to",
  };

  // Fetch the second date from the API
  let fetchedDate2;
  try {
    const requestData = {
      columns: "*",
      tableName: `${tableName}`,
      whereCondition: `id = ${idField} and status = 1`,
      clientIdCondition: `clientId IN (${clientId}, (SELECT id FROM tblClient WHERE clientCode = 'SYSCON')) FOR JSON PATH`,
    };

    const fetchDateField = await fetchReportData(requestData);
    fetchedDate2 = fetchDateField.data[0].dateField;
  } catch (error) {
    console.error("Error fetching date from API:", error);
    return {
      type: "error",
      message: "Error fetching date information from API.",
      values: values,
      alertShow: true,
      fieldName: fieldName,
      isCheck: false,
      newState: newState,
      formControlData: formControlData,
    };
  }

  // Parse the dates
  const date1 = new Date(date1Field);
  const date2 = new Date(fetchedDate2);

  // Helper function to compare dates based on the operator
  const compareDates = (date1, date2, operator) => {
    switch (operator) {
      case "<":
        return date1 < date2;
      case ">":
        return date1 > date2;
      case "<=":
        return date1 <= date2;
      case ">=":
        return date1 >= date2;
      case "==":
        return date1.getTime() === date2.getTime();
      case "!=":
        return date1.getTime() !== date2.getTime();
      default:
        console.error("Invalid operator");
        return false;
    }
  };

  const comparisonResult = compareDates(date1, date2, operator);
  let endResult = {
    type: "success",
    values: values,
    isCheck: true,
    alertShow: false,
    fieldName: fieldName,
    newState: newState,
    formControlData: formControlData,
  };
  if (!comparisonResult) {
    const comparisonMessage = `${label1} should be ${operatorMappings[operator]} ${label2}.`;

    const updatedValues = {
      ...values,
      [fieldName]: "",
    };

    if (
      values[fieldName + "dropdown"] &&
      Array.isArray(values[fieldName + "dropdown"])
    ) {
      values[fieldName + "dropdown"].forEach((item) => {
        if (item && typeof item === "object") {
          item.label = ""; // Clear the label if needed
        }
      });
    }

    setStateVariable((prev) => ({
      ...prev,
      [fieldName]: "",
    }));

    endResult = {
      isCheck: false,
      type: messageType,
      message: comparisonMessage,
      values: updatedValues,
      alertShow: true,
      fieldName: fieldName,
      newState: newState,
      formControlData: formControlData,
    };
    console.error(comparisonMessage);
  }

  return endResult;
};
const ChargeHeadToChargeDesc = async (obj) => {
  const {
    args,
    values,
    fieldName,
    newState,
    formControlData,
    setFormControlData,
    setStateVariable,
  } = obj;
  const argNames = args.split(",").map((arg) => arg.trim());
  let [originCol, tableName, chargeDescription] = argNames;
  let chargeId = values[originCol];
  const Description = argNames[2];
  const descriptionLL = argNames[3];
  const token = localStorage.getItem("token");

  const request = {
    columns: "*",
    tableName: tableName,
    whereCondition: `id = ${chargeId} and status = 1`,
    clientIdCondition: `clientId IN (${clientId}, (SELECT id FROM tblClient WHERE clientCode = 'SYSCON')) FOR JSON PATH`,
  };
  return fetchReportData(request).then((response) => {
    const data = response.data;
    const dueToValue = data[0]?.name;
    const chargeNameLL = data[0]?.chargeNameLL;
    if (dueToValue !== undefined && dueToValue !== null) {
      const updatedValues = {
        ...values,
        [argNames[2]]: dueToValue,
        [argNames[3]]: chargeNameLL,
      };
      setStateVariable((prev) => ({
        ...prev,
        [argNames[2]]: dueToValue,
        [argNames[3]]: chargeNameLL,
      }));

      return {
        type: "success",
        result: true,
        newState: {
          ...newState,
        },
        values: updatedValues,
        message: "Data found !",
      };
    }
  });
};

const validateNonZeroValue = (obj) => {
  const {
    args,
    values,
    fieldName,
    formControlData,
    newState,
    setStateVariable,
  } = obj;

  const argNames = args.split(",").map((arg) => arg.trim());
  const condition = argNames[1]; // Expecting >=0 or >0

  const popupType = argNames?.[argNames.length - 1]?.toLowerCase();
  let popup = "error";
  if (popupType === "w") {
    popup = "warning";
  }

  const field = formControlData?.fields?.find((f) => f.fieldname === fieldName);
  const yourlabel = field ? field.yourlabel : fieldName;

  let fieldValue;
  if (fieldName) {
    fieldValue = newState?.[fieldName] ?? values?.[fieldName];
  }

  // Ensure valid number before proceeding
  if (fieldValue !== "" && !isNaN(fieldValue) && fieldValue !== null) {
    const CntrlValue = Number(fieldValue);

    if (condition === ">=0" && CntrlValue < 0) {
      const message = `${yourlabel} must be zero or greater.`;

      if (popup === "warning") {
        //toast.warning(message); // Show toast message
        return {
          isCheck: false,
          type: "warning",
          message: message,
          alertShow: true,
          fieldName,
          values,
          newState,
          formControlData,
        };
      } else {
        // Reset field and update state
        const updatedValues = { ...values, [fieldName]: "" };

        setStateVariable((prev) => ({
          ...prev,
          [fieldName]: "",
        }));

        //toast.error(message); // Show toast message

        return {
          isCheck: false,
          type: "error",
          message: message,
          alertShow: true,
          values: updatedValues,
          fieldName: fieldName,
          newState: newState,
          formControlData: formControlData,
        };
      }
    }

    if (condition === ">0" && CntrlValue <= 0) {
      const message = `${yourlabel} must be greater than zero.`;

      if (popup === "warning") {
        toast.warning(message); // Show toast message
        return {
          isCheck: false,
          type: "warning",
          message,
          alertShow: true,
          fieldName,
          values,
          newState,
          formControlData,
        };
      } else {
        // Reset field and update state
        const updatedValues = { ...values, [fieldName]: "" };

        setStateVariable((prev) => ({
          ...prev,
          [fieldName]: "",
        }));

        toast.error(message); // Show toast message

        return {
          values: updatedValues,
          isCheck: false,
          type: "error",
          message,
          alertShow: true,
          fieldName,
          newState,
          formControlData,
        };
      }
    }
  } else if (fieldValue !== "" && isNaN(fieldValue)) {
    const message =
      "Please enter a valid number. No special characters or alphabets allowed.";

    // Invalid input: Reset field and update state
    const updatedValues = { ...values, [fieldName]: "" };

    setStateVariable((prev) => ({
      ...prev,
      [fieldName]: "",
    }));

    toast.error(message); // Show toast message

    return {
      values: updatedValues,
      isCheck: false,
      type: "error",
      message,
      alertShow: true,
      fieldName,
      newState,
      formControlData,
    };
  }

  // Default return if no issues are found
  return {
    isCheck: true,
    message: "",
    alertShow: false,
    fieldName,
    values,
    newState,
    formControlData,
  };
};

const validateIntegerValue = async (obj) => {
  const {
    args,
    values,
    fieldName,
    formControlData,
    newState,
    setStateVariable,
  } = obj;

  let argNames;
  if (!args || (typeof args === "object" && Object.keys(args).length === 0)) {
    argNames = args;
  } else {
    argNames = args.split(",").map((arg) => arg.trim());
  }

  const popupType = argNames?.[argNames.length - 1]?.toLowerCase();
  let popup = "error";
  if (popupType === "w") {
    popup = "warning";
  }

  const field = formControlData?.fields?.find((f) => f.fieldname === fieldName);
  const yourlabel = field ? field.yourlabel : fieldName;

  const fieldValue = newState[fieldName] ?? values[fieldName];

  // Ensure valid integer before proceeding
  if (fieldValue !== "" && !isNaN(fieldValue) && fieldValue !== null) {
    const CntrlValue = Number(fieldValue);

    if (!Number.isInteger(CntrlValue) || CntrlValue <= 0) {
      if (popup === "warning") {
        return {
          isCheck: false,
          type: "warning",
          message: `${yourlabel} must be a positive integer. Are you sure you want to continue?`,
          alertShow: true,
          fieldName,
          values,
          newState,
          formControlData,
        };
      } else {
        // Error case: Reset field and update state
        if (newState[fieldName] !== "" || values[fieldName] !== "") {
          const updatedValues = { ...values, [fieldName]: "" };

          setStateVariable((prev) => ({
            ...prev,
            [fieldName]: "",
          }));

          return {
            values: updatedValues,
            isCheck: false,
            type: "error",
            message: "Value must be a positive integer.",
            alertShow: true,
            fieldName,
            newState,
            formControlData,
          };
        }
      }
    }
  } else if (fieldValue !== "" && isNaN(fieldValue)) {
    // Invalid input: Reset field and update state
    const updatedValues = { ...values, [fieldName]: "" };

    setStateVariable((prev) => ({
      ...prev,
      [fieldName]: "",
    }));

    return {
      values: updatedValues,
      isCheck: false,
      type: "error",
      message:
        "Please enter a valid number. No special characters, decimals, or alphabets allowed.",
      alertShow: true,
      fieldName,
      newState,
      formControlData,
    };
  }

  // Default return if no issues are found
  return {
    isCheck: true,
    message: "",
    alertShow: false,
    fieldName,
    values,
    newState,
    formControlData,
  };
};

const validateFields = async (obj) => {
  let result = await validateIntegerValue(obj);
  if (result.isCheck) {
    result = await validateNegativeValue(obj);
  }
  return result;
};

const setSameSizeValues = (obj) => {
  let { args, formControlData, values, newState } = obj;
  // debugger
  let argsArray = args.split(",");
  let condition = argsArray[argsArray.length - 1];
  let fieldCondition = argsArray[argsArray.length - 2];
  let fieldName = fieldCondition?.slice(0, -8);
  let regex = /Dropdown/i;
  let transformedString = fieldCondition?.replace(regex, "dropdown");

  switch (condition) {
    case "pp": {
      let getterSize = newState[fieldName];
      const sizeIds = getterSize;

      const getterTbl = formControlData.fields.find(
        (item) => item.fieldname === fieldName
      );
      if (!getterTbl) {
        return {
          isCheck: false,
          type: "success",
          message: "Error",
          alertShow: false,
          fieldName: fieldName,
          values: values,
          newState: newState,
          formControlData: formControlData,
        };
      }
      const getterDropDown = getterTbl.dropdownFilter;
      const setterTbl = formControlData.fields.find(
        (item) => item.fieldname === argsArray[1]
      );

      const dropFilterValueWithoutBraces = getterDropDown.replace(/[{}]/g, "");
      const editedString = `${dropFilterValueWithoutBraces} and ${Array.isArray(sizeIds)
          ? `id in (${sizeIds.join(",")})`
          : `id = ${sizeIds}`
        } `;

      console.log("editedString", editedString);

      if (editedString.trim()) {
        setterTbl.dropdownFilter = editedString;
      }

      return {
        isCheck: false,
        type: "success",
        message: "Error",
        alertShow: false,
        fieldName: fieldName,
        values: values,
        newState: newState,
        formControlData: formControlData,
      };
    }
    case "pc": {
      let getterSize = newState[fieldName];
      const sizeIds = getterSize;

      const getterTbl = formControlData.fields.find(
        (item) => item.fieldname === fieldName
      );
      if (!getterTbl) {
        return {
          isCheck: false,
          type: "success",
          message: "Error",
          alertShow: false,
          fieldName: fieldName,
          values: values,
          newState: newState,
          formControlData: formControlData,
        };
      }
      const getterDropDown = getterTbl.dropdownFilter;
      const setterTbl = formControlData.child.find(
        (item) => item.tableName === argsArray[1]
      );
      const setterField = setterTbl?.fields.find(
        (item) => item.fieldname === fieldName
      );

      const dropFilterValueWithoutBraces = getterDropDown.replace(/[{}]/g, "");
      const editedString = `${dropFilterValueWithoutBraces} and ${Array.isArray(sizeIds)
          ? `id in (${sizeIds.join(",")})`
          : `id = ${sizeIds}`
        } `;

      if (editedString.trim()) {
        setterField.dropdownFilter = editedString;
      }

      return {
        isCheck: false,
        type: "success",
        message: "Error",
        alertShow: false,
        fieldName: fieldName,
        values: values,
        newState: newState,
        formControlData: formControlData,
      };
    }
    case "cc": {
      let getterSize = newState[argsArray[0]];
      let currentSize =
        values &&
          Array.isArray(values.sizeIddropdown) &&
          values.sizeIddropdown.length > 0
          ? values.sizeIddropdown[0].label
          : "";

      // Function to determine the correct label based on indexValue comparison
      const determineLabel = (item) => {
        // Check if values exist and if the indexValue matches
        if (values && values.indexValue === item.indexValue) {
          return values.sizeIddropdown && values.sizeIddropdown.length > 0
            ? values.sizeIddropdown[0].label
            : ""; // Handle cases where sizeIddropdown might be empty
        } else {
          // Otherwise, take label from item in getterSize
          return Array.isArray(item.sizeIddropdown) &&
            item.sizeIddropdown.length > 0
            ? item.sizeIddropdown[0].label
            : item[fieldCondition]; // Fallback to fieldCondition if no sizeIddropdown
        }
      };

      let sizeIds = getterSize.map(determineLabel);

      let flattenedArray = sizeIds.flatMap((item) =>
        Array.isArray(item) ? item : [item]
      );

      const allSizes = [currentSize, ...flattenedArray];

      // Convert each element to a number if possible
      let uniqueNumbers = [
        ...new Set(
          allSizes.map((item) => (isNaN(Number(item)) ? item : Number(item)))
        ),
      ];

      const getterTbl = formControlData.child.find(
        (item) => item.tableName === argsArray[0]
      );
      if (!getterTbl) {
        return {
          isCheck: false,
          type: "success",
          message: "Error",
          alertShow: false,
          fieldName: fieldName,
          values: values,
          newState: newState,
          formControlData: formControlData,
        };
      }
      const getterField = getterTbl.fields.find(
        (item) => item.fieldname === fieldName
      );
      const getterDropDown = getterField ? getterField.dropdownFilter : "";

      const setterTbl = formControlData.child.find(
        (item) => item.tableName === argsArray[1]
      );
      const setterField = setterTbl?.fields.find(
        (item) => item.fieldname === fieldName
      );

      const dropFilterValueWithoutBraces = getterDropDown.replace(/[{}]/g, "");
      const nameObject = `and name in (${uniqueNumbers
        .map((item) => `'${item}'`)
        .join(",")})`;

      // Construct the editedString
      const editedString = `${dropFilterValueWithoutBraces} ${nameObject}`;
      console.log("same size editedString:", editedString);
      if (editedString.trim()) {
        setterField.dropdownFilter = editedString;
      }

      return {
        isCheck: false,
        type: "success",
        message: "Error",
        alertShow: false,
        fieldName: fieldName,
        values: values,
        newState: newState,
        formControlData: formControlData,
      };
    }

    case "cp": {
      let getterSize = newState[argsArray[0]];
      let currentSize =
        values &&
          Array.isArray(values.sizeIddropdown) &&
          values.sizeIddropdown.length > 0
          ? values.sizeIddropdown[0].label
          : "";

      // Function to determine the correct label based on indexValue comparison
      const determineLabel = (item) => {
        // Check if values exist and if the indexValue matches
        if (values && values.indexValue === item.indexValue) {
          return values.sizeIddropdown && values.sizeIddropdown.length > 0
            ? values.sizeIddropdown[0].label
            : ""; // Handle cases where sizeIddropdown might be empty
        } else {
          // Otherwise, take label from item in getterSize
          return Array.isArray(item.sizeIddropdown) &&
            item.sizeIddropdown.length > 0
            ? item.sizeIddropdown[0].label
            : item[fieldCondition]; // Fallback to fieldCondition if no sizeIddropdown
        }
      };

      let sizeIds = getterSize.map(determineLabel);

      let flattenedArray = sizeIds.flatMap((item) =>
        Array.isArray(item) ? item : [item]
      );

      const allSizes = [currentSize, ...flattenedArray];
      // Convert each element to a number if possible
      let uniqueNumbers = [...new Set(allSizes.map((item) => item))];
      if (!getterTbl) {
        return {
          isCheck: false,
          type: "success",
          message: "Error",
          alertShow: false,
          fieldName: fieldName,
          values: values,
          newState: newState,
          formControlData: formControlData,
        };
      }
      const getterTbl = formControlData.child.find(
        (item) => item.tableName === argsArray[0]
      );
      const getterField = getterTbl.fields.find(
        (item) => item.fieldname === fieldName
      );
      const getterDropDown = getterField.dropdownFilter;

      const setterTbl = formControlData.fields.find(
        (item) => item.fieldname === fieldName
      );

      const dropFilterValueWithoutBraces = getterDropDown.replace(/[{}]/g, "");
      const nameObject = `and name in (${uniqueNumbers
        .map((item) => `'${item}'`)
        .join(",")})`;

      // Construct the editedString
      const editedString = `${dropFilterValueWithoutBraces} ${nameObject}`;

      if (editedString.trim()) {
        setterTbl.dropdownFilter = editedString;
        return {
          isCheck: false,
          type: "success",
          message: "Error",
          alertShow: false,
          fieldName: fieldName,
          values: values,
          newState: newState,
          formControlData: formControlData,
        };
      }
    }
    default:
      break;
  }
  return {
    isCheck: false,
    type: "success",
    message: "Error",
    alertShow: false,
    fieldName: fieldName,
    values: values,
    newState: newState,
    formControlData: formControlData,
  };
};

// const setSameTypeValues = (obj) => {
//   let { args, formControlData, values = {}, fieldName = "", newState } = obj;

//   let argsArray = args.split(",");
//   let parentField = newState[argsArray[0]] || [];
//   let currentId = values.sizeId || null;
//   let dynamicDropdown = argsArray[2] + "Dropdown";
//   let dynamicdropdown = argsArray[2] + "dropdown";
//   let parentFilter =
//     obj.formControlData.child
//       .find((item) => item.tableName === argsArray[0])
//       ?.fields.find((item) => item.fieldname === argsArray[2])
//       ?.dropdownFilter || "";

//   let typeNames = parentField
//     .filter((item) => item.sizeId === currentId)
//     .map((item) => item[dynamicDropdown]);
//   let typeName = parentField
//     .filter((item) => item.sizeId === currentId)
//     .map((item) => item[dynamicdropdown])
//     .filter((item) => Array.isArray(item))
//     .flat()
//     .map((item) => item.label);
//   let labels = [];
//   parentField
//     .filter((item) => item.sizeId === currentId)
//     .forEach((item) => {
//       // Check if typeIddropdown is present and has at least one element
//       if (item.typeIddropdown && item.typeIddropdown.length > 0) {
//         // Take the label from the first element of typeIddropdown
//         labels.push(item.typeIddropdown[0].label);
//       } else {
//         // Take the label from typeIdDropdown
//         labels.push(item.typeIdDropdown);
//       }
//     });
//   // console.log(labels);
//   const isOnLoad =
//     values?.sizeId &&
//     values?.sizeId.trim() !== "" &&
//     values?.typeId &&
//     values?.typeId.trim() !== "";

//   const combinedArray = [labels];
//   const uniqueValues = [
//     ...new Set(
//       combinedArray.filter((value) => value !== null && value !== undefined)
//     ),
//   ];
//   const uniqueIds = Array.from(new Set(typeNames));
//   let childField =
//     formControlData.child.find(
//       (item) => item.tableName.toLowerCase() === argsArray[1].toLowerCase()
//     )?.fields || [];
//   let childObj =
//     childField.find((item) => item.fieldname === argsArray[2]) || {};
//   childObj.dropdownFilter = "";
//   const cleanedStr = parentFilter.replace(/["{}]/g, "");
//   let flattenedArray = uniqueValues.flatMap((item) =>
//     Array.isArray(item) ? item : [item]
//   );
//   let uniqueNumbers = [...new Set(flattenedArray.map((item) => item))];
//   // const nameObject = {
//   //   $in: uniqueNumbers,
//   // };
//   const nameObject = `and name in (${uniqueNumbers
//     .map((item) => `'${item}'`)
//     .join(",")})`;
//   const editedString = `${cleanedStr} ${nameObject}`;
//   console.log("same type editedString:", editedString);
//   // if (currentId && uniqueIds.length > 0 && values.sizeId !== "") {

//   //       }
//   if (editedString.trim() && uniqueNumbers.length > 0) {
//     childObj.dropdownFilter = editedString;
//     console.log("setSame:", childObj.dropdownFilter);

//     return {
//       isCheck: false,
//       type: "success",
//       message: "Error",
//       alertShow: false,
//       fieldName: fieldName,
//       values: values,
//       newState: newState,
//       formControlData: formControlData,
//     };
//   }
//   return {
//     isCheck: false,
//     type: "success",
//     message: "Error",
//     alertShow: false,
//     fieldName: fieldName,
//     values: values,
//     newState: newState,
//     formControlData: formControlData,
//   };
// };

const setSameTypeValues = (obj) => {
  const { args, formControlData, values = {}, fieldName = "", newState } = obj;
  const [parentTable, childTable, filterField] = args.split(",");

  const parentField = newState[parentTable] || [];
  const currentId = values.sizeId || null;

  const dropdownKeyUpper = filterField + "Dropdown";
  const dropdownKeyLower = filterField + "dropdown";

  // Find the parent filter string (from existing dropdownFilter)
  const parentFilter =
    formControlData.child
      ?.find((item) => item.tableName === parentTable)
      ?.fields.find((item) => item.fieldname === filterField)?.dropdownFilter ||
    "";

  // Gather dropdown labels
  const filteredItems = parentField.filter(
    (item) => item.fieldname === currentId
  );

  const labels = filteredItems
    .map((item) => {
      const dropdownArray = item[dropdownKeyLower];
      if (Array.isArray(dropdownArray) && dropdownArray.length > 0) {
        return dropdownArray[0]?.label;
      }
      return item[dropdownKeyUpper]; // fallback to non-array version
    })
    .filter(Boolean); // remove null/undefined

  const uniqueLabels = [...new Set(labels)];

  const nameCondition = uniqueLabels.length
    ? `and name in (${uniqueLabels.map((l) => `'${l}'`).join(",")})`
    : "";

  const cleanedFilter = parentFilter.replace(/["{}]/g, "");
  const finalFilter = `${cleanedFilter} ${nameCondition}`.trim();

  const childFields =
    formControlData.child.find(
      (item) => item.tableName.toLowerCase() === childTable.toLowerCase()
    )?.fields || [];

  const childField = childFields.find((item) => item.fieldname === filterField);

  if (childField && finalFilter && uniqueLabels.length > 0) {
    childField.dropdownFilter = finalFilter;

    console.log("Updated dropdownFilter:", finalFilter);

    return {
      isCheck: false,
      type: "success",
      message: "Dropdown filter updated.",
      alertShow: false,
      fieldName,
      values,
      newState,
      formControlData,
    };
  }

  return {
    isCheck: false,
    type: "warning",
    message: "No matching values found to update dropdown.",
    alertShow: false,
    fieldName,
    values,
    newState,
    formControlData,
  };
};

const setVesselSec = async (obj) => {
  const {
    args,
    fieldName,
    values,
    formControlData,
    newState,
    setFormControlData,
    setStateVariable,
  } = obj;
  const argNames = args.split(",").map((arg) => arg.trim());
  const storedUserData = localStorage.getItem("userData");
  let userData;
  if (storedUserData) {
    const decryptedData = decrypt(storedUserData);
    try {
      userData = JSON.parse(decryptedData);
    } catch (e) {
      console.error("Error parsing decrypted data:", e);
      return;
    }
  } else {
    console.error("No user data found in local storage");
    return;
  }
  //const userClientCode = userData[0].clientCode; // Assuming the first user's clientCode is relevant
  const tableName = newState.tableName;
  const polId = newState[argNames[0]];
  const pod = newState[argNames[1]];
  const vendor = values[argNames[2]];

  // Prepare request data to fetch the necessary vessel schedule details
  // const requestData = {
  //   tableName: "tblVesselSchedule",
  //   whereCondition: {
  //     status: 1,
  //     "tblVesselScheduleDetails.fromPort": polId,
  //     "tblVesselScheduleDetails.toPort": pod,
  //     vendorName: vendor,
  //   },
  //   projection: {},
  // };

  const requestData = {
    columns: "vsd.*",
    tableName:
      "tblVesselSchedule vs Inner join tblVesselScheduleDetails vsd on vsd.vesselScheduleId = vs.id",
    whereCondition: `vsd.fromPortId = ${polId} and vsd.toPortId = ${pod} and vendorId=${vendor} and vsd.status = 1 and vs.status = 1`,
    clientIdCondition: `vsd.clientId IN (${clientId}, (SELECT id FROM tblClient WHERE clientCode = 'SYSCON')) FOR JSON PATH`,
  };

  // Fetch the relevant vessel schedule details
  const fetchMappingNameField = await fetchReportData(requestData);
  let data = fetchMappingNameField.data;

  // Extract the relevant data fields
  const etdDate = data[0]?.ETD;
  const etaDate = data[0]?.ETA;
  const transitTime = data[0]?.transitTime;
  const originFreeDays = data[0]?.freeDaysOrigin;
  const destinationFreeDays = data[0]?.freeDaysDestination;

  // Define field names
  const resultField = "eta";
  const etds = "etd";
  const trans = "transitTime";
  const origin = "originFreeDays";
  const destination = "destinationFreeDays";

  // Update the state and values with the fetched data
  setStateVariable((prev) => ({
    ...prev,
    [resultField]: etaDate ? new Date(etaDate).toISOString().split("T")[0] : "", // Format the date as required
    [etds]: etdDate ? new Date(etdDate).toISOString().split("T")[0] : "",
    [trans]: transitTime || "",
    [origin]: originFreeDays || "",
    [destination]: destinationFreeDays || "",
  }));

  const updatedValues = {
    ...values,
    [resultField]: etaDate ? new Date(etaDate).toISOString().split("T")[0] : "", // Format the date as required
    [etds]: etdDate ? new Date(etdDate).toISOString().split("T")[0] : "",
    [trans]: transitTime || "",
    [origin]: originFreeDays || "",
    [destination]: destinationFreeDays || "",
  };

  console.log("updated values - ", updatedValues);

  // Return the result
  let endResult = {
    type: "success",
    result: true,
    newState: newState,
    values: updatedValues,
    formControlData: formControlData,
    message: "Vessel schedule details have been set in tblRateRequestPlan.",
  };
  return endResult;
};

// const setContainerStatus =(obj) =>{
//   const {
//     args,
//     values,
//     fieldName,
//     newState,
//     formControlData,
//     setFormControlData,
//     setStateVariable,
//   } = obj;
//   const argNames = args.split(",").map((arg) => arg.trim());
//   const containerStatus = newState[argNames[0]];
//   const statusGrid = newState[argNames[1]];
//   setStateVariable((prev) => ({
//     ...prev,
//     // [argNames[0]]: formatDate(currentDate),
//   }));
//   return {
//     isCheck: false,
//     type: "success",
//     message: "Error fetching company parameters",
//     alertShow: false,
//     fieldName: fieldName,
//     values: values,
//     newState: newState,
//     formControlData: formControlData,
//   };
// }

const copyConsigneeToNotifyParty = (obj) => {
  const {
    args,
    values,
    fieldName,
    newState,
    formControlData,
    setFormControlData,
    setStateVariable,
  } = obj;

  const argNames = args.split(",").map((arg) => arg.trim());
  const consigneeId = newState[argNames[0]];
  const consigneeBranchId = newState[argNames[1]];
  const consigneeAddress = newState[argNames[2]];

  const answer = confirm("Copy Consignee To Notify Party?");
  if (answer) {
    setStateVariable((prev) => ({
      ...prev,
      [argNames[3]]: consigneeId,
      [argNames[4]]: consigneeBranchId,
      [argNames[5]]: consigneeAddress,
    }));

    return {
      isCheck: false,
      type: "success",
      message: "Consignee details copied successfully!",
      alertShow: true,
      fieldName: fieldName,
      values: values,
      newState: newState,
      formControlData: formControlData,
    };
  } else {
    return {
      isCheck: false,
      type: "info",
      message: "Copy operation cancelled",
      alertShow: false,
      fieldName: fieldName,
      values: values,
      newState: newState,
      formControlData: formControlData,
    };
  }
};
const calculateAllFields = (obj) => {
  const {
    args,
    values: originalValues,
    fieldName,
    newState: originalNewState,
    formControlData,
    setStateVariable,
  } = obj;
  console.log("calculateAllFields", obj);

  const values = JSON.parse(JSON.stringify(originalValues));
  const newState = JSON.parse(JSON.stringify(originalNewState));

  if (!args) {
    return {
      isCheck: false,
      type: "error",
      message: "No arguments provided for calculation.",
      values: values,
      alertShow: false,
      fieldName: fieldName,
      newState: newState,
      formControlData: formControlData,
    };
  }

  const getValue = (field) => {
    let value;
    if (field.includes(".")) {
      const [tablePrefix, tableField] = field.split(".");
      // You can validate the tablePrefix here if needed
      value = parseFloat(newState[tableField]);
    } else {
      value = parseFloat(values[field]);
    }
    return isNaN(value) ? 0 : value;
  };

  const applyBODMAS = (tokens) => {
    const applyOperation = (tokens, operators) => {
      for (let i = 0; i < tokens.length; i++) {
        if (operators.includes(tokens[i])) {
          const operand1 = parseFloat(tokens[i - 1]);
          const operand2 = parseFloat(tokens[i + 1]);
          const operator = tokens[i];

          if (isNaN(operand1) || isNaN(operand2)) {
            console.warn(
              `Invalid operand encountered: operand1=${operand1}, operand2=${operand2}`
            );
            return NaN; // Return NaN if any operand is not a number
          }

          const result = evaluateSimpleExpression(operand1, operator, operand2);
          tokens.splice(i - 1, 3, result); // Replace the three tokens with the result
          i--; // Adjust index after splice
        }
      }
    };

    // First, handle multiplication, division, and modulus
    applyOperation(tokens, ["*", "/", "%"]);

    // Then, handle addition and subtraction
    applyOperation(tokens, ["+", "-"]);

    return tokens.length === 1 ? tokens[0] : NaN;
  };

  const evaluateSimpleExpression = (operand1, operator, operand2) => {
    switch (operator) {
      case "+":
        return operand1 + operand2;
      case "-":
        return operand1 - operand2;
      case "*":
        return operand1 * operand2;
      case "%":
        return (operand1 * operand2) / 100;
      case "/":
        return operand2 === 0 ? NaN : operand1 / operand2;
      default:
        return operand1;
    }
  };

  const parseAndEvaluate = (expression) => {
    const tokens = expression.match(/(\(|\)|\w+|\+|\-|\*|\/|\%)/g);

    const stack = [];
    let currentTokens = [];

    for (const token of tokens) {
      if (token === "(") {
        stack.push(currentTokens);
        currentTokens = [];
      } else if (token === ")") {
        const subResult = applyBODMAS(currentTokens);
        if (isNaN(subResult)) {
          return NaN; // Return NaN if any sub-result is NaN
        }
        currentTokens = stack.pop();
        currentTokens.push(subResult.toString());
      } else {
        const isOperator = ["+", "-", "*", "/", "%"].includes(token);
        if (isOperator) {
          currentTokens.push(token);
        } else {
          const value = getValue(token);
          currentTokens.push(value);
        }
      }
    }

    return applyBODMAS(currentTokens);
  };

  const calculateMultipleValues = (expression, resultField) => {
    const result = parseAndEvaluate(expression);

    if (isNaN(result)) {
      console.warn("Final result is NaN.");
      return 0;
    }

    values[resultField] = result.toFixed(2); // Format the result to 2 decimal places
  };

  const calculateAndUpdateValues = (argNames, operator, resultField) => {
    const params = argNames
      .slice(0, -1)
      .map((arg) => getValue(arg))
      .filter((value) => !isNaN(value));

    if (params.length === 0) {
      console.warn("No valid values provided for calculation.");
      return;
    }

    let result;
    let isSuccess = true; // Flag to indicate if the calculation is successful

    // Calculate based on the operator provided
    switch (operator) {
      case "add":
      case "+":
        result = params.reduce((acc, curr) => acc + curr, 0);
        break;
      case "subtract":
      case "-":
        result = params.reduce((acc, curr) => acc - curr, params.shift() || 0);
        break;
      case "multiply":
      case "*":
        result = params.reduce((acc, curr) => acc * curr, 1);
        break;
      case "divide":
      case "/":
        if (params.slice(1).some((param) => param === 0)) {
          console.warn("Division by zero encountered.");
          result = 0;
          isSuccess = false;
        } else {
          result = params.reduce((acc, curr) => acc / curr, params.shift());
        }
        break;
      case "max":
      case ">":
        result = Math.max(...params);
        break;
      case "min":
      case "<":
        result = Math.min(...params);
        break;
      default:
        console.warn("Unrecognized operator. Defaulting to addition.");
        result = params.reduce((acc, curr) => acc + curr, 0);
        break;
    }

    // Check if result is NaN and handle it
    if (isNaN(result)) {
      console.warn("Calculation resulted in NaN, setting result to 0.");
      result = 0;
      isSuccess = false;
    }
    values[resultField] = result.toFixed(2); // Format the result to 2 decimal places
    // setStateVariable((prev) => ({
    //   ...prev,
    //   [resultField]: result.toFixed(2), // Format the result to 2 decimal places
    // }));

    // const updatedValues = {
    //   ...values,
    //   [resultField]: result.toFixed(2),
    // };
  };

  // Perform all calculations
  // calculateMultipleValues(
  //   "((buyRate * qty * buyExchangeRate) % buyMargin) + (buyRate * qty * buyExchangeRate)",
  //   "buyAmount"
  // );
  // calculateMultipleValues(
  //   "buyExchangeRate * (buyAmount + buyTaxAmount)",
  //   "buyTotalAmount"
  // );
  // calculateMultipleValues("buyRate % sellMargin + buyRate", "sellRate");
  // calculateMultipleValues(
  //   "(buyMargin % buyRate + buyRate) + (sellMargin % (buyMargin % buyRate + buyRate))",
  //   "sellRate"
  // );
  // calculateMultipleValues(
  //   "((buyRate * qty * buyExchangeRate) % buyMargin) + (buyRate * qty * buyExchangeRate)",
  //   "buyAmount"
  // );
  // calculateMultipleValues(
  //   "buyExchangeRate * (buyAmount + buyTaxAmount)",
  //   "buyTotalAmount"
  // );
  // calculateAndUpdateValues(
  //   ["tblRateRequest.exchangeRate", "buyAmount", "buyAmountHc"],
  //   "*",
  //   "buyAmountHc"
  // );
  // calculateAndUpdateValues(
  //   ["buyAmount", "buyTaxAmount", "buyTotalAmount"],
  //   "+",
  //   "buyTotalAmount"
  // );
  // calculateAndUpdateValues(
  //   ["buyAmountHc", "buyTaxAmountHc", "buyTotalAmountHc"],
  //   "+",
  //   "buyTotalAmountHc"
  // );
  // calculateMultipleValues(
  //   "(buyMargin % buyRate + buyRate) + (sellMargin % (buyMargin % buyRate + buyRate))",
  //   "sellRate"
  // );
  // calculateMultipleValues(
  //   "sellExchangeRate * (sellAmount + sellTaxAmount)",
  //   "sellTotalAmount"
  // );
  // calculateMultipleValues("qty * sellRate * sellExchangeRate", "sellAmount");
  // calculateAndUpdateValues(
  //   ["tblRateRequest.exchangeRate", "sellAmount", "sellAmountHc"],
  //   "*",
  //   "sellAmountHc"
  // );
  // calculateAndUpdateValues(
  //   ["sellAmount", "sellTaxAmount", "sellTotalAmount"],
  //   "+",
  //   "sellTotalAmount"
  // );
  // calculateAndUpdateValues(
  //   ["tblRateRequest.exchangeRate", "sellTaxAmount", "sellTaxAmountHc"],
  //   "*",
  //   "sellTaxAmountHc"
  // );
  // calculateMultipleValues(
  //   "sellAmountHc + sellTaxAmountHc",
  //   "sellTotalAmountHc"
  // );
  // calculateMultipleValues(
  //   "buyRate % buyMargin + buyRate * qty * buyExchangeRate",
  //   "buyAmount"
  // );
  // calculateMultipleValues(
  //   "buyExchangeRate * buyAmount + buyExchangeRate * buyTaxAmount",
  //   "buyTotalAmount"
  // );
  // calculateMultipleValues(
  //   "tblRateRequest.exchangeRate * buyAmount",
  //   "buyAmountHc"
  // );
  // calculateMultipleValues("buyAmountHc + buyTaxAmountHc", "buyTotalAmount");
  // calculateAndUpdateValues(
  //   ["sellAmountHc", "sellTaxAmountHc", "sellTotalAmountHc"],
  //   "+",
  //   "sellTotalAmountHc"
  // );

  args.forEach((calc) => {
    if (calc.expression) {
      calculateMultipleValues(calc.expression, calc.resultField);
    } else if (calc.argNames && calc.operator && calc.resultField) {
      calculateAndUpdateValues(calc.argNames, calc.operator, calc.resultField);
    }
  });
  console.log("values", values);

  setStateVariable((prev) => ({
    ...prev,
    ...values,
  }));
  return {
    isCheck: true,
    type: "success",
    message: "All fields calculated successfully.",
    values: values,
    alertShow: false,
    fieldName: fieldName,
    newState: newState,
  };
};

const ownStateSet = async (obj) => {
  const {
    args,
    values,
    fieldName,
    newState,
    formControlData,
    setFormControlData,
    setStateVariable,
  } = obj;
  const argNames = args.split(",").map((arg) => arg.trim());
  let [originCol] = argNames;
  //let chargeId = values[originCol];
  const token = localStorage.getItem("token");
  const { companyId, branchId } = getUserDetails();
  const request = {
    columns: "s.id",
    tableName: "tblState s INNER JOIN tblCompanyBranch cb ON s.Id=cb.stateId",
    whereCondition: `cb.companyId=${companyId} AND cb.id=${branchId}`,
    clientIdCondition: `s.status=1 FOR JSON PATH , INCLUDE_NULL_VALUES`,
  };
  return fetchReportData(request).then((response) => {
    const data = response.data;
    const state = data[0]?.id;

    if (state !== undefined && state !== null) {
      const updatedValues = {
        ...values,
        ownStateId: state,
      };
      setStateVariable((prev) => ({
        ...prev,
        ownStateId: state,
      }));

      return {
        type: "success",
        result: true,
        newState: {
          ...newState,
        },
        values: updatedValues,
        message: "Data found !",
      };
    }
  });
};

const ownStateGstSet = async (obj) => {
  const {
    args,
    values,
    fieldName,
    newState,
    formControlData,
    setFormControlData,
    setStateVariable,
  } = obj;
  const argNames = args.split(",").map((arg) => arg.trim());
  let [originCol] = argNames;
  //let chargeId = values[originCol];
  const token = localStorage.getItem("token");
  const { companyId, branchId } = getUserDetails();
  const request = {
    columns: "id",
    tableName: "tblCompanyBranch",
    whereCondition: `companyId=${companyId} AND id=${branchId}`,
    clientIdCondition: `status=1 FOR JSON PATH , INCLUDE_NULL_VALUES`,
  };
  return fetchReportData(request).then((response) => {
    const data = response.data;
    const dueToValue = data[0]?.id;

    if (dueToValue !== undefined && dueToValue !== null) {
      const updatedValues = {
        ...values,
        ownGstinNoId: dueToValue,
      };
      setStateVariable((prev) => ({
        ...prev,
        ownGstinNoId: dueToValue,
      }));

      return {
        type: "success",
        result: true,
        newState: {
          ...newState,
        },
        values: updatedValues,
        message: "Data found !",
      };
    }
  });
};

const getBranchInvoice = async (obj) => {
  const {
    args,
    values,
    fieldName,
    newState,
    formControlData,
    setFormControlData,
    setStateVariable,
  } = obj;
  const argNames = args.split(",").map((arg) => arg.trim());
  let [originCol] = argNames;
  const billingParty = values[originCol];
  const token = localStorage.getItem("token");
  const { companyId, branchId } = getUserDetails();
  const request = {
    columns: "b.id,b.name,b.address",
    tableName:
      "tblCompanyBranch b inner join tblGeneralLedger gl on b.id=gl.accCompanyBranchId inner join tblGlGSt gst on gl.id=gst.generalLedgerId and b.id=gst.companyBranchId ",
    whereCondition: `gst.generalLedgerId =${billingParty}`,
    clientIdCondition: `b.status=1 FOR JSON PATH`,
  };
  return fetchReportData(request).then((response) => {
    const data = response.data;
    const name = data[0]?.id;
    //const address = data[1].address;
    if (billingParty !== "") {
      if (name !== undefined && name !== null) {
        const updatedValues = {
          ...values,
          billingPartyBranchId: name,
          //billingPartyaddress: address,
        };
        setStateVariable((prev) => ({
          ...prev,
          billingPartyBranchId: name,
          //billingPartyaddress: address,
        }));

        return {
          type: "success",
          result: true,
          newState: {
            ...newState,
          },
          values: updatedValues,
          message: "Data found !",
        };
      }
    }
  });
};

const getBranchAddressInvoice = async (obj) => {
  const { args, values, fieldName, newState, setStateVariable } = obj;

  const argNames = args.split(",").map((arg) => arg.trim());
  const billingPartyId = newState[argNames[0]];
  const billingPartyBranch = newState[argNames[1]];

  const { companyId, branchId } = getUserDetails();

  const request = {
    columns: "address",
    tableName: "tblGlGSt",
    whereCondition: `generalLedgerId = ${billingPartyId} AND companyBranchId = ${billingPartyBranch}`,
    clientIdCondition: `status=1 FOR JSON PATH, INCLUDE_NULL_VALUES`,
  };

  try {
    const response = await fetchReportData(request);

    if (!response || !response.data || response.data.length === 0) {
      console.warn("No data found for billing party:", request);
      return {
        type: "warning",
        result: false,
        message: "No address found for the selected billing party.",
      };
    }

    const name = response.data[0]?.address || ""; // Use optional chaining to prevent undefined error

    setStateVariable((prev) => ({
      ...prev,
      billingPartyaddress: name,
    }));

    return {
      type: "success",
      result: true,
      newState: { ...newState },
      values: { ...values, billingPartyaddress: name },
      message: "Data found!",
    };
  } catch (error) {
    console.error("Error fetching branch address:", error);
    return {
      type: "error",
      result: false,
      message: "Error fetching address. Please try again.",
    };
  }
};

const getCreditPeriod = async (obj) => {
  const {
    args,
    values,
    fieldName,
    newState,
    formControlData,
    setFormControlData,
    setStateVariable,
  } = obj;
  const argNames = args.split(",").map((arg) => arg.trim());
  const billingPartylId = newState[argNames[0]];
  // const billingPartyBranch = newState[argNames[1]];
  // const billingParty = values[originCol];
  // const billingPartyBranch = values[originCol];
  const token = localStorage.getItem("token");
  const { companyId, branchId } = getUserDetails();
  const request = {
    columns: "isnull(creditPeriod,0) as creditPeriod",
    tableName: "tblGeneralLedger ",
    whereCondition: `id =${billingPartylId}`,
    clientIdCondition: `status=1 FOR JSON PATH , INCLUDE_NULL_VALUES `,
  };
  return fetchReportData(request).then((response) => {
    const data = response.data;
    const creditPeriod = data[0].creditPeriod;
    //const address = data[1].address;

    if (creditPeriod !== undefined && creditPeriod !== null) {
      const updatedValues = {
        ...values,
        creditPeriod: creditPeriod,
      };
      setStateVariable((prev) => ({
        ...prev,
        creditPeriod: creditPeriod,
      }));

      return {
        type: "success",
        result: true,
        newState: {
          ...newState,
        },
        values: updatedValues,
        message: "Data found !",
      };
    }
  });
};

const getInvoiceDetails = async (obj) => {
  let {
    args,
    newState,
    formControlData,
    setFormControlData,
    values,
    fieldName,
    tableName,
    setStateVariable,
  } = obj;
  let argNames;
  let splitArgs = [];
  if (
    args === undefined ||
    args === null ||
    args === "" ||
    (typeof args === "object" && Object.keys(args).length === 0)
  ) {
    argNames = args;
  } else {
    argNames = args.split(",").map((arg) => arg.trim());
    for (const iterator of argNames) {
      splitArgs.push(iterator.split("."));
    }
  }
  const { billingPartyId } = newState;
  // const { chargeId, chargeGlId, SelectedParentInvId } = values;
  const { companyId, clientId, branchId } = getUserDetails();
  const request = {
    columns: "gg.stateId,gg.id",
    tableName: `tblGlGst gg Left Join tblCompanyBranch cb on cb.id = ${branchId}`,
    whereCondition: `gg.generalLedgerId = ${billingPartyId}`,
    clientIdCondition: `gg.status=1 FOR JSON PATH, INCLUDE_NULL_VALUES`,
  };

  const fetchInvoice = await fetchReportData(request);
  console.log("fetchInvoice", fetchInvoice);

  try {
    const response = await fetchReportData(request);

    if (!response || !response.data || response.data.length === 0) {
      console.warn("No data found for billing party:", request);
      return {
        type: "warning",
        result: false,
        message: "No address found for the selected billing party.",
      };
    }

    const name = response.data[0]?.stateId || ""; // Use optional chaining to prevent undefined error
    const gstinNo = response.data[0]?.id || "";

    setStateVariable((prev) => ({
      ...prev,
      billingPartyStateId: name,
      billingPartyGstinNoId: gstinNo,
      placeOfSupplyStateId: name,
    }));

    return {
      type: "success",
      result: true,
      newState: {
        ...newState,
      },
      values: values,
      message: "Data found !",
    };
  } catch (error) {
    console.error("Error fetching branch address:", error);
    return {
      type: "error",
      result: false,
      message: "Error fetching address. Please try again.",
    };
  }
};

const calculateDueDate = async (obj) => {
  let { args, newState, setStateVariable, fieldName } = obj;

  const argNames = args.split(",").map((arg) => arg.trim());
  const invoiceDate = newState[argNames[0]];
  const creditPeriod = parseInt(newState[argNames[1]], 10) || 0;

  if (invoiceDate) {
    let dueDate = new Date(invoiceDate);
    dueDate.setDate(dueDate.getDate() + creditPeriod);

    let formattedDueDate = dueDate.toISOString().split("T")[0];

    setStateVariable((prevState) => ({
      ...prevState,
      dueDate: formattedDueDate,
    }));
  }
};

const getVoucherInvoiceDetails = async (obj) => {
  let {
    args,
    newState,
    formControlData,
    setFormControlData,
    values,
    fieldName,
    tableName,
    setStateVariable,
  } = obj;

  let argNames;
  let splitArgs = [];

  if (
    args === undefined ||
    args === null ||
    args === "" ||
    (typeof args === "object" && Object.keys(args).length === 0)
  ) {
    argNames = args;
  } else {
    argNames = args.split(",").map((arg) => arg.trim());
    for (const iterator of argNames) {
      splitArgs.push(iterator.split("."));
    }
  }

  const { paymentByParty } = newState;
  const { companyId, clientId } = getUserDetails();

  const requestData = {
    clientId: clientId,
    billingPartyId: paymentByParty,
    companyId: companyId,
  };

  const fetchInvoice = await getVoucherInvoiceData(requestData);

  if (fetchInvoice) {
    console.log("fetchInvoice", fetchInvoice);
    console.log("newState -om", newState);

    const invoiceNumbers =
      Array.isArray(fetchInvoice?.Chargers) && fetchInvoice.Chargers.length > 0
        ? fetchInvoice.Chargers.map((invoice) => ({
          value: invoice?.value ?? invoice?.invoiceNo, // Use invoiceNo if value is missing
          label: invoice?.label ?? invoice?.invoiceNo, // Ensure label is never undefined
        }))
        : [];

    console.log("invoiceNumbers", invoiceNumbers);

    const invoiceIdsString = invoiceNumbers.map((inv) => inv.value).join(",");

    setStateVariable((prev) => ({
      ...prev,
      invoiceIdsmultiselect: invoiceNumbers,
      invoiceIds: invoiceIdsString,
    }));

    return {
      type: "success",
      result: true,
      newState: {
        ...newState,
        invoiceIdsmultiselect: invoiceNumbers,
        invoiceIds: invoiceIdsString,
      },
      values: values,
      message: invoiceNumbers.length > 0 ? "Data found!" : "No invoices found!",
    };
  }
};

const homeCurrencyInvoice = async (obj) => {
  const {
    args,
    values,
    fieldName,
    newState,
    formControlData,
    setFormControlData,
    setStateVariable,
  } = obj;
  //const argNames  =args.split(",").map((arg) => arg.trim());
  //let [originCol] = argNames;
  const { companyId, branchId } = getUserDetails();
  const request = {
    columns: "currencyId",
    tableName: "tblCompanyParameter",
    whereCondition: `companyId=${companyId}`,
    clientIdCondition: `status=1 FOR JSON PATH ,INCLUDE_NULL_VALUES`,
  };
  return fetchReportData(request).then((response) => {
    const data = response.data;
    const currency = data[0]?.currencyId;

    if (currency !== undefined && currency !== null) {
      const updatedValues = {
        ...values,
        currencyId: currency,
        exchangeRate: 1,
      };
      //       demurragecurrencyId: currency,
      // demurrageCurrencyId: currency,
      setStateVariable((prev) => ({
        ...prev,
        currencyId: currency,
        exchangeRate: 1,
      }));
      //       demurragecurrencyId: currency,
      // demurrageCurrencyId: currency,

      return {
        type: "success",
        result: true,
        newState: {
          ...newState,
        },
        values: updatedValues,
        message: "Data found !",
      };
    }
  });
};

const setJobNoForGrid = async (obj) => {
  const {
    args,
    values,
    fieldName,
    newState,
    formControlData,
    setFormControlData,
    setStateVariable,
  } = obj;
  const argNames = args.split(",").map((arg) => arg.trim());
  const jobNo = newState[argNames[0]];
  const updatedValues = {
    ...values,
    [tblInvoiceCharge.jobId]: jobNo,
  };
  setStateVariable((prev) => ({
    ...prev,
    [tblInvoiceCharge.jobId]: jobNo,
  }));

  return {
    type: "success",
    result: true,
    newState: {
      ...newState,
    },
    values: updatedValues,
    message: "Data found !",
  };
};

const baseOnVehicleSetPackage = async (obj) => {
  const {
    args,
    values,
    fieldName,
    newState,
    formControlData,
    setStateVariable,
  } = obj;

  const argNames = args.split(",").map((arg) => arg.trim());
  const vehicleOrderNo = values[argNames[0]];
  const commodity = values[argNames[1]];
  const noOfPackageField = argNames[2];
  const typeOfPackageField = argNames[3];
  const { clientId } = getUserDetails();
  // Fetch commodity description for the given commodity ID
  const requestCommodity = {
    columns: "*",
    tableName: "tblJobQty",
    whereCondition: `jobId = ${vehicleOrderNo} AND clientId =${clientId}`,
    clientIdCondition: `status=1 FOR JSON PATH ,INCLUDE_NULL_VALUES`,
  };
  const vehicleOrderDetails = await fetchReportData(requestCommodity);
  const responseDataCommodity = vehicleOrderDetails.data[0].cargoDescription;
  for (const detail of vehicleOrderDetails.data) {
    if (detail.cargoDescription === responseDataCommodity) {
      const noOfPackages = detail.noOfpackages;
      const typeOfPackage = detail.packageId;

      const updatedValues = {
        ...values,
        noOfPackages: noOfPackages,
        typeOfPackages: typeOfPackage,
      };

      setStateVariable((prevState) => ({
        ...prevState,
        noOfPackages: noOfPackages,
        typeOfPackages: typeOfPackage,
      }));
      return {
        type: "success",
        result: true,
        newState: {
          ...newState,
        },
        values: updatedValues,
        message: "Data found !",
      };
    }
  }
};

const setQtyId = async (obj) => {
  const {
    args,
    values,
    fieldName,
    newState,
    formControlData,
    setFormControlData,
    setStateVariable,
  } = obj;
  const argNames = args.split(",").map((arg) => arg.trim());
  let [originCol] = argNames;
  let vehicalId = values[originCol];
  const token = localStorage.getItem("token");
  //const { companyId, branchId } = getUserDetails();
  const request = {
    columns: "id",
    tableName: "tblJobQty",
    whereCondition: `jobId=${vehicalId}`,
    clientIdCondition: `status=1 FOR JSON PATH , INCLUDE_NULL_VALUES`,
  };
  return fetchReportData(request).then((response) => {
    const data = response.data[0];
    const jobId = data.id;

    if (jobId !== undefined && jobId !== null) {
      const updatedValues = {
        ...values,
        jobQtyId: jobId,
      };
      setStateVariable((prev) => ({
        ...prev,
        jobQtyId: jobId,
      }));

      return {
        type: "success",
        result: true,
        newState: {
          ...newState,
        },
        values: updatedValues,
        message: "Data found !",
      };
    }
  });
};

const setContainerData = async (obj) => {
  const {
    args,
    values,
    fieldName,
    newState,
    formControlData,
    setFormControlData,
    setStateVariable,
  } = obj;

  const containerNo = values[fieldName];
  try {
    const requestBody = {
      columns: "*",
      tableName: "tblContainer",
      whereCondition: `id=${containerNo}`,
      clientIdCondition: `status=1 FOR JSON PATH, INCLUDE_NULL_VALUES`,
    };
    const data = await fetchReportData(requestBody);
    const containerData = data.data[0];

    if (containerData) {
      const updatedValues = {
        ...values,
        containerNo: containerData.containerNo,
        sizeId: containerData.sizeId,
        typeId: containerData.typeId,
        tareWt: containerData.tareWt,
        tareWtUnitId: containerData.tareWtId,
        length: containerData.length,
        width: containerData.width,
        height: containerData.height,
      };
      setStateVariable((prev) => ({
        ...prev,
        containerNo: containerData.containerNo,
        sizeId: containerData.sizeId,
        typeId: containerData.typeId,
        tareWt: containerData.tareWt,
        tareWtUnitId: containerData.tareWtId,
        length: containerData.length,
        width: containerData.width,
        height: containerData.height,
      }));

      if (
        values[fieldName] == null ||
        values[fieldName] == "" ||
        values[fieldName] == undefined
      ) {
        const updatedValues = {
          ...values,
          containerNo: null,
          sizeId: null,
          typeId: null,
          tareWt: null,
          tareWtUnitId: null,
          length: null,
          width: null,
          height: null,
        };
        setStateVariable((prev) => ({
          ...prev,
          containerNo: null,
          sizeId: null,
          typeId: null,
          tareWt: null,
          tareWtUnitId: null,
          length: null,
          width: null,
          height: null,
        }));

        return {
          type: "success",
          result: true,
          newState: {
            ...newState,
          },
          values: updatedValues,
          message: "Data found !",
        };
      }

      return {
        type: "success",
        result: true,
        newState: {
          ...newState,
        },
        values: updatedValues,
        message: "Data found !",
      };
    }
  } catch (error) {
    return {
      isCheck: false,
      type: "error",
      message: "Error fetching container data - " + error.message,
      alertShow: false,
      fieldName: fieldName,
      values: values,
      newState: newState,
      formControlData: formControlData,
    };
  }
  const updatedValues = {
    ...values,
    containerNo: containerNo,
  };
  setStateVariable((prev) => ({
    ...prev,
    containerNo: containerNo,
  }));

  return {
    type: "success",
    result: true,
    newState: {
      ...newState,
    },
    values: updatedValues,
    message: "Data found !",
  };
};

const setContainerNoToDD = async (obj) => {
  const {
    args,
    values,
    fieldName,
    newState,
    formControlData,
    setFormControlData,
    setStateVariable,
  } = obj;

  const containerNo = values[fieldName];

  const requestBody = {
    columns: "*",
    tableName: "tblContainer",
    whereCondition: `containerNo = '${containerNo}'`,
    clientIdCondition: `status=1 FOR JSON PATH, INCLUDE_NULL_VALUES`,
  };

  const data = await fetchReportData(requestBody);
  const containerData = data.data[0];

  if (containerData) {
    const updatedValues = {
      ...values,
      containerId: containerData.id,
      sizeId: containerData.sizeId,
      typeId: containerData.typeId,
      tareWt: containerData.tareWt,
      tareWtUnitId: containerData.tareWtId,
      length: containerData.length,
      width: containerData.width,
      height: containerData.height,
    };
    setStateVariable((prev) => ({
      ...prev,
      containerId: containerData.id,
      sizeId: containerData.sizeId,
      typeId: containerData.typeId,
      tareWt: containerData.tareWt,
      tareWtUnitId: containerData.tareWtId,
      length: containerData.length,
      width: containerData.width,
      height: containerData.height,
    }));

    return {
      type: "success",
      result: true,
      newState: {
        ...newState,
      },
      values: updatedValues,
      message: "Data found !",
    };
  } else {
    const updatedValues = {
      ...values,
      containerId: null,
      containerNo: null,
      sizeId: null,
      typeId: null,
      tareWt: null,
      tareWtUnitId: null,
      length: null,
      width: null,
      height: null,
    };
    setStateVariable((prev) => ({
      ...prev,
      containerId: null,
      containerNo: null,
      sizeId: null,
      typeId: null,
      tareWt: null,
      tareWtUnitId: null,
      length: null,
      width: null,
      height: null,
    }));
    toast.error("Container no not found!");
    return {
      isCheck: false,
      type: "error",
      message: `container no is not valid`,
      alertShow: false,
      values: values,
      newState: newState,
      fieldName: fieldName,
      formControlData: formControlData,
    };
  }
};

const setHomeCurrencyForCharge = async (obj) => {
  const {
    args,
    values,
    fieldName,
    newState,
    formControlData,
    setFormControlData,
    setStateVariable,
  } = obj;

  const { companyId, branchId } = getUserDetails();

  // 1. Get company's home currencyId
  const request = {
    columns: "currencyId",
    tableName: "tblCompanyParameter",
    whereCondition: `companyId=${companyId}`,
    clientIdCondition: `status=1 FOR JSON PATH ,INCLUDE_NULL_VALUES`,
  };

  return fetchReportData(request).then(async (response) => {
    const data = response.data;
    const currency = data[0]?.currencyId;

    if (currency !== undefined && currency !== null) {
      // 2. Fetch label from currency master
      const currencyReq = {
        columns: "id as value, code as label",
        tableName: "tblMasterData",
        whereCondition: `id=${currency}`,
        clientIdCondition: `status=1 FOR JSON PATH ,INCLUDE_NULL_VALUES`,
      };

      const currencyResp = await fetchReportData(currencyReq);
      const currencyDropdown = currencyResp.data?.[0] || {
        value: currency,
        label: "",
      };

      // 3. Update values with both ID and dropdown
      const updatedValues = {
        ...values,
        buyCurrencyId: currency,
        sellCurrencyId: currency,
        currencyId: String(currency), // string as in your sample
        exchangeRate: 1,
        buyExchangeRate: 1,
        buyexchangeRate: 1,
        sellExchangeRate: 1,
        sellexchangeRate: 1,
        currencyIddropdown: [currencyDropdown], // << added here
      };

      setStateVariable((prev) => ({
        ...prev,
        buyCurrencyId: currency,
        sellCurrencyId: currency,
        currencyId: String(currency),
        exchangeRate: 1,
        buyExchangeRate: 1,
        buyexchangeRate: 1,
        sellExchangeRate: 1,
        sellexchangeRate: 1,
        currencyIddropdown: [currencyDropdown],
      }));

      return {
        type: "success",
        result: true,
        newState: {
          ...newState,
        },
        values: updatedValues,
        message: "Data found !",
      };
    }
  });
};

const compareValue = async (obj) => {
  const {
    args,
    values,
    fieldName,
    newState,
    formControlData,
    setStateVariable,
  } = obj;

  const argNames = args.split(",").map((arg) => arg.trim());

  const argValues = argNames.map((name) => parseFloat(values?.[name]) || 0);

  let isValid = true;
  for (let i = 0; i < argValues.length - 1; i++) {
    if (argValues[i] <= argValues[i + 1]) {
      isValid = false;
      break;
    }
  }

  if (!isValid) {
    toast.error("Net Weight should be less then Gross Weight");
  }
  setStateVariable((prev) => ({
    ...prev,
    validationError: !isValid,
  }));

  const updatedValues = {
    ...values,
  };
  return {
    isCheck: true,
    type: "success",
    message: "Chargeable weight set successfully.",
    values: updatedValues,
    alertShow: false,
    fieldName: fieldName,
    newState: newState,
  };
};

const setTaxCalculation = async (obj) => {
  const {
    args,
    newState,
    formControlData,
    setFormControlData,
    values,
    fieldName,
    setStateVariable,
  } = obj;

  let argNames = [];
  if (args && typeof args === "string") {
    argNames = args.split(",").map((arg) => arg.trim());
  }

  const calculateTaxField = argNames[0];
  const calculateTaxValue = newState[calculateTaxField];

  if (!calculateTaxValue) {
    const gridData = newState.tblRateRequestCharge || [];
    const updatedGridData = gridData.map((item) => ({
      ...item,
      buyTaxAmount: 0,
    }));

    setStateVariable((prevState) => ({
      ...prevState,
      tblRateRequestCharge: updatedGridData,
    }));

    return {
      isCheck: false,
      type: "success",
      message: "Tax calculation skipped. Tax field set to 0.",
      values: {
        ...values,
        buyTaxAmount: 0,
        sellTaxAmount: 0,
      },
      alertShow: false,
      newState,
    };
  }

  const { rateRequestDate, businessSegmentId, quotationDate } = newState;
  const { companyId, branchId } = getUserDetails();

  if (values && values.chargeId && values.buyRate != null) {
    try {
      const request = {
        columns: "glId",
        tableName: "tblChargeDetails",
        whereCondition: `chargeId=${values.chargeId}`,
        clientIdCondition: `status=1 FOR JSON PATH ,INCLUDE_NULL_VALUES`,
      };

      const response = await fetchReportData(request);
      const glId = response?.data?.[0]?.glId;

      if (!glId) {
        setStateVariable((prev) => ({
          ...prev,
          buyTaxAmount: 0,
          sellTaxAmount: 0,
        }));

        return {
          isCheck: true,
          type: "warning",
          message: "Tax set to 0 due to missing glId.",
          values: {
            ...values,
            buyTaxAmount: 0,
            sellTaxAmount: 0,
          },
          alertShow: false,
          newState,
        };
      }
      const requestData = {
        DepartmentId: businessSegmentId,
        chargeId: glId,
        quotationDate: rateRequestDate,
        companyId: companyId,
        sellAmount: values.buyRate,
        clientId: clientId,
      };
      const fetchTaxDetails = await getTaxDetailsQuotation(requestData);
      const taxRate = fetchTaxDetails?.Chargers[0]?.taxAmount;
      if (!taxRate) {
        setStateVariable((prev) => ({
          ...prev,
          buyTaxAmount: 0,
          sellTaxAmount: 0,
        }));

        return {
          isCheck: true,
          type: "warning",
          message: "Tax set to 0 due to missing taxRate.",
          values: {
            ...values,
            buyTaxAmount: 0,
            sellTaxAmount: 0,
          },
          alertShow: false,
          newState,
        };
      }
      const sellTax = (taxRate * values.sellRate) / 100;
      const taxAmount = taxRate;
      setStateVariable((prev) => ({
        ...prev,
        buyTaxAmount: taxAmount,
        sellTaxAmount: sellTax,
      }));

      return {
        isCheck: true,
        type: "success",
        message: "Tax calculated successfully.",
        values: {
          ...values,
          buyTaxAmount: taxAmount,
          sellTaxAmount: sellTax,
        },
        alertShow: false,
        newState,
      };
    } catch (error) {
      console.error("Error during tax calculation:", error);
      return {
        isCheck: false,
        type: "error",
        message: "An error occurred during the tax calculation.",
        values,
        alertShow: true,
        newState,
      };
    }
  } else {
    return {
      isCheck: false,
      type: "warning",
      message: "Required fields missing for tax calculation.",
      values,
      alertShow: true,
      newState,
    };
  }
};

const setFirstExchangeRate = async (obj) => {
  const { args, fieldName, values, newState, setStateVariable } = obj;
  const argNames = args.split(",").map((arg) => arg.trim());
  let [originCol, exchangeRate] = argNames;
  const currencyId = values[originCol];
  const token = localStorage.getItem("token");
  const storedUserData = localStorage.getItem("userData");
  let userData;
  let companyResponseData;

  if (storedUserData) {
    const decryptedData = decrypt(storedUserData);
    try {
      userData = JSON.parse(decryptedData);
    } catch (e) {
      console.error("Error parsing decrypted data:", e);
      return;
    }
  } else {
    console.error("No user data found in local storage");
    return;
  }

  if (!currencyId) {
    console.log("CurrencyId is empty, setting exchange rate to empty");
    values[exchangeRate] = ""; // Set exchangeRate to empty if currencyId is empty
    return {
      obj: { ...obj },
      values: { ...values },
      isCheck: true,
      type: "success",
      message: "Exchange rate set to empty due to empty currencyId",
      alertShow: true,
      newState: newState,
      fieldName: fieldName,
    };
  }

  const companyRequestBody = {
    columns: "*",
    tableName: "tblCompanyParameter",
    whereCondition: `currencyId = ${currencyId} and status = 1`,
    clientIdCondition: `clientId IN (${clientId}, (SELECT id FROM tblClient WHERE clientCode = 'SYSCON')) FOR JSON PATH`,
  };

  try {
    console.log("Fetching company parameters...");
    const companyResponse = await fetchReportData(companyRequestBody);
    companyResponseData = companyResponse;
    console.log("Company Response Data:", companyResponse);
  } catch (error) {
    console.error("Error fetching company parameters:", error);
    return {
      obj: { ...obj },
      values: { ...values },
      isCheck: false,
      type: "error",
      message: "Error fetching company parameters",
      alertShow: true,
    };
  }

  try {
    const requestBody = {
      columns: "*",
      tableName: "tblExchangeRate",
      whereCondition: `fromCurrencyId = ${currencyId} and status = 1`,
      clientIdCondition: `clientId IN (${clientId}) FOR JSON PATH`,
    };
    const response = await fetchReportData(requestBody);

    const fromCurrencyId =
      response.data.length > 0 ? response.data[0].fromCurrencyId : null;
    const exportExchangeRate =
      response.data.length > 0 ? response.data[0].exportExchangeRate : null;
    const companyCurrencyId =
      companyResponseData.data.length > 0
        ? companyResponseData.data[0].currencyId
        : null;

    if (
      fromCurrencyId !== "" &&
      fromCurrencyId !== null &&
      fromCurrencyId !== undefined
    ) {
      if (fromCurrencyId === companyCurrencyId) {
        values[exchangeRate] = 1; // Set sell rate to 1 if currency IDs match
        setStateVariable((prev) => ({
          ...prev,
          [argNames[1]]: 1 || "",
        }));

        const updatedValues = {
          ...values,
          [argNames[1]]: 1 || "",
        };

        console.log("updated values - ", updatedValues);
        return {
          obj: { ...obj },
          values: updatedValues,
          isCheck: true,
          type: "success",
          message: "Exchange rate updated successfully",
          alertShow: true,
          newState: newState,
          fieldName: fieldName,
        };
      } else {
        values[exchangeRate] = exportExchangeRate; // Set sell rate to 1 if currency IDs match
        setStateVariable((prev) => ({
          ...prev,
          [argNames[1]]: exportExchangeRate || "",
        }));

        const updatedValues = {
          ...values,
          [argNames[1]]: exportExchangeRate || "",
        };

        console.log("updated values - ", updatedValues);
        return {
          obj: { ...obj },
          values: updatedValues,
          isCheck: true,
          type: "success",
          message: "Exchange rate updated successfully",
          alertShow: true,
          newState: newState,
          fieldName: fieldName,
        };
      }
    } else {
      values[exchangeRate] = 1;
      setStateVariable((prev) => ({
        ...prev,
        [argNames[1]]: 1 || "",
      }));

      const updatedValues = {
        ...values,
        [argNames[1]]: 1 || "",
      };

      console.log("updated values - ", updatedValues);
      return {
        obj: { ...obj },
        values: updatedValues,
        isCheck: true,
        type: "success",
        message: "Exchange rate updated successfully",
        alertShow: true,
        newState: newState,
        fieldName: fieldName,
      };
    }
  } catch (error) {
    console.error("Error fetching exchange rates:", error);
    return {
      obj: { ...obj },
      values: { ...values },
      isCheck: false,
      type: "error",
      message: "Error fetching exchange rates",
      alertShow: true,
    };
  }
};

const validateDateDo = async (obj) => {
  let { args, newState, setStateVariable } = obj;

  let argNames;
  let splitArgs = [];

  if (
    args === undefined ||
    args === null ||
    args === "" ||
    (typeof args === "object" && Object.keys(args).length === 0)
  ) {
    argNames = args;
  } else {
    argNames = args.split(",").map((arg) => arg.trim());
    for (const iterator of argNames) {
      splitArgs.push(iterator.split("."));
    }
  }

  const mblNo = newState[argNames[0]];

  const request = {
    columns: "*",
    tableName: "tblBl",
    whereCondition: `mblNo = '${mblNo}'`,
    clientIdCondition: `status=1 FOR JSON PATH , INCLUDE_NULL_VALUES`,
  };

  const response = await fetchReportData(request);
  const data = response?.data?.[0];

  if (!data?.id) {
    return {
      type: "warning",
      result: false,
      message: "MBL No not found!",
    };
  }

  const requestData = {
    id: data.id,
  };

  const fetchDoValidateDate = await getValidateForDo(requestData);

  if (
    fetchDoValidateDate &&
    Array.isArray(fetchDoValidateDate) &&
    fetchDoValidateDate.length > 0
  ) {
    const doValidDate = fetchDoValidateDate[0]?.doValidDate || null;

    setStateVariable((prev) => ({
      ...prev,
      doValidDate,
    }));

    return {
      type: "success",
      result: true,
      newState: {
        ...newState,
        doValidDate: doValidDate,
      },
      message: "DO Valid Date set successfully.",
    };
  } else {
    return {
      type: "warning",
      result: false,
      message: "DO Valid Date not found!",
    };
  }
};

const addDate = async (obj) => {
  const {
    args,
    values,
    fieldName,
    newState,
    formControlData,
    setFormControlData,
    setStateVariable,
  } = obj;

  if (!args) {
    return {
      type: "error",
      result: false,
      message: "Arguments are missing.",
    };
  }

  const argNames = args.split(",").map((arg) => arg.trim());
  const fromDateField = argNames[0];
  const toDateField = argNames[1];
  const daysValue = parseInt(argNames[2], 10); // ensure number

  const validateFromDate = newState[fromDateField];

  if (!validateFromDate || isNaN(daysValue)) {
    return {
      type: "error",
      result: false,
      message: "Invalid from date or days value.",
    };
  }

  // Convert and add days
  const fromDate = new Date(validateFromDate);
  fromDate.setDate(fromDate.getDate() + daysValue);

  const formattedToDate = fromDate.toISOString().split("T")[0]; // Format as YYYY-MM-DD

  // Update state
  setStateVariable((prev) => ({
    ...prev,
    [toDateField]: formattedToDate,
  }));

  return {
    type: "success",
    result: true,
    newState: {
      ...newState,
      [toDateField]: formattedToDate,
    },
    message: `Set ${toDateField} to ${formattedToDate} (added ${daysValue} days).`,
  };
};

const setGridExchangeRate = async (obj) => {
  const { args, fieldName, values, newState, setStateVariable } = obj;
  const argNames = args.split(",").map((arg) => arg.trim());
  let [originCol, buyCurrencyId, exchangeRate] = argNames;
  const currencyId = newState[argNames[0]];
  const buyCurrency = values[buyCurrencyId];
  let userData;
  let companyResponseData;

  if (!currencyId) {
    values[exchangeRate] = "";
    return {
      obj: { ...obj },
      values: { ...values },
      isCheck: true,
      type: "success",
      message: "Exchange rate set to empty due to empty currencyId",
      alertShow: true,
      newState: newState,
      fieldName: fieldName,
    };
  }

  const companyRequestBody = {
    columns: "*",
    tableName: "tblCompanyParameter",
    whereCondition: `currencyId = ${currencyId} and status = 1`,
    clientIdCondition: `clientId IN (${clientId}, (SELECT id FROM tblClient WHERE clientCode = 'SYSCON')) FOR JSON PATH`,
  };

  try {
    const companyResponse = await fetchReportData(companyRequestBody);
    companyResponseData = companyResponse;
  } catch (error) {
    console.error("Error fetching company parameters:", error);
    return {
      obj: { ...obj },
      values: { ...values },
      isCheck: false,
      type: "error",
      message: "Error fetching company parameters",
      alertShow: true,
    };
  }

  try {
    const requestBody = {
      columns: "*",
      tableName: "tblExchangeRate",
      whereCondition: `fromCurrencyId = ${buyCurrency} and status = 1`,
      clientIdCondition: `clientId IN (${clientId}) FOR JSON PATH`,
    };
    const response = await fetchReportData(requestBody);

    const fromCurrencyId =
      response.data.length > 0 ? response.data[0].fromCurrencyId : null;
    const exportExchangeRate =
      response.data.length > 0 ? response.data[0].exportExchangeRate : null;
    const companyCurrencyId =
      companyResponseData.data.length > 0
        ? companyResponseData.data[0].currencyId
        : null;

    if (
      fromCurrencyId !== "" &&
      fromCurrencyId !== null &&
      fromCurrencyId !== undefined
    ) {
      if (fromCurrencyId === companyCurrencyId) {
        values[exchangeRate] = 1; // Set sell rate to 1 if currency IDs match
        setStateVariable((prev) => ({
          ...prev,
          [argNames[2]]: 1 || "",
        }));

        const updatedValues = {
          ...values,
          [argNames[2]]: 1 || "",
        };
        return {
          obj: { ...obj },
          values: updatedValues,
          isCheck: true,
          type: "success",
          message: "Exchange rate updated successfully",
          alertShow: true,
          newState: newState,
          fieldName: fieldName,
        };
      } else {
        values[exchangeRate] = exportExchangeRate; // Set sell rate to 1 if currency IDs match
        setStateVariable((prev) => ({
          ...prev,
          [argNames[2]]: exportExchangeRate || "",
        }));

        const updatedValues = {
          ...values,
          [argNames[2]]: exportExchangeRate || "",
        };

        console.log("updated values - ", updatedValues);
        return {
          obj: { ...obj },
          values: updatedValues,
          isCheck: true,
          type: "success",
          message: "Exchange rate updated successfully",
          alertShow: true,
          newState: newState,
          fieldName: fieldName,
        };
      }
    } else {
      values[exchangeRate] = 1;
      setStateVariable((prev) => ({
        ...prev,
        [argNames[2]]: 1 || "",
      }));

      const updatedValues = {
        ...values,
        [argNames[2]]: 1 || "",
      };

      console.log("updated values - ", updatedValues);
      return {
        obj: { ...obj },
        values: updatedValues,
        isCheck: true,
        type: "success",
        message: "Exchange rate updated successfully",
        alertShow: true,
        newState: newState,
        fieldName: fieldName,
      };
    }
  } catch (error) {
    console.error("Error fetching exchange rates:", error);
    return {
      obj: { ...obj },
      values: { ...values },
      isCheck: false,
      type: "error",
      message: "Error fetching exchange rates",
      alertShow: true,
    };
  }
};
const setCargoMovement = async (obj) => {
  const {
    args,
    values,
    fieldName,
    newState,
    formControlData,
    setFormControlData,
    setStateVariable,
  } = obj;

  const argNames = args.split(",").map((arg) => arg.trim());

  const podId = newState[argNames[0]];
  const fpdId = newState[argNames[1]];
  const movementTypeField = argNames[2];

  const updatedMovementTypeId =
    podId && fpdId && podId === fpdId ? "738" : "973";

  setStateVariable((prevState) => ({
    ...prevState,
    [movementTypeField]: updatedMovementTypeId,
  }));
};

const getBranchAddressInvoiceForForgin = async (obj) => {
  const { args, values, fieldName, newState, setStateVariable } = obj;

  const argNames = args.split(",").map((arg) => arg.trim());
  const billingPartyId = newState[argNames[0]];

  const { companyId } = getUserDetails();

  const request = {
    columns: "address",
    tableName: "tblgeneralledger",
    whereCondition: `id = ${billingPartyId}`,
    clientIdCondition: `status=1 FOR JSON PATH, INCLUDE_NULL_VALUES`,
  };

  try {
    const response = await fetchReportData(request);

    if (!response || !response.data || response.data.length === 0) {
      console.warn("No data found for billing party:", request);
      return {
        type: "warning",
        result: false,
        message: "No address found for the selected billing party.",
      };
    }

    const name = response.data[0]?.address || ""; // Use optional chaining to prevent undefined error

    setStateVariable((prev) => ({
      ...prev,
      billingPartyaddress: name,
    }));

    return {
      type: "success",
      result: true,
      newState: { ...newState },
      values: { ...values, billingPartyaddress: name },
      message: "Data found!",
    };
  } catch (error) {
    console.error("Error fetching branch address:", error);
    return {
      type: "error",
      result: false,
      message: "Error fetching address. Please try again.",
    };
  }
};

const setRadioValue = async (obj) => {
  const { args, values, newState, setStateVariable } = obj;
  const argNames = args.split(",").map((arg) => arg.trim());
  const blType = newState[argNames[0]];
  const radioKey = argNames[1];

  let updatedValues = { ...values };
  let updatedState = { ...newState };

  // Normalize to number if possible
  const blTypeValue =
    typeof blType === "object" && blType !== null ? blType.value : blType;

  if (blTypeValue === 177) {
    updatedValues[radioKey] = "1";
    updatedState[radioKey] = "1";
  } else if (blTypeValue == null || blTypeValue === "") {
    updatedValues[radioKey] = "";
    updatedState[radioKey] = "";
  } else {
    updatedValues[radioKey] = "2";
    updatedState[radioKey] = "2";
  }

  setStateVariable(updatedState);

  return {
    obj: { ...obj, newState: updatedState },
    values: updatedValues,
    isCheck: true,
    type: "success",
    message: "Value updated successfully",
    alertShow: true,
  };
};

const setFreightIssue = async (obj) => {
  const { args, values, newState, setStateVariable } = obj;
  const argNames = args.split(",").map((arg) => arg.trim());
  const plrValue = newState[argNames[0]];
  const issuePlaceKey = argNames[1];
  const freightKey = argNames[2];
  const plrDropdown = newState[`${argNames[0]}dropdown`];
  const plrLabel =
    Array.isArray(plrDropdown) && plrDropdown.length > 0
      ? plrDropdown[0]?.label
      : "";
  let updatedValues = {
    ...values,
    [freightKey]: plrLabel,
    [issuePlaceKey]: plrValue,
  };

  setStateVariable((prev) => ({
    ...prev,
    [freightKey]: plrLabel,
    [issuePlaceKey]: plrValue,
  }));

  return {
    obj: { ...obj, values: updatedValues },
    values: updatedValues,
    isCheck: true,
    type: "success",
    message: "Freight payable at & Issue Place updated successfully",
    alertShow: true,
  };
};

const copyConsigneeToNotifyPartyText = (obj) => {
  const {
    args,
    values,
    fieldName,
    newState,
    formControlData,
    setFormControlData,
    setStateVariable,
  } = obj;

  const argNames = args.split(",").map((arg) => arg.trim());
  const consigneeText = newState[argNames[0]];
  const consigneeAddress = newState[argNames[2]];
  console.log("Consignee FormControl - ", formControlData);
  const answer = confirm("Copy Consignee To Notify Party?");
  if (answer) {
    setStateVariable((prev) => ({
      ...prev,
      [argNames[2]]: consigneeText,
      [argNames[4]]: consigneeText,
    }));

    return {
      isCheck: false,
      type: "success",
      message: "Consignee details copied successfully!",
      alertShow: true,
      fieldName: fieldName,
      values: values,
      newState: newState,
      formControlData: formControlData,
    };
  } else {
    return {
      isCheck: false,
      type: "info",
      message: "Copy operation cancelled",
      alertShow: false,
      fieldName: fieldName,
      values: values,
      newState: newState,
      formControlData: formControlData,
    };
  }
};

const copyConsigneeToNotifyPartyTextAddres = (obj) => {
  const {
    args,
    values,
    fieldName,
    newState,
    formControlData,
    setFormControlData,
    setStateVariable,
  } = obj;

  const argNames = args.split(",").map((arg) => arg.trim());
  const consigneeAddress = newState[argNames[0]];

  const answer = confirm("Copy Consignee To Notify Party?");
  if (answer) {
    setStateVariable((prev) => ({
      ...prev,
      [argNames[1]]: consigneeAddress,
      [argNames[2]]: consigneeAddress,
    }));

    return {
      isCheck: false,
      type: "success",
      message: "Consignee details copied successfully!",
      alertShow: true,
      fieldName: fieldName,
      values: values,
      newState: newState,
      formControlData: formControlData,
    };
  } else {
    return {
      isCheck: false,
      type: "info",
      message: "Copy operation cancelled",
      alertShow: false,
      fieldName: fieldName,
      values: values,
      newState: newState,
      formControlData: formControlData,
    };
  }
};

const setDate = (obj) => {
  const {
    args,
    values,
    fieldName,
    newState,
    formControlData,
    setFormControlData,
    setStateVariable,
  } = obj;

  const argNames = args.split(",").map((arg) => arg.trim());

  const HblDate = newState[argNames[0]];
  const sobDate = argNames[1];
  const blIssueDate = argNames[2];

  if (HblDate) {
    setStateVariable((prev) => ({
      ...prev,
      [sobDate]: HblDate,
      [blIssueDate]: HblDate,
    }));
  }
};

const setBranchForContainerMovement = async (obj) => {
  const {
    args,
    values,
    fieldName,
    newState,
    formControlData,
    setFormControlData,
    setStateVariable,
  } = obj;

  const argNames = args.split(",").map((arg) => arg.trim());
  const agentId = argNames[0];
  const agent = values[argNames[0]];

  const request = {
    columns: "id,name",
    tableName: "tblCompanyBranch",
    whereCondition: `companyId = ${agent}`,
    clientIdCondition: `status=1 FOR JSON PATH, INCLUDE_NULL_VALUES`,
  };
  try {
    const response = await fetchReportData(request);

    if (!response || !response.data || response.data.length === 0) {
      return {
        type: "warning",
        result: false,
        message: "No branch found for the selected agent.",
      };
    }

    const name = response.data[0]?.id || "";

    setStateVariable((prev) => ({
      ...prev,
      agentBranchId: name,
    }));

    return {
      type: "success",
      result: true,
      newState: { ...newState },
      values: { ...values, agentBranchId: name },
      message: "Data found!",
    };
  } catch (error) {
    console.error("Error fetching branch address:", error);
    return {
      type: "error",
      result: false,
      message: "Error fetching address. Please try again.",
    };
  }
};
const setBankByDefault = async (obj) => {
  const {
    args,
    values,
    fieldName,
    newState,
    formControlData,
    setFormControlData,
    setStateVariable,
  } = obj;

  try {
    const argNames = args.split(",").map((arg) => arg.trim());
    const currency = newState[argNames[0]];
    const { companyId, branchId } = getUserDetails();

    const request = {
      columns: "id,bankName,accountNo",
      tableName: "tblCompanyBranchBank",
      whereCondition: `companyId = ${companyId} AND companyBranchId = ${branchId} and currencyId = ${currency} and defaultBank='Y' `,
      clientIdCondition: `status=1 FOR JSON PATH, INCLUDE_NULL_VALUES`,
    };

    const response = await fetchReportData(request);

    if (!response || !response.data || response.data.length === 0) {
      return {
        type: "warning",
        result: false,
        message: "No default Bank found for the selected Currency.",
      };
    }

    const bankId = response.data[0]?.id || "";

    // update state
    setStateVariable((prev) => ({
      ...prev,
      bankId: bankId,
    }));

    return {
      type: "success",
      result: true,
      newState: { ...newState, bankId: bankId },
      values: { ...values, bankId: bankId },
      message: "Data found!",
    };
  } catch (error) {
    console.error("Error fetching default bank:", error);
    return {
      type: "error",
      result: false,
      message: "Error fetching default bank. Please try again.",
    };
  }
};

const calculateVoucherAmt = async (obj) => {
  const { args, newState, setStateVariable } = obj;
  ///currencyId,exchangeRate,amtRec,amtRecFC,tdsAmtFC,tdsAmt
  try {
    const argNames = args.split(",").map((arg) => arg.trim());
    const currency = newState?.[argNames[0]];
    const exchangeRate = parseFloat(newState?.[argNames[1]]) || 0; // e.g. "exchangeRate"
    const amtRec = parseFloat(newState?.[argNames[2]]) || 0;
    const amtRecFcValue = parseFloat(newState?.[argNames[3]]) || 0;
    const tdsPercent = [argNames[6]] || 0;
    const request = {
      columns: "*",
      tableName: "tblCompanyParameter",
      whereCondition: `currencyId = ${currency} and status = 1`,
      clientIdCondition: `clientId IN (${clientId}, (SELECT id FROM tblClient WHERE clientCode = 'SYSCON')) FOR JSON PATH`,
    };

    const response = await fetchReportData(request);
    const currencyId = response?.data[0]?.currencyId;
    if (currencyId == currency) {
      //amtRecFC
      const amtRecFc = amtRec;
      const tdsAmtFc = amtRecFc * tdsPercent;
      const tdsAmt = amtRec * tdsPercent;

      // Store in newState
      setStateVariable((prev) => ({
        ...prev,
        [argNames[3]]: amtRecFc,
      }));
      //[argNames[4]]: tdsAmtFc,
      // [argNames[5]]: tdsAmt,

      // const tdsApplicableData = newState?.tdsApplicable || null;
      // if (tdsApplicableData == true || tdsApplicableData == "true") {
      //   const amtRecFCValue = parseFloat(newState?.amtRecFC) || 0;
      //   const amtRecValue = parseFloat(newState?.amtRec) || 0;
      //   const tdsPercent = parseFloat([argNames[6]]) || 0;
      //   //tdsAmtFC   // tdsAmt
      //   const calculatedTdsAmtFc = amtRecFCValue * tdsPercent;
      //   const CalculatedCTdsAmt = amtRecValue * tdsPercent;
      //   setStateVariable((prev) => ({
      //     ...prev,
      //     tdsAmtFC: calculatedTdsAmtFc,
      //     tdsAmt: CalculatedCTdsAmt,
      //   }));
      // } else {
      //   setStateVariable((prev) => ({
      //     ...prev,
      //     tdsAmtFC: null,
      //     tdsAmt: null,
      //   }));
      // }

      return {
        type: "success",
        result: true,
        message: "Amount & TDS calculated successfully",
        amtRecFc,
        tdsAmtFc,
        tdsAmt,
      };
    } else if (currencyId != currency) {
      const amtRec = amtRecFcValue * exchangeRate;
      const tdsAmtFc = amtRecFcValue * tdsPercent;
      const tdsAmt = amtRec * tdsPercent;

      // Store in newState
      setStateVariable((prev) => ({
        ...prev,
        [argNames[2]]: amtRec,
      }));
      //[argNames[4]]: tdsAmtFc,
      // [argNames[5]]: tdsAmt,

      // const tdsApplicableData = newState?.tdsApplicable || null;
      // if (tdsApplicableData == true || tdsApplicableData == "true") {
      //   const amtRecFCValue = parseFloat(newState?.amtRecFC) || 0;
      //   const amtRecValue = parseFloat(newState?.amtRec) || 0;
      //   const tdsPercent = parseFloat([argNames[6]]) || 0;
      //   //tdsAmtFC   // tdsAmt
      //   const calculatedTdsAmtFc = amtRecFCValue * tdsPercent;
      //   const CalculatedCTdsAmt = amtRecValue * tdsPercent;
      //   setStateVariable((prev) => ({
      //     ...prev,
      //     tdsAmtFC: calculatedTdsAmtFc,
      //     tdsAmt: CalculatedCTdsAmt,
      //   }));
      // } else {
      //   setStateVariable((prev) => ({
      //     ...prev,
      //     tdsAmtFC: null,
      //     tdsAmt: null,
      //   }));
      // }

      return {
        type: "success",
        result: true,
        message: "Amount & TDS calculated successfully",
        tdsAmtFc,
        tdsAmt,
      };
    }
  } catch (error) {
    console.error("Error in calculateVoucherAmt:", error);
    return {
      type: "error",
      result: false,
      message: "Error calculating voucher amount. Please try again.",
    };
  }
};

const getContainerRepairChargeDetails = async (obj) => {
  let {
    args,
    newState,
    formControlData,
    setFormControlData,
    values,
    fieldName,
    tableName,
    setStateVariable,
  } = obj;

  console.log("newState", obj);

  let argNames;
  let splitArgs = [];
  if (
    args === undefined ||
    args === null ||
    args === "" ||
    (typeof args === "object" && Object.keys(args).length === 0)
  ) {
    argNames = args;
  } else {
    argNames = args.split(",").map((arg) => arg.trim());
    for (const iterator of argNames) {
      splitArgs.push(iterator.split("."));
    }
  }
  const { businessSegmentId, billingPartyId, containerRepairId } = values;
  const { companyId, clientId, branchId } = getUserDetails();
  const requestData = {
    clientId: clientId,
    voucherType: newState?.voucherTypeId,
    DepartmentId: newState?.businessSegmentId || businessSegmentId || 0,
    containerRepairIds: newState?.containerRepairId || containerRepairIds || 0,
    billingPartyId: newState?.billingPartyId || billingPartyId || 0,
    companyId: companyId,
    companyBranchId: branchId,
  };
  const fetchChargeDetails = await getContainerRepairDetails(requestData);
  if (fetchChargeDetails) {
    console.log(fetchChargeDetails);
    const { Chargers } = fetchChargeDetails;
    for (let index = 0; index < (Chargers?.length || 0); index++) {
      Chargers[index].idx = index;
      Chargers[index].index = index;
      Chargers[index].indexValue = index;
    }
    values.tblInvoiceCharge = Array.isArray(Chargers) ? Chargers : [];
    setStateVariable((prev) => {
      return { ...prev, ...values };
    });
  }
};

const setInvoiceChargeDetails = async (obj) => {
  let {
    args,
    newState,
    formControlData,
    setFormControlData,
    values,
    fieldName,
    tableName,
    setStateVariable,
    onChangeHandler,
  } = obj;

  const { companyId, clientId, branchId } = getUserDetails();

  // Parse args
  let argNames = [];
  let splitArgs = [];
  if (
    args !== undefined &&
    args !== null &&
    args !== "" &&
    !(typeof args === "object" && Object.keys(args).length === 0)
  ) {
    argNames = args.split(",").map((arg) => arg.trim());
    for (const iterator of argNames) {
      splitArgs.push(iterator.split("."));
    }
  }

  const { businessSegmentId, blId } = newState;
  const { chargeId } = values;

  // Fetch charge name
  const request = {
    columns: "name",
    tableName: "tblCharge",
    whereCondition: `id = ${chargeId}`,
    clientIdCondition: `status=1 FOR JSON PATH, INCLUDE_NULL_VALUES`,
  };
  const response = await fetchReportData(request);
  const chargeName = response?.data?.[0]?.name || "";

  // If charge is a Detention type, fetch details
  if (chargeName.toUpperCase().includes("DETENTION")) {
    const requestData = {
      blId: blId,
      chargeId: chargeId,
      clientId: clientId,
      companyId: companyId,
      companyBranchId: branchId,
      businessSegmentId: businessSegmentId,
    };

    const fetchChargeDetails = await getDetentionDetails(requestData);

    if (fetchChargeDetails) {
      const { Chargers } = fetchChargeDetails;

      // Map and prepare Chargers
      const updatedChargers = Chargers.map((item, index) => ({
        ...item,
        containerIddropdown: [
          {
            value: item.containerId,
            label: item.containerNo,
          },
        ],
        idx: index,
        index: index,
        indexValue: index,
      }));

      // Filter only valid amountHc
      const validChargers = updatedChargers.filter(
        (item) => item.amountHc != null && item.amountHc !== 0
      );

      // Calculate total qty
      const qty = validChargers.reduce(
        (acc, item) => acc + Number(item.qty || 0),
        0
      );

      // Calculate sum of amountHc
      const totalAmountHc = validChargers.reduce(
        (acc, item) => acc + Number(item.amountHc || 0),
        0
      );

      // Calculate average amountHc for rate
      const avgAmountHc =
        validChargers.length > 0 ? totalAmountHc / validChargers.length : 0;

      // Update values object
      values.tblInvoiceChargeDetails = updatedChargers;
      values["qty"] = qty;
      values["rate"] = avgAmountHc.toFixed(2);

      // Update state variable
      setStateVariable((prev) => ({
        ...prev,
        tblInvoiceChargeDetails: updatedChargers,
        qty: qty,
        rate: avgAmountHc.toFixed(2),
        totalAmountHc: totalAmountHc.toFixed(2), // sum
        totalAmountFc: (
          totalAmountHc * Number(newState.exchangeRate || 1)
        ).toFixed(2),
      }));
    }
  }
};

const getThirdLevelDetails = async (obj) => {
  const {
    args,
    newState,
    formControlData,
    setFormControlData,
    values,
    fieldName,
    tableName,
    setStateVariable,
    onChangeHandler,
  } = obj;

  const { companyId, clientId, branchId, userId, financialYear } =
    getUserDetails();

  // Parse args
  let argNames;
  let splitArgs = [];
  if (
    args === undefined ||
    args === null ||
    args === "" ||
    (typeof args === "object" && Object.keys(args).length === 0)
  ) {
    argNames = args;
  } else {
    argNames = args.split(",").map((arg) => arg.trim());
    for (const iterator of argNames) {
      splitArgs.push(iterator.split("."));
    }
  }

  const {
    businessSegmentId,
    voucherTypeId,
    blId,
    plrId,
    podId,
    fpdId,
    polId,
    depotId,
    billingPartyId,
    containerStatusId,
    fromDate,
    toDate,
    exchangeRate,
  } = newState;

  const {
    jobId,
    chargeId,
    cargoTypeId,
    sizeId,
    typeId,
    containerRepairId,
    containerTransactionId,
  } = values;

  const requestData = {
    billingPartyId: billingPartyId,
    clientId: clientId,
    jobId: jobId,
    chargeId: chargeId,
    companyId: companyId,
    companyBranchId: branchId,
    fromDate: fromDate,
    toDate: toDate,
    clientId: clientId,
    businessSegmentId: businessSegmentId,
    voucherTypeId: voucherTypeId,
    blId: blId,
    plrId: plrId,
    podId: podId,
    fpdId: fpdId,
    polId: polId,
    depotId: depotId,
    containerStatusId: containerStatusId,
    cargoTypeId: cargoTypeId,
    sizeId: sizeId,
    typeId: typeId,
    containerRepairId: containerRepairId,
    containerTransactionId: containerTransactionId,
    invoiceExchageRate: exchangeRate,
  };

  const fetchChargeDetails = await fetchThirdLevelDetailsFromApi(requestData);

  if (fetchChargeDetails) {
    const { Chargers = [] } = fetchChargeDetails;

    const toNum = (v) =>
      v === null || v === undefined || v === "" ? null : Number(v);

    const updatedChargers = Chargers.map((item, i) => {
      const _containerId = toNum(item.containerId);
      const _sizeId = toNum(item.sizeId);
      const _typeId = toNum(item.typeId);
      const _jobId = toNum(item.jobId);
      const _containerTransactionId = toNum(item.containerTransactionId);
      const _containerRepairId = toNum(item.containerRepairId);
      const _blId = toNum(item.blId);
      return {
        ...item,
        indexValue: i,
        containerIddropdown:
          _containerId !== null
            ? [
              {
                value: _containerId,
                label: item.containerNo ?? String(_containerId),
              },
            ]
            : [],
        sizeIddropdown:
          _sizeId !== null
            ? [{ value: _sizeId, label: item.sizeName ?? String(_sizeId) }]
            : [],
        typeIddropdown:
          _typeId !== null
            ? [{ value: _typeId, label: item.typeName ?? String(_typeId) }]
            : [],
        jobIddropdown:
          _jobId !== null
            ? [{ value: _jobId, label: item.jobNo ?? String(_jobId) }]
            : [],
        containerTransactionIddropdown:
          _containerTransactionId !== null
            ? [
              {
                value: _containerTransactionId,
                label:
                  item.containerTransactionName ??
                  String(_containerTransactionId),
              },
            ]
            : [],
        containerRepairIddropdown:
          _containerRepairId !== null
            ? [
              {
                value: _containerRepairId,
                label: item.containerRepairName ?? String(_containerRepairId),
              },
            ]
            : [],
        blIddropdown:
          _blId !== null
            ? [{ value: _blId, label: item.blNo ?? String(_blId) }]
            : [],
        // optional: keep per-row calculated amount for clarity
        calculatedAmount:
          (Number(item.noOfDays) || 0) * (Number(item.rate) || 0),
      };
    });

    // ✅ total qty
    const qty = updatedChargers.reduce(
      (acc, item) => acc + (Number(item["qty"]) || 0),
      0
    );

    // ✅ total of (noOfDays * rate)
    const totalWeighted = updatedChargers.reduce(
      (acc, item) =>
        acc + (Number(item["noOfDays"]) || 0) * (Number(item["rate"]) || 0),
      0
    );

    // ✅ average rate
    const avgRate = qty > 0 ? totalWeighted / qty : 0;

    values.tblInvoiceChargeDetails = updatedChargers;
    values["qty"] = qty;
    values["rate"] = avgRate.toFixed(2);
    values["totalAmountHc"] = (qty * avgRate * 1).toFixed(2);
    values["totalAmountFc"] = (
      qty *
      avgRate *
      Number(newState.exchangeRate || 1)
    ).toFixed(2);

    setStateVariable((prev) => ({
      ...prev,
      tblInvoiceChargeDetails: updatedChargers,
      qty: qty,
      rate: avgRate.toFixed(2),
      totalAmountHc: (qty * avgRate).toFixed(2),
      totalAmountFc: (
        qty *
        avgRate *
        Number(newState.exchangeRate || 1)
      ).toFixed(2),
    }));
  }
};

const calculateVoucherGridBalanceData = async (obj) => {
  const { args, newState, setStateVariable } = obj;
  ///currencyId,exchangeRate,amtRec,amtRecFC,tdsAmtFC,tdsAmt
  try {
    const argNames = args.split(",").map((arg) => arg.trim());
    const osAmount = newState?.[argNames[0]];
    const allocatedFc = parseFloat(newState?.[argNames[1]]) || 0; // e.g. "exchangeRate"
  } catch (error) {
    console.error("Error in calculateVoucherAmt:", error);
    return {
      type: "error",
      result: false,
      message: "Error calculating voucher amount. Please try again.",
    };
  }
};

const getThridDatePurchase = async (obj) => {
  let {
    args,
    newState,
    formControlData,
    setFormControlData,
    values,
    fieldName,
    tableName,
    setStateVariable,
    onChangeHandler,
  } = obj;

  const { companyId, clientId, branchId, userId, financialYear } =
    getUserDetails();

  let argNames;
  let splitArgs = [];
  if (
    args === undefined ||
    args === null ||
    args === "" ||
    (typeof args === "object" && Object.keys(args).length === 0)
  ) {
    argNames = args;
  } else {
    argNames = args.split(",").map((arg) => arg.trim());
    for (const iterator of argNames) {
      splitArgs.push(iterator.split("."));
    }
  }

  const {
    businessSegmentId,
    voucherTypeId,
    blId,
    plrId,
    podId,
    fpdId,
    polId,
    billingPartyId,
    containerStatusId,
  } = newState;
  const { chargeId, fromDate, toDate, cargoTypeId, sizeId, typeId } = values;

  const requestData = {
    billingParty: billingPartyId,
    chargeId: chargeId,
    fromDate: fromDate,
    toDate: toDate,
    clientId: clientId,
    businessSegmentId: businessSegmentId,
    voucherTypeId: voucherTypeId,
    blId: blId,
    plrId: plrId,
    podId: podId,
    fpdId: fpdId,
    polId: polId,
  };
  const fetchChargeDetails = await getThridDatePurchaseData(requestData);

  if (fetchChargeDetails) {
    const { Chargers } = fetchChargeDetails;
    const updatedChargers = Chargers.map((item) => ({
      ...item,
      containerIddropdown: [
        {
          value: item.containerId,
          label: item.containerNo,
        },
      ],
    }));
    values.tblInvoiceChargeDetails = updatedChargers;

    setStateVariable((prev) => {
      const tempData = { ...prev };
      tempData.tblInvoiceChargeDetails = updatedChargers;
      return tempData;
    });
  }
};

// const setNumberDays = async (obj = {}) => {
//   let {
//     args,
//     newState,
//     formControlData,
//     setFormControlData,
//     values,
//     fieldName,
//     tableName,
//     setStateVariable,
//     onChangeHandler,
//   } = obj;

//   const { fromDate, toDate } = values || {};
//   if (fromDate == null || toDate == null) {
//     console.log("[setNumberDays] Skipped: missing date(s)", {
//       fromDate,
//       toDate,
//     });
//     return null;
//   }

//   // If only day numbers are provided (e.g., 10 and 15), do simple subtraction
//   const isPlainDay = (v) =>
//     (typeof v === "number" && Number.isFinite(v)) ||
//     (typeof v === "string" && /^\d{1,2}$/.test(v.trim()));

//   if (isPlainDay(fromDate) && isPlainDay(toDate)) {
//     const d1 = Number(fromDate);
//     const d2 = Number(toDate);
//     const diff = Math.max(d2 - d1, 0); // exclusive
//     console.log("[setNumberDays] Days:", diff);
//     return diff;
//   }

//   // Otherwise, treat as actual dates
//   const toMidnight = (d) =>
//     new Date(d.getFullYear(), d.getMonth(), d.getDate());
//   const tryParseDate = (val) => {
//     if (!val) return null;
//     if (val instanceof Date && !isNaN(val)) return toMidnight(val);

//     if (
//       typeof val === "number" ||
//       (/^\d+$/.test(String(val)) && String(val).length >= 10)
//     ) {
//       const dt = new Date(Number(val));
//       return isNaN(dt) ? null : toMidnight(dt);
//     }

//     if (typeof val === "string") {
//       const d1 = new Date(val);
//       if (!isNaN(d1)) return toMidnight(d1);

//       const m = val.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})$/);
//       if (m) {
//         const [, dd, MM, yyyy] = m;
//         const dt = new Date(Number(yyyy), Number(MM) - 1, Number(dd));
//         return isNaN(dt) ? null : toMidnight(dt);
//       }
//     }
//     return null;
//   };

//   const start = tryParseDate(fromDate);
//   const end = tryParseDate(toDate);
//   if (!start || !end) {
//     console.warn("[setNumberDays] Invalid date format(s).", {
//       fromDate,
//       toDate,
//     });
//     return null;
//   }

//   const MS_PER_DAY = 24 * 60 * 60 * 1000;
//   const noDays = Math.max(Math.round((end - start) / MS_PER_DAY), 0); // exclusive
//   console.log("[setNumberDays] Days:", noDays);
//   setStateVariable((prev) => ({
//     ...prev,
//     noOfDays: noDays,
//   }));
//   calculateDetentionRate(obj, noDays);
//   return noDays;
// };

const setNumberDays = async (obj = {}) => {
  let {
    args,
    newState,
    formControlData,
    setFormControlData,
    values,
    fieldName,
    tableName,
    setStateVariable,
    onChangeHandler,
  } = obj;

  const { fromDate, toDate } = values || {};
  if (fromDate == null || toDate == null) {
    console.log("[setNumberDays] Skipped: missing date(s)", {
      fromDate,
      toDate,
    });
    return null;
  }

  // If only day numbers are provided (e.g., 10 and 15), do simple subtraction
  const isPlainDay = (v) =>
    (typeof v === "number" && Number.isFinite(v)) ||
    (typeof v === "string" && /^\d{1,2}$/.test(v.trim()));

  if (isPlainDay(fromDate) && isPlainDay(toDate)) {
    const d1 = Number(fromDate);
    const d2 = Number(toDate);
    const diff = Math.max(d2 - d1, 0); // exclusive for numeric day numbers
    console.log("[setNumberDays] Days:", diff);
    return diff;
  }

  // Otherwise, treat as actual dates
  const toMidnight = (d) =>
    new Date(d.getFullYear(), d.getMonth(), d.getDate());

  const tryParseDate = (val) => {
    if (!val) return null;
    if (val instanceof Date && !isNaN(val)) return toMidnight(val);

    if (
      typeof val === "number" ||
      (/^\d+$/.test(String(val)) && String(val).length >= 10)
    ) {
      const dt = new Date(Number(val));
      return isNaN(dt) ? null : toMidnight(dt);
    }

    if (typeof val === "string") {
      const d1 = new Date(val);
      if (!isNaN(d1)) return toMidnight(d1);

      const m = val.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})$/);
      if (m) {
        const [, dd, MM, yyyy] = m;
        const dt = new Date(Number(yyyy), Number(MM) - 1, Number(dd));
        return isNaN(dt) ? null : toMidnight(dt);
      }
    }
    return null;
  };

  const start = tryParseDate(fromDate);
  const end = tryParseDate(toDate);
  if (!start || !end) {
    console.warn("[setNumberDays] Invalid date format(s).", {
      fromDate,
      toDate,
    });
    return null;
  }

  const MS_PER_DAY = 24 * 60 * 60 * 1000;
  const noDays = Math.max(Math.round((end - start) / MS_PER_DAY) + 1, 0); // **inclusive**
  console.log("[setNumberDays] Days (inclusive):", noDays);

  setStateVariable((prev) => ({
    ...prev,
    noOfDays: noDays,
  }));

  calculateDetentionRate(obj, noDays);
  return noDays;
};

// const calculateDetentionRate = async (obj, noDays) => {
//   let {
//     args,
//     newState,
//     formControlData,
//     setFormControlData,
//     values,
//     fieldName,
//     tableName,
//     setStateVariable,
//     onChangeHandler,
//   } = obj;

//   const { companyId, clientId, branchId, userId, financialYear } =
//     getUserDetails();

//   let argNames;
//   let splitArgs = [];
//   if (
//     args === undefined ||
//     args === null ||
//     args === "" ||
//     (typeof args === "object" && Object.keys(args).length === 0)
//   ) {
//     argNames = args;
//   } else {
//     argNames = args.split(",").map((arg) => arg.trim());
//     for (const iterator of argNames) {
//       splitArgs.push(iterator.split("."));
//     }
//   }
//   const rate = [argNames[0]] || 0;
//   const { businessSegmentId, blId } = newState;
//   const { chargeId, noOfDays } = values;
//   console.log("newState", newState);
//   console.log("values", noDays , chargeId);

//   const requestData = {
//     blId: blId,
//     noOfDays: noDays,
//     clientId: clientId,
//   };

//   const fetchChargeDetails = await calculateDetentionRateData(requestData);

//   if (fetchChargeDetails) {
//     const { Chargers } = fetchChargeDetails;

//     setStateVariable((prev) => ({
//         ...prev,
//         rate: Chargers[0].rate,
//       }));

//   }
// };
const calculateDetentionRate = async (obj, noDays) => {
  let {
    args,
    newState,
    formControlData,
    setFormControlData,
    values,
    fieldName,
    tableName,
    setStateVariable,
    onChangeHandler,
  } = obj;

  const { companyId, clientId, branchId, userId, financialYear } =
    getUserDetails();

  let argNames;
  let splitArgs = [];
  if (
    args === undefined ||
    args === null ||
    args === "" ||
    (typeof args === "object" && Object.keys(args).length === 0)
  ) {
    argNames = args;
  } else {
    argNames = args.split(",").map((arg) => arg.trim());
    for (const iterator of argNames) {
      splitArgs.push(iterator.split("."));
    }
  }

  const rate = [argNames[0]] || 0;
  const { businessSegmentId, blId } = newState;
  const { chargeId, noOfDays, fromDate, toDate, containerId } = values;
  console.log("newState", newState);
  console.log("values", noDays, chargeId);

  const requestData = {
    blId: blId,
    noOfDays: noDays,
    clientId: clientId,
    businessSegmentId: businessSegmentId,
    fromDate: fromDate,
    toDate: toDate,
    containerId: containerId,
  };

  const fetchChargeDetails = await calculateDetentionRateData(requestData);

  if (fetchChargeDetails) {
    let { Chargers } = fetchChargeDetails;

    // 🔹 add index properties
    for (let index = 0; index < Chargers?.length; index++) {
      Chargers[index].idx = index;
      Chargers[index].index = index;
      Chargers[index].indexValue = index;
    }

    setStateVariable((prev) => ({
      ...prev,
      amountHc: Chargers[0]?.amountHc || 0, // ensure safe access
      Chargers, // store full array if you want to use it later
    }));
  }
};

const setVesslelVoyage = async (obj = {}) => {
  const {
    args,
    values,
    fieldName,
    newState,
    formControlData,
    setFormControlData,
    setStateVariable,
  } = obj;

  try {
    const argNames = args.split(",").map((arg) => arg.trim());
    const blId = newState[argNames[0]];
    const { companyId, branchId } = getUserDetails();

    const request = {
      columns: "polVesselId,polVoyageId",
      tableName: "tblBl",
      whereCondition: `id = ${blId}`,
      clientIdCondition: `status=1 FOR JSON PATH, INCLUDE_NULL_VALUES`,
    };

    const response = await fetchReportData(request);

    if (!response || !response.data || response.data.length === 0) {
      console.warn("No data found for BL:", request);
      return {
        type: "warning",
        result: false,
        message: "No vessel/voyage found for selected BL.",
      };
    }

    const vesselId = response.data[0]?.polVesselId || null;
    const voyageId = response.data[0]?.polVoyageId || null;

    // ✅ Update React state
    setStateVariable((prev) => ({
      ...prev,
      vesselId,
      voyageId,
    }));

    // ✅ Return updated newState
    return {
      type: "success",
      result: true,
      newState: { ...newState, vesselId, voyageId },
      values: { ...values, vesselId, voyageId },
      message: "Vessel/Voyage set successfully!",
    };
  } catch (error) {
    console.error("Error fetching vessel/voyage:", error);
    return {
      type: "error",
      result: false,
      message: "Error fetching vessel/voyage. Please try again.",
    };
  }
};
const getBlChargesForPaty = async (obj) => {
  let {
    args,
    newState,
    formControlData,
    setFormControlData,
    values,
    fieldName,
    tableName,
    setStateVariable,
  } = obj;

  let argNames;
  let splitArgs = [];
  if (
    args === undefined ||
    args === null ||
    args === "" ||
    (typeof args === "object" && Object.keys(args).length === 0)
  ) {
    argNames = args;
  } else {
    argNames = args.split(",").map((arg) => arg.trim());
    for (const iterator of argNames) {
      splitArgs.push(iterator.split("."));
    }
  }

  const {
    invoiceDate,
    businessSegmentId,
    placeOfSupplyStateId,
    sez,
    billingPartyId,
    ownStateId,
    blId,
  } = values;

  const { companyId, clientId, branchId } = getUserDetails();

  console.log("values", values);

  // 🔹 STEP 1: Ensure billingPartyId is set from BL if missing
  let finalBillingPartyId = newState?.billingPartyId || values?.billingPartyId;

  if (!finalBillingPartyId && newState?.blId) {
    const fetchInvoice = await getGeneralLegerBillingParty({
      id: newState.blId,
    });
    const invoiceList = Array.isArray(fetchInvoice)
      ? fetchInvoice
      : Array.isArray(fetchInvoice?.Chargers)
        ? fetchInvoice.Chargers
        : [];

    if (invoiceList.length > 0) {
      const selectedLedger = invoiceList[0];
      // ✅ Always cast to number for dropdown binding
      finalBillingPartyId = selectedLedger?.LedgerId
        ? Number(selectedLedger.LedgerId)
        : null;

      // update state immediately with billing party
      newState = {
        ...newState,
        billingPartyId: finalBillingPartyId,
        billingPartyIddropdown: finalBillingPartyId
          ? [
            {
              value: finalBillingPartyId,
              label: selectedLedger?.LedgerName || "",
            },
          ]
          : [],
      };

      setStateVariable(newState);
    }
  }

  // 🔹 STEP 2: Build request with correct billingPartyId
  const requestData = {
    clientId: clientId,
    voucherType: newState?.voucherTypeId,
    DepartmentId: newState?.businessSegmentId,
    jobIds: newState?.jobId,
    blIds: newState?.blId || values?.blId,
    billingPartyId: finalBillingPartyId,
    companyId: companyId,
    companyBranchId: branchId,
  };

  console.log("requestData =>", requestData);

  // 🔹 STEP 3: Fetch Charges
  const fetchTaxDetails = await getBlChargeDetails(requestData);
  if (fetchTaxDetails) {
    const { Chargers } = fetchTaxDetails;

    Chargers?.forEach((ch, idx) => {
      ch.idx = idx;
      ch.index = idx;
      ch.indexValue = idx;
    });

    // Assign charges
    values.tblInvoiceCharge = Array.isArray(Chargers) ? Chargers : [];

    // ✅ Preserve billingPartyId as number
    setStateVariable((prev) => {
      return {
        ...prev,
        ...values,
        billingPartyId: finalBillingPartyId || prev.billingPartyId,
        billingPartyIddropdown:
          newState?.billingPartyIddropdown?.length > 0
            ? newState.billingPartyIddropdown
            : prev.billingPartyIddropdown,
      };
    });
  }
};
const getBillingPartyFromJob = async (obj) => {
  let { newState, setStateVariable, values } = obj;

  const { blId } = newState;
  const { companyId, clientId } = getUserDetails();

  const requestData = { id: blId };
  const fetchInvoice = await getGeneralLegerBillingParty(requestData);

  // normalize response
  const invoiceList = Array.isArray(fetchInvoice)
    ? fetchInvoice
    : Array.isArray(fetchInvoice?.Chargers)
      ? fetchInvoice.Chargers
      : [];

  if (invoiceList.length > 0) {
    const selectedLedger = invoiceList[0];
    const ledgerId = selectedLedger?.LedgerId
      ? String(selectedLedger.LedgerId) // force string for consistency
      : null;
    const ledgerName = selectedLedger?.LedgerName || "";

    const updatedState = {
      ...newState,
      billingPartyId: ledgerId, // ✅ set the value
      billingPartyIddropdown: ledgerId
        ? [{ value: ledgerId, label: ledgerName }]
        : [],
    };

    // update global state
    setStateVariable(updatedState);

    return {
      type: "success",
      result: true,
      newState: updatedState,
      values,
      message: "Billing Party updated from Ledger successfully!",
    };
  } else {
    return {
      type: "warning",
      result: false,
      newState,
      values,
      message: "No ledger found for this BL!",
    };
  }
};

const setBlDetails = async (obj) => {
  try {
    // 1. Run billing party
    const billingPartyResult = await getBillingPartyFromJob(obj);

    // 2. Run BL charges
    const blChargesResult = await getBlChargesForPaty({
      ...obj,
      newState: billingPartyResult?.newState || obj.newState,
      values: billingPartyResult?.values || obj.values,
    });

    // 3. Run vessel/voyage
    const vesselVoyageResult = await setVesslelVoyage({
      ...obj,
      newState: blChargesResult?.newState || billingPartyResult?.newState,
      values: blChargesResult?.values || billingPartyResult?.values,
    });

    // 4. Merge results safely
    const finalNewState = {
      ...obj.newState,
      ...billingPartyResult?.newState,
      ...blChargesResult?.newState,
      ...vesselVoyageResult?.newState,
    };

    const finalValues = {
      ...obj.values,
      ...billingPartyResult?.values,
      ...blChargesResult?.values,
      ...vesselVoyageResult?.values,
    };

    // 🔹 Ensure billing party always survives
    finalNewState.billingPartyId =
      billingPartyResult?.newState?.billingPartyId ??
      blChargesResult?.newState?.billingPartyId ??
      obj.newState?.billingPartyId;

    finalNewState.billingPartyIddropdown =
      billingPartyResult?.newState?.billingPartyIddropdown ??
      blChargesResult?.newState?.billingPartyIddropdown ??
      obj.newState?.billingPartyIddropdown;

    finalValues.billingPartyId = finalNewState.billingPartyId;
    finalValues.billingPartyIddropdown = finalNewState.billingPartyIddropdown;

    // ✅ Commit to state
    obj.setStateVariable((prev) => ({
      ...prev,
      ...finalNewState,
      ...finalValues,
    }));

    return {
      type: "success",
      result: true,
      newState: finalNewState,
      values: finalValues,
      message: "Billing Party, BL Charges, Vessel/Voyage updated successfully!",
    };
  } catch (error) {
    console.error("Error setting BL details:", error);
    return {
      type: "error",
      result: false,
      newState: obj.newState,
      values: obj.values,
      message: "Error while setting BL details.",
    };
  }
};

const filterContainerNo = async (obj) => {
  const {
    args,
    values,
    fieldName,
    newState,
    formControlData,
    setFormControlData,
    setStateVariable,
  } = obj;

  const { plrAgentId, plrAgentBranchId } = newState;
  const { depotId } = values;

  const requestData = {
    plrAgentId,
    plrAgentBranchId,
    depotId,
    clientId,
  };

  const argNames = args.split(",").map((arg) => arg.trim());
  const containerId = argNames[0];
  console.log("containerId", containerId);
  const fetchContainerDetails = await fetchContainerNoData(requestData);

  const idsPattern = `(${fetchContainerDetails.Chargers.map(
    (c) => `'${c.containerId}'`
  ).join(",")})`;
  const query = `and id in ${idsPattern}`;
  console.log("idsPattern", query);

  // assumes: formControlData.child[0].fields[1] exists
  const updatedFormControlData = {
    ...formControlData,
    child: (formControlData.child ?? []).map((section) => ({
      ...section,
      fields: (section.fields ?? []).map((f) =>
        f?.id === 104122 || f?.fieldname === "containerId"
          ? { ...f, dropdownFilter: query }
          : f
      ),
    })),
  };

  setFormControlData((prevState) => ({
    ...prevState,
    ...updatedFormControlData, // replaces with the new object
  }));

  if (fetchContainerDetails) {
    return {
      isCheck: false,
      type: "success",
      message: "Container Updated successfully!",
      alertShow: true,
      fieldName,
      values,
      newState,
      formControlData: updatedFormControlData, // return updated version
      setFormControlData: setFormControlData,
    };
  } else {
    return {
      isCheck: false,
      type: "info",
      message: "Failed to trigger container update",
      alertShow: false,
      fieldName,
      values,
      newState,
      formControlData, // keep old one
      setFormControlData: setFormControlData,
    };
  }
};

const calculateSec = (obj) => {
  const {
    args,
    values,
    fieldName,
    newState,
    formControlData,
    setFormControlData,
    setStateVariable,
  } = obj;

  const argNames = args.split(",").map((arg) => arg.trim());

  const qty = parseFloat(values[argNames[0]]) || 0;
  const noDays = parseFloat(values[argNames[1]]);
  const exchangeRate = parseFloat(values[argNames[2]]) || 0;
  const rate = parseFloat(values[argNames[3]]) || 0;
  const amountHc = [argNames[4]];
  const amountfc = [argNames[5]];
  // ✅ Handle noOfDays (ignore if null/0)
  const effectiveNoOfDays = isNaN(noDays) || noDays <= 0 ? 1 : noDays;

  // ✅ Calculation
  const totalAmountFc = qty * rate * effectiveNoOfDays;
  const totalAmountHc = totalAmountFc * exchangeRate;

  // ✅ Update state
  setStateVariable((prev) => ({
    ...prev,
    [argNames[4]]: totalAmountFc.toFixed(2),
    [argNames[5]]: totalAmountHc.toFixed(2),
  }));

  return {
    isCheck: false,
    type: "success",
    message: "",
    alertShow: false,
    fieldName,
    values,
    newState,
    formControlData,
  };
};

const setPickUpDate = (obj) => {
  const { args, newState, setStateVariable } = obj;

  const argNames = args.split(",").map((arg) => arg.trim());

  const jobDate = newState[argNames[0]];
  const croValidDays = newState[argNames[1]];
  const pickUpdateKey = argNames[2]; // field name (e.g. "pickupDate")
  const pickUpdate = newState[pickUpdateKey]; // field value

  if (!jobDate || !croValidDays || !pickUpdate) return false;

  const baseDate = new Date(jobDate);
  baseDate.setDate(baseDate.getDate() + Number(croValidDays));

  const pickupDateObj = new Date(pickUpdate);

  if (pickupDateObj.getTime() > baseDate.getTime()) {
    toast.error(
      `Pickup Date (${pickupDateObj.toLocaleDateString()}) must be on or before ${baseDate.toLocaleDateString()}`
    );

    // ❌ Clear the field value
    setStateVariable((prev) => ({
      ...prev,
      [pickUpdateKey]: null, // or "" depending on how you want to reset
    }));

    return false;
  }

  return true;
};

const copyContainerData1 = async (obj) => {
  const { args, values, fieldName, newState, setStateVariable } = obj;
  debugger;

  try {
    const argNames = args.split(",").map((arg) => arg.trim());
    const nextActivity = values[argNames[0]];
    const firstRow = newState.tblContainerMovement?.[0];
    if (!firstRow) return;

    const updatedRows = newState.tblContainerMovement.map((row, index) => {
      if (index === 0) return row;

      return {
        ...row,
        activityId: firstRow.activityId,
        activityIddropdown: firstRow.activityIddropdown,
        toLocationId: firstRow.toLocationId,
        toLocationIddropdown: firstRow.toLocationIddropdown,
        activityDate: firstRow.activityDate,
      };
    });

    // setStateVariable((prev) => ({
    //   ...prev,
    //   tblContainerMovement: updatedRows,
    // }));

    return {
      type: "success",
      result: true,
      message: "Copied first row values to all rows successfully",
      newState: { ...newState, tblContainerMovement: updatedRows },
    };
  } catch (error) {
    console.error("Error in copyContainerData:", error);
    return {
      type: "error",
      result: false,
      message: "Error copying container data. Please try again.",
    };
  }
};

const setTransit = async (obj) => {
  const { args, values, fieldName, newState, setStateVariable } = obj;

  try {
    const argNames = args.split(",").map((arg) => arg.trim());
    const pod = newState[argNames[0]]; // e.g., podId
    const fpd = newState[argNames[1]]; // e.g., fpdId
    const goodsDesc = newState[argNames[3]]; // goodsDesc field name

    if (!pod || !fpd) {
      console.warn("POD or FPD not found in state.");
      return;
    }

    // --- Fetch POD Country ---
    const requestPod = {
      columns: "countryId",
      tableName: "tblPort",
      whereCondition: `id = ${pod}`,
      clientIdCondition: `status=1 FOR JSON PATH, INCLUDE_NULL_VALUES`,
    };
    const responsePod = await fetchReportData(requestPod);
    const podCountry = responsePod?.data?.[0]?.countryId;

    // --- Fetch FPD Country ---
    const requestFpd = {
      columns: "countryId",
      tableName: "tblPort",
      whereCondition: `id = ${fpd}`,
      clientIdCondition: `status=1 FOR JSON PATH, INCLUDE_NULL_VALUES`,
    };
    const responseFpd = await fetchReportData(requestFpd);
    const fpdCountry = responseFpd?.data?.[0]?.countryId;

    console.log("POD Country:", podCountry);
    console.log("FPD Country:", fpdCountry);

    // --- Fetch Destination Country Name ---
    const requestCountry = {
      columns: "name",
      tableName: "tblCountry",
      whereCondition: `id = ${fpdCountry}`,
      clientIdCondition: `status=1 FOR JSON PATH, INCLUDE_NULL_VALUES`,
    };
    const responseCountry = await fetchReportData(requestCountry);
    const countryDestination = responseCountry?.data?.[0]?.name;

    // --- Determine Transit (reversed logic) ---
    const isTransit =
      podCountry && fpdCountry && podCountry !== fpdCountry ? "Y" : "N";

    // --- Prepare Updated goodsDesc ---
    let updatedGoodsDesc = goodsDesc || "";
    const transitRemark = `Cargo in transit to ${countryDestination || "(country of destination)"
      } on consignee’s risk, cost & responsibilities`;

    // Remove any previous existing instance of this line (avoid duplicates)
    updatedGoodsDesc = updatedGoodsDesc
      .replace(
        /Cargo in transit to .*? on consignee’s risk, cost & responsibilities/gi,
        ""
      )
      .trim();

    // Append only if it's transit
    if (isTransit === "Y") {
      if (updatedGoodsDesc) {
        updatedGoodsDesc += updatedGoodsDesc.endsWith(".") ? " " : ". ";
      }
      updatedGoodsDesc += transitRemark;
    }

    // --- Update State ---
    setStateVariable((prev) => ({
      ...prev,
      istransit: isTransit,
      goodsDesc: updatedGoodsDesc,
    }));

    return {
      isCheck: false,
      type: "success",
      message: `Transit check completed. istransit = ${isTransit}`,
      alertShow: false,
      fieldName,
      values,
      newState,
    };
  } catch (error) {
    console.error("Error in setTransit:", error);
    return {
      type: "error",
      result: false,
      message: "Error while checking transit. Please try again.",
    };
  }
};

const setRateBase = async (obj) => {
  const { args, values, fieldName, newState, setStateVariable } = obj;

  try {
    const argNames = args.split(",").map((arg) => arg.trim());
    const chargeId = values[argNames[0]]; // e.g., chargeId
    const rateBasisField = argNames[1]; // e.g., rateBasisId

    // Step 1: Fetch rateBasisId from tblCharge
    const requestCharge = {
      columns: "rateBasisId",
      tableName: "tblCharge",
      whereCondition: `id = ${chargeId}`,
      clientIdCondition: `status=1 FOR JSON PATH, INCLUDE_NULL_VALUES`,
    };
    const responseCharge = await fetchReportData(requestCharge);
    const rateBaseId = responseCharge?.data?.[0]?.rateBasisId;

    if (!rateBaseId) {
      return {
        type: "warning",
        result: false,
        message: "No Rate Basis found for selected charge.",
      };
    }

    // Step 2: Fetch rate basis details from tblMasterData
    const requestRateBase = {
      columns: "id,name",
      tableName: "tblMasterData",
      whereCondition: `id = ${rateBaseId}`,
      clientIdCondition: `status=1 FOR JSON PATH, INCLUDE_NULL_VALUES`,
    };
    const responseRateBase = await fetchReportData(requestRateBase);
    const id = responseRateBase?.data?.[0]?.id;
    const name = responseRateBase?.data?.[0]?.name;

    // Step 3: Update both value and dropdown label
    const updatedValues = {
      ...values,
      [rateBasisField]: id,
      [`${rateBasisField}dropdown`]: [{ value: id, label: name }],
    };

    setStateVariable((prev) => ({
      ...prev,
      [rateBasisField]: id,
      [`${rateBasisField}dropdown`]: [{ value: id, label: name }],
    }));

    return {
      type: "success",
      result: true,
      message: "Rate Basis set successfully!",
      values: updatedValues,
      newState: {
        ...newState,
        [rateBasisField]: id,
        [`${rateBasisField}dropdown`]: [{ value: id, label: name }],
      },
    };
  } catch (error) {
    console.error("Error in setRateBase:", error);
    return {
      type: "error",
      result: false,
      message: "Error while setting Rate Basis. Please try again.",
    };
  }
};
// const setVesselVoyageKenya = async (obj) => {
//   const { args, values, fieldName, newState, setStateVariable } = obj;

//   try {
//     const argNames = args.split(",").map((arg) => arg.trim());
//     const mblNo = newState[argNames[0]]; // e.g., chargeId

//     const requestCharge = {
//       columns: "consigneeText,podVesselId,podVoyageId",
//       tableName: "tblBl",
//       whereCondition: `id = ${mblNo}`,
//       clientIdCondition: `status=1 FOR JSON PATH, INCLUDE_NULL_VALUES`,
//     };
//     const responseCharge = await fetchReportData(requestCharge);
//     const consigneeText = responseCharge?.data?.[0]?.consigneeText;
//     const podVesselId = responseCharge?.data?.[0]?.podVesselId;
//     const podVoyageId = responseCharge?.data?.[0]?.podVoyageId;
//     const updatedValues = {
//       ...values,
//       [vesselId]: podVesselId,
//       [`${vesselId}dropdown`]: [{ value: podVesselId, label: name }],
//        [voyageId]: podVoyageId,
//       [`${voyageId}dropdown`]: [{ value: podVoyageId, label: name }],
//     };

//     setStateVariable((prev) => ({
//       ...prev,
//       [vesselId]: podVesselId,
//       [`${vesselId}dropdown`]: [{ value: podVesselId, label: name }],
//       [voyageId]: podVoyageId,
//       [`${voyageId}dropdown`]: [{ value: podVoyageId, label: name }],
//     }));

//     return {
//       type: "success",
//       result: true,
//       message: "Rate Basis set successfully!",
//       values: updatedValues,
//       newState: {
//         ...newState,
//         [vesselId]: id,
//         [`${vesselId}dropdown`]: [{ value: id, label: name }],
//       },
//     };
//   } catch (error) {
//     console.error("Error in setRateBase:", error);
//     return {
//       type: "error",
//       result: false,
//       message: "Error while setting Rate Basis. Please try again.",
//     };
//   }
// };

const setVesselVoyageKenya = async (obj) => {
  const { args, values, fieldName, newState, setStateVariable } = obj;

  try {
    const argNames = args.split(",").map((arg) => arg.trim());
    const blId = newState[argNames[0]]; // e.g., "blId"

    if (!blId) {
      return {
        type: "warning",
        result: false,
        message: "BL No is missing. Please select a BL first.",
      };
    }

    const requestObj = {
      columns: "podVesselId, podVoyageId, fpdId",
      tableName: "tblBl",
      whereCondition: `id = ${blId}`,
      clientIdCondition: `status=1 FOR JSON PATH, INCLUDE_NULL_VALUES`,
    };

    const response = await fetchReportData(requestObj);
    const blData = response?.data?.[0];

    if (!blData) {
      return {
        type: "warning",
        result: false,
        message: "No data found for selected BL.",
      };
    }

    const { podVesselId, podVoyageId, fpdId } = blData;

    // Fetch Vessel Name
    let vesselName = "";
    if (podVesselId) {
      const vesselReq = {
        columns: "id,name",
        tableName: "tblVessel",
        whereCondition: `id = ${podVesselId}`,
        clientIdCondition: `status=1 FOR JSON PATH, INCLUDE_NULL_VALUES`,
      };
      const vesselRes = await fetchReportData(vesselReq);
      vesselName = vesselRes?.data?.[0]?.name || "";
    }

    // Fetch Voyage Name
    let voyageName = "";
    if (podVoyageId) {
      const voyageReq = {
        columns: "id,name",
        tableName: "tblVoyage",
        whereCondition: `id = ${podVoyageId}`,
        clientIdCondition: `status=1 FOR JSON PATH, INCLUDE_NULL_VALUES`,
      };
      const voyageRes = await fetchReportData(voyageReq);
      voyageName = voyageRes?.data?.[0]?.name || "";
    }

    // Fetch FPD Name
    let fpdName = "";
    if (fpdId) {
      const fpdReq = {
        columns: "id,name",
        tableName: "tblPort",
        whereCondition: `id = ${fpdId}`,
        clientIdCondition: `status=1 FOR JSON PATH, INCLUDE_NULL_VALUES`,
      };
      const fpdRes = await fetchReportData(fpdReq);
      fpdName = fpdRes?.data?.[0]?.name || "";
    }

    const updatedValues = {
      ...values,
      vesselId: podVesselId || null,
      voyageId: podVoyageId || null,
      fpdId: fpdId || null,
      vesselIddropdown: podVesselId
        ? [{ value: podVesselId, label: vesselName }]
        : [],
      voyageIddropdown: podVoyageId
        ? [{ value: podVoyageId, label: voyageName }]
        : [],
      fpdIddropdown: fpdId ? [{ value: fpdId, label: fpdName }] : [],
    };

    setStateVariable((prev) => ({
      ...prev,
      vesselId: podVesselId || null,
      voyageId: podVoyageId || null,
      fpdId: fpdId || null,
      vesselIddropdown: podVesselId
        ? [{ value: podVesselId, label: vesselName }]
        : [],
      voyageIddropdown: podVoyageId
        ? [{ value: podVoyageId, label: voyageName }]
        : [],
      fpdIddropdown: fpdId ? [{ value: fpdId, label: fpdName }] : [],
    }));

    return {
      type: "success",
      result: true,
      message: "Vessel, Voyage, and FPD set successfully!",
      values: updatedValues,
      newState: {
        ...newState,
        ...updatedValues,
      },
    };
  } catch (error) {
    console.error("Error in setVesselVoyageKenya:", error);
    return {
      type: "error",
      result: false,
      message: "Error while setting Vessel, Voyage, and FPD. Please try again.",
    };
  }
};

// const getBlCharges = async (obj) => {
//   let {
//     args,
//     newState,
//     formControlData,
//     setFormControlData,
//     values,
//     fieldName,
//     tableName,
//     setStateVariable,
//   } = obj;

//   console.log("newState", obj);

//   let argNames;
//   let splitArgs = [];
//   if (
//     args === undefined ||
//     args === null ||
//     args === "" ||
//     (typeof args === "object" && Object.keys(args).length === 0)
//   ) {
//     argNames = args;
//   } else {
//     argNames = args.split(",").map((arg) => arg.trim());
//     for (const iterator of argNames) {
//       splitArgs.push(iterator.split("."));
//     }
//   }

//   const {
//     invoiceDate,
//     businessSegmentId,
//     placeOfSupplyStateId,
//     sez,
//     billingPartyId,
//     ownStateId,
//     blId,
//   } = values;

//   const { taxType, billingPartyBranchId, billingPartyStateId, totalInvoiceAmountFc } =
//     newState;

//   const { companyId, clientId, branchId, financialYear, userId } = getUserDetails();

//   const requestData = {
//     clientId,
//     voucherType: newState?.voucherTypeId,
//     DepartmentId: newState?.businessSegmentId || businessSegmentId || 0,
//     blIds: newState?.blId || blId || 0,
//     billingPartyId: newState?.billingPartyId || billingPartyId || 0,
//     companyId,
//     companyBranchId: branchId,
//   };

//   const fetchCharges = await getBlChargeDetails(requestData);

//   if (fetchCharges) {
//     console.log(fetchCharges);
//     const { Chargers } = fetchCharges;

//     for (let index = 0; index < (Chargers?.length || 0); index++) {
//       Chargers[index].idx = index;
//       Chargers[index].index = index;
//       Chargers[index].indexValue = index;

//       const chargeValues = Chargers[index];

//       // Default numeric fields to avoid NaN
//       const safeTotalAmount = Number(chargeValues.totalAmount) || 0;
//       const safeTotalAmountFc = Number(chargeValues.totalAmountFc) || 0;
//       const safeChargeGlId = chargeValues.chargeGlId || 0;
//       const safeSacId = chargeValues.sacId || 0;

//       const taxRequestData = {
//         chargeId: chargeValues.chargeId || 0,
//         invoiceDate: invoiceDate ? moment(invoiceDate).format("YYYY-MM-DD") : null,
//         departmentId: businessSegmentId || 0,
//         glId: safeChargeGlId,
//         placeOfSupply_state: placeOfSupplyStateId || 0,
//         SelectedParentInvId: null,
//         sez: sez || false,
//         customerId: billingPartyId || 0,
//         ownStateId: ownStateId || 0,
//         formControlId: newState?.menuID || 0,
//         totalAmount: safeTotalAmount,
//         totalAmountFc: safeTotalAmountFc,
//         sacCodeId: safeSacId,
//         totalAmountHc: safeTotalAmount,
//         taxType: taxType || "G",
//         companyId,
//         branchId,
//         finYearId: financialYear,
//         userId,
//         clientId,
//         totalAmtInvoiceCurr: Number(totalInvoiceAmountFc) || 0,
//         billingPartyBranch: billingPartyBranchId || 0,
//         billingPartyState: billingPartyStateId || 0,
//       };

//       // Fetch tax per charge
//       let fetchGST = await getTaxDetails(taxRequestData);

//       if (fetchGST) {
//         const { tblTax } = fetchGST;
//         Chargers[index].tblInvoiceChargeTax =
//           tblTax || chargeValues.tblInvoiceChargeTax || [];
//       }
//     }

//     // Set the charges safely
//     values.tblInvoiceCharge = Array.isArray(Chargers) ? Chargers : [];

//     // Update state once
//     setStateVariable((prev) => ({ ...prev, ...values }));
//   }
// };

const getBlCharges = async (obj) => {
  const { newState, values, setStateVariable } = obj;

  // 1️⃣ Fetch charges and taxes
  const requestData = {
    clientId: getUserDetails().clientId,
    voucherType: newState?.voucherTypeId,
    DepartmentId: newState?.businessSegmentId || values.businessSegmentId || 0,
    blIds: newState?.blId || values.blId || 0,
    billingPartyId: newState?.billingPartyId || values.billingPartyId || 0,
    companyId: getUserDetails().companyId,
    companyBranchId: getUserDetails().branchId,
  };

  const fetchCharges = await getBlChargeDetails(requestData);

  if (!fetchCharges?.Chargers?.length) return;

  const { Chargers } = fetchCharges;

  for (let index = 0; index < Chargers.length; index++) {
    const charge = Chargers[index];
    charge.idx = index;
    charge.index = index;
    charge.indexValue = index;

    Object.keys(charge).forEach((key) => {
      if (typeof charge[key] === "string" && isNaN(charge[key])) {
        try {
          charge[key] = JSON.parse(charge[key]);
        } catch (error) {
          charge[key] = charge[key];
        }
      }
    });

    // Safe numeric fields
    const safeTotalAmount = Number(charge.totalAmount) || 0;
    const safeTotalAmountFc = Number(charge.totalAmountFc) || 0;
    const safeChargeGlId = charge.chargeGlId || 0;
    const safeSacId = charge.sacId || 0;

    // Fetch tax
    const taxRequestData = {
      chargeId: charge.chargeId || 0,
      invoiceDate: newState.invoiceDate
        ? moment(newState.invoiceDate).format("YYYY-MM-DD")
        : null,
      departmentId: newState.businessSegmentId || 0,
      glId: safeChargeGlId,
      placeOfSupply_state: newState.placeOfSupplyStateId || 0,
      SelectedParentInvId: null,
      sez: newState.sez || false,
      customerId: newState.billingPartyId || 0,
      ownStateId: newState.ownStateId || 0,
      formControlId: newState.menuID || 0,
      totalAmount: safeTotalAmount,
      totalAmountFc: safeTotalAmountFc,
      sacCodeId: safeSacId,
      totalAmountHc: safeTotalAmount,
      taxType: newState.taxType || "G",
      companyId: getUserDetails().companyId,
      branchId: getUserDetails().branchId,
      finYearId: getUserDetails().financialYear,
      userId: getUserDetails().userId,
      clientId: getUserDetails().clientId,
      totalAmtInvoiceCurr: Number(newState.totalInvoiceAmountFc) || 0,
      billingPartyBranch: newState.billingPartyBranchId || 0,
      billingPartyState: newState.billingPartyStateId || 0,
    };

    const fetchGST = await getTaxDetails(taxRequestData);
    charge.tblInvoiceChargeTax =
      (fetchGST?.tblTax || []).map((t) => ({
        ...t,
        taxAmount: Number((t.taxAmount || 0).toFixed(2)),
        taxableAmount: Number((t.taxableAmount || 0).toFixed(2)),
      })) || [];
  }

  // 2️⃣ Fetch Vessel, Voyage, FPD
  const blId = newState.blId || values.blId;
  const vesselResponse = await setVesselVoyageKenya({
    args: "blId",
    values,
    newState,
    setStateVariable,
  });

  // 3️⃣ Update state **once** with charges + taxes + vessel info
  setStateVariable((prev) => ({
    ...prev,
    tblInvoiceCharge: Chargers,
    vesselId: vesselResponse?.values?.vesselId || null,
    voyageId: vesselResponse?.values?.voyageId || null,
    fpdId: vesselResponse?.values?.fpdId || null,
    vesselIddropdown: vesselResponse?.values?.vesselIddropdown || [],
    voyageIddropdown: vesselResponse?.values?.voyageIddropdown || [],
    fpdIddropdown: vesselResponse?.values?.fpdIddropdown || [],
  }));
};

const setExchangeRateForKenya = async (obj) => {
  const { args, values, fieldName, newState, setStateVariable } = obj;

  try {
    const argNames = args.split(",").map((arg) => arg.trim());
    const voyageId = newState[argNames[0]]; // e.g., "blId"

    if (!voyageId) {
      return {
        type: "warning",
        result: false,
        message: "voyage is missing. Please select a BL first.",
      };
    }

    const requestObj = {
      columns: "exportExchangeRate, importExchangeRate",
      tableName: "tblVoyageRoute",
      whereCondition: `id = ${voyageId}`,
      clientIdCondition: `status=1 FOR JSON PATH, INCLUDE_NULL_VALUES`,
    };

    const response = await fetchReportData(requestObj);
    const voyageData = response?.data?.[0];

    const { exportExchangeRate, importExchangeRate } = voyageData;
    console.log("voyageData", voyageData);
    const updatedValues = {
      ...values,
      //exchangeRate: importExchangeRate || null,
    };

    setStateVariable((prev) => ({
      ...prev,
      //exchangeRate: importExchangeRate || null,
    }));

    return {
      type: "success",
      result: true,
      message: "ExchangeRate set successfully!",
      values: updatedValues,
      newState: {
        ...newState,
        ...updatedValues,
      },
    };
  } catch (error) {
    console.error("Error in setVesselVoyageKenya:", error);
    return {
      type: "error",
      result: false,
      message: "Error while setting exchangeRate. Please try again.",
    };
  }
};

const setBillingPartyForJob = async (obj) => {
  const { args, values, fieldName, newState, setStateVariable } = obj;

  try {
    const argNames = args.split(",").map((arg) => arg.trim());
    const jobId = newState[argNames[0]]; // e.g., "blId"
    if (!jobId) {
      return {
        type: "warning",
        result: false,
        message: "Voyage is missing. Please select a BL first.",
      };
    }

    const requestObj = {
      columns: "customerId",
      tableName: "tblJob",
      whereCondition: `id = ${jobId}`,
      clientIdCondition: `status=1 FOR JSON PATH, INCLUDE_NULL_VALUES`,
    };

    const response = await fetchReportData(requestObj);
    const jobData = response?.data?.[0];
    const { customerId } = jobData || {};

    // const requestObjData = {
    //   columns: "id,name",
    //   tableName: "tblGeneralLedger",
    //   whereCondition: `accCompanyId = ${customerId}`,
    //   clientIdCondition: `status=1 FOR JSON PATH, INCLUDE_NULL_VALUES`,
    // };

    const requestObjData = {
      columns: "id,name",
      tableName: "tblGeneralLedger",
      whereCondition: `accCompanyId = ${customerId} AND ISNULL(name,'') NOT LIKE '%-Cr.%'`,
      clientIdCondition: `status=1 FOR JSON PATH, INCLUDE_NULL_VALUES`,
    };
    const responseData = await fetchReportData(requestObjData);
    const billingPartyData = responseData?.data?.[0];
    const { id, name } = billingPartyData || {};

    // update only billingPartyId here
    setStateVariable((prev) => ({
      ...prev,
      billingPartyId: id || 0,
    }));

    return {
      type: "success",
      result: true,
      message: "Billing party set successfully.",
      values: { ...values, billingPartyId: id || 0 },
      newState: { ...newState, billingPartyId: id || 0 },
    };
  } catch (error) {
    console.error("Error in setBillingPartyForJob:", error);
    return {
      type: "error",
      result: false,
      message: "Error while setting billing party. Please try again.",
    };
  }
};

const setAllocation = async (obj) => {
  const { argsStr, values, newState, setStateVariable } = obj;
  try {
    const argNames = argsStr.split(",").map((arg) => arg.trim());
    const allocatedChecked = values[argNames[0]];
    const OsAmtFC = values[argNames[1]];
    const OsAmtHC = values[argNames[2]]; // e.g., "blId"

    if (allocatedChecked) {
      const updatedValues = {
        ...values,
        [argNames[3]]: OsAmtFC,
        [argNames[4]]: OsAmtHC,
      };
      console.log("updatedValues", updatedValues);
      setStateVariable((prev) => ({
        ...prev,
        [argNames[3]]: OsAmtFC,
        [argNames[4]]: OsAmtHC,
        //billingPartyId: id || 0,
      }));

      return {
        type: "success",
        result: true,
        message: "Allocation Amount set successfully.",
        values: { values, ...updatedValues },
        newState: newState,
      };
    } else {
      console.log("allocatedChecked is false");
      console.log("values", values);
    }
  } catch (error) {
    console.error("Error in setBillingPartyForJob:", error);
    return {
      type: "error",
      result: false,
      message: "Error while setting billing party. Please try again.",
    };
  }
};
const setBillingPartyForJobCr = async (obj) => {
  const { args, values, fieldName, newState, setStateVariable } = obj;

  try {
    const argNames = args.split(",").map((arg) => arg.trim());
    const jobId = newState[argNames[0]]; // e.g., "blId"
    if (!jobId) {
      return {
        type: "warning",
        result: false,
        message: "Voyage is missing. Please select a BL first.",
      };
    }

    const requestObj = {
      columns: "customerId",
      tableName: "tblJob",
      whereCondition: `id = ${jobId}`,
      clientIdCondition: `status=1 FOR JSON PATH, INCLUDE_NULL_VALUES`,
    };

    const response = await fetchReportData(requestObj);
    const jobData = response?.data?.[0];
    const { customerId } = jobData || {};

    const requestObjData = {
      columns: "id,name",
      tableName: "tblGeneralLedger",
      whereCondition: `accCompanyId = ${customerId} AND ISNULL(name,'')  LIKE '%-Cr.%'`,
      clientIdCondition: `status=1 FOR JSON PATH, INCLUDE_NULL_VALUES`,
    };
    const responseData = await fetchReportData(requestObjData);
    const billingPartyData = responseData?.data?.[0];
    const { id, name } = billingPartyData || {};

    setStateVariable((prev) => ({
      ...prev,
      billingPartyId: id || 0,
    }));

    return {
      type: "success",
      result: true,
      message: "Billing party set successfully.",
      values: { ...values, billingPartyId: id || 0 },
      newState: { ...newState, billingPartyId: id || 0 },
    };
  } catch (error) {
    console.error("Error in setBillingPartyForJob:", error);
    return {
      type: "error",
      result: false,
      message: "Error while setting billing party. Please try again.",
    };
  }
};

const setSalePerson = async (obj) => {
  const { args, values, fieldName, newState, setStateVariable } = obj;

  try {
    const argNames = args.split(",").map((arg) => arg.trim());
    const customer = newState[argNames[0]];

    if (!customer) {
      return {
        type: "warning",
        result: false,
        message: "Customer is missing. Please select a customer first.",
      };
    }

    // Fetch marketing person ID from tblCompany
    const requestObj = {
      columns: "marketingPersonId",
      tableName: "tblCompany",
      whereCondition: `id = ${customer}`,
      clientIdCondition: `status=1 FOR JSON PATH, INCLUDE_NULL_VALUES`,
    };

    const response = await fetchReportData(requestObj);
    const companyData = response?.data?.[0];

    const salesExecutiveId = companyData?.marketingPersonId || null;

    // Update state
    setStateVariable((prev) => ({
      ...prev,
      salesExecutiveId: salesExecutiveId,
    }));

    return {
      type: "success",
      result: true,
      message: "Sales executive set successfully.",
      values: { ...values, salesExecutiveId },
      newState: { ...newState, salesExecutiveId },
    };
  } catch (error) {
    console.error("Error in setSalePerson:", error);
    return {
      type: "error",
      result: false,
      message: "Error while setting Sales Executive. Please try again.",
    };
  }
};

const fetchPartyBalance = async (obj) => {
  let {
    args,
    newState,
    formControlData,
    setFormControlData,
    values,
    fieldName,
    tableName,
    setStateVariable,
  } = obj;
  // parse args (unchanged)
  let argNames;
  let splitArgs = [];
  if (
    args === undefined ||
    args === null ||
    args === "" ||
    (typeof args === "object" && Object.keys(args).length === 0)
  ) {
    argNames = args;
  } else {
    argNames = args.split(",").map((arg) => arg.trim());
    for (const iterator of argNames) {
      splitArgs.push(iterator.split("."));
    }
  }

  const { paymentByParty } = newState;
  const { clientId } = getUserDetails();
  const requestBody = { clientId, glId: paymentByParty };

  const fetchChargeDetails = await getVoucher(requestBody);
  if (fetchChargeDetails) {
    const vouchers = fetchChargeDetails?.vouchers ?? [];

    // helper: only use fallback when value is null/undefined/""
    const pick = (val, fallback) =>
      val == null || val === "" ? fallback : val;

    const normalized = vouchers.map((v, index) => ({
      ...v,
      idx: index,
      index,
      indexValue: index,
      // prefill balances ONLY if they are empty; otherwise keep as-is
      balanceAmtHC: pick(v.balanceAmtHC, v.OsAmtHC ?? v.balanceAmtHC ?? null),
      balanceAmtFC: pick(v.balanceAmtFC, v.OsAmtFC ?? v.balanceAmtFC ?? null),
      // leave allocated/tds exactly as they came (no type coercion)
    }));

    values.tblVoucherLedgerDetails = normalized;

    // keep your existing flow exactly the same
    homeCurrencyInvoice({ ...obj, values: { ...values } });

    setStateVariable((prev) => ({ ...prev, ...values }));
  }
};

const setSameCurrency = async (obj) => {
  const { args, newState, setStateVariable } = obj;
  ///currencyId,exchangeRate,amtRec,amtRecFC,tdsAmtFC,tdsAmt
  return;
  try {
    const argNames = args.split(",").map((arg) => arg.trim());
    const amtHc = newState?.[argNames[0]];
    const amtFc = newState?.[argNames[1]] || 0;

    // Store in newState
    setStateVariable((prev) => ({
      ...prev,
      [argNames[2]]: amtHc,
      [argNames[3]]: amtFc,
    }));

    return {
      type: "success",
      result: true,
      message: "Amount & TDS calculated successfully",
    };
  } catch (error) {
    console.error("Error in setSameCurrency:", error);
  }
};

const setSameCurrencyFc = async (obj) => {
  const { args, newState, setStateVariable } = obj;

  try {
    // 🔹 Utility: safely convert to number
    const toNum = (v) => {
      if (v === null || v === undefined || v === "") return 0;
      const n = Number(String(v).replace(/,/g, ""));
      return Number.isNaN(n) ? 0 : n;
    };

    const fcData = toNum(newState?.amtRecFC);
    const bankCharges = toNum(newState?.bankCharges);
    const exGainLoss = toNum(newState?.exGainLoss);

    const balanceAmtFc = fcData + bankCharges + exGainLoss;
    // If you want 2 decimals, use:
    // const balanceAmtFc = Math.round((fcData + bankCharges + exGainLoss) * 100) / 100;

    console.log("rohit setSameCurrencyFc", {
      fcData,
      bankCharges,
      exGainLoss,
      balanceAmtFc,
    });

    // Store in newState
    setStateVariable((prev) => ({
      ...prev,
      balanceAmtFc,
    }));

    return {
      type: "success",
      result: true,
      message: "Amount & TDS calculated successfully",
    };
  } catch (error) {
    console.error("Error in setSameCurrencyFc:", error);
    return {
      type: "error",
      result: false,
      message: "Error while calculating FC amount",
    };
  }
};

const setSameCurrencyHc = async (obj) => {
  const { args, newState, setStateVariable } = obj;

  try {
    // 🔹 Utility: safely convert to number
    const toNum = (v) => {
      if (v === null || v === undefined || v === "") return 0;
      const n = Number(String(v).replace(/,/g, ""));
      return Number.isNaN(n) ? 0 : n;
    };

    const hcData = toNum(newState?.amtRec);
    const bankCharges = toNum(newState?.bankCharges);
    const exGainLoss = toNum(newState?.exGainLoss);

    const balanceAmtHc = hcData + bankCharges + exGainLoss;

    console.log("rohit setSameCurrencyHc", {
      hcData,
      bankCharges,
      exGainLoss,
      balanceAmtHc,
    });

    // Store in newState
    setStateVariable((prev) => ({
      ...prev,
      balanceAmtHc,
    }));

    return {
      type: "success",
      result: true,
      message: "Amount & TDS calculated successfully",
    };
  } catch (error) {
    console.error("Error in setSameCurrencyHc:", error);
    return {
      type: "error",
      result: false,
      message: "Error while calculating HC amount",
    };
  }
};

const fetchPartyBalanceThirdLevel = async (obj) => {
  let {
    args,
    newState,
    formControlData,
    setFormControlData,
    values,
    fieldName,
    tableName,
    setStateVariable,
    onChangeHandler,
  } = obj;

  let argNames;
  let splitArgs = [];
  if (
    args === undefined ||
    args === null ||
    args === "" ||
    (typeof args === "object" && Object.keys(args).length === 0)
  ) {
    argNames = args;
  } else {
    argNames = args.split(",").map((arg) => arg.trim());
    for (const iterator of argNames) {
      splitArgs.push(iterator.split("."));
    }
  }
  const { glId } = values;
  const { clientId } = getUserDetails();
  const requestBody = { clientId, glId: glId };

  const fetchChargeDetails = await getVoucherThirdLevelData(requestBody);
  if (fetchChargeDetails && fetchChargeDetails?.vouchers?.length > 0) {
    const vouchers = fetchChargeDetails?.vouchers ?? [];

    const updatedChargers = vouchers.map((item, index) => ({
      ...item,
      indexValue: index,
    }));

    // Update state variable
    setStateVariable((prev) => ({
      ...prev,
      tblVoucherLedgerDetails: updatedChargers,
    }));
  }
};

const LedgerEntriesRule = (obj) => {
  let {
    args,
    newState,
    formControlData,
    setFormControlData,
    values,
    fieldName,
    tableName,
    setStateVariable,
    onChangeHandler,
  } = obj;
  console.log("LedgerEntriesRule called with field:", args);
  const parameter = args.split(",").map((arg) => arg.trim());
  if (parameter.length < 3)
    return toast.error("Invalid parameters for LedgerEntriesRule");
  if (fieldName == parameter[0]) {
    if (values[parameter[2]] > 0 && values[parameter[0]] > 0) {
      toast.error(
        `Both Debit and Credit amounts cannot be greater than zero simultaneously.`
      );
      setStateVariable((prev) => ({
        ...prev,
        [parameter[0]]: 0,
        [parameter[1]]: 0,
      }));
    } else {
      setStateVariable((prev) => ({
        ...prev,
        [parameter[1]]:
          values[parameter[0]] * Number(newState.exchangeRate || 1),
      }));
    }
  }
};

const CompanyBranchSet = async (obj) => {
  try {
    let {
      args,
      newState,
      formControlData,
      setFormControlData,
      values,
      fieldName,
      tableName,
      setStateVariable,
      onChangeHandler,
    } = obj;
    const [conpany, branch] = args.split(",").map((arg) => arg.trim());
    let RequedObj = {
      onfilterkey: "status",
      onfiltervalue: 1,
      referenceTable: "tblCompanyBranch",
      referenceColumn: "name",
      dropdownFilter: `and companyId=${newState[conpany]}`,
      search: "",
      pageNo: 1,
    };
    const res = await dynamicDropDownFieldsData(RequedObj);
    const json = res.data;
    setStateVariable((prev) => {
      return {
        ...prev,
        [branch]: json[0]?.id,
      };
    });
  } catch (error) {
    console.error("Error in CompanyBranchSet:", error);
  }
};

const getAutoAllocateAmount = async (obj) => {
  let {
    args,
    newState,
    formControlData,
    setFormControlData,
    values,
    fieldName,
    tableName,
    setStateVariable,
  } = obj;

  console.log("getAutoAllocateAmount called with args:");
  console.log("getAutoAllocateAmount newState =>>", newState);
  console.log(
    "getAutoAllocateAmount newState?.tblVoucherLedgerDetails =>>",
    newState?.tblVoucherLedgerDetails
  );
  console.log("getAutoAllocateAmount values =>>", values);
  console.log("fieldName values =>>", fieldName);
  // setStateVariable((prev) => ({
  //   ...prev,
  //   tblInvoiceCharge: updatedCharges,
  // }));
};

const getJournalVoucherBalanceCalculate = (obj) => {
  const {
    args,
    values,
    fieldName,
    newState,
    formControlData,
    setStateVariable,
  } = obj || {};

  const argNames = (args || "").split(",").map((arg) => arg.trim());

  const clamp0 = (n) => (n < 0 ? 0 : n);

  const toNum = (v) => {
    if (v === null || v === undefined || v === "") return 0;
    const n = Number(String(v).replace(/,/g, ""));
    return Number.isFinite(n) ? n : 0;
  };

  const debitAmount = toNum(values?.[argNames[0]]);
  const debitAmountFC = toNum(values?.[argNames[1]]);
  const balanceAmount = toNum(values?.[argNames[2]]);
  const balanceAmountFC = toNum(values?.[argNames[3]]);
  const debitAmountChild = toNum(values?.[argNames[4]]); // optional
  const openingBalanceAmount =
    values?.__openingBalanceAmount !== undefined
      ? toNum(values.__openingBalanceAmount)
      : balanceAmount;

  const openingBalanceAmountFC =
    values?.__openingBalanceAmountFC !== undefined
      ? toNum(values.__openingBalanceAmountFC)
      : balanceAmountFC;

  const reduceAmt = debitAmountChild > 0 ? debitAmountChild : debitAmount;

  const reduceAmtFC = debitAmountFC;

  const newBal = clamp0(openingBalanceAmount - reduceAmt);
  const newBalFC = clamp0(openingBalanceAmountFC - reduceAmtFC);

  values.__openingBalanceAmount = openingBalanceAmount;
  values.__openingBalanceAmountFC = openingBalanceAmountFC;

  setStateVariable((prev) => ({
    ...(prev || {}),
    [argNames[2]]: newBal.toFixed(2),
    [argNames[3]]: newBalFC.toFixed(2),
  }));

  return {
    isCheck: false,
    type: "success",
    message: "",
    alertShow: false,
    fieldName,
    values,
    newState,
    formControlData,
  };
};

const checkExchangesRate = async (obj) => {
  let {
    args,
    newState,
    formControlData,
    setFormControlData,
    values,
    fieldName,
    tableName,
    setStateVariable,
  } = obj;

  if (newState?.exchangeRate == null && newState?.calculationType == "FCHC") {
    toast.error("Please Enter Exchange Rate");
    setStateVariable((prev) => ({
      ...prev,
      calculationType: null,
    }));
    return;
  }

  if (
    newState?.calculationType == "FCHC" &&
    (newState?.exchangeRate != 1 || newState?.exchangeRate != "1")
  ) {
    toast.error("For FC-HC Calculation Exchange Rate should be 1");
    setStateVariable((prev) => ({
      ...prev,
      calculationType: null,
      exchangeRate: null,
    }));
    return;
  }
};

const setBlData = async (obj) => {
  const { args, values, fieldName, newState, setStateVariable } = obj;

  try {
    const argNames = args.split(",").map((arg) => arg.trim());
    const containerNo = newState[argNames[0]]; // e.g., "blId"
    if (!containerNo) {
      return {
        type: "warning",
        result: false,
        message: "containerNo is missing. Please select a BL first.",
      };
    }

    const requestObj = {
      columns: " bl.hblNo,bl.id as blId ",
      tableName: "tblbl bl inner join tblBlContainer blc on bl.id=blc.blid",
      whereCondition: ` blc.containerId = ${containerNo}`,
      clientIdCondition: `bl.status=1 order by hblDate desc FOR JSON PATH, INCLUDE_NULL_VALUES`,
    };

    const response = await fetchReportData(requestObj);
    const jobData = response?.data?.[0];
    const { hblNo,blId } = jobData || {};
    console.log("jobData",jobData);
    setStateVariable((prev) => ({
      ...prev,
      blNo:hblNo,
      blId: blId,
    }));

    return {
      type: "success",
      result: true,
      message: "Billing party set successfully.",
      values: { ...values, blNo:hblNo,blId: blId },
      newState: { ...newState,blNo:hblNo, blId: blId},
    };
  } catch (error) {
    console.error("Error in setBillingPartyForJob:", error);
    return {
      type: "error",
      result: false,
      message: "Error while setting billing party. Please try again.",
    };
  }
};

const calculateVoucherAmtDy = async (obj) => {
  const { args, newState, setStateVariable } = obj;
  ///currencyId,exchangeRate,amtRec,amtRecFC,tdsAmtFC,tdsAmt
  try {
    const argNames = args.split(",").map((arg) => arg.trim());
    const currency = newState?.[argNames[0]];
    const exchangeRate = parseFloat(newState?.[argNames[1]]) || 0; // e.g. "exchangeRate"
    const amtRec = parseFloat(newState?.[argNames[2]]) || 0;
    const amtRecFcValue = parseFloat(newState?.[argNames[3]]) || 0;
    const tdsPercent = [argNames[6]] || 0;
    const request = {
      columns: "*",
      tableName: "tblCompanyParameter",
      whereCondition: `currencyId = ${currency} and status = 1`,
      clientIdCondition: `clientId IN (${clientId}, (SELECT id FROM tblClient WHERE clientCode = 'SYSCON')) FOR JSON PATH`,
    };

    const response = await fetchReportData(request);
    const currencyId = response?.data[0]?.currencyId;
    if (currencyId == currency) {
      //amtRecFC
      const amtRecFc = amtRec;
      const onAccountHc = amtRec;
      const OnAccountHFc =amtRec
      // Store in newState
      setStateVariable((prev) => ({
        ...prev,
        [argNames[3]]: amtRecFc,
      }));

      return {
        type: "success",
        result: true,
        message: "Amount & TDS calculated successfully",
        amtRecFc,
        tdsAmtFc,
        tdsAmt,
      };
    } else if (currencyId != currency) {
      const amtRec = amtRecFcValue * exchangeRate;
      const tdsAmtFc = amtRecFcValue * tdsPercent;
      const tdsAmt = amtRec * tdsPercent;

      // Store in newState
      setStateVariable((prev) => ({
        ...prev,
        [argNames[2]]: amtRec,
      }));

      return {
        type: "success",
        result: true,
        message: "Amount & TDS calculated successfully",
        tdsAmtFc,
        tdsAmt,
      };
    }
  } catch (error) {
    console.error("Error in calculateVoucherAmt:", error);
    return {
      type: "error",
      result: false,
      message: "Error calculating voucher amount. Please try again.",
    };
  }
};

const sameDebitAmount = async (obj) => {
  const { args,values, newState, setStateVariable } = obj;
  try {
    const argNames = args.split(",").map((arg) => arg.trim());
    const debitAmount = values?.[argNames[0]];
    setStateVariable((prev) => ({
      ...prev,
      [argNames[1]]: debitAmount,
    }));

    return {
      type: "success",
      result: true,
      message: "Amount & TDS calculated successfully",
    };
  } catch (error) {
    console.error("Error in setSameCurrency:", error);
  }
};
// const setBankVoucher = async (obj) => {
//   const { args,values, newState, setStateVariable } = obj;
//   try {
//     const argNames = args.split(",").map((arg) => arg.trim());
//     const bankName = newState?.[argNames[0]];
//     setStateVariable((prev) => ({
//       ...prev,
//       [argNames[1]]: bankName,
//     }));

//     return {
//       type: "success",
//       result: true,
//       message: "Amount & TDS calculated successfully",
//     };
//   } catch (error) {
//     console.error("Error in setSameCurrency:", error);
//   }
// };

const setTdsAmt = async (obj) => {
  const { args, values, setStateVariable } = obj;

  try {
    // args example: "amtRec,amtRecFC"
    const [hcKey, fcKey] = (args || "")
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

    const toNum = (v) => {
      if (v === null || v === undefined || v === "") return 0;
      const n = typeof v === "number" ? v : Number(String(v).replace(/,/g, ""));
      return Number.isFinite(n) ? n : 0;
    };
    const round2 = (n) => Math.round((n + Number.EPSILON) * 100) / 100;
    const amtHc = toNum(values?.[hcKey]);
    const amtFc = toNum(values?.[fcKey]);

    const isTds = !!values?.tdsApplicable;
    const rate = 0.02; // 2%

    setStateVariable((prev) => {
      const base = prev || {};

      if (!isTds) {
        return {
          ...base,
          tdsAmt: null,     // or 0 if you prefer
          tdsAmtFC: null,   // or 0 if you prefer
        };
      }

      return {
        ...base,
        tdsAmt: round2(amtHc * rate),
        tdsAmtFC: round2(amtFc * rate),
      };
    });

    return {
      type: "success",
      result: true,
      message: "TDS calculated successfully",
    };
  } catch (error) {
    console.error("Error in setTdsAmt:", error);
    return {
      type: "error",
      result: false,
      message: "Failed to calculate TDS",
    };
  }
};



export {
  setSameCurrencyFc,
  setSameCurrencyHc,
  demoFunctionOnChange,
  copyTableFunction,
  dateCheck,
  CheckPrice,
  calculateData,
  textFieldOnChangeFunction,
  onLoadFunction,
  setSameDDValues,
  emptyTargetField,
  setTaxDetails,
  setTDSDetails,
  getJobCharges,
  setStateCodeAndPanNumber,
  validateGST,
  setUserName,
  setBranch,
  validateSameValues,
  SetDecimalsGeneric,
  GetCurrentData,
  validateDate,
  calculateAndUpdateValues,
  setExchangeRate,
  validateContainerNo,
  validateNegativeValue,
  quotationDateValidation,
  validateTemperatureValue,
  checkMatchingCountries,
  checkDifferentCountries,
  removeFilterCondition,
  validateTotalGrossWeight,
  ChargeHeadToChargeDesc,
  setSameSizeValues,
  validateEmail,
  setSameTypeValues,
  setNoOfContainer,
  setUniqueCopyTableName,
  calculateMultipleValues,
  setVesselSec,
  setNewBranch,
  setCountryPhoneCode,
  qtyCheck,
  checkParentDuplications,
  checkGridsDuplication,
  resetFields,
  setSameDDValuesWithCondition,
  checkPortType,
  checkNoDecimals,
  salesExecutiveFilter,
  invoiceDate,
  invoiceSetBillingParty,
  invoiceChargeGrid,
  chargeableWtCal,
  wtCompareGrossWtVolWt,
  setCalculateVolume,
  setFirstExchangeRate,
  currency1,
  dueToFunc,
  setExchangeRateNew,
  setTaxCalculation,
  balanceUpdate,
  baseOnVehicleSetPackage,
  checkVehicleGridDuplicate,
  validateNonZeroValue,
  validateIntegerValue,
  validateFields,
  copyConsigneeToNotifyParty,
  calculateAllFields,
  ownStateSet,
  ownStateGstSet,
  getBranchInvoice,
  getBranchAddressInvoice,
  getCreditPeriod,
  getInvoiceDetails,
  calculateDueDate,
  getVoucherInvoiceDetails,
  homeCurrencyInvoice,
  setGLSacDetails,
  getBlCharges,
  setQtyId,
  setContainerData,
  setContainerNoToDD,
  setHomeCurrencyForCharge,
  compareValue,
  validateDateDo,
  addDate,
  setGridExchangeRate,
  setCargoMovement,
  getBranchAddressInvoiceForForgin,
  setRadioValue,
  setFreightIssue,
  copyConsigneeToNotifyPartyText,
  copyConsigneeToNotifyPartyTextAddres,
  setDate,
  setBranchForContainerMovement,
  setBankByDefault,
  //copyContainerData,
  calculateVoucherAmt,
  getContainerRepairChargeDetails,
  getThirdLevelDetails,
  getBillingPartyFromJob,
  getBlChargesForPaty,
  setInvoiceChargeDetails,
  getThridDatePurchase,
  calculateDetentionRate,
  setNumberDays,
  setVesslelVoyage,
  setBlDetails,
  filterContainerNo,
  calculateSec,
  setPickUpDate,
  setTransit,
  setRateBase,
  setVesselVoyageKenya,
  setExchangeRateForKenya,
  setBillingPartyForJob,
  setAllocation,
  setBillingPartyForJobCr,
  setSalePerson,
  fetchPartyBalance,
  // setSameCurrency
  fetchPartyBalanceThirdLevel,
  LedgerEntriesRule,
  CompanyBranchSet,
  getAutoAllocateAmount,
  getJournalVoucherBalanceCalculate,
  checkExchangesRate,
  setBlData,
  calculateVoucherAmtDy,
  sameDebitAmount,
  setTdsAmt
  //setBankVoucher

};
