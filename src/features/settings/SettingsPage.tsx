import { clearAllProductData, importSampleData } from "../../lib/db/app-db";
import { useI18n } from "../../lib/i18n/i18n";
import { useState } from "react";
import { usePreferencesStore } from "../../lib/state/preferences-store";
import { DisclosureSection } from "../shared/DisclosureSection";
import { InfoHint } from "../shared/InfoHint";

export function SettingsPage() {
  const { t } = useI18n();
  const [feedback, setFeedback] = useState("");
  const theme = usePreferencesStore((state) => state.theme);
  const language = usePreferencesStore((state) => state.language);
  const units = usePreferencesStore((state) => state.units);
  const shellSummary = [
    language.toUpperCase(),
    theme === "light" ? t("settings.themeLight") : t("settings.themeDark"),
    units === "C" ? t("settings.unitsC") : t("settings.unitsF")
  ].join(" · ");

  async function handleReset() {
    if (!window.confirm(t("settings.resetConfirm"))) {
      return;
    }

    await clearAllProductData();
    setFeedback(t("settings.resetDone"));
  }

  async function handleImportSamples() {
    await importSampleData();
    setFeedback(t("settings.sampleDone"));
  }

  return (
    <div className="page-stack">
      <DisclosureSection
        screenId="settings"
        sectionId="settings-product-controls"
        title={t("settings.productControls")}
        summary={shellSummary}
        defaultOpen={false}
      >
        <p className="muted-copy">{t("settings.shellControlsSummary")}</p>
        <p className="muted-copy">{t("settings.shellControlsBody")}</p>
      </DisclosureSection>

      <DisclosureSection
        screenId="settings"
        sectionId="settings-local-rules"
        title={t("settings.localOnlyTitle")}
        summary={t("badge.local")}
        defaultOpen={true}
        variant="soft"
      >
        <p className="muted-copy">{t("settings.localOnly")}</p>
      </DisclosureSection>

      <DisclosureSection
        screenId="settings"
        sectionId="settings-lookbook-direction"
        title={t("settings.lookbookTitle")}
        summary={t("settings.lookbookSummary")}
        defaultOpen={false}
      >
        <p className="muted-copy">{t("settings.lookbookBody")}</p>
        <ol className="settings-list">
          <li>{t("settings.lookbookStepSelect")}</li>
          <li>{t("settings.lookbookStepCompose")}</li>
          <li>{t("settings.lookbookStepExport")}</li>
        </ol>
      </DisclosureSection>

      <DisclosureSection
        screenId="settings"
        sectionId="settings-local-data"
        title={t("settings.localDataSection")}
        summary={feedback || t("settings.resetAction")}
        defaultOpen={false}
      >
        <div className="section-inline-tools">
          <InfoHint label={t("settings.localDataSection")} content={t("settings.resetBody")} />
        </div>
        <div className="button-row">
          <button className="secondary-button" onClick={() => void handleImportSamples()}>
            {t("settings.sampleAction")}
          </button>
          <button className="secondary-button" onClick={() => void handleReset()}>
            {t("settings.resetAction")}
          </button>
        </div>
        {feedback ? <p className="muted-copy">{feedback}</p> : null}
      </DisclosureSection>
    </div>
  );
}
