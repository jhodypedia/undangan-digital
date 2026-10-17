"use client";

import { useEffect, useState } from "react";
import {
  CalendarDays,
  Gift,
  Heart,
  Image as ImageIcon,
  Mail,
  MapPin,
  Quote,
  Send,
  Users,
} from "lucide-react";

const ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  quote: Quote,
  couple: Users,
  countdown: CalendarDays,
  events: MapPin,
  story: Send,
  gallery: ImageIcon,
  album: ImageIcon,
  gift: Gift,
  rsvp: Mail,
  wishes: Heart,
};

export function SectionNav({
  items,
  accent,
  primary,
}: {
  items: { id: string; label: string }[];
  accent: string;
  primary: string;
}) {
  const [active, setActive] = useState(items[0]?.id ?? "");

  useEffect(() => {
    const nodes = items
      .map((item) => document.getElementById(item.id))
      .filter((node): node is HTMLElement => Boolean(node));
    if (nodes.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (visible) setActive(visible.target.id);
      },
      { rootMargin: "-45% 0px -45% 0px", threshold: [0, 0.25, 0.5, 1] },
    );
    nodes.forEach((node) => observer.observe(node));
    return () => observer.disconnect();
  }, [items]);

  if (items.length === 0) return null;

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 flex justify-center px-3 pb-3">
      <div
        className="flex max-w-full items-center gap-1 overflow-x-auto rounded-full border p-1.5 shadow-xl backdrop-blur"
        style={{
          background: "color-mix(in srgb, var(--tpl-surface) 88%, transparent)",
          borderColor: "color-mix(in srgb, var(--tpl-accent) 35%, transparent)",
        }}
      >
        {items.map((item) => {
          const Icon = ICONS[item.id] ?? Heart;
          const isActive = active === item.id;
          return (
            <a
              key={item.id}
              href={`#${item.id}`}
              className="flex shrink-0 items-center gap-1.5 rounded-full px-3 py-2 text-xs font-medium transition-all"
              style={{
                background: isActive ? accent : "transparent",
                color: isActive ? primary : "var(--tpl-text)",
              }}
            >
              <Icon className="size-4" />
              <span className={isActive ? "inline" : "hidden sm:inline"}>
                {item.label}
              </span>
            </a>
          );
        })}
      </div>
    </nav>
  );
}
