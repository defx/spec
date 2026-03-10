# Game purchase, entitlement, and library access

# Storefront purchase eligibility

Scenario: A purchasable product shows an enabled buy button

Given that the [user] is [signed in]
And the [product] is [purchasable]

When the [product page] becomes [visible]

Then the [buy button] is [enabled]

Scenario: Active entitlements disable purchase

Given that the [user] is [signed in]
And the [entitlement] is [active]

When the [product page] becomes [visible]

Then the [buy button] is [disabled]
And the [ownership badge] is [visible]

Scenario: Region restrictions disable purchase

Given that the [user] is [signed in]
And the [product] is [region restricted]

When the [product page] becomes [visible]

Then the [buy button] is [disabled]
And the [purchase restriction message] is [visible]

# Starting a purchase

Scenario: Signed-in users can start checkout

Given that the [user] is [signed in]
And the [product] is [purchasable]

When the [user] taps the [buy button]

Then the [checkout] becomes [visible]
And the [checkout] shows the [product]

Scenario: Guests must sign in before purchase

Given that the [user] is [not signed in]
And the [product] is [purchasable]

When the [user] taps the [buy button]

Then the [checkout] requires [sign in]
And the [sign in screen] becomes [visible]

# Checkout and order creation

Scenario: Confirming checkout creates an order

Given that the [checkout] is [visible]

When the [user] confirms the [purchase]

Then the [order] becomes [created]
And the [payment] becomes [pending]

# Payment confirmation

Scenario: Successful payment confirms the order

Given that the [order] is [created]
And the [payment] is [pending]

When the [payment provider] confirms the [payment]

Then the [order] becomes [confirmed]
And the [payment] becomes [successful]

# Entitlement lifecycle

Scenario: Confirmed orders create pending entitlements

Given that the [order] is [confirmed]

When the [commerce service] processes the [order]

Then the [entitlement] becomes [pending]

Scenario: Pending entitlements do not yet grant access

Given that the [entitlement] is [pending]

When the [library] becomes [visible]

Then the [owned product] is [not visible]
And the [purchase status message] is [visible]

Scenario: Granted entitlements enable access

Given that the [entitlement] is [pending]

When the [entitlement service] grants the [entitlement]

Then the [entitlement] becomes [active]

# Library behaviour

Scenario: Active entitlements appear in the library

Given that the [entitlement] is [active]

When the [library] becomes [visible]

Then the [owned product] is [visible]

Scenario: Active entitlements disable purchase on the product page

Given that the [entitlement] is [active]

When the [product page] becomes [visible]

Then the [buy button] is [disabled]

# Refunds and revocations

Scenario: Refunds revoke entitlements

Given that the [order] is [confirmed]
And the [entitlement] is [active]

When the [refund service] refunds the [order]

Then the [order] becomes [refunded]
And the [entitlement] becomes [revoked]

Scenario: Revoked entitlements remove library access

Given that the [entitlement] is [revoked]

When the [library] becomes [visible]

Then the [owned product] is [not visible]
And the [buy button] is [enabled]

# Administrative actions

Scenario: Administrators can grant entitlements

Given that the [admin] is [authorized]

When the [admin] grants the [entitlement]

Then the [entitlement] becomes [active]

Scenario: Administrators can revoke entitlements

Given that the [admin] is [authorized]
And the [entitlement] is [active]

When the [admin] revokes the [entitlement]

Then the [entitlement] becomes [revoked]
