"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import {
  ChevronLeft,
  ChevronRight,
  Images,
  Pause,
  Play,
  X,
  ZoomIn,
} from "lucide-react";

import { Reveal } from "@/components/invitation/reveal";

type Photo = { id: number; imageUrl: string; caption: string | null };

const AUTOPLAY_MS = 3800;

export function GalleryViewer({
  photos,
  layout = "grid",
}: {
  photos: Photo[];
  layout?: "grid" | "album";
}) {
  const [index, setIndex] = useState<number | null>(null);
  const [dir, setDir] = useState<"in" | "next" | "prev">("in");
  const [zoomed, setZoomed] = useState(false);
  const [playing, setPlaying] = useState(false);
  const touchStart = useRef<number | null>(null);
  const thumbsRef = useRef<HTMLDivElement | null>(null);

  const active = index === null ? null : photos[index];
  const total = photos.length;

  const go = useCallback(
    (next: number, direction: "next" | "prev") => {
      if (total === 0) return;
      const wrapped = (next + total) % total;
      setDir(direction);
      setZoomed(false);
      setIndex(wrapped);
    },
    [total],
  );

  const next = useCallback(() => {
    if (index === null) return;
    go(index + 1, "next");
  }, [index, go]);

  const prev = useCallback(() => {
    if (index === null) return;
    go(index - 1, "prev");
  }, [index, go]);

  const close = useCallback(() => {
    setIndex(null);
    setPlaying(false);
    setZoomed(false);
  }, []);

  useEffect(() => {
    if (index === null) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") close();
      if (event.key === "ArrowRight") next();
      if (event.key === "ArrowLeft") prev();
    };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [index, next, prev, close]);

  useEffect(() => {
    if (!playing || index === null || zoomed) return;
    const timer = window.setTimeout(() => next(), AUTOPLAY_MS);
    return () => window.clearTimeout(timer);
  }, [playing, index, zoomed, next]);

  useEffect(() => {
    if (index === null || !thumbsRef.current) return;
    const node = thumbsRef.current.children[index] as HTMLElement | undefined;
    node?.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
  }, [index]);

  const slideClass =
    dir === "next" ? "inv-slide-next" : dir === "prev" ? "inv-slide-prev" : "inv-lb-image";

  return (
    <>
      <div
        className={
          layout === "album"
            ? "inv-masonry"
            : "grid grid-cols-2 gap-3 sm:grid-cols-3"
        }
      >
        {photos.map((photo, position) => (
          <Reveal
            key={photo.id}
            delay={(position % 6) * 70}
            className={layout === "album" ? "" : "h-full"}
          >
            <button
              type="button"
              onClick={() => {
                setDir("in");
                setZoomed(false);
                setIndex(position);
              }}
              className={`inv-photo-frame inv-thumb inv-sweep group relative block ${
                layout === "album" ? "w-full" : "aspect-square size-full"
              }`}
            >
              <span className="relative block size-full overflow-hidden rounded-[1rem]">
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
                  className="pointer-events-none absolute inset-0 rounded-[1rem] opacity-0 transition-opacity duration-500 group-hover:opacity-100"
                  style={{
                    boxShadow:
                      "0 0 0 2px color-mix(in srgb, var(--tpl-accent) 80%, transparent)",
                  }}
                />
              </span>
            </button>
          </Reveal>
        ))}
      </div>

      {active ? (
        <div
          className="inv-lb-backdrop fixed inset-0 z-50 flex flex-col bg-black/95 backdrop-blur-sm"
          onClick={close}
          onTouchStart={(event) => {
            touchStart.current = event.touches[0]?.clientX ?? null;
          }}
          onTouchEnd={(event) => {
            if (touchStart.current === null) return;
            const delta =
              (event.changedTouches[0]?.clientX ?? 0) - touchStart.current;
            if (Math.abs(delta) > 50) {
              if (delta < 0) next();
              else prev();
            }
            touchStart.current = null;
          }}
        >
          <div className="flex items-center justify-between gap-3 px-4 py-3 text-white/80">
            <span className="inline-flex items-center gap-2 text-sm">
              <Images className="size-4" />
              <span className="tabular-nums">
                {index! + 1}
                <span className="text-white/40"> / {total}</span>
              </span>
            </span>
            <div className="flex items-center gap-2">
              {total > 1 ? (
                <button
                  type="button"
                  className="grid size-10 place-items-center rounded-full bg-white/10 transition-colors hover:bg-white/20 hover:text-white"
                  onClick={(event) => {
                    event.stopPropagation();
                    setPlaying((value) => !value);
                  }}
                  aria-label={playing ? "Jeda slideshow" : "Putar slideshow"}
                >
                  {playing ? (
                    <Pause className="size-4" />
                  ) : (
                    <Play className="size-4" />
                  )}
                </button>
              ) : null}
              <button
                type="button"
                className="grid size-10 place-items-center rounded-full bg-white/10 transition-colors hover:bg-white/20 hover:text-white"
                onClick={(event) => {
                  event.stopPropagation();
                  close();
                }}
                aria-label="Tutup"
              >
                <X className="size-5" />
              </button>
            </div>
          </div>

          <div className="relative flex flex-1 items-center justify-center overflow-hidden px-3">
            {total > 1 ? (
              <button
                type="button"
                className="absolute left-2 z-10 grid size-11 place-items-center rounded-full bg-white/10 text-white/80 transition-all hover:scale-110 hover:bg-white/20 hover:text-white"
                onClick={(event) => {
                  event.stopPropagation();
                  prev();
                }}
                aria-label="Sebelumnya"
              >
                <ChevronLeft className="size-6" />
              </button>
            ) : null}

            <div
              key={`${index}-${dir}`}
              className={`${slideClass} transform-gpu`}
              onClick={(event) => event.stopPropagation()}
            >
              <div
                className="rounded-[1.6rem] border-2 p-2 shadow-2xl"
                style={{
                  borderColor:
                    "color-mix(in srgb, var(--tpl-accent) 55%, transparent)",
                  background: "var(--tpl-surface)",
                }}
              >
                <Image
                  src={active.imageUrl}
                  alt={active.caption ?? "Foto"}
                  width={1400}
                  height={1000}
                  unoptimized
                  onClick={() => setZoomed((value) => !value)}
                  className={`max-h-[70vh] w-auto rounded-[1.1rem] object-contain transition-transform duration-500 ${
                    zoomed
                      ? "scale-[1.6] cursor-zoom-out"
                      : "inv-kenburns cursor-zoom-in"
                  }`}
                />
              </div>
            </div>

            {total > 1 ? (
              <button
                type="button"
                className="absolute right-2 z-10 grid size-11 place-items-center rounded-full bg-white/10 text-white/80 transition-all hover:scale-110 hover:bg-white/20 hover:text-white"
                onClick={(event) => {
                  event.stopPropagation();
                  next();
                }}
                aria-label="Berikutnya"
              >
                <ChevronRight className="size-6" />
              </button>
            ) : null}
          </div>

          {active.caption ? (
            <p
              key={`cap-${index}`}
              className="inv-fade-up px-6 text-center text-sm text-white/80"
            >
              {active.caption}
            </p>
          ) : null}

          {total > 1 ? (
            <div className="mx-6 mt-3 h-0.5 overflow-hidden rounded-full bg-white/15">
              <div
                className="h-full rounded-full transition-all duration-500 ease-out"
                style={{
                  width: `${((index! + 1) / total) * 100}%`,
                  background:
                    "linear-gradient(90deg, color-mix(in srgb, var(--tpl-accent) 60%, transparent), var(--tpl-accent))",
                }}
              />
            </div>
          ) : null}

          {total > 1 ? (
            <div
              ref={thumbsRef}
              className="flex gap-2 overflow-x-auto px-4 py-4"
              onClick={(event) => event.stopPropagation()}
            >
              {photos.map((photo, position) => (
                <button
                  key={photo.id}
                  type="button"
                  onClick={() =>
                    go(position, position > (index ?? 0) ? "next" : "prev")
                  }
                  className="relative size-14 shrink-0 overflow-hidden rounded-lg transition-all duration-300 hover:scale-105"
                  style={{
                    opacity: position === index ? 1 : 0.4,
                    transform: position === index ? "scale(1.08)" : undefined,
                    boxShadow:
                      position === index
                        ? "0 0 0 2px color-mix(in srgb, var(--tpl-accent) 90%, transparent)"
                        : "none",
                  }}
                  aria-label={`Foto ${position + 1}`}
                >
                  <Image
                    src={photo.imageUrl}
                    alt=""
                    width={120}
                    height={120}
                    unoptimized
                    className="size-full object-cover"
                  />
                </button>
              ))}
            </div>
          ) : (
            <div className="py-4" />
          )}
        </div>
      ) : null}
    </>
  );
}
