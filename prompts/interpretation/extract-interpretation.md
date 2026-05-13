# Extract State-Machine Interpretation

Use this prompt to produce a conservative `interpretation.yml` document from
canonical Spec parser AST JSON.

## Prompt

You are interpreting canonical parser output for a `.spec` file.

Your input is a `spec-ast` JSON document. Do not parse or reinterpret raw `.spec`
syntax yourself. Treat the AST as the source of truth for scenario structure,
block kind, clause phase, clause text, and source provenance.

Your task is to produce a reviewable interpretation conforming to
`schemas/interpretation.schema.json`.

Focus on the smallest useful interpretation that explains the parsed scenarios
and can be projected into an XState-compatible state-machine model for
validation.

Extract:

1. Finite states and the initial state
2. Context values that represent extended state
3. Facts that preserve important domain wording
4. Events derived from `when` clauses
5. Transitions from AST blocks with `kind: "transition"`
6. Guards and effects needed to make transitions deterministic
7. Invariants from AST blocks with `kind: "invariant"`
8. Ambiguities or assumptions that need human review

Use these rules:

* Preserve authored domain wording where possible
* Prefer a sparse interpretation over an exhaustive catalog
* Do not invent implementation details, APIs, data structures, or UI mechanics
* Do not invent state that is not supported by AST clauses
* Keep event wording close to `when` clause text
* Interpret `given` clauses in transition blocks as source states, guards, or context facts
* Interpret `when` clauses in transition blocks as events
* Interpret `then` clauses in transition blocks as target states, effects, or invariant checks
* Interpret `given` clauses in invariant blocks as structured `when` conditions
* Interpret `then` clauses in invariant blocks as structured assertions that must hold
* If a phrase could be interpreted in multiple plausible ways, add an ambiguity
* Attach `sourceRefs` using AST scenario titles, phases, and clause text
* Mark new machine-proposed items as `proposed` unless instructed otherwise

Return YAML only.

Use this top-level shape:

```yaml
kind: spec-interpretation
version: 1
status: proposed
name: <short-name>
description: <one-sentence description>

spec:
  path: <ast.source.path>
  grammar:
    name: spec
    version: <ast.grammar.version>
  ast:
    kind: spec-ast
    version: <ast.version>

model:
  id: <short-name>
  initial: <initial-state-id>
  context: {}
  facts: []
  states: []
  events: []
  transitions: []

invariants: []
ambiguities: []
notes: []
```

## Input

Paste the canonical parser AST JSON below this line.
