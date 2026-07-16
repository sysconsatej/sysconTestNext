"use client";

import {
  dynamicDropDownFieldsData,
  fetchReportData,
} from "@/services/auth/FormControl.services";
import { getUserDetails, updateUserDetails } from "@/helper/userDetails";

import {
  normalizeAssistantText,
  scoreAssistantTextMatch,
} from "./assistantNavigation";

const ACTION_WORDS = /\b(change|switch|set|select|use|update)\b/i;

const CONTEXT_KINDS = {
  company: {
    storageKey: "companyId",
    userDataKey: "defaultCompanyId",
    label: "company",
    referenceTable: "tblCompany",
    referenceColumn: "name",
  },
  branch: {
    storageKey: "branchId",
    userDataKey: "defaultBranchId",
    label: "branch",
    referenceTable: "tblCompanyBranch",
    referenceColumn: "name",
  },
  financialYear: {
    storageKey: "financialYear",
    userDataKey: "defaultFinYearId",
    label: "financial year",
    referenceTable: "tblFinancialYear",
    referenceColumn: "financialYear",
  },
};

export function parseAssistantContextSwitchCommand(command) {
  const raw = String(command || "").trim();
  const normalized = normalizeAssistantText(raw);
  if (!raw || !ACTION_WORDS.test(raw)) return null;

  let kind = null;
  if (/\b(company\s+branch|branch)\b/i.test(raw)) kind = "branch";
  else if (/\b(financial\s+year|fin\s+year|fiscal\s+year|fy|year)\b/i.test(raw)) {
    kind = "financialYear";
  } else if (/\bcompany\b/i.test(raw)) kind = "company";

  if (!kind) return null;

  const value = raw
    .replace(ACTION_WORDS, " ")
    .replace(/\b(company\s+branch|financial\s+year|fin\s+year|fiscal\s+year)\b/gi, " ")
    .replace(/\b(company|branch|fy|year|to|as|into|for|please)\b/gi, " ")
    .replace(/\s+/g, " ")
    .trim();

  return {
    kind,
    value,
    normalized,
    label: CONTEXT_KINDS[kind].label,
  };
}

function currentCompanyId() {
  const sessionCompany = sessionStorage.getItem("companyId");
  const user = getUserDetails();
  return sessionCompany || user?.defaultCompanyId || user?.companyId || "";
}

function optionLabel(option) {
  return String(
    option?.label ??
      option?.name ??
      option?.financialYear ??
      option?.text ??
      option?.value ??
      "",
  ).trim();
}

function optionValue(option) {
  return option?.value ?? option?.id ?? null;
}

function uniqueOptions(options) {
  const seen = new Set();
  const out = [];

  (Array.isArray(options) ? options : []).forEach((option) => {
    const value = optionValue(option);
    const key = value == null ? optionLabel(option) : String(value);
    if (!key || seen.has(key)) return;

    seen.add(key);
    out.push(option);
  });

  return out;
}

function getDropdownFilter(kind, companyId) {
  const user = getUserDetails();
  const clientId = user?.clientId;

  if (kind === "company") {
    return ` and ownCompany='y' and clientId = ${clientId}`;
  }

  if (kind === "branch") {
    return ` and clientId = ${clientId} and companyId = ${companyId}`;
  }

  const companyFilter = companyId ? ` and companyId = ${companyId}` : "";
  return ` and clientId = ${clientId}${companyFilter}`;
}

async function fetchContextOptions(kind, query = "", value = null, companyId = "") {
  const meta = CONTEXT_KINDS[kind];
  const response = await dynamicDropDownFieldsData({
    onfilterkey: "status",
    onfiltervalue: 1,
    referenceTable: meta.referenceTable,
    referenceColumn: meta.referenceColumn,
    dropdownFilter: getDropdownFilter(kind, companyId),
    search: query,
    pageNo: query ? 1 : 1,
    value,
  });

  return Array.isArray(response?.data) ? response.data : [];
}

async function loadContextOptions(kind, query) {
  const companyId = currentCompanyId();
  if ((kind === "branch" || kind === "financialYear") && !companyId) {
    return [];
  }

  const numericValue = /^\d+$/.test(String(query || "").trim())
    ? Number(String(query).trim())
    : null;

  const [searched, byValue] = await Promise.all([
    fetchContextOptions(kind, query, null, companyId),
    numericValue != null
      ? fetchContextOptions(kind, "", numericValue, companyId)
      : Promise.resolve([]),
  ]);

  if (searched.length || byValue.length || !query) {
    return uniqueOptions([...searched, ...byValue]);
  }

  return uniqueOptions(await fetchContextOptions(kind, "", null, companyId));
}

function findBestContextOption(options, query) {
  const q = String(query || "").trim();
  if (!q) return null;

  const matches = uniqueOptions(options)
    .map((option) => {
      const label = optionLabel(option);
      const value = optionValue(option);
      let score = scoreAssistantTextMatch(q, `${label} ${value ?? ""}`, label);

      if (String(value ?? "") === q) score += 100;
      if (normalizeAssistantText(label) === normalizeAssistantText(q)) {
        score += 80;
      }

      return { option, label, value, score };
    })
    .filter((match) => match.score >= 18)
    .sort((a, b) => b.score - a.score || a.label.localeCompare(b.label));

  return matches[0] || null;
}

async function updateBranchHeaderFooter(branchId) {
  try {
    const requestData = {
      columns: "cbd.header,cbd.footer",
      tableName: `tblCompanyBranchParameterDetails cbd 
          join tblCompanyBranchParameter cb 
            on cb.id = cbd.companyBranchParameterId 
           and cb.companyBranchId = ${branchId}`,
      whereCondition: "1=1",
      clientIdCondition: "cbd.status=1 FOR JSON PATH , INCLUDE_NULL_VALUES ",
    };
    const { data } = await fetchReportData(requestData);

    updateUserDetails({
      defaultBranchId: branchId,
      footerLogoPath: data?.[0]?.footer,
      headerLogoPath: data?.[0]?.header,
    });
  } catch (error) {
    console.warn("[Assistant] branch header/footer update failed", error);
    updateUserDetails({ defaultBranchId: branchId });
  }
}

async function updateCompanyLogo(companyId) {
  try {
    const requestData = {
      columns: "cpd.logo",
      tableName: `tblCompanyParameter cp 
          left join tblCompanyParameterDetails cpd on cpd.companyParameterId =  cp.id`,
      whereCondition: `cp.companyId=${companyId}`,
      clientIdCondition:
        "cp.status=1 and cpd.status=1 FOR JSON PATH , INCLUDE_NULL_VALUES ",
    };
    const { data } = await fetchReportData(requestData);
    updateUserDetails({ companyLogo: data?.[0]?.logo });
  } catch (error) {
    console.warn("[Assistant] company logo update failed", error);
  }
}

async function setBranch(option) {
  const branchId = optionValue(option);
  if (branchId == null) return;

  sessionStorage.setItem("branchId", branchId);
  sessionStorage.removeItem("breadCrumbs");
  localStorage.removeItem("breadCrumbs");
  await updateBranchHeaderFooter(branchId);
}

async function setFinancialYear(option) {
  const financialYearId = optionValue(option);
  if (financialYearId == null) return;

  sessionStorage.setItem("financialYear", financialYearId);
  sessionStorage.removeItem("breadCrumbs");
  localStorage.removeItem("breadCrumbs");
  updateUserDetails({ defaultFinYearId: financialYearId });
}

async function setCompany(option) {
  const companyId = optionValue(option);
  if (companyId == null) return;

  sessionStorage.setItem("companyId", companyId);
  sessionStorage.removeItem("branchId");
  sessionStorage.removeItem("financialYear");
  sessionStorage.removeItem("breadCrumbs");
  localStorage.removeItem("breadCrumbs");

  updateUserDetails({ defaultCompanyId: companyId });

  const [branches, years] = await Promise.all([
    fetchContextOptions("branch", "", null, companyId),
    fetchContextOptions("financialYear", "", null, companyId),
    updateCompanyLogo(companyId),
  ]);

  if (branches?.[0]) await setBranch(branches[0]);

  if (years?.[0]) await setFinancialYear(years[0]);
}

export async function handleAssistantContextSwitch(command) {
  const intent = parseAssistantContextSwitchCommand(command);
  if (!intent) return { handled: false };

  if (!intent.value) {
    return {
      handled: true,
      success: false,
      message: `Tell me which ${intent.label} to switch to`,
    };
  }

  const options = await loadContextOptions(intent.kind, intent.value);
  const match = findBestContextOption(options, intent.value);

  console.debug("[Assistant] context switch resolved", {
    input: command,
    intent,
    optionCount: options.length,
    match,
  });

  if (!match) {
    return {
      handled: true,
      success: false,
      message: `No matching ${intent.label} found`,
    };
  }

  if (intent.kind === "company") await setCompany(match.option);
  if (intent.kind === "branch") await setBranch(match.option);
  if (intent.kind === "financialYear") await setFinancialYear(match.option);

  return {
    handled: true,
    success: true,
    message: `Switching ${intent.label} to ${match.label}`,
  };
}
