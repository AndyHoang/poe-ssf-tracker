# PoE SSF Tracker - Commands
# Run with: just <command>

# Default: show available commands
default:
    @just --list

# Run simple API test (quick overview)
test-simple:
    mise x -- bun run scripts/test-simple.ts

# Run full API test (all endpoints)
test-full:
    mise x -- bun run test-poe-connection.ts

# Start dev server
dev:
    mise x -- bun run dev

# Install dependencies
install:
    mise x -- bun install

# Type check
typecheck:
    mise x -- bun run tsc --noEmit

# Install pre-commit hooks
setup-hooks:
    pre-commit install

# Run pre-commit on all files
lint:
    pre-commit run --all-files
