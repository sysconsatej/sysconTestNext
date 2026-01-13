"use client";
/* eslint-disable */
import React, { Fragment, useEffect, useMemo, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { useRouter } from "next/navigation";
import { SvgIcon, TextField } from "@mui/material";
import Image from "next/image";
import Cookies from "js-cookie";
import InputAdornment from "@mui/material/InputAdornment";
import IconButton from "@mui/material/IconButton";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import ErrorIcon from "@mui/icons-material/Error";
import { Carousel, Spinner } from "@material-tailwind/react";

import styles from "@/app/app.module.css";
import { loginIcon } from "@/assets";
import Footer from "@/components/Footer/footer.jsx";
import CustomeModal from "@/components/Modal/customModal";
import NewsSlider from "./NewsSlider";

import { decrypt, encrypt } from "@/helper/security";
import {
  getLocationAndLogin,
  sendEmail,
  changeDevice,
} from "@/services/auth/Auth.services.js";
import { useThemeProvider } from "@/context/themeProviderDataContext";
import { fetchReportData } from "@/services/auth/FormControl.services";

const expiryTime = process.env.NEXT_PUBLIC_EXPIRY_TIME;
const activeUrl = process.env.NEXT_PUBLIC_FRONTEND_URL;
const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;

const defaultImages = [
  "/api/loginPage/20240709150124pexels-tomfisk-3856440.jpg",
  "/api/loginPage/20240709150207john-simmons-N7_NUUtCkDU-unsplash.jpg",
  "/api/loginPage/20240709150330bernd-dittrich-1RfKk7nhxE4-unsplash.jpg",
];

export default function LoginPage() {
  const { push } = useRouter();
  const [rememberMe, setRememberMe] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);
  const [isLogin, setIsLogin] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [capsOn, setCapsOn] = useState(false);

  const { control, handleSubmit, setValue } = useForm({
    defaultValues: { userName: "", password: "" },
  });

  const [openModal, setOpenModal] = useState(false);
  const [loginMessage, setLoginMessage] = useState("");
  const [isError, setIsError] = useState(false);
  const [typeofModal, setTypeofModal] = useState(null);
  const [userData, setUserData] = useState({});
  const { initializeTheme } = useThemeProvider();

  const clientCode = useMemo(() => {
    if (typeof window === "undefined") return null;
    const parts = window.location.hostname.split(".");
    const sub = parts?.[0] || "";
    if (sub === "localhost") return null;
    if (/^\d+$/.test(sub)) return null;
    return sub || null;
  }, []);

  const onConfirm = async (conformData) => {
    try {
      if (conformData?.type === "onClose") {
        await changeDevice(userData.emailId, userData.token);
        setErrorMessage("");
        setIsLogin(true);
        setOpenModal(false);
        push("/dashboard");
      }
    } catch (e) {
      console.error("onConfirm error", e);
    }
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
    const hours = Number(expiryTime || 0) * 60 * 60 * 1000;
    const nextEmailTime = Number(currentTimestamp) + Number(hours);

    const combined = `${data?.[0]?.id || ""}|${nextEmailTime}`;
    const combinedHash = encrypt(combined);

    const activationLink = `${activeUrl}/active/${encodeURIComponent(
      combinedHash
    )}`;

    const emailBody = `<pre>Dear ${data?.[0]?.name || ""},

Your account on Syscon LSS is currently disabled. To reactivate your account and regain access, please click the link below:

<a href="${activationLink}" target="_blank">Activate My Account</a>

This activation link is valid for ${expiryTime} hours.

If you did not request this activation, please ignore this email or contact our support team immediately.

Thank you,
Syscon Infotech Pvt Ltd Support Team</pre>`;

    const emailData = {
      from: "rohitanabhavane26@gmail.com",
      to: val,
      subject: "Activation Mail",
      body: emailBody,
    };

    sendEmail(emailData);
  };

  const saveRememberMe = (formData) => {
    try {
      if (rememberMe) {
        const payload = encrypt(
          JSON.stringify({
            userName: formData.userName,
            password: formData.password,
            rememberMe: true,
          })
        );
        localStorage.setItem("loginCredentials", payload);
      } else {
        localStorage.removeItem("loginCredentials");
      }
    } catch (e) {
      console.error("rememberMe save error", e);
    }
  };

  const onSubmit = async (formData) => {
    try {
      if (isLogin) return;

      const setLoginData = { ...formData, clientCode };
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
        setUserData({ token, emailId });
        initializeTheme();
        return;
      }

      if (
        result ===
        "Your account status is disabled. We have sent you an activation email. Kindly click on the activation link to activate your account."
      ) {
        setErrorMessage(result);
        emailTimer(formData.userName);
        return;
      }

      if (result === "Email can only be sent once every 2 hours.") {
        setErrorMessage(result);
        return;
      }

      if (result === true) {
        setErrorMessage("");
        saveRememberMe(formData);
        setIsLogin(true);
        push("/dashboard");
        initializeTheme();
        return;
      }

      setErrorMessage(result);
    } catch (e) {
      console.error("error", e);
      setErrorMessage("Something went wrong. Please try again.");
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("token") && Cookies.get("token");
    if (token) push("/dashboard");
    else localStorage.clear();

    const storedUserData = localStorage.getItem("loginCredentials");
    if (storedUserData) {
      const loginCredentials = JSON.parse(decrypt(storedUserData));
      setRememberMe(!!loginCredentials?.rememberMe);
      setValue("userName", loginCredentials?.userName || "");
      setValue("password", loginCredentials?.password || "");
    }
  }, [push, setValue]);

  const handleCapsCheck = (e) => {
    try {
      setCapsOn(!!e?.getModifierState?.("CapsLock"));
    } catch {}
  };
  const handleCapsClear = () => setCapsOn(false);

  return (
    <Fragment>
      {/* ✅ lock viewport, no scroll */}
      <div
        className={`relative h-[100svh] w-full overflow-hidden ${styles.hideScrollbar}`}
      >
        {/* ✅ HERO */}
        <div className="absolute inset-0" id="loginBg">
          <Carousel
            autoplay={true}
            loop={true}
            number={4000}
            transition={{ duration: 1 }}
            prevArrow={false}
            nextArrow={false}
            navigation={false}
            className="h-full w-full"
          >
            {defaultImages?.map((image, index) => (
              <img
                key={index}
                src={`${baseUrl}${image}`}
                alt="image"
                className="h-full w-full object-cover object-center"
              />
            ))}
          </Carousel>

          {/* ✅ overlay */}
          <div className="absolute inset-0 bg-black/20" />
          <div className="absolute inset-0 bg-gradient-to-b from-black/25 via-transparent to-black/35" />
        </div>

        {/* ✅ content layer */}
        <div className="relative z-10 h-full">
          {/* ✅ Login card positioning */}
          <div className="absolute inset-0 px-3 sm:px-4">
            {/*
              ✅ REQUIRED BY YOU
              - mobile: center
              - tablet: center (and NO news)
              - xl+: top-right (keep LG/desktop original behavior)
            */}
            <div className="h-full flex items-center justify-center xl:block">
              <div
                className="
                  w-full max-w-[420px] sm:max-w-[440px] md:max-w-[520px] lg:max-w-[560px]
                  p-3 sm:p-4 md:p-5
                  rounded-lg shadow
                  bg-gray-100 bg-opacity-60 backdrop-blur-[14px]
                  relative
                  xl:absolute xl:top-16 xl:right-12
                  xl:w-1/4 xl:max-w-none
                "
              >
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                  <div className="flex justify-end">
                    <Image
                      src={loginIcon}
                      alt="Logo"
                      className="w-36 h-[2rem] object-cover"
                      priority
                    />
                  </div>

                  <Controller
                    name="userName"
                    control={control}
                    defaultValue=""
                    render={({ field }) => (
                      <TextField
                        {...field}
                        label="Email Address"
                        type="email"
                        size="small"
                        variant="outlined"
                        className="w-full"
                        sx={{
                          "& .MuiOutlinedInput-input": {
                            height: "10px !important ",
                          },
                          "& .MuiInputLabel-root": { position: "absolute" },
                        }}
                        required
                        InputProps={{ classes: { root: "inputRootStyle" } }}
                        InputLabelProps={{
                          classes: {
                            asterisk: "required-asterisk",
                            root: "labelRootStyle",
                          },
                        }}
                      />
                    )}
                    rules={{ required: "Username is required" }}
                  />

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
                          required
                          onKeyDown={handleCapsCheck}
                          onKeyUp={handleCapsCheck}
                          onFocus={handleCapsCheck}
                          onBlur={handleCapsClear}
                          InputProps={{
                            classes: { root: "inputRootStyle" },
                            endAdornment: (
                              <InputAdornment position="end">
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

                        {capsOn && (
                          <div className="rounded-lg bg-amber-50/90 border border-amber-200 px-3 py-2">
                            <p className="text-amber-800 text-[12px] flex items-start gap-2">
                              <span className="mt-[2px] inline-block h-2 w-2 rounded-full bg-amber-500" />
                              Caps Lock is ON
                            </p>
                          </div>
                        )}

                        {errorMessage && (
                          <div className="rounded-lg bg-red-50/80 border border-red-200 px-3 py-2">
                            <p className="text-red-800 flex items-start gap-2 text-[12px]">
                              <SvgIcon
                                component={ErrorIcon}
                                sx={{ mt: "2px" }}
                              />
                              <span className="break-words">
                                {errorMessage}
                              </span>
                            </p>
                          </div>
                        )}
                      </>
                    )}
                    rules={{ required: "Password is required" }}
                  />

                  <button
                    type="submit"
                    className="flex items-center justify-center bg-blue-500 text-white rounded h-[32px] sm:h-[34px] md:h-[36px] text-[13px] px-4 w-full hover:bg-blue-600 disabled:opacity-70 disabled:cursor-not-allowed"
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

                  <div className="flex items-center justify-between">
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={rememberMe}
                        onChange={() => setRememberMe(!rememberMe)}
                        className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                      />
                      <span
                        className="text-[12px]"
                        style={{ color: "#1C2861" }}
                      >
                        Remember me
                      </span>
                    </label>

                    <button
                      type="button"
                      onClick={() => push("/ForgotPassword")}
                      className="text-[12px] transition-colors cursor-pointer hover:text-gray-900"
                      style={{ color: "#0766AD", opacity: 1 }}
                    >
                      Forgot Password/Username?
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>

          {/* ✅ News slider ONLY on xl+ (removed for tablets as requested) */}
          <div className="hidden xl:block absolute left-0 right-0 z-20 bottom-[72px]">
            <div className="mx-auto max-w-6xl px-6">
              <div className="rounded-3xl bg-black/18 backdrop-blur-md p-3 border border-white/20 shadow-[0_14px_60px_rgba(0,0,0,0.35)]">
                <NewsSlider />
              </div>
            </div>
          </div>
        </div>

        {/* ✅ Footer on md+ (as you had) */}
        <div className="hidden md:block">
          <Footer />
        </div>

        <CustomeModal
          setOpenModal={setOpenModal}
          openModal={openModal}
          onConfirm={onConfirm}
          isError={isError}
          paraText={loginMessage}
          typeEvent={typeofModal}
        />
      </div>
    </Fragment>
  );
}
