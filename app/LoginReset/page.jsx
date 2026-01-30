"use client";
const baseUrl = process.env.NEXT_PUBLIC_BASE_URL_SQL;

import React, { useEffect, useState } from "react";
import { decrypt } from "@/helper/security";
import { Paper, TextField, Typography, IconButton } from "@mui/material";
import { textInputStyle3 } from "@/app/globalCss";
import styles from "@/app/app.module.css";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import CustomeModal from "@/components/Modal/customModal";
const resetPasswordApi = `${baseUrl}/api/userControl/resetPassword`;
import { useRouter } from "next/navigation";
import { passwordValidator } from "@/helper";
import Cookies from "js-cookie";

const page = () => {
  const [newPassword, setNewPassword] = React.useState("");
  const [confirmPassword, setConfirmPassword] = React.useState("");
  const [showNewPassword, setShowNewPassword] = React.useState(false);
  const [showOldPassword, setShowOldPassword] = React.useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = React.useState(false);
  const [openModal, setOpenModal] = React.useState(false);
  const [userDetails, setUserDetails] = useState({});
  const [paraText, setParaText] = React.useState("");
  const [error, setError] = React.useState(false);
  const [token] = React.useState("");
  const { push } = useRouter();
  const [oldPassword, setOldPassword] = useState("");
  const [showSecurityMessage, setShowSecurityMessage] = useState(false);

  useEffect(() => {
    const storedUserData = localStorage.getItem("userData");
    // console.log("stored", storedUserData);
    if (storedUserData) {
      const userData = JSON.parse(decrypt(storedUserData));
      setUserDetails(userData);

      // Calculate the date difference
      const passwordLastUpdateDate = new Date(
        userData[0].passwordLastUpdateDate,
      );
      const currentDate = new Date();
      const dateDifference = Math.floor(
        (currentDate - passwordLastUpdateDate) / (1000 * 60 * 60 * 24),
      );
      // Show the message if 60 days have passed
      if (dateDifference >= 60) {
        setShowSecurityMessage(true);
      }
    }
  }, []);

  useEffect(() => {
    const storedUserData = localStorage.getItem("userData");
    if (storedUserData) {
      setUserDetails(JSON.parse(decrypt(storedUserData)));

      console.log(userDetails);
    }
  }, []);

  useEffect(() => {
    if (userDetails && Object.keys(userDetails).length !== 0) {
      localStorage.setItem("userDetails", JSON.stringify(userDetails));
    } else if (userDetails === undefined) {
      // Handle the case when userDetails is undefined
      console.log("userDetails is undefined");
    }
  }, []);


  function clearToken() {
        localStorage.clear();
        Cookies.remove("token");
        push("/login");
      }

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
      const response = await fetch(resetPasswordApi, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          emailId: userDetails[0].emailId,
          oldPassword: oldPassword,
          newPassword: newPassword,
        }),
      });

      const result = await response.json();

      if (!result.success) {
        console.log("Error Response", result?.error);
        setOpenModal(true);
        setParaText(result?.error);
        setError(true);
        return;
      } else {
        setOpenModal(true);
        setParaText("Password changed successfully");
        setError(true);
        clearToken();
        return;
      }
    } catch (error) {
      console.error("Network or other error", error);
    }
  };

  const handleModalClose = () => {
    setOpenModal(false);
    setError(false);
    if (paraText === "Password changed successfully") {
      push("/dashboard");
    }
  };

  return (
    <>
      <div className="text-black flex items-center justify-center w-full  min-h-screen">
        <Paper className="h-auto w-[500px] pb-6">
          <Typography
            className="pt-6 text-2xl text-center"
            style={{ fontWeight: "bold" }}
          >
            Reset Password
          </Typography>

          {showSecurityMessage && (
            <Typography className="pt-4 px-6 text-xs text-center">
              To enhance your account security! Please update your password, as
              it has been 60 days since your last change.
            </Typography>
          )}

          <div className="p-4">
            <div className="flex flex-col gap-4">
              <TextField
                id="old-password"
                label="Old Password"
                variant="outlined"
                className="w-full"
                sx={textInputStyle3({})}
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
                required={true}
                type={showOldPassword ? "text" : "password"}
                size="small"
                InputProps={{
                  // Add visibility toggle button
                  endAdornment: (
                    <IconButton
                      onClick={() => setShowOldPassword(!showOldPassword)}
                      edge="end"
                    >
                      {showNewPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  ),
                }}
              />
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
                      {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  ),
                }}
              />
            </div>
          </div>
          <div className="px-4">
            <button
              //  onClick={handleResetPassword}
              onClick={handleResetPassword}
              className={`${styles.commonBtn} w-full `}
            >
              Submit
            </button>
          </div>
        </Paper>
      </div>
      <CustomeModal
        openModal={openModal}
        setOpenModal={setOpenModal}
        onConfirm={handleModalClose} // Pass the function to execute on confirmation
        isError={error}
        paraText={paraText}
      />
    </>
  );
};

export default page;
