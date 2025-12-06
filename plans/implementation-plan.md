# PoE SSF Stash Tracker - Implementation Plan

## Project Overview
Build a Next.js website that connects to Path of Exile's OAuth API to fetch stash data for SSF progress tracking and crafting assistance.

## Key Constraints
- **OAuth Requirement**: PoE requires HTTPS with a registered domain for confidential clients
- **Hosting**: Deploy to Vercel (free tier) - provides HTTPS and custom domain support
- **Scopes Needed**: `account:stashes`, `account:characters`, `account:profile`

## User Requirements
- **League**: Single league only (current SSF league)
- **History**: Track historical stash snapshots for progress charts
- **Characters**: Include character inventory and equipped items tracking

---

## Architecture

```
┌─────────────────────────────────────────────────────┐
│                    Next.js App                       │
├─────────────────────────────────────────────────────┤
│  Pages/Routes                                        │
│  ├── / (Dashboard) ← START HERE                     │
│  │     - Character selector dropdown                │
│  │     - Character paperdoll (equipped gear)        │
│  │     - Currency summary (Divine/Chaos/etc)        │
│  │     - Quick stats                                │
│  ├── /characters (Character list + detail view)     │
│  ├── /stash (Stash browser with tabs)               │
│  ├── /crafting (Crafting helper) - later            │
│  ├── /history (Progress over time) - later          │
│  └── /auth/callback (OAuth callback)                │
├─────────────────────────────────────────────────────┤
│  API Routes                                          │
│  ├── /api/auth/[...] (OAuth handlers)               │
│  ├── /api/stash/[...] (Stash data proxy)            │
│  └── /api/sync (Background sync trigger)            │
├─────────────────────────────────────────────────────┤
│  Services                                            │
│  ├── poe-oauth.ts (OAuth flow management)           │
│  ├── poe-api.ts (PoE API client)                    │
│  └── stash-analyzer.ts (Item analysis logic)        │
├─────────────────────────────────────────────────────┤
│  Storage (Vercel Postgres via Prisma)               │
│  ├── Users (account info, tokens)                   │
│  ├── StashSnapshots (historical stash data)         │
│  └── CraftingBases (tracked crafting items)         │
└─────────────────────────────────────────────────────┘
```

---

## Implementation Steps

### Phase 1: Project Setup
1. Initialize Next.js project with TypeScript + Tailwind (app router)
2. Install dependencies:
   - `@tanstack/react-query` (data fetching/caching)
   - `zod` (validation)
   - `iron-session` (cookie sessions) - later for OAuth
3. Set up PoE API client (reuse from test scripts)
4. Build Dashboard page (`/`):
   - Character selector
   - Character paperdoll
   - Currency summary

### Phase 2: OAuth Integration
1. Register app at pathofexile.com/developer (manual step)
2. Implement OAuth authorization flow:
   - Authorization URL builder with PKCE
   - Callback handler for token exchange
   - Token refresh logic
3. Set up session management with encrypted cookies
4. Create auth middleware for protected routes

### Phase 3: PoE API Client
1. Create typed API client for PoE endpoints:
   - `GET /account/stashes/{league}` - List stash tabs
   - `GET /account/stashes/{league}/{stash_id}` - Get stash contents
   - `GET /account/characters` - List characters
2. **Support dual auth**: POESESSID (testing) + OAuth (production)
3. Implement rate limiting (PoE has strict limits)
4. Add response caching layer
5. Create TypeScript types for PoE item data

### Phase 4: Database & Data Model
1. Set up Prisma with Vercel Postgres (or Turso for SQLite edge)
2. Define schemas:
   - User (poeAccountId, tokens, selectedLeague, preferences)
   - StashSnapshot (timestamp, league, stashData JSON)
   - CharacterSnapshot (timestamp, characterName, items JSON)
   - TrackedItem (for crafting bases)
3. Create sync job to periodically fetch stash + character data
4. Implement data retention policy (keep daily snapshots)

**Database Options:**
- Vercel Postgres: Built-in, easy setup, free 256MB
- Turso (SQLite edge): Free 9GB, faster reads
- Supabase: Free 500MB, built-in auth (optional)

### Phase 5: Character Screen (Paperdoll UI)

Replicate the in-game character equipment screen with a visual paperdoll layout.

**Equipment Slots Layout:**
```
        [Helmet]
[Weapon] [Body] [Off-hand]
 [Gloves] [Belt] [Boots]
  [Ring1] [Amulet] [Ring2]
       [Flask x5]
```

**Implementation Approach:**
- Use CSS Grid for slot positioning (inspired by [RPG Inventory React tutorial](https://dev.to/sharifelkassed/building-an-rpg-style-inventory-with-react-part-1-2k8p))
- Each slot is a fixed-size cell with item image overlay
- Item tooltips on hover showing mods/stats
- Item images from PoE CDN: `https://web.poecdn.com/image/Art/2DItems/...`

**References:**
- [PichotM/RPG-Inventory-UI](https://github.com/PichotM/RPG-Inventory-UI) - React drag-drop inventory
- [Looty](https://github.com/benjaminjackman/looty) - Browser extension with equipment comparison
- [Game UI Database](https://www.gameuidatabase.com/index.php?scrn=71) - UI screenshots for reference

**Components to Build:**
- `CharacterPaperdoll.tsx` - Main paperdoll grid layout
- `EquipmentSlot.tsx` - Individual slot (weapon, helmet, etc.)
- `ItemCard.tsx` - Item display with image and rarity border
- `ItemTooltip.tsx` - Hover tooltip with mods, DPS, defenses

**Item Rarity Colors (border/glow):**
- Normal: #c8c8c8 (gray)
- Magic: #8888ff (blue)
- Rare: #ffff77 (yellow)
- Unique: #af6025 (orange)

### Phase 6: SSF Progress Tracker Features
1. Dashboard showing:
   - **Character paperdoll** (equipped gear at a glance)
   - Currency accumulation over time (historical charts)
   - Unique items found (checklist style)
   - Character progression milestones
2. Stash browser with search/filter
3. Progress charts (currency graphs, item count over time)
4. Historical comparison (compare snapshots)

### Phase 7: Crafting Helper Features
1. Crafting base tracker:
   - Identify good bases in stash (item level, influence, etc.)
   - Tag items for crafting projects
2. Material inventory:
   - Currency/fossil/essence counts
   - Crafting cost calculator
3. Mod database integration (optional - poedb data)

---

## Files to Create

```
/home/andy/workplace/personal/poe_ssf/
├── package.json
├── next.config.ts
├── tailwind.config.ts
├── tsconfig.json
├── .env.example
├── .env.local (gitignored)
├── prisma/
│   └── schema.prisma
├── src/
│   ├── app/
│   │   ├── layout.tsx
│   │   ├── page.tsx (dashboard)
│   │   ├── auth/
│   │   │   ├── login/page.tsx
│   │   │   └── callback/page.tsx
│   │   ├── stash/page.tsx
│   │   ├── characters/page.tsx
│   │   ├── history/page.tsx
│   │   └── crafting/page.tsx
│   ├── api/
│   │   ├── auth/
│   │   │   ├── login/route.ts
│   │   │   ├── callback/route.ts
│   │   │   └── logout/route.ts
│   │   └── stash/
│   │       └── route.ts
│   ├── lib/
│   │   ├── poe-oauth.ts
│   │   ├── poe-api.ts
│   │   ├── session.ts
│   │   └── db.ts
│   ├── types/
│   │   └── poe.ts (PoE API types)
│   └── components/
│       ├── character/
│       │   ├── CharacterPaperdoll.tsx
│       │   ├── EquipmentSlot.tsx
│       │   └── ItemCard.tsx
│       ├── items/
│       │   └── ItemTooltip.tsx
│       ├── stash/
│       │   └── StashGrid.tsx
│       └── charts/
│           └── ProgressChart.tsx
└── README.md
```

---

## Deployment & Development Setup

Since PoE requires HTTPS redirect URIs, we'll deploy to Vercel:

**Option A: Vercel (recommended)**
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy (creates a .vercel.app subdomain with HTTPS)
vercel

# For production
vercel --prod
```
- Free tier includes: HTTPS, custom domains, serverless functions
- Preview deployments for each git push
- Environment variables via Vercel dashboard

**Option B: Cloudflare Pages**
```bash
# Connect your GitHub repo to Cloudflare Pages
# Or use Wrangler CLI
npm i -g wrangler
wrangler pages deploy ./out
```
- Free tier includes: HTTPS, custom domains
- Requires static export or edge functions

**Development Workflow:**
1. Develop locally with `npm run dev`
2. Push to GitHub → Vercel auto-deploys preview
3. Test OAuth flow on preview URL
4. Merge to main → Production deployment

Register your app at pathofexile.com/developer with:
- Redirect URI: `https://your-app.vercel.app/auth/callback`
- Scopes: `account:stashes account:characters account:profile`

---

## Key Technical Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Auth library | Custom OAuth | PoE OAuth is non-standard, next-auth adapters don't exist |
| Database | Vercel Postgres or Turso (SQLite edge) | Serverless-compatible, free tier available |
| Styling | Tailwind CSS | Fast development, good DX |
| State management | React Query | Great for API data caching and sync |
| Hosting | Vercel | Free HTTPS, auto-deploy, serverless functions |

---

## Getting Started (First Steps)

### Phase A: Quick Testing with POESESSID (Personal Use Only)

For initial development and testing, you can use your personal session cookie:

1. **Get your POESESSID**:
   - Log into https://www.pathofexile.com
   - Open DevTools → Application → Cookies → `www.pathofexile.com`
   - Copy the `POESESSID` value

2. **Initialize project**:
   ```bash
   npx create-next-app@latest . --typescript --tailwind --app --src-dir
   ```

3. **Create `.env.local`**:
   ```
   POE_SESSION_ID=your_poesessid_here
   ```

4. **Test API calls locally** (no HTTPS needed for session auth)

**Note:** POESESSID gives full account access - never share it or commit to git. Session expires on logout.

---

### Phase B: Production OAuth Setup (For Multi-User App)

When ready for production/other users:

1. **Deploy to Vercel** (to get HTTPS URL):
   ```bash
   vercel  # Creates https://your-app.vercel.app
   ```

2. **Register OAuth App** (manual):
   - Go to https://www.pathofexile.com/developer/docs
   - Create a new OAuth application
   - Set redirect URI: `https://your-app.vercel.app/auth/callback`
   - Request scopes: `account:stashes account:characters account:profile`
   - Save `client_id` and `client_secret`

3. **Configure Environment Variables** in Vercel dashboard:
   ```
   POE_CLIENT_ID=xxx
   POE_CLIENT_SECRET=xxx
   ```
