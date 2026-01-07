# Requirements: Journey Mapping Website (Static + Live Collaboration)
_Purpose: define requirements for a website that presents the LLM journey clearly and supports real-time self‑mapping during presentations._

### Summary
Build a **static website** that displays the “Common Software Engineer LLM Journey” content in a clear, scannable format and adds **real-time collaborative features** so multiple people can self-identify where they are on the journey during a live presentation, with everyone seeing updates immediately.

### Goals
- **Readable journey**: Make `docs/journey-better.md` easy to read, scan, and reference on any device.
- **Live self-mapping**: Allow multiple participants to indicate what they’re doing across the journey.
- **Audience visibility**: Provide a “presentation view” that shows the group’s live state (who is where) at a glance.
- **Clockwork brand alignment**: Match the look/feel of `clockwork.com` (typography, contrast, color usage, spacing, tone).

### Non-goals (for the first version)
- Replacing a full learning-management system or HR competency tracker
- Complex user profile management (resume-like histories, endorsements, etc.)
- Long-term analytics dashboards (basic export is OK; deep BI can be later)

---

## Users & contexts
- **Presenter (host)**: Runs the session during a talk/workshop; wants a clean “wallboard” view.
- **Participant**: Joins from their device; marks where they are.
- **Observer**: Watches the aggregated results (in-room display or personal device).

---

## Information architecture (pages)
- **Landing page**
  - Brief explanation of the journey and the live session concept.
  - Primary CTAs: “View Journey” and “Join Session”.
- **Journey page**
  - Displays the phases and their items (from the journey doc).
  - Supports per-item “Doing” toggles (when in a session).
- **Join session page**
  - Enter session code/link, choose display name, choose a color/avatar.
- **Presentation view (wallboard)**
  - Optimized for big screens; shows **aggregate** session activity live.
- **Session admin (host controls)**
  - Create/close session, clear results, export, moderation (optional for v1).

---

## Core functionality

### 1) Journey content display
- **Source of truth**: The journey content comes from `docs/journey-better.md` (or an extracted JSON derived from it).
- **Readable layout**
  - Clear phase navigation (sticky phase list or top tabs).
  - Each phase shows: title, focus line, bullets, “what to watch for”.
- **Collapsible density**
  - Ability to collapse/expand phases and sub-sections for quick scanning.
- **Permalinks**
  - Each phase and major subsection has a shareable anchor link.

### 2) Self-mapping (participant interaction)
- **Per-item status**
  - Each journey item supports a single state: **Doing** (on/off).
  - Toggling updates instantly for all viewers in the same session.
- **Per-phase summary**
  - Automatically compute per-phase counts of “Doing” toggles for each participant (for summary UI).
- **Identity**
  - Participants can select:
    - Display name (required)
    - Optional avatar color/icon

### 3) Live changes (real-time collaboration)
- **Real-time sync**
  - All mapping changes appear for all connected users within ~1 second.
- **Presence**
  - Show who is currently connected (count + optional list).
- **Conflict handling**
  - A participant can only edit their own mapping.
  - If a participant opens multiple devices, the last update wins.

### 4) Presentation mode (audience-friendly view)
- **Wallboard layout**
  - Wallboard shows **aggregate-only** information (no individual participant roster).
- **Aggregate view**
  - Show totals per phase (e.g., count of participants with “Doing” in each phase).
  - Optional “heatmap” for items (popular items light up).
- **Fullscreen + kiosk**
  - Fullscreen-friendly UI with large typography and high contrast.
  - Optional “auto-hide controls” for clean display.

---

## Session management
- **Create session**
  - Host creates a session and receives a link + short code.
- **Join session**
  - Participants join via link or code.
- **Session states**
  - Open / closed.
  - When closed, new joins are blocked; existing viewers can still see final state.
- **Clear results**
  - Host can clear all results for the session (with confirmation).
- **Export**
  - Export aggregate results to JSON/CSV.
  - Export includes session + participant + mapping data.

---

## Data model (conceptual)
- **Session**
  - id, createdAt, status, title (optional), hostKey/adminToken (implementation detail)
- **Participant**
  - id, sessionId, displayName, avatarColor, joinedAt, lastSeenAt
- **Mapping**
  - participantId, itemId, isDoing (boolean), updatedAt
- **Journey item**
  - stable `itemId` per bullet (derived from phase + text slug, or explicit IDs)

---

## “Static site” constraint (technical requirements)
The website should be deployable as static assets (HTML/CSS/JS) but may use a **managed real-time backend service** (e.g., hosted database with realtime subscriptions) to support live collaboration.

- **Static hosting compatible**
  - Deployable to a static host/CDN.
- **Real-time transport**
  - Use managed realtime subscriptions (WebSocket under the hood is fine).
- **No server required to render pages**
  - Pages should not require a custom server to load and render.

---

## Security, safety, and moderation
- **Access control**
  - A session code/link should be required to join a session.
  - Only host can clear results/close/export.
- **Abuse prevention**
  - Basic rate limiting / debouncing on rapid toggles.
  - Optional: host “remove participant” control (v1.1 if needed).
- **Data retention**
  - Session data is retained until the host presses **Clear results**.

---

## Accessibility & usability
- **WCAG-minded**
  - Keyboard navigable, visible focus states, semantic headings, sufficient contrast.
- **Mobile-friendly**
  - Participant workflow must work smoothly on phones.
- **Low cognitive load**
  - Toggling should be obvious; statuses should be distinguishable without relying only on color.

---

## Brand & design requirements (Clockwork alignment)
Match `clockwork.com`’s overall feel:
- **High contrast**: heavy use of white space + black typography.
- **Bold hero moments**: large, confident type for key headings.
- **Primary accent**: use Clockwork’s signature **yellow** for hero/section emphasis (not everywhere).
- **Action accent**: use a strong **blue** for primary CTA actions (e.g., “Create session”, “Join”, “Present”).
- **Simple geometry**: subtle circular/graphic accents are acceptable if they reinforce clarity.

The site should feel like a Clockwork property, not a generic dashboard.

---

## Success criteria
- A presenter can start a session in < 30 seconds and share a link/code.
- Participants can join in < 15 seconds and start mapping immediately.
- The presentation view updates live and remains readable from a distance.
- The journey content remains easy to read even without using session features.

---

## Open questions (to resolve with Jay)
- Should sessions require any authentication, or is “link + name” sufficient?
- Should mapping be per-bullet only, or also allow “I’m currently in Phase X” as a single quick selector?
- Offline behavior: queue toggles locally or block edits until reconnected?


