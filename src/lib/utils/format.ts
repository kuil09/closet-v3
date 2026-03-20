import type { TemperatureBand, Units } from "../db/types";

export function temperatureBandLabel(band: TemperatureBand): string {
  switch (band) {
    case "freezing":
      return "< 0C";
    case "cold":
      return "0-10C";
    case "mild":
      return "10-20C";
    case "warm":
      return "20-30C";
    case "hot":
      return "> 30C";
  }
}

export function formatTemperature(valueC: number, units: Units): string {
  if (units === "F") {
    return `${Math.round(valueC * 1.8 + 32)}F`;
  }

  return `${Math.round(valueC)}C`;
}

export function formatCurrency(value: number | null, currency: string): string {
  if (value == null) {
    return "—";
  }

  try {
    return new Intl.NumberFormat(undefined, {
      style: "currency",
      currency,
      maximumFractionDigits: 0
    }).format(value);
  } catch {
    return `${currency} ${value}`;
  }
}

export function normalizeToken(value: string): string {
  return value.trim().toLowerCase();
}
