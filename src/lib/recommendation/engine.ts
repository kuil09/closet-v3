import type {
  ClosetItem,
  Recommendation,
  TemperatureBand,
  WeatherCondition,
  WeatherContext
} from "../db/types";
import { makeId } from "../utils/id";

export function temperatureToBands(temperatureC: number): TemperatureBand[] {
  if (temperatureC < 0) {
    return ["freezing"];
  }
  if (temperatureC < 10) {
    return ["cold", "mild"];
  }
  if (temperatureC < 20) {
    return ["mild", "warm"];
  }
  if (temperatureC < 30) {
    return ["warm", "hot"];
  }
  return ["hot"];
}

export function scoreItem(item: ClosetItem, weather: WeatherContext | null): number {
  if (item.status === "archived") {
    return -1000;
  }

  let score = 20;
  if (item.favorite) {
    score += 15;
  }
  if (item.usageFrequency === "often") {
    score += 12;
  }
  if (item.usageFrequency === "regularly") {
    score += 6;
  }

  if (weather) {
    const tempBands = temperatureToBands(weather.temperatureC);
    const tempMatches = item.temperatureBand.filter((band) => tempBands.includes(band)).length;
    const weatherMatch = item.weatherTags.includes(weather.condition) ? 12 : 0;
    score += tempMatches * 10 + weatherMatch;
  }

  return score;
}

export function buildRecommendations(
  items: ClosetItem[],
  weather: WeatherContext | null
): Recommendation[] {
  const activeItems = items.filter((item) => item.status !== "archived");
  const sorted = [...activeItems].sort((a, b) => scoreItem(b, weather) - scoreItem(a, weather));
  const tempBands = weather ? temperatureToBands(weather.temperatureC) : [];
  const weatherMatch = weather ? [weather.condition] : [];

  const itemRecommendations = sorted.slice(0, 4).map<Recommendation>((item) => ({
    id: makeId("rec"),
    kind: "item",
    itemIds: [item.id],
    reason: weather
      ? `${item.name} matches ${weather.condition} weather and preferred temperature bands`
      : `${item.name} is a strong wardrobe staple`,
    score: scoreItem(item, weather),
    matchedWeatherTags: weatherMatch.filter((tag) => item.weatherTags.includes(tag as WeatherCondition)),
    matchedTemperatureBands: tempBands.filter((band) => item.temperatureBand.includes(band))
  }));

  return itemRecommendations;
}
