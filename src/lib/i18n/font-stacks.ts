import type { Locale } from "../db/types";

const latinBody = '"Work Sans", sans-serif';
const latinDisplay = '"Manrope", sans-serif';

const localeFonts: Partial<Record<Locale, { body: string; display: string }>> = {
  ko: {
    body: '"Noto Sans KR", "Work Sans", sans-serif',
    display: '"Noto Sans KR", "Manrope", sans-serif'
  },
  ja: {
    body: '"Noto Sans JP", "Work Sans", sans-serif',
    display: '"Noto Sans JP", "Manrope", sans-serif'
  },
  "zh-CN": {
    body: '"Noto Sans SC", "Work Sans", sans-serif',
    display: '"Noto Sans SC", "Manrope", sans-serif'
  }
};

export function getBodyFontStack(locale: Locale): string {
  return localeFonts[locale]?.body ?? latinBody;
}

export function getDisplayFontStack(locale: Locale): string {
  return localeFonts[locale]?.display ?? latinDisplay;
}
