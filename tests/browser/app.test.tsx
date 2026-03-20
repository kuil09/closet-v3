import { describe, expect, mock, test } from "bun:test";
import { act, fireEvent, render, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { App } from "../../src/app/App";
import { atelierDb } from "../../src/lib/db/app-db";
import { seedItems } from "../../src/lib/db/seed";

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

async function openWardrobeHiddenFilters(user: ReturnType<typeof userEvent.setup>, view: ReturnType<typeof render>) {
  const toggle = await waitFor(() => {
    const node = view.container.querySelector<HTMLButtonElement>(".wardrobe-hidden-filters .disclosure-toggle");
    expect(node, "wardrobe hidden-filters toggle should render").toBeTruthy();
    return node!;
  });

  await user.click(toggle);
  await view.findByLabelText("Search wardrobe");
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
    await openWardrobeHiddenFilters(user, view);
    expect(view.getByRole("button", { name: /^Favorites$/ }).className).toContain("is-active");
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

  test("creates a draft item without uploading an image", async () => {
    const user = userEvent.setup();
    const view = renderAt("/register");

    await view.findByText(/Capture a new piece/i);
    expect((view.getByLabelText("Materials") as HTMLInputElement).value).toBe("");
    expect(view.getAllByText("Not set").length).toBeGreaterThan(0);
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
    await user.click(view.getByRole("button", { name: /Meta assets/i }));
    await user.upload(view.getByLabelText("Add image"), file);
    expect(await view.findByText(/receipt\.png/i)).toBeTruthy();

    await user.click(view.getByText("Remove asset"));
    await waitFor(() => expect(view.queryByText(/receipt\.png/i)).toBeNull());
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

  test("shows an unavailable state when automatic weather cannot be loaded", async () => {
    const view = renderAt("/", 1280, { geolocationFails: true });

    await waitFor(() => expect(view.getAllByText("Weather unavailable").length).toBeGreaterThan(0));
    expect(await view.findByText(/Permission denied/i)).toBeTruthy();
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

  test("shows only the palette range filter by default", async () => {
    const view = renderAt("/wardrobe");

    await view.findByText("Palette range");
    expect(view.queryByLabelText("Search wardrobe")).toBeNull();
    expect(view.queryByText("Show archived")).toBeNull();
    expect(view.queryByLabelText("Sort by")).toBeNull();
    expect(view.queryByLabelText("Order")).toBeNull();
    expect(view.queryByRole("option", { name: "Favorites first" })).toBeNull();
    const lightestColorInput = view.getByLabelText("Lightest color") as HTMLInputElement;
    expect(lightestColorInput.value).toBe(lightestColorInput.max);
  });

  test("sorts wardrobe items by field and direction", async () => {
    const user = userEvent.setup();
    const view = renderAt("/wardrobe");

    await openWardrobeHiddenFilters(user, view);
    await waitFor(() => expect(getWardrobeCardTitles(view.container).length).toBeGreaterThan(3));

    await act(async () => {
      await atelierDb.items.update("item_coat", { updatedAt: "2024-01-01T00:00:00.000Z" });
      await atelierDb.items.update("item_boot", { updatedAt: "2024-01-02T00:00:00.000Z" });
      await atelierDb.items.update("item_denim", { updatedAt: "2024-01-03T00:00:00.000Z" });
      await atelierDb.items.update("item_blazer", { updatedAt: "2024-01-04T00:00:00.000Z" });
      await atelierDb.items.update("item_shirt", { updatedAt: "2024-01-05T00:00:00.000Z" });
    });

    await waitFor(() => expect(getWardrobeCardTitles(view.container)[0]).toBe("Essential Linen Shirt"));

    await user.selectOptions(view.getByLabelText("Sort by"), "name");
    await user.selectOptions(view.getByLabelText("Order"), "asc");
    await waitFor(() =>
      expect(getWardrobeCardTitles(view.container).slice(0, 3)).toEqual([
        "Essential Linen Shirt",
        "Over-Sized Cashmere Coat",
        "Raw Indigo Denim"
      ])
    );

    await user.selectOptions(view.getByLabelText("Order"), "desc");
    await waitFor(() =>
      expect(getWardrobeCardTitles(view.container).slice(0, 3)).toEqual([
        "Terra Chelsea Boots",
        "Structured Wool Blazer",
        "Raw Indigo Denim"
      ])
    );

    await user.selectOptions(view.getByLabelText("Sort by"), "updated");
    await user.selectOptions(view.getByLabelText("Order"), "asc");
    await waitFor(() => expect(getWardrobeCardTitles(view.container)[0]).toBe("Over-Sized Cashmere Coat"));

    await user.selectOptions(view.getByLabelText("Sort by"), "color");
    await user.selectOptions(view.getByLabelText("Order"), "asc");
    await waitFor(() =>
      expect(getWardrobeCardTitles(view.container).slice(0, 3)).toEqual([
        "Raw Indigo Denim",
        "Terra Chelsea Boots",
        "Structured Wool Blazer"
      ])
    );

    await user.selectOptions(view.getByLabelText("Order"), "desc");
    await waitFor(() =>
      expect(getWardrobeCardTitles(view.container).slice(0, 3)).toEqual([
        "Essential Linen Shirt",
        "Over-Sized Cashmere Coat",
        "Structured Wool Blazer"
      ])
    );
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

    await view.findByText(/Fresh additions and drafts/i);
    expect(view.getAllByRole("button", { name: /Total Pieces|Favorites/i }).length).toBe(2);
  });
});
