# Zanwik.com

Marketing site for **Zanwik** (Byron McCluney · byron@zanwik.com · 828-989-3682).

## Stack

- **Next.js 14** (App Router) — catch-all route serves pre-rendered HTML
- **Static pages** under `frontend/content/mirror/`
- **Assets** under `frontend/public/assets-kr/` (CSS/fonts/JS; `/_next` renamed to avoid Next build collisions)
- Deploy: **Vercel** (`frontend/vercel.json`)

## Local development

```bash
cd frontend
npm install
npm run dev
```

Open http://localhost:3000

## Branding / contacts

- Public contact is **Byron McCluney only** — `byron@zanwik.com`, `828-989-3682`
- Booking CTAs use `mailto:byron@zanwik.com` until a Zanwik Cal.com event exists
- Product routes use Zanwik names (e.g. `/talent`, `/insights/the-zanwik-method`)
- Client-side Next.js RSC hydration was stripped from mirrored HTML (static full-page navigation)

## Provenance

Page structure was originally mirrored from an external reference site inventory (2026-11-04). User-facing copy, contacts, and people are Zanwik / Byron only — do not reintroduce third-party staff names or booking links.
