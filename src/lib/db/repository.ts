import { atelierDb } from "./app-db";
import type { ClosetItem, StoredImage, WeatherContext } from "./types";

export async function saveStoredImage(image: StoredImage): Promise<string> {
  await atelierDb.images.put(image);
  return image.id;
}

export async function saveClosetItem(item: ClosetItem) {
  await atelierDb.items.put(item);
}

export async function deleteClosetItem(itemId: string) {
  await atelierDb.transaction("rw", atelierDb.items, atelierDb.images, async () => {
    const item = await atelierDb.items.get(itemId);
    if (!item) {
      return;
    }

    const candidateImageIds = new Set(
      [item.heroImage, ...item.metaAssets.map((asset) => asset.imageId)].filter(Boolean) as string[]
    );

    await atelierDb.items.delete(itemId);

    if (candidateImageIds.size === 0) {
      return;
    }

    const remainingItems = await atelierDb.items.toArray();
    const referencedImageIds = new Set<string>();

    for (const entry of remainingItems) {
      if (entry.heroImage) {
        referencedImageIds.add(entry.heroImage);
      }

      for (const asset of entry.metaAssets) {
        referencedImageIds.add(asset.imageId);
      }
    }

    for (const imageId of candidateImageIds) {
      if (!referencedImageIds.has(imageId)) {
        await atelierDb.images.delete(imageId);
      }
    }
  });
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
