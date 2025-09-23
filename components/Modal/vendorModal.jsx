/* eslint-disable */
import React, { useEffect, useState } from "react";
import {
  Backdrop,
  Box,
  Button,
  Fade,
  FormControl,
  IconButton,
  InputAdornment,
  InputLabel,
  MenuItem,
  Modal,
  Select,
  TextField,
  Typography,
} from "@mui/material";
import appStyles from "@/app/app.module.css";
import PropTypes from "prop-types";
import { ClearIcon } from "@mui/x-date-pickers";
import * as formControlValidation from "@/helper/formControlValidation";
import { getUserDetails } from "@/helper/userDetails";
import {
  fetchDataAPI,
  fetchReportData,
  dynamicDropDownFieldsData,
} from "@/services/auth/FormControl.services";
import { decrypt } from "@/helper/security";

const VendorModal = ({
  openModal,
  setOpenModal,
  tblRateRequestCharge,
  save,
  childsFields,
  newState,
  isAdd,
}) => {
  const handleClose = () => setOpenModal(false);
  const [dropdownVal, setDropdownVal] = useState({
    chargeGroup: "",
    vendor: "",
  });
  const [result, setResult] = useState([]);
  const [chargeGroup, setChargeGroup] = useState([]);
  const [vendorNames, setVendorNames] = useState([]);
  // eslint-disable-next-line no-unused-vars
  const [changeCurrency, setChangeCurrency] = useState(null);
  const [currencyDropdown, setCurrencyDropdown] = useState([]);

  const [rate, setRate] = useState([{}]);
  const [typeCode, setTypeCodes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [transportMode, setTransportMode] = useState(null);
  const [transportModeType, setTransportModeType] = useState(null);
  const [sizeTypeData, setSizeTypeData] = useState(null);
  const [currency, setCurrency] = useState(null);
  const [currencyObject, setCurrencyObject] = useState([]);
  const [pageType, setPageType] = useState(isAdd);

  useEffect(() => {
    const uniqueItemsMap = new Map();
    const uniqueVendorMap = new Map();

    tblRateRequestCharge?.forEach((item) => {
      const chargeGroupIdValue = item?.chargeGroupIddropdown?.[0]
        ? item.chargeGroupIddropdown[0]?.value
        : item.chargeGroupId;
      const vendorIdDropdownValue = item.vendorIddropdown?.[0]
        ? item.vendorIddropdown[0]?.label
        : item.vendorIdDropdown;
      if (!uniqueItemsMap.has(chargeGroupIdValue)) {
        uniqueItemsMap.set(item.chargeGroupId, item);
      }
      if (!uniqueVendorMap.has(vendorIdDropdownValue)) {
        uniqueVendorMap.set(vendorIdDropdownValue, item);
      }
    });

    const uniqueItems = Array.from(uniqueItemsMap.values());
    setChargeGroup(uniqueItems);

    const uniqueVendor = Array.from(uniqueVendorMap.values());

    setVendorNames(uniqueVendor);
  }, [tblRateRequestCharge]);

  useEffect(() => {
    const fetchTransportMode = async () => {
      if (newState?.businessSegmentId) {
        const storedUserData = localStorage.getItem("userData");
        if (storedUserData !== null) {
          const decryptedData = decrypt(storedUserData);
          const userData = JSON.parse(decryptedData);
          const clientId = userData[0]?.clientId;
          const token = JSON.parse(localStorage.getItem("token"));
          const requestForDepartment = {
            columns: "name",
            tableName: "tblBusinessSegment",
            whereCondition: `id=${newState?.businessSegmentId} and status = 1`,
            clientIdCondition: `clientId in (${clientId},(select id from tblClient where clientCode = 'SYSCON')) FOR JSON PATH`,
          };
          try {
            const response = await fetchReportData(requestForDepartment);
            const departmentName = response?.data?.[0]?.name || null;

            const transportMode = departmentName
              ? departmentName.toLowerCase().includes("air")
                ? "Air"
                : departmentName.toLowerCase().includes("sea")
                ? "Sea"
                : ""
              : "";

            if (transportMode) {
              setTransportMode("Sea");
              //setTransportMode(transportMode);
              setTransportModeType(transportMode);
              setSizeTypeData(transportMode);
            }
          } catch (error) {
            console.error("Error fetching transport mode:", error);
          }
        }
      }
    };

    fetchTransportMode();
  }, [newState]);

  // console.log()

  useEffect(() => {
    async function fetchCurrencyDropdown() {
      try {
        const storedUserData = localStorage.getItem("userData");
        if (storedUserData !== null) {
          const decryptedData = decrypt(storedUserData);
          const userData = JSON.parse(decryptedData);
          const clientCode = userData[0]?.clientCode;
          const token = JSON.parse(localStorage.getItem("token"));
          const requestForCurrency = {
            tableName: "tblMasterData",
            whereCondition: {
              clientCode: clientCode,
              code: "INR",
            },
            projection: {
              name: 1,
              code: 1,
            },
          };

          const response = await fetchDataAPI(requestForCurrency); // Use await here
          const currency_id = response?.data?.[0]?._id || null;
          const currencyCode = response?.data?.[0]?.code || null;

          console.log("Currency ID:", currency_id); // Do something with the currency_id
          if (currency_id != null || currency_id != "") {
            setCurrency(currency_id);
            dataObject = [
              {
                label: currencyCode,
                oldId: null,
                value: currency_id,
                _id: currency_id,
              },
            ];
            setCurrencyObject(dataObject);
          }
        }
      } catch (error) {
        console.error("Error fetching currency dropdown:", error);
      }
    }

    fetchCurrencyDropdown(); // Call the async function
  }, [transportMode]);

  const handleGroupChange = () => {
    const newResult = [];
    tblRateRequestCharge?.forEach((item) => {
      if (!dropdownVal.chargeGroup && !dropdownVal.vendor) {
        if (!item.vendorId) {
          newResult.push(item);
        }
      } else {
        if (
          dropdownVal.chargeGroup === item.chargeGroupId &&
          !dropdownVal.vendor
        ) {
          if (!item.vendorId) {
            newResult.push(item);
          }
        } else if (
          dropdownVal.vendor === item.vendorId &&
          !dropdownVal.chargeGroup
        ) {
          newResult.push(item);
        } else if (
          dropdownVal.vendor === item.vendorId &&
          dropdownVal.chargeGroup === item.chargeGroupId
        ) {
          newResult.push(item);
        }
      }
    });

    setResult(newResult);
  };

  const handleChange = (event) => {
    const { name, value } = event.target;

    setDropdownVal((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  function handleFuncChangeCall(functionData, values, fieldName, tableName) {
    const funcNameMatch = functionData?.match(/^(\w+)/);
    // Check for the presence of parentheses to confirm the argument list, even if it's empty
    const argsMatch = functionData?.match(/\((.*)\)/);
    // Check if we have a function name match, and we have an argsMatch (even if there are no arguments)
    if (funcNameMatch && argsMatch !== null) {
      const funcName = funcNameMatch[1];
      const argsStr = argsMatch[1] || ""; // argsStr could be an empty string
      // Find the function in formControlValidation by the extracted name
      const func = formControlValidation?.[funcName];
      if (typeof func === "function") {
        // Prepare arguments: If there are no arguments, argsStr will be an empty string
        let args;
        if (argsStr === "") {
          args = {}; // No arguments, so pass an empty object or as per the function's expected parameters
        } else {
          args = argsStr; // Has arguments, pass them as an object
        }

        // Call the function with the prepared arguments
        const updatedValues = func({
          args,
          values,
          fieldName,
          newState,
          formControlData: { tableName: "tblRateRequest" },
          // setFormControlData,
          tableName,
          setStateVariable: () => {},
        });
        console.log("venderModalFunctionCalling", updatedValues);
        return updatedValues.values;
      }
    }
  }

  const calculateUpdatedCharge = async (charge) => {
    let updatedCharge = { ...charge };

    console.log("Processing charge: ", charge);

    const parentCurrencyId = newState.currencyId;
    const parentExchangeRate = newState.exchangeRate;

    const { companyId, clientCode } = getUserDetails();
    console.log("Fetched user details: ", companyId, clientCode);

    const requestData = {
      tableName: "tblCompanyParameter",
      whereCondition: {
        clientCode: clientCode,
        status: 1,
        companyId: companyId,
        currencyId: parentCurrencyId,
      },
      projection: {},
    };

    console.log("Making request for home currency check: ", requestData);
    const isHomeCurrency = await fetchDataAPI(requestData);

    console.log("Home currency data: ", isHomeCurrency);

    // Update margins if necessary
    updatedCharge.buyMargin =
      updatedCharge.buyMargin === null || updatedCharge.buyMargin === ""
        ? 0
        : updatedCharge.buyMargin;
    updatedCharge.sellMargin =
      updatedCharge.sellMargin === null || updatedCharge.sellMargin === ""
        ? 0
        : updatedCharge.sellMargin;
    // updatedCharge.buyRate = (updatedCharge.buyRate === null || updatedCharge.buyRate === '') ? 0 : updatedCharge.buyRate;
    // Fetch exchange rate for buyCurrencyId
    if (charge.buyCurrencyId === parentCurrencyId) {
      updatedCharge.buyExchangeRate = 1;
    } else if (isHomeCurrency.data && isHomeCurrency.data.length > 0) {
      console.log("Fetching exchange rate data for buyCurrency...");

      const buyExchangeRateRequestData = {
        tableName: "tblExchangeRate",
        whereCondition: {
          clientCode: clientCode,
          status: 1,
          fromCurrencyId: parentCurrencyId,
          toCurrencyId: charge.buyCurrencyId, // For buy currency
        },
        projection: { exportExchangeRate: 1 },
      };

      console.log(
        "Making request for buy exchange rates: ",
        buyExchangeRateRequestData
      );
      const fetchedBuyData = await fetchDataAPI(buyExchangeRateRequestData);

      console.log("Fetched buy exchange rate data: ", fetchedBuyData);
      const buyExchangeRateFromMaster =
        fetchedBuyData.data[0]?.exportExchangeRate;

      if (buyExchangeRateFromMaster) {
        updatedCharge.buyExchangeRate = parseFloat(
          buyExchangeRateFromMaster.toFixed(3)
        );
      } else {
        console.log(
          "No buy exchange rate found in master. Leaving buyExchangeRate unchanged."
        );
      }
    } else {
      const exchangeRate = 1 / parentExchangeRate;
      updatedCharge.buyExchangeRate = parseFloat(exchangeRate.toFixed(3));
    }
    if (charge.sellCurrencyId === parentCurrencyId) {
      // If the sell currency is the same as the parent currency, set exchange rate to 1
      updatedCharge.sellExchangeRate = 1;
    } else {
      const requestData = {
        tableName: "tblCompanyParameter",
        whereCondition: {
          clientCode: clientCode,
          status: 1,
          companyId: companyId,
          currencyId: parentCurrencyId,
        },
        projection: {},
      };

      // Fetch data to check if it's home currency
      const isHomeCurrency = await fetchDataAPI(requestData);

      if (
        isHomeCurrency.data &&
        Array.isArray(isHomeCurrency.data) &&
        isHomeCurrency.data.length > 0
      ) {
        // Only fetch exchange rate from master if it's the home currency
        console.log("Fetching exchange rate data for sellCurrency...");

        const sellExchangeRateRequestData = {
          tableName: "tblExchangeRate",
          whereCondition: {
            clientCode: clientCode,
            status: 1,
            fromCurrencyId: parentCurrencyId,
            toCurrencyId: charge.sellCurrencyId, // For sell currency
          },
          projection: { exportExchangeRate: 1 },
        };

        console.log(
          "Making request for sell exchange rates: ",
          sellExchangeRateRequestData
        );
        const fetchedSellData = await fetchDataAPI(sellExchangeRateRequestData);

        console.log("Fetched sell exchange rate data: ", fetchedSellData);
        const sellExchangeRateFromMaster =
          fetchedSellData.data[0]?.exportExchangeRate;

        // Only set the sell exchange rate if data from the master is found (and it's home currency)
        if (sellExchangeRateFromMaster) {
          updatedCharge.sellExchangeRate = parseFloat(
            sellExchangeRateFromMaster.toFixed(3)
          );
        } else {
          updatedCharge.sellExchangeRate = 1; // Fallback if no data from master
        }
      } else if (isHomeCurrency.data.length == 0) {
        // If not home currency, calculate exchange rate inversely
        const exchangeRate = (1 / parentExchangeRate).toFixed(3);
        updatedCharge.sellExchangeRate = parseFloat(exchangeRate);
      } else {
        updatedCharge.sellExchangeRate = 1; // Default to 1 if no data is found
      }
    }

    console.log(charge, "--  chrge  khush");
    console.log(updatedCharge, "--  updated chrge  khush");

    // Calculate sell rate if buyRate is available
    if (updatedCharge.buyRate) {
      const buyRate = String(updatedCharge.buyRate);
      const buyMargin = String(updatedCharge.buyMargin);
      const sellMargin = String(updatedCharge.sellMargin);

      // Calculate buyMarginValue
      const buyMarginValue = String(
        (
          (parseFloat(buyRate) * parseFloat(buyMargin)) / 100 +
          parseFloat(buyRate)
        ).toFixed(2)
      );

      // Calculate sellRate
      const sellRate = String(
        (
          parseFloat(buyMarginValue) +
          (parseFloat(buyMarginValue) * parseFloat(sellMargin)) / 100
        ).toFixed(2)
      );

      updatedCharge.sellRate = sellRate;
    }

    console.log("Updated charge: ", updatedCharge);
    return updatedCharge;
  };

  const onModalValueChange = async (e, item) => {
    const { name, value } = e.target;
    const updatedCharge = {
      ...item,
      [name]: value,
    };

    // const updatedCharge = await calculateUpdatedCharge({
    //   ...item,
    //   [name]: value,
    // });

    setRate((prevRate) =>
      prevRate.map((rateItem) =>
        rateItem.indexValue === item.indexValue ? updatedCharge : rateItem
      )
    );
  };

  const handleRateChange = (event, chargeGroupId, chargeId, indexValue) => {
    const { name, value } = event.target;
    let childsFieldsObject = childsFields.find(
      (item) => item.tableName === "tblRateRequestCharge"
    );
    let FieldObject = childsFieldsObject.fields.find(
      (item) => item.fieldname === name
    );
    console.log("FieldObject", FieldObject);
    // let OnchangeFunctionToBeCalled = (FieldObject?.functionOnChange !== "" && FieldObject?.functionOnChange !== null) ? FieldObject?.functionOnChange?.split(";") : [];
    // console.log("OnchangeFunctionToBeCalled", OnchangeFunctionToBeCalled);
    let functionRegex = /calculateAndUpdateValues/i;
    let functionRegex2 = /calculateMultipleValues/i;
    let matchedFields = childsFieldsObject.fields.filter((e) => {
      if (e.fieldname !== "qty") {
        const matches = functionRegex.test(e.functionOnChange);
        console.log(`Testing ${e.functionOnChange}: ${matches}`);
        const matches2 = functionRegex2.test(e.functionOnChange);
        return matches || matches2;
      } else {
        return false;
      }
    });

    // Extract functionOnChange values from matched fields
    let OnchangeFunctionToBeCalled = new Set();
    for (const field of matchedFields) {
      field.functionOnChange?.split(";").forEach((func) => {
        if (functionRegex.test(func) || functionRegex2.test(func)) {
          OnchangeFunctionToBeCalled.add(func);
        }
      });
    }
    console.log("OnchangeFunctionToBeCalled", OnchangeFunctionToBeCalled);
    OnchangeFunctionToBeCalled = Array.from(OnchangeFunctionToBeCalled);

    const updatedRate = rate.map((item) => {
      if (name === "buyExchangeRate") {
        console.log("buyExchangeRate", item);
        if (item.indexValue === indexValue) {
          let updatedItem = {
            ...item, // Spread the existing item's properties
            [name]: value, // Update the specific property
            sellExchangeRate: value,
            chargeGroupId: chargeGroupId,
            changeCurrency: currencyDropdown.find(
              (currencyItem) => currencyItem.value === value
            ),
          };

          // Apply additional changes with handleFuncChangeCall
          for (const fnc of OnchangeFunctionToBeCalled || []) {
            updatedItem = handleFuncChangeCall(
              fnc,
              updatedItem,
              name,
              "tblRateRequestCharge",
              updatedItem
            );
          }

          return updatedItem; // Return the updated item
        }
      } else if (name === "buyCurrencyId") {
        console.log("buyCurrencyId", item);
        if (item.indexValue === indexValue) {
          let updatedItem = {
            ...item, // Spread the existing item's properties
            [name]: value, // Update the specific property
            sellCurrencyId: value,
            buyCurrencyIddropdown: [
              {
                label: currencyDropdown.find(
                  (currencyItem) => currencyItem.value === value
                ).label,
                value: value,
              },
            ],
            sellCurrencyIddropdown: [
              {
                label: currencyDropdown.find(
                  (currencyItem) => currencyItem.value === value
                ).label,
                value: value,
              },
            ],
            chargeGroupId: chargeGroupId,
            changeCurrency: currencyDropdown.find(
              (currencyItem) => currencyItem.value === value
            ),
          };

          // Apply additional changes with handleFuncChangeCall
          // for (const fnc of OnchangeFunctionToBeCalled || []) {
          //   updatedItem = handleFuncChangeCall(fnc, updatedItem, name, "tblRateRequestCharge", updatedItem);
          // }
          return updatedItem;
        }
      } else if (name === "sellCurrencyId") {
        console.log("buyCurrencyId", item);
        if (item.indexValue === indexValue) {
          let updatedItem = {
            ...item, // Spread the existing item's properties
            [name]: value, // Update the specific property
            sellCurrencyId: value,
            chargeGroupId: chargeGroupId,
            changeCurrency: currencyDropdown.find(
              (currencyItem) => currencyItem.value === value
            ),
            sellCurrencyIddropdown: [
              {
                label: currencyDropdown.find(
                  (currencyItem) => currencyItem.value === value
                ).label,
                value: value,
              },
            ],
          };

          // Apply additional changes with handleFuncChangeCall

          // for (const fnc of OnchangeFunctionToBeCalled || []) {

          //   updatedItem = handleFuncChangeCall(fnc, updatedItem, name, "tblRateRequestCharge", updatedItem);

          // }

          return updatedItem;
        }
      } else if (name === "buyRate") {
        console.log("buyRate", item);

        if (item.indexValue === indexValue) {
          let updatedItem = {
            ...item, // Spread the existing item's properties

            [name]: value, // Update the specific property
          };

          // Apply additional changes with handleFuncChangeCall

          for (const fnc of OnchangeFunctionToBeCalled || []) {
            updatedItem = handleFuncChangeCall(
              fnc,
              updatedItem,
              name,
              "tblRateRequestCharge",
              updatedItem
            );
          }
          console.log("updatedItem", updatedItem);

          return updatedItem;
        }
      } else if (name === "sellMargin") {
        if (item.indexValue === indexValue) {
          let updatedItem = {
            ...item, // Spread the existing item's properties
            sellMargin: value,
          };

          // Apply additional changes with handleFuncChangeCall
          for (const fnc of OnchangeFunctionToBeCalled || []) {
            updatedItem = handleFuncChangeCall(
              fnc,
              updatedItem,
              name,
              "tblRateRequestCharge",
              updatedItem
            );
          }

          return updatedItem; // Return the updated item
        }
      } else {
        if (item.chargeId === chargeId) {
          let updatedItem = {
            ...item, // Spread the existing item's properties
            [name]: value, // Update the specific property
            chargeGroupId: chargeGroupId,
            changeCurrency: currencyDropdown.find(
              (currencyItem) => currencyItem.value === value
            ),
          };

          // // Apply additional changes with handleFuncChangeCall
          for (const fnc of OnchangeFunctionToBeCalled || []) {
            updatedItem = handleFuncChangeCall(
              fnc,
              updatedItem,
              name,
              "tblRateRequestCharge",
              updatedItem
            );
          }

          return updatedItem; // Return the updated item
        }
      }
      return item;
    });
    console.log("venderModalFunctionCalling", updatedRate);
    // const newRate = rate.map((item) =>
    //   item.chargeId === chargeId
    //     ? {
    //         ...item,
    //         [name]: value,
    //         chargeGroupId: chargeGroupId,
    //         changeCurrency: currencyDropdown.find(
    //           (item) => item.value === value
    //         ),
    //       }
    //     : item
    // );
    setRate(updatedRate);
    setResult(updatedRate);
  };

  console.log("=>>>>", result);

  useEffect(() => {
    // Initialize `rate` with `result` data if needed
    const initialRates = result?.map((item) => ({
      ...item,
      chargeGroupId: item?.chargeGroupId,
      chargeId: item?.chargeId,
      buyRate: item?.buyRate || "",
      buyCurrencyId: item?.buyCurrencyId,
      buyCurrencyIdDropdown: item?.buyCurrencyIddropdown
        ? item.buyCurrencyIddropdown[0]?.label
        : item.buyCurrencyIdDropdown,
    }));
    setRate(initialRates);
  }, [result]);

  const fetchCurrency = async () => {
    const childsFieldsChanges = childsFields
      .filter((obj) => obj.childHeading === "Charges")
      .map((obj) => {
        return obj.fields.find((item) => item.fieldname === "buyCurrencyId");
      });

    const requestData = {
      onfilterkey: "status",
      onfiltervalue: 1,
      referenceTable: "tblMasterData",
      referenceColumn: "code",
      dropdownFilter:
        "and masterListId in (select id from tblMasterList  where name = 'tblCurrency')",
      search: null,
      pageNo: 1,
      value: null,
    };

    const { data } = await dynamicDropDownFieldsData(requestData);
    setCurrencyDropdown(data);
  };

  useEffect(() => {
    fetchCurrency();
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { clientCode } = getUserDetails();
        const storedUserData = localStorage.getItem("userData");
        if (storedUserData !== null) {
          const decryptedData = decrypt(storedUserData);
          const userData = JSON.parse(decryptedData);
          const clientId = userData[0]?.clientId;

          // Prepare a request for each item in the result array
          const requests = result.map(async (item) => {
            console.log("item", item);
            let typeIdDropdown =
              item?.typeIdDropdown || item?.typeIddropdown[0]?.label;

            console.log("typeIdDropdown", typeIdDropdown);

            // Prepare requestData for API cal

            const requestData = {
              columns: "code",
              tableName: "tblMasterData",
              whereCondition: `name = ${typeIdDropdown} and status = 1`,
              clientIdCondition: `clientId in (${clientId},(select id from tblClient where clientCode = 'SYSCON')) FOR JSON PATH`,
            };

            // Fetch type code from API
            const typeCode = await fetchReportData(requestData);
            const code = typeCode?.data[0].code || typeCode[0].code;

            return { typeIdDropdown, code };
          });

          const results = await Promise.all(requests);
          console.log("type codes ", results);

          // Update state with fetched type codes
          setTypeCodes(results);
          setLoading(false);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        setLoading(false);
      }
    };

    if (result.length > 0) {
      fetchData();
    }
  }, [result]);

  return (
    <Modal
      aria-labelledby="transition-modal-title"
      aria-describedby="transition-modal-description"
      open={openModal}
      onClose={handleClose}
      closeAfterTransition
      BackdropComponent={Backdrop}
      BackdropProps={{ timeout: 500 }}
    >
      <Fade in={openModal}>
        <Box className="relative inset-0 bg-opacity-50 overflow-y-auto h-full w-full flex justify-center items-center px-4">
          <Box className="bg-[var(--commonBg)] w-9/10 h-4/5 p-4 rounded shadow-lg flex flex-col p-8 ">
            <Box>
              <Box className="flex flex-col gap-2 mt-5">
                <Box className="flex items-center gap-5">
                  <FormControl className="border border-solid border-[var(--inputBorderColor)] rounded-[4px] !min-w-[250px] !text-xs">
                    <InputLabel
                      id="demo-simple-select-label"
                      sx={{
                        color: "var(--inputTextColor)", // Default color
                        background: "var(--commonBg)",
                        fontSize: "11px !important",
                        marginTop: "-9px !important",
                        "&.Mui-focused": {
                          color: "var(--inputTextColor) !important", // Color on focus with !important
                          background: "var(--commonBg)",
                          fontSize: "11px !important",
                          marginTop: "0 !important",
                        },
                      }}
                    >
                      Charge Group
                    </InputLabel>
                    <Select
                      labelId="demo-simple-select-label"
                      id="demo-simple-select"
                      value={dropdownVal.chargeGroup}
                      label="Charge Group"
                      name="chargeGroup"
                      onChange={handleChange}
                      className=""
                      sx={{
                        "& .MuiSvgIcon-root": {
                          color: "var(--inputTextColor)",
                          fontSize: "11px !important",
                          padding: "2px 14px 5px 14px !important",
                        },
                        "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                          borderColor: "transparent !important",
                          fontSize: "11px !important", // Ensure border stays transparent on focus
                          padding: "2px 14px 5px 14px !important",
                        },
                        "& .MuiSelect-select": {
                          color: "var(--inputTextColor)",
                          fontSize: "11px !important",
                          padding: "2px 14px 5px 14px !important",
                        },
                      }}
                      endAdornment={
                        dropdownVal.chargeGroup && (
                          <InputAdornment position="end">
                            <IconButton
                              onClick={() => {
                                setDropdownVal((prev) => ({
                                  ...prev,
                                  chargeGroup: "",
                                }));
                              }}
                              sx={{
                                "& .MuiSvgIcon-root": {
                                  color: "var(--inputTextColor)",
                                  fontSize: "11px !important",
                                },
                              }}
                            >
                              <ClearIcon />
                            </IconButton>
                          </InputAdornment>
                        )
                      }
                    >
                      {chargeGroup?.map((item, index) => {
                        return (
                          <MenuItem
                            key={index}
                            value={item?.chargeGroupId}
                            sx={{
                              fontSize: "11px !important",
                              padding: "4px 16px !important",
                            }}
                          >
                            {item?.chargeGroupIddropdown
                              ? item?.chargeGroupIddropdown[0]?.label
                              : item?.chargeGroupIdDropdown}
                          </MenuItem>
                        );
                      })}
                    </Select>
                  </FormControl>
                  <FormControl className="border border-solid border-[var(--inputBorderColor)] rounded-[4px] !min-w-[250px] text-xs">
                    <InputLabel
                      id="demo-simple-select-label"
                      sx={{
                        color: "var(--inputTextColor)", // Default color
                        background: "var(--commonBg)",
                        fontSize: "11px !important",
                        marginTop: "-9px !important",
                        "&.Mui-focused": {
                          color: "var(--inputTextColor) !important", // Color on focus with !important
                          background: "var(--commonBg)",
                          fontSize: "12px !important",
                          marginTop: "0px !important",
                        },
                      }}
                    >
                      Vendor
                    </InputLabel>
                    <Select
                      labelId="demo-simple-select-label"
                      id="demo-simple-select"
                      value={dropdownVal.vendor}
                      label="Vendor"
                      name="vendor"
                      onChange={handleChange}
                      sx={{
                        "& .MuiSvgIcon-root": {
                          color: "var(--inputTextColor)",
                          fontSize: "11px !important",
                          padding: "2px 14px 5px 14px !important",
                        },
                        "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                          borderColor: "transparent !important",
                          fontSize: "11px !important", // Ensure border stays transparent on focus
                          padding: "2px 14px 5px 14px !important",
                        },
                        "& .MuiSelect-select": {
                          color: "var(--inputTextColor)",
                          fontSize: "11px !important",
                          padding: "2px 14px 5px 14px !important",
                        },
                      }}
                      endAdornment={
                        dropdownVal.vendor && (
                          <InputAdornment
                            sx={{ marginRight: "10px" }}
                            position="end"
                          >
                            <IconButton
                              onClick={() => {
                                setDropdownVal((prev) => ({
                                  ...prev,
                                  vendor: "",
                                }));
                              }}
                              sx={{
                                "& .MuiSvgIcon-root": {
                                  color: "var(--inputTextColor)",
                                  fontSize: "12px !important",
                                },
                              }}
                            >
                              <ClearIcon />
                            </IconButton>
                          </InputAdornment>
                        )
                      }
                    >
                      {vendorNames?.map((item, index) => {
                        return (
                          <MenuItem
                            key={index}
                            value={item?.vendorId}
                            sx={{
                              fontSize: "11px !important",
                              padding: "4px 16px !important",
                            }}
                          >
                            {item.vendorIddropdown
                              ? item?.vendorIddropdown[0]?.label
                              : item?.vendorIdDropdown}
                          </MenuItem>
                        );
                      })}
                    </Select>
                  </FormControl>
                </Box>
                <Box className="flex gap-2">
                  <Button
                    variant="contained"
                    className={`capitalize ${appStyles.commonBtn} w-fit !text-xs `}
                    onClick={handleGroupChange}
                  >
                    Go
                  </Button>
                  <Button
                    variant="contained"
                    className={`capitalize ${appStyles.commonBtn} w-fit !text-xs `}
                    onClick={handleClose}
                  >
                    Close
                  </Button>
                  <Button
                    variant="contained"
                    className={`capitalize ${appStyles.commonBtn} w-fit !text-xs `}
                    onClick={() => {
                      save(rate);
                      handleClose();
                    }}
                    disabled={!result.length ? true : false}
                  >
                    Save
                  </Button>
                </Box>
              </Box>
              <Box
                className={`flex flex-col justify-between gap-2 pt-4 overflow-y-auto max-h-[60vh] scrollBarBlue`}
              >
                <Box
                  className="grid gap-1 bg-[var(--tableHeaderBg)] p-2 text-[var(--text-color-500)] rounded-[4px] !text-[10px]"
                  style={{
                    gridTemplateColumns:
                      "minmax(100px, 200px) repeat(10, 100px)",
                    alignItems: "center",
                  }}
                >
                  <Typography
                    variant="p"
                    className="!text-xs font-semibold"
                    style={{ textAlign: "left" }}
                  >
                    Charges Name
                  </Typography>
                  <Typography
                    variant="p"
                    className="!text-xs font-semibold"
                    style={{
                      display: transportMode === "Air" ? "none" : "block",
                      textAlign: "center",
                    }}
                  >
                    Buy Currency
                  </Typography>
                  <Typography
                    variant="p"
                    className="!text-xs font-semibold"
                    style={{
                      display: transportMode === "Air" ? "none" : "block",
                      textAlign: "center",
                    }}
                  >
                    Buy Ex. Rate
                  </Typography>

                  <Typography
                    variant="p"
                    className="!text-xs font-semibold"
                    style={{
                      display: transportModeType === "Air" ? "none" : "block",
                      textAlign: "center",
                    }}
                  >
                    Buy Margin
                  </Typography>

                  <Typography
                    variant="p"
                    className="!text-xs font-semibold"
                    style={{ textAlign: "center" }}
                  >
                    Buy Rate
                  </Typography>

                  <Typography
                    variant="p"
                    className="!text-xs font-semibold"
                    style={{ textAlign: "center" }}
                  >
                    Sell Margin
                  </Typography>
                  <Typography
                    variant="p"
                    className="!text-xs font-semibold"
                    style={{
                      display: transportMode === "Air" ? "none" : "block",
                      textAlign: "center",
                    }}
                  >
                    Sell Currency
                  </Typography>
                  <Typography
                    variant="p"
                    className="!text-xs font-semibold"
                    style={{ textAlign: "center" }}
                  >
                    Sell Ex. Rate
                  </Typography>
                  <Typography
                    variant="p"
                    className="!text-xs font-semibold"
                    style={{ textAlign: "center" }}
                  >
                    Sell Rate
                  </Typography>
                  <Typography
                    variant="p"
                    className="!text-xs font-semibold "
                    style={{ textAlign: "center" }}
                  >
                    Sell Amount
                  </Typography>
                </Box>
                <Box>
                  {!result.length ? (
                    <Box className="flex justify-center mt-4">
                      <Typography
                        variant="body1"
                        className="text-[var(--inputTextColor)] uppercase font-semibold"
                      >
                        No Data Found!
                      </Typography>
                    </Box>
                  ) : loading || !typeCode ? (
                    <Typography
                      variant="body1"
                      className="text-[var(--inputTextColor)] uppercase font-semibold"
                    >
                      Loading...
                    </Typography>
                  ) : (
                    result.map((item, index) => {
                      // Finding the correct typeCode for the current item
                      const typeCodeArray = typeCode.find(
                        (codeItem) => codeItem?.code || codeItem?.code
                      );

                      console.log("type code for arr", typeCodeArray?.code);

                      return (
                        <Box
                          key={index}
                          className="grid gap-2 mt-2"
                          style={{
                            gridTemplateColumns:
                              "minmax(100px, 200px) repeat(10, 100px)",
                          }}
                        >
                          {/* Charge ID Dropdown */}
                          <Typography
                            variant="body2"
                            className="!text-xs text-[var(--inputTextColor)] col-span-1"
                            style={{ textAlign: "left" }}
                          >
                            {sizeTypeData === "Air"
                              ? `${
                                  item?.chargeIdDropdown ||
                                  item?.chargeIddropdown?.[0]?.label ||
                                  ""
                                }`
                              : `${
                                  item?.chargeIdDropdown ||
                                  item?.chargeIddropdown?.[0]?.label ||
                                  ""
                                }
     - ${
       item?.sizeIdDropdown ||
       item?.sizeIddropdown?.[0]?.label ||
       item?.sizeIddropdown ||
       ""
     }
     / ${
       typeCodeArray?.code ||
       item?.typeIddropdown?.[0]?.label ||
       item?.typeIddropdown ||
       ""
     }`}
                          </Typography>
                          {/* Buy Currency Select */}
                          {transportMode !== "Sea" && (
                            <FormControl className="border border-[var(--inputBorderColor)] rounded-[4px] mb-[8px] max-w-[100px]">
                              <InputLabel
                                id="demo-simple-select-label"
                                style={{
                                  display:
                                    transportMode === "Air" ? "none" : "block",
                                }}
                                sx={{
                                  fontSize: "8px",
                                  color: "var(--inputTextColor)",
                                  background: "var(--commonBg)",
                                  "&.Mui-focused": {
                                    color: "var(--inputTextColor) !important",
                                    background: "var(--commonBg)",
                                  },
                                  "&[data-shrink=false]": {
                                    transform: "translate(14px, 6px) scale(1)",
                                  },
                                }}
                              >
                                Buy Currency
                              </InputLabel>
                              <Select
                                labelId="demo-simple-select-label"
                                id="demo-simple-select"
                                style={{
                                  display:
                                    transportMode === "Air" ? "none" : "block",
                                }}
                                defaultValue={
                                  item?.buyCurrencyIddropdown
                                    ? item?.buyCurrencyIddropdown[0]?.value
                                    : item?.buyCurrencyId
                                }
                                Value={
                                  item?.buyCurrencyIddropdown
                                    ? item?.buyCurrencyIddropdown[0]?.value
                                    : item?.buyCurrencyId
                                }
                                label="Currency"
                                name="buyCurrencyId"
                                sx={{
                                  height: "22px !important",
                                  fontSize: "10px",
                                  border: "1px solid var(--inputBorderColor)",
                                  "& .MuiSvgIcon-root": {
                                    color: "var(--inputTextColor)",
                                    border: "1px solid var(--inputBorderColor)",
                                  },
                                  "&.Mui-focused .MuiOutlinedInput-notchedOutline":
                                    {
                                      border:
                                        "1px solid var(--inputBorderColor)",
                                      color: "var(--inputTextColor)",
                                      fontSize: "10px !important",
                                    },
                                  "& .MuiSelect-select": {
                                    color: "var(--inputTextColor)",
                                    fontSize: "10px !important",
                                    border: "1px solid var(--inputBorderColor)",
                                  },
                                }}
                                onChange={(e) => {
                                  handleRateChange(
                                    e,
                                    item?.chargeGroupId,
                                    item?.chargeId,
                                    item?.indexValue
                                  );
                                  onModalValueChange(e, item);
                                }}
                              >
                                {currencyDropdown.map((currencyItem, index) => (
                                  <MenuItem
                                    key={index}
                                    value={currencyItem.value}
                                    sx={{
                                      fontSize: "10px !important",
                                    }}
                                    onClick={() =>
                                      setChangeCurrency(currencyItem)
                                    }
                                  >
                                    {currencyItem.label}
                                  </MenuItem>
                                ))}
                              </Select>
                            </FormControl>
                          )}
                          {transportMode !== "Air" && (
                            <FormControl className="border border-[var(--inputBorderColor)] rounded-[4px] mb-[8px] max-w-[100px]">
                              <InputLabel
                                id="demo-simple-select-label"
                                style={{
                                  display:
                                    transportMode === "Air" ? "none" : "block",
                                }}
                                sx={{
                                  fontSize: "8px",
                                  color: "var(--inputTextColor)",
                                  background: "var(--commonBg)",
                                  borderColor:
                                    "var(--inputTextColor) !important",
                                  "&.Mui-focused": {
                                    color: "var(--inputTextColor) !important",
                                    background: "var(--commonBg)",
                                    borderColor:
                                      "var(--inputTextColor) !important",
                                  },
                                  "&[data-shrink=false]": {
                                    transform: "translate(14px, 6px) scale(1)",
                                  },
                                }}
                              >
                                Buy Currency
                              </InputLabel>
                              <Select
                                labelId="demo-simple-select-label"
                                id="demo-simple-select"
                                style={{
                                  display:
                                    transportMode === "Air" ? "none" : "block",
                                }}
                                defaultValue={
                                  item?.buyCurrencyIddropdown
                                    ? item?.buyCurrencyIddropdown[0]?.value
                                    : item?.buyCurrencyId
                                }
                                Value={
                                  item?.buyCurrencyIddropdown
                                    ? item?.buyCurrencyIddropdown[0]?.value
                                    : item?.buyCurrencyId
                                }
                                label="Currency"
                                name="buyCurrencyId"
                                sx={{
                                  height: "22px",
                                  fontSize: "10px !important",
                                  border: "1px solid var(--inputBorderColor)",
                                  "& .MuiSvgIcon-root": {
                                    color: "var(--inputTextColor)",
                                  },
                                  "&.Mui-focused .MuiOutlinedInput-notchedOutline":
                                    {
                                      fontSize: "10px !important",
                                      border:
                                        "1px solid var(--inputBorderColor)",
                                    },
                                  "& .MuiSelect-select": {
                                    color: "var(--inputTextColor)",
                                    fontSize: "10px !important",
                                    padding: "4px 8px",
                                  },
                                }}
                                onChange={(e) => {
                                  handleRateChange(
                                    e,
                                    item?.chargeGroupId,
                                    item?.chargeId,
                                    item?.indexValue
                                  );
                                  onModalValueChange(e, item);
                                }}
                              >
                                {currencyDropdown.map((currencyItem, index) => (
                                  <MenuItem
                                    key={index}
                                    value={currencyItem.value}
                                    sx={{
                                      fontSize: "10px !important",
                                    }}
                                    onClick={() =>
                                      setChangeCurrency(currencyItem)
                                    }
                                  >
                                    {currencyItem.label}
                                  </MenuItem>
                                ))}
                              </Select>
                            </FormControl>
                          )}

                          {/* Buy Exchange Rate Akash */}
                          <TextField
                            type="number"
                            name="buyExchangeRate"
                            style={{
                              display:
                                transportMode === "Air" ? "none" : "block",
                            }}
                            sx={{
                              "& .MuiInputBase-input": {
                                padding: "4px 8px",
                                color: "var(--inputTextColor)",
                                height: "14px",
                                fontSize: "10px !important",
                                border: "1px solid var(--inputBorderColor)",
                                "&::-webkit-outer-spin-button, &::-webkit-inner-spin-button":
                                  {
                                    display: "none",
                                  },
                              },
                              "& .MuiOutlinedInput-root": {
                                "&.Mui-focused fieldset": {
                                  border:
                                    "1px solid var(--inputBorderColor) !important",
                                },
                              },
                            }}
                            className="border border-[var(--inputBorderColor)] mb-[8px] rounded-[4px] max-w-[100px]"
                            defaultValue={
                              transportMode === "Air"
                                ? "1"
                                : item?.buyExchangeRate
                            }
                            value={item?.buyExchangeRate}
                            onChange={(e) => {
                              handleRateChange(
                                e,
                                item?.chargeGroupId,
                                item?.chargeId,
                                item?.indexValue
                              );
                              onModalValueChange(e, item);
                            }}
                          />

                          {/* Buy Margin */}
                          <TextField
                            type="number"
                            name="buyMargin"
                            style={{
                              display:
                                transportModeType === "Air" ? "none" : "block",
                            }}
                            sx={{
                              "& .MuiInputBase-input": {
                                padding: "4px 8px",
                                color: "var(--inputTextColor)",
                                fontSize: "10px !important",
                                height: "14px",
                                border: "1px solid var(--inputBorderColor)",
                                "&::-webkit-outer-spin-button, &::-webkit-inner-spin-button":
                                  {
                                    display: "none",
                                  },
                                "-moz-appearance": "textfield",
                              },
                              "& .MuiOutlinedInput-root": {
                                "&.Mui-focused fieldset": {
                                  border: "1px solid var(--inputBorderColor)",
                                },
                              },
                              "&.Mui-focused .MuiOutlinedInput-notchedOutline":
                                {
                                  fontSize: "10px !important",
                                  border: "1px solid var(--inputBorderColor)",
                                },
                            }}
                            className="border border-[var(--inputBorderColor)] mb-[8px] rounded-[4px] max-w-[100px]"
                            defaultValue={
                              transportModeType === "Air"
                                ? "0"
                                : item?.buyMargin
                            }
                            onChange={(e) => {
                              handleRateChange(
                                e,
                                item?.chargeGroupId,
                                item?.chargeId,
                                item?.indexValue
                              );
                              onModalValueChange(e, item);
                            }}
                          />

                          {/* Buy Rate */}
                          <TextField
                            type="number"
                            name="buyRate"
                            sx={{
                              "& .MuiInputBase-input": {
                                padding: "4px 8px",
                                color: "var(--inputTextColor)",
                                height: "14px",
                                fontSize: "10px !important",
                                border: "1px solid var(--inputBorderColor)",
                                "&::-webkit-outer-spin-button, &::-webkit-inner-spin-button":
                                  {
                                    display: "none",
                                  },
                                "-moz-appearance": "textfield",
                              },
                              "& .MuiOutlinedInput-root": {
                                "&.Mui-focused fieldset": {
                                  border: "1px solid var(--inputBorderColor)",
                                },
                              },
                            }}
                            className="border border-[var(--inputBorderColor)] mb-[8px] rounded-[4px] max-w-[100px]"
                            defaultValue={item.buyRate}
                            onChange={(e) => {
                              handleRateChange(
                                e,
                                item?.chargeGroupId,
                                item?.chargeId,
                                item?.indexValue
                              );
                              onModalValueChange(e, item);
                            }}
                          />

                          {/* Sell Margin */}
                          <TextField
                            type="number"
                            name="sellMargin"
                            sx={{
                              "& .MuiInputBase-input": {
                                padding: "4px 8px",
                                color: "var(--inputTextColor)",
                                height: "14px",
                                fontSize: "10px !important",
                                border: "1px solid var(--inputBorderColor)",
                                "&::-webkit-outer-spin-button, &::-webkit-inner-spin-button":
                                  {
                                    display: "none",
                                  },
                                "-moz-appearance": "textfield",
                              },
                              "& .MuiOutlinedInput-root": {
                                "&.Mui-focused fieldset": {
                                  border: "1px solid var(--inputBorderColor)",
                                },
                              },
                            }}
                            className="border border-[var(--inputBorderColor)] mb-[8px] rounded-[4px] max-w-[100px]"
                            defaultValue={item.sellMargin}
                            onChange={(e) => {
                              handleRateChange(
                                e,
                                item?.chargeGroupId,
                                item?.chargeId,
                                item?.indexValue
                              );
                              onModalValueChange(e, item);
                            }}
                          />

                          {/* Sell Currency Select */}
                          {transportModeType !== "Air" && (
                            <FormControl
                              fullWidth
                              className="border border-[var(--inputBorderColor)] rounded-[4px] mb-[8px] max-w-[100px]"
                            >
                              <InputLabel
                                id="demo-simple-select-label"
                                style={{
                                  display:
                                    transportMode === "Air" ? "none" : "block",
                                }}
                                sx={{
                                  fontSize: "10px !important",
                                  color: "var(--inputTextColor)",
                                  background: "var(--commonBg)",
                                  "&.Mui-focused": {
                                    color: "var(--inputTextColor) !important",
                                    background: "var(--commonBg)",
                                    fontSize: "10px !important",
                                  },
                                  "&[data-shrink=false]": {
                                    transform: "translate(14px, 6px) scale(1)",
                                  },
                                }}
                              >
                                Sell Currency
                              </InputLabel>
                              <Select
                                labelId="demo-simple-select-label"
                                id="demo-simple-select"
                                style={{
                                  display:
                                    transportMode === "Air" ? "none" : "block",
                                }}
                                defaultValue={
                                  item?.buyCurrencyIddropdown?.length
                                    ? item?.buyCurrencyIddropdown[0]?.value
                                    : item?.buyCurrencyId || ""
                                }
                                value={
                                  item?.sellCurrencyIddropdown?.length
                                    ? item?.sellCurrencyIddropdown[0]?.value
                                    : item?.sellCurrencyId || ""
                                }
                                label="Sell Currency"
                                name="sellCurrencyId"
                                sx={{
                                  height: "22px",
                                  fontSize: "10px !important",
                                  border: "1px solid var(--inputBorderColor)",
                                  "& .MuiSvgIcon-root": {
                                    color: "var(--inputTextColor)",
                                  },
                                  "&.Mui-focused .MuiOutlinedInput-notchedOutline":
                                    {
                                      borderColor:
                                        "var(--inputTextColor) !important",
                                      fontSize: "11px !important",
                                    },
                                  "& .MuiSelect-select": {
                                    borderColor:
                                      "var(--inputTextColor) !important",
                                    color: "var(--inputTextColor)",
                                    padding: "4px 8px",
                                  },
                                }}
                                onChange={(e) => {
                                  handleRateChange(
                                    e,
                                    item?.chargeGroupId,
                                    item?.chargeId,
                                    item?.indexValue
                                  );
                                  onModalValueChange(e, item);
                                }}
                              >
                                {currencyDropdown.map((currencyItem, index) => (
                                  <MenuItem
                                    key={index}
                                    value={currencyItem.value}
                                    style={{ fontSize: "10px" }}
                                    onClick={() =>
                                      setChangeCurrency(currencyItem)
                                    }
                                  >
                                    {currencyItem.label}
                                  </MenuItem>
                                ))}
                              </Select>
                            </FormControl>
                          )}
                          {transportModeType == "Air" && (
                            <FormControl
                              fullWidth
                              className="border border-[var(--inputBorderColor)] rounded-[4px] mb-[8px] max-w-[100px]"
                            >
                              <InputLabel
                                id="demo-simple-select-label"
                                style={{
                                  display:
                                    transportMode === "Air" ? "none" : "block",
                                }}
                                sx={{
                                  fontSize: "10px !important",
                                  color: "var(--inputTextColor)",
                                  background: "var(--commonBg)",
                                  "&.Mui-focused": {
                                    fontSize: "10px !important",
                                    color: "var(--inputTextColor) !important",
                                    background: "var(--commonBg)",
                                  },
                                  "&[data-shrink=false]": {
                                    transform: "translate(14px, 6px) scale(1)",
                                  },
                                }}
                              >
                                Sell Currency
                              </InputLabel>
                              <Select
                                labelId="demo-simple-select-label"
                                id="demo-simple-select"
                                style={{
                                  display:
                                    transportMode === "Air" ? "none" : "block",
                                }}
                                defaultValue={item?.buyCurrencyId}
                                value={
                                  item?.sellCurrencyIddropdown?.length
                                    ? item?.sellCurrencyIddropdown[0]?.value
                                    : item?.sellCurrencyId || ""
                                }
                                label="Sell Currency"
                                name="sellCurrencyId"
                                sx={{
                                  height: "26px",
                                  fontSize: "10px !important",
                                  border: "1px solid var(--inputBorderColor)",
                                  "& .MuiSvgIcon-root": {
                                    color: "var(--inputTextColor)",
                                    border: "1px solid var(--inputBorderColor)",
                                    fontSize: "10px !important",
                                    top: "calc(70% - .5em)",
                                  },
                                  "&.Mui-focused .MuiOutlinedInput-notchedOutline":
                                    {
                                      border:
                                        "1px solid var(--inputBorderColor)",
                                      fontSize: "10px !important",
                                    },
                                  "& .MuiSelect-select": {
                                    color: "var(--inputTextColor)",
                                    border: "1px solid var(--inputBorderColor)",
                                    fontSize: "10px !important",
                                    padding: "4px 8px",
                                  },
                                }}
                                onChange={(e) => {
                                  handleRateChange(
                                    e,
                                    item?.chargeGroupId,
                                    item?.chargeId,
                                    item?.indexValue
                                  );
                                  onModalValueChange(e, item);
                                }}
                              >
                                {currencyDropdown.map((currencyItem, index) => (
                                  <MenuItem
                                    key={index}
                                    value={currencyItem.value}
                                    style={{ fontSize: "10px" }}
                                    onClick={() =>
                                      setChangeCurrency(currencyItem)
                                    }
                                  >
                                    {currencyItem.label}
                                  </MenuItem>
                                ))}
                              </Select>
                            </FormControl>
                          )}

                          {/* Sell Exchange Rate */}
                          <TextField
                            type="number"
                            name="sellExchangeRate"
                            sx={{
                              "& .MuiInputBase-input": {
                                padding: "4px 8px",
                                color: "var(--inputTextColor)",
                                fontSize: "10px !important",
                                height: "14px",
                                "&::-webkit-outer-spin-button, &::-webkit-inner-spin-button":
                                  {
                                    display: "none",
                                  },
                                border: "1px solid var(--inputBorderColor)",
                                "-moz-appearance": "textfield",
                              },
                              "& .MuiOutlinedInput-root": {
                                "&.Mui-focused fieldset": {
                                  border: "1px solid var(--inputBorderColor)",
                                },
                              },
                            }}
                            className="border border-[var(--inputBorderColor)] mb-[8px] rounded-[4px] max-w-[100px]"
                            defaultValue={item.sellExchangeRate}
                            value={item?.sellExchangeRate}
                            onChange={(e) => {
                              handleRateChange(
                                e,
                                item?.chargeGroupId,
                                item?.chargeId,
                                item?.indexValue
                              );
                              onModalValueChange(e, item);
                            }}
                          />

                          {/* Sell Rate */}
                          <TextField
                            type="number"
                            name="sellRate"
                            sx={{
                              "& .MuiInputBase-input": {
                                padding: "4px 8px",
                                color: "var(--inputTextColor) !important",
                                height: "14px",
                                fontSize: "10px !important",
                                border: "1px solid var(--inputBorderColor)",
                                "&::-webkit-outer-spin-button, &::-webkit-inner-spin-button":
                                  {
                                    display: "none",
                                  },
                                "-moz-appearance": "textfield",
                              },
                              "& .MuiOutlinedInput-root": {
                                "&.Mui-focused fieldset": {
                                  border: "1px solid var(--inputBorderColor)",
                                },
                              },
                            }}
                            className="border border-[var(--inputBorderColor)] mb-[8px] rounded-[4px] max-w-[100px]"
                            defaultValue={item.sellRate}
                            value={item?.sellRate}
                            onChange={(e) => {
                              handleRateChange(
                                e,
                                item?.chargeGroupId,
                                item?.chargeId,
                                item?.indexValue
                              );
                              onModalValueChange(e, item);
                            }}
                          />
                          <TextField
                            type="number"
                            name="sellAmount"
                            sx={{
                              "& .MuiInputBase-input": {
                                padding: "4px 8px",
                                color: "var(--inputTextColor)",
                                fontSize: "10px !important",
                                height: "14px",
                                border: "1px solid var(--inputBorderColor)",
                                "&::-webkit-outer-spin-button, &::-webkit-inner-spin-button":
                                  {
                                    display: "none",
                                  },
                                "-moz-appearance": "textfield",
                              },
                              "& .MuiOutlinedInput-root": {
                                "&.Mui-focused fieldset": {
                                  border: "1px solid var(--inputBorderColor)",
                                },
                              },
                            }}
                            className="border border-[var(--inputBorderColor)] mb-[8px] rounded-[4px] max-w-[100px]"
                            defaultValue={item?.sellAmount}
                            value={item?.sellAmount}
                            onChange={(e) => {
                              handleRateChange(
                                e,
                                item?.chargeGroupId,
                                item?.chargeId,
                                item?.indexValue
                              );
                              onModalValueChange(e, item);
                            }}
                          />
                        </Box>
                      );
                    })
                  )}
                </Box>
              </Box>
            </Box>
          </Box>
        </Box>
      </Fade>
    </Modal>
  );
};

VendorModal.propTypes = {
  openModal: PropTypes.bool,
  setOpenModal: PropTypes.func,
  tblRateRequestCharge: PropTypes.array,
  save: PropTypes.func,
  childsFields: PropTypes.array,
  newState: PropTypes.array,
  isAdd: PropTypes.bool,
};

export default VendorModal;
