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
- `projects` — folders (`title`, `description`, `shareToken`, `status`)
- `mediaItems` — files in a folder (`title`, `description`, storage, type/status)
- `comments` — on a `mediaItemId` (timestamp for video, pinX/pinY for image)

## File upload (per media item)

1. `files.createMediaItem` (title + description)
2. `files.generateUploadUrl`
3. Client POST file → `{ storageId }`
4. `files.finalizeMediaItem` with contentType, fileName, fileSizeBytes

Any content type is accepted (`video` / `image` / `audio` / `file`).

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
- `convex/files.ts` — media item CRUD + upload finalize
