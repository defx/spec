# ADR: Keep Spec lightweight and delegate semantic assistance to authoring tools

## Status

Proposed

## Context

Spec is intended to be a lightweight format for describing software behaviour in a way that remains readable by humans while being interpretable by machines.

As the language is applied to more realistic examples, a tension appears between two goals:

* keeping specifications concise, natural, and readable
* making specifications explicit enough for tools to interpret consistently

This tension becomes particularly visible when modelling state relationships and scope.

For example, a phrase such as `[item count]` may be naturally understood by a human reader as belonging to the basket slice of state in a shopping basket example. However, that scoping is not always explicit in the text itself, and forcing authors to encode every such relationship directly into the specification could make specifications more verbose and less natural.

At the same time, relying only on disciplined manual writing is unlikely to scale well. Writing highly consistent specifications by hand places a large burden on authors and may become a barrier to adoption.

A future authoring UI is expected to play an important role in making Spec practical to write and maintain. That UI may provide capabilities such as:

* extracting and listing entities from a specification
* suggesting consolidation of similar or inconsistent entity names
* inferring likely structural relationships between entities
* showing how parts of the specification may map into state
* allowing authors to inspect and correct those inferred relationships

## Decision

Spec itself will remain focused on the structure of behavioural specifications rather than attempting to encode all semantic disambiguation directly in the language.

This means:

* the core Spec format should stay lightweight and readable
* specifications do not need to carry every inferred structural relationship explicitly
* interpreters may define the relations and operators they support
* authoring tools may infer, surface, and help maintain structural or semantic relationships that are not fully explicit in the raw text

The authoring UI is therefore treated as an important assistive layer, not as part of the core language.

## Consequences

### Positive

* Specifications can remain shorter and more natural.
* The core language can stay flexible and relatively un-opinionated.
* Tooling can help authors maintain consistency without forcing excessive verbosity into the spec text.
* Semantic assistance can evolve independently of the core format.
* Future interpreters can experiment with different mappings without requiring frequent grammar changes.

### Tradeoffs

* Some semantic meaning may exist in inferred or assisted form rather than being fully explicit in the raw text.
* Good authoring tools become more important for usability and adoption.
* Different tools may infer slightly different relationships unless conventions are documented and surfaced clearly.

## Guardrails

To keep this separation healthy, any authoring or interpreter tooling should follow these principles:

* inferred structure should be visible to the author
* inferred structure should be editable by the author
* the raw specification should remain the primary authored artifact
* tooling should assist rather than silently redefine the meaning of the specification

In other words, the UI may propose interpretations, but it should not hide them.

## Implications for examples in this repository

Examples in this repository should aim to be:

* disciplined and internally consistent
* readable without requiring tooling
* realistic enough to expose genuine modelling pressure
* not overloaded with incidental detail purely to satisfy hypothetical interpreter needs

Where ambiguity exists but can reasonably be resolved by future authoring tools, examples do not need to force all disambiguation directly into the text.

## Alternatives considered

### Encode more semantics directly into the language

This would make some interpretations easier, but it risks making specifications more verbose, more formal, and less natural to read and write.

### Require authors to write fully explicit specifications by hand

This would maximize explicitness in raw text, but it would place too much burden on authors and likely reduce adoption.

### Leave all interpretation to interpreters with no authoring assistance

This keeps the language simple, but it misses an important opportunity to help authors write consistent specifications and understand how tooling interprets them.

## Follow-up

This decision should inform:

* example design in this repository
* future semantic guidance
* the design of any reference or experimental interpreter
* the design of any future authoring UI
