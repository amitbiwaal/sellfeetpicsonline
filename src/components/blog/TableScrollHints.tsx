"use client";

import { useEffect } from "react";

/**
 * Marks article tables that are wider than the screen, so CSS can show a
 * fade on the right edge ("swipe for more") until the reader scrolls to the end.
 */
export function TableScrollHints() {
  useEffect(() => {
    const cleanups: Array<() => void> = [];
    for (const box of document.querySelectorAll<HTMLElement>(".prose-sfo .table-scroll")) {
      const scroller = box.querySelector<HTMLElement>(".table-wrap");
      if (!scroller) continue;
      const update = () => {
        const scrollable = scroller.scrollWidth > scroller.clientWidth + 2;
        box.classList.toggle("is-scrollable", scrollable);
        box.classList.toggle("is-at-end", scroller.scrollLeft + scroller.clientWidth >= scroller.scrollWidth - 2);
      };
      update();
      scroller.addEventListener("scroll", update, { passive: true });
      const observer = new ResizeObserver(update);
      observer.observe(scroller);
      cleanups.push(() => {
        scroller.removeEventListener("scroll", update);
        observer.disconnect();
      });
    }
    return () => cleanups.forEach((cleanup) => cleanup());
  }, []);

  return null;
}
