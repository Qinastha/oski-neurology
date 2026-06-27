"use client";

import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";

export type ThemeMode = "light" | "dark";

const THEME_STORAGE_KEY = "osceThemeV1";

function readDocumentTheme(): ThemeMode {
  if (typeof document === "undefined") {
    return "light";
  }

  return document.documentElement.dataset.theme === "dark" ? "dark" : "light";
}

function applyTheme(theme: ThemeMode) {
  document.documentElement.dataset.theme = theme;
  window.localStorage.setItem(THEME_STORAGE_KEY, theme);
}

export function ThemeToggle() {
  const [theme, setTheme] = useState<ThemeMode>("light");

  useEffect(() => {
    setTheme(readDocumentTheme());
  }, []);

  function toggleTheme() {
    const nextTheme: ThemeMode = readDocumentTheme() === "dark" ? "light" : "dark";
    applyTheme(nextTheme);
    setTheme(nextTheme);
  }

  const isDark = theme === "dark";
  const label = isDark ? "Увімкнути світлу тему" : "Увімкнути темну тему";
  const Icon = isDark ? Sun : Moon;

  return (
    <button
      aria-label={label}
      aria-pressed={isDark}
      className="fixed bottom-5 right-5 z-50 inline-flex h-11 w-11 items-center justify-center rounded-lg border border-clinical-line bg-clinical-surface/95 text-clinical-text shadow-[0_14px_38px_rgba(38,32,16,0.18)] backdrop-blur-xl transition hover:border-clinical-line-strong hover:text-clinical-accent-strong max-md:bottom-24"
      data-theme-toggle={theme}
      type="button"
      onClick={toggleTheme}
    >
      <Icon aria-hidden="true" size={19} />
    </button>
  );
}
