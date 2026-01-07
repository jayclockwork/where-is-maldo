# PRDs: Journey Mapping Website
This directory contains product requirement documents (PRDs) for building the Journey Mapping Website described in:
- `docs/requirements-journey-site.md`
- `docs/architecture.md`

### PRDs (build order)
1. `completed/prd-001-journey-content-site.md` — static journey reading experience + Clockwork-aligned UI foundation (**completed**)
2. `prd-002-live-sessions-and-mapping.md` — sessions + “Doing” toggles + realtime sync
3. `prd-003-presentation-wallboard.md` — big-screen, live group view for presentations
4. `prd-004-host-admin-and-export.md` — host controls (create/close/reset) + export + basic ops

### Cross-cutting constraints (apply to all PRDs)
- **Mapping state**: single per-item **Doing** toggle (no “Done”).
- **Privacy controls**: none (no anonymous/hidden modes in v1).
- **Deployment**: static-first frontend with a managed realtime backend.
- **Design**: match `clockwork.com` visual language; implementation uses MUI with custom theming.


