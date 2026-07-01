---
name: veview-review-ui
description: Veview review player UI — video timestamps, image pins, comment sidebar, guest name in localStorage. Use when editing review components.
---

# Veview Review UI

## Layout

- Dark cinematic review chrome: `--review-bg`, `--review-panel`, `--review-border`
- Grid: media left, comment sidebar right (bottom sheet on mobile — future)
- Routes: `/r/[token]` (guest), `/projects/[id]/review` (creator)

## Video

- Native `<video>` + custom controls in `components/review/video-player.tsx`
- Comment markers on seek bar; click comment → seek
- `currentTime` state in `ReviewWorkspace`

## Image

- Click to place pin (`pendingPin`) then submit comment with `pinX`/`pinY` (0–1 normalized)
- Pins rendered as dots on image

## Guest identity

- `lib/guest.ts` — `localStorage` key `veview_guest_name`
- First comment prompts for display name
- Passed to `comments.addGuestComment` as `displayName`

## Components

- `ReviewWorkspace` — orchestrates player + sidebar + mutations
- `CommentSidebar` — list, compose, relative timestamps (client passes `now`)

## Design

Apply `interface-design` for dashboard; cinematic dark player for review pages. Fonts: DM Sans + Instrument Serif.
