import { useMemo } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { atelierDb } from "../../lib/db/app-db";
import { buildRecommendations } from "../../lib/recommendation/engine";
import { useWeather } from "../../lib/weather/use-weather";
import { useI18n } from "../../lib/i18n/i18n";
import { usePreferencesStore } from "../../lib/state/preferences-store";
import { formatTemperature } from "../../lib/utils/format";
import { ItemImage } from "../shared/ItemImage";

export function HomePage() {
  const { t } = useI18n();
  const units = usePreferencesStore((state) => state.units);
  const items = useLiveQuery(() => atelierDb.items.toArray(), [], []);
  const lookbooks = useLiveQuery(() => atelierDb.lookbooks.toArray(), [], []);
  const { context, loading, error, refresh } = useWeather();

  const activeItems = items.filter((item) => item.status !== "archived");
  const recentItems = [...activeItems].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)).slice(0, 4);
  const recommendations = useMemo(
    () => buildRecommendations(activeItems, lookbooks, context).slice(0, 4),
    [activeItems, context, lookbooks]
  );
  const todayLook = lookbooks[0];

  return (
    <div className="page-stack">
      <section className="hero-card">
        <div className="hero-copy">
          <span className="section-tag">{t("home.heroEyebrow")}</span>
          <h2>{t("home.heroTitle")}</h2>
          <p>{t("home.heroBody")}</p>
        </div>
        <div className="hero-orb" />
      </section>

      <section className="stats-grid">
        <div className="stat-card">
          <span>{t("home.stats.items")}</span>
          <strong>{activeItems.length}</strong>
        </div>
        <div className="stat-card">
          <span>{t("home.stats.lookbooks")}</span>
          <strong>{lookbooks.length}</strong>
        </div>
        <div className="stat-card">
          <span>{t("home.stats.favorites")}</span>
          <strong>{activeItems.filter((item) => item.favorite).length}</strong>
        </div>
      </section>

      <section className="weather-card">
        <div>
          <span className="section-tag">{t("home.weatherTitle")}</span>
          <h3>
            {loading && t("home.weatherRefreshing")}
            {!loading && context && `${formatTemperature(context.temperatureC, units)} · ${context.locationName}`}
          </h3>
          <p>
            {context ? `${context.condition} · ${Math.round(context.windKph)} kph wind` : t("home.weatherUnavailable")}
          </p>
          {error ? <small>{`${error}. ${t("home.weatherFallback")}`}</small> : null}
        </div>
        <button className="secondary-button" onClick={() => void refresh()}>
          {t("home.weatherRefresh")}
        </button>
      </section>

      <section className="two-column-grid">
        <article className="panel-card">
          <div className="panel-head">
            <div>
              <span className="section-tag">{t("home.todayLook")}</span>
              <h3>{todayLook?.title ?? t("home.todayLookEmpty")}</h3>
            </div>
          </div>
          {todayLook ? (
            <div className="today-look-card">
              <div className={`lookbook-poster is-${todayLook.backgroundStyle}`}>
                <div className="lookbook-overlay">{todayLook.title}</div>
              </div>
              <p>{todayLook.description}</p>
            </div>
          ) : (
            <p className="muted-copy">{t("home.todayLookEmptyBody")}</p>
          )}
        </article>

        <article className="panel-card">
          <div className="panel-head">
            <div>
              <span className="section-tag">{t("home.recommendations")}</span>
              <h3>{t("home.recommendationsTitle")}</h3>
            </div>
          </div>
          <div className="recommendation-list">
            {recommendations.map((recommendation) => {
              const item = activeItems.find((entry) => entry.id === recommendation.itemIds[0]);
              if (!item) {
                return null;
              }

              return (
                <div key={recommendation.id} className="recommendation-card">
                  <div className="recommendation-thumb">
                    <ItemImage imageRef={item.heroImage} alt={item.name} className="cover-image" />
                  </div>
                  <div>
                    <strong>{item.name}</strong>
                    <p>{recommendation.reason}</p>
                  </div>
                </div>
              );
            })}
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
          {recentItems.map((item) => (
            <article key={item.id} className="item-card">
              <div className="item-image-wrap">
                <ItemImage imageRef={item.heroImage} alt={item.name} className="cover-image" />
                <span className="item-chip">{item.category}</span>
              </div>
              <div className="item-meta">
                <strong>{item.name}</strong>
                <span>{item.materials.join(" · ")}</span>
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
