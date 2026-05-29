import { fetchReportData } from "@/services/auth/FormControl.services";
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

export { setJobContainer,copyContainerData };
