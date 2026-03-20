import type { ManualWeatherSetting, WeatherCondition, WeatherContext } from "../db/types";

export const presetCities: ManualWeatherSetting[] = [
  {
    cityId: "seoul",
    locationName: "Seoul, South Korea",
    latitude: 37.5665,
    longitude: 126.978,
    temperatureC: 18,
    condition: "clear",
    windKph: 8
  },
  {
    cityId: "tokyo",
    locationName: "Tokyo, Japan",
    latitude: 35.6762,
    longitude: 139.6503,
    temperatureC: 17,
    condition: "cloudy",
    windKph: 6
  },
  {
    cityId: "paris",
    locationName: "Paris, France",
    latitude: 48.8566,
    longitude: 2.3522,
    temperatureC: 14,
    condition: "rain",
    windKph: 14
  },
  {
    cityId: "new-york",
    locationName: "New York, USA",
    latitude: 40.7128,
    longitude: -74.006,
    temperatureC: 12,
    condition: "wind",
    windKph: 21
  }
];

function toCondition(code: number, windKph: number): WeatherCondition {
  if (windKph >= 25) {
    return "wind";
  }
  if ([71, 73, 75, 77, 85, 86].includes(code)) {
    return "snow";
  }
  if ([51, 53, 55, 61, 63, 65, 80, 81, 82].includes(code)) {
    return "rain";
  }
  if ([1, 2, 3, 45, 48].includes(code)) {
    return "cloudy";
  }

  return "clear";
}

export async function fetchWeatherForCoords({
  latitude,
  longitude,
  locationName
}: {
  latitude: number;
  longitude: number;
  locationName: string;
}): Promise<WeatherContext> {
  const url =
    `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}` +
    "&current=temperature_2m,weather_code,wind_speed_10m&timezone=auto";

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error("Unable to load weather");
  }

  const payload = (await response.json()) as {
    current?: {
      temperature_2m: number;
      weather_code: number;
      wind_speed_10m: number;
    };
  };

  if (!payload.current) {
    throw new Error("Missing current weather");
  }

  return {
    source: "auto",
    locationName,
    latitude,
    longitude,
    temperatureC: payload.current.temperature_2m,
    condition: toCondition(payload.current.weather_code, payload.current.wind_speed_10m),
    windKph: payload.current.wind_speed_10m,
    fetchedAt: new Date().toISOString()
  };
}

export function contextFromManualWeather(manual: ManualWeatherSetting): WeatherContext {
  return {
    source: "manual",
    locationName: manual.locationName,
    latitude: manual.latitude,
    longitude: manual.longitude,
    temperatureC: manual.temperatureC,
    condition: manual.condition,
    windKph: manual.windKph,
    fetchedAt: new Date().toISOString()
  };
}

export function getCurrentPosition(): Promise<GeolocationPosition> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error("Geolocation unavailable"));
      return;
    }

    navigator.geolocation.getCurrentPosition(resolve, reject, {
      enableHighAccuracy: false,
      timeout: 5000,
      maximumAge: 1000 * 60 * 30
    });
  });
}
