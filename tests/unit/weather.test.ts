import { afterEach, describe, expect, mock, test } from "bun:test";
import { contextFromManualWeather, fetchWeatherForCoords, presetCities } from "../../src/lib/weather/open-meteo";

const originalFetch = globalThis.fetch;

describe("weather adapter", () => {
  afterEach(() => {
    globalThis.fetch = originalFetch;
  });

  test("maps Open-Meteo payload into product weather context", async () => {
    globalThis.fetch = mock(async () =>
      new Response(
        JSON.stringify({
          current: {
            temperature_2m: 19.1,
            weather_code: 1,
            wind_speed_10m: 6
          }
        })
      )
    ) as unknown as typeof fetch;

    const context = await fetchWeatherForCoords({
      latitude: 37.56,
      longitude: 126.97,
      locationName: "Seoul"
    });

    expect(context.locationName).toBe("Seoul");
    expect(context.temperatureC).toBe(19.1);
    expect(context.condition).toBe("cloudy");
  });

  test("builds manual fallback context", () => {
    const context = contextFromManualWeather(presetCities[0]);
    expect(context.source).toBe("manual");
    expect(context.locationName).toBe(presetCities[0].locationName);
  });
});
