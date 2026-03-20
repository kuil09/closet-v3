import { useMemo, useState } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { useNavigate } from "react-router-dom";
import { atelierDb } from "../../lib/db/app-db";
import type { ClosetItem, TemperatureBand, WeatherCondition } from "../../lib/db/types";
import { useI18n } from "../../lib/i18n/i18n";
import { categoryMessageKey } from "../../lib/i18n/label-keys";
import { ItemImage } from "../shared/ItemImage";
import { ItemPaletteDots } from "../shared/ItemPaletteDots";

const seasonBands: Array<{ key: "winter" | "spring" | "summer" | "fall"; bands: TemperatureBand[] }> = [
  { key: "winter", bands: ["freezing", "cold"] },
  { key: "spring", bands: ["mild"] },
  { key: "summer", bands: ["warm", "hot"] },
  { key: "fall", bands: ["cold", "mild"] }
];

const weatherOrder: WeatherCondition[] = ["clear", "cloudy", "rain", "snow", "wind"];

function hasAnyTemperatureBand(item: ClosetItem, bands: TemperatureBand[]) {
  return item.temperatureBand.some((band) => bands.includes(band));
}

function CategoryIcon({ category }: { category: string }) {
  switch (category) {
    case "Outerwear":
      return (
        <svg viewBox="0 0 20 20" aria-hidden="true" className="insight-icon-svg">
          <path d="M6 4.5 9 2.8h2L14 4.5l2.2 4.2-2 1.6V17H5.8v-6.7l-2-1.6L6 4.5Z" />
          <path d="M8 5.5v3.5M12 5.5v3.5" />
        </svg>
      );
    case "Tops":
      return (
        <svg viewBox="0 0 20 20" aria-hidden="true" className="insight-icon-svg">
          <path d="m6 4 2.2-1.2h3.6L14 4l2.2 3.2-2.4 1.5V17H6.2V8.7L3.8 7.2 6 4Z" />
        </svg>
      );
    case "Bottoms":
      return (
        <svg viewBox="0 0 20 20" aria-hidden="true" className="insight-icon-svg">
          <path d="M6 3h8l1 14h-3.1L10 9.6 8.1 17H5L6 3Z" />
        </svg>
      );
    case "Shoes":
      return (
        <svg viewBox="0 0 20 20" aria-hidden="true" className="insight-icon-svg">
          <path d="M4 11.6c1.5 0 2.8-.4 4-.9l1.8-.8 1.7 1.5c1 .8 2.1 1.2 3.5 1.2H16v3.2H4v-4.2Z" />
        </svg>
      );
    case "Accessories":
      return (
        <svg viewBox="0 0 20 20" aria-hidden="true" className="insight-icon-svg">
          <path d="M5.5 10a4.5 4.5 0 1 1 9 0 4.5 4.5 0 1 1-9 0Z" />
          <path d="M10 5.5V3.2M10 16.8v-2.3M5.5 10H3.2M16.8 10h-2.3" />
        </svg>
      );
    default:
      return (
        <svg viewBox="0 0 20 20" aria-hidden="true" className="insight-icon-svg">
          <circle cx="10" cy="10" r="5.4" />
        </svg>
      );
  }
}

function SeasonIcon({ season }: { season: "winter" | "spring" | "summer" | "fall" }) {
  switch (season) {
    case "winter":
      return (
        <svg viewBox="0 0 20 20" aria-hidden="true" className="insight-icon-svg">
          <path d="M10 2.6v14.8M4.4 5.2l11.2 9.6M15.6 5.2 4.4 14.8M3.3 10h13.4" />
        </svg>
      );
    case "spring":
      return (
        <svg viewBox="0 0 20 20" aria-hidden="true" className="insight-icon-svg">
          <path d="M10 16.5c4.2 0 6.2-3 6.2-6.1 0-2.1-1.2-4-3.3-4.7-.4-2-1.9-3.2-3.9-3.2-2.5 0-4.2 1.8-4.2 4.3-2 1-3 2.8-3 4.7 0 3.1 2 5 8.2 5Z" />
        </svg>
      );
    case "summer":
      return (
        <svg viewBox="0 0 20 20" aria-hidden="true" className="insight-icon-svg">
          <circle cx="10" cy="10" r="4" />
          <path d="M10 2.6v2.1M10 15.3v2.1M2.6 10h2.1M15.3 10h2.1M4.8 4.8l1.5 1.5M13.7 13.7l1.5 1.5M15.2 4.8l-1.5 1.5M6.3 13.7l-1.5 1.5" />
        </svg>
      );
    case "fall":
      return (
        <svg viewBox="0 0 20 20" aria-hidden="true" className="insight-icon-svg">
          <path d="M10.4 3.2c3.6 1.6 5.2 4.4 5.2 7.3 0 3.3-2.4 6.3-6.2 6.3-2.9 0-5.1-1.9-5.1-4.8 0-4.8 4.1-6.7 6.1-8.8Z" />
          <path d="M8.6 10.4c1.3-.3 2.4-.9 3.4-1.9" />
        </svg>
      );
  }
}

function WeatherIcon({ condition }: { condition: WeatherCondition }) {
  switch (condition) {
    case "clear":
      return (
        <svg viewBox="0 0 20 20" aria-hidden="true" className="insight-icon-svg">
          <circle cx="10" cy="10" r="3.4" />
          <path d="M10 1.8v2.3M10 15.9v2.3M1.8 10h2.3M15.9 10h2.3M4.2 4.2l1.6 1.6M14.2 14.2l1.6 1.6M15.8 4.2l-1.6 1.6M5.8 14.2l-1.6 1.6" />
        </svg>
      );
    case "cloudy":
      return (
        <svg viewBox="0 0 20 20" aria-hidden="true" className="insight-icon-svg">
          <path d="M6.5 15.2h7.2c2.1 0 3.5-1.4 3.5-3.2 0-1.7-1.1-3-2.8-3.2C14 6.1 12.4 4.7 10 4.7 7.4 4.7 5.7 6.3 5.4 8.6 3.8 8.8 2.8 10 2.8 11.5c0 2 1.5 3.7 3.7 3.7Z" />
        </svg>
      );
    case "rain":
      return (
        <svg viewBox="0 0 20 20" aria-hidden="true" className="insight-icon-svg">
          <path d="M6.1 12.2h7.4c2 0 3.4-1.3 3.4-3 0-1.6-1.1-2.9-2.7-3.1C13.9 4.3 12.3 3 10 3 7.5 3 5.8 4.5 5.4 6.7 3.9 7 3 8.1 3 9.5c0 1.8 1.3 2.7 3.1 2.7Z" />
          <path d="M7 13.8 5.9 16M10.1 13.8 9 16M13.2 13.8 12.1 16" />
        </svg>
      );
    case "snow":
      return (
        <svg viewBox="0 0 20 20" aria-hidden="true" className="insight-icon-svg">
          <path d="M6.1 11.4h7.4c2 0 3.4-1.3 3.4-3 0-1.6-1.1-2.9-2.7-3.1C13.9 3.6 12.3 2.3 10 2.3c-2.5 0-4.2 1.5-4.6 3.7C3.9 6.3 3 7.4 3 8.8c0 1.8 1.3 2.6 3.1 2.6Z" />
          <path d="M7.3 13.4v3.2M5.9 14.2l2.8 1.6M8.7 14.2l-2.8 1.6M12.7 13.4v3.2M11.3 14.2l2.8 1.6M14.1 14.2l-2.8 1.6" />
        </svg>
      );
    case "wind":
      return (
        <svg viewBox="0 0 20 20" aria-hidden="true" className="insight-icon-svg">
          <path d="M3 8.1h8.8c1.4 0 2.4-.9 2.4-2.1 0-1-.8-1.8-1.9-1.8-1 0-1.8.6-1.9 1.5" />
          <path d="M3 11.7h11.2c1.5 0 2.6.9 2.6 2.1 0 1.1-.9 2-2.2 2-1.2 0-2-.7-2.1-1.6" />
        </svg>
      );
  }
}

export function HomePage() {
  const { t } = useI18n();
  const navigate = useNavigate();
  const items = useLiveQuery(() => atelierDb.items.toArray(), [], []);
  const [showAllRecent, setShowAllRecent] = useState(false);

  const activeItems = items.filter((item) => item.status !== "archived");
  const recentItems = [...activeItems].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
  const visibleRecentItems = showAllRecent ? recentItems : recentItems.slice(0, 4);
  const categoryStats = useMemo(
    () =>
      Array.from(
        activeItems.reduce((map, item) => map.set(item.category, (map.get(item.category) ?? 0) + 1), new Map<string, number>())
      )
        .sort((left, right) => right[1] - left[1] || left[0].localeCompare(right[0]))
        .map(([category, count]) => ({
          category,
          label: categoryMessageKey(category) ? t(categoryMessageKey(category)!) : category,
          count
        })),
    [activeItems, t]
  );
  const seasonStats = useMemo(
    () =>
      seasonBands.map((season) => ({
        key: season.key,
        label: t(
          season.key === "winter"
            ? "home.seasonWinter"
            : season.key === "spring"
              ? "home.seasonSpring"
              : season.key === "summer"
                ? "home.seasonSummer"
                : "home.seasonFall"
        ),
        count: activeItems.filter((item) => hasAnyTemperatureBand(item, season.bands)).length
      })),
    [activeItems, t]
  );
  const weatherStats = useMemo(
    () =>
      weatherOrder
        .map((condition) => ({
          condition,
          label: t(`weather.${condition}` as const),
          count: activeItems.filter((item) => item.weatherTags.includes(condition)).length
        }))
        .filter((entry) => entry.count > 0),
    [activeItems, t]
  );
  const categoryPeak = Math.max(1, ...categoryStats.map((entry) => entry.count));
  const categoryTotal = Math.max(1, categoryStats.reduce((sum, entry) => sum + entry.count, 0));
  const conditionPeak = Math.max(1, ...seasonStats.map((entry) => entry.count), ...weatherStats.map((entry) => entry.count));

  return (
    <div className="page-stack">
      <section className="stats-grid">
        <button className="stat-card stat-card-button" type="button" onClick={() => navigate("/wardrobe")}>
          <span>{t("home.stats.items")}</span>
          <strong>{activeItems.length}</strong>
        </button>
        <button className="stat-card stat-card-button" type="button" onClick={() => navigate("/wardrobe?favorites=1")}>
          <span>{t("home.stats.favorites")}</span>
          <strong>{activeItems.filter((item) => item.favorite).length}</strong>
        </button>
      </section>

      <section className="insight-grid">
        <article className="panel-card insight-card">
          <div className="panel-head">
            <div>
              <span className="section-tag">{t("home.insightsCategory")}</span>
              <h3>{t("home.insightsCategoryTitle")}</h3>
            </div>
          </div>
          <div className="insight-distribution" aria-hidden="true">
            {categoryStats.map((entry) => (
              <span
                key={entry.label}
                className="insight-distribution-segment"
                style={{ width: `${(entry.count / categoryTotal) * 100}%` }}
              />
            ))}
          </div>
          <div className="metric-list metric-list-rich">
            {categoryStats.map((entry) => (
              <div key={entry.label} className="metric-row">
                <div className="metric-leading">
                  <span className="metric-icon-shell" aria-hidden="true">
                    <CategoryIcon category={entry.category} />
                  </span>
                  <div className="metric-copy">
                    <span>{entry.label}</span>
                    <div className="metric-bar">
                      <span className="metric-bar-fill" style={{ width: `${(entry.count / categoryPeak) * 100}%` }} />
                    </div>
                  </div>
                </div>
                <strong>{entry.count}</strong>
              </div>
            ))}
          </div>
        </article>

        <article className="panel-card insight-card">
          <div className="panel-head">
            <div>
              <span className="section-tag">{t("home.insightsCondition")}</span>
              <h3>{t("home.insightsConditionTitle")}</h3>
            </div>
          </div>
          <div className="condition-insight-grid">
            <div className="metric-group">
              <span className="section-tag">{t("home.insightsSeason")}</span>
              <div className="metric-list metric-list-rich">
                {seasonStats.map((entry) => (
                  <div key={entry.key} className="metric-row">
                    <div className="metric-leading">
                      <span className="metric-icon-shell" aria-hidden="true">
                        <SeasonIcon season={entry.key} />
                      </span>
                      <div className="metric-copy">
                        <span>{entry.label}</span>
                        <div className="metric-bar">
                          <span className="metric-bar-fill" style={{ width: `${(entry.count / conditionPeak) * 100}%` }} />
                        </div>
                      </div>
                    </div>
                    <strong>{entry.count}</strong>
                  </div>
                ))}
              </div>
            </div>
            <div className="metric-group">
              <span className="section-tag">{t("home.insightsWeather")}</span>
              <div className="metric-list metric-list-rich">
                {weatherStats.map((entry) => (
                  <div key={entry.condition} className="metric-row">
                    <div className="metric-leading">
                      <span className="metric-icon-shell" aria-hidden="true">
                        <WeatherIcon condition={entry.condition} />
                      </span>
                      <div className="metric-copy">
                        <span>{entry.label}</span>
                        <div className="metric-bar">
                          <span className="metric-bar-fill" style={{ width: `${(entry.count / conditionPeak) * 100}%` }} />
                        </div>
                      </div>
                    </div>
                    <strong>{entry.count}</strong>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </article>
      </section>

      <section className="panel-card">
        <div className="panel-head">
          <div>
            <span className="section-tag">{t("home.recent")}</span>
            <h3>{t("home.recentTitle")}</h3>
          </div>
        </div>
        <div className="wardrobe-grid">
          {visibleRecentItems.map((item) => (
            <button
              key={item.id}
              type="button"
              className="item-card item-card-button"
              onClick={() => navigate(`/register?item=${item.id}`)}
            >
              <div className="item-image-wrap">
                <ItemPaletteDots colors={item.paletteColors} />
                <ItemImage imageRef={item.heroImage} alt={item.name} className="cover-image garment-card-image" />
                <span className="item-chip">
                  {categoryMessageKey(item.category) ? t(categoryMessageKey(item.category)!) : item.category}
                </span>
              </div>
              <div className="item-card-body">
                <strong>{item.name}</strong>
              </div>
            </button>
          ))}
        </div>
        {recentItems.length > 4 ? (
          <button
            type="button"
            className="recent-expand-bar"
            aria-label={showAllRecent ? t("home.recentLess") : t("home.recentMore")}
            title={showAllRecent ? t("home.recentLess") : t("home.recentMore")}
            onClick={() => setShowAllRecent((current) => !current)}
          >
            <span className="recent-expand-bar-line" aria-hidden="true" />
            <span className={`recent-expand-bar-icon ${showAllRecent ? "is-open" : ""}`} aria-hidden="true">
              ↓
            </span>
          </button>
        ) : null}
      </section>
    </div>
  );
}
