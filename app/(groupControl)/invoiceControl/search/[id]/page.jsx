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
  getRoundOffData
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
  const [invoiceRoundOff, setInvoiceRoundOff] = useState("N");
  const [parentFieldDataInArray, setParentFieldDataInArray] = useState([]);
  const [actionFieldNames, setActionFieldNames] = useState([]);
  const prevVisibleRef = useRef({});
  const prevHiddenRef = useRef({});
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

  // const handleFieldValuesChange = (updatedValues) => {
  //   const entries = Object.entries(updatedValues);
  //   const hasFile = entries.some(([, value]) => value instanceof File);

  //   if (hasFile) {
  //     // Process each entry and handle files specifically
  //     entries.forEach(([key, value]) => {
  //       if (value instanceof File) {
  //         // Process the file and update the corresponding key with JSON data
  //         handleFileAndUpdateState(value, (jsonData) => {
  //           const newFormFieldsValues = { ...newState, [key]: jsonData };
  //           setNewState(newFormFieldsValues);
  //           setSubmitNewState(newFormFieldsValues);
  //         });
  //       } else {
  //         // Directly merge non-file data into the state
  //         const newFormFieldsValues = { ...newState, [key]: value };
  //         setNewState(newFormFieldsValues);
  //         setSubmitNewState(newFormFieldsValues);
  //       }
  //     });
  //   } else {
  //     // No files, proceed as normal
  //     const formFieldsValues = { ...newState, ...updatedValues };
  //     setNewState(formFieldsValues);
  //     setSubmitNewState(formFieldsValues);
  //   }
  // };

  const handleFieldValuesChange = (updatedValues) => {
    const entries = Object.entries(updatedValues);
    const hasFile = entries.some(([, value]) => value instanceof File);

    if (hasFile) {
      entries.forEach(([key, value]) => {
        if (value instanceof File) {
          handleFileAndUpdateState(value, (jsonData) => {
            setNewState((prev) => {
              const next = { ...prev, [key]: jsonData };
              setSubmitNewState(next);
              return next;
            });
          });
        } else {
          setNewState((prev) => {
            const next = { ...prev, [key]: value };
            setSubmitNewState(next);
            return next;
          });
        }
      });
    } else {
      setNewState((prev) => {
        const next = { ...prev, ...updatedValues };
        setSubmitNewState(next);
        return next;
      });
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
        cleanData.companyBranchId = loginBranchId

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

    // -----------------------
    // helpers
    // -----------------------
    const toNumOrNull = (v) =>
      v === null || v === undefined || v === "" ? null : Number(v);

    const toNum = (v) => {
      const n = Number(v);
      return Number.isFinite(n) ? n : 0;
    };

    const mkDD = (value, label) => {
      const n = toNumOrNull(value);
      if (n === null) return [];
      return [{ value: n, label: label ?? String(n) }];
    };

    const pickValidDD = (arr) => {
      const a = Array.isArray(arr) ? arr : [];
      return a.filter((x) => x && x.value != null && x.label != null);
    };

    // 🔑 composite key to avoid overwriting when same chargeId repeats (like 4375)
    // include expImp/icd/currencyId/typeId/sizeId (add more if needed)
    const keyOf = (row) => {
      const ch = row || {};
      return [
        toNumOrNull(ch.chargeId),
        ch.expImp ?? "",
        ch.icd ?? "",
        toNumOrNull(ch.currencyId),
        toNumOrNull(ch.typeId),
        toNumOrNull(ch.sizeId),
        toNumOrNull(ch.rateBasisId),
        toNumOrNull(ch.containerRepairId),
        toNumOrNull(ch.containerTransactionId),
        toNumOrNull(ch.jobId),
        toNumOrNull(ch.blId),
      ].join("|");
    };

    // ✅ thirdlevel rows + dropdowns (including chargeId & currencyId)
    const buildChargeDetailsRows = (thirdlevelArr) => {
      const src = Array.isArray(thirdlevelArr) ? thirdlevelArr : [];

      return src.map((item, i) => {
        const _containerId = toNumOrNull(item.containerId);
        const _sizeId = toNumOrNull(item.sizeId);
        const _typeId = toNumOrNull(item.typeId);
        const _jobId = toNumOrNull(item.jobId);
        const _containerTransactionId = toNumOrNull(item.containerTransactionId);
        const _containerRepairId = toNumOrNull(item.containerRepairId);
        const _blId = toNumOrNull(item.blId);

        const _chargeId = toNumOrNull(item.chargeId);
        const _currencyId = toNumOrNull(item.currencyId);

        return {
          ...item,

          // ✅ EXACT requirement: array index only
          indexValue: i,

          // ✅ ensure dropdown labels exist
          chargeIddropdown: pickValidDD(item.chargeIddropdown).length
            ? pickValidDD(item.chargeIddropdown)
            : mkDD(_chargeId, item.chargeName ?? item.description),

          currencyIddropdown: pickValidDD(item.currencyIddropdown).length
            ? pickValidDD(item.currencyIddropdown)
            : mkDD(_currencyId, item.currencyName ?? item.currencyCode),

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
            _blId !== null ? [{ value: _blId, label: item.blNo ?? String(_blId) }] : [],

          calculatedAmount: (toNum(item.noOfDays) || 0) * (toNum(item.rate) || 0),
        };
      });
    };

    // ✅ save payload (indexValue = array index)
    const buildThirdLevelForSave = (detailsRows, fallbackChargeId) => {
      return (Array.isArray(detailsRows) ? detailsRows : []).map((r, i) => ({
        chargeId: toNumOrNull(r.chargeId ?? fallbackChargeId),
        vesselId: toNumOrNull(r.vesselId),
        indexValue: i,
        voyageId: toNumOrNull(r.voyageId ?? r.voyageid),
        jobId: toNumOrNull(r.jobId),
        blId: toNumOrNull(r.blId),
        containerId: toNumOrNull(r.containerId),
        sizeId: toNumOrNull(r.sizeId),
        typeId: toNumOrNull(r.typeId),
        freeDays: toNumOrNull(r.freeDays),
        noOfDays: toNumOrNull(r.noOfDays),
        fromDate: r.fromDate ?? null,
        toDate: r.toDate ?? null,
        qty: toNumOrNull(r.qty),
        currencyId: toNumOrNull(r.currencyId),
        exchangeRate: toNumOrNull(r.exchangeRate),
        rate: toNumOrNull(r.rate),
        amountHc: toNumOrNull(r.amountHc),
        amountFc: toNumOrNull(r.amountFc),
        containerRepairId: toNumOrNull(r.containerRepairId),
        containerTransactionId: toNumOrNull(r.containerTransactionId),
      }));
    };

    // ✅ totals for header from details (sums amountHc/amountFc + avg rate)
    const computeHeaderFromDetails = (detailsRows, headerCurrencyId) => {
      const rows = Array.isArray(detailsRows) ? detailsRows : [];

      // ✅ avoid mixing currencies: only take detail rows that match header currencyId (when set)
      const filtered =
        headerCurrencyId != null
          ? rows.filter((r) => Number(r.currencyId) === Number(headerCurrencyId))
          : rows;

      const qty = filtered.reduce((acc, r) => acc + (toNum(r.qty) || 0), 0);

      // totals from amounts (best, because your API already gives amountHc/amountFc)
      const totalAmountHc = filtered.reduce((acc, r) => acc + toNum(r.amountHc), 0);
      const totalAmountFc = filtered.reduce((acc, r) => acc + toNum(r.amountFc), 0);

      // avg rate (weighted by qty * days)
      let weightedSum = 0;
      let weightTotal = 0;
      for (const r of filtered) {
        const rate = toNum(r.rate);
        const q = toNum(r.qty) || 1;
        const d = toNum(r.noOfDays) || 1;
        const w = q * d;
        weightedSum += rate * w;
        weightTotal += w;
      }
      const avgRate = weightTotal > 0 ? weightedSum / weightTotal : 0;

      return {
        qty,
        avgRate,
        totalAmountHc,
        totalAmountFc,
        filtered,
      };
    };

    setNewState((prev) => {
      const prevCharges = Array.isArray(prev.tblInvoiceCharge)
        ? prev.tblInvoiceCharge
        : [];

      // add indexValue to API header rows (array index only)
      const apiChargesWithIndex = apiCharges.map((c, i) => ({
        ...(c || {}),
        indexValue: i,
      }));

      // map API by composite key
      const apiMap = new Map(
        apiChargesWithIndex
          .filter((x) => x && x.chargeId != null)
          .map((x) => [keyOf(x), x]),
      );

      const updatedExisting = prevCharges.map((ch) => {
        const apiRow = apiMap.get(keyOf(ch));

        if (!apiRow) {
          // not returned by API: keep but enforce header noOfDays=1
          return { ...ch, noOfDays: 1 };
        }

        const detailsRowsAll = buildChargeDetailsRows(apiRow.thirdlevel);

        // currency for header:
        // prefer existing header currencyId, else api header currencyId, else first detail row
        const headerCurrencyId =
          ch.currencyId ?? apiRow.currencyId ?? detailsRowsAll?.[0]?.currencyId ?? prev.currencyId;

        const { qty, avgRate, totalAmountHc, totalAmountFc, filtered } =
          computeHeaderFromDetails(detailsRowsAll, headerCurrencyId);

        // build save rows ONLY from filtered (so thirdlevel matches the header)
        const thirdlevel = buildThirdLevelForSave(filtered, ch.chargeId);

        // dropdown derivations
        const derivedCurrencyDD = pickValidDD(apiRow.currencyIddropdown).length
          ? pickValidDD(apiRow.currencyIddropdown)
          : pickValidDD(ch.currencyIddropdown).length
            ? pickValidDD(ch.currencyIddropdown)
            : mkDD(
              headerCurrencyId,
              filtered?.[0]?.currencyName ??
              filtered?.[0]?.currencyIddropdown?.[0]?.label,
            );

        const derivedChargeDD = pickValidDD(apiRow.chargeIddropdown).length
          ? pickValidDD(apiRow.chargeIddropdown)
          : pickValidDD(ch.chargeIddropdown).length
            ? pickValidDD(ch.chargeIddropdown)
            : mkDD(Number(ch.chargeId), apiRow.description ?? ch.description);

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

          // ✅ header indexValue array index
          indexValue: apiRow.indexValue,

          chargeIddropdown: derivedChargeDD,
          currencyIddropdown: derivedCurrencyDD,

          // ✅ keep only currency-matching detail rows in UI too
          tblInvoiceChargeDetails: filtered,
          thirdlevel,

          // ✅ requirement: header noOfDays always 1
          noOfDays: 1,

          qty: qty || 0,
          rate: +Number(avgRate || 0).toFixed(4),
          totalAmountHc: +Number(totalAmountHc || 0).toFixed(2),
          totalAmountFc: +Number(totalAmountFc || 0).toFixed(2),

          currencyId: headerCurrencyId,
          exchangeRate: prev.exchangeRate ?? 1,

          containerTransactionId:
            apiRow.containerTransactionId ?? ch.containerTransactionId ?? null,
          containerRepairId:
            apiRow.containerRepairId ?? ch.containerRepairId ?? null,
        };
      });

      // existing keys so we don't add duplicates
      const existingKeys = new Set(updatedExisting.map((x) => keyOf(x)));

      const newOnes = apiChargesWithIndex
        .filter((x) => x && x.chargeId != null && !existingKeys.has(keyOf(x)))
        .map((apiRow) => {
          const detailsRowsAll = buildChargeDetailsRows(apiRow.thirdlevel);

          const headerCurrencyId =
            apiRow.currencyId ?? detailsRowsAll?.[0]?.currencyId ?? prev.currencyId;

          const { qty, avgRate, totalAmountHc, totalAmountFc, filtered } =
            computeHeaderFromDetails(detailsRowsAll, headerCurrencyId);

          const thirdlevel = buildThirdLevelForSave(filtered, apiRow.chargeId);

          const derivedCurrencyDD = pickValidDD(apiRow.currencyIddropdown).length
            ? pickValidDD(apiRow.currencyIddropdown)
            : mkDD(
              headerCurrencyId,
              filtered?.[0]?.currencyName ??
              filtered?.[0]?.currencyIddropdown?.[0]?.label,
            );

          const derivedChargeDD = pickValidDD(apiRow.chargeIddropdown).length
            ? pickValidDD(apiRow.chargeIddropdown)
            : mkDD(Number(apiRow.chargeId), apiRow.description ?? "");

          return {
            chargeId: Number(apiRow.chargeId),
            description: apiRow.description ?? "",
            cargoTypeId: apiRow.cargoTypeId ?? null,
            expImp: apiRow.expImp ?? null,
            icd: apiRow.icd ?? null,
            jobId: apiRow.jobId ?? null,
            blId: apiRow.blId ?? null,
            typeId: apiRow.typeId ?? null,
            sizeId: apiRow.sizeId ?? null,
            rateBasisId: apiRow.rateBasisId ?? null,

            // ✅ header indexValue array index
            indexValue: apiRow.indexValue,

            chargeIddropdown: derivedChargeDD,
            currencyIddropdown: derivedCurrencyDD,

            // only matching currency detail rows
            tblInvoiceChargeDetails: filtered,
            thirdlevel,

            // ✅ requirement
            noOfDays: 1,

            qty: qty || 0,
            rate: +Number(avgRate || 0).toFixed(4),
            totalAmountHc: +Number(totalAmountHc || 0).toFixed(2),
            totalAmountFc: +Number(totalAmountFc || 0).toFixed(2),

            currencyId: headerCurrencyId,
            exchangeRate: prev.exchangeRate ?? 1,

            containerTransactionId: apiRow.containerTransactionId ?? null,
            containerRepairId: apiRow.containerRepairId ?? null,
          };
        });

      const updatedCharges = [...updatedExisting, ...newOnes];

      // invoice totals
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

        invoiceAmount: +Number(invAmount).toFixed(2),
        invoiceAmountFc: +Number(invAmountFc).toFixed(2),

        totalInvoiceAmount: +Number(invAmount + taxHc).toFixed(2),
        totalInvoiceAmountFc: +Number(invAmountFc + taxFc).toFixed(2),
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
      if (v === "" || v === "false" || v === "n" || v === "no" || v === "null")
        return false;
      return true;
    }

    if (Array.isArray(value)) return value.length > 0;
    if (value && typeof value === "object") return Object.keys(value).length > 0;

    return value !== null && value !== undefined;
  };

  const isHideValue = (value) => !isShowValue(value);

  const rebuildParentSections = (fields) => {
    const groupedAll = groupAndSortAllFields(fields || []);
    const groupedByPosition = groupAndSortFields(fields || []);

    setParentsFields(groupedAll);
    setTopParentsFields(groupedByPosition.top || {});
    setBottomParentsFields(groupedByPosition.bottom || {});
  };

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

  const updateParentFieldMeta = ({ visibleIds = [], hiddenIds = [], enableIds = [], disableIds = [] }) => {
    const visibleSet = new Set(visibleIds.map(Number));
    const hiddenSet = new Set(hiddenIds.map(Number));
    const enableSet = new Set(enableIds.map(Number));
    const disableSet = new Set(disableIds.map(Number));

    if (
      visibleSet.size === 0 &&
      hiddenSet.size === 0 &&
      enableSet.size === 0 &&
      disableSet.size === 0
    ) {
      return;
    }

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
        if (prev[name] !== null && prev[name] !== "" && prev[name] !== 0) {
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
    try {
      const tableViewApiResponse = await formControlMenuList(uriDecodedMenu.id);
      let tempnewState = { ...newState };

      if (!tableViewApiResponse.success) {
        toast.error(tableViewApiResponse.message);
        return;
      }

      const apiResponseData = tableViewApiResponse.data[0];
      console.log("apiResponseData", apiResponseData);

      setFetchedApiResponse(apiResponseData);
      setIsRequiredAttachment(apiResponseData?.isRequiredAttachment);

      const tableName = apiResponseData.tableName;
      setTableName(tableName);

      // -------------------------------------------------------
      // 1) Prepare initial state values exactly like your old logic
      // -------------------------------------------------------
      (apiResponseData.fields || []).forEach((element) => {
        tempnewState = {
          ...tempnewState,
          [element.fieldname]: element.controlDefaultValue,
        };

        if (String(element.controlname || "").toLowerCase() === "date") {
          tempnewState = {
            ...tempnewState,
            [`${element.fieldname}datetime`]:
              element.controlDefaultValue == null || element.controlDefaultValue === ""
                ? null
                : new Date(element.controlDefaultValue),
            [element.fieldname]: element.controlDefaultValue,
          };
        }

        if (String(element.controlname || "").toLowerCase() === "dropdown") {
          if (element.controlDefaultValue != null) {
            tempnewState = {
              ...tempnewState,
              [`${element.fieldname}dropdown`]: element.controlDefaultValue,
              [element.fieldname]: element.controlDefaultValue.value || "",
            };
          }
        }

        if (String(element.controlname || "").toLowerCase() === "multiselect") {
          if (element.controlDefaultValue != null) {
            tempnewState = {
              ...tempnewState,
              [`${element.fieldname}multiselect`]: element.controlDefaultValue,
              [element.fieldname]: element.controlDefaultValue.value || "",
            };
          }
        }

        if (String(element.controlname || "").toLowerCase() === "number") {
          tempnewState = {
            ...tempnewState,
            [element.fieldname]: element.controlDefaultValue,
          };
        }

        if (String(element.controlname || "").toLowerCase() === "text") {
          tempnewState = {
            ...tempnewState,
            [element.fieldname]: element.controlDefaultValue,
          };
        }

        if (
          ["checkbox", "radio", "multicheckbox"].includes(
            String(element.controlname || "").toLowerCase()
          )
        ) {
          tempnewState = {
            ...tempnewState,
            [element.fieldname]:
              element.controlDefaultValue !== undefined
                ? element.controlDefaultValue
                : null,
          };
        }
      });

      // -------------------------------------------------------
      // 2) Collect all ids that should be hidden initially
      //    a) field itself says isColumnVisible === false
      //    b) field is target of someone else's columnsToHide
      // -------------------------------------------------------
      const idsToHideInitially = new Set();

      (apiResponseData.fields || []).forEach((field) => {
        if (field?.isColumnVisible === false) {
          idsToHideInitially.add(Number(field.id));
        }

        if (
          field?.columnsToHide &&
          typeof field.columnsToHide === "string" &&
          field.columnsToHide.trim() !== ""
        ) {
          field.columnsToHide
            .split(",")
            .map((v) => Number(String(v).trim()))
            .filter((n) => !Number.isNaN(n))
            .forEach((id) => idsToHideInitially.add(id));
        }
      });

      // -------------------------------------------------------
      // 3) Create prepared parent fields with columnsToBeVisible
      // -------------------------------------------------------
      const preparedFields = (apiResponseData.fields || []).map((field) => {
        const fieldId = Number(field.id);

        let visible = true;

        if (idsToHideInitially.has(fieldId)) {
          visible = false;
        }

        // special fallback for TDS parent fields on first load
        // if tdsApplicable is not true in defaults, keep these hidden
        if (
          (field.fieldname === "tdsAmt" || field.fieldname === "tdsAmtFC") &&
          !(
            tempnewState?.tdsApplicable === true ||
            tempnewState?.tdsApplicable === "true" ||
            tempnewState?.tdsApplicable === 1 ||
            tempnewState?.tdsApplicable === "1"
          )
        ) {
          visible = false;
        }

        return {
          ...field,
          columnsToBeVisible: visible,
        };
      });

      // store flat parent fields for future show/hide updates
      setParentFieldDataInArray(preparedFields);

      // keep formControlData in sync with prepared fields
      setFormControlData({
        ...apiResponseData,
        fields: preparedFields,
      });

      // -------------------------------------------------------
      // 4) Group parent sections from prepared fields
      // -------------------------------------------------------
      const groupAllFieldsData = groupAndSortAllFields(preparedFields);
      setParentsFields(groupAllFieldsData);

      const resData = groupAndSortFields(preparedFields);
      setTopParentsFields(resData.top || {});
      setBottomParentsFields(resData.bottom || {});

      // -------------------------------------------------------
      // 5) Build child table empty structure exactly like old logic
      // -------------------------------------------------------
      let Obj = { tableName: tableName };

      for (const iterator of apiResponseData.child || apiResponseData.children || []) {
        Obj[iterator.tableName] = [];
      }

      // -------------------------------------------------------
      // 6) Final state setup exactly like your old logic
      // -------------------------------------------------------
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
        return {
          ...prev,
          ...Obj,
          ...tempnewState,
        };
      });

      setInitialState((prev) => {
        return {
          ...prev,
          ...Obj,
          ...tempnewState,
        };
      });

      setFirstState((prev) => {
        return {
          ...prev,
          ...Obj,
          ...tempnewState,
          attachment: [],
          menuID: uriDecodedMenu.id,
          isNoGenerate: apiResponseData.isNoGenerate,
        };
      });

      //setChildsFields(apiResponseData.child || apiResponseData.children || []);
      const showChildTds =
        tempnewState?.tdsApplicable === true ||
        tempnewState?.tdsApplicable === "true" ||
        tempnewState?.tdsApplicable === 1 ||
        tempnewState?.tdsApplicable === "1";

      const preparedChilds = (apiResponseData.child || apiResponseData.children || []).map(
        (child) => {
          if (child.tableName !== "tblVoucherLedger") return child;

          return {
            ...child,
            fields: (child.fields || []).map((field) => {
              if (field.fieldname === "tdsAmtFC" || field.fieldname === "tdsAmtHC") {
                return {
                  ...field,
                  columnsToBeVisible: showChildTds,
                };
              }
              return field;
            }),
          };
        }
      );

      setChildsFields(preparedChilds);
      setButtonsData(apiResponseData.buttons || []);

      setTimeout(() => {
        setIsDataLoaded(true);
      }, 500);
    } catch (error) {
      console.error("Fetch Error :- ", error);
      toast.error(error?.message || "Failed to load form data");
    }
  }
  useEffect(() => {
    fetchData();
  }, []);

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

      const updated = prev.map((field) => {
        if (field.fieldname === "tdsAmt" || field.fieldname === "tdsAmtFC") {
          return {
            ...field,
            columnsToBeVisible: showTds,
          };
        }
        return field;
      });

      const groupedAll = groupAndSortAllFields(updated);
      const groupedByPos = groupAndSortFields(updated);

      setParentsFields(groupedAll);
      setTopParentsFields(groupedByPos.top);
      setBottomParentsFields(groupedByPos.bottom);

      return updated;
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
    const showChildTds =
      newState?.tdsApplicable === true ||
      newState?.tdsApplicable === "true" ||
      newState?.tdsApplicable === 1 ||
      newState?.tdsApplicable === "1";

    setChildsFields((prev) => {
      if (!Array.isArray(prev) || prev.length === 0) return prev;

      let changed = false;

      const updated = prev.map((child) => {
        if (child.tableName !== "tblVoucherLedger") return child;

        let childChanged = false;

        const updatedFields = (child.fields || []).map((field) => {
          if (field.fieldname === "tdsAmtFC" || field.fieldname === "tdsAmtHC") {
            if (field.columnsToBeVisible !== showChildTds) {
              childChanged = true;
              return {
                ...field,
                columnsToBeVisible: showChildTds,
              };
            }
          }
          return field;
        });

        if (childChanged) {
          changed = true;
          return {
            ...child,
            fields: updatedFields,
          };
        }

        return child;
      });

      return changed ? updated : prev;
    });

    // optional safe reset when hidden
    if (!showChildTds) {
      setNewState((prev) => {
        if (!Array.isArray(prev?.tblVoucherLedger)) return prev;

        let changed = false;

        const updatedLedger = prev.tblVoucherLedger.map((row) => {
          const nextTdsAmtHC =
            row?.tdsAmtHC === null || row?.tdsAmtHC === undefined ? 0 : row.tdsAmtHC;
          const nextTdsAmtFC =
            row?.tdsAmtFC === null || row?.tdsAmtFC === undefined ? 0 : row.tdsAmtFC;

          if (nextTdsAmtHC !== row?.tdsAmtHC || nextTdsAmtFC !== row?.tdsAmtFC) {
            changed = true;
            return {
              ...row,
              tdsAmtHC: nextTdsAmtHC,
              tdsAmtFC: nextTdsAmtFC,
            };
          }

          return row;
        });

        return changed
          ? {
            ...prev,
            tblVoucherLedger: updatedLedger,
          }
          : prev;
      });

      setSubmitNewState((prev) => {
        if (!Array.isArray(prev?.tblVoucherLedger)) return prev;

        let changed = false;

        const updatedLedger = prev.tblVoucherLedger.map((row) => {
          const nextTdsAmtHC =
            row?.tdsAmtHC === null || row?.tdsAmtHC === undefined ? 0 : row.tdsAmtHC;
          const nextTdsAmtFC =
            row?.tdsAmtFC === null || row?.tdsAmtFC === undefined ? 0 : row.tdsAmtFC;

          if (nextTdsAmtHC !== row?.tdsAmtHC || nextTdsAmtFC !== row?.tdsAmtFC) {
            changed = true;
            return {
              ...row,
              tdsAmtHC: nextTdsAmtHC,
              tdsAmtFC: nextTdsAmtFC,
            };
          }

          return row;
        });

        return changed
          ? {
            ...prev,
            tblVoucherLedger: updatedLedger,
          }
          : prev;
      });
    }
  }, [newState?.tdsApplicable]);

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
  useEffect(() => {
    console.log("changes in charges", newState?.tblInvoiceCharge);

    const charges = newState?.tblInvoiceCharge || [];

    const totalAmount = charges.reduce(
      (acc, item) => acc + (Number(item?.totalAmountHc) || 0),
      0
    );

    const taxAmount = charges.reduce((acc, item) => {
      const isTaxApplicable =
        item?.taxApplicable === true ||
        item?.taxApplicable === "true" ||
        item?.taxApplicable === 1;

      const temp = (item?.tblInvoiceChargeTax || []).reduce((acc1, item1) => {
        return isTaxApplicable ? acc1 + (Number(item1?.taxAmountHc) || 0) : acc1;
      }, 0);

      return acc + temp;
    }, 0);

    const totalAmountFc = charges.reduce(
      (acc, item) => acc + (Number(item?.totalAmountFc) || 0),
      0
    );

    const taxAmountFc = charges.reduce((acc, item) => {
      const isTaxApplicable =
        item?.taxApplicable === true ||
        item?.taxApplicable === "true" ||
        item?.taxApplicable === 1;

      const temp = (item?.tblInvoiceChargeTax || []).reduce((acc1, item1) => {
        return isTaxApplicable ? acc1 + (Number(item1?.taxAmountFc) || 0) : acc1;
      }, 0);

      return acc + temp;
    }, 0);

    const tdsAmount = charges.reduce((acc, item) => {
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
    }, 0);

    const tdsAmountFc = charges.reduce((acc, item) => {
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
    }, 0);

    const safeTaxAmount = Number.isNaN(taxAmount) ? 0 : taxAmount;
    const safeTaxAmountFc = Number.isNaN(taxAmountFc) ? 0 : taxAmountFc;
    const safeTdsAmount = Number.isNaN(tdsAmount) ? 0 : tdsAmount;
    const safeTdsAmountFc = Number.isNaN(tdsAmountFc) ? 0 : tdsAmountFc;

    let totalInvoiceAmount = totalAmount + safeTaxAmount;
    let totalInvoiceAmountFc = totalAmountFc + safeTaxAmountFc;

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

  useEffect(() => {
    if (!Array.isArray(newState?.tblInvoiceCharge)) return;

    const updatedCharges = newState.tblInvoiceCharge.map((item) => {
      const qty = parseFloat(item.qty) || 0;
      const rate = parseFloat(item.rate) || 0;
      const exchangeRate = parseFloat(item.exchangeRate) || 0;
      const noOfDays = parseFloat(item.noOfDays);

      const effectiveNoOfDays = isNaN(noOfDays) || noOfDays <= 0 ? 1 : noOfDays;

      const totalAmountFc = qty * rate * effectiveNoOfDays;
      const totalAmount = totalAmountFc * exchangeRate;

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

  //pervious working code 
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
  //this code is for both bankPayment and bank Recepit
  // const allocPrevRef = useRef("");
  // const allocInternalUpdateRef = useRef(false);
  // const allocPrevRef = useRef("");
  // const allocInternalUpdateRef = useRef(false);

  // useEffect(() => {
  //   const voucherTypeId = String(newState?.voucherTypeId ?? "");
  //   if (voucherTypeId !== "9" && voucherTypeId !== "8") {
  //     return;
  //   }

  //   const shouldSwapDrCr = voucherTypeId === "8";

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

  //   const isTdsApplicable =
  //     newState?.tdsApplicable === true ||
  //     newState?.tdsApplicable === "true" ||
  //     newState?.tdsApplicable === 1 ||
  //     newState?.tdsApplicable === "1";

  //   const stateToLogic = (debitValue, creditValue) => {
  //     if (shouldSwapDrCr) {
  //       return {
  //         debit: round2(toNum(creditValue)),
  //         credit: round2(toNum(debitValue)),
  //       };
  //     }

  //     return {
  //       debit: round2(toNum(debitValue)),
  //       credit: round2(toNum(creditValue)),
  //     };
  //   };

  //   const logicToStateHC = (debitValue, creditValue) => {
  //     if (shouldSwapDrCr) {
  //       return {
  //         debitAmount: asStr2(creditValue),
  //         creditAmount: asStr2(debitValue),
  //       };
  //     }

  //     return {
  //       debitAmount: asStr2(debitValue),
  //       creditAmount: asStr2(creditValue),
  //     };
  //   };

  //   const logicToStateFC = (debitValue, creditValue) => {
  //     if (shouldSwapDrCr) {
  //       return {
  //         debitAmountFc: asStr2(creditValue),
  //         creditAmountFc: asStr2(debitValue),
  //       };
  //     }

  //     return {
  //       debitAmountFc: asStr2(debitValue),
  //       creditAmountFc: asStr2(creditValue),
  //     };
  //   };

  //   const normalizeOriginalBalance = ({
  //     originalValue,
  //     balanceValue,
  //     creditValue,
  //     debitValue,
  //   }) => {
  //     if (
  //       originalValue !== null &&
  //       originalValue !== undefined &&
  //       originalValue !== ""
  //     ) {
  //       return round2(toNum(originalValue));
  //     }

  //     const logical = stateToLogic(debitValue, creditValue);
  //     return round2(toNum(balanceValue) + logical.credit - logical.debit);
  //   };

  //   const getLedgerKey = (ledger, index) =>
  //     ledger?.voucherLedgerId != null
  //       ? String(ledger.voucherLedgerId)
  //       : String(ledger?.indexValue ?? index);

  //   const getDetailKey = (row, index) =>
  //     row?.voucherOutstandingId != null
  //       ? String(row.voucherOutstandingId)
  //       : String(row?.indexValue ?? index);

  //   const makeSnapshot = (
  //     ledgerRows,
  //     balanceAmtHc,
  //     balanceAmtFc,
  //     tdsAmt,
  //     tdsAmtFC
  //   ) =>
  //     JSON.stringify({
  //       balanceAmtHc: asStr2(balanceAmtHc),
  //       balanceAmtFc: asStr2(balanceAmtFc),
  //       tdsAmt: asStr2(tdsAmt),
  //       tdsAmtFC: asStr2(tdsAmtFC),
  //       ledgers: ledgerRows.map((ledger, ledgerIndex) => ({
  //         k: getLedgerKey(ledger, ledgerIndex),
  //         d: asStr2(ledger?.debitAmount),
  //         df: asStr2(ledger?.debitAmountFc),
  //         cr: asStr2(ledger?.creditAmount),
  //         crf: asStr2(ledger?.creditAmountFc),
  //         th: asStr2(ledger?.tdsAmtHC),
  //         tf: asStr2(ledger?.tdsAmtFC),
  //         child: !!ledger?.isChildChecked,
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
  //           t: asStr2(row?.tdsAmount),
  //         })),
  //       })),
  //     });

  //   const getSignedDisplayDelta = (debitValue, creditValue) =>
  //     round2(toNum(debitValue) - toNum(creditValue));

  //   const getEffectiveDisplayTotals = (ledgerRows) => {
  //     return ledgerRows.reduce(
  //       (acc, ledger) => {
  //         const details = Array.isArray(ledger?.tblVoucherLedgerDetails)
  //           ? ledger.tblVoucherLedgerDetails
  //           : [];

  //         if (details.length && ledger?.isChildChecked) {
  //           details.forEach((row) => {
  //             acc.hc = round2(
  //               acc.hc +
  //               getSignedDisplayDelta(row?.debitAmount, row?.creditAmount)
  //             );
  //             acc.fc = round2(
  //               acc.fc +
  //               getSignedDisplayDelta(
  //                 row?.debitAmountFc,
  //                 row?.creditAmountFc
  //               )
  //             );
  //           });
  //         } else {
  //           acc.hc = round2(
  //             acc.hc +
  //             getSignedDisplayDelta(ledger?.debitAmount, ledger?.creditAmount)
  //           );
  //           acc.fc = round2(
  //             acc.fc +
  //             getSignedDisplayDelta(
  //               ledger?.debitAmountFc,
  //               ledger?.creditAmountFc
  //             )
  //           );
  //         }

  //         return acc;
  //       },
  //       { hc: 0, fc: 0 }
  //     );
  //   };

  //   const hasLedgers =
  //     Array.isArray(newState?.tblVoucherLedger) &&
  //     newState.tblVoucherLedger.length > 0;

  //   const ledgers = hasLedgers
  //     ? newState.tblVoucherLedger
  //     : [
  //       {
  //         __virtual: true,
  //         tblVoucherLedgerDetails: Array.isArray(
  //           newState?.tblVoucherLedgerDetails
  //         )
  //           ? newState.tblVoucherLedgerDetails
  //           : [],
  //       },
  //     ];

  //   const allDetails = ledgers.flatMap((ledger) =>
  //     Array.isArray(ledger?.tblVoucherLedgerDetails)
  //       ? ledger.tblVoucherLedgerDetails
  //       : []
  //   );

  //   if (!allDetails.length && !hasLedgers) {
  //     allocPrevRef.current = "";
  //     return;
  //   }

  //   const currentSnapshot = makeSnapshot(
  //     ledgers,
  //     newState?.balanceAmtHc,
  //     newState?.balanceAmtFc,
  //     newState?.tdsAmt,
  //     newState?.tdsAmtFC
  //   );

  //   // only skip the self-triggered rerun when state already matches what we wrote
  //   if (allocInternalUpdateRef.current) {
  //     if (currentSnapshot === allocPrevRef.current) {
  //       allocInternalUpdateRef.current = false;
  //       return;
  //     }
  //     allocInternalUpdateRef.current = false;
  //   }

  //   const baseBalanceHC = round2(
  //     toNum(newState?.amtRec ?? 0) + toNum(newState?.bankCharges ?? 0)
  //   );

  //   const baseBalanceFC = round2(
  //     toNum(newState?.amtRecFC ?? 0) + toNum(newState?.bankCharges ?? 0)
  //   );

  //   let remainingHC = baseBalanceHC;
  //   let remainingFC = baseBalanceFC;

  //   const nextLedgers = ledgers.map((ledger) => {
  //     const details = Array.isArray(ledger?.tblVoucherLedgerDetails)
  //       ? ledger.tblVoucherLedgerDetails
  //       : [];

  //     // Manual parent row case
  //     if (!details.length) {
  //       const manualHC = stateToLogic(ledger?.debitAmount, ledger?.creditAmount);
  //       const manualFC = stateToLogic(
  //         ledger?.debitAmountFc,
  //         ledger?.creditAmountFc
  //       );

  //       remainingHC = round2(remainingHC - manualHC.credit + manualHC.debit);
  //       remainingFC = round2(remainingFC - manualFC.credit + manualFC.debit);

  //       return {
  //         ...ledger,
  //         isChildChecked: false,
  //         tdsAmtHC: 0,
  //         tdsAmtFC: 0,
  //       };
  //     }

  //     let isChildChecked = false;

  //     const nextDetails = details.map((row) => {
  //       const isChecked = !!row?.isChecked;
  //       if (isChecked) isChildChecked = true;

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

  //       return {
  //         ...row,
  //         __isNegRow: isNegativeRow,
  //         __origBalHC: origBalHC,
  //         __origBalFC: origBalFC,
  //         debitAmount: "0.00",
  //         debitAmountFc: "0.00",
  //         creditAmount: "0.00",
  //         creditAmountFc: "0.00",
  //         balanceAmount: asNum2(origBalHC),
  //         balanceAmountFc: asNum2(origBalFC),
  //         tdsAmount: 0,
  //       };
  //     });

  //     // First pass: negative rows
  //     nextDetails.forEach((row) => {
  //       if (!row?.isChecked) return;

  //       const origBalHC = round2(toNum(row?.__origBalHC));
  //       const origBalFC = round2(toNum(row?.__origBalFC));

  //       let logicalDebitHC = 0;
  //       let logicalCreditHC = 0;
  //       let logicalDebitFC = 0;
  //       let logicalCreditFC = 0;

  //       let balanceHC = origBalHC;
  //       let balanceFC = origBalFC;

  //       if (origBalHC < 0) {
  //         logicalDebitHC = round2(Math.abs(origBalHC));
  //         balanceHC = 0;
  //         remainingHC = round2(remainingHC + logicalDebitHC);
  //       }

  //       if (origBalFC < 0) {
  //         logicalDebitFC = round2(Math.abs(origBalFC));
  //         balanceFC = 0;
  //         remainingFC = round2(remainingFC + logicalDebitFC);
  //       }

  //       const hcState = logicToStateHC(logicalDebitHC, logicalCreditHC);
  //       const fcState = logicToStateFC(logicalDebitFC, logicalCreditFC);

  //       row.debitAmount = hcState.debitAmount;
  //       row.creditAmount = hcState.creditAmount;
  //       row.debitAmountFc = fcState.debitAmountFc;
  //       row.creditAmountFc = fcState.creditAmountFc;
  //       row.balanceAmount = asNum2(balanceHC);
  //       row.balanceAmountFc = asNum2(balanceFC);
  //       row.tdsAmount = asNum2(
  //         isTdsApplicable ? round2(logicalDebitHC * 0.02) : 0
  //       );
  //     });

  //     // Second pass: positive rows
  //     nextDetails.forEach((row) => {
  //       if (!row?.isChecked) return;

  //       const origBalHC = round2(toNum(row?.__origBalHC));
  //       const origBalFC = round2(toNum(row?.__origBalFC));

  //       const existingHC = stateToLogic(row?.debitAmount, row?.creditAmount);
  //       const existingFC = stateToLogic(
  //         row?.debitAmountFc,
  //         row?.creditAmountFc
  //       );

  //       let logicalDebitHC = existingHC.debit;
  //       let logicalCreditHC = existingHC.credit;
  //       let logicalDebitFC = existingFC.debit;
  //       let logicalCreditFC = existingFC.credit;

  //       let balanceHC = origBalHC < 0 ? 0 : origBalHC;
  //       let balanceFC = origBalFC < 0 ? 0 : origBalFC;

  //       if (origBalHC > 0) {
  //         logicalCreditHC = clamp0(Math.min(remainingHC, origBalHC));
  //         balanceHC = round2(origBalHC - logicalCreditHC);
  //         remainingHC = round2(remainingHC - logicalCreditHC);
  //       } else if (origBalHC === 0) {
  //         balanceHC = 0;
  //       }

  //       if (origBalFC > 0) {
  //         logicalCreditFC = clamp0(Math.min(remainingFC, origBalFC));
  //         balanceFC = round2(origBalFC - logicalCreditFC);
  //         remainingFC = round2(remainingFC - logicalCreditFC);
  //       } else if (origBalFC === 0) {
  //         balanceFC = 0;
  //       }

  //       const hcState = logicToStateHC(logicalDebitHC, logicalCreditHC);
  //       const fcState = logicToStateFC(logicalDebitFC, logicalCreditFC);

  //       row.debitAmount = hcState.debitAmount;
  //       row.creditAmount = hcState.creditAmount;
  //       row.debitAmountFc = fcState.debitAmountFc;
  //       row.creditAmountFc = fcState.creditAmountFc;
  //       row.balanceAmount = asNum2(balanceHC);
  //       row.balanceAmountFc = asNum2(balanceFC);
  //       row.tdsAmount = asNum2(
  //         isTdsApplicable ? round2(logicalCreditHC * 0.02) : 0
  //       );
  //     });

  //     const ledgerTdsTotal = round2(
  //       nextDetails.reduce((acc, row) => acc + toNum(row?.tdsAmount), 0)
  //     );

  //     const parentLogicHC = nextDetails.reduce(
  //       (acc, row) => {
  //         const x = stateToLogic(row?.debitAmount, row?.creditAmount);
  //         acc.debit += x.debit;
  //         acc.credit += x.credit;
  //         return acc;
  //       },
  //       { debit: 0, credit: 0 }
  //     );

  //     const parentLogicFC = nextDetails.reduce(
  //       (acc, row) => {
  //         const x = stateToLogic(row?.debitAmountFc, row?.creditAmountFc);
  //         acc.debit += x.debit;
  //         acc.credit += x.credit;
  //         return acc;
  //       },
  //       { debit: 0, credit: 0 }
  //     );

  //     const zeroStateHC = logicToStateHC(0, 0);
  //     const zeroStateFC = logicToStateFC(0, 0);

  //     const parentStateHC = logicToStateHC(
  //       round2(parentLogicHC.debit),
  //       round2(parentLogicHC.credit)
  //     );

  //     const parentStateFC = logicToStateFC(
  //       round2(parentLogicFC.debit),
  //       round2(parentLogicFC.credit)
  //     );

  //     // child rows exist:
  //     // checked children -> use child totals
  //     // none checked -> parent must be zero
  //     const nextDebitHC = isChildChecked
  //       ? parentStateHC.debitAmount
  //       : zeroStateHC.debitAmount;

  //     const nextCreditHC = isChildChecked
  //       ? parentStateHC.creditAmount
  //       : zeroStateHC.creditAmount;

  //     const nextDebitFC = isChildChecked
  //       ? parentStateFC.debitAmountFc
  //       : zeroStateFC.debitAmountFc;

  //     const nextCreditFC = isChildChecked
  //       ? parentStateFC.creditAmountFc
  //       : zeroStateFC.creditAmountFc;

  //     if (!isChildChecked) {
  //       const nextLogicHC = stateToLogic(nextDebitHC, nextCreditHC);
  //       const nextLogicFC = stateToLogic(nextDebitFC, nextCreditFC);

  //       remainingHC = round2(
  //         remainingHC - nextLogicHC.credit + nextLogicHC.debit
  //       );
  //       remainingFC = round2(
  //         remainingFC - nextLogicFC.credit + nextLogicFC.debit
  //       );
  //     }

  //     return {
  //       ...ledger,
  //       isChildChecked,
  //       tblVoucherLedgerDetails: nextDetails,
  //       debitAmount: nextDebitHC,
  //       creditAmount: nextCreditHC,
  //       debitAmountFc: nextDebitFC,
  //       creditAmountFc: nextCreditFC,
  //       tdsAmtHC: ledgerTdsTotal,
  //       tdsAmtFC: ledgerTdsTotal,
  //     };
  //   });

  //   const nextTdsAmtHC = round2(
  //     nextLedgers.reduce((acc, ledger) => acc + toNum(ledger?.tdsAmtHC), 0)
  //   );

  //   const nextTdsAmtFC = round2(
  //     nextLedgers.reduce((acc, ledger) => acc + toNum(ledger?.tdsAmtFC), 0)
  //   );

  //   const displayTotals = getEffectiveDisplayTotals(nextLedgers);

  //   const nextBalanceAmtHc = shouldSwapDrCr
  //     ? asStr2(baseBalanceHC + displayTotals.hc)
  //     : asStr2(remainingHC);

  //   const nextBalanceAmtFc = shouldSwapDrCr
  //     ? asStr2(baseBalanceFC + displayTotals.fc)
  //     : asStr2(remainingFC);

  //   const nextSnapshot = makeSnapshot(
  //     nextLedgers,
  //     nextBalanceAmtHc,
  //     nextBalanceAmtFc,
  //     nextTdsAmtHC,
  //     nextTdsAmtFC
  //   );

  //   if (
  //     nextSnapshot === currentSnapshot ||
  //     allocPrevRef.current === nextSnapshot
  //   ) {
  //     allocPrevRef.current = nextSnapshot;
  //     return;
  //   }

  //   allocPrevRef.current = nextSnapshot;
  //   allocInternalUpdateRef.current = true;

  //   setNewState((prevState) => {
  //     const nextStatePatch = {
  //       balanceAmtHc: nextBalanceAmtHc,
  //       balanceAmtFc: nextBalanceAmtFc,
  //       tdsAmt: nextTdsAmtHC,
  //       tdsAmtFC: nextTdsAmtFC,
  //     };

  //     if (hasLedgers) {
  //       const nextLedgerRows = nextLedgers.filter((l) => !l?.__virtual);

  //       const prevSnapshotInsideSetter = makeSnapshot(
  //         Array.isArray(prevState?.tblVoucherLedger)
  //           ? prevState.tblVoucherLedger
  //           : [],
  //         prevState?.balanceAmtHc,
  //         prevState?.balanceAmtFc,
  //         prevState?.tdsAmt,
  //         prevState?.tdsAmtFC
  //       );

  //       const nextSnapshotInsideSetter = makeSnapshot(
  //         nextLedgerRows,
  //         nextBalanceAmtHc,
  //         nextBalanceAmtFc,
  //         nextTdsAmtHC,
  //         nextTdsAmtFC
  //       );

  //       if (prevSnapshotInsideSetter === nextSnapshotInsideSetter) {
  //         return prevState;
  //       }

  //       return {
  //         ...prevState,
  //         tblVoucherLedger: nextLedgerRows,
  //         ...nextStatePatch,
  //       };
  //     }

  //     const nextDetails = nextLedgers[0]?.tblVoucherLedgerDetails || [];

  //     const prevSnapshotInsideSetter = makeSnapshot(
  //       [
  //         {
  //           __virtual: true,
  //           tblVoucherLedgerDetails: Array.isArray(
  //             prevState?.tblVoucherLedgerDetails
  //           )
  //             ? prevState.tblVoucherLedgerDetails
  //             : [],
  //         },
  //       ],
  //       prevState?.balanceAmtHc,
  //       prevState?.balanceAmtFc,
  //       prevState?.tdsAmt,
  //       prevState?.tdsAmtFC
  //     );

  //     const nextSnapshotInsideSetter = makeSnapshot(
  //       [
  //         {
  //           __virtual: true,
  //           tblVoucherLedgerDetails: nextDetails,
  //         },
  //       ],
  //       nextBalanceAmtHc,
  //       nextBalanceAmtFc,
  //       nextTdsAmtHC,
  //       nextTdsAmtFC
  //     );

  //     if (prevSnapshotInsideSetter === nextSnapshotInsideSetter) {
  //       return prevState;
  //     }

  //     return {
  //       ...prevState,
  //       tblVoucherLedgerDetails: nextDetails,
  //       ...nextStatePatch,
  //     };
  //   });
  // }, [
  //   newState?.voucherTypeId,
  //   newState?.amtRec,
  //   newState?.amtRecFC,
  //   newState?.bankCharges,
  //   newState?.tdsApplicable,
  //   newState?.tdsAmt,
  //   newState?.tdsAmtFC,
  //   newState?.balanceAmtHc,
  //   newState?.balanceAmtFc,
  //   JSON.stringify(newState?.tblVoucherLedger),
  //   JSON.stringify(newState?.tblVoucherLedgerDetails),
  // ]);

  const allocPrevRef = useRef("");
  const allocInternalUpdateRef = useRef(false);

  useEffect(() => {
    const voucherTypeId = String(newState?.voucherTypeId ?? "");
    if (voucherTypeId !== "9" && voucherTypeId !== "8") {
      return;
    }

    const shouldSwapDrCr = voucherTypeId === "8";

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

    const isTdsApplicable =
      newState?.tdsApplicable === true ||
      newState?.tdsApplicable === "true" ||
      newState?.tdsApplicable === 1 ||
      newState?.tdsApplicable === "1";

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

    const getLedgerKey = (ledger, index) =>
      ledger?.voucherLedgerId != null
        ? String(ledger.voucherLedgerId)
        : String(ledger?.indexValue ?? index);

    const getDetailKey = (row, index) =>
      row?.voucherOutstandingId != null
        ? String(row.voucherOutstandingId)
        : String(row?.indexValue ?? index);

    const makeSnapshot = (
      ledgerRows,
      balanceAmtHc,
      balanceAmtFc,
      tdsAmt,
      tdsAmtFC
    ) =>
      JSON.stringify({
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
          th: asStr2(ledger?.tdsAmtHC),
          tf: asStr2(ledger?.tdsAmtFC),
          ta: asStr2(ledger?.tdsAmount),
          taf: asStr2(ledger?.tdsAmountFc),
          child: !!ledger?.isChildChecked,
          rows: (Array.isArray(ledger?.tblVoucherLedgerDetails)
            ? ledger.tblVoucherLedgerDetails
            : []
          ).map((row, rowIndex) => ({
            k: getDetailKey(row, rowIndex),
            c: !!row?.isChecked,
            neg: !!row?.__isNegRow,
            ob: asStr2(row?.__origBalHC),
            obf: asStr2(row?.__origBalFC),
            d: asStr2(row?.debitAmount),
            df: asStr2(row?.debitAmountFc),
            cr: asStr2(row?.creditAmount),
            crf: asStr2(row?.creditAmountFc),
            b: asStr2(row?.balanceAmount),
            bf: asStr2(row?.balanceAmountFc),
            t: asStr2(row?.tdsAmount),
            tf: asStr2(row?.tdsAmountFc),
          })),
        })),
      });

    const getSignedDisplayDelta = (debitValue, creditValue) =>
      round2(toNum(debitValue) - toNum(creditValue));

    const getEffectiveDisplayTotals = (ledgerRows) => {
      return ledgerRows.reduce(
        (acc, ledger) => {
          const details = Array.isArray(ledger?.tblVoucherLedgerDetails)
            ? ledger.tblVoucherLedgerDetails
            : [];

          if (details.length && ledger?.isChildChecked) {
            details.forEach((row) => {
              acc.hc = round2(
                acc.hc +
                getSignedDisplayDelta(row?.debitAmount, row?.creditAmount)
              );
              acc.fc = round2(
                acc.fc +
                getSignedDisplayDelta(
                  row?.debitAmountFc,
                  row?.creditAmountFc
                )
              );
            });
          } else {
            acc.hc = round2(
              acc.hc +
              getSignedDisplayDelta(ledger?.debitAmount, ledger?.creditAmount)
            );
            acc.fc = round2(
              acc.fc +
              getSignedDisplayDelta(
                ledger?.debitAmountFc,
                ledger?.creditAmountFc
              )
            );
          }

          return acc;
        },
        { hc: 0, fc: 0 }
      );
    };

    const hasLedgers =
      Array.isArray(newState?.tblVoucherLedger) &&
      newState.tblVoucherLedger.length > 0;

    const ledgers = hasLedgers
      ? newState.tblVoucherLedger
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

    const allDetails = ledgers.flatMap((ledger) =>
      Array.isArray(ledger?.tblVoucherLedgerDetails)
        ? ledger.tblVoucherLedgerDetails
        : []
    );

    if (!allDetails.length && !hasLedgers) {
      allocPrevRef.current = "";
      return;
    }

    const currentSnapshot = makeSnapshot(
      ledgers,
      newState?.balanceAmtHc,
      newState?.balanceAmtFc,
      newState?.tdsAmt,
      newState?.tdsAmtFC
    );

    if (allocInternalUpdateRef.current) {
      if (currentSnapshot === allocPrevRef.current) {
        allocInternalUpdateRef.current = false;
        return;
      }
      allocInternalUpdateRef.current = false;
    }

    const baseBalanceHC = round2(
      toNum(newState?.amtRec ?? 0) + toNum(newState?.bankCharges ?? 0)
    );

    const baseBalanceFC = round2(
      toNum(newState?.amtRecFC ?? 0) + toNum(newState?.bankCharges ?? 0)
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
          tdsAmtHC: 0,
          tdsAmtFC: 0,
          tdsAmount: 0,
          tdsAmountFc: 0,
        };
      }

      let isChildChecked = false;

      const nextDetails = details.map((row) => {
        const isChecked = !!row?.isChecked;
        if (isChecked) isChildChecked = true;

        const origBalHC = normalizeOriginalBalance({
          originalValue: row?.__origBalHC,
          balanceValue: row?.balanceAmount,
          creditValue: row?.creditAmount,
          debitValue: row?.debitAmount,
        });

        const origBalFC = normalizeOriginalBalance({
          originalValue: row?.__origBalFC,
          balanceValue: row?.balanceAmountFc,
          creditValue: row?.creditAmountFc,
          debitValue: row?.debitAmountFc,
        });

        const isNegativeRow = origBalHC < 0 || origBalFC < 0;

        return {
          ...row,
          __isNegRow: isNegativeRow,
          __origBalHC: origBalHC,
          __origBalFC: origBalFC,
          debitAmount: "0.00",
          debitAmountFc: "0.00",
          creditAmount: "0.00",
          creditAmountFc: "0.00",
          balanceAmount: asNum2(origBalHC),
          balanceAmountFc: asNum2(origBalFC),
          tdsAmount: 0,
          tdsAmountFc: 0,
        };
      });

      nextDetails.forEach((row) => {
        if (!row?.isChecked) return;

        const origBalHC = round2(toNum(row?.__origBalHC));
        const origBalFC = round2(toNum(row?.__origBalFC));

        let logicalDebitHC = 0;
        let logicalCreditHC = 0;
        let logicalDebitFC = 0;
        let logicalCreditFC = 0;

        let balanceHC = origBalHC;
        let balanceFC = origBalFC;

        if (origBalHC < 0) {
          logicalDebitHC = round2(Math.abs(origBalHC));
          balanceHC = 0;
          remainingHC = round2(remainingHC + logicalDebitHC);
        }

        if (origBalFC < 0) {
          logicalDebitFC = round2(Math.abs(origBalFC));
          balanceFC = 0;
          remainingFC = round2(remainingFC + logicalDebitFC);
        }

        const hcState = logicToStateHC(logicalDebitHC, logicalCreditHC);
        const fcState = logicToStateFC(logicalDebitFC, logicalCreditFC);

        row.debitAmount = hcState.debitAmount;
        row.creditAmount = hcState.creditAmount;
        row.debitAmountFc = fcState.debitAmountFc;
        row.creditAmountFc = fcState.creditAmountFc;
        row.balanceAmount = asNum2(balanceHC);
        row.balanceAmountFc = asNum2(balanceFC);

        const rowTdsHC = isTdsApplicable ? round2(logicalDebitHC * 0.02) : 0;
        const rowTdsFC = isTdsApplicable ? round2(logicalDebitFC * 0.02) : 0;

        row.tdsAmount = asNum2(rowTdsHC);
        row.tdsAmountFc = asNum2(rowTdsFC);
      });

      nextDetails.forEach((row) => {
        if (!row?.isChecked) return;

        const origBalHC = round2(toNum(row?.__origBalHC));
        const origBalFC = round2(toNum(row?.__origBalFC));

        const existingHC = stateToLogic(row?.debitAmount, row?.creditAmount);
        const existingFC = stateToLogic(
          row?.debitAmountFc,
          row?.creditAmountFc
        );

        let logicalDebitHC = existingHC.debit;
        let logicalCreditHC = existingHC.credit;
        let logicalDebitFC = existingFC.debit;
        let logicalCreditFC = existingFC.credit;

        let balanceHC = origBalHC < 0 ? 0 : origBalHC;
        let balanceFC = origBalFC < 0 ? 0 : origBalFC;

        if (origBalHC > 0) {
          logicalCreditHC = clamp0(Math.min(remainingHC, origBalHC));
          balanceHC = round2(origBalHC - logicalCreditHC);
          remainingHC = round2(remainingHC - logicalCreditHC);
        } else if (origBalHC === 0) {
          balanceHC = 0;
        }

        if (origBalFC > 0) {
          logicalCreditFC = clamp0(Math.min(remainingFC, origBalFC));
          balanceFC = round2(origBalFC - logicalCreditFC);
          remainingFC = round2(remainingFC - logicalCreditFC);
        } else if (origBalFC === 0) {
          balanceFC = 0;
        }

        const hcState = logicToStateHC(logicalDebitHC, logicalCreditHC);
        const fcState = logicToStateFC(logicalDebitFC, logicalCreditFC);

        row.debitAmount = hcState.debitAmount;
        row.creditAmount = hcState.creditAmount;
        row.debitAmountFc = fcState.debitAmountFc;
        row.creditAmountFc = fcState.creditAmountFc;
        row.balanceAmount = asNum2(balanceHC);
        row.balanceAmountFc = asNum2(balanceFC);

        const rowTdsHC = isTdsApplicable ? round2(logicalCreditHC * 0.02) : 0;
        const rowTdsFC = isTdsApplicable ? round2(logicalCreditFC * 0.02) : 0;

        row.tdsAmount = asNum2(rowTdsHC);
        row.tdsAmountFc = asNum2(rowTdsFC);
      });

      const ledgerTdsTotalHC = round2(
        nextDetails.reduce((acc, row) => acc + toNum(row?.tdsAmount), 0)
      );

      const ledgerTdsTotalFC = round2(
        nextDetails.reduce((acc, row) => acc + toNum(row?.tdsAmountFc), 0)
      );

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

      const parentStateHC = logicToStateHC(
        round2(parentLogicHC.debit),
        round2(parentLogicHC.credit)
      );

      const parentStateFC = logicToStateFC(
        round2(parentLogicFC.debit),
        round2(parentLogicFC.credit)
      );

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
        debitAmount: nextDebitHC,
        creditAmount: nextCreditHC,
        debitAmountFc: nextDebitFC,
        creditAmountFc: nextCreditFC,
        tdsAmtHC: ledgerTdsTotalHC,
        tdsAmtFC: ledgerTdsTotalFC,
        tdsAmount: ledgerTdsTotalHC,
        tdsAmountFc: ledgerTdsTotalFC,
      };
    });

    const nextTdsAmtHC = round2(
      nextLedgers.reduce(
        (acc, ledger) => acc + toNum(ledger?.tdsAmtHC ?? ledger?.tdsAmount),
        0
      )
    );

    const nextTdsAmtFC = round2(
      nextLedgers.reduce(
        (acc, ledger) => acc + toNum(ledger?.tdsAmtFC ?? ledger?.tdsAmountFc),
        0
      )
    );

    const displayTotals = getEffectiveDisplayTotals(nextLedgers);

    const nextBalanceAmtHc = shouldSwapDrCr
      ? asStr2(baseBalanceHC + displayTotals.hc)
      : asStr2(remainingHC);

    const nextBalanceAmtFc = shouldSwapDrCr
      ? asStr2(baseBalanceFC + displayTotals.fc)
      : asStr2(remainingFC);

    const nextSnapshot = makeSnapshot(
      nextLedgers,
      nextBalanceAmtHc,
      nextBalanceAmtFc,
      nextTdsAmtHC,
      nextTdsAmtFC
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
      if (hasLedgers) {
        return {
          ...prevState,
          tblVoucherLedger: nextLedgers.filter((l) => !l?.__virtual),
          balanceAmtHc: nextBalanceAmtHc,
          balanceAmtFc: nextBalanceAmtFc,
          tdsAmt: nextTdsAmtHC,
          tdsAmtFC: nextTdsAmtFC,
          tdsAmount: nextTdsAmtHC,
          tdsAmountFc: nextTdsAmtFC,
        };
      }

      return {
        ...prevState,
        tblVoucherLedgerDetails:
          nextLedgers[0]?.tblVoucherLedgerDetails || [],
        balanceAmtHc: nextBalanceAmtHc,
        balanceAmtFc: nextBalanceAmtFc,
        tdsAmt: nextTdsAmtHC,
        tdsAmtFC: nextTdsAmtFC,
        tdsAmount: nextTdsAmtHC,
        tdsAmountFc: nextTdsAmtFC,
      };
    });
  }, [
    newState?.voucherTypeId,
    newState?.amtRec,
    newState?.amtRecFC,
    newState?.bankCharges,
    newState?.tdsApplicable,
    newState?.tdsAmt,
    newState?.tdsAmtFC,
    JSON.stringify(newState?.tblVoucherLedger),
    JSON.stringify(newState?.tblVoucherLedgerDetails),
  ]);
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
    let data = { ...result?.values };
    // let data = { ...result?.newState };
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
  const [tableBodyWidth, setTableBodyWidth] = useState("0px");


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
      const currentRows = Array.isArray(tmpData[section.tableName])
        ? tmpData[section.tableName]
        : [];
      const nextRows = [
        ...currentRows,
        {
          ...subChild,
          isChecked: true,
          indexValue: currentRows.length,
        },
      ];
      const nextState = {
        ...tmpData,
        [section.tableName]: nextRows,
      };

      setNewState(nextState);
      setSubmitNewState(nextState);
      setOriginalData(nextState);
      setRenderedData(nextRows?.slice(0, 10));
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

  useEffect(() => {
    if (section?.tableName !== "tblVoucherLedger") return;

    const showChildTds =
      newState?.tdsApplicable === true ||
      newState?.tdsApplicable === "true" ||
      newState?.tdsApplicable === 1 ||
      newState?.tdsApplicable === "1";

    if (!showChildTds) {
      setChildObject((prev) => ({
        ...prev,
        tdsAmtHC: 0,
        tdsAmtFC: 0,
      }));
    }
  }, [newState?.tdsApplicable, section?.tableName]);
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
                                <React.Fragment key={index}>
                                  {(section?.showSrNo === true ||
                                    section?.showSrNo === "true") &&
                                    index === 0 && (
                                      <TableCell
                                        className={`${styles.cellHeading} cursor-pointer ${styles.tableChildHeader}`}
                                        align="left"
                                        sx={{
                                          ...childTableHeaderStyle,
                                          paddingLeft: "12px",
                                          width: "64px",
                                          minWidth: "64px",
                                        }}
                                      >
                                        {index === 0 &&
                                          (section?.showSrNo === true ||
                                            section?.showSrNo === "true") && (
                                            <HoverIcon
                                              defaultIcon={addLogo}
                                              hoverIcon={plusIconHover}
                                              altText={"Add"}
                                              title={"Add"}
                                              onClick={() => {
                                                childButtonHandler(
                                                  section,
                                                  indexValue
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
                                    className={`${styles.cellHeading} cursor-pointer ${styles.tableChildHeader}`}
                                    sx={{
                                      ...childTableHeaderStyle,
                                      paddingLeft:
                                        section?.showSrNo === true ||
                                          section?.showSrNo === "true"
                                          ? "29px !important"
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
                                    {index === 0 &&
                                      !(section?.showSrNo == true ||
                                        section?.showSrNo == "true") && (
                                        <HoverIcon
                                          defaultIcon={addLogo}
                                          hoverIcon={plusIconHover}
                                          altText={"Add"}
                                          title={"Add"}
                                          onClick={() => {
                                            childButtonHandler(
                                              section,
                                              indexValue
                                            );
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
                                  className={`${styles.tableCellHoverEffect} ${styles.hh}`}
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
                                        {(section?.showSrNo === true ||
                                          section?.showSrNo === "true") &&
                                          index === 0 && (
                                            <TableCell
                                              align="left"
                                              className={`cursor-pointer ${styles.tableSubChildHeader} `}
                                              sx={{
                                                ...totalSumChildStyle,
                                                paddingLeft: "12px",
                                                width: "64px",
                                                minWidth: "64px",
                                              }}
                                            >
                                              <div className="relative ">
                                                <div
                                                  className={`${childTableRowStyles} `}
                                                  style={{
                                                    backgroundColor:
                                                      "#E0E0E0",
                                                  }}
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
