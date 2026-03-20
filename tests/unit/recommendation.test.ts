import { describe, expect, test } from "bun:test";
import { buildRecommendations, scoreItem } from "../../src/lib/recommendation/engine";
import { seedItems, seedLookbooks } from "../../src/lib/db/seed";
import type { WeatherContext } from "../../src/lib/db/types";

const mildWeather: WeatherContext = {
  source: "manual",
  locationName: "Seoul",
  temperatureC: 17,
  condition: "clear",
  windKph: 8,
  fetchedAt: new Date().toISOString()
};

describe("recommendation engine", () => {
  test("favors pieces that match weather and favorite state", () => {
    const coat = seedItems.find((item) => item.id === "item_coat")!;
    const blazer = seedItems.find((item) => item.id === "item_blazer")!;

    expect(scoreItem(coat, mildWeather)).toBeGreaterThan(scoreItem(blazer, mildWeather));
  });

  test("returns lookbook and item recommendations", () => {
    const recommendations = buildRecommendations(seedItems, seedLookbooks, mildWeather);
    expect(recommendations.some((entry) => entry.kind === "lookbook")).toBe(true);
    expect(recommendations.some((entry) => entry.kind === "item")).toBe(true);
  });
});
