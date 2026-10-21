"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";

/**
 * Client-side navigation swaps the screen without a page load, so nothing tells
 * the user it happened: focus stays on the link that was clicked (or falls to
 * <body> when an overlay closed itself), and a screen reader announces nothing.
 *
 * This moves focus into the main region after a route change. The first render
 * is deliberately left alone: loading a URL directly should not jump the user
 * anywhere. Screen names come from the per-route metadata instead, so the tab
 * title is correct on a hard load as well as after a navigation.
 */
export function useRouteChangeFocus() {
  const pathname = usePathname();
  const first = useRef(true);

  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    // One frame of slack so an overlay that closed itself on navigation has
    // already handed focus back to its trigger; otherwise that restore would
    // fight this focus and win.
    const frame = requestAnimationFrame(() => {
      document.getElementById("main-content")?.focus();
    });
    return () => cancelAnimationFrame(frame);
  }, [pathname]);
}
