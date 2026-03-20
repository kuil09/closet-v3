import { describe, expect, test } from "bun:test";
import { atelierDb } from "../../src/lib/db/app-db";
import { archiveItem, saveClosetItem, toggleFavorite } from "../../src/lib/db/repository";
import { seedItems } from "../../src/lib/db/seed";

describe("db repository", () => {
  test("saves and mutates closet items", async () => {
    const item = { ...seedItems[0], id: "test_item_repo", favorite: false, status: "saved" as const };
    await saveClosetItem(item);
    await toggleFavorite(item.id, true);
    await archiveItem(item.id, true);

    const stored = await atelierDb.items.get(item.id);
    expect(stored?.favorite).toBe(true);
    expect(stored?.status).toBe("archived");
  });
});
