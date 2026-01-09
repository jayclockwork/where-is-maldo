# Software Engineering LLM Levels

### Level 1: Research
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


### Level 2: Code Completion
_Focus: speeding up implementation of small-to-medium scoped changes._

- **Basic code completion**
  - Autocomplete single-lines / small-blocks
- **Advanced completion**
  - Autocomplete multi-file edits that follow existing patterns and conventions
- **Automated test writing (assisted)**
  - Generate scaffolds, fixtures, mocks, and edge cases
- **Refactoring assistance**
  - Perform small code and document refactors


### Level 3: Collaborative Coding
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


### Level 4: Delegation
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

### Level 5: Agentic Thinking
_Focus: the aha moment — you learn to direct an agent effectively._

- **Intent and constraints as a spec**
  - State goal, non-goals, constraints, and definition of done
  - Provide “what good looks like” examples (inputs/outputs, acceptance checks)
  - Name what must not change (APIs, behavior, performance budgets, accessibility expectations)

- **Decomposition and sequencing**
  - Break work into small, verifiable steps
  - Ask for a plan first (milestones, risks, unknowns, test plan)
  - Choose a safe order: scaffolding → tests → implementation → cleanup

- **Grounding and context management**
  - Give repo-specific context: conventions, file locations, patterns to follow
  - Provide minimal reproducible examples for bugs
  - Teach it your working agreements (style, naming, commit hygiene, review expectations)

- **Evidence-driven trust**
  - Require citations to code locations, diffs, and commands to run
  - Require tests for behavior changes and a clear verification checklist
  - Ask for edge cases, failure modes, and rollback considerations

### Level 6: Constrained Autonomy
_Focus: agentic tool use under guardrails (LLM iterates; you approve)._

- **LLM Configuration**
  - Building and tweaking AGENTS.md files
- **Agentic loops**
  - LLM runs linters/automated tests, interpret failures, propose focused patches
  - LLM stops on uncertainty; ask for clarification instead of guessing
- **Enhanced Guardrails**
  - Explicit scope (“only touch X files”), deterministic formatting, non-interactive commands
  - Require evidence for risky changes (tests, benchmarks, logs, diffs)

### Level 7: Multi-Agent Autonomy
_Focus: multiple agents coordinate on a larger goal with defined roles; humans supervise outcomes._

- **Role-based agent teams**
  - Define agents such as Planner, Implementer, Reviewer, Verifier
- **Parallelization with boundaries**
  - Agents work on independent slices (tests, refactors, docs) in parallel
  - Strict ownership of files/modules to avoid conflicts
- **Orchestration and governance**
  - Shared definition of done, shared guardrails, shared tool permissions
  - Central change log: what changed, why, evidence, and remaining risks
  - Human approval gates at milestones (design, pre-merge, release)