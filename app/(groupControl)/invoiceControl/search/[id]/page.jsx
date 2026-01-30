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
// import AddOutlinedIcon from "@mui/icons-material/AddOutlined";
import PrintModal from "@/components/Modal/printModal.jsx";
import CloseOutlinedIcon from "@mui/icons-material/CloseOutlined";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import {
  eInvoicing,
  fetchThirdLevelDetailsFromApi,
  fetchSecondThirdLevelDetails,
  formControlMenuList,
  getCopyData,
  handleSubmitApi,
  validateSubmit,
  tallyDebitCredit,
  insertVoucherData,
  insertVoucherDataDynami,
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
import { toast } from "react-toastify";
import {
  parentAccordionSection,
  SummaryStyles,
  searchInputStyling,
  childTableHeaderStyle,
  childAccordionSection,
  createAddEditPaperStyles,
  gridEditIconStyles,
  accordianDetailsStyleForm,
  childTableRowStyles,
  totalSumChildStyle,
  expandIconStyle,
} from "@/app/globalCss";
import {
  refreshIcon,
  saveIcon,
  addLogo,
  plusIconHover,
  revertHover,
  saveIconHover,
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
import { areObjectsEqual, hasBlackValues } from "@/helper/checkValue";
import HoverIcon from "@/components/HoveredIcons/HoverIcon";
import EditNoteRoundedIcon from "@mui/icons-material/EditNoteRounded";
import SaveOutlinedIcon from "@mui/icons-material/SaveOutlined";
import Attachments from "@/app/(groupControl)/invoiceControl/addEdit/Attachments.jsx";
import * as XLSX from "xlsx";
import * as formControlValidation from "@/helper/formControlValidation";
import * as onSubmitValidation from "@/helper/onSubmitFunction";
import { updateFlag } from "@/app/counterSlice";
import { useDispatch, useSelector } from "react-redux";
import { fetchReportData } from "@/services/auth/FormControl.services";
import { encryptUrlFun } from "@/utils";
import { getUserDetails } from "@/helper/userDetails";
import { menu } from "@material-tailwind/react";
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
    const section = field.sectionHeader || "default"; // Use 'default' or any other value for fields without sectionHeader
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

function onSubmitFunctionCall(
  functionData,
  newState,
  formControlData,
  values,
  setStateVariable,
) {
  const funcNameMatch = functionData?.match(/^(\w+)/);
  const argsMatch = functionData?.match(/\((.*)\)/);
  //  console.log(functionData, "functionData");
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
      //      console.log(args);
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
  const { push } = useRouter();
  const dispatch = useDispatch();
  const selectedMenuId = useSelector((state) => state?.counter?.selectedMenuId);
  const isRedirected = useSelector((state) => state?.app?.isRedirection);
  const [firstState, setFirstState] = useState({ routeName: "mastervalue" });
  const paramsValue = useParams();
  const encryptParams = JSON.parse(decodeURIComponent(paramsValue.id));
  const uriDecodedMenu = encryptParams;
  const [isReportPresent, setisReportPresent] = useState(false);
  const [formControlData, setFormControlData] = useState([]);
  const [parentsFields, setParentsFields] = useState([]);
  const [topParentsFields, setTopParentsFields] = useState([]);
  const [bottomParentsFields, setBottomParentsFields] = useState([]);
  const [childsFields, setChildsFields] = useState([]);
  const [newState, setNewState] = useState({
    routeName: "mastervalue",
    tblInvoiceCharge: [],
  });
  const [buttonsData, setButtonsData] = useState(null); // Initialize as null
  const [expandedAccordion, setExpandedAccordion] = useState([]);
  const [expandAll, setExpandAll] = useState(true);
  const [openModal, setOpenModal] = useState(false);
  const [isError, setIsError] = useState(false);
  const [paraText, setParaText] = useState("");
  const [originalData, setOriginalData] = useState(null);
  const [keysTovalidate, setKeysTovalidate] = useState([]);
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
  const [ChildTableName, setAllChildTableName] = useState([]);
  const [openPrintModal, setOpenPrintModal] = useState(false);
  const [submittedRecordId, setSubmittedRecordId] = useState(null);
  const [submittedMenuId, setSubmittedMenuId] = useState(null);
  // get label code starts here
  const [labelName, setLabelName] = useState("");
  const [isFormSaved, setIsFormSaved] = useState(false);
  const { clientId } = getUserDetails();

  console.log("uriDecodedMenu.menuName", uriDecodedMenu?.menuName);

  useEffect(() => {
    const fetchData = async () => {
      try {
        await checkReportPresent(uriDecodedMenu?.id);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };
    fetchData();
  }, [uriDecodedMenu]);

  async function checkReportPresent(menuId) {
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
    function checkIsDataSaved(firstState, newState) {
      return deepEqual(firstState, newState);
    }
    let isDataMatched = checkIsDataSaved(firstState, newState);
    if (isDataMatched) {
      console.log("All keys & values match 1", firstState);
      console.log("All keys & values match 2", newState);
      dispatch(
        updateFlag({
          flag: "isRedirection",
          value: isDataMatched,
        }),
      );
    } else {
      console.log("Mismatch found. 1", firstState);
      console.log("Mismatch found. 2", newState);
      // setIsChangesMade(isDataMatched);
      dispatch(
        updateFlag({
          flag: "isRedirection",
          value: isDataMatched,
        }),
      );
    }
  }, [newState]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        await checkReportPresent(uriDecodedMenu?.id);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };
    fetchData();
  }, [uriDecodedMenu]);

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

  const getLabelValue = (label) => {
    setLabelName(label);
  };

  useEffect(() => {
    let allChildTableName = [];
    childsFields.map((item) => {
      allChildTableName.push(item?.tableName);
    });
    console.log("allChildTableName =>", allChildTableName);
    setAllChildTableName(allChildTableName);
  }, [childsFields]);

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

  // code ends here

  const handleFileAndUpdateState = (file, updateState) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      const buffer = e.target.result;
      const workbook = XLSX.read(buffer, { type: "array" });
      const worksheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[worksheetName];
      const jsonData = XLSX.utils.sheet_to_json(worksheet);

      updateState(jsonData);
    };

    reader.readAsArrayBuffer(file);
  };

  const handleFieldValuesChange = (updatedValues) => {
    const entries = Object.entries(updatedValues);
    const hasFile = entries.some(([, value]) => value instanceof File);

    if (hasFile) {
      // Process each entry and handle files specifically
      entries.forEach(([key, value]) => {
        if (value instanceof File) {
          // Process the file and update the corresponding key with JSON data
          handleFileAndUpdateState(value, (jsonData) => {
            const newFormFieldsValues = { ...newState, [key]: jsonData };
            setNewState(newFormFieldsValues);
            setSubmitNewState(newFormFieldsValues);
          });
        } else {
          // Directly merge non-file data into the state
          const newFormFieldsValues = { ...newState, [key]: value };
          setNewState(newFormFieldsValues);
          setSubmitNewState(newFormFieldsValues);
        }
      });
    } else {
      // No files, proceed as normal
      const formFieldsValues = { ...newState, ...updatedValues };
      setNewState(formFieldsValues);
      setSubmitNewState(formFieldsValues);
    }
  };

  const handleFieldValuesChange2 = async (
    updatedValues,
    field,
    formControlData,
  ) => {
    try {
      const requestData = {
        id: updatedValues.copyMappingName,
        filterValue: field[field.length - 1],
        menuID: uriDecodedMenu.id,
      };
      console.log("formControlData", requestData);

      const getCopyDetails = await getCopyData(requestData);

      if (!getCopyDetails.success) {
        toast.error(getCopyDetails.Message);
        return;
      }
      let dataToCopy = {};
      getCopyDetails.keyToValidate.fieldsMaping
        .filter((data) => !data.isChild)
        .forEach((data) => {
          if (
            Array.isArray(getCopyDetails.data[0][data.toColmunName]) &&
            formControlData?.controlname.toLowerCase() == "multiselect"
          ) {
            dataToCopy[data.toColmunName] = newState[data.toColmunName].concat(
              getCopyDetails.data[0][data.toColmunName],
            );
          } else {
            dataToCopy[data.toColmunName] =
              getCopyDetails.data[0][data.toColmunName];
          }
        });
      console.log("dataToCopy", dataToCopy);
      let childData = getCopyDetails.keyToValidate.fieldsMaping.filter(
        (data) => data.isChild == true,
      );
      console.log("childData", childData);

      setChildsFields((prev) => {
        // Create a copy of the previous state
        let updatedFields = [...prev];

        childData.forEach((data) => {
          let index = updatedFields.findIndex(
            (i) => i.tableName === data.toColmunName,
          );

          if (index !== -1) {
            // Update the specific object at the found index
            updatedFields[index] = {
              ...updatedFields[index],
              isAddFunctionality: data.isAddFunctionality,
              isDeleteFunctionality: data.isDeleteFunctionality,
              isCopyFunctionality: data.isCopyFunctionality,
            };
          }
        });
        console.log("updatedFields", updatedFields);

        // Return the new state
        return updatedFields;
      });

      setNewState((prevState) => {
        getCopyDetails.keyToValidate.fieldsMaping.forEach((data) => {
          if (data.isChild == true) {
            dataToCopy[data.toTableName] =
              getCopyDetails.data[0][data.toTableName];
          }
        });
        return {
          ...prevState,
          ...dataToCopy,
        };
      });
      setSubmitNewState((prevState) => ({
        ...prevState,
        ...getCopyDetails.data[0],
      }));

      setKeysTovalidate(getCopyDetails.keyToValidate.fieldsMaping);
    } catch (error) {
      console.error("Fetch Error :", error);
    }
  };

  Object.keys(topParentsFields)?.forEach((section) => {
    topParentsFields[section]?.forEach((field) => {
      const keyMapping = keysTovalidate.find(
        (key) => key?.toColmunName === field?.fieldname,
      );
      if (keyMapping) {
        field.isChild = keyMapping?.isChild;
        field.isOnChange = keyMapping?.isOnChage;
        field.isEditable = keyMapping?.isEditable;
        // field.functionOnChange = keyMapping?.functionOnChange;
        // field.functionOnBlur = keyMapping?.functionOnBlur;
        // field.functionOnKeyPress = keyMapping?.functionOnKeyPress;
        field.isCopy = keyMapping?.isCopy;
        field.isCopyEditable = keyMapping?.isCopyEditable;
        field.isSwitchToText = keyMapping?.isSwitchToText;
        field.isBreak = keyMapping?.isBreak;
      }
    });
  });

  // Define your button click handlers
  const handleButtonClick = {
    handleSubmit: async () => {
      // console.log("newState", newState);
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
              setParaText(tallyDebitCreditData.message);
              setIsError(false);
              setOpenModal((prev) => !prev);
              return;
            }
          }
          setIsFormSaved(true);
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
          let data = await handleSubmitApi(cleanData);
          if (data.success == true) {
            toast.success(data.message);

            if (isReportPresent) {
              // const id =
              //   data?.data?.recordset[0]?.id ??
              //   data?.data?.recordset[0]?.ParentId;
              const id =
                data?.data?.recordset?.at(-1)?.id ??
                data?.data?.recordset?.at(-1)?.ParentId ??
                data?.data?.recordset?.at(-1)?.InsertedId;
              setOpenPrintModal((prev) => !prev);
              setSubmittedMenuId(uriDecodedMenu?.id);
              setSubmittedRecordId(id);
            }
          } else {
            toast.error(data.message);
            setIsFormSaved(false);
          }
          if (data.success == true) {
            dispatch(
              updateFlag({
                flag: "isRedirection",
                value: true,
              }),
            );
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
            let invoiceType = "n";
            if (invoiceType === "y") {
              if (newState.tableName == "tblInvoice") {
                let insertData = {
                  invoiceId: data?.data?.recordset[0]?.ParentId || 0,
                  billingPartyId: newState.billingPartyId,
                  companyId: newState.companyId,
                };
                let invoiceRes = await eInvoicing(insertData);
                if (invoiceRes.success == true) {
                  toast.success(invoiceRes.message);
                } else {
                  setNewState((per) => {
                    return {
                      ...per,
                      id: data?.data?.recordset[0]?.ParentId,
                    };
                  });
                  return toast.error(invoiceRes?.message);
                }
              }
            }
          } else {
            toast.error(data.Message);
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
      // console.log("Edit clicked");
      toast.error("Not available now");
    },
    handleDelete: () => {
      // console.log("Delete clicked");
      setNewState(initialState);
      setSubmitNewState(initialState);
    },
    handleClose: () => {
      // console.log("Close clicked");
      setParaText("Do you want to close this form, all changes will be lost?");
      setIsError(true);
      setOpenModal((prev) => !prev);
      setTypeofModal("onClose");
    },
    handleSaveClose: async () => {
      // console.log("Save and Close clicked");
      if (isFormSaved)
        return toast.error(
          "This form has already been saved. Please refresh the screen to save one more record",
        );
      const isEqual = areObjectsEqual(newState, initialState);
      // event.preventDefault();
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
            toast.error(`Value for ${yourlabel} is missing.`);
            return;
          }
        }

        // return; // Exit the function if a value is missing
        try {
          const cleanData = replaceNullStrings(
            { ...newState, menuId: selectedMenuId },
            ChildTableName,
          );
          setIsFormSaved(true);
          let data = await handleSubmitApi(cleanData);
          if (data.success == true) {
            dispatch(
              updateFlag({
                flag: "isRedirection",
                value: true,
              }),
            );
            toast.success(data.message);
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
            setTimeout(() => {
              push(
                `/invoiceControl?menuName=${encryptUrlFun({
                  id: uriDecodedMenu.id,
                  menuName: uriDecodedMenu.menuName,
                  parentMenuId: uriDecodedMenu.parentMenuId,
                })}`,
              );
            }, 500);
          } else {
            setIsFormSaved(false);
            toast.error(data.Message);
          }
        } catch (error) {
          setIsFormSaved(false);
          toast.error(error.message);
        }
      } else {
        toast.error("No changes made");
      }
    },
    handleSavePrint: () => {
      // console.log("Save and Print clicked");
      toast.error("Not available now");
    },
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
          if (uriDecodedMenu?.menuName == "") {
          }
          let data = await handleSubmitApi(cleanData);
          if (data.success == true) {
            toast.success(data.message);
            const id = data?.data?.recordset[0]?.id;
            if (newState.tableName == "tblInvoice") {
              let insertData = {
                invoiceId: data?.data?.recordset[0]?.id || 0,
                billingPartyId: newState?.billingPartyId,
                companyId: newState?.companyId,
              };
            }
            setOpenPrintModal((prev) => !prev);
            setSubmittedMenuId(uriDecodedMenu.id);
            setSubmittedRecordId(id);
          } else {
            toast.error(data.Message);
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
          recordId: Number(cleanData?.id ?? cleanData?.recordId ?? 0) || 0,
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
    };

    const fetchChargeDetails = await fetchSecondThirdLevelDetails(requestData);
    if (!fetchChargeDetails) return;

    const apiCharges = Array.isArray(fetchChargeDetails)
      ? fetchChargeDetails
      : Array.isArray(fetchChargeDetails?.Chargers)
        ? fetchChargeDetails.Chargers
        : [];

    const toNum = (v) =>
      v === null || v === undefined || v === "" ? null : Number(v);

    const mkDD = (value, label) => {
      const n = toNum(value);
      if (n === null) return [];
      return [{ value: n, label: label ?? String(n) }];
    };

    const pickValidDD = (arr) => {
      const a = Array.isArray(arr) ? arr : [];
      return a.filter((x) => x && x.value != null && x.label != null);
    };

    // ✅ thirdlevel rows + dropdowns (including chargeId & currencyId)
    const buildChargeDetailsRows = (thirdlevelArr) => {
      const src = Array.isArray(thirdlevelArr) ? thirdlevelArr : [];

      return src.map((item, i) => {
        const _containerId = toNum(item.containerId);
        const _sizeId = toNum(item.sizeId);
        const _typeId = toNum(item.typeId);
        const _jobId = toNum(item.jobId);
        const _containerTransactionId = toNum(item.containerTransactionId);
        const _containerRepairId = toNum(item.containerRepairId);
        const _blId = toNum(item.blId);

        const _chargeId = toNum(item.chargeId);
        const _currencyId = toNum(item.currencyId);

        return {
          ...item,

          // ✅ EXACT requirement: array index only
          indexValue: i,

          // ✅ FIX: chargeId label + currencyId label for detail rows
          chargeIddropdown: pickValidDD(item.chargeIddropdown).length
            ? pickValidDD(item.chargeIddropdown)
            : mkDD(_chargeId, item.chargeName ?? item.description),
          currencyIddropdown: pickValidDD(item.currencyIddropdown).length
            ? pickValidDD(item.currencyIddropdown)
            : mkDD(_currencyId, item.currencyName),

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

          calculatedAmount:
            (Number(item.noOfDays) || 0) * (Number(item.rate) || 0),
        };
      });
    };

    // ✅ totals for charge header (kept your logic; noOfDays in header forced to 1 later)
    const computeTotalsFromDetails = (detailsRows, stateExchangeRate) => {
      const qty = detailsRows.reduce((acc, r) => acc + (Number(r.qty) || 0), 0);

      const totalWeighted = detailsRows.reduce(
        (acc, r) => acc + (Number(r.noOfDays) || 0) * (Number(r.rate) || 0),
        0,
      );

      const avgRate = qty > 0 ? totalWeighted / qty : 0;

      const totalAmountHc = totalWeighted;
      const exRate = Number(stateExchangeRate || 1);
      const totalAmountFc = totalWeighted * exRate;

      return { qty, avgRate, totalAmountHc, totalAmountFc };
    };

    const buildThirdLevelForSave = (detailsRows, fallbackChargeId) => {
      return detailsRows.map((r, i) => ({
        chargeId: toNum(r.chargeId ?? fallbackChargeId),
        vesselId: toNum(r.vesselId),
        indexValue: i,
        voyageId: toNum(r.voyageId ?? r.voyageid),
        jobId: toNum(r.jobId),
        blId: toNum(r.blId),
        containerId: toNum(r.containerId),
        sizeId: toNum(r.sizeId),
        typeId: toNum(r.typeId),
        freeDays: toNum(r.freeDays),
        noOfDays: toNum(r.noOfDays),
        fromDate: r.fromDate ?? null,
        toDate: r.toDate ?? null,
        qty: toNum(r.qty),
        currencyId: toNum(r.currencyId),
        exchangeRate: toNum(r.exchangeRate),
        rate: toNum(r.rate),
        amountHc: toNum(r.amountHc),
        amountFc: toNum(r.amountFc),
        containerRepairId: toNum(r.containerRepairId),
        containerTransactionId: toNum(r.containerTransactionId),
      }));
    };

    setNewState((prev) => {
      const prevCharges = Array.isArray(prev.tblInvoiceCharge)
        ? prev.tblInvoiceCharge
        : [];

      // ✅ add indexValue to each CHARGE from API (0,1,2...) before mapping by id
      const apiChargesWithIndex = apiCharges.map((c, i) => ({
        ...(c || {}),
        indexValue: i,
      }));

      const apiMap = new Map(
        apiChargesWithIndex
          .filter((x) => x && x.chargeId != null)
          .map((x) => [Number(x.chargeId), x]),
      );

      const updatedExisting = prevCharges.map((ch) => {
        const id = Number(ch.chargeId);
        const apiRow = apiMap.get(id);
        if (!apiRow) {
          // ✅ ensure charge always has noOfDays = 1 even if API didn't return this charge
          return { ...ch, noOfDays: 1 };
        }

        const detailsRows = buildChargeDetailsRows(apiRow.thirdlevel);
        const totals = computeTotalsFromDetails(detailsRows, prev.exchangeRate);
        const thirdlevel = buildThirdLevelForSave(detailsRows, id);

        // ✅ FIX: currency dropdown (prefer apiRow.currencyIddropdown else derive from first detail row)
        const derivedCurrencyDD = pickValidDD(apiRow.currencyIddropdown).length
          ? pickValidDD(apiRow.currencyIddropdown)
          : pickValidDD(ch.currencyIddropdown).length
            ? pickValidDD(ch.currencyIddropdown)
            : mkDD(
                ch.currencyId ?? apiRow.currencyId ?? prev.currencyId,
                detailsRows?.[0]?.currencyName ??
                  detailsRows?.[0]?.currencyIddropdown?.[0]?.label,
              );

        // ✅ FIX: charge dropdown (prefer apiRow.chargeIddropdown else derive)
        const derivedChargeDD = pickValidDD(apiRow.chargeIddropdown).length
          ? pickValidDD(apiRow.chargeIddropdown)
          : pickValidDD(ch.chargeIddropdown).length
            ? pickValidDD(ch.chargeIddropdown)
            : mkDD(id, apiRow.description ?? ch.description);

        return {
          ...ch,

          description: apiRow.description ?? ch.description,
          cargoTypeId: apiRow.cargoTypeId ?? ch.cargoTypeId,
          expImp: apiRow.expImp ?? ch.expImp,
          icd: apiRow.icd ?? ch.icd,
          jobId: apiRow.jobId ?? ch.jobId,
          blId: apiRow.blId ?? ch.blId,
          typeId: apiRow.typeId ?? ch.typeId,
          sizeId: apiRow.sizeId ?? ch.sizeId,
          rateBasisId: apiRow.rateBasisId ?? ch.rateBasisId,

          // ✅ add indexValue on charge object too
          indexValue: apiRow.indexValue,

          // ✅ FIX: ensure labels are present
          chargeIddropdown: derivedChargeDD,
          currencyIddropdown: derivedCurrencyDD,

          thirdlevel,
          tblInvoiceChargeDetails: detailsRows,

          // ✅ YOUR REQUIREMENT: always 1 at charge/header level
          noOfDays: 1,

          qty: totals.qty || 0,
          rate: Number(totals.avgRate || 0).toFixed(2),
          totalAmountHc: Number(totals.totalAmountHc || 0).toFixed(2),
          totalAmountFc: Number(totals.totalAmountFc || 0).toFixed(2),

          currencyId: ch.currencyId ?? apiRow.currencyId ?? prev.currencyId,
          exchangeRate: prev.exchangeRate ?? 1,

          containerTransactionId:
            apiRow.containerTransactionId ?? ch.containerTransactionId ?? null,
          containerRepairId:
            apiRow.containerRepairId ?? ch.containerRepairId ?? null,
        };
      });

      const existingIds = new Set(
        updatedExisting.map((x) => Number(x.chargeId)),
      );

      const newOnes = apiChargesWithIndex
        .filter(
          (x) =>
            x && x.chargeId != null && !existingIds.has(Number(x.chargeId)),
        )
        .map((apiRow) => {
          const id = Number(apiRow.chargeId);

          const detailsRows = buildChargeDetailsRows(apiRow.thirdlevel);
          const totals = computeTotalsFromDetails(
            detailsRows,
            prev.exchangeRate,
          );
          const thirdlevel = buildThirdLevelForSave(detailsRows, id);

          const derivedCurrencyDD = pickValidDD(apiRow.currencyIddropdown)
            .length
            ? pickValidDD(apiRow.currencyIddropdown)
            : mkDD(
                apiRow.currencyId ?? prev.currencyId,
                detailsRows?.[0]?.currencyName ??
                  detailsRows?.[0]?.currencyIddropdown?.[0]?.label,
              );

          const derivedChargeDD = pickValidDD(apiRow.chargeIddropdown).length
            ? pickValidDD(apiRow.chargeIddropdown)
            : mkDD(id, apiRow.description ?? "");

          return {
            chargeId: id,
            description: apiRow.description ?? "",
            cargoTypeId: apiRow.cargoTypeId ?? null,
            expImp: apiRow.expImp ?? null,
            icd: apiRow.icd ?? null,
            jobId: apiRow.jobId ?? null,
            blId: apiRow.blId ?? null,
            typeId: apiRow.typeId ?? null,
            sizeId: apiRow.sizeId ?? null,
            rateBasisId: apiRow.rateBasisId ?? null,

            indexValue: apiRow.indexValue,

            // ✅ FIX: ensure labels are present for new rows too
            chargeIddropdown: derivedChargeDD,
            currencyIddropdown: derivedCurrencyDD,

            thirdlevel,
            tblInvoiceChargeDetails: detailsRows,

            // ✅ YOUR REQUIREMENT: always 1 at charge/header level
            noOfDays: 1,

            qty: totals.qty || 0,
            rate: Number(totals.avgRate || 0).toFixed(2),
            totalAmountHc: Number(totals.totalAmountHc || 0).toFixed(2),
            totalAmountFc: Number(totals.totalAmountFc || 0).toFixed(2),

            currencyId: apiRow.currencyId ?? prev.currencyId ?? null,
            exchangeRate: prev.exchangeRate ?? 1,

            containerTransactionId: apiRow.containerTransactionId ?? null,
            containerRepairId: apiRow.containerRepairId ?? null,
          };
        });

      const updatedCharges = [...updatedExisting, ...newOnes];

      const invAmount = updatedCharges.reduce(
        (sum, ch) => sum + (Number(ch.totalAmountHc) || 0),
        0,
      );
      const invAmountFc = updatedCharges.reduce(
        (sum, ch) => sum + (Number(ch.totalAmountFc) || 0),
        0,
      );

      const taxHc = Number(prev.taxAmount || 0);
      const taxFc = Number(prev.taxAmountFc || 0);

      return {
        ...prev,
        tblInvoiceCharge: updatedCharges,

        invoiceAmount: Number(invAmount.toFixed(2)),
        invoiceAmountFc: Number(invAmountFc.toFixed(2)),

        totalInvoiceAmount: Number((invAmount + taxHc).toFixed(2)),
        totalInvoiceAmountFc: Number((invAmountFc + taxFc).toFixed(2)),
      };
    });
  }

  const onConfirm = async (conformData) => {
    if (
      uriDecodedMenu?.menuName == "Journal Voucher" ||
      uriDecodedMenu?.menuName == "Contra Voucher"
    ) {
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
            id: uriDecodedMenu.id,
            menuName: uriDecodedMenu.menuName,
            parentMenuId: uriDecodedMenu.parentMenuId,
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

  async function fetchData() {
    try {
      // Call api for table grid data
      const tableViewApiResponse = await formControlMenuList(uriDecodedMenu.id);
      let tempnewState = { ...newState };
      if (tableViewApiResponse.success) {
        const apiResponseData = tableViewApiResponse.data[0];
        console.log("apiResponseData", apiResponseData);
        setFetchedApiResponse(apiResponseData);
        setFormControlData(apiResponseData);
        setIsRequiredAttachment(apiResponseData?.isRequiredAttachment);
        const tableName = apiResponseData.tableName;
        setTableName(tableName);
        apiResponseData.fields.forEach((element) => {
          tempnewState = {
            ...tempnewState,
            [element.fieldname]: element.controlDefaultValue,
          };

          if (element.controlname.toLowerCase() === "date") {
            tempnewState = {
              ...tempnewState,
              [`${element.fieldname}datetime`]:
                element.controlDefaultValue == null
                  ? "null"
                  : new Date(element.controlDefaultValue),
              [element.fieldname]: element.controlDefaultValue,
            };
          }
          if (element.controlname.toLowerCase() === "dropdown") {
            if (element.controlDefaultValue != null) {
              tempnewState = {
                ...tempnewState,
                [`${element.fieldname}dropdown`]: element.controlDefaultValue,
                [element.fieldname]: element.controlDefaultValue.value || "",
              };
            }
          }
          if (element.controlname.toLowerCase() === "multiselect") {
            if (element.controlDefaultValue != null) {
              tempnewState = {
                ...tempnewState,
                [`${element.fieldname}multiselect`]:
                  element.controlDefaultValue,
                [element.fieldname]: element.controlDefaultValue.value || "",
              };
            }
          }
          if (element.controlname.toLowerCase() === "number") {
            tempnewState = {
              ...tempnewState,
              [element.fieldname]: element.controlDefaultValue,
            };
          }
          if (element.controlname.toLowerCase() === "text") {
            tempnewState = {
              ...tempnewState,
              [element.fieldname]: element.controlDefaultValue,
            };
          }
        });
        const groupAllFieldsData = groupAndSortAllFields(
          apiResponseData.fields,
        );
        setParentsFields(groupAllFieldsData);
        const resData = groupAndSortFields(apiResponseData.fields);
        setTopParentsFields(resData.top); // Set parents fields.
        setBottomParentsFields(resData.bottom); // Set parents fields.

        let Obj = { tableName: tableName };

        for (const iterator of apiResponseData.child ||
          apiResponseData.children) {
          Obj[iterator.tableName] = [];
        }

        setNewState((prev) => {
          return {
            ...prev,
            ...Obj,
            ...tempnewState,
            attachment: [],
            menuID: uriDecodedMenu.id,
            isNoGenerate: apiResponseData.isNoGenerate,
          };
        });
        setSubmitNewState((prev) => {
          return {
            ...prev,
            ...Obj,
            ...tempnewState,
            attachment: [],
            menuID: uriDecodedMenu.id,
            isNoGenerate: apiResponseData.isNoGenerate,
          };
        });
        setOriginalData((prev) => {
          return { ...prev, ...Obj, ...tempnewState };
        });
        setInitialState((prev) => {
          return { ...prev, ...Obj, ...tempnewState };
        });
        console.log(" - -apiResponseData", apiResponseData);
        setChildsFields(apiResponseData.child || apiResponseData.children);
        setButtonsData(apiResponseData.buttons);
        setTimeout(() => {
          setIsDataLoaded(true);
        }, 500);
      } else {
        toast.error(tableViewApiResponse.message);
      }
    } catch (error) {
      console.error("Fetch Error :- ", error);
    }
  }

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    console.log("changes in charges", newState?.tblInvoiceCharge);
    let totalAmount = newState?.tblInvoiceCharge?.reduce((acc, item) => {
      return acc + Number(item?.totalAmountHc) || 0;
    }, 0);
    let taxAmount = newState?.tblInvoiceCharge?.reduce((acc, item) => {
      let temp = (item?.tblInvoiceChargeTax || [])?.reduce((acc1, item1) => {
        if (item?.taxApplicable == "true" || item?.taxApplicable == true) {
          return acc1 + Number(item1?.taxAmountHc) || 0;
        } else {
          return acc1;
        }
      }, 0);
      return acc + temp;
    }, 0);

    let totalAmountFc = newState?.tblInvoiceCharge?.reduce((acc, item) => {
      return acc + Number(item?.totalAmountFc) || 0;
    }, 0);
    let taxAmountFc = newState?.tblInvoiceCharge?.reduce((acc, item) => {
      let temp = (item?.tblInvoiceChargeTax || [])?.reduce((acc1, item1) => {
        if (item?.taxApplicable == "true" || item?.taxApplicable == true) {
          return acc1 + Number(item1?.taxAmountFc) || 0;
        } else {
          return acc1;
        }
        // return acc1 + Number(item1?.taxAmountFc)
      }, 0);
      return acc + temp;
    }, 0);
    taxAmount = Number.isNaN(taxAmount) ? 0 : taxAmount;
    taxAmountFc = Number.isNaN(taxAmountFc) ? 0 : taxAmountFc;
    setNewState((prev) => {
      return {
        ...prev,
        invoiceAmount: totalAmount,
        invoiceAmountFc: totalAmountFc,
        taxAmount: taxAmount,
        taxAmountFc: taxAmountFc,
        totalInvoiceAmount: totalAmount + taxAmount,
        totalInvoiceAmountFc: totalAmountFc + taxAmountFc,
      };
    });
  }, [newState?.tblInvoiceCharge, newState?.tblInvoiceCharge?.length]);

  // useEffect(() => {
  //   const pb = newState?.paymentBank;
  //   if (!pb) return;

  //   setNewState((prev) => {
  //     const ledgers = Array.isArray(prev?.tblVoucherLedger)
  //       ? [...prev.tblVoucherLedger]
  //       : [];
  //     const pbStr = String(pb);
  //     const row0 = ledgers.length
  //       ? { ...ledgers[0] }
  //       : {
  //         tblVoucherLedgerDetails: [],
  //         glIddropdown: [],
  //         glId: "",
  //         isChecked: true,
  //         indexValue: 0,
  //       };

  //     if (String(row0.glId || "") === pbStr && ledgers.length) return prev;

  //     row0.glId = pbStr;

  //     if (Array.isArray(prev?.paymentBankdropdown) && prev.paymentBankdropdown[0]) {
  //       row0.glIddropdown = [prev.paymentBankdropdown[0]];
  //     }

  //     if (ledgers.length) ledgers[0] = row0;
  //     else ledgers.push(row0);

  //     return { ...prev, tblVoucherLedger: ledgers };
  //   });
  // }, [newState?.paymentBank]);

  useEffect(() => {
    // Prevent calculation if tblInvoiceCharge is empty or not available
    if (!Array.isArray(newState?.tblInvoiceCharge)) return;

    // Calculate updated charges
    const updatedCharges = newState.tblInvoiceCharge.map((item) => {
      const qty = parseFloat(item.qty) || 0;
      const rate = parseFloat(item.rate) || 0;
      const exchangeRate = parseFloat(item.exchangeRate) || 0;
      const noOfDays = parseFloat(item.noOfDays);

      // If noOfDays is null/undefined/0, ignore it in calculation
      const effectiveNoOfDays = isNaN(noOfDays) || noOfDays <= 0 ? 1 : noOfDays;

      const totalAmountFc = qty * rate * effectiveNoOfDays;
      const totalAmount = totalAmountFc * exchangeRate;

      // Avoid unnecessary updates if values are already correct
      if (
        Number(item.totalAmountFc) === Number(totalAmountFc.toFixed(2)) &&
        Number(item.totalAmountHc) === Number(totalAmount.toFixed(2))
      ) {
        return item; // no change
      }

      return {
        ...item,
        totalAmountFc: totalAmountFc.toFixed(2),
        totalAmountHc: totalAmount.toFixed(2),
      };
    });

    if (
      JSON.stringify(updatedCharges) !==
      JSON.stringify(newState.tblInvoiceCharge)
    ) {
      setNewState((prev) => ({
        ...prev,
        tblInvoiceCharge: updatedCharges,
      }));
    }
  }, [newState?.tblInvoiceCharge]);

  function onLoadFunctionCall(
    functionData,
    formControlData,
    setFormControlData,
    setStateVariable,
  ) {
    console.log("functionData", formControlData, setFormControlData);
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
        console.log("newState state values", newState);
        // Call the function with the prepared arguments
        const updatedValues = func({
          args,
          newState,
          formControlData,
          setFormControlData,
          setStateVariable,
        });
        if (updatedValues) {
          // toast.success("Function called successfully");
        }
        console.log("updatedValues", updatedValues);
        // onChangeHandler(updatedValues); // Assuming you have an onChangeHandler function to handle the updated values
      }
    }
  }

  useEffect(() => {
    if (isDataLoaded && fetchedApiResponseData?.functionOnLoad?.length > 0) {
      const funcCallString = fetchedApiResponseData.functionOnLoad;
      if (funcCallString) {
        funcCallString.split(";").forEach((funcCall) => {
          onLoadFunctionCall(
            funcCall,
            formControlData,
            setFormControlData,
            setNewState,
          );
        });
      }
    } else {
      let tempNewState = { ...newState };
      if (formControlData?.fields?.length > 0) {
        formControlData.fields.forEach((element) => {
          const { fieldname, controlDefaultValue, controlname } = element;

          tempNewState[fieldname] = controlDefaultValue;
          if (controlname.toLowerCase() === "date") {
            tempNewState[`${fieldname}datetime`] =
              controlDefaultValue == null
                ? "null"
                : new Date(controlDefaultValue);
          }

          if (
            controlname.toLowerCase() === "dropdown" &&
            controlDefaultValue != null
          ) {
            tempNewState[`${fieldname}dropdown`] = controlDefaultValue;
            tempNewState[fieldname] = controlDefaultValue.value || "";
          }

          if (
            controlname.toLowerCase() === "multiselect" &&
            controlDefaultValue != null
          ) {
            tempNewState[`${fieldname}multiselect`] = controlDefaultValue;
            tempNewState[fieldname] = controlDefaultValue.value || "";
          }

          if (["number", "text"].includes(controlname.toLowerCase())) {
            tempNewState[fieldname] = controlDefaultValue;
          }
        });
        setNewState((prev) => ({
          ...prev,
          ...tempNewState,
          attachment: [],
          menuID: uriDecodedMenu.id,
        }));
        setSubmitNewState((prev) => ({
          ...prev,
          ...tempNewState,
          attachment: [],
          menuID: uriDecodedMenu.id,
        }));
        setOriginalData((prev) => ({ ...prev, ...tempNewState }));
        setInitialState((prev) => ({ ...prev, ...tempNewState }));
      }
    }
  }, [isDataLoaded, formControlData]);

  // const allocPrevRef = useRef({ amtHC: "", amtFC: "", checks: [] });

  // useEffect(() => {
  //   const toNum = (v) => {
  //     if (v === null || v === undefined || v === "") return 0;
  //     const n = Number(String(v).replace(/,/g, ""));
  //     return Number.isFinite(n) ? n : 0;
  //   };

  //   const round2 = (n) => Math.round((Number(n) || 0) * 100) / 100;

  //   // string with 2 decimals for UI fields (debit/credit)
  //   const asStr2 = (n) =>
  //     n === null || n === undefined || n === "" ? "" : round2(n).toFixed(2);

  //   // numeric-ish for balance fields (you can keep as number, or also toFixed if you want)
  //   const asNum2 = (n) => round2(n);

  //   // ✅ pick details from either flat or nested place
  //   const details = Array.isArray(newState?.tblVoucherLedgerDetails)
  //     ? newState.tblVoucherLedgerDetails
  //     : Array.isArray(newState?.tblVoucherLedger?.[0]?.tblVoucherLedgerDetails)
  //     ? newState.tblVoucherLedger[0].tblVoucherLedgerDetails
  //     : [];

  //   if (!details.length) {
  //     allocPrevRef.current = { amtHC: "", amtFC: "", checks: [] };
  //     return;
  //   }

  //   // ✅ Total payable (your "pay amount")
  //   const totalHC = toNum(newState?.amtRec ?? newState?.balanceAmtHc ?? 0);
  //   const totalFC = toNum(newState?.amtRecFC ?? newState?.balanceAmtFc ?? 0);

  //   // ✅ snapshot keys (avoid rerender loops)
  //   const checksNow = details.map((r) => !!r?.isChecked);
  //   const prev = allocPrevRef.current || { amtHC: "", amtFC: "", checks: [] };

  //   const amtHCKey = String(newState?.amtRec ?? newState?.balanceAmtHc ?? "");
  //   const amtFCKey = String(newState?.amtRecFC ?? newState?.balanceAmtFc ?? "");

  //   const sameChecks =
  //     prev.checks.length === checksNow.length &&
  //     prev.checks.every((v, i) => v === checksNow[i]);

  //   if (prev.amtHC === amtHCKey && prev.amtFC === amtFCKey && sameChecks) return;

  //   allocPrevRef.current = { amtHC: amtHCKey, amtFC: amtFCKey, checks: checksNow };

  //   // ✅ allocate sequentially
  //   let remHC = totalHC;
  //   let remFC = totalFC;

  //   const SECOND_ROW_INDEX = 1;
  //   const stopAfterSecondIfChecked = !!details?.[SECOND_ROW_INDEX]?.isChecked;

  //   const working = details.map((row, idx) => {
  //     const isChecked = !!row?.isChecked;

  //     // ✅ keep original balances stable (important!)
  //     const origBalHC =
  //       row?.__origBalHC != null ? toNum(row.__origBalHC) : toNum(row?.balanceAmount);
  //     const origBalFC =
  //       row?.__origBalFC != null ? toNum(row.__origBalFC) : toNum(row?.balanceAmountFc);

  //     // unchecked → clear allocations, keep balances = original
  //     if (!isChecked) {
  //       return {
  //         ...row,
  //         __origBalHC: origBalHC,
  //         __origBalFC: origBalFC,
  //         debitAmount: "",
  //         debitAmountFc: "",
  //         creditAmount: row?.creditAmount ?? "",
  //         creditAmountFc: row?.creditAmountFc ?? "",
  //         balanceAmount: asNum2(origBalHC),
  //         balanceAmountFc: asNum2(origBalFC),
  //       };
  //     }

  //     // if stopping after 2nd row AND we're past it → force 0 allocation, keep balances = original
  //     if (stopAfterSecondIfChecked && idx > SECOND_ROW_INDEX) {
  //       return {
  //         ...row,
  //         __origBalHC: origBalHC,
  //         __origBalFC: origBalFC,
  //         debitAmount: "",
  //         debitAmountFc: "",
  //         creditAmount: row?.creditAmount ?? "",
  //         creditAmountFc: row?.creditAmountFc ?? "",
  //         balanceAmount: asNum2(origBalHC),
  //         balanceAmountFc: asNum2(origBalFC),
  //       };
  //     }

  //     // ✅ allocate from remaining (limit by original balance)
  //     const allocHC = Math.min(remHC, origBalHC);
  //     const allocFC = Math.min(remFC, origBalFC);

  //     remHC = round2(remHC - allocHC);
  //     remFC = round2(remFC - allocFC);

  //     // 🔥 SPECIAL: after allocating 2nd row, dump ALL remaining to 0
  //     if (stopAfterSecondIfChecked && idx === SECOND_ROW_INDEX) {
  //       remHC = 0;
  //       remFC = 0;
  //     }

  //     // ✅ NEW: updated balances after allocation
  //     const newBalHC = round2(origBalHC - allocHC);
  //     const newBalFC = round2(origBalFC - allocFC);

  //     return {
  //       ...row,
  //       __origBalHC: origBalHC,
  //       __origBalFC: origBalFC,
  //       debitAmount: allocHC ? asStr2(allocHC) : "",
  //       debitAmountFc: allocFC ? asStr2(allocFC) : "",
  //       creditAmount: row?.creditAmount ?? "",
  //       creditAmountFc: row?.creditAmountFc ?? "",
  //       balanceAmount: asNum2(newBalHC),
  //       balanceAmountFc: asNum2(newBalFC),
  //     };
  //   });

  //   // ✅ commit without mutating
  //   setNewState((prevState) => {
  //     // nested under tblVoucherLedger[0]
  //     if (Array.isArray(prevState?.tblVoucherLedger?.[0]?.tblVoucherLedgerDetails)) {
  //       const ledgers = (prevState.tblVoucherLedger || []).map((l, i) =>
  //         i === 0 ? { ...l, tblVoucherLedgerDetails: working } : l
  //       );

  //       return {
  //         ...prevState,
  //         tblVoucherLedger: ledgers,
  //         // remaining in state
  //         balanceAmtHc: asStr2(remHC),
  //         balanceAmtFc: asStr2(remFC),
  //       };
  //     }

  //     // flat case
  //     return {
  //       ...prevState,
  //       tblVoucherLedgerDetails: working,
  //       balanceAmtHc: asStr2(remHC),
  //       balanceAmtFc: asStr2(remFC),
  //     };
  //   });
  // }, [
  //   newState?.amtRec,
  //   newState?.amtRecFC,
  //   newState?.balanceAmtHc,
  //   newState?.balanceAmtFc,
  //   newState?.tblVoucherLedgerDetails,
  //   newState?.tblVoucherLedger,
  // ]);

  // put this near your other refs
  // ✅ UPDATED: guard also tracks debit values (so uncheck + "0.00" forces recalculation)
  // ✅ UPDATED: prevents unnecessary setNewState loops by skipping if nothing changed

  const allocPrevRef = useRef({ amtHC: "", amtFC: "", checks: [] });

  useEffect(() => {
    const DBG = true;
    const tag = "[ALLOC_EFFECT]";

    const toNum = (v) => {
      if (v === null || v === undefined || v === "") return 0;
      const n = Number(String(v).replace(/,/g, ""));
      return Number.isFinite(n) ? n : 0;
    };

    const round2 = (n) => Math.round((Number(n) || 0) * 100) / 100;

    const asStr2 = (n) =>
      n === null || n === undefined || n === "" ? "" : round2(n).toFixed(2);

    const asNum2 = (n) => round2(n);

    // ✅ NEW: clamp to prevent negative balances/remaining (does NOT change existing flow)
    const clamp0 = (n) => Math.max(0, round2(n));

    // ✅ pay amounts
    const payHC = toNum(newState?.amtRec ?? 0);
    const payFC = toNum(newState?.amtRecFC ?? 0);

    const hasLedgers =
      Array.isArray(newState?.tblVoucherLedger) &&
      newState.tblVoucherLedger.length > 0;

    const ledgers = hasLedgers
      ? newState.tblVoucherLedger
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

    const allDetails = ledgers.flatMap((l) =>
      Array.isArray(l?.tblVoucherLedgerDetails)
        ? l.tblVoucherLedgerDetails
        : [],
    );

    if (DBG) {
      console.log(`${tag} RUN`, {
        payHC,
        payFC,
        hasLedgers,
        ledgersLen: ledgers.length,
        allDetailsLen: allDetails.length,
        snapshot: allDetails.map((r, i) => ({
          i,
          checked: !!r?.isChecked,
          debit: r?.debitAmount,
          debitFC: r?.debitAmountFc,
          origHC: r?.__origBalHC,
          origFC: r?.__origBalFC,
          balHC: r?.balanceAmount,
          balFC: r?.balanceAmountFc,
        })),
      });
    }

    if (!allDetails.length) {
      allocPrevRef.current = { amtHC: "", amtFC: "", checks: [] };
      return;
    }

    // ✅ guard keys
    const prev = allocPrevRef.current || { amtHC: "", amtFC: "", checks: [] };

    const amtHCKey = String(newState?.amtRec ?? "");
    const amtFCKey = String(newState?.amtRecFC ?? "");

    // ✅ IMPORTANT: track both checked + debit strings (so uncheck recalculates)
    const checksNow = allDetails.map((r) => ({
      c: !!r?.isChecked,
      d: String(r?.debitAmount ?? ""),
      df: String(r?.debitAmountFc ?? ""),
    }));

    const sameChecks =
      prev.checks.length === checksNow.length &&
      prev.checks.every((v, i) => {
        const cur = checksNow[i] || {};
        return v?.c === cur?.c && v?.d === cur?.d && v?.df === cur?.df;
      });

    const willReturn =
      prev.amtHC === amtHCKey && prev.amtFC === amtFCKey && sameChecks;

    if (DBG) {
      console.log(`${tag} GUARD`, {
        prev,
        amtHCKey,
        amtFCKey,
        checksNow,
        sameChecks,
        willReturn,
      });
    }

    if (willReturn) return;

    allocPrevRef.current = {
      amtHC: amtHCKey,
      amtFC: amtFCKey,
      checks: checksNow,
    };

    // PASS 1: build rows, set unchecked debit to "0.00", keep checked debits
    let sumCheckedHC = 0;
    let sumCheckedFC = 0;

    const nextLedgers = ledgers.map((ledger) => {
      const details = Array.isArray(ledger?.tblVoucherLedgerDetails)
        ? ledger.tblVoucherLedgerDetails
        : [];
      if (!details.length) return ledger;

      const nextDetails = details.map((row) => {
        const isChecked = !!row?.isChecked;

        const origBalHC =
          row?.__origBalHC != null
            ? toNum(row.__origBalHC)
            : toNum(row?.balanceAmount);
        const origBalFC =
          row?.__origBalFC != null
            ? toNum(row.__origBalFC)
            : toNum(row?.balanceAmountFc);

        // ✅ unchecked → set debit "0.00" + restore balances (clamped to avoid negatives)
        if (!isChecked) {
          return {
            ...row,
            __origBalHC: origBalHC,
            __origBalFC: origBalFC,
            debitAmount: "0.00",
            debitAmountFc: "0.00",
            creditAmount: row?.creditAmount ?? "",
            creditAmountFc: row?.creditAmountFc ?? "",
            balanceAmount: asNum2(clamp0(origBalHC)),
            balanceAmountFc: asNum2(clamp0(origBalFC)),
          };
        }

        // ✅ checked → keep existing debit if present (do not auto-increase)
        const existingHC = toNum(row?.debitAmount);
        const existingFC = toNum(row?.debitAmountFc);

        // keep values within orig balances and clamp to >= 0
        const keepHC =
          existingHC > 0 ? clamp0(Math.min(existingHC, origBalHC)) : 0;
        const keepFC =
          existingFC > 0 ? clamp0(Math.min(existingFC, origBalFC)) : 0;

        sumCheckedHC = round2(sumCheckedHC + keepHC);
        sumCheckedFC = round2(sumCheckedFC + keepFC);

        return {
          ...row,
          __origBalHC: origBalHC,
          __origBalFC: origBalFC,
          debitAmount: keepHC > 0 ? asStr2(keepHC) : "", // blank means "auto-fill later"
          debitAmountFc: keepFC > 0 ? asStr2(keepFC) : "",
          creditAmount: row?.creditAmount ?? "",
          creditAmountFc: row?.creditAmountFc ?? "",
          // ✅ clamp so balances never go negative
          balanceAmount: asNum2(clamp0(origBalHC - keepHC)),
          balanceAmountFc: asNum2(clamp0(origBalFC - keepFC)),
        };
      });

      return { ...ledger, tblVoucherLedgerDetails: nextDetails };
    });

    // remaining after keeping explicit checked debits
    // ✅ clamp so remaining doesn't go negative (prevents negative allocations later)
    let remHC = clamp0(payHC - sumCheckedHC);
    let remFC = clamp0(payFC - sumCheckedFC);

    if (DBG) {
      console.log(`${tag} PASS1`, { sumCheckedHC, sumCheckedFC, remHC, remFC });
    }

    // PASS 2: fill blank checked debits sequentially from remaining
    const filledLedgers = nextLedgers.map((ledger) => {
      const details = Array.isArray(ledger?.tblVoucherLedgerDetails)
        ? ledger.tblVoucherLedgerDetails
        : [];
      if (!details.length) return ledger;

      const nextDetails = details.map((row) => {
        if (!row?.isChecked) return row;

        const existingHC = toNum(row?.debitAmount);
        const existingFC = toNum(row?.debitAmountFc);
        if (existingHC > 0 || existingFC > 0) return row;

        const origBalHC =
          row?.__origBalHC != null
            ? toNum(row.__origBalHC)
            : toNum(row?.balanceAmount);
        const origBalFC =
          row?.__origBalFC != null
            ? toNum(row.__origBalFC)
            : toNum(row?.balanceAmountFc);

        // ✅ allocate only from non-negative remaining + within original balance
        const allocHC = clamp0(Math.min(remHC, origBalHC));
        const allocFC = clamp0(Math.min(remFC, origBalFC));

        remHC = clamp0(remHC - allocHC);
        remFC = clamp0(remFC - allocFC);

        return {
          ...row,
          debitAmount: allocHC > 0 ? asStr2(allocHC) : "0.00",
          debitAmountFc: allocFC > 0 ? asStr2(allocFC) : "0.00",
          // ✅ clamp so balances never go negative
          balanceAmount: asNum2(clamp0(origBalHC - allocHC)),
          balanceAmountFc: asNum2(clamp0(origBalFC - allocFC)),
        };
      });

      return { ...ledger, tblVoucherLedgerDetails: nextDetails };
    });

    // ✅ Prevent setNewState loop if nothing actually changed
    const computeSig = (stateObj) => {
      const sLedgers =
        Array.isArray(stateObj?.tblVoucherLedger) &&
        stateObj.tblVoucherLedger.length
          ? stateObj.tblVoucherLedger
          : [
              {
                tblVoucherLedgerDetails: Array.isArray(
                  stateObj?.tblVoucherLedgerDetails,
                )
                  ? stateObj.tblVoucherLedgerDetails
                  : [],
              },
            ];

      const sAll = sLedgers.flatMap((l) =>
        Array.isArray(l?.tblVoucherLedgerDetails)
          ? l.tblVoucherLedgerDetails
          : [],
      );

      return JSON.stringify({
        balHc: String(stateObj?.balanceAmtHc ?? ""),
        balFc: String(stateObj?.balanceAmtFc ?? ""),
        rows: sAll.map((r) => ({
          c: !!r?.isChecked,
          d: String(r?.debitAmount ?? ""),
          df: String(r?.debitAmountFc ?? ""),
          b: String(r?.balanceAmount ?? ""),
          bf: String(r?.balanceAmountFc ?? ""),
          o: String(r?.__origBalHC ?? ""),
          of: String(r?.__origBalFC ?? ""),
        })),
      });
    };

    setNewState((prevState) => {
      const out = Array.isArray(prevState?.tblVoucherLedger)
        ? {
            ...prevState,
            tblVoucherLedger: filledLedgers.filter((l) => !l?.__virtual),
            balanceAmtHc: asStr2(remHC),
            balanceAmtFc: asStr2(remFC),
          }
        : {
            ...prevState,
            tblVoucherLedgerDetails:
              filledLedgers[0]?.tblVoucherLedgerDetails || [],
            balanceAmtHc: asStr2(remHC),
            balanceAmtFc: asStr2(remFC),
          };

      if (computeSig(prevState) === computeSig(out)) {
        if (DBG) console.log(`${tag} setNewState skipped (no diff)`);
        return prevState;
      }

      if (DBG) {
        console.log(`${tag} FINAL`, {
          remHC,
          remFC,
          balanceAmtHc: out.balanceAmtHc,
          balanceAmtFc: out.balanceAmtFc,
        });
      }

      return out;
    });

    if (DBG)
      console.log(
        "====================================================================",
      );
  }, [
    newState?.amtRec,
    newState?.amtRecFC,
    newState?.tblVoucherLedger,
    newState?.tblVoucherLedgerDetails,
  ]);

  //  useEffect(() => {
  //     const list = newState?.tblVoucherLedgerDetails ?? [];
  //     if (!list.length) return;

  //     const sumField = (field) =>
  //       list.reduce((sum, row) => sum + (parseFloat(row[field]) || 0), 0);

  //     setTotals({
  //       // osAmtFC: sumField("OsAmtFC").toFixed(2),
  //       // osAmtHC: sumField("OsAmtHC").toFixed(2),
  //       // allocatedAmtHC: sumField("allocatedAmtHC").toFixed(2),
  //       // allocatedAmtFC: sumField("allocatedAmtFC").toFixed(2),
  //       balanceAmtFC: sumField("balanceAmtFC").toFixed(2),
  //       balanceAmtHC: sumField("balanceAmtHC").toFixed(2),
  //       tdsAmtFC: sumField("tdsAmtFC").toFixed(2),
  //       tdsAmtHC: sumField("tdsAmtHC").toFixed(2),
  //     });
  //   }, [newState?.tblVoucherLedgerDetails]);

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
        />

        {/* Middle Accrodian view */}
        <div
          className={`w-full p-1 ${styles.pageBackground}  overflow-y-auto  overflow-x-hidden  ${styles.thinScrollBar}`}
          style={{
            height: "calc(100vh - 24vh)",
          }}
        >
          {/* Parents Accordian */}
          {Object.keys(topParentsFields).map((section, index) => (
            <React.Fragment key={index}>
              {topParentsFields[section]?.length > 0 && (
                <ParentAccordianComponent
                  expandAll={expandAll}
                  section={section}
                  indexValue={index}
                  parentsFields={topParentsFields}
                  handleFieldValuesChange={handleFieldValuesChange}
                  handleFieldValuesChange2={handleFieldValuesChange2}
                  expandedAccordion={expandedAccordion}
                  setNewState={setNewState}
                  newState={newState}
                  setExpandedAccordion={setExpandedAccordion}
                  setOpenModal={setOpenModal}
                  setParaText={setParaText}
                  setIsError={setIsError}
                  setTypeofModal={setTypeofModal}
                  clearFlag={clearFlag}
                  setClearFlag={setClearFlag}
                  submitNewState={submitNewState}
                  setSubmitNewState={setSubmitNewState}
                  parentTableName={tableName}
                  formControlData={formControlData}
                  setFormControlData={setFormControlData}
                  getLabelValue={getLabelValue}
                />
              )}
            </React.Fragment>
          ))}

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
                originalData={originalData}
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

          {/* Parents Accordian */}
          {Object.keys(bottomParentsFields).map((section, index) => (
            <div key={index} className="w-full mt-2">
              {bottomParentsFields[section]?.length > 0 && (
                <ParentAccordianComponent
                  expandAll={expandAll}
                  section={section}
                  indexValue={index}
                  parentsFields={bottomParentsFields}
                  handleFieldValuesChange={handleFieldValuesChange}
                  handleFieldValuesChange2={handleFieldValuesChange2}
                  expandedAccordion={expandedAccordion}
                  setNewState={setNewState}
                  newState={newState}
                  setExpandedAccordion={setExpandedAccordion}
                  setOpenModal={setOpenModal}
                  setParaText={setParaText}
                  setIsError={setIsError}
                  setTypeofModal={setTypeofModal}
                  clearFlag={clearFlag}
                  setClearFlag={setClearFlag}
                  submitNewState={submitNewState}
                  setSubmitNewState={setSubmitNewState}
                  parentTableName={tableName}
                  formControlData={formControlData}
                  setFormControlData={setFormControlData}
                />
              )}
            </div>
          ))}

          {isRequiredAttachment && (
            <div className="w-full">
              <Attachments
                expandAll={expandAll}
                setExpandAll={setExpandAll}
                isParentAccordionOpen
                attachmentsArray={newState?.attachment}
                attachmentsData={newState?.attachment}
                setNewState={setNewState}
                newState={newState}
                setSubmitNewState={setSubmitNewState}
              />
            </div>
          )}
        </div>

        {/* Bottom Button grid */}
        <ButtonPanel
          buttonsData={buttonsData}
          handleButtonClick={handleButtonClick}
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
  handleFieldValuesChange: PropTypes.any,
  handleFieldValuesChange2: PropTypes.any,
  expandAll: PropTypes.any,
  setNewState: PropTypes.any,
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
  expandAll,
  parentsFields,
  handleFieldValuesChange,
  handleFieldValuesChange2,
  setNewState,
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
  useEffect(() => {
    setIsParentAccordionOpen(expandAll);
  }, [expandAll]);

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
        }}
        key={indexValue}
      >
        <AccordionSummary
          className="relative left-[11px]"
          sx={{ ...SummaryStyles }}
          expandIcon={
            <LightTooltip title={isParentAccordionOpen ? "Collapse" : "Expand"}>
              <ExpandMoreIcon
                sx={{ ...expandIconStyle }}
                onClick={() => setIsParentAccordionOpen((prev) => !prev)}
              />
            </LightTooltip>
          }
          aria-controls={`panel${indexValue + 1}-content`}
          id={`panel${indexValue + 1}-header`}
        >
          <Typography className="relative right-[11px]" key={indexValue}>
            {section}
          </Typography>
        </AccordionSummary>

        <AccordionDetails
          className={` overflow-hidden p-0 ${styles.thinScrollBar}`}
          sx={{
            ...accordianDetailsStyleForm,
          }}
        >
          <div className="">
            <CustomeInputFields
              inputFieldData={parentsFields[section]}
              values={newState}
              onValuesChange={handleFieldValuesChange}
              handleFieldValuesChange2={handleFieldValuesChange2}
              inEditMode={{ isEditMode: false, isCopy: true }}
              onChangeHandler={(result) => {
                handleChangeFunction(result);
              }}
              onBlurHandler={(result) => {
                handleBlurFunction(result);
              }}
              clearFlag={clearFlag}
              newState={newState}
              tableName={parentTableName}
              formControlData={formControlData}
              setFormControlData={setFormControlData}
              setStateVariable={setNewState}
              getLabelValue={getLabelValue}
            />
          </div>
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
  handleFieldValuesChange2,
  newState,
  setNewState,
  expandAll,
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
  const tableRef = useRef(null);
  const [clickCount, setClickCount] = useState(0);
  const [inputFieldsVisible, setInputFieldsVisible] = useState(false);
  const [isChildAccordionOpen, setIschildAccordionOpen] = useState(false);
  const [childObject, setChildObject] = useState({});
  const [renderedData, setRenderedData] = useState([]);
  const [isInputVisible, setInputVisible] = useState(false);
  const [activeColumn, setActiveColumn] = useState(null);
  const [originalData, setOriginalData] = useState(null);
  const [prevSearchInput, setPrevSearchInput] = useState("");
  const [isAscending, setIsAscending] = useState(true);
  const [sortedColumn, setSortedColumn] = useState(null);
  const [copyChildValueObj, setCopyChildValueObj] = useState([]);
  const [isGridEdit, setIsGridEdit] = useState(false);
  const [columnTotals, setColumnTotals] = useState({});
  const [containerWidth, setContainerWidth] = useState(0);
  const [calculateData, setCalculateData] = useState(0);
  const [dummyFieldArray, setDummyFieldArray] = useState([]);

  const handleFieldChildrenValuesChange = (updatedValues) => {
    let Object = { ...childObject, ...updatedValues };
    setChildObject(Object);
  };

  // const childButtonHandler = (section, indexValue, islastTab) => {
  //   if (isChildAccordionOpen) {
  //     setClickCount((prevCount) => prevCount + 1);
  //   }

  //   inputFieldsVisible == false && setInputFieldsVisible((prev) => !prev);
  //   if (inputFieldsVisible) {
  //     for (var feild of section.fields) {
  //       if (
  //         feild.isRequired &&
  //         (!Object.prototype.hasOwnProperty.call(
  //           childObject,
  //           feild.fieldname
  //         ) ||
  //           childObject[feild.fieldname].trim() === "")
  //       ) {
  //         toast.error(`Value for ${feild.yourlabel} is missing or empty.`);
  //         return;
  //       }
  //     }

  //     toast.dismiss();
  //     try {
  //       if (section.functionOnSubmit && section.functionOnSubmit !== null) {
  //         section?.functionOnSubmit
  //           .split(";")
  //           .forEach((e) =>
  //             onSubmitFunctionCall(
  //               e,
  //               newState,
  //               formControlData,
  //               newState,
  //               setNewState
  //             )
  //           );
  //         // onSubmitValidation?.[section.functionOnSubmit]({
  //         //   ...childObject})
  //       }
  //     } catch (error) {
  //       return toast.error(error.message);
  //     }
  //     const tmpData = { ...newState };
  //     const subChild = section.subChild.reduce((obj, item) => {
  //       obj[item.tableName] = [];
  //       return obj;
  //     }, {});
  //     Object.assign(subChild, childObject);
  //     if (hasBlackValues(subChild)) {
  //       return;
  //     }
  //     tmpData[section.tableName] = tmpData[section.tableName] || []; // added by me
  //     tmpData[section.tableName].push({
  //       ...subChild,
  //       isChecked: true,
  //       indexValue: tmpData[section.tableName].length,
  //     });
  //     setNewState((prev) => ({
  //       ...prev,
  //       [section.tableName]: [...tmpData[section.tableName]],
  //     }));
  //     setSubmitNewState(tmpData);
  //     setOriginalData(tmpData);
  //     setRenderedData(newState[section.tableName]);
  //     setChildObject({});
  //     setInputFieldsVisible((prev) => !prev);
  //     if (islastTab == true) {
  //       setTimeout(() => {
  //         setInputFieldsVisible((prev) => !prev);
  //       }, 3);
  //     }
  //   }
  // };

  const childButtonHandler = (section, indexValue, islastTab) => {
    //    console.log("childButtonHandler", section);
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
          let functonsArray = section.functionOnSubmit?.trim().split(";");
          //          console.log("functonsArray", functonsArray);

          // let Data = { ...childObject }
          for (const fun of functonsArray) {
            if (typeof onSubmitValidation[fun] == "function") {
            }

            let updatedData = onSubmitFunctionCall(
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
              // setClearFlag({
              //   isClear: true,
              //   fieldName: result.fieldName,
              // });
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
          //          console.log("childButtonHandler", Data);

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
      }
      setNewState(tmpData);
      setSubmitNewState(tmpData);
      setOriginalData(tmpData);
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

  // const syncAllExchangeRatesByCurrency = () => {
  //   if (!newState || !Array.isArray(newState.tblInvoiceCharge)) {
  //     return newState;
  //   }

  //   const toNum = (v) => {
  //     const n = Number(v);
  //     return Number.isFinite(n) ? n : 0;
  //   };

  //   const getCurrencyId = (row) =>
  //     row?.currencyId ?? row?.currencyIddropdown?.[0]?.value ?? null;

  //   // Pass 1: Determine canonical (first non-zero) rate per currency from top-level rows
  //   const canonicalRateByCurrency = {};
  //   for (const row of newState.tblInvoiceCharge) {
  //     const cId = getCurrencyId(row);
  //     const r = toNum(row?.exchangeRate);
  //     if (cId != null && r > 0 && canonicalRateByCurrency[cId] == null) {
  //       canonicalRateByCurrency[cId] = r; // first non-zero wins
  //     }
  //   }

  //   // Helper: recursively apply canonical rate to a row and its children
  //   const applyCanonical = (row) => {
  //     const cId = getCurrencyId(row);
  //     const canon = cId != null ? canonicalRateByCurrency[cId] : undefined;

  //     const updated = {
  //       ...row,
  //       ...(canon > 0 ? { exchangeRate: canon } : null),
  //     };

  //     // If children exist, update them too
  //     if (Array.isArray(row.tblInvoiceCharge) && row.tblInvoiceCharge.length) {
  //       updated.tblInvoiceCharge = row.tblInvoiceCharge.map(applyCanonical);
  //     }

  //     return updated;
  //   };

  //   // Pass 2: Update all rows (and nested children)
  //   setNewState((prev) => {
  //     const rows = Array.isArray(prev.tblInvoiceCharge) ? prev.tblInvoiceCharge : [];
  //     const updated = rows.map(applyCanonical);
  //     return { ...prev, tblInvoiceCharge: updated };
  //   });
  // };

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

        // If this is NOT the first row for that currency, force the locked rate
        if (locked > 0 && idx !== firstIdx) {
          return { ...row, exchangeRate: locked };
        }
        return row; // leave the first row as-is
      });

      return { ...prev, tblInvoiceCharge: updated };
    });
  };

  useEffect(() => {
    let tmpData = { ...childObject };
    section.fields?.forEach((item) => {
      if (["checkbox", "radio"].includes(item.controlname.toLowerCase())) {
        tmpData[item.fieldname] = false;
      }
    });
    setChildObject((prevObject) => ({ ...prevObject, ...tmpData }));
  }, []);
  const childExpandedAccordion = () => {
    setIschildAccordionOpen((prev) => !prev);
  };

  useEffect(() => {
    setIschildAccordionOpen(expandAll);
  }, [expandAll]);
  const handleScroll = () => {
    const container = tableRef.current;
    if (container) {
      const { scrollTop, scrollHeight, clientHeight } = container;
      const threshold = 5; // px
      const isAtBottom = scrollTop + clientHeight >= scrollHeight - threshold;
      if (isAtBottom) {
        // console.log("You have reached the bottom of the scroll.");
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
        // Calculate total based on grid type
        const newValue =
          item.gridTypeTotal === "s"
            ? rowData?.reduce((sum, row) => {
                // const parsedValue = parseFloat(row[item.fieldname] || 0);
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
    setRenderedData(newState[section.tableName]?.slice(0, 10));
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
  };

  const deleteChildRecord = (index) => {
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
    setOriginalData((prevState) => {
      const newStateCopy = { ...prevState };
      const updatedData = newStateCopy[section.tableName]?.filter(
        (_, idx) => idx !== index,
      );
      newStateCopy[section.tableName] = updatedData;
      // if (updatedData?.length === 0) {
      //   setInputFieldsVisible((prev) => !prev);
      // }
      return newStateCopy;
    });
  };

  // eslint-disable-next-line no-unused-vars
  const removeChildRecordFromInsert = (id, index) => {
    setSubmitNewState((prevState) => {
      const newStateCopy = { ...newState, ...prevState };
      // Assume each entry in the array has an 'id' property
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
    // setOriginalData(newState);
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
        setSubmitNewState(originalData);
        return setNewState(originalData);
      }
      const lowercasedInput = searchValue.toLowerCase();
      const filtered = newState[section.tableName].filter((item) => {
        // Access the item's property based on columnKey and convert to string for comparison
        let columnValue = "";
        if (controlerName.toLowerCase() === "dropdown") {
          const dropdownColumnValue = columnKey + "dropdown";
          const dropdownItem = item[dropdownColumnValue][0].label;
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
      setNewState({ ...newState, [section.tableName]: filtered });
      setSubmitNewState({ ...newState, [section.tableName]: filtered });
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
        <LightTooltip title="Save">
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

  function handleChangeFunction(result) {
    if (result?.isCheck === false) {
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
    if (result?.isCheck === false) {
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

  console.log("newState", newState);

  function gridEditSaveFunction(tableName, section) {
    const objectsToValidate = copyChildValueObj[tableName][0]; // array of objects

    for (const field of section.fields) {
      // Loop through the fields that need validation
      let isFieldValid = false; // Track if the current field is valid

      for (const object of objectsToValidate) {
        // Loop through each object in your array
        if (field.isRequired) {
          // Check if the field exists in the object and it is not empty
          if (
            Object.prototype.hasOwnProperty.call(object, field.fieldname) &&
            object[field.fieldname] &&
            object[field.fieldname].trim() !== ""
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

  // useEffect(() => {
  //   if (tableRef.current) {
  //     const width = tableRef.current.offsetWidth;
  //     setContainerWidth(width);
  //   }
  // }, [tableRef]);

  const logRef = () => {
    if (tableRef.current) {
      const width = tableRef.current.offsetWidth;
      console.log("width", width);
      setContainerWidth(width);
    } else {
      console.log("tableRef.current is not available");
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

  return (
    <>
      <Accordion
        expanded={isChildAccordionOpen}
        sx={{ ...childAccordionSection }}
      >
        <AccordionSummary
          className="relative left-[11px]"
          expandIcon={
            <LightTooltip title={isChildAccordionOpen ? "Collapse" : "Expand"}>
              <ExpandMoreIcon
                sx={{ color: "white" }}
                onClick={() => childExpandedAccordion(indexValue)}
              />
            </LightTooltip>
          }
          aria-controls={`panel${indexValue + 1}-content`}
          id={`panel${indexValue + 1}-header`}
        >
          <Typography
            key={indexValue}
            color={"white"}
            className="relative right-[11px] "
          >
            {section.childHeading || section.tableName}
          </Typography>
          {renderedData?.length > 0 && isChildAccordionOpen && (
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
          className={`${styles.pageBackground} flex   relative  `}
          sx={{
            height:
              (newState?.[section.tableName]?.length || clickCount) === 0
                ? "2.5rem"
                : "auto",
            padding: inputFieldsVisible ? "0" : "0",
            width: "100%",
          }}
        >
          <div key={indexValue} className=" w-full ">
            {/* Icon Button on the right */}
            <div className="absolute top-1 right-[-3px] flex  justify-end">
              {clickCount === 0 && (
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
            {inputFieldsVisible && (
              <div
                className={` overflow-hidden  flex    items-start gap-4 mt-[0.5rem] ml-[1rem] mb-[0.5rem]  justify-between`}
              >
                <CustomeInputFields
                  inputFieldData={section.fields}
                  onValuesChange={handleFieldChildrenValuesChange}
                  handleFieldValuesChange2={handleFieldValuesChange2}
                  values={childObject}
                  onChangeHandler={(result) => {
                    handleChangeFunction(result);
                  }}
                  onBlurHandler={(result) => {
                    handleBlurFunction(result);
                  }}
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
                <div className=" relative top-0 right-[3px] flex justify-end items-center  md:ml-20">
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
                      //syncAllExchangeRatesByCurrency();
                      lockExchangeRateFirstWins();
                    }}
                  />
                </div>
              </div>
            )}

            <div className="flex justify-end">
              <div className="flex items-center justify-end  mr-2">
                {dummyFieldArray?.length > 0 && clickCount > 0 && (
                  <>
                    {dummyFieldArray.map((item, index) => (
                      <Typography
                        variant="h5"
                        key={index}
                        className={`${styles.inputTextColor}`}
                      >
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
            </div>

            {newState[section.tableName] &&
              newState[section.tableName]?.length > 0 && (
                <>
                  {/* Table grid view Section at bottom*/}
                  <div key={indexValue}>
                    <TableContainer
                      onClick={logRef}
                      component={Paper}
                      ref={tableRef}
                      onScroll={handleScroll}
                      className={`${styles.hideScrollbar} ${styles.thinScrollBar}`}
                      sx={{
                        overflowX: "auto",
                        width: "100%",
                        height:
                          newState[section.tableName]?.length > 10
                            ? "285px"
                            : "auto",
                        overflowY:
                          newState[section.tableName]?.length > 10
                            ? "auto"
                            : "hidden",
                      }}
                    >
                      {/* <Table aria-label="collapsible table"> */}
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
                                <TableCell
                                  key={index}
                                  className={`${styles.cellHeading} cursor-pointer ${styles.tableChildHeader}`}
                                  sx={{
                                    ...childTableHeaderStyle,
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
                                  {index === 0 && (
                                    // <IconButton
                                    // disabled={typeof section.isAddFunctionality !== "undefined" ? !section.isAddFunctionality : false}
                                    //   aria-label="Add"
                                    //   className={`${styles.inputTextColor} `}
                                    //   sx={{
                                    //     ...styles.transparentBg,
                                    //     "&:hover": {
                                    //       ...styles.transparentBgHover,
                                    //     },
                                    //   }}
                                    // >
                                    //   <LightTooltip title="Add">
                                    //     <AddOutlinedIcon
                                    //       onClick={() => {
                                    //         inputFieldsVisible == false &&
                                    //           setInputFieldsVisible(
                                    //             (prev) => !prev
                                    //           );
                                    //       }}
                                    //     />
                                    //   </LightTooltip>
                                    // </IconButton>
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
                                  <span
                                    className={`${styles.labelText}`}
                                    onClick={() =>
                                      handleSortBy(field.fieldname)
                                    }
                                  >
                                    {field.yourlabel}
                                  </span>
                                  <span>
                                    {isInputVisible &&
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
                                  <span className="ml-1">
                                    {renderSortIcon(field.fieldname)}
                                  </span>
                                </TableCell>
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
                              sectionData={section}
                              key={index}
                              row={row}
                              newState={newState}
                              setNewState={setNewState}
                              setInputFieldsVisible={setInputFieldsVisible}
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
                            />
                          ))}
                          <>
                            {Object.keys(columnTotals).length > 0 &&
                              columnTotals.tableName === section.tableName && (
                                <TableRow
                                  className={`${styles.tableCellHoverEffect} ${styles.hh}`}
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
                                        className={`cursor-pointer ${styles.tableSubChildHeader} `}
                                        sx={{
                                          ...totalSumChildStyle,
                                          paddingLeft:
                                            index === 0 ? "29px" : "0px",
                                        }}
                                      >
                                        <div className="relative ">
                                          <div
                                            className={`${childTableRowStyles} `}
                                            style={{
                                              backgroundColor: "#E0E0E0",
                                            }}
                                          >
                                            {(field.type === "number" ||
                                              field.type === "decimal" ||
                                              field.type === "string") &&
                                            field.gridTotal
                                              ? columnTotals[field.fieldname]
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
