import { describe, expect, mock, test } from "bun:test";
import { fireEvent, render, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { App } from "../../src/app/App";
import { atelierDb } from "../../src/lib/db/app-db";

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

  test("opens the related pages from home summary cards", async () => {
    const user = userEvent.setup();
    const view = renderAt("/");

    await view.findByText(/Total Pieces/i);
    await user.click(view.getByRole("button", { name: /Total Pieces/i }));
    await view.findByText(/Your Digital Sanctuary/i);

    await user.click(view.getAllByRole("link", { name: /Home$/ })[0]);
    await view.findByText(/Total Pieces/i);
    await user.click(view.getByRole("button", { name: /Lookbooks/i }));
    await view.findByRole("heading", { name: /Lookbook Maker/i });

    await user.click(view.getAllByRole("link", { name: /Home$/ })[0]);
    await view.findByText(/Total Pieces/i);
    await user.click(view.getByRole("button", { name: /Favorites/i }));
    await view.findByText(/Your Digital Sanctuary/i);
    expect(view.getByRole("button", { name: /^Favorites$/ }).className).toContain("is-active");
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

    await view.findByText(/Your Digital Sanctuary/i);
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

  test("saves a new lookbook composition and shows it in saved boards", async () => {
    const user = userEvent.setup();
    const view = renderAt("/lookbook");

    await view.findByDisplayValue("Autumn Redaction");
    await user.click(view.getByText("New board"));
    const titleInput = view.getByLabelText("Lookbook Maker");
    await user.clear(titleInput);
    await user.type(titleInput, "Studio Test");
    await user.click(view.getByText("Add note"));
    await user.click(view.getByRole("button", { name: /Closet drawer/i }));
    await user.click(view.getByRole("button", { name: /Over-Sized Cashmere Coat/i }));
    await user.click(view.getByText("Save lookbook"));
    await user.click(view.getByRole("button", { name: /Saved boards/i }));
    await waitFor(() => expect(view.getAllByText("Studio Test").length).toBeGreaterThan(0));
  });

  test("requires at least one garment before saving a lookbook", async () => {
    const user = userEvent.setup();
    const view = renderAt("/lookbook");

    await view.findByDisplayValue("Autumn Redaction");
    await user.click(view.getByText("New board"));
    const titleInput = view.getByLabelText("Lookbook Maker");
    await user.clear(titleInput);
    await user.type(titleInput, "Text Only Board");
    await user.click(view.getByText("Save lookbook"));

    await view.findByText("Add at least one garment to save this lookbook.");
    expect((await atelierDb.lookbooks.toArray()).some((entry) => entry.title === "Text Only Board")).toBe(false);
  });

  test("clears local data after confirmation", async () => {
    const originalConfirm = window.confirm;
    window.confirm = () => true;
    const user = userEvent.setup();
    const view = renderAt("/settings");

    await view.findByText("Product controls");
    await user.click(view.getByRole("button", { name: /Local data management/i }));
    await user.click(view.getByRole("button", { name: /^Clear local data$/ }));
    await waitFor(() => expect(view.getAllByText("Local wardrobe data cleared.").length).toBeGreaterThan(0));
    await user.click(view.getAllByRole("link", { name: /My Wardrobe$/ })[0]);
    await view.findByText("No pieces match this combination yet.");

    window.confirm = originalConfirm;
  });

  test("keeps advanced wardrobe filters collapsed by default and remembers expansion", async () => {
    const user = userEvent.setup();
    const view = renderAt("/wardrobe");

    await view.findByText(/Your Digital Sanctuary/i);
    expect(view.queryByText("Show archived")).toBeNull();
    await user.click(view.getByRole("button", { name: /Advanced filters/i }));
    await view.findByText("Show archived");
    await user.click(view.getAllByRole("link", { name: /Home$/ })[0]);
    await view.findByText(/Total Pieces/i);
    await user.click(view.getAllByRole("link", { name: /My Wardrobe$/ })[0]);
    await view.findByText("Show archived");
  });

  test("filters wardrobe items by the saved palette range", async () => {
    const user = userEvent.setup();
    const view = renderAt("/wardrobe");

    await view.findByText(/Your Digital Sanctuary/i);
    if (!view.queryByText("Palette range")) {
      await user.click(view.getByRole("button", { name: /Advanced filters/i }));
    }
    await view.findByText("Palette range");

    fireEvent.change(view.getByLabelText("Lightest color"), { target: { value: "0" } });
    expect((view.getByLabelText("Lightest color") as HTMLInputElement).value).toBe("0");
  });

  test("opens secondary controls from a mobile sheet launcher", async () => {
    const user = userEvent.setup();
    const view = renderAt("/settings", 768);

    await view.findByText("Product controls");
    expect(view.queryByRole("button", { name: /^Clear local data$/ })).toBeNull();
    await user.click(view.getByRole("button", { name: /Local data management/i }));
    await view.findByRole("button", { name: /^Clear local data$/ });
  });

  test("opens a saved lookbook from the home gallery", async () => {
    const user = userEvent.setup();
    const view = renderAt("/");

    await user.click(await view.findByRole("button", { name: /Autumn Redaction/i }));
    await view.findByDisplayValue("Autumn Redaction");
  });
});
