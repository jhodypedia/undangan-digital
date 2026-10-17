"use client";

import { useEffect, useState } from "react";

function diff(target: number) {
  const now = Date.now();
  const delta = Math.max(0, target - now);
  return {
    hari: Math.floor(delta / 86_400_000),
    jam: Math.floor((delta / 3_600_000) % 24),
    menit: Math.floor((delta / 60_000) % 60),
    detik: Math.floor((delta / 1000) % 60),
  };
}

export function Countdown({ target }: { target: string }) {
  const targetMs = new Date(target).getTime();
  const [time, setTime] = useState(() => diff(targetMs));

  useEffect(() => {
    const timer = setInterval(() => setTime(diff(targetMs)), 1000);
    return () => clearInterval(timer);
  }, [targetMs]);

  const items = [
    { label: "Hari", value: time.hari },
    { label: "Jam", value: time.jam },
    { label: "Menit", value: time.menit },
    { label: "Detik", value: time.detik },
  ];

  return (
    <div className="grid grid-cols-4">
      {items.map((item, index) => (
        <div key={item.label} className="relative px-1 text-center">
          {index > 0 ? (
            <span
              aria-hidden
              className="absolute inset-y-1 left-0 w-px"
              style={{
                background: `linear-gradient(180deg, transparent, color-mix(in srgb, var(--tpl-accent) 55%, transparent), transparent)`,
              }}
            />
          ) : null}
          <p
            className="font-display text-3xl leading-none tabular-nums sm:text-4xl"
            style={{ color: "var(--tpl-text)" }}
          >
            <span key={item.value} className="anim-pop inline-block">
              {String(item.value).padStart(2, "0")}
            </span>
          </p>
          <p
            className="mt-2 text-[10px] tracking-[0.25em] uppercase"
            style={{ color: "var(--tpl-accent)" }}
          >
            {item.label}
          </p>
        </div>
      ))}
    </div>
  );
}
