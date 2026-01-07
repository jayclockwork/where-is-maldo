# Commmon Software Engineer LLM Journey
_Generated through collaboration with ChatGPT_

- **Research**
  - Basic research (Google replacement)
  - Coding research (Replacing Stack Overflow)
  - Document / data processing (CSVs/JSON/log parsing, quick analysis)
  - Architecture + design exploration: trade-offs, patterns, API shape, data modeling, ADR drafts
  - Debugging research with evidence: interpret logs/traces, propose hypotheses + experiments
  - Risk research: security/privacy/licensing concerns, “what could go wrong”

- **Completion**
  - Basic code completion
  - Advanced code completion (multi-file edits, consistent patterns)
  - Automated test writing (assisted): generate scaffolds, fixtures, edge cases
  - Refactoring assistance (small/medium refactors, codemods, dependency upgrades)

- **Collaboration**
  - Chatting with code (Cursor-style, repo-aware navigation)
  - Pair programming on automated tests
  - Pair programming on bugs
  - Pair programming on features
  - Code reviews (diff summaries, risk spotting, suggested changes)
  - Code refactoring (bigger redesigns, decomposition plans, safe migration steps)
  - Task decomposition + slicing: break epics into thin slices, identify spikes, define acceptance criteria

- **Delegation**
  - Primary coder for new features (implementation + tests + docs; human validates/accepts)
  - PRD creator (first draft)
  - Requirements collaborator (story mapping, constraints, acceptance criteria)

- **Constrained autonomy**
  - Agentic loops: LLM runs tools/CI under guardrails, iterates on failures, proposes PRs

