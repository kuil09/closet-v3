import { beforeEach, describe, expect, mock, test } from "bun:test";
import { atelierDb, migrateLegacySeedMedia } from "../../src/lib/db/app-db";
import { legacySeedHeroImageMap, seedItems } from "../../src/lib/db/seed";
import { saveClosetItem } from "../../src/lib/db/repository";
import { createLookbookPngBlob } from "../../src/lib/lookbook/export";

describe("lookbook export", () => {
  beforeEach(async () => {
    await atelierDb.items.clear();
    await atelierDb.images.clear();
    await atelierDb.weatherCache.clear();
  });

  test("migrates legacy remote seed hero images to local data URLs", async () => {
    const legacyHeroImage = Object.keys(legacySeedHeroImageMap)[0] ?? "";
    expect(legacyHeroImage.startsWith("https://")).toBe(true);

    await saveClosetItem({
      ...seedItems[0],
      id: "legacy_seed_item",
      heroImage: legacyHeroImage
    });

    await migrateLegacySeedMedia();

    const stored = await atelierDb.items.get("legacy_seed_item");
    expect(stored?.heroImage?.startsWith("data:image/svg+xml")).toBe(true);
  });

  test("creates a local png blob for the first four visible pieces", async () => {
    const gradient = { addColorStop() {} };
    const drawImage = mock(() => {});
    const originalCreateElement = document.createElement.bind(document);
    const originalImage = globalThis.Image;
    const context = {
      createLinearGradient: () => gradient,
      fillRect: mock(() => {}),
      strokeRect: mock(() => {}),
      beginPath: mock(() => {}),
      arc: mock(() => {}),
      fill: mock(() => {}),
      stroke: mock(() => {}),
      drawImage,
      fillText: mock(() => {}),
      measureText: (value: string) => ({ width: value.length * 12 }),
      font: "",
      fillStyle: "",
      strokeStyle: "",
      lineWidth: 1
    } as unknown as CanvasRenderingContext2D;
    const canvas = {
      width: 0,
      height: 0,
      getContext: () => context,
      toBlob(callback: BlobCallback) {
        callback(new Blob(["png"], { type: "image/png" }));
      }
    } as unknown as HTMLCanvasElement;

    document.createElement = ((tagName: string) => {
      if (tagName === "canvas") {
        return canvas;
      }

      return originalCreateElement(tagName);
    }) as typeof document.createElement;

    class MockImage {
      naturalWidth = 720;
      naturalHeight = 960;
      onload: null | (() => void) = null;
      onerror: null | (() => void) = null;

      set src(_value: string) {
        queueMicrotask(() => this.onload?.());
      }
    }

    globalThis.Image = MockImage as unknown as typeof Image;

    try {
      const blob = await createLookbookPngBlob({
        title: "Weekend Capsule",
        items: seedItems.slice(0, 6)
      });

      expect(blob.type).toBe("image/png");
      expect(drawImage).toHaveBeenCalledTimes(4);
    } finally {
      document.createElement = originalCreateElement;
      globalThis.Image = originalImage;
    }
  });
});
