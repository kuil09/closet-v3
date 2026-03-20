import { startTransition, useDeferredValue, useEffect, useMemo, useState } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { useNavigate, useSearchParams } from "react-router-dom";
import { atelierDb } from "../../lib/db/app-db";
import { archiveItem, toggleFavorite } from "../../lib/db/repository";
import type { ClosetItem, TemperatureBand, WeatherCondition } from "../../lib/db/types";
import { categoryMessageKey, temperatureMessageKey, weatherMessageKey } from "../../lib/i18n/label-keys";
import { useI18n } from "../../lib/i18n/i18n";
import type { MessageKey } from "../../lib/i18n/messages";
import { normalizeToken } from "../../lib/utils/format";
import { buildPaletteTags, itemMatchesPaletteRange, itemPaletteLightness } from "../../lib/utils/palette-range";
import { InfoHint } from "../shared/InfoHint";
import { DisclosureSection } from "../shared/DisclosureSection";
import { ItemImage } from "../shared/ItemImage";
import { ItemPaletteDots } from "../shared/ItemPaletteDots";

type SortField = "updated" | "name" | "color";
type SortDirection = "asc" | "desc";
const ALL_FILTER_VALUE = "All";

export function WardrobePage() {
  const { t } = useI18n();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const items = useLiveQuery(() => atelierDb.items.toArray(), [], []);
  const [previewItem, setPreviewItem] = useState<ClosetItem | null>(null);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState(ALL_FILTER_VALUE);
  const [showFavorites, setShowFavorites] = useState(false);
  const [showArchived, setShowArchived] = useState(false);
  const [sortField, setSortField] = useState<SortField>("updated");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");
  const [materialFilter, setMaterialFilter] = useState(ALL_FILTER_VALUE);
  const [occasionFilter, setOccasionFilter] = useState(ALL_FILTER_VALUE);
  const [temperatureFilter, setTemperatureFilter] = useState<TemperatureBand | typeof ALL_FILTER_VALUE>(ALL_FILTER_VALUE);
  const [weatherFilter, setWeatherFilter] = useState<WeatherCondition | typeof ALL_FILTER_VALUE>(ALL_FILTER_VALUE);
  const [colorRangeStart, setColorRangeStart] = useState(0);
  const [colorRangeEnd, setColorRangeEnd] = useState<number | null>(null);
  const deferredSearch = useDeferredValue(search);

  const categories = useMemo(
    () => [ALL_FILTER_VALUE, ...Array.from(new Set(items.map((item) => item.category)))],
    [items]
  );
  const materials = useMemo(
    () => [ALL_FILTER_VALUE, ...Array.from(new Set(items.flatMap((item) => item.materials).filter(Boolean)))],
    [items]
  );
  const occasions = useMemo(
    () => [ALL_FILTER_VALUE, ...Array.from(new Set(items.flatMap((item) => item.occasionTags).filter(Boolean)))],
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
      if (category !== ALL_FILTER_VALUE && item.category !== category) {
        return false;
      }
      if (materialFilter !== ALL_FILTER_VALUE && !item.materials.includes(materialFilter)) {
        return false;
      }
      if (occasionFilter !== ALL_FILTER_VALUE && !item.occasionTags.includes(occasionFilter)) {
        return false;
      }
      if (temperatureFilter !== ALL_FILTER_VALUE && !item.temperatureBand.includes(temperatureFilter)) {
        return false;
      }
      if (weatherFilter !== ALL_FILTER_VALUE && !item.weatherTags.includes(weatherFilter)) {
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
      if (sortField === "name") {
        const byName = left.name.localeCompare(right.name);
        return sortDirection === "asc" ? byName : -byName;
      }

      if (sortField === "color") {
        const byColor = itemPaletteLightness(left) - itemPaletteLightness(right);
        if (byColor !== 0) {
          return sortDirection === "asc" ? byColor : -byColor;
        }

        return left.name.localeCompare(right.name);
      }

      const byUpdated = left.updatedAt.localeCompare(right.updatedAt);
      if (byUpdated !== 0) {
        return sortDirection === "asc" ? byUpdated : -byUpdated;
      }

      return left.name.localeCompare(right.name);
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
    sortDirection,
    sortField,
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
              <div className="label-with-hint">
                <span>{t("wardrobe.colorRange")}</span>
                <InfoHint label={t("wardrobe.colorRange")} content={t("wardrobe.colorRangeHint")} />
              </div>
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
          </div>
        ) : null}
        <DisclosureSection
          screenId="wardrobe"
          sectionId="wardrobe-hidden-filters"
          title={t("wardrobe.advancedFilters")}
          defaultOpen={false}
          variant="soft"
          className="wardrobe-hidden-filters"
        >
          <div className="section-inline-tools">
            <InfoHint label={t("wardrobe.advancedFilters")} content={t("wardrobe.advancedHint")} />
          </div>
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
                  {entry === ALL_FILTER_VALUE ? t("common.all") : categoryMessageKey(entry) ? t(categoryMessageKey(entry)!) : entry}
                </option>
              ))}
            </select>
            <select
              aria-label={t("wardrobe.sortField")}
              className="control-select"
              value={sortField}
              onChange={(event) => setSortField(event.target.value as SortField)}
            >
              <option value="updated">{t("wardrobe.sortUpdated")}</option>
              <option value="name">{t("wardrobe.sortName")}</option>
              <option value="color">{t("wardrobe.sortColor")}</option>
            </select>
            <select
              aria-label={t("wardrobe.sortDirection")}
              className="control-select"
              value={sortDirection}
              onChange={(event) => setSortDirection(event.target.value as SortDirection)}
            >
              <option value="asc">{t("wardrobe.sortAscending")}</option>
              <option value="desc">{t("wardrobe.sortDescending")}</option>
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
                    {entry === ALL_FILTER_VALUE ? t("common.all") : entry}
                  </option>
                ))}
              </select>
            </label>
            <label>
              <span>{t("register.occasionTags")}</span>
              <select className="control-select" value={occasionFilter} onChange={(event) => setOccasionFilter(event.target.value)}>
                {occasions.map((entry) => (
                  <option key={entry} value={entry}>
                    {entry === ALL_FILTER_VALUE ? t("common.all") : entry}
                  </option>
                ))}
              </select>
            </label>
            <label>
              <span>{t("register.temperature")}</span>
              <select
                className="control-select"
                value={temperatureFilter}
                onChange={(event) => setTemperatureFilter(event.target.value as TemperatureBand | typeof ALL_FILTER_VALUE)}
              >
                <option value={ALL_FILTER_VALUE}>{t("common.all")}</option>
                <option value="freezing">{t(temperatureMessageKey("freezing"))}</option>
                <option value="cold">{t(temperatureMessageKey("cold"))}</option>
                <option value="mild">{t(temperatureMessageKey("mild"))}</option>
                <option value="warm">{t(temperatureMessageKey("warm"))}</option>
                <option value="hot">{t(temperatureMessageKey("hot"))}</option>
              </select>
            </label>
            <label>
              <span>{t("register.weather")}</span>
              <select
                className="control-select"
                value={weatherFilter}
                onChange={(event) => setWeatherFilter(event.target.value as WeatherCondition | typeof ALL_FILTER_VALUE)}
              >
                <option value={ALL_FILTER_VALUE}>{t("common.all")}</option>
                <option value="clear">{t(weatherMessageKey("clear"))}</option>
                <option value="cloudy">{t(weatherMessageKey("cloudy"))}</option>
                <option value="rain">{t(weatherMessageKey("rain"))}</option>
                <option value="snow">{t(weatherMessageKey("snow"))}</option>
                <option value="wind">{t(weatherMessageKey("wind"))}</option>
              </select>
            </label>
          </div>
        </DisclosureSection>
      </section>

      {filtered.length === 0 ? <div className="empty-state">{t("wardrobe.empty")}</div> : null}

      <section className="wardrobe-grid">
        {filtered.map((item) => (
          <WardrobeCard
            key={item.id}
            item={item}
            t={t}
            onPreview={() => setPreviewItem(item)}
            onEdit={() => navigate(`/register?item=${item.id}`)}
            onToggleFavorite={() => void toggleFavorite(item.id, !item.favorite)}
            onToggleArchived={() => void archiveItem(item.id, item.status !== "archived")}
          />
        ))}
      </section>

      {previewItem ? (
        <div className="image-lightbox-backdrop" role="presentation" onClick={() => setPreviewItem(null)}>
          <section
            className="image-lightbox"
            role="dialog"
            aria-modal="true"
            aria-label={previewItem.name}
            onClick={(event) => event.stopPropagation()}
          >
            <button
              type="button"
              className="card-icon-button image-lightbox-close"
              aria-label={t("disclosure.close")}
              onClick={() => setPreviewItem(null)}
            >
              <span aria-hidden="true">×</span>
            </button>
            <div className="image-lightbox-frame">
              <ItemImage imageRef={previewItem.heroImage} alt={previewItem.name} className="image-lightbox-image" />
            </div>
          </section>
        </div>
      ) : null}
    </div>
  );
}

function WardrobeCard({
  item,
  t,
  onPreview,
  onEdit,
  onToggleFavorite,
  onToggleArchived
}: {
  item: ClosetItem;
  t: (key: MessageKey) => string;
  onPreview: () => void;
  onEdit: () => void;
  onToggleFavorite: () => void;
  onToggleArchived: () => void;
}) {
  return (
    <article className="item-card">
      <div className="item-card-media">
        <div className="card-corner-actions">
          <button
            className={`card-icon-button card-corner-button ${item.favorite ? "is-active" : ""}`}
            onClick={onToggleFavorite}
            aria-label={item.favorite ? t("wardrobe.unfavorite") : t("wardrobe.favorite")}
            title={item.favorite ? t("wardrobe.unfavorite") : t("wardrobe.favorite")}
          >
            <FavoriteGlyph filled={item.favorite} />
          </button>
          <button
            className="card-icon-button card-corner-button"
            onClick={onToggleArchived}
            aria-label={item.status === "archived" ? t("wardrobe.restore") : t("wardrobe.archive")}
            title={item.status === "archived" ? t("wardrobe.restore") : t("wardrobe.archive")}
          >
            {item.status === "archived" ? <RestoreGlyph /> : <ArchiveGlyph />}
          </button>
        </div>
        <button className="item-image-wrap card-button" onClick={onPreview} aria-label={item.name}>
          <ItemPaletteDots colors={item.paletteColors} />
          <ItemImage imageRef={item.heroImage} alt={item.name} className="cover-image garment-card-image" />
          <span className="item-chip">
            {categoryMessageKey(item.category) ? t(categoryMessageKey(item.category)!) : item.category}
          </span>
        </button>
      </div>
      <div className="item-card-body">
        <div className="item-title-row">
          <strong>{item.name}</strong>
        </div>
      </div>
      <div className="card-actions">
        <button className="card-icon-button" onClick={onEdit} aria-label={t("wardrobe.edit")} title={t("wardrobe.edit")}>
          <EditGlyph />
        </button>
      </div>
    </article>
  );
}

function EditGlyph() {
  return (
    <svg aria-hidden="true" viewBox="0 0 20 20" className="card-action-glyph" fill="none">
      <path className="card-action-glyph-stroke" d="M4.5 13.8 13.8 4.5l1.7 1.7-9.3 9.3-2.7.9z" />
      <path className="card-action-glyph-stroke" d="M11.9 4.9 14.8 7.8" />
    </svg>
  );
}

function FavoriteGlyph({ filled }: { filled: boolean }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 20 20" className="card-action-glyph" fill="none">
      <path
        className={filled ? "card-action-glyph-fill" : "card-action-glyph-stroke"}
        d="m10 3.7 1.9 3.9 4.3.6-3.1 3 .7 4.2-3.8-2-3.8 2 .7-4.2-3.1-3 4.3-.6z"
      />
    </svg>
  );
}

function ArchiveGlyph() {
  return (
    <svg aria-hidden="true" viewBox="0 0 20 20" className="card-action-glyph" fill="none">
      <path className="card-action-glyph-stroke" d="M4.5 6.1h11v8.6h-11z" />
      <path className="card-action-glyph-stroke" d="M6 6.1V4.7h8v1.4M8 9.2h4" />
    </svg>
  );
}

function RestoreGlyph() {
  return (
    <svg aria-hidden="true" viewBox="0 0 20 20" className="card-action-glyph" fill="none">
      <path className="card-action-glyph-stroke" d="M6 10a4 4 0 1 0 1.2-2.9" />
      <path className="card-action-glyph-stroke" d="M6 4.8v2.8h2.8" />
    </svg>
  );
}
