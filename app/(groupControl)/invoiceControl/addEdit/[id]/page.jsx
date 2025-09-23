"use client";
/* eslint-disable */
import * as React from "react";
import { useState, useRef, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import styles from "@/app/app.module.css";
import Accordion from "@mui/material/Accordion";
import AccordionSummary from "@mui/material/AccordionSummary";
import AccordionDetails from "@mui/material/AccordionDetails";
import CloseOutlinedIcon from "@mui/icons-material/CloseOutlined";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import {
  masterTableInfo,
  formControlMenuList,
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
  const { push } = useRouter();
  const params = useParams();
  const search = JSON.parse(decodeURIComponent(params.id));
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

  // getLabel Name
  const [labelName, setLabelName] = useState("");
  const [ChildTableName, setAllChildTableName] = useState([]);
  const [openPrintModal, setOpenPrintModal] = useState(false);
  const [submittedRecordId, setSubmittedRecordId] = useState(null);
  const [submittedMenuId, setSubmittedMenuId] = useState(null);
  const [isFormSaved, setIsFormSaved] = useState(false);

  const getLabelValue = (label) => {
    setLabelName(label);
  };

  // async function checkReportPresent(menuId) {
  //   const { clientId } = getUserDetails();
  //   if (menuId) {
  //     const requestBody = {
  //       columns:
  //         "mrm.reportMenuId,mrm.reportTemplateId,tm.menuName,tm.menuLink,tm.menuType,tm.clientId",
  //       tableName:
  //         "tblMenuReportMapping mrm Inner Join tblMenu tm on mrm.reportMenuId = tm.id",
  //       whereCondition: `mrm.menuId = ${menuId} and tm.status = 1 and mrm.clientId in (${clientId} ,(select id from tblClient where clientCode = 'SYSCON'))`,
  //       clientIdCondition: `mrm.status = 1 FOR JSON PATH, INCLUDE_NULL_VALUES`,
  //     };
  //     try {
  //       const response = await fetchReportData(requestBody);
  //       const data = response.data || response;
  //       if (data.length > 0) {
  //         setisReportPresent(true);
  //       } else {
  //         setisReportPresent(false);
  //       }
  //     } catch (error) {
  //       console.error(error);
  //     }
  //   }
  // }

  // useEffect(() => {
  //   const fetchDatas = async () => {
  //     try {
  //       await checkReportPresent(search?.menuName);
  //     } catch (error) {
  //       console.error("Error fetching data:", error);
  //     }
  //   };
  //   fetchDatas();
  // }, [search]);

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

  async function fetchData() {
    const { clientId } = getUserDetails();
    try {
      // Call api for table grid data
      const tableViewApiResponse = await formControlMenuList(search.menuName);
      if (tableViewApiResponse.success) {
        setFetchedApiResponse(tableViewApiResponse.data[0]);
        setFormControlData(tableViewApiResponse.data[0]);
        setTableName(tableViewApiResponse.data[0].tableName);
        setIsRequiredAttachment(
          tableViewApiResponse.data[0]?.isRequiredAttachment
        );
        const groupAllFieldsData = groupAndSortAllFields(
          tableViewApiResponse.data[0].fields
        );
        setParentsFields(groupAllFieldsData);
        const resData = groupAndSortFields(tableViewApiResponse.data[0].fields);
        setTopParentsFields(resData.top); // Set parents fields.
        setBottomParentsFields(resData.bottom); // Set parents fields.

        setChildsFields(
          tableViewApiResponse.data[0].child ||
            tableViewApiResponse.data[0].children
        );
        setButtonsData(tableViewApiResponse.data[0].buttons);
      }

      const apiResponse = await masterTableInfo({
        clientID: parseInt(clientId),
        recordID: parseInt(search.id),
        menuID: parseInt(search.menuName),
      });
      if (apiResponse) {
        let data = apiResponse[0];
        console.log(data);

        let finalData = {};
        search.isCopy ? (data.id = "") : null;
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

        for (let item of tableViewApiResponse.data[0].child) {
          for (
            let index = 0;
            index < (finalData[item.tableName] || []).length;
            index++
          ) {
            finalData[item.tableName][index].indexValue = index;
            for (const subchildItem of item.subChild) {
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

        setNewState((prev) => {
          return {
            ...prev,
            ...finalData,
            tableName: tableViewApiResponse.data[0].tableName,
            attachment: data.attachment,
            menuID: search.menuName,
          };
        });
        setSubmitNewState((prev) => {
          return {
            ...prev,
            ...finalData,
            tableName: tableViewApiResponse.data[0].tableName,
            attachment: data.attachment,
            menuID: search.menuName,
          };
        });
        setInitialState((prev) => {
          return {
            ...prev,
            ...finalData,
            tableName: tableViewApiResponse.data[0].tableName,
          };
        });
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

  function onLoadFunctionCall(
    functionData,
    formControlData,
    setFormControlData,
    setStateVariable
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
          // toast.success("Function called successfully");
        }
        console.log("updatedValues", updatedValues);
        // onChangeHandler(updatedValues); // Assuming you have an onChangeHandler function to handle the updated values
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
              setNewState
            );
          });
        }
      }
    }
  }, [isDataLoaded]);

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
      return acc + (Number(temp) || 0);
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
    const effectiveNoOfDays =
      isNaN(noOfDays) || noOfDays <= 0 ? 1 : noOfDays;

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

  // Define your button click handlers
  const handleButtonClick = {
    handleSubmit: async () => {
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
          // let data = await handleSubmitApi(submitNewState);
          const cleanData = replaceNullStrings(newState, ChildTableName);
          let data = await handleSubmitApi(cleanData);
          if (data.success == true) {
            setIsFormSaved(true);
            if (isReportPresent) {
              toast.success(data.message);
              // const id =
              //   data?.data?.recordsets[1][0]?.ParentId ||
              //   data?.data?.recordsets[0]?.ParentId;
              const id = data?.data?.recordsets[0]?.[0]?.ParentId;
              setOpenPrintModal((prev) => !prev);
              setSubmittedMenuId(search?.menuName);
              setSubmittedRecordId(id);
            }
          } else {
            toast.error(data.message);
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
              setOpenModal((prev) => !prev);
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
    },
    handleSaveClose: async () => {
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
            toast.error(`Value for${yourlabel} is missing.`);
            return;
          }
        }
        const cleanData = replaceNullStrings(newState, ChildTableName);
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
              isRequired && !newState[fieldname]
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
          // let data = await handleSubmitApi(submitNewState);
          const cleanData = replaceNullStrings(newState, ChildTableName);
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
  };

  const onConfirm = async (conformData) => {
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
    newState[section.tableName] !== null ? false : true
  );

  const handleFieldChildrenValuesChange = (updatedValues) => {
    setChildObject((prevObject) => ({ ...prevObject, ...updatedValues }));
  };

  const childButtonHandler = async (section, indexValue, islastTab) => {
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
      lastIndex
    );
    setRenderedData((prevData) => [...prevData, ...newData]);
    setDummyData((prevData) => [...prevData, ...newData]);
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
    let data = { ...result.values };
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
                className={`relative flex  justify-between pl-[16px] py-[8px] `}
              >
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
                    title={"Save"}
                    onClick={() => {
                      childButtonHandler(section, indexValue);
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
                        className={`bg-[var(--commonBg)]`}
                      >
                        <TableHead>
                          <TableRow>
                            {section.fields
                              .filter((elem) => elem.isGridView)
                              .map((field, index) => (
                                <TableCell
                                  key={index}
                                  className={`${styles.cellHeading} cursor-pointer ${styles.tableChildHeader} `}
                                  align="left"
                                  sx={{
                                    ...childTableHeaderStyle,
                                    paddingLeft:
                                      isView && index === 0
                                        ? "29px"
                                        : "0px !important",
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
                                            (prev) => !prev
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
                              expandAll={expandAll}
                              inEditMode={{ isEditMode: true, isCopy: isCopy }}
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
