# ADR 002: Interpretation Layer Uses Reviewed Documents and XState-Projectable Models

## Status

Proposed

## Context

Spec defines a lightweight behavioural specification format with:

* structured scenarios (`Given / When / Then`)
* plain natural-language clauses
* a formally defined grammar
* canonical parser output

The parser defines syntax and structure, not meaning. It preserves scenario
shape, phase, clause text, and source spans. It also classifies blocks
structurally as transitions or invariants from their `Given / When / Then`
shape, but it does not infer domain meaning from clause text, such as entities,
variables, or relationships.

This keeps `.spec` files accessible and maintainable. The goal is not to make
authors encode a full semantic model by hand. The goal is to help teams produce
behavioural specifications that are easier to write, review, improve, and trust
over time.

However, useful downstream workflows still need an explicit interpretation of
the parsed specification. Those workflows may include:

* improving the original specification
* surfacing ambiguity or inconsistency
* generating test cases
* checking scenario coverage
* exploring state-machine models
* producing executable artifacts

For that interpretation to be trustworthy, it must be more than AI-generated
commentary. It needs a durable, reviewable contract, and it must be precise
enough to be projected into an actual state-machine model for validation.

The generated state machine does not have to be the user-facing artifact. It
may run in the background to prove that the interpretation is coherent enough
to support deterministic downstream use.

Existing state-machine ecosystems already provide mature semantics, execution,
inspection, visualization, and model-based testing support. Spec should use
those ecosystems where they fit rather than inventing a bespoke state-machine
runtime as part of the interpretation layer.

XState is the first intended projection target for the interpretation layer. It
fits the repository's TypeScript ecosystem and provides state-machine
configuration, pure transition functions, graph traversal, and model-based test
generation utilities. This makes it a useful design constraint for the
interpretation schema, even though `interpretation.yml` should remain a Spec
artifact rather than raw XState configuration.

## Decision

The interpretation layer sits downstream of the canonical parser AST and is
coordinated as an agent-led interpretation loop.

In that loop, the agent uses:

* canonical parser AST output
* user feedback, corrections, and acceptance
* an optional existing `interpretation.yml`
* tools that can project the interpretation into a state-machine model
* tools that can run validation and generate scenario tests

The durable output of the loop is a reviewed `interpretation.yml` document. It
records the current accepted meaning, follows the canonical interpretation
schema, and remains separate from both the raw `.spec` file and any projected
state-machine model.

The interpretation schema should be shaped for deterministic projection into a
state-machine ecosystem, with XState as the initial target. It should therefore
capture explicit model concepts such as state, context, events, transitions,
guards, effects, invariants, and source references, while preserving enough
domain language for human review.

The agent may use state-machine projection and generated scenario tests during
the loop to validate the interpretation. Validation results, ambiguity, and
projection failures are fed back to the user conversationally, and may lead to
changes in either the `.spec` file or the interpretation document.

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

Interpretation documents are not part of the Spec language or grammar. They are
companion artifacts derived from parser output.

The state-machine projection is not necessarily a product that users inspect.
It is the executable validation mechanism that keeps the interpretation honest.
For the initial implementation direction, that projection should compile the
reviewed interpretation into an XState-compatible model.

## Rationale

### Keeps authoring accessible

Spec should make behavioural specifications easier to write and maintain, not
force authors to write a formal model directly.

The raw `.spec` language remains focused on structured behavioural text. The
semantic model lives downstream.

### Makes interpretation inspectable

An interpretation document gives humans and tools a shared place to inspect:

* accepted states and contextual data
* accepted events and transitions
* accepted guards, effects, and invariants
* domain descriptions and source references used to explain the model
* ambiguities that still need review

This prevents meaning from being hidden inside an AI response or a tool-local
cache.

### Avoids inventing a state-machine runtime

State-machine execution, traversal, and model-based testing are already
well-explored problems. By treating XState as the first projection target, Spec
can reuse an existing ecosystem for deterministic transition checks, graph
exploration, and generated scenario tests.

The interpretation document should not simply become XState configuration,
because it still needs to preserve source references, review status, ambiguity,
and domain phrasing. Instead, it should act as a reviewable semantic model that
can be compiled into XState without rediscovering the machine structure from
free-form text.

### Makes interpretation testable

Human review is necessary, but review alone does not prove that the
interpretation is deterministic enough to support useful automation.

Projection into a state-machine model makes the interpretation testable. The
agent can use projection tools to generate scenario-level tests and validate
those tests against the interpreted transitions and invariants.

If a model cannot be constructed, if generated tests expose contradictions, or
if projection reveals underspecified events or inconsistent invariants, that
becomes feedback for improving either the specification or the interpretation.

### Supports multiple user outcomes

Some users may want generated tests. Others may want validation feedback,
clearer specs, or model-based exploration. Some may never care to see a state
machine.

By treating state-machine projection as an internal validation mechanism, Spec
can support these different outcomes without prescribing one user-facing
artifact.

## Consequences

### Positive

* The core language remains lightweight and readable.
* Interpretation becomes explicit, reviewable, and durable.
* AI assistance remains advisory until reviewed.
* XState projection and generated scenario tests provide a concrete validation
  mechanism for accepted interpretations.
* Readable interpretations that are too vague for deterministic projection are
  surfaced for refinement.
* Projection failures can produce useful feedback for improving specifications.

### Trade-offs

* The interpretation schema needs stronger executable model concepts than a
  loose catalog of entities, predicates, and readable conditions.
* The schema must avoid becoming so XState-specific that future projection
  targets become impractical.
* A future package or tool will be needed to compile interpretations into
  XState models and validate them.
* The interpretation schema may need to evolve as projection code exposes gaps
  in guards, effects, context, and invariant modelling.

## Guardrails

The interpretation layer should follow these principles:

* consume canonical parser AST output, not raw `.spec` text
* keep the raw `.spec` file as the primary authored artifact
* make AI-proposed meaning visible and editable
* require human review before treating interpretations as accepted
* keep `interpretation.yml` separate from the projected XState model
* shape `interpretation.yml` around explicit model concepts that can be
  deterministically projected
* preserve source references, domain phrasing, and ambiguity alongside the
  executable model structure
* validate and report ambiguity rather than silently invent missing semantics
* use projection failures as feedback for improving the specification or the
  interpretation
* avoid forcing state-machine artifacts into workflows where users only need
  feedback, tests, or a clearer specification

## Implications for the repository

The repository should treat the interpretation layer as a first-class part of
the project, separate from the parser but downstream of parser output.

Near-term artifacts include:

```text
schemas/
  interpretation.schema.json

docs/
  interpretation-schema.md
  interpretation-process.md

prompts/
  interpretation/
    extract-interpretation.md

examples/
  shopping-basket/
    shopping-basket.spec
    interpretation.yml
```

Future implementation work may introduce a package such as:

```text
packages/
  interpreter/
    src/
      loadInterpretation.ts
      validateInterpretation.ts
      buildXStateMachine.ts
      generateScenarioTests.ts
```

This package would not replace the parser. It would consume parser-derived
interpretations, compile them into XState-compatible models, and provide
deterministic validation and downstream generation.

## Alternatives considered

### Encode more semantics directly into `.spec`

This would make projection easier, but it would increase authoring burden and
undermine the goal of keeping behavioural specifications accessible and
readable.

### Treat AI output as the interpretation

This keeps the workflow simple, but it hides assumptions inside a transient
response and makes interpretation harder to review, compare, validate, and
reuse.

### Treat interpretation documents as the full interpretation layer

This provides a durable artifact, but it leaves state-machine compatibility
unproven. The interpretation may look structured without being executable
enough to validate.

### Make interpretation documents raw XState configuration

This would maximize reuse of an existing ecosystem, but it would make the
review artifact too implementation-shaped. It would also make it harder to
preserve source references, review status, ambiguity, and domain language in a
way that remains natural for Spec authors.

### Make generated state machines the primary user-facing artifact

This would make the modelling goal explicit, but it would narrow the project
too much. Spec should help users produce better behavioural specifications regardless of whether they need executable artifacts.

## Follow-up

This decision should inform:

* the canonical interpretation schema
* interpretation prompts and future skills
* the design of any future `packages/interpreter` package
* XState projection and validation experiments
* validation workflows for examples
* test generation experiments
