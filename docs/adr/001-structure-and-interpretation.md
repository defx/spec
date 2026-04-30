# ADR 001: Keep Spec lightweight and delegate interpretation assistance to AI with a human in the loop

## Status

Proposed

## Context

Spec exists to reduce the cognitive load of turning shared understanding into a precise, machine-usable behavioural specification.

It is not a replacement for collaborative discovery practices such as Example Mapping or Specification by Example. The conversation remains the primary work. The specification artifact is the structured outcome of that work.

As Spec is applied to more realistic examples, a tension appears between two goals:

* keeping specifications concise, natural, and readable
* making specifications explicit enough for machines to interpret consistently

This tension becomes especially visible when modelling state relationships, scope, and implicit domain structure.

For example, a phrase such as `item count` may be naturally understood by a human reader as belonging to basket state in a shopping-basket example. However, that scoping is not always explicit in the raw text itself, and forcing authors to encode every such relationship directly into the specification would increase cognitive load and make specifications less natural to write.

At the same time, relying only on disciplined manual writing is unlikely to scale well. Writing highly consistent, machine-usable specifications by hand places too much burden on authors and risks undermining the goal of making specification easier and more trustworthy.

Spec therefore needs AI-assisted interpretation that can help surface likely meaning, make that interpretation inspectable, and allow a human author to review and refine it.

Such interpretation may help identify:

* entities
* state variables
* transitions
* invariants
* likely structural relationships between references
* inconsistent or overlapping domain vocabulary

## Decision

Spec itself will remain focused on the structure of behavioural specifications rather than attempting to encode all semantic disambiguation directly in the language.

This means:

* the core Spec format should stay lightweight and readable
* the raw specification should primarily capture structured behavioural intent, not every inferred semantic relationship
* AI-assisted interpretation may surface meaning that is not fully explicit in the raw text
* those interpretations are advisory unless accepted by a human reviewer
* accepted interpretations may be captured in separate interpretation documents rather than pushed back into the raw specification

AI-assisted interpretation is therefore treated as an important companion process, not as part of the core language.

## Consequences

### Positive

* Specifications can remain shorter and more natural.
* The core language can stay focused on structure.
* Cognitive load is reduced because authors do not need to encode every semantic detail by hand.
* Interpretation can be made explicit and reviewable without making the raw specification verbose.
* Interpretation practices can evolve independently of the grammar.

### Trade-offs

* Some semantic meaning may exist in interpretation documents rather than being fully explicit in the raw specification.
* Good AI-assisted interpretation becomes more important for usability and adoption.
* Different interpretations may still vary unless they are surfaced and reviewed clearly.

## Guardrails

To keep this separation healthy, AI-assisted interpretation should follow these principles:

* inferred interpretation should be visible to the author
* inferred interpretation should be reviewable and editable by the author
* the raw specification should remain the primary authored artifact
* interpretation documents should act as companion documents, not as replacements for the raw specification
* AI should assist rather than silently redefine the meaning of the specification

In other words, AI may propose an interpretation, but it should not hide it.

## Implications for examples in this repository

Examples in this repository should aim to be:

* disciplined and internally consistent
* readable without requiring interpretation support
* realistic enough to expose genuine modelling pressure
* not overloaded with incidental detail purely to satisfy hypothetical machine needs

Where ambiguity exists but can reasonably be surfaced and resolved through AI-assisted interpretation, examples do not need to force all disambiguation directly into the raw text.

## Alternatives considered

### Encode more semantics directly into the language

This would make some interpretations easier, but it risks making specifications more verbose, more formal, and less natural to read and write.

### Require authors to write fully explicit specifications by hand

This would maximize explicitness in raw text, but it would place too much burden on authors.

### Leave all interpretation implicit inside AI or downstream tooling

This keeps the language simple, but it hides assumptions and makes interpretation harder to review, compare, and refine.

## Follow-up

This decision should inform:

* example design in this repository
* future interpretation guidance
* the design of any reference or experimental interpretation workflow
* the design of interpretation documents
