# Origin Atelier payments

The Atelier reads active CAD prices from the connected Stripe account and shows the full recipe before opening Stripe-hosted Checkout. Existing illustrative menu amounts are excluded. The merchant controls product availability, ingredient compatibility, pickup operations and pricing in Stripe.

## Deployment settings

Configure the server environment and redeploy. Keep keys out of client variables, source control and chat.

| Setting | Purpose |
| --- | --- |
| `STRIPE_SECRET_KEY` | Prefer a restricted key for the intended Stripe account and mode. Grant account read, products/prices read, Checkout Sessions read/write and PaymentIntents read/write. Add tax rates read if collecting a configured pickup rate. Production accepts only a live key. A Vercel preview uses sandbox mode for checkout. |
| `STRIPE_WEBHOOK_SECRET` | Endpoint signing secret from Stripe Workbench. Register `https://www.deldiet.coffee/api/atelier/webhook` for `checkout.session.completed`, `checkout.session.async_payment_succeeded`, and `checkout.session.async_payment_failed`. Use separate keys and destinations in a sandbox. |
| `ATELIER_PICKUP_NAME`, `ATELIER_PICKUP_ADDRESS` | Verified public pickup counter and full address. These appear in the review, checkout and staff record. |
| `ATELIER_ORDERS_OPEN` | Set to `true` only when the counter can fulfil purchases. Closing orders keeps published prices browsable. |
| `ATELIER_PUBLIC_URL` | HTTPS origin shoppers actually use. Defaults to `https://www.deldiet.coffee` in production and the Vercel deployment URL in preview. Redirect other domains to the configured host before checkout so the receipt cookie survives the return. |
| `ATELIER_PICKUP_TAX_RATE_ID` | Optional Stripe Tax Rate ID (`txr_…`) approved for the products sold at this pickup counter. If omitted, no tax rate is added. The merchant should confirm the applicable treatment before opening orders. Checkout verifies the rate is active and applies it to each line. Customer billing addresses do not set pickup tax. |
| `ATELIER_SESSION_SECRET` | Optional independent, high-entropy receipt-signing secret. Without it, signing uses the Stripe key. Rotating the signing secret invalidates existing browser receipt cookies. |

Payment availability requires the account to have charges and payouts enabled, a configured webhook signing secret, an open pickup location and at least one supported drink. Confirm a signed test event reaches the matching endpoint before opening orders. Set allowed payment methods in the Stripe Dashboard. The Vercel database and D1 are not used by this integration.

## Publish a recipe

Create a Stripe **Product** with a single active CAD one-time, fixed-per-unit **default Price**. Set the following fields as *product* metadata.

| Product metadata | Drink preset | Modifier |
| --- | --- | --- |
| `deldiet_surface` | `origin_atelier` | `origin_atelier` |
| `atelier_id` | Unique lowercase ID such as `house-latte` | Unique ID such as `house-oat` |
| `atelier_kind` | `drink` | `addon` |
| `atelier_recipe` | JSON with a complete recipe, as illustrated below | Omit |
| `atelier_field`, `atelier_value` | Omit | Recipe field and exact approved option, e.g. `milk` and `Oat (barista)` |
| `atelier_applies_to` | Omit | Comma-separated drink IDs or `*` for every published drink |

Example recipe metadata, with no price implied:

```json
{"origin":"Ethiopia","drink":"Latte","roast":"medium","milk":"Organic whole","temp":"Hot","extraction":"Espresso machine","caffeine":"Regular","sweetener":"None","size":"sprout","cup":"For here · ceramic","boosters":[],"syrups":[],"toppings":[],"extraShots":0,"sweetLevel":0}
```

Use the canonical names and IDs in `lib/atelier-options.ts`. Publish a separate base recipe for each supported drink. Base prices are positive. A configured replacement or extra uses its own active, compatible Price, including a zero amount for an included choice. The modifier `extraShots` takes value `1` and charges per additional shot per cup. For `boosters`, `syrups` and `toppings`, each addition has its own modifier. Removing an item included in a preset requires another matching preset. Use a distinct lower-priced base to explicitly offer a discount. Each base must have at most one matching modifier for a given field/value. A sweetened recipe also needs an approved sweetness level if it differs from the base. If multiple fully mapped recipes fit, the quote uses the lowest authorized total. An unmapped ingredient keeps that recipe outside checkout.

To change a price, set the new Price as the product’s default. Deactivate a product to remove it from ordering. Browsing may cache current prices for ten seconds. Checkout fetches them again, recomputes the complete basket and requests a fresh review if the quote changed.

## Fulfil a paid order

Use the order reference in the Stripe Dashboard. Both the Checkout Session and PaymentIntent carry the full preparation details, quantity, optional cup name and pickup location. Wait for successful payment, including settlement confirmation for asynchronous methods, before preparing the order.

The signed webhook reconciles the current Stripe session and PaymentIntent and adds `atelier_fulfillment_queue=paid_awaiting_staff` to paid orders. It uses Stripe idempotency and durable PaymentIntent metadata, so retries and out-of-order events do not create a second order. Record the team’s preparation and handoff separately under `staff_fulfillment`. A failed asynchronous payment is marked `atelier_async_payment_failed=yes`. Delivery to the bar and physical pickup are staff-managed.

Returning customers see a server-verified status. Their HttpOnly receipt cookie is scoped to the browser that opened checkout. A customer can close the browser without losing the paid order in Stripe. To trace a missed webhook, inspect event deliveries in Workbench and resend the event after fixing the endpoint.

## Stripe references

[Checkout Session creation](https://docs.stripe.com/api/checkout/sessions/create) · [Webhook signatures](https://docs.stripe.com/webhooks#verify-official-libraries) · [Checkout fulfillment](https://docs.stripe.com/checkout/fulfillment) · [Manual tax rates in Checkout](https://docs.stripe.com/payments/checkout/use-manual-tax-rates) · [Restricted keys](https://docs.stripe.com/keys)
