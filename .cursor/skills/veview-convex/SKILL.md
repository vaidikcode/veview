---
name: veview-convex
description: Veview Convex patterns — schema, authedQuery vs public shareToken APIs, file upload flow. Use when editing convex/ or data layer.
---

# Veview Convex

## Stack

- Convex backend with Clerk JWT (`convex/auth.config.ts`)
- `convex-helpers` `authedQuery` / `authedMutation` for creator routes
- Public guest APIs validate `shareToken` via `getProjectByShareToken`

## Tables

- `users` — synced from Clerk via `users.ensureUser`
- `projects` — `shareToken`, `linkRevoked`, media fields
- `comments` — timestamp (video) or pinX/pinY (image)

## File upload (3 steps)

1. `files.generateUploadUrl` (authed)
2. Client POST file to URL → `{ storageId }`
3. `files.setProjectMedia` with `contentType` validation

## Rules

- All public functions: `args` + `returns` validators
- Never `Date.now()` in queries — pass `now` from client if needed
- Guest mutations: no `ctx.auth`; validate `shareToken` server-side
- Use indexes, not `.filter()` on queries
- Schedule only `internal.*` functions

## Key files

- `convex/lib/customFunctions.ts` — authed wrappers
- `convex/lib/projects.ts` — share token helpers
- `convex/review.ts` — public `getByShareToken`
