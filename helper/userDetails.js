import { decrypt, encrypt } from "./security";

export const getUserDetails = () => {
  const ISSERVER = typeof window === "undefined";

  if (!ISSERVER) {
    const storedUserData = localStorage.getItem("userData");
    const decryptedData = decrypt(storedUserData);
    const userData = JSON.parse(decryptedData);
    const clientCode = userData[0].clientCode;
    const clientId = userData[0].clientId;
    const emailId = userData[0].emailId;
    const dateFormat = userData[0].dateTimeFormat;
    const userId = userData[0].id;
    const roleId = userData[0].roleId;
    const themeId = userData[0].themeId;

    const companyId = sessionStorage.getItem("companyId");
    const branchId = sessionStorage.getItem("branchId");
    const financialYear = sessionStorage.getItem("financialYear");

    return {
      clientCode,
      companyId,
      branchId,
      clientId,
      emailId,
      dateFormat,
      userId,
      financialYear,
      roleId,
      themeId,
    };
  } else {
    return {};
  }
};

export const updateUserDetails = (newData) => {
  const storedUserData = localStorage.getItem("userData");
  if (storedUserData) {
    const decryptedData = decrypt(storedUserData);
    const userData = JSON.parse(decryptedData)[0];
    const newUserData = [{ ...userData, ...newData }];
    localStorage.setItem("userData", encrypt(JSON.stringify(newUserData)));
  } else {
    console.log("User data not found in local!");
  }
};
