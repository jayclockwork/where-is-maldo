# Software Engineering LLM Levels

*Each level answers: **who is driving?***

---

### Level 1: Reference

**Who drives: You — entirely. LLM is a smarter search.**

The LLM answers questions. It doesn't touch your code.

- **Basic research**
  - How to code a statement or function
  - How a technology works
  - How technologies compare and contrast
- **Coding research**
  - Find better ways to implement small sections of code
  - Compare libraries and approaches
- **Document research**
  - Summarize docs and long specs
  - Parse and analyze CSV/JSON/etc for quick answers
- **Debugging research**
  - Interpret logs, traces, and stack traces
  - Propose 2–3 hypotheses for what's going wrong
- **Risk research**
  - Understand security and privacy pitfalls
  - Identify licensing concerns
  - Ask "what could go wrong?" before you build

---

### Level 2: Inline Assist

**Who drives: You — LLM extends your keystrokes.**

You're still writing the code. The LLM is finishing your sentences and handling the tedious parts.

- **Inline completion**
  - Autocomplete single lines and small blocks as you type
  - Accept, reject, or modify suggestions without leaving your editor
- **Multi-file edits**
  - Autocomplete changes that span files, following your existing patterns and conventions
- **Test scaffolding**
  - Generate test scaffolds, fixtures, mocks, and edge cases from your own specs
- **Small refactors**
  - Rename, extract, reorganize — well-defined, low-risk changes
  - Tidy up docs and comments

---

### Level 3: Pair Programmer

**Who drives: Both of you — real-time, repo-aware collaboration.**

You're still the author, but the LLM knows your codebase and works alongside you actively. Think rubber duck that talks back.

- **Chatting with your codebase**
  - "Where is X implemented?" "What calls this function?" "How does Y work in this repo?"
  - Understand unfamiliar code quickly without spelunking manually
- **Debugging together**
  - Triage a bug, isolate a repro case, and propose fixes with verification steps
  - Walk through a failing test together to understand root cause
- **Test coverage partnership**
  - Fill gaps in existing coverage
  - Add regression tests for newly discovered bugs
- **Code review assistance**
  - Summarize what a diff actually does in plain language
  - Spot risks, edge cases, and missing tests before human reviewers see it
- **Feature development**
  - Draft an implementation together and iterate based on your feedback
  - You're still the one deciding what goes in — LLM is your thought partner

---

### Level 4: Delegator

**Who drives: LLM — you direct and review.**

You've handed off the keyboard. The LLM is the programmer now. Your job is to steer, review, and accept or reject.

- **Requirements authoring**
  - Turn fuzzy asks into user stories, non-goals, and open questions
  - Generate acceptance criteria and phased rollout plans
  - Produce classic requirements docs or feature-based PRDs
- **Full feature implementation**
  - LLM drafts code, tests, and docs together
  - You review the output and validate against acceptance criteria
  - You're measuring outcomes, not writing lines
- **Substantial test generation**
  - LLM owns building out a meaningful unit test suite
  - LLM generates effective end-to-end tests (e.g. Playwright)
- **Spec writing for handoff**
  - State goal, non-goals, constraints, and definition of done clearly enough that the LLM can execute without constant clarification
  - Provide "what good looks like" with concrete examples (inputs/outputs, acceptance checks)
  - Name what must not change: APIs, behaviors, performance budgets, accessibility expectations

---

### Level 5: Agent Director

**Who drives: LLM — using tools, running loops, taking actions. You define the playing field and approve.**

The LLM isn't just outputting text anymore. It's executing: running tests, reading files, making changes, interpreting results. You set the guardrails and stay in the approval seat.

- **Writing agent-readable specs**
  - Break work into small, independently verifiable steps
  - Ask for a plan first: milestones, risks, unknowns, and a test plan — before a single line is written
  - Choose a safe execution order: scaffolding → tests → implementation → cleanup
- **Grounding the agent in your context**
  - Give it repo-specific conventions: file locations, patterns to follow, naming rules
  - Teach it your working agreements: style, commit hygiene, review expectations
  - Define scope explicitly: "only touch these files," "non-interactive commands only"
- **Agentic loops**
  - LLM runs linters and automated tests, interprets failures, and proposes focused patches — without you in the loop for each step
  - LLM stops and asks when uncertain instead of guessing its way forward
- **Evidence-driven trust**
  - Require tests for any behavior changes
  - Ask for a verification checklist, edge cases, failure modes, and rollback considerations
  - Require evidence for risky changes: diffs, benchmarks, logs
- **Configuring your agents**
  - Build and tune AGENTS.md files that encode your guardrails and expectations
  - Adjust scope, tool permissions, and stop conditions as you learn what works

---

### Level 6: Systems Architect

**Who drives: Agent systems — coordinating autonomously. You design the system and govern the outcomes.**

You've stopped directing individual agents. You're designing how agents work together, defining their roles, and overseeing the whole — approving at milestones, not at every step.

- **Role-based agent teams**
  - Define and assign distinct agent roles: Planner, Implementer, Reviewer, Verifier
  - Each agent has a clear responsibility and clear handoff point
- **Parallel execution with hard boundaries**
  - Agents work simultaneously on independent slices: tests, refactors, docs, migrations
  - Strict file/module ownership prevents agents from stepping on each other
- **Orchestration and governance**
  - Shared definition of done, shared guardrails, and shared tool permissions across all agents
  - Central change log: what changed, why, what evidence supports it, what risks remain
  - Human approval gates at key milestones: design review, pre-merge, pre-release
- **System-level thinking**
  - You're not debugging a line of code — you're debugging a workflow
  - Evaluate whether agent coordination is actually working or just creating new complexity
  - Know when to simplify back to a single agent

---

*The through-line:*

> Level 1: I ask. Level 2: It helps me type. Level 3: We think together. Level 4: It builds, I review. Level 5: It acts, I govern. Level 6: They coordinate, I architect.

Level	Name	Who Drives	Scope
1	Reference	You	Any
2	Copilot	You (LLM extends)	Task
3	Pair	Shared	Task → Feature
4	Delegator	LLM (you review)	Feature
5	Agent Director	LLM with tools (you scope)	Feature → System
6	Systems Architect	LLM systems (you govern)	System