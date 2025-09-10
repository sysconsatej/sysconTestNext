import { getUserDetails } from "@/helper/userDetails";
import { fetchReportData } from "@/services/auth/FormControl.services";

async function operatorFunc(formId, rowsId, tableName) {
  const { themeId, clientId } = getUserDetails();
  let result = {};

  const operators = {
    ">": (val, condition) => val > condition,
    "<": (val, condition) => val < condition,
    ">=": (val, condition) => val >= condition,
    "<=": (val, condition) => val <= condition,
    "=": (val, condition) => val == condition,
    "!=": (val, condition) => val != condition,
    "||": (val, condition) => condition.split(",").includes(val),
    "!||": (val, condition) => !condition.split(",").includes(val),
  };

  const ruleRequest = {
    columns: "onFieldName,Operator,FieldValue,color",
    tableName: "tblFormSearchDisplay",
    whereCondition: `status=1 AND clientId = ${clientId} AND formId = ${formId} AND themeId = ${themeId}`,
    clientIdCondition: `status = 1 FOR JSON PATH`,
  };
  const { data: rules } = await fetchReportData(ruleRequest);

  if (rules?.length === 0) return {};

  const allFields = [...new Set(rules.map((r) => r.onFieldName))];
  const rowRequest = {
    columns: `id, ${allFields.join(", ")}`,
    tableName,
    whereCondition: `status=1 AND clientId = ${clientId} AND id IN (${rowsId.join(
      ","
    )})`,
    clientIdCondition: `status = 1 FOR JSON PATH, INCLUDE_NULL_VALUES`,
  };
  const { data: rows } = await fetchReportData(rowRequest);

  rows.forEach((row) => {
    rules.forEach((rule) => {
      const fieldVal = row[rule?.onFieldName];
      if (operators[rule?.Operator](`${fieldVal}`, rule?.FieldValue)) {
        result[row?.id] = rule?.color;
      }
    });
  });

  return result;
}

export { operatorFunc };
