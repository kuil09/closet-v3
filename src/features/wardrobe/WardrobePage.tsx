import { startTransition, useDeferredValue, useEffect, useMemo, useState } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { useNavigate, useSearchParams } from "react-router-dom";
import { atelierDb } from "../../lib/db/app-db";
import { archiveItem, toggleFavorite } from "../../lib/db/repository";
import type { ClosetItem, TemperatureBand, WeatherCondition } from "../../lib/db/types";
import { temperatureBandLabel, normalizeToken } from "../../lib/utils/format";
import { buildPaletteTags, itemMatchesPaletteRange } from "../../lib/utils/palette-range";
import { useI18n } from "../../lib/i18n/i18n";
import { ItemImage } from "../shared/ItemImage";

type SortKey = "newest" | "favorites" | "name";

export function WardrobePage() {
  const { t } = useI18n();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const items = useLiveQuery(() => atelierDb.items.toArray(), [], []);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [showFavorites, setShowFavorites] = useState(false);
  const [showArchived, setShowArchived] = useState(false);
  const [sort, setSort] = useState<SortKey>("newest");
  const [materialFilter, setMaterialFilter] = useState("All");
  const [occasionFilter, setOccasionFilter] = useState("All");
  const [temperatureFilter, setTemperatureFilter] = useState<TemperatureBand | "All">("All");
  const [weatherFilter, setWeatherFilter] = useState<WeatherCondition | "All">("All");
  const [colorRangeStart, setColorRangeStart] = useState(0);
  const [colorRangeEnd, setColorRangeEnd] = useState<number | null>(null);
  const deferredSearch = useDeferredValue(search);

  const categories = useMemo(
    () => ["All", ...Array.from(new Set(items.map((item) => item.category)))],
    [items]
  );
  const materials = useMemo(
    () => ["All", ...Array.from(new Set(items.flatMap((item) => item.materials).filter(Boolean)))],
    [items]
  );
  const occasions = useMemo(
    () => ["All", ...Array.from(new Set(items.flatMap((item) => item.occasionTags).filter(Boolean)))],
    [items]
  );
  const colorTags = useMemo(() => buildPaletteTags(items), [items]);
  const colorIndexMap = useMemo(() => new Map(colorTags.map((entry, index) => [entry.value, index])), [colorTags]);
  const maxColorIndex = Math.max(0, colorTags.length - 1);
  const effectiveColorRangeStart = Math.min(colorRangeStart, maxColorIndex);
  const effectiveColorRangeEnd =
    colorRangeEnd == null ? maxColorIndex : Math.min(Math.max(colorRangeEnd, effectiveColorRangeStart), maxColorIndex);
  const isColorRangeActive = colorTags.length > 0 && (effectiveColorRangeStart > 0 || effectiveColorRangeEnd < maxColorIndex);
  const darkestColor = colorTags[0]?.value;
  const lightestColor = colorTags[colorTags.length - 1]?.value;
  const colorRangeTrack = useMemo(() => {
    if (colorTags.length === 0) {
      return "linear-gradient(90deg, #1B1B1B 0%, #F5F5F5 100%)";
    }

    if (colorTags.length === 1) {
      return colorTags[0].value;
    }

    return `linear-gradient(90deg, ${colorTags
      .map((entry, index) => `${entry.value} ${(index / maxColorIndex) * 100}%`)
      .join(", ")})`;
  }, [colorTags, maxColorIndex]);
  const rangeStartPercent = maxColorIndex === 0 ? 0 : (effectiveColorRangeStart / maxColorIndex) * 100;
  const rangeEndPercent = maxColorIndex === 0 ? 100 : (effectiveColorRangeEnd / maxColorIndex) * 100;

  useEffect(() => {
    setColorRangeStart((current) => Math.min(Math.max(current, 0), maxColorIndex));
    setColorRangeEnd((current) => (current == null ? null : Math.min(Math.max(current, 0), maxColorIndex)));
  }, [maxColorIndex]);

  useEffect(() => {
    setShowFavorites(searchParams.get("favorites") === "1");
  }, [searchParams]);

  const filtered = useMemo(() => {
    const token = normalizeToken(deferredSearch);
    const result = items.filter((item) => {
      if (!showArchived && item.status === "archived") {
        return false;
      }
      if (showFavorites && !item.favorite) {
        return false;
      }
      if (category !== "All" && item.category !== category) {
        return false;
      }
      if (materialFilter !== "All" && !item.materials.includes(materialFilter)) {
        return false;
      }
      if (occasionFilter !== "All" && !item.occasionTags.includes(occasionFilter)) {
        return false;
      }
      if (temperatureFilter !== "All" && !item.temperatureBand.includes(temperatureFilter)) {
        return false;
      }
      if (weatherFilter !== "All" && !item.weatherTags.includes(weatherFilter)) {
        return false;
      }
      if (
        isColorRangeActive &&
        !itemMatchesPaletteRange(item, colorIndexMap, effectiveColorRangeStart, effectiveColorRangeEnd)
      ) {
        return false;
      }
      if (!token) {
        return true;
      }

      return [
        item.name,
        item.category,
        item.materials.join(" "),
        item.occasionTags.join(" "),
        item.styleNotes
      ]
        .join(" ")
        .toLowerCase()
        .includes(token);
    });

    return result.sort((left, right) => {
      if (sort === "favorites") {
        return Number(right.favorite) - Number(left.favorite);
      }
      if (sort === "name") {
        return left.name.localeCompare(right.name);
      }

      return right.updatedAt.localeCompare(left.updatedAt);
    });
  }, [
    category,
    colorIndexMap,
    deferredSearch,
    effectiveColorRangeEnd,
    effectiveColorRangeStart,
    isColorRangeActive,
    items,
    materialFilter,
    occasionFilter,
    showArchived,
    showFavorites,
    sort,
    temperatureFilter,
    weatherFilter
  ]);

  return (
    <div className="page-stack">
      <section className="filter-bar wardrobe-filter-panel">
        <div className="filter-copy">
          <span className="section-tag">{t("nav.wardrobe")}</span>
        </div>
        {colorTags.length > 0 ? (
          <div className="color-range-filter filter-primary-block">
            <div className="color-range-head">
              <span>{t("wardrobe.colorRange")}</span>
            </div>
            <div className="color-range-slider-shell">
              <div className="color-range-slider-track" style={{ background: colorRangeTrack }} />
              <div
                className="color-range-slider-selection"
                style={{
                  left: `${rangeStartPercent}%`,
                  right: `${100 - rangeEndPercent}%`
                }}
              />
              <input
                aria-label={t("wardrobe.colorFrom")}
                className="color-range-thumb color-range-thumb-start"
                type="range"
                min={0}
                max={maxColorIndex}
                step={1}
                value={effectiveColorRangeStart}
                onChange={(event) => {
                  const next = Number(event.target.value);
                  setColorRangeStart(Math.min(next, effectiveColorRangeEnd));
                }}
              />
              <input
                aria-label={t("wardrobe.colorTo")}
                className="color-range-thumb color-range-thumb-end"
                type="range"
                min={0}
                max={maxColorIndex}
                step={1}
                value={effectiveColorRangeEnd}
                onChange={(event) => {
                  const next = Number(event.target.value);
                  setColorRangeEnd(Math.max(next, effectiveColorRangeStart));
                }}
              />
            </div>
            <div className="color-range-scale" aria-hidden="true">
              {darkestColor ? (
                <span
                  className="color-range-edge-swatch"
                  style={{ backgroundColor: darkestColor }}
                  title={darkestColor}
                />
              ) : null}
              <div className="color-range-stops">
                {colorTags.map((entry, index) => {
                  const active = index >= effectiveColorRangeStart && index <= effectiveColorRangeEnd;
                  return (
                    <span
                      key={entry.value}
                      className={`color-range-stop ${active ? "is-active" : ""}`}
                      style={{ backgroundColor: entry.value }}
                      title={entry.value}
                    />
                  );
                })}
              </div>
              {lightestColor ? (
                <span
                  className="color-range-edge-swatch"
                  style={{ backgroundColor: lightestColor }}
                  title={lightestColor}
                />
              ) : null}
            </div>
            <p className="muted-copy">{t("wardrobe.colorRangeHint")}</p>
          </div>
        ) : null}
        <div className="filter-actions wardrobe-filter-actions">
          <input
            aria-label={t("wardrobe.searchLabel")}
            className="text-input"
            placeholder={t("wardrobe.search")}
            value={search}
            onChange={(event) => {
              const next = event.target.value;
              startTransition(() => setSearch(next));
            }}
          />
          <select className="control-select" value={category} onChange={(event) => setCategory(event.target.value)}>
            {categories.map((entry) => (
              <option key={entry} value={entry}>
                {entry}
              </option>
            ))}
          </select>
          <select className="control-select" value={sort} onChange={(event) => setSort(event.target.value as SortKey)}>
            <option value="newest">{t("wardrobe.sortNewest")}</option>
            <option value="favorites">{t("wardrobe.sortFavorites")}</option>
            <option value="name">{t("wardrobe.sortName")}</option>
          </select>
          <button className={`chip ${showFavorites ? "is-active" : ""}`} onClick={() => setShowFavorites((value) => !value)}>
            {t("wardrobe.favorites")}
          </button>
          <button className={`chip ${showArchived ? "is-active" : ""}`} onClick={() => setShowArchived((value) => !value)}>
            {t("wardrobe.showArchived")}
          </button>
        </div>
        <div className="form-grid">
          <label>
            <span>{t("register.materials")}</span>
            <select className="control-select" value={materialFilter} onChange={(event) => setMaterialFilter(event.target.value)}>
              {materials.map((entry) => (
                <option key={entry} value={entry}>
                  {entry}
                </option>
              ))}
            </select>
          </label>
          <label>
            <span>{t("register.occasionTags")}</span>
            <select className="control-select" value={occasionFilter} onChange={(event) => setOccasionFilter(event.target.value)}>
              {occasions.map((entry) => (
                <option key={entry} value={entry}>
                  {entry}
                </option>
              ))}
            </select>
          </label>
          <label>
            <span>{t("register.temperature")}</span>
            <select
              className="control-select"
              value={temperatureFilter}
              onChange={(event) => setTemperatureFilter(event.target.value as TemperatureBand | "All")}
            >
              <option value="All">All</option>
              <option value="freezing">freezing</option>
              <option value="cold">cold</option>
              <option value="mild">mild</option>
              <option value="warm">warm</option>
              <option value="hot">hot</option>
            </select>
          </label>
          <label>
            <span>{t("register.weather")}</span>
            <select
              className="control-select"
              value={weatherFilter}
              onChange={(event) => setWeatherFilter(event.target.value as WeatherCondition | "All")}
            >
              <option value="All">All</option>
              <option value="clear">clear</option>
              <option value="cloudy">cloudy</option>
              <option value="rain">rain</option>
              <option value="snow">snow</option>
              <option value="wind">wind</option>
            </select>
          </label>
        </div>
        <div className="secondary-actions wardrobe-filter-notes">
          <p className="muted-copy">{t("wardrobe.advancedHint")}</p>
        </div>
      </section>

      {filtered.length === 0 ? <div className="empty-state">{t("wardrobe.empty")}</div> : null}

      <section className="wardrobe-grid">
        {filtered.map((item) => (
          <WardrobeCard
            key={item.id}
            item={item}
            t={t}
            onEdit={() => navigate(`/register?item=${item.id}`)}
            onToggleFavorite={() => void toggleFavorite(item.id, !item.favorite)}
            onToggleArchived={() => void archiveItem(item.id, item.status !== "archived")}
          />
        ))}
      </section>
    </div>
  );
}

function WardrobeCard({
  item,
  t,
  onEdit,
  onToggleFavorite,
  onToggleArchived
}: {
  item: ClosetItem;
  t: (
    key:
      | "wardrobe.materialUnknown"
      | "wardrobe.unfavorite"
      | "wardrobe.favorite"
      | "wardrobe.restore"
      | "wardrobe.archive"
      | "wardrobe.edit"
  ) => string;
  onEdit: () => void;
  onToggleFavorite: () => void;
  onToggleArchived: () => void;
}) {
  return (
    <article className="item-card">
      <button className="item-image-wrap card-button" onClick={onEdit}>
        <ItemImage imageRef={item.heroImage} alt={item.name} className="cover-image garment-card-image" />
        <span className="item-chip">{item.category}</span>
      </button>
      <div className="item-card-body">
        <div className="item-title-row">
          <strong>{item.name}</strong>
        </div>
        <div className="item-detail-scroll">
          <span>{item.materials.join(" · ") || t("wardrobe.materialUnknown")}</span>
          <span>{item.temperatureBand.map(temperatureBandLabel).join(", ")}</span>
        </div>
      </div>
      <div className="card-actions">
        <button className="primary-button" onClick={onEdit}>
          {t("wardrobe.edit")}
        </button>
        <button className={`mini-button ${item.favorite ? "is-active" : ""}`} onClick={onToggleFavorite}>
          {item.favorite ? `★ ${t("wardrobe.unfavorite")}` : `☆ ${t("wardrobe.favorite")}`}
        </button>
        <button className="mini-button" onClick={onToggleArchived}>
          {item.status === "archived" ? t("wardrobe.restore") : t("wardrobe.archive")}
        </button>
      </div>
    </article>
  );
}
