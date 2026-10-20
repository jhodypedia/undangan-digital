"use client";

import Image from "next/image";

import type { ArtworkMeta } from "@/lib/template-artwork";
import { cn } from "@/lib/utils";

function splitCouple(title: string): [string, string] | null {
  const parts = title
    .split(/\s*&\s*|\s+dan\s+/i)
    .map((part) => part.trim())
    .filter(Boolean);
  return parts.length === 2 ? [parts[0], parts[1]] : null;
}

function frameRadius(shape: ArtworkMeta["frame"]["shape"]) {
  if (shape === "oval") return "50%";
  if (shape === "arch") {
    return "48% 48% 8px 8px / 34% 34% 2% 2%";
  }
  return "8px";
}

/**
 * Cover yang memakai artwork portrait sebagai panggung utama.
 *
 * Bingkai kosong pada artwork dipakai untuk foto sampul, sedangkan nama,
 * tanggal, dan tombol diletakkan di area yang memang disiapkan oleh artwork.
 * Semua posisi memakai persentase terhadap artwork, bukan viewport.
 */
export function ArtworkCover({
  meta,
  title,
  dateLabel,
  coverPhoto,
  coverImage,
  primary,
  accent,
  fontDisplay = "Playfair Display",
  fontScript,
  fontAccent,
  ceremonial = false,
  openingClass,
  bottom,
}: {
  meta: ArtworkMeta;
  title: string;
  dateLabel: string;
  coverPhoto?: string | null;
  coverImage?: string | null;
  primary: string;
  accent: string;
  fontDisplay?: string;
  fontScript?: string;
  fontAccent?: string;
  ceremonial?: boolean;
  openingClass?: string;
  bottom?: React.ReactNode;
}) {
  const { frame, content } = meta;
  const framePhoto = coverPhoto || coverImage;
  const hasPhoto = Boolean(meta.photo && framePhoto);
  const lightText = hasPhoto || content.panel === "dark";
  const ink = lightText ? "#ffffff" : content.ink;
  const contentAccent = content.accent || accent;
  const parts = splitCouple(title);
  const nameSize = content.nameSize ?? 5.6;
  const nameMax = content.nameMax ?? 2.2;

  return (
    <div
      className={cn(
        "fixed inset-y-0 left-1/2 z-50 w-full max-w-[480px] -translate-x-1/2 overflow-hidden",
        openingClass,
      )}
      style={{ background: ceremonial ? "#070605" : primary }}
      data-artwork={meta.code}
    >
      <div className="absolute inset-0 flex items-center justify-center">
        <div
          className="inv-zoom-out relative overflow-hidden"
          style={{
            width: `min(100%, calc(100dvh * ${meta.ratio}))`,
            aspectRatio: meta.aspect,
          }}
        >
          <Image
            src={meta.src}
            alt=""
            fill
            priority
            sizes="(max-width: 480px) 100vw, 480px"
            className="object-cover"
          />

          {hasPhoto && framePhoto ? (
            <div
              className="absolute overflow-hidden"
              style={{
                top: `${frame.top}%`,
                left: `${frame.left}%`,
                width: `${frame.width}%`,
                height: `${frame.height}%`,
                borderRadius: frameRadius(frame.shape),
              }}
            >
              <Image
                src={framePhoto}
                alt={title}
                fill
                sizes="(max-width: 480px) 40vw, 200px"
                unoptimized
                className="object-cover"
              />
              <div
                className="absolute inset-0"
                style={{
                  background:
                    "linear-gradient(180deg, rgba(0,0,0,0.18) 0%, rgba(0,0,0,0.34) 42%, rgba(0,0,0,0.72) 100%)",
                }}
              />
            </div>
          ) : null}

          <div
            className="absolute flex flex-col items-center justify-center text-center"
            style={{
              top: `${content.top}%`,
              left: `${content.left}%`,
              width: `${content.width}%`,
              height: `${content.height}%`,
              padding: content.panel ? "7% 6%" : 0,
              background:
                content.panel === "dark"
                  ? "rgba(8, 7, 6, 0.58)"
                  : content.panel === "cream"
                    ? "rgba(253, 246, 234, 0.84)"
                    : undefined,
              border: content.panel
                ? `1px solid ${contentAccent}66`
                : undefined,
              borderRadius: content.panel ? 18 : undefined,
              backdropFilter: content.panel ? "blur(10px)" : undefined,
              textShadow: lightText
                ? "0 2px 18px rgba(0,0,0,0.42)"
                : undefined,
            }}
          >
            {content.showLabel !== false ? (
              <p
                className="animate__animated animate__fadeInDown"
                style={{
                  color: contentAccent,
                  fontFamily:
                    content.labelScript && fontScript
                      ? `'${fontScript}', cursive`
                      : fontAccent
                        ? `'${fontAccent}', serif`
                        : undefined,
                  fontSize:
                    content.labelScript && fontScript
                      ? "clamp(0.8rem, 3.2vw, 1.2rem)"
                      : "clamp(0.52rem, 2.1vw, 0.82rem)",
                  letterSpacing:
                    content.labelScript && fontScript ? "0.02em" : "0.24em",
                  textTransform:
                    content.labelScript && fontScript ? "none" : "uppercase",
                  lineHeight: 1.1,
                  animationDelay: "0.16s",
                  animationDuration: "0.9s",
                }}
              >
                The Wedding Of
              </p>
            ) : null}

            <h1
              className="animate__animated animate__zoomIn mt-[0.35em] w-full text-balance"
              style={{
                color: ink,
                fontFamily: `'${fontDisplay}', serif`,
                fontSize: `clamp(1.05rem, ${nameSize}vw, ${nameMax}rem)`,
                lineHeight: 1.02,
                animationDelay: "0.28s",
                animationDuration: "1s",
              }}
            >
              {parts ? (
                <>
                  <span className="block">{parts[0]}</span>
                  <span
                    className="my-[0.12em] block"
                    style={{
                      color: contentAccent,
                      fontFamily: `'${fontDisplay}', serif`,
                      fontSize: "0.62em",
                      lineHeight: 0.9,
                    }}
                  >
                    &amp;
                  </span>
                  <span className="block">{parts[1]}</span>
                </>
              ) : (
                <span className="block">{title}</span>
              )}
            </h1>

            <span
              className="my-[0.65em] block h-px w-10"
              style={{ background: contentAccent, opacity: 0.7 }}
            />

            <p
              className="animate__animated animate__fadeInUp"
              style={{
                color: ink,
                fontFamily: fontAccent ? `'${fontAccent}', serif` : undefined,
                fontSize: "clamp(0.62rem, 2.5vw, 0.95rem)",
                letterSpacing: "0.1em",
                lineHeight: 1.35,
                opacity: 0.92,
                animationDelay: "0.46s",
                animationDuration: "0.9s",
              }}
            >
              {dateLabel}
            </p>
          </div>
        </div>
      </div>

      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-30">
        <div
          className="absolute inset-0"
          style={{
            background: `linear-gradient(180deg, transparent 0%, color-mix(in srgb, ${primary} 55%, transparent) 38%, color-mix(in srgb, ${primary} 92%, black) 100%)`,
          }}
        />
        <div className="relative flex flex-col items-center gap-3 px-6 pt-20 pb-7 text-center text-white">
          {bottom}
        </div>
      </div>
    </div>
  );
}
