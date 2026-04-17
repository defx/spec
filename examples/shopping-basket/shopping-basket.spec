Scenario: Add a product to an empty basket

Given [basket] is [empty]
When the [user] adds [product] to [basket]
Then [basket] contains [product]
And [basket count] equals 1
And [basket total] equals [product price]

Scenario: Add a second product to the basket

Given [basket] contains [existing product]
And [basket count] equals 1
When the [user] adds [new product] to [basket]
Then [basket] contains [existing product]
And [basket] contains [new product]
And [basket count] equals 2
And [basket total] equals [existing product price] plus [new product price]

Scenario: Increase the quantity of an existing product

Given [basket] contains [product]
And [product quantity] equals 1
When the [user] adds [product] to [basket]
Then [product quantity] equals 2
And [basket count] equals 2
And [basket total] equals [product price] multiplied by 2

Scenario: Decrease the quantity of a product

Given [basket] contains [product]
And [product quantity] equals 2
When the [user] decreases [quantity] of [product]
Then [product quantity] equals 1
And [basket count] equals 1
And [basket total] equals [product price]

Scenario: Remove a product when its quantity reaches zero

Given [basket] contains [product]
And [product quantity] equals 1
When the [user] decreases [quantity] of [product]
Then [basket] does not contain [product]
And [basket count] equals 0
And [basket total] equals 0

Scenario: Remove a product from the basket

Given [basket] contains [product]
And [basket count] equals 1
When the [user] removes [product] from [basket]
Then [basket] does not contain [product]
And [basket count] equals 0
And [basket total] equals 0

Scenario: Apply a valid promo code

Given [basket] contains [product]
When the [user] submits [promo code]
And [promo code] is [valid]
Then [basket] has [discount]
And [basket total] equals [product price] minus [discount amount]

Scenario: Reject an invalid promo code

Given [basket] contains [product]
When the [user] submits [promo code]
And [promo code] is [invalid]
Then [basket total] equals [product price]
And [promo code error] is [visible]

Scenario: Start checkout from a non-empty basket

Given [basket] contains [product]
When the [user] starts [checkout]
Then [checkout] is [started]
And [checkout] uses [basket]

Scenario: Checkout button is disabled for an empty basket

Given [basket] is [empty]
Then [checkout button] is [disabled]

Scenario: Checkout button is enabled for a non-empty basket

Given [basket] contains [product]
Then [checkout button] is [enabled]

Scenario: Basket total equals the sum of all products

Given [basket] contains [product]
Then [basket total] equals [product price]

Scenario: Basket total reflects discount when a promo code is applied

Given [basket] has [discount]
Then [basket total] equals [original total] minus [discount amount]
