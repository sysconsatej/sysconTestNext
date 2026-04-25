"use client";
/* eslint-disable */
import * as React from "react";
import { useState, useRef, useEffect } from "react";
import { useRouter, useParams, useSearchParams } from "next/navigation";
import styles from "@/app/app.module.css";
import Accordion from "@mui/material/Accordion";
import AccordionSummary from "@mui/material/AccordionSummary";
import AccordionDetails from "@mui/material/AccordionDetails";
import CloseOutlinedIcon from "@mui/icons-material/CloseOutlined";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import moment from "moment";
import {
  eInvoicing,
  masterTableInfo,
  formControlMenuList,
  handleSubmitApi,
  tallyDebitCredit,
  validateSubmit,
  fetchThirdLevelDetailsFromApi,
  fetchVoucherDataDynamic,
  insertVoucherDataDynami,
  getRoundOffData,
  getTaxDetails,
  getCopyData
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
import RowComponent from "@/app/(groupControl)/invoiceControl/addEdit/RowComponent";
import PropTypes from "prop-types";
import InputBase from "@mui/material/InputBase";
import Divider from "@mui/material/Divider";
import SearchIcon from "@mui/icons-material/Search";
import ClearIcon from "@mui/icons-material/Clear";
import CustomeModal from "@/components/Modal/customModal.jsx";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";
import HoverIcon from "@/components/HoveredIcons/HoverIcon";
import Attachments from "@/app/(groupControl)/invoiceControl/addEdit/Attachments.jsx";
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
import * as onSubmitValidation from "@/helper/onSubmitFunction";
import { Typography } from "@mui/material";
import { getUserDetails } from "@/helper/userDetails";
import PrintModal from "@/components/Modal/printModal.jsx";
import { encryptUrlFun } from "@/utils";
import { fetchReportData } from "@/services/auth/FormControl.services";
import { useDispatch, useSelector } from "react-redux";

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

function groupAndSortAllFields(fields) {
  // Group fields by 'sectionHeader'
  const groupedFields = fields.reduce((acc, field) => {
    const section = field.sectionHeader || "default"; // Use 'default' or any other Value forfields without sectionHeader
    acc[section] = acc[section] || [];
    acc[section].push(field);
    return acc;
  }, {});

  // Sort each group by 'sectionOrder'
  Object.keys(groupedFields).forEach((section) => {
    groupedFields[section].sort(
      (a, b) => (a.sectionOrder || 0) - (b.sectionOrder || 0),
    );
  });
  return groupedFields;
}

function groupAndSortFields(fields) {
  // Initialize the structure to hold objects for each position, with section headers as keys
  const result = {
    top: {},
    bottom: {},
  };

  // Group fields by 'sectionHeader', then place them into the appropriate array based on 'position'
  const groupedFields = fields.reduce((acc, field) => {
    const section = field.sectionHeader || "default"; // Use 'default' for fields without a sectionHeader
    const position = field.position || "default"; // Use 'default' if position is not specified

    // Initialize if not already done
    acc[section] = acc[section] || { top: [], bottom: [] };
    acc[section][position].push(field);

    return acc;
  }, {});

  // Sort each group by 'sectionOrder' and distribute them into the result arrays
  Object.keys(groupedFields).forEach((section) => {
    Object.keys(groupedFields[section]).forEach((position) => {
      groupedFields[section][position].sort(
        (a, b) => (a.sectionOrder || 0) - (b.sectionOrder || 0),
      );

      // Push sorted sections into the respective position object in the result with sectionHeader as key
      result[position][section] = groupedFields[section][position];
    });
  });

  return result;
}

function isConfigFlagEnabled(value) {
  if (value === true || value === 1 || value === "1") return true;
  if (typeof value === "string") {
    const normalized = value.trim().toLowerCase();
    return ["true", "yes", "y", "t"].includes(normalized);
  }
  return false;
}

function onSubmitFunctionCall(
  functionData,
  newState,
  formControlData,
  values,
  setStateVariable,
) {
  const funcNameMatch = functionData?.match(/^(\w+)/);
  const argsMatch = functionData?.match(/\((.*)\)/);
  console.log(functionData, "functionData");
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
      console.log(args);
      // Call the function with the prepared arguments
      let result = onSubmitValidation?.[funcName]({
        args,
        newState,
        formControlData,
        values,
        setStateVariable,
      });
      return result;
      // onChangeHandler(updatedValues); // Assuming you have an onChangeHandler function to handle the updated values
    }
  }
}

export default function AddEditFormControll() {
  const selectedMenuId = useSelector((state) => state?.counter?.selectedMenuId);
  const { push } = useRouter();
  const params = useParams();
  const search = JSON.parse(decodeURIComponent(params.id));
  const encryptParams = JSON.parse(decodeURIComponent(params.id));
  const uriDecodedMenu = encryptParams;
  const [isReportPresent, setisReportPresent] = useState(false);
  const isView = search?.isView;
  const isCopy = search?.isCopy;
  const [formControlData, setFormControlData] = useState([]);
  const [parentsFields, setParentsFields] = useState([]);
  const [topParentsFields, setTopParentsFields] = useState([]);
  const [bottomParentsFields, setBottomParentsFields] = useState([]);
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
  //hide and unhide 
  const [parentFieldDataInArray, setParentFieldDataInArray] = useState([]);
  const [actionFieldNames, setActionFieldNames] = useState([]);
  const [originalChildsFields, setOriginalChildsFields] = useState([]);

  const prevVisibleRef = useRef({});
  const prevHiddenRef = useRef({});

  // getLabel Name
  const [labelName, setLabelName] = useState("");
  const [ChildTableName, setAllChildTableName] = useState([]);
  const [openPrintModal, setOpenPrintModal] = useState(false);
  const [submittedRecordId, setSubmittedRecordId] = useState(null);
  const [submittedMenuId, setSubmittedMenuId] = useState(null);
  const [isFormSaved, setIsFormSaved] = useState(false);
  const { userId, clientId } = getUserDetails();
  const [invoiceRoundOff, setInvoiceRoundOff] = useState("N");
  const [keysTovalidate, setKeysTovalidate] = useState([]);

  const searchParams = useSearchParams();
  const id = JSON.parse(decodeURIComponent(params.id));
  const getLabelValue = (label) => {
    setLabelName(label);
  };
  const [fetchCount, setFetchCount] = useState(1);


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
    const fetchData = async () => {
      try {
        await checkReportPresent(search?.menuName);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };
    fetchData();
  }, [search]);

  useEffect(() => {
    let allChildTableName = [];
    childsFields.map((item) => {
      allChildTableName.push(item?.tableName);
    });
    console.log("allChildTableName =>", allChildTableName);
    setAllChildTableName(allChildTableName);
  }, [childsFields]);

  // code ends here

  function replaceNullStrings(value, childTableNames = []) {
    // 1) If it’s literally null, undefined, the string "null", or the empty string → null
    if (value == null || value === "null" || value === "") {
      return null;
    }

    // 2) Arrays: recurse into every element
    if (Array.isArray(value)) {
      return value.map((item) => replaceNullStrings(item, childTableNames));
    }

    // 3) Objects: recurse into every property
    if (typeof value === "object") {
      for (const key of Object.keys(value)) {
        value[key] = replaceNullStrings(value[key], childTableNames);
      }
      return value;
    }

    // 4) Everything else (numbers, booleans, non-empty strings) stays untouched
    return value;
  }

  const handleFieldValuesChange2 = async (
    updatedValues,
    field,
    currentControlData,
  ) => {
    try {
      const requestData = {
        id: updatedValues.copyMappingName,
        filterValue: field[field.length - 1],
        menuID: search.menuName,
      };

      console.log("copy requestData", requestData);

      const getCopyDetails = await getCopyData(requestData);

      if (!getCopyDetails?.success) {
        toast.error(getCopyDetails?.Message || "Unable to fetch copy data");
        return;
      }

      let dataToCopy = {};
      getCopyDetails?.keyToValidate?.fieldsMaping
        ?.filter((data) => !data.isChild)
        ?.forEach((data) => {
          if (
            Array.isArray(getCopyDetails?.data?.[0]?.[data.toColmunName]) &&
            currentControlData?.controlname?.toLowerCase?.() == "multiselect"
          ) {
            dataToCopy[data.toColmunName] = (
              Array.isArray(newState?.[data.toColmunName])
                ? newState[data.toColmunName]
                : []
            ).concat(getCopyDetails.data[0][data.toColmunName]);
          } else {
            dataToCopy[data.toColmunName] =
              getCopyDetails?.data?.[0]?.[data.toColmunName];
          }
        });

      let childData =
        getCopyDetails?.keyToValidate?.fieldsMaping?.filter(
          (data) => data.isChild == true,
        ) || [];

      setChildsFields((prev) => {
        let updatedFields = [...prev];

        childData.forEach((data) => {
          let index = updatedFields.findIndex(
            (i) => i.tableName === data.toColmunName,
          );

          if (index !== -1) {
            updatedFields[index] = {
              ...updatedFields[index],
              isAddFunctionality: data.isAddFunctionality,
              isDeleteFunctionality: data.isDeleteFunctionality,
              isCopyFunctionality: data.isCopyFunctionality,
            };
          }
        });

        return updatedFields;
      });

      setNewState((prevState) => {
        getCopyDetails?.keyToValidate?.fieldsMaping?.forEach((data) => {
          if (data.isChild == true) {
            dataToCopy[data.toTableName] =
              getCopyDetails?.data?.[0]?.[data.toTableName];
          }
        });
        return {
          ...prevState,
          ...dataToCopy,
        };
      });

      setSubmitNewState((prevState) => ({
        ...prevState,
        ...getCopyDetails?.data?.[0],
      }));

      setKeysTovalidate(getCopyDetails?.keyToValidate?.fieldsMaping || []);
    } catch (error) {
      console.error("Fetch Error :", error);
    }
  };

  const parseIdList = (raw) =>
    String(raw || "")
      .split(",")
      .map((v) => Number(String(v).trim()))
      .filter((n) => !Number.isNaN(n));

  const isShowValue = (value) => {
    if (value === true || value === 1 || value === "1") return true;
    if (value === false || value === 0 || value === "0") return false;

    if (typeof value === "string") {
      const v = value.trim().toLowerCase();
      if (
        v === "" ||
        v === "false" ||
        v === "n" ||
        v === "no" ||
        v === "null" ||
        v === "undefined"
      ) {
        return false;
      }
      return true;
    }

    if (Array.isArray(value)) return value.length > 0;
    if (value && typeof value === "object") return Object.keys(value).length > 0;

    return value !== null && value !== undefined;
  };

  const isHideValue = (value) => !isShowValue(value);

  const buildActionFieldMap = (fields = []) => {
    const temp = [];

    fields.forEach((control) => {
      if (control?.isColumnVisible && control?.columnsToHide) {
        temp.push({
          parentFieldName: control.fieldname,
          sectionHeader: control.sectionHeader,
          columnsToHide: control.columnsToHide,
        });
      }

      if (control?.isColumnDisabled && control?.columnsToDisabled) {
        temp.push({
          parentFieldName: control.fieldname,
          sectionHeader: control.sectionHeader,
          columnsToDisabled: control.columnsToDisabled,
        });
      }
    });

    const seen = new Set();
    return temp.filter((item) => {
      const key = [
        item.parentFieldName || "",
        item.sectionHeader || "",
        item.columnsToHide || "",
        item.columnsToDisabled || "",
      ].join("|");

      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  };

  const rebuildParentSections = (fields) => {
    const groupedAll = groupAndSortAllFields(fields || []);
    const groupedByPosition = groupAndSortFields(fields || []);

    setParentsFields(groupedAll);
    setTopParentsFields(groupedByPosition.top || {});
    setBottomParentsFields(groupedByPosition.bottom || {});
  };

  const prepareParentFields = (rawFields = [], stateSnapshot = {}) => {
    const hiddenByDefault = new Set();

    rawFields.forEach((field) => {
      if (field?.isColumnVisible === false) {
        hiddenByDefault.add(Number(field.id));
      }

      if (
        typeof field?.columnsToHide === "string" &&
        field.columnsToHide.trim() !== ""
      ) {
        parseIdList(field.columnsToHide).forEach((id) => hiddenByDefault.add(id));
      }
    });

    const showIds = new Set();

    rawFields.forEach((field) => {
      if (
        field?.isColumnVisible &&
        typeof field?.columnsToHide === "string" &&
        field.columnsToHide.trim() !== ""
      ) {
        const targetIds = parseIdList(field.columnsToHide);
        const currentVal = stateSnapshot?.[field.fieldname];

        if (isShowValue(currentVal)) {
          targetIds.forEach((id) => showIds.add(id));
        }
      }
    });

    return rawFields.map((field) => {
      const id = Number(field.id);

      let visible = !hiddenByDefault.has(id);

      if (showIds.has(id)) {
        visible = true;
      }

      // hard fallback for TDS parent fields
      if (field.fieldname === "tdsAmt" || field.fieldname === "tdsAmtFC") {
        visible =
          stateSnapshot?.tdsApplicable === true ||
          stateSnapshot?.tdsApplicable === "true" ||
          stateSnapshot?.tdsApplicable === 1 ||
          stateSnapshot?.tdsApplicable === "1";
      }

      return {
        ...field,
        columnsToBeVisible: visible,
      };
    });
  };

  const updateParentFieldMeta = ({
    visibleIds = [],
    hiddenIds = [],
    enableIds = [],
    disableIds = [],
  }) => {
    const visibleSet = new Set(visibleIds.map(Number));
    const hiddenSet = new Set(hiddenIds.map(Number));
    const enableSet = new Set(enableIds.map(Number));
    const disableSet = new Set(disableIds.map(Number));

    setParentFieldDataInArray((prev) => {
      if (!Array.isArray(prev) || prev.length === 0) return prev;

      let changed = false;

      const updated = prev.map((field) => {
        const id = Number(field.id);
        let nextField = field;

        if (visibleSet.has(id) && field.columnsToBeVisible !== true) {
          nextField = { ...nextField, columnsToBeVisible: true };
        }

        if (hiddenSet.has(id) && field.columnsToBeVisible !== false) {
          nextField = { ...nextField, columnsToBeVisible: false };
        }

        if (enableSet.has(id) && field.isEditable !== true) {
          nextField = { ...nextField, isEditable: true };
        }

        if (disableSet.has(id) && field.isEditable !== false) {
          nextField = { ...nextField, isEditable: false };
        }

        if (nextField !== field) changed = true;
        return nextField;
      });

      return changed ? updated : prev;
    });
  };

  const clearDependentValues = (fieldNames = []) => {
    if (!fieldNames.length) return;

    const applyClear = (prev) => {
      let changed = false;
      const updates = {};

      fieldNames.forEach((name) => {
        if (prev[name] !== null && prev[name] !== "") {
          updates[name] = null;
          changed = true;
        }

        const ddKey = `${name}dropdown`;
        if (Object.prototype.hasOwnProperty.call(prev, ddKey) && prev[ddKey] !== null) {
          updates[ddKey] = null;
          changed = true;
        }

        const msKey = `${name}multiselect`;
        if (
          Object.prototype.hasOwnProperty.call(prev, msKey) &&
          Array.isArray(prev[msKey]) &&
          prev[msKey].length > 0
        ) {
          updates[msKey] = [];
          changed = true;
        }

        const dtKey = `${name}datetime`;
        if (
          Object.prototype.hasOwnProperty.call(prev, dtKey) &&
          prev[dtKey] !== null &&
          prev[dtKey] !== "null"
        ) {
          updates[dtKey] = null;
          changed = true;
        }
      });

      return changed ? { ...prev, ...updates } : prev;
    };

    setNewState(applyClear);
    setSubmitNewState(applyClear);
  };
  async function fetchData() {
    const { clientId } = getUserDetails();

    if (String(search?.menuName) !== "1560") {
      try {
        const tableViewApiResponse = await formControlMenuList(search.menuName);
        if (!tableViewApiResponse?.success) return;

        const menuConfig = tableViewApiResponse.data[0] || {};
        const rawFields = Array.isArray(menuConfig.fields) ? menuConfig.fields : [];

        const apiResponse = await masterTableInfo({
          clientID: parseInt(clientId),
          recordID: parseInt(search.id),
          menuID: parseInt(search.menuName),
        });

        if (!apiResponse || !apiResponse[0]) return;

        let data = apiResponse[0];
        let finalData = {};

        if (search.isCopy) {
          data.id = "";

          rawFields.forEach((iterator) => {
            if (iterator.isCopy) {
              finalData[iterator.fieldname] = data[iterator.fieldname];
            }
          });

          (menuConfig.child || []).forEach((child) => {
            if (child.isChildCopy) {
              finalData[child.tableName] = data[child.tableName];
            }
          });
        } else {
          finalData = data;
        }

        // -----------------------------
        // child/subchild index normalize
        // -----------------------------
        for (let item of menuConfig.child || []) {
          for (let index = 0; index < (finalData[item.tableName] || []).length; index++) {
            finalData[item.tableName][index].indexValue = index;

            for (const subchildItem of item.subChild || []) {
              for (
                let idx = 0;
                idx < (finalData[item.tableName][index][subchildItem.tableName] || []).length;
                idx++
              ) {
                finalData[item.tableName][index][subchildItem.tableName][idx].indexValue = idx;
              }
            }
          }
        }

        // -----------------------------
        // helpers
        // -----------------------------
        const parseIdList = (raw) =>
          String(raw || "")
            .split(",")
            .map((v) => Number(String(v).trim()))
            .filter((n) => !Number.isNaN(n));

        const isShowValue = (value) => {
          if (value === true || value === 1 || value === "1") return true;
          if (value === false || value === 0 || value === "0") return false;

          if (typeof value === "string") {
            const v = value.trim().toLowerCase();
            if (
              v === "" ||
              v === "false" ||
              v === "n" ||
              v === "no" ||
              v === "null" ||
              v === "undefined"
            ) {
              return false;
            }
            return true;
          }

          if (Array.isArray(value)) return value.length > 0;
          if (value && typeof value === "object") return Object.keys(value).length > 0;

          return value !== null && value !== undefined;
        };

        const showTds =
          finalData?.tdsApplicable === true ||
          finalData?.tdsApplicable === "true" ||
          finalData?.tdsApplicable === 1 ||
          finalData?.tdsApplicable === "1";

        // -----------------------------
        // parent visibility preparation
        // -----------------------------
        const hiddenByDefault = new Set();

        rawFields.forEach((field) => {
          if (field?.isColumnVisible === false) {
            hiddenByDefault.add(Number(field.id));
          }

          if (
            typeof field?.columnsToHide === "string" &&
            field.columnsToHide.trim() !== ""
          ) {
            parseIdList(field.columnsToHide).forEach((id) => hiddenByDefault.add(id));
          }
        });

        const showIds = new Set();

        rawFields.forEach((field) => {
          if (
            field?.isColumnVisible &&
            typeof field?.columnsToHide === "string" &&
            field.columnsToHide.trim() !== ""
          ) {
            const currentVal = finalData?.[field.fieldname];
            if (isShowValue(currentVal)) {
              parseIdList(field.columnsToHide).forEach((id) => showIds.add(id));
            }
          }
        });

        const preparedFields = rawFields.map((field) => {
          const id = Number(field.id);
          let visible = !hiddenByDefault.has(id);

          if (showIds.has(id)) {
            visible = true;
          }

          // hard fallback for parent TDS fields
          if (field.fieldname === "tdsAmt" || field.fieldname === "tdsAmtFC") {
            visible = showTds;
          }

          return {
            ...field,
            columnsToBeVisible: visible,
          };
        });

        // -----------------------------
        // action map
        // -----------------------------
        const tempActionFields = [];

        preparedFields.forEach((control) => {
          if (control?.isColumnVisible && control?.columnsToHide) {
            tempActionFields.push({
              parentFieldName: control.fieldname,
              sectionHeader: control.sectionHeader,
              columnsToHide: control.columnsToHide,
            });
          }

          if (control?.isColumnDisabled && control?.columnsToDisabled) {
            tempActionFields.push({
              parentFieldName: control.fieldname,
              sectionHeader: control.sectionHeader,
              columnsToDisabled: control.columnsToDisabled,
            });
          }
        });

        const seen = new Set();
        const mergedActionFields = tempActionFields.filter((item) => {
          const key = [
            item.parentFieldName || "",
            item.sectionHeader || "",
            item.columnsToHide || "",
            item.columnsToDisabled || "",
          ].join("|");

          if (seen.has(key)) return false;
          seen.add(key);
          return true;
        });

        // -----------------------------
        // child visibility preparation
        // tblVoucherLedger -> tdsAmtFC / tdsAmtHC
        // -----------------------------
        const rawChildConfig = menuConfig.child || menuConfig.children || [];

        const preparedChildConfig = rawChildConfig.map((child) => {
          if (child.tableName !== "tblVoucherLedger") return child;

          return {
            ...child,
            fields: (child.fields || []).map((field) => {
              if (field.fieldname === "tdsAmtFC" || field.fieldname === "tdsAmtHC") {
                return {
                  ...field,
                  columnsToBeVisible: showTds,
                };
              }
              return field;
            }),
          };
        });

        // -----------------------------
        // group parent sections
        // -----------------------------
        const groupAllFieldsData = groupAndSortAllFields(preparedFields);
        const resData = groupAndSortFields(preparedFields);

        // -----------------------------
        // set states
        // -----------------------------
        setFetchedApiResponse(menuConfig);
        setTableName(menuConfig.tableName);
        setIsRequiredAttachment(menuConfig?.isRequiredAttachment);

        setParentFieldDataInArray(preparedFields);
        setActionFieldNames(mergedActionFields);

        setFormControlData({
          ...menuConfig,
          fields: preparedFields,
        });

        setParentsFields(groupAllFieldsData);
        setTopParentsFields(resData.top || {});
        setBottomParentsFields(resData.bottom || {});

        setOriginalChildsFields(rawChildConfig);
        setChildsFields(preparedChildConfig);
        setButtonsData(menuConfig.buttons || []);

        setNewState((prev) => ({
          ...prev,
          ...finalData,
          tableName: menuConfig.tableName,
          attachment: data.attachment,
          menuID: search.menuName,
        }));

        setSubmitNewState((prev) => ({
          ...prev,
          ...finalData,
          tableName: menuConfig.tableName,
          attachment: data.attachment,
          menuID: search.menuName,
        }));

        setInitialState((prev) => ({
          ...prev,
          ...finalData,
          tableName: menuConfig.tableName,
        }));

        setTimeout(() => {
          setIsDataLoaded(true);
        }, 500);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    }
  }
  useEffect(() => {
    fetchData();
  }, []);

  function onLoadFunctionCall(
    functionData,
    formControlData,
    setFormControlData,
    setStateVariable,
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
        const updatedValues = func({
          args,
          newState,
          formControlData,
          setFormControlData,
          setStateVariable,
        });
        if (updatedValues) {
        }
        console.log("updatedValues", updatedValues);
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
            onLoadFunctionCall(
              funcCall,
              formControlData,
              setFormControlData,
              setNewState,
            );
          });
        }
      }
    }
  }, [isDataLoaded]);

  async function getRoundOffSetting(
    totalInvoiceAmount,
    totalInvoiceAmountFc,
    totalAmount,
    safeTaxAmount,
    safeTaxAmountFc,
    totalAmountFc,
    safeTdsAmount,
    safeTdsAmountFc
  ) {
    const { clientId } = getUserDetails();
    const { voucherTypeId } = newState || {};

    if (!voucherTypeId) return;

    const requestData = { voucherTypeId, clientId };

    const fetchRoundOffData = await getRoundOffData(requestData);
    console.log("fetchRoundOffData", fetchRoundOffData);

    const ro = fetchRoundOffData?.Chargers?.InvoiceRoundOff ?? "N";
    const roUpper = String(ro || "N").toUpperCase();
    console.log("omibaba", roUpper);

    setInvoiceRoundOff(roUpper);

    const to2 = (n) => {
      const x = Number(n) || 0;
      const v = Math.round((x + Number.EPSILON) * 100) / 100;
      return Object.is(v, -0) ? 0 : v;
    };

    const roundedHc = Math.round(Number(totalInvoiceAmount) || 0);
    const roundedFc = Math.round(Number(totalInvoiceAmountFc) || 0);

    const roundOffAmount = to2(roundedHc - (Number(totalInvoiceAmount) || 0));
    const roundOffAmountFc = to2(roundedFc - (Number(totalInvoiceAmountFc) || 0));

    if (roUpper === "Y") {
      setNewState((prev) => ({
        ...prev,
        invoiceAmount: totalAmount,
        invoiceAmountFc: totalAmountFc,
        taxAmount: safeTaxAmount,
        taxAmountFc: safeTaxAmountFc,
        tdsAmount: safeTdsAmount,
        tdsAmountFc: safeTdsAmountFc,
        tdsAmt: safeTdsAmount,
        tdsAmtFC: safeTdsAmountFc,
        totalInvoiceAmount: roundedHc,
        totalInvoiceAmountFc: roundedFc,
        roundOffAmount,
        roundOffAmountFc,
      }));
    } else {
      setNewState((prev) => ({
        ...prev,
        invoiceAmount: totalAmount,
        invoiceAmountFc: totalAmountFc,
        taxAmount: safeTaxAmount,
        taxAmountFc: safeTaxAmountFc,
        tdsAmount: safeTdsAmount,
        tdsAmountFc: safeTdsAmountFc,
        tdsAmt: safeTdsAmount,
        tdsAmtFC: safeTdsAmountFc,
        totalInvoiceAmount,
        totalInvoiceAmountFc,
        roundOffAmount: 0,
        roundOffAmountFc: 0,
      }));
    }
  }
  // useEffect(() => {
  //   console.log("changes in charges", newState?.tblInvoiceCharge);

  //   const charges = newState?.tblInvoiceCharge || [];

  //   const totalAmount = charges.reduce(
  //     (acc, item) => acc + (Number(item?.totalAmountHc) || 0),
  //     0
  //   );

  //   const taxAmount = charges.reduce((acc, item) => {
  //     const isTaxApplicable =
  //       item?.taxApplicable === true ||
  //       item?.taxApplicable === "true" ||
  //       item?.taxApplicable === 1;

  //     const temp = (item?.tblInvoiceChargeTax || []).reduce((acc1, item1) => {
  //       return isTaxApplicable ? acc1 + (Number(item1?.taxAmountHc) || 0) : acc1;
  //     }, 0);

  //     return acc + temp;
  //   }, 0);

  //   const totalAmountFc = charges.reduce(
  //     (acc, item) => acc + (Number(item?.totalAmountFc) || 0),
  //     0
  //   );

  //   const taxAmountFc = charges.reduce((acc, item) => {
  //     const isTaxApplicable =
  //       item?.taxApplicable === true ||
  //       item?.taxApplicable === "true" ||
  //       item?.taxApplicable === 1;

  //     const temp = (item?.tblInvoiceChargeTax || []).reduce((acc1, item1) => {
  //       return isTaxApplicable ? acc1 + (Number(item1?.taxAmountFc) || 0) : acc1;
  //     }, 0);

  //     return acc + temp;
  //   }, 0);

  //   const tdsAmount = charges.reduce((acc, item) => {
  //     const temp = (item?.tblInvoiceChargeTds || []).reduce((acc1, item1) => {
  //       const isTdsApplicable =
  //         item1?.tdsApplicable === true ||
  //         item1?.tdsApplicable === "true" ||
  //         item1?.tdsApplicable === 1 || item1?.id;

  //       return isTdsApplicable
  //         ? acc1 + (Number(item1?.tdsAmountHc) || 0)
  //         : acc1;
  //     }, 0);

  //     return acc + temp;
  //   }, 0);

  //   const tdsAmountFc = charges.reduce((acc, item) => {
  //     const temp = (item?.tblInvoiceChargeTds || []).reduce((acc1, item1) => {
  //       const isTdsApplicable =
  //         item1?.tdsApplicable === true ||
  //         item1?.tdsApplicable === "true" ||
  //         item1?.tdsApplicable === 1 || item1?.id;

  //       return isTdsApplicable
  //         ? acc1 + (Number(item1?.tdsAmountFc) || 0)
  //         : acc1;
  //     }, 0);

  //     return acc + temp;
  //   }, 0);

  //   const safeTaxAmount = Number.isNaN(taxAmount) ? 0 : taxAmount;
  //   const safeTaxAmountFc = Number.isNaN(taxAmountFc) ? 0 : taxAmountFc;
  //   const safeTdsAmount = Number.isNaN(tdsAmount) ? 0 : tdsAmount;
  //   const safeTdsAmountFc = Number.isNaN(tdsAmountFc) ? 0 : tdsAmountFc;

  //   let totalInvoiceAmount = totalAmount + safeTaxAmount;
  //   let totalInvoiceAmountFc = totalAmountFc + safeTaxAmountFc;

  //   getRoundOffSetting(
  //     totalInvoiceAmount,
  //     totalInvoiceAmountFc,
  //     totalAmount,
  //     safeTaxAmount,
  //     safeTaxAmountFc,
  //     totalAmountFc,
  //     safeTdsAmount,
  //     safeTdsAmountFc
  //   );
  // }, [newState?.tblInvoiceCharge, newState?.tblInvoiceCharge?.length, invoiceRoundOff]);

  //new useeffect to set decimal 
  useEffect(() => {

    console.log("changes in charges", newState?.tblInvoiceCharge);

    const round2 = (val) => (Number(val) || 0).toFixed(2);

    const charges = newState?.tblInvoiceCharge || [];

    const totalAmount = round2(
      charges.reduce((acc, item) => acc + (Number(item?.totalAmountHc) || 0), 0)
    );

    const taxAmount = round2(
      charges.reduce((acc, item) => {
        const isTaxApplicable =
          item?.taxApplicable === true ||
          item?.taxApplicable === "true" ||
          item?.taxApplicable === 1;

        const temp = (item?.tblInvoiceChargeTax || []).reduce((acc1, item1) => {
          return isTaxApplicable
            ? acc1 + (Number(item1?.taxAmountHc) || 0)
            : acc1;
        }, 0);

        return acc + temp;
      }, 0)
    );

    const totalAmountFc = round2(
      charges.reduce((acc, item) => acc + (Number(item?.totalAmountFc) || 0), 0)
    );

    const taxAmountFc = round2(
      charges.reduce((acc, item) => {
        const isTaxApplicable =
          item?.taxApplicable === true ||
          item?.taxApplicable === "true" ||
          item?.taxApplicable === 1;

        const temp = (item?.tblInvoiceChargeTax || []).reduce((acc1, item1) => {
          return isTaxApplicable
            ? acc1 + (Number(item1?.taxAmountFc) || 0)
            : acc1;
        }, 0);

        return acc + temp;
      }, 0)
    );

    const tdsAmount = round2(
      charges.reduce((acc, item) => {
        const temp = (item?.tblInvoiceChargeTds || []).reduce((acc1, item1) => {
          const isTdsApplicable =
            item1?.tdsApplicable === true ||
            item1?.tdsApplicable === "true" ||
            item1?.tdsApplicable === 1;

          return isTdsApplicable
            ? acc1 + (Number(item1?.tdsAmountHc) || 0)
            : acc1;
        }, 0);

        return acc + temp;
      }, 0)
    );

    const tdsAmountFc = round2(
      charges.reduce((acc, item) => {
        const temp = (item?.tblInvoiceChargeTds || []).reduce((acc1, item1) => {
          const isTdsApplicable =
            item1?.tdsApplicable === true ||
            item1?.tdsApplicable === "true" ||
            item1?.tdsApplicable === 1;

          return isTdsApplicable
            ? acc1 + (Number(item1?.tdsAmountFc) || 0)
            : acc1;
        }, 0);

        return acc + temp;
      }, 0)
    );

    const safeTaxAmount = round2(Number.isNaN(Number(taxAmount)) ? 0 : taxAmount);
    const safeTaxAmountFc = round2(Number.isNaN(Number(taxAmountFc)) ? 0 : taxAmountFc);
    const safeTdsAmount = round2(Number.isNaN(Number(tdsAmount)) ? 0 : tdsAmount);
    const safeTdsAmountFc = round2(Number.isNaN(Number(tdsAmountFc)) ? 0 : tdsAmountFc);

    const totalInvoiceAmount = round2(Number(totalAmount) + Number(safeTaxAmount));
    const totalInvoiceAmountFc = round2(Number(totalAmountFc) + Number(safeTaxAmountFc));

    getRoundOffSetting(
      totalInvoiceAmount,
      totalInvoiceAmountFc,
      totalAmount,
      safeTaxAmount,
      safeTaxAmountFc,
      totalAmountFc,
      safeTdsAmount,
      safeTdsAmountFc
    );
  }, [newState?.tblInvoiceCharge, newState?.tblInvoiceCharge?.length, invoiceRoundOff]);
  ///till here 
  const recalculateAllChargeTaxes = async () => {
    const charges = newState?.tblInvoiceCharge || [];
    if (!charges.length) return;

    const updatedCharges = await Promise.all(
      charges.map(async (charge) => {
        const requestData = {
          chargeId: charge?.chargeId,
          invoiceDate: moment(newState?.invoiceDate).format("YYYY-MM-DD"),
          departmentId: newState?.businessSegmentId,
          glId: charge?.chargeGlId,
          placeOfSupply_state: newState?.placeOfSupplyStateId,
          SelectedParentInvId: charge?.SelectedParentInvId || null,
          sez: newState?.sez,
          customerId: newState?.billingPartyId,
          ownStateId: newState?.ownStateId,
          formControlId: newState?.menuID,
          totalAmount: charge?.totalAmount,
          totalAmountFc: charge?.totalAmountFc,
          sacCodeId: charge?.sacId,
          totalAmountHc: charge?.totalAmountHc || charge?.totalAmount,
          taxType: newState?.taxType || "G",
          companyId: getUserDetails().companyId,
          branchId: getUserDetails().branchId,
          finYearId: getUserDetails().financialYear,
          userId: getUserDetails().userId,
          clientId: getUserDetails().clientId,
          totalAmtInvoiceCurr: newState?.totalInvoiceAmountFc,
          billingPartyBranch: newState?.billingPartyBranchId,
          billingPartyState: newState?.billingPartyStateId,
          voucherTypeId: newState?.voucherTypeId,
        };

        const res = await getTaxDetails(requestData);

        return {
          ...charge,
          tblInvoiceChargeTax: res?.tblTax || [],
        };
      })
    );

    setNewState((prev) => ({
      ...prev,
      tblInvoiceCharge: updatedCharges,
    }));
  };

  useEffect(() => {
    if (!newState?.tblInvoiceCharge?.length) return;

    recalculateAllChargeTaxes();
  }, [
    newState?.placeOfSupplyStateId,
    newState?.invoiceDate,
    newState?.businessSegmentId,
    newState?.sez,
    newState?.billingPartyId,
    newState?.ownStateId,
    newState?.taxType,
    newState?.billingPartyBranchId,
    newState?.billingPartyStateId,
    newState?.voucherTypeId,
  ]);

 useEffect(() => {
  if (!Array.isArray(newState?.tblInvoiceCharge)) return;

  const updateChargesByCurrency = async () => {
    try {
      const { companyId } = getUserDetails();

      const request = {
        columns: "currencyId",
        tableName: "tblCompanyParameter",
        whereCondition: `companyId=${companyId}`,
        clientIdCondition: `status=1 FOR JSON PATH, INCLUDE_NULL_VALUES`,
      };

      const response = await fetchReportData(request);
      const homeCurrencyId = response?.data?.[0]?.currencyId;

      let hasChanges = false;

      const updatedCharges = newState.tblInvoiceCharge.map((item) => {
        const childCurrencyId = item.currencyId; // change if needed
        const currencyId = newState.currencyId;
        const ParentExchangeRate = newState.exchangeRate || 0;

        const qty = item.qty || 0;
        const exchangeRate = item.exchangeRate || 0;
        const rate = item.rate || 0;
        const noOfDays = item.noOfDays;

        const effectiveNoOfDays =
          !noOfDays || Number(noOfDays) <= 0 ? 1 : Number(noOfDays);

        let totalAmountFc = "0.00";
        let totalAmountHc = "0.00";

        if (homeCurrencyId == currencyId) {
          totalAmountFc = Number(
            qty * rate * exchangeRate * effectiveNoOfDays
          ).toFixed(2);

          totalAmountHc = Number(
            qty * rate * exchangeRate * effectiveNoOfDays
          ).toFixed(2);
        } else {
          totalAmountFc = Number(
            qty * rate * exchangeRate * effectiveNoOfDays
          ).toFixed(2);

          if (currencyId != childCurrencyId) {
            totalAmountHc = Number(
              qty * rate * effectiveNoOfDays
            ).toFixed(2);
          } else {
            totalAmountHc = Number(
              ParentExchangeRate != 0
                ? (qty * rate * effectiveNoOfDays) / ParentExchangeRate
                : 0
            ).toFixed(2);
          }
        }

        if (
          item.totalAmountFc !== totalAmountFc ||
          item.totalAmountHc !== totalAmountHc
        ) {
          hasChanges = true;
          return {
            ...item,
            totalAmountFc,
            totalAmountHc,
          };
        }

        return item;
      });

      if (hasChanges) {
        setNewState((prev) => ({
          ...prev,
          tblInvoiceCharge: updatedCharges,
        }));
      }
    } catch (error) {
      console.error("Error while calculating charge amounts:", error);
    }
  };

  updateChargesByCurrency();
}, [newState?.tblInvoiceCharge, newState?.currencyId, newState?.exchangeRate]);

  // Define your button click handlers
 const handleButtonClick = {
    handleSubmit: async () => {
      if (isFormSaved)
        return toast.error(
          "This form has already been saved. Please refresh the screen to save one more record",
        );
      const isEqual = areObjectsEqual(newState, initialState);
      if (!isEqual) {
        // eslint-disable-next-line no-unused-vars
        for (const [section, fields] of Object.entries(parentsFields)) {
          const missingField = Object.entries(fields).find(
            // eslint-disable-next-line no-unused-vars
            ([, { isRequired, fieldname, yourlabel }]) =>
              isRequired && !newState[fieldname],
          );

          if (missingField) {
            const [, { yourlabel }] = missingField;
            toast.error(`Value for${yourlabel} is missing.`);
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
                  setNewState,
                ),
              );
            // onSubmitValidation?.[formControlData.functionOnSubmit]({
            //   ...newState})
          }
        } catch (error) {
          return toast.error(error.message);
        }
        try {
          // let data = await handleSubmitApi(submitNewState);
          const cleanData = replaceNullStrings(
            { ...newState, menuId: selectedMenuId },
            ChildTableName,
          );
          if (uriDecodedMenu?.menuName == "Journal Voucher") {
            const voucherLedgerTotals = cleanData?.tblVoucherLedger?.reduce(
              (totals, row) => {
                const debit = Number(row?.debitAmount) || 0;
                const credit = Number(row?.creditAmount) || 0;

                totals.debitAmount += debit;
                totals.creditAmount += credit;

                return totals;
              },
              { debitAmount: 0, creditAmount: 0 },
            );

            console.log("cleanData", cleanData);
            const tallyDebitCreditRequestBody = {
              debitAmt: voucherLedgerTotals?.debitAmount,
              creditAmt: voucherLedgerTotals?.creditAmount,
            };

            const tallyDebitCreditData = await tallyDebitCredit(
              tallyDebitCreditRequestBody,
            );

            if (tallyDebitCreditData.success === true) {
              setParaText(tallyDebitCreditData?.message);
              setIsError(false);
              setOpenModal((prev) => !prev);
              return;
            }
          }
          if (
            uriDecodedMenu?.menuName === "Journal Voucher" ||
            uriDecodedMenu?.menuName === "Contra Voucher" ||
            tableName === "tblVoucher"
          ) {
            // Safety guard
            if (!cleanData || typeof cleanData !== "object") {
              console.log("cleanData is not a valid object:", cleanData);
            } else {
              if (!Array.isArray(cleanData.tblVoucherLedger)) {
                // normalize if it's null / undefined / not an array
                cleanData.tblVoucherLedger = [];
              } else {
                cleanData.tblVoucherLedger = cleanData.tblVoucherLedger.map(
                  (ledger) => {
                    if (!ledger || typeof ledger !== "object") return ledger;

                    const details = Array.isArray(
                      ledger.tblVoucherLedgerDetails,
                    )
                      ? ledger.tblVoucherLedgerDetails
                      : [];

                    // keep only checked rows; if none → [], as required
                    const filteredDetails = details.filter(
                      (row) => row && row.isChecked === true,
                    );

                    return {
                      ...ledger,
                      tblVoucherLedgerDetails: filteredDetails, // [] if no checked rows
                    };
                  },
                );
              }
            }

            console.log("cleanData new =>", cleanData);
          }
          setIsFormSaved(true);
          let data = await handleSubmitApi(cleanData);
          if (data.success == true) {
            setIsFormSaved(true);
            if (isReportPresent) {
              toast.success(data.message);
              // const id =
              //   data?.data?.recordsets[1][0]?.ParentId ||
              //   data?.data?.recordsets[0]?.ParentId;
              //const id = data?.data?.recordsets[0]?.[0]?.ParentId;
              const id = data?.data?.recordsets.at(-1)?.at(-1)?.ParentId;
              setOpenPrintModal((prev) => !prev);
              setSubmittedMenuId(search?.menuName);
              setSubmittedRecordId(id);
            }
          } else {
            toast.error(data.message);
            setIsFormSaved(false);
          }
          if (data.success == true) {
            toast.success(data.message);
            const requestBody = {
              tableName: tableName,
              recordId: search.id,
            };
            const validateSubmitData = await validateSubmit(requestBody);
            if (validateSubmitData.success === true) {
              setParaText(validateSubmitData.message);
              setIsError(false);
              //setOpenModal((prev) => !prev);
            }

            if (newState.tableName == "tblInvoice") {
              const insertedInvoiceId =
                data?.data?.recordsets?.at(-1)?.at(-1)?.ParentId ??
                data?.data?.recordsets?.at(-1)?.at(-1)?.id ??
                data?.data?.recordsets?.at(-1)?.at(-1)?.InsertedId ??
                data?.data?.recordset?.at(-1)?.ParentId ??
                data?.data?.recordset?.at(-1)?.id ??
                data?.data?.recordset?.at(-1)?.InsertedId ??
                0;

              if (insertedInvoiceId) {
                const invoiceRes = await eInvoicing({
                  invoiceId: insertedInvoiceId,
                  billingPartyId: newState?.billingPartyId,
                });

                if (invoiceRes?.success !== true) {
                  toast.error(invoiceRes?.message || "E-Invoicing failed.");
                }
              }
            }
          } else {
            toast.error(data.message);
            setIsFormSaved(false);
          }
        } catch (error) {
          toast.error(error.message);
          setIsFormSaved(false);
        }
      } else {
        toast.error("No changes made");
      }
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
          : "Do you want to close this form?",
      );
      setIsError(true);
      setOpenModal((prev) => !prev);
      setTypeofModal("onClose");
    },
    handleSaveClose: async () => {
      const isEqual = areObjectsEqual(newState, initialState);
      if (!isEqual) {
        // eslint-disable-next-line no-unused-vars
        for (const [section, fields] of Object.entries(parentsFields)) {
          const missingField = Object.entries(fields).find(
            // eslint-disable-next-line no-unused-vars
            ([, { isRequired, fieldname, yourlabel }]) =>
              isRequired && !newState[fieldname],
          );

          if (missingField) {
            const [, { yourlabel }] = missingField;
            toast.error(`Value for${yourlabel} is missing.`);
            return;
          }
        }
        const cleanData = replaceNullStrings(
          { ...newState, menuId: selectedMenuId },
          ChildTableName,
        );
        setIsFormSaved(true);
        let data = await handleSubmitApi(cleanData);
        if (data.success == true) {
          toast.success(data.message);
          const requestBody = {
            tableName: tableName,
            recordId: search.id,
          };
          const validateSubmitData = await validateSubmit(requestBody);
          if (validateSubmitData.success === true) {
            setParaText(validateSubmitData.message);
            setIsError(false);
            setOpenModal((prev) => !prev);
          }
          // setTimeout(() => {
          //   push(`/invoiceControl?menuName=${encryptUrlFun({
          //        id: search.menuName,
          //        menuName: search.menuName,
          //        parentMenuId: search.menuName,
          //       })}`);
          // }, 500);
        } else {
          toast.error(data.message);
          setIsFormSaved(false);
        }
      } else {
        toast.error("No changes made");
      }
    },
    // handleSavePrint: () => {
    //   toast.error("Not available now");
    // },
    handleSavePrint: async () => {
      const isEqual = areObjectsEqual(newState, initialState);
      if (!isEqual) {
        // eslint-disable-next-line no-unused-vars
        for (const [section, fields] of Object.entries(parentsFields)) {
          const missingField = Object.entries(fields).find(
            // eslint-disable-next-line no-unused-vars
            ([, { isRequired, fieldname, yourlabel }]) =>
              isRequired && !newState[fieldname],
          );

          if (missingField) {
            const [, { yourlabel }] = missingField;
            toast.error(`Value for${yourlabel} is missing.`);
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
                  setNewState,
                ),
              );
            // onSubmitValidation?.[formControlData.functionOnSubmit]({
            //   ...newState})
          }
        } catch (error) {
          return toast.error(error.message);
        }
        try {
          // let data = await handleSubmitApi(submitNewState);
          const cleanData = replaceNullStrings(
            { ...newState, menuId: selectedMenuId },
            ChildTableName,
          );
          let data = await handleSubmitApi(cleanData);
          if (data.success == true) {
            toast.success(data.message);
            const id = data?.data?.recordset[0]?.id;
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
    handleVoucherSubmit: async () => {
      console.log("newState", newState);

      if (isFormSaved)
        return toast.error(
          "This form has already been saved. Please refresh the screen to save one more record",
        );

      const isEqual = areObjectsEqual(newState, initialState);
      if (isEqual) return toast.error("No changes made");

      // ✅ required fields validation
      for (const [section, fields] of Object.entries(parentsFields)) {
        const missingField = Object.entries(fields).find(
          ([, { isRequired, fieldname, yourlabel }]) =>
            isRequired && !newState[fieldname],
        );
        if (missingField) {
          const [, { yourlabel }] = missingField;
          toast.error(`Value for ${yourlabel} is missing.`);
          return;
        }
      }

      // ✅ functionOnSubmit hook
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
                setNewState,
              ),
            );
        }
      } catch (error) {
        return toast.error(error.message);
      }

      try {
        const cleanData = replaceNullStrings(
          { ...newState, menuId: selectedMenuId },
          ChildTableName,
        );

        setIsFormSaved(true);

        if (
          uriDecodedMenu?.menuName === "Journal Voucher" ||
          uriDecodedMenu?.menuName === "Contra Voucher" ||
          tableName === "tblVoucher"
        ) {
          if (!cleanData || typeof cleanData !== "object") {
            console.log("cleanData is not a valid object:", cleanData);
          } else {
            if (!Array.isArray(cleanData.tblVoucherLedger)) {
              cleanData.tblVoucherLedger = [];
            } else {
              cleanData.tblVoucherLedger = cleanData.tblVoucherLedger.map(
                (ledger) => {
                  if (!ledger || typeof ledger !== "object") return ledger;

                  const details = Array.isArray(ledger.tblVoucherLedgerDetails)
                    ? ledger.tblVoucherLedgerDetails
                    : [];

                  const filteredDetails = details.filter(
                    (row) => row && row.isChecked === true,
                  );

                  return {
                    ...ledger,
                    tblVoucherLedgerDetails: filteredDetails,
                  };
                },
              );
            }
          }
        }

        console.log("cleanData new =>", cleanData);

        const user = getUserDetails?.() || {};
        const loginCompanyId = user.companyId ?? cleanData.companyId ?? 0;
        const loginBranchId = user.branchId ?? cleanData.companyBranchId ?? 0;
        const loginClientId = user.clientId ?? cleanData.clientId ?? 0;

        const loginFinYearId =
          user.financialYear ??
          user.finYearId ??
          user.loginfinYear ??
          cleanData.financialYearId ??
          0;

        // ✅ payload as Node expects
        const payload = {
          recordId: Number(cleanData?.id ?? search?.id ?? 0) || 0,
          clientId: Number(cleanData?.clientId ?? loginClientId ?? 0) || 0,
          companyId: Number(cleanData?.companyId ?? loginCompanyId ?? 0) || 0,
          companyBranchId:
            Number(cleanData?.companyBranchId ?? loginBranchId ?? 0) || 0,
          financialYearId:
            Number(cleanData?.financialYearId ?? loginFinYearId ?? 0) || 0,
          userId: Number(user.userId ?? user.id ?? cleanData?.userId ?? 0) || 0,
          json: cleanData,
        };

        const data = await insertVoucherDataDynami(payload);

        if (data?.success === true) {
          toast.success(data.message);

          if (isReportPresent) {
            const lastRow = Array.isArray(data?.data) ? data.data.at(-1) : null;
            const id =
              lastRow?.id ?? lastRow?.ParentId ?? lastRow?.recordId ?? null;

            if (id) {
              setOpenPrintModal((prev) => !prev);
              setSubmittedMenuId(uriDecodedMenu?.id);
              setSubmittedRecordId(id);
            }
          }

          dispatch(updateFlag({ flag: "isRedirection", value: true }));

          const requestBody = {
            tableName: tableName,
            recordId: uriDecodedMenu.id,
          };
          const validateSubmitData = await validateSubmit(requestBody);

          if (validateSubmitData.success === true) {
            setParaText(validateSubmitData.message);
            setIsError(false);
            setOpenModal((prev) => !prev);
          }

          // eInvoicing block unchanged
          let invoiceType = "n";
          if (invoiceType === "y") {
            if (newState.tableName == "tblInvoice") {
              let insertData = {
                invoiceId: Array.isArray(data?.data)
                  ? data?.data?.[0]?.ParentId || 0
                  : 0,
                billingPartyId: newState.billingPartyId,
                companyId: newState.companyId,
              };
              let invoiceRes = await eInvoicing(insertData);
              if (invoiceRes.success == true) {
                toast.success(invoiceRes.message);
              } else {
                setNewState((per) => ({
                  ...per,
                  id: Array.isArray(data?.data)
                    ? data?.data?.[0]?.ParentId || 0
                    : per.id,
                }));
                setIsFormSaved(false);
                return toast.error(invoiceRes?.message);
              }
            }
          }

          return;
        } else {
          toast.error(data?.message || "Failed to save.");
          setIsFormSaved(false);
          return;
        }
      } catch (error) {
        toast.error(error.message);
        setIsFormSaved(false);
      }
    },
    getThirdLevelDetails: getThirdLevelDetails,
  };
  async function getThirdLevelDetails(obj) {
    // const {
    //   args,
    //   newState,
    //   formControlData,
    //   setFormControlData,
    //   values,
    //   fieldName,
    //   tableName,
    //   setStateVariable,
    //   onChangeHandler,
    // } = obj;

    const values = newState;
    const { companyId, clientId, branchId, userId, financialYear } =
      getUserDetails();

    // Parse args
    // let argNames;
    // let splitArgs = [];
    // if (
    //   args === undefined ||
    //   args === null ||
    //   args === "" ||
    //   (typeof args === "object" && Object.keys(args).length === 0)
    // ) {
    //   argNames = args;
    // } else {
    //   argNames = args.split(",").map((arg) => arg.trim());
    //   for (const iterator of argNames) {
    //     splitArgs.push(iterator.split("."));
    //   }
    // }

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
                  label:
                    item.containerRepairName ?? String(_containerRepairId),
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
        0,
      );

      // ✅ total of (noOfDays * rate)
      const totalWeighted = updatedChargers.reduce(
        (acc, item) =>
          acc + (Number(item["noOfDays"]) || 0) * (Number(item["rate"]) || 0),
        0,
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

      setNewState((prev) => ({
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
  }
  const onConfirm = async (conformData) => {
    if (uriDecodedMenu?.menuName == "Journal Voucher") {
      setOpenModal((prev) => !prev);
      return;
    }
    if (conformData.type === "onClose") {
      if (conformData.isError) {
        setOpenModal((prev) => !prev);
        setNewState({ routeName: "mastervalue" });
        setSubmitNewState({ routeName: "mastervalue" });
        push(
          `/invoiceControl?menuName=${encryptUrlFun({
            id: search.menuName,
            menuName: search.menuName,
            parentMenuId: search.menuName,
          })}`,
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

  // ✅ refs (keep them as-is, add the new skip-first ref)
  // const allocPrevRef = useRef({
  //   amtHC: "",
  //   amtFC: "",
  //   checks: [],
  //   parentLedger: [],
  // });

  // const allocPrevRef = useRef("");
  // const allocInternalUpdateRef = useRef(false); // ✅ prevents max update depth loop

  // useEffect(() => {
  //   if (allocInternalUpdateRef.current) {
  //     allocInternalUpdateRef.current = false;
  //     return;
  //   }

  //   const toNum = (v) => {
  //     if (v === null || v === undefined || v === "") return 0;
  //     const n = Number(String(v).replace(/,/g, ""));
  //     return Number.isFinite(n) ? n : 0;
  //   };

  //   const round2 = (n) => Math.round((Number(n) || 0) * 100) / 100;

  //   const asStr2 = (n) =>
  //     n === null || n === undefined || n === "" ? "" : round2(n).toFixed(2);

  //   const asNum2 = (n) => round2(n);

  //   const clamp0 = (n) => Math.max(0, round2(n));

  //   const normalizeOriginalBalance = ({
  //     originalValue,
  //     balanceValue,
  //     creditValue,
  //     debitValue,
  //   }) => {
  //     if (originalValue !== null && originalValue !== undefined && originalValue !== "") {
  //       return round2(toNum(originalValue));
  //     }
  //     return round2(
  //       toNum(balanceValue) + toNum(creditValue) - toNum(debitValue),
  //     );
  //   };

  //   const getLedgerKey = (ledger, index) =>
  //     ledger?.voucherLedgerId != null
  //       ? String(ledger.voucherLedgerId)
  //       : String(ledger?.indexValue ?? index);

  //   const getDetailKey = (row, index) =>
  //     row?.voucherOutstandingId != null
  //       ? String(row.voucherOutstandingId)
  //       : String(row?.indexValue ?? index);

  //   const makeSnapshot = (ledgerRows, balanceAmtHc, balanceAmtFc) =>
  //     JSON.stringify({
  //       balanceAmtHc: asStr2(balanceAmtHc),
  //       balanceAmtFc: asStr2(balanceAmtFc),
  //       ledgers: ledgerRows.map((ledger, ledgerIndex) => ({
  //         k: getLedgerKey(ledger, ledgerIndex),
  //         d: asStr2(ledger?.debitAmount),
  //         df: asStr2(ledger?.debitAmountFc),
  //         cr: asStr2(ledger?.creditAmount),
  //         crf: asStr2(ledger?.creditAmountFc),
  //         rows: (Array.isArray(ledger?.tblVoucherLedgerDetails)
  //           ? ledger.tblVoucherLedgerDetails
  //           : []
  //         ).map((row, rowIndex) => ({
  //           k: getDetailKey(row, rowIndex),
  //           c: !!row?.isChecked,
  //           neg: !!row?.__isNegRow,
  //           ob: asStr2(row?.__origBalHC),
  //           obf: asStr2(row?.__origBalFC),
  //           d: asStr2(row?.debitAmount),
  //           df: asStr2(row?.debitAmountFc),
  //           cr: asStr2(row?.creditAmount),
  //           crf: asStr2(row?.creditAmountFc),
  //           b: asStr2(row?.balanceAmount),
  //           bf: asStr2(row?.balanceAmountFc),
  //         })),
  //       })),
  //     });

  //   const hasLedgers =
  //     Array.isArray(newState?.tblVoucherLedger) &&
  //     newState.tblVoucherLedger.length > 0;

  //   const ledgers = hasLedgers
  //     ? newState.tblVoucherLedger
  //     : [
  //       {
  //         __virtual: true,
  //         tblVoucherLedgerDetails: Array.isArray(newState?.tblVoucherLedgerDetails)
  //           ? newState.tblVoucherLedgerDetails
  //           : [],
  //       },
  //     ];

  //   const allDetails = ledgers.flatMap((l) =>
  //     Array.isArray(l?.tblVoucherLedgerDetails) ? l.tblVoucherLedgerDetails : []
  //   );

  //   if (!allDetails.length && !hasLedgers) {
  //     allocPrevRef.current = "";
  //     return;
  //   }

  //   const currentSnapshot = makeSnapshot(
  //     ledgers,
  //     newState?.balanceAmtHc,
  //     newState?.balanceAmtFc,
  //   );

  //   let remainingHC = round2(
  //     toNum(newState?.amtRec ?? 0) +
  //     toNum(newState?.bankCharges ?? 0)
  //   );
  //   let remainingFC = round2(toNum(newState?.amtRecFC ?? 0) + toNum(newState?.bankCharges ?? 0));

  //   const nextLedgers = ledgers.map((ledger) => {
  //     const details = Array.isArray(ledger?.tblVoucherLedgerDetails)
  //       ? ledger.tblVoucherLedgerDetails
  //       : [];

  //     if (!details.length) {
  //       const manualCreditHC = round2(toNum(ledger?.creditAmount));
  //       const manualCreditFC = round2(toNum(ledger?.creditAmountFc));
  //       const manualDebitHC = round2(toNum(ledger?.debitAmount));
  //       const manualDebitFC = round2(toNum(ledger?.debitAmountFc));

  //       remainingHC = round2(remainingHC - manualCreditHC + manualDebitHC);
  //       remainingFC = round2(remainingFC - manualCreditFC + manualDebitFC);

  //       return {
  //         ...ledger,
  //         isChildChecked: false,
  //       };
  //     }

  //     let isChildChecked = false;

  //     const nextDetails = details.map((row) => {
  //       if (row?.ispreChecked) return row; // skip already pre-checked rows from snapshot
  //       const isChecked = !!row?.isChecked;
  //       if (isChecked) {
  //         isChildChecked = true;
  //       }

  //       const origBalHC = normalizeOriginalBalance({
  //         originalValue: row?.__origBalHC,
  //         balanceValue: row?.balanceAmount,
  //         creditValue: row?.creditAmount,
  //         debitValue: row?.debitAmount,
  //       });
  //       const origBalFC = normalizeOriginalBalance({
  //         originalValue: row?.__origBalFC,
  //         balanceValue: row?.balanceAmountFc,
  //         creditValue: row?.creditAmountFc,
  //         debitValue: row?.debitAmountFc,
  //       });

  //       const isNegativeRow = origBalHC < 0 || origBalFC < 0;

  //       if (!isChecked) {
  //         return {
  //           ...row,
  //           __isNegRow: isNegativeRow,
  //           __origBalHC: origBalHC,
  //           __origBalFC: origBalFC,
  //           debitAmount: "0.00",
  //           debitAmountFc: "0.00",
  //           creditAmount: "0.00",
  //           creditAmountFc: "0.00",
  //           balanceAmount: asNum2(origBalHC),
  //           balanceAmountFc: asNum2(origBalFC),
  //         };
  //       }

  //       let debitHC = 0;
  //       let debitFC = 0;
  //       let creditHC = 0;
  //       let creditFC = 0;
  //       let balanceHC = origBalHC;
  //       let balanceFC = origBalFC;

  //       if (origBalHC < 0) {
  //         debitHC = round2(Math.abs(origBalHC));
  //         balanceHC = 0;
  //         remainingHC = round2(remainingHC + debitHC);
  //       } else if (origBalHC > 0) {
  //         creditHC = clamp0(Math.min(remainingHC, origBalHC));
  //         balanceHC = round2(origBalHC - creditHC);
  //         remainingHC = round2(remainingHC - creditHC);
  //       }

  //       if (origBalFC < 0) {
  //         debitFC = round2(Math.abs(origBalFC));
  //         balanceFC = 0;
  //         remainingFC = round2(remainingFC + debitFC);
  //       } else if (origBalFC > 0) {
  //         creditFC = clamp0(Math.min(remainingFC, origBalFC));
  //         balanceFC = round2(origBalFC - creditFC);
  //         remainingFC = round2(remainingFC - creditFC);
  //       }

  //       return {
  //         ...row,
  //         __isNegRow: isNegativeRow,
  //         __origBalHC: origBalHC,
  //         __origBalFC: origBalFC,
  //         debitAmount: asStr2(debitHC),
  //         debitAmountFc: asStr2(debitFC),
  //         creditAmount: asStr2(creditHC),
  //         creditAmountFc: asStr2(creditFC),
  //         balanceAmount: asNum2(balanceHC),
  //         balanceAmountFc: asNum2(balanceFC),
  //       };
  //     });

  //     const parentCreditHC = round2(
  //       nextDetails.reduce((sum, r) => sum + toNum(r?.creditAmount), 0),
  //     );
  //     const parentCreditFC = round2(
  //       nextDetails.reduce((sum, r) => sum + toNum(r?.creditAmountFc), 0),
  //     );
  //     const parentDebitHC = round2(
  //       nextDetails.reduce((sum, r) => sum + toNum(r?.debitAmount), 0),
  //     );
  //     const parentDebitFC = round2(
  //       nextDetails.reduce((sum, r) => sum + toNum(r?.debitAmountFc), 0),
  //     );

  //     const prevCreditHC = round2(toNum(ledger?.creditAmount));
  //     const prevCreditFC = round2(toNum(ledger?.creditAmountFc));
  //     const prevDebitHC = round2(toNum(ledger?.debitAmount));
  //     const prevDebitFC = round2(toNum(ledger?.debitAmountFc));

  //     const nextCreditHC =
  //       !isChildChecked
  //         ? ledger?.creditAmount ?? asStr2(prevCreditHC)
  //         : asStr2(parentCreditHC);
  //     const nextCreditFC =
  //       !isChildChecked
  //         ? ledger?.creditAmountFc ?? asStr2(prevCreditFC)
  //         : asStr2(parentCreditFC);
  //     const nextDebitHC =
  //       !isChildChecked
  //         ? ledger?.debitAmount ?? asStr2(prevDebitHC)
  //         : asStr2(parentDebitHC);
  //     const nextDebitFC =
  //       !isChildChecked
  //         ? ledger?.debitAmountFc ?? asStr2(prevDebitFC)
  //         : asStr2(parentDebitFC);

  //     if (!isChildChecked) {
  //       remainingHC = round2(remainingHC - toNum(nextCreditHC) + toNum(nextDebitHC));
  //       remainingFC = round2(remainingFC - toNum(nextCreditFC) + toNum(nextDebitFC));
  //     }

  //     return {
  //       ...ledger,
  //       isChildChecked,
  //       tblVoucherLedgerDetails: nextDetails,
  //       creditAmount: nextCreditHC,
  //       creditAmountFc: nextCreditFC,
  //       debitAmount: nextDebitHC,
  //       debitAmountFc: nextDebitFC,
  //     };
  //   });

  //   const nextBalanceAmtHc = asStr2(remainingHC);
  //   const nextBalanceAmtFc = asStr2(remainingFC);
  //   const nextSnapshot = makeSnapshot(
  //     nextLedgers,
  //     nextBalanceAmtHc,
  //     nextBalanceAmtFc,
  //   );

  //   if (nextSnapshot === currentSnapshot || allocPrevRef.current === nextSnapshot) {
  //     allocPrevRef.current = nextSnapshot;
  //     return;
  //   }

  //   allocPrevRef.current = nextSnapshot;
  //   allocInternalUpdateRef.current = true;

  //   setNewState((prevState) => {
  //     const out = Array.isArray(prevState?.tblVoucherLedger)
  //       ? {
  //         ...prevState,
  //         tblVoucherLedger: nextLedgers.filter((l) => !l?.__virtual),
  //         balanceAmtHc: nextBalanceAmtHc,
  //         balanceAmtFc: nextBalanceAmtFc,
  //       }
  //       : {
  //         ...prevState,
  //         tblVoucherLedgerDetails:
  //           nextLedgers[0]?.tblVoucherLedgerDetails || [],
  //         balanceAmtHc: nextBalanceAmtHc,
  //         balanceAmtFc: nextBalanceAmtFc,
  //       };

  //     return out;
  //   });
  // }, [
  //   newState?.amtRec,
  //   newState?.amtRecFC,
  //   newState?.bankCharges,
  //   newState?.tdsAmt,
  //   JSON.stringify(newState?.tblVoucherLedger),
  //   JSON.stringify(newState?.tblVoucherLedgerDetails),
  // ]);

  const allocPrevRef = useRef("");
  const allocInternalUpdateRef = useRef(false);
  const allocHydrateRef = useRef(true);

  useEffect(() => {
    if (allocInternalUpdateRef.current) {
      allocInternalUpdateRef.current = false;
      return;
    }

    const voucherTypeId = String(newState?.voucherTypeId ?? "");
    const shouldSwapDrCr = voucherTypeId === "8";
    const shouldPreserveLoadedBalance = Boolean(search?.id) && !search?.isCopy;

    const toNum = (v) => {
      if (v === null || v === undefined || v === "") return 0;
      const n = Number(String(v).replace(/,/g, ""));
      return Number.isFinite(n) ? n : 0;
    };

    const round2 = (n) => Math.round((Number(n) || 0) * 100) / 100;

    const asStr2 = (n) =>
      n === null || n === undefined || n === "" ? "" : round2(n).toFixed(2);

    const asNum2 = (n) => round2(n);

    const clamp0 = (n) => Math.max(0, round2(n));

    const stateToLogic = (debitValue, creditValue) => {
      if (shouldSwapDrCr) {
        return {
          debit: round2(toNum(creditValue)),
          credit: round2(toNum(debitValue)),
        };
      }

      return {
        debit: round2(toNum(debitValue)),
        credit: round2(toNum(creditValue)),
      };
    };

    const logicToStateHC = (debitValue, creditValue) => {
      if (shouldSwapDrCr) {
        return {
          debitAmount: asStr2(creditValue),
          creditAmount: asStr2(debitValue),
        };
      }

      return {
        debitAmount: asStr2(debitValue),
        creditAmount: asStr2(creditValue),
      };
    };

    const logicToStateFC = (debitValue, creditValue) => {
      if (shouldSwapDrCr) {
        return {
          debitAmountFc: asStr2(creditValue),
          creditAmountFc: asStr2(debitValue),
        };
      }

      return {
        debitAmountFc: asStr2(debitValue),
        creditAmountFc: asStr2(creditValue),
      };
    };

    const normalizeOriginalBalance = ({
      originalValue,
      balanceValue,
      creditValue,
      debitValue,
    }) => {
      if (
        originalValue !== null &&
        originalValue !== undefined &&
        originalValue !== ""
      ) {
        return round2(toNum(originalValue));
      }

      const logical = stateToLogic(debitValue, creditValue);
      return round2(toNum(balanceValue) + logical.credit - logical.debit);
    };

    const getRowOrigBalHC = (row) =>
      normalizeOriginalBalance({
        originalValue:
          row?.__origBalHC ??
          row?.balanceAmtHC ??
          row?.balanceAmtHc ??
          row?.balanceAmt,
        balanceValue: row?.balanceAmount,
        creditValue: row?.creditAmount,
        debitValue: row?.debitAmount,
      });

    const getRowOrigBalFC = (row) =>
      normalizeOriginalBalance({
        originalValue:
          row?.__origBalFC ??
          row?.balanceAmtFC ??
          row?.balanceAmtFc ??
          row?.balanceAmt,
        balanceValue: row?.balanceAmountFc,
        creditValue: row?.creditAmountFc,
        debitValue: row?.debitAmountFc,
      });

    const getLedgerKey = (ledger, index) =>
      ledger?.voucherLedgerId != null
        ? String(ledger.voucherLedgerId)
        : String(
          ledger?.glVoucherLedgerId ?? ledger?.id ?? ledger?.indexValue ?? index
        );

    const getDetailKey = (row, index) =>
      row?.voucherOutstandingId != null
        ? String(row.voucherOutstandingId)
        : String(row?.id ?? row?.indexValue ?? index);

    const getManualDetailAlloc = (row) => ({
      hc: !!row?.__manualAllocHC,
      fc: !!row?.__manualAllocFC,
    });

    const makeSnapshot = (ledgerRows, balanceAmtHc, balanceAmtFc) =>
      JSON.stringify({
        balanceAmtHc: asStr2(balanceAmtHc),
        balanceAmtFc: asStr2(balanceAmtFc),
        ledgers: ledgerRows.map((ledger, ledgerIndex) => ({
          k: getLedgerKey(ledger, ledgerIndex),
          d: asStr2(ledger?.debitAmount),
          df: asStr2(ledger?.debitAmountFc),
          cr: asStr2(ledger?.creditAmount),
          crf: asStr2(ledger?.creditAmountFc),
          rows: (Array.isArray(ledger?.tblVoucherLedgerDetails)
            ? ledger.tblVoucherLedgerDetails
            : []
          ).map((row, rowIndex) => ({
            k: getDetailKey(row, rowIndex),
            c: !!row?.isChecked,
            pc: !!row?.ispreChecked,
            neg: !!row?.__isNegRow,
            mh: !!row?.__manualAllocHC,
            mf: !!row?.__manualAllocFC,
            ob: asStr2(row?.__origBalHC),
            obf: asStr2(row?.__origBalFC),
            d: asStr2(row?.debitAmount),
            df: asStr2(row?.debitAmountFc),
            cr: asStr2(row?.creditAmount),
            crf: asStr2(row?.creditAmountFc),
            b: asStr2(row?.balanceAmount),
            bf: asStr2(row?.balanceAmountFc),
          })),
        })),
      });

    const hasLedgers =
      Array.isArray(newState?.tblVoucherLedger) &&
      newState.tblVoucherLedger.length > 0;

    const ledgers = hasLedgers
      ? [...newState.tblVoucherLedger]
      : [
        {
          __virtual: true,
          tblVoucherLedgerDetails: Array.isArray(
            newState?.tblVoucherLedgerDetails
          )
            ? newState.tblVoucherLedgerDetails
            : [],
        },
      ];

    const allDetails = ledgers.flatMap((l) =>
      Array.isArray(l?.tblVoucherLedgerDetails) ? l.tblVoucherLedgerDetails : []
    );

    if (!allDetails.length && !hasLedgers) {
      allocPrevRef.current = "";
      return;
    }

    const savedBalanceHC = round2(
      toNum(newState?.balanceAmtHc ?? newState?.balanceAmt ?? 0)
    );
    const savedBalanceFC = round2(
      toNum(newState?.balanceAmtFc ?? newState?.balanceAmtFC ?? 0)
    );

    const currentSnapshot = makeSnapshot(ledgers, savedBalanceHC, savedBalanceFC);

    if (allocInternalUpdateRef.current) {
      if (currentSnapshot === allocPrevRef.current) {
        allocInternalUpdateRef.current = false;
        return;
      }
      allocInternalUpdateRef.current = false;
    }

    // On first edit-page hydration, trust loaded DB balance and do not recalculate.
    if (shouldPreserveLoadedBalance && allocHydrateRef.current) {
      allocHydrateRef.current = false;
      allocPrevRef.current = currentSnapshot;
      return;
    }

    const baseBalanceHC = round2(
      toNum(newState?.amtRec ?? 0) +
      toNum(newState?.bcAmt ?? newState?.bankCharges ?? 0)
    );

    const baseBalanceFC = round2(
      toNum(newState?.amtRecFC ?? 0) +
      toNum(newState?.bcAmtFC ?? newState?.bankCharges ?? 0)
    );

    let remainingHC = baseBalanceHC;
    let remainingFC = baseBalanceFC;

    const nextLedgers = ledgers.map((ledger) => {
      const details = Array.isArray(ledger?.tblVoucherLedgerDetails)
        ? ledger.tblVoucherLedgerDetails
        : [];

      if (!details.length) {
        const manualHC = stateToLogic(ledger?.debitAmount, ledger?.creditAmount);
        const manualFC = stateToLogic(
          ledger?.debitAmountFc,
          ledger?.creditAmountFc
        );

        remainingHC = round2(remainingHC - manualHC.credit + manualHC.debit);
        remainingFC = round2(remainingFC - manualFC.credit + manualFC.debit);

        return {
          ...ledger,
          isChildChecked: false,
        };
      }

      let isChildChecked = false;

      const nextDetails = details.map((row) => {
        const isPreChecked = !!row?.ispreChecked;
        const isChecked = !!row?.isChecked;
        const shouldFreezePreCheckedRow = isPreChecked && isChecked;

        if (shouldFreezePreCheckedRow) {
          isChildChecked = true;

          const origBalHC = getRowOrigBalHC(row);
          const origBalFC = getRowOrigBalFC(row);

          return {
            ...row,
            __isNegRow: origBalHC < 0 || origBalFC < 0,
            __origBalHC: origBalHC,
            __origBalFC: origBalFC,
          };
        }

        if (isChecked) {
          isChildChecked = true;
        }

        const origBalHC = getRowOrigBalHC(row);
        const origBalFC = getRowOrigBalFC(row);
        const isNegativeRow = origBalHC < 0 || origBalFC < 0;

        if (!isChecked) {
          return {
            ...row,
            ispreChecked: false,
            __isNegRow: isNegativeRow,
            __origBalHC: origBalHC,
            __origBalFC: origBalFC,
            __manualAllocHC: false,
            __manualAllocFC: false,
            debitAmount: "0.00",
            debitAmountFc: "0.00",
            creditAmount: "0.00",
            creditAmountFc: "0.00",
            balanceAmount: asNum2(origBalHC),
            balanceAmountFc: asNum2(origBalFC),
          };
        }

        const manualAlloc = getManualDetailAlloc(row);
        const manualAllocHC = manualAlloc.hc;
        const manualAllocFC = manualAlloc.fc;

        return {
          ...row,
          ispreChecked: false,
          __isNegRow: isNegativeRow,
          __origBalHC: origBalHC,
          __origBalFC: origBalFC,
          __manualAllocHC: manualAllocHC,
          __manualAllocFC: manualAllocFC,
          debitAmount: manualAllocHC ? row?.debitAmount ?? "0.00" : "0.00",
          debitAmountFc: manualAllocFC ? row?.debitAmountFc ?? "0.00" : "0.00",
          creditAmount: manualAllocHC ? row?.creditAmount ?? "0.00" : "0.00",
          creditAmountFc: manualAllocFC ? row?.creditAmountFc ?? "0.00" : "0.00",
          balanceAmount: asNum2(origBalHC),
          balanceAmountFc: asNum2(origBalFC),
        };
      });

      // Apply already-saved rows first
      nextDetails.forEach((row) => {
        if (!row?.ispreChecked || !row?.isChecked) return;

        const rowHC = stateToLogic(row?.debitAmount, row?.creditAmount);
        const rowFC = stateToLogic(row?.debitAmountFc, row?.creditAmountFc);

        remainingHC = round2(remainingHC - rowHC.credit + rowHC.debit);
        remainingFC = round2(remainingFC - rowFC.credit + rowFC.debit);
      });

      // Apply new/manual rows, preserving manual HC/FC entries when present.
      nextDetails.forEach((row) => {
        if (!row?.isChecked || row?.ispreChecked) return;

        const origBalHC = round2(toNum(row?.__origBalHC));
        const origBalFC = round2(toNum(row?.__origBalFC));
        const manualAlloc = getManualDetailAlloc(row);

        let logicalDebitHC = 0;
        let logicalDebitFC = 0;
        let logicalCreditHC = 0;
        let logicalCreditFC = 0;
        let balanceHC = origBalHC;
        let balanceFC = origBalFC;

        if (manualAlloc.hc) {
          const manualHC = stateToLogic(row?.debitAmount, row?.creditAmount);
          logicalDebitHC = clamp0(manualHC.debit);
          logicalCreditHC = clamp0(manualHC.credit);
          balanceHC = round2(origBalHC - logicalCreditHC + logicalDebitHC);
          remainingHC = round2(remainingHC - logicalCreditHC + logicalDebitHC);
        } else if (origBalHC < 0) {
          logicalDebitHC = round2(Math.abs(origBalHC));
          balanceHC = 0;
          remainingHC = round2(remainingHC + logicalDebitHC);
        } else if (origBalHC > 0) {
          logicalCreditHC = clamp0(Math.min(remainingHC, origBalHC));
          balanceHC = round2(origBalHC - logicalCreditHC);
          remainingHC = round2(remainingHC - logicalCreditHC);
        } else {
          balanceHC = 0;
        }

        if (manualAlloc.fc) {
          const manualFC = stateToLogic(
            row?.debitAmountFc,
            row?.creditAmountFc
          );
          logicalDebitFC = clamp0(manualFC.debit);
          logicalCreditFC = clamp0(manualFC.credit);
          balanceFC = round2(origBalFC - logicalCreditFC + logicalDebitFC);
          remainingFC = round2(remainingFC - logicalCreditFC + logicalDebitFC);
        } else if (origBalFC < 0) {
          logicalDebitFC = round2(Math.abs(origBalFC));
          balanceFC = 0;
          remainingFC = round2(remainingFC + logicalDebitFC);
        } else if (origBalFC > 0) {
          logicalCreditFC = clamp0(Math.min(remainingFC, origBalFC));
          balanceFC = round2(origBalFC - logicalCreditFC);
          remainingFC = round2(remainingFC - logicalCreditFC);
        } else {
          balanceFC = 0;
        }

        const hcState = logicToStateHC(logicalDebitHC, logicalCreditHC);
        const fcState = logicToStateFC(logicalDebitFC, logicalCreditFC);

        row.__manualAllocHC = manualAlloc.hc;
        row.__manualAllocFC = manualAlloc.fc;
        row.debitAmount = hcState.debitAmount;
        row.debitAmountFc = fcState.debitAmountFc;
        row.creditAmount = hcState.creditAmount;
        row.creditAmountFc = fcState.creditAmountFc;
        row.balanceAmount = asNum2(balanceHC);
        row.balanceAmountFc = asNum2(balanceFC);
      });

      const parentLogicHC = nextDetails.reduce(
        (acc, row) => {
          const x = stateToLogic(row?.debitAmount, row?.creditAmount);
          acc.debit += x.debit;
          acc.credit += x.credit;
          return acc;
        },
        { debit: 0, credit: 0 }
      );

      const parentLogicFC = nextDetails.reduce(
        (acc, row) => {
          const x = stateToLogic(row?.debitAmountFc, row?.creditAmountFc);
          acc.debit += x.debit;
          acc.credit += x.credit;
          return acc;
        },
        { debit: 0, credit: 0 }
      );

      const parentStateHC = logicToStateHC(
        round2(parentLogicHC.debit),
        round2(parentLogicHC.credit)
      );

      const parentStateFC = logicToStateFC(
        round2(parentLogicFC.debit),
        round2(parentLogicFC.credit)
      );

      const prevStateHC = {
        debitAmount:
          ledger?.debitAmount ?? asStr2(toNum(ledger?.debitAmount)),
        creditAmount:
          ledger?.creditAmount ?? asStr2(toNum(ledger?.creditAmount)),
      };

      const prevStateFC = {
        debitAmountFc:
          ledger?.debitAmountFc ?? asStr2(toNum(ledger?.debitAmountFc)),
        creditAmountFc:
          ledger?.creditAmountFc ?? asStr2(toNum(ledger?.creditAmountFc)),
      };

      const nextDebitHC = !isChildChecked
        ? prevStateHC.debitAmount
        : parentStateHC.debitAmount;

      const nextCreditHC = !isChildChecked
        ? prevStateHC.creditAmount
        : parentStateHC.creditAmount;

      const nextDebitFC = !isChildChecked
        ? prevStateFC.debitAmountFc
        : parentStateFC.debitAmountFc;

      const nextCreditFC = !isChildChecked
        ? prevStateFC.creditAmountFc
        : parentStateFC.creditAmountFc;

      if (!isChildChecked) {
        const nextLogicHC = stateToLogic(nextDebitHC, nextCreditHC);
        const nextLogicFC = stateToLogic(nextDebitFC, nextCreditFC);

        remainingHC = round2(
          remainingHC - nextLogicHC.credit + nextLogicHC.debit
        );
        remainingFC = round2(
          remainingFC - nextLogicFC.credit + nextLogicFC.debit
        );
      }

      return {
        ...ledger,
        isChildChecked,
        tblVoucherLedgerDetails: nextDetails,
        creditAmount: nextCreditHC,
        creditAmountFc: nextCreditFC,
        debitAmount: nextDebitHC,
        debitAmountFc: nextDebitFC,
      };
    });

    const nextBalanceAmtHc = asStr2(remainingHC);
    const nextBalanceAmtFc = asStr2(remainingFC);

    const nextSnapshot = makeSnapshot(
      nextLedgers,
      nextBalanceAmtHc,
      nextBalanceAmtFc
    );

    if (
      nextSnapshot === currentSnapshot ||
      allocPrevRef.current === nextSnapshot
    ) {
      allocPrevRef.current = nextSnapshot;
      return;
    }

    allocPrevRef.current = nextSnapshot;
    allocInternalUpdateRef.current = true;

    setNewState((prevState) => {
      const out = hasLedgers
        ? {
          ...prevState,
          tblVoucherLedger: nextLedgers.filter((l) => !l?.__virtual),
          balanceAmtHc: nextBalanceAmtHc,
          balanceAmtFc: nextBalanceAmtFc,
          balanceAmt: nextBalanceAmtHc,
          balanceAmtFC: nextBalanceAmtFc,
        }
        : {
          ...prevState,
          tblVoucherLedgerDetails:
            nextLedgers[0]?.tblVoucherLedgerDetails || [],
          balanceAmtHc: nextBalanceAmtHc,
          balanceAmtFc: nextBalanceAmtFc,
          balanceAmt: nextBalanceAmtHc,
          balanceAmtFC: nextBalanceAmtFc,
        };

      return out;
    });
    setSubmitNewState((prevState) => {
      if (hasLedgers) {
        return {
          ...prevState,
          tblVoucherLedger: nextLedgers.filter((l) => !l?.__virtual),
          balanceAmtHc: nextBalanceAmtHc,
          balanceAmtFc: nextBalanceAmtFc,
          balanceAmt: nextBalanceAmtHc,
          balanceAmtFC: nextBalanceAmtFc,
        };
      }

      return {
        ...prevState,
        tblVoucherLedgerDetails:
          nextLedgers[0]?.tblVoucherLedgerDetails || [],
        balanceAmtHc: nextBalanceAmtHc,
        balanceAmtFc: nextBalanceAmtFc,
        balanceAmt: nextBalanceAmtHc,
        balanceAmtFC: nextBalanceAmtFc,
      };
    });
  }, [
    newState?.voucherTypeId,
    newState?.amtRec,
    newState?.amtRecFC,
    newState?.bankCharges,
    newState?.bcAmt,
    newState?.bcAmtFC,
    JSON.stringify(newState?.tblVoucherLedger),
    JSON.stringify(newState?.tblVoucherLedgerDetails),
  ]);

  async function fetchDataDymaic() {
    const { clientId, companyId, branchId, financialYear, userId } =
      getUserDetails();

    try {
      const tableViewApiResponse = await formControlMenuList(search.menuName);
      if (!tableViewApiResponse?.success) return;

      const menuConfig = tableViewApiResponse.data[0] || {};
      const rawFields = Array.isArray(menuConfig.fields) ? menuConfig.fields : [];

      const apiResponse = await fetchVoucherDataDynamic({
        clientID: parseInt(clientId),
        recordID: parseInt(search.id),
        menuID: parseInt(search.menuName),
        companyId: companyId,
        companyBranchId: branchId,
        financialYearId: financialYear,
        userId: userId,
      });

      if (!apiResponse?.data?.[0]) return;

      let data = apiResponse.data[0];
      let finalData = {};

      if (search.isCopy) {
        data.id = "";

        rawFields.forEach((iterator) => {
          if (iterator.isCopy) {
            finalData[iterator.fieldname] = data[iterator.fieldname];
          }
        });

        (menuConfig.child || []).forEach((child) => {
          if (child.isChildCopy) {
            finalData[child.tableName] = data[child.tableName];
          }
        });
      } else {
        finalData = data;
      }

      for (let item of menuConfig.child || []) {
        for (
          let index = 0;
          index < (finalData[item.tableName] || []).length;
          index++
        ) {
          finalData[item.tableName][index].indexValue = index;

          for (const subchildItem of item.subChild || []) {
            for (
              let idx = 0;
              idx < (finalData[item.tableName][index][subchildItem.tableName] || [])
                .length;
              idx++
            ) {
              finalData[item.tableName][index][subchildItem.tableName][idx].indexValue =
                idx;
            }
          }
        }
      }

      const parseIdList = (raw) =>
        String(raw || "")
          .split(",")
          .map((v) => Number(String(v).trim()))
          .filter((n) => !Number.isNaN(n));

      const isShowValue = (value) => {
        if (value === true || value === 1 || value === "1") return true;
        if (value === false || value === 0 || value === "0") return false;

        if (typeof value === "string") {
          const v = value.trim().toLowerCase();
          if (
            v === "" ||
            v === "false" ||
            v === "n" ||
            v === "no" ||
            v === "null" ||
            v === "undefined"
          ) {
            return false;
          }
          return true;
        }

        if (Array.isArray(value)) return value.length > 0;
        if (value && typeof value === "object") return Object.keys(value).length > 0;

        return value !== null && value !== undefined;
      };

      const showTds =
        finalData?.tdsApplicable === true ||
        finalData?.tdsApplicable === "true" ||
        finalData?.tdsApplicable === 1 ||
        finalData?.tdsApplicable === "1";

      const hiddenByDefault = new Set();

      rawFields.forEach((field) => {
        if (field?.isColumnVisible === false) {
          hiddenByDefault.add(Number(field.id));
        }

        if (
          typeof field?.columnsToHide === "string" &&
          field.columnsToHide.trim() !== ""
        ) {
          parseIdList(field.columnsToHide).forEach((id) => hiddenByDefault.add(id));
        }
      });

      const showIds = new Set();

      rawFields.forEach((field) => {
        if (
          field?.isColumnVisible &&
          typeof field?.columnsToHide === "string" &&
          field.columnsToHide.trim() !== ""
        ) {
          const currentVal = finalData?.[field.fieldname];
          if (isShowValue(currentVal)) {
            parseIdList(field.columnsToHide).forEach((id) => showIds.add(id));
          }
        }
      });

      const preparedFields = rawFields.map((field) => {
        const id = Number(field.id);
        let visible = !hiddenByDefault.has(id);

        if (showIds.has(id)) {
          visible = true;
        }

        if (field.fieldname === "tdsAmt" || field.fieldname === "tdsAmtFC") {
          visible = showTds;
        }

        return {
          ...field,
          columnsToBeVisible: visible,
        };
      });

      const tempActionFields = [];

      preparedFields.forEach((control) => {
        if (control?.isColumnVisible && control?.columnsToHide) {
          tempActionFields.push({
            parentFieldName: control.fieldname,
            sectionHeader: control.sectionHeader,
            columnsToHide: control.columnsToHide,
          });
        }

        if (control?.isColumnDisabled && control?.columnsToDisabled) {
          tempActionFields.push({
            parentFieldName: control.fieldname,
            sectionHeader: control.sectionHeader,
            columnsToDisabled: control.columnsToDisabled,
          });
        }
      });

      const seen = new Set();
      const mergedActionFields = tempActionFields.filter((item) => {
        const key = [
          item.parentFieldName || "",
          item.sectionHeader || "",
          item.columnsToHide || "",
          item.columnsToDisabled || "",
        ].join("|");

        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      });

      const rawChildConfig = menuConfig.child || menuConfig.children || [];

      const preparedChildConfig = rawChildConfig.map((child) => {
        if (child.tableName !== "tblVoucherLedger") return child;

        return {
          ...child,
          fields: (child.fields || []).map((field) => {
            if (field.fieldname === "tdsAmtFC" || field.fieldname === "tdsAmtHC") {
              return {
                ...field,
                columnsToBeVisible: showTds,
              };
            }
            return field;
          }),
        };
      });

      const groupAllFieldsData = groupAndSortAllFields(preparedFields);
      const resData = groupAndSortFields(preparedFields);

      setFetchedApiResponse(menuConfig);
      setTableName(menuConfig.tableName);
      setIsRequiredAttachment(menuConfig?.isRequiredAttachment);

      setParentFieldDataInArray(preparedFields);
      setActionFieldNames(mergedActionFields);

      setFormControlData({
        ...menuConfig,
        fields: preparedFields,
      });

      setParentsFields(groupAllFieldsData);
      setTopParentsFields(resData.top || {});
      setBottomParentsFields(resData.bottom || {});

      setOriginalChildsFields(rawChildConfig);
      setChildsFields(preparedChildConfig);
      setButtonsData(menuConfig.buttons || []);

      // IMPORTANT: keep edit-page loaded balances as source of truth on first render
      allocHydrateRef.current = true;
      allocPrevRef.current = "";

      setNewState((prev) => ({
        ...prev,
        ...finalData,
        balanceAmtHc: finalData?.balanceAmtHc ?? finalData?.balanceAmt ?? 0,
        balanceAmtFc: finalData?.balanceAmtFc ?? finalData?.balanceAmtFC ?? 0,
        balanceAmt: finalData?.balanceAmt ?? finalData?.balanceAmtHc ?? 0,
        balanceAmtFC: finalData?.balanceAmtFC ?? finalData?.balanceAmtFc ?? 0,
        tableName: menuConfig.tableName,
        attachment: data.attachment,
        menuID: search.menuName,
      }));

      setSubmitNewState((prev) => ({
        ...prev,
        ...finalData,
        balanceAmtHc: finalData?.balanceAmtHc ?? finalData?.balanceAmt ?? 0,
        balanceAmtFc: finalData?.balanceAmtFc ?? finalData?.balanceAmtFC ?? 0,
        balanceAmt: finalData?.balanceAmt ?? finalData?.balanceAmtHc ?? 0,
        balanceAmtFC: finalData?.balanceAmtFC ?? finalData?.balanceAmtFc ?? 0,
        tableName: menuConfig.tableName,
        attachment: data.attachment,
        menuID: search.menuName,
      }));

      setInitialState((prev) => ({
        ...prev,
        ...finalData,
        balanceAmtHc: finalData?.balanceAmtHc ?? finalData?.balanceAmt ?? 0,
        balanceAmtFc: finalData?.balanceAmtFc ?? finalData?.balanceAmtFC ?? 0,
        balanceAmt: finalData?.balanceAmt ?? finalData?.balanceAmtHc ?? 0,
        balanceAmtFC: finalData?.balanceAmtFC ?? finalData?.balanceAmtFc ?? 0,
        tableName: menuConfig.tableName,
      }));

      setTimeout(() => {
        setIsDataLoaded(true);
      }, 500);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  }
  useEffect(() => {
    fetchDataDymaic();
  }, []);
  useEffect(() => {
    if (!Array.isArray(parentFieldDataInArray) || parentFieldDataInArray.length === 0) return;
    rebuildParentSections(parentFieldDataInArray);
  }, [parentFieldDataInArray]);

  useEffect(() => {
    const changedFieldNames = Object.keys(newState || {}).filter((field) => {
      return (
        prevVisibleRef.current[field] !== newState[field] &&
        isShowValue(newState[field])
      );
    });

    prevVisibleRef.current = { ...newState };

    if (!changedFieldNames.length || !actionFieldNames.length) return;

    const matchedRecords = actionFieldNames.filter((record) =>
      changedFieldNames.includes(record.parentFieldName)
    );

    if (!matchedRecords.length) return;

    const visibleIds = [];
    const enableIds = [];

    matchedRecords.forEach((record) => {
      if (record?.columnsToHide) {
        visibleIds.push(...parseIdList(record.columnsToHide));
      }

      if (record?.columnsToDisabled) {
        enableIds.push(...parseIdList(record.columnsToDisabled));
      }
    });

    updateParentFieldMeta({
      visibleIds,
      enableIds,
    });
  }, [newState, actionFieldNames]);

  useEffect(() => {
    const changedFieldNames = Object.keys(newState || {}).filter((field) => {
      return (
        prevHiddenRef.current[field] !== newState[field] &&
        isHideValue(newState[field])
      );
    });

    prevHiddenRef.current = { ...newState };

    if (!changedFieldNames.length || !actionFieldNames.length) return;

    const matchedRecords = actionFieldNames.filter((record) =>
      changedFieldNames.includes(record.parentFieldName)
    );

    if (!matchedRecords.length) return;

    const hiddenIds = [];
    const disableIds = [];

    matchedRecords.forEach((record) => {
      if (record?.columnsToHide) {
        hiddenIds.push(...parseIdList(record.columnsToHide));
      }

      if (record?.columnsToDisabled) {
        disableIds.push(...parseIdList(record.columnsToDisabled));
      }
    });

    updateParentFieldMeta({
      hiddenIds,
      disableIds,
    });

    const targetFieldNames = parentFieldDataInArray
      .filter((field) => {
        const id = Number(field.id);
        return hiddenIds.includes(id) || disableIds.includes(id);
      })
      .map((field) => field.fieldname);

    clearDependentValues(targetFieldNames);
  }, [newState, actionFieldNames, parentFieldDataInArray]);

  useEffect(() => {
    const showTds =
      newState?.tdsApplicable === true ||
      newState?.tdsApplicable === "true" ||
      newState?.tdsApplicable === 1 ||
      newState?.tdsApplicable === "1";

    setParentFieldDataInArray((prev) => {
      if (!Array.isArray(prev) || prev.length === 0) return prev;

      let changed = false;

      const updated = prev.map((field) => {
        if (field.fieldname === "tdsAmt" || field.fieldname === "tdsAmtFC") {
          if (field.columnsToBeVisible !== showTds) {
            changed = true;
            return {
              ...field,
              columnsToBeVisible: showTds,
            };
          }
        }
        return field;
      });

      return changed ? updated : prev;
    });

    if (!showTds) {
      setNewState((prev) => ({
        ...prev,
        tdsAmt: 0,
        tdsAmtFC: 0,
      }));

      setSubmitNewState((prev) => ({
        ...prev,
        tdsAmt: 0,
        tdsAmtFC: 0,
      }));
    }
  }, [newState?.tdsApplicable]);

  useEffect(() => {
    if (!Array.isArray(originalChildsFields) || originalChildsFields.length === 0) return;

    const showTds =
      newState?.tdsApplicable === true ||
      newState?.tdsApplicable === "true" ||
      newState?.tdsApplicable === 1 ||
      newState?.tdsApplicable === "1";

    const updatedChilds = originalChildsFields.map((child) => {
      if (child.tableName !== "tblVoucherLedger") return child;

      return {
        ...child,
        fields: (child.fields || []).map((field) => {
          if (field.fieldname === "tdsAmtFC" || field.fieldname === "tdsAmtHC") {
            return {
              ...field,
              columnsToBeVisible: showTds,
            };
          }
          return field;
        }),
      };
    });

    setChildsFields(updatedChilds);

    if (!showTds) {
      setNewState((prev) => ({
        ...prev,
        tblVoucherLedger: Array.isArray(prev.tblVoucherLedger)
          ? prev.tblVoucherLedger.map((row) => ({
            ...row,
            tdsAmtFC: 0,
            tdsAmtHC: 0,
          }))
          : prev.tblVoucherLedger,
      }));

      setSubmitNewState((prev) => ({
        ...prev,
        tblVoucherLedger: Array.isArray(prev.tblVoucherLedger)
          ? prev.tblVoucherLedger.map((row) => ({
            ...row,
            tdsAmtFC: 0,
            tdsAmtHC: 0,
          }))
          : prev.tblVoucherLedger,
      }));
    }
  }, [newState?.tdsApplicable, originalChildsFields]);


  Object.keys(topParentsFields || {}).forEach((section) => {
    topParentsFields[section]?.forEach((field) => {
      const keyMapping = keysTovalidate.find(
        (key) => key?.toColmunName === field?.fieldname,
      );

      if (keyMapping) {
        field.isChild = keyMapping?.isChild;
        field.isOnChange = keyMapping?.isOnChage;
        field.isEditable = keyMapping?.isEditable;
        field.isCopy = keyMapping?.isCopy;
        field.isCopyEditable = keyMapping?.isCopyEditable;
        field.isSwitchToText = keyMapping?.isSwitchToText;
        field.isBreak = keyMapping?.isBreak;
      }
    });
  });

  Object.keys(bottomParentsFields || {}).forEach((section) => {
    bottomParentsFields[section]?.forEach((field) => {
      const keyMapping = keysTovalidate.find(
        (key) => key?.toColmunName === field?.fieldname,
      );

      if (keyMapping) {
        field.isChild = keyMapping?.isChild;
        field.isOnChange = keyMapping?.isOnChage;
        field.isEditable = keyMapping?.isEditable;
        field.isCopy = keyMapping?.isCopy;
        field.isCopyEditable = keyMapping?.isCopyEditable;
        field.isSwitchToText = keyMapping?.isSwitchToText;
        field.isBreak = keyMapping?.isBreak;
      }
    });
  });

  return (
    <div className={`h-screen relative`}>
      <form onSubmit={handleButtonClick.handleSubmit}>
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
          style={{ height: "calc(100vh - 24vh)" }}
        >
          {/* Parents Accordian */}
          {Object.keys(topParentsFields).map((section, index) => (
            <React.Fragment key={index}>
              {topParentsFields[section]?.length > 0 && (
                <ParentAccordianComponent
                  section={section}
                  indexValue={index}
                  newState={newState}
                  setNewState={setNewState}
                  parentsFields={topParentsFields}
                  expandAll={expandAll}
                  isCopy={search.isCopy}
                  isView={isView}
                  handleFieldValuesChange2={handleFieldValuesChange2}
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
                  getLabelValue={getLabelValue}
                />
              )}
            </React.Fragment>
          ))}
          {/* childs Accordion */}
          {childsFields.map((section, index) => (
            <div key={index} className="w-full">
              <ChildAccordianComponent
                section={section}
                key={index}
                newState={newState}
                setNewState={setNewState}
                handleFieldValuesChange2={handleFieldValuesChange2}
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
              />
            </div>
          ))}

          {Object.keys(bottomParentsFields).map((section, index) => (
            <React.Fragment key={index}>
              {bottomParentsFields[section]?.length > 0 && (
                <ParentAccordianComponent
                  section={section}
                  indexValue={index}
                  newState={newState}
                  setNewState={setNewState}
                  parentsFields={bottomParentsFields}
                  expandAll={expandAll}
                  isCopy={search.isCopy}
                  isView={isView}
                  handleFieldValuesChange2={handleFieldValuesChange2}
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
                  getLabelValue={getLabelValue}
                />
              )}
            </React.Fragment>
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
      {openPrintModal && (
        <PrintModal
          setOpenPrintModal={setOpenPrintModal}
          submittedRecordId={submittedRecordId}
          openPrintModal={openPrintModal}
          submittedMenuId={submittedMenuId}
          pageType={"Forms"}
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
  handleFieldValuesChange2: PropTypes.any,
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
  handleFieldValuesChange2,
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
    if (result.isCheck === false) {
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
    let data = { ...result.newState };
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
    if (result.isCheck === false) {
      if (result.alertShow) {
        setParaText(result.message);
        setIsError(true);
        setOpenModal((prev) => !prev);
        setTypeofModal("onCheck");
      }
      return;
    }
    // let data = { ...result.values };
    let data = { ...result.newState };
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
            newState={newState}
            onValuesChange={handleFieldValuesChange}
            handleFieldValuesChange2={handleFieldValuesChange2}
            inEditMode={{ isEditMode: false, isCopy: true }}
            onChangeHandler={(result) => {
              handleChangeFunction(result);
            }}
            onBlurHandler={(result) => {
              handleBlurFunction(result);
            }}
            isView={isView}
            clearFlag={clearFlag}
            tableName={parentTableName}
            formControlData={formControlData}
            setFormControlData={setFormControlData}
            setStateVariable={setNewState}
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
  handleFieldValuesChange2: PropTypes.any,
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
  getLabelValue: PropTypes.any,
};

function ChildAccordianComponent({
  section,
  indexValue,
  newState,
  setNewState,
  expandAll,
  isCopy,
  isView,
  handleFieldValuesChange2,
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
}) {
  const [clickCount, setClickCount] = useState(0);
  const [isChildAccordionOpen, setIschildAccordionOpen] = useState(false);
  const [childObject, setChildObject] = useState({});
  const [renderedData, setRenderedData] = useState([]);
  const tableRef = useRef(null);
  const [isInputVisible, setInputVisible] = useState(false);
  const [activeColumn, setActiveColumn] = useState(null);
  const [prevSearchInput, setPrevSearchInput] = useState("");
  const [isAscending, setIsAscending] = useState(true);
  const [sortedColumn, setSortedColumn] = useState(null);
  const [dummyData, setDummyData] = useState([]);
  const [calculateData, setCalculateData] = useState(0);
  const [dummyFieldArray, setDummyFieldArray] = useState([]);
  const [isGridEdit, setIsGridEdit] = useState(false);
  const [copyChildValueObj, setCopyChildValueObj] = useState([]);
  const [columnTotals, setColumnTotals] = useState({ tableName: "" });
  const [containerWidth, setContainerWidth] = useState(0);
  const [inputFieldsVisible, setInputFieldsVisible] = useState(
    newState[section.tableName] !== null ? false : true,
  );

  const [tableBodyWidth, setTableBodyWidth] = useState("0px");
  const isChildAddHidden = isConfigFlagEnabled(section?.isAddHide);
  const isChildDeleteHidden = isConfigFlagEnabled(section?.isDeleteHide);


  const handleFieldChildrenValuesChange = (updatedValues) => {
    setChildObject((prevObject) => ({ ...prevObject, ...updatedValues }));
  };

  const childButtonHandler = async (section, indexValue, islastTab) => {
    if (isConfigFlagEnabled(section?.isAddHide)) return;
    console.log("childButtonHandler", section);
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
            feild.fieldname,
          ) ||
            childObject[feild.fieldname]?.trim() === "")
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
              setChildObject,
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
          console.log("childButtonHandler", Data);

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

  const lockExchangeRateFirstWins = () => {
    if (!newState || !Array.isArray(newState.tblInvoiceCharge)) {
      return newState;
    }

    const toNum = (v) => {
      const n = Number(v);
      return Number.isFinite(n) ? n : 0;
    };

    const getCurrencyId = (row) =>
      row?.currencyId ?? row?.currencyIddropdown?.[0]?.value ?? null;

    // Pass 1: capture the FIRST non-zero rate and its FIRST index per currency
    const firstRateByCurrency = {};
    const firstIndexByCurrency = {};

    newState.tblInvoiceCharge.forEach((row, idx) => {
      const cId = getCurrencyId(row);
      const rate = toNum(row?.exchangeRate);
      if (cId != null && rate > 0 && firstRateByCurrency[cId] == null) {
        firstRateByCurrency[cId] = rate; // lock the first non-zero rate
        firstIndexByCurrency[cId] = idx; // remember first row index for that currency
      }
    });

    // Nothing to do if we didn't find any non-zero rates
    if (Object.keys(firstRateByCurrency).length === 0) {
      return newState;
    }

    // Pass 2: enforce the locked rate on ALL subsequent rows of the same currency
    setNewState((prev) => {
      const rows = Array.isArray(prev.tblInvoiceCharge)
        ? prev.tblInvoiceCharge
        : [];

      const updated = rows.map((row, idx) => {
        const cId = getCurrencyId(row);
        if (cId == null) return row;

        const locked = firstRateByCurrency[cId];
        const firstIdx = firstIndexByCurrency[cId];

        if (locked > 0 && idx !== firstIdx) {
          return { ...row, exchangeRate: locked };
        }
        return row;
      });

      return { ...prev, tblInvoiceCharge: updated };
    });
  };
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
      const isAtBottom = scrollTop + clientHeight >= scrollHeight - 2;
      if (isAtBottom) {
        renderMoreData();
      }
    }
  };

  const calculateTotalForRow = (rowData) => {
    section.fields.forEach((item) => {
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

  useEffect(() => {
    setRenderedData(newState[section.tableName]?.slice(0, 10)); // Initially render 10 items
    setDummyData(newState[section.tableName]?.slice(0, 10));
    calculateTotalForRow(newState[section.tableName]);
  }, [newState]);

  const renderMoreData = () => {
    // Calculate the index range to render
    const lastIndex = renderedData.length + 10;
    const newData = newState[section.tableName]?.slice(
      renderedData.length,
      lastIndex,
    );
    setRenderedData((prevData) => [...prevData, ...newData]);
    setDummyData((prevData) => [...prevData, ...newData]);
  };

  const deleteChildRecord = (index) => {
    if (isChildDeleteHidden) return;
    setNewState((prevState) => {
      const newStateCopy = { ...prevState };
      const updatedData = newStateCopy[section.tableName].filter(
        (_, idx) => idx !== index,
      );
      newStateCopy[section.tableName] = updatedData;
      if (updatedData.length === 0) {
        setInputFieldsVisible((prev) => !prev);
      }
      return newStateCopy;
    });
    setSubmitNewState((prevState) => {
      const newStateCopy = { ...prevState };
      const updatedData = newStateCopy[section.tableName].filter(
        (_, idx) => idx !== index,
      );
      newStateCopy[section.tableName] = updatedData;
      if (updatedData.length === 0) {
        setInputFieldsVisible((prev) => !prev);
      }
      return newStateCopy;
    });
  };

  // eslint-disable-next-line no-unused-vars
  const removeChildRecordFromInsert = (id, index) => {
    setSubmitNewState((prevState) => {
      const newStateCopy = { ...prevState };
      // Assume each entry in the array has an 'id' property
      // const updatedData = newStateCopy[section.tableName].filter(
      //   (item) => item._id !== id
      // );
      let updatedData = newStateCopy[section.tableName].filter(
        (_, idx) => idx === index,
      );
      updatedData = { ...updatedData[0], isChecked: false };
      newStateCopy[section.tableName][index] = updatedData;
      return newStateCopy;
    });
    setNewState((prevState) => {
      const newStateCopy = { ...prevState };
      // Assume each entry in the array has an 'id' property
      // const updatedData = newStateCopy[section.tableName].filter(
      //   (item) => item._id !== id
      // );
      let updatedData = newStateCopy[section.tableName].filter(
        (_, idx) => idx === index,
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
  };
  function CustomizedInputBase({
    columnData,
    setPrevSearchInput,
    prevSearchInput,
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
        const columnValue = String(item[columnKey]).toLowerCase();

        return columnValue.includes(lowercasedInput);
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
    if (isGridEdit) {
      toast.warn("Please save the changes before editing");
      return;
    }
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
    const objectsToValidate = copyChildValueObj[tableName][0]; // array of objects

    for (const field of section.fields) {
      // Loop through the fields that need validation
      let isFieldValid = false; // Track if the current field is valid

      for (const object of objectsToValidate) {
        // Loop through each object in your array
        if (field.isRequired) {
          // Check if the field exists in the object and it is not empty
          // console.log(object[field.fieldname]);
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
        toast.error(`Value for${field.yourlabel} is missing or empty.`);
        return; // Exit the function if a validation fails
      }
    }
    setNewState((prev) => {
      return {
        ...prev,
        [tableName]: copyChildValueObj[tableName]?.[0],
      };
    });
    setSubmitNewState((prev) => {
      return {
        ...prev,
        [tableName]: copyChildValueObj[tableName]?.[0],
      };
    });
    setIsGridEdit(!isGridEdit);
    setCopyChildValueObj([]);
  }
  function gridEditCloseFunction() {
    setCopyChildValueObj([]);
    setIsGridEdit(!isGridEdit);
  }

  function handleChangeFunction(result) {
    if (result.isCheck === false) {
      if (result.alertShow) {
        setParaText(result.message);
        setIsError(true);
        setOpenModal((prev) => !prev);
        setTypeofModal("onCheck");
      }
      return;
    }
    let data = { ...result?.values };
    // let data = { ...result.newState };
    setChildObject((pre) => {
      return {
        ...pre,
        ...data,
      };
    });
  }
  function handleBlurFunction(result) {
    if (result.isCheck === false) {
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
      return "tableRef.current is not available";
    }
  };

  async function onLoadFunctionCall(
    functionData,
    formControlData,
    setFormControlData,
    setStateVariable,
    values,
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
            childObject,
          );
        });
      }
    }
  }, [inputFieldsVisible]);



  useEffect(() => {
    const resizeObserver = new ResizeObserver((entries) => {
      if (entries && entries[0]) {
        const width = Math.floor(entries[0].contentRect.width);
        setContainerWidth(width);
      }
    });

    if (tableRef.current) {
      resizeObserver.observe(tableRef.current);
    }

    return () => {
      resizeObserver.disconnect();
    };
  }, [tableRef.current]);

  useEffect(() => {
    const horiScroll = () => {
      const right = Math.round(
        Math.floor(
          tableRef.current?.getBoundingClientRect()?.width +
          tableRef.current?.scrollLeft
        )
      );
      if (tableRef.current?.scrollWidth > tableRef.current?.clientWidth) {
        setTableBodyWidth(`${right - 100}`);
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
                <LightTooltip title="Save ">
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
              {!isView && !isChildAddHidden && clickCount === 0 && (
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
            {!isChildAddHidden && inputFieldsVisible && (
              <div
                className={`relative flex  justify-between pl-[16px] py-[8px] `}
              >
                <CustomeInputFields
                  inputFieldData={section.fields}
                  onValuesChange={handleFieldChildrenValuesChange}
                  handleFieldValuesChange2={handleFieldValuesChange2}
                  values={childObject}
                  inEditMode={{ isEditMode: false, isCopy: true }}
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
                  }}
                />
                <div className=" md:ml-20 relative top-0 right-2 flex justify-end items-baseline lg:md-10">
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
                    title={"Save 22"}
                    onClick={() => {
                      childButtonHandler(section, indexValue);
                      lockExchangeRateFirstWins();
                    }}
                  />
                </div>
              </div>
            )}

            {/* <div className="flex justify-end">
              <div className="flex items-center justify-end mt-2 mr-2">
                {dummyFieldArray?.length > 0 && clickCount > 0 && (
                  <>
                    {dummyFieldArray.map((item, index) => (
                      <Typography variant="h5" key={index}>
                        {Object.entries(item).map(([key, value]) => (
                          <span key={key}>
                            {key}: {value},{" "}
                          </span>
                        ))}
                      </Typography>
                    ))}
                  </>
                )}
              </div>
            </div> */}

            {newState[section.tableName] &&
              newState[section.tableName]?.length > 0 && (
                <>
                  {/* Table grid view Section at bottom*/}
                  <div key={indexValue} className={`  `}>
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
                            ? "280px" //updated the hight from 290 to 280
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
                        className={`bg-[var(--commonBg)]`}
                      >
                        <TableHead>
                          <TableRow>
                            {section.fields
                              .filter((elem) => elem.isGridView)
                              .map((field, index) => (
                                <React.Fragment key={index}>
                                  {(section?.showSrNo === true ||
                                    section?.showSrNo === "true") &&
                                    index === 0 && (
                                      <TableCell
                                        className={`${styles.cellHeading} cursor-pointer ${styles.tableChildHeader} `}
                                        align="left"
                                        sx={{
                                          ...childTableHeaderStyle,
                                          paddingLeft: "12px",
                                          width: "64px",
                                          minWidth: "64px",
                                        }}
                                      >
                                        {!isView && !isChildAddHidden && (
                                          <HoverIcon
                                            defaultIcon={addLogo}
                                            hoverIcon={plusIconHover}
                                            disabled={
                                              typeof section.isAddFunctionality !==
                                                "undefined"
                                                ? !section.isAddFunctionality
                                                : false
                                            }
                                            altText={"Add"}
                                            title={"Add"}
                                            onClick={() => {
                                              inputFieldsVisible == false &&
                                                setInputFieldsVisible(
                                                  (prev) => !prev,
                                                );
                                            }}
                                          />
                                        )}
                                        <span className={`${styles.labelText}`}>
                                          Sr No.
                                        </span>
                                      </TableCell>
                                    )}
                                  <TableCell
                                    className={`${styles.cellHeading} cursor-pointer ${styles.tableChildHeader} `}
                                    align="left"
                                    sx={{
                                      ...childTableHeaderStyle,
                                      paddingLeft:
                                        section?.showSrNo === true ||
                                          section?.showSrNo === "true"
                                          ? "29px !important"
                                          : isView && index === 0
                                            ? "29px"
                                            : "0px !important",
                                    }}
                                    onContextMenu={(event) =>
                                      handleRightClick(
                                        event,
                                        field.fieldname,
                                        section,
                                        section.fields,
                                      )
                                    } // Add the right-click handler here
                                  >
                                    {!isView &&
                                      !isChildAddHidden &&
                                      index === 0 &&
                                      !(section?.showSrNo == true ||
                                        section?.showSrNo == "true") && (
                                        <HoverIcon
                                          defaultIcon={addLogo}
                                          hoverIcon={plusIconHover}
                                          disabled={
                                            typeof section.isAddFunctionality !==
                                              "undefined"
                                              ? !section.isAddFunctionality
                                              : false
                                          }
                                          altText={"Add"}
                                          title={"Add"}
                                          onClick={() => {
                                            inputFieldsVisible == false &&
                                              setInputFieldsVisible(
                                                (prev) => !prev,
                                              );
                                          }}
                                        />
                                      )}

                                    <span
                                      className={`${styles.labelText}`}
                                      onClick={
                                        !isView
                                          ? () => handleSortBy(field.fieldname)
                                          : undefined
                                      }
                                      style={{
                                        paddingLeft: isGridEdit ? "0px" : "0px",
                                      }}
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
                                          />
                                        )}
                                    </span>
                                    {!isView && (
                                      <span className="ml-1">
                                        {renderSortIcon(field.fieldname)}
                                      </span>
                                    )}
                                  </TableCell>
                                </React.Fragment>
                              ))}
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {renderedData?.map((row, index) => (
                            <RowComponent
                              fields={section.fields}
                              childIndex={index}
                              childName={section.tableName}
                              subChild={section.subChild}
                              sectionData={{
                                ...section,
                                isDeleteHide: isChildDeleteHidden,
                              }}
                              key={index}
                              row={row}
                              newState={newState}
                              setNewState={setNewState}
                              setInputFieldsVisible={setInputFieldsVisible}
                              expandAll={expandAll}
                              inEditMode={{ isEditMode: false, isCopy: true }}
                              setRenderedData={setRenderedData}
                              deleteChildRecord={deleteChildRecord}
                              calculateData={calculateData}
                              setCalculateData={setCalculateData}
                              dummyFieldArray={dummyFieldArray}
                              setDummyFieldArray={setDummyFieldArray}
                              isGridEdit={isGridEdit}
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
                              showSrNo={
                                section?.showSrNo === true ||
                                section?.showSrNo === "true"
                              }
                              tableBodyWidth={tableBodyWidth}
                            />
                          ))}
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
                                      <React.Fragment key={index}>
                                        <TableCell
                                          align="left"
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
                                        {(section?.showSrNo === true ||
                                          section?.showSrNo === "true") &&
                                          index === 0 && (
                                            <TableCell
                                              align="left"
                                              sx={{
                                                ...totalSumChildStyle,
                                                paddingLeft: "12px",
                                                width: "64px",
                                                minWidth: "64px",
                                              }}
                                            >
                                              <div className="relative font-bold">
                                                <div
                                                  className={`${childTableRowStyles} `}
                                                />
                                              </div>
                                            </TableCell>
                                          )}
                                      </React.Fragment>
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
