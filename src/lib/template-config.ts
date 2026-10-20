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

export const ORNAMENT_KEYS = [
  "kawung",
  "mega-mendung",
  "parang",
  "gunungan",
  "siluet-joglo",
  "candi-bentar",
  "frangipani",
  "songket",
  "ulos",
  "marawa",
  "tongkonan",
  "tapis",
  "pintu-aceh",
  "peony-lampion",
  "daun-emas",
  "rose",
  "geometris-minimal",
] as const;
export type OrnamentKey = (typeof ORNAMENT_KEYS)[number];

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
  ornament?: OrnamentKey;
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
  ornament: "daun-emas",
  sections: [...SECTION_KEYS],
};

/**
 * Menentukan kunci ornamen dari field eksplisit `ornament`, atau menebaknya
 * dari teks `motif` lama supaya template lama tetap mendapat artwork yang pas.
 */
export function resolveOrnamentKey(
  ornament?: string | null,
  motif?: string | null,
): OrnamentKey {
  if (ornament && (ORNAMENT_KEYS as readonly string[]).includes(ornament)) {
    return ornament as OrnamentKey;
  }

  const text = (motif ?? "").toLowerCase();
  const rules: Array<[string[], OrnamentKey]> = [
    [["gunungan", "wayang"], "gunungan"],
    [["mega", "mendung"], "mega-mendung"],
    [["kawung"], "kawung"],
    [["parang"], "parang"],
    [["joglo"], "siluet-joglo"],
    [["candi", "bentar", "bali"], "candi-bentar"],
    [["frangipani", "kamboja"], "frangipani"],
    [["songket"], "songket"],
    [["ulos", "batak"], "ulos"],
    [["marawa", "minang"], "marawa"],
    [["tongkonan", "toraja"], "tongkonan"],
    [["tapis", "lampung"], "tapis"],
    [["aceh", "pintu"], "pintu-aceh"],
    [["peony", "lampion", "chinese", "tiongkok"], "peony-lampion"],
    [["rose", "kelopak", "floral"], "rose"],
    [["geometris", "minimal"], "geometris-minimal"],
    [["daun", "emas", "royal"], "daun-emas"],
  ];
  for (const [keywords, key] of rules) {
    if (keywords.some((keyword) => text.includes(keyword))) return key;
  }
  return "daun-emas";
}

export function frameRadiusClass(frameStyle: FrameStyle): string {
  if (frameStyle === "square") return "rounded-none";
  if (frameStyle === "arch") return "rounded-t-[999px] rounded-b-xl";
  return "rounded-[1.75rem]";
}

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
    ornament: resolveOrnamentKey(source.ornament, source.motif),
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
