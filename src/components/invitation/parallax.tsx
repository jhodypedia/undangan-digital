"use client";

import { useEffect, useRef, useState } from "react";

import { cn } from "@/lib/utils";

export function Parallax({
  children,
  speed = 0.12,
  className,
}: {
  children: React.ReactNode;
  speed?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [offset, setOffset] = useState(0);
  const frame = useRef<number | undefined>(undefined);

  useEffect(() => {
    const update = () => {
      const node = ref.current;
      if (!node) return;
      const rect = node.getBoundingClientRect();
      const center = rect.top + rect.height / 2 - window.innerHeight / 2;
      setOffset(-center * speed);
    };
    const onScroll = () => {
      if (frame.current) return;
      frame.current = window.requestAnimationFrame(() => {
        frame.current = undefined;
        update();
      });
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (frame.current) window.cancelAnimationFrame(frame.current);
    };
  }, [speed]);

  return (
    <div ref={ref} className={cn("overflow-visible", className)}>
      <div
        style={{ transform: `translate3d(0, ${offset.toFixed(1)}px, 0)` }}
        className="will-change-transform"
      >
        {children}
      </div>
    </div>
  );
}
