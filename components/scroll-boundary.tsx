"use client";

import { useEffect } from "react";

export default function ScrollBoundary() {
  useEffect(() => {
    // Keep native pull-to-refresh at the top; suppress bottom bounce below it.
    function updateBoundary() {
      document.documentElement.classList.toggle("past-page-top", (document.scrollingElement?.scrollTop ?? 0) > 1);
    }
    updateBoundary();
    window.addEventListener("scroll", updateBoundary, { passive: true });
    window.addEventListener("resize", updateBoundary);

    const needsTouchFallback = !CSS.supports("overscroll-behavior-y", "none");

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
      // A downward pull on the unlocked page belongs to the browser's refresh UI.
      if (dy > 0 && root && !/^(hidden|clip)$/.test(getComputedStyle(root).overflowY)) return;
      event.preventDefault();
    }
    function end() { previous = null; }

    if (needsTouchFallback) {
      document.addEventListener("touchstart", start, { passive: true });
      document.addEventListener("touchmove", move, { passive: false });
      document.addEventListener("touchend", end);
      document.addEventListener("touchcancel", end);
    }
    return () => {
      window.removeEventListener("scroll", updateBoundary);
      window.removeEventListener("resize", updateBoundary);
      document.documentElement.classList.remove("past-page-top");
      document.removeEventListener("touchstart", start);
      document.removeEventListener("touchmove", move);
      document.removeEventListener("touchend", end);
      document.removeEventListener("touchcancel", end);
    };
  }, []);

  return null;
}
