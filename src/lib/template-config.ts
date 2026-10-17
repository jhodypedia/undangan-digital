export const TEMPLATE_LAYOUTS = [
  "classic",
  "modern",
  "minimal",
  "floral",
  "royal",
  "javanese",
] as const;
export type TemplateLayout = (typeof TEMPLATE_LAYOUTS)[number];

export const COVER_STYLES = ["full", "split", "framed"] as const;
export type CoverStyle = (typeof COVER_STYLES)[number];

export const FRAME_STYLES = ["rounded", "square", "arch"] as const;
export type FrameStyle = (typeof FRAME_STYLES)[number];

export const SECTION_KEYS = [
  "quote",
  "couple",
  "countdown",
  "events",
  "story",
  "gallery",
  "album",
  "gift",
  "rsvp",
  "wishes",
] as const;
export type SectionKey = (typeof SECTION_KEYS)[number];

export type TemplateConfig = {
  layout: TemplateLayout;
  coverStyle: CoverStyle;
  frameStyle: FrameStyle;
  fontDisplay: string;
  fontBody: string;
  colors: {
    primary: string;
    accent: string;
    background: string;
    surface: string;
    text: string;
  };
  motif: string;
  sections: SectionKey[];
  customHtml?: string;
  customCss?: string;
  notes?: string;
};

export const DEFAULT_TEMPLATE_CONFIG: TemplateConfig = {
  layout: "classic",
  coverStyle: "full",
  frameStyle: "rounded",
  fontDisplay: "Fraunces",
  fontBody: "Plus Jakarta Sans",
  colors: {
    primary: "#0b3d2e",
    accent: "#c9a24b",
    background: "#f7f3ea",
    surface: "#ffffff",
    text: "#17241d",
  },
  motif: "daun dan garis emas",
  sections: [...SECTION_KEYS],
};

export function normalizeTemplateConfig(
  input: Partial<TemplateConfig> | null | undefined,
): TemplateConfig {
  const source = input ?? {};
  const colors = { ...DEFAULT_TEMPLATE_CONFIG.colors, ...(source.colors ?? {}) };
  return {
    layout: source.layout ?? DEFAULT_TEMPLATE_CONFIG.layout,
    coverStyle: source.coverStyle ?? DEFAULT_TEMPLATE_CONFIG.coverStyle,
    frameStyle: source.frameStyle ?? DEFAULT_TEMPLATE_CONFIG.frameStyle,
    fontDisplay:
      source.fontDisplay ?? DEFAULT_TEMPLATE_CONFIG.fontDisplay,
    fontBody: source.fontBody ?? DEFAULT_TEMPLATE_CONFIG.fontBody,
    colors,
    motif: source.motif ?? DEFAULT_TEMPLATE_CONFIG.motif,
    sections:
      Array.isArray(source.sections) && source.sections.length > 0
        ? source.sections.filter((section): section is SectionKey =>
            (SECTION_KEYS as readonly string[]).includes(section),
          )
        : [...DEFAULT_TEMPLATE_CONFIG.sections],
    customHtml: source.customHtml?.trim() || undefined,
    customCss: source.customCss?.trim() || undefined,
    notes: source.notes,
  };
}
