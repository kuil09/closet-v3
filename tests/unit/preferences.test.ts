import { describe, expect, test } from "bun:test";
import { defaultPreferences, usePreferencesStore } from "../../src/lib/state/preferences-store";

describe("preferences store", () => {
  test("updates theme and language", () => {
    usePreferencesStore.setState(defaultPreferences);
    usePreferencesStore.getState().setTheme("dark");
    usePreferencesStore.getState().setLanguage("ko");

    expect(usePreferencesStore.getState().theme).toBe("dark");
    expect(usePreferencesStore.getState().language).toBe("ko");
  });
});
