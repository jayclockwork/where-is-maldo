# PRD 003 — Presentation Wallboard (Live Group View)

### Problem
In a live presentation, the audience needs a shared view showing the group’s self-mapping in real time. Individual participant devices are not suitable for “room visibility”.

### Goal
Provide a **wallboard/presentation mode** that renders a big-screen friendly, live-updating view of session activity: who is participating and where “Doing” activity is concentrated.

### Non-goals
- Editing mapping from the wallboard (read-only)
- Privacy modes (out of scope)
- Advanced analytics dashboards

---

## Users
- **Presenter (host)**: projects the wallboard.
- **Audience/observers**: see the live group state.

---

## User stories
- As a presenter, I can open a wallboard view for a session and project it.
- As an observer, I can understand “where the room is” in < 5 seconds.
- As a presenter, I can toggle fullscreen and keep the view clean.

---

## Requirements

### Wallboard layout (big-screen)
- Must be readable at distance:
  - large typography
  - high contrast
  - minimal clutter
- Shows:
  - session title/code (optional)
  - participant count
  - last update indicator (optional)

### Live participant roster
- Display participant cards/rows including:
  - display name
  - avatar color/icon
  - a compact indicator of current activity (see below)
- Sorting:
  - default: most recently active first
  - optional: alphabetical

### “Where am I active?” indicator
Because mapping is per-item “Doing”, the wallboard should summarize:
- **Per participant**: the phase with the highest count of “Doing” toggles (highlight that phase label)
- **Per phase (aggregate)**: total number of “Doing” toggles across all participants in that phase

### Aggregate visualization
Choose at least one aggregate visualization:
- **Phase bar chart**: phases as horizontal bars with counts (simple, readable)
- Optional **heat list**: top N journey items by number of participants marked “Doing”

### Realtime behavior
- Wallboard updates within ~1 second of participant toggles.
- Wallboard handles reconnects gracefully (shows “reconnecting…” state).

### Fullscreen / kiosk
- Fullscreen button.
- Optional “kiosk mode” query param to hide UI chrome for clean projection.

---

## UX notes
- Avoid tiny icons; prioritize “glanceable” shapes and labels.
- Keep the color system accessible; color supports meaning but does not carry it alone.
- For large audiences, prefer aggregate-first views with optional roster paging.

---

## Success metrics
- Observers can identify the most active phase in < 5 seconds.
- Wallboard remains stable and readable during continuous updates.

---

## Acceptance criteria
- Wallboard loads for a given session and subscribes to live updates.
- Participant roster shows joined participants with visible identifiers.
- Aggregate phase counts update as participants toggle “Doing”.
- Fullscreen works and doesn’t break layout.

---

## Dependencies
- Live sessions + mapping from PRD 002.
- Stable mapping of journey items → phases.

---

## Risks & mitigations
- **Risk**: Wallboard becomes unreadable with 100+ participants.
  - **Mitigation**: roster paging/virtualization; aggregate-first mode.
- **Risk**: Visual noise from constant updates.
  - **Mitigation**: subtle animations; coalesce updates.

---

## Open questions
- Should we always show individuals, or switch to aggregate-only above a threshold (e.g., > 50 participants)?


