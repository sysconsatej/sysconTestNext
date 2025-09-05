"use client";
/* eslint-disable */
import React, { Fragment } from "react";
import { useState, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { useRouter } from "next/navigation";
import { SvgIcon } from "@mui/material";
import { loginIcon } from "@/assets";
import Image from "next/image";
import styles from "@/app/app.module.css";
import { TextField } from "@mui/material";
import Footer from "@/components/Footer/footer.jsx";
import ErrorIcon from "@mui/icons-material/Error";
import { Carousel } from "@material-tailwind/react";
import Cookies from "js-cookie";
import InputAdornment from "@mui/material/InputAdornment";
import Visibility from "@mui/icons-material/Visibility";
import IconButton from "@mui/material/IconButton";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import { decrypt, encrypt } from "@/helper/security";
import { Spinner } from "@material-tailwind/react";
import {
  getLocationAndLogin,
  sendEmail,
  changeDevice,
} from "@/services/auth/Auth.services.js";
import CustomeModal from "@/components/Modal/customModal";
import NewsSlider from "./NewsSlider";
import { useThemeProvider } from "@/context/themeProviderDataContext";
import { fetchReportData } from "@/services/auth/FormControl.services";
const expiryTime = process.env.NEXT_PUBLIC_EXPIRY_TIME;
const activeUrl = process.env.NEXT_PUBLIC_FRONTEND_URL;

const defaultImages = [
  "api/loginPage/20240709150124pexels-tomfisk-3856440.jpg",
  "/api/loginPage/20240709150207john-simmons-N7_NUUtCkDU-unsplash.jpg",
  "/api/loginPage/20240709150330bernd-dittrich-1RfKk7nhxE4-unsplash.jpg",
];

export default function LoginPage() {
  const { push } = useRouter();
  const [rememberMe, setRememberMe] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);
  const [isLogin, setIsLogin] = useState(false);
  const [showPassword, setShowPassword] = React.useState(false);
  const { control, handleSubmit, setValue } = useForm();
  const [inData, setInData] = useState("");
  const [openModal, setOpenModal] = useState(false);
  const [loginMessage, setLoginMessage] = useState("");
  const [isError, setIsError] = useState(false);
  const [typeofModal, setTypeofModal] = useState(null);
  const [userData, setUserData] = useState({});
  const { initializeTheme } = useThemeProvider();

  const onConfirm = (conformData) => {
    async function helper() {
      if (conformData?.type === "onClose") {
        await changeDevice(userData.emailId, userData.token);
        setErrorMessage("");
        setIsLogin(true);
        setOpenModal(false);
        push("/dashboard");
      }
    }

    helper();
  };

  const emailTimer = async (val) => {
    const requestBodyUser = {
      columns: "id,name",
      tableName: "tblUser",
      whereCondition: `emailId = '${val}'`,
      clientIdCondition: `status = 1 FOR JSON PATH`,
    };

    const { data } = await fetchReportData(requestBodyUser);

    const currentTimestamp = Date.now();
    const hours = expiryTime * 60 * 60 * 1000;
    const nextEmailTime = parseInt(currentTimestamp) + parseInt(hours);

    const combined = data[0].id + "|" + nextEmailTime;
    const combinedHash = encrypt(combined);

    const activationLink = `${activeUrl}/active/${encodeURIComponent(
      combinedHash
    )}`;

    const emailBody = `<pre>Dear ${data[0].name},
  
      Your account on Syscon LSS is currently disabled. To reactivate your account and regain access, please click the link below:
            
      <a href="${activationLink}" target="_blank" >Activate My Account</a>
  
      This activation link is valid for ${expiryTime} hours.
            
      If you did not request this activation, please ignore this email or contact our support team immediately.
            
      Thank you,
      Syscon Infotech Pvt Ltd Support Team</pre>`;
    const emailData = {
      from: "aakashvishwakarmarm4001@gmail.com",
      to: val,
      subject: "Activation Mail",
      body: emailBody,
    };

    sendEmail(emailData);
  };

  const onSubmit = async (data) => {
    try {
      if (isLogin) {
        return;
      }
      const hostname = typeof window !== "undefined" ? window.location.hostname.split('.') : "";
      const checkHostName = hostname[0] == 'localhost'? null : /^\d+$/.test(hostname[0])  ? null : hostname[0];
      const setLoginData = {
          ...data,
          clientCode : checkHostName,
      }
      const { result, token, emailId } = await getLocationAndLogin(
        setLoginData,
        rememberMe
      );

      if (result === "60DaysResetPassword") {
        setErrorMessage("60DaysResetPassword");
        push("/LoginReset");
        initializeTheme();
        return;
      }

      if (result === "active") {
        setTypeofModal("onClose");
        setLoginMessage(
          "The user is already logged in. Are you sure you want to log in on this device?"
        );
        setOpenModal(true);
        setUserData({ token: token, emailId: emailId });
        onConfirm();
        initializeTheme();
        return;
      }

      if (
        result ===
        "Your account status is disabled. We have sent you an activation email. Kindly click on the activation link to activate your account."
      ) {
        setErrorMessage(
          "Your account status is disabled. We have sent you an activation email. Kindly click on the activation link to activate your account."
        );
        emailTimer(data.userName);
        return;
      }

      if (result === "Email can only be sent once every 2 hours.") {
        setErrorMessage("Email can only be sent once every 2 hours.");
        return;
      }

      if (result === true) {
        setErrorMessage("");
        setIsLogin(true);
        push("/dashboard");
        initializeTheme();
        return;
      }
      setErrorMessage(result);
    } catch (e) {
      console.error("error", e);
    }
  };

  useEffect(() => {
    const isUserExist = () => {
      const token = localStorage.getItem("token") && Cookies.get("token");

      if (token) {
        push("/dashboard");
      } else {
        localStorage.clear();
      }
      const storedUserData = localStorage.getItem("loginCredentials");
      if (storedUserData) {
        const loginCredentials = JSON.parse(decrypt(storedUserData));
        console.log("loginCredentials", loginCredentials);
        setRememberMe(loginCredentials?.rememberMe);
        setValue("userName", loginCredentials?.userName);
        setValue("password", loginCredentials?.password);
      }
    };
    isUserExist();
  }, []);

  return (
    <Fragment>
      <div className={`min-h-screen relative ${styles.hideScrollbar}  `}>
        <div className={`h-fit `}>
          <div
            className="flex justify-center items-center h-[35rem] "
            id="loginBg"
          >
            <Carousel
              autoplay={true}
              loop={true}
              number={4000}
              transition={{ duration: 1 }}
              prevArrow={false}
              nextArrow={false}
              navigation={false}
              className="overflow-hidden h-full w-full"
            >
              {defaultImages?.map((image, index) => (
                <img
                  className="overflow-hidden object-center"
                  key={index}
                  src={`https://expresswayshipping.com/sql-api/${image}`}
                  alt="image"
                />
              ))}
            </Carousel>
            <div className="w-auto sm:w-auto md:w-1/3 lg:w-1/4 xl:w-1/4 p-3 rounded-lg shadow absolute top-16 right-12 bg-gray-100 bg-opacity-50   backdrop-blur-[14px] ">
              <form
                onSubmit={handleSubmit(onSubmit)}
                className="space-y-4 z-20"
              >
                <div className="flex justify-end">
                  <Image
                    src={loginIcon}
                    alt="Logo"
                    className="w-36 h-[2rem] object-cover"
                    priority
                  />
                </div>

                <div className="mb-6 b w-full sm:mb-4 md:mb-6 lg:mb-6 xl:mb-6">
                  <Controller
                    name="userName"
                    control={control}
                    defaultValue=""
                    value={inData}
                    onChange={(e) => setInData(e.target.value)}
                    render={({ field }) => (
                      <>
                        <TextField
                          {...field}
                          label="Email Address"
                          type="email"
                          id="outlined-size-small-second"
                          size="small"
                          variant="outlined"
                          className="w-full"
                          sx={{
                            "& .MuiOutlinedInput-input": {
                              height: "10px !important ",
                            },
                            "& .MuiInputLabel-root": {
                              position: "absolute",
                            },
                          }}
                          required={true}
                          InputProps={{
                            classes: {
                              root: "inputRootStyle",
                            },
                          }}
                          InputLabelProps={{
                            classes: {
                              asterisk: "required-asterisk",
                              root: "labelRootStyle",
                            },
                          }}
                        />
                      </>
                    )}
                    rules={{ required: "Username is required" }}
                  />
                </div>

                <div className="mb-4 sm:mb-3 md:mb-4 lg:mb-4 xl:mb-4">
                  <Controller
                    name="password"
                    control={control}
                    defaultValue=""
                    render={({ field }) => (
                      <>
                        <TextField
                          {...field}
                          label="Password"
                          type={showPassword ? "text" : "password"}
                          id="outlined-size-small-first"
                          size="small"
                          variant="outlined"
                          sx={{
                            "& .MuiOutlinedInput-input": {
                              padding: "0px !important",
                              height: "27px !important ",
                              paddingLeft: "14px !important",
                            },
                          }}
                          className="w-full"
                          required={true}
                          InputProps={{
                            classes: { root: "inputRootStyle" },
                            endAdornment: (
                              <InputAdornment>
                                <IconButton
                                  onClick={() => setShowPassword(!showPassword)}
                                >
                                  {showPassword ? (
                                    <VisibilityOff />
                                  ) : (
                                    <Visibility />
                                  )}
                                </IconButton>
                              </InputAdornment>
                            ),
                          }}
                          InputLabelProps={{
                            classes: {
                              asterisk: "required-asterisk",
                              root: "labelRootStyle",
                            },
                          }}
                        />
                        {errorMessage && (
                          <p className="mt-0 text-red-800 relative top-[8px] flex items-center text-[14px] gap-1 font-normal lowercase ">
                            <SvgIcon component={ErrorIcon} />
                            {errorMessage}
                          </p>
                        )}
                      </>
                    )}
                    rules={{ required: "Password is required" }}
                  />
                </div>

                <div className="mb-5">
                  <button
                    type="submit"
                    className=" flex items-center justify-center bg-blue-500 text-white rounded h-[24px] text-[13px] p-[10px] w-full hover:bg-blue-600"
                    style={{ opacity: 1, cursor: "pointer" }}
                    disabled={isLogin}
                  >
                    {isLogin ? (
                      <Spinner
                        style={{
                          width: "20px !important",
                          height: "20px !important",
                        }}
                        color="gray"
                      />
                    ) : (
                      "Login"
                    )}
                  </button>
                </div>

                <div className="mb-5 ml-1">
                  <div className="flex items-center">
                    <input
                      id="link-checkbox"
                      type="checkbox"
                      checked={rememberMe}
                      onChange={() => setRememberMe(!rememberMe)}
                      value=""
                      className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                    />
                    <label
                      htmlFor="link-checkbox"
                      className="ms-2 text-[12px] dark:text-gray-300"
                      style={{ color: "#1C2861" }}
                    >
                      Remember me
                    </label>
                  </div>
                </div>
                <div className="mb-4 ml-1 ">
                  <button
                    type="button"
                    onClick={() => push("/ForgotPassword")}
                    className="text-[12px] transition-colors cursor-pointer  hover:text-gray-900"
                    style={{ color: "#0766AD", opacity: 1 }}
                  >
                    Forgot Password/Username?
                  </button>
                </div>
              </form>
            </div>
          </div>
          <NewsSlider />
          <div className="">
            <Footer />
          </div>
        </div>
      </div>
      <CustomeModal
        setOpenModal={setOpenModal}
        openModal={openModal}
        onConfirm={onConfirm}
        isError={isError}
        paraText={loginMessage}
        typeEvent={typeofModal}
      />
    </Fragment>
  );
}
