export type Locale = "en" | "ko" | "ja" | "fr" | "es" | "de" | "zh-CN";
export type ThemeMode = "light" | "dark";
export type Units = "C" | "F";
export type WeatherMode = "auto" | "manual";

export type ItemStatus = "draft" | "saved" | "archived";
export type UsageFrequency = "rarely" | "regularly" | "often";
export type TemperatureBand = "freezing" | "cold" | "mild" | "warm" | "hot";
export type WeatherCondition = "clear" | "cloudy" | "rain" | "snow" | "wind";
export type MetaAssetType = "care" | "price_tag" | "receipt" | "extra";

export interface MetaAsset {
  id: string;
  itemId: string;
  type: MetaAssetType;
  imageId: string;
  label: string;
  createdAt: string;
}

export interface StoredImage {
  id: string;
  blob: Blob;
  mimeType: string;
  width: number;
  height: number;
  thumbnailBlob: Blob;
  dominantColor?: string;
  createdAt: string;
}

export interface ClosetItem {
  id: string;
  status: ItemStatus;
  name: string;
  category: string;
  materials: string[];
  heroImage: string | null;
  galleryImageIds: string[];
  paletteColors: string[];
  purchaseDate: string | null;
  price: number | null;
  currency: string;
  storageLocation: string;
  temperatureBand: TemperatureBand[];
  weatherTags: WeatherCondition[];
  occasionTags: string[];
  usageFrequency: UsageFrequency;
  favorite: boolean;
  styleNotes: string;
  metaAssets: MetaAsset[];
  createdAt: string;
  updatedAt: string;
  lastWornAt?: string | null;
}

export interface WeatherContext {
  source: "auto" | "manual";
  locationName: string;
  latitude?: number;
  longitude?: number;
  temperatureC: number;
  condition: WeatherCondition;
  windKph: number;
  fetchedAt: string;
}

export interface Recommendation {
  id: string;
  kind: "item";
  itemIds: string[];
  reason: string;
  score: number;
  matchedWeatherTags: WeatherCondition[];
  matchedTemperatureBands: TemperatureBand[];
}

export interface ManualWeatherSetting {
  cityId: string;
  locationName: string;
  latitude: number;
  longitude: number;
  temperatureC: number;
  condition: WeatherCondition;
  windKph: number;
}

export interface AppPreferences {
  theme: ThemeMode;
  language: Locale;
  units: Units;
  weatherMode: WeatherMode;
  manualWeather: ManualWeatherSetting;
}

export interface WeatherCacheEntry {
  id: string;
  context: WeatherContext;
}
