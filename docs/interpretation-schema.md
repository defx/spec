# Interpretation Schema

Spec interpretation documents are optional companion artifacts for `.spec`
files. They capture a reviewable interpretation of the canonical parser AST,
structured precisely enough to be projected into a state-machine model for
validation.

The canonical schema lives at:

```text
schemas/interpretation.schema.json
```

## Purpose

The parser defines structure, not meaning. It emits a canonical AST containing
scenario blocks, phases, clause text, and source spans. Interpretation documents
sit downstream of that AST and identify the state-machine concepts that appear
to be present in the parsed specification.

The intended flow is:

```text
.spec file -> canonical parser AST -> interpretation.yml -> downstream workflows
```

Interpretation documents should not be produced by reparsing raw `.spec` text.
They may preserve references to the raw file, but the parser AST is the input
contract for interpretation.

Downstream workflows may include specification review and refinement, test case
generation, consistency checking, state-machine exploration, or executable
model generation. The state-machine orientation is the discipline underpinning
the interpretation: an actual model can be produced to validate the
interpretation, even when that model is not the artifact a user consumes.

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

domain:
  entities: []
  relations: []

stateMachine:
  state: []
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

`proposed` means an interpreter has suggested the item.
`reviewed` means a human has inspected it but may still expect revision.
`accepted` means the current project treats it as the working interpretation.

## Domain

`domain.entities` records stable concepts that recur in the parsed scenarios and
may participate in state.

Each entity may have:

* `attributes`: values, collections, quantities, or owned state
* `predicates`: named conditions that can hold for the entity
* `sourceRefs`: parser-derived references to scenarios and clauses

`domain.relations` records named links between entities, such as a basket
containing a product. Relations are separated from predicates so that
state-machine consumers do not confuse a condition on one entity with a link
between two entities.

## State Machine

`stateMachine.state` identifies the interpreted state surface: attributes,
predicates, and relations that may matter to transitions, invariants, tests, or
other downstream checks.

`stateMachine.transitions` correspond to parser blocks whose AST `kind` is
`transition`. A transition records:

* `event`: the interpreted event from `when` clauses
* `preconditions`: state-like facts from `given` clauses
* `postconditions`: resulting facts from `then` clauses
* `sourceRefs`: links back to the source scenario and relevant clauses

`stateMachine.invariants` correspond to parser blocks whose AST `kind` is
`invariant`. An invariant records:

* `condition`: facts from `given` clauses
* `mustHold`: required facts from `then` clauses
* `sourceRefs`: links back to the source scenario and relevant clauses

The schema intentionally stores conditions as readable strings for v1. Later
versions may add a normalized expression model once enough examples exist.

## Ambiguities

`ambiguities` records phrases or interpretations that need human review.

Ambiguities are first-class because interpretation is not meant to hide
assumptions inside an AI process. If a phrase could be an attribute, predicate,
relation, event, or ordinary wording, the interpreter should surface that
uncertainty rather than forcing false precision.

## Non-Goals

Version 1 does not define:

* executable transition semantics
* a normalized expression language
* code generation targets
* test generation rules
* implementation data structures

Those belong to later layers. This schema only captures the accepted
interpretation needed to begin state-machine reasoning.
