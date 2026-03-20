import Dexie, { type Table } from "dexie";
import { seedItems, seedLookbooks } from "./seed";
import type { ClosetItem, Lookbook, StoredImage, WeatherCacheEntry } from "./types";

export class AtelierDatabase extends Dexie {
  items!: Table<ClosetItem, string>;
  images!: Table<StoredImage, string>;
  lookbooks!: Table<Lookbook, string>;
  preferences!: Table<{ key: string; value: unknown }, string>;
  weatherCache!: Table<WeatherCacheEntry, string>;

  constructor() {
    super("atelier-db");
    this.version(1).stores({
      items: "id, status, category, favorite, updatedAt",
      images: "id, createdAt",
      lookbooks: "id, updatedAt",
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

  await atelierDb.transaction("rw", atelierDb.items, atelierDb.lookbooks, async () => {
    await atelierDb.items.bulkPut(seedItems);
    await atelierDb.lookbooks.bulkPut(seedLookbooks);
  });

  localStorage.setItem(seedFlagKey, "true");
}

export async function clearAllProductData() {
  await atelierDb.transaction(
    "rw",
    atelierDb.items,
    atelierDb.images,
    atelierDb.lookbooks,
    atelierDb.weatherCache,
    async () => {
      await atelierDb.items.clear();
      await atelierDb.images.clear();
      await atelierDb.lookbooks.clear();
      await atelierDb.weatherCache.clear();
    }
  );
}
