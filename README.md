# PoE SSF Tracker

Track your Solo Self-Found progress in Path of Exile - stash contents, currency, characters, and crafting materials.

## Features (Planned)

- 📊 SSF Progress Dashboard
- 💰 Currency tracking over time
- ⚔️ Character gear overview
- 🔧 Crafting helper

## Quick Start

```bash
# Install dependencies
just install

# Set up your PoE session (get POESESSID from browser cookies)
cp .env.example .env
# Edit .env with your POESESSID

# Test API connection
just test-simple
```

## Commands

```bash
just test-simple  # Quick overview (char, weapon, currency)
just test-full    # Full API test
just dev          # Start dev server
just lint         # Run pre-commit checks
```

## Tech Stack

- **Runtime**: Bun
- **Framework**: Next.js (planned)
- **Language**: TypeScript
- **Hosting**: Vercel

## API Reference

Uses the official [Path of Exile API](https://www.pathofexile.com/developer/docs/reference).

## License

MIT
