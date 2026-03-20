import type { ReactNode, TouchEvent } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { useI18n } from "../lib/i18n/i18n";
import { usePreferencesStore } from "../lib/state/preferences-store";
import { useRef } from "react";

const navItems = [
  { to: "/", key: "nav.home" as const, icon: "⌂" },
  { to: "/wardrobe", key: "nav.wardrobe" as const, icon: "▦" },
  { to: "/register", key: "nav.register" as const, icon: "+" },
  { to: "/lookbook", key: "nav.lookbook" as const, icon: "✦" },
  { to: "/settings", key: "nav.settings" as const, icon: "⚙" }
];

export function AppShell({ children }: { children: ReactNode }) {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { t } = useI18n();
  const theme = usePreferencesStore((state) => state.theme);
  const setTheme = usePreferencesStore((state) => state.setTheme);
  const language = usePreferencesStore((state) => state.language);
  const setLanguage = usePreferencesStore((state) => state.setLanguage);
  const swipeState = useRef<{ startX: number; startY: number; deltaX: number; deltaY: number; lockedAxis: "x" | "y" | null } | null>(
    null
  );

  const activeLabel =
    navItems.find((item) => (item.to === "/" ? pathname === "/" : pathname.startsWith(item.to)))?.key ?? "nav.home";
  const activeIndex = navItems.findIndex((item) => (item.to === "/" ? pathname === "/" : pathname.startsWith(item.to)));

  function shouldIgnoreSwipeTarget(target: EventTarget | null) {
    if (!(target instanceof HTMLElement)) {
      return false;
    }

    return Boolean(target.closest("input, textarea, select, button, a, canvas, [contenteditable='true'], [data-swipe-ignore='true']"));
  }

  function handleTouchStart(event: TouchEvent<HTMLElement>) {
    if (window.innerWidth > 920 || shouldIgnoreSwipeTarget(event.target)) {
      swipeState.current = null;
      return;
    }

    const touch = event.touches[0];
    swipeState.current = {
      startX: touch.clientX,
      startY: touch.clientY,
      deltaX: 0,
      deltaY: 0,
      lockedAxis: null
    };
  }

  function handleTouchMove(event: TouchEvent<HTMLElement>) {
    const touch = event.touches[0];
    if (!swipeState.current || !touch) {
      return;
    }

    swipeState.current.deltaX = touch.clientX - swipeState.current.startX;
    swipeState.current.deltaY = touch.clientY - swipeState.current.startY;

    if (!swipeState.current.lockedAxis) {
      if (Math.abs(swipeState.current.deltaX) > 12 || Math.abs(swipeState.current.deltaY) > 12) {
        swipeState.current.lockedAxis =
          Math.abs(swipeState.current.deltaX) > Math.abs(swipeState.current.deltaY) ? "x" : "y";
      }
    }

    if (swipeState.current.lockedAxis === "x") {
      event.preventDefault();
    }
  }

  function handleTouchEnd() {
    if (!swipeState.current || window.innerWidth > 920 || activeIndex < 0) {
      swipeState.current = null;
      return;
    }

    const { deltaX, deltaY, lockedAxis } = swipeState.current;
    swipeState.current = null;

    if (lockedAxis !== "x" || Math.abs(deltaX) < 72 || Math.abs(deltaX) < Math.abs(deltaY) * 1.2) {
      return;
    }

    const nextIndex = deltaX < 0 ? activeIndex + 1 : activeIndex - 1;
    const nextItem = navItems[nextIndex];
    if (!nextItem) {
      return;
    }

    navigate(nextItem.to);
  }

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand-block">
          <div className="brand-mark">The Atelier</div>
        </div>
        <nav className="nav-list">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) => `nav-item ${isActive ? "is-active" : ""}`}
            >
              <span className="nav-icon">{item.icon}</span>
              <span>{t(item.key)}</span>
            </NavLink>
          ))}
        </nav>
      </aside>

      <div className="app-main">
        <header className="topbar">
          <div>
            <div className="eyebrow">{t("app.title")}</div>
            <h1 className="page-title">{t(activeLabel)}</h1>
          </div>
          <div className="topbar-controls">
            <select
              aria-label={t("settings.language")}
              className="control-select shell-language-select"
              value={language}
              onChange={(event) => setLanguage(event.target.value as typeof language)}
            >
              <option value="en">EN</option>
              <option value="ko">KO</option>
              <option value="ja">JA</option>
              <option value="fr">FR</option>
              <option value="es">ES</option>
              <option value="de">DE</option>
              <option value="zh-CN">ZH</option>
            </select>
            <button
              aria-label={t("settings.theme")}
              className="theme-toggle shell-theme-toggle"
              onClick={() => setTheme(theme === "light" ? "dark" : "light")}
            >
              <span aria-hidden="true">{theme === "light" ? "◐" : "◑"}</span>
            </button>
          </div>
        </header>

        <main className="content-area">{children}</main>
      </div>

      <nav className="mobile-nav" onTouchStart={handleTouchStart} onTouchMove={handleTouchMove} onTouchEnd={handleTouchEnd}>
        {navItems.map((item) => {
          const isActive = item.to === "/" ? pathname === "/" : pathname.startsWith(item.to);
          return (
            <NavLink key={item.to} to={item.to} className={`mobile-nav-item ${isActive ? "is-active" : ""}`}>
              <span className="nav-icon">{item.icon}</span>
              <span>{t(item.key)}</span>
            </NavLink>
          );
        })}
      </nav>
    </div>
  );
}
