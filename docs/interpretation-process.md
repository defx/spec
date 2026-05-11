# Interpretation Process

The interpretation process turns canonical parser output into a reviewable
state-machine interpretation.

It does not parse `.spec` files directly. The parser is the only component that
understands Spec syntax. Interpreters consume the parser AST and preserve links
back to the AST blocks and clauses they used.

## Pipeline

```text
1. Author a .spec file
2. Parse it with the canonical parser
3. Interpret the parser AST
4. Review and edit interpretation.yml
5. Use accepted interpretation for downstream workflows
```

## Inputs

The interpreter should receive:

* the canonical parser AST JSON
* the target interpretation schema version
* optional existing `interpretation.yml` content when refining prior work

The raw `.spec` file may be available for display or source lookup, but it
should not be the interpretation input. This keeps all interpretation work
grounded in the same structural contract used by downstream tools.

## Output

The interpreter outputs an `interpretation.yml` document conforming to:

```text
schemas/interpretation.schema.json
```

The document should be conservative. It should capture the smallest useful
interpretation that explains the parsed scenarios and can be projected into a
state-machine model for validation.

Downstream workflows may include improving the original specification,
generating test cases, checking consistency, exploring state-machine models, or
producing executable artifacts. State-machine modelling is a design constraint
on the interpretation, not the required user-facing destination for every user.

An actual state-machine model may be produced in the background to validate the
interpretation. That model does not always need to be exposed as a durable
artifact, but the interpretation should be concrete enough that such a model can
be constructed and used to check consistency, completeness, and determinism.

## State-Machine Focus

The interpreter should identify:

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
