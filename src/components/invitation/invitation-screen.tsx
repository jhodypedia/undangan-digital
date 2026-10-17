"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { CalendarHeart, Heart, Music2, Pause, Play } from "lucide-react";

import { SectionNav } from "@/components/invitation/section-nav";
import { ScrollProgress } from "@/components/marketing/scroll-progress";
import { trackOpen } from "@/app/u/[slug]/actions";

const PETALS = Array.from({ length: 12 }, (_, index) => ({
  left: (index * 8.3 + 4) % 100,
  delay: (index * 1.7) % 14,
  duration: 12 + ((index * 3) % 9),
  scale: 0.6 + ((index % 4) * 0.22),
}));

const HEARTS = Array.from({ length: 10 }, (_, index) => ({
  left: (index * 9.5 + 3) % 100,
  delay: (index * 2.1) % 18,
  duration: 14 + ((index * 2.5) % 10),
  scale: 0.5 + ((index % 4) * 0.25),
  size: 12 + ((index % 3) * 5),
}));

const SPARKLES = Array.from({ length: 16 }, (_, index) => ({
  top: (index * 13 + 5) % 92,
  left: (index * 19 + 7) % 94,
  delay: (index * 0.7) % 4,
  size: 3 + (index % 3) * 2,
}));

const OPEN_DURATION = 1250;

function monogramOf(title: string) {
  const parts = title.split(/\s*&\s*|\s+dan\s+/i).filter(Boolean);
  if (parts.length >= 2) {
    return `${parts[0].trim().charAt(0)}${parts[1].trim().charAt(0)}`.toUpperCase();
  }
  return title.trim().slice(0, 2).toUpperCase();
}

function splitCouple(title: string): [string, string] | null {
  const parts = title
    .split(/\s*&\s*|\s+dan\s+/i)
    .map((part) => part.trim())
    .filter(Boolean);
  return parts.length === 2 ? [parts[0], parts[1]] : null;
}

export function InvitationScreen({
  slug,
  guestCode,
  guestName,
  coverImage,
  coverPhoto,
  title,
  subtitle,
  dateLabel,
  musicUrl,
  primary,
  accent,
  brand,
  backgroundImage,
  backgroundOverlay = 40,
  backgroundBlur = 0,
  darkBg = false,
  watermark = false,
  watermarkText,
  navItems = [],
  children,
}: {
  slug: string;
  guestCode?: string;
  guestName?: string;
  coverImage?: string | null;
  coverPhoto?: string | null;
  title: string;
  subtitle?: string | null;
  dateLabel: string;
  musicUrl?: string | null;
  primary: string;
  accent: string;
  brand?: string;
  backgroundImage?: string | null;
  backgroundOverlay?: number;
  backgroundBlur?: number;
  darkBg?: boolean;
  watermark?: boolean;
  watermarkText?: string;
  navItems?: { id: string; label: string }[];
  children: React.ReactNode;
}) {
  const [phase, setPhase] = useState<"cover" | "opening" | "open">("cover");
  const [showConfetti, setShowConfetti] = useState(false);
  const scrollProgressRef = useRef<HTMLDivElement | null>(null);
  const [playing, setPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const timerRef = useRef<number | null>(null);

  const revealed = phase !== "cover";
  const coupleParts = splitCouple(title);
  const stackNames = Boolean(
    coupleParts && (title.length > 18 || coupleParts.some((part) => part.length > 10)),
  );

  useEffect(() => {
    void trackOpen(slug, guestCode);
  }, [slug, guestCode]);

  useEffect(() => {
    return () => {
      if (timerRef.current) window.clearTimeout(timerRef.current);
    };
  }, []);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || phase !== "open" || !musicUrl) return;
    audio.play().then(
      () => setPlaying(true),
      () => setPlaying(false),
    );
  }, [phase, musicUrl]);

  useEffect(() => {
    if (phase !== "open") document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [phase]);

  useEffect(() => {
    if (phase !== "open") return;
    const update = () => {
      const node = scrollProgressRef.current;
      if (!node) return;
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const ratio = max > 0 ? Math.min(1, window.scrollY / max) : 0;
      node.style.transform = `scaleX(${ratio})`;
    };
    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, [phase]);

  const openInvitation = () => {
    if (phase !== "cover") return;
    window.scrollTo({ top: 0, behavior: "auto" });
    setPhase("opening");
    timerRef.current = window.setTimeout(() => {
      setPhase("open");
      setShowConfetti(true);
      window.setTimeout(() => setShowConfetti(false), 3200);
      timerRef.current = null;
    }, OPEN_DURATION);
  };

  const toggleMusic = () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (audio.paused) {
      void audio.play();
      setPlaying(true);
    } else {
      audio.pause();
      setPlaying(false);
    }
  };

  return (
    <div
      className="relative isolate min-h-svh"
      data-bg={darkBg ? "dark" : "light"}
      style={{ background: "var(--tpl-background)", color: "var(--tpl-text)" }}
    >
      {phase === "open" ? (
        <>
          <div
            ref={scrollProgressRef}
            className="inv-scroll-progress"
            style={{ transform: "scaleX(0)" }}
          />
          <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
            {Array.from({ length: 18 }).map((_, i) => {
              const left = (i * 37 + 11) % 100;
              const delay = (i * 1.3) % 18;
              const size = 2 + (i % 4);
              const duration = 16 + (i % 6);
              return (
                <span
                  key={`dust-${i}`}
                  className="inv-dust"
                  style={{
                    left: `${left}%`,
                    bottom: "-20px",
                    width: size,
                    height: size,
                    animationDelay: `${delay}s`,
                    animationDuration: `${duration}s`,
                    background:
                      i % 3 === 0
                        ? "var(--tpl-accent)"
                        : "rgba(255,255,255,0.7)",
                  }}
                />
              );
            })}
          </div>
          {showConfetti ? (
            <div className="pointer-events-none fixed inset-0 z-[70] overflow-hidden">
              {Array.from({ length: 48 }).map((_, i) => {
                const angle = (i / 48) * Math.PI * 2;
                const dist = 120 + (i % 5) * 40;
                const cx = Math.cos(angle) * dist;
                const cy = Math.sin(angle) * dist - 60;
                const colors = [
                  "var(--tpl-accent)",
                  "rgba(255,255,255,0.9)",
                  "var(--tpl-primary)",
                ];
                return (
                  <span
                    key={`cf-${i}`}
                    className="inv-confetti"
                    style={{
                      ["--cx" as string]: `${cx}px`,
                      ["--cy" as string]: `${cy}px`,
                      ["--cr" as string]: `${(i * 37) % 360}deg`,
                      background: colors[i % colors.length],
                      animationDelay: `${(i % 6) * 0.03}s`,
                    }}
                  />
                );
              })}
            </div>
          ) : null}
        </>
      ) : null}
      {musicUrl ? <audio ref={audioRef} src={musicUrl} loop preload="none" /> : null}

      {revealed ? (
        <>
          <div
            aria-hidden
            className="pointer-events-none fixed inset-0 -z-10 overflow-hidden"
            style={{ background: "var(--tpl-background)" }}
          >
            {backgroundImage ? (
              <>
                <div
                  className="inv-kenburns absolute -inset-6 bg-cover bg-center"
                  style={{
                    backgroundImage: `url(${backgroundImage})`,
                    filter: backgroundBlur ? `blur(${backgroundBlur}px)` : undefined,
                  }}
                />
                <div
                  className="absolute inset-0"
                  style={{
                    background: `linear-gradient(180deg, rgba(0,0,0,${backgroundOverlay / 100}) 0%, rgba(0,0,0,${(backgroundOverlay * 0.6) / 100}) 45%, rgba(0,0,0,${backgroundOverlay / 100}) 100%)`,
                  }}
                />
              </>
            ) : (
              <div
                className="absolute inset-0"
                style={{
                  background: `radial-gradient(90% 60% at 12% 0%, color-mix(in srgb, ${primary} 16%, transparent) 0%, transparent 55%), radial-gradient(85% 60% at 90% 100%, color-mix(in srgb, ${accent} 18%, transparent) 0%, transparent 60%)`,
                }}
              />
            )}
            <span
              className="inv-orb anim-glow"
              style={{
                top: "-4rem",
                left: "-4rem",
                width: "18rem",
                height: "18rem",
                background: `color-mix(in srgb, ${primary} 40%, transparent)`,
              }}
            />
            <span
              className="inv-orb anim-glow"
              style={{
                bottom: "-5rem",
                right: "-5rem",
                width: "22rem",
                height: "22rem",
                background: `color-mix(in srgb, ${accent} 20%, transparent)`,
                animationDelay: "1.4s",
              }}
            />
            {PETALS.slice(0, 8).map((petal, index) => (
              <span
                key={index}
                className="inv-petal"
                style={{
                  left: `${petal.left}%`,
                  animationDelay: `${petal.delay}s`,
                  animationDuration: `${petal.duration + 4}s`,
                  transform: `scale(${petal.scale})`,
                }}
              />
            ))}
            {HEARTS.map((heart, index) => (
              <Heart
                key={`heart-${index}`}
                className="inv-float-heart"
                style={
                  {
                    left: `${heart.left}%`,
                    width: heart.size,
                    height: heart.size,
                    animationDelay: `${heart.delay}s`,
                    animationDuration: `${heart.duration}s`,
                    "--h-scale": heart.scale,
                  } as React.CSSProperties
                }
              />
            ))}
            {SPARKLES.map((sparkle, index) => (
              <span
                key={`sparkle-${index}`}
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

          <ScrollProgress />

          <div
            className={`anim-page mx-auto max-w-3xl px-4 pt-10 pb-28 sm:px-6 ${
              backgroundImage ? "inv-text-contrast-glow" : ""
            }`}
          >
            {children}
          </div>

          <SectionNav items={navItems} accent={accent} primary={primary} />

          {watermark ? (
            <div
              aria-hidden
              className="pointer-events-none fixed inset-0 z-30 select-none overflow-hidden"
            >
              {[12, 38, 64, 88].map((top, index) => (
                <span
                  key={top}
                  className="absolute text-2xl font-semibold whitespace-nowrap opacity-[0.06]"
                  style={{
                    top: `${top}%`,
                    left: index % 2 === 0 ? "-10%" : "-25%",
                    transform: "rotate(-24deg)",
                    color: "var(--tpl-text)",
                    letterSpacing: "0.2em",
                  }}
                >
                  {(watermarkText || "UndanganKita").repeat(3)}
                </span>
              ))}
            </div>
          ) : null}

          {musicUrl ? (
            <button
              type="button"
              onClick={toggleMusic}
              className="fixed right-4 bottom-20 z-50 grid size-12 place-items-center rounded-full shadow-xl transition-transform hover:scale-110"
              style={{ background: accent, color: primary }}
              aria-label={playing ? "Jeda musik" : "Putar musik"}
            >
              {playing ? (
                <Pause className="size-5" />
              ) : (
                <Play className="size-5" />
              )}
              {playing ? (
                <span
                  className="anim-ring pointer-events-none absolute inset-0 rounded-full border"
                  style={{ borderColor: accent }}
                />
              ) : null}
            </button>
          ) : null}
        </>
      ) : null}

      {phase === "cover" ? (
        <div className="fixed inset-0 z-50 overflow-hidden">
          <div className="inv-zoom-out absolute inset-0">
            {coverImage ? (
              <div
                className="absolute inset-0 bg-cover bg-center"
                style={{ backgroundImage: `url(${coverImage})` }}
              />
            ) : (
              <div
                className="absolute inset-0"
                style={{
                  background: `radial-gradient(120% 90% at 50% 10%, ${primary} 0%, #10261c 100%)`,
                }}
              />
            )}
            <div className="inv-cover-vignette absolute inset-0" />
          </div>

          <div className="pointer-events-none absolute inset-0 overflow-hidden">
            {PETALS.map((petal, index) => (
              <span
                key={index}
                className="inv-petal"
                style={{
                  left: `${petal.left}%`,
                  animationDelay: `${petal.delay}s`,
                  animationDuration: `${petal.duration}s`,
                  transform: `scale(${petal.scale})`,
                }}
              />
            ))}
            {SPARKLES.slice(0, 10).map((sparkle, index) => (
              <span
                key={`cover-sparkle-${index}`}
                className="inv-sparkle"
                style={{
                  top: `${sparkle.top}%`,
                  left: `${sparkle.left}%`,
                  width: sparkle.size + 1,
                  height: sparkle.size + 1,
                  animationDelay: `${sparkle.delay}s`,
                }}
              />
            ))}
          </div>

          <div className="absolute inset-3 rounded-[28px] border sm:inset-5 md:inset-8" style={{ borderColor: `${accent}55` }} />
          <div className="absolute inset-5 rounded-[22px] border sm:inset-7 md:inset-10" style={{ borderColor: `${accent}22` }} />

          <div className="relative z-10 flex h-full flex-col items-center justify-between px-6 py-10 text-center">
            <p
              className="inv-drop-in text-[11px] uppercase tracking-[0.45em]"
              style={{ color: accent }}
            >
              {subtitle ?? "Undangan"}
            </p>

            <div className="flex flex-col items-center">
              <div className="anim-pop relative grid place-items-center">
                {coverPhoto ? (
                  <div className="relative grid place-items-center">
                    <span
                      aria-hidden
                      className="inv-spin-ring pointer-events-none absolute -inset-4 rounded-full opacity-80"
                      style={{
                        background: `conic-gradient(from 0deg, transparent 0deg, ${accent} 80deg, transparent 190deg, ${accent}00 360deg)`,
                        filter: "blur(1.5px)",
                      }}
                    />
                    <span
                      aria-hidden
                      className="inv-sparkle absolute -top-1 -right-2"
                      style={{ width: 6, height: 6 }}
                    />
                    <Image
                      src={coverPhoto}
                      alt={title}
                      width={320}
                      height={320}
                      unoptimized
                      className="relative size-32 rounded-full object-cover shadow-2xl sm:size-40"
                      style={{
                        border: `4px solid ${accent}`,
                        boxShadow: `0 0 0 6px rgba(0,0,0,0.25), 0 24px 50px -20px ${accent}aa`,
                      }}
                    />
                  </div>
                ) : (
                  <div className="relative grid place-items-center">
                    <span
                      aria-hidden
                      className="inv-spin-ring pointer-events-none absolute -inset-3 rounded-full opacity-70"
                      style={{
                        background: `conic-gradient(from 0deg, transparent 0deg, ${accent} 90deg, transparent 200deg, ${accent}00 360deg)`,
                        filter: "blur(1px)",
                      }}
                    />
                    <div
                      className="relative grid size-20 place-items-center rounded-full border backdrop-blur"
                      style={{
                        borderColor: `${accent}88`,
                        background: "rgba(0,0,0,0.25)",
                      }}
                    >
                      <span className="font-display text-2xl" style={{ color: accent }}>
                        {monogramOf(title)}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              <p className="inv-drop-in mt-8 text-xs uppercase tracking-[0.35em] text-white/70">
                The Wedding Of
              </p>
              <h1 className="inv-drop-in mt-3 max-w-full font-display text-4xl leading-tight text-balance break-words text-white sm:text-6xl">
                {stackNames && coupleParts ? (
                  <>
                    <span className="block">{coupleParts[0]}</span>
                    <span
                      className="my-1.5 block font-display text-2xl leading-none font-normal text-white/60 sm:text-3xl"
                    >
                      &amp;
                    </span>
                    <span className="block">{coupleParts[1]}</span>
                  </>
                ) : (
                  title
                )}
              </h1>
              <div className="mt-5 flex items-center gap-3">
                <span className="h-px w-10" style={{ background: accent }} />
                <CalendarHeart
                  className="inv-heartbeat size-4"
                  style={{ color: accent }}
                />
                <span className="h-px w-10" style={{ background: accent }} />
              </div>
              <p className="mt-4 text-sm tracking-wide text-white/85">{dateLabel}</p>

              {guestName ? (
                <div
                  className="inv-drop-in mt-9 rounded-2xl border px-7 py-4 backdrop-blur"
                  style={{
                    borderColor: `${accent}55`,
                    background: "rgba(0,0,0,0.28)",
                  }}
                >
                  <p className="text-[11px] uppercase tracking-[0.25em] text-white/60">
                    Kepada Bapak/Ibu/Saudara/i
                  </p>
                  <p className="mt-1 font-display text-xl text-white">
                    {guestName}
                  </p>
                </div>
              ) : null}
            </div>

            <div className="flex flex-col items-center gap-4">
              <button
                type="button"
                onClick={openInvitation}
                className="sheen group inline-flex items-center gap-2 rounded-full px-7 py-3.5 text-sm font-semibold shadow-2xl transition-transform hover:scale-105"
                style={{ background: accent, color: primary }}
              >
                <Music2 className="size-4 transition-transform group-hover:rotate-12" />
                Buka Undangan
              </button>
              <p className="text-[11px] text-white/55">
                {brand ?? "UndanganKita"}
              </p>
            </div>
          </div>
        </div>
      ) : null}

      {phase === "opening" ? (
        <div className="fixed inset-0 z-[60] overflow-hidden">
          <div
            className="inv-curtain-left absolute inset-y-0 left-0 w-1/2"
            style={{ background: primary }}
          />
          <div
            className="inv-curtain-right absolute inset-y-0 right-0 w-1/2"
            style={{ background: primary }}
          />
          <div
            className="inv-curtain-mark absolute inset-x-0 top-1/2 -translate-y-1/2 text-center font-display text-2xl"
            style={{ color: accent }}
          >
            {monogramOf(title)}
          </div>
        </div>
      ) : null}
    </div>
  );
}
