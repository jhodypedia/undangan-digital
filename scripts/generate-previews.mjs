#!/usr/bin/env node
/**
 * Generator artwork preview ORIGINAL untuk template undangan.
 *
 * Menghasilkan satu file SVG cadangan per template seed di
 * `public/previews/<code>.svg`. Preview utama yang dipakai aplikasi adalah
 * JPG kurasi di `public/previews/<code>.jpg`.
 *
 * Komposisi cover undangan portrait (600x800, rasio 3:4):
 * latar warna primer tema + pola motif SVG yang digambar prosedural,
 * bingkai arch emas, siluet khas (joglo/tongkonan/candi bentar/gunungan),
 * monogram, dan nama tema.
 *
 * Semua artwork digambar dari bentuk geometris di file ini — tidak ada aset
 * eksternal dan tidak ada gambar yang diunduh/disalin dari situs mana pun.
 *
 * Data tema di bawah ini mencerminkan `src/db/seed.ts` (SEED_TEMPLATES).
 * Bila menambah/mengubah tema di seed, sesuaikan tabel ini lalu jalankan:
 *   node scripts/generate-previews.mjs
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const OUT_DIR = join(dirname(fileURLToPath(import.meta.url)), "..", "public", "previews");

/** @type {Array<{code:string,name:string,motif:string,ornament:string,primary:string,accent:string,background:string}>} */
const THEMES = [
  { code: "elegant-rose", name: "Elegant Rose", motif: "kelopak rose dan garis tipis", ornament: "rose", primary: "#3f1d2e", accent: "#c48b9f", background: "#fdf6f8" },
  { code: "royal-emerald", name: "Royal Emerald", motif: "daun dan garis emas", ornament: "daun-emas", primary: "#0b3d2e", accent: "#d4af37", background: "#f7f3ea" },
  { code: "midnight-slate", name: "Midnight Slate", motif: "geometris minimal", ornament: "geometris-minimal", primary: "#0f172a", accent: "#38bdf8", background: "#0b1120" },
  { code: "jawa-biru", name: "Jawa Biru Modern", motif: "mega-mendung", ornament: "mega-mendung", primary: "#16295e", accent: "#c9a24b", background: "#eef2fb" },
  { code: "jawa-merah", name: "Jawa Merah Klasik", motif: "parang", ornament: "parang", primary: "#7f1d1d", accent: "#d4af37", background: "#fdf3ec" },
  { code: "jawa-hitam", name: "Art Jawa Hitam", motif: "gunungan dan parang", ornament: "gunungan", primary: "#17130c", accent: "#c9a24b", background: "#0b0a08" },
  { code: "art-jawa", name: "Art Jawa Coklat", motif: "kawung", ornament: "kawung", primary: "#4a2f1b", accent: "#b98a44", background: "#f7efe3" },
  { code: "bali", name: "Art Bali", motif: "candi-bentar dan frangipani", ornament: "candi-bentar", primary: "#7c2d12", accent: "#e0a526", background: "#fdf6ea" },
  { code: "palembang", name: "Art Palembang Songket", motif: "songket", ornament: "songket", primary: "#6d0f1b", accent: "#d4af37", background: "#fbf1e8" },
  { code: "banjar", name: "Art Banjar", motif: "songket", ornament: "songket", primary: "#065f46", accent: "#f59e0b", background: "#eefaf3" },
  { code: "batak", name: "Art Batak Ulos", motif: "ulos", ornament: "ulos", primary: "#991b1b", accent: "#171717", background: "#fdf6ec" },
  { code: "batak-karo", name: "Batak Karo", motif: "ulos", ornament: "ulos", primary: "#b91c1c", accent: "#facc15", background: "#fdf6ec" },
  { code: "mandailing", name: "Art Mandailing", motif: "ulos", ornament: "ulos", primary: "#78350f", accent: "#d4af37", background: "#f9f1e3" },
  { code: "chinese", name: "Art Chinese", motif: "peony-lampion", ornament: "peony-lampion", primary: "#b91c1c", accent: "#f5c542", background: "#fff7e6" },
  { code: "minang", name: "Art Minang Marawa", motif: "marawa", ornament: "marawa", primary: "#7f1d1d", accent: "#eab308", background: "#fdf8ec" },
  { code: "toraja", name: "Art Toraja", motif: "tongkonan", ornament: "tongkonan", primary: "#451a03", accent: "#dc2626", background: "#f8efe2" },
  { code: "melayu", name: "Art Melayu", motif: "songket", ornament: "songket", primary: "#166534", accent: "#facc15", background: "#f2f9ee" },
  { code: "lampung", name: "Art Lampung Tapis", motif: "tapis", ornament: "tapis", primary: "#7c2d12", accent: "#d4af37", background: "#faf1e6" },
  { code: "sunda", name: "Art Sunda Maroon", motif: "kawung", ornament: "kawung", primary: "#881337", accent: "#c9a24b", background: "#fdf2f4" },
  { code: "bugis", name: "Art Bugis", motif: "songket", ornament: "songket", primary: "#991b1b", accent: "#d4af37", background: "#fbf3e4" },
  { code: "aceh", name: "Art Aceh", motif: "pintu-aceh", ornament: "pintu-aceh", primary: "#14532d", accent: "#d4af37", background: "#f0f7ee" },
];

const esc = (text) =>
  text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

/**
 * Ubin pola 64x64 per motif, digambar dengan garis `color`.
 * Bentuk-bentuk geometris sederhana, digambar khusus untuk generator ini.
 */
function motifTile(ornament, color) {
  const s = `stroke="${color}" stroke-width="2" fill="none" stroke-linecap="round"`;
  switch (ornament) {
    case "kawung":
      return `<g ${s}><ellipse cx="32" cy="13" rx="12" ry="8"/><ellipse cx="32" cy="51" rx="12" ry="8"/><ellipse cx="13" cy="32" rx="8" ry="12"/><ellipse cx="51" cy="32" rx="8" ry="12"/><circle cx="32" cy="32" r="2.4" fill="${color}" stroke="none"/></g>`;
    case "mega-mendung":
      return `<g ${s}><path d="M-4 44c8 0 8-12 16-12s8 12 16 12 8-12 16-12 8 12 16 12 8-12 16-12"/><path d="M-4 58c8 0 8-12 16-12s8 12 16 12 8-12 16-12 8 12 16 12 8-12 16-12" stroke-opacity=".55"/><path d="M12 22c-1-6 7-9 11-4 3 4-1 9-6 8" stroke-opacity=".8"/><path d="M44 12c-1-6 7-9 11-4 3 4-1 9-6 8" stroke-opacity=".8"/></g>`;
    case "parang":
      return `<g ${s}><path d="M-10 74C6 56 22 54 34 38S58 10 74 0" stroke-width="6"/><path d="M-10 42C6 24 22 22 34 6" stroke-width="2.4" stroke-opacity=".7"/><path d="M30 74C46 56 62 54 74 38" stroke-width="2.4" stroke-opacity=".7"/><path d="M9 59c6-2 10-8 8-14" stroke-width="1.8"/><path d="M45 29c6-2 10-8 8-14" stroke-width="1.8"/></g>`;
    case "gunungan":
      return `<g ${s}><path d="M32 5C44 19 55 30 55 45 55 56 45 61 32 61 19 61 9 56 9 45 9 30 20 19 32 5Z"/><path d="M32 19v33" stroke-opacity=".75"/><path d="M32 30c-8-6-15-3-17 3 6 5 13 4 17-3Zm0 0c8-6 15-3 17 3-6 5-13 4-17-3Z" stroke-opacity=".75"/><path d="M25 54h14" stroke-opacity=".7"/></g>`;
    case "siluet-joglo":
      return `<g ${s}><path d="M32 5 59 27H5Z"/><path d="M13 27 5 39h54L51 27"/><path d="M9 39v19M55 39v19M25 39v19M39 39v19" stroke-opacity=".6"/><path d="M4 58h56" stroke-width="2.4"/></g>`;
    case "candi-bentar":
      return `<g ${s}><path d="M5 57V31l8-8 8 8v26M43 57V31l8-8 8 8v26"/><path d="M1 57h62" stroke-width="2.4"/><path d="M21 57V37l11-8 11 8v20" stroke-opacity=".5"/><g transform="translate(32 44)"><ellipse cx="0" cy="-4" rx="2.2" ry="4.2"/><ellipse cx="0" cy="-4" rx="2.2" ry="4.2" transform="rotate(72)"/><ellipse cx="0" cy="-4" rx="2.2" ry="4.2" transform="rotate(144)"/><ellipse cx="0" cy="-4" rx="2.2" ry="4.2" transform="rotate(216)"/><ellipse cx="0" cy="-4" rx="2.2" ry="4.2" transform="rotate(288)"/><circle r="1.4" fill="${color}" stroke="none"/></g></g>`;
    case "frangipani":
      return `<g ${s}><g transform="translate(32 28)"><ellipse cx="0" cy="-9" rx="5" ry="9"/><ellipse cx="0" cy="-9" rx="5" ry="9" transform="rotate(72)"/><ellipse cx="0" cy="-9" rx="5" ry="9" transform="rotate(144)"/><ellipse cx="0" cy="-9" rx="5" ry="9" transform="rotate(216)"/><ellipse cx="0" cy="-9" rx="5" ry="9" transform="rotate(288)"/><circle r="2.6" fill="${color}" stroke="none"/></g><path d="M10 56c8-6 18-6 26 0" stroke-opacity=".5"/><path d="M28 56c8-6 18-6 26 0" stroke-opacity=".3"/></g>`;
    case "songket":
      return `<g ${s}><path d="M0 15 16 0l16 15L48 0l16 15"/><path d="M0 49l16-16 16 16 16-16 16 16"/><path d="M17 0v64M47 0v64" stroke-opacity=".35"/><path d="M32 9l8 23-8 23-8-23Z" stroke-opacity=".85"/><circle cx="32" cy="32" r="2.2" fill="${color}" stroke="none"/></g>`;
    case "ulos":
      return `<g ${s}><path d="M0 10h64M0 54h64" stroke-width="4"/><path d="M-4 24l10 8-10 8M12 24l10 8-10 8M28 24l10 8-10 8M44 24l10 8-10 8M60 24l10 8-10 8"/><path d="M0 39h64" stroke-opacity=".5"/><path d="M8 16v8M24 16v8M40 16v8M56 16v8" stroke-opacity=".7"/></g>`;
    case "marawa":
      return `<g><path d="M0 26 16 10l16 16Z" fill="${color}" fill-opacity=".45"/><path d="M32 26 48 10l16 16Z" fill="${color}" fill-opacity=".8"/><path d="M-16 54 0 38l16 16Z" fill="${color}" fill-opacity=".8"/><path d="M16 54l16-16 16 16Z" fill="${color}" fill-opacity=".45"/><path d="M48 54l16-16 16 16Z" fill="${color}" fill-opacity=".45"/></g>`;
    case "tongkonan":
      return `<g ${s}><path d="M4 42C14 18 50 18 60 42 50 36 14 36 4 42Z"/><path d="M15 29 22 9M49 29 42 9M22 9h20" stroke-opacity=".8"/><path d="M6 48h52" stroke-opacity=".5"/><path d="M21 41v13M43 41v13" stroke-opacity=".6"/></g>`;
    case "tapis":
      return `<g ${s}><path d="M0 14 8 6l8 8 8-8 8 8 8-8 8 8 8-8 8 8"/><path d="M0 50l8-8 8 8 8-8 8 8 8-8 8 8 8-8 8 8"/><path d="M32 24l12 12-12 12-12-12Z" stroke-opacity=".85"/><path d="M0 32h11M53 32h11" stroke-opacity=".5"/></g>`;
    case "pintu-aceh":
      return `<g ${s}><path d="M12 56V30c0-9 9-16 20-16s20 7 20 16v26"/><path d="M20 56V33c0-6 5-11 12-11s12 5 12 11v23" stroke-opacity=".6"/><path d="M32 21v35" stroke-opacity=".4"/><path d="M0 56h64" stroke-width="2.4"/><circle cx="32" cy="35" r="1.8" fill="${color}" stroke="none"/></g>`;
    case "peony-lampion":
      return `<g ${s}><g transform="translate(21 25)"><ellipse cx="0" cy="-7" rx="4" ry="6"/><ellipse cx="0" cy="-7" rx="4" ry="6" transform="rotate(72)"/><ellipse cx="0" cy="-7" rx="4" ry="6" transform="rotate(144)"/><ellipse cx="0" cy="-7" rx="4" ry="6" transform="rotate(216)"/><ellipse cx="0" cy="-7" rx="4" ry="6" transform="rotate(288)"/><circle r="2.4" fill="${color}" stroke="none"/></g><path d="M50 6v7M44 13h12M46 13v12c0 3 8 3 8 0V13" stroke-opacity=".85"/><path d="M50 25v6M47 31h6" stroke-opacity=".85"/><path d="M4 50c8-4 16-4 24 0" stroke-opacity=".6"/></g>`;
    case "rose":
      return `<g ${s}><circle cx="32" cy="22" r="14"/><circle cx="32" cy="22" r="8" stroke-opacity=".7"/><circle cx="32" cy="22" r="3" fill="${color}" stroke="none"/><path d="M18 39C10 41 6 49 8 57c8-2 14-8 14-16" stroke-opacity=".7"/><path d="M46 39c8 2 12 10 10 18-8-2-14-8-14-16" stroke-opacity=".7"/></g>`;
    case "geometris-minimal":
      return `<g ${s}><path d="M0 16h64M0 48h64M16 0v64M48 0v64" stroke-opacity=".35"/><circle cx="16" cy="16" r="2.2" fill="${color}" stroke="none" fill-opacity=".85"/><circle cx="48" cy="48" r="2.2" fill="${color}" stroke="none" fill-opacity=".85"/></g>`;
    case "daun-emas":
    default:
      return `<g ${s}><path d="M32 6v52"/><path d="M32 18C24 10 14 12 12 18c6 6 16 4 20 0Z"/><path d="M32 30c8-8 18-6 20 0-6 6-16 4-20 0Z"/><path d="M32 42C24 34 14 36 12 42c6 6 16 4 20 0Z"/><circle cx="32" cy="6" r="2" fill="${color}" stroke="none"/></g>`;
  }
}

/** Siluet besar di dalam arch untuk tema dengan arsitektur khas. */
function silhouette(ornament, color) {
  const f = `fill="${color}"`;
  const s = `stroke="${color}" stroke-width="3" fill="none" stroke-linecap="round"`;
  switch (ornament) {
    case "mega-mendung":
    case "parang":
    case "siluet-joglo":
      // Joglo: atap bertingkat + saka guru.
      return `<g><path ${f} d="M300 258 398 330H202Z"/><path ${f} d="M232 330 204 362h192l-28-32Z" opacity=".85"/><g ${s}><path d="M238 362v52M274 362v52M326 362v52M362 362v52" opacity=".55"/><path d="M196 414h208" stroke-width="4"/></g></g>`;
    case "gunungan":
      return `<g><path ${f} d="M300 250c40 44 66 78 66 118 0 34-28 50-66 50s-66-16-66-50c0-40 26-74 66-118Z"/><g stroke="#ffffff" stroke-opacity=".35" stroke-width="3" fill="none"><path d="M300 292v104"/><path d="M300 330c-16-12-30-6-34 6 12 10 26 8 34-6Zm0 0c16-12 30-6 34 6-12 10-26 8-34-6Z"/></g></g>`;
    case "tongkonan":
      // Tongkonan: atap perahu melengkung + tiang.
      return `<g><path ${f} d="M196 356c26-64 182-64 208 0-34-16-174-16-208 0Z"/><g ${s}><path d="M238 330 262 282M362 330l-24-48M262 282h76" opacity=".7"/><path d="M252 356v46M348 356v46M204 402h192" opacity=".6"/></g></g>`;
    case "candi-bentar":
      // Candi bentar: dua menara terbelah + kamboja di tengah.
      return `<g ${f}><path d="M238 418V318l24-24 26 24v100Z"/><path d="M362 418V318l-24-24-26 24v100Z" opacity=".88"/></g><g ${s}><path d="M196 418h208" stroke-width="4"/><path d="M288 418v-64l12-10 12 10v64" opacity=".5"/></g>`;
    default:
      return "";
  }
}

function monogramOf(name) {
  const words = name.replace(/^Art\s+/i, "").split(/\s+/).filter(Boolean);
  return (words[0]?.[0] ?? "U") + (words[1]?.[0] ?? "");
}

/** Tema dengan arch gelap memakai aksen sebagai tinta agar tetap terbaca. */
function isDark(hex) {
  const value = hex.replace("#", "");
  const r = parseInt(value.slice(0, 2), 16);
  const g = parseInt(value.slice(2, 4), 16);
  const b = parseInt(value.slice(4, 6), 16);
  return 0.2126 * r + 0.7152 * g + 0.0722 * b < 128;
}

function buildSvg(theme) {
  const { primary, accent, background } = theme;
  const mono = monogramOf(theme.name).toUpperCase();
  const ink = isDark(background) ? accent : primary;
  const sil = silhouette(theme.ornament, ink);
  // Medalion motif besar bila tidak ada siluet arsitektur.
  const medallion = sil
    ? ""
    : `<g transform="translate(204 246) scale(3)">${motifTile(theme.ornament, ink)}</g>`;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 800" role="img" aria-label="Preview tema ${esc(theme.name)}">
  <defs>
    <pattern id="motif" width="64" height="64" patternUnits="userSpaceOnUse">
      ${motifTile(theme.ornament, accent)}
    </pattern>
    <linearGradient id="sheen" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#ffffff" stop-opacity=".10"/>
      <stop offset=".45" stop-color="#ffffff" stop-opacity="0"/>
      <stop offset="1" stop-color="#000000" stop-opacity=".18"/>
    </linearGradient>
  </defs>
  <rect width="600" height="800" fill="${primary}"/>
  <rect width="600" height="800" fill="url(#motif)" opacity=".16"/>
  <rect width="600" height="800" fill="url(#sheen)"/>
  <rect x="26" y="26" width="548" height="748" fill="none" stroke="${accent}" stroke-width="2"/>
  <rect x="38" y="38" width="524" height="724" fill="none" stroke="${accent}" stroke-width=".75" opacity=".7"/>
  <text x="300" y="118" text-anchor="middle" font-family="Georgia, 'Times New Roman', serif" font-size="20" letter-spacing="7" fill="${accent}">THE WEDDING OF</text>
  <g stroke="${accent}" stroke-width="1.6"><path d="M216 140h56M328 140h56"/><path d="M300 132l8 8-8 8-8-8Z" fill="${accent}" stroke="none"/></g>
  <path d="M178 636V332a122 122 0 0 1 244 0v304Z" fill="${background}"/>
  <path d="M178 636V332a122 122 0 0 1 244 0v304Z" fill="none" stroke="${accent}" stroke-width="2.5"/>
  <path d="M192 636V338a108 108 0 0 1 216 0v298Z" fill="none" stroke="${accent}" stroke-width=".75" opacity=".65"/>
  ${sil}
  ${medallion}
  <text x="300" y="540" text-anchor="middle" font-family="Georgia, 'Times New Roman', serif" font-size="96" fill="${ink}">${esc(mono)}</text>
  <g stroke="${ink}" stroke-width="1.4" opacity=".8"><path d="M238 566h44M318 566h44"/><path d="M300 559l6 7-6 7-6-7Z" fill="${ink}" stroke="none"/></g>
  <text x="300" y="612" text-anchor="middle" font-family="Georgia, 'Times New Roman', serif" font-size="17" letter-spacing="4" fill="${ink}" opacity=".85">UNDANGAN DIGITAL</text>
  <text x="300" y="700" text-anchor="middle" font-family="Georgia, 'Times New Roman', serif" font-size="33" fill="#ffffff">${esc(theme.name)}</text>
  <text x="300" y="734" text-anchor="middle" font-family="Georgia, 'Times New Roman', serif" font-size="16" letter-spacing="3.5" fill="${accent}">${esc(theme.motif.toUpperCase())}</text>
</svg>
`;
}

mkdirSync(OUT_DIR, { recursive: true });
for (const theme of THEMES) {
  const file = join(OUT_DIR, `${theme.code}.svg`);
  writeFileSync(file, buildSvg(theme).replace(/[ \t]+$/gm, ""), "utf8");
  console.log(`  dibuat public/previews/${theme.code}.svg`);
}
console.log(`Selesai: ${THEMES.length} artwork preview dibuat.`);
