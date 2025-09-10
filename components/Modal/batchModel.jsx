/* eslint-disable */
import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import PropTypes from "prop-types";
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
import CancelIcon from "@mui/icons-material/Cancel";
import { useTheme } from "@emotion/react";
import stylesModal from "@/components/common.module.css";
import { decrypt } from "@/helper/security";
import { fetchDataAPI } from "@/services/auth/FormControl.services";

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;

function getStyles(name, selectedNames, theme) {
  return {
    fontWeight:
      selectedNames.indexOf(name) === -1
        ? theme.typography.fontWeightRegular
        : theme.typography.fontWeightMedium,
  };
}

function BatchModel({ setOpenModal, openModal }) {
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
  const [newScopeOfWork, setNewScopeOfWork] = useState([]);
  const [selectedOption, setSelectedOption] = useState("option1");

  // console.log("newScopeOfWork", newScopeOfWork);
  // console.log("scopeOfWorkData", scopeOfWorkData);

  useEffect(() => {
    const fetchData = async () => {
      const storedUserData = localStorage.getItem("userData");
      const decryptedData = decrypt(storedUserData);
      const userData = JSON.parse(decryptedData);
      const clientCodeData = userData[0].clientCode;

      const ids = scopeOfWorkData.split(",");
      const finalData = [];

      try {
        // Fetch main data for each ID
        for (let id of ids) {
          const mainQuery = {
            tableName: "tblMasterData",
            whereCondition: {
              status: 1,
              clientCode: clientCodeData,
              _id: id,
            },
            subchildCondition: {},
            projection: {
              name: 1,
            },
          };

          const mainResponse = await fetchDataAPI(mainQuery);

          if (mainResponse.success && mainResponse.data.length > 0) {
            // Assuming only one item per ID, extract the main data
            const mainItem = mainResponse.data[0];

            // Now, fetch the charges for this item
            const chargesQuery = {
              tableName: "tblCharge", // Adjust this to your actual charges table
              whereCondition: {
                status: 1,
                clientCode: clientCodeData,
                "tblChargeGroups.chargeGroup": id,
              },
              subchildCondition: {},
              projection: {
                _id: 1,
                name: 1,
              },
            };

            const chargesResponse = await fetchDataAPI(chargesQuery);

            // Add the charges to the main item
            mainItem.charges = chargesResponse.success
              ? chargesResponse.data
              : [];

            // Push the completed item into the final array
            finalData.push(mainItem);
            console.log("finalData", finalData);
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
    const fetchVendorNames = async () => {
      const storedUserData = localStorage.getItem("userData");
      if (storedUserData !== null) {
        const decryptedData = decrypt(storedUserData);
        const userData = JSON.parse(decryptedData);
        const clientCode = userData[0].clientCode;
        const token = JSON.parse(localStorage.getItem("token"));
        let vendorId = null;

        try {
          const requestBody = {
            tableName: "tblMasterData",
            whereCondition: { clientCode: clientCode, name: "VENDOR" },
            projection: { _id: 1 },
          };
          const response = await fetchDataAPI(requestBody);
          vendorId = response.data[0]._id;
        } catch (error) {
          console.error("Error fetching vendor names:", error);
        }

        try {
          const headers = {
            "Content-Type": "application/json",
            "x-access-token": token,
          };
          const response = await fetch(
            `${baseUrl}/api/validations/formControlValidation/fetchProjectedData`,
            {
              method: "POST",
              headers,
              body: JSON.stringify({
                tableName: "tblCompany",
                whereCondition: {
                  clientCode: clientCode,
                  status: 1,
                  "tblCompanySubtype.subTypeId": vendorId,
                },
                subchildCondition: {},
                projection: { name: 1 },
              }),
            }
          );
          const { data } = await response.json();
          setVendorNames(
            data.reduce((acc, vendor) => {
              acc[vendor._id] = vendor.name;
              return acc;
            }, {})
          );
        } catch (error) {
          console.error("Error fetching vendor names:", error);
        }
      }
    };

    fetchVendorNames();
  }, []);

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

  // const handleGoClick = (chargeGroupName) => {
  //     if (selectedOption === 'option1') {
  //         handleVendorChangeGroupedCharges(chargeGroupName);
  //     } else if (selectedOption === 'option2') {
  //         handleVendorChange(chargeGroupName);
  //     }
  // };

  const handleVendorChangeGroupedCharges = (chargeGroupName, event) => {
    const { value } = event.target;

    console.log(
      "Received Charge Group Name: AKASH",
      newState.tblRateRequestCharge
    );

    // Debug: Log the charge group name received
    console.log("Received Charge Group Name:", chargeGroupName);

    // Find the charge group in newScopeOfWork

    const chargeGroup = newScopeOfWork.find(
      (group) => group.name === chargeGroupName
    );

    //const chargeGroup = chargeGroupName

    // Debug: Check if the charge group was found
    if (!chargeGroup) {
      console.error("Charge group not found for name:", chargeGroupName);
      return;
    }

    // Debug: Log the found charge group
    console.log("Found Charge Group:", chargeGroup);

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

      // Debug: Log the charges array before processing
      console.log("Charges in Charge Group:", chargeGroup.charges);

      // Process each charge within the charge group
      const updatedObjects = isAddFormType
        ? chargeGroup.charges.reduce((acc, charge) => {
            console.log("Processing charge for Add:", charge.name);
            const newObjects = updateOriginalObjectsForAddGroupedCharges(
              charge.name,
              updatedVendors,
              prevSelectedVendors,
              chargeGroupName
            );
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
            console.log("Processing charge for Edit:", charge.name);
            const newObjects = updateOriginalObjectsForEditGroupedCharges(
              charge.name,
              updatedVendors,
              prevSelectedVendors,
              chargeGroupName
            );
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

      // Debug: Log the updated objects after processing
      console.log("Updated Objects after handleVendorChange:", updatedObjects);

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

  const updateOriginalObjectsForAddGroupedCharges = (
    chargeName,
    updatedVendors
  ) => {
    console.log("updatedVendors:", updatedVendors);
    console.log("chargeName:", chargeName);
    let updatedObjects = [...originalObjects];

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
          } = uniqueCombination;
          if (!sizeId || !typeId || !qty) {
            console.error(
              "SizeId, TypeId, or qty is missing in uniqueCombination:",
              uniqueCombination
            );
            return; // Skip this combination if sizeId, typeId, or qty is missing
          }

          const selectedVendorsForCharge =
            updatedVendors[targetGroup.name] || [];

          if (selectedVendorsForCharge.length > 0) {
            // Step 1: Update existing rows where vendorId and vendorIdDropdown are null or empty
            let firstVendorUpdated = false;
            updatedObjects = updatedObjects.filter((obj) => {
              if (
                obj.chargeId === charge._id &&
                obj.sizeId === sizeId &&
                obj.typeId === typeId &&
                (!obj.vendorId || obj.vendorId === "") &&
                (!obj.vendorIdDropdown || obj.vendorIdDropdown === "")
              ) {
                if (!firstVendorUpdated) {
                  const vendor = selectedVendorsForCharge[0];
                  const vendorId = Object.keys(vendorNames).find(
                    (key) => vendorNames[key] === vendor
                  );

                  firstVendorUpdated = true;
                  obj.vendorId = vendorId;
                  obj.vendorIdDropdown = vendorNames[vendorId]; // Ensure this is a string
                  obj.vendorIddropdown = [
                    {
                      _id: vendorId,
                      label: vendorNames[vendorId],
                      oldId: vendorId,
                      value: vendorId,
                    },
                  ]; // Ensure this is an array of objects
                  obj.qty = qty; // Update with the qty
                  obj.chargeGroupId = chargeGroupId; // Include chargeGroupId
                  obj.chargeGroupIdDropdown = chargeGroupIdDropdown; // Include chargeGroupIdDropdown
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
                    obj.chargeId === charge._id &&
                    obj.sizeId === sizeId &&
                    obj.typeId === typeId &&
                    obj.vendorId === vendorId
                );

                if (existingIndex === -1) {
                  // If no row exists for this vendor, create a new one
                  const newObject = {
                    chargeIdDropdown: charge.name,
                    chargeId: charge._id || null,
                    vendorId,
                    vendorIdDropdown: vendorNames[vendorId], // Ensure this is a string
                    vendorIddropdown: [
                      {
                        _id: vendorId,
                        label: vendorNames[vendorId],
                        oldId: vendorId,
                        value: vendorId,
                      },
                    ], // Ensure this is an array of objects
                    sizeId,
                    sizeIddropdown,
                    typeId,
                    typeIddropdown: [
                      {
                        _id: typeId,
                        label: typeIddropdown,
                        oldId: typeId,
                        value: typeId,
                      },
                    ],
                    isChecked: true,
                    qty: qty, // Include qty in the new object
                    chargeGroupId: chargeGroupId,
                    chargeGroupIddropdown: chargeGroupIdDropdown, // Include chargeGroupId // Include chargeGroupIdDropdown
                    sellAmount: 0,
                  };
                  console.log("newObject first =>", newObject);
                  updatedObjects.push(newObject);
                  console.log("updatedObjects first =>", updatedObjects);
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
    console.log(
      "Data received in getUniqueCombinationsForAddGroupedCharges:",
      JSON.stringify(data, null, 2)
    );
    console.log("Charge Name:", chargeName);

    return data.reduce((acc, item) => {
      console.log("Processing item:", JSON.stringify(item, null, 2));

      // if (item.chargeIdDropdown === chargeName) {
      if (item.chargeDescription === chargeName) {
        console.log("Item matches chargeName:", chargeName);

        const exists = acc.some(
          (combination) =>
            combination.sizeId === item.sizeId &&
            combination.typeId === item.typeId &&
            combination.qty === item.qty
        );

        if (!exists) {
          console.log("Unique combination found:", {
            chargeId: item.chargeId,
            chargeDescription: item.chargeDescription,
            sizeId: item.sizeId,
            sizeIddropdown: item.sizeIddropdown,
            typeId: item.typeId,
            typeIddropdown: item.typeIddropdown,
            qty: item.qty || 1,
            chargeGroupId: item.chargeGroupId,
            chargeGroupIdDropdown: item.chargeGroupIddropdown || [],
            chargeIddropdown: item.chargeIddropdown,
          });

          acc.push({
            chargeId: item.chargeId,
            chargeDescription: item.chargeDescription,
            sizeId: item.sizeId,
            sizeIddropdown: item.sizeIddropdown,
            typeId: item.typeId,
            typeIddropdown: item.typeIdDropdown,
            qty: item.qty || 1, // Ensure qty is included with a default value if missing
            chargeGroupId: item.chargeGroupId,
            chargeGroupIdDropdown: item.chargeGroupIddropdown || [],
            chargeIddropdown: item.chargeIddropdown,
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
    console.log("updatedVendors", updatedVendors);
    console.log("chargeName", chargeName);
    let updatedObjects = [...originalObjects];

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
          } = uniqueCombination;

          if (!sizeId || !typeId || !qty) {
            console.error(
              "SizeId, TypeId, or qty is missing in uniqueCombination:",
              uniqueCombination
            );
            return; // Skip this combination if sizeId, typeId, or qty is missing
          }

          const selectedVendorsForCharge =
            updatedVendors[targetGroup.name] || [];

          if (selectedVendorsForCharge.length > 0) {
            // Step 1: Update existing rows where vendorId and vendorIdDropdown are null or empty
            let firstVendorUpdated = false;
            updatedObjects = updatedObjects.filter((obj) => {
              if (
                obj.chargeId === charge._id &&
                obj.sizeId === sizeId &&
                obj.typeId === typeId &&
                (!obj.vendorId || obj.vendorId === "") &&
                (!obj.vendorIdDropdown || obj.vendorIdDropdown === "")
              ) {
                if (!firstVendorUpdated) {
                  const vendor = selectedVendorsForCharge[0];
                  const vendorId = Object.keys(vendorNames).find(
                    (key) => vendorNames[key] === vendor
                  );

                  firstVendorUpdated = true;
                  obj.vendorId = vendorId;
                  obj.vendorIdDropdown = vendorNames[vendorId];
                  obj.qty = qty; // Update with the qty
                  obj.chargeGroupId = chargeGroupId; // Include chargeGroupId
                  obj.chargeGroupIdDropdown = chargeGroupIdDropdown; // Include chargeGroupIdDropdown
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
                    obj.chargeId === charge._id &&
                    obj.sizeId === sizeId &&
                    obj.typeId === typeId &&
                    obj.vendorId === vendorId
                );

                if (existingIndex === -1) {
                  // If no row exists for this vendor, create a new one
                  const newObject = {
                    chargeIdDropdown: charge.name,
                    chargeId: charge._id || null,
                    vendorId,
                    vendorIdDropdown: vendorNames[vendorId],
                    sizeId,
                    sizeIdDropdown,
                    typeId,
                    typeIdDropdown,
                    isChecked: true,
                    qty: qty, // Include qty in the new object
                    chargeGroupId: chargeGroupId, // Include chargeGroupId
                    chargeGroupIdDropdown: chargeGroupIdDropdown, // Include chargeGroupIdDropdown
                    sellAmount: 0,
                    indexValue: updatedObjects.length,
                    chargeDescription: charge.description || null,
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
            sizeId: item.sizeId,
            sizeIdDropdown: item.sizeIdDropdown,
            typeId: item.typeId,
            typeIdDropdown: item.typeIdDropdown,
            qty: item.qty || 1, // Ensure qty is included with a default value
            chargeGroupId: item.chargeGroupId, // Include chargeGroupId
            chargeGroupIdDropdown: item.chargeGroupIdDropdown, // Include chargeGroupIdDropdown
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

      const updatedObjects = isAddFormType
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

      console.log("updatedObjects after handleVendorChange", updatedObjects);

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
        indexValue,
        qty,
        isChecked,
        chargesFlag, // Assuming this is the flag for automatically created charges
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
              obj.chargeDescription === charge &&
              (!obj.vendorId || obj.vendorId.trim() === "") &&
              obj.sizeId === sizeId &&
              obj.typeId === typeId &&
              obj.chargeGroupId === chargeGroupId
            )
        );

        // Check if this vendor, size, type, and charge group combination already exists
        const existingIndex = updatedObjects.findIndex(
          (obj) =>
            obj.chargeDescription === charge &&
            obj.vendorId === vendorId &&
            obj.sizeId === sizeId &&
            obj.typeId === typeId &&
            obj.chargeGroupId === chargeGroupId
        );

        if (existingIndex === -1) {
          // Create a new object for the new vendor selection
          const newObject = {
            chargeDescription,
            chargeId: chargeId || null,
            chargeIddropdown: [
              {
                _id: chargeId,
                label: chargeIddropdown,
                oldId: chargeId,
                value: chargeId,
              },
            ],
            sizeId: sizeId || null,
            sizeIddropdown: sizeIddropdown,
            typeId: typeId || null,
            typeIddropdown: [
              {
                _id: typeId,
                label: typeIddropdown,
                oldId: typeId,
                value: typeId,
              },
            ],
            vendorId: vendorId,
            vendorIddropdown: [
              {
                _id: vendorId,
                label: vendorNames[vendorId],
                oldId: vendorId,
                value: vendorId,
              },
            ],
            chargeGroupId: chargeGroupId || null,
            chargeGroupIddropdown:
              chargeGroupIddropdown.length > 0
                ? chargeGroupIddropdown
                : [
                    {
                      _id: chargeGroupId,
                      value: chargeGroupId,
                      oldId: chargeGroupId ? chargeGroupId.toString() : null,
                      label:
                        chargeGroupIddropdown.length > 0
                          ? chargeGroupIddropdown[0].label
                          : "Unknown Group",
                    },
                  ],
            indexValue: indexValue || 0,
            isChecked: isChecked !== undefined ? isChecked : true,
            qty,
            chargesFlag: chargesFlag || null, // Include the flag if it exists
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
        } else if (existingIndex !== -1) {
          // Update existing object with the new vendor and charge group information
          updatedObjects[existingIndex] = {
            ...updatedObjects[existingIndex],
            vendorId: vendorId,
            vendorIddropdown: [
              {
                _id: vendorId,
                label: vendorNames[vendorId],
                oldId: vendorId,
                value: vendorId,
              },
            ],
            chargeGroupId:
              chargeGroupId || updatedObjects[existingIndex].chargeGroupId,
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

    // updatedObjects = updatedObjects.filter(obj =>
    //     obj.chargeDescription !== charge ||
    //     (obj.vendorId !== null && obj.vendorIdDropdown && obj.vendorIdDropdown !== "Unknown Vendor")
    // );
    // updatedObjects = updatedObjects.filter(obj =>
    //     obj.chargeDescription !== charge ||
    //     (obj.vendorId !== null && obj.vendorIdDropdown && obj.vendorIdDropdown !== "Unknown Vendor")
    // );

    updatedObjects = updatedObjects.filter((obj) => {
      // Check if the current object matches the specific charge (by chargeDescription or chargeIddropdown[0]?.label)
      const isChargeMatch =
        obj.chargeDescription === charge ||
        (obj.chargeIddropdown && obj.chargeIddropdown[0]?.label === charge);

      // Check if vendorIdDropdown is undefined and vendorId is not null
      const vendorCondition = !(
        obj.vendorId !== null && obj.vendorIdDropdown === undefined
      );

      // Ensure that newly created rows (with a valid vendorIdDropdown) are not removed
      const isNewRowValid =
        obj.vendorId !== null &&
        obj.vendorIdDropdown &&
        obj.vendorIdDropdown !== "Unknown Vendor";

      // The object is kept only if it does not match the charge or the vendorCondition is true or it's a valid new row
      return !isChargeMatch || vendorCondition || isNewRowValid;
    });

    console.log(
      "Final updatedObjects:",
      JSON.stringify(updatedObjects, null, 2)
    );
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
            chargeId: item.chargeId,
            chargeDescription: item.chargeDescription,
            sizeId: item.sizeId,
            sizeIddropdown: item.sizeIddropdown,
            typeId: item.typeId,
            typeIddropdown:
              item.typeIdDropdown || item.typeIddropdown[0]?.label,
            chargeGroupId: item.chargeGroupId || null,
            chargeGroupIddropdown: item.chargeGroupIddropdown || [],
            vendorId: item.vendorId,
            chargeIddropdown:
              item.chargeIdDropdown || item.chargeIddropdown[0]?.label,
            vendorIddropdown: item.vendorIddropdown,
            isChecked: item.isChecked,
            qty: item.qty,
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
            chargeId: item.chargeId,
            chargeDescription: item.chargeDescription,
            sizeId: item.sizeId,
            sizeIddropdown: item.sizeIddropdown,
            typeId: item.typeId,
            typeIddropdown:
              item.typeIdDropdown || item.typeIddropdown[0]?.label,
            chargeGroupId: item.chargeGroupId || null,
            chargeGroupIddropdown: item.chargeGroupIddropdown || [],
            vendorId: item.vendorId,
            chargeIddropdown:
              item.chargeIdDropdown || item.chargeIddropdown[0]?.label,
            vendorIddropdown: item.vendorIddropdown,
            isChecked: item.isChecked,
            qty: item.qty,
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

    uniqueCombinations.forEach((combination) => {
      const {
        sizeId,
        sizeIdDropdown,
        typeId,
        typeIdDropdown,
        qty,
        chargeGroupId,
        chargeGroupIdDropdown,
      } = combination;

      updatedVendors[charge].forEach((vendor, vendorIndex) => {
        const vendorId = Object.keys(vendorNames).find(
          (key) => vendorNames[key] === vendor
        );

        console.log("Processing vendor:", vendor, "vendorId:", vendorId);

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

          console.log("Removed objects with unknown or null vendor");
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
          console.log("Creating new object for vendorId:", vendorId);
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
            chargeGroupIdDropdown:
              chargeGroupIdDropdown || combination.chargeGroupIdDropdown,
            chargeId: combination.chargeId || null,
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
          // Update existing object with the new vendor information
          console.log("Updating existing object with vendorId:", vendorId);
          updatedObjects[existingIndex] = {
            ...updatedObjects[existingIndex],
            vendorId: vendorId,
            vendorIdDropdown: vendorNames[vendorId],
            chargeGroupId: chargeGroupId || combination.chargeGroupId,
            chargeGroupIdDropdown:
              chargeGroupIdDropdown || combination.chargeGroupIdDropdown,
          };
        }
      });
    });

    // Remove rows with null or "Unknown Vendor" in vendorIddropdown for the given charge
    // updatedObjects = updatedObjects.filter(obj =>
    //     obj.chargeDescription !== charge ||
    //     (obj.vendorId !== null && obj.vendorIdDropdown && obj.vendorIdDropdown !== "Unknown Vendor")
    // );
    updatedObjects = updatedObjects.filter(
      (obj) =>
        obj.chargeIdDropdown !== charge ||
        (obj.vendorId !== null &&
          obj.vendorIdDropdown &&
          obj.vendorIdDropdown !== "Unknown Vendor")
    );

    // updatedObjects = updatedObjects.filter(obj => {
    //     // Check if the current object matches the specific charge (by chargeDescription or chargeIddropdown[0]?.label)
    //     const isChargeMatch =
    //         obj.chargeDescription === charge ||
    //         (obj.chargeIddropdown && obj.chargeIddropdown[0]?.label === charge);

    //     // Check if vendorIdDropdown is undefined and vendorId is not null
    //     const vendorCondition = !(obj.vendorId !== null && obj.vendorIdDropdown === undefined);

    //     // Ensure that newly created rows (with a valid vendorIdDropdown) are not removed
    //     const isNewRowValid = obj.vendorId !== null && obj.vendorIdDropdown && obj.vendorIdDropdown !== "Unknown Vendor";

    //     // The object is kept only if it does not match the charge or the vendorCondition is true or it's a valid new row
    //     return !isChargeMatch || vendorCondition || isNewRowValid;
    // });

    console.log(
      "Final updatedObjects:",
      JSON.stringify(updatedObjects, null, 2)
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
          console.log("item =>>", item);
          acc.push({
            sizeId: item.sizeId,
            sizeIdDropdown:
              item.sizeIdDropdown || item.sizeIddropdown[0].label || null,
            typeId: item.typeId,
            typeIdDropdown:
              item.typeIdDropdown || item.typeIddropdown[0].label || null,
            qty: item.qty || 1, // Include qty
            chargeGroupId: item.chargeGroupId || null, // Include chargeGroupId
            //chargeGroupIdDropdown: item.chargeGroupIdDropdown || item.chargeGroupIddropdown[0].label || null,
            chargeGroupIdDropdown:
              item.chargeGroupIdDropdown ||
              (item.chargeGroupIddropdown &&
              item.chargeGroupIddropdown.length > 0
                ? item.chargeGroupIddropdown[0].label
                : null),
            chargeId: item.chargeId || null, // Include chargeId
          });
        }
      }
      return acc;
    }, []);
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

  const handleSave = async () => {
    const storedUserData = localStorage.getItem("userData");
    if (storedUserData !== null) {
      const decryptedData = decrypt(storedUserData);
      const userData = JSON.parse(decryptedData);
      const clientCode = userData[0].clientCode;
      const branchId = userData[0].defaultBranchId;
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
        console.log("response My ", response);
        if (
          response &&
          response.data.length > 0 &&
          response.data[0].tblCompanyBranchParameterDetails.length > 0
        ) {
          imgUrl = response.data[0].tblCompanyBranchParameterDetails[0].header;
        }
      }

      console.log("lastFinalState: ADD", lastFinalState.tblRateRequestCharge);
      if (isAddFormType) {
        onSave(lastFinalState);
        console.log("lastFinalState: ADD", lastFinalState);
        handleClose();

        let fetchedData = {};

        if (lastFinalState.cargoTypeId != null) {
          const cargoTypeRequest = {
            tableName: "tblMasterData",
            whereCondition: {
              _id: lastFinalState.cargoTypeId,
              clientCode: clientCode,
            },
            projection: { name: 1 },
          };
          const cargoTypeData = await fetchDataApi(cargoTypeRequest);
          if (
            cargoTypeData &&
            cargoTypeData.data &&
            cargoTypeData.data.length > 0
          ) {
            fetchedData.cargoTypeName = cargoTypeData.data[0].name;
          }
        }
        if (lastFinalState.fpdId != null) {
          const shipmentTypeRequest = {
            tableName: "tblPort",
            whereCondition: {
              _id: lastFinalState.fpdId,
              clientCode: clientCode,
            },
            projection: { name: 1 },
          };
          const shipmentTypeData = await fetchDataApi(shipmentTypeRequest);
          if (
            shipmentTypeData &&
            shipmentTypeData.data &&
            shipmentTypeData.data.length > 0
          ) {
            fetchedData.fpdName = shipmentTypeData.data[0].name;
          }
        }
        if (lastFinalState.polId != null) {
          const RequestBody = {
            tableName: "tblPort",
            whereCondition: {
              _id: lastFinalState.polId,
              clientCode: clientCode,
            },
            projection: { name: 1 },
          };
          const data = await fetchDataApi(RequestBody);
          if (data && data.data && data.data.length > 0) {
            fetchedData.polName = data.data[0].name;
          }
        }
        if (lastFinalState.podId != null) {
          const RequestBody = {
            tableName: "tblPort",
            whereCondition: {
              _id: lastFinalState.podId,
              clientCode: clientCode,
            },
            projection: { name: 1 },
          };
          const data = await fetchDataApi(RequestBody);
          if (data && data.data && data.data.length > 0) {
            fetchedData.podName = data.data[0].name;
          }
        }
        if (lastFinalState.plrId != null) {
          const RequestBody = {
            tableName: "tblPort",
            whereCondition: {
              _id: lastFinalState.plrId,
              clientCode: clientCode,
            },
            projection: { name: 1 },
          };
          const data = await fetchDataApi(RequestBody);
          if (data && data.data && data.data.length > 0) {
            fetchedData.plrName = data.data[0].name;
          }
        }
        if (lastFinalState.natureOfCargoId != null) {
          const RequestBody = {
            tableName: "tblMasterData",
            whereCondition: {
              _id: lastFinalState.natureOfCargoId,
              clientCode: clientCode,
            },
            projection: { name: 1 },
          };
          const data = await fetchDataApi(RequestBody);
          if (data && data.data && data.data.length > 0) {
            fetchedData.natureOfCargoName = data.data[0].name;
          }
        }
        if (lastFinalState.companyId != null) {
          const RequestBody = {
            tableName: "tblCompany",
            whereCondition: {
              _id: lastFinalState.companyId,
              clientCode: clientCode,
            },
            projection: { name: 1, emailId: 1 },
          };
          const data = await fetchDataApi(RequestBody);
          if (data && data.data && data.data.length > 0) {
            fetchedData.companyName = data.data[0].name;
            fetchedData.companyEmailId = data.data[0].emailId;
          }
        }

        const uniqueVendorIds = [
          ...new Set(
            lastFinalState.tblRateRequestCharge.map((item) => item.vendorId)
          ),
        ].filter((vendorId) => vendorId);
        for (const vendorId of uniqueVendorIds) {
          const filteredCharges = lastFinalState.tblRateRequestCharge.filter(
            (item) => item.vendorId === vendorId
          );

          const emailIdRequest = {
            tableName: "tblCompany",
            whereCondition: { _id: vendorId, clientCode: clientCode },
            projection: { emailId: 1 },
          };
          const emailIdData = await fetchDataApi(emailIdRequest);
          let emailId = "rohitanabhavane26@gmail.com";
          if (emailIdData && emailIdData.data && emailIdData.data.length > 0) {
            emailId = emailIdData.data[0].emailId + ", " + emailId;
          }

          const reportContent = QuotationReportsAdd(
            lastFinalState,
            filteredCharges,
            [fetchedData],
            imgUrl
          );
          await sendEmail(reportContent, emailId);
        }
      } else {
        onSave(lastFinalState);
        handleClose();
        let fetchedData = [];
        if (lastFinalState.cargoTypeId != null) {
          const cargoTypeRequest = {
            tableName: "tblMasterData",
            whereCondition: {
              _id: lastFinalState.cargoTypeId,
              clientCode: clientCode,
            },
            projection: { name: 1 },
          };
          const cargoTypeData = await fetchDataApi(cargoTypeRequest);
          if (
            cargoTypeData &&
            cargoTypeData.data &&
            cargoTypeData.data.length > 0
          ) {
            fetchedData.cargoTypeName = cargoTypeData.data[0].name;
          }
        }
        if (lastFinalState.fpdId != null) {
          const shipmentTypeRequest = {
            tableName: "tblPort",
            whereCondition: {
              _id: lastFinalState.fpdId,
              clientCode: clientCode,
            },
            projection: { name: 1 },
          };
          const shipmentTypeData = await fetchDataApi(shipmentTypeRequest);
          if (
            shipmentTypeData &&
            shipmentTypeData.data &&
            shipmentTypeData.data.length > 0
          ) {
            fetchedData.fpdName = shipmentTypeData.data[0].name;
          }
        }
        if (lastFinalState.polId != null) {
          const RequestBody = {
            tableName: "tblPort",
            whereCondition: {
              _id: lastFinalState.polId,
              clientCode: clientCode,
            },
            projection: { name: 1 },
          };
          const data = await fetchDataApi(RequestBody);
          if (data && data.data && data.data.length > 0) {
            fetchedData.polName = data.data[0].name;
          }
        }
        if (lastFinalState.podId != null) {
          const RequestBody = {
            tableName: "tblPort",
            whereCondition: {
              _id: lastFinalState.podId,
              clientCode: clientCode,
            },
            projection: { name: 1 },
          };
          const data = await fetchDataApi(RequestBody);
          if (data && data.data && data.data.length > 0) {
            fetchedData.podName = data.data[0].name;
          }
        }
        if (lastFinalState.plrId != null) {
          const RequestBody = {
            tableName: "tblPort",
            whereCondition: {
              _id: lastFinalState.plrId,
              clientCode: clientCode,
            },
            projection: { name: 1 },
          };
          const data = await fetchDataApi(RequestBody);
          if (data && data.data && data.data.length > 0) {
            fetchedData.plrName = data.data[0].name;
          }
        }
        if (lastFinalState.natureOfCargoId != null) {
          const RequestBody = {
            tableName: "tblMasterData",
            whereCondition: {
              _id: lastFinalState.natureOfCargoId,
              clientCode: clientCode,
            },
            projection: { name: 1 },
          };
          const data = await fetchDataApi(RequestBody);
          if (data && data.data && data.data.length > 0) {
            fetchedData.natureOfCargoName = data.data[0].name;
          }
        }
        if (lastFinalState.companyId != null) {
          const RequestBody = {
            tableName: "tblCompany",
            whereCondition: {
              _id: lastFinalState.companyId,
              clientCode: clientCode,
            },
            projection: { name: 1, emailId: 1 },
          };
          const data = await fetchDataApi(RequestBody);
          if (data && data.data && data.data.length > 0) {
            fetchedData.companyName = data.data[0].name;
            fetchedData.companyEmailId = data.data[0].emailId;
          }
        }
        const uniqueVendorIds = [
          ...new Set(
            lastFinalState.tblRateRequestCharge.map((item) => item.vendorId)
          ),
        ].filter((vendorId) => vendorId);
        for (const vendorId of uniqueVendorIds) {
          const filteredCharges = lastFinalState.tblRateRequestCharge.filter(
            (item) => item.vendorId === vendorId
          );

          const emailIdRequest = {
            tableName: "tblCompany",
            whereCondition: { _id: vendorId, clientCode: clientCode },
            projection: { emailId: 1 },
          };
          const emailIdData = await fetchDataApi(emailIdRequest);
          //let emailId = 'rohitanabhavane26@gmail.com , nilay@sysconinfotech.com';
          let emailId = "rohitanabhavane26@gmail.com "; // default email addresses
          if (emailIdData && emailIdData.data && emailIdData.data.length > 0) {
            emailId = emailIdData.data[0].emailId + ", " + emailId;
          }

          const reportContent = QuotationReportsEdit(
            lastFinalState,
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
                )} at ${getSafe(
      ddlData[0],
      "companyEmailId"
    )} or [Your Contact Phone Number].</h4>
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

    // Log formatted dates to check if getSafe is working correctly
    const formattedDate = formatDate(getSafe(data, "rateRequestDate"));
    const SailDate = formatDate(getSafe(data, "expectedSailDate"));

    // Step 1: Extract unique vendor names
    const uniqueVendorNames = [
      ...new Set(
        tblRateRequestCharge.map((item) => {
          const label = getSafe(item.vendorIddropdown[0], "label");
          console.log("Vendor Label Extracted:", label);
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
          console.log(
            "Comparing Vendor:",
            vendor,
            "with Vendor Label:",
            vendorLabel
          );
          return vendorLabel === vendor;
        });

        // Check if filteredCharges is empty, indicating a potential issue
        if (filteredCharges.length === 0) {
          console.warn(`No charges found for vendor: ${vendor}`);
        } else {
          console.log(`Charges found for vendor: ${vendor}`, filteredCharges);
        }

        // Extract the required fields from filtered charges
        const chargeDescriptions = filteredCharges
          .map((item) => {
            const description = getSafe(item.chargeGroupIddropdown[0], "label");
            console.log("Charge Description:", description);
            return description ? description : "N/A"; // Handle empty descriptions
          })
          .join("<br/>");

        const sizeTypes = filteredCharges
          .map((item) => {
            const size = item.sizeIdDropdown;
            const type = item.typeIdDropdown;
            console.log("Size:", size, "Type:", type);
            return size && type ? `${size}/${type}` : "N/A"; // Handle empty size/type
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

    // Output the final result
    console.log("Final HTML Table Rows:", chargeDescriptionRows);

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
                )} at ${getSafe(
      ddlData[0],
      "companyEmailId"
    )} or [Your Contact Phone Number].</h4>
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
          to: to,
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
            <Box className="relative inset-0 bg-opacity-50 overflow-y-auto h-full w-full flex justify-center items-center px-4">
              <Box
                className={`${stylesModal.modalTextColor} ${stylesModal.accordianSummaryBg} p-[30px] rounded-lg shadow-xl w-fit min-w-[500px] flex flex-col justify-between mx-auto text-xs`}
              >
                {/* Radio Button Group at the Top with Go Button */}
                <Box
                  display="flex"
                  alignItems="center"
                  justifyContent="space-between"
                  className="mb-4"
                >
                  <FormControl component="fieldset">
                    <RadioGroup
                      aria-label="options"
                      name="options"
                      value={selectedOption}
                      onChange={(event) =>
                        setSelectedOption(event.target.value)
                      } // Update state with selected option
                      row // Arrange the radio buttons in a row
                    >
                      <FormControlLabel
                        value="option1"
                        control={<Radio />}
                        label="Group Charges"
                      />
                      <FormControlLabel
                        value="option2"
                        control={<Radio />}
                        label="Charges"
                      />
                    </RadioGroup>
                  </FormControl>
                </Box>

                {/* Dynamic Content based on Selected Option */}
                {selectedOption === "option1" &&
                  newScopeOfWork.length > 0 &&
                  newScopeOfWork.map((work, index) => (
                    <Box className="flex justify-between text-xs" key={index}>
                      <FormControlLabel
                        sx={{ m: 1, width: "max(300px,100%)" }}
                        control={<Checkbox defaultChecked={true} />}
                        label={work.name} // This prints the parent-level name
                      />
                      <FormControl sx={{ m: 1, width: "max(350px,100%)" }}>
                        {" "}
                        {/* Increased width here */}
                        <InputLabel
                          id={`select-label-${index}`}
                          sx={{ fontSize: "0.75rem" }} // Reduced font size here
                        >
                          Vender
                        </InputLabel>
                        <Select
                          labelId={`select-label-${index}`}
                          id={`select-${index}`}
                          multiple
                          value={selectedVendors[work.name] || []} // Replace charge with work.name
                          onChange={(event) =>
                            handleVendorChangeGroupedCharges(work.name, event)
                          } // Replace charge with work.name
                          input={
                            <OutlinedInput
                              id={`select-multiple-${index}`}
                              label="Vendor"
                              sx={{ fontSize: "0.75rem" }} // Reduced font size here
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
                                  deleteIcon={
                                    <CancelIcon
                                      onMouseDown={(event) =>
                                        event.stopPropagation()
                                      }
                                    />
                                  }
                                  sx={{ fontSize: "0.75rem" }} // Reduced font size here
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
                              style={getStyles(
                                name,
                                selectedVendors[work.name] || [], // Replace charge with work.name
                                theme
                              )}
                              sx={{ fontSize: "0.75rem" }} // Reduced font size here
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
                    <Box className="flex flex-col text-xs mb-4" key={index}>
                      <Box className="flex justify-between text-xs mt-2">
                        <FormControlLabel
                          sx={{ m: 1, width: "max(300px,100%)" }}
                          control={<Checkbox defaultChecked={true} />}
                          label={charge}
                        />
                        <FormControl sx={{ m: 1, width: "max(350px,100%)" }}>
                          <InputLabel id="demo-multiple-chip-label">
                            Vendor
                          </InputLabel>
                          <Select
                            labelId={`select-label-${index}`}
                            id={`select-${index}`}
                            multiple
                            value={selectedVendors[charge] || []} // This ensures the dropdown is empty initially
                            onChange={(event) =>
                              handleVendorChange(charge, event)
                            }
                            input={
                              <OutlinedInput
                                id={`select-multiple-${index}`}
                                label="Vendor"
                                sx={{ fontSize: "0.75rem" }}
                              />
                            }
                            renderValue={(selected) =>
                              selected.length === 0 ? (
                                <span>Select Vendor</span> // Placeholder text when no vendor is selected
                              ) : (
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
                                      deleteIcon={
                                        <CancelIcon
                                          onMouseDown={(event) =>
                                            event.stopPropagation()
                                          }
                                        />
                                      }
                                      sx={{ fontSize: "0.75rem" }}
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
                                style={getStyles(
                                  name,
                                  selectedVendors[charge] || [],
                                  theme
                                )}
                                sx={{ fontSize: "0.75rem" }}
                              >
                                {name}
                              </MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                      </Box>
                    </Box>
                  ))}
                <Box className="flex justify-between">
                  <button
                    onClick={handleClose}
                    className={`py-[6px] px-[30px] rounded-[10px] text-xs shadow-xl bg-blue-500 text-white hover:bg-blue-600 `}
                  >
                    Close
                  </button>
                  <button
                    onClick={handleSave}
                    className={`py-[6px] px-[30px] rounded-[10px] text-xs shadow-xl bg-blue-500 text-white hover:bg-blue-600`}
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

BatchModel.propTypes = {
  newState: PropTypes.array.isRequired,
  tblRateRequestCharge: PropTypes.array.isRequired,
  scopeOfWork: PropTypes.string.isRequired,
  setOpenModal: PropTypes.func.isRequired,
  openModal: PropTypes.bool.isRequired,
  isAdd: PropTypes.bool.isRequired,
  onSave: PropTypes.func.isRequired,
};

export default BatchModel;
