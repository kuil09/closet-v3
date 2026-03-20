import { afterEach } from "bun:test";
import { cleanup } from "@testing-library/react";
import "../src/lib/testing/setup";
import { atelierDb } from "../src/lib/db/app-db";
import { defaultPreferences, usePreferencesStore } from "../src/lib/state/preferences-store";

afterEach(async () => {
  cleanup();
  localStorage.clear();
  usePreferencesStore.setState(defaultPreferences);
  await atelierDb.transaction("rw", atelierDb.items, atelierDb.images, atelierDb.weatherCache, async () => {
    await atelierDb.items.clear();
    await atelierDb.images.clear();
    await atelierDb.weatherCache.clear();
  });
});
