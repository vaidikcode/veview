# Veview

Client review for video and images — timestamped notes, shareable links, no client login.

## Stack

- **Next.js** (App Router)
- **Convex** (backend, storage, realtime)
- **Clerk** (creator auth)
- **PostHog** (EU analytics)

## Setup

```bash
npm install
cp .env.example .env.local
# Fill in Clerk, Convex, PostHog keys
npx convex dev
npm run dev
```

See [docs/PRD.md](docs/PRD.md) for the full roadmap.

## Deployment

### Vercel

1. Connect repository
2. Set env vars from `.env.example` (`NEXT_PUBLIC_CONVEX_URL` = **prod** Convex URL)
3. Deploy (default `npm run build`)

### Convex production

Push schema and functions **manually** after testing locally — not automatic on git push:

```bash
npx convex deploy
# if you added a data migration:
npx convex run migrations:migrateLegacyProjectMedia --prod
```

Use `npx convex dev` during development. Use `npx convex deploy` only for production.

## License

Private — all rights reserved.
