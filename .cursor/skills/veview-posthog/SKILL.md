---
name: veview-posthog
description: Veview PostHog analytics — EU host, event taxonomy, creator identify. Use when adding tracking or PostHog config.
---

# Veview PostHog

## Config

- Package: `@posthog/next`
- Host: `https://eu.posthog.com` (project Studio / Mirelo)
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

## Middleware

Compose Clerk middleware with PostHog — Clerk runs first for route protection.
