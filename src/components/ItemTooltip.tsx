"use client";

import { useState } from "react";
import type { Item } from "@/lib/poe-api";

interface ItemTooltipProps {
  item: Item;
  children: React.ReactNode;
}

const rarityColors: Record<number, string> = {
  0: "text-poe-normal border-poe-normal",
  1: "text-poe-magic border-poe-magic",
  2: "text-poe-rare border-poe-rare",
  3: "text-poe-unique border-poe-unique",
  4: "text-poe-gem border-poe-gem",
  5: "text-poe-currency border-poe-currency",
};

const rarityBg: Record<number, string> = {
  0: "bg-gray-900",
  1: "bg-[#0f0f1a]",
  2: "bg-[#1a1a0f]",
  3: "bg-[#1a0f0a]",
  4: "bg-[#0a1a1a]",
  5: "bg-[#1a1a0f]",
};

export function ItemTooltip({ item, children }: ItemTooltipProps) {
  const [show, setShow] = useState(false);

  const rarityClass = rarityColors[item.frameType] || rarityColors[0];
  const bgClass = rarityBg[item.frameType] || rarityBg[0];

  return (
    <div
      className="relative"
      onMouseEnter={() => setShow(true)}
      onMouseLeave={() => setShow(false)}
    >
      {children}

      {show && (
        <div
          className={`absolute z-50 left-full ml-2 top-0 w-72 ${bgClass} border ${rarityClass.split(" ")[1]} rounded shadow-lg p-3 text-sm`}
        >
          {/* Header */}
          <div className={`text-center border-b border-gray-700 pb-2 mb-2 ${rarityClass.split(" ")[0]}`}>
            {item.name && <div className="font-bold">{item.name}</div>}
            <div className={item.name ? "" : "font-bold"}>{item.typeLine}</div>
          </div>

          {/* Item Level */}
          {item.ilvl > 0 && (
            <div className="text-gray-400 text-xs mb-2">
              Item Level: {item.ilvl}
            </div>
          )}

          {/* Sockets */}
          {item.sockets && item.sockets.length > 0 && (
            <div className="text-gray-400 text-xs mb-2">
              Sockets: {formatSockets(item.sockets)}
            </div>
          )}

          {/* Implicit Mods */}
          {item.implicitMods && item.implicitMods.length > 0 && (
            <div className="border-t border-gray-700 pt-2 mt-2">
              {item.implicitMods.map((mod, i) => (
                <div key={i} className="text-poe-magic text-xs">
                  {mod}
                </div>
              ))}
            </div>
          )}

          {/* Explicit Mods */}
          {item.explicitMods && item.explicitMods.length > 0 && (
            <div className="border-t border-gray-700 pt-2 mt-2">
              {item.explicitMods.map((mod, i) => (
                <div key={i} className="text-poe-magic text-xs">
                  {mod}
                </div>
              ))}
            </div>
          )}

          {/* Crafted Mods */}
          {item.craftedMods && item.craftedMods.length > 0 && (
            <div className="border-t border-gray-700 pt-2 mt-2">
              {item.craftedMods.map((mod, i) => (
                <div key={i} className="text-[#b4b4ff] text-xs">
                  {mod} (crafted)
                </div>
              ))}
            </div>
          )}

          {/* Enchant Mods */}
          {item.enchantMods && item.enchantMods.length > 0 && (
            <div className="border-t border-gray-700 pt-2 mt-2">
              {item.enchantMods.map((mod, i) => (
                <div key={i} className="text-[#b4b4ff] text-xs">
                  {mod}
                </div>
              ))}
            </div>
          )}

          {/* Flavour Text (for uniques) */}
          {item.flavourText && item.flavourText.length > 0 && (
            <div className="border-t border-gray-700 pt-2 mt-2 italic text-poe-unique text-xs">
              {item.flavourText.map((line, i) => (
                <div key={i}>{line}</div>
              ))}
            </div>
          )}

          {/* Corrupted */}
          {item.corrupted && (
            <div className="text-red-500 text-xs mt-2 font-bold">Corrupted</div>
          )}

          {/* Unidentified */}
          {item.identified === false && (
            <div className="text-red-500 text-xs mt-2">Unidentified</div>
          )}
        </div>
      )}
    </div>
  );
}

function formatSockets(sockets: { group: number; attr: string }[]): string {
  const groups: string[][] = [];
  sockets.forEach((s) => {
    if (!groups[s.group]) groups[s.group] = [];
    const color = s.attr === "S" ? "R" : s.attr === "D" ? "G" : s.attr === "I" ? "B" : "W";
    groups[s.group].push(color);
  });
  return groups.map((g) => g.join("-")).join(" ");
}
