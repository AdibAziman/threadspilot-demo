"use client";

import { useEffect, useRef } from "react";

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

/**
 * The keyboard contract every overlay in the demo shares.
 *
 * Opening an overlay used to leave focus where it was, so Tab walked straight
 * into the page behind it, Escape only worked for the modal, and closing
 * dropped the user on <body> with no way back to the button they pressed. This
 * hook remembers the opener, moves focus in, keeps Tab inside, closes on
 * Escape and hands focus back. It also owns the body scroll lock so the page
 * cannot scroll behind an overlay on a phone.
 *
 * Pass `initialFocus` as a selector for the field the user should land on.
 * `open` must stay a plain boolean: the parent hands in a new `onClose` closure
 * on every render, and the hook keeps that in a ref so the effect only re-runs
 * when the overlay actually opens or closes.
 */
export function useDialogFocus(
  open: boolean,
  onClose: () => void,
  { initialFocus }: { initialFocus?: string } = {}
) {
  const ref = useRef<HTMLDivElement>(null);
  const closeRef = useRef(onClose);

  useEffect(() => {
    closeRef.current = onClose;
  });

  useEffect(() => {
    if (!open) return;
    const node = ref.current;
    if (!node) return;

    const opener = document.activeElement as HTMLElement | null;

    const focusables = () =>
      Array.from(node.querySelectorAll<HTMLElement>(FOCUSABLE)).filter(
        (el) => el.offsetWidth > 0 || el.offsetHeight > 0 || el === document.activeElement
      );

    const preferred = initialFocus ? node.querySelector<HTMLElement>(initialFocus) : null;
    (preferred ?? focusables()[0] ?? node).focus();

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.stopPropagation();
        closeRef.current();
        return;
      }
      if (e.key !== "Tab") return;
      const list = focusables();
      if (list.length === 0) {
        e.preventDefault();
        node.focus();
        return;
      }
      const first = list[0];
      const last = list[list.length - 1];
      const active = document.activeElement;
      const outside = !active || !node.contains(active);
      if (e.shiftKey && (outside || active === first)) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && (outside || active === last)) {
        e.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", onKeyDown, true);

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", onKeyDown, true);
      document.body.style.overflow = previousOverflow;
      // The opener can be gone if the overlay closed because the route changed.
      if (opener && document.contains(opener)) opener.focus();
    };
  }, [open, initialFocus]);

  return ref;
}
