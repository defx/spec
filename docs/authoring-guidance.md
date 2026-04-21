# Authoring Guidance

This guide helps you write clear, consistent, and useful specifications using **Spec**.

It is intended for both:

* humans writing specs
* tools and AI agents assisting with authoring

The goal is not to introduce new rules, but to help you use the language well.

The guide focuses on how to write raw `.spec` files well. Where deeper structure matters, such as roles, properties, or canonical operators, that structure should be made durable in semantic profiles rather than implied only by wording.

---

# 1. Core Principles

## 1.1 Describe properties over time

A scenario describes how **properties of a system hold**:

* **Given** → what already holds
* **When** → what happens
* **Then** → what holds after

Think in terms of:

> “What is true before and after something happens?”

---

## 1.2 Prefer clarity over cleverness

* Use simple, direct language
* Avoid compression or shorthand
* If a clause feels ambiguous, it probably is

Good:

```
[basket] contains [product]
```

Less good:

```
[basket] has [product]
```

---

## 1.3 Keep the language neutral

Spec does not define:

* data structures
* APIs
* implementation details

Avoid leaking those into your clauses.

Bad:

```
[basket.items] includes [product]
```

Good:

```
[basket] contains [product]
```

---

## 1.4 One idea per clause

Each clause should express a single property.

Bad:

```
[basket] contains [product] and updates [basket total]
```

Good:

```
[basket] contains [product]
[basket total] equals [product price]
```

---

# 2. Writing Scenarios

## 2.1 Transition vs invariant

### Transition scenario

Includes an event.

```
Given [basket] is [empty]

When the [user] adds [product]

Then [basket] contains [product]
```

---

### Invariant scenario

No event — always true under conditions.

```
Given [basket] contains [product]

Then [basket total] equals [product price]
```

---

## 2.2 Use Given for meaningful conditions

`Given` can express two related but distinct ideas:

* **conditions** → facts that must already hold
* **inputs** → values or entities that other properties depend on

Understanding the difference helps avoid ambiguity.

---

### Conditions

Conditions describe the state of the system.

```
Given [basket] contains [product]
```

This means something is already true.

---

### Inputs

Inputs define what a property depends on.

```
Given [product price]
And [discount]
```

These do not assert relationships—they declare availability.

---

### Why the distinction matters

Conditions answer:

> “What is true?”

Inputs answer:

> “What is needed for this to be evaluated?”

In many scenarios, both appear together.

---

### Avoid incidental conditions

Bad:

```
Given [subtotal] is visible
```

This introduces UI context rather than meaningful state or inputs.

---

### Prefer structural clarity

Good:

```
Given [product price]
And [discount]

Then [subtotal] equals [product price] minus [discount]
```

Here, `Given` clearly defines the inputs required for the derived property.

---

## 2.3 Use When for events and post-event conditions

The `When` section can include:

* the event
* conditions that are only knowable after the event

```
When the [user] submits [promo code]
And [promo code] is [invalid]
```

---

## 2.4 Use Then for resulting properties

Everything in `Then` should describe what now holds.

Bad:

```
Then the [user] has added [product]
```

Good:

```
Then [basket] contains [product]
```

---

# 3. Writing Clauses

## 3.1 Structure

A clause:

* contains one or more entities
* uses natural language around those entities

```
[basket] contains [product]
[basket total] equals [product price]
[basket quantity] equals 1
```

---

## 3.2 Prefer consistent verbs

Choose words that can be reused across scenarios:

* contains
* equals
* is

Avoid inventing variations.

If different terms really do represent different concepts, make that distinction explicit in the semantic profile.

---

## 3.3 Avoid vague language

Bad:

```
[basket total] is correct
```

Good:

```
[basket total] equals [product price]
```

---

# 4. Assertion-Style Clauses

Some clauses express **value-based constraints**.

Examples:

```
[basket total] equals [product price]
[basket total] equals [product price] minus [discount]
```

These are **assertion-style clauses**.

---

## 4.1 When to use them

Use them when:

* a value must be derived or constrained
* correctness depends on relationships between values

---

## 4.2 Keep them readable

Avoid symbolic expressions.

Bad:

```
[basket total] = [product price] - [discount]
```

Good:

```
[basket total] equals [product price] minus [discount]
```

---

## 4.3 Avoid overloading clauses

Bad:

```
[basket total] equals [product price] minus [discount] plus [tax]
```

Good:

```
Given [product price]
And [discount]
And [tax]

Then [subtotal] equals [product price] minus [discount]
And [basket total] equals [subtotal] plus [tax]
```

---

## 4.4 Derived property pattern

When expressing calculated or dependent values:

* list all inputs in `Given`
* express the relationship in `Then`

Example:

```
Given [product price]
And [discount]

Then [subtotal] equals [product price] minus [discount]
```

This makes dependencies explicit and avoids incidental conditions.

---

## 4.5 Declare dependencies explicitly

If a clause references an entity, it should usually appear in `Given` unless it is produced in `Then`.

Less clear:

```
Given [product price]

Then [subtotal] equals [product price] minus [discount]
```

Clear:

```
Given [product price]
And [discount]

Then [subtotal] equals [product price] minus [discount]
```

This helps:

* humans understand the relationship
* tools build dependency graphs
* interpreters evaluate consistently

---

## 4.6 Multi-step derivation

Some scenarios involve more than one derived property. In these cases, make each step explicit.

Example:

```
Given [item total]
And [discount]
And [delivery fee]

Then [subtotal] equals [item total] minus [discount]
And [order total] equals [subtotal] plus [delivery fee]
```

This is often clearer than compressing the full calculation into a single clause.

Less clear:

```
Given [item total]
And [discount]
And [delivery fee]

Then [order total] equals [item total] minus [discount] plus [delivery fee]
```

Prefer intermediate derived properties when they make the relationship easier to read, explain, and interpret.

---

# 5. Event-Phase Conditions

Some conditions are only knowable after an event occurs.

These belong in the **When** section.

---

## 5.1 Recognising them

Ask:

> “Can this be known before the event?”

If not, it belongs in `When`.

---

## 5.2 Examples

Good:

```
When the [user] submits [promo code]
And [promo code] is [invalid]
```

Bad:

```
Given [promo code] is [invalid]

When the [user] submits [promo code]
```

Good:

```
When the [user] submits [promo code]
And [promo code] is [invalid]
```

---

# 6. Entity Naming

## 6.1 Use stable names

Entities should be:

* consistent across scenarios
* reused wherever possible

---

## 6.2 Avoid synonyms

Different names imply different entities.

Prefer one canonical term per concept within a specification or profile.

For example, avoid mixing:

* `count` and `quantity` for the same idea
* `discount` and `discount amount` unless they are intentionally different concepts

If two similar terms are both needed, their distinction should be captured explicitly in the semantic profile.

---

## 6.3 Use role-based naming

When you need distinction, role-based naming can be useful:

```
[existing product]
[new product]
```

At the grammar layer, these are still just entities.

If a role-based interpretation matters, it should be captured in the semantic profile rather than left as an implicit naming convention.

Assistive tools may suggest that names like these look role-qualified, but that interpretation should remain advisory until accepted by the author and reflected in the profile.

---

## 6.4 Property-style naming

Property-style names can also be useful:

```
[product quantity]
[product price]
[basket total]
```

Again, these are still just entities in the raw spec text.

If a tool or author wants to treat them as properties of a base entity, that structure should be made explicit in the semantic profile.

---

## 6.5 Avoid implicit meaning

Bad:

```
[p1]
[p2]
```

Good:

```
[first product]
[second product]
```

---

## 6.6 No IDs or variables

Avoid:

```
[product id=123]
```

Good:

```
[Cash ISA]
[Lifetime ISA]
```

Use concrete, domain-meaningful names when you need to refer to a specific entity.

---

# 7. Common Pitfalls

## 7.1 Mixing levels of abstraction

Bad:

```
[basket] contains [product]
[basket API] returns 200
```

Good:

```
[basket] contains [product]
[request] succeeds
```

---

## 7.2 Encoding implementation

Bad:

```
[database] stores [product]
```

Good:

```
[catalog] contains [product]
```

Describe domain concepts, not underlying implementation details.

---

## 7.3 Over-specifying

Bad:

```
[basket total] equals [product price] rounded to 2 decimal places using banker's rounding
```

Good:

```
[basket total] equals [product price]
```

---

## 7.4 Under-specifying

Bad:

```
[basket total] is updated
```

Good:

```
[basket total] equals [product price]
```

---

# 8. A Well-Formed Example

```
Given [basket] is [empty]
And [product] has [price]

When the [user] adds [product]

Then [basket] contains [product]
And [basket total] equals [price]
```

---

# 9. Final Guidance

* Prefer clarity over completeness
* Prefer consistency over creativity
* Prefer explicit relationships over vague statements

A good spec should be:

* easy to read
* hard to misinterpret
* ready for tooling and semantic profiles to build on
