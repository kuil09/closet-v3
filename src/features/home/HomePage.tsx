import { useMemo, useState } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { useNavigate } from "react-router-dom";
import { atelierDb } from "../../lib/db/app-db";
import type { ClosetItem, Recommendation, TemperatureBand, WeatherCondition } from "../../lib/db/types";
import { useI18n } from "../../lib/i18n/i18n";
import { categoryMessageKey, temperatureMessageKey, weatherMessageKey } from "../../lib/i18n/label-keys";
import { buildRecommendations } from "../../lib/recommendation/engine";
import { ItemImage } from "../shared/ItemImage";
import { InfoHint } from "../shared/InfoHint";
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

function pickTopEntry<T extends { count: number }>(entries: T[]) {
  return entries.reduce<T | null>((best, entry) => {
    if (!best || entry.count > best.count) {
      return entry;
    }

    return best;
  }, null);
}

function RecommendationCard({
  item,
  recommendation,
  onOpen,
  t
}: {
  item: ClosetItem;
  recommendation: Recommendation;
  onOpen: () => void;
  t: ReturnType<typeof useI18n>["t"];
}) {
  const fitTags = [
    ...recommendation.matchedTemperatureBands.map((band) => t(temperatureMessageKey(band))),
    ...recommendation.matchedWeatherTags.map((condition) => t(weatherMessageKey(condition)))
  ];

  return (
    <button type="button" className="recommendation-card item-card-button home-recommendation-card" onClick={onOpen}>
      <div className="recommendation-thumb">
        <ItemPaletteDots colors={item.paletteColors} />
        <ItemImage imageRef={item.heroImage} alt={item.name} className="cover-image garment-card-image" />
        <span className="item-chip">
          {categoryMessageKey(item.category) ? t(categoryMessageKey(item.category)!) : item.category}
        </span>
      </div>
      <div className="recommendation-body">
        <strong>{item.name}</strong>
        <p>{fitTags.join(" · ") || t("home.recommendationsEmpty")}</p>
      </div>
    </button>
  );
}

function HomeMetricCard({
  label,
  value,
  detail,
  onOpen
}: {
  label: string;
  value: string | number;
  detail: string;
  onOpen: () => void;
}) {
  return (
    <button type="button" className="home-hero-rail-card home-metric-card" onClick={onOpen}>
      <span className="section-tag">{label}</span>
      <strong>{value}</strong>
      <p>{detail}</p>
    </button>
  );
}

export function HomePage() {
  const { t } = useI18n();
  const navigate = useNavigate();
  const items = useLiveQuery(() => atelierDb.items.toArray(), [], []);
  const weatherEntry = useLiveQuery(() => atelierDb.weatherCache.get("current"), [], null);
  const [showAllRecent, setShowAllRecent] = useState(false);

  const activeItems = items.filter((item) => item.status !== "archived");
  const recentItems = [...activeItems].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
  const draftItems = recentItems.filter((item) => item.status === "draft");
  const latestDraft = draftItems[0] ?? null;
  const favoriteCount = activeItems.filter((item) => item.favorite).length;
  const weatherContext = weatherEntry?.context ?? null;
  const visibleRecentItems = showAllRecent ? recentItems : recentItems.slice(0, 4);

  const recommendedItems = useMemo(() => {
    const itemMap = new Map(activeItems.map((item) => [item.id, item]));
    return buildRecommendations(activeItems, weatherContext)
      .map((recommendation) => {
        const item = itemMap.get(recommendation.itemIds[0]);
        return item ? { item, recommendation } : null;
      })
      .filter((entry): entry is { item: ClosetItem; recommendation: Recommendation } => entry != null)
      .slice(0, 3);
  }, [activeItems, weatherContext]);

  const recommendationContext = weatherContext
    ? `${weatherContext.locationName} · ${t(weatherMessageKey(weatherContext.condition))}`
    : t("home.weatherUnavailable");

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

  const topCategory = categoryStats[0] ?? null;
  const topSeason = pickTopEntry(seasonStats);
  const topWeather = pickTopEntry(weatherStats);
  const overviewRows = [
    {
      label: t("home.overviewCategory"),
      value: topCategory ? `${topCategory.label} · ${topCategory.count}` : t("register.unset")
    },
    {
      label: t("home.overviewSeason"),
      value: topSeason && topSeason.count > 0 ? `${topSeason.label} · ${topSeason.count}` : t("register.unset")
    },
    {
      label: t("home.overviewWeather"),
      value: topWeather ? `${topWeather.label} · ${topWeather.count}` : t("home.weatherUnavailable")
    },
    {
      label: t("home.overviewStorage"),
      value: t("badge.local")
    }
  ];
  return (
    <div className="page-stack home-page">
      <section className="hero-card home-hero-card home-minimal-hero home-overview-hero">
        <div className="hero-copy home-hero-copy home-overview-copy">
          <span className="eyebrow">{t("home.heroEyebrow")}</span>
          <div className="label-with-hint home-heading-with-hint">
            <h2>{t("home.overviewTitle")}</h2>
            <InfoHint label={t("home.overviewTitle")} content={t("home.overviewBody")} align="left" />
          </div>
          <div className="home-overview-list">
            {overviewRows.map((row) => (
              <div key={row.label} className="home-overview-row">
                <span>{row.label}</span>
                <strong>{row.value}</strong>
              </div>
            ))}
          </div>
        </div>

        <div className="home-hero-rail" aria-label={t("home.stats.items")}>
          <HomeMetricCard
            label={t("home.stats.items")}
            value={activeItems.length}
            detail={topCategory ? `${topCategory.label} · ${topCategory.count}` : t("register.unset")}
            onOpen={() => navigate("/wardrobe")}
          />
          <HomeMetricCard
            label={t("home.stats.favorites")}
            value={favoriteCount}
            detail={topSeason && topSeason.count > 0 ? `${topSeason.label} · ${topSeason.count}` : t("register.unset")}
            onOpen={() => navigate("/wardrobe?favorites=1")}
          />
          <HomeMetricCard
            label={t("home.stats.drafts")}
            value={draftItems.length}
            detail={latestDraft ? latestDraft.name : t("home.quickPrimaryCapture")}
            onOpen={() => navigate(latestDraft ? `/register?item=${latestDraft.id}` : "/register")}
          />
        </div>

        <div className="hero-orb home-hero-orb" />
      </section>

      <section className="panel-card">
        <div className="panel-head home-panel-head">
          <div>
            <span className="section-tag">{t("home.recommendations")}</span>
            <h3>{t("home.recommendationsTitle")}</h3>
          </div>
          <p className="muted-copy recommendation-context">{recommendationContext}</p>
        </div>
        {recommendedItems.length > 0 ? (
          <div className="recommendation-list home-recommendation-list">
            {recommendedItems.map(({ item, recommendation }) => (
              <RecommendationCard
                key={recommendation.id}
                item={item}
                recommendation={recommendation}
                onOpen={() => navigate(`/register?item=${item.id}`)}
                t={t}
              />
            ))}
          </div>
        ) : (
          <div className="empty-state">{t("home.recommendationsEmpty")}</div>
        )}
      </section>

      <section className="panel-card">
        <div className="panel-head home-panel-head">
          <div>
            <span className="section-tag">{t("home.recent")}</span>
            <h3>{t("home.recentTitle")}</h3>
          </div>
        </div>

        {visibleRecentItems.length > 0 ? (
          <div className="wardrobe-grid home-recent-grid">
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
        ) : (
          <div className="empty-state">{t("wardrobe.empty")}</div>
        )}

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
