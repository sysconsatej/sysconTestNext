"use client";
/* eslint-disable */

import React, { useEffect, useRef, useState } from "react";
import {
  Box,
  TextField,
  MenuItem,
  Typography,
  Avatar,
  Grid,
  Link,
  RadioGroup,
  FormControlLabel,
  Radio,
} from "@mui/material";
import CustomizedButtons from "@/components/Buttons/customeButton";
import { ThemeProvider } from "@mui/material/styles";
import theme from "@/components/Theme/theme";
import { decrypt, encrypt } from "@/helper/security";
import { useRouter } from "next/navigation";
import {
  profileSubmit,
  themeChange,
  dynamicDropDownFieldsData,
  profileDropdowns, // ✅ bring back
} from "@/services/auth/FormControl.services";
import { toast, ToastContainer } from "react-toastify";
import { useThemeProvider } from "@/context/themeProviderDataContext";
import { updateUserDetails } from "@/helper/userDetails";

const backendUrl = process.env.NEXT_PUBLIC_BASE_URL;

const UserProfile = () => {
  const [userName, setUserName] = useState("");
  const [loginId, setLoginId] = useState("");
  const [loginEmailId, setLoginEmailId] = useState("");

  const [profilePicture, setProfilePicture] = useState(null);
  const [uploadImage, setUploadImage] = useState("");
  const [oldProfile, setOldProfile] = useState("");

  const [profileState, setProfileState] = useState({
    theme: null,
    financialYear: null,
    company: null,
    branch: null,
    menu: null,
    language: null,
  });

  const [numberFormat, setNumberFormat] = useState("d");
  const [dateFormat, setDateFormat] = useState("");

  // ✅ dropdown lists
  const [companyData, setCompanyData] = useState([]);
  const [branchData, setBranchData] = useState([]);
  const [financialYearData, setFinancialYearData] = useState([]);
  const [menuData, setMenuData] = useState([]);
  const [languageData, setLanguageData] = useState([]);
  const [themeData, setThemeData] = useState([]);

  const { initializeTheme } = useThemeProvider();
  const router = useRouter();

  const companyCtrlRef = useRef(null);
  const branchCtrlRef = useRef(null);
  const yearCtrlRef = useRef(null);

  const getUserDataSafe = () => {
    try {
      const storedUserData = localStorage.getItem("userData");
      if (!storedUserData) return null;
      return JSON.parse(decrypt(storedUserData));
    } catch (e) {
      console.error("Failed to read userData:", e);
      return null;
    }
  };

  const setUserDataSafe = (patch) => {
    const ud = getUserDataSafe();
    if (!ud?.[0]) return;
    const next = { ...ud[0], ...patch };
    localStorage.setItem("userData", encrypt(JSON.stringify([next])));
  };

  const loadProfileDropdowns = async (companyId) => {
    try {
      if (!companyId) return;

      const res = await profileDropdowns(companyId);
      const data = res?.data || res?.data?.data || res?.data?.[0] || res?.data; // safe
      const toVL = (arr) =>
        Array.isArray(arr)
          ? arr.map((x) => ({
            value: x.value ?? x.id,
            label: x.label ?? x.name,
          }))
          : [];
      const t = toVL(res?.data?.theme || res?.data?.themes || []);
      const l = toVL(res?.data?.language || res?.data?.languages || []);
      const m = toVL(res?.data?.menu || res?.data?.menus || []);
      const t2 = t.length ? t : toVL(res?.data?.data?.theme || []);
      const l2 = l.length ? l : toVL(res?.data?.data?.language || []);
      const m2 = m.length ? m : toVL(res?.data?.data?.menu || []);

      setThemeData(t2);
      setLanguageData(l2);
      setMenuData(m2);
    } catch (e) {
      console.error("profileDropdowns failed:", e);
      setThemeData([]);
      setLanguageData([]);
      setMenuData([]);
    }
  };

  async function fetchCompanyData(pageNo = 1, search = "", valueSearch = null) {
    companyCtrlRef.current?.abort();
    companyCtrlRef.current = new AbortController();

    const ud = getUserDataSafe();
    const clientId = ud?.[0]?.clientId;
    if (!clientId) return [];

    const requestData = {
      onfilterkey: "status",
      onfiltervalue: 1,
      referenceTable: "tblCompany",
      referenceColumn: "name",
      dropdownFilter: ` and ownCompany='y' and clientId = ${clientId}`,
      search,
      pageNo: search.length > 0 ? 1 : pageNo,
      value: valueSearch ?? null,
    };

    try {
      const apiResponse = await dynamicDropDownFieldsData(
        requestData,
        companyCtrlRef.current,
      );
      const list = apiResponse?.data || [];
      setCompanyData(list);
      return list;
    } catch (e) {
      console.error("Error fetching company:", e);
      setCompanyData([]);
      return [];
    }
  }

  async function fetchBranchData(
    companyId,
    pageNo = 1,
    search = "",
    valueSearch = null,
  ) {
    branchCtrlRef.current?.abort();
    branchCtrlRef.current = new AbortController();

    const ud = getUserDataSafe();
    const clientId = ud?.[0]?.clientId;
    if (!clientId) return [];

    if (!companyId) {
      setBranchData([]);
      return [];
    }

    const requestData = {
      onfilterkey: "status",
      onfiltervalue: 1,
      referenceTable: "tblCompanyBranch",
      referenceColumn: "name",
      dropdownFilter: ` and clientId = ${clientId} and companyId = ${companyId}`,
      search,
      pageNo: search.length > 0 ? 1 : pageNo,
      value: valueSearch ?? null,
    };

    try {
      const apiResponse = await dynamicDropDownFieldsData(
        requestData,
        branchCtrlRef.current,
      );
      const list = apiResponse?.data || [];
      setBranchData(list);
      return list;
    } catch (e) {
      console.error("Error fetching branch:", e);
      setBranchData([]);
      return [];
    }
  }

  async function fetchFinancialYearData(
    companyId,
    pageNo = 1,
    search = "",
    valueSearch = null,
  ) {
    yearCtrlRef.current?.abort();
    yearCtrlRef.current = new AbortController();

    const ud = getUserDataSafe();
    const clientId = ud?.[0]?.clientId;
    if (!clientId) return [];

    const companyFilter = companyId ? ` and companyId = ${companyId}` : "";

    const requestData = {
      onfilterkey: "status",
      onfiltervalue: 1,
      referenceTable: "tblFinancialYear",
      referenceColumn: "financialYear",
      dropdownFilter: ` and clientId = ${clientId}${companyFilter}`,
      search,
      pageNo: search.length > 0 ? 1 : pageNo,
      value: valueSearch ?? null,
    };

    try {
      const apiResponse = await dynamicDropDownFieldsData(
        requestData,
        yearCtrlRef.current,
      );
      const list = apiResponse?.data || [];
      setFinancialYearData(list);
      return list;
    } catch (e) {
      console.error("Error fetching fin year:", e);
      setFinancialYearData([]);
      return [];
    }
  }

  useEffect(() => {
    const init = async () => {
      try {
        const ud = getUserDataSafe();
        if (!ud?.[0]) return;

        const userData = ud[0];

        setLoginEmailId(userData.emailId);
        setUserName(userData.name);
        setLoginId(userData.id);

        setProfilePicture(
          userData.profilePhoto ? backendUrl + userData.profilePhoto : null,
        );
        setOldProfile(userData.profilePhoto || "");

        setNumberFormat(userData.numberFormat || "d");
        setDateFormat(userData.dateTimeFormat || "");

        setProfileState({
          theme: userData.themeId ?? null,
          financialYear: userData.defaultFinYearId ?? null,
          company: userData.defaultCompanyId ?? null,
          branch: userData.defaultBranchId ?? null,
          menu: userData.defaultMenuId ?? null,
          language: userData.languageId ?? null,
        });

        const companyId = userData.defaultCompanyId ?? null;

        //await fetchCompanyData(1, "", companyId);
        await fetchCompanyData(1, "", null);
        const bd = await fetchBranchData(
          companyId,
          1,
          "",
          userData.defaultBranchId ?? null,
        );
        const fd = await fetchFinancialYearData(
          companyId,
          1,
          "",
          userData.defaultFinYearId ?? null,
        );

        setProfileState((prev) => {
          const branchOk =
            prev.branch && Array.isArray(bd) && bd.some((x) => x.value === prev.branch);
          const fyOk =
            prev.financialYear &&
            Array.isArray(fd) &&
            fd.some((x) => x.value === prev.financialYear);

          return {
            ...prev,
            branch: branchOk ? prev.branch : bd?.[0]?.value ?? null,
            financialYear: fyOk ? prev.financialYear : fd?.[0]?.value ?? null,
          };
        });

        await loadProfileDropdowns(companyId);
      } catch (error) {
        console.error("Error init profile:", error);
      }
    };

    init();

    return () => {
      companyCtrlRef.current?.abort?.();
      branchCtrlRef.current?.abort?.();
      yearCtrlRef.current?.abort?.();
    };
  }, []);

  const handleProfilePictureChange = (event) => {
    const file = event?.target?.files?.[0];
    setUploadImage(file);
    if (file) setProfilePicture(URL.createObjectURL(file));
  };

  const commonTextFieldProps = {
    variant: "outlined",
    size: "small",
    margin: "dense",
    fullWidth: true,
    InputProps: {
      sx: {
        "&:hover .MuiOutlinedInput-notchedOutline": {
          borderColor: "var(--inputBorderHoverColor)",
        },
        "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
          borderColor: "var(--inputBorderHoverColor)",
        },
        "&.Mui-disabled .MuiInputBase-input": {
          WebkitTextFillColor: "unset",
        },
      },
      style: {
        fontSize: "0.75rem",
        color: "var(--inputTextColor)",
        backgroundColor: "var(--inputBg)",
        border: "1px solid var(--inputBorderColor)",
      },
    },
    InputLabelProps: {
      style: {
        fontSize: "0.75rem",
        color: "var(--inputTextColor)",
      },
    },
  };

  const buttonsData = [
    { buttonName: "Submit", functionOnClick: "handleSubmit" },
    { buttonName: "Cancel", functionOnClick: "handleCancel" },
    { buttonName: "Create Dashboard", functionOnClick: "handleDashboard" },
  ];

  const asNullStr = (v) => {
    if (v === null || v === undefined) return "null";
    const s = String(v);
    return s.trim() === "" ? "null" : s;
  };

  const ensureValidId = (value, options) => {
    if (value === null || value === undefined) return null;
    const v = Number(value);
    if (!Number.isFinite(v)) return null;
    if (!Array.isArray(options) || options.length === 0) return null;
    return options.some((x) => Number(x.value) === v) ? v : null;
  };
  const handleButtonClick = {
    // handleSubmit: async () => {
    //   try {
    //     const formData = new FormData();
    //     if (uploadImage) formData.append("avatar", uploadImage);
    //     formData.append("oldAvatar", oldProfile || "");
    //     formData.append("id", loginId);

    //     formData.append("themeId", profileState.theme ?? "");
    //     formData.append("languageId", profileState.language ?? "");
    //     formData.append("dateTimeFormat", dateFormat ?? "");
    //     formData.append("numberFormat", numberFormat ?? "");
    //     formData.append("defaultCompanyId", profileState.company ?? "");
    //     formData.append("defaultBranchId", profileState.branch ?? "");
    //     formData.append("defaultFinYearId", profileState.financialYear ?? "");
    //     formData.append("defaultMenuId", profileState.menu ?? "");

    //     const { data } = await profileSubmit(formData);

    //     setUserDataSafe({
    //       themeId: profileState.theme,
    //       languageId: profileState.language,
    //       dateTimeFormat: dateFormat,
    //       numberFormat,
    //       defaultCompanyId: profileState.company,
    //       defaultBranchId: profileState.branch,
    //       defaultFinYearId: profileState.financialYear,
    //       defaultMenuId: profileState.menu,
    //       profilePhoto: data?.profilePhoto ?? oldProfile,
    //     });

    //     updateUserDetails(data);
    //     toast.success("Update profile successfully!");
    //   } catch (error) {
    //     console.log(error);
    //     toast.error("Profile not updated!");
    //   }
    // },

    handleSubmit: async () => {
      try {
        if (!loginId) {
          toast.error("Login Id not found. Please login again.");
          return;
        }

        const safeMenuId = ensureValidId(profileState.menu, menuData);
        const formData = new FormData();
        if (uploadImage) formData.append("avatar", uploadImage);
        formData.append("oldAvatar", oldProfile?.trim() ? oldProfile : "null");
        formData.append("id", asNullStr(loginId));
        formData.append("themeId", asNullStr(profileState.theme));
        formData.append("languageId", asNullStr(profileState.language));
        formData.append("dateTimeFormat", asNullStr(dateFormat));
        formData.append("numberFormat", asNullStr(numberFormat));
        formData.append("defaultCompanyId", asNullStr(profileState.company));
        formData.append("defaultBranchId", asNullStr(profileState.branch));
        formData.append("defaultFinYearId", asNullStr(profileState.financialYear));
        formData.append("defaultMenuId", asNullStr(safeMenuId));
        const resp = await profileSubmit(formData);
        const data = resp?.data?.data ?? resp?.data;
        setUserDataSafe({
          themeId: profileState.theme,
          languageId: profileState.language,
          dateTimeFormat: dateFormat,
          numberFormat,
          defaultCompanyId: profileState.company,
          defaultBranchId: profileState.branch,
          defaultFinYearId: profileState.financialYear,
          defaultMenuId: safeMenuId,
          profilePhoto: data?.profilePhoto ?? oldProfile,
        });
        updateUserDetails(data);
        toast.success("Update profile successfully!");
      } catch (error) {
        console.log(" profile submit error:", error?.response?.data || error);
        toast.error(
          error?.response?.data?.message ||
          error?.message ||
          "Profile not updated!",
        );
      }
    },
    handleCancel: () => {
      toast.warning("Update action has been cancelled by the user.");
      router.push("/dashboard");
    },

    handleDashboard: () => {
      router.push("/CreateDashboard");
    },

    handleUploadChange: () => {
      document.getElementById("profilePictureInput")?.click?.();
    },

    handleEditPassword: () => {
      router.push("/LoginReset");
    },
  };

  const renderSelectOptions = (list) => {
    if (!Array.isArray(list) || list.length === 0) {
      return (
        <MenuItem
          disabled
          style={{
            fontSize: "0.75rem",
            color: "var(--inputTextColor)",
            backgroundColor: "var(--inputBg)",
          }}
        >
          No Data Found
        </MenuItem>
      );
    }
    return list.map((opt) => (
      <MenuItem
        key={opt.value}
        value={opt.value}
        style={{
          fontSize: "0.75rem",
          color: "var(--inputTextColor)",
          backgroundColor: "var(--inputBg)",
        }}
      >
        {opt.label}
      </MenuItem>
    ));
  };

  const ProfileSelect = ({ label, value, options, onChange, disabled = false }) => {
    return (
      <Grid item xs={12} sm={6}>
        <TextField
          select
          label={label}
          value={value ?? ""}
          disabled={disabled}
          onChange={onChange}
          {...commonTextFieldProps}
          SelectProps={{
            sx: {
              "&:hover .MuiOutlinedInput-notchedOutline": {
                borderColor: "var(--inputBorderHoverColor)",
              },
              "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                borderColor: "var(--inputBorderHoverColor)",
              },
              ".MuiSelect-icon": {
                color: "var(--inputTextColor)",
              },
            },
            MenuProps: {
              PaperProps: {
                style: {
                  backgroundColor: "var(--inputBg)",
                  color: "var(--inputTextColor)",
                },
              },
            },
          }}
        >
          {renderSelectOptions(options)}
        </TextField>
      </Grid>
    );
  };

  const onThemeChange = async (themeId) => {
    try {
      const { data } = await themeChange({ themeId });

      const serverThemeData = {
        lightTheme: data,
        darkTheme: {
          ...data,
          pageBackground: "#000000",
          commonBg: "#1f1f1f",
          commonTextColor: "#ffffff",
          navbarBg: "#181818",
          navbarTextColor: "#FFFFFF",
          sidebarBg: "#181818",
          sidebarTextColor: "white",
          sidebarBgHover: "white",
          sidebarTextColorHover: "#181818",
          tableRowBg: "#1f1f1f",
          tableRowTextColor: "white",
          tableRowBgHover: "white",
          tableRowTextColorHover: "#1f1f1f",
          accordionBodyBg: "#1f1f1f",
          inputBg: "#1f1f1f",
          inputTextColor: "white",
          inputBorderColor: "white",
        },
      };

      localStorage.setItem("ThemeData", encrypt(JSON.stringify(serverThemeData)));

      setUserDataSafe({ themeId });
      updateUserDetails({ themeId });

      initializeTheme();
    } catch (e) {
      console.error(e);
      toast.error("Theme change failed.");
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <Box
        style={{
          backgroundColor: "var(--commonBg)",
          color: "var(--inputTextColor)",
          fontFamily: "var(--commonFontFamily)",
          padding: "2rem",
          borderRadius: "10px",
          marginBottom: "10px",
        }}
      >
        <Typography
          variant="h6"
          className="text-[var(--inputTextColor)] text-center"
          style={{
            fontSize: "1.25rem",
            fontWeight: "var(--commonFontWeight)",
          }}
        >
          User Profile
        </Typography>

        <Grid container spacing={3}>
          <Grid
            item
            xs={12}
            sm={4}
            style={{ display: "flex", flexDirection: "column", alignItems: "center" }}
          >
            <Typography variant="body1" style={{ color: "var(--inputTextColor)", fontSize: "1rem" }}>
              {userName || "User Name"}
            </Typography>

            <Avatar
              src={profilePicture || ""}
              sx={{ width: 100, height: 100, mt: 2, mb: 2, borderRadius: "15%" }}
            />

            <input
              id="profilePictureInput"
              type="file"
              accept="image/png, image/jpeg"
              style={{ display: "none" }}
              onChange={handleProfilePictureChange}
            />

            <CustomizedButtons
              button={{ buttonName: "Upload/Change" }}
              onClickFunc={handleButtonClick.handleUploadChange}
            />
          </Grid>

          <Grid item xs={12} sm={8}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField label="Login ID" value={loginEmailId} disabled {...commonTextFieldProps} />
              </Grid>

              <Grid item xs={12} sm={6} style={{ display: "flex", alignItems: "center" }}>
                <Link
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    handleButtonClick.handleEditPassword();
                  }}
                  style={{ fontSize: "0.855rem", color: "var(--blue-color)", textDecoration: "none" }}
                >
                  Change Password?
                </Link>
              </Grid>

              <ProfileSelect
                label="Theme"
                value={profileState.theme}
                options={themeData}
                onChange={async (e) => {
                  const newThemeId = e.target.value;
                  setProfileState((prev) => ({ ...prev, theme: newThemeId }));
                  await onThemeChange(newThemeId);
                }}
              />

              <ProfileSelect
                label="Language"
                value={profileState.language}
                options={languageData}
                onChange={(e) => {
                  setProfileState((prev) => ({ ...prev, language: e.target.value }));
                }}
              />

              <Grid item xs={12} sm={6}>
                <TextField
                  label="Date Format"
                  value={dateFormat}
                  onChange={(e) => setDateFormat(e.target.value)}
                  {...commonTextFieldProps}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  label="Number Format"
                  variant="outlined"
                  size="small"
                  margin="dense"
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    "& .MuiFormLabel-root": { color: "var(--inputTextColor)" },
                    "& .MuiFormControlLabel-root": { marginRight: 2, color: "var(--inputTextColor)" },
                    "& .MuiFormControlLabel-label": { fontSize: "0.75rem", color: "var(--inputTextColor)" },
                    "& .MuiOutlinedInput-notchedOutline": { borderColor: "var(--inputBorderColor)" },
                    "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: "var(--inputBorderColor)" },
                    "& .MuiInputBase-root": { backgroundColor: "var(--inputBg)" },
                  }}
                  fullWidth
                  InputProps={{
                    style: { fontSize: "0.75rem" },
                    startAdornment: (
                      <div className="flex">
                        <RadioGroup
                          row
                          name="number-format"
                          value={numberFormat}
                          onChange={(e) => setNumberFormat(e.target.value)}
                        >
                          <div className="flex gap-4">
                            <FormControlLabel value="d" control={<Radio />} label="dot" />
                            <FormControlLabel value="c" control={<Radio />} label="comma" />
                          </div>
                        </RadioGroup>
                      </div>
                    ),
                  }}
                />
              </Grid>

              <ProfileSelect
                label="Default Company"
                value={profileState.company}
                options={companyData}
                onChange={async (e) => {
                  const newCompanyId = e.target.value;

                  setProfileState((prev) => ({
                    ...prev,
                    company: newCompanyId,
                    branch: null,
                    financialYear: null,
                  }));

                  // ✅ reload branch + FY for new company
                  const bd = await fetchBranchData(newCompanyId, 1, "", null);
                  const fd = await fetchFinancialYearData(newCompanyId, 1, "", null);

                  const firstBranch = bd?.[0]?.value ?? null;
                  const firstFY = fd?.[0]?.value ?? null;

                  setProfileState((prev) => ({
                    ...prev,
                    branch: firstBranch,
                    financialYear: firstFY,
                  }));

                  // ✅ reload Theme/Language/Menu based on company
                  await loadProfileDropdowns(newCompanyId);

                  // optional: persist immediately
                  setUserDataSafe({
                    defaultCompanyId: newCompanyId,
                    defaultBranchId: firstBranch,
                    defaultFinYearId: firstFY,
                  });
                }}
              />

              <ProfileSelect
                label="Default Branch"
                value={profileState.branch}
                options={branchData}
                onChange={(e) => setProfileState((prev) => ({ ...prev, branch: e.target.value }))}
              />

              <ProfileSelect
                label="Default Financial Year"
                value={profileState.financialYear}
                options={financialYearData}
                onChange={(e) => setProfileState((prev) => ({ ...prev, financialYear: e.target.value }))}
              />

              <ProfileSelect
                label="Default Menu"
                value={profileState.menu}
                options={menuData}
                onChange={(e) => setProfileState((prev) => ({ ...prev, menu: e.target.value }))}
              />
            </Grid>
          </Grid>
        </Grid>

        <Box sx={{ display: "flex", justifyContent: "center", mt: 3, gap: 2 }}>
          {buttonsData.map((button, index) => (
            <CustomizedButtons
              key={index}
              button={button}
              onClickFunc={handleButtonClick[button.functionOnClick]}
            />
          ))}
        </Box>
      </Box>

      <ToastContainer autoClose={4000} closeOnClick />
    </ThemeProvider>
  );
};

export default UserProfile;
