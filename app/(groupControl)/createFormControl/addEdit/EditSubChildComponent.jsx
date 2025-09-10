"use client";
import React, { useState, useRef, useEffect } from "react";
import Image from "next/image";
import styles from "@/app/app.module.css";
import CustomeInputFields from "@/components/Inputs/formCreationCustomeInput";
import IconButton from "@mui/material/IconButton";
import CloseOutlinedIcon from '@mui/icons-material/CloseOutlined';
import Box from "@mui/material/Box";
import Collapse from "@mui/material/Collapse";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import HoverIcon from "@/components/HoveredIcons/HoverIcon";
import Paper from "@mui/material/Paper";

import {
  DeleteIcon2,
  refreshIcon,
  saveIcon,
  PlayIcon1,
  copyDoc,
  CopyHover,
  DeleteHover,
  revertHover,
  saveIconHover,
  addLogo,
  plusIconHover,
} from "@/assets";
import LightTooltip from "@/components/Tooltip/customToolTip";
import { hasBlackValues } from "@/helper/checkValue";
import PropTypes from "prop-types";
import InputBase from "@mui/material/InputBase";
import Divider from "@mui/material/Divider";
import SearchIcon from "@mui/icons-material/Search";
import ClearIcon from "@mui/icons-material/Clear";
import { toast } from "react-toastify";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";
import {
  createAddEditPaperStyles,
  childTableRowStyles,
  searchInputStyling,
  childTableHeaderStyle,
  gridSubChildIconStyles,
  formChildTableRowStyles,
  gridSectionStyles,
} from "@/app/globalCss";
import FormCreationGridInputFields from "@/components/Inputs/formCreationGridInputFields";
import EditNoteRoundedIcon from "@mui/icons-material/EditNoteRounded";
import SaveOutlinedIcon from "@mui/icons-material/SaveOutlined";

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

EditSubChildComponent.propTypes = {
  subChildObject: PropTypes.any,
  subChildIndex: PropTypes.any,
  setNewState: PropTypes.any,
  newState: PropTypes.any,
  subChild: PropTypes.any,
  index: PropTypes.any,
  childName: PropTypes.any,
  childIndex: PropTypes.any,
  row: PropTypes.any,
  childType: PropTypes.any,
  expandAll: PropTypes.any,
  deleteSubChildRecord: PropTypes.any,
  setRenderedData: PropTypes.any,
  isGridEdit: PropTypes.any,
  setCopyChildValueObj: PropTypes.any,
  filterData: PropTypes.any,
  containerWidth: PropTypes.any,
};

export default function EditSubChildComponent({
  subChildObject,
  subChildIndex,
  setNewState,
  newState,
  subChild,
  index,
  childName,
  childIndex,
  row,
  childType,
  expandAll,
  deleteSubChildRecord,
  setRenderedData,
  isGridEdit,
  setCopyChildValueObj,
  filterData,
  containerWidth,
}) {
  const [editSubChildObj, setEditSubChildObj] = useState({ ...subChildObject });
  const [openSubChildEdit, setOpenSubChildEdit] = useState(false);
  const [subChildComponent, setSubChildComponent] = useState(false);
  const [fourthChildIndex, setFourthChildIndex] = useState();

  const toggleSubChildEdit = () => {
    setOpenSubChildEdit((prev) => !prev);
  };

  const toggleSubChildRow = (key, index) => {
    setFourthChildIndex(index);
    setSubChildComponent((prev) => !prev);
  };

  function copyDocument(obj) {
    if (Object.keys(obj).length !== 0) {
      const tmpData = { ...newState };
      tmpData[childName][childIndex][subChild.tableName].push({
        ...obj,
        indexValue: tmpData[childName][childIndex][subChild.tableName].length,
      });
      console.log("tmpData", tmpData);
      setNewState(tmpData);
      setRenderedData(newState[childName][childIndex][subChild.tableName]);
    }
  }

  useEffect(() => {
    setEditSubChildObj({ ...subChildObject });
  }, [subChildObject]);

  return (
    // child grid data
    <React.Fragment>
      {!isGridEdit ? (
        <>
          <TableRow
            onDoubleClick={() => {
              toggleSubChildEdit();
            }}
            key={index}
            sx={{
              "& > *": { borderBottom: "unset" },
              ...formChildTableRowStyles,
            }}
            className={` ${styles.hh} ${styles.tableCellHoverEffect}`}
          >
            {subChild.fields
              .filter((elem) => elem.isGridView)
              .map((field, subIndex) => (
                <TableCell
                  key={subIndex}
                  sx={{
                    ...gridSectionStyles,
                    paddingLeft: subIndex === 0 ? "28px" : "0px",
                  }}
                >
                  <div className="relative">
                    <div className={childTableRowStyles}>
                      {subChildObject[field.fieldname]?.toString()}
                    </div>
                    {subIndex == 0 && (
                      <div className={` ${styles.iconContainer121}`}>
                        <HoverIcon
                          defaultIcon={DeleteIcon2}
                          hoverIcon={DeleteHover}
                          onClick={() => deleteSubChildRecord(index)}
                          title={"Delete Record"}
                        />
                        <HoverIcon
                          defaultIcon={copyDoc}
                          hoverIcon={CopyHover}
                          onClick={() => copyDocument(editSubChildObj)}
                          title={"Copy Document"}
                        />
                        {childType !== "fields" &&
                          subChild["4thchild"] !== undefined && (
                            <LightTooltip
                              key={subIndex}
                              title={"Field details"}
                            >
                              <IconButton
                                aria-label="Field details"
                                className={styles.icon}
                                onClick={() =>
                                  // toggleSubChildRow(field, subIndex)
                                  toggleSubChildRow(field, subChildIndex)
                                }
                              >
                                <Image
                                  src={PlayIcon1}
                                  alt="Add Icon"
                                  priority={false}
                                  className="gridIcons2"
                                />
                              </IconButton>
                            </LightTooltip>
                          )}
                      </div>
                    )}
                  </div>
                </TableCell>
              ))}
          </TableRow>
        </>
      ) : (
        <>
          <TableRow
            className={`${styles.tableCellHoverEffect} ${styles.hh}  `}
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
                  <FormCreationGridInputFields
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
                    onChangeHandler={(e) => {
                      console.log("onchangeHandler", e);
                    }}
                    onBlurHandler={(e) => {
                      console.log("onBlurHandler", e);
                    }}
                  />
                </TableCell>
              ))}
          </TableRow>
        </>
      )}

      {/* Edit Sub Child */}
      {openSubChildEdit && (
        <TableRow key={subChildObject._id} on>
          <TableCell style={{ padding: 0 }} colSpan={6}>
            <Collapse in={openSubChildEdit} timeout="auto" unmountOnExit>
              <Box sx={{ margin: 1, width: `${containerWidth - 20}px` }}>
                <div className="relative flex justify-between ">
                  {/* Custom Input Fields in the middle */}
                  <CustomeInputFields
                    inputFieldData={subChild?.fields}
                    onValuesChange={(e) => {
                      setEditSubChildObj((prev) => {
                        return { ...prev, ...e };
                      });
                    }}
                    values={editSubChildObj}
                    filterData={filterData}
                    newState={newState}
                  />

                  {/* Icon Button on the right */}
                  <div
                    className={`md:ml-8 relative top-0 right-2 flex justify-end items-baseline`}
                  >
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
                        setNewState((prev) => {
                          const newState = { ...prev };
                          // Assuming you have the index of the item you want to update
                          // For example, let's say the index is stored in childValuseObj.index
                          const idToUpdate = editSubChildObj.indexValue;

                          newState[childName][childIndex][subChild.tableName] =
                            newState[childName][childIndex][
                              subChild.tableName
                            ].map((record) => {
                              // Check if the record's id matches the idToUpdate
                              if (record.indexValue === idToUpdate) {
                                // Update the record
                                return editSubChildObj;
                              }
                              return record;
                            });

                          return newState;
                        });

                        // setNewState((prev) => {
                        //   const newStateValue = { ...prev };
                        //   //Update the record in the array
                        //   newStateValue[childName][childIndex][
                        //     subChild.tableName
                        //   ][index] = editSubChildObj;
                        //   return newStateValue;
                        // });
                        toggleSubChildEdit();
                      }}
                    />
                  </div>
                </div>
              </Box>
            </Collapse>
          </TableCell>
        </TableRow>
      )}

      {/* ADD & EDIT SUB 4 LEVEL CHILD DATA */}
      {subChildComponent && subChild["4thchild"].length > 0 && (
        <TableRow>
          <TableCell style={{ padding: 0 }} colSpan={4}>
            <Collapse in={subChildComponent} timeout="auto" unmountOnExit>
              <Box sx={{ margin: 1 }}>
                <AddSubChildData
                  key={index}
                  subChild={subChild}
                  row={row}
                  index={index}
                  newState={newState}
                  setNewState={setNewState}
                  childName={childName}
                  childIndex={childIndex}
                  fourthChildIndex={fourthChildIndex}
                  setSubChildComponent={setSubChildComponent}
                  expandAll={expandAll}
                  childType={childType}
                  subChildComponent={subChildComponent}
                  filterData={filterData}
                />
              </Box>
            </Collapse>
          </TableCell>
        </TableRow>
      )}
    </React.Fragment>
  );
}

AddSubChildData.propTypes = {
  subChild: PropTypes.any,
  row: PropTypes.any,
  index: PropTypes.any,
  newState: PropTypes.any,
  setNewState: PropTypes.any,
  childName: PropTypes.any,
  childIndex: PropTypes.any,
  fourthChildIndex: PropTypes.any,
  setSubChildComponent: PropTypes.any,
  expandAll: PropTypes.any,
  childType: PropTypes.any,
  subChildComponent: PropTypes.any,
  filterData: PropTypes.any,
};
function AddSubChildData(props) {
  const {
    subChild,
    index,
    newState,
    setNewState,
    childName,
    childIndex,
    fourthChildIndex,
    setSubChildComponent,
    expandAll,
    childType,
    filterData,
  } = props;
  // const [hideSubChildInputs, setHideSubChildInputs] = useState(
  //   expandAll
  //     ? subChild["4thchild"]?.[0].fields &&
  //       subChild["4thchild"]?.[0].fields?.length === 0
  //       ? false
  //       : true
  //     : false
  // );
  const [hideSubChildInputs, setHideSubChildInputs] = useState(false);
  const [subChildObject, setSubChildObject] = useState({});
  const [editFourthSubChildObj, setEditFourthSubChildObj] = useState({});
  const [renderedData, setRenderedData] = useState([]);
  const tableRef = useRef(null);
  const [isInputVisible, setInputVisible] = useState(false);
  const [activeColumn, setActiveColumn] = useState(null);
  const [prevSearchInput, setPrevSearchInput] = useState("");
  const [isAscending, setIsAscending] = useState(true);
  const [sortedColumn, setSortedColumn] = useState(null);
  const [dummyData, setDummyData] = useState([]);
  const [isGridEdit, setIsGridEdit] = useState(false);
  const [copyChildValueObj, setCopyChildValueObj] = useState([]);

  function handleControlDefaultValue() {
    let tempnewState = [];
    subChild["4thchild"]?.[0].fields.forEach((element) => {
      tempnewState = {
        ...tempnewState,
        [element.fieldname]: element.controlDefaultValue,
      };

      if (element.controlname.toLowerCase() === "radio") {
        if (element.controlDefaultValue != null) {
          tempnewState = {
            ...tempnewState,
            [element.fieldname]: element.controlDefaultValue,
          };
        }
      }

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
            [element.fieldname]: element.controlDefaultValue[0].value || "",
          };
        }
      }
      if (element.controlname.toLowerCase() === "multiselect") {
        if (element.controlDefaultValue != null) {
          tempnewState = {
            ...tempnewState,
            [`${element.fieldname}multiselect`]: element.controlDefaultValue,
            [element.fieldname]: element.controlDefaultValue[0].value || "",
          };
        }
      }
    });

    setSubChildObject((prev) => {
      return { ...prev, ...tempnewState };
    });
  }

  const handleFieldSubChildrenValuesChange = (updatedValues) => {
    setSubChildObject((prev) => ({ ...prev, ...updatedValues }));
  };

  const toggleFourthSubChildEdit = (data) => {
    setEditFourthSubChildObj({ ...data });
  };

  const subChildButtonDataHandler = (subChildObject) => {
    if (
      Object.keys(subChildObject).length === 0 ||
      hasBlackValues(subChildObject)
    ) {
      return;
    }

    setNewState((pre) => {
      const updatedSubChild = [...pre[childName][childIndex]["subChild"]];
      console.log(
        "updatedSubChild[fourthChildIndex]",
        fourthChildIndex,
        updatedSubChild[fourthChildIndex]
      );
      if (Array.isArray(updatedSubChild[fourthChildIndex]["fields"])) {
        updatedSubChild[fourthChildIndex]["fields"].push({
          ...subChildObject,
          indexValue: fourthChildIndex,
        });
      } else {
        updatedSubChild[fourthChildIndex]["fields"] = [
          { ...subChildObject, indexValue: fourthChildIndex },
        ];
      }
      console.log("updatedSubChild", updatedSubChild);

      return {
        ...pre,
        [childName]: [
          ...pre[childName].slice(0, childIndex),
          {
            ...pre[childName][childIndex],
            subChild: updatedSubChild,
          },
          ...pre[childName].slice(childIndex + 1),
        ],
      };
    });
    setSubChildObject({});
    hideSubChildInputComponent();
  };
  // console.log("newState", newState);

  const closeSubChildComponent = () => {
    setSubChildComponent((prev) => !prev);
  };

  const hideSubChildInputComponent = () => {
    setHideSubChildInputs((prev) => !prev);
  };

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

  const renderMoreData = () => {
    const lastIndex = renderedData.length + 10;
    const newData = newState.child[0].subChild[index].fields?.slice(
      renderedData.length,
      lastIndex
    );
    setRenderedData((prevData) => [...prevData, ...newData]);
    setDummyData((prevData) => [...prevData, ...newData]);
  };

  useEffect(() => {
    setRenderedData(newState.child[0].subChild[index].fields?.slice(0, 10));
    setDummyData(newState.child[0].subChild[index].fields?.slice(0, 10));
  }, [newState]);

  useEffect(() => {
    handleControlDefaultValue();
  }, []);

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
    controlerName: PropTypes.string,
  };
  function CustomizedInputBase({
    columnData,
    setPrevSearchInput,
    prevSearchInput,
    // controlerName,
  }) {
    const inputRef = useRef(null); // Ref to the Paper component
    const [searchInput, setSearchInput] = useState(prevSearchInput || "");

    // Custom filter logic
    const filterFunction = (searchValue, columnKey) => {
      if (!searchValue.trim()) {
        setInputVisible(false);
        // return setNewState(originalData);
        return setRenderedData(dummyData);
      }
      const lowercasedInput = searchValue.toLowerCase();

      const filtered = newState[childName][childIndex].subChild[
        index
      ].fields.filter((item) => {
        // Access the item's property based on columnKey and convert to string for comparison
        const columnValue = String(item[columnKey]).toLowerCase();
        return columnValue.includes(lowercasedInput);
      });
      if (filtered.length === 0) {
        toast.error("No matching records found.");
        return;
      }
      setInputVisible(false);
      setRenderedData(filtered);
      setPrevSearchInput(searchValue);
    };

    function handleClose() {
      setSearchInput("");
      setPrevSearchInput("");
    }

    // Click outside handler
    useEffect(() => {
      const handleClickOutside = (event) => {
        if (inputRef.current && !inputRef.current.contains(event.target)) {
          setInputVisible(!isInputVisible);
        }
      };
      // Bind the event listener
      document.addEventListener("mousedown", handleClickOutside);
      return () => {
        // Unbind the event listener on clean up
        document.removeEventListener("mousedown", handleClickOutside);
      };
    }, [inputRef]);

    return (
      <Paper
        ref={inputRef}
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
      sortJSON(
        newState.child[0].subChild[index].fields,
        columnId,
        isAscending ? "asc" : "desc"
      );
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
      newCopy[tableName].push(
        newState[childName][childIndex]?.["subChild"]?.[fourthChildIndex]?.[
        tableName
        ]
      );
      // Return the modified copy
      return newCopy;
    });
    // Toggle the isGridEdit state
    setIsGridEdit((prevState) => !prevState);
  }

  function gridEditSaveFunction(tableName) {
    setNewState((prev) => {
      // Compute the new state
      const updatedState = { ...prev };
      updatedState[childName][childIndex]["subChild"][fourthChildIndex][
        tableName
      ] = copyChildValueObj[tableName]?.[0];
      // Return the updated state
      return updatedState;
    });
    setIsGridEdit(!isGridEdit);
    setCopyChildValueObj([]);
  }
  function gridEditCloseFunction() {
    setCopyChildValueObj([]);
    setIsGridEdit(!isGridEdit);
  }

  return (
    <>
      <div key={index} className="">
        {!hideSubChildInputs && (
          <div className="relative my-3 flex justify-between w-[calc(100vw-140px)] ">
            <CustomeInputFields
              key={index}
              inputFieldData={subChild["4thchild"]?.[0].fields}
              values={subChildObject}
              onValuesChange={handleFieldSubChildrenValuesChange}
              filterData={filterData}
              newState={newState}
            />
            <div className="md:ml-20 relative top-0 right-2 flex justify-end items-baseline">
              <>
                <HoverIcon
                  defaultIcon={refreshIcon}
                  hoverIcon={revertHover}
                  altText={"Revert"}
                  title={"Revert"}
                  onClick={() => {
                    closeSubChildComponent();
                  }}
                />
                <HoverIcon
                  defaultIcon={saveIcon}
                  hoverIcon={saveIconHover}
                  altText={"Save"}
                  title={"Save"}
                  onClick={() => {
                    subChildButtonDataHandler(subChildObject, subChild);
                  }}
                />
              </>
            </div>
          </div>
        )}

        {renderedData && renderedData?.length > 0 && childType !== "fields" && (
          <div className={`${styles.pageBackground}`}>
            <TableContainer
              component={Paper}
              ref={tableRef}
              onScroll={handleScroll}
              className={`${styles.hideScrollbar} ${styles.thinScrollBar} ${styles.pageBackground}`}
              sx={{
                height:
                  newState.child[0].subChild[index]?.fields.length > 10
                    ? "290px"
                    : "auto",
                overflowY:
                  newState.child[0].subChild[index]?.fields.length > 10
                    ? "auto"
                    : "hidden",
              }}
            >
              <Table
                aria-label="sticky table"
                stickyHeader
                sx={{ overflowY: "auto" }}
              >
                <TableHead>
                  <TableRow>
                    {subChild?.["4thchild"]?.[0].fields
                      .filter((elem) => elem.isGridView)
                      .map((item, index) => (
                        <TableCell
                          key={index}
                          className={`cursor-pointer `}
                          sx={{
                            ...childTableHeaderStyle,
                          }}
                          onContextMenu={(event) =>
                            handleRightClick(event, item.fieldname)
                          } // Add the right-click handler here
                        >
                          {index === 0 && hideSubChildInputs && (
                           
                            <HoverIcon
                              defaultIcon={addLogo}
                              hoverIcon={plusIconHover}
                              altText={"Add"}
                              title={"Add"}
                              onClick={() => {
                                hideSubChildInputComponent()
                              }}
                            />
                          )}
                          <span
                            className={`${styles.labelText}`}
                            onClick={() => handleSortBy(item.fieldname)}
                          >
                            {item.yourlabel}
                          </span>

                          {renderedData?.length > 0 && index === 0 && (
                            <>
                              <LightTooltip title="Edit Grid">
                                <EditNoteRoundedIcon
                                  sx={{
                                    ...gridSubChildIconStyles,
                                  }}
                                  onClick={() => {
                                    gridEditHandle(
                                      subChild?.["4thchild"]?.[0]?.tableName
                                    );
                                  }}
                                />
                              </LightTooltip>
                              {isGridEdit && (
                                <LightTooltip title="Save">
                                  <SaveOutlinedIcon
                                    sx={{
                                      ...gridSubChildIconStyles,
                                    }}
                                    onClick={() => {
                                      gridEditSaveFunction(
                                        subChild?.["4thchild"]?.[0]?.tableName
                                      );
                                    }}
                                    
                                  />
                                </LightTooltip>
                              )}
                              {isGridEdit && (
                <LightTooltip title="Cancel">
                  <CloseOutlinedIcon
                    sx={{
                      marginLeft: "8px",
                      ...gridSubChildIconStyles,
                    }}
                    onClick={() => {
                      gridEditCloseFunction(subChild.tableName);
                    }}
                  />
                </LightTooltip>
              )}
                            </>
                          )}
                          <span>
                            {isInputVisible &&
                              activeColumn === item.fieldname && ( // Conditionally render the input
                                <CustomizedInputBase
                                  columnData={item}
                                  setPrevSearchInput={setPrevSearchInput}
                                  prevSearchInput={prevSearchInput}
                                  controlerName={item.controlname}
                                />
                              )}
                          </span>
                          <span className="ml-1">
                            {renderSortIcon(item.fieldname)}
                          </span>
                        </TableCell>
                      ))}
                  </TableRow>
                </TableHead>

                <TableBody>
                  {renderedData?.map((item, itemIndex) => (
                    <EditComponent
                      key={itemIndex}
                      toggleFourthSubChildEdit={toggleFourthSubChildEdit}
                      editFourthSubChildObj={editFourthSubChildObj}
                      setEditFourthSubChildObj={setEditFourthSubChildObj}
                      childName={childName}
                      childIndex={childIndex}
                      subChild={subChild}
                      index={itemIndex}
                      subChildIndex={index}
                      item={item}
                      setNewState={setNewState}
                      newState={newState}
                      fourthChildIndex={fourthChildIndex}
                      expandAll={expandAll}
                      childType={childType}
                      isGridEdit={isGridEdit}
                      setIsGridEdit={setIsGridEdit}
                      copyChildValueObj={copyChildValueObj}
                      setCopyChildValueObj={setCopyChildValueObj}
                      filterData={filterData}
                    ></EditComponent>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </div>
        )}
      </div>
    </>
  );
}

EditComponent.propTypes = {
  toggleFourthSubChildEdit: PropTypes.func,
  editFourthSubChildObj: PropTypes.any,
  setEditFourthSubChildObj: PropTypes.func,
  childName: PropTypes.any,
  childIndex: PropTypes.any,
  subChild: PropTypes.any,
  index: PropTypes.any,
  item: PropTypes.any,
  setNewState: PropTypes.func,
  newState: PropTypes.any,
  fourthChildIndex: PropTypes.any,
  expandAll: PropTypes.any,
  childType: PropTypes.any,
  subChildIndex: PropTypes.any,
  isGridEdit: PropTypes.any,
  setCopyChildValueObj: PropTypes.any,
  filterData: PropTypes.any,
};
function EditComponent({
  toggleFourthSubChildEdit,
  editFourthSubChildObj,
  setEditFourthSubChildObj,
  childName,
  childIndex,
  index,
  subChild,
  item,
  setNewState,
  newState,
  fourthChildIndex,
  expandAll,
  childType,
  subChildIndex,
  isGridEdit,
  setCopyChildValueObj,
  filterData,
}) {
  const [openFourthSubChildEdit, setOpenFourthSubChildEdit] = useState(false);
  const [hoveredIcon, setHoveredIcon] = useState(null);
  const [fourthChildObj, setFourthChildObj] = useState({ ...item });

  const deleteSubChildRecord = (indexValue) => {
    let tmpData = { ...newState };
    tmpData[childName][childIndex].subChild[subChildIndex].fields.splice(
      indexValue,
      1
    );
    setNewState((prev) => {
      return { ...prev, ...tmpData };
    });
  };

  const toggleFourthSubChildEditComponent = () => {
    setOpenFourthSubChildEdit((prev) => !prev);
  };

  useEffect(() => {
    if (expandAll && openFourthSubChildEdit) {
      setEditFourthSubChildObj(newState.child[0].subChild[0].fields[index]);
    }
  }, [expandAll]);

  useEffect(() => {
    setFourthChildObj({ ...item });
  }, [item]);

  function copyDocument(obj) {
    if (Object.keys(obj).length !== 0) {
      const tmpData = { ...newState };
      tmpData[childName][childIndex].subChild[subChildIndex].fields.push({
        ...obj,
        indexValue:
          tmpData[childName][childIndex].subChild[subChildIndex].fields.length,
      });
      setNewState(tmpData);
    }
  }

  return (
    <React.Fragment>
      {!isGridEdit ? (
        <>
          <TableRow
            onDoubleClick={() => {
              toggleFourthSubChildEdit(item);
              toggleFourthSubChildEditComponent();
            }}
            key={index}
            sx={{
              "& > *": { borderBottom: "unset" },
              ...formChildTableRowStyles,
            }}
            className={`${styles.tableCellHoverEffect} ${styles.hh}`}
          >
            {subChild?.["4thchild"]?.[0].fields
              .filter((elem) => elem.isGridView)
              .map((field, subIndex) => (
                <TableCell
                  key={subIndex}
                  sx={{
                    ...gridSectionStyles,
                    paddingLeft: subIndex === 0 ? "29px" : "0px",
                  }}
                >
                  <div className="relative">
                    <div className={childTableRowStyles}>
                      {item[field.fieldname]}
                    </div>
                    {subIndex == 0 && (
                      <div className={`gridIcons file ${styles.iconContainer}`}>
                        <LightTooltip title="Delete Record">
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
                            onClick={() => copyDocument(item)}
                            onMouseEnter={() => setHoveredIcon("copy")}
                            onMouseDown={() => setHoveredIcon(null)}
                          >
                            <Image
                              src={hoveredIcon === "copy" ? CopyHover : copyDoc}
                              alt="Document Icon"
                              priority={false}
                              className="gridIcons2"
                            />
                          </IconButton>
                        </LightTooltip>
                      </div>
                    )}
                  </div>
                </TableCell>
              ))}
          </TableRow>
        </>
      ) : (
        <>
          <TableRow
            className={`${styles.tableCellHoverEffect} ${styles.hh}  `}
            sx={{
              "& > *": { borderBottom: "unset" },
              ...formChildTableRowStyles,
            }}
          >
            {subChild?.["4thchild"]?.[0].fields
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
                  <FormCreationGridInputFields
                    fieldData={field}
                    indexValue={index}
                    onValuesChange={(e) => {
                      setFourthChildObj((prev) => {
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
                              if (item._id === fourthChildObj._id) {
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
                    values={fourthChildObj}
                    onChangeHandler={(e) => {
                      console.log("onchangeHandler", e);
                    }}
                    onBlurHandler={(e) => {
                      console.log("onBlurHandler", e);
                    }}
                  />
                </TableCell>
              ))}
          </TableRow>
        </>
      )}

      {/* Edit Component */}
      {openFourthSubChildEdit && (
        <TableRow key={index} className={`${styles.pageBackground}`}>
          <TableCell
            style={{
              paddingBottom: 0,
              paddingTop: 0,
            }}
            colSpan={6}
          >
            <Collapse in={openFourthSubChildEdit} timeout="auto" unmountOnExit>
              <Box sx={{ margin: 1 }}>
                <div className=" relative flex justify-between w-[calc(100vw-170px)]">
                  {/* Custom Input Fields in the middle */}
                  <CustomeInputFields
                    inputFieldData={subChild?.["4thchild"]?.[0].fields}
                    onValuesChange={(e) => {
                      setEditFourthSubChildObj((prev) => {
                        return { ...prev, ...e };
                      });
                    }}
                    values={editFourthSubChildObj}
                    filterData={filterData}
                    newState={newState}
                  />

                  {/* Icon Button on the right */}
                  <div className="md:ml-20 relative top-0 right-2 flex justify-end items-baseline">
                    {childType !== "fields" && (
                      <>
                        <HoverIcon
                          defaultIcon={refreshIcon}
                          hoverIcon={revertHover}
                          altText={"Revert"}
                          title={"Revert"}
                          onClick={() => {
                            setEditFourthSubChildObj(() => {
                              return {
                                ...newState.child[0].subChild[0].fields[index],
                              };
                            });

                            toggleFourthSubChildEditComponent();
                          }}
                        />

                        <HoverIcon
                          defaultIcon={saveIcon}
                          hoverIcon={saveIconHover}
                          altText={"Save"}
                          title={"Save"}
                          onClick={() => {
                            setNewState((prev) => {
                              const newStateValue = { ...prev };
                              newStateValue[childName][childIndex]["subChild"][
                                fourthChildIndex
                              ]["fields"][index] = editFourthSubChildObj;
                              return newStateValue;
                            });
                            toggleFourthSubChildEditComponent();
                          }}
                        />
                      </>
                    )}
                  </div>
                </div>
              </Box>
            </Collapse>
          </TableCell>
        </TableRow>
      )}
    </React.Fragment>
  );
}
