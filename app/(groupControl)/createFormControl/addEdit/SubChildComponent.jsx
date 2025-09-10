"use client";

import * as React from "react";
import { useState, useRef, useEffect } from "react";
import styles from "@/app/app.module.css";
import CustomeInputFields from "@/components/Inputs/formCreationCustomeInput";
import IconButton from "@mui/material/IconButton";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import CloseOutlinedIcon from '@mui/icons-material/CloseOutlined';
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import {

  addLogo,
  
  plusIconHover,
} from "@/assets";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import { saveIcon, saveIconHover, refreshIcon, revertHover } from "@/assets";
import LightTooltip from "@/components/Tooltip/customToolTip";
import { hasBlackValues } from "@/helper/checkValue";
import EditSubChildComponent from "@/app/(groupControl)/createFormControl/addEdit/EditSubChildComponent";
import { dynamicDropDownFieldsData } from "@/services/auth/FormControl.services";
import PropTypes from "prop-types";
import InputBase from "@mui/material/InputBase";
import Divider from "@mui/material/Divider";
import SearchIcon from "@mui/icons-material/Search";
import ClearIcon from "@mui/icons-material/Clear";
import { toast } from "react-toastify";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";

import {
  childTableHeaderStyle,
  createAddEditPaperStyles,
  gridSubChildIconStyles,
  searchInputStyling,
} from "@/app/globalCss";
import HoverIcon from "@/components/HoveredIcons/HoverIcon";
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

SubChildComponent.propTypes = {
  subChild: PropTypes.any,
  row: PropTypes.any,
  index: PropTypes.any,
  newState: PropTypes.any,
  setNewState: PropTypes.any,
  childName: PropTypes.any,
  childIndex: PropTypes.any,
  setSubChildComponent: PropTypes.any,
  childType: PropTypes.any,
  expandAll: PropTypes.any,
  filterData: PropTypes.any,
  containerWidth: PropTypes.any
};
export default function SubChildComponent({
  subChild,
  row,
  index,
  newState,
  setNewState,
  childName,
  childIndex,
  setSubChildComponent,
  childType,
  expandAll,
  filterData,
  containerWidth,
}) {
  const [hideSubChildInputs, setHideSubChildInputs] = useState(
    expandAll
      ? row[subChild?.tableName] &&
        row[subChild?.tableName]?.length === 0 &&
        subChild?.tableName === "fields"
        ? false
        : true
      : false
  );
  const [subChildObject, setSubChildObject] = useState({});
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
    subChild?.fields.forEach((element) => {
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

  useEffect(() => {
    handleControlDefaultValue();
  }, []);

  useEffect(() => {
    setRenderedData(
      newState[childName][childIndex][subChild.tableName]?.slice(0, 10)
    );
    setDummyData(
      newState[childName][childIndex][subChild.tableName]?.slice(0, 10)
    );
  }, [newState]);

  useEffect(() => {
    if (
      childType === "subChild" &&
      row[subChild?.tableName] &&
      row[subChild?.tableName]?.length === 0
    ) {
      setHideSubChildInputs(false);
    }
  }, [childType]);

  async function getDynamicFieldsData(values) {
    // console.log("values", values);
    let refrenceTableObj = {
      onfilterkey: "child.subChild.tableName",
      referenceTable: "master_schema.child.subChild.fields",
      referenceColumn: "$child.subChild.fields.fieldname",
      onfiltervalue: values.tableName,
    };
    // Api call for dynamic fields values
    const apiResponse = await dynamicDropDownFieldsData(refrenceTableObj);
    if (apiResponse.success) {
      subChild["4thchild"][0].fields[0].data = apiResponse.data;
    } else {
      console.log("Error : ", apiResponse.message);
    }
  }

  const handleFieldSubChildrenValuesChange = (updatedValues) => {
    getDynamicFieldsData(updatedValues);
    setSubChildObject((prev) => ({ ...prev, ...updatedValues }));
  };

  const hideSubChildInputComponent = () => {
    setHideSubChildInputs((prev) => !prev);
  };

  const subChildButtonDataHandler = (subChildObject, subChild) => {
    if (
      Object.keys(subChildObject).length === 0 ||
      hasBlackValues(subChildObject)
    ) {
      return;
    }
    const tmpData = { ...newState };
    tmpData[childName][childIndex][subChild.tableName].push(subChildObject);
    setNewState((pre) => {
      return { ...pre, ...tmpData };
    });
    setSubChildObject({});
    hideSubChildInputComponent();
  };

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

  const renderMoreData = () => {
    // Calculate the index range to render
    const lastIndex = renderedData.length + 10;
    const newData = newState[childName][childIndex][subChild.tableName]?.slice(
      renderedData.length,
      lastIndex
    );
    setRenderedData((prevData) => [...prevData, ...newData]);
    setDummyData((prevData) => [...prevData, ...newData]);
  };

  const deleteSubChildRecord = (indexValue) => {
    let tmpData = { ...newState };
    tmpData[childName][childIndex][subChild.tableName].splice(indexValue, 1);
    setNewState((prev) => {
      return { ...prev, ...tmpData };
    });
    if (tmpData[childName][childIndex][subChild.tableName].length === 0) {
      setHideSubChildInputs((prev) => !prev);
    }
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
        return setRenderedData(dummyData);
      }
      const lowercasedInput = searchValue.toLowerCase();
      const filtered = newState[childName][childIndex][
        subChild.tableName
      ].filter((item) => {
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
    };

    function handleClose() {
      setSearchInput("");
      setPrevSearchInput("");
      // setInputVisible(false);
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
                  // opacity: sortedColumn === columnId ? "1" : "1",
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
      newCopy[tableName].push(newState[childName][childIndex][tableName]);
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
      updatedState[childName][childIndex][tableName] =
        copyChildValueObj[tableName]?.[0];
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
      {/* Input field integration */}
      <div
        key={index}
        style={{
          width: `${containerWidth - 50}px`,
        }}
      >
        {/* Child Input Fields */}
        {!hideSubChildInputs && (
          <div className="pl-[16px] pt-[2px] pb-[8px] flex justify-between ">
            <CustomeInputFields
              key={index}
              inputFieldData={subChild?.fields}
              values={subChildObject}
              onValuesChange={handleFieldSubChildrenValuesChange}
              filterData={filterData}
              newState={newState}
            />
            <div className="mb-ml-8 relative top-0 right-2 flex justify-start items-baseline ">
              <>
                {subChild["4thchild"] && subChild["4thchild"].length > 0 ? (
                  <>
                    <HoverIcon
                      defaultIcon={refreshIcon}
                      hoverIcon={revertHover}
                      altText={"Revert"}
                      title={"Revert"}
                      onClick={() => {
                        setSubChildObject({});
                        setSubChildComponent((prev) => !prev);
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
                ) : (
                  <>
                    <HoverIcon
                      defaultIcon={refreshIcon}
                      hoverIcon={revertHover}
                      altText={"Revert"}
                      title={"Revert"}
                      onClick={() => {
                        setSubChildObject({});
                        hideSubChildInputComponent();
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
                )}
              </>
            </div>
          </div>
        )}

        {/* Child Table headers */}
        {row[subChild?.tableName] && row[subChild?.tableName]?.length > 0 && (
          <div className="w-[100%] ">
            <TableContainer
              component={Paper}
              ref={tableRef}
              onScroll={handleScroll}
              className={`${styles.hideScrollbar} ${styles.thinScrollBar} ${styles.pageBackground}`}
              sx={{
                height:
                  row[subChild?.tableName]?.length > 10 ? "290px" : "auto",
                overflowY:
                  row[subChild.tableName]?.length > 10 ? "auto" : "hidden",
                width: "calc(100vw - 20px)",
              }}
            >
              <Table
                aria-label="sticky table"
                stickyHeader
                sx={{ overflowY: "auto" , width: "fit-content", minWidth: "100%" }}
              >
                <TableHead className="">
                  <TableRow>
                    {subChild.fields
                      .filter((elem) => elem.isGridView)
                      .map((item, index) => (
                        <TableCell
                          key={index}
                          className={`${styles.cellHeading} cursor-pointer `}
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
                            style={{
                              paddingLeft:
                                index == 0 && !hideSubChildInputs
                                  ? "29px"
                                  : "0px",
                            }}
                          >
                            {item.yourlabel}
                          </span>
                          {renderedData?.length > 0 &&
                            index === 0 &&
                            hideSubChildInputs && (
                              <>
                                <LightTooltip title="Edit Grid Options">
                                  <EditNoteRoundedIcon
                                    sx={{
                                      ...gridSubChildIconStyles,
                                    }}
                                    onClick={() => {
                                      gridEditHandle(subChild.tableName);
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
                                          subChild.tableName
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

                <TableBody className="p-0">
                  {renderedData?.map((item, index) => (
                    <React.Fragment key={index}>
                      <EditSubChildComponent
                        subChildObject={item}
                        subChildIndex={index}
                        setNewState={setNewState}
                        newState={newState}
                        subChild={subChild}
                        index={index}
                        childName={childName}
                        childIndex={childIndex}
                        row={row}
                        childType={childType}
                        expandAll={expandAll}
                        setRenderedData={setRenderedData}
                        deleteSubChildRecord={deleteSubChildRecord}
                        isGridEdit={isGridEdit}
                        setIsGridEdit={setIsGridEdit}
                        copyChildValueObj={copyChildValueObj}
                        setCopyChildValueObj={setCopyChildValueObj}
                        filterData={filterData}
                        containerWidth={containerWidth}
                      />
                    </React.Fragment>
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
