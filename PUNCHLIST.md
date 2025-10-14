## Project Punchlist

This punchlist will be executed sequentially. Each item includes acceptance criteria.

1) Dependencies: Install root and client
- Steps:
  - Run `npm ci || npm install` at repo root
  - Run `npm ci || npm install` in `client/`
- Acceptance:
  - `node_modules/` present in root and `client/`
  - No install errors

2) Build client
- Steps:
  - Run `npm run build` in `client/`
- Acceptance:
  - `client/build/` exists with static assets
  - Build completes without errors

3) Verify client integrity checks
- Steps:
  - Run `npm run dev:check` in `client/` (lint + format:check + type-check)
- Acceptance:
  - Command exits 0 or actionable issues are fixed

4) Run backend smoke
- Steps:
  - `node -e "require('./src/index.js'); console.log('loaded')"`
- Acceptance:
  - Process loads without throwing (will exit after script)

5) Generate env from example if missing
- Steps:
  - If `.env` missing, run `node generate-env.js` or copy `env.example` -> `.env`
- Acceptance:
  - `.env` present with placeholders, no secrets committed

6) API scripts sanity check
- Steps:
  - Run `node scripts/dev-utils.js validate`
- Acceptance:
  - Validation output shows success or actionable items are addressed

7) Create demo user utilities
- Steps:
  - Run `node create-demo-user.js` (no-op if env unconfigured)
- Acceptance:
  - Command runs without crash

8) Prepare documentation index
- Steps:
  - Ensure key docs: `README.md`, `QUICK_START_GUIDE.md`, `FRONTEND_SETUP.md`, `DEPLOYMENT_GUIDE.md` are discoverable; add links in README
- Acceptance:
  - README contains a Docs section with links

9) Optional: Pack production image dry run
- Steps:
  - `docker build -t umbrella-dashboard:dry-run .`
- Acceptance:
  - Image builds locally (skips if Docker unavailable)

Execution notes:
- Secrets are not required for install/build/linters.
- If a step fails, capture error and fix immediately before proceeding.
