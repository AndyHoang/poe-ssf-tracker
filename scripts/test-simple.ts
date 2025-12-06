/**
 * Simple PoE API Test - Quick Overview
 * Shows: newest character, weapon, currency totals
 */

const POE_SESSION_ID = process.env.POE_SESSION_ID;
const POE_API_BASE = "https://www.pathofexile.com";

if (!POE_SESSION_ID) {
  console.error("Error: POE_SESSION_ID not found in .env");
  process.exit(1);
}

interface Character {
  name: string;
  league: string;
  class: string;
  level: number;
  experience: number;
}

interface Item {
  name: string;
  typeLine: string;
  baseType: string;
  ilvl: number;
  frameType: number;
  inventoryId?: string;
  socketedItems?: Item[];
  explicitMods?: string[];
  implicitMods?: string[];
  stackSize?: number;
}

interface StashTab {
  n: string;
  i: number;
  type: string;
}

async function fetchPoe<T>(endpoint: string): Promise<T> {
  const res = await fetch(`${POE_API_BASE}${endpoint}`, {
    headers: {
      Cookie: `POESESSID=${POE_SESSION_ID}`,
      "User-Agent": "poe-ssf-tracker/0.1.0",
    },
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

async function getNewestCharacter(): Promise<{ char: Character; league: string } | null> {
  console.log("\n📊 Newest Character");
  console.log("─".repeat(40));

  try {
    const chars = await fetchPoe<Character[]>("/character-window/get-characters");
    if (!chars.length) {
      console.log("  No characters found");
      return null;
    }

    // Sort by experience (highest = most played recently typically)
    const sorted = [...chars].sort((a, b) => b.experience - a.experience);
    const newest = sorted[0];

    console.log(`  ${newest.name}`);
    console.log(`  ${newest.class} Level ${newest.level}`);
    console.log(`  League: ${newest.league}`);

    return { char: newest, league: newest.league };
  } catch (e) {
    console.log(`  Error: ${e}`);
    return null;
  }
}

async function getWeaponDetails(accountName: string, charName: string): Promise<void> {
  console.log("\n⚔️  Main Weapon");
  console.log("─".repeat(40));

  try {
    const data = await fetchPoe<{ items: Item[] }>(
      `/character-window/get-items?accountName=${encodeURIComponent(accountName)}&character=${encodeURIComponent(charName)}`
    );

    // Find main hand weapon
    const weapon = data.items.find(
      (i) => i.inventoryId === "Weapon" || i.inventoryId === "Weapon2"
    );

    if (!weapon) {
      console.log("  No weapon equipped");
      return;
    }

    const name = weapon.name ? `${weapon.name} ${weapon.typeLine}` : weapon.typeLine;
    const rarity = ["Normal", "Magic", "Rare", "Unique"][weapon.frameType] || "Unknown";

    console.log(`  ${name}`);
    console.log(`  ${rarity} | ilvl ${weapon.ilvl}`);

    if (weapon.implicitMods?.length) {
      console.log(`  Implicit: ${weapon.implicitMods[0]}`);
    }
    if (weapon.explicitMods?.length) {
      console.log("  Mods:");
      weapon.explicitMods.slice(0, 4).forEach((mod) => {
        console.log(`    • ${mod}`);
      });
      if (weapon.explicitMods.length > 4) {
        console.log(`    ... +${weapon.explicitMods.length - 4} more`);
      }
    }
  } catch (e) {
    console.log(`  Error: ${e}`);
  }
}

async function getCurrencyTotals(league: string): Promise<void> {
  console.log("\n💰 Currency (Stash)");
  console.log("─".repeat(40));

  try {
    // First get stash tabs to find currency tab
    const stashInfo = await fetchPoe<{ numTabs: number; tabs: StashTab[] }>(
      `/character-window/get-stash-items?league=${encodeURIComponent(league)}&tabs=1&tabIndex=0`
    );

    const currencyTabIndex = stashInfo.tabs?.find((t) => t.type === "CurrencyStash")?.i;

    // Key currencies to track
    const currencyTotals: Record<string, number> = {
      "Divine Orb": 0,
      "Chaos Orb": 0,
      "Exalted Orb": 0,
      "Vaal Orb": 0,
      "Orb of Alchemy": 0,
      "Orb of Scouring": 0,
      "Orb of Fusing": 0,
      "Jeweller's Orb": 0,
    };

    // Check currency tab if exists
    if (currencyTabIndex !== undefined) {
      const currencyTab = await fetchPoe<{ items: Item[] }>(
        `/character-window/get-stash-items?league=${encodeURIComponent(league)}&tabIndex=${currencyTabIndex}`
      );

      currencyTab.items?.forEach((item) => {
        const baseType = item.typeLine || item.baseType;
        if (baseType in currencyTotals) {
          currencyTotals[baseType] += item.stackSize || 1;
        }
      });
    }

    // Also check other tabs for currency
    for (let i = 0; i < Math.min(stashInfo.numTabs, 5); i++) {
      if (i === currencyTabIndex) continue;

      try {
        const tab = await fetchPoe<{ items: Item[] }>(
          `/character-window/get-stash-items?league=${encodeURIComponent(league)}&tabIndex=${i}`
        );

        tab.items?.forEach((item) => {
          const baseType = item.typeLine || item.baseType;
          if (baseType in currencyTotals) {
            currencyTotals[baseType] += item.stackSize || 1;
          }
        });
      } catch {
        // Skip tabs that fail
      }
    }

    // Display results
    const divine = currencyTotals["Divine Orb"];
    const chaos = currencyTotals["Chaos Orb"];
    const exalt = currencyTotals["Exalted Orb"];

    console.log(`  Divine Orbs:  ${divine}`);
    console.log(`  Chaos Orbs:   ${chaos}`);
    console.log(`  Exalted Orbs: ${exalt}`);
    console.log("  ─");
    console.log(`  Vaal: ${currencyTotals["Vaal Orb"]} | Alch: ${currencyTotals["Orb of Alchemy"]} | Scour: ${currencyTotals["Orb of Scouring"]}`);
    console.log(`  Fusing: ${currencyTotals["Orb of Fusing"]} | Jeweller: ${currencyTotals["Jeweller's Orb"]}`);
  } catch (e) {
    console.log(`  Error: ${e}`);
  }
}

async function main() {
  console.log("═".repeat(40));
  console.log("  PoE SSF Tracker - Quick Overview");
  console.log("═".repeat(40));

  // Get profile for account name
  const profile = await fetchPoe<{ name: string }>("/api/profile");
  const accountName = profile.name;

  // Get newest character
  const result = await getNewestCharacter();
  if (!result) return;

  // Get weapon details
  await getWeaponDetails(accountName, result.char.name);

  // Get currency totals
  await getCurrencyTotals(result.league);

  console.log("\n" + "═".repeat(40));
}

main().catch(console.error);
