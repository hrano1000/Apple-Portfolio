"use client";

import { useEffect } from "react";

export default function ScrollBoundary() {
  useEffect(() => {
    // Older touch browsers need an edge-only fallback for CSS overscroll control.
    if (CSS.supports("overscroll-behavior-y", "none")) return;

    let previous: { x: number; y: number } | null = null;
    function start(event: TouchEvent) {
      previous = event.touches.length === 1 ? { x: event.touches[0].clientX, y: event.touches[0].clientY } : null;
    }
    function move(event: TouchEvent) {
      if (!previous || event.touches.length !== 1) { previous = null; return; }
      const touch = event.touches[0];
      const dy = touch.clientY - previous.y;
      const dx = touch.clientX - previous.x;
      previous = { x: touch.clientX, y: touch.clientY };
      if (Math.abs(dy) <= Math.abs(dx) || !event.cancelable) return;

      const root = document.scrollingElement;
      let element = event.target instanceof Element ? event.target : null;
      while (element) {
        // Let dialogs and other nested scroll areas consume the gesture first.
        const overflow = getComputedStyle(element).overflowY;
        const scrollable = element === root ? overflow !== "hidden" && overflow !== "clip" : /^(auto|scroll|overlay)$/.test(overflow);
        const max = element.scrollHeight - element.clientHeight;
        if (scrollable && max > 1 && (dy > 0 ? element.scrollTop > 0 : element.scrollTop < max - 1)) return;
        element = element.parentElement;
      }
      event.preventDefault();
    }
    function end() { previous = null; }

    document.addEventListener("touchstart", start, { passive: true });
    document.addEventListener("touchmove", move, { passive: false });
    document.addEventListener("touchend", end);
    document.addEventListener("touchcancel", end);
    return () => {
      document.removeEventListener("touchstart", start);
      document.removeEventListener("touchmove", move);
      document.removeEventListener("touchend", end);
      document.removeEventListener("touchcancel", end);
    };
  }, []);

  return null;
}
