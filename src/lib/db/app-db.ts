import Dexie, { type Table } from "dexie";
import { seedItems } from "./seed";
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
    return;
  }

  await importSampleData();
}

export async function importSampleData() {
  await atelierDb.transaction("rw", atelierDb.items, async () => {
    await atelierDb.items.bulkPut(seedItems);
  });

  localStorage.setItem(seedFlagKey, "true");
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
