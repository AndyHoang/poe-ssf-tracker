/**
 * PoE API Client
 * Uses POESESSID cookie for authentication (testing)
 * API Reference: https://www.pathofexile.com/developer/docs/reference
 */

const POE_API_BASE = "https://www.pathofexile.com";

// Types
export interface Profile {
  uuid: string;
  name: string;
  locale: string | null;
  twitch?: { name: string };
}

export interface Character {
  name: string;
  league: string;
  classId: number;
  ascendancyClass: number;
  class: string;
  level: number;
  experience: number;
}

export interface StashTab {
  n: string; // name
  i: number; // index
  id: string; // unique id
  type: string; // NormalStash, CurrencyStash, etc.
  colour?: { r: number; g: number; b: number };
}

export interface Item {
  id: string;
  name: string;
  typeLine: string;
  baseType: string;
  ilvl: number;
  frameType: number; // 0=normal, 1=magic, 2=rare, 3=unique, 4=gem, 5=currency
  inventoryId?: string;
  x?: number;
  y?: number;
  w: number;
  h: number;
  icon: string;
  stackSize?: number;
  maxStackSize?: number;
  sockets?: { group: number; attr: string }[];
  explicitMods?: string[];
  implicitMods?: string[];
  craftedMods?: string[];
  enchantMods?: string[];
  utilityMods?: string[];
  flavourText?: string[];
  identified?: boolean;
  corrupted?: boolean;
}

export interface CharacterWithItems {
  character: Character;
  items: Item[];
}

export interface StashResponse {
  numTabs: number;
  tabs?: StashTab[];
  items?: Item[];
}

// API Client
export class PoeApiClient {
  private sessionId: string;

  constructor(sessionId: string) {
    this.sessionId = sessionId;
  }

  private async fetch<T>(endpoint: string): Promise<T> {
    const res = await fetch(`${POE_API_BASE}${endpoint}`, {
      headers: {
        Cookie: `POESESSID=${this.sessionId}`,
        "User-Agent": "poe-ssf-tracker/0.1.0",
      },
      cache: "no-store",
    });

    if (!res.ok) {
      throw new Error(`PoE API error: ${res.status} ${res.statusText}`);
    }

    return res.json();
  }

  async getProfile(): Promise<Profile> {
    return this.fetch<Profile>("/api/profile");
  }

  async getCharacters(): Promise<Character[]> {
    return this.fetch<Character[]>("/character-window/get-characters");
  }

  async getCharacterItems(
    accountName: string,
    characterName: string
  ): Promise<CharacterWithItems> {
    return this.fetch<CharacterWithItems>(
      `/character-window/get-items?accountName=${encodeURIComponent(accountName)}&character=${encodeURIComponent(characterName)}`
    );
  }

  async getStashTabs(league: string): Promise<StashResponse> {
    return this.fetch<StashResponse>(
      `/character-window/get-stash-items?league=${encodeURIComponent(league)}&tabs=1&tabIndex=0`
    );
  }

  async getStashContents(league: string, tabIndex: number): Promise<StashResponse> {
    return this.fetch<StashResponse>(
      `/character-window/get-stash-items?league=${encodeURIComponent(league)}&tabIndex=${tabIndex}`
    );
  }
}

// Helper to get rarity class name
export function getRarityColor(frameType: number): string {
  switch (frameType) {
    case 0:
      return "text-poe-normal";
    case 1:
      return "text-poe-magic";
    case 2:
      return "text-poe-rare";
    case 3:
      return "text-poe-unique";
    case 4:
      return "text-poe-gem";
    case 5:
      return "text-poe-currency";
    default:
      return "text-poe-normal";
  }
}

// Helper to get equipment slot from inventoryId
export function getSlotName(inventoryId: string): string {
  const slots: Record<string, string> = {
    Helm: "Helmet",
    BodyArmour: "Body Armour",
    Gloves: "Gloves",
    Boots: "Boots",
    Weapon: "Main Hand",
    Weapon2: "Swap Weapon",
    Offhand: "Off Hand",
    Offhand2: "Swap Off Hand",
    Ring: "Left Ring",
    Ring2: "Right Ring",
    Amulet: "Amulet",
    Belt: "Belt",
    Flask: "Flask",
  };
  return slots[inventoryId] || inventoryId;
}
