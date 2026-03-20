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
          <div className="metric-list">
            {categoryStats.map((entry) => (
              <div key={entry.label} className="metric-row">
                <span>{entry.label}</span>
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
              <div className="metric-list">
                {seasonStats.map((entry) => (
                  <div key={entry.key} className="metric-row">
                    <span>{entry.label}</span>
                    <strong>{entry.count}</strong>
                  </div>
                ))}
              </div>
            </div>
            <div className="metric-group">
              <span className="section-tag">{t("home.insightsWeather")}</span>
              <div className="metric-list">
                {weatherStats.map((entry) => (
                  <div key={entry.condition} className="metric-row">
                    <span>{entry.label}</span>
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
