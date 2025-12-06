/**
 * PoE API Connection Test
 *
 * API Reference: https://www.pathofexile.com/developer/docs/reference
 *
 * Two authentication methods:
 * 1. Session API (POESESSID cookie) - /character-window/* endpoints
 * 2. OAuth API (Bearer token) - /api/* endpoints (requires registered app)
 *
 * Session API Endpoints (what we use here):
 * - GET /character-window/get-characters?accountName=xxx
 * - GET /character-window/get-items?accountName=xxx&character=xxx
 * - GET /character-window/get-passive-skills?accountName=xxx&character=xxx
 * - GET /character-window/get-stash-items?league=xxx&tabIndex=0&tabs=1
 *
 * OAuth API Endpoints (for production):
 * - GET /api/profile (scope: account:profile)
 * - GET /api/stash/{league} (scope: account:stashes)
 * - GET /api/stash/{league}/{stash_id} (scope: account:stashes)
 * - GET /api/character/{name} (scope: account:characters)
 *
 * Rate Limits: Be respectful, GGG enforces strict limits
 */

// Bun automatically loads .env files
const POE_SESSION_ID = process.env.POE_SESSION_ID;
const POE_API_BASE = "https://www.pathofexile.com";

if (!POE_SESSION_ID) {
  console.error("Error: POE_SESSION_ID not found in .env file");
  process.exit(1);
}

console.log("Testing PoE API connection with POESESSID...\n");

// Types based on PoE API responses
interface Profile {
  uuid: string;
  name: string;
  locale: string | null;
  twitch?: { name: string };
}

interface League {
  id: string;
  realm: string;
  description?: string;
  rules?: { id: string; name: string }[];
}

interface Character {
  name: string;
  league: string;
  classId: number;
  ascendancyClass: number;
  class: string;
  level: number;
  experience: number;
}

interface StashTab {
  n: string;      // name
  i: number;      // index
  id: string;     // unique id
  type: string;   // tab type (NormalStash, CurrencyStash, etc.)
  colour?: { r: number; g: number; b: number };
}

interface Item {
  id: string;
  name: string;
  typeLine: string;
  baseType: string;
  ilvl: number;
  x?: number;
  y?: number;
  w: number;
  h: number;
  frameType: number;
  stackSize?: number;
  maxStackSize?: number;
}

interface StashResponse {
  numTabs: number;
  tabs?: StashTab[];
  items?: Item[];
}

async function fetchPoe<T>(endpoint: string): Promise<T> {
  const url = `${POE_API_BASE}${endpoint}`;

  const response = await fetch(url, {
    headers: {
      Cookie: `POESESSID=${POE_SESSION_ID}`,
      "User-Agent": "poe-ssf-tracker/0.1.0 (contact: personal-testing)",
    },
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`HTTP ${response.status}: ${response.statusText} - ${text.slice(0, 100)}`);
  }

  return response.json();
}

async function testProfile(): Promise<Profile | null> {
  console.log("=== Testing Profile API ===");
  console.log("Endpoint: GET /api/profile");
  try {
    const data = await fetchPoe<Profile>("/api/profile");
    console.log(`  Account: ${data.name}`);
    console.log(`  UUID: ${data.uuid}`);
    if (data.twitch) console.log(`  Twitch: ${data.twitch.name}`);
    return data;
  } catch (error) {
    console.error("  Failed:", error);
    return null;
  }
}

async function testLeagues(): Promise<League[] | null> {
  console.log("\n=== Testing Leagues API ===");
  console.log("Endpoint: GET /api/leagues?type=main&compact=1");
  try {
    const data = await fetchPoe<League[]>("/api/leagues?type=main&compact=1");
    console.log(`  Found ${data.length} leagues`);
    const ssfLeagues = data.filter(l => l.id.toLowerCase().includes("ssf"));
    console.log(`  SSF Leagues: ${ssfLeagues.map(l => l.id).join(", ")}`);
    return data;
  } catch (error) {
    console.error("  Failed:", error);
    return null;
  }
}

async function testCharacters(accountName?: string): Promise<Character[] | null> {
  console.log("\n=== Testing Characters API ===");
  const endpoint = accountName
    ? `/character-window/get-characters?accountName=${encodeURIComponent(accountName)}`
    : "/character-window/get-characters";
  console.log(`Endpoint: GET ${endpoint}`);

  try {
    const data = await fetchPoe<Character[]>(endpoint);
    console.log(`  Found ${data.length} characters:`);
    data.forEach((char) => {
      console.log(`    - ${char.name} (${char.class} Lv${char.level}) [${char.league}]`);
    });
    return data;
  } catch (error) {
    console.error("  Failed:", error);
    return null;
  }
}

async function testStashList(league: string): Promise<StashResponse | null> {
  console.log(`\n=== Testing Stash List API (${league}) ===`);
  const endpoint = `/character-window/get-stash-items?league=${encodeURIComponent(league)}&tabs=1&tabIndex=0`;
  console.log(`Endpoint: GET ${endpoint}`);

  try {
    const data = await fetchPoe<StashResponse>(endpoint);
    console.log(`  Found ${data.numTabs} stash tabs:`);
    data.tabs?.slice(0, 10).forEach((tab) => {
      console.log(`    [${tab.i}] "${tab.n}" (${tab.type}) - id: ${tab.id}`);
    });
    if (data.numTabs > 10) {
      console.log(`    ... and ${data.numTabs - 10} more tabs`);
    }
    return data;
  } catch (error) {
    console.error("  Failed:", error);
    return null;
  }
}

async function testStashContents(league: string, tabIndex: number): Promise<StashResponse | null> {
  console.log(`\n=== Testing Stash Contents (Tab ${tabIndex}) ===`);
  const endpoint = `/character-window/get-stash-items?league=${encodeURIComponent(league)}&tabIndex=${tabIndex}`;
  console.log(`Endpoint: GET ${endpoint}`);

  try {
    const data = await fetchPoe<StashResponse>(endpoint);
    console.log(`  Items in tab: ${data.items?.length || 0}`);
    data.items?.slice(0, 5).forEach((item) => {
      const name = item.name ? `${item.name} ${item.typeLine}` : item.typeLine;
      console.log(`    - ${name} (ilvl ${item.ilvl})${item.stackSize ? ` x${item.stackSize}` : ""}`);
    });
    if ((data.items?.length || 0) > 5) {
      console.log(`    ... and ${(data.items?.length || 0) - 5} more items`);
    }
    return data;
  } catch (error) {
    console.error("  Failed:", error);
    return null;
  }
}

async function testCharacterItems(accountName: string, characterName: string): Promise<unknown> {
  console.log(`\n=== Testing Character Items (${characterName}) ===`);
  const endpoint = `/character-window/get-items?accountName=${encodeURIComponent(accountName)}&character=${encodeURIComponent(characterName)}`;
  console.log(`Endpoint: GET ${endpoint}`);

  try {
    const data = await fetchPoe<{ items: Item[]; character: Character }>(endpoint);
    console.log(`  Character: ${data.character.name} (${data.character.class} Lv${data.character.level})`);
    console.log(`  Equipped items: ${data.items.length}`);
    data.items.slice(0, 5).forEach((item) => {
      const name = item.name ? `${item.name} ${item.typeLine}` : item.typeLine;
      console.log(`    - ${name}`);
    });
    return data;
  } catch (error) {
    console.error("  Failed:", error);
    return null;
  }
}

async function main() {
  console.log("=".repeat(60));
  console.log("PoE API Connection Test");
  console.log("Using: Session API (POESESSID)");
  console.log("Docs: https://www.pathofexile.com/developer/docs/reference");
  console.log("=".repeat(60));

  // Test profile
  const profile = await testProfile();
  const accountName = profile?.name || "";

  // Test leagues
  await testLeagues();

  // Test characters
  const characters = await testCharacters();

  if (characters && characters.length > 0) {
    // Find SSF character
    const ssfChar = characters.find((c) =>
      c.league.toLowerCase().includes("ssf")
    ) || characters[0];

    const league = ssfChar.league;

    // Test stash list
    const stash = await testStashList(league);

    // Test stash contents (first tab)
    if (stash && stash.numTabs > 0) {
      await testStashContents(league, 0);
    }

    // Test character items
    if (accountName) {
      await testCharacterItems(accountName, ssfChar.name);
    }
  }

  console.log("\n" + "=".repeat(60));
  console.log("Test completed successfully!");
  console.log("=".repeat(60));
}

main().catch(console.error);
