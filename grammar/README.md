# Grammar

This directory defines the formal grammar for `.spec` files.

A `.spec` file captures the **structure** of a behavioural specification. It does not by itself standardise domain-specific entities, attributes, predicates, or meanings. Those can be layered on separately through profiles.

## Overview

A `.spec` file describes behaviour and properties using scenarios written in natural language.

Scenarios are written using:

1. `Given` for conditions or preconditions
2. `When` for an event
3. `Then` for resulting properties

The grammar currently supports three structural shapes:

1. `Given / When / Then`
2. `When / Then`
3. `Given / Then`

These allow both transitions and invariants to be expressed while keeping the syntax small.

## Clauses

A clause is plain natural-language content inside a `Given`, `When`, `Then`, or `And` line.

Examples:

```text
basket contains product
user taps checkout button
basket count equals 1
basket total equals product price minus discount amount
```

At the grammar layer, words such as `contains`, `equals`, `minus`, or `multiplied by` are not special syntax. They are simply part of the clause text. Their meaning may be interpreted later by tooling or by profiles loaded for a particular domain.

## Sections

### Given

`Given` describes conditions that must hold.

### When

`When` describes the event phase of a transition.

### Then

`Then` describes properties that hold after the scenario or under the stated conditions.

## Example

```text
Given basket is empty
When the user adds product to basket
Then basket count equals 1
```

## Comments

The grammar supports comment lines beginning with `#`.

Comments attach to the block that follows them.

## Formal Grammar

The full EBNF is defined in [spec.ebnf](spec.ebnf).

## Scope

The grammar intentionally defines:

* structural phases
* clause boundaries
* clause shape
* block layout

It intentionally does **not** define:

* domain-specific entities, attributes, or predicates
* domain-specific interpretation
* execution semantics

Those concerns are part of the wider project and may be handled through profiles and tooling.
