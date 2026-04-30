# AGENTS.md — Project Guide for Building “Journey Mapping Website”
_This file defines how we build this project: architecture principles, quality standards, and a test-first development workflow._

### North Star
We are building a **high-quality**, **well-architected** system (not quick patches). Changes should be easy to review, well-tested, and consistent with modern best practices.

### Source documents (product + architecture)
- `docs/requirements.md`
- `docs/architecture.md`
- `docs/prds/` (implementation slices)

---

## Engineering principles
- **Prefer clarity over cleverness**: readable code and explicit naming beat “magic”.
- **Small, composable modules**: isolate concerns (UI, domain logic, data access).
- **Deterministic behavior**: avoid hidden state; make data flow explicit.
- **Accessibility is not optional**: keyboard, focus, contrast, semantics.
- **Performance by default**: avoid unnecessary rerenders, over-fetching, and client bloat.

---

## Test-first and quality requirements (non-negotiable)
Automated tests are a **core deliverable** for every feature.

### Unit tests (required)
- Add unit tests for:
  - parsing/transforming journey content into `itemId`s
  - any session/mapping domain logic (aggregations, summaries, sorting)
  - UI logic that can regress easily (e.g., toggle behavior, collapse state)
- Prefer pure functions and dependency injection to keep unit tests fast and stable.

### Integration tests (recommended)
- Add integration tests for:
  - Supabase client wrappers (mocked network responses)
  - data flow boundaries (e.g., “toggle → optimistic UI → persisted state”)

### E2E tests (where applicable; required for critical flows)
Use Playwright for key user journeys:
- **Join session** (enter code, set display name)
- **Toggle Doing** (change propagates)
- **Wallboard updates** (second browser sees live change)
- **Host reset** (clears mappings; all clients update)

### Definition of Done (DoD)
A PR is “done” only when:
- feature works per PRD acceptance criteria
- unit tests are added/updated
- e2e tests are added/updated when the feature affects critical flows
- no regressions in existing tests
- code is typed, linted, and formatted

---

## Architecture conventions (expected)
The architecture doc recommends: **Next.js + TypeScript + MUI + Supabase**.

### Frontend structure
- Keep **domain logic** separate from components (e.g., `domain/`, `lib/`).
- Keep **data access** in a single layer (e.g., `data/`), not scattered across components.
- Use **stable IDs** for journey items (`itemId`) and test their generation.

### Realtime and side effects
- Prefer a single subscription module per session, with explicit cleanup.
- Use optimistic UI sparingly and always back it with server confirmation rules.
- Handle reconnect states explicitly (loading/reconnecting banners).

---

## PR and implementation workflow
- **Start from PRDs**: implement in PRD order unless Jay directs otherwise.
- **Thin vertical slices**: ship the smallest end-to-end increment that’s useful.
- **Explain decisions**: update docs when architecture or product decisions change.
- **Keep the process log current**: after each user-guided step (decision or implementation), append an entry to `docs/our-process-log.md`.
- **No speculative work**: implement what’s required and verified by tests.

### Code review checklist
- Correctness: edge cases, race conditions, offline/reconnect behavior
- Tests: meaningful coverage, not just snapshots
- Accessibility: keyboard/focus/contrast
- Security: session token handling, least privilege
- Maintainability: clear naming, minimal coupling

---

## What to do when requirements change
- Update the relevant PRD(s) and/or `docs/requirements.md`.
- Add a new entry to `docs/our-process-log.md` capturing the decision and impact.
- Adjust tests to reflect the new behavior and prevent regressions.


