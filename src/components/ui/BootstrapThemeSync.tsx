"use client";

import { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { setTheme, ThemeMode } from "@/features/settings/settingsSlice";

const STORAGE_KEY = "colai_theme";

const THEME_COLOR: Record<ThemeMode, string> = {
  light: "#ffffff",
  dark: "#0b1220",
};

function setThemeColor(color: string) {
  let meta = document.querySelector('meta[name="theme-color"]') as HTMLMetaElement | null;
  if (!meta) {
    meta = document.createElement("meta");
    meta.name = "theme-color";
    document.head.appendChild(meta);
  }
  meta.content = color;
  document.documentElement.style.backgroundColor = color;
}

export function BootstrapThemeSync() {
  const dispatch = useAppDispatch();
  const theme = useAppSelector((s) => s.settings.theme);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY) as ThemeMode | null;
    if (stored === "light" || stored === "dark") {
      dispatch(setTheme(stored));
      return;
    }

    const prefersDark = window.matchMedia?.("(prefers-color-scheme: dark)")?.matches;
    dispatch(setTheme(prefersDark ? "dark" : "light"));
  }, [dispatch]);

  useEffect(() => {
    document.documentElement.setAttribute("data-bs-theme", theme);
    localStorage.setItem(STORAGE_KEY, theme);
    setThemeColor(THEME_COLOR[theme] ?? "#0b1220");
  }, [theme]);

  return null;
}
