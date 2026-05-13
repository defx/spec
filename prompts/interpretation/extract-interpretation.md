# Extract State-Machine Interpretation

Use this prompt to produce a conservative `interpretation.yml` document from
canonical Spec parser AST JSON. The output should be reviewable by humans and
shaped for deterministic projection into an XState-compatible state machine.

## Prompt

You are interpreting canonical parser output for a `.spec` file.

Your input is a `spec-ast` JSON document. Do not parse or reinterpret raw `.spec`
syntax yourself. Treat the AST as the source of truth for scenario structure,
block kind, clause phase, clause text, and source provenance.

Your task is to produce a reviewable interpretation conforming to
`schemas/interpretation.schema.json`.

When testing this prompt, the full JSON Schema may be provided after the prompt.
If a schema is provided, treat it as authoritative for allowed keys, required
fields, object shapes, and enum values. If this prompt and the schema appear to
disagree, follow the schema for structure and this prompt for modelling
judgment.

Focus on the smallest useful interpretation that explains the parsed scenarios
and can be projected into an XState-compatible state-machine model for
validation.

## Modelling Goal

Produce a semantic model that is readable as YAML but concrete enough to
compile into a state machine. Do not output raw XState configuration.

The interpretation should make these concepts explicit:

1. Finite states and the initial state
2. Rich context definitions that represent extended state
3. State and context descriptions that preserve important domain wording
4. Events derived from `when` clauses
5. Transitions from AST blocks with `kind: "transition"`
6. Guards and effects needed to make transitions deterministic
7. Invariants from AST blocks with `kind: "invariant"`
8. Ambiguities or assumptions that need human review

## Modelling Bias

Use finite states for durable lifecycle or mode changes. Good finite states are
states that a domain reviewer would naturally name, such as `empty`,
`checking-out`, `approved`, or `cancelled`.

Use context for quantities, values, flags, selections, identifiers, totals, and
other extended state that would otherwise create many similar finite states.
Each context entry should include `type`, `initial`, `description`,
`sourceRefs`, and `values` when it is an enum.

Preserve authored domain wording in state descriptions, context descriptions,
event phrases, source references, invariants, ambiguities, and notes. Do not
create a separate facts vocabulary.

Use structured guards and effects. Do not store transition preconditions or
postconditions as plain strings.

When a modelling choice is plausible in more than one way, choose the smallest
useful model and add an ambiguity explaining the alternatives. Common
ambiguities include:

* finite state versus context
* one event with payload versus separate events
* one broad state versus several narrower states
* a state versus a context value
* a scenario-local phrase versus a durable model concept

## Clause Mapping

For transition blocks:

* `given` clauses become candidate source states, guards, context conditions,
  or supporting source references
* `when` clauses become events
* `then` clauses become candidate target states, effects, context assertions,
  or invariant checks

For invariant blocks:

* `given` clauses become structured `when` conditions
* `then` clauses become structured assertions that must hold

## Output Rules

* Preserve authored domain wording where possible
* Prefer a sparse interpretation over an exhaustive catalog
* Do not invent implementation details, APIs, data structures, or UI mechanics
* Do not invent state that is not supported by AST clauses
* Keep event wording close to `when` clause text
* If a phrase could be interpreted in multiple plausible ways, add an ambiguity
* Attach `sourceRefs` using AST scenario titles, phases, and clause text
* Mark new machine-proposed items as `proposed` unless instructed otherwise
* Return exactly one YAML code block and no explanatory prose

## YAML Safety

Use YAML mappings and arrays only. Avoid YAML features such as anchors, aliases,
tags, merge keys, and multi-document output.

Use YAML indentation consistently. Nested mapping properties must be indented
under their parent key. Array items must use `-`, not `*`.

Use `event` for transition event ids. Do not use an unquoted `on` key; some YAML
parsers treat `on` as a boolean.

Quote scalar values when they could be read as booleans, numbers, nulls, dates,
or YAML keywords. Examples that should usually be quoted include `enabled`,
`disabled`, `valid`, `invalid`, `yes`, `no`, `on`, `off`, `null`, and values
with punctuation that might be ambiguous.

## Source References

Use this exact source reference shape:

```yaml
sourceRefs:
  - scenario: <scenario title>
    phase: given
    clause: <clause text>
```

The only allowed source reference keys are `scenario`, `phase`, and `clause`.
Do not use `text`, `line`, `span`, or other keys in `sourceRefs`.

## Structured Conditions

Use these condition forms:

```yaml
state: <state-id>
```

```yaml
context: <context-path>
operator: equals
value: <json-compatible-value>
```

```yaml
all:
  - <condition>
```

```yaml
any:
  - <condition>
```

```yaml
not:
  <condition>
```

For context conditions, choose one of these operators:

```text
equals
notEquals
greaterThan
greaterThanOrEquals
lessThan
lessThanOrEquals
includes
doesNotInclude
exists
doesNotExist
```

## Structured Effects

Use these effect forms:

```yaml
assign: <context-path>
value: <json-compatible-value>
```

```yaml
action: <action-id>
params: {}
```

Use `assign` for context updates. Use `action` only when the scenario clearly
implies a named side effect that cannot be represented as context.

## Consistency Checks Before Returning

Before returning the YAML, check it against these expectations:

* `model.initial` is one of `model.states[*].id`
* every transition `from` state exists
* every transition `to` state exists when `to` is present and not null
* every transition `event` exists in `model.events`
* every transition `assign` target exists in `model.context`
* every condition `context` reference exists in `model.context`
* every invariant has a structured `when` condition and at least one structured
  assertion
* every `sourceRefs` entry uses `clause`, not `text`
* every ambiguity has `id`, `phrase`, `note`, optional `options`, and optional
  `sourceRefs`
* `notes` is an array of strings, not an array of objects
* no old draft fields are present: `domain`, `stateMachine`, `preconditions`,
  `postconditions`, `condition`, `mustHold`, `facts`, `fact`, `assertFact`, or
  `clearFact`

## Top-Level Shape

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
  context:
    <context-key>:
      type: <string|number|boolean|enum|expression|object|array>
      initial: <json-compatible-value>
      description: <domain meaning>
      status: proposed
      sourceRefs:
        - scenario: <scenario title>
          phase: given
          clause: <clause text>
  states:
    - id: <state-id>
      name: <state name>
      description: <domain meaning>
      status: proposed
      sourceRefs:
        - scenario: <scenario title>
          phase: given
          clause: <clause text>
  events:
    - id: <event-id>
      name: <event name>
      phrase: <when clause wording>
      status: proposed
      sourceRefs:
        - scenario: <scenario title>
          phase: when
          clause: <clause text>
  transitions:
    - id: <transition-id>
      name: <scenario title or transition name>
      from: <state-id>
      event: <event-id>
      to: <state-id>
      guard:
        state: <state-id>
      effects: []
      status: proposed
      sourceRefs:
        - scenario: <scenario title>

invariants:
  - id: <invariant-id>
    name: <scenario title or invariant name>
    when:
      state: <state-id>
    assert:
      - context: <context-key>
        operator: equals
        value: <json-compatible-value>
    status: proposed
    sourceRefs:
      - scenario: <scenario title>
        phase: given
        clause: <clause text>
ambiguities:
  - id: <ambiguity-id>
    phrase: <ambiguous phrase>
    note: <why the interpretation is uncertain>
    options:
      - <one possible interpretation>
      - <another possible interpretation>
    sourceRefs:
      - scenario: <scenario title>
        phase: given
        clause: <clause text>
notes:
  - <plain string note>
```

## Input

When manually testing this prompt, paste the full JSON Schema below this line,
then paste the canonical parser AST JSON after it.

```text
JSON Schema:
<paste schemas/interpretation.schema.json here>

Parser AST:
<paste canonical parser AST JSON here>
```
