# spec

## Rationale

**spec** is a simple set of guidelines to help facilitate the writing of behavioural specifications using a formal system that may be easily interpreted by both humans and machines.

This specification is currently casual, and will be developed further with feedback from implementors.

## General considerations

Scenarios can be described in one or more text files using the `.spec` extension for easy identification.

`.spec` files should be encoded using UTF-8.

Each scenario within a file is separated by two newline characters.

## Entities

In order to make our specifications easier to parse, we explicitly identify **entities** within a scenario by wrapping them in square brackets.

There are five types of entities:

- **Component**: _(A named component within the system)_
- **State**: _(A value that represents one possible state of a named component)_
- **Event**: _(The name of an event that affects the state of one or more components)_
- **Event Source**: _(Some entity capable of triggering an event)_
- **Event Target**: _(Some entity capable of receiving an event)_

## Initial states

Initial states may be defined using _"...is..."_ statements.

For example:

> `[playback]` is `[paused]`

## Scenarios

The formal structure of a scenario is comprised of two parts;

- the order of statements within a scenario
- the order of entities within a statement

## Statement Order

There are three valid patterns for a scenario:

### _"Given...Then"_

If the preconditions described by _"Given..."_<sup>\*</sup> are all true, then the postconditions described by _"Then..."_<sup>\*</sup> should be applied.

For example:

> Given that `[playback]` is `[paused]`<br/>
> Then the `[pause button]` is `[hidden]`<br/>
> And the `[play button]` is `[visible]`

### _"Given...When...Then"_

The same as for _"Given...Then"_, but only evaluated in case of the event described by _"When..."_.

For example:

> Given that `[playback]` is `[paused]`<br/>
> When the `[user]` `[taps]` the `[play button]`<br/>
> Then `[playback]` is `[resumed]`

### _"When...Then"_

In case of the event described by _"When..."_, then the postconditions described by _"Then..."_<sup>\*</sup> should be applied.

For example:

> When the `[user]` `[scrolls]` the `[window]`<br/>
> Then the `[menu position]` is `[fixed]`

<sup>\*</sup> _(And any subsequent "And..." statements)_

## Entity Order

A simple scenario looks like this:

> Given...`[component]`...`[current state]`<br/>
> When...`[event target]`...`[event]`<br/>
> Then...`[component]`...`[next state]`

For example:

> Given that `[playback]` is `[paused]`<br/>
> When the `[play button]` is `[pressed]`<br/>
> Then `[playback]` is `[resumed]`

You may also provide three entities to a _"When..."_ clause in order to identify the **Event Source**.

> When...`[event source]`...`[event]`...`[event target]`<br/>

For example:

> Given that `[playback]` is `[paused]`<br/>
> When the `[user][presses]` the `[play button]`<br/>
> Then `[playback]` is `[resumed]`
