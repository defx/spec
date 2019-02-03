# spec

## Rationale

**spec** is a simple set of guidelines to help facilitate the writing of behavioural specifications using a formal system that may be easily interpreted by both humans and machines.

This specification is currently casual, and will be developed further with feedback from implementors.

## General considerations

Scenarios can be described in one or more text files using the `.spec` extension for easy identification.

`.spec` files should be encoded using UTF-8.

Each scenario within a file is separated by two carriage return or new line characters.

## State Transitions

Given-When-Then scenario's are _perfect_ for describing event-driven state transitions. For example:

> given that we are in state S1<br/>
> when we receive event E1<br/>
> then we transition to state S2

Zero or more "And" statements may follow a "given" and/or a "then" statement to allow any number of pre or post conditions to the event.

> given one thing is in state S1<br/>
> and another thing is in state S2
> when we recieve event E1<br/>
> then the one thing will transition to state S2

## Entities

In order to make our specifications both _consistent_ and _easy to parse_, we explicitly identify **entities** within a scenario by wrapping them in square brackets.

Entity types may be inferred by the parser by their positional placement.

There are four types of entities:

- **Subject**: _(Such as a user, or a named component)_
- **Group**: _(Any set of subjects that may share some common behaviour)_
- **Event**: _(Such as "tap" or "scroll")_
- **State**: _(Such as "open" or "closed")_

## Examples

### Abstract

> given that the `[subject]` is currently in `[state 1]`<br/>
> when the `[event]` takes place<br/>
> then the `[subject]` is now in `[state 2]`

### Concrete

> given that the `[navigation]` is `[closed]`<br/>
> when the `[user]` `[taps]` the `[hamburger icon]`<br/>
> then the `[navigation]` is `[opening]`

## Sets

### Grouping with "is a"

Subjects may be grouped into sets using "is a" statements such as...

> `[minibag]` is a `[dropdown]`<br/>`[account menu]` is a `[dropdown]`

This allows behaviour to be described once for a set, rather than repeating the same scenarios for each individual member.

> given that a `[dropdown]` is `[open]`<br/>
> when the `[user]` `[taps outside]` of the `[open][dropdown]`<br/>
> then the `[open][dropdown]` is `[closing]`

> given that a `[dropdown]` is `[open]`<br/>
> when another `[dropdown]` starts `[opening]`<br/>
> then the `[open][dropdown]` is now `[closing]`

In the previous example, any subject within the `"dropdown"` group that has a current state of `"open"` will transition to a state of `"closing"`. Note also that we're using the state `[opening]` as if it were an event and this is perfectly valid, - when a state is used in this position, it will trigger evaluation of the preconditions _once_ when it first changes to that value from another.

## Entity Rules

- **Given**:<br/>
  2: given...`[subject|group]`...`[state]`<br/>
- **When**:<br/>
  1: when...`[subject]`...`[event|state]`<br/>
  2: when...`[subject][event]`...`[subject (event target)]`<br/>
- **Then**:<br/>
  2: then...`[subject|group]`...`[state]`<br/>
  3: then...`[state][group]`...`[state]`

- **And**: Assume the same rules as for whichever core statement it follows (e.g., "given", or "then")
