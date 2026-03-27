# Spec

**Spec** is a lightweight format for describing software behaviour in a way that is readable by humans and interpretable by machines.

Spec builds on the familiar **Given / When / Then** style popularised by Gherkin, but introduces a formally defined structure that allows specifications to be reliably parsed and analysed by software.

The goal of Spec is to provide a simple way to express **behavioural specifications** while preserving natural language and making the structure explicit enough for tools to understand.

---

## Table of Contents

* [Overview](#overview)
* [Transitions](#transitions)
* [Invariants](#invariants)
* [Goals](#goals)
* [Core Concepts](#core-concepts)

  * [Entities](#entities)
  * [Clauses](#clauses)
  * [Given](#given)
  * [When](#when)
  * [Then](#then)
* [Writing Style](#writing-style)
* [Scenario Structure](#scenario-structure)
* [Spec and Gherkin](#spec-and-gherkin)
* [Comments](#comments)
* [Multiple Scenarios](#multiple-scenarios)
* [Formal Grammar](#formal-grammar)
* [Example](#example)
* [Future Tooling](#future-tooling)

---

## Overview

A Spec describes behaviour using scenarios written in natural language.

A scenario may describe either:

1. a **transition** in a system
2. an **invariant** that is always true under certain conditions

Scenarios are written using:

1. **Given** – the initial state or preconditions
2. **When** – the event that triggers the transition
3. **Then** – the resulting state

There are two types of scenarios:

* **Transition scenarios** include a `When` and describe a state transition triggered by an event
* **Invariant scenarios** do not include a `When` and describe properties that hold whenever the `Given` conditions are true

Each statement contains one or more **entities**:

```
[entity]
```

Entities are written in square brackets so they can be reliably identified, while the rest of the sentence remains natural language.

For example:

```
Given that [playback] is [paused]
When the [user] taps [play button]
Then [playback] is [playing]
```

---

## Transitions

A transition scenario describes behaviour that occurs in response to an event.

The `Given` statements describe the **preconditions** that must hold before the event.
The `When` statement describes the event that triggers the transition.
The `Then` statements describe the resulting behaviour.

Example:

```
Given that [playback] is [playing]
When the [user] taps the [pause button]
Then [playback] is [paused]
```

---

## Invariants

An invariant scenario describes properties that are always true under certain conditions.

The `Given` statements describe the conditions under which they apply.  
The `Then` statements describe the properties that must hold.

Example:

```
Given the [playback] is [playing]
Then the [pause button] is [visible]
And the [play button] is [hidden]
```

---

## Core Concepts

### Entities

Entities represent things in the system.

Examples:

```
[user]
[playback]
[play button]
[pause button]
[track]
[playlist]
```

---

### Clauses

A clause describes relationships between entities.

A clause contains **two or more entities**, with natural language between them.

```
[playback] is [playing]
[user] taps [play button]
[user] adds [track] to [playlist]
```

---

### Given

`Given` describes:

* the **preconditions** for a transition
* the **conditions** for an invariant

---

### When

`When` describes the event that triggers a transition.

---

### Then

`Then` describes the resulting state.

---

## Scenario Structure

### Transition

```
Given ...
When ...
Then ...
```

### Invariant

```
Given ...
Then ...
```

---

## Example

```
Given the [playback] is [paused]
When the [user] taps [play button]
Then the [playback] is [playing]
And the [pause button] is [visible]
And the [play button] is [hidden]
```

---

## Formal Grammar

The complete grammar of the Spec format is defined using **EBNF**.

See [`spec.ebnf`](./spec.ebnf)
