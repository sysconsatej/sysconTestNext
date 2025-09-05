"use client";
/* eslint-disable */
import * as React from "react";
import { useState, useRef, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import styles from "@/app/app.module.css";
import Accordion from "@mui/material/Accordion";
import AccordionSummary from "@mui/material/AccordionSummary";
import AccordionDetails from "@mui/material/AccordionDetails";
import Typography from "@mui/material/Typography";
import CloseOutlinedIcon from "@mui/icons-material/CloseOutlined";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import PrintModal from "@/components/Modal/printModal.jsx";
import Allocation from "@/components/Modal/allocation.jsx";
import {
  masterTableInfo,
  formControlMenuList,
  handleSubmitApi,
  fetchDataAPI,
  gettingTaxDetailsQuotation,
  validateSubmit,
} from "@/services/auth/FormControl.services.js";
import { ButtonPanel } from "@/components/Buttons/customeButton.jsx";
import CustomeInputFields from "@/components/Inputs/customeInputFields";
import IconButton from "@mui/material/IconButton";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import { getUserDetails } from "@/helper/userDetails";
import Paper from "@mui/material/Paper";
import { toast, ToastContainer } from "react-toastify";
import {
  refreshIcon,
  saveIcon,
  addLogo,
  revertHover,
  saveIconHover,
  plusIconHover,
} from "@/assets";
import LightTooltip from "@/components/Tooltip/customToolTip";
import RowComponent from "@/app/(groupControl)/formControl/addEdit/RowComponent";
import PropTypes from "prop-types";
import InputBase from "@mui/material/InputBase";
import Divider from "@mui/material/Divider";
import SearchIcon from "@mui/icons-material/Search";
import ClearIcon from "@mui/icons-material/Clear";
import CustomeModal from "@/components/Modal/customModal.jsx";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";
import HoverIcon from "@/components/HoveredIcons/HoverIcon";
import Attachments from "@/app/(groupControl)/formControl/addEdit/Attachments.jsx";
import {
  parentAccordionSection,
  SummaryStyles,
  childAccordionSection,
  accordianDetailsStyleForm,
  createAddEditPaperStyles,
  childTableHeaderStyle,
  searchInputStyling,
  gridEditIconStyles,
  childTableRowStyles,
  totalSumChildStyle,
} from "@/app/globalCss";
import { areObjectsEqual, hasBlackValues } from "@/helper/checkValue";
import EditNoteRoundedIcon from "@mui/icons-material/EditNoteRounded";
import SaveOutlinedIcon from "@mui/icons-material/SaveOutlined";
import * as formControlValidation from "@/helper/formControlValidation";
import CustomeBreadCrumb from "@/components/BreadCrumbs/breadCrumb";
import { AddRow } from "../AddRow";
import * as onSubmitValidation from "@/helper/onSubmitFunction";
import QuotationModal from "@/components/Modal/quotationModal.jsx";
import QuotationModalAir from "@/components/Modal/quotationModalAir.jsx";
import VenderModal from "@/components/Modal/vendorModal";
import CreateBatchModal from "@/components/Modal/createBatch";
import { fetchReportData } from "@/services/auth/FormControl.services";
import { decrypt } from "@/helper/security";
import { updateFlag } from "@/app/counterSlice";
import { useDispatch, useSelector } from "react-redux";

import _ from "lodash";
import { useChargesData } from "@/helper";
import { parse } from "dotenv";
import { encryptUrlFun } from "@/utils";
import { f } from "html2pdf.js";

const checkEmptyField = (obj, fieldName) => {
  return obj && obj[fieldName] && obj[fieldName].trim().length > 0;
};

function sortJSON(jsonArray, field, sortOrder) {
  return jsonArray.sort((a, b) => {
    const valueA = a[field];
    const valueB = b[field];
    if (sortOrder === "asc") {
      if (valueA < valueB) return -1;
      if (valueA > valueB) return 1;
      return 0;
    } else if (sortOrder === "desc") {
      if (valueA > valueB) return -1;
      if (valueA < valueB) return 1;
      return 0;
    }
  });
}

function groupAndSortFields(fields) {
  // Group fields by 'sectionHeader'
  const groupedFields = fields.reduce((acc, field) => {
    const section = field.sectionHeader || "default"; // Use 'default' or any other Value for xyzfields without sectionHeader
    acc[section] = acc[section] || [];
    acc[section].push(field);
    return acc;
  }, {});

  // Sort each group by 'sectionOrder'
  Object.keys(groupedFields).forEach((section) => {
    groupedFields[section].sort(
      (a, b) => (a.sectionOrder || 0) - (b.sectionOrder || 0)
    );
  });

  return groupedFields;
}

async function onSubmitFunctionCall(
  functionData,
  newState,
  formControlData,
  values,
  setStateVariable,
  submitNewState,
  setSubmitNewState
) {
  const funcNameMatch = functionData?.match(/^(\w+)/);
  const argsMatch = functionData?.match(/\((.*)\)/);
  //console.log(functionData, "functionData");
  // Check if we have a function name match, and we have an argsMatch (even if there are no arguments)
  if (funcNameMatch && argsMatch !== null) {
    const funcName = funcNameMatch[1];
    const argsStr = argsMatch[1] || "";

    // Find the function in formControlValidation by the extracted name
    const func = onSubmitValidation?.[funcName];

    if (typeof func === "function") {
      // Prepare arguments: If there are no arguments, argsStr will be an empty string
      let args;
      if (argsStr === "") {
        args = {}; // No arguments, so pass an empty object or as per the function's expected parameters
      } else {
        args = argsStr; // Has arguments, pass them as an object
      }
      //console.log(args);
      // Call the function with the prepared arguments
      let result = onSubmitValidation?.[funcName]({
        args,
        newState,
        formControlData,
        values,
        setStateVariable,
        submitNewState,
        setSubmitNewState,
      });
      return result;
      // onChangeHandler(updatedValues); // Assuming you have an onChangeHandler function to handle the updated values
    }
  }
}
export default function AddEditFormControll() {
  const { push } = useRouter();
  const params = useParams();
  const [firstState, setFirstState] = useState({ routeName: "mastervalue" });
  const dispatch = useDispatch();
  const isRedirected = useSelector((state) => state?.app?.isRedirection);
  const search = JSON.parse(decodeURIComponent(params.id));
  const [isReportPresent, setisReportPresent] = useState(false);
  const isView = search?.isView;
  const isCopy = search?.isCopy;
  const [formControlData, setFormControlData] = useState([]);
  const [parentFieldDataInArray, setParentFieldDataInArray] = useState([]);
  const [parentsFields, setParentsFields] = useState([]);
  const [childsFields, setChildsFields] = useState([]);
  const [newState, setNewState] = useState({ routeName: "mastervalue" });
  const [buttonsData, setButtonsData] = useState(null); // Initialize as null
  const [expandAll, setExpandAll] = useState(true);
  const [openModal, setOpenModal] = useState(false);
  const [isError, setIsError] = useState(false);
  const [paraText, setParaText] = useState("");
  const [typeofModal, setTypeofModal] = useState("onClose");
  const [isRequiredAttachment, setIsRequiredAttachment] = useState(false);
  const [isDataLoaded, setIsDataLoaded] = useState(false);
  const [fetchedApiResponseData, setFetchedApiResponse] = useState([]);
  const [tableName, setTableName] = useState(false);
  const [modalToggle, setModalToggle] = useState(false);
  const [modalToggleAir, setModalToggleAir] = useState(false);
  const [tblRateRequestCharge, setTblRateRequestCharge] = useState(null);
  const [vendorModal, setVendorModal] = useState(false);
  const [scopeOfWork, setScopeOfWork] = useState(null);
  const [createBatch, setCreateBatch] = useState(false);
  const [disabledFieldNames, setDisabledFieldNames] = useState([]);
  const [actionFieldNames, setActionFieldNames] = useState([]);
  const [hideFieldName, setHideFieldName] = useState([]);
  const [submitNewState, setSubmitNewState] = useState({
    routeName: "mastervalue",
  });
  const [initialState, setInitialState] = useState({
    routeName: "mastervalue",
  });
  const [clearFlag, setClearFlag] = useState({
    isClear: false,
    fieldName: "",
  });
  const [ChildTableName, setAllChildTableName] = useState([]);
  const [labelName, setLabelName] = useState("");
  const prevNewStateRef = useRef({});
  const prevNewStateRefData = useRef({});
  const [openPrintModal, setOpenPrintModal] = useState(false);
  const [openAllocation, setOpenAllocation] = useState(false);
  const [submittedRecordId, setSubmittedRecordId] = useState(null);
  const [submittedMenuId, setSubmittedMenuId] = useState(null);
  const [isFormSaved, setIsFormSaved] = useState(false);
  const childTableRow = useSelector((state) => state?.counter?.childRecord);

  console.log("newState", newState);

  useEffect(() => {
    const fetchChargeDetails = async () => {
      if (
        newState.calculateTax !== undefined &&
        newState.calculateTax !== null
      ) {
        if (newState.tblRateRequestCharge.length > 0) {
          if (newState.calculateTax === true) {
            const businessSegmentId = newState.businessSegmentId;

            // Iterate through all charges and add functionality for each
            for (const charge of newState.tblRateRequestCharge) {
              const chargeId = charge.chargeId;
              const buyRate = charge.buyRate;
              let taxAmount = 0;
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
              try {
                const response = await fetchDataAPI(request);
                const glId = response.data[0].tblChargeDetails[0].glId;
                if (glId) {
                  const requestData = {
                    glId: glId,
                    department: businessSegmentId,
                  };
                  const fetchTaxDetails = await gettingTaxDetailsQuotation(
                    requestData
                  );
                  const taxRate = fetchTaxDetails.taxDetails?.taxRate;
                  if (taxRate && buyRate) {
                    taxAmount = (taxRate * buyRate) / 100;
                    //console.log("taxAmount", taxAmount);
                    charge.buyTaxAmount = taxAmount.toString();
                  } else {
                    //console.log("taxAmount", taxAmount);
                    charge.buyTaxAmount = taxAmount.toString();
                  }
                } else {
                  //console.log("Gl Id is missing!");
                  charge.buyTaxAmount = 0;
                }
              } catch (error) {
                console.error(
                  `Error fetching charge details for chargeId ${chargeId}`,
                  error
                );
              }
            }

            //console.log("Rate Request Rohit- ", newState.tblRateRequestCharge);

            // Update the state using indexValue as unique identifier
            setNewState((prevState) => ({
              ...prevState,
              tblRateRequestCharge: prevState.tblRateRequestCharge.map(
                (charge) => {
                  // Use indexValue to identify the specific charge to update
                  const updatedCharge = newState.tblRateRequestCharge.find(
                    (c) => c.indexValue === charge.indexValue
                  );
                  if (updatedCharge) {
                    return {
                      ...charge, // Spread the existing charge details
                      buyTaxAmount: parseFloat(updatedCharge.buyTaxAmount) || 0, // Insert buyTaxAmount
                    };
                  }
                  return charge; // Return other charges unchanged
                }
              ),
            }));
          } else if (newState.calculateTax === false) {
            //console.log("Rate Request - ", newState.tblRateRequestCharge);

            // Update state in case of false as well
            setNewState((prevState) => ({
              ...prevState,
              tblRateRequestCharge: prevState.tblRateRequestCharge,
            }));
          } else {
            console.error("Unknown Error occurred!");
          }
        }
      }
    };

    // Call the async function inside useEffect
    fetchChargeDetails();
  }, [newState.calculateTax]);

  useEffect(() => {
    function checkIsDataSaved(firstState, newState) {
      return deepEqual(firstState, newState);
    }
    //let isDataMatched = checkIsDataSaved(stateToCheck, newState);
    let isDataMatched = checkIsDataSaved(firstState, newState);
    if (isDataMatched) {
      console.log("All keys & values match 1", firstState);
      console.log("All keys & values match 2", newState);
      // setIsChangesMade(isDataMatched);
      dispatch(
        updateFlag({
          flag: "isRedirection",
          value: isDataMatched,
        })
      );
    } else {
      console.log("Mismatch found. 1", firstState);
      console.log("Mismatch found. 2", newState);
      // setIsChangesMade(isDataMatched);
      dispatch(
        updateFlag({
          flag: "isRedirection",
          value: isDataMatched,
        })
      );
    }
  }, [newState]);

  const isObject = (v) => v !== null && typeof v === "object";
  function deepEqual(a, b) {
    // Primitive or one is not an object: compare directly
    if (!isObject(a) || !isObject(b)) {
      return a === b;
    }

    // Both are arrays?
    if (Array.isArray(a) || Array.isArray(b)) {
      if (!Array.isArray(a) || !Array.isArray(b) || a.length !== b.length) {
        return false;
      }
      return a.every((item, idx) => deepEqual(item, b[idx]));
    }

    // Both are plain objects: compare keys length
    const keysA = Object.keys(a);
    const keysB = Object.keys(b);
    if (keysA.length !== keysB.length) {
      return false;
    }

    // Check each key recursively
    return keysA.every((key) => {
      // if b doesn’t have the key, fail
      if (!Object.prototype.hasOwnProperty.call(b, key)) {
        return false;
      }
      return deepEqual(a[key], b[key]);
    });
  }

  useEffect(() => {
    let allChildTableName = [];
    childsFields.map((item) => {
      allChildTableName.push(item?.tableName);
    });
    //console.log("allChildTableName =>", allChildTableName);
    setAllChildTableName(allChildTableName);
  }, [childsFields]);
  // aakash-y-code starts here

  // function replaceNullStrings(value, childTableNames = []) {
  //   // 1) If it’s literally null, undefined, the string "null", or the empty string → null
  //   if (value == null || value === "null" || value === "") {
  //     return null;
  //   }

  //   // 2) Arrays: recurse into every element
  //   if (Array.isArray(value)) {
  //     return value.map((item) => replaceNullStrings(item, childTableNames));
  //   }

  //   // 3) Objects: recurse into every property
  //   if (typeof value === "object") {
  //     for (const key of Object.keys(value)) {
  //       value[key] = replaceNullStrings(value[key], childTableNames);
  //     }
  //     return value;
  //   }

  //   // 4) Everything else (numbers, booleans, non-empty strings) stays untouched
  //   return value;
  // }

  function replaceNullStrings(value, childTableNames = []) {
    if (value == null || value === "null" || value === "") {
      return null;
    }

    if (Array.isArray(value)) {
      return value.map((item) => replaceNullStrings(item, childTableNames));
    }

    if (typeof value === "object" && value !== null) {
      const newObj = {};
      for (const key of Object.keys(value)) {
        newObj[key] = replaceNullStrings(value[key], childTableNames);
      }
      return newObj;
    }

    return value;
  }

  const getLabelValue = (labelValue) => {
    // //console.log(labelValue, 'labelValue');
    setLabelName(labelValue);
  };

  // aakash-y-code ends here

  const handleOpenModal = () => setOpenModal(true);
  const handleCloseModal = () => setOpenModal(false);

  const handleSave = (data) => {
    const r = data?.tblRateRequestCharge;
    setNewState((prev) => {
      return {
        ...prev,
        tblRateRequestCharge: r,
      };
    });

    setSubmitNewState((prev) => {
      return {
        ...prev,
        tblRateRequestCharge: r,
      };
    });
    handleCloseModal();
  };

  const handleSaveGroup = (data) => {
    const incomingCharges = data?.tblRateRequestCharge || [];
    const mappedCharges = incomingCharges.map((charge, index) => {
      const transformedCharge = {
        ...charge,
        qty: charge.qty ? parseInt(charge.qty) : 0,
      };
      return transformedCharge;
    });
    setNewState((prev) => {
      const updatedState = {
        ...prev,
        tblRateRequestCharge: mappedCharges,
      };
      return updatedState;
    });
    setSubmitNewState((prev) => {
      const updatedSubmitState = {
        ...prev,
        tblRateRequestCharge: mappedCharges,
      };
      return updatedSubmitState;
    });
    handleCloseModal();
  };

  const getCalculatedTotal = (totalWeight, totalVolume) => {
    console.log("formControl totalWeight", totalWeight);
    console.log("formControl totalVolume", totalVolume);
  };

  async function fetchData() {
    const { clientId } = getUserDetails();
    try {
      // Call API for table grid data
      const tableViewApiResponse = await formControlMenuList(search.menuName);

      if (tableViewApiResponse.success) {
        const apiData = tableViewApiResponse.data[0];
        setFetchedApiResponse(apiData);
        setFormControlData(apiData);
        setTableName(apiData.tableName);
        setIsRequiredAttachment(apiData.isRequiredAttachment);

        // Process form fields
        setParentFieldDataInArray(apiData.fields);
        let resData = groupAndSortFields(apiData.fields);
        let updatedFormControlDataParentsFields = { ...resData };

        // 🔹 Fetch Disabled Fields Here
        const disabledFieldNames = await fetchDisabledFields();

        // 🔹 Apply Disabled Logic to Fields
        Object.keys(resData).forEach((section) => {
          updatedFormControlDataParentsFields[section] = resData[section].map(
            (control) => {
              if (disabledFieldNames.includes(control.fieldname)) {
                return {
                  ...control,
                  isColumnDisabled: true,
                  isEditable: false, // Ensure it's not editable
                  // isControlShow: false // Uncomment if you also want to hide it
                };
              }
              return control;
            }
          );
        });

        // 🔹 Set Updated Parent Fields with Disabled Logic
        setParentsFields(updatedFormControlDataParentsFields);
        //console.log("...", updatedFormControlDataParentsFields);
        setChildsFields(apiData.child || apiData.children);
        setButtonsData(apiData.buttons);
      }
      // Fetch Record Data from Master Table
      const apiResponse = await masterTableInfo({
        clientID: parseInt(clientId),
        recordID: parseInt(search.id),
        menuID: parseInt(search.menuName),
      });

      if (apiResponse) {
        let data = apiResponse[0];
        let finalData = {};
        if (search.isCopy) data.id = ""; // Remove ID if Copy Mode

        // 🔹 Handle Copy Mode for Fields & Child Data
        if (search.isCopy) {
          tableViewApiResponse.data[0].fields.forEach((iterator) => {
            if (iterator.isCopy) {
              finalData[iterator.fieldname] = data[iterator.fieldname];
            }
          });

          tableViewApiResponse.data[0].child.forEach((child) => {
            if (child.isChildCopy) {
              finalData[child.tableName] = data[child.tableName];
            }
          });
        } else {
          finalData = data;
        }

        // 🔹 Handle Child and SubChild Data (Without Affecting Existing Logic)
        for (const item of tableViewApiResponse.data[0].child || []) {
          finalData[item.tableName]?.forEach((childData, index) => {
            childData.indexValue = index;
            item.subChild?.forEach((subchildItem) => {
              childData[subchildItem.tableName]?.forEach(
                (subchildData, subIndex) => {
                  subchildData.indexValue = subIndex;
                }
              );
            });
          });
        }

        //console.log("finalData", finalData);

        const updatedState = {
          ...finalData,
          tableName: tableViewApiResponse.data[0].tableName,
          attachment: data?.attachment,
          menuID: search.menuName,
        };
        let deepCloned = structuredClone(updatedState); // or _.cloneDeep
        //added for select for DO in BL
        if (
          deepCloned &&
          Array.isArray(deepCloned?.tblBlContainer) &&
          deepCloned?.tblBlContainer?.length > 0
        ) {
          let selectForDOData = deepCloned?.tblBlContainer.map((item) => ({
            ...item,
            selectForDO: true,
          }));
          deepCloned = {
            ...deepCloned,
            tblBlContainer: selectForDOData,
          };
        }

        setNewState((prev) => ({ ...prev, ...structuredClone(deepCloned) }));
        setSubmitNewState((prev) => ({
          ...prev,
          ...structuredClone(deepCloned),
        }));
        setFirstState((prev) => ({ ...prev, ...structuredClone(deepCloned) }));
        setInitialState((prev) => ({
          ...prev,
          ...structuredClone(deepCloned),
        }));

        // setNewState(updatedState);
        // setSubmitNewState(updatedState);
        // setInitialState(updatedState);

        setTimeout(() => {
          setIsDataLoaded(true);
        }, 500);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  }

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (Object.keys(parentsFields).length > 0) {
      functionHideDisable();
    }
  }, [parentsFields, newState]);

  const fetchDisabledFields = async () => {
    try {
      if (
        !formControlData ||
        !Array.isArray(formControlData.fields) ||
        formControlData.fields.length === 0
      ) {
        return [];
      }

      let disabledColumns = new Set();
      const disabledFieldNames = [];
      const actionFieldNames = [];

      let hideColumns = new Set();
      const hideFieldNames = [];
      const unhideFieldNames = [];

      formControlData.fields.forEach((control) => {
        if (control.isColumnDisabled && control.columnsToDisabled) {
          const fieldName = control.fieldname;
          const parentFieldName = control.fieldname;
          if (fieldName) {
            disabledFieldNames.push(fieldName); // Store field names in array
            actionFieldNames.push({
              parentFieldName: parentFieldName,
              columnsToDisabled: control?.columnsToDisabled,
              sectionHeader: control?.sectionHeader,
            });
          }
          // setActionFieldNames(actionFieldNames);
          const columnsArray = control.columnsToDisabled.split(",");
          columnsArray.forEach((col) => disabledColumns.add(col.trim()));
        }
      });

      formControlData.fields.forEach((control) => {
        if (control.isColumnVisible && control.columnsToHide) {
          const fieldName = control.fieldname;
          const parentFieldName = control.fieldname;
          if (fieldName) {
            unhideFieldNames.push({
              parentFieldName: parentFieldName,
              columnsToHide: control?.columnsToHide,
              sectionHeader: control?.sectionHeader,
            });
          }
        }
      });

      if (actionFieldNames.length > 0 || unhideFieldNames.length > 0) {
        //setActionFieldNames(actionFieldNames);
        const mergedFields =
          actionFieldNames && unhideFieldNames
            ? Array.from(new Set([...actionFieldNames, ...unhideFieldNames]))
            : actionFieldNames || unhideFieldNames || null;

        //console.log("Final Merged Fields:", mergedFields);
        if (mergedFields.length > 0) {
          setActionFieldNames(mergedFields);
        }
      }

      setDisabledFieldNames(disabledFieldNames);

      const disabledColumnsStr = Array.from(disabledColumns).join(",");
      if (!disabledColumnsStr) return [];

      const request = {
        columns: "*",
        tableName: "tblFormFields",
        whereCondition: `id IN (${disabledColumnsStr})`,
        clientIdCondition: `status = 1 FOR JSON PATH`,
      };

      const response = await fetchReportData(request);
      ////console.log("API Response:", response);

      if (response?.data?.length > 0) {
        return response.data.map((item) => item.fieldname); // Extract field names to be disabled
      }
      return [];
    } catch (error) {
      console.error("Error fetching disabled columns:", error);
      return [];
    }
  };

  useEffect(() => {
    let changedFieldNames = [];
    let sectionsArray = [];
    let matchedRecordArray = [];

    // Check which fields have changed by comparing previous & current values
    Object.keys(newState).forEach((field) => {
      if (
        prevNewStateRef.current[field] !== newState[field] &&
        newState[field] !== "" &&
        newState[field] !== null
      ) {
        changedFieldNames.push(field);
      }
    });

    // Update previous state reference
    prevNewStateRef.current = { ...newState };

    if (changedFieldNames.length === 0) return;

    //console.log(`Fields changed: ${changedFieldNames.join(", ")}`);

    // Find all matching records in actionFieldNames
    matchedRecordArray =
      actionFieldNames?.filter((record) =>
        changedFieldNames.includes(record.parentFieldName)
      ) || [];

    //console.log("Matched Records Array:", matchedRecordArray);

    if (matchedRecordArray.length === 0) return;

    // Get section names
    sectionsArray = Object.keys(parentsFields || []);

    if (!sectionsArray.length || !parentsFields[sectionsArray[0]]) return;

    setParentsFields((prevState) => {
      let updatedState = { ...prevState };
      let hasChanges = false;

      matchedRecordArray.forEach((record) => {
        if (
          record?.columnsToHide &&
          typeof record?.columnsToHide === "string"
        ) {
          const hiddenColumnIds = record.columnsToHide.split(",").map(Number);

          const updatedContainerPlanner = updatedState[sectionsArray[0]].map(
            (field) =>
              hiddenColumnIds.includes(field.id) &&
              field.isControlShow !== false
                ? { ...field, columnsToBeVisible: true }
                : field
          );

          const hiddenFieldsFormatted = updatedState[sectionsArray[0]]
            .filter((field) => hiddenColumnIds.includes(field.id))
            .map(
              (field, index) =>
                `${field.controlname}_${field.fieldname}_${field?.id}`
            );

          //console.log("Formatted Hidden Fields:", hiddenFieldsFormatted);
          if (hiddenFieldsFormatted.length > 0) {
            setHideFieldName(hiddenFieldsFormatted);
          }

          if (
            updatedState[sectionsArray[0]].some(
              (field) =>
                hiddenColumnIds.includes(field.id) &&
                field.isControlShow !== false
            )
          ) {
            updatedState[sectionsArray[0]] = updatedContainerPlanner;
            hasChanges = true;
          }
        }

        if (
          record?.columnsToDisabled &&
          typeof record?.columnsToDisabled === "string"
        ) {
          const disabledColumnIds = record.columnsToDisabled
            .split(",")
            .map(Number);

          const updatedContainerPlanner = updatedState[sectionsArray[0]].map(
            (field) =>
              disabledColumnIds.includes(field.id) &&
              field.isControlShow !== false
                ? { ...field, isEditable: true }
                : field
          );

          if (
            updatedState[sectionsArray[0]].some(
              (field) =>
                disabledColumnIds.includes(field.id) &&
                field.isControlShow !== false &&
                !field.isEditable
            )
          ) {
            updatedState[sectionsArray[0]] = updatedContainerPlanner;
            hasChanges = true;
          }
        }
      });

      return hasChanges ? updatedState : prevState;
    });
  }, [newState, actionFieldNames]);

  useEffect(() => {
    let changedFieldNames = [];
    let sectionsArray = [];
    let matchedRecordArray = [];
    let setFieldNameNull = [];

    Object.keys(newState).forEach((field) => {
      if (
        prevNewStateRefData.current[field] !== newState[field] &&
        (newState[field] === null || newState[field] === "")
      ) {
        changedFieldNames.push(field);
      }
    });

    prevNewStateRefData.current = { ...newState };

    if (changedFieldNames.length === 0) return;

    //console.log(`Fields changed to NULL: ${changedFieldNames.join(", ")}`);

    // Find all matching records in actionFieldNames
    matchedRecordArray =
      actionFieldNames?.filter((record) =>
        changedFieldNames.includes(record.parentFieldName)
      ) || [];

    //console.log("Matched Records Array:", matchedRecordArray);

    // Get all section names from parentsFields
    sectionsArray = Object.keys(parentsFields || []);

    if (matchedRecordArray.length > 0) {
      matchedRecordArray.forEach((matchedRecord) => {
        if (matchedRecord.columnsToDisabled) {
          // Extract IDs from matchedRecord.columnsToDisabled
          const disabledIds = matchedRecord.columnsToDisabled
            .split(",")
            .map((col) => col.trim());

          // Loop through formControlData.fields to find matching IDs
          formControlData.fields.forEach((control) => {
            if (disabledIds.includes(control.id.toString())) {
              //console.log("Matched Field:", control?.fieldname);
              setFieldNameNull.push(control?.fieldname);
              //console.log("setFieldNameNull =>>", setFieldNameNull);
            }
          });
        }
      });
    }

    setNewState((prev) => {
      return {
        ...prev,
        ...setFieldNameNull.reduce((acc, field) => {
          acc[field] = null;
          return acc;
        }, {}),
      };
    });

    if (matchedRecordArray.length === 0) return;

    sectionsArray = Object.keys(parentsFields || []);

    if (!sectionsArray.length || !parentsFields[sectionsArray[0]]) return;

    setParentsFields((prevState) => {
      let updatedState = { ...prevState };
      let hasChanges = false;

      matchedRecordArray.forEach((record) => {
        if (
          record?.columnsToHide &&
          typeof record?.columnsToHide === "string"
        ) {
          const hiddenColumnIds = record.columnsToHide.split(",").map(Number);

          const updatedContainerPlanner = updatedState[sectionsArray[0]].map(
            (field) =>
              hiddenColumnIds.includes(field.id) &&
              field.isControlShow !== false
                ? { ...field, columnsToBeVisible: false }
                : field
          );

          const hiddenFieldsFormatted = updatedState[sectionsArray[0]]
            .filter((field) => hiddenColumnIds.includes(field.id))
            .map(
              (field, index) =>
                `${field.controlname}_${field.fieldname}_${field?.id}`
            );

          //console.log("Formatted Hidden Fields:", hiddenFieldsFormatted);
          if (hiddenFieldsFormatted.length > 0) {
            setHideFieldName(hiddenFieldsFormatted);
          }

          if (
            updatedState[sectionsArray[0]].some(
              (field) =>
                hiddenColumnIds.includes(field.id) &&
                field.isControlShow !== false
            )
          ) {
            updatedState[sectionsArray[0]] = updatedContainerPlanner;
            hasChanges = true;
          }
        }

        if (
          record?.columnsToDisabled &&
          typeof record?.columnsToDisabled === "string"
        ) {
          const disabledColumnIds = record.columnsToDisabled
            .split(",")
            .map(Number);

          const updatedContainerPlanner = updatedState[sectionsArray[0]].map(
            (field) =>
              disabledColumnIds.includes(field.id) &&
              field.isControlShow !== false
                ? { ...field, isEditable: false }
                : field
          );

          if (
            updatedState[sectionsArray[0]].some(
              (field) =>
                disabledColumnIds.includes(field.id) &&
                field.isControlShow !== false
            )
          ) {
            updatedState[sectionsArray[0]] = updatedContainerPlanner;
            hasChanges = true;
          }
        }
      });

      return hasChanges ? updatedState : prevState;
    });
  }, [newState, actionFieldNames]);

  // useEffect(() => {
  //   function hideUnhide() {
  //     if (
  //       newState?.cargoTypeIddropdown &&
  //       newState?.cargoTypeIddropdown.length > 0 &&
  //       newState?.cargoTypeIddropdown[0]?.label === "HAZARDOUS"
  //     ) {
  //       const updatedArray = parentFieldDataInArray.map((item) => {
  //         if (item.fieldname === "commodity") {
  //           return { ...item, columnsToBeVisible: true };
  //         }
  //         return item;
  //       });
  //       const resData = groupAndSortFields(updatedArray);
  //       let updatedFormControlDataParentsFields = { ...resData };
  //       setParentsFields(updatedFormControlDataParentsFields);
  //     } else {
  //       const updatedArray = parentFieldDataInArray.map((item) => {
  //         if (item.fieldname === "commodity") {
  //           return { ...item, columnsToBeVisible: false };
  //         }
  //         return item;
  //       });
  //       const resData = groupAndSortFields(updatedArray);
  //       let updatedFormControlDataParentsFields = { ...resData };
  //       setParentsFields(updatedFormControlDataParentsFields);
  //     }
  //   }

  //   if (newState.cargoTypeId != null) {
  //     hideUnhide();
  //   }
  // }, [newState.cargoTypeId, parentFieldDataInArray]);

  useEffect(() => {
    console.log("omk", newState);

    const isHazardous = newState?.cargoTypeIddropdown
      ? newState?.cargoTypeIddropdown?.[0]?.label === "HAZARDOUS"
      : newState?.cargoTypeId === 164;

    const routeLabel = newState?.routeIddropdown?.[0]?.label || "";
    const isTranshipment = routeLabel === "Transhipment";

    const isSwitchBl = newState?.switchBl === "1";

    const isHss = newState?.hss === true || newState?.hss === "true";

    const fieldsToShowForHazardous = ["imoId"];
    const fieldsToShowForTranshipment = [
      "transhipPort1Id",
      "transhipPort1AgentId",
      "transhipPort1AgentBranchId",
      "transhipPort2Id",
      "transhipPort2AgentId",
      "transhipPort2AgentBranchId",
      "transhipPort3Id",
      "transhipPort3AgentId",
      "transhipPort3AgentBranchId",
      "tranship1LoadVesselId",
      "tranship1LoadVoyageId",
      "tranship2LoadVesselId",
      "tranship2LoadVoyageId",
    ];
    const fieldsToShowForSwitchBl = ["switchAgentId", "switchAgentBranchId"];
    const fieldsToShowForHss = ["newConsigneeAddress", "newConsigneeText"];

    const updatedArray = parentFieldDataInArray.map((item) => {
      if (fieldsToShowForHazardous.includes(item.fieldname)) {
        return { ...item, columnsToBeVisible: isHazardous };
      }

      if (fieldsToShowForTranshipment.includes(item.fieldname)) {
        return { ...item, columnsToBeVisible: isTranshipment };
      }

      if (fieldsToShowForSwitchBl.includes(item.fieldname)) {
        return { ...item, columnsToBeVisible: isSwitchBl };
      }

      if (fieldsToShowForHss.includes(item.fieldname)) {
        return { ...item, columnsToBeVisible: isHss };
      }

      return item;
    });

    const resData = groupAndSortFields(updatedArray);
    setParentsFields({ ...resData });
  }, [
    newState.cargoTypeId,
    newState.routeId,
    newState.routeIddropdown,
    newState.switchBl,
    newState.hss, // ✅ Dependency for HSS
  ]);

  //   useEffect(() => {
  //   const cargoTypeLabel = newState?.cargoTypeIddropdown?.[0]?.label;
  //   const routeLabel = newState?.routeIddropdown?.[0]?.label;

  //   if (!cargoTypeLabel || !routeLabel) return; // ⛔ Skip until data is available

  //   const isHazardous = cargoTypeLabel === "HAZARDOUS";
  //   const isTranshipment = routeLabel === "Transhipment";

  //   const fieldsToShowForHazardous = ["imoId"];
  //   const fieldsToShowForTranshipment = [
  //     "transhipPort1Id",
  //     "transhipPort1AgentId",
  //     "transhipPort1AgentBranchId",
  //     "transhipPort2Id",
  //     "transhipPort2AgentId",
  //     "transhipPort2AgentBranchId",
  //     "transhipPort3Id",
  //     "transhipPort3AgentId",
  //     "transhipPort3AgentBranchId",
  //   ];

  //   const updatedArray = parentFieldDataInArray.map((item) => {
  //     if (fieldsToShowForHazardous.includes(item.fieldname)) {
  //       return { ...item, columnsToBeVisible: isHazardous };
  //     }

  //     if (fieldsToShowForTranshipment.includes(item.fieldname)) {
  //       return { ...item, columnsToBeVisible: isTranshipment };
  //     }

  //     return item;
  //   });

  //   const resData = groupAndSortFields(updatedArray);
  //   setParentsFields({ ...resData });
  // }, [newState?.cargoTypeIddropdown, newState?.routeIddropdown]);
  const functionHideDisable = async () => {
    try {
      const disabledFieldNames = await fetchDisabledFields();

      if (disabledFieldNames.length === 0) {
        console.warn("No matching fields found to disable.");
        return;
      }

      let updatedFormControlData = {
        ...formControlData,
        fields: formControlData.fields.map((control) => {
          if (disabledFieldNames.includes(control.fieldname)) {
            return {
              ...control,
              isColumnDisabled: true,
              isEditable: false,
              // isControlShow: false
            };
          }
          return control;
        }),
      };

      let updatedFormControlDataParentsFields = { ...parentsFields };

      Object.keys(parentsFields).forEach((section) => {
        updatedFormControlDataParentsFields[section] = parentsFields[
          section
        ].map((control) => {
          if (disabledFieldNames.includes(control.fieldname)) {
            return {
              ...control,
              isColumnDisabled: true,
              isEditable: false,
              //isControlShow: false
            };
          }
          return control;
        });
      });

      //console.log(
      // "Updated Parents Fields:",
      // updatedFormControlDataParentsFields
      // );
      //console.log("NewState---", newState);
      if (
        JSON.stringify(formControlRef.current) !==
        JSON.stringify(updatedFormControlData)
      ) {
        formControlRef.current = updatedFormControlData;
        setFormControlData(updatedFormControlData);
        setParentsFields(updatedFormControlDataParentsFields);
      }
    } catch (error) {
      console.error("Error in functionHideDisable:", error);
    }
  };

  // const fetchExchangeRates = async (
  //   charge,
  //   parentCurrencyId,
  //   parentExchangeRate
  // ) => {
  //   try {
  //     let updatedCharge = { ...charge };
  //     //console.log("Processing charge: ", charge);

  //     const { companyId, clientId } = getUserDetails();
  //     //console.log("Fetched user details: ", companyId, clientId);

  //     const requestData = {
  //       columns: "*",
  //       tableName: "tblCompanyParameter",
  //       whereCondition: `companyId = ${companyId}  AND currencyId = ${parentCurrencyId}`,
  //       clientIdCondition: ` status = 1 FOR JSON PATH`,
  //     }; //clientId = ${clientId} AND

  //     //console.log("Making request for home currency check: ", requestData);
  //     const isHomeCurrency = await fetchReportData(requestData);
  //     //console.log("Home currency data: ", isHomeCurrency);

  //     // Fetch exchange rate data for buyCurrencyId
  //     if (charge.buyCurrencyId === parentCurrencyId) {
  //       updatedCharge.buyExchangeRate = 1;
  //     } else if (isHomeCurrency.data && isHomeCurrency.data.length > 0) {
  //       const buyExchangeRateRequestData = {
  //         columns: "ex.exportExchangeRate",
  //         tableName: "tblExchangeRate ex",
  //         whereCondition: `ex.fromCurrencyId = ${parentCurrencyId} AND ex.toCurrencyId = ${updatedCharge.buyCurrencyId}`,
  //         clientIdCondition: `status = 1 FOR JSON PATH`,
  //       }; //ex.clientId = ${clientId} AND

  //       // //console.log(
  //       //   "Making request for buy exchange rates: ",
  //       //   buyExchangeRateRequestData
  //       // );
  //       const fetchedBuyData = await fetchReportData(
  //         buyExchangeRateRequestData
  //       );

  //       //console.log("Fetched buy exchange rate data: ", fetchedBuyData);
  //       const buyExchangeRateFromMaster =
  //         fetchedBuyData.data[0]?.exportExchangeRate;

  //       updatedCharge.buyExchangeRate = buyExchangeRateFromMaster
  //         ? parseFloat(buyExchangeRateFromMaster.toFixed(3))
  //         : 1;
  //     } else if (isHomeCurrency.data.length == 0) {
  //       const buyExchangeRate = 1 / parentExchangeRate;
  //       updatedCharge.buyExchangeRate = parseFloat(buyExchangeRate.toFixed(3));
  //     } else {
  //       updatedCharge.buyExchangeRate = 1;
  //     }

  //     // Fetch exchange rate data for sellCurrencyId
  //     if (charge.sellCurrencyId === parentCurrencyId) {
  //       updatedCharge.sellExchangeRate = 1;
  //     } else if (isHomeCurrency.data && isHomeCurrency.data.length > 0) {
  //       const sellExchangeRateRequestData = {
  //         columns: "ex.exportExchangeRate",
  //         tableName: "tblExchangeRate ex",
  //         whereCondition: `ex.fromCurrencyId = ${parentCurrencyId} AND ex.toCurrencyId = ${updatedCharge.sellCurrencyId}`,
  //         clientIdCondition: `status = 1 FOR JSON PATH`,
  //       };

  //       // //console.log(
  //       //   "Making request for sell exchange rates: ",
  //       //   sellExchangeRateRequestData
  //       // );
  //       const fetchedSellData = await fetchReportData(
  //         sellExchangeRateRequestData
  //       );

  //       //console.log("Fetched sell exchange rate data: ", fetchedSellData);
  //       const sellExchangeRateFromMaster =
  //         fetchedSellData.data[0]?.exportExchangeRate;

  //       updatedCharge.sellExchangeRate = sellExchangeRateFromMaster
  //         ? parseFloat(sellExchangeRateFromMaster.toFixed(3))
  //         : 1;
  //     } else if (isHomeCurrency.data.length == 0) {
  //       const sellExchangeRate = 1 / parentExchangeRate;
  //       updatedCharge.sellExchangeRate = parseFloat(
  //         sellExchangeRate.toFixed(3)
  //       );
  //     } else {
  //       updatedCharge.buyExchangeRate = 1;
  //     }
  //     //console.log("Updated charge: ", updatedCharge);
  //     return updatedCharge;
  //   } catch (error) {
  //     console.error(
  //       "Error fetching exchange rates or updating charge: ",
  //       error
  //     );
  //     throw error;
  //   }
  // };

  useEffect(() => {
    const updateCharges = async () => {
      if (!newState || !newState.tblRateRequestCharge) return;

      const parentCurrencyId = newState.currencyId;
      const parentExchangeRate = newState.exchangeRate;
      const updatedCharges = [];

      for (const charge of newState.tblRateRequestCharge) {
        try {
          const updatedCharge = await fetchExchangeRates(
            charge,
            parentCurrencyId,
            parentExchangeRate
          );
          updatedCharge.buyMargin =
            charge.buyMargin === null || charge.buyMargin === ""
              ? 0
              : charge.buyMargin;
          updatedCharge.sellMargin =
            charge.sellMargin === null || charge.sellMargin === ""
              ? 0
              : charge.sellMargin;
          updatedCharge.buyRate =
            charge.buyRate === null || charge.buyRate === ""
              ? 0
              : charge.buyRate;
          if (charge.buyRate) {
            const buyMarginValue =
              (updatedCharge.buyRate * updatedCharge.buyMargin) / 100 +
              updatedCharge.buyRate;
            const sellRate =
              buyMarginValue +
              (buyMarginValue * updatedCharge.sellMargin) / 100;
            updatedCharge.sellRate = parseFloat(sellRate.toFixed(3));
          }

          updatedCharges.push(updatedCharge);
        } catch (error) {
          console.error(
            "Failed to fetch exchange rates for charge:",
            charge,
            error
          );
          updatedCharges.push({ ...charge, error: "Failed to update charge" }); // Handle error as needed
        }
      }

      if (
        JSON.stringify(updatedCharges) !==
        JSON.stringify(newState.tblRateRequestCharge)
      ) {
        setNewState((prevState) => ({
          ...prevState,
          tblRateRequestCharge: updatedCharges,
        }));
      }
    };

    updateCharges();
  }, [newState]);

  // useEffect(() => {
  //   //console.log("originalObjectsData", originalObjectsData);
  // }, [originalObjectsData]);

  async function onLoadFunctionCall(
    functionData,
    formControlData,
    setFormControlData
  ) {
    const funcNameMatch = functionData?.match(/^(\w+)/);
    // Check for the presence of parentheses to confirm the argument list, even if it's empty
    const argsMatch = functionData?.match(/\((.*)\)/);

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
        // Call the function with the prepared arguments
        const updatedValues = await func({
          args,
          newState,
          formControlData,
          setFormControlData,
        });
        if (updatedValues) {
          //console.log("updatedValues", updatedValues);
        }
      }
    }
  }

  useEffect(() => {
    if (isDataLoaded) {
      if (fetchedApiResponseData?.functionOnLoad?.length > 0) {
        const funcCallString = fetchedApiResponseData?.functionOnLoad;
        if (funcCallString) {
          let multiCallFunctions = funcCallString.split(";");
          multiCallFunctions.forEach((funcCall) => {
            onLoadFunctionCall(funcCall, formControlData, setFormControlData);
          });
        }
      }
    }
  }, [isDataLoaded]);

  // charged Group Data
  const { chargedData } = useChargesData(newState?.scopeOfWork);

  const getVendorModalData = (data) => {
    const newData = newState?.tblRateRequestCharge?.map((item) => {
      const newItem = data?.find(
        (update) => update?.indexValue === item?.indexValue
      );
      return newItem ? newItem : item;
      // return newItem
      //   ? {
      //     ...item,
      //     buyRate: newItem?.buyRate,
      //     buyCurrencyId: newItem?.buyCurrencyId,
      //     buyCurrencyIdDropdown: newItem?.changeCurrency
      //       ? newItem?.changeCurrency?.label
      //       : item.buyCurrencyIdDropdown,
      //     buyCurrencyIddropdown: newItem?.changeCurrency
      //       ? [newItem?.changeCurrency]
      //       : null,
      //   }
      //   : item;
    });

    setNewState((prev) => {
      return {
        ...prev,
        tblRateRequestCharge: newData,
      };
    });

    setSubmitNewState((prev) => {
      return {
        ...prev,
        tblRateRequestCharge: newData,
      };
    });
  };
  const getCreateBatchModal = (data) => {
    //console.log("Data after the edit page", data);

    setNewState((prev) => {
      return {
        ...prev,
        tblWhTransactionDetails: data,
      };
    });

    setSubmitNewState((prev) => {
      return {
        ...prev,
        tblWhTransactionDetails: data,
      };
    });

    handleCloseModal(); // Close the modal
  };

  async function checkReportPresent(menuId) {
    const { clientId } = getUserDetails();
    if (menuId) {
      const requestBody = {
        columns:
          "mrm.reportMenuId,mrm.reportTemplateId,tm.menuName,tm.menuLink,tm.menuType,tm.clientId",
        tableName:
          "tblMenuReportMapping mrm Inner Join tblMenu tm on mrm.reportMenuId = tm.id",
        whereCondition: `mrm.menuId = ${menuId} and tm.status = 1 and mrm.clientId in (${clientId} ,(select id from tblClient where clientCode = 'SYSCON'))`,
        clientIdCondition: `mrm.status = 1 FOR JSON PATH, INCLUDE_NULL_VALUES`,
      };
      try {
        const response = await fetchReportData(requestBody);
        const data = response.data || response;
        if (data.length > 0) {
          setisReportPresent(true);
        } else {
          setisReportPresent(false);
        }
      } catch (error) {
        console.error(error);
      }
    }
  }

  useEffect(() => {
    const fetchDatas = async () => {
      try {
        await checkReportPresent(search?.menuName);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };
    fetchDatas();
  }, [search]);
  useEffect(() => {
    console.log("Third effect triggered with third:", initialState);
  }, [initialState, newState]);

  // Define your button click handlers
  const handleButtonClick = {
    handleSubmit: async () => {
      formControlData._onSubmitResults = {};
      if (isFormSaved)
        return toast.error(
          "This form has already been saved. Please refresh the screen to save one more record"
        );
      const isEqual = areObjectsEqual(newState, initialState);
      if (!isEqual) {
        // eslint-disable-next-line no-unused-vars
        for (const [section, fields] of Object.entries(parentsFields)) {
          const missingField = Object.entries(fields).find(
            // eslint-disable-next-line no-unused-vars
            ([, { isRequired, fieldname, yourlabel }]) =>
              isRequired && !newState[fieldname]
          );

          if (missingField) {
            const [, { yourlabel }] = missingField;
            toast.error(`Value for ${yourlabel} is missing.`);
            return;
          }
        }
        try {
          if (
            formControlData.functionOnSubmit &&
            formControlData.functionOnSubmit !== null
          ) {
            await Promise.all(
              formControlData?.functionOnSubmit.split(";").map((e) =>
                onSubmitFunctionCall(
                  e,
                  newState,
                  formControlData,
                  newState,
                  setNewState,
                  submitNewState,
                  setSubmitNewState
                ).then((res) => {
                  formControlData._onSubmitResults = {
                    function: e,
                    result: res,
                  };
                })
              )
            );
          }
        } catch (error) {
          return toast.error(error.message);
        }
        try {
          const submitData = formControlData?._onSubmitResults?.result?.values
            ? formControlData?._onSubmitResults?.result?.values
            : submitNewState;
          const cleanData = replaceNullStrings(submitData, ChildTableName);
          let data = await handleSubmitApi(cleanData);

          if (data.success == true) {
            toast.success("Submit data successFully");
            setIsFormSaved(true);
            const requestBody = {
              tableName: tableName,
              recordId: search.id,
            };
            const data = await validateSubmit(requestBody);
            if (data.success === true) {
              setParaText(data.message);
              setIsError(false);
              setOpenModal((prev) => !prev);
            }
          } else {
            toast.error(data.message);
          }
          if (data.success == true) {
            // toast.success(data.message);
            if (isReportPresent) {
              const id = data?.data?.recordset[0]?.ParentId;
              setOpenPrintModal((prev) => !prev);
              setSubmittedMenuId(search.menuName);
              setSubmittedRecordId(id);
            }
          } else {
            toast.error(data.message);
          }
        } catch (error) {
          toast.error(error.message);
        }
      } else {
        toast.error("No changes made");
      }
    }, // create Charges
    createCharges: async () => {
      if (
        newState?.scopeOfWork?.length === 0 &&
        newState?.scopeOfWork === "" &&
        newState?.scopeOfWork === null &&
        newState?.scopeOfWork === undefined
      )
        return toast.warn("Please select Scope of Work");
      if (
        newState?.tblRateRequestQty?.length === 0 &&
        newState?.tblRateRequestQty === "" &&
        newState?.tblRateRequestQty === null &&
        newState?.tblRateRequestQty === undefined
      )
        return toast.warn("Please enter Quantity");
      // //console.log(
      //   "Create Charges tblRateRequestQty",
      //   newState?.tblRateRequestQty
      // );
      if (
        Array.isArray(newState?.tblRateRequestCharge) &&
        newState?.tblRateRequestCharge?.length === 0
      ) {
        setNewState((prev) => {
          return { ...prev, tblRateRequestCharge: [] };
        });
      }
      // const duplicateExist = chargedData?.map(item => item?.scopeOfWork === newState?.scopeOfWork);
      // if(duplicateExist) return toast.warn("Charge already exist for this scope of work");
      const quantitesGridData = newState?.tblRateRequestQty;
      const fData = quantitesGridData?.map((r) => {
        return {
          isChecked: r?.isChecked ? r?.isChecked : null,
          sizeId: r.sizeId,
          sizeIdDropdown: Array.isArray(r.sizeIddropdown)
            ? r.sizeIddropdown
            : r.sizeIdDropdown,
          typeId: r.typeId,
          typeIdDropdown: Array.isArray(r.typeIddropdown)
            ? r.typeIddropdown
            : r.typeIdDropdown,
          sizeIddropdown: Array.isArray(r.sizeIddropdown)
            ? r.sizeIddropdown
            : r.sizeIdDropdown,
          qty: r.qty,
        };
      });
      //console.log("quantitesGridData", fData);
      const newData = chargedData?.map((item) => {
        return {
          chargeId: item?.id,
          isChecked: item?.isChecked,
          quantitesGridData: fData,
          charges: item?.charges,
          currencyId: item?.currencyId || "",
          sellCurrencyId: item?.currencyId || "",
        };
      });

      const getChargeDropDown = (chargesId) => {
        const chargedGroupData = chargedData?.filter((x) =>
          x?.charges?.some((y) => y?.id === chargesId)
        );
        return (
          chargedGroupData?.map((r) => ({
            label: r.name,
            value: parseInt(r.value),
            id: r.value,
          })) || []
        );
      };

      const getChargeDropDownId = (chargesId) => {
        const chargedGroupData = chargedData?.filter((x) =>
          x?.charges?.some((y) => y?.id === chargesId)
        );
        const id = chargedGroupData?.map((item) => item.id).join(", ");
        //console.log("chargedGroupData", chargedGroupData);
        return id || "";
      };
      const megeredIntoTheRateRequestCharge =
        newState?.tblRateRequestCharge?.concat(newData);
      // //console.log(
      //   "megeredIntoTheRateRequestCharge",
      //   megeredIntoTheRateRequestCharge
      // );
      const filterData = megeredIntoTheRateRequestCharge?.filter((x) =>
        newData.some((y) => y?.chargeId === x?.chargeId)
      );

      const formatData = filterData?.flatMap((item) =>
        item.quantitesGridData?.flatMap((quantite) =>
          item.charges?.map((charge, _idx) => ({
            quotationFlag: true,
            chargeIddropdown: [{ label: charge.name, value: charge.value }],
            chargeDescription: charge.name,
            chargeId: charge?.id ? String(charge.id) : null,
            sizeId: quantite?.sizeId ? String(quantite.sizeId) : null,
            sizeIddropdown: Array.isArray(quantite.sizeIddropdown)
              ? quantite.sizeIddropdown
              : quantite.sizeIdDropdown,
            typeId: quantite?.typeId ? String(quantite.typeId) : null,
            typeIddropdown: Array.isArray(quantite?.typeIdDropdown)
              ? quantite?.typeIdDropdown
              : quantite?.typeIdDropdown,
            qty: quantite?.qty ? String(quantite.qty) : null,
            indexValue: _idx,
            chargeGroupId: getChargeDropDownId(charge?.id),
            chargeGroupIddropdown: getChargeDropDown(charge?.id),
            buyMargin: charge?.buyMargin ? String(charge.buyMargin) : null,
            sellMargin: charge?.sellMargin ? String(charge.sellMargin) : null,
            buyCurrencyId: charge?.currencyId
              ? String(charge.currencyId)
              : null,
            sellCurrencyId: charge?.currencyId
              ? String(charge.currencyId)
              : null,
            vendorId: null,
            vendorIdDropdown: null,
            vendorIddropdown: [],
          }))
        )
      );

      //console.log("formatData", formatData);

      const updatedData =
        formatData.length !== 0 ? formatData : newState?.tblRateRequestCharge;
      const uniqueItems = Array.from(new Set(updatedData));
      const showItems = uniqueItems.map((item) => {
        return {
          ...item,
          // sizeIdDropdown: item.sizeIdDropdown[0]?.label,
          // typeIdDropdown: item?.typeIdDropdown[0]?.label,
        };
      });
      setNewState((prev) => {
        return {
          ...prev,
          tblRateRequestCharge: showItems.filter((r) => r !== undefined),
        };
      });
      const submitData = uniqueItems.map((item) => {
        return {
          ...item,
          chargeId: item.chargeId || null,
          qty: item.qty,
          sizeId: item.sizeId,
          sizeIdDropdown: Array.isArray(item?.sizeIdDropdown)
            ? item?.sizeIdDropdown[0]?._id
            : item?.sizeIdDropdown,
          sizeIddropdown: Array.isArray(item?.sizeIddropdown)
            ? item.sizeIddropdown[0]?._id
            : item.sizeIdDropdown,
          typeId: item.typeId,
          typeIdDropdown: Array.isArray(item?.typeIdDropdown)
            ? item?.typeIdDropdown[0]?._id
            : item?.typeIdDropdown,
        };
      });

      setSubmitNewState((prev) => {
        return {
          ...prev,
          tblRateRequestCharge: submitData.filter((r) => r !== undefined),
        };
      });
    },
    //akash
    createChargesForAir: async () => {
      //console.log("akData1", newState);
      //console.log("akData", newState?.scopeOfWork);
      if (newState?.scopeOfWork === null) {
        return toast.warn("Please select Scope of Work");
      }
      if (newState?.tblRateRequestQty?.length === 0) {
        return toast.warn("Please enter Quantity");
      }
      const storedUserData = localStorage.getItem("userData");
      if (storedUserData) {
        const decryptedData = decrypt(storedUserData);
        const userData = JSON.parse(decryptedData);
        const clientId = userData[0].clientId;
        try {
          let scopeOfWork = [];
          let dataArray = [];
          let chargeGridData = [];
          let scopeOfWorkMultiselect = [];
          let filteredScopeOfWork = {};
          let fetchScopeOfWorkData = [];

          if (newState?.scopeOfWork) {
            scopeOfWork = newState?.scopeOfWork.split(",");
            //console.log("newState?.scopeOfWork", newState?.scopeOfWork);
            //console.log("test", newState);
            scopeOfWorkMultiselect = newState?.scopeOfWorkmultiselect;
            //console.log("scopeOfWorkMultiselect =>", scopeOfWorkMultiselect);
            for (const work of scopeOfWork) {
              const requestForScopeOfWork = {
                columns: "m.id,m.name",
                tableName: "tblMasterData m",
                whereCondition: `m.id = ${parseInt(work)}`,
                clientIdCondition: `m.status = 1 and m.clientId in (${clientId},(select id from tblClient where clientCode = 'SYSCON')) FOR JSON PATH, INCLUDE_NULL_VALUES`,
              };

              fetchScopeOfWorkData = await fetchReportData(
                requestForScopeOfWork
              );

              filteredScopeOfWork = scopeOfWorkMultiselect?.find(
                (x) => x?.value === parseInt(work)
              );

              const chargesQuery = {
                columns:
                  "c.id,c.name,c.code,c.currencyId,c.dueToId,c.rateBasisId",
                tableName:
                  "tblCharge c Left Join tblChargeGroups cg on cg.chargeId = c.id",
                whereCondition: `cg.chargeGroupId = ${parseInt(work)}`,
                clientIdCondition: `c.status = 1 and cg.status = 1 and c.clientId in (${clientId},(select id from tblClient where clientCode = 'SYSCON')) and cg.clientId in (${clientId},(select id from tblClient where clientCode = 'SYSCON')) FOR JSON PATH, INCLUDE_NULL_VALUES`,
              };

              const response = await fetchReportData(chargesQuery);
              // //console.log(
              //   "fetchScopeOfWorkData?.data[0]?.id",
              //   fetchScopeOfWorkData?.data[0]?.id
              // );
              if (
                response &&
                response.data &&
                Array.isArray(response.data) &&
                response.data.length > 0
              ) {
                const enrichedData = response.data.map((item, index) => ({
                  ...item,
                  chargeId: item.id,
                  chargeIddropdown: [
                    {
                      label: `${item.code} - ${item.name}`,
                      value: item.id,
                    },
                  ],
                  scopeOfWork: parseInt(work),
                  // scopeOfWorkmultiselect: filteredScopeOfWork
                  //   ? [filteredScopeOfWork]
                  //   : [],
                  scopeOfWorkmultiselect:
                    [
                      {
                        value: fetchScopeOfWorkData?.data[0]?.id,
                        label: fetchScopeOfWorkData?.data[0]?.name,
                      },
                    ] || [],
                  chargeGroupIdData: parseInt(
                    fetchScopeOfWorkData?.data[0]?.id
                  ),
                  chargeDescription: item.name,
                }));

                dataArray.push(...enrichedData);
              } else {
                console.warn(`No data found for ${work}`);
              }
            }
          } else {
            console.warn("No scopeOfWork found.");
          }

          for (const item of dataArray) {
            if (item.rateBasisId) {
              const rateBasisRequest = {
                columns: "md.id,md.name",
                tableName: "tblMasterData md",
                whereCondition: `md.id = ${item.rateBasisId}`,
                clientIdCondition: `md.status= 1 and md.clientId in (${clientId},(select id from tblClient where clientCode = 'SYSCON')) FOR JSON PATH, INCLUDE_NULL_VALUES`,
              };
              const rateBasisResponse = await fetchReportData(rateBasisRequest);
              item.rateBasisName = rateBasisResponse?.data[0]?.name || "";
            } else {
              item.rateBasisName = "";
            }

            if (item.dueToId) {
              const dueToRequest = {
                columns: "md.id,md.name",
                tableName: "tblMasterData md",
                whereCondition: `md.id = ${item.dueToId}`,
                clientIdCondition: `md.status= 1 and md.clientId in (${clientId},(select id from tblClient where clientCode = 'SYSCON')) FOR JSON PATH, INCLUDE_NULL_VALUES`,
              };

              const dueToResponse = await fetchReportData(dueToRequest);
              item.dueToName = dueToResponse?.data?.[0]?.name || "";
            } else {
              item.dueToName = "";
            }

            if (item.currencyId) {
              const currencyRequest = {
                columns: "md.id,md.code",
                tableName: "tblMasterData md",
                whereCondition: `md.id = ${item.currencyId}`,
                clientIdCondition: `md.status= 1 and md.clientId in (${clientId},(select id from tblClient where clientCode = 'SYSCON')) FOR JSON PATH, INCLUDE_NULL_VALUES`,
              };

              const currencyResponse = await fetchReportData(currencyRequest);
              item.currencyName = currencyResponse?.data?.[0]?.code || "";
            } else {
              item.currencyName = "";
            }

            if (item.scopeOfWork) {
              item.createdScopeOfWorkmultiselect =
                item.scopeOfWorkmultiselect || "";
            } else {
              item.createdScopeOfWorkmultiselect = "";
            }
          }

          const chargeableWt = newState?.chargeableWt || null;
          const cargoWt = newState?.cargoWt || null;

          if (dataArray.length > 0) {
            chargeGridData = dataArray.map((item, index) => {
              let qty = 1;

              if (
                item.rateBasisName.toLowerCase().includes("chargeable weight")
              ) {
                qty = Number(chargeableWt) || null;
              } else if (
                item.rateBasisName.toLowerCase().includes("gross weight")
              ) {
                qty = Number(cargoWt) || null;
              }

              return {
                quotationFlag: true,
                chargeGroupIddropdown: item.createdScopeOfWorkmultiselect,
                chargeGroupIdText: item.createdScopeOfWorkmultiselect,
                chargeGroupId: String(item.chargeGroupIdData) || null,
                indexValue: index,
                chargeIddropdown: item.chargeIddropdown,
                chargeId:
                  item.chargeId !== null && item.chargeId !== undefined
                    ? String(item.chargeId)
                    : null,
                rateBasisId:
                  item.rateBasisId !== null && item.rateBasisId !== undefined
                    ? String(item.rateBasisId)
                    : null,
                rateBasisIddropdown: [
                  {
                    label: item.rateBasisName,
                    value: item.rateBasisId,
                  },
                ],
                qty: String(qty) || null,
                buyTaxAmount: "0.00",
                chargeDescription: item.chargeDescription
                  ? String(item.chargeDescription)
                  : null,
                dueToId:
                  item.dueToId !== null && item.dueToId !== undefined
                    ? String(item.dueToId)
                    : null,
                dueToIddropdown: [
                  {
                    label: item.dueToName,
                    value: item.dueToId,
                  },
                ],
                buyCurrencyId:
                  item.buyCurrencyId !== null &&
                  item.buyCurrencyId !== undefined
                    ? String(item.buyCurrencyId)
                    : null,
                buyCurrencyIddropdown: [
                  {
                    label: item.currencyName,
                    value: item.buyCurrencyId,
                  },
                ],
                sellCurrencyId:
                  item.sellCurrencyId !== null &&
                  item.sellCurrencyId !== undefined
                    ? String(item.sellCurrencyId)
                    : null,
                sellCurrencyIddropdown: [
                  {
                    label: item.currencyName,
                    value: item.sellCurrencyId,
                  },
                ],
                buyExchangeRate:
                  item.buyExchangeRate !== null &&
                  item.buyExchangeRate !== undefined
                    ? String(item.buyExchangeRate)
                    : null,
                sellExchangeRate:
                  item.sellExchangeRate !== null &&
                  item.sellExchangeRate !== undefined
                    ? String(item.sellExchangeRate)
                    : null,
              };
            });
          }
          const parentCurrencyId = newState.currencyId;
          const parentExchangeRate = newState.exchangeRate;
          //console.log("rohit", chargeGridData);
          const chargesWithExchangeRates = await Promise.all(
            chargeGridData.map(async (charge) => {
              try {
                const updatedCharge = await fetchExchangeRates(
                  charge,
                  parentCurrencyId,
                  parentExchangeRate
                );
                return updatedCharge;
              } catch (error) {
                console.error("Failed to fetch exchange rates:", error);
                return charge;
              }
            })
          );

          //console.log(chargesWithExchangeRates, "chargesWithExchangeRates");

          setNewState((prev) => ({
            ...prev,
            tblRateRequestCharge: chargesWithExchangeRates,
          }));

          setSubmitNewState((prev) => ({
            ...prev,
            tblRateRequestCharge: chargesWithExchangeRates,
          }));

          return chargesWithExchangeRates;
        } catch (error) {
          toast.error(`Error: ${error.message}`);
        }
      }
    },
    //akash
    handleVendorRFQ: () => {
      setScopeOfWork(newState.scopeOfWork);
      if (!checkEmptyField(newState, "scopeOfWork")) {
        toast.error("Scope of Work cannot be empty or null.");
        return;
      }
      if (newState?.tblRateRequestCharge?.length === 0) {
        toast.error("Charge cannot be empty.");
        return;
      }
      setModalToggle(true);
      setTblRateRequestCharge(newState.tblRateRequestCharge);
    },
    handleVendorRFQAir: () => {
      setScopeOfWork(newState.scopeOfWork);
      if (!checkEmptyField(newState, "scopeOfWork")) {
        toast.error("Scope of Work cannot be empty or null.");
        return;
      }
      if (newState?.tblRateRequestCharge?.length === 0) {
        toast.error("Charge cannot be empty.");
        return;
      }
      setModalToggleAir(true);
      setTblRateRequestCharge(newState.tblRateRequestCharge);
    },
    handleEdit: () => {
      toast.error("Not available now");
    },
    handleDelete: () => {
      setNewState(initialState);
      setSubmitNewState(initialState);
    },
    handleClose: () => {
      setParaText(
        !isView
          ? "Do you want to close this form, all changes will be lost?"
          : "Do you want to close this form?"
      );
      setIsError(true);
      setOpenModal((prev) => !prev);
      setTypeofModal("onClose");
      dispatch(
        updateFlag({
          flag: "isRedirection",
          value: true,
        })
      );
    },
    handleSaveClose: async () => {
      formControlData._onSubmitResults = {};
      const isEqual = areObjectsEqual(newState, initialState);
      if (!isEqual) {
        // eslint-disable-next-line no-unused-vars
        for (const [section, fields] of Object.entries(parentsFields)) {
          const missingField = Object.entries(fields).find(
            // eslint-disable-next-line no-unused-vars
            ([, { isRequired, fieldname, yourlabel }]) =>
              isRequired && !newState[fieldname]
          );

          if (missingField) {
            const [, { yourlabel }] = missingField;
            toast.error(`Value for ${yourlabel} is missing.`);
            return;
          }
        }

        try {
          if (
            formControlData.functionOnSubmit &&
            formControlData.functionOnSubmit !== null
          ) {
            await Promise.all(
              formControlData?.functionOnSubmit.split(";").map((e) =>
                onSubmitFunctionCall(
                  e,
                  newState,
                  formControlData,
                  newState,
                  setNewState,
                  submitNewState,
                  setSubmitNewState
                ).then((res) => {
                  formControlData._onSubmitResults = {
                    function: e,
                    result: res,
                  };
                })
              )
            );
          }
        } catch (error) {
          return toast.error(error.message);
        }

        try {
          const submitData = formControlData._onSubmitResults?.result?.values
            ? formControlData._onSubmitResults?.result?.values
            : submitNewState;
          const cleanData = replaceNullStrings(submitData, ChildTableName);
          let data = await handleSubmitApi(cleanData);
          if (data.success == true) {
            dispatch(
              updateFlag({
                flag: "isRedirection",
                value: true,
              })
            );
            toast.success(data.message);
            setTimeout(() => {
              push(
                `/formControl?menuName=${encryptUrlFun({
                  id: search.menuName,
                  menuName: search.menuName,
                  parentMenuId: search.menuName,
                })}`
              );
            }, 500);
          } else {
            toast.error(data.message);
          }
        } catch (error) {
          toast.error(error.message);
        }
      } else {
        toast.error("No changes made");
      }
    },
    handleAllocation: () => {
      setOpenAllocation((prev) => !prev);
    },
    handleSavePrint: async () => {
      const isEqual = areObjectsEqual(newState, initialState);
      if (!isEqual) {
        // eslint-disable-next-line no-unused-vars
        for (const [section, fields] of Object.entries(parentsFields)) {
          const missingField = Object.entries(fields).find(
            // eslint-disable-next-line no-unused-vars
            ([, { isRequired, fieldname, yourlabel }]) =>
              isRequired && !newState[fieldname]
          );

          if (missingField) {
            const [, { yourlabel }] = missingField;
            toast.error(`Value for ${yourlabel} is missing.`);
            return;
          }
        }
        try {
          if (
            formControlData.functionOnSubmit &&
            formControlData.functionOnSubmit !== null
          ) {
            formControlData?.functionOnSubmit
              .split(";")
              .forEach((e) =>
                onSubmitFunctionCall(
                  e,
                  newState,
                  formControlData,
                  newState,
                  setNewState
                )
              );
          }
        } catch (error) {
          return toast.error(error.message);
        }
        try {
          const cleanData = replaceNullStrings(submitNewState, ChildTableName);
          let data = await handleSubmitApi(cleanData);
          if (data.success == true) {
            toast.success(data.message);
            const id = data?.data?.recordset[0]?.ParentId;
            setOpenPrintModal((prev) => !prev);
            setSubmittedMenuId(search.menuName);
            setSubmittedRecordId(id);
          } else {
            toast.error(data.message);
          }
        } catch (error) {
          toast.error(error.message);
        }
      } else {
        toast.error("No changes made");
      }
    },
    handleVendorModal: async () => {
      setVendorModal(true);
    },
    handleCreateBatch: async () => {
      setCreateBatch(true);
    },
  };

  const onConfirm = async (conformData) => {
    if (conformData.type === "onClose") {
      if (conformData.isError) {
        setOpenModal((prev) => !prev);
        setNewState({ routeName: "mastervalue" });
        setSubmitNewState({ routeName: "mastervalue" });
        push(
          `/formControl?menuName=${encryptUrlFun({
            id: search.menuName,
            menuName: search.menuName,
            parentMenuId: search.menuName,
          })}`
        );
      }
    } else if (conformData.type === "onCheck") {
      if (conformData.isError) {
        setOpenModal((prev) => !prev);
        setClearFlag({
          isClear: false,
          fieldName: "",
        });
      }
    }
  };

  return (
    <div className={`h-screen relative`}>
      <CustomeBreadCrumb />
      <form
        onSubmit={handleButtonClick.handleSubmit}
        className="relative top-4"
      >
        {/* Top Button Grid */}
        <ButtonPanel
          buttonsData={buttonsData}
          handleButtonClick={handleButtonClick}
          expandAll={expandAll}
          setExpandAll={setExpandAll}
          topSide={true}
          isView={isView}
        />
        {/* Middle Accrodian view */}
        <div
          className={`w-full p-1 ${styles.pageBackground} overflow-auto overflow-x-hidden ${styles.hideScrollbar}  ${styles.thinScrollBar} `}
          style={{ height: "calc(100vh - 28vh)" }}
        >
          {/* Parents Accordian */}
          {Object.keys(parentsFields).map((section, index) => (
            <React.Fragment key={index}>
              <ParentAccordianComponent
                section={section}
                indexValue={index}
                newState={newState}
                setNewState={setNewState}
                parentsFields={parentsFields}
                expandAll={expandAll}
                isCopy={search.isCopy}
                isView={isView}
                setOpenModal={setOpenModal}
                setParaText={setParaText}
                setIsError={setIsError}
                setTypeofModal={setTypeofModal}
                clearFlag={clearFlag}
                setClearFlag={setClearFlag}
                setSubmitNewState={setSubmitNewState}
                parentTableName={tableName}
                formControlData={formControlData}
                setFormControlData={setFormControlData}
                //
                getLabelValue={getLabelValue}
              />
            </React.Fragment>
          ))}
          {childsFields.map((section, index) => (
            <div key={index} className="w-full">
              <ChildAccordianComponent
                section={section}
                key={index}
                newState={newState}
                setNewState={setNewState}
                indexValue={index}
                expandAll={expandAll}
                setExpandAll={setExpandAll}
                isView={isView}
                setOpenModal={setOpenModal}
                setParaText={setParaText}
                setIsError={setIsError}
                setTypeofModal={setTypeofModal}
                clearFlag={clearFlag}
                setClearFlag={setClearFlag}
                submitNewState={submitNewState}
                setSubmitNewState={setSubmitNewState}
                formControlData={formControlData}
                setFormControlData={setFormControlData}
                getLabelValue={getLabelValue}
                childsFields={childsFields}
                childTableRow={childTableRow}
              />
            </div>
          ))}
          {isRequiredAttachment && (
            <div className="w-full">
              <Attachments
                expandAll={expandAll}
                setExpandAll={setExpandAll}
                isParentAccordionOpen
                isView={isView}
                attachmentsArray={newState?.attachment}
                attachmentsData={newState?.attachment}
                setNewState={setNewState}
                newState={newState}
                isCopy={isCopy}
                setSubmitNewState={setSubmitNewState}
              />
            </div>
          )}
        </div>
        {/* Bottom Button grid */}
        <ButtonPanel
          buttonsData={buttonsData}
          handleButtonClick={handleButtonClick}
          isView={isView}
        />
      </form>
      {/* <CustomeModal /> */}
      {openModal && (
        <CustomeModal
          setOpenModal={setOpenModal}
          openModal={openModal}
          onConfirm={onConfirm}
          isError={isError}
          paraText={paraText}
          typeEvent={typeofModal}
          labelValue={labelName}
        />
      )}
      {modalToggle && (
        <QuotationModal
          newState={newState}
          scopeOfWork={scopeOfWork}
          tblRateRequestCharge={tblRateRequestCharge}
          openModal={modalToggle}
          setOpenModal={setModalToggle}
          isAdd={false}
          onSave={handleSave}
          onSaveGroup={handleSaveGroup}
        />
      )}
      {modalToggleAir && (
        <QuotationModalAir
          newState={newState}
          scopeOfWork={scopeOfWork}
          tblRateRequestCharge={tblRateRequestCharge}
          openModal={modalToggleAir}
          setOpenModal={setModalToggleAir}
          isAdd={true}
          onSave={handleSave}
          onSaveGroup={handleSaveGroup}
        />
      )}
      {vendorModal && (
        <VenderModal
          openModal={vendorModal}
          setOpenModal={setVendorModal}
          tblRateRequestCharge={newState?.tblRateRequestCharge}
          save={getVendorModalData}
          childsFields={childsFields}
          newState={newState}
          isAdd={false}
        />
      )}
      {createBatch && (
        <CreateBatchModal
          openModal={createBatch}
          setOpenModal={setCreateBatch}
          save={getCreateBatchModal}
          newState={newState}
          isAdd={false}
        />
      )}
      {openPrintModal && (
        <PrintModal
          setOpenPrintModal={setOpenPrintModal}
          submittedRecordId={submittedRecordId}
          submittedMenuId={submittedMenuId}
          openPrintModal={openPrintModal}
          pageType={"Forms"}
        />
      )}
      {openAllocation && (
        <Allocation
          setOpenAllocationModal={setOpenAllocation}
          openAllocationModal={openAllocation}
          newState={newState}
          getCalculatedTotal={getCalculatedTotal}
        />
      )}
    </div>
  );
}

ParentAccordianComponent.propTypes = {
  section: PropTypes.any,
  indexValue: PropTypes.any,
  newState: PropTypes.any,
  parentsFields: PropTypes.any,
  expandAll: PropTypes.any,
  isCopy: PropTypes.any,
  setNewState: PropTypes.any,
  isView: PropTypes.any,
  setOpenModal: PropTypes.any,
  setParaText: PropTypes.any,
  setIsError: PropTypes.any,
  setTypeofModal: PropTypes.any,
  clearFlag: PropTypes.any,
  setClearFlag: PropTypes.any,
  setSubmitNewState: PropTypes.any,
  parentTableName: PropTypes.any,
  formControlData: PropTypes.any,
  setFormControlData: PropTypes.any,
  getLabelValue: PropTypes.any,
};

function ParentAccordianComponent({
  section,
  indexValue,
  newState,
  parentsFields,
  expandAll,
  isCopy,
  setNewState,
  isView,
  setOpenModal,
  setParaText,
  setIsError,
  setTypeofModal,
  clearFlag,
  setClearFlag,
  setSubmitNewState,
  parentTableName,
  formControlData,
  setFormControlData,
  getLabelValue,
}) {
  const [isParentAccordionOpen, setIsParentAccordionOpen] = useState(false);
  // Assuming you have a ref to your accordion component
  const handleAccordionClick = () => {
    setIsParentAccordionOpen((prev) => !prev);
  };
  useEffect(() => {
    setIsParentAccordionOpen(expandAll);
  }, [expandAll]);

  const handleFieldValuesChange = (updatedValues) => {
    setNewState((prev) => ({ ...prev, ...updatedValues }));
    setSubmitNewState((prev) => ({ ...prev, ...updatedValues }));
  };

  function handleChangeFunction(result) {
    if (result?.isCheck === false) {
      if (result.alertShow) {
        setParaText(result.message);
        setIsError(true);
        setOpenModal((prev) => !prev);
        setTypeofModal("onCheck");
        setClearFlag({
          isClear: true,
          fieldName: result.fieldName,
        });
      }
      return;
    }
    // let data = { ...result.values };
    let data = { ...result?.newState };
    setNewState((pre) => {
      return {
        ...pre,
        ...data,
      };
    });
    setSubmitNewState((pre) => {
      return {
        ...pre,
        ...data,
      };
    });
  }
  function handleBlurFunction(result) {
    if (result?.isCheck === false) {
      if (result.alertShow) {
        setParaText(result.message);
        setIsError(true);
        setOpenModal((prev) => !prev);
        setTypeofModal("onCheck");
      }
      return;
    }
    // let data = { ...result.values };
    let data = { ...result?.newState };
    setNewState((pre) => {
      return {
        ...pre,
        ...data,
      };
    });
    setSubmitNewState((pre) => {
      return {
        ...pre,
        ...data,
      };
    });
  }

  return (
    <React.Fragment key={indexValue}>
      <Accordion
        expanded={isParentAccordionOpen}
        sx={{
          ...parentAccordionSection,
          "& .MuiPaper-root-MuiAccordion-root::before ": {
            position: "static !important",
            height: "0px !important",
          },
        }}
        key={indexValue}
      >
        <AccordionSummary
          className="relative left-[11px]"
          expandIcon={
            <LightTooltip title={isParentAccordionOpen ? "Collapse" : "Expand"}>
              <ExpandMoreIcon
                sx={{ color: "black" }}
                onClick={handleAccordionClick}
              />
            </LightTooltip>
          }
          aria-controls={`panel${indexValue + 1}-content`}
          id={`panel${indexValue + 1}-header`}
        >
          <Typography key={indexValue} className="relative right-[11px]">
            {section}
          </Typography>
        </AccordionSummary>

        <AccordionDetails
          className={`overflow-hidden  ${styles.thinScrollBar}`}
          sx={{
            ...accordianDetailsStyleForm,
          }}
        >
          <CustomeInputFields
            inputFieldData={parentsFields[section]}
            values={newState}
            onValuesChange={handleFieldValuesChange}
            inEditMode={{ isEditMode: true, isCopy: isCopy }}
            onChangeHandler={(result) => {
              handleChangeFunction(result);
            }}
            onBlurHandler={(result) => {
              handleBlurFunction(result);
            }}
            isView={isView}
            clearFlag={clearFlag}
            newState={newState}
            tableName={parentTableName}
            formControlData={formControlData}
            setFormControlData={setFormControlData}
            setStateVariable={setNewState}
            //
            getLabelValue={getLabelValue}
          />
        </AccordionDetails>
      </Accordion>
    </React.Fragment>
  );
}

ChildAccordianComponent.propTypes = {
  section: PropTypes.any,
  indexValue: PropTypes.any,
  newState: PropTypes.any,
  setNewState: PropTypes.any,
  expandAll: PropTypes.any,
  isCopy: PropTypes.any,
  originalData: PropTypes.any,
  isView: PropTypes.any,
  setOpenModal: PropTypes.any,
  setParaText: PropTypes.any,
  setIsError: PropTypes.any,
  setTypeofModal: PropTypes.any,
  clearFlag: PropTypes.any,
  setClearFlag: PropTypes.any,
  submitNewState: PropTypes.any,
  setSubmitNewState: PropTypes.any,
  formControlData: PropTypes.any,
  setFormControlData: PropTypes.any,
  //
  getLabelValue: PropTypes.any,
  childsFields: PropTypes.any,
  childTableRow: PropTypes.any,
};

function ChildAccordianComponent({
  section,
  indexValue,
  newState,
  setNewState,
  expandAll,
  isCopy,
  isView,
  setOpenModal,
  setParaText,
  setIsError,
  setTypeofModal,
  clearFlag,
  setClearFlag,
  submitNewState,
  setSubmitNewState,
  formControlData,
  setFormControlData,
  getLabelValue,
  childsFields,
  childTableRow,
}) {
  const tableRef = useRef(null);
  const [clickCount, setClickCount] = useState(0);
  const [isChildAccordionOpen, setIschildAccordionOpen] = useState(false);
  const [childObject, setChildObject] = useState({});
  const [renderedData, setRenderedData] = useState([]);
  const [childTableDatas, childTableData] = useState([]);
  const [isInputVisible, setInputVisible] = useState(false);
  const [activeColumn, setActiveColumn] = useState(null);
  const [prevSearchInput, setPrevSearchInput] = useState("");
  const [isAscending, setIsAscending] = useState(true);
  const [sortedColumn, setSortedColumn] = useState(null);
  const [dummyData, setDummyData] = useState([]);
  const [calculateData, setCalculateData] = useState(0);
  const [dummyFieldArray, setDummyFieldArray] = useState([]);
  const [isGridEdit, setIsGridEdit] = useState(false);
  const [checker, setChecker] = useState(true);
  const [copyChildValueObj, setCopyChildValueObj] = useState([]);
  const [columnTotals, setColumnTotals] = useState({ tableName: "" });
  const [containerWidth, setContainerWidth] = useState(0);
  const [inputFieldsVisible, setInputFieldsVisible] = useState(
    newState[section.tableName] !== null ? false : true
  );

  console.log("copyChildValueObj page", copyChildValueObj);
  console.log("childObject", childObject);

  useEffect(() => {
    // const getGridStatus = childsFields.map((item) => {
    //   return {
    //     tableName: item?.tableName,
    //     gridEditableOnLoad: item?.gridEditableOnLoad?.toLowerCase() === "true",
    //   };
    // });
    // console.log("getGridStatus", getGridStatus);
    if (childsFields.length > 0) {
      const gridEditableCount = childsFields.filter(
        (item) => item?.gridEditableOnLoad?.toLowerCase() === "true"
      ).length;
      if (gridEditableCount > 0) {
        setIsGridEdit(!isGridEdit);
      }
    }
  }, [childsFields]);

  // useEffect(() => {
  //   if (formControlData?.tableName === "tblVehicleRoute") {
  //     setSameDDValueFromParentToChild();
  //   }
  // }, [newState?.jobId]);

  // const setSameDDValueFromParentToChild = () => {
  //   // 1. Split and clean up the raw ID/text strings
  //   const rawIds = String(newState.jobId || "").split(",");

  //   // 2. Turn IDs into numbers and drop any empty/invalid ones
  //   const getIds = rawIds
  //     .map((id) => id.trim())
  //     .filter((id) => id !== "")
  //     .map((id) => parseInt(id, 10))
  //     .filter((id) => !isNaN(id));

  //   // 4. Build one route-detail object per ID
  //   const vehicleRouteDetails = getIds.map((id, idx) => ({
  //     jobId: id,
  //     jobIddropdown: fetchReportData(),
  //   }));

  //   const reportPromises = getIds.map((i) => {
  //     const requestBody = {
  //       columns: "id,jobNo",
  //       tableName: "tblJob",
  //       whereCondition: `id = '${i.id}'`,
  //       clientIdCondition: "status=1 FOR JSON PATH",
  //     };
  //     return fetchReportData(requestBody);
  //   });

  //   // if you want to wait for them all:
  //   Promise.all(reportPromises)
  //     .then((results) => {
  //       //console.log("all reports:", results);
  //     })
  //     .catch((err) => console.error("failed to fetch some reports:", err));

  //   if (vehicleRouteDetails.length === 0) {
  //     setIschildAccordionOpen((pre) => !pre);
  //   }

  //   // 5. Update state
  //   setNewState((prev) => ({
  //     ...prev,
  //     tblVehicleRouteDetails: vehicleRouteDetails,
  //   }));
  // };

  // for scrolling table
  const [tableBodyWidhth, setTableBodyWidth] = useState("0px");

  // useEffect(() => {
  //   if (formControlData?.tableName === "tblVehicleRoute") {
  //     // wrap the async call in an IIFE
  //     (async () => {
  //       await setSameDDValueFromParentToChild();
  //     })();
  //   }
  // }, [newState?.jobId]);

  // const setSameDDValueFromParentToChild = async () => {
  //   // 1. Split and clean up the raw ID/text strings
  //   const rawIds = String(newState.jobId || "").split(",");

  //   // 2. Turn IDs into numbers and drop any empty/invalid ones
  //   const getIds = rawIds
  //     .map((id) => id.trim())
  //     .filter((id) => id !== "")
  //     .map((id) => parseInt(id, 10))
  //     .filter((id) => !isNaN(id));

  //   // if no IDs, just toggle the accordion and bail out
  //   if (getIds.length === 0) {
  //     setIschildAccordionOpen((pre) => !pre);
  //     // clear out any existing details
  //     setNewState((prev) => ({
  //       ...prev,
  //       tblVehicleRouteDetails: [],
  //     }));
  //     return;
  //   }

  //   // 3. Fire off all report‐data fetches in parallel
  //   const reportPromises = getIds.map((id) => {
  //     const requestBody = {
  //       columns: "id,jobNo",
  //       tableName: "tblJob",
  //       whereCondition: `id = '${id}'`,
  //       clientIdCondition: "status=1 FOR JSON PATH",
  //     };
  //     return fetchReportData(requestBody);
  //   });

  //   let reports;
  //   try {
  //     reports = await Promise.all(reportPromises);
  //     //console.log("all reports:", reports);
  //   } catch (err) {
  //     console.error("failed to fetch some reports:", err);
  //     // you may want to handle partial failures here
  //     reports = [];
  //   }

  //   // 4. Build one route-detail object per ID, pairing with the fetched report
  //   const vehicleRouteDetails = getIds.map((id, idx) => {
  //     // your API returns { success, message, data: [ { id, jobNo } ] }
  //     const rec = reports[idx]?.data?.[0];
  //     const option = rec ? { value: rec.id, label: rec.jobNo } : null;

  //     return {
  //       jobId: id,
  //       jobIddropdown: option ? [option] : [],
  //       jobIdText: option ? [option] : [],
  //     };
  //   });

  //   // 5. Update state
  //   setNewState((prev) => ({
  //     ...prev,
  //     tblVehicleRouteDetails: vehicleRouteDetails,
  //   }));
  // };

  const handleFieldChildrenValuesChange = (updatedValues) => {
    setChildObject((prevObject) => ({ ...prevObject, ...updatedValues }));
  };

  const childButtonHandler = async (section, indexValue, islastTab) => {
    //console.log("childButtonHandler", section);
    if (isChildAccordionOpen) {
      setClickCount((prevCount) => prevCount + 1);
    }

    inputFieldsVisible == false && setInputFieldsVisible((prev) => !prev);
    if (inputFieldsVisible) {
      let Data = { ...childObject };
      for (var feild of section.fields) {
        if (
          feild.isRequired &&
          (!Object.prototype.hasOwnProperty.call(
            childObject,
            feild.fieldname
          ) ||
            String(childObject[feild.fieldname] || "").trim() === "")
        ) {
          toast.error(`Value for ${feild.yourlabel} is missing or empty.`);
          return;
        }
      }

      toast.dismiss();
      try {
        if (section.functionOnSubmit && section.functionOnSubmit !== null) {
          let functonsArray = section.functionOnSubmit.trim().split(";");
          // let Data = { ...childObject }
          for (const fun of functonsArray) {
            let updatedData = await onSubmitFunctionCall(
              fun,
              newState,
              formControlData,
              Data,
              setChildObject
            );
            if (updatedData?.alertShow == true) {
              // if (updatedData.type == "success") {
              //   toast.success(updatedData.message);

              // }
              // else {
              // toast.error(updatedData.message);
              setParaText(updatedData.message);
              setIsError(true);
              setOpenModal((prev) => !prev);
              setTypeofModal("onCheck");
              // return
              // }
            }
            if (updatedData) {
              Data = updatedData.values;
              setNewState((prevState) => {
                return {
                  ...prevState,
                  ...updatedData?.newState,
                };
              });
              setSubmitNewState((prevState) => {
                return {
                  ...prevState,
                  ...updatedData?.newState,
                };
              });
            }
          }
          //console.log("childButtonHandler", Data);

          // setChildObject((prevObject) => {
          //   return { ...prevObject, ...Data }; // Merge new data into childObject
          // });
          // section?.functionOnSubmit
          //   .split(";")
          //   .forEach((e) => onSubmitFunctionCall(e, childObject));
        }
      } catch (error) {
        return toast.error(error.message);
      }

      // try {
      //   if (typeof onSubmitValidation[section.functionOnSubmit] == "function") {
      //   onSubmitValidation?.[section.functionOnSubmit]({
      //     ...childObject})
      //   }
      // } catch (error) {
      //  return toast.error(error.message);
      // }
      const tmpData = { ...newState };
      const subChild = section.subChild?.reduce((obj, item) => {
        obj[item.tableName] = [];
        return obj;
      }, {});
      Object.assign(subChild, Data);
      if (hasBlackValues(subChild)) {
        return;
      }
      if (Array.isArray(tmpData[section.tableName])) {
        tmpData[section.tableName].push({
          ...subChild,
          isChecked: true,
          indexValue: tmpData[section.tableName].length,
        });
      } else {
        tmpData[section.tableName] = [
          {
            ...subChild,
            isChecked: true,
            indexValue: tmpData[section.tableName]?.length,
          },
        ];
      }
      setNewState(tmpData);
      setSubmitNewState(tmpData);
      setRenderedData(newState[section.tableName]);
      setChildObject({});
      setInputFieldsVisible((prev) => !prev);
      if (islastTab == true) {
        setTimeout(() => {
          setInputFieldsVisible((prev) => !prev);
        }, 3);
      }
      // islastTab == true &&
    }
  };

  console.log("childTableData", childTableDatas);

  const childExpandedAccordion = () => {
    setIschildAccordionOpen((prev) => !prev);
  };

  useEffect(() => {
    if (
      newState[section.tableName] &&
      newState[section.tableName]?.length > 0
    ) {
      setClickCount(1);
    }
  }, [newState[section.tableName]]);

  useEffect(() => {
    setIschildAccordionOpen(expandAll);
  }, [expandAll]);

  const handleScroll = () => {
    const container = tableRef.current;
    if (container) {
      const { scrollTop, scrollHeight, clientHeight } = container;
      // const isAtBottom = scrollTop + clientHeight === scrollHeight;
      const isAtBottom = scrollTop + clientHeight >= scrollHeight - 2;
      if (isAtBottom) {
        renderMoreData();
      }
    }
  };

  // Function to calculate totals for a single row
  const calculateTotalForRow = (rowData) => {
    // Iterate over each field in the fields array
    section.fields.forEach((item) => {
      // Check if the field requires grid total and is of type 'number' or 'text'
      if (
        item.gridTotal &&
        (item.type === "number" ||
          item.type === "decimal" ||
          item.type === "string")
      ) {
        const newValue =
          item.gridTypeTotal === "s"
            ? rowData?.reduce((sum, row) => {
                const parsedValue =
                  typeof row[item.fieldname] === "number"
                    ? row[item.fieldname]
                    : parseFloat(row[item.fieldname] || 0);
                return isNaN(parsedValue) ? sum : sum + parsedValue;
              }, 0) // Calculate sum for 's' type
            : rowData?.filter((row) => row[item.fieldname]).length; // Calculate count for 'c' type
        setColumnTotals((prevColumnTotals) => ({
          ...prevColumnTotals,
          tableName: section.tableName,
          [item.fieldname]: newValue,
        }));
      }
    });
  };

  const calculateTotalVolumeAndWeight = () => {
    if (!newState || !Array.isArray(newState.tblRateRequestQty)) {
      return newState; // Return unchanged state if invalid
    }

    let totalVolume = 0;
    let totalVolumeWt = 0;
    let totalNoPackage = 0;
    newState.tblRateRequestQty.forEach((row) => {
      const volume = parseFloat(row.volume) || 0;
      const volumeWt = parseFloat(row.volumeWt) || 0;
      const noPackage = parseFloat(row.noOfPackages) || 0;
      totalVolume += volume;
      totalVolumeWt += volumeWt;
      totalNoPackage += noPackage;
    });

    setNewState((prevState) => ({
      ...prevState,
      volume: totalVolume,
      volumeWt: totalVolumeWt,
      noOfPackages: totalNoPackage,
    }));
  };
  useEffect(() => {
    calculateTotalVolumeAndWeight();
  }, [newState.tblRateRequestQty]);

    const calculateTotalGrossWeight = () => {
  
      if (!newState || !Array.isArray(newState.tblJobContainer)) {
        return newState; 
      }
  
      let totalGrossWt = 0;
  
      newState.tblJobContainer.forEach((row) => {
        const cargoWt = parseFloat(row.grossWt) || 0;
        totalGrossWt += cargoWt;
      });
  
      setNewState((prevState) => ({
        ...prevState,
        cargoWt: totalGrossWt,
      }));
    };
  
    useEffect(() => {
    calculateTotalGrossWeight();
  }, [newState.tblJobContainer]);
  
  
    const calculateTotalGrossWeightBl = () => {
  
      if (!newState || !Array.isArray(newState.tblBlContainer)) {
        return newState; 
      }
  
      let totalGrossWt = 0;
  
      newState.tblBlContainer.forEach((row) => {
        const grossWts = parseFloat(row.grossWt) || 0;
        totalGrossWt += grossWts;
      });
  
      setNewState((prevState) => ({
        ...prevState,
        grossWt: totalGrossWt,
      }));
    };
  
    useEffect(() => {
    calculateTotalGrossWeightBl();
  }, [newState.tblBlContainer]);

  useEffect(() => {
    setRenderedData(newState[section.tableName]?.slice(0, 10)); // Initially render 10 items
    setDummyData(newState[section.tableName]?.slice(0, 10));
    calculateTotalForRow(newState[section.tableName]);
    childTableData({ [section?.tableName]: newState[section?.tableName] });
    setCopyChildValueObj({
      [section?.tableName]: newState[section?.tableName],
    });
  }, [newState]);

  const renderMoreData = () => {
    // Calculate the index range to render
    const lastIndex = renderedData.length + 10;
    const newData = newState[section.tableName]?.slice(
      renderedData.length,
      lastIndex
    );
    setRenderedData((prevData) => [...prevData, ...newData]);
    setDummyData((prevData) => [...prevData, ...newData]);
  };
  const deleteChildRecord = (index) => {
    try {
      if (section.functionOnDelete && section.functionOnDelete !== null) {
        const functonsArray = section.functionOnDelete.trim().split(";");
        const filteredRows = newState[section.tableName].filter(
          (_, i) => i !== index
        );
        const UpdatedNewState = {
          ...newState,
          [section.tableName]: filteredRows,
        };

        let Data = { ...newState[section.tableName][index] };

        for (const fun of functonsArray) {
          if (typeof onSubmitValidation[fun] === "function") {
            // Optional: Validation logic
          }

          const updatedData = onSubmitFunctionCall(
            fun,
            UpdatedNewState,
            formControlData,
            {},
            setChildObject
          );

          if (updatedData?.alertShow === true) {
            setParaText(updatedData.message);
            setIsError(true);
            setOpenModal((prev) => !prev);
            setTypeofModal("onCheck");
          }

          if (updatedData) {
            Data = updatedData.values;

            setNewState((prevState) => {
              const updated = {
                ...prevState,
                ...updatedData.newState,
              };
              // ✅ Recalculate totals with updated rows
              calculateTotalVolumeAndWeight(
                updated[section.tableName],
                setNewState
              );
              return updated;
            });

            setSubmitNewState((prevState) => ({
              ...prevState,
              ...updatedData.newState,
            }));
          }
        }
      } else {
        // ✅ Standard flow (no functionOnDelete)
        setNewState((prevState) => {
          const updatedRows = prevState[section.tableName].filter(
            (_, idx) => idx !== index
          );
          const updatedState = {
            ...prevState,
            [section.tableName]: updatedRows,
          };
          calculateTotalVolumeAndWeight(updatedRows, setNewState); // ✅ Recalculate
          return updatedState;
        });

        setSubmitNewState((prevState) => {
          const updatedRows = prevState[section.tableName].filter(
            (_, idx) => idx !== index
          );
          return {
            ...prevState,
            [section.tableName]: updatedRows,
          };
        });

        setOriginalData((prevState) => {
          const updatedRows = prevState[section?.tableName]?.filter(
            (_, idx) => idx !== index
          );
          if (updatedRows?.length === 0) {
            setInputFieldsVisible(true);
          }
          return {
            ...prevState,
            [section.tableName]: updatedRows,
          };
        });
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  // const deleteChildRecord = (index) => {
  //   setNewState((prevState) => {
  //     const newStateCopy = { ...prevState };
  //     const updatedData = newStateCopy[section.tableName].filter(
  //       (_, idx) => idx !== index
  //     );
  //     newStateCopy[section.tableName] = updatedData;
  //     if (updatedData.length === 0) {
  //       setInputFieldsVisible(true);
  //     }
  //     return newStateCopy;
  //   });
  //   setSubmitNewState((prevState) => {
  //     const newStateCopy = { ...prevState };
  //     const updatedData = newStateCopy[section.tableName].filter(
  //       (_, idx) => idx !== index
  //     );
  //     newStateCopy[section.tableName] = updatedData;
  //     if (updatedData.length === 0) {
  //       setInputFieldsVisible(true);
  //     }
  //     return newStateCopy;
  //   });
  // };

  // eslint-disable-next-line no-unused-vars
  const removeChildRecordFromInsert = (id, index) => {
    setSubmitNewState((prevState) => {
      const newStateCopy = { ...prevState };
      let updatedData = newStateCopy[section.tableName].filter(
        (_, idx) => idx === index
      );
      updatedData = { ...updatedData[0], isChecked: false };
      newStateCopy[section.tableName][index] = updatedData;
      return newStateCopy;
    });
    setNewState((prevState) => {
      const newStateCopy = { ...prevState };
      let updatedData = newStateCopy[section.tableName].filter(
        (_, idx) => idx === index
      );
      updatedData = { ...updatedData[0], isChecked: false };
      newStateCopy[section.tableName][index] = updatedData;
      return newStateCopy;
    });
  };

  //right click function
  const handleRightClick = (event, columnId) => {
    event.preventDefault(); // Prevent the default context menu
    setInputVisible(true); // Show the input field
    setActiveColumn(columnId); // Set the active column to the one that was right-clicked
  };

  CustomizedInputBase.propTypes = {
    columnData: PropTypes.array,
    setPrevSearchInput: PropTypes.func,
    prevSearchInput: PropTypes.string,
    controlerName: PropTypes.string,
  };
  function CustomizedInputBase({
    columnData,
    setPrevSearchInput,
    prevSearchInput,
    controlerName,
  }) {
    const [searchInput, setSearchInput] = useState(prevSearchInput || "");

    // Custom filter logic
    function filterFunction(searchValue, columnKey) {
      if (!searchValue.trim()) {
        setInputVisible(false);
        setSubmitNewState(dummyData);
        return setRenderedData(dummyData);
      }
      const lowercasedInput = searchValue.toLowerCase();
      const filtered = newState[section.tableName].filter((item) => {
        // Access the item's property based on columnKey and convert to string for comparison
        let columnValue = "";
        if (controlerName.toLowerCase() === "dropdown") {
          let dropdownColumnValue = columnKey + "Dropdown";
          let dropdownItem = item[dropdownColumnValue];
          if (dropdownItem === undefined) {
            dropdownColumnValue = columnKey + "dropdown";
            dropdownItem = item[dropdownColumnValue][0].label;
          }
          columnValue = dropdownItem
            ? String(`${dropdownItem}`).toLowerCase()
            : "";
          return columnValue.includes(lowercasedInput);
        } else {
          columnValue = String(item[columnKey]).toLowerCase();
          return columnValue.includes(lowercasedInput);
        }
      });
      if (filtered.length === 0) {
        toast.error("No matching records found.");
        return;
      }
      setRenderedData(filtered);
      setInputVisible(false);
      setPrevSearchInput(searchValue);
    }

    function handleClose() {
      setSearchInput("");
      setPrevSearchInput("");
    }

    return (
      <Paper
        sx={{
          ...createAddEditPaperStyles,
        }}
      >
        <InputBase
          autoFocus={true}
          id="search"
          sx={{
            ...searchInputStyling,
          }}
          placeholder="Search..."
          inputProps={{ "aria-label": "search..." }}
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              filterFunction(searchInput, columnData.fieldname);
            }
          }}
        />
        <LightTooltip title="Clear">
          <IconButton color="gray" sx={{ p: "2px" }} aria-label="clear">
            <ClearIcon
              onClick={() => handleClose()}
              sx={{
                color: "var(--table-text-color)",
              }}
            />
          </IconButton>
        </LightTooltip>
        <Divider
          sx={{
            height: 25,
            borderColor: "var(--table-text-color)",
            opacity: 0.3,
          }}
          orientation="vertical"
        />
        <LightTooltip title="Search">
          <IconButton
            type="button"
            sx={{ p: "2px" }}
            aria-label="search"
            onClick={() => filterFunction(searchInput, columnData.fieldname)}
          >
            <SearchIcon
              sx={{
                color: "var(--table-text-color)",
              }}
            />
          </IconButton>
        </LightTooltip>
      </Paper>
    );
  }

  // Function to handle sorting when a column header is clicked
  const handleSortBy = (columnId) => {
    // If the same column is clicked again, toggle the sorting order
    if (sortedColumn === columnId) {
      setIsAscending(!isAscending);
      sortJSON(renderedData, columnId, isAscending ? "asc" : "desc");
    } else {
      // If a different column is clicked, update the sortedColumn state and set sorting order to ascending
      setSortedColumn(columnId);
      setIsAscending(true);
    }
  };

  const renderSortIcon = (columnId) => {
    if (sortedColumn === columnId) {
      return (
        <>
          {isAscending ? (
            <LightTooltip title="Descending">
              <ArrowDownwardIcon
                fontSize="small"
                className={`${styles.ArrowDropUpIcon}`}
                sx={{
                  opacity: "1",
                  color: "#636363",
                }}
              />
            </LightTooltip>
          ) : (
            <LightTooltip title="Ascending">
              <ArrowUpwardIcon
                fontSize="small"
                className={`${styles.ArrowDropUpIcon}`}
                sx={{
                  opacity: "1",
                  color: "#636363",
                }}
              />
            </LightTooltip>
          )}
        </>
      );
    } else {
      return (
        <>
          {isAscending ? (
            <LightTooltip title="Ascending">
              <ArrowUpwardIcon
                fontSize="small"
                className={`${styles.ArrowDropUpIcon}`}
                sx={{
                  opacity: "0",
                  color: "#636363",
                }}
              />
            </LightTooltip>
          ) : (
            <LightTooltip title="Descending">
              <ArrowDownwardIcon
                fontSize="small"
                className={`${styles.ArrowDropUpIcon}`}
                sx={{
                  opacity: "0",
                  color: "#636363",
                }}
              />
            </LightTooltip>
          )}
        </>
      );
    }
  };

  function gridEditHandle(tableName) {
    setChecker(false);
    if (isGridEdit) {
      toast.warn("Please save the changes before editing");
      return;
    }
    //setIsGridEdit(true);
    setCopyChildValueObj((prev) => {
      // Clone the previous state
      const newCopy = { ...prev };
      // Ensure there's an array to push to for the tableName
      if (newCopy[tableName] === undefined) {
        newCopy[tableName] = [];
      }
      // Append the new state for the tableName
      newCopy[tableName].push(newState[tableName]);
      // Return the modified copy
      return newCopy;
    });

    // Toggle the isGridEdit state
    setIsGridEdit((prevState) => !prevState);
  }

  function gridEditSaveFunction(tableName, section) {
    //k
    //const objectsToValidate = copyChildValueObj[tableName][0];
    const childData = childTableRow
      ? childTableRow
      : copyChildValueObj[tableName]?.[0];
    console.log("copyChildValueObj", copyChildValueObj);
    setChecker(false);
    const objectsToValidate =
      childData[tableName] ||
      copyChildValueObj[tableName]?.[0] ||
      newState[tableName];

    for (const field of section.fields) {
      // Loop through the fields that need validation
      let isFieldValid = false; // Track if the current field is valid

      for (const object of objectsToValidate) {
        // Loop through each object in your array
        if (field.isRequired) {
          // Check if the field exists in the object and it is not empty
          if (
            Object.prototype.hasOwnProperty.call(object, field.fieldname) &&
            object[field.fieldname]
          ) {
            isFieldValid = true; // Field is valid, break out of the loop for this field
            break;
          }
        }
      }

      if (!isFieldValid && field.isRequired) {
        // If no valid entry was found and the field is required
        toast.error(`Value for ${field.yourlabel} is missing or empty.`);
        return; // Exit the function if a validation fails
      }
    }
    setNewState((prev) => {
      return {
        ...prev,
        [tableName]:
          childData[tableName] ||
          copyChildValueObj[tableName]?.[0] ||
          newState[tableName],
      };
    });
    //console.log("copyChildValueObj", copyChildValueObj);
    setSubmitNewState((prev) => {
      return {
        ...prev,
        [tableName]:
          childData[tableName] ||
          copyChildValueObj[tableName]?.[0] ||
          newState[tableName],
      };
    });
    setIsGridEdit(!isGridEdit);
    setCopyChildValueObj([]);
  }

  function gridEditCloseFunction(tableName) {
    setCopyChildValueObj([]);
    setIsGridEdit(!isGridEdit);
  }

  function handleChangeFunction(result) {
    // if (result?.isCheck === false) {
    //   if (result.alertShow) {
    //     setParaText(result.message);
    //     setIsError(true);
    //     setOpenModal((prev) => !prev);
    //     setTypeofModal("onCheck");
    //   }
    //   return;
    // }
    // let updatedData = null;

    // if (section.functionOnDelete && section.functionOnDelete !== null) {
    //   const functonsArray = section.functionOnDelete.trim().split(";");
    //   const filteredRows = newState[section.tableName].filter(
    //     (_, i) => i !== index
    //   );
    //   const UpdatedNewState = {
    //     ...newState,
    //     [section.tableName]: filteredRows,
    //   };

    //   let Data = { ...newState[section.tableName][index] };

    //   for (const fun of functonsArray) {
    //     if (typeof onSubmitValidation[fun] === "function") {
    //       // Optional: Validation logic
    //     }

    //     updatedData = onSubmitFunctionCall(
    //       fun,
    //       UpdatedNewState,
    //       formControlData,
    //       {},
    //       setChildObject
    //     );
    //   }
    // }

    // // Show error modal if required
    // if (updatedData?.alertShow === true) {
    //   setParaText(updatedData.message);
    //   setIsError(true);
    //   setOpenModal((prev) => !prev);
    //   setTypeofModal("onCheck");
    // }

    // // Only proceed if updatedData is valid
    // if (updatedData) {
    //   // Optional chaining prevents crash
    //   const data = updatedData.values ? { ...updatedData.values } : {};

    //   if (updatedData.newState) {
    //     setNewState((prevState) => {
    //       const updated = {
    //         ...prevState,
    //         ...updatedData.newState,
    //       };

    //       // Only call if tableName is valid and the data exists
    //       if (section?.tableName && updated[section.tableName]) {
    //         calculateTotalVolumeAndWeight(
    //           updated[section.tableName],
    //           setNewState
    //         );
    //       }

    //       return updated;
    //     });

    //     setSubmitNewState((prevState) => ({
    //       ...prevState,
    //       ...updatedData.newState,
    //     }));
    //   }

    //   // Set child object only if values exist
    //   if (updatedData.values) {
    //     setChildObject((prev) => ({
    //       ...prev,
    //       ...data,
    //     }));
    //   }
    // }
    //other Modified.
    if (result?.isCheck === false) {
      if (result.alertShow) {
        setParaText(result.message);
        setIsError(true);
        setOpenModal((prev) => !prev);
        setTypeofModal("onCheck");
        setClearFlag({
          isClear: true,
          fieldName: result.fieldName,
        });
      }
      return;
    }
    // let data = { ...result.values };
    let data = { ...result?.newState };
    setNewState((pre) => {
      return {
        ...pre,
        ...data,
      };
    });
    setSubmitNewState((pre) => {
      return {
        ...pre,
        ...data,
      };
    });
  }
  function handleBlurFunction(result) {
    if (result?.isCheck === false) {
      if (result.alertShow) {
        setParaText(result.message);
        setIsError(true);
        setOpenModal((prev) => !prev);
        setTypeofModal("onCheck");
      }
      return;
    }
    let data = { ...result.values };
    // let data = { ...result.newState };
    setChildObject((pre) => {
      return {
        ...pre,
        ...data,
      };
    });
  }

  const logRef = () => {
    if (tableRef.current) {
      const width = tableRef.current.offsetWidth;
      setContainerWidth(width);
    } else {
      //console.log("tableRef.current is not available");
    }
  };

  const childFieldsData = section?.fields?.filter((elem) => elem.isGridView);

  const handleRevert = () => {
    setChildObject({});
    if (newState[section.tableName]?.length > 0) {
      setInputFieldsVisible((prev) => !prev);
    }
  };

  const onSave = () => {
    childButtonHandler(section, indexValue);
  };

  const addRowProps = {
    // array or data
    childFieldsData: childFieldsData,
    childObject: childObject,

    // boolean
    inputFieldsVisible: inputFieldsVisible,
    isGridEdit: isGridEdit,
    isCopy: isCopy,
    indexValue: indexValue,

    // fucntion
    handleBlurFunction: handleBlurFunction,
    handleFieldChildrenValuesChange: handleFieldChildrenValuesChange,
    handleChangeFunction: handleChangeFunction,
    onSave: onSave,
    revert: handleRevert,
  };

  useEffect(() => {
    const horiScroll = () => {
      const right = Math.round(
        Math.floor(
          tableRef.current?.getBoundingClientRect()?.width +
            tableRef.current?.scrollLeft
        )
      );
      if (tableRef.current?.scrollWidth > tableRef.current?.clientWidth) {
        setTableBodyWidth(`${right - 70}`);
      } else {
        setTableBodyWidth(`0`);
      }
    };

    horiScroll();

    tableRef.current?.addEventListener("scroll", horiScroll);

    return () => {
      tableRef.current?.removeEventListener("scroll", horiScroll);
    };
  }, [tableRef.current]);

  async function onLoadFunctionCall(
    functionData,
    formControlData,
    setFormControlData,
    setStateVariable,
    values
  ) {
    const funcNameMatch = functionData?.match(/^(\w+)/);
    const argsMatch = functionData?.match(/\((.*)\)/);

    // Check if we have a function name match, and we have an argsMatch (even if there are no arguments)
    if (funcNameMatch && argsMatch !== null) {
      const funcName = funcNameMatch[1];
      const argsStr = argsMatch[1] || "";

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
        // Call the function with the prepared arguments
        const updatedValues = await func({
          args,
          newState,
          formControlData,
          setFormControlData,
          setStateVariable,
          values,
        });
        if (updatedValues?.result) {
          // setIsDataLoaded(false);
          // toast[updatedValues.type](updatedValues.message);
          // setFormControlData(updatedValues.formControlData);
        }
        // onChangeHandler(updatedValues); // Assuming you have an onChangeHandler function to handle the updated values
      }
    }
  }
  useEffect(() => {
    if (section && section?.functionOnLoad?.length > 0 && inputFieldsVisible) {
      const funcCallString = section.functionOnLoad;
      if (funcCallString) {
        funcCallString.split(";").forEach((funcCall) => {
          onLoadFunctionCall(
            funcCall,
            formControlData,
            setFormControlData,
            setChildObject,
            childObject
          );
        });
      }
    }
  }, [inputFieldsVisible]);

  return (
    <>
      <Accordion
        expanded={isChildAccordionOpen}
        sx={{
          ...childAccordionSection,
        }}
        key={indexValue}
      >
        <AccordionSummary
          className="relative left-[11px]"
          sx={{ ...SummaryStyles }}
          expandIcon={
            <LightTooltip title={isChildAccordionOpen ? "Collapse" : "Expand"}>
              <ExpandMoreIcon
                className={`${styles.txtColor}`}
                onClick={childExpandedAccordion}
              />
            </LightTooltip>
          }
          aria-controls={`panel${indexValue + 1}-content`}
          id={`panel${indexValue + 1}-header`}
        >
          <Typography
            className={`${styles.txtColor} relative right-[11px] text-[12px]`}
          >
            {section.childHeading || section.tableName}
          </Typography>
          {renderedData?.length > 0 && isChildAccordionOpen && !isView && (
            <>
              <LightTooltip title="Edit Grid">
                <EditNoteRoundedIcon
                  sx={{
                    ...gridEditIconStyles,
                  }}
                  onClick={() => {
                    gridEditHandle(section.tableName);
                  }}
                />
              </LightTooltip>
              {isGridEdit && (
                <LightTooltip title="Save">
                  <SaveOutlinedIcon
                    sx={{
                      marginLeft: "8px",
                      ...gridEditIconStyles,
                    }}
                    onClick={() => {
                      gridEditSaveFunction(section.tableName, section);
                    }}
                  />
                </LightTooltip>
              )}
              {isGridEdit && (
                <LightTooltip title="Cancel">
                  <CloseOutlinedIcon
                    sx={{
                      marginLeft: "8px",
                      ...gridEditIconStyles,
                    }}
                    onClick={() => {
                      gridEditCloseFunction(section.tableName);
                    }}
                  />
                </LightTooltip>
              )}
            </>
          )}
        </AccordionSummary>
        <AccordionDetails
          className={` ${styles.txtColor} relative flex `}
          sx={{
            padding: inputFieldsVisible ? "0" : "0",
            height: clickCount === 0 ? "2.5rem" : "auto",
            width: "100%",
          }}
        >
          <div key={indexValue} className={`w-full  ${styles.thinScrollBar}`}>
            {/* Icon Button on the right */}
            <div className="absolute top-1 right-[-3px] flex justify-end ">
              {!isView && clickCount === 0 && (
                //    <IconButton
                //    aria-label="Add"
                //    className={`${styles.inputTextColor} `}
                //    sx={{
                //      ...styles.transparentBg,
                //      "&:hover": {
                //        ...styles.transparentBgHover,
                //      },
                //    }}
                //  >
                //    <LightTooltip title="Add">
                //      <AddOutlinedIcon
                //        onClick={() => {
                //           childButtonHandler(section, indexValue);
                //        }}
                //      />
                //    </LightTooltip>
                //  </IconButton>
                <HoverIcon
                  defaultIcon={addLogo}
                  hoverIcon={plusIconHover}
                  altText={"Add"}
                  title={"Add"}
                  onClick={() => {
                    childButtonHandler(section, indexValue);
                  }}
                />
              )}
            </div>

            {/* Custom Input Fields in the middle */}
            {inputFieldsVisible && !isGridEdit && (
              <div className={`relative flex pl-[16px] py-[8px] `}>
                <CustomeInputFields
                  inputFieldData={section.fields}
                  onValuesChange={handleFieldChildrenValuesChange}
                  values={childObject}
                  inEditMode={{ isEditMode: true, isCopy: isCopy }}
                  onChangeHandler={(result) => {
                    handleChangeFunction(result);
                  }}
                  onBlurHandler={(result) => {
                    handleBlurFunction(result);
                  }}
                  isView={isView}
                  clearFlag={clearFlag}
                  newState={newState}
                  tableName={section.tableName}
                  formControlData={formControlData}
                  setFormControlData={setFormControlData}
                  setStateVariable={setChildObject}
                  getLabelValue={getLabelValue}
                  callSaveFunctionOnLastTab={() => {
                    childButtonHandler(section, indexValue, true);
                    calculateTotalVolumeAndWeight();
                    calculateTotalGrossWeight();
                       calculateTotalGrossWeightBl();
                  }}
                  wrap
                />
                <div className="relative top-0 right-2 flex justify-end items-baseline ">
                  <HoverIcon
                    defaultIcon={refreshIcon}
                    hoverIcon={revertHover}
                    altText={"Revert"}
                    title={"Revert"}
                    onClick={() => {
                      setChildObject({});
                      if (newState[section.tableName]?.length > 0) {
                        setInputFieldsVisible((prev) => !prev);
                      }
                    }}
                  />
                  <HoverIcon
                    defaultIcon={saveIcon}
                    hoverIcon={saveIconHover}
                    altText={"Save"}
                    title={"Save"}
                    onClick={() => {
                      childButtonHandler(section, indexValue);
                      calculateTotalVolumeAndWeight();
                       calculateTotalGrossWeight();
                       calculateTotalGrossWeightBl();
                    }}
                  />
                </div>
              </div>
            )}

            {/* ends here */}

            {newState[section.tableName] &&
              newState[section.tableName]?.length > 0 && (
                <>
                  {/* Table grid view Section at bottom*/}
                  <div key={indexValue} className={`   `}>
                    <TableContainer
                      onClick={logRef}
                      key={indexValue}
                      ref={tableRef}
                      component={Paper}
                      onScroll={handleScroll}
                      className={`${styles.hideScrollbar} ${styles.thinScrollBar}`}
                      sx={{
                        overflowX: "auto",
                        height:
                          newState[section.tableName]?.length > 10
                            ? "290px"
                            : "auto",
                        overflowY:
                          newState[section.tableName]?.length > 10
                            ? "auto"
                            : "hidden",
                      }}
                    >
                      <Table
                        aria-label="sticky table"
                        stickyHeader
                        className={`bg-[var(--commonBg)] `}
                        sx={{
                          width: "fit-content",
                          minWidth: "100%",
                        }}
                      >
                        <TableHead>
                          <TableRow>
                            {section.fields
                              .filter((elem) => elem.isGridView)
                              .map((field, index) => (
                                <TableCell
                                  key={index}
                                  className={`${styles.cellHeading} cursor-pointer `}
                                  align="left"
                                  sx={{
                                    ...childTableHeaderStyle,
                                    paddingLeft:
                                      isView && index === 0
                                        ? "29px"
                                        : "0px !important",
                                    zIndex: 10,
                                  }}
                                  onContextMenu={(event) =>
                                    handleRightClick(
                                      event,
                                      field.fieldname,
                                      section,
                                      section.fields
                                    )
                                  } // Add the right-click handler here
                                >
                                  {!isView && index === 0 && (
                                    <HoverIcon
                                      defaultIcon={addLogo}
                                      hoverIcon={plusIconHover}
                                      altText={"Add"}
                                      title={"Add"}
                                      onClick={() => {
                                        inputFieldsVisible == false &&
                                          setInputFieldsVisible(
                                            (prev) => !prev
                                          );
                                      }}
                                    />
                                  )}

                                  <span
                                    className={`${styles.labelText}`}
                                    style={{
                                      paddingLeft:
                                        isGridEdit && index == 0 ? "0px" : "0",
                                    }}
                                    onClick={
                                      !isView
                                        ? () => handleSortBy(field.fieldname)
                                        : undefined
                                    }
                                  >
                                    {field.yourlabel}
                                  </span>
                                  <span>
                                    {!isView &&
                                      isInputVisible &&
                                      activeColumn === field.fieldname && ( // Conditionally render the input
                                        <CustomizedInputBase
                                          columnData={field}
                                          setPrevSearchInput={
                                            setPrevSearchInput
                                          }
                                          prevSearchInput={prevSearchInput}
                                          controlerName={field.controlname}
                                        />
                                      )}
                                  </span>
                                  {!isView && (
                                    <span className="ml-1">
                                      {renderSortIcon(field.fieldname)}
                                    </span>
                                  )}
                                </TableCell>
                              ))}
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {/*passing parent and all childs data in Row Component  */}
                          {renderedData?.map((row, index) => (
                            <RowComponent
                              fields={section.fields}
                              childIndex={index}
                              childName={section.tableName}
                              subChild={section.subChild}
                              sectionData={section}
                              key={index}
                              row={row}
                              newState={newState}
                              setNewState={setNewState}
                              setInputFieldsVisible={setInputFieldsVisible}
                              expandAll={expandAll}
                              inEditMode={{ isEditMode: true, isCopy: isCopy }}
                              setRenderedData={setRenderedData}
                              deleteChildRecord={deleteChildRecord}
                              calculateData={calculateData}
                              setCalculateData={setCalculateData}
                              dummyFieldArray={dummyFieldArray}
                              setDummyFieldArray={setDummyFieldArray}
                              // isGridEdit={isGridEdit}
                              isGridEdit={
                                checker
                                  ? section?.gridEditableOnLoad?.toLowerCase() ===
                                    "true"
                                  : isGridEdit
                              }
                              setIsGridEdit={setIsGridEdit}
                              copyChildValueObj={copyChildValueObj}
                              setCopyChildValueObj={setCopyChildValueObj}
                              isView={isView}
                              setOpenModal={setOpenModal}
                              setParaText={setParaText}
                              setIsError={setIsError}
                              setTypeofModal={setTypeofModal}
                              clearFlag={clearFlag}
                              setClearFlag={setClearFlag}
                              containerWidth={containerWidth}
                              submitNewState={submitNewState}
                              setSubmitNewState={setSubmitNewState}
                              removeChildRecordFromInsert={
                                removeChildRecordFromInsert
                              }
                              formControlData={formControlData}
                              setFormControlData={setFormControlData}
                              tableBodyWidhth={tableBodyWidhth}
                            />
                          ))}

                          <AddRow {...addRowProps} />

                          <>
                            {Object.keys(columnTotals).length > 0 &&
                              columnTotals.tableName === section.tableName && (
                                <TableRow
                                  className={
                                    isView
                                      ? ""
                                      : `${styles.tableCellHoverEffect} ${styles.hh}`
                                  }
                                  sx={{
                                    "& > *": { borderBottom: "unset" },
                                  }}
                                >
                                  {section.fields
                                    .filter((elem) => elem.isGridView)
                                    .map((field, index) => (
                                      <TableCell
                                        align="left"
                                        key={index}
                                        sx={{
                                          paddingLeft:
                                            index === 0 ? "29px" : "0px",
                                          ...totalSumChildStyle,
                                        }}
                                      >
                                        <div className="relative font-bold">
                                          <div
                                            className={`${childTableRowStyles} `}
                                          >
                                            {(field.type === "number" ||
                                              field.type === "decimal" ||
                                              field.type === "string") &&
                                            field.gridTotal
                                              ? columnTotals[
                                                  field.fieldname
                                                ].toString()
                                              : ""}
                                          </div>
                                        </div>
                                      </TableCell>
                                    ))}
                                </TableRow>
                              )}
                          </>
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </div>
                </>
              )}
          </div>
        </AccordionDetails>
      </Accordion>
    </>
  );
}
