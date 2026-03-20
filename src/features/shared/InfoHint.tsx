import { useEffect, useId, useRef, useState, type ReactNode } from "react";
import { useI18n } from "../../lib/i18n/i18n";

export function InfoHint({
  content,
  label,
  align = "right",
  className = ""
}: {
  content: ReactNode;
  label: string;
  align?: "left" | "right";
  className?: string;
}) {
  const { t } = useI18n();
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLSpanElement | null>(null);
  const panelId = useId();

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    function handlePointerDown(event: PointerEvent) {
      if (!containerRef.current?.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    }

    window.addEventListener("pointerdown", handlePointerDown);
    window.addEventListener("keydown", handleEscape);
    return () => {
      window.removeEventListener("pointerdown", handlePointerDown);
      window.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen]);

  return (
    <span ref={containerRef} className={`info-hint ${className}`.trim()}>
      <button
        type="button"
        className={`info-hint-button ${isOpen ? "is-open" : ""}`.trim()}
        aria-label={`${label} · ${isOpen ? t("info.close") : t("info.open")}`}
        aria-expanded={isOpen}
        aria-controls={panelId}
        onClick={() => setIsOpen((current) => !current)}
      >
        ?
      </button>
      {isOpen ? (
        <span id={panelId} className={`info-hint-popover info-hint-popover-${align}`.trim()} role="note">
          {content}
        </span>
      ) : null}
    </span>
  );
}
