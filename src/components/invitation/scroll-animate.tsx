"use client";

import { useEffect, useRef, useState } from "react";

import { cn } from "@/lib/utils";

export type ScrollAnimation =
  | "fadeIn"
  | "fadeInUp"
  | "fadeInDown"
  | "fadeInLeft"
  | "fadeInRight"
  | "zoomIn"
  | "bounceIn";

/**
 * Scroll-triggered entrance using animate.css — the same family of
 * fadeInUp / zoomIn / bounceIn effects used by the reference invitation.
 */
export function ScrollAnimate({
  children,
  animation = "fadeInUp",
  delay = 0,
  duration = 0.9,
  as: Tag = "div",
  className,
  threshold = 0.12,
}: {
  children: React.ReactNode;
  animation?: ScrollAnimation;
  delay?: number;
  duration?: number;
  as?: "div" | "section" | "li" | "span" | "p";
  className?: string;
  threshold?: number;
}) {
  const ref = useRef<HTMLElement | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    if (typeof IntersectionObserver === "undefined") {
      const timer = window.setTimeout(() => setVisible(true), 0);
      return () => window.clearTimeout(timer);
    }
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setVisible(true);
            observer.disconnect();
          }
        }
      },
      { threshold, rootMargin: "0px 0px -36px 0px" },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [threshold]);

  return (
    <Tag
      ref={ref as never}
      className={cn(
        visible
          ? `animate__animated animate__${animation}`
          : "opacity-0 motion-reduce:opacity-100",
        className,
      )}
      style={{
        animationDelay: `${delay}ms`,
        animationDuration: `${duration}s`,
        animationFillMode: "backwards",
      }}
    >
      {children}
    </Tag>
  );
}
