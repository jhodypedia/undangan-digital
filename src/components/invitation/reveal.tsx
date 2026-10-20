"use client";

import {
  ScrollAnimate,
  type ScrollAnimation,
} from "@/components/invitation/scroll-animate";

export function Reveal({
  children,
  className,
  delay = 0,
  animation = "fadeInUp",
  as: Tag = "div",
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  animation?: ScrollAnimation;
  as?: "div" | "section" | "li";
}) {
  return (
    <ScrollAnimate
      as={Tag}
      animation={animation}
      delay={delay}
      duration={0.9}
      className={className}
    >
      {children}
    </ScrollAnimate>
  );
}
