# Spec

**Spec** is a lightweight format for describing software behaviour in a way that is readable by humans and interpretable by machines.

Spec builds on the familiar **Given / When / Then** style popularised by Gherkin, but introduces a formally defined structure that allows specifications to be reliably parsed and analysed by software.

The goal of Spec is to provide a simple way to express **behavioural specifications**, particularly UI and product flows, while preserving natural language and making the structure explicit enough for tools to understand.

---

## Table of Contents

- [Overview](#overview)
- [State Transitions](#state-transitions)
- [Goals](#goals)
- [Core Concepts](#core-concepts)
  - [Entities](#entities)
  - [Clauses](#clauses)
  - [Given](#given)
  - [When](#when)
  - [Then](#then)
- [Scenario Structure](#scenario-structure)
- [Spec and Gherkin](#spec-and-gherkin)
- [Comments](#comments)
- [Multiple Scenarios](#multiple-scenarios)
- [Formal Grammar](#formal-grammar)
- [Example](#example)
- [Future Tooling](#future-tooling)

---

## Overview

A Spec describes behaviour using scenarios written in natural product language.

Each scenario represents a **state transition** in a system:

1. **Given** – the current state of the system
2. **When** – the event that triggers a transition
3. **Then** – the resulting behaviour or state

Each statement contains a structured clause:

```
[entity] verb [entity]
```

Entities are written in square brackets so they can be reliably identified by machines, while the rest of the sentence remains natural language.

For example:

```
Given that the [basket] has [items]

When the [user] taps [checkout button]

Then the [checkout] requires [sign in]
And the [sign in screen] is [visible]
```

Because entities are explicitly marked, tools can extract relationships from the specification such as:

```
(basket, has, items)
(user, taps, checkout button)
(checkout, requires, sign in)
```

These relationships describe the behaviour of the system and can be used by tools to analyse specifications, generate tests, visualise flows, or validate behaviour.

---

## State Transitions

Each scenario in a Spec represents a **state transition** in the system.

The `Given` statements describe the conditions that are true before the transition.
The `When` statement describes the event that triggers the transition.
The `Then` statements describe the resulting conditions after the transition.

For example:

```
Given that the [basket] has [items]
And the [user] is not [signed in]

When the [user] taps [checkout button]

Then the [checkout] requires [sign in]
And the [sign in screen] is [visible]
```

This scenario describes a transition from one set of conditions to another, triggered by a specific event.

Every scenario therefore contains exactly **one `When`**, representing the trigger for that transition.

---

## Goals

Spec is designed with a few key principles.

### Human-readable

Specs should read like product documentation rather than code.

### Behaviour-focused

Specs describe **observable behaviour**, not internal implementation.

### Machine-interpretable

Entities are explicitly marked so that tools can parse the specification and extract structured relationships.

### Minimal syntax

The format intentionally introduces only a small amount of structure so that specifications remain easy to write and understand.

---

## Core Concepts

### Entities

Entities represent things in the system.

Examples:

```
[user]
[basket]
[checkout button]
[payment step]
```

Entities can represent:

* users
* UI elements
* application features
* system components
* conceptual objects such as `[items]` or `[discount]`

---

### Clauses

A clause describes a relationship or action between two entities.

```
[entity] verb [entity]
```

Examples:

```
[basket] has [items]
[user] taps [checkout button]
[checkout] shows [payment step]
[order] becomes [confirmed]
```

The verb remains natural language.

---

### Given

`Given` describes the **state of the system before the transition**.

A scenario may include:

* one `Given`
* zero or more `And` statements that extend the preconditions

Example:

```
Given that the [basket] has [items]
And the [user] is not [signed in]
```

---

### When

`When` describes the **trigger that causes the transition**.

Every scenario **must include exactly one `When`**.

Example:

```
When the [user] taps [checkout button]
```

---

### Then

`Then` describes the **result of the transition**.

Additional outcomes may be expressed with `And`.

Example:

```
Then the [checkout] requires [sign in]
And the [sign in screen] is [visible]
```

---

## Scenario Structure

A scenario follows this structure:

```
Scenario: Title (optional)

Given ...
And ...

When ...

Then ...
And ...
```

Examples:

```
Scenario: Guest checkout requires sign-in

Given that the [basket] has [items]
And the [user] is not [signed in]

When the [user] taps [checkout button]

Then the [checkout] requires [sign in]
And the [sign in screen] is [visible]
```

Scenarios may also start directly with `When` if no preconditions are required.

```
Scenario: Verification link completes signup

When the [user] opens [verification link]

Then the [account] becomes [verified]
And the [app] shows [profile setup screen]
```

---

## Spec and Gherkin

Spec is inspired by the **Given / When / Then** structure popularised by Gherkin.

Gherkin is widely used because it encourages collaboration between product, design, and engineering teams through readable behavioural specifications.

In Gherkin, the text of each step is interpreted by **step definitions** written in code. These step definitions determine how the step should be executed or validated.

Spec takes a slightly different approach.

Instead of leaving the meaning of the step text entirely to external code, Spec introduces a small amount of structure by explicitly marking **entities** within the sentence.

For example, a typical Gherkin step might look like:

```
Given the basket contains items
```

In Spec, the same statement becomes:

```
Given that the [basket] has [items]
```

This structural constraint allows tools to reliably extract the relationships being described.

The goal is not to replace Gherkin, but to **formalise a similar style of behavioural specification** so that it can be interpreted consistently by machines as well as humans.

---

## Comments

Comments may appear anywhere in a spec file.

```
# This is a comment
```

Comments are ignored by parsers.

---

## Multiple Scenarios

Scenarios are separated by blank lines.

```
Scenario: Guest checkout requires sign-in
...

Scenario: Verification link completes signup
...
```

---

## Formal Grammar

The complete grammar of the Spec format is defined using **EBNF**.

See [`spec.ebnf`](./spec.ebnf)

---

## Example

```
Scenario: Checkout requires sign-in

Given that the [basket] has [items]
And the [user] is not [signed in]

When the [user] taps [checkout button]

Then the [checkout] requires [sign in]
And the [sign in screen] is [visible]
```

---

## Future Tooling

Because the structure of a Spec is explicit, tools can use specs to:

* generate automated tests
* visualise user flows
* build state transition graphs
* validate product behaviour

Spec itself is intentionally minimal. Tooling and integrations can evolve independently.
