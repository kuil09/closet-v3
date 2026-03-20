import { useState } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { useNavigate } from "react-router-dom";
import { atelierDb } from "../../lib/db/app-db";
import { useI18n } from "../../lib/i18n/i18n";
import { categoryMessageKey } from "../../lib/i18n/label-keys";
import { ItemImage } from "../shared/ItemImage";
import { ItemPaletteDots } from "../shared/ItemPaletteDots";

export function HomePage() {
  const { t } = useI18n();
  const navigate = useNavigate();
  const items = useLiveQuery(() => atelierDb.items.toArray(), [], []);
  const [showAllRecent, setShowAllRecent] = useState(false);

  const activeItems = items.filter((item) => item.status !== "archived");
  const recentItems = [...activeItems].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
  const visibleRecentItems = showAllRecent ? recentItems : recentItems.slice(0, 4);

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
          <button className="secondary-button" onClick={() => setShowAllRecent((current) => !current)}>
            {showAllRecent ? t("home.recentLess") : t("home.recentMore")}
          </button>
        ) : null}
      </section>
    </div>
  );
}
