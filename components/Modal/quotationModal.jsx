/* eslint-disable */
import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import PropTypes, { array } from "prop-types";
import {
  Backdrop,
  Box,
  Checkbox,
  Chip,
  Fade,
  FormControl,
  FormControlLabel,
  InputLabel,
  MenuItem,
  Modal,
  OutlinedInput,
  Select,
  Radio,
  RadioGroup,
} from "@mui/material";
import appStyles from "@/app/app.module.css";
import { useTheme } from "@emotion/react";
import stylesModal from "@/components/common.module.css";
import { decrypt } from "@/helper/security";
import { fetchReportData } from "@/services/auth/FormControl.services";
import { getUserDetails } from "@/helper/userDetails";
import CloseIcon from "@mui/icons-material/Close";

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;

function getStyles(name, selectedNames, theme) {
  return {
    fontWeight:
      selectedNames.indexOf(name) === -1
        ? theme.typography.fontWeightRegular
        : theme.typography.fontWeightMedium,
  };
}
//Akash 09_09_2024
function QuotationModal({
  newState,
  tblRateRequestCharge,
  setOpenModal,
  openModal,
  onSave,
  onSaveGroup,
  isAdd,
  scopeOfWork,
}) {
  const handleClose = () => setOpenModal(false);
  const theme = useTheme();
  const [charges, setCharges] = useState([]);
  const [vendorNames, setVendorNames] = useState({});
  const [selectedVendors, setSelectedVendors] = useState({});
  const [originalObjects, setOriginalObjects] = useState([]);
  const [receivedNewState, setReceivedNewState] = useState(newState);
  const [lastFinalState, setLastFinalState] = useState(newState);
  const [isAddFormType, setIsAddFormType] = useState(isAdd);
  const [scopeOfWorkData, setScopeOfWorkData] = useState(scopeOfWork);
  const [transportMode, setTransportMode] = useState(null);
  const [newScopeOfWork, setNewScopeOfWork] = useState([]);
  const [selectedOption, setSelectedOption] = useState("option1");
  const [transportModeData, setTransportModeData] = useState(null);
  const { clientId } = getUserDetails();
  const [client, setClientId] = useState(clientId);
  const [deletionLogOfChargeGroup, setDeletionLogOfChargeGroup] = useState([]);
  const [deletionLogSingleCharges, setDeletionLogSingleCharges] = useState([]);

  useEffect(() => {
    setClientId(clientId);
  }, []);

  useEffect(() => {
    const fetchTransportMode = async () => {
      if (newState?.businessSegmentId) {
        const requestForDepartment = {
          columns: "name",
          tableName: "tblBusinessSegment",
          whereCondition: `id = ${newState?.businessSegmentId}`,
          clientIdCondition: `status = 1 and clientId in (${client},(select id from tblClient where clientCode = 'SYSCON')) FOR JSON PATH`,
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
            setTransportModeData(transportMode);
            setTransportMode(transportMode);
          }
        } catch (error) {
          console.error("Error fetching transport mode:", error);
        }
      }
    };

    fetchTransportMode();
  }, [newState]);

  useEffect(() => {
    const fetchData = async () => {
      const ids = scopeOfWorkData.split(",");
      const finalData = [];

      try {
        // Fetch main data for each ID
        for (let id of ids) {
          const mainQuery = {
            columns: "id,name",
            tableName: "tblMasterData",
            whereCondition: `id = ${id}`,
            clientIdCondition: "status = 1 FOR JSON PATH",
          };

          const mainResponse = await fetchReportData(mainQuery);

          if (mainResponse.success && mainResponse.data.length > 0) {
            // Assuming only one item per ID, extract the main data
            const mainItem = mainResponse.data[0];

            // Now, fetch the charges for this item
            const chargesQuery = {
              columns:
                "c.id,c.name,c.sellMargin,c.buyMargin,c.rateBasisId,c.currencyId",
              tableName:
                "tblCharge c Left Join tblChargeGroups cg on cg.chargeId = c.id",
              whereCondition: `cg.chargeGroupId = ${id}`,
              clientIdCondition: "c.status = 1 and cg.status = 1 FOR JSON PATH",
            };
            const chargesResponse = await fetchReportData(chargesQuery);

            // Add the charges to the main item
            mainItem.charges = chargesResponse.success
              ? chargesResponse.data
              : [];

            // Push the completed item into the final array
            if (mainItem?.charges.length > 0) {
              finalData.push(mainItem);
              console.log("finalData", finalData);
            }
          }
        }

        setNewScopeOfWork(finalData);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    if (scopeOfWorkData) {
      fetchData();
    }
  }, [scopeOfWorkData]);

  useEffect(() => {
    const fetchVendorNames = async (transportMode) => {
      try {
        let requestBody = {};
        if (transportMode.toLowerCase() === "air") {
          requestBody = {
            columns: "c.id,c.name",
            tableName:
              "tblCompany c Left join tblCompanySubtype cs on cs.companyId = c.id Left join tblMasterData md on md.id = cs.subTypeId",
            whereCondition: `md.name = 'AIRLINE' and cs.status = 1 and md.status = 1 and c.status = 1`,
            clientIdCondition: `c.clientId in (${client},(select id from tblClient where clientCode = 'SYSCON')) and cs.clientId in (${client},(select id from tblClient where clientCode = 'SYSCON')) FOR JSON PATH`,
          };
        } else if (transportMode.toLowerCase() === "sea") {
          requestBody = {
            columns: "c.id,c.name",
            tableName:
              "tblCompany c Left join tblCompanySubtype cs on cs.companyId = c.id Left join tblMasterData md on md.id = cs.subTypeId",
            whereCondition: `md.name = 'VENDOR' and cs.status = 1 and md.status = 1 and c.status = 1`,
            clientIdCondition: `c.clientId in (${client},(select id from tblClient where clientCode = 'SYSCON')) and cs.clientId = ${client} FOR JSON PATH`,
          };
        }

        console.log("=>>> transportMode", requestBody);
        const response = await fetchReportData(requestBody);
        const data = response?.data || [];
        setVendorNames(
          data.reduce((acc, vendor) => {
            acc[vendor.id] = vendor.name;
            return acc;
          }, {})
        );
      } catch (error) {
        console.error("Error fetching vendor names:", error);
      }
    };

    fetchVendorNames(transportModeData);
  }, [transportModeData, client]);

  useEffect(() => {
    if (tblRateRequestCharge.length > 0) {
      const groupedCharges = {};
      const groupedChargesForDisplay = {}; // This will exclude "Unknown Vendor"

      tblRateRequestCharge.forEach((item) => {
        const chargeLabel =
          item.chargeIdDropdown ||
          item.chargeIddropdown?.[0]?.label ||
          "Unknown Charge";
        const vendorLabel =
          item.vendorIdDropdown ||
          item.vendorIddropdown?.[0]?.label ||
          "Unknown Vendor";

        if (!groupedCharges[chargeLabel]) {
          groupedCharges[chargeLabel] = [];
        }
        groupedCharges[chargeLabel].push(vendorLabel);

        // For display, exclude "Unknown Vendor"
        if (!groupedChargesForDisplay[chargeLabel]) {
          groupedChargesForDisplay[chargeLabel] = [];
        }
        if (vendorLabel !== "Unknown Vendor") {
          groupedChargesForDisplay[chargeLabel].push(vendorLabel);
        }
      });

      setCharges(Object.keys(groupedChargesForDisplay)); // Set display charges
      //setSelectedVendors(groupedChargesForDisplay); // Set display vendors
      setSelectedVendors({}); // Clear selected vendors to start with empty dropdowns
      setOriginalObjects(tblRateRequestCharge); // Keep original logic intact
    }
  }, [tblRateRequestCharge]);

  const handleVendorChangeGroupedCharges = (chargeGroupName, event) => {
    const { value } = event.target;

    const chargeGroup = newScopeOfWork.find(
      (group) => group.name === chargeGroupName
    );

    if (!chargeGroup) {
      console.error("Charge group not found for name:", chargeGroupName);
      return;
    }
    setSelectedVendors((prevSelectedVendors) => {
      const updatedVendors = {
        ...prevSelectedVendors,
        [chargeGroupName]: value,
      };

      // Ensure that charges array exists and is valid
      if (!Array.isArray(chargeGroup.charges)) {
        console.error("Charges array is not valid:", chargeGroup.charges);
        return prevSelectedVendors;
      }

      let currentMaxIndexValue = 0;

      let updatedObjects;
      if (transportMode === "Sea") {
        updatedObjects = isAddFormType
          ? chargeGroup.charges.reduce((acc, charge) => {
              const newObjects = updateOriginalObjectsForAddGroupedCharges(
                charge.name,
                updatedVendors,
                prevSelectedVendors,
                chargeGroupName
              );
              newObjects.forEach((newObj, index) => {
                currentMaxIndexValue += 1;
                newObj.indexValue = currentMaxIndexValue;
              });

              return [
                ...acc,
                ...newObjects.filter(
                  (newObj) =>
                    !acc.some(
                      (existingObj) =>
                        existingObj.chargeId === newObj.chargeId &&
                        existingObj.vendorId === newObj.vendorId &&
                        existingObj.sizeId === newObj.sizeId &&
                        existingObj.typeId === newObj.typeId
                    )
                ),
              ];
            }, [])
          : chargeGroup.charges.reduce((acc, charge) => {
              const newObjects = updateOriginalObjectsForEditGroupedCharges(
                charge.name,
                updatedVendors,
                prevSelectedVendors,
                chargeGroupName
              );
              newObjects.forEach((newObj, index) => {
                currentMaxIndexValue += 1;
                newObj.indexValue = currentMaxIndexValue;
              });

              return [
                ...acc,
                ...newObjects.filter(
                  (newObj) =>
                    !acc.some(
                      (existingObj) =>
                        existingObj.chargeId === newObj.chargeId &&
                        existingObj.vendorId === newObj.vendorId &&
                        existingObj.sizeId === newObj.sizeId &&
                        existingObj.typeId === newObj.typeId
                    )
                ),
              ];
            }, []);
      } else {
        updatedObjects = isAddFormType
          ? chargeGroup.charges.reduce((acc, charge) => {
              const newObjects = updateOriginalObjectsForAddGroupedChargesAir(
                charge.name,
                updatedVendors,
                prevSelectedVendors,
                chargeGroupName
              );

              // Increment indexValue based on updatedObjects.length and ensure uniqueness
              newObjects.forEach((newObj, index) => {
                currentMaxIndexValue += 1;
                newObj.indexValue = currentMaxIndexValue;
              });

              return [
                ...acc,
                ...newObjects.filter(
                  (newObj) =>
                    !acc.some(
                      (existingObj) =>
                        existingObj.chargeId === newObj.chargeId &&
                        existingObj.vendorId === newObj.vendorId &&
                        existingObj.sizeId === newObj.sizeId &&
                        existingObj.typeId === newObj.typeId
                    )
                ),
              ];
            }, [])
          : chargeGroup.charges.reduce((acc, charge) => {
              const newObjects = updateOriginalObjectsForEditGroupedChargesAir(
                charge.name,
                updatedVendors,
                prevSelectedVendors,
                chargeGroupName
              );
              newObjects.forEach((newObj, index) => {
                currentMaxIndexValue += 1;
                newObj.indexValue = currentMaxIndexValue;
              });

              return [
                ...acc,
                ...newObjects.filter(
                  (newObj) =>
                    !acc.some(
                      (existingObj) =>
                        existingObj.chargeId === newObj.chargeId &&
                        existingObj.vendorId === newObj.vendorId &&
                        existingObj.sizeId === newObj.sizeId &&
                        existingObj.typeId === newObj.typeId
                    )
                ),
              ];
            }, []);
      }

      const updatedReceivedNewState = {
        ...receivedNewState,
        tblRateRequestCharge: updatedObjects,
      };

      // console.log("Updated tblRateRequestCharge:", updatedReceivedNewState.tblRateRequestCharge);
      // console.log("New tblRateRequestCharge length:", updatedReceivedNewState.tblRateRequestCharge.length);

      setReceivedNewState(updatedReceivedNewState);
      setLastFinalState(updatedReceivedNewState);
      setOriginalObjects(updatedObjects);

      //console.log("updatedObjects after handleVendorChangeGroupedCharges ========", updatedObjects);

      return updatedVendors;
    });
  };

  const updateOriginalObjectsForAddGroupedCharges = (
    chargeName,
    updatedVendors
  ) => {
    let updatedObjects = [...originalObjects];

    // Find the current maximum indexValue in the existing objects
    let currentMaxIndexValue = Math.max(
      ...updatedObjects.map((obj) => obj.indexValue || 0),
      0
    );

    // Find the specific charge group in newScopeOfWork that matches the chargeName
    const targetGroup = newScopeOfWork.find((group) =>
      group.charges.some((c) => c.name === chargeName)
    );

    if (targetGroup) {
      const charge = targetGroup.charges.find((c) => c.name === chargeName);

      if (charge) {
        const uniqueCombinationsArray =
          getUniqueCombinationsForAddGroupedCharges(
            tblRateRequestCharge,
            charge.name
          );

        uniqueCombinationsArray.forEach((uniqueCombination) => {
          const {
            sizeId,
            sizeIddropdown,
            typeId,
            typeIddropdown,
            qty,
            chargeGroupId,
            chargeGroupIdDropdown,
            buyCurrencyId,
            sellCurrencyId,
            sellMargin,
            buyMargin,
            buyTaxAmount,
          } = uniqueCombination;
          if (!sizeId || !typeId || !qty) {
            console.error(
              "SizeId, TypeId, or qty is missing in uniqueCombination:",
              uniqueCombination
            );
            return; // Skip this combination if sizeId, typeId, or qty is missing
          }
          console.log("typeIddropdown =>>", typeIddropdown);
          const selectedVendorsForCharge =
            updatedVendors[targetGroup.name] || [];

          if (selectedVendorsForCharge.length > 0) {
            // Step 1: Update existing rows where vendorId and vendorIdDropdown are null or empty
            let firstVendorUpdated = false;
            updatedObjects = updatedObjects.filter((obj) => {
              if (
                String(obj.chargeId) === String(charge.id) &&
                obj.sizeId === sizeId &&
                obj.typeId === typeId &&
                (!obj.vendorId || obj.vendorId === null) &&
                (!obj.vendorIdDropdown || obj.vendorIdDropdown === null)
              ) {
                if (!firstVendorUpdated) {
                  const vendor = selectedVendorsForCharge[0];
                  const vendorId = Object.keys(vendorNames).find(
                    (key) => vendorNames[key] === vendor
                  );

                  firstVendorUpdated = true;
                  obj.vendorId = vendorId;
                  obj.vendorIdDropdown = vendorNames[vendorId];
                  obj.vendorIddropdown = [
                    {
                      label: vendorNames[vendorId],
                      oldId: null,
                      value: vendorId,
                      _id: vendorId,
                    },
                  ]; // Ensure this is an array of objects
                  obj.qty = qty; // Update with the qty
                  obj.chargeGroupId = chargeGroupId; // Include chargeGroupId
                  obj.chargeGroupIdDropdown = chargeGroupIdDropdown;
                  obj.indexValue = ++currentMaxIndexValue; // Assign unique indexValue
                  return true; // Keep this object as it has been updated
                } else {
                  return false; // Eliminate rows with null vendors beyond the first update
                }
              }
              return true; // Keep objects that don't match the criteria for elimination
            });

            // Step 2: Always add new rows for additional vendors beyond the first one or when vendorId is not null
            selectedVendorsForCharge.forEach((vendor, index) => {
              const vendorId = Object.keys(vendorNames).find(
                (key) => vendorNames[key] === vendor
              );

              if (vendorId) {
                // Check if a row with this vendor already exists for this combination
                const existingIndex = updatedObjects.findIndex(
                  (obj) =>
                    String(obj.chargeId) === String(charge.id) &&
                    obj.sizeId === sizeId &&
                    obj.typeId === typeId &&
                    obj.vendorId === vendorId
                );

                if (existingIndex === -1) {
                  // If no row exists for this vendor, create a new one
                  currentMaxIndexValue++; // Increment the index value for every new object
                  const newObject = {
                    chargeIdDropdown: charge.name,
                    chargeDescription: charge.name,
                    chargeId: charge.id || null,
                    vendorId,
                    vendorIdDropdown: vendorNames[vendorId], // Ensure this is a string
                    vendorIddropdown: [
                      {
                        label: vendorNames[vendorId],
                        value: vendorId,
                      },
                    ], // Ensure this is an array of objects
                    sizeId,
                    sizeIddropdown,
                    typeId,
                    typeIddropdown,
                    qty: qty, // Include qty in the new object
                    chargeGroupId: chargeGroupId,
                    chargeGroupIddropdown: chargeGroupIdDropdown, // Include chargeGroupId
                    sellAmount: 0,
                    buyCurrencyId: buyCurrencyId,
                    sellCurrencyId: sellCurrencyId,
                    buyMargin: buyMargin,
                    sellMargin: sellMargin,
                    buyTaxAmount,
                    indexValue: currentMaxIndexValue, // Assign unique indexValue for new objects
                  };
                  updatedObjects.push(newObject);
                }
              }
            });
          }
        });
      }
    }

    return updatedObjects;
  };

  const getUniqueCombinationsForAddGroupedCharges = (data, chargeName) => {
    return data.reduce((acc, item) => {
      if (item.chargeDescription === chargeName) {
        const exists = acc.some(
          (combination) =>
            combination.sizeId === item.sizeId &&
            combination.typeId === item.typeId &&
            combination.qty === item.qty
        );

        if (!exists) {
          console.log("Unique combination found:", {
            chargeId: item.chargeId || null,
            chargeDescription: item.chargeDescription || null,
            sizeId: item.sizeId || null,
            sizeIddropdown: item.sizeIddropdown || [],
            typeId: item.typeId || null,
            typeIddropdown: item.typeIddropdown || [],
            qty: item.qty || 1,
            chargeGroupId: item.chargeGroupId || null,
            chargeGroupIdDropdown: item.chargeGroupIddropdown || [],
            chargeIddropdown: item.chargeIddropdown || [],
            buyCurrencyId: item.buyCurrencyId || null,
            sellCurrencyId: item.sellCurrencyId || null,
            buyMargin: item.buyMargin || null,
            sellMargin: item.sellMargin || null,
          });

          acc.push({
            chargeId: item.chargeId || null,
            chargeDescription: item.chargeDescription || null,
            sizeId: item.sizeId || null,
            sizeIddropdown: item.sizeIddropdown || [],
            typeId: item.typeId || null,
            typeIddropdown: item.typeIddropdown || [],
            qty: item.qty || 1, // Ensure qty is included with a default value if missing
            chargeGroupId: item.chargeGroupId || null,
            chargeGroupIdDropdown: item.chargeGroupIddropdown || [],
            chargeIddropdown: item.chargeIddropdown || [],
            buyCurrencyId: item.buyCurrencyId || null,
            sellCurrencyId: item.sellCurrencyId || null,
            buyMargin: item.buyMargin || null,
            sellMargin: item.sellMargin || null,
            sellMargin: item.buyTaxAmount || null,
          });
        } else {
          console.log("Combination already exists, skipping.");
        }
      } else {
        console.log("Item does not match chargeName:", chargeName);
      }
      return acc;
    }, []);
  };

  //--------------------------------------------------------------------

  const updateOriginalObjectsForEditGroupedCharges = (
    chargeName,
    updatedVendors
  ) => {
    let updatedObjects = [...originalObjects];

    // Step 1: Find the maximum indexValue already in updatedObjects
    let currentMaxIndexValue = Math.max(
      ...updatedObjects.map((obj) => obj.indexValue || 0),
      0
    );

    // Find the specific charge group in newScopeOfWork that matches the chargeName
    const targetGroup = newScopeOfWork.find((group) =>
      group.charges.some((c) => c.name === chargeName)
    );

    if (targetGroup) {
      const charge = targetGroup.charges.find((c) => c.name === chargeName);

      if (charge) {
        const uniqueCombinationsArray =
          getUniqueCombinationsForEditGroupedCharges(
            tblRateRequestCharge,
            charge.name
          );

        uniqueCombinationsArray.forEach((uniqueCombination) => {
          const {
            sizeId,
            sizeIdDropdown,
            typeId,
            typeIdDropdown,
            qty,
            chargeGroupId,
            chargeGroupIdDropdown,
            sellCurrencyId,
            buyCurrencyId,
            sellMargin,
            buyMargin,
            chargeDescription,
            buyTaxAmount,
          } = uniqueCombination;

          if (!sizeId || !typeId || !qty) {
            console.error(
              "SizeId, TypeId, or qty is missing in uniqueCombination:",
              uniqueCombination
            );
            return; // Skip this combination if sizeId, TypeId, or qty is missing
          }

          const selectedVendorsForCharge =
            updatedVendors[targetGroup.name] || [];

          if (selectedVendorsForCharge.length > 0) {
            // Step 2: Update existing rows where vendorId and vendorIdDropdown are null or empty
            let firstVendorUpdated = false;
            updatedObjects = updatedObjects.filter((obj) => {
              if (
                String(obj.chargeId) === String(charge.id) &&
                obj.sizeId === sizeId &&
                obj.typeId === typeId &&
                (!obj.vendorId || obj.vendorId === null) &&
                (!obj.vendorIdDropdown || obj.vendorIdDropdown === null)
              ) {
                if (!firstVendorUpdated) {
                  const vendor = selectedVendorsForCharge[0];
                  const vendorId = Object.keys(vendorNames).find(
                    (key) => vendorNames[key] === vendor
                  );

                  firstVendorUpdated = true;
                  obj.vendorId = vendorId;
                  obj.vendorIdDropdown = vendorNames[vendorId];
                  obj?.vendorIddropdown?.push({
                    value: vendorId,
                    label: vendorNames[vendorId],
                  });
                  obj.qty = qty; // Update with the qty
                  obj.chargeGroupId = chargeGroupId; // Include chargeGroupId
                  obj.chargeGroupIdDropdown = chargeGroupIdDropdown; // Include chargeGroupIdDropdown
                  obj.indexValue = ++currentMaxIndexValue; // Use the incremented max value for indexValue
                  return true; // Keep this object as it has been updated
                } else {
                  return false; // Eliminate rows with null vendors beyond the first update
                }
              }
              return true; // Keep objects that don't match the criteria for elimination
            });

            // Step 3: Always add new rows for additional vendors beyond the first one or when vendorId is not null
            selectedVendorsForCharge.forEach((vendor, index) => {
              const vendorId = Object.keys(vendorNames).find(
                (key) => vendorNames[key] === vendor
              );

              if (vendorId) {
                // Check if a row with this vendor already exists for this combination
                const existingIndex = updatedObjects.findIndex(
                  (obj) =>
                    String(obj.chargeId) === String(charge.id) &&
                    obj.sizeId === sizeId &&
                    obj.typeId === typeId &&
                    obj.vendorId === vendorId
                );

                if (existingIndex === -1) {
                  // Step 4: If no row exists for this vendor, create a new one
                  const newObject = {
                    chargeIdDropdown: charge.name,
                    chargeId: charge.id || null,
                    vendorId,
                    vendorIdDropdown: vendorNames[vendorId],
                    sizeId,
                    sizeIddropdown: sizeIdDropdown,
                    typeId,
                    typeIddropdown: typeIdDropdown,
                    qty: qty, // Include qty in the new object
                    chargeGroupId: chargeGroupId, // Include chargeGroupId
                    chargeGroupIddropdown: chargeGroupIdDropdown, // Include chargeGroupIdDropdown
                    sellAmount: 0,
                    indexValue: ++currentMaxIndexValue, // Increment the max indexValue for the new object
                    chargeDescription: charge.description || null,
                    sellCurrencyId: sellCurrencyId,
                    buyCurrencyId: buyCurrencyId,
                    chargeDescription: charge.name,
                    sellMargin: sellMargin,
                    buyMargin: buyMargin,
                    buyTaxAmount: buyTaxAmount,
                  };
                  updatedObjects.push(newObject);
                }
              }
            });
          }
        });
      }
    }

    return updatedObjects;
  };

  const getUniqueCombinationsForEditGroupedCharges = (data, chargeName) => {
    return data.reduce((acc, item) => {
      if (item.chargeIdDropdown === chargeName) {
        // if (item.chargeDescription === chargeName) {
        const exists = acc.some(
          (combination) =>
            combination.sizeId === item.sizeId &&
            combination.typeId === item.typeId &&
            combination.qty === item.qty &&
            combination.chargeGroupId === item.chargeGroupId // Ensure uniqueness check includes chargeGroupId
        );

        if (!exists) {
          acc.push({
            sizeId: item.sizeId || null,
            sizeIdDropdown: item.sizeIddropdown || null,
            typeId: item.typeId || null,
            typeIdDropdown: item.typeIddropdown || null,
            qty: item.qty || 1, // Ensure qty is included with a default value
            chargeGroupId: item.chargeGroupId || null, // Include chargeGroupId
            chargeGroupIddropdown: item.chargeGroupIddropdown || null,
            chargeDescription:
              item.chargeGroupIdDropdown || item.chargeGroupIddropdown || null,
            indexValue: item.indexValue || null, // Include chargeGroupIdDropdown
            buyCurrencyId: item.buyCurrencyId || null,
            sellCurrencyId: item.sellCurrencyId || null,
            buyMargin: item.buyMargin || null,
            sellMargin: item.sellMargin || null,
            buyTaxAmount: item.buyTaxAmount || null,
          });
        }
      }
      if (
        Array.isArray(item.chargeIddropdown) &&
        item.chargeIddropdown.length > 0 &&
        item.chargeIddropdown[0]?.label === chargeName
      ) {
        const exists = acc.some(
          (combination) =>
            combination.sizeId === item.sizeId &&
            combination.typeId === item.typeId &&
            combination.qty === item.qty &&
            combination.chargeGroupId === item.chargeGroupId // Ensure uniqueness check includes chargeGroupId
        );

        if (!exists) {
          acc.push({
            sizeId: item.sizeId || null,
            sizeIdDropdown: item.sizeIddropdown || null,
            typeId: item.typeId || null,
            typeIdDropdown: item.typeIddropdown || null,
            qty: item.qty || 1, // Ensure qty is included with a default value
            chargeGroupId: item.chargeGroupId || null, // Include chargeGroupId
            chargeGroupIdDropdown: item.chargeGroupIddropdown || null,
            chargeDescription:
              item.chargeGroupIdDropdown || item.chargeGroupIddropdown || null,
            indexValue: item.indexValue || null, // Include chargeGroupIdDropdown
            buyCurrencyId: item.buyCurrencyId || null,
            sellCurrencyId: item.sellCurrencyId || null,
            buyMargin: item.buyMargin || null,
            sellMargin: item.sellMargin || null,
            buyTaxAmount: item.buyTaxAmount || null,
          });
        }
      }
      return acc;
    }, []);
  };

  const handleChargeDelete = (charge, chipToDelete) => () => {
    setSelectedVendors((prevSelectedVendors) => {
      const updatedVendors = {
        ...prevSelectedVendors,
        [charge]: prevSelectedVendors[charge].filter(
          (chip) => chip !== chipToDelete
        ),
      };
      const updatedObjects = updateOriginalObjects(charge, updatedVendors);
      setOriginalObjects(updatedObjects);

      // Update receivedNewState with updatedObjects
      const updatedReceivedNewState = {
        ...receivedNewState,
        tblRateRequestCharge: updatedObjects,
      };
      setReceivedNewState(updatedReceivedNewState);

      // Set the final state
      setLastFinalState(updatedReceivedNewState);

      //console.log("updatedObjects after handleChargeDelete", updatedObjects);
      return updatedVendors;
    });
  };

  const handleVendorChange = (charge, event) => {
    const { value } = event.target;

    setSelectedVendors((prevSelectedVendors) => {
      const updatedVendors = { ...prevSelectedVendors, [charge]: value };

      // const updatedObjects = isAddFormType
      //     ? updateOriginalObjectsForAdd(charge, updatedVendors, prevSelectedVendors)
      //     : updateOriginalObjectsForEdit(charge, updatedVendors, prevSelectedVendors);

      let updatedObjects;
      if (transportMode === "Sea") {
        updatedObjects = isAddFormType
          ? updateOriginalObjectsForAdd(
              charge,
              updatedVendors,
              prevSelectedVendors
            )
          : updateOriginalObjectsForEdit(
              charge,
              updatedVendors,
              prevSelectedVendors
            );
      } else {
        updatedObjects = isAddFormType
          ? updateOriginalObjectsForAddAir(
              charge,
              updatedVendors,
              prevSelectedVendors
            )
          : updateOriginalObjectsForEditAir(
              charge,
              updatedVendors,
              prevSelectedVendors
            );
      }

      const updatedReceivedNewState = {
        ...receivedNewState,
        tblRateRequestCharge: updatedObjects,
      };

      setReceivedNewState(updatedReceivedNewState);
      setLastFinalState(updatedReceivedNewState);
      setOriginalObjects(updatedObjects);

      return updatedVendors;
    });
  };

  const updateOriginalObjectsForAdd = (
    charge,
    updatedVendors,
    prevSelectedVendors
  ) => {
    let updatedObjects = [...originalObjects];
    const uniqueCombinations = getUniqueCombinationsForAdd(
      tblRateRequestCharge,
      charge
    );

    // Determine the current maximum indexValue
    let currentMaxIndexValue = updatedObjects.reduce(
      (max, obj) => Math.max(max, obj.indexValue || 0),
      0
    );

    uniqueCombinations.forEach((combination) => {
      const {
        sizeId,
        sizeIddropdown = [],
        typeId,
        typeIddropdown = [],
        chargeId,
        chargeIddropdown = [],
        chargeDescription,
        chargeGroupId,
        chargeGroupIddropdown = [],
        qty,
        isChecked,
        chargesFlag,
        buyCurrencyId,
        sellCurrencyId,
        buyMargin,
        sellMargin,
      } = combination;

      // Process each selected vendor
      updatedVendors[charge].forEach((vendor, vendorIndex) => {
        const vendorId = Object.keys(vendorNames).find(
          (key) => vendorNames[key] === vendor
        );

        if (!vendorId) {
          return; // Skip if the vendorId is not found
        }

        // Remove any rows where vendorId is empty or null for the specific charge being modified
        updatedObjects = updatedObjects.filter(
          (obj) =>
            !(
              Array.isArray(obj.chargeIddropdown) &&
              obj.chargeIddropdown.length > 0 &&
              obj.chargeIddropdown[0]?.label === charge &&
              (!obj.vendorId ||
                obj.vendorIddropdown === null ||
                (Array.isArray(obj.vendorIddropdown) &&
                  obj.vendorIddropdown.length > 0 &&
                  obj.vendorIddropdown[0]?.label === "Unknown Vendor")) &&
              obj.sizeId === sizeId &&
              obj.typeId === typeId &&
              obj.qty === qty &&
              obj.chargeGroupId === chargeGroupId
            )
        );

        // Check if this vendor, size, type, and charge group combination already exists
        const existingIndex = updatedObjects.findIndex(
          (obj) =>
            Array.isArray(obj.chargeIddropdown) &&
            obj.chargeIddropdown.length > 0 &&
            obj.chargeIddropdown[0]?.label === charge &&
            Array.isArray(obj.vendorIddropdown) &&
            obj.vendorIddropdown.length > 0 &&
            obj.vendorIddropdown[0]?.label === charge &&
            obj.sizeId === sizeId &&
            obj.typeId === typeId &&
            obj.qty === qty &&
            obj.chargeGroupId === chargeGroupId
        );

        if (existingIndex === -1) {
          // Create a new object for the new vendor selection
          const newObject = {
            chargeDescription,
            chargeId: chargeId || null,
            chargeIddropdown: [
              {
                label: chargeIddropdown,
                value: chargeId,
              },
            ],
            sizeId: sizeId || null,
            sizeIddropdown: sizeIddropdown,
            typeId: typeId || null,
            typeIddropdown: [
              {
                label: typeIddropdown,
                value: typeId,
              },
            ],
            vendorId: vendorId,
            vendorIdDropdown: vendorNames[vendorId],
            vendorIddropdown: [
              {
                label: vendorNames[vendorId],
                value: vendorId,
              },
            ],
            chargeGroupId: chargeGroupId || null,
            chargeGroupIddropdown:
              chargeGroupIddropdown.length > 0
                ? chargeGroupIddropdown
                : [
                    {
                      value: chargeGroupId,
                      label:
                        chargeGroupIddropdown.length > 0
                          ? chargeGroupIddropdown[0].label
                          : "Unknown Group",
                    },
                  ],
            // Assign a new unique indexValue for each new object
            indexValue: ++currentMaxIndexValue,
            isChecked: isChecked !== undefined ? isChecked : true,
            buyCurrencyId: buyCurrencyId,
            sellCurrencyId: sellCurrencyId,
            qty,
            sellMargin: sellMargin || null,
            buyMargin: buyMargin || null,
            chargesFlag: chargesFlag || null, // Include the flag if it exists
          };

          // Add the object to the updatedObjects
          updatedObjects.push(newObject);
        } else if (existingIndex !== -1 && vendorId) {
          // Update existing object with the new vendor and charge group information
          updatedObjects[existingIndex] = {
            ...updatedObjects[existingIndex],
            vendorId: vendorId,
            vendorIddropdown: [
              {
                label: vendorNames[vendorId],
                value: vendorId,
              },
            ],
            chargeGroupId:
              chargeGroupId || updatedObjects[existingIndex].chargeGroupId,
            buyCurrencyId: buyCurrencyId,
            sellCurrencyId: sellCurrencyId,
            sellMargin: sellMargin || null,
            buyMargin: buyMargin || null,
            chargeGroupIddropdown:
              chargeGroupIddropdown.length > 0
                ? chargeGroupIddropdown
                : updatedObjects[existingIndex].chargeGroupIddropdown,
            chargesFlag:
              chargesFlag || updatedObjects[existingIndex].chargesFlag, // Preserve or add the flag
          };
        }
      });
    });

    // Filter out rows with null or "Unknown Vendor" in vendorIddropdown for the given charge
    updatedObjects = updatedObjects.filter(
      (obj) =>
        (Array.isArray(obj.chargeIddropdown) &&
          obj.chargeIddropdown.length > 0 &&
          obj.chargeIddropdown[0].label !== charge) ||
        (obj.vendorId !== null &&
          obj.vendorIdDropdown &&
          obj.vendorIdDropdown !== "Unknown Vendor")
    );

    // **New Deduplication Logic: Remove duplicate records with different indexValues**
    const uniqueRecordsMap = new Map();

    updatedObjects.forEach((obj) => {
      // Create a unique key excluding `indexValue`
      const uniqueKey = JSON.stringify({
        chargeDescription: obj.chargeDescription,
        chargeId: obj.chargeId,
        chargeIddropdown: obj.chargeIddropdown,
        sizeId: obj.sizeId,
        sizeIddropdown: obj.sizeIddropdown,
        typeId: obj.typeId,
        typeIddropdown: obj.typeIddropdown,
        vendorId: obj.vendorId,
        vendorIdDropdown: obj.vendorIdDropdown,
        vendorIddropdown: obj.vendorIddropdown,
        chargeGroupId: obj.chargeGroupId,
        chargeGroupIddropdown: obj.chargeGroupIddropdown,
      });

      if (!uniqueRecordsMap.has(uniqueKey)) {
        uniqueRecordsMap.set(uniqueKey, obj);
      }
    });

    updatedObjects = Array.from(uniqueRecordsMap.values());

    return updatedObjects;
  };

  const getUniqueCombinationsForAdd = (data, charge) => {
    return data.reduce((acc, item) => {
      // First condition: Check if the chargeDescription matches the charge
      if (item.chargeDescription === charge) {
        // Check if this unique combination already exists in the accumulator
        const exists = acc.some(
          (combination) =>
            combination.sizeId === item.sizeId &&
            combination.typeId === item.typeId &&
            combination.chargeGroupId === item.chargeGroupId
        );

        if (!exists) {
          acc.push({
            chargeId: item.chargeId || null,
            chargeDescription: item.chargeDescription || null,
            sizeId: item.sizeId || null,
            sizeIddropdown: item.sizeIddropdown || [],
            typeId: item.typeId || null,
            typeIddropdown:
              Array.isArray(item.typeIddropdown) &&
              item.typeIddropdown.length > 0
                ? item.typeIddropdown[0].label
                : item.typeIdDropdown || null,
            chargeGroupId: item.chargeGroupId || null,
            chargeGroupIddropdown: item.chargeGroupIddropdown || [],
            vendorId: item.vendorId || null,
            chargeIddropdown:
              Array.isArray(item.chargeIddropdown) &&
              item.chargeIddropdown.length > 0
                ? item.chargeIddropdown[0].label
                : item.chargeIdDropdown || null,

            vendorIddropdown: item.vendorIddropdown || [],
            isChecked: item.isChecked || true,
            qty: item.qty || 1,
            indexValue: item.indexValue,
            sellCurrencyId: item.sellCurrencyId || null,
            buyCurrencyId: item.buyCurrencyId || null,
            buyMargin: item.buyMargin || null,
            sellMargin: item.sellMargin || null,
          });
        }
      }

      // Second condition: Check if the chargeIddropdown label matches the charge
      if (
        item.chargeIddropdown &&
        item.chargeIddropdown.length > 0 &&
        item.chargeIddropdown[0].label === charge
      ) {
        // Check if this unique combination already exists in the accumulator
        const exists = acc.some(
          (combination) =>
            combination.sizeId === item.sizeId &&
            combination.typeId === item.typeId &&
            combination.chargeGroupId === item.chargeGroupId
        );

        if (!exists) {
          acc.push({
            chargeId: item.chargeId || null,
            chargeDescription: item.chargeDescription || null,
            sizeId: item.sizeId || null,
            sizeIddropdown: item.sizeIddropdown || [],
            typeId: item.typeId || null,
            typeIddropdown:
              Array.isArray(item.typeIddropdown) &&
              item.typeIddropdown.length > 0
                ? item.typeIddropdown[0].label
                : item.typeIdDropdown || null,
            chargeGroupId: item.chargeGroupId || null,
            chargeGroupIddropdown: item.chargeGroupIddropdown || [],
            vendorId: item.vendorId || null,
            chargeIddropdown:
              Array.isArray(item.chargeIddropdown) &&
              item.chargeIddropdown.length > 0
                ? item.chargeIddropdown[0].label
                : item.chargeIdDropdown || null,
            vendorIddropdown: item.vendorIddropdown || [],
            isChecked: item.isChecked || true,
            qty: item.qty || 1,
            indexValue: item.indexValue,
            sellCurrencyId: item.sellCurrencyId || null,
            buyCurrencyId: item.buyCurrencyId || null,
            buyMargin: item.buyMargin || null,
            sellMargin: item.sellMargin || null,
          });
        }
      }

      return acc;
    }, []);
  };

  // Handle the case for editing existing charges ____________________

  const updateOriginalObjectsForEdit = (
    charge,
    updatedVendors,
    prevSelectedVendors
  ) => {
    let updatedObjects = [...originalObjects];
    const uniqueCombinations = getUniqueCombinationsForEdit(
      tblRateRequestCharge,
      charge
    );

    // Determine the current maximum indexValue
    let currentMaxIndexValue = updatedObjects.reduce(
      (max, obj) => Math.max(max, obj.indexValue || 0),
      0
    );

    uniqueCombinations.forEach((combination) => {
      const {
        sizeId,
        sizeIdDropdown,
        typeId,
        typeIdDropdown,
        qty,
        chargeGroupId,
        chargeGroupIdDropdown,
        sellCurrencyId,
        buyCurrencyId,
        buyMargin,
        sellMargin,
        chargeDescription,
        chargeGroupIddropdown,
      } = combination;

      updatedVendors[charge].forEach((vendor, vendorIndex) => {
        const vendorId = Object.keys(vendorNames).find(
          (key) => vendorNames[key] === vendor
        );

        // Check if the previous vendor is "Unknown Vendor" or null
        if (
          prevSelectedVendors[charge] &&
          (prevSelectedVendors[charge][vendorIndex] === "Unknown Vendor" ||
            prevSelectedVendors[charge][vendorIndex] === null)
        ) {
          // Filter out any existing objects with "Unknown Vendor" or null vendorId
          updatedObjects = updatedObjects.filter(
            (obj) =>
              !(
                obj.chargeIdDropdown === charge &&
                (!obj.vendorId ||
                  obj.vendorIdDropdown === null ||
                  (obj.vendorIdDropdown &&
                    obj.vendorIdDropdown === "Unknown Vendor")) &&
                obj.sizeId === sizeId &&
                obj.typeId === typeId &&
                obj.qty === qty &&
                obj.chargeGroupId === chargeGroupId
              )
          );

          //console.log("Removed objects with unknown or null vendor");
        }

        // Check if this vendor already exists
        const existingIndex = updatedObjects.findIndex(
          (obj) =>
            obj.chargeIdDropdown === charge &&
            obj.vendorIdDropdown === vendor &&
            obj.sizeId === sizeId &&
            obj.typeId === typeId &&
            obj.qty === qty &&
            obj.chargeGroupId === chargeGroupId
        );

        // If the combination does not exist, create a new object
        if (existingIndex === -1 && vendorId) {
          //console.log("Creating new object for vendorId:", vendorId);

          // Increment currentMaxIndexValue and assign it to indexValue
          currentMaxIndexValue += 1;
          const newObject = {
            chargeIdDropdown: charge,
            vendorId,
            vendorIdDropdown: vendorNames[vendorId],
            sizeId,
            sizeIdDropdown,
            typeId,
            typeIdDropdown,
            qty,
            chargeGroupId: chargeGroupId || combination.chargeGroupId,
            chargeGroupIddropdown:
              chargeGroupIddropdown ||
              chargeGroupIdDropdown ||
              combination.chargeGroupIdDropdown,
            chargeId: combination.chargeId || null,
            sellCurrencyId: sellCurrencyId || null,
            buyCurrencyId: buyCurrencyId || null,
            indexValue: currentMaxIndexValue,
            sellMargin: sellMargin || null,
            buyMargin: buyMargin || null,
            chargeDescription: chargeDescription || null,
          };

          const existingFields =
            tblRateRequestCharge.length > 0
              ? Object.keys(tblRateRequestCharge[0])
              : [];

          existingFields.forEach((field) => {
            if (!newObject.hasOwnProperty(field)) {
              newObject[field] = null;
            }
          });

          updatedObjects.push(newObject);
        } else if (existingIndex !== -1 && vendorId) {
          updatedObjects[existingIndex] = {
            ...updatedObjects[existingIndex],
            vendorId: vendorId,
            vendorIdDropdown: vendorNames[vendorId],
            chargeGroupId: chargeGroupId || combination.chargeGroupId,
            chargeGroupIddropdown:
              chargeGroupIddropdown ||
              chargeGroupIdDropdown ||
              combination.chargeGroupIdDropdown,
            // Keep the existing indexValue
            indexValue: updatedObjects[existingIndex].indexValue,
            sellCurrencyId: sellCurrencyId || null,
            buyCurrencyId: buyCurrencyId || null,
            sellMargin: sellMargin || null,
            buyMargin: buyMargin || null,
            chargeDescription: chargeDescription || null,
          };
        }
      });
    });

    // Filter out rows with null or "Unknown Vendor" in vendorIddropdown for the given charge
    updatedObjects = updatedObjects.filter(
      (obj) =>
        (Array.isArray(obj.chargeIddropdown) &&
          obj.chargeIddropdown.length > 0 &&
          obj.chargeIddropdown[0].label !== charge) ||
        (obj.vendorId !== null &&
          obj.vendorIdDropdown &&
          obj.vendorIdDropdown !== "Unknown Vendor")
    );

    return updatedObjects;
  };

  const getUniqueCombinationsForEdit = (data, charge) => {
    return data.reduce((acc, item) => {
      // if (item.chargeIdDropdown === charge) {
      if (item.chargeDescription === charge) {
        const exists = acc.some(
          (combination) =>
            combination.sizeId === item.sizeId &&
            combination.typeId === item.typeId &&
            combination.qty === item.qty &&
            combination.chargeGroupId === item.chargeGroupId
        );

        if (!exists) {
          acc.push({
            sizeId: item.sizeId || null,
            sizeIdDropdown:
              Array.isArray(item.sizeIddropdown) &&
              item.sizeIddropdown.length > 0
                ? item.sizeIddropdown[0].label
                : item.sizeIdDropdown || null,
            typeId: item.typeId || null,
            typeIdDropdown:
              Array.isArray(item.typeIddropdown) &&
              item.typeIddropdown.length > 0
                ? item.typeIddropdown[0].label
                : item.typeIdDropdown || null,
            qty: item.qty || 1, // Include qty
            chargeGroupId: item.chargeGroupId || null, // Include chargeGroupId
            //chargeGroupIdDropdown: item.chargeGroupIdDropdown || item.chargeGroupIddropdown[0].label || null,
            chargeGroupIdDropdown:
              item.chargeGroupIdDropdown ||
              (Array.isArray(item.chargeGroupIddropdown) &&
              item.chargeGroupIddropdown.length > 0
                ? item.chargeGroupIddropdown[0].label
                : null),
            chargeId: item.chargeId || null, // Include chargeId
            indexValue: item.indexValue || null,
            buyCurrencyId: item.buyCurrencyId || null,
            sellCurrencyId: item.sellCurrencyId || null,
            sellMargin: item.sellMargin || null,
            buyMargin: item.buyMargin || null,
            chargeDescription: item.chargeDescription || null,
            chargeGroupIddropdown: item.chargeGroupIddropdown || null,
          });
        }
      }

      // Second condition: Check if the chargeIddropdown label matches the charge
      if (
        item.chargeIdDropdown === charge ||
        (item.chargeIddropdown &&
          item.chargeIddropdown.length > 0 &&
          item.chargeIddropdown[0].label === charge)
      ) {
        // Check if this unique combination already exists in the accumulator
        const exists = acc.some(
          (combination) =>
            combination.sizeId === item.sizeId &&
            combination.typeId === item.typeId &&
            combination.chargeGroupId === item.chargeGroupId
        );

        // sizeIdDropdown: item.sizeIdDropdown || null,
        if (!exists) {
          acc.push({
            chargeId: item.chargeId || null,
            chargeDescription: item.chargeDescription || null,
            sizeId: item.sizeId || null,
            sizeIdDropdown:
              Array.isArray(item.sizeIddropdown) &&
              item.sizeIddropdown.length > 0
                ? item.sizeIddropdown[0].label
                : item.sizeIdDropdown || null,
            typeId: item.typeId || null,
            typeIdDropdown:
              Array.isArray(item.typeIddropdown) &&
              item.typeIddropdown.length > 0
                ? item.typeIddropdown[0].label
                : item.typeIdDropdown || null,
            chargeGroupId: item.chargeGroupId || null,
            chargeGroupIdDropdown: item.chargeGroupIddropdown || [],
            vendorId: item.vendorId || null,
            chargeIddropdown:
              item.chargeIdDropdown || item.chargeIddropdown[0]?.label || null,
            vendorIddropdown: item.vendorIddropdown || null,
            isChecked: item.isChecked || true,
            qty: item.qty || 1,
            indexValue: item.indexValue,
            sellCurrencyId: item.sellCurrencyId || null,
            buyCurrencyId: item.buyCurrencyId || null,
            sellMargin: item.sellMargin || null,
            buyMargin: item.buyMargin || null,
            chargeDescription: item.chargeDescription || null,
            chargeGroupIddropdown: item.chargeGroupIddropdown || null,
          });
        }
      }

      if (
        item.chargeIddropdown &&
        item.chargeIddropdown.length > 0 &&
        item.chargeIddropdown[0].label === charge
      ) {
        // Check if this unique combination already exists in the accumulator
        const exists = acc.some(
          (combination) =>
            combination.sizeId === item.sizeId &&
            combination.typeId === item.typeId &&
            combination.chargeGroupId === item.chargeGroupId
        );

        // sizeIdDropdown: item.sizeIdDropdown || null,
        if (!exists) {
          acc.push({
            chargeId: item.chargeId || null,
            chargeDescription: item.chargeDescription || null,
            sizeId: item.sizeId || null,
            sizeIdDropdown:
              Array.isArray(item.sizeIddropdown) &&
              item.sizeIddropdown.length > 0
                ? item.sizeIddropdown[0].label
                : item.sizeIdDropdown || null,
            typeId: item.typeId || null,
            typeIdDropdown:
              Array.isArray(item.typeIddropdown) &&
              item.typeIddropdown.length > 0
                ? item.typeIddropdown[0].label
                : item.typeIdDropdown || null,
            chargeGroupId: item.chargeGroupId || null,
            chargeGroupIdDropdown: item.chargeGroupIddropdown || [],
            vendorId: item.vendorId || null,
            chargeIddropdown:
              item.chargeIdDropdown || item.chargeIddropdown[0]?.label || null,
            vendorIddropdown: item.vendorIddropdown || null,
            isChecked: item.isChecked || true,
            qty: item.qty || 1,
            indexValue: item.indexValue,
            sellCurrencyId: item.sellCurrencyId || null,
            buyCurrencyId: item.buyCurrencyId || null,
            sellMargin: item.sellMargin || null,
            buyMargin: item.buyMargin || null,
            chargeDescription: item.chargeDescription || null,
            chargeGroupIddropdown: item.chargeGroupIddropdown || null,
          });
        }
      }
      return acc;
    }, []);
  };

  // AIR CODE -------------------------------------------------------------

  const updateOriginalObjectsForAddAir = (charge, updatedVendors) => {
    let updatedObjects = [...originalObjects]; // Clone originalObjects
    let currentMaxIndexValue = updatedObjects.reduce(
      (max, obj) => Math.max(max, obj.indexValue || 0),
      0
    );

    // Find rows matching the charge where no vendor is assigned
    const rowsWithoutVendor = updatedObjects.filter(
      (obj) =>
        Array.isArray(obj.chargeIddropdown) &&
        obj.chargeIddropdown.some((dropdown) => dropdown.label === charge) &&
        (!obj.vendorId || obj.vendorId.trim() === "")
    );

    // Remove rows without a vendor
    updatedObjects = updatedObjects.filter(
      (obj) =>
        !(
          Array.isArray(obj.chargeIddropdown) &&
          obj.chargeIddropdown.some((dropdown) => dropdown.label === charge) &&
          (!obj.vendorId || obj.vendorId.trim() === "")
        )
    );

    // Add new rows for each vendor
    updatedVendors[charge].forEach((vendor) => {
      const vendorId = Object.keys(vendorNames).find(
        (key) => vendorNames[key] === vendor
      );
      if (!vendorId) return; // Skip if vendorId is not found

      // Check if there's an existing row for this vendor
      const existingVendorRow = updatedObjects.find(
        (obj) =>
          Array.isArray(obj.chargeIddropdown) &&
          obj.chargeIddropdown.some((dropdown) => dropdown.label === charge) &&
          obj.vendorId === vendorId
      );

      if (!existingVendorRow) {
        if (rowsWithoutVendor.length > 0) {
          // Use the first row without a vendor as a template
          const baseRow = rowsWithoutVendor[0];
          const newRow = {
            ...baseRow,
            vendorId: vendorId,
            vendorIddropdown: [
              {
                label: vendorNames[vendorId],
                value: vendorId,
              },
            ],
            indexValue: ++currentMaxIndexValue, // Assign a new indexValue
          };
          updatedObjects.push(newRow);
        } else {
          // If no rows without vendor exist, create a new row using data from the originalObjects
          const templateRow = originalObjects.find(
            (obj) =>
              Array.isArray(obj.chargeIddropdown) &&
              obj.chargeIddropdown.some((dropdown) => dropdown.label === charge)
          );

          if (templateRow) {
            const newObject = {
              ...templateRow,
              vendorId: vendorId,
              vendorIddropdown: [
                {
                  label: vendorNames[vendorId],
                  value: vendorId,
                },
              ],
              indexValue: ++currentMaxIndexValue, // Assign a new indexValue
            };
            updatedObjects.push(newObject);
          }
        }
      }
    });

    return updatedObjects;
  };

  const updateOriginalObjectsForEditAir = (charge, updatedVendors) => {
    let updatedObjects = [...originalObjects]; // Clone originalObjects
    let currentMaxIndexValue = updatedObjects.reduce(
      (max, obj) => Math.max(max, obj.indexValue || 0),
      0
    );

    // Find rows matching the charge where no vendor is assigned
    const rowsWithoutVendor = updatedObjects.filter((obj) => {
      const chargeLabel = Array.isArray(obj.chargeIddropdown)
        ? obj.chargeIddropdown.some((dropdown) => dropdown.label === charge)
        : obj.chargeIdDropdown === charge;

      return chargeLabel && (!obj.vendorId || obj.vendorId.trim() === "");
    });

    // Remove rows without a vendor
    updatedObjects = updatedObjects.filter((obj) => {
      const chargeLabel = Array.isArray(obj.chargeIddropdown)
        ? obj.chargeIddropdown.some((dropdown) => dropdown.label === charge)
        : obj.chargeIdDropdown === charge;

      return !(chargeLabel && (!obj.vendorId || obj.vendorId.trim() === ""));
    });

    // Add new rows for each vendor
    updatedVendors[charge].forEach((vendor) => {
      const vendorId = Object.keys(vendorNames).find(
        (key) => vendorNames[key] === vendor
      );
      if (!vendorId) return; // Skip if vendorId is not found

      // Check if there's an existing row for this vendor
      const existingVendorRow = updatedObjects.find((obj) => {
        const chargeLabel = Array.isArray(obj.chargeIddropdown)
          ? obj.chargeIddropdown.some((dropdown) => dropdown.label === charge)
          : obj.chargeIdDropdown === charge;

        return chargeLabel && obj.vendorId === vendorId;
      });

      if (!existingVendorRow) {
        if (rowsWithoutVendor.length > 0) {
          // Use the first row without a vendor as a template
          const baseRow = rowsWithoutVendor[0];
          const newRow = {
            ...baseRow,
            vendorId: vendorId,
            vendorIddropdown: [
              {
                label: vendorNames[vendorId],
                value: vendorId,
              },
            ],
            indexValue: ++currentMaxIndexValue, // Assign a new indexValue
          };
          updatedObjects.push(newRow);
        } else {
          // If no rows without vendor exist, create a new row using data from the originalObjects
          const templateRow = originalObjects.find((obj) => {
            const chargeLabel = Array.isArray(obj.chargeIddropdown)
              ? obj.chargeIddropdown.some(
                  (dropdown) => dropdown.label === charge
                )
              : obj.chargeIdDropdown === charge;

            return chargeLabel;
          });

          if (templateRow) {
            const newObject = {
              ...templateRow,
              vendorId: vendorId,
              vendorIddropdown: [
                {
                  label: vendorNames[vendorId],
                  value: vendorId,
                },
              ],
              indexValue: ++currentMaxIndexValue, // Assign a new indexValue
            };
            updatedObjects.push(newObject);
          }
        }
      }
    });

    return updatedObjects;
  };

  // Changes wise Air ----------------------

  const updateOriginalObjectsForAddGroupedChargesAir = (
    chargeName,
    updatedVendors,
    prevSelectedVendors,
    chargeGroupName
  ) => {
    console.log("chargeGroupName =>", chargeGroupName);
    let updatedObjects = [...originalObjects];
    let currentMaxIndexValue = Math.max(
      ...updatedObjects.map((obj) => obj.indexValue || 0),
      0
    );
    const targetGroup = newScopeOfWork.find(
      (group) => group.name === chargeGroupName
    );

    if (targetGroup) {
      const { id: chargeGroupId, name: chargeGroupName } = targetGroup;
      const chargeGroupIddropdown = [
        {
          value: chargeGroupId,
          label: chargeGroupName,
        },
      ];
      targetGroup.charges.forEach((charge) => {
        const { id: chargeId, name: chargeName } = charge;
        const chargeIddropdown = [
          {
            value: chargeId,
            label: chargeName,
          },
        ];
        const selectedVendorsForCharge = updatedVendors[chargeGroupName] || [];
        if (selectedVendorsForCharge.length > 0) {
          let firstVendorUpdated = false;
          updatedObjects = updatedObjects.filter((obj) => {
            if (
              String(obj.chargeId) === String(chargeId) &&
              (!obj.vendorId || obj.vendorId.trim() === "") &&
              (!obj.vendorIdDropdown || obj.vendorIdDropdown.trim() === "")
            ) {
              if (!firstVendorUpdated) {
                const vendor = selectedVendorsForCharge[0];
                const vendorId = Object.keys(vendorNames).find(
                  (key) => vendorNames[key] === vendor
                );

                firstVendorUpdated = true;
                obj.vendorId = vendorId;
                obj.vendorIdDropdown = vendorNames[vendorId];
                obj.vendorIddropdown = [
                  {
                    label: vendorNames[vendorId],
                    value: vendorId,
                  },
                ];
                obj.qty = obj.qty || 0;
                obj.rateBasisId = obj.rateBasisId || null;
                obj.rateBasisIddropdown = obj.rateBasisIddropdown || null;
                obj.chargeDescription = obj.chargeDescription || null;
                obj.chargeGroupId = chargeGroupId;
                obj.chargeGroupIddropdown = chargeGroupIddropdown;
                obj.chargeIddropdown = chargeIddropdown;
                obj.indexValue = ++currentMaxIndexValue;
                return true;
              } else {
                return false;
              }
            }
            return true;
          });
          selectedVendorsForCharge.forEach((vendor, index) => {
            const vendorId = Object.keys(vendorNames).find(
              (key) => vendorNames[key] === vendor
            );

            if (vendorId) {
              // Check if a row with this vendor already exists for this charge
              const existingIndex = updatedObjects.findIndex(
                (obj) =>
                  String(obj.chargeId) === String(chargeId) &&
                  obj.vendorId === vendorId
              );
              if (existingIndex === -1) {
                currentMaxIndexValue++;
                const newObject = {
                  qty:
                    updatedObjects.find((obj) => obj.chargeId === chargeId)
                      ?.qty || 0,
                  vendorId,
                  vendorIdDropdown: vendorNames[vendorId],
                  vendorIddropdown: [
                    {
                      label: vendorNames[vendorId],
                      value: vendorId,
                    },
                  ],
                  chargeId,
                  chargeIddropdown,
                  chargeGroupId,
                  chargeGroupIddropdown,
                  sellExchangeRate:
                    updatedObjects.find((obj) => obj.chargeId === chargeId)
                      ?.sellExchangeRate || null,
                  buyExchangeRate:
                    updatedObjects.find((obj) => obj.chargeId === chargeId)
                      ?.buyExchangeRate || null,
                  buyTaxAmount:
                    updatedObjects.find((obj) => obj.chargeId === chargeId)
                      ?.buyTaxAmount || null,
                  sellCurrencyId:
                    updatedObjects.find((obj) => obj.chargeId === chargeId)
                      ?.sellCurrencyId || null,
                  sellCurrencyIddropdown:
                    updatedObjects.find((obj) => obj.chargeId === chargeId)
                      ?.sellCurrencyIddropdown || null,
                  buyCurrencyId:
                    updatedObjects.find((obj) => obj.chargeId === chargeId)
                      ?.buyCurrencyId || null,
                  buyCurrencyIddropdown:
                    updatedObjects.find((obj) => obj.chargeId === chargeId)
                      ?.buyCurrencyIddropdown || null,
                  chargeDescription:
                    updatedObjects.find((obj) => obj.chargeId === chargeId)
                      ?.chargeDescription || null,
                  rateBasisId:
                    updatedObjects.find((obj) => obj.chargeId === chargeId)
                      ?.rateBasisId || null, // Find the rateBasis from the existing objects (if available), // Dynamically set or default
                  rateBasisIddropdown:
                    updatedObjects.find((obj) => obj.chargeId === chargeId)
                      ?.rateBasisIddropdown || null, // Dynamically set or default
                  indexValue: currentMaxIndexValue,
                };
                updatedObjects.push(newObject);
              }
            }
          });
        }
      });
    }

    return updatedObjects;
  };

  const updateOriginalObjectsForEditGroupedChargesAir = (
    chargeName,
    updatedVendors,
    prevSelectedVendors,
    chargeGroupName
  ) => {
    let updatedObjects = [...originalObjects];
    let currentMaxIndexValue = Math.max(
      ...updatedObjects.map((obj) => obj.indexValue || 0),
      0
    );
    const targetGroup = newScopeOfWork.find(
      (group) => group.name === chargeGroupName
    );

    if (targetGroup) {
      const { id: chargeGroupId, name: chargeGroupName } = targetGroup;
      const chargeGroupIddropdown = [
        {
          value: chargeGroupId,
          label: chargeGroupName,
        },
      ];
      targetGroup.charges.forEach((charge) => {
        const { id: chargeId, name: chargeName } = charge;
        const chargeIddropdown = [
          {
            value: chargeId,
            label: chargeName,
          },
        ];
        const selectedVendorsForCharge = updatedVendors[chargeGroupName] || [];
        if (selectedVendorsForCharge.length > 0) {
          let firstVendorUpdated = false;
          updatedObjects = updatedObjects.filter((obj) => {
            if (
              obj.chargeId === chargeId &&
              (!obj.vendorId || obj.vendorId.trim() === "") &&
              (!obj.vendorIdDropdown || obj.vendorIdDropdown.trim() === "")
            ) {
              if (!firstVendorUpdated) {
                const vendor = selectedVendorsForCharge[0];
                const vendorId = Object.keys(vendorNames).find(
                  (key) => vendorNames[key] === vendor
                );

                firstVendorUpdated = true;
                obj.vendorId = vendorId;
                obj.vendorIdDropdown = vendorNames[vendorId];
                obj.vendorIddropdown = [
                  {
                    label: vendorNames[vendorId],
                    value: vendorId,
                  },
                ];
                obj.qty = obj.qty || 0;
                obj.rateBasis = obj.rateBasis || null;
                obj.rateBasisdropdown = obj.rateBasisdropdown || null;
                obj.chargeGroupId = chargeGroupId;
                obj.chargeGroupIddropdown = chargeGroupIddropdown;
                obj.chargeIddropdown = chargeIddropdown;
                obj.indexValue = ++currentMaxIndexValue;
                return true;
              } else {
                return false;
              }
            }
            return true;
          });
          selectedVendorsForCharge.forEach((vendor, index) => {
            const vendorId = Object.keys(vendorNames).find(
              (key) => vendorNames[key] === vendor
            );
            if (vendorId) {
              const existingIndex = updatedObjects.findIndex(
                (obj) => obj.chargeId === chargeId && obj.vendorId === vendorId
              );

              if (existingIndex === -1) {
                currentMaxIndexValue++;
                const existingData =
                  updatedObjects.find((obj) => obj.chargeId === chargeId) || {};
                const newObject = {
                  qty: parseFloat(existingData.qty || 0),
                  vendorId,
                  vendorIdDropdown: vendorNames[vendorId],
                  vendorIddropdown: [
                    {
                      label: vendorNames[vendorId],
                      value: vendorId,
                    },
                  ],
                  chargeId,
                  chargeIddropdown,
                  chargeGroupId,
                  chargeGroupIddropdown,
                  buyTaxAmount: existingData.buyTaxAmount || null,
                  buyCurrencyId: existingData.buyCurrencyId || null,
                  buyCurrencyIddropdown:
                    existingData.buyCurrencyIddropdown || null,
                  sellCurrencyId: existingData.sellCurrencyId || null,
                  sellCurrencyIddropdown:
                    existingData.sellCurrencyIddropdown || null,
                  chargeDescription: existingData.chargeDescription || null,
                  rateBasisIddropdown: existingData.rateBasisdropdown || null,
                  rateBasisIdDropdown: existingData.rateBasisDropdown || null,
                  rateBasisId: existingData.rateBasis || null, // Find the rateBasis from the existing objects (if available)
                  rateBasisIddropdown: existingData.rateBasisIddropdown || null, // Find the rateBasisdropdown dynamically
                  indexValue: currentMaxIndexValue,
                };
                updatedObjects.push(newObject);
              }
            }
          });
        }
      });
    }

    return updatedObjects;
  };

  const fetchDataApi = async (requestBody) => {
    const token = localStorage.getItem("token");
    try {
      const response = await fetch(
        `${baseUrl}/api/validations/formControlValidation/fetchProjectedData`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-access-token": JSON.parse(token),
          },
          body: JSON.stringify(requestBody),
        }
      );
      const data = await response.json();
      if (!response.ok)
        throw new Error(
          `Failed to fetch data: ${data.message || "Unknown error"}`
        );
      return data;
    } catch (error) {
      console.error("Error fetching data:", error);
      return null;
    }
  };

  const removeLoggedEntries = (deletionLogOfChargeGroup, lastFinalState) => {
    const updatedRateRequestCharge = lastFinalState.tblRateRequestCharge.filter(
      (charge) =>
        !deletionLogOfChargeGroup.some((log) => {
          const chargeGroupMatch = charge.chargeGroupIddropdown.some(
            (item) => item.label === log.chargeGroupName
          );
          const vendorMatch = charge.vendorIddropdown.some(
            (item) => item.label === log.venderName
          );
          return chargeGroupMatch && vendorMatch;
        })
    );

    return updatedRateRequestCharge; // Return the new array without directly setting state here
  };

  const removeLoggedEntriesForSingleCharges = (
    deletionLogOfChargeGroup,
    lastFinalState
  ) => {
    // Filter the charges based on non-matching criteria to the deletion logs
    const updatedRateRequestCharge = lastFinalState.tblRateRequestCharge.filter(
      (charge) =>
        !deletionLogOfChargeGroup.some((log) => {
          const vendorMatch = charge.vendorIddropdown.some(
            (item) => item.label === log.venderName // Check if vendor matches the log
          );
          const chargeMatch = charge.chargeIddropdown.some(
            (item) => item.label === log.chargeName // Check if charge matches the log
          );
          return vendorMatch && chargeMatch; // Return true if both match (filter out these)
        })
    );

    return updatedRateRequestCharge; // Return the updated array of charges
  };

  const handleSave = async () => {
    let finalDataToSubmit = [];
    const storedUserData = localStorage.getItem("userData");
    if (storedUserData !== null) {
      const decryptedData = decrypt(storedUserData);
      const userData = JSON.parse(decryptedData);
      const clientCode = userData[0].clientId;
      const branchId = userData[0].defaultBranchId;
      const email = userData[0].emailId;
      const mobile = userData[0].mobile;
      const CompanyId = userData[0].defaultCompanyId;
      let imgUrl = null;
      if (branchId != null) {
        const requestBody = {
          tableName: "tblCompanyBranchParameter",
          whereCondition: {
            status: 1,
            companyBranchId: branchId,
            clientCode: clientCode,
          },
          projection: {
            tblCompanyBranchParameterDetails: 1,
          },
        };
        const response = await fetchDataApi(requestBody);
        if (
          response &&
          response.data.length > 0 &&
          response.data[0].tblCompanyBranchParameterDetails.length > 0
        ) {
          imgUrl = response.data[0].tblCompanyBranchParameterDetails[0].header;
        }
      }
      if (isAddFormType) {
        if (selectedOption === "option1") {
          const newChargesAfterRemoval = removeLoggedEntries(
            deletionLogOfChargeGroup,
            lastFinalState
          );
          const addedQuotationFlag = newChargesAfterRemoval.map((item) => ({
            ...item,
            quotationFlag: item?.quotationFlag ?? true,
          }));
          finalDataToSubmit = {
            ...lastFinalState,
            tblRateRequestCharge: addedQuotationFlag,
          };
          onSaveGroup(finalDataToSubmit);
        }

        if (selectedOption === "option2") {
          const newChargesAfterRemoval = removeLoggedEntriesForSingleCharges(
            deletionLogSingleCharges,
            lastFinalState
          );
          const addedQuotationFlag = newChargesAfterRemoval.map((item) => ({
            ...item,
            quotationFlag: item?.quotationFlag ?? true,
          }));
          finalDataToSubmit = {
            ...lastFinalState,
            tblRateRequestCharge: addedQuotationFlag,
          };
          onSave(finalDataToSubmit);
        }
        handleClose();
        let fetchedData = {};
        if (email) {
          fetchedData.email = email;
        } else {
          const cargoTypeRequest = {
            columns: "emailId",
            tableName: "tblCompany",
            whereCondition: `id = ${CompanyId} and status = 1`,
            clientIdCondition: `clientId in (${clientId},(select id from tblClient where clientCode = 'SYSCON')) FOR JSON PATH`,
          };
          const cargoTypeData = await fetchReportData(cargoTypeRequest);
          if (
            cargoTypeData &&
            cargoTypeData.data &&
            cargoTypeData.data.length > 0
          ) {
            fetchedData.email = cargoTypeData.data[0].name;
          }
        }

        if (mobile) {
          fetchedData.mobile = mobile;
        } else {
          const cargoTypeRequest = {
            tableName: "tblCompany",
            whereCondition: { id: CompanyId, clientCode: clientCode },
            projection: { telephoneNo: 1 },
          };
          const cargoTypeData = await fetchReportData(cargoTypeRequest);
          if (
            cargoTypeData &&
            cargoTypeData.data &&
            cargoTypeData.data.length > 0
          ) {
            fetchedData.mobile = cargoTypeData.data[0].name;
          }
        }

        if (finalDataToSubmit.cargoTypeId != null) {
          const cargoTypeRequest = {
            columns: "name",
            tableName: "tblMasterData",
            whereCondition: `id = ${finalDataToSubmit.cargoTypeId} and status = 1`,
            clientIdCondition: `clientId in (${clientId},(select id from tblClient where clientCode = 'SYSCON')) FOR JSON PATH`,
          };
          const cargoTypeData = await fetchReportData(cargoTypeRequest);
          if (
            cargoTypeData &&
            cargoTypeData.data &&
            cargoTypeData.data.length > 0
          ) {
            fetchedData.cargoTypeName = cargoTypeData.data[0].name;
          }
        }
        if (finalDataToSubmit.fpdId != null) {
          const shipmentTypeRequest = {
            columns: "name",
            tableName: "tblPort",
            whereCondition: `id = ${finalDataToSubmit.fpdId} and status = 1`,
            clientIdCondition: `clientId in (${clientId},(select id from tblClient where clientCode = 'SYSCON')) FOR JSON PATH`,
          };
          const shipmentTypeData = await fetchReportData(shipmentTypeRequest);
          if (
            shipmentTypeData &&
            shipmentTypeData.data &&
            shipmentTypeData.data.length > 0
          ) {
            fetchedData.fpdName = shipmentTypeData.data[0].name;
          }
        }
        if (finalDataToSubmit.polId != null) {
          const RequestBody = {
            columns: "name",
            tableName: "tblPort",
            whereCondition: `id = ${finalDataToSubmit.polId} and status = 1`,
            clientIdCondition: `clientId in (${clientId},(select id from tblClient where clientCode = 'SYSCON')) FOR JSON PATH`,
          };
          const data = await fetchReportData(RequestBody);
          if (data && data.data && data.data.length > 0) {
            fetchedData.polName = data.data[0].name;
          }
        }
        if (finalDataToSubmit.podId != null) {
          const RequestBody = {
            columns: "name",
            tableName: "tblPort",
            whereCondition: `id = ${finalDataToSubmit.podId} and status = 1`,
            clientIdCondition: `clientId in (${clientId},(select id from tblClient where clientCode = 'SYSCON')) FOR JSON PATH`,
          };
          const data = await fetchReportData(RequestBody);
          if (data && data.data && data.data.length > 0) {
            fetchedData.podName = data.data[0].name;
          }
        }
        if (finalDataToSubmit.plrId != null) {
          const RequestBody = {
            columns: "name",
            tableName: "tblPort",
            whereCondition: `id = ${finalDataToSubmit.plrId} and status = 1`,
            clientIdCondition: `clientId in (${clientId},(select id from tblClient where clientCode = 'SYSCON')) FOR JSON PATH`,
          };
          const data = await fetchReportData(RequestBody);
          if (data && data.data && data.data.length > 0) {
            fetchedData.plrName = data.data[0].name;
          }
        }
        if (finalDataToSubmit.natureOfCargoId != null) {
          const RequestBody = {
            columns: "name",
            tableName: "tblMasterData",
            whereCondition: `id = ${finalDataToSubmit.natureOfCargoId} and status = 1`,
            clientIdCondition: `clientId in (${clientId},(select id from tblClient where clientCode = 'SYSCON')) FOR JSON PATH`,
          };
          const data = await fetchReportData(RequestBody);
          if (data && data.data && data.data.length > 0) {
            fetchedData.natureOfCargoName = data.data[0].name;
          }
        }
        if (finalDataToSubmit.companyId != null) {
          const RequestBody = {
            columns: "name,emailId",
            tableName: "tblCompany",
            whereCondition: `id = ${finalDataToSubmit.companyId} and status = 1`,
            clientIdCondition: `clientId in (${clientId},(select id from tblClient where clientCode = 'SYSCON')) FOR JSON PATH`,
          };
          const data = await fetchReportData(RequestBody);
          if (data && data.data && data.data.length > 0) {
            fetchedData.companyName = data.data[0].name;
            fetchedData.companyEmailId = data.data[0].emailId;
          }
        }
        // new
        if (finalDataToSubmit.polId != null) {
          const RequestBody = {
            columns: "name,code",
            tableName: "tblCompany",
            whereCondition: `id = ${finalDataToSubmit.polId} and status = 1`,
            clientIdCondition: `clientId in (${clientId},(select id from tblClient where clientCode = 'SYSCON')) FOR JSON PATH`,
          };
          const data = await fetchReportData(RequestBody);
          if (data && data.data && data.data.length > 0) {
            fetchedData.originAirport =
              data.data[0].code + " - " + data.data[0].name;
          }
        }

        if (finalDataToSubmit.podId != null) {
          const RequestBody = {
            columns: "name,code",
            tableName: "tblCompany",
            whereCondition: `id = ${finalDataToSubmit.podId} and status = 1`,
            clientIdCondition: `clientId in (${clientId},(select id from tblClient where clientCode = 'SYSCON')) FOR JSON PATH`,
          };
          const data = await fetchReportData(RequestBody);
          if (data && data.data && data.data.length > 0) {
            fetchedData.DestinationAirport =
              data.data[0].code + " - " + data.data[0].name;
          }
        }

        if (finalDataToSubmit.cargoWtUnitId != null) {
          const RequestBody = {
            columns: "name",
            tableName: "tblMasterData",
            whereCondition: `id = ${finalDataToSubmit.cargoWtUnitId} and status = 1`,
            clientIdCondition: `clientId in (${clientId},(select id from tblClient where clientCode = 'SYSCON')) FOR JSON PATH`,
          };
          const data = await fetchReportData(RequestBody);
          if (data && data.data && data.data.length > 0) {
            fetchedData.cargoWtUnitName = data.data[0].name;
          }
        }

        if (finalDataToSubmit.volumeUnitId != null) {
          const RequestBody = {
            columns: "name",
            tableName: "tblMasterData",
            whereCondition: `id = ${finalDataToSubmit.volumeUnitId} and status = 1`,
            clientIdCondition: `clientId in (${clientId},(select id from tblClient where clientCode = 'SYSCON')) FOR JSON PATH`,
          };
          const data = await fetchReportData(RequestBody);
          if (data && data.data && data.data.length > 0) {
            fetchedData.volumeUnitName = data.data[0].name;
          }
        }

        if (branchId != null) {
          const RequestBody = {
            columns: "name",
            tableName: "tblCompanyBranch",
            whereCondition: `id = ${branchId}`,
            clientIdCondition: `status = 1 FOR JSON PATH`,
          };
          const data = await fetchReportData(RequestBody);
          if (data && data.data && data.data.length > 0) {
            fetchedData.ownCompanyName = data.data[0].name;
          }
        }

        if (finalDataToSubmit.noOfPackages != null) {
          fetchedData.noOfPackages = finalDataToSubmit.noOfPackages;
        }

        if (finalDataToSubmit.cargoWt != null) {
          fetchedData.cargoWt = finalDataToSubmit.cargoWt;
        }

        if (finalDataToSubmit.commodity != null) {
          fetchedData.commodityName = finalDataToSubmit.commodity;
        }

        if (finalDataToSubmit.volumeWt != null) {
          fetchedData.volumeWtName = finalDataToSubmit.volumeWt;
        }

        if (finalDataToSubmit.commodity != null) {
          fetchedData.commodityName = finalDataToSubmit.commodity;
        }

        const uniqueVendorIds = [
          ...new Set(
            finalDataToSubmit.tblRateRequestCharge.map((item) => item.vendorId)
          ),
        ].filter((vendorId) => vendorId);
        for (const vendorId of uniqueVendorIds) {
          const filteredCharges = finalDataToSubmit.tblRateRequestCharge.filter(
            (item) => item.vendorId === vendorId
          );
          const emailIdRequest = {
            columns: "emailId",
            tableName: "tblCompanyBranch",
            whereCondition: `id = ${vendorId}`,
            clientIdCondition: `status = 1 FOR JSON PATH`,
          };
          const emailIdData = await fetchReportData(emailIdRequest);
          //let emailId = null;
          let emailId = "rohitanabhavane26@gmail.com";
          if (emailIdData && emailIdData.data && emailIdData.data.length > 0) {
            emailId = emailIdData.data[0].emailId;
            +", " + emailId;
          }
          let reportContent;
          reportContent =
            transportMode === "Sea"
              ? QuotationReportsAdd(
                  finalDataToSubmit,
                  filteredCharges,
                  [fetchedData],
                  imgUrl
                )
              : QuotationReportsAddAir(
                  finalDataToSubmit,
                  filteredCharges,
                  [fetchedData],
                  imgUrl
                );
          await sendEmail(reportContent, emailId);
        }
      } else {
        if (selectedOption === "option1") {
          const newChargesAfterRemoval = removeLoggedEntries(
            deletionLogOfChargeGroup,
            lastFinalState
          );
          const addedQuotationFlag = newChargesAfterRemoval.map((item) => ({
            ...item,
            quotationFlag: item?.quotationFlag ?? true,
          }));
          finalDataToSubmit = {
            ...lastFinalState,
            tblRateRequestCharge: addedQuotationFlag,
          };
          onSaveGroup(finalDataToSubmit);
        }

        if (selectedOption === "option2") {
          const newChargesAfterRemoval = removeLoggedEntriesForSingleCharges(
            deletionLogSingleCharges,
            lastFinalState
          );
          const addedQuotationFlag = newChargesAfterRemoval.map((item) => ({
            ...item,
            quotationFlag: item?.quotationFlag ?? true,
          }));
          finalDataToSubmit = {
            ...lastFinalState,
            tblRateRequestCharge: addedQuotationFlag,
          };
          onSave(finalDataToSubmit);
        }
        handleClose();
        let fetchedData = [];

        if (email != null || email != undefined || email != "") {
          fetchedData.email = email;
        } else {
          const cargoTypeRequest = {
            columns: "emailId",
            tableName: "tblCompany",
            whereCondition: `id = ${CompanyId} and `,
            clientIdCondition: `status = 1 FOR JSON PATH`,
          };
          const cargoTypeData = await fetchReportData(cargoTypeRequest);
          if (
            cargoTypeData &&
            cargoTypeData.data &&
            cargoTypeData.data.length > 0
          ) {
            fetchedData.email = cargoTypeData.data[0].emailId;
          }
        }

        if (mobile != null || mobile != undefined || mobile != "") {
          fetchedData.mobile = mobile;
        } else {
          const cargoTypeRequest = {
            tableName: "tblCompany",
            whereCondition: { _id: CompanyId, clientCode: clientCode },
            projection: { telephoneNo: 1 },
          };
          const cargoTypeData = await fetchDataApi(cargoTypeRequest);
          if (
            cargoTypeData &&
            cargoTypeData.data &&
            cargoTypeData.data.length > 0
          ) {
            fetchedData.mobile = cargoTypeData.data[0].telephoneNo;
          }
        }
        if (finalDataToSubmit.cargoTypeId != null) {
          const cargoTypeRequest = {
            columns: "name",
            tableName: "tblMasterData",
            whereCondition: `id = ${finalDataToSubmit.cargoTypeId} and status = 1`,
            clientIdCondition: `clientId in (${clientId},(select id from tblClient where clientCode = 'SYSCON')) FOR JSON PATH`,
          };
          const cargoTypeData = await fetchReportData(cargoTypeRequest);
          if (
            cargoTypeData &&
            cargoTypeData.data &&
            cargoTypeData.data.length > 0
          ) {
            fetchedData.cargoTypeName = cargoTypeData.data[0].name;
          }
        }
        if (finalDataToSubmit.fpdId != null) {
          const shipmentTypeRequest = {
            columns: "name",
            tableName: "tblPort",
            whereCondition: `id = ${finalDataToSubmit.fpdId} and status = 1`,
            clientIdCondition: `clientId in (${clientId},(select id from tblClient where clientCode = 'SYSCON')) FOR JSON PATH`,
          };
          const shipmentTypeData = await fetchReportData(shipmentTypeRequest);
          if (
            shipmentTypeData &&
            shipmentTypeData.data &&
            shipmentTypeData.data.length > 0
          ) {
            fetchedData.fpdName = shipmentTypeData.data[0].name;
          }
        }
        if (finalDataToSubmit.polId != null) {
          const RequestBody = {
            columns: "name",
            tableName: "tblPort",
            whereCondition: `id = ${finalDataToSubmit.polId} and status = 1`,
            clientIdCondition: `clientId in (${clientId},(select id from tblClient where clientCode = 'SYSCON')) FOR JSON PATH`,
          };
          const data = await fetchReportData(RequestBody);
          if (data && data.data && data.data.length > 0) {
            fetchedData.polName = data.data[0].name;
          }
        }
        if (finalDataToSubmit.podId != null) {
          const RequestBody = {
            columns: "name",
            tableName: "tblPort",
            whereCondition: `id = ${finalDataToSubmit.podId} and status = 1`,
            clientIdCondition: `clientId in (${clientId},(select id from tblClient where clientCode = 'SYSCON')) FOR JSON PATH`,
          };
          const data = await fetchReportData(RequestBody);
          if (data && data.data && data.data.length > 0) {
            fetchedData.podName = data.data[0].name;
          }
        }
        if (finalDataToSubmit.plrId != null) {
          const RequestBody = {
            columns: "name",
            tableName: "tblPort",
            whereCondition: `id = ${finalDataToSubmit.plrId} and status = 1`,
            clientIdCondition: `clientId in (${clientId},(select id from tblClient where clientCode = 'SYSCON')) FOR JSON PATH`,
          };
          const data = await fetchReportData(RequestBody);
          if (data && data.data && data.data.length > 0) {
            fetchedData.plrName = data.data[0].name;
          }
        }
        if (finalDataToSubmit.natureOfCargoId != null) {
          const RequestBody = {
            columns: "name",
            tableName: "tblMasterData",
            whereCondition: `id = ${finalDataToSubmit.natureOfCargoId} and status = 1`,
            clientIdCondition: `clientId in (${clientId},(select id from tblClient where clientCode = 'SYSCON')) FOR JSON PATH`,
          };
          const data = await fetchReportData(RequestBody);
          if (data && data.data && data.data.length > 0) {
            fetchedData.natureOfCargoName = data.data[0].name;
          }
        }
        if (finalDataToSubmit.companyId != null) {
          const RequestBody = {
            columns: "name,emailId",
            tableName: "tblCompany",
            whereCondition: `id = ${finalDataToSubmit.companyId}`,
            clientIdCondition: `status = 1 FOR JSON PATH`,
          };
          const data = await fetchReportData(RequestBody);
          if (data && data.data && data.data.length > 0) {
            fetchedData.companyName = data.data[0].name;
            fetchedData.companyEmailId = data.data[0].emailId;
          }
        }

        if (finalDataToSubmit.polId != null) {
          const RequestBody = {
            columns: "name,code",
            tableName: "tblPort",
            whereCondition: `id = ${finalDataToSubmit.polId} and status = 1`,
            clientIdCondition: `clientId in (${clientId},(select id from tblClient where clientCode = 'SYSCON'))  FOR JSON PATH`,
          };
          const data = await fetchReportData(RequestBody);
          if (data && data.data && data.data.length > 0) {
            fetchedData.originAirport =
              data.data[0].code + " - " + data.data[0].name;
          }
        }

        if (finalDataToSubmit.podId != null) {
          const RequestBody = {
            columns: "name,code",
            tableName: "tblPort",
            whereCondition: `id = ${finalDataToSubmit.podId} and status = 1`,
            clientIdCondition: `clientId in (${clientId},(select id from tblClient where clientCode = 'SYSCON')) FOR JSON PATH`,
          };
          const data = await fetchReportData(RequestBody);
          if (data && data.data && data.data.length > 0) {
            fetchedData.DestinationAirport =
              data.data[0].code + " - " + data.data[0].name;
          }
        }

        if (finalDataToSubmit.cargoWtUnitId != null) {
          const RequestBody = {
            columns: "name",
            tableName: "tblMasterData",
            whereCondition: `id = ${finalDataToSubmit.cargoWtUnitId} and status = 1`,
            clientIdCondition: `clientId in (${clientId},(select id from tblClient where clientCode = 'SYSCON')) FOR JSON PATH`,
          };
          const data = await fetchReportData(RequestBody);
          if (data && data.data && data.data.length > 0) {
            fetchedData.cargoWtUnitName = data.data[0].name;
          }
        }

        if (finalDataToSubmit.volumeUnitId != null) {
          const RequestBody = {
            columns: "name",
            tableName: "tblMasterData",
            whereCondition: `id = ${finalDataToSubmit.volumeUnitId} and status = 1`,
            clientIdCondition: `clientId in (${clientId},(select id from tblClient where clientCode = 'SYSCON')) FOR JSON PATH`,
          };
          const data = await fetchReportData(RequestBody);
          if (data && data.data && data.data.length > 0) {
            fetchedData.volumeUnitName = data.data[0].name;
          }
        }

        if (branchId != null) {
          const RequestBody = {
            columns: "name",
            tableName: "tblCompanyBranch",
            whereCondition: `id = ${branchId} `,
            clientIdCondition: `status = 1 FOR JSON PATH`,
          };
          const data = await fetchReportData(RequestBody);
          if (data && data.data && data.data.length > 0) {
            fetchedData.ownCompanyName = data.data[0].name;
          }
        }

        if (finalDataToSubmit.noOfPackages != null) {
          fetchedData.noOfPackages = finalDataToSubmit.noOfPackages;
        }

        if (finalDataToSubmit.cargoWt != null) {
          fetchedData.cargoWt = finalDataToSubmit.cargoWt;
        }

        if (finalDataToSubmit.commodity != null) {
          fetchedData.commodityName = finalDataToSubmit.commodity;
        }

        if (finalDataToSubmit.volumeWt != null) {
          fetchedData.volumeWtName = finalDataToSubmit.volumeWt;
        }

        if (finalDataToSubmit.commodity != null) {
          fetchedData.commodityName = finalDataToSubmit.commodity;
        }

        const uniqueVendorIds = [
          ...new Set(
            finalDataToSubmit.tblRateRequestCharge.map((item) => item.vendorId)
          ),
        ].filter((vendorId) => vendorId);
        for (const vendorId of uniqueVendorIds) {
          const filteredCharges = finalDataToSubmit.tblRateRequestCharge.filter(
            (item) => item.vendorId === vendorId
          );
          const emailIdRequest = {
            columns: "emailId",
            tableName: "tblCompany",
            whereCondition: `id = ${vendorId} `,
            clientIdCondition: `status = 1 FOR JSON PATH`,
          };
          const emailIdData = await fetchReportData(emailIdRequest);
          //let emailId = 'rohitanabhavane26@gmail.com , nilay@sysconinfotech.com';
          let emailId = "rohitanabhavane26@gmail.com"; // default email addresses
          //let emailId = null;
          if (emailIdData && emailIdData.data && emailIdData.data.length > 0) {
            emailId = emailIdData.data[0].emailId + ", " + emailId;
          }
          let reportContent;
          reportContent =
            transportMode === "Sea"
              ? QuotationReportsEdit(
                  finalDataToSubmit,
                  filteredCharges,
                  [fetchedData],
                  imgUrl
                )
              : QuotationReportsEditAir(
                  finalDataToSubmit,
                  filteredCharges,
                  [fetchedData],
                  imgUrl
                );
          await sendEmail(reportContent, emailId);
        }
      }
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return ""; // Return empty string if dateString is null, undefined, or an empty string
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return ""; // Return empty string if the date is invalid
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const QuotationReportsEdit = (
    data,
    tblRateRequestCharge,
    ddlData,
    imageUrl
  ) => {
    const thStyle =
      "width: 10%; text-align: left; padding: 5px; vertical-align: top;";
    const tdStyle =
      "width: 30%; text-align: left; padding: 5px; vertical-align: top;";

    // Helper function to safely access object properties
    const getSafe = (obj, key, fallback = "") =>
      obj && obj[key] !== undefined && obj[key] !== null ? obj[key] : fallback;

    const formattedDate = formatDate(getSafe(data, "rateRequestDate"));
    const SailDate = formatDate(getSafe(data, "expectedSailDate"));

    const uniqueVendorNames = [
      ...new Set(
        tblRateRequestCharge.map((item) => getSafe(item, "vendorIdDropdown"))
      ),
    ];
    const vendorNamesHtml = uniqueVendorNames
      .map((vendor) => `${vendor}`)
      .join("");

    const chargeDescriptionRows = uniqueVendorNames
      .map((vendor) => {
        const filteredCharges = tblRateRequestCharge.filter(
          (item) => getSafe(item, "vendorIdDropdown") === vendor
        );
        const chargeDescriptions = filteredCharges
          .map((item) => getSafe(item, "chargeIdDropdown"))
          .join("<br/>");
        const sizeTypes = filteredCharges
          .map(
            (item) =>
              `${getSafe(item, "sizeIdDropdown")}/${getSafe(
                item,
                "typeIdDropdown"
              )}`
          )
          .join("<br/>");

        return `
                <tr>
                    <td align="center" style="${tdStyle}">${chargeDescriptions}</td>
                    <td align="center" style="${tdStyle}">${sizeTypes}</td>
                </tr>
            `;
      })
      .join("");

    const reportHtml = `
            <main>
                <img src="${imageUrl}" alt="LOGO" style="width: 100%; height: auto;">
                <h1 style="text-align: center;">Request For Quotation</h1>
                <table class='tblhead' width="100%" border="0" cellspacing="0" cellpadding="0" style="margin-top: 20px;">
                    <tr>
                        <td width="49%" valign="top">
                            <table class='tblhead' width="100%" border="0" cellspacing="0" cellpadding="0">
                                <tr>
                                    <th align="left" style="${thStyle}">Shipping Line:</th>
                                    <td align="left" style="${tdStyle}">${vendorNamesHtml}</td>
                                </tr>
                                <tr>
                                    <th align="left" style="${thStyle}">ATTN:</th>
                                    <td align="left" style="${tdStyle}"></td>
                                </tr>
                            </table>
                        </td>
                        <td width="51%" valign="top">
                            <table class='tblhead' width="100%" border="0" cellspacing="0" cellpadding="0">
                                <tr>
                                    <th align="left" style="${thStyle}">Quotation No:</th>
                                    <td align="left" style="${tdStyle}">${getSafe(
      data,
      "rateRequestNo"
    )}</td>
                                </tr>
                                <tr>
                                    <th align="left" style="${thStyle}">Dated:</th>
                                    <td align="left" style="${tdStyle}">${formattedDate}</td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                </table>
                <table class='tblhead' width="100%"  border="1" cellspacing="0" cellpadding="0" style="margin-top: 20px;">
                    <tr>
                        <td width="33.3%" valign="top">
                            <table class='tblhead' width="100%" border="0" cellspacing="0" cellpadding="0">
                                <tr>
                                    <th align="left" style="${thStyle}">PLR:</th>
                                    <td align="left" style="${tdStyle}">${getSafe(
      ddlData[0],
      "plrName"
    )}</td>
                                </tr>
                                <tr>
                                    <th align="left" style="${thStyle}">FPD:</th>
                                    <td align="left" style="${tdStyle}">${getSafe(
      ddlData[0],
      "fpdName"
    )}</td>
                                </tr>
                                <tr>
                                    <th align="left" style="${thStyle}">Commodity:</th>
                                    <td align="left" style="${tdStyle}">${getSafe(
      data,
      "commodity"
    )}</td>
                                </tr>
                                <tr>
                                    <th align="left" style="${thStyle}">Sailing Date:</th>
                                    <td align="left" style="${tdStyle}">${SailDate}</td>
                                </tr>
                            </table>
                        </td>
                        <td width="33.3%" valign="top">
                            <table class='tblhead' width="100%" border="0" cellspacing="0" cellpadding="0">
                                <tr>
                                    <th align="left" style="${thStyle}">POL:</th>
                                    <td align="left" style="${tdStyle}">${getSafe(
      ddlData[0],
      "polName"
    )}</td>
                                </tr>
                                <tr>
                                    <th align="left" style="${thStyle}">Gross Weight:</th>
                                    <td align="left" style="${tdStyle}">${getSafe(
      data,
      "cargoWt"
    )}</td>
                                </tr>
                                <tr>
                                    <th align="left" style="${thStyle}">Shipment Type:</th>
                                    <td align="left" style="${tdStyle}">${getSafe(
      ddlData[0],
      "natureOfCargoName"
    )}</td>
                                </tr>
                            </table>
                        </td>
                        <td width="33.3%" valign="top">
                            <table class='tblhead' width="100%" border="0" cellspacing="0" cellpadding="0">
                                <tr>
                                    <th align="left" style="${thStyle}">POD:</th>
                                    <td align="left" style="${tdStyle}">${getSafe(
      ddlData[0],
      "podName"
    )}</td>
                                </tr>
                                <tr>
                                    <th align="left" style="${thStyle}">Cargo Type:</th>
                                    <td align="left" style="${tdStyle}">${getSafe(
      ddlData[0],
      "cargoTypeName"
    )}</td>
                                </tr>
                                <tr>
                                    <th align="left" style="${thStyle}">EST Date:</th>
                                    <td align="left" style="${tdStyle}">${SailDate}</td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                    <tr>
                        <td style="${tdStyle}" colspan="3">Remarks: ${getSafe(
      data,
      "remarks"
    )}</td>
                    </tr>
                </table>
                <table class='tblhead' width="50%" border="0" cellspacing="0" cellpadding="0" style="margin-top: 20px;">
                    <tr>
                        <td width="49%" valign="top">
                            <table class='tblhead' width="100%" border="1" cellspacing="0" cellpadding="0">
                                <tr>
                                    <th align="center" style="${thStyle}">CHARGE DESCRIPTION</th>
                                    <th align="center" style="${thStyle}">Size/Type</th>
                                </tr>
                                ${chargeDescriptionRows}
                            </table>
                        </td>
                    </tr>
                </table>
                <h2>Contact Information:</h2>
                <h4>For any queries or further information, please contact ${getSafe(
                  data,
                  "preparedById"
                )} at ${getSafe(ddlData[0], "email")} or ${getSafe(
      ddlData[0],
      "mobile"
    )} </h4>
                <hr>
                <h4>We appreciate your prompt attention to this request and look forward to receiving your quotation.</h4>
                <h4>Thank you.</h4>
                <h4>Sincerely,</h4>
                <h3>${getSafe(data, "preparedById")}</h3>
                <h3>${getSafe(ddlData[0], "companyName")}</h3>
                <h3>${getSafe(ddlData[0], "companyEmailId")}</h3>
            </main>
        `;

    return reportHtml;
  };
  const QuotationReportsAdd = (
    data,
    tblRateRequestCharge,
    ddlData,
    imageUrl
  ) => {
    const thStyle =
      "width: 10%; text-align: left; padding: 5px; vertical-align: top;";
    const tdStyle =
      "width: 30%; text-align: left; padding: 5px; vertical-align: top;";

    const getSafe = (obj, key, fallback = "") =>
      obj && obj[key] !== undefined && obj[key] !== null ? obj[key] : fallback;
    console.log("data - ", ddlData);
    // Log formatted dates to check if getSafe is working correctly
    const formattedDate = formatDate(getSafe(data, "rateRequestDate"));
    const SailDate = formatDate(getSafe(data, "expectedSailDate"));

    // Step 1: Extract unique vendor names
    const uniqueVendorNames = [
      ...new Set(
        tblRateRequestCharge.map((item) => {
          const label = getSafe(item.vendorIddropdown[0], "label");
          return label;
        })
      ),
    ];
    const vendorNamesHtml = uniqueVendorNames
      .map((vendor) => `${vendor}`)
      .join("");

    // Step 2: Iterate over each vendor and filter charges
    const chargeDescriptionRows = uniqueVendorNames
      .map((vendor) => {
        // Filter charges related to the current vendor
        const filteredCharges = tblRateRequestCharge.filter((item) => {
          const vendorLabel = getSafe(item.vendorIddropdown[0], "label");
          return vendorLabel === vendor;
        });

        // Check if filteredCharges is empty, indicating a potential issue
        if (filteredCharges.length === 0) {
          //console.warn(`No charges found for vendor: ${vendor}`);
        } else {
        }

        // Extract the required fields from filtered charges
        const chargeDescriptions = filteredCharges
          .map((item) => {
            // First try to get the label from item.chargeIddropdown[0]
            let description = getSafe(item.chargeIddropdown?.[0], "label");

            // If description is undefined, use item.chargeIdDropdown directly without getSafe
            if (!description && item.chargeIdDropdown) {
              description = item.chargeIdDropdown;
            }

            // Return 'N/A' if both are empty, otherwise return the description
            return description ? description : ""; // Handle empty descriptions
          })
          .join("<br/>");

        const sizeTypes = filteredCharges
          .map((item) => {
            let size = getSafe(item.sizeIddropdown?.[0], "label");
            if (!size && item.sizeIdDropdown) {
              size = item.sizeIdDropdown;
            }
            let type = getSafe(item.typeIddropdown?.[0], "label");
            if (!type && item.typeIdDropdown) {
              type = item.typeIdDropdown;
            }
            return size && type ? `${size}/${type}` : ""; // Handle empty size/type
          })
          .join("<br/>");

        return `
        <tr>
            <td align="center" style="${tdStyle}">${chargeDescriptions}</td>
            <td align="center" style="${tdStyle}">${sizeTypes}</td>
        </tr>
    `;
      })
      .join("");

    const reportHtml = `
            <main>
                <img src="${imageUrl}" alt="LOGO" style="width: 100%; height: auto;">
                <h1 style="text-align: center;">Request For Quotation</h1>
                <table class='tblhead' width="100%" border="0" cellspacing="0" cellpadding="0" style="margin-top: 20px;">
                    <tr>
                        <td width="49%" valign="top">
                            <table class='tblhead' width="100%" border="0" cellspacing="0" cellpadding="0">
                                <tr>
                                    <th align="left" style="${thStyle}">Shipping Line:</th>
                                    <td align="left" style="${tdStyle}">${vendorNamesHtml}</td>
                                </tr>
                                <tr>
                                    <th align="left" style="${thStyle}">ATTN:</th>
                                    <td align="left" style="${tdStyle}"></td>
                                </tr>
                            </table>
                        </td>
                        <td width="51%" valign="top">
                            <table class='tblhead' width="100%" border="0" cellspacing="0" cellpadding="0">
                                <tr>
                                    <th align="left" style="${thStyle}">Quotation No:</th>
                                    <td align="left" style="${tdStyle}">${getSafe(
      data,
      "rateRequestNo"
    )}</td>
                                </tr>
                                <tr>
                                    <th align="left" style="${thStyle}">Dated:</th>
                                    <td align="left" style="${tdStyle}">${formattedDate}</td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                </table>
                <table class='tblhead' width="100%"  border="1" cellspacing="0" cellpadding="0" style="margin-top: 20px;">
                    <tr>
                        <td width="33.3%" valign="top">
                            <table class='tblhead' width="100%" border="0" cellspacing="0" cellpadding="0">
                                <tr>
                                    <th align="left" style="${thStyle}">PLR:</th>
                                    <td align="left" style="${tdStyle}">${getSafe(
      ddlData[0],
      "plrName"
    )}</td>
                                </tr>
                                <tr>
                                    <th align="left" style="${thStyle}">FPD:</th>
                                    <td align="left" style="${tdStyle}">${getSafe(
      ddlData[0],
      "fpdName"
    )}</td>
                                </tr>
                                <tr>
                                    <th align="left" style="${thStyle}">Commodity:</th>
                                    <td align="left" style="${tdStyle}">${getSafe(
      data,
      "commodity"
    )}</td>
                                </tr>
                                <tr>
                                    <th align="left" style="${thStyle}">Sailing Date:</th>
                                    <td align="left" style="${tdStyle}">${SailDate}</td>
                                </tr>
                            </table>
                        </td>
                        <td width="33.3%" valign="top">
                            <table class='tblhead' width="100%" border="0" cellspacing="0" cellpadding="0">
                                <tr>
                                    <th align="left" style="${thStyle}">POL:</th>
                                    <td align="left" style="${tdStyle}">${getSafe(
      ddlData[0],
      "polName"
    )}</td>
                                </tr>
                                <tr>
                                    <th align="left" style="${thStyle}">Gross Weight:</th>
                                    <td align="left" style="${tdStyle}">${getSafe(
      data,
      "cargoWt"
    )}</td>
                                </tr>
                                <tr>
                                    <th align="left" style="${thStyle}">Shipment Type:</th>
                                    <td align="left" style="${tdStyle}">${getSafe(
      ddlData[0],
      "natureOfCargoName"
    )}</td>
                                </tr>
                            </table>
                        </td>
                        <td width="33.3%" valign="top">
                            <table class='tblhead' width="100%" border="0" cellspacing="0" cellpadding="0">
                                <tr>
                                    <th align="left" style="${thStyle}">POD:</th>
                                    <td align="left" style="${tdStyle}">${getSafe(
      ddlData[0],
      "podName"
    )}</td>
                                </tr>
                                <tr>
                                    <th align="left" style="${thStyle}">Cargo Type:</th>
                                    <td align="left" style="${tdStyle}">${getSafe(
      ddlData[0],
      "cargoTypeName"
    )}</td>
                                </tr>
                                <tr>
                                    <th align="left" style="${thStyle}">EST Date:</th>
                                    <td align="left" style="${tdStyle}">${SailDate}</td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                    <tr>
                        <td style="${tdStyle}" colspan="3">Remarks: ${getSafe(
      data,
      "remarks"
    )}</td>
                    </tr>
                </table>
                <table class='tblhead' width="50%" border="0" cellspacing="0" cellpadding="0" style="margin-top: 20px;">
                    <tr>
                        <td width="49%" valign="top">
                            <table class='tblhead' width="100%" border="1" cellspacing="0" cellpadding="0">
                                <tr>
                                    <th align="center" style="${thStyle}">CHARGE DESCRIPTION</th>
                                    <th align="center" style="${thStyle}">Size/Type</th>
                                </tr>
                                ${chargeDescriptionRows}
                            </table>
                        </td>
                    </tr>
                </table>
                <h2>Contact Information:</h2>
                   <h4>For any queries or further information, please contact ${getSafe(
                     data,
                     "preparedById"
                   )} at ${getSafe(ddlData[0], "email")} or ${getSafe(
      ddlData[0],
      "mobile"
    )} </h4>
                <hr>
                <h4>We appreciate your prompt attention to this request and look forward to receiving your quotation.</h4>
                <h4>Thank you.</h4>
                <h4>Sincerely,</h4>
                <h3>${getSafe(data, "preparedById")}</h3>
                <h3>${getSafe(ddlData[0], "companyName")}</h3>
                <h3>${getSafe(ddlData[0], "companyEmailId")}</h3>
            </main>
        `;

    return reportHtml;
  };

  const QuotationReportsAddAir = (
    data,
    tblRateRequestCharge,
    ddlData,
    imageUrl
  ) => {
    const getSafe = (obj, key, fallback = "") =>
      obj && obj[key] !== undefined && obj[key] !== null ? obj[key] : fallback;

    // Generate rows dynamically from `data.tblRateRequestQty`
    const dynamicRows = data.tblRateRequestQty
      .map((item, index) => {
        const dimensions = `${getSafe(item, "length", "")} * ${getSafe(
          item,
          "width",
          ""
        )} * ${getSafe(item, "height", "")}`;
        return `
                <tr style="text-align: center;">
                    <td style="border: 1px solid #000;border-collapse: collapse;padding:6px;">${
                      index + 1
                    }</td>
                    <td style="border: 1px solid #000;border-collapse: collapse;padding:6px;">${dimensions}</td>
                    <td style="border: 1px solid #000;border-collapse: collapse;padding:6px;">${getSafe(
                      item,
                      "noOfPackages",
                      "-"
                    )}</td>
                    <td style="border: 1px solid #000;border-collapse: collapse;padding:6px;">${getSafe(
                      item,
                      "actualWt",
                      "-"
                    )}</td>
                    <td style="border: 1px solid #000;border-collapse: collapse;padding:6px;">${getSafe(
                      item,
                      "volWt",
                      "-"
                    )}</td>
                </tr>`;
      })
      .join("");

    // Generate totals row
    const totalPackages = data.tblRateRequestQty.reduce(
      (sum, item) => sum + (item.noOfPackages || 0),
      0
    );
    const totalActualWeight = data.tblRateRequestQty.reduce(
      (sum, item) => sum + (item.actualWt || 0),
      0
    );
    const totalVolumeWeight = data.tblRateRequestQty.reduce(
      (sum, item) => sum + (item.volWt || 0),
      0
    );

    const totalsRow = `
        <tr style="text-align: center;">
            <td style="border: 1px solid #000;border-collapse: collapse;padding:6px;">TOTAL</td>
            <td style="border: 1px solid #000;border-collapse: collapse;padding:6px;"></td>
            <td style="border: 1px solid #000;border-collapse: collapse;padding:6px;">${totalPackages}</td>
            <td style="border: 1px solid #000;border-collapse: collapse;padding:6px;">${totalActualWeight.toFixed(
              2
            )}</td>
            <td style="border: 1px solid #000;border-collapse: collapse;padding:6px;">${totalVolumeWeight.toFixed(
              2
            )}</td>
        </tr>`;

    const reportHtml = `
        <main style="width: 100%; display: flex; justify-content: center; align-items: center; background-color: #f5f5f5; padding: 20px;">
           <div style="width: 210mm; height: auto; background-color: white; padding: 20px; box-shadow: 0 0 10px rgba(0,0,0,0.1);">
               <img src="${imageUrl}" alt="Company Logo" style="width: 100%; height: auto; margin-bottom: 20px;">
               <h1 style="text-align: center;">QUOTATION REQUEST TO AIRLINE</h1>
               <p>Please advise rate for below:</p>
               <table style="width:60%;border: 1px solid #000;border-collapse: collapse;">
              <tr>
                 <td style="border: 1px solid #000;border-collapse: collapse;padding:6px;">Origin</td>
                 <td style="border: 1px solid #000;border-collapse: collapse;padding:6px;">${getSafe(
                   ddlData[0],
                   "originAirport"
                 )}</td>
              </tr>
              <tr>
                 <td style="border: 1px solid #000;border-collapse: collapse;padding:6px;">DEST</td>
                 <td style="border: 1px solid #000;border-collapse: collapse;padding:6px;">${getSafe(
                   ddlData[0],
                   "DestinationAirport"
                 )}</td>
              </tr>
              <tr>
                 <td style="border: 1px solid #000;border-collapse: collapse;padding:6px;">NO OF PKGS</td>
                 <td style="border: 1px solid #000;border-collapse: collapse;padding:6px;">${getSafe(
                   ddlData[0],
                   "noOfPackages"
                 )}</td>
              </tr>
              <tr>
                 <td style="border: 1px solid #000;border-collapse: collapse;padding:6px;">GROSS WT</td>
                 <td style="border: 1px solid #000;border-collapse: collapse;padding:6px;">${getSafe(
                   ddlData[0],
                   "cargoWt"
                 )} ${getSafe(ddlData[0], "cargoWtUnitName")}</td>
              </tr>
              <tr>
                 <td style="border: 1px solid #000;border-collapse: collapse;padding:6px;">Total Volume WT</td>
                 <td style="border: 1px solid #000;border-collapse: collapse;padding:6px;">${getSafe(
                   ddlData[0],
                   "volumeWtName"
                 )} ${getSafe(ddlData[0], "volumeUnitName")}</td>
              </tr>
              <tr>
                 <td style="border: 1px solid #000;border-collapse: collapse;padding:6px;">Description</td>
                 <td style="border: 1px solid #000;border-collapse: collapse;padding:6px;">${getSafe(
                   ddlData[0],
                   "commodityName"
                 )}</td>
              </tr>
           </table>
               <table style="width: 100%; border: 1px solid #000; padding-top: 25px; border-collapse: collapse; margin-bottom: 20px; margin-top: 10px;">
                  <tr style="text-align: center;">
                      <th style="border: 1px solid #000;border-collapse: collapse;padding:6px;">DIMS IN CMS</th>
                      <th style="border: 1px solid #000;border-collapse: collapse;padding:6px;"></th>
                      <th style="border: 1px solid #000;border-collapse: collapse;padding:6px;">NO OF PCS</th>
                      <th style="border: 1px solid #000;border-collapse: collapse;padding:6px;">ACTUAL WT ( KGS )</th>
                      <th style="border: 1px solid #000;border-collapse: collapse;padding:6px;">VOL WT ( KGS )</th>
                  </tr>
                  ${dynamicRows}
                  ${totalsRow}
               </table>
               <p>Thanks and Best Regards</p>
               <p>${getSafe(ddlData[0], "ownCompanyName")}</p>
           </div>
        </main>
        `;

    return reportHtml;
  };

  const QuotationReportsEditAir = (
    data,
    tblRateRequestCharge,
    ddlData,
    imageUrl
  ) => {
    const getSafe = (obj, key, fallback = "") =>
      obj && obj[key] !== undefined && obj[key] !== null ? obj[key] : fallback;

    // Generate rows dynamically from `data.tblRateRequestQty`
    const dynamicRows = data.tblRateRequestQty
      .map((item, index) => {
        const dimensions = `${getSafe(item, "length", "")} * ${getSafe(
          item,
          "width",
          ""
        )} * ${getSafe(item, "height", "")}`;
        return `
                <tr style="text-align: center;">
                    <td style="border: 1px solid #000;border-collapse: collapse;padding:6px;">${
                      index + 1
                    }</td>
                    <td style="border: 1px solid #000;border-collapse: collapse;padding:6px;">${dimensions}</td>
                    <td style="border: 1px solid #000;border-collapse: collapse;padding:6px;">${getSafe(
                      item,
                      "noOfPackages",
                      "-"
                    )}</td>
                    <td style="border: 1px solid #000;border-collapse: collapse;padding:6px;">${getSafe(
                      item,
                      "actualWt",
                      "-"
                    )}</td>
                    <td style="border: 1px solid #000;border-collapse: collapse;padding:6px;">${getSafe(
                      item,
                      "volWt",
                      "-"
                    )}</td>
                </tr>`;
      })
      .join("");

    // Generate totals row
    const totalPackages = data.tblRateRequestQty.reduce(
      (sum, item) => sum + (item.noOfPackages || 0),
      0
    );
    const totalActualWeight = data.tblRateRequestQty.reduce(
      (sum, item) => sum + (item.actualWt || 0),
      0
    );
    const totalVolumeWeight = data.tblRateRequestQty.reduce(
      (sum, item) => sum + (item.volWt || 0),
      0
    );

    const totalsRow = `
        <tr style="text-align: center;">
            <td style="border: 1px solid #000;border-collapse: collapse;padding:6px;">TOTAL</td>
            <td style="border: 1px solid #000;border-collapse: collapse;padding:6px;"></td>
            <td style="border: 1px solid #000;border-collapse: collapse;padding:6px;">${totalPackages}</td>
            <td style="border: 1px solid #000;border-collapse: collapse;padding:6px;">${totalActualWeight.toFixed(
              2
            )}</td>
            <td style="border: 1px solid #000;border-collapse: collapse;padding:6px;">${totalVolumeWeight.toFixed(
              2
            )}</td>
        </tr>`;

    const reportHtml = `
        <main style="width: 100%; display: flex; justify-content: center; align-items: center; background-color: #f5f5f5; padding: 20px;">
           <div style="width: 210mm; height: auto; background-color: white; padding: 20px; box-shadow: 0 0 10px rgba(0,0,0,0.1);">
               <img src="${imageUrl}" alt="Company Logo" style="width: 100%; height: auto; margin-bottom: 20px;">
               <h1 style="text-align: center;">QUOTATION REQUEST TO AIRLINE</h1>
               <p>Please advise rate for below:</p>
               <table style="width:60%;border: 1px solid #000;border-collapse: collapse;">
              <tr>
                 <td style="border: 1px solid #000;border-collapse: collapse;padding:6px;">Origin</td>
                 <td style="border: 1px solid #000;border-collapse: collapse;padding:6px;">${getSafe(
                   ddlData[0],
                   "originAirport"
                 )}</td>
              </tr>
              <tr>
                 <td style="border: 1px solid #000;border-collapse: collapse;padding:6px;">DEST</td>
                 <td style="border: 1px solid #000;border-collapse: collapse;padding:6px;">${getSafe(
                   ddlData[0],
                   "DestinationAirport"
                 )}</td>
              </tr>
              <tr>
                 <td style="border: 1px solid #000;border-collapse: collapse;padding:6px;">NO OF PKGS</td>
                 <td style="border: 1px solid #000;border-collapse: collapse;padding:6px;">${getSafe(
                   ddlData[0],
                   "noOfPackages"
                 )}</td>
              </tr>
              <tr>
                 <td style="border: 1px solid #000;border-collapse: collapse;padding:6px;">GROSS WT</td>
                 <td style="border: 1px solid #000;border-collapse: collapse;padding:6px;">${getSafe(
                   ddlData[0],
                   "cargoWt"
                 )} ${getSafe(ddlData[0], "cargoWtUnitName")}</td>
              </tr>
              <tr>
                 <td style="border: 1px solid #000;border-collapse: collapse;padding:6px;">Total Volume WT</td>
                 <td style="border: 1px solid #000;border-collapse: collapse;padding:6px;">${getSafe(
                   ddlData[0],
                   "volumeWtName"
                 )} ${getSafe(ddlData[0], "volumeUnitName")}</td>
              </tr>
              <tr>
                 <td style="border: 1px solid #000;border-collapse: collapse;padding:6px;">Description</td>
                 <td style="border: 1px solid #000;border-collapse: collapse;padding:6px;">${getSafe(
                   ddlData[0],
                   "commodityName"
                 )}</td>
              </tr>
           </table>
               <table style="width: 100%; border: 1px solid #000; border-collapse: collapse; margin-bottom: 20px; padding-top: 25px;">
                  <tr style="text-align: center;">
                      <th style="border: 1px solid #000;border-collapse: collapse;padding:6px;">DIMS IN CMS</th>
                      <th style="border: 1px solid #000;border-collapse: collapse;padding:6px;"></th>
                      <th style="border: 1px solid #000;border-collapse: collapse;padding:6px;">NO OF PCS</th>
                      <th style="border: 1px solid #000;border-collapse: collapse;padding:6px;">ACTUAL WT ( KGS )</th>
                      <th style="border: 1px solid #000;border-collapse: collapse;padding:6px;">VOL WT ( KGS )</th>
                  </tr>
                  ${dynamicRows}
                  ${totalsRow}
               </table>
               <p>Thanks and Best Regards</p>
               <p>${getSafe(ddlData[0], "ownCompanyName")}</p>
           </div>
        </main>
        `;

    return reportHtml;
  };

  const sendEmail = async (content, to) => {
    const token = localStorage.getItem("token");
    try {
      const response = await fetch(`${baseUrl}/api/send/email`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-access-token": JSON.parse(token),
        },
        body: JSON.stringify({
          to: to || "rohitanabhavane26@gmail.com",
          subject: "Request For Quotation",
          body: content,
        }),
      });
      const data = await response.json();
      if (!response.ok)
        throw new Error(
          `Failed to send email: ${data.message || "Unknown error"}`
        );
      toast.success("Email sent successfully!");
    } catch (error) {
      toast.error(`Error sending email: ${error.message}`);
    }
  };

  const handleDeleteOfChargeGroup = (valueToDelete, workName) => {
    const newLogEntry = {
      venderName: valueToDelete,
      chargeGroupName: workName,
      timestamp: new Date().toISOString(),
    };
    setDeletionLogOfChargeGroup((prevLog) => [...prevLog, newLogEntry]);
    setSelectedVendors((prevVendors) => {
      const updatedVendors = prevVendors[workName].filter(
        (item) => item !== valueToDelete
      );
      return {
        ...prevVendors,
        [workName]: updatedVendors,
      };
    });
  };

  console.log("deletionLogOfChargeGroup =>", deletionLogOfChargeGroup);

  const handleDelete = (valueToDelete, workName) => {
    const newLogEntry = {
      venderName: valueToDelete,
      chargeName: workName,
      timestamp: new Date().toISOString(),
    };
    setDeletionLogSingleCharges((prevLog) => [...prevLog, newLogEntry]);
    setSelectedVendors((prevVendors) => {
      const updatedVendors = prevVendors[workName].filter(
        (item) => item !== valueToDelete
      );
      return {
        ...prevVendors,
        [workName]: updatedVendors,
      };
    });
  };

  console.log("deletionLogSingleCharges =>", deletionLogSingleCharges);

  return (
    <main>
      <div>
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
            <Box className="relative inset-0 bg-opacity-50 h-full w-full flex justify-center items-center px-4">
              <Box
                className={`${stylesModal.modalTextColor} ${stylesModal.accordianSummaryBg} ${stylesModal.thinScrollBar2} p-8 overflow-y-auto rounded-lg w-full h-4/5 rounded shadow-lg flex flex-col text-xs `}
              >
                {/* Radio Button Group at the Top with Go Button */}
                <Box display="flex" gap={2} mb={4} className="mt-4">
                  <FormControl
                    component="fieldset"
                    sx={{ fontSize: "10px !important" }}
                  >
                    <RadioGroup
                      aria-label="options"
                      name="options"
                      value={selectedOption}
                      sx={{ fontSize: "10px !important" }}
                      onChange={(event) =>
                        setSelectedOption(event.target.value)
                      }
                      row
                    >
                      <FormControlLabel
                        value="option1"
                        control={<Radio />}
                        sx={{ fontSize: "10px !important" }}
                        label="Group Charges"
                      />
                      <FormControlLabel
                        value="option2"
                        control={<Radio />}
                        sx={{ fontSize: "10px !important" }}
                        label="Charges"
                      />
                    </RadioGroup>
                  </FormControl>
                </Box>

                {/* Dynamic Content based on Selected Option */}
                {selectedOption === "option1" &&
                  newScopeOfWork.length > 0 &&
                  newScopeOfWork.map((work, index) => (
                    <Box
                      className="flex justify-between text-xs mb-4"
                      key={index}
                    >
                      <FormControlLabel
                        sx={{
                          fontSize: "10px !important",
                          m: 1,
                          width: "max(300px,20%)",
                        }}
                        control={<Checkbox defaultChecked />}
                        label={work.name}
                      />
                      <FormControl className="border border-solid border-[var(--inputBorderColor)] rounded-[4px] w-[100%] text-xs">
                        <InputLabel
                          id={`select-label-${index}`}
                          sx={{
                            color: "var(--inputTextColor)", // Default color
                            background: "var(--commonBg)",
                            fontSize: "11px !important",
                            margin: "4px 14px 5px 14px !important",
                            "&.Mui-focused": {
                              color: "var(--inputTextColor) !important", // Color on focus with !important
                              background: "var(--commonBg)",
                              fontSize: "11px !important",
                              margin: "4px 14px 5px 14px !important",
                            },
                          }}
                        >
                          Vendor
                        </InputLabel>
                        <Select
                          labelId={`select-label-${index}`}
                          id={`select-${index}`}
                          multiple
                          value={selectedVendors[work.name] || []}
                          sx={{
                            "& .MuiSvgIcon-root": {
                              color: "var(--inputTextColor)",
                              fontSize: "11px !important",
                            },
                            "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                              borderColor: "transparent !important",
                              fontSize: "11px !important", // Ensure border stays transparent on focus
                            },
                            "& .MuiSelect-select": {
                              color: "var(--inputTextColor)",
                              fontSize: "11px !important",
                            },
                          }}
                          onChange={(event) =>
                            handleVendorChangeGroupedCharges(work.name, event)
                          }
                          input={
                            <OutlinedInput
                              id={`select-multiple-${index}`}
                              label="Vendor"
                            />
                          }
                          renderValue={(selected) => (
                            <Box
                              sx={{
                                display: "flex",
                                flexWrap: "wrap",
                                gap: 0.5,
                              }}
                            >
                              {selected.map((value) => (
                                <Chip
                                  key={value}
                                  label={value}
                                  sx={{
                                    fontSize: "9px !important",
                                    background: "var(--inputTextColor)",
                                    color: "var(--commonBg)",
                                  }}
                                  onDelete={() =>
                                    handleDeleteOfChargeGroup(value, work.name)
                                  } // Ensure this is correctly capturing the value and work name
                                  deleteIcon={
                                    <CloseIcon
                                      sx={{
                                        color: "var(--commonBg) !important",
                                        height: "10px !important",
                                        width: "10px !important",
                                      }}
                                      onMouseDown={(event) =>
                                        event.stopPropagation()
                                      } // Stop further propagation
                                    />
                                  }
                                />
                              ))}
                            </Box>
                          )}
                          MenuProps={{
                            PaperProps: {
                              style: {
                                maxHeight: 48 * 4.5 + 8,
                                width: 250,
                              },
                            },
                          }}
                        >
                          {Object.values(vendorNames).map((name) => (
                            <MenuItem
                              key={name}
                              value={name}
                              sx={{ fontSize: "10px !important" }}
                            >
                              {name}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Box>
                  ))}
                {selectedOption === "option2" &&
                  charges.length > 0 &&
                  charges.map((charge, index) => (
                    <Box className="flex flex-col text-sm mb-4" key={index}>
                      <Box className="flex justify-between text-sm mt-2">
                        <FormControlLabel
                          className="text-sm"
                          sx={{
                            fontSize: "10px !important",
                            m: 1,
                            width: "max(300px,20%)",
                          }}
                          control={<Checkbox defaultChecked />}
                          label={charge}
                        />
                        <FormControl className="border border-solid border-[var(--inputBorderColor)] rounded-[4px] w-[100%]">
                          <InputLabel
                            id={`select-label-${index}`}
                            sx={{
                              color: "var(--inputTextColor)", // Default color
                              background: "var(--commonBg)",
                              fontSize: "11px !important",
                              margin: "4px 14px 5px 14px !important",
                              "&.Mui-focused": {
                                color: "var(--inputTextColor) !important", // Color on focus with !important
                                background: "var(--commonBg)",
                                fontSize: "11px !important",
                                margin: "4px 14px 5px 14px !important",
                              },
                            }}
                          >
                            Vendor
                          </InputLabel>
                          <Select
                            labelId={`select-label-${index}`}
                            id={`select-${index}`}
                            multiple
                            value={selectedVendors[charge] || []}
                            sx={{
                              "& .MuiSvgIcon-root": {
                                color: "var(--inputTextColor)",
                                fontSize: "10px !important",
                              },
                              "&.Mui-focused .MuiOutlinedInput-notchedOutline":
                                {
                                  borderColor: "transparent !important",
                                  fontSize: "10px !important", // Ensure border stays transparent on focus
                                },
                              "& .MuiSelect-select": {
                                color: "var(--inputTextColor)",
                                fontSize: "10px !important",
                              },
                            }}
                            onChange={(event) =>
                              handleVendorChange(charge, event)
                            }
                            input={
                              <OutlinedInput
                                id={`select-multiple-${index}`}
                                label="Vendor"
                                sx={{ fontSize: "10px !important" }}
                              />
                            }
                            renderValue={(selected) =>
                              selected.length === 0 ? (
                                <span>Select Vendor</span>
                              ) : (
                                <Box
                                  className="text-xs"
                                  sx={{
                                    display: "flex",
                                    flexWrap: "wrap",
                                    gap: 0.5,
                                  }}
                                >
                                  {selected.map((value) => (
                                    <Chip
                                      key={value}
                                      label={value}
                                      className="text-xs"
                                      sx={{
                                        fontSize: "9px !important",
                                        background: "var(--inputTextColor)",
                                        color: "var(--commonBg)",
                                      }}
                                      onDelete={() =>
                                        handleDelete(value, charge)
                                      }
                                      deleteIcon={
                                        <CloseIcon
                                          sx={{
                                            color: "var(--commonBg) !important",
                                            height: "10px !important",
                                            width: "10px !important",
                                          }}
                                          onMouseDown={(event) =>
                                            event.stopPropagation()
                                          } // Stop further propagation
                                        />
                                      }
                                    />
                                  ))}
                                </Box>
                              )
                            }
                            MenuProps={{
                              PaperProps: {
                                style: {
                                  maxHeight: 48 * 4.5 + 8,
                                  width: 250,
                                },
                              },
                            }}
                          >
                            {Object.values(vendorNames).map((name) => (
                              <MenuItem
                                key={name}
                                value={name}
                                sx={{ fontSize: "10px !important" }}
                              >
                                {name}
                              </MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                      </Box>
                    </Box>
                  ))}
                <Box className="flex gap-2 mt-4">
                  <button
                    onClick={handleClose}
                    className={`capitalize ${appStyles.commonBtn} w-fit`}
                  >
                    Close
                  </button>
                  <button
                    onClick={handleSave}
                    className={`capitalize ${appStyles.commonBtn} w-fit`}
                  >
                    Save
                  </button>
                </Box>
              </Box>
            </Box>
          </Fade>
        </Modal>
      </div>
    </main>
  );
}

QuotationModal.propTypes = {
  newState: PropTypes.array.isRequired,
  tblRateRequestCharge: PropTypes.array.isRequired,
  scopeOfWork: PropTypes.string.isRequired,
  setOpenModal: PropTypes.func.isRequired,
  openModal: PropTypes.bool.isRequired,
  isAdd: PropTypes.bool.isRequired,
  onSave: PropTypes.func.isRequired,
  onSaveGroup: PropTypes.func.isRequired,
};

export default QuotationModal;
