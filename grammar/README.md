# Grammar

This directory defines the formal grammar for `.spec` files.

A `.spec` file captures the **structure** of a behavioural specification.

## Overview

A `.spec` file describes behaviour and properties using scenarios written in natural language.

Scenarios may include an optional `Scenario:` title and are written using:

1. `Given` for conditions or preconditions
2. `When` for an event
3. `Then` for resulting properties

Structural keywords are case-insensitive, so `given`, `WHEN`, and `Then`
are equivalent.

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

## Reference Parser

The grammar in [spec.ebnf](spec.ebnf) is the authoritative syntax source. The
canonical parser implementation lives in
[`../packages/parser`](../packages/parser) and emits the public JSON AST for
valid `.spec` files.

The parser package ships a generated snapshot of this grammar so releases are
self-contained. After changing [spec.ebnf](spec.ebnf) or
[grammar.json](grammar.json), run:

```sh
npm run sync:grammar
```

The parser test suite verifies that the packaged grammar snapshot remains
byte-for-byte identical to the root grammar files.

## Versioning

Grammar version, AST version, and parser package semver are related but
separate:

* grammar version tracks accepted `.spec` syntax
* AST version tracks the canonical JSON output contract
* package semver tracks library and CLI release compatibility

Use this policy:

* formatting/comment-only grammar documentation changes do not require a grammar
  version bump
* changes to syntax accepted or rejected by the grammar require a grammar
  version bump
* changes to the AST JSON shape require an AST version bump
* parser bug fixes without syntax or AST contract changes use package semver
  only

## Formal Grammar

The full EBNF is defined in [spec.ebnf](spec.ebnf).
