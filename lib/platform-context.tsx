"use client";

import { createContext, useContext, useEffect, useState } from "react";

export type GlobalPlatform = "all" | "Instagram" | "TikTok" | "YouTube" | "X";

const PlatformContext = createContext<{
  platform: GlobalPlatform;
  setPlatform: (p: GlobalPlatform) => void;
}>({ platform: "all", setPlatform: () => {} });

export function PlatformProvider({ children }: { children: React.ReactNode }) {
  const [platform, setPlatformState] = useState<GlobalPlatform>("all");

  useEffect(() => {
    const stored = localStorage.getItem("sc-reach-platform") as GlobalPlatform | null;
    if (stored) setPlatformState(stored);
  }, []);

  function setPlatform(p: GlobalPlatform) {
    setPlatformState(p);
    localStorage.setItem("sc-reach-platform", p);
  }

  return <PlatformContext.Provider value={{ platform, setPlatform }}>{children}</PlatformContext.Provider>;
}

export function useGlobalPlatform() {
  return useContext(PlatformContext);
}
