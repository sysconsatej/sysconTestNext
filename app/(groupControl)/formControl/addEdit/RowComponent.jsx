"use client";

/* eslint-disable */

import React, { useState, useEffect, useRef, useMemo } from "react";
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
import * as onGridClickFunctions from "@/helper/onGridClick";
import * as onGridSaveValidation from "@/helper/onGridSave";
import { ActionButton } from "@/components/ActionsButtons";
("");
import { useDispatch } from "react-redux";
import { updateFlag } from "@/app/counterSlice";
const icons = [PlayIcon1, PlayIcon2, PlayIcon3, PlayIcon4];
function isConfigFlagEnabled(value) {
  if (value === true || value === 1 || value === "1") return true;
  if (typeof value === "string") {
    const normalized = value.trim().toLowerCase();
    return ["true", "yes", "y", "t"].includes(normalized);
  }
  return false;
}
async function onSubmitFunctionCall(
  functionData,
  newState,
  formControlData,
  values,
  setStateVariable,
) {
  const funcNameMatch = functionData?.match(/^(\w+)/);
  const argsMatch = functionData?.match(/\((.*)\)/);
  console.log(functionData, "functionData");
  if (funcNameMatch && argsMatch !== null) {
    const funcName = funcNameMatch[1];
    const argsStr = argsMatch[1] || ""
    const func = onSubmitValidation?.[funcName];
    if (typeof func === "function") {
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
  if (funcNameMatch && argsMatch !== null) {
    const funcName = funcNameMatch[1];
    const argsStr = argsMatch[1] || "";
    const func = onGridSaveValidation?.[funcName];
    if (typeof func === "function") {
      let args;
      if (argsStr === "") {
        args = {}; // No arguments, so pass an empty object or as per the function's expected parameters
      } else {
        args = argsStr; // Has arguments, pass them as an object
      }
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

async function onGridClickFunctionCall(functionName, functionObject) {
  const name = String(functionName || "").trim();
  if (!name) return null;
  const functionToCall = onGridClickFunctions?.[name];
  if (typeof functionToCall !== "function") {
    throw new Error(
      `Grid click function "${name}" not found in onGridClick.js`,
    );
  }
  return await functionToCall(functionObject);
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
  copyChildValueObj: PropTypes.any,
  setCopyChildValueObj: PropTypes.any,
  isLastRow: PropTypes.bool,
  onGridLastTab: PropTypes.func,
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
  showSrNo: PropTypes.bool,
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
  copyChildValueObj,
  setCopyChildValueObj,
  isLastRow = false,
  onGridLastTab,
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
  showSrNo = false,
}) {

  const dispatch = useDispatch();
  const [childValuseObj, setChildValuseObj] = useState({ ...row });
  const [openChildEdit, setOpenChildEdit] = useState(false); // State to manage open/close of this particular row
  const [subChildViewData, setSubChildViewData] = useState([]);
  const [hoveredIcon, setHoveredIcon] = useState(null);
  const [indexValue, setIndexValue] = useState({ ...row });
  const latestGridRowsRef = useRef([]);
  const latestChildValuesRef = useRef({ ...row });
  const gridViewFields = useMemo(
    () =>
      (Array.isArray(fields) ? fields : []).filter(
        (field) => field?.isGridView,
      ),
    [fields],
  );

  // const [isChecked, setIsChecked] = useState(true);
  const [subChildComponent, setSubChildComponent] = useState(
    expandAll ? true : false,
  );
  const isChildDeleteHidden = isConfigFlagEnabled(sectionData?.isDeleteHide);
  const isChildCopyHidden = isConfigFlagEnabled(sectionData?.isAddHide);
  if (openChildEdit) {
    dispatch(
      updateFlag({
        flag: "selectedIndex",
        value: row.indexValue,
      }),
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
    if (isChildCopyHidden) return;
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
    const latestRow = { ...row };
    latestChildValuesRef.current = latestRow;
    setChildValuseObj(latestRow);
  }, [row]);
  useEffect(() => {
    const latestRows = Array.isArray(copyChildValueObj?.[childName])
      ? copyChildValueObj[childName]
      : Array.isArray(newState?.[childName])
        ? newState[childName]
        : [];
    latestGridRowsRef.current = latestRows;
  }, [copyChildValueObj, newState, childName]);

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
  const updateExpandedChildValues = (updatedValues = {}) => {
    const latestValues = {
      ...latestChildValuesRef.current,
      ...updatedValues,
    };
    latestChildValuesRef.current = latestValues;
    setChildValuseObj(latestValues);
    return latestValues;
  };
  function handleChangeFunction(result) {
    if (result?.isCheck === false) {
      if (result?.alertShow) {
        setParaText(result.message);
        setIsError(true);
        setOpenModal((previous) => !previous);
        setTypeofModal("onCheck");
      }
      return;
    }
    if (!result?.values) return;
    updateExpandedChildValues(result.values);
  }
  function handleBlurFunction(result) {
    if (result?.isCheck === false) {
      if (result?.alertShow) {
        setParaText(result.message);
        setIsError(true);
        setOpenModal((prev) => !prev);
        setTypeofModal("onCheck");
      }
      return;
    }
    updateExpandedChildValues(result?.values || {});
  }
 
  async function addChildRecordToInsert(obj, index, isChecked = true) {
    if (!obj || Object.keys(obj).length === 0) return;
    const tableName = sectionData?.tableName;
    if (!tableName) return;
    const configuredFunctions = String(sectionData?.functionOnClick || "")
      .split(";")
      .map((functionName) => functionName.trim())
      .filter(Boolean);
    if (configuredFunctions.length === 0) {
      if (!isChecked) {
      removeChildRecordFromInsert(obj.id, index);
        return;
      }
      setNewState((previous) => ({
        ...previous,
        [tableName]: previous[tableName].map((item, rowIndex) =>
          rowIndex === index
            ? {
              ...item,
              isChecked: true,
            }
            : item,
        ),
      }));
      setSubmitNewState((previous) => ({
        ...previous,
        [tableName]: (previous?.[tableName] || newState?.[tableName] || []).map(
          (item, rowIndex) =>
            rowIndex === index
              ? {
                ...item,
                isChecked: true,
              }
              : item,
        ),
      }));
      return;
    }
    try {
      const functionValues = await configuredFunctions.reduce(
        async (previousPromise, functionName) => {
          const previousValues = await previousPromise;
          const result = await onGridClickFunctionCall(functionName, {
            values: {
              ...obj,
              ...previousValues,
            },
            isChecked,
            newState,
          });
          if (result?.isCheck === false) {
            if (result?.alertShow) {
              setParaText(result.message);
              setIsError(true);
              setOpenModal((previous) => !previous);
              setTypeofModal("onCheck");
            }
            throw new Error("__VALIDATION_STOP__");
          }
          return {
            ...previousValues,
            ...(result?.values || {}),
          };
        },
        Promise.resolve({}),
      );
      setChildValuseObj((previous) => ({
        ...previous,
        ...functionValues,
        isChecked,
      }));
      setRenderedData((previous) =>
        (previous || []).map((item, rowIndex) =>
          rowIndex === index
            ? {
              ...item,
              ...functionValues,
              isChecked,
            }
            : item,
        ),
      );
      setNewState((previous) => ({
        ...previous,
        [tableName]: (previous?.[tableName] || []).map((item, rowIndex) =>
          rowIndex === index
            ? {
              ...item,
              ...functionValues,
              isChecked,
            }
            : item,
        ),
      }));
      setSubmitNewState((previous) => ({
        ...previous,
        [tableName]: (previous?.[tableName] || newState?.[tableName] || []).map(
          (item, rowIndex) =>
            rowIndex === index
              ? {
                ...item,
                ...functionValues,
                isChecked,
              }
              : item,
        ),
      }));
    } catch (error) {
      if (error?.message === "__VALIDATION_STOP__") return;
      toast.error(
        error?.message || "Error while executing grid checkbox function.",
      );
    }
  }
  const handleChange = async (event, currentRow, index) => {
    const checked = event.target.checked;
    setChildValuseObj((previous) => ({
      ...previous,
      isChecked: checked,
    }));
    const latestRowValues = {
      ...currentRow,
      ...childValuseObj,
      isChecked: checked,
    };
    await addChildRecordToInsert(latestRowValues, index, checked);
  };

  const isSameGridRow = (item, rowIndex) => {
    if (row?.id !== null && row?.id !== undefined && item?.id !== null && item?.id !== undefined) {
      return String(item.id) === String(row.id);
    }
    if (
      row?.indexValue !== null &&
      row?.indexValue !== undefined &&
      item?.indexValue !== null &&
      item?.indexValue !== undefined
    ) {
      return String(item.indexValue) === String(row.indexValue);
    }
    return rowIndex === childIndex;
  };
  const updateGridRows = (rows, updatedValues) => {
    const sourceRows = Array.isArray(rows) ? rows : [];
    return sourceRows.map((item, rowIndex) =>
      isSameGridRow(item, rowIndex)
        ? {
          ...item,
          ...updatedValues,
        }
        : item,
    );
  };

  const handleValuesChangeOfChildGrid = (updatedValues) => {

    const latestRowValues = {

      ...latestChildValuesRef.current,

      ...updatedValues,

    };



    latestChildValuesRef.current = latestRowValues;

    setChildValuseObj(latestRowValues);



    const currentRows = Array.isArray(latestGridRowsRef.current)

      ? latestGridRowsRef.current

      : Array.isArray(copyChildValueObj?.[childName])

        ? copyChildValueObj[childName]

        : Array.isArray(newState?.[childName])

          ? newState[childName]

          : [];



    const latestRows = updateGridRows(currentRows, latestRowValues);

    latestGridRowsRef.current = latestRows;



    const latestCopy = {

      ...(copyChildValueObj &&

        typeof copyChildValueObj === "object" &&

        !Array.isArray(copyChildValueObj)

        ? copyChildValueObj

        : {}),

      [childName]: latestRows,

    };



    if (typeof setCopyChildValueObj === "function") {

      setCopyChildValueObj((previous) => ({

        ...(previous &&

          typeof previous === "object" &&

          !Array.isArray(previous)

          ? previous

          : {}),

        [childName]: latestRows,

      }));

    }



    dispatch(

      updateFlag({

        flag: "childRecord",

        value: latestCopy,

      }),

    );

  };
  const handleLastGridTab = (event) => {
    if (event.key !== "Tab" || event.shiftKey || !isLastRow) return;
    const currentRow = event.currentTarget?.closest?.("tr");
    const target = event.target;
    if (!currentRow || !(target instanceof HTMLElement)) return;
    const focusableElements = Array.from(
      currentRow.querySelectorAll(
        'input:not([disabled]), select:not([disabled]), textarea:not([disabled]), button:not([disabled]), [tabindex]:not([tabindex="-1"]), [contenteditable="true"], [role="combobox"]',

      ),

    ).filter((element) => {
      if (!(element instanceof HTMLElement)) return false;
      const style = window.getComputedStyle(element);
      return style.display !== "none" && style.visibility !== "hidden";
    });
    const lastFocusableElement = focusableElements.at(-1);
    if (
      !lastFocusableElement ||
      !(
        lastFocusableElement === target ||
        lastFocusableElement.contains(target) ||
        target.contains(lastFocusableElement)
      )
    ) {
      return;
    }

    setTimeout(() => {
      if (typeof onGridLastTab === "function") {
        onGridLastTab(latestGridRowsRef.current);
      }
    }, 0);
  };

  const saveExistingChildRow = async () => {
    const tableName = sectionData?.tableName;
    if (!tableName) return;
    let valuesToSave = {
      ...row,
      ...childValuseObj,
      ...latestChildValuesRef.current,
    };

    for (const field of Array.isArray(fields) ? fields : []) {
      const fieldValue = valuesToSave?.[field?.fieldname];
      const isEmptyValue =
        fieldValue === null ||
        fieldValue === undefined ||
        String(fieldValue).trim() === "";

      if (field?.isRequired && isEmptyValue) {
        toast.error(`Value for ${field.yourlabel} is missing or empty.`);
        return;
      }
    }
    let updatedNewStateValues = {};
    let updatedSubmitStateValues = {};

    try {
      const configuredFunctions = String(
        sectionData?.functionOnGridSave || "",
      )
        .split(";")
        .map((functionName) => functionName.trim())
        .filter(Boolean);

      for (const functionName of configuredFunctions) {
        const functionInputState = {
          ...newState,
          ...updatedNewStateValues,
        };

        const updatedData = await onGridSaveFunctionCall(
          functionName,
          functionInputState,
          formControlData,
          valuesToSave,
          setChildValuseObj,
          {
            ...submitNewState,
            ...updatedSubmitStateValues,
          },
          setSubmitNewState,
        );

        if (updatedData?.alertShow === true) {
          setParaText(updatedData.message);
          setIsError(true);
          setOpenModal((previous) => !previous);
          setTypeofModal("onCheck");
        }

        if (updatedData?.isCheck === false) return;

        if (updatedData?.values) {
          valuesToSave = {
            ...valuesToSave,
            ...updatedData.values,
          };
        }

        if (updatedData?.newState) {
          updatedNewStateValues = {
            ...updatedNewStateValues,
            ...updatedData.newState,
          };
        }

        if (updatedData?.submitNewState) {
          updatedSubmitStateValues = {
            ...updatedSubmitStateValues,
            ...updatedData.submitNewState,
          };
        }
      }
    } catch (error) {
      toast.error(error?.message || "Unable to save child row.");
      return;
    }

    latestChildValuesRef.current = valuesToSave;
    setChildValuseObj(valuesToSave);
    setNewState((previous) => {
      const mergedState = {
        ...previous,
        ...updatedNewStateValues,
      };
      const functionRows = Array.isArray(
        updatedNewStateValues?.[tableName],
      )
        ? updatedNewStateValues[tableName]
        : Array.isArray(mergedState?.[tableName])
          ? mergedState[tableName]
          : [];

      return {
        ...mergedState,
        [tableName]: updateGridRows(functionRows, valuesToSave),
      };
    });

    setSubmitNewState((previous) => {
      const mergedState = {
        ...previous,
        ...updatedNewStateValues,
        ...updatedSubmitStateValues,
      };

      const functionRows = Array.isArray(
        updatedSubmitStateValues?.[tableName],
      )
        ? updatedSubmitStateValues[tableName]
        : Array.isArray(updatedNewStateValues?.[tableName])
          ? updatedNewStateValues[tableName]
          : Array.isArray(mergedState?.[tableName])
            ? mergedState[tableName]
            : [];

      return {
        ...mergedState,
        [tableName]: updateGridRows(functionRows, valuesToSave),
      };
    });

    const renderedBaseRows = Array.isArray(
      updatedNewStateValues?.[tableName],
    )
      ? updatedNewStateValues[tableName]
      : Array.isArray(updatedSubmitStateValues?.[tableName])
        ? updatedSubmitStateValues[tableName]
        : Array.isArray(newState?.[tableName])
          ? newState[tableName]
          : [];

    const finalRenderedRows = updateGridRows(
      renderedBaseRows,
      valuesToSave,
    );

    latestGridRowsRef.current = finalRenderedRows;
    setRenderedData(finalRenderedRows);

    if (typeof setCopyChildValueObj === "function") {
      setCopyChildValueObj((previous) => ({
        ...(previous &&
          typeof previous === "object" &&
          !Array.isArray(previous)
          ? previous
          : {}),
        [tableName]: finalRenderedRows,
      }));
    }

    dispatch(
      updateFlag({
        flag: "childRecord",
        value: {
          [tableName]: finalRenderedRows,
        },
      }),
    );

    toggleRow();

    setTimeout(() => {
      copyFirstRowToAllRowsExceptContainer();
    }, 0);
  };

  const reCalculate = (childIndex, tableName) => {
    if (tableName !== "tblRateRequestQty") return;
    if (!newState || !Array.isArray(newState[tableName])) return;
    const filteredRows = newState[tableName].filter(
      (_, index) => index !== childIndex,
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
    [],

  );
  // ✅ SAME NAME (updated behavior: only changed field(s) copied)
  const copyFirstRowToAllRowsExceptContainer = () => {
    const rows = newState?.tblContainerTransactionDetails;
    if (!Array.isArray(rows) || rows.length < 2) return;
    const firstRow = rows[0] || {};
    const patch = {};
    Object.keys(firstRow).forEach((k) => {

      if (!PROTECT_KEYS.has(k)) patch[k] = firstRow[k];
    });
    const currentPatchStr = stableSignature(patch);
    if (!didInitCopyRef.current) {
      didInitCopyRef.current = true;
      prevFirstRowRef.current = currentPatchStr;
      return;
    }
    const prevPatchStr = prevFirstRowRef.current || "";
    if (prevPatchStr === currentPatchStr) return; // no changes
    let prevPatchObj = {};
    try {
      prevPatchObj = prevPatchStr ? JSON.parse(prevPatchStr) : {};
    } catch {
      prevPatchObj = {};
    }

    const changedKeys = [];
    const allKeys = new Set([
      ...Object.keys(prevPatchObj),
      ...Object.keys(patch),
    ]);
    allKeys.forEach((k) => {
      if (PROTECT_KEYS.has(k)) return;
      const a = stableSignature({ v: prevPatchObj[k] });
      const b = stableSignature({ v: patch[k] });
      if (a !== b) changedKeys.push(k);
    });
    prevFirstRowRef.current = currentPatchStr;
    if (changedKeys.length === 0) return;
    const updatedRows = rows.map((r, i) => {
      if (i === 0 || !r) return r;
      const overrides = rowOverridesRef.current?.[i]; // Set(keys) or undefined
      const safePatch = {};
      changedKeys.forEach((k) => {
        if (!overrides || !overrides.has(k)) safePatch[k] = patch[k];
      });
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

      })(),

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
                                checked={Boolean(
                                  childValuseObj?.isChecked ?? row?.isChecked,
                                )}
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
                        style={{
                          maxWidth: "200px",
                        }}
                      >
                        <LightTooltip
                          title={
                            field.controlname === "dropdown" ||
                              field.controlname === "multiselect"
                              ? row[`${field.fieldname}dropdown`]?.[0]?.label ||
                              row[`${field.fieldname}Dropdown`] ||
                              ""
                              : isDateFormat(row[`${field.fieldname}`]) || ""
                          }
                          arrow
                        >
                          <span>
                            {field.controlname === "dropdown" ||
                              field.controlname === "multiselect"
                              ? (
                                row[`${field.fieldname}dropdown`]?.[0]
                                  ?.label || row[`${field.fieldname}Dropdown`]
                              )?.length > 50
                                ? (
                                  row[`${field.fieldname}dropdown`]?.[0]
                                    ?.label ||
                                  row[`${field.fieldname}Dropdown`]
                                )?.slice(0, 50) + "..."
                                : row[`${field.fieldname}dropdown`]?.[0]
                                  ?.label ||
                                row[`${field.fieldname}Dropdown`] ||
                                ""
                              : isDateFormat(row[`${field.fieldname}`]) || ""}
                          </span>
                        </LightTooltip>
                      </div>
                      {!showSrNo && index == 0 && (
                        <div className={` ${styles.iconContainer}`}>
                          <div className="absolute left-[-7px] top-[-2px] cursor-pointer">
                            <Checkbox
                              edge="start"
                              sx={{
                                ...checkBoxStyle,
                              }}
                              checked={Boolean(
                                childValuseObj?.isChecked ?? row?.isChecked,
                              )}
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
              className={`group-hover:visible flex flex-nowrap justify-end invisible absolute`}
              style={stylesIconsHover}
              id="hoverBtn"
            >
              {!isChildDeleteHidden && (
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
            {gridViewFields.map((field, index) => (
              <React.Fragment key={index}>
                <TableCell
                  align="left"
                  sx={{
                    padding: "0 ",
                    lineHeight: "0",
                    fontSize: "12px",
                    position: "relative",
                  }}
                >
                  <Box
                    className="flex gap-4"
                    onKeyDownCapture={(event) =>
                      handleLastGridTab(event)
                    }
                  >
                    {childName != "tblVoucherLedgerDetails" && index === 0 ? (
                      <ActionButton
                        onDelete={() => deleteChildRecord(childIndex)}
                        key={index}
                        onCopy={() => copyDocument(childValuseObj)}
                        hover={hoveredIcon}
                        copyImagepath={copyDoc}
                        deleteImagePath={DeleteIcon2}
                        showDelete={!isChildDeleteHidden}
                        showCopy={!isChildCopyHidden}
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
                    onValuesChange={(updatedValues) => {
                      updateExpandedChildValues(updatedValues);
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
                    callSaveFunctionOnLastTab={saveExistingChildRow}
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
                        onClick={saveExistingChildRow}
                      />
                    </div>
                  )}
                </div>
              </Box>
            </Collapse>
          </TableCell>
        </TableRow>
      )}
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