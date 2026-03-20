import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

const repoName = "closet-v3";

export default defineConfig({
  base: process.env.NODE_ENV === "production" ? `/${repoName}/` : "/",
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["icon.svg"],
      manifest: {
        name: "The Atelier",
        short_name: "Atelier",
        description: "A local-first digital wardrobe and lookbook studio.",
        theme_color: "#f9f9f7",
        background_color: "#f9f9f7",
        display: "standalone",
        start_url: `/${repoName}/`,
        icons: [
          {
            src: "icon.svg",
            sizes: "any",
            type: "image/svg+xml",
            purpose: "any"
          }
        ]
      },
      workbox: {
        navigateFallback: "index.html",
        globPatterns: ["**/*.{js,css,html,svg,png,woff2}"],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/api\.open-meteo\.com\/.*/i,
            handler: "StaleWhileRevalidate",
            options: {
              cacheName: "weather-cache",
              expiration: {
                maxEntries: 16,
                maxAgeSeconds: 60 * 60
              }
            }
          }
        ]
      }
    })
  ]
});
