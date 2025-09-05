"use client";

import * as React from "react";
import { useState, useRef, useEffect } from "react";
import styles from "@/app/app.module.css";
import CustomeInputFields from "@/components/Inputs/customeInputFields";
import IconButton from "@mui/material/IconButton";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import CloseOutlinedIcon from '@mui/icons-material/CloseOutlined';
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import HoverIcon from "@/components/HoveredIcons/HoverIcon";
import { refreshIcon, revertHover, saveIcon, saveIconHover, addLogo, plusIconHover } from "@/assets";
import LightTooltip from "@/components/Tooltip/customToolTip";
import EditSubChildComponent from "@/app/(groupControl)/invoiceControl/addEdit/EditSubChildComponent";
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
  searchInputStyling,
  childTableHeaderStyle,
  gridSubChildIconStyles,
  childTableRowStyles,
  totalSumChildStyle,
} from "@/app/globalCss";
import EditNoteRoundedIcon from "@mui/icons-material/EditNoteRounded";
import SaveOutlinedIcon from "@mui/icons-material/SaveOutlined";
import * as onSubmitValidation from "@/helper/onSubmitFunction";


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
function onSubmitFunctionCall(
  functionData,
  newState,
  formControlData,
  values,
  setStateVariable,
  childName,
  childIndex
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
        childIndex
      });
      return result;
      // onChangeHandler(updatedValues); // Assuming you have an onChangeHandler function to handle the updated values
    }
  }
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
  expandAll: PropTypes.any,
  inEditMode: PropTypes.any,
  originalData: PropTypes.any,
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
  keyValue: PropTypes.any,
  setSubChildViewData: PropTypes.any,
  formControlData: PropTypes.any,
  setFormControlData: PropTypes.any,


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
  expandAll,
  inEditMode,
  originalData,
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
  keyValue,
  setSubChildViewData,
  formControlData,
  setFormControlData,
}) {
  const [hideSubChildInputs, setHideSubChildInputs] = useState(
    expandAll
      ? row[subChild?.tableName] && row[subChild?.tableName]?.length === 0
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
  const [isGridEdit, setIsGridEdit] = useState(false);
  const [copyChildValueObj, setCopyChildValueObj] = useState([]);
  const [columnTotals, setColumnTotals] = useState({ tableName: "" });

  const handleFieldSubChildrenValuesChange = (updatedValues) => {
    setSubChildObject((prev) => ({ ...prev, ...updatedValues }));
  };

  const hideSubChildInputComponent = () => {
    setHideSubChildInputs((prev) => !prev);
  };

  const closeSubChildComponent = () => {
    setSubChildObject({ ...subChildObject });
    setSubChildComponent((prev) => !prev);
    setSubChildViewData((prev) => prev.filter((item) => item !== keyValue));
  };

  const subChildButtonDataHandler = (subChildObject, subChild, islastTab) => {
    if (Object.keys(subChildObject).length !== 0) {
      for (const feild of subChild.fields) {
        if (
          feild.isRequired &&
          (!Object.prototype.hasOwnProperty.call(
            subChildObject,
            feild.fieldname
          ) ||
            subChildObject[feild.fieldname].toString().trim() === "")
        ) {
          toast.error(`Value for ${feild.yourlabel} is missing or empty.`);
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
              subChildObject,
              setSubChildObject,
              childName,
              childIndex
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
      // const tmpData = { ...newState };
      const tmpData = JSON.parse(JSON.stringify(newState));
      if (Array.isArray(tmpData[childName][childIndex][subChild.tableName])) {
        tmpData[childName][childIndex][subChild.tableName].push({
          ...subChildObject,
          isChecked: true,
          indexValue: tmpData[childName][childIndex][subChild.tableName].length
        });
      }
      else {
        tmpData[childName][childIndex][subChild.tableName] = [{
          ...subChildObject,
          isChecked: true,
          indexValue: 0
        }];
      }
      console.log("tmpData", tmpData);
      setNewState((pre) => {
        if (JSON.stringify(pre) === JSON.stringify(tmpData)) return pre;
        return { ...pre, ...tmpData };
      });

      setSubmitNewState((pre) => {
        if (JSON.stringify(pre) === JSON.stringify(tmpData)) return pre;
        return { ...pre, ...tmpData };
      });

      // setNewState((pre) => {
      //   return { ...pre, ...tmpData };
      // });
      // setSubmitNewState((pre) => {
      //   return { ...pre, ...tmpData };
      // });
      setSubChildObject({});
      hideSubChildInputComponent();
      if (islastTab == true) {
        setTimeout(() => {
          hideSubChildInputComponent();
        }, 3);
      }
    } else {
      console.log("Please fill all the required fields");
    }
  };

  const handleScroll = () => {
    const container = tableRef.current;
    if (container) {
      const { scrollTop, scrollHeight, clientHeight } = container;
      const isAtBottom = scrollTop + clientHeight >= scrollHeight - 1;
      if (isAtBottom) {
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
  };

  // Function to calculate totals for a single row
  const calculateTotalForRow = (rowData) => {
    // Iterate over each field in the fields array
    subChild.fields.forEach((item) => {
      // Check if the field requires grid total and is of type 'number' or 'text'
      if (
        item.gridTotal &&
        (item.type === "number" || item.type === "decimal")
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
          tableName: subChild.tableName,
          [item.fieldname]: newValue,
        }));
      }
    });
  };

  useEffect(() => {
    setRenderedData(
      newState[childName]?.[childIndex]?.[subChild.tableName]?.slice(0, 10)
    );
    calculateTotalForRow(
      newState[childName]?.[childIndex]?.[subChild.tableName]
    );
  }, [newState]);

  const deleteSubChildRecord = (indexValue) => {
    let tmpData = { ...newState };
    tmpData[childName][childIndex][subChild.tableName].splice(indexValue, 1);
    setNewState((prev) => {
      return { ...prev, ...tmpData };
    });
    setSubmitNewState((prev) => {
      return { ...prev, ...tmpData };
    });
    if (tmpData[childName][childIndex][subChild.tableName].length === 0) {
      setHideSubChildInputs((prev) => !prev);
    }
  };

  // eslint-disable-next-line no-unused-vars
  const removeSubChildRecordFromInsert = (id, index) => {
    setSubmitNewState((prevState) => {
      const newStateCopy = { ...newState, ...prevState };
      // Assume each entry in the array has an 'id' property
      let updatedData = newStateCopy[childName][childIndex][
        subChild.tableName
      ].filter((_, idx) => idx === index);

      updatedData = { ...updatedData[0], isChecked: false };
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

      updatedData = { ...updatedData[0], isChecked: false };
      newStateCopy[childName][childIndex][subChild.tableName][index] =
        updatedData;
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
    controlerName: PropTypes.string,
  };
  function CustomizedInputBase({
    columnData,
    setPrevSearchInput,
    prevSearchInput,
    controlerName,
  }) {
    const [searchInput, setSearchInput] = useState(prevSearchInput || "");

    // Custom filter logic
    const filterFunction = (searchValue, columnKey) => {
      if (!searchValue.trim()) {
        setInputVisible(false);
        setSubmitNewState(originalData);
        return setNewState(originalData);
      }
      const lowercasedInput = searchValue.toLowerCase();
      const filtered = newState[childName][childIndex][
        subChild.tableName
      ].filter((item) => {
        // Access the item's property based on columnKey and convert to string for comparison
        let columnValue = "";
        if (controlerName.toLowerCase() === "dropdown") {
          let dropdownColumnValue = columnKey + "Dropdown";
          let dropdownItem = item[dropdownColumnValue];
          if (dropdownItem === undefined) {
            dropdownColumnValue = columnKey + "dropdown";
            dropdownItem = item[dropdownColumnValue][0].label;
          }
          columnValue = dropdownItem
            ? String(`${dropdownItem}`).toLowerCase()
            : "";
          return columnValue.includes(lowercasedInput);
        } else {
          columnValue = String(item[columnKey]).toLowerCase();
          return columnValue.includes(lowercasedInput);
        }
      });
      if (filtered.length === 0) {
        toast.error("No matching records found.");
        return;
      }

      setNewState((prevState) => ({
        ...prevState,
        [childName]: [
          ...prevState[childName].slice(0, childIndex),
          {
            ...prevState[childName][childIndex],
            [subChild.tableName]: filtered,
          },
          ...prevState[childName].slice(childIndex + 1),
        ],
      }));
      setSubmitNewState((prevState) => ({
        ...prevState,
        [childName]: [
          ...prevState[childName].slice(0, childIndex),
          {
            ...prevState[childName][childIndex],
            [subChild.tableName]: filtered,
          },
          ...prevState[childName].slice(childIndex + 1),
        ],
      }));
      setInputVisible(false);
      setPrevSearchInput(searchValue);
    };

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
      sortJSON(renderedData, columnId, !isAscending ? "asc" : "desc");

    } else {
      // If a different column is clicked, update the sortedColumn state and set sorting order to ascending
      setSortedColumn(columnId);
      setIsAscending(true);
      sortJSON(renderedData, columnId, "asc");
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
      newCopy[tableName].push(newState[childName][childIndex][tableName]);
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
          if (
            Object.prototype.hasOwnProperty.call(object, field.fieldname) &&
            object[field.fieldname] &&
            object[field.fieldname].trim() !== ""
          ) {
            isFieldValid = true; // Field is valid, break out of the loop for this field
            break;
          }
        }
      }

      if (!isFieldValid && field.isRequired) {
        // If no valid entry was found and the field is required
        toast.error(`Value for ${field.yourlabel} is missing or empty.`);
        return; // Exit the function if a validation fails
      }
    }
    setNewState((prev) => {
      return {
        ...prev,
        [childName]: {
          ...prev[childName],
          [childIndex]: {
            ...prev[childName][childIndex],
            [tableName]: copyChildValueObj[tableName]?.[0],
          },
        },
      };
    });
    setSubmitNewState((prev) => {
      return {
        ...prev,
        [childName]: {
          ...prev[childName],
          [childIndex]: {
            ...prev[childName][childIndex],
            [tableName]: copyChildValueObj[tableName]?.[0],
          },
        },
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
    if (result?.isCheck === false) {
      if (result?.alertShow) {
        setParaText(result.message);
        setIsError(true);
        setOpenModal((prev) => !prev);
        setTypeofModal("onCheck");
      }
      return;
    }
    let data = { ...result?.values };
    // let data = { ...result.newState };
    setSubChildObject((pre) => {
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
    setSubChildObject((pre) => {
      return {
        ...pre,
        ...data,
      };
    });
  }

  return (
    <>
      {/* Input field integration */}
      <div
        key={index}
        style={{ width: "100%" }}
      >
        {(row[subChild?.tableName]?.length == 0 || !hideSubChildInputs) && (
          <div className=" my-3 flex justify-between ">
            <CustomeInputFields
              key={index}
              inputFieldData={subChild.fields}
              values={subChildObject}
              onValuesChange={handleFieldSubChildrenValuesChange}
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
              setStateVariable={setSubChildObject}
              callSaveFunctionOnLastTab={() => {
                console.log("subChildObject", subChildObject);

                subChildButtonDataHandler(subChildObject, subChild, true);
              }}
            />
            {!isView && (
              <div className="relative top-0 right-2 flex justify-end items-baseline">
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
            )}
          </div>
        )}

        {row[subChild.tableName] && row[subChild.tableName]?.length > 0 && (
          <div
            style={{ marginTop: subChild.isHideGridHeader === true ? '0rem' : '1.25rem' }}
          >
            <TableContainer
              component={Paper}
              ref={tableRef}
              onScroll={handleScroll}
              className={`${styles.pageBackground} ${styles.thinScrollBar}`}
              sx={{
                height: row[subChild.tableName]?.length > 10 ? "250px" : "250px",
                overflowY: "auto",
              }}
            >
              {/* <Table aria-label="collapsible table"> */}
              <Table
                aria-label="sticky table"
                stickyHeader
                sx={{ overflowY: "auto" }}
              >

                <TableHead>
                  {subChild.isHideGridHeader === true ? "" :
                    <TableRow>

                      {subChild.fields
                        .filter((elem) => elem.isGridView)
                        .map((item, index) => (
                          <TableCell
                            key={index}
                            className={`${styles.cellHeading} cursor-pointer overflow-hidden ${styles.tableSubChildHeader} `}
                            sx={{
                              ...childTableHeaderStyle,
                              paddingLeft: index === 0 ? "29px" : "",
                            }}
                            onContextMenu={(event) =>
                              handleRightClick(event, item.fieldname)
                            } // Add the right-click handler here
                          >
                            {!isView && index === 0 && (hideSubChildInputs || row[subChild?.tableName].length > 0) && (

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
                              style={{ paddingLeft: isGridEdit ? '0px' : '0px' }}
                            >
                              {item.yourlabel}
                            </span>
                            {renderedData?.length > 0 &&
                              !isView &&
                              index === 0 &&
                              hideSubChildInputs && (
                                <>
                                  <LightTooltip title="Edit Grid">
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
                                            subChild.tableName,
                                            subChild
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
                    </TableRow>}
                </TableHead>

                <TableBody className="relative">
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
                        expandAll={expandAll}
                        inEditMode={inEditMode}
                        setRenderedData={setRenderedData}
                        setHideSubChildInputs={setHideSubChildInputs}
                        deleteSubChildRecord={deleteSubChildRecord}
                        originalData={originalData}
                        isView={isView}
                        isGridEdit={isGridEdit}
                        setIsGridEdit={setIsGridEdit}
                        copyChildValueObj={copyChildValueObj}
                        setCopyChildValueObj={setCopyChildValueObj}
                        setOpenModal={setOpenModal}
                        setParaText={setParaText}
                        setIsError={setIsError}
                        setTypeofModal={setTypeofModal}
                        clearFlag={clearFlag}
                        setClearFlag={setClearFlag}
                        containerWidth={containerWidth}
                        submitNewState={submitNewState}
                        setSubmitNewState={setSubmitNewState}
                        removeSubChildRecordFromInsert={
                          removeSubChildRecordFromInsert
                        }
                        formControlData={formControlData}
                        setFormControlData={setFormControlData}
                        setSubChildObject={setSubChildObject}
                      />
                    </React.Fragment>
                  ))}
                  <>
                    {Object.keys(columnTotals).length > 0 &&
                      columnTotals.tableName === subChild.tableName && (
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
                          {subChild.fields
                            .filter((elem) => elem.isGridView)
                            .map((field, index) => (
                              <TableCell
                                align="left"
                                key={index}
                                sx={{
                                  ...totalSumChildStyle,
                                  paddingLeft: index === 0 ? "29px" : "0px",
                                }}

                              >
                                <div className="relative ">
                                  <div className={`${childTableRowStyles} `}>
                                    {(field.type === "number" ||
                                      field.type === "decimal") &&
                                      field.gridTotal
                                      ? columnTotals[field.fieldname]
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
        )}
      </div>
    </>
  );
}
