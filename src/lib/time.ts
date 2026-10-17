export const WIB_TIME_ZONE = "Asia/Jakarta";
export const WIB_LABEL = "WIB";
export const WIB_OFFSET = "+07:00";

type DateInput = Date | string | number | null | undefined;

function toDate(value: DateInput): Date | null {
  if (value === null || value === undefined || value === "") return null;
  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

export function nowWIB(): Date {
  return new Date();
}

export function formatDateID(
  value: DateInput,
  options: Intl.DateTimeFormatOptions = {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  },
): string {
  const date = toDate(value);
  if (!date) return "-";
  return new Intl.DateTimeFormat("id-ID", {
    ...options,
    timeZone: WIB_TIME_ZONE,
  }).format(date);
}

export function formatShortDateID(value: DateInput): string {
  return formatDateID(value, {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export function formatTimeWIB(value: DateInput): string {
  const date = toDate(value);
  if (!date) return "-";
  return `${new Intl.DateTimeFormat("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: WIB_TIME_ZONE,
  }).format(date)} ${WIB_LABEL}`;
}

export function formatDateTimeWIB(value: DateInput): string {
  const date = toDate(value);
  if (!date) return "-";
  return `${formatDateID(date, {
    day: "2-digit",
    month: "long",
    year: "numeric",
  })} • ${formatTimeWIB(date)}`;
}

export function formatTimeRangeWIB(
  start: DateInput,
  end: DateInput,
): string {
  const startText = new Intl.DateTimeFormat("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: WIB_TIME_ZONE,
  }).format(toDate(start) ?? new Date());
  const endDate = toDate(end);
  if (!endDate) return `${startText} ${WIB_LABEL}`;
  const endText = new Intl.DateTimeFormat("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: WIB_TIME_ZONE,
  }).format(endDate);
  return `${startText} – ${endText} ${WIB_LABEL}`;
}

export function getWIBParts(value: DateInput) {
  const date = toDate(value) ?? new Date();
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: WIB_TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).formatToParts(date);
  const pick = (type: string) =>
    parts.find((part) => part.type === type)?.value ?? "00";
  return {
    year: pick("year"),
    month: pick("month"),
    day: pick("day"),
    hour: pick("hour"),
    minute: pick("minute"),
  };
}

export function toWIBDateInput(value: DateInput): string {
  const { year, month, day } = getWIBParts(value);
  return `${year}-${month}-${day}`;
}

export function toWIBTimeInput(value: DateInput): string {
  const { hour, minute } = getWIBParts(value);
  return `${hour}:${minute}`;
}

export function toWIBDateTimeInput(value: DateInput): string {
  const { year, month, day, hour, minute } = getWIBParts(value);
  return `${year}-${month}-${day}T${hour}:${minute}`;
}

export function combineWIBDateAndTime(
  date: string | null | undefined,
  time: string | null | undefined,
): Date | null {
  if (!date) return null;
  const safeTime = time && time.length >= 5 ? time.slice(0, 5) : "00:00";
  const parsed = new Date(`${date}T${safeTime}:00${WIB_OFFSET}`);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

export function parseWIBInput(value: string | null | undefined): Date | null {
  if (!value) return null;
  const normalized = value.length === 16 ? `${value}:00` : value;
  const parsed = new Date(`${normalized}${WIB_OFFSET}`);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

export function wibNowInput(): string {
  return toWIBDateTimeInput(new Date());
}
