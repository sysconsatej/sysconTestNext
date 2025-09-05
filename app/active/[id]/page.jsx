"use client";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react"; // Make sure to import useState here
import React from "react";
import { decrypt } from "@/helper/security";
import { clearPassByRedis } from "@/services/auth/Auth.services";

const Page = () => {
  const [isLoading, setIsLoading] = useState(true); // Add loading state
  const [isExpiredState, setIsExpiredState] = useState(null);
  const { id } = useParams();
  const router = useRouter();

  let decryptedData;
  try {
    const decodedId = decodeURIComponent(id);
    decryptedData = decrypt(decodedId);
  } catch (error) {
    console.error("Decryption error:", error);
    return <div>Error decrypting data</div>;
  }

  function splitString(input) {
    const parts = input.split("|");
    if (parts.length === 2) {
      return {
        uid: parts[0],
        timeStamp: parts[1],
      };
    } else {
      throw new Error(
        'Input string does not contain exactly one "|" separator.'
      );
    }
  }

  const { uid, timeStamp } = splitString(decryptedData);

  useEffect(() => {
    const checkExpiration = () => {
      const currentTimestamp = Date.now();
      const expirationCheck = timeStamp - currentTimestamp;
      setIsExpiredState(expirationCheck > 0);
      setIsLoading(false);

      if (expirationCheck > 0) {
        clearPassByRedis(uid);
      }
    };

    checkExpiration();
  }, [timeStamp, uid]);

  function handleOkClick() {
    router.push("/login");
  }

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="h-[100vh] w-[100vw] flex items-center justify-center">
      {isExpiredState === true ? (
        <div className="bg-[rgb(28,100,242)] h-[30vh] w-[40vw] flex justify-center items-center border border-blue-400 rounded text-white text-sm p-4 flex items-start">
          <div className="w-full flex flex-col items-center justify-center">
            <div className="flex flex-col items-center">
              <div className="font-bold">Congratulations!</div>
              <div className="mt-4">
                Your account has been successfully activated, kindly login to
                continue!
              </div>
            </div>
            <button
              className="border-blue-400 bg-white hover:bg-gray-50 px-4 py-2 mt-4 border rounded font-bold text-[rgb(28,100,242)]"
              onClick={handleOkClick}
            >
              Ok
            </button>
          </div>
        </div>
      ) : (
        <div className="bg-[rgb(28,100,242)] h-[30vh] w-[40vw] flex justify-center items-center border border-blue-400 rounded text-white text-sm p-4 flex items-start">
          <div className="w-full flex flex-col items-center">
            <div className="flex flex-col items-center">
              <div className="font-bold">Oops!</div>
              <div className="mt-4">
                The link has expired, kindly try logging in again to regenerate
                the link.
              </div>
            </div>
            <button
              className="border-blue-400 bg-white hover:bg-gray-50 px-4 py-2 mt-4 border rounded font-bold text-[rgb(28,100,242)]"
              onClick={handleOkClick}
            >
              Ok
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Page;