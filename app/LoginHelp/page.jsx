"use client";
const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;
import React, { useState, useEffect } from "react";
import { Paper, TextField, Typography, IconButton } from "@mui/material";
import styles from "@/app/app.module.css";
import { MuiOtpInput } from "mui-one-time-password-input";
import { textInputStyle3 } from "@/app/globalCss";
import { useRouter } from "next/navigation";
import CustomeModal from "@/components/Modal/customModal";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import { passwordValidator } from "@/helper";

const ForgotPasswordOrUsername = () => {
  const { push } = useRouter();
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [show, setShow] = useState(false);
  const [edit, setEdit] = useState(false);
  const [user, setUser] = useState("");
  const [token, setToken] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [openModal, setOpenModal] = useState(false);
  const [paraText, setParaText] = useState("");
  const [error, setError] = useState(false);
  const [timer, setTimer] = useState(0); // Add timer state
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false); // State to toggle new password visibility
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useEffect(() => {
    let interval;
    if (timer > 0) {
      interval = setInterval(() => {
        setTimer((prevTimer) => prevTimer - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [timer]);

  const handleResendClick = () => {
    handleEmailsubmit();
    setTimer(60);
  };

  const getOtpApi = `${baseUrl}/api/userControl/forgotPassword`;
  const verifyOtpApi = `${baseUrl}/api/userControl/verifyOtp`;
  const chnagePasswordApi = `${baseUrl}/api/userControl/changePassword`;

  const validateEmail = (email) => {
    const re =
      // eslint-disable-next-line no-useless-escape
      /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@(([^<>()[\]\\.,;:\s@"]+\.)+[^<>()[\]\\.,;:\s@"]{2,})$/i;
    return re.test(String(email).toLowerCase());
  };

  const handleEmailsubmit = async () => {
    if (!email || !validateEmail(email)) {
      setOpenModal(true);
      setParaText("Please enter a valid email address.");
      setError(true);
      return;
    }

    try {
      const response = await fetch(getOtpApi, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userName: email }),
      });

      if (!response.ok) {
        // Check if the response was not ok
        const result = await response.json(); // Attempt to parse the error message
        setOpenModal(true);
        setParaText(result?.message);
        setError(true);
        return; // Exit the function early
      }

      // If the response is ok, then process the result
      setTimer(60);
      setOpenModal(true);
      setParaText(" 6 digit  OTP has been sent to your email ");

      setShow(true);
      setError(true);
    } catch (error) {
      console.error("Network or other error", error);
      // Handle network error or error during parsing the response
    }
  };

  const handleVerifyOtp = async () => {
    if (!otp || otp.length !== 6) {
      setOpenModal(true);
      setParaText("OTP must be 6 digits long.");
      setError(true);
      return;
    }
    try {
      const response = await fetch(verifyOtpApi, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userName: email,
          otp: otp,
        }),
      });

      if (!response.ok) {
        // Check if the response was not ok
        const result = await response.json(); // Attempt to parse the error message
        setOpenModal(true);
        setParaText("Error: " + result?.message);
        setError(true);
        return; // Exit the function early
      }
      // If the response is ok, then process the result
      const result = await response.json();
      setUser(result?.data[0].email);
      setToken(result.token);

      setEdit(true);
      setOpenModal(true);
      setParaText(result?.message);
      setError(true);
    } catch (error) {
      console.error("Network or other error", error);
      // Handle network error or error during parsing the response
    }
  };

  const handleResetPassword = async () => {
    const passwordError = passwordValidator(newPassword);
    if (passwordError) {
      setOpenModal(true);
      setParaText(passwordError);
      setError(true);
      return;
    }

    if (newPassword !== confirmPassword) {
      setOpenModal(true);
      setParaText("Passwords do not match.");
      setError(true);
      return;
    }
    try {
      const response = await fetch(chnagePasswordApi, {
        // Make sure the variable name is correct (`changePasswordApi`)
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          userName: user,
          newPassword: newPassword,
          forgotPassword: true,
        }),
      });

      if (!response.ok) {
        // Check if the response was not ok
        const result = await response.json(); // Attempt to parse the error message
        console.log("Error Response", result?.message);
        setOpenModal(true);
        setParaText(result?.message);
        setError(true);
        return; // Exit the function early
      }

      // If the response is ok, then process the result
      setOpenModal(true);
      setParaText("Password changed successfully");
      setError(true);
      push("/login");
    } catch (error) {
      console.error("Network or other error", error);
      // Handle network error or error during parsing the response
    }
  };

  const handle = show ? handleVerifyOtp : handleEmailsubmit;

  return (
    <>
      <div className="text-black flex items-center justify-center w-full  min-h-screen">
        <Paper className="h-auto w-[500px] pb-6">
          <Typography className="pt-6 text-2xl text-center font-bold">
            {edit ? "Set your new Password " : "Forgot Password?"}
          </Typography>
          <div className="p-4">
            {edit ? (
              <div className="flex flex-col gap-4">
                <TextField
                  id="new-password"
                  label="New Password"
                  variant="outlined"
                  className="w-full"
                  sx={textInputStyle3({})}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required={true}
                  type={showNewPassword ? "text" : "password"}
                  size="small"
                  InputProps={{
                    // Add visibility toggle button
                    endAdornment: (
                      <IconButton
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        edge="end"
                      >
                        {showNewPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    ),
                  }}
                />
                <TextField
                  id="confirm-password"
                  label="Confirm Password"
                  variant="outlined"
                  className="w-full"
                  sx={textInputStyle3({})}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required={true}
                  type={showConfirmPassword ? "text" : "password"}
                  size="small"
                  InputProps={{
                    // Add visibility toggle button
                    endAdornment: (
                      <IconButton
                        onClick={() =>
                          setShowConfirmPassword(!showConfirmPassword)
                        }
                        edge="end"
                      >
                        {showConfirmPassword ? (
                          <VisibilityOff />
                        ) : (
                          <Visibility />
                        )}
                      </IconButton>
                    ),
                  }}
                />
              </div>
            ) : (
              <TextField
                label="Email/Phone Number"
                size="small"
                type="email"
                required={true}
                sx={{
                  ...textInputStyle3({}),
                }}
                variant="outlined"
                fullWidth
                margin="normal"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            )}

            {show && !edit && (
              <MuiOtpInput
                value={otp}
                onChange={(newValue) => setOtp(newValue)}
                length={6}
                typeof="number"
                sx={{
                  height: "10px",
                  width: "100%",
                  marginTop: "20px",
                  "& .MuiOutlinedInput-input": {
                    height: "27px !important ",
                    padding: "0px",
                  },
                }}
              />
            )}
          </div>
          <div className="px-4">
            {edit ? (
              <button
                onClick={handleResetPassword}
                className={`${styles.commonBtn} w-full `}
              >
                Confirm
              </button>
            ) : (
              <button
                onClick={handle}
                className={`${styles.commonBtn} w-full `}
              >
                {!show ? "Send Otp" : "Submit"}
              </button>
            )}
          </div>
          {!edit && show && (
            <p className="text-[12px] px-4 mt-2">
              {"If you don't receive a code!"}{" "}
              {timer > 0 ? (
                <span className="text-red-600">Resend in {timer}s</span>
              ) : (
                <span
                  className="text-red-600 cursor-pointer"
                  onClick={handleResendClick}
                >
                  Resend
                </span>
              )}
            </p>
          )}
        </Paper>
      </div>
      <CustomeModal
        openModal={openModal}
        setOpenModal={setOpenModal}
        onConfirm={() => {
          setOpenModal(false);
        }} // Pass the function to execute on confirmation
        isError={error} // Set based on your needs, e.g., from an error state in your component
        paraText={paraText}
      />
    </>
  );
};

export default ForgotPasswordOrUsername;
