"use client";
import { useRegion } from "@/components/providers/RegionProvider";
import { PREFECTURES, type Prefecture } from "@/lib/region";
import { MapPin } from "lucide-react";

export function RegionSelect() {
  const { region, setRegion } = useRegion();
  
  return (
    <label className="flex items-center gap-2">
      <MapPin className="h-4 w-4 text-blue-600" aria-hidden />
      <span className="text-sm text-gray-600">表示地域</span>
      <select
        value={region}
        onChange={(e) => setRegion(e.target.value as Prefecture)}
        className="h-9 rounded-md border border-gray-300 bg-white px-3 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        {PREFECTURES.map((p) => (
          <option key={p} value={p}>{p}</option>
        ))}
      </select>
    </label>
  );
}