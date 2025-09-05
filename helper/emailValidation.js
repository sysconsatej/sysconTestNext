const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;

import {
  fetchReportData,
  fetchReportDataExcel,
} from "@/services/auth/FormControl.services.js";
import { getUserDetails } from "@/helper/userDetails";

const { clientId } = getUserDetails();
const { userId } = getUserDetails();
const { branchId } = getUserDetails();
const { emailId } = getUserDetails();
const allErrors = [];
// Function to Fetch Data
const fetchTableData = async (requestBody) => {
  try {
    const response = await fetch(
      `${baseUrl}/api/validations/formControlValidation/fetchProjectedData`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      }
    );

    if (!response.ok) {
      const errorResponse = await response.json();
      console.error("Server responded with an error:", errorResponse);
      throw new Error(
        `Server error: ${response.status} ${response.statusText}`
      );
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Fetch error:", error);
    throw new Error("Failed to fetch data from the server");
  }
};

// Main Function
const handleExcelUploadFunc = async (fetchedData, newState, isNested) => {
  //const jsonData = newState.excelUploads;
  const jsonData = newState?.excelUploads.map((item,index)=>({
    ...item,
    rowNo:index === 0 ? index+2 : index + 2
  }));

  const menuId = fetchedData;

  const requestBodyToFetchTableData = {
    columns: `el.*,md.code AS 'language',ISNULL((SELECT ef.* FROM tblExcelFields ef LEFT JOIN tblExcelLanguage el_inner ON el_inner.id = ef.excelLanguageId WHERE ef.excelLanguageId = el.id AND ef.status = 1 AND el.clientId IN (${clientId},(SELECT id FROM tblClient WHERE clientCode = 'SYSCON')) FOR JSON PATH, INCLUDE_NULL_VALUES),'[]') AS 'tblExcelFields'`,
    tableName:
      "tblExcelLanguage el LEFT JOIN tblMasterData md ON md.id = el.languageId",
    whereCondition: `el.menuId = ${menuId} and el.status = 1`,
    clientIdCondition: `el.clientId in (${clientId},(Select id from tblClient where clientCode = 'SYSCON')) FOR JSON PATH`,
  };

  const profileLanguage = "EN";
  const tblExcelUploadLanguageData = await fetchReportDataExcel(
    requestBodyToFetchTableData
  );

  const mainJson = tblExcelUploadLanguageData.data[0];
  if(!mainJson){
    console.log("mainJson not found");
    console.log("jsonData", jsonData);
    allErrors.push([]);
    return allErrors;
  }
  //const strFunctionName = mainJson.functionName;
  isNested = false; //mainJson.isNested;

  if (mainJson.language.trim() === profileLanguage) {
    console.log(`Language: ${mainJson.languageId}`);
    const excelFieldsArray = mainJson.tblExcelFields.map((field) => ({
      sourceColumnName: field.sourceColumnName,
      isRequired: field.isRequired,
      dataType: field.dataType,
      dataLen: field.dataLen,
      masterValidation: field.masterValidation,
      dependentTable: field.dependentTable,
      dependentColumn: field.dependentColumn,
      masterTable: field.masterTable,
      isDuplicate: field.isDuplicate,
      textCaseType: field.textCaseType,
      checkSpecialCharacter: field.checkSpecialCharacter,
      specialCharacters: field.specialCharacters,
      destinationTable: field.destinationTable,
      destinationColumn: field.destinationColumn,
    }));

    const allErrors = await collectValidationErrors(excelFieldsArray, jsonData);
    handleTextCaseConversion(jsonData, excelFieldsArray);

    // Get the result from validateMasterValues
    const {
      errors,
      newJsonData,
      objectIds: filteredObjectIds,
    } = await validateMasterValues(excelFieldsArray, jsonData, isNested);

    // Merge allErrors from validateMasterValues with other validation errors
    allErrors.push(...errors);

    return { jsonData, allErrors, filteredObjectIds }; // Return jsonData, allErrors, and filteredObjectIds
  } else {
    console.log(`Language '${profileLanguage}' not found.`);
  }
};

// Function to collect all validation errors
const collectValidationErrors = async (excelFieldsArray, jsonData) => {
  //const allErrors = [];

  const requiredValidationErrors = validateRequiredFields(
    excelFieldsArray,
    jsonData
  );
  allErrors.push(...requiredValidationErrors);

  const duplicateValidationErrors = validateDuplicateFields(
    excelFieldsArray,
    jsonData
  );
  allErrors.push(...duplicateValidationErrors);

  const dataTypeValidationErrors = validateDataTypeFields(
    excelFieldsArray,
    jsonData
  );
  allErrors.push(...dataTypeValidationErrors);

  const lengthValidationErrors = validateLengthFields(
    excelFieldsArray,
    jsonData
  );
  allErrors.push(...lengthValidationErrors);

  const specialCharactersValidationErrors = validateSpecialCharactersFields(
    excelFieldsArray,
    jsonData
  );
  allErrors.push(...specialCharactersValidationErrors);

  const masterValuesValidationErrors = await validateMasterValues(
    excelFieldsArray,
    jsonData
  );
  allErrors.push(...masterValuesValidationErrors.errors);

  return allErrors;
};

// Function to handle to check Required Field
const validateRequiredFields = (excelFieldsArray, jsonData) => {
  const errors = [];
  jsonData.forEach((data, index) => {
    excelFieldsArray.forEach((field) => {
      if (field.isRequired === "true") {
        const value = data[field.sourceColumnName];
        if (
          value === undefined ||
          value === null ||
          value.toString().trim() === ""
        ) {
          errors.push({
            row: index + 2,
            message: `The field '${
              field.sourceColumnName
            }' is required but is ${
              value === undefined ? "missing" : "empty"
            }.`,
          });
        }
      }
    });
  });

  return errors;
};

// Function to handle to check Duplicate Field
const validateDuplicateFields = (excelFieldsArray, jsonData) => {
  const errors = [];
  excelFieldsArray.forEach((field) => {
    if (field.isDuplicate === "y") {
      const values = new Set();
      jsonData.forEach((data, index) => {
        const value = data[field.sourceColumnName];
        if (value !== undefined && value !== null) {
          const lowerCaseValue = value.toString().toLowerCase(); // Ensure value is a string before calling toLowerCase
          if (values.has(lowerCaseValue)) {
            errors.push({
              row: index + 2,
              message: `The value '${value}' in field '${field.sourceColumnName}' is a duplicate.`,
            });
          } else {
            values.add(lowerCaseValue);
          }
        }
      });
    }
  });

  return errors;
};

// Function to handle data type validation
const validateDataTypeFields = (excelFieldsArray, jsonData) => {
  const errors = [];
  excelFieldsArray.forEach((field) => {
    if (field.dataType) {
      const dataType = field.dataType.toLowerCase();

      jsonData.forEach((data, index) => {
        const value = data[field.sourceColumnName];
        if (value !== undefined && value !== null) {
          const isValid = validateDataType(value, dataType);
          if (!isValid) {
            errors.push({
              row: index + 2,
              message: `The value '${value}' in field '${field.sourceColumnName}' is not of type '${dataType}'.`,
            });
          }
        }
      });
    }
  });

  return errors;
};

// Function to validate custom date format
const validateCustomDateFormat = (value, customFormat) => {
  const regex = /^\d{2}-\d{2}-\d{4}$/; // Regular expression for "dd-MM-yyyy" format
  return regex.test(value);
};

// Function to handle data type validation with custom date format
const validateDataType = (value, dataType, customFormat) => {
  switch (dataType) {
    case "string":
      return typeof value === "string";
    case "number":
      return typeof value === "number" || !isNaN(parseFloat(value));
    case "boolean":
      return typeof value === "boolean";
    case "date":
      if (customFormat) {
        // If a custom date format is specified, use custom format validation
        return validateCustomDateFormat(value, customFormat);
      } else {
        // Otherwise, use standard date parsing
        return !isNaN(Date.parse(value));
      }
    default:
      return true; // If unknown data type, consider it valid
  }
};

// Function to handle text case conversion
function handleTextCaseConversion(jsonData, excelFieldsArray) {
  jsonData.forEach((data) => {
    excelFieldsArray.forEach((field) => {
      const value = data[field.sourceColumnName];
      if (value !== undefined && value !== null) {
        // Check if value is defined
        if (field.textCaseType === "lowercase") {
          if (typeof value === "string") {
            data[field.sourceColumnName] = value.toLowerCase();
          }
        } else if (field.textCaseType === "uppercase") {
          if (typeof value === "string") {
            data[field.sourceColumnName] = value.toUpperCase();
          }
        } else if (
          field.textCaseType === "none" ||
          field.textCaseType === null
        ) {
          // Do nothing or handle null/none case
          // You might add additional handling for other cases
        }
      } else {
        // Handle case where value is undefined or null
        // This could involve setting a default value or logging an error
      }
    });
  });
}

// Function to handle length validation
const validateLengthFields = (excelFieldsArray, jsonData) => {
  const errors = [];

  excelFieldsArray.forEach((field) => {
    if (field.dataLen) {
      const maxLength = parseInt(field.dataLen, 10);
      jsonData.forEach((data, index) => {
        const value = data[field.sourceColumnName];
        if (
          value !== undefined &&
          value !== null &&
          value.toString().length > maxLength
        ) {
          errors.push({
            row: index + 2,
            message: `The value '${value}' in field '${field.sourceColumnName}' exceeds the maximum length of ${maxLength}.`,
          });
        }
      });
    }
  });

  return errors;
};

// Function to handle special character validation
const validateSpecialCharactersFields = (excelFieldsArray, jsonData) => {
  const errors = [];

  excelFieldsArray.forEach((field) => {
    if (field.checkSpecialCharacter === "y") {
      const specialChars = field.specialCharacters
        ? field.specialCharacters.split(",")
        : [
            "!",
            "@",
            "#",
            "$",
            "%",
            "^",
            "&",
            "*",
            "(",
            ")",
            "-",
            "=",
            "+",
            "[",
            "]",
            "{",
            "}",
            "|",
            "\\",
            ":",
            ";",
            '"',
            "'",
            "<",
            ">",
            ",",
            ".",
            "?",
            "/",
          ];
      const specialCharsRegex = new RegExp(
        `[${specialChars.map((char) => `\\${char}`).join("")}]`,
        "g"
      );

      jsonData.forEach((data, index) => {
        const value = data[field.sourceColumnName];
        if (value !== undefined && value !== null) {
          const matches = value.toString().match(specialCharsRegex);
          if (matches) {
            errors.push({
              row: index + 2,
              message: `The value '${value}' in field '${
                field.sourceColumnName
              }' contains special characters: ${matches.join(", ")}.`,
            });
          }
        }
      });
    }
  });

  return errors;
};
// Define validateMasterValues for nested processing
const validateMasterValuesNested = async (excelFieldsArray, jsonData) => {
  const errors = [];
  const newJsonData = JSON.parse(JSON.stringify(jsonData)); // Deep copy of jsonData
  const combinedObjectIds = {}; // Object to store combined objects with all fields

  // Helper function to fetch table data with error handling
  const fetchTableDataWithLogging = async (requestBody) => {
    try {
      const response = await fetchTableData(requestBody);
      return response;
    } catch (error) {
      console.error("Error fetching data from server:", error);
      throw new Error("Failed to fetch data from the server");
    }
  };

  // Iterate through each field that requires master validation
  for (const field of excelFieldsArray) {
    // Initialize field mappings
    const fieldMap = {};

    if (field.masterValidation === "y") {
      try {
        // Iterate through each value in jsonData for the current field
        for (const data of jsonData) {
          const value = data[field.sourceColumnName];

          // Skip fetching object ID if value is null or undefined
          if (value === undefined || value === null) {
            newJsonData.forEach((item, index) => {
              if (item[field.sourceColumnName] === value) {
                if (!fieldMap[index]) {
                  fieldMap[index] = {};
                }
                fieldMap[index][field.destinationColumn] = null;
              }
            });
            continue;
          }

          // Construct request body for each value
          const regexPattern = `^${value.replace(
            /[.*+?^${}()|[\]\\]/g,
            "\\$&"
          )}$`; // Escape parentheses
          let requestBodyForMasterValue = null;
          if (field.masterTable === null || field.masterTable === "") {
            requestBodyForMasterValue = {
              tableName: field.dependentTable,
              whereCondition: {
                [field.dependentColumn]: {
                  $regex: regexPattern,
                  $options: "i",
                },
                status: 1,
              },
              projection: {},
            };
          } else {
            const masterRequestBody = {
              tableName: "tblMasterList",
              whereCondition: {
                name: field.masterTable,
                status: 1,
              },
              projection: {},
            };

            const masterDataResponse = await fetchTableDataWithLogging(
              masterRequestBody
            );
            let masterTableId = null;
            if (masterDataResponse.data.length > 0) {
              masterTableId = masterDataResponse.data[0]._id;
            }

            requestBodyForMasterValue = {
              tableName: field.dependentTable,
              whereCondition: {
                [field.dependentColumn]: {
                  $regex: regexPattern,
                  $options: "i",
                },
                tblMasterListId: masterTableId,
                status: 1,
              },
            };
          }

          const response = await fetchTableDataWithLogging(
            requestBodyForMasterValue
          );
          const validValues = response.data; // Assume response.data is an array of objects with 'id' and 'value' properties

          // Check if the value exists in the valid values
          const validEntry = validValues.find((entry) => {
            const entryValue = entry[field.dependentColumn]?.toLowerCase(); // Access the property dynamically and convert to lowercase
            const targetValue = value.toLowerCase(); // Lowercase the target value for comparison
            return entryValue === targetValue;
          });

          // Collect all object IDs in the map
          newJsonData.forEach((item, index) => {
            if (
              item[field.sourceColumnName]?.toLowerCase() ===
              value.toLowerCase()
            ) {
              const objectId = validEntry ? validEntry._id : null;
              if (!fieldMap[index]) {
                fieldMap[index] = {};
              }
              fieldMap[index][field.destinationColumn] = objectId;
            }
          });

          if (!validEntry) {
            errors.push({
              row: jsonData.indexOf(data) + 2,
              message: `The value '${value}' in field '${field.sourceColumnName}' is not a valid master value.`,
            });
          }
        }
      } catch (error) {
        console.error("Error fetching master values:", error);
        newJsonData.forEach((item, index) => {
          if (!fieldMap[index]) {
            fieldMap[index] = {};
          }
          fieldMap[index][field.destinationColumn] = null;
        });
        errors.push({
          row: -1,
          message: `Error fetching master values for field '${field.sourceColumnName}'.`,
        });
      }
    } else if (field.masterValidation === "n") {
      // Directly add non-validated fields
      newJsonData.forEach((item, index) => {
        const value = item[field.sourceColumnName];
        if (!fieldMap[index]) {
          fieldMap[index] = {};
        }
        fieldMap[index][field.destinationColumn] = value;
      });
    }

    // Merge fieldMap into combinedObjectIds
    for (const [index, fields] of Object.entries(fieldMap)) {
      const destinationTableParts = field.destinationTable.split(".");
      const rootTable = destinationTableParts[0];
      const nestedTable = destinationTableParts[1];

      if (!combinedObjectIds[index]) {
        combinedObjectIds[index] = { tableName: rootTable };
      }

      if (nestedTable) {
        if (!combinedObjectIds[index][nestedTable]) {
          combinedObjectIds[index][nestedTable] = [{}];
        }
        // Merge fields into a single object
        const detailObject = combinedObjectIds[index][nestedTable][0]; // Ensure the fields are added to the same object
        Object.assign(detailObject, fields);
      } else {
        Object.assign(combinedObjectIds[index], fields);
      }
    }
  }

  // Convert combinedObjectIds back to an array
  const mergedObjectIds = Object.values(combinedObjectIds).reduce(
    (acc, curr) => {
      const existing = acc.find(
        (item) => item.tableName === curr.tableName && item.code === curr.code
      );
      if (existing) {
        for (const key in curr) {
          if (Array.isArray(curr[key])) {
            existing[key] = existing[key] || [];
            existing[key].push(...curr[key]);
          } else {
            existing[key] = curr[key];
          }
        }
      } else {
        acc.push(curr);
      }
      return acc;
    },
    []
  );

  // Remove entries that do not have any values (i.e., all fields are null)
  const filteredObjectIds = mergedObjectIds.filter(
    (obj) => Object.keys(obj).length > 1
  );

  // Log all collected formatted object IDs for debugging
  console.log("All Combined Object IDs - ", filteredObjectIds);

  return { errors, newJsonData, objectIds: filteredObjectIds };
};

// Define validateMasterValues for non-nested processing
const validateMasterValuesNonNested = async (excelFieldsArray, jsonData) => {
  const errors = [];
  const newJsonData = JSON.parse(JSON.stringify(jsonData)); // Deep copy of jsonData
  const combinedObjectIds = {}; // Object to store combined objects with all fields

  // Helper function to fetch table data with error handling
  const fetchTableDataWithLogging = async (requestBody) => {
    try {
      const response = await fetchTableData(requestBody);
      return response;
    } catch (error) {
      console.error("Error fetching data from server:", error);
      throw new Error("Failed to fetch data from the server");
    }
  };

  // Iterate through each field that requires master validation
  for (const field of excelFieldsArray) {
    // Initialize field mappings
    const fieldMap = {};

    if (field.masterValidation === "y") {
      try {
        // Iterate through each value in jsonData for the current field
        for (const data of jsonData) {
          const value = data[field.sourceColumnName];

          // Skip fetching object ID if value is null or undefined
          if (value === undefined || value === null) {
            newJsonData.forEach((item, index) => {
              if (item[field.sourceColumnName] === value) {
                if (!fieldMap[index]) {
                  fieldMap[index] = {};
                }
                fieldMap[index][field.destinationColumn] = null;
              }
            });
            continue;
          }

          // Construct request body for each value
          const regexPattern = `^${value.replace(
            /[.*+?^${}()|[\]\\]/g,
            "\\$&"
          )}$`; // Escape parentheses
          let requestBodyForMasterValue = null;
          if (field.masterTable === null || field.masterTable === "") {
            requestBodyForMasterValue = {
              tableName: field.dependentTable,
              whereCondition: {
                [field.dependentColumn]: {
                  $regex: regexPattern,
                  $options: "i",
                },
                status: 1,
              },
              projection: {},
            };
          } else {
            const masterRequestBody = {
              tableName: "tblMasterList",
              whereCondition: {
                name: field.masterTable,
                status: 1,
              },
              projection: {},
            };

            const masterDataResponse = await fetchTableDataWithLogging(
              masterRequestBody
            );
            let masterTableId = null;
            if (masterDataResponse.data.length > 0) {
              masterTableId = masterDataResponse.data[0]._id;
            }

            requestBodyForMasterValue = {
              tableName: field.dependentTable,
              whereCondition: {
                [field.dependentColumn]: {
                  $regex: regexPattern,
                  $options: "i",
                },
                tblMasterListId: masterTableId,
                status: 1,
              },
              projection: {},
            };
          }

          const response = await fetchTableDataWithLogging(
            requestBodyForMasterValue
          );
          const validValues = response.data; // Assume response.data is an array of objects with 'id' and 'value' properties

          // Check if the value exists in the valid values
          const validEntry = validValues.find((entry) => {
            const entryValue = entry[field.dependentColumn]?.toLowerCase(); // Access the property dynamically and convert to lowercase
            const targetValue = value.toLowerCase(); // Lowercase the target value for comparison
            return entryValue === targetValue;
          });

          // Collect all object IDs in the map
          newJsonData.forEach((item, index) => {
            if (
              item[field.sourceColumnName]?.toLowerCase() ===
              value.toLowerCase()
            ) {
              const objectId = validEntry ? validEntry._id : null;
              if (!fieldMap[index]) {
                fieldMap[index] = {};
              }
              fieldMap[index][field.destinationColumn] = objectId;
            }
          });

          if (!validEntry) {
            errors.push({
              row: jsonData.indexOf(data) + 2,
              message: `The value '${value}' in field '${field.sourceColumnName}' is not a valid master value.`,
            });
          }
        }
      } catch (error) {
        console.error("Error fetching master values:", error);
        newJsonData.forEach((item, index) => {
          if (!fieldMap[index]) {
            fieldMap[index] = {};
          }
          fieldMap[index][field.destinationColumn] = null;
        });
        errors.push({
          row: -1,
          message: `Error fetching master values for field '${field.sourceColumnName}'.`,
        });
      }
    } else if (field.masterValidation === "n") {
      // Directly add non-validated fields
      newJsonData.forEach((item, index) => {
        const value = item[field.sourceColumnName];
        if (!fieldMap[index]) {
          fieldMap[index] = {};
        }
        fieldMap[index][field.destinationColumn] = value;
      });
    }

    // Merge fieldMap into combinedObjectIds
    for (const [index, fields] of Object.entries(fieldMap)) {
      const destinationTableParts = field.destinationTable.split(".");
      const rootTable = destinationTableParts[0];
      const nestedTable = destinationTableParts[1];

      if (!combinedObjectIds[index]) {
        combinedObjectIds[index] = {
          tableName: rootTable,
          status: 0,
          clientId: clientId,
          createdBy: userId,
        };
      }

      if (nestedTable) {
        if (!combinedObjectIds[index][nestedTable]) {
          combinedObjectIds[index][nestedTable] = [];
        }
        combinedObjectIds[index][nestedTable].push(fields);
      } else {
        Object.assign(combinedObjectIds[index], fields);
      }
    }
  }

  // Convert combinedObjectIds back to an array
  const mergedObjectIds = Object.values(combinedObjectIds);

  // Log all collected formatted object IDs for debugging
  console.log("All Combined Object IDs - ", mergedObjectIds);

  return { errors, newJsonData, objectIds: mergedObjectIds };
};
const validateMasterValues = async (excelFieldsArray, jsonData, isNested) => {
  if (isNested) {
    return await validateMasterValuesNested(excelFieldsArray, jsonData);
  } else {
    return await validateMasterValuesNonNested(excelFieldsArray, jsonData);
  }
};

// Export all functions
export { handleExcelUploadFunc };
