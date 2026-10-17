"use client";

import { CalendarDays, Heart, MapPin, Music2, Quote } from "lucide-react";

import {
  renderCustomTemplate,
  type CustomTemplateData,
} from "@/lib/custom-template";
import type { TemplateConfig } from "@/lib/template-config";
import { cn } from "@/lib/utils";

const SAMPLE_DATA: Omit<CustomTemplateData, "colors"> = {
  couple: "Arya & Aisyah",
  groom: "Arya",
  groomFull: "Arya Wijaya",
  bride: "Aisyah",
  brideFull: "Aisyah Putri",
  date: "Sabtu, 12 Desember 2026",
  isoDate: "2026-12-12T09:00:00.000Z",
  quote: "Dan di antara tanda-tanda kekuasaan-Nya, Dia menciptakan pasangan.",
  quoteSource: "Ar-Rum: 21",
  greeting: "Dengan memohon rahmat Allah, kami mengundang Anda.",
  closing: "Merupakan kebahagiaan bagi kami apabila Anda berkenan hadir.",
  coverPhoto: "https://picsum.photos/seed/pvcover/400/400",
  events: [
    {
      name: "Akad Nikah",
      date: "Sabtu, 12 Desember 2026",
      time: "09.00 - 11.00 WIB",
      venue: "Masjid Agung",
      address: "Jl. Merdeka No. 1",
      mapsUrl: "#",
    },
  ],
  gallery: [
    { imageUrl: "https://picsum.photos/seed/pv1/400/520", caption: "Momen 1" },
    { imageUrl: "https://picsum.photos/seed/pv2/400/520", caption: "Momen 2" },
    { imageUrl: "https://picsum.photos/seed/pv3/400/520", caption: "Momen 3" },
  ],
};

const SECTION_LABELS: Record<string, string> = {
  quote: "Kutipan",
  couple: "Mempelai",
  countdown: "Hitung hari",
  events: "Acara",
  story: "Cerita",
  gallery: "Galeri",
  album: "Album",
  gift: "Hadiah",
  rsvp: "RSVP",
  wishes: "Ucapan",
};

export function TemplatePreview({
  config,
  className,
}: {
  config: TemplateConfig;
  className?: string;
}) {
  const { colors } = config;
  const frameClass =
    config.frameStyle === "square"
      ? "rounded-md"
      : config.frameStyle === "arch"
        ? "rounded-t-[999px] rounded-b-md"
        : "rounded-xl";

  if (config.customHtml?.trim()) {
    const { html, css } = renderCustomTemplate(config, {
      ...SAMPLE_DATA,
      colors,
    });
    const srcdoc = `<!doctype html><html><head><meta charset="utf-8"/><meta name="viewport" content="width=device-width, initial-scale=1"/><style>body{margin:0;font-family:ui-sans-serif,system-ui,sans-serif;background:${colors.background}}</style><style>${css}</style></head><body>${html}</body></html>`;

    return (
      <div className={cn("space-y-3", className)}>
        <div className="mx-auto w-full max-w-[280px] overflow-hidden rounded-[1.75rem] border-4 border-black/80 bg-white shadow-xl">
          <iframe
            title="Pratinjau tampilan undangan"
            srcDoc={srcdoc}
            sandbox=""
            className="h-[440px] w-full"
          />
        </div>
        <div className="flex flex-wrap justify-center gap-1.5">
          <Chip color={colors.primary}>{config.layout}</Chip>
          <Chip color={colors.accent}>HTML kustom</Chip>
          <Chip color={colors.text}>{config.motif}</Chip>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("space-y-3", className)}>
      <div
        className="mx-auto w-full max-w-[260px] overflow-hidden rounded-[2rem] border-4 border-black/80 shadow-xl"
        style={{ background: colors.background, color: colors.text }}
      >
        <div
          className="relative h-56"
          style={{
            background: `linear-gradient(180deg, ${colors.primary} 0%, ${colors.primary}dd 60%, ${colors.primary} 100%)`,
          }}
        >
          <div className="absolute inset-3 rounded-[1.4rem] border" style={{ borderColor: `${colors.accent}66` }} />
          <div className="relative flex h-full flex-col items-center justify-center px-4 text-center">
            <span className="text-[8px] uppercase tracking-[0.35em]" style={{ color: colors.accent }}>
              The Wedding Of
            </span>
            <span
              className="mt-2 text-2xl text-white"
              style={{ fontFamily: `'${config.fontDisplay}', serif` }}
            >
              Arya &amp; Aisyah
            </span>
            <span className="mt-2 h-px w-10" style={{ background: colors.accent }} />
            <span className="mt-2 text-[9px] text-white/80">Sabtu, 12 Des 2026</span>
            <span
              className="mt-4 inline-flex items-center gap-1 rounded-full px-3 py-1 text-[9px] font-medium"
              style={{ background: colors.accent, color: colors.primary }}
            >
              <Music2 className="size-2.5" /> Buka Undangan
            </span>
          </div>
        </div>

        <div className="space-y-3 p-3">
          <div className="flex gap-2">
            {[0, 1].map((index) => (
              <div key={index} className="flex-1 text-center">
                <div
                  className={`mx-auto size-12 ${frameClass}`}
                  style={{ background: `color-mix(in srgb, ${colors.accent} 22%, ${colors.surface})` }}
                />
                <p className="mt-1 text-[9px]" style={{ fontFamily: `'${config.fontDisplay}', serif` }}>
                  {index === 0 ? "Aisyah" : "Arya"}
                </p>
              </div>
            ))}
          </div>

          <div
            className="flex items-center justify-between rounded-lg px-2 py-1.5 text-[8px]"
            style={{ background: colors.surface, border: `1px solid color-mix(in srgb, ${colors.text} 12%, transparent)` }}
          >
            {["Hari", "Jam", "Menit"].map((item) => (
              <span key={item} className="flex flex-col items-center">
                <span style={{ color: colors.accent }}>12</span>
                <span className="opacity-60">{item}</span>
              </span>
            ))}
          </div>

          <div
            className="rounded-lg p-2 text-[8px]"
            style={{ background: colors.surface, border: `1px solid color-mix(in srgb, ${colors.text} 12%, transparent)` }}
          >
            <p className="flex items-center gap-1 font-medium">
              <MapPin className="size-2.5" style={{ color: colors.accent }} /> Akad Nikah
            </p>
            <p className="mt-0.5 flex items-center gap-1 opacity-70">
              <CalendarDays className="size-2.5" /> 12 Des 2026 · 09.00 WIB
            </p>
          </div>

          <div className="grid grid-cols-3 gap-1">
            {[0, 1, 2].map((index) => (
              <div
                key={index}
                className="aspect-square rounded-md"
                style={{ background: `color-mix(in srgb, ${colors.primary} 25%, ${colors.surface})` }}
              />
            ))}
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-1.5">
        <Chip color={colors.primary}>{config.layout}</Chip>
        <Chip color={colors.accent}>{config.motif}</Chip>
        <Chip color={colors.text}>{config.coverStyle} · {config.frameStyle}</Chip>
      </div>

      <div className="flex flex-wrap gap-1">
        {config.sections.map((section) => (
          <span
            key={section}
            className="inline-flex items-center gap-1 rounded-full bg-muted px-2 py-0.5 text-[10px] text-muted-foreground"
          >
            {section === "wishes" ? <Heart className="size-2.5" /> : null}
            {section === "quote" ? <Quote className="size-2.5" /> : null}
            {SECTION_LABELS[section] ?? section}
          </span>
        ))}
      </div>
    </div>
  );
}

function Chip({ children, color }: { children: React.ReactNode; color: string }) {
  return (
    <span
      className="inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px]"
      style={{ borderColor: `${color}55`, color }}
    >
      <span className="size-2 rounded-full" style={{ background: color }} />
      {children}
    </span>
  );
}
