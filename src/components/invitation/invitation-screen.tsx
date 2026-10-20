"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { Heart, MailOpen, Music2, Play } from "lucide-react";

import {
  CoverArch,
  GununganOrnament,
  MotifPattern,
  MotifSilhouette,
  OrnamentFrame,
  SectionRule,
} from "@/components/invitation/ornaments";
import { SectionNav } from "@/components/invitation/section-nav";
import { ScrollProgress } from "@/components/marketing/scroll-progress";
import { trackOpen } from "@/app/u/[slug]/actions";
import type {
  CoverStyle,
  FrameStyle,
  OrnamentKey,
  TemplateLayout,
} from "@/lib/template-config";
import { cn } from "@/lib/utils";

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
const CEREMONIAL_OPEN_DURATION = 1500;

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

function CoverPhotoFrame({
  src,
  title,
  accent,
  frameStyle,
  layout,
  monogram,
  className,
}: {
  src?: string | null;
  title: string;
  accent: string;
  frameStyle: FrameStyle;
  layout: TemplateLayout;
  monogram: string;
  className?: string;
}) {
  const shape =
    frameStyle === "square"
      ? "rounded-none"
      : frameStyle === "arch"
        ? "rounded-t-[999px] rounded-b-xl"
        : "rounded-[1.6rem]";
  const size = frameStyle === "arch" ? "h-52 w-40" : "size-36";

  return (
    <div className={cn("relative", size, className)}>
      <div
        className={cn(
          "relative h-full w-full overflow-hidden border-2 shadow-2xl",
          shape,
        )}
        style={{
          borderColor: accent,
          background: `color-mix(in srgb, ${accent} 20%, transparent)`,
        }}
      >
        {src ? (
          <Image
            src={src}
            alt={title}
            width={360}
            height={460}
            unoptimized
            className="h-full w-full object-cover"
          />
        ) : (
          <span
            className="grid h-full w-full place-items-center font-display text-3xl"
            style={{ color: accent }}
          >
            {monogram}
          </span>
        )}
      </div>
      {frameStyle === "arch" ? (
        <CoverArch
          frameStyle="arch"
          color={accent}
          secondaryColor={accent}
        />
      ) : null}
      {layout === "royal" && frameStyle === "arch" ? (
        <span
          aria-hidden
          className="pointer-events-none absolute -inset-2 rounded-t-[999px] rounded-b-2xl border"
          style={{ borderColor: `${accent}55` }}
        />
      ) : null}
    </div>
  );
}

function CoverNames({
  title,
  accent,
  layout,
  dividerKey,
  ceremonial = false,
  color = "#ffffff",
  align = "center",
  className,
}: {
  title: string;
  accent: string;
  layout: TemplateLayout;
  dividerKey: OrnamentKey;
  ceremonial?: boolean;
  color?: string;
  align?: "center" | "left";
  className?: string;
}) {
  const parts = splitCouple(title);
  const stack = Boolean(
    parts && (title.length > 18 || parts.some((part) => part.length > 10)),
  );
  const modern = layout === "modern";
  const minimal = layout === "minimal";
  const centered = align === "center";

  return (
    <div
      className={cn(
        "flex flex-col",
        centered ? "items-center text-center" : "items-start text-left",
        className,
      )}
    >
      {!minimal ? (
        <p
          className={cn(
            "text-[11px]",
            ceremonial
              ? "normal-case tracking-[0.22em]"
              : modern
                ? "uppercase tracking-[0.22em]"
                : "uppercase tracking-[0.4em]",
          )}
          style={{
            color: accent,
            fontFamily: ceremonial
              ? "var(--tpl-font-accent, serif)"
              : undefined,
          }}
        >
          The Wedding Of
        </p>
      ) : null}
      <h1
        className={cn(
          modern ? "font-body font-semibold tracking-tight" : "font-display",
          ceremonial ? "font-semibold" : "",
          minimal
            ? "text-xl uppercase tracking-[0.3em]"
            : "text-4xl leading-tight sm:text-5xl",
          "mt-3 max-w-full text-balance break-words",
        )}
        style={{ color }}
      >
        {stack && parts ? (
          <>
            <span className="block">{parts[0]}</span>
            <span
              className={cn(
                "my-1.5 block font-display text-2xl leading-none font-normal sm:text-3xl",
                minimal ? "tracking-normal" : "",
              )}
              style={{ color: accent }}
            >
              &amp;
            </span>
            <span className="block">{parts[1]}</span>
          </>
        ) : minimal ? (
          title.toUpperCase()
        ) : (
          title
        )}
      </h1>

      <SectionRule
        layout={layout}
        motif={dividerKey}
        color={accent}
        className={cn(
          "mt-5",
          minimal ? "mx-auto" : modern ? "" : "w-full max-w-[15rem]",
        )}
      />
    </div>
  );
}

function GuestBox({
  name,
  accent,
  variant,
}: {
  name: string;
  accent: string;
  variant: "dark" | "light" | "bare";
}) {
  if (variant === "bare") {
    return (
      <div className="mt-7">
        <p className="text-[10px] uppercase tracking-[0.3em] opacity-55">
          Kepada Bapak/Ibu/Saudara/i
        </p>
        <p className="mt-1 font-display text-xl">{name}</p>
      </div>
    );
  }
  return (
    <div
      className="mt-7 rounded-2xl border px-6 py-3 backdrop-blur"
      style={
        variant === "dark"
          ? { borderColor: `${accent}55`, background: "rgba(0,0,0,0.28)" }
          : {
              borderColor: `${accent}66`,
              background: `color-mix(in srgb, ${accent} 10%, transparent)`,
            }
      }
    >
      <p
        className="text-[10px] uppercase tracking-[0.25em] opacity-60"
      >
        Kepada Bapak/Ibu/Saudara/i
      </p>
      <p className="mt-1 font-display text-lg">{name}</p>
    </div>
  );
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
  layout = "classic",
  coverStyle = "full",
  frameStyle = "rounded",
  motifKey = "daun-emas",
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
  layout?: TemplateLayout;
  coverStyle?: CoverStyle;
  frameStyle?: FrameStyle;
  motifKey?: OrnamentKey;
  children: React.ReactNode;
}) {
  const [phase, setPhase] = useState<"cover" | "opening" | "open">("cover");
  const [showConfetti, setShowConfetti] = useState(false);
  const scrollProgressRef = useRef<HTMLDivElement | null>(null);
  const [playing, setPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const timerRef = useRef<number | null>(null);

  const revealed = phase !== "cover";
  const monogram = monogramOf(title);
  const isModern = layout === "modern";
  const isMinimal = layout === "minimal";
  const showsOrnaments = ["classic", "royal", "floral", "javanese"].includes(
    layout,
  );
  const ceremonial = motifKey === "gunungan";
  const dividerKey: OrnamentKey =
    layout === "javanese" ? "parang" : motifKey;

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
      if (!isMinimal) {
        setShowConfetti(true);
        window.setTimeout(() => setShowConfetti(false), 3200);
      }
      timerRef.current = null;
    }, ceremonial ? CEREMONIAL_OPEN_DURATION : OPEN_DURATION);
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

  const subtitleNode = (
    <p
      className={cn(
        "text-[11px] uppercase",
        isMinimal ? "tracking-[0.3em]" : "tracking-[0.45em]",
      )}
      style={{ color: accent }}
    >
      {subtitle ?? "Undangan"}
    </p>
  );

  const coverOpeningClass =
    phase === "opening" && ceremonial ? "inv-cover-lift" : undefined;

  const openButton = (className?: string) => (
    <button
      type="button"
      onClick={openInvitation}
      className={cn(
        "sheen group inline-flex items-center gap-2 text-sm font-semibold transition-transform hover:scale-105",
        "animate__animated animate__bounceIn",
        ceremonial
          ? "rounded-none border-y-2 px-8 py-3 font-display tracking-[0.24em] uppercase"
          : "rounded-full px-7 py-3.5 shadow-2xl",
        className,
      )}
      style={
        ceremonial
          ? {
              background: "transparent",
              color: accent,
              borderColor: accent,
              animationDelay: "0.85s",
              animationFillMode: "backwards",
            }
          : {
              background: accent,
              color: primary,
              animationDelay: "0.55s",
              animationFillMode: "backwards",
            }
      }
    >
      {ceremonial ? (
        <MailOpen className="size-4 transition-transform group-hover:-translate-y-0.5" />
      ) : (
        <Music2 className="size-4 transition-transform group-hover:rotate-12" />
      )}
      Buka Undangan
    </button>
  );

  const coverFull = (
    <div
      className={cn(
        "fixed inset-y-0 left-1/2 z-50 w-full max-w-[480px] -translate-x-1/2 overflow-hidden",
        coverOpeningClass,
      )}
    >
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
              background: ceremonial
                ? `radial-gradient(120% 90% at 50% 8%, #24180f 0%, ${primary} 48%, #070605 100%), radial-gradient(55% 35% at 50% 105%, #5f160c 0%, transparent 72%)`
                : `radial-gradient(120% 90% at 50% 10%, ${primary} 0%, color-mix(in srgb, ${primary} 65%, #000 35%) 100%)`,
            }}
          />
        )}
        {!isModern && !isMinimal && (
          <MotifPattern
            motif={motifKey}
            color={accent}
            opacity={layout === "javanese" ? (ceremonial ? 0.28 : 0.22) : 0.15}
          />
        )}
        {ceremonial ? (
          <div
            className="absolute inset-0"
            style={{
              background:
                "radial-gradient(75% 45% at 50% 112%, rgba(95,22,12,0.82) 0%, transparent 68%)",
            }}
          />
        ) : null}
        <div className="inv-cover-vignette absolute inset-0" />
      </div>

      {isMinimal ? (
        <div
          aria-hidden
          className="pointer-events-none absolute inset-6 border"
          style={{ borderColor: `${accent}44` }}
        />
      ) : isModern ? (
        <>
          <span
            aria-hidden
            className="pointer-events-none absolute inset-y-10 left-6 w-1"
            style={{ background: accent }}
          />
          <span
            aria-hidden
            className="pointer-events-none absolute inset-y-10 right-6 w-px opacity-30"
            style={{ background: accent }}
          />
        </>
      ) : (
        <>
          <div
            aria-hidden
            className="pointer-events-none absolute inset-3 border"
            style={{
              borderColor: ceremonial ? accent : `${accent}55`,
              borderWidth: ceremonial ? 2 : 1,
            }}
          />
          <div
            aria-hidden
            className="pointer-events-none absolute inset-5 border"
            style={{
              borderColor: ceremonial ? "rgba(255,255,255,0.34)" : `${accent}22`,
            }}
          />
          <div className="pointer-events-none absolute inset-0 z-10">
            <OrnamentFrame color={`${accent}cc`} size="size-12 sm:size-14" />
          </div>
        </>
      )}

      {layout === "javanese" ? (
        <MotifSilhouette
          motif="siluet-joglo"
          color={`${accent}55`}
          className="absolute right-5 bottom-24 z-10 h-16 w-16"
        />
      ) : null}

      <div className="pointer-events-none absolute inset-0 z-10 overflow-hidden">
        {showsOrnaments ? (
          <>
            {PETALS.map((petal, index) => (
              <span
                key={`petal-${index}`}
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
          </>
        ) : null}
      </div>

      <div
        className={cn(
          "relative z-20 flex h-full flex-col px-6 py-10 text-white",
          isModern ? "items-start text-left" : "items-center text-center",
        )}
      >
        {!ceremonial ? (
          <div className="animate__animated animate__fadeInDown">
            {subtitleNode}
          </div>
        ) : null}

        <div
          className={cn(
            "relative flex flex-1 flex-col justify-center",
            isModern ? "items-start" : "items-center",
          )}
        >
          {ceremonial ? (
            <GununganOrnament
              color={`${accent}20`}
              className="absolute top-1/2 left-1/2 -z-10 h-[27rem] w-56 -translate-x-1/2 -translate-y-1/2"
            />
          ) : null}

          {layout === "royal" ? (
            <span
              aria-hidden
              className="pointer-events-none absolute inset-0 -z-10 grid place-items-center font-display text-[11rem] leading-none opacity-[0.08]"
              style={{ color: accent }}
            >
              {monogram}
            </span>
          ) : null}

          <div
            className="animate__animated animate__zoomIn"
            style={{ animationDelay: "0.08s", animationDuration: "1s" }}
          >
            {ceremonial ? (
              <GununganOrnament
                color={`${accent}d9`}
                className="h-40 w-28 sm:h-44 sm:w-32"
              />
            ) : (
              <CoverPhotoFrame
                src={coverPhoto}
                title={title}
                accent={accent}
                frameStyle={frameStyle}
                layout={layout}
                monogram={monogram}
              />
            )}
          </div>

          <div
            className="animate__animated animate__fadeInUp"
            style={{ animationDelay: "0.28s", animationDuration: "1s" }}
          >
            <CoverNames
              title={title}
              accent={accent}
              layout={layout}
              dividerKey={dividerKey}
              ceremonial={ceremonial}
              color="#ffffff"
              align={isModern ? "left" : "center"}
              className={ceremonial ? "mt-5" : "mt-8"}
            />
          </div>

          <p
            className={cn(
              "animate__animated animate__fadeInUp mt-4 text-sm tracking-wide",
              isMinimal ? "text-xs uppercase tracking-[0.25em]" : "",
            )}
            style={{
              color: "rgba(255,255,255,0.85)",
              animationDelay: "0.48s",
              animationDuration: "1s",
            }}
          >
            {dateLabel}
          </p>

          {guestName ? (
            <div
              className="animate__animated animate__fadeInUp"
              style={{ animationDelay: "0.62s", animationDuration: "1s" }}
            >
              <GuestBox
                name={guestName}
                accent={accent}
                variant={ceremonial ? "bare" : "dark"}
              />
            </div>
          ) : null}
        </div>

        <div
          className={cn(
            "flex flex-col gap-4",
            isModern ? "items-start" : "items-center",
          )}
        >
          {openButton()}
          <p className="text-[11px] text-white/55">
            {brand ?? "UndanganKita"}
          </p>
        </div>
      </div>
    </div>
  );

  const coverSplit = (
    <div
      className={cn(
        "fixed inset-y-0 left-1/2 z-50 flex w-full max-w-[480px] -translate-x-1/2 flex-col overflow-hidden",
        coverOpeningClass,
      )}
    >
      <div className="relative h-[44%] w-full shrink-0 overflow-hidden">
        {coverImage ? (
          <div
            className="inv-zoom-out absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `url(${coverImage})` }}
          />
        ) : (
          <div
            className="inv-zoom-out absolute inset-0"
            style={{
              background: `radial-gradient(120% 100% at 50% 0%, ${primary} 0%, color-mix(in srgb, ${primary} 60%, #000 40%) 100%)`,
            }}
          />
        )}
        {!isModern && !isMinimal ? (
          <MotifPattern
            motif={motifKey}
            color={accent}
            opacity={layout === "javanese" ? 0.2 : 0.14}
          />
        ) : null}
        <div className="inv-cover-vignette absolute inset-0" />
        {layout === "javanese" ? (
          <MotifSilhouette
            motif="siluet-joglo"
            color={`${accent}66`}
            className="absolute right-4 bottom-2 z-10 h-14 w-14"
          />
        ) : null}
        <div className="relative z-10 flex h-full items-start justify-center px-6 pt-8">
          {!ceremonial ? (
            <div className="animate__animated animate__fadeInDown">
              {subtitleNode}
            </div>
          ) : null}
        </div>
      </div>

      <div
        className={cn(
          "relative flex flex-1 flex-col px-7 py-8",
          isModern ? "items-start text-left" : "items-center text-center",
        )}
        style={{ background: primary, color: "#ffffff" }}
      >
        {layout === "royal" ? (
          <>
            <div
              aria-hidden
              className="pointer-events-none absolute inset-3 border"
              style={{ borderColor: `${accent}66` }}
            />
            <div
              aria-hidden
              className="pointer-events-none absolute inset-5 border"
              style={{ borderColor: `${accent}2e` }}
            />
          </>
        ) : null}
        {ceremonial ? (
          <GununganOrnament
            color={`${accent}30`}
            className="pointer-events-none absolute top-1/2 left-1/2 h-72 w-40 -translate-x-1/2 -translate-y-1/2"
          />
        ) : null}
        {layout === "royal" ? (
          <span
            aria-hidden
            className="pointer-events-none absolute inset-0 grid place-items-center font-display text-[9rem] leading-none opacity-[0.06]"
            style={{ color: accent }}
          >
            {monogram}
          </span>
        ) : null}
        {showsOrnaments ? (
          <div className="pointer-events-none absolute inset-0 overflow-hidden">
            {PETALS.slice(0, 6).map((petal, index) => (
              <span
                key={`split-petal-${index}`}
                className="inv-petal"
                style={{
                  left: `${petal.left}%`,
                  animationDelay: `${petal.delay}s`,
                  animationDuration: `${petal.duration}s`,
                  transform: `scale(${petal.scale})`,
                }}
              />
            ))}
          </div>
        ) : null}

        <div className="relative flex flex-1 flex-col justify-center">
          <div
            className="animate__animated animate__fadeInUp"
            style={{ animationDelay: "0.22s", animationDuration: "1s" }}
          >
            <CoverNames
              title={title}
              accent={accent}
              layout={layout}
              dividerKey={dividerKey}
              ceremonial={ceremonial}
              color="#ffffff"
              align={isModern ? "left" : "center"}
            />
          </div>
          <p
            className={cn(
              "animate__animated animate__fadeInUp mt-4 text-sm tracking-wide text-white/85",
              isMinimal ? "text-xs uppercase tracking-[0.25em]" : "",
            )}
            style={{ animationDelay: "0.4s", animationDuration: "1s" }}
          >
            {dateLabel}
          </p>
          {guestName ? (
            <div
              className="animate__animated animate__fadeInUp"
              style={{ animationDelay: "0.55s", animationDuration: "1s" }}
            >
              <GuestBox
                name={guestName}
                accent={accent}
                variant={ceremonial ? "bare" : "dark"}
              />
            </div>
          ) : null}
        </div>

        <div
          className={cn(
            "relative mt-6 flex flex-col gap-3",
            isModern ? "items-start" : "items-center",
          )}
        >
          {openButton()}
          <p className="text-[11px] text-white/55">
            {brand ?? "UndanganKita"}
          </p>
        </div>
      </div>
    </div>
  );

  const coverFramed = (
    <div
      className={cn(
        "fixed inset-y-0 left-1/2 z-50 w-full max-w-[480px] -translate-x-1/2 overflow-y-auto",
        coverOpeningClass,
      )}
      style={{ background: "var(--tpl-background)", color: "var(--tpl-text)" }}
    >
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        {coverImage ? (
          <>
            <div
              className="inv-kenburns absolute -inset-4 bg-cover bg-center"
              style={{ backgroundImage: `url(${coverImage})` }}
            />
            <div
              className="absolute inset-0"
              style={{
                background: `linear-gradient(180deg, rgba(0,0,0,${backgroundOverlay / 120}) 0%, rgba(0,0,0,${backgroundOverlay / 70}) 100%)`,
              }}
            />
          </>
        ) : null}
        {!isModern && !isMinimal ? (
          <MotifPattern
            motif={motifKey}
            color={accent}
            opacity={layout === "javanese" ? 0.24 : 0.16}
          />
        ) : null}
      </div>

      {ceremonial ? (
        <div
          aria-hidden
          className="pointer-events-none absolute inset-3 border"
          style={{ borderColor: `${accent}44` }}
        />
      ) : null}

      <div className="relative flex min-h-full items-center justify-center p-4 py-8">
        <div
          className="relative w-full max-w-[350px] overflow-hidden border-2 px-6 py-7 text-center shadow-2xl sm:px-7"
          style={{
            borderColor: accent,
            background: "color-mix(in srgb, var(--tpl-surface) 94%, transparent)",
            color: "var(--tpl-text)",
            backdropFilter: "blur(14px) saturate(1.1)",
            borderRadius:
              frameStyle === "square"
                ? 4
                : frameStyle === "rounded"
                  ? 28
                  : 36,
          }}
        >
          {ceremonial ? (
            <GununganOrnament
              color={`${accent}26`}
              className="pointer-events-none absolute inset-x-0 top-0 mx-auto h-[24rem] w-44"
            />
          ) : null}
          {layout === "royal" ? (
            <span
              aria-hidden
              className="pointer-events-none absolute inset-0 grid place-items-center font-display text-[8rem] leading-none opacity-[0.06]"
              style={{ color: accent }}
            >
              {monogram}
            </span>
          ) : null}
          {layout === "javanese" ? (
            <MotifSilhouette
              motif="siluet-joglo"
              color={`${accent}1f`}
              className="pointer-events-none absolute inset-x-0 bottom-0 mx-auto h-24 w-24"
            />
          ) : null}
          {showsOrnaments ? (
            <OrnamentFrame color={`${accent}cc`} size="size-10 sm:size-12" />
          ) : null}
          {layout === "royal" ? (
            <div
              aria-hidden
              className="pointer-events-none absolute inset-2 border"
              style={{ borderColor: `${accent}33` }}
            />
          ) : null}

          <div className="relative flex flex-col items-center">
            {!ceremonial ? (
              <div className="animate__animated animate__fadeInDown">
                {subtitleNode}
              </div>
            ) : null}
            <div
              className="animate__animated animate__zoomIn mt-6"
              style={{ animationDelay: "0.1s", animationDuration: "1s" }}
            >
              {ceremonial ? (
                <GununganOrnament
                  color={`${accent}d9`}
                  className="h-36 w-24"
                />
              ) : (
                <CoverPhotoFrame
                  src={coverPhoto}
                  title={title}
                  accent={accent}
                  frameStyle={frameStyle}
                  layout={layout}
                  monogram={monogram}
                />
              )}
            </div>
            <div
              className="animate__animated animate__fadeInUp"
              style={{ animationDelay: "0.28s", animationDuration: "1s" }}
            >
              <CoverNames
                title={title}
                accent={accent}
                layout={layout}
                dividerKey={dividerKey}
                ceremonial={ceremonial}
                color="var(--tpl-text)"
                align={isModern ? "left" : "center"}
                className={cn("mt-7", isModern ? "w-full" : "")}
              />
            </div>
            <p
              className={cn(
                "animate__animated animate__fadeInUp mt-4 text-sm tracking-wide opacity-80",
                isMinimal ? "text-xs uppercase tracking-[0.25em]" : "",
              )}
              style={{ animationDelay: "0.46s", animationDuration: "1s" }}
            >
              {dateLabel}
            </p>
            {guestName ? (
              <div
                className="animate__animated animate__fadeInUp"
                style={{ animationDelay: "0.6s", animationDuration: "1s" }}
              >
                <GuestBox
                  name={guestName}
                  accent={accent}
                  variant={ceremonial ? "bare" : "light"}
                />
              </div>
            ) : null}
            <div className="mt-7">{openButton()}</div>
            <p className="mt-4 text-[11px] opacity-55">
              {brand ?? "UndanganKita"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div
      className="relative isolate mx-auto min-h-svh w-full max-w-[480px]"
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
            {!isModern && !isMinimal ? (
              <MotifPattern
                motif={motifKey}
                color={accent}
                opacity={layout === "javanese" ? 0.1 : 0.06}
              />
            ) : null}
            {ceremonial ? (
              <GununganOrnament
                color={`${accent}18`}
                className="absolute top-0 left-1/2 h-[32rem] w-64 -translate-x-1/2"
              />
            ) : null}
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
            ) : !isMinimal ? (
              <div
                className="absolute inset-0"
                style={{
                  background: ceremonial
                    ? `radial-gradient(90% 55% at 12% 0%, color-mix(in srgb, ${primary} 28%, transparent) 0%, transparent 55%), radial-gradient(90% 55% at 90% 100%, rgba(95,22,12,0.55) 0%, transparent 62%), radial-gradient(70% 40% at 50% 50%, color-mix(in srgb, ${accent} 8%, transparent) 0%, transparent 72%)`
                    : `radial-gradient(90% 60% at 12% 0%, color-mix(in srgb, ${primary} 16%, transparent) 0%, transparent 55%), radial-gradient(85% 60% at 90% 100%, color-mix(in srgb, ${accent} 18%, transparent) 0%, transparent 60%)`,
                }}
              />
            ) : null}
            {!isMinimal ? (
              <>
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
              </>
            ) : null}
            {showsOrnaments ? (
              <>
                {PETALS.slice(0, isMinimal ? 0 : 8).map((petal, index) => (
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
                {!ceremonial
                  ? HEARTS.map((heart, index) => (
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
                    ))
                  : null}
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
              </>
            ) : null}
          </div>

          <ScrollProgress />

          {layout === "royal" ? (
            <div
              aria-hidden
              className="pointer-events-none fixed inset-y-0 left-1/2 z-20 w-full max-w-[480px] -translate-x-1/2"
            >
              <div
                className="absolute inset-2 border-2"
                style={{ borderColor: `${accent}99` }}
              />
              <div
                className="absolute inset-4 border"
                style={{ borderColor: `${accent}44` }}
              />
            </div>
          ) : null}

          <div
            className={cn(
              "anim-page inv-layout-" + layout,
              ceremonial ? "inv-ceremonial" : "",
              "mx-auto w-full max-w-[480px] px-4 pt-10 pb-28 sm:px-5",
              backgroundImage ? "inv-text-contrast-glow" : "",
            )}
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
            <div className="pointer-events-none fixed inset-y-0 left-1/2 z-50 w-full max-w-[480px] -translate-x-1/2">
              <button
                type="button"
                onClick={toggleMusic}
                className="pointer-events-auto absolute right-4 bottom-20 grid size-12 place-items-center rounded-full shadow-xl transition-transform hover:scale-110"
                style={{ background: accent, color: primary }}
                aria-label={playing ? "Jeda musik" : "Putar musik"}
              >
                {playing ? (
                  <Music2
                    className="anim-spin-slow size-5"
                    style={{ animationDuration: "4s" }}
                  />
                ) : (
                  <Play className="size-5" />
                )}
                {playing ? (
                  <span
                    className="anim-ring pointer-events-none absolute inset-0 rounded-full border"
                    style={{ borderColor: accent }}
                  />
                ) : null}
                {playing && ceremonial ? (
                  <span
                    className="anim-spin-slow pointer-events-none absolute -inset-1.5 rounded-full border border-dashed"
                    style={{ borderColor: `${accent}88` }}
                  />
                ) : null}
              </button>
            </div>
          ) : null}
        </>
      ) : null}

      {phase === "cover" || (phase === "opening" && ceremonial)
        ? coverStyle === "split"
          ? coverSplit
          : coverStyle === "framed"
            ? coverFramed
            : coverFull
        : null}

      {phase === "opening" && !ceremonial ? (
        <div className="fixed inset-y-0 left-1/2 z-[60] w-full max-w-[480px] -translate-x-1/2 overflow-hidden">
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
            {monogram}
          </div>
        </div>
      ) : null}
    </div>
  );
}
