/**
 * React Query hooks for PoE data
 * Provides client-side data fetching with caching
 */

"use client";

import { useQuery } from "@tanstack/react-query";
import type { DashboardData } from "@/services/poe";
import type { Character, Item, StashTab } from "@/lib/poe-api";

// Query keys for cache management
export const poeQueryKeys = {
  dashboard: ["poe", "dashboard"] as const,
  character: (name: string) => ["poe", "character", name] as const,
  stash: (league: string) => ["poe", "stash", league] as const,
  stashTab: (league: string, tabIndex: number) =>
    ["poe", "stash", league, tabIndex] as const,
};

// Fetch helpers
async function fetchApi<T>(url: string): Promise<T> {
  const res = await fetch(url);
  if (!res.ok) {
    const error = await res.json().catch(() => ({ error: "Unknown error" }));
    throw new Error(error.error || `HTTP ${res.status}`);
  }
  return res.json();
}

// Dashboard data hook
export function useDashboardData() {
  return useQuery<DashboardData>({
    queryKey: poeQueryKeys.dashboard,
    queryFn: () => fetchApi("/api/poe?action=dashboard"),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes (formerly cacheTime)
  });
}

// Character data hook
interface CharacterData {
  profile: { name: string };
  characters: Character[];
  character: Character;
  equipment: Item[];
  flasks: Item[];
}

export function useCharacterData(characterName: string | null) {
  return useQuery<CharacterData>({
    queryKey: poeQueryKeys.character(characterName || ""),
    queryFn: () =>
      fetchApi(`/api/poe?action=character&name=${encodeURIComponent(characterName!)}`),
    enabled: !!characterName,
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
  });
}

// Stash tabs hook
interface StashData {
  tabs: StashTab[];
  numTabs: number;
}

export function useStashTabs(league: string | null) {
  return useQuery<StashData>({
    queryKey: poeQueryKeys.stash(league || ""),
    queryFn: () =>
      fetchApi(`/api/poe?action=stash&league=${encodeURIComponent(league!)}`),
    enabled: !!league,
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
  });
}

// Stash tab contents hook
export function useStashTabContents(league: string | null, tabIndex: number | null) {
  return useQuery<Item[]>({
    queryKey: poeQueryKeys.stashTab(league || "", tabIndex ?? -1),
    queryFn: () =>
      fetchApi(
        `/api/poe?action=stash-tab&league=${encodeURIComponent(league!)}&tabIndex=${tabIndex}`
      ),
    enabled: !!league && tabIndex !== null,
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
  });
}
