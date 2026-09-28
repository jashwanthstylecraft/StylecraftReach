// Runs before paint (inlined in <head> in app/layout.tsx) so the theme class
// is correct on first render — no flash of the wrong theme, and no React
// hydration mismatch since the class is already set by the time React runs.
export const themeInitScript = `
(function () {
  try {
    var stored = localStorage.getItem("theme");
    var theme = stored === "light" || stored === "dark"
      ? stored
      : (window.matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark");
    document.documentElement.classList.remove("light", "dark");
    document.documentElement.classList.add(theme);
  } catch (e) {}
})();
`;
