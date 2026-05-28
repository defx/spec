# Spec Interpreter

Utilities for loading, validating, and projecting reviewed Spec interpretation
documents.

`@defx/spec-interpreter` works with `interpretation.yml` files: reviewable
companion documents that capture the state-machine meaning inferred from a
`.spec` file. The package keeps that interpretation inspectable and validates
that it is coherent enough to project into downstream tooling.

The first projection target is a serializable XState-compatible machine config.
The package does not execute XState machines yet.

## What It Provides

### Interpretation document types

The package exports TypeScript types for the full interpretation document shape:

- document metadata, review status, source spec references, notes, and
  ambiguities
- model context, states, events, transitions, invariants, and source references
- state and context conditions, compound conditions, assignment effects, and
  custom action effects
- validation results and XState-compatible projection types

The core document has this shape:

```yaml
kind: spec-interpretation
version: 1
status: reviewed
spec:
  path: examples/example.spec
  ast:
    kind: spec-ast
    version: 1
model:
  id: example
  initial: idle
  states:
    - id: idle
      name: idle
  events: []
  transitions: []
```

### YAML loading

`loadInterpretation(path)` reads an interpretation YAML file, parses it, validates
it, and returns a typed `InterpretationDocument`.

Invalid YAML or invalid interpretation content throws
`InterpretationValidationError`, which includes the file path and structured
validation errors.

```ts
import { loadInterpretation } from "@defx/spec-interpreter";

const interpretation = await loadInterpretation(
  "examples/shopping-basket/interpretation.yml"
);
```

Use `validateInterpretationFile(path)` when you want a `{ ok, errors }` result
instead of an exception.

### Schema and structural validation

Validation has two layers:

1. JSON Schema validation against `schemas/interpretation.schema.json`.
2. Structural reference checks that make sure the model is internally coherent.

The package bundles its own copy of the schema, so consumers can validate files
without depending on paths outside the published package. A custom schema path
can be supplied when needed.

Structural validation checks that:

- `model.initial` names a defined state
- transition `from` and `to` values name defined states
- transition `event` values name defined events
- guard and invariant conditions reference defined states and context keys
- assignment effects reference defined context keys
- `sourceRefs` only contain `scenario`, `phase`, and `clause`
- `notes` are strings

```ts
import { validateInterpretation } from "@defx/spec-interpreter";
import YAML from "yaml";

const data = YAML.parse(source);
const result = await validateInterpretation(data);

if (!result.ok) {
  console.error(result.errors);
}
```

### XState-compatible projection

`buildXStateMachine(interpretation)` converts a valid interpretation document
into a plain serializable machine config shaped for XState.

```ts
import {
  buildXStateMachine,
  loadInterpretation
} from "@defx/spec-interpreter";

const interpretation = await loadInterpretation(
  "examples/shopping-basket/interpretation.yml"
);
const machine = buildXStateMachine(interpretation);
```

Projection rules:

- machine `id` and `initial` come from `model.id` and `model.initial`
- machine `context` is built from each context entry's `initial` value
- states are projected recursively, including nested states, tags, final states,
  parallel states, and child initial states
- state metadata preserves name, description, review status, and source refs
- transitions are attached to the state named by `transition.from`
- transitions are grouped by event under `state.on[event]`
- multiple transitions for the same state and event become an array
- guards are emitted as `spec.condition` descriptors
- assignment effects are emitted as `spec.assign` descriptors
- custom action effects pass through using their action name and params
- top-level machine metadata includes interpretation metadata and invariants

The projected config is intentionally data-only. Guard evaluation, assignment
application, and action execution are left to downstream runtime code.

## CLI

Validate one or more interpretation files with the package CLI:

```sh
npm --workspace @defx/spec-interpreter run validate -- ../../examples/shopping-basket/interpretation.yml
```

After the package is built or installed, the binary is:

```sh
spec-interpretation <interpretation.yml> [...]
```

Valid files print a `passed validation` message. Invalid files print formatted
validation errors and cause a non-zero exit code.

## Public API

```ts
export {
  buildXStateMachine,
  formatValidationErrors,
  loadInterpretation,
  validateAgainstSchema,
  validateInterpretation,
  validateInterpretationFile,
  validateStructure,
  InterpretationValidationError
} from "@defx/spec-interpreter";
```

The package also exports the main document, validation, and XState projection
types.

## Current Limits

- The package builds an XState-compatible config but does not execute it.
- Guard conditions are preserved as descriptors; they are not evaluated here.
- Assignment and action effects are preserved as descriptors; they are not run
  here.
- Validation checks important references, but it is not yet a complete semantic
  model checker for every possible modeling mistake.
