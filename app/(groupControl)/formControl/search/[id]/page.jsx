"use client";
/* eslint-disable */
const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;
import * as React from "react";
import { useState, useRef, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import styles from "@/app/app.module.css";
import Accordion from "@mui/material/Accordion";
import AccordionSummary from "@mui/material/AccordionSummary";
import CloseOutlinedIcon from "@mui/icons-material/CloseOutlined";
import AccordionDetails from "@mui/material/AccordionDetails";
import Typography from "@mui/material/Typography";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import {
  CopyDataBase,
  fetchDataAPI,
  formControlMenuList,
  getCopyData,
  fetchReportData,
  handleSubmitApi,
  getTaxDetailsQuotation,
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
import { toast, ToastContainer } from "react-toastify";
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
import RowComponent from "@/app/(groupControl)/formControl/addEdit/RowComponent";
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
import Attachments from "@/app/(groupControl)/formControl/addEdit/Attachments.jsx";
import * as XLSX from "xlsx";
import * as formControlValidation from "@/helper/formControlValidation";
import * as onSubmitValidation from "@/helper/onSubmitFunction";
import QuotationModal from "@/components/Modal/quotationModal.jsx";
import QuotationModalAir from "@/components/Modal/quotationModalAir.jsx";
import BatchModel from "@/components/Modal/batchModel.jsx";
import { useChargesData } from "@/helper";
import { join, set } from "lodash";
//import moment from 'moment';
import VenderModal from "@/components/Modal/vendorModal";
import CreateBatchModal from "@/components/Modal/createBatch";
import { getUserDetails } from "@/helper/userDetails";
const { clientId } = getUserDetails();
import { decrypt } from "@/helper/security";
import { updateFlag } from "@/app/counterSlice";
import { useDispatch, useSelector } from "react-redux";
import PrintModal from "@/components/Modal/printModal.jsx";
import { encryptUrlFun } from "@/utils";
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
    const section = field.sectionHeader || "default"; // Use 'default' or any other Value forfields without sectionHeader
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
  const paramsValue = useParams();
  const encryptParams = JSON.parse(decodeURIComponent(paramsValue.id));
  const uriDecodedMenu = encryptParams;
  const [formControlData, setFormControlData] = useState([]);
  const [parentsFields, setParentsFields] = useState([]);
  const [parentFieldDataInArray, setParentFieldDataInArray] = useState([]);
  const [childsFields, setChildsFields] = useState([]);
  const [newState, setNewState] = useState({ routeName: "mastervalue" });
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
  const [disabledFieldNames, setDisabledFieldNames] = useState([]);
  const [hideFieldName, setHideFieldName] = useState([]);
  const [actionFieldNames, setActionFieldNames] = useState([]);
  const [tableName, setTableName] = useState(false);
  const [modalToggle, setModalToggle] = useState(false);
  const [modalToggleAir, setModalToggleAir] = useState(false);
  const [isReportPresent, setisReportPresent] = useState(false);
  //const [modalOpen, setModalOpen] = useState(false);
  const [tblRateRequestCharge, setTblRateRequestCharge] = useState(null);
  const [scopeOfWork, setScopeOfWork] = useState(null);
  const [vendorModal, setVendorModal] = useState(false);
  // const [sectionName, setSectionName] = useState(null);
  //omkar
  const [createBatch, setCreateBatch] = useState(false);
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
  const [firstState, setFirstState] = useState({ routeName: "mastervalue" });
  //omkar
  const prevNewStateRef = useRef({});
  const prevNewStateRefData = useRef({});

  const [openPrintModal, setOpenPrintModal] = useState(false);
  const [submittedRecordId, setSubmittedRecordId] = useState(null);
  const [submittedMenuId, setSubmittedMenuId] = useState(null);
  const [isFormSaved, setIsFormSaved] = useState(false);

  console.log("childsFields", childsFields);

  useEffect(() => {
    function checkIsDataSaved(firstState, newState) {
      return deepEqual(firstState, newState);
    }
    let isDataMatched = checkIsDataSaved(firstState, newState);
    if (isDataMatched) {
      dispatch(
        updateFlag({
          flag: "isRedirection",
          value: isDataMatched,
        })
      );
    } else {
      // setIsChangesMade(isDataMatched);
      dispatch(
        updateFlag({
          flag: "isRedirection",
          value: isDataMatched,
        })
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
    const fetchChargeDetails = async () => {
      if (
        newState.calculateTax !== undefined &&
        newState.calculateTax !== null
      ) {
        if (newState.tblRateRequestCharge.length > 0) {
          if (newState.calculateTax === true) {
            const businessSegmentId = newState.businessSegmentId;
            const quotationDate = newState.rateRequestDate;
            const { companyId, clientId } = getUserDetails();
            // Iterate through all charges and add functionality for each
            for (const charge of newState.tblRateRequestCharge) {
              const chargeId = charge.chargeId;
              const buyRate = charge.buyRate;
              const SellRate = charge.sellAmount;
              let taxAmount = 0;
              const request = {
                columns: "glId",
                tableName: "tblChargeDetails",
                whereCondition: `chargeId=${chargeId}`,
                clientIdCondition: `status=1 FOR JSON PATH ,INCLUDE_NULL_VALUES`,
              };
              try {
                const response = await fetchReportData(request);
                const glId = response.data[0].glId;
                if (glId) {
                  const requestData = {
                    DepartmentId: businessSegmentId,
                    chargeId: glId,
                    quotationDate: quotationDate,
                    companyId: companyId,
                    sellAmount: buyRate,
                    clientId: clientId,
                  };
                  const fetchTaxDetails = await getTaxDetailsQuotation(
                    requestData
                  );
                  const taxRate = fetchTaxDetails.Chargers[0]?.taxAmount;
                  if (taxRate && buyRate) {
                    taxAmount = (taxRate * buyRate) / 100;
                    charge.buyTaxAmount = taxAmount.toString();
                  } else {
                    charge.buyTaxAmount = taxAmount.toString();
                  }
                } else {
                  charge.buyTaxAmount = 0;
                }
              } catch (error) {
                console.error(
                  `Error fetching charge details for chargeId ${chargeId}`,
                  error
                );
              }
            }
            setNewState((prevState) => ({
              ...prevState,
              tblRateRequestCharge: prevState.tblRateRequestCharge.map(
                (charge) => {
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
    let allChildTableName = [];
    childsFields.map((item) => {
      allChildTableName.push(item?.tableName);
    });
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

  // aakash-y-code starts here
  const [labelName, setLabelName] = useState("");

  const getLabelValue = (labelValue) => {
    //    console.log(labelValue, "labelValue");
    setLabelName(labelValue);
  };

  const { chargedData } = useChargesData(newState?.scopeOfWork);

  const getVendorModalData = (data) => {
    //    console.log("Data after the edit page", data);

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

  //  console.log("newState ADD", newState);
  //omkar
  const formControlRef = useRef(null);

  const getCreateBatchModal = (data) => {
    //    console.log("Data after the edit page", data);

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
      console.log("field", field);
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
      getCopyDetails.keyToValidate.fieldsMaping
        .filter((data) => data.isChild)
        .forEach((data) => {
          // dataToCopy[data.tableName] = getCopyDetails.data[0][data?.toTableName];
          dataToCopy[data?.toTableName] = formControlData?.controlname.toLowerCase() == "multiselect" ? [...newState[data?.toTableName], ...getCopyDetails.data[0][data?.toTableName]] : getCopyDetails.data[0][data?.toTableName]
            ;
        });

      //      console.log("dataToCopy", dataToCopy);
      let childData = getCopyDetails.keyToValidate.fieldsMaping.filter(
        (data) => data.isChild == "true"
      );
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
        //        console.log("updatedFields", updatedFields);

        // Return the new state
        return updatedFields;
      });

      console.log("getCopyDetails", dataToCopy);

      const dataObj = dataToCopy;

      Object.keys(dataObj).forEach((key) => {
        if (Array.isArray(dataObj[key])) {
          dataObj[key] = dataObj[key].map((item, index) => ({
            ...item,
            indexValue: index + 1,
          }));
        }
      });

      const finalIndexdata = {
        ...getCopyDetails,
        data: [dataObj, ...(getCopyDetails?.data?.slice(1) || [])],
      };

      setNewState((prevState) => {
        finalIndexdata.keyToValidate.fieldsMaping.forEach((data) => {
          if (data.isChild == "true") {
            if (typeof prevState[data.ToColmunName] === "undefined") {
              prevState[data.ToColmunName] = [];
            }
            for (const iterator of finalIndexdata.data[0][data.ToColmunName]) {
              prevState[data.ToColmunName].push(iterator);
            }

            //            console.log("prevState", prevState);
          }
        });
        // return {
        //   ...prevState,
        //   ...dataToCopy,
        // };
        return {
          ...prevState,
          ...finalIndexdata.data[0],
        };
      });
      setSubmitNewState((prevState) => ({
        ...prevState,
        ...finalIndexdata.data[0],
      }));

      setKeysTovalidate(finalIndexdata.keyToValidate.fieldsMaping);
    } catch (error) {
      console.error("Fetch Error :", error);
    }
  };

  //  console.log("copy", newState);

  Object.keys(parentsFields)?.forEach((section) => {
    // setSectionName(section);
    parentsFields[section]?.forEach((field) => {
      const keyMapping = keysTovalidate.find(
        (key) => key?.toColmunName === field?.fieldname
      );
      if (keyMapping) {
        //        console.log("keyMapping", keyMapping);
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

  // Define your button click handlers
  const handleButtonClick = {
    handleSubmit: async () => {
      // formControlData._onSubmitResults = {};

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
            fetchedApiResponseData?.functionOnSubmit &&
            fetchedApiResponseData?.functionOnSubmit !== null
          ) {
            await Promise.all(
              fetchedApiResponseData?.functionOnSubmit.split(";").map((e) =>
                onSubmitFunctionCall(
                  e,
                  newState,
                  fetchedApiResponseData,
                  newState,
                  setNewState,
                  submitNewState,
                  setSubmitNewState
                ).then((res) => {
                  fetchedApiResponseData._onSubmitResults = {
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
          // return
          const submitData = formControlData?._onSubmitResults?.result?.values
            ? formControlData?._onSubmitResults?.result?.values
            : newState;
          const cleanData = replaceNullStrings(submitData, ChildTableName);
          setIsFormSaved(true);
          let data = await handleSubmitApi(cleanData);
          if (data.success == true) {
            dispatch(
              updateFlag({
                flag: "isRedirection",
                value: true,
              })
            );
            setIsFormSaved(true);
            toast.success(data.message);
            // setTimeout(() => {
            //   push(
            //     `/formControl?menuName=${encryptUrlFun({
            //       id: uriDecodedMenu.id,
            //       menuName: uriDecodedMenu.menuName,
            //       parentMenuId: uriDecodedMenu.parentMenuId,
            //     })}`
            //   );
            // }, 500);
          } else {
            toast.error(data.message);
            setIsFormSaved(false);
          }
          if (data.success == true) {
            // toast.success(data.message);
            if (isReportPresent) {
              //const id = data?.data?.recordset[0]?.ParentId;
              const id = data?.data?.recordset?.at(-1)?.ParentId;
              setOpenPrintModal((prev) => !prev);
              setSubmittedMenuId(uriDecodedMenu?.id);
              setSubmittedRecordId(id);
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
      //      console.log(
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
      //  console.log("quantitesGridData", fData);
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
        //        console.log("chargedGroupData", chargedGroupData);
        return id || "";
      };
      const megeredIntoTheRateRequestCharge =
        newState?.tblRateRequestCharge?.concat(newData);
      //      console.log(
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

      const updatedData =
        formatData.length !== 0 ? formatData : newState?.tblRateRequestCharge;
      const uniqueItems = Array.from(new Set(updatedData));
      const showItems = uniqueItems.map((item) => {
        return {
          ...item,
          //sizeIdDropdown: item.sizeIdDropdown[0]?.label,
          //typeIdDropdown: item?.typeIdDropdown[0]?.label,
        };
      });
      const parentCurrencyId = newState.currencyId;
      const parentExchangeRate = newState.exchangeRate;

      const chargesWithExchangeRates = await Promise.all(
        showItems.map(async (charge) => {
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
      setNewState((prev) => {
        return {
          ...prev,
          tblRateRequestCharge:
            newState?.scopeOfWork === null ||
            newState?.scopeOfWork?.length === 0
              ? []
              : chargesWithExchangeRates.filter((r) => r !== undefined),
        };
      });
      const submitData = uniqueItems.map((item) => {
        return {
          ...item,
          chargeId: item.chargeId || null,
          qty: `${item.qty || ""}`,
          sizeId: `${item.sizeId || ""}`,
          sizeIdDropdown: Array.isArray(item?.sizeIdDropdown)
            ? item?.sizeIdDropdown
            : item?.sizeIdDropdown,
          sizeIddropdown: Array.isArray(item?.sizeIddropdown)
            ? item.sizeIddropdown
            : item.sizeIdDropdown,
          typeId: `${item.typeId || ""}`,
          typeIdDropdown: Array.isArray(item?.typeIdDropdown)
            ? item?.typeIdDropdown
            : item?.typeIdDropdown,
        };
      });
      setSubmitNewState((prev) => {
        return {
          ...prev,
          tblRateRequestCharge:
            newState?.scopeOfWork === null ||
            newState?.scopeOfWork?.length === 0
              ? []
              : submitData.filter((r) => r !== undefined),
        };
      });
    },

    createChargesForAir: async () => {
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

          if (newState?.scopeOfWork) {
            scopeOfWork = newState?.scopeOfWork.split(",");
            scopeOfWorkMultiselect = newState?.scopeOfWorkmultiselect;
            for (const work of scopeOfWork) {
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
                  scopeOfWorkmultiselect: filteredScopeOfWork
                    ? [filteredScopeOfWork]
                    : [],
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
                chargeGroupId:
                  (Array.isArray(item.createdScopeOfWorkmultiselect) &&
                    item.createdScopeOfWorkmultiselect[0]?.value) ||
                  null,
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
                  item.currencyId !== null && item.currencyId !== undefined
                    ? String(item.currencyId)
                    : null,
                buyCurrencyIddropdown: [
                  {
                    label: item.currencyName,
                    value: item.currencyId,
                  },
                ],
                sellCurrencyId:
                  item.currencyId !== null && item.currencyId !== undefined
                    ? String(item.currencyId)
                    : null,
                sellCurrencyIddropdown: [
                  {
                    label: item.currencyName,
                    value: item.currencyId,
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

    handleCreateBatch: () => {
      setModalOpen(true);
      //alert("Working")
    },

    handleEdit: () => {
      //      // console.log("Edit clicked");
      toast.error("Not available now");
    },
    handleDelete: () => {
      //      // console.log("Delete clicked");
      setNewState(initialState);
      setSubmitNewState(initialState);
    },
    handleClose: () => {
      //      // console.log("Close clicked");
      setParaText("Do you want to close this form, all changes will be lost?");
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
      // formControlData._onSubmitResults = {};
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
            fetchedApiResponseData.functionOnSubmit &&
            fetchedApiResponseData.functionOnSubmit !== null
          ) {
            await Promise.all(
              fetchedApiResponseData?.functionOnSubmit.split(";").map((e) =>
                onSubmitFunctionCall(
                  e,
                  newState,
                  fetchedApiResponseData,
                  newState,
                  setNewState,
                  submitNewState,
                  setSubmitNewState
                ).then((res) => {
                  fetchedApiResponseData._onSubmitResults = {
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
            : newState;
          const cleanData = replaceNullStrings(submitData, ChildTableName);
          setIsFormSaved(true);
          let data = await handleSubmitApi(cleanData);
          if (data.success == true) {
            dispatch(
              updateFlag({
                flag: "isRedirection",
                value: true,
              })
            );
            setIsFormSaved(false);
            toast.success(data.message);
            const requestBody = {
              tableName: tableName,
              recordId: paramsValue.id,
            };
            const validateSubmitData = await validateSubmit(requestBody);
            if (validateSubmitData.success === true) {
              setParaText(validateSubmitData.message);
              setIsError(false);
              setOpenModal((prev) => !prev);
            }
            setTimeout(() => {
              push(
                `/formControl?menuName=${encryptUrlFun({
                  id: uriDecodedMenu.id,
                  menuName: uriDecodedMenu.menuName,
                  parentMenuId: uriDecodedMenu.parentMenuId,
                })}`
              );
            }, 500);
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
            //const id = data?.data?.recordset[0]?.ParentId;
            const id = data?.data?.recordset?.at(-1)?.ParentId;
            setOpenPrintModal((prev) => !prev);
            //setSubmittedMenuId(paramsValue.id);
            setSubmittedMenuId(uriDecodedMenu?.id);
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
    handleCopyDataBase: async () => {
      try {
        let responce = await CopyDataBase(newState);
        if (responce.success == true) {
          toast.success(responce.message);
        } else {
          toast.error(responce.message);
        }
      } catch (error) {
        toast.error(error.message);
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

  useEffect(() => {
    fetchData();
  }, []);
  const fetchData = async () => {
    // debugger;
    try {
      const tableViewApiResponse = await formControlMenuList(uriDecodedMenu.id);
      let tempNewState = { ...newState };

      if (!tableViewApiResponse.success) {
        console.warn("API call failed:", tableViewApiResponse.message);

        // Ensure state consistency even if API fails
        setFormControlData({ fields: [] });
        setParentsFields({});
        return;
      }

      const apiResponseData = tableViewApiResponse.data[0];
      setFetchedApiResponse(apiResponseData);
      setFormControlData(apiResponseData);
      setIsRequiredAttachment(apiResponseData?.isRequiredAttachment);
      const tableName = apiResponseData.tableName;
      setTableName(tableName);
      let idsWithHiddenColumns = [];
      apiResponseData.fields.forEach((element) => {
        tempNewState = {
          ...tempNewState,
          [element.fieldname]: ["checkbox", "radio", "multicheckbox"].includes(
            element.controlname.toLowerCase()
          )
            ? element.controlDefaultValue !== null
              ? element.controlDefaultValue
              : "n"
            : element.controlDefaultValue,
        };
      });
      console.log("tempNewState", tempNewState);

      if (apiResponseData?.fields.length > 0) {
        apiResponseData.fields.forEach((element, i) => {
          if (
            element.columnsToHide &&
            typeof element.columnsToHide === "string" &&
            element.columnsToHide.trim().length > 0
          ) {
            const hiddenValues = element.columnsToHide
              .split(",")
              .map((val) => val.trim());
            idsWithHiddenColumns.push(...hiddenValues);
          }
        });
        console.log("idsWithHiddenColumns", idsWithHiddenColumns);

        apiResponseData.fields = apiResponseData.fields.map((element) => {
          if (idsWithHiddenColumns.includes(element.id.toString())) {
            console.log("found", element);
            return { ...element, columnsToBeVisible: false };
          } else {
            return { ...element, columnsToBeVisible: true };
          }
        });
        console.log("apiResponseData.fields=>", apiResponseData.fields);
        setParentFieldDataInArray(apiResponseData.fields);
        const resData = groupAndSortFields(apiResponseData.fields);
        let updatedFormControlDataParentsFields = { ...resData };
        console.log(
          "updatedFormControlDataParentsFields",
          updatedFormControlDataParentsFields
        );
        setParentsFields(updatedFormControlDataParentsFields);
      }
      let Obj = { tableName: tableName };

      for (const iterator of apiResponseData.child ||
        apiResponseData.children) {
        Obj[iterator.tableName] = [];
      }

      setNewState((prev) => ({
        ...prev,
        ...Obj,
        ...tempNewState,
        attachment: [],
        menuID: uriDecodedMenu.id,
        isNoGenerate: apiResponseData.isNoGenerate,
      }));

      setSubmitNewState((prev) => ({
        ...prev,
        ...Obj,
        ...tempNewState,
        attachment: [],
        menuID: uriDecodedMenu.id,
        isNoGenerate: apiResponseData.isNoGenerate,
      }));

      setFirstState((prev) => ({
        ...prev,
        ...Obj,
        ...tempNewState,
        attachment: [],
        menuID: uriDecodedMenu.id,
        isNoGenerate: apiResponseData.isNoGenerate,
      }));

      setOriginalData((prev) => ({
        ...prev,
        ...Obj,
        ...tempNewState,
      }));

      setInitialState((prev) => ({
        ...prev,
        ...Obj,
        ...tempNewState,
      }));

      setChildsFields(apiResponseData.child || apiResponseData.children);
      setButtonsData(apiResponseData.buttons);

      setTimeout(() => {
        setIsDataLoaded(true);
      }, 500);
    } catch (error) {
      console.error("Fetch Error:", error);
      setFormControlData({ fields: [] });
      setParentsFields({});
    }
  };

  useEffect(() => {
    if (Object.keys(parentsFields).length > 0) {
      functionHideDisable();
    }
  }, [parentsFields, newState, newState.cargoTypeId]);

  // 🔹 Fetch Disabled Fields from API
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

        //        console.log("Final Merged Fields:", mergedFields);
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
      //      //console.log("API Response:", response);

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

    //    console.log(`Fields changed: ${changedFieldNames.join(", ")}`);

    // Find all matching records in actionFieldNames
    matchedRecordArray =
      actionFieldNames?.filter((record) =>
        changedFieldNames.includes(record.parentFieldName)
      ) || [];

    //    console.log("Matched Records Array:", matchedRecordArray);

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

          //          console.log("Formatted Hidden Fields:", hiddenFieldsFormatted);
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

  // SECOND useEffect: Runs only when changedFieldNames contain `null` values
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

    //    console.log(`Fields changed to NULL: ${changedFieldNames.join(", ")}`);

    // Find all matching records in actionFieldNames
    matchedRecordArray =
      actionFieldNames?.filter((record) =>
        changedFieldNames.includes(record.parentFieldName)
      ) || [];

    //    console.log("Matched Records Array:", matchedRecordArray);

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
              //              console.log("Matched Field:", control?.fieldname);
              setFieldNameNull.push(control?.fieldname);
              //              console.log("setFieldNameNull =>>", setFieldNameNull);
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

          //          console.log("Formatted Hidden Fields:", hiddenFieldsFormatted);
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
  //   console.log("omk", newState);

  //   const isHazardous = newState?.cargoTypeIddropdown
  //     ? newState?.cargoTypeIddropdown?.[0]?.label === "HAZARDOUS"
  //     : newState?.cargoTypeId === 164;

  //   const routeLabel = newState?.routeIddropdown?.[0]?.label || "";
  //   const isTranshipment = routeLabel === "Transhipment";

  //   // ✅ Check if switchBl value is "1"
  //   const isSwitchBl = newState?.switchBl === "1";

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
  //     "tranship1LoadVesselId",
  //     "tranship1LoadVoyageId",
  //     "tranship2LoadVesselId",
  //     "tranship2LoadVoyageId"
  //   ];
  //   const fieldsToShowForSwitchBl = ["switchAgentId", "switchAgentBranchId"];

  //   const updatedArray = parentFieldDataInArray.map((item) => {
  //     if (fieldsToShowForHazardous.includes(item.fieldname)) {
  //       return { ...item, columnsToBeVisible: isHazardous };
  //     }

  //     if (fieldsToShowForTranshipment.includes(item.fieldname)) {
  //       return { ...item, columnsToBeVisible: isTranshipment };
  //     }

  //     if (fieldsToShowForSwitchBl.includes(item.fieldname)) {
  //       return { ...item, columnsToBeVisible: isSwitchBl };
  //     }

  //     return item;
  //   });

  //   const resData = groupAndSortFields(updatedArray);
  //   setParentsFields({ ...resData });
  // }, [
  //   newState.cargoTypeId,
  //   newState.routeId,
  //   newState.routeIddropdown,
  //   newState.switchBl, // ✅ Dependency for switchBl
  //   // newState
  // ]);

  useEffect(() => {
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

  console.log("omNewState--", newState);

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

      //      console.log(
      //   "Updated Parents Fields:",
      //   updatedFormControlDataParentsFields
      // );
      //      console.log("NewState---", newState);
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
  //     //      console.log("Processing charge: ", charge);

  //     const { companyId, clientId } = getUserDetails();
  //     //      console.log("Fetched user details: ", companyId, clientId);

  //     const requestData = {
  //       columns: "*",
  //       tableName: "tblCompanyParameter",
  //       whereCondition: `companyId = ${companyId}  AND currencyId = ${parentCurrencyId}`,
  //       clientIdCondition: ` status = 1 FOR JSON PATH`,
  //     }; //clientId = ${clientId} AND

  //     //      console.log("Making request for home currency check: ", requestData);
  //     const isHomeCurrency = await fetchReportData(requestData);
  //     //      console.log("Home currency data: ", isHomeCurrency);

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

  //       //        console.log(
  //       //   "Making request for buy exchange rates: ",
  //       //   buyExchangeRateRequestData
  //       // );
  //       const fetchedBuyData = await fetchReportData(
  //         buyExchangeRateRequestData
  //       );

  //       //        console.log("Fetched buy exchange rate data: ", fetchedBuyData);
  //       const buyExchangeRateFromMaster =
  //         fetchedBuyData.data[0]?.exportExchangeRate;

  //       updatedCharge.buyExchangeRate = buyExchangeRateFromMaster
  //         ? parseFloat(buyExchangeRateFromMaster.toFixed(3))
  //         : 1;
  //     } else if (isHomeCurrency.data.length == 0) {
  //       let buyExchangeRate = null;
  //       if (parentExchangeRate != null) {
  //         buyExchangeRate = 1 / parentExchangeRate;
  //       }
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

  //       //        console.log(
  //       //   "Making request for sell exchange rates: ",
  //       //   sellExchangeRateRequestData
  //       // );
  //       const fetchedSellData = await fetchReportData(
  //         sellExchangeRateRequestData
  //       );

  //       //        console.log("Fetched sell exchange rate data: ", fetchedSellData);
  //       const sellExchangeRateFromMaster =
  //         fetchedSellData.data[0]?.exportExchangeRate;

  //       updatedCharge.sellExchangeRate = sellExchangeRateFromMaster
  //         ? parseFloat(sellExchangeRateFromMaster.toFixed(3))
  //         : 1;
  //     } else if (isHomeCurrency.data.length == 0) {
  //       let sellExchangeRate = null;
  //       if (parentExchangeRate != null) {
  //         sellExchangeRate = 1 / parentExchangeRate;
  //         updatedCharge.sellExchangeRate = parseFloat(
  //           sellExchangeRate.toFixed(3)
  //         );
  //       }
  //     } else {
  //       updatedCharge.buyExchangeRate = 1;
  //     }
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
    const updateExchangeRatesInGrid = () => {
      const updatedRows = newState.tblRateRequestCharge.map((row) => {
        const updatedRow = { ...row };

        // Check for matching buyCurrencyId
        const matchingBuyRows = newState.tblRateRequestCharge.filter(
          (innerRow) => innerRow.buyCurrencyId === row.buyCurrencyId
        );

        // If there's a change in the buy exchange rate
        if (matchingBuyRows.length > 0) {
          const firstBuyRow = matchingBuyRows[0];
          if (firstBuyRow.buyExchangeRate !== row.buyExchangeRate) {
            updatedRow.buyExchangeRate = firstBuyRow.buyExchangeRate;
          }
        }

        // Check for matching sellCurrencyId
        const matchingSellRows = newState.tblRateRequestCharge.filter(
          (innerRow) => innerRow.sellCurrencyId === row.sellCurrencyId
        );

        // If there's a change in the sell exchange rate
        if (matchingSellRows.length > 0) {
          const firstSellRow = matchingSellRows[0];
          if (firstSellRow.sellExchangeRate !== row.sellExchangeRate) {
            updatedRow.sellExchangeRate = firstSellRow.sellExchangeRate;
          }
        }

        return updatedRow;
      });

      // Check if there are any changes to avoid unnecessary updates
      const hasChanges = updatedRows.some((updatedRow, index) => {
        return (
          updatedRow.buyExchangeRate !==
            newState.tblRateRequestCharge[index].buyExchangeRate ||
          updatedRow.sellExchangeRate !==
            newState.tblRateRequestCharge[index].sellExchangeRate
        );
      });

      // Only update state if changes are detected
      if (hasChanges) {
        //        console.log("Changes detected, updating state...");
        setNewState((prevState) => ({
          ...prevState,
          tblRateRequestCharge: updatedRows,
        }));
      } else {
        //        console.log("No changes detected.");
      }
    };

    // Only call the update function if there are charges to update
    if (newState?.tblRateRequestCharge?.length > 0) {
      updateExchangeRatesInGrid();
    }
  }, [newState.tblRateRequestCharge]);

  async function onLoadFunctionCall(
    functionData,
    formControlData,
    setFormControlData,
    setStateVariable
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
        });
        if (updatedValues?.result) {
          setIsDataLoaded(false);
          // toast[updatedValues.type](updatedValues.message);
          setFormControlData(updatedValues.formControlData);
        }
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
          if (
            typeof controlname === "string" &&
            controlname.toLowerCase() === "date"
          ) {
            tempNewState[`${fieldname}date`] =
              controlDefaultValue == null
                ? "null"
                : new Date(controlDefaultValue);
          }

          if (
            typeof controlname === "string" &&
            controlname.toLowerCase() === "dropdown" &&
            controlDefaultValue != null
          ) {
            tempNewState[`${fieldname}dropdown`] = controlDefaultValue;
            tempNewState[fieldname] = controlDefaultValue.value || "";
          }

          if (
            typeof controlname === "string" &&
            controlname.toLowerCase() === "multiselect" &&
            controlDefaultValue != null
          ) {
            tempNewState[`${fieldname}multiselect`] = controlDefaultValue;
            tempNewState[fieldname] = controlDefaultValue.value || "";
          }

          if (
            typeof controlname === "string" &&
            ["number", "text"].includes(controlname.toLowerCase())
          ) {
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

  const handleOpenModal = () => setOpenModal(true);
  const handleCloseModal = () => setOpenModal(false);

  const handleSave = (data) => {
    const r = data?.tblRateRequestCharge;
    console.log("r=>", r);
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
        qty: charge.qty ? parseInt(charge.qty, 10) : 0,
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
        tblRateRequestCharge: mappedCharges, // Replace with mapped charges
      };
      return updatedSubmitState;
    });
    handleCloseModal();
  };

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
          {Object.keys(parentsFields).map((section, index) => {
            return (
              <React.Fragment key={index}>
                <ParentAccordianComponent
                  expandAll={expandAll}
                  section={section}
                  indexValue={index}
                  parentsFields={parentsFields}
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
                  setSubmitNewState={setSubmitNewState}
                  parentTableName={tableName}
                  formControlData={formControlData}
                  setFormControlData={setFormControlData}
                  getLabelValue={getLabelValue}
                  hideColumnsId={hideFieldName}
                />
              </React.Fragment>
            );
          })}

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
                // getLabelValue
                getLabelValue={getLabelValue}
              />
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
          labelValue={labelName ? labelName : ""}
        />
      )}
      {modalToggle && (
        <QuotationModal
          newState={newState}
          scopeOfWork={scopeOfWork}
          tblRateRequestCharge={tblRateRequestCharge}
          openModal={modalToggle}
          setOpenModal={setModalToggle}
          isAdd={true}
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
          isAdd={true}
        />
      )}
      {createBatch && (
        <CreateBatchModal
          openModal={createBatch}
          setOpenModal={setCreateBatch}
          save={getCreateBatchModal}
          newState={newState}
          isAdd={true}
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
  hideColumnsId: PropTypes.any,
  //
  // getLabelValue
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
  hideColumnsId,
}) {
  const [isParentAccordionOpen, setIsParentAccordionOpen] = useState(false);
  const [fieldId, setFieldId] = useState([]);
  useEffect(() => {
    setIsParentAccordionOpen(expandAll);
  }, [expandAll]);
  console.log("section Name", section);
  console.log("parentsFields Name", parentsFields);
  useEffect(() => {
    setFieldId(hideColumnsId);
  }, [hideColumnsId]);

  //  console.log("hideColumnsId of ak", hideColumnsId);

  function handleChangeFunction(result) {
    //    console.log(result, "resilt");
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
  //  console.log("parentsFields[section] =>>", parentsFields[section]);
  return (
    <React.Fragment key={indexValue}>
      <Accordion
        expanded={isParentAccordionOpen}
        sx={{
          ...parentAccordionSection,
          // border: isParentAccordionOpen ? "  red" : "none",
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
                //                console.log("result---", result);
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
              hideColumnsId={fieldId}
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
  //
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
  //
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

  // for scrolling table
  const [tableBodyWidhth, setTableBodyWidth] = useState("0px");

  console.log("copyChildValueObj", copyChildValueObj);

  useEffect(() => {
    if (formControlData?.tableName === "tblVehicleRoute") {
      (async () => {
        await setSameDDValueFromParentToChild();
      })();
    }
  }, [newState?.jobId]);

  const setSameDDValueFromParentToChild = async () => {
    const rawIds = String(newState.jobId || "").split(",");

    const getIds = rawIds
      .map((id) => id.trim())
      .filter((id) => id !== "")
      .map((id) => parseInt(id, 10))
      .filter((id) => !isNaN(id));

    // If no valid IDs, reset the accordion and table
    if (getIds.length === 0) {
      setIschildAccordionOpen((pre) => !pre);
      setNewState((prev) => ({
        ...prev,
        tblVehicleRouteDetails: [],
      }));
      return;
    }

    // Fetch report data for each job ID in parallel
    const reportPromises = getIds.map((id) => {
      const requestBody = {
        columns: "id,jobNo",
        tableName: "tblJob",
        whereCondition: `id = '${id}'`,
        clientIdCondition: "status=1 FOR JSON PATH",
      };
      return fetchReportData(requestBody);
    });

    let reports;
    try {
      reports = await Promise.all(reportPromises);
    } catch (err) {
      console.error("Failed to fetch some reports:", err);
      reports = [];
    }

    // Build updated route details by preserving existing state
    const vehicleRouteDetails = getIds.map((id, idx) => {
      const rec = reports[idx]?.data?.[0] || null;
      const option = rec ? { value: rec.id, label: rec.jobNo } : null;

      const existing = newState.tblVehicleRouteDetails?.[idx] || {};

      return {
        ...existing, // preserve existing interactive state (e.g., disabled flags, user edits)
        jobId: id,
        jobIddropdown: option ? [option] : [],
        jobIdText: option ? [option] : [],
        indexValue: idx,
      };
    });

    // Update the state
    setNewState((prev) => ({
      ...prev,
      tblVehicleRouteDetails: vehicleRouteDetails,
    }));
  };

  const handleFieldChildrenValuesChange = (updatedValues) => {
    console.log("updatedValues", { ...childObject, ...updatedValues });

    setChildObject((prevObject) => ({ ...prevObject, ...updatedValues }));
  };

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
            //childObject[feild.fieldname]?.trim() === "")
            String(childObject[feild.fieldname] || "").trim() === "")
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
      tmpData[section.tableName].push({
        ...subChild,
        isChecked: true,
        indexValue: tmpData[section.tableName].length,
      });
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
        //        // console.log("You have reached the bottom of the scroll.");
        renderMoreData();
      }
    }
  };

  // Function to calculate totals for a single row
  const calculateTotalForRow = (rowData) => {
    // Iterate over each field in the fields array
    section.fields?.forEach((item) => {
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
      return newState;
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

  const calculateTotalNoOfPackages = () => {
    if (!newState || !Array.isArray(newState.tblJobContainer)) {
      return newState; // Return unchanged state if invalid
    }
  
    const toNum = (v) =>
      v == null || v === "" ? 0 : Number(String(v).replace(/,/g, "")) || 0;
  
    let totalNoPackages = 0;
  
    newState.tblJobContainer.forEach((row) => {
      totalNoPackages += toNum(row?.noOfPackages);
    });
  
    setNewState((prevState) => {
      // If your state ever had a legacy key, prefer it
      const targetKey = Object.prototype.hasOwnProperty.call(prevState, "noOfpackages")
        ? "noOfpackages"
        : "noOfPackages";
  
      // Prevent unnecessary re-renders
      if (toNum(prevState?.[targetKey]) === totalNoPackages) return prevState;
  
      return {
        ...prevState,
        [targetKey]: totalNoPackages,
      };
    });
  };
  
  
    useEffect(() => {
      calculateTotalNoOfPackages();
    }, [newState.tblJobContainer]);
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
    // Initialize with initial data
    setRenderedData(newState[section.tableName]?.slice(0, 10)); // Initially render 10 items
    calculateTotalForRow(newState[section.tableName]);
    if (
      newState[section.tableName] &&
      newState[section.tableName]?.length > 0
    ) {
      setClickCount(1);
    }
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
    try {
      if (section.functionOnDelete && section.functionOnDelete !== null) {
        let functonsArray = section.functionOnDelete?.trim().split(";");
        // let functonsArray = ["setCalculateVolume(volume)"]
        //        console.log("functonsArray", functonsArray);
        let UpdatedNewState = {
          ...newState,
          [section.tableName]: newState[section.tableName].filter(
            (_, i) => i !== index
          ),
        };
        let Data = { ...newState[section.tableName][index] };
        for (const fun of functonsArray) {
          if (typeof onSubmitValidation[fun] == "function") {
          }

          let updatedData = onSubmitFunctionCall(
            fun,
            UpdatedNewState,
            formControlData,
            {},
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
      } else {
        setNewState((prevState) => {
          const newStateCopy = { ...prevState };
          const updatedData = newStateCopy[section.tableName].filter(
            (_, idx) => idx !== index
          );
          newStateCopy[section.tableName] = updatedData;

          if (updatedData.length === 0) {
            //setInputFieldsVisible((prev) => !prev);
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
            //setInputFieldsVisible((prev) => !prev);
          }
          return newStateCopy;
        });
        setOriginalData((prevState) => {
          const newStateCopy = { ...prevState };
          const updatedData = newStateCopy[section?.tableName]?.filter(
            (_, idx) => idx !== index
          );
          newStateCopy[section.tableName] = updatedData;
          if (updatedData?.length === 0) {
            //setInputFieldsVisible((prev) => !prev);
            setInputFieldsVisible(true);
          }
          return newStateCopy;
        });
      }
    } catch (error) {
      setNewState((prevState) => {
        const newStateCopy = { ...prevState };
        const updatedData = newStateCopy[section.tableName].filter(
          (_, idx) => idx !== index
        );
        newStateCopy[section.tableName] = updatedData;

        if (updatedData.length === 0) {
          //setInputFieldsVisible((prev) => !prev);
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
          //setInputFieldsVisible((prev) => !prev);
        }
        return newStateCopy;
      });
      setOriginalData((prevState) => {
        const newStateCopy = { ...prevState };
        const updatedData = newStateCopy[section?.tableName]?.filter(
          (_, idx) => idx !== index
        );
        newStateCopy[section.tableName] = updatedData;
        if (updatedData?.length === 0) {
          //setInputFieldsVisible((prev) => !prev);
          //setInputFieldsVisible(true);
        }
        return newStateCopy;
      });
      return toast.error(error.message);
    }

    // setNewState((prevState) => {
    //   const newStateCopy = { ...prevState };
    //   const updatedData = newStateCopy[section.tableName].filter(
    //     (_, idx) => idx !== index
    //   );
    //   newStateCopy[section.tableName] = updatedData;

    //   if (updatedData.length === 0) {
    //     setInputFieldsVisible((prev) => !prev);
    //   }
    //   return newStateCopy;
    // });
    // setSubmitNewState((prevState) => {
    //   const newStateCopy = { ...prevState };
    //   const updatedData = newStateCopy[section.tableName].filter(
    //     (_, idx) => idx !== index
    //   );
    //   newStateCopy[section.tableName] = updatedData;
    //   if (updatedData.length === 0) {
    //     setInputFieldsVisible((prev) => !prev);
    //   }
    //   return newStateCopy;
    // });
    // setOriginalData((prevState) => {
    //   const newStateCopy = { ...prevState };
    //   const updatedData = newStateCopy[section?.tableName]?.filter(
    //     (_, idx) => idx !== index
    //   );
    //   newStateCopy[section.tableName] = updatedData;
    //   if (updatedData?.length === 0) {
    //     setInputFieldsVisible((prev) => !prev);
    //   }
    //   return newStateCopy;
    // });
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
  function gridEditCloseFunction(tableName) {
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
      //      console.log("width", width);
      setContainerWidth(width);
    } else {
      //      console.log("tableRef.current is not available");
    }
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
            // color={"white"}
            className={`relative right-[11px]  ${styles.txtColor}`}
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
            height: clickCount === 0 ? "3.5rem" : "auto",
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
                  callSaveFunctionOnLastTab={() => {
                    //                    console.log("callSaveFunctionOnLastTab");
                    childButtonHandler(section, indexValue, true);
                    // inputFieldsVisible == false &&
                    //   setInputFieldsVisible(
                    //     (prev) => !prev
                    //   );
                    calculateTotalVolumeAndWeight();
                    calculateTotalGrossWeight();
                    calculateTotalGrossWeightBl();
                  }}
                  //
                  getLabelValue={getLabelValue}
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
                      calculateTotalGrossWeight();
                      calculateTotalVolumeAndWeight();
                      calculateTotalGrossWeightBl();
                      calculateTotalNoOfPackages();
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
                          <>
                            {key && value ? (
                              <span key={key}>
                                {key}: {value},{" "}
                              </span>
                            ) : (
                              <></>
                            )}
                          </>
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
                  <div key={indexValue} className={``}>
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
                        className={`bg-[var(--commonBg)] w-[fit-content] min-w-[100%] `}
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
                              childArr={copyChildValueObj}
                              setCopyChildValueObj={setCopyChildValueObj}
                              setOpenModal={setOpenModal}
                              setParaText={setParaText}
                              expandAll={expandAll}
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
                              // expandAll={expandAll}
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
                                        className={`cursor-pointer `}
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
