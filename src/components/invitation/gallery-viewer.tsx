"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import { ZoomIn } from "lucide-react";

import { Reveal } from "@/components/invitation/reveal";

type Photo = { id: number; imageUrl: string; caption: string | null };

const AUTOPLAY_MS = 3800;

export function GalleryViewer({
  photos,
  layout = "grid",
  frameStyle = "rounded",
}: {
  photos: Photo[];
  layout?: "grid" | "album";
  frameStyle?: "rounded" | "square" | "arch";
}) {
  const [index, setIndex] = useState<number | null>(null);
  const [playing, setPlaying] = useState(true);

  const shape =
    frameStyle === "square"
      ? "rounded-none"
      : frameStyle === "arch"
        ? "rounded-t-[3rem] rounded-b-xl"
        : "rounded-[1rem]";
  const frameRadius =
    frameStyle === "square" ? 0 : frameStyle === "arch" ? "3rem 3rem 1rem 1rem" : undefined;

  const active = index === null ? null : photos[index];
  const total = photos.length;

  const next = useCallback(() => {
    if (index === null || total === 0) return;
    setIndex((index + 1) % total);
  }, [index, total]);

  const close = useCallback(() => {
    setIndex(null);
    setPlaying(false);
  }, []);

  useEffect(() => {
    if (index === null) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") close();
      if (event.key === "ArrowRight") next();
    };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [index, next, close]);

  useEffect(() => {
    if (!playing || index === null) return;
    const timer = window.setTimeout(() => next(), AUTOPLAY_MS);
    return () => window.clearTimeout(timer);
  }, [playing, index, next]);

  return (
    <>
      <div className="relative -mx-2">
        <div
          aria-hidden
          className="inv-gallery-fade inv-gallery-fade-left pointer-events-none absolute inset-y-0 left-0 z-10 w-10 bg-gradient-to-r from-[color:var(--tpl-surface)] to-transparent"
        />
        <div
          aria-hidden
          className="inv-gallery-fade inv-gallery-fade-right pointer-events-none absolute inset-y-0 right-0 z-10 w-10 bg-gradient-to-l from-[color:var(--tpl-surface)] to-transparent"
        />
        <div className="flex gap-3 overflow-x-auto px-2 pb-2 snap-x snap-mandatory scroll-smooth [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {photos.map((photo, position) => (
            <div
              key={photo.id}
              className={
                layout === "album"
                  ? "w-48 shrink-0 snap-start sm:w-56"
                  : "w-40 shrink-0 snap-start sm:w-44"
              }
            >
              <Reveal
                delay={(position % 6) * 70}
                className="h-full"
              >
                <button
                  type="button"
                  onClick={() => {
                    setPlaying(true);
                    setIndex(position);
              }}
              className={`inv-photo-frame inv-thumb inv-sweep group relative block ${
                layout === "album" ? "w-full" : "aspect-square size-full"
              }`}
              style={{ borderRadius: frameRadius }}
            >
              <span className={`relative block size-full overflow-hidden ${shape}`}>
                <Image
                  src={photo.imageUrl}
                  alt={photo.caption ?? "Foto"}
                  width={layout === "album" ? 600 : 400}
                  height={layout === "album" ? 800 : 400}
                  unoptimized
                  className={
                    layout === "album"
                      ? "h-auto w-full object-cover transition-transform duration-[900ms] ease-out group-hover:scale-110 group-hover:rotate-[0.6deg]"
                      : "aspect-square size-full object-cover transition-transform duration-[900ms] ease-out group-hover:scale-110 group-hover:rotate-[0.6deg]"
                  }
                />
                <span
                  className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
                  style={{
                    background:
                      "linear-gradient(180deg, transparent 45%, color-mix(in srgb, var(--tpl-primary) 88%, transparent) 100%)",
                  }}
                />
                <span className="pointer-events-none absolute top-2 right-2 grid size-8 translate-y-1 place-items-center rounded-full bg-black/35 text-white opacity-0 backdrop-blur transition-all duration-500 group-hover:translate-y-0 group-hover:opacity-100">
                  <ZoomIn className="size-3.5" />
                </span>
                {photo.caption ? (
                  <span className="pointer-events-none absolute inset-x-0 bottom-0 translate-y-2 p-3 text-left text-xs font-medium text-white opacity-0 transition-all duration-500 group-hover:translate-y-0 group-hover:opacity-100">
                    {photo.caption}
                  </span>
                ) : null}
                <span
                  className="pointer-events-none absolute inset-0 rounded-[inherit] opacity-0 transition-opacity duration-500 group-hover:opacity-100"
                  style={{
                    boxShadow:
                      "0 0 0 2px color-mix(in srgb, var(--tpl-accent) 80%, transparent)",
                  }}
                />
              </span>
            </button>
          </Reveal>
        </div>
        ))}
        </div>
      </div>
      <p
        className="inv-gallery-hint mt-3 flex items-center justify-center gap-1.5 text-[11px]"
        style={{ color: "var(--tpl-text)", opacity: 0.55 }}
      >
        <span className="inline-block animate-pulse">→</span> Geser untuk melihat lebih banyak foto
      </p>

      {active ? (
        <div
          className="inv-lb-backdrop fixed inset-0 z-50 flex items-center justify-center bg-black/95"
          onClick={close}
        >
          <Image
            key={index}
            src={active.imageUrl}
            alt={active.caption ?? "Foto"}
            width={1400}
            height={1000}
            unoptimized
            onClick={close}
            className="inv-lb-image max-h-[90vh] max-w-[94vw] rounded-lg object-contain shadow-2xl"
          />
        </div>
      ) : null}
    </>
  );
}
