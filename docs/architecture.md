# Architecture Recommendation: Journey Mapping Website
_This document recommends a full technical stack (repo, hosting, framework, realtime, tooling) to implement `docs/requirements-journey-site.md`._

### Architecture summary (recommended)
- **Git service**: GitHub (private repo, GitHub Actions CI)
- **Frontend hosting**: Vercel (Preview Deployments per PR)
- **Frontend framework**: Next.js (React + TypeScript)
- **Content format**: MDX (render `docs/journey.md` as structured content)
- **UI system**: MUI (Material UI) with a custom theme matching `clockwork.com`
- **Realtime backend**: Supabase (Postgres + Realtime + Edge Functions)
- **Auth**: none for participants (session code + per-participant secret stored client-side); host/admin actions via Supabase Edge Function token
- **Observability**: Sentry (frontend) + Supabase logs; optional PostHog for usage analytics
- **DNS / TLS**: Cloudflare DNS + managed TLS on Vercel

---

## Key decisions and why

### Static-first frontend + managed realtime backend
The site should deploy as static assets (no custom server to render pages), while realtime collaboration requires a backend. The recommended approach:
- Pre-render the journey content and marketing/presentation pages.
- Run the live session experience as client-side React that talks to Supabase (realtime subscriptions).

This satisfies “static to deploy” while still enabling “everyone sees changes live”.

### Next.js (React + TypeScript)
- **Pros**
  - Great ergonomics for content + app screens (routing, layouts).
  - Excellent deployment story on Vercel.
  - MDX support for turning the journey into structured sections.
- **Cons**
  - More framework than a pure static generator; requires discipline to keep the site “static-first”.

### MUI (Material UI) with Clockwork-aligned theming
You asked to “material it up”. MUI provides fast, accessible components (Cards, Lists, Chips, Tabs) while allowing deep theming to match `clockwork.com`:
- High-contrast typography (black/white)
- Bold headings and large type scales
- Signature accent usage (yellow sections; blue CTAs)

### Supabase for realtime + persistence
Supabase provides:
- Postgres as the source of truth (sessions, participants, mappings)
- Realtime subscriptions for “live changes”
- Edge Functions for privileged actions without exposing secrets in the static frontend

---

## System architecture (high level)

### Components
- **Web app (Next.js)**: renders journey content + session UX + presentation wallboard
- **Supabase Postgres**: stores sessions/participants/mappings
- **Supabase Realtime**: broadcasts mapping changes to connected clients
- **Supabase Edge Functions**: host-only actions (create/close/reset/export), protected by an admin token

### Data flow (typical session)
1. Host creates a session (Edge Function) → returns sessionId + joinCode + adminToken.
2. Participant joins with joinCode → creates participant row and receives participantSecret (client-stored).
3. Participant toggles “Doing” on an item → update mapping row → Realtime pushes change to all clients.
4. Wallboard subscribes to session updates and renders live aggregates.

---

## Data model (recommended)
Aligns with the requirements doc (simplified “Doing” boolean):
- **sessions**
  - `id`, `join_code`, `status`, `title`, `created_at`, `closed_at`
- **participants**
  - `id`, `session_id`, `display_name`, `avatar_color`, `participant_secret_hash`, `joined_at`, `last_seen_at`
- **mappings**
  - `session_id`, `participant_id`, `item_id`, `is_doing`, `updated_at`
- **journey_items**
  - `item_id`, `phase_id`, `label`, `sort_order` (seeded from `docs/journey.md`)

Notes:
- `participant_secret_hash` supports “no auth” while preventing arbitrary edits.
- `join_code` should be human-friendly (e.g., 6–8 chars) and unique.

---

## Security model (practical v1)
- **Session access**: join requires `join_code`.
- **Participant write access**: participant can only update rows matching their `participant_id` + valid `participant_secret`.
- **Host/admin access**: admin endpoints require `adminToken` (never stored in public links; stored on host device).
- **Rate limiting**: debounce toggles client-side; add minimal server-side guards in Edge Functions if needed.

Implementation notes for “no auth”:
- Client stores `participant_id` + `participant_secret` in localStorage.
- Writes are validated either via:
  - Edge Functions (strongest), or
  - Postgres RLS using a custom JWT / signed token approach (more complex).
For v1 simplicity, prefer **Edge Functions for writes** and keep realtime subscriptions read-only.

---

## Frontend application structure (recommended)
- **Public journey** (no session)
  - `/` (landing)
  - `/journey` (rendered journey)
- **Session**
  - `/s/:code` join flow
  - `/session/:id` participant view (toggle “Doing”)
  - `/present/:id` wallboard view (big-screen)
  - `/admin/:id` host controls (create/close/reset/export)

---

## CI/CD and environments

### GitHub repo setup
- **Default branch**: `main`
- **Workflow**: trunk-based (small PRs, merge to main)
- **Branch protections**
  - Require CI checks and review before merge

### CI (GitHub Actions)
- `lint` (ESLint)
- `format` (Prettier check)
- `test` (unit tests)
- optional `e2e` (Playwright) for core join/toggle flows

### Environments
- **Preview**: per-PR deployments (Vercel)
- **Staging**: optional (for rehearsals)
- **Production**: main branch deploys

---

## Recommended libraries and tooling
- **Language**: TypeScript
- **UI**: MUI + custom theme
- **State**: React state + minimal store (Zustand) if needed
- **Data fetching**: Supabase JS client
- **Realtime**: Supabase Realtime channels / postgres_changes
- **Testing**
  - Unit: Vitest + React Testing Library
  - E2E: Playwright (join flow + live update smoke test)
- **Formatting**: Prettier
- **Linting**: ESLint

---

## Hosting and infrastructure
- **Vercel**
  - Static-first pages and client app
  - Environment variables for Supabase URL and public anon key
- **Supabase**
  - Database + realtime + Edge Functions
  - Separate project per environment (staging/prod) if needed
- **Cloudflare**
  - DNS + optional WAF protections

---

## Alternatives (acceptable swaps)
- **Frontend framework**
  - Astro + React islands (excellent static-first content) instead of Next.js
  - Vite + React Router (simpler, fully static SPA) if MDX needs are minimal
- **Realtime backend**
  - Firebase (Firestore + realtime listeners)
  - Ably/Pusher (realtime transport) + a separate datastore
- **Hosting**
  - Netlify (static hosting + functions)

---

## Open decisions to confirm
- Target audience size is ~20 → optimize for simplicity over extreme scale.
- Wallboard is **aggregate-only** (no individual participant roster).
- Whether host controls need moderation (kick user) in v1.


