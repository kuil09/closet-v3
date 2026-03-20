import { clearAllProductData } from "../../lib/db/app-db";
import type { Units } from "../../lib/db/types";
import { usePreferencesStore } from "../../lib/state/preferences-store";
import { useI18n } from "../../lib/i18n/i18n";
import { useState } from "react";
import { DisclosureSection } from "../shared/DisclosureSection";

export function SettingsPage() {
  const { t } = useI18n();
  const units = usePreferencesStore((state) => state.units);
  const setUnits = usePreferencesStore((state) => state.setUnits);
  const [feedback, setFeedback] = useState("");

  async function handleReset() {
    if (!window.confirm(t("settings.resetConfirm"))) {
      return;
    }

    await clearAllProductData();
    setFeedback(t("settings.resetDone"));
  }

  return (
    <div className="page-stack">
      <section className="panel-card">
        <div className="panel-head">
          <div>
            <span className="section-tag">{t("settings.title")}</span>
            <h2>{t("settings.productControls")}</h2>
          </div>
        </div>
        <div className="settings-grid">
          <label>
            <span>{t("settings.units")}</span>
            <select className="control-select" value={units} onChange={(event) => setUnits(event.target.value as Units)}>
              <option value="C">{t("settings.unitsC")}</option>
              <option value="F">{t("settings.unitsF")}</option>
            </select>
          </label>
        </div>
      </section>

      <DisclosureSection
        screenId="settings"
        sectionId="settings-local-data"
        title={t("settings.localDataSection")}
        summary={feedback || t("settings.resetAction")}
        defaultOpen={false}
      >
        <p className="muted-copy">{t("settings.resetBody")}</p>
        <button className="secondary-button" onClick={() => void handleReset()}>
          {t("settings.resetAction")}
        </button>
        {feedback ? <p className="muted-copy">{feedback}</p> : null}
      </DisclosureSection>
    </div>
  );
}
