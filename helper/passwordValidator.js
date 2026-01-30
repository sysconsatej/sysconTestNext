export const passwordValidator = (password) => {
  const regex =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,20}$/;

  if (!regex.test(password)) {
    return "Password must be 8–20 characters and include uppercase, lowercase, number, and special character (@$!%*?&)";
  }

  return null;
};
