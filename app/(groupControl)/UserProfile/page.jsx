"use client";
/* eslint-disable */
import React, { useEffect, useState } from "react";
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
  profileDropdowns,
  profileSubmit,
  themeChange,
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
  const [profileState, setProfileState] = useState({});
  const [oldProfile, setOldProfile] = useState("");
  const [numberFormat, setNumberFormat] = useState("");
  const [allDropdowns, setAllDropdowns] = useState({});
  const [dateFormat, setDateFormat] = useState("");
  const [uploadImage, setUploadImage] = useState("");
  const { initializeTheme } = useThemeProvider();
  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const storedUserData = localStorage.getItem("userData");
        if (storedUserData) {
          const decryptedData = decrypt(storedUserData);
          const userData = JSON.parse(decryptedData)[0];
          setLoginEmailId(userData.emailId);
          setUserName(userData.name);
          setLoginId(userData.id);
          const setUserData = {
            theme: userData.themeId,
            financialYear: userData.defaultFinYearId,
            company: userData.defaultCompanyId,
            branch: userData.defaultBranchId,
            menu: userData.defaultMenuId,
            language: userData.languageId,
          };
          setProfileState(setUserData);
          setNumberFormat(userData.numberFormat);
          setDateFormat(userData.dateTimeFormat);
          setProfilePicture(backendUrl + userData.profilePhoto);
          setOldProfile(userData.profilePhoto);
          const { data } = await profileDropdowns(userData?.defaultCompanyId);
          setAllDropdowns(data);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, []);

  const handleProfilePictureChange = (event) => {
    const file = event?.target?.files?.[0];
    setUploadImage(file);
    if (file) {
      setProfilePicture(URL.createObjectURL(file));
    }
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

  const handleButtonClick = {
    handleSubmit: async () => {
      try {
        const formData = new FormData();
        formData.append("avatar", uploadImage);
        formData.append("oldAvatar", oldProfile);
        formData.append("id", loginId);
        formData.append("themeId", profileState.theme);
        formData.append("languageId", profileState.language);
        formData.append("dateTimeFormat", dateFormat);
        formData.append("numberFormat", numberFormat);
        formData.append("defaultCompanyId", profileState.company);
        formData.append("defaultBranchId", profileState.branch);
        formData.append("defaultFinYearId", profileState.financialYear);
        formData.append("defaultMenuId", profileState.menu);

        const {data} = await profileSubmit(formData);
        updateUserDetails(data);
        toast.success("Update profile successfully!");

      } catch (error) {
        console.log(error);
        toast.error("Profile not updated!");
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
      document.getElementById("profilePictureInput").click();
    },
    handleEditPassword: () => {
      router.push("/LoginReset");
    },
  };

  const fieldsData = [
    {
      label: "Theme",
      name: "theme",
      onChange: "ThemeChange",
    },
    {
      label: "Language",
      name: "language",
    },
    {
      label: "Date Format",
      name: "dateFormat",
    },
    {
      label: "Number Format",
      name: "numberFormat",
    },
    {
      label: "Default Company",
      name: "company",
    },
    {
      label: "Default Branch",
      name: "branch",
    },
    {
      label: "Default Financial Year",
      name: "financialYear",
    },
    {
      label: "Default Menu",
      name: "menu",
    },
  ];

  const onChangeHandler = {
    ThemeChange: async (name, value) => {
      const { data } = await themeChange({ themeId: value });

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

      localStorage.setItem(
        "ThemeData",
        encrypt(JSON.stringify(serverThemeData))
      );

      updateUserDetails({ themeId: value });

      initializeTheme();
    },
  };

  const ProfileInputs = ({ field }) => {
    const { name, label, onChange } = field;
    return (
      <Grid item xs={12} sm={6}>
        <TextField
          select
          label={label}
          value={profileState[name]}
          onChange={(e) => {
            setProfileState((prev) => ({ ...prev, [name]: e.target.value })),
              onChange ? onChangeHandler[onChange](name, e.target.value) : null;
          }}
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
          {allDropdowns[name]?.length > 0 ? (
            allDropdowns[name]?.map((option) => (
              <MenuItem
                key={option.id}
                value={option.id}
                style={{
                  fontSize: "0.75rem",
                  color: "var(--inputTextColor)",
                  backgroundColor: "var(--inputBg)",
                }}
              >
                {option.name}
              </MenuItem>
            ))
          ) : (
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
          )}
        </TextField>
      </Grid>
    );
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
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
            }}
          >
            <Typography
              variant="body1"
              style={{ color: "var(--inputTextColor)", fontSize: "1rem" }}
            >
              {userName || "User Name"}
            </Typography>
            <Avatar
              src={profilePicture}
              sx={{
                width: 100,
                height: 100,
                mt: 2,
                mb: 2,
                borderRadius: "15%",
              }}
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
                <TextField
                  label="Login ID"
                  value={loginEmailId}
                  disabled={true}
                  {...commonTextFieldProps}
                />
              </Grid>
              <Grid
                item
                xs={12}
                sm={6}
                style={{ display: "flex", alignItems: "center" }}
              >
                <Link
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    handleButtonClick.handleEditPassword();
                  }}
                  style={{
                    fontSize: "0.855rem",
                    color: "var(--blue-color)",
                    textDecoration: "none",
                    "&:hover": { textDecoration: "underline" },
                  }}
                >
                  Change Password?
                </Link>
              </Grid>
              {fieldsData.map((field, index) => {
                if (index === 3) {
                  return (
                    <Grid item xs={12} sm={6}>
                      <TextField
                        label="Number Format"
                        variant="outlined"
                        size="small"
                        margin="dense"
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          "& .MuiFormLabel-root": {
                            color: "var(--inputTextColor)",
                          },
                          "& .MuiFormControlLabel-root": {
                            marginRight: 2,
                            color: "var(--inputTextColor)",
                          },
                          "& .MuiFormControlLabel-label": {
                            fontSize: "0.75rem",
                            color: "var(--inputTextColor)",
                          },
                          "& .MuiOutlinedInput-notchedOutline": {
                            borderColor: "var(--inputBorderColor)",
                          },
                          "&:hover .MuiOutlinedInput-notchedOutline": {
                            borderColor: "var(--inputBorderColor)",
                          },
                          "& .MuiInputBase-root": {
                            backgroundColor: "var(--inputBg)",
                          },
                        }}
                        fullWidth
                        InputProps={{
                          style: { fontSize: "0.75rem" },
                          startAdornment: (
                            <div className="flex">
                              <RadioGroup
                                row
                                sx={{
                                  display: "flex",
                                  alignItems: "center",
                                  "& .MuiFormControlLabel-root": {
                                    marginRight: 2,
                                  },
                                  "& .MuiFormControlLabel-label": {
                                    fontSize: "0.75rem",
                                  },
                                }}
                                defaultValue="format1"
                                aria-labelledby="number-format"
                                name="number-format"
                                value={numberFormat}
                                onChange={(e) => {
                                  setNumberFormat(e.target.value);
                                }}
                                {...commonTextFieldProps}
                              >
                                <div className="flex gap-4">
                                  <FormControlLabel
                                    value="d"
                                    control={<Radio />}
                                    label="dot"
                                    labelPlacement="end"
                                  />
                                  <FormControlLabel
                                    value="c"
                                    control={<Radio />}
                                    label="comma"
                                    labelPlacement="end"
                                  />
                                </div>
                              </RadioGroup>
                            </div>
                          ),
                        }}
                        InputLabelProps={{
                          style: { fontSize: "0.75rem" },
                        }}
                      />
                    </Grid>
                  );
                } else if (index === 2) {
                  return (
                    <Grid item xs={12} sm={6}>
                      <TextField
                        label="Date Format"
                        value={dateFormat}
                        onChange={(e) => setDateFormat(e.target.value)}
                        {...commonTextFieldProps}
                        SelectProps={{
                          MenuProps: {
                            PaperProps: {
                              style: {
                                backgroundColor: "var(--inputBg)",
                                color: "var(--inputTextColor)",
                              },
                            },
                          },
                        }}
                      />
                    </Grid>
                  );
                } else {
                  return <ProfileInputs field={field} />;
                }
              })}
            </Grid>
          </Grid>
        </Grid>

        <Box sx={{ display: "flex", justifyContent: "center", mt: 3, gap: 2 }}>
          {buttonsData.map((button, index) => (
            <CustomizedButtons
              key={index}
              button={button}
              onClickFunc={handleButtonClick[button.functionOnClick]}
              sx={{
                padding: "12px 24px",
                fontSize: "3rem",
                minWidth: "150px",
                minHeight: "50px",
              }}
            />
          ))}
        </Box>
      </Box>
       <ToastContainer autoClose={4000} closeOnClick />
    </ThemeProvider>
  );
};

export default UserProfile;
