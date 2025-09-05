"use client";
import React, { useState, useEffect, useRef } from "react";
import Chart from "chart.js/auto";
import { Box } from "@mui/material";
import "./chart.css";
import CustomeInputFields from "../Inputs/customeInputFields";
import jsPDF from "jspdf";
import PropTypes from "prop-types";
import { dynamicReportFilter } from "@/services/auth/FormControl.services";

const ChartReports = ({ newState, chartExpand, formControlData, chartData, clientId }) => {
  const chartRef = useRef(null);
  const chartInstanceRef = useRef(null);
  const [loading, setLoading] = useState(true);
  const [chartDataState, setChartDataState] = useState(null);
  const [jobData, setJobData] = useState([]);
  const [formValues, setFormValues] = useState({
    exampleDropdown: "",
  });
  const [chartType, setChartType] = useState("bar");

  useEffect(() => {
    if (newState["chartTypedropdown"]) {
      setChartType(newState["chartTypedropdown"][0]?.label);
    } else {
      setChartType("bar");
    }
  }, [newState]);

  useEffect(() => {
    const fetchJobData = async () => {
      setLoading(true);
      let { data } = await dynamicReportFilter(
        chartData,
        clientId,
        formControlData.spName
      );
      if (data?.length === 0) {
        alert(
          "It looks like there might be a mistake in the date or year you entered. Could you please double-check and provide the accurate date?"
        );
        setJobData(jobData);
      } else {
        setJobData(data);
      }
      setLoading(false);
    };

    fetchJobData();
  }, [formControlData, chartData]);

  useEffect(() => {
    const loadData = async () => {
      if (jobData?.length === 0) return;
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

      const chart = jobData.map((item) => item["measure"]);

      const dataVal = {
        label: '',
        backgroundColor: bgColor,
        borderColor: "#0766AD",
        data: chart,
      };

      const labels = jobData.map((item) => item["dimension"]);

      const chartDataObj = {
        labels: labels,
        datasets: [dataVal],
      };
      setChartDataState(chartDataObj);
      setLoading(false);
    };

    loadData();
  }, [jobData]);

  useEffect(() => {
    const initializeChart = () => {
      if (chartInstanceRef.current) {
        chartInstanceRef.current.destroy();
      }

      Chart.defaults.font.family = "Roboto, Helvetica, Arial, sans-serif";
      chartInstanceRef.current = new Chart(chartRef.current, {
        type: chartType,
        data: chartDataState,
        options: {
          maintainAspectRatio: false,
          responsive: true,
        },
      });
    };

    if (!loading && chartDataState) {
      initializeChart();
    }
  }, [loading, chartDataState, chartType]);

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
    const chart = chartInstanceRef.current;
    setFormValues((prevValues) => ({
      ...prevValues,
      ...updatedValues,
    }));
    if (updatedValues.exportdropdown[0].label === "image") {
      if (chart) {
        const a = document.createElement("a");
        a.href = chart.toBase64Image();
        a.download = "my_chart.png";
        a.click();
      }
    } else {
      if (chart) {
        const imgData = chart.toBase64Image();
        const pdf = new jsPDF();
        pdf.addImage(imgData, "PNG", 10, 10, 190, 100);
        pdf.save("chart.pdf");
      }
    }
  };

  return (
    <div className="chart_container">
      {loading ? (
        <p>Loading...</p>
      ) : (
        <div>
          <Box className="btn_dropdown">
            <CustomeInputFields
              inputFieldData={dropdownFieldData}
              onValuesChange={handleValuesChange}
              values={formValues}
            />
          </Box>
          <div
            style={{
              position: "relative",
              height: chartExpand ? "calc(65vh - 30px)" : "calc(80vh - 40px)",
              width: "100%",
            }}
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
