import { notFound } from "next/navigation";
import Image from "next/image";
import { CalendarDays, Gift, Heart, MapPin, Quote, Video } from "lucide-react";

import { CopyButton } from "@/components/invitation/copy-button";
import { Countdown } from "@/components/invitation/countdown";
import { CustomInvitation } from "@/components/invitation/custom-invitation";
import { GalleryViewer } from "@/components/invitation/gallery-viewer";
import { InvitationScreen } from "@/components/invitation/invitation-screen";
import { Parallax } from "@/components/invitation/parallax";
import { OrnamentDivider } from "@/components/invitation/ornaments";
import { Reveal } from "@/components/invitation/reveal";
import { RsvpForm } from "@/components/invitation/rsvp-form";
import { ScrollAnimate } from "@/components/invitation/scroll-animate";
import { WishForm } from "@/components/invitation/wish-form";
import { SITE_SETTINGS_KEYS, GIFT_TYPE_LABELS } from "@/lib/constants";
import { getEffectiveRole } from "@/lib/auth";
import type { CustomTemplateData } from "@/lib/custom-template";
import {
  combineWIBDateAndTime,
  formatDateID,
  formatTimeRangeWIB,
  toWIBDateInput,
} from "@/lib/time";
import { getGuestByCode, getPublicInvitation } from "@/lib/queries";
import { getSettings } from "@/lib/settings";
import {
  googleMapsDirectionsUrl,
  googleMapsEmbedUrl,
  mapsQuery,
  resolveLatLng,
} from "@/lib/maps";
import { normalizeTemplateConfig, resolveOrnamentKey } from "@/lib/template-config";

function youtubeEmbedUrl(raw?: string | null) {
  if (!raw) return null;
  try {
    const url = new URL(raw);
    if (url.hostname.includes("youtu.be")) {
      const id = url.pathname.split("/").filter(Boolean)[0];
      return id ? `https://www.youtube.com/embed/${id}` : null;
    }
    if (url.hostname.includes("youtube.com")) {
      const id =
        url.searchParams.get("v") ??
        (url.pathname.startsWith("/live/") || url.pathname.startsWith("/embed/")
          ? url.pathname.split("/").filter(Boolean).pop()
          : null);
      return id ? `https://www.youtube.com/embed/${id}` : null;
    }
    return null;
  } catch {
    return null;
  }
}

function SectionTitle({
  kicker,
  title,
  fontDisplay,
  fontScript,
  fontAccent,
  script = false,
  layout = "classic",
  ornamentKey = "daun-emas",
}: {
  kicker?: string;
  title: string;
  fontDisplay?: string;
  fontScript?: string;
  fontAccent?: string;
  script?: boolean;
  layout?: string;
  ornamentKey?: string;
}) {
  const isModern = layout === "modern";
  const isMinimal = layout === "minimal";
  const ceremonial = Boolean(fontScript || fontAccent);
  const useScript = ceremonial && script;
  return (
    <ScrollAnimate animation="fadeInUp" delay={80} duration={0.9}>
      <div className={isModern ? "text-left" : "text-center"}>
      {kicker ? (
        <span
          className={
            ceremonial
              ? "inv-kicker text-xs tracking-[0.2em] normal-case"
              : "inv-kicker text-[11px] uppercase tracking-[0.35em]"
          }
          style={{
            color: "var(--tpl-accent)",
            fontFamily: fontAccent ? `'${fontAccent}', serif` : undefined,
          }}
        >
          {kicker}
        </span>
      ) : null}
      {isMinimal ? (
        <span
          aria-hidden
          className="my-3 block h-px w-12 opacity-40"
          style={{ background: "var(--tpl-accent)" }}
        />
      ) : isModern ? (
        <span
          aria-hidden
          className="my-3 block h-0.5 w-10"
          style={{ background: "var(--tpl-accent)" }}
        />
      ) : (
        <OrnamentDivider
          motif={ornamentKey}
          color="var(--tpl-accent)"
          className="my-2"
        />
      )}
      <h2
        className={
          useScript
            ? "text-4xl leading-[1.05] sm:text-5xl"
            : isMinimal
              ? "font-display text-base uppercase tracking-[0.3em]"
              : isModern
                ? "font-body text-2xl font-semibold tracking-tight sm:text-3xl"
                : ceremonial
                  ? "font-display text-2xl sm:text-3xl"
                  : "inv-title-shine font-display text-2xl sm:text-3xl"
        }
        style={
          useScript
            ? {
                fontFamily: `'${fontScript}', cursive`,
                color: "var(--tpl-text)",
              }
            : isModern
              ? undefined
              : {
                  fontFamily: `'${fontDisplay}', serif`,
                  color: ceremonial ? "var(--tpl-text)" : undefined,
                }
        }
      >
        {title}
      </h2>
      </div>
    </ScrollAnimate>
  );
}

export default async function PublicInvitationPage(
  props: PageProps<"/u/[slug]">,
) {
  const { slug } = await props.params;
  const search = await props.searchParams;
  const codeParam = typeof search.to === "string" ? search.to : undefined;

  const data = await getPublicInvitation(slug);
  if (!data) notFound();

  const {
    invitation,
    template,
    owner,
    events,
    stories,
    galleries,
    gifts,
    wishes,
    albums,
  } = data;

  const settings = await getSettings();
  const config = normalizeTemplateConfig(
    invitation.customConfig ?? template?.config,
  );
  const layout = config.layout;
  const coverStyle = config.coverStyle;
  const frameStyle = config.frameStyle;
  const motifKey = resolveOrnamentKey(config.ornament, config.motif);
  const colors = {
    ...config.colors,
    primary: invitation.themeColor || config.colors.primary,
    accent: invitation.accentColor || config.colors.accent,
  };
  const colorLuminance = (hex: string) => {
    const c = (hex || "#ffffff").replace("#", "");
    const r = parseInt(c.slice(0, 2), 16) / 255;
    const g = parseInt(c.slice(2, 4), 16) / 255;
    const b = parseInt(c.slice(4, 6), 16) / 255;
    const lin = (v: number) =>
      v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
    return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
  };
  const darkBg = Boolean(invitation.backgroundImage)
    ? true
    : colorLuminance(colors.background) < 0.45;

  const guest = codeParam ? await getGuestByCode(codeParam) : null;
  const validGuest =
    guest && guest.invitationId === invitation.id ? guest : null;
  // `?to=` tetap mendukung kode tamu; jika bukan kode terdaftar, tampilkan
  // sebagai nama tamu saja agar tautan gaya `?to=Nama+Tamu` tetap bekerja.
  const guestLabel =
    validGuest?.name ??
    (codeParam ? codeParam.trim().slice(0, 80) || undefined : undefined);

  const ownerRole = getEffectiveRole(owner);
  const showWatermark =
    ownerRole === "free" &&
    settings[SITE_SETTINGS_KEYS.watermarkEnabled] === "true";
  const brand =
    settings[SITE_SETTINGS_KEYS.invitationBrandText] ||
    settings[SITE_SETTINGS_KEYS.siteName] ||
    "UndanganKita";

  const mapsApiKey = settings[SITE_SETTINGS_KEYS.mapsApiKey] || "";
  const mainCoords = resolveLatLng(
    invitation.latitude,
    invitation.longitude,
    invitation.mapsUrl,
  );
  const mainQuery = mapsQuery([invitation.locationName, invitation.address]);
  const mainEmbedUrl = googleMapsEmbedUrl({
    apiKey: mapsApiKey,
    lat: mainCoords?.lat,
    lng: mainCoords?.lng,
    query: mainQuery,
  });
  const mainDirectionsUrl =
    googleMapsDirectionsUrl({
      lat: mainCoords?.lat,
      lng: mainCoords?.lng,
      query: mainQuery,
    }) ?? invitation.mapsUrl;

  const coupleTitle =
    invitation.brideName && invitation.groomName
      ? `${invitation.brideName} & ${invitation.groomName}`
      : invitation.brideName || invitation.groomName || invitation.title;

  const dateLabel = invitation.eventDate
    ? formatDateID(invitation.eventDate)
    : "Segera";
  const liveEmbed = youtubeEmbedUrl(invitation.liveStreamUrl);

  const fontFamilies = Array.from(
    new Set(
      [
        config.fontDisplay
          ? `${config.fontDisplay.replace(/\s+/g, "+")}:wght@400;500;600;700`
          : null,
        config.fontBody
          ? `${config.fontBody.replace(/\s+/g, "+")}:wght@300;400;500;600`
          : null,
        config.fontScript
          ? `${config.fontScript.replace(/\s+/g, "+")}:wght@400`
          : null,
        config.fontAccent
          ? `${config.fontAccent.replace(/\s+/g, "+")}:wght@400;500;600`
          : null,
      ].filter((family): family is string => Boolean(family)),
    ),
  ).join("&family=");

  const flatGallery = galleries.filter((photo) => !photo.albumId);
  const sections = config.sections;
  const hasCustom = Boolean(config.customHtml?.trim());

  const customData: CustomTemplateData = {
    couple: coupleTitle,
    groom: invitation.groomName ?? "",
    groomFull: invitation.groomFullName ?? invitation.groomName ?? "",
    bride: invitation.brideName ?? "",
    brideFull: invitation.brideFullName ?? invitation.brideName ?? "",
    date: dateLabel,
    isoDate: invitation.eventDate ? invitation.eventDate.toISOString() : "",
    quote: invitation.quote ?? "",
    quoteSource: invitation.quoteSource ?? "",
    greeting: invitation.greeting ?? "",
    closing: invitation.closing ?? "",
    coverPhoto: invitation.coverPhoto ?? invitation.coverImage ?? "",
    colors,
    events: events.map((event) => ({
      name: event.name,
      date: formatDateID(event.date),
      time: event.startTime
        ? formatTimeRangeWIB(
            combineWIBDateAndTime(
              toWIBDateInput(event.date),
              event.startTime,
            ),
            event.endTime
              ? combineWIBDateAndTime(
                  toWIBDateInput(event.date),
                  event.endTime,
                )
              : null,
          )
        : "",
      venue: event.venue ?? "",
      address: event.address ?? "",
      mapsUrl: event.mapsUrl,
    })),
    gallery: galleries.map((photo) => ({
      imageUrl: photo.imageUrl,
      caption: photo.caption,
    })),
  };

  const navItems = hasCustom
    ? [
        { id: "top", label: "Awal" },
        { id: "rsvp", label: "RSVP" },
        { id: "wishes", label: "Ucapan" },
      ]
    : [
        { id: "couple", label: "Mempelai", enabled: sections.includes("couple") },
        {
          id: "countdown",
          label: "Hitung Hari",
          enabled: sections.includes("countdown") && Boolean(invitation.eventDate),
        },
        {
          id: "events",
          label: "Acara",
          enabled: sections.includes("events") && events.length > 0,
        },
        {
          id: "live",
          label: "Live",
          enabled: Boolean(invitation.liveStreamUrl),
        },
        {
          id: "gallery",
          label: "Galeri",
          enabled:
            (sections.includes("gallery") && flatGallery.length > 0) ||
            (sections.includes("album") && albums.length > 0),
        },
        {
          id: "gift",
          label: "Hadiah",
          enabled: sections.includes("gift") && gifts.length > 0,
        },
        { id: "rsvp", label: "RSVP", enabled: sections.includes("rsvp") },
        { id: "wishes", label: "Ucapan", enabled: sections.includes("wishes") },
      ]
        .filter((item) => item.enabled)
        .map(({ id, label }) => ({ id, label }));

  const plate = "inv-plate p-6 sm:p-7";
  const coupleShape =
    frameStyle === "square"
      ? "rounded-none"
      : frameStyle === "arch"
        ? "rounded-t-[999px] rounded-b-2xl"
        : "rounded-[2rem]";
  const sectionTitleProps = {
    fontDisplay: config.fontDisplay,
    fontScript: config.fontScript,
    fontAccent: config.fontAccent,
    layout,
    ornamentKey: motifKey,
  };

  const interactiveSections = (
    <>
      {sections.includes("rsvp") ? (
        <Reveal>
          <section id="rsvp" className="space-y-6">
            <SectionTitle
              kicker="Mohon konfirmasi"
              title="Konfirmasi Kehadiran"
              {...sectionTitleProps}
            />
            <ScrollAnimate animation="fadeInUp" delay={100} className={plate}>
              <RsvpForm
                invitationId={invitation.id}
                guestId={validGuest?.id}
                defaultName={validGuest?.name}
              />
            </ScrollAnimate>
          </section>
        </Reveal>
      ) : null}

      {sections.includes("wishes") ? (
        <Reveal>
          <section id="wishes" className="space-y-6">
            <SectionTitle
              kicker="Doa & harapan"
              title="Ucapan"
              script
              {...sectionTitleProps}
            />
            <ScrollAnimate animation="fadeInUp" delay={100} className={plate}>
              <WishForm
                invitationId={invitation.id}
                guestId={validGuest?.id}
                defaultName={validGuest?.name}
              />
            </ScrollAnimate>
            <div className="space-y-3">
              {wishes.map((wish, index) => (
                <ScrollAnimate
                  key={wish.id}
                  animation="fadeInUp"
                  delay={index * 80}
                  className="inv-plate-soft p-4"
                >
                  <p className="flex items-center gap-2 text-sm font-medium">
                    <Heart className="size-3.5" style={{ color: colors.accent }} />
                    {wish.name}
                  </p>
                  <p className="mt-1 text-sm opacity-80">{wish.message}</p>
                </ScrollAnimate>
              ))}
            </div>
          </section>
        </Reveal>
      ) : null}
    </>
  );

  return (
    <>
      <link
        rel="stylesheet"
        href={`https://fonts.googleapis.com/css2?family=${fontFamilies}&display=swap`}
      />
      <div
        className="font-body"
        style={
          {
            "--tpl-primary": colors.primary,
            "--tpl-accent": colors.accent,
            "--tpl-background": colors.background,
            "--tpl-surface": colors.surface,
            "--tpl-text": colors.text,
            "--tpl-font-script": config.fontScript
              ? `'${config.fontScript}', cursive`
              : "inherit",
            "--tpl-font-accent": config.fontAccent
              ? `'${config.fontAccent}', serif`
              : "inherit",
            "--tpl-deep": "#5f160c",
            fontFamily: `'${config.fontBody}', ui-sans-serif, system-ui, sans-serif`,
          } as React.CSSProperties
        }
      >
        <InvitationScreen
          slug={slug}
          guestCode={validGuest?.code}
          guestName={guestLabel}
          coverImage={invitation.coverImage}
          coverPhoto={invitation.coverPhoto}
          title={coupleTitle}
          subtitle="Undangan Pernikahan"
          dateLabel={dateLabel}
          musicUrl={invitation.musicUrl}
          primary={colors.primary}
          accent={colors.accent}
          brand={brand}
          backgroundImage={invitation.backgroundImage}
          backgroundOverlay={invitation.backgroundOverlay}
          backgroundBlur={invitation.backgroundBlur}
          darkBg={darkBg}
          watermark={showWatermark}
          watermarkText={settings[SITE_SETTINGS_KEYS.watermarkText] || brand}
          navItems={navItems}
          layout={layout}
          coverStyle={coverStyle}
          frameStyle={frameStyle}
          motifKey={motifKey}
        >
          <div className="space-y-14">
            {hasCustom ? (
              <div id="top">
                <CustomInvitation config={config} data={customData} />
              </div>
            ) : (
              <>
                {sections.includes("quote") && invitation.quote ? (
                  <Reveal animation="zoomIn">
                    <section className="inv-plate p-7 text-center sm:p-8">
                      <Quote
                        aria-hidden
                        className="mx-auto size-8 opacity-25"
                        style={{ color: colors.accent }}
                      />
                      <p
                        className="mx-auto mt-5 max-w-2xl font-display text-xl leading-relaxed text-balance sm:text-2xl"
                        style={{ fontFamily: `'${config.fontDisplay}', serif` }}
                      >
                        “{invitation.quote}”
                      </p>
                      {invitation.quoteSource ? (
                        <>
                          <OrnamentDivider
                            motif={motifKey}
                            color={colors.accent}
                            className="mt-5"
                          />
                          <span
                            className="mt-3 block text-xs tracking-[0.3em] uppercase"
                            style={{ color: colors.accent }}
                          >
                            {invitation.quoteSource}
                          </span>
                        </>
                      ) : (
                        <OrnamentDivider
                          motif={motifKey}
                          color={colors.accent}
                          className="mt-5"
                        />
                      )}
                    </section>
                  </Reveal>
                ) : null}

                {sections.includes("couple") ? (
                  <Reveal>
                    <section id="couple" className="inv-plate space-y-8 p-7 text-center sm:p-8">
                      <SectionTitle
                        kicker="Dengan memohon rahmat Allah"
                        title="Mempelai"
                        {...sectionTitleProps}
                      />
                      {invitation.greeting ? (
                        <p className="mx-auto max-w-xl text-sm leading-relaxed opacity-80">
                          {invitation.greeting}
                        </p>
                      ) : null}
                      <div className="relative grid gap-10 sm:grid-cols-2">
                        <span
                          aria-hidden
                          className="pointer-events-none absolute left-1/2 top-24 hidden -translate-x-1/2 font-display text-5xl opacity-30 sm:block"
                          style={{ color: colors.accent }}
                        >
                          &amp;
                        </span>
                        {[invitation.brideName, invitation.groomName].map(
                          (name, index) =>
                            name ? (
                              <ScrollAnimate
                                key={index}
                                animation="zoomIn"
                                delay={index * 140}
                                className="group relative flex flex-col items-center"
                              >
                                <Parallax
                                  speed={index === 0 ? 0.05 : 0.09}
                                  className="inline-block"
                                >
                                  <div className="relative grid place-items-center">
                                    <span
                                      aria-hidden
                                      className="inv-spin-ring pointer-events-none absolute -inset-3 rounded-full opacity-0 transition-opacity duration-700 group-hover:opacity-70"
                                      style={{
                                        background: `conic-gradient(from 0deg, transparent 0deg, ${colors.accent} 90deg, transparent 210deg)`,
                                        filter: "blur(1px)",
                                      }}
                                    />
                                    {index === 0 && invitation.bridePhoto ? (
                                      <Image
                                        src={invitation.bridePhoto}
                                        alt={invitation.brideName ?? "Mempelai"}
                                        width={260}
                                        height={340}
                                        unoptimized
                                        className={`${coupleShape} card-lift size-40 object-cover sm:size-44`}
                                      />
                                    ) : index === 1 && invitation.groomPhoto ? (
                                      <Image
                                        src={invitation.groomPhoto}
                                        alt={invitation.groomName ?? "Mempelai"}
                                        width={260}
                                        height={340}
                                        unoptimized
                                        className={`${coupleShape} card-lift size-40 object-cover sm:size-44`}
                                      />
                                    ) : (
                                      <div
                                        className={`${coupleShape} grid size-40 place-items-center sm:size-44`}
                                        style={{
                                          background: `color-mix(in srgb, ${colors.accent} 18%, var(--tpl-surface))`,
                                        }}
                                      >
                                        <span
                                          className="font-display text-3xl"
                                          style={{ color: colors.accent }}
                                        >
                                          {name.charAt(0)}
                                        </span>
                                      </div>
                                    )}
                                  </div>
                                </Parallax>
                                <span className="inv-ornament mt-6 w-full max-w-[11rem]">
                                  <Heart
                                    className="inv-heartbeat size-3.5"
                                    style={{ color: colors.accent }}
                                  />
                                </span>
                                <h3
                                  className="inv-title-shine mt-1 max-w-full font-display text-2xl text-balance break-words sm:text-3xl"
                                  style={{ fontFamily: `'${config.fontDisplay}', serif` }}
                                >
                                  {index === 0
                                    ? invitation.brideFullName ?? invitation.brideName
                                    : invitation.groomFullName ?? invitation.groomName}
                                </h3>
                                <p className="mt-2 text-sm opacity-70">
                                  {index === 0
                                    ? invitation.brideParents ?? invitation.brideOrder
                                    : invitation.groomParents ?? invitation.groomOrder}
                                </p>
                                {index === 0 && invitation.brideInstagram ? (
                                  <a
                                    href={`https://instagram.com/${invitation.brideInstagram}`}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="mt-1 text-sm"
                                    style={{ color: colors.accent }}
                                  >
                                    @{invitation.brideInstagram}
                                  </a>
                                ) : null}
                                {index === 1 && invitation.groomInstagram ? (
                                  <a
                                    href={`https://instagram.com/${invitation.groomInstagram}`}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="mt-1 text-sm"
                                    style={{ color: colors.accent }}
                                  >
                                    @{invitation.groomInstagram}
                                  </a>
                                ) : null}
                              </ScrollAnimate>
                            ) : null,
                        )}
                      </div>
                    </section>
                  </Reveal>
                ) : null}

                {sections.includes("countdown") && invitation.eventDate ? (
                  <Reveal>
                    <section
                      id="countdown"
                      className="inv-plate space-y-6 p-7 text-center sm:p-8"
                    >
                      <SectionTitle
                        kicker="Menuju hari bahagia"
                        title="Hitung Hari"
                        {...sectionTitleProps}
                      />
                      <ScrollAnimate animation="zoomIn" duration={0.9}>
                        <Countdown target={invitation.eventDate.toISOString()} />
                      </ScrollAnimate>
                    </section>
                  </Reveal>
                ) : null}

                {sections.includes("events") && events.length > 0 ? (
                  <Reveal>
                    <section id="events" className="inv-plate space-y-6 p-6 sm:p-7">
                      <SectionTitle
                        kicker="Rangkaian acara"
                        title="Waktu & Tempat"
                        {...sectionTitleProps}
                      />
                      <div className="grid gap-5 sm:grid-cols-2">
                        {events.map((event, index) => {
                          const coords = resolveLatLng(
                            event.latitude,
                            event.longitude,
                            event.mapsUrl,
                          );
                          const query = mapsQuery([event.venue, event.address]);
                          const embedUrl = googleMapsEmbedUrl({
                            apiKey: mapsApiKey,
                            lat: coords?.lat,
                            lng: coords?.lng,
                            query,
                          });
                          const directionsUrl =
                            googleMapsDirectionsUrl({
                              lat: coords?.lat,
                              lng: coords?.lng,
                              query,
                            }) ?? event.mapsUrl;
                          return (
                            <ScrollAnimate
                              key={event.id}
                              animation="fadeInUp"
                              delay={index * 110}
                              className="inv-plate-soft card-lift p-5"
                            >
                              <p className="text-center font-display text-xl">
                                {event.name}
                              </p>
                              <div
                                className="my-3 h-px w-full"
                                style={{
                                  background: `color-mix(in srgb, ${colors.accent} 45%, transparent)`,
                                }}
                              />
                              <p className="flex items-center gap-2 text-sm opacity-80">
                                <CalendarDays className="size-4" style={{ color: colors.accent }} />
                                {formatDateID(event.date)}
                              </p>
                              <p className="mt-1 text-sm opacity-80">
                                {event.startTime
                                  ? formatTimeRangeWIB(
                                      combineWIBDateAndTime(
                                        toWIBDateInput(event.date),
                                        event.startTime,
                                      ),
                                      event.endTime
                                        ? combineWIBDateAndTime(
                                            toWIBDateInput(event.date),
                                            event.endTime,
                                          )
                                        : null,
                                    )
                                  : null}
                              </p>
                              <p className="mt-2 flex items-start gap-2 text-sm opacity-80">
                                <MapPin className="mt-0.5 size-4" style={{ color: colors.accent }} />
                                <span>
                                  {event.venue}
                                  {event.address ? `, ${event.address}` : ""}
                                </span>
                              </p>
                              {embedUrl ? (
                                <iframe
                                  src={embedUrl}
                                  title={`Peta ${event.name}`}
                                  loading="lazy"
                                  allowFullScreen
                                  referrerPolicy="no-referrer-when-downgrade"
                                  className="mt-4 h-52 w-full rounded-2xl border"
                                  style={{
                                    borderColor: `color-mix(in srgb, ${colors.text} 12%, transparent)`,
                                  }}
                                />
                              ) : null}
                              {directionsUrl ? (
                                <a
                                  href={directionsUrl}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="mt-4 inline-flex items-center gap-1 rounded-full px-4 py-2 text-xs font-medium"
                                  style={{ background: colors.accent, color: colors.primary }}
                                >
                                  <MapPin className="size-3.5" /> Buka di Google Maps
                                </a>
                              ) : null}
                            </ScrollAnimate>
                          );
                        })}
                      </div>

                      {mainEmbedUrl && !events.some((event) =>
                        resolveLatLng(event.latitude, event.longitude, event.mapsUrl) ||
                        mapsQuery([event.venue, event.address]),
                      ) ? (
                        <div className="inv-plate-soft card-lift p-5">
                          <p className="flex items-center gap-2 font-display text-xl">
                            <MapPin className="size-5" style={{ color: colors.accent }} />
                            {invitation.locationName ?? "Lokasi Acara"}
                          </p>
                          {invitation.address ? (
                            <p className="mt-2 text-sm opacity-80">{invitation.address}</p>
                          ) : null}
                          <iframe
                            src={mainEmbedUrl}
                            title="Peta lokasi acara"
                            loading="lazy"
                            allowFullScreen
                            referrerPolicy="no-referrer-when-downgrade"
                            className="mt-4 h-64 w-full rounded-2xl border"
                            style={{
                              borderColor: `color-mix(in srgb, ${colors.text} 12%, transparent)`,
                            }}
                          />
                          {mainDirectionsUrl ? (
                            <a
                              href={mainDirectionsUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="mt-4 inline-flex items-center gap-1 rounded-full px-4 py-2 text-xs font-medium"
                              style={{ background: colors.accent, color: colors.primary }}
                            >
                              <MapPin className="size-3.5" /> Buka di Google Maps
                            </a>
                          ) : null}
                        </div>
                      ) : null}
                    </section>
                  </Reveal>
                ) : null}

                {invitation.liveStreamUrl ? (
                  <Reveal animation="fadeInUp">
                    <section id="live" className="inv-plate space-y-6 p-6 sm:p-7">
                      <SectionTitle
                        kicker="Saksikan dari mana saja"
                        title="Live Streaming"
                        {...sectionTitleProps}
                      />
                      <ScrollAnimate
                        animation="zoomIn"
                        delay={80}
                        className="inv-plate-soft overflow-hidden p-4"
                      >
                        {liveEmbed ? (
                          <div
                            className="overflow-hidden rounded-xl border"
                            style={{
                              borderColor: `color-mix(in srgb, ${colors.accent} 35%, transparent)`,
                            }}
                          >
                            <iframe
                              src={liveEmbed}
                              title="Live streaming pernikahan"
                              loading="lazy"
                              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                              allowFullScreen
                              className="aspect-video w-full"
                            />
                          </div>
                        ) : null}
                        <a
                          href={invitation.liveStreamUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="mt-4 inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-medium"
                          style={{
                            background: colors.accent,
                            color: colors.primary,
                          }}
                        >
                          <Video className="size-4" /> Buka Live Streaming
                        </a>
                        <p className="mt-3 text-xs opacity-60">
                          Kami menantikan kehadiran Anda secara langsung maupun
                          daring.
                        </p>
                      </ScrollAnimate>
                    </section>
                  </Reveal>
                ) : null}

                {sections.includes("story") && stories.length > 0 ? (
                  <Reveal>
                    <section id="story" className="inv-plate space-y-6 p-7 sm:p-8">
                      <SectionTitle
                        kicker="Perjalanan kami"
                        title="Cerita Cinta"
                        script
                        {...sectionTitleProps}
                      />
                      <div
                        className="relative ml-2 space-y-8 border-l pl-7"
                        style={{
                          borderColor: `color-mix(in srgb, ${colors.accent} 40%, transparent)`,
                        }}
                      >
                        {stories.map((story, index) => (
                          <ScrollAnimate
                            key={story.id}
                            animation="fadeInRight"
                            delay={index * 100}
                            className="relative"
                          >
                            <span
                              className="absolute top-1.5 -left-[36px] size-3 rounded-full"
                              style={{
                                background: colors.accent,
                                boxShadow: `0 0 0 4px color-mix(in srgb, ${colors.accent} 18%, transparent)`,
                              }}
                            />
                            <p
                              className="text-xs tracking-[0.25em] uppercase"
                              style={{ color: colors.accent }}
                            >
                              {formatDateID(story.storyDate)}
                            </p>
                            <p className="mt-1 font-display text-lg">{story.title}</p>
                            <p className="mt-1 text-sm leading-relaxed opacity-80">
                              {story.description}
                            </p>
                          </ScrollAnimate>
                        ))}
                      </div>
                    </section>
                  </Reveal>
                ) : null}

                {sections.includes("gallery") && flatGallery.length > 0 ? (
                  <Reveal>
                    <section id="gallery" className="inv-plate space-y-6 p-6 sm:p-7">
                      <SectionTitle
                        kicker="Momen kebahagiaan"
                        title="Galeri"
                        script
                        {...sectionTitleProps}
                      />
                      <ScrollAnimate animation="zoomIn" duration={0.9}>
                        <GalleryViewer
                          photos={flatGallery.map((photo) => ({
                            id: photo.id,
                            imageUrl: photo.imageUrl,
                            caption: photo.caption,
                          }))}
                          frameStyle={frameStyle}
                        />
                      </ScrollAnimate>
                    </section>
                  </Reveal>
                ) : null}

                {sections.includes("album") && albums.length > 0
                  ? albums.map((album) => {
                      const photos = galleries.filter(
                        (photo) => photo.albumId === album.id,
                      );
                      if (photos.length === 0) return null;
                      return (
                        <Reveal key={album.id}>
                          <section className="inv-plate space-y-6 p-6 sm:p-7">
                            <SectionTitle
                              kicker="Album"
                              title={album.name}
                              script
                              {...sectionTitleProps}
                            />
                            {album.description ? (
                              <p className="-mt-3 text-center text-sm opacity-70">
                                {album.description}
                              </p>
                            ) : null}
                            <ScrollAnimate animation="zoomIn" duration={0.9}>
                              <GalleryViewer
                                layout="album"
                                photos={photos.map((photo) => ({
                                  id: photo.id,
                                  imageUrl: photo.imageUrl,
                                  caption: photo.caption,
                                }))}
                                frameStyle={frameStyle}
                              />
                            </ScrollAnimate>
                          </section>
                        </Reveal>
                      );
                    })
                  : null}

                {sections.includes("gift") && gifts.length > 0 ? (
                  <Reveal>
                    <section id="gift" className="inv-plate space-y-6 p-6 sm:p-7">
                      <SectionTitle
                        kicker="Tanda kasih"
                        title="Kirim Hadiah"
                        script
                        {...sectionTitleProps}
                      />
                      <div className="grid gap-5 sm:grid-cols-2">
                        {gifts.map((gift, index) => (
                          <ScrollAnimate
                            key={gift.id}
                            animation="fadeInUp"
                            delay={index * 110}
                            className="inv-plate-soft card-lift p-5"
                          >
                            <span
                              className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-medium tracking-wide uppercase"
                              style={{
                                background: `color-mix(in srgb, ${colors.accent} 18%, transparent)`,
                                color: colors.accent,
                              }}
                            >
                              <Gift className="size-3.5" />
                              {GIFT_TYPE_LABELS[gift.type]}
                            </span>
                            <p className="mt-3 font-display text-lg">
                              {gift.provider ?? gift.accountName}
                            </p>
                            {gift.accountNumber ? (
                              <div className="mt-2 flex items-center gap-2">
                                <span className="font-mono text-sm">
                                  {gift.accountNumber}
                                </span>
                                <CopyButton value={gift.accountNumber} />
                              </div>
                            ) : null}
                            {gift.address ? (
                              <div className="mt-2 flex items-start gap-2">
                                <span className="text-sm opacity-80">{gift.address}</span>
                                <CopyButton value={gift.address} />
                              </div>
                            ) : null}
                            {gift.accountName && gift.accountNumber ? (
                              <p className="mt-1 text-sm opacity-70">
                                a.n. {gift.accountName}
                              </p>
                            ) : null}
                          </ScrollAnimate>
                        ))}
                      </div>
                    </section>
                  </Reveal>
                ) : null}
              </>
            )}

            {interactiveSections}

            {invitation.closing ? (
              <Reveal>
                <section className="inv-plate p-7 text-center sm:p-8">
                  {config.fontScript ? (
                    <>
                      <OrnamentDivider motif={motifKey} color={colors.accent} />
                      <p
                        className="mt-2 text-4xl leading-none sm:text-5xl"
                        style={{
                          fontFamily: `'${config.fontScript}', cursive`,
                          color: "var(--tpl-text)",
                        }}
                      >
                        Terima Kasih
                      </p>
                      <p className="mt-4 mx-auto max-w-2xl text-sm leading-relaxed opacity-80">
                        {invitation.closing}
                      </p>
                      <p
                        className="mt-6 font-display text-2xl"
                        style={{ fontFamily: `'${config.fontDisplay}', serif` }}
                      >
                        {coupleTitle}
                      </p>
                    </>
                  ) : (
                    <>
                      <OrnamentDivider motif={motifKey} color={colors.accent} />
                      <p className="mx-auto mt-4 max-w-2xl text-sm leading-relaxed opacity-80">
                        {invitation.closing}
                      </p>
                    </>
                  )}
                </section>
              </Reveal>
            ) : null}

            <p className="inv-text-contrast-glow text-center text-xs opacity-70">
              {coupleTitle} ·{" "}
              <span style={{ color: colors.accent }}>{brand}</span>
            </p>
          </div>
        </InvitationScreen>
      </div>
    </>
  );
}
