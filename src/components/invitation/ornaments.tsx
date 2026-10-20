import { cn } from "@/lib/utils";
import type { FrameStyle, OrnamentKey } from "@/lib/template-config";

/**
 * Ornamen SVG original untuk sistem template undangan.
 * Semua artwork dibuat dari bentuk geometris sederhana dan memakai
 * `currentColor` / prop warna agar otomatis mengikuti palet tema.
 * Tidak ada aset eksternal maupun gambar berhak cipta.
 */

type OrnamentProps = {
  color?: string;
  className?: string;
  style?: React.CSSProperties;
};

function motifTile(motif: OrnamentKey | string, color: string): React.ReactNode {
  switch (motif) {
    case "kawung":
      return (
        <>
          <ellipse cx="32" cy="14" rx="12" ry="7.5" />
          <ellipse cx="32" cy="50" rx="12" ry="7.5" />
          <ellipse cx="14" cy="32" rx="7.5" ry="12" />
          <ellipse cx="50" cy="32" rx="7.5" ry="12" />
          <circle cx="32" cy="32" r="2.4" fill={color} stroke="none" />
        </>
      );
    case "mega-mendung":
      return (
        <>
          <path d="M-4 46c8 0 8-12 16-12s8 12 16 12 8-12 16-12 8 12 16 12 8-12 16-12" />
          <path
            d="M-4 58c8 0 8-12 16-12s8 12 16 12 8-12 16-12 8 12 16 12 8-12 16-12"
            strokeOpacity=".6"
          />
          <path d="M10 24c0-6 8-8 11-3 2 4-2 9-6 7" strokeOpacity=".85" />
          <path d="M42 12c0-6 8-8 11-3 2 4-2 9-6 7" strokeOpacity=".85" />
          <circle cx="12" cy="30" r="1.2" fill={color} stroke="none" />
          <circle cx="44" cy="18" r="1.2" fill={color} stroke="none" />
        </>
      );
    case "parang":
      return (
        <>
          <path d="M-10 74C6 56 22 54 34 38S58 10 74 0" strokeWidth="7" strokeOpacity=".9" />
          <path d="M-10 44C6 26 22 24 34 8" strokeWidth="2.5" strokeOpacity=".7" />
          <path d="M30 74C46 56 62 54 74 38" strokeWidth="2.5" strokeOpacity=".7" />
          <path d="M8 60c6-2 10-8 8-14" strokeWidth="2" />
          <path d="M44 30c6-2 10-8 8-14" strokeWidth="2" />
        </>
      );
    case "gunungan":
      return (
        <>
          <path d="M32 4C44 18 56 30 56 46C56 57 45 62 32 62C19 62 8 57 8 46C8 30 20 18 32 4Z" />
          <path d="M32 18V54" strokeOpacity=".8" />
          <path d="M32 29C24 23 17 26 15 32c6 5 13 4 17-3ZM32 29c8-6 15-3 17 3-6 5-13 4-17-3Z" strokeOpacity=".8" />
          <path d="M32 42C25 37 19 40 17 45c5 4 11 3 15-3ZM32 42c7-5 13-2 15 3-5 4-11 3-15-3Z" strokeOpacity=".7" />
          <path d="M24 55h16" strokeOpacity=".7" />
        </>
      );
    case "songket":
      return (
        <>
          <path d="M0 16L16 0L32 16L48 0L64 16" />
          <path d="M0 48L16 32L32 48L48 32L64 48" />
          <path d="M16 0V64M48 0V64" strokeOpacity=".35" />
          <path d="M32 8L40 32L32 56L24 32Z" strokeOpacity=".8" />
          <circle cx="32" cy="32" r="2.2" fill={color} stroke="none" />
        </>
      );
    case "ulos":
      return (
        <>
          <path d="M0 10H64M0 54H64" strokeWidth="4" />
          <path
            d="M-4 24l10 8-10 8M12 24l10 8-10 8M28 24l10 8-10 8M44 24l10 8-10 8M60 24l10 8-10 8"
            strokeWidth="2"
          />
          <path d="M0 39H64" strokeOpacity=".5" />
          <path d="M8 16v8M24 16v8M40 16v8M56 16v8" strokeOpacity=".7" />
        </>
      );
    case "marawa":
      return (
        <>
          <path d="M0 26L16 10L32 26Z" fill={color} stroke="none" fillOpacity=".45" />
          <path d="M32 26L48 10L64 26Z" fill={color} stroke="none" fillOpacity=".75" />
          <path d="M-16 54L0 38L16 54Z" fill={color} stroke="none" fillOpacity=".75" />
          <path d="M16 54L32 38L48 54Z" fill={color} stroke="none" fillOpacity=".45" />
          <path d="M48 54L64 38L80 54Z" fill={color} stroke="none" fillOpacity=".45" />
        </>
      );
    case "tongkonan":
      return (
        <>
          <path d="M4 42C14 18 50 18 60 42C50 36 14 36 4 42Z" />
          <path d="M14 30L22 8M50 30L42 8M22 8H42" />
          <path d="M6 48H58" strokeOpacity=".5" />
          <path d="M20 42V54M44 42V54" strokeOpacity=".6" />
        </>
      );
    case "tapis":
      return (
        <>
          <path d="M0 14L8 6L16 14L24 6L32 14L40 6L48 14L56 6L64 14" />
          <path d="M0 50L8 42L16 50L24 42L32 50L40 42L48 50L56 42L64 50" />
          <path d="M32 24L44 36L32 48L20 36Z" strokeOpacity=".8" />
          <path d="M0 32H12M52 32H64" strokeOpacity=".5" />
        </>
      );
    case "pintu-aceh":
      return (
        <>
          <path d="M12 56V30c0-9 9-16 20-16s20 7 20 16v26" />
          <path d="M20 56V32c0-6 5-10 12-10s12 4 12 10v24" strokeOpacity=".6" />
          <path d="M32 20v36" strokeOpacity=".4" />
          <path d="M0 56H64" strokeWidth="2" />
          <circle cx="32" cy="34" r="1.6" fill={color} stroke="none" />
        </>
      );
    case "peony-lampion":
      return (
        <>
          <g transform="translate(22 24)">
            <ellipse cx="0" cy="-7" rx="4" ry="6" />
            <ellipse cx="0" cy="-7" rx="4" ry="6" transform="rotate(72)" />
            <ellipse cx="0" cy="-7" rx="4" ry="6" transform="rotate(144)" />
            <ellipse cx="0" cy="-7" rx="4" ry="6" transform="rotate(216)" />
            <ellipse cx="0" cy="-7" rx="4" ry="6" transform="rotate(288)" />
            <circle r="2.4" fill={color} stroke="none" />
          </g>
          <path d="M50 8v6M44 14h12M46 14v12c0 3 8 3 8 0V14" strokeOpacity=".8" />
          <path d="M50 26v5M47 31h6" strokeOpacity=".8" />
          <path d="M4 48c8-4 16-4 24 0" strokeOpacity=".6" />
        </>
      );
    case "candi-bentar":
      return (
        <>
          <path d="M4 58V30l8-8 8 8v28M44 58V30l8-8 8 8v28" />
          <path d="M0 58H64" strokeWidth="2" />
          <path d="M20 58V36l12-8 12 8v22" strokeOpacity=".5" />
          <path d="M12 18V8M52 18V8" strokeOpacity=".7" />
          <path d="M32 20v38" strokeOpacity=".3" />
        </>
      );
    case "frangipani":
      return (
        <>
          <g transform="translate(32 28)">
            {[0, 72, 144, 216, 288].map((deg) => (
              <ellipse
                key={deg}
                cx="0"
                cy="-9"
                rx="5"
                ry="9"
                transform={`rotate(${deg})`}
              />
            ))}
            <circle r="2.6" fill={color} stroke="none" />
          </g>
          <path d="M10 56c8-6 18-6 26 0" strokeOpacity=".5" />
          <path d="M28 56c8-6 18-6 26 0" strokeOpacity=".3" />
        </>
      );
    case "siluet-joglo":
      return (
        <>
          <path d="M32 4L60 28H4Z" />
          <path d="M12 28L4 40H60L52 28" />
          <path d="M8 40V58M56 40V58" />
          <path d="M24 40V58M40 40V58" strokeOpacity=".5" />
          <path d="M4 58H60" strokeWidth="2" />
        </>
      );
    case "daun-emas":
      return (
        <>
          <path d="M32 6V58" />
          <path d="M32 18C24 10 14 12 12 18c6 6 16 4 20 0Z" />
          <path d="M32 30C40 22 50 24 52 30c-6 6-16 4-20 0Z" />
          <path d="M32 42C24 34 14 36 12 42c6 6 16 4 20 0Z" />
          <circle cx="32" cy="6" r="2" fill={color} stroke="none" />
        </>
      );
    case "rose":
      return (
        <>
          <path d="M32 8c8 0 14 6 14 14S40 36 32 36s-14-6-14-14S24 8 32 8Z" />
          <path d="M32 14c4 0 8 3 8 8s-4 8-8 8-8-3-8-8 4-8 8-8Z" strokeOpacity=".7" />
          <circle cx="32" cy="22" r="3" fill={color} stroke="none" />
          <path d="M18 38c-8 2-12 10-10 18 8-2 14-8 14-16" strokeOpacity=".7" />
          <path d="M46 38c8 2 12 10 10 18-8-2-14-8-14-16" strokeOpacity=".7" />
        </>
      );
    case "geometris-minimal":
      return (
        <>
          <path d="M0 16H64M0 48H64M16 0V64M48 0V64" strokeOpacity=".35" />
          <circle cx="16" cy="16" r="2" fill={color} stroke="none" fillOpacity=".8" />
          <circle cx="48" cy="48" r="2" fill={color} stroke="none" fillOpacity=".8" />
        </>
      );
    default:
      return motifTile("daun-emas", color);
  }
}

export function MotifPattern({
  motif,
  color = "currentColor",
  opacity = 1,
  className,
  id,
}: {
  motif: OrnamentKey | string;
  color?: string;
  opacity?: number;
  className?: string;
  id?: string;
}) {
  const key = `inv-motif-${id ?? motif}`;
  return (
    <svg
      aria-hidden
      className={cn("pointer-events-none absolute inset-0 h-full w-full", className)}
      style={{ opacity }}
      preserveAspectRatio="none"
    >
      <defs>
        <pattern
          id={key}
          width="64"
          height="64"
          patternUnits="userSpaceOnUse"
        >
          <g
            stroke={color}
            strokeWidth="1.2"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            {motifTile(motif, color)}
          </g>
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill={`url(#${key})`} />
    </svg>
  );
}

export function OrnamentCorner({ color, className, style }: OrnamentProps) {
  const stroke = color ?? "currentColor";
  return (
    <svg
      aria-hidden
      viewBox="0 0 80 80"
      className={cn("size-14", className)}
      style={style}
      fill="none"
      stroke={stroke}
      strokeWidth="1.2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M4 76V32C4 16 16 4 32 4h44" strokeOpacity=".9" />
      <path d="M11 76V34C11 20 20 11 34 11h42" strokeOpacity=".5" />
      <path d="M19 42c9 0 9-11 18-11s9 11 18 11" strokeOpacity=".75" />
      <path d="M4 50c11 0 13-8 13-18" strokeOpacity=".6" />
      <path d="M50 4c0 11-8 13-18 13" strokeOpacity=".6" />
      <circle cx="20" cy="20" r="3" fill={stroke} stroke="none" />
      <circle cx="40" cy="11" r="1.4" fill={stroke} stroke="none" opacity=".7" />
      <circle cx="11" cy="40" r="1.4" fill={stroke} stroke="none" opacity=".7" />
    </svg>
  );
}

export function OrnamentFrame({
  color,
  className,
  size = "size-14",
}: OrnamentProps & { size?: string }) {
  const stroke = color ?? "currentColor";
  return (
    <div aria-hidden className={cn("pointer-events-none absolute inset-0", className)}>
      <OrnamentCorner color={stroke} className={cn("absolute top-0 left-0", size)} />
      <OrnamentCorner color={stroke} className={cn("absolute top-0 right-0 rotate-90", size)} />
      <OrnamentCorner color={stroke} className={cn("absolute right-0 bottom-0 rotate-180", size)} />
      <OrnamentCorner color={stroke} className={cn("absolute bottom-0 left-0 -rotate-90", size)} />
    </div>
  );
}

function dividerGlyph(motif: OrnamentKey | string, color: string) {
  switch (motif) {
    case "mega-mendung":
      return (
        <>
          <path d="M4 14c5 0 5-7 10-7s5 7 10 7 5-7 10-7 5 7 10 7" />
          <circle cx="24" cy="14" r="1.4" fill={color} stroke="none" />
        </>
      );
    case "songket":
      return (
        <>
          <path d="M24 3L35 12L24 21L13 12Z" />
          <circle cx="24" cy="12" r="1.8" fill={color} stroke="none" />
        </>
      );
    case "gunungan":
      return (
        <>
          <path d="M24 2C31 8 37 14 37 21C37 27 31 25 24 25C17 25 11 27 11 21C11 14 17 8 24 2Z" />
          <path d="M24 10V21M24 14c-4-3-7-1-8 2 3 2 6 1 8-2M24 14c4-3 7-1 8 2-3 2-6 1-8-2" strokeOpacity=".8" />
        </>
      );
    case "marawa":
      return (
        <>
          <path d="M13 19L24 5L35 19Z" />
          <path d="M18 13H30" strokeOpacity=".6" />
        </>
      );
    case "pintu-aceh":
      return <path d="M15 19V10c0-4 4-7 9-7s9 3 9 7v9" />;
    case "tongkonan":
      return <path d="M6 18C12 8 36 8 42 18C36 15 12 15 6 18Z" />;
    case "peony-lampion":
    case "frangipani":
      return (
        <>
          <ellipse cx="24" cy="8" rx="3" ry="5" />
          <ellipse cx="24" cy="8" rx="3" ry="5" transform="rotate(72 24 12)" />
          <ellipse cx="24" cy="8" rx="3" ry="5" transform="rotate(144 24 12)" />
          <ellipse cx="24" cy="8" rx="3" ry="5" transform="rotate(216 24 12)" />
          <ellipse cx="24" cy="8" rx="3" ry="5" transform="rotate(288 24 12)" />
          <circle cx="24" cy="12" r="1.8" fill={color} stroke="none" />
        </>
      );
    case "daun-emas":
    case "rose":
      return (
        <>
          <path d="M24 21V4" />
          <path d="M24 10c-6-4-10-2-12 2 5 4 10 3 12 0M24 15c6-4 10-2 12 2-5 4-10 3-12 0" />
        </>
      );
    default:
      return (
        <>
          <path d="M24 3L33 12L24 21L15 12Z" />
          <circle cx="24" cy="12" r="1.8" fill={color} stroke="none" />
        </>
      );
  }
}

export function OrnamentDivider({
  motif = "daun-emas",
  color = "currentColor",
  className,
}: {
  motif?: OrnamentKey | string;
  color?: string;
  className?: string;
}) {
  return (
    <div
      aria-hidden
      className={cn("flex items-center justify-center gap-2", className)}
    >
      <span
        className="h-px w-14"
        style={{ background: `linear-gradient(90deg, transparent, ${color})` }}
      />
      <svg
        viewBox="0 0 48 24"
        className="h-5 w-12 shrink-0"
        fill="none"
        stroke={color}
        strokeWidth="1.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        {dividerGlyph(motif, color)}
      </svg>
      <span
        className="h-px w-14"
        style={{ background: `linear-gradient(90deg, ${color}, transparent)` }}
      />
    </div>
  );
}

export function CoverArch({
  frameStyle = "arch",
  color = "currentColor",
  secondaryColor,
  className,
}: {
  frameStyle?: FrameStyle;
  color?: string;
  secondaryColor?: string;
  className?: string;
}) {
  const common = {
    fill: "none",
    stroke: color,
    strokeWidth: 1.5,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
  };
  return (
    <svg
      aria-hidden
      viewBox="0 0 240 320"
      preserveAspectRatio="none"
      className={cn("pointer-events-none absolute inset-0 h-full w-full", className)}
    >
      {frameStyle === "square" ? (
        <>
          <rect x="4" y="4" width="232" height="312" {...common} />
          <rect x="11" y="11" width="218" height="298" {...common} strokeOpacity=".4" />
          <path d="M4 4h18M4 4v18M236 4h-18M236 4v18M4 316h18M4 316v-18M236 316h-18M236 316v-18" />
        </>
      ) : frameStyle === "rounded" ? (
        <>
          <rect x="4" y="4" width="232" height="312" rx="30" {...common} />
          <rect x="11" y="11" width="218" height="298" rx="24" {...common} strokeOpacity=".4" />
        </>
      ) : (
        <>
          <path d="M8 316V128C8 62 58 16 120 16s112 46 112 112v188" {...common} />
          <path
            d="M16 316V130C16 70 62 26 120 26s104 44 104 104v186"
            {...common}
            strokeOpacity=".4"
          />
          <path d="M120 2l9 11-9 11-9-11z" fill={secondaryColor ?? color} stroke="none" />
          <circle cx="120" cy="13" r="2" fill={secondaryColor ?? color} stroke="none" />
        </>
      )}
    </svg>
  );
}

/**
 * Gunungan wayang: panel daun simetris dengan pohon kehidupan.
 * Digambar original dari kurva simetris, dipakai sebagai centerpiece
 * cover tema Jawa Hitam.
 */
export function GununganOrnament({ color, className, style }: OrnamentProps) {
  const stroke = color ?? "currentColor";
  return (
    <svg
      aria-hidden
      viewBox="0 0 240 320"
      className={cn("pointer-events-none", className)}
      style={style}
      fill="none"
      stroke={stroke}
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M120 6C160 50 210 92 210 162C210 234 168 284 120 306C72 284 30 234 30 162C30 92 80 50 120 6Z" />
      <path
        d="M120 22C154 60 194 100 194 164C194 228 158 272 120 290C82 272 46 228 46 164C46 100 86 60 120 22Z"
        strokeOpacity=".55"
      />
      <path
        d="M120 38C148 72 178 108 178 166C178 220 148 258 120 274C92 258 62 220 62 166C62 108 92 72 120 38Z"
        strokeOpacity=".28"
      />

      {/* pohon kehidupan */}
      <path d="M120 58V286" strokeOpacity=".9" />
      <path d="M120 60C110 46 96 42 88 50C98 60 110 64 120 66Z" />
      <path d="M120 60C130 46 144 42 152 50C142 60 130 64 120 66Z" />
      <path d="M120 82C108 66 90 64 82 74C94 84 108 88 120 88Z" strokeOpacity=".85" />
      <path d="M120 82C132 66 150 64 158 74C146 84 132 88 120 88Z" strokeOpacity=".85" />

      <path d="M120 116C106 100 86 100 76 112C90 122 106 124 120 120Z" />
      <path d="M120 116C134 100 154 100 164 112C150 122 134 124 120 120Z" />
      <path d="M120 150C104 134 82 136 72 150C88 160 106 160 120 154Z" />
      <path d="M120 150C136 134 158 136 168 150C152 160 134 160 120 154Z" />

      <path d="M120 184C106 170 86 172 78 184C92 194 108 192 120 188Z" strokeOpacity=".9" />
      <path d="M120 184C134 170 154 172 162 184C148 194 132 192 120 188Z" strokeOpacity=".9" />
      <path d="M120 216C108 204 92 206 84 216C96 224 110 222 120 218Z" />
      <path d="M120 216C132 204 148 206 156 216C144 224 130 222 120 218Z" />

      <circle cx="88" cy="50" r="1.8" fill={stroke} stroke="none" />
      <circle cx="152" cy="50" r="1.8" fill={stroke} stroke="none" />
      <circle cx="76" cy="112" r="1.6" fill={stroke} stroke="none" />
      <circle cx="164" cy="112" r="1.6" fill={stroke} stroke="none" />
      <circle cx="72" cy="150" r="1.6" fill={stroke} stroke="none" />
      <circle cx="168" cy="150" r="1.6" fill={stroke} stroke="none" />

      {/* mahkota & alas */}
      <path d="M112 48L120 34L128 48" />
      <circle cx="120" cy="30" r="2.4" fill={stroke} stroke="none" />
      <path d="M84 268H156M94 268L82 288H158L146 268" />
      <path d="M104 288H136" strokeOpacity=".7" />
      <path d="M96 268V258M144 268V258" strokeOpacity=".6" />
    </svg>
  );
}

/** Motif besar untuk siluet cover (mis. atap joglo / gapura candi). */
export function MotifSilhouette({
  motif,
  color = "currentColor",
  className,
  style,
}: OrnamentProps & { motif: OrnamentKey | string }) {
  return (
    <svg
      aria-hidden
      viewBox="0 0 64 64"
      className={cn("pointer-events-none", className)}
      style={style}
      fill="none"
      stroke={color}
      strokeWidth="1.4"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {motifTile(motif, color)}
    </svg>
  );
}
