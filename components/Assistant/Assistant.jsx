"use client";
/* eslint-disable */

import React, {
  useCallback,
  useDeferredValue,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import PropTypes from "prop-types";
import { usePathname, useRouter } from "next/navigation";
import { DotLottieReact } from "@lottiefiles/dotlottie-react";
import {
  Box,
  Button,
  Divider,
  IconButton,
  InputBase,
  Paper,
  Stack,
  Tooltip,
  Typography,
} from "@mui/material";
import {
  Check,
  ChevronRight,
  Command,
  Mic,
  Navigation,
  Send,
  X,
} from "lucide-react";

import { sideBarMenu } from "@/services/auth/Auth.services";
import {
  buildMenuRoute,
  flattenMenuTree,
  getAssistantRouteIntent,
  normalizeAssistantText,
  persistAssistantBreadcrumbs,
  resolveMenuCandidates,
  scoreAssistantTextMatch,
} from "./assistantNavigation";
import {
  handleAssistantContextSwitch,
  parseAssistantContextSwitchCommand,
} from "./assistantContextSwitch";
import {
  getNavigationCommandForAssistant,
  parseAssistantFormFillCommand,
  savePendingFormFill,
  tryApplyPendingFormFill,
} from "./assistantFormFill";
import {
  getNavigationCommandForRecordOpen,
  parseAssistantRecordOpenCommand,
  savePendingRecordOpen,
  tryApplyPendingRecordOpen,
} from "./assistantRecordOpen";
import { refineAssistantCommand } from "./assistantCommandRefiner";

const MENU_CACHE_PREFIX = "assistant.menuCache";
const MENU_CACHE_MAX_AGE_MS = 10 * 60 * 1000;
const ASSISTANT_TOGGLE_EVENT = "assistant:toggle";
const ASSISTANT_OPEN_EVENT = "assistant:open";

const ASSISTANT_MOTION = {
  "@keyframes assistantPanelIn": {
    from: { opacity: 0, transform: "translateY(14px) scale(.98)" },
    to: { opacity: 1, transform: "translateY(0) scale(1)" },
  },
  "@keyframes assistantStatusIn": {
    from: { opacity: 0, transform: "translateY(10px)" },
    to: { opacity: 1, transform: "translateY(0)" },
  },
  "@keyframes assistantButtonFloat": {
    "0%, 100%": { transform: "translateY(0)" },
    "50%": { transform: "translateY(-3px)" },
  },
  "@keyframes assistantRingPulse": {
    "0%": { opacity: 0.58, transform: "scale(.9)" },
    "70%, 100%": { opacity: 0, transform: "scale(1.48)" },
  },
  "@keyframes assistantSweep": {
    "0%": { transform: "translateX(-120%)" },
    "100%": { transform: "translateX(120%)" },
  },
  "@keyframes assistantDot": {
    "0%, 100%": { opacity: 0.35, transform: "scale(.75)" },
    "50%": { opacity: 1, transform: "scale(1)" },
  },
};

function getSpeechRecognition() {
  if (typeof window === "undefined") return null;
  return window.SpeechRecognition || window.webkitSpeechRecognition || null;
}

function focusAssistantInput() {
  if (typeof window === "undefined") return;
  window.setTimeout(() => {
    const input = document.getElementById("__assistant_command_input__");
    input?.focus?.();
  }, 0);
}

function normalizeRouteForCompare(value) {
  try {
    const url = new URL(String(value || ""), window.location.origin);
    return `${url.pathname}${url.search}`.toLowerCase();
  } catch {
    return String(value || "").toLowerCase();
  }
}

function isAssistantRouteUsable(value) {
  const route = String(value || "").trim();
  return (
    route.startsWith("/") &&
    !route.startsWith("//") &&
    !route.toLowerCase().startsWith("/null") &&
    !route.toLowerCase().startsWith("/undefined")
  );
}

function getMenuCacheKey() {
  if (typeof sessionStorage === "undefined") return "";

  return [
    sessionStorage.getItem("companyId") || "",
    sessionStorage.getItem("branchId") || "",
    sessionStorage.getItem("financialYear") || "",
  ].join("|");
}

function readCachedMenus() {
  try {
    const cacheKey = getMenuCacheKey();
    if (!cacheKey) return [];

    const raw = sessionStorage.getItem(`${MENU_CACHE_PREFIX}:${cacheKey}`);
    if (!raw) return [];

    const parsed = JSON.parse(raw);
    const isFresh =
      Date.now() - Number(parsed?.savedAt || 0) < MENU_CACHE_MAX_AGE_MS;
    return isFresh && Array.isArray(parsed?.items) ? parsed.items : [];
  } catch {
    return [];
  }
}

function writeCachedMenus(items) {
  try {
    const cacheKey = getMenuCacheKey();
    if (!cacheKey || !Array.isArray(items)) return;

    sessionStorage.setItem(
      `${MENU_CACHE_PREFIX}:${cacheKey}`,
      JSON.stringify({ savedAt: Date.now(), items }),
    );
  } catch {}
}

function clickVisibleMenuCandidate(command) {
  if (typeof document === "undefined") return null;

  const wanted = normalizeAssistantText(command);
  if (!wanted) return null;

  const elements = Array.from(
    document.querySelectorAll('li, button, a, [role="button"]'),
  );

  const matches = elements
    .map((element) => {
      const rawText = String(element.textContent || "").trim();
      const text = normalizeAssistantText(rawText);
      if (!text) return null;

      const score = scoreAssistantTextMatch(wanted, text, rawText);
      if (!score) return null;

      const style = window.getComputedStyle(element);
      if (style.display === "none" || style.visibility === "hidden") return null;
      if (style.pointerEvents === "none") return null;

      return { element, label: rawText, score };
    })
    .filter(Boolean)
    .sort((a, b) => b.score - a.score || a.label.length - b.label.length);

  const match = matches[0];
  if (!match) return null;

  match.element.scrollIntoView({ block: "center", inline: "nearest" });
  match.element.click();

  return {
    label: match.label,
    score: match.score,
  };
}

function describeFillIntent(fillIntent) {
  const fills = Array.isArray(fillIntent?.fills) ? fillIntent.fills : [];
  if (fills.length > 1) return `${fills.length} fields`;
  return fillIntent?.fieldLabel || "the field";
}

function describeAppliedFills(result) {
  const fills = Array.isArray(result?.appliedFills) ? result.appliedFills : [];
  if (fills.length > 1) {
    return fills.map((fill) => fill.fieldLabel).join(", ");
  }
  return fills[0]?.fieldLabel || result?.pending?.fieldLabel || "the field";
}

function describeRecordOpenIntent(intent) {
  if (!intent?.fieldLabel || !intent?.value) return "that record";
  return `${intent.fieldLabel} = ${intent.value}`;
}

const SHIP_LOADER_SIZES = {
  default: { box: 58, animation: 58 },
  small: { box: 36, animation: 40 },
  tiny: { box: 24, animation: 30 },
};

function ShipTaskLoader({ size = "default" }) {
  const dims = SHIP_LOADER_SIZES[size] || SHIP_LOADER_SIZES.default;

  return (
    <Box
      aria-hidden="true"
      sx={{
        position: "relative",
        width: dims.box,
        height: dims.box,
        flex: "0 0 auto",
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        overflow: "visible",
        bgcolor: "rgba(21,94,239,.06)",
        borderRadius: 999,
        "& canvas": {
          width: "100% !important",
          height: "100% !important",
        },
      }}
    >
      <Box
        sx={{
          width: dims.animation,
          height: dims.animation,
          backgroundImage: 'url("/assistant-ship-loader.svg")',
          backgroundSize: "contain",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
        }}
      >
        <DotLottieReact src="/assistant-ship-loader.lottie" loop autoplay />
      </Box>
    </Box>
  );
}

ShipTaskLoader.propTypes = {
  size: PropTypes.oneOf(["default", "small", "tiny"]),
};

function ThinkingDots() {
  return (
    <Box sx={{ display: "inline-flex", alignItems: "center", gap: 0.35 }}>
      {[0, 1, 2].map((idx) => (
        <Box
          key={idx}
          sx={{
            width: 4,
            height: 4,
            borderRadius: "50%",
            bgcolor: "rgba(14,165,233,.86)",
            animation: "assistantDot 1s ease-in-out infinite",
            animationDelay: `${idx * 0.14}s`,
          }}
        />
      ))}
    </Box>
  );
}

export default function Assistant() {
  const router = useRouter();
  const pathname = usePathname();

  const [open, setOpen] = useState(false);
  const [menuItems, setMenuItems] = useState([]);
  const [loadingMenus, setLoadingMenus] = useState(false);
  const [command, setCommand] = useState("");
  const [message, setMessage] = useState("Ready");
  const [busy, setBusy] = useState(false);
  const [listening, setListening] = useState(false);
  const [speechAvailable, setSpeechAvailable] = useState(false);
  const [lastMatch, setLastMatch] = useState(null);
  const [taskStatus, setTaskStatus] = useState(null);
  const [lastRefinement, setLastRefinement] = useState(null);

  const recognitionRef = useRef(null);
  const menuLoadPromiseRef = useRef(null);
  const pendingFillTimerRef = useRef(null);
  const pendingRecordTimerRef = useRef(null);
  const taskStatusTimerRef = useRef(null);
  const pendingNavigationRef = useRef(null);
  const navigationCompleteTimerRef = useRef(null);

  useEffect(() => {
    setSpeechAvailable(!!getSpeechRecognition());
  }, []);

  const showTaskStatus = useCallback((text, opts = {}) => {
    if (taskStatusTimerRef.current) {
      window.clearTimeout(taskStatusTimerRef.current);
      taskStatusTimerRef.current = null;
    }

    setTaskStatus({
      text,
      busy: opts.busy !== false,
    });

    if (opts.autoHideMs) {
      taskStatusTimerRef.current = window.setTimeout(() => {
        setTaskStatus(null);
        taskStatusTimerRef.current = null;
      }, opts.autoHideMs);
    }
  }, []);

  const finishPendingNavigationStatus = useCallback(
    (navigationId) => {
      const pending = pendingNavigationRef.current;
      if (!pending || pending.id !== navigationId || pending.waitForPostTask) {
        return;
      }

      pendingNavigationRef.current = null;
      setMessage(pending.doneText);
      showTaskStatus(pending.doneText, {
        busy: false,
        autoHideMs: 2500,
      });
    },
    [showTaskStatus],
  );

  const startPendingFillWatcher = useCallback(() => {
    let attempts = 0;

    const tick = async () => {
      attempts += 1;

      const result = await tryApplyPendingFormFill();
      if (result.applied) {
        const fillMessage = `Filled ${describeAppliedFills(result)}`;
        setMessage(fillMessage);
        showTaskStatus(fillMessage, {
          busy: !result.done,
          autoHideMs: result.done ? 2500 : null,
        });
      }

      if (!result.done && attempts < 40) {
        pendingFillTimerRef.current = window.setTimeout(tick, 500);
      } else if (!result.done) {
        showTaskStatus("I could not find every field to fill", {
          busy: false,
          autoHideMs: 3500,
        });
      }
    };

    if (pendingFillTimerRef.current) {
      window.clearTimeout(pendingFillTimerRef.current);
    }
    pendingFillTimerRef.current = window.setTimeout(tick, 500);
  }, [showTaskStatus]);

  const startPendingRecordWatcher = useCallback(() => {
    let attempts = 0;

    const tick = async () => {
      attempts += 1;

      const result = await tryApplyPendingRecordOpen();
      if (result.applied) {
        const openMessage = `Opened ${describeRecordOpenIntent(result.pending)} in ${result.pending?.mode || "edit"} mode`;
        setMessage(openMessage);
        showTaskStatus(openMessage, { busy: false, autoHideMs: 2500 });
        return;
      }

      if (!result.done && attempts < 50) {
        showTaskStatus(
          `Finding ${describeRecordOpenIntent(result.pending)}...`,
          { busy: true },
        );
        pendingRecordTimerRef.current = window.setTimeout(tick, 350);
      } else if (!result.done) {
        const notFoundMessage = result.pending?.currentPage
          ? `I could not find ${describeRecordOpenIntent(result.pending)} in this form. Which form should I search?`
          : `I could not find ${describeRecordOpenIntent(result.pending)}`;
        setMessage(notFoundMessage);
        showTaskStatus(notFoundMessage, {
          busy: false,
          autoHideMs: result.pending?.currentPage ? 6500 : 4000,
        });
      }
    };

    if (pendingRecordTimerRef.current) {
      window.clearTimeout(pendingRecordTimerRef.current);
    }
    pendingRecordTimerRef.current = window.setTimeout(tick, 150);
  }, [showTaskStatus]);

  useEffect(() => {
    startPendingFillWatcher();
    startPendingRecordWatcher();
    return () => {
      if (pendingFillTimerRef.current) {
        window.clearTimeout(pendingFillTimerRef.current);
      }
      if (pendingRecordTimerRef.current) {
        window.clearTimeout(pendingRecordTimerRef.current);
      }
      if (taskStatusTimerRef.current) {
        window.clearTimeout(taskStatusTimerRef.current);
      }
      if (navigationCompleteTimerRef.current) {
        window.clearTimeout(navigationCompleteTimerRef.current);
      }
    };
  }, [startPendingFillWatcher, startPendingRecordWatcher]);

  useEffect(() => {
    const pending = pendingNavigationRef.current;
    if (!pending || pending.waitForPostTask) return;

    const targetPath = String(pending.route || "").split("?")[0].toLowerCase();
    const currentPath = String(pathname || "").toLowerCase();
    if (targetPath && currentPath === targetPath) {
      finishPendingNavigationStatus(pending.id);
    }
  }, [finishPendingNavigationStatus, pathname]);

  const fetchMenus = useCallback(async ({ silent = false } = {}) => {
    if (!silent) {
      setLoadingMenus(true);
      setMessage("I'm checking your menu access");
    }

    try {
      const items = await sideBarMenu();
      const nextItems = Array.isArray(items) ? items : [];
      setMenuItems(nextItems);
      writeCachedMenus(nextItems);
      setMessage(nextItems.length ? "Ready" : "I couldn't read your menus yet");
      console.debug("[Assistant] menu metadata loaded", {
        groups: nextItems.length,
        cached: false,
      });
      return nextItems;
    } catch (error) {
      console.error("[Assistant] failed to load menus", error);
      setMessage("I couldn't read your menus yet");
      return [];
    } finally {
      if (!silent) setLoadingMenus(false);
    }
  }, []);

  const loadMenus = useCallback(async ({ silent = false } = {}) => {
    if (menuItems.length) return menuItems;
    if (menuLoadPromiseRef.current) return menuLoadPromiseRef.current;

    const cachedItems = readCachedMenus();
    if (cachedItems.length) {
      setMenuItems(cachedItems);
      console.debug("[Assistant] menu metadata loaded", {
        groups: cachedItems.length,
        cached: true,
      });

      return cachedItems;
    }

    if (!silent) setLoadingMenus(true);

    const promise = fetchMenus({ silent }).finally(() => {
      if (!silent) setLoadingMenus(false);
      menuLoadPromiseRef.current = null;
    });

    menuLoadPromiseRef.current = promise;
    return promise;
  }, [fetchMenus, menuItems]);

  const navigateFromAssistant = useCallback(
    (route, opts = {}) => {
      const returnRoute = opts.returnRoute || "";
      const currentRoute =
        typeof window !== "undefined"
          ? `${window.location.pathname}${window.location.search}`
          : "";
      const shouldSeedReturnRoute =
        isAssistantRouteUsable(returnRoute) &&
        isAssistantRouteUsable(route) &&
        normalizeRouteForCompare(returnRoute) !== normalizeRouteForCompare(route) &&
        normalizeRouteForCompare(returnRoute) !==
          normalizeRouteForCompare(currentRoute);

      if (!isAssistantRouteUsable(route)) {
        console.warn("[Assistant] blocked malformed route", { route });
        return;
      }

      router.prefetch?.(route);

      if (shouldSeedReturnRoute) {
        router.prefetch?.(returnRoute);
        try {
          window.history.replaceState(window.history.state, "", returnRoute);
        } catch (error) {
          console.warn("[Assistant] failed to seed back route", error);
        }
      }

      router.push(route);
    },
    [router],
  );

  useEffect(() => {
    if (!open || menuItems.length || loadingMenus) return;
    loadMenus({ silent: true });
  }, [loadMenus, loadingMenus, menuItems.length, open]);

  useEffect(() => {
    const warmup = () => loadMenus({ silent: true });
    let timer = null;
    let idleId = null;

    if (typeof window.requestIdleCallback === "function") {
      idleId = window.requestIdleCallback(warmup, { timeout: 2500 });
    } else {
      timer = window.setTimeout(warmup, 700);
    }

    return () => {
      if (idleId != null && typeof window.cancelIdleCallback === "function") {
        window.cancelIdleCallback(idleId);
      }
      if (timer != null) window.clearTimeout(timer);
    };
  }, [loadMenus]);

  useEffect(() => {
    const handler = (event) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setOpen(true);
        focusAssistantInput();
      }
    };

    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  useEffect(() => {
    const handleToggle = () => {
      setOpen((current) => {
        const next = !current;
        if (next) focusAssistantInput();
        return next;
      });
    };
    const handleOpen = () => {
      setOpen(true);
      focusAssistantInput();
    };

    window.addEventListener(ASSISTANT_TOGGLE_EVENT, handleToggle);
    window.addEventListener(ASSISTANT_OPEN_EVENT, handleOpen);

    return () => {
      window.removeEventListener(ASSISTANT_TOGGLE_EVENT, handleToggle);
      window.removeEventListener(ASSISTANT_OPEN_EVENT, handleOpen);
    };
  }, []);

  const executeCommand = async (rawCommand = command) => {
    const value = String(rawCommand || "").trim();
    if (!value || busy) return;

    setBusy(true);
    setMessage("Understanding your request");
    showTaskStatus("Understanding your request...", { busy: true });

    try {
      const baseRefinement = refineAssistantCommand(value);
      const contextResult = await handleAssistantContextSwitch(baseRefinement.command);
      if (contextResult.handled) {
        setLastMatch(null);
        setLastRefinement(baseRefinement);
        setMessage(contextResult.message);

        if (contextResult.success) {
          showTaskStatus(contextResult.message || "Updating context...", {
            busy: true,
          });
          setCommand("");
          setOpen(false);
          setMenuItems([]);
          menuLoadPromiseRef.current = null;
          window.setTimeout(() => window.location.reload(), 150);
        }

        return;
      }

      const recordOpenIntent =
        parseAssistantRecordOpenCommand(baseRefinement.command) ||
        parseAssistantRecordOpenCommand(value);
      const formFillIntent =
        parseAssistantFormFillCommand(baseRefinement.command) ||
        parseAssistantFormFillCommand(value);

      if (
        recordOpenIntent?.currentPage &&
        !recordOpenIntent.navigationCommand
      ) {
        const currentRecordText = `Searching current form for ${describeRecordOpenIntent(recordOpenIntent)}`;
        setLastMatch(null);
        setLastRefinement({
          original: value,
          command: baseRefinement.command,
          displayText: `Open record where ${describeRecordOpenIntent(recordOpenIntent)} in current form`,
          changed: true,
        });
        savePendingRecordOpen(recordOpenIntent, { mode: "list" });
        startPendingRecordWatcher();
        setMessage(currentRecordText);
        showTaskStatus(currentRecordText, {
          busy: true,
          autoHideMs: null,
        });
        setCommand("");
        setOpen(false);
        return;
      }

      const navigationValue =
        formFillIntent?.navigationCommand ||
        recordOpenIntent?.navigationCommand ||
        getNavigationCommandForAssistant(
          getNavigationCommandForRecordOpen(baseRefinement.command),
        );
      const menus = await loadMenus();
      const menuCandidatesForCommand =
        menus === menuItems && menuCandidates.length
          ? menuCandidates
          : flattenMenuTree(menus);
      const navigationRefinement = refineAssistantCommand(
        navigationValue,
        menuCandidatesForCommand,
      );
      const refinedNavigationValue = navigationRefinement.command || navigationValue;
      const routeIntent = getAssistantRouteIntent(refinedNavigationValue);
      const result = resolveMenuCandidates(
        routeIntent.searchText,
        menuCandidatesForCommand,
        12,
      );

      const routedMatches = result.candidates.map((candidate) => {
        const candidateRoute = buildMenuRoute(candidate.path, candidate.item, {
          mode: routeIntent.mode,
        });
        const candidateReturnRoute =
          routeIntent.mode === "add"
            ? buildMenuRoute(candidate.path, candidate.item, { mode: "list" })
            : null;

        return {
          candidate,
          route: candidateRoute,
          returnRoute: candidateReturnRoute,
          usable: isAssistantRouteUsable(candidateRoute),
        };
      });
      const selectedMatch =
        routedMatches.find((match) => match.usable) || routedMatches[0] || null;
      const selectedCandidate = selectedMatch?.candidate || result.best;
      const resolvedResult = selectedCandidate
        ? { ...result, best: selectedCandidate }
        : result;

      setLastMatch(resolvedResult);
      setLastRefinement({
        ...navigationRefinement,
        displayText: navigationRefinement.displayText || baseRefinement.displayText,
        changed: navigationRefinement.changed || baseRefinement.changed,
      });
      console.debug("[Assistant] command resolved", {
        input: value,
        refinedInput: baseRefinement.command,
        navigationInput: refinedNavigationValue,
        refinement: navigationRefinement,
        fill: formFillIntent,
        recordOpen: recordOpenIntent,
        mode: routeIntent.mode,
        searchText: routeIntent.searchText,
        normalized: result.command,
        groups: menus.length,
        leaves: menuCandidatesForCommand.length,
        candidates: result.candidates.map((candidate) => ({
          label: candidate.label,
          score: candidate.score,
          id: candidate.item?.id,
          menuLink: candidate.item?.menuLink,
          menuType: candidate.item?.menuType,
          breadcrumbs: candidate.breadcrumbs,
        })),
        routedCandidates: routedMatches.map((match) => ({
          label: match.candidate.label,
          route: match.route,
          usable: match.usable,
          breadcrumbs: match.candidate.breadcrumbs,
        })),
      });

      if (!selectedCandidate) {
        const clicked = clickVisibleMenuCandidate(refinedNavigationValue);
        if (clicked) {
          console.debug("[Assistant] clicked visible sidebar menu", clicked);
          setMessage(`Opening ${clicked.label}`);
          showTaskStatus(`Opening ${clicked.label}...`, {
            busy: true,
            autoHideMs: 4500,
          });
          setCommand("");
          setOpen(false);
          return;
        }

        if (recordOpenIntent) {
          const clarifyMessage =
            `Which form should I search for ${describeRecordOpenIntent(recordOpenIntent)}?`;
          setMessage(clarifyMessage);
          showTaskStatus(clarifyMessage, {
            busy: false,
            autoHideMs: 4500,
          });
          return;
        }

        setMessage(
          menus.length
            ? "I couldn't find a matching menu"
            : "I couldn't read your menus yet",
        );
        showTaskStatus(
          menus.length
            ? "I could not find a matching menu"
            : "I could not read your menus yet",
          { busy: false, autoHideMs: 3500 },
        );
        return;
      }

      const route = selectedMatch?.route || null;
      const returnRoute = selectedMatch?.returnRoute || null;
      console.debug("[Assistant] route built", {
        label: selectedCandidate.label,
        breadcrumbs: selectedCandidate.breadcrumbs,
        route,
        returnRoute,
        item: {
          id: selectedCandidate.item?.id,
          menuName: selectedCandidate.item?.menuName,
          menuLink: selectedCandidate.item?.menuLink,
          menuType: selectedCandidate.item?.menuType,
          reportId: selectedCandidate.item?.reportId,
          parentMenuId: selectedCandidate.item?.parentMenuId,
        },
        root: {
          id: selectedCandidate.path?.[0]?.id,
          menuName: selectedCandidate.path?.[0]?.menuName,
          menuLink: selectedCandidate.path?.[0]?.menuLink,
          isFormcontrol: selectedCandidate.path?.[0]?.isFormcontrol,
        },
        depth: selectedCandidate.depth,
        isLeaf: selectedCandidate.isLeaf,
      });
      if (!isAssistantRouteUsable(route)) {
        const clicked = clickVisibleMenuCandidate(refinedNavigationValue);
        if (clicked) {
          console.debug("[Assistant] clicked visible sidebar menu after route miss", {
            clicked,
            attemptedRoute: route,
            selected: selectedCandidate?.label,
          });
          setMessage(`Opening ${clicked.label}`);
          showTaskStatus(`Opening ${clicked.label}...`, {
            busy: true,
            autoHideMs: 4500,
          });
          setCommand("");
          setOpen(false);
          return;
        }

        setMessage(
          routeIntent.mode === "add"
            ? "I found the menu, but it does not support add mode"
            : "I found the menu, but there is no trusted route",
        );
        showTaskStatus("I found the menu, but cannot open it", {
          busy: false,
          autoHideMs: 3500,
        });
        return;
      }

      persistAssistantBreadcrumbs(selectedCandidate);
      if (recordOpenIntent) {
        savePendingRecordOpen(recordOpenIntent, routeIntent);
        startPendingRecordWatcher();
      }
      if (formFillIntent) {
        savePendingFormFill(formFillIntent, routeIntent);
        startPendingFillWatcher();
      }

      const nextMessage = recordOpenIntent
        ? `Opening ${selectedCandidate.label}. I'll find ${describeRecordOpenIntent(recordOpenIntent)} and open ${recordOpenIntent.mode || "edit"} mode`
        : formFillIntent
        ? `Opening ${selectedCandidate.label}. I'll fill ${describeFillIntent(formFillIntent)}`
        : routeIntent.mode === "add"
        ? `Opening ${selectedCandidate.label} in add mode`
        : `Opening ${selectedCandidate.label}`;

      setMessage(nextMessage);
      showTaskStatus(nextMessage, {
        busy: true,
        autoHideMs: null,
      });

      const hasPostNavigationTask = !!(recordOpenIntent || formFillIntent);
      const navigationId = `${Date.now()}-${Math.random()}`;
      pendingNavigationRef.current = {
        id: navigationId,
        route,
        waitForPostTask: hasPostNavigationTask,
        doneText:
          routeIntent.mode === "add"
            ? `Opened ${selectedCandidate.label} in add mode`
            : `Opened ${selectedCandidate.label}`,
      };

      if (navigationCompleteTimerRef.current) {
        window.clearTimeout(navigationCompleteTimerRef.current);
      }

      if (!hasPostNavigationTask) {
        navigationCompleteTimerRef.current = window.setTimeout(() => {
          finishPendingNavigationStatus(navigationId);
          navigationCompleteTimerRef.current = null;
        }, 900);
      }

      navigateFromAssistant(route, { returnRoute });
      setCommand("");
      setOpen(false);
    } catch (error) {
      console.error("[Assistant] command failed", error);
      setMessage("Something went wrong while opening that");
      showTaskStatus("Something went wrong while opening that", {
        busy: false,
        autoHideMs: 3500,
      });
    } finally {
      setBusy(false);
    }
  };

  const startListening = () => {
    const SpeechRecognition = getSpeechRecognition();
    if (!SpeechRecognition || listening) return;

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = "en-IN";
      recognition.interimResults = false;
      recognition.maxAlternatives = 1;

      recognition.onstart = () => {
        setListening(true);
        setMessage("I'm listening");
      };
      recognition.onerror = () => {
        setListening(false);
        setMessage("Voice input stopped");
      };
      recognition.onend = () => setListening(false);
      recognition.onresult = (event) => {
        const transcript = event.results?.[0]?.[0]?.transcript || "";
        setCommand(transcript);
        setMessage("I heard you. Press enter or send to run it");
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (error) {
      console.error("[Assistant] speech recognition failed", error);
      setMessage("Voice input is unavailable here");
      setListening(false);
    }
  };

  const stopListening = () => {
    try {
      recognitionRef.current?.stop?.();
    } catch {}
    setListening(false);
  };

  const menuCandidates = useMemo(() => flattenMenuTree(menuItems), [menuItems]);
  const deferredCommand = useDeferredValue(command);
  const liveCommandText = deferredCommand;
  const liveCommandRefinement = useMemo(
    () =>
      liveCommandText.trim()
        ? refineAssistantCommand(liveCommandText, menuCandidates, {
            skipMenuMatch: true,
            skipNavigationVerb: true,
          })
        : null,
    [liveCommandText, menuCandidates],
  );
  const liveCommandForIntent = liveCommandRefinement?.command || liveCommandText;
  const currentRouteIntent = useMemo(
    () =>
      getAssistantRouteIntent(
        getNavigationCommandForAssistant(
          getNavigationCommandForRecordOpen(liveCommandForIntent),
        ),
      ),
    [liveCommandForIntent],
  );
  const commandPreview =
    liveCommandRefinement?.changed && liveCommandRefinement?.displayText
      ? liveCommandRefinement
      : null;
  const visibleRefinement = commandPreview || (!command.trim() ? lastRefinement : null);

  const candidates = useMemo(
    () => {
      if (parseAssistantContextSwitchCommand(liveCommandForIntent)) return [];
      return normalizeAssistantText(currentRouteIntent.searchText).length >= 1
        ? resolveMenuCandidates(currentRouteIntent.searchText, menuCandidates).candidates.slice(
            0,
            3,
          )
        : [];
    },
    [currentRouteIntent.searchText, liveCommandForIntent, menuCandidates],
  );
  const showSuggestions =
    normalizeAssistantText(currentRouteIntent.searchText).length >= 1 &&
    !parseAssistantContextSwitchCommand(liveCommandForIntent);
  const assistantSubtitle =
    busy || loadingMenus || message !== "Ready"
      ? message
      : "Ready";
  const isAssistantWorking = busy || loadingMenus;

  return (
    <>
      {!!taskStatus && !open && (
        <Paper
          elevation={0}
          sx={{
            position: "fixed",
            right: { xs: 12, sm: 22 },
            top: { xs: 58, sm: 58 },
            zIndex: 1300,
            width: { xs: "calc(100vw - 24px)", sm: 390 },
            maxWidth: "calc(100vw - 24px)",
            px: 1.25,
            py: 1,
            border: "1px solid #dadce0",
            borderRadius: 2,
            bgcolor: "#fff",
            display: "flex",
            alignItems: "center",
            gap: 1.1,
            overflow: "hidden",
            boxShadow: "0 8px 26px rgba(60,64,67,.22)",
            animation: "assistantStatusIn .2s ease-out",
            ...ASSISTANT_MOTION,
            "&::before": {
              content: '""',
              position: "absolute",
              left: 0,
              top: 0,
              bottom: 0,
              width: 3,
              bgcolor: taskStatus.busy ? "#4285f4" : "#34a853",
            },
            "&::after": taskStatus.busy
              ? {
                  content: '""',
                  position: "absolute",
                  inset: 0,
                  background:
                    "linear-gradient(105deg, transparent 0%, rgba(66,133,244,.10) 46%, transparent 64%)",
                  transform: "translateX(-120%)",
                  animation: "assistantSweep 1.9s ease-in-out infinite",
                  pointerEvents: "none",
                }
              : {},
          }}
        >
          <Box
            sx={{
              width: taskStatus.busy ? 58 : 34,
              height: taskStatus.busy ? 58 : 34,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flex: "0 0 auto",
              borderRadius: 2,
              bgcolor: taskStatus.busy ? "#f8fbff" : "#f1f8f3",
              color: taskStatus.busy ? "#1a73e8" : "#188038",
            }}
          >
            {taskStatus.busy ? <ShipTaskLoader /> : <Check size={18} />}
          </Box>
          <Typography
            sx={{
              position: "relative",
              zIndex: 1,
              fontSize: 12.75,
              color: "#202124",
              fontWeight: 600,
              minWidth: 0,
              flex: 1,
              letterSpacing: 0,
            }}
            noWrap
          >
            {taskStatus.text}
          </Typography>
        </Paper>
      )}

      {open && (
        <Paper
          elevation={0}
          sx={{
            position: "fixed",
            right: { xs: 12, sm: 22 },
            top: { xs: 58, sm: 58 },
            zIndex: 1300,
            width: { xs: "calc(100vw - 24px)", sm: 480 },
            maxWidth: "calc(100vw - 24px)",
            border: "1px solid #dadce0",
            borderRadius: 2,
            overflow: "hidden",
            bgcolor: "#fff",
            boxShadow:
              "0 18px 54px rgba(60,64,67,.28), 0 2px 8px rgba(60,64,67,.12)",
            animation: "assistantPanelIn .22s cubic-bezier(.16,1,.3,1)",
            ...ASSISTANT_MOTION,
          }}
        >
          <Box
            sx={{
              position: "relative",
              px: 1.5,
              py: 1.2,
              display: "flex",
              alignItems: "center",
              gap: 1.1,
              color: "#202124",
              borderBottom: "1px solid #edf0f2",
              background: "#fff",
              overflow: "hidden",
              "&::before": {
                content: '""',
                position: "absolute",
                left: 0,
                right: 0,
                bottom: 0,
                height: 2,
                background:
                  "linear-gradient(90deg,#4285f4 0%,#34a853 34%,#fbbc04 68%,#ea4335 100%)",
                opacity: isAssistantWorking ? 1 : 0.58,
              },
              "&::after": {
                content: '""',
                position: "absolute",
                left: 0,
                right: 0,
                bottom: 0,
                height: 2,
                background:
                  "linear-gradient(100deg, transparent 0%, rgba(255,255,255,.9) 46%, transparent 68%)",
                transform: "translateX(-120%)",
                animation: isAssistantWorking
                  ? "assistantSweep 2.4s ease-in-out infinite"
                  : "none",
              },
            }}
          >
            <Box
              sx={{
                position: "relative",
                zIndex: 1,
                width: 36,
                height: 36,
                borderRadius: 2,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flex: "0 0 auto",
                bgcolor: "#f8fafd",
              }}
            >
              {isAssistantWorking ? (
                <ShipTaskLoader size="small" />
              ) : (
                <Box
                  component="img"
                  src="/assistant-gemini-ai.png"
                  alt=""
                  sx={{
                    width: 24,
                    height: 24,
                    objectFit: "contain",
                    filter: "drop-shadow(0 2px 3px rgba(66,133,244,.24))",
                  }}
                />
              )}
            </Box>
            <Box sx={{ position: "relative", zIndex: 1, minWidth: 0, flex: 1 }}>
              <Typography
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 0.65,
                  fontSize: 14,
                  fontWeight: 650,
                  color: "#202124",
                  letterSpacing: 0,
                }}
              >
                Assistant
              </Typography>
              <Typography
                sx={{
                  mt: 0.15,
                  display: "flex",
                  alignItems: "center",
                  gap: 0.65,
                  fontSize: 11.5,
                  color: "#5f6368",
                  letterSpacing: 0,
                }}
                noWrap
              >
                {assistantSubtitle}
                {isAssistantWorking && <ThinkingDots />}
              </Typography>
            </Box>
            <IconButton
              size="small"
              aria-label="Close assistant"
              onClick={() => setOpen(false)}
              sx={{
                position: "relative",
                zIndex: 1,
                color: "#5f6368",
                bgcolor: "transparent",
                "&:hover": { bgcolor: "#f1f3f4", color: "#202124" },
              }}
            >
              <X size={16} />
            </IconButton>
          </Box>

          <Box
            sx={{
              p: 1.5,
              background: "#fff",
            }}
          >
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 0.8,
                border: listening
                  ? "1px solid #ea4335"
                  : command.trim()
                  ? "1px solid #4285f4"
                  : "1px solid #dadce0",
                borderRadius: 999,
                px: 1.25,
                height: 46,
                bgcolor: "#f8fafd",
                boxShadow:
                  "0 1px 2px rgba(60,64,67,.10), inset 0 1px 0 rgba(255,255,255,.9)",
                transition: "border-color .18s ease, box-shadow .18s ease",
                "&:focus-within": {
                  borderColor: "#4285f4",
                  bgcolor: "#fff",
                  boxShadow:
                    "0 2px 8px rgba(60,64,67,.16), 0 0 0 3px rgba(66,133,244,.10)",
                },
              }}
            >
              <Command size={16} color="#5f6368" />
              <InputBase
                id="__assistant_command_input__"
                value={command}
                onChange={(event) => setCommand(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") executeCommand();
                  if (event.key === "Escape") setOpen(false);
                }}
                placeholder="Ask Assistant..."
                sx={{
                  flex: 1,
                  fontSize: 13.25,
                  fontWeight: 500,
                  color: "#202124",
                  "& input::placeholder": {
                    color: "#80868b",
                    opacity: 1,
                    fontWeight: 400,
                  },
                }}
                disabled={busy}
                autoFocus
              />
              <Tooltip title={speechAvailable ? "Voice input" : "Voice unavailable"}>
                <span>
                  <IconButton
                    size="small"
                    disabled={!speechAvailable || busy}
                    onClick={listening ? stopListening : startListening}
                    aria-label={listening ? "Stop listening" : "Start listening"}
                    sx={{
                      color: listening ? "#ea4335" : "#5f6368",
                      bgcolor: listening ? "rgba(234,67,53,.10)" : "transparent",
                      "&:hover": {
                        bgcolor: listening
                          ? "rgba(234,67,53,.14)"
                          : "rgba(60,64,67,.08)",
                      },
                    }}
                  >
                    <Mic size={16} />
                  </IconButton>
                </span>
              </Tooltip>
              <Tooltip title="Run command">
                <span>
                  <IconButton
                    size="small"
                    disabled={!command.trim() || busy || loadingMenus}
                    onClick={() => executeCommand()}
                    aria-label="Run assistant command"
                    sx={{
                      color: "#fff",
                      bgcolor: "#1a73e8",
                      width: 30,
                      height: 30,
                      boxShadow: "0 2px 7px rgba(26,115,232,.28)",
                      "&:hover": { bgcolor: "#185abc" },
                      "&.Mui-disabled": {
                        bgcolor: "#e8eaed",
                        color: "#9aa0a6",
                      },
                    }}
                  >
                    {busy ? <ShipTaskLoader size="tiny" /> : <Send size={16} />}
                  </IconButton>
                </span>
              </Tooltip>
            </Box>

            {!!visibleRefinement?.displayText && visibleRefinement.changed && (
              <Box
                sx={{
                  mt: 1,
                  px: 1.15,
                  py: 0.85,
                  display: "flex",
                  alignItems: "center",
                  gap: 0.8,
                  borderRadius: 2,
                  border: "1px solid #d2e3fc",
                  bgcolor: "#f8fbff",
                  color: "#174ea6",
                }}
              >
                <Box
                  component="img"
                  src="/assistant-gemini-ai.png"
                  alt=""
                  sx={{ width: 16, height: 16, objectFit: "contain" }}
                />
                <Typography
                  sx={{
                    minWidth: 0,
                    flex: 1,
                    fontSize: 11.75,
                    fontWeight: 600,
                    letterSpacing: 0,
                  }}
                  noWrap
                >
                  Understood as: {visibleRefinement.displayText}
                </Typography>
              </Box>
            )}

            {showSuggestions && (
              <Divider
                sx={{
                  my: 1.15,
                  borderColor: "#edf0f2",
                }}
              />
            )}

            {showSuggestions && (
              <Stack
                spacing={0.75}
                sx={{
                  maxHeight: 220,
                  overflowY: "auto",
                  pr: 0.25,
                  pb: 0.15,
                  "&::-webkit-scrollbar": { width: 6 },
                  "&::-webkit-scrollbar-thumb": {
                    bgcolor: "rgba(100,116,139,.24)",
                    borderRadius: 8,
                  },
                }}
              >
                {candidates.map((candidate) => (
                  <Button
                    key={`${candidate.item?.id}-${candidate.label}`}
                    onClick={() =>
                      executeCommand(
                        currentRouteIntent.mode === "add"
                          ? `${candidate.label} add mode`
                          : candidate.label,
                      )
                    }
                    sx={{
                      justifyContent: "flex-start",
                      textTransform: "none",
                      color: "#202124",
                      borderRadius: 2,
                      px: 1,
                      py: 0.85,
                      minHeight: 54,
                      bgcolor: "#fff",
                      border: "1px solid #e8eaed",
                      boxShadow: "0 1px 2px rgba(60,64,67,.08)",
                      transition:
                        "transform .16s ease, border-color .16s ease, background .16s ease, box-shadow .16s ease",
                      "&:hover": {
                        bgcolor: "#f8fafd",
                        borderColor: "#d2e3fc",
                        transform: "translateY(-1px)",
                        boxShadow: "0 4px 12px rgba(60,64,67,.14)",
                      },
                      "& .MuiButton-startIcon": {
                        mr: 1,
                      },
                      "& .MuiButton-endIcon": {
                        ml: "auto",
                        color: "#64748b",
                      },
                    }}
                    startIcon={
                      <Box
                        sx={{
                          width: 28,
                          height: 28,
                          borderRadius: 1,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          color:
                            candidate === lastMatch?.best ? "#188038" : "#1a73e8",
                          bgcolor:
                            candidate === lastMatch?.best
                              ? "#e6f4ea"
                              : "#e8f0fe",
                        }}
                      >
                        {candidate === lastMatch?.best ? (
                          <Check size={15} />
                        ) : (
                          <Navigation size={15} />
                        )}
                      </Box>
                    }
                    endIcon={<ChevronRight size={15} />}
                  >
                    <Box sx={{ minWidth: 0, textAlign: "left" }}>
                      <Typography
                        sx={{
                          fontSize: 12.75,
                          fontWeight: 600,
                          color: "#202124",
                          letterSpacing: 0,
                        }}
                        noWrap
                      >
                        {candidate.label}
                      </Typography>
                      <Typography
                        sx={{
                          mt: 0.15,
                          fontSize: 11,
                          color: "#5f6368",
                          letterSpacing: 0,
                        }}
                        noWrap
                      >
                        {candidate.breadcrumbs || "Menu"}
                      </Typography>
                    </Box>
                  </Button>
                ))}

                {!candidates.length && (
                  <Typography
                    sx={{
                      px: 1,
                      py: 1,
                      fontSize: 12,
                      color: "#64748b",
                      bgcolor: "#f8fafd",
                      border: "1px dashed #dadce0",
                      borderRadius: 2,
                    }}
                  >
                    Keep typing a little more.
                  </Typography>
                )}
              </Stack>
            )}
          </Box>
        </Paper>
      )}
    </>
  );
}
