# PRD 002 — Live Sessions + Participant Mapping (Realtime “Doing” Toggles)

### Problem
During a presentation, participants need a fast way to self-map on the journey and see **live updates** from others. Today the journey is static content only.

### Goal
Enable **live sessions** where participants can join via a code/link and toggle **Doing** on specific journey items, with changes visible to all participants and the presentation wallboard in near real-time.

### Non-goals
- “Done” state (explicitly out of scope)
- Privacy controls / anonymous modes (explicitly out of scope)
- Complex authentication (participant auth beyond session join is not required for v1)
- Host admin controls (close session, export, etc.) — **PRD 004**
- Wallboard presentation UX — **PRD 003** (this PRD focuses on correctness/data + participant session UX)

---

## Users
- **Host**: creates a session and shares join info.
- **Participant**: joins session and toggles “Doing”.
- **Observer**: sees aggregate activity (wallboard is PRD 003; basic observer behavior covered here for data correctness).

---

## User stories
- As a host, I can create a session and get a join link/code.
- As a participant, I can join a session quickly and choose a display name.
- As a participant, I can mark any journey item as “Doing” (on/off).
- As a participant, I immediately see others’ changes reflected in my UI.
- As a host, I can close a session to prevent new joins (host controls detailed in PRD 004).

---

## Requirements

### Session creation and joining
- **Create session**
  - System generates `sessionId` and a human-friendly `joinCode`.
  - Session status starts as **open**.
- **Join session**
  - Participant enters join code (or uses link) and provides:
    - display name (required)
    - avatar color (required; chosen from a preset palette; unique per session)
  - Participant is added to the session roster.

### Avatar color palette (shared pool)
- The join UI shows a preset palette with **20+ colors**.
- Once a participant selects a color, it becomes **unavailable** to other participants in that session.

### Mapping model (single state)
- Each **session-level** journey unit supports a single status: **Doing** (boolean on/off).
- In v1 session UX, toggles live on **section headings** (e.g., “Basic research”), not on every bullet.
- The system persists each participant’s “Doing” toggles per session unit.

### Live updates (realtime)
- When any participant toggles “Doing”:
  - The change is persisted.
  - The change is broadcast to all connected clients in the session.
  - Target latency: updates appear within ~1 second.

### Participant UI (in-session journey view)
- Participants can browse phases and items (reusing PRD 001 structure).
- Each item has a clear “Doing” toggle control.
- Provide a lightweight “presence” indicator:
  - participant count
  - optional list of names (scrollable)

### Conflict and correctness rules
- A participant can only update their own mapping.
- If the same participant is active on multiple devices, last write wins.
- If realtime connection drops:
  - UI indicates offline/reconnecting state
  - **Decision for v1**: block edits while disconnected (disable toggles) rather than queueing
  - state re-syncs on reconnect

---

## UX notes
- The “Doing” toggle must be large and unambiguous (not a tiny checkbox).
- Status should be distinguishable without relying on color only (e.g., icon + label).
- Debounce rapid toggles to prevent accidental spam.

---

## Success metrics
- Median join time (link → active participant) < 15 seconds.
- Realtime propagation within ~1 second for typical audiences (target audience size: ~20).
- Participants can meaningfully self-map without instructions beyond “join + toggle what you’re doing.”

---

## Acceptance criteria
- Host can create a session and share a join code/link.
- Participant can join with display name.
- Participant must pick an avatar color; selected colors are unavailable to others in that session.
- Participant can toggle “Doing” on any item and see it reflected on refresh.
- A second participant (or observer) sees the toggle change live.
- If realtime connection is down, the UI indicates it and toggles are disabled until reconnected.
- No “Done” option exists anywhere in the UI or data model.

---

## Dependencies
- A stable set of `itemId`s for each journey bullet (derived from `docs/journey-better.md`).
- Realtime backend capability (per `docs/architecture.md` recommendation).

---

## Risks & mitigations
- **Risk**: Unwanted edits if join link/code leaks.
  - **Mitigation**: make join codes non-trivial; allow host to close session; optionally rotate code (later).
- **Risk**: Scale issues with large audiences.
  - **Mitigation**: optimize subscriptions (session-scoped), aggregate views for wallboard (PRD 003).

---

## Open questions
- None (v1 decision: block edits while disconnected; revisit queueing if needed).

