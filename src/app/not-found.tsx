"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Compass, Home, Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";

const SPARKLES = Array.from({ length: 18 }, (_, index) => ({
  top: (index * 11 + 4) % 88,
  left: (index * 23 + 6) % 94,
  delay: (index * 0.6) % 4,
  size: 3 + (index % 3) * 2,
}));

const PETALS = Array.from({ length: 8 }, (_, index) => ({
  left: (index * 12 + 5) % 100,
  delay: (index * 1.9) % 12,
  duration: 12 + ((index * 2.4) % 8),
  scale: 0.6 + ((index % 3) * 0.25),
}));

export default function NotFound() {
  const router = useRouter();

  return (
    <main className="relative flex min-h-svh flex-col items-center justify-center overflow-hidden bg-background px-6 py-16 text-center">
      <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
        <span
          className="inv-orb anim-glow"
          style={{
            top: "-6rem",
            left: "-4rem",
            width: "20rem",
            height: "20rem",
            background: "color-mix(in srgb, var(--color-primary) 32%, transparent)",
          }}
        />
        <span
          className="inv-orb anim-glow"
          style={{
            bottom: "-7rem",
            right: "-5rem",
            width: "24rem",
            height: "24rem",
            background: "color-mix(in srgb, var(--color-accent) 28%, transparent)",
            animationDelay: "1.5s",
          }}
        />
        {PETALS.map((petal, index) => (
          <span
            key={`petal-${index}`}
            className="inv-petal"
            style={{
              left: `${petal.left}%`,
              animationDelay: `${petal.delay}s`,
              animationDuration: `${petal.duration}s`,
              transform: `scale(${petal.scale})`,
            }}
          />
        ))}
        {SPARKLES.map((sparkle, index) => (
          <span
            key={`sparkle-${index}`}
            className="inv-sparkle"
            style={{
              top: `${sparkle.top}%`,
              left: `${sparkle.left}%`,
              width: sparkle.size,
              height: sparkle.size,
              animationDelay: `${sparkle.delay}s`,
            }}
          />
        ))}
      </div>

      <div className="anim-rise relative z-10 flex flex-col items-center">
        <span className="inline-flex items-center gap-1.5 rounded-full border border-accent/40 bg-accent/10 px-3.5 py-1 text-xs font-medium tracking-wide text-accent">
          <Sparkles className="size-3.5" /> Error 404
        </span>

        <h1
          className="anim-float mt-6 font-display text-[6.5rem] leading-none font-semibold tracking-tight sm:text-[9rem]"
          style={{
            backgroundImage:
              "linear-gradient(120deg, var(--color-primary) 20%, var(--color-accent) 50%, var(--color-primary) 80%)",
            backgroundSize: "220% 100%",
            WebkitBackgroundClip: "text",
            backgroundClip: "text",
            color: "transparent",
            animation: "uk-shine 6s linear infinite, uk-float 7s ease-in-out infinite",
          }}
        >
          404
        </h1>

        <div className="anim-pop relative mt-2 grid size-14 place-items-center rounded-2xl border border-accent/40 bg-card shadow-xl">
          <Compass className="inv-heartbeat size-6 text-accent" />
          <span className="inv-spin-ring pointer-events-none absolute -inset-1.5 rounded-3xl border border-dashed border-accent/40" />
        </div>

        <h2 className="mt-6 font-display text-2xl sm:text-3xl">
          Halaman tidak ditemukan
        </h2>
        <p className="mt-3 max-w-md text-sm leading-relaxed text-muted-foreground">
          Halaman yang Anda cari mungkin sudah dipindah, dihapus, atau alamatnya
          salah ketik. Silakan kembali atau mulai dari beranda.
        </p>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Button variant="outline" onClick={() => router.back()}>
            <ArrowLeft className="size-4" /> Kembali
          </Button>
          <Button asChild className="sheen">
            <Link href="/">
              <Home className="size-4" /> Ke beranda
            </Link>
          </Button>
        </div>
      </div>
    </main>
  );
}
