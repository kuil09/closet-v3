import { atelierDb } from "../db/app-db";
import { legacySeedHeroImageMap } from "../db/seed";
import type { ClosetItem } from "../db/types";

export interface LookbookExportItem
  extends Pick<ClosetItem, "id" | "name" | "category" | "heroImage" | "paletteColors"> {}

export interface LookbookExportInput {
  items: LookbookExportItem[];
  title?: string;
  note?: string;
  generatedAt?: Date;
}

export interface LookbookLayoutSlot {
  x: number;
  y: number;
  width: number;
  height: number;
}

const CANVAS_WIDTH = 1600;
const CANVAS_HEIGHT = 2000;
const PAPER_X = 72;
const PAPER_Y = 72;
const PAPER_WIDTH = CANVAS_WIDTH - PAPER_X * 2;
const PAPER_HEIGHT = CANVAS_HEIGHT - PAPER_Y * 2;
const GRID_X = 120;
const GRID_Y = 520;
const GRID_WIDTH = 1360;
const GRID_HEIGHT = 1090;
const GRID_GAP = 28;
export const MAX_LOOKBOOK_ITEMS = 4;

function clampItems(items: LookbookExportItem[]) {
  return items.slice(0, MAX_LOOKBOOK_ITEMS);
}

function normalizeHexColor(color: string | undefined, fallback: string) {
  if (!color || !/^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(color)) {
    return fallback;
  }

  if (color.length === 4) {
    return `#${color[1]}${color[1]}${color[2]}${color[2]}${color[3]}${color[3]}`.toUpperCase();
  }

  return color.toUpperCase();
}

function tintHexColor(color: string | undefined, ratio: number, fallback = "#D9D2C7") {
  const hex = normalizeHexColor(color, fallback).slice(1);
  const red = Number.parseInt(hex.slice(0, 2), 16);
  const green = Number.parseInt(hex.slice(2, 4), 16);
  const blue = Number.parseInt(hex.slice(4, 6), 16);
  const mix = (value: number) => Math.round(value + (255 - value) * ratio);
  return `rgb(${mix(red)} ${mix(green)} ${mix(blue)})`;
}

function fitImageContain(imageWidth: number, imageHeight: number, frame: LookbookLayoutSlot) {
  const imageRatio = imageWidth / imageHeight || 1;
  const frameRatio = frame.width / frame.height || 1;

  if (imageRatio > frameRatio) {
    const width = frame.width;
    const height = width / imageRatio;
    return {
      x: frame.x,
      y: frame.y + (frame.height - height) / 2,
      width,
      height
    };
  }

  const height = frame.height;
  const width = height * imageRatio;
  return {
    x: frame.x + (frame.width - width) / 2,
    y: frame.y,
    width,
    height
  };
}

function wrapText(context: CanvasRenderingContext2D, text: string, maxWidth: number, maxLines: number) {
  const tokens = text.trim().split(/\s+/).filter(Boolean);
  if (tokens.length === 0) {
    return [];
  }

  const lines: string[] = [];
  let current = "";

  for (const token of tokens) {
    const candidate = current ? `${current} ${token}` : token;
    if (context.measureText(candidate).width <= maxWidth) {
      current = candidate;
      continue;
    }

    if (current) {
      lines.push(current);
      current = token;
    } else {
      lines.push(token);
      current = "";
    }

    if (lines.length >= maxLines) {
      break;
    }
  }

  if (lines.length < maxLines && current) {
    lines.push(current);
  }

  if (tokens.length > 0 && lines.length === maxLines) {
    const lastIndex = lines.length - 1;
    const original = lines[lastIndex] ?? "";
    lines[lastIndex] = original.length > 3 ? `${original.slice(0, Math.max(0, original.length - 3))}...` : original;
  }

  return lines;
}

function drawRect(context: CanvasRenderingContext2D, rect: LookbookLayoutSlot, fillStyle: string, strokeStyle?: string) {
  context.fillStyle = fillStyle;
  context.fillRect(rect.x, rect.y, rect.width, rect.height);

  if (strokeStyle) {
    context.strokeStyle = strokeStyle;
    context.lineWidth = 1.5;
    context.strokeRect(rect.x, rect.y, rect.width, rect.height);
  }
}

function drawPaletteDots(context: CanvasRenderingContext2D, colors: string[], x: number, y: number) {
  colors.slice(0, 3).forEach((color, index) => {
    context.beginPath();
    context.fillStyle = normalizeHexColor(color, "#D4CEC4");
    context.arc(x + index * 22, y, 7, 0, Math.PI * 2);
    context.fill();
    context.strokeStyle = "rgba(45, 52, 50, 0.12)";
    context.lineWidth = 1;
    context.stroke();
  });
}

async function resolveCanvasImageSource(imageRef: string | null) {
  if (!imageRef) {
    return null;
  }

  const normalized = legacySeedHeroImageMap[imageRef] ?? imageRef;

  if (/^(data:|blob:)/.test(normalized)) {
    return { src: normalized, revoke() {} };
  }

  if (/^https?:/.test(normalized)) {
    return null;
  }

  const stored = await atelierDb.images.get(normalized);
  if (!stored) {
    return null;
  }

  const objectUrl = URL.createObjectURL(stored.blob);
  return {
    src: objectUrl,
    revoke() {
      URL.revokeObjectURL(objectUrl);
    }
  };
}

async function loadImage(src: string) {
  return await new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error("Unable to load image for export"));
    image.src = src;
  });
}

async function canvasToBlob(canvas: HTMLCanvasElement) {
  return await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (!blob) {
        reject(new Error("Unable to build lookbook export"));
        return;
      }

      resolve(blob);
    }, "image/png");
  });
}

function drawFallbackArtwork(context: CanvasRenderingContext2D, slot: LookbookLayoutSlot, accent: string) {
  context.fillStyle = tintHexColor(accent, 0.72);
  context.fillRect(slot.x, slot.y, slot.width, slot.height);
  context.strokeStyle = tintHexColor(accent, 0.22, "#6F6559");
  context.lineWidth = 2;
  context.strokeRect(slot.x + 16, slot.y + 16, slot.width - 32, slot.height - 32);
  context.fillStyle = "rgba(45, 52, 50, 0.18)";
  context.fillRect(slot.x + slot.width * 0.24, slot.y + slot.height * 0.18, slot.width * 0.52, slot.height * 0.5);
}

function drawPosterBackground(context: CanvasRenderingContext2D) {
  const gradient = context.createLinearGradient(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
  gradient.addColorStop(0, "#F1E9DB");
  gradient.addColorStop(0.55, "#F8F4ED");
  gradient.addColorStop(1, "#E9E0D3");
  context.fillStyle = gradient;
  context.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

  context.fillStyle = "rgba(122, 92, 59, 0.12)";
  context.fillRect(0, 0, CANVAS_WIDTH, 180);
  context.fillStyle = "rgba(35, 39, 44, 0.08)";
  context.fillRect(CANVAS_WIDTH - 220, 260, 120, CANVAS_HEIGHT - 520);
  context.fillStyle = "rgba(169, 106, 52, 0.08)";
  context.fillRect(120, CANVAS_HEIGHT - 300, 440, 132);
}

function drawPosterChrome(context: CanvasRenderingContext2D, title: string, note: string, itemCount: number, generatedAt: Date) {
  drawRect(
    context,
    { x: PAPER_X, y: PAPER_Y, width: PAPER_WIDTH, height: PAPER_HEIGHT },
    "rgba(255, 253, 249, 0.96)",
    "rgba(45, 52, 50, 0.08)"
  );

  context.fillStyle = "#23272C";
  context.fillRect(PAPER_X + 48, PAPER_Y + 48, 168, 16);
  context.fillStyle = "#6E604F";
  context.font = '600 22px "Work Sans", sans-serif';
  context.fillText("THE ATELIER", PAPER_X + 48, PAPER_Y + 104);

  context.fillStyle = "#2D3432";
  context.font = '700 68px "Manrope", "Work Sans", sans-serif';
  context.fillText(title, PAPER_X + 48, PAPER_Y + 196);

  context.fillStyle = "#6B675F";
  context.font = '500 24px "Work Sans", sans-serif';
  const dateLabel = generatedAt.toISOString().slice(0, 10);
  context.fillText(`Local export · ${itemCount} pieces · ${dateLabel}`, PAPER_X + 48, PAPER_Y + 246);

  if (note.trim()) {
    context.fillStyle = "#4F5451";
    context.font = '400 24px "Work Sans", sans-serif';
    const noteLines = wrapText(context, note, PAPER_WIDTH - 96, 3);
    noteLines.forEach((line, index) => {
      context.fillText(line, PAPER_X + 48, PAPER_Y + 304 + index * 34);
    });
  }
}

export function buildLookbookLayout(itemCount: number): LookbookLayoutSlot[] {
  const count = Math.max(0, Math.min(MAX_LOOKBOOK_ITEMS, itemCount));
  if (count === 0) {
    return [];
  }

  if (count === 1) {
    return [{ x: GRID_X, y: GRID_Y, width: GRID_WIDTH, height: GRID_HEIGHT }];
  }

  if (count === 2) {
    const width = (GRID_WIDTH - GRID_GAP) / 2;
    return [
      { x: GRID_X, y: GRID_Y, width, height: GRID_HEIGHT },
      { x: GRID_X + width + GRID_GAP, y: GRID_Y, width, height: GRID_HEIGHT }
    ];
  }

  if (count === 3) {
    const leftWidth = Math.floor(GRID_WIDTH * 0.58);
    const rightWidth = GRID_WIDTH - leftWidth - GRID_GAP;
    const rightHeight = (GRID_HEIGHT - GRID_GAP) / 2;
    return [
      { x: GRID_X, y: GRID_Y, width: leftWidth, height: GRID_HEIGHT },
      { x: GRID_X + leftWidth + GRID_GAP, y: GRID_Y, width: rightWidth, height: rightHeight },
      { x: GRID_X + leftWidth + GRID_GAP, y: GRID_Y + rightHeight + GRID_GAP, width: rightWidth, height: rightHeight }
    ];
  }

  const width = (GRID_WIDTH - GRID_GAP) / 2;
  const height = (GRID_HEIGHT - GRID_GAP) / 2;
  return [
    { x: GRID_X, y: GRID_Y, width, height },
    { x: GRID_X + width + GRID_GAP, y: GRID_Y, width, height },
    { x: GRID_X, y: GRID_Y + height + GRID_GAP, width, height },
    { x: GRID_X + width + GRID_GAP, y: GRID_Y + height + GRID_GAP, width, height }
  ];
}

export function defaultLookbookTitle() {
  return "Atelier Lookbook";
}

export async function renderLookbookCanvas(input: LookbookExportInput) {
  const items = clampItems(input.items);
  if (items.length === 0) {
    throw new Error("Lookbook export needs at least one item");
  }

  const title = input.title?.trim() || defaultLookbookTitle();
  const note = input.note?.trim() ?? "";
  const generatedAt = input.generatedAt ?? new Date();
  const canvas = document.createElement("canvas");
  canvas.width = CANVAS_WIDTH;
  canvas.height = CANVAS_HEIGHT;

  const context = canvas.getContext("2d");
  if (!context) {
    throw new Error("Canvas export is unavailable in this browser");
  }

  drawPosterBackground(context);
  drawPosterChrome(context, title, note, items.length, generatedAt);

  const slots = buildLookbookLayout(items.length);

  for (const [index, item] of items.entries()) {
    const slot = slots[index];
    if (!slot) {
      continue;
    }

    const accent = normalizeHexColor(item.paletteColors[0], "#A59682");
    const cardRect = slot;
    const mediaRect = {
      x: cardRect.x + 22,
      y: cardRect.y + 22,
      width: cardRect.width - 44,
      height: cardRect.height - 126
    };
    const footerY = cardRect.y + cardRect.height - 82;

    drawRect(context, cardRect, "#FFFFFF", "rgba(45, 52, 50, 0.08)");
    drawRect(context, mediaRect, tintHexColor(accent, 0.8), "rgba(45, 52, 50, 0.06)");
    drawPaletteDots(context, item.paletteColors, cardRect.x + 34, cardRect.y + 36);

    const resolved = await resolveCanvasImageSource(item.heroImage);
    try {
      if (resolved) {
        const image = await loadImage(resolved.src);
        const fitted = fitImageContain(image.naturalWidth || image.width, image.naturalHeight || image.height, {
          x: mediaRect.x + 24,
          y: mediaRect.y + 24,
          width: mediaRect.width - 48,
          height: mediaRect.height - 48
        });
        context.drawImage(image, fitted.x, fitted.y, fitted.width, fitted.height);
      } else {
        drawFallbackArtwork(context, {
          x: mediaRect.x + 24,
          y: mediaRect.y + 24,
          width: mediaRect.width - 48,
          height: mediaRect.height - 48
        }, accent);
      }
    } finally {
      resolved?.revoke();
    }

    context.fillStyle = "#6E604F";
    context.font = '600 18px "Work Sans", sans-serif';
    context.fillText(item.category.toUpperCase(), cardRect.x + 28, footerY);

    context.fillStyle = "#2D3432";
    context.font = '700 28px "Manrope", "Work Sans", sans-serif';
    const nameLines = wrapText(context, item.name, cardRect.width - 56, 2);
    nameLines.forEach((line, lineIndex) => {
      context.fillText(line, cardRect.x + 28, footerY + 34 + lineIndex * 30);
    });
  }

  return canvas;
}

export async function createLookbookPngBlob(input: LookbookExportInput) {
  const canvas = await renderLookbookCanvas(input);
  return await canvasToBlob(canvas);
}

function toDownloadFileName(title: string) {
  const slug = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return `${slug || "atelier-lookbook"}.png`;
}

export async function downloadLookbookPng(input: LookbookExportInput) {
  const title = input.title?.trim() || defaultLookbookTitle();
  const blob = await createLookbookPngBlob(input);
  const objectUrl = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = objectUrl;
  link.download = toDownloadFileName(title);
  link.click();
  link.remove();
  URL.revokeObjectURL(objectUrl);
}
