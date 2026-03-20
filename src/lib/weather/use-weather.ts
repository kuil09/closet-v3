import { useLiveQuery } from "dexie-react-hooks";
import { useEffect, useState } from "react";
import { atelierDb } from "../db/app-db";
import { saveWeatherContext } from "../db/repository";
import type { WeatherContext } from "../db/types";
import { usePreferencesStore } from "../state/preferences-store";
import { contextFromManualWeather, fetchWeatherForCoords, getCurrentPosition } from "./open-meteo";

interface WeatherState {
  context: WeatherContext | null;
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

export function useWeather(): WeatherState {
  const weatherMode = usePreferencesStore((state) => state.weatherMode);
  const manualWeather = usePreferencesStore((state) => state.manualWeather);
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
      if (weatherMode === "manual") {
        const manualContext = contextFromManualWeather(manualWeather);
        await saveWeatherContext(manualContext);
        setContext(manualContext);
        return;
      }

      const position = await getCurrentPosition();
      const fetched = await fetchWeatherForCoords({
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        locationName: "Current location"
      });
      await saveWeatherContext(fetched);
      setContext(fetched);
    } catch (reason) {
      const fallback = contextFromManualWeather(manualWeather);
      await saveWeatherContext(fallback);
      setContext(fallback);
      setError(reason instanceof Error ? reason.message : "Weather unavailable");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void refresh();
  }, [manualWeather, weatherMode]);

  return { context, loading, error, refresh };
}
