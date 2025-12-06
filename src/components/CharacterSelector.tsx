"use client";

import type { Character } from "@/lib/poe-api";

interface CharacterSelectorProps {
  characters: Character[];
  current: string;
  onChange?: (characterName: string) => void;
}

export function CharacterSelector({
  characters,
  current,
  onChange,
}: CharacterSelectorProps) {
  return (
    <select
      className="bg-muted border border-border rounded px-3 py-2 text-sm"
      value={current}
      onChange={(e) => onChange?.(e.target.value)}
    >
      {characters.map((char) => (
        <option key={char.name} value={char.name}>
          {char.name} ({char.class} {char.level})
        </option>
      ))}
    </select>
  );
}
