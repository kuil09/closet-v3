import { describe, expect, test } from "bun:test";
import { getBodyFontStack, getDisplayFontStack } from "../../src/lib/i18n/font-stacks";

describe("font stacks", () => {
  test("uses dedicated CJK stacks for Korean, Japanese, and Simplified Chinese", () => {
    expect(getBodyFontStack("ko")).toContain("Noto Sans KR");
    expect(getDisplayFontStack("ja")).toContain("Noto Sans JP");
    expect(getBodyFontStack("zh-CN")).toContain("Noto Sans SC");
  });

  test("keeps the editorial Latin stack for western locales", () => {
    expect(getBodyFontStack("en")).toContain("Work Sans");
    expect(getDisplayFontStack("fr")).toContain("Manrope");
  });
});
