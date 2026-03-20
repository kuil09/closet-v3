import { clearAllProductData } from "../../lib/db/app-db";
import type { Locale, Units } from "../../lib/db/types";
import { usePreferencesStore } from "../../lib/state/preferences-store";
import { useI18n } from "../../lib/i18n/i18n";
import { useState } from "react";
import { DisclosureSection } from "../shared/DisclosureSection";

export function SettingsPage() {
  const { t } = useI18n();
  const theme = usePreferencesStore((state) => state.theme);
  const language = usePreferencesStore((state) => state.language);
  const units = usePreferencesStore((state) => state.units);
  const motion = usePreferencesStore((state) => state.motion);
  const setTheme = usePreferencesStore((state) => state.setTheme);
  const setLanguage = usePreferencesStore((state) => state.setLanguage);
  const setUnits = usePreferencesStore((state) => state.setUnits);
  const setMotion = usePreferencesStore((state) => state.setMotion);
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
        <p className="muted-copy">{t("settings.localOnly")}</p>
        <div className="settings-grid">
          <label>
            <span>{t("settings.theme")}</span>
            <select className="control-select" value={theme} onChange={(event) => setTheme(event.target.value as typeof theme)}>
              <option value="light">{t("settings.themeLight")}</option>
              <option value="dark">{t("settings.themeDark")}</option>
            </select>
          </label>
          <label>
            <span>{t("settings.language")}</span>
            <select
              className="control-select"
              value={language}
              onChange={(event) => setLanguage(event.target.value as Locale)}
            >
              <option value="en">English</option>
              <option value="ko">한국어</option>
              <option value="ja">日本語</option>
              <option value="fr">Français</option>
              <option value="es">Español</option>
              <option value="de">Deutsch</option>
              <option value="zh-CN">中文</option>
            </select>
          </label>
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
        sectionId="settings-weather"
        title={t("settings.weatherSection")}
        summary={t("settings.weatherAuto")}
        defaultOpen={false}
      >
        <p className="muted-copy">{t("settings.weatherAutoOnlyBody")}</p>
      </DisclosureSection>

      <DisclosureSection
        screenId="settings"
        sectionId="settings-motion"
        title={t("settings.motionSection")}
        summary={motion === "full" ? t("settings.motionFull") : t("settings.motionReduced")}
        defaultOpen={false}
      >
        <div className="settings-grid">
          <label>
            <span>{t("settings.motion")}</span>
            <select
              className="control-select"
              value={motion}
              onChange={(event) => setMotion(event.target.value as typeof motion)}
            >
              <option value="full">{t("settings.motionFull")}</option>
              <option value="reduced">{t("settings.motionReduced")}</option>
            </select>
          </label>
        </div>
      </DisclosureSection>

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
