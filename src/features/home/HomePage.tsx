import { useState } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { useNavigate } from "react-router-dom";
import { atelierDb } from "../../lib/db/app-db";
import { useWeather } from "../../lib/weather/use-weather";
import { useI18n } from "../../lib/i18n/i18n";
import { usePreferencesStore } from "../../lib/state/preferences-store";
import { formatTemperature } from "../../lib/utils/format";
import { ItemImage } from "../shared/ItemImage";

export function HomePage() {
  const { t } = useI18n();
  const navigate = useNavigate();
  const units = usePreferencesStore((state) => state.units);
  const items = useLiveQuery(() => atelierDb.items.toArray(), [], []);
  const lookbooks = useLiveQuery(() => atelierDb.lookbooks.toArray(), [], []);
  const { context, loading, error } = useWeather();
  const [showAllRecent, setShowAllRecent] = useState(false);
  const [showAllLookbooks, setShowAllLookbooks] = useState(false);

  const activeItems = items.filter((item) => item.status !== "archived");
  const recentItems = [...activeItems].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
  const visibleRecentItems = showAllRecent ? recentItems : recentItems.slice(0, 4);
  const sortedLookbooks = [...lookbooks].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
  const visibleLookbooks = showAllLookbooks ? sortedLookbooks : sortedLookbooks.slice(0, 4);

  return (
    <div className="page-stack">
      <section className="stats-grid">
        <button className="stat-card stat-card-button" type="button" onClick={() => navigate("/wardrobe")}>
          <span>{t("home.stats.items")}</span>
          <strong>{activeItems.length}</strong>
        </button>
        <button className="stat-card stat-card-button" type="button" onClick={() => navigate("/lookbook")}>
          <span>{t("home.stats.lookbooks")}</span>
          <strong>{lookbooks.length}</strong>
        </button>
        <button className="stat-card stat-card-button" type="button" onClick={() => navigate("/wardrobe?favorites=1")}>
          <span>{t("home.stats.favorites")}</span>
          <strong>{activeItems.filter((item) => item.favorite).length}</strong>
        </button>
      </section>

      <section className="weather-card">
        <div>
          <span className="section-tag">{t("home.weatherTitle")}</span>
          <h3>
            {loading && t("home.weatherRefreshing")}
            {!loading && context && `${formatTemperature(context.temperatureC, units)} · ${context.locationName}`}
            {!loading && !context && t("home.weatherUnavailable")}
          </h3>
          <div className="weather-meta">
            <p>{context ? `${context.condition} · ${Math.round(context.windKph)} kph wind` : t("home.weatherUnavailable")}</p>
            {error ? <small>{`${error}. ${t("home.weatherFallback")}`}</small> : null}
          </div>
        </div>
      </section>

      <section className="panel-card">
        <div className="panel-head">
          <div>
            <span className="section-tag">{t("home.todayLook")}</span>
            <h3>{sortedLookbooks.length > 0 ? t("home.todayLook") : t("home.todayLookEmpty")}</h3>
          </div>
        </div>
        {sortedLookbooks.length > 0 ? (
          <div className="lookbook-grid">
            {visibleLookbooks.map((lookbook) => (
              <article key={lookbook.id} className="lookbook-card">
                <div className={`lookbook-poster is-${lookbook.backgroundStyle}`}>
                  <div className="lookbook-overlay">{lookbook.title}</div>
                </div>
                <div className="lookbook-card-body">
                  <strong>{lookbook.title}</strong>
                  {lookbook.description ? (
                    <div className="item-detail-scroll">
                      <span>{lookbook.description}</span>
                    </div>
                  ) : null}
                </div>
              </article>
            ))}
          </div>
        ) : (
          <p className="muted-copy">{t("home.todayLookEmptyBody")}</p>
        )}
        {sortedLookbooks.length > 4 ? (
          <button className="secondary-button" onClick={() => setShowAllLookbooks((current) => !current)}>
            {showAllLookbooks ? t("home.lookbooksLess") : t("home.lookbooksMore")}
          </button>
        ) : null}
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
            <article key={item.id} className="item-card">
              <div className="item-image-wrap">
                <ItemImage imageRef={item.heroImage} alt={item.name} className="cover-image" />
                <span className="item-chip">{item.category}</span>
              </div>
              <div className="item-card-body">
                <strong>{item.name}</strong>
                <div className="item-detail-scroll">
                  <span>{item.materials.join(" · ")}</span>
                </div>
              </div>
            </article>
          ))}
        </div>
        {recentItems.length > 4 ? (
          <button className="secondary-button" onClick={() => setShowAllRecent((current) => !current)}>
            {showAllRecent ? t("home.recentLess") : t("home.recentMore")}
          </button>
        ) : null}
      </section>
    </div>
  );
}
