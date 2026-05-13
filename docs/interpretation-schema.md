# Interpretation Schema

Spec interpretation documents are optional companion artifacts for `.spec`
files. They capture the durable, reviewable output of an agent-led
interpretation loop over the canonical parser AST.

The canonical schema lives at:

```text
schemas/interpretation.schema.json
```

## Purpose

The parser defines structure, not meaning. It emits a canonical AST containing
scenario blocks, phases, clause text, source spans, and structural block
classification. Interpretation documents sit downstream of that AST and record
the accepted domain meaning needed to validate and improve the parsed
specification. The schema is now shaped for deterministic projection into a
state-machine ecosystem, with XState as the first intended target.

The intended flow is:

```text
.spec file
  -> canonical parser AST
  -> agent-led interpretation loop
  -> interpretation.yml
  -> state-machine projection
  -> validation and generated scenario tests
  -> user feedback / specification refinement / generation
```

Interpretation documents should not be produced by reparsing raw `.spec` text.
They may preserve references to the raw file, but the parser AST is the input
contract for interpretation.

State-machine projection should be used to validate accepted interpretations.
It may run in the background and does not always need to be exposed as a
user-facing artifact, but the interpretation document should be precise enough
for projection tools to build an XState-compatible model, validate it, and
generate scenario tests.

## Document Shape

An interpretation document has this top-level shape:

```yaml
kind: spec-interpretation
version: 1
status: proposed
name: shopping-basket
description: State-machine interpretation of the shopping-basket example.

spec:
  path: examples/shopping-basket/shopping-basket.spec
  grammar:
    name: spec
    version: 1
  ast:
    kind: spec-ast
    version: 1

model:
  id: shopping-basket
  initial: empty
  context:
    basketCount:
      type: number
      initial: 0
      description: Number of product units represented in the basket.
  states: []
  events: []
  transitions: []

invariants: []
ambiguities: []
notes: []
```

## Status

`status` values are intentionally simple:

```text
proposed -> reviewed -> accepted
```

They may appear on the whole document and on individual interpreted elements.

`proposed` means the agent has suggested the item.
`reviewed` means a human has inspected it but may still expect revision.
`accepted` means the current project treats it as the working interpretation.

## Model

`model` records the accepted behavioural model in a shape that can be compiled
into an executable state machine.

The model has:

* `id`: a stable model identifier
* `initial`: the initial state id
* `context`: reviewable extended state definitions that may be read by guards
  or updated by effects
* `states`: finite states, optionally nested for later statechart projection
* `events`: interpreted events, usually derived from `When` clauses
* `transitions`: state changes triggered by events

The model is not raw XState configuration. It preserves review status, source
references, descriptions, and domain phrasing in ways that are useful to Spec authors.
Projection tools are responsible for compiling it into XState-compatible
configuration.

## Context

`model.context` defines extended state directly. Each context entry has:

* `type`: `string`, `number`, `boolean`, `enum`, `expression`, `object`, or
  `array`
* `initial`: the initial JSON-compatible value
* `description`: human-reviewable domain meaning
* `values`: allowed values for enum-like context
* `sourceRefs`: links back to parser-derived scenarios and clauses

Context replaces the earlier draft `facts` layer. Reviewability should live on
the state and context definitions that projection tools actually consume,
rather than in a parallel semantic vocabulary.

## States

`model.states` defines the finite state surface. Each state has an `id` and
`name`, and may include:

* `type`: `atomic`, `compound`, `parallel`, or `final`
* `initial` and nested `states` for compound or parallel models
* `tags`: stable labels that may be useful during projection or testing
* `sourceRefs`: links back to parser-derived scenarios and clauses

## Events

`model.events` defines the event vocabulary used by transitions. Events usually
come from `When` clauses and may preserve both a concise `name` and a domain
`phrase`.

Events may also define `payload` fields when the scenario wording implies
event data that guards or effects need to inspect.

## Transitions

`model.transitions` correspond primarily to parser blocks whose AST `kind` is
`transition`.

A transition records:

* `from`: the source state id
* `event`: the event id
* `to`: the target state id, or `null` for internal/context-only transitions
* `guard`: an optional structured condition
* `effects`: context assignments or named actions
* `sourceRefs`: links back to the source scenario and relevant clauses

This replaces the earlier draft shape of readable `preconditions` and
`postconditions`. Domain meaning is preserved on state and context definitions,
but executable structure is now explicit enough for deterministic projection.

## Conditions And Effects

Guards and invariants use structured conditions. Version 1 supports:

* `state`: a referenced state
* `context`: a comparison against context data
* `all`, `any`, and `not`: recursive logical composition

Transition effects support:

* `assign`: set a context path to a JSON-compatible value
* `action`: reference a named projection action with optional JSON-compatible
  parameters

The schema still leaves the exact runtime semantics to projection and
validation tools. It does, however, require enough structure that tools do not
need to rediscover guards and effects from free-form strings.

## Invariants

`invariants` correspond primarily to parser blocks whose AST `kind` is
`invariant`.

An invariant records:

* `when`: a structured condition under which the invariant applies
* `assert`: one or more structured conditions that must hold
* `sourceRefs`: links back to the source scenario and relevant clauses

Projection tools can turn invariants into generated assertions, model checks,
or scenario-level validation tests.

## Ambiguities

`ambiguities` records phrases or interpretations that need human review.

Ambiguities are first-class because interpretation is not meant to hide
assumptions inside an AI process. If a phrase could be a state, context value,
event, guard, effect, or ordinary wording, the agent should surface that
uncertainty rather than forcing false precision.

## Non-Goals

Version 1 of the schema does not define:

* raw XState configuration
* complete executable transition semantics
* code generation targets
* test generation rules
* a full expression language beyond the structured condition/effect forms

Those belong to projection and validation tools in the broader interpretation
layer. This schema captures the accepted interpretation those tools consume.
