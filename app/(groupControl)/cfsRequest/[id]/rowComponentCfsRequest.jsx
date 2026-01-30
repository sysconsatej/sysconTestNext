"use client";
/* eslint-disable */
import React, { useState, useEffect, useRef,useMemo  } from "react";
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
import SubChildComponent from "@/app/(groupControl)/formControl/addEdit/SubChildComponent";
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
import * as onSubmitValidation from "@/helper/onSubmitFunction";
import { ActionButton } from "@/components/ActionsButtons";
("");
import { useDispatch } from "react-redux";
import { updateFlag } from "@/app/counterSlice";

const icons = [PlayIcon1, PlayIcon2, PlayIcon3, PlayIcon4];

async function onSubmitFunctionCall(
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
      let result = await onSubmitValidation?.[funcName]({
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
  tableBodyWidhth: PropTypes.string,
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
  tableBodyWidhth,
}) {
  const dispatch = useDispatch();
  const [childValuseObj, setChildValuseObj] = useState({ ...row });
  const [openChildEdit, setOpenChildEdit] = useState(false); // State to manage open/close of this particular row
  const [subChildViewData, setSubChildViewData] = useState([]);
  const [hoveredIcon, setHoveredIcon] = useState(null);
  const [indexValue, setIndexValue] = useState({ ...row });
  // const [isChecked, setIsChecked] = useState(true);
  const [subChildComponent, setSubChildComponent] = useState(
    expandAll ? true : false
  );
  if (openChildEdit) {
    dispatch(
      updateFlag({
        flag: "selectedIndex",
        value: row.indexValue,
      })
    );
  }
  let groupedData =
    subChild ||
    [].reduce((result, obj) => {
      const { tableName } = obj;

      if (!result[tableName]) {
        result[tableName] = obj;
      }
      return result;
    }, {});

  const toggleRow = () => {
    setOpenChildEdit((prev) => !prev);
  };

  const toggleSubChildRow = (key) => {
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
    if (Object.keys(obj).length !== 0) {
      const tmpData = { ...newState };
      delete obj?.id;
      tmpData[sectionData.tableName].push({
        ...obj,
        indexValue: tmpData[sectionData.tableName].length,
      });
      setNewState(tmpData);
      setSubmitNewState(tmpData);
      setRenderedData(newState[sectionData.tableName]);
    }
  }

  useEffect(() => {
    if (expandAll) {
      Object.keys(groupedData).forEach((key) => {
        if (subChildViewData.includes(key)) {
          setSubChildViewData((prev) => [...prev, key]);
        }
      });
    }
  }, [expandAll]);

  useEffect(() => {
    setChildValuseObj({ ...row });
  }, [row]);

  useEffect(() => {
    Object.keys(groupedData).forEach((key) => {
      if (
        groupedData[key]?.isGridExpandOnLoad === true &&
        row[key]?.length !== 0
      ) {
        toggleSubChildRow(key);
      }
    });
  }, []);

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
      }, 0) + calculateData
    );

    setDummyFieldArray(
      Object.keys(tmpData).map((key) => ({
        [key]:
          Object.values(tmpData).reduce((acc, item) => {
            return acc + Number(item);
          }, 0) + calculateData,
      }))
    );
  };

  useEffect(() => {
    dummyData();
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
          (_, idx) => idx === index
        );
        updatedData = { ...updatedData[0], isChecked: true };
        newStateCopy[sectionData.tableName][index] = updatedData;
        return newStateCopy;
      });
      setNewState((prevState) => {
        const newStateCopy = { ...newState, ...prevState };
        // Assume each entry in the array has an 'id' property
        let updatedData = newStateCopy[sectionData.tableName].filter(
          (_, idx) => idx === index
        );
        updatedData = { ...updatedData[0], isChecked: true };
        newStateCopy[sectionData.tableName][index] = updatedData;
        return newStateCopy;
      });
    }
  }

  const handleChange = (event, row, index) => {
    if (event.target.checked === false) {
      removeChildRecordFromInsert(row.id, index);
    } else {
      addChildRecordToInsert(row, index);
    }
  };

  // const handleValuesChangeOfChildGrid = (e,index) => {
  //   setChildValuseObj((prev) => {
  //     return { ...prev, ...e };
  //   });
  //   setCopyChildValueObj((prev) => {
  //     // Clone the previous state to avoid direct mutation
  //     const newCopy = { ...prev };
  //     let tableName = Object.keys(newCopy)[0];
  //     // Loop through the outer array of 'tblJobQty'
  //     newCopy[tableName] = newCopy[tableName]?.map((nestedArray) => {
  //       // Loop through the objects in the nested array
  //       return nestedArray.map((item) => {
  //         // Find the object with the matching '_id'
  //         if (item.id === childValuseObj.id) {
  //           // Update the 'qty' of the matched object
  //           return { ...item, ...e };
  //         }
  //         // Return the item unchanged if it's not the one to update
  //         return item;
  //       });
  //     });

  //     // Return the updated state
  //     return newCopy;
  //   });
  // };

  const handleValuesChangeOfChildGrid = (e, index) => {
    console.log("Incoming event object (e):", e);
    console.log("Index:", index);

    setChildValuseObj((prev) => {
      const updated = { ...prev, ...e };
      console.log("Updated childValuseObj:", updated);
      return updated;
    });

    setCopyChildValueObj((prev) => {
      const newCopy = { ...prev };
      const tableName = Object.keys(newCopy)[0];

      console.log("Previous copyChildValueObj:", prev);
      console.log("Table name:", tableName);
      console.log("Before updating newCopy[tableName]:", newCopy[tableName]);

      // If newCopy[tableName] is an array of objects (not nested arrays), remove the inner map
      if (!Array.isArray(newCopy[tableName])) {
        console.error(
          `Expected an array at newCopy[${tableName}], but got:`,
          newCopy[tableName]
        );
        return prev; // don't update state if data is malformed
      }

      newCopy[tableName] = newCopy[tableName].map((item) => {
        if (item.id === childValuseObj.id) {
          console.log("Matched item to update:", item);
          return { ...item, ...e };
        }
        return item;
      });

      console.log("After updating:", newCopy[tableName]);
      dispatch(
        updateFlag({
          flag: "childRecord",
          value: newCopy,
        })
      );
      return newCopy;
    });
  };

  const reCalculate = (childIndex, tableName) => {
    if (tableName !== "tblRateRequestQty") return;

    if (!newState || !Array.isArray(newState[tableName])) return;

    const filteredRows = newState[tableName].filter(
      (_, index) => index !== childIndex
    );

    let totalVolume = 0;
    let totalVolumeWt = 0;
    let totalNoOfPackages = 0;

    filteredRows.forEach((row) => {
      const volume = parseFloat(row.volume) || 0;
      const volumeWt = parseFloat(row.volumeWt) || 0;
      const noOfPackages = parseInt(row.noOfPackages, 10) || 0;

      totalVolume += volume;
      totalVolumeWt += volumeWt;
      totalNoOfPackages += noOfPackages;
    });

    const updatedVolume = parseFloat(totalVolume.toFixed(2));
    const updatedVolumeWt = parseFloat(totalVolumeWt.toFixed(2));
    const updatedNoOfPackages = totalNoOfPackages.toString();

    setNewState((prevState) => ({
      ...prevState,
      volume: updatedVolume,
      volumeWt: updatedVolumeWt,
      noOfPackages: updatedNoOfPackages,
    }));
  };

  const stylesIconsHover =
    tableBodyWidhth === "0"
      ? { right: tableBodyWidhth + "px", width: "auto" }
      : { left: tableBodyWidhth + "px", width: "auto" };

  
const didInitCopyRef = useRef(false);
const prevFirstRowRef = useRef(""); // (kept, but now stores JSON of patch)
const rowOverridesRef = useRef({}); // { [rowIndex]: Set(fieldNames) }

const stableSignature = (obj) => {
  const normalize = (v) => {
    if (v instanceof Date) return v.toISOString();

    // dayjs/moment-like
    if (v && typeof v === "object") {
      if (typeof v.toDate === "function") return v.toDate().toISOString();
      if (v.$d instanceof Date) return v.$d.toISOString();
    }

    return v;
  };

  const keys = Object.keys(obj || {}).sort();
  const out = {};
  for (const k of keys) out[k] = normalize(obj[k]);
  return JSON.stringify(out);
};

const PROTECT_KEYS = useMemo(
  () =>
    new Set([
      "id",
      "containerTransactionId",
      "indexValue",
      "createdDate",
      "createdBy",
      "updatedDate",
      "updatedBy",
      "deletedNo",
      "clientId",
      "status",
      "containerNo",
      "containerId",
      "containerIdDropdown",
    ]),
  []
);

// ✅ SAME NAME (updated behavior: only changed field(s) copied)
const copyFirstRowToAllRowsExceptContainer = () => {
  const rows = newState?.tblContainerTransactionDetails;
  if (!Array.isArray(rows) || rows.length < 2) return;

  const firstRow = rows[0] || {};

  // patch = everything from row 0 except protected keys
  const patch = {};
  Object.keys(firstRow).forEach((k) => {
    if (!PROTECT_KEYS.has(k)) patch[k] = firstRow[k];
  });

  // store snapshot of row0 patch
  const currentPatchStr = stableSignature(patch);

  // 1) don’t auto-copy on initial load
  if (!didInitCopyRef.current) {
    didInitCopyRef.current = true;
    prevFirstRowRef.current = currentPatchStr;
    return;
  }

  // 2) compute ONLY changed keys vs previous patch
  const prevPatchStr = prevFirstRowRef.current || "";
  if (prevPatchStr === currentPatchStr) return; // no changes

  let prevPatchObj = {};
  try {
    prevPatchObj = prevPatchStr ? JSON.parse(prevPatchStr) : {};
  } catch {
    prevPatchObj = {};
  }

  const changedKeys = [];
  const allKeys = new Set([...Object.keys(prevPatchObj), ...Object.keys(patch)]);
  allKeys.forEach((k) => {
    if (PROTECT_KEYS.has(k)) return;
    // compare via stableSignature to handle date/dayjs
    const a = stableSignature({ v: prevPatchObj[k] });
    const b = stableSignature({ v: patch[k] });
    if (a !== b) changedKeys.push(k);
  });

  // update stored patch snapshot
  prevFirstRowRef.current = currentPatchStr;

  if (changedKeys.length === 0) return;

  const updatedRows = rows.map((r, i) => {
    if (i === 0 || !r) return r;

    const overrides = rowOverridesRef.current?.[i]; // Set(keys) or undefined

    // ✅ apply only changed keys (and respect overrides per row)
    const safePatch = {};
    changedKeys.forEach((k) => {
      if (!overrides || !overrides.has(k)) safePatch[k] = patch[k];
    });

    // nothing to apply for this row
    if (Object.keys(safePatch).length === 0) return r;

    return { ...r, ...safePatch };
  });

  setNewState((prev) => ({
    ...prev,
    tblContainerTransactionDetails: updatedRows,
  }));
};

useEffect(() => {
  copyFirstRowToAllRowsExceptContainer();
}, [
  stableSignature(
    (() => {
      const rows = newState?.tblContainerTransactionDetails;
      const r0 = Array.isArray(rows) && rows[0] ? rows[0] : {};
      const patch = {};
      Object.keys(r0).forEach((k) => {
        if (!PROTECT_KEYS.has(k)) patch[k] = r0[k];
      });
      return patch;
    })()
  ),
  newState?.tblContainerTransactionDetails?.length,
]);



  return (
    <React.Fragment>
      {/* child Code to edit the grid   */}
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
                <TableCell
                  align="left"
                  key={index}
                  sx={{
                    ...gridSectionStyles,
                    paddingLeft: index === 0 ? "29px" : "0px",
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
                        )?.length > 50
                          ? (
                            row[`${field.fieldname}dropdown`]?.[0]?.label ||
                            row[`${field.fieldname}Dropdown`]
                          )?.slice(0, 50) + "..."
                          : row[`${field.fieldname}dropdown`]?.[0]?.label ||
                          row[`${field.fieldname}Dropdown`] ||
                          ""
                        : isDateFormat(row[`${field.fieldname}`]) || ""}
                    </div>

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
                            inputProps={{ "aria-labelledby": field.fieldname }}
                            onChange={(event) =>
                              handleChange(event, row, childIndex)
                            }
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </TableCell>
              ))}
            <div
              className={`group-hover:visible flex flex-nowrap justify-end invisible absolute`}
              style={stylesIconsHover}
            >
              <LightTooltip title="Delete Record ">
                <IconButton
                  disabled={
                    typeof sectionData.isDeleteFunctionality !== "undefined"
                      ? !sectionData.isDeleteFunctionality
                      : false
                  }
                  aria-label="Delete"
                  className={styles.icon}
                  onClick={() => {
                    deleteChildRecord(childIndex);
                    reCalculate(childIndex, childName);
                  }}
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

              {Object.keys(groupedData).map((key, index) => {
                if (groupedData[key]?.isHideGrid) {
                  return;
                }
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
              // ...formChildTableRowStyles, { commmented as the hover effect is not needed for edit mode }
            }}
          >
            {fields
              .filter((elem) => elem.isGridView)
              .map((field, index) => (
                <TableCell
                  key={index}
                  align="left"
                  sx={{
                    padding: "0 ",
                    lineHeight: "0",
                    fontSize: "12px",
                    position: "relative",
                  }}
                >
                  <Box className="flex gap-4">
                    {childName != "tblVoucherLedgerDetails" && index === 0 ? (
                      <ActionButton
                        onDelete={() => deleteChildRecord(childIndex)}
                        key={index}
                        onCopy={() => copyDocument(childValuseObj)}
                        hover={hoveredIcon}
                        copyImagepath={copyDoc}
                        deleteImagePath={DeleteIcon2}
                      />
                    ) : (
                      <></>
                    )}
                    <GridInputFields
                      fieldData={field}
                      indexValue={index}
                      onValuesChange={(e) =>
                        handleValuesChangeOfChildGrid(e, index)
                      }
                      values={childValuseObj}
                      inEditMode={inEditMode}
                      onChangeHandler={null}
                      onBlurHandler={null}
                    />
                  </Box>
                </TableCell>
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
                        onClick={async () => {
                          for (const feild of fields) {
                            if (
                              feild.isRequired &&
                              (!Object.prototype.hasOwnProperty.call(
                                childValuseObj,
                                feild.fieldname
                              ) ||
                                childValuseObj[feild.fieldname]
                                  ?.toString()
                                  ?.trim() === "")
                            ) {
                              toast.error(
                                `Value for ${feild.yourlabel} is missing or empty.`
                              );
                              return;
                            }
                          }
                          try {
                            if (
                              sectionData.functionOnSubmit &&
                              sectionData.functionOnSubmit != null
                            ) {
                              // sectionData?.functionOnSubmit.split(";").forEach((e) => onSubmitFunctionCall(e, childValuseObj))
                              for (const fun of sectionData.functionOnSubmit
                                .trim()
                                .split(";") || []) {
                                let updatedData = await onSubmitFunctionCall(
                                  fun,
                                  newState,
                                  formControlData,
                                  childValuseObj,
                                  setChildValuseObj
                                );
                                if (updatedData?.alertShow == true) {
                                  // if (updatedData.type == "success") {
                                  //   toast.success(updatedData.message);

                                  // }
                                  // else {
                                  setParaText(updatedData.message);
                                  setIsError(true);
                                  setOpenModal((prev) => !prev);
                                  setTypeofModal("onCheck");
                                  // }
                                }
                                if (updatedData) {
                                  setChildValuseObj((prev) => {
                                    return { ...prev, ...updatedData?.values };
                                  });
                                  setNewState((prev) => {
                                    return {
                                      ...prev,
                                      ...updatedData?.newState,
                                    };
                                  });
                                  setSubmitNewState((prev) => {
                                    return {
                                      ...prev,
                                      ...updatedData?.newState,
                                    };
                                  });
                                }
                              }
                            }
                            // if (typeof onSubmitValidation[sectionData.functionOnSubmit]=="function") {
                            //   onSubmitValidation[sectionData.functionOnSubmit]({
                            //     ...childValuseObj})
                            // }
                          } catch (error) {
                            return toast.error(error.message);
                          }
                          setNewState((prev) => {
                            const newState = { ...prev };
                            // Assuming you have the index of the item you want to update
                            // For example, let's say the index is stored in childValuseObj.index
                            const idToUpdate = childValuseObj.indexValue;

                            newState[sectionData.tableName] = newState[
                              sectionData.tableName
                            ].map((record) => {
                              // Check if the record's id matches the idToUpdate
                              console.log(record.indexValue);
                              if (record.indexValue === idToUpdate) {
                                // Update the record
                                return childValuseObj;
                              }
                              return record;
                            });

                            return newState;
                          });

                          setSubmitNewState((prev) => {
                            const newState = { ...prev };
                            // Assuming you have the index of the item you want to update
                            // For example, let's say the index is stored in childValuseObj.index
                            const idToUpdate = childValuseObj.indexValue;

                            newState[sectionData.tableName] = newState[
                              sectionData.tableName
                            ].map((record) => {
                              // Check if the record's id matches the idToUpdate

                              if (record.indexValue === idToUpdate) {
                                // Update the record
                                return childValuseObj;
                              }
                              return record;
                            });

                            return newState;
                          });

                          setRenderedData(newState[sectionData.tableName]);
                          toggleRow();
                          copyFirstRowToAllRowsExceptContainer();
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
          if (groupedData[key]?.isHideGrid) return;
          return (
            <TableRow key={index} className={`${styles.pageBackground}`}>
              <TableCell style={{ padding: 0 }} colSpan={6}>
                <Collapse in={subChildComponent} timeout="auto" unmountOnExit>
                  <Box
                    sx={{ margin: 1 }}
                    className={`${styles.hideScrollbar} ${styles.thinScrollBar} ${styles.pageBackground}`}
                  >
                    <SubChildComponent
                      key={index}
                      subChild={groupedData[key]}
                      section={sectionData}
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
