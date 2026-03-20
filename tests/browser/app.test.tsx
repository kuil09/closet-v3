import { describe, expect, mock, test } from "bun:test";
import { render, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { App } from "../../src/app/App";

function mockEnvironment() {
  globalThis.fetch = mock(async () =>
    new Response(
      JSON.stringify({
        current: {
          temperature_2m: 18,
          weather_code: 0,
          wind_speed_10m: 7
        }
      })
    )
  ) as unknown as typeof fetch;

  Object.defineProperty(globalThis.navigator, "geolocation", {
    configurable: true,
    value: {
      getCurrentPosition(success: (position: GeolocationPosition) => void) {
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

function renderAt(path: string) {
  mockEnvironment();
  window.history.replaceState({}, "", `http://localhost${path}`);
  return render(<App />);
}

describe("app flows", () => {
  test("supports theme and language switching from the shell", async () => {
    const user = userEvent.setup();
    const view = renderAt("/");

    await view.findByText(/Curating your digital closet/i);
    await user.selectOptions(view.getByLabelText("Language"), "ko");
    await waitFor(() => expect(view.getAllByText("홈").length).toBeGreaterThan(0));

    await user.click(view.getByLabelText("테마"));
    expect(document.documentElement.dataset.theme).toBe("dark");
  });

  test("creates a draft item without uploading an image", async () => {
    const user = userEvent.setup();
    const view = renderAt("/register");

    await view.findByText(/Capture a new piece/i);
    await user.type(view.getByLabelText("Name"), "Test Trench");
    await user.type(view.getByLabelText("Materials"), "Cotton, Linen");
    await user.type(view.getByLabelText("Storage location"), "Entry Closet");
    await user.click(view.getByText("Save draft"));

    await view.findByText(/Your Digital Sanctuary/i);
    await view.findByText("Test Trench");
  });

  test("adds and removes a meta asset before saving", async () => {
    const user = userEvent.setup();
    const view = renderAt("/register");
    const file = new File(["meta"], "receipt.png", { type: "image/png" });

    await view.findByText(/Capture a new piece/i);
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

    await view.findByText("Edited Coat");
  });

  test("supports manual weather override from settings", async () => {
    const user = userEvent.setup();
    const view = renderAt("/settings");

    await view.findByText("Product controls");
    await user.selectOptions(view.getByDisplayValue("Auto"), "manual");
    await user.clear(view.getByLabelText("Manual temperature"));
    await user.type(view.getByLabelText("Manual temperature"), "24");
    await user.selectOptions(view.getByLabelText("Manual condition"), "rain");
    await user.click(view.getAllByRole("link", { name: /Home$/ })[0]);

    await view.findByText(/24C/i);
    expect(view.getByText(/rain · 8 kph wind/i)).toBeTruthy();
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
    await user.click(view.getByText("Save lookbook"));

    await waitFor(() => expect(view.getByText("Studio Test")).toBeTruthy());
  });

  test("clears local data after confirmation", async () => {
    const originalConfirm = window.confirm;
    window.confirm = () => true;
    const user = userEvent.setup();
    const view = renderAt("/settings");

    await view.findByText("Product controls");
    await user.click(view.getByText("Clear local data"));
    await view.findByText("Local wardrobe data cleared.");
    await user.click(view.getAllByRole("link", { name: /My Wardrobe$/ })[0]);
    await view.findByText("No pieces match this combination yet.");

    window.confirm = originalConfirm;
  });
});
