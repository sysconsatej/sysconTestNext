/* eslint-disable */

const toNumber = (value) => {
  const number = Number(value);

  return value == null ||
    value === "" ||
    !Number.isFinite(number)
    ? 0
    : number;
};

const getValue = (primaryValue, fallbackValue) =>
  primaryValue == null || primaryValue === ""
    ? fallbackValue
    : primaryValue;

const toBoolean = (value) =>
  value === true ||
  value === 1 ||
  value === "1" ||
  value === "true" ||
  value === "Y" ||
  value === "y";

const setVendorChargeApprovalValues = ({
  values = {},
  newState = {},
  isChecked,
}) => {
  const checked =
    typeof isChecked === "boolean"
      ? isChecked
      : toBoolean(values.approved);

  const approvedLabourHours = checked
    ? toNumber(
        getValue(
          values.approvedlabourHours,
          values.labourHours,
        ),
      )
    : null;

  const approvedMaterialCost = checked
    ? toNumber(
        getValue(
          values.approvedmaterialCost,
          values.materialCost,
        ),
      )
    : null;

  const approvedLabourRate = toNumber(
    newState?.approvedLabourRate ??
      values?.approvedLabourRate,
  );

  const approvedTotalAmount = checked
    ? Number(
        (
          approvedLabourRate * approvedLabourHours +
          approvedMaterialCost
        ).toFixed(2),
      )
    : null;

  return {
    isCheck: true,
    alertShow: false,
    message: "",
    values: {
      approved: checked,
      isChecked: checked,
      approvedlabourHours: approvedLabourHours,
      approvedmaterialCost: approvedMaterialCost,
      approvedtotalAmoumt: approvedTotalAmount,
    },
  };
};

export { setVendorChargeApprovalValues };