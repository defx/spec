# spec

## Rationale

**spec** is a simple set of guidelines to help facilitate the writing of behavioural specifications using a formal system that may be easily interpreted by both humans and machines.

This specification is currently casual, and will be developed further with feedback from implementors.

## General considerations

Scenarios can be described in one or more text files using the `.spec` extension for easy identification.

`.spec` files should be encoded using UTF-8.

Each scenario within a file is separated by two carriage return or new line characters.

## A Formal Structure

The formal structure of our scenarios is comprised of two parts;

- the order of statements within a scenario
- the order of entities within a statement

## Statement Order

There are three valid patterns for a scenario:

### _"Given...Then"_

If the preconditions described by _"Given..."_<sup>\*</sup> are all true, then the postconditions described by _"Then..."_<sup>\*</sup> should be applied.

For example:

> Given that playback is paused<br/>
> Then the pause button is hidden<br/>
> And the play button is visible

### _"Given...When...Then"_

The same as for _"Given...Then"_, but only evaluated when the event described by _"When..."_ occurs.

For example:

> Given that playback is paused<br/>
> When the user taps the play button<br/>
> Then playback is resumed

### _"When...Then"_

When the event described by _"When..."_ occurs, then the postconditions described by _"Then..."_<sup>\*</sup> should be applied.

For example:

> When the user scrolls the window<br/>
> Then the menu position is fixed

<sup>\*</sup> _(And any subsequent "And..." statements)_

## Entities

In order to make our specifications both _consistent_ and _easy to parse_, we explicitly identify **entities** within a scenario by wrapping them in square brackets.

There are four types of entities:

- **Subject**: _(Such as a user, or a named component)_
- **Group**: _(Any set of subjects that may share some common behaviour)_
- **Event**: _(Such as "tap" or "scroll")_
- **State**: _(Such as "open" or "closed")_

### Subject Groups

Subjects may be grouped together using _"...is a..."_ statements.

For example:

> `[minibag]` is a `[dropdown]`<br/>`[account menu]` is a `[dropdown]`

This allows behaviour to be described once for a set, rather than repeating the same scenarios for each individual member.

> given that a `[dropdown]` is `[open]`<br/>
> when the `[user]` `[taps outside]` of the `[open][dropdown]`<br/>
> then the `[open][dropdown]` is `[closing]`

## Entity Order

The simplest and most common type of scenario looks like this:

> Given...`[subject]`...`[state]`<br/>
> When...`[subject]`...`[event]`...`[subject]`<br/>
> Then...`[subject]`...`[state]`

For example:

> Given that `[playback]` is `[paused]`<br/>
> When the `[user]` `[taps]` the `[play button]`<br/>
> Then `[playback]` is `[resumed]`

For both _"Given..."_ and _"Then..."_, `[subject]` may be replaced by `[group]`.

### Targeting group members by state

You can apply a postcondition to only the members of a group matching a particular state by using a `[state][group]` pair

For example:

> Given that a `[dropdown]` is `[open]`<br/>
> When the `[user]` `[taps outside]` of the `[open][dropdown]`<br/>
> Then the `[open][dropdown]` is `[closing]`
