# Veview — Product Requirements Document

> **Version:** 0.1 (Planning)  
> **Last updated:** June 2026  
> **Status:** Pre-implementation — features are ordered for incremental delivery

---

## 1. Vision

**Veview** is a lightweight review platform for freelancers and creative professionals. A freelancer uploads video or image media, shares a single link with a client, and the client reviews it **without creating an account** — leaving timestamped feedback exactly where it matters.

The long-term goal is to bring the clarity and accountability of **GitHub-style code review** to creative media review: visible history, explicit approvals, review rounds, and a timeline that answers _who said what, when, and what changed as a result_.

---

## 2. Problem Statement

Freelancers routinely deliver drafts via Dropbox links, WeTransfer, or email. Clients reply with vague feedback in Slack, email, or Loom — _"change the intro around 0:30"_ — which is hard to action and easy to lose.

| Pain                                    | Current workaround            | Veview answer                           |
| --------------------------------------- | ----------------------------- | --------------------------------------- |
| Feedback is disconnected from the media | Screenshots + arrows in email | Comments pinned to timestamps / regions |
| No single source of truth               | Scattered threads             | One review link per deliverable         |
| Client doesn't want another account     | Freelancer chases replies     | Guest review, no signup                 |
| Unclear if client approved              | "Looks good!" in WhatsApp     | Explicit approve / request changes      |
| Multiple revision rounds get messy      | v2_final_FINAL2.mp4           | Versioned media + review history        |

---

## 3. Target Users

### Primary — Freelancer (Creator)

- Video editors, motion designers, photographers, illustrators, social content creators
- Works solo or in a small studio
- Needs fast setup, professional client experience, minimal admin

### Secondary — Client (Reviewer)

- Marketing managers, brand owners, agency clients, startup founders
- Low patience for new tools; may review on phone
- Wants to comment quickly and signal approval without friction

### Tertiary — Collaborator (Future)

- Art director, second editor, producer
- Needs internal notes hidden from client, or shared team access

---

## 4. Core Principles

1. **Client-first friction removal** — Review links work without login; signup is optional.
2. **Comment where it belongs** — Every note ties to a moment (time) or place (region) on the media.
3. **Explicit state, not implied agreement** — Approved / changes requested / open, never ambiguous.
4. **History is a feature** — The timeline of reviews is as important as the comments themselves.
5. **Beautiful by default** — The player and review UI should feel premium; freelancers trust tools that impress clients.
6. **Ship in layers** — Each feature phase is independently valuable.

---

## 5. User Journeys

### 5.1 Freelancer — First delivery (happy path)

```
Sign up / Log in
  → Create project (name, optional client label)
  → Upload video or image
  → Copy share link
  → Send link to client (email, Slack, etc.)
  → Receive notification when client comments
  → Upload revised version (later phase)
  → Client approves
  → Project marked complete
```

### 5.2 Client — Guest review (happy path)

```
Open link (no account)
  → See media player + comment sidebar
  → Play / scrub video
  → Pause at moment → add comment
  → Submit (optional: enter name + email for attribution)
  → Mark review as "Approved" or "Changes requested"
  → Done
```

### 5.3 Freelancer — Returning user

```
Log in
  → Dashboard: projects grouped by status (awaiting review, changes requested, approved)
  → Open project → see all comments on timeline
  → Resolve / reply to comments
  → Share updated link or new version
```

---

## 6. Feature Roadmap

Features are numbered and **ordered for implementation**. Each phase builds on the previous. Implement top to bottom.

---

### Feature 1 — Baseline: Share Link & Review _(MVP)_

> **Goal:** A freelancer can upload media, share a link, and a client can leave timestamped comments without signing up. This is the foundation everything else builds on.

#### 1.1 Authentication (Freelancer only)

- [ ] Email + password sign up and log in
- [ ] Password reset
- [ ] Session persistence (stay logged in)
- [ ] Protected creator routes; public guest routes for review links

#### 1.2 Projects

- [ ] Create project with title (required) and optional description
- [ ] Project belongs to authenticated freelancer
- [ ] List projects on a simple dashboard (title, status, last activity, thumbnail)
- [ ] Archive / delete project

#### 1.3 Media upload

- [ ] Upload video (MP4, MOV, WebM — define max size per plan later)
- [ ] Upload images (PNG, JPG, WebP)
- [ ] One primary media asset per project in MVP (multi-asset in later phase)
- [ ] Processing state: uploading → processing → ready
- [ ] Thumbnail generation for dashboard and link preview (Open Graph)

#### 1.4 Shareable review link

- [ ] Generate unique, unguessable URL per project (e.g. `/r/{token}`)
- [ ] Link opens guest review page — **no login required**
- [ ] Optional: freelancer can disable link (revoke access)
- [ ] Copy-to-clipboard with success feedback

#### 1.5 Media player (guest + creator)

- [ ] Video: play / pause, seek, volume, fullscreen
- [ ] Image: zoom / pan for detail inspection
- [ ] Responsive layout (desktop-first, usable on tablet/phone)
- [ ] Current playback time always visible

#### 1.6 Timestamped comments (video)

- [ ] Add comment at current playhead position
- [ ] Comment stores: text, timestamp (seconds), author display name
- [ ] Guest provides display name on first comment (stored in local session / cookie)
- [ ] Optional guest email for notifications (later phase can require it)
- [ ] Click comment in sidebar → seek player to that timestamp
- [ ] Comment markers on timeline scrubber

#### 1.7 Image comments

- [ ] Pin comment to x/y position on image (click to place)
- [ ] Comment stores: text, coordinates, author display name
- [ ] Click pin → highlight comment in sidebar

#### 1.8 Comment list UI

- [ ] Sidebar (or bottom sheet on mobile) listing all comments
- [ ] Sort by time / position (timestamp or pin order)
- [ ] Empty state: "No comments yet — pause and add feedback"
- [ ] Relative timestamps ("2 min ago") + absolute media time ("0:42")

#### 1.9 Creator view

- [ ] Same review UI as guest, plus project settings
- [ ] Creator can also comment (clearly labeled as creator)
- [ ] Edit project title / description

**MVP success criteria**

- Freelancer can go from sign-up to shared link in under 3 minutes
- Client can leave a timestamped comment without creating an account
- Comments persist and reload correctly on page refresh

---

### Feature 2 — Comment Threads & Resolution

> **Goal:** Turn one-off notes into a workable feedback loop.

- [ ] Reply to comments (threaded, one level deep in MVP)
- [ ] Comment states: **Open** | **Resolved**
- [ ] Only creator (or later: team) can mark resolved; guest can reopen with reply
- [ ] Filter sidebar: All / Open / Resolved
- [ ] Resolved comments visually muted on timeline
- [ ] Edit own comment (within time window, e.g. 15 min)
- [ ] Delete own comment (soft delete with "deleted" placeholder)

---

### Feature 3 — Review Decisions (Approve / Request Changes)

> **Goal:** Replace ambiguous "looks good" messages with explicit review outcomes — the first step toward GitHub-style review semantics.

- [ ] Guest (and creator) can submit a **review decision** on the current version:
  - **Approved** — ready to proceed / deliver
  - **Changes requested** — more work needed
  - **Comment** (optional third state) — feedback without binary decision
- [ ] Optional summary note with decision ("Approved — ship as-is")
- [ ] Project status derived from latest decision: `Awaiting review` | `Changes requested` | `Approved`
- [ ] Dashboard reflects status with clear badges
- [ ] Decision banner visible at top of review page

---

### Feature 4 — Review Timeline & Activity History

> **Goal:** GitHub-style audit trail — _what happened, when, and who did it_.

- [ ] Chronological **activity feed** per project:
  - Media uploaded
  - Comment added / replied / resolved
  - Review decision submitted (approved / changes requested)
  - Link shared (optional manual event)
  - Version uploaded (Feature 5)
- [ ] Each event: actor name, action, timestamp, link to relevant comment/version
- [ ] **Timeline view** — vertical feed suitable for client recap ("here's everything we discussed")
- [ ] Filter timeline by event type
- [ ] Export timeline as PDF or shareable read-only page (stretch)

---

### Feature 5 — Versions & Review Rounds

> **Goal:** Support real freelance workflows: v1 → feedback → v2 → approval.

- [ ] Upload new version within same project (v1, v2, v3…)
- [ ] Version label (auto: "Version 1", editable: "Rough cut", "Color grade")
- [ ] Guest link always opens **latest version** by default
- [ ] Version switcher to view older versions and their comments
- [ ] Comments scoped to version (comments on v1 don't appear on v2 player)
- [ ] **Review round** concept: each version = one round
- [ ] Per-version review decision (v1: changes requested → v2: approved)
- [ ] Compare: side-by-side or toggle between two versions (stretch)

---

### Feature 6 — Notifications

> **Goal:** Nobody has to poll the link waiting for feedback.

- [ ] Email freelancer when guest adds comment or submits decision
- [ ] Email guest when creator replies (requires guest email from Feature 1)
- [ ] Optional digest mode (instant vs daily summary)
- [ ] In-app notification bell for logged-in creators
- [ ] "Copy link" reminder if no activity after N days (creator-only nudge)

---

### Feature 7 — Guest Identity & Optional Client Accounts

> **Goal:** Better attribution without forcing signup; optional upgrade path for repeat clients.

- [ ] Guest profile: name, email, avatar (generated from initials)
- [ ] Remember guest identity across visits (same browser)
- [ ] Optional: "Save your reviews" — light signup for clients who work with multiple freelancers
- [ ] Client account: see all projects shared with their email
- [ ] Magic-link login for clients (no password required)

---

### Feature 8 — Link Security & Access Control

> **Goal:** Freelancers control who sees work-in-progress.

- [ ] Optional **password** on review link
- [ ] Optional **link expiration** date
- [ ] Revoke / regenerate link (invalidates old URL)
- [ ] View-only mode vs comment-enabled mode
- [ ] IP or domain allowlist (enterprise stretch)

---

### Feature 9 — Visual Annotations

> **Goal:** Comments that need more than words — circles, arrows, drawings on frame.

- [ ] Drawing tools on paused video frame and images: rectangle, arrow, freehand
- [ ] Annotation attached to comment + timestamp (video) or position (image)
- [ ] Toggle annotation visibility on/off
- [ ] Color-coded annotations per reviewer (when multiple guests exist)

---

### Feature 10 — Team & Workspaces

> **Goal:** Small studios, not just solo freelancers.

- [ ] Workspace (team) with multiple members
- [ ] Roles: **Owner** | **Editor** | **Viewer**
- [ ] Projects belong to workspace
- [ ] Invite members by email
- [ ] Activity attributed to team member

---

### Feature 11 — Internal vs Client-Visible Comments

> **Goal:** Creators discuss internally without exposing notes to the client.

- [ ] Comment visibility: **Internal** (team only) | **Client-visible**
- [ ] Guest page hides internal comments entirely
- [ ] Visual distinction in creator UI (lock icon, different color)
- [ ] Filter: internal / client / all

---

### Feature 12 — Multiple Reviewers on One Link

> **Goal:** Stakeholder reviews — brand manager + legal + founder, one link.

- [ ] Multiple guests can comment on same version
- [ ] Each comment shows reviewer identity
- [ ] Optional: require all reviewers to approve (unanimous) vs any one approval
- [ ] Reviewer list in project sidebar

---

### Feature 13 — Deadlines & Review Requests

> **Goal:** Proactive workflow — not just passive link sharing.

- [ ] Set **review due date** on project or version
- [ ] Banner for guest: "Review requested by [date]"
- [ ] Overdue state on creator dashboard
- [ ] Scheduled reminder emails to guest before due date

---

### Feature 14 — Project Templates & Defaults

> **Goal:** Speed for repeat freelancers.

- [ ] Save project as template (default description, checklist, branding)
- [ ] Default link settings (password, expiration)
- [ ] Reusable **review checklist** ("Logo visible?", "CTA readable?") — guest ticks items

---

### Feature 15 — Branding & White-Label

> **Goal:** Freelancers look professional; agencies resell the experience.

- [ ] Custom logo on review page
- [ ] Accent color / theme
- [ ] Custom domain (e.g. `review.studio.com`)
- [ ] Remove "Powered by Veview" (paid tier)

---

### Feature 16 — Integrations & Ingest

> **Goal:** Meet freelancers where their files already live.

- [ ] Import from URL (direct video link)
- [ ] Google Drive / Dropbox picker
- [ ] Frame.io / Vimeo import (stretch)
- [ ] Webhook on approval (Zapier, Slack, Discord)
- [ ] Public API for upload + status (Feature 17 dependency)

---

### Feature 17 — Public API & Embeds

> **Goal:** Power users and platform embeds.

- [ ] REST or Convex HTTP API: create project, upload, get comments
- [ ] API keys per workspace
- [ ] Embeddable review widget (iframe) for client portals
- [ ] Rate limits per tier

---

### Feature 18 — Analytics & Insights

> **Goal:** Freelancers understand client engagement.

- [ ] Link opens, unique viewers, time to first comment
- [ ] Watch-through heatmap (where clients pause / rewatch)
- [ ] Average time to approval per project
- [ ] Export CSV

---

### Feature 19 — Billing & Plans

> **Goal:** Sustainable product.

| Tier     | Indicative limits                                           |
| -------- | ----------------------------------------------------------- |
| **Free** | 3 active projects, 500MB per file, Veview branding          |
| **Pro**  | Unlimited projects, 5GB per file, custom branding, versions |
| **Team** | Workspaces, roles, internal comments, priority support      |

- [ ] Stripe subscription
- [ ] Usage meters (storage, active projects)
- [ ] Graceful limits with upgrade prompts

---

### Feature 20 — Mobile-Optimized Guest Experience

> **Goal:** Clients review on the couch, not at a desk.

- [ ] Touch-friendly scrubber and comment input
- [ ] Bottom sheet comment UI
- [ ] Pinch-zoom on images
- [ ] Reduced motion / data-saver mode for large videos
- [ ] Add to home screen (PWA)

---

## 7. Information Architecture (High Level)

```
/                          → Marketing / landing (later)
/login, /signup            → Freelancer auth
/dashboard                 → Project list
/projects/:id              → Creator project detail + settings
/projects/:id/review       → Creator review view (same as guest + admin)
/r/:token                  → Public guest review (no auth)
/settings                  → Account, billing, workspace
```

---

## 8. Data Model (Conceptual)

```
User (freelancer)
  └── Workspace (optional, Feature 10)
        └── Project
              ├── title, description, status
              ├── shareToken, linkSettings (password, expiresAt, revoked)
              └── Version[]
                    ├── mediaAsset (video | image)
                    ├── label, versionNumber
                    ├── Comment[]
                    │     ├── text, timestamp | pin(x,y)
                    │     ├── author (guest | user)
                    │     ├── visibility (internal | client)
                    │     ├── status (open | resolved)
                    │     └── replies[], annotations[]
                    └── ReviewDecision[]
                          ├── type (approved | changes_requested | comment)
                          ├── summary, author, createdAt

ActivityEvent[]
  └── projectId, type, actor, payload, createdAt
```

---

## 9. Non-Functional Requirements

| Area              | Requirement                                                            |
| ----------------- | ---------------------------------------------------------------------- |
| **Performance**   | Review page interactive within 2s on broadband; progressive video load |
| **Storage**       | Object storage for media (e.g. Convex file storage, R2, S3)            |
| **Security**      | Unguessable tokens; HTTPS only; auth on all creator mutations          |
| **Privacy**       | GDPR-ready: export/delete user data; clear data retention policy       |
| **Accessibility** | Keyboard controls for player; WCAG 2.1 AA for review UI (target)       |
| **Reliability**   | Comments never lost; optimistic UI with rollback on failure            |

---

## 10. UI / UX Direction

- **Aesthetic:** Clean, cinematic, dark-friendly player chrome; light dashboard for creator workflow
- **Density:** Guest UI minimal — player is hero; comments secondary until needed
- **Motion:** Subtle transitions when seeking to comment; no distracting autoplay
- **Empty states:** Guide first-time guests ("Pause the video and click Comment")
- **Status language:** Human-readable — "Waiting for client review" not `STATUS_PENDING`

Reference products (for inspiration, not copying): Frame.io, Wipster, Pastel, GitHub Pull Requests, Loom comments.

---

## 11. Success Metrics

| Metric                         | Target (6 months post-launch)                                      |
| ------------------------------ | ------------------------------------------------------------------ |
| Time to first shared link      | < 3 minutes median                                                 |
| Guest comment without drop-off | > 60% of opened links get ≥1 comment                               |
| Approval clarity               | > 80% of completed projects have explicit approve/changes decision |
| Freelancer retention           | > 40% monthly active among signups                                 |
| NPS (creators)                 | > 40                                                               |

---

## 12. Out of Scope (v1)

- Live collaborative playback (multiple users synced)
- Native iOS/Android apps
- Built-in video editing or rendering
- Automatic transcription / AI summary (future exploration)
- Real-time chat / Slack replacement
- Marketplace or freelancer discovery

---

## 13. Implementation Order (Recommended)

| Sprint / Phase | Features       | Shippable outcome                                     |
| -------------- | -------------- | ----------------------------------------------------- |
| **Phase 0**    | Feature 1      | End-to-end: upload → link → timestamp comments        |
| **Phase 1**    | Features 2–3   | Threads, resolve, approve / request changes           |
| **Phase 2**    | Features 4–5   | Timeline + versions / review rounds                   |
| **Phase 3**    | Features 6–8   | Notifications, guest identity, link security          |
| **Phase 4**    | Features 9–12  | Annotations, teams, internal comments, multi-reviewer |
| **Phase 5**    | Features 13–20 | Polish, billing, integrations, mobile, analytics      |

---

## 14. Open Questions

1. **Max file size on free tier?** — Affects storage costs and upload UX.
2. **Video transcoding?** — Required for consistent playback across browsers?
3. **Guest email: required or optional at MVP?** — Trade-off: attribution vs friction.
4. **Convex + Clerk auth?** — Aligns with workspace tooling; confirm stack.
5. **Single media per project in MVP?** — Simpler schema; albums in later phase.
6. **Comment moderation** — Can creator delete guest comments? (Recommend: yes.)

---

## 15. Glossary

| Term                | Definition                                              |
| ------------------- | ------------------------------------------------------- |
| **Project**         | Container for a deliverable and all its review activity |
| **Version**         | A specific upload within a project (v1, v2, …)          |
| **Review round**    | One cycle of feedback on one version                    |
| **Guest**           | Unauthenticated client reviewer                         |
| **Creator**         | Authenticated freelancer who owns the project           |
| **Review decision** | Explicit approve or request-changes signal              |
| **Share link**      | Public URL token that opens guest review                |

---

_This document is the source of truth for Veview feature planning. Update it as decisions are made during implementation._
