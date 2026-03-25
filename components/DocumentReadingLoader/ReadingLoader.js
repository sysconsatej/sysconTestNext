"use client";
/* eslint-disable */
import React, { useEffect, useMemo, useState } from "react";
import { DotLottieReact } from "@lottiefiles/dotlottie-react";

function AnimatedDots({ active = true }) {
  const [dots, setDots] = useState("");

  useEffect(() => {
    if (!active) {
      setDots("");
      return;
    }

    const interval = setInterval(() => {
      setDots((prev) => (prev.length >= 3 ? "" : prev + "."));
    }, 400);

    return () => clearInterval(interval);
  }, [active]);

  return (
    <span
      className="inline-block"
      style={{
        minWidth: "18px",
        color: "#334155",
      }}
    >
      {dots}
    </span>
  );
}

export default function DocumentReadingLoader({
  open = false,
  progress = 0,
  title = "Processing Purchase Invoice",
  subtitle = "Reading pages, validating content, and extracting structured data",
  size = 88,
  allowPageInteraction = true,
  showOverlay = true,
}) {
  const safeProgress = Math.max(0, Math.min(100, Number(progress) || 0));

  const statusText = useMemo(() => {
    if (safeProgress <= 10) return "Initializing";
    if (safeProgress <= 30) return "Uploading file";
    if (safeProgress <= 55) return "Reading document";
    if (safeProgress <= 80) return "Extracting details";
    if (safeProgress < 100) return "Finalizing";
    return "Completed";
  }, [safeProgress]);

  if (!open) return null;

  return (
    <div
      className={`fixed inset-0 z-[9999] flex items-center justify-center ${
        showOverlay ? "bg-black/15" : "bg-transparent"
      } ${allowPageInteraction ? "pointer-events-none" : "pointer-events-auto"}`}
    >
      <div
        className={`relative w-[340px] overflow-hidden rounded-[24px] border border-white/70 bg-white shadow-[0_20px_60px_rgba(15,23,42,0.18)] ${
          allowPageInteraction ? "pointer-events-none" : "pointer-events-auto"
        }`}
      >
        <div className="absolute inset-x-0 top-0 h-[3px] bg-gradient-to-r from-blue-600 via-indigo-500 to-cyan-400" />

        <div className="px-5 py-5">
          <div className="flex items-center gap-4">
            <div
              className="flex shrink-0 items-center justify-center rounded-2xl border border-slate-200 bg-slate-50"
              style={{ width: 82, height: 82 }}
            >
              <div style={{ width: size, height: size }}>
                <DotLottieReact
                  src="https://lottie.host/327b26d7-3cb8-49e1-b406-3b7f548d9360/UrDOB7RyCe.lottie"
                  loop
                  autoplay
                />
              </div>
            </div>

            <div className="min-w-0 flex-1">
              <h2
                className="text-[20px] font-semibold leading-[1.25]"
                style={{ color: "#0f172a" }}
              >
                {title}
              </h2>

              <p
                className="mt-1 text-[13px] leading-5"
                style={{ color: "#64748b" }}
              >
                {subtitle}
              </p>
            </div>
          </div>

          <div className="mt-4 flex items-center justify-between">
            <div>
              <p
                className="text-[11px] font-semibold uppercase tracking-[0.14em]"
                style={{ color: "#94a3b8" }}
              >
                Current stage
              </p>

              <p
                className="mt-1 flex items-center gap-0.5 text-[13px] font-semibold"
                style={{ color: "#334155" }}
              >
                <span>{statusText}</span>
                {safeProgress < 100 && <AnimatedDots active={true} />}
              </p>
            </div>

            <div className="rounded-full border border-blue-200 bg-blue-50 px-3 py-1">
              <span
                className="text-[13px] font-bold"
                style={{ color: "#2563eb" }}
              >
                {safeProgress}%
              </span>
            </div>
          </div>

          <div className="mt-3">
            <div className="relative h-2.5 w-full overflow-hidden rounded-full bg-slate-200">
              <div
                className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-blue-600 via-indigo-500 to-cyan-400 transition-all duration-500 ease-out"
                style={{ width: `${safeProgress}%` }}
              />
            </div>
          </div>

          <div className="mt-3 flex items-center justify-between">
            <span className="text-[11px]" style={{ color: "#94a3b8" }}>
              Please keep this tab open
            </span>
            <span
              className="text-[11px] font-medium"
              style={{ color: safeProgress < 100 ? "#2563eb" : "#16a34a" }}
            >
              {safeProgress < 100 ? "In progress" : "Ready"}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}