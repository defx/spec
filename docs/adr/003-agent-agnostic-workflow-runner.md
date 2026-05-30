# ADR 003: Agent-Agnostic Workflow Runner Coordinates Interpretation Runs

## Status

Proposed

## Context

Spec now has three distinct layers:

* the parser, which turns `.spec` files into canonical AST JSON
* the interpretation layer, where an agent and human reviewer turn parser output
  into `interpretation.yml`
* the interpreter, which validates reviewed interpretation documents and
  projects them into XState-compatible machine configuration

The current interpretation workflow is agent-led, but some responsibilities are
mechanical and should not depend on a specific agent implementation. Parsing,
AST snapshot management, AST diffing, interpretation validation, state-machine
projection, and final execution checks are deterministic workflow concerns.

Semantic interpretation remains different. The parser intentionally preserves
clause text as opaque natural language. Deciding whether a phrase is a state,
context value, event, guard, effect, invariant, ambiguity, or ordinary wording
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
* project the validated interpretation into XState-compatible machine config
* execute or refresh a basic XState inspection surface
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

The workflow should be agent-agnostic. The contract between runner and agent is
a file-based job protocol, not a direct dependency on a specific agent API.
Watching a file or directory may be one way an agent discovers work, but the
protocol itself is the workflow session workspace and its files.

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
10. Runner performs final validation
11. Runner projects to XState-compatible machine config
12. Runner executes or refreshes basic XState inspection
13. Runner advances the previous AST baseline
```

## File-Based Session Protocol

The MVP should use one mutable workflow workspace for the current session and
current run. It should not create a full directory of copied artifacts for every
run by default.

The exact layout may evolve, but the MVP should use a shape like:

```text
.defx/
  workflow/
    session.md
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

`session.md` describes the stable agent task for the current session. It should
instruct the agent to update canonical `interpretation.yml`, ask for
clarification when necessary, run validation while editing, and mark the current
run status. The task should not be rewritten for every run unless the human
starts a new workflow session or changes the agent instructions.

`session.json` records session metadata such as protocol version, session id,
configured `.spec` path, configured `interpretation.yml` path, and optional
agent-facing notes.

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

## XState Execution

The workflow should not implement a custom state-machine runtime.

The interpreter projects `interpretation.yml` into an XState-compatible machine
configuration. The workflow runner should use XState for execution and basic
inspection. MVP inspection can be modest: initial state and context, available
events, simple stepping, and enough output for a human to confirm that the
projected machine is usable.

## Baseline Advancement

The stored previous AST snapshot should advance only after:

* parsing succeeds
* the interpretation validates under the runner's final validation pass
* XState-compatible machine config generation succeeds
* the machine can be loaded for basic execution or inspection

If the agent needs clarification, validation fails, projection fails, or the
human edits source files during a run, the runner should keep the previous
baseline and mark the run pending, failed, or stale.

## Rationale

### Keeps packages focused

The parser remains responsible only for `.spec` syntax and canonical AST
generation. It does not manage prior snapshots, interpretation source refs, or
agent context.

The interpreter remains responsible for validated interpretation documents and
projection. It does not orchestrate agent work or workflow state.

The workflow runner depends on both layers and coordinates the end-to-end
process.

### Preserves agent portability

A file-based job protocol lets different agents participate without adapting
the runner to a specific API, SDK, or product. Any agent that can read files,
edit `interpretation.yml`, run validation, and write status can participate.

Keeping instructions in a session-level file also supports the expected common
case: one agent handles many runs within a session, and only rereads the stable
task when the session changes.

### Lets the agent focus on meaning

The runner handles mechanical setup and final checks. The agent handles natural
language interpretation, ambiguity, inconsistency, and human clarification.

### Avoids hidden validation authority

The agent should run validation as part of its own edit loop, but final
validation belongs to the runner. This prevents the agent from being the sole
authority on whether its own output is valid.

## Consequences

### Positive

* The end-to-end process can be proven manually before adding file watching.
* The workflow remains independent of any single agent implementation.
* AST diffs reduce the amount of unchanged parser output the agent must review.
* Validation and XState execution become repeatable runner responsibilities.
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

## Guardrails

* Keep the workflow manually triggered for MVP.
* Keep AST diffing mechanical and conservative.
* Do not put workflow orchestration in the parser package.
* Do not make the runner depend on a specific agent API.
* Do not let the agent be the final validation authority.
* Use XState for state-machine execution rather than building a custom runtime.
* Advance the AST baseline only after validation, projection, and execution
  checks pass.
