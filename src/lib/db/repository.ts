import { atelierDb } from "./app-db";
import type { ClosetItem, StoredImage, WeatherContext } from "./types";

export async function saveStoredImage(image: StoredImage): Promise<string> {
  await atelierDb.images.put(image);
  return image.id;
}

export async function saveClosetItem(item: ClosetItem) {
  await atelierDb.items.put(item);
}

export async function toggleFavorite(itemId: string, favorite: boolean) {
  await atelierDb.items.update(itemId, {
    favorite,
    updatedAt: new Date().toISOString()
  });
}

export async function archiveItem(itemId: string, archived: boolean) {
  await atelierDb.items.update(itemId, {
    status: archived ? "archived" : "saved",
    updatedAt: new Date().toISOString()
  });
}

export async function saveWeatherContext(context: WeatherContext) {
  await atelierDb.weatherCache.put({ id: "current", context });
}
