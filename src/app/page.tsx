import { PoeApiClient, getRarityColor, getSlotName } from "@/lib/poe-api";
import type { Item, Character } from "@/lib/poe-api";
import { ItemTooltip } from "@/components/ItemTooltip";
import { RefreshButton } from "@/components/RefreshButton";

// Server component - fetches data on server
export default async function Dashboard() {
  const sessionId = process.env.POE_SESSION_ID;

  if (!sessionId) {
    return (
      <div className="text-center py-12">
        <h1 className="text-2xl font-bold text-red-500">Missing Configuration</h1>
        <p className="text-muted-foreground mt-2">
          POE_SESSION_ID not found in environment variables.
        </p>
      </div>
    );
  }

  const api = new PoeApiClient(sessionId);

  try {
    const [profile, characters] = await Promise.all([
      api.getProfile(),
      api.getCharacters(),
    ]);

    // Find most recent SSF character or first character
    const ssfChar =
      characters.find((c) => c.league.toLowerCase().includes("ssf")) ||
      characters[0];

    if (!ssfChar) {
      return (
        <div className="text-center py-12">
          <h1 className="text-2xl font-bold">No Characters Found</h1>
        </div>
      );
    }

    // Get character items
    const { items } = await api.getCharacterItems(profile.name, ssfChar.name);

    // Get stash for currency
    const stash = await api.getStashTabs(ssfChar.league);
    const currencyTabIndex = stash.tabs?.find((t) => t.type === "CurrencyStash")?.i;

    let currencyItems: Item[] = [];
    if (currencyTabIndex !== undefined) {
      const currencyTab = await api.getStashContents(ssfChar.league, currencyTabIndex);
      currencyItems = currencyTab.items || [];
    }

    const poeNinjaUrl = `https://poe.ninja/poe1/profile/${encodeURIComponent(profile.name)}/character/${encodeURIComponent(ssfChar.name)}`;

    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-2xl font-bold">{ssfChar.name}</h1>
            <p className="text-sm text-gray-400">
              {ssfChar.class} · Level {ssfChar.level} · {ssfChar.league}
            </p>
            <a
              href={poeNinjaUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-blue-400 hover:text-blue-300 hover:underline"
            >
              View on poe.ninja
            </a>
          </div>
          <div className="flex items-center gap-4">
            <RefreshButton autoRefreshInterval={60} />
            <CharacterSelector characters={characters} current={ssfChar.name} />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Paperdoll */}
          <div className="lg:col-span-2">
            <CharacterPaperdoll items={items} />
          </div>

          {/* Currency Summary */}
          <div>
            <CurrencySummary items={currencyItems} />
          </div>
        </div>
      </div>
    );
  } catch (error) {
    return (
      <div className="text-center py-12">
        <h1 className="text-2xl font-bold text-red-500">Error Loading Data</h1>
        <p className="text-gray-400 mt-2">
          {error instanceof Error ? error.message : "Unknown error"}
        </p>
      </div>
    );
  }
}

// Character Selector Component
function CharacterSelector({
  characters,
  current,
}: {
  characters: Character[];
  current: string;
}) {
  return (
    <select
      className="bg-muted border border-border rounded px-3 py-2 text-sm"
      defaultValue={current}
    >
      {characters.map((char) => (
        <option key={char.name} value={char.name}>
          {char.name} ({char.class} {char.level})
        </option>
      ))}
    </select>
  );
}

// Character Paperdoll Component
function CharacterPaperdoll({ items }: { items: Item[] }) {
  // Group items by slot
  const equipped = items.filter((i) => i.inventoryId && !i.inventoryId.startsWith("Flask"));
  const flasks = items.filter((i) => i.inventoryId?.startsWith("Flask"));

  // Define slot positions for grid
  const slots = [
    { id: "Weapon", label: "Weapon", row: 2, col: 1 },
    { id: "Helm", label: "Helmet", row: 1, col: 2 },
    { id: "Offhand", label: "Off Hand", row: 2, col: 3 },
    { id: "BodyArmour", label: "Body", row: 2, col: 2 },
    { id: "Gloves", label: "Gloves", row: 3, col: 1 },
    { id: "Belt", label: "Belt", row: 3, col: 2 },
    { id: "Boots", label: "Boots", row: 3, col: 3 },
    { id: "Amulet", label: "Amulet", row: 1, col: 3 },
    { id: "Ring", label: "Ring L", row: 4, col: 1 },
    { id: "Ring2", label: "Ring R", row: 4, col: 3 },
  ];

  const getItemForSlot = (slotId: string) =>
    equipped.find((i) => i.inventoryId === slotId);

  return (
    <div className="bg-muted/50 border border-border rounded-lg p-6">
      <h2 className="text-lg font-semibold mb-4">Equipment</h2>

      {/* Equipment Grid */}
      <div
        className="grid gap-2 mx-auto"
        style={{
          gridTemplateColumns: "repeat(3, 80px)",
          gridTemplateRows: "repeat(4, 80px)",
          width: "fit-content",
        }}
      >
        {slots.map((slot) => {
          const item = getItemForSlot(slot.id);
          return (
            <div
              key={slot.id}
              className="bg-background border border-border rounded flex items-center justify-center relative group"
              style={{
                gridRow: slot.row,
                gridColumn: slot.col,
              }}
            >
              {item ? (
                <ItemSlot item={item} />
              ) : (
                <span className="text-xs text-gray-600">{slot.label}</span>
              )}
            </div>
          );
        })}
      </div>

      {/* Flasks */}
      <div className="mt-4">
        <h3 className="text-sm font-medium mb-2 text-gray-400">Flasks</h3>
        <div className="flex gap-2 justify-center">
          {[0, 1, 2, 3, 4].map((slotIndex) => {
            // Flask slot is determined by x position (0-4)
            const flask = flasks.find((f) => f.x === slotIndex);
            return (
              <div
                key={slotIndex}
                className="w-12 h-16 bg-background border border-border rounded flex items-center justify-center"
              >
                {flask ? (
                  <ItemTooltip item={flask}>
                    <img
                      src={flask.icon}
                      alt={flask.typeLine}
                      className="max-w-full max-h-full object-contain cursor-pointer"
                    />
                  </ItemTooltip>
                ) : (
                  <span className="text-xs text-gray-600">{slotIndex + 1}</span>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// Item Slot Component
function ItemSlot({ item }: { item: Item }) {
  const rarityBorder: Record<number, string> = {
    0: "border-poe-normal",
    1: "border-poe-magic",
    2: "border-poe-rare",
    3: "border-poe-unique",
    4: "border-poe-gem",
    5: "border-poe-currency",
  };

  return (
    <ItemTooltip item={item}>
      <div
        className={`w-full h-full flex items-center justify-center p-1 border-2 rounded cursor-pointer ${rarityBorder[item.frameType] || "border-border"}`}
      >
        <img
          src={item.icon}
          alt={item.typeLine}
          className="max-w-full max-h-full object-contain"
        />
      </div>
    </ItemTooltip>
  );
}

// Currency Summary Component
function CurrencySummary({ items }: { items: Item[] }) {
  const currencies = [
    { name: "Divine Orb", key: "divine" },
    { name: "Chaos Orb", key: "chaos" },
    { name: "Exalted Orb", key: "exalt" },
    { name: "Vaal Orb", key: "vaal" },
    { name: "Orb of Alchemy", key: "alch" },
    { name: "Orb of Fusing", key: "fusing" },
    { name: "Jeweller's Orb", key: "jeweller" },
  ];

  const getCurrencyCount = (name: string) => {
    const item = items.find((i) => i.typeLine === name);
    return item?.stackSize || 0;
  };

  return (
    <div className="bg-muted/50 border border-border rounded-lg p-6">
      <h2 className="text-lg font-semibold mb-4">Currency</h2>
      <div className="space-y-3">
        {currencies.map((c) => {
          const count = getCurrencyCount(c.name);
          return (
            <div key={c.key} className="flex justify-between items-center">
              <span className="text-sm text-gray-400">{c.name}</span>
              <span
                className={`font-mono ${count > 0 ? "text-poe-currency" : "text-gray-600"}`}
              >
                {count}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
