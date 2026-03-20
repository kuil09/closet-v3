import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { chromium } from "playwright";

const outputDir = process.env.CI_SCREENSHOT_DIR ?? "artifacts/screenshots";
const baseUrl = process.env.CI_SCREENSHOT_BASE_URL ?? "http://127.0.0.1:4173";
const basePath = (process.env.CI_SCREENSHOT_BASE_PATH ?? "/closet-v3").replace(/\/$/, "");

const captures = [
  {
    name: "home-desktop",
    description: "Home dashboard (desktop)",
    viewport: { width: 1440, height: 1080 },
    navLabel: "Home"
  },
  {
    name: "wardrobe-desktop",
    description: "Wardrobe catalog with primary filters",
    viewport: { width: 1440, height: 1080 },
    navLabel: "My Wardrobe"
  },
  {
    name: "register-desktop",
    description: "Register item with progressive disclosure",
    viewport: { width: 1440, height: 1080 },
    navLabel: "Register Item"
  },
  {
    name: "settings-mobile",
    description: "Settings on mobile with sheet-based controls",
    viewport: { width: 430, height: 932 },
    navLabel: "Settings"
  }
];

function toAppUrl() {
  return new URL(`${basePath}/`, `${baseUrl}/`).toString();
}

async function waitForAppReady(page) {
  await page.waitForLoadState("domcontentloaded");
  await page.waitForLoadState("networkidle");
  await page.getByText(/The Atelier/i).waitFor();
}

async function main() {
  await mkdir(outputDir, { recursive: true });

  const browser = await chromium.launch({ headless: true });
  const manifest = [];

  try {
    for (const capture of captures) {
      const context = await browser.newContext({
        viewport: capture.viewport,
        colorScheme: "light",
        geolocation: { latitude: 37.5665, longitude: 126.978 },
        permissions: ["geolocation"]
      });

      await context.route("**/api.open-meteo.com/**", async (route) => {
        await route.fulfill({
          contentType: "application/json",
          body: JSON.stringify({
            current: {
              temperature_2m: 18,
              weather_code: 0,
              wind_speed_10m: 8
            }
          })
        });
      });

      const page = await context.newPage();
      await page.goto(toAppUrl(), { waitUntil: "domcontentloaded" });
      await waitForAppReady(page);

      if (capture.navLabel !== "Home") {
        await page.getByRole("link", { name: new RegExp(`${capture.navLabel}$`) }).first().click();
        await page.waitForLoadState("networkidle");
      }

      if (capture.afterLoad) {
        await capture.afterLoad(page);
        await page.waitForLoadState("networkidle");
      }

      const fileName = `${capture.name}.png`;
      const filePath = path.join(outputDir, fileName);
      await page.screenshot({ path: filePath, fullPage: true });

      manifest.push({
        name: capture.name,
        description: capture.description,
        fileName
      });

      await context.close();
    }
  } finally {
    await browser.close();
  }

  const manifestPath = path.join(outputDir, "manifest.json");
  const summaryPath = path.join(outputDir, "summary.md");

  await writeFile(manifestPath, JSON.stringify(manifest, null, 2));
  await writeFile(
    summaryPath,
    [
      "# Visual smoke screenshots",
      "",
      ...manifest.map((entry) => `- \`${entry.fileName}\` - ${entry.description}`)
    ].join("\n")
  );
}

await main();
