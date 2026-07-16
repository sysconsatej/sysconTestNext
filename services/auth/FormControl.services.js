"use client";
/* eslint-disable */
const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;
const baseUrlSQl = process.env.NEXT_PUBLIC_BASE_URL_SQL;
const aiReadingbaseUrlSQl = process.env.NEXT_PUBLIC_AI_READING_BASE_URL;
import { decrypt, encrypt } from "@/helper/security";
import { getUserDetails } from "@/helper/userDetails";
import { menu } from "@material-tailwind/react";

function normalizeSqlSortOrder(order) {
  if (order === 1 || order === "1") return "ASC";
  if (order === -1 || order === "-1") return "DESC";

  if (typeof order === "string") {
    const normalized = order.trim().toLowerCase();
    if (normalized === "asc" || normalized === "ascending") return "ASC";
    if (normalized === "desc" || normalized === "descending") return "DESC";
  }

  return order;
}

function hasSortRequest(data) {
  return Boolean(data?.label && data?.order !== "" && data?.order != null);
}

function sortComparableValue(value) {
  if (value == null) return "";

  if (Array.isArray(value)) {
    return sortComparableValue(value[0]);
  }

  if (typeof value === "object") {
    return sortComparableValue(
      value.label ?? value.name ?? value.value ?? value.id ?? JSON.stringify(value),
    );
  }

  const dateValue = Date.parse(value);
  if (!Number.isNaN(dateValue) && String(value).match(/\d{1,4}[-/]\d{1,2}[-/]\d{1,4}/)) {
    return dateValue;
  }

  const numericValue = Number(value);
  if (value !== "" && Number.isFinite(numericValue)) {
    return numericValue;
  }

  return String(value).toLowerCase();
}

function applyClientSort(data, label, order) {
  if (!Array.isArray(data) || !label) return data;

  const direction = String(normalizeSqlSortOrder(order)).toUpperCase() === "DESC" ? -1 : 1;

  return [...data].sort((a, b) => {
    const valueA = sortComparableValue(a?.[label]);
    const valueB = sortComparableValue(b?.[label]);

    if (valueA < valueB) return -1 * direction;
    if (valueA > valueB) return 1 * direction;
    return 0;
  });
}

/**
 * Fetches data from the API with caching. The cache expires after 30 seconds.
 * @param {string} url - The endpoint URL.
 * @param {Object} options - Fetch options including method, headers, and body.
 * @param {string} cacheKey - Unique key to store the response in the cache.
 * @returns {Promise<Object>} - The API response, either from the cache or fetched anew.
 */
/**
 * @type {string}
 */

export async function masterTableList(data) {
  // masterTableList
  const { userTypeId } = getUserDetails();
  try {
    const sortRequested = hasSortRequest(data);
    const normalizedOrder = normalizeSqlSortOrder(data?.order);
    let insertedData = {
      ...data,
      label: sortRequested ? "" : data?.label || "",
      order: sortRequested ? "" : data?.label ? normalizedOrder : "",
      loginCompany: sessionStorage.getItem("companyId"),
      loginBranch: sessionStorage.getItem("branchId"),
      loginfinYear: sessionStorage.getItem("financialYear"),
      userTypeId: userTypeId,
    };
    const token = localStorage.getItem("token");
    const response = await fetch(`${baseUrlSQl}/api/master/dytablelist`, {
      method: "POST",
      // credentials: "include",
      headers: {
        "Content-Type": "application/json",
        "x-access-token": JSON.parse(token),
      },
      body: JSON.stringify(insertedData),
    }).then((response) => response.json());

    if (sortRequested && response?.data?.length) {
      return {
        ...response,
        data: applyClientSort(response.data, data.label, normalizedOrder),
      };
    }

    if (sortRequested && !response?.data?.length) {
      const retryData = { ...insertedData, label: "", order: "" };
      const retryResponse = await fetch(`${baseUrlSQl}/api/master/dytablelist`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-access-token": JSON.parse(token),
        },
        body: JSON.stringify(retryData),
      }).then((response) => response.json());

      if (retryResponse?.data?.length) {
        return {
          ...retryResponse,
          data: applyClientSort(retryResponse.data, data.label, normalizedOrder),
        };
      }
    }

    return response;
  } catch (error) {
    console.log(error);
    console.error(error);
    return false;
  }
}
export async function fetchSearchPageData(data) {
  // masterTableList
  try {
    let insertedData = {
      ...data,
      companyId: sessionStorage.getItem("companyId"),
      companyBranchId: sessionStorage.getItem("branchId"),
      financialYearId: sessionStorage.getItem("financialYear"),
    };
    const token = localStorage.getItem("token");
    const response = await fetch(
      `${baseUrlSQl}/api/master/fetchVoucherSearchPageData`,
      {
        method: "POST",
        // credentials: "include",
        headers: {
          "Content-Type": "application/json",
          "x-access-token": JSON.parse(token),
        },
        body: JSON.stringify(insertedData),
      },
    ).then((response) => response.json());
    return response;
  } catch (error) {
    console.log(error);
    console.error(error);
    return false;
  }
}
export async function fetchBLCreatorSearchPageData(data) {
  // masterTableList
  try {
    let insertedData = {
      ...data,
    };
    const token = localStorage.getItem("token");
    const response = await fetch(
      `${baseUrlSQl}/api/master/fetchBLCreatorSearchpageData`,
      {
        method: "POST",
        // credentials: "include",
        headers: {
          "Content-Type": "application/json",
          "x-access-token": JSON.parse(token),
        },
        body: JSON.stringify(insertedData),
      },
    ).then((response) => response.json());
    return response;
  } catch (error) {
    console.log(error);
    console.error(error);
    return false;
  }
}
export async function fetchVoucherData(data) {
  // masterTableList
  try {
    let insertedData = {
      ...data,
      companyId: sessionStorage.getItem("companyId"),
      companyBranchId: sessionStorage.getItem("branchId"),
      financialYearId: sessionStorage.getItem("financialYear"),
    };
    const token = localStorage.getItem("token");
    const response = await fetch(`${baseUrlSQl}/api/master/fetchVoucherData`, {
      method: "POST",
      // credentials: "include",
      headers: {
        "Content-Type": "application/json",
        "x-access-token": JSON.parse(token),
      },
      body: JSON.stringify(insertedData),
    }).then((response) => response.json());
    return response;
  } catch (error) {
    console.log(error);
    console.error(error);
    return false;
  }
}
// export async function masterTableInfo(data) {
//   try {
//     const token = localStorage.getItem("token");
//     const response = await fetch(`${baseUrlSQl}/api/master/demo`, {
//       method: "POST",
//       headers: {
//         "Content-Type": "application/json",
//         "x-access-token": JSON.parse(token),
//       },
//       body: JSON.stringify(data),
//     }).then((response) => response.json());
//     if (response["success"]) {
//       return response["data"];
//     } else {
//       return false;
//     }
//   } catch (error) {
//     console.error(error);
//     return false;
//   }
// }
export async function masterTableInfo(data) {
  try {
    const token = localStorage.getItem("token");
    const response = await fetch(`${baseUrlSQl}/api/FormControl/dynamicFetch`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-access-token": JSON.parse(token),
      },
      body: JSON.stringify(data),
    }).then((response) => response.json());
    if (response["success"]) {
      return response["data"];
    } else {
      return response;
    }
  } catch (error) {
    console.error(error);
    return false;
  }
}
export async function formControlMenuList(id, defaultFinYearId) {
  try {
    const token = localStorage.getItem("token");
    const response = await fetch(
      `${baseUrlSQl}/api/FormControl/list?menuID=${id}&defaultFinYearId=${defaultFinYearId}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "x-access-token": JSON.parse(token),
        },
      },
    ).then((response) => response.json());
    return response;
  } catch (error) {
    console.error(error);
    return false;
  }
}

export async function handleSubmitApi(data) {
  try {
    const storedUserData = localStorage.getItem("userData");
    const decryptedData = decrypt(storedUserData);
    const userData = JSON.parse(decryptedData);
    const clientId = userData[0].clientId;
    let insertedData = {
      ...data,
      clientId: clientId,
      loginCompany: sessionStorage.getItem("companyId"),
      loginBranch: sessionStorage.getItem("branchId"),
      loginfinYear: sessionStorage.getItem("financialYear"),
    };
    const token = localStorage.getItem("token");
    const response = await fetch(`${baseUrlSQl}/api/insertdata`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-access-token": JSON.parse(token),
      },
      body: JSON.stringify(insertedData),
    }).then((response) => response.json());

    if (response["success"]) {
      return response;
    } else {
      return response;
    }
  } catch (error) {
    console.error(error);
    return false;
  }
}
export async function formControlListing(data) {
  try {
    const token = localStorage.getItem("token");
    const response = await fetch(`${baseUrlSQl}/api/FormControl/FormList`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-access-token": JSON.parse(token),
      },
      body: JSON.stringify(data),
    }).then((response) => response.json());
    return response;
  } catch (error) {
    console.log(error);
    console.error(error);
    return false;
  }
}
export async function deleteFormControlRecord(payloadData) {
  try {
    const token = localStorage.getItem("token");
    const response = await fetch(`${baseUrl}/api/FormControl/Delete`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-access-token": JSON.parse(token),
      },
      body: JSON.stringify(payloadData),
    }).then((response) => response.json());

    if (response["success"]) {
      return response;
    } else {
      return false;
    }
  } catch (error) {
    console.error(error);
    return false;
  }
}
export async function deleteMasterRecord(payloadData) {
  try {
    const token = localStorage.getItem("token");
    const response = await fetch(`${baseUrlSQl}/api/master/Delete`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-access-token": JSON.parse(token),
      },
      body: JSON.stringify(payloadData),
    }).then((response) => response.json());

    if (response["success"]) {
      return response;
    } else {
      return response;
    }
  } catch (error) {
    console.log(error);
    console.error(error);
    return false;
  }
}
export async function dynamicDropDownFieldsData(data) {
  try {
    const storedUserData = localStorage.getItem("userData");
    const decryptedData = decrypt(storedUserData);
    const userData = JSON.parse(decryptedData);
    const clientId = userData[0].clientId;
    const token = localStorage.getItem("token");
    let requestData = { ...data, clientId: clientId };
    const response = await fetch(`${baseUrlSQl}/api/FormControl/DropDownList`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-access-token": JSON.parse(token),
      },
      body: JSON.stringify(requestData),
    }).then((response) => response.json());
    // console.log("dropdown api", response);
    return response;
  } catch (error) {
    console.log(error);
    console.error(error);
    return false;
  }
}
export async function dynamicDropDownFieldsDataCreateForm(data) {
  try {
    // console.log("controller",controller);
    const token = localStorage.getItem("token");
    const response = await fetch(
      `${baseUrlSQl}/api/FormControl/DropDownListCreateForm`,
      {
        // signal: controller?.signal,
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-access-token": JSON.parse(token),
        },
        body: JSON.stringify(data),
      },
    ).then((response) => response.json());
    return response;
  } catch (error) {
    console.log(error);
    console.error(error);
    return false;
  }
}
export async function reportControlListing(id) {
  try {
    const token = localStorage.getItem("token");
    const response = await fetch(`${baseUrl}/api/reportSearchCriteria/list`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-access-token": JSON.parse(token),
      },
      body: JSON.stringify({ menuID: id }),
    }).then((response) => response.json());
    return response;
  } catch (error) {
    console.log(error);
    console.error(error);
    return false;
  }
}
export async function reportSubmitCall(apiUrl, payloadData) {
  try {
    const token = localStorage.getItem("token");
    const response = await fetch(`${baseUrl}${apiUrl}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-access-token": JSON.parse(token),
      },
      body: JSON.stringify(payloadData),
    }).then((response) => response.json());

    return response;
  } catch (error) {
    console.log(error);
    console.error(error);
    return false;
  }
}
export async function DynamicUpdateFieldNames(filterCondition) {
  const removeDropdownFields = (obj) => {
    const newObj = { ...obj };
    Object.keys(newObj).forEach((key) => {
      if (key.endsWith("dropdown")) {
        delete newObj[key];
      }
    });
    return newObj;
  };
  const updateFieldNames = async (filterCondition) => {
    const updatedFilterCondition = { ...filterCondition };

    for (const key in filterCondition) {
      const requestBodyGrid = {
        tableName: "tblApiDefination",
        whereCondition: {
          "apiFields._id": key,
        },
        subchildCondition: {},
        projection: {
          "apiFields.fieldname": 1,
          "apiFields.label": 1,
          "apiFields._id": 1,
        },
      };

      try {
        const data = await fetchDataAPI(requestBodyGrid);
        if (data && data.data && data.data[0] && data.data[0].apiFields) {
          const apiField = data.data[0].apiFields;
          const newFieldName = apiField.fieldname;

          // Add the new fieldname with the old value
          updatedFilterCondition[newFieldName] = updatedFilterCondition[key];
          // Remove the old fieldname
          delete updatedFilterCondition[key];
        } else {
          console.error("No data returned for key:", key);
        }
      } catch (error) {
        console.error("Error fetching report types for key:", key, error);
      }
    }
    return updatedFilterCondition;
  };
  const filterConditionWithoutDropdowns = removeDropdownFields(filterCondition);
  const updatedConditionWithFieldNames = await updateFieldNames(
    filterConditionWithoutDropdowns,
  );
  return updatedConditionWithFieldNames;
}
export async function dynamicReportFilter(
  updatedConditionWithFieldNames,
  clientId,
  spName,
) {
  try {
    const payload = {
      method: "POST",
      filterCondition: { clientId, ...updatedConditionWithFieldNames },
      clientId: clientId,
      spName: spName,
    };

    console.log("payload", payload);

    const response = await fetch(
      `${baseUrl}/api/validations/formControlValidation/fetchAPIData`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      },
    ).then((response) => response.json());
    console;
    return response;
  } catch (error) {
    console.log(error);
    console.error(error);
    return false;
  }
}
export async function htmlReportFilter(
  updatedConditionWithFieldNames,
  clientId,
  spName,
) {
  try {
    const payload = {
      method: "POST",
      filterCondition: { id: updatedConditionWithFieldNames?.id },
      spName: spName,
    };

    console.log("payload", payload);

    const response = await fetch(
      `${baseUrl}/api/validations/formControlValidation/fetchAPIData`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      },
    ).then((response) => response.json());
    console;
    return response;
  } catch (error) {
    console.log(error);
    console.error(error);
    return false;
  }
}
export async function fetchReportAPIData(
  updatedConditionWithFieldNames,
  clientId,
  spName,
) {
  try {
    const payload = {
      method: "POST",
      filterCondition: updatedConditionWithFieldNames,
      clientId: clientId,
      spName: spName,
    };

    console.log("payload", payload);

    const response = await fetch(
      `${baseUrl}/api/validations/formControlValidation/fetchReportAPIData`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      },
    ).then((response) => response.json());
    console;
    return response;
  } catch (error) {
    console.log(error);
    console.error(error);
    return false;
  }
}
export async function fetchDynamicReportSpData(spName, filterCondition) {
  try {
    const payload = {
      filterCondition: filterCondition,
      spName: spName,
    };

    console.log("payload", payload);

    const response = await fetch(
      `${baseUrl}/api/validations/formControlValidation/fetchDynamicReportSpData`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      },
    ).then((response) => response.json());
    console;
    return response;
  } catch (error) {
    console.log(error);
    console.error(error);
    return false;
  }
}
export async function fetchExcelData(spName, filterCondition) {
  try {
    const payload = {
      filterCondition: filterCondition,
      spName: spName,
    };

    console.log("payload", payload);

    const response = await fetch(
      `${baseUrl}/api/validations/formControlValidation/fetchDynamicReportSpData`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      },
    ).then((response) => response.json());
    return response;
  } catch (error) {
    console.log(error);
    console.error(error);
    return false;
  }
}
export async function fetchExcelDataInsert(spName, filterCondition) {
  try {
    const payload = {
      filterCondition: filterCondition,
      spName: spName,
    };

    console.log("payload", payload);

    const response = await fetch(
      `${baseUrl}/api/validations/formControlValidation/insertReportData`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      },
    ).then((response) => response.json());
    return response;
  } catch (error) {
    console.log(error);
    console.error(error);
    return false;
  }
}
export async function rptJobExportSea(data) {
  try {
    const token = localStorage.getItem("token");
    const response = await fetch(`${baseUrl}/api/Reports/job`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-access-token": JSON.parse(token),
      },
      body: JSON.stringify(data),
    }).then((response) => response.json());

    return response;
  } catch (error) {
    console.log(error);
    console.error(error);
    return false;
  }
}
export async function rptSearchCriteria(data) {
  try {
    const token = localStorage.getItem("token");
    const response = await fetch(`${baseUrl}/api/master/demo`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-access-token": JSON.parse(token),
      },
      body: JSON.stringify(data),
    }).then((response) => response.json());

    return response;
  } catch (error) {
    console.log(error);
    console.error(error);
    return false;
  }
}

export async function getCopyData(data) {
  try {
    const token = localStorage.getItem("token");

    if (!token) {
      throw new Error("Token not found in localStorage.");
    }

    const response = await fetch(`${baseUrlSQl}/api/FormControl/getCopyData`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-access-token": JSON.parse(token),
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const responseData = await response.json();

    // Console log the response for debugging
    console.log("API Response:", responseData);

    return responseData;
  } catch (error) {
    console.error("Error in getCopyData:", error);
    return false;
  }
}

export async function uploadFormDocument(data) {
  try {
    const token = localStorage.getItem("token");
    const response = await fetch(`${baseUrlSQl}/api/master/Upload`, {
      method: "POST",
      headers: {
        "x-access-token": JSON.parse(token),
      },
      body: data,
    }).then((response) => response.json());
    return response;
  } catch (error) {
    console.log(error);
    console.error(error);
    return false;
  }
}
export async function getTaxDetails(data) {
  try {
    const token = localStorage.getItem("token");
    const response = await fetch(`${baseUrlSQl}/api/sp/gettingTaxDetails`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-access-token": JSON.parse(token),
      },
      body: JSON.stringify(data),
    }).then((response) => response.json());
    return response;
  } catch (error) {
    console.log(error);
    console.error(error);
    return false;
  }
}
export const fetchDataFromAPI = async (requestBody) => {
  const token = localStorage.getItem("token");
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 seconds timeout

  try {
    const response = await fetch(
      `${baseUrl}/api/validations/formControlValidation/fetchData`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-access-token": JSON.parse(token),
        },
        body: JSON.stringify(requestBody),
        signal: controller.signal,
      },
    );

    clearTimeout(timeoutId); // Clear timeout if fetch completes in time

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log("API response:", data);
    return data;
  } catch (error) {
    if (error.name === "AbortError") {
      console.error("Fetch request timed out");
    } else {
      console.error("Error fetching data from API:", error);
    }
    throw error; // Re-throw the error to be caught in the caller function
  }
};

export async function getTDSDetails(data) {
  try {
    const token = localStorage.getItem("token");
    const companyId = sessionStorage.getItem("companyId");
    data.companyId = companyId;
    const response = await fetch(`${baseUrlSQl}/api/sp/gettingTdsDetails`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-access-token": JSON.parse(token),
      },
      body: JSON.stringify(data),
    }).then((response) => response.json());
    return response;
  } catch (error) {
    console.log(error);
    console.error(error);
    return false;
  }
}
export async function getJobCharge(data) {
  try {
    const token = localStorage.getItem("token");
    const response = await fetch(`${baseUrl}/api/sp/getJobDetails`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-access-token": JSON.parse(token),
      },
      body: JSON.stringify(data),
    }).then((response) => response.json());
    return response;
  } catch (error) {
    console.log(error);
    console.error(error);
    return false;
  }
}

export async function getJobChargeDetails(data) {
  try {
    const token = localStorage.getItem("token");
    const response = await fetch(
      `${baseUrl}/Sql/api/spInvoice/getJobChargeDetails`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-access-token": JSON.parse(token),
        },
        body: JSON.stringify(data),
      },
    ).then((response) => response.json());
    return response;
  } catch (error) {
    console.log(error);
    console.error(error);
    return false;
  }
}
export async function getBlChargeDetails(data) {
  try {
    const token = localStorage.getItem("token");
    const response = await fetch(
      `${baseUrl}/Sql/api/spInvoice/getBlChargeDetails`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-access-token": JSON.parse(token),
        },
        body: JSON.stringify(data),
      },
    ).then((response) => response.json());
    return response;
  } catch (error) {
    console.log(error);
    console.error(error);
    return false;
  }
}
export async function fetchDataAPI(data) {
  try {
    const response = await fetch(
      `${baseUrl}/api/validations/formControlValidation/fetchProjectedData`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      },
    ).then((response) => response.json());
    return response;
  } catch (error) {
    console.log(error);
    console.error(error);
    return false;
  }
}
export async function fetchDataApi(requestBodyToFetchTableData) {
  try {
    const response = await fetch(
      `${baseUrl}/api/validations/formControlValidation/fetchProjectedData`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBodyToFetchTableData),
      },
    );

    if (!response.ok) {
      throw new Error("Failed to fetch data from the server");
    }

    const responseData = await response.json();
    return responseData;
  } catch (error) {
    console.error("Error fetching data:", error); // Log any errors that occur
    throw error; // Re-throw the error to handle it outside
  }
}
export async function getCharges(data) {
  try {
    const response = await fetch(
      `${baseUrl}/api/validations/formControlValidation/fetchCharge`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      },
    ).then((response) => response.json());
    return response;
  } catch (error) {
    console.log(error);
    console.error(error);
    return false;
  }
}
export const updateUserData = async (userId, data) => {
  try {
    const response = await fetch(
      `${baseUrl}/api/validations/formControlValidation/UpdateData`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      },
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    console.log("API response:", result);
    return result;
  } catch (error) {
    console.error("Error making API call:", error);
    throw error;
  }
};

export const exportToJsonApi = async () => {
  const token = localStorage.getItem("token");
  try {
    console.log("Fetching data from API...");
    const response = await fetch(
      `${baseUrl}/api/DRpt/dynamicReport/exportToJson`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-access-token": JSON.parse(token),
        },
      },
    );

    console.log("Response received:", response);

    if (!response.ok) {
      throw new Error("Network response was not ok");
    }

    const data = await response.json();
    console.log("Data received:", data); // Log the data to check if it's valid

    return data;
  } catch (error) {
    console.error("There has been a problem with your fetch operation:", error);
  }
};

export const exportToXMLApi = async () => {
  const token = localStorage.getItem("token");
  try {
    console.log("Fetching data from API...");
    const response = await fetch(
      `${baseUrl}/api/DRpt/dynamicReport/exportToXML`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-access-token": JSON.parse(token),
        },
      },
    );

    console.log("Response received:", response);

    if (!response.ok) {
      throw new Error("Network response was not ok");
    }

    const data = await response.json();
    console.log("Data received:", data); // Log the data to check if it's valid

    return data;
  } catch (error) {
    console.error("There has been a problem with your fetch operation:", error);
  }
};

export const exportToASCII = async () => {
  const token = localStorage.getItem("token");
  try {
    console.log("Fetching data from API...");
    const response = await fetch(
      `${baseUrl}/api/DRpt/dynamicReport/exportToASCII`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-access-token": JSON.parse(token),
        },
      },
    );

    console.log("Response received:", response);

    if (!response.ok) {
      throw new Error("Network response was not ok");
    }

    const data = await response.json();
    console.log("Data received:", data); // Log the data to check if it's valid

    return data;
  } catch (error) {
    console.error("There has been a problem with your fetch operation:", error);
  }
};

export const CopyDataBase = async (data) => {
  try {
    const token = localStorage.getItem("token");
    const response = await fetch(
      `${baseUrl}/api/master/CopyMenuAndFormControl`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-access-token": JSON.parse(token),
        },
        body: JSON.stringify(data),
      },
    );

    if (!response.ok) {
      throw new Error("Failed to fetch data from the server");
    }

    const responseData = await response.json();
    return responseData;
  } catch (error) {
    console.error("Error fetching data:", error); // Log any errors that occur
    throw error; // Re-throw the error to handle it outside
  }
};
// Akash Code
export const printPDF = async (data) => {
  try {
    const token = localStorage.getItem("token");
    const response = await fetch(`${baseUrl}/api/send/localPdfReports`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-access-token": JSON.parse(token),
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      throw new Error("Failed to fetch data from the server");
    }

    return response.blob();
  } catch (error) {
    console.error("Error fetching data:", error); // Log any errors that occur
    throw error; // Re-throw the error to handle it outside
  }
};

export const emailPDF = async (data) => {
  try {
    const token = localStorage.getItem("token");
    const response = await fetch(`${baseUrl}/api/send/emailPdfReports`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-access-token": JSON.parse(token),
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      throw new Error("Failed to fetch data from the server");
    }

    return response.blob();
  } catch (error) {
    console.error("Error fetching data:", error); // Log any errors that occur
    throw error; // Re-throw the error to handle it outside
  }
};

export const emailReportsInBody = async (data) => {
  try {
    const token = localStorage.getItem("token");
    const response = await fetch(`${baseUrl}/api/send/emailReportsInBody`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-access-token": JSON.parse(token),
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      throw new Error("Failed to fetch data from the server");
    }

    return { data: response.blob(), status: true };
  } catch (error) {
    console.error("Error fetching data:", error); // Log any errors that occur
    throw error; // Re-throw the error to handle it outside
  }
};

export const printPDFEditor = async (data) => {
  try {
    const token = localStorage.getItem("token");
    const response = await fetch(`${baseUrl}/api/send/localPdfReports`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-access-token": JSON.parse(token),
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      throw new Error("Failed to fetch data from the server");
    }

    return response.blob();
  } catch (error) {
    console.error("Error fetching data:", error); // Log any errors that occur
    throw error; // Re-throw the error to handle it outside
  }
};

// export const printPDFEditor = async (data) => {
//   try {
//     const token = localStorage.getItem("token");
//     const response = await fetch(`${baseUrl}/api/send/localPDFReportsEditor`, {
//       method: "POST",
//       headers: {
//         "Content-Type": "application/json",
//         "x-access-token": JSON.parse(token),
//       },
//       body: JSON.stringify(data),
//     });
//     if (!response.ok) {
//       throw new Error("Failed to fetch data from the server");
//     }

//     return response.blob();
//   } catch (error) {
//     console.error("Error fetching data:", error); // Log any errors that occur
//     throw error; // Re-throw the error to handle it outside
//   }
// };

export async function checkDuplicateAPI(data) {
  try {
    const response = await fetch(
      `${baseUrl}/api/validations/formControlValidation/checkDuplicate`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      },
    ).then((response) => response.json());
    return response;
  } catch (error) {
    console.log(error);
    console.error(error);
    return false;
  }
}

export async function ShareDocAPI(data) {
  try {
    const token = localStorage.getItem("token");
    const response = await fetch(`${baseUrl}/api/master/sendMail`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-access-token": JSON.parse(token),
      },
      body: JSON.stringify(data),
    }).then((response) => response.json());
    return response;
  } catch (error) {
    console.log(error);
    console.error(error);
    return false;
  }
}
// export async function gettingTaxDetailsQuotation(data) {
//   try {
//     const token = localStorage.getItem("token");
//     const response = await fetch(
//       `${baseUrl}/api/sp/gettingTaxDetailsQuotation`,
//       {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//           "x-access-token": JSON.parse(token),
//         },
//         body: JSON.stringify(data),
//       }
//     ).then((response) => response.json());
//     return response;
//   } catch (error) {
//     console.log(error);
//     console.error(error);
//     return false;
//   }
// }

export async function copyFormControl(data) {
  try {
    const token = localStorage.getItem("token");
    const response = await fetch(`${baseUrl}/api/FormControl/CopyFormControl`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-access-token": JSON.parse(token),
      },
      body: JSON.stringify(data),
    }).then((response) => response.json());
    return response;
  } catch (error) {
    console.log(error);
    console.error(error);
    return false;
  }
}
export async function FormControlOfToClinetCode(data) {
  try {
    // console.log("controller",controller);
    const token = localStorage.getItem("token");
    const response = await fetch(
      `${baseUrl}/api/FormControl/toFormControlList`,
      {
        // signal: controller?.signal,
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-access-token": JSON.parse(token),
        },
        body: JSON.stringify(data),
      },
    ).then((response) => response.json());
    console.log("dropdown api", response);
    return response;
  } catch (error) {
    console.log(error);
    console.error(error);
    return false;
  }
}

export async function clientCodeDropDown(data) {
  try {
    // console.log("controller",controller);
    const token = localStorage.getItem("token");
    const response = await fetch(
      `${baseUrl}/api/FormControl/clientCodeDropDown`,
      {
        // signal: controller?.signal,
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-access-token": JSON.parse(token),
        },
        body: JSON.stringify(data),
      },
    ).then((response) => response.json());
    console.log("dropdown api", response);
    return response;
  } catch (error) {
    console.log(error);
    console.error(error);
    return false;
  }
}

export async function profileDropdowns(id) {
  const token = localStorage.getItem("token");
  try {
    const response = await fetch(`${baseUrlSQl}/api/profile/dropdowns`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-access-token": JSON.parse(token),
      },
      body: JSON.stringify({ companyId: id }),
    }).then((response) => response.json());
    return response;
  } catch (error) {
    console.error(error);
    return false;
  }
}
export async function fetchReportData(data) {
  try {
    const response = await fetch(`${baseUrl}/Sql/api/fetch/reportData`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    }).then((response) => response.json());
    return response;
  } catch (error) {
    console.log(error);
    console.error(error);
    return false;
  }
}

export async function fetchAnaylsisData(spName, filterCondition) {
  try {
    const requestBody = { spName, filterCondition };
    const response = await fetch(
      `${baseUrl}/Sql/api/formControlValidation/fetchAnalysisReportAPIData`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      },
    ).then((response) => response.json());
    return response;
  } catch (error) {
    console.log(error);
    console.error(error);
    return false;
  }
}

export async function fetchSubJobData(data) {
  try {
    const response = await fetch(`${baseUrl}/Sql/api/fetch/subJobAllocation`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    }).then((response) => response.json());
    return response;
  } catch (error) {
    console.log(error);
    return false;
  }
}
export async function getGLChargeDetails(data) {
  try {
    const response = await fetch(
      `${baseUrl}/Sql/api/fetch/getGLChargeDetails`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      },
    ).then((response) => response.json());
    return response;
  } catch (error) {
    console.log(error);
    console.error(error);
    return false;
  }
}

export async function insertReportData(data) {
  try {
    const response = await fetch(`${baseUrl}/Sql/api/fetch/insertUpdateData`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    }).then((response) => response.json());
    return response;
  } catch (error) {
    console.log(error);
    console.error(error);
    return false;
  }
}
export async function insertReportRecordData(data) {
  try {
    const response = await fetch(
      `${baseUrl}/Sql/api/fetch/insertUpdateRecordData`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      },
    ).then((response) => response.json());
    return response;
  } catch (error) {
    console.log(error);
    console.error(error);
    return false;
  }
}
export async function reportSearchCriteria(data) {
  try {
    const response = await fetch(
      `${baseUrl}/Sql/api/fetch/reportSearchCriteria`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      },
    ).then((response) => response.json());
    return response;
  } catch (error) {
    console.log(error);
    console.error(error);
    return false;
  }
}

export async function profileSubmit(formData) {
  try {
    const response = await fetch(`${baseUrlSQl}/api/profile/profileSubmit`, {
      method: "POST",
      body: formData,
    });
    const result = await response.json();
    return result;
  } catch (error) {
    console.error(error);
    return false;
  }
}

export async function companyLogoChange(formData) {
  try {
    const response = await fetch(`${baseUrlSQl}/api/uploadLogo/logoChange`, {
      method: "POST",
      body: formData,
    });
    const result = await response.json();
    return result;
  } catch (error) {
    console.error(error);
    return false;
  }
}

export async function companyHeaderAndFooterLogoChange(formData) {
  try {
    const response = await fetch(
      `${baseUrlSQl}/api/uploadLogo/headerAndFooterLogoChange`,
      {
        method: "POST",
        body: formData,
      },
    );
    const result = await response.json();
    return result;
  } catch (error) {
    console.error(error);
    return false;
  }
}

export async function themeChange(data) {
  try {
    const response = await fetch(`${baseUrlSQl}/api/profile/themeChange`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });
    const result = await response.json();
    return result;
  } catch (error) {
    console.error(error);
    return false;
  }
}

export async function getUserDashboardData(data) {
  try {
    const response = await fetch(
      `${baseUrlSQl}/api/userDashboard/getUserDashboardData`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      },
    );
    const result = await response.json();
    return result;
  } catch (error) {
    console.error(error);
    return false;
  }
}

export async function userDashboardDataSubmit(data) {
  try {
    const response = await fetch(
      `${baseUrlSQl}/api/userDashboard/userDashboardDataSubmit`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      },
    );
    const result = await response.json();
    return result;
  } catch (error) {
    console.error(error);
    return false;
  }
}

export async function getUserDashboard(data) {
  try {
    const response = await fetch(
      `${baseUrlSQl}/api/userDashboard/getUserDashboard`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      },
    );
    const result = await response.json();
    return result;
  } catch (error) {
    console.error(error);
    return false;
  }
}

export async function getInvoice(data) {
  try {
    const token = localStorage.getItem("token");
    const response = await fetch(
      `${baseUrl}/Sql/api/spInvoice/getGeneralLedgerData`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-access-token": JSON.parse(token),
        },
        body: JSON.stringify(data),
      },
    ).then((response) => response.json());
    return response;
  } catch (error) {
    console.log(error);
    console.error(error);
    return false;
  }
}
export async function getVoucherInvoiceData(data) {
  try {
    const token = localStorage.getItem("token");
    const response = await fetch(
      `${baseUrl}/Sql/api/spInvoice/getVoucherData`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-access-token": JSON.parse(token),
        },
        body: JSON.stringify(data),
      },
    ).then((response) => response.json());
    return response;
  } catch (error) {
    console.log(error);
    console.error(error);
    return false;
  }
}
export async function fetchReportDataExcel(data) {
  try {
    const response = await fetch(`${baseUrl}/Sql/api/fetch/reportData`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      console.error("❌ Server responded with non-OK:", response.status);
      return false;
    }

    const result = await response.json();
    return result;
  } catch (error) {
    console.error("❌ Network or server error:", error);
    return false;
  }
}
export async function insertExcelData(data) {
  try {
    const token = localStorage.getItem("token");
    const response = await fetch(
      `${baseUrl}/Sql/api/excelValidation/insertExcelData`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-access-token": JSON.parse(token),
        },
        body: JSON.stringify(data),
      },
    ).then((response) => response.json());
    return response;
  } catch (error) {
    console.log(error);
    console.error(error);
    return false;
  }
}

export async function insertExcelDataInDatabase(data) {
  try {
    const token = localStorage.getItem("token");
    const response = await fetch(
      `${baseUrl}/Sql/api/excelValidation/insertExcelDataInDatabase`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-access-token": JSON.parse(token),
        },
        body: JSON.stringify(data),
      },
    ).then((response) => response.json());
    return response;
  } catch (error) {
    console.log(error);
    console.error(error);
    return false;
  }
}

export async function AccountingReport(data) {
  try {
    const token = localStorage.getItem("token");
    const response = await fetch(`${baseUrl}/Sql/api/accountData`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    }).then((response) => response.json());
    return response;
  } catch (error) {
    console.log(error);
    console.error(error);
    return false;
  }
}

export async function trialBalanceReportData(data) {
  try {
    const token = localStorage.getItem("token");
    const response = await fetch(`${baseUrl}/Sql/api/trialBalanceReportData`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    }).then((response) => response.json());
    return response;
  } catch (error) {
    console.log(error);
    console.error(error);
    return false;
  }
}

export async function balanceSheetReportData(data) {
  try {
    const token = localStorage.getItem("token");
    const response = await fetch(`${baseUrl}/Sql/api/balanceSheetReportData`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    }).then((response) => response.json());
    return response;
  } catch (error) {
    console.log(error);
    console.error(error);
    return false;
  }
}

export async function ledgerData(data) {
  try {
    const token = localStorage.getItem("token");
    const response = await fetch(`${baseUrl}/Sql/api/ledgerReportData`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    }).then((response) => response.json());
    return response;
  } catch (error) {
    console.log(error);
    console.error(error);
    return false;
  }
}

export async function reportTheme(data) {
  try {
    const token = localStorage.getItem("token");
    const response = await fetch(`${baseUrlSQl}/api/Reports/reportTheme`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-access-token": JSON.parse(token),
      },
      body: JSON.stringify(data),
    }).then((response) => response.json());

    return response;
  } catch (error) {
    console.log(error);
    console.error(error);
    return false;
  }
}

export async function eInvoicing(data) {
  try {
    const token = localStorage.getItem("token");
    const storedUserData = localStorage.getItem("userData");
    const decryptedData = decrypt(storedUserData);
    const userData = JSON.parse(decryptedData);
    const clientId = userData[0].clientId;
    let insertedData = {
      ...data,
      // clientId: clientId,
      companyId: sessionStorage.getItem("companyId"),
      loginBranch: sessionStorage.getItem("branchId"),
      // loginfinYear: sessionStorage.getItem("financialYear"),
    };
    const response = await fetch(`${baseUrlSQl}/api/eInvoicing/isEInvoicing`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-access-token": JSON.parse(token),
      },
      body: JSON.stringify(insertedData),
    }).then((response) => response.json());
    return response;
  } catch (error) {
    console.log(error);
    console.error(error);
    return false;
  }
}

export async function cancelIRN_GSTHero({ invoiceId, reasonId, remark }) {
  try {
    const token = localStorage.getItem("token");
    const body = {
      invoiceId: Number(invoiceId) || 0,
      companyId: Number(sessionStorage.getItem("companyId")) || 0,
      loginBranch: Number(sessionStorage.getItem("branchId")) || 0,
      reasonId: Number(reasonId) || 0,
      remark: remark,
    };
    const response = await fetch(
      `${baseUrlSQl}/api/eInvoicing/cancelIRN_GSTHero`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-access-token": JSON.parse(token),
        },
        body: JSON.stringify(body),
      },
    ).then((response) => response.json());
    return response;
  } catch (error) {
    console.log(error);
    console.error(error);
    return false;
  }
}

export async function saveEditedReport(data) {
  try {
    const token = localStorage.getItem("token");
    const response = await fetch(`${baseUrlSQl}/api/Reports/saveEditedReport`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-access-token": JSON.parse(token),
      },
      body: JSON.stringify(data),
    }).then((response) => response.json());

    return response;
  } catch (error) {
    console.log(error);
    console.error(error);
    return false;
  }
}

export async function disableEdit(data) {
  try {
    const token = localStorage.getItem("token");
    const response = await fetch(`${baseUrlSQl}/api/FormControl/disableEdit`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-access-token": JSON.parse(token),
      },
      body: JSON.stringify(data),
    }).then((response) => response.json());

    return response;
  } catch (error) {
    console.log(error);
    console.error(error);
    return false;
  }
}
export async function disableDelete(data) {
  try {
    const token = localStorage.getItem("token");
    const response = await fetch(
      `${baseUrlSQl}/api/FormControl/disableDelete`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-access-token": JSON.parse(token),
        },
        body: JSON.stringify(data),
      },
    ).then((response) => response.json());

    return response;
  } catch (error) {
    console.log(error);
    console.error(error);
    return false;
  }
}
export async function disableAdd(data) {
  try {
    const token = localStorage.getItem("token");
    const response = await fetch(`${baseUrlSQl}/api/FormControl/disableAdd`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-access-token": JSON.parse(token),
      },
      body: JSON.stringify(data),
    }).then((response) => response.json());

    return response;
  } catch (error) {
    console.log(error);
    console.error(error);
    return false;
  }
}
export async function validateSubmit(data) {
  try {
    const token = localStorage.getItem("token");
    const response = await fetch(
      `${baseUrlSQl}/api/FormControl/validateSubmit`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-access-token": JSON.parse(token),
        },
        body: JSON.stringify(data),
      },
    ).then((response) => response.json());

    return response;
  } catch (error) {
    console.log(error);
    console.error(error);
    return false;
  }
}

export async function tallyDebitCredit(data) {
  try {
    const token = localStorage.getItem("token");
    const response = await fetch(
      `${baseUrlSQl}/api/FormControl/tallyDebitCredit`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-access-token": JSON.parse(token),
        },
        body: JSON.stringify(data),
      },
    ).then((response) => response.json());

    return response;
  } catch (error) {
    console.log(error);
    console.error(error);
    return false;
  }
}

export async function getTaxDetailsQuotation(data) {
  try {
    const token = localStorage.getItem("token");
    const response = await fetch(
      `${baseUrl}/Sql/api/spInvoice/gettingTaxDetailsQuotation`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-access-token": JSON.parse(token),
        },
        body: JSON.stringify(data),
      },
    ).then((response) => response.json());
    return response;
  } catch (error) {
    console.log(error);
    console.error(error);
    return false;
  }
}

export async function mergeBl(data) {
  try {
    const token = localStorage.getItem("token");
    const response = await fetch(`${baseUrl}/Sql/api/create/mergeBl`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-access-token": JSON.parse(token),
      },
      body: JSON.stringify(data),
    }).then((response) => response.json());
    return response;
  } catch (error) {
    console.log(error);
    console.error(error);
    return false;
  }
}

export async function getContainerActivity(data) {
  try {
    const token = localStorage.getItem("token");
    const response = await fetch(
      `${baseUrl}/Sql/api/spInvoice/gettingcontainerActivity`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-access-token": JSON.parse(token),
        },
        body: JSON.stringify(data),
      },
    ).then((response) => response.json());
    return response;
  } catch (error) {
    console.log(error);
    console.error(error);
    return false;
  }
}

export async function getValidateForDo(data) {
  try {
    const token = localStorage.getItem("token");
    const response = await fetch(`${baseUrl}/Sql/api/Reports/blDataForDO`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-access-token": JSON.parse(token),
      },
      body: JSON.stringify(data),
    }).then((response) => response.json());
    return response;
  } catch (error) {
    console.log(error);
    console.error(error);
    return false;
  }
}
export async function getContainerData(data) {
  try {
    const token = localStorage.getItem("token");
    const response = await fetch(
      `${baseUrl}/Sql/api/spInvoice/saveContainerActivity`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-access-token": JSON.parse(token),
        },
        body: JSON.stringify(data),
      },
    ).then((response) => response.json());
    return response;
  } catch (error) {
    console.log(error);
    console.error(error);
    return false;
  }
}
export async function getGeneralLegerBillingParty(data) {
  try {
    const token = localStorage.getItem("token");
    const response = await fetch(
      `${baseUrl}/Sql/api/spInvoice/getGeneralLegerBillingParty`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-access-token": JSON.parse(token),
        },
        body: JSON.stringify(data),
      },
    ).then((response) => response.json());
    return response;
  } catch (error) {
    console.log(error);
    console.error(error);
    return false;
  }
}
export async function getVoucher(data) {
  try {
    const token = localStorage.getItem("token");
    const response = await fetch(`${baseUrl}/Sql/api/sp/getVoucher`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-access-token": JSON.parse(token),
      },
      body: JSON.stringify(data),
    }).then((response) => response.json());
    return response;
  } catch (error) {
    console.log(error);
    console.error(error);
    return false;
  }
}

export async function getVoucherThirdLevelData(data) {
  try {
    const token = localStorage.getItem("token");
    const response = await fetch(
      `${baseUrl}/Sql/api/sp/getVoucherThirlLevelData`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-access-token": JSON.parse(token),
        },
        body: JSON.stringify(data),
      },
    ).then((response) => response.json());
    return response;
  } catch (error) {
    console.log(error);
    console.error(error);
    return false;
  }
}

export async function getContainerRepairDetails(data) {
  try {
    const token = localStorage.getItem("token");
    const response = await fetch(
      `${baseUrl}/Sql/api/sp/getContainerChargeDetails`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-access-token": JSON.parse(token),
        },
        body: JSON.stringify(data),
      },
    ).then((response) => response.json());
    return response;
  } catch (error) {
    console.log(error);
    console.error(error);
    return false;
  }
}

export async function fetchThirdLevelDetailsFromApi(data) {
  try {
    const token = localStorage.getItem("token");
    const response = await fetch(`${baseUrl}/Sql/api/sp/getThirdLevelDetails`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-access-token": JSON.parse(token),
      },
      body: JSON.stringify(data),
    }).then((response) => response.json());
    return response;
  } catch (error) {
    console.log(error);
    console.error(error);
    return false;
  }
}

export async function getDetentionDetails(data) {
  try {
    const token = localStorage.getItem("token");
    const response = await fetch(`${baseUrl}/Sql/api/sp/getDetentionDetails`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-access-token": JSON.parse(token),
      },
      body: JSON.stringify(data),
    }).then((response) => response.json());
    return response;
  } catch (error) {
    console.log(error);
    console.error(error);
    return false;
  }
}

export async function getThridDatePurchaseData(data) {
  try {
    const token = localStorage.getItem("token");
    const response = await fetch(
      `${baseUrl}/Sql/api/sp/getThirdLevelPurchaseContainerWise`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-access-token": JSON.parse(token),
        },
        body: JSON.stringify(data),
      },
    ).then((response) => response.json());
    return response;
  } catch (error) {
    console.log(error);
    console.error(error);
    return false;
  }
}

export async function calculateDetentionRateData(data) {
  try {
    const token = localStorage.getItem("token");
    const response = await fetch(
      `${baseUrl}/Sql/api/sp/calculateDetentionRate`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-access-token": JSON.parse(token),
        },
        body: JSON.stringify(data),
      },
    ).then((response) => response.json());
    return response;
  } catch (error) {
    console.log(error);
    console.error(error);
    return false;
  }
}

// export async function fetchThirdLevelDetailsPurchaseFromApi(data) {
//   try {
//     const token = localStorage.getItem("token");
//     const response = await fetch(
//       `${baseUrl}/Sql/api/sp/getThirdLevelDetailsPurchase`,
//       {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//           "x-access-token": JSON.parse(token),
//         },
//         body: JSON.stringify(data),
//       }
//     ).then((response) => response.json());
//     return response;
//   } catch (error) {
//     console.log(error);
//     console.error(error);
//     return false;
//   }
// }

export async function fetchContainerNoData(data) {
  try {
    const token = localStorage.getItem("token");
    const response = await fetch(
      `${baseUrl}/Sql/api/sp/fetchContainerDropdownData`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-access-token": JSON.parse(token),
        },
        body: JSON.stringify(data),
      },
    ).then((response) => response.json());
    return response;
  } catch (error) {
    console.log(error);
    console.error(error);
    return false;
  }
}

export async function insertVoucherData(data) {
  try {
    const token = localStorage.getItem("token");
    const response = await fetch(`${baseUrl}/Sql/api/sp/insertVoucherData`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-access-token": JSON.parse(token),
      },
      body: JSON.stringify(data),
    }).then((response) => response.json());
    return response;
  } catch (error) {
    console.log(error);
    console.error(error);
    return false;
  }
}

export async function editLastActivity(data) {
  try {
    const token = localStorage.getItem("token");
    const response = await fetch(
      `${baseUrl}/Sql/api/sp/editContainerMovement`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-access-token": JSON.parse(token),
        },
        body: JSON.stringify(data),
      },
    ).then((response) => response.json());
    return response;
  } catch (error) {
    console.log(error);
    console.error(error);
    return false;
  }
}

export async function disablePrint(data) {
  try {
    let requestBody = {
      ...data,
      loginCompanyId: sessionStorage.getItem("companyId"),
      loginBranchId: sessionStorage.getItem("branchId"),
      loginFinYearId: sessionStorage.getItem("financialYear"),
    };
    const token = localStorage.getItem("token");
    const response = await fetch(`${baseUrlSQl}/api/FormControl/disablePrint`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-access-token": JSON.parse(token),
      },
      body: JSON.stringify(requestBody),
    }).then((response) => response.json());

    return response;
  } catch (error) {
    console.log(error);
    console.error(error);
    return false;
  }
}

export async function fetchSecondThirdLevelDetails(data) {
  try {
    const token = localStorage.getItem("token");
    const response = await fetch(
      `${baseUrl}/Sql/api/sp/getSecondThirdLevelData`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-access-token": JSON.parse(token),
        },
        body: JSON.stringify(data),
      },
    ).then((response) => response.json());
    return response;
  } catch (error) {
    console.log(error);
    console.error(error);
    return false;
  }
}
export async function fetchVoucherDataDynamic(data) {
  // masterTableList
  try {
    let insertedData = {
      ...data,
      companyId: sessionStorage.getItem("companyId"),
      companyBranchId: sessionStorage.getItem("branchId"),
      financialYearId: sessionStorage.getItem("financialYear"),
    };
    const token = localStorage.getItem("token");
    const response = await fetch(
      `${baseUrlSQl}/api/master/fetchVoucherDataDynamic`,
      {
        method: "POST",
        // credentials: "include",
        headers: {
          "Content-Type": "application/json",
          "x-access-token": JSON.parse(token),
        },
        body: JSON.stringify(insertedData),
      },
    ).then((response) => response.json());
    return response;
  } catch (error) {
    console.log(error);
    console.error(error);
    return false;
  }
}

export async function insertVoucherDataDynami(data) {
  try {
    const token = localStorage.getItem("token");
    const response = await fetch(
      `${baseUrl}/Sql/api/sp/insertVoucherDataDynamic`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-access-token": JSON.parse(token),
        },
        body: JSON.stringify(data),
      },
    ).then((response) => response.json());
    return response;
  } catch (error) {
    console.log(error);
    console.error(error);
    return false;
  }
}

export async function warehouseData(data) {
  try {
    const token = localStorage.getItem("token");
    const response = await fetch(`${baseUrl}/Sql/api/Reports/warehouseData`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-access-token": JSON.parse(token),
      },
      body: JSON.stringify(data),
    }).then((response) => response.json());
    return response;
  } catch (error) {
    console.log(error);
    console.error(error);
    return false;
  }
}

export async function fetchBlPrintReportData(data) {
  try {
    const response = await fetch(`${baseUrl}/Sql/api/Reports/blPrint`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    }).then((response) => response.json());
    return response;
  } catch (error) {
    console.log(error);
    console.error(error);
    return false;
  }
}

export async function fetchCroPrintReportData(data) {
  try {
    const response = await fetch(`${baseUrl}/Sql/api/Reports/croprint`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    }).then((response) => response.json());
    return response;
  } catch (error) {
    console.log(error);
    console.error(error);
    return false;
  }
}

export async function getTariffChargeDetails(data) {
  try {
    const token = localStorage.getItem("token");
    const response = await fetch(
      `${baseUrl}/Sql/api/spInvoice/getTariffChargeDetails`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-access-token": JSON.parse(token),
        },
        body: JSON.stringify(data),
      },
    ).then((response) => response.json());
    return response;
  } catch (error) {
    console.log(error);
    console.error(error);
    return false;
  }
}

export async function commanPostService({ url, data }) {
  try {
    const storedUserData = localStorage.getItem("userData");
    const decryptedData = decrypt(storedUserData);
    const userData = JSON.parse(decryptedData);
    const clientId = userData[0].clientId;
    let insertedData = {
      ...data,
      clientId: clientId,
      loginCompany: sessionStorage.getItem("companyId"),
      loginBranch: sessionStorage.getItem("branchId"),
      loginfinYear: sessionStorage.getItem("financialYear"),
    };
    const token = localStorage.getItem("token");
    const response = await fetch(`${baseUrlSQl}${url}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-access-token": JSON.parse(token),
      },
      body: JSON.stringify(insertedData),
    }).then((response) => response.json());

    if (response["success"]) {
      return response;
    } else {
      return response;
    }
  } catch (error) {
    console.error(error);
    return false;
  }
}

export async function getRoundOffData(data) {
  try {
    const token = localStorage.getItem("token");
    const response = await fetch(
      `${baseUrl}/Sql/api/spInvoice/getRoundOffSettings`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-access-token": JSON.parse(token),
        },
        body: JSON.stringify(data),
      },
    ).then((response) => response.json());
    return response;
  } catch (error) {
    console.log(error);
    console.error(error);
    return false;
  }
}

export async function checkDischargeDoneForBLData(data) {
  try {
    const token = localStorage.getItem("token");
    const response = await fetch(
      `${baseUrl}/Sql/api/spInvoice/checkDischargeDoneForBL`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-access-token": JSON.parse(token),
        },
        body: JSON.stringify(data),
      },
    ).then((response) => response.json());
    return response;
  } catch (error) {
    console.log(error);
    console.error(error);
    return false;
  }
}

export async function checkJobCreatedAgainstBLData(data) {
  try {
    const token = localStorage.getItem("token");
    const response = await fetch(
      `${baseUrl}/Sql/api/spInvoice/checkJobCreatedAginstBl`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-access-token": JSON.parse(token),
        },
        body: JSON.stringify(data),
      },
    ).then((response) => response.json());
    return response;
  } catch (error) {
    console.log(error);
    console.error(error);
    return false;
  }
}

export async function getBillingPartyOnBlData(data) {
  try {
    const token = localStorage.getItem("token");
    const response = await fetch(
      `${baseUrl}/Sql/api/spInvoice/getBillingPartyOnBl`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-access-token": JSON.parse(token),
        },
        body: JSON.stringify(data),
      },
    ).then((response) => response.json());
    return response;
  } catch (error) {
    console.log(error);
    console.error(error);
    return false;
  }
}

// export async function UploadPurchaseInvoice(data) {
//   try {
//     const token = localStorage.getItem("token");
//     const files = data?.invoiceUploads || [];

//     if (!Array.isArray(files) || files.length === 0) {
//       return {
//         success: false,
//         message: "No file found to upload",
//         data: null,
//       };
//     }

//     const file = files[0];

//     const formData = new FormData();
//     formData.append("file", file);

//     const res = await fetch(`${baseUrlSQl}/api/extract/pdfData`, {
//       method: "POST",
//       headers: {
//         "x-access-token": JSON.parse(token),
//       },
//       body: formData,
//     });

//     const response = await res.json();
//     return response;
//   } catch (error) {
//     console.log(error);
//     console.error(error);
//     return {
//       success: false,
//       message: "File upload failed",
//       data: null,
//     };
//   }
// }

export async function UploadPurchaseInvoice(data) {
  try {
    const token = localStorage.getItem("token");

    let file = null;

    // Case 1: data is direct File
    if (data instanceof File) {
      file = data;
    }

    // Case 2: data has invoiceUploads array
    else if (Array.isArray(data?.invoiceUploads)) {
      file = data.invoiceUploads[0];
    }

    // Case 3: data has filesName array
    else if (Array.isArray(data?.filesName)) {
      file = data.filesName[0];
    }

    // Case 4: data is event
    else if (data?.target?.files?.[0]) {
      file = data.target.files[0];
    }

    if (!file) {
      return {
        success: false,
        statusCode: 400,
        error: "PDF file not found",
      };
    }

    const formData = new FormData();

    // IMPORTANT: append actual File, not FormData
    formData.append("file", file);

    for (const [key, value] of formData.entries()) {
      console.log("FORM DATA:", key, value);
      console.log("FILE NAME:", value?.name);
      console.log("FILE SIZE:", value?.size);
      console.log("FILE TYPE:", value?.type);
    }

    const headers = {};

    if (token) {
      try {
        headers["x-access-token"] = JSON.parse(token);
      } catch {
        headers["x-access-token"] = token;
      }
    }

    const res = await fetch(`${aiReadingbaseUrlSQl}/api/extract/pdfData`, {
      method: "POST",
      headers,
      body: formData,
    });

    const response = await res.json();

    return {
      ...response,
      statusCode: res.status,
    };
  } catch (error) {
    console.error(error);

    return {
      success: false,
      statusCode: 500,
      error: "Failed to upload purchase invoice PDF",
    };
  }
}

export async function UploadBl(data) {
  try {
    const token = localStorage.getItem("token");
    const files = data?.invoiceUploads || [];

    if (!Array.isArray(files) || files.length === 0) {
      return {
        success: false,
        statusCode: 400,
        message: "No file found to upload",
        data: null,
      };
    }

    const file = files[0];
    const formData = new FormData();
    formData.append("file", file);

    const res = await fetch(`${baseUrlSQl}/api/ai/extract/blPdfData`, {
      method: "POST",
      headers: {
        "x-access-token": JSON.parse(token),
      },
      body: formData,
    });

    const response = await res.json();
    console.log("response Ak", response);
    return {
      ...response,
      statusCode: res.status,
    };
  } catch (error) {
    console.log(error);
    console.error(error);
    return {
      success: false,
      statusCode: 500,
      message: "File upload failed",
      data: null,
    };
  }
}

export async function GetPurchaseInvoiceReadingStatus(extractionId) {
  try {
    const token = localStorage.getItem("token");

    if (!extractionId) {
      return {
        success: false,
        statusCode: 400,
        message: "extractionId is required",
        readingStatus: null,
      };
    }

    const headers = {
      "Cache-Control": "no-cache",
      Pragma: "no-cache",
    };

    if (token) {
      try {
        headers["x-access-token"] = JSON.parse(token);
      } catch {
        headers["x-access-token"] = token;
      }
    }

    const res = await fetch(
      `${aiReadingbaseUrlSQl}/api/extract/pdfData/readingStatus?extractionId=${encodeURIComponent(
        extractionId,
      )}&t=${Date.now()}`,
      {
        method: "GET",
        cache: "no-store",
        headers,
      },
    );

    const response = await res.json();

    return {
      ...response,
      statusCode: res.status,
    };
  } catch (error) {
    console.log(error);
    console.error(error);

    return {
      success: false,
      statusCode: 500,
      message: "Failed to fetch reading status",
      readingStatus: null,
      //fixed
    };
  }
}

export async function GetBlReadingStatus() {
  try {
    const token = localStorage.getItem("token");

    const res = await fetch(
      `${baseUrlSQl}/api/ai/extract/blPdfData/readingStatus`,
      {
        method: "GET",
        headers: {
          "x-access-token": JSON.parse(token),
        },
      },
    );

    const response = await res.json();

    return {
      ...response,
      statusCode: res.status,
    };
  } catch (error) {
    console.log(error);
    console.error(error);
    return {
      success: false,
      statusCode: 500,
      message: "Failed to fetch reading status",
      readingStatus: null,
    };
  }
}

export async function getChargeForTariffData(data) {
  try {
    const token = localStorage.getItem("token");
    const response = await fetch(
      `${baseUrl}/Sql/api/spInvoice/getChargeForTariff`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-access-token": JSON.parse(token),
        },
        body: JSON.stringify(data),
      },
    ).then((response) => response.json());
    return response;
  } catch (error) {
    console.log(error);
    console.error(error);
    return false;
  }
}

export async function UploadForm32AS(data) {
  try {
    const token = localStorage.getItem("token");

    let parsedToken = "";

    try {
      parsedToken = token ? JSON.parse(token) : "";
    } catch {
      parsedToken = token || "";
    }

    let formData;

    // ✅ Case 1: handleForm32AS already sends FormData
    if (data instanceof FormData) {
      formData = data;
    } else {
      // ✅ Case 2: fallback if old code sends normal object
      const rawFiles =
        data?.form32ASUploads || data?.invoiceUploads || data?.file || [];

      const files =
        rawFiles instanceof File
          ? [rawFiles]
          : Array.isArray(rawFiles)
            ? rawFiles
            : Array.from(rawFiles || []);

      if (!files.length) {
        return {
          success: false,
          statusCode: 400,
          message: "No file found to upload",
          data: null,
        };
      }

      const file = files[0];

      formData = new FormData();
      formData.append("file", file);
    }

    const uploadedFile = formData.get("file");

    console.log("UploadForm32AS uploadedFile =>", uploadedFile);

    if (!uploadedFile) {
      return {
        success: false,
        statusCode: 400,
        message: "No file found to upload",
        data: null,
      };
    }

    const headers = {};

    if (parsedToken) {
      headers["x-access-token"] = parsedToken;
    }

    const res = await fetch(`${baseUrlSQl}/api/ai/extract/form32AsPdfData`, {
      method: "POST",
      headers,
      body: formData,
    });

    let response = null;

    try {
      response = await res.json();
    } catch {
      response = {
        success: false,
        message: "Invalid response from server",
        data: null,
      };
    }

    console.log("UploadForm32AS response =>", response);

    return {
      ...response,
      statusCode: res.status,
    };
  } catch (error) {
    console.error("UploadForm32AS error =>", error);

    return {
      success: false,
      statusCode: 500,
      message: error?.message || "File upload failed",
      data: null,
    };
  }
}

export async function GetForm32ASReadingStatus() {
  try {
    const token = localStorage.getItem("token");

    const res = await fetch(
      `${baseUrlSQl}/api/ai/extract/form32AsPdfData/readingStatus`,
      {
        method: "GET",
        headers: {
          "x-access-token": JSON.parse(token),
        },
      },
    );

    const response = await res.json();

    return {
      ...response,
      statusCode: res.status,
    };
  } catch (error) {
    console.log(error);
    console.error(error);
    return {
      success: false,
      statusCode: 500,
      message: "Failed to fetch reading status",
      readingStatus: null,
    };
  }
}
