import { createContext, useContext, useMemo } from "react";
import type { ReactNode } from "react";
import type { Locale } from "../db/types";
import { messages, type MessageKey } from "./messages";

interface I18nValue {
  locale: Locale;
  t: (key: MessageKey) => string;
}

const I18nContext = createContext<I18nValue | null>(null);

export function I18nProvider({
  children,
  locale
}: {
  children: ReactNode;
  locale: Locale;
}) {
  const value = useMemo<I18nValue>(
    () => ({
      locale,
      t: (key) => messages[locale][key] ?? messages.en[key] ?? key
    }),
    [locale]
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n(): I18nValue {
  const value = useContext(I18nContext);

  if (!value) {
    throw new Error("useI18n must be used inside I18nProvider");
  }

  return value;
}
