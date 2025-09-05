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
import * as onSubmitValidation  from "@/helper/onSubmitFunction";
function onSubmitFunctionCall(
  functionData,
 data
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
        onSubmitValidation?.[funcName]({
          ...data})
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
    // if (Object.keys(obj).length !== 0) {
    //   const tmpData = { ...submitNewState };
    //   tmpData[childName][childIndex][subChild.tableName].push(obj);
    //   setSubmitNewState(tmpData);
    // }
    if (Object.keys(obj).length !== 0) {
      setSubmitNewState((prevState) => {
        const newStateCopy = { ...newState, ...prevState };
        // Assume each entry in the array has an 'id' property
        let updatedData = newStateCopy[childName][childIndex][
          subChild.tableName
        ].filter((_, idx) => idx === index);
        updatedData = { ...updatedData[0], isChecked: true };
        newStateCopy[childName][childIndex][subChild.tableName][index] =
          updatedData;
        return newStateCopy;
      });
      setNewState((prevState) => {
        const newStateCopy = { ...newState, ...prevState };
        // Assume each entry in the array has an 'id' property
        let updatedData = newStateCopy[childName][childIndex][
          subChild.tableName
        ].filter((_, idx) => idx === index);
        updatedData = { ...updatedData[0], isChecked: true };
        newStateCopy[childName][childIndex][subChild.tableName][index] =
          updatedData;
        return newStateCopy;
      });
    }
  }

  const handleChange = (event, row, index) => {
    if (event.target.checked === false) {
      removeSubChildRecordFromInsert(row._id);
    } else {
      addChildRecordToInsert(row, index);
    }
    // setIsChecked(event.target.checked);
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
              !isView ? `${styles.tableCellHoverEffect} ${styles.hh}   ` : ""
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
              !isView ? `${styles.tableCellHoverEffect} ${styles.hh}  ` : ""
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
                        title={"Save"}
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
                              subChild?.functionOnSubmit.split(";").forEach((e) => onSubmitFunctionCall(e, editSubChildObj))
                            // onSubmitValidation?.[subChild.functionOnSubmit]({
                            //   ...editSubChildObj})
                            }
                          } catch (error) {
                           return toast.error(error.message);
                          }

                          setNewState((prev) => {
                            const newState = { ...prev };
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
                            const newState = { ...prev };
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
