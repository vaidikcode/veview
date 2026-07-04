# Veview

Media review for freelancers — share a link, clients leave timestamped feedback without an account.

## Stack

- **Next.js 16** (App Router) + TypeScript
- **Convex** — database, file storage, real-time API
- **Clerk** — creator authentication
- **PostHog** — analytics (EU)
- **Tailwind CSS** + shadcn-style UI primitives

## Prerequisites

- Node.js 20+ (see `.nvmrc`)
- [Convex](https://convex.dev) account (or local anonymous dev)
- [Clerk](https://clerk.com) application with Convex integration enabled
- [PostHog](https://eu.posthog.com) project key

## Setup

1. Clone and install:

```bash
npm install
```

2. Copy environment variables:

```bash
cp .env.example .env.local
```

Fill in Clerk keys, PostHog key, and Convex URL (created by `npx convex dev`).

3. Set Clerk issuer in Convex:

```bash
npx convex env set CLERK_JWT_ISSUER_DOMAIN https://your-instance.clerk.accounts.dev
```

4. Run development (two terminals):

```bash
npx convex dev
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Scripts

| Command             | Description                             |
| ------------------- | --------------------------------------- |
| `npm run dev`       | Next.js dev server                      |
| `npx convex dev`    | Convex backend (use during development) |
| `npm run lint`      | ESLint                                  |
| `npm run typecheck` | TypeScript check                        |
| `npm run check`     | Lint + typecheck                        |
| `npm run build`     | Production build                        |

## Project structure

```
app/           Next.js routes
convex/        Backend schema & functions
components/    UI + review player
docs/PRD.md    Product requirements
.cursor/skills Project-specific agent skills
```

## Feature 1 (MVP)

- Creator sign up / log in (Clerk)
- Create project, upload video or image (Convex storage)
- Share public link `/r/{token}`
- Guest timestamped comments (no account)
- Real-time comment updates

See [docs/PRD.md](docs/PRD.md) for the full roadmap.

## Deployment

### Vercel + Convex (automatic on `main`)

Schema and function changes under `convex/` deploy to **production Convex** whenever Vercel builds **production** (push to `main`).

1. Connect the repo to Vercel.
2. Set app env vars from `.env.example` (`NEXT_PUBLIC_CONVEX_URL` must be the **prod** URL).
3. Add **`CONVEX_DEPLOY_KEY`** (Convex Dashboard → Project Settings → Deploy Keys → **Production**).
4. Build command is already set in `vercel.json` → `scripts/vercel-build.sh`:
   - Production: `npx convex deploy --cmd 'npm run build'` (pushes schema/tables/functions, then builds Next)
   - Preview: `npm run build` only (does not touch prod Convex)

There is also a GitHub Action (`.github/workflows/deploy-convex.yml`) that deploys Convex when `convex/**` changes on `main`. Add the same `CONVEX_DEPLOY_KEY` as a GitHub Actions secret.

### What auto-deploys vs what does not

| Change                                                 | Auto on prod deploy?                                                    |
| ------------------------------------------------------ | ----------------------------------------------------------------------- |
| New tables, indexes, optional fields in `schema.ts`    | Yes — `convex deploy`                                                   |
| New/updated queries, mutations, actions                | Yes                                                                     |
| Data backfills / clearing old fields (`migrations.ts`) | **No** — run once after deploy: `npx convex run migrations:name --prod` |

Use `npx convex dev` locally. Use `npx convex deploy` (or the Vercel/GitHub path above) only for production.

### Manual Convex production deploy

```bash
npx convex deploy
# optional data migration after schema is live:
npx convex run migrations:migrateLegacyProjectMedia --prod
```

## License

Private — all rights reserved.
