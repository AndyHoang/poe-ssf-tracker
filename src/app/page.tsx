import { fetchDashboardData } from "@/services/poe";
import { CharacterPaperdoll } from "@/components/CharacterPaperdoll";
import { CurrencySummary } from "@/components/CurrencySummary";
import { CharacterSelector } from "@/components/CharacterSelector";
import { RefreshButton } from "@/components/RefreshButton";

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

  try {
    const data = await fetchDashboardData(sessionId);
    const { profile, characters, currentCharacter, equipment, flasks, currencyItems } = data;

    const poeNinjaUrl = `https://poe.ninja/poe1/profile/${encodeURIComponent(profile.name)}/character/${encodeURIComponent(currentCharacter.name)}`;

    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-2xl font-bold">{currentCharacter.name}</h1>
            <p className="text-sm text-gray-400">
              {currentCharacter.class} · Level {currentCharacter.level} · {currentCharacter.league}
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
            <RefreshButton autoRefreshInterval={300} />
            <CharacterSelector characters={characters} current={currentCharacter.name} />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Paperdoll */}
          <div className="lg:col-span-2">
            <CharacterPaperdoll equipment={equipment} flasks={flasks} />
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
