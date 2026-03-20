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
import { MAX_LOOKBOOK_ITEMS, downloadLookbookPng } from "../../lib/lookbook/export";
import { InfoHint } from "../shared/InfoHint";
import { DisclosureSection } from "../shared/DisclosureSection";
import { ItemImage } from "../shared/ItemImage";
import { ItemPaletteDots } from "../shared/ItemPaletteDots";

type SortField = "updated" | "name" | "color";
type SortDirection = "asc" | "desc";
type SortPreset = "updated-desc" | "updated-asc" | "name-asc" | "name-desc" | "color-asc" | "color-desc";
const ALL_FILTER_VALUE = "All";

function resolveSortPreset(preset: SortPreset): { field: SortField; direction: SortDirection } {
  if (preset === "updated-asc") {
    return { field: "updated", direction: "asc" };
  }

  if (preset === "name-asc") {
    return { field: "name", direction: "asc" };
  }

  if (preset === "name-desc") {
    return { field: "name", direction: "desc" };
  }

  if (preset === "color-asc") {
    return { field: "color", direction: "asc" };
  }

  if (preset === "color-desc") {
    return { field: "color", direction: "desc" };
  }

  return { field: "updated", direction: "desc" };
}

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
  const [sortPreset, setSortPreset] = useState<SortPreset>("updated-desc");
  const [materialFilter, setMaterialFilter] = useState(ALL_FILTER_VALUE);
  const [occasionFilter, setOccasionFilter] = useState(ALL_FILTER_VALUE);
  const [temperatureFilter, setTemperatureFilter] = useState<TemperatureBand | typeof ALL_FILTER_VALUE>(ALL_FILTER_VALUE);
  const [weatherFilter, setWeatherFilter] = useState<WeatherCondition | typeof ALL_FILTER_VALUE>(ALL_FILTER_VALUE);
  const [colorRangeStart, setColorRangeStart] = useState(0);
  const [colorRangeEnd, setColorRangeEnd] = useState<number | null>(null);
  const [lookbookTitle, setLookbookTitle] = useState("");
  const [lookbookNote, setLookbookNote] = useState("");
  const [lookbookFeedback, setLookbookFeedback] = useState("");
  const [isExportingLookbook, setIsExportingLookbook] = useState(false);
  const deferredSearch = useDeferredValue(search);
  const { field: sortField, direction: sortDirection } = useMemo(() => resolveSortPreset(sortPreset), [sortPreset]);

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
  const sortOptions = useMemo(
    () => [
      { value: "updated-desc", label: t("wardrobe.sortUpdated") } as const,
      { value: "updated-asc", label: `${t("wardrobe.sortUpdated")} · ${t("wardrobe.sortAscending")}` } as const,
      { value: "name-asc", label: `${t("wardrobe.sortName")} · ${t("wardrobe.sortAscending")}` } as const,
      { value: "name-desc", label: `${t("wardrobe.sortName")} · ${t("wardrobe.sortDescending")}` } as const,
      { value: "color-asc", label: `${t("wardrobe.sortColor")} · ${t("wardrobe.sortAscending")}` } as const,
      { value: "color-desc", label: `${t("wardrobe.sortColor")} · ${t("wardrobe.sortDescending")}` } as const
    ],
    [t]
  );
  const activeAdvancedFilters = useMemo(
    () =>
      [
        showArchived ? t("wardrobe.showArchived") : null,
        materialFilter !== ALL_FILTER_VALUE ? materialFilter : null,
        occasionFilter !== ALL_FILTER_VALUE ? occasionFilter : null,
        temperatureFilter !== ALL_FILTER_VALUE ? t(temperatureMessageKey(temperatureFilter)) : null,
        weatherFilter !== ALL_FILTER_VALUE ? t(weatherMessageKey(weatherFilter)) : null
      ].filter(Boolean) as string[],
    [
      materialFilter,
      occasionFilter,
      showArchived,
      t,
      temperatureFilter,
      weatherFilter
    ]
  );

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
	    sortPreset,
	    temperatureFilter,
    weatherFilter
  ]);
  const lookbookItems = filtered.slice(0, MAX_LOOKBOOK_ITEMS);
  const lookbookTitleValue = lookbookTitle.trim() || t("wardrobe.lookbookDefaultTitle");

  async function handleLookbookExport() {
    if (lookbookItems.length === 0 || isExportingLookbook) {
      return;
    }

    setIsExportingLookbook(true);
    setLookbookFeedback("");

    try {
      await downloadLookbookPng({
        title: lookbookTitleValue,
        note: lookbookNote,
        items: lookbookItems
      });
      setLookbookFeedback(t("wardrobe.lookbookExportDone"));
    } catch {
      setLookbookFeedback(t("wardrobe.lookbookExportFailed"));
    } finally {
      setIsExportingLookbook(false);
    }
  }

  return (
    <div className="page-stack">
      <section className="filter-bar wardrobe-filter-panel">
        <div className="filter-copy">
          <span className="section-tag">{t("nav.wardrobe")}</span>
          <h2 className="page-title">{t("wardrobe.title")}</h2>
          <p className="muted-copy">{t("wardrobe.body")}</p>
          <div className="button-row wardrobe-filter-notes">
            <button className="primary-button" type="button" onClick={() => navigate("/register")}>
              {t("wardrobe.addItem")}
            </button>
            <span className="local-pill">
              {filtered.length} {t("wardrobe.itemsInView")}
            </span>
          </div>
        </div>
        <div className="wardrobe-quick-controls filter-primary-block">
          <div className="wardrobe-quick-control-grid">
            <label className="wardrobe-quick-field wardrobe-quick-field-search">
              <span>{t("wardrobe.searchLabel")}</span>
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
            </label>
            <label className="wardrobe-quick-field">
              <span>{t("register.category")}</span>
              <select
                aria-label={t("register.category")}
                className="control-select"
                value={category}
                onChange={(event) => setCategory(event.target.value)}
              >
                {categories.map((entry) => (
                  <option key={entry} value={entry}>
                    {entry === ALL_FILTER_VALUE ? t("common.all") : categoryMessageKey(entry) ? t(categoryMessageKey(entry)!) : entry}
                  </option>
                ))}
              </select>
            </label>
            <label className="wardrobe-quick-field">
              <span>{t("wardrobe.sortField")}</span>
              <select
                aria-label={t("wardrobe.sortField")}
                className="control-select"
                value={sortPreset}
                onChange={(event) => setSortPreset(event.target.value as SortPreset)}
              >
                {sortOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>
            <div className="wardrobe-quick-field wardrobe-quick-field-actions">
              <span>{t("wardrobe.favorites")}</span>
              <button className={`chip ${showFavorites ? "is-active" : ""}`} type="button" onClick={() => setShowFavorites((value) => !value)}>
                {t("wardrobe.favorites")}
              </button>
            </div>
          </div>
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
          </div>
        ) : null}
        <DisclosureSection
          screenId="wardrobe"
          sectionId="wardrobe-hidden-filters"
          title={t("wardrobe.advancedFilters")}
          summary={
            activeAdvancedFilters.length > 0 ? (
              <span className="wardrobe-filter-summary">
                {activeAdvancedFilters.slice(0, 3).map((entry) => (
                  <span key={entry} className="wardrobe-filter-summary-chip">
                    {entry}
                  </span>
                ))}
              </span>
            ) : null
          }
          defaultOpen={false}
          variant="soft"
          className="wardrobe-hidden-filters"
        >
          <div className="wardrobe-filter-studio">
            <div className="wardrobe-filter-studio-head">
              <div className="wardrobe-filter-title-block">
                <span className="section-tag">{t("nav.wardrobe")}</span>
                <strong>{t("wardrobe.advancedFilters")}</strong>
              </div>
              <InfoHint label={t("wardrobe.advancedFilters")} content={t("wardrobe.advancedHint")} />
            </div>

            <div className="wardrobe-filter-cluster-grid">
              <section className="wardrobe-filter-cluster">
                <div className="wardrobe-filter-cluster-head">
                  <span className="wardrobe-filter-glyph" aria-hidden="true">
                    ◌
                  </span>
                  <span>{t("register.weatherSection")}</span>
                </div>
                <div className="filter-actions wardrobe-filter-actions">
                  <button className={`chip ${showArchived ? "is-active" : ""}`} type="button" onClick={() => setShowArchived((value) => !value)}>
                    {t("wardrobe.showArchived")}
                  </button>
                </div>
              </section>
            </div>
          </div>
          <section className="wardrobe-filter-cluster wardrobe-filter-cluster-wide">
            <div className="wardrobe-filter-cluster-head">
              <span className="wardrobe-filter-glyph" aria-hidden="true">
                ✦
              </span>
              <span>{t("register.weatherSection")}</span>
            </div>
            <div className="form-grid wardrobe-filter-form-grid">
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
          </section>
        </DisclosureSection>
      </section>

      <DisclosureSection
        screenId="wardrobe"
        sectionId="wardrobe-lookbook"
        title={t("wardrobe.lookbookTitle")}
        summary={lookbookItems.length === 0 ? t("wardrobe.lookbookEmptySummary") : `${lookbookItems.length}/${MAX_LOOKBOOK_ITEMS}`}
        defaultOpen={false}
        className="wardrobe-lookbook-disclosure"
      >
        <div className="lookbook-studio">
          <section className="lookbook-studio-controls">
            <div className="wardrobe-filter-studio-head">
              <div className="wardrobe-filter-title-block">
                <span className="section-tag">{t("nav.wardrobe")}</span>
                <strong>{t("wardrobe.lookbookTitle")}</strong>
              </div>
              <InfoHint label={t("wardrobe.lookbookTitle")} content={t("wardrobe.lookbookHint")} />
            </div>

            <p className="muted-copy">{t("wardrobe.lookbookRule")}</p>

            <div className="form-grid lookbook-form-grid">
              <label className="full-width">
                <span>{t("wardrobe.lookbookTitleField")}</span>
                <input
                  aria-label={t("wardrobe.lookbookTitleField")}
                  className="text-input"
                  value={lookbookTitle}
                  placeholder={t("wardrobe.lookbookDefaultTitle")}
                  onChange={(event) => setLookbookTitle(event.target.value)}
                />
              </label>
              <label className="full-width">
                <span>{t("wardrobe.lookbookNoteField")}</span>
                <textarea
                  aria-label={t("wardrobe.lookbookNoteField")}
                  className="text-area"
                  rows={3}
                  value={lookbookNote}
                  placeholder={t("wardrobe.lookbookNotePlaceholder")}
                  onChange={(event) => setLookbookNote(event.target.value)}
                />
              </label>
            </div>

            <div className="button-row lookbook-studio-actions">
              <button
                type="button"
                className="primary-button"
                disabled={lookbookItems.length === 0 || isExportingLookbook}
                onClick={() => void handleLookbookExport()}
              >
                {isExportingLookbook ? t("wardrobe.lookbookExporting") : t("wardrobe.lookbookExportAction")}
              </button>
            </div>

            <p className="muted-copy lookbook-studio-feedback">
              {lookbookFeedback || t("wardrobe.lookbookVisibleSummary")}
            </p>
          </section>

          <article className="lookbook-sheet-preview" aria-label={t("wardrobe.lookbookPreviewLabel")}>
            <div className="lookbook-sheet-preview-head">
              <span className="section-tag">{t("wardrobe.lookbookPreviewLabel")}</span>
              <strong>{lookbookTitleValue}</strong>
              <p className="muted-copy">{lookbookNote.trim() || t("wardrobe.lookbookPreviewBody")}</p>
            </div>

            {lookbookItems.length > 0 ? (
              <div className={`lookbook-sheet-grid is-${lookbookItems.length}`}>
                {lookbookItems.map((item) => (
                  <LookbookPreviewTile key={item.id} item={item} t={t} />
                ))}
              </div>
            ) : (
              <div className="empty-state lookbook-empty-state">{t("wardrobe.lookbookEmpty")}</div>
            )}
          </article>
        </div>
      </DisclosureSection>

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

function LookbookPreviewTile({
  item,
  t
}: {
  item: ClosetItem;
  t: (key: MessageKey) => string;
}) {
  return (
    <article className="lookbook-preview-tile">
      <div className="lookbook-preview-media">
        <ItemPaletteDots colors={item.paletteColors} />
        <ItemImage imageRef={item.heroImage} alt={item.name} className="cover-image garment-card-image" />
      </div>
      <div className="lookbook-preview-copy">
        <span>{categoryMessageKey(item.category) ? t(categoryMessageKey(item.category)!) : item.category}</span>
        <strong>{item.name}</strong>
      </div>
    </article>
  );
}

function WardrobeCard({
  item,
  t,
  onPreview,
  onEdit,
  onToggleFavorite
}: {
  item: ClosetItem;
  t: (key: MessageKey) => string;
  onPreview: () => void;
  onEdit: () => void;
  onToggleFavorite: () => void;
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
