# spec

## Rationale

**spec** is a simple set of guidelines to help facilitate the writing of behavioural specifications that are easily interpreted by both humans and machines.

## Spec

This specification is currently informal, and will be developed further with feedback from implementors.

## General considerations

Scenarios can be described in one or more text files using the `.spec` extension for easy identification.

`.spec` files should be encoded using UTF-8.

Each scenario within a file is separated by two carriage return or new line characters.

## Given-When-Then

GWT's are _perfect_ for describing event-driven state transitions.

The addition of zero or more "And" statements following the "Given" and/or "Then" statements allows any number of pre or post conditions for each event.

## Entities

**Entities** within a scenario are wrapped in square brackets to identify them to the parser.

Entity types are intended to be inferred by the parser from their positional placement.

There are three types of entities:

- **Subject**: _(Such as a user, or a named component)_
- **Group**: _(Any set of subjects that may share some common behaviour)_
- **Events**: _(Such as "tap" or "scroll")_
- **States**: _(Such as "open" or "closed")_

## Examples

### Abstract

> Given that the `[subject]` is currently in `[state 1]`<br/>
> When the `[event]` takes place<br/>
> Then the `[subject]` is now in `[state 2]`

### Concrete

> Given that the `[navigation]` is `[closed]`<br/>
> When the `[user]` `[taps]` the `[hamburger icon]`<br/>
> Then the `[navigation]` is `[opening]`

## Sets

### Grouping with "is a"

Subjects may be grouped into sets using "is a" statements such as...

> [minibag] is a [dropdown]<br/>
> [account menu] is a [dropdown]

This allows behaviour to be described once for a set, rather than repeating the same scenarios for each individual member.

> Given that a [dropdown] is opening<br/>
> When the [dropdown opening transition ends]<br/>
> Then the [dropdown] is [open]
