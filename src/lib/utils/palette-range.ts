import type { ClosetItem } from "../db/types";

export interface PaletteTag {
  value: string;
  lightness: number;
}

export function normalizeHexColor(color: string): string {
  const normalized = color.trim().toUpperCase();
  if (/^#[0-9A-F]{6}$/.test(normalized)) {
    return normalized;
  }

  return color;
}

export function colorLightness(color: string): number {
  const normalized = normalizeHexColor(color);
  const match = /^#([0-9A-F]{2})([0-9A-F]{2})([0-9A-F]{2})$/.exec(normalized);
  if (!match) {
    return 1;
  }

  const [red, green, blue] = match.slice(1).map((channel) => Number.parseInt(channel, 16) / 255);
  return Math.max(red, green, blue);
}

export function buildPaletteTags(items: ClosetItem[]): PaletteTag[] {
  return Array.from(new Set(items.flatMap((item) => item.paletteColors).map(normalizeHexColor).filter(Boolean)))
    .map((value) => ({ value, lightness: colorLightness(value) }))
    .sort((left, right) => left.lightness - right.lightness);
}

export function itemMatchesPaletteRange(
  item: ClosetItem,
  colorIndexMap: Map<string, number>,
  rangeStart: number,
  rangeEnd: number
): boolean {
  return item.paletteColors.some((color) => {
    const index = colorIndexMap.get(normalizeHexColor(color));
    return index !== undefined && index >= rangeStart && index <= rangeEnd;
  });
}

export function itemPaletteLightness(item: ClosetItem): number {
  if (item.paletteColors.length === 0) {
    return 1;
  }

  const values = item.paletteColors.map(colorLightness);
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}
