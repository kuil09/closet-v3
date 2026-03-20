import type { ReactNode } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { useI18n } from "../lib/i18n/i18n";
import { usePreferencesStore } from "../lib/state/preferences-store";
import { useWeather } from "../lib/weather/use-weather";
import { formatTemperature } from "../lib/utils/format";
import type { WeatherCondition } from "../lib/db/types";

const navItems = [
  { to: "/", key: "nav.home" as const, icon: "⌂" },
  { to: "/wardrobe", key: "nav.wardrobe" as const, icon: "▦" },
  { to: "/register", key: "nav.register" as const, icon: "+" },
  { to: "/lookbook", key: "nav.lookbook" as const, icon: "✦" },
  { to: "/settings", key: "nav.settings" as const, icon: "⚙" }
];

const weatherIcons: Record<WeatherCondition, string> = {
  clear: "☀",
  cloudy: "☁",
  rain: "☂",
  snow: "❄",
  wind: "≋"
};

export function AppShell({ children }: { children: ReactNode }) {
  const { pathname } = useLocation();
  const { t } = useI18n();
  const theme = usePreferencesStore((state) => state.theme);
  const setTheme = usePreferencesStore((state) => state.setTheme);
  const language = usePreferencesStore((state) => state.language);
  const setLanguage = usePreferencesStore((state) => state.setLanguage);
  const units = usePreferencesStore((state) => state.units);
  const setUnits = usePreferencesStore((state) => state.setUnits);
  const { context, loading, error } = useWeather();

  const activeLabel =
    navItems.find((item) => (item.to === "/" ? pathname === "/" : pathname.startsWith(item.to)))?.key ?? "nav.home";
  const weatherIcon = context ? weatherIcons[context.condition] : loading ? "◌" : "·";

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand-block">
          <div className="brand-mark">The Atelier</div>
        </div>
        <nav className="nav-list">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) => `nav-item ${isActive ? "is-active" : ""}`}
            >
              <span className="nav-icon">{item.icon}</span>
              <span>{t(item.key)}</span>
            </NavLink>
          ))}
        </nav>
      </aside>

      <div className="app-main">
        <header className="topbar">
          <div>
            <div className="eyebrow">{t("app.title")}</div>
            <h1 className="page-title">{t(activeLabel)}</h1>
          </div>
          <div className="topbar-controls">
            <div className="topbar-weather" aria-label={t("home.weatherTitle")}>
              <span className="topbar-weather-icon" aria-hidden="true">
                {weatherIcon}
              </span>
              <div className="topbar-weather-copy">
                <strong>
                  {loading && t("home.weatherRefreshing")}
                  {!loading && context && formatTemperature(context.temperatureC, units)}
                  {!loading && !context && t("home.weatherUnavailable")}
                </strong>
                <span>{context ? context.condition : error ? error : t("home.weatherUnavailable")}</span>
              </div>
              <div className="weather-actions topbar-weather-actions" aria-label={t("settings.units")}>
                <button
                  type="button"
                  className={`weather-unit-toggle ${units === "C" ? "is-active" : ""}`}
                  aria-label={t("settings.unitsC")}
                  aria-pressed={units === "C"}
                  onClick={() => setUnits("C")}
                >
                  C
                </button>
                <button
                  type="button"
                  className={`weather-unit-toggle ${units === "F" ? "is-active" : ""}`}
                  aria-label={t("settings.unitsF")}
                  aria-pressed={units === "F"}
                  onClick={() => setUnits("F")}
                >
                  F
                </button>
              </div>
            </div>
            <select
              aria-label={t("settings.language")}
              className="control-select shell-language-select"
              value={language}
              onChange={(event) => setLanguage(event.target.value as typeof language)}
            >
              <option value="en">EN</option>
              <option value="ko">KO</option>
              <option value="ja">JA</option>
              <option value="fr">FR</option>
              <option value="es">ES</option>
              <option value="de">DE</option>
              <option value="zh-CN">ZH</option>
            </select>
            <button
              aria-label={t("settings.theme")}
              className="theme-toggle shell-theme-toggle"
              onClick={() => setTheme(theme === "light" ? "dark" : "light")}
            >
              <span aria-hidden="true">{theme === "light" ? "◐" : "◑"}</span>
            </button>
          </div>
        </header>

        <main className="content-area">{children}</main>
      </div>

      <nav className="mobile-nav">
        {navItems.map((item) => {
          const isActive = item.to === "/" ? pathname === "/" : pathname.startsWith(item.to);
          return (
            <NavLink key={item.to} to={item.to} className={`mobile-nav-item ${isActive ? "is-active" : ""}`}>
              <span className="nav-icon">{item.icon}</span>
              <span>{t(item.key)}</span>
            </NavLink>
          );
        })}
      </nav>
    </div>
  );
}
