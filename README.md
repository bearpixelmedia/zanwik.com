# Zanwik.com

Marketing site for Zanwik — mirrored 1:1 from [Krastor](https://www.krastor.com/) (layout, pages, copy, and structure), hosted on the zanwik.com domain with Zanwik branding.

## Stack

- **Next.js 14** (App Router) — catch-all route serves pre-rendered HTML
- **Static mirror** of 322 Krastor pages under `frontend/content/mirror/`
- **Assets** under `frontend/public/assets-kr/` (CSS/fonts/JS from source; `/_next` renamed to avoid Next build collisions)
- Deploy: **Vercel** (`frontend/vercel.json`)

## Local development

```bash
cd frontend
npm install
npm run dev
```

Open http://localhost:3000

## Branding notes

- Domain / canonical / titles use **Zanwik** / **zanwik.com**
- Product route `/krastorm` and product name **Krastorm** kept from source
- External Cal.com booking still points at `cal.com/krastor/intro` (third-party; update when Zanwik has its own event)
- Client-side Next.js RSC hydration was stripped from mirrored HTML (static full-page navigation). Visual CSS/layout match source; some JS-only interactions (client components) may differ until rebuilt natively

## Source

Mirrored from https://www.krastor.com/ sitemap (322 URLs) on 2026-11-04.
