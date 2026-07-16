"use client";

import { encryptUrlFun } from "@/utils";

const COMMAND_WORDS =
  /\b(open|go|goto|launch|show|navigate|menu|page|screen|please|the|to|and|then)\b/gi;

const ADD_MODE_WORDS =
  /\b(add\s+mode|in\s+add\s+mode|new\s+mode|create\s+mode|add|new|create|form)\b/gi;

const LARGE_MENU_PREFILTER_THRESHOLD = 250;

export function normalizeAssistantText(value) {
  return String(value || "")
    .toLowerCase()
    .replace(COMMAND_WORDS, " ")
    .replace(/[^a-z0-9]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function getAssistantRouteIntent(command) {
  const raw = String(command || "");
  const addMode =
    /\b(add\s+mode|in\s+add\s+mode|new\s+mode|create\s+mode)\b/i.test(raw) ||
    /\b(open|go|launch|show|navigate)\b[\s\S]*\b(add|new|create)\b/i.test(raw) ||
    /\b(add|new|create)\b[\s\S]*\b(form|record|entry)\b/i.test(raw);

  return {
    mode: addMode ? "add" : "list",
    searchText: addMode ? raw.replace(ADD_MODE_WORDS, " ") : raw,
  };
}

function textTokens(value) {
  return normalizeAssistantText(value).split(" ").filter(Boolean);
}

function levenshteinDistance(a, b) {
  const left = String(a || "");
  const right = String(b || "");
  if (left === right) return 0;
  if (!left.length) return right.length;
  if (!right.length) return left.length;

  let previous = Array.from({ length: right.length + 1 }, (_, i) => i);

  for (let i = 1; i <= left.length; i++) {
    const current = [i];

    for (let j = 1; j <= right.length; j++) {
      const cost = left[i - 1] === right[j - 1] ? 0 : 1;
      current[j] = Math.min(
        current[j - 1] + 1,
        previous[j] + 1,
        previous[j - 1] + cost,
      );
    }

    previous = current;
  }

  return previous[right.length];
}

function tokenSimilarity(a, b) {
  const left = String(a || "");
  const right = String(b || "");
  if (!left || !right) return 0;
  if (left === right) return 1;
  if (left.includes(right) || right.includes(left)) {
    return Math.min(left.length, right.length) / Math.max(left.length, right.length);
  }

  const distance = levenshteinDistance(left, right);
  return 1 - distance / Math.max(left.length, right.length);
}

function bestTokenSimilarity(token, targetTokens) {
  return (targetTokens || []).reduce(
    (best, targetToken) => Math.max(best, tokenSimilarity(token, targetToken)),
    0,
  );
}

function tokenMatchesFuzzy(token, targetTokens) {
  if (!token) return false;
  if ((targetTokens || []).includes(token)) return true;
  if ((targetTokens || []).some((targetToken) => targetToken.startsWith(token))) {
    return true;
  }

  const threshold = token.length <= 4 ? 0.75 : 0.72;
  return bestTokenSimilarity(token, targetTokens) >= threshold;
}

function containsWholePhrase(text, phrase) {
  const safeText = normalizeAssistantText(text);
  const safePhrase = normalizeAssistantText(phrase);
  if (!safeText || !safePhrase) return false;
  return ` ${safeText} `.includes(` ${safePhrase} `);
}

function roughCandidateHit(command, candidate) {
  const query = normalizeAssistantText(command);
  const target = candidate?.searchText || "";
  if (!query || !target) return false;
  if (target.includes(query)) return true;

  const queryTokens = textTokens(query);
  if (!queryTokens.length) return false;

  return queryTokens.some((token) => {
    if (target.includes(token)) return true;
    if (token.length <= 2) return target.includes(token);
    return target.includes(token.slice(0, Math.min(4, token.length)));
  });
}

function isLeafMenu(item) {
  return !Array.isArray(item?.child) || item.child.length === 0;
}

export function flattenMenuTree(items, parentPath = []) {
  const out = [];

  (Array.isArray(items) ? items : []).forEach((item) => {
    if (!item) return;

    const path = [...parentPath, item];
    const label = String(item.menuName || "").trim();
    const leafMenu = isLeafMenu(item);
    const staticRoute =
      String(item.menuType || "").toLowerCase() === "s" &&
      !!cleanMenuLink(item.menuLink);
    const routeReady =
      leafMenu ||
      staticRoute;

    if (label && routeReady) {
      out.push({
        item,
        path,
        label,
        isLeaf: leafMenu,
        isStaticRoute: staticRoute,
        depth: path.length,
        searchText: normalizeAssistantText(
          [label, ...path.map((p) => p?.menuName || "")].join(" "),
        ),
        breadcrumbs: path.map((p) => p?.menuName).filter(Boolean).join(","),
      });
    }

    if (Array.isArray(item.child) && item.child.length) {
      out.push(...flattenMenuTree(item.child, path));
    }
  });

  return out;
}

export function scoreAssistantTextMatch(query, targetText, labelText = "") {
  const q = normalizeAssistantText(query);
  const target = normalizeAssistantText(targetText);
  if (!q || !target) return 0;

  const qTokens = textTokens(q);
  const targetTokens = textTokens(target);
  const label = normalizeAssistantText(labelText);
  const labelTokens = textTokens(label);
  if (!qTokens.length) return 0;

  if (label === q) return 160;
  if (target === q) return 145;
  if (containsWholePhrase(label, q)) return 135 + Math.min(10, q.length);
  if (containsWholePhrase(target, q)) return 95 + Math.min(12, q.length);

  let score = 0;
  qTokens.forEach((token) => {
    if (targetTokens.includes(token)) score += 18;
    else if (targetTokens.some((targetToken) => targetToken.startsWith(token))) {
      score += 8;
    }
    else {
      const fuzzy = bestTokenSimilarity(token, targetTokens);
      if (fuzzy >= 0.84) score += 16;
      else if (token.length >= 4 && fuzzy >= 0.72) score += 10;
    }
  });

  if (
    labelTokens.length &&
    qTokens.every((token) => labelTokens.includes(token))
  ) {
    score += 55;
  }
  if (label.startsWith(q)) score += 24;
  if (qTokens.every((token) => tokenMatchesFuzzy(token, targetTokens))) {
    score += 15;
  }

  return score;
}

export function scoreMenuCandidate(query, candidate) {
  if (!candidate?.searchText) return 0;
  return scoreAssistantTextMatch(query, candidate.searchText, candidate.label);
}

export function resolveMenuCandidates(command, candidates, limit = 5) {
  const allCandidates = Array.isArray(candidates) ? candidates : [];
  const roughMatches =
    allCandidates.length > LARGE_MENU_PREFILTER_THRESHOLD
      ? allCandidates.filter((candidate) => roughCandidateHit(command, candidate))
      : allCandidates;
  const scoringPool = roughMatches.length ? roughMatches : allCandidates;

  const matches = scoringPool
    .map((candidate) => ({
      ...candidate,
      score: scoreMenuCandidate(command, candidate),
    }))
    .filter((candidate) => candidate.score > 0)
    .sort(
      (a, b) =>
        b.score - a.score ||
        Number(!!b.isLeaf) - Number(!!a.isLeaf) ||
        Number(b.depth || 0) - Number(a.depth || 0) ||
        a.label.localeCompare(b.label),
    );

  return {
    command: normalizeAssistantText(command),
    best: matches[0] || null,
    candidates: matches.slice(0, limit),
  };
}

export function resolveMenuCommand(command, menuItems, limit = 5) {
  return resolveMenuCandidates(command, flattenMenuTree(menuItems), limit);
}

function buildMenuPayload(item) {
  return {
    id: item?.id,
    menuName: item?.menuName,
    parentMenuId: item?.parentMenuId,
  };
}

function cleanMenuLink(value) {
  const link = String(value ?? "").trim();
  if (!link || link === "null" || link === "undefined" || link === "/default") {
    return "";
  }
  return link;
}

function rawMenuLink(value) {
  return String(value ?? "").trim();
}

function parseLooseBool(value) {
  if (value === true || value === false) return value;
  const normalized = String(value ?? "").trim().toLowerCase();
  if (normalized === "true") return true;
  if (normalized === "false") return false;
  return null;
}

function firstDefinedFormControlFlag(path, fallbackItem) {
  const nodes = Array.isArray(path) && path.length ? path : [fallbackItem];
  for (const node of nodes) {
    const parsed = parseLooseBool(node?.isFormcontrol);
    if (parsed !== null) return parsed;
  }
  return parseLooseBool(fallbackItem?.isFormcontrol);
}

function getPathMenuLinks(path, fallbackItem) {
  const nodes = Array.isArray(path) && path.length ? path : [fallbackItem];
  return nodes
    .map((node) => cleanMenuLink(node?.menuLink))
    .filter(Boolean);
}

function getModuleLink(path, item) {
  const links = getPathMenuLinks(path, item);
  const itemLink = cleanMenuLink(item?.menuLink);

  if (itemLink) return itemLink;
  if (links.includes("/invoiceControl")) return "/invoiceControl";
  if (links.includes("/voucherControl")) return "/voucherControl";
  if (links.includes("/dynamicReports")) return "/dynamicReports";

  return links[0] || "";
}

function hasDefaultLinkInPath(path, item) {
  const nodes = Array.isArray(path) && path.length ? path : [item];
  return nodes.some((node) => rawMenuLink(node?.menuLink) === "/default");
}

function buildJsonMenuQueryRoute(baseRoute, payload) {
  if (!baseRoute || payload?.id == null) return null;
  return `${baseRoute}?menuName=${encryptUrlFun(payload)}`;
}

function buildJsonMenuSearchRoute(baseRoute, payload) {
  if (!baseRoute || payload?.id == null) return null;
  return `${baseRoute}/search/${encryptUrlFun(payload)}`;
}

function buildIdMenuQueryRoute(baseRoute, item) {
  if (!baseRoute || item?.id == null) return null;
  return `${baseRoute}?menuName=${item.id}`;
}

function buildDynamicReportRoute(item) {
  const reportId = item?.reportId ?? item?.ReportId ?? item?.reportMenuId;
  return reportId == null ? null : `/dynamicReports?menuName=${reportId}`;
}

export function buildMenuRoute(menuPath, item, opts = {}) {
  const safePath = Array.isArray(menuPath) && menuPath.length ? menuPath : [item];
  const leaf = safePath[safePath.length - 1] || item;
  const targetItem = item || leaf;
  const leafIsStatic = String(leaf?.menuType || "").toLowerCase() === "s";
  const noChildren = isLeafMenu(leaf);
  const mode = String(opts?.mode || "list").toLowerCase();
  const payload = buildMenuPayload(targetItem);
  const formControlFlag = firstDefinedFormControlFlag(safePath, targetItem);
  const moduleLink = getModuleLink(safePath, targetItem);
  const defaultLinked = hasDefaultLinkInPath(safePath, targetItem);
  const leafMenuLink = cleanMenuLink(leaf?.menuLink);

  if (mode === "add") {
    if (leafIsStatic || !noChildren) return null;

    if (moduleLink === "/invoiceControl") {
      return buildJsonMenuSearchRoute("/invoiceControl", payload);
    }

    if (moduleLink === "/voucherControl") {
      return buildJsonMenuSearchRoute("/voucherControl", payload);
    }

    if (
      formControlFlag === true ||
      defaultLinked ||
      !moduleLink
    ) {
      return buildJsonMenuSearchRoute("/formControl", payload);
    }

    return null;
  }

  if (leafIsStatic) {
    return leafMenuLink || null;
  }

  if (!noChildren) return null;

  if (formControlFlag === true) return buildJsonMenuQueryRoute("/formControl", payload);

  if (moduleLink === "/invoiceControl") {
    return buildJsonMenuQueryRoute("/invoiceControl", payload);
  }

  if (moduleLink === "/voucherControl") {
    return buildJsonMenuQueryRoute("/voucherControl", payload);
  }

  if (moduleLink === "/dynamicReports") {
    return buildDynamicReportRoute(targetItem);
  }

  if (formControlFlag === false) {
    if (defaultLinked || !moduleLink) {
      return (
        buildDynamicReportRoute(targetItem) ||
        buildJsonMenuQueryRoute("/formControl", payload)
      );
    }

    return buildIdMenuQueryRoute(moduleLink, targetItem);
  }

  if (moduleLink) {
    return buildIdMenuQueryRoute(moduleLink, targetItem);
  }

  return buildJsonMenuQueryRoute("/formControl", payload);
}

export function persistAssistantBreadcrumbs(candidate) {
  if (!candidate?.breadcrumbs) return;

  try {
    localStorage.setItem("breadCrumbs", JSON.stringify(candidate.breadcrumbs));
    sessionStorage.setItem("breadCrumbs", JSON.stringify(candidate.breadcrumbs));
  } catch (error) {
    console.warn("[Assistant] failed to persist breadcrumbs", error);
  }
}
