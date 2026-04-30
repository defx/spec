# ADR 002: Interpretation Documents as a Companion Layer

## Status

Proposed

## Context

Spec defines a lightweight behavioural specification format with:

* structured scenarios (`Given / When / Then`)
* plain natural-language clauses
* a formally defined grammar

The language intentionally defines structure, not meaning.

This is a deliberate choice. Spec is meant to reduce the cognitive load of writing high-quality behavioural specifications while preserving a format that is both human-readable and machine-usable.

However, useful interpretation still requires additional clarity around questions such as:

* which domain references appear to be entities
* which references appear to be attributes or state variables
* which references appear to be predicates or invariants
* which transitions or relationships have been inferred from the structured text
* which of those AI-assisted interpretations have been reviewed and accepted by a human

Without a way to make those interpretations explicit, meaning remains partly implicit inside the reader or the tool. That makes interpretation harder to inspect, harder to compare, and harder to reuse across iterations.

At the same time, embedding all of that meaning directly into the Spec language would:

* increase complexity
* reduce flexibility
* increase authoring burden
* prematurely standardise semantics across domains

## Decision

We introduce the concept of **interpretation documents** as a companion layer for Spec.

* Interpretation documents are **not part of the Spec language or grammar**
* They are **optional companion artifacts**
* They capture a **structured, reviewable interpretation** of a spec
* They are intended to be produced through **AI-assisted interpretation with a human in the loop**
* They exist to make interpretation explicit, inspectable, and iteratable
* They may record entities, attributes, predicates, transitions, invariants, and clarifying notes
* They should remain lightweight and should not attempt to encode execution semantics or an implementation model

An interpretation document is not the specification itself. It is a durable record of how a spec is currently being interpreted.

This allows interpretation to be:

* proposed by AI
* reviewed and corrected by a human
* refined over time
* reused across iterations without changing the raw specification

Examples may include both:

* a `.spec` file containing the raw structured specification
* an `interpretation.yml` file containing the current accepted interpretation of that spec

For now, the working model is one spec and one companion interpretation document. Readability-focused examples may stand alone, while examples intended to support interpretation, validation, or downstream experimentation may benefit from including both artifacts.

## Rationale

### Separation of concerns

This preserves a clear boundary:

* Spec -> structured behavioural text
* Interpretation documents -> explicit, reviewable meaning derived from that text
* Downstream tools and workflows -> consumers of that interpretation

The core language remains simple and stable.

### Supports human-in-the-loop interpretation

The project treats interpretation as something that should be inspectable, reviewable, and refinable.

Interpretation documents provide a concrete place for that to happen. They allow AI to propose a reading of a specification while keeping that reading visible to a human, rather than burying it inside a tool or process.

### Reduces hidden assumptions

Interpretation documents provide a shared reference for:

* accepted entities
* accepted attributes, predicates, transitions, and invariants
* clarifications worth preserving across iterations

This makes interpretive assumptions visible and durable rather than tool-local or ephemeral.

### Supports experimentation

Interpretation documents can evolve independently of the grammar:

* different interpretations can be explored over time
* patterns can emerge from real usage
* the project can learn from practice before standardising further

### Enhances examples

Examples can demonstrate both structure and interpretation:

```text
examples/shopping-basket/
  shopping-basket.spec
  interpretation.yml
