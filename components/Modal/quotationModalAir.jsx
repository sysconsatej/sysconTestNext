/* eslint-disable */
import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import PropTypes, { array, string } from "prop-types";
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
const baseUrlNext = process.env.NEXT_PUBLIC_BASE_URL_SQL_Reports;
//Akash 23_04_2025
function QuotationModalAir({
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
  const [agentName, setAgentName] = useState([]);
  const [rateBasis, setRateBasis] = useState([]);
  const [selectedOption, setSelectedOption] = useState("option1");
  const [transportModeData, setTransportModeData] = useState(null);
  const { clientId } = getUserDetails();
  const [client, setClientId] = useState(clientId);
  const [deletionLogOfChargeGroup, setDeletionLogOfChargeGroup] = useState([]);
  const [deletionLogSingleCharges, setDeletionLogSingleCharges] = useState([]);
  const [selectedAgentIds, setSelectedAgentIds] = useState({});

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

          if (transportMode === "Air") {
            const requestBodyToFetchAirlineAgent = {
              columns: "c.id,c.name",
              tableName:
                "tblCompany c Left join tblCompanySubtype cs on cs.companyId = c.id Left join tblMasterData md on md.id = cs.subTypeId",
              whereCondition: `md.name = 'AIRLINE AGENT' and cs.status = 1 and md.status = 1 and c.status = 1`,
              clientIdCondition: `c.clientId in (${client},(select id from tblClient where clientCode = 'SYSCON')) and cs.clientId in (${client},(select id from tblClient where clientCode = 'SYSCON')) FOR JSON PATH`,
            };
            const AirlineAgentName = await fetchReportData(
              requestBodyToFetchAirlineAgent
            );
            const agentName = AirlineAgentName?.data || [];
            if (agentName.length > 0) {
              console.log("agentName", agentName);
              setAgentName(agentName);
            } else setAgentName([]);

            const requestBodyForRateBasis = {
              columns: "M.id,M.name",
              tableName: "tblMasterData M",
              whereCondition:
                "M.status=1 and M.masterListId in (select l.id from tblMasterList l  where l.name = 'tblPerUnit')",
              clientIdCondition: `M.clientId in (${client},(select id from tblClient where clientCode = 'SYSCON')) FOR JSON PATH, INCLUDE_NULL_VALUES`,
            };
            const rateBasisName = await fetchReportData(
              requestBodyForRateBasis
            );
            const rateBasis = rateBasisName?.data || [];
            if (rateBasis.length > 0) {
              setRateBasis(rateBasis);
            } else setRateBasis([]);
          }
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

  const handleVendorChangeGroupedCharges = (workName, event) => {
    const {
      target: { value },
    } = event;

    setSelectedVendors((prev) => ({
      ...prev,
      [workName]: typeof value === "string" ? value.split(",") : value,
    }));
  };

  const handleDeleteOfChargeGroup = (valueToDelete, workName) => {
    setSelectedVendors((prev) => ({
      ...prev,
      [workName]: prev[workName].filter((val) => val !== valueToDelete),
    }));
  };

  const handleVendorChange = (chargeKey, event) => {
    const {
      target: { value },
    } = event;

    setSelectedVendors((prev) => ({
      ...prev,
      [chargeKey]: typeof value === "string" ? value.split(",") : value,
    }));
  };

  const handleDelete = (vendorName, chargeKey) => {
    setSelectedVendors((prev) => ({
      ...prev,
      [chargeKey]: prev[chargeKey].filter((name) => name !== vendorName),
    }));
  };

  const getVendorIdByName = (vendorNames, name) =>
    Object.keys(vendorNames).find((key) => vendorNames[key] === name);

  // 2️⃣ Build one entry for a given (agent, vendor, group, charge)
  const createEntry = (
    agentId,
    vendorId,
    group,
    charge,
    agentName,
    vendorNames
  ) => {
    const resolvedVendorId =
      getVendorIdByName(vendorNames, vendorId) || vendorId;
    return {
      chargeGroupId: String(group?.id),
      chargeGroupIddropdown: [{ value: group?.id, label: group?.name }],
      chargeId: String(charge?.id),
      chargeIddropdown: [{ value: charge?.id, label: charge?.name }],
      vendorAgentId: agentId ? String(agentId) : null,
      vendorAgentIddropdown: agentId
        ? [
            {
              value: agentId,
              label: agentName.find((a) => a.id === agentId)?.name,
            },
          ]
        : [],
      vendorId: resolvedVendorId ? String(resolvedVendorId) : null,
      vendorIddropdown: resolvedVendorId
        ? [{ value: resolvedVendorId, label: vendorNames[resolvedVendorId] }]
        : [],
      currencyId:
        charge?.currencyId != null ? String(charge?.currencyId) : null,
      currencyIddropdown: charge?.currencyId
        ? [{ value: charge?.currencyId, label: charge?.currencyId }]
        : [],
      rateBasisId:
        charge.rateBasisId != null ? String(charge?.rateBasisId) : null,
      rateBasisIddropdown: charge?.rateBasisId
        ? (() => {
            const match = rateBasis.find((rb) => rb.id === charge?.rateBasisId);
            return match ? [{ value: match.id, label: match.name }] : [];
          })()
        : [],
      buyMargin: charge?.buyMargin,
      sellMargin: charge?.sellMargin,
      chargeDescription: charge?.name,
      quotationFlag: true,
      // indexValue assigned downstream
    };
  };

  // 3a️⃣ Option 1: Remove placeholders + insert group‑charge combos
  const applyGroupUpdates = (
    group,
    agentIds,
    vendorIds,
    agentName,
    vendorNames,
    existingCharges,
    baseIndex
  ) => {
    // remove placeholder rows for this group
    const filtered = existingCharges.filter((row) => {
      const rowGroupId =
        row.chargeGroupIddropdown?.[0]?.value ?? row.chargeGroupId;
      const sameGroup = String(rowGroupId) === String(group.id);
      const isPlaceholder = !row.vendorId && !row.vendorAgentId;
      return !(sameGroup && isPlaceholder);
    });

    // build + stamp new
    let nextIndex = baseIndex;
    const additions = [];
    for (const charge of group.charges) {
      const combos = [];
      if (agentIds.length && vendorIds.length) {
        for (const a of agentIds)
          for (const v of vendorIds)
            combos.push(
              createEntry(a, v, group, charge, agentName, vendorNames)
            );
      } else if (agentIds.length) {
        for (const a of agentIds)
          combos.push(
            createEntry(a, null, group, charge, agentName, vendorNames)
          );
      } else if (vendorIds.length) {
        for (const v of vendorIds)
          combos.push(
            createEntry(null, v, group, charge, agentName, vendorNames)
          );
      }
      for (const entry of combos) {
        entry.indexValue = nextIndex++;
        additions.push(entry);
      }
    }

    return filtered.concat(additions);
  };

  function getChargeLabel(row) {
    // first try the array form, then the fallback property
    return row.chargeIddropdown?.[0]?.label ?? row.chargeIdDropdown;
  }
  // 3b️⃣ Option 2: Single‑charge updates with in‑place merge when only one combo

  // 3️⃣ Remove placeholders & insert single‑charge combos
  const applySingleChargeUpdates = (
    chargeName, // e.g. "FRE - AIR FREIGHT"
    agentIds,
    vendorIds,
    agentName,
    vendorNames,
    existingCharges,
    baseIndex
  ) => {
    console.group(`applySingleChargeUpdates("${chargeName}")`);
    console.log(" before:", existingCharges);

    // ➊ grab all rows for this charge
    // const rowsForCharge = existingCharges.filter(
    //   (r) => r.chargeIddropdown?.[0]?.label === chargeName
    // );
    const rowsForCharge = existingCharges.filter(
      (r) => getChargeLabel(r) === chargeName
    );
    if (!rowsForCharge.length) {
      console.warn("  no rows at all for", chargeName);
      console.groupEnd();
      return existingCharges;
    }

    // ➋ find one blank placeholder (both IDs empty)
    // const placeholderIndex = existingCharges.findIndex((r) => {
    //   return (
    //     r.chargeIddropdown?.[0]?.label === chargeName &&
    //     !r.vendorId &&
    //     !r.vendorAgentId
    //   );
    // });
    const placeholderIndex = existingCharges.findIndex((r) => {
      return (
        getChargeLabel(r) === chargeName && !r.vendorId && !r.vendorAgentId
      );
    });

    // ➌ pull that placeholder (if any) for metadata
    const placeholder =
      placeholderIndex >= 0
        ? existingCharges[placeholderIndex]
        : rowsForCharge[0];

    console.log(" placeholder row:", placeholder);

    // const metaCharge = {
    //   id: Number(placeholder?.chargeId),
    //   name: placeholder.chargeIddropdown[0]?.label,
    //   currencyId: Number(placeholder?.currencyId) || null,
    //   rateBasisId: Number(placeholder?.rateBasisId) || null,
    //   buyMargin: placeholder?.buyMargin,
    //   sellMargin: placeholder?.sellMargin,
    // };
    // const groupInfo = {
    //   id: placeholder?.chargeGroupIddropdown[0]?.value,
    //   name: placeholder?.chargeGroupIddropdown[0]?.label,
    // };

    const metaCharge = {
      id: Number(placeholder?.chargeId),
      name:
        placeholder.chargeIddropdown?.[0]?.label ??
        placeholder.chargeIdDropdown,
      currencyId: Number(placeholder?.currencyId) || null,
      rateBasisId: Number(placeholder?.rateBasisId) || null,
      buyMargin: placeholder?.buyMargin,
      sellMargin: placeholder?.sellMargin,
    };

    const groupInfo = {
      id:
        placeholder.chargeGroupIddropdown?.[0]?.value ??
        placeholder.chargeGroupId,
      name:
        placeholder.chargeGroupIddropdown?.[0]?.label ??
        placeholder.chargeGroupIdDropdown,
    };

    // ➍ build all requested combos
    const combos = [];
    if (agentIds.length && vendorIds.length) {
      for (const a of agentIds)
        for (const v of vendorIds)
          combos.push(
            createEntry(a, v, groupInfo, metaCharge, agentName, vendorNames)
          );
    } else if (agentIds.length) {
      for (const a of agentIds)
        combos.push(
          createEntry(a, null, groupInfo, metaCharge, agentName, vendorNames)
        );
    } else if (vendorIds.length) {
      for (const v of vendorIds)
        combos.push(
          createEntry(null, v, groupInfo, metaCharge, agentName, vendorNames)
        );
    }
    console.log(" combos:", combos);

    // ➎ if it’s exactly one cross‑product, merge back
    if (
      combos.length === 1 &&
      agentIds.length > 0 &&
      vendorIds.length > 0 &&
      placeholderIndex >= 0
    ) {
      const c = combos[0];
      const merged = {
        ...placeholder,
        vendorAgentId: c?.vendorAgentId,
        vendorAgentIddropdown: c?.vendorAgentIddropdown,
        vendorId: c?.vendorId,
        vendorIddropdown: c?.vendorIddropdown,
        currencyId: c?.currencyId,
        currencyIddropdown: c?.currencyIddropdown,
        rateBasisId: c?.rateBasisId,
        rateBasisIddropdown: c?.rateBasisIddropdown,
        buyMargin: c?.buyMargin,
        sellMargin: c?.sellMargin,
      };
      const out = [...existingCharges];
      out[placeholderIndex] = merged;
      console.groupEnd();
      return out;
    }
    const filtered =
      placeholderIndex >= 0
        ? existingCharges.filter((_, i) => i !== placeholderIndex)
        : [...existingCharges];

    let nextIdx = baseIndex;
    const stamped = combos.map((e) => ({ ...e, indexValue: nextIdx++ }));
    const result = filtered.concat(stamped);
    console.groupEnd();
    return result;
  };

  // 4️⃣ Final handleSave merging unchanged + updated rows
  const handleSave = async () => {
    const storedUserData = localStorage.getItem("userData");
    if (storedUserData) {
      const decryptedData = decrypt(storedUserData);
      const userData = JSON.parse(decryptedData);
      const clientId = userData[0].clientId;
      const headerLogoPath = userData[0].headerLogoPath;
      const companyName = userData[0].companyName;
      let updated = [...(newState.tblRateRequestCharge || [])];
      let baseIndex = updated.length;
      let finalDataForEmail = [];
      let emailRecords = {};
       let updatedNewData = [];
      if (selectedOption === "option1") {
        const groupNames = Array.from(
          new Set([
            ...Object.keys(selectedVendors || {}),
            ...Object.keys(selectedAgentIds || {}),
          ])
        );
        for (const name of groupNames) {
          const group = newScopeOfWork.find((g) => g.name === name);
          if (!group) continue;

       const getIndex =  newState.tblRateRequestCharge.findIndex((g) => g?.chargeGroupIddropdown?.[0]?.label || g?.chargeGroupIdDropdown === name);
          updated = applyGroupUpdates(
            group,
            selectedAgentIds[name] || [],
            selectedVendors[name] || [],
            agentName,
            vendorNames,
            updated,
            baseIndex
          );
          baseIndex = updated.length;
        }
        console.log("✅ Final Updated (Groups):", updated);
        finalDataForEmail = {
          ...newState,
          tblRateRequestCharge: updated,
        };
        onSaveGroup({ ...newState, tblRateRequestCharge: updated });
      }
      if (selectedOption === "option2") {
        setDeletionLogSingleCharges([]);

        // only process charges you've changed
        const chargeNames = Array.from(
          new Set([
            ...Object.keys(selectedAgentIds || {}),
            ...Object.keys(selectedVendors || {}),
          ])
        );

        console.log(" processing:", chargeNames);
        for (const name of chargeNames) {
          updated = applySingleChargeUpdates(
            name,
            selectedAgentIds[name] || [],
            selectedVendors[name] || [],
            agentName,
            vendorNames,
            updated,
            baseIndex
          );
          baseIndex = updated.length;
        }

        console.log("✅ Final Updated (Singles):", updated);
        onSave({ ...newState, tblRateRequestCharge: updated });
        finalDataForEmail = {
          ...newState,
          tblRateRequestCharge: updated,
        };
        console.groupEnd();
      }
      if (
        finalDataForEmail &&
        finalDataForEmail?.tblRateRequestCharge != null &&
        finalDataForEmail?.tblRateRequestCharge.length > 0
      ) {
        const charges = finalDataForEmail?.tblRateRequestCharge;
        const chargeArray = charges
          ? Array.isArray(charges)
            ? charges
            : [charges]
          : [];
        const uniqueIds = [
          ...new Set(
            chargeArray
              .map((item) => item.vendorAgentId ?? item.vendorId)
              .filter((id) => id != null)
          ),
        ];
        handleClose();
        if (headerLogoPath != null) {
          emailRecords.headerLogoPath = baseUrlNext + headerLogoPath;
        }
        if (companyName != null) {
          emailRecords.companyName = companyName;
        }
        if (finalDataForEmail?.noOfPackages != null) {
          emailRecords.noOfPackages = finalDataForEmail.noOfPackages;
        }
        if (finalDataForEmail?.cargoWt != null) {
          emailRecords.cargoWt = finalDataForEmail.cargoWt;
        }
        if (finalDataForEmail?.volumeWt != null) {
          emailRecords.volumeWt = finalDataForEmail.volumeWt;
        }
        if (finalDataForEmail?.commodity != null) {
          emailRecords.commodity = finalDataForEmail.commodity;
        }
        if (finalDataForEmail?.originCountryId != null) {
          const RequestBody = {
            columns: "name",
            tableName: "tblCountry",
            whereCondition: `id = ${finalDataForEmail?.originCountryId}`,
            clientIdCondition: `status = 1 FOR JSON PATH, INCLUDE_NULL_VALUES`,
          };
          const data = await fetchReportData(RequestBody);
          if (data && data.data && data.data.length > 0) {
            const originCountryName = data.data[0].name;
            emailRecords.originCountryName = originCountryName;
          }
        }
        if (finalDataForEmail?.destinationCountryId != null) {
          const RequestBody = {
            columns: "name",
            tableName: "tblCountry",
            whereCondition: `id = ${finalDataForEmail?.destinationCountryId}`,
            clientIdCondition: `status = 1 FOR JSON PATH, INCLUDE_NULL_VALUES`,
          };
          const data = await fetchReportData(RequestBody);
          if (data && data.data && data.data.length > 0) {
            const destinationCountryName = data.data[0].name;
            emailRecords.destinationCountryName = destinationCountryName;
          }
        }
        if (finalDataForEmail?.cargoWtUnitId != null) {
          const RequestBody = {
            columns: "name",
            tableName: "tblMasterData",
            whereCondition: `id = ${finalDataForEmail?.cargoWtUnitId}`,
            clientIdCondition: `status = 1 FOR JSON PATH, INCLUDE_NULL_VALUES`,
          };
          const data = await fetchReportData(RequestBody);
          if (data && data.data && data.data.length > 0) {
            const cargoWtUnitName = data.data[0].name;
            emailRecords.cargoWtUnitName = cargoWtUnitName;
          }
        }
        if (finalDataForEmail?.volumeUnitId != null) {
          const RequestBody = {
            columns: "name",
            tableName: "tblMasterData",
            whereCondition: `id = ${finalDataForEmail?.volumeUnitId}`,
            clientIdCondition: `status = 1 FOR JSON PATH, INCLUDE_NULL_VALUES`,
          };
          const data = await fetchReportData(RequestBody);
          if (data && data.data && data.data.length > 0) {
            const volumeUnitName = data.data[0].name;
            emailRecords.volumeUnitName = volumeUnitName;
          }
        }
        const emailIds = (
          await Promise.all(
            uniqueIds.map(async (id) => {
              const req = {
                columns: "emailId",
                tableName: "tblCompany",
                whereCondition: `id = ${id}`, // individual lookup
                clientIdCondition: `status = 1 FOR JSON PATH, INCLUDE_NULL_VALUES`,
              };
              const json = await fetchReportData(req);
              let parsed;
              try {
                parsed = JSON.parse(json);
              } catch {
                return "rohitanabhavane26@gmail.com";
              }
              const record = Array.isArray(parsed) ? parsed[0] : parsed;
              return record?.emailId ?? "rohitanabhavane26@gmail.com";
            })
          )
        ).filter((email) => email != null);
        const content = requestForQuotationReportAir(
          emailRecords,
          finalDataForEmail?.tblRateRequestQty
        );
        for (let to of emailIds) {
          await sendEmail(content, to);
        }
      }
    }
  };

  const requestForQuotationReportAir = (emailRecords, tblRateRequestQty) => {
    const dynamicRows = tblRateRequestQty
      .map((item, index) => {
        const dimensions = `${item?.length ?? ""} * ${item?.width ?? ""} * ${
          item?.height ?? ""
        }`;
        return `
              <tr style="text-align: center;">
                  <td style="border: 1px solid #000;border-collapse: collapse;padding:6px;">${
                    index + 1
                  }</td>
                  <td style="border: 1px solid #000;border-collapse: collapse;padding:6px;">${dimensions}</td>
                  <td style="border: 1px solid #000;border-collapse: collapse;padding:6px;">${
                    item?.noOfPackages ?? " "
                  }</td>
                  <td style="border: 1px solid #000;border-collapse: collapse;padding:6px;">${
                    item?.actualWt ?? " "
                  }</td>
                  <td style="border: 1px solid #000;border-collapse: collapse;padding:6px;">${
                    item?.volumeWt ?? " "
                  }</td>
              </tr>`;
      })
      .join("");

    // Generate totals row
    const totalPackages = tblRateRequestQty.reduce(
      (sum, item) => sum + (item.noOfPackages || 0),
      0
    );
    const totalActualWeight = tblRateRequestQty.reduce(
      (sum, item) => sum + (item.actualWt || 0),
      0
    );
    const totalVolumeWeight = tblRateRequestQty.reduce(
      (sum, item) => sum + (item.volumeWt || 0),
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
               <img src="${
                 emailRecords?.headerLogoPath
               }" alt="Company Logo" style="width: 100%; height: auto; margin-bottom: 20px;">
               <h1 style="text-align: center;">QUOTATION REQUEST TO AIRLINE</h1>
               <p>Please advise rate for below:</p>
               <table style="width:60%;border: 1px solid #000;border-collapse: collapse;">
              <tr>
                 <td style="border: 1px solid #000;border-collapse: collapse;padding:6px;">Origin</td>
                 <td style="border: 1px solid #000;border-collapse: collapse;padding:6px;">${
                   emailRecords?.originCountryName ?? ""
                 }</td>
              </tr>
              <tr>
                 <td style="border: 1px solid #000;border-collapse: collapse;padding:6px;">DEST</td>
                 <td style="border: 1px solid #000;border-collapse: collapse;padding:6px;">${
                   emailRecords?.destinationCountryName ?? ""
                 }</td>
              </tr>
              <tr>
                 <td style="border: 1px solid #000;border-collapse: collapse;padding:6px;">NO OF PKGS</td>
                 <td style="border: 1px solid #000;border-collapse: collapse;padding:6px;">${
                   emailRecords?.noOfPackages ?? ""
                 }</td>
              </tr>
              <tr>
                 <td style="border: 1px solid #000;border-collapse: collapse;padding:6px;">GROSS WT</td>
                 <td style="border: 1px solid #000;border-collapse: collapse;padding:6px;">${
                   emailRecords?.cargoWt ?? ""
                 } ${emailRecords?.cargoWtUnitName ?? ""}</td>
              </tr>
              <tr>
                 <td style="border: 1px solid #000;border-collapse: collapse;padding:6px;">Total Volume WT</td>
                 <td style="border: 1px solid #000;border-collapse: collapse;padding:6px;">${
                   emailRecords?.volumeWt ?? ""
                 } ${emailRecords?.volumeUnitName ?? ""}</td>
              </tr>
              <tr>
                 <td style="border: 1px solid #000;border-collapse: collapse;padding:6px;">Description</td>
                 <td style="border: 1px solid #000;border-collapse: collapse;padding:6px;">${
                   emailRecords?.commodity ?? ""
                 }</td>
              </tr>
           </table>
               <table style="width: 100%; border: 1px solid #000; border-collapse: collapse; margin-top: 10px; padding-top: 25px;">
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
               <p>${emailRecords?.companyName ?? ""}</p>
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
                        control={
                          <Checkbox
                            defaultChecked
                            sx={{
                              padding: "4px", // tighter padding
                              "& .MuiSvgIcon-root": {
                                fontSize: "20px", // smaller checkbox icon
                              },
                            }}
                          />
                        }
                        label={
                          <span style={{ fontSize: "15px", lineHeight: "1.2" }}>
                            {work.name}
                          </span>
                        }
                        sx={{
                          m: 1,
                          width: "max(300px, 20%)",
                        }}
                      />

                      <div className="w-full flex gap-4">
                        {transportModeData === "Air" && (
                          <FormControl className="border border-solid border-[var(--inputBorderColor)] rounded-[4px] text-xs flex-1">
                            <InputLabel
                              id="agent-multi-label"
                              sx={{
                                color: "var(--inputTextColor)",
                                background: "var(--commonBg)",
                                fontSize: "11px !important",
                                margin: "4px 14px 5px 14px !important",
                                "&.Mui-focused": {
                                  color: "var(--inputTextColor) !important",
                                  background: "var(--commonBg)",
                                  fontSize: "11px !important",
                                  margin: "4px 14px 5px 14px !important",
                                },
                              }}
                            >
                              Vendor Agent
                            </InputLabel>
                            <Select
                              labelId={`agent-multi-label-${index}`}
                              id={`agent-multi-${index}`}
                              multiple
                              value={selectedAgentIds[work.name] || []}
                              onChange={(event) =>
                                setSelectedAgentIds((prev) => ({
                                  ...prev,
                                  [work.name]: event.target.value,
                                }))
                              }
                              input={<OutlinedInput label="Vendor Agent" />}
                              renderValue={(selected) => (
                                <Box
                                  sx={{
                                    display: "flex",
                                    flexWrap: "wrap",
                                    gap: 0.5,
                                  }}
                                >
                                  {selected.map((id) => {
                                    const agent = agentName.find(
                                      (a) => a.id === id
                                    );
                                    return (
                                      <Chip
                                        key={id}
                                        label={agent?.name || id}
                                        sx={{
                                          fontSize: "9px !important",
                                          background: "var(--inputTextColor)",
                                          color: "var(--commonBg)",
                                        }}
                                        onDelete={() =>
                                          setSelectedAgentIds((prev) => ({
                                            ...prev,
                                            [work.name]: prev[work.name].filter(
                                              (i) => i !== id
                                            ),
                                          }))
                                        }
                                        deleteIcon={
                                          <CloseIcon
                                            sx={{
                                              color:
                                                "var(--commonBg) !important",
                                              height: "10px !important",
                                              width: "10px !important",
                                            }}
                                            onMouseDown={(event) =>
                                              event.stopPropagation()
                                            }
                                          />
                                        }
                                      />
                                    );
                                  })}
                                </Box>
                              )}
                              sx={{
                                "& .MuiSvgIcon-root": {
                                  color: "var(--inputTextColor)",
                                  fontSize: "11px !important",
                                },
                                "&.Mui-focused .MuiOutlinedInput-notchedOutline":
                                  {
                                    borderColor: "transparent !important",
                                  },
                                "& .MuiSelect-select": {
                                  color: "var(--inputTextColor)",
                                  fontSize: "11px !important",
                                },
                              }}
                              MenuProps={{
                                PaperProps: {
                                  style: {
                                    maxHeight: 48 * 4.5 + 8,
                                    width: 250,
                                  },
                                },
                              }}
                            >
                              {agentName.map((agent) => (
                                <MenuItem
                                  key={agent.id}
                                  value={agent.id}
                                  sx={{ fontSize: "10px !important" }}
                                >
                                  {agent.name}
                                </MenuItem>
                              ))}
                            </Select>
                          </FormControl>
                        )}

                        <FormControl className="border border-solid border-[var(--inputBorderColor)] rounded-[4px] text-xs  flex-1">
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
                              "&.Mui-focused .MuiOutlinedInput-notchedOutline":
                                {
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
                                      handleDeleteOfChargeGroup(
                                        value,
                                        work.name
                                      )
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
                      </div>
                    </Box>
                  ))}
                {selectedOption === "option2" &&
                  charges.length > 0 &&
                  charges.map((charge, index) => (
                    <Box className="flex flex-col text-sm mb-4" key={index}>
                      <Box className="flex justify-between text-sm mt-2">
                        <FormControlLabel
                          className="text-xs"
                          sx={{
                            m: 1,
                            width: "max(300px, 20%)",
                          }}
                          control={
                            <Checkbox
                              defaultChecked
                              sx={{
                                padding: "4px",
                                "& .MuiSvgIcon-root": {
                                  fontSize: "20px",
                                },
                              }}
                            />
                          }
                          label={
                            <span
                              style={{ fontSize: "12px", lineHeight: "1.2" }}
                            >
                              {charge}
                            </span>
                          }
                        />

                        <div className="w-full flex flex-col sm:flex-row gap-4">
                          {transportModeData === "Air" && (
                            <FormControl className="border border-solid border-[var(--inputBorderColor)] rounded-[4px] text-xs w-full sm:w-1/2">
                              <InputLabel
                                id={`agent-label-${index}`}
                                sx={{
                                  color: "var(--inputTextColor)",
                                  background: "var(--commonBg)",
                                  fontSize: "11px !important",
                                  margin: "4px 14px 5px 14px !important",
                                  "&.Mui-focused": {
                                    color: "var(--inputTextColor) !important",
                                    background: "var(--commonBg)",
                                    fontSize: "11px !important",
                                    margin: "4px 14px 5px 14px !important",
                                  },
                                }}
                              >
                                Vendor Agent
                              </InputLabel>

                              <Select
                                labelId={`agent-label-${index}`}
                                id={`agent-select-${index}`}
                                multiple
                                value={selectedAgentIds[charge] || []}
                                onChange={(event) =>
                                  setSelectedAgentIds((prev) => ({
                                    ...prev,
                                    [charge]: event.target.value,
                                  }))
                                }
                                input={<OutlinedInput label="Vendor Agent" />}
                                renderValue={(selected) => (
                                  <Box
                                    sx={{
                                      display: "flex",
                                      flexWrap: "wrap",
                                      gap: 0.5,
                                    }}
                                  >
                                    {selected.map((id) => {
                                      const agent = agentName.find(
                                        (a) => a.id === id
                                      );
                                      return (
                                        <Chip
                                          key={id}
                                          label={agent?.name || id}
                                          sx={{
                                            fontSize: "9px !important",
                                            background: "var(--inputTextColor)",
                                            color: "var(--commonBg)",
                                          }}
                                          onDelete={() =>
                                            setSelectedAgentIds((prev) => ({
                                              ...prev,
                                              [charge]: prev[charge].filter(
                                                (i) => i !== id
                                              ),
                                            }))
                                          }
                                          deleteIcon={
                                            <CloseIcon
                                              sx={{
                                                color:
                                                  "var(--commonBg) !important",
                                                height: "10px !important",
                                                width: "10px !important",
                                              }}
                                              onMouseDown={(event) =>
                                                event.stopPropagation()
                                              }
                                            />
                                          }
                                        />
                                      );
                                    })}
                                  </Box>
                                )}
                                sx={{
                                  "& .MuiSvgIcon-root": {
                                    color: "var(--inputTextColor)",
                                    fontSize: "11px !important",
                                  },
                                  "&.Mui-focused .MuiOutlinedInput-notchedOutline":
                                    {
                                      borderColor: "transparent !important",
                                      fontSize: "11px !important",
                                    },
                                  "& .MuiSelect-select": {
                                    color: "var(--inputTextColor)",
                                    fontSize: "11px !important",
                                  },
                                }}
                                MenuProps={{
                                  PaperProps: {
                                    style: {
                                      maxHeight: 48 * 4.5 + 8,
                                      width: 250,
                                    },
                                  },
                                }}
                              >
                                {agentName.map((agent) => (
                                  <MenuItem
                                    key={agent.id}
                                    value={agent.id}
                                    sx={{ fontSize: "10px !important" }}
                                  >
                                    {agent.name}
                                  </MenuItem>
                                ))}
                              </Select>
                            </FormControl>
                          )}

                          <FormControl className="border border-solid border-[var(--inputBorderColor)] rounded-[4px] text-xs w-full sm:w-1/2">
                            <InputLabel
                              id={`vendor-label-${index}`}
                              sx={{
                                color: "var(--inputTextColor)",
                                background: "var(--commonBg)",
                                fontSize: "11px !important",
                                margin: "4px 14px 5px 14px !important",
                                "&.Mui-focused": {
                                  color: "var(--inputTextColor) !important",
                                  background: "var(--commonBg)",
                                  fontSize: "11px !important",
                                  margin: "4px 14px 5px 14px !important",
                                },
                              }}
                            >
                              Vendor
                            </InputLabel>

                            <Select
                              labelId={`vendor-label-${index}`}
                              id={`vendor-select-${index}`}
                              multiple
                              value={selectedVendors[charge] || []}
                              onChange={(event) =>
                                handleVendorChange(charge, event)
                              }
                              input={<OutlinedInput label="Vendor" />}
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
                                              color:
                                                "var(--commonBg) !important",
                                              height: "10px !important",
                                              width: "10px !important",
                                            }}
                                            onMouseDown={(event) =>
                                              event.stopPropagation()
                                            }
                                          />
                                        }
                                      />
                                    ))}
                                  </Box>
                                )
                              }
                              sx={{
                                "& .MuiSvgIcon-root": {
                                  color: "var(--inputTextColor)",
                                  fontSize: "10px !important",
                                },
                                "&.Mui-focused .MuiOutlinedInput-notchedOutline":
                                  {
                                    borderColor: "transparent !important",
                                    fontSize: "10px !important",
                                  },
                                "& .MuiSelect-select": {
                                  color: "var(--inputTextColor)",
                                  fontSize: "10px !important",
                                },
                              }}
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
                        </div>
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

QuotationModalAir.propTypes = {
  newState: PropTypes.array.isRequired,
  tblRateRequestCharge: PropTypes.array.isRequired,
  scopeOfWork: PropTypes.string.isRequired,
  setOpenModal: PropTypes.func.isRequired,
  openModal: PropTypes.bool.isRequired,
  isAdd: PropTypes.bool.isRequired,
  onSave: PropTypes.func.isRequired,
  onSaveGroup: PropTypes.func.isRequired,
};

export default QuotationModalAir;
