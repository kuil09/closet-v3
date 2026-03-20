import { Suspense, lazy, useEffect, useState } from "react";
import { BrowserRouter, Navigate, Route, Routes, useNavigate } from "react-router-dom";
import { ensureSeedData } from "../lib/db/app-db";
import { I18nProvider } from "../lib/i18n/i18n";
import { messages } from "../lib/i18n/messages";
import { usePreferencesStore } from "../lib/state/preferences-store";
import { HomePage } from "../features/home/HomePage";
import { WardrobePage } from "../features/wardrobe/WardrobePage";
import { AppShell } from "./AppShell";

const RegisterPage = lazy(() => import("../features/register/RegisterPage").then((module) => ({ default: module.RegisterPage })));
const LookbookPage = lazy(() => import("../features/lookbook/LookbookPage").then((module) => ({ default: module.LookbookPage })));
const SettingsPage = lazy(() => import("../features/settings/SettingsPage").then((module) => ({ default: module.SettingsPage })));

function RedirectBootstrap() {
  const navigate = useNavigate();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const redirect = params.get("redirect");
    if (!redirect) {
      return;
    }

    const base = (import.meta.env.BASE_URL ?? "/").replace(/\/$/, "");
    const normalized = redirect.startsWith(base) ? redirect.slice(base.length) || "/" : redirect;
    navigate(normalized, { replace: true });
    params.delete("redirect");
    const query = params.toString();
    window.history.replaceState({}, "", `${window.location.pathname}${query ? `?${query}` : ""}`);
  }, [navigate]);

  return null;
}

export function App() {
  const language = usePreferencesStore((state) => state.language) ?? "en";
  const theme = usePreferencesStore((state) => state.theme) ?? "light";
  const [ready, setReady] = useState(false);

  useEffect(() => {
    void ensureSeedData().finally(() => setReady(true));
  }, []);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    document.documentElement.lang = language;
  }, [language, theme]);

  if (!ready) {
    return (
      <div className="boot-screen">
        <div className="boot-mark">The Atelier</div>
        <p>{messages[language]?.["app.boot"] ?? messages.en["app.boot"]}</p>
      </div>
    );
  }

  return (
    <I18nProvider locale={language}>
      <BrowserRouter
        basename={import.meta.env.BASE_URL}
        future={{ v7_startTransition: true, v7_relativeSplatPath: true }}
      >
        <RedirectBootstrap />
        <Suspense
          fallback={
            <div className="boot-screen">
              <div className="boot-mark">The Atelier</div>
              <p>{messages[language]?.["app.loadingView"] ?? messages.en["app.loadingView"]}</p>
            </div>
          }
        >
          <Routes>
            <Route
              path="/"
              element={
                <AppShell>
                  <HomePage />
                </AppShell>
              }
            />
            <Route
              path="/wardrobe"
              element={
                <AppShell>
                  <WardrobePage />
                </AppShell>
              }
            />
            <Route
              path="/register"
              element={
                <AppShell>
                  <RegisterPage />
                </AppShell>
              }
            />
            <Route
              path="/lookbook"
              element={
                <AppShell>
                  <LookbookPage />
                </AppShell>
              }
            />
            <Route
              path="/settings"
              element={
                <AppShell>
                  <SettingsPage />
                </AppShell>
              }
            />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
      </BrowserRouter>
    </I18nProvider>
  );
}
