# ADR 002: Profiles as a Companion Interpretation Layer

## Status

Proposed

---

## Context

Spec defines a lightweight behavioural specification format with:

* structured scenarios (`Given / When / Then`)
* bracketed entities (e.g. `[basket]`, `[product]`)
* natural language clauses
* a formally defined EBNF grammar

The language intentionally defines **structure only**, not meaning.

However, in order to build useful interpreters and authoring assistance, additional clarity is needed around:

* which domain references appear to be base entities
* which names appear to be attributes of those entities
* which names appear to be predicates over those entities
* which of those machine inferences have been accepted by a human

Without this, interpreters must make implicit assumptions about meaning, making those assumptions harder to see, share, or reuse.

At the same time, embedding semantics directly into the Spec language would:

* increase complexity
* reduce flexibility
* prematurely standardise meaning across domains

---

## Decision

We introduce the concept of **profiles** as a companion layer for Spec.

* Profiles are **not part of the Spec language or grammar**
* They are **optional, interpreter-facing artifacts**
* They may be defined and maintained **within the same repository** as Spec
* They capture a sparse structural interpretation of domain language used in one or more specs
* They are intended to be **machine-proposed and human-reviewed**
* They may record entities together with optional attributes, predicates, and clarifying descriptions
* They should remain lightweight and should not attempt to encode execution semantics or a full state model
* They should be versioned as whole documents with top-level `status` and `version`

Interpreters:

* may adopt one or more profiles
* may define their own profiles
* may choose how strictly to enforce them

Authoring tools:

* may load one or more profiles while assisting authors
* may use profiles to surface inconsistent domain vocabulary or likely structural issues in a spec
* should treat such inferences as advisory unless the author accepts changes into the raw specification

Examples may include both:

* a `.spec` file (structure)
* a `profile.yml` file (reviewable structural interpretation)

Whether a repository example should include a profile depends on its purpose. Readability-focused examples may stand alone, while examples intended as validation or interpreter reference points may benefit from an accompanying profile.

---

## Rationale

### Separation of concerns

This preserves a clear boundary:

* Spec → structure
* Profiles → reviewable structural interpretation of domain language
* Interpreters → execution

The core language remains simple and stable.

---

### Supports experimentation

Profiles can evolve independently:

* multiple profiles can coexist
* no need to standardise early
* patterns can emerge from real usage

---

### Improves machine-assisted interpretation and reuse

Profiles provide a shared reference for:

* accepted base entities
* accepted attributes and predicates inferred from the raw spec text
* clarifications that are worth keeping durable

Profiles make semantic assumptions visible and portable, rather than embedded within individual interpreters.

This reduces ambiguity without constraining the language.

---

### Enhances examples

Examples can demonstrate both structure and meaning:

```
examples/shopping-basket/
  shopping-basket.spec
  profile.yml
  README.md
```

This makes the system easier to understand and adopt.

---

### Supports a state-relevant interpretation model

Profiles can also capture structure that is only implicit in how bracketed references are used within the raw spec text.

At the grammar layer, only bracketed text is treated as an entity reference. Phrases such as `[product] quantity`, `[basket] total`, or `[promo code] is valid` still rely on ordinary surrounding language, even though tools may classify them more precisely to improve interpretation and validation.

For example, a profile may distinguish between:

* entities, such as `basket`, `product`, or `discount`
* attributes, such as `[product] quantity`, `[product] price`, or `[basket] total`
* predicates, such as `[basket] is empty`, `[promo code] is valid`, or `[checkout button] is disabled`

This allows the raw `.spec` file to remain simple while giving tools a more explicit model of how those references are currently being interpreted.

Authoring guidance may describe general heuristics for identifying such patterns, but those heuristics are not themselves semantic definitions. For example, an assistive tool may notice that `[product] quantity` appears to be an attribute of `product`, or that `[promo code] is valid` appears to be a predicate over `promo code`. These interpretations should be surfaced as suggestions for the author to confirm or reject.

Once accepted, that structure should be captured explicitly in the profile so it becomes durable, visible, and portable rather than remaining a local tool inference.

The current working profile format is intentionally narrower than a full interpretation layer. It focuses on the categories that seem most useful alongside the grammar for downstream state-oriented interpretation:

* entities
* attributes
* predicates

Relations, events, qualifiers, and other distinctions may still matter later, but they are not part of the current minimal profile format.

Profiles are also intended to be easy working documents for human-in-the-loop iteration. The simplest current versioning model is:

* one profile document per version
* top-level `status: draft` or `status: accepted`
* top-level `version` incremented whenever a new draft is created

Diffing, history, and more advanced version lineage can then be delegated to Git or to separate tooling rather than encoded inside the document.

This separation allows tools to combine a minimal shared semantic layer with deeper downstream interpretation while keeping the core grammar unchanged.

---

### Enables future standardisation

If common patterns emerge, profiles may later evolve into:

* recommended profiles
* shared conventions
* or optional standards

This can happen incrementally, based on real-world use.

---

## Consequences

### Positive

* Spec remains minimal and readable
* Machines have a reviewable record of accepted structural interpretation
* AI tools have more stable context for repeated reasoning
* Multiple domains can define their own semantics

---

### Trade-offs

* Specs alone do not fully define behaviour
* Different interpreters may still diverge
* Additional artifacts increase conceptual surface area

---

## Alternatives Considered

### 1. Embed semantics in the language

Rejected because it:

* increases complexity
* reduces flexibility
* forces early standardisation

---

### 2. Keep semantics entirely outside the project

Rejected because it:

* fragments the ecosystem
* weakens examples
* makes adoption harder

---

### 3. Define canonical semantics immediately

Rejected because:

* the design is still evolving
* insufficient real-world examples exist
* risks locking in poor abstractions

---

## Notes

* Semantic profiles should remain **declarative**, not executable
* They should capture accepted interpretation, not implementation
* They must not redefine the structure of Spec itself
* The minimal useful profile format should stay small until a stronger need emerges

Future work may include:

* defining a minimal profile format
* creating example profiles (e.g. commerce, finance)
* identifying whether any cross-domain conventions are worth standardising separately
* determining whether profiles are a useful long-term input to deeper translation layers such as state-machine generation

---

## Summary

Profiles provide a structured way to capture and review machine interpretation of domain language without expanding the core grammar.

They allow the project to balance:

* simplicity (in the language)
* flexibility (in machine interpretation)
* and consistency (across tools and iterations)

while keeping the core philosophy intact.
