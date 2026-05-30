# ADR 003: Agent-Agnostic Workflow Runner Coordinates Interpretation Runs

## Status

Proposed

## Context

Spec now has three distinct layers:

* the parser layer, which turns `.spec` files into canonical AST JSON and does
  not infer domain meaning from natural-language clauses
* the interpretation layer, where an agent and human reviewer make semantic
  modelling decisions and record them in `interpretation.yml`
* the execution tooling layer, which mechanically validates reviewed
  interpretation documents, projects them into executable state-model
  configuration, executes the projected model, and later may run generated tests

Parsing, AST snapshot management, AST diffing, interpretation validation, executable
model projection, and final execution checks are deterministic workflow
concerns. Interpretation workflow is a Human-in-the-loop process, and is designed specifically to be agent-agnostic.

The parser intentionally preserves clause text as opaque natural language. Deciding whether a phrase is a state, context value, event, guard, effect, invariant, ambiguity, or ordinary wording
requires modelling judgment. That work is well-suited to an agent, with human
clarification where the specification is ambiguous or inconsistent.

The project therefore needs an end-to-end workflow that proves the whole
process while keeping the agent boundary clean. The MVP should be manually
triggered by a human after `.spec` edits. It should not require automatic file
watching.

## Decision

Introduce a workflow runner as a separate downstream package, initially
documented under `packages/workflow`.

The workflow runner owns mechanical orchestration:

* parse the current `.spec` file into canonical AST JSON
* load the previous accepted AST snapshot when one exists
* produce an AST diff/change packet
* maintain a file-based workflow session workspace for an agent
* run deterministic validation after the agent updates `interpretation.yml`
* project the validated interpretation into executable state-model config
* execute or refresh a basic inspection surface using the configured runtime
* advance the stored AST baseline only after the run reaches a coherent
  checkpoint

The agent owns semantic interpretation:

* inspect the AST diff/change packet and existing `interpretation.yml`
* update `interpretation.yml`
* ask the human for clarification around ambiguities or inconsistencies
* run validation while editing so it can check and fix its own work
* mark the run ready only after its local validation loop passes

The runner remains the final deterministic authority. Even if the agent runs
validation itself, the runner must validate again before projection, execution,
and baseline advancement.

The workflow runner should itself be implemented as a finite state machine. The
runner lifecycle is operational and bounded: parse, diff, wait for agent input,
handle clarification, validate, project, execute, complete, fail, or mark stale.
Representing that lifecycle explicitly should make resumability, status
reporting, baseline advancement, and failure handling easier to reason about.

The workflow is agent-agnostic. The contract between runner and agent is
a file-based job protocol, not a direct dependency on a specific agent API.

The initial workflow is:

```text
1. Human edits .spec
2. Human manually triggers workflow runner
3. Runner parses current AST JSON
4. Runner updates current.ast.json and ast.diff.json
5. Runner updates run.json with the latest sequence, hashes, and status
6. Agent notices the new sequence and updates canonical interpretation.yml
7. Agent asks for human clarification when needed
8. Agent runs validation and fixes YAML or model-reference errors
9. Agent marks the run ready
10. Runner performs final YAML validation
11. Runner projects to executable state-model config
12. Runner executes or refreshes basic runtime inspection
13. Runner advances the previous AST baseline
```

## File-Based Session Protocol

The MVP should use one mutable workflow workspace for the current session and
current run. It should not create a full directory of copied artifacts for every
run by default.

The exact layout may evolve, but the MVP should use a shape like:

```text
.workspace/
  session.json
  baseline.ast.json
  current.ast.json
  ast.diff.json
  run.json
  validation.log
  machine.config.json
  machine.inspection.json
  history/
    runs.jsonl
```

Agent instructions should be versioned package artifacts, not copied into
`.workspace` by default. The workspace is generated run state; it should not
become a second source of truth for prompts.

`session.json` records session metadata such as protocol version, session id,
configured `.spec` path, configured `interpretation.yml` path, and a reference
to the agent prompt that should be used for the session. Prompt versions should
be content hashes, represented as strings.

For example:

```json
{
  "protocolVersion": 1,
  "sessionId": "2026-05-30T10-00-00-000Z",
  "specPath": "examples/shopping-basket/shopping-basket.spec",
  "interpretationPath": "examples/shopping-basket/interpretation.yml",
  "agentPrompt": {
    "path": "packages/workflow/prompts/agent-session.md",
    "version": "sha256:..."
  }
}
```

If a new agent starts or an existing agent resumes, it reads the prompt
referenced by `session.json`. If the package prompt changes, the next session
can naturally use the new prompt hash. Prompt text may be copied into archived
run artifacts later for debugging or auditability, but that should not be the
MVP default.

`baseline.ast.json` is the last coherent accepted AST. `current.ast.json` is the
latest parsed AST.

`ast.diff.json` is the main change packet. It should identify added, removed,
changed, and unchanged AST blocks, plus stale or possibly stale interpretation
source references where practical.

`run.json` records the current run lifecycle, sequence number, hashes, paths,
and status. Expected statuses include:

```text
created
in-progress
needs-clarification
interpretation-updated
validation-failed
ready
stale
failed
```

`interpretation.yml` is not copied into the workflow workspace by default. The
runner records its path and relevant hash in `run.json`; the agent edits the
canonical file in place. This avoids duplicate interpretation documents and lets
a long-lived agent session keep local context between runs while still allowing
a fresh agent to recover by reading the canonical file.

The `history` directory is optional and compact. The runner may append run
metadata to `history/runs.jsonl`, and may preserve larger artifacts only for
failures, debugging, or explicit user-requested archives. Full per-run
directories are not the default protocol.

The runner should avoid consuming incomplete writes. Implementations should use
atomic file replacement or simple lifecycle states so the runner only reads a
run after the agent has finished writing.

## AST Diffing

The diff is a mechanical aid for focusing agent attention. It should not try to
perform semantic interpretation.

For MVP, the diff can match AST blocks by scenario title, block kind, phase,
clause text, and source order. It may report uncertain matches as possibly
changed or stale rather than forcing precision.

The agent should receive:

* the path and hash of the canonical `interpretation.yml`
* the AST diff/change packet
* the changed AST blocks in full
* relevant unchanged context when needed
* source references from the interpretation that point at changed or removed
  scenarios or clauses

The protocol should make incremental operation possible. During a long-lived
session, an agent can parse `interpretation.yml` once and then react mainly to
`ast.diff.json`, `run.json`, and affected source references. This is an
optimization, not a guarantee. A restarted agent, compacted context, or
out-of-band human edit must still be able to recover by reading the canonical
files.

The agent should not be limited to changed lines only. A small source change may
affect events, transitions, guards, invariants, ambiguity notes, or multiple
model elements that share source references.

## Executable Model Projection

The workflow should not implement a custom user-spec runtime.

The user's spec should project into an executable, predictable state model. That
model may include finite modes, but it should not be conceptually limited to a
strict finite state machine. Many useful specifications may be closer to a
Redux-like or Zustand-like state container: events, context, guards,
assignments, effects, and invariants, with little or no meaningful finite-mode
surface.

XState remains the first runtime target because its architecture can represent
statecharts while also supporting flexible state-model patterns built around
context, events, guards, actions, and predictable updates. The workflow runner
should use XState for MVP execution and basic inspection, but the workflow
language should not imply that XState projection is limited to finite state
machines.

MVP inspection can be modest: initial state and context, available events,
state or context metadata, transition metadata, simple stepping where supported,
and enough output for a human to confirm that the projected model is usable.

## Baseline Advancement

The stored previous AST snapshot should advance only after:

* parsing succeeds
* the interpretation validates under the runner's final validation pass
* executable state-model config generation succeeds
* the projected model can be loaded for basic execution or inspection

If the agent needs clarification, validation fails, projection fails, or the
human edits source files during a run, the runner should keep the previous
baseline and mark the run pending, failed, or stale.

## Runner Lifecycle Machine

The runner's own lifecycle should be modelled as a finite state machine.

The initial state set should stay small and operational:

```text
idle
session-ready
parsing
diffing
waiting-for-agent
needs-clarification
agent-ready
validating
projecting
executing
completed
failed
stale
```

The initial event set should reflect external and deterministic workflow
changes:

```text
RUN_REQUESTED
PARSE_SUCCEEDED
PARSE_FAILED
DIFF_SUCCEEDED
DIFF_FAILED
AGENT_MARKED_READY
AGENT_NEEDS_CLARIFICATION
VALIDATION_SUCCEEDED
VALIDATION_FAILED
PROJECTION_SUCCEEDED
PROJECTION_FAILED
EXECUTION_SUCCEEDED
EXECUTION_FAILED
SOURCE_CHANGED_DURING_RUN
BASELINE_ADVANCED
```

The runner lifecycle machine is implementation machinery. It should remain
separate from the executable state model projected from a user's `.spec` file.
Using an FSM to implement the runner does not imply that user specifications or
XState-backed projections are limited to strictly finite-state models.

## Rationale

### Keeps packages focused

The parser remains responsible only for `.spec` syntax and canonical AST
generation. It does not manage prior snapshots, interpretation source refs, or
agent context.

The interpreter remains responsible for validated interpretation documents and
projection. It does not orchestrate agent work or workflow state.

The workflow runner depends on both layers and coordinates the end-to-end
process.

### Makes workflow state explicit

The runner has a naturally finite operational lifecycle. Implementing that
lifecycle as a finite state machine gives the workflow a clear status model for
`run.json`, makes resume behaviour easier to design, and reduces the risk of
advancing baselines or reading outputs from the wrong phase.

### Preserves agent portability

A file-based job protocol lets different agents participate without adapting
the runner to a specific API, SDK, or product. Any agent that can read files,
edit `interpretation.yml`, run validation, and write status can participate.

Keeping instructions as package-level prompt artifacts also supports the
expected common case: one agent handles many runs within a session, and only
rereads the stable task when the session changes. The workspace records the
prompt path and content hash used for the session, rather than copying prompt
text into generated run state.

### Lets the agent focus on meaning

The runner handles mechanical setup and final checks. The agent handles natural
language interpretation, ambiguity, inconsistency, and human clarification.

### Avoids hidden validation authority

The agent should run validation as part of its own edit loop, but final
validation belongs to the runner. This prevents the agent from being the sole
authority on whether its own output is valid.

### Avoids narrowing user projections too early

The workflow runner can use a finite state machine internally without requiring
every user specification to be modelled as a strict finite state machine.
Describing the projection target as an executable state model keeps room for
statechart-like, reducer-like, and store-like projections, including those
implemented with XState.

## Consequences

### Positive

* The end-to-end process can be proven manually before adding file watching.
* The workflow remains independent of any single agent implementation.
* AST diffs reduce the amount of unchanged parser output the agent must review.
* Validation and executable-model inspection become repeatable runner
  responsibilities.
* The runner lifecycle has an explicit finite-state model for status, resume,
  and failure handling.
* The parser and interpreter packages stay focused.

### Trade-offs

* A session workspace protocol adds workflow state that must be documented and
  kept stable.
* The runner and agent need a clear status lifecycle to avoid races and stale
  output.
* AST diffing can focus attention, but cannot guarantee semantic completeness.
* The workflow runner introduces another package boundary.
* Compact current-run state is less auditable than preserving every run artifact
  forever, so explicit history and archive policies may be needed later.
* The current interpreter and schema still emphasize statechart vocabulary, so
  future broader state-container projections may require schema evolution.

## Guardrails

* Keep the workflow manually triggered for MVP.
* Keep AST diffing mechanical and conservative.
* Do not put workflow orchestration in the parser package.
* Do not make the runner depend on a specific agent API.
* Do not let the agent be the final validation authority.
* Implement the runner lifecycle as an explicit finite state machine.
* Use XState as the first user-spec execution target rather than building a
  custom runtime.
* Do not imply that user specs or XState projections are limited to strictly
  finite state machines.
* Advance the AST baseline only after validation, projection, and execution
  checks pass.
