"use client";
import React, { useState, useEffect } from "react";
import TableCell from "@mui/material/TableCell";
import LightTooltip from "@/components/Tooltip/customToolTip";
import Image from "next/image";
import Box from "@mui/material/Box";
import CustomeInputFields from "@/components/Inputs/formCreationCustomeInput";
import FormCreationGridInputFields from "@/components/Inputs/formCreationGridInputFields";
import TableRow from "@mui/material/TableRow";
import Collapse from "@mui/material/Collapse";
import IconButton from "@mui/material/IconButton";
import styles from "@/app/app.module.css";
import {
  childTableRowStyles,
  formChildTableRowStyles,
  gridSectionStyles,
} from "@/app/globalCss";
import {
  DeleteIcon2,
  copyDoc,
  refreshIcon,
  DeleteHover,
  CopyHover,
  saveIcon,
  PlayIcon1,
  PlayIcon2,
  PlayIcon3,
  PlayIcon4,
  revertHover,
  saveIconHover,
} from "@/assets";
import SubChildComponent from "@/app/(groupControl)/createFormControl/addEdit/SubChildComponent";
import PropTypes from "prop-types";
import HoverIcon from "@/components/HoveredIcons/HoverIcon";
import { ActionButton } from "@/components/ActionsButtons";
const icons = [PlayIcon1, PlayIcon2, PlayIcon3, PlayIcon4];

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
  setRenderedData: PropTypes.any,
  deleteChildRecord: PropTypes.any,
  isGridEdit: PropTypes.any,
  setCopyChildValueObj: PropTypes.any,
  containerWidth: PropTypes.any,
  filterData: PropTypes.any,
  editMode: PropTypes.any,
  tableBodyWidhth: PropTypes.string,
};
export default function RowComponent(props) {
  const {
    row,
    fields,
    subChild,
    childName,
    childIndex,
    sectionData,
    newState,
    setNewState,
    expandAll,
    setRenderedData,
    deleteChildRecord,
    isGridEdit,
    setCopyChildValueObj,
    containerWidth,
    filterData,
    editMode,
    tableBodyWidhth,
  } = props;
  const [childValuseObj, setChildValuseObj] = useState({ ...row });
  const [openChildEdit, setOpenChildEdit] = useState(false);
  const [subChildComponent, setSubChildComponent] = useState(
    expandAll ? true : false
  );
  const [subChildViewData, setSubChildViewData] = useState([]);
  const [childType, setChildType] = useState("");


  let groupedData = subChild?.reduce((result, obj) => {
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
    setChildType(key);
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

  useEffect(() => {
    if (expandAll && editMode) {
      // Object.keys(groupedData).forEach((key) => {
      //   if (!subChildViewData.includes(key)) {
      //     setSubChildViewData((prev) => [...prev, key]);
      //   }
      // });
    }
  }, [expandAll]);

  useEffect(() => {
    setChildValuseObj({ ...row });
  }, [row]);



  function convertDropDownValues(dropDownValues) {
    return dropDownValues.reduce((acc, currentValue) => {
      acc[currentValue.id] = currentValue.value;
      return acc;
    }, {});
  }
  function copyDocument(obj) {
    if (Object.keys(obj).length !== 0) {
      const tmpData = { ...newState };
      delete obj.id
      tmpData[sectionData.tableName].push({
        ...obj,
        indexValue: tmpData[sectionData.tableName].length,
      });
      setNewState(tmpData);
      setRenderedData(newState[sectionData.tableName]);
    }
  }
  const [hoveredIcon, setHoveredIcon] = useState(null);

  const stylesIconsHover = tableBodyWidhth === '0' ? { right: tableBodyWidhth + 'px', width: 'auto' } : { left: tableBodyWidhth + 'px', width: 'auto' };

  return (
    <React.Fragment>
      {!isGridEdit ? (
        <>
          <TableRow
            onDoubleClick={toggleRow}
            sx={{
              "& > *": { borderBottom: "unset" },
              ...formChildTableRowStyles,
            }}
            className={`${styles.tableCellHoverEffect} ${styles.hh} group relative`}
          >
            {fields
              .filter((elem) => elem.isGridView)
              .map((field, index) => (
                <TableCell
                  key={index}
                  sx={{
                    ...gridSectionStyles,
                    paddingLeft: index === 0 ? "28px" : "0px",
                  }}
                  align="left"
                >
                  <div className="relative">
                    <div className={childTableRowStyles}>
                      {Array.isArray(childValuseObj[field.fieldname])
                        ? convertDropDownValues(childValuseObj[field.fieldname])
                        : Array.isArray(row[`${field.fieldname}dropdown`]) && row[`${field.fieldname}dropdown`].length > 0 ? row[`${field.fieldname}dropdown`][0]?.label : row[field.fieldname]?.toString()}
                    </div>
                  </div>
                </TableCell>
              ))}

            <div className={`group-hover:visible flex flex-nowrap justify-end invisible absolute`} style={stylesIconsHover} >
              <LightTooltip title="Delete Record">
                <IconButton
                  aria-label="Delete"
                  className={styles.icon}
                  onClick={() => deleteChildRecord(childIndex)}
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
                  onClick={() => copyDocument(childValuseObj)}
                  onMouseEnter={() => setHoveredIcon("copy")}
                  onMouseLeave={() => setHoveredIcon(null)}
                >
                  <Image
                    src={hoveredIcon === "copy" ? CopyHover : copyDoc}
                    className="gridIcons2"
                    alt="Document Icon"
                    priority={false}
                  />
                </IconButton>
              </LightTooltip>
              {typeof groupedData === "object" && Object?.keys(groupedData).map((key, index) => {
                return (
                  <LightTooltip
                    key={index}
                    title={groupedData[key].sectionHeader}
                  >
                    <IconButton
                      aria-label="Edit"
                      className={styles.icon}
                      onClick={() => toggleSubChildRow(key)}
                    >
                      <Image
                        src={icons[index % icons.length]}
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
            className={`${styles.tableCellHoverEffect} ${styles.hh}  `}
            sx={{
              "& > *": { borderBottom: "unset" },
              // ...formChildTableRowStyles,
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
                  }}
                >
                  <Box className="flex gap-4">
                    {index === 0 ?
                      <>
                        <ActionButton deleteImagePath={DeleteIcon2} copyImagepath={copyDoc}
                          onDelete={() => deleteChildRecord(childIndex)}
                          onCopy={() => copyDocument(childValuseObj)}

                        />
                      </>

                      : <></>}

                    <FormCreationGridInputFields
                      fieldData={field}
                      indexValue={index}
                      onValuesChange={(e) => {
                        setChildValuseObj((prev) => {
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
                                if (item._id === childValuseObj._id) {
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
                      values={childValuseObj}
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

      {/* EDIT CHILD */}
      {openChildEdit && (
        <TableRow >
          <TableCell style={{ padding: 0 }} colSpan={6}>
            <Collapse in={openChildEdit} timeout="auto" unmountOnExit>
              <Box sx={{ width: `${containerWidth}px` }}>
                <div
                  className={`relative pl-[16px] py-[8px] flex justify-between `}
                >
                  {/* Custom Input Fields in the middle */}
                  <div className="">
                    <CustomeInputFields
                      inputFieldData={fields}
                      onValuesChange={(e) => {
                        setChildValuseObj((prev) => {
                          return { ...prev, ...e };
                        });
                      }}
                      values={childValuseObj}
                      filterData={filterData}
                      newState={newState}
                    />
                  </div>

                  {/* Icon Button on the right */}
                  <div
                    className={`md:ml-8 relative top-0 right-0 flex justify-end items-baseline`}
                  >
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
                        setNewState((prev) => {
                          const newState = { ...prev };
                          // Assuming you have the index of the item you want to update
                          // For example, let's say the index is stored in childValuseObj.index
                          const idToUpdate = childValuseObj.indexValue;
                          console.log("idToUpdate", idToUpdate);

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

                          console.log("newState", newState);
                          return newState;
                        });
                        // setNewState((prev) => {
                        //   const newStateValue = { ...prev };
                        //   //Update the record in the array
                        //   newStateValue[sectionData.tableName][childIndex] =
                        //     childValuseObj;
                        //   return newStateValue;
                        // });
                        toggleRow();
                      }}
                    />
                  </div>
                </div>
              </Box>
            </Collapse>
          </TableCell>
        </TableRow>
      )}

      {/* ADD & EDIT SUB CHILD */}
      {subChildComponent &&
        subChildViewData.map((key, index) => {
          return (
            <TableRow key={index} className={`${styles.pageBackground}`}>
              <TableCell style={{ padding: 0 }} colSpan={6}>
                <Collapse in={subChildComponent} timeout="auto" unmountOnExit>
                  <Box
                    sx={{ margin: 1, overflow: "auto" }}
                    className={`${styles.hideScrollbar} ${styles.thinScrollBar} ${styles.pageBackground}`}
                  >
                    <SubChildComponent
                      key={childIndex}
                      subChild={groupedData[key]}
                      row={row}
                      index={childIndex}
                      newState={newState}
                      setNewState={setNewState}
                      childName={childName}
                      childIndex={childIndex}
                      setSubChildComponent={setSubChildComponent}

                      childType={childType}
                      expandAll={expandAll}
                      filterData={filterData}
                      containerWidth={containerWidth}
                      deleteChildRecord={() => deleteChildRecord(childIndex)}
                      copyDocument={() => copyDocument(childValuseObj)}

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
