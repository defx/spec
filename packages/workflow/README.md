# Spec Workflow

End-to-end workflow orchestration for Spec interpretation runs.

`@defx/spec-workflow` is the proposed package that coordinates the full manual
MVP loop from `.spec` edits to an executable XState-backed inspection surface.
It is intentionally separate from the parser and interpreter packages.

This package is currently a documented skeleton. It describes the intended
responsibilities and file protocol before implementation.

## What It Provides

### Manual interpretation runs

The workflow runner is manually triggered after a human edits a `.spec` file.
The MVP does not watch files automatically.

The intended command shape is:

```sh
spec-workflow run examples/shopping-basket/shopping-basket.spec
```

A run performs the mechanical parts of the end-to-end process:

1. parse the `.spec` file into canonical AST JSON
2. load the previous accepted AST snapshot, if one exists
3. create a current AST snapshot
4. create an AST diff/change packet
5. create a file-based job directory for an agent
6. wait for or detect the agent-updated `interpretation.yml`
7. run final validation
8. project the interpretation into XState-compatible machine config
9. load the generated config with XState for basic inspection
10. advance the previous AST baseline after successful validation and execution

### Agent-agnostic job protocol

The workflow runner does not call a specific agent API. It creates a run
directory containing files that any capable agent can read and update.

The agent is expected to:

- read the task instructions and AST diff
- inspect the existing `interpretation.yml`
- update `interpretation.yml`
- ask the human for clarification when the source is ambiguous or inconsistent
- run validation while editing
- fix validation errors where possible
- write run status when clarification is needed, validation fails, or the run is
  ready for final runner checks

The runner remains responsible for final validation and projection even when the
agent has already validated its own work.

### AST snapshots and diffs

Each run compares the current AST against the previous accepted AST snapshot.
The diff is a focus tool for the agent. It does not interpret natural language.

The AST diff should identify:

- added blocks
- removed blocks
- changed blocks
- unchanged blocks
- source references in `interpretation.yml` that point at removed or changed
  scenarios or clauses
- source references that may be stale because titles or clause text changed

For MVP, matching can be conservative. Scenario title, block kind, clause phase,
clause text, source order, and simple similarity are enough. Uncertain matches
should be reported as possibly stale rather than silently accepted.

### Validation and projection

The workflow runner uses the interpreter package for deterministic checks.

Final validation should include:

- interpretation YAML parsing
- JSON Schema validation
- structural reference validation
- projection into XState-compatible machine config
- basic XState load or execution check

The runner should not advance the previous AST baseline unless these final
checks pass.

### XState inspection

The workflow runner uses XState as the execution target. It does not implement a
custom state-machine runtime.

The MVP inspection surface should expose enough information for basic human
review:

- machine id
- initial state
- initial context
- available events
- state metadata
- transition metadata
- simple event stepping where supported by the generated config and runtime

The inspection surface may be command-line output, JSON files, a local web view,
or another simple artifact. It does not need to be a polished simulator for MVP.

## Package Boundaries

### Parser package

`@defx/spec-parser` owns only parsing:

```text
.spec text -> canonical AST JSON
```

It should not manage workflow snapshots, agent jobs, interpretation refs, or
state-machine execution.

### Interpreter package

`@defx/spec-interpreter` owns interpretation document utilities:

```text
interpretation.yml -> validation result
interpretation.yml -> XState-compatible config
```

It should not orchestrate agent runs or snapshot state.

### Workflow package

`@defx/spec-workflow` owns orchestration:

```text
.spec
  -> AST snapshots
  -> AST diff
  -> agent job
  -> final validation
  -> XState config
  -> XState inspection
```

It depends on parser and interpreter capabilities rather than duplicating them.

## Run Directory Layout

The proposed file-based job protocol uses a run directory under `.defx`.

```text
.defx/
  baselines/
    previous.ast.json
  runs/
    2026-05-28T12-00-00-000Z/
      task.md
      input/
        previous.ast.json
        current.ast.json
        ast.diff.json
        interpretation.yml
      output/
        status.json
        notes.md
        validation.log
        machine.config.json
        machine.inspection.json
```

The exact paths may be configured later. For examples in this repository, a
local `.defx` directory beside the example files is preferred:

```text
examples/shopping-basket/.defx/
```

## Task File

`task.md` is written for the agent. It should include:

- the goal of the run
- paths to the current AST, previous AST, diff, and interpretation file
- instructions to update `interpretation.yml`
- instructions to ask the human for clarification when needed
- instructions to run validation and fix errors
- instructions to write `output/status.json`

The task should explicitly tell the agent that the AST is the interpretation
input contract and that raw `.spec` text is only source context.

## Status File

`output/status.json` records the current lifecycle state.

Expected statuses:

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

Example:

```json
{
  "status": "ready",
  "message": "interpretation.yml validates and is ready for final workflow checks",
  "updatedAt": "2026-05-28T12:00:00.000Z"
}
```

If the agent needs clarification, it should use:

```json
{
  "status": "needs-clarification",
  "message": "The changed clause could be either an event payload or a guard.",
  "questions": [
    "Should promo code validity be modeled as separate events or as a payload?"
  ],
  "updatedAt": "2026-05-28T12:00:00.000Z"
}
```

## AST Diff Packet

`input/ast.diff.json` should be structured for both tools and agents.

Suggested shape:

```json
{
  "kind": "spec-ast-diff",
  "version": 1,
  "previous": {
    "path": "input/previous.ast.json",
    "hash": "..."
  },
  "current": {
    "path": "input/current.ast.json",
    "hash": "..."
  },
  "blocks": {
    "added": [],
    "removed": [],
    "changed": [],
    "unchanged": []
  },
  "sourceRefs": {
    "stale": [],
    "possiblyStale": [],
    "unmatched": []
  }
}
```

Changed blocks should include enough source context for the agent to update
affected interpretation elements without rereading the entire AST. The full AST
snapshots remain available for fallback.

## Baseline Advancement

The runner advances the previous AST baseline only after the run is coherent.

Required checkpoint:

```text
parse succeeded
agent marked run ready
runner final validation passed
XState-compatible config was generated
XState inspection loaded successfully
```

If the run fails, becomes stale, or needs clarification, the previous baseline
is preserved.

## Current Limits

- This package is not implemented yet.
- The MVP is manually triggered; automatic watching is a future enhancement.
- The AST diff is intended to focus agent attention, not replace semantic
  interpretation.
- The agent remains responsible for modelling choices and human clarification.
- The runner is responsible for final deterministic checks.
