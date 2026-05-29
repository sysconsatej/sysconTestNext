// import React from "react";
// import LogisticsThreeDCharts from "./3dCharts";
// import { BAR_DATA, PIE_DATA_TWO } from "./data";
// import PropTypes from "prop-types";

// export async function fetchData() {
//   try {
//     const res = await fetch(
//       `http://94.136.187.170:8080/api/v1/jobAnalysis/customerjobcount`,
//     );
//     const data = await res.json();
//     console.log("Fetched data from API:", data);

//     return {
//       chartData: data?.data[0] || PIE_DATA_TWO,
//     };
//   } catch (error) {
//     return {
//       chartData: PIE_DATA_TWO, // fallback data in case of error
//     };
//   }
// }

// async function Page() {
//   const { chartData } = await fetchData();

//   return (
//     <>
//       <LogisticsThreeDCharts
//         chartData={chartData ? chartData : BAR_DATA}
//         type="bar"
//       />
//       {/* <LogisticsThreeDCharts chartData={LINE_DATA} type="line" /> */}
//       {/* <LogisticsThreeDCharts chartData={chartData} type="pie" /> */}
//     </>
//   );
// }

// Page.propTypes = {
//   chartData: PropTypes.any.isRequired,
// };

// export default Page;

"use client";

import React, { useEffect, useState } from "react";
import LogisticsThreeDCharts from "./3dCharts";

export default function Parent() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const controller = new AbortController();

    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Optional timeout wrapper
        const timeoutId = setTimeout(() => {
          controller.abort();
        }, 8000);

        const res = await fetch(
          "http://94.136.187.170:8080/api/v1/jobAnalysis/customerjobcount",
          {
            signal: controller.signal,
          },
        );

        clearTimeout(timeoutId);

        if (!res.ok) {
          throw new Error(`HTTP error: ${res.status}`);
        }

        const result = await res.json();

        setData(result?.data?.[0] || null);
      } catch (err) {
        if (err.name === "AbortError") {
          console.warn("Request aborted");
        } else {
          console.error("Fetch failed:", err);
          setError(err.message || "Something went wrong");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();

    return () => {
      controller.abort();
    };
  }, []);

  if (loading) {
    return <div>Loading chart...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return <LogisticsThreeDCharts chartData={data} type="bar" />;
}
