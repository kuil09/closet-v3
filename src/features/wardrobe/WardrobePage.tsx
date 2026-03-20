import { startTransition, useDeferredValue, useMemo, useState } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { useNavigate } from "react-router-dom";
import { atelierDb } from "../../lib/db/app-db";
import { archiveItem, toggleFavorite } from "../../lib/db/repository";
import type { ClosetItem, TemperatureBand, WeatherCondition } from "../../lib/db/types";
import { temperatureBandLabel, normalizeToken } from "../../lib/utils/format";
import { useI18n } from "../../lib/i18n/i18n";
import { DisclosureSection } from "../shared/DisclosureSection";
import { ItemImage } from "../shared/ItemImage";

type SortKey = "newest" | "favorites" | "name";

export function WardrobePage() {
  const { t } = useI18n();
  const navigate = useNavigate();
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
  }, [category, deferredSearch, items, materialFilter, occasionFilter, showArchived, showFavorites, sort, temperatureFilter, weatherFilter]);

  const advancedFilterCount = [showArchived, materialFilter !== "All", occasionFilter !== "All", temperatureFilter !== "All", weatherFilter !== "All"].filter(Boolean).length;

  return (
    <div className="page-stack">
      <section className="filter-bar">
        <div className="filter-copy">
          <span className="section-tag">{t("nav.wardrobe")}</span>
          <h2>{t("wardrobe.title")}</h2>
        </div>
        <div className="filter-actions">
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
        </div>
      </section>

      <section className="chip-row">
        <button className={`chip ${showFavorites ? "is-active" : ""}`} onClick={() => setShowFavorites((value) => !value)}>
          {t("wardrobe.favorites")}
        </button>
      </section>

      <DisclosureSection
        screenId="wardrobe"
        sectionId="wardrobe-advanced"
        title={t("wardrobe.advancedFilters")}
        summary={advancedFilterCount > 0 ? advancedFilterCount : t("disclosure.open")}
        defaultOpen={false}
      >
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
        <div className="secondary-actions">
          <button className={`chip ${showArchived ? "is-active" : ""}`} onClick={() => setShowArchived((value) => !value)}>
            {t("wardrobe.showArchived")}
          </button>
          <p className="muted-copy">{t("wardrobe.advancedHint")}</p>
        </div>
      </DisclosureSection>

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
        <ItemImage imageRef={item.heroImage} alt={item.name} className="cover-image" />
        <span className="item-chip">{item.category}</span>
      </button>
      <div className="item-meta">
        <div>
          <strong>{item.name}</strong>
          <span>{item.materials.join(" · ") || t("wardrobe.materialUnknown")}</span>
        </div>
        <span>{item.temperatureBand.map(temperatureBandLabel).join(", ")}</span>
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
