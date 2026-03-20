import { useMemo, useState, type ReactNode } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { useNavigate } from "react-router-dom";
import { atelierDb } from "../../lib/db/app-db";
import type { ClosetItem, Recommendation, TemperatureBand, WeatherCondition } from "../../lib/db/types";
import { useI18n } from "../../lib/i18n/i18n";
import { categoryMessageKey, temperatureMessageKey, weatherMessageKey } from "../../lib/i18n/label-keys";
import { buildRecommendations } from "../../lib/recommendation/engine";
import { ItemImage } from "../shared/ItemImage";
import { ItemPaletteDots } from "../shared/ItemPaletteDots";

const seasonBands: Array<{ key: "winter" | "spring" | "summer" | "fall"; bands: TemperatureBand[] }> = [
  { key: "winter", bands: ["freezing", "cold"] },
  { key: "spring", bands: ["mild"] },
  { key: "summer", bands: ["warm", "hot"] },
  { key: "fall", bands: ["cold", "mild"] }
];

const weatherOrder: WeatherCondition[] = ["clear", "cloudy", "rain", "snow", "wind"];
const categoryColors = ["#2C3331", "#7F6B4E", "#9A8F7F", "#B6ACA0", "#D7D2CA"];
const seasonColors = ["#88A1B5", "#9BAE8A", "#D8A34A", "#94755B"];
const weatherColors: Record<WeatherCondition, string> = {
  clear: "#D8A34A",
  cloudy: "#AAB1B6",
  rain: "#6B88A8",
  snow: "#D8E3EE",
  wind: "#8E9489"
};
const DONUT_WIDTH = 360;
const DONUT_HEIGHT = 260;
const DONUT_CENTER_X = 180;
const DONUT_CENTER_Y = 130;
const DONUT_OUTER_RADIUS = 66;
const DONUT_INNER_RADIUS = 38;

type SliceSide = "left" | "right";

interface DonutSlice {
  key: string;
  label: string;
  count: number;
  percent: number;
  color: string;
  path: string;
  side: SliceSide;
  lineStartX: number;
  lineStartY: number;
  lineBendX: number;
  lineBendY: number;
  labelY: number;
}

function hasAnyTemperatureBand(item: ClosetItem, bands: TemperatureBand[]) {
  return item.temperatureBand.some((band) => bands.includes(band));
}

function polarToCartesian(cx: number, cy: number, radius: number, angle: number) {
  return {
    x: cx + Math.cos(angle) * radius,
    y: cy + Math.sin(angle) * radius
  };
}

function describeDonutSlice(startAngle: number, endAngle: number) {
  const startOuter = polarToCartesian(DONUT_CENTER_X, DONUT_CENTER_Y, DONUT_OUTER_RADIUS, startAngle);
  const endOuter = polarToCartesian(DONUT_CENTER_X, DONUT_CENTER_Y, DONUT_OUTER_RADIUS, endAngle);
  const startInner = polarToCartesian(DONUT_CENTER_X, DONUT_CENTER_Y, DONUT_INNER_RADIUS, endAngle);
  const endInner = polarToCartesian(DONUT_CENTER_X, DONUT_CENTER_Y, DONUT_INNER_RADIUS, startAngle);
  const largeArcFlag = endAngle - startAngle > Math.PI ? 1 : 0;

  return [
    `M ${startOuter.x} ${startOuter.y}`,
    `A ${DONUT_OUTER_RADIUS} ${DONUT_OUTER_RADIUS} 0 ${largeArcFlag} 1 ${endOuter.x} ${endOuter.y}`,
    `L ${startInner.x} ${startInner.y}`,
    `A ${DONUT_INNER_RADIUS} ${DONUT_INNER_RADIUS} 0 ${largeArcFlag} 0 ${endInner.x} ${endInner.y}`,
    "Z"
  ].join(" ");
}

function spreadSideLabels<T extends { side: SliceSide; lineBendY: number }>(entries: T[]) {
  const minY = 28;
  const maxY = DONUT_HEIGHT - 28;
  const gap = 34;

  function adjust(list: Array<T & { labelY: number }>) {
    for (let index = 0; index < list.length; index += 1) {
      const previous = list[index - 1];
      const current = list[index];
      if (!current) {
        continue;
      }

      current.labelY = Math.max(current.labelY, minY);
      if (previous) {
        current.labelY = Math.max(current.labelY, previous.labelY + gap);
      }
    }

    for (let index = list.length - 1; index >= 0; index -= 1) {
      const next = list[index + 1];
      const current = list[index];
      if (!current) {
        continue;
      }

      current.labelY = Math.min(current.labelY, maxY);
      if (next) {
        current.labelY = Math.min(current.labelY, next.labelY - gap);
      }
    }
  }

  const left = entries
    .filter((entry) => entry.side === "left")
    .sort((a, b) => a.lineBendY - b.lineBendY)
    .map((entry) => ({ ...entry, labelY: entry.lineBendY }));
  const right = entries
    .filter((entry) => entry.side === "right")
    .sort((a, b) => a.lineBendY - b.lineBendY)
    .map((entry) => ({ ...entry, labelY: entry.lineBendY }));

  adjust(left);
  adjust(right);
  return [...left, ...right];
}

function buildDonutLayout<T extends { key: string; label: string; count: number; color: string }>(entries: T[]) {
  const visibleEntries = entries.filter((entry) => entry.count > 0);
  const total = visibleEntries.reduce((sum, entry) => sum + entry.count, 0);

  if (total === 0) {
    return [];
  }

  let cursor = -Math.PI / 2;
  const raw = visibleEntries.map((entry) => {
    const startAngle = cursor;
    cursor += (entry.count / total) * Math.PI * 2;
    const endAngle = cursor;
    const midAngle = (startAngle + endAngle) / 2;
    const lineStart = polarToCartesian(DONUT_CENTER_X, DONUT_CENTER_Y, DONUT_OUTER_RADIUS, midAngle);
    const lineBend = polarToCartesian(DONUT_CENTER_X, DONUT_CENTER_Y, DONUT_OUTER_RADIUS + 22, midAngle);

    return {
      ...entry,
      percent: Math.round((entry.count / total) * 100),
      path: describeDonutSlice(startAngle, endAngle),
      side: Math.cos(midAngle) >= 0 ? ("right" as const) : ("left" as const),
      lineStartX: lineStart.x,
      lineStartY: lineStart.y,
      lineBendX: lineBend.x,
      lineBendY: lineBend.y
    };
  });

  return spreadSideLabels(raw);
}

function CategoryGlyphPaths({ category }: { category: string }) {
  switch (category) {
    case "Outerwear":
      return (
        <>
          <path d="M6 4.5 9 2.8h2L14 4.5l2.2 4.2-2 1.6V17H5.8v-6.7l-2-1.6L6 4.5Z" />
          <path d="M8 5.5v3.5M12 5.5v3.5" />
        </>
      );
    case "Tops":
      return <path d="m6 4 2.2-1.2h3.6L14 4l2.2 3.2-2.4 1.5V17H6.2V8.7L3.8 7.2 6 4Z" />;
    case "Bottoms":
      return <path d="M6 3h8l1 14h-3.1L10 9.6 8.1 17H5L6 3Z" />;
    case "Shoes":
      return <path d="M4 11.6c1.5 0 2.8-.4 4-.9l1.8-.8 1.7 1.5c1 .8 2.1 1.2 3.5 1.2H16v3.2H4v-4.2Z" />;
    case "Accessories":
      return (
        <>
          <path d="M5.5 10a4.5 4.5 0 1 1 9 0 4.5 4.5 0 1 1-9 0Z" />
          <path d="M10 5.5V3.2M10 16.8v-2.3M5.5 10H3.2M16.8 10h-2.3" />
        </>
      );
    default:
      return <circle cx="10" cy="10" r="5.4" />;
  }
}

function CategoryIcon({ category }: { category: string }) {
  return (
    <svg viewBox="0 0 20 20" aria-hidden="true" className="insight-icon-svg">
      <CategoryGlyphPaths category={category} />
    </svg>
  );
}

function SeasonGlyphPaths({ season }: { season: "winter" | "spring" | "summer" | "fall" }) {
  switch (season) {
    case "winter":
      return <path d="M10 2.6v14.8M4.4 5.2l11.2 9.6M15.6 5.2 4.4 14.8M3.3 10h13.4" />;
    case "spring":
      return <path d="M10 16.5c4.2 0 6.2-3 6.2-6.1 0-2.1-1.2-4-3.3-4.7-.4-2-1.9-3.2-3.9-3.2-2.5 0-4.2 1.8-4.2 4.3-2 1-3 2.8-3 4.7 0 3.1 2 5 8.2 5Z" />;
    case "summer":
      return (
        <>
          <circle cx="10" cy="10" r="4" />
          <path d="M10 2.6v2.1M10 15.3v2.1M2.6 10h2.1M15.3 10h2.1M4.8 4.8l1.5 1.5M13.7 13.7l1.5 1.5M15.2 4.8l-1.5 1.5M6.3 13.7l-1.5 1.5" />
        </>
      );
    case "fall":
      return (
        <>
          <path d="M10.4 3.2c3.6 1.6 5.2 4.4 5.2 7.3 0 3.3-2.4 6.3-6.2 6.3-2.9 0-5.1-1.9-5.1-4.8 0-4.8 4.1-6.7 6.1-8.8Z" />
          <path d="M8.6 10.4c1.3-.3 2.4-.9 3.4-1.9" />
        </>
      );
  }
}

function SeasonIcon({ season }: { season: "winter" | "spring" | "summer" | "fall" }) {
  return (
    <svg viewBox="0 0 20 20" aria-hidden="true" className="insight-icon-svg">
      <SeasonGlyphPaths season={season} />
    </svg>
  );
}

function WeatherGlyphPaths({ condition }: { condition: WeatherCondition }) {
  switch (condition) {
    case "clear":
      return (
        <>
          <circle cx="10" cy="10" r="3.4" />
          <path d="M10 1.8v2.3M10 15.9v2.3M1.8 10h2.3M15.9 10h2.3M4.2 4.2l1.6 1.6M14.2 14.2l1.6 1.6M15.8 4.2l-1.6 1.6M5.8 14.2l-1.6 1.6" />
        </>
      );
    case "cloudy":
      return <path d="M6.5 15.2h7.2c2.1 0 3.5-1.4 3.5-3.2 0-1.7-1.1-3-2.8-3.2C14 6.1 12.4 4.7 10 4.7 7.4 4.7 5.7 6.3 5.4 8.6 3.8 8.8 2.8 10 2.8 11.5c0 2 1.5 3.7 3.7 3.7Z" />;
    case "rain":
      return (
        <>
          <path d="M6.1 12.2h7.4c2 0 3.4-1.3 3.4-3 0-1.6-1.1-2.9-2.7-3.1C13.9 4.3 12.3 3 10 3 7.5 3 5.8 4.5 5.4 6.7 3.9 7 3 8.1 3 9.5c0 1.8 1.3 2.7 3.1 2.7Z" />
          <path d="M7 13.8 5.9 16M10.1 13.8 9 16M13.2 13.8 12.1 16" />
        </>
      );
    case "snow":
      return (
        <>
          <path d="M6.1 11.4h7.4c2 0 3.4-1.3 3.4-3 0-1.6-1.1-2.9-2.7-3.1C13.9 3.6 12.3 2.3 10 2.3c-2.5 0-4.2 1.5-4.6 3.7C3.9 6.3 3 7.4 3 8.8c0 1.8 1.3 2.6 3.1 2.6Z" />
          <path d="M7.3 13.4v3.2M5.9 14.2l2.8 1.6M8.7 14.2l-2.8 1.6M12.7 13.4v3.2M11.3 14.2l2.8 1.6M14.1 14.2l-2.8 1.6" />
        </>
      );
    case "wind":
      return (
        <>
          <path d="M3 8.1h8.8c1.4 0 2.4-.9 2.4-2.1 0-1-.8-1.8-1.9-1.8-1 0-1.8.6-1.9 1.5" />
          <path d="M3 11.7h11.2c1.5 0 2.6.9 2.6 2.1 0 1.1-.9 2-2.2 2-1.2 0-2-.7-2.1-1.6" />
        </>
      );
  }
}

function WeatherIcon({ condition }: { condition: WeatherCondition }) {
  return (
    <svg viewBox="0 0 20 20" aria-hidden="true" className="insight-icon-svg">
      <WeatherGlyphPaths condition={condition} />
    </svg>
  );
}

function InsightDonutChart({
  label,
  slices,
  renderGlyph,
  showLabels = true,
  showPrimaryLabel = true
}: {
  label: string;
  slices: DonutSlice[];
  renderGlyph: (key: string) => ReactNode;
  showLabels?: boolean;
  showPrimaryLabel?: boolean;
}) {
  return (
    <div className="insight-pie-wrap">
      <svg className="insight-donut-svg" viewBox={`0 0 ${DONUT_WIDTH} ${DONUT_HEIGHT}`} aria-label={label} role="img">
        {slices.map((slice) => (
          <path key={slice.key} d={slice.path} className="insight-donut-slice" style={{ fill: slice.color }} />
        ))}
        <circle className="insight-donut-core" cx={DONUT_CENTER_X} cy={DONUT_CENTER_Y} r={DONUT_INNER_RADIUS - 1} />
        {showLabels
          ? slices.map((slice) => {
              const metricText = `${slice.count} · ${slice.percent}%`;
              const primaryWidth = showPrimaryLabel ? slice.label.length * 7.1 + 42 : 0;
              const metricWidth = metricText.length * 7 + 38;
              const labelWidth = Math.max(94, primaryWidth, metricWidth);
              const labelHeight = showPrimaryLabel ? 44 : 32;
              const labelX = slice.side === "right" ? DONUT_WIDTH - labelWidth - 12 : 12;
              const labelY = slice.labelY - labelHeight / 2;
              const lineEndX = slice.side === "right" ? labelX : labelX + labelWidth;
              const metricY = showPrimaryLabel ? labelY + 30 : labelY + 18;

              return (
                <g key={`${slice.key}-label`} className="insight-donut-callout">
                  <path
                    className="insight-donut-callout-line"
                    d={`M ${slice.lineStartX} ${slice.lineStartY} L ${slice.lineBendX} ${slice.lineBendY} L ${lineEndX} ${slice.labelY}`}
                    style={{ stroke: slice.color }}
                  />
                  <rect x={labelX} y={labelY} rx={15} ry={15} width={labelWidth} height={labelHeight} className="insight-donut-label" />
                  <circle
                    cx={labelX + 15}
                    cy={showPrimaryLabel ? labelY + 14 : labelY + labelHeight / 2}
                    r={9}
                    className="insight-donut-label-chip"
                    style={{ fill: `${slice.color}22`, stroke: slice.color }}
                  />
                  {showPrimaryLabel ? (
                    <>
                      <svg x={labelX + 9} y={labelY + 8} width={12} height={12} viewBox="0 0 20 20" className="insight-icon-svg">
                        {renderGlyph(slice.key)}
                      </svg>
                      <text x={labelX + 29} y={labelY + 17} className="insight-donut-label-text">
                        {slice.label}
                      </text>
                    </>
                  ) : null}
                  <text x={labelX + 29} y={metricY} className="insight-donut-label-metric">
                    {metricText}
                  </text>
                </g>
              );
            })
          : null}
      </svg>
    </div>
  );
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
  const categorySlices = useMemo(
    () =>
      buildDonutLayout(categoryStats.map((entry, index) => ({
        key: entry.category,
        label: entry.label,
        count: entry.count,
        color: categoryColors[index % categoryColors.length]
      }))),
    [categoryStats]
  );
  const seasonSlices = useMemo(
    () =>
      buildDonutLayout(seasonStats.map((entry, index) => ({
        key: entry.key,
        label: entry.label,
        count: entry.count,
        color: seasonColors[index % seasonColors.length]
      }))),
    [seasonStats]
  );
  const weatherSlices = useMemo(
    () =>
      buildDonutLayout(weatherStats.map((entry) => ({
        key: entry.condition,
        label: entry.label,
        count: entry.count,
        color: weatherColors[entry.condition]
      }))),
    [weatherStats]
  );

  return (
    <div className="page-stack">
      <section className="hero-card home-hero-card">
        <div className="hero-copy home-hero-copy">
          <span className="eyebrow">{t("home.heroEyebrow")}</span>
          <h2>{t("home.heroTitle")}</h2>
          <p>{t("home.heroBody")}</p>
          <div className="button-row hero-actions">
            <button
              className="primary-button"
              type="button"
              onClick={() => navigate(latestDraft ? `/register?item=${latestDraft.id}` : "/register")}
            >
              {latestDraft ? t("home.quickPrimaryContinue") : t("home.quickPrimaryCapture")}
            </button>
            <button className="secondary-button" type="button" onClick={() => navigate("/wardrobe")}>
              {t("home.quickSecondaryBrowse")}
            </button>
          </div>
          <div className="hero-footnote">
            <span className="local-pill">{t("badge.local")}</span>
            <p className="muted-copy">{t("home.heroFootnote")}</p>
          </div>
        </div>
        <div className="hero-orb" />
      </section>

      <section className="stats-grid">
        <button className="stat-card stat-card-button" type="button" onClick={() => navigate("/wardrobe")}>
          <span>{t("home.stats.items")}</span>
          <strong>{activeItems.length}</strong>
        </button>
        <button
          className="stat-card stat-card-button"
          type="button"
          onClick={() => navigate(latestDraft ? `/register?item=${latestDraft.id}` : "/register")}
        >
          <span>{t("home.stats.drafts")}</span>
          <strong>{draftItems.length}</strong>
        </button>
        <button className="stat-card stat-card-button" type="button" onClick={() => navigate("/wardrobe?favorites=1")}>
          <span>{t("home.stats.favorites")}</span>
          <strong>{activeItems.filter((item) => item.favorite).length}</strong>
        </button>
      </section>

      <section className="panel-card">
        <div className="panel-head">
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

      <section className="panel-card home-insights-panel">
        <div className="panel-head">
          <div>
            <span className="section-tag">{t("nav.home")}</span>
            <h3>{t("home.insightsTitle")}</h3>
          </div>
          <p className="muted-copy recommendation-context">{t("home.insightsBody")}</p>
        </div>
        <div className="insight-grid insight-grid-compact">
          <article className="panel-card insight-card insight-card-category">
            <div className="insight-chart-panel">
              <InsightDonutChart
                label={t("home.insightsCategoryTitle")}
                slices={categorySlices}
                renderGlyph={(key) => <CategoryGlyphPaths category={key} />}
              />
            </div>
          </article>

          <article className="panel-card insight-card insight-card-single">
            <div className="insight-chart-panel">
              <InsightDonutChart
                label={t("home.insightsSeason")}
                slices={seasonSlices}
                renderGlyph={(key) => <SeasonGlyphPaths season={key as "winter" | "spring" | "summer" | "fall"} />}
              />
            </div>
          </article>

          <article className="panel-card insight-card insight-card-single">
            <div className="insight-chart-panel">
              <InsightDonutChart
                label={t("home.insightsWeather")}
                slices={weatherSlices}
                renderGlyph={(key) => <WeatherGlyphPaths condition={key as WeatherCondition} />}
              />
            </div>
          </article>
        </div>
      </section>
    </div>
  );
}
