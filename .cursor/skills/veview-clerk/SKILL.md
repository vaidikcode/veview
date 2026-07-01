---
name: veview-clerk
description: Veview Clerk auth — public-first middleware, ConvexProviderWithClerk wrap order, protected creator routes. Use when editing auth or middleware.
---

# Veview Clerk

## Provider order (required)

```tsx
<ClerkProvider>
  <ConvexClientProvider>
    {" "}
    {/* ConvexProviderWithClerk inside */}
    <PostHogProvider>{children}</PostHogProvider>
  </ConvexClientProvider>
</ClerkProvider>
```

Clerk must wrap Convex so `useAuth` is available to `ConvexProviderWithClerk`.

## Public routes (no login)

- `/` — landing
- `/sign-in`, `/sign-up`
- `/r/*` — guest review

## Protected routes

- `/dashboard`, `/projects/*` — `auth.protect()` in middleware

## Convex integration

1. Activate Convex integration in Clerk Dashboard
2. Set `CLERK_JWT_ISSUER_DOMAIN` in Convex env + `.env.local`
3. `convex/auth.config.ts` with `applicationID: "convex"`

## First visit

Call `users.ensureUser` mutation after sign-in before other authed queries (`EnsureUser` component gates UI).
