# ADR 002: Semantic Profiles as a Companion Layer

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
* dependency handling
* evaluation rules

Without this, interpreters must make implicit assumptions, leading to inconsistency.

At the same time, embedding semantics directly into the Spec language would:

* increase complexity
* reduce flexibility
* prematurely standardise meaning across domains

---

## Decision

We introduce the concept of **semantic profiles** as a companion layer to Spec.

* Semantic profiles are **not part of the Spec language or grammar**
* They are **optional, interpreter-facing artifacts**
* They may be defined and maintained **within the same repository** as Spec

Interpreters:

* may adopt one or more semantic profiles
* may define their own profiles
* may choose how strictly to enforce them

Examples may include both:

* a `.spec` file (structure)
* a semantic profile file (meaning)

---

## Rationale

### Separation of concerns

This preserves a clear boundary:

* Spec → structure
* Semantic profiles → meaning
* Interpreters → execution

The core language remains simple and stable.

---

### Supports experimentation

Semantic profiles can evolve independently:

* multiple profiles can coexist
* no need to standardise early
* patterns can emerge from real usage

---

### Improves interpreter consistency

Profiles provide a shared reference for:

* supported relations
* value expressions
* dependency expectations

This reduces ambiguity without constraining the language.

---

### Enhances examples

Examples can demonstrate both structure and meaning:

```
examples/shopping-basket/
  shopping-basket.spec
  shopping-basket.semantics
  README.md
```

This makes the system easier to understand and adopt.

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

Semantic profiles provide a structured way to define meaning without expanding the Spec language.

They allow the project to balance:

* simplicity (in the language)
* flexibility (across domains)
* and consistency (across interpreters)

while keeping the core philosophy intact.
