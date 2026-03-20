import { clearAllProductData, importSampleData } from "../../lib/db/app-db";
import { useI18n } from "../../lib/i18n/i18n";
import { useState } from "react";
import { DisclosureSection } from "../shared/DisclosureSection";

export function SettingsPage() {
  const { t } = useI18n();
  const [feedback, setFeedback] = useState("");

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
        sectionId="settings-local-data"
        title={t("settings.localDataSection")}
        summary={feedback || t("settings.resetAction")}
        defaultOpen={false}
      >
        <p className="muted-copy">{t("settings.resetBody")}</p>
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
