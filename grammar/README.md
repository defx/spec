# Grammar

This directory defines the formal grammar for `.spec` files.

A `.spec` file captures the **structure** of a behavioural specification.

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

