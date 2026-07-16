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
  getCopyData,
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
import * as onGridSaveValidation from "@/helper/onGridSave";
import { Typography } from "@mui/material";
import { getUserDetails } from "@/helper/userDetails";
import PrintModal from "@/components/Modal/printModal.jsx";
import { encryptUrlFun } from "@/utils";
import { fetchReportData } from "@/services/auth/FormControl.services";
import { useDispatch, useSelector } from "react-redux";
import { dispatch } from "d3";
import { updateFlag } from "@/app/counterSlice";

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

async function onGridSaveFunctionCall(
  functionData,
  newState,
  formControlData,
  values,
  setStateVariable,
  submitNewState,
  setSubmitNewState,
) {
  const funcNameMatch = functionData?.match(/^(\w+)/);
  const argsMatch = functionData?.match(/\((.*)\)/);
  //console.log(functionData, "functionData");
  // Check if we have a function name match, and we have an argsMatch (even if there are no arguments)
  if (funcNameMatch && argsMatch !== null) {
    const funcName = funcNameMatch[1];
    const argsStr = argsMatch[1] || "";

    // Find the function in formControlValidation by the extracted name
    const func = onGridSaveValidation?.[funcName];

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
      let result = onGridSaveValidation?.[funcName]({
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

const getInvoiceChargeCurrencyId = (row = {}) => {
  if (
    row?.currencyId !== null &&
    row?.currencyId !== undefined &&
    row?.currencyId !== ""
  ) {
    return row.currencyId;
  }

  if (
    Array.isArray(row?.currencyIddropdown) &&
    row.currencyIddropdown[0]?.value !== undefined
  ) {
    return row.currencyIddropdown[0].value;
  }

  if (
    Array.isArray(row?.currencyIdDropdown) &&
    row.currencyIdDropdown[0]?.value !== undefined
  ) {
    return row.currencyIdDropdown[0].value;
  }

  if (
    Array.isArray(row?.currencyIdText) &&
    row.currencyIdText[0]?.value !== undefined
  ) {
    return row.currencyIdText[0].value;
  }

  return null;
};

const isSameCurrencyId = (a, b) => {
  if (a === null || a === undefined || a === "") return false;
  if (b === null || b === undefined || b === "") return false;

  return String(a) === String(b);
};

const getInvoiceChargeStableKey = (row = {}, index = 0) => {
  const currencyId = getInvoiceChargeCurrencyId(row);

  return [
    row?.id ?? "",
    row?.chargeId ?? row?.chargeIddropdown?.[0]?.value ?? "",
    row?.description ?? "",
    row?.blId ?? row?.blIddropdown?.[0]?.value ?? "",
    row?.sizeId ?? row?.sizeIddropdown?.[0]?.value ?? "",
    row?.typeId ?? row?.typeIddropdown?.[0]?.value ?? "",
    row?.containerTransactionId ?? "",
    row?.containerRepairId ?? "",
    currencyId ?? "",
    row?.indexValue ?? row?.index ?? row?.idx ?? index,
  ]
    .map((value) => String(value ?? ""))
    .join("|");
};

const cloneInvoiceChargeRows = (rows = []) => {
  return (Array.isArray(rows) ? rows : []).map((row) => ({ ...row }));
};

const applyExchangeRateToSameCurrencyRows = (
  rows = [],
  changedCurrencyId,
  changedExchangeRate,
) => {
  if (!Array.isArray(rows) || rows.length === 0) return rows;

  if (
    changedExchangeRate === undefined ||
    changedExchangeRate === null ||
    changedExchangeRate === ""
  ) {
    return rows;
  }

  let hasChanges = false;

  const updatedRows = rows.map((row) => {
    const rowCurrencyId = getInvoiceChargeCurrencyId(row);

    if (!isSameCurrencyId(rowCurrencyId, changedCurrencyId)) {
      return row;
    }

    if (String(row?.exchangeRate ?? "") === String(changedExchangeRate ?? "")) {
      return row;
    }

    hasChanges = true;

    return {
      ...row,
      exchangeRate: changedExchangeRate,
    };
  });

  return hasChanges ? updatedRows : rows;
};

const findChangedInvoiceChargeExchangeRate = (oldRows = [], newRows = []) => {
  if (!Array.isArray(oldRows) || !Array.isArray(newRows)) return null;

  const oldRowsByKey = new Map(
    oldRows.map((row, index) => [getInvoiceChargeStableKey(row, index), row]),
  );

  for (let i = 0; i < newRows.length; i++) {
    const newRow = newRows[i] || {};
    const rowKey = getInvoiceChargeStableKey(newRow, i);

    const oldRow = oldRowsByKey.get(rowKey) || oldRows[i] || {};

    const oldExchangeRate = oldRow?.exchangeRate;
    const newExchangeRate = newRow?.exchangeRate;

    if (
      newExchangeRate !== undefined &&
      newExchangeRate !== null &&
      newExchangeRate !== "" &&
      String(oldExchangeRate ?? "") !== String(newExchangeRate ?? "")
    ) {
      const currencyId = getInvoiceChargeCurrencyId(newRow);

      if (
        currencyId !== null &&
        currencyId !== undefined &&
        currencyId !== ""
      ) {
        return {
          currencyId,
          exchangeRate: newExchangeRate,
        };
      }
    }
  }

  return null;
};

export default function AddEditFormControll() {
  const selectedMenuId = useSelector((state) => state?.counter?.selectedMenuId);
  const { push } = useRouter();
  const params = useParams();

  const uriDecodedMenu = React.useMemo(() => {
    try {
      return JSON.parse(decodeURIComponent(params.id));
    } catch (error) {
      console.error("Invalid route params:", error);
      return {};
    }
  }, [params.id]);

  const search = uriDecodedMenu;
  const encryptParams = uriDecodedMenu;
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
  const [voucherAllocDeleteTick, setVoucherAllocDeleteTick] = useState(0);
  const searchParams = useSearchParams();
  const id = uriDecodedMenu;
  const getLabelValue = (label) => {
    setLabelName(label);
  };
  const [fetchCount, setFetchCount] = useState(1);
  const prevInvoiceChargeRowsRef = useRef(null);
  const isSyncingInvoiceChargeExchangeRateRef = useRef(false);
  const prevParentExchangeRateRef = useRef(null);
  const [amtRecReadOnly, setAmtRecReadOnly] = useState(false);
  const [amtRecFCReadOnly, setAmtRecFCReadOnly] = useState(false);
  const homeCurrencyIdRef = useRef(null);
  const invoiceChargeHomeCurrencyIdRef = useRef(null);
  const invoiceChargeExchangeRateSignature = Array.isArray(
    newState?.tblInvoiceCharge,
  )
    ? newState.tblInvoiceCharge
        .map((row, index) => {
          return [
            getInvoiceChargeStableKey(row, index),
            getInvoiceChargeCurrencyId(row) ?? "",
            row?.exchangeRate ?? "",
          ].join("::");
        })
        .join("||")
    : "";

  const invoiceChargeCalculationSignature = Array.isArray(
    newState?.tblInvoiceCharge,
  )
    ? newState.tblInvoiceCharge
        .map((row, index) => {
          const taxSignature = Array.isArray(row?.tblInvoiceChargeTax)
            ? row.tblInvoiceChargeTax
                .map((tax) =>
                  [
                    tax?.taxId ?? "",
                    tax?.taxPercentage ?? "",
                    tax?.status ?? "",
                    tax?.isDeleted ?? "",
                  ].join(":"),
                )
                .join(",")
            : "";

          const tdsSignature = Array.isArray(row?.tblInvoiceChargeTds)
            ? row.tblInvoiceChargeTds
                .map((tds) =>
                  [
                    tds?.tdsId ?? "",
                    tds?.tdsPercentage ?? "",
                    tds?.tdsApplicable ?? "",
                    tds?.status ?? "",
                    tds?.isDeleted ?? "",
                  ].join(":"),
                )
                .join(",")
            : "";

          return [
            getInvoiceChargeStableKey(row, index),
            getInvoiceChargeCurrencyId(row) ?? "",
            row?.qty ?? "",
            row?.rate ?? "",
            row?.noOfDays ?? "",
            row?.exchangeRate ?? "",
            row?.taxApplicable ?? "",
            taxSignature,
            tdsSignature,
          ].join("::");
        })
        .join("||")
    : "";
  const skipInitialTaxRecalcInEditRef = useRef(true);

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
        const data = response?.data || response || [];
        setisReportPresent(Array.isArray(data) && data.length > 0);
      } catch (error) {
        console.error(error);
      }
    }
  }

  useEffect(() => {
    if (!search?.menuName) return;

    checkReportPresent(search.menuName);
  }, [search?.menuName]);
  useEffect(() => {
    const rows = Array.isArray(newState?.tblInvoiceCharge)
      ? newState.tblInvoiceCharge
      : null;

    if (!rows) {
      prevInvoiceChargeRowsRef.current = null;
      return;
    }

    // First load only: store clone, don't modify loaded edit data
    if (prevInvoiceChargeRowsRef.current === null) {
      prevInvoiceChargeRowsRef.current = cloneInvoiceChargeRows(rows);
      return;
    }

    // Skip loop when this effect itself updated rows
    if (isSyncingInvoiceChargeExchangeRateRef.current) {
      isSyncingInvoiceChargeExchangeRateRef.current = false;
      prevInvoiceChargeRowsRef.current = cloneInvoiceChargeRows(rows);
      return;
    }

    const changedInfo = findChangedInvoiceChargeExchangeRate(
      prevInvoiceChargeRowsRef.current,
      rows,
    );

    if (!changedInfo) {
      prevInvoiceChargeRowsRef.current = cloneInvoiceChargeRows(rows);
      return;
    }

    const syncedRows = applyExchangeRateToSameCurrencyRows(
      rows,
      changedInfo.currencyId,
      changedInfo.exchangeRate,
    );

    prevInvoiceChargeRowsRef.current = cloneInvoiceChargeRows(syncedRows);

    if (syncedRows === rows) return;

    isSyncingInvoiceChargeExchangeRateRef.current = true;

    const applyExchangeRateSyncOnly = (prev = {}) => {
      const updatedRows = applyExchangeRateToSameCurrencyRows(
        prev?.tblInvoiceCharge,
        changedInfo.currencyId,
        changedInfo.exchangeRate,
      );

      if (updatedRows === prev?.tblInvoiceCharge) return prev;

      return {
        ...prev,
        tblInvoiceCharge: updatedRows,
      };
    };

    setNewState(applyExchangeRateSyncOnly);
    setSubmitNewState(applyExchangeRateSyncOnly);
  }, [invoiceChargeExchangeRateSignature]);

  useEffect(() => {
    let allChildTableName = [];
    childsFields.map((item) => {
      allChildTableName.push(item?.tableName);
    });
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
    if (value && typeof value === "object")
      return Object.keys(value).length > 0;

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
        parseIdList(field.columnsToHide).forEach((id) =>
          hiddenByDefault.add(id),
        );
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
        if (
          Object.prototype.hasOwnProperty.call(prev, ddKey) &&
          prev[ddKey] !== null
        ) {
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
  // async function voucherCalculationBaseonCurrency() {
  //   try {
  //     const { companyId } = getUserDetails();
  //     const { currencyId, exchangeRate } = newState || {};

  //     const hasVoucherAmountFields =
  //       Object.prototype.hasOwnProperty.call(newState || {}, "amtRec") ||
  //       Object.prototype.hasOwnProperty.call(newState || {}, "amtRecFC");

  //     if (!hasVoucherAmountFields) {
  //       return;
  //     }

  //     if (!currencyId) {
  //       setAmtRecReadOnly(false);
  //       setAmtRecFCReadOnly(false);
  //       return;
  //     }

  //     let homeCurrencyId = homeCurrencyIdRef.current;

  //     if (!homeCurrencyId) {
  //       const request = {
  //         columns: "currencyId",
  //         tableName: "tblCompanyParameter",
  //         whereCondition: `companyId=${companyId}`,
  //         clientIdCondition: `status=1 FOR JSON PATH, INCLUDE_NULL_VALUES`,
  //       };

  //       const response = await fetchReportData(request);
  //       const data = response?.data || [];
  //       homeCurrencyId = data?.[0]?.currencyId || null;
  //       homeCurrencyIdRef.current = homeCurrencyId;
  //     }

  //     if (!homeCurrencyId) {
  //       setAmtRecReadOnly(false);
  //       setAmtRecFCReadOnly(false);
  //       return;
  //     }

  //     const toNum = (value) => {
  //       if (value === null || value === undefined || value === "") return 0;

  //       const num = Number(String(value).replace(/,/g, ""));
  //       return Number.isFinite(num) ? num : 0;
  //     };

  //     const to2 = (n) => {
  //       const x = Number(n) || 0;
  //       const v = Math.round((x + Number.EPSILON) * 100) / 100;
  //       return Object.is(v, -0) ? "0.00" : v.toFixed(2);
  //     };

  //     const homeCurrency = String(homeCurrencyId || "");
  //     const selectedCurrency = String(currencyId || "");

  //     const isForeignCurrency = homeCurrency !== selectedCurrency;
  //     setAmtRecReadOnly((prev) =>
  //       prev === isForeignCurrency ? prev : isForeignCurrency,
  //     );
  //     setAmtRecFCReadOnly((prev) =>
  //       prev === !isForeignCurrency ? prev : !isForeignCurrency,
  //     );

  //     const applyCurrencyCalculation = (prev = {}) => {
  //       if (!prev || typeof prev !== "object") return prev;

  //       if (isForeignCurrency) {
  //         const safeAmtRecFC = toNum(prev?.amtRecFC ?? 0);
  //         const safeExchangeRate =
  //           toNum(prev?.exchangeRate || exchangeRate || 1) || 1;

  //         const calculatedAmtRec = to2(safeAmtRecFC * safeExchangeRate);

  //         if (String(prev?.amtRec ?? "") === calculatedAmtRec) {
  //           return prev;
  //         }

  //         return {
  //           ...prev,
  //           amtRec: calculatedAmtRec,
  //         };
  //       }

  //       const safeAmtRec = toNum(prev?.amtRec ?? 0);
  //       const calculatedAmtRecFC = to2(safeAmtRec);

  //       if (String(prev?.amtRecFC ?? "") === calculatedAmtRecFC) {
  //         return prev;
  //       }

  //       return {
  //         ...prev,
  //         amtRecFC: calculatedAmtRecFC,
  //       };
  //     };

  //     setNewState((prev) => applyCurrencyCalculation(prev));
  //     setSubmitNewState((prev) => applyCurrencyCalculation(prev));
  //   } catch (error) {
  //     console.error("Error in voucherCalculationBaseonCurrency:", error);
  //   }
  // }

  // useEffect(() => {
  //   voucherCalculationBaseonCurrency();
  // }, [
  //   newState?.currencyId,
  //   newState?.exchangeRate,
  //   // newState?.amtRec,
  //   // newState?.amtRecFC,
  // ]);
  async function fetchData() {
    const { clientId, financialYear } = getUserDetails();

    if (String(search?.menuName) !== "1560") {
      try {
        const tableViewApiResponse = await formControlMenuList(
          search.menuName,
          financialYear,
        );
        if (!tableViewApiResponse?.success) return;

        const menuConfig = tableViewApiResponse.data[0] || {};
        const rawFields = Array.isArray(menuConfig.fields)
          ? menuConfig.fields
          : [];

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
          for (
            let index = 0;
            index < (finalData[item.tableName] || []).length;
            index++
          ) {
            finalData[item.tableName][index].indexValue = index;

            for (const subchildItem of item.subChild || []) {
              for (
                let idx = 0;
                idx <
                (finalData[item.tableName][index][subchildItem.tableName] || [])
                  .length;
                idx++
              ) {
                finalData[item.tableName][index][subchildItem.tableName][
                  idx
                ].indexValue = idx;
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
          if (value && typeof value === "object")
            return Object.keys(value).length > 0;

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
            parseIdList(field.columnsToHide).forEach((id) =>
              hiddenByDefault.add(id),
            );
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
              if (
                field.fieldname === "tdsAmtFC" ||
                field.fieldname === "tdsAmtHC"
              ) {
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
          isEditMode: true,
          parentFieldDataInArray,
          setParentFieldDataInArray,
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

  const toInvoiceNum = (value) => {
    if (value === null || value === undefined || value === "") return 0;

    const num = Number(String(value).replace(/,/g, ""));
    return Number.isFinite(num) ? num : 0;
  };

  const toInvoice2 = (value) => {
    const num = toInvoiceNum(value);
    const rounded = Math.round((num + Number.EPSILON) * 100) / 100;
    return Object.is(rounded, -0) ? "0.00" : rounded.toFixed(2);
  };

  const toInvoiceArray = (value) => {
    return Array.isArray(value) ? value : [];
  };

  const isInvoiceYes = (value) => {
    return (
      value === true ||
      value === "true" ||
      value === 1 ||
      value === "1" ||
      String(value || "")
        .trim()
        .toLowerCase() === "yes" ||
      String(value || "")
        .trim()
        .toLowerCase() === "y"
    );
  };

  const isActiveInvoiceChargeRow = (row) => {
    if (!row) return false;

    // Handles both cases:
    // 1. row is physically removed from tblInvoiceCharge
    // 2. row remains but is marked deleted/inactive
    if (row.status === false) return false;
    if (row.isDeleted === true) return false;
    if (
      row.deletedNo !== null &&
      row.deletedNo !== undefined &&
      row.deletedNo !== ""
    ) {
      return false;
    }

    const action = String(row?._action || row?.action || row?.rowAction || "")
      .trim()
      .toLowerCase();

    if (action === "delete" || action === "deleted" || action === "remove") {
      return false;
    }

    return true;
  };

  const isActiveInvoiceChildRow = (row) => {
    if (!row) return false;

    if (row.status === false) return false;
    if (row.isDeleted === true) return false;
    if (
      row.deletedNo !== null &&
      row.deletedNo !== undefined &&
      row.deletedNo !== ""
    ) {
      return false;
    }

    const action = String(row?._action || row?.action || row?.rowAction || "")
      .trim()
      .toLowerCase();

    if (action === "delete" || action === "deleted" || action === "remove") {
      return false;
    }

    return true;
  };

  const hasInvoiceTaxValue = (row) => {
    return (
      Number(row?.taxId || 0) > 0 ||
      Number(row?.taxPercentage || 0) > 0 ||
      toInvoiceNum(row?.taxAmountHc) > 0 ||
      toInvoiceNum(row?.taxAmountFc) > 0
    );
  };

  const hasInvoiceTdsValue = (row) => {
    return (
      isInvoiceYes(row?.tdsApplicable) ||
      Number(row?.tdsId || 0) > 0 ||
      Number(row?.tdsPercentage || 0) > 0 ||
      toInvoiceNum(row?.tdsAmountHc) > 0 ||
      toInvoiceNum(row?.tdsAmountFc) > 0
    );
  };

  const applyInvoiceParentTotals = (prev, totals) => {
    if (!prev || typeof prev !== "object") return prev;

    const next = {
      ...prev,

      invoiceAmount: totals.invoiceAmount,
      invoiceAmountFc: totals.invoiceAmountFc,

      taxAmount: totals.taxAmount,
      taxAmountFc: totals.taxAmountFc,

      tdsAmount: totals.tdsAmount,
      tdsAmountFc: totals.tdsAmountFc,

      // Your screen is also using these fields
      tdsAmt: totals.tdsAmount,
      tdsAmtFC: totals.tdsAmountFc,

      totalInvoiceAmount: totals.totalInvoiceAmount,
      totalInvoiceAmountFc: totals.totalInvoiceAmountFc,

      roundOffAmount: totals.roundOffAmount,
      roundOffAmountFc: totals.roundOffAmountFc,
    };

    const checkKeys = [
      "invoiceAmount",
      "invoiceAmountFc",
      "taxAmount",
      "taxAmountFc",
      "tdsAmount",
      "tdsAmountFc",
      "tdsAmt",
      "tdsAmtFC",
      "totalInvoiceAmount",
      "totalInvoiceAmountFc",
      "roundOffAmount",
      "roundOffAmountFc",
    ];

    const hasChange = checkKeys.some(
      (key) => String(prev?.[key] ?? "") !== String(next?.[key] ?? ""),
    );

    return hasChange ? next : prev;
  };

  async function getRoundOffSetting(
    totalInvoiceAmount,
    totalInvoiceAmountFc,
    totalAmount,
    safeTaxAmount,
    safeTaxAmountFc,
    totalAmountFc,
    safeTdsAmount,
    safeTdsAmountFc,
  ) {
    const { clientId, defaultFinYearId } = getUserDetails();
    const { voucherTypeId } = newState || {};

    let roundOffFlag = "N";

    try {
      if (voucherTypeId) {
        const requestData = { voucherTypeId, clientId };
        const fetchRoundOffData = await getRoundOffData(requestData);

        roundOffFlag = String(
          fetchRoundOffData?.Chargers?.InvoiceRoundOff ?? "N",
        ).toUpperCase();

        setInvoiceRoundOff((prev) =>
          prev === roundOffFlag ? prev : roundOffFlag,
        );
      }
    } catch (error) {
      console.error("Error while fetching invoice round off setting:", error);
      roundOffFlag = "N";
    }

    const roundedHc = Math.round(toInvoiceNum(totalInvoiceAmount));
    const roundedFc = Math.round(toInvoiceNum(totalInvoiceAmountFc));

    const finalTotals =
      roundOffFlag === "Y"
        ? {
            invoiceAmount: totalAmount,
            invoiceAmountFc: totalAmountFc,

            taxAmount: safeTaxAmount,
            taxAmountFc: safeTaxAmountFc,

            tdsAmount: safeTdsAmount,
            tdsAmountFc: safeTdsAmountFc,

            totalInvoiceAmount: toInvoice2(roundedHc),
            totalInvoiceAmountFc: toInvoice2(roundedFc),

            roundOffAmount: toInvoice2(
              roundedHc - toInvoiceNum(totalInvoiceAmount),
            ),
            roundOffAmountFc: toInvoice2(
              roundedFc - toInvoiceNum(totalInvoiceAmountFc),
            ),
          }
        : {
            invoiceAmount: totalAmount,
            invoiceAmountFc: totalAmountFc,

            taxAmount: safeTaxAmount,
            taxAmountFc: safeTaxAmountFc,

            tdsAmount: safeTdsAmount,
            tdsAmountFc: safeTdsAmountFc,

            totalInvoiceAmount,
            totalInvoiceAmountFc,

            roundOffAmount: "0.00",
            roundOffAmountFc: "0.00",
          };

    setNewState((prev) => applyInvoiceParentTotals(prev, finalTotals));
    setSubmitNewState((prev) => applyInvoiceParentTotals(prev, finalTotals));
  }

  useEffect(() => {
    // Do not run invoice charge calculation for voucher forms
    // that do not contain tblInvoiceCharge.
    if (!Array.isArray(newState?.tblInvoiceCharge)) {
      return;
    }

    const charges = newState.tblInvoiceCharge.filter(
      isActiveInvoiceChargeRow,
    );

    const totalAmount = toInvoice2(
      charges.reduce((acc, item) => {
        return acc + toInvoiceNum(item?.totalAmountHc);
      }, 0),
    );

    const totalAmountFc = toInvoice2(
      charges.reduce((acc, item) => {
        return acc + toInvoiceNum(item?.totalAmountFc);
      }, 0),
    );

    const safeTaxAmount = toInvoice2(
      charges.reduce((acc, item) => {
        const taxRows = toInvoiceArray(item?.tblInvoiceChargeTax).filter(
          isActiveInvoiceChildRow,
        );

        const rowTaxTotal = taxRows.reduce((taxAcc, taxRow) => {
          if (!hasInvoiceTaxValue(taxRow)) return taxAcc;

          return taxAcc + toInvoiceNum(taxRow?.taxAmountHc);
        }, 0);

        return acc + rowTaxTotal;
      }, 0),
    );

    const safeTaxAmountFc = toInvoice2(
      charges.reduce((acc, item) => {
        const taxRows = toInvoiceArray(item?.tblInvoiceChargeTax).filter(
          isActiveInvoiceChildRow,
        );

        const rowTaxTotal = taxRows.reduce((taxAcc, taxRow) => {
          if (!hasInvoiceTaxValue(taxRow)) return taxAcc;

          return taxAcc + toInvoiceNum(taxRow?.taxAmountFc);
        }, 0);

        return acc + rowTaxTotal;
      }, 0),
    );

    const safeTdsAmount = toInvoice2(
      charges.reduce((acc, item) => {
        const tdsRows = toInvoiceArray(item?.tblInvoiceChargeTds).filter(
          isActiveInvoiceChildRow,
        );

        const rowTdsTotal = tdsRows.reduce((tdsAcc, tdsRow) => {
          if (!hasInvoiceTdsValue(tdsRow)) return tdsAcc;

          return tdsAcc + toInvoiceNum(tdsRow?.tdsAmountHc);
        }, 0);

        return acc + rowTdsTotal;
      }, 0),
    );

    const safeTdsAmountFc = toInvoice2(
      charges.reduce((acc, item) => {
        const tdsRows = toInvoiceArray(item?.tblInvoiceChargeTds).filter(
          isActiveInvoiceChildRow,
        );

        const rowTdsTotal = tdsRows.reduce((tdsAcc, tdsRow) => {
          if (!hasInvoiceTdsValue(tdsRow)) return tdsAcc;

          return tdsAcc + toInvoiceNum(tdsRow?.tdsAmountFc);
        }, 0);

        return acc + rowTdsTotal;
      }, 0),
    );

    const totalInvoiceAmount = toInvoice2(
      toInvoiceNum(totalAmount) + toInvoiceNum(safeTaxAmount),
    );

    const totalInvoiceAmountFc = toInvoice2(
      toInvoiceNum(totalAmountFc) + toInvoiceNum(safeTaxAmountFc),
    );

    getRoundOffSetting(
      totalInvoiceAmount,
      totalInvoiceAmountFc,
      totalAmount,
      safeTaxAmount,
      safeTaxAmountFc,
      totalAmountFc,
      safeTdsAmount,
      safeTdsAmountFc,
    );
  }, [
    newState?.tblInvoiceCharge,
    newState?.tblInvoiceCharge?.length,
    newState?.voucherTypeId,
  ]);
  ///till here
  const recalculateAllChargeTaxes = async () => {
    const charges = newState?.tblInvoiceCharge || [];
    if (!charges.length) return;

    const updatedCharges = await Promise.all(
      charges.map(async (charge) => {
        const sacCodeId =
          charge?.sacCodeId ||
          charge?.sacId ||
          charge?.hsnId ||
          charge?.hsnCodeId ||
          0;

        if (!sacCodeId) {
          return {
            ...charge,
            tblInvoiceChargeTax: charge?.tblInvoiceChargeTax || [],
          };
        }

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
          sacCodeId: sacCodeId,
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
          isTaxApplicable: charge?.taxApplicable,
        };

        const res = await getTaxDetails(requestData);

        return {
          ...charge,
          tblInvoiceChargeTax: res?.tblTax || [],
        };
      }),
    );

    setNewState((prev) => ({
      ...prev,
      tblInvoiceCharge: updatedCharges,
    }));

    setSubmitNewState((prev) => ({
      ...prev,
      tblInvoiceCharge: updatedCharges,
    }));
  };
  useEffect(() => {
    if (!newState?.tblInvoiceCharge?.length) return;

    const isEditMode = search?.id && !search?.isCopy;

    // In edit mode, don't auto-create tblInvoiceChargeTax on initial load.
    // This preserves already deleted tax rows.
    if (isEditMode && skipInitialTaxRecalcInEditRef.current) {
      skipInitialTaxRecalcInEditRef.current = false;
      return;
    }

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
  console.log("newState", newState);

  useEffect(() => {
    if (!Array.isArray(newState?.tblInvoiceCharge)) return;

    const updateChargesByCurrency = async () => {
      try {
        const { companyId } = getUserDetails();

        const toNum = (value) => {
          if (value === null || value === undefined || value === "") return 0;
          const num = Number(String(value).replace(/,/g, ""));
          return Number.isFinite(num) ? num : 0;
        };

        const round2 = (value) => {
          return toNum(value).toFixed(2);
        };

        const isYes = (value) => {
          return (
            value === true ||
            value === "true" ||
            value === 1 ||
            value === "1" ||
            String(value || "")
              .trim()
              .toLowerCase() === "yes" ||
            String(value || "")
              .trim()
              .toLowerCase() === "y"
          );
        };

        let homeCurrencyId = invoiceChargeHomeCurrencyIdRef.current;

        if (!homeCurrencyId) {
          const request = {
            columns: "currencyId",
            tableName: "tblCompanyParameter",
            whereCondition: `companyId=${companyId}`,
            clientIdCondition: `status=1 FOR JSON PATH, INCLUDE_NULL_VALUES`,
          };

          const response = await fetchReportData(request);
          homeCurrencyId = response?.data?.[0]?.currencyId || null;
          invoiceChargeHomeCurrencyIdRef.current = homeCurrencyId;
        }

        if (!homeCurrencyId) return;

        const calculateTaxRows = (
          taxRows = [],
          totalAmountFc,
          totalAmountHc,
        ) => {
          if (!Array.isArray(taxRows)) return [];

          return taxRows.map((tax) => {
            const taxPercentage = toNum(tax?.taxPercentage);

            if (taxPercentage <= 0) return tax;

            const taxAmountFc = round2(
              (toNum(totalAmountFc) * taxPercentage) / 100,
            );
            const taxAmountHc = round2(
              (toNum(totalAmountHc) * taxPercentage) / 100,
            );

            return {
              ...tax,
              taxAmountFc,
              taxAmountHc,
            };
          });
        };

        const calculateTdsRows = (
          tdsRows = [],
          totalAmountFc,
          totalAmountHc,
        ) => {
          if (!Array.isArray(tdsRows)) return [];

          return tdsRows.map((tds) => {
            const tdsPercentage = toNum(tds?.tdsPercentage);

            const shouldCalculateTds =
              isYes(tds?.tdsApplicable) ||
              Number(tds?.tdsId || 0) > 0 ||
              tdsPercentage > 0;

            if (!shouldCalculateTds || tdsPercentage <= 0) {
              return tds;
            }

            const tdsAmountFc = round2(
              (toNum(totalAmountFc) * tdsPercentage) / 100,
            );
            const tdsAmountHc = round2(
              (toNum(totalAmountHc) * tdsPercentage) / 100,
            );

            return {
              ...tds,
              tdsAmountFc,
              tdsAmountHc,
            };
          });
        };

        const calculateUpdatedCharges = (charges = [], parentState = {}) => {
          let hasChanges = false;

          const parentCurrencyId = parentState?.currencyId;
          const parentExchangeRate = toNum(parentState?.exchangeRate);

          const updatedCharges = charges.map((item) => {
            const childCurrencyId = item?.currencyId;

            const qty = toNum(item?.qty);
            const rate = toNum(item?.rate);
            const exchangeRate = toNum(item?.exchangeRate);

            const noOfDays = toNum(item?.noOfDays);
            const effectiveNoOfDays = noOfDays <= 0 ? 1 : noOfDays;

            const baseAmount = qty * rate * effectiveNoOfDays;

            let totalAmountFc = "0.00";
            let totalAmountHc = "0.00";

            // Parent invoice currency is HOME currency
            if (String(homeCurrencyId) === String(parentCurrencyId)) {
              totalAmountFc = round2(baseAmount * exchangeRate);
              totalAmountHc = round2(baseAmount * exchangeRate);
            }

            // Parent invoice currency is FOREIGN currency
            else {
              // Child row currency is same as parent invoice currency
              if (String(parentCurrencyId) === String(childCurrencyId)) {
                totalAmountFc = round2(baseAmount);
                totalAmountHc = round2(baseAmount * parentExchangeRate);
              }

              // Child row currency is different from parent invoice currency
              else {
                totalAmountFc = round2(baseAmount * exchangeRate);
                totalAmountHc = round2(baseAmount);
              }
            }

            const tblInvoiceChargeTax = isYes(item?.taxApplicable)
              ? calculateTaxRows(
                  item?.tblInvoiceChargeTax,
                  totalAmountFc,
                  totalAmountHc,
                )
              : item?.tblInvoiceChargeTax;

            const tblInvoiceChargeTds = calculateTdsRows(
              item?.tblInvoiceChargeTds,
              totalAmountFc,
              totalAmountHc,
            );

            if (
              String(item?.totalAmountFc ?? "") !== String(totalAmountFc) ||
              String(item?.totalAmountHc ?? "") !== String(totalAmountHc) ||
              JSON.stringify(item?.tblInvoiceChargeTax || []) !==
                JSON.stringify(tblInvoiceChargeTax || []) ||
              JSON.stringify(item?.tblInvoiceChargeTds || []) !==
                JSON.stringify(tblInvoiceChargeTds || [])
            ) {
              hasChanges = true;

              return {
                ...item,
                totalAmountFc,
                totalAmountHc,
                tblInvoiceChargeTax,
                tblInvoiceChargeTds,
              };
            }

            return item;
          });

          return hasChanges ? updatedCharges : charges;
        };

        setNewState((prev) => {
          const updatedCharges = calculateUpdatedCharges(
            prev?.tblInvoiceCharge,
            prev,
          );

          if (updatedCharges === prev?.tblInvoiceCharge) return prev;

          return {
            ...prev,
            tblInvoiceCharge: updatedCharges,
          };
        });

        setSubmitNewState((prev) => {
          const updatedCharges = calculateUpdatedCharges(
            prev?.tblInvoiceCharge,
            newState,
          );

          if (updatedCharges === prev?.tblInvoiceCharge) return prev;

          return {
            ...prev,
            tblInvoiceCharge: updatedCharges,
          };
        });
      } catch (error) {
        console.error("Error while calculating charge amounts:", error);
      }
    };

    updateChargesByCurrency();
  }, [
    newState?.tblInvoiceCharge,
    invoiceChargeCalculationSignature,
    newState?.currencyId,
    newState?.exchangeRate,
  ]);
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
          // change as per discused my anisha date 26-06-2026 ------
          // if (validateSubmitData.success === true) {
          //   setParaText(validateSubmitData.message);
          //   setIsError(false);
          //   setOpenModal((prev) => !prev);
          // }
          // setTimeout(() => {
          //   push(`/invoiceControl?menuName=${encryptUrlFun({
          //        id: search.menuName,
          //        menuName: search.menuName,
          //        parentMenuId: search.menuName,
          //       })}`);
          // }, 500);
          if (validateSubmitData.success === false) {
            setParaText(validateSubmitData?.message);
            setIsError(false);
            setOpenModal((prev) => !prev);
          } else {
            setTimeout(() => {
              push(
                `/invoiceControl?menuName=${encryptUrlFun({
                  id: search.menuName,
                  menuName: search.menuName,
                  parentMenuId: search.menuName,
                  keyName: search.keyName,
                  keyValue: search.keyValue,
                })}`,
              );
            }, 500);
          }
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

        const requestBody = {
          tableName: tableName,
          recordId: uriDecodedMenu.id,
        };
        const validateSubmitData = await validateSubmit(requestBody);

        if (validateSubmitData.success != true) {
          setParaText(validateSubmitData.message);
          setIsError(false);
          setOpenModal((prev) => !prev);
          return;
        }

        const data = await insertVoucherDataDynami(payload);

        if (data?.success === true) {
          toast.success(data.message);

          if (isReportPresent) {
            const lastRow = Array.isArray(data?.data) ? data.data.at(-1) : null;
            const id =
              lastRow?.id ?? lastRow?.ParentId ?? lastRow?.recordId ?? null;

            if (id) {
              setOpenPrintModal((prev) => !prev);
              //setSubmittedMenuId(uriDecodedMenu?.menuName);
              setSubmittedMenuId(uriDecodedMenu?.menuName);
              setSubmittedRecordId(id);
            }
          }

          // dispatch(updateFlag({ flag: "isRedirection", value: true }));

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

  async function getThirdLevelDetails(childIndex) {
    const values = newState;
    const { companyId, clientId, branchId } = getUserDetails();

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
      vesselId,
      voyageId,
      fromDate,
      toDate,
      exchangeRate,
      includeMNR,
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
      billingPartyId,
      clientId,
      jobId,
      chargeId,
      companyId,
      companyBranchId: branchId,
      fromDate,
      toDate,
      businessSegmentId,
      voucherTypeId,
      blId,
      plrId,
      podId,
      fpdId,
      polId,
      depotId,
      containerStatusId,
      cargoTypeId,
      sizeId,
      typeId,
      containerRepairId,
      containerTransactionId,
      invoiceExchageRate: exchangeRate,
      includeMNR,
      vesselId,
      voyageId,
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

      // ✅ average rate tblInvoiceChargeDetails
      const avgRate = qty > 0 ? totalWeighted / qty : 0;
      setNewState((prev) => ({
        ...prev,
        tblInvoiceCharge : prev?.tblInvoiceCharge?.map((item, index) => {
            if(index === childIndex){
           return  {
          ...item,
        qty: qty,
        rate: avgRate.toFixed(2),
        totalAmountHc: (qty * avgRate).toFixed(2),
        totalAmountFc: (
          qty *
          avgRate *
          Number(newState.exchangeRate || 1)
        ).toFixed(2),
        tblInvoiceChargeDetails: updatedChargers,
          }
            }
           return item;
        })
      }));
       setSubmitNewState((prev) => ({
        ...prev,
        tblInvoiceCharge : prev?.tblInvoiceCharge?.map((item, index) => {
            if(index === childIndex){
           return  {
          ...item,
        qty: qty,
        rate: avgRate.toFixed(2),
        totalAmountHc: (qty * avgRate).toFixed(2),
        totalAmountFc: (
          qty *
          avgRate *
          Number(newState.exchangeRate || 1)
        ).toFixed(2),
        tblInvoiceChargeDetails: updatedChargers,
          }
            }
           return item;
        })
      }));
    }
  }

  const onConfirm = async (conformData) => {
    if (
      uriDecodedMenu?.menuName == "Journal Voucher" &&
      conformData.type !== "onClose"
    ) {
      setOpenModal(false);
      return;
    }

    if (
      uriDecodedMenu?.menuName == "Journal Voucher" &&
      conformData.type === "onClose"
    ) {
      if (conformData.isError) {
        const menuId = selectedMenuId || search?.menuName || uriDecodedMenu?.id;
        setOpenModal(false);
        setNewState({ routeName: "mastervalue" });
        setSubmitNewState({ routeName: "mastervalue" });
        push(
          `/invoiceControl?menuName=${encryptUrlFun({
            id: menuId,
            menuName: uriDecodedMenu.menuName,
            parentMenuId: uriDecodedMenu.parentMenuId || menuId,
            keyName: search.keyName,
            keyValue: search.keyValue,
          })}`,
        );
      } else {
        setOpenModal(false);
      }
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
            keyName: search.keyName,
            keyValue: search.keyValue,
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

  const allocPrevRef = useRef("");
  const allocInternalUpdateRef = useRef(false);
  const allocHydrateRef = useRef(true);
  const allocParentLedgerSnapshotRef = useRef("");
  const allocVoucherTypeRef = useRef("");
  const allocTdsEditSnapshotRef = useRef({});
  const allocApplicableAmtRecRef = useRef({
    key: "",
    amtRec: "",
    amtRecFC: "",
  });

  const forceVoucherAllocationRecalcAfterDelete = () => {
    allocPrevRef.current = "";
    allocInternalUpdateRef.current = false;
    allocHydrateRef.current = false;
    allocParentLedgerSnapshotRef.current = "";
    allocTdsEditSnapshotRef.current = {};
    allocApplicableAmtRecRef.current = {
      key: "",
      amtRec: "",
      amtRecFC: "",
    };

    setVoucherAllocDeleteTick((prev) => prev + 1);
  };

  useEffect(() => {
    const voucherTypeId = String(newState?.voucherTypeId ?? "");

    if (!["8", "9", "11", "12"].includes(voucherTypeId)) {
      return;
    }

    const shouldSwapDrCr = false;
    const TDS_RATE = 0.02;
    const AUTO_CHILD_BALANCE_ADJUST_LIMIT = 1;

    const toNum = (v) => {
      if (v === null || v === undefined || v === "") return 0;

      const n = Number(String(v).replace(/,/g, ""));

      return Number.isFinite(n) ? n : 0;
    };

    const round2 = (n) => {
      const x = Math.round((Number(n) || 0) * 100) / 100;

      return Object.is(x, -0) ? 0 : x;
    };

    const asStr2 = (n) =>
      n === null || n === undefined || n === "" ? "" : round2(n).toFixed(2);

    const asNum2 = (n) => round2(n);

    const clamp0 = (n) => Math.max(0, round2(n));

    const hasValue = (v) => v !== null && v !== undefined && v !== "";

    const firstAvailableNumber = (...values) => {
      for (const value of values) {
        if (hasValue(value)) {
          return round2(toNum(value));
        }
      }

      return null;
    };

    const firstPositiveNum = (...values) => {
      for (const value of values) {
        const n = toNum(value);

        if (n > 0) return n;
      }

      return 0;
    };

    const isYes = (value) => {
      if (value === true || value === 1 || value === "1") {
        return true;
      }

      if (typeof value === "string") {
        const v = value.trim().toLowerCase();

        return ["true", "yes", "y", "t"].includes(v);
      }

      return false;
    };

    const isSameAmount = (a, b) =>
      Math.abs(round2(toNum(a)) - round2(toNum(b))) < 0.01;

    const isLiveChecked = (row = {}) => {
      const hasLiveIsChecked =
        row?.isChecked !== undefined &&
        row?.isChecked !== null &&
        row?.isChecked !== "";

      return hasLiveIsChecked
        ? isYes(row?.isChecked)
        : isYes(row?.ispreChecked);
    };

    const isApplicable = isYes(newState?.isApplicable);

    const isVoucher8Applicable = voucherTypeId === "8" && isApplicable;

    const isTdsApplicable = isYes(newState?.tdsApplicable);

    if (allocVoucherTypeRef.current !== voucherTypeId) {
      allocVoucherTypeRef.current = voucherTypeId;
      allocPrevRef.current = "";
      allocInternalUpdateRef.current = false;
      allocHydrateRef.current = true;
      allocParentLedgerSnapshotRef.current = "";
      allocTdsEditSnapshotRef.current = {};
      allocApplicableAmtRecRef.current = {
        key: "",
        amtRec: "",
        amtRecFC: "",
      };
    }

    const sameAsVoucherType8 = ["8", "11", "12"].includes(voucherTypeId);
    const isDebitMinusCreditPlusVoucher = sameAsVoucherType8;

    const shouldFullAllocateForVoucher8 =
      voucherTypeId === "8" && !isApplicable;

    const shouldFullAllocateOutstandingForVoucher12 =
      voucherTypeId === "12" || isVoucher8Applicable;

    const shouldUseAbsBalanceForTds = sameAsVoucherType8;
    const shouldCalculateTdsWithoutReceivedAmount = sameAsVoucherType8;
    const shouldUseType8ChildRowTds = sameAsVoucherType8;

    const getRowCurrencyId = (row = {}) =>
      row?.currencyId ?? row?.currencyID ?? row?.currency ?? null;

    const getVoucherCurrencyId = () =>
      newState?.currencyId ??
      newState?.currencyID ??
      newState?.currency ??
      newState?.homeCurrencyId ??
      newState?.homeCurrency ??
      null;

    const getRowExchangeRate = (row = {}) => {
      const rate = toNum(row?.exchangeRate ?? newState?.exchangeRate ?? 1);

      return rate > 0 ? rate : 1;
    };

    const isForeignCurrencyRow = (row = {}) => {
      const voucherCurrencyId = getVoucherCurrencyId();
      const rowCurrencyId = getRowCurrencyId(row);

      if (
        voucherCurrencyId === null ||
        voucherCurrencyId === undefined ||
        voucherCurrencyId === "" ||
        rowCurrencyId === null ||
        rowCurrencyId === undefined ||
        rowCurrencyId === ""
      ) {
        return false;
      }

      return String(voucherCurrencyId) !== String(rowCurrencyId);
    };

    const getConvertedTdsFCFromHC = (row = {}, hcValue) => {
      if (!isForeignCurrencyRow(row)) {
        return round2(toNum(hcValue));
      }

      const rate = getRowExchangeRate(row);

      return rate > 0 ? round2(toNum(hcValue) / rate) : round2(toNum(hcValue));
    };

    const getConvertedTdsHCFromFC = (row = {}, fcValue) => {
      if (!isForeignCurrencyRow(row)) {
        return round2(toNum(fcValue));
      }

      return round2(toNum(fcValue) * getRowExchangeRate(row));
    };

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
      if (hasValue(originalValue)) {
        return round2(toNum(originalValue));
      }

      const logical = stateToLogic(debitValue, creditValue);

      return round2(toNum(balanceValue) + logical.credit - logical.debit);
    };

    const hasHCAmount = (row) =>
      toNum(row?.debitAmount) > 0 || toNum(row?.creditAmount) > 0;

    const hasFCAmount = (row) =>
      toNum(row?.debitAmountFc) > 0 || toNum(row?.creditAmountFc) > 0;

    const getRowOrigBalHC = (row) => {
      const hasLoadedAllocation =
        !!row?.ispreChecked ||
        toNum(row?.allocatedAmtHC) > 0 ||
        toNum(row?.allocatedAmtHc) > 0 ||
        toNum(row?.allocatedAmountHC) > 0 ||
        toNum(row?.allocatedAmountHc) > 0 ||
        toNum(row?.debitAmount) > 0 ||
        toNum(row?.creditAmount) > 0;

      if (hasLoadedAllocation) {
        return normalizeOriginalBalance({
          originalValue: row?.__origBalHC,
          balanceValue:
            row?.balanceAmount ??
            row?.balanceAmtHC ??
            row?.balanceAmtHc ??
            row?.balanceAmt,
          creditValue: row?.creditAmount,
          debitValue: row?.debitAmount,
        });
      }

      const stableOriginal = firstAvailableNumber(
        row?.OsAmtHC,
        row?.osAmtHC,
        row?.osAmtHc,
        row?.osAmountHC,
        row?.osAmountHc,
        row?.balanceAmtHC,
        row?.balanceAmtHc,
        row?.balanceAmt,
        row?.balanceAmount,
      );

      if (stableOriginal !== null) {
        return stableOriginal;
      }

      return normalizeOriginalBalance({
        originalValue: row?.__origBalHC,
        balanceValue: row?.balanceAmount,
        creditValue: row?.creditAmount,
        debitValue: row?.debitAmount,
      });
    };

    const getRowOrigBalFC = (row) => {
      const hasLoadedAllocation =
        !!row?.ispreChecked ||
        toNum(row?.allocatedAmtFC) > 0 ||
        toNum(row?.allocatedAmtFc) > 0 ||
        toNum(row?.allocatedAmountFC) > 0 ||
        toNum(row?.allocatedAmountFc) > 0 ||
        toNum(row?.debitAmountFc) > 0 ||
        toNum(row?.creditAmountFc) > 0;

      if (hasLoadedAllocation) {
        return normalizeOriginalBalance({
          originalValue: row?.__origBalFC,
          balanceValue:
            row?.balanceAmountFc ??
            row?.balanceAmtFC ??
            row?.balanceAmtFc ??
            row?.balanceAmtFC,
          creditValue: row?.creditAmountFc,
          debitValue: row?.debitAmountFc,
        });
      }

      const stableOriginal = firstAvailableNumber(
        row?.OsAmtFC,
        row?.osAmtFC,
        row?.osAmtFc,
        row?.osAmountFC,
        row?.osAmountFc,
        row?.balanceAmtFC,
        row?.balanceAmtFc,
        row?.balanceAmountFc,
      );

      if (stableOriginal !== null) {
        return stableOriginal;
      }

      return normalizeOriginalBalance({
        originalValue: row?.__origBalFC,
        balanceValue: row?.balanceAmountFc,
        creditValue: row?.creditAmountFc,
        debitValue: row?.debitAmountFc,
      });
    };

    const isAutoFullAllocationHC = (row) => {
      if (!shouldFullAllocateOutstandingForVoucher12) {
        return false;
      }

      const logical = stateToLogic(row?.debitAmount, row?.creditAmount);
      const origBalHC = getRowOrigBalHC(row);

      if (origBalHC > 0) {
        return (
          isSameAmount(logical.credit, origBalHC) &&
          isSameAmount(logical.debit, 0)
        );
      }

      if (origBalHC < 0) {
        return (
          isSameAmount(logical.debit, Math.abs(origBalHC)) &&
          isSameAmount(logical.credit, 0)
        );
      }

      return false;
    };

    const isAutoFullAllocationFC = (row) => {
      if (!shouldFullAllocateOutstandingForVoucher12) {
        return false;
      }

      const logical = stateToLogic(row?.debitAmountFc, row?.creditAmountFc);
      const origBalFC = getRowOrigBalFC(row);

      if (origBalFC > 0) {
        return (
          isSameAmount(logical.credit, origBalFC) &&
          isSameAmount(logical.debit, 0)
        );
      }

      if (origBalFC < 0) {
        return (
          isSameAmount(logical.debit, Math.abs(origBalFC)) &&
          isSameAmount(logical.credit, 0)
        );
      }

      return false;
    };

    const getManualDetailAlloc = (row) => {
      const checked = isLiveChecked(row);

      return {
        hc:
          !!row?.__manualAllocHC ||
          (checked && hasHCAmount(row) && !isAutoFullAllocationHC(row)),

        fc:
          !!row?.__manualAllocFC ||
          (checked && hasFCAmount(row) && !isAutoFullAllocationFC(row)),
      };
    };

    const getManualLedgerTds = (ledger) => {
      if (shouldUseType8ChildRowTds) {
        return {
          hc: 0,
          fc: 0,
        };
      }

      return {
        hc: isTdsApplicable
          ? round2(toNum(ledger?.tdsAmtHC ?? ledger?.tdsAmount ?? 0))
          : 0,
        fc: isTdsApplicable
          ? round2(toNum(ledger?.tdsAmtFC ?? ledger?.tdsAmountFc ?? 0))
          : 0,
      };
    };

    const getTdsBaseAmount = (row, balanceValue, isFC = false) => {
      const safeBalance = clamp0(balanceValue);

      const invoiceValue = clamp0(
        firstPositiveNum(
          ...(isFC
            ? [
                row?.invoiceAmountFc,
                row?.invoiceAmountFC,
                row?.billAmountFc,
                row?.billAmountFC,
                row?.invoiceAmount,
                row?.billAmount,
              ]
            : [row?.invoiceAmount, row?.billAmount]),
        ),
      );

      if (invoiceValue > 0) {
        return round2(Math.min(safeBalance, invoiceValue));
      }

      return safeBalance;
    };

    const getTdsBaseHC = (row) =>
      getTdsBaseAmount(
        row,
        shouldUseAbsBalanceForTds
          ? Math.abs(getRowOrigBalHC(row))
          : getRowOrigBalHC(row),
        false,
      );

    const getTdsBaseFC = (row) =>
      getTdsBaseAmount(
        row,
        shouldUseAbsBalanceForTds
          ? Math.abs(getRowOrigBalFC(row))
          : getRowOrigBalFC(row),
        true,
      );

    const calcRowTdsPair = (row, isChecked, tdsEditDirection = "") => {
      const isRowTdsApplicable = isTdsApplicable && isYes(row?.isTds);

      if (!isChecked || !isRowTdsApplicable) {
        return {
          hc: 0,
          fc: 0,
          manualHC: false,
          manualFC: false,
        };
      }

      const currentHC = round2(toNum(row?.tdsAmount ?? row?.tdsAmtHC));
      const currentFC = round2(toNum(row?.tdsAmountFc ?? row?.tdsAmtFC));

      if (tdsEditDirection === "HC_TO_FC") {
        return {
          hc: currentHC,
          fc: getConvertedTdsFCFromHC(row, currentHC),
          manualHC: true,
          manualFC: true,
        };
      }

      if (tdsEditDirection === "FC_TO_HC") {
        return {
          hc: getConvertedTdsHCFromFC(row, currentFC),
          fc: currentFC,
          manualHC: true,
          manualFC: true,
        };
      }

      if (tdsEditDirection === "MANUAL_BOTH") {
        return {
          hc: currentHC,
          fc: currentFC,
          manualHC: true,
          manualFC: true,
        };
      }

      const hasManualTdsHC = isYes(row?.__manualTdsHC);
      const hasManualTdsFC = isYes(row?.__manualTdsFC);

      if (hasManualTdsHC && !hasManualTdsFC) {
        return {
          hc: currentHC,
          fc: getConvertedTdsFCFromHC(row, currentHC),
          manualHC: true,
          manualFC: true,
        };
      }

      if (hasManualTdsFC && !hasManualTdsHC) {
        return {
          hc: getConvertedTdsHCFromFC(row, currentFC),
          fc: currentFC,
          manualHC: true,
          manualFC: true,
        };
      }

      if (hasManualTdsHC && hasManualTdsFC) {
        return {
          hc: currentHC,
          fc: currentFC,
          manualHC: true,
          manualFC: true,
        };
      }

      if (shouldCalculateTdsWithoutReceivedAmount) {
        const baseHC = getTdsBaseHC(row);
        const baseFC = getTdsBaseFC(row);

        return {
          hc: baseHC > 0 ? round2(baseHC * TDS_RATE) : 0,
          fc: baseFC > 0 ? round2(baseFC * TDS_RATE) : 0,
          manualHC: false,
          manualFC: false,
        };
      }

      if (currentHC > 0 || currentFC > 0) {
        if (currentHC > 0 && currentFC > 0) {
          return {
            hc: currentHC,
            fc: currentFC,
            manualHC: false,
            manualFC: false,
          };
        }

        if (currentHC > 0) {
          return {
            hc: currentHC,
            fc: getConvertedTdsFCFromHC(row, currentHC),
            manualHC: false,
            manualFC: false,
          };
        }

        return {
          hc: getConvertedTdsHCFromFC(row, currentFC),
          fc: currentFC,
          manualHC: false,
          manualFC: false,
        };
      }

      const baseHC = getTdsBaseHC(row);
      const baseFC = getTdsBaseFC(row);

      return {
        hc: baseHC > 0 ? round2(baseHC * TDS_RATE) : 0,
        fc: baseFC > 0 ? round2(baseFC * TDS_RATE) : 0,
        manualHC: false,
        manualFC: false,
      };
    };

    const getLedgerKey = (ledger, index) =>
      String(
        ledger?.id ??
          ledger?.glVoucherLedgerId ??
          ledger?.voucherLedgerId ??
          ledger?.glId ??
          index,
      );

    const getDetailKey = (row, index) =>
      String(
        row?.id ??
          row?.voucherOutstandingId ??
          row?.voucherNo ??
          row?.invoiceNo ??
          index,
      );

    const hasParentLedgerAmount = (ledger) =>
      toNum(ledger?.debitAmount) > 0 ||
      toNum(ledger?.creditAmount) > 0 ||
      toNum(ledger?.debitAmountFc) > 0 ||
      toNum(ledger?.creditAmountFc) > 0;

    const getCheckedExtraLedgerAmount = (ledgerRows = [], isFC = false) => {
      return round2(
        (Array.isArray(ledgerRows) ? ledgerRows : []).reduce((acc, ledger) => {
          const details = Array.isArray(ledger?.tblVoucherLedgerDetails)
            ? ledger.tblVoucherLedgerDetails
            : [];

          if (!isYes(ledger?.isChecked) || details.length > 0) {
            return acc;
          }

          const debitValue = isFC ? ledger?.debitAmountFc : ledger?.debitAmount;

          const creditValue = isFC
            ? ledger?.creditAmountFc
            : ledger?.creditAmount;

          return acc + Math.abs(round2(toNum(debitValue) - toNum(creditValue)));
        }, 0),
      );
    };

    const hasCheckedThirdLevelRows = (ledger) => {
      const details = Array.isArray(ledger?.tblVoucherLedgerDetails)
        ? ledger.tblVoucherLedgerDetails
        : [];

      return details.some((row) => isLiveChecked(row));
    };

    const getParentOnlyLedgerSnapshot = (ledgerRows) =>
      JSON.stringify(
        (Array.isArray(ledgerRows) ? ledgerRows : [])
          .map((ledger, ledgerIndex) => {
            const hasCheckedThirdLevel = hasCheckedThirdLevelRows(ledger);

            if (hasCheckedThirdLevel) {
              return null;
            }

            return {
              k: getLedgerKey(ledger, ledgerIndex),
              checked: isYes(ledger?.isChecked),
              d: asStr2(ledger?.debitAmount),
              df: asStr2(ledger?.debitAmountFc),
              cr: asStr2(ledger?.creditAmount),
              crf: asStr2(ledger?.creditAmountFc),
              th: asStr2(ledger?.tdsAmtHC ?? ledger?.tdsAmount),
              tf: asStr2(ledger?.tdsAmtFC ?? ledger?.tdsAmountFc),
            };
          })
          .filter(Boolean),
      );

    const getSignedDisplayDelta = (debitValue, creditValue) =>
      round2(toNum(debitValue) - toNum(creditValue));

    const getEffectiveDisplayTotals = (ledgerRows) => {
      return ledgerRows.reduce(
        (acc, ledger) => {
          const details = Array.isArray(ledger?.tblVoucherLedgerDetails)
            ? ledger.tblVoucherLedgerDetails
            : [];

          const useDetails =
            details.length &&
            (isYes(ledger?.isChildChecked) ||
              details.some(
                (row) =>
                  isLiveChecked(row) || hasHCAmount(row) || hasFCAmount(row),
              ));

          if (useDetails) {
            details.forEach((row) => {
              acc.hc = round2(
                acc.hc +
                  getSignedDisplayDelta(row?.debitAmount, row?.creditAmount),
              );

              acc.fc = round2(
                acc.fc +
                  getSignedDisplayDelta(
                    row?.debitAmountFc,
                    row?.creditAmountFc,
                  ),
              );
            });
          } else {
            acc.hc = round2(
              acc.hc +
                getSignedDisplayDelta(
                  ledger?.debitAmount,
                  ledger?.creditAmount,
                ),
            );

            acc.fc = round2(
              acc.fc +
                getSignedDisplayDelta(
                  ledger?.debitAmountFc,
                  ledger?.creditAmountFc,
                ),
            );
          }

          return acc;
        },
        {
          hc: 0,
          fc: 0,
        },
      );
    };

    const getCreditMinusDebitTotals = (ledgerRows) => {
      return ledgerRows.reduce(
        (acc, ledger) => {
          const details = Array.isArray(ledger?.tblVoucherLedgerDetails)
            ? ledger.tblVoucherLedgerDetails
            : [];

          const useDetails =
            details.length &&
            (isYes(ledger?.isChildChecked) ||
              details.some(
                (row) =>
                  isLiveChecked(row) || hasHCAmount(row) || hasFCAmount(row),
              ));

          const rows = useDetails ? details : [ledger];

          rows.forEach((row) => {
            acc.hc = round2(
              acc.hc + toNum(row?.creditAmount) - toNum(row?.debitAmount),
            );

            acc.fc = round2(
              acc.fc + toNum(row?.creditAmountFc) - toNum(row?.debitAmountFc),
            );
          });

          return acc;
        },
        {
          hc: 0,
          fc: 0,
        },
      );
    };

    const makeSnapshot = (
      ledgerRows,
      balanceAmtHc,
      balanceAmtFc,
      tdsAmt,
      tdsAmtFC,
    ) =>
      JSON.stringify({
        base: {
          amtRec: asStr2(newState?.amtRec),
          amtRecFC: asStr2(newState?.amtRecFC),
          bankCharges: asStr2(newState?.bcAmt ?? newState?.bankCharges),
          bankChargesFc: asStr2(
            newState?.bankChargesFC ?? newState?.bankChargesFc,
          ),
          exGainLoss: asStr2(newState?.exGainLoss),
          currencyId: String(newState?.currencyId ?? ""),
          exchangeRate: asStr2(newState?.exchangeRate),
          isApplicable: String(isApplicable),
        },
        balanceAmtHc: asStr2(balanceAmtHc),
        balanceAmtFc: asStr2(balanceAmtFc),
        tdsAmt: asStr2(tdsAmt),
        tdsAmtFC: asStr2(tdsAmtFC),
        ledgers: ledgerRows.map((ledger, ledgerIndex) => ({
          k: getLedgerKey(ledger, ledgerIndex),
          d: asStr2(ledger?.debitAmount),
          df: asStr2(ledger?.debitAmountFc),
          cr: asStr2(ledger?.creditAmount),
          crf: asStr2(ledger?.creditAmountFc),
          th: asStr2(ledger?.tdsAmtHC ?? ledger?.tdsAmount),
          tf: asStr2(ledger?.tdsAmtFC ?? ledger?.tdsAmountFc),
          details: (ledger?.tblVoucherLedgerDetails || []).map(
            (row, rowIndex) => ({
              k: getDetailKey(row, rowIndex),
              checked: isLiveChecked(row),
              liveChecked: isYes(row?.isChecked),
              pre: isYes(row?.ispreChecked),
              isTds: isYes(row?.isTds),
              d: asStr2(row?.debitAmount),
              df: asStr2(row?.debitAmountFc),
              cr: asStr2(row?.creditAmount),
              crf: asStr2(row?.creditAmountFc),
              bh: asStr2(row?.balanceAmount ?? row?.balanceAmtHC),
              bf: asStr2(row?.balanceAmountFc ?? row?.balanceAmtFC),
              th: asStr2(row?.tdsAmtHC ?? row?.tdsAmount),
              tf: asStr2(row?.tdsAmtFC ?? row?.tdsAmountFc),
            }),
          ),
        })),
      });

    const makeTdsEditSnapshot = (ledgerRows) => {
      const snap = {};

      (Array.isArray(ledgerRows) ? ledgerRows : []).forEach(
        (ledger, ledgerIndex) => {
          const details = Array.isArray(ledger?.tblVoucherLedgerDetails)
            ? ledger.tblVoucherLedgerDetails
            : [];

          details.forEach((row, rowIndex) => {
            const key = `${getLedgerKey(ledger, ledgerIndex)}__${getDetailKey(
              row,
              rowIndex,
            )}`;

            snap[key] = {
              tdsAmount: asStr2(row?.tdsAmount ?? row?.tdsAmtHC),
              tdsAmountFc: asStr2(row?.tdsAmountFc ?? row?.tdsAmtFC),
            };
          });
        },
      );

      return snap;
    };

    const getTdsEditDirection = (editKey, row = {}) => {
      const prev = allocTdsEditSnapshotRef.current?.[editKey];

      if (!prev) return "";

      const hcChanged = !isSameAmount(
        prev.tdsAmount,
        row?.tdsAmount ?? row?.tdsAmtHC,
      );

      const fcChanged = !isSameAmount(
        prev.tdsAmountFc,
        row?.tdsAmountFc ?? row?.tdsAmtFC,
      );

      if (hcChanged && fcChanged) {
        return "MANUAL_BOTH";
      }

      if (hcChanged) {
        return "HC_TO_FC";
      }

      if (fcChanged) {
        return "FC_TO_HC";
      }

      return "";
    };

    const hasLedgers =
      Array.isArray(newState?.tblVoucherLedger) &&
      newState.tblVoucherLedger.length > 0;

    const ledgers = hasLedgers
      ? [...newState.tblVoucherLedger]
      : [
          {
            __virtual: true,

            tblVoucherLedgerDetails: Array.isArray(
              newState?.tblVoucherLedgerDetails,
            )
              ? newState.tblVoucherLedgerDetails
              : [],
          },
        ];

    const allDetails = ledgers.flatMap((ledger) =>
      Array.isArray(ledger?.tblVoucherLedgerDetails)
        ? ledger.tblVoucherLedgerDetails
        : [],
    );

    const baseBalanceHC = round2(
      toNum(newState?.amtRec ?? 0) +
        toNum(newState?.bcAmt ?? newState?.bankCharges ?? 0) +
        toNum(newState?.exGainLoss ?? 0),
    );

    const baseBalanceFC = round2(
      toNum(newState?.amtRecFC ?? 0) +
        toNum(newState?.bankChargesFC ?? newState?.bankChargesFc ?? 0),
    );

    if (shouldUseType8ChildRowTds && !allDetails.length && !hasLedgers) {
      const nextBalanceAmtHc = asStr2(clamp0(baseBalanceHC));
      const nextBalanceAmtFc = asStr2(clamp0(baseBalanceFC));

      const alreadyClean =
        asStr2(newState?.balanceAmtHc ?? newState?.balanceAmt) ===
          nextBalanceAmtHc &&
        asStr2(newState?.balanceAmtFc ?? newState?.balanceAmtFC) ===
          nextBalanceAmtFc &&
        round2(toNum(newState?.tdsAmt ?? newState?.tdsAmount)) === 0 &&
        round2(toNum(newState?.tdsAmtFC ?? newState?.tdsAmountFc)) === 0;

      allocPrevRef.current = "";
      allocParentLedgerSnapshotRef.current = "";
      allocTdsEditSnapshotRef.current = {};

      if (alreadyClean) {
        return;
      }

      allocInternalUpdateRef.current = true;

      const cleanedValues = {
        balanceAmtHc: nextBalanceAmtHc,
        balanceAmtFc: nextBalanceAmtFc,
        balanceAmt: nextBalanceAmtHc,
        balanceAmtFC: nextBalanceAmtFc,
        tdsAmt: 0,
        tdsAmtFC: 0,
        tdsAmount: 0,
        tdsAmountFc: 0,
      };

      setNewState((prevState) => ({
        ...prevState,
        ...cleanedValues,
      }));

      setSubmitNewState((prevState) => ({
        ...prevState,
        ...cleanedValues,
      }));

      return;
    }

    const getVoucher8CheckedPositiveOutstandingTotals = (ledgerRows = []) => {
      if (!shouldFullAllocateForVoucher8) {
        return {
          hc: 0,
          fc: 0,
        };
      }

      return (Array.isArray(ledgerRows) ? ledgerRows : []).reduce(
        (acc, ledger) => {
          const details = Array.isArray(ledger?.tblVoucherLedgerDetails)
            ? ledger.tblVoucherLedgerDetails
            : [];

          details.forEach((row) => {
            if (!isLiveChecked(row)) {
              return;
            }

            const origBalHC = getRowOrigBalHC(row);
            const origBalFC = getRowOrigBalFC(row);

            if (origBalHC > 0) {
              acc.hc = round2(acc.hc + origBalHC);
            }

            if (origBalFC > 0) {
              acc.fc = round2(acc.fc + origBalFC);
            }
          });

          return acc;
        },
        {
          hc: 0,
          fc: 0,
        },
      );
    };

    const voucher8PositiveOutstandingTotals =
      getVoucher8CheckedPositiveOutstandingTotals(ledgers);

    let remainingHC = shouldFullAllocateForVoucher8
      ? round2(baseBalanceHC + voucher8PositiveOutstandingTotals.hc)
      : baseBalanceHC;

    let remainingFC = shouldFullAllocateForVoucher8
      ? round2(baseBalanceFC + voucher8PositiveOutstandingTotals.fc)
      : baseBalanceFC;

    let nextLedgers = ledgers.map((ledger, ledgerIndex) => {
      const details = Array.isArray(ledger?.tblVoucherLedgerDetails)
        ? ledger.tblVoucherLedgerDetails
        : [];

      if (!details.length) {
        const manualHC = stateToLogic(
          ledger?.debitAmount,
          ledger?.creditAmount,
        );

        const manualFC = stateToLogic(
          ledger?.debitAmountFc,
          ledger?.creditAmountFc,
        );

        const manualLedgerTds = getManualLedgerTds(ledger);

        remainingHC = round2(remainingHC + manualHC.debit - manualHC.credit);
        remainingFC = round2(remainingFC + manualFC.debit - manualFC.credit);

        return {
          ...ledger,
          isChildChecked: false,
          tdsAmtHC: manualLedgerTds.hc,
          tdsAmtFC: manualLedgerTds.fc,
          tdsAmount: manualLedgerTds.hc,
          tdsAmountFc: manualLedgerTds.fc,
        };
      }

      const nextDetails = details.map((row, rowIndex) => {
        const isChecked = isLiveChecked(row);

        const editKey = `${getLedgerKey(ledger, ledgerIndex)}__${getDetailKey(
          row,
          rowIndex,
        )}`;

        const tdsEditDirection = getTdsEditDirection(editKey, row);

        const origBalHC = getRowOrigBalHC(row);
        const origBalFC = getRowOrigBalFC(row);

        if (!isChecked) {
          return {
            ...row,
            debitAmount: "0.00",
            creditAmount: "0.00",
            debitAmountFc: "0.00",
            creditAmountFc: "0.00",
            allocatedAmtHC: null,
            allocatedAmtFC: null,
            balanceAmtHC: asNum2(origBalHC),
            balanceAmtFC: asNum2(origBalFC),
            balanceAmount: asNum2(origBalHC),
            balanceAmountFc: asNum2(origBalFC),
            tdsAmtHC: null,
            tdsAmtFC: null,
            tdsAmount: 0,
            tdsAmountFc: 0,
            __origBalHC: origBalHC,
            __origBalFC: origBalFC,
            __manualAllocHC: false,
            __manualAllocFC: false,
            __manualTdsHC: false,
            __manualTdsFC: false,
          };
        }

        const manual = getManualDetailAlloc(row);

        const isRowTdsApplicable = isTdsApplicable && isYes(row?.isTds);

        const rowTdsPair = calcRowTdsPair(row, true, tdsEditDirection);

        const shouldRecalculateAllocationFromManualTds =
          isRowTdsApplicable &&
          rowTdsPair.manualHC &&
          rowTdsPair.manualFC &&
          tdsEditDirection !== "";

        const manualAllocHC =
          manual.hc && !shouldRecalculateAllocationFromManualTds;

        const manualAllocFC =
          manual.fc && !shouldRecalculateAllocationFromManualTds;

        const shouldForceFullCreditForVoucher8HC =
          shouldFullAllocateForVoucher8 &&
          isChecked &&
          origBalHC > 0 &&
          !manualAllocHC &&
          !shouldRecalculateAllocationFromManualTds;

        const shouldForceFullCreditForVoucher8FC =
          shouldFullAllocateForVoucher8 &&
          isChecked &&
          origBalFC > 0 &&
          !manualAllocFC &&
          !shouldRecalculateAllocationFromManualTds;

        const shouldForceFullDebitForVoucher8HC =
          shouldFullAllocateForVoucher8 &&
          isChecked &&
          origBalHC < 0 &&
          !manualAllocHC &&
          !shouldRecalculateAllocationFromManualTds;

        const shouldForceFullDebitForVoucher8FC =
          shouldFullAllocateForVoucher8 &&
          isChecked &&
          origBalFC < 0 &&
          !manualAllocFC &&
          !shouldRecalculateAllocationFromManualTds;

        let nextDebitHC = 0;
        let nextCreditHC = 0;
        let nextDebitFC = 0;
        let nextCreditFC = 0;

        if (manualAllocHC) {
          const logicalHC = stateToLogic(row?.debitAmount, row?.creditAmount);

          nextDebitHC = logicalHC.debit;
          nextCreditHC = logicalHC.credit;
        } else if (shouldFullAllocateOutstandingForVoucher12 && origBalHC > 0) {
          nextDebitHC = 0;
          nextCreditHC = clamp0(origBalHC);
        } else if (shouldFullAllocateOutstandingForVoucher12 && origBalHC < 0) {
          nextDebitHC = clamp0(Math.abs(origBalHC));
          nextCreditHC = 0;
        } else if (shouldForceFullCreditForVoucher8HC) {
          nextDebitHC = 0;
          nextCreditHC = clamp0(origBalHC);
        } else if (shouldForceFullDebitForVoucher8HC) {
          nextDebitHC = clamp0(Math.abs(origBalHC));
          nextCreditHC = 0;
        } else {
          const isNegativeRow = origBalHC < 0;

          const availableHC = clamp0(
            remainingHC +
              (isRowTdsApplicable && !shouldUseType8ChildRowTds
                ? rowTdsPair.hc
                : 0),
          );

          const allocHC = Math.min(Math.abs(origBalHC), availableHC);

          if (isNegativeRow) {
            nextDebitHC = allocHC;
          } else {
            nextCreditHC = allocHC;
          }
        }

        if (manualAllocFC) {
          const logicalFC = stateToLogic(
            row?.debitAmountFc,
            row?.creditAmountFc,
          );

          nextDebitFC = logicalFC.debit;
          nextCreditFC = logicalFC.credit;
        } else if (shouldFullAllocateOutstandingForVoucher12 && origBalFC > 0) {
          nextDebitFC = 0;
          nextCreditFC = clamp0(origBalFC);
        } else if (shouldFullAllocateOutstandingForVoucher12 && origBalFC < 0) {
          nextDebitFC = clamp0(Math.abs(origBalFC));
          nextCreditFC = 0;
        } else if (shouldForceFullCreditForVoucher8FC) {
          nextDebitFC = 0;
          nextCreditFC = clamp0(origBalFC);
        } else if (shouldForceFullDebitForVoucher8FC) {
          nextDebitFC = clamp0(Math.abs(origBalFC));
          nextCreditFC = 0;
        } else {
          const isNegativeRowFC = origBalFC < 0;

          const availableFC = clamp0(
            remainingFC +
              (isRowTdsApplicable && !shouldUseType8ChildRowTds
                ? rowTdsPair.fc
                : 0),
          );

          const allocFC = Math.min(Math.abs(origBalFC), availableFC);

          if (isNegativeRowFC) {
            nextDebitFC = allocFC;
          } else {
            nextCreditFC = allocFC;
          }
        }

        const nextTdsHC = rowTdsPair.hc;
        const nextTdsFC = rowTdsPair.fc;

        const rowDisplayHC = round2(nextDebitHC - nextCreditHC);
        const rowDisplayFC = round2(nextDebitFC - nextCreditFC);

        const rowAllocatedHC = round2(toNum(nextDebitHC) + toNum(nextCreditHC));
        const rowAllocatedFC = round2(toNum(nextDebitFC) + toNum(nextCreditFC));

        if (isDebitMinusCreditPlusVoucher) {
          remainingHC = round2(remainingHC - rowAllocatedHC);
          remainingFC = round2(remainingFC - rowAllocatedFC);
        } else {
          remainingHC = round2(
            remainingHC + rowDisplayHC + (isRowTdsApplicable ? nextTdsHC : 0),
          );

          remainingFC = round2(
            remainingFC + rowDisplayFC + (isRowTdsApplicable ? nextTdsFC : 0),
          );
        }

        const nextBalanceHC = isDebitMinusCreditPlusVoucher
          ? origBalHC < 0
            ? round2(origBalHC + nextDebitHC - nextCreditHC)
            : round2(origBalHC - nextCreditHC + nextDebitHC)
          : clamp0(origBalHC + rowDisplayHC);

        const nextBalanceFC = isDebitMinusCreditPlusVoucher
          ? origBalFC < 0
            ? round2(origBalFC + nextDebitFC - nextCreditFC)
            : round2(origBalFC - nextCreditFC + nextDebitFC)
          : clamp0(origBalFC + rowDisplayFC);

        return {
          ...row,
          ...logicToStateHC(nextDebitHC, nextCreditHC),
          ...logicToStateFC(nextDebitFC, nextCreditFC),

          allocatedAmtHC: round2(Math.abs(nextDebitHC || nextCreditHC)),
          allocatedAmtFC: round2(Math.abs(nextDebitFC || nextCreditFC)),

          balanceAmtHC: asNum2(nextBalanceHC),
          balanceAmtFC: asNum2(nextBalanceFC),
          balanceAmount: asNum2(nextBalanceHC),
          balanceAmountFc: asNum2(nextBalanceFC),

          tdsAmtHC: nextTdsHC,
          tdsAmtFC: nextTdsFC,
          tdsAmount: nextTdsHC,
          tdsAmountFc: nextTdsFC,

          __origBalHC: origBalHC,
          __origBalFC: origBalFC,

          __manualAllocHC: manualAllocHC,

          __manualAllocFC: manualAllocFC,

          __manualTdsHC: rowTdsPair.manualHC,
          __manualTdsFC: rowTdsPair.manualFC,
        };
      });

      const nextIsChildChecked = nextDetails.some((row) => isLiveChecked(row));

      const wasChildChecked =
        isYes(ledger?.isChildChecked) ||
        details.some((row) => isYes(row?.ispreChecked));

      const isClearingLastChildSelection =
        details.length > 0 && wasChildChecked && !nextIsChildChecked;

      const shouldUseParentLedgerAmount =
        !nextIsChildChecked &&
        !isClearingLastChildSelection &&
        (isYes(ledger?.isChecked) || hasParentLedgerAmount(ledger));

      const nextDebitHC = nextIsChildChecked
        ? round2(
            nextDetails.reduce((acc, row) => acc + toNum(row?.debitAmount), 0),
          )
        : shouldUseParentLedgerAmount
          ? round2(toNum(ledger?.debitAmount))
          : 0;

      const nextCreditHC = nextIsChildChecked
        ? round2(
            nextDetails.reduce((acc, row) => acc + toNum(row?.creditAmount), 0),
          )
        : shouldUseParentLedgerAmount
          ? round2(toNum(ledger?.creditAmount))
          : 0;

      const nextDebitFC = nextIsChildChecked
        ? round2(
            nextDetails.reduce(
              (acc, row) => acc + toNum(row?.debitAmountFc),
              0,
            ),
          )
        : shouldUseParentLedgerAmount
          ? round2(toNum(ledger?.debitAmountFc))
          : 0;

      const nextCreditFC = nextIsChildChecked
        ? round2(
            nextDetails.reduce(
              (acc, row) => acc + toNum(row?.creditAmountFc),
              0,
            ),
          )
        : shouldUseParentLedgerAmount
          ? round2(toNum(ledger?.creditAmountFc))
          : 0;

      const childLedgerTdsHC = round2(
        nextDetails.reduce(
          (acc, row) => acc + toNum(row?.tdsAmtHC ?? row?.tdsAmount),
          0,
        ),
      );

      const childLedgerTdsFC = round2(
        nextDetails.reduce(
          (acc, row) => acc + toNum(row?.tdsAmtFC ?? row?.tdsAmountFc),
          0,
        ),
      );

      const manualLedgerTds = getManualLedgerTds(ledger);

      const nextLedgerTdsHC = nextIsChildChecked
        ? childLedgerTdsHC
        : manualLedgerTds.hc;

      const nextLedgerTdsFC = nextIsChildChecked
        ? childLedgerTdsFC
        : manualLedgerTds.fc;

      return {
        ...ledger,

        tblVoucherLedgerDetails: nextDetails,

        isChecked: isClearingLastChildSelection ? false : ledger?.isChecked,

        isChildChecked: nextIsChildChecked,

        debitAmount: asStr2(nextDebitHC),
        creditAmount: asStr2(nextCreditHC),
        debitAmountFc: asStr2(nextDebitFC),
        creditAmountFc: asStr2(nextCreditFC),

        tdsAmtHC: nextLedgerTdsHC,
        tdsAmtFC: nextLedgerTdsFC,
        tdsAmount: nextLedgerTdsHC,
        tdsAmountFc: nextLedgerTdsFC,
      };
    });

    const adjustSmallPendingChildBalanceFromRootBalance = (ledgerRows = []) => {
      if (!Array.isArray(ledgerRows) || ledgerRows.length === 0) {
        return ledgerRows;
      }

      const preTdsAmtHC = round2(
        ledgerRows.reduce(
          (acc, ledger) => acc + toNum(ledger?.tdsAmtHC ?? ledger?.tdsAmount),
          0,
        ),
      );

      const preTdsAmtFC = round2(
        ledgerRows.reduce(
          (acc, ledger) => acc + toNum(ledger?.tdsAmtFC ?? ledger?.tdsAmountFc),
          0,
        ),
      );

      const preDisplayTotals = getEffectiveDisplayTotals(ledgerRows);

      let availableHC = isDebitMinusCreditPlusVoucher
        ? clamp0(baseBalanceHC - preDisplayTotals.hc)
        : clamp0(
            baseBalanceHC +
              preDisplayTotals.hc +
              (isTdsApplicable ? preTdsAmtHC : 0),
          );

      let availableFC = isDebitMinusCreditPlusVoucher
        ? clamp0(baseBalanceFC - preDisplayTotals.fc)
        : clamp0(
            baseBalanceFC +
              preDisplayTotals.fc +
              (isTdsApplicable ? preTdsAmtFC : 0),
          );

      const extraLedgerAdjustLimitHC = getCheckedExtraLedgerAmount(
        ledgerRows,
        false,
      );

      const extraLedgerAdjustLimitFC = getCheckedExtraLedgerAmount(
        ledgerRows,
        true,
      );

      const childBalanceAdjustLimitHC = Math.max(
        AUTO_CHILD_BALANCE_ADJUST_LIMIT,
        extraLedgerAdjustLimitHC,
      );

      const childBalanceAdjustLimitFC = Math.max(
        AUTO_CHILD_BALANCE_ADJUST_LIMIT,
        extraLedgerAdjustLimitFC,
      );

      if (availableHC <= 0 && availableFC <= 0) {
        return ledgerRows;
      }

      let hasAnyAdjustment = false;

      const adjustedLedgers = ledgerRows.map((ledger) => {
        const details = Array.isArray(ledger?.tblVoucherLedgerDetails)
          ? ledger.tblVoucherLedgerDetails
          : [];

        if (!details.length) {
          return ledger;
        }

        let ledgerChanged = false;

        const adjustedDetails = details.map((row) => {
          if (!isLiveChecked(row)) {
            return row;
          }

          const allowHCAdjust =
            row?.__manualAllocHC === true || isYes(row?.ispreChecked);

          const allowFCAdjust =
            row?.__manualAllocFC === true || isYes(row?.ispreChecked);

          const rawBalanceHC = round2(
            toNum(row?.balanceAmount ?? row?.balanceAmtHC),
          );

          const rawBalanceFC = round2(
            toNum(row?.balanceAmountFc ?? row?.balanceAmtFC),
          );

          let balanceHC = isDebitMinusCreditPlusVoucher
            ? Math.abs(rawBalanceHC)
            : clamp0(rawBalanceHC);

          let balanceFC = isDebitMinusCreditPlusVoucher
            ? Math.abs(rawBalanceFC)
            : clamp0(rawBalanceFC);

          let debitHC = round2(toNum(row?.debitAmount));
          let creditHC = round2(toNum(row?.creditAmount));
          let debitFC = round2(toNum(row?.debitAmountFc));
          let creditFC = round2(toNum(row?.creditAmountFc));

          let adjustedHC = 0;
          let adjustedFC = 0;
          let rowChanged = false;

          if (
            allowHCAdjust &&
            balanceHC > 0 &&
            balanceHC <= childBalanceAdjustLimitHC &&
            availableHC > 0
          ) {
            adjustedHC = round2(Math.min(balanceHC, availableHC));

            if (adjustedHC > 0) {
              const origBalHC = getRowOrigBalHC(row);

              if (origBalHC < 0) {
                debitHC = round2(debitHC + adjustedHC);
              } else {
                creditHC = round2(creditHC + adjustedHC);
              }

              balanceHC = round2(balanceHC - adjustedHC);
              availableHC = round2(availableHC - adjustedHC);
              rowChanged = true;
            }
          }

          if (
            allowFCAdjust &&
            balanceFC > 0 &&
            balanceFC <= childBalanceAdjustLimitFC &&
            availableFC > 0
          ) {
            adjustedFC = round2(Math.min(balanceFC, availableFC));

            if (adjustedFC > 0) {
              const origBalFC = getRowOrigBalFC(row);

              if (origBalFC < 0) {
                debitFC = round2(debitFC + adjustedFC);
              } else {
                creditFC = round2(creditFC + adjustedFC);
              }

              balanceFC = round2(balanceFC - adjustedFC);
              availableFC = round2(availableFC - adjustedFC);
              rowChanged = true;
            }
          }

          if (!rowChanged) {
            return row;
          }

          ledgerChanged = true;
          hasAnyAdjustment = true;

          return {
            ...row,
            ...logicToStateHC(debitHC, creditHC),
            ...logicToStateFC(debitFC, creditFC),

            allocatedAmtHC:
              adjustedHC > 0
                ? round2(toNum(row?.allocatedAmtHC) + adjustedHC)
                : row?.allocatedAmtHC,

            allocatedAmtFC:
              adjustedFC > 0
                ? round2(toNum(row?.allocatedAmtFC) + adjustedFC)
                : row?.allocatedAmtFC,

            balanceAmtHC: 0,
            balanceAmtFC: 0,
            balanceAmount: 0,
            balanceAmountFc: 0,
          };
        });

        if (!ledgerChanged) {
          return ledger;
        }

        const nextIsChildChecked = adjustedDetails.some((row) =>
          isLiveChecked(row),
        );

        const nextDebitHC = nextIsChildChecked
          ? round2(
              adjustedDetails.reduce(
                (acc, row) => acc + toNum(row?.debitAmount),
                0,
              ),
            )
          : round2(toNum(ledger?.debitAmount));

        const nextCreditHC = nextIsChildChecked
          ? round2(
              adjustedDetails.reduce(
                (acc, row) => acc + toNum(row?.creditAmount),
                0,
              ),
            )
          : round2(toNum(ledger?.creditAmount));

        const nextDebitFC = nextIsChildChecked
          ? round2(
              adjustedDetails.reduce(
                (acc, row) => acc + toNum(row?.debitAmountFc),
                0,
              ),
            )
          : round2(toNum(ledger?.debitAmountFc));

        const nextCreditFC = nextIsChildChecked
          ? round2(
              adjustedDetails.reduce(
                (acc, row) => acc + toNum(row?.creditAmountFc),
                0,
              ),
            )
          : round2(toNum(ledger?.creditAmountFc));

        const nextLedgerTdsHC = nextIsChildChecked
          ? round2(
              adjustedDetails.reduce(
                (acc, row) => acc + toNum(row?.tdsAmtHC ?? row?.tdsAmount),
                0,
              ),
            )
          : round2(toNum(ledger?.tdsAmtHC ?? ledger?.tdsAmount));

        const nextLedgerTdsFC = nextIsChildChecked
          ? round2(
              adjustedDetails.reduce(
                (acc, row) => acc + toNum(row?.tdsAmtFC ?? row?.tdsAmountFc),
                0,
              ),
            )
          : round2(toNum(ledger?.tdsAmtFC ?? ledger?.tdsAmountFc));

        return {
          ...ledger,

          tblVoucherLedgerDetails: adjustedDetails,

          isChildChecked: nextIsChildChecked,

          debitAmount: asStr2(nextDebitHC),
          creditAmount: asStr2(nextCreditHC),
          debitAmountFc: asStr2(nextDebitFC),
          creditAmountFc: asStr2(nextCreditFC),

          tdsAmtHC: nextLedgerTdsHC,
          tdsAmtFC: nextLedgerTdsFC,
          tdsAmount: nextLedgerTdsHC,
          tdsAmountFc: nextLedgerTdsFC,
        };
      });

      return hasAnyAdjustment ? adjustedLedgers : ledgerRows;
    };

    const getCapTotals = (ledgerRows = [], isFC = false) => {
      const debitField = isFC ? "debitAmountFc" : "debitAmount";
      const creditField = isFC ? "creditAmountFc" : "creditAmount";

      return (Array.isArray(ledgerRows) ? ledgerRows : []).reduce(
        (acc, ledger) => {
          const details = Array.isArray(ledger?.tblVoucherLedgerDetails)
            ? ledger.tblVoucherLedgerDetails
            : [];

          const useDetails =
            details.length &&
            (isYes(ledger?.isChildChecked) ||
              details.some(
                (row) =>
                  isLiveChecked(row) || hasHCAmount(row) || hasFCAmount(row),
              ));

          if (useDetails) {
            details.forEach((row) => {
              acc.debit = round2(acc.debit + toNum(row?.[debitField]));
              acc.credit = round2(acc.credit + toNum(row?.[creditField]));
            });
          } else {
            acc.debit = round2(acc.debit + toNum(ledger?.[debitField]));
            acc.credit = round2(acc.credit + toNum(ledger?.[creditField]));
          }

          return acc;
        },
        {
          debit: 0,
          credit: 0,
        },
      );
    };

    const recomputeLedgerAmountFromDetails = (ledgerRows = []) => {
      return (Array.isArray(ledgerRows) ? ledgerRows : []).map((ledger) => {
        const details = Array.isArray(ledger?.tblVoucherLedgerDetails)
          ? ledger.tblVoucherLedgerDetails
          : [];

        if (!details.length) {
          return ledger;
        }

        const nextIsChildChecked = details.some((row) => isLiveChecked(row));

        if (!nextIsChildChecked) {
          return {
            ...ledger,
            isChildChecked: false,
          };
        }

        const debitHC = round2(
          details.reduce((acc, row) => acc + toNum(row?.debitAmount), 0),
        );

        const creditHC = round2(
          details.reduce((acc, row) => acc + toNum(row?.creditAmount), 0),
        );

        const debitFC = round2(
          details.reduce((acc, row) => acc + toNum(row?.debitAmountFc), 0),
        );

        const creditFC = round2(
          details.reduce((acc, row) => acc + toNum(row?.creditAmountFc), 0),
        );

        const tdsHC = round2(
          details.reduce(
            (acc, row) => acc + toNum(row?.tdsAmtHC ?? row?.tdsAmount),
            0,
          ),
        );

        const tdsFC = round2(
          details.reduce(
            (acc, row) => acc + toNum(row?.tdsAmtFC ?? row?.tdsAmountFc),
            0,
          ),
        );

        return {
          ...ledger,

          isChildChecked: true,

          debitAmount: asStr2(debitHC),
          creditAmount: asStr2(creditHC),
          debitAmountFc: asStr2(debitFC),
          creditAmountFc: asStr2(creditFC),

          tdsAmtHC: tdsHC,
          tdsAmtFC: tdsFC,
          tdsAmount: tdsHC,
          tdsAmountFc: tdsFC,
        };
      });
    };

    const capVoucher8DebitTotalByBaseBalance = (ledgerRows = []) => {
      if (
        voucherTypeId !== "8" ||
        !isDebitMinusCreditPlusVoucher ||
        isApplicable
      ) {
        return ledgerRows;
      }

      const capOneCurrency = (rows = [], isFC = false) => {
        const debitField = isFC ? "debitAmountFc" : "debitAmount";
        const creditField = isFC ? "creditAmountFc" : "creditAmount";
        const baseBalance = isFC ? baseBalanceFC : baseBalanceHC;
        const totals = getCapTotals(rows, isFC);
        const allowedDebit = round2(totals.credit + baseBalance);

        let excessDebit = round2(totals.debit - allowedDebit);

        if (excessDebit <= 0) {
          return rows;
        }

        const updatedRows = rows.map((ledger) => ({
          ...ledger,

          tblVoucherLedgerDetails: Array.isArray(
            ledger?.tblVoucherLedgerDetails,
          )
            ? ledger.tblVoucherLedgerDetails.map((row) => ({
                ...row,
              }))
            : ledger?.tblVoucherLedgerDetails,
        }));

        for (
          let ledgerIndex = updatedRows.length - 1;
          ledgerIndex >= 0 && excessDebit > 0;
          ledgerIndex--
        ) {
          const ledger = updatedRows[ledgerIndex];

          const details = Array.isArray(ledger?.tblVoucherLedgerDetails)
            ? ledger.tblVoucherLedgerDetails
            : [];

          const useDetails =
            details.length &&
            (isYes(ledger?.isChildChecked) ||
              details.some(
                (row) =>
                  isLiveChecked(row) || hasHCAmount(row) || hasFCAmount(row),
              ));

          if (useDetails) {
            for (
              let rowIndex = details.length - 1;
              rowIndex >= 0 && excessDebit > 0;
              rowIndex--
            ) {
              const row = details[rowIndex];

              if (!isLiveChecked(row)) {
                continue;
              }

              let debitValue = round2(toNum(row?.[debitField]));
              const creditValue = round2(toNum(row?.[creditField]));

              if (debitValue <= 0) {
                continue;
              }

              const reduceValue = round2(Math.min(debitValue, excessDebit));

              if (reduceValue <= 0) {
                continue;
              }

              debitValue = round2(debitValue - reduceValue);
              excessDebit = round2(excessDebit - reduceValue);

              if (isFC) {
                const origBalFC = getRowOrigBalFC(row);

                const nextBalanceFC =
                  origBalFC < 0
                    ? round2(origBalFC + debitValue - creditValue)
                    : round2(origBalFC - creditValue + debitValue);

                details[rowIndex] = {
                  ...row,
                  debitAmountFc: asStr2(debitValue),
                  allocatedAmtFC: round2(
                    Math.abs(debitValue) + Math.abs(creditValue),
                  ),
                  balanceAmtFC: asNum2(nextBalanceFC),
                  balanceAmountFc: asNum2(nextBalanceFC),
                  __manualAllocFC: debitValue > 0,
                };
              } else {
                const origBalHC = getRowOrigBalHC(row);

                const nextBalanceHC =
                  origBalHC < 0
                    ? round2(origBalHC + debitValue - creditValue)
                    : round2(origBalHC - creditValue + debitValue);

                details[rowIndex] = {
                  ...row,
                  debitAmount: asStr2(debitValue),
                  allocatedAmtHC: round2(
                    Math.abs(debitValue) + Math.abs(creditValue),
                  ),
                  balanceAmtHC: asNum2(nextBalanceHC),
                  balanceAmount: asNum2(nextBalanceHC),
                  __manualAllocHC: debitValue > 0,
                };
              }
            }
          } else {
            let debitValue = round2(toNum(ledger?.[debitField]));
            const creditValue = round2(toNum(ledger?.[creditField]));

            if (debitValue <= 0) {
              continue;
            }

            const reduceValue = round2(Math.min(debitValue, excessDebit));

            if (reduceValue <= 0) {
              continue;
            }

            debitValue = round2(debitValue - reduceValue);
            excessDebit = round2(excessDebit - reduceValue);

            updatedRows[ledgerIndex] = {
              ...ledger,
              [debitField]: asStr2(debitValue),
              [creditField]: asStr2(creditValue),
            };
          }
        }

        return recomputeLedgerAmountFromDetails(updatedRows);
      };

      let cappedRows = capOneCurrency(ledgerRows, false);

      cappedRows = capOneCurrency(cappedRows, true);

      return recomputeLedgerAmountFromDetails(cappedRows);
    };

    let finalLedgers =
      adjustSmallPendingChildBalanceFromRootBalance(nextLedgers);

    finalLedgers = capVoucher8DebitTotalByBaseBalance(finalLedgers);

    const nextTdsAmtHC = round2(
      finalLedgers.reduce(
        (acc, ledger) => acc + toNum(ledger?.tdsAmtHC ?? ledger?.tdsAmount),
        0,
      ),
    );

    const nextTdsAmtFC = round2(
      finalLedgers.reduce(
        (acc, ledger) => acc + toNum(ledger?.tdsAmtFC ?? ledger?.tdsAmountFc),
        0,
      ),
    );

    const displayTotals = getEffectiveDisplayTotals(finalLedgers);

    const creditMinusDebitTotals = getCreditMinusDebitTotals(finalLedgers);

    const debitMinusCreditTotals = isVoucher8Applicable
      ? displayTotals
      : {
          hc: 0,
          fc: 0,
        };

    const bankChargesHC = round2(
      toNum(newState?.bcAmt ?? newState?.bankCharges ?? 0),
    );

    const bankChargesFC = round2(
      toNum(newState?.bankChargesFC ?? newState?.bankChargesFc ?? 0),
    );

    const exGainLossHC = round2(toNum(newState?.exGainLoss ?? 0));

    const debitMinusCreditWithTdsAndBankTotals = {
      hc: isVoucher8Applicable
        ? round2(
            debitMinusCreditTotals.hc +
              nextTdsAmtHC -
              bankChargesHC -
              exGainLossHC,
          )
        : 0,

      fc: isVoucher8Applicable
        ? round2(debitMinusCreditTotals.fc + nextTdsAmtFC - bankChargesFC)
        : 0,
    };

    const hasCheckedOutstandingAllocation =
      shouldFullAllocateOutstandingForVoucher12 &&
      finalLedgers.some((ledger) => {
        const details = Array.isArray(ledger?.tblVoucherLedgerDetails)
          ? ledger.tblVoucherLedgerDetails
          : [];

        return details.some((row) => isLiveChecked(row));
      });

    const hasManualParentLedgerAllocation =
      isVoucher8Applicable &&
      finalLedgers.some((ledger) => {
        const details = Array.isArray(ledger?.tblVoucherLedgerDetails)
          ? ledger.tblVoucherLedgerDetails
          : [];

        const hasCheckedChild = details.some((row) => isLiveChecked(row));

        if (hasCheckedChild) {
          return false;
        }

        return hasParentLedgerAmount(ledger);
      });

    const hasFullOutstandingAllocation = hasCheckedOutstandingAllocation;

    const hasManualChildLedgerAllocation =
      isVoucher8Applicable &&
      finalLedgers.some((ledger) => {
        const details = Array.isArray(ledger?.tblVoucherLedgerDetails)
          ? ledger.tblVoucherLedgerDetails
          : [];

        return details.some(
          (row) =>
            isLiveChecked(row) &&
            (hasHCAmount(row) ||
              hasFCAmount(row) ||
              toNum(row?.tdsAmtHC ?? row?.tdsAmount) > 0 ||
              toNum(row?.tdsAmtFC ?? row?.tdsAmountFc) > 0),
        );
      });

    const hasVoucher8ApplicableAmountSource =
      isVoucher8Applicable &&
      (hasCheckedOutstandingAllocation ||
        hasManualParentLedgerAllocation ||
        hasManualChildLedgerAllocation);

    const shouldCalculateVoucher8ApplicableAmtRec =
      voucherTypeId === "8" &&
      isApplicable === true &&
      hasVoucher8ApplicableAmountSource;

    const shouldSetCalculatedBalanceInAmtRec =
      shouldCalculateVoucher8ApplicableAmtRec;

    const applicableAmtRecKey = JSON.stringify({
      voucherTypeId,
      isApplicable: isApplicable ? 1 : 0,
      debitMinusCreditHc: asStr2(debitMinusCreditTotals.hc),
      debitMinusCreditFc: asStr2(debitMinusCreditTotals.fc),
      creditMinusDebitHc: asStr2(creditMinusDebitTotals.hc),
      creditMinusDebitFc: asStr2(creditMinusDebitTotals.fc),
      tdsAmtHc: asStr2(nextTdsAmtHC),
      tdsAmtFc: asStr2(nextTdsAmtFC),
      bankChargesHC: asStr2(bankChargesHC),
      bankChargesFC: asStr2(bankChargesFC),
      exGainLossHC: asStr2(exGainLossHC),
      finalAmtRecHC: asStr2(debitMinusCreditWithTdsAndBankTotals.hc),
      finalAmtRecFC: asStr2(debitMinusCreditWithTdsAndBankTotals.fc),

      rows: finalLedgers.map((ledger, ledgerIndex) => {
        const details = Array.isArray(ledger?.tblVoucherLedgerDetails)
          ? ledger.tblVoucherLedgerDetails
          : [];

        return {
          k: getLedgerKey(ledger, ledgerIndex),
          d: asStr2(ledger?.debitAmount),
          cr: asStr2(ledger?.creditAmount),
          df: asStr2(ledger?.debitAmountFc),
          crf: asStr2(ledger?.creditAmountFc),
          th: asStr2(ledger?.tdsAmtHC ?? ledger?.tdsAmount),
          tf: asStr2(ledger?.tdsAmtFC ?? ledger?.tdsAmountFc),
          child: isYes(ledger?.isChildChecked),

          rows: details.map((row, rowIndex) => ({
            k: getDetailKey(row, rowIndex),
            c: isLiveChecked(row),
            ob: asStr2(row?.__origBalHC),
            obf: asStr2(row?.__origBalFC),
            d: asStr2(row?.debitAmount),
            cr: asStr2(row?.creditAmount),
            df: asStr2(row?.debitAmountFc),
            crf: asStr2(row?.creditAmountFc),
            t: asStr2(row?.tdsAmtHC ?? row?.tdsAmount),
            tf: asStr2(row?.tdsAmtFC ?? row?.tdsAmountFc),
          })),
        };
      }),
    });

    let nextAmtRec = newState?.amtRec;
    let nextAmtRecFC = newState?.amtRecFC;

    if (shouldSetCalculatedBalanceInAmtRec) {
      if (allocApplicableAmtRecRef.current.key !== applicableAmtRecKey) {
        allocApplicableAmtRecRef.current = {
          key: applicableAmtRecKey,
          amtRec: asStr2(debitMinusCreditWithTdsAndBankTotals.hc),
          amtRecFC: asStr2(debitMinusCreditWithTdsAndBankTotals.fc),
        };
      }

      nextAmtRec = allocApplicableAmtRecRef.current.amtRec;
      nextAmtRecFC = allocApplicableAmtRecRef.current.amtRecFC;
    } else {
      allocApplicableAmtRecRef.current = {
        key: "",
        amtRec: "",
        amtRecFC: "",
      };
    }

    const shouldZeroBalanceForVoucher8Applicable =
      isVoucher8Applicable && hasVoucher8ApplicableAmountSource;

    const nextBalanceHcNumber =
      hasFullOutstandingAllocation || shouldZeroBalanceForVoucher8Applicable
        ? 0
        : isVoucher8Applicable
          ? clamp0(baseBalanceHC + nextTdsAmtHC - displayTotals.hc)
          : isDebitMinusCreditPlusVoucher
            ? clamp0(baseBalanceHC - displayTotals.hc)
            : clamp0(
                baseBalanceHC +
                  displayTotals.hc +
                  (isTdsApplicable ? nextTdsAmtHC : 0),
              );

    const nextBalanceFcNumber =
      hasFullOutstandingAllocation || shouldZeroBalanceForVoucher8Applicable
        ? 0
        : isVoucher8Applicable
          ? clamp0(baseBalanceFC + nextTdsAmtFC - displayTotals.fc)
          : isDebitMinusCreditPlusVoucher
            ? clamp0(baseBalanceFC - displayTotals.fc)
            : clamp0(
                baseBalanceFC +
                  displayTotals.fc +
                  (isTdsApplicable ? nextTdsAmtFC : 0),
              );

    const nextBalanceAmtHc = asStr2(nextBalanceHcNumber);
    const nextBalanceAmtFc = asStr2(nextBalanceFcNumber);

    const currentSnapshot = makeSnapshot(
      ledgers,
      newState?.balanceAmtHc ?? newState?.balanceAmt,
      newState?.balanceAmtFc ?? newState?.balanceAmtFC,
      newState?.tdsAmt ?? newState?.tdsAmount,
      newState?.tdsAmtFC ?? newState?.tdsAmountFc,
    );

    const nextSnapshot = makeSnapshot(
      finalLedgers,
      nextBalanceAmtHc,
      nextBalanceAmtFc,
      nextTdsAmtHC,
      nextTdsAmtFC,
    );

    const nextParentOnlyLedgerSnapshot =
      getParentOnlyLedgerSnapshot(finalLedgers);

    if (allocInternalUpdateRef.current) {
      if (currentSnapshot === allocPrevRef.current) {
        allocInternalUpdateRef.current = false;
        allocTdsEditSnapshotRef.current = makeTdsEditSnapshot(ledgers);

        return;
      }

      allocInternalUpdateRef.current = false;
    }

    const shouldForceVoucher8ApplicableAmtRecUpdate =
      shouldCalculateVoucher8ApplicableAmtRec &&
      (!isSameAmount(newState?.amtRec, nextAmtRec) ||
        !isSameAmount(newState?.amtRecFC, nextAmtRecFC));

    const shouldForceTopLevelTdsUpdate =
      isVoucher8Applicable &&
      (!isSameAmount(newState?.tdsAmt ?? newState?.tdsAmount, nextTdsAmtHC) ||
        !isSameAmount(
          newState?.tdsAmtFC ?? newState?.tdsAmountFc,
          nextTdsAmtFC,
        ));

    if (
      (nextSnapshot === currentSnapshot ||
        allocPrevRef.current === nextSnapshot) &&
      !shouldForceVoucher8ApplicableAmtRecUpdate &&
      !shouldForceTopLevelTdsUpdate
    ) {
      allocPrevRef.current = nextSnapshot;
      allocParentLedgerSnapshotRef.current = nextParentOnlyLedgerSnapshot;
      allocTdsEditSnapshotRef.current = makeTdsEditSnapshot(finalLedgers);

      return;
    }

    allocPrevRef.current = nextSnapshot;
    allocParentLedgerSnapshotRef.current = nextParentOnlyLedgerSnapshot;
    allocTdsEditSnapshotRef.current = makeTdsEditSnapshot(finalLedgers);
    allocInternalUpdateRef.current = true;
    allocHydrateRef.current = false;

    const nextBalanceValues = {
      ...(shouldCalculateVoucher8ApplicableAmtRec
        ? {
            amtRec: nextAmtRec,
            amtRecFC: nextAmtRecFC,
          }
        : {}),

      balanceAmtHc: nextBalanceAmtHc,
      balanceAmtFc: nextBalanceAmtFc,
      balanceAmt: nextBalanceAmtHc,
      balanceAmtFC: nextBalanceAmtFc,

      tdsAmt: nextTdsAmtHC,
      tdsAmtFC: nextTdsAmtFC,
      tdsAmount: nextTdsAmtHC,
      tdsAmountFc: nextTdsAmtFC,
    };

    setNewState((prevState) => {
      if (hasLedgers) {
        return {
          ...prevState,
          tblVoucherLedger: finalLedgers.filter((ledger) => !ledger?.__virtual),
          ...nextBalanceValues,
        };
      }

      return {
        ...prevState,
        tblVoucherLedgerDetails: finalLedgers[0]?.tblVoucherLedgerDetails || [],
        ...nextBalanceValues,
      };
    });

    setSubmitNewState((prevState) => {
      if (hasLedgers) {
        return {
          ...prevState,
          tblVoucherLedger: finalLedgers.filter((ledger) => !ledger?.__virtual),
          ...nextBalanceValues,
        };
      }

      return {
        ...prevState,
        tblVoucherLedgerDetails: finalLedgers[0]?.tblVoucherLedgerDetails || [],
        ...nextBalanceValues,
      };
    });
  }, [
    search?.id,
    search?.isCopy,
    newState?.voucherTypeId,
    newState?.amtRec,
    newState?.amtRecFC,
    newState?.bankCharges,
    newState?.bankChargesFC,
    newState?.bankChargesFc,
    newState?.bcAmt,
    newState?.exGainLoss,
    newState?.currencyId,
    newState?.exchangeRate,
    newState?.tdsApplicable,
    newState?.isApplicable,
    newState?.tdsAmt,
    newState?.tdsAmtFC,
    newState?.tdsAmount,
    newState?.tdsAmountFc,
    JSON.stringify(newState?.tblVoucherLedger),
    JSON.stringify(newState?.tblVoucherLedgerDetails),
    voucherAllocDeleteTick,
  ]);
  async function fetchDataDymaic() {
    const {
      clientId,
      companyId,
      branchId,
      financialYear,
      userId,
      defaultFinYearId,
    } = getUserDetails();

    try {
      const tableViewApiResponse = await formControlMenuList(
        search.menuName,
        financialYear,
      );
      if (!tableViewApiResponse?.success) return;

      const menuConfig = tableViewApiResponse.data[0] || {};
      const rawFields = Array.isArray(menuConfig.fields)
        ? menuConfig.fields
        : [];

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
              idx <
              (finalData[item.tableName][index][subchildItem.tableName] || [])
                .length;
              idx++
            ) {
              finalData[item.tableName][index][subchildItem.tableName][
                idx
              ].indexValue = idx;
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
        if (value && typeof value === "object")
          return Object.keys(value).length > 0;

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
          parseIdList(field.columnsToHide).forEach((id) =>
            hiddenByDefault.add(id),
          );
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
            if (
              field.fieldname === "tdsAmtFC" ||
              field.fieldname === "tdsAmtHC"
            ) {
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
    if (
      !Array.isArray(parentFieldDataInArray) ||
      parentFieldDataInArray.length === 0
    )
      return;
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
      changedFieldNames.includes(record.parentFieldName),
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
      changedFieldNames.includes(record.parentFieldName),
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
    if (
      !Array.isArray(originalChildsFields) ||
      originalChildsFields.length === 0
    )
      return;

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
          if (
            field.fieldname === "tdsAmtFC" ||
            field.fieldname === "tdsAmtHC"
          ) {
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
                  amtRecReadOnly={amtRecReadOnly}
                  amtRecFCReadOnly={amtRecFCReadOnly}
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
                onVoucherAllocationDelete={
                  forceVoucherAllocationRecalcAfterDelete
                }
                getThirdLevelDetails={getThirdLevelDetails}
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
                  amtRecReadOnly={amtRecReadOnly}
                  amtRecFCReadOnly={amtRecFCReadOnly}
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
  amtRecReadOnly: PropTypes.any,
  amtRecFCReadOnly: PropTypes.any,
};

function ParentAccordianComponent({
  section,
  indexValue,
  newState,
  parentsFields,
  amtRecReadOnly,
  amtRecFCReadOnly,
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

  const parentInputFields = React.useMemo(() => {
    const fields = parentsFields?.[section] || [];

    return fields.map((field) => {
      const fieldName = String(field?.fieldname || "").toLowerCase();

      if (fieldName === "amtrec" && amtRecReadOnly) {
        return {
          ...field,
          isEditable: false,
          readOnly: true,
          disabled: true,
        };
      }

      if (fieldName === "amtrecfc" && amtRecFCReadOnly) {
        return {
          ...field,
          isEditable: false,
          readOnly: true,
          disabled: true,
        };
      }

      return field;
    });
  }, [parentsFields, section, amtRecReadOnly, amtRecFCReadOnly]);

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
            inputFieldData={parentInputFields}
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
  onVoucherAllocationDelete: PropTypes.func,
  getThirdLevelDetails: PropTypes.func,
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
  onVoucherAllocationDelete,
  getThirdLevelDetails,
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
            String(childObject[feild.fieldname] || "").trim() === "")
        ) {
          toast.error(`Value for ${feild.yourlabel} is missing or empty.`);
          return;
        }
      }

      toast.dismiss();
      try {
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

        // if (section.functionOnGridSave && section.functionOnGridSave !== null) {
        //   let functonsArray = section.functionOnGridSave.trim().split(";");
        //   for (const fun of functonsArray) {
        //     let updatedData = await onGridSaveFunctionCall(
        //       fun,
        //       newState,
        //       formControlData,
        //       Data,
        //       setChildObject,
        //     );
        //     if (updatedData?.alertShow == true) {
        //       setParaText(updatedData.message);
        //       setIsError(true);
        //       setOpenModal((prev) => !prev);
        //       setTypeofModal("onCheck");
        //     }
        //     if (updatedData) {
        //       Data = updatedData.values;
        //       setNewState((prevState) => {
        //         return {
        //           ...prevState,
        //           ...updatedData?.newState,
        //         };
        //       });
        //       setSubmitNewState((prevState) => {
        //         return {
        //           ...prevState,
        //           ...updatedData?.newState,
        //         };
        //       });
        //     }
        //   }
        // }
        if (section.functionOnGridSave && section.functionOnGridSave !== null) {
          const functonsArray = section.functionOnGridSave
            .trim()
            .split(";")
            .map((fun) => fun.trim())
            .filter(Boolean);

          let workingNewState = {
            ...tmpData, // use latest grid data, not old newState
          };

          let workingData = {
            ...Data,
          };

          for (const fun of functonsArray) {
            const updatedData = await onGridSaveFunctionCall(
              fun,
              workingNewState,
              formControlData,
              workingData,
              setNewState, // pass parent state setter
              submitNewState,
              setSubmitNewState,
            );

            if (updatedData?.alertShow === true) {
              setParaText(updatedData.message);
              setIsError(true);
              setOpenModal((prev) => !prev);
              setTypeofModal("onCheck");
              return;
            }

            if (updatedData) {
              workingData = {
                ...workingData,
                ...(updatedData?.values || {}),
              };

              workingNewState = {
                ...workingNewState,
                ...(updatedData?.newState || {}),
              };
            }
          }

          Data = {
            ...workingData,
          };

          setNewState((prevState) => ({
            ...prevState,
            ...workingNewState,
          }));

          setSubmitNewState((prevState) => ({
            ...prevState,
            ...workingNewState,
          }));

          // Removed setOriginalData because it is not defined anywhere
        }
      } catch (error) {
        return toast.error(error.message);
      }

      if (islastTab == true) {
        setTimeout(() => {
          setInputFieldsVisible((prev) => !prev);
        }, 3);
      }

      setRenderedData(newState[section.tableName]);
      setChildObject({});
      setInputFieldsVisible((prev) => !prev);
    }
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

    const tableNameLower = String(section?.tableName || "").toLowerCase();

    const isVoucherAllocationTable =
      tableNameLower === "tblvoucherledger" ||
      tableNameLower === "tblvoucherledgerdetails";

    console.log("🗑️ DELETE CLICKED =>", {
      tableName: section?.tableName,
      index,
      isVoucherAllocationTable,
      beforeDeleteRows: newState?.[section?.tableName],
      beforeDeleteFullNewState: newState,
    });

    if (isVoucherAllocationTable) {
      onVoucherAllocationDelete?.();
    }

    const removeByIndexAndReIndex = (rows = []) => {
      return (Array.isArray(rows) ? rows : [])
        .filter((_, idx) => idx !== index)
        .map((item, idx) => ({
          ...item,
          indexValue: idx,
        }));
    };

    setNewState((prevState) => {
      const newStateCopy = { ...prevState };

      const updatedData = removeByIndexAndReIndex(
        newStateCopy?.[section.tableName],
      );

      newStateCopy[section.tableName] = updatedData;

      console.log("🗑️ AFTER DELETE setNewState =>", {
        tableName: section?.tableName,
        deletedIndex: index,
        updatedRows: updatedData,
        nextNewState: newStateCopy,
      });

      if (updatedData.length === 0) {
        setInputFieldsVisible((prev) => !prev);
      }

      return newStateCopy;
    });

    setSubmitNewState((prevState) => {
      const newStateCopy = { ...prevState };

      const updatedData = removeByIndexAndReIndex(
        newStateCopy?.[section.tableName],
      );

      newStateCopy[section.tableName] = updatedData;

      console.log("🗑️ AFTER DELETE setSubmitNewState =>", {
        tableName: section?.tableName,
        deletedIndex: index,
        updatedRows: updatedData,
        nextSubmitNewState: newStateCopy,
      });

      return newStateCopy;
    });
  };
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
            tableRef.current?.scrollLeft,
        ),
      );
      if (tableRef.current?.scrollWidth > tableRef.current?.clientWidth) {
        let hoverBtnWidth = document.getElementById("hoverBtn");
        hoverBtnWidth = hoverBtnWidth?.offsetWidth;
        setTableBodyWidth(`${right - Math.max(hoverBtnWidth, 100)}`);
      } else {
        setTableBodyWidth(`0`);
      }
    };
    horiScroll();
    tableRef.current?.addEventListener("scroll", horiScroll);
    return () => {
      tableRef.current?.removeEventListener("scroll", horiScroll);
    };
  }, [tableRef.current, document.getElementById("hoverBtn")]);

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
            height:
              newState[section.tableName]?.length <= 0 && !inputFieldsVisible
                ? "3.5rem"
                : "auto",
            width: "100%",
          }}
        >
          <div key={indexValue} className={`w-full  ${styles.thinScrollBar}`}>
            {/* Icon Button on the right */}
            <div className="absolute top-1 right-[-3px] flex justify-end ">
              {!isChildAddHidden && !inputFieldsVisible && (
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
            {!isChildAddHidden && inputFieldsVisible && !isGridEdit && (
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
                      //lockExchangeRateFirstWins();
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
                                      !(
                                        section?.showSrNo == true ||
                                        section?.showSrNo == "true"
                                      ) && (
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
                              getThirdLevelDetails={getThirdLevelDetails}
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
