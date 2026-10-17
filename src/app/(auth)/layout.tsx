import Link from "next/link";
import { redirect } from "next/navigation";
import { CalendarCheck, Gem, Heart, ShieldCheck, Sparkles } from "lucide-react";

import { PageEnter } from "@/components/transitions/page-enter";
import { RouteOverlay } from "@/components/transitions/route-overlay";
import { SITE_SETTINGS_KEYS } from "@/lib/constants";
import { getCurrentUser } from "@/lib/session";
import { getSettings } from "@/lib/settings";

const HIGHLIGHTS = [
  { icon: Gem, label: "Template eksklusif", text: "Desain premium siap pakai" },
  { icon: CalendarCheck, label: "RSVP otomatis", text: "Rekap kehadiran real-time" },
  { icon: Heart, label: "Ucapan & doa", text: "Kumpulkan pesan hangat" },
];

export default async function AuthLayout({ children }: LayoutProps<"/">) {
  const user = await getCurrentUser();
  if (user) redirect("/dashboard");

  const settings = await getSettings();
  const brand = settings[SITE_SETTINGS_KEYS.siteName] ?? "UndanganKita";
  const tagline =
    settings[SITE_SETTINGS_KEYS.tagline] ??
    "Undangan digital yang berkesan, dibuat dalam hitungan menit.";

  return (
    <div className="grid min-h-svh lg:grid-cols-[1.05fr_1fr]">
      <RouteOverlay brand={brand} />

      <aside className="relative hidden overflow-hidden bg-primary text-primary-foreground lg:flex lg:flex-col lg:justify-between lg:p-12">
        <div
          aria-hidden
          className="anim-glow absolute inset-0 opacity-[0.16]"
          style={{
            backgroundImage:
              "radial-gradient(circle at 20% 20%, var(--accent) 0, transparent 45%), radial-gradient(circle at 80% 70%, var(--accent) 0, transparent 40%)",
          }}
        />
        <div
          aria-hidden
          className="absolute inset-0 opacity-[0.05]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,.6) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.6) 1px, transparent 1px)",
            backgroundSize: "44px 44px",
          }}
        />

        <div className="anim-rise relative flex items-center gap-2">
          <span className="anim-glow grid size-9 place-items-center rounded-lg bg-primary-foreground/10 font-display">
            {brand.slice(0, 2).toUpperCase()}
          </span>
          <Link href="/" className="font-display text-2xl tracking-tight">
            {brand}
          </Link>
        </div>

        <div className="relative max-w-md">
          <span className="anim-rise inline-flex items-center gap-2 rounded-full border border-accent/30 bg-white/5 px-3 py-1 text-[11px] tracking-wide text-accent">
            <Sparkles className="size-3.5" /> Undangan digital premium
          </span>
          <p
            className="anim-rise mt-5 font-display text-4xl leading-tight"
            style={{ animationDelay: "90ms" }}
          >
            Setiap undangan membawa cerita yang layak dikenang.
          </p>
          <p
            className="anim-rise mt-4 text-sm text-primary-foreground/70"
            style={{ animationDelay: "180ms" }}
          >
            {tagline}
          </p>

          <div className="mt-8 space-y-3">
            {HIGHLIGHTS.map((item, index) => (
              <div
                key={item.label}
                className="anim-rise flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 p-3 backdrop-blur"
                style={{ animationDelay: `${260 + index * 80}ms` }}
              >
                <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-accent/15 text-accent">
                  <item.icon className="size-4" />
                </span>
                <div>
                  <p className="text-sm font-medium">{item.label}</p>
                  <p className="text-xs text-primary-foreground/60">
                    {item.text}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="relative flex items-center gap-3 text-xs text-primary-foreground/60">
          <span className="h-px w-10 bg-accent/60" />
          <ShieldCheck className="size-3.5" /> Data tersimpan aman.
        </div>
      </aside>

      <main className="relative flex items-center justify-center px-5 py-12">
        <div
          aria-hidden
          className="anim-spin-slow pointer-events-none absolute size-[36rem] rounded-full opacity-[0.06]"
          style={{
            background:
              "conic-gradient(from 0deg, transparent, var(--accent), transparent 40%)",
          }}
        />
        <div className="relative w-full max-w-md">
          <div className="rounded-3xl border bg-card/80 p-7 shadow-xl backdrop-blur sm:p-9">
            <PageEnter>{children}</PageEnter>
          </div>
          <p className="mt-5 text-center text-xs text-muted-foreground lg:hidden">
            {brand}
          </p>
        </div>
      </main>
    </div>
  );
}
