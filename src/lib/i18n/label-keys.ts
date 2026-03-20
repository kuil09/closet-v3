import type { MessageKey } from "./messages";
import type { MetaAssetType, TemperatureBand, WeatherCondition } from "../db/types";

export function categoryMessageKey(category: string): MessageKey | null {
  switch (category) {
    case "Outerwear":
      return "register.categoryOuterwear";
    case "Tops":
      return "register.categoryTops";
    case "Bottoms":
      return "register.categoryBottoms";
    case "Shoes":
      return "register.categoryShoes";
    case "Accessories":
      return "register.categoryAccessories";
    default:
      return null;
  }
}

export function weatherMessageKey(condition: WeatherCondition): MessageKey {
  switch (condition) {
    case "clear":
      return "weather.clear";
    case "cloudy":
      return "weather.cloudy";
    case "rain":
      return "weather.rain";
    case "snow":
      return "weather.snow";
    case "wind":
      return "weather.wind";
  }
}

export function temperatureMessageKey(band: TemperatureBand): MessageKey {
  switch (band) {
    case "freezing":
      return "register.tempFreezing";
    case "cold":
      return "register.tempCold";
    case "mild":
      return "register.tempMild";
    case "warm":
      return "register.tempWarm";
    case "hot":
      return "register.tempHot";
  }
}

export function metaAssetTypeMessageKey(type: MetaAssetType): MessageKey {
  switch (type) {
    case "care":
      return "register.metaTypeCare";
    case "price_tag":
      return "register.metaTypePriceTag";
    case "receipt":
      return "register.metaTypeReceipt";
    case "extra":
      return "register.metaTypeExtra";
  }
}
