# Game Purchase, Entitlement, and Library Access

This example specification demonstrates how **Spec** can model realistic product behaviour across multiple interacting systems while remaining readable by humans and interpretable by machines.

The example describes how a user purchases a product, how access is granted through entitlements, and how that access is reflected in the user's library.

It intentionally includes:

* storefront behaviour
* purchase and checkout flow
* payment confirmation
* entitlement lifecycle
* UI projections derived from domain state
* refunds and administrative actions

The goal is to show that a single behavioural specification can express **product logic, system behaviour, and UI outcomes** in a consistent format.

---

# What this example demonstrates

This example highlights several important modelling capabilities of the Spec format.

## Behaviour-driven product modelling

Each scenario describes behaviour in terms of:

* **preconditions** (`Given`)
* **a single trigger** (`When`)
* **observable outcomes** (`Then`)

For example:

```text
Given that the [user] is [signed in]
And the [product] is [purchasable]

When the [user] taps the [buy button]

Then the [checkout] becomes [visible]
```

Scenarios describe behaviour that can be observed from outside the system.

---

## Surface visibility triggers

User navigation is typically expressed as **surface visibility**, rather than user intent.

For example:

```text
When the [product page] becomes [visible]
When the [library] becomes [visible]
When the [checkout] becomes [visible]
```

This keeps the specification focused on **observable system state**, rather than how the user arrived at that state.

User actions still appear when they directly trigger behaviour:

```text
When the [user] taps the [buy button]
When the [user] confirms the [purchase]
```

---

## Explicit state transitions

The specification encodes state transitions using a consistent pattern:

```text
[entity] becomes [state]
```

Examples include:

```text
[order] becomes [created]
[order] becomes [confirmed]
[order] becomes [refunded]

[entitlement] becomes [pending]
[entitlement] becomes [active]
[entitlement] becomes [revoked]
```

From these statements, tooling can derive deterministic **state machines**.

---

# Derived state machines

Although the specification does not explicitly declare state diagrams, they can be inferred from the behavioural scenarios.

## Order lifecycle

```text
created → confirmed → refunded
```

| From      | To        | Trigger                           |
| --------- | --------- | --------------------------------- |
| created   | confirmed | payment provider confirms payment |
| confirmed | refunded  | refund service refunds order      |

---

## Entitlement lifecycle

```text
pending → active → revoked
```

| From    | To      | Trigger                                    |
| ------- | ------- | ------------------------------------------ |
| pending | active  | entitlement service grants entitlement     |
| active  | revoked | refund service or administrator revocation |

Note: entity lifecycles begin when the entity exists.

For example, an order begins at `[created]` and an entitlement begins at `[pending]`.
The specification intentionally avoids modelling non-existence as states such as “not created”.

---

# Domain state vs UI projection

A key modelling concept demonstrated in this example is the distinction between **domain state** and **UI projection**.

## Domain state

Entities such as `[order]` and `[entitlement]` have lifecycle states.

Examples:

```text
[order] becomes [confirmed]
[entitlement] becomes [active]
```

These represent authoritative system state.

---

## UI projection

User-facing behaviour is derived from domain state rather than owning independent state.

In this example, **ownership is derived from entitlement state**.

For example:

```text
Given that the [entitlement] is [active]

When the [library] becomes [visible]

Then the [owned product] is [visible]
```

This means the library does not store ownership directly.
Instead, the UI reflects the current entitlement state.

---

# Eventual consistency

The specification also models **asynchronous behaviour** between systems.

Ownership is not granted immediately when payment succeeds. Instead the system progresses through intermediate states:

```text
order confirmed
      ↓
entitlement pending
      ↓
entitlement active
      ↓
owned product visible in library
```

This allows the specification to represent scenarios such as:

* delayed entitlement processing
* payment review
* fraud checks
* administrative grants
* refunds and entitlement revocation

---

# External actors

The example includes several system actors that trigger behaviour:

* `[payment provider]`
* `[commerce service]`
* `[entitlement service]`
* `[refund service]`
* `[admin]`

These actors demonstrate that the specification format can model **system interactions**, not just user interface behaviour.

---

# Machine interpretation

Because the specification uses consistent patterns, tooling could extract:

* domain entities
* state machines
* transition tables
* UI projection rules
* domain vocabulary
* scenario-based test cases

For example, a tool could derive behaviour such as:

```text
entitlement.active ⇒ owned product visible
entitlement.active ⇒ buy button disabled
entitlement.revoked ⇒ owned product not visible
```

---

# Why this example exists

Many specification formats focus either on:

* documentation for humans, or
* schemas for machines.

This example demonstrates that a well-designed behavioural grammar can achieve both:

* **Readable product documentation**
* **Reliable machine interpretation**

The same specification can serve as:

* product documentation
* behavioural model
* validation source
* test scenario catalogue
* system reference

---

# Files

This example consists of:

```
game-purchase-entitlement.spec
```

which contains the behavioural specification itself.

This README provides context and explains the domain model expressed by the spec.

---

# Suggested tooling opportunities

A tool built on top of this specification format could automatically generate:

* state diagrams
* transition tables
* entity glossaries
* validation warnings for inconsistent terminology
* behavioural test scaffolding

This example is intentionally designed to make those possibilities visible.

---

# Summary

This example specification models a realistic product flow while remaining concise and readable.

It demonstrates how the Spec format can represent:

* complex product behaviour
* stateful domain entities
* distributed system events
* UI behaviour derived from domain state

all within a single coherent specification.
