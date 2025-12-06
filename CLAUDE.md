# PoE SSF Tracker - Project Context

## Project Overview
A Next.js website to track SSF (Solo Self-Found) progress in Path of Exile, including stash tracking, character progress, and crafting assistance.

## PoE API Reference

Official docs: https://www.pathofexile.com/developer/docs/reference

### Authentication Methods

1. **Session API (POESESSID)** - For personal testing
   - Get cookie from browser DevTools → Application → Cookies → `www.pathofexile.com`
   - Pass as `Cookie: POESESSID=xxx` header
   - Session expires on logout

2. **OAuth API** - For production/multi-user apps
   - Register app at https://www.pathofexile.com/developer/docs
   - Requires HTTPS redirect URI (use Vercel)
   - Access tokens last 28 days, refresh tokens 90 days

### OAuth Scopes
| Scope | Description |
|-------|-------------|
| `account:profile` | Basic profile info |
| `account:stashes` | View stash tabs and items |
| `account:characters` | View characters and inventories |
| `account:league_accounts` | View allocated atlas passives |
| `account:item_filter` | Manage item filters |
| `account:guild:stashes` | Guild stash access (special request) |

### Session API Endpoints (POESESSID)

```
GET /api/profile
  → { uuid, name, locale, twitch? }

GET /api/leagues?type=main&compact=1
  → League[]

GET /character-window/get-characters
GET /character-window/get-characters?accountName=xxx
  → Character[]

GET /character-window/get-stash-items?league=XXX&tabs=1&tabIndex=0
  → { numTabs, tabs: StashTab[], items: Item[] }
  - tabs=1 includes tab metadata
  - tabIndex selects which tab's items to return

GET /character-window/get-items?accountName=XXX&character=YYY
  → { character: Character, items: Item[] }

GET /character-window/get-passive-skills?accountName=XXX&character=YYY
  → Passive skill tree data
```

### OAuth API Endpoints (Bearer Token)

```
GET /api/stash/{league}
  Scope: account:stashes
  → List of stash tabs

GET /api/stash/{league}/{stash_id}
GET /api/stash/{league}/{stash_id}/{substash_id}
  Scope: account:stashes
  → Stash contents with items

GET /api/character/{name}
  Scope: account:characters
  → Character with equipment, inventory, passives
```

### Key Types

```typescript
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
  type: string;   // NormalStash, CurrencyStash, QuadStash, MapStash, etc.
  colour?: { r: number; g: number; b: number };
}

interface Item {
  id: string;
  name: string;        // unique name (empty for non-uniques)
  typeLine: string;    // base type display
  baseType: string;    // actual base type
  ilvl: number;
  frameType: number;   // 0=normal, 1=magic, 2=rare, 3=unique, 4=gem, 5=currency
  x?: number;
  y?: number;
  w: number;
  h: number;
  stackSize?: number;
  maxStackSize?: number;
  sockets?: Socket[];
  explicitMods?: string[];
  implicitMods?: string[];
}
```

### Rate Limits
- Be respectful, GGG enforces strict limits
- Confidential OAuth clients get individual rate limits
- Public clients share rate limits

### User-Agent
Recommended format: `AppName/version (contact: email@example.com)`

## Test Account Data

- Account: `silverhand31#0197`
- UUID: `ed14392f-0fdd-49ad-ad15-060de5043db7`
- SSF Character: `bsss_now` (Juggernaut Lv89, SSF Keepers)
- Stash tabs: 18

## Pages Structure

```
/                  → Dashboard (START HERE)
                     - Character selector dropdown
                     - Character paperdoll (equipped gear)
                     - Currency summary (Divine/Chaos/etc)
                     - Quick stats

/characters        → Character list + detailed view
/stash             → Stash browser with tabs
/crafting          → Crafting helper (later)
/history           → Progress over time (later)
/auth/callback     → OAuth callback
```

## Character Paperdoll UI

Equipment slots layout:
```
        [Helmet]
[Weapon] [Body] [Off-hand]
 [Gloves] [Belt] [Boots]
  [Ring1] [Amulet] [Ring2]
       [Flask x5]
```

Item rarity colors:
- Normal: #c8c8c8 (gray)
- Magic: #8888ff (blue)
- Rare: #ffff77 (yellow)
- Unique: #af6025 (orange)

Item images: `https://web.poecdn.com/image/Art/2DItems/...`

## Tech Stack

- **Runtime**: Bun
- **Framework**: Next.js (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Data Fetching**: @tanstack/react-query
- **Database**: Vercel Postgres or Turso (SQLite edge)
- **Hosting**: Vercel

## Commands

```bash
# Quick overview (character, weapon, currency)
just test-simple

# Full API test (all endpoints)
just test-full

# Start dev server (after Next.js setup)
just dev

# Install dependencies
just install
```

## Environment Variables

```env
# .env (gitignored)
POE_SESSION_ID=xxx          # For testing only

# Production (Vercel dashboard)
POE_CLIENT_ID=xxx
POE_CLIENT_SECRET=xxx
```
