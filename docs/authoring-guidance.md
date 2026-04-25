# Authoring Guidance

This guide helps you write clear, consistent, and useful specifications using **Spec**.

It is intended for both:

* humans writing specs
* tools and AI agents assisting with authoring

The goal is not to introduce new rules, but to help you use the language well.

The guide focuses on how to write raw `.spec` files well. Where deeper structure matters, that structure should be captured in a companion `profile.yml` rather than forced directly into the spec text.

---

# 1. Core Principles

## 1.1 Prefer plain natural language

Write specifications as ordinary language inside the `Given`, `When`, and `Then` phases.

Good:

```text
Given basket is empty
When the user adds product to basket
Then basket contains product
```

Less good:

```text
Given basket.items is []
When add(product, basket)
Then basket.products includes product
```

---

## 1.2 Describe properties over time

A scenario describes how properties of a system hold:

* `Given` → what already holds
* `When` → what happens
* `Then` → what holds after

Think in terms of:

> What is true before and after something happens?

---

## 1.3 Keep the language neutral

Spec does not define:

* data structures
* APIs
* implementation details

Avoid leaking those into your clauses.

Bad:

```text
Given basket.items includes product
```

Good:

```text
Given basket contains product
```

---

## 1.4 One idea per clause

Each clause should express a single property.

Bad:

```text
Then basket contains product and basket total is updated
```

Good:

```text
Then basket contains product
And basket total equals product price
```

---

# 2. Writing Scenarios

## 2.1 Transition vs invariant

### Transition scenario

Includes an event.

```text
Given basket is empty
When the user adds product to basket
Then basket contains product
```

### Invariant scenario

No event. Describes what must hold under stated conditions.

```text
Given basket contains product
Then basket total equals product price
```

---

## 2.2 Use Given for meaningful conditions and inputs

`Given` can express:

* conditions that already hold
* inputs needed to evaluate a resulting property

Conditions answer:

> What is true?

Inputs answer:

> What is needed for this to be evaluated?

Good:

```text
Given product price
And discount
Then subtotal equals product price minus discount
```

Avoid incidental conditions that do not matter to the scenario.

Less good:

```text
Given subtotal is visible
```

---

## 2.3 Use When for events

`When` describes the triggering event.

Good:

```text
When the user submits promo code
```

Keep event wording direct and consistent across scenarios where possible.

---

## 2.4 Use Then for resulting properties

Everything in `Then` should describe what now holds.

Bad:

```text
Then the user has added product
```

Good:

```text
Then basket contains product
```

---

# 3. Writing Clauses

## 3.1 Prefer consistent wording

Choose words and phrases that can be reused across scenarios.

Good recurring phrases:

* `contains`
* `equals`
* `is`
* `does not contain`

Avoid inventing unnecessary synonyms.

If two similar phrases really do represent different ideas, capture that distinction in the profile.

---

## 3.2 Avoid vague language

Bad:

```text
Then basket total is correct
```

Good:

```text
Then basket total equals product price
```

---

## 3.3 Keep value expressions readable

Use natural language rather than symbolic expressions.

Bad:

```text
Then basket total = product price - discount
```

Good:

```text
Then basket total equals product price minus discount
```

If an expression becomes too dense, split it into intermediate steps.

Good:

```text
Given product price
And discount
And tax
Then subtotal equals product price minus discount
And basket total equals subtotal plus tax
```

---

# 4. Naming Guidance

## 4.1 Use stable names

Names should be:

* consistent across scenarios
* concrete enough to be recognized repeatedly
* close to ordinary domain language

Good:

```text
basket
product
promo code
checkout button
```

---

## 4.2 Avoid implicit variation

Different names imply different concepts.

Be careful when mixing terms such as:

* `count` and `quantity`
* `discount` and `discount amount`
* `total` and `subtotal`

If both are needed, make the distinction deliberate and reflect it in the profile.

---

## 4.3 Use qualifiers only when they help

Natural qualifiers can still be useful:

```text
existing product
new product
```

But qualifiers should earn their keep. If they do not help distinguish meaning, avoid them.

If they matter structurally, let profiles or later interpretation layers capture that distinction rather than overcomplicating the raw spec text.

---

# 5. Common Pitfalls

## 5.1 Mixing domain and implementation

Bad:

```text
database stores product
```

Good:

```text
catalog contains product
```

---

## 5.2 Over-specifying

Bad:

```text
Then basket total equals product price rounded to 2 decimal places using banker's rounding
```

Good:

```text
Then basket total equals product price
```

Leave lower-level calculation policy to interpretation unless it is central to the scenario.

---

## 5.3 Under-specifying

Bad:

```text
Then basket total is updated
```

Good:

```text
Then basket total equals product price
```

---

# 6. Profiles

Profiles are the place to capture interpreted structure that should not be forced into the spec text.

The current minimal profile format focuses on:

* entities
* attributes
* predicates

Use a profile when you want to make machine interpretation durable, reviewable, and comparable across revisions.

The raw `.spec` remains the primary authored artifact. The profile is its working interpretation companion.

---

# 7. A Well-Formed Example

```text
Given basket is empty
And product price
When the user adds product to basket
Then basket contains product
And basket total equals product price
```

---

# 8. Final Guidance

* prefer clarity over cleverness
* prefer consistency over creativity
* prefer explicit properties over vague statements

A good spec should be:

* easy to read
* hard to misinterpret
* ready for profiles and tooling to build on
