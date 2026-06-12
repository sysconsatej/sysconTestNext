import { fetchReportData,fetchThirdLevelDetailsFromApi } from "@/services/auth/FormControl.services";
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

  const { companyId, clientId, branchId, userId, financialYear } =
    getUserDetails();

  // Parse args
  let argNames;
  let splitArgs = [];
  if (
    args === undefined ||
    args === null ||
    args === "" ||
    (typeof args === "object" && Object.keys(args).length === 0)
  ) {
    argNames = args;
  } else {
    argNames = args.split(",").map((arg) => arg.trim());
    for (const iterator of argNames) {
      splitArgs.push(iterator.split("."));
    }
  }

  const {
    businessSegmentId,
    voucherTypeId,
    blId,
    plrId,
    podId,
    fpdId,
    polId,
    depotId,
    billingPartyId,
    containerStatusId,
    fromDate,
    toDate,
    exchangeRate,
  } = newState;

  const {
    jobId,
    chargeId,
    cargoTypeId,
    sizeId,
    typeId,
    containerRepairId,
    containerTransactionId,
  } = values;

  const requestData = {
    billingPartyId: billingPartyId,
    clientId: clientId,
    jobId: jobId,
    chargeId: chargeId,
    companyId: companyId,
    companyBranchId: branchId,
    fromDate: fromDate,
    toDate: toDate,
    clientId: clientId,
    businessSegmentId: businessSegmentId,
    voucherTypeId: voucherTypeId,
    blId: blId,
    plrId: plrId,
    podId: podId,
    fpdId: fpdId,
    polId: polId,
    depotId: depotId,
    containerStatusId: containerStatusId,
    cargoTypeId: cargoTypeId,
    sizeId: sizeId,
    typeId: typeId,
    containerRepairId: containerRepairId,
    containerTransactionId: containerTransactionId,
    invoiceExchageRate: exchangeRate,
  };

  const fetchChargeDetails = await fetchThirdLevelDetailsFromApi(requestData);

  if (fetchChargeDetails) {
    const { Chargers = [] } = fetchChargeDetails;

    const toNum = (v) =>
      v === null || v === undefined || v === "" ? null : Number(v);

    const updatedChargers = Chargers.map((item, i) => {
      const _containerId = toNum(item.containerId);
      const _sizeId = toNum(item.sizeId);
      const _typeId = toNum(item.typeId);
      const _jobId = toNum(item.jobId);
      const _containerTransactionId = toNum(item.containerTransactionId);
      const _containerRepairId = toNum(item.containerRepairId);
      const _blId = toNum(item.blId);
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
            ? [{ value: _sizeId, label: item.sizeName ?? String(_sizeId) }]
            : [],
        typeIddropdown:
          _typeId !== null
            ? [{ value: _typeId, label: item.typeName ?? String(_typeId) }]
            : [],
        jobIddropdown:
          _jobId !== null
            ? [{ value: _jobId, label: item.jobNo ?? String(_jobId) }]
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
                label: item.containerRepairName ?? String(_containerRepairId),
              },
            ]
            : [],
        blIddropdown:
          _blId !== null
            ? [{ value: _blId, label: item.blNo ?? String(_blId) }]
            : [],
        // optional: keep per-row calculated amount for clarity
        calculatedAmount:
          (Number(item.noOfDays) || 0) * (Number(item.rate) || 0),
      };
    });

    // ✅ total qty
    const qty = updatedChargers.reduce(
      (acc, item) => acc + (Number(item["qty"]) || 0),
      0,
    );

    // ✅ total of (noOfDays * rate)
    const totalWeighted = updatedChargers.reduce(
      (acc, item) =>
        acc + (Number(item["noOfDays"]) || 0) * (Number(item["rate"]) || 0),
      0,
    );

    // ✅ average rate
    const avgRate = qty > 0 ? totalWeighted / qty : 0;

    values.tblInvoiceChargeDetails = updatedChargers;
    values["qty"] = qty;
    values["rate"] = avgRate.toFixed(2);
    values["totalAmountHc"] = (qty * avgRate * 1).toFixed(2);
    values["totalAmountFc"] = (
      qty *
      avgRate *
      Number(newState.exchangeRate || 1)
    ).toFixed(2);

    setStateVariable((prev) => ({
      ...prev,
      tblInvoiceChargeDetails: updatedChargers,
      qty: qty,
      rate: avgRate.toFixed(2),
      totalAmountHc: (qty * avgRate).toFixed(2),
      totalAmountFc: (
        qty *
        avgRate *
        Number(newState.exchangeRate || 1)
      ).toFixed(2),
    }));
  }
};

export { setJobContainer,copyContainerData,getThirdLevelDetails};
