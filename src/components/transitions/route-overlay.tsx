"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { Crown, Gem, Sparkles, Star, Wand2 } from "lucide-react";

type Phase = "idle" | "loading" | "exiting";

const MIN_VISIBLE = 560;
const EXIT_DURATION = 480;
const WATCHDOG = 6000;

export function RouteOverlay({ brand = "UndanganKita" }: { brand?: string }) {
  const pathname = usePathname();
  const [phase, setPhase] = useState<Phase>("idle");
  const phaseRef = useRef<Phase>("idle");
  const startedAt = useRef(0);
  const exitTimer = useRef<number | undefined>(undefined);
  const watchdog = useRef<number | undefined>(undefined);

  const commit = useCallback((next: Phase) => {
    phaseRef.current = next;
    setPhase(next);
  }, []);

  const finish = useCallback(() => {
    commit("exiting");
    window.clearTimeout(exitTimer.current);
    exitTimer.current = window.setTimeout(() => commit("idle"), EXIT_DURATION);
  }, [commit]);

  const begin = useCallback(() => {
    if (phaseRef.current === "loading") return;
    window.clearTimeout(exitTimer.current);
    window.clearTimeout(watchdog.current);
    startedAt.current = Date.now();
    commit("loading");
    watchdog.current = window.setTimeout(() => {
      if (phaseRef.current === "loading") finish();
    }, WATCHDOG);
  }, [commit, finish]);

  useEffect(() => {
    const onClick = (event: MouseEvent) => {
      if (
        event.defaultPrevented ||
        event.button !== 0 ||
        event.metaKey ||
        event.ctrlKey ||
        event.shiftKey ||
        event.altKey
      ) {
        return;
      }
      const target = event.target as HTMLElement | null;
      const anchor = target?.closest?.("a");
      if (!anchor) return;
      const href = anchor.getAttribute("href");
      if (!href || !href.startsWith("/")) return;
      if (anchor.target === "_blank" || anchor.hasAttribute("download")) return;
      const url = new URL(anchor.href, window.location.href);
      if (url.origin !== window.location.origin) return;
      if (
        url.pathname === window.location.pathname &&
        url.search === window.location.search
      ) {
        return;
      }
      begin();
    };

    const onPop = () => begin();

    document.addEventListener("click", onClick, true);
    window.addEventListener("popstate", onPop);
    return () => {
      document.removeEventListener("click", onClick, true);
      window.removeEventListener("popstate", onPop);
      window.clearTimeout(exitTimer.current);
      window.clearTimeout(watchdog.current);
    };
  }, [begin]);

  useEffect(() => {
    if (phaseRef.current !== "loading") return;
    const elapsed = Date.now() - startedAt.current;
    const wait = Math.max(0, MIN_VISIBLE - elapsed);
    const timer = window.setTimeout(() => {
      if (phaseRef.current === "loading") finish();
    }, wait);
    return () => window.clearTimeout(timer);
  }, [pathname, finish]);

  if (phase === "idle") return null;

  return (
    <div
      role="presentation"
      aria-hidden
      className={`fixed inset-0 z-[120] grid place-items-center overflow-hidden transition-all duration-500 ${
        phase === "exiting"
          ? "pointer-events-none scale-[1.04] opacity-0 blur-sm"
          : "opacity-100"
      }`}
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_38%,#12513b_0%,#04150f_70%)]" />
      <div
        className="anim-glow absolute inset-0"
        style={{
          backgroundImage:
            "radial-gradient(circle at 50% 42%, rgba(201,162,75,0.32), transparent 58%)",
        }}
      />

      <div className="absolute top-0 left-0 h-[3px] w-full overflow-hidden">
        <div
          className="h-full rounded-r-full bg-gradient-to-r from-[#0b3d2e] via-[#c9a24b] to-[#f4e3ad] shadow-[0_0_18px_rgba(201,162,75,0.8)]"
          style={
            phase === "exiting"
              ? { width: "100%", transition: "width 260ms ease-out" }
              : { animation: "uk-progress 1.1s cubic-bezier(0.22,1,0.36,1) forwards" }
          }
        />
      </div>

      <Sparkles className="anim-float absolute top-[22%] left-[24%] size-5 text-[#c9a24b]/70" />
      <Star
        className="anim-float absolute top-[30%] right-[22%] size-4 text-[#f4e3ad]/70"
        style={{ animationDelay: "0.8s" }}
      />
      <Wand2
        className="anim-float absolute bottom-[26%] left-[30%] size-4 text-[#c9a24b]/60"
        style={{ animationDelay: "1.4s" }}
      />
      <Crown
        className="anim-float absolute right-[30%] bottom-[30%] size-5 text-[#f4e3ad]/60"
        style={{ animationDelay: "0.4s" }}
      />

      <div className="relative flex flex-col items-center gap-6">
        <div className="relative grid size-40 place-items-center">
          <span className="anim-ring absolute inset-0 rounded-full border border-[#c9a24b]/45" />
          <span
            className="anim-ring absolute inset-0 rounded-full border border-[#c9a24b]/30"
            style={{ animationDelay: "1.3s" }}
          />
          <span
            className="anim-spin-slow absolute inset-2 rounded-full"
            style={{
              background:
                "conic-gradient(from 0deg, transparent 0deg, rgba(201,162,75,0.55) 60deg, transparent 140deg, rgba(244,227,173,0.4) 240deg, transparent 320deg)",
              mask: "radial-gradient(farthest-side, transparent calc(100% - 3px), #000 calc(100% - 2px))",
              WebkitMask:
                "radial-gradient(farthest-side, transparent calc(100% - 3px), #000 calc(100% - 2px))",
            }}
          />
          <span className="anim-pop grid size-20 place-items-center rounded-2xl border border-[#c9a24b]/40 bg-white/5 backdrop-blur-sm">
            <Gem className="anim-float size-9 text-[#f4e3ad]" />
          </span>
        </div>

        <div className="text-center">
          <p className="text-shimmer font-display text-2xl tracking-tight">
            {brand}
          </p>
          <p className="anim-fade mt-1 text-[11px] tracking-[0.35em] text-[#c9a24b]/70 uppercase">
            {phase === "exiting" ? "Selamat datang" : "Menyiapkan halaman"}
          </p>
        </div>
      </div>
    </div>
  );
}
