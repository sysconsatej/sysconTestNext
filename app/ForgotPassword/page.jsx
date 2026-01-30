"use client";
const baseUrl = process.env.NEXT_PUBLIC_BASE_URL_SQL;
import React, { useState } from "react";
import { Paper, TextField, Typography, IconButton } from "@mui/material";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import { MuiOtpInput } from "mui-one-time-password-input";
import { useRouter } from "next/navigation";
import CustomeModal from "@/components/Modal/customModal";
const changePasswordApi = `${baseUrl}/api/userControl/changePassword`;
import { verifyEmail, sendEmail } from "@/services/auth/Auth.services.js";
import { passwordValidator } from "@/helper";
const page = () => {
  const [edit, setEdit] = useState(false);
  const [email, setEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [otp, setOtp] = useState("");
  const [openModal, setOpenModal] = useState(false);
  const [error, setError] = useState(false);
  const [paraText, setParaText] = useState("");
  const [backendOtp, setBackendOtp] = useState("");
  const [token] = React.useState("");
  const { push } = useRouter();

  const validateEmail = (email) => {
    const re =
      // eslint-disable-next-line no-useless-escape
      /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@(([^<>()[\]\\.,;:\s@"]+\.)+[^<>()[\]\\.,;:\s@"]{2,})$/i;
    return re.test(String(email).toLowerCase());
  };
  const handleVerifyEmail = async (email) => {
    if (!email || !validateEmail(email)) {
      setOpenModal(true);
      setParaText("Please enter a valid email address.");
      setError(true);
      return;
    }

    try {
      const response = await verifyEmail(email);
      if (!response.success) {
        setOpenModal(true);
        setParaText(response.message);
        setError(true);
        return;
      }

      const resData = response.data;

      const emailBody = `<pre>Dear ${resData.name},
  
          Your account on Syscon LSS is currently disabled. To reactivate your account and regain access, please use the OTP below:
  
          Your OTP is ${resData.OTP}.
  
          If you did not request this activation, please ignore this email or contact our support team immediately.
  
          Thank you,
          Syscon Infotech Pvt Ltd Support Team</pre>`;

      const emailData = {
        from: resData.from,
        to: resData.to,
        subject: resData.subject,
        body: emailBody,
      };

      if (resData) {
        setOpenModal(true);
        setParaText("Otp sent to your registered email address");
        setError(true);
        await sendEmail(emailData);
        setBackendOtp(resData.OTP);
        setEdit(true);
      }
    } catch (error) {
      console.log("Error verifying email:", error);
      setOpenModal(true);
      setParaText(error.message || "An error occurred during verification.");
      setError(true);
    }
  };
  const handleModalClose = () => {
    setOpenModal(false);
    setError(false);
    if (paraText === "Password changed successfully") {
      push("/login");
    }
  };
  const resetPassword = async () => {
    if (backendOtp === otp) {
      try {
        const response = await fetch(changePasswordApi, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            userName: email,
            newPassword: newPassword,
            forgotPassword: true,
          }),
        });

        if (!response.ok) {
          const result = await response.json();
          console.log("Error Response", result?.message);
          setOpenModal(true);
          setParaText(result?.message);
          setError(true);
          return;
        }

        setOpenModal(true);
        setParaText("Password changed successfully");
        setError(true);
      } catch (error) {
        console.error("Network or other error", error);
      }
    } else {
      setOpenModal(true);
      setParaText("Otp incorrect");
      setError(true);
      return;
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
      await resetPassword();
    } catch (error) {
      console.error("Error checking password:", error);
    }
  };

  return (
    <div>
      <div className="text-black flex items-center justify-center w-full  min-h-screen">
        <Paper className="h-auto w-[500px] pb-6">
          <Typography className="pt-6 text-2xl text-center font-bold">
            Forgot Password?
          </Typography>
          <div className="p-4">
            {edit ? (
              <div className="flex flex-col gap-4">
                <TextField
                  label="Email/Phone Number"
                  size="small"
                  type="email"
                  required={true}
                  variant="outlined"
                  fullWidth
                  margin="normal"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />

                <MuiOtpInput
                  value={otp}
                  onChange={(newValue) => setOtp(newValue)}
                  length={6}
                  typeof="number"
                  sx={{
                    height: "10px",
                    width: "100%",
                    marginBottom: "20px",
                    "& .MuiOutlinedInput-input": {
                      height: "27px !important ",
                      padding: "0px",
                    },
                  }}
                />

                <TextField
                  id="new-password"
                  label="New Password"
                  variant="outlined"
                  className="w-full"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required={true}
                  type={showNewPassword ? "text" : "password"}
                  size="small"
                  InputProps={{
                    endAdornment: (
                      <IconButton
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        edge="end"
                      >
                        {showNewPassword ? <Visibility /> : <VisibilityOff />}
                      </IconButton>
                    ),
                  }}
                />
                <TextField
                  id="confirm-password"
                  label="Confirm Password"
                  variant="outlined"
                  className="w-full"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required={true}
                  type={showConfirmPassword ? "text" : "password"}
                  size="small"
                  InputProps={{
                    endAdornment: (
                      <IconButton
                        onClick={() =>
                          setShowConfirmPassword(!showConfirmPassword)
                        }
                        edge="end"
                      >
                        {showConfirmPassword ? (
                          <Visibility />
                        ) : (
                          <VisibilityOff />
                        )}
                      </IconButton>
                    ),
                  }}
                />
              </div>
            ) : (
              <TextField
                placeholder="Email"
                size="small"
                type="email"
                required={true}
                variant="outlined"
                fullWidth
                margin="normal"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            )}
          </div>
          <div className="px-4">
            {edit ? (
              <button
                onClick={handleResetPassword}
                className={`bg-blue-800 w-full `}
              >
                Confirm
              </button>
            ) : (
              <button
                onClick={() => handleVerifyEmail(email)}
                className={` bg-blue-800 w-full `}
              >
                Send OTP
              </button>
            )}
          </div>
        </Paper>
      </div>
      <CustomeModal
        openModal={openModal}
        setOpenModal={setOpenModal}
        onConfirm={handleModalClose}
        isError={error}
        paraText={paraText}
      />
    </div>
  );
};

export default page;
