import { useI18n } from "../../lib/i18n/i18n";

export function ItemPaletteDots({ colors }: { colors: string[] }) {
  const { t } = useI18n();
  const visibleColors = colors.filter(Boolean).slice(0, 3);

  if (visibleColors.length === 0) {
    return null;
  }

  return (
    <span className="item-palette-dots" aria-label={`${t("register.palette")}: ${visibleColors.join(", ")}`}>
      {visibleColors.map((color, index) => (
        <span
          key={`${color}-${index}`}
          className="item-palette-dot"
          style={{ backgroundColor: color }}
          title={color}
          aria-hidden="true"
        />
      ))}
    </span>
  );
}
