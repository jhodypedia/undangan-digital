/**
 * Peta artwork cover per template.
 *
 * Angka `top/left/width/height` adalah persentase terhadap artwork portrait
 * (bukan terhadap viewport). Dengan begitu foto dan teks tetap berada di
 * dalam bingkai yang sama seperti pada gambar preview, termasuk saat layar
 * lebih tinggi atau lebih pendek dari rasio artwork.
 */
export type ArtworkFrame = {
  top: number;
  left: number;
  width: number;
  height: number;
  shape?: "rect" | "arch" | "oval";
};

export type ArtworkContent = {
  top: number;
  left: number;
  width: number;
  height: number;
  /** Warna teks default saat bingkai tidak diisi foto. */
  ink: string;
  accent: string;
  /** Ukuran nama dalam `vw`, dibatasi `nameMax`. */
  nameSize?: number;
  nameMax?: number;
  /** Panel kecil di belakang teks, dipakai untuk tema yang bingkainya sempit. */
  panel?: "none" | "dark" | "cream";
  showLabel?: boolean;
  labelScript?: boolean;
};

export type ArtworkMeta = {
  code: string;
  src: string;
  aspect: string;
  /** width / height, dipakai untuk menghitung lebar panggung cover. */
  ratio: number;
  frame: ArtworkFrame;
  content: ArtworkContent;
  /** Apakah cover photo pengguna boleh mengisi bingkai. */
  photo?: boolean;
};

const ARTWORK: Record<string, Omit<ArtworkMeta, "code" | "src">> = {
  "elegant-rose": {
    aspect: "1 / 2",
    ratio: 0.5,
    frame: { top: 25, left: 20, width: 56, height: 43, shape: "arch" },
    content: {
      top: 28,
      left: 23,
      width: 50,
      height: 38,
      ink: "#3f1d2e",
      accent: "#9d5a6f",
      nameSize: 5.6,
      nameMax: 2.2,
    },
    photo: true,
  },
  "royal-emerald": {
    aspect: "1 / 2",
    ratio: 0.5,
    frame: { top: 21, left: 16, width: 68, height: 64, shape: "arch" },
    content: {
      top: 26,
      left: 20,
      width: 60,
      height: 56,
      ink: "#f4e6bd",
      accent: "#e6c25c",
      nameSize: 5.8,
      nameMax: 2.3,
    },
    photo: true,
  },
  "midnight-slate": {
    aspect: "1 / 2",
    ratio: 0.5,
    frame: { top: 35, left: 23, width: 54, height: 44, shape: "arch" },
    content: {
      top: 39,
      left: 26,
      width: 48,
      height: 35,
      ink: "#e2e8f0",
      accent: "#7dd3fc",
      nameSize: 5.7,
      nameMax: 2.15,
    },
    photo: true,
  },
  "jawa-biru": {
    aspect: "2 / 3",
    ratio: 0.6667,
    frame: { top: 47, left: 7, width: 38, height: 34, shape: "arch" },
    content: {
      top: 51,
      left: 10,
      width: 32,
      height: 27,
      ink: "#f5e6b8",
      accent: "#e2c16b",
      nameSize: 5.6,
      nameMax: 1.85,
    },
    photo: true,
  },
  "jawa-merah": {
    aspect: "1 / 2",
    ratio: 0.5,
    frame: { top: 28, left: 9, width: 40, height: 35, shape: "oval" },
    content: {
      top: 32,
      left: 13,
      width: 32,
      height: 28,
      ink: "#4a160f",
      accent: "#a9782e",
      nameSize: 5.7,
      nameMax: 1.85,
    },
    photo: true,
  },
  "jawa-hitam": {
    aspect: "1 / 2",
    ratio: 0.5,
    frame: { top: 19, left: 7, width: 31, height: 18, shape: "arch" },
    content: {
      top: 20,
      left: 9,
      width: 27,
      height: 17,
      ink: "#f4e6c7",
      accent: "#d4af37",
      nameSize: 5.2,
      nameMax: 1.65,
      labelScript: true,
    },
    photo: true,
  },
  "art-jawa": {
    aspect: "1 / 2",
    ratio: 0.5,
    frame: { top: 21, left: 10, width: 39, height: 39, shape: "arch" },
    content: {
      top: 25,
      left: 13,
      width: 33,
      height: 33,
      ink: "#4a2f1b",
      accent: "#8a5a2b",
      nameSize: 5.6,
      nameMax: 1.9,
    },
    photo: true,
  },
  bali: {
    aspect: "1 / 2",
    ratio: 0.5,
    frame: { top: 15, left: 13, width: 23, height: 27, shape: "arch" },
    content: {
      top: 51,
      left: 42,
      width: 36,
      height: 20,
      ink: "#fdf6ea",
      accent: "#f3d18a",
      nameSize: 5.4,
      nameMax: 1.95,
      panel: "dark",
    },
    photo: true,
  },
  palembang: {
    aspect: "1 / 2",
    ratio: 0.5,
    frame: { top: 18, left: 9, width: 36, height: 44, shape: "rect" },
    content: {
      top: 22,
      left: 11,
      width: 32,
      height: 36,
      ink: "#f7e2b0",
      accent: "#e2b857",
      nameSize: 5.6,
      nameMax: 1.85,
    },
    photo: true,
  },
  banjar: {
    aspect: "1 / 2",
    ratio: 0.5,
    frame: { top: 24, left: 8, width: 44, height: 36, shape: "oval" },
    content: {
      top: 28,
      left: 11,
      width: 38,
      height: 29,
      ink: "#2f3a1f",
      accent: "#8a6a1f",
      nameSize: 5.6,
      nameMax: 1.95,
    },
    photo: true,
  },
  batak: {
    aspect: "1 / 2",
    ratio: 0.5,
    frame: { top: 14, left: 5, width: 43, height: 69, shape: "arch" },
    content: {
      top: 18,
      left: 8,
      width: 37,
      height: 61,
      ink: "#3a1d1d",
      accent: "#991b1b",
      nameSize: 5.6,
      nameMax: 1.95,
    },
    photo: true,
  },
  "batak-karo": {
    aspect: "1 / 2",
    ratio: 0.5,
    frame: { top: 31, left: 9, width: 45, height: 46, shape: "arch" },
    content: {
      top: 35,
      left: 12,
      width: 39,
      height: 38,
      ink: "#3a1d1d",
      accent: "#b91c1c",
      nameSize: 5.6,
      nameMax: 2.0,
    },
    photo: true,
  },
  mandailing: {
    aspect: "1 / 2",
    ratio: 0.5,
    frame: { top: 34, left: 11, width: 33, height: 43, shape: "arch" },
    content: {
      top: 38,
      left: 13,
      width: 29,
      height: 36,
      ink: "#3a2a14",
      accent: "#a46a1f",
      nameSize: 5.5,
      nameMax: 1.65,
    },
    photo: true,
  },
  chinese: {
    aspect: "1 / 2",
    ratio: 0.5,
    frame: { top: 36, left: 13, width: 43, height: 38, shape: "arch" },
    content: {
      top: 40,
      left: 16,
      width: 37,
      height: 31,
      ink: "#f7e4b0",
      accent: "#f5c542",
      nameSize: 5.6,
      nameMax: 1.95,
    },
    photo: true,
  },
  minang: {
    aspect: "1 / 2",
    ratio: 0.5,
    frame: { top: 18, left: 9, width: 42, height: 44, shape: "arch" },
    content: {
      top: 22,
      left: 12,
      width: 36,
      height: 37,
      ink: "#3a1d1d",
      accent: "#b8860b",
      nameSize: 5.6,
      nameMax: 1.9,
    },
    photo: true,
  },
  toraja: {
    aspect: "1 / 2",
    ratio: 0.5,
    frame: { top: 28, left: 11, width: 36, height: 36, shape: "rect" },
    content: {
      top: 32,
      left: 14,
      width: 30,
      height: 28,
      ink: "#3a2a14",
      accent: "#8f3a1f",
      nameSize: 5.5,
      nameMax: 1.65,
    },
    photo: true,
  },
  melayu: {
    aspect: "1 / 2",
    ratio: 0.5,
    frame: { top: 25, left: 8, width: 37, height: 41, shape: "arch" },
    content: {
      top: 29,
      left: 11,
      width: 31,
      height: 34,
      ink: "#17331f",
      accent: "#b8860b",
      nameSize: 5.5,
      nameMax: 1.75,
    },
    photo: true,
  },
  lampung: {
    aspect: "3 / 4",
    ratio: 0.75,
    frame: { top: 28, left: 9, width: 39, height: 47, shape: "arch" },
    content: {
      top: 32,
      left: 12,
      width: 33,
      height: 39,
      ink: "#33200f",
      accent: "#8a5a2b",
      nameSize: 5.5,
      nameMax: 1.9,
    },
    photo: true,
  },
  sunda: {
    aspect: "1 / 2",
    ratio: 0.5,
    frame: { top: 34, left: 9, width: 44, height: 32, shape: "arch" },
    content: {
      top: 38,
      left: 12,
      width: 38,
      height: 25,
      ink: "#3a1a26",
      accent: "#881337",
      nameSize: 5.6,
      nameMax: 1.95,
    },
    photo: true,
  },
  bugis: {
    aspect: "1 / 2",
    ratio: 0.5,
    frame: { top: 38, left: 10, width: 46, height: 24, shape: "oval" },
    content: {
      top: 41,
      left: 13,
      width: 40,
      height: 18,
      ink: "#3a1d1d",
      accent: "#991b1b",
      nameSize: 5.5,
      nameMax: 2.0,
    },
    photo: true,
  },
  aceh: {
    aspect: "1 / 2",
    ratio: 0.5,
    frame: { top: 21, left: 11, width: 36, height: 36, shape: "arch" },
    content: {
      top: 25,
      left: 14,
      width: 30,
      height: 29,
      ink: "#1c3a25",
      accent: "#b8860b",
      nameSize: 5.5,
      nameMax: 1.7,
    },
    photo: true,
  },
};

export function getTemplateArtwork(
  code: string | null | undefined,
): ArtworkMeta | null {
  if (!code) return null;
  const meta = ARTWORK[code];
  if (!meta) return null;
  return {
    ...meta,
    code,
    src: `/previews/${code}.jpg`,
  };
}
