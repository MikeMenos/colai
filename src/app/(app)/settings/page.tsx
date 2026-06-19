"use client";

import { ThemeMode, toggleTheme } from "@/features/settings/settingsSlice";
import { useAppDispatch, useAppSelector } from "@/store/hooks";

const THEME_COLOR: Record<ThemeMode, string> = {
  light: "#ffffff",
  dark: "#0b1220",
};

export default function SettingsPage() {
  const dispatch = useAppDispatch();
  const theme = useAppSelector((s) => s.settings.theme);

  const handleTheming = () => {
    dispatch(toggleTheme());
    if (typeof document === "undefined") return;

    let meta = document.querySelector(
      'meta[name="theme-color"]',
    ) as HTMLMetaElement | null;
    if (!meta) {
      meta = document.createElement("meta");
      meta.name = "theme-color";
      document.head.appendChild(meta);
    }
    meta.content = THEME_COLOR[theme];

    document.body.style.backgroundColor = THEME_COLOR[theme];
  };

  return (
    <div
      className="d-flex flex-column h-100"
      style={{
        minHeight: 0,
        overflowX: "hidden",
        overflowY: "auto",
        WebkitOverflowScrolling: "touch",
      }}
    >
      <div className="app-card mb-3 p-3">
        <div className="d-flex align-items-center justify-content-between">
          <div>
            <div className="fw-semibold">Theme</div>
            <div className="text-secondary small">Light / Dark</div>
          </div>
          <button
            type="button"
            className="btn btn-outline-primary app-pill"
            onClick={handleTheming}
          >
            <i
              className={`bi ${theme === "dark" ? "bi-sun" : "bi-moon"} me-2`}
            />
            {theme === "dark" ? "Light" : "Dark"}
          </button>
        </div>
      </div>

      <div className="app-card px-3 py-2">
        <div className="fw-semibold mb-2">About</div>
        <div className="text-secondary small">
          {process.env.NEXT_PUBLIC_APP_VERSION}
        </div>
      </div>
    </div>
  );
}
