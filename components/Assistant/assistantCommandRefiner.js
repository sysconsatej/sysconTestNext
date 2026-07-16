"use client";

import {
  getAssistantRouteIntent,
  normalizeAssistantText,
  scoreAssistantTextMatch,
} from "./assistantNavigation";

const WORD_FIXES = {
  adn: "and",
  agancy: "agency",
  agncy: "agency",
  aproval: "approval",
  approvl: "approval",
  aprroval: "approval",
  cntrl: "control",
  contrl: "control",
  creat: "create",
  dashbord: "dashboard",
  delivary: "delivery",
  delievery: "delivery",
  delvery: "delivery",
  frm: "form",
  imoprt: "import",
  impor: "import",
  importt: "import",
  invocie: "invoice",
  lanch: "launch",
  navigte: "navigate",
  nw: "new",
  oepn: "open",
  opem: "open",
  opne: "open",
  plese: "please",
  pls: "please",
  plz: "please",
  qotation: "quotation",
  qutation: "quotation",
  reocrd: "record",
  serch: "search",
  shwo: "show",
  taht: "that",
  whch: "which",
};

const ACTION_WORDS = new Set([
  "add",
  "and",
  "change",
  "choose",
  "company",
  "copy",
  "create",
  "edit",
  "field",
  "fill",
  "find",
  "go",
  "having",
  "in",
  "is",
  "mode",
  "new",
  "open",
  "pick",
  "please",
  "record",
  "select",
  "set",
  "show",
  "then",
  "to",
  "type",
  "view",
  "where",
  "which",
  "with",
  "write",
]);

const EMPTY_VOCABULARY = { tokens: [], tokenSet: new Set() };
const VOCABULARY_CACHE = new WeakMap();
const MAX_VOCABULARY_FUZZY_POOL = 350;

function compactSpaces(value) {
  return String(value || "").replace(/\s+/g, " ").trim();
}

function normalizeInputText(value) {
  return compactSpaces(
    String(value || "")
      .replace(/[\u201C\u201D]/g, '"')
      .replace(/[\u2018\u2019]/g, "'")
      .replace(/[\u2010\u2011\u2012\u2013\u2014]/g, "-")
      .replace(/\baddmode\b/gi, "add mode")
      .replace(/\beditmode\b/gi, "edit mode")
      .replace(/\bviewmode\b/gi, "view mode")
      .replace(/\bcopymode\b/gi, "copy mode")
      .replace(/\bh\s*b\s*l\b/gi, "HBL")
      .replace(/\bm\s*b\s*l\b/gi, "MBL")
      .replace(/\bn\s*v\s*o\s*c\s*c\b/gi, "NVOCC")
      .replace(/\bno\./gi, "no")
      .replace(/\s*([:=])\s*/g, " $1 ")
      .replace(/\s+-\s+/g, " - "),
  );
}

function applyPhraseFixes(value) {
  return compactSpaces(
    value
      .replace(/\b(?:can|could|would)\s+you\s+(?:please\s+)?/gi, "please ")
      .replace(/\b(?:i\s+want|i\s+need)\s+to\s+/gi, "please ")
      .replace(/\btake\s+me\s+to\b/gi, "open")
      .replace(/\bnavigate\s+(?:me\s+)?to\b/gi, "open")
      .replace(/\bgo\s+to\b/gi, "open")
      .replace(/\bgoto\b/gi, "open")
      .replace(/\bshow\s+me\b/gi, "open")
      .replace(/\bstart\b/gi, "open")
      .replace(/\bcreate\s+(?:a\s+)?new\s+(?:record|entry|one)?\b/gi, "add mode")
      .replace(/\bmake\s+(?:a\s+)?new\s+(?:record|entry|one)?\b/gi, "add mode")
      .replace(/\bnew\s+(?:record|entry|one)\b/gi, "add mode")
      .replace(/\bopen\s+add\s+mode\b/gi, "add mode")
      .replace(/\bopen\s+edit\s+mode\b/gi, "edit mode"),
  );
}

function applyWordFixes(value) {
  return value.replace(/\b[a-zA-Z]+\b/g, (word) => {
    const fixed = WORD_FIXES[word.toLowerCase()];
    return fixed || word;
  });
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
  const left = String(a || "").toLowerCase();
  const right = String(b || "").toLowerCase();
  if (!left || !right) return 0;
  if (left === right) return 1;
  if (left.includes(right) || right.includes(left)) {
    return Math.min(left.length, right.length) / Math.max(left.length, right.length);
  }

  const distance = levenshteinDistance(left, right);
  return 1 - distance / Math.max(left.length, right.length);
}

function getCandidateVocabulary(candidates) {
  if (!Array.isArray(candidates) || !candidates.length) return EMPTY_VOCABULARY;

  const cached = VOCABULARY_CACHE.get(candidates);
  if (cached) return cached;

  const vocab = new Set();

  candidates.forEach((candidate) => {
    normalizeAssistantText(
      [candidate?.label, candidate?.breadcrumbs, candidate?.searchText]
        .filter(Boolean)
        .join(" "),
    )
      .split(" ")
      .filter((token) => token.length >= 3)
      .forEach((token) => vocab.add(token));
  });

  const result = { tokens: Array.from(vocab), tokenSet: vocab };
  VOCABULARY_CACHE.set(candidates, result);
  return result;
}

function shouldCorrectToken(token) {
  const raw = String(token || "");
  const lower = raw.toLowerCase();
  if (raw.length < 4) return false;
  if (/\d/.test(raw)) return false;
  if (ACTION_WORDS.has(lower)) return false;
  if (/^[A-Z0-9]{2,}$/.test(raw)) return false;
  return true;
}

function getVocabularyFuzzyPool(lower, vocabulary) {
  const tokens = vocabulary?.tokens || [];
  if (tokens.length <= MAX_VOCABULARY_FUZZY_POOL) return tokens;

  const first = lower[0];
  const two = lower.slice(0, 2);
  const exactPrefix = [];
  const firstLetter = [];

  for (const token of tokens) {
    if (token.slice(0, 2) === two) exactPrefix.push(token);
    else if (token[0] === first) firstLetter.push(token);

    if (exactPrefix.length >= MAX_VOCABULARY_FUZZY_POOL) break;
  }

  const pool = exactPrefix.length ? exactPrefix : firstLetter;
  return pool.slice(0, MAX_VOCABULARY_FUZZY_POOL);
}

function correctWithVocabulary(value, candidates) {
  const vocabulary = getCandidateVocabulary(candidates);
  if (!vocabulary.tokens.length) return value;

  return value.replace(/\b[a-zA-Z][a-zA-Z0-9]*\b/g, (word) => {
    if (!shouldCorrectToken(word)) return word;

    const lower = word.toLowerCase();
    if (vocabulary.tokenSet.has(lower)) return word;

    const pool = getVocabularyFuzzyPool(lower, vocabulary);
    if (!pool.length) return word;

    const best = pool
      .map((token) => ({
        token,
        score: tokenSimilarity(lower, token),
      }))
      .sort((a, b) => b.score - a.score)[0];

    const threshold = word.length <= 5 ? 0.78 : 0.72;
    return best?.score >= threshold ? best.token : word;
  });
}

function ensureNavigationVerb(value, candidates) {
  const text = compactSpaces(value);
  if (!text) return text;
  if (/\b(open|go|goto|launch|show|navigate|change|set|select|choose)\b/i.test(text)) {
    return text;
  }

  const likelyMenu = (Array.isArray(candidates) ? candidates : []).some(
    (candidate) => scoreAssistantTextMatch(text, candidate?.searchText, candidate?.label) >= 24,
  );

  return likelyMenu ? `open ${text}` : text;
}

function getBestMenuMatch(command, candidates) {
  return (Array.isArray(candidates) ? candidates : [])
    .map((candidate) => ({
      ...candidate,
      score: scoreAssistantTextMatch(command, candidate?.searchText, candidate?.label),
    }))
    .filter((candidate) => candidate.score >= 24)
    .sort((a, b) => b.score - a.score || a.label.localeCompare(b.label))[0] || null;
}

function humanizeCommand(command, bestMenu) {
  const intent = getAssistantRouteIntent(command);
  if (bestMenu?.label) {
    return intent.mode === "add"
      ? `Open ${bestMenu.label} in add mode`
      : `Open ${bestMenu.label}`;
  }

  const cleaned = compactSpaces(command);
  return cleaned ? cleaned.charAt(0).toUpperCase() + cleaned.slice(1) : "";
}

export function refineAssistantCommand(command, candidates = [], opts = {}) {
  const original = compactSpaces(command);
  if (!original) {
    return {
      original,
      command: "",
      displayText: "",
      changed: false,
      bestMenu: null,
    };
  }

  let refined = normalizeInputText(original);
  refined = applyPhraseFixes(refined);
  refined = applyWordFixes(refined);
  refined = correctWithVocabulary(refined, candidates);
  refined = opts.skipNavigationVerb
    ? refined
    : ensureNavigationVerb(refined, candidates);
  refined = compactSpaces(refined);

  const bestMenu = opts.skipMenuMatch ? null : getBestMenuMatch(refined, candidates);
  const changed =
    normalizeAssistantText(original) !== normalizeAssistantText(refined) ||
    !!bestMenu;

  return {
    original,
    command: refined,
    displayText: humanizeCommand(refined, bestMenu),
    changed,
    bestMenu,
  };
}
