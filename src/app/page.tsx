import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  BookHeart,
  CalendarHeart,
  Check,
  Gift,
  Images,
  LayoutTemplate,
  MessageCircleHeart,
  MousePointerClick,
  Sparkles,
  Users,
} from "lucide-react";

import { LiveInvitationPreview } from "@/components/invitation/live-preview";
import { Reveal } from "@/components/invitation/reveal";
import { ScrollProgress } from "@/components/marketing/scroll-progress";
import { Button } from "@/components/ui/button";
import { SITE_SETTINGS_KEYS } from "@/lib/constants";
import { formatCurrency } from "@/lib/format";
import {
  getSampleInvitationSlug,
  listActivePlans,
  listTemplates,
} from "@/lib/queries";
import { getSettings } from "@/lib/settings";
import { normalizeTemplateConfig } from "@/lib/template-config";

const FEATURES = [
  {
    icon: LayoutTemplate,
    title: "Template menawan",
    description:
      "Puluhan desain elegan siap pakai, dari klasik hingga modern, dan bisa dibuat otomatis oleh AI.",
  },
  {
    icon: Users,
    title: "Kelola tamu",
    description:
      "Impor daftar tamu, kirim tautan personal via WhatsApp, dan pantau siapa yang sudah membuka.",
  },
  {
    icon: CalendarHeart,
    title: "RSVP & kehadiran",
    description:
      "Tamu mengonfirmasi kehadiran dan jumlah orang secara langsung — rekap otomatis untuk Anda.",
  },
  {
    icon: MessageCircleHeart,
    title: "Ucapan & doa",
    description:
      "Kumpulkan doa dan pesan hangat dari tamu, moderasi sebelum ditampilkan.",
  },
  {
    icon: Images,
    title: "Galeri & album",
    description:
      "Tampilkan momen dalam galeri foto dan album terpisah dengan penampil layar penuh.",
  },
  {
    icon: Gift,
    title: "Amplop digital",
    description:
      "Cantumkan rekening, e-wallet, dan alamat kado lengkap dengan tombol salin.",
  },
];

export default async function LandingPage() {
  const [settings, plans, templates, sampleSlug] = await Promise.all([
    getSettings(),
    listActivePlans(),
    listTemplates(),
    getSampleInvitationSlug(),
  ]);

  const siteName = settings[SITE_SETTINGS_KEYS.siteName] ?? "UndanganKita";
  const tagline =
    settings[SITE_SETTINGS_KEYS.tagline] ??
    "Undangan digital yang berkesan, dibuat dalam hitungan menit.";
  const whatsapp = settings[SITE_SETTINGS_KEYS.contactWhatsapp];
  const previewTemplates = templates.filter((t) => t.isActive);
  const sampleHref = sampleSlug ? `/u/${sampleSlug}` : "#template";
  const previewConfig = previewTemplates[0]
    ? normalizeTemplateConfig(previewTemplates[0].config)
    : null;
  const previewColors = previewConfig?.colors ?? {
    primary: "#0b3d2e",
    accent: "#c9a24b",
    background: "#f7f3ea",
    surface: "#ffffff",
    text: "#17241d",
  };
  const previewFont = previewConfig?.fontDisplay ?? "Playfair Display";

  return (
    <div className="relative flex min-h-svh flex-col overflow-x-hidden bg-[#f7f3ea] text-[#17241d]">
      <ScrollProgress />

      <header className="sticky top-0 z-30 border-b border-black/5 bg-[#f7f3ea]/85 backdrop-blur">
        <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-5">
          <Link
            href="/"
            className="anim-rise flex items-center gap-2 font-display text-xl font-semibold"
          >
            <span className="grid size-8 place-items-center rounded-lg bg-[#0b3d2e] text-sm text-[#c9a24b]">
              {siteName.slice(0, 2).toUpperCase()}
            </span>
            {siteName}
          </Link>
          <nav className="hidden items-center gap-8 text-sm md:flex">
            {[
              ["#fitur", "Fitur"],
              ["#template", "Template"],
              ["#harga", "Harga"],
            ].map(([href, label]) => (
              <a
                key={href}
                href={href}
                className="relative opacity-70 transition-opacity hover:opacity-100 after:absolute after:-bottom-1 after:left-0 after:h-px after:w-0 after:bg-[#0b3d2e] after:transition-all hover:after:w-full"
              >
                {label}
              </a>
            ))}
          </nav>
          <div className="flex items-center gap-2">
            <Button variant="ghost" asChild>
              <Link href="/login">Masuk</Link>
            </Button>
            <Button className="sheen" asChild>
              <Link href="/register">Coba gratis</Link>
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1">
        <section className="relative overflow-hidden">
          <div className="anim-glow absolute -top-32 -right-24 size-96 rounded-full bg-[#0b3d2e]/10 blur-3xl" />
          <div
            className="anim-glow absolute -bottom-40 -left-24 size-96 rounded-full bg-[#c9a24b]/20 blur-3xl"
            style={{ animationDelay: "1.5s" }}
          />
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 opacity-[0.35]"
            style={{
              backgroundImage:
                "radial-gradient(circle at 1px 1px, rgba(11,61,46,0.12) 1px, transparent 0)",
              backgroundSize: "26px 26px",
              maskImage:
                "radial-gradient(120% 60% at 50% 0%, black 40%, transparent 100%)",
              WebkitMaskImage:
                "radial-gradient(120% 60% at 50% 0%, black 40%, transparent 100%)",
            }}
          />

          <div className="relative mx-auto grid w-full max-w-6xl gap-12 px-5 py-20 md:grid-cols-2 md:items-center md:py-28">
            <div>
              <span className="anim-rise inline-flex items-center gap-2 rounded-full border border-[#0b3d2e]/15 bg-white/60 px-4 py-1.5 text-xs font-medium tracking-wide text-[#0b3d2e] backdrop-blur">
                <BookHeart className="size-3.5" /> Undangan digital #1 untuk
                momen spesial
              </span>
              <h1
                className="anim-rise mt-6 font-display text-4xl leading-[1.1] tracking-tight sm:text-5xl md:text-6xl"
                style={{ animationDelay: "80ms" }}
              >
                Bagikan momen bahagia dengan{" "}
                <span className="relative inline-block">
                  <span className="text-[#0b3d2e]">
                    undangan yang berkesan
                  </span>
                  <svg
                    className="absolute -bottom-2 left-0 w-full"
                    viewBox="0 0 300 12"
                    fill="none"
                    aria-hidden
                  >
                    <path
                      d="M2 8C60 2 120 2 180 6C220 9 260 9 298 4"
                      stroke="#c9a24b"
                      strokeWidth="3"
                      strokeLinecap="round"
                    />
                  </svg>
                </span>
              </h1>
              <p
                className="anim-rise mt-6 max-w-lg text-base leading-relaxed opacity-70"
                style={{ animationDelay: "160ms" }}
              >
                {tagline}
              </p>
              <div
                className="anim-rise mt-8 flex flex-wrap gap-3"
                style={{ animationDelay: "240ms" }}
              >
                <Button size="lg" className="sheen group" asChild>
                  <Link href="/register">
                    Buat undangan sekarang
                    <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
                  </Link>
                </Button>
                <Button size="lg" variant="outline" asChild>
                  <Link href={sampleHref}>Lihat contoh</Link>
                </Button>
              </div>
              <div
                className="anim-rise mt-8 flex flex-wrap gap-x-6 gap-y-2 text-sm opacity-70"
                style={{ animationDelay: "320ms" }}
              >
                {["Gratis untuk mulai", "Tanpa aplikasi", "Siap dalam 5 menit"].map(
                  (item) => (
                    <span key={item} className="inline-flex items-center gap-2">
                      <Check className="size-4 text-[#0b3d2e]" /> {item}
                    </span>
                  ),
                )}
              </div>
            </div>

            <div className="relative mx-auto w-full max-w-sm">
              <div className="anim-float rotate-[2.5deg] rounded-[2rem] border border-black/5 bg-white p-3 shadow-2xl">
                <div className="relative aspect-[9/16] overflow-hidden rounded-[1.5rem]">
                  <LiveInvitationPreview
                    coupleTitle="Arya & Aisyah"
                    dateLabel="Sabtu, 12 Desember 2026"
                    subtitle="The Wedding Of"
                    quote="Dan di antara tanda-tanda kekuasaan-Nya, Dia menciptakan pasangan."
                    greeting="Dengan memohon rahmat Allah, kami mengundang Anda."
                    closing="Merupakan kebahagiaan bagi kami apabila Anda berkenan hadir."
                    coverPhoto="https://picsum.photos/seed/lvcover/400/400"
                    artworkCode={previewTemplates[0]?.code}
                    colors={previewColors}
                    fontDisplay={previewFont}
                    events={[
                      {
                        name: "Akad Nikah",
                        date: "Sabtu, 12 Desember 2026",
                        time: "09.00 - 11.00 WIB",
                        venue: "Masjid Agung",
                      },
                    ]}
                    photos={[
                      "https://picsum.photos/seed/lv1/400/520",
                      "https://picsum.photos/seed/lv2/400/520",
                      "https://picsum.photos/seed/lv3/400/520",
                    ]}
                    scroll
                  />
                </div>
              </div>

              <div
                className="anim-float absolute -bottom-6 -left-6 -rotate-6 rounded-2xl border border-black/5 bg-white p-3 shadow-xl"
                style={{ animationDelay: "0.8s" }}
              >
                <p className="text-[10px] uppercase tracking-wide opacity-60">
                  Konfirmasi
                </p>
                <p className="font-display text-lg">248 tamu hadir</p>
              </div>

              <div
                className="anim-float absolute -top-4 -right-4 rotate-6 rounded-2xl border border-black/5 bg-white px-3 py-2 shadow-xl"
                style={{ animationDelay: "1.6s" }}
              >
                <p className="flex items-center gap-1.5 text-xs font-medium">
                  <Sparkles className="size-3.5 text-[#c9a24b]" /> Dibuat AI
                </p>
              </div>
            </div>
          </div>

          <div className="relative flex justify-center pb-10">
            <span className="anim-float flex flex-col items-center gap-1 text-[11px] uppercase tracking-[0.25em] opacity-50">
              <MousePointerClick className="size-4" /> Gulir
            </span>
          </div>
        </section>

        <section id="fitur" className="mx-auto w-full max-w-6xl px-5 py-20">
          <Reveal>
            <div className="mx-auto max-w-2xl text-center">
              <span className="text-xs uppercase tracking-[0.35em] text-[#c9a24b]">
                Fitur
              </span>
              <h2 className="mt-3 font-display text-3xl sm:text-4xl">
                Semua yang Anda butuhkan
              </h2>
              <p className="mt-4 opacity-70">
                Dari membuat undangan hingga merekap kehadiran tamu — dalam satu
                dasbor yang rapi.
              </p>
            </div>
          </Reveal>
          <div className="stagger mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((feature) => (
              <div
                key={feature.title}
                className="group card-lift relative overflow-hidden rounded-2xl border border-black/5 bg-white p-6"
              >
                <span
                  aria-hidden
                  className="pointer-events-none absolute -top-16 -right-16 size-32 rounded-full bg-[#c9a24b]/15 opacity-0 blur-2xl transition-opacity duration-500 group-hover:opacity-100"
                />
                <div className="grid size-11 place-items-center rounded-xl bg-[#0b3d2e]/8 text-[#0b3d2e] transition-transform duration-500 group-hover:-translate-y-1 group-hover:scale-110 group-hover:bg-[#0b3d2e] group-hover:text-[#c9a24b]">
                  <feature.icon className="size-5" />
                </div>
                <h3 className="mt-4 font-display text-xl">{feature.title}</h3>
                <p className="mt-2 text-sm leading-relaxed opacity-70">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </section>

        {previewTemplates.length > 0 ? (
          <section id="template" className="relative overflow-hidden bg-white py-20">
            <div className="mx-auto w-full max-w-6xl px-5">
              <Reveal>
                <div className="mx-auto max-w-2xl text-center">
                  <span className="text-xs uppercase tracking-[0.35em] text-[#c9a24b]">
                    Template
                  </span>
                  <h2 className="mt-3 font-display text-3xl sm:text-4xl">
                    Pilih gaya Anda
                  </h2>
                  <p className="mt-4 opacity-70">
                    Setiap template dapat disesuaikan warna, font, dan bagiannya.
                  </p>
                </div>
              </Reveal>
              <div className="stagger mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {previewTemplates.map((template) => {
                  const config = normalizeTemplateConfig(template.config);
                  return (
                    <div
                      key={template.id}
                      className="card-lift group overflow-hidden rounded-2xl border border-black/5 bg-[#f7f3ea]"
                    >
                      <div className="relative aspect-[3/4] overflow-hidden">
                        {template.previewImage ? (
                          <Image
                            src={template.previewImage}
                            alt={`Artwork tema ${template.name}`}
                            fill
                            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                            className="object-cover transition-transform duration-500 group-hover:scale-105"
                          />
                        ) : (
                          <div
                            className="relative flex h-full flex-col items-center justify-center gap-2 p-6 text-center"
                            style={{
                              background: `linear-gradient(160deg, ${config.colors.primary}, ${config.colors.primary}dd)`,
                            }}
                          >
                            <div
                              aria-hidden
                              className="absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
                              style={{
                                background:
                                  "radial-gradient(circle at 50% 120%, rgba(255,255,255,0.25), transparent 60%)",
                              }}
                            />
                            <p
                              className="relative font-display text-2xl transition-transform duration-500 group-hover:-translate-y-1"
                              style={{ color: config.colors.accent }}
                            >
                              {template.name}
                            </p>
                            <p className="relative text-xs text-white/60">
                              {config.motif}
                            </p>
                          </div>
                        )}
                      </div>
                      <div className="flex items-center justify-between gap-3 p-4">
                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium">
                            {template.name}
                          </p>
                          <p className="truncate text-xs opacity-60">
                            {config.motif}
                          </p>
                        </div>
                        <div className="flex shrink-0 items-center gap-2">
                          <span
                            className={`rounded-full px-2.5 py-1 text-[11px] font-medium ${
                              template.isPremium
                                ? "bg-[#0b3d2e] text-[#c9a24b]"
                                : "bg-[#0b3d2e]/10 text-[#0b3d2e]"
                            }`}
                          >
                            {template.isPremium ? "Premium" : "Gratis"}
                          </span>
                          <span className="flex gap-1">
                            <span
                              className="size-4 rounded-full transition-transform duration-500 group-hover:scale-125"
                              style={{ background: config.colors.primary }}
                            />
                            <span
                              className="size-4 rounded-full transition-transform delay-75 duration-500 group-hover:scale-125"
                              style={{ background: config.colors.accent }}
                            />
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </section>
        ) : null}

        {plans.length > 0 ? (
          <section id="harga" className="mx-auto w-full max-w-6xl px-5 py-20">
            <Reveal>
              <div className="mx-auto max-w-2xl text-center">
                <span className="text-xs uppercase tracking-[0.35em] text-[#c9a24b]">
                  Harga
                </span>
                <h2 className="mt-3 font-display text-3xl sm:text-4xl">
                  Harga sederhana
                </h2>
                <p className="mt-4 opacity-70">
                  Mulai gratis, tingkatkan saat Anda butuh lebih banyak.
                </p>
              </div>
            </Reveal>
            <div className="stagger mt-12 grid gap-6 md:grid-cols-3">
              {plans.map((plan) => {
                const featured = plan.code === "premium_yearly";
                return (
                  <div
                    key={plan.id}
                    className={`card-lift relative flex flex-col rounded-2xl border p-7 ${
                      featured
                        ? "border-[#0b3d2e] bg-[#0b3d2e] text-white shadow-xl"
                        : "border-black/5 bg-white"
                    }`}
                  >
                    {featured ? (
                      <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-[#c9a24b] px-3 py-1 text-[11px] font-medium text-[#0b3d2e]">
                        Paling populer
                      </span>
                    ) : null}
                    <h3 className="font-display text-2xl">{plan.name}</h3>
                    <p
                      className={`mt-1 text-sm ${
                        featured ? "text-white/70" : "opacity-60"
                      }`}
                    >
                      {plan.description}
                    </p>
                    <p className="mt-5 font-display text-3xl">
                      {plan.price === 0 ? "Gratis" : formatCurrency(plan.price)}
                    </p>
                    <ul className="mt-6 flex-1 space-y-2 text-sm">
                      <li className="flex items-center gap-2">
                        <Check className="size-4" /> {plan.maxInvitations}{" "}
                        undangan
                      </li>
                      <li className="flex items-center gap-2">
                        <Check className="size-4" /> {plan.maxGuests} tamu
                      </li>
                      <li className="flex items-center gap-2">
                        <Check className="size-4" /> {plan.maxGallery} foto galeri
                      </li>
                      {plan.features.map((feature) => (
                        <li key={feature} className="flex items-center gap-2">
                          <Check className="size-4" /> {feature}
                        </li>
                      ))}
                    </ul>
                    <Button
                      className="sheen mt-7"
                      variant={featured ? "secondary" : "default"}
                      asChild
                    >
                      <Link href="/register">Pilih paket</Link>
                    </Button>
                  </div>
                );
              })}
            </div>
          </section>
        ) : null}

        <section className="mx-auto w-full max-w-6xl px-5 pb-24">
          <Reveal>
            <div className="relative overflow-hidden rounded-3xl bg-[#0b3d2e] px-8 py-14 text-center text-white">
              <div className="anim-glow absolute -top-20 -right-10 size-64 rounded-full bg-[#c9a24b]/25 blur-3xl" />
              <div
                className="anim-glow absolute -bottom-24 -left-10 size-64 rounded-full bg-[#c9a24b]/15 blur-3xl"
                style={{ animationDelay: "1.2s" }}
              />
              <h2 className="relative font-display text-3xl sm:text-4xl">
                Siap membuat undangan Anda?
              </h2>
              <p className="relative mt-4 text-white/70">
                Buat akun gratis dan terbitkan undangan pertama hari ini.
              </p>
              <div className="relative mt-8 flex flex-wrap justify-center gap-3">
                <Button size="lg" variant="secondary" className="sheen group" asChild>
                  <Link href="/register">
                    Mulai gratis
                    <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
                  </Link>
                </Button>
                {whatsapp ? (
                  <Button
                    size="lg"
                    variant="outline"
                    className="border-white/30 bg-transparent text-white hover:bg-white/10"
                    asChild
                  >
                    <a
                      href={`https://wa.me/${whatsapp.replace(/\D/g, "")}`}
                      target="_blank"
                      rel="noreferrer"
                    >
                      Hubungi kami
                    </a>
                  </Button>
                ) : null}
              </div>
            </div>
          </Reveal>
        </section>
      </main>

      <footer className="border-t border-black/5 bg-white">
        <div className="mx-auto flex w-full max-w-6xl flex-col items-center justify-between gap-4 px-5 py-8 text-sm sm:flex-row">
          <p className="opacity-60">
            {settings[SITE_SETTINGS_KEYS.footerText] ??
              `© ${new Date().getFullYear()} ${siteName}`}
          </p>
          <div className="flex gap-6 opacity-60">
            <Link href="/login" className="transition-opacity hover:opacity-100">
              Masuk
            </Link>
            <Link href="/register" className="transition-opacity hover:opacity-100">
              Daftar
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
