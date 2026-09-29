"use client";

import { ClerkProvider } from "@clerk/nextjs";
import { clerkAppearance } from "@/lib/clerk-theme";
import { useCurrentTheme } from "@/lib/use-theme";

export function ClerkThemeProvider({ children }: { children: React.ReactNode }) {
  const theme = useCurrentTheme();

  return <ClerkProvider appearance={clerkAppearance(theme)}>{children}</ClerkProvider>;
}
