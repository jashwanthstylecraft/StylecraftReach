import { dark } from "@clerk/themes";
import type { Appearance } from "@clerk/types";
import type { Theme } from "@/lib/use-theme";

const GOLD = "#C8A96E";

// Clerk's own light/dark theme presets already handle contrast correctly for
// social buttons (e.g. "Continue with Google"), input fields, etc. — we only
// override the accent color, rather than hand-rolling a partial `variables`
// override that left `colorNeutral` and friends unset (the previous bug: a
// hardcoded dark background with no matching neutral/button colors, so the
// Google button had no usable contrast against it).
export function clerkAppearance(theme: Theme): Appearance {
  if (theme === "dark") {
    return {
      baseTheme: dark,
      variables: { colorPrimary: GOLD },
    };
  }
  return {
    variables: { colorPrimary: GOLD },
  };
}
