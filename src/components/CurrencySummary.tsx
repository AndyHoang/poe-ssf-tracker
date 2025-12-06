import type { Item } from "@/lib/poe-api";

interface CurrencySummaryProps {
  items: Item[];
}

const TRACKED_CURRENCIES = [
  { name: "Divine Orb", key: "divine" },
  { name: "Chaos Orb", key: "chaos" },
  { name: "Exalted Orb", key: "exalt" },
  { name: "Vaal Orb", key: "vaal" },
  { name: "Orb of Alchemy", key: "alch" },
  { name: "Orb of Fusing", key: "fusing" },
  { name: "Jeweller's Orb", key: "jeweller" },
];

export function CurrencySummary({ items }: CurrencySummaryProps) {
  const getCurrencyCount = (name: string) => {
    const item = items.find((i) => i.typeLine === name);
    return item?.stackSize || 0;
  };

  return (
    <div className="bg-muted/50 border border-border rounded-lg p-6">
      <h2 className="text-lg font-semibold mb-4">Currency</h2>
      <div className="space-y-3">
        {TRACKED_CURRENCIES.map((c) => {
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
