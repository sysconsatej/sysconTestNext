"use client";

import * as React from "react";
import { useState, useEffect } from "react";
import Image from "next/image";
import styles from "@/app/app.module.css";
import CustomeInputFields from "@/components/Inputs/customeInputFields";
import IconButton from "@mui/material/IconButton";
import Box from "@mui/material/Box";
import Collapse from "@mui/material/Collapse";
import TableCell from "@mui/material/TableCell";
import TableRow from "@mui/material/TableRow";
import {
  DeleteIcon2,
  refreshIcon,
  saveIcon,
  copyDoc,
  CopyHover,
  DeleteHover,
  saveIconHover,
  revertHover,
} from "@/assets";
import LightTooltip from "@/components/Tooltip/customToolTip";
import PropTypes from "prop-types";
import {
  childTableRowStyles,
  formChildTableRowStyles,
  gridSectionStyles,
} from "@/app/globalCss";
import HoverIcon from "@/components/HoveredIcons/HoverIcon";
import GridInputFields from "@/components/Inputs/gridInputFields";
import { toast } from "react-toastify";
import Checkbox from "@mui/material/Checkbox";
import { ActionButton } from "@/components/ActionsButtons";
import * as onSubmitValidation from "@/helper/onSubmitFunction";
//import {setSameDDValuesBasedOnSecondRow} from "@/helper/onSubmitFunction"
function onSubmitFunctionCall(
  functionData,
  newState,
  formControlData,
  values,
  setStateVariable,
  childName,
  childIndex,
  index
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
      // Call the function with the prepared arguments
      let result = onSubmitValidation?.[funcName]({
        args,
        newState,
        formControlData,
        values,
        setStateVariable,
        childName,
        childIndex,
        valuesIndex: index
      });
      return result;
      // onChangeHandler(updatedValues); // Assuming you have an onChangeHandler function to handle the updated values
    }
  }
}



EditSubChildComponent.propTypes = {
  subChildObject: PropTypes.any,
  setNewState: PropTypes.any,
  newState: PropTypes.any,
  subChild: PropTypes.any,
  index: PropTypes.any,
  childName: PropTypes.any,
  childIndex: PropTypes.any,
  expandAll: PropTypes.any,
  inEditMode: PropTypes.any,
  deleteSubChildRecord: PropTypes.any,
  setRenderedData: PropTypes.any,
  isView: PropTypes.any,
  isGridEdit: PropTypes.any,
  setCopyChildValueObj: PropTypes.any,
  setOpenModal: PropTypes.any,
  setParaText: PropTypes.any,
  setIsError: PropTypes.any,
  setTypeofModal: PropTypes.any,
  clearFlag: PropTypes.any,
  setClearFlag: PropTypes.any,
  containerWidth: PropTypes.any,
  // submitNewState: PropTypes.any,
  setSubmitNewState: PropTypes.any,
  removeSubChildRecordFromInsert: PropTypes.any,
  formControlData: PropTypes.any,
  setFormControlData: PropTypes.any,
  setSubChildObject: PropTypes.any,
};
export default function EditSubChildComponent(props) {
  const {
    subChildObject,
    setNewState,
    newState,
    subChild,
    index,
    childName,
    childIndex,
    inEditMode,
    deleteSubChildRecord,
    setRenderedData,
    isView,
    isGridEdit,
    setCopyChildValueObj,
    setOpenModal,
    setParaText,
    setIsError,
    setTypeofModal,
    clearFlag,
    containerWidth,
    // submitNewState,
    setSubmitNewState,
    removeSubChildRecordFromInsert,
    formControlData,
    setFormControlData,
    setSubChildObject,
  } = props;
  const [editSubChildObj, setEditSubChildObj] = useState({ ...subChildObject });
  const [openSubChildEdit, setOpenSubChildEdit] = useState(false);
  const [hoveredIcon, setHoveredIcon] = useState(null);
  // const [isChecked, setIsChecked] = useState(true);

  useEffect(() => {
    setEditSubChildObj({ ...subChildObject });
  }, [subChildObject]);


  const toggleSubChildEdit = () => {
    setOpenSubChildEdit((prev) => !prev);
  };
  function copyDocument(obj) {
    if (Object.keys(obj).length !== 0) {
      const tmpData = { ...newState };
      tmpData[childName][childIndex][subChild.tableName].push({
        ...obj,
        indexValue: tmpData[childName][childIndex][subChild.tableName].length,
      });
      setNewState(tmpData);
      setSubmitNewState(tmpData);
      setRenderedData(newState[childName][childIndex][subChild.tableName]);
    }
  }

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
    setEditSubChildObj((pre) => {
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
    setEditSubChildObj((pre) => {
      return {
        ...pre,
        ...data,
      };
    });
  }

  function addChildRecordToInsert(obj, index) {
    if (Object.keys(obj).length !== 0) {
      setSubmitNewState((prevState) => {
        // Deep clone instead of shallow spread
        const newStateCopy = JSON.parse(JSON.stringify(prevState));

        let updatedData = {
          ...newStateCopy[childName][childIndex][subChild.tableName][index],
          isChecked: true,
        };

        newStateCopy[childName][childIndex][subChild.tableName][index] = updatedData;
        return newStateCopy;
      });

      setNewState((prevState) => {
        // Deep clone instead of shallow spread
        const newStateCopy = JSON.parse(JSON.stringify(prevState));

        let updatedData = {
          ...newStateCopy[childName][childIndex][subChild.tableName][index],
          isChecked: true,
        };

        newStateCopy[childName][childIndex][subChild.tableName][index] = updatedData;
        return newStateCopy;
      });
    }
  }


  const handleChange = (event, row, ledgerIndex) => {
    const checked = event.target.checked;

    // 1) keep your existing side-effects
    if (checked === false) {
      removeSubChildRecordFromInsert(row?.indexValue || row?._id, ledgerIndex);
    } else {
      addChildRecordToInsert(row, ledgerIndex);
    }

    // 2) ✅ IMPORTANT: update newState immutably so useEffect triggers
    setNewState((prev) => {
      // ---------- NESTED ledgers case ----------
      if (Array.isArray(prev?.tblVoucherLedger) && prev.tblVoucherLedger.length) {
        const nextLedgers = prev.tblVoucherLedger.map((ledger, li) => {
          if (li !== ledgerIndex) return ledger;

          const details = Array.isArray(ledger?.tblVoucherLedgerDetails)
            ? ledger.tblVoucherLedgerDetails
            : [];

          const nextDetails = details.map((d) => {
            const sameRow =
              (row?._id != null && d?._id === row._id) ||
              (row?.indexValue != null && d?.indexValue === row.indexValue) ||
              (row?.voucherOutstandingId != null &&
                d?.voucherOutstandingId === row.voucherOutstandingId);

            if (!sameRow) return d;

            return {
              ...d,
              isChecked: checked,
            };
          });

          return { ...ledger, tblVoucherLedgerDetails: nextDetails };
        });

        return { ...prev, tblVoucherLedger: nextLedgers };
      }

      // ---------- FLAT details case ----------
      const details = Array.isArray(prev?.tblVoucherLedgerDetails)
        ? prev.tblVoucherLedgerDetails
        : [];

      const nextDetails = details.map((d) => {
        const sameRow =
          (row?._id != null && d?._id === row._id) ||
          (row?.indexValue != null && d?.indexValue === row.indexValue) ||
          (row?.voucherOutstandingId != null &&
            d?.voucherOutstandingId === row.voucherOutstandingId);

        if (!sameRow) return d;

        return {
          ...d,
          isChecked: checked,
        };
      });

      return { ...prev, tblVoucherLedgerDetails: nextDetails };
    });
  };

//   const syncLedgerTotalsFromDetails = () => {
//  //alert("omkarrrrrc");
//   if (!newState || !Array.isArray(newState.tblVoucherLedger)) {
//     return newState;
//   }

//   // Helpers
//   const toNum = (v) => {
//     if (v === null || v === undefined || v === "") return 0;
//     const n = Number(String(v).replace(/,/g, "")); // handles "5,000.00"
//     return Number.isFinite(n) ? n : 0;
//   };

//   const getDetails = (ledgerRow) =>
//     Array.isArray(ledgerRow?.tblVoucherLedgerDetails)
//       ? ledgerRow.tblVoucherLedgerDetails
//       : [];

//   // Pass 1: compute totals for each parent ledger row index
//   const totalsByLedgerIndex = {};

//   newState.tblVoucherLedger.forEach((ledgerRow, idx) => {
//     const details = getDetails(ledgerRow);

//     let debitHC = 0;
//     let debitFC = 0;

//     for (const d of details) {
//       // ✅ handle both correct key & buggy key with trailing space "debitAmount "
//       const rawDebitHC = d?.debitAmount ?? d?.["debitAmount "] ?? 0;
//       const rawDebitFC = d?.debitAmountFc ?? d?.["debitAmountFc "] ?? 0;

//       debitHC += toNum(rawDebitHC);
//       debitFC += toNum(rawDebitFC);
//     }

//     totalsByLedgerIndex[idx] = {
//       debitAmount: debitHC === 0 ? "" : debitHC.toFixed(2),
//       debitAmountFc: debitFC === 0 ? "" : debitFC.toFixed(2),
//     };
//   });

//   // Nothing to do if no rows
//   if (Object.keys(totalsByLedgerIndex).length === 0) {
//     return newState;
//   }

//   // Pass 2: enforce totals into tblVoucherLedger (single state write)
//   setNewState((prev) => {
//     const ledgers = Array.isArray(prev.tblVoucherLedger)
//       ? prev.tblVoucherLedger
//       : [];

//     const updated = ledgers.map((row, idx) => {
//       const totals = totalsByLedgerIndex[idx];
//       if (!totals) return row;

//       return {
//         ...row,
//         debitAmount: totals.debitAmount,
//         debitAmountFc: totals.debitAmountFc,
//       };
//     });

//     return { ...prev, tblVoucherLedger: updated };
//   });
// };

const syncLedgerTotalsFromDetails = () => {
  if (!newState || !Array.isArray(newState.tblVoucherLedger)) {
    return newState;
  }

  // Helpers
  const toNum = (v) => {
    if (v === null || v === undefined || v === "") return 0;
    const n = Number(String(v).replace(/,/g, "")); // handles "5,000.00"
    return Number.isFinite(n) ? n : 0;
  };

  const getDetails = (ledgerRow) =>
    Array.isArray(ledgerRow?.tblVoucherLedgerDetails)
      ? ledgerRow.tblVoucherLedgerDetails
      : [];

  // Pass 1: compute totals for each parent ledger row index
  const totalsByLedgerIndex = {};

  newState.tblVoucherLedger.forEach((ledgerRow, idx) => {
    const details = getDetails(ledgerRow);

    let creditHC = 0;
    let creditFC = 0;

    for (const d of details) {
      // ✅ handle both correct key & buggy key with trailing space "debitAmount "
      const rawHC = d?.debitAmount ?? d?.["debitAmount "] ?? 0;
      const rawFC = d?.debitAmountFc ?? d?.["debitAmountFc "] ?? 0;

      creditHC += toNum(rawHC);
      creditFC += toNum(rawFC);
    }

    totalsByLedgerIndex[idx] = {
      creditAmount: creditHC === 0 ? "" : creditHC.toFixed(2),
      creditAmountFc: creditFC === 0 ? "" : creditFC.toFixed(2),
    };
  });

  // Nothing to do if no rows
  if (Object.keys(totalsByLedgerIndex).length === 0) {
    return newState;
  }

  // Pass 2: enforce totals into tblVoucherLedger (single state write)
  setNewState((prev) => {
    const ledgers = Array.isArray(prev.tblVoucherLedger)
      ? prev.tblVoucherLedger
      : [];

    const updated = ledgers.map((row, idx) => {
      const totals = totalsByLedgerIndex[idx];
      if (!totals) return row;

      return {
        ...row,
        creditAmount: totals.creditAmount,
        creditAmountFc: totals.creditAmountFc,
      };
    });

    return { ...prev, tblVoucherLedger: updated };
  });
};


  return (
    <React.Fragment>
      {!isGridEdit ? (
        <>
          <TableRow
            onDoubleClick={() => {
              toggleSubChildEdit();
            }}
            key={index}
            sx={{ "& > *": { borderBottom: "unset" } }}
            className={
              !isView ? `${styles.tableCellHoverEffect} ${styles.hh1}   ` : ""
            }
          >
            {subChild.fields
              .filter((elem) => elem.isGridView)
              .map((field, subIndex) => (
                <TableCell
                  key={subIndex}
                  sx={{
                    ...gridSectionStyles,
                    paddingLeft: subIndex === 0 ? "29px" : "0px",
                  }}
                  className="overflow-y-hidden"
                >
                  <div className="relative">
                    {/* <div className={childTableRowStyles}>
                      {field.controlname === "dropdown" ||
                      field.controlname === "multiselect"
                        ? subChildObject[`${field.fieldname}dropdown`]?.[0]
                            ?.value || subChildObject[`${field.fieldname}`]
                        : subChildObject[`${field.fieldname}`] || ""}
                    </div> */}
                    <div
                      className={`${childTableRowStyles} overflow-hidden whitespace-nowrap`}
                      style={{ maxWidth: "200px" }}
                    >
                      {field.controlname === "dropdown" ||
                        field.controlname === "multiselect"
                        ? (
                          subChildObject[`${field.fieldname}dropdown`]?.[0]
                            ?.label || subChildObject[`${field.fieldname}Dropdown`]
                        )?.length > 15
                          ? (
                            subChildObject[`${field.fieldname}dropdown`]?.[0]
                              ?.label || subChildObject[`${field.fieldname}Dropdown`]
                          )?.slice(0, 15) + "..."
                          : subChildObject[`${field.fieldname}dropdown`]?.[0]
                            ?.label ||
                          subChildObject[`${field.fieldname}Dropdown`] ||
                          ""
                        : subChildObject[`${field.fieldname}`]?.toString() || ""}
                    </div>

                    {subIndex == 0 && (
                      <div className={`${styles.iconContainer}`}>
                        <div className="absolute left-[-7px] top-[-2px] cursor-pointer">
                          <Checkbox
                            edge="start"
                            checked={subChildObject.isChecked}
                            tabIndex={-1}
                            disableRipple
                            inputProps={{ "aria-labelledby": field.fieldname }}
                            onChange={(event) =>
                              handleChange(event, subChildObject, index)
                            }
                          />
                        </div>

                      </div>
                    )}
                  </div>
                </TableCell>
              ))}

            {/* icons  */}
            <>
              <div className="absolute right-0 w-fit hh group-hover:bg-[var(--table-hover-bg)]  ">
                <LightTooltip title="Delete Record ">
                  <IconButton
                    aria-label="Delete"
                    className={styles.icon}
                    onClick={() => deleteSubChildRecord(index)}
                    onMouseEnter={() => setHoveredIcon("delete")}
                    onMouseLeave={() => setHoveredIcon(null)}
                  >
                    <Image
                      src={
                        hoveredIcon === "delete"
                          ? DeleteHover
                          : DeleteIcon2
                      }
                      alt="Delete Icon"
                      priority={false}
                      className="gridIcons2"
                    />
                  </IconButton>
                </LightTooltip>
                <LightTooltip title="Copy Document">
                  <IconButton
                    aria-label="Document"
                    className={styles.icon}
                    onClick={() => copyDocument(editSubChildObj)}
                    onMouseEnter={() => setHoveredIcon("copy")}
                    onMouseLeave={() => setHoveredIcon(null)}
                  >
                    <Image
                      src={hoveredIcon === "copy" ? CopyHover : copyDoc}
                      alt="Document Icon"
                      className="gridIcons2"
                      priority={false}
                    />
                  </IconButton>
                </LightTooltip>
              </div>
              {/* icons ends here  */}
            </>
          </TableRow>
        </>
      ) : (
        <>
          <TableRow
            className={
              !isView ? `${styles.tableCellHoverEffect} ${styles.hh1}  ` : ""
            }
            sx={{
              "&:hover": {
                backgroundColor: "unset !important", // Override hover background color
                cursor: "default !important", // Remove pointer cursor on hover
              },
              "& > *": { borderBottom: "unset" },
              ...formChildTableRowStyles,
            }}
          >
            {subChild.fields
              .filter((elem) => elem.isGridView)
              .map((field, index) => (
                <TableCell
                  key={index}
                  align="left"
                  sx={{
                    padding: "0 ",
                    lineHeight: "0",
                    fontSize: "12px",
                  }}
                >
                  <Box className="flex gap-4">
                    {index === 0 ?
                      <React.Fragment key={index}>
                        <ActionButton
                          copyImagepath=""
                          deleteImagePath=""
                          onCopy={() => copyDocument(editSubChildObj)}
                          onDelete={() => deleteSubChildRecord(index)}
                        />

                      </React.Fragment>

                      : <></>}
                    <GridInputFields
                      fieldData={field}
                      indexValue={index}
                      onValuesChange={(e) => {
                        setEditSubChildObj((prev) => {
                          return { ...prev, ...e };
                        });
                        setCopyChildValueObj((prev) => {
                          // Clone the previous state to avoid direct mutation
                          const newCopy = { ...prev };
                          let tableName = Object.keys(newCopy)[0];

                          // Loop through the outer array of 'tblJobQty'
                          newCopy[tableName] = newCopy[tableName]?.map(
                            (nestedArray) => {
                              // Loop through the objects in the nested array
                              return nestedArray.map((item) => {
                                // Find the object with the matching '_id'
                                if (item._id === editSubChildObj._id) {
                                  // Update the value of the matched object
                                  return { ...item, ...e };
                                }
                                // Return the item unchanged if it's not the one to update
                                return item;
                              });
                            }
                          );

                          // Return the updated state
                          return newCopy;
                        });
                      }}
                      values={editSubChildObj}
                      inEditMode={inEditMode}
                      onChangeHandler={(e) => {
                        console.log("onchangeHandler", e);
                      }}
                      onBlurHandler={(e) => {
                        console.log("onBlurHandler", e);
                      }}
                    />
                  </Box>
                </TableCell>
              ))}
          </TableRow>
        </>
      )}

      {openSubChildEdit && (
        <TableRow key={subChildObject._id} on>
          <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={4}>
            <Collapse in={openSubChildEdit} timeout="auto" unmountOnExit>
              <Box sx={{ margin: 1, width: `${containerWidth - 20}px` }}>
                <div className="relative flex justify-between w-full">
                  {/* Custom Input Fields in the middle */}
                  <CustomeInputFields
                    inputFieldData={subChild?.fields}
                    onValuesChange={(e) => {
                      setEditSubChildObj((prev) => {
                        return { ...prev, ...e };
                      });
                    }}
                    values={editSubChildObj}
                    inEditMode={inEditMode}
                    onChangeHandler={(result) => {
                      handleChangeFunction(result);
                    }}
                    onBlurHandler={(result) => {
                      handleBlurFunction(result);
                    }}
                    isView={isView}
                    clearFlag={clearFlag}
                    newState={newState}
                    formControlData={formControlData}
                    setFormControlData={setFormControlData}
                    setStateVariable={setEditSubChildObj}
                  />
                  {/* Icon Button on the right */}
                  {!isView && (
                    <div className="relative top-0 right-2 flex justify-end items-baseline ">
                      <HoverIcon
                        defaultIcon={refreshIcon}
                        hoverIcon={revertHover}
                        altText={"Revert"}
                        title={"Revert"}
                        onClick={() => {
                          setEditSubChildObj({ ...subChildObject });
                          toggleSubChildEdit();
                        }}
                      />

                      <HoverIcon
                        defaultIcon={saveIcon}
                        hoverIcon={saveIconHover}
                        altText={"Save"}
                        title={"Save 1"}
                        onClick={() => {
                          for (const feild of subChild.fields) {
                            if (
                              feild.isRequired &&
                              (!Object.prototype.hasOwnProperty.call(
                                editSubChildObj,
                                feild.fieldname
                              ) ||
                                editSubChildObj[feild.fieldname]
                                  .toString()
                                  .trim() === "")
                            ) {
                              toast.error(
                                `Value for ${feild.yourlabel} is missing or empty.`
                              );
                              return;
                            }
                          }
                          try {
                            if (subChild.functionOnSubmit && subChild.functionOnSubmit !== null) {
                              for (const fun of subChild?.functionOnSubmit.split(";") || []) {

                                let updatedData = onSubmitFunctionCall(
                                  fun,
                                  newState,
                                  formControlData,
                                  editSubChildObj,
                                  setEditSubChildObj,
                                  childName,
                                  childIndex,
                                  index
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
                                  //   return
                                  // }
                                }
                                if (updatedData) {
                                  setSubChildObject((pre) => ({
                                    ...pre,
                                    ...updatedData?.values,
                                  }));
                                  setNewState((pre) => ({ ...pre, ...updatedData?.newState }));
                                  setSubmitNewState((pre) => ({
                                    ...pre,
                                    ...updatedData?.newState,
                                  }));
                                }
                              }
                            }
                          } catch (error) {
                            return toast.error(error.message);
                          }

                          setNewState((prev) => {
                            const newState = JSON.parse(JSON.stringify(prev));
                            // Assuming you have the index of the item you want to update
                            // For example, let's say the index is stored in childValuseObj.index
                            const idToUpdate = editSubChildObj.indexValue;

                            newState[childName][childIndex][
                              subChild.tableName
                            ] = newState[childName][childIndex][
                              subChild.tableName
                            ].map((record) => {
                              // Check if the record's id matches the idToUpdate
                              console.log(record.indexValue);
                              if (record.indexValue === idToUpdate) {
                                // Update the record
                                return editSubChildObj;
                              }
                              return record;
                            });

                            return newState;
                          });

                          setSubmitNewState((prev) => {
                            const newState = JSON.parse(JSON.stringify(prev));
                            // Assuming you have the index of the item you want to update
                            // For example, let's say the index is stored in childValuseObj.index
                            const idToUpdate = editSubChildObj.indexValue;

                            newState[childName][childIndex][
                              subChild.tableName
                            ] = newState[childName][childIndex][
                              subChild.tableName
                            ].map((record) => {
                              // Check if the record's id matches the idToUpdate
                              console.log(record.indexValue);
                              if (record.indexValue === idToUpdate) {
                                // Update the record
                                return editSubChildObj;
                              }
                              return record;
                            });

                            return newState;
                          });

                          toggleSubChildEdit();
                          syncLedgerTotalsFromDetails();
                        }}
                      />
                    </div>
                  )}
                </div>
              </Box>
            </Collapse>
          </TableCell>
        </TableRow>
      )}
    </React.Fragment>
  );
}
