export const DemoValidation = (second) => {
  throw new Error(`Error Can't edit this record IRAN is genrated`);
};
export const DeleteValidation = ({
  args,
  newState,
  formControlData,
  values,
}) => {
  // throw new Error(`Error Can't delete this record IRAN is genrated`);
  console.log({ args, newState, formControlData, values });

  return {
    isCheck: true,
    type: "error",
    message: "Error Can't delete this record IRAN is genrated",
    alertShow: true,
    // fieldName: fieldName,
    newState: newState,
    values: values,
    formControlData: formControlData,
  };
};
