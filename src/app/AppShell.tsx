import type { ReactNode } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { useI18n } from "../lib/i18n/i18n";
import { weatherMessageKey } from "../lib/i18n/label-keys";
import { usePreferencesStore } from "../lib/state/preferences-store";
import { useWeather } from "../lib/weather/use-weather";
import { formatTemperature } from "../lib/utils/format";
import type { WeatherCondition } from "../lib/db/types";

const navItems = [
  { to: "/", key: "nav.home" as const, icon: "⌂" },
  { to: "/wardrobe", key: "nav.wardrobe" as const, icon: "▦" },
  { to: "/register", key: "nav.register" as const, icon: "+" }
];

function WeatherGlyph({ condition, loading }: { condition?: WeatherCondition; loading: boolean }) {
  if (loading) {
    return (
      <svg viewBox="0 0 20 20" className="weather-glyph" fill="none" aria-hidden="true">
        <circle cx="10" cy="10" r="4.2" className="weather-glyph-stroke weather-glyph-muted" />
        <path d="M10 2.8v2.1M10 15.1v2.1M2.8 10h2.1M15.1 10h2.1" className="weather-glyph-stroke weather-glyph-muted" />
      </svg>
    );
  }

  if (!condition) {
    return (
      <svg viewBox="0 0 20 20" className="weather-glyph" fill="none" aria-hidden="true">
        <circle cx="10" cy="10" r="1.5" fill="currentColor" className="weather-glyph-muted-fill" />
      </svg>
    );
  }

  if (condition === "clear") {
    return (
      <svg viewBox="0 0 20 20" className="weather-glyph" fill="none" aria-hidden="true">
        <circle cx="10" cy="10" r="3.5" className="weather-glyph-stroke" />
        <path
          d="M10 1.8v2.3M10 15.9v2.3M1.8 10h2.3M15.9 10h2.3M4.2 4.2l1.6 1.6M14.2 14.2l1.6 1.6M15.8 4.2l-1.6 1.6M5.8 14.2l-1.6 1.6"
          className="weather-glyph-stroke"
        />
      </svg>
    );
  }

  if (condition === "cloudy") {
    return (
      <svg viewBox="0 0 20 20" className="weather-glyph" fill="none" aria-hidden="true">
        <path
          d="M5.2 14.1h8.3a2.8 2.8 0 0 0 .1-5.6 4 4 0 0 0-7.5-1.1 3 3 0 0 0-.9 5.9Z"
          className="weather-glyph-stroke"
        />
      </svg>
    );
  }

  if (condition === "rain") {
    return (
      <svg viewBox="0 0 20 20" className="weather-glyph" fill="none" aria-hidden="true">
        <path
          d="M5.2 11.8h8.3a2.8 2.8 0 0 0 .1-5.6 4 4 0 0 0-7.5-1.1 3 3 0 0 0-.9 5.9Z"
          className="weather-glyph-stroke"
        />
        <path d="M7.2 13.9l-1 2.1M10 13.9l-1 2.1M12.8 13.9l-1 2.1" className="weather-glyph-stroke" />
      </svg>
    );
  }

  if (condition === "snow") {
    return (
      <svg viewBox="0 0 20 20" className="weather-glyph" fill="none" aria-hidden="true">
        <path
          d="M5.2 11.4h8.3a2.8 2.8 0 0 0 .1-5.6 4 4 0 0 0-7.5-1.1 3 3 0 0 0-.9 5.9Z"
          className="weather-glyph-stroke"
        />
        <path d="M10 13.1v3.2M8.4 14.1l3.2 1.8M11.6 14.1l-3.2 1.8" className="weather-glyph-stroke" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 20 20" className="weather-glyph" fill="none" aria-hidden="true">
      <path d="M3.4 7.3c1.6-1.9 3.6-2.9 5.8-2.9s4.1 1 5.7 2.9" className="weather-glyph-stroke" />
      <path d="M2.6 10c2-1.4 4.4-2.1 7.1-2.1s5 .7 7 2.1" className="weather-glyph-stroke" />
      <path d="M4 12.9c1.6-.8 3.6-1.2 6-1.2s4.4.4 6 1.2" className="weather-glyph-stroke" />
    </svg>
  );
}

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
          <div className="topbar-weather" aria-label={t("home.weatherTitle")}>
            <span className="topbar-weather-icon" aria-hidden="true">
              <WeatherGlyph condition={context?.condition} loading={loading} />
            </span>
            <div className="topbar-weather-copy">
              <strong>
                {loading && t("home.weatherRefreshing")}
                {!loading && context && formatTemperature(context.temperatureC, units)}
                {!loading && !context && t("home.weatherUnavailable")}
              </strong>
              <span>{context ? t(weatherMessageKey(context.condition)) : error ? t("home.weatherFallback") : t("home.weatherUnavailable")}</span>
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
          <div className="topbar-controls">
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
            <NavLink to="/settings" className="shell-topbar-link" aria-label={t("nav.settings")} title={t("nav.settings")}>
              <span className="shell-topbar-icon" aria-hidden="true">⚙</span>
            </NavLink>
          </div>
        </header>

        <main className="content-area">{children}</main>
      </div>

      <nav className="mobile-nav">
        {navItems.map((item) => {
          const isActive = item.to === "/" ? pathname === "/" : pathname.startsWith(item.to);
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={`mobile-nav-item ${isActive ? "is-active" : ""}`}
            >
              <span className="nav-icon">{item.icon}</span>
              <span>{t(item.key)}</span>
            </NavLink>
          );
        })}
      </nav>
    </div>
  );
}
