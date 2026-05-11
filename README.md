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

It introduces a document schema that allows an interpreter, for example an AI agent, to:

* Extract:

  * Entities
  * State variables
  * Transitions
  * Invariants
* Represent its interpretation explicitly
* Surface that interpretation for review and refinement

This enables:

* Detection of ambiguity
* Identification of inconsistencies
* Clarification of intent

This happens without requiring the author to encode everything perfectly upfront.

---

### 4. Towards Executable Models

With consistent structure and explicit interpretation, specifications can be used to:

* Generate state machines
* Validate completeness of scenarios
* Identify missing transitions or edge cases

This is not required to use Spec, but it becomes possible.

---

## Relationship to Existing Practices

Spec is intentionally methodology-neutral.

A Spec document may come from collaborative workshops, product conversations,
acceptance criteria, domain modelling, BDD-style practices, existing test cases,
or individual design work.

Spec focuses on the artefact that follows that work:

> **Shared understanding to structured specification to interpretation to optional execution**

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
* Interpretation schemas
* Tooling for authoring and review

The first canonical parser is available in
[`packages/parser`](packages/parser).
