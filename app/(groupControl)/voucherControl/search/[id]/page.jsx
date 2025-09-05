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
  formControlMenuList,
  getCopyData,
  handleSubmitApi,
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
import { encryptUrlFun } from "@/utils";
import filterTblWithIsCheckedTrue from "../../utils";
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
      (a, b) => (a.sectionOrder || 0) - (b.sectionOrder || 0)
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
        (a, b) => (a.sectionOrder || 0) - (b.sectionOrder || 0)
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
  setStateVariable
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
    formControlData
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
              getCopyDetails.data[0][data.toColmunName]
            );
          } else {
            dataToCopy[data.toColmunName] =
              getCopyDetails.data[0][data.toColmunName];
          }
        });
      console.log("dataToCopy", dataToCopy);
      let childData = getCopyDetails.keyToValidate.fieldsMaping.filter(
        (data) => data.isChild == true
      );
      console.log("childData", childData);

      setChildsFields((prev) => {
        // Create a copy of the previous state
        let updatedFields = [...prev];

        childData.forEach((data) => {
          let index = updatedFields.findIndex(
            (i) => i.tableName === data.toColmunName
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
        (key) => key?.toColmunName === field?.fieldname
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
      if (isFormSaved) return toast.error("This form has already been saved. Please refresh the screen to save one more record");

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
            // onSubmitValidation?.[formControlData.functionOnSubmit]({
            //   ...newState})
          }
        } catch (error) {
          return toast.error(error.message);
        }
        try {
          let cleanData = replaceNullStrings(newState, ChildTableName);
          cleanData = filterTblWithIsCheckedTrue(cleanData);
          let data = await handleSubmitApi(cleanData);
          if (data.success == true) {
            toast.success(data.message);
            setIsFormSaved(true);
            if (isReportPresent) {
              const id = data?.data?.recordset[0]?.ParentId;
              setOpenPrintModal((prev) => !prev);
              setSubmittedMenuId(uriDecodedMenu?.id);
              setSubmittedRecordId(id);
            }
          } else {
            toast.error(data.message);
          }
          if (data.success == true) {
            dispatch(
              updateFlag({
                flag: "isRedirection",
                value: true,
              })
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
                return toast.error(invoiceRes.message);
              }
            }
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
      const isEqual = areObjectsEqual(newState, initialState);
      // event.preventDefault();
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

        // return; // Exit the function if a value is missing
        try {
          let cleanData = replaceNullStrings(newState, ChildTableName);
          cleanData = filterTblWithIsCheckedTrue(cleanData);
          let data = await handleSubmitApi(cleanData);
          if (data.success == true) {
            dispatch(
              updateFlag({
                flag: "isRedirection",
                value: true,
              })
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
                `/voucherControl?menuName=${encryptUrlFun({
                  id: uriDecodedMenu.id,
                  menuName: uriDecodedMenu.menuName,
                  parentMenuId: uriDecodedMenu.parentMenuId,
                })}`
              );
            }, 500);
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
          const cleanData = replaceNullStrings(newState, ChildTableName);
          let data = await handleSubmitApi(cleanData);
          if (data.success == true) {
            toast.success(data.message);
            const id = data?.data?.recordset[0]?.ParentId;
            if (newState.tableName == "tblInvoice") {
              let insertData = {
                invoiceId: data?.data?.recordset[0]?.ParentId || 0,
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
  };

  const onConfirm = async (conformData) => {
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
          apiResponseData.fields
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
  console.log("childsFields", childsFields);

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    console.log("changes in charges", newState?.tblInvoiceCharge);
    let totalAmount = newState?.tblInvoiceCharge?.reduce((acc, item) => {
      return acc + Number(item?.totalAmount) || 0;
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

  function onLoadFunctionCall(
    functionData,
    formControlData,
    setFormControlData,
    setStateVariable
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
            setNewState
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
            feild.fieldname
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
      const isAtBottom = scrollTop + clientHeight >= scrollHeight;
      if (isAtBottom) {
        // console.log("You have reached the bottom of the scroll.");
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
    // Initialize with initial data
    setRenderedData(newState[section.tableName]?.slice(0, 10)); // Initially render 10 items
    calculateTotalForRow(newState[section.tableName]);
  }, [newState]);

  const renderMoreData = () => {
    // Calculate the index range to render
    const lastIndex = renderedData.length + 10;
    const newData = newState[section.tableName]?.slice(
      renderedData.length,
      lastIndex
    );
    setRenderedData((prevData) => [...prevData, ...newData]);
  };

  const deleteChildRecord = (index) => {
    setNewState((prevState) => {
      const newStateCopy = { ...prevState };
      const updatedData = newStateCopy[section.tableName].filter(
        (_, idx) => idx !== index
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
        (_, idx) => idx !== index
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
        (_, idx) => idx !== index
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
        (_, idx) => idx === index
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
                  <div className={`${inputFieldsVisible ? "" : ""}`}>
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
                            ? "290px"
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
                                      section.fields
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
