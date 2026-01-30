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
import {
  masterTableInfo,
  formControlMenuList,
  handleSubmitApi,
  tallyDebitCredit,
  validateSubmit,
  fetchThirdLevelDetailsFromApi,
  fetchVoucherDataDynamic,
  insertVoucherDataDynami
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

  // getLabel Name
  const [labelName, setLabelName] = useState("");
  const [ChildTableName, setAllChildTableName] = useState([]);
  const [openPrintModal, setOpenPrintModal] = useState(false);
  const [submittedRecordId, setSubmittedRecordId] = useState(null);
  const [submittedMenuId, setSubmittedMenuId] = useState(null);
  const [isFormSaved, setIsFormSaved] = useState(false);
  const { userId, clientId } = getUserDetails();
  const searchParams = useSearchParams();
  const id = JSON.parse(decodeURIComponent(params.id));
  const getLabelValue = (label) => {
    setLabelName(label);
  };
  const [fetchCount, setFetchCount] = useState(1);

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
    if (search?.menuName != "1560") {
      try {
        // Call api for table grid data
        const tableViewApiResponse = await formControlMenuList(search.menuName);
        if (tableViewApiResponse.success) {
          setFetchedApiResponse(tableViewApiResponse.data[0]);
          setFormControlData(tableViewApiResponse.data[0]);
          setTableName(tableViewApiResponse.data[0].tableName);
          setIsRequiredAttachment(
            tableViewApiResponse.data[0]?.isRequiredAttachment,
          );
          const groupAllFieldsData = groupAndSortAllFields(
            tableViewApiResponse.data[0].fields,
          );
          setParentsFields(groupAllFieldsData);
          const resData = groupAndSortFields(
            tableViewApiResponse.data[0].fields,
          );
          setTopParentsFields(resData.top); // Set parents fields.
          setBottomParentsFields(resData.bottom); // Set parents fields.

          setChildsFields(
            tableViewApiResponse.data[0].child ||
              tableViewApiResponse.data[0].children,
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
                  (
                    finalData[item.tableName][index][subchildItem.tableName] ||
                    []
                  ).length;
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
              setOpenModal((prev) => !prev);
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

  // ✅ Allocation effect (complete) — mirrors debitAmount -> debitAmountHc
  // ✅ Allows manual debitAmount edits (effect respects them, but caps so balance never negative)
  // ✅ Ensures balanceAmtHc / balanceAmtFc never go negative

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
          debitHc: r?.debitAmountHc,
          debitFc: r?.debitAmountFc,
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

    const checksNow = allDetails.map((r) => ({
      c: !!r?.isChecked,
      d: String(r?.debitAmount ?? ""),
      dhc: String(r?.debitAmountHc ?? ""),
      df: String(r?.debitAmountFc ?? ""),
    }));

    const sameChecks =
      prev.checks.length === checksNow.length &&
      prev.checks.every((v, i) => {
        const cur = checksNow[i] || {};
        return (
          v?.c === cur?.c &&
          v?.d === cur?.d &&
          v?.dhc === cur?.dhc &&
          v?.df === cur?.df
        );
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

    let sumCheckedHC = 0;
    let sumCheckedFC = 0;

    let capPayHC = round2(payHC);
    let capPayFC = round2(payFC);

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

        // ✅ unchecked → reset
        if (!isChecked) {
          return {
            ...row,
            __origBalHC: origBalHC,
            __origBalFC: origBalFC,

            debitAmount: "0.00",
            debitAmountHc: "0.00",
            debitAmountFc: "0.00",

            creditAmount: row?.creditAmount ?? "",
            creditAmountFc: row?.creditAmountFc ?? "",

            balanceAmount: asNum2(Math.max(0, origBalHC)),
            balanceAmountFc: asNum2(Math.max(0, origBalFC)),
          };
        }

        // ✅ checked:
        // We treat user's manual input as "HC amount", and COPY same into FC.
        const existingHC = toNum(row?.debitAmount);

        // manual cannot exceed row balance
        const wantHC = existingHC > 0 ? Math.min(existingHC, origBalHC) : 0;

        // also cannot exceed remaining pay
        const keepHC = wantHC > 0 ? Math.min(wantHC, capPayHC) : 0;

        capPayHC = round2(capPayHC - keepHC);
        sumCheckedHC = round2(sumCheckedHC + keepHC);

        // ✅ FC mirrors HC
        const wantFC = keepHC; // same value
        const keepFC = wantFC > 0 ? Math.min(wantFC, origBalFC, capPayFC) : 0;

        capPayFC = round2(capPayFC - keepFC);
        sumCheckedFC = round2(sumCheckedFC + keepFC);

        // blank means “auto fill later”
        const outDebit = keepHC > 0 ? asStr2(keepHC) : "";

        return {
          ...row,
          __origBalHC: origBalHC,
          __origBalFC: origBalFC,

          debitAmount: outDebit,
          debitAmountHc: outDebit,
          debitAmountFc: outDebit, // ✅ COPY SAME HERE

          creditAmount: row?.creditAmount ?? "",
          creditAmountFc: row?.creditAmountFc ?? "",

          balanceAmount: asNum2(Math.max(0, round2(origBalHC - keepHC))),
          balanceAmountFc: asNum2(Math.max(0, round2(origBalFC - keepFC))),
        };
      });

      return { ...ledger, tblVoucherLedgerDetails: nextDetails };
    });

    // ✅ remaining after honoring manual values (never negative)
    let remHC = Math.max(0, round2(payHC - sumCheckedHC));
    let remFC = Math.max(0, round2(payFC - sumCheckedFC));

    if (DBG) {
      console.log(`${tag} PASS1`, { sumCheckedHC, sumCheckedFC, remHC, remFC });
    }

    const filledLedgers = nextLedgers.map((ledger) => {
      const details = Array.isArray(ledger?.tblVoucherLedgerDetails)
        ? ledger.tblVoucherLedgerDetails
        : [];
      if (!details.length) return ledger;

      const nextDetails = details.map((row) => {
        if (!row?.isChecked) return row;

        const existingHC = toNum(row?.debitAmount);
        if (existingHC > 0) return row; // already honored manual

        const origBalHC =
          row?.__origBalHC != null
            ? toNum(row.__origBalHC)
            : toNum(row?.balanceAmount);
        const origBalFC =
          row?.__origBalFC != null
            ? toNum(row.__origBalFC)
            : toNum(row?.balanceAmountFc);

        const allocHC = Math.min(remHC, origBalHC);
        remHC = round2(remHC - allocHC);

        // ✅ FC mirrors HC, but still cannot exceed remaining FC pay and orig FC bal
        const allocFC = Math.min(remFC, origBalFC, allocHC);
        remFC = round2(remFC - allocFC);

        const outDebit = allocHC > 0 ? asStr2(allocHC) : "0.00";

        return {
          ...row,
          debitAmount: outDebit,
          debitAmountHc: outDebit,
          debitAmountFc: outDebit, // ✅ COPY SAME HERE
          balanceAmount: asNum2(Math.max(0, round2(origBalHC - allocHC))),
          balanceAmountFc: asNum2(Math.max(0, round2(origBalFC - allocFC))),
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
          dhc: String(r?.debitAmountHc ?? ""),
          df: String(r?.debitAmountFc ?? ""),
          b: String(r?.balanceAmount ?? ""),
          bf: String(r?.balanceAmountFc ?? ""),
          o: String(r?.__origBalHC ?? ""),
          of: String(r?.__origBalFC ?? ""),
        })),
      });
    };

    setNewState((prevState) => {
      const finalRemHC = Math.max(0, round2(remHC));
      const finalRemFC = Math.max(0, round2(remFC));

      const out = Array.isArray(prevState?.tblVoucherLedger)
        ? {
            ...prevState,
            tblVoucherLedger: filledLedgers.filter((l) => !l?.__virtual),
            balanceAmtHc: asStr2(finalRemHC),
            balanceAmtFc: asStr2(finalRemFC),
          }
        : {
            ...prevState,
            tblVoucherLedgerDetails:
              filledLedgers[0]?.tblVoucherLedgerDetails || [],
            balanceAmtHc: asStr2(finalRemHC),
            balanceAmtFc: asStr2(finalRemFC),
          };

      if (computeSig(prevState) === computeSig(out)) {
        if (DBG) console.log(`${tag} setNewState skipped (no diff)`);
        return prevState;
      }

      if (DBG) {
        console.log(`${tag} FINAL`, {
          remHC: finalRemHC,
          remFC: finalRemFC,
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

  // const didFetchKeyRef = useRef(new Set());

  // useEffect(() => {
  //   if (!id?.id) return;

  //   // ✅ FIXED key (must be id, not !id)
  //   const key = `${id?.id}::${userId}::${clientId}`;

  //   if (didFetchKeyRef.current.has(key)) return;
  //   didFetchKeyRef.current.add(key);

  //   let isCancelled = false;

  //   (async () => {
  //     try {
  //       const resp = await fetchVoucherDataDynamic({
  //         recordId: id?.id,
  //         userId,
  //         clientId,
  //       });

  //       // ✅ keep your existing logic
  //       // if (fetchCount === 1) {
  //       //   setParentsFields(parentFieldIsTdsNotAppliedOnFetchFunction);
  //       // }

  //       if (isCancelled) return;

  //       if (resp?.success && Array.isArray(resp?.data) && resp.data.length) {
  //         skipNextPaymentByPartyEffect.current = true;

  //         const raw = resp.data[0] ?? {};

  //         // ✅ 1) Transform details (your same logic)
  //         const updatedDetails = Array.isArray(raw.tblVoucherLedgerDetails)
  //           ? raw.tblVoucherLedgerDetails.map((row, index) => {
  //               if (!row) return row;

  //               // ✅ ensure indexValue like your reference
  //               const indexValue =
  //                 row.indexValue !== null && row.indexValue !== undefined
  //                   ? row.indexValue
  //                   : index;

  //               // Convert OsAmt values to string
  //               const osAmtFCString = String(row.OsAmtFC ?? "");
  //               const osAmtHCString = String(row.OsAmtHC ?? "");

  //               // Auto-set allocated flag
  //               const hasHC =
  //                 row.allocatedAmtHC !== null &&
  //                 row.allocatedAmtHC !== undefined &&
  //                 row.allocatedAmtHC !== 0;

  //               const hasFC =
  //                 row.allocatedAmtFC !== null &&
  //                 row.allocatedAmtFC !== undefined &&
  //                 row.allocatedAmtFC !== 0;

  //               // ------------------------ FC ------------------------
  //               let balanceAmtFC = row.balanceAmtFC;

  //               const osFc = Number(row.OsAmtFC);
  //               const allocFc =
  //                 row.allocatedAmtFC === null || row.allocatedAmtFC === undefined
  //                   ? null
  //                   : Number(row.allocatedAmtFC);

  //               if (!Number.isNaN(osFc)) {
  //                 balanceAmtFC =
  //                   allocFc === null || Number.isNaN(allocFc)
  //                     ? osFc
  //                     : osFc - allocFc;
  //               }

  //               // ------------------------ HC ------------------------
  //               let balanceAmtHC = row.balanceAmtHC;

  //               const osHc = Number(row.OsAmtHC);
  //               const allocHc =
  //                 row.allocatedAmtHC === null || row.allocatedAmtHC === undefined
  //                   ? null
  //                   : Number(row.allocatedAmtHC);

  //               if (!Number.isNaN(osHc)) {
  //                 balanceAmtHC =
  //                   allocHc === null || Number.isNaN(allocHc)
  //                     ? osHc
  //                     : osHc - allocHc;
  //               }

  //               return {
  //                 ...row,
  //                 indexValue, // ✅ like your reference
  //                 autoSetAllocatedAmount: hasHC || hasFC ? true : null,
  //                 balanceAmtFC,
  //                 balanceAmtHC,
  //                 OsAmtFC: osAmtFCString,
  //                 OsAmtHC: osAmtHCString,
  //               };
  //             })
  //           : raw.tblVoucherLedgerDetails;

  //         // ✅ 2) finalData pattern (same as your reference)
  //         const finalData = {
  //           ...raw,
  //           tblVoucherLedgerDetails: updatedDetails,
  //         };

  //         // ✅ 3) Apply totals (your existing helper)
  //         const updatedData = calculateHcFcTotals(finalData);

  //         // ✅ 4) Set ALL states like reference
  //         if (!isCancelled) {
  //           setNewState((prev) => ({ ...prev, ...updatedData }));
  //           setSubmitNewState((prev) => ({ ...prev, ...updatedData }));
  //           setInitialState((prev) => ({ ...prev, ...updatedData }));

  //           setFetchCount((pre) => pre + 1);

  //           // if you have this flag in your page (like reference)
  //           // setTimeout(() => setIsDataLoaded(true), 500);
  //         }
  //       }
  //     } catch (e) {
  //       if (!isCancelled) console.error(e);
  //     }
  //   })();

  //   return () => {
  //     isCancelled = true;
  //   };
  // }, [id?.id, userId, clientId]); // ✅ better dependency

  async function fetchDataDymaic() {
    const { clientId, companyId, branchId, financialYear, userId } =
      getUserDetails();
    try {
      // Call api for table grid data
      const tableViewApiResponse = await formControlMenuList(search.menuName);
      if (tableViewApiResponse.success) {
        setFetchedApiResponse(tableViewApiResponse.data[0]);
        setFormControlData(tableViewApiResponse.data[0]);
        setTableName(tableViewApiResponse.data[0].tableName);
        setIsRequiredAttachment(
          tableViewApiResponse.data[0]?.isRequiredAttachment,
        );
        const groupAllFieldsData = groupAndSortAllFields(
          tableViewApiResponse.data[0].fields,
        );
        setParentsFields(groupAllFieldsData);
        const resData = groupAndSortFields(tableViewApiResponse.data[0].fields);
        setTopParentsFields(resData.top);
        setBottomParentsFields(resData.bottom);

        setChildsFields(
          tableViewApiResponse.data[0].child ||
            tableViewApiResponse.data[0].children,
        );
        setButtonsData(tableViewApiResponse.data[0].buttons);
      }

      const apiResponse = await fetchVoucherDataDynamic({
        clientID: parseInt(clientId),
        recordID: parseInt(search.id),
        menuID: parseInt(search.menuName),
        companyId: companyId,
        companyBranchId: branchId,
        financialYearId: financialYear,
        userId: userId,
      });
      if (apiResponse) {
        let data = apiResponse?.data[0];
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
    fetchDataDymaic();
  }, []);

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
    newState[section.tableName] !== null ? false : true,
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
                                      section.fields,
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
