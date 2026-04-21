# ADR 002: Semantic Profiles as a Domain Extension Layer

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

However, in order to build useful interpreters, additional clarity is needed around:

* relations (e.g. `contains`, `equals`)
* value constraints (e.g. `plus`, `minus`)
* dependency handling (e.g. how dependencies are determined for clauses, particularly for derived properties, such as whether all referenced entities must be declared in `Given`, or may be inferred)
* evaluation rules (e.g. how expressions are resolved, how missing inputs are handled, or whether partial evaluation is allowed)

Without this, interpreters must make implicit assumptions about meaning, making those assumptions harder to see, share, or reuse.

At the same time, embedding semantics directly into the Spec language would:

* increase complexity
* reduce flexibility
* prematurely standardise meaning across domains

---

## Decision

We introduce the concept of **semantic profiles** as a domain extension layer for Spec.

* Semantic profiles are **not part of the Spec language or grammar**
* They are **optional, interpreter-facing artifacts**
* They may be defined and maintained **within the same repository** as Spec
* They extend the core language with domain-specific entities, operators, terms, and interpretation rules without changing the underlying grammar

Interpreters:

* may adopt one or more semantic profiles
* may define their own profiles
* may choose how strictly to enforce them

Authoring tools:

* may load one or more semantic profiles while assisting authors
* may use profiles to surface inconsistencies, unsupported operators, or likely structural issues in a spec
* should treat such inferences as advisory unless the author accepts changes into the raw specification

Examples may include both:

* a `.spec` file (structure)
* a semantic profile file (meaning)

Whether a repository example should include a semantic profile depends on its purpose. Readability-focused examples may stand alone, while examples intended as validation or interpreter reference points may benefit from an accompanying profile.

---

## Rationale

### Separation of concerns

This preserves a clear boundary:

* Spec → structure
* Semantic profiles → domain-specific meaning and language extensions
* Interpreters → execution

The core language remains simple and stable.

---

### Supports experimentation

Semantic profiles can evolve independently:

* multiple profiles can coexist
* no need to standardise early
* patterns can emerge from real usage

---

### Improves interpreter clarity and reuse

Profiles provide a shared reference for:

* domain-specific entities and terms
* supported relations
* value expressions
* dependency expectations

Profiles make semantic assumptions visible and portable, rather than embedded within individual interpreters.

This reduces ambiguity without constraining the language.

---

### Enhances examples

Examples can demonstrate both structure and meaning:

```
examples/shopping-basket/
  shopping-basket.spec
  shopping-basket.semantics.yml
  README.md
```

This makes the system easier to understand and adopt.

---

### Supports a structured naming model

Semantic profiles can also capture structure that is only implicit in bracketed references within the raw spec text.

At the grammar layer, references such as `[product]`, `[existing product]`, and `[product quantity]` are all simply entities. The semantic layer may classify them more precisely to improve interpretation and validation.

For example, a semantic profile may distinguish between:

* base entities, such as `basket`, `product`, or `discount`
* role-qualified references, such as `existing product` or `new product`
* property references, such as `product quantity`, `product price`, or `basket total`

This allows the raw `.spec` file to remain simple while giving tools a more explicit model of what those references mean.

Authoring guidance may describe general heuristics for identifying such patterns, but those heuristics are not themselves semantic definitions. For example, an assistive tool may notice that `existing product` appears to be a role-qualified form of `product`, or that `product quantity` appears to be a property reference. These interpretations should be surfaced as suggestions for the author to confirm or reject.

Once accepted, that structure should be captured explicitly in the semantic profile so it becomes durable, visible, and portable rather than remaining a local tool inference.

This also supports the idea of multiple semantic profiles with different scopes. For example:

* a specification-level profile may capture project-specific entities, roles, and properties
* a reusable shared profile may capture operators, arithmetic expressions, or other conventions that apply across multiple specifications

This separation allows tools to combine general reusable semantics with project-specific meaning while keeping the core grammar unchanged.

---

### Enables future standardisation

If common patterns emerge, semantic profiles may later evolve into:

* recommended profiles
* shared conventions
* or optional standards

This can happen incrementally, based on real-world use.

---

## Consequences

### Positive

* Spec remains minimal and readable
* Interpreters have a clearer target for implementation
* AI tools have more structured context for reasoning
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
* They should describe meaning, not implementation
* They must not redefine the structure of Spec itself

Future work may include:

* defining a minimal profile format
* creating example profiles (e.g. commerce, finance)
* documenting interpreter expectations

---

## Summary

Semantic profiles provide a structured way to extend Spec for particular domains without expanding the core grammar.

They allow the project to balance:

* simplicity (in the language)
* flexibility (across domains)
* and consistency (across interpreters)

while keeping the core philosophy intact.
