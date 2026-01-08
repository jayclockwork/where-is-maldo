# PRD 004 — Host/Admin Controls + Export + Ops

### Problem
To run live sessions smoothly, a presenter needs basic administrative controls (create/close/reset) and a way to export results afterward. Without this, sessions can’t be reliably managed during presentations.

### Goal
Provide a host/admin experience that enables:
- creating sessions,
- clearing results,
- exporting results,
- and basic operational safety (confirmations, guardrails).

### Non-goals
- Moderation tooling beyond basics (kick/ban can be later)
- Authentication systems for participants
- Complex analytics dashboards

---

## Users
- **Host (presenter/admin)**: manages the session lifecycle.

---

## User stories
- As a host, I can create a session and get a join link/code.
- As a host, I can clear results (clear mappings) with confirmation.
- As a host, I can export results after the session.

---

## Requirements

### Host access model (v1)
- Host controls require an **admin token** (generated at session creation).
- Admin token is:
  - displayed once to the host (or embedded in a host-only link),
  - stored on the host device (localStorage is acceptable for v1),
  - never required for participants.

### Create session
- Host can create a session with optional:
  - title
- System returns:
  - join code
  - join link
  - wallboard link
  - admin link/token

### Clear results
- Host can clear all results for the session (clear mappings).
- Must include:
  - a confirmation dialog
  - a “type to confirm” or double-confirm for safety (recommended)

### Export
- Host can export:
  - **JSON** (canonical)
  - optional **CSV** (aggregate per phase/item)
- Export contents (minimum):
  - session metadata
  - participant list (display name + avatar color)
  - mappings (participant → item → isDoing)
  - timestamps where available

### Operational guardrails
- Basic debounce/rate limiting on host actions.
- Clear error states for:
  - invalid token
  - session not found
  - session closed
  - export failures

---

## UX notes
- Host view should be minimal and “presentation safe”.
- Make destructive actions visually distinct (e.g., outlined/secondary styling).
- Prefer a single “Control Center” page for the host with:
  - session info
  - buttons for close/reset/export
  - quick links for join + wallboard

---

## Success metrics
- Host can start a session and get the join code/link in < 30 seconds.
- Reset requires explicit confirmation and cannot be triggered accidentally.
- Export is reliable and completes within a few seconds for typical sessions.

---

## Acceptance criteria
- Host can create a session and retrieve join/wallboard/admin links.
- Reset clears existing mappings and updates all connected clients.
- Export produces a valid JSON file with expected contents.

---

## Dependencies
- Session + mapping data model from PRD 002.
- Edge Functions (or equivalent) for privileged host actions (per `docs/architecture.md`).

---

## Risks & mitigations
- **Risk**: Host token leaked (e.g., presenter shares wrong link).
  - **Mitigation**: visually distinguish join vs admin links; require confirm for destructive actions; optionally rotate token later.
- **Risk**: Export format becomes unstable.
  - **Mitigation**: version the export schema (e.g., `schemaVersion: 1`).

---

## Open questions
- Do we need moderation (“remove participant”) for the first live events?


