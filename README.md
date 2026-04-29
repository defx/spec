# Spec

**A structured, machine-interpretable approach to writing behavioural specifications without the cognitive overhead of traditional Gherkin.**

---

## Why Spec Exists

For over a decade, practices like Behaviour-Driven Development (BDD) and Specification by Example have helped teams answer the hardest question in software:

> *What are we actually trying to build and why?*

Techniques like Example Mapping emphasise something critical:

* The conversation is the real work
* The specification artefact is a by-product

That insight still holds.

But in practice, teams hit a recurring problem:

* Writing good specifications (for example Gherkin) is hard
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

* Example Mapping
* Collaborative specification conversations
* Domain discovery

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

### 2. Structured Interpretation (Human-in-the-Loop)

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

### 3. Towards Executable Models

With consistent structure and explicit interpretation, specifications can be used to:

* Generate state machines
* Validate completeness of scenarios
* Identify missing transitions or edge cases

This is not required to use Spec, but it becomes possible.

---

## Relationship to Existing Practices

Spec builds on existing practices:

* Use Example Mapping to have the conversation
* Use Spec to capture the outcome in a structured, inspectable way

Think of it as:

> **Conversation to Spec to Interpretation to (optional) Execution**

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
* Reference parsing
* Interpretation schemas
* Tooling for authoring and review


