"use client";

import {
  getAssistantRouteIntent,
  normalizeAssistantText,
  scoreAssistantTextMatch,
} from "./assistantNavigation";

const PENDING_FILL_KEY = "assistant.pendingFormFill";
const FILL_MAX_AGE_MS = 60 * 1000;

const FILL_ACTION_WORDS =
  "write|type|enter|put|fill|set|select|choose|pick|check|tick|mark|uncheck|untick|clear|unset";

function compactSpaces(value) {
  return String(value || "").replace(/\s+/g, " ").trim();
}

function cleanValue(value) {
  return compactSpaces(
    String(value || "")
      .replace(/\b(and\s+)?(then\s+)?(press|click|save|submit)\b[\s\S]*$/i, "")
      .replace(/\bplease\b/gi, " ")
      .replace(/^[-:=?>\s]+/, " "),
  );
}

function cleanNavigationCommand(value) {
  return compactSpaces(
    String(value || "").replace(/\b(and|then)\s*$/i, " "),
  );
}

function normalizeFillAction(action) {
  const raw = String(action || "").toLowerCase();
  if (["select", "choose", "pick"].includes(raw)) return "select";
  if (["check", "tick", "mark"].includes(raw)) return "check";
  if (["uncheck", "untick"].includes(raw)) return "uncheck";
  if (["clear", "unset"].includes(raw)) return "clear";
  return "write";
}

function findFieldFirstFillStarts(raw) {
  const pattern = new RegExp(
    `\\b(?:and\\s+|then\\s+)?(?:in|on)\\s+((?:(?!\\b(?:and|then)\\s+(?:in|on)\\b).)+?)\\s+(?:field|input|box)\\s+(${FILL_ACTION_WORDS})\\s*`,
    "gi",
  );
  const starts = [];
  let match = pattern.exec(raw);

  while (match) {
    starts.push({
      index: match.index,
      end: pattern.lastIndex,
      fieldLabel: compactSpaces(match[1]),
      action: normalizeFillAction(match[2]),
    });
    match = pattern.exec(raw);
  }

  return starts;
}

function parseFieldFirstFills(raw) {
  const starts = findFieldFirstFillStarts(raw);
  if (!starts.length) return null;

  const fills = starts
    .map((start, index) => {
      const next = starts[index + 1];
      const rawValue = cleanValue(raw.slice(start.end, next?.index ?? raw.length));
      const value = rawValue || start.action;

      return {
        action: start.action,
        fieldLabel: start.fieldLabel,
        value,
      };
    })
    .filter((fill) => fill.fieldLabel && fill.value);

  if (!fills.length) return null;

  return {
    fills,
    navigationCommand: cleanNavigationCommand(raw.slice(0, starts[0].index)),
  };
}

function parseValueFirstFill(raw) {
  const pattern = new RegExp(
    `\\b(${FILL_ACTION_WORDS})\\s+(.+?)\\s+(?:in|on|into)\\s+(.+?)\\s+(?:field|input|box)\\b`,
    "i",
  );
  const match = raw.match(pattern);
  if (!match) return null;

  const fill = {
    action: normalizeFillAction(match[1]),
    value: cleanValue(match[2]),
    fieldLabel: compactSpaces(match[3]),
  };
  if (!fill.fieldLabel || !fill.value) return null;

  return {
    fills: [fill],
    navigationCommand: cleanNavigationCommand(raw.slice(0, match.index)),
  };
}

export function parseAssistantFormFillCommand(command) {
  const raw = compactSpaces(command);
  if (!raw) return null;

  const parsed = parseFieldFirstFills(raw) || parseValueFirstFill(raw);
  if (!parsed?.fills?.length) return null;

  const fallbackCommand = parsed.fills.reduce(
    (text, fill) =>
      text
        .replace(fill.fieldLabel, " ")
        .replace(fill.value, " ")
        .replace(fill.action, " "),
    raw,
  );
  const navigationCommand = parsed.navigationCommand || fallbackCommand;
  const firstFill = parsed.fills[0];

  return {
    ...firstFill,
    fills: parsed.fills,
    navigationCommand,
  };
}

export function getNavigationCommandForAssistant(command) {
  const fill = parseAssistantFormFillCommand(command);
  return fill?.navigationCommand || command;
}

function writePendingPayload(payload) {
  sessionStorage.setItem(PENDING_FILL_KEY, JSON.stringify(payload));
}

export function savePendingFormFill(fill, routeIntent) {
  const fills = Array.isArray(fill?.fills)
    ? fill.fills
    : fill?.fieldLabel && fill?.value
      ? [fill]
      : [];

  if (!fills.length) return;

  try {
    writePendingPayload({
      fills,
      mode:
        routeIntent?.mode ||
        getAssistantRouteIntent(fill.navigationCommand).mode,
      savedAt: Date.now(),
    });
  } catch (error) {
    console.warn("[Assistant] unable to save pending form fill", error);
  }
}

function readPendingFormFill() {
  try {
    const raw = sessionStorage.getItem(PENDING_FILL_KEY);
    if (!raw) return null;

    const parsed = JSON.parse(raw);
    const fills = Array.isArray(parsed?.fills)
      ? parsed.fills
      : parsed?.fieldLabel && parsed?.value
        ? [parsed]
        : [];

    if (Date.now() - Number(parsed?.savedAt || 0) > FILL_MAX_AGE_MS) {
      sessionStorage.removeItem(PENDING_FILL_KEY);
      return null;
    }

    return fills.length ? { ...parsed, fills } : null;
  } catch {
    return null;
  }
}

function clearPendingFormFill() {
  try {
    sessionStorage.removeItem(PENDING_FILL_KEY);
  } catch (error) {
    console.warn("[Assistant] unable to clear pending form fill", error);
  }
}

function cssEscape(value) {
  if (typeof CSS !== "undefined" && typeof CSS.escape === "function") {
    return CSS.escape(value);
  }
  return String(value || "").replace(/"/g, '\\"');
}

function getFieldWrapper(input) {
  let cur = input?.parentElement || null;
  while (cur) {
    const id = cur.getAttribute?.("id") || "";
    if (id && !id.startsWith("react-select")) return cur;
    cur = cur.parentElement;
  }
  return null;
}

function getAssociatedLabel(input) {
  if (!input) return "";

  const id = input.getAttribute("id");
  const labelByFor = id
    ? document.querySelector(`label[for="${cssEscape(id)}"]`)
    : null;
  if (labelByFor?.textContent) return labelByFor.textContent;

  const wrapper = getFieldWrapper(input);
  const label = wrapper?.querySelector?.("label");
  if (label?.textContent) return label.textContent;

  return wrapper?.textContent || "";
}

function candidateSearchText(input) {
  const wrapper = getFieldWrapper(input);
  const parts = [
    input.getAttribute("name"),
    input.getAttribute("id"),
    input.getAttribute("placeholder"),
    input.getAttribute("aria-label"),
    wrapper?.getAttribute?.("id"),
    getAssociatedLabel(input),
  ];

  return parts.filter(Boolean).join(" ");
}

function visibleAndEditable(element) {
  if (!element || element.disabled || element.readOnly) return false;
  const style = window.getComputedStyle(element);
  if (style.display === "none" || style.visibility === "hidden") return false;
  const rect = element.getBoundingClientRect();
  return rect.width > 0 && rect.height > 0;
}

function isReactSelectInput(input) {
  const id = input?.getAttribute?.("id") || "";
  return !!(
    id.includes("react-select") ||
    input?.closest?.(".react-select__control")
  );
}

function isNativeSelect(element) {
  return String(element?.tagName || "").toUpperCase() === "SELECT";
}

function isContentEditable(element) {
  return element?.isContentEditable === true;
}

function inputType(element) {
  return String(element?.getAttribute?.("type") || "").toLowerCase();
}

function isCheckableInput(element) {
  const type = inputType(element);
  return type === "checkbox" || type === "radio";
}

function isRadioInput(element) {
  return inputType(element) === "radio";
}

function isCheckboxInput(element) {
  return inputType(element) === "checkbox";
}

function allFillCandidates() {
  return Array.from(
    document.querySelectorAll(
      'input:not([type="hidden"]):not([type="file"]), textarea, select, [contenteditable="true"]',
    ),
  ).filter(visibleAndEditable);
}

function findBestField(fill) {
  const normalized = normalizeAssistantText(fill?.fieldLabel);
  if (!normalized) return null;

  const wantsSelect = fill.action === "select";
  const wantsCheck = ["check", "uncheck", "clear"].includes(fill.action);
  const matches = allFillCandidates()
    .map((element) => {
      const searchText = candidateSearchText(element);
      let score = scoreAssistantTextMatch(normalized, searchText, searchText);
      const reactSelect = isReactSelectInput(element);
      const nativeSelect = isNativeSelect(element);
      const checkable = isCheckableInput(element);

      if (wantsSelect && (reactSelect || nativeSelect || checkable)) score += 30;
      if (wantsCheck && checkable) score += 35;
      if (!wantsSelect && !wantsCheck && reactSelect) score += 8;

      return {
        element,
        input: element,
        score,
        searchText,
        reactSelect,
        nativeSelect,
        checkable,
      };
    })
    .filter((match) => match.score >= 18)
    .sort((a, b) => b.score - a.score);

  return matches[0] || null;
}

function setNativeValue(input, value) {
  const proto =
    input.tagName === "TEXTAREA"
      ? window.HTMLTextAreaElement.prototype
      : window.HTMLInputElement.prototype;
  const descriptor = Object.getOwnPropertyDescriptor(proto, "value");

  if (descriptor?.set) descriptor.set.call(input, value);
  else input.value = value;

  input.dispatchEvent(new InputEvent("input", { bubbles: true, data: value }));
  input.dispatchEvent(new Event("change", { bubbles: true }));
}

function setContentEditableValue(element, value) {
  element.textContent = value;
  element.dispatchEvent(new InputEvent("input", { bubbles: true, data: value }));
  element.dispatchEvent(new Event("change", { bubbles: true }));
}

function sleep(ms) {
  return new Promise((resolve) => window.setTimeout(resolve, ms));
}

function mouseDownAndClick(element) {
  element.dispatchEvent(
    new MouseEvent("mousedown", { bubbles: true, cancelable: true }),
  );
  element.dispatchEvent(
    new MouseEvent("mouseup", { bubbles: true, cancelable: true }),
  );
  element.click?.();
}

function optionSearchText(element) {
  const wrapper = element.closest("label") || getFieldWrapper(element);
  return [
    element.getAttribute?.("value"),
    element.getAttribute?.("aria-label"),
    wrapper?.textContent,
  ]
    .filter(Boolean)
    .join(" ");
}

function relatedCheckableInputs(match) {
  const input = match.input;
  const type = inputType(input);
  const name = input.getAttribute("name");
  const wrapper = getFieldWrapper(input);
  const scoped = wrapper
    ? Array.from(wrapper.querySelectorAll(`input[type="${type}"]`))
    : [];
  const byName = name
    ? Array.from(document.querySelectorAll(`input[type="${type}"][name="${cssEscape(name)}"]`))
    : [];

  return Array.from(new Set([...scoped, ...byName, input])).filter(
    visibleAndEditable,
  );
}

function truthyFillValue(value) {
  const normalized = normalizeAssistantText(value);
  if (["false", "no", "n", "0", "off", "unchecked", "uncheck"].includes(normalized)) {
    return false;
  }
  return true;
}

function bestRelatedCheckable(fill, match) {
  const related = relatedCheckableInputs(match);
  if (!related.length) return match.input;

  const value = normalizeAssistantText(fill.value);
  if (!value || ["check", "uncheck", "clear"].includes(value)) {
    return match.input;
  }

  return related
    .map((input) => {
      const searchText = optionSearchText(input);
      return {
        input,
        score: scoreAssistantTextMatch(fill.value, searchText, searchText),
      };
    })
    .filter((candidate) => candidate.score >= 10)
    .sort((a, b) => b.score - a.score)[0]?.input || match.input;
}

function applyCheckableFill(fill, match) {
  const input = bestRelatedCheckable(fill, match);
  const shouldCheck =
    fill.action === "uncheck" || fill.action === "clear"
      ? false
      : truthyFillValue(fill.value);

  if (isRadioInput(input)) {
    if (!input.checked) mouseDownAndClick(input);
    return { applied: true };
  }

  if (isCheckboxInput(input)) {
    if (input.checked !== shouldCheck) mouseDownAndClick(input);
    else input.dispatchEvent(new Event("change", { bubbles: true }));
    return { applied: true };
  }

  return { applied: false };
}

function findBestVisibleOption(value) {
  const options = Array.from(
    document.querySelectorAll(
      '[role="option"], .react-select__option, [id*="-option-"]',
    ),
  ).filter((option) => {
    const style = window.getComputedStyle(option);
    const rect = option.getBoundingClientRect();
    return (
      style.display !== "none" &&
      style.visibility !== "hidden" &&
      rect.width > 0 &&
      rect.height > 0
    );
  });

  return options
    .map((option) => {
      const text = compactSpaces(option.textContent || "");
      let score = scoreAssistantTextMatch(value, text, text);
      if (normalizeAssistantText(text) === normalizeAssistantText(value)) {
        score += 80;
      }
      return { option, text, score };
    })
    .filter((match) => match.score >= 18)
    .sort((a, b) => b.score - a.score)[0];
}

async function applySelectFill(fill, match) {
  const input = match.input;
  if (match.nativeSelect) return applyNativeSelectFill(fill, match);
  if (match.checkable) return applyCheckableFill(fill, match);
  if (!match.reactSelect) return { applied: false };

  const control = input.closest(".react-select__control") || input;

  mouseDownAndClick(control);
  await sleep(80);

  input.focus();
  setNativeValue(input, fill.value);
  input.dispatchEvent(
    new KeyboardEvent("keydown", {
      bubbles: true,
      cancelable: true,
      key: "ArrowDown",
      code: "ArrowDown",
    }),
  );

  await sleep(450);

  const option = findBestVisibleOption(fill.value);
  if (!option?.option) {
    return { applied: false };
  }

  mouseDownAndClick(option.option);
  input.dispatchEvent(new FocusEvent("blur", { bubbles: true }));
  input.blur?.();

  return {
    applied: true,
    selectedText: option.text,
  };
}

function applyNativeSelectFill(fill, match) {
  const select = match.input;
  const options = Array.from(select.options || []);

  if (fill.action === "clear") {
    if (select.multiple) {
      options.forEach((option) => {
        option.selected = false;
      });
    } else {
      select.value = "";
    }

    select.dispatchEvent(new Event("input", { bubbles: true }));
    select.dispatchEvent(new Event("change", { bubbles: true }));
    select.dispatchEvent(new FocusEvent("blur", { bubbles: true }));
    return { applied: true };
  }

  const best = options
    .map((option) => {
      const text = `${option.textContent || ""} ${option.value || ""}`;
      let score = scoreAssistantTextMatch(fill.value, text, text);
      if (normalizeAssistantText(option.value) === normalizeAssistantText(fill.value)) {
        score += 80;
      }
      return { option, score };
    })
    .filter((candidate) => candidate.score >= 10)
    .sort((a, b) => b.score - a.score)[0];

  if (!best?.option) return { applied: false };

  if (select.multiple) best.option.selected = true;
  else select.value = best.option.value;

  select.dispatchEvent(new Event("input", { bubbles: true }));
  select.dispatchEvent(new Event("change", { bubbles: true }));
  select.dispatchEvent(new FocusEvent("blur", { bubbles: true }));
  return { applied: true, selectedText: best.option.textContent || best.option.value };
}

async function applyWriteFill(fill, match) {
  if (match.reactSelect) return applySelectFill(fill, match);
  if (match.nativeSelect) return applyNativeSelectFill(fill, match);
  if (match.checkable) return applyCheckableFill(fill, match);
  const value = fill.action === "clear" ? "" : fill.value;

  if (isContentEditable(match.input)) {
    match.input.focus();
    setContentEditableValue(match.input, value);
    match.input.blur?.();
    return { applied: true };
  }

  match.input.focus();
  setNativeValue(match.input, value);
  match.input.dispatchEvent(new FocusEvent("blur", { bubbles: true }));
  match.input.blur?.();
  return { applied: true };
}

async function applyOneFill(fill) {
  const normalizedFill = {
    ...fill,
    action: normalizeFillAction(fill?.action),
    value: cleanValue(fill?.value),
    fieldLabel: compactSpaces(fill?.fieldLabel),
  };
  const match = findBestField(normalizedFill);
  if (!match?.input) {
    console.debug("[Assistant] form field not visible yet", normalizedFill);
    return { applied: false };
  }

  if (["select", "check", "uncheck", "clear"].includes(normalizedFill.action)) {
    const selected = await applySelectFill(normalizedFill, match);
    if (!selected.applied && !match.reactSelect) {
      return applyWriteFill(normalizedFill, match);
    }
    return {
      ...selected,
      match,
    };
  }

  const written = await applyWriteFill(normalizedFill, match);
  return {
    ...written,
    match,
  };
}

export async function tryApplyPendingFormFill() {
  const pending = readPendingFormFill();
  if (!pending) return { done: true, applied: false };

  const remaining = [];
  const applied = [];

  for (const fill of pending.fills) {
    try {
      const result = await applyOneFill(fill);
      if (result.applied) {
        applied.push({
          ...fill,
          selectedText: result.selectedText,
          matchedText: result.match?.searchText,
          score: result.match?.score,
        });
      } else {
        remaining.push(fill);
      }
    } catch (error) {
      console.error("[Assistant] pending form fill failed", error);
      remaining.push(fill);
    }
  }

  if (remaining.length) {
    try {
      writePendingPayload({
        ...pending,
        fills: remaining,
        savedAt: pending.savedAt || Date.now(),
      });
    } catch (error) {
      console.warn("[Assistant] unable to update pending form fill", error);
    }
    console.debug("[Assistant] pending form fills still waiting", remaining);
  } else {
    clearPendingFormFill();
  }

  if (applied.length) {
    console.debug("[Assistant] pending form fills applied", applied);
  }

  return {
    done: remaining.length === 0,
    applied: applied.length > 0,
    appliedCount: applied.length,
    pending: applied[0] || pending.fills[0],
    appliedFills: applied,
    remainingFills: remaining,
  };
}
