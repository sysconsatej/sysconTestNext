"use client";
import React, { useState, useEffect, Fragment } from "react";
import TableCell from "@mui/material/TableCell";
import LightTooltip from "@/components/Tooltip/customToolTip";
import Image from "next/image";
import Box from "@mui/material/Box";
import CustomeInputFields from "@/components/Inputs/customeInputFields";
import GridInputFields from "@/components/Inputs/gridInputFields";
import TableRow from "@mui/material/TableRow";
import Collapse from "@mui/material/Collapse";
import IconButton from "@mui/material/IconButton";
import styles from "@/app/app.module.css";
import HoverIcon from "@/components/HoveredIcons/HoverIcon";
import {
  DeleteIcon2,
  copyDoc,
  refreshIcon,
  saveIcon,
  PlayIcon1,
  PlayIcon2,
  PlayIcon3,
  DeleteHover,
  CopyHover,
  PlayIcon4,
  revertHover,
  saveIconHover,
} from "@/assets";
import SubChildComponent from "@/app/(groupControl)/invoiceControl/addEdit/SubChildComponent";
import PropTypes from "prop-types";
import { isDateFormat } from "@/helper/dateFormat";
import {
  checkBoxStyle,
  childTableRowStyles,
  formChildTableRowStyles,
  gridSectionStyles,
} from "@/app/globalCss";
import { toast } from "react-toastify";
import Checkbox from "@mui/material/Checkbox";
import { ActionButton } from "@/components/ActionsButtons";
import * as onSubmitValidation from "@/helper/onSubmitFunction";

const icons = [PlayIcon1, PlayIcon2, PlayIcon3, PlayIcon4];

function isConfigFlagEnabled(value) {
  if (value === true || value === 1 || value === "1") return true;
  if (typeof value === "string") {
    const normalized = value.trim().toLowerCase();
    return ["true", "yes", "y", "t"].includes(normalized);
  }
  return false;
}

function onSubmitFunctionCall(functionData, data) {
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
      onSubmitValidation?.[funcName]({
        ...data,
      });
      // onChangeHandler(updatedValues); // Assuming you have an onChangeHandler function to handle the updated values
    }
  }
}

RowComponent.propTypes = {
  row: PropTypes.any,
  fields: PropTypes.any,
  subChild: PropTypes.any,
  childIndex: PropTypes.any,
  childName: PropTypes.any,
  sectionData: PropTypes.any,
  newState: PropTypes.any,
  setNewState: PropTypes.any,
  setInputFieldsVisible: PropTypes.any,
  expandAll: PropTypes.any,
  inEditMode: PropTypes.any,
  setRenderedData: PropTypes.any,
  deleteChildRecord: PropTypes.any,
  originalData: PropTypes.any,
  calculateData: PropTypes.any,
  setCalculateData: PropTypes.any,
  dummyFieldArray: PropTypes.any,
  setDummyFieldArray: PropTypes.any,
  isGridEdit: PropTypes.any,
  setCopyChildValueObj: PropTypes.any,
  isView: PropTypes.any,
  setOpenModal: PropTypes.any,
  setParaText: PropTypes.any,
  setIsError: PropTypes.any,
  setTypeofModal: PropTypes.any,
  clearFlag: PropTypes.any,
  setClearFlag: PropTypes.any,
  containerWidth: PropTypes.any,
  submitNewState: PropTypes.any,
  setSubmitNewState: PropTypes.any,
  removeChildRecordFromInsert: PropTypes.any,
  formControlData: PropTypes.any,
  setFormControlData: PropTypes.any,
  showSrNo: PropTypes.bool,
  tableBodyWidth: PropTypes.string,
};
export default function RowComponent({
  row,
  fields,
  subChild,
  childName,
  childIndex,
  sectionData,
  newState,
  setNewState,
  expandAll,
  inEditMode,
  setRenderedData,
  deleteChildRecord,
  originalData,
  calculateData,
  setCalculateData,
  setDummyFieldArray,
  isGridEdit,
  setCopyChildValueObj,
  isView,
  setOpenModal,
  setParaText,
  setIsError,
  setTypeofModal,
  clearFlag,
  setClearFlag,
  containerWidth,
  submitNewState,
  setSubmitNewState,
  removeChildRecordFromInsert,
  formControlData,
  setFormControlData,
  showSrNo = false,
  tableBodyWidth,
}) {
  const [childValuseObj, setChildValuseObj] = useState({ ...row });
  const [openChildEdit, setOpenChildEdit] = useState(false); // State to manage open/close of this particular row
  const [subChildViewData, setSubChildViewData] = useState([]);
  const [hoveredIcon, setHoveredIcon] = useState(null);
  // const [isChecked, setIsChecked] = useState(true);
  const [subChildComponent, setSubChildComponent] = useState(
    expandAll ? true : false,
  );
  const isChildDeleteHidden = isConfigFlagEnabled(sectionData?.isDeleteHide);
  const isChildCopyHidden = isConfigFlagEnabled(sectionData?.isAddHide);

  let groupedData = subChild.reduce((result, obj) => {
    const { tableName } = obj;

    if (!result[tableName]) {
      result[tableName] = obj;
    }
    return result;
  }, {});

  const toggleRow = () => {
    setOpenChildEdit((prev) => !prev);
  };

  const isSameEditableRow = (leftRow, rightRow) => {
    if (!leftRow || !rightRow) return false;

    if (leftRow?._id != null && rightRow?._id != null) {
      return leftRow._id === rightRow._id;
    }

    if (
      leftRow?.voucherOutstandingId != null &&
      rightRow?.voucherOutstandingId != null
    ) {
      return leftRow.voucherOutstandingId === rightRow.voucherOutstandingId;
    }

    if (leftRow?.indexValue != null && rightRow?.indexValue != null) {
      return leftRow.indexValue === rightRow.indexValue;
    }

    return false;
  };

  const applyVoucherDetailManualFlags = (nextRow, prevRow = {}) => {
    if (sectionData?.tableName !== "tblVoucherLedgerDetails") {
      return nextRow;
    }

    const toNum = (value) => {
      if (value === null || value === undefined || value === "") return 0;
      const parsed = Number(String(value).replace(/,/g, ""));
      return Number.isFinite(parsed) ? parsed : 0;
    };

    const didHcChange =
      String(prevRow?.debitAmount ?? "") !== String(nextRow?.debitAmount ?? "") ||
      String(prevRow?.creditAmount ?? "") !==
        String(nextRow?.creditAmount ?? "");

    const didFcChange =
      String(prevRow?.debitAmountFc ?? "") !==
        String(nextRow?.debitAmountFc ?? "") ||
      String(prevRow?.creditAmountFc ?? "") !==
        String(nextRow?.creditAmountFc ?? "");

    const hasManualHc =
      toNum(nextRow?.debitAmount) !== 0 || toNum(nextRow?.creditAmount) !== 0;

    const hasManualFc =
      toNum(nextRow?.debitAmountFc) !== 0 ||
      toNum(nextRow?.creditAmountFc) !== 0;

    return {
      ...nextRow,
      __manualAllocHC: didHcChange
        ? hasManualHc
        : !!prevRow?.__manualAllocHC,
      __manualAllocFC: didFcChange
        ? hasManualFc
        : !!prevRow?.__manualAllocFC,
    };
  };

  const toggleSubChildRow = (key) => {
    // Prevent toggling if groupedData[key].isHideGrid is true
    if (groupedData[key]?.isHideGrid) return;

    if (subChildViewData.includes(key)) {
      setSubChildViewData((prev) => prev.filter((item) => item !== key));
      if (subChildViewData.length !== 0) {
        setSubChildComponent(true);
      } else {
        setSubChildComponent(false);
      }
    } else {
      setSubChildViewData((prev) => [...prev, key]);
      setSubChildComponent(true);
    }
  };

  function copyDocument(obj) {
    if (isChildCopyHidden) return;
    if (Object.keys(obj).length !== 0) {
      const tmpData = { ...newState };
      tmpData[sectionData.tableName].push({
        ...obj,
        indexValue: tmpData[sectionData.tableName].length,
      });
      setNewState(tmpData);
      setSubmitNewState(tmpData);
      setRenderedData(newState[sectionData.tableName]);
    }
  }

  // useEffect(() => {
  //   if (expandAll) {
  //     Object.keys(groupedData).forEach((key) => {
  //       if (!subChildViewData.includes(key)) {
  //         setSubChildViewData((prev) => [...prev, key]);
  //       }
  //     });
  //   }
  // }, [expandAll]);

  useEffect(() => {
    setChildValuseObj({ ...row });
  }, [row]);

  const dummyData = () => {
    const tmpData = fields
      .filter((elem) => elem.isDummy)
      .map((field) => {
        return {
          [field.fieldname]: row[field.fieldname] ? row[field.fieldname] : "",
        };
      })
      .reduce((obj, item) => {
        Object.assign(obj, item);
        return obj;
      }, {});

    setCalculateData(
      Object.values(tmpData).reduce((acc, item) => {
        return acc + Number(item) ? Number(item) : 0;
      }, 0) + calculateData,
    );

    setDummyFieldArray(
      Object.keys(tmpData).map((key) => ({
        [key]:
          Object.values(tmpData).reduce((acc, item) => {
            return acc + Number(item);
          }, 0) + calculateData,
      })),
    );
  };

  useEffect(() => {
    dummyData();
  }, []);

  useEffect(() => {
    Object.keys(groupedData).forEach((key) => {
      if (
        groupedData[key]?.isGridExpandOnLoad === true &&
        row[key].length !== 0
      ) {
        toggleSubChildRow(key);
      }
    });
  }, []);

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
    setChildValuseObj((pre) => {
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
    setChildValuseObj((pre) => {
      return {
        ...pre,
        ...data,
      };
    });
  }

  function addChildRecordToInsert(obj, index) {
    // if (Object.keys(obj).length !== 0) {
    //   const tmpData = { ...submitNewState };
    //   tmpData[sectionData.tableName].push({ ...obj, isChecked: true });
    //   setSubmitNewState(tmpData);
    // }
    if (Object.keys(obj).length !== 0) {
      setSubmitNewState((prevState) => {
        const newStateCopy = { ...newState, ...prevState };
        // Assume each entry in the array has an 'id' property
        let updatedData = newStateCopy[sectionData.tableName].filter(
          (_, idx) => idx === index,
        );
        updatedData = { ...updatedData[0], isChecked: true };
        newStateCopy[sectionData.tableName][index] = updatedData;
        return newStateCopy;
      });
      setNewState((prevState) => {
        const newStateCopy = { ...newState, ...prevState };
        // Assume each entry in the array has an 'id' property
        let updatedData = newStateCopy[sectionData.tableName].filter(
          (_, idx) => idx === index,
        );
        updatedData = { ...updatedData[0], isChecked: true };
        newStateCopy[sectionData.tableName][index] = updatedData;
        return newStateCopy;
      });
    }
  }

  const handleChange = (event, row, index) => {
    if (event.target.checked === false) {
      removeChildRecordFromInsert(row._id, index);
    } else {
      addChildRecordToInsert(row, index);
    }
  };

  const stylesIconsHover =
    tableBodyWidth === "0"
      ? { right: tableBodyWidth + "px", width: "auto" }
      : { left: tableBodyWidth + "px", width: "auto" };

  return (
    <React.Fragment>
      {!isGridEdit ? (
        <>
          <TableRow
            onDoubleClick={toggleRow}
            className={
              isView
                ? ""
                : `${styles.tableCellHoverEffect} ${styles.hh} group relative`
            }
            sx={{
              "& > *": { borderBottom: "unset" },
              ...formChildTableRowStyles,
            }}
          >
            {fields
              .filter((elem) => elem.isGridView)
              .map((field, index) => (
                <React.Fragment key={index}>
                  {showSrNo && index === 0 && (
                    <TableCell
                      align="left"
                      sx={{
                        ...gridSectionStyles,
                        paddingLeft: "29px",
                        width: "64px",
                        minWidth: "64px",
                      }}
                    >
                      <div className="relative">
                        {index == 0 && (
                          <div className={` ${styles.iconContainer}`}>
                            <div className="absolute left-[-7px] top-[-2px] cursor-pointer">
                              <Checkbox
                                edge="start"
                                sx={{
                                  ...checkBoxStyle,
                                }}
                                checked={row.isChecked}
                                tabIndex={-1}
                                disableRipple
                                inputProps={{
                                  "aria-labelledby": field.fieldname,
                                }}
                                onChange={(event) =>
                                  handleChange(event, row, childIndex)
                                }
                              />
                            </div>
                          </div>
                        )}
                      </div>
                      <div className={`${childTableRowStyles} font-medium`}>
                        {childIndex + 1}
                      </div>
                    </TableCell>
                  )}
                  <TableCell
                    align="left"
                    sx={{
                      ...gridSectionStyles,
                      paddingLeft:
                        index === 0 ? "29px" : showSrNo ? "29px" : "0px",
                    }}
                  >
                    <div className="relative">
                      <div
                        className={`${childTableRowStyles} overflow-hidden whitespace-nowrap`}
                        style={{ maxWidth: "200px" }}
                      >
                        {field.controlname === "dropdown" ||
                        field.controlname === "multiselect"
                          ? (
                              row[`${field.fieldname}dropdown`]?.[0]?.label ||
                              row[`${field.fieldname}Dropdown`]
                            )?.length > 15
                            ? (
                                row[`${field.fieldname}dropdown`]?.[0]?.label ||
                                row[`${field.fieldname}Dropdown`]
                              )?.slice(0, 15) + "..."
                            : row[`${field.fieldname}dropdown`]?.[0]?.label ||
                              row[`${field.fieldname}Dropdown`] ||
                              ""
                          : isDateFormat(row[`${field.fieldname}`]) || ""}
                      </div>

                      {!showSrNo && index == 0 && (
                        <div className={` ${styles.iconContainer}`}>
                          <div className="absolute left-[-7px] top-[-2px] cursor-pointer">
                            <Checkbox
                              edge="start"
                              sx={{
                                ...checkBoxStyle,
                              }}
                              checked={row.isChecked}
                              tabIndex={-1}
                              disableRipple
                              inputProps={{
                                "aria-labelledby": field.fieldname,
                              }}
                              onChange={(event) =>
                                handleChange(event, row, childIndex)
                              }
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  </TableCell>
                </React.Fragment>
              ))}
            <div
              // className="group absolute right-0 w-fit"
              className={`group-hover:visible flex flex-nowrap justify-end invisible absolute`}
              style={stylesIconsHover}
            >
              {!isChildDeleteHidden && (
                <LightTooltip title="Delete Record">
                  <IconButton
                    disabled={
                      typeof sectionData.isDeleteFunctionality !== "undefined"
                        ? !sectionData.isDeleteFunctionality
                        : false
                    }
                    aria-label="Delete"
                    className={styles.icon}
                    onClick={() => deleteChildRecord(childIndex)}
                    onMouseEnter={() => setHoveredIcon("delete")}
                    onMouseLeave={() => setHoveredIcon(null)}
                  >
                    <Image
                      src={hoveredIcon === "delete" ? DeleteHover : DeleteIcon2}
                      alt="Delete Icon"
                      priority={false}
                      className="gridIcons2"
                    />
                  </IconButton>
                </LightTooltip>
              )}
              {!isChildCopyHidden && (
                <LightTooltip title="Copy Document">
                  <IconButton
                    disabled={
                      typeof sectionData.isCopyFunctionality !== "undefined"
                        ? !sectionData.isCopyFunctionality
                        : false
                    }
                    aria-label="Document"
                    className={styles.icon}
                    onClick={() => copyDocument(childValuseObj)}
                    onMouseEnter={() => setHoveredIcon("copy")}
                    onMouseLeave={() => setHoveredIcon(null)}
                  >
                    <Image
                      src={hoveredIcon === "copy" ? CopyHover : copyDoc}
                      alt="Document Icon"
                      priority={false}
                      className="gridIcons2"
                    />
                  </IconButton>
                </LightTooltip>
              )}

              {Object.keys(groupedData).map((key, index) => {
                if (groupedData[key]?.isHideGrid) return null;
                return (
                  <LightTooltip key={index} title={key}>
                    <IconButton
                      aria-label="Add fields"
                      className={styles.icon}
                      onClick={() => toggleSubChildRow(key)}
                    >
                      <Image
                        src={icons[index % icons.length]} // src points to the current icon to display
                        alt={`Play Icon ${index + 1}`}
                        className="gridIcons2"
                      />
                    </IconButton>
                  </LightTooltip>
                );
              })}
            </div>
          </TableRow>
        </>
      ) : (
        <>
          <TableRow
            className={
              isView ? "" : `${styles.tableCellHoverEffect} ${styles.hh}`
            }
            sx={{
              "& > *": { borderBottom: "unset" },
              ...formChildTableRowStyles,
            }}
          >
            {fields
              .filter((elem) => elem.isGridView)
              .map((field, index) => (
                <React.Fragment key={index}>
                  <TableCell
                    align="left"
                    sx={{
                      padding: "0 ",
                      lineHeight: "0",
                      fontSize: "12px",
                    }}
                  >
                    <Box className="flex gap-4">
                      {index === 0 ? (
                        <Fragment key={index}>
                          <ActionButton
                            copyImagepath={copyDoc}
                            deleteImagePath={DeleteIcon2}
                            onCopy={() => copyDocument(childValuseObj)}
                            onDelete={() => deleteChildRecord(childIndex)}
                            showDelete={!isChildDeleteHidden}
                            showCopy={!isChildCopyHidden}
                          />
                        </Fragment>
                      ) : (
                        <></>
                      )}
                    <GridInputFields
                      fieldData={field}
                      indexValue={index}
                      onValuesChange={(e) => {
                        setChildValuseObj((prev) => {
                          return applyVoucherDetailManualFlags(
                            { ...prev, ...e },
                            prev
                          );
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
                                if (isSameEditableRow(item, childValuseObj)) {
                                  return applyVoucherDetailManualFlags(
                                    { ...item, ...e },
                                    item
                                  );
                                }
                                return item;
                              });
                            },
                          );

                          // Return the updated state
                          return newCopy;
                        });
                        }}
                        values={childValuseObj}
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
                  {showSrNo && index === 0 && (
                    <TableCell
                      align="left"
                      sx={{
                        padding: "0 8px",
                        lineHeight: "0",
                        fontSize: "12px",
                        width: "64px",
                        minWidth: "64px",
                      }}
                    >
                      <Box className="flex items-center h-full pl-1 text-xs font-semibold">
                        {childIndex + 1}
                      </Box>
                    </TableCell>
                  )}
                </React.Fragment>
              ))}
          </TableRow>
        </>
      )}

      {/* EDIT CHILD */}
      {openChildEdit && (
        <TableRow>
          <TableCell style={{ padding: 0 }} colSpan={4} className="">
            <Collapse
              className=""
              in={openChildEdit}
              timeout="auto"
              unmountOnExit
            >
              <Box
                sx={{ margin: 0, width: `${containerWidth}px` }}
                className=""
              >
                <div className="relative flex justify-between pl-[16px] py-[8px]  ">
                  {/* Custom Input Fields in the middle */}
                  <CustomeInputFields
                    isView={isView}
                    inputFieldData={fields}
                    onValuesChange={(e) => {
                      setChildValuseObj((prev) => {
                        return { ...prev, ...e };
                      });
                    }}
                    values={childValuseObj}
                    inEditMode={inEditMode}
                    onChangeHandler={(result) => {
                      handleChangeFunction(result);
                    }}
                    onBlurHandler={(result) => {
                      handleBlurFunction(result);
                    }}
                    clearFlag={clearFlag}
                    newState={newState}
                    formControlData={formControlData}
                    setFormControlData={setFormControlData}
                    setStateVariable={setChildValuseObj}
                  />
                  {/* Icon Button on the right */}
                  {!isView && (
                    <div className=" md:ml-8 relative top-0 right-2 flex justify-end items-baseline">
                      <HoverIcon
                        defaultIcon={refreshIcon}
                        hoverIcon={revertHover}
                        altText={"Revert"}
                        title={"Revert"}
                        onClick={() => {
                          setChildValuseObj({ ...row });
                          toggleRow();
                        }}
                      />

                      <HoverIcon
                        defaultIcon={saveIcon}
                        hoverIcon={saveIconHover}
                        altText={"Save"}
                        title={"Save"}
                        onClick={() => {
                          const nextChildRow = applyVoucherDetailManualFlags(
                            childValuseObj,
                            row
                          );

                          for (const feild of fields) {
                            if (
                              feild.isRequired &&
                              (!Object.prototype.hasOwnProperty.call(
                                nextChildRow,
                                feild.fieldname,
                              ) ||
                                nextChildRow[feild.fieldname]
                                  .toString()
                                  .trim() === "")
                            ) {
                              toast.error(
                                `Value for ${feild.yourlabel} is missing or empty.`,
                              );
                              return;
                            }
                          }
                          try {
                            if (
                              sectionData.functionOnSubmit &&
                              sectionData.functionOnSubmit !== null
                            ) {
                              sectionData?.functionOnSubmit
                                .split(";")
                                .forEach((fn) => {
                                  onSubmitFunctionCall(fn, childValuseObj);
                                });
                              // onSubmitValidation[sectionData.functionOnSubmit]({
                              //   ...childValuseObj})
                            }
                          } catch (error) {
                            return toast.error(error.message);
                          }

                          setNewState((prev) => {
                            const newState = { ...prev };
                            // Assuming you have the index of the item you want to update
                            // For example, let's say the index is stored in childValuseObj.index
                            const idToUpdate = nextChildRow.indexValue;

                            newState[sectionData.tableName] = newState[
                              sectionData.tableName
                            ].map((record) => {
                              // Check if the record's id matches the idToUpdate
                              console.log(record.indexValue);
                              if (record.indexValue === idToUpdate) {
                                // Update the record
                                return nextChildRow;
                              }
                              return record;
                            });

                            return newState;
                          });

                          setSubmitNewState((prev) => {
                            const newState = { ...prev };
                            // Assuming you have the index of the item you want to update
                            // For example, let's say the index is stored in childValuseObj.index
                            const idToUpdate = nextChildRow.indexValue;

                            newState[sectionData.tableName] = newState[
                              sectionData.tableName
                            ].map((record) => {
                              // Check if the record's id matches the idToUpdate
                              console.log(record.indexValue);
                              if (record.indexValue === idToUpdate) {
                                // Update the record
                                return nextChildRow;
                              }
                              return record;
                            });

                            return newState;
                          });

                          setRenderedData(newState[sectionData.tableName]);
                          toggleRow();
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

      {/* ADD & EDIT SUB CHILD DATA */}
      {subChildComponent &&
        subChildViewData.map((key, index) => {
          if (groupedData[key]?.isHideGrid) return null;
          return (
            <TableRow key={index} className={`${styles.pageBackground}`}>
              <TableCell style={{ padding: 0 }} colSpan={12}>
                <Collapse in={subChildComponent} timeout="auto" unmountOnExit>
                  <Box
                    sx={{ margin: 1, overflow: "auto", position: "relative" }}
                    className={`${styles.hideScrollbar} ${styles.thinScrollBar} ${styles.pageBackground} mb-0 mt-0`}
                  >
                    <SubChildComponent
                      key={index}
                      subChild={groupedData[key]}
                      row={childValuseObj}
                      index={childIndex}
                      newState={newState}
                      setNewState={setNewState}
                      childName={childName}
                      childIndex={childIndex}
                      setSubChildComponent={setSubChildComponent}
                      expandAll={expandAll}
                      inEditMode={inEditMode}
                      originalData={originalData}
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
                      keyValue={key}
                      setSubChildViewData={setSubChildViewData}
                      formControlData={formControlData}
                      setFormControlData={setFormControlData}
                    />
                  </Box>
                </Collapse>
              </TableCell>
            </TableRow>
          );
        })}
    </React.Fragment>
  );
}
