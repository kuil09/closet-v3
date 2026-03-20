import { liveQuery } from "dexie";
import { useEffect, useState } from "react";
import { atelierDb } from "../db/app-db";
import type { StoredImage } from "../db/types";
import { makeId } from "../utils/id";

async function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(blob);
  });
}

async function measureImage(file: File): Promise<{ width: number; height: number }> {
  if (typeof window === "undefined") {
    return { width: 0, height: 0 };
  }

  const url = URL.createObjectURL(file);
  try {
    const image = new Image();
    const result = await new Promise<{ width: number; height: number }>((resolve, reject) => {
      image.onload = () => resolve({ width: image.naturalWidth, height: image.naturalHeight });
      image.onerror = () => reject(new Error("Unable to load image"));
      image.src = url;
    });

    return result;
  } finally {
    URL.revokeObjectURL(url);
  }
}

async function createThumbnail(file: File): Promise<Blob> {
  if (typeof document === "undefined") {
    return file;
  }

  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d");
  if (!context) {
    return file;
  }

  const url = URL.createObjectURL(file);
  try {
    const image = new Image();
    await new Promise<void>((resolve, reject) => {
      image.onload = () => resolve();
      image.onerror = () => reject(new Error("Unable to decode image"));
      image.src = url;
    });

    const width = 320;
    const height = Math.max(240, Math.round((image.naturalHeight / image.naturalWidth) * width));
    canvas.width = width;
    canvas.height = height;
    context.drawImage(image, 0, 0, width, height);

    return await new Promise<Blob>((resolve) => {
      canvas.toBlob((blob) => resolve(blob ?? file), file.type || "image/jpeg", 0.8);
    });
  } catch {
    return file;
  } finally {
    URL.revokeObjectURL(url);
  }
}

export async function ingestImage(file: File): Promise<StoredImage> {
  const [size, thumbnailBlob, dominantColor] = await Promise.all([
    measureImage(file).catch(() => ({ width: 0, height: 0 })),
    createThumbnail(file),
    blobToDataUrl(file).then((dataUrl) => dataUrl.slice(0, 7) === "data:im" ? undefined : undefined).catch(() => undefined)
  ]);

  return {
    id: makeId("img"),
    blob: file,
    mimeType: file.type || "image/jpeg",
    width: size.width,
    height: size.height,
    thumbnailBlob,
    dominantColor,
    createdAt: new Date().toISOString()
  };
}

export function isRemoteImage(ref: string | null | undefined): boolean {
  return Boolean(ref && /^(blob:|data:|https?:)/.test(ref));
}

export function useStoredImageSource(ref: string | null | undefined): string | null {
  const [source, setSource] = useState<string | null>(() => (ref && isRemoteImage(ref) ? ref : null));

  useEffect(() => {
    let cancelled = false;
    let objectUrl: string | null = null;

    if (!ref) {
      setSource(null);
      return;
    }

    if (isRemoteImage(ref)) {
      setSource(ref);
      return;
    }

    void atelierDb.images.get(ref).then((image) => {
      if (cancelled || !image) {
        if (!cancelled) {
          setSource(null);
        }
        return;
      }

      objectUrl = URL.createObjectURL(image.thumbnailBlob || image.blob);
      setSource(objectUrl);
    });

    return () => {
      cancelled = true;
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
      }
    };
  }, [ref]);

  return source;
}

export const imageQuery = (id: string) => liveQuery(() => atelierDb.images.get(id));
