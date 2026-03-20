import { useEffect, useState, type ReactNode, type SetStateAction } from "react";
import { useI18n } from "../../lib/i18n/i18n";

const STORAGE_KEY = "atelier-disclosures-v1";
const MOBILE_BREAKPOINT = 920;

type DisclosureMap = Record<string, boolean>;

function readDisclosureMap(): DisclosureMap {
  if (typeof window === "undefined") {
    return {};
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as DisclosureMap) : {};
  } catch {
    return {};
  }
}

function writeDisclosureMap(next: DisclosureMap) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
}

function toStorageKey(screenId: string, sectionId: string) {
  return `${screenId}:${sectionId}`;
}

export function useDisclosurePreference(screenId: string, sectionId: string, defaultOpen = false) {
  const storageKey = toStorageKey(screenId, sectionId);
  const [isOpen, setIsOpen] = useState<boolean>(() => readDisclosureMap()[storageKey] ?? defaultOpen);

  useEffect(() => {
    const next = readDisclosureMap()[storageKey];
    setIsOpen(next ?? defaultOpen);
  }, [defaultOpen, storageKey]);

  function updateIsOpen(next: SetStateAction<boolean>) {
    setIsOpen((current) => {
      const resolved = typeof next === "function" ? next(current) : next;
      const snapshot = readDisclosureMap();
      snapshot[storageKey] = resolved;
      writeDisclosureMap(snapshot);
      return resolved;
    });
  }

  return [isOpen, updateIsOpen] as const;
}

export function useIsMobile() {
  const [isMobile, setIsMobile] = useState(() =>
    typeof window === "undefined" ? false : window.innerWidth <= MOBILE_BREAKPOINT
  );

  useEffect(() => {
    function onResize() {
      setIsMobile(window.innerWidth <= MOBILE_BREAKPOINT);
    }

    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  return isMobile;
}

export function SectionSummaryValue({ children }: { children: ReactNode }) {
  return <span className="section-summary">{children}</span>;
}

export function SheetSectionLauncher({
  title,
  eyebrow,
  summary,
  onOpen
}: {
  title: string;
  eyebrow?: string;
  summary?: ReactNode;
  onOpen: () => void;
}) {
  const { t } = useI18n();

  return (
    <button className="sheet-launcher" type="button" onClick={onOpen} aria-label={`${title} · ${t("disclosure.open")}`}>
      <div className="sheet-launcher-copy">
        {eyebrow ? <span className="section-tag">{eyebrow}</span> : null}
        <strong>{title}</strong>
      </div>
      <div className="sheet-launcher-meta">
        {summary ? <SectionSummaryValue>{summary}</SectionSummaryValue> : null}
        <span className="sheet-launcher-action">{t("disclosure.open")}</span>
      </div>
    </button>
  );
}

export function DisclosureSection({
  screenId,
  sectionId,
  title,
  eyebrow,
  summary,
  defaultOpen = false,
  mobileBehavior = "sheet",
  variant = "card",
  className = "",
  children
}: {
  screenId: string;
  sectionId: string;
  title: string;
  eyebrow?: string;
  summary?: ReactNode;
  defaultOpen?: boolean;
  mobileBehavior?: "sheet" | "inline";
  variant?: "card" | "soft";
  className?: string;
  children: ReactNode;
}) {
  const { t } = useI18n();
  const isMobile = useIsMobile();
  const [isOpen, setIsOpen] = useDisclosurePreference(screenId, sectionId, defaultOpen);

  if (isMobile && mobileBehavior === "sheet") {
    return (
      <>
        <SheetSectionLauncher title={title} eyebrow={eyebrow} summary={summary} onOpen={() => setIsOpen(true)} />
        {isOpen ? (
          <div className="sheet-backdrop" role="presentation" onClick={() => setIsOpen(false)}>
            <section
              className="sheet-panel"
              role="dialog"
              aria-modal="true"
              aria-label={title}
              onClick={(event) => event.stopPropagation()}
            >
              <div className="sheet-panel-head">
                <div>
                  {eyebrow ? <span className="section-tag">{eyebrow}</span> : null}
                  <h3>{title}</h3>
                </div>
                <button className="secondary-button" type="button" onClick={() => setIsOpen(false)}>
                  {t("disclosure.close")}
                </button>
              </div>
              <div className="sheet-panel-body">{children}</div>
            </section>
          </div>
        ) : null}
      </>
    );
  }

  return (
    <section className={`disclosure-card ${variant === "card" ? "panel-card" : "disclosure-card-soft"} ${className}`.trim()}>
      <button
        className="disclosure-toggle"
        type="button"
        aria-expanded={isOpen}
        onClick={() => setIsOpen((current) => !current)}
      >
        <div className="disclosure-copy">
          {eyebrow ? <span className="section-tag">{eyebrow}</span> : null}
          <strong>{title}</strong>
        </div>
        <div className="disclosure-meta">
          {summary ? <SectionSummaryValue>{summary}</SectionSummaryValue> : null}
          <span className="disclosure-action">{isOpen ? t("disclosure.close") : t("disclosure.open")}</span>
        </div>
      </button>
      {isOpen ? <div className="disclosure-body">{children}</div> : null}
    </section>
  );
}
