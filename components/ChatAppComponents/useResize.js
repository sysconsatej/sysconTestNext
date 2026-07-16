// useResize.js
import { useState, useRef, useCallback, useEffect } from "react";

export function useResize({
  initialWidth = 960,
  initialHeight = 640,
  minWidth = 380,
  minHeight = 420,
  maxWidth,
  maxHeight,
} = {}) {
  const [size, setSize] = useState({ width: initialWidth, height: initialHeight });
  const startRef = useRef(null);

  const getBounds = useCallback(() => ({
    maxW: maxWidth ?? window.innerWidth - 24,
    maxH: maxHeight ?? window.innerHeight - 24,
  }), [maxWidth, maxHeight]);

  const onMove = useCallback((e) => {
    if (!startRef.current) return;
    const { x, y, width, height, dirs } = startRef.current;
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    const dx = clientX - x;
    const dy = clientY - y;
    const { maxW, maxH } = getBounds();

    setSize(() => {
      let w = width;
      let h = height;
      if (dirs.includes("right")) w = clamp(width + dx, minWidth, maxW);
      if (dirs.includes("bottom")) h = clamp(height + dy, minHeight, maxH);
      return { width: w, height: h };
    });
  }, [minWidth, minHeight, getBounds]);

  const onUp = useCallback(() => {
    startRef.current = null;
    window.removeEventListener("mousemove", onMove);
    window.removeEventListener("mouseup", onUp);
    window.removeEventListener("touchmove", onMove);
    window.removeEventListener("touchend", onUp);
  }, [onMove]);

  const startResize = useCallback((e, dirs = ["right", "bottom"]) => {
    e.preventDefault();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    startRef.current = { x: clientX, y: clientY, width: size.width, height: size.height, dirs };

    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
    window.addEventListener("touchmove", onMove, { passive: false });
    window.addEventListener("touchend", onUp);
  }, [size, onMove, onUp]);

  // safety: clean up listeners if component unmounts mid-drag
  useEffect(() => () => onUp(), [onUp]);

  return { size, startResize };
}

function clamp(v, min, max) {
  return Math.max(min, Math.min(max, v));
}