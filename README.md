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

### Vercel

1. Connect repository
2. Set env vars from `.env.example`
3. Deploy

### Convex production

After testing locally:

```bash
npx convex deploy
```

Use `npx convex deploy` only for production — use `npx convex dev` during development.

## License

Private — all rights reserved.
