---
name: veview-posthog
description: Veview PostHog analytics — EU host, event taxonomy, creator identify. Use when adding tracking or PostHog config.
---

# Veview PostHog

## Config

- Package: `@posthog/next`
- Host: `https://eu.posthog.com` (Veview’s own PostHog project — key from env only)
- Client proxy: `/ingest` via `postHogMiddleware({ proxy: true, host: 'https://eu.i.posthog.com' })`
- Env: `NEXT_PUBLIC_POSTHOG_KEY`, `NEXT_PUBLIC_POSTHOG_HOST`

## Event naming

Use `snake_case`. Capture from client via `lib/analytics.ts` (`posthog.capture`).

| Event                | When                  | Properties                                  |
| -------------------- | --------------------- | ------------------------------------------- |
| `project_created`    | Project saved         | `project_id`                                |
| `media_uploaded`     | Upload complete       | `project_id`, `media_type`, `file_size_mb`  |
| `share_link_copied`  | Copy button           | `project_id`                                |
| `review_link_opened` | Guest opens `/r/*`    | `project_id`, `is_returning_guest`          |
| `comment_added`      | New comment           | `project_id`, `media_type`, `has_timestamp` |
| `comment_seeked`     | Click comment to seek | `project_id`                                |

## Identity

- Creators: `posthog.identify(clerkUserId)` in `PostHogIdentifier`
- Guests: anonymous (no identify unless email collected later)
- Logout: `posthog.reset()` so errors aren’t attributed to the previous user

## Error tracking

- Client autocapture: `capture_exceptions` in `PostHogProvider` (`app/layout.tsx`)
- Boundaries: `app/error.tsx`, `app/global-error.tsx` → `captureException`
- Handled failures: `captureAppException` in `lib/analytics.ts` (upload, project create, comments)
- Server: `instrumentation.ts` `onRequestError` + `lib/posthog-server.ts` (`posthog-node`)

Always use `captureException` / `captureAppException` — never manual `$exception` events.

## Middleware

Compose Clerk middleware with PostHog — Clerk runs first for route protection.
