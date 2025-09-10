"use client";
import React from "react";
import { useEffect } from "react";
export default function NotFound() {
  useEffect(() => {
    setTimeout(() => {
      // console.log("redirected");
      window.location.replace("/");
    }, [2000]);
  }, []);
  return (
    <div className="bg-gray-100 flex items-center justify-center h-screen">
      <div className="container mx-auto text-center">
        <h1 className="text-6xl font-bold text-gray-800">404</h1>
        <p className="text-gray-500 text-lg mt-4">
          {"  Oops! The page you're looking for isn't here."}
        </p>
        <p className="text-gray-500 mt-2">
          You might have the wrong address, or the page may have moved.
        </p>
        <a
          href="/login"
          className="mt-6 inline-block bg-blue-500 text-white font-semibold py-3 px-6 rounded-lg hover:bg-blue-600 transition duration-300"
        >
          Back to Home
        </a>
      </div>
    </div>
  );
}
