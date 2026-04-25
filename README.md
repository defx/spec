# Spec

**Spec** is a working project exploring a lightweight ecosystem for behavioural specification.

At the centre of the project is a minimal `.spec` format for writing scenarios in natural language with explicit structure. Around that core, the project also explores profiles, examples, and tooling patterns that help machines derive working state-oriented interpretations from those specifications.

`Spec` is currently just a placeholder project name.

## What This Repository Contains

This repository is intentionally broader than the `.spec` file format alone.

It currently includes:

* a formal grammar for `.spec` files
* ADRs describing the evolving design
* example specifications
* an example profile showing how interpreted state-relevant structure can be layered on top of the core format

Taken together, these pieces describe an ecosystem rather than just a grammar.

## Project Layers

### 1. Core grammar

The core grammar defines the structure of a `.spec` file:

* scenario blocks
* `Given / When / Then` sections
* bracketed entities such as `[basket]` or `[product]`
* natural-language clauses around those entities

The grammar is intentionally lightweight. It defines structure, not full domain meaning.

See [grammar/README.md](/grammar/README.md) and [grammar/spec.ebnf](/grammar/spec.ebnf).

### 2. Profiles

Profiles capture a sparse, reviewable structural interpretation of the domain language used in a spec without changing the core grammar.

They may define things such as:

* entities
* attributes associated with those entities
* predicates associated with those entities
* optional clarifications where natural language is genuinely ambiguous

For example, a shopping-basket profile may record entities such as `basket` and `product`, attributes such as `count`, `total`, `price`, and `quantity`, and predicates such as `empty`, `valid`, or `disabled`.

Profiles are optional at the language level. They are intended to be proposed by machines, reviewed by humans, and reused by tools so that important state-relevant assumptions do not need to be re-inferred every time.

The simplest working document model is whole-document versioning:

* `profile.yml` is the current interpreted reference for an example or specification
* `status` indicates whether that document is a `draft` or `accepted`
* `version` increments whenever a new draft is created

Draft comparison and history can then be handled externally by Git or by a separate version-management tool.

### 3. Examples

The `examples/` directory shows how the layers fit together in practice.

An example folder may contain:

* a `.spec` file showing the raw authored structure
* a `profile.yml` file showing the interpreted structure used with that spec

If an example folder includes a profile, it is intended to be read as a grammar-plus-profile example rather than a grammar-only example.

### 4. Tooling

Future tooling may use the grammar and any selected profiles to:

* extract and list entities
* highlight inconsistent naming
* surface candidate attributes and predicates
* surface unknown or inconsistent domain vocabulary
* validate scenario structure
* stabilize structural interpretation before deeper machine reasoning

Authoring tools are intended to assist authors while keeping the raw `.spec` file as the primary authored artifact.

## Repository Structure

```text
grammar/
  README.md
  spec.ebnf
examples/
  shopping-basket/
    shopping-basket.spec
    profile.yml
docs/
  adr/
    001-spec-vs-authoring-ui.md
    002-semantics-as-companion-layer.md
```

## Current Example

The shopping basket example currently includes both:

* [shopping-basket.spec](/examples/shopping-basket/shopping-basket.spec)
* [profile.yml](/examples/shopping-basket/profile.yml)

This is the first concrete step toward the profile direction described in ADR 002.

## Design Notes

The current design direction is:

* keep the core grammar small and stable
* allow interpreted state-relevant structure to be layered in through profiles
* use examples and ADRs to evolve the model before standardising too early

Relevant ADRs:

* [ADR 001](/docs/adr/001-spec-vs-authoring-ui.md): authoring assistance and lightweight core language
* [ADR 002](/docs/adr/002-semantics-as-companion-layer.md): profiles as a companion interpretation layer

## Status

This repository is still exploratory.

The core grammar is concrete, but the profile layer is still being shaped through ADRs and examples. The goal at this stage is to make the layers and intent clear to newcomers while leaving room for the design to evolve.
