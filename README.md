# Spec

**Spec** is a working project exploring a lightweight ecosystem for behavioural specification.

At the centre of the project is a minimal `.spec` format for writing scenarios in natural language with explicit structure. Around that core, the project also explores semantic profiles, examples, and tooling patterns that make those specifications increasingly interpretable by machines within a chosen domain.

`Spec` is currently just a placeholder project name.

## What This Repository Contains

This repository is intentionally broader than the `.spec` file format alone.

It currently includes:

* a formal grammar for `.spec` files
* ADRs describing the evolving design
* example specifications
* an example semantic profile showing how domain-specific language can be layered on top of the core format

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

### 2. Semantic profiles

Semantic profiles extend the usable language for a specific domain without changing the core grammar.

They may define things such as:

* domain-specific entities
* operators and terms
* value expressions
* interpretation rules and expectations

For example, a shopping-basket profile may declare operators like `contains` or `equals`, terms like `empty` or `discount`, and expectations around derived values such as basket totals.

Profiles are optional at the language level, but they are an important part of making specifications portable and machine-interpretable within a domain.

### 3. Examples

The `examples/` directory shows how the layers fit together in practice.

An example folder may contain:

* a `.spec` file showing the raw authored structure
* a `.semantics` file showing the domain extension layer used with that spec

If an example folder includes a semantic profile, it is intended to be read as a grammar-plus-profile example rather than a grammar-only example.

### 4. Tooling

Future tooling may use the grammar and any selected semantic profiles to:

* extract and list entities
* highlight inconsistent naming
* surface unsupported operators or terms
* validate scenario structure
* assist interpretation of domain-specific behaviour

Authoring tools are intended to assist authors while keeping the raw `.spec` file as the primary authored artifact.

## Repository Structure

```text
grammar/
  README.md
  spec.ebnf
examples/
  shopping-basket/
    shopping-basket.spec
    shopping-basket.semantics.yml
docs/
  adr/
    001-spec-vs-authoring-ui.md
    002-semantics-as-companion-layer.md
```

## Current Example

The shopping basket example currently includes both:

* [shopping-basket.spec](/examples/shopping-basket/shopping-basket.spec)
* [shopping-basket.semantics](/examples/shopping-basket/shopping-basket.semantics.yml)

This is the first concrete step toward the semantic-profile direction described in ADR 002.

## Design Notes

The current design direction is:

* keep the core grammar small and stable
* allow domain-specific language to be layered in through semantic profiles
* use examples and ADRs to evolve the model before standardising too early

Relevant ADRs:

* [ADR 001](/docs/adr/001-spec-vs-authoring-ui.md): authoring assistance and lightweight core language
* [ADR 002](/docs/adr/002-semantics-as-companion-layer.md): semantic profiles as a domain extension layer

## Status

This repository is still exploratory.

The core grammar is concrete, but the semantic-profile layer is still being shaped through ADRs and examples. The goal at this stage is to make the layers and intent clear to newcomers while leaving room for the design to evolve.
