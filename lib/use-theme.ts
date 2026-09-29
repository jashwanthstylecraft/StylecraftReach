"use client";

import { useEffect, useState } from "react";

export type Theme = "light" | "dark";
const THEME_EVENT = "sc-reach-theme-change";

function readTheme(): Theme {
  if (typeof document === "undefined") return "dark";
  return document.documentElement.classList.contains("light") ? "light" : "dark";
}

// Shared with ThemeToggle so any component (like the Clerk appearance wrapper)
// can react to the light/dark toggle without polling or a MutationObserver.
export function useCurrentTheme(): Theme {
  const [theme, setTheme] = useState<Theme>(readTheme);

  useEffect(() => {
    setTheme(readTheme());
    function handle(e: Event) {
      setTheme((e as CustomEvent<Theme>).detail);
    }
    window.addEventListener(THEME_EVENT, handle);
    return () => window.removeEventListener(THEME_EVENT, handle);
  }, []);

  return theme;
}

export function applyTheme(next: Theme) {
  document.documentElement.classList.remove("light", "dark");
  document.documentElement.classList.add(next);
  localStorage.setItem("theme", next);
  window.dispatchEvent(new CustomEvent(THEME_EVENT, { detail: next }));
}
