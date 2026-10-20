"use client";

import Image from "next/image";
import { CalendarDays, Heart, MapPin, Music2, Quote } from "lucide-react";

import {
  CoverArch,
  GununganOrnament,
  MotifPattern,
  MotifSilhouette,
  OrnamentFrame,
  SectionRule,
} from "@/components/invitation/ornaments";
import {
  renderCustomTemplate,
  type CustomTemplateData,
} from "@/lib/custom-template";
import { getTemplateArtwork, type ArtworkMeta } from "@/lib/template-artwork";
import {
  frameRadiusClass,
  resolveOrnamentKey,
  templateFontStylesheet,
  type TemplateConfig,
} from "@/lib/template-config";
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

function MiniPhoto({
  frameStyle,
  accent,
  monogram,
  className,
}: {
  frameStyle: TemplateConfig["frameStyle"];
  accent: string;
  monogram: string;
  className?: string;
}) {
  const shape =
    frameStyle === "square"
      ? "rounded-none"
      : frameStyle === "arch"
        ? "rounded-t-[999px] rounded-b-md"
        : "rounded-[0.9rem]";
  const size = frameStyle === "arch" ? "h-16 w-12" : "size-12";
  return (
    <div className={cn("relative", size, className)}>
      <div
        className={cn(
          "grid h-full w-full place-items-center overflow-hidden border-2",
          shape,
        )}
        style={{
          borderColor: accent,
          background: `color-mix(in srgb, ${accent} 22%, transparent)`,
        }}
      >
        <span className="font-display text-sm" style={{ color: accent }}>
          {monogram}
        </span>
      </div>
      {frameStyle === "arch" ? (
        <CoverArch frameStyle="arch" color={accent} secondaryColor={accent} />
      ) : null}
    </div>
  );
}

function Names({
  color,
  accent,
  config,
  className,
}: {
  color: string;
  accent: string;
  config: TemplateConfig;
  className?: string;
}) {
  const modern = config.layout === "modern";
  const minimal = config.layout === "minimal";
  const ornamentKey = resolveOrnamentKey(config.ornament, config.motif);
  const dividerKey = config.layout === "javanese" ? "parang" : ornamentKey;
  return (
    <div
      className={cn(
        "flex flex-col",
        modern ? "items-start text-left" : "items-center text-center",
        className,
      )}
    >
      <span
        className="text-[7px] uppercase tracking-[0.35em]"
        style={{ color: accent }}
      >
        The Wedding Of
      </span>
      <span
        className={cn(
          modern ? "font-body font-semibold tracking-tight" : "font-display",
          minimal ? "text-xs uppercase tracking-[0.24em]" : "mt-1 text-lg",
        )}
        style={{ color, fontFamily: `'${config.fontDisplay}', serif` }}
      >
        Arya &amp; Aisyah
      </span>
      <SectionRule
        layout={config.layout}
        motif={dividerKey}
        color={accent}
        className={
          minimal
            ? "mt-1.5 mx-auto"
            : modern
              ? "mt-1.5"
              : "mt-1.5 w-full max-w-[9rem] scale-90"
        }
      />
    </div>
  );
}

function ArtworkThumb({
  meta,
  config,
  colors,
}: {
  meta: ArtworkMeta;
  config: TemplateConfig;
  colors: TemplateConfig["colors"];
}) {
  return (
    <div className="relative h-64 overflow-hidden">
      <Image
        src={meta.src}
        alt=""
        fill
        sizes="260px"
        className="object-cover"
        style={{ objectPosition: "center 32%" }}
      />
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(180deg, rgba(0,0,0,0.12) 0%, rgba(0,0,0,0.08) 38%, rgba(0,0,0,0.82) 100%)",
        }}
      />
      <div className="absolute inset-x-0 bottom-0 flex flex-col items-center px-4 pb-4 text-center">
        <p
          className="text-[7px] uppercase tracking-[0.35em]"
          style={{ color: colors.accent }}
        >
          Undangan Pernikahan
        </p>
        <p
          className="mt-1 max-w-full font-display text-lg leading-tight text-white"
          style={{ fontFamily: `'${config.fontDisplay}', serif` }}
        >
          Arya &amp; Aisyah
        </p>
        <p className="mt-1 text-[8px] text-white/75">12 Desember 2026</p>
        <span
          className="mt-2 inline-flex items-center gap-1 rounded-full px-3 py-1 text-[9px] font-medium"
          style={{ background: colors.accent, color: colors.primary }}
        >
          <Music2 className="size-2.5" /> Buka Undangan
        </span>
      </div>
    </div>
  );
}

export function TemplatePreview({
  config,
  artworkCode,
  className,
}: {
  config: TemplateConfig;
  artworkCode?: string | null;
  className?: string;
}) {
  if (!config?.colors) return null;
  const { colors } = config;
  const artworkMeta = getTemplateArtwork(artworkCode);
  const ornamentKey = resolveOrnamentKey(config.ornament, config.motif);
  const dividerKey = config.layout === "javanese" ? "parang" : ornamentKey;
  const fontStylesheet = templateFontStylesheet(config);
  const shape = frameRadiusClass(config.frameStyle);
  const frameRadius =
    config.frameStyle === "square"
      ? 0
      : config.frameStyle === "arch"
        ? "3rem 3rem 0.75rem 0.75rem"
        : undefined;
  const modern = config.layout === "modern";
  const minimal = config.layout === "minimal";
  const ceremonial = ornamentKey === "gunungan";
  const ornate = ["classic", "royal", "floral", "javanese"].includes(
    config.layout,
  );

  if (config.customHtml?.trim()) {
    const { html, css } = renderCustomTemplate(config, {
      ...SAMPLE_DATA,
      colors,
    });
    const fontHref = fontStylesheet.replace(/&/g, "&amp;");
    const srcdoc = `<!doctype html><html><head><meta charset="utf-8"/><meta name="viewport" content="width=device-width, initial-scale=1"/><link rel="stylesheet" href="${fontHref}"/><style>body{margin:0;font-family:'${config.fontBody}',ui-sans-serif,system-ui,sans-serif;background:${colors.background}}</style><style>${css}</style></head><body>${html}</body></html>`;

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

  const coverContent = (
    <>
      <div className="relative flex flex-1 flex-col items-center justify-center px-4 text-center">
        {config.layout === "royal" ? (
          <span
            aria-hidden
            className="pointer-events-none absolute inset-0 grid place-items-center font-display text-6xl opacity-[0.07]"
            style={{ color: colors.accent }}
          >
            AA
          </span>
        ) : null}
        {ceremonial ? (
          <GununganOrnament
            color={`${colors.accent}d9`}
            className="h-16 w-11"
          />
        ) : (
          <MiniPhoto
            frameStyle={config.frameStyle}
            accent={colors.accent}
            monogram="AA"
          />
        )}
        <Names
          color="#ffffff"
          accent={colors.accent}
          config={config}
          className="mt-3"
        />
        <span className="mt-2 text-[8px] text-white/80">12 Des 2026</span>
      </div>
      <span
        className={cn(
          "mx-auto mb-4 inline-flex items-center gap-1 px-3 py-1 text-[9px] font-medium",
          ceremonial ? "rounded-none border-y-2" : "rounded-full",
        )}
        style={
          ceremonial
            ? {
                background: "transparent",
                color: colors.accent,
                borderColor: colors.accent,
              }
            : { background: colors.accent, color: colors.primary }
        }
      >
        <Music2 className="size-2.5" /> Buka Undangan
      </span>
    </>
  );

  return (
    <div
      className={cn("space-y-3", className)}
      style={{
        fontFamily: `'${config.fontBody}', ui-sans-serif, system-ui, sans-serif`,
      }}
    >
      <link rel="stylesheet" href={fontStylesheet} />
      <div
        className="mx-auto w-full max-w-[260px] overflow-hidden rounded-[2rem] border-4 border-black/80 shadow-xl"
        style={{ background: colors.background, color: colors.text }}
      >
        {artworkMeta ? (
          <ArtworkThumb meta={artworkMeta} config={config} colors={colors} />
        ) : config.coverStyle === "split" ? (
          <div className="flex h-64 flex-col">
            <div
              className="relative h-28 shrink-0 overflow-hidden"
              style={{
                background: `radial-gradient(120% 100% at 50% 0%, ${colors.primary} 0%, color-mix(in srgb, ${colors.primary} 60%, #000 40%) 100%)`,
              }}
            >
              {ornate ? (
                <MotifPattern
                  motif={ornamentKey}
                  color={colors.accent}
                  opacity={0.18}
                />
              ) : null}
              <div className="absolute inset-0 bg-black/25" />
              {config.layout === "javanese" ? (
                <MotifSilhouette
                  motif="siluet-joglo"
                  color={`${colors.accent}66`}
                  className="absolute right-3 bottom-1 h-8 w-8"
                />
              ) : null}
              <p
                className="relative pt-4 text-center text-[7px] uppercase tracking-[0.35em]"
                style={{ color: colors.accent }}
              >
                Undangan Pernikahan
              </p>
            </div>
            <div
              className="relative flex flex-1 flex-col justify-center px-4 py-3"
              style={{ background: colors.primary }}
            >
              {config.layout === "royal" ? (
                <>
                  <div
                    aria-hidden
                    className="pointer-events-none absolute inset-1.5 rounded border"
                    style={{ borderColor: `${colors.accent}55` }}
                  />
                  <span
                    aria-hidden
                    className="pointer-events-none absolute inset-0 grid place-items-center font-display text-5xl leading-none opacity-[0.06]"
                    style={{ color: colors.accent }}
                  >
                    AA
                  </span>
                </>
              ) : null}
              {ceremonial ? (
                <GununganOrnament
                  color={`${colors.accent}30`}
                  className="pointer-events-none absolute top-1/2 left-1/2 h-32 w-20 -translate-x-1/2 -translate-y-1/2"
                />
              ) : null}
              <Names
                color="#ffffff"
                accent={colors.accent}
                config={config}
                className={modern ? "items-start" : "items-center"}
              />
              <span className="mt-2 text-[8px] text-white/80">
                12 Desember 2026
              </span>
              <span
                className="mt-3 inline-flex w-fit items-center gap-1 rounded-full px-3 py-1 text-[9px] font-medium"
                style={{ background: colors.accent, color: colors.primary }}
              >
                <Music2 className="size-2.5" /> Buka Undangan
              </span>
            </div>
          </div>
        ) : config.coverStyle === "framed" ? (
          <div
            className="relative flex h-64 items-center justify-center p-3"
            style={{
              background: `color-mix(in srgb, ${colors.background} 88%, ${colors.primary} 12%)`,
            }}
          >
            <MotifPattern
              motif={ornamentKey}
              color={colors.accent}
              opacity={0.16}
            />
            <div
              className="relative flex h-full w-full flex-col items-center justify-center overflow-hidden border-2 px-3 py-3"
              style={{
                borderColor: colors.accent,
                background: `color-mix(in srgb, ${colors.surface} 92%, transparent)`,
                borderRadius:
                  config.frameStyle === "square"
                    ? 4
                    : config.frameStyle === "rounded"
                      ? 20
                      : 26,
              }}
            >
              {ornamentKey === "gunungan" ? (
                <GununganOrnament
                  color={`${colors.accent}26`}
                  className="pointer-events-none absolute inset-x-0 top-0 mx-auto h-40 w-24"
                />
              ) : null}
              {config.layout === "royal" ? (
                <span
                  aria-hidden
                  className="pointer-events-none absolute inset-0 grid place-items-center font-display text-6xl leading-none opacity-[0.06]"
                  style={{ color: colors.accent }}
                >
                  AA
                </span>
              ) : null}
              {config.layout === "javanese" ? (
                <MotifSilhouette
                  motif="siluet-joglo"
                  color={`${colors.accent}22`}
                  className="pointer-events-none absolute inset-x-0 bottom-0 mx-auto h-16 w-16"
                />
              ) : null}
              {ornate ? (
                <OrnamentFrame color={`${colors.accent}cc`} size="size-6" />
              ) : null}
              <p
                className="text-[7px] uppercase tracking-[0.35em]"
                style={{ color: colors.accent }}
              >
                Undangan Pernikahan
              </p>
              {ceremonial ? (
                <GununganOrnament
                  color={`${colors.accent}d9`}
                  className="mt-3 h-16 w-11"
                />
              ) : (
                <MiniPhoto
                  frameStyle={config.frameStyle}
                  accent={colors.accent}
                  monogram="AA"
                  className="mt-3"
                />
              )}
              <Names
                color={colors.text}
                accent={colors.accent}
                config={config}
                className="mt-3"
              />
              <span className="mt-1 text-[8px] opacity-70">12 Des 2026</span>
              <span
                className={cn(
                  "mt-3 inline-flex items-center gap-1 px-3 py-1 text-[9px] font-medium",
                  ceremonial ? "rounded-none border-y-2" : "rounded-full",
                )}
                style={
                  ceremonial
                    ? {
                        background: "transparent",
                        color: colors.accent,
                        borderColor: colors.accent,
                      }
                    : { background: colors.accent, color: colors.primary }
                }
              >
                <Music2 className="size-2.5" /> Buka Undangan
              </span>
            </div>
          </div>
        ) : (
          <div
            className="relative flex h-64 flex-col justify-between py-4"
            style={{
              background: ceremonial
                ? `radial-gradient(120% 90% at 50% 8%, #24180f 0%, ${colors.primary} 48%, #070605 100%), radial-gradient(55% 35% at 50% 105%, #5f160c 0%, transparent 72%)`
                : `linear-gradient(180deg, ${colors.primary} 0%, ${colors.primary}dd 60%, ${colors.primary} 100%)`,
            }}
          >
            {ornate ? (
              <MotifPattern
                motif={ornamentKey}
                color={colors.accent}
                opacity={0.2}
              />
            ) : null}
            <div className="pointer-events-none absolute inset-0 bg-black/10" />
            {minimal ? (
              <div
                aria-hidden
                className="pointer-events-none absolute inset-3 border"
                style={{ borderColor: `${colors.accent}44` }}
              />
            ) : modern ? (
              <div
                aria-hidden
                className="pointer-events-none absolute inset-y-4 left-3 w-0.5"
                style={{ background: colors.accent }}
              />
            ) : (
              <>
                <div
                  aria-hidden
                  className="pointer-events-none absolute inset-2 border"
                  style={{ borderColor: `${colors.accent}55` }}
                />
                <div
                  aria-hidden
                  className="pointer-events-none absolute inset-3 border"
                  style={{ borderColor: `${colors.accent}22` }}
                />
                <OrnamentFrame
                  color={`${colors.accent}cc`}
                  className="inset-0"
                  size="size-7"
                />
              </>
            )}
            {config.layout === "javanese" ? (
              <MotifSilhouette
                motif="siluet-joglo"
                color={`${colors.accent}55`}
                className="absolute right-3 bottom-4 h-8 w-8"
              />
            ) : null}
            <p
              className="relative text-center text-[7px] uppercase tracking-[0.35em]"
              style={{ color: colors.accent }}
            >
              Undangan Pernikahan
            </p>
            {coverContent}
          </div>
        )}

        <div className="space-y-3 p-3">
          <div className={cn("px-1", modern ? "text-left" : "text-center")}>
            <p
              className="text-[6px] uppercase tracking-[0.3em]"
              style={{ color: colors.accent }}
            >
              {minimal ? "Undangan" : "Dengan memohon rahmat Allah"}
            </p>
            <SectionRule
              layout={config.layout}
              motif={dividerKey}
              color={colors.accent}
              className={minimal ? "my-1 mx-auto" : "my-1"}
            />
            <p
              className={cn(
                "font-display",
                minimal
                  ? "text-[8px] uppercase tracking-[0.24em]"
                  : "text-[10px]",
              )}
              style={{
                fontFamily: `'${config.fontDisplay}', serif`,
                color: colors.text,
              }}
            >
              Mempelai
            </p>
          </div>
          <div className="flex gap-2">
            {[0, 1].map((index) => (
              <div
                key={index}
                className={cn(
                  "flex-1",
                  modern ? "text-left" : "text-center",
                )}
              >
                <div
                  className={`mx-auto size-12 overflow-hidden ${shape}`}
                  style={{
                    background: `color-mix(in srgb, ${colors.accent} 22%, ${colors.surface})`,
                    borderRadius: frameRadius,
                  }}
                />
                <p
                  className="mt-1 text-[9px]"
                  style={{ fontFamily: `'${config.fontDisplay}', serif` }}
                >
                  {index === 0 ? "Aisyah" : "Arya"}
                </p>
              </div>
            ))}
          </div>

          <SectionRule
            layout={config.layout}
            motif={dividerKey}
            color={colors.accent}
            className="scale-90"
          />

          <div
            className={cn(
              "flex items-center justify-between px-2 py-1.5 text-[8px]",
              minimal ? "border-y" : "rounded-lg",
            )}
            style={{
              background: minimal ? "transparent" : colors.surface,
              border: minimal
                ? `1px solid color-mix(in srgb, ${colors.text} 14%, transparent)`
                : `1px solid color-mix(in srgb, ${colors.text} 12%, transparent)`,
              borderTopWidth: minimal ? 1 : undefined,
              borderBottomWidth: minimal ? 1 : undefined,
              borderLeftWidth: minimal ? 0 : undefined,
              borderRightWidth: minimal ? 0 : undefined,
            }}
          >
            {["Hari", "Jam", "Menit"].map((item) => (
              <span key={item} className="flex flex-col items-center">
                <span style={{ color: colors.accent }}>12</span>
                <span className="opacity-60">{item}</span>
              </span>
            ))}
          </div>

          <div
            className={cn(
              "p-2 text-[8px]",
              minimal ? "border-y" : "rounded-lg",
            )}
            style={{
              background: minimal ? "transparent" : colors.surface,
              border: minimal
                ? `1px solid color-mix(in srgb, ${colors.text} 14%, transparent)`
                : `1px solid color-mix(in srgb, ${colors.text} 12%, transparent)`,
              borderLeftWidth: minimal ? 0 : undefined,
              borderRightWidth: minimal ? 0 : undefined,
            }}
          >
            <p className="flex items-center gap-1 font-medium">
              <MapPin className="size-2.5" style={{ color: colors.accent }} />{" "}
              Akad Nikah
            </p>
            <p className="mt-0.5 flex items-center gap-1 opacity-70">
              <CalendarDays className="size-2.5" /> 12 Des 2026 · 09.00 WIB
            </p>
          </div>

          <div className="grid grid-cols-3 gap-1">
            {[0, 1, 2].map((index) => (
              <div
                key={index}
                className={cn("aspect-square overflow-hidden", shape)}
                style={{
                  background: `color-mix(in srgb, ${colors.primary} 25%, ${colors.surface})`,
                  borderRadius: frameRadius,
                }}
              />
            ))}
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-1.5">
        <Chip color={colors.primary}>{config.layout}</Chip>
        <Chip color={colors.accent}>
          {config.coverStyle} · {config.frameStyle}
        </Chip>
        <Chip color={colors.text}>{ornamentKey}</Chip>
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
