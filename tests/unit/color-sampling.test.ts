import { describe, expect, test } from "bun:test";
import { mapClientPointToImagePixel } from "../../src/lib/media/color-sampling";

describe("color sampling", () => {
  test("maps cover-fitted coordinates against the visible crop", () => {
    expect(
      mapClientPointToImagePixel({
        bounds: { left: 0, top: 0, width: 300, height: 300 },
        naturalWidth: 600,
        naturalHeight: 1200,
        clientX: 150,
        clientY: 150,
        objectFit: "cover"
      })
    ).toEqual({ x: 300, y: 600 });
  });

  test("rejects points outside the visible image area for contain", () => {
    expect(
      mapClientPointToImagePixel({
        bounds: { left: 0, top: 0, width: 300, height: 300 },
        naturalWidth: 600,
        naturalHeight: 1200,
        clientX: 20,
        clientY: 150,
        objectFit: "contain"
      })
    ).toBeNull();
  });

  test("maps contain-fitted coordinates inside the rendered image", () => {
    expect(
      mapClientPointToImagePixel({
        bounds: { left: 0, top: 0, width: 300, height: 300 },
        naturalWidth: 600,
        naturalHeight: 1200,
        clientX: 150,
        clientY: 150,
        objectFit: "contain"
      })
    ).toEqual({ x: 300, y: 600 });
  });
});
