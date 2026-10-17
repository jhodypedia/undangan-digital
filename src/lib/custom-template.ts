import type { TemplateConfig } from "@/lib/template-config";

export type CustomTemplateData = {
  couple: string;
  groom: string;
  groomFull: string;
  bride: string;
  brideFull: string;
  date: string;
  isoDate: string;
  quote: string;
  quoteSource: string;
  greeting: string;
  closing: string;
  coverPhoto: string;
  colors: TemplateConfig["colors"];
  events: {
    name: string;
    date: string;
    time: string;
    venue: string;
    address: string;
    mapsUrl?: string | null;
  }[];
  gallery: { imageUrl: string; caption?: string | null }[];
};

export const CUSTOM_TOKEN_LIST = [
  "{{couple}}",
  "{{groom}}",
  "{{groomFull}}",
  "{{bride}}",
  "{{brideFull}}",
  "{{date}}",
  "{{isoDate}}",
  "{{quote}}",
  "{{quoteSource}}",
  "{{greeting}}",
  "{{closing}}",
  "{{coverPhoto}}",
  "{{events}}",
  "{{gallery}}",
  "{{primary}}",
  "{{accent}}",
  "{{background}}",
  "{{surface}}",
  "{{text}}",
];

export function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export function sanitizeCustomHtml(input: string): string {
  return input
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/<iframe[\s\S]*?<\/iframe>/gi, "")
    .replace(/<link[^>]*>/gi, "")
    .replace(/\son\w+\s*=\s*"[^"]*"/gi, "")
    .replace(/\son\w+\s*=\s*'[^']*'/gi, "")
    .replace(/\son\w+\s*=\s*[^\s>]+/gi, "")
    .replace(/javascript:/gi, "");
}

export const CUSTOM_BASE_CSS = `
.cv-root {
  --primary: {{primary}};
  --accent: {{accent}};
  --background: {{background}};
  --surface: {{surface}};
  --text: {{text}};
  --tpl-primary: var(--primary);
  --tpl-accent: var(--accent);
  --tpl-background: var(--background);
  --tpl-surface: var(--surface);
  --tpl-text: var(--text);
  --cv-font-display: serif;
  --cv-font-body: inherit;
  --cv-frame: color-mix(in srgb, var(--accent) 85%, var(--text) 15%);
  color: var(--text);
  font-family: var(--cv-font-body), ui-sans-serif, system-ui, sans-serif;
  line-height: 1.7;
  position: relative;
}
.cv-root * { box-sizing: border-box; }
.cv-root img { max-width: 100%; display: block; }
.cv-root h1, .cv-root h2, .cv-root h3 {
  font-family: var(--cv-font-display), serif;
  font-weight: 500;
  line-height: 1.2;
}
.cv-section { padding: 3.25rem 1.25rem; }
.cv-section > * { max-width: 44rem; margin-left: auto; margin-right: auto; }
.cv-title {
  font-size: clamp(1.85rem, 4vw, 2.75rem);
  text-align: center;
  letter-spacing: 0.015em;
  margin: 0 0 1rem;
}
.cv-kicker {
  text-align: center;
  text-transform: uppercase;
  letter-spacing: 0.35em;
  font-size: 0.7rem;
  color: var(--accent);
  margin: 0 0 0.6rem;
}
.cv-divider {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  margin: 0.25rem 0 1.5rem;
}
.cv-divider::before,
.cv-divider::after {
  content: "";
  height: 1px;
  width: 64px;
  background: linear-gradient(90deg, transparent, var(--accent));
}
.cv-divider::after { background: linear-gradient(90deg, var(--accent), transparent); }
.cv-card,
.cv-plate {
  position: relative;
  background: linear-gradient(
    180deg,
    color-mix(in srgb, var(--surface) 82%, transparent),
    color-mix(in srgb, var(--surface) 62%, transparent)
  );
  backdrop-filter: blur(12px) saturate(1.1);
  border: 2px solid color-mix(in srgb, var(--accent) 50%, transparent);
  border-radius: 1.75rem;
  padding: 1.6rem 1.75rem;
  box-shadow:
    0 0 0 1px color-mix(in srgb, var(--accent) 20%, transparent),
    0 40px 80px -54px color-mix(in srgb, var(--text) 80%, transparent);
}
.cv-card::after,
.cv-plate::after {
  content: "";
  position: absolute;
  inset: 7px;
  border-radius: 1.15rem;
  border: 1px solid color-mix(in srgb, var(--accent) 22%, transparent);
  pointer-events: none;
}
.cv-card::before,
.cv-plate::before {
  content: "";
  position: absolute;
  inset: 15px;
  border-radius: 0.9rem;
  pointer-events: none;
  opacity: 0.9;
  background-image:
    linear-gradient(var(--cv-frame), var(--cv-frame)),
    linear-gradient(var(--cv-frame), var(--cv-frame)),
    linear-gradient(var(--cv-frame), var(--cv-frame)),
    linear-gradient(var(--cv-frame), var(--cv-frame)),
    linear-gradient(var(--cv-frame), var(--cv-frame)),
    linear-gradient(var(--cv-frame), var(--cv-frame)),
    linear-gradient(var(--cv-frame), var(--cv-frame)),
    linear-gradient(var(--cv-frame), var(--cv-frame));
  background-repeat: no-repeat;
  background-size:
    18px 2.5px, 2.5px 18px,
    18px 2.5px, 2.5px 18px,
    18px 2.5px, 2.5px 18px,
    18px 2.5px, 2.5px 18px;
  background-position:
    left top, left top,
    right top, right top,
    left bottom, left bottom,
    right bottom, right bottom;
}
.cv-soft {
  border-radius: 1.25rem;
  border: 1px solid color-mix(in srgb, var(--accent) 28%, transparent);
  background: color-mix(in srgb, var(--surface) 62%, transparent);
  backdrop-filter: blur(8px);
  padding: 1rem 1.1rem;
}
.cv-quote {
  font-family: var(--cv-font-display), serif;
  font-size: clamp(1.3rem, 3vw, 1.7rem);
  text-align: center;
  line-height: 1.65;
  margin: 0;
}
.cv-muted { opacity: 0.75; }
.cv-events {
  display: grid;
  gap: 1.1rem;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
}
.cv-event h3 { text-align: center; }
.cv-gallery {
  display: grid;
  gap: 0.6rem;
  grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
}
.cv-gallery img { width: 100%; height: 100%; object-fit: cover; border-radius: 1rem; aspect-ratio: 3 / 4; }
.cv-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  background: var(--accent);
  color: var(--primary);
  border-radius: 999px;
  padding: 0.6rem 1.3rem;
  font-size: 0.85rem;
  font-weight: 600;
  text-decoration: none;
}
@keyframes cv-float { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-8px); } }
@keyframes cv-fade-up { from { opacity: 0; transform: translateY(18px); } to { opacity: 1; transform: translateY(0); } }
.cv-reveal { animation: cv-fade-up 0.8s cubic-bezier(0.22,1,0.36,1) both; }
@media (prefers-reduced-motion: reduce) {
  .cv-reveal { animation: none; }
}
`;

function eventsHtml(data: CustomTemplateData): string {
  if (data.events.length === 0) return "";
  return `<div class="cv-events">${data.events
    .map(
      (event) => `<div class="cv-card cv-event">
  <h3 style="margin:.2rem 0 .6rem;font-size:1.3rem">${escapeHtml(event.name)}</h3>
  <div class="cv-divider" style="margin:.1rem 0 .9rem"></div>
  <p class="cv-muted" style="margin:.15rem 0;font-size:.9rem;text-align:center">${escapeHtml(event.date)}</p>
  <p class="cv-muted" style="margin:.15rem 0;font-size:.9rem;text-align:center">${escapeHtml(event.time)}</p>
  <p style="margin:.7rem 0 0;font-size:.9rem;text-align:center">${escapeHtml(event.venue)}${
    event.address ? `, ${escapeHtml(event.address)}` : ""
  }</p>
  ${
    event.mapsUrl
      ? `<p style="margin:1rem 0 0;text-align:center"><a class="cv-btn" href="${escapeHtml(event.mapsUrl)}">Lihat lokasi</a></p>`
      : ""
  }
</div>`,
    )
    .join("")}</div>`;
}

function galleryHtml(data: CustomTemplateData): string {
  if (data.gallery.length === 0) return "";
  return `<div class="cv-gallery">${data.gallery
    .map(
      (photo) =>
        `<figure style="margin:0"><img src="${escapeHtml(photo.imageUrl)}" alt="${escapeHtml(
          photo.caption ?? "Foto",
        )}" loading="lazy" /></figure>`,
    )
    .join("")}</div>`;
}

export function renderCustomTemplate(
  config: TemplateConfig,
  data: CustomTemplateData,
): { html: string; css: string } {
  const colors = { ...config.colors, ...data.colors };
  const rawHtml = config.customHtml ?? "";
  const rawCss = config.customCss ?? "";

  const tokenMap: Record<string, string> = {
    "{{couple}}": escapeHtml(data.couple),
    "{{groom}}": escapeHtml(data.groom),
    "{{groomFull}}": escapeHtml(data.groomFull),
    "{{bride}}": escapeHtml(data.bride),
    "{{brideFull}}": escapeHtml(data.brideFull),
    "{{date}}": escapeHtml(data.date),
    "{{isoDate}}": escapeHtml(data.isoDate),
    "{{quote}}": escapeHtml(data.quote),
    "{{quoteSource}}": escapeHtml(data.quoteSource),
    "{{greeting}}": escapeHtml(data.greeting),
    "{{closing}}": escapeHtml(data.closing),
    "{{coverPhoto}}": escapeHtml(data.coverPhoto),
    "{{events}}": eventsHtml({ ...data, colors }),
    "{{gallery}}": galleryHtml({ ...data, colors }),
    "{{primary}}": colors.primary,
    "{{accent}}": colors.accent,
    "{{background}}": colors.background,
    "{{surface}}": colors.surface,
    "{{text}}": colors.text,
  };

  const apply = (template: string) =>
    Object.entries(tokenMap).reduce(
      (acc, [token, value]) => acc.split(token).join(value),
      template,
    );

  const html = sanitizeCustomHtml(apply(rawHtml));
  const fontCss = `.cv-root{--cv-font-display:'${config.fontDisplay.replace(
    /'/g,
    "",
  )}',serif;--cv-font-body:'${config.fontBody.replace(
    /'/g,
    "",
  )}',ui-sans-serif,system-ui,sans-serif;}`;
  const css = fontCss + "\n" + apply(CUSTOM_BASE_CSS) + "\n" + apply(rawCss);

  return { html, css };
}
