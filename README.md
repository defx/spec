# spec

## Rationale

**spec** is a simple standard for describing Given-When-Then scenarios using notation that is easy to parse for the purpose of generating code directly from BDD-style requirements specifications. This document describes **spec** to help facilitate implementation of parsers in different languages.

## Spec

This specification is currently informal, and will be developed further with feedback from implementors.

## General considerations

Scenarios can be described in one or more text files using the `.spec` extension for easy identification.

`.spec` files should be encoded using UTF-8.

Each scenario within a file is separated by two carriage return or new line characters.

**Entities** within a scenario are wrapped in square brackets to identify them to the parser.

Entity types are intended to be inferred by the parser from their positional placement.

## Entities

There are three types of entities:

- **Subject**: _(Such as a user, or a named component)_
- **Events**: _(Such as "tap" or "scroll")_
- **States**: _(Such as "open" or "closed")_

## Examples

### Abstract

> Given that the `[Subject A]` is `[State A]`<br/>
> When the user `[Event A]` or `[Event B]` the `[Subject B]`<br/>
> Then the `[Subject A]` is `[State B]`

### Concrete

> Given that the `[Navigation]` is `[closed]`<br/>
> When the `[user]` `[taps]` or `[clicks]` the `[Hamburger Icon]`<br/>
> Then the `[Navigation]` is `[opening]`

...and another...

> Given that the `[Navigation]` is `[opening]`<br/>
> When the `[Navigation opening transition ends]`<br/>
> Then the `[Navigation]` is `[open]`

### Token Replacement

In the following example, the state of `active dropdown` is used to keep track of one of several instances of the same type of component, of which `User dropdown` is one.

> Given that the `[User dropdown]` is `[closed]`<br/>
> When the `[user]` `[touches]` the `[User Icon]`<br/>
> Then the `{{active dropdown}}` is `[closing]`<br/>
> And the `[User dropdown]` is `[opening]`<br/>
> And the `[active dropdown]` is the `[User dropdown]`

The mustache notation is used to allow a state to be identified dynamically at runtime. This is useful in cases such as the one above, where the changing state of one subject may affect the state of another subject.
