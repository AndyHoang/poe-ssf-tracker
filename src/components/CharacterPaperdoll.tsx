import type { Item } from "@/lib/poe-api";
import { ItemTooltip } from "./ItemTooltip";

interface CharacterPaperdollProps {
  equipment: Item[];
  flasks: Item[];
}

// Equipment slot positions for grid layout
const EQUIPMENT_SLOTS = [
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

const RARITY_BORDER: Record<number, string> = {
  0: "border-poe-normal",
  1: "border-poe-magic",
  2: "border-poe-rare",
  3: "border-poe-unique",
  4: "border-poe-gem",
  5: "border-poe-currency",
};

export function CharacterPaperdoll({ equipment, flasks }: CharacterPaperdollProps) {
  const getItemForSlot = (slotId: string) =>
    equipment.find((i) => i.inventoryId === slotId);

  const getFlaskForSlot = (slotIndex: number) =>
    flasks.find((f) => f.x === slotIndex);

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
        {EQUIPMENT_SLOTS.map((slot) => {
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
            const flask = getFlaskForSlot(slotIndex);
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

function ItemSlot({ item }: { item: Item }) {
  return (
    <ItemTooltip item={item}>
      <div
        className={`w-full h-full flex items-center justify-center p-1 border-2 rounded cursor-pointer ${RARITY_BORDER[item.frameType] || "border-border"}`}
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
