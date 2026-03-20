import { describe, expect, mock, test } from "bun:test";
import { act, fireEvent, render, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { App } from "../../src/app/App";
import { atelierDb } from "../../src/lib/db/app-db";
import { seedItems } from "../../src/lib/db/seed";
import { itemPaletteLightness } from "../../src/lib/utils/palette-range";

function mockEnvironment(options?: { fetchFails?: boolean; geolocationFails?: boolean }) {
  globalThis.fetch = mock(async () => {
    if (options?.fetchFails) {
      return new Response(null, { status: 500 });
    }

    return new Response(
      JSON.stringify({
        current: {
          temperature_2m: 18,
          weather_code: 0,
          wind_speed_10m: 7
        }
      })
    );
  }) as unknown as typeof fetch;

  Object.defineProperty(globalThis.navigator, "geolocation", {
    configurable: true,
    value: {
      getCurrentPosition(success: (position: GeolocationPosition) => void, reject?: (reason?: GeolocationPositionError) => void) {
        if (options?.geolocationFails) {
          reject?.({
            code: 1,
            message: "Permission denied",
            PERMISSION_DENIED: 1,
            POSITION_UNAVAILABLE: 2,
            TIMEOUT: 3
          } as GeolocationPositionError);
          return;
        }

        success({
          coords: {
            latitude: 37.56,
            longitude: 126.97,
            altitude: null,
            accuracy: 1,
            altitudeAccuracy: null,
            heading: null,
            speed: null
          },
          timestamp: Date.now()
        } as GeolocationPosition);
      }
    }
  });
}

function setViewportWidth(width: number) {
  Object.defineProperty(window, "innerWidth", {
    configurable: true,
    writable: true,
    value: width
  });
  window.dispatchEvent(new Event("resize"));
}

function renderAt(path: string, width = 1280, options?: { fetchFails?: boolean; geolocationFails?: boolean }) {
  mockEnvironment(options);
  setViewportWidth(width);
  window.history.replaceState({}, "", `http://localhost${path}`);
  return render(<App />);
}

function getWardrobeCardTitles(container: HTMLElement) {
  return Array.from(container.querySelectorAll(".item-card .item-title-row strong"))
    .map((node) => node.textContent?.trim() ?? "")
    .filter(Boolean);
}

describe("app flows", () => {
  test("supports theme and language switching from the shell", async () => {
    const user = userEvent.setup();
    const view = renderAt("/");

    await view.findByText(/Total Pieces/i);
    await user.selectOptions(view.getByLabelText("Language"), "ko");
    await waitFor(() => expect(view.getAllByText("홈").length).toBeGreaterThan(0));

    await user.click(view.getByLabelText("테마"));
    expect(document.documentElement.dataset.theme).toBe("dark");
  });

  test("opens the related wardrobe pages from home summary cards", async () => {
    const user = userEvent.setup();
    const view = renderAt("/");

    await view.findByText(/Total Pieces/i);
    await user.click(view.getByRole("button", { name: /Total Pieces/i }));
    await view.findByText("Palette range");

    await user.click(view.getAllByRole("link", { name: /Home$/ })[0]);
    await view.findByText(/Total Pieces/i);
    await user.click(view.getByRole("button", { name: /Favorites/i }));
    await waitFor(() => expect(view.getByRole("button", { name: /^Favorites$/ }).className).toContain("is-active"));
  });

  test("opens recent items from home in the edit screen", async () => {
    const user = userEvent.setup();
    const view = renderAt("/");

    const recentHeading = await view.findByText(/Fresh additions and drafts/i);
    const recentSection = recentHeading.closest("section");
    let firstRecentCard: HTMLButtonElement | null = null;
    let expectedName = "";

    await waitFor(() => {
      firstRecentCard = recentSection?.querySelector<HTMLButtonElement>(".item-card-button") ?? null;
      expectedName = firstRecentCard?.querySelector("strong")?.textContent?.trim() ?? "";

      expect(firstRecentCard, "recent section found but no cards rendered yet").toBeTruthy();
      expect(expectedName, "recent card rendered without a readable item name").toBeTruthy();
    });

    await user.click(firstRecentCard!);
    await view.findByDisplayValue(expectedName!);
  });

  test("continues the latest draft from the home hero", async () => {
    const user = userEvent.setup();
    const view = renderAt("/");

    await user.click(await view.findByRole("button", { name: /Continue latest draft/i }));
    await view.findByDisplayValue("Structured Wool Blazer");
  });

  test("creates a draft item without uploading an image", async () => {
    const user = userEvent.setup();
    const view = renderAt("/register");

    await view.findByText(/Capture a new piece/i);
    expect(view.getByText("Capture flow")).toBeTruthy();
    expect((view.getByLabelText("Materials") as HTMLInputElement).value).toBe("");
    await user.type(view.getByLabelText("Name"), "Test Trench");
    await user.type(view.getByLabelText("Materials"), "Cotton, Linen");
    await user.type(view.getByLabelText("Storage location"), "Entry Closet");
    await user.click(view.getByText("Save draft"));

    await view.findByText("Palette range");
    await waitFor(async () => {
      const saved = (await atelierDb.items.toArray()).find((item) => item.name === "Test Trench");
      expect(saved?.status).toBe("draft");
    });
  });

  test("adds and removes a meta asset before saving", async () => {
    const user = userEvent.setup();
    const view = renderAt("/register");
    const file = new File(["meta"], "receipt.png", { type: "image/png" });

    await view.findByText(/Capture a new piece/i);
    await user.click(view.getByRole("button", { name: /Reference images/i }));
    await user.upload(view.getByLabelText("Add reference image"), file);
    expect(await view.findByText(/receipt\.png/i)).toBeTruthy();

    await user.click(view.getByText("Remove asset"));
    await waitFor(() => expect(view.queryByText(/receipt\.png/i)).toBeNull());
  });

  test("limits palette colors to three in the register flow", async () => {
    const user = userEvent.setup();
    const view = renderAt("/register");

    await view.findByText(/Capture a new piece/i);
    await user.click(view.getByRole("button", { name: /Color palette/i }));

    const addColorButton = view.getByRole("button", { name: /^Add color$/ });
    await user.click(addColorButton);
    await user.click(addColorButton);
    await user.click(addColorButton);

    expect(view.container.querySelectorAll(".palette-editor").length).toBe(3);
    expect((view.getByRole("button", { name: /^Add color$/ }) as HTMLButtonElement).disabled).toBe(true);
  });

  test("re-edits an existing item and saves changes", async () => {
    const user = userEvent.setup();
    const view = renderAt("/register?item=item_coat");

    await view.findByDisplayValue("Over-Sized Cashmere Coat");
    const nameInput = view.getByLabelText("Name");
    await user.clear(nameInput);
    await user.type(nameInput, "Edited Coat");
    await user.click(view.getByText("Save to closet"));

    await waitFor(async () => {
      const updated = await atelierDb.items.get("item_coat");
      expect(updated?.name).toBe("Edited Coat");
      expect(updated?.status).toBe("saved");
    });
  });

  test("deletes an existing item from the edit screen", async () => {
    const originalConfirm = window.confirm;
    window.confirm = () => true;
    const user = userEvent.setup();
    const view = renderAt("/register?item=item_coat");

    try {
      await view.findByDisplayValue("Over-Sized Cashmere Coat");
      await user.click(view.getByRole("button", { name: /^Delete item$/ }));

      await view.findByText("Palette range");
      await waitFor(async () => {
        expect(await atelierDb.items.get("item_coat")).toBeUndefined();
      });
    } finally {
      window.confirm = originalConfirm;
    }
  });

  test("shows seeded meta assets with thumbnails on sample items", async () => {
    const user = userEvent.setup();
    const view = renderAt("/register?item=item_coat");

    await view.findByDisplayValue("Over-Sized Cashmere Coat");
    await user.click(view.getByRole("button", { name: /Reference images/i }));
    expect(await view.findByText("Care label")).toBeTruthy();
    expect(view.container.querySelectorAll(".meta-asset-thumb").length).toBeGreaterThan(0);
  });

  test("shows an unavailable state when automatic weather cannot be loaded", async () => {
    const view = renderAt("/", 1280, { geolocationFails: true });

    await waitFor(() => expect(view.getAllByText("Weather unavailable").length).toBeGreaterThan(0));
    expect(await view.findByText(/Automatic weather could not be loaded/i)).toBeTruthy();
  });

  test("switches weather units directly from the home card", async () => {
    const user = userEvent.setup();
    const view = renderAt("/");

    const weather = await view.findByLabelText(/Live weather/i);
    await waitFor(() => expect(weather.querySelector(".topbar-weather-icon svg")).toBeTruthy());
    await waitFor(() => expect(view.getByText(/^18C$/i)).toBeTruthy());
    await user.click(view.getByRole("button", { name: /^Fahrenheit$/ }));
    await waitFor(() => expect(view.getByText(/^64F$/i)).toBeTruthy());
  });

  test("clears local data after confirmation", async () => {
    const originalConfirm = window.confirm;
    window.confirm = () => true;
    const user = userEvent.setup();
    const view = renderAt("/settings");

    await user.click(await view.findByRole("button", { name: /Local data management/i }));
    await user.click(view.getByRole("button", { name: /^Clear local data$/ }));
    await waitFor(() => expect(view.getAllByText("Local wardrobe data cleared.").length).toBeGreaterThan(0));
    await user.click(view.getAllByRole("link", { name: /My Wardrobe$/ })[0]);
    await view.findByText("No pieces match this combination yet.");

    window.confirm = originalConfirm;
  });

  test("restores sample data from settings after a reset", async () => {
    const originalConfirm = window.confirm;
    window.confirm = () => true;
    const user = userEvent.setup();
    const view = renderAt("/settings");

    await user.click(await view.findByRole("button", { name: /Local data management/i }));
    await user.click(view.getByRole("button", { name: /^Clear local data$/ }));
    await waitFor(() => expect(view.getAllByText("Local wardrobe data cleared.").length).toBeGreaterThan(0));
    await user.click(view.getByRole("button", { name: /^Load sample data$/ }));
    await waitFor(() => expect(view.getAllByText("Sample wardrobe data loaded.").length).toBeGreaterThan(0));

    await user.click(view.getAllByRole("link", { name: /My Wardrobe$/ })[0]);
    await view.findByText("Structured Wool Blazer");

    window.confirm = originalConfirm;
  });

  test("documents the local lookbook direction in settings", async () => {
    const user = userEvent.setup();
    const view = renderAt("/settings");

    await user.click(await view.findByRole("button", { name: /Lookbook direction/i }));
    expect(await view.findByText(/Select saved pieces from the wardrobe/i)).toBeTruthy();
  });

  test("keeps quick browse controls visible and tucks away rare filters", async () => {
    const view = renderAt("/wardrobe");

    await view.findByText("Palette range");
    expect(view.getByLabelText("Search wardrobe")).toBeTruthy();
    expect(view.getByLabelText("Category")).toBeTruthy();
    expect(view.getByLabelText("Sort by")).toBeTruthy();
    expect(view.getByRole("button", { name: /^Favorites$/ })).toBeTruthy();
    expect(view.queryByRole("button", { name: /^Show archived$/ })).toBeNull();
    expect(view.queryByLabelText("Materials")).toBeNull();
    const lightestColorInput = view.getByLabelText("Lightest color") as HTMLInputElement;
    expect(lightestColorInput.value).toBe(lightestColorInput.max);
  });

  test("sorts wardrobe items by field and direction", async () => {
    const user = userEvent.setup();
    const view = renderAt("/wardrobe");
    const visibleSeedItems = seedItems.filter((item) => item.status !== "archived");
    const expectedNameAsc = visibleSeedItems
      .map((item) => item.name)
      .sort((left, right) => left.localeCompare(right))
      .slice(0, 3);
    const expectedNameDesc = visibleSeedItems
      .map((item) => item.name)
      .sort((left, right) => right.localeCompare(left))
      .slice(0, 3);
    const expectedColorAsc = [...visibleSeedItems]
      .sort((left, right) => {
        const byColor = itemPaletteLightness(left) - itemPaletteLightness(right);
        if (byColor !== 0) {
          return byColor;
        }

        return left.name.localeCompare(right.name);
      })
      .map((item) => item.name)
      .slice(0, 3);
    const expectedColorDesc = [...visibleSeedItems]
      .sort((left, right) => {
        const byColor = itemPaletteLightness(right) - itemPaletteLightness(left);
        if (byColor !== 0) {
          return byColor;
        }

        return left.name.localeCompare(right.name);
      })
      .map((item) => item.name)
      .slice(0, 3);

    await waitFor(() => expect(getWardrobeCardTitles(view.container).length).toBeGreaterThan(3));

    await act(async () => {
      await Promise.all(
        visibleSeedItems.map((item, index) =>
          atelierDb.items.update(item.id, {
            updatedAt: `2024-01-${String(index + 1).padStart(2, "0")}T00:00:00.000Z`
          })
        )
      );
    });

    await waitFor(() => expect(getWardrobeCardTitles(view.container)[0]).toBe(visibleSeedItems.at(-1)?.name ?? ""));

    await user.selectOptions(view.getByLabelText("Sort by"), "name-asc");
    await waitFor(() => expect(getWardrobeCardTitles(view.container).slice(0, 3)).toEqual(expectedNameAsc));

    await user.selectOptions(view.getByLabelText("Sort by"), "name-desc");
    await waitFor(() => expect(getWardrobeCardTitles(view.container).slice(0, 3)).toEqual(expectedNameDesc));

    await user.selectOptions(view.getByLabelText("Sort by"), "updated-asc");
    await waitFor(() => expect(getWardrobeCardTitles(view.container)[0]).toBe(visibleSeedItems[0]?.name ?? ""));

    await user.selectOptions(view.getByLabelText("Sort by"), "color-asc");
    await waitFor(() => expect(getWardrobeCardTitles(view.container).slice(0, 3)).toEqual(expectedColorAsc));

    await user.selectOptions(view.getByLabelText("Sort by"), "color-desc");
    await waitFor(() => expect(getWardrobeCardTitles(view.container).slice(0, 3)).toEqual(expectedColorDesc));
  });

  test("filters wardrobe items by the saved palette range", async () => {
    const view = renderAt("/wardrobe");

    await view.findByText("Palette range");
    expect(view.container.querySelector(".color-range-summary")).toBeNull();
    expect(view.queryByText("Black side")).toBeNull();
    expect(view.queryByText("White side")).toBeNull();

    fireEvent.change(view.getByLabelText("Lightest color"), { target: { value: "0" } });
    expect((view.getByLabelText("Lightest color") as HTMLInputElement).value).toBe("0");
  });

  test("opens a full-screen garment preview from wardrobe images", async () => {
    const user = userEvent.setup();
    const view = renderAt("/wardrobe");

    await view.findByText("Palette range");
    const firstImageButton = await waitFor(() => {
      const node = view.container.querySelector<HTMLButtonElement>(".wardrobe-grid .item-image-wrap");
      expect(node, "wardrobe image button should render").toBeTruthy();
      return node!;
    });

    const itemName = firstImageButton.getAttribute("aria-label") ?? "";
    await user.click(firstImageButton);
    expect(await view.findByRole("dialog", { name: itemName })).toBeTruthy();

    await user.click(view.getByRole("button", { name: /^Close$/ }));
    await waitFor(() => expect(view.queryByRole("dialog", { name: itemName })).toBeNull());
  });

  test("opens secondary controls from a mobile sheet launcher", async () => {
    const user = userEvent.setup();
    const view = renderAt("/settings", 768);

    expect(view.queryByRole("button", { name: /^Clear local data$/ })).toBeNull();
    await user.click(await view.findByRole("button", { name: /Local data management/i }));
    await view.findByRole("button", { name: /^Clear local data$/ });
  });

  test("shows recent items on the home screen", async () => {
    await atelierDb.items.bulkPut(seedItems);
    const view = renderAt("/");
    const activeSeedCount = seedItems.filter((item) => item.status !== "archived").length;

    await view.findByRole("button", { name: /Continue latest draft/i });
    expect(view.getByText(/Rule-based weather picks/i)).toBeTruthy();
    await view.findByText(/Fresh additions and drafts/i);
    expect(view.getAllByRole("button", { name: /Total Pieces|Favorites/i }).length).toBe(2);
    expect(view.queryByText(/Category breakdown/i)).toBeNull();
    expect(view.queryByText(/Season and weather fit/i)).toBeNull();
    const [categoryCard, seasonCard, weatherCard] = Array.from(
      view.container.querySelectorAll<HTMLElement>(".insight-card")
    );
    expect(categoryCard).toBeTruthy();
    expect(seasonCard).toBeTruthy();
    expect(weatherCard).toBeTruthy();
    await waitFor(() => expect(categoryCard?.textContent).toContain("Outerwear"));
    await waitFor(() => expect(seasonCard?.textContent).toContain("Winter"));
    await waitFor(() => expect(weatherCard?.textContent).toContain("Clear"));
    expect(categoryCard?.querySelectorAll(".insight-donut-svg").length).toBeGreaterThan(0);
    expect(categoryCard?.querySelectorAll(".insight-donut-label").length).toBeGreaterThan(0);
    expect(categoryCard?.querySelectorAll(".insight-donut-label-metric").length).toBeGreaterThan(0);
    expect(seasonCard?.querySelectorAll(".insight-donut-svg").length).toBeGreaterThan(0);
    expect(seasonCard?.querySelectorAll(".insight-donut-label").length).toBeGreaterThan(0);
    expect(seasonCard?.querySelectorAll(".insight-donut-label-metric").length).toBeGreaterThan(0);
    expect(weatherCard?.querySelectorAll(".insight-donut-svg").length).toBeGreaterThan(0);
    expect(weatherCard?.querySelectorAll(".insight-donut-label").length).toBeGreaterThan(0);
    expect(weatherCard?.querySelectorAll(".insight-donut-label-metric").length).toBeGreaterThan(0);
    expect(categoryCard?.textContent).toMatch(/\d+\s·\s\d+%/);
    expect(seasonCard?.textContent).toMatch(/\d+\s·\s\d+%/);
    expect(weatherCard?.textContent).toMatch(/\d+\s·\s\d+%/);
    expect(view.getByText(String(activeSeedCount))).toBeTruthy();
    const firstRecentCard = view.container.querySelector(".item-card .item-image-wrap");
    expect(firstRecentCard?.querySelectorAll(".item-palette-dot").length).toBeGreaterThan(0);
    expect(firstRecentCard?.querySelectorAll(".item-palette-dot").length).toBeLessThanOrEqual(3);
  });
});
