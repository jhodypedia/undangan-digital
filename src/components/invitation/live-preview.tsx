"use client";

import Image from "next/image";
import { CalendarDays, Heart, MapPin, Quote, Send, Users } from "lucide-react";

import { cn } from "@/lib/utils";

export type PreviewColors = {
  primary: string;
  accent: string;
  background: string;
  surface: string;
  text: string;
};

export type LivePreviewEvent = {
  name: string;
  date: string;
  time: string;
  venue: string;
};

const HEARTS = [
  { left: 12, delay: 0, duration: 9, scale: 0.9 },
  { left: 34, delay: 3, duration: 11, scale: 0.6 },
  { left: 66, delay: 1.5, duration: 10, scale: 0.8 },
  { left: 86, delay: 4, duration: 12, scale: 0.7 },
];

const SPARKLES = [
  { top: 18, left: 24, size: 5, delay: 0 },
  { top: 30, left: 74, size: 4, delay: 1.1 },
  { top: 58, left: 16, size: 3, delay: 0.6 },
  { top: 68, left: 82, size: 5, delay: 1.8 },
  { top: 44, left: 50, size: 3, delay: 2.4 },
];

export function LiveInvitationPreview({
  coupleTitle,
  dateLabel,
  subtitle = "Undangan Pernikahan",
  guestName,
  quote,
  greeting,
  closing,
  coverPhoto,
  backgroundImage,
  overlay = 40,
  blur = 0,
  colors,
  fontDisplay = "Georgia",
  events = [],
  photos = [],
  scroll = false,
  showSections = true,
  className,
}: {
  coupleTitle: string;
  dateLabel: string;
  subtitle?: string;
  guestName?: string;
  quote?: string;
  greeting?: string;
  closing?: string;
  coverPhoto?: string;
  backgroundImage?: string;
  overlay?: number;
  blur?: number;
  colors: PreviewColors;
  fontDisplay?: string;
  events?: LivePreviewEvent[];
  photos?: string[];
  scroll?: boolean;
  showSections?: boolean;
  className?: string;
}) {
  const initial = coupleTitle.trim().charAt(0).toUpperCase() || "U";

  return (
    <div
      className={cn("relative h-full w-full overflow-hidden", className)}
      style={
        {
          "--tpl-primary": colors.primary,
          "--tpl-accent": colors.accent,
          "--tpl-background": colors.background,
          "--tpl-surface": colors.surface,
          "--tpl-text": colors.text,
        } as React.CSSProperties
      }
    >
      {backgroundImage ? (
        <div
          className="inv-kenburns absolute -inset-8 bg-cover bg-center"
          style={{
            backgroundImage: `url(${backgroundImage})`,
            filter: blur ? `blur(${blur}px)` : undefined,
          }}
        />
      ) : (
        <div
          className="absolute inset-0"
          style={{
            background: `radial-gradient(120% 90% at 50% 0%, color-mix(in srgb, ${colors.primary} 82%, white) 0%, ${colors.primary} 55%, color-mix(in srgb, ${colors.primary} 70%, black) 100%)`,
          }}
        />
      )}
      <div
        className="absolute inset-0"
        style={{ background: `rgba(0,0,0,${overlay / 100})` }}
      />

      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        {HEARTS.map((heart, index) => (
          <span
            key={`ph-${index}`}
            className="inv-float-heart"
            style={{
              left: `${heart.left}%`,
              animationDelay: `${heart.delay}s`,
              animationDuration: `${heart.duration}s`,
              transform: `scale(${heart.scale})`,
            }}
          >
            <Heart className="size-4" />
          </span>
        ))}
        {SPARKLES.map((sparkle, index) => (
          <span
            key={`ps-${index}`}
            className="inv-sparkle"
            style={{
              top: `${sparkle.top}%`,
              left: `${sparkle.left}%`,
              width: sparkle.size,
              height: sparkle.size,
              animationDelay: `${sparkle.delay}s`,
            }}
          />
        ))}
      </div>

      <div
        className={cn("relative h-full font-body", scroll && "inv-preview-scroll")}
        style={
          {
            "--preview-scroll": "16rem",
            fontFamily: `'${fontDisplay}', ui-serif, Georgia, serif`,
          } as React.CSSProperties
        }
      >
        <div className="relative flex h-full flex-col items-center justify-between px-6 py-9 text-center text-white">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-3 rounded-[1.6rem] border"
            style={{ borderColor: `${colors.accent}66` }}
          />
          <div
            aria-hidden
            className="pointer-events-none absolute inset-5 rounded-[1.3rem] border"
            style={{ borderColor: `${colors.accent}2e` }}
          />

          <p
            className="inv-drop-in relative text-[10px] uppercase tracking-[0.45em]"
            style={{ color: colors.accent }}
          >
            {subtitle}
          </p>

          <div className="relative flex flex-col items-center">
            <div className="anim-pop relative grid place-items-center">
              <span
                aria-hidden
                className="inv-spin-ring pointer-events-none absolute -inset-4 rounded-full opacity-80"
                style={{
                  background: `conic-gradient(from 0deg, transparent 0deg, ${colors.accent} 80deg, transparent 190deg, ${colors.accent}00 360deg)`,
                  filter: "blur(1.5px)",
                }}
              />
              {coverPhoto ? (
                <Image
                  src={coverPhoto}
                  alt={coupleTitle}
                  width={320}
                  height={320}
                  unoptimized
                  className="relative size-28 rounded-full object-cover sm:size-32"
                  style={{
                    border: `4px solid ${colors.accent}`,
                    boxShadow: `0 0 0 6px rgba(0,0,0,.28), 0 22px 46px -18px ${colors.accent}aa`,
                  }}
                />
              ) : (
                <span
                  className="grid size-28 place-items-center rounded-full sm:size-32"
                  style={{
                    border: `4px solid ${colors.accent}`,
                    background: `color-mix(in srgb, ${colors.accent} 22%, transparent)`,
                    boxShadow: `0 0 0 6px rgba(0,0,0,.28)`,
                  }}
                >
                  <span className="font-display text-4xl" style={{ color: colors.accent }}>
                    {initial}
                  </span>
                </span>
              )}
            </div>

            <h1
              className="inv-title-shine mt-6 max-w-[16rem] text-balance font-display text-4xl leading-tight sm:text-[2.6rem]"
            >
              {coupleTitle}
            </h1>
            <span
              className="inv-ornament mt-4 w-full"
              style={{ ["--tpl-accent" as string]: colors.accent }}
            >
              <Heart className="inv-heartbeat size-3.5" style={{ color: colors.accent }} />
            </span>
            <p className="mt-3 text-xs text-white/75">{dateLabel}</p>
          </div>

          <div className="relative flex flex-col items-center gap-2">
            {guestName ? (
              <p className="text-[11px] text-white/70">
                Kepada: <span className="font-medium text-white">{guestName}</span>
              </p>
            ) : null}
            <span
              className="sheen inv-heartbeat inline-flex items-center gap-1.5 rounded-full px-5 py-2 text-xs font-medium"
              style={{ background: colors.accent, color: colors.primary }}
            >
              Buka Undangan
            </span>
          </div>
        </div>

        {showSections ? (
          <div className="space-y-4 px-4 pb-10 pt-2">
            {quote ? (
              <section className="inv-plate p-5 text-center">
                <Quote className="mx-auto size-4" style={{ color: colors.accent }} />
                <p className="mt-3 font-display text-sm leading-relaxed">
                  “{quote}”
                </p>
              </section>
            ) : null}

            <section className="inv-plate space-y-4 p-5 text-center">
              <p
                className="text-[9px] uppercase tracking-[0.35em]"
                style={{ color: colors.accent }}
              >
                Mempelai
              </p>
              <div className="flex items-center justify-center gap-5">
                {[0, 1].map((index) => (
                  <div key={index} className="flex flex-col items-center gap-2">
                    <span
                      className="inv-arch grid size-14 place-items-center"
                      style={{
                        background: `color-mix(in srgb, ${colors.accent} 20%, transparent)`,
                        border: `1px solid color-mix(in srgb, ${colors.accent} 45%, transparent)`,
                      }}
                    >
                      <Users className="size-4" style={{ color: colors.accent }} />
                    </span>
                    <span className="font-display text-xs">
                      {coupleTitle.split("&")[index]?.trim() ?? ""}
                    </span>
                  </div>
                ))}
              </div>
              {greeting ? (
                <p className="text-[11px] leading-relaxed opacity-70">{greeting}</p>
              ) : null}
            </section>

            <section className="inv-plate space-y-4 p-5">
              <p
                className="text-center text-[9px] uppercase tracking-[0.35em]"
                style={{ color: colors.accent }}
              >
                Hitung Hari
              </p>
              <div className="grid grid-cols-4 gap-1 text-center">
                {[
                  ["Hari", "24"],
                  ["Jam", "08"],
                  ["Menit", "41"],
                  ["Detik", "12"],
                ].map(([label, value]) => (
                  <div key={label}>
                    <p className="font-display text-2xl tabular-nums">{value}</p>
                    <p
                      className="mt-1 text-[8px] uppercase tracking-[0.2em]"
                      style={{ color: colors.accent }}
                    >
                      {label}
                    </p>
                  </div>
                ))}
              </div>
            </section>

            {events.slice(0, 2).map((event) => (
              <section key={event.name} className="inv-plate-soft space-y-1.5 p-4">
                <p className="text-center font-display text-sm">{event.name}</p>
                <p className="flex items-center justify-center gap-1.5 text-[11px] opacity-80">
                  <CalendarDays className="size-3" style={{ color: colors.accent }} />
                  {event.date} · {event.time}
                </p>
                <p className="flex items-center justify-center gap-1.5 text-[11px] opacity-80">
                  <MapPin className="size-3" style={{ color: colors.accent }} />
                  {event.venue}
                </p>
              </section>
            ))}

            {photos.length > 0 ? (
              <section className="inv-plate space-y-3 p-4">
                <p
                  className="text-center text-[9px] uppercase tracking-[0.35em]"
                  style={{ color: colors.accent }}
                >
                  Galeri
                </p>
                <div className="grid grid-cols-3 gap-2">
                  {photos.slice(0, 3).map((photo, index) => (
                    <span key={index} className="inv-photo-frame block">
                      <Image
                        src={photo}
                        alt=""
                        width={200}
                        height={200}
                        unoptimized
                        className="aspect-square w-full rounded-[0.8rem] object-cover"
                      />
                    </span>
                  ))}
                </div>
              </section>
            ) : null}

            {closing ? (
              <section className="inv-plate p-5 text-center">
                <span className="inv-ornament" style={{ ["--tpl-accent" as string]: colors.accent }}>
                  <Send className="size-4" style={{ color: colors.accent }} />
                </span>
                <p className="mt-3 text-[11px] leading-relaxed opacity-80">
                  {closing}
                </p>
              </section>
            ) : null}
          </div>
        ) : null}
      </div>
    </div>
  );
}
