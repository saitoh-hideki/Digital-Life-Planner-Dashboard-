"use client";
import { createContext, useContext, useEffect, useMemo, useState } from "react";
import type { Prefecture } from "@/lib/region";

type RegionContextValue = {
  region: Prefecture;
  setRegion: (r: Prefecture) => void;
};

const RegionContext = createContext<RegionContextValue | null>(null);

export function useRegion() {
  const ctx = useContext(RegionContext);
  if (!ctx) throw new Error("useRegion must be used within <RegionProvider>");
  return ctx;
}

const STORAGE_KEY = "dlp.region";

export function RegionProvider({ children }: { children: React.ReactNode }) {
  const [region, setRegion] = useState<Prefecture>("全国");

  useEffect(() => {
    const saved = window.localStorage.getItem(STORAGE_KEY) as Prefecture | null;
    if (saved) setRegion(saved);
  }, []);

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, region);
  }, [region]);

  const value = useMemo(() => ({ region, setRegion }), [region]);
  return <RegionContext.Provider value={value}>{children}</RegionContext.Provider>;
}