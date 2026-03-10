# Spec

**Spec** is a lightweight grammar for describing **product and system behaviour** in a way that is readable by humans and interpretable by machines.

It allows teams to express how a system behaves using structured scenarios while keeping the syntax simple enough to read like documentation.

The same specification can serve as:

* product documentation
* behavioural models
* test scenario catalogues
* validation sources for tooling

Spec focuses on **observable behaviour**, rather than implementation details.

---

## Quick example

A Spec describes behaviour using structured scenarios.

```text id="9i0g4f"
Scenario: Active entitlements disable purchase

Given that the [user] is [signed in]
And the [entitlement] is [active]

When the [product page] becomes [visible]

Then the [buy button] is [disabled]
And the [ownership badge] is [visible]
```

From scenarios like this, tooling can infer behaviour such as:

* entity lifecycles
* state transitions
* system interactions
* UI projections

See the full example in:

[examples/game-purchase-entitlement/](examples/game-purchase-entitlement/)

---

## Key ideas

Spec is built around a few simple ideas.

**Behaviour over implementation**

Specifications describe *what a system does*, not how it is implemented.

**Observable outcomes**

Scenarios focus on behaviour that can be observed from the outside.

**Entities and state**

Domain concepts are referenced using square brackets:

```text id="5vym5n"
[user]
[order]
[entitlement]
```

State transitions follow a consistent pattern:

```text id="y7i8rq"
[entity] becomes [state]
```

**One trigger per scenario**

Each scenario has a single event that causes behaviour:

```text id="0n4p3b"
When the [payment provider] confirms the [payment]
```

**Machine-interpretable structure**

Although specifications read like documentation, the structure allows tooling to derive:

* domain entities
* state machines
* behavioural rules
* scenario flows

---

## Table of contents

* [Why Spec exists](#why-spec-exists)
* [Core structure](#core-structure)
* [Concepts](#concepts)
* [Example specification](#example-specification)
* [When to use Spec](#when-to-use-spec)
* [What Spec is *not*](#what-spec-is-not)
* [Tooling vision](#tooling-vision)
* [Design principles](#design-principles)
* [Status](#status)
* [License](#license)

---

# Why Spec exists

Many existing approaches fall into one of two categories.

**Documentation formats**

* easy for humans to read
* difficult for machines to interpret reliably

**Formal schemas or models**

* precise for machines
* difficult and tedious for humans to write

Spec aims to bridge this gap.

The format is intentionally minimal so that specifications remain easy to write and understand, while still providing enough structure for tooling to extract:

* entities
* state transitions
* behavioural rules
* scenario flows

The philosophy is simple:

**Human-friendly syntax with machine-guarded semantics.**

---

# Core structure

Specifications are written as behavioural scenarios using three parts:

* **Given** – the preconditions
* **When** – the triggering event
* **Then** – the observable outcomes

Entities and domain concepts are referenced using square brackets.

Example:

```text id="v0r5g6"
Scenario: Signed-in users can start checkout

Given that the [user] is [signed in]
And the [product] is [purchasable]

When the [user] taps the [buy button]

Then the [checkout] becomes [visible]
And the [checkout] shows the [product]
```

State transitions use a consistent pattern:

```text id="1q60np"
[entity] becomes [state]
```

Example:

```text id="j3rbsk"
[order] becomes [created]
[order] becomes [confirmed]
[order] becomes [refunded]
```

This allows tooling to derive lifecycle models automatically.

---

# Concepts

Spec describes behaviour using a small set of core concepts.

## Entities

Entities represent domain concepts and system actors.
They are referenced using square brackets.

Examples:

```text id="j9ks9m"
[user]
[product]
[order]
[payment]
[entitlement]
```

Entities may represent:

* domain objects
* UI elements
* external systems
* actors

---

## States

Entities can have observable states.

Examples:

```text id="dhrtyu"
[entitlement] is [active]
[payment] is [pending]
```

State transitions are expressed using:

```text id="k8x9qt"
[entity] becomes [state]
```

Example:

```text id="rjotib"
[order] becomes [confirmed]
```

---

## Events

Events trigger behaviour in the system.

Events may originate from users, systems, or processes.

Examples:

```text id="y3wtrp"
[user] taps the [buy button]
[payment provider] confirms the [payment]
[refund service] refunds the [order]
```

---

## Surfaces

User interface surfaces are often used to describe when behaviour becomes observable.

Example:

```text id="2ndq5f"
When the [product page] becomes [visible]
```

This keeps specifications focused on system state rather than user intent.

---

## Projections

User-facing behaviour is often derived from domain state.

Example:

```text id="o0d6ls"
Given that the [entitlement] is [active]

When the [library] becomes [visible]

Then the [owned product] is [visible]
```

This expresses how UI behaviour reflects underlying system state.

---

# Example specification

A complete example specification is included in the repository.

📖 **See:**
`examples/game-purchase-entitlement/`

This example models the lifecycle of purchasing a product on a digital storefront, including:

* storefront purchase eligibility
* checkout and order creation
* payment confirmation
* entitlement lifecycle
* library visibility
* refunds and administrative actions

The specification includes multiple interacting entities such as:

```text id="gl2p8f"
[user]
[product]
[order]
[payment]
[entitlement]
```

as well as system actors:

```text id="48ekys"
[payment provider]
[commerce service]
[entitlement service]
[refund service]
[admin]
```

From this single specification, tooling could derive:

* domain entities
* state machines
* transition tables
* UI projection rules
* behavioural test scenarios

For example, the example spec encodes lifecycle models such as:

```text id="uwx0y3"
order:
created → confirmed → refunded

entitlement:
pending → active → revoked
```

It also demonstrates how UI behaviour can be expressed as projections of domain state:

```text id="w0s3cl"
Given that the [entitlement] is [active]

When the [library] becomes [visible]

Then the [owned product] is [visible]
```

Note: entity lifecycles begin when the entity exists.

For example, an order begins at `[created]` and an entitlement begins at `[pending]`.
The specification intentionally avoids modelling non-existence as states such as “not created”.

See the example folder for the full specification and accompanying documentation.

---

# When to use Spec

Spec works best for describing **behavioural systems with clear state and observable outcomes**.

It is particularly useful when teams want a shared way to describe how a product or system behaves without committing to implementation details.

## Product behaviour

Spec is well suited for describing how user-facing features behave.

Examples include:

* purchase flows
* account lifecycle
* onboarding and authentication
* entitlement and access rules
* moderation and permissions
* subscription lifecycle

Because scenarios focus on observable outcomes, the specification can double as **product documentation and behavioural reference**.

---

## Domain state transitions

Spec works well for systems where entities move through defined states.

Examples include:

* order lifecycles
* payment processing
* entitlement states
* workflow systems
* moderation pipelines

Using the pattern:

```text id="k9kz3l"
[entity] becomes [state]
```

tooling can infer state machines and transition tables directly from the specification.

---

## Cross-system behaviour

Many real systems involve behaviour triggered by multiple actors, such as:

* users
* services
* scheduled processes
* administrators

Spec allows these interactions to be expressed clearly:

```text id="qrcu9c"
When the [payment provider] confirms the [payment]

Then the [order] becomes [confirmed]
```

This makes it possible to describe **system behaviour across service boundaries** without describing internal implementation.

---

## UI behaviour derived from domain state

Spec is also effective for expressing UI behaviour that reflects underlying domain state.

Example:

```text id="bqz0yr"
Given that the [entitlement] is [active]

When the [library] becomes [visible]

Then the [owned product] is [visible]
```

This makes it clear how the interface responds to changes in system state.

---

## Shared behavioural reference

Spec can provide a common behavioural language for:

* product teams
* engineers
* QA
* technical writers

Instead of scattering behaviour across documentation, code comments, and tests, teams can maintain **a single behavioural specification** that describes how the system is expected to behave.

---

# What Spec is *not*

Spec is designed to describe **observable system behaviour**.
It intentionally avoids solving problems that are better handled by other tools.

## Not an implementation language

Spec is not intended to describe internal algorithms or implementation details.

For example, this would be outside the scope of Spec:

* database queries
* service orchestration logic
* code-level control flow
* infrastructure configuration

Instead, Spec focuses on **what behaviour is observable from the outside**.

## Not a full formal modelling language

Spec intentionally avoids the complexity of formal modelling systems such as UML or statechart DSLs.

The goal is to keep the syntax small and readable while still enabling tools to infer useful models such as:

* state machines
* behavioural flows
* domain vocabulary

## Not a replacement for product documentation

Specifications can complement documentation, but they do not replace narrative explanations, guides, or architectural overviews.

Specs work best when used alongside documentation that explains **why a system behaves the way it does**.

---

# Tooling vision

The Spec format is intentionally lightweight.
Consistency and machine interpretability are expected to be supported by tooling.

Future tooling could assist authors by:

* validating entity and state consistency
* detecting ambiguous behaviour
* generating state machines
* producing transition tables
* generating test scaffolding
* maintaining a shared domain vocabulary

Rather than forcing strict declarations into the language itself, the goal is to provide **tools that help humans write high-quality specifications while preserving the simplicity of the format**.

---

# Design principles

Spec is designed around a few key principles.

**Readable**

Specifications should read like documentation, not like code.

**Observable**

Scenarios should describe behaviour that can be observed, not internal implementation details.

**Minimal**

The grammar should remain small and easy to learn.

**Interpretable**

The structure should allow machines to extract meaningful system models.

---

# Status

Spec is currently experimental.

The format and tooling concepts are evolving, and feedback is welcome.

---

# License

MIT
