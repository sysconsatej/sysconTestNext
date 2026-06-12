"use client";
/* eslint-disable */
import React, { useEffect, useState, useRef } from "react";
import numberToWords from "@/helper/numberToWords";
import decodeJWT from "@/helper/decodeJWT";
import { generateQRCodeDataUrl } from "@/helper/setQRCodeAsImage";
const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;
import { useSearchParams } from "next/navigation";
import "./rptInvoice.css";
import {
  fetchDataAPI,
  reportTheme,
} from "@/services/auth/FormControl.services";
import { decrypt } from "@/helper/security";
import "jspdf-autotable"; // Import AutoTable plugin
import Print from "@/components/Print/page";
import { fetchReportData } from "@/services/auth/FormControl.services";
import { applyTheme } from "@/utils";
import "@/public/style/reportTheme.css";
import { toWords } from "number-to-words";
import { getUserDetails } from "@/helper/userDetails";

const baseUrlNext = process.env.NEXT_PUBLIC_BASE_URL_SQL_Reports;
function rptInvoice() {
  const searchParams = useSearchParams();
  const { clientId } = getUserDetails();
  const [reportIds, setReportIds] = useState([]);
  const [data, setData] = useState([]);
  const [charge, setCharge] = useState([]);
  const [texInvoiceCharge, setTexInvoiceCharge] = useState([]);
  const [texInvoiceChargeSLS, setTexInvoiceChargeSLS] = useState([]);
  const [chargeAtt, setChargeAtt] = useState([]);
  const [chargeAttOfSubLeas, setChargeAttOfSubLeas] = useState([]);
  const [hsnSac, setHsnSac] = useState([]);
  const [CompanyHeader, setCompanyHeader] = useState("");
  const hsnGridRef = useRef(null);
  const [chargeGridHeight, setChargeGridHeight] = useState("245px");
  const hsnGridHeight = 150;
  const hsnGridHeightFF = 170;
  const [ImageUrl, setImageUrl] = useState("");
  const [footerImageUrl, setFooterImageUrl] = useState("");
  const enquiryModuleRefs = useRef([]);
  const [html2pdf, setHtml2pdf] = useState(null);
  const date = new Date();
  const day = String(date.getDate()).padStart(2, "0"); // Ensures two digits for the day
  const month = date.toLocaleString("en-US", { month: "short" }); // Gets short month name
  const year = date.getFullYear();
  const itemsPerPage = 9;
  const itemsPerPageSLS = 9;
  const itemsPerPageAtt = 50;
  const hsnSacItemPerPage = 5;
  const [termsAndConditions, setTermsAndConditions] = useState("");
  const [htmlContents, setHtmlContents] = useState({});
  const [printName, setPrintName] = useState([]);
  const [invoiceChargeDataForTaxInvoice, setInvoiceChargeDataForTaxInvoice] =
    useState([]);
  const [isChargesFinishedOnFirstPage, setIsChargesFinishedOnFirstPage] =
    useState(false);
  const [generalSalesInvoicePrint, setGeneralSalesInvoicePrint] = useState([]);
  const [purchaseInvoicePrint, setPurchaseInvoicePrint] = useState([]);
  const [creditNotePrint1, setCreditNotePrint1] = useState([]);

  function numberToWords(num) {
    if (num === 0) return "zero only";

    const ones = [
      "",
      "one",
      "two",
      "three",
      "four",
      "five",
      "six",
      "seven",
      "eight",
      "nine",
      "ten",
      "eleven",
      "twelve",
      "thirteen",
      "fourteen",
      "fifteen",
      "sixteen",
      "seventeen",
      "eighteen",
      "nineteen",
    ];

    const tens = [
      "",
      "",
      "twenty",
      "thirty",
      "forty",
      "fifty",
      "sixty",
      "seventy",
      "eighty",
      "ninety",
    ];

    function convertBelowThousand(n) {
      n = Math.floor(n); // important
      let result = "";

      if (n >= 100) {
        result += ones[Math.floor(n / 100)] + " hundred";
        n %= 100;
        if (n > 0) result += " ";
      }

      if (n >= 20) {
        result += tens[Math.floor(n / 10)];
        n %= 10;
        if (n > 0) result += " " + ones[n];
      } else if (n > 0) {
        result += ones[n];
      }

      return result;
    }

    function convertWholeNumber(n) {
      n = Math.floor(n);
      let result = "";

      if (n >= 1000000) {
        result += convertBelowThousand(Math.floor(n / 1000000)) + " million ";
        n %= 1000000;
      }

      if (n >= 1000) {
        result += convertBelowThousand(Math.floor(n / 1000)) + " thousand ";
        n %= 1000;
      }

      if (n > 0) {
        result += convertBelowThousand(n);
      }

      return result.trim();
    }

    const wholePart = Math.floor(num);
    const decimalPart = Math.round((num - wholePart) * 100);

    let words = convertWholeNumber(wholePart);

    if (decimalPart > 0) {
      words += " and " + convertBelowThousand(decimalPart) + " paise";
    }

    return words + " only";
  }

  function numberToWordsWithOutCurrency(num) {
    const ones = [
      "",
      "one",
      "two",
      "three",
      "four",
      "five",
      "six",
      "seven",
      "eight",
      "nine",
      "ten",
      "eleven",
      "twelve",
      "thirteen",
      "fourteen",
      "fifteen",
      "sixteen",
      "seventeen",
      "eighteen",
      "nineteen",
    ];

    const tens = [
      "",
      "",
      "twenty",
      "thirty",
      "forty",
      "fifty",
      "sixty",
      "seventy",
      "eighty",
      "ninety",
    ];

    function convertBelowThousand(n) {
      n = Math.floor(n);
      let result = "";

      if (n >= 100) {
        result += ones[Math.floor(n / 100)] + " hundred";
        n %= 100;
        if (n > 0) result += " ";
      }

      if (n >= 20) {
        result += tens[Math.floor(n / 10)];
        n %= 10;
        if (n > 0) result += " " + ones[n];
      } else if (n > 0) {
        result += ones[n];
      }

      return result;
    }

    function convertWholeNumber(n) {
      let result = "";

      if (n >= 1000000) {
        result += convertBelowThousand(Math.floor(n / 1000000)) + " million ";
        n %= 1000000;
      }

      if (n >= 1000) {
        result += convertBelowThousand(Math.floor(n / 1000)) + " thousand ";
        n %= 1000;
      }

      if (n > 0) {
        result += convertBelowThousand(n);
      }

      return result.trim();
    }

    const [wholeStr, decimalStr = "0"] = Number(num).toFixed(2).split(".");
    const wholePart = parseInt(wholeStr, 10);
    const decimalPart = parseInt(decimalStr, 10);

    let result = convertWholeNumber(wholePart);

    if (decimalPart > 0) {
      result += " and " + convertBelowThousand(decimalPart);
    }

    return result.trim();
  }

  function numberToWordsInIndianSystemUsingWithPaisaAndRupees(num) {
    const ones = [
      "",
      "one",
      "two",
      "three",
      "four",
      "five",
      "six",
      "seven",
      "eight",
      "nine",
      "ten",
      "eleven",
      "twelve",
      "thirteen",
      "fourteen",
      "fifteen",
      "sixteen",
      "seventeen",
      "eighteen",
      "nineteen",
    ];

    const tens = [
      "",
      "",
      "twenty",
      "thirty",
      "forty",
      "fifty",
      "sixty",
      "seventy",
      "eighty",
      "ninety",
    ];

    function convertBelowHundred(n) {
      if (n < 20) return ones[n];
      return tens[Math.floor(n / 10)] + (n % 10 ? "-" + ones[n % 10] : "");
    }

    function convertBelowThousand(n) {
      let result = "";

      if (n >= 100) {
        result += ones[Math.floor(n / 100)] + " hundred";
        n %= 100;
        if (n > 0) result += " ";
      }

      if (n > 0) {
        result += convertBelowHundred(n);
      }

      return result.trim();
    }

    function convertWholeNumber(n) {
      if (n === 0) return "zero";

      let result = "";

      if (n >= 10000000) {
        result += convertBelowThousand(Math.floor(n / 10000000)) + " crore ";
        n %= 10000000;
      }

      if (n >= 100000) {
        result += convertBelowThousand(Math.floor(n / 100000)) + " lakh ";
        n %= 100000;
      }

      if (n >= 1000) {
        result += convertBelowThousand(Math.floor(n / 1000)) + " thousand ";
        n %= 1000;
      }

      if (n > 0) {
        result += convertBelowThousand(n);
      }

      return result.trim();
    }

    const [wholeStr, decimalStr = "0"] = Number(num).toFixed(2).split(".");
    const wholePart = parseInt(wholeStr, 10);
    const decimalPart = parseInt(decimalStr, 10);

    let result = convertWholeNumber(wholePart) + " rupees";

    if (decimalPart > 0) {
      result += " and " + convertBelowHundred(decimalPart) + " paise";
    }

    result += " only";

    return result.charAt(0).toUpperCase() + result.slice(1);
  }

  function numberToWordsInIndianSystemWithOutPaisaAndRupees(num) {
    const ones = [
      "",
      "one",
      "two",
      "three",
      "four",
      "five",
      "six",
      "seven",
      "eight",
      "nine",
      "ten",
      "eleven",
      "twelve",
      "thirteen",
      "fourteen",
      "fifteen",
      "sixteen",
      "seventeen",
      "eighteen",
      "nineteen",
    ];

    const tens = [
      "",
      "",
      "twenty",
      "thirty",
      "forty",
      "fifty",
      "sixty",
      "seventy",
      "eighty",
      "ninety",
    ];

    function convertBelowHundred(n) {
      if (n < 20) return ones[n];
      return tens[Math.floor(n / 10)] + (n % 10 ? "-" + ones[n % 10] : "");
    }

    function convertBelowThousand(n) {
      let result = "";

      if (n >= 100) {
        result += ones[Math.floor(n / 100)] + " hundred";
        n %= 100;
        if (n > 0) result += " ";
      }

      if (n > 0) {
        result += convertBelowHundred(n);
      }

      return result.trim();
    }

    function convertWholeNumber(n) {
      if (n === 0) return "zero";

      let result = "";

      if (n >= 10000000) {
        result += convertBelowThousand(Math.floor(n / 10000000)) + " crore ";
        n %= 10000000;
      }

      if (n >= 100000) {
        result += convertBelowThousand(Math.floor(n / 100000)) + " lakh ";
        n %= 100000;
      }

      if (n >= 1000) {
        result += convertBelowThousand(Math.floor(n / 1000)) + " thousand ";
        n %= 1000;
      }

      if (n > 0) {
        result += convertBelowThousand(n);
      }

      return result.trim();
    }

    const [wholeStr, decimalStr = "0"] = Number(num).toFixed(2).split(".");
    const wholePart = parseInt(wholeStr, 10);
    const decimalPart = parseInt(decimalStr, 10);

    let result = convertWholeNumber(wholePart);

    if (decimalPart > 0) {
      result += " and " + convertBelowHundred(decimalPart);
    }

    result += " only";

    return result.charAt(0).toUpperCase() + result.slice(1);
  }

  function numberToWordsInIndianAndUsaSystem(num, countryCode) {
    const ones = [
      "",
      "one",
      "two",
      "three",
      "four",
      "five",
      "six",
      "seven",
      "eight",
      "nine",
      "ten",
      "eleven",
      "twelve",
      "thirteen",
      "fourteen",
      "fifteen",
      "sixteen",
      "seventeen",
      "eighteen",
      "nineteen",
    ];

    const tens = [
      "",
      "",
      "twenty",
      "thirty",
      "forty",
      "fifty",
      "sixty",
      "seventy",
      "eighty",
      "ninety",
    ];

    function convertBelowHundred(n) {
      if (n < 20) return ones[n];
      return tens[Math.floor(n / 10)] + (n % 10 ? "-" + ones[n % 10] : "");
    }

    function convertBelowThousand(n) {
      let result = "";

      if (n >= 100) {
        result += ones[Math.floor(n / 100)] + " hundred";
        n %= 100;

        if (n > 0) result += " ";
      }

      if (n > 0) {
        result += convertBelowHundred(n);
      }

      return result.trim();
    }

    function convertWholeNumber(n) {
      if (n === 0) return "zero";

      let result = "";

      if (n >= 10000000) {
        result += convertBelowThousand(Math.floor(n / 10000000)) + " crore ";
        n %= 10000000;
      }

      if (n >= 100000) {
        result += convertBelowThousand(Math.floor(n / 100000)) + " lakh ";
        n %= 100000;
      }

      if (n >= 1000) {
        result += convertBelowThousand(Math.floor(n / 1000)) + " thousand ";
        n %= 1000;
      }

      if (n > 0) {
        result += convertBelowThousand(n);
      }

      return result.trim();
    }

    const cleanNum = String(num ?? "")
      .replace(/,/g, "")
      .trim();

    const amount = Number(cleanNum);

    if (isNaN(amount)) return "";

    const [wholeStr, decimalStr = "0"] = Math.abs(amount).toFixed(2).split(".");

    const wholePart = parseInt(wholeStr, 10);
    const decimalPart = parseInt(decimalStr, 10);

    const code = String(countryCode || "").toUpperCase();

    const currencyConfig = {
      INR: {
        major: "rupees",
        minor: "paise",
      },
      USD: {
        major: "dollars",
        minor: "cents",
      },
    };

    const currency = currencyConfig[code];

    let result = "";

    if (amount < 0) {
      result += "minus ";
    }

    result += convertWholeNumber(wholePart);

    if (currency) {
      result += " " + currency.major;
    }

    if (decimalPart > 0) {
      result += " and " + convertBelowHundred(decimalPart);

      if (currency) {
        result += " " + currency.minor;
      }
    }

    result += " only";

    return result.charAt(0).toUpperCase() + result.slice(1);
  }

  // 1) Safely grab the charges array
  const charges = Array.isArray(data?.[0]?.tblInvoiceCharge)
    ? data[0].tblInvoiceCharge
    : [];

  // 2) Robust splitter: tax row counts as VAT only if taxAmountHc > 0 (number after trimming/parse)
  const isPositiveNumber = (v) => {
    if (v === null || v === undefined) return false;
    if (typeof v === "string") {
      const s = v.trim();
      if (s === "") return false;
      const n = Number(s);
      return Number.isFinite(n) && n > 0;
    }
    const n = Number(v);
    return Number.isFinite(n) && n > 0;
  };

  const { chargesWithVat, chargesWithoutVat } = charges.reduce(
    (acc, charge) => {
      const taxes = Array.isArray(charge.tblInvoiceChargeTax)
        ? charge.tblInvoiceChargeTax
        : [];

      const hasVat = taxes.some((t) => isPositiveNumber(t?.taxAmountHc));

      if (hasVat) acc.chargesWithVat.push(charge);
      else acc.chargesWithoutVat.push(charge);

      return acc;
    },
    { chargesWithVat: [], chargesWithoutVat: [] },
  );

  // Results:
  console.log("chargesWithVat", chargesWithVat);
  console.log("chargesWithoutVat", chargesWithoutVat);

  const convertNumberToWords = (num) => {
    // Simple placeholder — replace with your own INR number-to-words logic if needed
    return Number(num).toLocaleString("en-IN");
  };
  const collectHtmlFromIds = (ids) => {
    const collectedHtml = {};
    ids.forEach((id) => {
      const element = document.getElementById(id);
      if (element) {
        collectedHtml[id] = element.outerHTML;
      }
    });
    setHtmlContents(collectedHtml);
  };

  const chunkForSLSKInvoicePrint = (arr = [], size = 20) => {
    if (!Array.isArray(arr) || size <= 0) return [];
    const out = [];
    for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
    return out;
  };

  useEffect(() => {
    if (reportIds.length > 0) {
      const cleanedIds = reportIds.map((name) => name.replace(/\s+/g, ""));

      // Delay to ensure DOM is painted
      setTimeout(() => collectHtmlFromIds(cleanedIds), 100);
    }
  }, [reportIds]);

  const formatDateToDDMMYYYY = (inputDate) => {
    if (!inputDate) return ""; // handles null, undefined, empty string

    const date = new Date(inputDate);
    if (isNaN(date)) return ""; // handles invalid dates

    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();

    return `${day}/${month}/${year}`;
  };

  useEffect(() => {
    const fetchHeader = async () => {
      const storedUserData = localStorage.getItem("userData");
      if (storedUserData) {
        const decryptedData = decrypt(storedUserData);
        const userData = JSON.parse(decryptedData);
        const headerLogoPath = userData[0]?.headerLogoPath;
        const footerLogoPath = userData[0]?.footerLogoPath;
        if (headerLogoPath) {
          setImageUrl(headerLogoPath);
        }
        if (footerLogoPath) {
          setFooterImageUrl(footerLogoPath);
        }
      }
    };
    fetchHeader();
  }, [CompanyHeader]);

  useEffect(() => {
    const loadHtml2pdf = async () => {
      const module = await import("html2pdf.js");
      setHtml2pdf(() => module.default);
    };

    loadHtml2pdf();
  }, []);

  useEffect(() => {
    if (hsnGridRef.current) {
      const height = hsnGridRef.current.offsetHeight;
      const totalRowHeight = 28; // adjust as needed
      setChargeGridHeight(`${height + totalRowHeight}px`);
    }
  }, [hsnSac]);

  useEffect(() => {
    const storedReportIds = sessionStorage.getItem("selectedReportIds");
    if (storedReportIds) {
      let reportIds = JSON.parse(storedReportIds);
      reportIds = Array.isArray(reportIds) ? reportIds : [reportIds];
      console.log("Retrieved Report IDs:", reportIds);
      setReportIds(reportIds);
    } else {
      console.log("No Report IDs found in sessionStorage");
    }
  }, []);

  useEffect(() => {
    const fetchTermsAndConditionsData = async () => {
      const menuReportId = searchParams.get("reportId");
      if (menuReportId) {
        const storedUserData = localStorage.getItem("userData");
        if (storedUserData) {
          const decryptedData = decrypt(storedUserData);
          const userData = JSON.parse(decryptedData);
          const clientId = userData[0].clientId;

          const requestBody = {
            columns: "termsCondition",
            tableName: "tblTermsCondition",
            whereCondition: `reportsId = ${menuReportId} and status = 1`,
            clientIdCondition: `clientId in (${clientId},(select id from tblClient where clientCode = 'SYSCON')) FOR JSON PATH`,
          };

          const data = await fetchReportData(requestBody);

          applyTheme(enquiryModuleRefs.current);

          if (data && data?.data?.length > 0) {
            setTermsAndConditions(data?.data[0]?.termsCondition || "");
          } else {
            //setTermsAndConditions(terms);
          }
        }
      }
    };

    fetchTermsAndConditionsData();
  }, [reportIds]);

  function splitIntoChunksWithExtraArray(array, chunkSize) {
    let result = [];

    const list = Array.isArray(array) ? array : [];

    const DESC_KEY = "description";
    const MAX_CHARS = 40;

    const safeStr = (v) => String(v ?? "").trim();

    const splitIntoLines = (text) => {
      const s = safeStr(text);
      if (!s) return [""];

      const words = s.split(/\s+/).filter(Boolean);
      const lines = [];
      let line = "";

      for (const w of words) {
        if (w.length > MAX_CHARS) {
          if (line) {
            lines.push(line);
            line = "";
          }
          for (let i = 0; i < w.length; i += MAX_CHARS) {
            lines.push(w.slice(i, i + MAX_CHARS));
          }
          continue;
        }

        const next = line ? `${line} ${w}` : w;
        if (next.length <= MAX_CHARS) line = next;
        else {
          if (line) lines.push(line);
          line = w;
        }
      }

      if (line) lines.push(line);
      return lines.length ? lines : [""];
    };

    // ✅ Build a "blank row template" with same keys (prevents UI from showing 0.00)
    const allKeys = list.length > 0 ? Object.keys(list[0] || {}) : [];
    const blankRow = {};
    for (const k of allKeys) {
      if (k !== DESC_KEY) blankRow[k] = ""; // or null
    }

    const expanded = [];
    list.forEach((item, idx) => {
      const lines = splitIntoLines(item?.[DESC_KEY]);

      lines.forEach((lineText, lineIdx) => {
        if (lineIdx === 0) {
          expanded.push({
            ...item,
            [DESC_KEY]: lineText,
            __isContinuation: false,
            __sourceIndex: idx,
            __lineIndex: lineIdx,
            __lineCount: lines.length,
          });
        } else {
          // ✅ continuation: keep keys but blank values, only description has text
          expanded.push({
            ...blankRow,
            [DESC_KEY]: lineText,
            __isContinuation: true,
            __sourceIndex: idx,
            __lineIndex: lineIdx,
            __lineCount: lines.length,
          });
        }
      });
    });

    const arr = expanded;

    if (arr.length > 0 && arr.length > 4 && arr.length < 10) {
      result.push(arr);
    } else {
      for (let i = 0; i < arr.length; i += chunkSize) {
        result.push(arr.slice(i, i + chunkSize));
      }
    }

    return result;
  }

  // function splitIntoChunksWithExtraArrayWships(array = [], chunkSize = 10) {
  //   // ✅ 1) sort by printSrNo numeric asc, nulls/invalids last
  //   const sorted = [...array].sort((a, b) => {
  //     const aRaw = a?.printSrNo;
  //     const bRaw = b?.printSrNo;

  //     const aNum = Number(aRaw);
  //     const bNum = Number(bRaw);

  //     const aBad =
  //       aRaw === null ||
  //       aRaw === undefined ||
  //       aRaw === "" ||
  //       Number.isNaN(aNum);
  //     const bBad =
  //       bRaw === null ||
  //       bRaw === undefined ||
  //       bRaw === "" ||
  //       Number.isNaN(bNum);

  //     // both bad => keep original relative order (stable-ish)
  //     if (aBad && bBad) return 0;

  //     // bad goes last
  //     if (aBad) return 1;
  //     if (bBad) return -1;

  //     // both good => numeric compare
  //     return aNum - bNum;
  //   });

  //   // ✅ 2) your chunking logic (unchanged)
  //   let result = [];

  //   if (sorted.length > 0 && sorted.length > 4 && sorted.length < 10) {
  //     result.push(sorted);
  //     result.push([]);
  //   } else {
  //     for (let i = 0; i < sorted.length; i += chunkSize) {
  //       result.push(sorted.slice(i, i + chunkSize));
  //     }
  //   }

  //   return result;
  // }

  function splitIntoChunksWithExtraArrayWships(array = [], chunkSize = 10) {
    // ✅ 1) sort by printSrNo numeric asc, nulls/invalids last (UNCHANGED)
    const sorted = [...array].sort((a, b) => {
      const aRaw = a?.printSrNo;
      const bRaw = b?.printSrNo;

      const aNum = Number(aRaw);
      const bNum = Number(bRaw);

      const aBad =
        aRaw === null ||
        aRaw === undefined ||
        aRaw === "" ||
        Number.isNaN(aNum);
      const bBad =
        bRaw === null ||
        bRaw === undefined ||
        bRaw === "" ||
        Number.isNaN(bNum);

      if (aBad && bBad) return 0;
      if (aBad) return 1;
      if (bBad) return -1;

      return aNum - bNum;
    });

    // ✅ 2) expand rows based on description length (40 chars)
    //    - first line keeps full object (but description trimmed)
    //    - continuation lines keep ONLY description + blank other keys (prevents 0.00)
    const DESC_KEY = "description";
    const MAX_CHARS = 40;

    const safeStr = (v) => String(v ?? "").trim();

    const splitIntoLines = (text) => {
      const s = safeStr(text);
      if (!s) return [""];

      const words = s.split(/\s+/).filter(Boolean);
      const lines = [];
      let line = "";

      for (const w of words) {
        if (w.length > MAX_CHARS) {
          if (line) {
            lines.push(line);
            line = "";
          }
          for (let i = 0; i < w.length; i += MAX_CHARS) {
            lines.push(w.slice(i, i + MAX_CHARS));
          }
          continue;
        }

        const next = line ? `${line} ${w}` : w;
        if (next.length <= MAX_CHARS) line = next;
        else {
          if (line) lines.push(line);
          line = w;
        }
      }

      if (line) lines.push(line);
      return lines.length ? lines : [""];
    };

    // build blank row template from sorted[0] keys so UI doesn't fallback to 0
    const keys = sorted.length ? Object.keys(sorted[0] || {}) : [];
    const blankRow = {};
    for (const k of keys) {
      if (k !== DESC_KEY) blankRow[k] = ""; // or null
    }

    const expanded = [];
    sorted.forEach((item, idx) => {
      const lines = splitIntoLines(item?.[DESC_KEY]);

      lines.forEach((lineText, lineIdx) => {
        if (lineIdx === 0) {
          expanded.push({
            ...item,
            [DESC_KEY]: lineText,
            __isContinuation: false,
            __sourceIndex: idx,
            __lineIndex: lineIdx,
            __lineCount: lines.length,
          });
        } else {
          expanded.push({
            ...blankRow,
            [DESC_KEY]: lineText,
            __isContinuation: true,
            __sourceIndex: idx,
            __lineIndex: lineIdx,
            __lineCount: lines.length,
          });
        }
      });
    });

    // ✅ 3) your chunking logic (same, but applied on expanded list)
    let result = [];

    if (expanded.length > 0 && expanded.length > 4 && expanded.length < 10) {
      result.push(expanded);
      result.push([]);
    } else {
      for (let i = 0; i < expanded.length; i += chunkSize) {
        result.push(expanded.slice(i, i + chunkSize));
      }
    }

    return result;
  }

  function splitIntoChunks(array, chunkSize) {
    let result = [];
    for (let i = 0; i < array.length; i += chunkSize) {
      const chunk = array.slice(i, i + chunkSize);
      result.push(chunk);
    }
    return result;
  }

  function splitIntoChunksWithExtraArrayForTaxInvoice(
    array = [],
    firstPageItemsPerPage = 10,
    otherPagesItemSize = 10,
  ) {
    // 1) sort by printSrNo numeric asc, nulls/invalids last
    const sorted = [...array].sort((a, b) => {
      const aRaw = a?.printSrNo;
      const bRaw = b?.printSrNo;

      const aNum = Number(aRaw);
      const bNum = Number(bRaw);

      const aBad =
        aRaw === null ||
        aRaw === undefined ||
        aRaw === "" ||
        Number.isNaN(aNum);

      const bBad =
        bRaw === null ||
        bRaw === undefined ||
        bRaw === "" ||
        Number.isNaN(bNum);

      if (aBad && bBad) return 0;
      if (aBad) return 1;
      if (bBad) return -1;

      return aNum - bNum;
    });

    // 2) expand rows based on description length
    const DESC_KEY = "description";
    const MAX_CHARS = 40;

    const safeStr = (v) => String(v ?? "").trim();

    const splitIntoLines = (text) => {
      const s = safeStr(text);
      if (!s) return [""];

      const words = s.split(/\s+/).filter(Boolean);
      const lines = [];
      let line = "";

      for (const w of words) {
        if (w.length > MAX_CHARS) {
          if (line) {
            lines.push(line);
            line = "";
          }

          for (let i = 0; i < w.length; i += MAX_CHARS) {
            lines.push(w.slice(i, i + MAX_CHARS));
          }
          continue;
        }

        const next = line ? `${line} ${w}` : w;

        if (next.length <= MAX_CHARS) {
          line = next;
        } else {
          if (line) lines.push(line);
          line = w;
        }
      }

      if (line) lines.push(line);

      return lines.length ? lines : [""];
    };

    // build blank row template from all keys present in sorted data
    const allKeys = Array.from(
      new Set(sorted.flatMap((row) => Object.keys(row || {}))),
    );

    const blankRow = {};
    for (const k of allKeys) {
      if (k !== DESC_KEY) blankRow[k] = "";
    }

    const expanded = [];

    sorted.forEach((item, idx) => {
      const lines = splitIntoLines(item?.[DESC_KEY]);

      lines.forEach((lineText, lineIdx) => {
        if (lineIdx === 0) {
          expanded.push({
            ...item,
            [DESC_KEY]: lineText,
            __isContinuation: false,
            __sourceIndex: idx,
            __lineIndex: lineIdx,
            __lineCount: lines.length,
          });
        } else {
          expanded.push({
            ...blankRow,
            [DESC_KEY]: lineText,
            __isContinuation: true,
            __sourceIndex: idx,
            __lineIndex: lineIdx,
            __lineCount: lines.length,
          });
        }
      });
    });

    // state: all charges finished on first page or not
    const finishedOnFirstPage = expanded.length <= firstPageItemsPerPage;
    setIsChargesFinishedOnFirstPage(finishedOnFirstPage);

    // 3) first page and other pages chunking
    const result = [];

    if (expanded.length === 0) {
      setIsChargesFinishedOnFirstPage(true);
      return result;
    }

    // first page
    result.push(expanded.slice(0, firstPageItemsPerPage));

    // remaining pages
    let currentIndex = firstPageItemsPerPage;

    while (currentIndex < expanded.length) {
      result.push(
        expanded.slice(currentIndex, currentIndex + otherPagesItemSize),
      );
      currentIndex += otherPagesItemSize;
    }

    return result;
  }
  useEffect(() => {
    const fetchdata = async () => {
      const id = searchParams.get("recordId");
      const reportId = searchParams.get("reportId");
      if (id != null) {
        try {
          const token = localStorage.getItem("token");
          if (!token) throw new Error("No token found");
          const requestBody = {
            invoiceId: id,
            reportId: reportId,
          };
          console.log("Request Body", requestBody);
          const response = await fetch(`${baseUrl}/Sql/api/Reports/invoice`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "x-access-token": JSON.parse(token),
            },
            body: JSON.stringify(requestBody),
          });
          if (!response.ok) throw new Error("Failed to fetch job data");
          const data = await response.json();
          setData(data.data);
          setPrintName(data?.data[0]?.invoiceNo);
          const storedReportIds = sessionStorage.getItem("selectedReportIds");
          let reportNames = null;
          if (storedReportIds) {
            reportNames = JSON.parse(storedReportIds);
            reportNames = Array.isArray(reportIds) ? reportIds : [reportIds];
          } else {
            console.log("No Report IDs found in sessionStorage");
          }
          if (
            reportNames[0] === "Tax Invoice" ||
            reportNames[0] === "Proforma Invoice" ||
            reportNames[0] === "Invoice Print" ||
            reportNames[0] === "Sundry Invoice Print" ||
            reportNames[0] === "Sub Lease Invoice Print" ||
            reportNames[0] === "Sales Invoice Container wise" ||
            reportNames[0] === "Invoice" ||
            reportNames[0] === "Invoice YMS" ||
            reportNames[0] === "Tax Invoice Receipt" ||
            reportNames[0] === "Credit Note" ||
            reportNames[0] === "Tax Invoice Wships" ||
            reportNames[0] === "TGK Invoice " ||
            reportNames[0] === "Tax Invoice SLS" ||
            reportNames[0] === "Import Tax Invoice" ||
            reportNames[0] === "Tax Invoice FF" ||
            reportNames[0] === "General Sales Invoice Print" ||
            reportNames[0] === "CreditNote Print" ||
            reportNames[0] === "Tax Invoice Container" ||
            reportNames[0] === "Domestic Invoice" ||
            reportNames[0] === "Purchase Invoice"
          ) {
            const result = splitIntoChunksWithExtraArray(
              data.data[0]?.tblInvoiceCharge,
              itemsPerPage,
            );
            console.log("Data received:", result);
            const texInvoiceChargeData = splitIntoChunksWithExtraArrayWships(
              data.data[0]?.tblInvoiceCharge ?? [],
              itemsPerPage,
            );
            setCharge(result);
            setTexInvoiceCharge(texInvoiceChargeData);

            const texInvoiceChargeSLSData = splitIntoChunksWithExtraArrayWships(
              data.data[0]?.tblInvoiceCharge ?? [],
              itemsPerPageSLS,
            );
            setTexInvoiceChargeSLS(texInvoiceChargeSLSData);

            const reportName = reportNames?.[0] || "";
            const firstPageItemsPerPage =
              reportName === "Tax Invoice Container"
                ? 14
                : reportName === "Tax Invoice FF" &&
                    Number(data?.data?.[0]?.isHomeCurrency) === 1
                  ? 7
                  : 10;
            const otherPagesItemSize = 16;

            const taxInvoiceChargeDataForTaxInvoice =
              splitIntoChunksWithExtraArrayForTaxInvoice(
                data.data[0]?.tblInvoiceCharge ?? [],
                firstPageItemsPerPage,
                otherPagesItemSize,
              );

            setInvoiceChargeDataForTaxInvoice(
              taxInvoiceChargeDataForTaxInvoice,
            );

            /// set invoice charges for grid in General Sales Invoice Print report start
            const firstPageItemsPerPageForGeneralSalesInvoicePrintCharges = 15;
            const generalSalesInvoicePrintCharges =
              splitIntoChunksWithExtraArrayForTaxInvoice(
                data.data[0]?.tblInvoiceCharge ?? [],
                firstPageItemsPerPageForGeneralSalesInvoicePrintCharges,
                otherPagesItemSize,
              );
            setGeneralSalesInvoicePrint(generalSalesInvoicePrintCharges || []);

            const firstPageItemsPerPageForPurchaseInvoicePrintCharges = 15;
            const purchaseInvoicePrintCharges =
              splitIntoChunksWithExtraArrayForTaxInvoice(
                data.data[0]?.tblInvoiceCharge ?? [],
                firstPageItemsPerPageForPurchaseInvoicePrintCharges,
                otherPagesItemSize,
              );
            setPurchaseInvoicePrint(purchaseInvoicePrintCharges || []);

            const firstPageItemsPerPageForCreditNotePrint1Charges = 12;
            const creditNotePrint1Charges =
              splitIntoChunksWithExtraArrayForTaxInvoice(
                data.data[0]?.tblInvoiceCharge ?? [],
                firstPageItemsPerPageForCreditNotePrint1Charges,
                otherPagesItemSize,
              );
            setCreditNotePrint1(creditNotePrint1Charges || []);

            const allInvoiceDetails = data?.data[0]?.tblInvoiceCharge?.flatMap(
              (charge) => charge.tblInvoiceChargeDetails || [],
            );

            const invoiceCharges = data?.data?.[0]?.tblInvoiceCharge || [];

            const filteredCharges = invoiceCharges.filter(
              (c) => c?.thirdLevelPrint === 1 || c?.thirdLevelPrint === "1",
            );

            const allInvoiceDetailsSubLeasInvoice = filteredCharges.flatMap(
              (c) => c?.tblInvoiceChargeDetails || [],
            );

            const resultAtt = splitIntoChunksWithExtraArray(
              allInvoiceDetails,
              itemsPerPageAtt,
            );

            const resultAttSubLeasInvoice = splitIntoChunksWithExtraArray(
              allInvoiceDetailsSubLeasInvoice,
              itemsPerPageAtt,
            );
            if (resultAtt.length > 0) {
              setChargeAtt(resultAtt);
            }
            if (resultAttSubLeasInvoice.length > 0) {
              setChargeAttOfSubLeas(resultAttSubLeasInvoice);
            }
            const allTaxes = [];
            const uniqueSacList = [];
            const uniqueHsnList = [];
            // Step 1: Collect all tax and unique codes
            data.data[0]?.tblInvoiceCharge?.forEach((charge) => {
              if (Array.isArray(charge.tblInvoiceChargeTax)) {
                charge.tblInvoiceChargeTax.forEach((tax) => {
                  allTaxes.push(tax);
                });
              }
              if (charge.sac) uniqueSacList.push(charge.sac);
              if (charge.hsn) uniqueHsnList.push(charge.hsn);
            });

            const dedupedSacList = [...new Set(uniqueSacList)];
            const dedupedHsnList = [...new Set(uniqueHsnList)];
            const charges = data.data[0]?.tblInvoiceCharge || [];

            // Step 2: Calculate for SAC
            const sacSummary = dedupedSacList.map((sac) => {
              const matchingRecords = charges.filter(
                (charge) => charge.sac === sac,
              );

              let CGST = 0;
              let SGST = 0;
              let IGST = 0;
              let CGST_HC = 0;
              let SGST_HC = 0;
              let IGST_HC = 0;
              let taxableAmount = 0;
              let taxableAmountFc = 0;
              let taxPercentage = 0;

              matchingRecords.forEach((charge) => {
                taxableAmount += Number(charge.taxableAmount) || 0;
                taxableAmountFc += Number(charge.taxableAmountFc) || 0;

                if (Array.isArray(charge.tblInvoiceChargeTax)) {
                  charge.tblInvoiceChargeTax.forEach((tax) => {
                    // const amount =
                    //   reportNames[0] === "Tax Invoice FF" ||
                    //   reportNames[0] === "Tax Invoice"
                    //     ? Number(tax.taxAmountFc) || 0
                    //     : Number(tax.taxAmountHc) || 0;
                    const amount = Number(tax.taxAmountFc) || 0;
                    const amountHC = Number(tax.taxAmountHc) || 0;
                    // taxPercentage = Number(tax.taxPercentage) || 0;  // changes applied as per discussion with shahnaz
                    //taxPercentage += Number(tax.taxPercentage) || 0; // earlier we were summing tax percentages which doesn't make sense, it should be same for all taxes of same SAC, so just take from one of them

                    // switch (tax.taxCode) {
                    //   case "CGST":
                    //     CGST += amount;
                    //     CGST_HC += amountHC;
                    //     taxPercentage = (Number(tax.taxPercentage) || 0) * 2;
                    //     break;
                    //   case "SGST":
                    //     SGST += amount;
                    //     SGST_HC += amountHC;
                    //     taxPercentage = (Number(tax.taxPercentage) || 0) * 2;
                    //     break;
                    //   case "IGST":
                    //     IGST += amount;
                    //     IGST_HC += amountHC;
                    //     taxPercentage = Number(tax.taxPercentage) || 0;
                    //     break;
                    // }
                    const taxCode = String(tax.taxCode || "")
                      .trim()
                      .toUpperCase();

                    switch (true) {
                      case taxCode.startsWith("CGST"):
                        CGST += amount;
                        CGST_HC += amountHC;
                        taxPercentage = (Number(tax.taxPercentage) || 0) * 2;
                        break;

                      case taxCode.startsWith("SGST"):
                        SGST += amount;
                        SGST_HC += amountHC;
                        taxPercentage = (Number(tax.taxPercentage) || 0) * 2;
                        break;

                      case taxCode.startsWith("IGST"):
                        IGST += amount;
                        IGST_HC += amountHC;
                        taxPercentage = Number(tax.taxPercentage) || 0;
                        break;

                      default:
                        break;
                    }
                  });
                }
              });

              return {
                sac,
                hsn: null,
                CGST,
                SGST,
                IGST,
                CGST_HC,
                SGST_HC,
                IGST_HC,
                taxableAmount,
                taxPercentage,
                taxableAmountFc,
              };
            });

            // Step 3: Calculate for HSN
            const hsnSummary = dedupedHsnList.map((hsn) => {
              const matchingRecords = charges.filter(
                (charge) => charge.hsn === hsn,
              );

              let CGST = 0;
              let SGST = 0;
              let IGST = 0;
              let CGST_HC = 0;
              let SGST_HC = 0;
              let IGST_HC = 0;
              let taxableAmount = 0;
              let taxPercentage = 0;
              let taxableAmountFc = 0;

              matchingRecords.forEach((charge) => {
                taxableAmount += Number(charge.taxableAmount) || 0;
                taxableAmountFc += Number(charge.taxableAmountFc) || 0;

                if (Array.isArray(charge.tblInvoiceChargeTax)) {
                  charge.tblInvoiceChargeTax.forEach((tax) => {
                    const amount = Number(tax.taxAmountFc) || 0;
                    const amountHC = Number(tax.taxAmountHc) || 0;

                    // switch (tax.taxCode) {
                    //   case "CGST":
                    //     CGST += amount;
                    //     break;
                    //   case "SGST":
                    //     SGST += amount;
                    //     break;
                    //   case "IGST":
                    //     IGST += amount;
                    //     break;
                    // }
                    const taxCode = String(tax.taxCode || "")
                      .trim()
                      .toUpperCase();

                    switch (true) {
                      case taxCode.startsWith("CGST"):
                        CGST += amount;
                        CGST_HC += amountHC;
                        taxPercentage = (Number(tax.taxPercentage) || 0) * 2;
                        break;

                      case taxCode.startsWith("SGST"):
                        SGST += amount;
                        SGST_HC += amountHC;
                        taxPercentage = (Number(tax.taxPercentage) || 0) * 2;
                        break;

                      case taxCode.startsWith("IGST"):
                        IGST += amount;
                        IGST_HC += amountHC;
                        taxPercentage = Number(tax.taxPercentage) || 0;
                        break;

                      default:
                        break;
                    }
                  });
                }
              });

              return {
                sac: null,
                hsn,
                CGST,
                SGST,
                IGST,
                CGST_HC,
                SGST_HC,
                IGST_HC,
                taxableAmount,
                taxPercentage,
                taxableAmountFc,
              };
            });

            // Step 4: Combine both summaries
            const combinedSummary = [...sacSummary, ...hsnSummary];
            if (combinedSummary.length > 0) {
              const hsnSacResult = splitIntoChunks(
                combinedSummary,
                hsnSacItemPerPage,
              );
              setHsnSac(hsnSacResult);
            }
          }

          setCompanyHeader(data.data[0].brachId);
        } catch (error) {
          console.error("Error fetching job data:", error);
        }
      }
    };
    if (reportIds.length > 0) {
      fetchdata();
    }
  }, [reportIds]);

  useEffect(() => {
    const fetchHeader = async () => {
      const storedUserData = localStorage.getItem("userData");
      if (storedUserData) {
        const decryptedData = decrypt(storedUserData);
        const userData = JSON.parse(decryptedData);
        const BranchId = userData[0].defaultBranchId;
        const clientCode = userData[0].clientCode;
        const requestBody = {
          tableName: "tblCompanyBranchParameter",
          whereCondition: {
            status: 1,
            companyBranchId: BranchId,
            clientCode: clientCode,
          },
          projection: {
            tblCompanyBranchParameterDetails: 1,
          },
        };
        try {
          const dataURl = await fetchDataAPI(requestBody);
          const response = dataURl.data;
          if (
            response &&
            response.length > 0 &&
            response[0].tblCompanyBranchParameterDetails.length > 0
          ) {
            const headerUrl =
              response[0].tblCompanyBranchParameterDetails[0].header;
            setImageUrl(headerUrl);
          } else {
            console.error("No valid data received");
          }
        } catch (error) {
          console.error("Error fetching initial data:", error);
        }
      }
    };
    fetchHeader();
  }, [CompanyHeader]);

  const CompanyImgModule = ({ data }) => {
    const token = data[0]?.signedQrCode; // Get the QR code token from the data
    const [qrCodeDataUrl, setQrCodeDataUrl] = useState(""); // State to hold QR code data URL

    useEffect(() => {
      const generateQRCode = async () => {
        // Ensure token exists before generating QR code
        if (token) {
          try {
            const dataUrl = await generateQRCodeDataUrl(token);
            setQrCodeDataUrl(dataUrl);
          } catch (error) {
            console.error("Error generating QR code:", error);
          }
        }
      };

      generateQRCode(); // Call the function to generate the QR code
    }, [token]); // Re-run the effect when the token changes

    return (
      <div
        className="flex border-t border-l border-r border-black w-full"
        style={{
          borderTop: "1px solid #000",
          borderRight: "1px solid #000",
          borderLeft: "1px solid #000",
          paddingTop: "5px",
        }}
      >
        {/* 70% left side */}
        <div className=" flex items-center" style={{ width: "85%" }}>
          <img
            src={`${baseUrlNext}${ImageUrl}`}
            alt="LOGO"
            className="w-full my-auto"
            style={{ maxHeight: "130px", width: "100%" }}
          />
        </div>

        <div className="w-[15%] flex justify-end items-start">
          {qrCodeDataUrl ? (
            <img
              src={qrCodeDataUrl}
              alt="QR Code"
              className="w-full my-auto"
              style={{ maxHeight: "130px", width: "100%" }}
            />
          ) : (
            <p className="text-xs"></p>
          )}
        </div>
      </div>
    );
  };

  const PurchaseCompanyImgModule = ({ data }) => {
    const token = data[0]?.signedQrCode; // Get the QR code token from the data
    const [qrCodeDataUrl, setQrCodeDataUrl] = useState(""); // State to hold QR code data URL

    useEffect(() => {
      const generateQRCode = async () => {
        // Ensure token exists before generating QR code
        if (token) {
          try {
            const dataUrl = await generateQRCodeDataUrl(token);
            setQrCodeDataUrl(dataUrl);
          } catch (error) {
            console.error("Error generating QR code:", error);
          }
        }
      };

      generateQRCode(); // Call the function to generate the QR code
    }, [token]); // Re-run the effect when the token changes

    return (
      <div
        className="flex border-t border-l border-r border-black w-full"
        style={{
          borderTop: "1px solid #000",
          borderRight: "1px solid #000",
          borderLeft: "1px solid #000",
          paddingTop: "5px",
        }}
      >
        <div className=" flex items-center" style={{ width: "100%" }}>
          <img
            src={`${baseUrlNext}${ImageUrl}`}
            alt="LOGO"
            className="w-full my-auto"
            style={{ maxHeight: "130px", width: "100%" }}
          />
        </div>
      </div>
    );
  };

  const TgkCompanyImgModule = ({ data }) => {
    const token = data[0]?.signedQrCode; // Get the QR code token from the data
    const [qrCodeDataUrl, setQrCodeDataUrl] = useState(""); // State to hold QR code data URL

    useEffect(() => {
      const generateQRCode = async () => {
        // Ensure token exists before generating QR code
        if (token) {
          try {
            const dataUrl = await generateQRCodeDataUrl(token);
            setQrCodeDataUrl(dataUrl);
          } catch (error) {
            console.error("Error generating QR code:", error);
          }
        }
      };

      generateQRCode(); // Call the function to generate the QR code
    }, [token]); // Re-run the effect when the token changes

    return (
      <div
        className="flex border-t border-l border-r border-black p-2 w-full"
        style={{
          borderTop: "1px solid #000",
          borderRight: "1px solid #000",
          borderLeft: "1px solid #000",
        }}
      >
        {/* 70% left side */}
        <div className="w-[85%] flex items-center">
          <img
            src={`${baseUrlNext}${ImageUrl}`}
            alt="LOGO"
            className="w-full my-auto"
            style={{ maxHeight: "130px", width: "100%" }}
          />
        </div>

        <div className="w-[15%] flex justify-end items-start">
          {qrCodeDataUrl ? (
            <img src={qrCodeDataUrl} alt="QR Code" height={350} width={350} />
          ) : (
            <p className="text-xs"></p>
          )}
        </div>
      </div>
    );
  };

  const FooterModule = ({ data }) => {
    return (
      <div className="flex  p-0 w-full">
        <div className="w-[100%] flex items-center">
          <img
            src={`${baseUrlNext}${footerImageUrl}`}
            alt=""
            className="w-full my-auto"
            style={{ maxHeight: "70px", width: "100%" }}
          />
        </div>
      </div>
    );
  };

  const TgkFooterModule = ({ data }) => {
    return (
      <div className="flex  p-0 w-full">
        <div className="w-[100%] flex items-center">
          <img
            src={`${baseUrlNext}${footerImageUrl}`}
            alt="Footer LOGO"
            className="w-full my-auto"
            style={{ maxHeight: "70px", width: "100%" }}
          />
        </div>
      </div>
    );
  };

  const CompanyImgFooterModule = () => {
    const storedUserData = localStorage.getItem("userData");
    let imageFooter = null;
    if (storedUserData) {
      const decryptedData = decrypt(storedUserData);
      const userData = JSON.parse(decryptedData);
      imageFooter = userData[0]?.footerLogoPath;
    }
    return (
      <img
        src={imageFooter ? baseUrlNext + imageFooter : ""}
        //src="https://expresswayshipping.com/sql-api/uploads/1756889348213-SLSK LOGO.jpg"
        style={{ width: "100%" }}
        alt="Footer"
      />
    );
  };

  const CompanyImgModuleInvoicePrint = ({ data }) => {
    return (
      <div className="flex border-t border-l border-r border-black w-full p-0.5">
        {/* 70% left side */}
        <div className="w-[100%] flex items-center">
          <img
            src={`${baseUrlNext}${ImageUrl}`}
            alt="LOGO"
            className="w-full my-auto"
            style={{ minHeight: "90px", maxHeight: "90px", width: "100%" }}
          />
        </div>
      </div>
    );
  };
  const CompanyImgModuleInvoice = ({ data }) => {
    return (
      <div className="flex w-full p-0.5 border-t border-l border-r border-black">
        {/* 70% left side */}
        <div
          className="w-[100%] flex items-center"
          style={{ minHeight: "110px", maxHeight: "110px", width: "100%" }}
        >
          <img
            src={`${baseUrlNext}${ImageUrl}`}
            alt="LOGO"
            style={{ minHeight: "110px", maxHeight: "110px", width: "100%" }}
          />
        </div>
      </div>
    );
  };
  const TaxInvoiceHeader = ({ data }) => {
    console.log("TaxInvoiceHeader", data);
    console.log("reportIds", reportIds[0]);
    return (
      <div className="border-l border-r border-b border-black">
        <div className="flex flex-grow w-full justify-center items-center">
          <h1 className="text-black font-bold text-sm">
            {data[0]?.invoiceHeading || ""}
          </h1>
        </div>
        <div className="flex justify-between w-full p-2">
          <div style={{ width: "25%" }}>
            <p style={{ fontSize: "9px" }}>
              <span className="font-bold">CIN No.:</span>{" "}
              {data[0]?.ownCinNo || ""}
            </p>
          </div>
          <div style={{ width: "20%" }}>
            <p style={{ fontSize: "9px" }}>
              <span className="font-bold">State:</span>{" "}
              {data[0]?.ownState || ""}
            </p>
          </div>
          <div style={{ width: "15%" }}>
            <p style={{ fontSize: "9px" }}>
              <span className="font-bold">State Code:</span>{" "}
              {data[0]?.ownStateCode || ""}
            </p>
          </div>
          <div style={{ width: "20%" }}>
            <p style={{ fontSize: "9px" }}>
              <span className="font-bold">GSTIN:</span>{" "}
              {data[0]?.ownGstin || ""}
            </p>
          </div>
          <div style={{ width: "20%" }}>
            <p style={{ fontSize: "9px" }}>
              <span className="font-bold">PAN No:</span>{" "}
              {data[0]?.ownPanNo || ""}
            </p>
          </div>
        </div>
        <div className="border-t border-black">
          <div className="flex">
            <div style={{ width: "60%" }}>
              <p className="pl-2 pt-1 pb-1" style={{ fontSize: "9px" }}>
                <span className="font-bold">IRN : </span>
                {data[0]?.irn || ""}
              </p>
            </div>
            <div style={{ width: "40%" }}>
              <p className="pl-2 pt-1 pb-1" style={{ fontSize: "9px" }}>
                <span className="font-bold">Ack No. / Ack Date : </span>
                {/* {data[0]?.irn || ""} */}
                {data[0]?.ackNo || ""} <span className="font-bold"> / </span>
                {formatDateToDDMMYYYY(data[0]?.ackDate) || ""}
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const PurchaseInvoiceHeader = ({ data }) => {
    return (
      <div className="border-l border-r border-b border-black">
        <div className="flex flex-grow w-full justify-center items-center">
          <h1 className="text-black font-bold text-sm">
            {data[0]?.invoiceHeading || ""}
          </h1>
        </div>
        <div className="flex justify-between w-full p-2">
          <div style={{ width: "25%" }}>
            <p style={{ fontSize: "9px" }}>
              <span className="font-bold">CIN No.:</span>{" "}
              {data[0]?.ownCinNo || ""}
            </p>
          </div>
          <div style={{ width: "20%" }}>
            <p style={{ fontSize: "9px" }}>
              <span className="font-bold">State:</span>{" "}
              {data[0]?.ownState || ""}
            </p>
          </div>
          <div style={{ width: "15%" }}>
            <p style={{ fontSize: "9px" }}>
              <span className="font-bold">State Code:</span>{" "}
              {data[0]?.ownStateCode || ""}
            </p>
          </div>
          <div style={{ width: "20%" }}>
            <p style={{ fontSize: "9px" }}>
              <span className="font-bold">GSTIN:</span>{" "}
              {data[0]?.ownGstin || ""}
            </p>
          </div>
          <div style={{ width: "20%" }}>
            <p style={{ fontSize: "9px" }}>
              <span className="font-bold">PAN No:</span>{" "}
              {data[0]?.ownPanNo || ""}
            </p>
          </div>
        </div>
      </div>
    );
  };

  const GeneralSalesInvoiceHeader = ({ data }) => {
    return (
      <div className="border border-black">
        <div className="flex flex-grow w-full justify-center items-center p-1">
          <h1 className="text-black font-bold text-sm  underline">
            {data[0]?.invoiceHeading || "TAX INVOICE"}
          </h1>
        </div>
        <div className="flex justify-between w-full p-2 border-t border-black">
          <div style={{ width: "25%" }}>
            <p style={{ fontSize: "9px" }}>
              <span className="font-bold">State:</span>{" "}
              {data[0]?.ownState || ""}
            </p>
          </div>
          <div style={{ width: "25%" }}>
            <p style={{ fontSize: "9px" }}>
              <span className="font-bold">State Code:</span>{" "}
              {data[0]?.ownStateCode || ""}
            </p>
          </div>
          <div style={{ width: "25%" }}>
            <p style={{ fontSize: "9px" }}>
              <span className="font-bold">GSTIN:</span>{" "}
              {data[0]?.ownGstin || ""}
            </p>
          </div>
          <div style={{ width: "25%" }}>
            <p style={{ fontSize: "9px" }}>
              <span className="font-bold">PAN No:</span>{" "}
              {data[0]?.ownPanNo || ""}
            </p>
          </div>
        </div>
        <div className="border-t border-black">
          <div className="flex">
            <div style={{ width: "100%" }}>
              <p className="pl-2 pt-1 pb-1" style={{ fontSize: "9px" }}>
                <span className="font-bold">IRN : </span>
                {data[0]?.irn || ""}
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const CreditNoteInvoiceHeader = ({ data }) => {
    return (
      <div className="border border-black">
        <div className="flex flex-grow w-full justify-center items-center p-1">
          <h1 className="text-black font-bold text-sm  underline">
            {data[0]?.voucher || "CREDIT NOTE"}
          </h1>
        </div>
        <div className="flex justify-between w-full p-2 border-t border-black">
          <div style={{ width: "25%" }}>
            <p style={{ fontSize: "9px" }}>
              <span className="font-bold">State:</span>{" "}
              {data[0]?.ownState || ""}
            </p>
          </div>
          <div style={{ width: "25%" }}>
            <p style={{ fontSize: "9px" }}>
              <span className="font-bold">State Code:</span>{" "}
              {data[0]?.ownStateCode || ""}
            </p>
          </div>
          <div style={{ width: "25%" }}>
            <p style={{ fontSize: "9px" }}>
              <span className="font-bold">GSTIN:</span>{" "}
              {data[0]?.ownGstin || ""}
            </p>
          </div>
          <div style={{ width: "25%" }}>
            <p style={{ fontSize: "9px" }}>
              <span className="font-bold">PAN No:</span>{" "}
              {data[0]?.ownPanNo || ""}
            </p>
          </div>
        </div>
        <div className="border-t border-black">
          <div className="flex">
            <div style={{ width: "100%" }}>
              <p className="pl-2 pt-1 pb-1" style={{ fontSize: "9px" }}>
                <span className="font-bold">IRN : </span>
                {data[0]?.irn || ""}
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const TgkTaxInvoiceHeader = ({ data }) => {
    console.log("TaxInvoiceHeader", data);
    console.log("reportIds", reportIds[0]);
    return (
      <div className="border-l border-r border-b border-black">
        <div className="flex flex-grow w-full justify-center items-center">
          <h1 className="text-black font-bold text-sm">
            {data[0]?.invoiceHeading || ""}
          </h1>
        </div>
        {/* <div className="flex justify-between w-full p-2">
          <div style={{ width: "25%" }}>
            <p style={{ fontSize: "9px" }}>
              <span className="font-bold">CIN No.:</span>{" "}
              {data[0]?.ownCinNo || ""}
            </p>
          </div>
          <div style={{ width: "20%" }}>
            <p style={{ fontSize: "9px" }}>
              <span className="font-bold">State:</span>{" "}
              {data[0]?.ownState || ""}
            </p>
          </div>
          <div style={{ width: "15%" }}>
            <p style={{ fontSize: "9px" }}>
              <span className="font-bold">State Code:</span>{" "}
              {data[0]?.ownStateCode || ""}
            </p>
          </div>
          <div style={{ width: "20%" }}>
            <p style={{ fontSize: "9px" }}>
              <span className="font-bold">GSTIN:</span>{" "}
              {data[0]?.ownGstin || ""}
            </p>
          </div>
          <div style={{ width: "20%" }}>
            <p style={{ fontSize: "9px" }}>
              <span className="font-bold">PAN No:</span>{" "}
              {data[0]?.ownPanNo || ""}
            </p>
          </div>
        </div>
        <div className="border-t border-black">
          <div className="flex">
            <div style={{ width: "60%" }}>
              <p className="pl-2 pt-1 pb-1" style={{ fontSize: "9px" }}>
                <span className="font-bold">IRN : </span>
                {data[0]?.irn || ""}
              </p>
            </div>
            <div style={{ width: "40%" }}>
              <p className="pl-2 pt-1 pb-1" style={{ fontSize: "9px" }}>
                <span className="font-bold">Ack No. / Ack Date : </span>
                {data[0]?.irn || ""}
                {data[0]?.ackNo || ""} <span className="font-bold"> / </span>
                {formatDateToDDMMYYYY(data[0]?.ackDate) || ""}
              </p>
            </div>
          </div>
        </div> */}
      </div>
    );
  };

  const ProformaInvoiceHeader = ({ data }) => {
    return (
      <div className="border-l border-r border-b border-black">
        <div className="flex flex-grow w-full justify-center items-center">
          <h1 className="text-black font-bold text-sm">
            {data[0]?.invoiceHeading || ""}
          </h1>
        </div>
        <div className="flex justify-between w-full p-2">
          <div style={{ width: "25%" }}>
            <p style={{ fontSize: "9px" }}>
              <span className="font-bold">CIN No.:</span>{" "}
              {data[0]?.ownCinNo || ""}
            </p>
          </div>
          <div style={{ width: "20%" }}>
            <p style={{ fontSize: "9px" }}>
              <span className="font-bold">State:</span>{" "}
              {data[0]?.ownState || ""}
            </p>
          </div>
          <div style={{ width: "15%" }}>
            <p style={{ fontSize: "9px" }}>
              <span className="font-bold">State Code:</span>{" "}
              {data[0]?.ownStateCode || ""}
            </p>
          </div>
          <div style={{ width: "20%" }}>
            <p style={{ fontSize: "9px" }}>
              <span className="font-bold">GSTIN:</span>{" "}
              {data[0]?.ownGstin || ""}
            </p>
          </div>
          <div style={{ width: "20%" }}>
            <p style={{ fontSize: "9px" }}>
              <span className="font-bold">PAN No:</span>{" "}
              {data[0]?.partyPanNo || ""}
            </p>
          </div>
        </div>
        <div className="border-t border-black">
          <div className="flex">
            <div style={{ width: "60%" }}></div>
            <div style={{ width: "40%" }}>
              <p className="pl-2 pt-1 pb-1" style={{ fontSize: "9px" }}></p>
            </div>
          </div>
        </div>
      </div>
    );
  };
  const InvoicePrintHeader = ({ data }) => {
    return (
      <div className="border-l border-r border-b border-black pt-1 pb-1">
        <div className="flex flex-grow w-full justify-center items-center">
          <h1 className="text-black font-bold text-sm">
            {data[0]?.invoiceHeading || ""}
          </h1>
        </div>
      </div>
    );
  };
  const SundryInvoicePrintHeader = ({ data }) => {
    console.log("TaxInvoiceHeader", data);
    console.log("reportIds", reportIds[0]);
    return (
      <div className="border-l border-r border-b border-black pt-1 pb-1">
        <div className="flex flex-grow w-full justify-center items-center">
          <h1 className="text-black font-bold text-sm">
            {data[0]?.invoiceHeading || ""}
          </h1>
        </div>
      </div>
    );
  };
  const SubLeaseInvoicePrintHeader = ({ data }) => {
    console.log("TaxInvoiceHeader", data);
    console.log("reportIds", reportIds[0]);
    return (
      <div className="border-l border-r border-b border-black pt-1 pb-1">
        <div className="flex flex-grow w-full justify-center items-center">
          <h1 className="text-black font-bold text-sm">
            {data[0]?.invoiceHeading || ""}
          </h1>
        </div>
      </div>
    );
  };

  const DynamicHeaderData = ({ data }) => {
    return (
      <div className="border-l border-r border-black pt-1 pb-1">
        <div className="flex flex-grow w-full justify-center items-center">
          <h1
            className="text-black" // removed font-bold and text-sm
            style={{
              color: "black",
              fontFamily: '"Times New Roman", Times, serif',
              fontWeight: 400, // Regular
              fontSize: "18px",
              fontSynthesis: "none", // prevent synthetic bold
            }}
          >
            {data[0]?.invoiceHeading || ""}
          </h1>
        </div>
      </div>
    );
  };

  const TaxInvoiceBillingDetails = ({ data }) => {
    return (
      <div className="flex border-r border-l border-b border-black p-1">
        <div style={{ fontSize: "9px", width: "50%" }}>
          <div
            className="pt-1 w-full"
            style={{
              display: "grid",
              gridTemplateColumns: "100px 8px 1fr",
              alignItems: "start",
            }}
          >
            <div className="font-bold">Billing Party Name</div>

            <div>:</div>

            <div
              style={{
                paddingLeft: "4px",
                textAlign: "left",
                lineHeight: "1.25",
                wordBreak: "break-word",
                whiteSpace: "normal",
              }}
            >
              {data[0]?.party || ""}
            </div>
          </div>

          <div
            className="pt-1 w-full"
            style={{
              display: "grid",
              gridTemplateColumns: "100px 8px 1fr",
              alignItems: "start",
            }}
          >
            <div className="font-bold">Address</div>

            <div>:</div>

            <div
              style={{
                paddingLeft: "4px",
                textAlign: "left",
                lineHeight: "1.25",
                wordBreak: "break-word",
                whiteSpace: "normal",
              }}
            >
              {data[0]?.billingPartyAddress || ""}
            </div>
          </div>
        </div>
        <div className="ps-1" style={{ fontSize: "9px", width: "20%" }}>
          <div className="flex w-full">
            <p className="font-bold" style={{ width: "35%" }}>
              PAN No.{" "}
            </p>
            <p style={{ width: "65%" }}>: {data[0]?.partyPanNo || ""}</p>
          </div>
          <div className="flex pt-1 w-full">
            <p className="font-bold" style={{ width: "35%" }}>
              State{" "}
            </p>
            <p style={{ width: "65%" }}>: {data[0]?.partyState || ""}</p>
          </div>
          <div className="flex pt-1 w-full">
            <p className="font-bold" style={{ width: "35%" }}>
              State Code{" "}
            </p>
            <p style={{ width: "65%" }}>: {data[0]?.partyTaxStateCode || ""}</p>
          </div>
          <div className="flex pt-1 w-full">
            <p className="font-bold" style={{ width: "35%" }}>
              GSTIN{" "}
            </p>
            <p style={{ width: "65%" }}>: {data[0]?.partyGstin || ""}</p>
          </div>
        </div>
        <div className="ps-1" style={{ fontSize: "9px", width: "20%" }}>
          <div className="flex w-full">
            <p className="font-bold" style={{ width: "35%" }}>
              Invoice No.{" "}
            </p>
            <p style={{ width: "65%" }}>: {data[0]?.invoiceNo || ""}</p>
          </div>
          <div className="flex pt-1 w-full">
            <p className="font-bold" style={{ width: "35%" }}>
              Invoice Date{" "}
            </p>
            <p style={{ width: "65%" }}>
              : {formatDateToDDMMYYYY(data[0]?.invoiceDate) || ""}
            </p>
          </div>
          <div className="flex pt-1 w-full">
            <p className="font-bold" style={{ width: "35%" }}>
              Credit Period{" "}
            </p>
            <p style={{ width: "65%" }}>: {data[0]?.creditPeriod || ""}</p>
          </div>
          <div className="flex pt-1 w-full">
            <p className="font-bold" style={{ width: "35%" }}>
              Due Date{" "}
            </p>
            <p style={{ width: "65%" }}>
              : {formatDateToDDMMYYYY(data[0]?.dueDate) || ""}
            </p>
          </div>
        </div>
      </div>
    );
  };
  const PurchaseInvoiceBillingDetails = ({ data }) => {
    return (
      <div className="flex  border-r border-l border-b border-black">
        <div
          className="pl-1"
          style={{
            fontSize: "9px",
            width: "60%",
            borderRight: "1px solid black",
          }}
        >
          <div
            className="pt-1 w-full"
            style={{
              display: "grid",
              gridTemplateColumns: "100px 8px 1fr",
              alignItems: "start",
            }}
          >
            <div className="font-bold">Billing Party Name</div>
            <div>:</div>
            <div
              style={{
                paddingLeft: "4px",
                textAlign: "left",
                lineHeight: "1.25",
                wordBreak: "break-word",
                whiteSpace: "normal",
              }}
            >
              {data[0]?.party || ""}
            </div>
          </div>

          <div
            className="pt-1 w-full"
            style={{
              display: "grid",
              gridTemplateColumns: "100px 8px 1fr",
              alignItems: "start",
            }}
          >
            <div className="font-bold">Address</div>
            <div>:</div>
            <div
              style={{
                paddingLeft: "4px",
                textAlign: "left",
                lineHeight: "1.25",
                wordBreak: "break-word",
                whiteSpace: "normal",
              }}
            >
              {data[0]?.billingPartyAddress || ""}
            </div>
          </div>

          {/* State / State Code / GSTIN */}
          <div
            className="pt-1 w-full"
            style={{
              display: "grid",
              gridTemplateColumns: "30px 6px 1fr 70px 6px 55px 45px 6px 1fr",
              alignItems: "start",
              columnGap: "2px",
              fontSize: "9px",
              lineHeight: "1.25",
            }}
          >
            <div className="font-bold">State</div>
            <div>:</div>
            <div>{data[0]?.partyState || ""}</div>

            <div className="font-bold">State Code</div>
            <div>:</div>
            <div>{data[0]?.partyTaxStateCode || ""}</div>

            <div className="font-bold">GSTIN</div>
            <div>:</div>
            <div>{data[0]?.partyGstin || ""}</div>
          </div>
        </div>
        <div className="ps-1 " style={{ fontSize: "9px", width: "40%" }}>
          <div className="flex w-full">
            <p className="font-bold" style={{ width: "35%" }}>
              Invoice No.{" "}
            </p>
            <p style={{ width: "65%" }}>: {data[0]?.invoiceNo || ""}</p>
          </div>
          <div className="flex pt-1 w-full">
            <p className="font-bold" style={{ width: "35%" }}>
              Invoice Date{" "}
            </p>
            <p style={{ width: "65%" }}>
              : {formatDateToDDMMYYYY(data[0]?.invoiceDate) || ""}
            </p>
          </div>
          <div className="flex pt-1 w-full">
            <p className="font-bold" style={{ width: "35%" }}>
              Credit Period{" "}
            </p>
            <p style={{ width: "65%" }}>: {data[0]?.creditPeriod || ""}</p>
          </div>
          <div className="flex pt-1 w-full">
            <p className="font-bold" style={{ width: "35%" }}>
              Due Date{" "}
            </p>
            <p style={{ width: "65%" }}>
              : {formatDateToDDMMYYYY(data[0]?.dueDate) || ""}
            </p>
          </div>
          <div className="flex pt-1 w-full">
            <p className="font-bold" style={{ width: "35%" }}>
              Vendor No/Date{" "}
            </p>
            <p style={{ width: "65%" }}>
              : {data[0]?.vendorInvoiceNo || ""} /{" "}
              {formatDateToDDMMYYYY(data[0]?.vendorInvoiceDate) || ""}
            </p>
          </div>
        </div>
      </div>
    );
  };

  const GeneralSalesInvoiceBillingDetails = ({ data }) => {
    return (
      <div className="flex border-r border-l border-b border-black p-1">
        <div style={{ fontSize: "9px", width: "60%" }}>
          <div className="flex w-full">
            <p className="font-bold" style={{ width: "25%" }}>
              Party Name:{" "}
            </p>
            <p style={{ width: "75%" }}>: {data[0]?.party || ""}</p>
          </div>
          <div className="flex pt-1 w-full">
            <p className="font-bold" style={{ width: "25%" }}>
              Party Pan No.{" "}
            </p>
            <p style={{ width: "75%" }}>: {data[0]?.partyPanNo || ""}</p>
          </div>
          <div className="flex pt-1 w-full">
            <p className="font-bold" style={{ width: "25%" }}>
              Address{" "}
            </p>
            <p className="flex w-full" style={{ width: "75%" }}>
              : <p className="ps-1">{data[0]?.billingPartyAddress || ""}</p>
            </p>
          </div>
          <div className="flex w-full">
            <div className="flex pt-1 w-full">
              <p className="font-bold" style={{ width: "25%" }}>
                State{" "}
              </p>
              <p style={{ width: "75%" }}>: {data[0]?.partyState || ""}</p>
            </div>
            <div className="flex pt-1 w-full">
              <p className="font-bold" style={{ width: "45%" }}>
                State Code{" "}
              </p>
              <p style={{ width: "55%" }}>
                : {data[0]?.partyTaxStateCode || ""}
              </p>
            </div>
            <div className="flex pt-1 w-full">
              <p className="font-bold" style={{ width: "25%" }}>
                GSTIN{" "}
              </p>
              <p style={{ width: "75%" }}>: {data[0]?.partyGstin || ""}</p>
            </div>
          </div>
        </div>
        <div className="ps-2 pb-2" style={{ fontSize: "9px", width: "40%" }}>
          <div className="flex w-full">
            <p className="font-bold" style={{ width: "30%" }}>
              Invoice No.{" "}
            </p>
            <p style={{ width: "70%" }}>: {data[0]?.invoiceNo || ""}</p>
          </div>
          <div className="flex pt-1 w-full">
            <p className="font-bold" style={{ width: "30%" }}>
              Invoice Date{" "}
            </p>
            <p style={{ width: "70%" }}>
              : {formatDateToDDMMYYYY(data[0]?.invoiceDate) || ""}
            </p>
          </div>
        </div>
      </div>
    );
  };

  const CreditNoteBillingDetails = ({ data }) => {
    return (
      <div className="flex border-r border-l border-b border-black p-1">
        <div style={{ fontSize: "9px", width: "40%" }}>
          <div className="flex w-full">
            <p className="font-bold" style={{ width: "38%" }}>
              Billing Party Name{" "}
            </p>
            <p style={{ width: "62%" }}>: {data[0]?.party || ""}</p>
          </div>
          <div className="flex pt-1 w-full">
            <p className="font-bold" style={{ width: "38%" }}>
              Address{" "}
            </p>
            <p className="flex w-full" style={{ width: "62%" }}>
              : <p className="ps-1">{data[0]?.billingPartyAddress || ""}</p>
            </p>
          </div>
        </div>
        <div className="ps-1 pb-2" style={{ fontSize: "9px", width: "25%" }}>
          <div className="flex w-full">
            <p className="font-bold" style={{ width: "35%" }}>
              PAN No.{" "}
            </p>
            <p style={{ width: "65%" }}>: {data[0]?.partyPanNo || ""}</p>
          </div>
          <div className="flex pt-1 w-full">
            <p className="font-bold" style={{ width: "35%" }}>
              State{" "}
            </p>
            <p style={{ width: "65%" }}>: {data[0]?.partyState || ""}</p>
          </div>
          <div className="flex pt-1 w-full">
            <p className="font-bold" style={{ width: "35%" }}>
              State Code{" "}
            </p>
            <p style={{ width: "65%" }}>: {data[0]?.partyTaxStateCode || ""}</p>
          </div>
          <div className="flex pt-1 w-full">
            <p className="font-bold" style={{ width: "35%" }}>
              GSTIN{" "}
            </p>
            <p style={{ width: "65%" }}>: {data[0]?.partyGstin || ""}</p>
          </div>
        </div>
        <div className="ps-2 pb-2" style={{ fontSize: "9px", width: "35%" }}>
          <div className="flex w-full">
            <p className="font-bold" style={{ width: "30%" }}>
              Invoice No.{" "}
            </p>
            <p style={{ width: "70%" }}>: {data[0]?.invoiceNo || ""}</p>
          </div>
          <div className="flex pt-1 w-full">
            <p className="font-bold" style={{ width: "30%" }}>
              Invoice Date{" "}
            </p>
            <p style={{ width: "70%" }}>
              : {formatDateToDDMMYYYY(data[0]?.invoiceDate) || ""}
            </p>
          </div>
          <div className="flex pt-1 w-full">
            <p className="font-bold" style={{ width: "25%" }}>
              Credit Period{" "}
            </p>
            <p style={{ width: "25%" }}>: {data[0]?.creditPeriod || ""}</p>
            <p className="font-bold" style={{ width: "25%" }}>
              Due Date{" "}
            </p>
            <p style={{ width: "25%" }}>
              : {formatDateToDDMMYYYY(data[0]?.dueDate) || ""}
            </p>
          </div>

          <div className="flex pt-1 w-full">
            <p className="font-bold" style={{ width: "35%" }}>
              Parent Invoice No{" "}
            </p>
            <p style={{ width: "65%" }}>: {data[0]?.parentInvoiceNo || ""}</p>
          </div>
        </div>
      </div>
    );
  };

  const ImportTaxInvoiceBillingDetails = ({ data }) => {
    return (
      <div className="flex border-r border-l border-b border-black p-2">
        <div style={{ fontSize: "8px", width: "40%" }}>
          <div className="flex w-full">
            <p
              className="font-bold"
              style={{
                width: "40%",
                display: "flex",
                justifyContent: "space-between",
              }}
            >
              <span>Billing Party Name</span>
              <span className="pr-1">:</span>
            </p>
            <p style={{ width: "60%" }}>{data[0]?.party || ""}</p>
          </div>
          <div className="flex pt-1 w-full">
            <p
              className="font-bold"
              style={{
                width: "40%",
                display: "flex",
                justifyContent: "space-between",
              }}
            >
              <span>Address</span>
              <span className="pr-1">:</span>
            </p>
            <p style={{ width: "60%" }}>{data[0]?.billingPartyAddress || ""}</p>
          </div>
        </div>
        <div
          className="ps-2 pt-1 pb-2"
          style={{ fontSize: "8px", width: "24%" }}
        >
          <div className="flex w-full">
            <p
              className="font-bold"
              style={{
                width: "35%",
                display: "flex",
                justifyContent: "space-between",
              }}
            >
              <span>PAN No.</span>
              <span className="pr-1">:</span>
            </p>
            <p style={{ width: "65%" }}>{data[0]?.partyPanNo || ""}</p>
          </div>
          <div className="flex pt-1 w-full">
            <p
              className="font-bold"
              style={{
                width: "35%",
                display: "flex",
                justifyContent: "space-between",
              }}
            >
              <span>State</span>
              <span className="pr-1">:</span>
            </p>
            <p style={{ width: "65%" }}>{data[0]?.partyState || ""}</p>
          </div>
          <div className="flex pt-1 w-full">
            <p
              className="font-bold"
              style={{
                width: "35%",
                display: "flex",
                justifyContent: "space-between",
              }}
            >
              <span>State Code</span>
              <span className="pr-1">:</span>
            </p>
            <p style={{ width: "65%" }}>{data[0]?.partyTaxStateCode || ""}</p>
          </div>
          <div className="flex pt-1 w-full">
            <p
              className="font-bold"
              style={{
                width: "35%",
                display: "flex",
                justifyContent: "space-between",
              }}
            >
              <span>GSTIN</span>
              <span className="pr-1">:</span>
            </p>
            <p style={{ width: "65%" }}>{data[0]?.partyGstin || ""}</p>
          </div>
        </div>
        <div
          className="ps-2 pt-1 pb-2"
          style={{ fontSize: "8px", width: "41%" }}
        >
          <div className="flex w-full">
            <p
              className="font-bold"
              style={{
                width: "30%",
                display: "flex",
                justifyContent: "space-between",
              }}
            >
              <span>Invoice No.</span>
              <span className="pr-1">:</span>
            </p>
            <p style={{ width: "70%" }}>{data[0]?.invoiceNo || ""}</p>
          </div>
          <div className="flex pt-1 w-full">
            <p
              className="font-bold"
              style={{
                width: "30%",
                display: "flex",
                justifyContent: "space-between",
              }}
            >
              <span>Invoice Date</span>
              <span className="pr-1">:</span>
            </p>
            <p style={{ width: "70%" }}>
              {formatDateToDDMMYYYY(data[0]?.invoiceDate) || ""}
            </p>
          </div>
          <div className="flex pt-1 w-full">
            <p
              className="font-bold"
              style={{
                width: "30%",
                display: "flex",
                justifyContent: "space-between",
              }}
            >
              <span>Credit Period</span>
              <span className="pr-1">:</span>
            </p>
            <p style={{ width: "70%" }}>{data[0]?.creditPeriod || ""}</p>
          </div>
          <div className="flex pt-1 w-full">
            <p
              className="font-bold"
              style={{
                width: "30%",
                display: "flex",
                justifyContent: "space-between",
              }}
            >
              <span>Due Date</span>
              <span className="pr-1">:</span>
            </p>
            <p style={{ width: "70%" }}>
              {formatDateToDDMMYYYY(data[0]?.dueDate) || ""}
            </p>
          </div>
        </div>
      </div>
    );
  };

  const TgkTaxInvoiceBillingDetails = ({ data }) => {
    return (
      <div className="flex border-r border-l border-b border-black p-2">
        <div style={{ fontSize: "9px", width: "40%" }}>
          <div className="flex w-full">
            <p className="font-bold" style={{ width: "40%" }}>
              Billing Party Name :{" "}
            </p>
            <p style={{ width: "60%" }}>{data[0]?.party || ""}</p>
          </div>
          <div className="flex pt-1 w-full">
            <p className="font-bold" style={{ width: "40%" }}>
              Address :{" "}
            </p>
            <p style={{ width: "60%" }}>{data[0]?.billingPartyAddress || ""}</p>
          </div>
        </div>
        <div
          className="ps-2 pt-1 pb-2"
          style={{ fontSize: "9px", width: "24%" }}
        >
          <div className="flex w-full">
            <p className="font-bold" style={{ width: "35%" }}>
              TIN No. :{" "}
            </p>
            <p style={{ width: "65%" }}>{data[0]?.partyPanNo || ""}</p>
          </div>
          <div className="flex pt-1 w-full">
            <p className="font-bold" style={{ width: "35%" }}>
              SST No. :{" "}
            </p>
            <p style={{ width: "65%" }}>{data[0]?.partyState || ""}</p>
          </div>
        </div>
        <div
          className="ps-2 pt-1 pb-2"
          style={{ fontSize: "9px", width: "41%" }}
        >
          <div className="flex w-full">
            <p className="font-bold" style={{ width: "30%" }}>
              Invoice No. :{" "}
            </p>
            <p style={{ width: "70%" }}>{data[0]?.invoiceNo || ""}</p>
          </div>
          <div className="flex pt-1 w-full">
            <p className="font-bold" style={{ width: "30%" }}>
              Invoice Date :{" "}
            </p>
            <p style={{ width: "70%" }}>
              {formatDateToDDMMYYYY(data[0]?.invoiceDate) || ""}
            </p>
          </div>
          <div className="flex pt-1 w-full">
            <p className="font-bold" style={{ width: "30%" }}>
              Credit Period :{" "}
            </p>
            <p style={{ width: "70%" }}>{data[0]?.creditPeriod || ""}</p>
          </div>
          <div className="flex pt-1 w-full">
            <p className="font-bold" style={{ width: "30%" }}>
              Due Date :{" "}
            </p>
            <p style={{ width: "70%" }}>
              {formatDateToDDMMYYYY(data[0]?.dueDate) || ""}
            </p>
          </div>
        </div>
      </div>
    );
  };

  const InvoicePrintBillingDetails = ({ data }) => {
    return (
      <div>
        <div
          className="flex border-r border-l border-b border-black "
          style={{ minHeight: "90px", maxHeight: "90px" }}
        >
          <div
            className="p-2"
            style={{
              fontSize: "9px",
              width: "50%",
              borderRight: "1px solid black",
            }}
          >
            <div className="flex w-full">
              <p className="font-bold" style={{ width: "15%" }}>
                Invoice To :{" "}
              </p>
              <p style={{ width: "85%" }}>{data[0]?.party || ""}</p>
            </div>
            <div className="flex pt-1 w-full">
              <p className="font-bold" style={{ width: "15%" }}>
                {" "}
              </p>
              <p style={{ width: "85%" }}>
                {data[0]?.billingPartyAddress || ""}
              </p>
            </div>
            <div className="flex w-full">
              <p className="font-bold" style={{ width: "15%" }}>
                TAX No. :{" "}
              </p>
              <p style={{ width: "85%" }}>{data[0]?.partyPanNo || ""}</p>
            </div>
          </div>
          <div className="p-1 " style={{ fontSize: "9px", width: "50%" }}>
            <div
              className="flex w-full pb-1"
              style={{ fontSize: "9px", width: "50%" }}
            >
              <p className="font-bold" style={{ width: "35%" }}>
                Invoice No. :{" "}
              </p>
              <p style={{ width: "65%" }}>{data[0]?.invoiceNo || ""}</p>
            </div>
            <div
              className="flex w-full pb-1"
              style={{ fontSize: "9px", width: "50%" }}
            >
              <p className="font-bold" style={{ width: "35%" }}>
                Invoice Date :{" "}
              </p>
              <p style={{ width: "65%" }}>{data[0]?.invoiceDate || ""}</p>
            </div>
            <div
              className="flex w-full pb-1"
              style={{ fontSize: "9px", width: "50%" }}
            >
              <p className="font-bold" style={{ width: "35%" }}>
                Due Date :{" "}
              </p>
              <p style={{ width: "65%" }}>{data[0]?.dueDate || ""}</p>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const InvoicePrintBillingDetailsCreditNote = ({ data }) => {
    return (
      <div>
        <div
          className="flex border-r border-l border-b border-black "
          style={{ minHeight: "90px", maxHeight: "90px" }}
        >
          <div
            className="p-2"
            style={{
              fontSize: "9px",
              width: "50%",
              borderRight: "1px solid black",
            }}
          >
            <div className="flex w-full">
              <p className="font-bold" style={{ width: "15%" }}>
                Invoice To :{" "}
              </p>
              <p style={{ width: "85%" }}>{data[0]?.party || ""}</p>
            </div>
            <div className="flex pt-1 w-full">
              <p className="font-bold" style={{ width: "15%" }}>
                {" "}
              </p>
              <p style={{ width: "85%" }}>
                {data[0]?.billingPartyAddress || ""}
              </p>
            </div>
            <div className="flex w-full">
              <p className="font-bold" style={{ width: "15%" }}>
                TAX No. :{" "}
              </p>
              <p style={{ width: "85%" }}>{data[0]?.partyPanNo || ""}</p>
            </div>
          </div>
          <div className="p-1 " style={{ fontSize: "9px", width: "50%" }}>
            <div
              className="flex w-full pb-1"
              style={{ fontSize: "9px", width: "50%" }}
            >
              <p className="font-bold" style={{ width: "35%" }}>
                Invoice No. :{" "}
              </p>
              <p style={{ width: "65%" }}>{data[0]?.invoiceNo || ""}</p>
            </div>
            <div
              className="flex w-full pb-1"
              style={{ fontSize: "9px", width: "50%" }}
            >
              <p className="font-bold" style={{ width: "35%" }}>
                Invoice Date :{" "}
              </p>
              <p style={{ width: "65%" }}>{data[0]?.invoiceDate || ""}</p>
            </div>
            <div
              className="flex w-full pb-1"
              style={{ fontSize: "9px", width: "50%" }}
            >
              <p className="font-bold" style={{ width: "35%" }}>
                Due Date :{" "}
              </p>
              <p style={{ width: "65%" }}>{data[0]?.dueDate || ""}</p>
            </div>
            <div
              className="flex w-full pb-1"
              style={{ fontSize: "9px", width: "50%" }}
            >
              <p className="font-bold" style={{ width: "37%" }}>
                Parent Invoice :{" "}
              </p>
              <p style={{ width: "63%" }}>{data[0]?.parentInvoiceNo || ""}</p>
            </div>
          </div>
        </div>
        <div>
          {/* <div
            className="p-1"
            style={{
              fontSize: "9px",
              width: "50%",
              // borderRight: "1px solid black",
            }}
          >
            <div className="flex w-full">
              <p className="font-bold" style={{ width: "15%" }}>
                TAX No. :{" "}
              </p>
              <p style={{ width: "85%" }}>{data[0]?.ownPanNo || ""}</p>
            </div>
          </div> */}
          {/* <div
            className="p-1 flex w-full"
            style={{ fontSize: "9px", width: "50%" }}
          >
            <div
              className="flex w-full"
              style={{ fontSize: "9px", width: "50%" }}
            >
              <p className="font-bold" style={{ width: "35%" }}>
                Invoice No. :{" "}
              </p>
              <p style={{ width: "65%" }}>{data[0]?.invoiceNo || ""}</p>
            </div>
            <div
              className="flex w-full"
              style={{ fontSize: "9px", width: "50%" }}
            >
              <p className="font-bold" style={{ width: "35%" }}>
                Invoice Date :{" "}
              </p>
              <p style={{ width: "65%" }}>
                {data[0]?.invoiceDate || ""}
              </p>
            </div>
          </div> */}
        </div>
      </div>
    );
  };

  const SundryInvoicePrintBillingDetails = ({ data }) => {
    return (
      <div>
        <div
          className="flex border-r border-l border-b border-black "
          style={{ minHeight: "90px", maxHeight: "90px" }}
        >
          <div
            className="p-2"
            style={{
              fontSize: "9px",
              width: "50%",
              borderRight: "1px solid black",
            }}
          >
            <div className="flex w-full">
              <p className="font-bold" style={{ width: "15%" }}>
                Invoice To :{" "}
              </p>
              <p style={{ width: "85%" }}>{data[0]?.party || ""}</p>
            </div>
            <div className="flex pt-1 w-full">
              <p className="font-bold" style={{ width: "15%" }}>
                {" "}
              </p>
              <p style={{ width: "85%" }}>
                {data[0]?.billingPartyAddress || ""}
              </p>
            </div>
            <div className="flex w-full">
              <p className="font-bold" style={{ width: "15%" }}>
                TAX No. :{" "}
              </p>
              <p style={{ width: "85%" }}>{data[0]?.partyPanNo || ""}</p>
            </div>
          </div>
          <div className="p-1 " style={{ fontSize: "9px", width: "50%" }}>
            <div
              className="flex w-full pb-1"
              style={{ fontSize: "9px", width: "50%" }}
            >
              <p className="font-bold" style={{ width: "35%" }}>
                Invoice No. :{" "}
              </p>
              <p style={{ width: "65%" }}>{data[0]?.invoiceNo || ""}</p>
            </div>
            <div
              className="flex w-full pb-1"
              style={{ fontSize: "9px", width: "50%" }}
            >
              <p className="font-bold" style={{ width: "35%" }}>
                Invoice Date :{" "}
              </p>
              <p style={{ width: "65%" }}>{data[0]?.invoiceDate || ""}</p>
            </div>
            <div
              className="flex w-full pb-1"
              style={{ fontSize: "9px", width: "50%" }}
            >
              <p className="font-bold" style={{ width: "35%" }}>
                Due Date :{" "}
              </p>
              <p style={{ width: "65%" }}>{data[0]?.dueDate || ""}</p>
            </div>
            <div
              className="flex w-full pb-1"
              style={{ fontSize: "9px", width: "50%" }}
            >
              <p className="font-bold" style={{ width: "35%" }}>
                Job No. :{" "}
              </p>
              <p style={{ width: "65%" }}>{data[0]?.jobNo || ""}</p>
            </div>
          </div>
        </div>
        <div
          className=" border-r border-l border-b border-black pl-2 pt-1 "
          style={{ minHeight: "45px", maxHeight: "45px" }}
        >
          <div className="flex w-full pb-1">
            <p className="font-bold" style={{ fontSize: "9px ", width: "10%" }}>
              Remarks :
            </p>
            <p style={{ fontSize: "9px ", width: "90%" }}>
              {data[0]?.remarks || ""}
            </p>
          </div>
        </div>
      </div>
    );
  };
  const SubLeaseInvoicePrintBillingDetails = ({ data }) => {
    return (
      <div>
        <div
          className="flex border-r border-l border-b border-black "
          style={{ minHeight: "80px", maxHeight: "80px" }}
        >
          <div
            className="p-2"
            style={{
              fontSize: "9px",
              width: "50%",
              borderRight: "1px solid black",
            }}
          >
            <div className="flex w-full">
              <p className="font-bold" style={{ width: "15%" }}>
                Invoice To :{" "}
              </p>
              <p style={{ width: "85%" }}>{data[0]?.party || ""}</p>
            </div>
            <div className="flex pt-1 w-full">
              <p className="font-bold" style={{ width: "15%" }}>
                {" "}
              </p>
              <p style={{ width: "85%" }}>
                {data[0]?.billingPartyAddress || ""}
              </p>
            </div>
            <div className="flex w-full">
              <p className="font-bold" style={{ width: "15%" }}>
                TAX No. :{" "}
              </p>
              <p style={{ width: "85%" }}>{data[0]?.partyPanNo || ""}</p>
            </div>
          </div>
          <div className="p-1 " style={{ fontSize: "9px", width: "50%" }}>
            <div className="flex w-full pb-1">
              <div className="flex w-full" style={{ width: "65%" }}>
                <p className="font-bold" style={{ width: "30%" }}>
                  Invoice No. :{" "}
                </p>
                <p style={{ width: "70%" }}>{data[0]?.invoiceNo || ""}</p>
              </div>
              <div className="flex w-full" style={{ width: "35%" }}>
                <p className="font-bold" style={{ width: "45%" }}>
                  Date :{" "}
                </p>
                <p style={{ width: "55%" }}>{data[0]?.invoiceDate || ""}</p>
              </div>
            </div>
            <div className="flex w-full pb-1">
              <div className="flex w-full" style={{ width: "65%" }}>
                <p className="font-bold" style={{ width: "30%" }}>
                  Job No. :{" "}
                </p>
                <p style={{ width: "70%" }}>
                  {data[0]?.containerTransactionNo || ""}
                </p>
              </div>
              <div className="flex w-full" style={{ width: "35%" }}>
                <p className="font-bold" style={{ width: "45%" }}>
                  Due Date :{" "}
                </p>
                <p style={{ width: "55%" }}>{data[0]?.dueDate || ""}</p>
              </div>
            </div>
            <div className="flex w-full pb-1">
              <div className="flex w-full" style={{ width: "65%" }}>
                <p className="font-bold" style={{ width: "30%" }}>
                  From Location :{" "}
                </p>
                <p style={{ width: "70%" }}>
                  {data[0]?.containerTransactionPort || ""}
                </p>
              </div>
              <div className="flex w-full" style={{ width: "35%" }}>
                <p className="font-bold" style={{ width: "45%" }}>
                  From Date :{" "}
                </p>
                <p style={{ width: "55%" }}>{data[0]?.fromDate || ""}</p>
              </div>
            </div>
            <div className="flex w-full pb-1">
              <div className="flex w-full" style={{ width: "65%" }}>
                <p className="font-bold" style={{ width: "30%" }}>
                  To Location :{" "}
                </p>
                <p style={{ width: "70%" }}>
                  {data[0]?.containerTransactionToLoc || ""}
                </p>
              </div>
              <div className="flex w-full" style={{ width: "35%" }}>
                <p className="font-bold" style={{ width: "45%" }}>
                  To Date :{" "}
                </p>
                <p style={{ width: "55%" }}>{data[0]?.toDate || ""}</p>
              </div>
            </div>
          </div>
        </div>
        <div
          className=" border-r border-l border-b border-black pl-2 pt-1 "
          style={{ minHeight: "45px", maxHeight: "45px" }}
        >
          <div className="flex w-full pb-1">
            <p className="font-bold" style={{ fontSize: "9px ", width: "10%" }}>
              Remarks :
            </p>
            <p style={{ fontSize: "9px ", width: "90%" }}>
              {data[0]?.remarks || ""}
            </p>
          </div>
        </div>
      </div>
    );
  };
  const SalesInvoiceContainerWiseBillingDetails = ({ data }) => {
    return (
      <div>
        <div
          className="flex border-r border-l border-b border-black "
          style={{ minHeight: "80px", maxHeight: "80px" }}
        >
          <div
            className="p-2"
            style={{
              fontSize: "9px",
              width: "50%",
              borderRight: "1px solid black",
            }}
          >
            <div className="flex w-full">
              <p className="font-bold" style={{ width: "15%" }}>
                Invoice To :{" "}
              </p>
              <p style={{ width: "85%" }}>{data[0]?.party || ""}</p>
            </div>
            <div className="flex pt-1 w-full">
              <p className="font-bold" style={{ width: "15%" }}>
                {" "}
              </p>
              <p style={{ width: "85%" }}>
                {data[0]?.billingPartyAddress || ""}
              </p>
            </div>
            <div className="flex w-full">
              <p className="font-bold" style={{ width: "15%" }}>
                TAX No. :{" "}
              </p>
              <p style={{ width: "85%" }}>{data[0]?.partyPanNo || ""}</p>
            </div>
          </div>
          <div className="p-1 " style={{ fontSize: "9px", width: "50%" }}>
            <div className="flex w-full pb-1">
              <div className="flex w-full" style={{ width: "65%" }}>
                <p className="font-bold" style={{ width: "30%" }}>
                  Invoice No. :{" "}
                </p>
                <p style={{ width: "70%" }}>{data[0]?.invoiceNo || ""}</p>
              </div>
              <div className="flex w-full" style={{ width: "35%" }}>
                <p className="font-bold" style={{ width: "45%" }}>
                  Date :{" "}
                </p>
                <p style={{ width: "55%" }}>{data[0]?.invoiceDate || ""}</p>
              </div>
            </div>
            <div className="flex w-full pb-1">
              <div className="flex w-full">
                <p className="font-bold" style={{ width: "20%" }}>
                  Due Date :{" "}
                </p>
                <p style={{ width: "80%" }}>{data[0]?.dueDate || ""}</p>
              </div>
            </div>
            <div className="flex w-full pb-1">
              <div className="flex w-full">
                <p className="font-bold" style={{ width: "20%" }}>
                  From Date :{" "}
                </p>
                <p style={{ width: "80%" }}>{data[0]?.fromDate || ""}</p>
              </div>
            </div>
            <div className="flex w-full pb-1">
              <div className="flex w-full">
                <p className="font-bold" style={{ width: "20%" }}>
                  To Date :{" "}
                </p>
                <p style={{ width: "80%" }}>{data[0]?.toDate || ""}</p>
              </div>
            </div>
          </div>
        </div>
        <div
          className=" border-r border-l border-b border-black pl-2 pt-1 "
          style={{ minHeight: "45px", maxHeight: "45px" }}
        >
          <div className="flex w-full pb-1">
            <p className="font-bold" style={{ fontSize: "9px ", width: "10%" }}>
              Remarks :
            </p>
            <p style={{ fontSize: "9px ", width: "90%" }}>
              {data[0]?.remarks || ""}
            </p>
          </div>
        </div>
      </div>
    );
  };
  const TaxInvoiceJobDetails = ({ data }) => {
    const sizeType = (data?.[0]?.sizeTypeContainer ?? "").replaceAll("/", ", ");
    console.log("sizeType", sizeType);
    return (
      <div className="flex border-r border-l border-b border-black">
        <div className="p-1" style={{ fontSize: "9px", width: "38%" }}>
          {/* <div className="flex w-full">
            <p className="font-bold" style={{ width: "40%" }}>
              Job No. {" "}
            </p>
            <p style={{ width: "60%" }}>: {data[0]?.jobNo || ""}</p>
          </div> */}
          <div className="flex pt-1 w-full">
            <p className="font-bold" style={{ width: "40%" }}>
              MB/L No.{" "}
            </p>
            <p style={{ width: "60%" }}>: {data[0]?.mblNo || ""}</p>
          </div>
          <div className="flex pt-1 w-full">
            <p className="font-bold" style={{ width: "40%" }}>
              HB/L No.{" "}
            </p>
            <p style={{ width: "60%" }}>: {data[0]?.hblNo || ""}</p>
          </div>
          <div className="flex pt-1 w-full">
            <p className="font-bold" style={{ width: "40%" }}>
              Vessel/Voy{" "}
            </p>
            {/* <p style={{ width: "60%" }}>
              : {data[0]?.jobVessel || ""} / {data[0]?.jobVoyageNo || ""}
            </p> */}
            {/* Vessel and  VoyageNo has been changes to BL vessel and voyage no as discussed with Nilay sir and shahnaz on date 21-05-2026 that it will come from */}
            <p style={{ width: "60%" }}>
              : {data[0]?.blVesselName || ""} / {data[0]?.voyageNo || ""}
            </p>
          </div>
          <div className="flex pt-1 w-full">
            <p className="font-bold" style={{ width: "40%" }}>
              POL{" "}
            </p>
            <p style={{ width: "60%" }}>: {data[0]?.pol || ""}</p>
          </div>
          <div className="flex pt-1 w-full">
            <p className="font-bold" style={{ width: "40%" }}>
              POD{" "}
            </p>
            <p style={{ width: "60%" }}>: {data[0]?.pod || ""}</p>
          </div>
          {clientId != 17 && (
            <div className="flex pt-1 w-full">
              <p className="font-bold" style={{ width: "40%" }}>
                Shipment Terms{" "}
              </p>
              <p style={{ width: "60%" }}>
                :{" "}
                {clientId == 25
                  ? data[0]?.deliveryType || ""
                  : data[0]?.tradeTerms || ""}
              </p>
            </div>
          )}
          <div className="flex pt-1 w-full">
            <p className="font-bold" style={{ width: "40%" }}>
              Place Of Supply{" "}
            </p>
            <p style={{ width: "60%" }}>: {data[0]?.placeOfSupply || ""}</p>
          </div>
          <div className="flex pt-1 w-full">
            <p className="font-bold" style={{ width: "40%" }}>
              Terminal{" "}
            </p>
            <p style={{ width: "60%" }}>: {data[0]?.terminal || ""}</p>
          </div>
        </div>
        <div
          className="border-r border-black p-1"
          style={{ fontSize: "9px", width: "22%" }}
        >
          {/* <div className="flex w-full">
            <p className="font-bold" style={{ width: "40%" }}>
              Date {" "}
            </p>
            <p style={{ width: "60%" }}>
              : {formatDateToDDMMYYYY(data[0]?.jobDate) || ""}
            </p>
          </div> */}
          <div className="flex pt-1 w-full">
            <p className="font-bold" style={{ width: "40%" }}>
              Date{" "}
            </p>
            <p style={{ width: "60%" }}>
              : {formatDateToDDMMYYYY(data[0]?.mblDate) || ""}
            </p>
          </div>
          <div className="flex pt-1 w-full">
            <p className="font-bold" style={{ width: "40%" }}>
              Date{" "}
            </p>
            <p style={{ width: "60%" }}>
              : {formatDateToDDMMYYYY(data[0]?.hblDate) || ""}
            </p>
          </div>
          <div className="flex pt-1 w-full">
            <p className="font-bold" style={{ width: "40%" }}>
              Date{" "}
            </p>
            <p style={{ width: "60%" }}>
              :{" "}
              {formatDateToDDMMYYYY(
                clientId == 25 ? data[0]?.sobDate : data[0]?.arrivalDate,
              ) || ""}
            </p>
          </div>
          <div className="flex pt-1 w-full">
            <p className="font-bold" style={{ width: "40%" }}>
              PLR{" "}
            </p>
            <p style={{ width: "60%" }}>: {data[0]?.plr || ""}</p>
          </div>
          <div className="flex pt-1 w-full">
            <p className="font-bold" style={{ width: "40%" }}>
              FPD{" "}
            </p>
            <p style={{ width: "60%" }}>: {data[0]?.fpd || ""}</p>
          </div>
          <div className="flex pt-1 w-full">
            <p className="font-bold" style={{ width: "40%" }}>
              Size Type{" "}
            </p>
            <p style={{ width: "60%" }}>: {sizeType || ""}</p>
          </div>
        </div>
        <div className="p-1" style={{ fontSize: "9px", width: "40%" }}>
          <div className="flex w-full">
            <p className="font-bold" style={{ width: "40%" }}>
              Shipper.{" "}
            </p>
            <p style={{ width: "60%" }}>: {data[0]?.shipper || ""}</p>
          </div>
          <div className="flex pt-1 w-full">
            <p className="font-bold" style={{ width: "40%" }}>
              Consignee{" "}
            </p>
            <p style={{ width: "60%" }}>
              : {data[0]?.consignee || data[0]?.consigneeText || ""}
            </p>
          </div>
          <div className="flex pt-1 w-full">
            <p className="font-bold" style={{ width: "40%" }}>
              Cargo Type{" "}
            </p>
            <p style={{ width: "60%" }}>
              : {data[0]?.cargoType || ""}
              {" / "}
              {data[0]?.containerStatus || ""}
            </p>
          </div>
          <div className="flex pt-1 w-full">
            <p className="font-bold" style={{ width: "40%" }}>
              Commodity{" "}
            </p>
            <p style={{ width: "60%" }}>: {data[0]?.commodity || ""}</p>
          </div>
          <div className="flex pt-1 w-full">
            <p className="font-bold" style={{ width: "40%" }}>
              Cargo Weight{" "}
            </p>
            <p style={{ width: "60%" }}>
              : {data[0]?.cargoWeight || ""} {data[0]?.wtUnitName || ""}
            </p>
          </div>
          <div className="flex pt-1 w-full">
            <p className="font-bold" style={{ width: "40%" }}>
              No. of Pkg{" "}
            </p>
            <p style={{ width: "60%" }}>
              : {data[0]?.blNoOfPackages || ""}{" "}
              {data[0]?.packagingTypeCode || ""}
            </p>
          </div>
          <div className="flex pt-1 w-full">
            <p className="font-bold" style={{ width: "40%" }}>
              Shipper Ref.No.{" "}
            </p>
            <p style={{ width: "60%" }}>: {data[0]?.shipperRefNo || ""}</p>
          </div>
          <div className="flex pt-1 w-full">
            <p className="font-bold" style={{ width: "25%" }}>
              Ex. Rate{" "}
            </p>
            <p style={{ width: "25%" }}>: {data[0]?.exchangeRate || ""}</p>
            <p className="font-bold" style={{ width: "25%" }}>
              Free Days{" "}
            </p>
            <p style={{ width: "25%" }}>: {data[0]?.freeDays || ""}</p>
          </div>
        </div>
      </div>
    );
  };

  const DomesticInvoiceJobDetails = ({ data }) => {
    const sizeType = (data?.[0]?.sizeTypeContainer ?? "").replaceAll("/", ", ");
    return (
      <div className="flex border-r border-l border-b border-black">
        <div className="p-1" style={{ fontSize: "9px", width: "38%" }}>
          <div className="flex w-full">
            <p className="font-bold" style={{ width: "40%" }}>
              Job No.{" "}
            </p>
            <p style={{ width: "60%" }}>: {data[0]?.jobNo || ""}</p>
          </div>
          <div className="flex pt-1 w-full">
            <p className="font-bold" style={{ width: "40%" }}>
              FROM PORT{" "}
            </p>
            <p style={{ width: "60%" }}>: {data[0]?.fromLocationId || ""}</p>
          </div>
          <div className="flex pt-1 w-full">
            <p className="font-bold" style={{ width: "40%" }}>
              Size Type{" "}
            </p>
            <p style={{ width: "60%" }}>: {sizeType || ""}</p>
          </div>
        </div>
        <div
          className="border-r border-black"
          style={{ fontSize: "9px", width: "22%" }}
        >
          <div className="flex w-full invisible">
            <p className="font-bold" style={{ width: "40%" }}>
              Date :
            </p>
            <p style={{ width: "60%" }}>
              {formatDateToDDMMYYYY(data[0]?.jobDate) || ""}
            </p>
          </div>

          <div className="flex pt-1 w-full">
            <p className="font-bold" style={{ width: "40%" }}>
              TO PORT{" "}
            </p>
            <p style={{ width: "60%" }}>: {data[0]?.toLocationId || ""}</p>
          </div>
        </div>
        <div className="p-1" style={{ fontSize: "9px", width: "40%" }}>
          <div className="flex pt-1 w-full">
            <p className="font-bold" style={{ width: "40%" }}>
              Consignee{" "}
            </p>
            <p style={{ width: "60%" }}>
              : {data[0]?.consignee || data[0]?.consigneeText || ""}
            </p>
          </div>
          <div className="flex pt-1 w-full">
            <p className="font-bold" style={{ width: "40%" }}>
              Cargo Type{" "}
            </p>
            <p style={{ width: "60%" }}>
              : {data[0]?.cargoType || ""}
              {" / "}
              {data[0]?.containerStatus || ""}
            </p>
          </div>
          <div className="flex pt-1 w-full">
            <p className="font-bold" style={{ width: "40%" }}>
              Ex. Rate{" "}
            </p>
            <p style={{ width: "60%" }}>: {data[0]?.exchangeRate || ""}</p>
          </div>
        </div>
      </div>
    );
  };
  // this is for freight forwarding KJS and SRL
  const TaxInvoiceJobDetailsFF = ({ data }) => {
    const sizeType = (data?.[0]?.sizeTypeContainer ?? "").replaceAll("/", ", ");
    console.log("sizeType", sizeType);
    return (
      <div className="flex border-r border-l border-b border-black">
        <div className="p-1" style={{ fontSize: "9px", width: "38%" }}>
          <div className="flex w-full">
            <p className="font-bold" style={{ width: "40%" }}>
              Job No.{" "}
            </p>
            <p style={{ width: "60%" }}>: {data[0]?.jobNo || ""}</p>
          </div>
          <div className="flex pt-1 w-full">
            <p className="font-bold" style={{ width: "40%" }}>
              MB/L No.{" "}
            </p>
            <p style={{ width: "60%" }}>: {data[0]?.mblNo || ""}</p>
          </div>
          <div className="flex pt-1 w-full">
            <p className="font-bold" style={{ width: "40%" }}>
              HB/L No.{" "}
            </p>
            <p style={{ width: "60%" }}>: {data[0]?.hblNo || ""}</p>
          </div>
          <div className="flex pt-1 w-full">
            <p className="font-bold" style={{ width: "40%" }}>
              Vessel/Voy{" "}
            </p>
            <p style={{ width: "60%" }}>
              : {data[0]?.jobVessel || ""} / {data[0]?.jobVoyageNo || ""}
            </p>
          </div>
          <div className="flex pt-1 w-full">
            <p className="font-bold" style={{ width: "40%" }}>
              POL{" "}
            </p>
            <p style={{ width: "60%" }}>: {data[0]?.pol || ""}</p>
          </div>
          <div className="flex pt-1 w-full">
            <p className="font-bold" style={{ width: "40%" }}>
              POD{" "}
            </p>
            <p style={{ width: "60%" }}>: {data[0]?.pod || ""}</p>
          </div>
          <div className="flex pt-1 w-full">
            <p className="font-bold" style={{ width: "40%" }}>
              Shipment Terms{" "}
            </p>
            <p style={{ width: "60%" }}>: {data[0]?.tradeTerms || ""}</p>
          </div>
          <div className="flex pt-1 w-full">
            <p className="font-bold" style={{ width: "40%" }}>
              Place Of Supply{" "}
            </p>
            <p style={{ width: "60%" }}>: {data[0]?.placeOfSupply || ""}</p>
          </div>
        </div>
        <div
          className="border-r border-black p-1"
          style={{ fontSize: "9px", width: "22%" }}
        >
          <div className="flex w-full">
            <p className="font-bold" style={{ width: "40%" }}>
              Date{" "}
            </p>
            <p style={{ width: "60%" }}>
              : {formatDateToDDMMYYYY(data[0]?.jobDate) || ""}
            </p>
          </div>
          <div className="flex pt-1 w-full">
            <p className="font-bold" style={{ width: "40%" }}>
              Date{" "}
            </p>
            <p style={{ width: "60%" }}>
              : {formatDateToDDMMYYYY(data[0]?.mblDate) || ""}
            </p>
          </div>
          <div className="flex pt-1 w-full">
            <p className="font-bold" style={{ width: "40%" }}>
              Date{" "}
            </p>
            <p style={{ width: "60%" }}>
              : {formatDateToDDMMYYYY(data[0]?.hblDate) || ""}
            </p>
          </div>
          <div className="flex pt-1 w-full">
            <p className="font-bold" style={{ width: "40%" }}>
              Date{" "}
            </p>
            <p style={{ width: "60%" }}>
              : {formatDateToDDMMYYYY(data[0]?.arrivalDate) || ""}
            </p>
          </div>
          <div className="flex pt-1 w-full">
            <p className="font-bold" style={{ width: "40%" }}>
              PLR{" "}
            </p>
            <p style={{ width: "60%" }}>: {data[0]?.plr || ""}</p>
          </div>
          <div className="flex pt-1 w-full">
            <p className="font-bold" style={{ width: "40%" }}>
              FPD{" "}
            </p>
            <p style={{ width: "60%" }}>: {data[0]?.fpd || ""}</p>
          </div>
          <div className="flex pt-1 w-full">
            <p className="font-bold" style={{ width: "40%" }}>
              Size Type{" "}
            </p>
            <p style={{ width: "60%" }}>: {sizeType || ""}</p>
          </div>
        </div>
        <div className="p-1" style={{ fontSize: "9px", width: "40%" }}>
          <div className="flex w-full">
            <p className="font-bold" style={{ width: "40%" }}>
              Shipper.{" "}
            </p>
            <p style={{ width: "60%" }}>: {data[0]?.shipper || ""}</p>
          </div>
          <div className="flex pt-1 w-full">
            <p className="font-bold" style={{ width: "40%" }}>
              Consignee{" "}
            </p>
            <p style={{ width: "60%" }}>
              : {data[0]?.consignee || data[0]?.consigneeText || ""}
            </p>
          </div>
          <div className="flex pt-1 w-full">
            <p className="font-bold" style={{ width: "40%" }}>
              Cargo Type{" "}
            </p>
            <p style={{ width: "60%" }}>
              : {data[0]?.cargoType || ""}
              {" / "}
              {data[0]?.containerStatus || ""}
            </p>
          </div>
          <div className="flex pt-1 w-full">
            <p className="font-bold" style={{ width: "40%" }}>
              Commodity{" "}
            </p>
            <p style={{ width: "60%" }}>: {data[0]?.commodity || ""}</p>
          </div>
          <div className="flex pt-1 w-full">
            <p className="font-bold" style={{ width: "40%" }}>
              Cargo Weight{" "}
            </p>
            <p style={{ width: "60%" }}>
              : {data[0]?.cargoWeight || ""} {data[0]?.wtUnitName || ""}
            </p>
          </div>
          <div className="flex pt-1 w-full">
            <p className="font-bold" style={{ width: "40%" }}>
              No. of Pkg{" "}
            </p>
            <p style={{ width: "60%" }}>
              : {data[0]?.jobNoOfPackages || ""}{" "}
              {data[0]?.jobTypeOfPackages || ""}
              {/* change as told by tabish  as data comes from job not from invoice */}
            </p>
          </div>
          <div className="flex pt-1 w-full">
            <p className="font-bold" style={{ width: "40%" }}>
              Shipper Ref.No.{" "}
            </p>
            <p style={{ width: "60%" }}>: {data[0]?.shipperRefNo || ""}</p>
          </div>
          <div className="flex pt-1 w-full">
            <p className="font-bold" style={{ width: "40%" }}>
              Ex. Rate{" "}
            </p>
            <p style={{ width: "60%" }}>: {data[0]?.exchangeRate || ""}</p>
          </div>
        </div>
      </div>
    );
  };

  const PurchaseInvoiceJobDetails = ({ data }) => {
    const sizeType = (data?.[0]?.sizeTypeContainer ?? "").replaceAll("/", ", ");
    console.log("sizeType", sizeType);
    return (
      <div className="flex border-r border-l border-b border-black">
        <div
          className="p-1"
          style={{
            fontSize: "9px",
            width: "60%",
            borderRight: "1px solid black",
          }}
        >
          <div className="flex w-full">
            <p className="font-bold" style={{ width: "20%" }}>
              BL No.{" "}
            </p>
            <p style={{ width: "80%" }}>: {data[0]?.jobNo || ""}</p>
          </div>
          <div className="flex pt-1 w-full">
            <p className="font-bold" style={{ width: "20%" }}>
              PLR{" "}
            </p>
            <p style={{ width: "80%" }}>: {data[0]?.plr || ""}</p>
          </div>
          <div className="flex pt-1 w-full">
            <p className="font-bold" style={{ width: "20%" }}>
              POD{" "}
            </p>
            <p style={{ width: "80%" }}>: {data[0]?.pod || ""}</p>
          </div>
          <div className="flex pt-1 w-full">
            <p className="font-bold" style={{ width: "20%" }}>
              AGENT{" "}
            </p>
            <p style={{ width: "80%" }}>:{data[0]?.agent || ""}</p>
          </div>
          <div className="flex pt-1 w-full">
            <p className="font-bold" style={{ width: "20%" }}>
              TERMINAL{" "}
            </p>
            <p style={{ width: "80%" }}>
              : {data[0]?.podTerminal || data[0]?.polTerminal || ""}
            </p>
          </div>
          <div className="flex pt-1 w-full">
            <p className="font-bold" style={{ width: "20%" }}>
              From Date{" "}
            </p>
            <p style={{ width: "80%" }}>
              : {formatDateToDDMMYYYY(data[0]?.fromDate) || ""}
            </p>
          </div>
        </div>

        <div className="p-1" style={{ fontSize: "9px", width: "40%" }}>
          <div className="flex w-full">
            <p className="font-bold" style={{ width: "40%" }}>
              Vessel/Voy{" "}
            </p>
            <p className="font-bold" style={{ width: "60%" }}>
              {" "}
              : {data[0]?.blVesselName || ""} / {data[0]?.voyageNo || ""}{" "}
            </p>
          </div>
          <div className="flex pt-1 w-full">
            <p className="font-bold" style={{ width: "40%" }}>
              POL{" "}
            </p>
            <p style={{ width: "60%" }}>: {data[0]?.pol || ""}</p>
          </div>
          <div className="flex pt-1 w-full">
            <p className="font-bold" style={{ width: "40%" }}>
              FPD{" "}
            </p>
            <p style={{ width: "60%" }}>: {data[0]?.fpd || ""}</p>
          </div>
          <div className="flex pt-1 w-full">
            <p className="font-bold" style={{ width: "40%" }}>
              Agent Branch{" "}
            </p>
            <p style={{ width: "60%" }}>: {data[0]?.AgentBranch || ""}</p>
          </div>
          <div className="flex pt-1 w-full">
            <p className="font-bold" style={{ width: "40%" }}>
              Depot{" "}
            </p>
            <p style={{ width: "60%" }}>: {data[0]?.depot || ""}</p>
          </div>
          <div className="flex pt-1 w-full">
            <p className="font-bold" style={{ width: "40%" }}>
              To Date{" "}
            </p>
            <p style={{ width: "60%" }}>
              : {formatDateToDDMMYYYY(data[0]?.toDate) || ""}
            </p>
          </div>
        </div>
      </div>
    );
  };

  const ImportTaxInvoiceJobDetails = ({ data }) => {
    const sizeType = (data?.[0]?.sizeTypeContainer ?? "").replaceAll("/", ", ");
    return (
      <div className="flex border-r border-l border-b border-black">
        <div className="p-1" style={{ fontSize: "8px", width: "38%" }}>
          <div className="flex pt-1 w-full">
            <p
              className="font-bold"
              style={{
                width: "40%",
                display: "flex",
                justifyContent: "space-between",
              }}
            >
              <span>MB/L No.</span>
              <span className="pr-1">:</span>
            </p>
            <p style={{ width: "60%" }}>{data[0]?.mblNo || ""}</p>
          </div>
          <div className="flex pt-1 w-full">
            <p
              className="font-bold"
              style={{
                width: "40%",
                display: "flex",
                justifyContent: "space-between",
              }}
            >
              <span>HB/L No.</span>
              <span className="pr-1">:</span>
            </p>
            <p style={{ width: "60%" }}>{data[0]?.hblNo || ""}</p>
          </div>
          <div className="flex pt-1 w-full">
            <p
              className="font-bold"
              style={{
                width: "40%",
                display: "flex",
                justifyContent: "space-between",
              }}
            >
              <span>Vessel/Voy</span>
              <span className="pr-1">:</span>
            </p>
            <p style={{ width: "60%" }}>
              {data[0]?.vessel || ""} / {data[0]?.voyageNo || ""}
            </p>
          </div>
          <div className="flex pt-1 w-full">
            <p
              className="font-bold"
              style={{
                width: "40%",
                display: "flex",
                justifyContent: "space-between",
              }}
            >
              <span>IGM No</span>
              <span className="pr-1">:</span>
            </p>
            <p style={{ width: "60%" }}>{data[0]?.igmNo || ""}</p>
          </div>
          <div className="flex pt-1 w-full">
            <p
              className="font-bold"
              style={{
                width: "40%",
                display: "flex",
                justifyContent: "space-between",
              }}
            >
              <span>POL</span>
              <span className="pr-1">:</span>
            </p>
            <p style={{ width: "60%" }}>{data[0]?.pol || ""}</p>
          </div>
          <div className="flex pt-1 w-full">
            <p
              className="font-bold"
              style={{
                width: "40%",
                display: "flex",
                justifyContent: "space-between",
              }}
            >
              <span>POD</span>
              <span className="pr-1">:</span>
            </p>
            <p style={{ width: "60%" }}>{data[0]?.pod || ""}</p>
          </div>
          <div className="flex pt-1 w-full">
            <p
              className="font-bold"
              style={{
                width: "40%",
                display: "flex",
                justifyContent: "space-between",
              }}
            >
              <span>Shipment Terms</span>
              <span className="pr-1">:</span>
            </p>
            <p style={{ width: "60%" }}>{data[0]?.tradeTerms || ""}</p>
          </div>
          <div className="flex pt-1 w-full">
            <p
              className="font-bold"
              style={{
                width: "40%",
                display: "flex",
                justifyContent: "space-between",
              }}
            >
              <span>Place Of Supply</span>
              <span className="pr-1">:</span>
            </p>
            <p style={{ width: "60%" }}>{data[0]?.placeOfSupply || ""}</p>
          </div>
          <div className="flex pt-1 w-full">
            <p
              className="font-bold"
              style={{
                width: "40%",
                display: "flex",
                justifyContent: "space-between",
              }}
            >
              <span>Destuffing Point</span>
              <span className="pr-1">:</span>
            </p>
            <p style={{ width: "60%" }}>{data[0]?.destuffingPoint || ""}</p>
          </div>
        </div>
        <div
          className="border-r border-black p-1"
          style={{ fontSize: "8px", width: "22%" }}
        >
          <div className="flex w-full">
            <p
              className="font-bold"
              style={{
                width: "40%",
                display: "flex",
                justifyContent: "space-between",
              }}
            >
              <span>Date</span>
              <span className="pr-1">:</span>
            </p>
            <p style={{ width: "60%" }}>
              {formatDateToDDMMYYYY(data[0]?.jobDate) || ""}
            </p>
          </div>
          <div className="flex pt-1 w-full">
            <p
              className="font-bold"
              style={{
                width: "40%",
                display: "flex",
                justifyContent: "space-between",
              }}
            >
              <span>Date</span>
              <span className="pr-1">:</span>
            </p>
            <p style={{ width: "60%" }}>
              {formatDateToDDMMYYYY(data[0]?.mblDate) || ""}
            </p>
          </div>
          <div className="flex pt-1 w-full">
            <p
              className="font-bold"
              style={{
                width: "40%",
                display: "flex",
                justifyContent: "space-between",
              }}
            >
              <span>Date</span>
              <span className="pr-1">:</span>
            </p>
            <p style={{ width: "60%" }}>
              {formatDateToDDMMYYYY(data[0]?.hblDate) || ""}
            </p>
          </div>
          <div className="flex pt-1 w-full">
            <p
              className="font-bold"
              style={{
                width: "40%",
                display: "flex",
                justifyContent: "space-between",
              }}
            >
              <span>Date</span>
              <span className="pr-1">:</span>
            </p>
            <p style={{ width: "60%" }}>
              {formatDateToDDMMYYYY(data[0]?.arrivalDate) || ""}
            </p>
          </div>
          <div className="flex pt-1 w-full">
            <p
              className="font-bold"
              style={{
                width: "40%",
                display: "flex",
                justifyContent: "space-between",
              }}
            >
              <span>IGM Date</span>
              <span className="pr-1">:</span>
            </p>
            <p style={{ width: "60%" }}>
              {formatDateToDDMMYYYY(data[0]?.igmDate) || ""}
            </p>
          </div>
          <div className="flex pt-1 w-full">
            <p
              className="font-bold"
              style={{
                width: "40%",
                display: "flex",
                justifyContent: "space-between",
              }}
            >
              <span>PLR</span>
              <span className="pr-1">:</span>
            </p>
            <p style={{ width: "60%" }}>{data[0]?.plr || ""}</p>
          </div>
          <div className="flex pt-1 w-full">
            <p
              className="font-bold"
              style={{
                width: "40%",
                display: "flex",
                justifyContent: "space-between",
              }}
            >
              <span>FPD</span>
              <span className="pr-1">:</span>
            </p>
            <p style={{ width: "60%" }}>{data[0]?.fpd || ""}</p>
          </div>
          <div className="flex pt-1 w-full">
            <p
              className="font-bold"
              style={{
                width: "40%",
                display: "flex",
                justifyContent: "space-between",
              }}
            >
              <span>Size Type</span>
              <span className="pr-1">:</span>
            </p>
            <p style={{ width: "60%" }}>{sizeType || ""}</p>
          </div>
          <div className="flex pt-1 w-full">
            <p
              className="font-bold"
              style={{
                width: "40%",
                display: "flex",
                justifyContent: "space-between",
              }}
            >
              <span>Free Days</span>
              <span className="pr-1">:</span>
            </p>
            <p style={{ width: "60%" }}>{data[0]?.freeDays || ""}</p>
          </div>
          <div className="flex pt-1 w-full">
            <p
              className="font-bold"
              style={{
                width: "40%",
                display: "flex",
                justifyContent: "space-between",
              }}
            >
              <span>DestuffType</span>
              <span className="pr-1">:</span>
            </p>
            <p style={{ width: "60%" }}>{data[0]?.destuffType || ""}</p>
          </div>
        </div>
        <div className="p-1" style={{ fontSize: "8px", width: "40%" }}>
          <div className="flex w-full">
            <p
              className="font-bold"
              style={{
                width: "40%",
                display: "flex",
                justifyContent: "space-between",
              }}
            >
              <span>Shipper.</span>
              <span className="pr-1">:</span>
            </p>
            <p style={{ width: "60%" }}>{data[0]?.shipper || ""}</p>
          </div>
          <div className="flex pt-1 w-full">
            <p
              className="font-bold"
              style={{
                width: "40%",
                display: "flex",
                justifyContent: "space-between",
              }}
            >
              <span>Consignee</span>
              <span className="pr-1">:</span>
            </p>
            <p style={{ width: "60%" }}>
              {data[0]?.consignee || data[0]?.consigneeText || ""}
            </p>
          </div>
          <div className="flex pt-1 w-full">
            <p
              className="font-bold"
              style={{
                width: "40%",
                display: "flex",
                justifyContent: "space-between",
              }}
            >
              <span>CHA Name</span>
              <span className="pr-1">:</span>
            </p>
            <p style={{ width: "60%" }}>{data[0]?.chaName || ""}</p>
          </div>
          <div className="flex pt-1 w-full">
            <p
              className="font-bold"
              style={{
                width: "40%",
                display: "flex",
                justifyContent: "space-between",
              }}
            >
              <span>Cargo Type</span>
              <span className="pr-1">:</span>
            </p>
            <p style={{ width: "60%" }}>
              {data[0]?.cargoType || ""}
              {" / "}
              {data[0]?.containerStatus || ""}
            </p>
          </div>
          <div className="flex pt-1 w-full">
            <p
              className="font-bold"
              style={{
                width: "40%",
                display: "flex",
                justifyContent: "space-between",
              }}
            >
              <span>Commodity</span>
              <span className="pr-1">:</span>
            </p>
            <p style={{ width: "60%" }}>{data[0]?.commodity || ""}</p>
          </div>
          <div className="flex pt-1 w-full">
            <p
              className="font-bold"
              style={{
                width: "40%",
                display: "flex",
                justifyContent: "space-between",
              }}
            >
              <span>Cargo Weight</span>
              <span className="pr-1">:</span>
            </p>
            <p style={{ width: "60%" }}>
              {data[0]?.cargoWeight || ""} {data[0]?.wtUnitName || ""}
            </p>
          </div>
          <div className="flex pt-1 w-full">
            <p
              className="font-bold"
              style={{
                width: "40%",
                display: "flex",
                justifyContent: "space-between",
              }}
            >
              <span>No. of Pkg</span>
              <span className="pr-1">:</span>
            </p>
            <p style={{ width: "60%" }}>
              {data[0]?.blNoOfPackages || ""} {data[0]?.packagingTypeCode || ""}
            </p>
          </div>
          <div className="flex pt-1 w-full">
            <p
              className="font-bold"
              style={{
                width: "40%",
                display: "flex",
                justifyContent: "space-between",
              }}
            >
              <span>Shipper Ref.No.</span>
              <span className="pr-1">:</span>
            </p>
            <p style={{ width: "60%" }}>{data[0]?.shipperRefNo || ""}</p>
          </div>
          <div className="flex pt-1 w-full">
            <p
              className="font-bold"
              style={{
                width: "40%",
                display: "flex",
                justifyContent: "space-between",
              }}
            >
              <span>Ex. Rate</span>
              <span className="pr-1">:</span>
            </p>
            <p style={{ width: "60%" }}>{data[0]?.exchangeRate || ""}</p>
          </div>
        </div>
      </div>
    );
  };

  const TgkTaxInvoiceJobDetails = ({ data }) => {
    const sizeType = (data?.[0]?.sizeTypeContainer ?? "").replaceAll("/", ", ");
    console.log("sizeType", sizeType);
    return (
      <div className="flex border-r border-l border-b border-black">
        <div className="p-2" style={{ fontSize: "9px", width: "38%" }}>
          <div className="flex w-full">
            <p className="font-bold" style={{ width: "40%" }}>
              Job No. :{" "}
            </p>
            <p style={{ width: "60%" }}>{data[0]?.jobNo || ""}</p>
          </div>
          <div className="flex pt-1 w-full">
            <p className="font-bold" style={{ width: "40%" }}>
              MB/L No. :{" "}
            </p>
            <p style={{ width: "60%" }}>{data[0]?.mblNo || ""}</p>
          </div>
          <div className="flex pt-1 w-full">
            <p className="font-bold" style={{ width: "40%" }}>
              HB/L No. :{" "}
            </p>
            <p style={{ width: "60%" }}>{data[0]?.hblNo || ""}</p>
          </div>
          <div className="flex pt-1 w-full">
            <p className="font-bold" style={{ width: "40%" }}>
              Vessel/Voy :{" "}
            </p>
            <p style={{ width: "60%" }}>
              {(data?.[0]?.businessSegment?.toLowerCase()?.includes("export")
                ? data?.[0]?.vessel
                : data?.[0]?.podVesselName) || ""}
              {" / "}
              {(data?.[0]?.businessSegment?.toLowerCase()?.includes("export")
                ? data?.[0]?.voyageNo
                : data?.[0]?.podVoyageName) || ""}
            </p>
          </div>
          <div className="flex pt-1 w-full">
            <p className="font-bold" style={{ width: "40%" }}>
              POL :{" "}
            </p>
            <p style={{ width: "60%" }}>{data[0]?.pol || ""}</p>
          </div>
          <div className="flex pt-1 w-full">
            <p className="font-bold" style={{ width: "40%" }}>
              POD :{" "}
            </p>
            <p style={{ width: "60%" }}>{data[0]?.pod || ""}</p>
          </div>
          <div className="flex pt-1 w-full">
            <p className="font-bold" style={{ width: "40%" }}>
              Shipment Terms :{" "}
            </p>
            <p style={{ width: "60%" }}>{data[0]?.tradeTerms || ""}</p>
          </div>
        </div>
        <div
          className="border-r border-black p-2"
          style={{ fontSize: "9px", width: "22%" }}
        >
          {/* Keep space for Job Date */}
          <div className="flex w-full invisible">
            <p className="font-bold" style={{ width: "40%" }}>
              Date :
            </p>
            <p style={{ width: "60%" }}>
              {formatDateToDDMMYYYY(data[0]?.jobDate) || ""}
            </p>
          </div>

          {/* Keep space for MBL Date */}
          <div className="flex pt-1 w-full invisible">
            <p className="font-bold" style={{ width: "40%" }}>
              Date :
            </p>
            <p style={{ width: "60%" }}>
              {formatDateToDDMMYYYY(data[0]?.mblDate) || ""}
            </p>
          </div>

          {/* Keep space for HBL Date */}
          <div className="flex pt-1 w-full invisible">
            <p className="font-bold" style={{ width: "40%" }}>
              Date :
            </p>
            <p style={{ width: "60%" }}>
              {formatDateToDDMMYYYY(data[0]?.hblDate) || ""}
            </p>
          </div>

          {/* Only visible date */}
          <div className="flex pt-1 w-full">
            <p className="font-bold" style={{ width: "40%" }}>
              Date :
            </p>
            <p style={{ width: "60%" }}>
              {formatDateToDDMMYYYY(data[0]?.arrivalDate) || ""}
            </p>
          </div>

          <div className="flex pt-1 w-full">
            <p className="font-bold" style={{ width: "40%" }}>
              PLR :
            </p>
            <p style={{ width: "60%" }}>{data[0]?.plr || ""}</p>
          </div>

          <div className="flex pt-1 w-full">
            <p className="font-bold" style={{ width: "40%" }}>
              FPD :
            </p>
            <p style={{ width: "60%" }}>{data[0]?.fpd || ""}</p>
          </div>

          <div className="flex pt-1 w-full">
            <p className="font-bold" style={{ width: "40%" }}>
              Size Type :
            </p>
            <p style={{ width: "60%" }}>{sizeType || ""}</p>
          </div>
        </div>
        <div className="p-2" style={{ fontSize: "9px", width: "40%" }}>
          <div className="flex w-full">
            <p className="font-bold" style={{ width: "40%" }}>
              Shipper. :{" "}
            </p>
            <p style={{ width: "60%" }}>{data[0]?.shipper || ""}</p>
          </div>
          <div className="flex pt-1 w-full">
            <p className="font-bold" style={{ width: "40%" }}>
              Consignee :{" "}
            </p>
            <p style={{ width: "60%" }}>
              {data[0]?.consignee || data[0]?.consigneeText || ""}
            </p>
          </div>
          <div className="flex pt-1 w-full">
            <p className="font-bold" style={{ width: "40%" }}>
              Cargo Type :{" "}
            </p>
            <p style={{ width: "60%" }}>
              {data[0]?.cargoType || ""}
              {" / "}
              {data[0]?.containerStatus || ""}
            </p>
          </div>
          <div className="flex pt-1 w-full">
            <p className="font-bold" style={{ width: "40%" }}>
              Commodity :{" "}
            </p>
            <p style={{ width: "60%" }}>{data[0]?.commodity || ""}</p>
          </div>
          <div className="flex pt-1 w-full">
            <p className="font-bold" style={{ width: "40%" }}>
              Cargo Weight :{" "}
            </p>
            <p style={{ width: "60%" }}>
              {data[0]?.cargoWeight || ""} {data[0]?.wtUnitName || ""}
            </p>
          </div>
          <div className="flex pt-1 w-full">
            <p className="font-bold" style={{ width: "40%" }}>
              No. of Pkg :{" "}
            </p>
            <p style={{ width: "60%" }}>
              {data[0]?.noOfPackages || ""} {data[0]?.packagingTypeCode || ""}
            </p>
          </div>
          <div className="flex pt-1 w-full">
            <p className="font-bold" style={{ width: "40%" }}>
              Shipper Ref.No. :{" "}
            </p>
            <p style={{ width: "60%" }}>{data[0]?.shipperRefNo || ""}</p>
          </div>
          <div className="flex pt-1 w-full">
            <p className="font-bold" style={{ width: "40%" }}>
              Ex. Rate :{" "}
            </p>
            <p style={{ width: "60%" }}>{data[0]?.exchangeRate || ""}</p>
          </div>
        </div>
      </div>
    );
  };

  const InvoicePrintJobDetails = ({ data }) => {
    return (
      <div className="border-r border-l border-b border-black">
        <div className="flex w-full border-b border-black">
          <div className="flex w-full border-r border-black">
            <div className="p-2" style={{ fontSize: "9px ", width: "100%" }}>
              <div className="flex w-full pb-1">
                <p className="font-bold" style={{ width: "25%" }}>
                  MBL No. :{" "}
                </p>
                <p style={{ width: "75%" }}>{data[0]?.mblNo || ""}</p>
              </div>
              <div className="flex w-full pb-1">
                <p className="font-bold" style={{ width: "25%" }}>
                  HBL No. :{" "}
                </p>
                <p style={{ width: "75%" }}>{data[0]?.hblNo || ""}</p>
              </div>
              <div className="flex w-full pb-1">
                <div className="flex w-full" style={{ width: "70%" }}>
                  <p className="font-bold" style={{ width: "35%" }}>
                    Vessel / Voy :{" "}
                  </p>
                  <p style={{ width: "65%" }}>
                    {data[0]?.vessel || ""} / {data[0]?.voyageNo || ""}
                  </p>
                </div>
                <div className="flex w-full" style={{ width: "30%" }}>
                  <p className="font-bold" style={{ width: "30%" }}>
                    Date :{" "}
                  </p>
                  <p style={{ width: "70%" }}>{data[0]?.sailDate || ""}</p>
                </div>
              </div>
              <div className="flex w-full pb-1">
                <p className="font-bold" style={{ width: "25%" }}>
                  Port of Loading :{" "}
                </p>
                <p style={{ width: "75%" }}>{data[0]?.pol || ""}</p>
              </div>
            </div>
          </div>
          <div className="flex w-full ">
            <div className="p-2" style={{ fontSize: "9px ", width: "100%" }}>
              <div className="flex w-full pb-1">
                <div className="flex w-full" style={{ width: "60%" }}>
                  <p className="font-bold" style={{ width: "42%" }}>
                    Job No. :{" "}
                  </p>
                  <p style={{ width: "58%" }}>{data[0]?.jobNo || ""}</p>
                </div>
              </div>
              <div className="flex w-full pb-1">
                <p className="font-bold" style={{ width: "25%" }}>
                  Port of Discharge :{" "}
                </p>
                <p style={{ width: "75%" }}>{data[0]?.pod || ""}</p>
              </div>
              <div className="flex w-full pb-1">
                <p className="font-bold" style={{ width: "25%" }}>
                  Destination Port :{" "}
                </p>
                <p style={{ width: "75%" }}>{data[0]?.fpd || ""}</p>
              </div>
              <div className="flex w-full pb-1">
                <p className="font-bold" style={{ width: "25%" }}>
                  Commodity :{" "}
                </p>
                <p style={{ width: "75%" }}>{data[0]?.commodity || ""}</p>
              </div>
            </div>
          </div>
        </div>
        <div className=" pl-2 pt-1 -b-1">
          <div className="flex w-full pb-1">
            <p className="font-bold" style={{ fontSize: "9px ", width: "10%" }}>
              Remarks :
            </p>
            <p style={{ fontSize: "9px ", width: "90%" }}>
              {data[0]?.remarks || ""}
            </p>
          </div>
        </div>
      </div>
    );
  };
  console.log("data", data);
  const TaxInvoiceChargeDetails = ({ data, charge, index, hsnSac }) => {
    // ✅ helper: continuation rows (created by your splitter) should NOT show numbers/extra cols
    const isCont = (row) => row?.__isContinuation === true;

    // ✅ helper: show 0.00 only when it's a real row (not continuation)
    const showVal = (row, v, fallback = "") =>
      isCont(row) ? "" : (v ?? fallback);

    // Total (your existing logic)
    let totalAmount = 0;
    (charge || []).forEach((group) => {
      (group || []).forEach((item) => {
        if (!isNaN(item?.totalAmount) && item?.totalAmount !== null) {
          totalAmount += Number(item.totalAmount);
        }
      });
    });

    const gridTotal = (data?.[0]?.tblInvoiceCharge || []).reduce(
      (acc, curr) => {
        const qty = Number(curr?.qty || 0);
        const rate = Number(curr?.rate || 0);
        const exchangeRate = Number(curr?.exchangeRate || 1);
        const IGST = Number(curr?.IGST || 0);
        const CGST = Number(curr?.CGST || 0);
        const SGST = Number(curr?.SGST || 0);

        const rowTotal = qty * rate * exchangeRate + IGST + CGST + SGST;
        return acc + rowTotal;
      },
      0,
    );
    const gridRoundOfTotal = Number(gridTotal || 0).toFixed(2);

    // const totalAmountInWords =
    //   clientId === 13 || clientId === 9
    //     ? numberToWordsInIndianSystemWithOutPaisaAndRupees(
    //       parseFloat(gridRoundOfTotal || 0),
    //     )
    //     : numberToWordsInIndianSystemUsingWithPaisaAndRupees(
    //       parseFloat(gridRoundOfTotal || 0),
    //     );
    const totalAmountInWords = numberToWordsInIndianAndUsaSystem(
      parseFloat(gridRoundOfTotal || 0),
      data?.[0]?.currency,
    );
    //total calculate Start
    const chargeList = data?.[0]?.tblInvoiceCharge || [];

    const totals = chargeList.reduce(
      (acc, item) => {
        acc.totalAmountHc += Number(item?.totalAmountHc || 0);
        acc.IGST += Number(item?.IGST || 0);
        acc.CGST += Number(item?.CGST || 0);
        acc.SGST += Number(item?.SGST || 0);
        return acc;
      },
      {
        totalAmountHc: 0,
        IGST: 0,
        CGST: 0,
        SGST: 0,
      },
    );

    const finalTotals = {
      totalAmountHc: totals.totalAmountHc.toFixed(2),
      IGST: totals.IGST.toFixed(2),
      CGST: totals.CGST.toFixed(2),
      SGST: totals.SGST.toFixed(2),
    };

    //total calculate End

    const currentPageLength = charge?.[index]?.length || 0;
    const nextPageLength = charge?.[index + 1]?.length || 0;
    const lastPageIndex = (charge?.length || 1) - 1;

    const totalPages = charge?.length || 0;

    const isLastPage =
      index === lastPageIndex ||
      (index === lastPageIndex - 1 && nextPageLength < 4);

    const isSinglePage = (charge?.length || 0) === 1;

    const chargeGridHeight = isSinglePage ? "200px" : "200px";

    const showHsnGrid =
      isLastPage || (currentPageLength > 4 && currentPageLength < 10);

    return (
      <>
        {currentPageLength > 0 && (
          <div
            className="flex w-full border-black border-r border-l border-b text-center font-bold"
            style={{ fontSize: "9px", width: "100%" }}
          >
            <p className="border-r border-black" style={{ width: "27%" }}>
              DESCRIPTION
            </p>
            <p className="border-r border-black" style={{ width: "7%" }}>
              HSN / SAC Code
            </p>
            <p className="border-r border-black" style={{ width: "5%" }}>
              Size Type
            </p>
            <p className="border-r border-black" style={{ width: "3%" }}>
              Qty
            </p>
            <p className="border-r border-black" style={{ width: "8%" }}>
              Rate
            </p>
            <p className="border-r border-black" style={{ width: "4%" }}>
              Curr
            </p>
            <p className="border-r border-black" style={{ width: "6%" }}>
              Ex. Rate
            </p>
            <p className="border-r border-black" style={{ width: "8%" }}>
              Taxable Amount
            </p>
            <p className="border-r border-black" style={{ width: "5%" }}>
              Tax Rate
            </p>
            <p className="border-r border-black" style={{ width: "6%" }}>
              IGST
            </p>
            <p className="border-r border-black" style={{ width: "6%" }}>
              CGST
            </p>
            <p className="border-r border-black" style={{ width: "6%" }}>
              SGST
            </p>
            <p className="text-center" style={{ width: "9%" }}>
              Amount in {data?.[0]?.currency || ""}
            </p>
          </div>
        )}

        {currentPageLength > 0 && (
          <div
            className="border-black border-r border-l border-b"
            style={{ height: chargeGridHeight, overflow: "hidden" }}
          >
            {charge?.[index]?.map((chargeData, idx, array) => {
              const cont = isCont(chargeData);

              const qty = cont ? 0 : Number(chargeData?.qty || 0);
              const rate = cont ? 0 : Number(chargeData?.rate || 0);
              const exr = cont ? 1 : Number(chargeData?.exchangeRate || 1);
              const igst = cont ? 0 : Number(chargeData?.IGST || 0);
              const cgst = cont ? 0 : Number(chargeData?.CGST || 0);
              const sgst = cont ? 0 : Number(chargeData?.SGST || 0);

              const amount = cont
                ? ""
                : (qty * rate * exr + igst + cgst + sgst).toFixed(2);

              return (
                <div
                  key={idx}
                  className={`flex w-full ${idx === array.length - 1 ? "border-b" : ""}`}
                  style={{ fontSize: "9px", width: "100%" }}
                >
                  <p
                    className="pb-1 border-r border-black"
                    style={{ width: "27%", paddingLeft: "2px" }}
                  >
                    {chargeData?.description || ""}
                  </p>

                  <p
                    className=" border-r border-black text-center"
                    style={{ width: "7%" }}
                  >
                    {showVal(chargeData, chargeData?.hsn, "")}{" "}
                    {showVal(chargeData, chargeData?.sac, "")}
                  </p>

                  <p
                    className="pb-1 border-r border-black text-center"
                    style={{ width: "5%" }}
                  >
                    {showVal(chargeData, chargeData?.size, "")}{" "}
                    {showVal(chargeData, chargeData?.typeCode, "")}
                  </p>

                  <p
                    className="pb-1 border-r border-black text-center"
                    style={{ width: "3%" }}
                  >
                    {showVal(chargeData, chargeData?.qty, "")}
                  </p>

                  <p
                    className="pb-1 pr-1 border-r border-black text-right"
                    style={{ width: "8%" }}
                  >
                    {showVal(
                      chargeData,
                      chargeData?.rate != null
                        ? Number(chargeData.rate).toLocaleString("en-IN", {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })
                        : "",
                      "",
                    )}
                  </p>

                  <p
                    className="pb-1 border-r border-black text-center"
                    style={{ width: "4%" }}
                  >
                    {showVal(chargeData, chargeData?.chargeCurrency, "")}
                  </p>

                  <p
                    className="pb-1 pr-1 border-r border-black text-right"
                    style={{ width: "6%" }}
                  >
                    {showVal(
                      chargeData,
                      chargeData?.exchangeRate != null
                        ? Number(chargeData.exchangeRate).toFixed(2)
                        : "",
                      "",
                    )}
                  </p>

                  <p
                    className="pb-1 pr-1 border-r border-black text-right"
                    style={{ width: "8%" }}
                  >
                    {showVal(
                      chargeData,
                      chargeData?.totalAmountHc != null
                        ? Number(chargeData.totalAmountHc).toLocaleString(
                            "en-IN",
                            {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            },
                          )
                        : "",
                      "",
                    )}
                  </p>

                  <p
                    className="pb-1 pr-1 border-r border-black text-right"
                    style={{ width: "5%" }}
                  >
                    {showVal(
                      chargeData,
                      (chargeData?.tblInvoiceChargeTax || [])
                        .reduce(
                          (sum, item) =>
                            sum + (Number(item?.taxPercentage) || 0),
                          0,
                        )
                        .toLocaleString("en-IN", {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        }),
                      "",
                    )}
                  </p>

                  {/* ✅ IMPORTANT: remove "|| 0.00" fallback, and hide on continuation */}
                  <p
                    className="pb-1 pr-1 border-r border-black text-right"
                    style={{ width: "6%" }}
                  >
                    {cont
                      ? ""
                      : chargeData?.IGST != null
                        ? Number(chargeData.IGST).toLocaleString("en-IN", {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })
                        : ""}
                  </p>
                  <p
                    className="pb-1 pr-1 border-r border-black text-right"
                    style={{ width: "6%" }}
                  >
                    {cont
                      ? ""
                      : chargeData?.CGST != null
                        ? Number(chargeData.CGST).toLocaleString("en-IN", {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })
                        : ""}
                  </p>
                  <p
                    className="pb-1 pr-1 border-r border-black text-right"
                    style={{ width: "6%" }}
                  >
                    {cont
                      ? ""
                      : chargeData?.SGST != null
                        ? Number(chargeData.SGST).toLocaleString("en-IN", {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })
                        : ""}
                  </p>

                  <p className="pb-1 pr-1 text-right " style={{ width: "9%" }}>
                    {amount != null
                      ? Number(amount).toLocaleString("en-IN", {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })
                      : ""}
                  </p>
                </div>
              );
            })}

            {/* Final row - Amount in Words kash */}
            <div
              className="flex w-full border-black text-center font-bold"
              style={{ fontSize: "8px", width: "100%" }}
            >
              <p
                className="border-t  border-r border-black text-right pr-1"
                style={{ width: "60%" }}
              >
                Total
              </p>
              <p
                className="border-t border-black text-right border-r pr-1"
                style={{ width: "8%" }}
              >
                {finalTotals?.totalAmountHc != null
                  ? Number(finalTotals.totalAmountHc).toLocaleString("en-IN", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })
                  : ""}
              </p>
              <p
                className="border-t border-black text-right border-r pr-1"
                style={{ width: "5%" }}
              ></p>
              <p
                className="border-t border-black text-right border-r pr-1"
                style={{ width: "6%" }}
              >
                {finalTotals?.IGST != null
                  ? Number(finalTotals.IGST).toLocaleString("en-IN", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })
                  : ""}
              </p>
              <p
                className="border-t border-black text-right border-r pr-1"
                style={{ width: "6%" }}
              >
                {finalTotals?.CGST != null
                  ? Number(finalTotals.CGST).toLocaleString("en-IN", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })
                  : ""}
              </p>
              <p
                className="border-t border-black text-right border-r pr-1"
                style={{ width: "6%" }}
              >
                {finalTotals?.SGST != null
                  ? Number(finalTotals.SGST).toLocaleString("en-IN", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })
                  : ""}
              </p>
              <p
                className="border-t border-black text-right pr-1"
                style={{ width: "9%" }}
              >
                {Number(gridTotal ?? 0).toLocaleString("en-IN", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </p>
            </div>
            {/* amountInWords */}
            <div
              className={`flex w-full border-t border-black ${index != 0 ? "border-b" : ""} `}
              style={{ fontSize: "8px", width: "100%" }}
            >
              <p
                className="p-1 uppercase"
                style={{ width: "85%", paddingRight: "15px" }}
              >
                <span className="font-bold">Amount in Words </span>
                {data?.[0]?.currency || ""} {totalAmountInWords || ""}
              </p>
            </div>
          </div>
        )}

        {showHsnGrid && index === totalPages - 1 && (
          <div>
            <TaxInvoiceHsnSummaryGrid hsnSac={hsnSac} data={data} />
          </div>
        )}
      </>
    );
  };

  const formatAmountBlankIfZero = (value) => {
    if (value === null || value === undefined || String(value).trim() === "") {
      return "";
    }

    const num = Number(value);

    if (!Number.isFinite(num) || num === 0) {
      return "";
    }

    return num.toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  const toFiniteAmount = (value, fallback = 0) => {
    if (value === null || value === undefined) return fallback;
    const normalized =
      typeof value === "string" ? value.replace(/,/g, "").trim() : value;
    if (normalized === "") return fallback;
    const num = Number(normalized);
    return Number.isFinite(num) ? num : fallback;
  };

  const firstFiniteAmount = (...values) => {
    for (const value of values) {
      if (value === null || value === undefined) continue;
      const normalized =
        typeof value === "string" ? value.replace(/,/g, "").trim() : value;
      if (normalized === "") continue;
      const num = Number(normalized);
      if (Number.isFinite(num)) return num;
    }
    return 0;
  };

  const getTaxAmountFromChargeTax = (
    chargeData,
    taxCodePrefix,
    isHomeCurrency,
  ) => {
    const taxes = Array.isArray(chargeData?.tblInvoiceChargeTax)
      ? chargeData.tblInvoiceChargeTax
      : [];
    const prefix = String(taxCodePrefix || "").toUpperCase();

    return taxes.reduce((sum, tax) => {
      const taxCode = String(tax?.taxCode || "")
        .trim()
        .toUpperCase();
      if (!taxCode.startsWith(prefix)) return sum;

      return (
        sum +
        firstFiniteAmount(
          isHomeCurrency ? tax?.taxAmountHc : tax?.taxAmountFc,
          isHomeCurrency ? tax?.taxAmountFc : tax?.taxAmountHc,
        )
      );
    }, 0);
  };

  const getChargeTaxAmount = (chargeData, taxCodePrefix, isHomeCurrency) => {
    const upperPrefix = String(taxCodePrefix || "").toUpperCase();
    const directValue = isHomeCurrency
      ? chargeData?.[upperPrefix]
      : chargeData?.[`${upperPrefix}Fc`];
    const directAmount = firstFiniteAmount(directValue);

    if (directAmount !== 0) return directAmount;

    return getTaxAmountFromChargeTax(chargeData, upperPrefix, isHomeCurrency);
  };

  const getChargeTaxableAmount = (chargeData, isHomeCurrency) => {
    const qty = toFiniteAmount(chargeData?.qty);
    const rate = toFiniteAmount(chargeData?.rate);
    const exchangeRate = toFiniteAmount(chargeData?.exchangeRate, 1);
    const calculatedAmount = qty * rate * (isHomeCurrency ? exchangeRate : 1);

    return firstFiniteAmount(
      isHomeCurrency ? chargeData?.taxableAmount : chargeData?.taxableAmountFc,
      isHomeCurrency ? chargeData?.totalAmountHc : chargeData?.totalAmountFc,
      isHomeCurrency ? chargeData?.totalAmount : chargeData?.totalAmountFc,
      chargeData?.totalAmountFc,
      calculatedAmount,
    );
  };

  const getChargeFinancials = (chargeData, isHomeCurrency) => {
    const taxableAmount = getChargeTaxableAmount(chargeData, isHomeCurrency);
    const IGST = getChargeTaxAmount(chargeData, "IGST", isHomeCurrency);
    const CGST = getChargeTaxAmount(chargeData, "CGST", isHomeCurrency);
    const SGST = getChargeTaxAmount(chargeData, "SGST", isHomeCurrency);
    const taxAmount = IGST + CGST + SGST;

    return {
      taxableAmount,
      IGST,
      CGST,
      SGST,
      taxAmount,
      totalAmount: taxableAmount + taxAmount,
    };
  };

  const getChargeTotals = (chargeList, isHomeCurrency) =>
    (Array.isArray(chargeList) ? chargeList : []).reduce(
      (acc, item) => {
        const financials = getChargeFinancials(item, isHomeCurrency);
        acc.taxableAmount += financials.taxableAmount;
        acc.IGST += financials.IGST;
        acc.CGST += financials.CGST;
        acc.SGST += financials.SGST;
        acc.totalAmount += financials.totalAmount;
        return acc;
      },
      {
        taxableAmount: 0,
        IGST: 0,
        CGST: 0,
        SGST: 0,
        totalAmount: 0,
      },
    );

  const getCompactChargeGridMinHeightPx = (rowCount = 0) =>
    Math.max(72, Number(rowCount || 0) * 18 + 42);

  const TaxInvoiceChargeDetailsForTaxInvoiceReportFF = ({
    data,
    charge,
    index,
    hsnSac,
    compactChargeGrid = false,
    compactHsnGrid = false,
  }) => {
    const isCont = (row) => row?.__isContinuation === true;

    const showVal = (row, v, fallback = "") =>
      isCont(row) ? "" : (v ?? fallback);

    const isHomeCurrency = Number(data?.[0]?.isHomeCurrency) === 1;
    const chargeList = data?.[0]?.tblInvoiceCharge || [];
    const chargeTotals = getChargeTotals(chargeList, isHomeCurrency);
    const gridTotal = chargeTotals.totalAmount;
    const gridRoundOfTotal = Number(gridTotal || 0).toFixed(2);

    // const totalAmountInWords =
    //   clientId === 13 || clientId === 9
    //     ? numberToWordsInIndianSystemWithOutPaisaAndRupees(
    //       parseFloat(gridRoundOfTotal || 0),
    //     )
    //     : numberToWordsInIndianSystemUsingWithPaisaAndRupees(
    //       parseFloat(gridRoundOfTotal || 0),
    //     );
    const totalAmountInWords = numberToWordsInIndianAndUsaSystem(
      parseFloat(gridRoundOfTotal || 0),
      data?.[0]?.currency,
    );

    const currentPageLength = charge?.[index]?.length || 0;
    const nextPageLength = charge?.[index + 1]?.length || 0;
    const lastPageIndex = (charge?.length || 1) - 1;

    const totalPages = charge?.length || 0;

    const isLastPage =
      index === lastPageIndex ||
      (index === lastPageIndex - 1 && nextPageLength < 4);

    const isSinglePage = (charge?.length || 0) === 1;

    const defaultChargeGridHeight = isSinglePage ? "205px" : "350px";
    const compactChargeGridMinHeight = `${getCompactChargeGridMinHeightPx(
      currentPageLength,
    )}px`;
    const chargeGridStyle = compactChargeGrid
      ? { minHeight: compactChargeGridMinHeight, overflow: "visible" }
      : { height: defaultChargeGridHeight, overflow: "hidden" };

    const showHsnGrid =
      isLastPage || (currentPageLength > 4 && currentPageLength < 10);
    const showChargeSummary = index === totalPages - 1;
    const showCreditNoteFirstPageEndBorder =
      reportIds?.[0] === "CreditNote Print" && index === 0 && totalPages > 1;

    return (
      <>
        {currentPageLength > 0 && (
          <div
            className="flex w-full border-black border-r border-l border-b text-center font-bold"
            style={{ fontSize: "9px", width: "100%" }}
          >
            <p className="border-r border-black" style={{ width: "27%" }}>
              DESCRIPTION
            </p>
            <p className="border-r border-black" style={{ width: "7%" }}>
              HSN / SAC Code
            </p>
            <p className="border-r border-black" style={{ width: "5%" }}>
              Size Type
            </p>
            <p className="border-r border-black" style={{ width: "3%" }}>
              Qty
            </p>
            <p className="border-r border-black" style={{ width: "8%" }}>
              Rate
            </p>
            <p className="border-r border-black" style={{ width: "4%" }}>
              Curr
            </p>
            <p className="border-r border-black" style={{ width: "6%" }}>
              Ex. Rate
            </p>
            <p className="border-r border-black" style={{ width: "8%" }}>
              Taxable Amount
            </p>
            <p className="border-r border-black" style={{ width: "5%" }}>
              Tax Rate
            </p>
            <p className="border-r border-black" style={{ width: "6%" }}>
              IGST
            </p>
            <p className="border-r border-black" style={{ width: "6%" }}>
              CGST
            </p>
            <p className="border-r border-black" style={{ width: "6%" }}>
              SGST
            </p>
            <p className="text-center" style={{ width: "9%" }}>
              Amount in {data?.[0]?.currency || ""}
            </p>
          </div>
        )}

        {currentPageLength > 0 && (
          <div
            className="border-black border-r border-l border-b"
            style={chargeGridStyle}
          >
            {charge?.[index]?.map((chargeData, idx, array) => {
              const cont = isCont(chargeData);
              const financials = cont
                ? null
                : getChargeFinancials(chargeData, isHomeCurrency);

              return (
                <div
                  key={idx}
                  className={`flex w-full ${
                    idx === array.length - 1
                      ? showCreditNoteFirstPageEndBorder
                        ? "border-b border-black"
                        : "border-b"
                      : ""
                  }`}
                  style={{ fontSize: "9px", width: "100%" }}
                >
                  <p
                    className="pb-1 border-r border-black"
                    style={{ width: "27%", paddingLeft: "2px" }}
                  >
                    {chargeData?.description || ""}
                  </p>

                  <p
                    className=" border-r border-black text-center"
                    style={{ width: "7%" }}
                  >
                    {showVal(chargeData, chargeData?.hsn, "")}{" "}
                    {showVal(chargeData, chargeData?.sac, "")}
                  </p>

                  <p
                    className="pb-1 border-r border-black text-center"
                    style={{ width: "5%" }}
                  >
                    {showVal(chargeData, chargeData?.size, "")}{" "}
                    {showVal(chargeData, chargeData?.typeCode, "")}
                  </p>

                  <p
                    className="pb-1 border-r border-black text-center"
                    style={{ width: "3%" }}
                  >
                    {showVal(chargeData, chargeData?.qty, "")}
                  </p>

                  <p
                    className="pb-1 pr-1 border-r border-black text-right"
                    style={{ width: "8%" }}
                  >
                    {showVal(
                      chargeData,
                      chargeData?.rate != null
                        ? Number(chargeData.rate).toLocaleString("en-IN", {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })
                        : "",
                      "",
                    )}
                  </p>

                  <p
                    className="pb-1 border-r border-black text-center"
                    style={{ width: "4%" }}
                  >
                    {showVal(chargeData, chargeData?.chargeCurrency, "")}
                  </p>

                  <p
                    className="pb-1 pr-1 border-r border-black text-right"
                    style={{ width: "6%" }}
                  >
                    {showVal(
                      chargeData,
                      chargeData?.exchangeRate != null
                        ? Number(chargeData.exchangeRate)
                        : // ? Number(chargeData.exchangeRate).toFixed(2)
                          "",
                      "",
                    )}
                  </p>

                  <p
                    className="pb-1 pr-1 border-r border-black text-right"
                    style={{ width: "8%" }}
                  >
                    {showVal(
                      chargeData,
                      formatAmountBlankIfZero(financials?.taxableAmount),
                      "",
                    )}
                  </p>

                  <p
                    className="pb-1 pr-1 border-r border-black text-right"
                    style={{ width: "5%" }}
                  >
                    {showVal(
                      chargeData,
                      (chargeData?.tblInvoiceChargeTax || [])
                        .reduce(
                          (sum, item) =>
                            sum + (Number(item?.taxPercentage) || 0),
                          0,
                        )
                        .toLocaleString("en-IN", {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        }),
                      "",
                    )}
                  </p>

                  {/* ✅ IMPORTANT: remove "|| 0.00" fallback, and hide on continuation */}
                  <p
                    className="pb-1 pr-1 border-r border-black text-right"
                    style={{ width: "6%" }}
                  >
                    {cont ? "" : formatAmountBlankIfZero(financials?.IGST)}
                  </p>

                  <p
                    className="pb-1 pr-1 border-r border-black text-right"
                    style={{ width: "6%" }}
                  >
                    {cont ? "" : formatAmountBlankIfZero(financials?.CGST)}
                  </p>

                  <p
                    className="pb-1 pr-1 border-r border-black text-right"
                    style={{ width: "6%" }}
                  >
                    {cont ? "" : formatAmountBlankIfZero(financials?.SGST)}
                  </p>

                  <p className="pb-1 pr-1 text-right " style={{ width: "9%" }}>
                    {cont
                      ? ""
                      : formatAmountBlankIfZero(financials?.totalAmount)}
                  </p>
                </div>
              );
            })}

            {showChargeSummary && (
              <>
                {/* Final row - Amount in Words kash */}
                <div
                  className="flex w-full border-black text-center font-bold"
                  style={{ fontSize: "8px", width: "100%" }}
                >
                  <p
                    className="border-t  border-r border-black text-right pr-1"
                    style={{ width: "60%" }}
                  >
                    Total
                  </p>
                  <p
                    className="border-t border-black text-right border-r pr-1"
                    style={{ width: "8%" }}
                  >
                    {formatAmountBlankIfZero(chargeTotals?.taxableAmount)}
                  </p>
                  <p
                    className="border-t border-black text-right border-r pr-1"
                    style={{ width: "5%" }}
                  ></p>
                  <p
                    className="border-t border-black text-right border-r pr-1"
                    style={{ width: "6%" }}
                  >
                    {formatAmountBlankIfZero(chargeTotals?.IGST)}
                  </p>
                  <p
                    className="border-t border-black text-right border-r pr-1"
                    style={{ width: "6%" }}
                  >
                    {formatAmountBlankIfZero(chargeTotals?.CGST)}
                  </p>
                  <p
                    className="border-t border-black text-right border-r pr-1"
                    style={{ width: "6%" }}
                  >
                    {formatAmountBlankIfZero(chargeTotals?.SGST)}
                  </p>
                  <p
                    className="border-t border-black text-right pr-1"
                    style={{ width: "9%" }}
                  >
                    {Number(gridTotal ?? 0).toLocaleString("en-IN", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </p>
                </div>
                {/* amountInWords */}
                <div
                  className={`flex w-full border-t border-black ${index != 0 ? "border-b" : ""} `}
                  style={{ fontSize: "8px", width: "100%" }}
                >
                  <p
                    className="pl-1 uppercase"
                    style={{ width: "85%", paddingRight: "15px" }}
                  >
                    <span className="font-bold">Amount in Words </span>
                    {data?.[0]?.currency || ""} {totalAmountInWords || ""}
                  </p>
                </div>
              </>
            )}
          </div>
        )}

        {showHsnGrid && index === totalPages - 1 && (
          <div>
            <TaxInvoiceHsnSummaryGridFF
              hsnSac={hsnSac}
              data={data}
              compact={compactHsnGrid}
            />
          </div>
        )}
      </>
    );
  };

  const PurchaseInvoiceChargeDetailsForTaxInvoiceReportFF = ({
    data,
    charge,
    index,
    hsnSac,
    compactChargeGrid = false,
    compactHsnGrid = false,
  }) => {
    const isCont = (row) => row?.__isContinuation === true;

    const showVal = (row, v, fallback = "") =>
      isCont(row) ? "" : (v ?? fallback);

    const toNum = (value) => {
      if (value === null || value === undefined || value === "") return 0;
      const num = Number(String(value).replace(/,/g, ""));
      return Number.isFinite(num) ? num : 0;
    };

    const firstValue = (...values) => {
      for (const v of values) {
        if (v !== null && v !== undefined && v !== "") return v;
      }
      return "";
    };

    const fmtAmt = (value) => {
      if (value === null || value === undefined || value === "") return "";
      const num = Number(String(value).replace(/,/g, ""));
      if (!Number.isFinite(num)) return "";
      return num.toLocaleString("en-IN", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      });
    };

    const fmtQty = (value) => {
      if (value === null || value === undefined || value === "") return "";
      const num = Number(String(value).replace(/,/g, ""));
      if (!Number.isFinite(num)) return value;
      return num.toLocaleString("en-IN", {
        minimumFractionDigits: 3,
        maximumFractionDigits: 3,
      });
    };

    const getSizeType = (row) => {
      const size = row?.size || "";
      const typeCode = row?.typeCode || row?.type || "";

      if (!size && !typeCode) return "/";
      return `${size}/${typeCode}`;
    };

    const getStatus = (row) => {
      return (
        row?.containerStatus ||
        row?.statusName ||
        row?.containerStatusName ||
        ""
      );
    };

    const getAmountInChargeCurr = (row) =>
      firstValue(
        row?.amountInChargeCurrency,
        row?.amountInChargeCurr,
        row?.totalAmountFc,
        row?.amountFc,
        row?.taxableAmountFc,
        row?.amount,
      );

    const getAmount = (row) =>
      firstValue(row?.totalAmountFc, row?.taxableAmountFc, row?.amountFc);

    const getAmountInINR = (row) =>
      firstValue(
        row?.totalAmountHc,
        row?.amountHc,
        row?.taxableAmountHc,
        row?.totalAmountFc,
        row?.taxableAmountFc,
      );

    const currentPageLength = charge?.[index]?.length || 0;
    const nextPageLength = charge?.[index + 1]?.length || 0;
    const lastPageIndex = (charge?.length || 1) - 1;
    const totalPages = charge?.length || 0;

    const isLastPage =
      index === lastPageIndex ||
      (index === lastPageIndex - 1 && nextPageLength < 4);

    const showChargeSummary = index === totalPages - 1;

    const invoiceData = data?.[0] || {};
    const allCharges = invoiceData?.tblInvoiceCharge || [];

    const totalAmtInChargeCurr = allCharges.reduce(
      (sum, row) => sum + toNum(getAmountInChargeCurr(row)),
      0,
    );

    const totalAmount = allCharges.reduce(
      (sum, row) => sum + toNum(getAmount(row)),
      0,
    );

    const totalAmountInINR = allCharges.reduce(
      (sum, row) => sum + toNum(getAmountInINR(row)),
      0,
    );

    const netAmount = toNum(invoiceData?.totalInvoiceAmountFc);
    const tdsAmount = toNum(invoiceData?.tdsAmountFc);
    const netAmountPayable = netAmount - tdsAmount;

    const gridRoundOfTotal = Number(netAmountPayable || 0).toFixed(2);

    const totalAmountInWords =
      clientId === 13 || clientId === 9
        ? numberToWordsInIndianSystemWithOutPaisaAndRupees(
            parseFloat(gridRoundOfTotal || 0),
          )
        : numberToWordsInIndianSystemUsingWithPaisaAndRupees(
            parseFloat(gridRoundOfTotal || 0),
          );

    return (
      <>
        {currentPageLength > 0 && (
          <div
            className="flex w-full border-black border-r border-l border-b text-center font-bold"
            style={{
              fontSize: "8px",
              width: "100%",
              lineHeight: "1.15",
            }}
          >
            <p className="border-r border-black" style={{ width: "30%" }}>
              Charge Name
            </p>

            <p className="border-r border-black" style={{ width: "7%" }}>
              Size/Type
            </p>

            <p className="border-r border-black" style={{ width: "6%" }}>
              Status
            </p>

            <p className="border-r border-black" style={{ width: "8%" }}>
              Cargo Type
            </p>

            <p className="border-r border-black" style={{ width: "6%" }}>
              QTY
            </p>

            <p className="border-r border-black" style={{ width: "7%" }}>
              Rate
            </p>

            <p className="border-r border-black" style={{ width: "5%" }}>
              Curr.
            </p>

            <p className="border-r border-black" style={{ width: "6%" }}>
              Ex.Rate
            </p>

            <p className="border-r border-black" style={{ width: "9%" }}>
              Amt in
              <br />
              Chrg Curr.
            </p>

            <p className="border-r border-black" style={{ width: "8%" }}>
              Amount in
              <br />
              HC
            </p>

            <p style={{ width: "8%" }}>
              Amount
              <br />
              in INR
            </p>
          </div>
        )}

        {currentPageLength > 0 && (
          <div
            style={{
              width: "100%",
              height: "auto",
              overflow: "visible",
            }}
          >
            {charge?.[index]?.map((chargeData, idx) => {
              const cont = isCont(chargeData);

              return (
                <div
                  key={idx}
                  className="flex w-full border-l border-r border-black"
                  style={{
                    fontSize: "8px",
                    width: "100%",
                    lineHeight: "1.15",
                    minHeight: "17px",
                  }}
                >
                  <p
                    className="border-r border-black"
                    style={{
                      width: "30%",
                      paddingLeft: "3px",
                      textAlign: "left",
                      wordBreak: "break-word",
                    }}
                  >
                    {chargeData?.description || ""}
                  </p>

                  <p
                    className="border-r border-black text-center"
                    style={{ width: "7%" }}
                  >
                    {showVal(chargeData, getSizeType(chargeData), "")}
                  </p>

                  <p
                    className="border-r border-black text-center"
                    style={{ width: "6%" }}
                  >
                    {showVal(chargeData, getStatus(chargeData), "")}
                  </p>

                  <p
                    className="border-r border-black text-center"
                    style={{ width: "8%" }}
                  >
                    {showVal(chargeData, chargeData?.cargoType, "")}
                  </p>

                  <p
                    className="border-r border-black text-right pr-1"
                    style={{ width: "6%" }}
                  >
                    {showVal(chargeData, fmtQty(chargeData?.qty), "")}
                  </p>

                  <p
                    className="border-r border-black text-right pr-1"
                    style={{ width: "7%" }}
                  >
                    {showVal(chargeData, fmtAmt(chargeData?.rate), "")}
                  </p>

                  <p
                    className="border-r border-black text-center"
                    style={{ width: "5%" }}
                  >
                    {showVal(chargeData, chargeData?.chargeCurrency, "")}
                  </p>

                  <p
                    className="border-r border-black text-right pr-1"
                    style={{ width: "6%" }}
                  >
                    {showVal(chargeData, fmtAmt(chargeData?.exchangeRate), "")}
                  </p>

                  <p
                    className="border-r border-black text-right pr-1"
                    style={{ width: "9%" }}
                  >
                    {cont ? "" : fmtAmt(getAmountInChargeCurr(chargeData))}
                  </p>

                  <p
                    className="border-r border-black text-right pr-1"
                    style={{ width: "8%" }}
                  >
                    {cont ? "" : fmtAmt(getAmount(chargeData))}
                  </p>

                  <p className="text-right pr-1" style={{ width: "8%" }}>
                    {cont ? "" : fmtAmt(getAmountInINR(chargeData))}
                  </p>
                </div>
              );
            })}

            {showChargeSummary && (
              <>
                <div
                  className="flex w-full border-l border-r border-t border-black text-center font-bold"
                  style={{
                    fontSize: "9px",
                    width: "100%",
                    lineHeight: "2",
                  }}
                >
                  <p
                    className="border-r border-black text-center"
                    style={{ width: "75%" }}
                  >
                    Total
                  </p>

                  <p
                    className="border-r border-black text-right pr-1"
                    style={{ width: "9%" }}
                  >
                    {fmtAmt(totalAmtInChargeCurr)}
                  </p>

                  <p
                    className="border-r border-black text-right pr-1"
                    style={{ width: "8%" }}
                  >
                    {fmtAmt(totalAmount)}
                  </p>

                  <p className="text-right pr-1" style={{ width: "8%" }}>
                    {fmtAmt(totalAmountInINR)}
                  </p>
                </div>

                <div
                  className="flex w-full border-l border-r border-t border-black font-bold"
                  style={{
                    fontSize: "9px",
                    width: "100%",
                    lineHeight: "1.35",
                    minHeight: "18px",
                  }}
                >
                  <p className="pl-1" style={{ width: "75%" }}>
                    NET Amount :
                  </p>

                  <p className="text-right pr-1" style={{ width: "25%" }}>
                    {fmtAmt(netAmount)}
                  </p>
                </div>

                <div
                  className="flex w-full border-l border-r border-t border-black font-bold"
                  style={{
                    fontSize: "9px",
                    width: "100%",
                    lineHeight: "1.35",
                    minHeight: "18px",
                  }}
                >
                  <p className="pl-1" style={{ width: "75%" }}>
                    TDS Amount :
                  </p>

                  <p className="text-right pr-1" style={{ width: "25%" }}>
                    {fmtAmt(tdsAmount)}
                  </p>
                </div>

                <div
                  className="flex w-full border-l border-r border-t border-black font-bold"
                  style={{
                    fontSize: "9px",
                    width: "100%",
                    lineHeight: "1.35",
                    minHeight: "18px",
                  }}
                >
                  <p className="pl-1" style={{ width: "75%" }}>
                    NET Amount Payable:
                  </p>

                  <p className="text-right pr-1" style={{ width: "25%" }}>
                    {fmtAmt(netAmountPayable)}
                  </p>
                </div>

                <div
                  className="flex w-full border-l border-r border-t border-b border-black"
                  style={{
                    fontSize: "9px",
                    width: "100%",
                    lineHeight: "1.35",
                    minHeight: "18px",
                  }}
                >
                  <p className="pl-1 font-bold" style={{ width: "13%" }}>
                    Amount in Words:
                  </p>

                  <p
                    className="uppercase"
                    style={{ width: "87%", paddingRight: "15px" }}
                  >
                    {invoiceData?.currency || ""} {totalAmountInWords || ""}
                  </p>
                </div>
              </>
            )}
          </div>
        )}
      </>
    );
  };

  const TaxInvoiceChargeDetailsForTaxInvoiceReport = ({
    data,
    charge,
    index,
    hsnSac,
  }) => {
    const isCont = (row) => row?.__isContinuation === true;

    const showVal = (row, v, fallback = "") =>
      isCont(row) ? "" : (v ?? fallback);

    let totalAmount = 0;
    (charge || []).forEach((group) => {
      (group || []).forEach((item) => {
        if (!isNaN(item?.totalAmount) && item?.totalAmount !== null) {
          totalAmount += Number(item.totalAmount);
        }
      });
    });

    const gridTotal = (data?.[0]?.tblInvoiceCharge || []).reduce(
      (acc, curr) => {
        const qty = Number(curr?.qty || 0);
        const rate = Number(curr?.rate || 0);
        const exchangeRate = Number(curr?.exchangeRate || 1);
        const IGST = Number(curr?.IGST || 0);
        const CGST = Number(curr?.CGST || 0);
        const SGST = Number(curr?.SGST || 0);

        const rowTotal = qty * rate * exchangeRate + IGST + CGST + SGST;
        return acc + rowTotal;
      },
      0,
    );
    const gridRoundOfTotal = Number(gridTotal || 0).toFixed(2);

    // const totalAmountInWords =
    //   clientId === 13 || clientId === 9
    //     ? numberToWordsInIndianSystemWithOutPaisaAndRupees(
    //       parseFloat(gridRoundOfTotal || 0),
    //     )
    //     : numberToWordsInIndianSystemUsingWithPaisaAndRupees(
    //       parseFloat(gridRoundOfTotal || 0),
    //     );
    const totalAmountInWords = numberToWordsInIndianAndUsaSystem(
      parseFloat(gridRoundOfTotal || 0),
      data?.[0]?.currency,
    );
    const chargeList = data?.[0]?.tblInvoiceCharge || [];

    const totals = chargeList.reduce(
      (acc, item) => {
        //acc.totalAmountHc += Number(item?.totalAmountHc || 0);  as told by tejas
        acc.totalAmountFc += Number(item?.totalAmountFc || 0);
        acc.IGST += Number(item?.IGST || 0);
        acc.CGST += Number(item?.CGST || 0);
        acc.SGST += Number(item?.SGST || 0);
        return acc;
      },
      {
        totalAmountFc: 0,
        IGST: 0,
        CGST: 0,
        SGST: 0,
      },
    );

    const finalTotals = {
      totalAmountFc: totals.totalAmountFc.toFixed(2),
      IGST: totals.IGST.toFixed(2),
      CGST: totals.CGST.toFixed(2),
      SGST: totals.SGST.toFixed(2),
    };

    const currentPageLength = charge?.[index]?.length || 0;
    const nextPageLength = charge?.[index + 1]?.length || 0;
    const lastPageIndex = (charge?.length || 1) - 1;

    const totalPages = charge?.length || 0;

    const isLastPage =
      index === lastPageIndex ||
      (index === lastPageIndex - 1 && nextPageLength < 4);

    const isSinglePage = (charge?.length || 0) === 1;

    const chargeGridHeight =
      isChargesFinishedOnFirstPage === true ? "205px" : "350px";

    const showHsnGrid =
      isLastPage || (currentPageLength > 4 && currentPageLength < 10);

    return (
      <>
        {currentPageLength > 0 && (
          <div
            className="flex w-full border-black border-r border-l border-b text-center font-bold"
            style={{ fontSize: "9px", width: "100%" }}
          >
            <p className="border-r border-black" style={{ width: "27%" }}>
              DESCRIPTION
            </p>
            <p className="border-r border-black" style={{ width: "7%" }}>
              HSN / SAC Code
            </p>
            <p className="border-r border-black" style={{ width: "5%" }}>
              Size Type
            </p>
            <p className="border-r border-black" style={{ width: "3%" }}>
              Qty
            </p>
            <p className="border-r border-black" style={{ width: "8%" }}>
              Rate
            </p>
            <p className="border-r border-black" style={{ width: "4%" }}>
              Curr
            </p>
            <p className="border-r border-black" style={{ width: "6%" }}>
              Ex. Rate
            </p>
            <p className="border-r border-black" style={{ width: "8%" }}>
              Taxable Amount
            </p>
            <p className="border-r border-black" style={{ width: "5%" }}>
              Tax Rate
            </p>
            <p className="border-r border-black" style={{ width: "6%" }}>
              IGST
            </p>
            <p className="border-r border-black" style={{ width: "6%" }}>
              CGST
            </p>
            <p className="border-r border-black" style={{ width: "6%" }}>
              SGST
            </p>
            <p className="text-center" style={{ width: "9%" }}>
              Amount in {data?.[0]?.currency || ""}
            </p>
          </div>
        )}

        {currentPageLength > 0 && (
          <div
            className="border-black border-r border-l border-b"
            style={{ height: chargeGridHeight, overflow: "hidden" }}
          >
            {charge?.[index]?.map((chargeData, idx, array) => {
              const cont = isCont(chargeData);

              const qty = cont ? 0 : Number(chargeData?.qty || 0);
              const rate = cont ? 0 : Number(chargeData?.rate || 0);
              const exr = cont ? 1 : Number(chargeData?.exchangeRate || 1);
              const igst = cont ? 0 : Number(chargeData?.IGST || 0);
              const cgst = cont ? 0 : Number(chargeData?.CGST || 0);
              const sgst = cont ? 0 : Number(chargeData?.SGST || 0);

              const amount = cont
                ? ""
                : (qty * rate * exr + igst + cgst + sgst).toFixed(2);

              return (
                <div
                  key={idx}
                  className={`flex w-full ${idx === array.length - 1 ? "border-b" : ""}`}
                  style={{ fontSize: "9px", width: "100%" }}
                >
                  <p
                    className="pb-1 border-r border-black"
                    style={{ width: "27%", paddingLeft: "2px" }}
                  >
                    {chargeData?.description || ""}
                  </p>

                  <p
                    className=" border-r border-black text-center"
                    style={{ width: "7%" }}
                  >
                    {showVal(chargeData, chargeData?.hsn, "")}{" "}
                    {showVal(chargeData, chargeData?.sac, "")}
                  </p>

                  <p
                    className="pb-1 border-r border-black text-center"
                    style={{ width: "5%" }}
                  >
                    {showVal(chargeData, chargeData?.size, "")}{" "}
                    {showVal(chargeData, chargeData?.typeCode, "")}
                  </p>

                  <p
                    className="pb-1 border-r border-black text-center"
                    style={{ width: "3%" }}
                  >
                    {showVal(chargeData, chargeData?.qty, "")}
                  </p>

                  <p
                    className="pb-1 pr-1 border-r border-black text-right"
                    style={{ width: "8%" }}
                  >
                    {showVal(
                      chargeData,
                      chargeData?.rate != null
                        ? Number(chargeData.rate).toLocaleString("en-IN", {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })
                        : "",
                      "",
                    )}
                  </p>

                  <p
                    className="pb-1 border-r border-black text-center"
                    style={{ width: "4%" }}
                  >
                    {showVal(chargeData, chargeData?.chargeCurrency, "")}
                  </p>

                  <p
                    className="pb-1 pr-1 border-r border-black text-right"
                    style={{ width: "6%" }}
                  >
                    {showVal(
                      chargeData,
                      chargeData?.exchangeRate != null
                        ? Number(chargeData.exchangeRate)
                        : // ? Number(chargeData.exchangeRate).toFixed(2)
                          "",
                      "",
                    )}
                  </p>

                  <p
                    className="pb-1 pr-1 border-r border-black text-right"
                    style={{ width: "8%" }}
                  >
                    {showVal(
                      chargeData,
                      chargeData?.totalAmountFc != null
                        ? Number(chargeData.totalAmountFc).toLocaleString(
                            "en-IN",
                            {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            },
                          )
                        : "",
                      "",
                    )}
                  </p>

                  <p
                    className="pb-1 pr-1 border-r border-black text-right"
                    style={{ width: "5%" }}
                  >
                    {showVal(
                      chargeData,
                      (chargeData?.tblInvoiceChargeTax || [])
                        .reduce(
                          (sum, item) =>
                            sum + (Number(item?.taxPercentage) || 0),
                          0,
                        )
                        .toLocaleString("en-IN", {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        }),
                      "",
                    )}
                  </p>

                  {/* ✅ IMPORTANT: remove "|| 0.00" fallback, and hide on continuation */}
                  <p
                    className="pb-1 pr-1 border-r border-black text-right"
                    style={{ width: "6%" }}
                  >
                    {cont
                      ? ""
                      : chargeData?.IGST != null
                        ? Number(chargeData.IGST).toLocaleString("en-IN", {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })
                        : ""}
                  </p>
                  <p
                    className="pb-1 pr-1 border-r border-black text-right"
                    style={{ width: "6%" }}
                  >
                    {cont
                      ? ""
                      : chargeData?.CGST != null
                        ? Number(chargeData.CGST).toLocaleString("en-IN", {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })
                        : ""}
                  </p>
                  <p
                    className="pb-1 pr-1 border-r border-black text-right"
                    style={{ width: "6%" }}
                  >
                    {cont
                      ? ""
                      : chargeData?.SGST != null
                        ? Number(chargeData.SGST).toLocaleString("en-IN", {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })
                        : ""}
                  </p>

                  <p className="pb-1 pr-1 text-right " style={{ width: "9%" }}>
                    {amount != null
                      ? Number(amount).toLocaleString("en-IN", {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })
                      : ""}
                  </p>
                </div>
              );
            })}

            {/* Final row - Amount in Words kash */}
            <div
              className="flex w-full border-black text-center font-bold"
              style={{ fontSize: "8px", width: "100%" }}
            >
              <p
                className="border-t  border-r border-black text-right pr-1"
                style={{ width: "60%" }}
              >
                Total
              </p>
              <p
                className="border-t border-black text-right border-r pr-1"
                style={{ width: "8%" }}
              >
                {finalTotals?.totalAmountFc != null
                  ? Number(finalTotals.totalAmountFc).toLocaleString("en-IN", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })
                  : ""}
              </p>
              <p
                className="border-t border-black text-right border-r pr-1"
                style={{ width: "5%" }}
              ></p>
              <p
                className="border-t border-black text-right border-r pr-1"
                style={{ width: "6%" }}
              >
                {finalTotals?.IGST != null
                  ? Number(finalTotals.IGST).toLocaleString("en-IN", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })
                  : ""}
              </p>
              <p
                className="border-t border-black text-right border-r pr-1"
                style={{ width: "6%" }}
              >
                {finalTotals?.CGST != null
                  ? Number(finalTotals.CGST).toLocaleString("en-IN", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })
                  : ""}
              </p>
              <p
                className="border-t border-black text-right border-r pr-1"
                style={{ width: "6%" }}
              >
                {finalTotals?.SGST != null
                  ? Number(finalTotals.SGST).toLocaleString("en-IN", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })
                  : ""}
              </p>
              <p
                className="border-t border-black text-right pr-1"
                style={{ width: "9%" }}
              >
                {Number(gridTotal ?? 0).toLocaleString("en-IN", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </p>
            </div>
            {/* amountInWords */}
            <div
              className={`flex w-full border-t border-black ${index != 0 ? "border-b" : ""} `}
              style={{ fontSize: "8px", width: "100%" }}
            >
              <p
                className="pl-1 uppercase"
                style={{ width: "85%", paddingRight: "15px" }}
              >
                <span className="font-bold">Amount in Words </span>
                {data?.[0]?.currency || ""} {totalAmountInWords || ""}
              </p>
            </div>
          </div>
        )}

        {showHsnGrid && index === totalPages - 1 && (
          <div>
            <TaxInvoiceHsnSummaryGrid hsnSac={hsnSac} data={data} />
          </div>
        )}
      </>
    );
  };

  const GeneralSalesInvoiceChargeDetailsForTaxInvoiceReport = ({
    data,
    charge,
    index,
    hsnSac,
  }) => {
    const isCont = (row) => row?.__isContinuation === true;

    const showVal = (row, v, fallback = "") =>
      isCont(row) ? "" : (v ?? fallback);

    const isHomeCurrency = Number(data?.[0]?.isHomeCurrency) === 1;
    const chargeList = data?.[0]?.tblInvoiceCharge || [];
    const chargeTotals = getChargeTotals(chargeList, isHomeCurrency);
    const gridTotal = chargeTotals.totalAmount;
    const gridRoundOfTotal = Number(gridTotal || 0).toFixed(2);

    // const totalAmountInWords =
    //   clientId === 13 || clientId === 9
    //     ? numberToWordsInIndianSystemWithOutPaisaAndRupees(
    //       parseFloat(gridRoundOfTotal || 0),
    //     )
    //     : numberToWordsInIndianSystemUsingWithPaisaAndRupees(
    //       parseFloat(gridRoundOfTotal || 0),
    //     );
    const totalAmountInWords = numberToWordsInIndianAndUsaSystem(
      parseFloat(gridRoundOfTotal || 0),
      data?.[0]?.currency,
    );

    const currentPageLength = charge?.[index]?.length || 0;
    const nextPageLength = charge?.[index + 1]?.length || 0;
    const lastPageIndex = (charge?.length || 1) - 1;

    const totalPages = charge?.length || 0;

    const isLastPage =
      index === lastPageIndex ||
      (index === lastPageIndex - 1 && nextPageLength < 4);

    const isSinglePage = (charge?.length || 0) === 1;

    const chargeGridHeight =
      isChargesFinishedOnFirstPage === true ? "205px" : "350px";

    const showHsnGrid =
      isLastPage || (currentPageLength > 4 && currentPageLength < 10);

    return (
      <>
        {currentPageLength > 0 && (
          <div
            className="flex w-full border-black border-r border-l border-b text-center font-bold"
            style={{ fontSize: "9px", width: "100%" }}
          >
            <p className="border-r border-black" style={{ width: "27%" }}>
              DESCRIPTION
            </p>
            <p className="border-r border-black" style={{ width: "7%" }}>
              HSN / SAC Code
            </p>
            <p className="border-r border-black" style={{ width: "5%" }}>
              Size Type
            </p>
            <p className="border-r border-black" style={{ width: "3%" }}>
              Qty
            </p>
            <p className="border-r border-black" style={{ width: "8%" }}>
              Rate
            </p>
            <p className="border-r border-black" style={{ width: "4%" }}>
              Curr
            </p>
            <p className="border-r border-black" style={{ width: "6%" }}>
              Ex. Rate
            </p>
            <p className="border-r border-black" style={{ width: "8%" }}>
              Taxable Amount
            </p>
            <p className="border-r border-black" style={{ width: "5%" }}>
              Tax Rate
            </p>
            <p className="border-r border-black" style={{ width: "6%" }}>
              IGST
            </p>
            <p className="border-r border-black" style={{ width: "6%" }}>
              CGST
            </p>
            <p className="border-r border-black" style={{ width: "6%" }}>
              SGST
            </p>
            <p className="text-center" style={{ width: "9%" }}>
              Amount in {data?.[0]?.currency || ""}
            </p>
          </div>
        )}

        {currentPageLength > 0 && (
          <div
            className="border-black border-r border-l border-b"
            style={{ height: chargeGridHeight, overflow: "hidden" }}
          >
            {charge?.[index]?.map((chargeData, idx, array) => {
              const cont = isCont(chargeData);
              const financials = cont
                ? null
                : getChargeFinancials(chargeData, isHomeCurrency);

              return (
                <div
                  key={idx}
                  className={`flex w-full ${idx === array.length - 1 ? "border-b" : ""}`}
                  style={{ fontSize: "9px", width: "100%" }}
                >
                  <p
                    className="pb-1 border-r border-black"
                    style={{ width: "27%", paddingLeft: "2px" }}
                  >
                    {chargeData?.description || ""}
                  </p>

                  <p
                    className=" border-r border-black text-center"
                    style={{ width: "7%" }}
                  >
                    {showVal(chargeData, chargeData?.hsn, "")}{" "}
                    {showVal(chargeData, chargeData?.sac, "")}
                  </p>

                  <p
                    className="pb-1 border-r border-black text-center"
                    style={{ width: "5%" }}
                  >
                    {showVal(chargeData, chargeData?.size, "")}{" "}
                    {showVal(chargeData, chargeData?.typeCode, "")}
                  </p>

                  <p
                    className="pb-1 border-r border-black text-center"
                    style={{ width: "3%" }}
                  >
                    {showVal(chargeData, chargeData?.qty, "")}
                  </p>

                  <p
                    className="pb-1 pr-1 border-r border-black text-right"
                    style={{ width: "8%" }}
                  >
                    {showVal(
                      chargeData,
                      chargeData?.rate != null
                        ? Number(chargeData.rate).toLocaleString("en-IN", {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })
                        : "",
                      "",
                    )}
                  </p>

                  <p
                    className="pb-1 border-r border-black text-center"
                    style={{ width: "4%" }}
                  >
                    {showVal(chargeData, chargeData?.chargeCurrency, "")}
                  </p>

                  <p
                    className="pb-1 pr-1 border-r border-black text-right"
                    style={{ width: "6%" }}
                  >
                    {showVal(
                      chargeData,
                      chargeData?.exchangeRate != null
                        ? Number(chargeData.exchangeRate)
                        : // ? Number(chargeData.exchangeRate).toFixed(2)
                          "",
                      "",
                    )}
                  </p>

                  <p
                    className="pb-1 pr-1 border-r border-black text-right"
                    style={{ width: "8%" }}
                  >
                    {showVal(
                      chargeData,
                      formatAmountBlankIfZero(financials?.taxableAmount),
                      "",
                    )}
                  </p>

                  <p
                    className="pb-1 pr-1 border-r border-black text-right"
                    style={{ width: "5%" }}
                  >
                    {showVal(
                      chargeData,
                      (chargeData?.tblInvoiceChargeTax || [])
                        .reduce(
                          (sum, item) =>
                            sum + (Number(item?.taxPercentage) || 0),
                          0,
                        )
                        .toLocaleString("en-IN", {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        }),
                      "",
                    )}
                  </p>

                  {/* ✅ IMPORTANT: remove "|| 0.00" fallback, and hide on continuation */}
                  <p
                    className="pb-1 pr-1 border-r border-black text-right"
                    style={{ width: "6%" }}
                  >
                    {cont ? "" : formatAmountBlankIfZero(financials?.IGST)}
                  </p>

                  <p
                    className="pb-1 pr-1 border-r border-black text-right"
                    style={{ width: "6%" }}
                  >
                    {cont ? "" : formatAmountBlankIfZero(financials?.CGST)}
                  </p>

                  <p
                    className="pb-1 pr-1 border-r border-black text-right"
                    style={{ width: "6%" }}
                  >
                    {cont ? "" : formatAmountBlankIfZero(financials?.SGST)}
                  </p>

                  <p className="pb-1 pr-1 text-right " style={{ width: "9%" }}>
                    {cont
                      ? ""
                      : formatAmountBlankIfZero(financials?.totalAmount)}
                  </p>
                </div>
              );
            })}

            {/* Final row - Amount in Words kash */}
            <div
              className="flex w-full border-black text-center font-bold"
              style={{ fontSize: "8px", width: "100%" }}
            >
              <p
                className="border-t  border-r border-black text-right pr-1"
                style={{ width: "60%" }}
              >
                Total
              </p>
              <p
                className="border-t border-black text-right border-r pr-1"
                style={{ width: "8%" }}
              >
                {formatAmountBlankIfZero(chargeTotals?.taxableAmount)}
              </p>
              <p
                className="border-t border-black text-right border-r pr-1"
                style={{ width: "5%" }}
              ></p>
              <p
                className="border-t border-black text-right border-r pr-1"
                style={{ width: "6%" }}
              >
                {formatAmountBlankIfZero(chargeTotals?.IGST)}
              </p>
              <p
                className="border-t border-black text-right border-r pr-1"
                style={{ width: "6%" }}
              >
                {formatAmountBlankIfZero(chargeTotals?.CGST)}
              </p>
              <p
                className="border-t border-black text-right border-r pr-1"
                style={{ width: "6%" }}
              >
                {formatAmountBlankIfZero(chargeTotals?.SGST)}
              </p>
              <p
                className="border-t border-black text-right pr-1"
                style={{ width: "9%" }}
              >
                {Number(gridTotal ?? 0).toLocaleString("en-IN", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </p>
            </div>
            {/* amountInWords */}
            <div
              className={`flex w-full border-t border-black ${index != 0 ? "border-b" : ""} `}
              style={{ fontSize: "8px", width: "100%" }}
            >
              <p
                className="pl-1 uppercase"
                style={{ width: "85%", paddingRight: "15px" }}
              >
                <span className="font-bold">Amount in Words </span>
                {data?.[0]?.currency || ""} {totalAmountInWords || ""}
              </p>
            </div>
          </div>
        )}

        {showHsnGrid && index === totalPages - 1 && (
          <div>
            <TaxInvoiceHsnSummaryGrid hsnSac={hsnSac} data={data} />
          </div>
        )}
      </>
    );
  };

  const GeneralSalesInvoiceChargeDetailsForTaxInvoiceReportBackup = ({
    data,
    charge,
    index,
    hsnSac,
  }) => {
    const isCont = (row) => row?.__isContinuation === true;

    const showVal = (row, v, fallback = "") =>
      isCont(row) ? "" : (v ?? fallback);

    let totalAmount = 0;
    (charge || []).forEach((group) => {
      (group || []).forEach((item) => {
        if (!isNaN(item?.totalAmount) && item?.totalAmount !== null) {
          totalAmount += Number(item.totalAmount);
        }
      });
    });

    const gridTotal = (data?.[0]?.tblInvoiceCharge || []).reduce(
      (acc, curr) => {
        const qty = Number(curr?.qty || 0);
        const rate = Number(curr?.rate || 0);
        const exchangeRate = Number(curr?.exchangeRate || 1);
        const IGST = Number(curr?.IGST || 0);
        const CGST = Number(curr?.CGST || 0);
        const SGST = Number(curr?.SGST || 0);

        const rowTotal = qty * rate * exchangeRate + IGST + CGST + SGST;
        return acc + rowTotal;
      },
      0,
    );
    const gridRoundOfTotal = Number(gridTotal || 0).toFixed(2);

    // const totalAmountInWords =
    //   clientId === 13 || clientId === 9
    //     ? numberToWordsInIndianSystemWithOutPaisaAndRupees(
    //       parseFloat(gridRoundOfTotal || 0),
    //     )
    //     : numberToWordsInIndianSystemUsingWithPaisaAndRupees(
    //       parseFloat(gridRoundOfTotal || 0),
    //     );
    const totalAmountInWords = numberToWordsInIndianAndUsaSystem(
      parseFloat(gridRoundOfTotal || 0),
      data?.[0]?.currency,
    );
    const chargeList = data?.[0]?.tblInvoiceCharge || [];

    const totals = chargeList.reduce(
      (acc, item) => {
        //acc.totalAmountHc += Number(item?.totalAmountHc || 0);  as told by tejas
        acc.totalAmountFc += Number(item?.totalAmountFc || 0);
        acc.IGST += Number(item?.IGST || 0);
        acc.CGST += Number(item?.CGST || 0);
        acc.SGST += Number(item?.SGST || 0);
        return acc;
      },
      {
        totalAmountFc: 0,
        IGST: 0,
        CGST: 0,
        SGST: 0,
      },
    );

    const finalTotals = {
      totalAmountFc: totals.totalAmountFc.toFixed(2),
      IGST: totals.IGST.toFixed(2),
      CGST: totals.CGST.toFixed(2),
      SGST: totals.SGST.toFixed(2),
    };

    const currentPageLength = charge?.[index]?.length || 0;
    const nextPageLength = charge?.[index + 1]?.length || 0;
    const lastPageIndex = (charge?.length || 1) - 1;

    const totalPages = charge?.length || 0;

    const isLastPage =
      index === lastPageIndex ||
      (index === lastPageIndex - 1 && nextPageLength < 4);

    const isSinglePage = (charge?.length || 0) === 1;

    const chargeGridHeight =
      isChargesFinishedOnFirstPage === true ? "205px" : "350px";

    const showHsnGrid =
      isLastPage || (currentPageLength > 4 && currentPageLength < 10);

    return (
      <>
        {currentPageLength > 0 && (
          <div
            className="flex w-full border-black border-r border-l border-b text-center font-bold"
            style={{ fontSize: "9px", width: "100%" }}
          >
            <p className="border-r border-black" style={{ width: "27%" }}>
              DESCRIPTION
            </p>
            <p className="border-r border-black" style={{ width: "9%" }}>
              HSN / SAC Code
            </p>
            <p className="border-r border-black" style={{ width: "7%" }}>
              Quantity (Units)
            </p>
            <p className="border-r border-black" style={{ width: "8%" }}>
              Rate per Unit
            </p>
            <p className="border-r border-black" style={{ width: "7%" }}>
              Curr
            </p>
            <p className="border-r border-black" style={{ width: "6%" }}>
              Ex. Rate
            </p>
            <p className="border-r border-black" style={{ width: "10%" }}>
              Total Amt in Charge Curr
            </p>
            <p className="border-r border-black" style={{ width: "10%" }}>
              Taxable Amount
            </p>
            <p className="text-center" style={{ width: "16%" }}>
              Non-Taxable
            </p>
          </div>
        )}

        {currentPageLength > 0 && (
          <div
            className="border-black border-r border-l border-b"
            style={{ height: chargeGridHeight, overflow: "hidden" }}
          >
            {charge?.[index]?.map((chargeData, idx, array) => {
              const cont = isCont(chargeData);

              const qty = cont ? 0 : Number(chargeData?.qty || 0);
              const rate = cont ? 0 : Number(chargeData?.rate || 0);
              const exr = cont ? 1 : Number(chargeData?.exchangeRate || 1);
              const igst = cont ? 0 : Number(chargeData?.IGST || 0);
              const cgst = cont ? 0 : Number(chargeData?.CGST || 0);
              const sgst = cont ? 0 : Number(chargeData?.SGST || 0);

              const amount = cont
                ? ""
                : (qty * rate * exr + igst + cgst + sgst).toFixed(2);

              return (
                <div
                  key={idx}
                  className={`flex w-full ${idx === array.length - 1 ? "border-b" : ""}`}
                  style={{ fontSize: "9px", width: "100%" }}
                >
                  <p
                    className="pb-1 border-r border-black"
                    style={{ width: "27%", paddingLeft: "2px" }}
                  >
                    {chargeData?.description || ""}
                  </p>

                  <p
                    className=" border-r border-black text-center"
                    style={{ width: "9%" }}
                  >
                    {showVal(chargeData, chargeData?.hsn, "")}{" "}
                    {showVal(chargeData, chargeData?.sac, "")}
                  </p>

                  <p
                    className="pb-1 border-r border-black text-center"
                    style={{ width: "7%" }}
                  >
                    {showVal(chargeData, chargeData?.qty, "")}
                  </p>

                  <p
                    className="pb-1 pr-1 border-r border-black text-right"
                    style={{ width: "8%" }}
                  >
                    {showVal(
                      chargeData,
                      chargeData?.rate != null
                        ? Number(chargeData.rate).toLocaleString("en-IN", {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })
                        : "",
                      "",
                    )}
                  </p>

                  <p
                    className="pb-1 border-r border-black text-center"
                    style={{ width: "7%" }}
                  >
                    {showVal(chargeData, chargeData?.chargeCurrency, "")}
                  </p>

                  <p
                    className="pb-1 pr-1 border-r border-black text-right"
                    style={{ width: "6%" }}
                  >
                    {showVal(
                      chargeData,
                      chargeData?.exchangeRate != null
                        ? Number(chargeData.exchangeRate)
                        : // ? Number(chargeData.exchangeRate).toFixed(2)
                          "",
                      "",
                    )}
                  </p>

                  <p
                    className="pb-1 pr-1 border-r border-black text-right"
                    style={{ width: "10%" }}
                  >
                    {showVal(
                      chargeData,
                      (chargeData?.tblInvoiceChargeTax || [])
                        .reduce(
                          (sum, item) =>
                            sum + (Number(item?.taxPercentage) || 0),
                          0,
                        )
                        .toLocaleString("en-IN", {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        }),
                      "",
                    )}
                  </p>

                  <p
                    className="pb-1 pr-1 border-r border-black text-right"
                    style={{ width: "10%" }}
                  >
                    {showVal(
                      chargeData,
                      chargeData?.totalAmountFc != null
                        ? Number(chargeData.totalAmountFc).toLocaleString(
                            "en-IN",
                            {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            },
                          )
                        : "",
                      "",
                    )}
                  </p>

                  <p className="pb-1 pr-1 text-right " style={{ width: "16%" }}>
                    {amount != null
                      ? Number(amount).toLocaleString("en-IN", {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })
                      : ""}
                  </p>
                </div>
              );
            })}

            {/* Final row - Amount in Words kash */}
            <div
              className="flex w-full border-black text-center font-bold"
              style={{ fontSize: "8px", width: "100%" }}
            >
              <p
                className="border-t  border-r border-black text-right pr-1"
                style={{ width: "74%" }}
              >
                Total
              </p>
              <p
                className="border-t border-black text-right border-r pr-1"
                style={{ width: "10%" }}
              >
                {finalTotals?.totalAmountFc != null
                  ? Number(finalTotals.totalAmountFc).toLocaleString("en-IN", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })
                  : ""}
              </p>
              <p
                className="border-t border-black text-right pr-1"
                style={{ width: "16%" }}
              >
                {Number(gridTotal ?? 0).toLocaleString("en-IN", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </p>
            </div>
            {/* amountInWords */}
            <div
              className={`flex w-full border-t border-black ${index != 0 ? "border-b" : ""} `}
              style={{ fontSize: "8px", width: "100%" }}
            >
              <p
                className="pl-1 uppercase"
                style={{ width: "85%", paddingRight: "15px" }}
              >
                <span className="font-bold">Amount in Words </span>
                {data?.[0]?.currency || ""} {totalAmountInWords || ""}
              </p>
            </div>
          </div>
        )}

        {showHsnGrid && index === totalPages - 1 && (
          <div>
            <TaxInvoiceHsnSummaryGrid hsnSac={hsnSac} data={data} />
          </div>
        )}
      </>
    );
  };

  const TgkTaxInvoiceChargeDetails = ({ data, charge, index, hsnSac }) => {
    const isCont = (row) => row?.__isContinuation === true;

    const showVal = (row, v, fallback = "") =>
      isCont(row) ? "" : (v ?? fallback);

    const getTaxableAmount = (row) => {
      if (isCont(row)) return "";

      const qty = Number(row?.qty || 0);
      const rate = Number(row?.rate || 0);
      const exchangeRate = Number(row?.exchangeRate || 1);

      return qty * rate * exchangeRate;
    };

    const getTaxAmount = (row) => {
      if (isCont(row)) return "";

      return Number(row?.taxAmount || 0);
    };

    const getAmountInCurrency = (row) => {
      if (isCont(row)) return "";

      const taxableAmount = getTaxableAmount(row);
      const taxAmount = getTaxAmount(row);

      return taxableAmount + taxAmount;
    };

    const gridTotal = (data?.[0]?.tblInvoiceCharge || []).reduce(
      (acc, curr) => {
        const taxableAmount = Number(getTaxableAmount(curr) || 0);
        const taxAmount = Number(curr?.taxAmount || 0);

        return acc + taxableAmount + taxAmount;
      },
      0,
    );

    const totalAmountInWords = numberToWordsWithOutCurrency(
      parseFloat(gridTotal || 0),
    );

    const chargesTotal = data?.[0]?.tblInvoiceCharge || [];

    const totalTaxAmount = chargesTotal.reduce((sum, chargeData) => {
      if (isCont(chargeData)) return sum;
      return sum + (Number(chargeData?.taxAmount) || 0);
    }, 0);

    const totalTaxableAmount = chargesTotal.reduce((sum, chargeData) => {
      if (isCont(chargeData)) return sum;

      const qty = Number(chargeData?.qty) || 0;
      const rate = Number(chargeData?.rate) || 0;
      const exchangeRate = Number(chargeData?.exchangeRate) || 0;

      return sum + qty * rate * exchangeRate;
    }, 0);

    const currentPageLength = charge?.[index]?.length || 0;
    const nextPageLength = charge?.[index + 1]?.length || 0;
    const lastPageIndex = (charge?.length || 1) - 1;

    const totalPages = charge?.length || 0;

    const isLastPage =
      index === lastPageIndex ||
      (index === lastPageIndex - 1 && nextPageLength < 4);

    const isSinglePage = (charge?.length || 0) === 1;

    // const chargeGridHeight = "200px";
    const chargeGridHeight = "300px";

    const showHsnGrid =
      isLastPage || (currentPageLength > 4 && currentPageLength < 10);

    return (
      <>
        {currentPageLength > 0 && (
          <div
            className="flex w-full border-black border-r border-l border-b text-center font-bold"
            style={{ fontSize: "9px", width: "100%" }}
          >
            <p className="border-r border-black" style={{ width: "32%" }}>
              DESCRIPTION
            </p>
            <p className="border-r border-black" style={{ width: "11%" }}>
              Size Type
            </p>
            <p className="border-r border-black" style={{ width: "7%" }}>
              Qty
            </p>
            <p className="border-r border-black" style={{ width: "9%" }}>
              Rate
            </p>
            <p className="border-r border-black" style={{ width: "7%" }}>
              Curr
            </p>
            <p className="border-r border-black" style={{ width: "10%" }}>
              Ex. Rate
            </p>
            <p className="border-r border-black" style={{ width: "10%" }}>
              Taxable Amount
            </p>
            <p className="border-r border-black" style={{ width: "7%" }}>
              Tax Rate
            </p>
            <p className="text-center" style={{ width: "10%" }}>
              Amount in {data?.[0]?.currency || ""}
            </p>
          </div>
        )}

        {currentPageLength > 0 && (
          <div
            className="border-black border-r border-l border-b"
            style={{ height: chargeGridHeight, overflow: "hidden" }}
          >
            {charge?.[index]?.map((chargeData, idx, array) => {
              const taxableAmount = getTaxableAmount(chargeData);
              const taxAmount = getTaxAmount(chargeData);
              const amountInCurrency = getAmountInCurrency(chargeData);

              return (
                <div
                  key={idx}
                  className={`flex w-full ${
                    idx === array.length - 1 ? "border-b" : ""
                  }`}
                  style={{ fontSize: "9px", width: "100%" }}
                >
                  <p
                    className="pb-1 border-r border-black ps-1"
                    style={{ width: "32%", paddingLeft: "4px" }}
                  >
                    {chargeData?.description || chargeData?.chargeGl || ""}
                  </p>

                  <p
                    className="pb-1 border-r border-black text-center"
                    style={{ width: "11%" }}
                  >
                    {showVal(chargeData, chargeData?.size, "")}{" "}
                    {showVal(chargeData, chargeData?.typeCode, "")}
                  </p>

                  <p
                    className="pb-1 border-r border-black text-center"
                    style={{ width: "7%" }}
                  >
                    {showVal(chargeData, chargeData?.qty, "")}
                  </p>

                  <p
                    className="pb-1 border-r border-black text-center"
                    style={{ width: "9%" }}
                  >
                    {showVal(chargeData, chargeData?.rate, "")}
                  </p>

                  <p
                    className="pb-1 border-r border-black text-center"
                    style={{ width: "7%" }}
                  >
                    {showVal(chargeData, chargeData?.chargeCurrency, "")}
                  </p>

                  <p
                    className="pb-1 border-r border-black text-center"
                    style={{ width: "10%" }}
                  >
                    {showVal(chargeData, chargeData?.exchangeRate, "")}
                  </p>

                  <p
                    className="pb-1 border-r border-black text-center"
                    style={{ width: "10%" }}
                  >
                    {isCont(chargeData) ? "" : taxableAmount.toFixed(2)}
                  </p>

                  <p
                    className="pb-1 border-r border-black text-center"
                    style={{ width: "7%" }}
                  >
                    {isCont(chargeData) ? "" : taxAmount.toFixed(2)}
                  </p>

                  <p className="pb-1 text-center" style={{ width: "10%" }}>
                    {isCont(chargeData) ? "" : amountInCurrency.toFixed(2)}
                  </p>
                </div>
              );
            })}
            {/* TEJAS */}
            <div
              className="flex w-full border-black border-t text-center font-bold"
              style={{ fontSize: "9px", width: "100%" }}
            >
              <p
                className="border-r border-black text-right pr-1"
                style={{ width: "76%" }}
              >
                Total {data?.[0]?.currency || ""}
              </p>
              <p className="border-r border-black" style={{ width: "10%" }}>
                {totalTaxableAmount?.toFixed(2) || "0.00"}
              </p>
              <p className="border-r border-black" style={{ width: "7%" }}>
                {totalTaxAmount?.toFixed(2) || "0.00"}
              </p>
              <p className="text-center" style={{ width: "10%" }}>
                {Number(gridTotal || 0).toFixed(2)}
              </p>
            </div>

            <div
              className="flex w-full border-t border-b border-black"
              style={{ fontSize: "9px", width: "100%" }}
            >
              <p
                className="p-1 uppercase"
                style={{ width: "85%", paddingRight: "15px" }}
              >
                <span className="font-bold">Amount in Words </span>
                {data?.[0]?.currency || ""} {totalAmountInWords || ""} Only
              </p>
              <p className="p-1" style={{ width: "8%" }}>
                {/* Total {data?.[0]?.currency || ""} */}
              </p>
              <p className="p-1" style={{ width: "7%" }}>
                {/* {Number(gridTotal || 0).toFixed(2)} */}
              </p>
            </div>
          </div>
        )}

        {/* {showHsnGrid && index === totalPages - 1 && (
        <div>
          <TgkTaxInvoiceHsnSummaryGrid hsnSac={hsnSac} data={data} />
        </div>
      )} */}
      </>
    );
  };

  const InvoicePrintDeteChargeDetails = ({
    data,
    charge,
    chargeAtt,
    index,
    hsnSac,
  }) => {
    let totalAmount = 0;
    charge.forEach((group) => {
      group.forEach((item) => {
        if (!isNaN(item.totalAmount) && item.totalAmount !== null) {
          totalAmount += Number(item.totalAmount);
        }
      });
    });

    const gridTotal = data[0]?.tblInvoiceCharge?.reduce((acc, curr) => {
      const qty = Number(curr.qty || 0);
      const rate = Number(curr.rate || 0);
      const exchangeRate = Number(curr.exchangeRate || 1);
      const tax = Number(curr.IGST || curr.CGST || curr.SGST || 0);

      // const rowTotal = qty * rate * exchangeRate + tax;
      const rowTotal = qty * rate * exchangeRate + tax; //Math.round(qty * rate * exchangeRate + tax);

      return acc + rowTotal;
    }, 0);
    // akash
    const totalAmountInWords = numberToWordsWithOutCurrency(
      parseFloat(gridTotal),
    );

    // Calculate the number of charges on the current page
    const currentPageLength = charge[index]?.length || 0;
    const nextPageLength = charge[index + 1]?.length || 0;
    const lastPageIndex = charge.length - 1;

    const totalPages = charge.length;
    // Determine if it's the last page
    const isLastPage =
      index === lastPageIndex ||
      (index === lastPageIndex - 1 && nextPageLength < 4);

    // Condition to check if there is only one page
    const isSinglePage = charge.length === 1;

    // Adjust the charge grid height based on whether it's a single page or not
    // const chargeGridHeight = isSinglePage ? "490px" : "490px"; // Set to 100px for a single page, otherwise keep it 245px.

    // // Show the second grid only if it's the last page or if more than 4 charges exist
    // const showHsnGrid =
    //   isLastPage || (currentPageLength > 4 && currentPageLength < 10);

    return (
      <>
        {/* First Grid: Charge Details */}

        {currentPageLength > 0 && !chargeAtt?.length && (
          <div
            className="flex w-full border-black border-r border-l border-b text-center font-bold"
            style={{ fontSize: "9px", width: "100%" }}
          >
            <p className="p-1 border-r border-black" style={{ width: "45%" }}>
              Charge
            </p>
            <p className="p-1 border-r border-black" style={{ width: "10%" }}>
              Qty
            </p>
            <p className="p-1 border-r border-black" style={{ width: "10%" }}>
              Rate
            </p>
            <p className="p-1 border-r border-black" style={{ width: "10%" }}>
              Curr
            </p>
            <p className="p-1 border-r border-black" style={{ width: "10%" }}>
              Ex. Rate
            </p>
            <p className="p-1 border-black" style={{ width: "15%" }}>
              Amount
            </p>
          </div>
        )}

        {chargeAtt && chargeAtt.length > 0 && (
          <div
            className="flex w-full border-black border-r border-l border-b text-center font-bold"
            style={{ fontSize: "9px", width: "100%" }}
          >
            <p className="p-1 border-r border-black" style={{ width: "47%" }}>
              Charge
            </p>
            <p className="p-1 border-r border-black" style={{ width: "12%" }}>
              Qty
            </p>
            <p className="p-1 border-r border-black" style={{ width: "12%" }}>
              Curr
            </p>
            <p className="p-1 border-r border-black" style={{ width: "12%" }}>
              Ex. Rate
            </p>
            <p className="p-1 border-black" style={{ width: "17%" }}>
              Amount
            </p>
          </div>
        )}

        {/* Charge Grid */}
        {currentPageLength > 0 && (
          <div
            className="border-black border-r border-l"
            style={{ maxheight: "540px", minHeight: "540px", height: "540px" }}
            // style={{ height: chargeGridHeight, overflow: "hidden" }}
          >
            {!chargeAtt?.length &&
              charge[index]?.map((chargeData, idx, array) => (
                <div
                  key={idx}
                  className={`flex w-full ${
                    idx === array.length - 1 ? "border-b border-black" : ""
                  }`}
                  style={{ fontSize: "9px", width: "100%" }}
                >
                  <p
                    className="pb-1 pl-2 border-r border-black "
                    style={{ width: "45%" }}
                  >
                    {chargeData?.description || ""}
                  </p>
                  <p
                    className="pb-1 border-r border-black text-center ps-1"
                    style={{ width: "10%" }}
                  >
                    {chargeData?.qty || ""}
                  </p>
                  <p
                    className="pb-1 border-r border-black text-center ps-1"
                    style={{ width: "10%" }}
                  >
                    {chargeData?.rate || ""}
                  </p>
                  <p
                    className="pb-1 border-r border-black text-center ps-1"
                    style={{ width: "10%" }}
                  >
                    {chargeData?.chargeCurrency || ""}
                  </p>
                  <p
                    className="pb-1 border-r border-black text-center ps-1"
                    style={{ width: "10%" }}
                  >
                    {chargeData?.exchangeRate || ""}
                  </p>
                  <p
                    className="pb-1 border-black text-center ps-1"
                    style={{ width: "15%" }}
                  >
                    {chargeData?.totalAmountFc || ""}
                  </p>
                </div>
              ))}

            {chargeAtt &&
              chargeAtt.length > 0 &&
              charge[index]?.map((chargeData, idx, array) => (
                <div
                  key={idx}
                  className={`flex w-full ${
                    idx === array.length - 1 ? "border-b border-black" : ""
                  }`}
                  style={{ fontSize: "9px", width: "100%" }}
                >
                  <p
                    className="pb-1 pl-2 border-r border-black"
                    style={{ width: "47%" }}
                  >
                    {chargeData?.description || ""}
                  </p>
                  <p
                    className="pb-1 border-r border-black text-center ps-1"
                    style={{ width: "12%" }}
                  >
                    {chargeData?.qty || ""}
                  </p>
                  <p
                    className="pb-1 border-r border-black text-center ps-1"
                    style={{ width: "12%" }}
                  >
                    {chargeData?.chargeCurrency || ""}
                  </p>
                  <p
                    className="pb-1 border-r border-black text-center ps-1"
                    style={{ width: "12%" }}
                  >
                    {chargeData?.exchangeRate || ""}
                  </p>
                  <p
                    className="pb-1 border-black text-center ps-1"
                    style={{ width: "17%" }}
                  >
                    {chargeData?.totalAmountFc || ""}
                  </p>
                </div>
              ))}

            {/* Final row - Amount in Words */}
            <div
              className="flex w-full border-b border-black"
              style={{ fontSize: "9px", width: "100%" }}
            >
              <div className="border-r border-black" style={{ width: "50%" }}>
                <div>
                  <p className=" text-left pl-2">Note :</p>
                </div>
                <div>
                  <p className=" text-left pl-2">
                    {" "}
                    ANY DISCREPANCY NOTED IN INVOICE, SHOULD BE BROUGHT TO OUR
                    NOTICE WITH IN 7 (SEVEN) DAYS FROM DATE OF INVOICE.
                  </p>
                </div>
              </div>
              <div className="border-black" style={{ width: "50%" }}>
                <div className="flex w-full border-b border-black pb-1 pt-1">
                  <p className=" text-right" style={{ width: "60%" }}>
                    Subtotal
                  </p>
                  <p className="text-right pr-1" style={{ width: "40%" }}>
                    {gridTotal?.toFixed(2)}
                  </p>
                </div>
                <div className="flex w-full pb-1 pt-1">
                  <p className=" text-right" style={{ width: "60%" }}>
                    Amount {data[0]?.currency || ""}
                  </p>
                  <p className="text-right pr-1" style={{ width: "40%" }}>
                    {gridTotal?.toFixed(2)}
                  </p>
                </div>
              </div>
            </div>
            <div
              className="flex w-full border-b border-black"
              style={{ fontSize: "9px", width: "100%" }}
            >
              <p
                className="p-1 uppercase"
                style={{ width: "85%", paddingRight: "15px" }}
              >
                <span className="font-bold">Amount in Words </span>
                {data[0]?.currency || ""} {totalAmountInWords || ""} Only
              </p>
            </div>

            {chargeAtt[index] && chargeAtt[index].length > 0 && (
              <div>
                <div
                  className="border-black text-Right font-bold pt-5"
                  style={{ fontSize: "10px", width: "100%" }}
                >
                  <p className="p-1 border-black">
                    Container Detention Details:-
                  </p>
                </div>

                <div
                  className="flex w-full border-black border-b border-t text-center font-bold "
                  style={{ fontSize: "9px", width: "100%" }}
                >
                  <p
                    className="p-1 border-r border-black"
                    style={{ width: "20%" }}
                  >
                    Container No
                  </p>
                  <p
                    className="p-1 border-r border-black"
                    style={{ width: "15%" }}
                  >
                    From Date
                  </p>
                  <p
                    className="p-1 border-r border-black"
                    style={{ width: "15%" }}
                  >
                    To Date
                  </p>
                  <p
                    className="p-1 border-r border-black"
                    style={{ width: "15%" }}
                  >
                    No of Day's
                  </p>
                  <p
                    className="p-1 border-r border-black"
                    style={{ width: "15%" }}
                  >
                    Rate
                  </p>
                  <p className="p-1 border-black" style={{ width: "20%" }}>
                    Total Amount(Rs.)
                  </p>
                </div>

                <div className="w-full border-black border-b text-center">
                  {chargeAtt[index]?.map((chargeAttData, idx, array) => (
                    <div
                      key={idx}
                      className={`flex w-full ${
                        idx === array.length - 1 ? "border-b" : ""
                      }`}
                      style={{ fontSize: "9px", width: "100%" }}
                    >
                      <p
                        className="pb-1 pl-2 border-r border-black"
                        style={{ width: "20%" }}
                      >
                        {chargeAttData?.containerNo || ""}
                      </p>
                      <p
                        className="pb-1 border-r border-black text-center ps-1"
                        style={{ width: "15%" }}
                      >
                        {chargeAttData?.fromDate || ""}
                      </p>
                      <p
                        className="pb-1 border-r border-black text-center ps-1"
                        style={{ width: "15%" }}
                      >
                        {chargeAttData?.toDate || ""}
                      </p>
                      <p
                        className="pb-1 border-r border-black text-center ps-1"
                        style={{ width: "15%" }}
                      >
                        {chargeAttData?.noOfDays || ""}
                      </p>
                      <p
                        className="pb-1 border-r border-black text-center ps-1"
                        style={{ width: "15%" }}
                      >
                        {chargeAttData?.rate || ""}
                      </p>
                      <p
                        className="pb-1 border-black text-center ps-1"
                        style={{ width: "20%" }}
                      >
                        {chargeAttData?.amountHc || ""}
                      </p>
                    </div>
                  ))}

                  {/* Totals Row */}
                  <div
                    className="flex w-full border-t border-black font-semibold"
                    style={{ fontSize: "9px" }}
                  >
                    <p
                      className="pb-1 pl-2 pr-2 border-r border-black text-right"
                      style={{ width: "65%" }}
                    >
                      Total :
                    </p>
                    <p
                      className="pb-1 border-r border-black text-center ps-1"
                      style={{ width: "15%" }}
                    >
                      {chargeAtt[index]
                        ?.reduce(
                          (sum, curr) => sum + (parseFloat(curr?.rate) || 0),
                          0,
                        )
                        .toFixed(2)}
                    </p>
                    <p
                      className="pb-1 border-black text-center ps-1"
                      style={{ width: "20%" }}
                    >
                      {chargeAtt[index]
                        ?.reduce(
                          (sum, curr) =>
                            sum + (parseFloat(curr?.amountHc) || 0),
                          0,
                        )
                        .toFixed(2)}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </>
    );
  };
  const InvoicePrintChargeDetails = ({ data, charge, index, hsnSac }) => {
    let totalAmount = 0;
    charge.forEach((group) => {
      group.forEach((item) => {
        if (!isNaN(item.totalAmount) && item.totalAmount !== null) {
          totalAmount += Number(item.totalAmount);
        }
      });
    });

    // const gridTotal = data[0]?.tblInvoiceCharge?.reduce((acc, curr) => {
    //   const qty = Number(curr.qty || 0);
    //   const rate = Number(curr.rate || 0);
    //   const exchangeRate = Number(curr.exchangeRate || 1);
    //   const tax = Number(curr.IGST || curr.CGST || curr.SGST || 0);

    //   // const rowTotal = qty * rate * exchangeRate + tax;
    //   const rowTotal = Math.round(qty * rate * exchangeRate + tax);

    //   return acc + rowTotal;
    // }, 0);

    //const gridTotal = data[0]?.totalInvoiceAmount;
    // number in, string "5498.00" out
    const raw = Number(data?.[0]?.totalInvoiceAmount ?? 0);
    const gridTotal = raw; // 5498 (number)
    const gridTotalDisplay = gridTotal.toFixed(2); // "5498.00" (string)

    // const totalAmountInWords = numberToWords(
    //   parseFloat(gridTotalDisplay),
    //   "INR",
    // );

    // Calculate the number of charges on the current page
    const currentPageLength = charge[index]?.length || 0;
    const nextPageLength = charge[index + 1]?.length || 0;
    const lastPageIndex = charge.length - 1;

    const totalPages = charge.length;
    // Determine if it's the last page
    const isLastPage =
      index === lastPageIndex ||
      (index === lastPageIndex - 1 && nextPageLength < 4);

    // Condition to check if there is only one page
    const isSinglePage = charge.length === 1;

    // Adjust the charge grid height based on whether it's a single page or not
    // const chargeGridHeight = isSinglePage ? "490px" : "490px"; // Set to 100px for a single page, otherwise keep it 245px.

    // // Show the second grid only if it's the last page or if more than 4 charges exist
    // const showHsnGrid =
    //   isLastPage || (currentPageLength > 4 && currentPageLength < 10);

    return (
      <>
        {/* First Grid: Charge Details */}

        {currentPageLength > 0 && (
          <div
            className="flex w-full border-black border-r border-l border-b text-center font-bold"
            style={{ fontSize: "9px", width: "100%" }}
          >
            <p className="p-1 border-r border-black" style={{ width: "45%" }}>
              Charge
            </p>
            <p className="p-1 border-r border-black" style={{ width: "10%" }}>
              Qty
            </p>
            <p className="p-1 border-r border-black" style={{ width: "10%" }}>
              Rate
            </p>
            <p className="p-1 border-r border-black" style={{ width: "10%" }}>
              Curr
            </p>
            <p className="p-1 border-r border-black" style={{ width: "10%" }}>
              Ex. Rate
            </p>
            <p className="p-1 border-black" style={{ width: "15%" }}>
              Amount
            </p>
          </div>
        )}
        {/* Charge Grid */}
        {currentPageLength > 0 && (
          <div
            className="border-black border-r border-l"
            style={{ maxheight: "540px", minHeight: "540px", height: "540px" }}
            // style={{ height: chargeGridHeight, overflow: "hidden" }}
          >
            {charge[index]?.map((chargeData, idx, array) => (
              <div
                key={idx}
                className={`flex w-full ${
                  idx === array.length - 1 ? "border-b border-black" : ""
                }`}
                style={{ fontSize: "9px", width: "100%" }}
              >
                <p
                  className="pb-1 pl-2 border-r border-black "
                  style={{ width: "45%" }}
                >
                  {chargeData?.description || ""}
                </p>
                <p
                  className="pb-1 border-r border-black text-center ps-1"
                  style={{ width: "10%" }}
                >
                  {chargeData?.qty || ""}
                </p>
                <p
                  className="pb-1 border-r border-black text-center ps-1"
                  style={{ width: "10%" }}
                >
                  {chargeData?.rate || ""}
                </p>
                <p
                  className="pb-1 border-r border-black text-center ps-1"
                  style={{ width: "10%" }}
                >
                  {chargeData?.chargeCurrency || ""}
                </p>
                <p
                  className="pb-1 border-r border-black text-center ps-1"
                  style={{ width: "10%" }}
                >
                  {chargeData?.exchangeRate || ""}
                </p>
                <p
                  className="pb-1 border-black text-center ps-1"
                  style={{ width: "15%" }}
                >
                  {chargeData?.totalAmountFc || ""}
                </p>
              </div>
            ))}
            {/* Final row - Amount in Words */}
            <div
              className="flex w-full border-b border-black"
              style={{ fontSize: "9px", width: "100%" }}
            >
              <div className="border-r border-black" style={{ width: "50%" }}>
                <div>
                  <p className=" text-left pl-2">Note :</p>
                </div>
                <div>
                  <p className=" text-left pl-2">
                    {" "}
                    ANY DISCREPANCY NOTED IN INVOICE, SHOULD BE BROUGHT TO OUR
                    NOTICE WITH IN 7 (SEVEN) DAYS FROM DATE OF INVOICE.
                  </p>
                </div>
              </div>
              <div className="border-black" style={{ width: "50%" }}>
                <div className="flex w-full border-b border-black pb-1 pt-1">
                  <p className=" text-right" style={{ width: "60%" }}>
                    Subtotal
                  </p>
                  <p className="text-right pr-1" style={{ width: "40%" }}>
                    {/* {gridTotal?.toFixed(2)} */}
                    {gridTotalDisplay}
                  </p>
                </div>
                <div className="flex w-full pb-1 pt-1">
                  <p className=" text-right" style={{ width: "60%" }}>
                    Amount {data[0]?.currency || ""}
                  </p>
                  <p className="text-right pr-1" style={{ width: "40%" }}>
                    {/* {gridTotal?.toFixed(2)} */}
                    {gridTotalDisplay}
                  </p>
                </div>
              </div>
            </div>
            <div
              className="flex w-full border-b border-black"
              style={{ fontSize: "9px", width: "100%" }}
            >
              <p
                className="p-1 uppercase"
                style={{ width: "85%", paddingRight: "15px" }}
              >
                <span className="font-bold">Amount in Words </span>
                {data[0]?.currency || ""}{" "}
                {numberToWords(gridTotalDisplay) || ""} Only
              </p>
            </div>
          </div>
        )}
      </>
    );
  };
  const InvoicePrintSubLeaseChargeDetails = ({
    data,
    charge,
    index,
    hsnSac,
  }) => {
    let totalAmount = 0;
    charge.forEach((group) => {
      group.forEach((item) => {
        if (!isNaN(item.totalAmount) && item.totalAmount !== null) {
          totalAmount += Number(item.totalAmount);
        }
      });
    });

    const raw = Number(data?.[0]?.totalInvoiceAmount ?? 0);
    const gridTotal = raw; //Math.round(raw); // 5498 (number)
    const gridTotalDisplay = gridTotal.toFixed(2); // "5498.00" (string)

    const totalAmountInWords = numberToWords(
      parseFloat(gridTotalDisplay),
      "INR",
    );

    const grandTotalInWords = toWords(gridTotalDisplay);

    // Calculate the number of charges on the current page
    const currentPageLength = charge[index]?.length || 0;
    const nextPageLength = charge[index + 1]?.length || 0;
    const lastPageIndex = charge.length - 1;

    const totalPages = charge.length;
    // Determine if it's the last page
    const isLastPage =
      index === lastPageIndex ||
      (index === lastPageIndex - 1 && nextPageLength < 4);

    // Condition to check if there is only one page
    const isSinglePage = charge.length === 1;

    // Adjust the charge grid height based on whether it's a single page or not
    // const chargeGridHeight = isSinglePage ? "490px" : "490px"; // Set to 100px for a single page, otherwise keep it 245px.

    // // Show the second grid only if it's the last page or if more than 4 charges exist
    // const showHsnGrid =
    //   isLastPage || (currentPageLength > 4 && currentPageLength < 10);

    return (
      <>
        {/* First Grid: Charge Details */}

        {currentPageLength > 0 && (
          <div
            className="flex w-full border-black border-r border-l border-b text-center font-bold"
            style={{ fontSize: "9px", width: "100%" }}
          >
            <p className="p-1 border-r border-black" style={{ width: "47%" }}>
              Charge
            </p>
            <p className="p-1 border-r border-black" style={{ width: "12%" }}>
              Qty
            </p>
            {/* <p className="p-1 border-r border-black" style={{ width: "10%" }}>
              Rate
            </p> */}
            <p className="p-1 border-r border-black" style={{ width: "12%" }}>
              Curr
            </p>
            <p className="p-1 border-r border-black" style={{ width: "12%" }}>
              Ex. Rate
            </p>
            <p className="p-1 border-black" style={{ width: "17%" }}>
              Amount
            </p>
          </div>
        )}
        {/* Charge Grid */}
        {currentPageLength > 0 && (
          <div
            className="border-black border-r border-l"
            style={{ maxheight: "540px", minHeight: "540px", height: "540px" }}
            // style={{ height: chargeGridHeight, overflow: "hidden" }}
          >
            {charge[index]?.map((chargeData, idx, array) => (
              <div
                key={idx}
                className={`flex w-full ${
                  idx === array.length - 1 ? "border-b border-black" : ""
                }`}
                style={{ fontSize: "9px", width: "100%" }}
              >
                <p
                  className="pb-1 pl-2 border-r border-black "
                  style={{ width: "47%" }}
                >
                  {chargeData?.description || ""}
                </p>
                <p
                  className="pb-1 border-r border-black text-center ps-1"
                  style={{ width: "12%" }}
                >
                  {chargeData?.qty || ""}
                </p>
                {/* <p
                  className="pb-1 border-r border-black text-center ps-1"
                  style={{ width: "10%" }}
                >
                  {chargeData?.rate || ""}
                </p> */}
                <p
                  className="pb-1 border-r border-black text-center ps-1"
                  style={{ width: "12%" }}
                >
                  {chargeData?.chargeCurrency || ""}
                </p>
                <p
                  className="pb-1 border-r border-black text-center ps-1"
                  style={{ width: "12%" }}
                >
                  {chargeData?.exchangeRate || ""}
                </p>
                <p
                  className="pb-1 border-black text-center ps-1"
                  style={{ width: "17%" }}
                >
                  {/* {chargeData?.totalAmountFc
                    ? Math.round(chargeData?.totalAmountFc).toFixed(2)
                    : ""} */}
                  {chargeData?.totalAmountFc?.toFixed(2) || ""}
                </p>
              </div>
            ))}
            {/* Final row - Amount in Words */}
            <div
              className="flex w-full border-b border-black"
              style={{ fontSize: "9px", width: "100%" }}
            >
              <div className="border-r border-black" style={{ width: "50%" }}>
                <div>
                  <p className=" text-left pl-2">Note :</p>
                </div>
                <div>
                  <p className=" text-left pl-2">
                    {" "}
                    ANY DISCREPANCY NOTED IN INVOICE, SHOULD BE BROUGHT TO OUR
                    NOTICE WITH IN 7 (SEVEN) DAYS FROM DATE OF INVOICE.
                  </p>
                </div>
              </div>
              <div className="border-black" style={{ width: "50%" }}>
                <div className="flex w-full border-b border-black pb-1 pt-1">
                  <p className=" text-right" style={{ width: "60%" }}>
                    Subtotal
                  </p>
                  <p className="text-right pr-1" style={{ width: "40%" }}>
                    {gridTotalDisplay}
                  </p>
                </div>
                <div className="flex w-full pb-1 pt-1">
                  <p className=" text-right" style={{ width: "60%" }}>
                    Amount {data[0]?.currency || ""}
                  </p>
                  <p className="text-right pr-1" style={{ width: "40%" }}>
                    {gridTotalDisplay}
                  </p>
                </div>
              </div>
            </div>
            <div
              className="flex w-full border-b border-black"
              style={{ fontSize: "9px", width: "100%" }}
            >
              <p
                className="p-1 uppercase"
                style={{ width: "85%", paddingRight: "15px" }}
              >
                <span className="font-bold">Amount in Words </span>
                {data[0]?.currency || ""} {/* {totalAmountInWords || ""} */}
                {grandTotalInWords} Only
              </p>
            </div>
          </div>
        )}
      </>
    );
  };
  const TaxInvoiceRemarks = ({ data }) => {
    const remarks = data?.[0]?.remarks || "";
    const containerNos = data?.[0]?.containerNos || "";

    return (
      <div className="border-r border-l border-b border-black ps-1">
        <p style={{ fontSize: "8px" }}>
          <span className="font-bold">Remarks : </span>
          {remarks}
        </p>

        <p
          style={{
            fontSize: "8px",
            marginTop: "1px",
            display: "flex",
            alignItems: "flex-start",
          }}
        >
          <span className="font-bold" style={{ flexShrink: 0 }}>
            Container No(s) :&nbsp;
          </span>

          <span
            style={{
              flex: 1,
              overflowWrap: "anywhere",
              wordBreak: "break-word",
            }}
          >
            {containerNos}
          </span>
        </p>
      </div>
    );
  };

  const ImportTaxInvoiceRemarks = ({ data }) => {
    return (
      <div className="border-r border-l border-b border-black p-2">
        <p style={{ fontSize: "9px" }}>
          <span className="font-bold">Remarks : </span> {data[0]?.remarks || ""}
        </p>
        <p style={{ fontSize: "9px", marginTop: "2px" }}>
          <span className="font-bold">Container No(s) : </span>
          {data[0]?.containerNos || ""}
        </p>
      </div>
    );
  };

  const TgkTaxInvoiceRemarks = ({ data }) => {
    return (
      <div className="border-r border-l border-b border-black p-2">
        <p style={{ fontSize: "9px" }}>
          <span className="font-bold">Remarks : </span> {data[0]?.remarks || ""}
        </p>
        <p style={{ fontSize: "9px", marginTop: "2px" }}>
          <span className="font-bold">Container No(s) : </span>
          {data[0]?.containerNos || ""}
        </p>
      </div>
    );
  };

  const TaxInvoiceRemarksSLS = ({ data }) => {
    const remarks = data?.[0]?.remarks ?? "";
    const containerNos = data?.[0]?.containerNos ?? "";

    return (
      <div className="border-r border-l border-b border-black p-2">
        <div style={{ fontSize: "9px" }}>
          <span className="font-bold">Remarks : </span>
          <span>{remarks}</span>
        </div>

        <div
          style={{
            fontSize: "9px",
            marginTop: "2px",
            display: "grid",
            gridTemplateColumns: "auto 1fr",
            columnGap: "4px",
            alignItems: "start",
          }}
        >
          <span className="font-bold" style={{ whiteSpace: "nowrap" }}>
            Container No(s) :
          </span>

          <span
            style={{
              whiteSpace: "normal",
              overflowWrap: "anywhere",
              wordBreak: "break-word",
              minWidth: 0, // ✅ IMPORTANT: allows wrapping in grid/flex
            }}
          >
            {containerNos}
          </span>
        </div>
      </div>
    );
  };
  const InvoicePrintRemarks = ({ data }) => {
    const sizeType = data?.[0]?.sizeTypeContainer || "";
    const containerNos = data?.[0]?.containerNos || "";

    const lineClamp2 = {
      fontSize: "9px",
      marginTop: "1px",
      lineHeight: "11px",
      whiteSpace: "normal",
      overflow: "hidden",
      overflowWrap: "anywhere", // ✅ breaks long text safely
      wordBreak: "break-word",
      display: "-webkit-box",
      WebkitBoxOrient: "vertical",
      WebkitLineClamp: 2, // ✅ show max 2 lines
    };

    return (
      <div
        className="border-r border-l border-b border-black pl-2 pt-1 pb-1"
        style={{ minHeight: "40px", maxHeight: "40px", overflow: "hidden" }}
      >
        <p style={{ fontSize: "9px", marginTop: "1px", lineHeight: "11px" }}>
          <span className="font-bold">Container : </span>
          {sizeType}
        </p>

        <p style={lineClamp2}>{containerNos}</p>
      </div>
    );
  };

  const TaxInvoiceSpacing = () => {
    return (
      <div
        className="border-b border-r border-l border-black"
        style={{ height: "330px" }}
      ></div>
    );
  };

  const TgkTaxInvoiceSpacing = () => {
    return (
      <div
        className="border-b border-r border-l border-black"
        style={{ height: "330px" }}
      ></div>
    );
  };

  const TaxInvoiceTermsAndCondition = ({ data, index, termsAndConditions }) => {
    const companyName = data[0]?.company || "";
    const isSinglePage = charge.length === 1;
    const chargeGridHeight = isSinglePage ? "120px" : "260px";
    // Helper to turn a newline or array into a sequence of lines
    const renderTerms = (tc) => {
      if (Array.isArray(tc)) {
        return tc.map((line, i) => (
          <React.Fragment key={i}>
            {line}
            <br />
          </React.Fragment>
        ));
      }
      if (typeof tc === "string") {
        return tc.split(/\r?\n/).map((line, i) => (
          <React.Fragment key={i}>
            {line.trim()}
            <br />
          </React.Fragment>
        ));
      }
      return null;
    };

    return (
      <>
        <div
          className="flex border-r border-l border-b border-black p-1"
          style={{ fontSize: "8px", height: chargeGridHeight }}
        >
          <div style={{ width: "70%" }}>
            <p className="font-bold">Terms And Condition :</p>
            <p style={{ lineHeight: 1.4, fontSize: "8px" }}>
              {termsAndConditions ? (
                renderTerms(termsAndConditions)
              ) : (
                <p style={{ lineHeight: 1.4, fontSize: "8px" }}>
                  a) All payments should be in favour of {companyName}
                  <br />
                  b) If any discrepancy is noticed in the invoice, kindly inform
                  us in writing within 7 days else the same will be considered
                  as correct.
                  <br />
                  c) If payment is delayed beyond agreed credit terms, it will
                  attract interest @18% per annum.
                  <br />
                  d) Please check your GST Details. If the same needs
                  modification kindly notify us within 3 working days.
                  <br />
                  e) Kindly settle the tax component of the invoice within 7
                  days.
                  <br />
                  f) Jurisdiction: Dispute if any shall be subject to the
                  jurisdiction of Mumbai (India) Courts only.
                  <br />
                </p>
              )}
            </p>
          </div>
          <div style={{ width: "30%" }}>
            <p className="font-bold text-right pr-4" style={{ height: "56%" }}>
              For {companyName}
            </p>
            <p className="font-bold text-right pr-4">Authorized Signatory</p>
          </div>
        </div>
        <div className="p-1 border-r border-l border-b border-black flex">
          <div className="font-bold" style={{ width: "90%", fontSize: "8px" }}>
            This is a computer generated invoice no stamp and signature is
            required.
          </div>
          <div style={{ width: "10%", fontSize: "8px" }}>
            Page {index + 1} of{" "}
            {Math.ceil(data[0]?.tblInvoiceCharge?.length / itemsPerPage || 1)}
          </div>
        </div>
      </>
    );
  };

  const TaxInvoiceTermsAndConditionForTaxInvoiceReport = ({
    data,
    index,
    termsAndConditions,
    totalPages,
    compact = false,
  }) => {
    const companyName = data[0]?.company || "";
    const isSinglePage = charge.length === 1;
    //const chargeGridHeight = isSinglePage ? "120px" : "260px";
    const chargeGridHeight = compact ? "72px" : "95px";
    const termsLineHeight = compact ? 1.2 : 1.4;
    // Helper to turn a newline or array into a sequence of lines
    const renderTerms = (tc) => {
      if (Array.isArray(tc)) {
        return tc.map((line, i) => (
          <React.Fragment key={i}>
            {line}
            <br />
          </React.Fragment>
        ));
      }
      if (typeof tc === "string") {
        return tc.split(/\r?\n/).map((line, i) => (
          <React.Fragment key={i}>
            {line.trim()}
            <br />
          </React.Fragment>
        ));
      }
      return null;
    };

    return (
      <>
        <div
          className="flex border-r border-l border-b border-black p-1"
          style={{ fontSize: "8px", height: chargeGridHeight }}
        >
          <div style={{ width: "70%" }}>
            <p className="font-bold">Terms And Condition :</p>
            <p style={{ lineHeight: termsLineHeight, fontSize: "8px" }}>
              {termsAndConditions ? (
                renderTerms(termsAndConditions)
              ) : (
                <p style={{ lineHeight: termsLineHeight, fontSize: "8px" }}>
                  a) All payments should be in favour of {companyName}
                  <br />
                  b) If any discrepancy is noticed in the invoice, kindly inform
                  us in writing within 7 days else the same will be considered
                  as correct.
                  <br />
                  c) If payment is delayed beyond agreed credit terms, it will
                  attract interest @18% per annum.
                  <br />
                  d) Please check your GST Details. If the same needs
                  modification kindly notify us within 3 working days.
                  <br />
                  e) Kindly settle the tax component of the invoice within 7
                  days.
                  <br />
                  f) Jurisdiction: Dispute if any shall be subject to the
                  jurisdiction of Mumbai (India) Courts only.
                  <br />
                </p>
              )}
            </p>
          </div>
          <div style={{ width: "30%" }}>
            <p className="font-bold text-right pr-4" style={{ height: "56%" }}>
              For {companyName}
            </p>
            <p className="font-bold text-right pr-4">Authorized Signatory</p>
          </div>
        </div>
        <div className="p-1 border-r border-l border-b border-black flex">
          <div className="font-bold" style={{ width: "90%", fontSize: "8px" }}>
            This is a computer generated invoice no stamp and signature is
            required.
          </div>
          <div style={{ width: "10%", fontSize: "8px" }}>
            Page {index + 1} of{" "}
            {totalPages ||
              Math.ceil(data[0]?.tblInvoiceCharge?.length / itemsPerPage || 1)}
          </div>
        </div>
      </>
    );
  };

  const PurchaseInvoiceTermsAndConditionForTaxInvoiceReport = ({
    data,
    index,
    totalPages,
    compact = false,
  }) => {
    const companyName = data?.[0]?.company || "";
    const pageNo = index + 1;
    const pageCount = totalPages || 1;

    const termsBoxHeight = compact ? "105px" : "140px";

    return (
      <>
        <div
          className="border-r border-l border-b border-black"
          style={{
            fontSize: "8px",
            height: termsBoxHeight,
            width: "100%",
            padding: "6px 8px 4px 8px",
            position: "relative",
          }}
        >
          <div
            style={{
              position: "absolute",
              left: "8px",
              bottom: "4px",
            }}
          >
            <p
              className="font-bold"
              style={{
                marginBottom: compact ? "42px" : "62px",
                fontSize: "8px",
              }}
            >
              For {companyName}
            </p>

            <p
              className="font-bold"
              style={{
                fontSize: "8px",
                marginBottom: "8px",
              }}
            >
              Authorised Signatory
            </p>

            <p
              style={{
                fontSize: "8px",
                margin: 0,
              }}
            >
              E &amp; O.E.
            </p>
          </div>

          <div
            className="font-bold"
            style={{
              position: "absolute",
              right: "38px",
              bottom: "8px",
              fontSize: "8px",
              whiteSpace: "nowrap",
            }}
          >
            Page {pageNo} of {pageCount}
          </div>
        </div>
      </>
    );
  };

  const TgkTaxInvoiceTermsAndCondition = ({
    data,
    index,
    termsAndConditions,
  }) => {
    const companyName = data[0]?.company || "";
    const isSinglePage = charge.length === 1;
    const chargeGridHeight = isSinglePage ? "120px" : "260px";
    // Helper to turn a newline or array into a sequence of lines
    const renderTerms = (tc) => {
      if (Array.isArray(tc)) {
        return tc.map((line, i) => (
          <React.Fragment key={i}>
            {line}
            <br />
          </React.Fragment>
        ));
      }
      if (typeof tc === "string") {
        return tc.split(/\r?\n/).map((line, i) => (
          <React.Fragment key={i}>
            {line.trim()}
            <br />
          </React.Fragment>
        ));
      }
      return null;
    };

    return (
      <>
        <div
          className="flex border-r border-l border-b border-black p-1"
          style={{ fontSize: "8px", height: chargeGridHeight }}
        >
          <div style={{ width: "70%" }}>
            <p className="font-bold">Terms And Condition :</p>
            <p style={{ lineHeight: 1.4, fontSize: "8px" }}>
              {termsAndConditions ? (
                renderTerms(termsAndConditions)
              ) : (
                <p style={{ lineHeight: 1.4, fontSize: "8px" }}>
                  a) All payments should be in favour of {companyName}
                  <br />
                  b) If any discrepancy is noticed in the invoice, kindly inform
                  us in writing within 7 days else the same will be considered
                  as correct.
                  <br />
                  c) If payment is delayed beyond agreed credit terms, it will
                  attract interest @18% per annum.
                  <br />
                  d) Please check your GST Details. If the same needs
                  modification kindly notify us within 3 working days.
                  <br />
                  e) Kindly settle the tax component of the invoice within 7
                  days.
                  <br />
                  f) Jurisdiction: Dispute if any shall be subject to the
                  jurisdiction of Mumbai (India) Courts only.
                  <br />
                </p>
              )}
            </p>
          </div>
          {/* <div style={{ width: "30%" }}>
            <p className="font-bold text-right pr-4" style={{ height: "56%" }}>
              For {companyName}
            </p>
            <p className="font-bold text-right pr-4">Authorized Signatory</p>
          </div> */}
        </div>
        {/* <div className="p-1 border-r border-l border-b border-black flex">
          <div className="font-bold" style={{ width: "90%", fontSize: "8px" }}>
            This is a computer generated invoice no stamp and signature is
            required.
          </div>
          <div style={{ width: "10%", fontSize: "8px" }}>
            Page {index + 1} of{" "}
            {Math.ceil(data[0]?.tblInvoiceCharge?.length / itemsPerPage || 1)}
          </div>
        </div> */}
      </>
    );
  };

  const InvoicePrintTermsAndCondition = ({
    data,
    index,
    termsAndConditions,
  }) => {
    const companyName = data[0]?.company || "";

    // Helper to turn a newline or array into a sequence of lines
    const renderTerms = (tc) => {
      if (Array.isArray(tc)) {
        return tc.map((line, i) => (
          <React.Fragment key={i}>
            {line}
            <br />
          </React.Fragment>
        ));
      }
      if (typeof tc === "string") {
        return tc.split(/\r?\n/).map((line, i) => (
          <React.Fragment key={i}>
            {line.trim()}
            <br />
          </React.Fragment>
        ));
      }
      return null;
    };

    return (
      <>
        <div
          className="flex border border-black"
          style={{ fontSize: "9px", height: "140px" }}
        >
          <div
            className="text-left border-r border-black p-2"
            style={{ width: "60%", fontSize: "9px" }}
          >
            <p className="font-bold">
              All payment to be issued in favour of{" "}
              {data[0]?.company || ""}{" "}
            </p>
            <br />
            <p className="pt-1 pb-1 font-bold">For RTGS / NEFT Payment:</p>
            <div>
              <div className="flex w-full">
                <p
                  className="font-bold line-height-2 "
                  style={{ width: "30%" }}
                >
                  BANK NAME :{" "}
                </p>
                <p
                  className="font-bold text-left line-height-2 "
                  style={{ width: "70%" }}
                >
                  {data[0]?.bankName || ""}
                </p>
              </div>
              <div className="flex w-full">
                <p
                  className="font-bold line-height-2 "
                  style={{ width: "30%" }}
                >
                  BANK ADDRESS :{" "}
                </p>
                <p
                  className="font-bold text-left line-height-2 "
                  style={{ width: "70%" }}
                >
                  {data[0]?.bankAddress || ""}
                </p>
              </div>
              <div className="flex w-full">
                <p
                  className="font-bold line-height-2 "
                  style={{ width: "30%" }}
                >
                  CURRENT A/C NO :{" "}
                </p>
                <p
                  className="font-bold text-left line-height-2 "
                  style={{ width: "70%" }}
                >
                  {data[0]?.bankAccountNo || ""}
                </p>
              </div>
              <div className="flex w-full">
                <p
                  className="font-bold line-height-2 "
                  style={{ width: "30%" }}
                >
                  SWIFT CODE :{" "}
                </p>
                <p
                  className="font-bold text-left line-height-2 "
                  style={{ width: "70%" }}
                >
                  {data[0]?.bankSwiftCode || ""}
                </p>
              </div>
            </div>
          </div>
          <div style={{ width: "40%" }}>
            <div style={{ height: "56%" }}>
              <p className="font-bold text-right pr-4">For {companyName}</p>
              <div className="w-full flex justify-end">
                <img
                  // src="https://expresswayshipping.com/sql-api/uploads/SARSign.png"
                  src={`${baseUrlNext}/uploads/sbxSignature.jpg`}
                  style={{ width: "200px", height: "80px", marginRight: "2px" }}
                />
              </div>
              <p className="font-bold text-right pr-4">Authorized Signatory</p>
            </div>
          </div>
        </div>
        <div className="p-2 border-r border-l border-b border-black flex">
          <div
            className="font-bold"
            style={{ width: "90%", fontSize: "9px", color: "black" }}
          >
            This is a computer generated invoice no stamp and signature is
            required.
          </div>
          {/* <div style={{ width: "10%", fontSize: "9px" }}>
            Page {index + 1} of{" "}
            {Math.ceil(data[0]?.tblInvoiceCharge?.length / itemsPerPage || 1)}
          </div> */}
        </div>
        <div>
          {shouldRenderSecondPage && (
            <div
              id="second-page"
              className="mx-auto p-2"
              style={{ width: "100%", height: "auto" }}
            >
              <h2 className="text-black text-lg pb-2 font-semibold text-center">
                ATTACHED SHEET
              </h2>
              {/* B/L No Section */}
              <div
                className="flex"
                style={{ border: "1px solid black", height: "30px" }}
              >
                <div
                  style={{
                    flex: "0 0 50%",
                    paddingBottom: "10px",
                    paddingLeft: "10px",
                    paddingRight: "10px",
                  }}
                >
                  <p
                    className="text-black font-normal"
                    style={{
                      fontWeight: "bold",
                      fontSize: "9px",
                      paddingLeft: "10px",
                    }}
                  >
                    B/L No : {reportData?.blNo}
                  </p>
                </div>
                <div
                  style={{
                    flex: "0 0 50%",
                    paddingBottom: "10px",
                    paddingLeft: "10px",
                    paddingRight: "10px",
                  }}
                >
                  <p
                    className="text-black font-normal"
                    style={{
                      fontWeight: "bold",
                      fontSize: "9px",
                      paddingLeft: "10px",
                    }}
                  >
                    Vessel Name : {reportData?.oceanVessel?.Name}
                    <span className="ms-2">{reportData?.voyageNo?.Name}</span>
                  </p>
                </div>
              </div>
              {/* Description of goods */}
              <div
                className="flex"
                style={{
                  borderLeft: "1px solid black",
                  borderRight: "1px solid black",
                  borderBottom: "1px solid black",
                  height: "30px",
                }}
              >
                <div
                  style={{
                    flex: "0 0 40%",
                    paddingBottom: "10px",
                    paddingLeft: "10px",
                    paddingRight: "10px",
                    borderRight: "1px solid black",
                  }}
                >
                  <p
                    className="text-black font-normal"
                    style={{
                      fontWeight: "bold",
                      fontSize: "9px",
                      paddingLeft: "10px",
                    }}
                  >
                    Marks & Nos.
                  </p>
                </div>
                <div
                  style={{
                    flex: "0 0 40%",
                    paddingBottom: "10px",
                    paddingLeft: "10px",
                    paddingRight: "10px",
                  }}
                >
                  <p
                    className="text-black font-normal"
                    style={{
                      fontWeight: "bold",
                      fontSize: "9px",
                      paddingLeft: "10px",
                    }}
                  >
                    Description of goods
                  </p>
                </div>
              </div>
              {/* Description of goods Data*/}
              <div
                className="flex"
                style={{
                  borderLeft: "1px solid black",
                  borderRight: "1px solid black",
                  borderBottom: "1px solid black",
                  minHeight: "70px !important",
                }}
              >
                <div
                  style={{
                    flex: "0 0 40%",
                    paddingBottom: "10px",
                    paddingLeft: "10px",
                    paddingRight: "10px",
                    borderRight: "1px solid black",
                  }}
                >
                  <p
                    className="text-black font-normal"
                    style={{
                      fontWeight: "bold",
                      fontSize: "9px",
                      paddingLeft: "10px",
                    }}
                  ></p>
                </div>
                <div
                  style={{
                    flex: "40%",
                    paddingBottom: "10px",
                    paddingLeft: "10px",
                    paddingRight: "10px",
                  }}
                >
                  <p
                    className="text-black font-normal"
                    style={{
                      fontWeight: "bold",
                      fontSize: "9px",
                      paddingLeft: "10px",
                      fontWeight: "bold",
                    }}
                  >
                    {reportData?.descOfGoodsDetaislAttach}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </>
    );
  };
  const InvoiceNewTermAndCondition = () => {
    return (
      <>
        <div
          className="p-2 border border-black"
          style={{
            fontSize: "9px",
            color: "black",
            width: "100%",
            height: "278mm",
          }}
        >
          <p className="font-bold mt-4 mb-2">Terms & Conditions </p>
          <p>
            1. We always try our best to raise our invoices strictly as per our
            offer duly agreed and accepted by you. However still if there are
            any disputes it should be raised within 10 days from the date of
            invoice beyond which no disputes shall be entertained.{" "}
          </p>
          <p>
            2. Any claim / grievance brought by you against us should be
            notified to us in writing within 10 days of the date of the Invoice,
            failing which we shall have no liability whatsoever. No claim/
            grievance will be entertained after 10 days from the date of this
            invoice. No claim for loss, damage or delay will be entertained
            until all invoices and charges have been paid. The amount of any
            such claim shall not be deducted from amounts due to us.{" "}
          </p>
          <p>
            3. Parties shall meet and endeavour to amicably resolve through
            discussions any dispute, difference, claim or controversy including
            the matter of damages, if any (a “Dispute”) that arises by and
            between the Parties in connection of this Invoice, or anything
            connected or related to or incidental to this Invoice. If the
            Dispute is not amicably resolved by the Parties within 90 (ninety)
            days of the Parties meeting, either Party may submit the Dispute to
            Arbitration to be conducted in accordance with the Arbitration Act
            2001 and Amendment thereto in accordance with the following
            procedure:{" "}
          </p>
          <p>a. The arbitration proceedings shall be held in Singapore. </p>
          <p>
            b. There shall be a panel of 1 (One) arbitrator, to be selected by
            following the due process of law established under the Arbitration
            Act 2001.
          </p>
          <p>
            c. The arbitration proceedings shall be conducted and the award
            shall be rendered in English.
          </p>
          <p>
            d. The arbitrators shall make the award within 3 (three) months of
            entering upon the reference unless the time is extended by consent
            of both Parties.
          </p>
          <p>
            e. The award rendered by the arbitrators shall be final, conclusive
            and binding on the Parties.
          </p>
          <p>
            f. The award shall be enforceable in any court having jurisdiction,
            subject to Applicable Law.
          </p>
          <p>
            g. Each Party shall bear the cost of preparing and presenting its
            case.
          </p>
          <p>
            h. The Parties shall equally share the cost of arbitration,
            including the arbitrators' fees and expenses.
          </p>
          <p>
            4. The Courts of Singapore alone shall have jurisdiction with regard
            to all or any of the matters arising out of or in relation to this
            invoice.
          </p>
          <p>
            5. We request our invoices are duly processed and booked in your
            accounts well before the due dates as per our agreed credit limits.
          </p>
          <p>
            6. Payments are required to be made invoice to invoice to enable
            proper accounting at both the ends.
          </p>
          <p>
            7. Payments are to be made strictly on or before the due date, as
            per agreed credit terms in accordance with the contract or as per
            mail communication. Interest at the rate of 21% per annum shall be
            charged beyond the due dates.
          </p>
          <p>
            8. We do not offer and shall not be bound to insure the consignment
            or any part thereof. All movements of consignment are on 'Owners
            Risk basis' and not on 'Carrier Risk basis'. It is solely your
            obligation to take insurance for your consignment. Any consignment
            not insured by you, has been / shall be solely sent at your risk. In
            the event of the consignment being lost / misplaced / mis-delivered
            / untraceable during transit, our liability shall be limited to the
            amount of the invoice raised by us.
          </p>
          <p>
            9. We shall not be held responsible for any unintentional /
            accidental loss or damage to the consignment, either in our hands or
            in the hands of the carrier of the consignment.
          </p>
          <p>
            10. Consignments which cannot be delivered either because they are
            insufficiently or incorrectly addressed or because they are not
            collected or accepted by the Consignee, maybe sold or returned to
            you at our discretion, after the expiration of 21 days from the date
            a notice is issued to you at the address mentioned herein. All
            charges and expenses arising in connection with the sale or return
            of the consignment shall be paid by you.
          </p>
          <p>
            11. We shall have a lien on the consignment for all freight charges,
            customs duties, advances or any other charges arising out of the
            shipment of the consignment and shall have a right to refuse to
            release the consignment unless the charges as aforesaid are paid to
            us.
          </p>
          <p>
            12. If the consignment is not accepted by the consignee resulting in
            demurrage charges being payable, you shall be liable to pay the same
            immediately and in any event within a period of 7 days from the date
            the same become payable, failing which we shall be entitled to
            dispose-off the consignment and clear the demurrage charges. Any
            balance demurrage charges which remain payable even after the sale
            of the consignment, you remain to pay the same.
          </p>
          <p>
            13. We shall not be liable for delay in delivery or loss in transit
            of the consignment in the event of the happening of any force
            majeure event, including but not be limited to act of God, weather,
            fire, riots or civil commotion, strikes, epidemic, stormy weather,
            floods, natural disasters / calamities, transport failure, festival
            celebrations, labour shortage, curfew or lockdowns imposed by any
            Government / Local / Government /Local Authorities or any other
            cause which is beyond our control and which prevents us from
            performing our obligation in terms of this invoice. We shall issue
            you notice on the happening of any such force majeure event and
            shall use our best efforts to minimize the extent and effect of such
            event.
          </p>
          <p>
            14. We shall not be liable for any loss arising out of confiscation
            of the consignment by any Government / Local / Statutory Authority.
          </p>
          <p>
            15. You shall be liable for any duty, tax, any other charges by
            whatever levied by any Government / Local / Statutory Authority for
            or in connection with the consignment.
          </p>
          <p>
            16. You shall be responsible to comply with all applicable laws,
            customs and other Government / Local / Statutory Authority
            regulations of all countries / states through or over which the
            consignment may be carried including those relating to packing,
            carriage or delivery of the consignment and shall furnish such
            information and provide proper documentation as may be necessary to
            comply with such laws and regulations.
          </p>
          <p>
            17. You undertake to make good the loss to us or any of other
            customers in case the consignment causes any damage to other
            consignments loaded on the carriage due to inherent nature or
            mis-declaration of the consignment or due to seizure by any
            Government / Local / Statutory Authority due to improper /
            incomplete documentation which results in other consignments getting
            delayed and thereby loss to us. You are to indemnify us for any
            loss, direct or indirect, caused to us on account of the
            consignment.
          </p>
          <p>
            18. Consignments shall be deemed to be delivered to the Consignee
            once the consignment is delivered to the consignee/ person accepting
            on behalf of the consignee, consignments will be delivered to the
            address of the consignee and not necessarily to the named receiver
            personally.
          </p>
        </div>
        <div className="p-2 border-r border-l border-b border-black flex">
          <div
            className="font-bold"
            style={{ width: "90%", fontSize: "9px", color: "black" }}
          >
            This is a computer generated invoice no stamp and signature is
            required.
          </div>
          {/* <div style={{ width: "10%", fontSize: "9px", color: "black" }}>
            Page 2 of{" "}
            2
          </div> */}
        </div>
      </>
    );
  };
  const TaxInvoiceHsnSummaryGrid = ({ hsnSac, data }) => {
    console.log("hsnSac=>", hsnSac);
    console.log("data=>", data);
    const hsnSacRows = (hsnSac || []).flat();
    const totals = hsnSacRows.reduce(
      (acc, item) => {
        acc.CGST += item.CGST || 0;
        acc.SGST += item.SGST || 0;
        acc.IGST += item.IGST || 0;
        acc.taxableAmount += item.taxableAmount || 0;
        return acc;
      },
      { CGST: 0, SGST: 0, IGST: 0, taxableAmount: 0 },
    );

    const totalTax =
      parseFloat(totals?.IGST || 0) +
      parseFloat(totals?.CGST || 0) +
      parseFloat(totals?.SGST || 0);
    // const totalTaxAmountInWords =
    //   clientId === 13 || clientId === 9
    //     ? numberToWordsInIndianSystemWithOutPaisaAndRupees(
    //       parseFloat(totalTax || 0),
    //     )
    //     : numberToWordsInIndianSystemUsingWithPaisaAndRupees(
    //       parseFloat(totalTax || 0),
    //     );
    const totalTaxAmountInWords = numberToWordsInIndianAndUsaSystem(
      parseFloat(totalTax || 0),
      data?.[0]?.currency,
    );
    return (
      <>
        <div
          className="flex border-r border-l border-b border-black"
          style={{
            height: `${hsnGridHeight}px`,
            overflow: "hidden",
          }}
        >
          <div className="border-r border-black" style={{ width: "60%" }}>
            <div
              className="flex flex-between w-full font-bold text-center border-b border-black"
              style={{ fontSize: "8px" }}
            >
              <p className="flex-1 p-1 border-r border-black">HSN / SAC</p>
              <p className="flex-1 p-1 border-r border-black">Taxable Value</p>
              <p className="flex-1 p-1 border-r border-black">Rate</p>
              <p className="flex-1 p-1 border-r border-black">IGST</p>
              <p className="flex-1 p-1 border-r border-black">CGST</p>
              <p className="flex-1 p-1">SGST</p>
            </div>

            {/* Table Body */}
            <div style={{ height: "108px", overflow: "hidden" }}>
              {hsnSac?.map((group, groupIndex) => {
                const rows = group.map((item, index) => (
                  <div
                    key={`${groupIndex}-${index}`}
                    className="flex flex-between w-full text-center"
                    style={{ fontSize: "8px" }}
                  >
                    <p className="flex-1 pb-1 border-r border-black">
                      {item.sac || item.hsn || ""}
                    </p>
                    <p className="flex-1 pb-1 border-r text-right border-black">
                      {(item.taxableAmount || 0)?.toFixed(2)}
                    </p>
                    <p className="flex-1 pb-1 border-r text-right border-black">
                      {(item.taxPercentage || 0)?.toFixed(2)}
                    </p>
                    <p className="flex-1 pb-1 border-r text-right border-black">
                      {(item.IGST || 0)?.toFixed(2)}
                    </p>
                    <p className="flex-1 pb-1 border-r text-right border-black">
                      {(item.CGST || 0)?.toFixed(2)}
                    </p>
                    <p className="flex-1 pb-1 text-right">
                      {(item.SGST || 0)?.toFixed(2)}
                    </p>
                  </div>
                ));

                // Fill empty rows if less than 6
                const emptyRowsCount = Math.max(0, 7 - rows.length);
                const emptyRows = Array.from(
                  { length: emptyRowsCount },
                  (_, i) => (
                    <div
                      key={`empty-${groupIndex}-${i}`}
                      className="flex flex-between w-full font-bold text-center"
                      style={{ fontSize: "8px" }}
                    >
                      <p className="flex-1 pb-1 border-r border-black">
                        &nbsp;
                      </p>
                      <p className="flex-1 pb-1 border-r border-black">
                        &nbsp;
                      </p>
                      <p className="flex-1 pb-1 border-r border-black">
                        &nbsp;
                      </p>
                      <p className="flex-1 pb-1 border-r border-black">
                        &nbsp;
                      </p>
                      <p className="flex-1 pb-1 border-r border-black">
                        &nbsp;
                      </p>
                      <p className="flex-1 pb-1">&nbsp;</p>
                    </div>
                  ),
                );

                return [...rows, ...emptyRows];
              })}
            </div>

            <div
              className="flex flex-between w-full font-bold text-right border-t border-black"
              style={{ fontSize: "8px" }}
            >
              <p className="flex-1 p-1 border-r border-black">Total</p>
              <p className="flex-1 p-1 border-r border-black">
                {totals?.taxableAmount?.toFixed(2) || ""}
              </p>
              <p className="flex-1 p-1 border-r border-black">{""}</p>
              <p className="flex-1 p-1 border-r border-black">
                {totals?.IGST?.toFixed(2) || ""}
              </p>
              <p className="flex-1 p-1 border-r border-black">
                {totals?.CGST?.toFixed(2) || ""}
              </p>
              <p className="flex-1 p-1">{totals?.SGST?.toFixed(2) || ""}</p>
            </div>
          </div>
          <div className="p-1" style={{ width: "40%", fontSize: "7px" }}>
            <p style={{ fontSize: "8px" }}>
              In case of discrepancy in the invoice amount, please notify within
              2 days.
            </p>
            <p
              className="font-bold"
              style={{ fontSize: "8px", paddingBottom: "3px" }}
            >
              All payment to be issued in favour of{" "}
              {data[0]?.company || ""}{" "}
            </p>
            <p
              className=" font-bold"
              style={{ fontSize: "8px", paddingBottom: "2px" }}
            >
              For RTGS / NEFT Payment:
            </p>
            <div>
              <div className="flex" style={{ width: "100%" }}>
                <p
                  className="font-bold"
                  style={{ width: "30%", fontSize: "8px" }}
                >
                  BANK NAME :{" "}
                </p>
                <p
                  className="font-bold"
                  style={{ width: "70%", fontSize: "8px" }}
                >
                  {data[0]?.bankName || ""}
                </p>
              </div>
              <div className="flex" style={{ width: "100%" }}>
                <p
                  className="font-bold"
                  style={{ width: "30%", fontSize: "8px" }}
                >
                  BANK ADDRESS :{" "}
                </p>
                <p
                  className="font-bold"
                  style={{ width: "70%", fontSize: "8px" }}
                >
                  {data[0]?.bankAddress || ""}
                </p>
              </div>
              <div className="flex" style={{ width: "100%" }}>
                <p
                  className="font-bold "
                  style={{ fontSize: "8px", width: "30%" }}
                >
                  CURRENT A/C NO :{" "}
                </p>
                <p
                  className="font-bold"
                  style={{ fontSize: "8px", width: "70%" }}
                >
                  {data[0]?.bankAccountNo || ""}
                </p>
              </div>
              <div className="flex" style={{ width: "100%" }}>
                <p
                  className="font-bold"
                  style={{ fontSize: "8px", width: "30%" }}
                >
                  SWIFT CODE :{" "}
                </p>
                <p
                  className="font-bold"
                  style={{ fontSize: "8px", width: "70%" }}
                >
                  {data[0]?.bankSwiftCode || ""}
                </p>
              </div>
              <div className="flex" style={{ width: "100%" }}>
                <p
                  className="font-bold"
                  style={{ fontSize: "8px", width: "30%" }}
                >
                  IFSC CODE :{" "}
                </p>
                <p
                  className="font-bold"
                  style={{ fontSize: "8px", width: "70%" }}
                >
                  {data[0]?.bankIfscCode || ""}
                </p>
              </div>
            </div>
          </div>
        </div>
        <div
          className="flex w-full border-l border-b border-r border-black"
          style={{ fontSize: "9px", width: "100%" }}
        >
          <p
            className="p-1 uppercase"
            style={{ width: "85%", paddingRight: "15px", fontSize: "8px" }}
          >
            <span className="font-bold ">Tax Amount in Words </span>
            {data?.[0]?.currency || ""} {totalTaxAmountInWords || ""}
          </p>
        </div>
      </>
    );
  };

  const TaxInvoiceHsnSummaryGridFF = ({ hsnSac, data, compact = false }) => {
    console.log("hsnSac=>", hsnSac);
    console.log("data=>", data);
    const isHomeCurrency = Number(data?.[0]?.isHomeCurrency) === 1;
    const hsnSacRows = (hsnSac || []).flat();
    const hsnBodyRows = compact ? 4 : 7;
    const hsnBodyHeight = compact ? hsnBodyRows * 13 : 108;
    const hsnGridHeightPx = compact
      ? Number(data[0]?.isHomeCurrency) === 1
        ? 94
        : 108
      : Number(data[0]?.isHomeCurrency) === 1
        ? hsnGridHeight
        : hsnGridHeightFF;
    const totals = hsnSacRows.reduce(
      (acc, item) => {
        acc.CGST += item.CGST || 0;
        acc.SGST += item.SGST || 0;
        acc.IGST += item.IGST || 0;
        acc.CGST_HC += item.CGST_HC || 0;
        acc.SGST_HC += item.SGST_HC || 0;
        acc.IGST_HC += item.IGST_HC || 0;
        acc.taxableAmount += item.taxableAmount || 0;
        acc.taxableAmountFc += item.taxableAmountFc || 0;
        return acc;
      },
      {
        CGST: 0,
        SGST: 0,
        IGST: 0,
        CGST_HC: 0,
        SGST_HC: 0,
        IGST_HC: 0,
        taxableAmount: 0,
        taxableAmountFc: 0,
      },
    );

    const totalTax =
      parseFloat(totals?.IGST || 0) +
      parseFloat(totals?.CGST || 0) +
      parseFloat(totals?.SGST || 0);

    const totalTax_HC =
      parseFloat(totals?.IGST_HC || 0) +
      parseFloat(totals?.CGST_HC || 0) +
      parseFloat(totals?.SGST_HC || 0);

    const totalHCInWords = numberToWordsInIndianAndUsaSystem(
      parseFloat(totalTax_HC || 0),
      "INR",
    );

    // const totalTaxAmountInWords =
    //   clientId === 13 || clientId === 9
    //     ? numberToWordsInIndianSystemWithOutPaisaAndRupees(
    //       parseFloat(isHomeCurrency ? totalTax_HC : totalTax),
    //     )
    //     : numberToWordsInIndianSystemUsingWithPaisaAndRupees(
    //       parseFloat(isHomeCurrency ? totalTax_HC : totalTax),
    //     );
    const totalTaxAmountInWords = numberToWordsInIndianAndUsaSystem(
      parseFloat(isHomeCurrency ? totalTax_HC : totalTax),
      data?.[0]?.currency,
    );
    return (
      <>
        <div
          className="flex border-r border-l border-b border-black"
          style={{
            height: `${hsnGridHeightPx}px`,
            overflow: "hidden",
          }}
        >
          <div
            className="border-r border-black"
            style={{
              width: "60%",
              height: "100%",
              display: "flex",
              flexDirection: "column",
            }}
          >
            <div
              className="flex flex-between w-full font-bold text-center border-b border-black"
              style={{ fontSize: "8px" }}
            >
              <p className="flex-1 p-1 border-r border-black">HSN / SAC</p>
              <p className="flex-1 p-1 border-r border-black">Taxable Value</p>
              <p className="flex-1 p-1 border-r border-black">Rate</p>
              <p className="flex-1 p-1 border-r border-black">IGST</p>
              <p className="flex-1 p-1 border-r border-black">CGST</p>
              <p className="flex-1 p-1 border-r border-black">SGST</p>
              <p className="flex-1 p-1">Tax Total</p>
            </div>

            {/* Table Body */}
            <div style={{ height: `${hsnBodyHeight}px`, overflow: "hidden" }}>
              {hsnSacRows.map((item, index) => (
                <div
                  key={`hsn-${index}`}
                  className="flex flex-between w-full text-center"
                  style={{ fontSize: "8px" }}
                >
                  <p className="flex-1 pb-1 border-r border-black">
                    {item.sac || item.hsn || ""}
                  </p>
                  <p className="flex-1 pb-1 border-r text-right border-black">
                    {formatAmountBlankIfZero(
                      isHomeCurrency
                        ? item?.taxableAmount
                        : item?.taxableAmountFc,
                    )}
                  </p>
                  <p className="flex-1 pb-1 border-r text-right border-black">
                    {formatAmountBlankIfZero(item?.taxPercentage)}
                  </p>
                  <p className="flex-1 pb-1 border-r text-right border-black">
                    {formatAmountBlankIfZero(
                      isHomeCurrency ? item?.IGST_HC : item?.IGST,
                    )}
                  </p>

                  <p className="flex-1 pb-1 border-r text-right border-black">
                    {formatAmountBlankIfZero(
                      isHomeCurrency ? item?.CGST_HC : item?.CGST,
                    )}
                  </p>

                  <p className="flex-1 pb-1 border-r text-right border-black">
                    {formatAmountBlankIfZero(
                      isHomeCurrency ? item?.SGST_HC : item?.SGST,
                    )}
                  </p>
                  <p className="flex-1 pb-1 text-right">
                    {formatAmountBlankIfZero(
                      isHomeCurrency
                        ? Number(item?.IGST_HC || 0) +
                            Number(item?.CGST_HC || 0) +
                            Number(item?.SGST_HC || 0)
                        : Number(item?.IGST || 0) +
                            Number(item?.CGST || 0) +
                            Number(item?.SGST || 0),
                    )}
                  </p>
                </div>
              ))}
              {Array.from(
                { length: Math.max(0, hsnBodyRows - hsnSacRows.length) },
                (_, i) => (
                  <div
                    key={`empty-hsn-${i}`}
                    className="flex flex-between w-full font-bold text-center"
                    style={{ fontSize: "8px" }}
                  >
                    <p className="flex-1 pb-1 border-r border-black">&nbsp;</p>
                    <p className="flex-1 pb-1 border-r border-black">&nbsp;</p>
                    <p className="flex-1 pb-1 border-r border-black">&nbsp;</p>
                    <p className="flex-1 pb-1 border-r border-black">&nbsp;</p>
                    <p className="flex-1 pb-1 border-r border-black">&nbsp;</p>
                    <p className="flex-1 pb-1 border-r border-black">&nbsp;</p>
                    <p className="flex-1 pb-1">&nbsp;</p>
                  </div>
                ),
              )}
            </div>

            <div
              className="flex flex-between w-full font-bold text-right border-t border-black"
              style={{ fontSize: "8px" }}
            >
              <p className="flex-1 p-1 border-r border-black">
                Total ( {data[0]?.currency || ""} )
              </p>
              <p className="flex-1 p-1 border-r border-black">
                {formatAmountBlankIfZero(
                  isHomeCurrency
                    ? totals?.taxableAmount
                    : totals?.taxableAmountFc,
                )}
              </p>
              <p className="flex-1 p-1 border-r border-black">{""}</p>
              <p className="flex-1 p-1 border-r border-black">
                {formatAmountBlankIfZero(
                  isHomeCurrency ? totals?.IGST_HC : totals?.IGST,
                )}
              </p>
              <p className="flex-1 p-1 border-r border-black">
                {formatAmountBlankIfZero(
                  isHomeCurrency ? totals?.CGST_HC : totals?.CGST,
                )}
              </p>
              <p className="flex-1 p-1 border-r border-black">
                {formatAmountBlankIfZero(
                  isHomeCurrency ? totals?.SGST_HC : totals?.SGST,
                )}
              </p>
              <p className="flex-1 p-1">
                {formatAmountBlankIfZero(
                  isHomeCurrency ? totalTax_HC : totalTax,
                )}
              </p>
            </div>
            {Number(data[0]?.isHomeCurrency) !== 1 && (
              <div
                className="flex flex-between w-full font-bold text-right border-t border-black"
                style={{ fontSize: "8px" }}
              >
                <p className="flex-1 p-1 border-r border-black">
                  Total ( INR )
                </p>
                <p className="flex-1 p-1 border-r border-black">
                  {formatAmountBlankIfZero(totals?.taxableAmount)}
                </p>
                <p className="flex-1 p-1 border-r border-black">{""}</p>
                <p className="flex-1 p-1 border-r border-black">
                  {formatAmountBlankIfZero(totals?.IGST_HC)}
                </p>
                <p className="flex-1 p-1 border-r border-black">
                  {formatAmountBlankIfZero(totals?.CGST_HC)}
                </p>
                <p className="flex-1 p-1 border-r border-black">
                  {formatAmountBlankIfZero(totals?.SGST_HC)}
                </p>
                <p className="flex-1 p-1">
                  {formatAmountBlankIfZero(totalTax_HC)}
                </p>
              </div>
            )}
          </div>
          <div className="p-1" style={{ width: "40%", fontSize: "7px" }}>
            <p style={{ fontSize: "8px" }}>
              In case of discrepancy in the invoice amount, please notify within
              2 days.
            </p>
            <p
              className="font-bold"
              style={{ fontSize: "8px", paddingBottom: "3px" }}
            >
              All payment to be issued in favour of{" "}
              {data[0]?.company || ""}{" "}
            </p>
            <p
              className=" font-bold"
              style={{ fontSize: "8px", paddingBottom: "2px" }}
            >
              For RTGS / NEFT Payment:
            </p>
            <div>
              <div className="flex" style={{ width: "100%" }}>
                <p
                  className="font-bold"
                  style={{ width: "30%", fontSize: "8px" }}
                >
                  BANK NAME :{" "}
                </p>
                <p
                  className="font-bold"
                  style={{ width: "70%", fontSize: "8px" }}
                >
                  {data[0]?.bankName || ""}
                </p>
              </div>
              <div className="flex" style={{ width: "100%" }}>
                <p
                  className="font-bold"
                  style={{ width: "30%", fontSize: "8px" }}
                >
                  BANK ADDRESS :{" "}
                </p>
                <p
                  className="font-bold"
                  style={{ width: "70%", fontSize: "8px" }}
                >
                  {data[0]?.bankAddress || ""}
                </p>
              </div>
              <div className="flex" style={{ width: "100%" }}>
                <p
                  className="font-bold "
                  style={{ fontSize: "8px", width: "30%" }}
                >
                  CURRENT A/C NO :{" "}
                </p>
                <p
                  className="font-bold"
                  style={{ fontSize: "8px", width: "70%" }}
                >
                  {data[0]?.bankAccountNo || ""}
                </p>
              </div>
              <div className="flex" style={{ width: "100%" }}>
                <p
                  className="font-bold"
                  style={{ fontSize: "8px", width: "30%" }}
                >
                  SWIFT CODE :{" "}
                </p>
                <p
                  className="font-bold"
                  style={{ fontSize: "8px", width: "70%" }}
                >
                  {data[0]?.bankSwiftCode || ""}
                </p>
              </div>
              <div className="flex" style={{ width: "100%" }}>
                <p
                  className="font-bold"
                  style={{ fontSize: "8px", width: "30%" }}
                >
                  IFSC CODE :{" "}
                </p>
                <p
                  className="font-bold"
                  style={{ fontSize: "8px", width: "70%" }}
                >
                  {data[0]?.bankIfscCode || ""}
                </p>
              </div>
            </div>
          </div>
        </div>
        <div
          className="flex w-full border-l border-b border-r border-black"
          style={{ fontSize: "9px", width: "100%" }}
        >
          <p
            className="p-1 uppercase"
            style={{ width: "85%", paddingRight: "15px", fontSize: "8px" }}
          >
            <span className="font-bold ">Tax Amount in Words </span>
            {data?.[0]?.currency || ""} {totalTaxAmountInWords || ""}
          </p>
        </div>
        {Number(data[0]?.isHomeCurrency) !== 1 && (
          <div
            className="flex w-full border-l border-b border-r border-black"
            style={{ fontSize: "9px", width: "100%" }}
          >
            <p
              className="p-1 uppercase"
              style={{ width: "85%", paddingRight: "15px", fontSize: "8px" }}
            >
              <span className="font-bold ">Tax Amount in Words </span>
              {"INR"} {totalHCInWords || ""}
            </p>
          </div>
        )}
      </>
    );
  };

  const TgkTaxInvoiceBanksDetails = ({ index }) => {
    return (
      <>
        <div
          className="flex border-r border-l border-b border-black w-full"
          style={{
            height: "120px",
            overflow: "hidden",
          }}
        >
          <div className="flex w-full p-1" style={{ fontSize: "8px" }}>
            <div style={{ width: "70%" }}>
              <div style={{ width: "100%" }}>
                <div className="flex">
                  <p
                    className="font-bold line-height-2"
                    style={{ width: "20%" }}
                  >
                    BANK NAME :
                  </p>
                  <p
                    className="font-bold line-height-2"
                    style={{ width: "80%" }}
                  >
                    {data?.[0]?.bankName || ""}
                  </p>
                </div>

                <div className="flex">
                  <p
                    className="font-bold line-height-2"
                    style={{ width: "20%" }}
                  >
                    BANK ADDRESS :
                  </p>
                  <p
                    className="font-bold line-height-2"
                    style={{ width: "80%" }}
                  >
                    {data?.[0]?.bankAddress || ""}
                  </p>
                </div>

                <div className="flex">
                  <p
                    className="font-bold line-height-2"
                    style={{ width: "20%" }}
                  >
                    CURRENT A/C NO :
                  </p>
                  <p
                    className="font-bold line-height-2"
                    style={{ width: "80%" }}
                  >
                    {data?.[0]?.bankAccountNo || ""}
                  </p>
                </div>

                <div className="flex">
                  <p
                    className="font-bold line-height-2"
                    style={{ width: "20%" }}
                  >
                    SWIFT CODE :
                  </p>
                  <p
                    className="font-bold line-height-2"
                    style={{ width: "80%" }}
                  >
                    {data?.[0]?.bankSwiftCode || ""}
                  </p>
                </div>

                <div className="flex">
                  <p
                    className="font-bold line-height-2"
                    style={{ width: "20%" }}
                  >
                    IFSC CODE :
                  </p>
                  <p
                    className="font-bold line-height-2"
                    style={{ width: "80%" }}
                  >
                    {data?.[0]?.bankIfscCode || ""}
                  </p>
                </div>
              </div>
            </div>

            <div style={{ width: "30%" }}>
              <p
                className="font-bold text-right pr-4"
                style={{ height: "56%" }}
              >
                For {data[0]?.company}
              </p>
              <p className="font-bold text-right pr-4">Authorized Signatory</p>
            </div>
          </div>
        </div>

        <div className="p-1 border-r border-l border-b border-black flex w-full">
          <div className="font-bold" style={{ width: "90%", fontSize: "8px" }}>
            This is a computer generated invoice no stamp and signature is
            required.
          </div>
          <div style={{ width: "10%", fontSize: "8px" }}>
            Page {index + 1} of{" "}
            {Math.ceil(data[0]?.tblInvoiceCharge?.length / itemsPerPage || 1)}
          </div>
        </div>
      </>
    );
  };

  const taxInvoiceWships = (index) => (
    <div>
      <div className="mx-auto !text-black">
        <CompanyImgModule data={data} />
        <TaxInvoiceHeader data={data} />
        <TaxInvoiceBillingDetails data={data} />
        {index === 0 && <TaxInvoiceJobDetails data={data} />}
        <TaxInvoiceRemarks data={data} />
        <TaxInvoiceChargeDetailsWships
          data={data}
          //charge={charge}
          charge={texInvoiceCharge}
          index={index}
          hsnSac={hsnSac}
        />
        {index === 0 && (
          <TaxInvoiceTermsAndConditionWships
            data={data}
            index={index}
            termsAndConditions={termsAndConditions}
          />
        )}
      </div>
    </div>
  );

  const TaxInvoiceChargeDetailsWships = ({ data, charge, index, hsnSac }) => {
    // ✅ helper: continuation rows (created by your splitter) should NOT show numbers/extra cols
    const isCont = (row) => row?.__isContinuation === true;

    // ✅ helper: show 0.00 only when it's a real row (not continuation)
    const showVal = (row, v, fallback = "") =>
      isCont(row) ? "" : (v ?? fallback);

    // Total (your existing logic)
    let totalAmount = 0;
    (charge || []).forEach((group) => {
      (group || []).forEach((item) => {
        if (!isNaN(item?.totalAmount) && item?.totalAmount !== null) {
          totalAmount += Number(item.totalAmount);
        }
      });
    });

    const gridTotal = (data?.[0]?.tblInvoiceCharge || []).reduce(
      (acc, curr) => {
        const qty = Number(curr?.qty || 0);
        const rate = Number(curr?.rate || 0);
        const exchangeRate = Number(curr?.exchangeRate || 1);
        const IGST = Number(curr?.IGST || 0);
        const CGST = Number(curr?.CGST || 0);
        const SGST = Number(curr?.SGST || 0);

        const rowTotal = qty * rate * exchangeRate + IGST + CGST + SGST;
        return acc + rowTotal;
      },
      0,
    );

    const totalAmountInWords = numberToWords(parseFloat(gridTotal || 0), "INR");

    const currentPageLength = charge?.[index]?.length || 0;
    const nextPageLength = charge?.[index + 1]?.length || 0;
    const lastPageIndex = (charge?.length || 1) - 1;

    const totalPages = charge?.length || 0;

    const isLastPage =
      index === lastPageIndex ||
      (index === lastPageIndex - 1 && nextPageLength < 4);

    const isSinglePage = (charge?.length || 0) === 1;

    const chargeGridHeight = isSinglePage ? "200px" : "200px";

    const showHsnGrid =
      isLastPage || (currentPageLength > 4 && currentPageLength < 10);

    return (
      <>
        {currentPageLength > 0 && (
          <div
            className="flex w-full border-black border-r border-l border-b text-center font-bold"
            style={{ fontSize: "9px", width: "100%" }}
          >
            <p className="border-r border-black" style={{ width: "30%" }}>
              DESCRIPTION
            </p>
            <p className="border-r border-black" style={{ width: "13%" }}>
              HSN / SAC Code
            </p>
            <p className="border-r border-black" style={{ width: "10%" }}>
              Size Type
            </p>
            <p className="border-r border-black" style={{ width: "4%" }}>
              Qty
            </p>
            <p className="border-r border-black" style={{ width: "6%" }}>
              Rate
            </p>
            <p className="border-r border-black" style={{ width: "4%" }}>
              Curr
            </p>
            <p className="border-r border-black" style={{ width: "7%" }}>
              Ex. Rate
            </p>
            <p className="border-r border-black" style={{ width: "7%" }}>
              Taxable Amount
            </p>
            <p className="border-r border-black" style={{ width: "7%" }}>
              Tax Rate
            </p>
            <p className="border-r border-black" style={{ width: "5%" }}>
              IGST
            </p>
            <p className="border-r border-black" style={{ width: "5%" }}>
              CGST
            </p>
            <p className="border-r border-black" style={{ width: "5%" }}>
              SGST
            </p>
            <p className="text-center" style={{ width: "7%" }}>
              Amount in {data?.[0]?.currency || ""}
            </p>
          </div>
        )}
        {currentPageLength > 0 && (
          <div
            className="border-black border-r border-l border-b"
            style={{ height: chargeGridHeight, overflow: "hidden" }}
          >
            {charge?.[index]?.map((chargeData, idx, array) => {
              const cont = isCont(chargeData);

              const qty = cont ? 0 : Number(chargeData?.qty || 0);
              const rate = cont ? 0 : Number(chargeData?.rate || 0);
              const exr = cont ? 1 : Number(chargeData?.exchangeRate || 1);
              const igst = cont ? 0 : Number(chargeData?.IGST || 0);
              const cgst = cont ? 0 : Number(chargeData?.CGST || 0);
              const sgst = cont ? 0 : Number(chargeData?.SGST || 0);

              const amount = cont
                ? ""
                : (qty * rate * exr + igst + cgst + sgst).toFixed(2);

              return (
                <div
                  key={idx}
                  className={`flex w-full ${idx === array.length - 1 ? "border-b" : ""}`}
                  style={{ fontSize: "9px", width: "100%" }}
                >
                  <p
                    className="pb-1 border-r border-black ps-1"
                    style={{ width: "30%" }}
                  >
                    {chargeData?.description || chargeData?.chargeGl || ""}
                  </p>

                  <p
                    className="pb-1 border-r border-black text-center ps-1"
                    style={{ width: "13%" }}
                  >
                    {showVal(chargeData, chargeData?.hsn, "")}{" "}
                    {showVal(chargeData, chargeData?.sac, "")}
                  </p>

                  <p
                    className="pb-1 border-r border-black text-center ps-1"
                    style={{ width: "10%" }}
                  >
                    {showVal(chargeData, chargeData?.size, "")}{" "}
                    {showVal(chargeData, chargeData?.typeCode, "")}
                  </p>

                  <p
                    className="pb-1 border-r border-black text-center ps-1"
                    style={{ width: "4%" }}
                  >
                    {showVal(chargeData, chargeData?.qty, "")}
                  </p>

                  <p
                    className="pb-1 border-r border-black text-center ps-1"
                    style={{ width: "6%" }}
                  >
                    {showVal(chargeData, chargeData?.rate, "")}
                  </p>

                  <p
                    className="pb-1 border-r border-black text-center ps-1"
                    style={{ width: "4%" }}
                  >
                    {showVal(chargeData, chargeData?.chargeCurrency, "")}
                  </p>

                  <p
                    className="pb-1 border-r border-black text-center ps-1"
                    style={{ width: "7%" }}
                  >
                    {showVal(chargeData, chargeData?.exchangeRate, "")}
                  </p>

                  <p
                    className="pb-1 border-r border-black text-center ps-1"
                    style={{ width: "7%" }}
                  >
                    {showVal(chargeData, chargeData?.totalAmountHc, "")}
                  </p>

                  <p
                    className="pb-1 border-r border-black text-center ps-1"
                    style={{ width: "7%" }}
                  >
                    {showVal(chargeData, chargeData?.taxAmount, "")}
                  </p>

                  {/* ✅ IMPORTANT: remove "|| 0.00" fallback, and hide on continuation */}
                  <p
                    className="pb-1 border-r border-black text-center ps-1"
                    style={{ width: "5%" }}
                  >
                    {cont ? "" : (chargeData?.IGST ?? "")}
                  </p>
                  <p
                    className="pb-1 border-r border-black text-center"
                    style={{ width: "5%" }}
                  >
                    {cont ? "" : (chargeData?.CGST ?? "")}
                  </p>
                  <p
                    className="pb-1 border-r border-black text-center"
                    style={{ width: "5%" }}
                  >
                    {cont ? "" : (chargeData?.SGST ?? "")}
                  </p>

                  <p className="pb-1 text-center" style={{ width: "7%" }}>
                    {amount}
                  </p>
                </div>
              );
            })}

            {/* Final row - Amount in Words */}
            <div
              className="flex w-full border-t border-b border-black"
              style={{ fontSize: "9px", width: "100%" }}
            >
              <p
                className="p-1 uppercase"
                style={{ width: "85%", paddingRight: "15px" }}
              >
                <span className="font-bold">Amount in Words </span>
                {data?.[0]?.currency || ""} {totalAmountInWords || ""} Only
              </p>
              <p className="p-1" style={{ width: "8%" }}>
                Total {data?.[0]?.currency || ""}
              </p>
              <p className="p-1" style={{ width: "7%" }}>
                {Number(gridTotal || 0).toFixed(2)}
              </p>
            </div>
          </div>
        )}
        {showHsnGrid && index === totalPages - 1 && (
          <div>
            <TaxInvoiceHsnSummaryGrid hsnSac={hsnSac} data={data} />
          </div>
        )}
      </>
    );
  };

  const TaxInvoiceTermsAndConditionWships = ({
    data,
    index,
    termsAndConditions,
  }) => {
    const companyName = data[0]?.company || "";
    const isSinglePage = texInvoiceCharge.length === 1;
    const chargeGridHeight = isSinglePage ? "140px" : "280px";
    // Helper to turn a newline or array into a sequence of lines
    const renderTerms = (tc) => {
      if (Array.isArray(tc)) {
        return tc.map((line, i) => (
          <React.Fragment key={i}>
            {line}
            <br />
          </React.Fragment>
        ));
      }
      if (typeof tc === "string") {
        return tc.split(/\r?\n/).map((line, i) => (
          <React.Fragment key={i}>
            {line.trim()}
            <br />
          </React.Fragment>
        ));
      }
      return null;
    };

    return (
      <>
        <div
          className="flex border-r border-l border-b border-black p-1"
          style={{ fontSize: "9px", height: chargeGridHeight }}
        >
          <div style={{ width: "60%" }}>
            <p className="font-bold">Terms And Condition :</p>
            <p style={{ lineHeight: 1.4 }}>
              {termsAndConditions ? (
                renderTerms(termsAndConditions)
              ) : (
                <p>
                  a) All payments should be in favour of {companyName}
                  <br />
                  b) If any discrepancy is noticed in the invoice, kindly inform
                  us in writing within 7 days else the same will be considered
                  as correct.
                  <br />
                  c) If payment is delayed beyond agreed credit terms, it will
                  attract interest @18% per annum.
                  <br />
                  d) Please check your GST Details. If the same needs
                  modification kindly notify us within 3 working days.
                  <br />
                  e) Kindly settle the tax component of the invoice within 7
                  days.
                  <br />
                  f) Jurisdiction: Dispute if any shall be subject to the
                  jurisdiction of Mumbai (India) Courts only.
                  <br />
                </p>
              )}
            </p>
          </div>
          <div style={{ width: "40%" }}>
            <p className="font-bold text-right pr-4" style={{ height: "56%" }}>
              For {companyName}
            </p>
            <p className="font-bold text-right pr-4">Authorized Signatory</p>
          </div>
        </div>
        <div className="p-2 border-r border-l border-b border-black flex">
          <div className="font-bold" style={{ width: "90%", fontSize: "9px" }}>
            This is a computer generated invoice no stamp and signature is
            required.
          </div>
          <div style={{ width: "10%", fontSize: "9px" }}>
            Page {index + 1} of{" "}
            {Math.ceil(data[0]?.tblInvoiceCharge?.length / itemsPerPage || 1)}
          </div>
        </div>
      </>
    );
  };

  const taxInvoice = (index) => (
    <div
      style={{
        height: "290mm",
        position: "relative",
        boxSizing: "border-box",
        overflow: "hidden",
        color: "black",
        paddingBottom: "18mm", // space for footer
      }}
    >
      <CompanyImgModule data={data} />
      <TaxInvoiceHeader data={data} />
      <TaxInvoiceBillingDetails data={data} />
      {index === 0 && <TaxInvoiceJobDetails data={data} />}
      <TaxInvoiceRemarks data={data} />
      {/* <TaxInvoiceChargeDetailsForTaxInvoiceReport
        data={data}
        charge={invoiceChargeDataForTaxInvoice}
        index={index}
        hsnSac={hsnSac}
      /> */}
      {/* same grid for Tax invoice and tax invoice FF grid */}
      <TaxInvoiceChargeDetailsForTaxInvoiceReportFF
        data={data}
        charge={invoiceChargeDataForTaxInvoice}
        index={index}
        hsnSac={hsnSac}
      />
      {index === 0 && (
        <TaxInvoiceTermsAndConditionForTaxInvoiceReport
          data={data}
          index={index}
          termsAndConditions={data[0]?.termsConditionMst}
        />
      )}
      {/* Footer fixed at bottom of A4 */}
      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
        }}
      >
        <FooterModule />
      </div>
    </div>
  );
  // this is for Freaight Forwarding invoice for KJS SRL
  const taxInvoiceFF = (index) => (
    <div
      style={{
        height: "290mm",
        position: "relative",
        boxSizing: "border-box",
        overflow: "hidden",
        color: "black",
        paddingBottom: "18mm", // space for footer
      }}
    >
      <CompanyImgModule data={data} />
      <TaxInvoiceHeader data={data} />
      <TaxInvoiceBillingDetails data={data} />
      {index === 0 && <TaxInvoiceJobDetailsFF data={data} />}
      <TaxInvoiceRemarks data={data} />
      <TaxInvoiceChargeDetailsForTaxInvoiceReportFF
        data={data}
        charge={invoiceChargeDataForTaxInvoice}
        index={index}
        hsnSac={hsnSac}
      />
      {index === 0 && (
        <TaxInvoiceTermsAndConditionForTaxInvoiceReport
          data={data}
          index={index}
          termsAndConditions={data[0]?.termsConditionMst}
        />
      )}
      {/* Footer fixed at bottom of A4 */}
      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
        }}
      >
        <FooterModule />
      </div>
    </div>
  );

  const ImportTaxInvoice = (index) => (
    // Keep One thing in mind Do not changes any thing directly in the account
    <div
      style={{
        height: "290mm",
        position: "relative",
        boxSizing: "border-box",
        overflow: "hidden",
        color: "black",
        paddingBottom: "18mm", // space for footer
      }}
    >
      <CompanyImgModule data={data} />
      <TaxInvoiceHeader data={data} />
      {/* from this Import Menu we have changed the three Components below this */}
      <ImportTaxInvoiceBillingDetails data={data} />
      {index === 0 && <ImportTaxInvoiceJobDetails data={data} />}
      <ImportTaxInvoiceRemarks data={data} />
      {/* from this Import Menu we have changed the three Components above this */}
      <TaxInvoiceChargeDetails
        data={data}
        charge={texInvoiceCharge}
        index={index}
        hsnSac={hsnSac}
      />
      {index === 0 && (
        <TaxInvoiceTermsAndCondition
          data={data}
          index={index}
          termsAndConditions={data[0]?.termsConditionMst}
        />
      )}
      {/* Footer fixed at bottom of A4 */}
      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
        }}
      >
        <FooterModule />
      </div>
    </div>
  );

  const tgkInvoice = (index) => (
    <div
      style={{
        height: "290mm",
        position: "relative",
        boxSizing: "border-box",
        overflow: "hidden",
        color: "black",
        paddingBottom: "18mm", // space for footer
      }}
    >
      <TgkCompanyImgModule data={data} />
      <TgkTaxInvoiceHeader data={data} />
      <TgkTaxInvoiceBillingDetails data={data} />
      {index === 0 && <TgkTaxInvoiceJobDetails data={data} />}
      <TgkTaxInvoiceRemarks data={data} />
      <TgkTaxInvoiceChargeDetails
        data={data}
        charge={texInvoiceCharge}
        index={index}
        hsnSac={hsnSac}
      />
      {index === 0 && (
        <>
          <TgkTaxInvoiceTermsAndCondition
            data={data}
            index={index}
            termsAndConditions={data[0]?.termsConditionMst}
          />
          <TgkTaxInvoiceBanksDetails index={index} />
        </>
      )}
      {/* Footer fixed at bottom of A4 */}
      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
        }}
      >
        <TgkFooterModule />
      </div>
    </div>
  );

  const taxInvoiceWithoutCharges = (index) => (
    <div>
      <div className="mx-auto !text-black">
        <CompanyImgModule data={data} />
        <TaxInvoiceHeader data={data} />
        <TaxInvoiceBillingDetails data={data} />
        <TaxInvoiceJobDetails data={data} />
        <TaxInvoiceSpacing />
        <TaxInvoiceTermsAndCondition
          data={data}
          index={0}
          // termsAndConditions={termsAndConditions}
          termsAndConditions={data[0]?.termsConditionMst}
        />
      </div>
    </div>
  );

  // const purchaseInvoiceWithoutCharges = (index) => (
  //   <div>
  //     <div className="mx-auto !text-black">
  //       <CompanyImgModule data={data} />
  //       <PurchaseInvoiceHeader data={data} />
  //       <TaxInvoiceBillingDetails data={data} />
  //       <TaxInvoiceJobDetails data={data} />
  //       <TaxInvoiceSpacing />
  //       <TaxInvoiceTermsAndCondition
  //         data={data}
  //         index={0}
  //         // termsAndConditions={termsAndConditions}
  //         termsAndConditions={data[0]?.termsConditionMst}
  //       />
  //     </div>
  //   </div>
  // );

  const ImportTaxInvoiceWithoutCharges = (index) => (
    <div>
      <div className="mx-auto !text-black">
        <CompanyImgModule data={data} />
        <TaxInvoiceHeader data={data} />
        {/* <TaxInvoiceBillingDetails data={data} />
        <TaxInvoiceJobDetails data={data} /> */}
        <ImportTaxInvoiceBillingDetails data={data} />
        <ImportTaxInvoiceJobDetails data={data} />
        <TaxInvoiceSpacing />
        <TaxInvoiceTermsAndCondition
          data={data}
          index={0}
          // termsAndConditions={termsAndConditions}
          termsAndConditions={data[0]?.termsConditionMst}
        />
      </div>
    </div>
  );

  const tgkTaxInvoiceWithoutCharges = (index) => (
    <div>
      <div className="mx-auto !text-black">
        <TgkCompanyImgModule data={data} />
        <TgkTaxInvoiceHeader data={data} />
        <TgkTaxInvoiceBillingDetails data={data} />
        <TgkTaxInvoiceJobDetails data={data} />
        <TgkTaxInvoiceSpacing />
        <TgkTaxInvoiceTermsAndCondition
          data={data}
          index={0}
          // termsAndConditions={termsAndConditions}
          termsAndConditions={data[0]?.termsConditionMst}
        />
      </div>
    </div>
  );

  const ProformaInvoice = (index) => (
    <div>
      <div className="mx-auto !text-black">
        <CompanyImgModule data={data} />
        <ProformaInvoiceHeader data={data} />
        <TaxInvoiceBillingDetails data={data} />
        {index === 0 && <TaxInvoiceJobDetails data={data} />}
        <TaxInvoiceRemarks data={data} />
        <TaxInvoiceChargeDetails
          data={data}
          charge={charge}
          index={index}
          hsnSac={hsnSac}
        />
        {index === 0 && (
          <TaxInvoiceTermsAndCondition
            data={data}
            index={index}
            termsAndConditions={termsAndConditions}
          />
        )}
      </div>
    </div>
  );
  const ProformaInvoiceWithoutCharges = (index) => (
    <div>
      <div className="mx-auto !text-black">
        <CompanyImgModule data={data} />
        <ProformaInvoiceHeader data={data} />
        <TaxInvoiceBillingDetails data={data} />
        <TaxInvoiceJobDetails data={data} />
        <TaxInvoiceSpacing />
        <TaxInvoiceTermsAndCondition
          data={data}
          index={0}
          termsAndConditions={termsAndConditions}
        />
      </div>
    </div>
  );

  const invoicePrint = (index) => (
    <div>
      <div className="mx-auto !text-black">
        <CompanyImgModuleInvoicePrint data={data} />
        <InvoicePrintHeader data={data} />
        <InvoicePrintBillingDetails data={data} />
        {index === 0 && <InvoicePrintJobDetails data={data} />}
        <InvoicePrintRemarks data={data} />
        <InvoicePrintDeteChargeDetails
          data={data}
          charge={charge}
          chargeAtt={chargeAtt}
          index={index}
          hsnSac={hsnSac}
        />
        {index === 0 && (
          <InvoicePrintTermsAndCondition
            data={data}
            index={index}
            termsAndConditions={termsAndConditions}
          />
        )}
      </div>
    </div>
  );

  const creditNotePrint = (index) => (
    <div>
      <div className="mx-auto !text-black">
        <CompanyImgModuleInvoicePrint data={data} />
        <div className="border-l border-r border-b border-black pt-1 pb-1">
          <div className="flex flex-grow w-full justify-center items-center">
            <h1 className="text-black font-bold text-sm">Credit Note</h1>
          </div>
        </div>
        <InvoicePrintBillingDetailsCreditNote data={data} />
        {index === 0 && <InvoicePrintJobDetails data={data} />}
        <InvoicePrintRemarks data={data} />
        <InvoicePrintDeteChargeDetails
          data={data}
          charge={charge}
          chargeAtt={chargeAtt}
          index={index}
          hsnSac={hsnSac}
        />
        {index === 0 && (
          <InvoicePrintTermsAndCondition
            data={data}
            index={index}
            termsAndConditions={termsAndConditions}
          />
        )}
      </div>
    </div>
  );
  const invoicePrintWithoutCharges = (index) => (
    <div>
      <div className="mx-auto !text-black">
        <CompanyImgModuleInvoicePrint data={data} />
        <InvoicePrintHeader data={data} />
        <InvoicePrintBillingDetailsCreditNote data={data} />
        <InvoicePrintJobDetails data={data} />
        <TaxInvoiceSpacing />
        <InvoicePrintTermsAndCondition
          data={data}
          index={0}
          termsAndConditions={termsAndConditions}
        />
      </div>
    </div>
  );

  const sundryInvoicePrint = (index) => (
    <div>
      <div className="mx-auto !text-black">
        <CompanyImgModuleInvoicePrint data={data} />
        <SundryInvoicePrintHeader data={data} />
        <SundryInvoicePrintBillingDetails data={data} />
        <InvoicePrintChargeDetails
          data={data}
          charge={charge}
          index={index}
          hsnSac={hsnSac}
        />
        {index === 0 && (
          <InvoicePrintTermsAndCondition
            data={data}
            index={index}
            termsAndConditions={termsAndConditions}
          />
        )}
      </div>
    </div>
  );
  const sundryInvoicePrintWithoutCharges = (index) => (
    <div>
      <div className="mx-auto !text-black">
        <CompanyImgModuleInvoicePrint data={data} />
        <SundryInvoicePrintHeader data={data} />
        <SundryInvoicePrintBillingDetails data={data} />
        <TaxInvoiceSpacing />
        <InvoicePrintTermsAndCondition
          data={data}
          index={0}
          termsAndConditions={termsAndConditions}
        />
      </div>
    </div>
  );

  const shouldRenderSecondPage = useEffect(() => {
    const loadHtml2pdf = async () => {
      const module = await import("html2pdf.js");
      setHtml2pdf(() => module.default);
    };

    loadHtml2pdf();
  }, []);

  const SubLeaseInvoice = (index) => (
    <div>
      <div className="mx-auto !text-black">
        <CompanyImgModuleInvoicePrint data={data} />
        <SubLeaseInvoicePrintHeader data={data} />
        <SubLeaseInvoicePrintBillingDetails data={data} />
        <InvoicePrintSubLeaseChargeDetails
          data={data}
          charge={charge}
          index={index}
          hsnSac={hsnSac}
        />
        {index === 0 && (
          <InvoicePrintTermsAndCondition
            data={data}
            index={index}
            termsAndConditions={termsAndConditions}
          />
        )}
      </div>
    </div>
  );
  const SubLeaseInvoiceWithoutCharges = (index) => (
    <div>
      <div className="mx-auto !text-black">
        <CompanyImgModuleInvoicePrint data={data} />
        <SubLeaseInvoicePrintHeader data={data} />
        <SubLeaseInvoicePrintBillingDetails data={data} />
        <TaxInvoiceSpacing />
        <InvoicePrintTermsAndCondition
          data={data}
          index={0}
          termsAndConditions={termsAndConditions}
        />
      </div>
    </div>
  );

  const SalesInvoiceContainerWise = (index) => (
    <div>
      <div className="mx-auto !text-black">
        <CompanyImgModuleInvoicePrint data={data} />
        <SubLeaseInvoicePrintHeader data={data} />
        <SalesInvoiceContainerWiseBillingDetails data={data} />
        <InvoicePrintChargeDetails
          data={data}
          charge={charge}
          index={index}
          hsnSac={hsnSac}
        />
        {index === 0 && (
          <InvoicePrintTermsAndCondition
            data={data}
            index={index}
            termsAndConditions={termsAndConditions}
          />
        )}
      </div>
    </div>
  );
  const SalesInvoiceContainerWiseWithoutCharges = (index) => (
    <div>
      <div className="mx-auto !text-black">
        <CompanyImgModuleInvoicePrint data={data} />
        <SubLeaseInvoicePrintHeader data={data} />
        <SalesInvoiceContainerWiseBillingDetails data={data} />
        <TaxInvoiceSpacing />
        <InvoicePrintTermsAndCondition
          data={data}
          index={0}
          termsAndConditions={termsAndConditions}
        />
      </div>
    </div>
  );

  const BlAttachmentPrint = ({ data, chargeAtt, index }) => {
    // compute once (before render or above your return)
    const lastAvailableIndex = Array.isArray(chargeAtt)
      ? chargeAtt.reduce(
          (last, inner, idx) =>
            Array.isArray(inner) && inner.length > 0 ? idx : last,
          -1, // → -1 if none are non-empty
        )
      : -1;

    console.log("lastAvailableIndex", lastAvailableIndex);

    const currentChargeAtt = chargeAtt[index] || [];

    const totalAmountHc = (chargeAtt ?? [])
      .flat() // use .flat(Infinity) if deeper nesting
      .reduce((sum, r) => sum + (Number(r?.amountHc) || 0), 0);

    const totalDays = (chargeAtt ?? [])
      .flat() // use .flat(Infinity) if deeper nesting
      .reduce((sum, r) => sum + (Number(r?.noOfDays) || 0), 0);

    console.log("totalAmountHc", totalAmountHc);

    // Calculate totals
    // const totalDays = currentChargeAtt.reduce(
    //   (sum, item) => sum + (Number(item.noOfDays) || 0),
    //   0,
    // );

    const totalAmount = currentChargeAtt.reduce(
      (sum, item) => sum + (Number(item.amountHc) || 0),
      0,
    );

    const raw = Number(data?.[0]?.totalInvoiceAmount ?? 0);
    const gridTotal = raw; //Math.round(raw); // 5498 (number)
    const gridTotalDisplay = gridTotal.toFixed(2); // "5498.00" (string)

    return (
      <>
        <div
          style={{ color: "black", backgroundColor: "rgb(255, 255, 255)" }}
          className="p-10"
        >
          <div className="flex flex-grow w-full justify-center items-center pb-5">
            <h1 style={{ color: "black" }} className="font-bold text-sm">
              Attachment For Invoice
            </h1>
          </div>
          <div className="flex flex-grow w-full justify-left items-left pb-5">
            <p
              style={{ fontSize: "11px", color: "black" }}
              className="font-bold"
            >
              Invoive No.:- {data[0]?.invoiceNo || ""}
            </p>
          </div>
          <div
            className="flex w-full border-black border-t border-r border-l border-b text-center font-bold"
            style={{ fontSize: "10px", width: "100%" }}
          >
            <p
              className="p-1 border-r border-black"
              style={{ width: "5%", color: "black" }}
            >
              Sr No.
            </p>
            <p
              className="p-1 border-r border-black"
              style={{ width: "20%", color: "black" }}
            >
              Container No.
            </p>
            <p
              className="p-1 border-r border-black"
              style={{ width: "9%", color: "black" }}
            >
              From Date
            </p>
            <p
              className="p-1 border-r border-black"
              style={{ width: "9%", color: "black" }}
            >
              To Date
            </p>
            <p
              className="p-1 border-r border-black"
              style={{ width: "8%", color: "black" }}
            >
              NO Of Days
            </p>
            <p
              className="p-1 border-r border-black"
              style={{ width: "10%", color: "black" }}
            >
              Size/Type
            </p>
            <p
              className="p-1 border-r border-black"
              style={{ width: "8%", color: "black" }}
            >
              Rate
            </p>
            <p
              className="p-1 border-r border-black"
              style={{ width: "8%", color: "black" }}
            >
              Currency
            </p>
            <p
              className="p-1 border-r border-black"
              style={{ width: "8%", color: "black" }}
            >
              Ex. Rate
            </p>
            <p className="p-1 border-black" style={{ width: "15%" }}>
              Amount
            </p>
          </div>
          {/* <div
            className="w-full border-black border-r border-l border-b"
            style={{ overflow: "hidden" }}
          >
            {chargeAtt[index]?.map((chargeAttData, idx, array) => (
              <div
                key={idx}
                className={`flex w-full ${idx === array.length - 1 ? "border-b" : ""
                  }`}
                style={{ fontSize: "9px", width: "100%",color: "black" }}
              >
                <p
                  className="pb-1 border-r border-black text-center ps-1"
                  style={{ width: "5%",color: "black" }}
                >
                  {chargeAttData?.invoiceChargeDetailsSrNo || ""}
                </p>
                <p
                  className="pb-1 border-r border-black text-center ps-1"
                  style={{ width: "20%",color: "black" }}
                >
                  {chargeAttData?.containerNo || ""}
                </p>
                <p
                  className="pb-1 border-r border-black text-center ps-1"
                  style={{ width: "9%",color: "black" }}
                >
                  {chargeAttData?.fromDate || ""}
                </p>
                <p
                  className="pb-1 border-r border-black text-center ps-1"
                  style={{ width: "9%",color: "black" }}
                >
                  {chargeAttData?.toDate || ""}
                </p>
                <p
                  className="pb-1 border-r border-black text-center ps-1"
                  style={{ width: "8%",color: "black" }}
                >
                  {chargeAttData?.noOfDays || ""}
                </p>
                <p
                  className="pb-1 border-r border-black text-center ps-1"
                  style={{ width: "10%",color: "black" }}
                >
                  {chargeAttData?.size || ""} / {chargeAttData?.typeCode || ""}
                </p>
                <p
                  className="pb-1 border-r border-black text-center ps-1"
                  style={{ width: "8%",color: "black" }}
                >
                  {chargeAttData?.rate || ""}
                </p>
                <p
                  className="pb-1 border-r border-black text-center ps-1"
                  style={{ width: "8%",color: "black" }}
                >
                  {chargeAttData?.currency || ""}
                </p>
                <p
                  className="pb-1 border-r border-black text-center ps-1"
                  style={{ width: "8%",color: "black" }}
                >
                  {chargeAttData?.exchangeRate || ""}
                </p>
                <p
                  className="pb-1 border-black text-center ps-1"
                  style={{ width: "15%",color: "black" }}
                >
                  {chargeAttData?.amountHc || ""}
                </p>
              </div>
            ))}
          </div> */}
          <div
            className="w-full border-black border-r border-l border-b"
            style={{ overflow: "hidden" }}
          >
            {currentChargeAtt.map((chargeAttData, idx, array) => (
              <div
                key={idx}
                className={`flex w-full ${
                  idx === array.length - 1 ? "border-b" : ""
                }`}
                style={{ fontSize: "9px", width: "100%", color: "black" }}
              >
                <p
                  className="pb-1 border-r border-black text-center ps-1"
                  style={{ width: "5%" }}
                >
                  {chargeAttData?.invoiceChargeDetailsSrNo || ""}
                </p>
                <p
                  className="pb-1 border-r border-black text-center ps-1"
                  style={{ width: "20%" }}
                >
                  {chargeAttData?.containerNo || ""}
                </p>
                <p
                  className="pb-1 border-r border-black text-center ps-1"
                  style={{ width: "9%" }}
                >
                  {chargeAttData?.fromDate || ""}
                </p>
                <p
                  className="pb-1 border-r border-black text-center ps-1"
                  style={{ width: "9%" }}
                >
                  {chargeAttData?.toDate || ""}
                </p>
                <p
                  className="pb-1 border-r border-black text-center ps-1"
                  style={{ width: "8%" }}
                >
                  {chargeAttData?.noOfDays || ""}
                </p>
                <p
                  className="pb-1 border-r border-black text-center ps-1"
                  style={{ width: "10%" }}
                >
                  {chargeAttData?.size || ""} / {chargeAttData?.typeCode || ""}
                </p>
                <p
                  className="pb-1 border-r border-black text-center ps-1"
                  style={{ width: "8%" }}
                >
                  {chargeAttData?.rate || ""}
                </p>
                <p
                  className="pb-1 border-r border-black text-center ps-1"
                  style={{ width: "8%" }}
                >
                  {chargeAttData?.currency || ""}
                </p>
                <p
                  className="pb-1 border-r border-black text-center ps-1"
                  style={{ width: "8%" }}
                >
                  {chargeAttData?.exchangeRate || ""}
                </p>
                <p
                  className="pb-1 border-black text-center ps-1"
                  style={{ width: "15%" }}
                >
                  {chargeAttData?.amountHc || ""}
                </p>
              </div>
            ))}

            {/* Total Row */}
            {index === lastAvailableIndex && (
              <div
                className="flex w-full border-t border-black font-bold"
                style={{ fontSize: "9px", color: "black" }}
              >
                <p
                  className="pb-1 border-r border-black text-center ps-1"
                  style={{ width: "5%" }}
                ></p>
                <p
                  className="pb-1 border-r border-black text-center ps-1"
                  style={{ width: "20%" }}
                >
                  Total
                </p>
                <p
                  className="pb-1 border-r border-black text-center ps-1"
                  style={{ width: "9%" }}
                ></p>
                <p
                  className="pb-1 border-r border-black text-center ps-1"
                  style={{ width: "9%" }}
                ></p>
                <p
                  className="pb-1 border-r border-black text-center ps-1"
                  style={{ width: "8%" }}
                >
                  {totalDays}
                  {/* {gridTotalDisplay} */}
                </p>
                <p
                  className="pb-1 border-r border-black text-center ps-1"
                  style={{ width: "10%" }}
                ></p>
                <p
                  className="pb-1 border-r border-black text-center ps-1"
                  style={{ width: "8%" }}
                ></p>
                <p
                  className="pb-1 border-r border-black text-center ps-1"
                  style={{ width: "8%" }}
                ></p>
                <p
                  className="pb-1 border-r border-black text-center ps-1"
                  style={{ width: "8%" }}
                ></p>
                <p
                  className="pb-1 border-black text-center ps-1"
                  style={{ width: "15%" }}
                >
                  {totalAmountHc.toFixed(2)}
                  {/* {gridTotalDisplay} */}
                </p>
              </div>
            )}
          </div>
        </div>
      </>
    );
  };

  const BankDetails = ({ data }) => {
    return (
      <div>
        <table
          style={{
            color: "black",
            fontSize: "9px",
            width: "100%",
            textAlign: "center",
            borderLeft: "1px solid black",
            borderRight: "1px solid black",
          }}
        >
          <tr className="bg-gray-300">
            <th className="border-r border-black" style={{ width: "12%" }}>
              Cheque No
            </th>
            <th className="border-r border-black" style={{ width: "28%" }}>
              Bank
            </th>
            <th className="border-r border-black" style={{ width: "28%" }}>
              Drawer A/c
            </th>
            <th className="border-r border-black" style={{ width: "10%" }}>
              Cheque Date
            </th>
            <th className="border-r border-black" style={{ width: "10%" }}>
              Currency
            </th>
            <th style={{ width: "12%" }}>Cheque Amount</th>
          </tr>

          <tr className="border-t border-black">
            <th className="border-r border-black" style={{ width: "12%" }}>
              00001
            </th>
            <th className="border-r border-black" style={{ width: "28%" }}>
              Stanbic Bank
            </th>
            <th className="border-r border-black" style={{ width: "28%" }}>
              ABCD Logistics Ltd
            </th>
            <th className="border-r border-black" style={{ width: "10%" }}>
              xx/xx/xx
            </th>
            <th className="border-r border-black" style={{ width: "10%" }}>
              USD
            </th>
            <th style={{ width: "12%" }}>xxxxx.xx</th>
          </tr>
        </table>
        {/* <table
          style={{
            width: "100%",
            fontSize: "9px",
            color: "black",
            borderLeft: "1px solid black",
            borderRight: "1px solid black",
            borderBottom: "1px solid black",
          }}
        >
          <tr>
            <td style={{ width: "10%", paddingLeft: "4px" }}>
              Exchange Rate :
            </td>
            <td style={{ width: "90%" }}>135</td>
          </tr>
        </table> */}
      </div>
    );
  };

  const ChargeGrid = ({ data = [], fullData = [] }) => {
    console.log("fullData", fullData);
    // Accept either an array or an object with tblInvoiceCharge
    const rows = (
      Array.isArray(data) ? data : data?.tblInvoiceCharge || []
    ).slice(0, 20);
    const calculateTotal = Array.isArray(data)
      ? data
      : data?.tblInvoiceCharge || [];

    // simple number formatter; leave blank if null/undefined
    const fmt = (v, opts = { maximumFractionDigits: 2 }) =>
      v === null || v === undefined || v === ""
        ? ""
        : Number(v).toLocaleString(undefined, opts);

    // const totals = calculateTotal.reduce(
    //   (acc, row) => {
    //     acc.amount += Number(row.amount) || 0;
    //     acc.rate += Number(row.rate) || 0;
    //     acc.taxAmount += Number(row.taxAmount) || 0;
    //     return acc;
    //   },
    //   { amount: 0, rate: 0, taxAmount: 0 }
    // );

    // // Format with 2 decimals
    // const formattedTotals = {
    //   amount: totals.amount.toFixed(2),
    //   rate: totals.rate.toFixed(2),
    //   taxAmount: totals.taxAmount.toFixed(2),
    // };

    const toNum = (v) => {
      if (typeof v === "number") return v;
      const n = parseFloat(
        String(v ?? "")
          .replace(/,/g, "")
          .trim(),
      );
      return Number.isFinite(n) ? n : 0;
    };

    const totals = (calculateTotal ?? []).reduce(
      (acc, row) => {
        const taxHC = toNum(row?.tblInvoiceChargeTax?.[0]?.taxAmountHc);
        const taxFC = toNum(row?.tblInvoiceChargeTax?.[0]?.taxAmountFc);
        const taxHCvatAmount = toNum(
          row?.tblInvoiceChargeTax?.[0]?.taxAmountFc,
        );

        acc.totalAmountFc += toNum(row?.totalAmountFc) + taxFC; // add FC tax
        acc.totalAmount += toNum(row?.totalAmount) + taxHC; // add HC tax
        acc.vatAmount += taxHCvatAmount; // keep VAT HC separately

        return acc;
      },
      { totalAmountFc: 0, totalAmount: 0, vatAmount: 0 },
    );

    // (optional) formatted strings:
    const totalsFormatted = {
      totalAmountFc: totals.totalAmountFc.toFixed(2),
      totalAmount: totals.totalAmount.toFixed(2),
      vatAmount: totals.vatAmount.toFixed(2),
    };
    console.log("data[0]?.detentionValidTill", fullData[0]?.detentionValidTill);
    return (
      <div
        style={{
          color: "black",
          minHeight: "540px",
          maxheight: "540px",
          hight: "540px",
        }}
        className="w-full border-b border-l border-r border-black border-b"
      >
        <table className="w-full border-b border-black  text-[9px]">
          <thead>
            <tr className="bg-gray-300">
              <th
                rowSpan={2}
                className="border-b border-black text-center pl-1 pr-1 pt-0.5 pb-0.5"
                style={{ color: "black", fontSize: "9px" }}
              >
                SNo
              </th>
              <th
                rowSpan={2}
                className="border-b border-l border-r border-black text-center pl-1 pr-1 pt-0.5 pb-0.5"
                style={{ color: "black", fontSize: "9px" }}
              >
                Description
              </th>
              <th
                rowSpan={2}
                className="border-b border-l border-r border-black text-center pl-1 pr-1 pt-0.5 pb-0.5"
                style={{ color: "black", fontSize: "9px" }}
              >
                Unit
              </th>
              <th
                rowSpan={2}
                className="border-b border-l border-r border-black text-center pl-1 pr-1 pt-0.5 pb-0.5"
                style={{ color: "black", fontSize: "9px" }}
              >
                Unit Rate
                <br />
                (USD)
              </th>
              <th
                rowSpan={2}
                className="border-b border-l border-r border-black text-center pl-1 pr-1 pt-0.5 pb-0.5"
                style={{ color: "black", fontSize: "9px" }}
              >
                ROE
              </th>
              <th
                rowSpan={2}
                className="border-b border-l border-r border-black text-center pl-1 pr-1 pt-0.5 pb-0.5"
                style={{ color: "black", fontSize: "9px" }}
              >
                No. Of
                <br /> Units
              </th>
              {/* <th
                rowSpan={2}
                className="border-b border-l border-r border-black text-center pl-1 pr-1 pt-0.5 pb-0.5"
                style={{ color: "black", fontSize: "9px" }}
              >
                Net Amount
              </th> */}
              <th
                rowSpan={2}
                className="border-b border-l border-r border-black text-center pl-1 pr-1 pt-0.5 pb-0.5"
                style={{ color: "black", fontSize: "9px" }}
              >
                VAT%
              </th>
              <th
                rowSpan={2}
                className="border-b border-l border-r border-black text-center pl-1 pr-1 pt-0.5 pb-0.5"
                style={{ color: "black", fontSize: "9px" }}
              >
                VAT Amount
                <br />
                (USD)
              </th>
              <th
                colSpan={2}
                className="border-b border-l  border-black text-center pl-1 pr-1 pt-0.5 pb-0.5"
                style={{ color: "black", fontSize: "9px" }}
              >
                Payable Amount
              </th>
            </tr>
            <tr className="bg-gray-300">
              <th
                className="border-b border-l  border-black text-center pl-1 pr-1 pt-0.5 pb-0.5"
                style={{ color: "black", fontSize: "9px" }}
              >
                in USD
              </th>
              <th
                className="border-b border-l  border-black text-center pl-1 pr-1 pt-0.5 pb-0.5"
                style={{ color: "black", fontSize: "9px" }}
              >
                in KES
              </th>
            </tr>
          </thead>

          <tbody
            style={{
              color: "black",
              fontSize: "9px",
            }}
          >
            {rows.length > 0 ? (
              rows.map((r, i) => (
                <tr key={i} className="align-top">
                  <td
                    className="border-r border-t border-b border-black pl-1 pr-1 pt-0.5 pb-0.5"
                    style={{ color: "black", fontSize: "9px" }}
                  >
                    {i + 1}
                  </td>
                  <td
                    className="border border-black pl-1 pr-1 pt-0.5 pb-0.5 text-left"
                    style={{ color: "black", fontSize: "9px" }}
                  >
                    {r?.description || ""}
                  </td>
                  <td
                    className="border border-black pl-1 pr-1 pt-0.5 pb-0.5 text-center"
                    style={{ color: "black", fontSize: "9px" }}
                  >
                    {r?.unit || ""}
                  </td>
                  <td
                    className="border border-black px-1 py-0.5 text-center"
                    style={{ color: "black", fontSize: "9px" }}
                  >
                    {Number(r?.rate ?? 0).toFixed(2)}
                  </td>

                  <td
                    className="border border-black pl-1 pr-1 pt-0.5 pb-0.5 text-center"
                    style={{ color: "black", fontSize: "9px" }}
                  >
                    {fmt(r?.exchangeRate)}
                  </td>
                  <td
                    className="border border-black pl-1 pr-1 pt-0.5 pb-0.5 text-center"
                    style={{ color: "black", fontSize: "9px" }}
                  >
                    {fmt(r?.qty)}
                  </td>
                  {/* <td
                    className="border border-black pl-1 pr-1 pt-0.5 pb-0.5 text-right"
                    style={{ color: "black", fontSize: "9px" }}
                  >
                    {Number(r?.totalAmount || 0).toFixed(2)}
                  </td> */}
                  <td
                    className="border border-black pl-1 pr-1 pt-0.5 pb-0.5 text-center"
                    style={{ color: "black", fontSize: "9px" }}
                  >
                    {r?.tblInvoiceChargeTax[0]?.taxPercentage || "0"}
                    {" %"}
                  </td>
                  <td
                    className="border border-black pl-1 pr-1 pt-0.5 pb-0.5 text-center"
                    style={{ color: "black", fontSize: "9px" }}
                  >
                    {Number(
                      r?.tblInvoiceChargeTax[0]?.taxAmountFc || 0,
                    ).toFixed(2)}
                  </td>
                  <td
                    className="border border-black pl-1 pr-1 pt-0.5 pb-0.5 text-right"
                    style={{ color: "black", fontSize: "9px" }}
                  >
                    {(
                      toNum(r?.totalAmountFc) +
                      toNum(r?.tblInvoiceChargeTax?.[0]?.taxAmountFc)
                    ).toFixed(2)}
                  </td>
                  <td
                    className="border-l border-t border-b border-black pl-1 pr-1 pt-0.5 pb-0.5 text-right"
                    style={{ color: "black", fontSize: "9px" }}
                  >
                    {/* {Number(r?.totalAmount || 0).toFixed(2)} */}
                    {(
                      toNum(r?.totalAmount) +
                      toNum(r?.tblInvoiceChargeTax?.[0]?.taxAmountHc)
                    ).toFixed(2)}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  className="border border-black pl-1 pr-1 pt-0.5 pb-0.5 text-center"
                  style={{
                    color: "black",
                    fontSize: "9px",
                  }}
                  colSpan={10}
                ></td>
              </tr>
            )}
            <tr>
              {/* Left merged note area */}
              <td
                colSpan={7}
                className="border-r border-t border-b border-black pl-1 pr-1 pt-0.5 pb-0.5 text-left"
              >
                <span
                  className="font-semibold"
                  style={{ color: "black", fontSize: "9px" }}
                >
                  Total Amount:
                </span>{" "}
              </td>

              <td
                className="border border-black pl-1 pr-1 pt-0.5 pb-0.5 text-center font-bold"
                style={{ color: "black", fontSize: "9px" }}
              >
                {totalsFormatted?.vatAmount}
              </td>
              <td
                className="border border-black pl-1 pr-1 pt-0.5 pb-0.5 text-right font-bold"
                style={{ color: "black", fontSize: "9px" }}
              >
                {totalsFormatted?.totalAmountFc}
              </td>
              <td
                className="border-l border-t border-b border-black pl-1 pr-1 pt-0.5 pb-0.5 text-right font-bold"
                style={{ color: "black", fontSize: "9px" }}
              >
                {totalsFormatted?.totalAmount}
              </td>
            </tr>
            <tr>
              <td
                colSpan={9}
                className="border-t border-b border-black pl-1 pr-1 pt-0.5 pb-0.5 text-left"
              >
                <span
                  className="font-semibold"
                  style={{ color: "black", fontSize: "9px" }}
                >
                  Detention Valid Till :
                </span>{" "}
                {fullData[0]?.detentionValidTill || ""}
              </td>
            </tr>
          </tbody>
          {/* Totals row */}
        </table>
      </div>
    );
  };

  const ChargeGridYms = ({ data = [], fullData = [] }) => {
    console.log("fullData", fullData);
    // Accept either an array or an object with tblInvoiceCharge
    const rows = (
      Array.isArray(data) ? data : data?.tblInvoiceCharge || []
    ).slice(0, 20);
    const calculateTotal = Array.isArray(data)
      ? data
      : data?.tblInvoiceCharge || [];

    // simple number formatter; leave blank if null/undefined
    const fmt = (v, opts = { maximumFractionDigits: 2 }) =>
      v === null || v === undefined || v === ""
        ? ""
        : Number(v).toLocaleString(undefined, opts);

    // const totals = calculateTotal.reduce(
    //   (acc, row) => {
    //     acc.amount += Number(row.amount) || 0;
    //     acc.rate += Number(row.rate) || 0;
    //     acc.taxAmount += Number(row.taxAmount) || 0;
    //     return acc;
    //   },
    //   { amount: 0, rate: 0, taxAmount: 0 }
    // );

    // // Format with 2 decimals
    // const formattedTotals = {
    //   amount: totals.amount.toFixed(2),
    //   rate: totals.rate.toFixed(2),
    //   taxAmount: totals.taxAmount.toFixed(2),
    // };

    const toNum = (v) => {
      if (typeof v === "number") return v;
      const n = parseFloat(
        String(v ?? "")
          .replace(/,/g, "")
          .trim(),
      );
      return Number.isFinite(n) ? n : 0;
    };

    const totals = (calculateTotal ?? []).reduce(
      (acc, row) => {
        const taxHC = toNum(row?.tblInvoiceChargeTax?.[0]?.taxAmountHc);
        const taxFC = toNum(row?.tblInvoiceChargeTax?.[0]?.taxAmountFc);
        const taxHCvatAmount = toNum(
          row?.tblInvoiceChargeTax?.[0]?.taxAmountFc,
        );

        acc.totalAmountFc += toNum(row?.totalAmountFc) + taxFC; // add FC tax
        acc.totalAmount += toNum(row?.totalAmount) + taxHC; // add HC tax
        acc.vatAmount += taxHCvatAmount; // keep VAT HC separately

        return acc;
      },
      { totalAmountFc: 0, totalAmount: 0, vatAmount: 0 },
    );

    // (optional) formatted strings:
    const totalsFormatted = {
      totalAmountFc: totals.totalAmountFc.toFixed(2),
      totalAmount: totals.totalAmount.toFixed(2),
      vatAmount: totals.vatAmount.toFixed(2),
    };
    console.log("data[0]?.detentionValidTill", fullData[0]?.detentionValidTill);
    return (
      <div
        style={{
          color: "black",
          minHeight: "520px",
          maxheight: "520px",
          hight: "520px",
        }}
        className="w-full border-b border-l border-r border-black border-b"
      >
        <table className="w-full border-b border-black  text-[9px]">
          <thead>
            <tr className="bg-gray-300">
              <th
                rowSpan={2}
                className="border-b border-black text-center pl-1 pr-1 pt-0.5 pb-0.5"
                style={{ color: "black", fontSize: "9px" }}
              >
                SNo
              </th>
              <th
                rowSpan={2}
                className="border-b border-l border-r border-black text-center pl-1 pr-1 pt-0.5 pb-0.5"
                style={{ color: "black", fontSize: "9px" }}
              >
                Description
              </th>
              <th
                rowSpan={2}
                className="border-b border-l border-r border-black text-center pl-1 pr-1 pt-0.5 pb-0.5"
                style={{ color: "black", fontSize: "9px" }}
              >
                Unit
              </th>
              <th
                rowSpan={2}
                className="border-b border-l border-r border-black text-center pl-1 pr-1 pt-0.5 pb-0.5"
                style={{ color: "black", fontSize: "9px" }}
              >
                Unit Rate
                <br />
                (USD)
              </th>
              <th
                rowSpan={2}
                className="border-b border-l border-r border-black text-center pl-1 pr-1 pt-0.5 pb-0.5"
                style={{ color: "black", fontSize: "9px" }}
              >
                ROE
              </th>
              <th
                rowSpan={2}
                className="border-b border-l border-r border-black text-center pl-1 pr-1 pt-0.5 pb-0.5"
                style={{ color: "black", fontSize: "9px" }}
              >
                No. Of
                <br /> Units
              </th>
              {/* <th
                rowSpan={2}
                className="border-b border-l border-r border-black text-center pl-1 pr-1 pt-0.5 pb-0.5"
                style={{ color: "black", fontSize: "9px" }}
              >
                Net Amount
              </th> */}
              <th
                rowSpan={2}
                className="border-b border-l border-r border-black text-center pl-1 pr-1 pt-0.5 pb-0.5"
                style={{ color: "black", fontSize: "9px" }}
              >
                VAT%
              </th>
              <th
                rowSpan={2}
                className="border-b border-l border-r border-black text-center pl-1 pr-1 pt-0.5 pb-0.5"
                style={{ color: "black", fontSize: "9px" }}
              >
                VAT Amount
                <br />
                (USD)
              </th>
              <th
                colSpan={2}
                className="border-b border-l  border-black text-center pl-1 pr-1 pt-0.5 pb-0.5"
                style={{ color: "black", fontSize: "9px" }}
              >
                Payable Amount
              </th>
            </tr>
            <tr className="bg-gray-300">
              <th
                className="border-b border-l  border-black text-center pl-1 pr-1 pt-0.5 pb-0.5"
                style={{ color: "black", fontSize: "9px" }}
              >
                in USD
              </th>
              <th
                className="border-b border-l  border-black text-center pl-1 pr-1 pt-0.5 pb-0.5"
                style={{ color: "black", fontSize: "9px" }}
              >
                in AED
              </th>
            </tr>
          </thead>

          <tbody
            style={{
              color: "black",
              fontSize: "9px",
            }}
          >
            {rows.length > 0 ? (
              rows.map((r, i) => (
                <tr key={i} className="align-top">
                  <td
                    className="border-r border-t border-b border-black pl-1 pr-1 pt-0.5 pb-0.5"
                    style={{ color: "black", fontSize: "9px" }}
                  >
                    {i + 1}
                  </td>
                  <td
                    className="border border-black pl-1 pr-1 pt-0.5 pb-0.5 text-left"
                    style={{ color: "black", fontSize: "9px" }}
                  >
                    {r?.description || ""}
                  </td>
                  <td
                    className="border border-black pl-1 pr-1 pt-0.5 pb-0.5 text-center"
                    style={{ color: "black", fontSize: "9px" }}
                  >
                    {r?.unit || ""}
                  </td>
                  <td
                    className="border border-black px-1 py-0.5 text-center"
                    style={{ color: "black", fontSize: "9px" }}
                  >
                    {Number(r?.rate ?? 0).toFixed(2)}
                  </td>

                  <td
                    className="border border-black pl-1 pr-1 pt-0.5 pb-0.5 text-center"
                    style={{ color: "black", fontSize: "9px" }}
                  >
                    {fmt(r?.exchangeRate)}
                  </td>
                  <td
                    className="border border-black pl-1 pr-1 pt-0.5 pb-0.5 text-center"
                    style={{ color: "black", fontSize: "9px" }}
                  >
                    {fmt(r?.qty)}
                  </td>
                  {/* <td
                    className="border border-black pl-1 pr-1 pt-0.5 pb-0.5 text-right"
                    style={{ color: "black", fontSize: "9px" }}
                  >
                    {Number(r?.totalAmount || 0).toFixed(2)}
                  </td> */}
                  <td
                    className="border border-black pl-1 pr-1 pt-0.5 pb-0.5 text-center"
                    style={{ color: "black", fontSize: "9px" }}
                  >
                    {r?.tblInvoiceChargeTax[0]?.taxPercentage || "0"}
                    {" %"}
                  </td>
                  <td
                    className="border border-black pl-1 pr-1 pt-0.5 pb-0.5 text-center"
                    style={{ color: "black", fontSize: "9px" }}
                  >
                    {Number(
                      r?.tblInvoiceChargeTax[0]?.taxAmountFc || 0,
                    ).toFixed(2)}
                  </td>
                  <td
                    className="border border-black pl-1 pr-1 pt-0.5 pb-0.5 text-right"
                    style={{ color: "black", fontSize: "9px" }}
                  >
                    {(
                      toNum(r?.totalAmountFc) +
                      toNum(r?.tblInvoiceChargeTax?.[0]?.taxAmountFc)
                    ).toFixed(2)}
                  </td>
                  <td
                    className="border-l border-t border-b border-black pl-1 pr-1 pt-0.5 pb-0.5 text-right"
                    style={{ color: "black", fontSize: "9px" }}
                  >
                    {/* {Number(r?.totalAmount || 0).toFixed(2)} */}
                    {(
                      toNum(r?.totalAmount) +
                      toNum(r?.tblInvoiceChargeTax?.[0]?.taxAmountHc)
                    ).toFixed(2)}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  className="border border-black pl-1 pr-1 pt-0.5 pb-0.5 text-center"
                  style={{
                    color: "black",
                    fontSize: "9px",
                  }}
                  colSpan={10}
                ></td>
              </tr>
            )}
            <tr>
              {/* Left merged note area */}
              <td
                colSpan={7}
                className="border-r border-t border-b border-black pl-1 pr-1 pt-0.5 pb-0.5 text-left"
              >
                <span
                  className="font-semibold"
                  style={{ color: "black", fontSize: "9px" }}
                >
                  Total Amount:
                </span>{" "}
              </td>

              <td
                className="border border-black pl-1 pr-1 pt-0.5 pb-0.5 text-center font-bold"
                style={{ color: "black", fontSize: "9px" }}
              >
                {totalsFormatted?.vatAmount}
              </td>
              <td
                className="border border-black pl-1 pr-1 pt-0.5 pb-0.5 text-right font-bold"
                style={{ color: "black", fontSize: "9px" }}
              >
                {totalsFormatted?.totalAmountFc}
              </td>
              <td
                className="border-l border-t border-b border-black pl-1 pr-1 pt-0.5 pb-0.5 text-right font-bold"
                style={{ color: "black", fontSize: "9px" }}
              >
                {totalsFormatted?.totalAmount}
              </td>
            </tr>
            <tr>
              <td
                colSpan={9}
                className="border-t border-b border-black pl-1 pr-1 pt-0.5 pb-0.5 text-left"
              >
                <span
                  className="font-semibold"
                  style={{ color: "black", fontSize: "9px" }}
                >
                  Detention Valid Till :
                </span>{" "}
                {fullData[0]?.detentionValidTill || ""}
              </td>
            </tr>
          </tbody>
          {/* Totals row */}
        </table>
      </div>
    );
  };

  const SalesChargeGridYms = ({ data = [], fullData = [] }) => {
    // Accept either an array or an object with tblInvoiceCharge
    const allRows = Array.isArray(data) ? data : data?.tblInvoiceCharge || [];
    const rows = allRows.slice(0, 20);

    const toNum = (v) => {
      if (typeof v === "number") return v;
      const n = parseFloat(
        String(v ?? "")
          .replace(/,/g, "")
          .trim(),
      );
      return Number.isFinite(n) ? n : 0;
    };

    // simple number formatter; leave blank if null/undefined
    const fmt = (
      v,
      opts = { minimumFractionDigits: 3, maximumFractionDigits: 3 },
    ) =>
      v === null || v === undefined || v === ""
        ? ""
        : Number(v).toLocaleString(undefined, opts);

    // -------- Amount in words (English) --------
    const toWords = (amount, currencyLabel) => {
      const n = Number(amount || 0);

      const ones = [
        "",
        "One",
        "Two",
        "Three",
        "Four",
        "Five",
        "Six",
        "Seven",
        "Eight",
        "Nine",
        "Ten",
        "Eleven",
        "Twelve",
        "Thirteen",
        "Fourteen",
        "Fifteen",
        "Sixteen",
        "Seventeen",
        "Eighteen",
        "Nineteen",
      ];
      const tens = [
        "",
        "",
        "Twenty",
        "Thirty",
        "Forty",
        "Fifty",
        "Sixty",
        "Seventy",
        "Eighty",
        "Ninety",
      ];

      const twoDigits = (num) => {
        if (num < 20) return ones[num];
        const t = Math.floor(num / 10);
        const o = num % 10;
        return `${tens[t]}${o ? " " + ones[o] : ""}`.trim();
      };

      const threeDigits = (num) => {
        const h = Math.floor(num / 100);
        const r = num % 100;
        const head = h ? `${ones[h]} Hundred` : "";
        const tail = r ? twoDigits(r) : "";
        return `${head}${head && tail ? " " : ""}${tail}`.trim();
      };

      const chunkToWords = (num) => {
        if (num === 0) return "Zero";
        const parts = [];
        const billions = Math.floor(num / 1_000_000_000);
        const millions = Math.floor((num % 1_000_000_000) / 1_000_000);
        const thousands = Math.floor((num % 1_000_000) / 1000);
        const rest = num % 1000;

        if (billions) parts.push(`${threeDigits(billions)} Billion`);
        if (millions) parts.push(`${threeDigits(millions)} Million`);
        if (thousands) parts.push(`${threeDigits(thousands)} Thousand`);
        if (rest) parts.push(threeDigits(rest));

        return parts.join(" ").trim();
      };

      const whole = Math.floor(n);
      const decimals = Math.round((n - whole) * 100); // 2 decimals

      const wholeWords = chunkToWords(whole);
      const decimalWords = decimals ? twoDigits(decimals) : "";

      return `${wholeWords} ${currencyLabel}${
        decimals ? ` and ${decimalWords} Cents` : ""
      } Only`;
    };

    // ✅ Totals for the summary box (Excl VAT + VAT + Total) for AED (HC) and USD (FC)
    const sums = allRows.reduce(
      (acc, r) => {
        const netAed = toNum(r?.totalAmount); // HC net (excl VAT)
        const netUsd = toNum(r?.totalAmountFc); // FC net (excl VAT)
        const vatAed = toNum(r?.tblInvoiceChargeTax?.[0]?.taxAmountHc);
        const vatUsd = toNum(r?.tblInvoiceChargeTax?.[0]?.taxAmountFc);

        acc.exclAed += netAed;
        acc.vatAed += vatAed;
        acc.totalAed += netAed + vatAed;

        acc.exclUsd += netUsd;
        acc.vatUsd += vatUsd;
        acc.totalUsd += netUsd + vatUsd;

        return acc;
      },
      {
        exclAed: 0,
        vatAed: 0,
        totalAed: 0,
        exclUsd: 0,
        vatUsd: 0,
        totalUsd: 0,
      },
    );

    const box = {
      exclAed: sums.exclAed.toFixed(3),
      vatAed: sums.vatAed.toFixed(3),
      totalAed: sums.totalAed.toFixed(3),
      exclUsd: sums.exclUsd.toFixed(3),
      vatUsd: sums.vatUsd.toFixed(3),
      totalUsd: sums.totalUsd.toFixed(3),
    };

    const usdInWords = toWords(sums.totalUsd, "USD Dollar");
    const aedInWords = toWords(sums.totalAed, "AED");

    return (
      <div
        style={{
          color: "black",
          minHeight: "520px",
          maxheight: "520px",
          hight: "520px",
        }}
        className="w-full  border-l border-r border-black "
      >
        <table className="w-full border-b border-black text-[9px]">
          <thead>
            <tr className="bg-gray-300">
              <th
                className="border-b border-black text-center pl-1 pr-1 pt-0.5 pb-0.5"
                style={{ color: "black", fontSize: "9px" }}
              >
                SNo.
              </th>

              <th
                className="border-b border-l border-r border-black text-center pl-1 pr-1 pt-0.5 pb-0.5"
                style={{ color: "black", fontSize: "9px" }}
              >
                Description
              </th>

              <th
                className="border-b border-l border-r border-black text-center pl-1 pr-1 pt-0.5 pb-0.5"
                style={{ color: "black", fontSize: "9px" }}
              >
                Qty
              </th>

              <th
                className="border-b border-l border-r border-black text-center pl-1 pr-1 pt-0.5 pb-0.5"
                style={{ color: "black", fontSize: "9px" }}
              >
                Curr.
              </th>

              <th
                className="border-b border-l border-r border-black text-center pl-1 pr-1 pt-0.5 pb-0.5"
                style={{ color: "black", fontSize: "9px" }}
              >
                Ex.Rate
              </th>

              <th
                className="border-b border-l border-r border-black text-center pl-1 pr-1 pt-0.5 pb-0.5"
                style={{ color: "black", fontSize: "9px" }}
              >
                Amount/Unit
              </th>

              <th
                className="border-b border-l border-r border-black text-center pl-1 pr-1 pt-0.5 pb-0.5"
                style={{ color: "black", fontSize: "9px" }}
              >
                Curr.Amt
              </th>

              <th
                className="border-b border-l border-r border-black text-center pl-1 pr-1 pt-0.5 pb-0.5"
                style={{ color: "black", fontSize: "9px" }}
              >
                Taxable
                <br />
                Amt(USD)
              </th>

              <th
                className="border-b border-l border-r border-black text-center pl-1 pr-1 pt-0.5 pb-0.5"
                style={{ color: "black", fontSize: "9px" }}
              >
                Tax %
              </th>

              <th
                className="border-b border-l border-r border-black text-center pl-1 pr-1 pt-0.5 pb-0.5"
                style={{ color: "black", fontSize: "9px" }}
              >
                Tax
              </th>

              <th
                className="border-b border-l border-black text-center pl-1 pr-1 pt-0.5 pb-0.5"
                style={{ color: "black", fontSize: "9px" }}
              >
                Amt in USD
              </th>
            </tr>
          </thead>

          <tbody style={{ color: "black", fontSize: "9px" }}>
            {rows.length > 0 ? (
              rows.map((r, i) => {
                const qty = toNum(r?.qty);
                const curr = r?.currency || r?.curr || r?.currencyCode || "USD";
                const exRate = toNum(r?.exchangeRate);

                // Amount/Unit: your image shows 1500, 40 etc -> usually rate
                const amtPerUnit = toNum(r?.rate);

                // Curr.Amt: usually FC amount excluding tax (if you have totalAmountFc)
                const currAmt = toNum(r?.totalAmountFc);

                // Taxable Amt(USD): commonly the same as Curr.Amt (USD taxable base)
                // If you have a separate field, put it first:
                const taxableUsd = toNum(r?.taxableAmountUsd) || currAmt;

                const taxPct = r?.tblInvoiceChargeTax?.[0]?.taxPercentage ?? 0;
                const taxUsd = toNum(r?.tblInvoiceChargeTax?.[0]?.taxAmountFc);

                const amtInUsd = taxableUsd + taxUsd;

                return (
                  <tr key={i} className="align-top">
                    <td className="border-r border-t border-b border-black pl-1 pr-1 pt-0.5 pb-0.5 text-center">
                      {i + 1}
                    </td>

                    <td className="border border-black pl-1 pr-1 pt-0.5 pb-0.5 text-left">
                      {r?.description || ""}
                    </td>

                    <td className="border border-black pl-1 pr-1 pt-0.5 pb-0.5 text-right">
                      {qty ? qty.toFixed(3) : ""}
                    </td>

                    <td className="border border-black pl-1 pr-1 pt-0.5 pb-0.5 text-center">
                      {curr}
                    </td>

                    <td className="border border-black pl-1 pr-1 pt-0.5 pb-0.5 text-right">
                      {exRate ? exRate.toFixed(3) : ""}
                    </td>

                    <td className="border border-black pl-1 pr-1 pt-0.5 pb-0.5 text-right">
                      {amtPerUnit ? amtPerUnit.toFixed(3) : ""}
                    </td>

                    <td className="border border-black pl-1 pr-1 pt-0.5 pb-0.5 text-right">
                      {currAmt ? currAmt.toFixed(3) : ""}
                    </td>

                    <td className="border border-black pl-1 pr-1 pt-0.5 pb-0.5 text-right">
                      {taxableUsd ? taxableUsd.toFixed(3) : ""}
                    </td>

                    <td className="border border-black pl-1 pr-1 pt-0.5 pb-0.5 text-center">
                      {taxPct} %
                    </td>

                    <td className="border border-black pl-1 pr-1 pt-0.5 pb-0.5 text-right">
                      {taxUsd ? taxUsd.toFixed(3) : "0.000"}
                    </td>

                    <td className="border-l border-t border-b border-black pl-1 pr-1 pt-0.5 pb-0.5 text-right">
                      {amtInUsd.toFixed(3)}
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td
                  className="border border-black pl-1 pr-1 pt-0.5 pb-0.5 text-center"
                  colSpan={11}
                ></td>
              </tr>
            )}

            {/* ✅ thick line before summary box */}
            {/* <tr>
              <td colSpan={11} className="border-t border-black p-0" style={{ height: "0px" }} />
            </tr> */}

            {/* ✅ Summary box like your image */}
            <tr>
              <td colSpan={11} className="border-t border-black p-0">
                <div className="w-full flex justify-end py-1 pr-1">
                  <table
                    style={{
                      width: "62%",
                      borderCollapse: "collapse",
                      fontSize: "9px",
                    }}
                  >
                    <tbody>
                      <tr>
                        <td className="border border-black px-2 py-1 font-semibold">
                          Total Excl. VAT AED
                        </td>
                        <td className="border border-black px-2 py-1 text-right font-semibold">
                          {box.exclAed}
                        </td>
                        <td className="border border-black px-2 py-1 font-semibold">
                          Total Excl. VAT USD
                        </td>
                        <td className="border border-black px-2 py-1 text-right font-semibold">
                          {box.exclUsd}
                        </td>
                      </tr>

                      <tr>
                        <td className="border border-black px-2 py-1 font-semibold">
                          VAT Amount in AED
                        </td>
                        <td className="border border-black px-2 py-1 text-right font-semibold">
                          {box.vatAed}
                        </td>
                        <td className="border border-black px-2 py-1 font-semibold">
                          VAT Amount in USD
                        </td>
                        <td className="border border-black px-2 py-1 text-right font-semibold">
                          {box.vatUsd}
                        </td>
                      </tr>

                      <tr>
                        <td className="border border-black px-2 py-1 font-semibold">
                          Total Amount in AED
                        </td>
                        <td className="border border-black px-2 py-1 text-right font-semibold">
                          {box.totalAed}
                        </td>
                        <td className="border border-black px-2 py-1 font-semibold">
                          Total Amount in USD
                        </td>
                        <td className="border border-black px-2 py-1 text-right font-semibold">
                          {box.totalUsd}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </td>
            </tr>

            {/* ✅ Replace "Detention Valid Till" with Amount in Words */}
            <tr>
              <td
                colSpan={11}
                className="border-t border-black pl-1 pr-1 pt-1 pb-1 text-left"
                style={{ fontSize: "9px" }}
              >
                <span className="font-semibold">Amount in Words (USD):</span>{" "}
                {usdInWords}
                <br />
                <span className="font-semibold">
                  Amount in Words (AED):
                </span>{" "}
                {aedInWords}
              </td>
            </tr>
            <tr>
              <td
                colSpan={11}
                className="border-t border-black pl-1 pr-1 pt-1 pb-1 text-left align-top"
                style={{ fontSize: "9px", maxWidth: "100%" }}
              >
                <span className="font-semibold">Container:</span>
                <br />

                <span
                  className="font-semibold"
                  style={{
                    display: "block",
                    maxWidth: "100%",
                    whiteSpace: "normal",
                    overflowWrap: "anywhere",
                    wordBreak: "break-word",
                  }}
                >
                  {fullData[0]?.containerNos || ""}
                </span>

                <span
                  className="font-semibold"
                  style={{
                    display: "block",
                    maxWidth: "100%",
                    whiteSpace: "normal",
                    overflowWrap: "anywhere",
                    wordBreak: "break-word",
                  }}
                >
                  {fullData[0]?.sizeTypeContainer || ""}
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    );
  };

  const ChargeWithoutVat = ({ data = [], fullData = [] }) => {
    console.log("fullData", fullData);
    // Accept either an array or an object with tblInvoiceCharge
    const rows = (
      Array.isArray(data) ? data : data?.tblInvoiceCharge || []
    ).slice(0, 20);
    const calculateTotal = Array.isArray(data)
      ? data
      : data?.tblInvoiceCharge || [];

    // simple number formatter; leave blank if null/undefined
    const fmt = (v, opts = { maximumFractionDigits: 2 }) =>
      v === null || v === undefined || v === ""
        ? ""
        : Number(v).toLocaleString(undefined, opts);

    const toNum = (v) => {
      if (typeof v === "number") return v;
      const n = parseFloat(
        String(v ?? "")
          .replace(/,/g, "")
          .trim(),
      );
      return Number.isFinite(n) ? n : 0;
    };

    const totals = (calculateTotal ?? []).reduce(
      (acc, row) => {
        const taxHC = toNum(row?.tblInvoiceChargeTax?.[0]?.taxAmountHc);
        const taxFC = toNum(row?.tblInvoiceChargeTax?.[0]?.taxAmountFc);
        const taxHCvatAmount = toNum(
          row?.tblInvoiceChargeTax?.[0]?.taxAmountFc,
        );

        acc.totalAmountFc += toNum(row?.totalAmountFc) + taxFC; // add FC tax
        acc.totalAmount += toNum(row?.totalAmount) + taxHC; // add HC tax
        acc.vatAmount += taxHCvatAmount; // keep VAT HC separately

        return acc;
      },
      { totalAmountFc: 0, totalAmount: 0, vatAmount: 0 },
    );

    // (optional) formatted strings:
    const totalsFormatted = {
      totalAmountFc: totals.totalAmountFc.toFixed(2),
      totalAmount: totals.totalAmount.toFixed(2),
      vatAmount: totals.vatAmount.toFixed(2),
    };
    console.log("data[0]?.detentionValidTill", fullData[0]?.detentionValidTill);
    return (
      <div
        style={{
          color: "black",
          paddingTop: "10px",
        }}
        className="w-full"
      >
        <table className="w-full border-b border-t border-black  text-[9px]">
          <thead>
            <tr className="bg-gray-300">
              <th
                rowSpan={2}
                className="border-b border-black text-center border-r pl-1 pr-1 pt-0.5 pb-0.5"
                style={{ color: "black", fontSize: "9px" }}
              >
                SNo
              </th>
              <th
                rowSpan={2}
                className="border-b border-r border-black text-center pl-1 pr-1 pt-0.5 pb-0.5"
                style={{ color: "black", fontSize: "9px" }}
              >
                Description
              </th>
              <th
                rowSpan={2}
                className="border-b border-l border-r border-black text-center pl-1 pr-1 pt-0.5 pb-0.5"
                style={{ color: "black", fontSize: "9px" }}
              >
                Unit
              </th>
              <th
                rowSpan={2}
                className="border-b border-l border-r border-black text-center pl-1 pr-1 pt-0.5 pb-0.5"
                style={{ color: "black", fontSize: "9px" }}
              >
                Unit Rate
                <br />
                (USD)
              </th>
              <th
                rowSpan={2}
                className="border-b border-l border-r border-black text-center pl-1 pr-1 pt-0.5 pb-0.5"
                style={{ color: "black", fontSize: "9px" }}
              >
                ROE
              </th>
              <th
                rowSpan={2}
                className="border-b border-l border-r border-black text-center pl-1 pr-1 pt-0.5 pb-0.5"
                style={{ color: "black", fontSize: "9px" }}
              >
                No. Of
                <br /> Units
              </th>
              {/* <th
                rowSpan={2}
                className="border-b border-l border-r border-black text-center pl-1 pr-1 pt-0.5 pb-0.5"
                style={{ color: "black", fontSize: "9px" }}
              >
                Net Amount
              </th> */}
              <th
                rowSpan={2}
                className="border-b border-l border-r border-black text-center pl-1 pr-1 pt-0.5 pb-0.5"
                style={{ color: "black", fontSize: "9px" }}
              >
                VAT%
              </th>
              <th
                rowSpan={2}
                className="border-b border-l border-r border-black text-center pl-1 pr-1 pt-0.5 pb-0.5"
                style={{ color: "black", fontSize: "9px" }}
              >
                VAT Amount
                <br />
                (USD)
              </th>
              <th
                colSpan={2}
                className="border-b border-l  border-black text-center pl-1 pr-1 pt-0.5 pb-0.5"
                style={{ color: "black", fontSize: "9px" }}
              >
                Payable Amount
              </th>
            </tr>
            <tr className="bg-gray-300">
              <th
                className="border-b border-l  border-black text-center pl-1 pr-1 pt-0.5 pb-0.5"
                style={{ color: "black", fontSize: "9px" }}
              >
                in USD
              </th>
              <th
                className="border-b border-l  border-black text-center pl-1 pr-1 pt-0.5 pb-0.5"
                style={{ color: "black", fontSize: "9px" }}
              >
                in KES
              </th>
            </tr>
          </thead>

          <tbody
            style={{
              color: "black",
              fontSize: "9px",
            }}
          >
            {rows.length > 0 ? (
              rows.map((r, i) => (
                <tr key={i} className="align-top">
                  <td
                    className="border-r border-t border-b border-black pl-1 pr-1 pt-0.5 pb-0.5"
                    style={{ color: "black", fontSize: "9px" }}
                  >
                    {i + 1}
                  </td>
                  <td
                    className="border border-black pl-1 pr-1 pt-0.5 pb-0.5 text-left"
                    style={{ color: "black", fontSize: "9px" }}
                  >
                    {r?.description || ""}
                  </td>
                  <td
                    className="border border-black pl-1 pr-1 pt-0.5 pb-0.5 text-center"
                    style={{ color: "black", fontSize: "9px" }}
                  >
                    {r?.unit || ""}
                  </td>
                  <td
                    className="border border-black px-1 py-0.5 text-center"
                    style={{ color: "black", fontSize: "9px" }}
                  >
                    {Number(r?.rate ?? 0).toFixed(2)}
                  </td>

                  <td
                    className="border border-black pl-1 pr-1 pt-0.5 pb-0.5 text-center"
                    style={{ color: "black", fontSize: "9px" }}
                  >
                    {fmt(r?.exchangeRate)}
                  </td>
                  <td
                    className="border border-black pl-1 pr-1 pt-0.5 pb-0.5 text-center"
                    style={{ color: "black", fontSize: "9px" }}
                  >
                    {fmt(r?.qty)}
                  </td>
                  {/* <td
                    className="border border-black pl-1 pr-1 pt-0.5 pb-0.5 text-right"
                    style={{ color: "black", fontSize: "9px" }}
                  >
                    {Number(r?.totalAmount || 0).toFixed(2)}
                  </td> */}
                  <td
                    className="border border-black pl-1 pr-1 pt-0.5 pb-0.5 text-center"
                    style={{ color: "black", fontSize: "9px" }}
                  >
                    {r?.tblInvoiceChargeTax[0]?.taxPercentage || "0"}
                    {" %"}
                  </td>
                  <td
                    className="border border-black pl-1 pr-1 pt-0.5 pb-0.5 text-center"
                    style={{ color: "black", fontSize: "9px" }}
                  >
                    {Number(
                      r?.tblInvoiceChargeTax[0]?.taxAmountFc || 0,
                    ).toFixed(2)}
                  </td>
                  <td
                    className="border border-black pl-1 pr-1 pt-0.5 pb-0.5 text-right"
                    style={{ color: "black", fontSize: "9px" }}
                  >
                    {(
                      toNum(r?.totalAmountFc) +
                      toNum(r?.tblInvoiceChargeTax?.[0]?.taxAmountFc)
                    ).toLocaleString("en-IN", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </td>

                  <td
                    className="border-l border-t border-b border-black pl-1 pr-1 pt-0.5 pb-0.5 text-right"
                    style={{ color: "black", fontSize: "9px" }}
                  >
                    {(
                      toNum(r?.totalAmount) +
                      toNum(r?.tblInvoiceChargeTax?.[0]?.taxAmountHc)
                    ).toLocaleString("en-IN", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  className="border border-black pl-1 pr-1 pt-0.5 pb-0.5 text-center"
                  style={{
                    color: "black",
                    fontSize: "9px",
                  }}
                  colSpan={10}
                ></td>
              </tr>
            )}
          </tbody>
          {/* Totals row */}
        </table>
      </div>
    );
  };

  const ChargeWithVat = ({ data = [], fullData = [] }) => {
    // Accept either an array or an object with tblInvoiceCharge
    const rows = (
      Array.isArray(data) ? data : data?.tblInvoiceCharge || []
    ).slice(0, 20);
    const calculateTotal = Array.isArray(data)
      ? data
      : data?.tblInvoiceCharge || [];

    // simple number formatter; leave blank if null/undefined
    const fmt = (v, opts = { maximumFractionDigits: 2 }) =>
      v === null || v === undefined || v === ""
        ? ""
        : Number(v).toLocaleString(undefined, opts);

    const toNum = (v) => {
      if (typeof v === "number") return v;
      const n = parseFloat(
        String(v ?? "")
          .replace(/,/g, "")
          .trim(),
      );
      return Number.isFinite(n) ? n : 0;
    };

    const totals = (calculateTotal ?? []).reduce(
      (acc, row) => {
        const taxHC = toNum(row?.tblInvoiceChargeTax?.[0]?.taxAmountHc);
        const taxFC = toNum(row?.tblInvoiceChargeTax?.[0]?.taxAmountFc);
        const taxHCvatAmount = toNum(
          row?.tblInvoiceChargeTax?.[0]?.taxAmountFc,
        );

        acc.totalAmountFc += toNum(row?.totalAmountFc) + taxFC; // add FC tax
        acc.totalAmount += toNum(row?.totalAmount) + taxHC; // add HC tax
        acc.vatAmount += taxHCvatAmount; // keep VAT HC separately

        return acc;
      },
      { totalAmountFc: 0, totalAmount: 0, vatAmount: 0 },
    );

    // (optional) formatted strings:
    const totalsFormatted = {
      totalAmountFc: totals.totalAmountFc.toFixed(2),
      totalAmount: totals.totalAmount.toFixed(2),
      vatAmount: totals.vatAmount.toFixed(2),
    };
    return (
      <div
        style={{
          color: "black",
          paddingTop: "10px",
        }}
        className="w-full"
      >
        <table className="w-full border-b border-t border-black  text-[9px]">
          <thead>
            <tr className="bg-gray-300">
              <th
                rowSpan={2}
                className="border-b border-black text-center pl-1 pr-1 pt-0.5 pb-0.5"
                style={{ color: "black", fontSize: "9px" }}
              >
                SNo
              </th>
              <th
                rowSpan={2}
                className="border-b border-l border-r border-black text-center pl-1 pr-1 pt-0.5 pb-0.5"
                style={{ color: "black", fontSize: "9px" }}
              >
                Description
              </th>
              <th
                rowSpan={2}
                className="border-b border-l border-r border-black text-center pl-1 pr-1 pt-0.5 pb-0.5"
                style={{ color: "black", fontSize: "9px" }}
              >
                Unit
              </th>
              <th
                rowSpan={2}
                className="border-b border-l border-r border-black text-center pl-1 pr-1 pt-0.5 pb-0.5"
                style={{ color: "black", fontSize: "9px" }}
              >
                Unit Rate
                <br />
                (USD)
              </th>
              <th
                rowSpan={2}
                className="border-b border-l border-r border-black text-center pl-1 pr-1 pt-0.5 pb-0.5"
                style={{ color: "black", fontSize: "9px" }}
              >
                ROE
              </th>
              <th
                rowSpan={2}
                className="border-b border-l border-r border-black text-center pl-1 pr-1 pt-0.5 pb-0.5"
                style={{ color: "black", fontSize: "9px" }}
              >
                No. Of
                <br /> Units
              </th>
              {/* <th
                rowSpan={2}
                className="border-b border-l border-r border-black text-center pl-1 pr-1 pt-0.5 pb-0.5"
                style={{ color: "black", fontSize: "9px" }}
              >
                Net Amount
              </th> */}
              <th
                rowSpan={2}
                className="border-b border-l border-r border-black text-center pl-1 pr-1 pt-0.5 pb-0.5"
                style={{ color: "black", fontSize: "9px" }}
              >
                VAT%
              </th>
              <th
                rowSpan={2}
                className="border-b border-l border-r border-black text-center pl-1 pr-1 pt-0.5 pb-0.5"
                style={{ color: "black", fontSize: "9px" }}
              >
                VAT Amount
                <br />
                (USD)
              </th>
              <th
                colSpan={2}
                className="border-b border-l  border-black text-center pl-1 pr-1 pt-0.5 pb-0.5"
                style={{ color: "black", fontSize: "9px" }}
              >
                Payable Amount
              </th>
            </tr>
            <tr className="bg-gray-300">
              <th
                className="border-b border-l  border-black text-center pl-1 pr-1 pt-0.5 pb-0.5"
                style={{ color: "black", fontSize: "9px" }}
              >
                in USD
              </th>
              <th
                className="border-b border-l  border-black text-center pl-1 pr-1 pt-0.5 pb-0.5"
                style={{ color: "black", fontSize: "9px" }}
              >
                in KES
              </th>
            </tr>
          </thead>

          <tbody
            style={{
              color: "black",
              fontSize: "9px",
            }}
          >
            {rows.length > 0 ? (
              rows.map((r, i) => (
                <tr key={i} className="align-top">
                  <td
                    className="border-r border-t border-b border-black pl-1 pr-1 pt-0.5 pb-0.5"
                    style={{ color: "black", fontSize: "9px" }}
                  >
                    {i + 1}
                  </td>
                  <td
                    className="border border-black pl-1 pr-1 pt-0.5 pb-0.5 text-left"
                    style={{ color: "black", fontSize: "9px" }}
                  >
                    {r?.description || ""}
                  </td>
                  <td
                    className="border border-black pl-1 pr-1 pt-0.5 pb-0.5 text-center"
                    style={{ color: "black", fontSize: "9px" }}
                  >
                    {r?.unit || ""}
                  </td>
                  <td
                    className="border border-black px-1 py-0.5 text-center"
                    style={{ color: "black", fontSize: "9px" }}
                  >
                    {Number(r?.rate ?? 0).toFixed(2)}
                  </td>

                  <td
                    className="border border-black pl-1 pr-1 pt-0.5 pb-0.5 text-center"
                    style={{ color: "black", fontSize: "9px" }}
                  >
                    {fmt(r?.exchangeRate)}
                  </td>
                  <td
                    className="border border-black pl-1 pr-1 pt-0.5 pb-0.5 text-center"
                    style={{ color: "black", fontSize: "9px" }}
                  >
                    {fmt(r?.qty)}
                  </td>
                  {/* <td
                    className="border border-black pl-1 pr-1 pt-0.5 pb-0.5 text-right"
                    style={{ color: "black", fontSize: "9px" }}
                  >
                    {Number(r?.totalAmount || 0).toFixed(2)}
                  </td> */}
                  <td
                    className="border border-black pl-1 pr-1 pt-0.5 pb-0.5 text-center"
                    style={{ color: "black", fontSize: "9px" }}
                  >
                    {r?.tblInvoiceChargeTax[0]?.taxPercentage || "0"}
                    {" %"}
                  </td>
                  <td
                    className="border border-black pl-1 pr-1 pt-0.5 pb-0.5 text-center"
                    style={{ color: "black", fontSize: "9px" }}
                  >
                    {Number(
                      r?.tblInvoiceChargeTax[0]?.taxAmountFc || 0,
                    ).toFixed(2)}
                  </td>
                  <td
                    className="border border-black pl-1 pr-1 pt-0.5 pb-0.5 text-right"
                    style={{ color: "black", fontSize: "9px" }}
                  >
                    {(
                      toNum(r?.totalAmountFc) +
                      toNum(r?.tblInvoiceChargeTax?.[0]?.taxAmountFc)
                    ).toFixed(2)}
                  </td>
                  <td
                    className="border-l border-t border-b border-black pl-1 pr-1 pt-0.5 pb-0.5 text-right"
                    style={{ color: "black", fontSize: "9px" }}
                  >
                    {/* {Number(r?.totalAmount || 0).toFixed(2)} */}
                    {(
                      toNum(r?.totalAmount) +
                      toNum(r?.tblInvoiceChargeTax?.[0]?.taxAmountHc)
                    ).toFixed(2)}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  className="border border-black pl-1 pr-1 pt-0.5 pb-0.5 text-center"
                  style={{
                    color: "black",
                    fontSize: "9px",
                  }}
                  colSpan={10}
                ></td>
              </tr>
            )}
          </tbody>
          {/* Totals row */}
        </table>
      </div>
    );
  };

  // const ChargeGridAttachment = ({ data = [] }) => {
  //   // Accept either an array or an object with tblInvoiceCharge
  //   const rows = (
  //     Array.isArray(data) ? data : data?.tblInvoiceCharge || []
  //   ).slice(0, 20);
  //   const calculateTotal = Array.isArray(data)
  //     ? data
  //     : data?.tblInvoiceCharge || [];

  //   // simple number formatter; leave blank if null/undefined
  //   const fmt = (v, opts = { maximumFractionDigits: 2 }) =>
  //     v === null || v === undefined || v === ""
  //       ? ""
  //       : Number(v).toLocaleString(undefined, opts);

  //   const totals = calculateTotal.reduce(
  //     (acc, row) => {
  //       acc.amount += Number(row.amount) || 0;
  //       acc.rate += Number(row.rate) || 0;
  //       acc.taxAmount += Number(row.taxAmount) || 0;
  //       return acc;
  //     },
  //     { amount: 0, rate: 0, taxAmount: 0 }
  //   );

  //   // Format with 2 decimals
  //   const formattedTotals = {
  //     amount: totals.amount.toFixed(2),
  //     rate: totals.rate.toFixed(2),
  //     taxAmount: totals.taxAmount.toFixed(2),
  //   };

  //   return (
  //     <>
  //       <div
  //         style={{
  //           color: "black",
  //           minHeight: "650px",
  //           maxheight: "650px",
  //           hight: "650px",
  //         }}
  //         className="w-full border-l border-r border-black"
  //       >
  //         <table className="w-full border-b border-black  text-[9px]">
  //           <thead>
  //             <tr className="bg-gray-300">
  //               <th
  //                 rowSpan={2}
  //                 className="border-b border-black text-center pl-1 pr-1 pt-0.5 pb-0.5"
  //                 style={{ color: "black", fontSize: "9px" }}
  //               >
  //                 SNo
  //               </th>
  //               <th
  //                 rowSpan={2}
  //                 className="border-b border-l border-r border-black text-center pl-1 pr-1 pt-0.5 pb-0.5"
  //                 style={{ color: "black", fontSize: "9px" }}
  //               >
  //                 Description
  //               </th>
  //               <th
  //                 rowSpan={2}
  //                 className="border-b border-l border-r border-black text-center pl-1 pr-1 pt-0.5 pb-0.5"
  //                 style={{ color: "black", fontSize: "9px" }}
  //               >
  //                 Unit Rate
  //               </th>
  //               <th
  //                 rowSpan={2}
  //                 className="border-b border-l border-r border-black text-center pl-1 pr-1 pt-0.5 pb-0.5"
  //                 style={{ color: "black", fontSize: "9px" }}
  //               >
  //                 ROE
  //               </th>
  //               <th
  //                 rowSpan={2}
  //                 className="border-b border-l border-r border-black text-center pl-1 pr-1 pt-0.5 pb-0.5"
  //                 style={{ color: "black", fontSize: "9px" }}
  //               >
  //                 No. Of Units
  //               </th>
  //               <th
  //                 rowSpan={2}
  //                 className="border-b border-l border-r border-black text-center pl-1 pr-1 pt-0.5 pb-0.5"
  //                 style={{ color: "black", fontSize: "9px" }}
  //               >
  //                 Net Amount
  //               </th>
  //               <th
  //                 rowSpan={2}
  //                 className="border-b border-l border-r border-black text-center pl-1 pr-1 pt-0.5 pb-0.5"
  //                 style={{ color: "black", fontSize: "9px" }}
  //               >
  //                 VAT%
  //               </th>
  //               <th
  //                 rowSpan={2}
  //                 className="border-b border-l border-r border-black text-center pl-1 pr-1 pt-0.5 pb-0.5"
  //                 style={{ color: "black", fontSize: "9px" }}
  //               >
  //                 VAT Amount
  //               </th>
  //               <th
  //                 colSpan={2}
  //                 className="border-b border-l  border-black text-center pl-1 pr-1 pt-0.5 pb-0.5"
  //                 style={{ color: "black", fontSize: "9px" }}
  //               >
  //                 Payable Amount
  //               </th>
  //             </tr>
  //             <tr className="bg-gray-300">
  //               <th
  //                 className="border-b border-l  border-black text-center pl-1 pr-1 pt-0.5 pb-0.5"
  //                 style={{ color: "black", fontSize: "9px" }}
  //               >
  //                 in USD
  //               </th>
  //               <th
  //                 className="border-b border-l  border-black text-center pl-1 pr-1 pt-0.5 pb-0.5"
  //                 style={{ color: "black", fontSize: "9px" }}
  //               >
  //                 in KES
  //               </th>
  //             </tr>
  //           </thead>

  //           <tbody
  //             style={{
  //               color: "black",
  //               fontSize: "9px",
  //             }}
  //           >
  //             {rows.length > 0 ? (
  //               rows.map((r, i) => (
  //                 <tr key={i} className="align-top">
  //                   <td
  //                     className="border-r border-t border-b border-black pl-1 pr-1 pt-0.5 pb-0.5"
  //                     style={{ color: "black", fontSize: "9px" }}
  //                   >
  //                     {i + 1}
  //                   </td>
  //                   <td
  //                     className="border border-black pl-1 pr-1 pt-0.5 pb-0.5 text-left"
  //                     style={{ color: "black", fontSize: "9px" }}
  //                   >
  //                     {r?.description || ""}
  //                   </td>
  //                   <td
  //                     className="border border-black pl-1 pr-1 pt-0.5 pb-0.5 text-right"
  //                     style={{ color: "black", fontSize: "9px" }}
  //                   >
  //                     {Number(r?.rate || 0).toFixed(2)}
  //                   </td>
  //                   <td
  //                     className="border border-black pl-1 pr-1 pt-0.5 pb-0.5 text-right"
  //                     style={{ color: "black", fontSize: "9px" }}
  //                   >
  //                     {fmt(r.exchangeRate)}
  //                   </td>
  //                   <td
  //                     className="border border-black pl-1 pr-1 pt-0.5 pb-0.5 text-right"
  //                     style={{ color: "black", fontSize: "9px" }}
  //                   >
  //                     {fmt(r.qty)}
  //                   </td>
  //                   <td
  //                     className="border border-black pl-1 pr-1 pt-0.5 pb-0.5 text-right"
  //                     style={{ color: "black", fontSize: "9px" }}
  //                   >
  //                     {Number(r?.amount || 0).toFixed(2)}
  //                   </td>
  //                   <td
  //                     className="border border-black pl-1 pr-1 pt-0.5 pb-0.5 text-right"
  //                     style={{ color: "black", fontSize: "9px" }}
  //                   >
  //                     {fmt(r.taxPercentage)}
  //                   </td>
  //                   <td
  //                     className="border border-black pl-1 pr-1 pt-0.5 pb-0.5 text-right"
  //                     style={{ color: "black", fontSize: "9px" }}
  //                   >
  //                     {Number(r?.taxAmount || 0).toFixed(2)}
  //                   </td>
  //                   <td
  //                     className="border border-black pl-1 pr-1 pt-0.5 pb-0.5 text-right"
  //                     style={{ color: "black", fontSize: "9px" }}
  //                   >
  //                     {Number(r?.rate || 0).toFixed(2)}
  //                   </td>
  //                   <td
  //                     className="border-l border-t border-b border-black pl-1 pr-1 pt-0.5 pb-0.5 text-right"
  //                     style={{ color: "black", fontSize: "9px" }}
  //                   >
  //                     {Number(r?.amount || 0).toFixed(2)}
  //                   </td>
  //                 </tr>
  //               ))
  //             ) : (
  //               <tr>
  //                 <td
  //                   className="border border-black pl-1 pr-1 pt-0.5 pb-0.5 text-center"
  //                   style={{
  //                     color: "black",
  //                     fontSize: "9px",
  //                   }}
  //                   colSpan={10}
  //                 >
  //                   No charges
  //                 </td>
  //               </tr>
  //             )}
  //             <tr>
  //               {/* Left merged note area */}
  //               <td
  //                 colSpan={6}
  //                 className="border-r border-t border-b border-black pl-1 pr-1 pt-0.5 pb-0.5 text-left"
  //               >
  //                 <span
  //                   className="font-semibold"
  //                   style={{ color: "black", fontSize: "9px" }}
  //                 >
  //                   Demurrage Valid Till :
  //                 </span>{" "}
  //                 {/* {demurrageValidTill} */}
  //               </td>

  //               {/* â€œTotal Amount:â€ label in the VAT% column */}
  //               <td className="border border-black pl-1 pr-1 pt-0.5 pb-0.5 text-right">
  //                 <span
  //                   className="font-semibold"
  //                   style={{ color: "black", fontSize: "9px" }}
  //                 >
  //                   Total Amount:
  //                 </span>
  //               </td>
  //               <td
  //                 className="border border-black pl-1 pr-1 pt-0.5 pb-0.5 text-right font-bold"
  //                 style={{ color: "black", fontSize: "9px" }}
  //               >
  //                 {formattedTotals?.taxAmount}
  //               </td>
  //               <td
  //                 className="border border-black pl-1 pr-1 pt-0.5 pb-0.5 text-right font-bold"
  //                 style={{ color: "black", fontSize: "9px" }}
  //               >
  //                 {formattedTotals?.rate}
  //               </td>
  //               <td
  //                 className="border-l border-t border-b border-black pl-1 pr-1 pt-0.5 pb-0.5 text-right font-bold"
  //                 style={{ color: "black", fontSize: "9px" }}
  //               >
  //                 {formattedTotals?.taxAmount}
  //               </td>
  //             </tr>
  //           </tbody>
  //           {/* Totals row */}
  //         </table>
  //       </div>
  //     </>
  //   );
  // };

  // const ChargeGridAttachment = ({ data = [] }) => {
  //   // Accept either an array or an object with tblInvoiceCharge
  //   const rows = (
  //     Array.isArray(data) ? data : data?.tblInvoiceCharge || []
  //   ).slice(20, 50);
  //   const calculateTotal = Array.isArray(data)
  //     ? data
  //     : data?.tblInvoiceCharge || [];

  //   // simple number formatter; leave blank if null/undefined
  //   const fmt = (v, opts = { maximumFractionDigits: 2 }) =>
  //     v === null || v === undefined || v === ""
  //       ? ""
  //       : Number(v).toLocaleString(undefined, opts);

  //   // const totals = calculateTotal.reduce(
  //   //   (acc, row) => {
  //   //     acc.amount += Number(row.amount) || 0;
  //   //     acc.rate += Number(row.rate) || 0;
  //   //     acc.taxAmount += Number(row.taxAmount) || 0;
  //   //     return acc;
  //   //   },
  //   //   { amount: 0, rate: 0, taxAmount: 0 }
  //   // );

  //   // // Format with 2 decimals
  //   // const formattedTotals = {
  //   //   amount: totals.amount.toFixed(2),
  //   //   rate: totals.rate.toFixed(2),
  //   //   taxAmount: totals.taxAmount.toFixed(2),
  //   // };

  //   const toNum = (v) => {
  //     if (typeof v === "number") return v;
  //     const n = parseFloat(
  //       String(v ?? "")
  //         .replace(/,/g, "")
  //         .trim()
  //     );
  //     return Number.isFinite(n) ? n : 0;
  //   };

  //   const totals = (calculateTotal ?? []).reduce(
  //     (acc, row) => {
  //       acc.totalAmountFc += toNum(row?.totalAmountFc);
  //       acc.totalAmount += toNum(row?.totalAmount);
  //       acc.vatAmount += toNum(row?.tblInvoiceChargeTax[0]?.taxAmountHc);
  //       return acc;
  //     },
  //     { totalAmountFc: 0, totalAmount: 0, vatAmount: 0 }
  //   );

  //   // (optional) formatted strings:
  //   const totalsFormatted = {
  //     totalAmountFc: totals.totalAmountFc.toFixed(2),
  //     totalAmount: totals.totalAmount.toFixed(2),
  //     vatAmount: totals.vatAmount.toFixed(2),
  //   };

  //   return (
  //     <div
  //       style={{
  //         color: "black",
  //         minHeight: "660px",
  //         maxheight: "660px",
  //         hight: "660px",
  //       }}
  //       className="w-full border-b border-l border-r border-black border-b"
  //     >
  //       <table className="w-full border-b border-black  text-[9px]">
  //         <thead>
  //           <tr className="bg-gray-300">
  //             <th
  //               rowSpan={2}
  //               className="border-b border-black text-center pl-1 pr-1 pt-0.5 pb-0.5"
  //               style={{ color: "black", fontSize: "9px" }}
  //             >
  //               SNo
  //             </th>
  //             <th
  //               rowSpan={2}
  //               className="border-b border-l border-r border-black text-center pl-1 pr-1 pt-0.5 pb-0.5"
  //               style={{ color: "black", fontSize: "9px" }}
  //             >
  //               Description
  //             </th>
  //             <th
  //               rowSpan={2}
  //               className="border-b border-l border-r border-black text-center pl-1 pr-1 pt-0.5 pb-0.5"
  //               style={{ color: "black", fontSize: "9px" }}
  //             >
  //               Unit Rate
  //             </th>
  //             <th
  //               rowSpan={2}
  //               className="border-b border-l border-r border-black text-center pl-1 pr-1 pt-0.5 pb-0.5"
  //               style={{ color: "black", fontSize: "9px" }}
  //             >
  //               ROE
  //             </th>
  //             <th
  //               rowSpan={2}
  //               className="border-b border-l border-r border-black text-center pl-1 pr-1 pt-0.5 pb-0.5"
  //               style={{ color: "black", fontSize: "9px" }}
  //             >
  //               No. Of Units
  //             </th>
  //             <th
  //               rowSpan={2}
  //               className="border-b border-l border-r border-black text-center pl-1 pr-1 pt-0.5 pb-0.5"
  //               style={{ color: "black", fontSize: "9px" }}
  //             >
  //               Net Amount
  //             </th>
  //             <th
  //               rowSpan={2}
  //               className="border-b border-l border-r border-black text-center pl-1 pr-1 pt-0.5 pb-0.5"
  //               style={{ color: "black", fontSize: "9px" }}
  //             >
  //               VAT%
  //             </th>
  //             <th
  //               rowSpan={2}
  //               className="border-b border-l border-r border-black text-center pl-1 pr-1 pt-0.5 pb-0.5"
  //               style={{ color: "black", fontSize: "9px" }}
  //             >
  //               VAT Amount
  //             </th>
  //             <th
  //               colSpan={2}
  //               className="border-b border-l  border-black text-center pl-1 pr-1 pt-0.5 pb-0.5"
  //               style={{ color: "black", fontSize: "9px" }}
  //             >
  //               Payable Amount
  //             </th>
  //           </tr>
  //           <tr className="bg-gray-300">
  //             <th
  //               className="border-b border-l  border-black text-center pl-1 pr-1 pt-0.5 pb-0.5"
  //               style={{ color: "black", fontSize: "9px" }}
  //             >
  //               in USD
  //             </th>
  //             <th
  //               className="border-b border-l  border-black text-center pl-1 pr-1 pt-0.5 pb-0.5"
  //               style={{ color: "black", fontSize: "9px" }}
  //             >
  //               in KES
  //             </th>
  //           </tr>
  //         </thead>

  //         <tbody
  //           style={{
  //             color: "black",
  //             fontSize: "9px",
  //           }}
  //         >
  //           {rows.length > 0 ? (
  //             rows.map((r, i) => (
  //               <tr key={i} className="align-top">
  //                 <td
  //                   className="border-r border-t border-b border-black pl-1 pr-1 pt-0.5 pb-0.5"
  //                   style={{ color: "black", fontSize: "9px" }}
  //                 >
  //                   {i + 1}
  //                 </td>
  //                 <td
  //                   className="border border-black pl-1 pr-1 pt-0.5 pb-0.5 text-left"
  //                   style={{ color: "black", fontSize: "9px" }}
  //                 >
  //                   {r?.description || ""}
  //                 </td>
  //                 <td
  //                   className="border border-black px-1 py-0.5"
  //                   style={{ color: "black", fontSize: "9px" }}
  //                 >
  //                   <div className="grid grid-cols-2 whitespace-nowrap tabular-nums">
  //                     <span>{r?.chargeCurrency || ""}</span>
  //                     <span className="text-right">
  //                       {Number(r?.rate ?? 0).toFixed(2)}
  //                     </span>
  //                   </div>
  //                 </td>

  //                 <td
  //                   className="border border-black pl-1 pr-1 pt-0.5 pb-0.5 text-right"
  //                   style={{ color: "black", fontSize: "9px" }}
  //                 >
  //                   {fmt(r?.exchangeRate)}
  //                 </td>
  //                 <td
  //                   className="border border-black pl-1 pr-1 pt-0.5 pb-0.5 text-center"
  //                   style={{ color: "black", fontSize: "9px" }}
  //                 >
  //                   {fmt(r?.qty)}
  //                   {r?.size?.toString().trim() ? ` × ${r.size}` : ""}
  //                   {r?.typeCode ? ` ${r.typeCode}` : ""}
  //                 </td>
  //                 <td
  //                   className="border border-black pl-1 pr-1 pt-0.5 pb-0.5 text-right"
  //                   style={{ color: "black", fontSize: "9px" }}
  //                 >
  //                   {Number(r?.totalAmount || 0).toFixed(2)}
  //                 </td>
  //                 <td
  //                   className="border border-black pl-1 pr-1 pt-0.5 pb-0.5 text-center"
  //                   style={{ color: "black", fontSize: "9px" }}
  //                 >
  //                   {r?.tblInvoiceChargeTax[0]?.taxPercentage || "0"}
  //                   {" %"}
  //                 </td>
  //                 <td
  //                   className="border border-black pl-1 pr-1 pt-0.5 pb-0.5 text-right"
  //                   style={{ color: "black", fontSize: "9px" }}
  //                 >
  //                   {Number(
  //                     r?.tblInvoiceChargeTax[0]?.taxAmountHc || 0
  //                   ).toFixed(2)}
  //                 </td>
  //                 <td
  //                   className="border border-black pl-1 pr-1 pt-0.5 pb-0.5 text-right"
  //                   style={{ color: "black", fontSize: "9px" }}
  //                 >
  //                   {Number(r?.totalAmountFc || 0).toFixed(2)}
  //                 </td>
  //                 <td
  //                   className="border-l border-t border-b border-black pl-1 pr-1 pt-0.5 pb-0.5 text-right"
  //                   style={{ color: "black", fontSize: "9px" }}
  //                 >
  //                   {Number(r?.totalAmount || 0).toFixed(2)}
  //                 </td>
  //               </tr>
  //             ))
  //           ) : (
  //             <tr>
  //               <td
  //                 className="border border-black pl-1 pr-1 pt-0.5 pb-0.5 text-center"
  //                 style={{
  //                   color: "black",
  //                   fontSize: "9px",
  //                 }}
  //                 colSpan={10}
  //               ></td>
  //             </tr>
  //           )}
  //           <tr>
  //             {/* Left merged note area */}
  //             <td
  //               colSpan={6}
  //               className="border-r border-t border-b border-black pl-1 pr-1 pt-0.5 pb-0.5 text-left"
  //             >
  //               <span
  //                 className="font-semibold"
  //                 style={{ color: "black", fontSize: "9px" }}
  //               >
  //                 Demurrage Valid Till :
  //               </span>{" "}
  //               {data[0]?.demurrageValid || ""}
  //             </td>

  //             {/* â€œTotal Amount:â€ label in the VAT% column */}
  //             <td className="border border-black pl-1 pr-1 pt-0.5 pb-0.5 text-right">
  //               <span
  //                 className="font-semibold"
  //                 style={{ color: "black", fontSize: "9px" }}
  //               >
  //                 Total Amount:
  //               </span>
  //             </td>
  //             <td
  //               className="border border-black pl-1 pr-1 pt-0.5 pb-0.5 text-right font-bold"
  //               style={{ color: "black", fontSize: "9px" }}
  //             >
  //               {totalsFormatted?.vatAmount}
  //             </td>
  //             <td
  //               className="border border-black pl-1 pr-1 pt-0.5 pb-0.5 text-right font-bold"
  //               style={{ color: "black", fontSize: "9px" }}
  //             >
  //               {totalsFormatted?.totalAmountFc}
  //             </td>
  //             <td
  //               className="border-l border-t border-b border-black pl-1 pr-1 pt-0.5 pb-0.5 text-right font-bold"
  //               style={{ color: "black", fontSize: "9px" }}
  //             >
  //               {totalsFormatted?.totalAmount}
  //             </td>
  //           </tr>
  //         </tbody>
  //         {/* Totals row */}
  //       </table>
  //     </div>
  //   );
  // };

  const ChargeGridAttachment = ({ data = [] }) => {
    // Accept either an array or an object with tblInvoiceCharge
    const rows = (
      Array.isArray(data) ? data : data?.tblInvoiceCharge || []
    ).slice(21, 50);
    const calculateTotal = Array.isArray(data)
      ? data
      : data?.tblInvoiceCharge || [];

    // simple number formatter; leave blank if null/undefined
    const fmt = (v, opts = { maximumFractionDigits: 2 }) =>
      v === null || v === undefined || v === ""
        ? ""
        : Number(v).toLocaleString(undefined, opts);

    // const totals = calculateTotal.reduce(
    //   (acc, row) => {
    //     acc.amount += Number(row.amount) || 0;
    //     acc.rate += Number(row.rate) || 0;
    //     acc.taxAmount += Number(row.taxAmount) || 0;
    //     return acc;
    //   },
    //   { amount: 0, rate: 0, taxAmount: 0 }
    // );

    // // Format with 2 decimals
    // const formattedTotals = {
    //   amount: totals.amount.toFixed(2),
    //   rate: totals.rate.toFixed(2),
    //   taxAmount: totals.taxAmount.toFixed(2),
    // };

    const toNum = (v) => {
      if (typeof v === "number") return v;
      const n = parseFloat(
        String(v ?? "")
          .replace(/,/g, "")
          .trim(),
      );
      return Number.isFinite(n) ? n : 0;
    };

    const totals = (calculateTotal ?? []).reduce(
      (acc, row) => {
        const taxHC = toNum(row?.tblInvoiceChargeTax?.[0]?.taxAmountHc);
        const taxFC = toNum(row?.tblInvoiceChargeTax?.[0]?.taxAmountFc);
        const taxHCvatAmount = toNum(
          row?.tblInvoiceChargeTax?.[0]?.taxAmountFc,
        );

        acc.totalAmountFc += toNum(row?.totalAmountFc) + taxFC; // add FC tax
        acc.totalAmount += toNum(row?.totalAmount) + taxHC; // add HC tax
        acc.vatAmount += taxHCvatAmount; // keep VAT HC separately

        return acc;
      },
      { totalAmountFc: 0, totalAmount: 0, vatAmount: 0 },
    );

    // (optional) formatted strings:
    const totalsFormatted = {
      totalAmountFc: totals.totalAmountFc.toFixed(2),
      totalAmount: totals.totalAmount.toFixed(2),
      vatAmount: totals.vatAmount.toFixed(2),
    };

    return (
      <div
        style={{
          color: "black",
          minHeight: "570px",
          maxheight: "570px",
          hight: "570px",
        }}
        className="w-full border-b border-l border-r border-black border-b"
      >
        <table className="w-full border-b border-black  text-[9px]">
          <thead>
            <tr className="bg-gray-300">
              <th
                rowSpan={2}
                className="border-b border-black text-center pl-1 pr-1 pt-0.5 pb-0.5"
                style={{ color: "black", fontSize: "9px" }}
              >
                SNo
              </th>
              <th
                rowSpan={2}
                className="border-b border-l border-r border-black text-center pl-1 pr-1 pt-0.5 pb-0.5"
                style={{ color: "black", fontSize: "9px" }}
              >
                Description
              </th>
              <th
                rowSpan={2}
                className="border-b border-l border-r border-black text-center pl-1 pr-1 pt-0.5 pb-0.5"
                style={{ color: "black", fontSize: "9px" }}
              >
                Unit Rate
              </th>
              <th
                rowSpan={2}
                className="border-b border-l border-r border-black text-center pl-1 pr-1 pt-0.5 pb-0.5"
                style={{ color: "black", fontSize: "9px" }}
              >
                ROE
              </th>
              <th
                rowSpan={2}
                className="border-b border-l border-r border-black text-center pl-1 pr-1 pt-0.5 pb-0.5"
                style={{ color: "black", fontSize: "9px" }}
              >
                No. Of Units
              </th>
              {/* <th
                rowSpan={2}
                className="border-b border-l border-r border-black text-center pl-1 pr-1 pt-0.5 pb-0.5"
                style={{ color: "black", fontSize: "9px" }}
              >
                Net Amount
              </th> */}
              <th
                rowSpan={2}
                className="border-b border-l border-r border-black text-center pl-1 pr-1 pt-0.5 pb-0.5"
                style={{ color: "black", fontSize: "9px" }}
              >
                VAT%
              </th>
              <th
                rowSpan={2}
                className="border-b border-l border-r border-black text-center pl-1 pr-1 pt-0.5 pb-0.5"
                style={{ color: "black", fontSize: "9px" }}
              >
                VAT Amount
              </th>
              <th
                colSpan={2}
                className="border-b border-l  border-black text-center pl-1 pr-1 pt-0.5 pb-0.5"
                style={{ color: "black", fontSize: "9px" }}
              >
                Payable Amount
              </th>
            </tr>
            <tr className="bg-gray-300">
              <th
                className="border-b border-l  border-black text-center pl-1 pr-1 pt-0.5 pb-0.5"
                style={{ color: "black", fontSize: "9px" }}
              >
                in USD
              </th>
              <th
                className="border-b border-l  border-black text-center pl-1 pr-1 pt-0.5 pb-0.5"
                style={{ color: "black", fontSize: "9px" }}
              >
                in KES
              </th>
            </tr>
          </thead>

          <tbody
            style={{
              color: "black",
              fontSize: "9px",
            }}
          >
            {rows.length > 0 ? (
              rows.map((r, i) => (
                <tr key={i} className="align-top">
                  <td
                    className="border-r border-t border-b border-black pl-1 pr-1 pt-0.5 pb-0.5"
                    style={{ color: "black", fontSize: "9px" }}
                  >
                    {i + 1}
                  </td>
                  <td
                    className="border border-black pl-1 pr-1 pt-0.5 pb-0.5 text-left"
                    style={{ color: "black", fontSize: "9px" }}
                  >
                    {r?.description || ""}
                  </td>
                  <td
                    className="border border-black px-1 py-0.5"
                    style={{ color: "black", fontSize: "9px" }}
                  >
                    <div className="grid grid-cols-2 whitespace-nowrap tabular-nums">
                      <span>{r?.chargeCurrency || ""}</span>
                      <span className="text-right">
                        {Number(r?.rate ?? 0).toFixed(2)}
                      </span>
                    </div>
                  </td>

                  <td
                    className="border border-black pl-1 pr-1 pt-0.5 pb-0.5 text-right"
                    style={{ color: "black", fontSize: "9px" }}
                  >
                    {fmt(r?.exchangeRate)}
                  </td>
                  <td
                    className="border border-black pl-1 pr-1 pt-0.5 pb-0.5 text-center"
                    style={{ color: "black", fontSize: "9px" }}
                  >
                    {fmt(r?.qty)}
                  </td>
                  {/* <td
                    className="border border-black pl-1 pr-1 pt-0.5 pb-0.5 text-right"
                    style={{ color: "black", fontSize: "9px" }}
                  >
                    {Number(r?.totalAmount || 0).toFixed(2)}
                  </td> */}
                  <td
                    className="border border-black pl-1 pr-1 pt-0.5 pb-0.5 text-center"
                    style={{ color: "black", fontSize: "9px" }}
                  >
                    {r?.tblInvoiceChargeTax[0]?.taxPercentage || "0"}
                    {" %"}
                  </td>
                  <td
                    className="border border-black pl-1 pr-1 pt-0.5 pb-0.5 text-right"
                    style={{ color: "black", fontSize: "9px" }}
                  >
                    {Number(
                      r?.tblInvoiceChargeTax[0]?.taxAmountFc || 0,
                    ).toFixed(2)}
                  </td>
                  <td
                    className="border border-black pl-1 pr-1 pt-0.5 pb-0.5 text-right"
                    style={{ color: "black", fontSize: "9px" }}
                  >
                    {(
                      toNum(r?.totalAmountFc) +
                      toNum(r?.tblInvoiceChargeTax?.[0]?.taxAmountFc)
                    ).toFixed(2)}
                  </td>
                  <td
                    className="border-l border-t border-b border-black pl-1 pr-1 pt-0.5 pb-0.5 text-right"
                    style={{ color: "black", fontSize: "9px" }}
                  >
                    {/* {Number(r?.totalAmount || 0).toFixed(2)} */}
                    {(
                      toNum(r?.totalAmount) +
                      toNum(r?.tblInvoiceChargeTax?.[0]?.taxAmountHc)
                    ).toFixed(2)}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  className="border border-black pl-1 pr-1 pt-0.5 pb-0.5 text-center"
                  style={{
                    color: "black",
                    fontSize: "9px",
                  }}
                  colSpan={10}
                ></td>
              </tr>
            )}
            <tr>
              {/* Left merged note area */}
              <td
                colSpan={5}
                className="border-r border-t border-b border-black pl-1 pr-1 pt-0.5 pb-0.5 text-left"
              >
                <span
                  className="font-semibold"
                  style={{ color: "black", fontSize: "9px" }}
                >
                  Detention Valid Till :
                </span>{" "}
                {data[0]?.detentionValidTill || ""}
              </td>

              {/* â€œTotal Amount:â€ label in the VAT% column */}
              <td className="border border-black pl-1 pr-1 pt-0.5 pb-0.5 text-right">
                <span
                  className="font-semibold"
                  style={{ color: "black", fontSize: "9px" }}
                >
                  Total Amount:
                </span>
              </td>
              <td
                className="border border-black pl-1 pr-1 pt-0.5 pb-0.5 text-right font-bold"
                style={{ color: "black", fontSize: "9px" }}
              >
                {totalsFormatted?.vatAmount}
              </td>
              <td
                className="border border-black pl-1 pr-1 pt-0.5 pb-0.5 text-right font-bold"
                style={{ color: "black", fontSize: "9px" }}
              >
                {totalsFormatted?.totalAmountFc}
              </td>
              <td
                className="border-l border-t border-b border-black pl-1 pr-1 pt-0.5 pb-0.5 text-right font-bold"
                style={{ color: "black", fontSize: "9px" }}
              >
                {totalsFormatted?.totalAmount}
              </td>
            </tr>
          </tbody>
          {/* Totals row */}
        </table>
      </div>
    );
  };

  const HeadingGrid = ({}) => {
    const containerDetails = data[0]?.tblInvoiceCharge;

    // One function: build "count X size+type" label(s) using `type` (not typeCode)
    const buildQtyLabel = (rows = []) => {
      if (!Array.isArray(rows) || rows.length === 0) return "";

      const combos = new Map();

      for (const r of rows) {
        const size = String(r?.size ?? r?.sizeId ?? "").trim();
        if (!size) continue;

        // Use TYPE (string) exactly; normalize spacing/case
        const typeStrRaw = typeof r?.type === "string" ? r.type : "";
        const typeStr = typeStrRaw.trim().toUpperCase(); // e.g., "HIGH CUBE" | "" (blank)

        const key = `${size}|${typeStr}`;
        if (!combos.has(key)) {
          // presence-based count (avoids double-counting per-charge duplicates)
          combos.set(key, { size, typeStr, count: 1 });

          // ↳ If you prefer summing qty instead:
          // const q = Number(r?.qty) || 1;
          // combos.set(key, { size, typeStr, count: q });
        } else {
          // presence-based increment:
          const c = combos.get(key);
          c.count += 1;

          // ↳ For qty-based counting instead:
          // c.count += (Number(r?.qty) || 1);
        }
      }

      // Sort: by numeric size then by type
      const sorted = Array.from(combos.values()).sort((a, b) => {
        const nsA = Number(a.size) || 0;
        const nsB = Number(b.size) || 0;
        if (nsA !== nsB) return nsA - nsB;
        return a.typeStr.localeCompare(b.typeStr);
      });

      // Format: "1 X 20HIGH CUBE", "3 X 40", ...
      return sorted
        .map(
          ({ count, size, typeStr }) =>
            `${count} X ${size}${" "}${typeStr ? typeStr : ""}`,
        )
        .join(", ");
    };

    const qtyLabel = buildQtyLabel(containerDetails);
    console.log("qtyLabel", qtyLabel);
    console.log("containerDetails", containerDetails);
    return (
      <div className="flex">
        {/* First Table */}
        <table
          style={{
            width: "50%",
            borderCollapse: "collapse",
            borderLeft: "1px solid black",
            borderBottom: "1px solid black",
            borderTop: "1px solid black",
          }}
        >
          {/* First row spans 4 rows */}
          <tr>
            <td
              className="pl-1 pr-1 pb-0"
              style={{ width: "30%", verticalAlign: "top" }}
              rowSpan={4}
            >
              {/* ~4 normal rows: 13â€“14px each -> ~52â€“56px */}
              <div style={{ minHeight: "110px" }}>
                <p
                  className="text-left text-black font-bold pt-0.5 pb-0.5"
                  style={{ fontSize: "9px", color: "black" }}
                >
                  Invoice to
                </p>
              </div>
            </td>
            <td
              className="pl-1 pr-1 pb-0"
              style={{ width: "70%", verticalAlign: "top" }}
              rowSpan={4}
            >
              <div style={{ minHeight: "110px" }}>
                <p
                  className="text-left text-black pt-0.5 pb-0.5"
                  style={{ fontSize: "9px", color: "black" }}
                >
                  {data[0]?.party || ""}
                  <br />
                  {data[0]?.billingPartyAddress || ""}
                </p>
              </div>
            </td>
          </tr>

          {/* placeholder rows covered by the rowspan (no cells allowed here) */}
          <tr aria-hidden="true"></tr>
          <tr aria-hidden="true"></tr>
          <tr aria-hidden="true"></tr>

          {/* Normal rows continue below */}
          <tr>
            <td
              className="pl-1 pr-1 pb-0"
              style={{ width: "30%", verticalAlign: "top" }}
            >
              <p
                className="text-left text-black font-bold pt-0.5 pb-0.5"
                style={{ fontSize: "9px", color: "black" }}
              >
                PIN No:
              </p>
            </td>
            <td
              className="pl-1 pr-1 pb-0"
              style={{ width: "70%", verticalAlign: "top" }}
            >
              <p
                className="text-left text-black pt-0.5 pb-0.5"
                style={{ fontSize: "9px", color: "black" }}
              >
                {data[0]?.billingPartyVAT || ""}
              </p>
            </td>
          </tr>

          <tr>
            <td
              className="pl-1 pr-1 pb-0"
              style={{ width: "30%", verticalAlign: "top" }}
            >
              <p
                className="text-left text-black font-bold pt-0.5 pb-0.5"
                style={{ fontSize: "9px", color: "black" }}
              >
                QTY :
              </p>
            </td>
            <td
              className="pl-1 pr-1 pb-0"
              style={{ width: "70%", verticalAlign: "top" }}
            >
              <p
                className="text-left text-black pt-0.5 pb-0.5"
                style={{ fontSize: "9px", color: "black" }}
              >
                {data[0]?.sizeTypeContainer || ""}
              </p>
            </td>
          </tr>

          {/* <tr>
            <td
              className="pl-1 pr-1 pb-0"
              style={{ width: "30%", verticalAlign: "top" }}
            >
              <p
                className="text-left text-black font-bold pt-0.5 pb-0.5"
                style={{ fontSize: "9px", color: "black" }}
              >
                EXCHANGE RATE:
              </p>
            </td>
            <td
              className="pl-1 pr-1 pb-0"
              style={{ width: "70%", verticalAlign: "top" }}
            >
              <p
                className="text-left text-black pt-0.5 pb-0.5"
                style={{ fontSize: "9px", color: "black" }}
              >
                {data[0]?.exchangeRate || ""}
              </p>
            </td>
          </tr> */}
        </table>

        {/* Second Table */}
        <table
          style={{
            width: "50%",
            borderCollapse: "collapse",
            border: "1px solid black", // âœ… outer border only
          }}
        >
          <tr>
            <td
              className="pl-1 pr-1 pb-0"
              style={{ width: "30%", verticalAlign: "top" }}
            >
              <p
                className="text-left text-black font-bold pt-0.5 pb-0.5"
                style={{ fontSize: "9px", color: "black" }}
              >
                Invoice No:
              </p>
            </td>
            <td
              className="pl-1 pr-1 pb-0"
              style={{ width: "70%", verticalAlign: "top" }}
            >
              <p
                className="text-left text-black pt-0.5 pb-0.5"
                style={{ fontSize: "9px", color: "black" }}
              >
                {data[0]?.invoiceNo || ""}
              </p>
            </td>
          </tr>
          <tr>
            <td
              className="pl-1 pr-1 pb-0"
              style={{ width: "30%", verticalAlign: "top" }}
            >
              <p
                className="text-left text-black font-bold pt-0.5 pb-0.5"
                style={{ fontSize: "9px", color: "black" }}
              >
                Invoice Date:
              </p>
            </td>
            <td
              className="pl-1 pr-1 pb-0"
              style={{ width: "70%", verticalAlign: "top" }}
            >
              <p
                className="text-left text-black pt-0.5 pb-0.5"
                style={{ fontSize: "9px", color: "black" }}
              >
                {data[0]?.invoiceDate || ""}
              </p>
            </td>
          </tr>

          <tr>
            <td
              className="pl-1 pr-1 pb-0"
              style={{ width: "30%", verticalAlign: "top" }}
            >
              <p
                className="text-left text-black font-bold pt-0.5 pb-0.5"
                style={{ fontSize: "9px", color: "black" }}
              >
                B/L Number:
              </p>
            </td>
            <td
              className="pl-1 pr-1 pb-0"
              style={{ width: "70%", verticalAlign: "top" }}
            >
              <p
                className="text-left text-black pt-0.5 pb-0.5"
                style={{ fontSize: "9px", color: "black" }}
              >
                {data[0]?.mblNo || data[0]?.hblNo || ""}
              </p>
            </td>
          </tr>

          <tr>
            <td
              className="pl-1 pr-1 pb-0"
              style={{ width: "30%", verticalAlign: "top" }}
            >
              <p
                className="text-left text-black font-bold pt-0.5 pb-0.5"
                style={{ fontSize: "9px", color: "black" }}
              >
                Vessel / Voyage No:
              </p>
            </td>
            <td
              className="pl-1 pr-1 pb-0"
              style={{ width: "70%", verticalAlign: "top" }}
            >
              <p
                className="text-left text-black pt-0.5 pb-0.5"
                style={{ fontSize: "9px", color: "black" }}
              >
                {data[0]?.vessel || ""}
                {" / "}
                {data[0]?.voyageNo || ""}
              </p>
            </td>
          </tr>

          <tr>
            <td
              className="pl-1 pr-1 pb-0"
              style={{ width: "30%", verticalAlign: "top" }}
            >
              <p
                className="text-left text-black font-bold pt-0.5 pb-0.5"
                style={{ fontSize: "9px", color: "black" }}
              >
                POL:
              </p>
            </td>
            <td
              className="pl-1 pr-1 pb-0"
              style={{ width: "70%", verticalAlign: "top" }}
            >
              <p
                className="text-left text-black pt-0.5 pb-0.5"
                style={{ fontSize: "9px", color: "black" }}
              >
                {data[0]?.pol || ""}
              </p>
            </td>
          </tr>

          <tr>
            <td
              className="pl-1 pr-1 pb-0"
              style={{ width: "30%", verticalAlign: "top" }}
            >
              <p
                className="text-left text-black font-bold pt-0.5 pb-0.5"
                style={{ fontSize: "9px", color: "black" }}
              >
                POD:
              </p>
            </td>
            <td
              className="pl-1 pr-1 pb-0"
              style={{ width: "70%", verticalAlign: "top" }}
            >
              <p
                className="text-left text-black pt-0.5 pb-0.5"
                style={{ fontSize: "9px", color: "black" }}
              >
                {data[0]?.pod || ""}
              </p>
            </td>
          </tr>

          <tr>
            <td
              className="pl-1 pr-1 pb-0"
              style={{ width: "30%", verticalAlign: "top" }}
            >
              <p
                className="text-left text-black font-bold pt-0.5 pb-0.5"
                style={{ fontSize: "9px", color: "black" }}
              >
                Destination:
              </p>
            </td>
            <td
              className="pl-1 pr-1 pb-0"
              style={{ width: "70%", verticalAlign: "top" }}
            >
              <p
                className="text-left text-black pt-0.5 pb-0.5"
                style={{ fontSize: "9px", color: "black" }}
              >
                {data[0]?.fpd || ""}
              </p>
            </td>
          </tr>

          <tr>
            <td
              className="pl-1 pr-1 pb-0"
              style={{ width: "30%", verticalAlign: "top" }}
            >
              <p
                className="text-left text-black font-bold pt-0.5 pb-0.5"
                style={{ fontSize: "9px", color: "black" }}
              >
                Manifest / Reg No:
              </p>
            </td>
            <td
              className="pl-1 pr-1 pb-0"
              style={{ width: "70%", verticalAlign: "top" }}
            >
              <p
                className="text-left text-black pt-0.5 pb-0.5"
                style={{ fontSize: "9px", color: "black" }}
              >
                {data[0]?.igmNo || ""}
              </p>
            </td>
          </tr>

          <tr>
            <td
              className="pl-1 pr-1 pb-0"
              style={{ width: "30%", verticalAlign: "top" }}
            >
              <p
                className="text-left text-black font-bold pt-0.5 pb-0.5"
                style={{ fontSize: "9px", color: "black" }}
              >
                ETA:
              </p>
            </td>
            <td
              className="pl-1 pr-1 pb-0"
              style={{ width: "70%", verticalAlign: "top" }}
            >
              <p
                className="text-left text-black pt-0.5 pb-0.5"
                style={{ fontSize: "9px", color: "black" }}
              >
                {data[0]?.arrivalDate || ""}
              </p>
            </td>
          </tr>
        </table>
      </div>
    );
  };

  const HeadingGridYms = ({}) => {
    const containerDetails = data[0]?.tblInvoiceCharge;

    // One function: build "count X size+type" label(s) using `type` (not typeCode)
    const buildQtyLabel = (rows = []) => {
      if (!Array.isArray(rows) || rows.length === 0) return "";

      const combos = new Map();

      for (const r of rows) {
        const size = String(r?.size ?? r?.sizeId ?? "").trim();
        if (!size) continue;

        // Use TYPE (string) exactly; normalize spacing/case
        const typeStrRaw = typeof r?.type === "string" ? r.type : "";
        const typeStr = typeStrRaw.trim().toUpperCase(); // e.g., "HIGH CUBE" | "" (blank)

        const key = `${size}|${typeStr}`;
        if (!combos.has(key)) {
          // presence-based count (avoids double-counting per-charge duplicates)
          combos.set(key, { size, typeStr, count: 1 });

          // ↳ If you prefer summing qty instead:
          // const q = Number(r?.qty) || 1;
          // combos.set(key, { size, typeStr, count: q });
        } else {
          // presence-based increment:
          const c = combos.get(key);
          c.count += 1;

          // ↳ For qty-based counting instead:
          // c.count += (Number(r?.qty) || 1);
        }
      }

      // Sort: by numeric size then by type
      const sorted = Array.from(combos.values()).sort((a, b) => {
        const nsA = Number(a.size) || 0;
        const nsB = Number(b.size) || 0;
        if (nsA !== nsB) return nsA - nsB;
        return a.typeStr.localeCompare(b.typeStr);
      });

      // Format: "1 X 20HIGH CUBE", "3 X 40", ...
      return sorted
        .map(
          ({ count, size, typeStr }) =>
            `${count} X ${size}${" "}${typeStr ? typeStr : ""}`,
        )
        .join(", ");
    };

    const qtyLabel = buildQtyLabel(containerDetails);
    console.log("qtyLabel", qtyLabel);
    console.log("containerDetails", containerDetails);
    return (
      <div className="flex">
        {/* First Table */}
        <table
          style={{
            width: "50%",
            borderCollapse: "collapse",
            borderLeft: "1px solid black",
            borderBottom: "1px solid black",
            borderTop: "1px solid black",
          }}
        >
          {/* First row spans 4 rows */}
          <tr>
            <td
              className="pl-1 pr-1 pb-0"
              style={{ width: "30%", verticalAlign: "top" }}
              rowSpan={4}
            >
              {/* ~4 normal rows: 13â€“14px each -> ~52â€“56px */}
              <div style={{ minHeight: "110px" }}>
                <p
                  className="text-left text-black font-bold pt-0.5 pb-0.5"
                  style={{ fontSize: "9px", color: "black" }}
                >
                  Invoice to
                </p>
              </div>
            </td>
            <td
              className="pl-1 pr-1 pb-0"
              style={{ width: "70%", verticalAlign: "top" }}
              rowSpan={4}
            >
              <div style={{ minHeight: "110px" }}>
                <p
                  className="text-left text-black pt-0.5 pb-0.5"
                  style={{ fontSize: "9px", color: "black" }}
                >
                  {data[0]?.party || ""}
                  <br />
                  {data[0]?.billingPartyAddress || ""}
                </p>
              </div>
            </td>
          </tr>

          {/* placeholder rows covered by the rowspan (no cells allowed here) */}
          <tr aria-hidden="true"></tr>
          <tr aria-hidden="true"></tr>
          <tr aria-hidden="true"></tr>

          {/* Normal rows continue below */}
          <tr>
            <td
              className="pl-1 pr-1 pb-0"
              style={{ width: "30%", verticalAlign: "top" }}
            >
              <p
                className="text-left text-black font-bold pt-0.5 pb-0.5"
                style={{ fontSize: "9px", color: "black" }}
              >
                PIN No:
              </p>
            </td>
            <td
              className="pl-1 pr-1 pb-0"
              style={{ width: "70%", verticalAlign: "top" }}
            >
              <p
                className="text-left text-black pt-0.5 pb-0.5"
                style={{ fontSize: "9px", color: "black" }}
              >
                {data[0]?.billingPartyVAT || ""}
              </p>
            </td>
          </tr>

          <tr>
            <td
              className="pl-1 pr-1 pb-0"
              style={{ width: "30%", verticalAlign: "top" }}
            >
              <p
                className="text-left text-black font-bold pt-0.5 pb-0.5"
                style={{ fontSize: "9px", color: "black" }}
              >
                QTY :
              </p>
            </td>
            <td
              className="pl-1 pr-1 pb-0"
              style={{ width: "70%", verticalAlign: "top" }}
            >
              <p
                className="text-left text-black pt-0.5 pb-0.5"
                style={{ fontSize: "9px", color: "black" }}
              >
                {data[0]?.sizeTypeContainer || ""}
              </p>
            </td>
          </tr>

          <tr>
            <td
              className="pl-1 pr-1 pb-0"
              style={{ width: "30%", verticalAlign: "top" }}
            >
              <p
                className="text-left text-black font-bold pt-0.5 pb-0.5"
                style={{ fontSize: "9px", color: "black" }}
              >
                EXCHANGE RATE:
              </p>
            </td>
            <td
              className="pl-1 pr-1 pb-0"
              style={{ width: "70%", verticalAlign: "top" }}
            >
              <p
                className="text-left text-black pt-0.5 pb-0.5"
                style={{ fontSize: "9px", color: "black" }}
              >
                {data[0]?.exchangeRate || ""}
              </p>
            </td>
          </tr>
        </table>

        {/* Second Table */}
        <table
          style={{
            width: "50%",
            borderCollapse: "collapse",
            border: "1px solid black", // âœ… outer border only
          }}
        >
          <tr>
            <td
              className="pl-1 pr-1 pb-0"
              style={{ width: "30%", verticalAlign: "top" }}
            >
              <p
                className="text-left text-black font-bold pt-0.5 pb-0.5"
                style={{ fontSize: "9px", color: "black" }}
              >
                Invoice No:
              </p>
            </td>
            <td
              className="pl-1 pr-1 pb-0"
              style={{ width: "70%", verticalAlign: "top" }}
            >
              <p
                className="text-left text-black pt-0.5 pb-0.5"
                style={{ fontSize: "9px", color: "black" }}
              >
                {data[0]?.invoiceNo || ""}
              </p>
            </td>
          </tr>
          <tr>
            <td
              className="pl-1 pr-1 pb-0"
              style={{ width: "30%", verticalAlign: "top" }}
            >
              <p
                className="text-left text-black font-bold pt-0.5 pb-0.5"
                style={{ fontSize: "9px", color: "black" }}
              >
                Invoice Date:
              </p>
            </td>
            <td
              className="pl-1 pr-1 pb-0"
              style={{ width: "70%", verticalAlign: "top" }}
            >
              <p
                className="text-left text-black pt-0.5 pb-0.5"
                style={{ fontSize: "9px", color: "black" }}
              >
                {data[0]?.invoiceDate || ""}
              </p>
            </td>
          </tr>

          <tr>
            <td
              className="pl-1 pr-1 pb-0"
              style={{ width: "30%", verticalAlign: "top" }}
            >
              <p
                className="text-left text-black font-bold pt-0.5 pb-0.5"
                style={{ fontSize: "9px", color: "black" }}
              >
                B/L Number:
              </p>
            </td>
            <td
              className="pl-1 pr-1 pb-0"
              style={{ width: "70%", verticalAlign: "top" }}
            >
              <p
                className="text-left text-black pt-0.5 pb-0.5"
                style={{ fontSize: "9px", color: "black" }}
              >
                {data[0]?.mblNo || data[0]?.hblNo || ""}
              </p>
            </td>
          </tr>

          <tr>
            <td
              className="pl-1 pr-1 pb-0"
              style={{ width: "30%", verticalAlign: "top" }}
            >
              <p
                className="text-left text-black font-bold pt-0.5 pb-0.5"
                style={{ fontSize: "9px", color: "black" }}
              >
                Vessel / Voyage No:
              </p>
            </td>
            <td
              className="pl-1 pr-1 pb-0"
              style={{ width: "70%", verticalAlign: "top" }}
            >
              <p
                className="text-left text-black pt-0.5 pb-0.5"
                style={{ fontSize: "9px", color: "black" }}
              >
                {data[0]?.vessel || ""}
                {" / "}
                {data[0]?.voyageNo || ""}
              </p>
            </td>
          </tr>

          <tr>
            <td
              className="pl-1 pr-1 pb-0"
              style={{ width: "30%", verticalAlign: "top" }}
            >
              <p
                className="text-left text-black font-bold pt-0.5 pb-0.5"
                style={{ fontSize: "9px", color: "black" }}
              >
                POL:
              </p>
            </td>
            <td
              className="pl-1 pr-1 pb-0"
              style={{ width: "70%", verticalAlign: "top" }}
            >
              <p
                className="text-left text-black pt-0.5 pb-0.5"
                style={{ fontSize: "9px", color: "black" }}
              >
                {data[0]?.pol || ""}
              </p>
            </td>
          </tr>

          <tr>
            <td
              className="pl-1 pr-1 pb-0"
              style={{ width: "30%", verticalAlign: "top" }}
            >
              <p
                className="text-left text-black font-bold pt-0.5 pb-0.5"
                style={{ fontSize: "9px", color: "black" }}
              >
                POD:
              </p>
            </td>
            <td
              className="pl-1 pr-1 pb-0"
              style={{ width: "70%", verticalAlign: "top" }}
            >
              <p
                className="text-left text-black pt-0.5 pb-0.5"
                style={{ fontSize: "9px", color: "black" }}
              >
                {data[0]?.pod || ""}
              </p>
            </td>
          </tr>

          <tr>
            <td
              className="pl-1 pr-1 pb-0"
              style={{ width: "30%", verticalAlign: "top" }}
            >
              <p
                className="text-left text-black font-bold pt-0.5 pb-0.5"
                style={{ fontSize: "9px", color: "black" }}
              >
                Destination:
              </p>
            </td>
            <td
              className="pl-1 pr-1 pb-0"
              style={{ width: "70%", verticalAlign: "top" }}
            >
              <p
                className="text-left text-black pt-0.5 pb-0.5"
                style={{ fontSize: "9px", color: "black" }}
              >
                {data[0]?.fpd || ""}
              </p>
            </td>
          </tr>

          {/* <tr>
            <td
              className="pl-1 pr-1 pb-0"
              style={{ width: "30%", verticalAlign: "top" }}
            >
              <p
                className="text-left text-black font-bold pt-0.5 pb-0.5"
                style={{ fontSize: "9px", color: "black" }}
              >
                Manifest / Reg No:
              </p>
            </td>
            <td
              className="pl-1 pr-1 pb-0"
              style={{ width: "70%", verticalAlign: "top" }}
            >
              <p
                className="text-left text-black pt-0.5 pb-0.5"
                style={{ fontSize: "9px", color: "black" }}
              >
                {data[0]?.igmNo || ""}
              </p>
            </td>
          </tr> */}

          <tr>
            <td
              className="pl-1 pr-1 pb-0"
              style={{ width: "30%", verticalAlign: "top" }}
            >
              <p
                className="text-left text-black font-bold pt-0.5 pb-0.5"
                style={{ fontSize: "9px", color: "black" }}
              >
                ETA:
              </p>
            </td>
            <td
              className="pl-1 pr-1 pb-0"
              style={{ width: "70%", verticalAlign: "top" }}
            >
              <p
                className="text-left text-black pt-0.5 pb-0.5"
                style={{ fontSize: "9px", color: "black" }}
              >
                {data[0]?.arrivalDate || ""}
              </p>
            </td>
          </tr>
        </table>
      </div>
    );
  };

  const SalesHeadingGridYms = ({}) => {
    const containerDetails = data[0]?.tblInvoiceCharge;

    // One function: build "count X size+type" label(s) using `type` (not typeCode)
    const buildQtyLabel = (rows = []) => {
      if (!Array.isArray(rows) || rows.length === 0) return "";

      const combos = new Map();

      for (const r of rows) {
        const size = String(r?.size ?? r?.sizeId ?? "").trim();
        if (!size) continue;

        // Use TYPE (string) exactly; normalize spacing/case
        const typeStrRaw = typeof r?.type === "string" ? r.type : "";
        const typeStr = typeStrRaw.trim().toUpperCase(); // e.g., "HIGH CUBE" | "" (blank)

        const key = `${size}|${typeStr}`;
        if (!combos.has(key)) {
          // presence-based count (avoids double-counting per-charge duplicates)
          combos.set(key, { size, typeStr, count: 1 });

          // ↳ If you prefer summing qty instead:
          // const q = Number(r?.qty) || 1;
          // combos.set(key, { size, typeStr, count: q });
        } else {
          // presence-based increment:
          const c = combos.get(key);
          c.count += 1;

          // ↳ For qty-based counting instead:
          // c.count += (Number(r?.qty) || 1);
        }
      }

      // Sort: by numeric size then by type
      const sorted = Array.from(combos.values()).sort((a, b) => {
        const nsA = Number(a.size) || 0;
        const nsB = Number(b.size) || 0;
        if (nsA !== nsB) return nsA - nsB;
        return a.typeStr.localeCompare(b.typeStr);
      });

      // Format: "1 X 20HIGH CUBE", "3 X 40", ...
      return sorted
        .map(
          ({ count, size, typeStr }) =>
            `${count} X ${size}${" "}${typeStr ? typeStr : ""}`,
        )
        .join(", ");
    };

    const qtyLabel = buildQtyLabel(containerDetails);
    console.log("qtyLabel", qtyLabel);
    console.log("containerDetails", containerDetails);
    return (
      <div className="flex">
        {/* First Table */}
        <table
          style={{
            width: "50%",
            borderCollapse: "collapse",
            borderLeft: "1px solid black",
            borderBottom: "1px solid black",
            borderTop: "1px solid black",
          }}
        >
          <tr>
            <td
              className="pl-1 pr-1 pb-0"
              style={{ width: "30%", verticalAlign: "top" }}
            >
              <p
                className="text-left text-black font-bold pt-0.5 pb-0.5"
                style={{ fontSize: "9px", color: "black" }}
              >
                Customer
              </p>
            </td>
            <td
              className="pl-1 pr-1 pb-0"
              style={{ width: "70%", verticalAlign: "top" }}
            >
              <p
                className="text-left text-black pt-0.5 pb-0.5"
                style={{ fontSize: "9px", color: "black" }}
              >
                {/* : {data?.[0]?.billingPartyCompany || ""} */}
              </p>
            </td>
          </tr>

          <tr>
            <td
              className="pl-1 pr-1 pb-0"
              style={{ width: "30%", verticalAlign: "top" }}
            >
              <p
                className="text-left text-black font-bold pt-0.5 pb-0.5"
                style={{ fontSize: "9px", color: "black" }}
              >
                Shipper Name
              </p>
            </td>
            <td
              className="pl-1 pr-1 pb-0"
              style={{ width: "70%", verticalAlign: "top" }}
            >
              <p
                className="text-left text-black pt-0.5 pb-0.5"
                style={{ fontSize: "9px", color: "black" }}
              >
                {/* change this */}: {data?.[0]?.blShipperName || ""}
              </p>
            </td>
          </tr>

          <tr>
            <td
              className="pl-1 pr-1 pb-0"
              style={{ width: "30%", verticalAlign: "top" }}
            >
              <p
                className="text-left text-black font-bold pt-0.5 pb-0.5"
                style={{ fontSize: "9px", color: "black" }}
              >
                Consignee Name
              </p>
            </td>
            <td
              className="pl-1 pr-1 pb-0"
              style={{ width: "70%", verticalAlign: "top" }}
            >
              <p
                className="text-left text-black pt-0.5 pb-0.5"
                style={{ fontSize: "9px", color: "black" }}
              >
                {/* change this */}: {data[0]?.blConsigneeName}
              </p>
            </td>
          </tr>

          <tr>
            <td
              className="pl-1 pr-1 pb-0"
              style={{ width: "30%", verticalAlign: "top" }}
            >
              <p
                className="text-left text-black font-bold pt-0.5 pb-0.5"
                style={{ fontSize: "9px", color: "black" }}
              >
                Shipper Ref. No.
              </p>
            </td>
            <td
              className="pl-1 pr-1 pb-0"
              style={{ width: "70%", verticalAlign: "top" }}
            >
              <p
                className="text-left text-black pt-0.5 pb-0.5"
                style={{ fontSize: "9px", color: "black" }}
              >
                {/* change this */}: {data?.[0]?.shipperRefNo || ""}
              </p>
            </td>
          </tr>

          <tr>
            <td
              className="pl-1 pr-1 pb-0"
              style={{ width: "30%", verticalAlign: "top" }}
            >
              <p
                className="text-left text-black font-bold pt-0.5 pb-0.5"
                style={{ fontSize: "9px", color: "black" }}
              >
                OBL No.
              </p>
            </td>
            <td
              className="pl-1 pr-1 pb-0"
              style={{ width: "70%", verticalAlign: "top" }}
            >
              <p
                className="text-left text-black pt-0.5 pb-0.5"
                style={{ fontSize: "9px", color: "black" }}
              >
                {/* change this */}: {data?.[0]?.oblNo || ""}
              </p>
            </td>
          </tr>

          <tr>
            <td
              className="pl-1 pr-1 pb-0"
              style={{ width: "30%", verticalAlign: "top" }}
            >
              <p
                className="text-left text-black font-bold pt-0.5 pb-0.5"
                style={{ fontSize: "9px", color: "black" }}
              >
                HBL No.
              </p>
            </td>
            <td
              className="pl-1 pr-1 pb-0"
              style={{ width: "70%", verticalAlign: "top" }}
            >
              <p
                className="text-left text-black pt-0.5 pb-0.5"
                style={{ fontSize: "9px", color: "black" }}
              >
                {/* change this */}: {data?.[0]?.hblNo || ""}
              </p>
            </td>
          </tr>

          <tr>
            <td
              className="pl-1 pr-1 pb-0"
              style={{ width: "30%", verticalAlign: "top" }}
            >
              <p
                className="text-left text-black font-bold pt-0.5 pb-0.5"
                style={{ fontSize: "9px", color: "black" }}
              >
                Port of Arrival
              </p>
            </td>
            <td
              className="pl-1 pr-1 pb-0"
              style={{ width: "70%", verticalAlign: "top" }}
            >
              <p
                className="text-left text-black pt-0.5 pb-0.5"
                style={{ fontSize: "9px", color: "black" }}
              >
                {/* change this */}: {data?.[0]?.blPortOfArrival || ""}
              </p>
            </td>
          </tr>

          <tr>
            <td
              className="pl-1 pr-1 pb-0"
              style={{ width: "30%", verticalAlign: "top" }}
            >
              <p
                className="text-left text-black font-bold pt-0.5 pb-0.5"
                style={{ fontSize: "9px", color: "black" }}
              >
                Port of Departure
              </p>
            </td>
            <td
              className="pl-1 pr-1 pb-0"
              style={{ width: "70%", verticalAlign: "top" }}
            >
              <p
                className="text-left text-black pt-0.5 pb-0.5"
                style={{ fontSize: "9px", color: "black" }}
              >
                {/* change this */}: {data?.[0]?.blPortOfDeparture || ""}
              </p>
            </td>
          </tr>

          <tr>
            <td
              className="pl-1 pr-1 pb-0"
              style={{ width: "30%", verticalAlign: "top" }}
            >
              <p
                className="text-left text-black font-bold pt-0.5 pb-0.5"
                style={{ fontSize: "9px", color: "black" }}
              >
                ETD
              </p>
            </td>
            <td
              className="pl-1 pr-1 pb-0"
              style={{ width: "70%", verticalAlign: "top" }}
            >
              <p
                className="text-left text-black pt-0.5 pb-0.5"
                style={{ fontSize: "9px", color: "black" }}
              >
                {/* change this */}: {data?.[0]?.blETD || ""}
              </p>
            </td>
          </tr>

          <tr>
            <td
              className="pl-1 pr-1 pb-0"
              style={{ width: "30%", verticalAlign: "top" }}
            >
              <p
                className="text-left text-black font-bold pt-0.5 pb-0.5"
                style={{ fontSize: "9px", color: "black" }}
              >
                ETA
              </p>
            </td>
            <td
              className="pl-1 pr-1 pb-0"
              style={{ width: "70%", verticalAlign: "top" }}
            >
              <p
                className="text-left text-black pt-0.5 pb-0.5"
                style={{ fontSize: "9px", color: "black" }}
              >
                {/* change this */}: {data?.[0]?.blETA || ""}
              </p>
            </td>
          </tr>

          <tr>
            <td
              className="pl-1 pr-1 pb-0"
              style={{ width: "30%", verticalAlign: "top" }}
            >
              <p
                className="text-left text-black font-bold pt-0.5 pb-0.5"
                style={{ fontSize: "9px", color: "black" }}
              >
                Vessel
              </p>
            </td>
            <td
              className="pl-1 pr-1 pb-0"
              style={{ width: "70%", verticalAlign: "top" }}
            >
              <p
                className="text-left text-black pt-0.5 pb-0.5"
                style={{ fontSize: "9px", color: "black" }}
              >
                {/* change this */}: {data?.[0]?.blVesselName || ""}
              </p>
            </td>
          </tr>

          <tr>
            <td
              className="pl-1 pr-1 pb-0"
              style={{ width: "30%", verticalAlign: "top" }}
            >
              <p
                className="text-left text-black font-bold pt-0.5 pb-0.5"
                style={{ fontSize: "9px", color: "black" }}
              >
                Voyage No
              </p>
            </td>
            <td
              className="pl-1 pr-1 pb-0"
              style={{ width: "70%", verticalAlign: "top" }}
            >
              <p
                className="text-left text-black pt-0.5 pb-0.5"
                style={{ fontSize: "9px", color: "black" }}
              >
                {/* change this */}: {data?.[0]?.blVoyageNo || ""}
              </p>
            </td>
          </tr>
        </table>

        {/* Second Table */}
        <table
          style={{
            width: "50%",
            borderCollapse: "collapse",
            border: "1px solid black", // ✅ outer border only
          }}
        >
          <tr>
            <td
              className="pl-1 pr-1 pb-0"
              style={{ width: "30%", verticalAlign: "top" }}
            >
              <p
                className="text-left text-black font-bold pt-0.5 pb-0.5"
                style={{ fontSize: "9px", color: "black" }}
              >
                Invoice No
              </p>
            </td>
            <td
              className="pl-1 pr-1 pb-0"
              style={{ width: "70%", verticalAlign: "top" }}
            >
              <p
                className="text-left text-black pt-0.5 pb-0.5"
                style={{ fontSize: "9px", color: "black" }}
              >
                : {data?.[0]?.invoiceNo || ""}
              </p>
            </td>
          </tr>

          <tr>
            <td
              className="pl-1 pr-1 pb-0"
              style={{ width: "30%", verticalAlign: "top" }}
            >
              <p
                className="text-left text-black font-bold pt-0.5 pb-0.5"
                style={{ fontSize: "9px", color: "black" }}
              >
                Invoice Date
              </p>
            </td>
            <td
              className="pl-1 pr-1 pb-0"
              style={{ width: "70%", verticalAlign: "top" }}
            >
              <p
                className="text-left text-black pt-0.5 pb-0.5"
                style={{ fontSize: "9px", color: "black" }}
              >
                {/* change this */}: {data?.[0]?.invoiceDate || ""}
              </p>
            </td>
          </tr>

          <tr>
            <td
              className="pl-1 pr-1 pb-0"
              style={{ width: "30%", verticalAlign: "top" }}
            >
              <p
                className="text-left text-black font-bold pt-0.5 pb-0.5"
                style={{ fontSize: "9px", color: "black" }}
              >
                Payment Due Date
              </p>
            </td>
            <td
              className="pl-1 pr-1 pb-0"
              style={{ width: "70%", verticalAlign: "top" }}
            >
              <p
                className="text-left text-black pt-0.5 pb-0.5"
                style={{ fontSize: "9px", color: "black" }}
              >
                {/* change this */}: {data?.[0]?.company || ""}
              </p>
            </td>
          </tr>

          <tr>
            <td
              className="pl-1 pr-1 pb-0"
              style={{ width: "30%", verticalAlign: "top" }}
            >
              <p
                className="text-left text-black font-bold pt-0.5 pb-0.5"
                style={{ fontSize: "9px", color: "black" }}
              >
                Job No.
              </p>
            </td>
            <td
              className="pl-1 pr-1 pb-0"
              style={{ width: "70%", verticalAlign: "top" }}
              s
            >
              <p
                className="text-left text-black pt-0.5 pb-0.5"
                style={{ fontSize: "9px", color: "black" }}
              >
                {/* change this */}: {data?.[0]?.jobNo || ""}
              </p>
            </td>
          </tr>

          <tr>
            <td
              className="pl-1 pr-1 pb-0"
              style={{ width: "30%", verticalAlign: "top" }}
            >
              <p
                className="text-left text-black font-bold pt-0.5 pb-0.5"
                style={{ fontSize: "9px", color: "black" }}
              >
                VAT Number
              </p>
            </td>
            <td
              className="pl-1 pr-1 pb-0"
              style={{ width: "70%", verticalAlign: "top" }}
            >
              <p
                className="text-left text-black pt-0.5 pb-0.5"
                style={{ fontSize: "9px", color: "black" }}
              >
                {/* change this */}: {data[0]?.companyVAT}
              </p>
            </td>
          </tr>

          <tr>
            <td
              className="pl-1 pr-1 pb-0"
              style={{ width: "30%", verticalAlign: "top" }}
            >
              <p
                className="text-left text-black font-bold pt-0.5 pb-0.5"
                style={{ fontSize: "9px", color: "black" }}
              >
                Chargeable Weight
              </p>
            </td>
            <td
              className="pl-1 pr-1 pb-0"
              style={{ width: "70%", verticalAlign: "top" }}
            >
              <p
                className="text-left text-black pt-0.5 pb-0.5"
                style={{ fontSize: "9px", color: "black" }}
              >
                {/* change this */}: {data?.[0]?.volumeNo || ""}{" "}
                {data?.[0]?.jobVolumneUnit || ""}
              </p>
            </td>
          </tr>

          <tr>
            <td
              className="pl-1 pr-1 pb-0"
              style={{ width: "30%", verticalAlign: "top" }}
            >
              <p
                className="text-left text-black font-bold pt-0.5 pb-0.5"
                style={{ fontSize: "9px", color: "black" }}
              >
                Package
              </p>
            </td>
            <td
              className="pl-1 pr-1 pb-0"
              style={{ width: "70%", verticalAlign: "top" }}
            >
              <p
                className="text-left text-black pt-0.5 pb-0.5"
                style={{ fontSize: "9px", color: "black" }}
              >
                {/* change this */}: {data[0]?.noOfPackages || ""}{" "}
                {data[0]?.packagingTypeCode || ""}
              </p>
            </td>
          </tr>

          <tr>
            <td
              className="pl-1 pr-1 pb-0"
              style={{ width: "30%", verticalAlign: "top" }}
            >
              <p
                className="text-left text-black font-bold pt-0.5 pb-0.5"
                style={{ fontSize: "9px", color: "black" }}
              >
                Commodity
              </p>
            </td>
            <td
              className="pl-1 pr-1 pb-0"
              style={{ width: "70%", verticalAlign: "top" }}
            >
              <p
                className="text-left text-black pt-0.5 pb-0.5"
                style={{ fontSize: "9px", color: "black" }}
              >
                {/* change this */}: {data?.[0]?.commodity || ""}
              </p>
            </td>
          </tr>

          <tr>
            <td
              className="pl-1 pr-1 pb-0"
              style={{ width: "30%", verticalAlign: "top" }}
            >
              <p
                className="text-left text-black font-bold pt-0.5 pb-0.5"
                style={{ fontSize: "9px", color: "black" }}
              >
                Note
              </p>
            </td>
            <td
              className="pl-1 pr-1 pb-0"
              style={{ width: "70%", verticalAlign: "top" }}
            >
              <p
                className="text-left text-black pt-0.5 pb-0.5"
                style={{ fontSize: "9px", color: "black" }}
              >
                {/* change this */}: {data?.[0]?.remarks || ""}
              </p>
            </td>
          </tr>
        </table>
      </div>
    );
  };

  const BankDetailsGrid = ({}) => {
    const banks = data[0]?.tblInvoiceBank ?? []; // or just use your array directly

    const hasValue = (v) =>
      typeof v === "number" ? true : !!String(v ?? "").trim();

    if (!banks.length) {
      return (
        <div
          style={{ fontSize: "9px", color: "black", width: "100%" }}
          className="text-[10px] text-gray-600"
        >
          No bank details available.
        </div>
      );
    }

    const getRows = (b) => [
      { label: "Bank Name", value: b?.bankName },
      { label: "Bank Account No", value: b?.accountNo ?? b?.bankAccountNo },
      { label: "Bank Address", value: b?.bankAddress },
      { label: "SWIFT Code", value: b?.swiftCode },
      { label: "Currency", value: b?.bankCurrency ?? b?.currency },
      { label: "Mpesa Paybill", value: b?.ifscCode },
    ];

    return (
      <>
        <div>
          <p
            className="text-left text-black font-bold pb-1 pt-1 pb-0 pl-1 pr-1 border-black border-b border-l border-r underline"
            style={{ fontSize: "9px", color: "black", width: "100%" }}
          >
            Bank Details
          </p>
        </div>
        <div>
          <p
            className="text-left text-black font-bold pb-0 pl-1 pr-1 border-b border-l border-r border-black"
            style={{ fontSize: "10px", color: "black", width: "100%" }}
          >
            Beneficiary Name: <span>{data[0]?.company || ""}</span>
          </p>
        </div>

        <div
          style={{ width: "100%", display: "flex", flexDirection: "row" }}
          className="border-black border-b border-l"
        >
          {banks.map((b, idx) => {
            // const isLast = idx === banks.length - 1;
            const isLast = false;
            // filter empty rows first
            let rows = getRows(b).filter((r) => hasValue(r.value));

            // for the last table, drop the Currency row
            if (isLast) {
              rows = rows.filter((r) => r.label !== "Currencys");
            }

            // skip entirely if nothing to show
            if (!rows.length) return null;

            return (
              <div
                key={idx}
                style={{ width: `${100 / banks?.length}%`, minWidth: 0 }}
                className={`print:break-inside-avoid border-black ${
                  isLast ? "" : "border-r"
                }`}
              >
                <table
                  className="w-full text-[10px] text-black border-collapse"
                  style={{ fontSize: "9px" }}
                >
                  <tbody>
                    {rows.map(({ label, value }) => (
                      <tr key={label}>
                        {/* hide label cell only for the last table */}
                        {!isLast && (
                          <td
                            className="font-bold align-top p-1 whitespace-nowrap"
                            style={{ fontSize: "9px" }}
                          >
                            {label}:
                          </td>
                        )}
                        <td
                          // className=${p-1 break-words text-center}`
                          className={`p-1 break-words ${
                            isLast ? "text-center" : ""
                          }`}
                          style={{ fontSize: "9px" }}
                          colSpan={isLast ? 2 : 1}
                        >
                          {value}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            );
          })}
        </div>
      </>
    );
  };

  const SalesBankDetailsGrid = ({}) => {
    const banks = data[0]?.tblInvoiceBank ?? [];

    const hasValue = (v) =>
      typeof v === "number" ? true : !!String(v ?? "").trim();

    if (!banks.length) {
      return (
        <div
          style={{ fontSize: "9px", color: "black", width: "100%" }}
          className="text-[10px] text-gray-600"
        >
          No bank details available.
        </div>
      );
    }

    // ✅ Only one bank (first)
    const b = banks[0];

    const rows = [
      { label: "Bank Name", value: b?.bankName },
      { label: "Bank Account No", value: b?.accountNo ?? b?.bankAccountNo },
      { label: "Bank Address", value: b?.bankAddress },
      { label: "SWIFT Code", value: b?.swiftCode },
      { label: "Currency", value: b?.bankCurrency ?? b?.currency },
      { label: "Mpesa Paybill", value: b?.ifscCode },
    ].filter((r) => hasValue(r.value));

    if (!rows.length) {
      return (
        <div
          style={{ fontSize: "9px", color: "black", width: "100%" }}
          className="text-[10px] text-gray-600"
        >
          No bank details available.
        </div>
      );
    }

    return (
      <>
        <div>
          <p
            className="text-left text-black font-bold pt-1 pl-1 pr-1 border-black border-b border-l border-r underline"
            style={{ fontSize: "9px", color: "black", width: "100%" }}
          >
            Bank Details
          </p>
        </div>

        <div>
          <p
            className="text-left text-black font-bold pl-1 pr-1 border-b border-l border-r border-black"
            style={{
              fontSize: "10px",
              color: "black",
              width: "100%",
              paddingTop: "2px",
              paddingBottom: "2px",
              lineHeight: "1.1",
            }}
          >
            Beneficiary Name: <span>{data[0]?.company || ""}</span>
          </p>
        </div>

        {/* ✅ Single bank, less gap between label/value columns */}
        <div
          className="border-black border-b border-l border-r"
          style={{ width: "100%" }}
        >
          <table
            className="w-full text-black border-collapse"
            style={{
              fontSize: "9px",
              tableLayout: "fixed", // ✅ makes col widths obey colgroup
            }}
          >
            <colgroup>
              {/* ✅ reduce label column width */}
              <col style={{ width: "15%" }} />
              <col style={{ width: "85%" }} />
            </colgroup>

            <tbody>
              {rows.map(({ label, value }) => (
                <tr key={label}>
                  <td
                    className="font-bold align-top"
                    style={{
                      fontSize: "9px",
                      padding: "2px 4px", // ✅ tighter padding
                      whiteSpace: "normal", // ✅ avoids large blank gap
                      lineHeight: "1.1", // ✅ tighter rows
                      verticalAlign: "top",
                    }}
                  >
                    {label}:
                  </td>

                  <td
                    style={{
                      fontSize: "9px",
                      padding: "2px 4px", // ✅ tighter padding
                      lineHeight: "1.1",
                      wordBreak: "break-word",
                      overflowWrap: "anywhere",
                      verticalAlign: "top",
                    }}
                  >
                    {value}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </>
    );
  };

  const TermsAndConditionGrid = () => {
    return (
      <>
        <div>
          <p
            className="text-left text-black font-bold pt-1 pb-1 pl-1 pr-1 border-l border-r border-black"
            style={{ fontSize: "9px", color: "black", width: "100%" }}
          >
            Invoice Terms & Conditions
          </p>
        </div>
        <div>
          <p
            className="text-left text-black  pl-1 pr-1 border-l border-r border-black"
            style={{ fontSize: "8px", color: "black", width: "100%" }}
          >
            - The exchange rate is based on the date the invoice is issued and
            may be subject to change.
          </p>
          <p
            className="text-left text-black pl-1 pr-1 border-l border-r border-black"
            style={{ fontSize: "8px", color: "black", width: "100%" }}
          >
            - Freight and other charges are shown for reference only. For more
            information, kindly contact our office.
          </p>
          <p
            className="text-left text-black pl-1 pr-1 border-l border-r border-black"
            style={{ fontSize: "8px", color: "black", width: "100%" }}
          >
            - All cheques and banker’s drafts MUST be payable to “SEALEAD
            SHIPPING AGENCY KENYA LIMITED”.
          </p>
          <p
            className="text-left text-black pl-1 pr-1 border-l border-r border-black"
            style={{ fontSize: "8px", color: "black", width: "100%" }}
          >
            - Personal cheques are NOT accepted. Kindly deposit all cash
            payments, banker’s drafts, or remittances to our bank account using
            the details provided.
          </p>
          <p
            className="text-left text-black pl-1 pr-1 border-l border-r border-black"
            style={{ fontSize: "8px", color: "black", width: "100%" }}
          >
            - A penalty of USD 50 will be charged for each bounced cheque
            deposited into our account.
          </p>
          <p
            className="text-left text-black pl-1 pr-1 border-l border-r border-black"
            style={{ fontSize: "8px", color: "black", width: "100%" }}
          >
            - Any additional costs or commissions arising from payments made via
            RTGS or cheques shall be borne by the customer.
          </p>
          <p
            className="text-left text-black pl-1 pr-1 pb-1 border-b border-l border-r border-black"
            style={{ fontSize: "8px", color: "black", width: "100%" }}
          >
            - All enquiries regarding free days, demurrage, Delivery Order
            requirements/charges, or EDO mapping should be addressed to &nbsp;
            <a
              href="mailto:generalenquiries@sea-lead.com"
              className="underline"
            >
              generalenquiries@sea-lead.com
            </a>
          </p>
        </div>
      </>
    );
  };

  const SalesTermsAndConditionGrid = () => {
    return (
      <>
        <div>
          <p
            className="text-right text-black font-bold pt-1 pb-1 pl-1 pr-1 border-l border-r border-black"
            style={{ fontSize: "10px", color: "black", width: "100%" }}
          >
            {data[0]?.company || ""}
          </p>
        </div>
        <div className="font-bold">
          <p
            className="text-left text-black  pl-1 pr-1 border-l border-r border-black"
            style={{ fontSize: "9px", color: "black", width: "100%" }}
          >
            Cheques/DD should be made out to YMS INTERNATIONAL LOGISTICS LLC &
            crossed A/C payee.
          </p>
          <p
            className="text-left text-black pl-1 pr-1 border-l border-r border-black"
            style={{ fontSize: "9px", color: "black", width: "100%" }}
          >
            The company is not responsible for any cash settlement without an
            official receipt.
          </p>
          <p
            className="text-left text-black pl-1 pr-1 pb-1 border-b border-l border-r border-black"
            style={{ fontSize: "9px", color: "black", width: "100%" }}
          >
            Any discrepancy should be notified to us in writing within 4 days
            from the invoice date after which NONE will be accepted.
          </p>
        </div>
      </>
    );
  };

  const InvoiceSlsk = ({ data, rows, fullData }) => (
    <>
      <div>
        <CompanyImgModuleInvoice />
        <DynamicHeaderData data={fullData} />
        <HeadingGrid />
        <ChargeGrid
          data={rows}
          rows={
            data &&
            data[0]?.tblInvoiceCharge?.length > 0 &&
            data[0]?.tblInvoiceCharge
          }
          fullData={fullData}
        />
        {/* <BankDetailsGrid /> */}
        <BankDetailsGrid />
        <TermsAndConditionGrid />
      </div>
    </>
  );

  const InvoiceYms = ({ data, rows, fullData }) => (
    <>
      <div>
        <CompanyImgModuleInvoice />
        <DynamicHeaderData data={fullData} />
        <HeadingGridYms />
        <ChargeGridYms
          data={rows}
          rows={
            data &&
            data[0]?.tblInvoiceCharge?.length > 0 &&
            data[0]?.tblInvoiceCharge
          }
          fullData={fullData}
        />
        {/* <BankDetailsGrid /> */}
        <BankDetailsGrid />
        <TermsAndConditionGrid />
      </div>
    </>
  );

  const SalesInvoiceYms = ({ data, rows, fullData }) => (
    <>
      <div>
        <CompanyImgModuleInvoice />
        <DynamicHeaderData data={fullData} />
        <SalesHeadingGridYms />
        <SalesChargeGridYms
          data={rows}
          rows={
            data &&
            data[0]?.tblInvoiceCharge?.length > 0 &&
            data[0]?.tblInvoiceCharge
          }
          fullData={fullData}
        />
        {/* <BankDetailsGrid /> */}

        <SalesTermsAndConditionGrid />
        <SalesBankDetailsGrid />
      </div>
    </>
  );

  const InvoiceSlskAttachSheet = ({ data, rows }) => (
    <>
      <div>
        <CompanyImgModuleInvoice />
        <HeadingGrid />
        <ChargeGridAttachment
          data={rows}
          rows={
            data &&
            data[0]?.tblInvoiceCharge?.length > 0 &&
            data[0]?.tblInvoiceCharge
          }
        />
        <div className="w-full border-black border-l border-r border-b border-t">
          <div>
            <p
              className="!text-black print:!text-black w-full text-left p-2"
              style={{ fontSize: "10px" }}
            >
              This document is non-negotiable and for{" "}
              <span className="font-bold">
                KPA and Empty Depot reference only
              </span>{" "}
              – not valid for cargo release. <br />
              Do not accept this Offloading Letter if manually altered. <br />
              Carriage to ICD Embakasi, Nairobi (whether TBL, Merchant Haulage,
              or Client nomination) is subject to Kenya Ports Authority terms.{" "}
              <br />
              The carrier is not responsible for delays, truck detention,
              demurrage, or incidental costs.
            </p>
          </div>
        </div>
      </div>
    </>
  );

  const SalesInvoiceSlskAttachSheet = ({ data, rows }) => (
    <>
      <div>
        <CompanyImgModuleInvoice />
        <HeadingGrid />
        <ChargeGridAttachment
          data={rows}
          rows={
            data &&
            data[0]?.tblInvoiceCharge?.length > 0 &&
            data[0]?.tblInvoiceCharge
          }
        />
        <div className="w-full border-black border-l border-r border-b border-t">
          <div>
            <p
              className="!text-black print:!text-black w-full text-left p-2"
              style={{ fontSize: "10px" }}
            >
              This document is non-negotiable and for{" "}
              <span className="font-bold">
                KPA and Empty Depot reference only
              </span>{" "}
              – not valid for cargo release. <br />
              Do not accept this Offloading Letter if manually altered. <br />
              Carriage to ICD Embakasi, Nairobi (whether TBL, Merchant Haulage,
              or Client nomination) is subject to Kenya Ports Authority terms.{" "}
              <br />
              The carrier is not responsible for delays, truck detention,
              demurrage, or incidental costs.
            </p>
          </div>
        </div>
      </div>
    </>
  );

  const TotalGridSLSK = () => {
    // safely grab the charges array
    const charges = Array.isArray(data?.[0]?.tblInvoiceCharge)
      ? data[0].tblInvoiceCharge
      : [];

    // helpers
    const toNum = (v) => {
      if (v == null) return 0;
      const n = Number(String(v).trim());
      return Number.isFinite(n) ? n : 0;
    };
    const fmt = (n) => n.toLocaleString("en-IN", { maximumFractionDigits: 2 });
    const fmt2 = (n) =>
      n.toLocaleString("en-IN", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      });

    // existing totals (kept from earlier examples)
    const totalRate = charges.reduce((sum, row) => sum + toNum(row?.rate), 0);
    const totalAmountPlusFirstTaxHc = charges.reduce(
      (sum, r) =>
        sum +
        toNum(r?.totalAmount) +
        toNum(r?.tblInvoiceChargeTax?.[0]?.taxAmountHc),
      0,
    );
    const totalFirstTaxFc = charges.reduce(
      (sum, r) => sum + toNum(r?.tblInvoiceChargeTax?.[0]?.taxAmountFc),
      0,
    );
    const totalFirstTaxHc = charges.reduce(
      (sum, r) => sum + toNum(r?.tblInvoiceChargeTax?.[0]?.taxAmountHc),
      0,
    );
    const netAmountHc = totalAmountPlusFirstTaxHc - totalFirstTaxHc;

    // NEW: sum of (totalAmountFc + first taxAmountFc) across all rows
    // (calculate as numbers; format on render)
    const totalAmountFcPlusFirstTaxFc = charges.reduce(
      (sum, r) =>
        sum +
        toNum(r?.totalAmountFc) +
        toNum(r?.tblInvoiceChargeTax?.[0]?.taxAmountFc),
      0,
    );

    return (
      <div style={{ width: "32%", marginLeft: "auto", marginTop: "10px" }}>
        <table className="w-full">
          <tbody>
            {/* Row 1 */}
            <tr style={{ color: "black", fontSize: "9px" }}>
              <td
                className="text-right pr-2 border border-black"
                style={{ width: "41.5%" }}
              >
                Total Rate
              </td>
              <td
                className="text-center pr-2 border border-black"
                style={{ width: "25%" }}
                title="Sum of rate column"
              >
                {fmt(totalRate)}
              </td>
              <td
                className="text-center border-t border-b border-black"
                style={{ width: "29%" }}
                title="(TotalAmount + first TaxAmountHc) - (first TaxAmountFc)"
              >
                {fmt2(netAmountHc)}
              </td>
            </tr>

            {/* Row 2 */}
            <tr style={{ color: "black", fontSize: "9px" }}>
              <td
                className="text-right pr-2 border-b border-l border-r border-black"
                style={{ width: "41.5%" }}
              >
                VAT
              </td>
              <td
                className="text-center pr-2 border-b border-r border-l border-black"
                style={{ width: "25%" }}
              >
                {fmt2(totalFirstTaxFc)}
              </td>
              <td
                className="text-center border-b border-black"
                style={{ width: "29%" }}
                title="Sum of first taxAmountFc across all charges"
              >
                {fmt2(totalFirstTaxHc)}
              </td>
            </tr>

            {/* Row 3 */}
            <tr style={{ color: "black", fontSize: "9px" }}>
              <td
                className="text-right pr-2 border-b border-l border-r border-black"
                style={{ width: "41.5%" }}
              >
                Total Amount Due
              </td>
              {/* >>> NEW: Row 3, Column 2 value (totalAmountFc + first taxAmountFc) sum <<< */}
              <td
                className="text-center pr-2 border-b border-r border-l border-black"
                style={{ width: "25%" }}
                title="Sum of (totalAmountFc + first taxAmountFc) across all charges"
              >
                {fmt2(totalAmountFcPlusFirstTaxFc)}
              </td>
              <td
                className="text-center border-b border-black"
                style={{ width: "29%" }}
                title="Sum of (totalAmount + first taxAmountHc) across all charges"
              >
                {fmt2(totalAmountPlusFirstTaxHc)}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    );
  };

  const TaxInvoiceReceiptSLSK = ({ data, rows, fullData }) => (
    <>
      <div>
        <CompanyImgModuleInvoice />
        <div className="border-l border-r border-black pt-1 pb-1">
          <div className="flex flex-grow w-full justify-center items-center">
            <h1
              className="text-black" // removed font-bold and text-sm
              style={{
                color: "black",
                fontFamily: '"Times New Roman", Times, serif',
                fontWeight: 400, // Regular
                fontSize: "18px",
                fontSynthesis: "none", // prevent synthetic bold
              }}
            >
              {"TAX INVOICE"}
            </h1>
          </div>
        </div>
        <HeadingGrid />
        {/* <BankDetails /> */}
        <div
          className="border-black border-b border-l border-r"
          style={{
            minHeight: "620px",
            maxHeight: "620px",
            height: "620px",
          }}
        >
          {chargesWithoutVat?.length > 0 && (
            <ChargeWithoutVat
              data={chargesWithoutVat}
              rows={
                data &&
                data[0]?.tblInvoiceCharge?.length > 0 &&
                data[0]?.tblInvoiceCharge
              }
              fullData={fullData}
            />
          )}
          {chargesWithVat?.length > 0 && (
            <ChargeWithVat
              data={chargesWithVat}
              rows={
                data &&
                data[0]?.tblInvoiceCharge?.length > 0 &&
                data[0]?.tblInvoiceCharge
              }
              fullData={fullData}
            />
          )}
          <TotalGridSLSK />
        </div>

        <TermsAndConditionGrid />
      </div>
    </>
  );

  const TaxInvoiceReceiptSlskAttachSheet = ({ data, rows }) => (
    <>
      <div>
        <CompanyImgModuleInvoice />
        <HeadingGrid />
        <ChargeGridAttachment
          data={rows}
          rows={
            data &&
            data[0]?.tblInvoiceCharge?.length > 0 &&
            data[0]?.tblInvoiceCharge
          }
        />
        <div className="w-full border-black border-l border-r border-b border-t">
          <div>
            <p
              className="!text-black print:!text-black w-full text-left p-2"
              style={{ fontSize: "10px" }}
            >
              This document is non-negotiable and for{" "}
              <span className="font-bold">
                KPA and Empty Depot reference only
              </span>{" "}
              – not valid for cargo release. <br />
              Do not accept this Offloading Letter if manually altered. <br />
              Carriage to ICD Embakasi, Nairobi (whether TBL, Merchant Haulage,
              or Client nomination) is subject to Kenya Ports Authority terms.{" "}
              <br />
              The carrier is not responsible for delays, truck detention,
              demurrage, or incidental costs.
            </p>
          </div>
        </div>
      </div>
    </>
  );

  const taxInvoiceSaudi = () => (
    <>
      <CompanyImgModuleInvoice />
      <HeadingGridSaudi />
      <MainGridSaudi />
      <ContainerGridSaudi />
      <BankDetailsGridSaudi />
    </>
  );

  const HeadingGridSaudi = () => {
    return (
      <table
        className="border border-black"
        style={{ width: "100%", color: "black" }}
      >
        <tr>
          <td
            style={{
              width: "20%",
              color: "black",
              fontSize: "10px",
              paddingLeft: "5px",
            }}
          >
            Invoice Number :
          </td>
          <td
            style={{
              width: "60%",
              color: "black",
              fontSize: "10px",
              textAlign: "center",
            }}
          >
            {data[0]?.invoiceNo}
          </td>
          <td
            style={{
              width: "20%",
              color: "black",
              fontSize: "10px",
              textAlign: "right",
              paddingRight: "5px",
            }}
          >
            : رقم الفاتورة
          </td>
        </tr>
        <tr>
          <td
            style={{
              width: "20%",
              color: "black",
              fontSize: "10px",
              paddingLeft: "5px",
            }}
          >
            Invoice Issue Date:
          </td>
          <td
            style={{
              width: "60%",
              color: "black",
              fontSize: "10px",
              textAlign: "center",
            }}
          >
            {data[0]?.invoiceDate}
          </td>
          <td
            style={{
              width: "20%",
              color: "black",
              fontSize: "10px",
              textAlign: "right",
              paddingRight: "5px",
            }}
          >
            : تاريخ إصدار الفاتورة
          </td>
        </tr>
        <tr>
          <td
            style={{
              width: "20%",
              color: "black",
              fontSize: "10px",
              paddingLeft: "5px",
            }}
          >
            Invoice Due Date:
          </td>
          <td
            style={{
              width: "60%",
              color: "black",
              fontSize: "10px",
              textAlign: "center",
            }}
          >
            {data[0]?.dueDate}
          </td>
          <td
            style={{
              width: "20%",
              color: "black",
              fontSize: "10px",
              textAlign: "right",
              paddingRight: "5px",
            }}
          >
            : تاريخ استحقاق الفاتورة
          </td>
        </tr>
        <tr>
          <td
            style={{
              width: "20%",
              color: "black",
              fontSize: "10px",
              paddingLeft: "5px",
            }}
          >
            Invoice Currency:
          </td>
          <td
            style={{
              width: "60%",
              color: "black",
              fontSize: "10px",
              textAlign: "center",
            }}
          >
            {data[0]?.currency}
          </td>
          <td
            style={{
              width: "20%",
              color: "black",
              fontSize: "10px",
              textAlign: "right",
              paddingRight: "5px",
            }}
          >
            : عملة الفاتورة
          </td>
        </tr>
      </table>
    );
  };

  const MainGridSaudi = () => {
    return (
      <div className="w-full flex">
        <table
          className="border-b border-l border-black"
          style={{ width: "50%", color: "black" }}
        >
          <tr className="border-b border-black bg-gray-200">
            <td
              colSpan={2}
              style={{
                width: "25%",
                color: "black",
                fontSize: "9px",
                paddingLeft: "5px",
                paddingBottom: "0px",
                fontWeight: "bold",
              }}
            >
              Seller :
            </td>
            <td
              colSpan={2}
              style={{
                width: "25%",
                color: "black",
                fontSize: "9px",
                textAlign: "right",
                paddingRight: "5px",
                paddingBottom: "0px",
                fontWeight: "bold",
              }}
            >
              البائع:
            </td>
          </tr>
          <tr>
            <td
              style={{
                width: "20%",
                color: "black",
                fontSize: "9px",
                paddingLeft: "5px",
                paddingBottom: "0px",
              }}
            >
              Name :
            </td>
            <td
              style={{
                width: "30%",
                color: "black",
                fontSize: "9px",
                textAlign: "left",
                paddingBottom: "0px",
              }}
            >
              {data[0]?.company}
            </td>
            <td
              style={{
                width: "30%",
                color: "black",
                fontSize: "9px",
                textAlign: "right",
                paddingRight: "5px",
                paddingBottom: "0px",
              }}
            >
              {data[0]?.ownNameLL}
            </td>
            <td
              style={{
                width: "20%",
                color: "black",
                fontSize: "9px",
                textAlign: "right",
                paddingRight: "5px",
                paddingBottom: "0px",
              }}
            >
              : الاسم
            </td>
          </tr>
          <tr>
            <td
              style={{
                width: "20%",
                color: "black",
                fontSize: "9px",
                paddingLeft: "5px",
                paddingBottom: "0px",
              }}
            >
              Building No.:
            </td>
            <td
              colSpan={2}
              style={{
                width: "30%",
                color: "black",
                fontSize: "9px",
                textAlign: "center",
                paddingBottom: "0px",
              }}
            >
              {data[0]?.ownBuildingNo}
            </td>
            <td
              style={{
                width: "20%",
                color: "black",
                fontSize: "9px",
                textAlign: "right",
                paddingRight: "5px",
                paddingBottom: "0px",
              }}
            >
              : رقم المبنى
            </td>
          </tr>
          <tr>
            <td
              style={{
                width: "20%",
                color: "black",
                fontSize: "9px",
                paddingLeft: "5px",
                paddingBottom: "0px",
              }}
            >
              Postal Code :
            </td>
            <td
              colSpan={2}
              style={{
                width: "30%",
                color: "black",
                fontSize: "9px",
                textAlign: "center",
                paddingBottom: "0px",
              }}
            >
              {data[0]?.companyPincode}
            </td>
            <td
              style={{
                width: "20%",
                color: "black",
                fontSize: "9px",
                textAlign: "right",
                paddingRight: "5px",
                paddingBottom: "0px",
              }}
            >
              : الرمز البريدي
            </td>
          </tr>
          <tr>
            <td
              style={{
                width: "20%",
                color: "black",
                fontSize: "9px",
                paddingLeft: "5px",
                paddingBottom: "0px",
              }}
            >
              Street Name :
            </td>
            <td
              style={{
                width: "30%",
                color: "black",
                fontSize: "9px",
                textAlign: "left",
                paddingBottom: "0px",
              }}
            >
              {data[0]?.ownStreetNo}
            </td>
            <td
              style={{
                width: "30%",
                color: "black",
                fontSize: "9px",
                textAlign: "right",
                paddingRight: "5px",
                paddingBottom: "0px",
              }}
            >
              {data[0]?.ownStreetNoLL}
            </td>
            <td
              style={{
                width: "20%",
                color: "black",
                fontSize: "9px",
                textAlign: "right",
                paddingRight: "5px",
                paddingBottom: "0px",
              }}
            >
              : اسم الشارع
            </td>
          </tr>
          <tr>
            <td
              style={{
                width: "20%",
                color: "black",
                fontSize: "9px",
                paddingLeft: "5px",
                paddingBottom: "0px",
              }}
            >
              City & Region :
            </td>
            <td
              style={{
                width: "30%",
                color: "black",
                fontSize: "9px",
                textAlign: "left",
                paddingBottom: "0px",
              }}
            >
              {data[0]?.ownCity}
            </td>
            <td
              style={{
                width: "30%",
                color: "black",
                fontSize: "9px",
                textAlign: "right",
                paddingRight: "5px",
                paddingBottom: "0px",
              }}
            >
              {data[0]?.ownCityLL}
            </td>
            <td
              style={{
                width: "20%",
                color: "black",
                fontSize: "9px",
                textAlign: "right",
                paddingRight: "5px",
                paddingBottom: "0px",
              }}
            >
              : المدينة والمنطقة
            </td>
          </tr>
          <tr>
            <td
              style={{
                width: "20%",
                color: "black",
                fontSize: "9px",
                paddingLeft: "5px",
                paddingBottom: "0px",
              }}
            >
              Country :
            </td>
            <td
              style={{
                width: "30%",
                color: "black",
                fontSize: "9px",
                textAlign: "left",
                paddingBottom: "0px",
              }}
            >
              {data[0]?.ownCountry}
            </td>
            <td
              style={{
                width: "30%",
                color: "black",
                fontSize: "9px",
                textAlign: "right",
                paddingRight: "5px",
                paddingBottom: "0px",
              }}
            >
              {data[0]?.ownCountryLL}
            </td>
            <td
              style={{
                width: "20%",
                color: "black",
                fontSize: "9px",
                textAlign: "right",
                paddingRight: "5px",
                paddingBottom: "0px",
              }}
            >
              : الدولة
            </td>
          </tr>
          <tr>
            <td
              style={{
                width: "20%",
                color: "black",
                fontSize: "9px",
                paddingLeft: "5px",
                paddingBottom: "0px",
              }}
            >
              VAT Number :
            </td>
            <td
              colSpan={2}
              style={{
                width: "30%",
                color: "black",
                fontSize: "9px",
                textAlign: "center",
                paddingBottom: "0px",
              }}
            >
              {data[0]?.companyVAT}
            </td>
            <td
              style={{
                width: "20%",
                color: "black",
                fontSize: "9px",
                textAlign: "right",
                paddingRight: "5px",
                paddingBottom: "0px",
              }}
            >
              : الرقم الضريبي
            </td>
          </tr>
          <tr>
            <td
              style={{
                width: "20%",
                color: "black",
                fontSize: "9px",
                paddingLeft: "5px",
                paddingBottom: "0px",
              }}
            >
              CR No. :
            </td>
            <td
              colSpan={2}
              style={{
                width: "30%",
                color: "black",
                fontSize: "9px",
                textAlign: "center",
                paddingBottom: "0px",
              }}
            >
              {data[0]?.companyCrNo}
            </td>
            <td
              style={{
                width: "20%",
                color: "black",
                fontSize: "9px",
                textAlign: "right",
                paddingRight: "5px",
                paddingBottom: "0px",
              }}
            >
              : التجارية
            </td>
          </tr>
          <tr>
            <td colSpan={4}></td>
          </tr>
        </table>
        {/* // second */}
        <table
          className="border-b border-r border-l border-black"
          style={{ width: "50%", color: "black" }}
        >
          <tr className="border-b border-black bg-gray-200">
            <td
              colSpan={2}
              style={{
                width: "25%",
                color: "black",
                fontSize: "9px",
                paddingLeft: "5px",
                paddingBottom: "0px",
                fontWeight: "bold",
              }}
            >
              Customer:
            </td>
            <td
              colSpan={2}
              style={{
                width: "25%",
                color: "black",
                fontSize: "9px",
                textAlign: "right",
                paddingRight: "5px",
                fontWeight: "bold",
                paddingBottom: "0px",
              }}
            >
              العميل:
            </td>
          </tr>
          <tr>
            <td
              style={{
                width: "20%",
                color: "black",
                fontSize: "9px",
                paddingLeft: "5px",
                paddingBottom: "0px",
              }}
            >
              Name :
            </td>
            <td
              style={{
                width: "30%",
                color: "black",
                fontSize: "9px",
                textAlign: "left",
                paddingBottom: "0px",
              }}
            >
              {data[0]?.billingPartyCompany}
            </td>
            <td
              style={{
                width: "30%",
                color: "black",
                fontSize: "9px",
                textAlign: "right",
                paddingRight: "5px",
                paddingBottom: "0px",
              }}
            >
              {data[0]?.billingPartyCompanyLL}
            </td>
            <td
              style={{
                width: "20%",
                color: "black",
                fontSize: "9px",
                textAlign: "right",
                paddingRight: "5px",
                paddingBottom: "0px",
              }}
            >
              : الاسم
            </td>
          </tr>
          <tr>
            <td
              style={{
                width: "20%",
                color: "black",
                fontSize: "9px",
                paddingLeft: "5px",
                paddingBottom: "0px",
              }}
            >
              Building No.:
            </td>
            <td
              colSpan={2}
              style={{
                width: "30%",
                color: "black",
                fontSize: "9px",
                textAlign: "center",
                paddingBottom: "0px",
              }}
            >
              {data[0]?.billingPartyBuildingNo}
            </td>
            <td
              style={{
                width: "30%",
                color: "black",
                fontSize: "9px",
                textAlign: "right",
                paddingRight: "5px",
                paddingBottom: "0px",
              }}
            >
              : رقم المبنى
            </td>
          </tr>
          <tr>
            <td
              style={{
                width: "20%",
                color: "black",
                fontSize: "9px",
                paddingLeft: "5px",
                paddingBottom: "0px",
              }}
            >
              Postal Code :
            </td>
            <td
              colSpan={2}
              style={{
                width: "30%",
                color: "black",
                fontSize: "9px",
                textAlign: "center",
                paddingBottom: "0px",
              }}
            >
              {data[0]?.billingPartyPostalCode}
            </td>
            <td
              style={{
                width: "30%",
                color: "black",
                fontSize: "9px",
                textAlign: "right",
                paddingRight: "5px",
                paddingBottom: "0px",
              }}
            >
              : الرمز البريدي
            </td>
          </tr>
          <tr>
            <td
              style={{
                width: "20%",
                color: "black",
                fontSize: "9px",
                paddingLeft: "5px",
                paddingBottom: "0px",
              }}
            >
              Street Name :
            </td>
            <td
              style={{
                width: "30%",
                color: "black",
                fontSize: "9px",
                textAlign: "left",
                paddingBottom: "0px",
              }}
            >
              {data[0]?.billingPartyStreetNo}
            </td>
            <td
              style={{
                width: "30%",
                color: "black",
                fontSize: "9px",
                textAlign: "right",
                paddingRight: "5px",
                paddingBottom: "0px",
              }}
            >
              {data[0]?.billingPartyStreetNoLL}
            </td>
            <td
              style={{
                width: "20%",
                color: "black",
                fontSize: "9px",
                textAlign: "right",
                paddingRight: "5px",
                paddingBottom: "0px",
              }}
            >
              : اسم الشارع
            </td>
          </tr>
          <tr>
            <td
              style={{
                width: "20%",
                color: "black",
                fontSize: "9px",
                paddingLeft: "5px",
                paddingBottom: "0px",
              }}
            >
              City & Region :
            </td>
            <td
              style={{
                width: "30%",
                color: "black",
                fontSize: "9px",
                textAlign: "left",
                paddingBottom: "0px",
              }}
            >
              {data[0]?.billingPartyCity}
            </td>
            <td
              style={{
                width: "30%",
                color: "black",
                fontSize: "9px",
                textAlign: "right",
                paddingRight: "5px",
                paddingBottom: "0px",
              }}
            >
              {data[0]?.billingPartyCityLL}
            </td>
            <td
              style={{
                width: "20%",
                color: "black",
                fontSize: "9px",
                textAlign: "right",
                paddingRight: "5px",
                paddingBottom: "0px",
              }}
            >
              : المدينة والمنطقة
            </td>
          </tr>
          <tr>
            <td
              style={{
                width: "20%",
                color: "black",
                fontSize: "9px",
                paddingLeft: "5px",
                paddingBottom: "0px",
              }}
            >
              Country :
            </td>
            <td
              style={{
                width: "30%",
                color: "black",
                fontSize: "9px",
                textAlign: "left",
                paddingBottom: "0px",
              }}
            >
              {data[0]?.billingPartyCountry}
            </td>
            <td
              style={{
                width: "30%",
                color: "black",
                fontSize: "9px",
                textAlign: "right",
                paddingRight: "5px",
                paddingBottom: "0px",
              }}
            >
              {data[0]?.billingPartyCountryLL}
            </td>
            <td
              style={{
                width: "20%",
                color: "black",
                fontSize: "9px",
                textAlign: "right",
                paddingRight: "5px",
                paddingBottom: "0px",
              }}
            >
              : الدولة
            </td>
          </tr>
          <tr>
            <td
              style={{
                width: "20%",
                color: "black",
                fontSize: "9px",
                paddingLeft: "5px",
                paddingBottom: "0px",
              }}
            >
              VAT Number :
            </td>
            <td
              colSpan={2}
              style={{
                width: "30%",
                color: "black",
                fontSize: "9px",
                textAlign: "center",
                paddingBottom: "0px",
              }}
            >
              {data[0]?.billingPartyTaxRegistrationNo}
            </td>
            <td
              style={{
                width: "20%",
                color: "black",
                fontSize: "9px",
                textAlign: "right",
                paddingRight: "5px",
                paddingBottom: "0px",
              }}
            >
              : الرقم الضريبي
            </td>
          </tr>
          <tr>
            <td
              style={{
                width: "20%",
                color: "black",
                fontSize: "9px",
                paddingLeft: "5px",
                paddingBottom: "0px",
              }}
            >
              Seller ID :
            </td>
            <td
              colSpan={2}
              style={{
                width: "25%",
                color: "black",
                fontSize: "9px",
                textAlign: "center",
              }}
            >
              {data[0]?.sellerId}
            </td>
            {/* <td
              style={{
                width: "30%",
                color: "black",
                fontSize: "9px",
                textAlign: "center",
                paddingBottom: "0px",
              }}
            ></td> */}
            <td
              style={{
                width: "30%",
                color: "black",
                fontSize: "9px",
                textAlign: "right",
                paddingRight: "5px",
                paddingBottom: "0px",
              }}
            >
              : معرف البائع
            </td>
          </tr>
          <tr>
            <td
              style={{
                width: "20%",
                color: "black",
                fontSize: "9px",
                paddingLeft: "5px",
                paddingBottom: "0px",
              }}
            >
              E-mail ID:
            </td>
            <td
              colSpan={2}
              style={{
                width: "30%",
                color: "black",
                fontSize: "9px",
                textAlign: "center",
                paddingBottom: "0px",
              }}
            >
              {data[0]?.billingPartyEmailId}
            </td>
            {/* <td
              style={{
                width: "30%",
                color: "black",
                fontSize: "9px",
                textAlign: "left",
                paddingRight: "5px",
                paddingBottom: "0px",
              }}
            >
              {data[0]?.billingPartyEmailId}
            </td> */}
            <td
              style={{
                width: "20%",
                color: "black",
                fontSize: "9px",
                textAlign: "right",
                paddingRight: "5px",
                paddingBottom: "0px",
              }}
            >
              البريد الإلكتروني:
            </td>
          </tr>
        </table>
      </div>
    );
  };

  const ContainerGridSaudi = () => {
    const headerStyle = {
      color: "black",
      fontSize: "9px",
      fontWeight: "bold",
      textAlign: "center",
      width: "10%",
    };

    const cellStyle = {
      color: "black",
      fontSize: "9px",
      textAlign: "center",
      borderRight: "1px solid black",
      width: "10%",
      wordBreak: "break-word",
      padding: "2px",
    };

    return (
      <>
        <div
          className="w-full border-l border-r border-black text-black text-[9px]"
          style={{ height: "600px" }}
        >
          {/* Header Row */}
          <div className="flex border-b border-black bg-gray-200">
            <div
              className="w-[5%] border-r border-black"
              style={{
                color: "black",
                fontSize: "9px",
                fontWeight: "bold",
                textAlign: "center",
                width: "5%",
              }}
            ></div>
            <div
              className="w-[15%] border-r border-black"
              style={{
                color: "black",
                fontSize: "9px",
                fontWeight: "bold",
                textAlign: "center",
                width: "15%",
              }}
            >
              الرقم المرجعي للسلعة <br /> ITEM CODE
            </div>
            <div
              className="w-[15%] border-r border-black"
              style={{
                color: "black",
                fontSize: "9px",
                fontWeight: "bold",
                textAlign: "center",
                width: "15%",
              }}
            >
              وصف <br /> DESCRIPTION
            </div>
            <div
              className="w-[5%] border-r border-black"
              style={{
                color: "black",
                fontSize: "9px",
                fontWeight: "bold",
                textAlign: "center",
                width: "5%",
              }}
            >
              الكمية <br /> QTY
            </div>
            <div className="w-[10%] border-r border-black" style={headerStyle}>
              سعر الوحدة <br /> UNIT PRICE
            </div>
            <div className="w-[10%] border-r border-black" style={headerStyle}>
              % خصم <br /> DISCOUNT %
            </div>
            <div className="w-[10%] border-r border-black" style={headerStyle}>
              مقدار الخصم <br /> DISCOUNT AMOUNT
            </div>
            <div className="w-[10%] border-r border-black" style={headerStyle}>
              ضريبة القيمة المضافة % <br /> VAT %
            </div>
            <div className="w-[10%] border-r border-black" style={headerStyle}>
              مبلغ ضريبة القيمة المضافة <br /> VAT AMOUNT
            </div>
            <div className="w-[10%]" style={headerStyle}>
              المبلغ <br /> AMOUNT
            </div>
          </div>

          {/* Body Rows */}
          {data[0]?.tblInvoiceCharge?.length > 0 ? (
            data[0]?.tblInvoiceCharge.map((item, index) => (
              <div key={index} className="flex border-b border-black">
                <div
                  className="w-[5%] border-r border-black flex items-center justify-center"
                  style={{
                    color: "black",
                    fontSize: "9px",
                    textAlign: "center",
                    borderRight: "1px solid black",
                    width: "5%",
                  }}
                >
                  {index + 1}
                </div>
                <div
                  className="w-[15%] border-r border-black flex items-center justify-center"
                  style={{
                    color: "black",
                    fontSize: "9px",
                    textAlign: "center",
                    borderRight: "1px solid black",
                    width: "15%",
                  }}
                >
                  {item.chargeCode}
                </div>
                <div
                  className="w-[15%] border-r border-black flex items-center justify-center"
                  style={{
                    color: "black",
                    fontSize: "9px",
                    textAlign: "center",
                    borderRight: "1px solid black",
                    width: "15%",
                  }}
                >
                  {item.description}
                  <br />
                  {item.descriptionLL}
                </div>
                <div
                  className="w-[5%] border-r border-black flex items-center justify-center"
                  style={{
                    color: "black",
                    fontSize: "9px",
                    textAlign: "center",
                    borderRight: "1px solid black",
                    width: "5%",
                  }}
                >
                  {item.qty}
                </div>
                <div
                  className="w-[10%] border-r border-black flex items-center justify-center"
                  style={cellStyle}
                >
                  {item?.rate
                    ? `${data[0]?.currency} ${parseFloat(item.rate).toFixed(2)}`
                    : `${data[0]?.currency}  0.00`}
                </div>
                <div
                  className="w-[10%] border-r border-black flex items-center justify-center"
                  style={cellStyle}
                >
                  {item.discountPercentage}
                </div>
                <div
                  className="w-[10%] border-r border-black flex items-center justify-center"
                  style={cellStyle}
                >
                  {item?.discountAmount
                    ? `${data[0]?.currency} ${parseFloat(
                        item.discountAmount,
                      ).toFixed(2)}`
                    : `${data[0]?.currency}  0.00`}
                </div>
                <div
                  className="w-[10%] border-r border-black flex items-center justify-center"
                  style={cellStyle}
                >
                  {item?.tblInvoiceChargeTax[0]?.taxPercentage}
                </div>
                <div
                  className="w-[10%] border-r border-black flex items-center justify-center"
                  style={cellStyle}
                >
                  {item?.tblInvoiceChargeTax?.[0]?.taxAmountHc
                    ? `${data[0]?.currency} ${parseFloat(
                        item.tblInvoiceChargeTax[0].taxAmountHc,
                      ).toFixed(2)}`
                    : `${data[0]?.currency}  0.00`}
                </div>
                <div
                  className="w-[10%]  flex items-center justify-center"
                  style={{
                    color: "black",
                    fontSize: "9px",
                    textAlign: "center",
                    width: "10%",
                  }}
                >
                  {item?.totalAmount
                    ? `${data[0]?.currency} ${parseFloat(
                        item.totalAmount,
                      ).toFixed(2)}`
                    : `${data[0]?.currency}  0.00`}
                </div>
              </div>
            ))
          ) : (
            <div className="flex border-b border-black">
              <div
                className="w-full text-center"
                style={{ fontSize: "9px", color: "black" }}
              >
                لا يوجد بيانات
              </div>
            </div>
          )}
          <OthersGridSaudi />
        </div>
      </>
    );
  };

  const OthersGridSaudi = () => {
    const toNum = (v) => (v == null || v === "" ? 0 : parseFloat(v) || 0);

    const totalAmount = data[0]?.tblInvoiceCharge?.reduce(
      (total, item) => total + item.totalAmount,
      0,
    );

    const discountAmount = data[0]?.tblInvoiceCharge?.reduce(
      (total, item) => total + item.discountAmount,
      0,
    );

    const grossTotalAmount = totalAmount - discountAmount;

    const vatAmount =
      data[0]?.tblInvoiceCharge?.reduce(
        (total, item) =>
          total +
          (item?.tblInvoiceChargeTax?.reduce(
            (taxTotal, tax) => taxTotal + (tax?.taxAmountHc || 0),
            0,
          ) || 0),
        0,
      ) ?? 0;

    return (
      <div className="w-full flex">
        <div
          className="border-r border-black"
          style={{ width: "65%", padding: "5px" }}
        >
          <div className="flex">
            <p style={{ fontSize: "9px", fontWeight: "bold", color: "black" }}>
              <span style={{ fontWeight: "bold" }}>BL No :</span>
            </p>
            <p style={{ fontSize: "9px", color: "black" }}>
              <span className="ps-2">{data[0]?.blNo}</span>
            </p>
          </div>
          <p style={{ fontSize: "9px", fontWeight: "bold", color: "black" }}>
            <span style={{ fontWeight: "bold" }}>Remarks</span>
          </p>
          <p style={{ fontSize: "9px", color: "black" }}>
            <span>{data[0]?.remarks}</span>
          </p>
        </div>
        <table style={{ width: "35%" }}>
          <tr className="border-b border-black">
            <td
              style={{
                width: "50%",
                color: "black",
                fontSize: "9px",
                fontWeight: "bold",
                textAlign: "center",
                padding: "5px 0",
              }}
            >
              المبلغ الإجمالي غير شامل الضريبة <br />
              Subtotal (Excl. VAT)
            </td>
            <td
              style={{
                width: "50%",
                color: "black",
                fontSize: "9px",
                fontWeight: "bold",
                textAlign: "center",
              }}
            >
              {totalAmount
                ? `${data[0]?.currency} ${parseFloat(totalAmount).toFixed(2)}`
                : `${data[0]?.currency}  0.00`}
            </td>
          </tr>
          <tr className="border-b border-black">
            <td
              style={{
                width: "50%",
                color: "black",
                fontSize: "9px",
                fontWeight: "bold",
                textAlign: "center",
                padding: "5px 0",
              }}
            >
              الخصم <br />
              Discounts (Invoice Level)
            </td>
            <td
              style={{
                width: "50%",
                color: "black",
                fontSize: "9px",
                fontWeight: "bold",
                textAlign: "center",
              }}
            >
              {discountAmount
                ? `${data[0]?.currency} ${parseFloat(discountAmount).toFixed(
                    2,
                  )}`
                : `${data[0]?.currency}  0.00`}
            </td>
          </tr>
          <tr className="border-b border-black">
            <td
              style={{
                width: "50%",
                color: "black",
                fontSize: "9px",
                fontWeight: "bold",
                textAlign: "center",
                padding: "5px 0",
              }}
            >
              المبلغ الإجمالي بعد الخصم <br />
              Gross Total (Excl. VAT)
            </td>
            <td
              style={{
                width: "50%",
                color: "black",
                fontSize: "9px",
                fontWeight: "bold",
                textAlign: "center",
              }}
            >
              {grossTotalAmount
                ? `${data[0]?.currency} ${parseFloat(grossTotalAmount).toFixed(
                    2,
                  )}`
                : `${data[0]?.currency}  0.00`}
            </td>
          </tr>
          <tr className="border-b border-black">
            <td
              style={{
                width: "50%",
                color: "black",
                fontSize: "9px",
                fontWeight: "bold",
                textAlign: "center",
                padding: "5px 0",
              }}
            >
              مبلغ ضريبة القيمة المضافة <br />
              Total VAT
            </td>
            <td
              style={{
                width: "50%",
                color: "black",
                fontSize: "9px",
                fontWeight: "bold",
                textAlign: "center",
              }}
            >
              {`${data[0]?.currency} ${(parseFloat(vatAmount) || 0).toFixed(
                2,
              )}`}
            </td>
          </tr>
          <tr>
            <td
              style={{
                width: "50%",
                color: "black",
                fontSize: "9px",
                fontWeight: "bold",
                textAlign: "center",
                padding: "5px 0",
              }}
            >
              المبلغ الإجمالي شامل الضريبة <br /> Net Total (incl. VAT)
            </td>
            <td
              style={{
                width: "50%",
                color: "black",
                fontSize: "9px",
                fontWeight: "bold",
                textAlign: "center",
              }}
            >
              {`${data[0]?.currency} ${(
                (parseFloat(grossTotalAmount) || 0) +
                (parseFloat(vatAmount) || 0)
              ).toFixed(2)}`}
            </td>
          </tr>
        </table>
      </div>
    );
  };

  const BankDetailsGridSaudi = () => {
    return (
      <div className="w-full flex border border-black">
        <table style={{ width: "100%" }}>
          <tr>
            <td
              colSpan={2}
              style={{
                width: "100%",
                fontSize: "9px",
                color: "black",
                padding: "1px 5px",
              }}
            >
              Kindly arrange the electronic payment in advance to avoid any
              delays in the processing.
            </td>
          </tr>
          <tr>
            <td
              colSpan={2}
              style={{
                width: "100%",
                fontSize: "9px",
                color: "black",
                padding: "1px 5px",
              }}
            >
              Please note that Cargo and B/L release will not be granted unless
              full payment is reflected in our account.
            </td>
          </tr>
          <tr>
            <td
              style={{
                width: "10%",
                fontSize: "9px",
                color: "black",
                padding: "1px 5px",
              }}
            >
              Account Name:
            </td>
            <td
              style={{
                width: "90%",
                fontSize: "9px",
                color: "black",
                padding: "1px 5px",
              }}
            >
              {data[0]?.company || ""}
            </td>
          </tr>
          <tr>
            <td
              style={{
                width: "10%",
                fontSize: "9px",
                color: "black",
                padding: "1px 5px",
              }}
            >
              Bank name:
            </td>
            <td
              style={{
                width: "90%",
                fontSize: "9px",
                color: "black",
                padding: "1px 5px",
              }}
            >
              {data[0]?.bankName || ""}
            </td>
          </tr>
          <tr>
            <td
              style={{
                width: "10%",
                fontSize: "9px",
                color: "black",
                padding: "1px 5px",
              }}
            >
              Swift Code:
            </td>
            <td
              style={{
                width: "90%",
                fontSize: "9px",
                color: "black",
                padding: "1px 5px",
              }}
            >
              {data[0]?.bankSwiftCode || ""}
            </td>
          </tr>
          <tr>
            <td
              style={{
                width: "10%",
                fontSize: "9px",
                color: "black",
                padding: "1px 5px",
              }}
            >
              Account No.:
            </td>
            <td
              style={{
                width: "90%",
                fontSize: "9px",
                color: "black",
                padding: "1px 5px",
              }}
            >
              {data[0]?.bankAccountNo || ""}
            </td>
          </tr>
          <tr>
            <td
              style={{
                width: "10%",
                fontSize: "9px",
                color: "black",
                padding: "1px 5px",
              }}
            >
              IBAN No.:
            </td>
            <td
              style={{
                width: "90%",
                fontSize: "9px",
                color: "black",
                padding: "1px 5px",
              }}
            >
              {data[0]?.ibanNo || data[0]?.bankIfscCode || ""}
            </td>
          </tr>
        </table>
      </div>
    );
  };

  const InvoiceAttachmentSLSK = ({ fullData, chargeAtt, index }) => {
    return (
      <>
        <div>
          <p
            className="!text-black text-lg font-bold text-center uppercase"
            style={{ fontSize: "10px" }}
          >
            Attached Sheet
          </p>
        </div>

        {/* header row */}
        <div className="flex border-t border-l border-r border-black mt-2  text-center !text-black">
          {["Invoice No.", "Invoice Date", "BL No."].map((label) => (
            <div
              key={label}
              className="flex-1 uppercase"
              style={
                label !== "Invoice No." ? { borderLeft: "1px solid black" } : {}
              }
            >
              <p
                className="pt-1 pb-1 pl-1"
                style={{ fontWeight: "bold", fontSize: "9px" }}
              >
                {label}
              </p>
            </div>
          ))}
        </div>

        {/* data row */}
        <div
          className="flex border-b border-l border-r border-black  text-center"
          style={{ height: "20px" }}
        >
          <div className="flex-1 uppercase">
            <p
              className="pt-1 pb-1 pl-1 !text-black"
              style={{ fontSize: "9px" }}
            >
              {fullData?.invoiceNo || ""}
            </p>
          </div>
          <div className="flex-1 uppercase border-l border-black">
            <p
              className="pt-1 pb-1 pl-1 !text-black"
              style={{ fontSize: "9px" }}
            >
              {fullData?.invoiceDate || ""}
            </p>
          </div>
          <div className="flex-1 uppercase border-l border-black">
            <p
              className="pt-1 pb-1 pl-1 !text-black"
              style={{ fontSize: "9px" }}
            >
              {fullData?.hblNo || fullData?.mblNo || ""}
            </p>
          </div>
        </div>

        {/* ------- HEADER (yours, unchanged) ------- */}
        <div
          style={{ width: "100%" }}
          className="flex !text-black border-black border-l border-r"
        >
          <div style={{ width: "14.2%" }}>
            <p
              className="!text-black font-bold text-center"
              style={{ fontSize: "10px" }}
            >
              Container No.
            </p>
          </div>
          <div style={{ width: "14.2%" }} className="border-black border-l">
            <p
              className="!text-black font-bold text-center"
              style={{ fontSize: "10px" }}
            >
              Size / Type
            </p>
          </div>
          <div style={{ width: "14.2%" }} className="border-black border-l">
            <p
              className="!text-black font-bold text-center"
              style={{ fontSize: "10px" }}
            >
              Arrival Date
            </p>
          </div>
          <div style={{ width: "14.2%" }} className="border-black border-l">
            <p
              className="!text-black font-bold text-center"
              style={{ fontSize: "10px" }}
            >
              Start Date
            </p>
          </div>
          <div style={{ width: "14.2%" }} className="border-black border-l">
            <p
              className="!text-black font-bold text-center"
              style={{ fontSize: "10px" }}
            >
              End Date
            </p>
          </div>
          <div style={{ width: "14.2%" }} className="border-black border-l">
            <p
              className="!text-black font-bold text-center"
              style={{ fontSize: "10px" }}
            >
              No. Of Days
            </p>
          </div>
          <div style={{ width: "14.6%" }} className="border-black border-l">
            <p
              className="!text-black font-bold text-center"
              style={{ fontSize: "10px" }}
            >
              Amount
            </p>
          </div>
        </div>

        {/* ------- ROWS ------- */}
        {(chargeAtt[0] ?? []).map((row, idx) => {
          // helpers
          const safe = (v) => ((v ?? v === 0) ? String(v) : "-");

          const sizeType =
            [row?.size, row?.typeCode || row?.type]
              .filter(Boolean)
              .join(" / ") || "-";

          // Arrival Date preference: arrivalDate > mblDate > hblDate > fromDate
          const arrivalDate =
            row?.arrivalDate ||
            row?.mblDate ||
            row?.hblDate ||
            row?.fromDate ||
            "";

          const startDate = row?.fromDate || "";
          const endDate = row?.toDate || "";

          // compute days only if not provided and both dates exist
          const computeDays = (a, b) => {
            const d1 = a ? new Date(a) : null;
            const d2 = b ? new Date(b) : null;
            if (!d1 || !d2 || isNaN(d1) || isNaN(d2)) return "-";
            const ms = d2.setHours(0, 0, 0, 0) - d1.setHours(0, 0, 0, 0);
            const days = Math.round(ms / (1000 * 60 * 60 * 24)) + 1; // inclusive
            return days < 0 ? "-" : String(days);
          };

          const days = row?.noOfDays ?? computeDays(row?.fromDate, row?.toDate);

          const amountRaw = row?.amountHc || 0;
          const amount =
            typeof amountRaw === "number"
              ? amountRaw.toLocaleString("en-IN", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })
              : safe(amountRaw);

          return (
            <div
              key={row?.id ?? idx}
              className="flex items-center !text-black border-black border-l border-r border-t border-b"
              style={{ width: "100%" }}
            >
              <div style={{ width: "14.2%" }} className="px-1 py-1">
                <p className="text-center" style={{ fontSize: "10px" }}>
                  {safe(row?.containerNo)}
                </p>
              </div>
              <div
                style={{ width: "14.2%" }}
                className="px-1 py-1 border-black border-l"
              >
                <p className="text-center" style={{ fontSize: "10px" }}>
                  {row?.size || ""} / {row?.type || ""}
                </p>
              </div>
              <div
                style={{ width: "14.2%" }}
                className="px-1 py-1 border-black border-l"
              >
                <p className="text-center" style={{ fontSize: "10px" }}>
                  {safe(arrivalDate)}
                </p>
              </div>
              <div
                style={{ width: "14.2%" }}
                className="px-1 py-1 border-black border-l"
              >
                <p className="text-center" style={{ fontSize: "10px" }}>
                  {safe(startDate)}
                </p>
              </div>
              <div
                style={{ width: "14.2%" }}
                className="px-1 py-1 border-black border-l"
              >
                <p className="text-center" style={{ fontSize: "10px" }}>
                  {safe(endDate)}
                </p>
              </div>
              <div
                style={{ width: "14.2%" }}
                className="px-1 py-1 border-black border-l"
              >
                <p className="text-center" style={{ fontSize: "10px" }}>
                  {safe(days)}
                </p>
              </div>
              <div
                style={{ width: "14.6%" }}
                className="px-1 py-1 border-black border-l"
              >
                <p
                  className="text-center font-semibold"
                  style={{ fontSize: "10px" }}
                >
                  {amount}
                </p>
              </div>
            </div>
          );
        })}
      </>
    );
  };

  const taxInvoiceSLS = (index) => (
    <div
      style={{
        height: "290mm",
        position: "relative",
        boxSizing: "border-box",
        overflow: "hidden",
        color: "black",
        paddingBottom: "18mm", // space for footer
      }}
    >
      <CompanyImgModule data={data} />
      <TaxInvoiceHeader data={data} />
      <TaxInvoiceBillingDetailsSLS data={data} />
      {index === 0 && <TaxInvoiceJobDetailsSLS data={data} />}
      <TaxInvoiceRemarksSLS data={data} />
      <TaxInvoiceChargeDetailsSLS
        data={data}
        charge={texInvoiceChargeSLS}
        index={index}
        hsnSac={hsnSac}
      />
      {index === 0 && (
        <TaxInvoiceTermsAndCondition
          data={data}
          index={index}
          termsAndConditions={data[0]?.termsConditionMst}
        />
      )}
      {/* Footer fixed at bottom of A4 */}
      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
        }}
      >
        <FooterModule />
      </div>
    </div>
  );

  const TaxInvoiceJobDetailsSLS = ({ data }) => {
    const sizeType = (data?.[0]?.sizeTypeContainer ?? "").replaceAll("/", ", ");
    console.log("sizeType", sizeType);
    return (
      <div
        style={{ width: "100%" }}
        className="flex border-r border-l border-b border-black"
      >
        <div
          className="p-2 border-r border-black"
          style={{ fontSize: "9px", width: "50%" }}
        >
          <div className="flex w-full">
            <p className="font-bold" style={{ width: "40%" }}>
              Job No. :{" "}
            </p>
            <p style={{ width: "60%" }}>{data[0]?.jobNo || ""}</p>
          </div>
          <div className="flex pt-1 w-full">
            <p className="font-bold" style={{ width: "40%" }}>
              MB/L No. :{" "}
            </p>
            <p style={{ width: "60%" }}>{data[0]?.mblNo || ""}</p>
          </div>
          <div className="flex pt-1 w-full">
            <p className="font-bold" style={{ width: "40%" }}>
              Vessel/Voy :{" "}
            </p>
            <p style={{ width: "60%" }}>
              {data[0]?.vessel || ""} / {data[0]?.voyageNo || ""}
            </p>
          </div>
          <div className="flex pt-1 w-full">
            <p className="font-bold" style={{ width: "40%" }}>
              POL :{" "}
            </p>
            <p style={{ width: "60%" }}>{data[0]?.pol || ""}</p>
          </div>
          <div className="flex pt-1 w-full">
            <p className="font-bold" style={{ width: "40%" }}>
              POD :{" "}
            </p>
            <p style={{ width: "60%" }}>{data[0]?.pod || ""}</p>
          </div>
          <div className="flex pt-1 w-full">
            <p className="font-bold" style={{ width: "40%" }}>
              Place Of Supply :{" "}
            </p>
            <p style={{ width: "60%" }}>{data[0]?.placeOfSupply || ""}</p>
          </div>
          <div className="flex pt-1 w-full">
            <p className="font-bold" style={{ width: "40%" }}>
              Size Type :{" "}
            </p>
            <p style={{ width: "60%" }}>{sizeType || ""}</p>
          </div>
        </div>
        <div
          className="border-black p-2"
          style={{ fontSize: "9px", width: "50%" }}
        >
          <div className="flex w-full">
            <p className="font-bold" style={{ width: "40%" }}>
              Date :{" "}
            </p>
            <p style={{ width: "60%" }}>
              {formatDateToDDMMYYYY(data[0]?.jobDate) || ""}
            </p>
          </div>
          <div className="flex pt-1 w-full">
            <p className="font-bold" style={{ width: "40%" }}>
              Date :{" "}
            </p>
            <p style={{ width: "60%" }}>
              {formatDateToDDMMYYYY(data[0]?.mblDate) || ""}
            </p>
          </div>
          <div className="flex pt-1 w-full">
            <p className="font-bold" style={{ width: "40%" }}>
              Date :{" "}
            </p>
            <p style={{ width: "60%" }}>
              {formatDateToDDMMYYYY(data[0]?.arrivalDate) || ""}
            </p>
          </div>
          <div className="flex pt-1 w-full">
            <p className="font-bold" style={{ width: "40%" }}>
              PLR :{" "}
            </p>
            <p style={{ width: "60%" }}>{data[0]?.plr || ""}</p>
          </div>
          <div className="flex pt-1 w-full">
            <p className="font-bold" style={{ width: "40%" }}>
              FPD :{" "}
            </p>
            <p style={{ width: "60%" }}>{data[0]?.fpd || ""}</p>
          </div>
        </div>
      </div>
    );
  };

  const TaxInvoiceBillingDetailsSLS = ({ data }) => {
    return (
      <div className="flex border-r border-l border-b border-black p-2">
        <div style={{ fontSize: "9px", width: "40%" }}>
          <div className="flex w-full">
            <p className="font-bold" style={{ width: "40%" }}>
              Billing Party Name :{" "}
            </p>
            <p style={{ width: "60%" }}>{data[0]?.party || ""}</p>
          </div>
          <div className="flex pt-1 w-full">
            <p className="font-bold" style={{ width: "40%" }}>
              Address :{" "}
            </p>
            <p style={{ width: "60%" }}>{data[0]?.billingPartyAddress || ""}</p>
          </div>
        </div>
        <div
          className="ps-2 pt-1 pb-2"
          style={{ fontSize: "9px", width: "24%" }}
        >
          <div className="flex w-full">
            <p className="font-bold" style={{ width: "35%" }}>
              PAN No. :{" "}
            </p>
            <p style={{ width: "65%" }}>{data[0]?.partyPanNo || ""}</p>
          </div>
          <div className="flex pt-1 w-full">
            <p className="font-bold" style={{ width: "35%" }}>
              State :{" "}
            </p>
            <p style={{ width: "65%" }}>{data[0]?.partyState || ""}</p>
          </div>
          <div className="flex pt-1 w-full">
            <p className="font-bold" style={{ width: "35%" }}>
              GSTIN :{" "}
            </p>
            <p style={{ width: "65%" }}>{data[0]?.partyGstin || ""}</p>
          </div>
        </div>
        <div
          className="ps-2 pt-1 pb-2"
          style={{ fontSize: "9px", width: "41%" }}
        >
          <div className="flex w-full">
            <p className="font-bold" style={{ width: "30%" }}>
              Invoice No. :{" "}
            </p>
            <p style={{ width: "70%" }}>{data[0]?.invoiceNo || ""}</p>
          </div>
          <div className="flex pt-1 w-full">
            <p className="font-bold" style={{ width: "30%" }}>
              Invoice Date :{" "}
            </p>
            <p style={{ width: "70%" }}>
              {formatDateToDDMMYYYY(data[0]?.invoiceDate) || ""}
            </p>
          </div>
          {data?.[0]?.exchangeRate !== 1 && (
            <div className="flex pt-1 w-full">
              <p className="font-bold" style={{ width: "30%" }}>
                Ex Rate :{" "}
              </p>
              <p style={{ width: "70%" }}>{data?.[0]?.exchangeRate || ""}</p>
            </div>
          )}
        </div>
      </div>
    );
  };

  const TaxInvoiceChargeDetailsSLS = ({ data, charge, index, hsnSac }) => {
    // ✅ helper: continuation rows (created by your splitter) should NOT show numbers/extra cols
    const isCont = (row) => row?.__isContinuation === true;

    // ✅ helper: show 0.00 only when it's a real row (not continuation)
    const showVal = (row, v, fallback = "") =>
      isCont(row) ? "" : (v ?? fallback);

    // Total (your existing logic)
    let totalAmount = 0;
    (charge || []).forEach((group) => {
      (group || []).forEach((item) => {
        if (!isNaN(item?.totalAmount) && item?.totalAmount !== null) {
          totalAmount += Number(item.totalAmount);
        }
      });
    });

    const gridTotal = (data?.[0]?.tblInvoiceCharge || []).reduce(
      (acc, curr) => {
        const qty = Number(curr?.qty || 0);
        const rate = Number(curr?.rate || 0);
        const exchangeRate = Number(curr?.exchangeRate || 1);
        const IGST = Number(curr?.IGST || 0);
        const CGST = Number(curr?.CGST || 0);
        const SGST = Number(curr?.SGST || 0);

        const rowTotal = qty * rate * exchangeRate + IGST + CGST + SGST;
        return acc + rowTotal;
      },
      0,
    );

    //const totalAmountInWords = numberToWords(parseFloat(gridTotal || 0), "INR");

    const currentPageLength = charge?.[index]?.length || 0;
    const nextPageLength = charge?.[index + 1]?.length || 0;
    const lastPageIndex = (charge?.length || 1) - 1;

    const totalPages = charge?.length || 0;

    const isLastPage =
      index === lastPageIndex ||
      (index === lastPageIndex - 1 && nextPageLength < 4);

    const isSinglePage = (charge?.length || 0) === 1;

    const chargeGridHeight = isSinglePage ? "200px" : "200px";

    const showHsnGrid =
      isLastPage || (currentPageLength > 4 && currentPageLength < 10);

    const total = Number(gridTotal || 0);
    const roundOff = Number(data?.[0]?.roundOffAmount || 0); // works for "-0.16" too
    const finalTotal = total + roundOff;
    const totalAmountInWords = numberToWords(
      parseFloat(finalTotal || 0),
      "INR",
    );

    return (
      <>
        {currentPageLength > 0 && (
          <div
            className="flex w-full border-black border-r border-l border-b text-center font-bold"
            style={{ fontSize: "9px", width: "100%" }}
          >
            <p className="border-r border-black" style={{ width: "30%" }}>
              DESCRIPTION
            </p>
            <p className="border-r border-black" style={{ width: "9%" }}>
              HSN / SAC Code
            </p>
            <p className="border-r border-black" style={{ width: "10%" }}>
              Size Type
            </p>
            <p className="border-r border-black" style={{ width: "4%" }}>
              Qty
            </p>
            <p className="border-r border-black" style={{ width: "6%" }}>
              Rate
            </p>
            <p className="border-r border-black" style={{ width: "4%" }}>
              Curr
            </p>
            <p className="border-r border-black" style={{ width: "7%" }}>
              Ex. Rate
            </p>
            <p className="border-r border-black" style={{ width: "7%" }}>
              Taxable Amount
            </p>
            <p className="border-r border-black" style={{ width: "7%" }}>
              Tax Rate
            </p>
            <p className="border-r border-black" style={{ width: "6%" }}>
              IGST
            </p>
            <p className="border-r border-black" style={{ width: "5%" }}>
              CGST
            </p>
            <p className="border-r border-black" style={{ width: "5%" }}>
              SGST
            </p>
            <p className="text-center" style={{ width: "7%" }}>
              Amount in {data?.[0]?.currency || ""}
            </p>
          </div>
        )}

        {currentPageLength > 0 && (
          <div
            className="border-black border-r border-l border-b"
            style={{ height: chargeGridHeight, overflow: "hidden" }}
          >
            {charge?.[index]?.map((chargeData, idx, array) => {
              const cont = isCont(chargeData);

              const qty = cont ? 0 : Number(chargeData?.qty || 0);
              const rate = cont ? 0 : Number(chargeData?.rate || 0);
              const exr = cont ? 1 : Number(chargeData?.exchangeRate || 1);
              const igst = cont ? 0 : Number(chargeData?.IGST || 0);
              const cgst = cont ? 0 : Number(chargeData?.CGST || 0);
              const sgst = cont ? 0 : Number(chargeData?.SGST || 0);

              const amount = cont
                ? ""
                : (qty * rate * exr + igst + cgst + sgst).toFixed(2);

              return (
                <div
                  key={idx}
                  className={`flex w-full ${idx === array.length - 1 ? "border-b" : ""}`}
                  style={{ fontSize: "9px", width: "100%" }}
                >
                  <p
                    className="pb-1 border-r border-black ps-1"
                    style={{ width: "30%", paddingLeft: "4px" }}
                  >
                    {chargeData?.description || chargeData?.chargeGl || ""}
                  </p>

                  <p
                    className="pb-1 border-r border-black text-center ps-1"
                    style={{ width: "9%" }}
                  >
                    {showVal(chargeData, chargeData?.hsn, "")}{" "}
                    {showVal(chargeData, chargeData?.sac, "")}
                  </p>

                  <p
                    className="pb-1 border-r border-black text-center ps-1"
                    style={{ width: "10%" }}
                  >
                    {showVal(chargeData, chargeData?.size, "")}{" "}
                    {showVal(chargeData, chargeData?.typeCode, "")}
                  </p>

                  <p
                    className="pb-1 border-r border-black text-center ps-1"
                    style={{ width: "4%" }}
                  >
                    {showVal(chargeData, chargeData?.qty, "")}
                  </p>

                  <p
                    className="pb-1 border-r border-black text-center ps-1"
                    style={{ width: "6%" }}
                  >
                    {showVal(chargeData, chargeData?.rate, "")}
                  </p>

                  <p
                    className="pb-1 border-r border-black text-center ps-1"
                    style={{ width: "4%" }}
                  >
                    {showVal(chargeData, chargeData?.chargeCurrency, "")}
                  </p>

                  <p
                    className="pb-1 border-r border-black text-center ps-1"
                    style={{ width: "7%" }}
                  >
                    {showVal(chargeData, chargeData?.exchangeRate, "")}
                  </p>

                  <p
                    className="pb-1 border-r border-black text-center ps-1"
                    style={{ width: "7%" }}
                  >
                    {showVal(chargeData, chargeData?.totalAmountHc, "")}
                  </p>

                  <p
                    className="pb-1 border-r border-black text-center ps-1"
                    style={{ width: "7%" }}
                  >
                    {showVal(chargeData, chargeData?.taxAmount, "")}
                  </p>

                  {/* ✅ IMPORTANT: remove "|| 0.00" fallback, and hide on continuation */}
                  <p
                    className="pb-1 border-r border-black text-center ps-1"
                    style={{ width: "6%" }}
                  >
                    {cont ? "" : (chargeData?.IGST ?? "")}
                  </p>
                  <p
                    className="pb-1 border-r border-black text-center"
                    style={{ width: "5%" }}
                  >
                    {cont ? "" : (chargeData?.CGST ?? "")}
                  </p>
                  <p
                    className="pb-1 border-r border-black text-center"
                    style={{ width: "5%" }}
                  >
                    {cont ? "" : (chargeData?.SGST ?? "")}
                  </p>

                  <p className="pb-1 text-center" style={{ width: "7%" }}>
                    {amount}
                  </p>
                </div>
              );
            })}

            {/* Final row - Amount in Words */}
            {/* Final row - Amount in Words */}
            <div
              className="flex w-full border-t border-b border-black"
              style={{ fontSize: "8px", width: "100%" }}
            >
              {/* LEFT (85%) */}
              <p
                className="p-1 uppercase"
                style={{
                  width: "85%",
                  paddingRight: "10px",
                  margin: 0,
                  minWidth: 0, // ✅ important for wrapping in flex
                  whiteSpace: "normal",
                  overflowWrap: "anywhere",
                  wordBreak: "break-word",
                }}
              >
                <span className="font-bold">Amount in Words </span>
                {data?.[0]?.currency || ""} {totalAmountInWords || ""} Only
              </p>

              {/* MIDDLE (8%) */}
              <p
                className="p-1"
                style={{
                  width: "8%",
                  margin: 0,
                  lineHeight: "1.2",
                  whiteSpace: "nowrap",
                }}
              >
                <span style={{ display: "block" }}>
                  Total {data?.[0]?.currency || ""}
                </span>
                <span style={{ display: "block" }}>Round Off</span>
                <span style={{ display: "block" }}>Grand Total</span>
              </p>

              {/* RIGHT (7%) */}
              <p
                className="p-1"
                style={{
                  width: "7%",
                  margin: 0,
                  lineHeight: "1",
                  textAlign: "right",
                  whiteSpace: "nowrap",
                }}
              >
                <span style={{ display: "block" }}>
                  {Number(gridTotal || 0).toFixed(2)}
                </span>
                <span style={{ display: "block" }}>
                  {data?.[0]?.roundOffAmount ?? ""}
                </span>
                <span style={{ display: "block" }}>
                  {finalTotal.toFixed(2)}
                </span>
              </p>
            </div>
          </div>
        )}

        {showHsnGrid && index === totalPages - 1 && (
          <div>
            <TaxInvoiceHsnSummaryGrid hsnSac={hsnSac} data={data} />
          </div>
        )}
      </>
    );
  };

  const generalInvoice = (index) => (
    <div
      style={{
        height: "290mm",
        position: "relative",
        boxSizing: "border-box",
        overflow: "hidden",
        color: "black",
        paddingBottom: "18mm", // space for footer
      }}
    >
      <CompanyImgModule data={data} />
      <GeneralSalesInvoiceHeader data={data} />
      <GeneralSalesInvoiceBillingDetails data={data} />
      <TaxInvoiceRemarks data={data} />
      <GeneralSalesInvoiceChargeDetailsForTaxInvoiceReport
        data={data}
        charge={generalSalesInvoicePrint}
        index={index}
        hsnSac={hsnSac}
      />
      {index === 0 && (
        <TaxInvoiceTermsAndConditionForTaxInvoiceReport
          data={data}
          index={index}
          termsAndConditions={data[0]?.termsConditionMst}
        />
      )}
      {/* Footer fixed at bottom of A4 */}
      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
        }}
      >
        <FooterModule />
      </div>
    </div>
  );

  const creditPrint = (index) => (
    <div
      style={{
        height: "290mm",
        position: "relative",
        boxSizing: "border-box",
        overflow: "hidden",
        color: "black",
        paddingBottom: "18mm", // space for footer
      }}
    >
      <CompanyImgModule data={data} />
      <CreditNoteInvoiceHeader data={data} />
      <CreditNoteBillingDetails data={data} />
      <TaxInvoiceJobDetails data={data} />
      <TaxInvoiceRemarks data={data} />
      <TaxInvoiceChargeDetailsForTaxInvoiceReportFF
        data={data}
        charge={invoiceChargeDataForTaxInvoice}
        index={index}
        hsnSac={hsnSac}
      />
      {index === 0 && (
        <TaxInvoiceTermsAndConditionForTaxInvoiceReport
          data={data}
          index={index}
          termsAndConditions={data[0]?.termsConditionMst}
        />
      )}
      {/* Footer fixed at bottom of A4 */}
      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
        }}
      >
        <FooterModule />
      </div>
    </div>
  );

  const toTaxInvoiceContainerNumber = (value) => {
    if (value === null || value === undefined || value === "") return null;
    const num = Number(value);
    return Number.isFinite(num) ? num : null;
  };

  const formatTaxInvoiceContainerAmount = (value) => {
    const num = toTaxInvoiceContainerNumber(value);
    if (num === null) return "";

    return num.toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  const getTaxInvoiceContainerDetailRows = (invoiceData) => {
    const invoice = invoiceData?.[0] || {};

    return (invoice?.tblInvoiceCharge || []).flatMap(
      (chargeData, chargeIndex) =>
        (chargeData?.tblInvoiceChargeDetails || []).map(
          (detailData, detailIndex) => {
            const days = toTaxInvoiceContainerNumber(detailData?.noOfDays);
            const rate = toTaxInvoiceContainerNumber(detailData?.rate);
            const qty = toTaxInvoiceContainerNumber(detailData?.qty) ?? 1;
            const exchangeRate =
              toTaxInvoiceContainerNumber(detailData?.exchangeRate) ??
              toTaxInvoiceContainerNumber(chargeData?.exchangeRate) ??
              toTaxInvoiceContainerNumber(invoice?.exchangeRate) ??
              1;
            const calculatedAmount =
              days !== null && rate !== null ? days * rate * qty : null;
            const detailAmount =
              calculatedAmount ??
              toTaxInvoiceContainerNumber(detailData?.amountFc) ??
              toTaxInvoiceContainerNumber(detailData?.amountHc);
            const chargeCurrency = String(
              chargeData?.chargeCurrency || detailData?.currency || "USD",
            ).toUpperCase();
            const isInrCharge = chargeCurrency === "INR";
            const amountUsd = isInrCharge ? null : detailAmount;
            const amountInr =
              detailAmount === null
                ? null
                : isInrCharge
                  ? detailAmount
                  : detailAmount * exchangeRate;

            return {
              ...detailData,
              amountInr,
              amountUsd,
              detailIndex,
              chargeIndex,
            };
          },
        ),
    );
  };

  const taxInvoiceContainerDetailGridMetrics = {
    firstPageAvailableMm: 42,
    continuationPageAvailableMm: 190,
    headerHeightMm: 6,
    rowHeightMm: 4.2,
    grandTotalHeightMm: 5,
    termsHeightMm: 31,
    compactSummaryRecoveryMm: 18,
  };

  const getTaxInvoiceContainerFirstDetailAvailableMm = ({
    chargePageCount = 0,
    lastChargePageRowCount = 0,
    compactSummary = false,
  } = {}) => {
    const compactSummaryRecoveryMm = compactSummary
      ? taxInvoiceContainerDetailGridMetrics.compactSummaryRecoveryMm
      : 0;

    if (chargePageCount <= 1) {
      return (
        taxInvoiceContainerDetailGridMetrics.firstPageAvailableMm +
        compactSummaryRecoveryMm
      );
    }

    const compactChargeGridHeightPx = getCompactChargeGridMinHeightPx(
      lastChargePageRowCount,
    );
    const recoveredHeightMm = Math.max(
      0,
      (350 - compactChargeGridHeightPx) * 0.264583,
    );

    return Math.min(
      96,
      taxInvoiceContainerDetailGridMetrics.firstPageAvailableMm +
        recoveredHeightMm +
        compactSummaryRecoveryMm,
    );
  };

  const getTaxInvoiceContainerDetailCapacity = ({
    pageType,
    includeGrandTotal = false,
    includeTerms = false,
    availableHeightMm: customAvailableHeightMm,
  }) => {
    const {
      firstPageAvailableMm,
      continuationPageAvailableMm,
      headerHeightMm,
      rowHeightMm,
      grandTotalHeightMm,
      termsHeightMm,
    } = taxInvoiceContainerDetailGridMetrics;

    const availableHeightMm =
      customAvailableHeightMm ??
      (pageType === "first"
        ? firstPageAvailableMm
        : continuationPageAvailableMm);
    const reservedHeightMm =
      headerHeightMm +
      (includeGrandTotal ? grandTotalHeightMm : 0) +
      (includeTerms ? termsHeightMm : 0);

    return Math.max(
      0,
      Math.floor((availableHeightMm - reservedHeightMm) / rowHeightMm),
    );
  };

  const buildTaxInvoiceContainerDetailPages = (
    rows = [],
    { firstPageAvailableMm } = {},
  ) => {
    if (!rows.length) return [];

    const firstPageCapacity = getTaxInvoiceContainerDetailCapacity({
      pageType: "first",
      availableHeightMm: firstPageAvailableMm,
    });
    const firstPageCapacityWithTerms = getTaxInvoiceContainerDetailCapacity({
      pageType: "first",
      availableHeightMm: firstPageAvailableMm,
      includeGrandTotal: true,
      includeTerms: true,
    });
    const continuationPageCapacity = getTaxInvoiceContainerDetailCapacity({
      pageType: "continuation",
    });
    const finalContinuationPageCapacity = getTaxInvoiceContainerDetailCapacity({
      pageType: "continuation",
      includeGrandTotal: true,
      includeTerms: true,
    });

    if (rows.length <= firstPageCapacityWithTerms) {
      return [
        {
          rows,
          showGrandTotal: true,
          showTermsAndCondition: true,
          canAppendToChargePage: true,
        },
      ];
    }

    if (rows.length <= firstPageCapacity) {
      return [
        {
          rows,
          showGrandTotal: true,
          showTermsAndCondition: true,
          canAppendToChargePage: false,
        },
      ];
    }

    const detailPages = [
      {
        rows: rows.slice(0, firstPageCapacity),
        showGrandTotal: false,
        showTermsAndCondition: false,
        canAppendToChargePage: true,
      },
    ];
    let remainingRows = rows.slice(firstPageCapacity);

    if (remainingRows.length > finalContinuationPageCapacity) {
      while (remainingRows.length > finalContinuationPageCapacity) {
        const rowsToTake = Math.min(
          continuationPageCapacity,
          remainingRows.length - 1,
        );

        detailPages.push({
          rows: remainingRows.slice(0, rowsToTake),
          showGrandTotal: false,
          showTermsAndCondition: false,
          canAppendToChargePage: false,
        });
        remainingRows = remainingRows.slice(rowsToTake);
      }
    }

    if (remainingRows.length > 0) {
      detailPages.push({
        rows: remainingRows,
        showGrandTotal: true,
        showTermsAndCondition: true,
        canAppendToChargePage: false,
      });
    }

    return detailPages;
  };

  const TaxInvoiceContainerDetailsGrid = ({
    rows = [],
    allRows = rows,
    showGrandTotal = true,
  }) => {
    if (rows.length === 0) return null;

    const totalUsd = allRows.reduce(
      (sum, row) => sum + (toTaxInvoiceContainerNumber(row?.amountUsd) || 0),
      0,
    );
    const totalInr = allRows.reduce(
      (sum, row) => sum + (toTaxInvoiceContainerNumber(row?.amountInr) || 0),
      0,
    );
    const cellBaseStyle = {
      height: "100%",
      display: "flex",
      alignItems: "center",
      boxSizing: "border-box",
      margin: 0,
      overflow: "hidden",
      lineHeight: 1,
      minWidth: 0,
      paddingBottom: 0,
      paddingTop: 0,
      whiteSpace: "nowrap",
    };
    const centerCellStyle = (width) => ({
      ...cellBaseStyle,
      width,
      justifyContent: "center",
      paddingLeft: "1mm",
      paddingRight: "1mm",
      textAlign: "center",
    });
    const rightCellStyle = (width) => ({
      ...cellBaseStyle,
      width,
      justifyContent: "flex-end",
      paddingLeft: "1mm",
      paddingRight: "1mm",
      textAlign: "right",
    });

    return (
      <div className="border-l border-r border-t border-b border-black">
        <div
          className="flex w-full border-b border-black text-center font-bold"
          style={{
            fontSize: "8px",
            width: "100%",
            height: `${taxInvoiceContainerDetailGridMetrics.headerHeightMm}mm`,
            alignItems: "stretch",
            overflow: "hidden",
          }}
        >
          <p className="border-r border-black" style={centerCellStyle("20%")}>
            Container No.
          </p>
          <p className="border-r border-black" style={centerCellStyle("13%")}>
            From Date
          </p>
          <p className="border-r border-black" style={centerCellStyle("13%")}>
            To Date
          </p>
          <p className="border-r border-black" style={centerCellStyle("10%")}>
            NO of Day's
          </p>
          <p className="border-r border-black" style={centerCellStyle("10%")}>
            Rate
          </p>
          <p className="border-r border-black" style={centerCellStyle("17%")}>
            Total Amount (USD)
          </p>
          <p style={centerCellStyle("17%")}>Total Amount (INR)</p>
        </div>

        {rows.map((detailData) => (
          <div
            key={`${detailData?.id || detailData?.detailIndex}-${detailData?.chargeIndex}`}
            className="flex w-full border-b border-black text-center"
            style={{
              fontSize: "8px",
              width: "100%",
              height: `${taxInvoiceContainerDetailGridMetrics.rowHeightMm}mm`,
              alignItems: "stretch",
              overflow: "hidden",
            }}
          >
            <p className="border-r border-black" style={centerCellStyle("20%")}>
              {detailData?.containerNo || ""}
            </p>
            <p className="border-r border-black" style={centerCellStyle("13%")}>
              {detailData?.fromDate || ""}
            </p>
            <p className="border-r border-black" style={centerCellStyle("13%")}>
              {detailData?.toDate || ""}
            </p>
            <p className="border-r border-black" style={centerCellStyle("10%")}>
              {detailData?.noOfDays ?? ""}
            </p>
            <p className="border-r border-black" style={rightCellStyle("10%")}>
              {formatTaxInvoiceContainerAmount(detailData?.rate)}
            </p>
            <p className="border-r border-black" style={rightCellStyle("17%")}>
              {formatTaxInvoiceContainerAmount(detailData?.amountUsd)}
            </p>
            <p style={rightCellStyle("17%")}>
              {formatTaxInvoiceContainerAmount(detailData?.amountInr)}
            </p>
          </div>
        ))}

        {showGrandTotal && (
          <div
            className="flex w-full font-bold text-right"
            style={{
              fontSize: "8px",
              width: "100%",
              height: `${taxInvoiceContainerDetailGridMetrics.grandTotalHeightMm}mm`,
              alignItems: "stretch",
              overflow: "hidden",
            }}
          >
            <p className="border-r border-black" style={rightCellStyle("66%")}>
              Grand Total
            </p>
            <p className="border-r border-black" style={rightCellStyle("17%")}>
              {formatTaxInvoiceContainerAmount(totalUsd)}
            </p>
            <p style={rightCellStyle("17%")}>
              {formatTaxInvoiceContainerAmount(totalInr)}
            </p>
          </div>
        )}
      </div>
    );
  };

  const taxInvoiceContainer = ({
    index,
    containerDetailRows = [],
    allContainerDetailRows = [],
    showContainerDetailGrandTotal = true,
    showTermsAndCondition = false,
    compactContainerSummary = false,
    totalPages,
  }) => (
    <div
      style={{
        height: "290mm",
        position: "relative",
        boxSizing: "border-box",
        overflow: "hidden",
        color: "black",
        paddingBottom: compactContainerSummary ? "8mm" : "18mm", // space for footer
      }}
    >
      <CompanyImgModule data={data} />
      <TaxInvoiceHeader data={data} />
      <TaxInvoiceBillingDetails data={data} />
      {index === 0 && <TaxInvoiceJobDetails data={data} />}
      <TaxInvoiceRemarks data={data} />
      {/* <TaxInvoiceChargeDetailsForTaxInvoiceReport
        data={data}
        charge={invoiceChargeDataForTaxInvoice}
        index={index}
        hsnSac={hsnSac}
      /> */}
      {/* same grid for Tax invoice and tax invoice FF grid */}
      <TaxInvoiceChargeDetailsForTaxInvoiceReportFF
        data={data}
        charge={invoiceChargeDataForTaxInvoice}
        index={index}
        hsnSac={hsnSac}
        compactChargeGrid={
          index === (invoiceChargeDataForTaxInvoice?.length || 1) - 1
        }
        compactHsnGrid={compactContainerSummary}
      />
      {containerDetailRows.length > 0 && (
        <TaxInvoiceContainerDetailsGrid
          rows={containerDetailRows}
          allRows={allContainerDetailRows}
          showGrandTotal={showContainerDetailGrandTotal}
        />
      )}
      {showTermsAndCondition && (
        <TaxInvoiceTermsAndConditionForTaxInvoiceReport
          data={data}
          index={index}
          termsAndConditions={data[0]?.termsConditionMst}
          compact={compactContainerSummary}
          totalPages={totalPages}
        />
      )}
      {/* Footer fixed at bottom of A4 */}
      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
        }}
      >
        <FooterModule />
      </div>
    </div>
  );

  const taxInvoiceContainerDetailContinuation = ({
    pageIndex,
    containerDetailRows = [],
    allContainerDetailRows = [],
    showContainerDetailGrandTotal = true,
    showTermsAndCondition = false,
    totalPages,
  }) => (
    <div
      style={{
        height: "290mm",
        position: "relative",
        boxSizing: "border-box",
        overflow: "hidden",
        color: "black",
        paddingBottom: "18mm",
      }}
    >
      <CompanyImgModule data={data} />
      <TaxInvoiceHeader data={data} />
      <TaxInvoiceBillingDetails data={data} />
      <TaxInvoiceRemarks data={data} />
      <TaxInvoiceContainerDetailsGrid
        rows={containerDetailRows}
        allRows={allContainerDetailRows}
        showGrandTotal={showContainerDetailGrandTotal}
      />
      {showTermsAndCondition && (
        <TaxInvoiceTermsAndConditionForTaxInvoiceReport
          data={data}
          index={pageIndex}
          termsAndConditions={data[0]?.termsConditionMst}
          totalPages={totalPages}
        />
      )}
      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
        }}
      >
        <FooterModule />
      </div>
    </div>
  );

  const domesticInvoice = (index) => (
    <div
      style={{
        height: "290mm",
        position: "relative",
        boxSizing: "border-box",
        overflow: "hidden",
        color: "black",
        paddingBottom: "18mm", // space for footer
      }}
    >
      <CompanyImgModule data={data} />
      <TaxInvoiceHeader data={data} />
      <TaxInvoiceBillingDetails data={data} />
      {index === 0 && <DomesticInvoiceJobDetails data={data} />}
      <TaxInvoiceRemarks data={data} />
      {/* <TaxInvoiceChargeDetailsForTaxInvoiceReport
        data={data}
        charge={invoiceChargeDataForTaxInvoice}
        index={index}
        hsnSac={hsnSac}
      /> */}
      {/* same grid for Tax invoice and tax invoice FF grid */}
      <TaxInvoiceChargeDetailsForTaxInvoiceReportFF
        data={data}
        charge={invoiceChargeDataForTaxInvoice}
        index={index}
        hsnSac={hsnSac}
      />
      {index === 0 && (
        <TaxInvoiceTermsAndConditionForTaxInvoiceReport
          data={data}
          index={index}
          termsAndConditions={data[0]?.termsConditionMst}
        />
      )}
      {/* Footer fixed at bottom of A4 */}
      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
        }}
      >
        <FooterModule />
      </div>
    </div>
  );

  const buildPurchaseInvoiceAttachmentPages = (
    invoiceData,
    rowsPerPage = 18,
  ) => {
    const charges = Array.isArray(invoiceData?.tblInvoiceCharge)
      ? invoiceData.tblInvoiceCharge
      : [];

    const pages = [];
    let currentPage = [];
    let currentCount = 0;

    const pushPage = () => {
      if (currentPage.length > 0) {
        pages.push(currentPage);
        currentPage = [];
        currentCount = 0;
      }
    };

    charges.forEach((chargeData) => {
      const details = Array.isArray(chargeData?.tblInvoiceChargeDetails)
        ? chargeData.tblInvoiceChargeDetails
        : [];

      if (!details.length) return;

      const rows = details.map((row, idx) => ({
        ...row,
        __srNo: idx + 1,
      }));

      let start = 0;

      while (start < rows.length) {
        if (currentCount > 0 && currentCount + 4 > rowsPerPage) {
          pushPage();
        }

        const availableRows = Math.max(rowsPerPage - currentCount - 3, 1);
        const chunk = rows.slice(start, start + availableRows);
        const isLastChunk = start + availableRows >= rows.length;

        currentPage.push({
          chargeData,
          rows: chunk,
          showTotal: isLastChunk,
        });

        currentCount += 2 + chunk.length + (isLastChunk ? 1 : 0);
        start += chunk.length;

        if (currentCount >= rowsPerPage) {
          pushPage();
        }
      }
    });

    pushPage();

    return pages;
  };

  const PurchaseInvoiceAttachmentSheet = ({ data, pageGroups }) => {
    const invoiceData = data?.[0] || {};

    const toNum = (value) => {
      if (value === null || value === undefined || value === "") return 0;
      const num = Number(String(value).replace(/,/g, ""));
      return Number.isFinite(num) ? num : 0;
    };

    const fmtAmt = (value) => {
      if (value === null || value === undefined || value === "") return "";
      const num = Number(String(value).replace(/,/g, ""));
      if (!Number.isFinite(num)) return "";
      return num.toLocaleString("en-IN", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      });
    };

    const firstValue = (...values) => {
      for (const v of values) {
        if (v !== null && v !== undefined && v !== "") return v;
      }
      return "";
    };

    const getSizeType = (row, chargeData) => {
      const size = firstValue(row?.size, chargeData?.size);
      const typeCode = firstValue(
        row?.typeCode,
        row?.type,
        chargeData?.typeCode,
        chargeData?.type,
      );

      if (!size && !typeCode) return "";
      return `${size || ""}${size || typeCode ? " / " : ""}${typeCode || ""}`;
    };

    const getVesselVoyage = (row) => {
      const vessel = firstValue(
        row?.vessel,
        row?.vesselName,
        invoiceData?.vessel,
        invoiceData?.jobVessel,
        invoiceData?.podVesselName,
        invoiceData?.blVesselName,
      );

      const voyage = firstValue(
        row?.voyageNo,
        row?.voyage,
        invoiceData?.voyageNo,
        invoiceData?.jobVoyageNo,
        invoiceData?.podVoyageName,
        invoiceData?.blVoyageNo,
      );

      return [vessel, voyage].filter(Boolean).join(" / ");
    };

    const getBlNo = (row) =>
      firstValue(
        row?.blNo,
        row?.hblNo,
        row?.mblNo,
        invoiceData?.blNo,
        invoiceData?.hblNo,
        invoiceData?.mblNo,
      );

    const cellBase = {
      padding: "2px 3px",
      lineHeight: "1.2",
      wordBreak: "break-word",
    };

    return (
      <div
        style={{
          height: "290mm",
          position: "relative",
          boxSizing: "border-box",
          overflow: "hidden",
          color: "black",
        }}
      >
        <PurchaseCompanyImgModule data={data} />

        <div style={{ marginTop: "4px" }}>
          {pageGroups.map((section, sectionIndex) => {
            const chargeData = section?.chargeData || {};
            const rows = section?.rows || [];

            const chargeTotalHome = (
              chargeData?.tblInvoiceChargeDetails || []
            ).reduce((sum, row) => sum + toNum(row?.amountHc), 0);

            return (
              <div
                key={sectionIndex}
                style={{
                  width: "100%",
                  marginBottom: "8px",
                  fontSize: "8px",
                }}
              >
                <div
                  className="font-bold"
                  style={{
                    display: "flex",
                    width: "100%",
                    padding: "2px 3px",
                    fontSize: "8px",
                  }}
                >
                  <span style={{ width: "85px" }}>Charge Name:</span>
                  <span>{chargeData?.description || ""}</span>
                </div>

                <div
                  className="border-l border-t border-black"
                  style={{
                    width: "100%",
                    fontSize: "8px",
                  }}
                >
                  <div
                    className="flex w-full text-center font-bold"
                    style={{
                      width: "100%",
                      lineHeight: "1.15",
                    }}
                  >
                    <p
                      className="border-r border-b border-black"
                      style={{ ...cellBase, width: "5%" }}
                    >
                      Sr No.
                    </p>
                    <p
                      className="border-r border-b border-black"
                      style={{ ...cellBase, width: "13%" }}
                    >
                      Vessel / Voyage
                    </p>
                    <p
                      className="border-r border-b border-black"
                      style={{ ...cellBase, width: "8%" }}
                    >
                      Size/Type
                    </p>
                    <p
                      className="border-r border-b border-black"
                      style={{ ...cellBase, width: "12%" }}
                    >
                      Container No
                    </p>
                    <p
                      className="border-r border-b border-black"
                      style={{ ...cellBase, width: "15%" }}
                    >
                      BL No
                    </p>
                    <p
                      className="border-r border-b border-black"
                      style={{ ...cellBase, width: "5%" }}
                    >
                      Qty
                    </p>
                    <p
                      className="border-r border-b border-black"
                      style={{ ...cellBase, width: "5%" }}
                    >
                      No of Days
                    </p>
                    <p
                      className="border-r border-b border-black"
                      style={{ ...cellBase, width: "8%" }}
                    >
                      Rate
                    </p>
                    <p
                      className="border-r border-b border-black"
                      style={{ ...cellBase, width: "4%" }}
                    >
                      Curr
                    </p>
                    <p
                      className="border-r border-b border-black"
                      style={{ ...cellBase, width: "6%" }}
                    >
                      Ex.Rate
                    </p>
                    <p
                      className="border-r border-b border-black"
                      style={{ ...cellBase, width: "11%" }}
                    >
                      Amount in Inv. Curr.
                    </p>
                    <p
                      className="border-r border-b border-black"
                      style={{ ...cellBase, width: "8%" }}
                    >
                      Amount in Home Curr.
                    </p>
                  </div>

                  {rows.map((row, rowIndex) => (
                    <div
                      key={rowIndex}
                      className="flex w-full"
                      style={{
                        width: "100%",
                        minHeight: "26px",
                        lineHeight: "1.2",
                      }}
                    >
                      <p
                        className="border-r border-b border-black text-center"
                        style={{ ...cellBase, width: "5%" }}
                      >
                        {row?.__srNo || ""}
                      </p>
                      <p
                        className="border-r border-b border-black"
                        style={{ ...cellBase, width: "13%" }}
                      >
                        {getVesselVoyage(row)}
                      </p>
                      <p
                        className="border-r border-b border-black text-center"
                        style={{ ...cellBase, width: "8%" }}
                      >
                        {getSizeType(row, chargeData)}
                      </p>
                      <p
                        className="border-r border-b border-black"
                        style={{ ...cellBase, width: "12%" }}
                      >
                        {row?.containerNo || ""}
                      </p>
                      <p
                        className="border-r border-b border-black"
                        style={{ ...cellBase, width: "15%" }}
                      >
                        {getBlNo(row)}
                      </p>
                      <p
                        className="border-r border-b border-black text-center"
                        style={{ ...cellBase, width: "5%" }}
                      >
                        {row?.qty ?? ""}
                      </p>
                      <p
                        className="border-r border-b border-black text-center"
                        style={{ ...cellBase, width: "5%" }}
                      >
                        {row?.noOfDays ?? ""}
                      </p>
                      <p
                        className="border-r border-b border-black text-right"
                        style={{ ...cellBase, width: "8%" }}
                      >
                        {fmtAmt(row?.rate)}
                      </p>
                      <p
                        className="border-r border-b border-black text-center"
                        style={{ ...cellBase, width: "4%" }}
                      >
                        {firstValue(
                          row?.currency,
                          chargeData?.chargeCurrency,
                          invoiceData?.currency,
                        )}
                      </p>
                      <p
                        className="border-r border-b border-black text-right"
                        style={{ ...cellBase, width: "6%" }}
                      >
                        {fmtAmt(
                          firstValue(
                            row?.exchangeRate,
                            chargeData?.exchangeRate,
                          ),
                        )}
                      </p>
                      <p
                        className="border-r border-b border-black text-right"
                        style={{ ...cellBase, width: "11%" }}
                      >
                        {fmtAmt(row?.amountFc)}
                      </p>
                      <p
                        className="border-r border-b border-black text-right"
                        style={{ ...cellBase, width: "8%" }}
                      >
                        {fmtAmt(row?.amountHc)}
                      </p>
                    </div>
                  ))}

                  {section?.showTotal && (
                    <div
                      className="flex w-full font-bold"
                      style={{
                        width: "100%",
                      }}
                    >
                      <p
                        className="border-r border-b border-black text-right"
                        style={{
                          ...cellBase,
                          width: "92%",
                        }}
                      >
                        {rows.length || ""}
                      </p>
                      <p
                        className="border-r border-b border-black text-right"
                        style={{
                          ...cellBase,
                          width: "8%",
                        }}
                      >
                        {fmtAmt(chargeTotalHome)}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const purchaseInvoice = (index, totalPages) => (
    <div
      style={{
        height: "290mm",
        position: "relative",
        boxSizing: "border-box",
        overflow: "hidden",
        color: "black",
        paddingBottom: "18mm",
      }}
    >
      <PurchaseCompanyImgModule data={data} />
      <PurchaseInvoiceHeader data={data} />
      <PurchaseInvoiceBillingDetails data={data} />

      {index === 0 && <PurchaseInvoiceJobDetails data={data} />}

      <PurchaseInvoiceChargeDetailsForTaxInvoiceReportFF
        data={data}
        charge={purchaseInvoicePrint}
        index={index}
        hsnSac={hsnSac}
      />

      {index === 0 && (
        <PurchaseInvoiceTermsAndConditionForTaxInvoiceReport
          data={data}
          index={index}
          totalPages={totalPages}
          termsAndConditions={data[0]?.termsConditionMst}
        />
      )}

      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
        }}
      >
        <FooterModule />
      </div>
    </div>
  );

  return (
    <main>
      <div className="mt-5">
        <Print
          //key={reportId}
          enquiryModuleRefs={enquiryModuleRefs}
          reportIds={printName?.length > 0 ? [printName] : reportIds}
          printOrientation="portrait"
        />
        {reportIds.map((reportId, index) => {
          switch (reportId) {
            case "Tax Invoice":
              return (
                <>
                  <div
                    ref={(el) => (enquiryModuleRefs.current[index] = el)}
                    id="TaxInvoice"
                  >
                    {invoiceChargeDataForTaxInvoice?.length > 0 ? (
                      // Render taxInvoice if there are charges
                      Array.from({
                        length: invoiceChargeDataForTaxInvoice?.length,
                      }).map((_, index) => (
                        <div
                          key={index}
                          style={{
                            width: "210mm",
                            height: "297mm",
                            margin: "auto",
                            boxSizing: "border-box",
                            pageBreakAfter:
                              index < data[0]?.tblInvoiceCharge?.length - 1
                                ? "always"
                                : "auto",
                            padding: "5mm",
                            display: "flex",
                            flexDirection: "column",
                            marginBottom: "22px",
                          }}
                          className="bgTheme removeFontSize"
                        >
                          <div
                            style={{
                              flex: 1,
                              width: "100%",
                              boxSizing: "border-box",
                              fontFamily: "Arial sans-serif !important",
                            }}
                          >
                            {taxInvoice(index)}
                          </div>
                        </div>
                      ))
                    ) : (
                      // Render taxInvoiceWithoutCharges if there are no charges
                      <div
                        style={{
                          width: "210mm",
                          height: "297mm",
                          margin: "auto",
                          boxSizing: "border-box",
                          padding: "5mm",
                          display: "flex",
                          flexDirection: "column",
                          marginBottom: "22px",
                        }}
                        className="bgTheme removeFontSize"
                      >
                        <div
                          style={{
                            flex: 1,
                            width: "100%",
                            boxSizing: "border-box",
                            fontFamily: "Arial sans-serif !important",
                          }}
                        >
                          {taxInvoiceWithoutCharges()}
                        </div>
                      </div>
                    )}
                  </div>
                </>
              );
            case "Tax Invoice FF":
              return (
                <>
                  <div
                    ref={(el) => (enquiryModuleRefs.current[index] = el)}
                    id="TaxInvoice"
                  >
                    {invoiceChargeDataForTaxInvoice?.length > 0 ? (
                      // Render taxInvoice if there are charges
                      Array.from({
                        length: invoiceChargeDataForTaxInvoice?.length,
                      }).map((_, index) => (
                        <div
                          key={index}
                          style={{
                            width: "210mm",
                            height: "297mm",
                            margin: "auto",
                            boxSizing: "border-box",
                            pageBreakAfter:
                              index < data[0]?.tblInvoiceCharge?.length - 1
                                ? "always"
                                : "auto",
                            padding: "5mm",
                            display: "flex",
                            flexDirection: "column",
                            marginBottom: "22px",
                          }}
                          className="bgTheme removeFontSize"
                        >
                          <div
                            style={{
                              flex: 1,
                              width: "100%",
                              boxSizing: "border-box",
                              fontFamily: "Arial sans-serif !important",
                            }}
                          >
                            {taxInvoiceFF(index)}
                          </div>
                        </div>
                      ))
                    ) : (
                      // Render taxInvoiceWithoutCharges if there are no charges
                      <div
                        style={{
                          width: "210mm",
                          height: "297mm",
                          margin: "auto",
                          boxSizing: "border-box",
                          padding: "5mm",
                          display: "flex",
                          flexDirection: "column",
                          marginBottom: "22px",
                        }}
                        className="bgTheme removeFontSize"
                      >
                        <div
                          style={{
                            flex: 1,
                            width: "100%",
                            boxSizing: "border-box",
                            fontFamily: "Arial sans-serif !important",
                          }}
                        >
                          {taxInvoiceWithoutCharges()}
                        </div>
                      </div>
                    )}
                  </div>
                </>
              );
            case "Import Tax Invoice":
              return (
                <>
                  {/* for import Screen Invoices We have Use this Invoice  */}
                  <div
                    ref={(el) => (enquiryModuleRefs.current[index] = el)}
                    id="ImportTaxInvoice"
                  >
                    {texInvoiceCharge?.length > 0 ? (
                      // Render taxInvoice if there are charges
                      Array.from({
                        length: texInvoiceCharge?.length,
                      }).map((_, index) => (
                        <div
                          key={index}
                          style={{
                            width: "210mm",
                            height: "297mm",
                            margin: "auto",
                            boxSizing: "border-box",
                            pageBreakAfter:
                              index < data[0]?.tblInvoiceCharge?.length - 1
                                ? "always"
                                : "auto",
                            padding: "5mm",
                            display: "flex",
                            flexDirection: "column",
                            marginBottom: "22px",
                          }}
                          className="bgTheme removeFontSize"
                        >
                          <div
                            style={{
                              flex: 1,
                              width: "100%",
                              boxSizing: "border-box",
                              fontFamily: "Arial sans-serif !important",
                            }}
                          >
                            {ImportTaxInvoice(index)}
                          </div>
                        </div>
                      ))
                    ) : (
                      // Render taxInvoiceWithoutCharges if there are no charges
                      <div
                        style={{
                          width: "210mm",
                          height: "297mm",
                          margin: "auto",
                          boxSizing: "border-box",
                          padding: "5mm",
                          display: "flex",
                          flexDirection: "column",
                          marginBottom: "22px",
                        }}
                        className="bgTheme removeFontSize"
                      >
                        <div
                          style={{
                            flex: 1,
                            width: "100%",
                            boxSizing: "border-box",
                            fontFamily: "Arial sans-serif !important",
                          }}
                        >
                          {ImportTaxInvoiceWithoutCharges()}
                        </div>
                      </div>
                    )}
                  </div>
                </>
              );
            case "Tax Invoice SLS":
              return (
                <>
                  <div
                    ref={(el) => (enquiryModuleRefs.current[index] = el)}
                    id="TaxInvoiceSls"
                  >
                    {texInvoiceChargeSLS?.length > 0 ? (
                      // Render taxInvoice if there are charges
                      Array.from({
                        length: texInvoiceChargeSLS?.length,
                      }).map((_, index) => (
                        <div
                          key={index}
                          style={{
                            width: "210mm",
                            height: "297mm",
                            margin: "auto",
                            boxSizing: "border-box",
                            pageBreakAfter:
                              index < data[0]?.tblInvoiceCharge?.length - 1
                                ? "always"
                                : "auto",
                            padding: "5mm",
                            display: "flex",
                            flexDirection: "column",
                            marginBottom: "22px",
                          }}
                          className="bgTheme removeFontSize"
                        >
                          <div
                            style={{
                              flex: 1,
                              width: "100%",
                              boxSizing: "border-box",
                              fontFamily: "Arial sans-serif !important",
                            }}
                          >
                            {taxInvoiceSLS(index)}
                          </div>
                        </div>
                      ))
                    ) : (
                      // Render taxInvoiceWithoutCharges if there are no charges
                      <div
                        style={{
                          width: "210mm",
                          height: "297mm",
                          margin: "auto",
                          boxSizing: "border-box",
                          padding: "5mm",
                          display: "flex",
                          flexDirection: "column",
                          marginBottom: "22px",
                        }}
                        className="bgTheme removeFontSize"
                      >
                        <div
                          style={{
                            flex: 1,
                            width: "100%",
                            boxSizing: "border-box",
                            fontFamily: "Arial sans-serif !important",
                          }}
                        >
                          {taxInvoiceWithoutCharges()}
                        </div>
                      </div>
                    )}
                  </div>
                </>
              );
            case "Tax Invoice Wships":
              return (
                <>
                  <div
                    ref={(el) => (enquiryModuleRefs.current[index] = el)}
                    id="TaxInvoice"
                  >
                    {texInvoiceCharge?.length > 0 ? (
                      // Render taxInvoice if there are charges
                      Array.from({
                        length: texInvoiceCharge?.length,
                      }).map((_, index) => (
                        <div
                          key={index}
                          style={{
                            width: "210mm",
                            height: "297mm",
                            margin: "auto",
                            boxSizing: "border-box",
                            pageBreakAfter:
                              index < data[0]?.tblInvoiceCharge?.length - 1
                                ? "always"
                                : "auto", // Ensure the correct page break setting
                            padding: "5mm", // space between page edge and inner border
                            display: "flex",
                            flexDirection: "column",
                            marginBottom: "22px",
                          }}
                          className="bgTheme removeFontSize"
                        >
                          <div
                            style={{
                              flex: 1,
                              width: "100%",
                              boxSizing: "border-box",
                              fontFamily: "Arial sans-serif !important",
                            }}
                          >
                            {taxInvoiceWships(index)}
                          </div>
                        </div>
                      ))
                    ) : (
                      // Render taxInvoiceWithoutCharges if there are no charges
                      <div
                        style={{
                          width: "210mm",
                          height: "297mm",
                          margin: "auto",
                          boxSizing: "border-box",
                          padding: "5mm", // space between page edge and inner border
                          display: "flex",
                          flexDirection: "column",
                          marginBottom: "22px",
                        }}
                        className="bgTheme removeFontSize"
                      >
                        <div
                          style={{
                            flex: 1,
                            width: "100%",
                            boxSizing: "border-box",
                            fontFamily: "Arial sans-serif !important",
                          }}
                        >
                          {taxInvoiceWithoutCharges()}
                        </div>
                      </div>
                    )}
                  </div>
                </>
              );
            case "Proforma Invoice":
              return (
                <>
                  <div
                    ref={(el) => (enquiryModuleRefs.current[index] = el)}
                    id="ProformaInvoice"
                  >
                    {charge?.length > 0 ? (
                      // Render taxInvoice if there are charges
                      Array.from({
                        length: charge?.length,
                      }).map((_, index) => (
                        <div
                          key={index}
                          style={{
                            width: "210mm",
                            height: "297mm",
                            margin: "auto",
                            boxSizing: "border-box",
                            pageBreakAfter:
                              index < data[0]?.tblInvoiceCharge?.length - 1
                                ? "always"
                                : "auto", // Ensure the correct page break setting
                            padding: "5mm", // space between page edge and inner border
                            display: "flex",
                            flexDirection: "column",
                            marginBottom: "22px",
                          }}
                          className="bgTheme removeFontSize"
                        >
                          <div
                            style={{
                              flex: 1,
                              width: "100%",
                              boxSizing: "border-box",
                              fontFamily: "Arial sans-serif !important",
                            }}
                          >
                            {ProformaInvoice(index)}
                          </div>
                          <style jsx>{`
                            .black-text {
                              color: black !important;
                            }
                          `}</style>
                        </div>
                      ))
                    ) : (
                      // Render taxInvoiceWithoutCharges if there are no charges
                      <div
                        style={{
                          width: "210mm",
                          height: "297mm",
                          margin: "auto",
                          boxSizing: "border-box",
                          padding: "5mm", // space between page edge and inner border
                          display: "flex",
                          flexDirection: "column",
                          marginBottom: "22px",
                        }}
                        className="bgTheme removeFontSize"
                      >
                        <div
                          style={{
                            flex: 1,
                            width: "100%",
                            boxSizing: "border-box",
                            fontFamily: "Arial sans-serif !important",
                          }}
                        >
                          {ProformaInvoiceWithoutCharges()}
                        </div>
                        <style jsx>{`
                          .black-text {
                            color: black !important;
                          }
                        `}</style>
                      </div>
                    )}
                  </div>
                </>
              );
            case "Invoice Print":
              return (
                <>
                  <div
                    key={index}
                    ref={(el) => (enquiryModuleRefs.current[index] = el)}
                    id="InvoicePrint"
                  >
                    {charge?.length > 0 ? (
                      // Render taxInvoice if there are charges
                      Array.from({
                        length: charge?.length,
                      }).map((_, index) => (
                        <>
                          <div
                            style={{
                              width: "210mm",
                              height: "297mm",
                              maxHeight: "297mm",
                              margin: "auto",
                              boxSizing: "border-box",
                              backgroundColor: "#fff",
                              pageBreakAfter:
                                index < reportIds.length - 1
                                  ? "always"
                                  : "auto",
                              padding: "5mm", // space between page edge and inner border
                              display: "flex",
                              flexDirection: "column",
                            }}
                            className="bgTheme removeFontSize"
                          >
                            <div
                              style={{
                                flex: 1,
                                width: "100%",
                                boxSizing: "border-box",
                                fontFamily: "Arial sans-serif !important",
                              }}
                            >
                              {invoicePrint(index)}
                            </div>
                          </div>
                          <div className="bg-gray-300 h-2 no-print" />
                          <div
                            style={{
                              width: "210mm",
                              height: "297mm",
                              maxHeight: "297mm",
                              margin: "auto",
                              boxSizing: "border-box",
                              backgroundColor: "#fff",
                              pageBreakAfter:
                                index < reportIds.length - 1
                                  ? "always"
                                  : "auto",
                              padding: "5mm", // space between page edge and inner border
                              display: "flex",
                              flexDirection: "column",
                              marginBottom: "22px",
                            }}
                            className="bgTheme removeFontSize"
                          >
                            <div
                              style={{
                                flex: 1,
                                width: "100%",
                                boxSizing: "border-box",
                                fontFamily: "Arial sans-serif !important",
                              }}
                            >
                              {InvoiceNewTermAndCondition(index)}
                            </div>
                          </div>
                        </>
                      ))
                    ) : (
                      // Render taxInvoiceWithoutCharges if there are no charges
                      <div
                        style={{
                          width: "210mm",
                          height: "297mm",
                          margin: "auto",
                          boxSizing: "border-box",
                          padding: "5mm", // space between page edge and inner border
                          display: "flex",
                          flexDirection: "column",
                          marginBottom: "22px",
                        }}
                        className="bgTheme removeFontSize"
                      >
                        <div
                          style={{
                            flex: 1,
                            width: "100%",
                            boxSizing: "border-box",
                            fontFamily: "Arial sans-serif !important",
                          }}
                        >
                          {invoicePrintWithoutCharges()}
                        </div>
                      </div>
                    )}
                  </div>
                </>
              );
            case "Credit Note":
              return (
                <>
                  <div
                    key={index}
                    ref={(el) => (enquiryModuleRefs.current[index] = el)}
                    id="InvoicePrint"
                  >
                    {charge?.length > 0 ? (
                      // Render taxInvoice if there are charges
                      Array.from({
                        length: charge?.length,
                      }).map((_, index) => (
                        <>
                          <div
                            style={{
                              width: "210mm",
                              height: "297mm",
                              maxHeight: "297mm",
                              margin: "auto",
                              boxSizing: "border-box",
                              backgroundColor: "#fff",
                              pageBreakAfter:
                                index < reportIds.length - 1
                                  ? "always"
                                  : "auto",
                              padding: "5mm", // space between page edge and inner border
                              display: "flex",
                              flexDirection: "column",
                            }}
                            className="bgTheme removeFontSize"
                          >
                            <div
                              style={{
                                flex: 1,
                                width: "100%",
                                boxSizing: "border-box",
                                fontFamily: "Arial sans-serif !important",
                              }}
                            >
                              {creditNotePrint(index)}
                            </div>
                          </div>
                          <div className="bg-gray-300 h-2 no-print" />
                          <div
                            style={{
                              width: "210mm",
                              height: "297mm",
                              maxHeight: "297mm",
                              margin: "auto",
                              boxSizing: "border-box",
                              backgroundColor: "#fff",
                              pageBreakAfter:
                                index < reportIds.length - 1
                                  ? "always"
                                  : "auto",
                              padding: "5mm", // space between page edge and inner border
                              display: "flex",
                              flexDirection: "column",
                              marginBottom: "22px",
                            }}
                            className="bgTheme removeFontSize"
                          >
                            <div
                              style={{
                                flex: 1,
                                width: "100%",
                                boxSizing: "border-box",
                                fontFamily: "Arial sans-serif !important",
                              }}
                            >
                              {InvoiceNewTermAndCondition(index)}
                            </div>
                          </div>
                        </>
                      ))
                    ) : (
                      // Render taxInvoiceWithoutCharges if there are no charges
                      <div
                        style={{
                          width: "210mm",
                          height: "297mm",
                          margin: "auto",
                          boxSizing: "border-box",
                          padding: "5mm", // space between page edge and inner border
                          display: "flex",
                          flexDirection: "column",
                          marginBottom: "22px",
                        }}
                        className="bgTheme removeFontSize"
                      >
                        <div
                          style={{
                            flex: 1,
                            width: "100%",
                            boxSizing: "border-box",
                            fontFamily: "Arial sans-serif !important",
                          }}
                        >
                          {invoicePrintWithoutCharges()}
                        </div>
                      </div>
                    )}
                  </div>
                </>
              );
            case "Sundry Invoice Print":
              return (
                <>
                  <div
                    ref={(el) => (enquiryModuleRefs.current[index] = el)}
                    id="SundryInvoicePrint"
                  >
                    {charge?.length > 0 ? (
                      // Render taxInvoice if there are charges
                      Array.from({
                        length: charge?.length,
                      }).map((_, index) => (
                        <div
                          key={index}
                          style={{
                            width: "210mm",
                            // height: "297mm",
                            margin: "auto",
                            boxSizing: "border-box",
                            backgroundColor: "#fff",
                            pageBreakAfter:
                              index < reportIds.length - 1 ? "always" : "auto",
                            padding: "5mm", // space between page edge and inner border
                            display: "flex",
                            flexDirection: "column",
                            marginBottom: "22px",
                          }}
                          className="bgTheme removeFontSize"
                        >
                          <div
                            style={{
                              flex: 1,
                              width: "100%",
                              boxSizing: "border-box",
                              fontFamily: "Arial sans-serif !important",
                            }}
                          >
                            {sundryInvoicePrint(index)}
                          </div>
                        </div>
                      ))
                    ) : (
                      // Render taxInvoiceWithoutCharges if there are no charges
                      <div
                        style={{
                          width: "210mm",
                          height: "297mm",
                          margin: "auto",
                          boxSizing: "border-box",
                          padding: "5mm", // space between page edge and inner border
                          display: "flex",
                          flexDirection: "column",
                          marginBottom: "22px",
                        }}
                        className="bgTheme removeFontSize"
                      >
                        <div
                          style={{
                            flex: 1,
                            width: "100%",
                            boxSizing: "border-box",
                            fontFamily: "Arial sans-serif !important",
                          }}
                        >
                          {sundryInvoicePrintWithoutCharges()}
                        </div>
                      </div>
                    )}
                  </div>
                </>
              );
            case "Sub Lease Invoice Print":
              return (
                <>
                  <div
                    ref={(el) => (enquiryModuleRefs.current[index] = el)}
                    id="SubLeaseInvoice"
                  >
                    {charge?.length > 0 ? (
                      // Render taxInvoice if there are charges
                      Array.from({
                        length: charge?.length,
                      }).map((_, index) => (
                        <>
                          <div
                            key={index}
                            style={{
                              width: "210mm",
                              // height: "297mm",
                              margin: "auto",
                              boxSizing: "border-box",
                              backgroundColor: "#fff",
                              pageBreakAfter:
                                index < reportIds.length - 1
                                  ? "always"
                                  : "auto",
                              padding: "5mm", // space between page edge and inner border
                              display: "flex",
                              flexDirection: "column",
                              marginBottom: "22px",
                            }}
                            className="bgTheme removeFontSize"
                          >
                            <div
                              style={{
                                flex: 1,
                                width: "100%",
                                boxSizing: "border-box",
                                fontFamily: "Arial sans-serif !important",
                              }}
                            >
                              {SubLeaseInvoice(index)}
                            </div>
                          </div>
                          <div className="bg-gray-300 h-2 no-print" />
                          {Array.isArray(chargeAtt) &&
                            // collect indexes of non-empty inner arrays
                            chargeAtt
                              .map((inner, idx) =>
                                Array.isArray(inner) && inner.length > 0
                                  ? idx
                                  : null,
                              )
                              .filter((v) => v !== null)
                              .map((idx, i, nonEmptyIdx) => (
                                <div
                                  key={idx}
                                  style={{
                                    width: "210mm",
                                    height: "297mm",
                                    maxHeight: "297mm",
                                    margin: "auto",
                                    boxSizing: "border-box",
                                    pageBreakAfter:
                                      i < nonEmptyIdx.length - 1
                                        ? "always"
                                        : "auto",
                                    padding: "5mm",
                                    display: "flex",
                                    flexDirection: "column",
                                    marginBottom: "22px",
                                  }}
                                  className="bgTheme removeFontSize"
                                >
                                  <BlAttachmentPrint
                                    chargeAtt={chargeAttOfSubLeas}
                                    // chargeAtt={chargeAtt} // pass full list if child uses index
                                    // If the child only needs the specific inner array, use:
                                    // chargeAtt={chargeAtt[idx]}
                                    index={idx}
                                    data={data}
                                    mode="print"
                                  />
                                </div>
                              ))}
                        </>
                      ))
                    ) : (
                      // Render taxInvoiceWithoutCharges if there are no charges
                      <div
                        style={{
                          width: "210mm",
                          height: "297mm",
                          margin: "auto",
                          boxSizing: "border-box",
                          padding: "5mm", // space between page edge and inner border
                          display: "flex",
                          flexDirection: "column",
                          marginBottom: "22px",
                        }}
                        className="bgTheme removeFontSize"
                      >
                        <div
                          style={{
                            flex: 1,
                            width: "100%",
                            boxSizing: "border-box",
                            fontFamily: "Arial sans-serif !important",
                          }}
                        >
                          {SubLeaseInvoiceWithoutCharges()}
                        </div>
                      </div>
                    )}
                  </div>
                  {/* <div
                    // className={
                    //   p === 0
                    //     ? "second-page bg-white mainPadding"
                    //     : "bg-white mainPadding"
                    // }
                    style={{
                      width: "210mm",
                      height: "297mm",
                      margin: "auto",
                      boxSizing: "border-box",
                      display: "flex",
                      flexDirection: "column",
                      backgroundColor: "#ffffff",
                    }}
                  >
                    {chargeAtt && chargeAtt.length > 0 && (
                      <BlAttachmentPrint chargeAtt={chargeAtt} index={index} />
                    )}
                  </div> */}
                </>
              );
            case "Sales Invoice Container wise":
              return (
                <>
                  <div
                    ref={(el) => (enquiryModuleRefs.current[index] = el)}
                    id="SalesInvoiceContainerWise"
                  >
                    {charge?.length > 0 ? (
                      // Render taxInvoice if there are charges
                      Array.from({
                        length: charge?.length,
                      }).map((_, index) => (
                        <div
                          key={index}
                          style={{
                            width: "210mm",
                            // height: "297mm",
                            margin: "auto",
                            boxSizing: "border-box",
                            backgroundColor: "#fff",
                            pageBreakAfter:
                              index < reportIds.length - 1 ? "always" : "auto",
                            padding: "5mm", // space between page edge and inner border
                            display: "flex",
                            flexDirection: "column",
                            marginBottom: "22px",
                          }}
                          className="bgTheme removeFontSize"
                        >
                          <div
                            style={{
                              flex: 1,
                              width: "100%",
                              boxSizing: "border-box",
                              fontFamily: "Arial sans-serif !important",
                            }}
                          >
                            {SalesInvoiceContainerWise(index)}
                          </div>
                        </div>
                      ))
                    ) : (
                      // Render taxInvoiceWithoutCharges if there are no charges
                      <div
                        style={{
                          width: "210mm",
                          // height: "297mm",
                          margin: "auto",
                          boxSizing: "border-box",
                          padding: "5mm", // space between page edge and inner border
                          display: "flex",
                          flexDirection: "column",
                          marginBottom: "22px",
                          pageBreakAfter:
                            index < reportIds.length - 1 ? "always" : "auto",
                        }}
                        className="bgTheme removeFontSize"
                      >
                        <div
                          style={{
                            flex: 1,
                            width: "100%",
                            boxSizing: "border-box",
                            fontFamily: "Arial sans-serif !important",
                          }}
                        >
                          {SalesInvoiceContainerWiseWithoutCharges()}
                        </div>
                      </div>
                    )}
                  </div>
                  <div
                    // className={
                    //   p === 0
                    //     ? "second-page bg-white mainPadding"
                    //     : "bg-white mainPadding"
                    // }
                    style={{
                      width: "210mm",
                      height: "297mm",
                      margin: "auto",
                      boxSizing: "border-box",
                      display: "flex",
                      flexDirection: "column",
                      backgroundColor: "#ffffff",
                    }}
                  >
                    {chargeAtt && chargeAtt.length > 0 && (
                      <BlAttachmentPrint chargeAtt={chargeAtt} index={index} />
                    )}
                  </div>
                </>
              );
            case "Invoice": {
              // Normalize charges properly
              const charges = Array.isArray(data)
                ? data[0]?.tblInvoiceCharge || []
                : data;
              // If your input is like [{...}] where charges live at data[0].tblInvoiceCharge, then:
              // const charges = data?.[0]?.tblInvoiceCharge || [];

              const pages = chunkForSLSKInvoicePrint(charges, 20); // or 20 per your requirement
              const totalPages = pages.length;

              return (
                <>
                  {/* One WRAPPER so the ref captures ALL pages' HTML */}
                  <div
                    key={`invoice-wrapper-${index}`}
                    ref={(el) => (enquiryModuleRefs.current[index] = el)}
                    data-report={`invoice-${index}`}
                    style={{ width: "210mm", margin: "auto" }}
                  >
                    {pages.map((rowsForPage, pgIndex) => {
                      const isFirst = pgIndex === 0;
                      const isLast = pgIndex === totalPages - 1;

                      return (
                        <div key={`invoice-block-${pgIndex}`}>
                          {/* One printable page */}
                          <div
                            id={`invoice-${pgIndex}`}
                            className="bgTheme removeFontSize black-text"
                            style={{
                              width: "210mm",
                              minHeight: "297mm",
                              maxHeight: "297mm",
                              margin: "auto",
                              boxSizing: "border-box",
                              padding: "5mm",
                              display: "flex",
                              //flexDirection: "column",
                              // page break after each page except the last
                              //breakAfter: isLast ? "auto" : "always",
                            }}
                          >
                            <div
                              style={{
                                flex: 1,
                                width: "100%",
                                boxSizing: "border-box",
                              }}
                            >
                              {isFirst ? (
                                <InvoiceSlsk
                                  rows={rowsForPage}
                                  fullData={data}
                                />
                              ) : (
                                <InvoiceSlskAttachSheet rows={rowsForPage} />
                              )}
                            </div>
                          </div>
                          {/* On-screen spacer only */}
                          <div className="bg-gray-300 h-2 no-print" />
                        </div>
                      );
                    })}
                    {Array.isArray(chargeAtt) &&
                      chargeAtt
                        .map((inner, idx) =>
                          Array.isArray(inner) && inner.length > 0 ? idx : null,
                        )
                        .filter((v) => v !== null)
                        .map((idx, i, nonEmptyIdx) => (
                          <div
                            key={idx}
                            style={{
                              width: "210mm",
                              height: "297mm",
                              maxHeight: "297mm",
                              margin: "auto",
                              boxSizing: "border-box",
                              pageBreakAfter:
                                i < nonEmptyIdx.length - 1 ? "always" : "auto",
                              padding: "5mm",
                              display: "flex",
                              flexDirection: "column",
                              marginBottom: "22px",
                            }}
                            className="bgTheme removeFontSize"
                          >
                            <InvoiceAttachmentSLSK
                              chargeAtt={chargeAtt}
                              index={idx}
                              fullData={data[0] || []}
                            />
                          </div>
                        ))}
                  </div>

                  {/* Global print CSS once */}
                  <style jsx global>{`
                    @page {
                      size: A4;
                      margin: 0;
                    }
                    @media print {
                      .no-print {
                        display: none !important;
                      }
                      .black-text {
                        color: black !important;
                      }
                      .bgTheme.removeFontSize {
                        break-inside: avoid;
                      }
                    }
                  `}</style>
                </>
              );
            }
            case "Tax Invoice Saudi":
              return (
                <>
                  <div
                    ref={(el) => (enquiryModuleRefs.current[index] = el)}
                    id="TaxInvoiceSaudi"
                  >
                    {/* {charge?.length > 0 ? (
                      // Render taxInvoice if there are charges
                      Array.from({
                        length: charge?.length,
                      }).map((_, index) => ( */}
                    <div
                      key={index}
                      style={{
                        width: "210mm",
                        height: "297mm",
                        margin: "auto",
                        boxSizing: "border-box",
                        pageBreakAfter:
                          index < data[0]?.tblInvoiceCharge?.length - 1
                            ? "always"
                            : "auto", // Ensure the correct page break setting
                        padding: "5mm", // space between page edge and inner border
                        display: "flex",
                        flexDirection: "column",
                        marginBottom: "22px",
                      }}
                      className="bgTheme removeFontSize"
                    >
                      <div
                        style={{
                          flex: 1,
                          width: "100%",
                          boxSizing: "border-box",
                          fontFamily: "Arial sans-serif !important",
                        }}
                      >
                        {taxInvoiceSaudi()}
                      </div>
                    </div>
                    {/* ))
                    ) : (
                      // Render taxInvoiceWithoutCharges if there are no charges
                      <div
                        style={{
                          width: "210mm",
                          height: "297mm",
                          margin: "auto",
                          boxSizing: "border-box",
                          padding: "5mm", // space between page edge and inner border
                          display: "flex",
                          flexDirection: "column",
                          marginBottom: "22px",
                        }}
                        className="bgTheme removeFontSize"
                      >
                        <div
                          style={{
                            flex: 1,
                            width: "100%",
                            boxSizing: "border-box",
                            fontFamily: "Arial sans-serif !important",
                          }}
                        >
                          {taxInvoiceWithoutCharges()}
                        </div>
                      </div>
                    )}*/}
                  </div>
                </>
              );
            case "Tax Invoice Receipt": {
              // Normalize charges properly
              const charges = Array.isArray(data)
                ? data[0]?.tblInvoiceCharge || []
                : data;
              // If your input is like [{...}] where charges live at data[0].tblInvoiceCharge, then:
              // const charges = data?.[0]?.tblInvoiceCharge || [];

              const pages = chunkForSLSKInvoicePrint(charges, 20); // or 20 per your requirement
              const totalPages = pages.length;

              return (
                <>
                  {/* One WRAPPER so the ref captures ALL pages' HTML */}
                  <div
                    key={`invoice-wrapper-${index}`}
                    ref={(el) => (enquiryModuleRefs.current[index] = el)}
                    data-report={`invoice-${index}`}
                    style={{ width: "210mm", margin: "auto" }}
                  >
                    {pages.map((rowsForPage, pgIndex) => {
                      const isFirst = pgIndex === 0;
                      const isLast = pgIndex === totalPages - 1;

                      return (
                        <div key={`invoice-block-${pgIndex}`}>
                          {/* One printable page */}
                          <div
                            id={`invoice-${pgIndex}`}
                            className="bgTheme removeFontSize black-text"
                            style={{
                              width: "210mm",
                              minHeight: "297mm",
                              maxHeight: "297mm",
                              margin: "auto",
                              boxSizing: "border-box",
                              padding: "5mm",
                              display: "flex",
                              //flexDirection: "column",
                              // page break after each page except the last
                              //breakAfter: isLast ? "auto" : "always",
                            }}
                          >
                            <div
                              style={{
                                flex: 1,
                                width: "100%",
                                boxSizing: "border-box",
                              }}
                            >
                              {isFirst ? (
                                <TaxInvoiceReceiptSLSK
                                  rows={rowsForPage}
                                  fullData={data}
                                />
                              ) : (
                                <TaxInvoiceReceiptSlskAttachSheet
                                  rows={rowsForPage}
                                />
                              )}
                            </div>
                          </div>

                          {/* On-screen spacer only */}
                          <div className="bg-gray-300 h-2 no-print" />
                        </div>
                      );
                    })}
                    {Array.isArray(chargeAtt) &&
                      chargeAtt
                        .map((inner, idx) =>
                          Array.isArray(inner) && inner.length > 0 ? idx : null,
                        )
                        .filter((v) => v !== null)
                        .map((idx, i, nonEmptyIdx) => (
                          <div
                            key={idx}
                            style={{
                              width: "210mm",
                              height: "297mm",
                              maxHeight: "297mm",
                              margin: "auto",
                              boxSizing: "border-box",
                              pageBreakAfter:
                                i < nonEmptyIdx.length - 1 ? "always" : "auto",
                              padding: "5mm",
                              display: "flex",
                              flexDirection: "column",
                              marginBottom: "22px",
                            }}
                            className="bgTheme removeFontSize"
                          >
                            <InvoiceAttachmentSLSK
                              chargeAtt={chargeAtt}
                              index={idx}
                              fullData={data[0] || []}
                            />
                          </div>
                        ))}
                  </div>

                  {/* Global print CSS once */}
                  <style jsx global>{`
                    @page {
                      size: A4;
                      margin: 0;
                    }
                    @media print {
                      .no-print {
                        display: none !important;
                      }
                      .black-text {
                        color: black !important;
                      }
                      .bgTheme.removeFontSize {
                        break-inside: avoid;
                      }
                    }
                  `}</style>
                </>
              );
            }
            case "Invoice YMS": {
              // Normalize charges properly
              const charges = Array.isArray(data)
                ? Array.isArray(data?.[0]?.tblInvoiceCharge)
                  ? data[0].tblInvoiceCharge
                  : []
                : Array.isArray(data)
                  ? data
                  : [];

              const pagesRaw = chunkForSLSKInvoicePrint(charges, 20);

              // ✅ force at least one page so UI/print renders once
              const pages =
                Array.isArray(pagesRaw) && pagesRaw.length > 0
                  ? pagesRaw
                  : [[]];

              const totalPages = pages.length;

              return (
                <>
                  {/* One WRAPPER so the ref captures ALL pages' HTML */}
                  <div
                    key={`invoice-wrapper-${index}`}
                    ref={(el) => (enquiryModuleRefs.current[index] = el)}
                    data-report={`invoice-${index}`}
                    style={{ width: "210mm", margin: "auto" }}
                  >
                    {pages.map((rowsForPage, pgIndex) => {
                      const isFirst = pgIndex === 0;
                      const isLast = pgIndex === totalPages - 1;

                      return (
                        <div key={`invoice-block-${pgIndex}`}>
                          {/* One printable page */}
                          <div
                            id={`invoice-${pgIndex}`}
                            className="bgTheme removeFontSize black-text"
                            style={{
                              width: "210mm",
                              minHeight: "297mm",
                              maxHeight: "297mm",
                              margin: "auto",
                              boxSizing: "border-box",
                              padding: "5mm",
                              display: "flex",
                              //flexDirection: "column",
                              // page break after each page except the last
                              //breakAfter: isLast ? "auto" : "always",
                            }}
                          >
                            <div
                              style={{
                                flex: 1,
                                width: "100%",
                                boxSizing: "border-box",
                              }}
                            >
                              {isFirst ? (
                                <InvoiceYms
                                  rows={rowsForPage}
                                  fullData={data}
                                />
                              ) : (
                                <InvoiceSlskAttachSheet rows={rowsForPage} />
                              )}
                            </div>
                          </div>
                          {/* On-screen spacer only */}
                          <div className="bg-gray-300 h-2 no-print" />
                        </div>
                      );
                    })}
                    {Array.isArray(chargeAtt) &&
                      chargeAtt
                        .map((inner, idx) =>
                          Array.isArray(inner) && inner.length > 0 ? idx : null,
                        )
                        .filter((v) => v !== null)
                        .map((idx, i, nonEmptyIdx) => (
                          <div
                            key={idx}
                            style={{
                              width: "210mm",
                              height: "297mm",
                              maxHeight: "297mm",
                              margin: "auto",
                              boxSizing: "border-box",
                              pageBreakAfter:
                                i < nonEmptyIdx.length - 1 ? "always" : "auto",
                              padding: "5mm",
                              display: "flex",
                              flexDirection: "column",
                              marginBottom: "22px",
                            }}
                            className="bgTheme removeFontSize"
                          >
                            <InvoiceAttachmentSLSK
                              chargeAtt={chargeAtt}
                              index={idx}
                              fullData={data[0] || []}
                            />
                          </div>
                        ))}
                  </div>

                  {/* Global print CSS once */}
                  <style jsx global>{`
                    @page {
                      size: A4;
                      margin: 0;
                    }
                    @media print {
                      .no-print {
                        display: none !important;
                      }
                      .black-text {
                        color: black !important;
                      }
                      .bgTheme.removeFontSize {
                        break-inside: avoid;
                      }
                    }
                  `}</style>
                </>
              );
            }
            case "Sales Invoice YMS": {
              // Normalize charges properly
              const charges = Array.isArray(data)
                ? Array.isArray(data?.[0]?.tblInvoiceCharge)
                  ? data[0].tblInvoiceCharge
                  : []
                : Array.isArray(data)
                  ? data
                  : [];

              const pagesRaw = chunkForSLSKInvoicePrint(charges, 20);

              // ✅ force at least one page so UI/print renders once
              const pages =
                Array.isArray(pagesRaw) && pagesRaw.length > 0
                  ? pagesRaw
                  : [[]];

              const totalPages = pages.length;

              return (
                <>
                  {/* One WRAPPER so the ref captures ALL pages' HTML */}
                  <div
                    key={`invoice-wrapper-${index}`}
                    ref={(el) => (enquiryModuleRefs.current[index] = el)}
                    data-report={`invoice-${index}`}
                    style={{ width: "210mm", margin: "auto" }}
                  >
                    {pages.map((rowsForPage, pgIndex) => {
                      const isFirst = pgIndex === 0;
                      const isLast = pgIndex === totalPages - 1;

                      return (
                        <div key={`invoice-block-${pgIndex}`}>
                          {/* One printable page */}
                          <div
                            id={`invoice-${pgIndex}`}
                            className="bgTheme removeFontSize black-text"
                            style={{
                              width: "210mm",
                              minHeight: "297mm",
                              maxHeight: "297mm",
                              margin: "auto",
                              boxSizing: "border-box",
                              padding: "5mm",
                              display: "flex",
                              //flexDirection: "column",
                              // page break after each page except the last
                              //breakAfter: isLast ? "auto" : "always",
                            }}
                          >
                            <div
                              style={{
                                flex: 1,
                                width: "100%",
                                boxSizing: "border-box",
                              }}
                            >
                              {isFirst ? (
                                <SalesInvoiceYms
                                  rows={rowsForPage}
                                  fullData={data}
                                />
                              ) : (
                                <SalesInvoiceSlskAttachSheet
                                  rows={rowsForPage}
                                />
                              )}
                            </div>
                          </div>
                          {/* On-screen spacer only */}
                          <div className="bg-gray-300 h-2 no-print" />
                        </div>
                      );
                    })}
                    {Array.isArray(chargeAtt) &&
                      chargeAtt
                        .map((inner, idx) =>
                          Array.isArray(inner) && inner.length > 0 ? idx : null,
                        )
                        .filter((v) => v !== null)
                        .map((idx, i, nonEmptyIdx) => (
                          <div
                            key={idx}
                            style={{
                              width: "210mm",
                              height: "297mm",
                              maxHeight: "297mm",
                              margin: "auto",
                              boxSizing: "border-box",
                              pageBreakAfter:
                                i < nonEmptyIdx.length - 1 ? "always" : "auto",
                              padding: "5mm",
                              display: "flex",
                              flexDirection: "column",
                              marginBottom: "22px",
                            }}
                            className="bgTheme removeFontSize"
                          >
                            <InvoiceAttachmentSLSK
                              chargeAtt={chargeAtt}
                              index={idx}
                              fullData={data[0] || []}
                            />
                          </div>
                        ))}
                  </div>

                  {/* Global print CSS once */}
                  <style jsx global>{`
                    @page {
                      size: A4;
                      margin: 0;
                    }
                    @media print {
                      .no-print {
                        display: none !important;
                      }
                      .black-text {
                        color: black !important;
                      }
                      .bgTheme.removeFontSize {
                        break-inside: avoid;
                      }
                    }
                  `}</style>
                </>
              );
            }
            case "TGK Invoice ":
              return (
                <>
                  <div
                    ref={(el) => (enquiryModuleRefs.current[index] = el)}
                    id="TaxInvoice"
                  >
                    {texInvoiceCharge?.length > 0 ? (
                      // Render taxInvoice if there are charges
                      Array.from({
                        length: texInvoiceCharge?.length,
                      }).map((_, index) => (
                        <div
                          key={index}
                          style={{
                            width: "210mm",
                            height: "297mm",
                            margin: "auto",
                            boxSizing: "border-box",
                            pageBreakAfter:
                              index < data[0]?.tblInvoiceCharge?.length - 1
                                ? "always"
                                : "auto",
                            padding: "5mm",
                            display: "flex",
                            flexDirection: "column",
                            marginBottom: "22px",
                          }}
                          className="bgTheme removeFontSize"
                        >
                          <div
                            style={{
                              flex: 1,
                              width: "100%",
                              boxSizing: "border-box",
                              fontFamily: "Arial sans-serif !important",
                            }}
                          >
                            {tgkInvoice(index)}
                          </div>
                        </div>
                      ))
                    ) : (
                      // Render taxInvoiceWithoutCharges if there are no charges
                      <div
                        style={{
                          width: "210mm",
                          height: "297mm",
                          margin: "auto",
                          boxSizing: "border-box",
                          padding: "5mm",
                          display: "flex",
                          flexDirection: "column",
                          marginBottom: "22px",
                        }}
                        className="bgTheme removeFontSize"
                      >
                        <div
                          style={{
                            flex: 1,
                            width: "100%",
                            boxSizing: "border-box",
                            fontFamily: "Arial sans-serif !important",
                          }}
                        >
                          {tgkTaxInvoiceWithoutCharges()}
                        </div>
                      </div>
                    )}
                  </div>
                </>
              );
            case "Tax Invoice SLS":
              return (
                <>
                  <div
                    ref={(el) => (enquiryModuleRefs.current[index] = el)}
                    id="TaxInvoiceSls"
                  >
                    {texInvoiceChargeSLS?.length > 0 ? (
                      // Render taxInvoice if there are charges
                      Array.from({
                        length: texInvoiceChargeSLS?.length,
                      }).map((_, index) => (
                        <div
                          key={index}
                          style={{
                            width: "210mm",
                            height: "297mm",
                            margin: "auto",
                            boxSizing: "border-box",
                            pageBreakAfter:
                              index < data[0]?.tblInvoiceCharge?.length - 1
                                ? "always"
                                : "auto",
                            padding: "5mm",
                            display: "flex",
                            flexDirection: "column",
                            marginBottom: "22px",
                          }}
                          className="bgTheme removeFontSize"
                        >
                          <div
                            style={{
                              flex: 1,
                              width: "100%",
                              boxSizing: "border-box",
                              fontFamily: "Arial sans-serif !important",
                            }}
                          >
                            {taxInvoiceSLS(index)}
                          </div>
                        </div>
                      ))
                    ) : (
                      // Render taxInvoiceWithoutCharges if there are no charges
                      <div
                        style={{
                          width: "210mm",
                          height: "297mm",
                          margin: "auto",
                          boxSizing: "border-box",
                          padding: "5mm",
                          display: "flex",
                          flexDirection: "column",
                          marginBottom: "22px",
                        }}
                        className="bgTheme removeFontSize"
                      >
                        <div
                          style={{
                            flex: 1,
                            width: "100%",
                            boxSizing: "border-box",
                            fontFamily: "Arial sans-serif !important",
                          }}
                        >
                          {taxInvoiceWithoutCharges()}
                        </div>
                      </div>
                    )}
                  </div>
                </>
              );
            case "General Sales Invoice Print":
              return (
                <div
                  ref={(el) => (enquiryModuleRefs.current[index] = el)}
                  id="GeneralSalesInvoice"
                >
                  {generalSalesInvoicePrint?.length > 0 &&
                    generalSalesInvoicePrint.map((_, i) => (
                      <div
                        key={i}
                        style={{
                          width: "210mm",
                          height: "297mm",
                          margin: "auto",
                          boxSizing: "border-box",
                          pageBreakAfter:
                            i < generalSalesInvoicePrint.length - 1
                              ? "always"
                              : "auto",
                          padding: "5mm",
                          display: "flex",
                          flexDirection: "column",
                          marginBottom: "22px",
                        }}
                        className="bgTheme removeFontSize"
                      >
                        <div
                          style={{
                            flex: 1,
                            width: "100%",
                            boxSizing: "border-box",
                            fontFamily: "Arial, sans-serif",
                          }}
                        >
                          {generalInvoice(i)}
                        </div>
                      </div>
                    ))}
                </div>
              );
            case "CreditNote Print":
              return (
                <div
                  ref={(el) => (enquiryModuleRefs.current[index] = el)}
                  id="CreditNotePrint1"
                >
                  {creditNotePrint1?.length > 0 &&
                    creditNotePrint1.map((_, i) => (
                      <div
                        key={i}
                        style={{
                          width: "210mm",
                          height: "297mm",
                          margin: "auto",
                          boxSizing: "border-box",
                          pageBreakAfter:
                            i < creditNotePrint1.length - 1 ? "always" : "auto",
                          padding: "5mm",
                          display: "flex",
                          flexDirection: "column",
                          marginBottom: "22px",
                        }}
                        className="bgTheme removeFontSize"
                      >
                        <div
                          style={{
                            flex: 1,
                            width: "100%",
                            boxSizing: "border-box",
                            fontFamily: "Arial, sans-serif",
                          }}
                        >
                          {creditPrint(i)}
                        </div>
                      </div>
                    ))}
                </div>
              );
            case "Domestic Invoice":
              return (
                <>
                  <div
                    ref={(el) => (enquiryModuleRefs.current[index] = el)}
                    id="TaxInvoice"
                  >
                    {invoiceChargeDataForTaxInvoice?.length > 0 ? (
                      // Render taxInvoice if there are charges
                      Array.from({
                        length: invoiceChargeDataForTaxInvoice?.length,
                      }).map((_, index) => (
                        <div
                          key={index}
                          style={{
                            width: "210mm",
                            height: "297mm",
                            margin: "auto",
                            boxSizing: "border-box",
                            pageBreakAfter:
                              index < data[0]?.tblInvoiceCharge?.length - 1
                                ? "always"
                                : "auto",
                            padding: "5mm",
                            display: "flex",
                            flexDirection: "column",
                            marginBottom: "22px",
                          }}
                          className="bgTheme removeFontSize"
                        >
                          <div
                            style={{
                              flex: 1,
                              width: "100%",
                              boxSizing: "border-box",
                              fontFamily: "Arial sans-serif !important",
                            }}
                          >
                            {domesticInvoice(index)}
                          </div>
                        </div>
                      ))
                    ) : (
                      // Render taxInvoiceWithoutCharges if there are no charges
                      <div
                        style={{
                          width: "210mm",
                          height: "297mm",
                          margin: "auto",
                          boxSizing: "border-box",
                          padding: "5mm",
                          display: "flex",
                          flexDirection: "column",
                          marginBottom: "22px",
                        }}
                        className="bgTheme removeFontSize"
                      >
                        <div
                          style={{
                            flex: 1,
                            width: "100%",
                            boxSizing: "border-box",
                            fontFamily: "Arial sans-serif !important",
                          }}
                        >
                          {taxInvoiceWithoutCharges()}
                        </div>
                      </div>
                    )}
                  </div>
                </>
              );
            case "Purchase Invoice": {
              const mainPages =
                purchaseInvoicePrint && purchaseInvoicePrint.length > 0
                  ? purchaseInvoicePrint
                  : [[]];

              const purchaseAttachmentPages =
                buildPurchaseInvoiceAttachmentPages(data?.[0], 32);

              const totalPrintablePages =
                mainPages.length + purchaseAttachmentPages.length;

              return (
                <div
                  ref={(el) => (enquiryModuleRefs.current[index] = el)}
                  id="TaxInvoice"
                >
                  {mainPages.map((_, i) => (
                    <div
                      key={`purchase-main-${i}`}
                      style={{
                        width: "210mm",
                        height: "297mm",
                        margin: "auto",
                        boxSizing: "border-box",
                        pageBreakAfter:
                          i < mainPages.length - 1 ||
                          purchaseAttachmentPages.length > 0
                            ? "always"
                            : "auto",
                        padding: "5mm",
                        display: "flex",
                        flexDirection: "column",
                        marginBottom: "22px",
                      }}
                      className="bgTheme removeFontSize"
                    >
                      <div
                        style={{
                          flex: 1,
                          width: "100%",
                          boxSizing: "border-box",
                          fontFamily: "Arial, sans-serif",
                        }}
                      >
                        {purchaseInvoice(i, totalPrintablePages)}
                      </div>
                    </div>
                  ))}

                  {purchaseAttachmentPages.map((pageGroups, attIndex) => (
                    <div
                      key={`purchase-attachment-${attIndex}`}
                      style={{
                        width: "210mm",
                        height: "297mm",
                        margin: "auto",
                        boxSizing: "border-box",
                        pageBreakAfter:
                          attIndex < purchaseAttachmentPages.length - 1
                            ? "always"
                            : "auto",
                        padding: "5mm",
                        display: "flex",
                        flexDirection: "column",
                        marginBottom: "22px",
                      }}
                      className="bgTheme removeFontSize"
                    >
                      <div
                        style={{
                          flex: 1,
                          width: "100%",
                          boxSizing: "border-box",
                          fontFamily: "Arial, sans-serif",
                        }}
                      >
                        <PurchaseInvoiceAttachmentSheet
                          data={data}
                          pageGroups={pageGroups}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              );
            }
            case "Tax Invoice Container": {
              const containerDetailRows =
                getTaxInvoiceContainerDetailRows(data);
              const hasContainerDetailRows = containerDetailRows.length > 0;
              const chargePageCount =
                invoiceChargeDataForTaxInvoice?.length || 0;
              const lastChargePageRowCount =
                invoiceChargeDataForTaxInvoice?.[chargePageCount - 1]?.length ||
                0;
              const firstPageAvailableMm =
                getTaxInvoiceContainerFirstDetailAvailableMm({
                  chargePageCount,
                  lastChargePageRowCount,
                  compactSummary: hasContainerDetailRows,
                });
              const containerDetailPages = buildTaxInvoiceContainerDetailPages(
                containerDetailRows,
                {
                  firstPageAvailableMm,
                },
              );
              const shouldAppendFirstContainerDetailPage =
                containerDetailPages.length > 0 &&
                containerDetailPages[0]?.canAppendToChargePage === true;
              const appendedContainerDetailPageCount =
                shouldAppendFirstContainerDetailPage ? 1 : 0;
              const totalPages =
                chargePageCount +
                Math.max(
                  containerDetailPages.length -
                    appendedContainerDetailPageCount,
                  0,
                );

              return (
                <>
                  <div
                    ref={(el) => (enquiryModuleRefs.current[index] = el)}
                    id="TaxInvoice"
                  >
                    {invoiceChargeDataForTaxInvoice?.length > 0 ? (
                      // Render taxInvoice if there are charges
                      Array.from({
                        length: totalPages,
                      }).map((_, pageIndex) => {
                        const isChargePage = pageIndex < chargePageCount;
                        const isLastChargePage =
                          pageIndex === chargePageCount - 1;
                        const detailPageIndex =
                          pageIndex -
                          chargePageCount +
                          appendedContainerDetailPageCount;
                        const containerDetailPage =
                          shouldAppendFirstContainerDetailPage &&
                          isLastChargePage
                            ? containerDetailPages[0]
                            : !isChargePage
                              ? containerDetailPages[detailPageIndex]
                              : null;
                        const containerDetailRowsForPage =
                          containerDetailPage?.rows || [];
                        const isLastPage = pageIndex === totalPages - 1;
                        const showTermsAndCondition =
                          containerDetailPage?.showTermsAndCondition ||
                          (containerDetailPages.length === 0 && isLastPage);
                        const compactContainerSummary =
                          shouldAppendFirstContainerDetailPage &&
                          isLastChargePage;

                        return (
                          <div
                            key={pageIndex}
                            style={{
                              width: "210mm",
                              height: "297mm",
                              margin: "auto",
                              boxSizing: "border-box",
                              pageBreakAfter:
                                pageIndex < totalPages - 1 ? "always" : "auto",
                              padding: "5mm",
                              display: "flex",
                              flexDirection: "column",
                              marginBottom: "22px",
                            }}
                            className="bgTheme removeFontSize"
                          >
                            <div
                              style={{
                                flex: 1,
                                width: "100%",
                                boxSizing: "border-box",
                                fontFamily: "Arial sans-serif !important",
                              }}
                            >
                              {isChargePage
                                ? taxInvoiceContainer({
                                    index: pageIndex,
                                    containerDetailRows:
                                      containerDetailRowsForPage,
                                    allContainerDetailRows: containerDetailRows,
                                    showContainerDetailGrandTotal:
                                      containerDetailPage?.showGrandTotal ||
                                      false,
                                    showTermsAndCondition,
                                    compactContainerSummary,
                                    totalPages,
                                  })
                                : taxInvoiceContainerDetailContinuation({
                                    pageIndex,
                                    containerDetailRows:
                                      containerDetailRowsForPage,
                                    allContainerDetailRows: containerDetailRows,
                                    showContainerDetailGrandTotal:
                                      containerDetailPage?.showGrandTotal ||
                                      false,
                                    showTermsAndCondition,
                                    totalPages,
                                  })}
                            </div>
                          </div>
                        );
                      })
                    ) : (
                      // Render taxInvoiceWithoutCharges if there are no charges
                      <div
                        style={{
                          width: "210mm",
                          height: "297mm",
                          margin: "auto",
                          boxSizing: "border-box",
                          padding: "5mm",
                          display: "flex",
                          flexDirection: "column",
                          marginBottom: "22px",
                        }}
                        className="bgTheme removeFontSize"
                      >
                        <div
                          style={{
                            flex: 1,
                            width: "100%",
                            boxSizing: "border-box",
                            fontFamily: "Arial sans-serif !important",
                          }}
                        >
                          {taxInvoiceWithoutCharges()}
                        </div>
                      </div>
                    )}
                  </div>
                </>
              );
            }

            default:
              return null;
          }
        })}
      </div>
    </main>
  );
}
export default rptInvoice;
