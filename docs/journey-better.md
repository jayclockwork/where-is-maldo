# Common Software Engineer LLM Journey (Better Version)
_Merged + improved from the ChatGPT and Gemini drafts._

This version uses the **ChatGPT “phases”** as the main structure (Research → Completion → Collaboration → Delegation → Constrained autonomy), while keeping the clearest framing and guardrails from the Gemini draft.

### Phase 1: Research
_Focus: learning fast and answering questions. The “better Google/Stack Overflow.”_

- **Basic research**
  - Replace most syntax/library searches
  - Summarize unfamiliar docs and concepts
- **Coding research**
  - Find idiomatic examples and patterns (with sources)
  - Compare libraries and approaches at a high level
- **Document / data processing**
  - Parse and analyze CSV/JSON/logs for quick answers
  - Generate small scripts for one-off transformations
- **Architecture + design exploration**
  - Explore trade-offs, patterns, API shape, data modeling
  - Draft ADRs and decision matrices
- **Debugging research with evidence**
  - Interpret logs/traces/stack traces
  - Propose 2–3 hypotheses + concrete experiments to confirm/refute
- **Risk research**
  - Security/privacy pitfalls, licensing concerns, “what could go wrong”

**What to watch for**
- Hallucinated APIs or outdated details; verify against real docs.

### Phase 2: Completion
_Focus: speeding up implementation of small-to-medium scoped changes._

- **Basic code completion**
  - Single-line / small-block autocomplete
- **Advanced completion**
  - Multi-file edits that follow existing patterns and conventions
- **Automated test writing (assisted)**
  - Generate scaffolds, fixtures, mocks, and edge cases
- **Refactoring assistance**
  - Small/medium refactors, codemods, dependency upgrades (with review)

**What to watch for**
- “Looks right” code that subtly violates local conventions or misses edge cases—insist on tests and small diffs.

### Phase 3: Collaboration
_Focus: working *with* the codebase as a pair (repo-aware, iterative)._

- **Chatting with code**
  - Repo-aware Q&A (Cursor/Cody-style): “Where is X?” “What calls this?” “How does Y work here?”
- **Pair programming on tests**
  - Fill coverage gaps; add regression tests for bugs
- **Pair programming on bugs**
  - Triage, isolate repro, propose fixes + verification steps
- **Pair programming on features**
  - Draft implementation + iterate based on review feedback
- **Code reviews**
  - Summarize diffs, spot risks, suggest improvements, call out missing tests
- **Task decomposition + slicing**
  - Break epics into thin vertical slices; identify spikes; define acceptance criteria

**What to watch for**
- Overconfident root-cause claims. Prefer evidence, reproducible steps, and incremental fixes.

### Phase 4: Delegation
_Focus: the LLM becomes the primary implementer; you stay owner/reviewer._

- **Primary coder for new features**
  - LLM drafts implementation + tests + docs; human validates/accepts
- **PRD creator (first draft)**
  - Generate outlines, user stories, non-goals, open questions
- **Requirements collaborator**
  - Turn fuzzy asks into constraints, acceptance criteria, and phased rollout plans

**What to watch for**
- Ensure the human still owns correctness, product intent, and risk decisions.

### Phase 5: Constrained autonomy
_Focus: agentic tool use under guardrails (LLM iterates; you approve)._

- **Agentic loops**
  - Run linters/tests, interpret failures, propose focused patches
  - Stop on uncertainty; ask for clarification instead of guessing
- **Guardrails**
  - Explicit scope (“only touch X files”), deterministic formatting, non-interactive commands
  - Require evidence for risky changes (tests, benchmarks, logs, diffs)

**What good looks like**
- Tight diffs, clear intent, and changes that are easy to review and revert.



