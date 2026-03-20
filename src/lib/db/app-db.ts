import Dexie, { type Table } from "dexie";
import { normalizeSeedHeroImageRef, seedItems } from "./seed";
import type { ClosetItem, StoredImage, WeatherCacheEntry } from "./types";

export class AtelierDatabase extends Dexie {
  items!: Table<ClosetItem, string>;
  images!: Table<StoredImage, string>;
  preferences!: Table<{ key: string; value: unknown }, string>;
  weatherCache!: Table<WeatherCacheEntry, string>;

  constructor() {
    super("atelier-db");
    this.version(2).stores({
      items: "id, status, category, favorite, updatedAt",
      images: "id, createdAt",
      preferences: "key",
      weatherCache: "id"
    });
  }
}

export const atelierDb = new AtelierDatabase();

const seedFlagKey = "atelier-seeded-v1";

export async function ensureSeedData() {
  if (localStorage.getItem(seedFlagKey)) {
    await migrateLegacySeedMedia();
    return;
  }

  await importSampleData();
  await migrateLegacySeedMedia();
}

export async function importSampleData() {
  await atelierDb.transaction("rw", atelierDb.items, async () => {
    await atelierDb.items.bulkPut(seedItems);
  });

  localStorage.setItem(seedFlagKey, "true");
}

export async function migrateLegacySeedMedia() {
  const items = await atelierDb.items.toArray();
  const updates = items
    .map((item) => {
      const heroImage = normalizeSeedHeroImageRef(item.heroImage);
      return heroImage !== item.heroImage ? { id: item.id, heroImage } : null;
    })
    .filter(Boolean) as Array<{ id: string; heroImage: string | null | undefined }>;

  if (updates.length === 0) {
    return;
  }

  await atelierDb.transaction("rw", atelierDb.items, async () => {
    await Promise.all(
      updates.map((entry) =>
        atelierDb.items.update(entry.id, {
          heroImage: entry.heroImage ?? null
        })
      )
    );
  });
}

export async function clearAllProductData() {
  await atelierDb.transaction(
    "rw",
    atelierDb.items,
    atelierDb.images,
    atelierDb.weatherCache,
    async () => {
      await atelierDb.items.clear();
      await atelierDb.images.clear();
      await atelierDb.weatherCache.clear();
    }
  );
}
