/* eslint-disable */
import React, { useEffect, useState } from "react";
import "./Sidebar.css";
import {
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  CircularProgress,
  Button,
  TextField,
} from "@mui/material";
import { fetchReportData } from "@/services/auth/FormControl.services";
import { decrypt } from "@/helper/security";

const Sidebar = ({ onDragStart, onSelectChange }) => {
  const [selectedReport, setSelectedReport] = useState({
    reportType: "",
    apiPath: "",
  });
  const [keys, setKeys] = useState([]);
  const [loading, setLoading] = useState(false);
  const [options, setOptions] = useState([]);
  const [fetchingOptions, setFetchingOptions] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const fetchReportName = async () => {
      const storedUserData = localStorage.getItem("userData");
      if (storedUserData) {
        const decryptedData = decrypt(storedUserData);
        const userData = JSON.parse(decryptedData);
        const clientId = userData[0].clientId;
        const requestBody = {
          columns: "id,apiName,apiLabel",
          tableName: "tblApiDefinition",
          whereCondition: "status = 1",
          clientIdCondition: `clientId = ${clientId}  FOR JSON PATH`,
        };
        try {
          const data = await fetchReportData(requestBody);
          if (data) {
            setOptions(data.data);
          } else {
            console.error("Error in response:", data.message);
          }
        } catch (error) {
          console.error("Error fetching report types:", error);
        } finally {
          setFetchingOptions(false);
        }
      }
    };
    fetchReportName();
  }, []);

  const handleDragStart = (event, key) => {
    let formattedKey = key;
    if (key.includes(".")) {
      formattedKey = key.replace(".", "[0].");
    }
    event.dataTransfer.setData("text/plain", `{${formattedKey}}`);
    if (onDragStart) onDragStart(formattedKey);
  };

  const handleChange = (event) => {
    const selectedValue = event.target.value;
    const selectedOption = options.find(
      (option) => option.id === selectedValue
    );
    const reportType = selectedOption ? selectedOption.id : "";
    const apiPath = selectedOption ? selectedOption.apiName : "";

    setSelectedReport({ reportType, apiPath });

    if (onSelectChange) {
      onSelectChange({ reportType, apiPath });
    }
  };

  const handleGoClick = async () => {
    if (selectedReport.reportType) {
      const storedUserData = localStorage.getItem("userData");
      if (storedUserData) {
        const decryptedData = decrypt(storedUserData);
        const userData = JSON.parse(decryptedData);
        const clientId = userData[0].clientId;
        const requestBody = {
          columns: "AF.fieldname",
          tableName:
            "tblApiDefinition AD Left join tblApiFields AF on AF.apiDefinitionId = AD.id",
          whereCondition: `AD.status = 1 And  AF.apiDefinitionId = ${selectedReport.reportType}`,
          clientIdCondition: `AD.status = 1 and AF.status = 1 FOR JSON PATH`,
        };
        try {
          const data = await fetchReportData(requestBody);
          if (data) {
            console.log("fieldname data", data);
            const fieldNames = data.data.map((field) => field.fieldname);
            fieldNames.push("headerImage");
            fieldNames.push("serialNo");
            fieldNames.push("PrintedBy");
            fieldNames.push("PrintedOn");
            fieldNames.push("ownCompanyName");
            setKeys(fieldNames);
          } else {
            console.error("Error in response:", data.message);
          }
        } catch (error) {
          console.error("Error fetching report types:", error);
        }
      }
    } else {
      alert("Please select a report type.");
    }
  };

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };

  const filteredKeys = keys.filter((key) =>
    key.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="sidebar">
      <FormControl
        fullWidth
        variant="outlined"
        sx={{ marginBottom: "15px", marginTop: "15px" }}
      >
        <InputLabel
          id="report-type-select-label"
          className="mt-3"
          sx={{ fontSize: "12px !important" }}
        >
          Report Name
        </InputLabel>
        {fetchingOptions ? (
          <CircularProgress />
        ) : (
          <Select
            className="mt-5"
            labelId="report-type-select-label"
            id="report-type-select"
            size="small"
            value={selectedReport.reportType}
            label="Report Name"
            onChange={handleChange}
            sx={{
              height: "32px",
              ".MuiSelect-select": {
                fontSize: "12px", // Adjust font size as needed
              },
              "& .MuiSvgIcon-root": {
                fontSize: "12px", // Adjusts the dropdown icon size if needed
              },
              // Custom scrollbar styles already confirmed to work
            }}
            MenuProps={{
              PaperProps: {
                style: {
                  maxHeight: 250, // Reduced max height of dropdown menu
                  width: 150, // Adjust the width of the dropdown
                },
              },
            }}
          >
            <MenuItem
              value=""
              sx={{
                fontSize: "12px", // Reduces the font size of the menu items
                minHeight: "none", // Optional: removes the minimum height of menu items
                padding: "4px 10px", // Adjust padding to reduce the overall height per item
              }}
            >
              Select
            </MenuItem>
            {options.map((option) => (
              <MenuItem
                key={option.id}
                value={option.id}
                sx={{
                  fontSize: "12px", // Reduces the font size of the menu items
                  minHeight: "none", // Optional: removes the minimum height of menu items
                  padding: "4px 10px", // Adjust padding to reduce the overall height per item
                }}
              >
                {option.apiLabel}
              </MenuItem>
            ))}
          </Select>
        )}
      </FormControl>

      <Button
        variant="contained"
        color="primary"
        className="px-5 py-2 text-xs font-medium text-center text-white bg-blue-700 rounded-lg focus:ring-4 focus:ring-blue-200 dark:focus:ring-blue-900 hover:bg-blue-800"
        onClick={handleGoClick}
        sx={{ marginBottom: "20px" }}
      >
        Go
      </Button>

      <TextField
        id="search-box"
        label="Search Fields"
        variant="outlined"
        size="small"
        className="search-box"
        type="text"
        sx={{
          "& .MuiOutlinedInput-input": {
            padding: "0px 14px !important",
            height: "20px !important",
            fontSize: "12px !important",
          },
          "& .MuiInputLabel-root": {
            fontSize: "12px !important",
            top: "-6px",
            backgroundColor: "#fff",
            padding: "0 4px",
          },
          "& .MuiOutlinedInput-root": {
            height: "32px",
            alignItems: "center",
          },
        }}
        value={searchTerm}
        onChange={handleSearchChange}
        fullWidth
      />

      <h1 className="Fields font-bold text-xs">Field Explorer :</h1>
      {loading ? (
        <CircularProgress />
      ) : (
        <ul className="scrollable-list">
          {filteredKeys.map((key, index) => {
            let displayKey = key;
            if (key.includes(".")) {
              displayKey = key.replace(".", "[0].");
            }
            return (
              <li
                key={index}
                draggable
                onDragStart={(event) => handleDragStart(event, key)}
                className="draggable-item"
              >
                {`{${displayKey}}`}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
};

export default Sidebar;
