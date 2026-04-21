# Grammar

This directory defines the formal grammar for `.spec` files.

A `.spec` file captures the **structure** of a behavioural specification. It does not by itself standardise domain-specific operators, terms, or interpretation rules. Those can be layered on separately through semantic profiles.

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

## Entities

Entities are the bracketed items inside a clause.

Examples:

```text
[user]
[basket]
[product]
[checkout button]
```

Entities identify things in the system in a way that parsers can locate reliably, while the surrounding text remains natural language.

## Clauses

A clause contains one or more bracketed entities, with natural language around them.

Examples:

```text
[basket] contains [product]
[user] taps [checkout button]
[basket count] equals 1
[basket total] equals [product price] minus [discount amount]
```

At the grammar layer, words such as `contains`, `equals`, `minus`, or `multiplied by` are not special syntax. They are simply part of the clause text. Their meaning may be interpreted later by tooling or by semantic profiles loaded for a particular domain.

## Sections

### Given

`Given` describes conditions that must hold.

### When

`When` describes the event phase of a transition.

### Then

`Then` describes properties that hold after the scenario or under the stated conditions.

## Example

```text
Given [basket] is [empty]
When the [user] adds [product] to [basket]
Then [basket] contains [product]
And [basket count] equals 1
```

## Comments

The grammar supports comment lines beginning with `#`.

Comments attach to the block that follows them.

## Formal Grammar

The full EBNF is defined in [spec.ebnf](/Users/matthewdonkin/Projects/defx/spec/grammar/spec.ebnf).

## Scope

The grammar intentionally defines:

* structural phases
* entities
* clause shape
* block layout

It intentionally does **not** define:

* canonical operators
* canonical value expressions
* domain-specific entities or terms
* execution semantics

Those concerns are part of the wider project and may be handled through semantic profiles and tooling.
