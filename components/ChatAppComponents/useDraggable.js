// useDraggable.js
import { useState, useRef, useCallback, useEffect } from "react";

export function useDraggable({ initialX = 80, initialY = 80, bounds = true, disabled = false } = {}) {
  const [position, setPosition] = useState({ x: initialX, y: initialY });
  const [isDragging, setIsDragging] = useState(false);
  const startRef = useRef(null);

  const onMove = useCallback((e) => {
    if (!startRef.current) return;
    const { x, y, posX, posY, width, height } = startRef.current;
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;

    let nextX = posX + (clientX - x);
    let nextY = posY + (clientY - y);

    if (bounds) {
      const maxX = window.innerWidth - width;
      const maxY = window.innerHeight - height;
      nextX = Math.max(0, Math.min(nextX, maxX));
      nextY = Math.max(0, Math.min(nextY, maxY));
    }

    setPosition({ x: nextX, y: nextY });
  }, [bounds]);

  const onUp = useCallback(() => {
    startRef.current = null;
    setIsDragging(false);
    document.body.style.userSelect = "";
    window.removeEventListener("mousemove", onMove);
    window.removeEventListener("mouseup", onUp);
    window.removeEventListener("touchmove", onMove);
    window.removeEventListener("touchend", onUp);
  }, [onMove]);

  const startDrag = useCallback((e, elRef) => {
    if (disabled) return;
    // don't start a drag from buttons/inputs/anything opting out
    if (e.target.closest("button, input, a, [data-no-drag]")) return;

    e.preventDefault();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    const rect = elRef?.current?.getBoundingClientRect();

    startRef.current = {
      x: clientX,
      y: clientY,
      posX: position.x,
      posY: position.y,
      width: rect?.width || 0,
      height: rect?.height || 0,
    };

    setIsDragging(true);
    document.body.style.userSelect = "none";
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
    window.addEventListener("touchmove", onMove, { passive: false });
    window.addEventListener("touchend", onUp);
  }, [disabled, position, onMove, onUp]);

  useEffect(() => () => onUp(), [onUp]);

  return { position, setPosition, startDrag, isDragging };
}