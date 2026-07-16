"use client";

import {
  getAssistantRouteIntent,
  normalizeAssistantText,
  scoreAssistantTextMatch,
} from "./assistantNavigation";

const PENDING_RECORD_OPEN_KEY = "assistant.pendingRecordOpen";
const RECORD_OPEN_MAX_AGE_MS = 2 * 60 * 1000;

function compactSpaces(value) {
  return String(value || "").replace(/\s+/g, " ").trim();
}

function cleanNavigationCommand(value) {
  return compactSpaces(
    String(value || "").replace(/\b(and|then)\s*$/i, " "),
  );
}

function cleanRecordValue(value) {
  return compactSpaces(
    String(value || "")
      .replace(/\s+(?:and|then)\s+(?:in|on)\s+.+?\s+(?:field|input|box)\s+[\s\S]*$/i, "")
      .replace(/\s+(?:and|then)\s+(?:write|type|enter|put|fill|set|select|choose|pick)\s+[\s\S]*$/i, "")
      .replace(/\s+(?:in\s+)?(?:current|same|this)\s+(?:form|page|screen|list|grid)\b[\s\S]*$/i, "")
      .replace(/^[-:=?>\s]+/, " ")
      .replace(/\bplease\b/gi, " "),
  );
}

function cleanRecordFieldLabel(value) {
  return compactSpaces(
    String(value || "")
      .replace(/\b(?:open|find|search|show|record|the|a|an|with|where|having)\b/gi, " ")
      .replace(/^[-:=?>\s]+/, " "),
  );
}

function normalizeRecordMode(value) {
  const raw = String(value || "").toLowerCase();
  if (raw.includes("view")) return "view";
  if (raw.includes("copy")) return "copy";
  return "edit";
}

function findRecordOpenMatch(raw) {
  const patterns = [
    {
      re: /\b(?:and\s+|then\s+)?(?:in\s+)?(edit|view|copy)\s+mode\s+(?:open\s+)?(?:the\s+)?record\s+(?:which\s+has|that\s+has|where|with|having)\s+(.+?)\s*(?:-|=|:|\bis\b|\bequals\b|\bequal\s+to\b)\s*(.+)$/i,
      modeIndex: 1,
      fieldIndex: 2,
      valueIndex: 3,
    },
    {
      re: /\b(?:and\s+|then\s+)?(?:open\s+)?(?:the\s+)?record\s+(?:in\s+)?(edit|view|copy)\s+mode\s+(?:which\s+has|that\s+has|where|with|having)\s+(.+?)\s*(?:-|=|:|\bis\b|\bequals\b|\bequal\s+to\b)\s*(.+)$/i,
      modeIndex: 1,
      fieldIndex: 2,
      valueIndex: 3,
    },
    {
      re: /\b(?:and\s+|then\s+)?(?:open\s+)?(?:the\s+)?record\s+(?:which\s+has|that\s+has|where|with|having)\s+(.+?)\s*(?:-|=|:|\bis\b|\bequals\b|\bequal\s+to\b)\s*(.+?)\s+(?:in\s+)?(edit|view|copy)\s+mode\b/i,
      modeIndex: 3,
      fieldIndex: 1,
      valueIndex: 2,
    },
  ];

  for (const pattern of patterns) {
    const match = raw.match(pattern.re);
    if (!match) continue;

    return {
      index: match.index,
      mode: normalizeRecordMode(match[pattern.modeIndex]),
      fieldLabel: compactSpaces(match[pattern.fieldIndex]),
      value: cleanRecordValue(match[pattern.valueIndex]),
    };
  }

  const shortPatterns = [
    {
      re: /\b(?:open|find|search|show)\s+(?:the\s+)?(?:record\s+)?(?:in\s+)?(?:(edit|view|copy)\s+mode\s+)?(?:with\s+|where\s+|having\s+)?((?:(?!\b(?:and|then)\s+(?:open|find|search|show)\b).)+?)\s*(?:-|=|:|\bis\b|\bequals\b|\bequal\s+to\b)\s*(.+?)\s+(?:in\s+)?(?:current|same|this)\s+(?:form|page|screen|list|grid)\b/i,
      modeIndex: 1,
      fieldIndex: 2,
      valueIndex: 3,
      currentPage: true,
    },
    {
      re: /\b(?:and\s+|then\s+)?(?:in\s+)?(?:(edit|view|copy)\s+mode\s+)?(?:open|find|search|show)\s+(?:the\s+)?(?:record\s+)?(?:with\s+|where\s+|having\s+)?((?:(?!\b(?:and|then)\s+(?:open|find|search|show)\b).)+?)\s*(?:-|=|:|\bis\b|\bequals\b|\bequal\s+to\b)\s*(.+)$/i,
      modeIndex: 1,
      fieldIndex: 2,
      valueIndex: 3,
      currentPage: false,
    },
    {
      re: /\b(?:open|find|search|show)\s+(.+?)\s+(?:by|using|from)\s+(.+?)\s+(?:in\s+)?(?:current|same|this)\s+(?:form|page|screen|list|grid)\b/i,
      valueIndex: 1,
      fieldIndex: 2,
      currentPage: true,
    },
  ];

  for (const pattern of shortPatterns) {
    const match = raw.match(pattern.re);
    if (!match) continue;

    const fieldLabel = cleanRecordFieldLabel(match[pattern.fieldIndex]);
    const value = cleanRecordValue(match[pattern.valueIndex]);
    if (!fieldLabel || !value) continue;

    return {
      index: match.index,
      mode: normalizeRecordMode(match[pattern.modeIndex]),
      fieldLabel,
      value,
      currentPage: pattern.currentPage || !cleanNavigationCommand(raw.slice(0, match.index)),
    };
  }

  return null;
}

export function parseAssistantRecordOpenCommand(command) {
  const raw = compactSpaces(command);
  if (!raw) return null;

  const match = findRecordOpenMatch(raw);
  if (!match?.fieldLabel || !match?.value) return null;

  return {
    mode: match.mode || "edit",
    fieldLabel: match.fieldLabel,
    value: match.value,
    currentPage: !!match.currentPage,
    navigationCommand: cleanNavigationCommand(raw.slice(0, match.index)),
  };
}

export function getNavigationCommandForRecordOpen(command) {
  const intent = parseAssistantRecordOpenCommand(command);
  return intent?.navigationCommand || command;
}

function writePendingPayload(payload) {
  sessionStorage.setItem(PENDING_RECORD_OPEN_KEY, JSON.stringify(payload));
}

export function savePendingRecordOpen(intent, routeIntent) {
  if (!intent?.fieldLabel || !intent?.value) return;

  try {
    writePendingPayload({
      fieldLabel: intent.fieldLabel,
      value: intent.value,
      mode: intent.mode || "edit",
      currentPage: !!intent.currentPage,
      routeMode:
        routeIntent?.mode ||
        getAssistantRouteIntent(intent.navigationCommand).mode,
      savedAt: Date.now(),
      searchAttempted: false,
    });
  } catch (error) {
    console.warn("[Assistant] unable to save pending record open", error);
  }
}

function readPendingRecordOpen() {
  try {
    const raw = sessionStorage.getItem(PENDING_RECORD_OPEN_KEY);
    if (!raw) return null;

    const parsed = JSON.parse(raw);
    if (Date.now() - Number(parsed?.savedAt || 0) > RECORD_OPEN_MAX_AGE_MS) {
      sessionStorage.removeItem(PENDING_RECORD_OPEN_KEY);
      return null;
    }

    return parsed?.fieldLabel && parsed?.value ? parsed : null;
  } catch {
    return null;
  }
}

function clearPendingRecordOpen() {
  try {
    sessionStorage.removeItem(PENDING_RECORD_OPEN_KEY);
  } catch (error) {
    console.warn("[Assistant] unable to clear pending record open", error);
  }
}

function visible(element) {
  if (!element) return false;
  const style = window.getComputedStyle(element);
  if (style.display === "none" || style.visibility === "hidden") return false;
  const rect = element.getBoundingClientRect();
  return rect.width > 0 && rect.height > 0;
}

function getCellText(element) {
  return compactSpaces(element?.textContent || "");
}

function scoreExactable(query, target) {
  const q = normalizeAssistantText(query);
  const t = normalizeAssistantText(target);
  if (!q || !t) return 0;
  if (q === t) return 130;
  if (t.includes(q)) return 95;
  if (q.includes(t)) return 80;
  return scoreAssistantTextMatch(query, target, target);
}

function getHeaderCells(table) {
  const rows = Array.from(table.querySelectorAll("thead tr")).filter(visible);
  const row = rows[rows.length - 1];
  return row ? Array.from(row.querySelectorAll("th,td")) : [];
}

function findHeaderMatch(table, fieldLabel) {
  const headerCells = getHeaderCells(table);
  return headerCells
    .map((cell, index) => ({
      cell,
      index,
      text: getCellText(cell),
      score: scoreExactable(fieldLabel, getCellText(cell)),
    }))
    .filter((match) => match.text && match.score >= 18)
    .sort((a, b) => b.score - a.score)[0] || null;
}

function findRowMatch(table, columnIndex, value) {
  const rows = Array.from(table.querySelectorAll("tbody tr")).filter(visible);

  return rows
    .map((row) => {
      const cells = Array.from(row.querySelectorAll("td,th"));
      const cell = cells[columnIndex];
      const text = getCellText(cell);
      return {
        row,
        cell,
        text,
        score: scoreExactable(value, text),
      };
    })
    .filter((match) => match.cell && match.score >= 50)
    .sort((a, b) => b.score - a.score)[0] || null;
}

function buttonMeaning(button) {
  const imageAlts = Array.from(button.querySelectorAll("img"))
    .map((img) => img.getAttribute("alt"))
    .filter(Boolean)
    .join(" ");

  return [
    button.getAttribute("aria-label"),
    button.getAttribute("title"),
    button.textContent,
    imageAlts,
  ]
    .filter(Boolean)
    .join(" ");
}

function findActionButton(row, mode) {
  const wanted = mode === "view" ? "view" : mode === "copy" ? "copy" : "edit";
  const buttons = Array.from(row.querySelectorAll("button")).filter(
    (button) => !button.disabled,
  );

  return buttons.find((button) => {
    const meaning = normalizeAssistantText(buttonMeaning(button));
    return meaning.split(" ").includes(wanted) || meaning.includes(wanted);
  }) || null;
}

function setNativeValue(input, value) {
  const proto = window.HTMLInputElement.prototype;
  const descriptor = Object.getOwnPropertyDescriptor(proto, "value");

  if (descriptor?.set) descriptor.set.call(input, value);
  else input.value = value;

  input.dispatchEvent(new InputEvent("input", { bubbles: true, data: value }));
  input.dispatchEvent(new Event("change", { bubbles: true }));
}

function sleep(ms) {
  return new Promise((resolve) => window.setTimeout(resolve, ms));
}

async function tryColumnFilter(headerCell, value) {
  headerCell.dispatchEvent(
    new MouseEvent("contextmenu", {
      bubbles: true,
      cancelable: true,
      view: window,
    }),
  );

  await sleep(50);

  const inputs = Array.from(
    document.querySelectorAll('input[aria-label="search..."], input[placeholder="Search..."]'),
  ).filter(visible);
  const input = inputs[inputs.length - 1];
  if (!input) return false;

  input.focus();
  setNativeValue(input, value);
  await sleep(20);

  input.dispatchEvent(
    new KeyboardEvent("keydown", {
      bubbles: true,
      cancelable: true,
      key: "Enter",
      code: "Enter",
    }),
  );

  const searchButton =
    input.closest(".MuiPaper-root")?.querySelector('button[aria-label="search"]') ||
    null;
  searchButton?.click?.();

  return true;
}

async function applyPendingRecordOpen(pending) {
  const tables = Array.from(document.querySelectorAll("table")).filter(visible);
  const tableMatches = tables
    .map((table) => ({
      table,
      header: findHeaderMatch(table, pending.fieldLabel),
    }))
    .filter((match) => match.header)
    .sort((a, b) => b.header.score - a.header.score);

  for (const tableMatch of tableMatches) {
    const rowMatch = findRowMatch(
      tableMatch.table,
      tableMatch.header.index,
      pending.value,
    );

    if (!rowMatch) continue;

    const button = findActionButton(rowMatch.row, pending.mode);
    if (!button) {
      console.debug("[Assistant] record row found but action button is missing", {
        pending,
        matchedCell: rowMatch.text,
      });
      return { applied: false };
    }

    rowMatch.row.scrollIntoView({ block: "center", inline: "nearest" });
    button.click();
    return {
      applied: true,
      matchedHeader: tableMatch.header.text,
      matchedValue: rowMatch.text,
    };
  }

  const bestHeader = tableMatches[0]?.header;
  if (bestHeader && !pending.searchAttempted) {
    const searchAttempted = await tryColumnFilter(bestHeader.cell, pending.value);
    if (searchAttempted) {
      console.debug("[Assistant] filtered grid for pending record open", {
        fieldLabel: pending.fieldLabel,
        value: pending.value,
        matchedHeader: bestHeader.text,
      });
      return { applied: false, searchAttempted: true };
    }
  }

  console.debug("[Assistant] pending record is not visible yet", pending);
  return { applied: false };
}

export async function tryApplyPendingRecordOpen() {
  const pending = readPendingRecordOpen();
  if (!pending) return { done: true, applied: false };

  try {
    const result = await applyPendingRecordOpen(pending);

    if (result.applied) {
      clearPendingRecordOpen();
      console.debug("[Assistant] pending record opened", {
        pending,
        result,
      });
      return {
        done: true,
        applied: true,
        pending,
        result,
      };
    }

    if (result.searchAttempted && !pending.searchAttempted) {
      writePendingPayload({
        ...pending,
        searchAttempted: true,
        savedAt: pending.savedAt || Date.now(),
      });
    }

    return {
      done: false,
      applied: false,
      pending,
      result,
    };
  } catch (error) {
    console.error("[Assistant] pending record open failed", error);
    return { done: false, applied: false, pending };
  }
}
