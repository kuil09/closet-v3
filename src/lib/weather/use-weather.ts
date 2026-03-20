import { useLiveQuery } from "dexie-react-hooks";
import { useEffect, useState } from "react";
import { atelierDb } from "../db/app-db";
import { saveWeatherContext } from "../db/repository";
import type { WeatherContext } from "../db/types";
import { fetchWeatherForCoords, getCurrentPosition } from "./open-meteo";

interface WeatherState {
  context: WeatherContext | null;
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

function toWeatherErrorMessage(reason: unknown): string {
  if (reason instanceof Error) {
    return reason.message;
  }

  if (typeof reason === "object" && reason && "message" in reason) {
    const message = reason.message;
    if (typeof message === "string" && message.trim().length > 0) {
      return message;
    }
  }

  return "Weather unavailable";
}

export function useWeather(): WeatherState {
  const cached = useLiveQuery(() => atelierDb.weatherCache.get("current"), []);
  const [context, setContext] = useState<WeatherContext | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!context && cached?.context) {
      setContext(cached.context);
      setLoading(false);
    }
  }, [cached, context]);

  async function refresh() {
    setLoading(true);
    setError(null);
    try {
      const position = await getCurrentPosition();
      const fetched = await fetchWeatherForCoords({
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        locationName: "Current location"
      });
      await saveWeatherContext(fetched);
      setContext(fetched);
    } catch (reason) {
      setContext(null);
      setError(toWeatherErrorMessage(reason));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void refresh();
  }, []);

  return { context, loading, error, refresh };
}
