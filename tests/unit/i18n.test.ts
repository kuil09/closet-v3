import { describe, expect, test } from "bun:test";
import { messages } from "../../src/lib/i18n/messages";

describe("i18n catalog", () => {
  test("returns translated Korean navigation labels", () => {
    expect(messages.ko["nav.home"]).toBe("홈");
    expect(messages.ko["nav.lookbook"]).toBe("룩북 메이커");
  });

  test("keeps English fallback-compatible keys for all locales", () => {
    for (const locale of Object.keys(messages) as Array<keyof typeof messages>) {
      expect(messages[locale]["home.heroTitle"]).toBeString();
      expect(messages[locale]["settings.title"]).toBeString();
    }
  });
});
