import { SITE_SETTINGS_KEYS } from "@/lib/constants";
import { getSettings } from "@/lib/settings";

export const AI_MAINTENANCE_MESSAGE =
  "Fitur AI sedang dalam pemeliharaan. Silakan coba lagi nanti.";
import {
  normalizeTemplateConfig,
  type TemplateConfig,
} from "@/lib/template-config";

export type GeneratedTemplate = {
  name: string;
  description: string;
  config: TemplateConfig;
  source: "ai" | "fallback";
  prompt: string;
};

const SYSTEM_PROMPT = `Kamu adalah desainer undangan digital Indonesia. Dari deskripsi pengguna, hasilkan SATU objek JSON valid tanpa penjelasan dengan bentuk:
{
  "name": "nama template singkat",
  "description": "deskripsi 1 kalimat",
  "config": {
    "layout": "classic|modern|minimal|floral|royal|javanese",
    "coverStyle": "full|split|framed",
    "frameStyle": "rounded|square|arch",
    "fontDisplay": "nama font Google Fonts",
    "fontBody": "nama font Google Fonts",
    "colors": { "primary": "#hex", "accent": "#hex", "background": "#hex", "surface": "#hex", "text": "#hex" },
    "motif": "deskripsi ornamen singkat",
    "sections": ["quote","couple","countdown","events","story","gallery","album","gift","rsvp","wishes"],
    "customHtml": "WAJIB: HTML lengkap tampilan undangan publik (lihat aturan di bawah)",
    "customCss": "CSS tambahan untuk customHtml, boleh memakai token warna"
  }
}
ATURAN customHtml (tampilan halaman undangan publik):
- Hasilkan struktur HTML rapi dan indah memakai kelas .cv-root pembungkus sudah disediakan; gunakan <section class="cv-section">, <h1|h2 class="cv-title">, <p class="cv-kicker">, <div class="cv-card">, <div class="cv-soft">, <div class="cv-divider"></div>, <p class="cv-quote">, <span class="cv-muted">, dan <a class="cv-btn">.
- Gaya visual WAJIB memakai sistem "bingkai" bersama: panel galeri/INFO memakai .cv-card (sudah berupa bingkai garis ganda otomatis — JANGAN mengubah border-radius/background secara manual agar seragam dengan template lain), item kecil memakai .cv-soft, dan pemisah bagian memakai .cv-divider. Hindari kartu rounded generik atau bayangan berbeda-beda.
- Gunakan token berikut agar terisi otomatis dari data undangan: {{couple}} {{groom}} {{groomFull}} {{bride}} {{brideFull}} {{date}} {{isoDate}} {{quote}} {{quoteSource}} {{greeting}} {{closing}} {{coverPhoto}} {{events}} {{gallery}} {{primary}} {{accent}} {{background}} {{surface}} {{text}}.
- WAJIB memuat: cover pembuka (nama pasangan + tanggal), bagian mempelai, {{events}}, {{gallery}}, dan penutup dengan {{closing}}. Boleh menambah bagian lain.
- JANGAN memakai <script>, <style> di dalam customHtml, iframe, atau gambar eksternal selain {{gallery}}. Jangan memakai atribut on* atau javascript:.
- Gunakan warna lewat var(--primary)/var(--accent) atau token {{primary}}/{{accent}} agar selaras dengan palet.
- Desain harus responsif (mobile-first), memakai gradient/ornamen CSS sederhana, dan elegan.
- Gunakan animasi halus dengan kelas .cv-reveal atau @keyframes pada customCss.
- JANGAN pernah menyebut "AI", "kecerdasan buatan", "generated", atau proses pembuatan otomatis di mana pun (name, description, customHtml, maupun customCss). Beri nama template yang natural seperti nama desain undangan biasa.
Pastikan kontras teks tinggi dan palet selaras.`;


type Palette = {
  keywords: string[];
  colors: TemplateConfig["colors"];
  motif: string;
  layout: TemplateConfig["layout"];
};

const PALETTES: Palette[] = [
  {
    keywords: ["jawa", "javanese", "batik", "solo", "yogya", "jogja"],
    colors: {
      primary: "#3b2d18",
      accent: "#b98a3c",
      background: "#f6efe2",
      surface: "#fffdf7",
      text: "#2a2114",
    },
    motif: "batik parang dan garis emas",
    layout: "javanese",
  },
  {
    keywords: ["islam", "muslim", "arab", "emas", "masjid"],
    colors: {
      primary: "#0b3d2e",
      accent: "#d4af37",
      background: "#f3f7f2",
      surface: "#ffffff",
      text: "#122019",
    },
    motif: "geometri arabesque",
    layout: "royal",
  },
  {
    keywords: ["bunga", "floral", "rose", "pink", "romantis"],
    colors: {
      primary: "#6d2b45",
      accent: "#d98ba3",
      background: "#fdf3f4",
      surface: "#ffffff",
      text: "#3c1f2a",
    },
    motif: "karangan bunga dan daun",
    layout: "floral",
  },
  {
    keywords: ["minimalis", "modern", "bersih", "putih", "scandinavia"],
    colors: {
      primary: "#1f2933",
      accent: "#9aa5b1",
      background: "#f8fafc",
      surface: "#ffffff",
      text: "#111827",
    },
    motif: "garis tipis dan ruang lapang",
    layout: "minimal",
  },
  {
    keywords: ["biru", "laut", "pantai", "ocean", "santai"],
    colors: {
      primary: "#0f3d5c",
      accent: "#4aa3c7",
      background: "#eef6fa",
      surface: "#ffffff",
      text: "#0f2433",
    },
    motif: "gelombang dan refleksi air",
    layout: "modern",
  },
  {
    keywords: ["hijau", "emerald", "daun", "tropis"],
    colors: {
      primary: "#0b3d2e",
      accent: "#c9a24b",
      background: "#f2f7f3",
      surface: "#ffffff",
      text: "#122019",
    },
    motif: "daun tropis dan emas",
    layout: "classic",
  },
];

function titleCase(value: string): string {
  return value
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 4)
    .map((word) => word[0]?.toUpperCase() + word.slice(1))
    .join(" ");
}

export function fallbackTemplate(prompt: string): GeneratedTemplate {
  const lower = prompt.toLowerCase();
  const palette =
    PALETTES.find((item) =>
      item.keywords.some((keyword) => lower.includes(keyword)),
    ) ?? PALETTES[2];

  const name = titleCase(prompt) || "Template Baru";

  return {
    name: name.slice(0, 40),
    description: `Template ${palette.layout} dengan motif ${palette.motif}.`,
    config: normalizeTemplateConfig({
      layout: palette.layout,
      colors: palette.colors,
      motif: palette.motif,
      notes: `Dihasilkan otomatis dari: ${prompt}`,
    }),
    source: "fallback",
    prompt,
  };
}

export async function isAiConfigured(): Promise<boolean> {
  const settings = await getSettings();
  const enabled = settings[SITE_SETTINGS_KEYS.aiEnabled] === "1";
  const apiKey = settings[SITE_SETTINGS_KEYS.aiApiKey];
  const provider = settings[SITE_SETTINGS_KEYS.aiProvider];
  return Boolean(enabled && apiKey && provider && provider !== "none");
}

export async function generateTemplate(
  prompt: string,
): Promise<GeneratedTemplate> {
  const settings = await getSettings();
  const enabled = settings[SITE_SETTINGS_KEYS.aiEnabled] === "1";
  const apiKey = settings[SITE_SETTINGS_KEYS.aiApiKey];
  const provider = settings[SITE_SETTINGS_KEYS.aiProvider];
  const baseUrl = settings[SITE_SETTINGS_KEYS.aiBaseUrl] || "https://api.openai.com/v1";
  const model = settings[SITE_SETTINGS_KEYS.aiModel] || "gpt-4o-mini";

  if (!enabled || !apiKey || provider === "none") {
    return fallbackTemplate(prompt);
  }

  const buildBody = (withFormat: boolean) =>
    JSON.stringify({
      model,
      temperature: 0.8,
      ...(withFormat ? { response_format: { type: "json_object" } } : {}),
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: prompt },
      ],
    });

  try {
    let response = await fetch(`${baseUrl.replace(/\/$/, "")}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: buildBody(true),
    });

    if (!response.ok && response.status === 400) {
      // Retry without response_format for providers that don't support it.
      response = await fetch(`${baseUrl.replace(/\/$/, "")}/chat/completions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: buildBody(false),
      });
    }

    if (!response.ok) {
      console.error("AI template HTTP error:", response.status, await response.text().catch(() => ""));
      return fallbackTemplate(prompt);
    }

    const data = (await response.json()) as {
      choices?: { message?: { content?: string } }[];
    };
    const content = data.choices?.[0]?.message?.content;
    if (!content) return fallbackTemplate(prompt);

    // Be tolerant of providers that wrap JSON in markdown fences.
    const cleaned = content
      .trim()
      .replace(/^```(?:json)?\s*/i, "")
      .replace(/\s*```$/i, "")
      .trim();
    let parsed: { name?: string; description?: string; config?: Partial<TemplateConfig> };
    try {
      parsed = JSON.parse(cleaned) as {
        name?: string;
        description?: string;
        config?: Partial<TemplateConfig>;
      };
    } catch (error) {
      console.error("AI template JSON parse failed:", error, content.slice(0, 500));
      return fallbackTemplate(prompt);
    }

    return {
      name: parsed.name?.slice(0, 60) || titleCase(prompt) || "Template AI",
      description:
        parsed.description?.slice(0, 200) ||
        `Template AI dari: ${prompt}`,
      config: normalizeTemplateConfig(parsed.config ?? (parsed as Partial<TemplateConfig>)),
      source: "ai",
      prompt,
    };
  } catch (error) {
    console.error("AI template generation failed:", error);
    return fallbackTemplate(prompt);
  }
}

export async function generateImage(
  prompt: string,
): Promise<
  { ok: true; buffer: Buffer; mime: string } | { ok: false; error: string }
> {
  const settings = await getSettings();
  const enabled = settings[SITE_SETTINGS_KEYS.aiEnabled] === "1";
  const apiKey = settings[SITE_SETTINGS_KEYS.aiApiKey];
  const provider = settings[SITE_SETTINGS_KEYS.aiProvider];
  const baseUrl = settings[SITE_SETTINGS_KEYS.aiBaseUrl] || "https://api.openai.com/v1";
  const model = settings[SITE_SETTINGS_KEYS.aiImageModel] || "gpt-image-1";

  if (!enabled || !apiKey || provider === "none") {
    return { ok: false, error: AI_MAINTENANCE_MESSAGE };
  }

  try {
    const response = await fetch(
      `${baseUrl.replace(/\/$/, "")}/images/generations`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({ model, prompt, n: 1 }),
      },
    );

    if (!response.ok) {
      return {
        ok: false,
        error:
          "Gagal membuat gambar dari AI. Pastikan model gambar didukung, atau gunakan foto sendiri.",
      };
    }

    const data = (await response.json()) as {
      data?: { b64_json?: string; url?: string }[];
    };
    const item = data.data?.[0];

    if (item?.b64_json) {
      return { ok: true, buffer: Buffer.from(item.b64_json, "base64"), mime: "image/png" };
    }

    if (item?.url) {
      const image = await fetch(item.url);
      if (!image.ok) {
        return { ok: false, error: "Gagal mengunduh gambar hasil AI." };
      }
      const mime =
        image.headers.get("content-type")?.split(";")[0] ?? "image/png";
      return { ok: true, buffer: Buffer.from(await image.arrayBuffer()), mime };
    }

    return { ok: false, error: "Respons AI tidak berisi gambar." };
  } catch {
    return { ok: false, error: "Terjadi kesalahan saat menghubungi layanan AI." };
  }
}

export function configToCssVars(config: TemplateConfig): Record<string, string> {
  return {
    "--tpl-primary": config.colors.primary,
    "--tpl-accent": config.colors.accent,
    "--tpl-background": config.colors.background,
    "--tpl-surface": config.colors.surface,
    "--tpl-text": config.colors.text,
  };
}
