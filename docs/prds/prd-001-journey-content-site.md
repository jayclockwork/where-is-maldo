# PRD 001 — Journey Content Site (Static + Clockwork-aligned)

### Problem
The journey content exists as a Markdown document (`docs/journey-better.md`), but it is not optimized for:
- fast scanning during a presentation,
- easy navigation via links, and
- a branded, polished reading experience.

### Goal
Deliver a **static-first** website experience that renders the journey in a **clear, easy-to-read, Clockwork-aligned** format and provides the UI foundation used by later “live session” PRDs.

### Non-goals
- Live sessions or realtime updates (covered in PRD 002+)
- User authentication
- Analytics dashboards

---

## Users
- **Reader**: wants to understand the journey quickly.
- **Presenter**: wants a reliable page to reference live, with strong readability at distance.

---

## User stories
- As a reader, I can navigate phases quickly and share links to a specific phase.
- As a presenter, I can collapse/expand content to match my talk track.
- As a reader, I can view the journey comfortably on mobile.

---

## Requirements

### Content rendering
- Render journey content from `docs/journey-better.md` (or a build-time generated JSON derived from it).
- Preserve structure:
  - Phase title
  - Focus line (italic)
  - Bullets and sub-bullets
  - “What to watch for”
  - “Quick self-check”

### Navigation
- Sticky phase navigation (sidebar on desktop; top tabs or dropdown on mobile).
- Anchor links for each phase (copy link).
- “Back to top” affordance.

### Readability controls
- Expand/collapse:
  - Collapse all phases
  - Expand all phases
  - Per-phase toggle
- Text should reflow cleanly for narrow screens.

### Design (Clockwork alignment)
- Apply high-contrast, generous whitespace, and bold heading styles consistent with `clockwork.com`.
- Use signature **yellow** as a hero/section accent (not full-page saturation).
- Use a strong **blue** for primary CTAs (even if minimal in this PRD).
- Use MUI components and theme overrides (Typography scale, palette, spacing, Card styles, buttons).

### Performance & accessibility
- Lighthouse-oriented:
  - Fast load (static assets)
  - Proper heading hierarchy
  - Visible focus states
  - Keyboard navigable phase nav
  - Contrast meets WCAG AA

---

## UX notes
- Default view: show all phases expanded (unless user chooses collapse).
- Presenters should be able to “collapse all” and then open the current phase.
- Phase headings should be visually strong and easy to locate.

---

## Success metrics
- A user can reach any phase in ≤ 2 interactions from the top of the page.
- Mobile usability: no horizontal scrolling; text remains legible.
- Lighthouse Accessibility score ≥ 90 (target).

---

## Acceptance criteria
- Journey page renders all phases from `docs/journey-better.md`.
- Each phase has a working anchor link.
- Collapsing/expanding works without layout jank.
- Styling clearly reflects Clockwork’s brand cues (contrast, typography, accent usage).

---

## Dependencies
- Final confirmation of primary brand cues to mirror from `clockwork.com` (typography + color usage).
- Agreement on whether this is a single-page journey or includes a minimal landing page.

---

## Risks & mitigations
- **Risk**: Markdown parsing loses structure (e.g., italic focus lines).
  - **Mitigation**: Use MDX or a structured transformation step (remark/rehype) with tests.
- **Risk**: “Clockwork-aligned” theme drifts over time.
  - **Mitigation**: Centralize theme tokens and document usage.


