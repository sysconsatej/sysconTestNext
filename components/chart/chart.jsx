"use client";
/* eslint-disable */
import React, { useState, useEffect, useRef } from "react";
import Chart from "chart.js/auto";
import { Box } from "@mui/material";
import "./chart.css";
import CustomeInputFields from "../Inputs/customeInputFields";
import jsPDF from "jspdf";
import PropTypes from "prop-types";
import { dynamicReportFilter } from "@/services/auth/FormControl.services";

const ChartReports = ({
  newState,
  chartExpand,
  formControlData,
  chartData,
  clientId,
}) => {
  const chartRef = useRef(null); // canvas
  const wrapRef = useRef(null); // wrapper for ResizeObserver
  const chartInstanceRef = useRef(null);

  const [loading, setLoading] = useState(true);
  const [chartDataState, setChartDataState] = useState(null);
  const [jobData, setJobData] = useState([]);
  const [formValues, setFormValues] = useState({ exampleDropdown: "" });
  const [chartType, setChartType] = useState("bar");

  // ✅ sync canvas pixel size to wrapper (fixes height mismatch)
  const syncCanvasToWrap = () => {
    const wrapEl = wrapRef.current;
    const canvas = chartRef.current;
    if (!wrapEl || !canvas) return;

    const rect = wrapEl.getBoundingClientRect();
    const w = Math.max(0, Math.floor(rect.width));
    const h = Math.max(0, Math.floor(rect.height));

    if (w > 0 && h > 0) {
      // ✅ set actual canvas attributes (not only CSS)
      if (canvas.width !== w) canvas.width = w;
      if (canvas.height !== h) canvas.height = h;
    }
  };

  // chart type from dropdown state
  useEffect(() => {
    if (newState?.["chartTypedropdown"]?.[0]?.label) {
      setChartType(newState["chartTypedropdown"][0].label);
    } else {
      setChartType("bar");
    }
  }, [newState]);

  // fetch chart data
  useEffect(() => {
    const fetchJobData = async () => {
      setLoading(true);
      try {
        const { data } = await dynamicReportFilter(
          chartData,
          clientId,
          formControlData?.spName
        );

        if (Array.isArray(data) && data.length > 0) {
          setJobData(data);
        } else {
          setJobData([]); // ✅ avoid stale old data
        }
      } catch (e) {
        setJobData([]);
      }
      setLoading(false);
    };

    fetchJobData();
  }, [formControlData, chartData, clientId]);

  // build chartDataState
  useEffect(() => {
    if (!Array.isArray(jobData) || jobData.length === 0) {
      setChartDataState(null);
      return;
    }

    setLoading(true);

    const bgColor = [
      "#9999FF",
      "#993366",
      "#FFFFCC",
      "#CCFFFF",
      "#660066",
      "#FF8080",
      "#0066CC",
      "#CCCCFF",
      "#000080",
      "#FF00FF",
    ];

    const values = jobData.map((item) => Number(item?.measure ?? 0));
    const labels = jobData.map((item) => String(item?.dimension ?? ""));

    setChartDataState({
      labels,
      datasets: [
        {
          label: "",
          backgroundColor: bgColor,
          borderColor: "#0766AD",
          borderWidth: 1,
          data: values,
        },
      ],
    });

    setLoading(false);
  }, [jobData]);

  // create / recreate chart
  useEffect(() => {
    if (loading || !chartDataState || !chartRef.current) return;

    // destroy existing chart
    if (chartInstanceRef.current) {
      chartInstanceRef.current.destroy();
      chartInstanceRef.current = null;
    }

    // ✅ make sure wrapper/canvas sizes are in sync BEFORE chart init
    syncCanvasToWrap();

    Chart.defaults.font.family = "Roboto, Helvetica, Arial, sans-serif";

    chartInstanceRef.current = new Chart(chartRef.current, {
      type: chartType,
      data: chartDataState,
      options: {
        responsive: true,
        maintainAspectRatio: false, // ✅ critical for wrapper height
        animation: false, // ✅ helps avoid “zoom” on mobile
        resizeDelay: 80,
        plugins: {
          legend: { display: false },
          tooltip: { enabled: true },
        },
        layout: {
          padding: { top: 8, left: 8, right: 8, bottom: 8 },
        },
        scales: {
          x: {
            ticks: {
              autoSkip: true,
              maxRotation: 0,
              minRotation: 0,
            },
          },
          y: {
            beginAtZero: true,
          },
        },
      },
    });

    // ✅ force another sync + resize after layout settles (grid animation, etc.)
    const t = setTimeout(() => {
      syncCanvasToWrap();
      try {
        chartInstanceRef.current?.resize();
        chartInstanceRef.current?.update("none");
      } catch {}
    }, 120);

    return () => clearTimeout(t);
  }, [loading, chartDataState, chartType]);

  // ✅ ResizeObserver: when wrapper changes, resize chart perfectly
  useEffect(() => {
    const wrapEl = wrapRef.current;
    if (!wrapEl) return;

    const ro = new ResizeObserver(() => {
      syncCanvasToWrap();
      const chart = chartInstanceRef.current;
      if (!chart) return;

      try {
        chart.resize();
        chart.update("none");
      } catch {}
    });

    ro.observe(wrapEl);
    return () => ro.disconnect();
  }, []);

  // ✅ if chartExpand changes, wrapper height changes => force resize
  useEffect(() => {
    const t = setTimeout(() => {
      syncCanvasToWrap();
      try {
        chartInstanceRef.current?.resize();
        chartInstanceRef.current?.update("none");
      } catch {}
    }, 120);

    return () => clearTimeout(t);
  }, [chartExpand]);

  const dropdownFieldData = [
    {
      columnsToBeVisible: true,
      controlname: "dropdown",
      fieldname: "export",
      dropdownFilter:
        "and masterListId in (select id from tblMasterList  where name = 'tblChartPdf')",
      isAuditLog: true,
      isControlShow: true,
      isCopyEditable: true,
      isDataFlow: true,
      isEditable: true,
      referenceColumn: "name",
      referenceTable: "tblMasterData",
      size: 100,
      yourlabel: "Export Chart",
    },
  ];

  const handleValuesChange = (updatedValues) => {
    setFormValues((prev) => ({ ...prev, ...updatedValues }));

    const label = updatedValues?.exportdropdown?.[0]?.label;
    const chart = chartInstanceRef.current;
    if (!label || !chart) return;

    if (label === "image") {
      const a = document.createElement("a");
      a.href = chart.toBase64Image();
      a.download = "my_chart.png";
      a.click();
    } else {
      const imgData = chart.toBase64Image();

      const pdf = new jsPDF("p", "mm", "a4");
      const pageW = pdf.internal.pageSize.getWidth();
      const pageH = pdf.internal.pageSize.getHeight();

      const margin = 10;
      const imgW = pageW - margin * 2;
      const imgH = Math.min(90, pageH - margin * 2);

      pdf.addImage(imgData, "PNG", margin, margin, imgW, imgH);
      pdf.save("chart.pdf");
    }
  };

  return (
    <div className="chart_container">
      {loading ? (
        <p style={{ padding: 10 }}>Loading...</p>
      ) : !jobData || jobData.length === 0 ? (
        <p style={{ padding: 10 }}>No data found.</p>
      ) : (
        <div>
          <Box className="btn_dropdown">
            <CustomeInputFields
              inputFieldData={dropdownFieldData}
              onValuesChange={handleValuesChange}
              values={formValues}
            />
          </Box>

          {/* ✅ wrapper controls height; canvas syncs perfectly */}
          <div
            ref={wrapRef}
            className="chart_canvas_wrap"
            style={
              chartExpand
                ? { height: "70vh" } // expand mode (desktop big)
                : undefined
            }
          >
            <canvas ref={chartRef} />
          </div>
        </div>
      )}
    </div>
  );
};

export default ChartReports;

ChartReports.propTypes = {
  newState: PropTypes.any,
  chartExpand: PropTypes.any,
  formControlData: PropTypes.any,
  clientId: PropTypes.any,
  chartData: PropTypes.any,
};
