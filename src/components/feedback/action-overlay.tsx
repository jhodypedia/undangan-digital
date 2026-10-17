"use client";

import { useEffect, useRef, useState } from "react";
import { Loader2, Sparkles } from "lucide-react";

const SHOW_DELAY = 120;
const MIN_VISIBLE = 420;
const WATCHDOG = 15000;

function hasActionHeader(input: RequestInfo | URL, init?: RequestInit) {
  try {
    const headers = new Headers(
      init?.headers ??
        (typeof Request !== "undefined" && input instanceof Request
          ? input.headers
          : undefined),
    );
    return headers.has("next-action") || headers.has("Next-Action");
  } catch {
    return false;
  }
}

export function ActionOverlay() {
  const [visible, setVisible] = useState(false);
  const visibleRef = useRef(false);
  const pending = useRef(0);
  const shownAt = useRef(0);
  const showTimer = useRef<number | undefined>(undefined);
  const hideTimer = useRef<number | undefined>(undefined);
  const watchdog = useRef<number | undefined>(undefined);

  useEffect(() => {
    const original = window.fetch.bind(window);

    const setShown = (value: boolean) => {
      visibleRef.current = value;
      setVisible(value);
    };

    const scheduleShow = () => {
      window.clearTimeout(hideTimer.current);
      if (visibleRef.current) return;
      window.clearTimeout(showTimer.current);
      showTimer.current = window.setTimeout(() => {
        shownAt.current = Date.now();
        setShown(true);
        window.clearTimeout(watchdog.current);
        watchdog.current = window.setTimeout(() => {
          pending.current = 0;
          setShown(false);
        }, WATCHDOG);
      }, SHOW_DELAY);
    };

    const scheduleHide = () => {
      window.clearTimeout(showTimer.current);
      window.clearTimeout(watchdog.current);
      const wait = Math.max(0, MIN_VISIBLE - (Date.now() - shownAt.current));
      window.clearTimeout(hideTimer.current);
      hideTimer.current = window.setTimeout(() => setShown(false), wait);
    };

    window.fetch = async (input, init) => {
      const isAction = hasActionHeader(input, init);
      if (isAction) {
        pending.current += 1;
        scheduleShow();
      }
      try {
        return await original(input, init);
      } finally {
        if (isAction) {
          pending.current = Math.max(0, pending.current - 1);
          if (pending.current === 0) scheduleHide();
        }
      }
    };

    return () => {
      window.fetch = original;
      window.clearTimeout(showTimer.current);
      window.clearTimeout(hideTimer.current);
      window.clearTimeout(watchdog.current);
    };
  }, []);

  if (!visible) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className="anim-fade fixed inset-0 z-[130] grid place-items-center bg-black/35 backdrop-blur-[3px]"
    >
      <div className="anim-pop flex items-center gap-3 rounded-2xl border border-white/10 bg-[#0c1f18]/90 px-5 py-4 text-white shadow-2xl">
        <span className="relative grid size-10 place-items-center">
          <span className="anim-ring absolute inset-0 rounded-full border border-[#c9a24b]/50" />
          <Sparkles className="anim-float size-5 text-[#f4e3ad]" />
        </span>
        <span className="flex items-center gap-2 text-sm font-medium">
          <Loader2 className="size-4 animate-spin text-[#c9a24b]" />
          Memproses…
        </span>
      </div>
    </div>
  );
}
