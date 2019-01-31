# spec

## Rationale

**spec** is a simple standard for describing Given-When-Then scenarios using notation that is easy to parse for the purpose of generating code directly from the specification. This document describes **spec** to help facilitate implementation of parsers in different languages.

## Spec

This specification is currently informal, and will be developed further with feedback from implementors.

## General considerations

Scenarios can be described in one or more text files using the `.spec` extension for easy identification.

`.spec` files should be encoded using UTF-8.

Each scenario within a file is separated by two carriage return or new line characters.

## Entities

**Entities** within a scenario are wrapped in square brackets to identify them to the parser.

Entity types are intended to be inferred by the parser from their positional placement.

There are three types of entities:

- **Subject**: _(Such as a user, or a named component)_
- **Events**: _(Such as "tap" or "scroll")_
- **States**: _(Such as "open" or "closed")_

## Examples

### Abstract

> Given that the `[subject]` is currently in `[state 1]`<br/>
> When the `[event]` takes place<br/>
> Then the `[subject]` is now in `[state 2]`

### Concrete

> Given that the `[navigation]` is `[closed]`<br/>
> When the `[user]` `[taps]` or `[clicks]` the `[hamburger icon]`<br/>
> Then the `[navigation]` is `[opening]`

### Token Replacement

Mustache notation is used to allow a state to be identified dynamically at runtime. This is useful in cases such as the following where the changing state of one subject may affect the state of another subject.

> Given that the `[user dropdown]` is `[closed]`<br/>
> When the `[user]` `[touches]` the `[user icon]`<br/>
> Then the `{{active dropdown}}` is `[closing]`<br/>
> And the `[user dropdown]` is `[opening]`<br/>
> And the `[active dropdown]` is the `[user dropdown]`
