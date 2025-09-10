/* eslint-disable no-unused-vars */
"use client";
import React, { useState, useRef, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import styles from "@/app/app.module.css";
import Accordion from "@mui/material/Accordion";
import AccordionSummary from "@mui/material/AccordionSummary";
import AccordionDetails from "@mui/material/AccordionDetails";
import Typography from "@mui/material/Typography";
import CloseOutlinedIcon from "@mui/icons-material/CloseOutlined";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import {
  formControlMenuList,
  handleSubmitApi,
  formControlListing,
  dynamicDropDownFieldsData,
} from "@/services/auth/FormControl.services.js";
import { ButtonPanel } from "@/components/Buttons/customeButton.jsx";
import CustomeInputFields from "@/components/Inputs/formCreationCustomeInput";
import IconButton from "@mui/material/IconButton";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import { toast } from "react-toastify";
import {
  refreshIcon,
  saveIcon,
  addLogo,
  plusIconHover,
  revertHover,
  saveIconHover,
} from "@/assets";
import HoverIcon from "@/components/HoveredIcons/HoverIcon";
import LightTooltip from "@/components/Tooltip/customToolTip";
import RowComponent from "@/app/(groupControl)/createFormControl/addEdit/RowComponent";
import PropTypes from "prop-types";
import InputBase from "@mui/material/InputBase";
import Divider from "@mui/material/Divider";
import SearchIcon from "@mui/icons-material/Search";
import ClearIcon from "@mui/icons-material/Clear";
import CustomeModal from "@/components/Modal/customModal.jsx";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";
import {
  parentAccordionSection,
  childAccordionSection,
  createAddEditPaperStyles,
  accordianDetailsStyle,
  childTableHeaderStyle,
  searchInputStyling,
  gridEditIconStyles,
} from "@/app/globalCss";
import { areObjectsEqual, hasBlackValues } from "@/helper/checkValue";
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

export default function AddEditFormControll() {
  let editMode = true;
  const { push } = useRouter();
  const params = useParams();
  const search = JSON.parse(decodeURIComponent(params.id));
  const [parentsFields, setParentsFields] = useState([]);
  const [childsFields, setChildsFields] = useState([]);
  const [newState, setNewState] = useState({});
  const [buttonsData, setButtonsData] = useState(null); // Initialize as null
  const [expandAll, setExpandAll] = useState(true);
  const [openModal, setOpenModal] = useState(false);
  const [isError, setIsError] = useState(false);
  const [paraText, setParaText] = useState("");
  const [initialState, setInitialState] = useState({});
  const [filterData, setFilterData] = useState({
    key: "",
    value: "",
  });

  // get label Code
  const [labelName, setLabelName] = useState("");

  const getLabelValue = (label) => {
    setLabelName(label);
  };

  //  get Label Coede ends here

  async function getDynamicFieldsData(values) {
    // let refrenceTableObj = {
    //   onfilterkey: "tableName",
    //   referenceTable: "master_schema.fields",
    //   referenceColumn: "$fields.fieldname",
    //   onfiltervalue: values.tableName,
    // };
    // // Api call for dynamic fields values
    // const apiResponse = await dynamicDropDownFieldsData(refrenceTableObj);
    // if (apiResponse.success == true) {
    //   setChildsFields((prev) => {
    //     let temp = [...prev];
    //     temp[1].fields[0].data = apiResponse.data;
    //     return temp;
    //   });
    // } else {
    //   console.log("Error : ");
    // }
  }

  const handleFieldValuesChange = (updatedValues) => {
    getDynamicFieldsData(updatedValues);
    let formFieldsValues = { ...newState, ...updatedValues };
    setNewState(formFieldsValues);
  };

  // Define your button click handlers
  const handleButtonClick = {
    handleSubmit: async () => {
      const isEqual = areObjectsEqual(newState, initialState);
      if (!isEqual) {
        // event.preventDefault();
        // eslint-disable-next-line no-unused-vars
        for (const [section, fields] of Object.entries(parentsFields)) {
          const missingField = Object.entries(fields).find(
            // eslint-disable-next-line no-unused-vars
            ([, { isRequired, fieldname, yourlabel }]) =>
              isRequired && !newState[fieldname]
          );

          if (missingField) {
            const [, { yourlabel }] = missingField;
            toast.error(`Value for ${yourlabel} is missing.`);
            return;
          }
        }

        let data = await handleSubmitApi(newState);
        if (data.success == true) {
          toast.success(data.message);
        } else {
          toast.error(data.message);
        }
      } else {
        toast.error("No changes made");
      }
    },

    handleEdit: () => {
      console.log("Edit clicked");
      toast.error("Not available now");
    },
    handleDelete: () => {
      console.log("Delete clicked");
      setNewState(initialState);
    },
    handleClose: () => {
      console.log("Close clicked");
      setParaText("Do you want to close this form, all changes will be lost?");
      setIsError(true);
      setOpenModal((prev) => !prev);
    },
    handleSaveClose: async () => {
      console.log("Save and Close clicked");
      const isEqual = areObjectsEqual(newState, initialState);
      if (!isEqual) {
        // eslint-disable-next-line no-unused-vars
        for (const [section, fields] of Object.entries(parentsFields)) {
          const missingField = Object.entries(fields).find(
            // eslint-disable-next-line no-unused-vars
            ([, { isRequired, fieldname, yourlabel }]) =>
              isRequired && !newState[fieldname]
          );

          if (missingField) {
            const [, { yourlabel }] = missingField;
            toast.error(`Value for ${yourlabel} is missing.`);
            return;
          }
        }
        let data = await handleSubmitApi(newState);
        if (data.success == true) {
          toast.success(data.message);
          setTimeout(() => {
            push("/createFormControl");
          }, 500);
        } else {
          toast.error(data.message);
        }
      } else {
        toast.error("No changes made");
      }
    },
    handleSavePrint: () => console.log("Save and Print clicked"),
  };

  const onConfirm = async (conformData) => {
    if (conformData.isError) {
      setOpenModal((prev) => !prev);
      setNewState({ routeName: "mastervalue" });
      push(`/createFormControl`);
    }
  };

  function groupAndSortFields(fields) {
    // Group fields by 'sectionHeader'
    const groupedFields = fields.reduce((acc, field) => {
      const section = field.sectionHeader || "default"; // Use 'default' or any other value for fields without sectionHeader
      acc[section] = acc[section] || [];
      acc[section].push(field);
      return acc;
    }, {});

    // Sort each group by 'sectionOrder'
    Object.keys(groupedFields).forEach((section) => {
      groupedFields[section].sort(
        (a, b) => (a.sectionOrder || 0) - (b.sectionOrder || 0)
      );
    });

    return groupedFields;
  }

  async function fetchData() {
    // Call api for table grid data
    const tableViewApiResponse = await formControlMenuList("CreateFormcontrol");

    let tempnewState = [];
    if (tableViewApiResponse.success) {
      const formControlData = await formControlListing({ id: search.id });
      let formData = formControlData?.data[0] || {};
      search.isCopy ? (formData.id = "") : null;

      const resData = groupAndSortFields(tableViewApiResponse.data[0].fields);
      setNewState({
        ...formControlData?.data[0],
        routeName: "FormRoute",
      });
      setParentsFields(resData); // Set parents fields.
      setChildsFields(tableViewApiResponse.data[0].child); // Set child fields.
      setButtonsData(tableViewApiResponse.data[0].buttons); // Set buttons data.

      for (let item of tableViewApiResponse.data[0].child) {
        for (
          let firstIndex = 0;
          firstIndex < (formData[item.tableName] || []).length;
          firstIndex++
        ) {
          formData[item.tableName][firstIndex].indexValue = firstIndex;
          if (item.subChild.length) {
            for (const subchildItem of item.subChild) {
              for (
                let secondIndex = 0;
                secondIndex <
                (
                  formData[item.tableName][firstIndex]?.[
                  subchildItem.tableName
                  ] || []
                ).length;
                secondIndex++
              ) {
                formData[item.tableName][firstIndex][subchildItem.tableName][
                  secondIndex
                ].indexValue = secondIndex;
                formData[item.table];
                for (const fourthChild of subchildItem["4thChild"]) {
                  for (
                    let thirdIndex = 0;
                    thirdIndex <
                    (
                      formData[item.tableName][firstIndex][
                      subchildItem.tableName
                      ][secondIndex][fourthChild.tableName] || []
                    ).length;
                    thirdIndex++
                  ) {
                    formData[item.tableName][firstIndex][
                      subchildItem.tableName
                    ][secondIndex][fourthChild.tableName][
                      thirdIndex
                    ].indexValue = thirdIndex;
                  }
                }
              }
            }
          }
        }
      }

      setNewState((prev) => {
        return {
          ...prev,
          ...formData,
          ...tempnewState,
        };
      });
      setInitialState((prev) => {
        return { ...prev, ...formData, ...tempnewState };
      });
      setFilterData({
        key: "tableName",
        value: formControlData?.data[0].tableName,
      });
    } else {
      toast.error(tableViewApiResponse.message);
    }
  }
  useEffect(() => {
    fetchData();
  }, [params.id]);

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
        />

        {/* Middle Accrodian view */}
        <div
          className={`w-full p-1 ${styles.pageBackground} overflow-auto overflow-x-hidden ${styles.thinScrollBar}`}
          style={{ height: "calc(100vh - 24vh)" }}
        >
          {/* Parents Accordian */}
          {Object.keys(parentsFields).map((section, index) => (
            <React.Fragment key={index}>
              <ParentAccordianComponent
                section={section}
                indexValue={index}
                newState={newState}
                setNewState={setNewState}
                parentsFields={parentsFields}
                handleFieldValuesChange={handleFieldValuesChange}
                expandAll={expandAll}
                filterData={filterData}
                editMode={editMode}
                getLabelValue={getLabelValue}
              ></ParentAccordianComponent>
            </React.Fragment>
          ))}

          {/* Child Accordian */}
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
                filterData={filterData}
                editMode={editMode}
                getLabelValue={getLabelValue}
              />
            </div>
          ))}
        </div>

        {/* Bottom Button grid */}
        <ButtonPanel
          buttonsData={buttonsData}
          handleButtonClick={handleButtonClick}
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
          labelValue={labelName}
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
  handleFieldValuesChange: PropTypes.any,
  expandAll: PropTypes.any,
  getLabelValue: PropTypes.any,
};
function ParentAccordianComponent({
  section,
  indexValue,
  newState,
  parentsFields,
  handleFieldValuesChange,
  expandAll,
  getLabelValue,
}) {
  const [isParentAccordionOpen, setIsParentAccordionOpen] = useState(false);

  useEffect(() => {
    setIsParentAccordionOpen(expandAll);
  }, [expandAll]);

  return (
    <React.Fragment key={indexValue}>
      <Accordion
        expanded={isParentAccordionOpen}
        sx={{ ...parentAccordionSection }}
        key={indexValue}
      >
        <AccordionSummary
          className="relative left-[11px]"
          expandIcon={
            <LightTooltip title={isParentAccordionOpen ? "Collapse" : "Expand"}>
              <ExpandMoreIcon
                className={`${styles.inputTextColor} cursor-pointer`}
                onClick={() => setIsParentAccordionOpen((prev) => !prev)}
              />
            </LightTooltip>
          }
          aria-controls={`panel${indexValue + 1}-content`}
          id={`panel${indexValue + 1}-header`}
        >
          <Typography className="relative right-[11px]" key={indexValue}>
            {section}
          </Typography>
        </AccordionSummary>

        <AccordionDetails
          className={` overflow-hidden ${styles.thinScrollBar}`}
          sx={{ ...accordianDetailsStyle }}
        >
          <CustomeInputFields
            inputFieldData={parentsFields[section]}
            values={newState}
            onValuesChange={handleFieldValuesChange}
            onChangeHandler={(e) => {
              console.log("onchangeHandler", e);
            }}
            onBlurHandler={(e) => {
              console.log("onBlurHandler", e);
            }}
            filterData={{ key: "", value: "" }}
            getLabelValue={getLabelValue}
            newState={newState}
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
  filterData: PropTypes.any,
  editMode: PropTypes.any,
  getLabelValue: PropTypes.any,
};
function ChildAccordianComponent({
  section,
  indexValue,
  newState,
  setNewState,
  expandAll,
  filterData,
  editMode,
  getLabelValue,
}) {
  const [clickCount, setClickCount] = useState(0);
  const [inputFieldsVisible, setInputFieldsVisible] = useState(false);
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
  const [copyChildValueObj, setCopyChildValueObj] = useState([]);
  const [isGridEdit, setIsGridEdit] = useState(false);
  const [containerWidth, setContainerWidth] = useState(0);
  const [tableBodyWidhth, setTableBodyWidth] = useState("0px");

  async function getDynamicFieldsData(values) {
    let refrenceTableObj = {
      onfilterkey: "child.tableName",
      referenceTable: "master_schema.child.fields",
      referenceColumn: "$child.fields.fieldname",
      onfiltervalue: values.tableName,
    };
    // Api call for dynamic fields values
    const apiResponse = await dynamicDropDownFieldsData(refrenceTableObj);
    if (apiResponse.success) {
      if (section.subChild[0]) {
        section.subChild[0].fields[0].data = apiResponse.data;
      }
    } else {
      console.log("Error : ", apiResponse.message);
    }
  }

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
    const newData = newState[section.tableName]?.slice(
      renderedData.length,
      lastIndex
    );
    setRenderedData((prevData) => [...prevData, ...newData]);
    setDummyData((prevData) => [...prevData, ...newData]);
  };

  const handleFieldChildrenValuesChange = (updatedValues) => {
    getDynamicFieldsData(updatedValues);
    let Object = { ...childObject, ...updatedValues };
    setChildObject(Object);
  };

  const childButtonHandler = (section) => {
    if (isChildAccordionOpen) {
      setClickCount((prevCount) => prevCount + 1);
    }

    inputFieldsVisible == false && setInputFieldsVisible((prev) => !prev);
    if (inputFieldsVisible) {
      for (var feild of section.fields) {
        if (
          feild.isRequired &&
          (!Object.prototype.hasOwnProperty.call(
            childObject,
            feild.fieldname
          ) ||
            childObject[feild.fieldname].trim() === "")
        ) {
          toast.error(`Value for ${feild.yourlabel} is missing or empty.`);
          return;
        }
      }

      toast.dismiss();
      const tmpData = { ...newState };
      // const subChild = section.subChild.reduce((obj, item) => {
      //   obj[item.tableName] = [];
      //   return obj;
      // }, {});
      // Object.assign(subChild, childObject);
      if (hasBlackValues(childObject)) {
        return;
      }
      tmpData[section.tableName].push({
        ...childObject,
        indexValue: tmpData[section.tableName].length,
      });
      setNewState(tmpData);
      setRenderedData(tmpData[section.tableName]);
      setChildObject({});
      setInputFieldsVisible((prev) => !prev);
    }
  };

  const childExpandedAccordion = () => {
    setIschildAccordionOpen((prev) => !prev);
  };

  const deleteChildRecord = (index) => {
    setNewState((prevState) => {
      const newStateCopy = { ...prevState };
      const updatedData = newStateCopy[section.tableName].filter(
        (_, idx) => idx !== index
      );
      newStateCopy[section.tableName][index].status = 0
      console.log("updatedData", updatedData);
      newStateCopy[section.tableName] = updatedData;
      if (newStateCopy[section.tableName].length === 0) {
        setInputFieldsVisible((prev) => !prev);
      }
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
    // controlerName,
  }) {
    const inputRef = useRef(null); // Ref to the Paper component
    const [searchInput, setSearchInput] = useState(prevSearchInput || "");

    // Custom filter logic
    function filterFunction(searchValue, columnKey) {
      if (!searchValue.trim()) {
        setInputVisible(false);
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

  function gridEditSaveFunction(tableName) {
    setNewState((prev) => {
      return {
        ...prev,
        [tableName]: copyChildValueObj[tableName]?.[0],
      };
    });
    setIsGridEdit(!isGridEdit);
    setCopyChildValueObj([]);
  }

  function gridEditCloseFunction(tableName) {
    setCopyChildValueObj([]);
    setIsGridEdit(!isGridEdit);
  }

  useEffect(() => {
    // Initialize with initial data
    setRenderedData(newState[section.tableName]?.filter(item => item.status !== 0)?.slice(0, 10)); // Initially render 10 items
    setDummyData(newState[section.tableName]?.filter(item => item.status !== 0)?.slice(0, 10)); // Initially render 10 items
  }, [newState]);

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

  useEffect(() => {
    const resizeObserver = new ResizeObserver((entries) => {
      if (entries && entries[0]) {
        const width = Math.floor(entries[0].contentRect.width);
        setContainerWidth(width);
      }
    });

    if (tableRef.current) {
      resizeObserver.observe(tableRef.current);
    }

    return () => {
      resizeObserver.disconnect();
    };
  }, []);

  useEffect(() => {
    const horiScroll = () => {
      const right = Math.round(
        Math.floor(
          tableRef.current?.getBoundingClientRect()?.width +
          tableRef.current?.scrollLeft
        )
      );
      if (tableRef.current?.scrollWidth > tableRef.current?.clientWidth) {
        setTableBodyWidth(`${right - 70}`);
      } else {
        setTableBodyWidth(`0`);
      }
    };

    horiScroll();

    tableRef.current?.addEventListener("scroll", horiScroll);

    return () => {
      tableRef.current?.removeEventListener("scroll", horiScroll);
    };
  }, []);

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
          expandIcon={
            <LightTooltip title={isChildAccordionOpen ? "Collapse" : "Expand"}>
              <ExpandMoreIcon
                sx={{ color: "white" }}
                onClick={() => childExpandedAccordion(indexValue)}
              />
            </LightTooltip>
          }
          id={`panel${indexValue + 1}-header`}
        >
          <Typography
            className="relative right-[11px] text-[12px]"
            color={"white"}
          >
            {section.sectionHeader || section.tableName}
          </Typography>
          {renderedData?.length > 0 && isChildAccordionOpen && (
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
                <LightTooltip title="Save">
                  <SaveOutlinedIcon
                    sx={{
                      marginLeft: "8px",
                      ...gridEditIconStyles,
                    }}
                    onClick={() => {
                      gridEditSaveFunction(section.tableName);
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
          className={`bg-white flex flex-row relative  ${styles.hideScrollbar} ${styles.thinScrollBar}`}
          sx={{
            height: clickCount === 0 ? "2.5rem" : "auto",
            padding: inputFieldsVisible ? "0" : "0",
            width: "100%",
          }}
        >
          <div key={indexValue} className=" w-full ">
            {/* Icon Button on the right */}
            <div className="absolute top-0 right-[3px] flex justify-end">
              {clickCount === 0 && (
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
              <div className="relative flex justify-between  pl-[16px] pt-[8px] pb-[6px]">
                <CustomeInputFields
                  inputFieldData={section.fields}
                  onValuesChange={handleFieldChildrenValuesChange}
                  values={childObject}
                  filterData={filterData}
                  getLabelValue={getLabelValue}
                  newState={newState}
                />
                <div className=" md:ml-20 relative top-0 right-2 flex justify-end items-baseline">
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
                    title={"Save"}
                    onClick={() => {
                      childButtonHandler(section, indexValue);
                    }}
                  />
                </div>
              </div>
            )}

            {newState[section.tableName] && Array.isArray(newState[section.tableName]) &&
              newState[section.tableName].filter((item) => item.status !== 0).length > 0 && (
                <>
                  {/* Table grid view Section at bottom*/}
                  <div
                    className={`${inputFieldsVisible ? "" : ""} ${styles.pageBackground
                      }`}
                  >
                    <TableContainer
                      component={Paper}
                      ref={tableRef}
                      onScroll={handleScroll}
                      className={`${styles.hideScrollbar} ${styles.thinScrollBar} ${styles.pageBackground} `}
                      sx={{
                        height:
                          newState[section.tableName]?.length > 10
                            ? "290px"
                            : "auto",
                        overflowY:
                          newState[section.tableName]?.length > 10
                            ? "auto"
                            : "hidden",
                      }}
                    >
                      <Table
                        aria-label="sticky table"
                        className="w-[fit-content] min-w-[100%]"
                        stickyHeader
                      >
                        <TableHead className="">
                          <TableRow>
                            {section.fields
                              .filter((elem) => elem.isGridView)
                              .map((field, index) => (
                                <TableCell
                                  key={index}
                                  className={`${styles.cellHeading}  cursor-pointer `}
                                  sx={{
                                    ...childTableHeaderStyle,
                                  }}
                                  onContextMenu={(event) =>
                                    handleRightClick(
                                      event,
                                      field.fieldname,
                                      section,
                                      section.fields
                                    )
                                  } // Add the right-click handler here
                                  align="left"
                                  onClick={() => {
                                    handleSortBy(field.fieldname);
                                  }}
                                >
                                  {index === 0 && (
                                    <HoverIcon
                                      defaultIcon={addLogo}
                                      hoverIcon={plusIconHover}
                                      altText={"Add"}
                                      title={"Add"}
                                      onClick={() => {
                                        inputFieldsVisible == false &&
                                          setInputFieldsVisible(
                                            (prev) => !prev
                                          );
                                      }}
                                    />
                                  )}
                                  <span
                                    className={`${styles.labelText}`}
                                    style={{
                                      paddingLeft: isGridEdit ? "0px" : "0px",
                                    }}
                                  >
                                    {field.yourlabel}
                                  </span>
                                  <span>
                                    {isInputVisible &&
                                      activeColumn === field.fieldname && ( // Conditionally render the input
                                        <CustomizedInputBase
                                          columnData={field}
                                          setPrevSearchInput={
                                            setPrevSearchInput
                                          }
                                          prevSearchInput={prevSearchInput}
                                          controlerName={field.controlname}
                                        />
                                      )}
                                  </span>
                                  <span className="ml-1">
                                    {renderSortIcon(field.fieldname)}
                                  </span>
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
                              setRenderedData={setRenderedData}
                              deleteChildRecord={deleteChildRecord}
                              isGridEdit={isGridEdit}
                              setIsGridEdit={setIsGridEdit}
                              copyChildValueObj={copyChildValueObj}
                              setCopyChildValueObj={setCopyChildValueObj}
                              filterData={filterData}
                              containerWidth={containerWidth}
                              editMode={editMode}
                              tableBodyWidhth={tableBodyWidhth}
                            />
                          ))}
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
