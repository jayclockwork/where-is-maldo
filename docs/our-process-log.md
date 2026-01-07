# Our Process Log (User-Guided, Append-Only)
_This document is intentionally **not** a pre-planned roadmap. It records only the steps Jay guides the assistant through, as they happen._

### Purpose
- **Record**: Capture each user-guided step, what we changed, and what we learned.
- **Traceability**: Make it easy to answer “why did we do this?” later.
- **Continuity**: Keep momentum across sessions without relying on chat history.

### How this doc is used
- **Source of truth**: This file is updated after each user-guided step is completed (or intentionally paused).
- **No prediction**: We do not add future steps. We only log what you explicitly direct.
- **Append-only**: We add new entries at the bottom. We do not rewrite history (except to fix typos).
- **Decisions + implementation**: We log key steps whether they are **decision-making** (direction, scope, priorities) or **implementation** (writing/changing files).

---

### Entry template (copy/paste for each step)

#### Step N — <short title>
- **Date/Time**: <YYYY-MM-DD HH:MM local>
- **Step type**: <Decision | Implementation | Both>
- **User guidance** (what Jay asked for):
  - <verbatim-ish summary>
- **Decision(s) recorded**:
  - <decision + rationale, or “n/a”>
- **Clarifications / assumptions**:
  - <questions asked + answers, or “none”>
- **Plan executed** (what the assistant did):
  - <high-level actions, in the order done>
- **Files changed**:
  - <path> — <what changed>
- **Commands / tools used**:
  - <commands run, if any>
- **Outcome**:
  - <what is now true; what was delivered>
- **Open questions / follow-ups for Jay**:
  - <items requiring user direction>

---

### Process log

#### Step 1 — Create a living process log document
- **Date/Time**: 2026-01-07
- **User guidance** (what Jay asked for):
  - Create a document to describe our process; do not predict it; document only the steps Jay guides through.
- **Clarifications / assumptions**:
  - Assumption: A “process” doc should be a living log + a standard entry template, updated incrementally.
- **Plan executed** (what the assistant did):
  - Created this append-only log with a reusable entry template.
- **Files changed**:
  - `docs/our-process-log.md` — added
- **Commands / tools used**:
  - none
- **Outcome**:
  - A blank-but-usable log exists; future steps will be appended as Jay directs.
- **Open questions / follow-ups for Jay**:
  - Do you want this log to capture **only** implementation steps, or also “discussion/decision” steps?

#### Step 2 — Create `journey-better.md` via compare/contrast + iterative revision
- **Date/Time**: 2026-01-07
- **Step type**: Both
- **User guidance** (what Jay asked for):
  - Compare and contrast the two docs and create a new, better version.
  - Switch the “better version” to use the phases ChatGPT generated.
- **Decision(s) recorded**:
  - Use the ChatGPT phase headings as the primary structure for the consolidated journey doc.
- **Clarifications / assumptions**:
  - Assumption: “Better version” means a single consolidated doc with clearer structure, less redundancy, and the strongest ideas preserved from both sources.
- **Plan executed** (what the assistant did):
  - Read both source docs and summarized the key differences (capabilities inventory vs. maturity model).
  - Drafted a merged doc (`docs/journey-better.md`) that combined coverage and improved clarity.
  - Revised `docs/journey-better.md` to use the ChatGPT phase headings as the primary structure while preserving concise “focus” framing, guardrails, and a quick self-check.
- **Files changed**:
  - `docs/journey-better.md` — added and then restructured to use ChatGPT phases
- **Commands / tools used**:
  - none
- **Outcome**:
  - A consolidated journey doc exists that uses the preferred phase structure and captures the most useful content from both drafts.
- **Open questions / follow-ups for Jay**:
  - none

#### Step 3 — Expand the process log to include decision steps
- **Date/Time**: 2026-01-07
- **Step type**: Decision
- **User guidance** (what Jay asked for):
  - Capture key steps whether they are implementation or decision.
- **Decision(s) recorded**:
  - The process log will track both **decision-making steps** and **implementation steps**.
- **Clarifications / assumptions**:
  - none
- **Plan executed** (what the assistant did):
  - Updated the “How this doc is used” section to explicitly include decisions.
  - Updated the entry template to include “Step type” and “Decision(s) recorded”.
  - Marked Step 2 as “Both” and recorded the key decision it captured.
- **Files changed**:
  - `docs/our-process-log.md` — clarified scope + expanded template
- **Commands / tools used**:
  - none
- **Outcome**:
  - Future entries can cleanly record decisions (direction) even when no code changes occur.
- **Open questions / follow-ups for Jay**:
  - none

#### Step 4 — Create requirements for the Journey Mapping website (static + live)
- **Date/Time**: 2026-01-07
- **Step type**: Both
- **User guidance** (what Jay asked for):
  - Create a requirements document for a static website that displays the journey clearly.
  - Add features for live self-mapping during presentations (check off what people have done/are doing).
  - People should see live changes by others on the site.
  - Match the brand/design of `clockwork.com`.
- **Decision(s) recorded**:
  - The site will be **static to deploy** (static assets) while using a **managed realtime backend** to support live updates.
  - The UI will align to Clockwork’s visual language (high contrast, bold type, signature yellow, blue CTAs).
- **Clarifications / assumptions**:
  - Assumption: “Static website” means static hosting for the frontend; realtime collaboration may be powered by a hosted service.
- **Plan executed** (what the assistant did):
  - Inspected `clockwork.com` to capture high-level brand cues to reference in requirements.
  - Wrote a requirements document covering: pages, session flows, realtime behavior, privacy, presentation mode, and success criteria.
- **Files changed**:
  - `docs/requirements-journey-site.md` — added
- **Commands / tools used**:
  - Browser snapshot/screenshot of `clockwork.com` (for design alignment)
- **Outcome**:
  - A v1 requirements doc exists for a journey site with presentation-friendly realtime self-mapping.
- **Open questions / follow-ups for Jay**:
  - Audience size expectations (10 vs 50 vs 200+)?
  - Anonymous-by-default or named-by-default?

#### Step 5 — Simplify self-mapping: remove “Done” and privacy controls
- **Date/Time**: 2026-01-07
- **Step type**: Both
- **User guidance** (what Jay asked for):
  - Get rid of per-item state “Done”.
  - We don't need privacy controls.
- **Decision(s) recorded**:
  - Self-mapping will use a single per-item **Doing** state (no Done).
  - The product will not include privacy modes.
- **Clarifications / assumptions**:
  - none
- **Plan executed** (what the assistant did):
  - Updated requirements to remove all references to “Done” and convert mapping to a “Doing” toggle.
  - Removed privacy controls and anonymization references from participant flow, data model, and exports.
- **Files changed**:
  - `docs/requirements-journey-site.md` — simplified mapping + removed privacy controls
- **Commands / tools used**:
  - none
- **Outcome**:
  - Requirements now describe a simpler live mapping model with fewer UX states and less complexity.
- **Open questions / follow-ups for Jay**:
  - none

#### Step 6 — Recommend the full architecture / tech stack
- **Date/Time**: 2026-01-07
- **Step type**: Both
- **User guidance** (what Jay asked for):
  - Create an architecture document recommending git service, hosting service, frameworks, and the overall tech stack.
- **Decision(s) recorded**:
  - Use GitHub for repo + CI, Vercel for hosting, Next.js + TypeScript for the frontend, MUI with Clockwork-aligned theming for UI, and Supabase for realtime + persistence.
- **Clarifications / assumptions**:
  - Assumption: “Static website” means static-first deployment of the frontend without running a custom server; realtime collaboration is provided via a managed backend service.
- **Plan executed** (what the assistant did):
  - Wrote an architecture recommendation including: stack choices, data model, security model, CI/CD, environments, and alternatives.
- **Files changed**:
  - `docs/architecture.md` — added
- **Commands / tools used**:
  - none
- **Outcome**:
  - A complete v1 architecture/stack recommendation is documented and aligned to the requirements.
- **Open questions / follow-ups for Jay**:
  - Expected audience size and whether wallboard should show individuals vs. aggregates at scale.

#### Step 7 — Create PRDs to build the system
- **Date/Time**: 2026-01-07
- **Step type**: Implementation
- **User guidance** (what Jay asked for):
  - Create a set of PRDs to build this system and put them under `docs/` in a subdirectory.
  - Ensure the process log is updated.
- **Decision(s) recorded**:
  - Slice the build into incremental PRDs: static journey foundation → live sessions/mapping → wallboard → host/admin/export.
- **Clarifications / assumptions**:
  - none
- **Plan executed** (what the assistant did):
  - Created `docs/prds/` with an index.
  - Wrote PRDs 001–004 covering the system in build order.
- **Files changed**:
  - `docs/prds/README.md` — PRD index and cross-cutting constraints
  - `docs/prds/prd-001-journey-content-site.md` — static journey reading experience
  - `docs/prds/prd-002-live-sessions-and-mapping.md` — live sessions + realtime “Doing” toggles
  - `docs/prds/prd-003-presentation-wallboard.md` — presentation wallboard view
  - `docs/prds/prd-004-host-admin-and-export.md` — host controls + export
- **Commands / tools used**:
  - none
- **Outcome**:
  - A PRD set exists to drive implementation in clear increments.
- **Open questions / follow-ups for Jay**:
  - Confirm whether “close session” should be reversible in v1 (PRD 004).

#### Step 8 — Add `AGENTS.md` to define development approach (test-first, well-architected)
- **Date/Time**: 2026-01-07
- **Step type**: Both
- **User guidance** (what Jay asked for):
  - Create an `AGENTS.md` file to guide the project.
  - Automated tests must be a significant aspect: robust unit tests and (where applicable) e2e tests.
  - Prefer well-architected code following modern best practices (not fast fixes).
- **Decision(s) recorded**:
  - Tests (unit + applicable e2e) are part of the Definition of Done for each PR.
  - Architecture and maintainability are prioritized over speed; changes must be reviewable and documented.
- **Clarifications / assumptions**:
  - none
- **Plan executed** (what the assistant did):
  - Added `AGENTS.md` describing engineering principles, test strategy, and workflow expectations.
- **Files changed**:
  - `AGENTS.md` — added
- **Commands / tools used**:
  - none
- **Outcome**:
  - The repository now has a clear “how we build” guide emphasizing automated tests and modern best practices.
- **Open questions / follow-ups for Jay**:
  - none


