/**
 * PoE Service Layer
 * Server-side data fetching with parsing logic
 */

import { PoeApiClient, type Profile, type Character, type Item, type StashTab } from "@/lib/poe-api";

// Parsed data types
export interface DashboardData {
  profile: Profile;
  characters: Character[];
  currentCharacter: Character;
  equipment: Item[];
  flasks: Item[];
  currencyItems: Item[];
}

export interface CurrencyCount {
  name: string;
  count: number;
  icon?: string;
}

// Fetch base data needed across all pages
export async function fetchBaseData(sessionId: string) {
  const api = new PoeApiClient(sessionId);

  const [profile, characters] = await Promise.all([
    api.getProfile(),
    api.getCharacters(),
  ]);

  return { profile, characters, api };
}

// Fetch dashboard-specific data
export async function fetchDashboardData(sessionId: string): Promise<DashboardData> {
  const { profile, characters, api } = await fetchBaseData(sessionId);

  // Find SSF character or first character
  const currentCharacter =
    characters.find((c) => c.league.toLowerCase().includes("ssf")) ||
    characters[0];

  if (!currentCharacter) {
    throw new Error("No characters found");
  }

  // Fetch character items
  const { items } = await api.getCharacterItems(profile.name, currentCharacter.name);

  // Parse equipment and flasks
  const equipment = items.filter((i) => i.inventoryId && !i.inventoryId.startsWith("Flask"));
  const flasks = items.filter((i) => i.inventoryId?.startsWith("Flask"));

  // Fetch currency from stash
  const currencyItems = await fetchCurrencyItems(api, currentCharacter.league);

  return {
    profile,
    characters,
    currentCharacter,
    equipment,
    flasks,
    currencyItems,
  };
}

// Fetch character items for a specific character
export async function fetchCharacterData(
  sessionId: string,
  characterName: string
) {
  const { profile, characters, api } = await fetchBaseData(sessionId);

  const character = characters.find((c) => c.name === characterName);
  if (!character) {
    throw new Error(`Character not found: ${characterName}`);
  }

  const { items } = await api.getCharacterItems(profile.name, character.name);

  const equipment = items.filter((i) => i.inventoryId && !i.inventoryId.startsWith("Flask"));
  const flasks = items.filter((i) => i.inventoryId?.startsWith("Flask"));

  return {
    profile,
    characters,
    character,
    equipment,
    flasks,
  };
}

// Fetch stash data
export async function fetchStashData(sessionId: string, league: string) {
  const api = new PoeApiClient(sessionId);

  const stashInfo = await api.getStashTabs(league);

  return {
    tabs: stashInfo.tabs || [],
    numTabs: stashInfo.numTabs,
  };
}

// Fetch stash tab contents
export async function fetchStashTabContents(
  sessionId: string,
  league: string,
  tabIndex: number
) {
  const api = new PoeApiClient(sessionId);
  const stash = await api.getStashContents(league, tabIndex);

  return stash.items || [];
}

// Helper: fetch currency items from currency stash tab
async function fetchCurrencyItems(api: PoeApiClient, league: string): Promise<Item[]> {
  try {
    const stash = await api.getStashTabs(league);
    const currencyTabIndex = stash.tabs?.find((t) => t.type === "CurrencyStash")?.i;

    if (currencyTabIndex === undefined) {
      return [];
    }

    const currencyTab = await api.getStashContents(league, currencyTabIndex);
    return currencyTab.items || [];
  } catch {
    return [];
  }
}

// Helper: parse currency items into counts
export function parseCurrencyCounts(items: Item[]): CurrencyCount[] {
  const currencies = [
    "Divine Orb",
    "Chaos Orb",
    "Exalted Orb",
    "Vaal Orb",
    "Orb of Alchemy",
    "Orb of Fusing",
    "Jeweller's Orb",
  ];

  return currencies.map((name) => {
    const item = items.find((i) => i.typeLine === name);
    return {
      name,
      count: item?.stackSize || 0,
      icon: item?.icon,
    };
  });
}

// Helper: get flask for specific slot (0-4)
export function getFlaskForSlot(flasks: Item[], slotIndex: number): Item | undefined {
  return flasks.find((f) => f.x === slotIndex);
}

// Helper: get equipment item for slot
export function getEquipmentForSlot(equipment: Item[], slotId: string): Item | undefined {
  return equipment.find((i) => i.inventoryId === slotId);
}
