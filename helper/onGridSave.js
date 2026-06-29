import { fetchReportData, fetchThirdLevelDetailsFromApi } from "@/services/auth/FormControl.services";
import { getUserDetails } from "./userDetails";

const setJobContainer = async (obj) => {
  const {
    args = "",
    values = {},
    fieldName,
    newState = {},
    setStateVariable,
  } = obj;

  try {
    const { clientId } = getUserDetails();
    const jobNumbers = newState?.tblJob?.map((item) => `'${item?.masterJobIddropdown?.[0]?.label}'`).join(",");

    const RequestBody = {
      columns: `jc.*,
                row_number() over(order by jc.id) - 1 indexValue,
                (select jc.sizeId as value, ms.name as label for json path) as sizeIddropdown,
                (select jc.containerStatusId as value, mc.name as label for json path) as containerStatusIddropdown,
                (select jc.typeId as value, mt.name as label for json path) as typeIddropdown,
                (select jc.tareWtUnitId as value, mtw.name as label for json path) as tareWtUnitIddropdown,
                (select jc.WtUnitId as value, mw.name as label for json path) as WtUnitIddropdown,
                (select jc.volumeUnitId as value, mv.name as label for json path) as volumeUnitIddropdown,
                (select jc.refTempUnitId as value, mr.name as label for json path) as refTempUnitIddropdown,
                (select jc.dimensionUnitId as value, md.name as label for json path) as dimensionUnitIddropdown,
                (select jc.transporterId as value, mtp.name as label for json path) as transporterIddropdown
                `,
      tableName: `tblJobContainer jc
         left join tblMasterData ms on ms.id = jc.sizeId and ms.status = 1
         left join tblMasterData mc on mc.id = jc.containerStatusId and mc.status = 1
         left join tblMasterData mt on mt.id = jc.typeId and mt.status = 1
         left join tblMasterData mtw on mtw.id = jc.tareWtUnitId and mtw.status = 1
         left join tblMasterData mw on mw.id = jc.WtUnitId and mw.status = 1
         left join tblMasterData mv on mv.id = jc.volumeUnitId and mv.status = 1
         left join tblMasterData mr on mr.id = jc.refTempUnitId and mr.status = 1
         left join tblMasterData md on md.id = jc.dimensionUnitId and md.status = 1
         left join tblMasterData mtp on mtp.id = jc.transporterId and mtp.status = 1
        join tblJob j on j.id = jc.jobId and j.status = 1
        `,
      whereCondition: `j.jobNo in (${jobNumbers}) and jc.status = 1`,
      clientIdCondition: `j.clientId IN (${clientId}, (SELECT id FROM tblClient WHERE clientCode = 'SYSCON')) FOR JSON PATH`,
    };


    const { data } = await fetchReportData(RequestBody);

    const updatedValues = {
      ...newState,
      tblJobContainer: data,
    };

    return {
      type: "success",
      result: true,
      message: "Job Container fetched successfully.",
      values: values,
      newState: updatedValues,
    };
  } catch (error) {
    console.error("Error in setJobContainer:", error);

    return {
      type: "error",
      result: false,
      message: "Error while updating setJobContainer.",
    };
  }
};

const copyContainerData = (obj) => {
  const { args = "", newState = {}, values = {} } = obj;

  try {
    const rows = Array.isArray(newState?.tblContainerMovement)
      ? [...newState.tblContainerMovement]
      : [];

    if (rows.length === 0) {
      return {
        type: "info",
        result: false,
        message: "No rows to update",
        newState,
      };
    }

    const fieldsToCopy = args
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

    const srcIndex = Number(values?.indexValue ?? 0);
    const srcRow = rows[srcIndex] ?? rows[0] ?? {};

    const getSourceVal = (field) =>
      Object.prototype.hasOwnProperty.call(values, field)
        ? values[field]
        : srcRow[field];

    const patch = {};
    for (const f of fieldsToCopy) {
      patch[f] = getSourceVal(f);
      const dd = `${f}dropdown`;
      if (Object.prototype.hasOwnProperty.call(values, dd)) {
        patch[dd] = values[dd];
      } else if (Object.prototype.hasOwnProperty.call(srcRow, dd)) {
        patch[dd] = srcRow[dd];
      }
    }

    const isFirstRow = srcIndex === 0; // <-- only first row may broadcast to others
    const hasSelection = rows.some((r) => r?.isChecked === true);

    const updatedRows = rows.map((r, i) => {
      if (!isFirstRow) {
        return i === srcIndex ? { ...r, ...patch } : r;
      }
      const shouldUpdate = hasSelection ? r?.isChecked === true : true;
      return shouldUpdate ? { ...r, ...patch } : r;
    });

    const updatedState = { ...newState, tblContainerMovement: updatedRows };

    return {
      type: "success",
      result: true,
      message: isFirstRow
        ? `Set ${fieldsToCopy.join(", ")} on ${hasSelection ? "selected" : "all"
        } rows.`
        : `Updated ${fieldsToCopy.join(", ")} on row ${srcIndex + 1} only.`,
      newState: updatedState,
      values: {},
      submitNewState: updatedState,
    };
  } catch (error) {
    console.error("Error in copyContainerData:", error);
    return {
      type: "error",
      result: false,
      message: "Error copying container data. Please try again.",
    };
  }
};

// const getThirdLevelDetails = async (obj) => {
//   const {
//     args,
//     newState,
//     formControlData,
//     setFormControlData,
//     values,
//     fieldName,
//     tableName,
//     setStateVariable,
//     onChangeHandler,
//   } = obj;

//   const { companyId, clientId, branchId } = getUserDetails();

//   const isEmpty = (v) =>
//     v === undefined ||
//     v === null ||
//     v === "" ||
//     (Array.isArray(v) && v.length === 0);

//   const getIdValue = (v) => {
//     if (Array.isArray(v)) {
//       return v?.[0]?.value ?? v?.[0]?.id ?? v?.[0]?.Id ?? 0;
//     }

//     if (typeof v === "object" && v !== null) {
//       return v?.value ?? v?.id ?? v?.Id ?? 0;
//     }

//     return isEmpty(v) ? 0 : v;
//   };

//   const zeroIfEmpty = (v) => {
//     const val = getIdValue(v);
//     return isEmpty(val) ? 0 : val;
//   };

//   const toNumberOrNull = (v) => {
//     if (v === null || v === undefined || v === "") return null;

//     const n = Number(v);
//     return Number.isFinite(n) ? n : null;
//   };

//   const toNumber = (v) => {
//     const n = Number(v);
//     return Number.isFinite(n) ? n : 0;
//   };

//   const formatDateForApi = (v) => {
//     if (v === undefined || v === null || v === "") return null;

//     if (typeof v === "string") return v;

//     if (typeof v?.format === "function") {
//       const formatted = v.format("YYYY-MM-DD HH:mm:ss");
//       return formatted === "Invalid date" ? null : formatted;
//     }

//     if (v instanceof Date && !isNaN(v.getTime())) {
//       const yyyy = v.getFullYear();
//       const mm = String(v.getMonth() + 1).padStart(2, "0");
//       const dd = String(v.getDate()).padStart(2, "0");
//       const hh = String(v.getHours()).padStart(2, "0");
//       const mi = String(v.getMinutes()).padStart(2, "0");
//       const ss = String(v.getSeconds()).padStart(2, "0");

//       return `${yyyy}-${mm}-${dd} ${hh}:${mi}:${ss}`;
//     }

//     return v;
//   };

//   try {
//     const chargeRows = Array.isArray(values?.tblInvoiceCharge)
//       ? values.tblInvoiceCharge
//       : Array.isArray(newState?.tblInvoiceCharge)
//         ? newState.tblInvoiceCharge
//         : [];

//     let currentChargeIndex = 0;

//     if (chargeRows.length > 0) {
//       const checkedIndex = chargeRows.findIndex(
//         (row) => row?.isChecked === true
//       );

//       if (checkedIndex > -1) {
//         currentChargeIndex = checkedIndex;
//       } else {
//         const indexValue =
//           newState?.indexValue ??
//           values?.indexValue ??
//           chargeRows?.[0]?.indexValue;

//         const matchedIndex = chargeRows.findIndex(
//           (row, index) =>
//             Number(row?.indexValue) === Number(indexValue) ||
//             Number(index) === Number(indexValue)
//         );

//         currentChargeIndex = matchedIndex > -1 ? matchedIndex : 0;
//       }
//     }

//     const currentChargeRow =
//       chargeRows.length > 0 ? chargeRows[currentChargeIndex] || {} : values || {};

//     const getLatestValue = (key) => {
//       if (!isEmpty(newState?.[key])) return newState[key];
//       if (!isEmpty(currentChargeRow?.[key])) return currentChargeRow[key];
//       if (!isEmpty(values?.[key])) return values[key];
//       return null;
//     };
//     const exchangeRate =
//       toNumber(getLatestValue("exchangeRate")) > 0
//         ? toNumber(getLatestValue("exchangeRate"))
//         : 1;
//     const requestData = {
//       billingPartyId: zeroIfEmpty(getLatestValue("billingPartyId")),
//       clientId: clientId,
//       jobId: zeroIfEmpty(getLatestValue("jobId")),
//       chargeId: zeroIfEmpty(getLatestValue("chargeId")),
//       companyId: companyId,
//       companyBranchId: branchId,

//       fromDate: formatDateForApi(getLatestValue("fromDate")),
//       toDate: formatDateForApi(getLatestValue("toDate")),

//       businessSegmentId: zeroIfEmpty(getLatestValue("businessSegmentId")),
//       voucherTypeId: zeroIfEmpty(getLatestValue("voucherTypeId")),

//       blId: zeroIfEmpty(getLatestValue("blId")),
//       plrId: zeroIfEmpty(getLatestValue("plrId")),
//       podId: zeroIfEmpty(getLatestValue("podId")),
//       fpdId: zeroIfEmpty(getLatestValue("fpdId")),
//       polId: zeroIfEmpty(getLatestValue("polId")),

//       vesselId: zeroIfEmpty(getLatestValue("vesselId")),
//       voyageId: zeroIfEmpty(getLatestValue("voyageId")),

//       depotId: zeroIfEmpty(getLatestValue("depotId")),
//       containerStatusId: zeroIfEmpty(getLatestValue("containerStatusId")),
//       cargoTypeId: zeroIfEmpty(getLatestValue("cargoTypeId")),
//       sizeId: 0,
//       typeId: 0,

//       containerRepairId: zeroIfEmpty(getLatestValue("containerRepairId")),
//       containerTransactionId: zeroIfEmpty(
//         getLatestValue("containerTransactionId")
//       ),

//       invoiceExchageRate: exchangeRate,
//     };

//     console.log("getThirdLevelDetails requestData:", requestData);

//     const fetchChargeDetails = await fetchThirdLevelDetailsFromApi(requestData);

//     console.log("getThirdLevelDetails response:", fetchChargeDetails);

//     const Chargers =
//       fetchChargeDetails?.Chargers || fetchChargeDetails?.data || [];

//     const updatedChargers = Chargers.map((item, i) => {
//       const _containerId = toNumberOrNull(item.containerId);
//       const _sizeId = toNumberOrNull(item.sizeId);
//       const _typeId = toNumberOrNull(item.typeId);
//       const _jobId = toNumberOrNull(item.jobId);
//       const _containerTransactionId = toNumberOrNull(
//         item.containerTransactionId
//       );
//       const _containerRepairId = toNumberOrNull(item.containerRepairId);
//       const _blId = toNumberOrNull(item.blId);

//       const rowQty = toNumber(item.qty);
//       const rowNoOfDays = toNumber(item.noOfDays);
//       const rowRate = toNumber(item.rate);

//       const calculatedAmount = rowQty * rowNoOfDays * rowRate;

//       return {
//         ...item,
//         indexValue: i,

//         containerIddropdown:
//           _containerId !== null
//             ? [
//               {
//                 value: _containerId,
//                 label: item.containerNo ?? String(_containerId),
//               },
//             ]
//             : [],

//         sizeIddropdown:
//           _sizeId !== null
//             ? [
//               {
//                 value: _sizeId,
//                 label: item.sizeName ?? String(_sizeId),
//               },
//             ]
//             : [],

//         typeIddropdown:
//           _typeId !== null
//             ? [
//               {
//                 value: _typeId,
//                 label: item.typeName ?? String(_typeId),
//               },
//             ]
//             : [],

//         jobIddropdown:
//           _jobId !== null
//             ? [
//               {
//                 value: _jobId,
//                 label: item.jobNo ?? String(_jobId),
//               },
//             ]
//             : [],

//         containerTransactionIddropdown:
//           _containerTransactionId !== null
//             ? [
//               {
//                 value: _containerTransactionId,
//                 label:
//                   item.containerTransactionName ??
//                   String(_containerTransactionId),
//               },
//             ]
//             : [],

//         containerRepairIddropdown:
//           _containerRepairId !== null
//             ? [
//               {
//                 value: _containerRepairId,
//                 label:
//                   item.containerRepairName ?? String(_containerRepairId),
//               },
//             ]
//             : [],

//         blIddropdown:
//           _blId !== null
//             ? [
//               {
//                 value: _blId,
//                 label: item.blNo ?? String(_blId),
//               },
//             ]
//             : [],

//         calculatedAmount: calculatedAmount,
//       };
//     });

//     const qty = updatedChargers.reduce(
//       (acc, item) => acc + toNumber(item.qty),
//       0
//     );

//     const totalAmountHc = updatedChargers.reduce(
//       (acc, item) => acc + toNumber(item.calculatedAmount),
//       0
//     );

//     const avgRate = qty > 0 ? totalAmountHc / qty : 0;
//     const totalAmountFc = totalAmountHc * exchangeRate;

//     const updatedChargeRow = {
//       ...currentChargeRow,

//       tblInvoiceChargeDetails: updatedChargers,

//       qty: qty,
//       rate: avgRate.toFixed(2),
//       totalAmountHc: totalAmountHc.toFixed(2),
//       totalAmountFc: totalAmountFc.toFixed(2),
//       totalAmount: totalAmountHc.toFixed(2),
//     };

//     let updatedTblInvoiceCharge = [];

//     if (chargeRows.length > 0) {
//       updatedTblInvoiceCharge = chargeRows.map((row, index) =>
//         index === currentChargeIndex ? updatedChargeRow : row
//       );
//     } else {
//       updatedTblInvoiceCharge = [updatedChargeRow];
//     }

//     const finalValues = {
//       ...values,
//       tblInvoiceCharge: updatedTblInvoiceCharge,
//     };

//     const finalNewState = {
//       ...newState,
//       tblInvoiceCharge: updatedTblInvoiceCharge,
//     };

//     setStateVariable((prev) => ({
//       ...prev,
//       tblInvoiceCharge: updatedTblInvoiceCharge,
//     }));

//     return {
//       values: finalValues,
//       newState: finalNewState,
//     };
//   } catch (error) {
//     console.error("getThirdLevelDetails error:", error);

//     return {
//       values: {
//         ...values,
//       },
//       newState: {
//         ...newState,
//       },
//     };
//   }
// };

const getThirdLevelDetails = async (obj) => {
  const {
    args,
    newState,
    formControlData,
    setFormControlData,
    values,
    fieldName,
    tableName,
    setStateVariable,
    onChangeHandler,
  } = obj;

  const { companyId, clientId, branchId } = getUserDetails();

  const isEmpty = (v) =>
    v === undefined ||
    v === null ||
    v === "" ||
    (Array.isArray(v) && v.length === 0);

  const getIdValue = (v) => {
    if (Array.isArray(v)) {
      return v?.[0]?.value ?? v?.[0]?.id ?? v?.[0]?.Id ?? 0;
    }

    if (typeof v === "object" && v !== null) {
      return v?.value ?? v?.id ?? v?.Id ?? 0;
    }

    return isEmpty(v) ? 0 : v;
  };

  const zeroIfEmpty = (v) => {
    const val = getIdValue(v);
    return isEmpty(val) ? 0 : val;
  };

  const toNumberOrNull = (v) => {
    if (v === null || v === undefined || v === "") return null;

    const n = Number(v);
    return Number.isFinite(n) ? n : null;
  };

  const toNumber = (v) => {
    const n = Number(v);
    return Number.isFinite(n) ? n : 0;
  };

  const formatDateForApi = (v) => {
    if (v === undefined || v === null || v === "") return null;

    if (typeof v === "string") return v;

    if (typeof v?.format === "function") {
      const formatted = v.format("YYYY-MM-DD HH:mm:ss");
      return formatted === "Invalid date" ? null : formatted;
    }

    if (v instanceof Date && !isNaN(v.getTime())) {
      const yyyy = v.getFullYear();
      const mm = String(v.getMonth() + 1).padStart(2, "0");
      const dd = String(v.getDate()).padStart(2, "0");
      const hh = String(v.getHours()).padStart(2, "0");
      const mi = String(v.getMinutes()).padStart(2, "0");
      const ss = String(v.getSeconds()).padStart(2, "0");

      return `${yyyy}-${mm}-${dd} ${hh}:${mi}:${ss}`;
    }

    return v;
  };

  const returnNormalGridSave = (chargeRows) => {
    const finalValues = {
      ...values,
      tblInvoiceCharge: chargeRows,
    };

    const finalNewState = {
      ...newState,
      tblInvoiceCharge: chargeRows,
    };

    if (typeof setStateVariable === "function") {
      setStateVariable((prev) => ({
        ...prev,
        tblInvoiceCharge: chargeRows,
      }));
    }

    return {
      values: finalValues,
      newState: finalNewState,
    };
  };

  try {
    /*
      IMPORTANT:
      In grid save, latest row data mostly comes in newState.
      So keep newState first, then values.
    */
    const chargeRows = Array.isArray(newState?.tblInvoiceCharge)
      ? newState.tblInvoiceCharge
      : Array.isArray(values?.tblInvoiceCharge)
        ? values.tblInvoiceCharge
        : [];

    let currentChargeIndex = 0;

    if (chargeRows.length > 0) {
      const checkedIndex = chargeRows.findIndex(
        (row) => row?.isChecked === true
      );

      if (checkedIndex > -1) {
        currentChargeIndex = checkedIndex;
      } else {
        const indexValue =
          newState?.indexValue ??
          values?.indexValue ??
          chargeRows?.[0]?.indexValue;

        const matchedIndex = chargeRows.findIndex(
          (row, index) =>
            Number(row?.indexValue) === Number(indexValue) ||
            Number(index) === Number(indexValue)
        );

        currentChargeIndex = matchedIndex > -1 ? matchedIndex : 0;
      }
    }

    const currentChargeRow =
      chargeRows.length > 0
        ? chargeRows[currentChargeIndex] || {}
        : values || {};

    const getLatestValue = (key) => {
      if (!isEmpty(newState?.[key])) return newState[key];
      if (!isEmpty(currentChargeRow?.[key])) return currentChargeRow[key];
      if (!isEmpty(values?.[key])) return values[key];
      return null;
    };

    /*
      THIRD LEVEL LOGIC ONLY FOR CLIENT ID 17
      Other clients: no popup, no API call, normal grid save.
    */
    const isThirdLevelAllowedClient = Number(clientId) === 17;

    if (!isThirdLevelAllowedClient) {
      return returnNormalGridSave(chargeRows);
    }

    /*
      For client 17 only:
      Ask user whether to set third level data.
    */
    const shouldSetThirdLevelData =
      typeof window !== "undefined"
        ? window.confirm("Do you want to set third level data?")
        : true;

    /*
      If user clicks No:
      Do not call API.
      Preserve latest chargeRows so next save Yes works properly.
    */
    if (!shouldSetThirdLevelData) {
      return returnNormalGridSave(chargeRows);
    }

    const exchangeRate =
      toNumber(getLatestValue("exchangeRate")) > 0
        ? toNumber(getLatestValue("exchangeRate"))
        : 1;

    const requestData = {
      billingPartyId: zeroIfEmpty(getLatestValue("billingPartyId")),
      clientId: clientId,
      jobId: zeroIfEmpty(getLatestValue("jobId")),
      chargeId: zeroIfEmpty(getLatestValue("chargeId")),
      companyId: companyId,
      companyBranchId: branchId,

      fromDate: formatDateForApi(getLatestValue("fromDate")),
      toDate: formatDateForApi(getLatestValue("toDate")),

      businessSegmentId: zeroIfEmpty(getLatestValue("businessSegmentId")),
      voucherTypeId: zeroIfEmpty(getLatestValue("voucherTypeId")),

      blId: zeroIfEmpty(getLatestValue("blId")),
      plrId: zeroIfEmpty(getLatestValue("plrId")),
      podId: zeroIfEmpty(getLatestValue("podId")),
      fpdId: zeroIfEmpty(getLatestValue("fpdId")),
      polId: zeroIfEmpty(getLatestValue("polId")),

      vesselId: zeroIfEmpty(getLatestValue("vesselId")),
      voyageId: zeroIfEmpty(getLatestValue("voyageId")),

      depotId: zeroIfEmpty(getLatestValue("depotId")),
      containerStatusId: zeroIfEmpty(getLatestValue("containerStatusId")),
      cargoTypeId: zeroIfEmpty(getLatestValue("cargoTypeId")),
      sizeId: 0,
      typeId: 0,

      containerRepairId: zeroIfEmpty(getLatestValue("containerRepairId")),
      containerTransactionId: zeroIfEmpty(
        getLatestValue("containerTransactionId")
      ),

      invoiceExchageRate: exchangeRate,
    };

    console.log("getThirdLevelDetails requestData:", requestData);

    const fetchChargeDetails = await fetchThirdLevelDetailsFromApi(requestData);

    console.log("getThirdLevelDetails response:", fetchChargeDetails);

    const Chargers = Array.isArray(fetchChargeDetails?.Chargers)
      ? fetchChargeDetails.Chargers
      : Array.isArray(fetchChargeDetails?.data)
        ? fetchChargeDetails.data
        : [];

    const updatedChargers = Chargers.map((item, i) => {
      const _containerId = toNumberOrNull(item.containerId);
      const _sizeId = toNumberOrNull(item.sizeId);
      const _typeId = toNumberOrNull(item.typeId);
      const _jobId = toNumberOrNull(item.jobId);
      const _containerTransactionId = toNumberOrNull(
        item.containerTransactionId
      );
      const _containerRepairId = toNumberOrNull(item.containerRepairId);
      const _blId = toNumberOrNull(item.blId);

      const rowQty = toNumber(item.qty);
      const rowNoOfDays = toNumber(item.noOfDays);
      const rowRate = toNumber(item.rate);

      const calculatedAmount = rowQty * rowNoOfDays * rowRate;

      return {
        ...item,
        indexValue: i,

        containerIddropdown:
          _containerId !== null
            ? [
              {
                value: _containerId,
                label: item.containerNo ?? String(_containerId),
              },
            ]
            : [],

        sizeIddropdown:
          _sizeId !== null
            ? [
              {
                value: _sizeId,
                label: item.sizeName ?? String(_sizeId),
              },
            ]
            : [],

        typeIddropdown:
          _typeId !== null
            ? [
              {
                value: _typeId,
                label: item.typeName ?? String(_typeId),
              },
            ]
            : [],

        jobIddropdown:
          _jobId !== null
            ? [
              {
                value: _jobId,
                label: item.jobNo ?? String(_jobId),
              },
            ]
            : [],

        containerTransactionIddropdown:
          _containerTransactionId !== null
            ? [
              {
                value: _containerTransactionId,
                label:
                  item.containerTransactionName ??
                  String(_containerTransactionId),
              },
            ]
            : [],

        containerRepairIddropdown:
          _containerRepairId !== null
            ? [
              {
                value: _containerRepairId,
                label:
                  item.containerRepairName ?? String(_containerRepairId),
              },
            ]
            : [],

        blIddropdown:
          _blId !== null
            ? [
              {
                value: _blId,
                label: item.blNo ?? String(_blId),
              },
            ]
            : [],

        calculatedAmount: calculatedAmount,
      };
    });

    const qty = updatedChargers.reduce(
      (acc, item) => acc + toNumber(item.qty),
      0
    );

    const totalAmountHc = updatedChargers.reduce(
      (acc, item) => acc + toNumber(item.calculatedAmount),
      0
    );

    const avgRate = qty > 0 ? totalAmountHc / qty : 0;
    const totalAmountFc = totalAmountHc * exchangeRate;

    const updatedChargeRow = {
      ...currentChargeRow,

      tblInvoiceChargeDetails: updatedChargers,

      qty: qty,
      rate: avgRate.toFixed(2),
      totalAmountHc: totalAmountHc.toFixed(2),
      totalAmountFc: totalAmountFc.toFixed(2),
      totalAmount: totalAmountHc.toFixed(2),
    };

    let updatedTblInvoiceCharge = [];

    if (chargeRows.length > 0) {
      updatedTblInvoiceCharge = chargeRows.map((row, index) =>
        index === currentChargeIndex ? updatedChargeRow : row
      );
    } else {
      updatedTblInvoiceCharge = [updatedChargeRow];
    }

    const finalValues = {
      ...values,
      tblInvoiceCharge: updatedTblInvoiceCharge,
    };

    const finalNewState = {
      ...newState,
      tblInvoiceCharge: updatedTblInvoiceCharge,
    };

    if (typeof setStateVariable === "function") {
      setStateVariable((prev) => ({
        ...prev,
        tblInvoiceCharge: updatedTblInvoiceCharge,
      }));
    }

    return {
      values: finalValues,
      newState: finalNewState,
    };
  } catch (error) {
    console.error("getThirdLevelDetails error:", error);

    return {
      values: {
        ...values,
      },
      newState: {
        ...newState,
      },
    };
  }
};
const calculateRateRequestChargeProfit = async (obj) => {
  const {
    newState,
    values,
    setStateVariable,
  } = obj;

  const toNumber = (v) => {
    const n = Number(v);
    return Number.isFinite(n) ? n : 0;
  };

  try {
    const chargeRows = Array.isArray(newState?.tblRateRequestCharge)
      ? newState.tblRateRequestCharge
      : Array.isArray(values?.tblRateRequestCharge)
        ? values.tblRateRequestCharge
        : [];

    const updatedTblRateRequestCharge = chargeRows.map((row, index) => {
      const qty = toNumber(row?.qty);
      const sellRate = toNumber(row?.sellRate);
      const buyRate = toNumber(row?.buyRate);

      const sellAmount = sellRate * qty;
      const buyAmount = buyRate * qty;

      // profit = sell rate * qty - buy rate * qty
      const profit = sellAmount - buyAmount;

      return {
        ...row,
        indexValue: row?.indexValue ?? index,

        sellAmount: sellAmount.toFixed(2),
        buyAmount: buyAmount.toFixed(2),
        profit: profit.toFixed(2),
      };
    });

    const totalSellAmount = updatedTblRateRequestCharge.reduce(
      (acc, row) => acc + toNumber(row?.sellAmount),
      0
    );

    const totalBuyAmount = updatedTblRateRequestCharge.reduce(
      (acc, row) => acc + toNumber(row?.buyAmount),
      0
    );

    const totalProfit = updatedTblRateRequestCharge.reduce(
      (acc, row) => acc + toNumber(row?.profit),
      0
    );

    const finalValues = {
      ...values,
      tblRateRequestCharge: updatedTblRateRequestCharge,
      totalSellAmount: totalSellAmount.toFixed(2),
      totalBuyAmount: totalBuyAmount.toFixed(2),
      profit: totalProfit.toFixed(2),
    };

    const finalNewState = {
      ...newState,
      tblRateRequestCharge: updatedTblRateRequestCharge,
      totalSellAmount: totalSellAmount.toFixed(2),
      totalBuyAmount: totalBuyAmount.toFixed(2),
      profit: totalProfit.toFixed(2),
    };

    setStateVariable((prev) => ({
      ...prev,
      tblRateRequestCharge: updatedTblRateRequestCharge,
      totalSellAmount: totalSellAmount.toFixed(2),
      totalBuyAmount: totalBuyAmount.toFixed(2),
      profit: totalProfit.toFixed(2),
    }));

    return {
      values: finalValues,
      newState: finalNewState,
    };
  } catch (error) {
    console.error("calculateRateRequestChargeProfit error:", error);

    return {
      values: {
        ...values,
      },
      newState: {
        ...newState,
      },
    };
  }
};
export { setJobContainer, copyContainerData, getThirdLevelDetails, calculateRateRequestChargeProfit };
