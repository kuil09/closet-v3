import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { AppPreferences, Locale, ManualWeatherSetting, MotionMode, ThemeMode, Units, WeatherMode } from "../db/types";

export const defaultManualWeather: ManualWeatherSetting = {
  cityId: "seoul",
  locationName: "Seoul, South Korea",
  latitude: 37.5665,
  longitude: 126.978,
  temperatureC: 18,
  condition: "clear",
  windKph: 8
};

export const defaultPreferences: AppPreferences = {
  theme: "light",
  language: "en",
  units: "C",
  weatherMode: "auto",
  manualWeather: defaultManualWeather,
  motion: "full"
};

interface PreferencesState extends AppPreferences {
  setTheme: (theme: ThemeMode) => void;
  setLanguage: (language: Locale) => void;
  setUnits: (units: Units) => void;
  setWeatherMode: (mode: WeatherMode) => void;
  setManualWeather: (manualWeather: ManualWeatherSetting) => void;
  setMotion: (motion: MotionMode) => void;
}

export const usePreferencesStore = create<PreferencesState>()(
  persist(
    (set) => ({
      ...defaultPreferences,
      setTheme: (theme) => set({ theme }),
      setLanguage: (language) => set({ language }),
      setUnits: (units) => set({ units }),
      setWeatherMode: (weatherMode) => set({ weatherMode }),
      setManualWeather: (manualWeather) => set({ manualWeather }),
      setMotion: (motion) => set({ motion })
    }),
    {
      name: "atelier-preferences-v1"
    }
  )
);
