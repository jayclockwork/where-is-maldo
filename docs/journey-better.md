# Software Engineer LLM Journey (Better Version)
_Merged + improved from the ChatGPT and Gemini drafts._

This version uses the **ChatGPT “phases”** as the main structure (Research → Completion → Collaboration → Delegation → Constrained autonomy), while keeping the clearest framing and guardrails from the Gemini draft.

### Phase 1: Research
_Focus: learning fast and answering questions. The “better Google/Stack Overflow.”_

- **Basic research**
  - How to code a a statement/function
  - How a technology works
  - How technologies compare and contrast
- **Coding research**
  - Find better ways to implement small sections of code
  - Compare libraries and approaches
- **Document research**
  - Summarize docs and concepts
  - Parse and analyze CSV/JSON/etc for quick answers
- **Debugging research**
  - Interpret logs/traces/stack traces
  - Propose 2–3 hypotheses
- **Risk research**
  - Understand security/privacy pitfalls, licensing concerns, “what could go wrong”


### Phase 2: Code Completion
_Focus: speeding up implementation of small-to-medium scoped changes._

- **Basic code completion**
  - Autocomplete single-lines / small-blocks
- **Advanced completion**
  - Autocomplete multi-file edits that follow existing patterns and conventions
- **Automated test writing (assisted)**
  - Generate scaffolds, fixtures, mocks, and edge cases
- **Refactoring assistance**
  - Perform small code and document refactors


### Phase 3: Collaborative Coding
_Focus: working *with* the codebase as a pair (repo-aware, iterative)._

- **Chatting with code**
  - Repo-aware Q&A (Cursor/Cody-style): “Where is X?” “What calls this?” “How does Y work here?”
- **Pair programming on tests**
  - Fill coverage gaps; add regression tests for bugs
- **Pair programming on bug resolution**
  - Triage, isolate repro, propose fixes + verification steps
- **Pair programming on features**
  - Draft implementation + iterate based on review feedback
- **Code reviews**
  - Summarize diffs, spot risks, suggest improvements, call out missing tests


### Phase 4: Delegation
_Focus: the LLM becomes the primary implementer; you stay owner/reviewer._

- **Requirements collaborator**
  - Generate outlines, user stories, non-goals, open questions
  - Turn fuzzy asks into constraints, acceptance criteria, and phased rollout plans
  - Generate Classic Requirements documents
  - Generate feature-based Product Requirements Documents (PRDs)
- **Automated Testing**
  - Generate significant number of unit tests
  - Generate effective end-to-end (e2e) tests (such as Playwright tests)
- **Primary coder for new features**
  - LLM drafts implementation + tests + docs; human validates/accepts

### Phase 5: Constrained Autonomy
_Focus: agentic tool use under guardrails (LLM iterates; you approve)._

- **LLM Configuration**
  - Building and tweaking AGENTS.md files
- **Agentic loops**
  - LLM runs linters/automated tests, interpret failures, propose focused patches
  - LLM stops on uncertainty; ask for clarification instead of guessing
- **Enhanced Guardrails**
  - Explicit scope (“only touch X files”), deterministic formatting, non-interactive commands
  - Require evidence for risky changes (tests, benchmarks, logs, diffs)
