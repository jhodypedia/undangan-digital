export type LatLng = { lat: number; lng: number };

export function isValidLatLng(lat: number, lng: number): boolean {
  return (
    Number.isFinite(lat) &&
    Number.isFinite(lng) &&
    Math.abs(lat) <= 90 &&
    Math.abs(lng) <= 180 &&
    !(lat === 0 && lng === 0)
  );
}

export function parseLatLng(value?: string | null): LatLng | null {
  if (!value) return null;
  const text = value.trim();
  if (!text) return null;

  const patterns = [
    /@(-?\d+(?:\.\d+)?),\s*(-?\d+(?:\.\d+)?)/,
    /[?&](?:q|ll|query|center|destination)=(-?\d+(?:\.\d+)?),\s*(-?\d+(?:\.\d+)?)/,
    /!3d(-?\d+(?:\.\d+)?)!4d(-?\d+(?:\.\d+)?)/,
    /^\s*(-?\d+(?:\.\d+)?)\s*,\s*(-?\d+(?:\.\d+)?)\s*$/,
  ];

  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (!match) continue;
    const lat = Number(match[1]);
    const lng = Number(match[2]);
    if (isValidLatLng(lat, lng)) return { lat, lng };
  }
  return null;
}

export function normalizeLatLng(
  latValue?: string | null,
  lngValue?: string | null,
): LatLng | null {
  const lat = Number((latValue ?? "").replace(",", "."));
  const lng = Number((lngValue ?? "").replace(",", "."));
  if (isValidLatLng(lat, lng)) return { lat, lng };
  return null;
}

export function resolveLatLng(
  latValue: string | null | undefined,
  lngValue: string | null | undefined,
  fallbackText?: string | null,
): LatLng | null {
  return normalizeLatLng(latValue, lngValue) ?? parseLatLng(fallbackText);
}

export function mapsQuery(
  parts: (string | null | undefined)[],
  opts: { withName?: boolean; name?: string | null } = {},
): string | null {
  const value = parts
    .map((part) => part?.trim())
    .filter((part): part is string => Boolean(part))
    .join(", ")
    .trim();
  if (!value) return null;
  return opts.withName && opts.name ? `${opts.name}, ${value}` : value;
}

export function googleMapsEmbedUrl(input: {
  apiKey?: string | null;
  lat?: number | null;
  lng?: number | null;
  query?: string | null;
  zoom?: number;
}): string | null {
  const { apiKey, lat, lng, query, zoom = 16 } = input;
  const hasCoords =
    typeof lat === "number" &&
    typeof lng === "number" &&
    isValidLatLng(lat, lng);
  const q = query?.trim();
  if (!hasCoords && !q) return null;

  const target = hasCoords ? `${lat},${lng}` : (q as string);

  if (apiKey) {
    const params = new URLSearchParams({
      key: apiKey,
      q: target,
      zoom: String(zoom),
      language: "id",
    });
    return `https://www.google.com/maps/embed/v1/place?${params.toString()}`;
  }

  const params = new URLSearchParams({
    q: target,
    z: String(zoom),
    hl: "id",
    output: "embed",
  });
  return `https://www.google.com/maps?${params.toString()}`;
}

export function googleMapsDirectionsUrl(input: {
  lat?: number | null;
  lng?: number | null;
  query?: string | null;
}): string | null {
  const hasCoords =
    typeof input.lat === "number" &&
    typeof input.lng === "number" &&
    isValidLatLng(input.lat, input.lng);
  const q = input.query?.trim();
  if (!hasCoords && !q) return null;

  const params = new URLSearchParams({
    api: "1",
    destination: hasCoords ? `${input.lat},${input.lng}` : (q as string),
  });
  return `https://www.google.com/maps/dir/?${params.toString()}`;
}
