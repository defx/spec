# Spec

**A structured, machine-interpretable approach to writing behavioural specifications.**

---

## Why Spec Exists

Teams use many practices to clarify software behaviour: conversations, examples,
acceptance criteria, tests, models, and structured specification techniques.
Whatever the approach, the same hard question keeps coming up:

> *What are we actually trying to build, and how should it behave?*

Good specification work tends to preserve something important:

* Shared understanding comes before the written artefact
* The artefact should make that understanding easier to inspect, discuss, and trust

That insight still holds.

But in practice, teams hit a recurring problem:

* Writing good behavioural specifications is hard
* Poorly written specs quickly become ambiguous, inconsistent, or misleading
* The cognitive load of doing it well is high
* As a result, many teams either:

  * abandon the artefact, or
  * produce something that machines and humans both struggle to trust

As one practitioner put it:

> “It takes too much cognitive load to write them well and when they’re not written well, the issues compound.”

Spec exists to address that gap.

---

## What Spec Is (and Isn’t)

Spec is not a replacement for:

* Collaborative specification conversations
* Domain discovery
* Product, design, or engineering judgement
* Existing discovery, modelling, or testing practices

Instead, Spec focuses on what comes after:

> **How do we turn shared understanding into a precise, low-friction, machine-usable specification?**

---

## The Core Idea

Spec reframes behavioural specifications as:

* State transitions (Given to When to Then)
* Invariants (conditions that must hold for a valid state, expressed through Given and Then clauses)

It then formalises that structure with a grammar.

This does three things:

1. Reduces cognitive load

   * Authors do not have to figure out how to write good Gherkin
   * The structure is explicit and enforced

2. Eliminates ambiguity in form, not meaning

   * The syntax is constrained
   * The interpretation becomes inspectable

3. Makes specifications trivially machine-readable

   * No heuristics required to parse intent
   * Structure is guaranteed

---

## The Problem with Traditional Gherkin

Gherkin is powerful, but fragile.

In theory:

* It provides a clean Given, When, Then structure

In practice:

* It is easy to write syntactically valid but semantically unclear scenarios
* Different authors interpret structure differently
* Tooling often relies on conventions rather than guarantees

The result:

* High variability in quality
* Increased cognitive effort
* Reduced trust in the artefact

Spec addresses this by tightening the structure without increasing the burden on the author.

---

## How Spec Works

### 1. A Formal Grammar

Spec defines a canonical [grammar](grammar/spec.ebnf) (EBNF) for writing specifications.

This ensures:

* Consistent structure
* Deterministic parsing
* Clear separation of concerns (state, actions, outcomes)

---

### 2. A Canonical Parser

Spec includes a canonical TypeScript parser in
[`packages/parser`](packages/parser).

The parser provides:

* a library API via `parseSpec(source, options?)`
* a CLI via `spec parse <file.spec>`
* canonical JSON AST output
* source spans and parse diagnostics for tooling

The parser is intentionally syntactic. It preserves the authored structure and
opaque clause text without inferring entities, attributes, guard conditions, or
effects.

---

### 3. Structured Interpretation (Human-in-the-Loop)

Spec does not stop at parsing.

It introduces a reviewed companion document, `interpretation.yml`, that captures
the meaning inferred from the canonical parser AST. The interpretation is shaped
around state-machine concepts:

* finite states
* typed context values
* events
* guarded transitions
* effects
* invariants
* source references back to parser-derived scenarios and clauses

This enables:

* Detection of ambiguity
* Identification of inconsistencies
* Clarification of intent
* Review of the assumptions that downstream tools will rely on

The canonical schema lives at
[`schemas/interpretation.schema.json`](schemas/interpretation.schema.json), with
supporting documentation in
[`docs/interpretation-schema.md`](docs/interpretation-schema.md) and
[`docs/interpretation-process.md`](docs/interpretation-process.md).

The interpretation layer remains human-in-the-loop: an AI agent may propose an
interpretation, but the accepted artifact is explicit, reviewable, and editable.

---

### 4. Projection Towards Executable Models

With consistent structure and explicit interpretation, specifications can be
projected into state-machine models.

Spec currently includes an interpreter package in
[`packages/interpreter`](packages/interpreter). It can:

* load and validate `interpretation.yml`
* perform structural checks beyond JSON Schema
* build a serializable XState-compatible machine config

XState is the first intended projection target. The interpretation document is
not raw XState configuration, but it is deliberately shaped so projection can be
deterministic.

Executing projected machines and validating full scenario coverage are next-step
interpreter concerns.

---

## Repository Layout

* [`grammar/spec.ebnf`](grammar/spec.ebnf): canonical Spec grammar
* [`packages/parser`](packages/parser): canonical TypeScript parser for `.spec`
  files
* [`schemas/interpretation.schema.json`](schemas/interpretation.schema.json):
  canonical interpretation document schema
* [`packages/interpreter`](packages/interpreter): validation and projection
  utilities for reviewed interpretation documents
* [`prompts/interpretation`](prompts/interpretation): prompts for producing
  conservative interpretation documents from parser AST JSON
* [`examples/shopping-basket`](examples/shopping-basket): example `.spec` file
  and reviewed `interpretation.yml`

---

## Development

Install dependencies:

```sh
npm install
```

Build all workspace packages:

```sh
npm run build
```

Run the test suite:

```sh
npm test
```

Validate the shopping basket interpretation example:

```sh
npm run validate:interpretation
```

---

## Relationship to Existing Practices

Spec is intentionally methodology-neutral.

A Spec document may come from collaborative workshops, product conversations,
acceptance criteria, domain modelling, BDD-style practices, existing test cases,
or individual design work.

Spec focuses on the artefact that follows that work:

> **Shared understanding to structured, inspectable specification**

The goal is to make behavioural intent easier to capture, inspect, parse, and
reason about without requiring teams to adopt a particular discovery practice.

---

## Why This Matters Now

AI has changed the landscape.

We are no longer just writing specifications for humans. We are writing them for:

* Agents that generate code
* Systems that validate behaviour
* Tools that reason about intent

AI systems are only as good as the structure they are given.

Spec provides that structure:

* Clear enough for machines
* Flexible enough for humans
* Designed for collaboration between the two

---

## Project Goals

* Reduce the cognitive load of writing high-quality specifications
* Provide a canonical, parseable structure for behavioural specs
* Enable human-in-the-loop interpretation and refinement
* Support downstream uses (validation, generation, modelling)

---

## Status

Spec is an evolving project exploring:

* Grammar design
* Canonical parsing
* Reviewed interpretation documents
* XState-compatible projection
* Tooling for authoring, review, and validation

The canonical parser is available in [`packages/parser`](packages/parser).

The first interpretation schema, extraction prompt, shopping basket
interpretation example, and interpreter package are also present. The interpreter
currently validates interpretation documents and builds a serializable
XState-compatible machine config; executing those machines and using them to
validate scenario coverage are planned follow-on work.
