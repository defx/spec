# Interpretation Process

The interpretation process is an agent-led loop that turns canonical parser
output into a reviewed interpretation, then validates that interpretation by
projecting it into a state-machine model and generating scenario tests.

It does not parse `.spec` files directly. The parser is the only component that
understands Spec syntax. The agent consumes the parser AST, incorporates user
feedback, updates `interpretation.yml`, and uses projection tools to validate
the result.

## Pipeline

```text
1. Author a .spec file
2. Parse it with the canonical parser
3. Run the agent-led interpretation loop over the parser AST
4. Review and edit interpretation.yml with the user
5. Project the interpretation into a state-machine model
6. Generate and run scenario-level validation tests
7. Feed results back into the specification or interpretation
8. Repeat until the interpretation is reviewed or accepted
```

## Inputs

The agent should receive:

* the canonical parser AST JSON
* the target interpretation schema version
* optional existing `interpretation.yml` content when refining prior work
* user feedback, corrections, and acceptance

The raw `.spec` file may be available for display or source lookup, but it
should not be the interpretation input. This keeps all interpretation work
grounded in the same structural contract used by downstream tools.

## Output

The durable output of the loop is an `interpretation.yml` document conforming
to:

```text
schemas/interpretation.schema.json
```

The document should be conservative. It should capture the smallest useful
interpretation that explains the parsed scenarios and can be projected into a
state-machine model for validation.

The agent may also provide conversational feedback: ambiguities, validation
failures, suggested refinements, or generated test summaries. That feedback does
not always need to be written into a durable artifact.

An actual state-machine model should be produced to validate accepted
interpretations. That model does not always need to be exposed as a user-facing
artifact, but it gives the agent and tools a concrete way to check consistency,
completeness, and determinism.

Generated scenario tests are part of that validation loop. They are not merely
a downstream benefit; they help prove that the interpretation can support
deterministic behaviour.

## State-Machine Focus

The agent should identify:

* entities that own or participate in state
* attributes that represent values or collections
* predicates that represent conditions over an entity
* relations that connect entities
* transitions derived from AST transition blocks
* invariants derived from AST invariant blocks
* ambiguities that need human review

For transition blocks:

* `given` clauses become candidate preconditions
* `when` clauses become candidate events
* `then` clauses become candidate postconditions

For invariant blocks:

* `given` clauses become candidate conditions
* `then` clauses become facts that must hold

## Human Review

AI-assisted interpretation is advisory until reviewed. A human reviewer should
check whether:

* entity names preserve the domain language
* attributes and predicates are not over-extracted
* relations are not accidentally represented as predicates
* transitions match the scenario intent
* invariants describe durable rules rather than events
* ambiguities are explicit enough to resolve later

The reviewed document can then be marked `reviewed` or `accepted`.

## Prompt and Skill Artifacts

Prompt files live under:

```text
prompts/interpretation/
```

Those prompts describe the current recommended AI workflow. They are allowed to
evolve faster than the schema.

If the workflow becomes stable enough to package as an agent capability, it can
later move into a dedicated skill while continuing to use the same schema.
