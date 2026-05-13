# Interpreter Implementation Note

The interpreter package should turn reviewed `interpretation.yml` documents
into deterministic validation artifacts. Its first target is XState projection.

This note describes the intended first implementation slice. It is not a
replacement for the interpretation schema.

## Goals

The initial interpreter should:

* load an `interpretation.yml` file
* validate it against `schemas/interpretation.schema.json`
* run structural reference checks
* compile the interpreted `model` into an XState-compatible machine config
* expose enough projection output for tests and inspection
* leave generated scenario tests and richer invariant checking for later slices

The interpreter should not parse `.spec` files directly. It consumes reviewed
interpretation documents produced downstream of the canonical parser AST.

## Proposed Package Shape

```text
packages/
  interpreter/
    package.json
    src/
      index.ts
      loadInterpretation.ts
      validateInterpretation.ts
      buildXStateMachine.ts
```

The package can reuse the validation logic currently provided by
`scripts/validate-interpretation.mjs`, either by moving shared validation code
into the package or by porting the same behavior into TypeScript.

## First Projection Target

The first projection target should be an XState-compatible machine config.

The rough mapping is:

* `model.id` -> machine `id`
* `model.initial` -> machine `initial`
* `model.context` -> machine `context`
* `model.states` -> machine `states`
* `model.transitions` -> state-level event transitions
* transition `event` -> XState event key
* transition `to` -> transition target
* transition `guard` -> named or generated guard
* `assign` effects -> XState assign actions
* `action` effects -> named XState actions

Nested states can be preserved from nested `model.states`, but the first slice
only needs to support the flat model used by the shopping-basket example.

## Guards And Effects

Structured conditions should compile conservatively:

* `state` conditions check the current state
* `context` conditions check context values with supported operators
* `all`, `any`, and `not` compose generated guard logic

Effects should initially support:

* `assign`
* `action`

## Invariants

Top-level `invariants` should not be compiled directly into the XState machine
config in the first slice.

Instead, keep them available as validation metadata. Later work can turn them
into generated tests, model checks, or assertions evaluated against reachable
states and snapshots.

## Context Definitions

`model.context` entries are richer than raw XState context values. Each entry
contains review metadata such as `type`, `initial`, `description`, `values`,
`status`, and `sourceRefs`.

Projection should compile only the `initial` values into XState machine
context. The surrounding metadata remains available for inspection,
validation, generated tests, and user review.

## First Useful Test

The first useful end-to-end test is:

```text
examples/shopping-basket/interpretation.yml
  -> validate interpretation
  -> build XState-compatible machine config
  -> assert id, initial, context, states, and event transitions are present
```

This proves the package can consume the reviewed interpretation shape without
claiming full scenario validation too early.
