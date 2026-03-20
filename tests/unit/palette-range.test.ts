import { describe, expect, test } from "bun:test";
import type { ClosetItem } from "../../src/lib/db/types";
import { buildPaletteTags, itemMatchesPaletteRange } from "../../src/lib/utils/palette-range";

const now = new Date().toISOString();

function makeItem(id: string, name: string, paletteColors: string[]): ClosetItem {
  return {
    id,
    status: "saved",
    name,
    category: "Test",
    materials: ["Cotton"],
    heroImage: null,
    galleryImageIds: [],
    paletteColors,
    purchaseDate: null,
    price: null,
    currency: "USD",
    storageLocation: "Rack",
    temperatureBand: ["mild"],
    weatherTags: ["clear"],
    occasionTags: [],
    usageFrequency: "regularly",
    favorite: false,
    styleNotes: "",
    metaAssets: [],
    createdAt: now,
    updatedAt: now
  };
}

describe("palette range helpers", () => {
  test("sorts stored colors from darker tones to lighter tones", () => {
    const tags = buildPaletteTags([
      makeItem("dark", "Night Wool Coat", ["#111111"]),
      makeItem("light", "Porcelain Linen Shirt", ["#F4F2ED"]),
      makeItem("mid", "Stone Overshirt", ["#A96A34"])
    ]);

    expect(tags.map((entry) => entry.value)).toEqual(["#111111", "#A96A34", "#F4F2ED"]);
  });

  test("matches items whose saved palette falls inside the selected range", () => {
    const items = [
      makeItem("dark", "Night Wool Coat", ["#111111"]),
      makeItem("light", "Porcelain Linen Shirt", ["#F4F2ED"])
    ];
    const colorTags = buildPaletteTags(items);
    const colorIndexMap = new Map(colorTags.map((entry, index) => [entry.value, index]));

    expect(itemMatchesPaletteRange(items[0], colorIndexMap, 0, 0)).toBe(true);
    expect(itemMatchesPaletteRange(items[1], colorIndexMap, 0, 0)).toBe(false);
  });
});
