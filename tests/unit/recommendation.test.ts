import { describe, expect, test } from "bun:test";
import { buildRecommendations, scoreItem } from "../../src/lib/recommendation/engine";
import { seedItems } from "../../src/lib/db/seed";
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

  test("returns item recommendations only", () => {
    const recommendations = buildRecommendations(seedItems, mildWeather);
    expect(recommendations.length).toBeGreaterThan(0);
    expect(recommendations.every((entry) => entry.kind === "item")).toBe(true);
  });
});
