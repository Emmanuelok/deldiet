import assert from "node:assert/strict";
import test from "node:test";
import { tsImport } from "tsx/esm/api";

const { atelierResponse } = await tsImport("../lib/atelier-api.ts", import.meta.url);
const site = "https://deldiet.example";
const sessionId = "cs_test_" + "a".repeat(56);
const recipe = {
  origin: "Ethiopia", drink: "Latte", roast: "medium", milk: "Organic whole",
  extraShots: 0, temp: "Hot", extraction: "Espresso machine", caffeine: "Regular",
  boosters: [], syrups: [], sweetener: "None", sweetLevel: 2, toppings: [],
  size: "sprout", cup: "For here · ceramic",
};
const environment = {
  VERCEL_ENV: "preview", STRIPE_SECRET_KEY: "sk_test_fixture_only",
  STRIPE_WEBHOOK_SECRET: "whsec_fixture_only",
  ATELIER_PUBLIC_URL: site, ATELIER_ORDERS_OPEN: "true",
  ATELIER_PICKUP_NAME: "Test counter", ATELIER_PICKUP_ADDRESS: "100 Example Street",
};

function stripeFixture() {
  const state = { price: 550, created: [], lookups: 0, payment: null, latestStatus: null, taxActive: true };
  async function fetcher(input, init = {}) {
    const url = new URL(input instanceof Request ? input.url : input);
    assert.equal(url.origin, "https://api.stripe.com");
    if (url.pathname === "/v1/account") {
      return Response.json({ id: "acct_example", details_submitted: true, charges_enabled: true, payouts_enabled: true });
    }
    if (url.pathname === "/v1/tax_rates/txr_StorePickup") {
      return Response.json({ id: "txr_StorePickup", active: state.taxActive, livemode: false });
    }
    if (url.pathname === "/v1/products") {
      return Response.json({
        has_more: false,
        data: [{
          id: "prod_coffee", active: true, livemode: false, name: "House latte",
          metadata: { deldiet_surface: "origin_atelier", atelier_id: "house-latte", atelier_kind: "drink", atelier_recipe: JSON.stringify(recipe) },
          default_price: { id: "price_house", product: "prod_coffee", active: true, livemode: false, currency: "cad", type: "one_time", billing_scheme: "per_unit", unit_amount: state.price },
        }],
      });
    }
    if (url.pathname === "/v1/checkout/sessions" && init.method === "POST") {
      const form = new URLSearchParams(init.body);
      state.created.push(form);
      const metadata = {};
      for (const [key,value] of form) {
        const name = key.match(/^metadata\[([^\]]+)\]$/)?.[1];
        if (name) metadata[name] = value;
      }
      const subtotal = state.price * Number(form.get("line_items[0][quantity]"));
      state.payment = {
        id: sessionId, url: "https://checkout.stripe.com/c/pay/" + sessionId, mode: "payment",
        livemode: false, currency: "cad", status: "open", payment_status: "unpaid",
        amount_subtotal: subtotal, amount_total: subtotal, metadata,
        client_reference_id: form.get("client_reference_id"),
      };
      return Response.json(state.payment);
    }
    if (url.pathname === "/v1/checkout/sessions/" + sessionId && state.payment) {
      state.lookups++;
      return Response.json({ ...state.payment, status: state.latestStatus || state.payment.status });
    }
    assert.fail(`Unexpected Stripe fixture call to ${url.pathname}`);
  }
  return { state, fetcher };
}

function call(action, fixture, { body, headers, query = "", env = environment } = {}) {
  const request = new Request(`${site}/api/atelier/${action}${query}`, {
    method: body === undefined ? "GET" : "POST",
    headers: { origin: site, ...(body === undefined ? {} : { "content-type": "application/json" }), ...headers },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  return atelierResponse(action, request, env, fixture.fetcher);
}

async function currentQuote(fixture, quantity = 2, env = environment) {
  const res = await call("quote", fixture, { body: { recipe, quantity }, env });
  assert.equal(res.status, 200);
  const quote = await res.json();
  assert.equal(quote.available, true);
  assert.equal(quote.subtotal, fixture.state.price * quantity);
  assert.ok(quote.quoteId);
  return quote;
}

function beginCheckout(fixture, quoteId, overrides = {}, env = environment) {
  return call("checkout", fixture, {
    env,
    headers: { "idempotency-key": "atelier-test-request-84c90ba661" },
    body: { recipe, quantity: 2, safetyAck: true, quoteId, ...overrides },
  });
}

test("the Atelier Next.js routes expose their intended HTTP methods", async () => {
  for (const [action, allowed] of [["catalogue", "GET"], ["quote", "POST"], ["checkout", "POST"], ["session", "GET"], ["webhook", "POST"]]) {
    const route = await tsImport(`../app/api/atelier/${action}/route.ts`, import.meta.url);
    const unsupported = allowed === "GET" ? "POST" : "GET";
    const response = await route[allowed](new Request(`${site}/api/atelier/${action}`, { method: unsupported }));
    assert.equal(response.status, 405);
    assert.equal(response.headers.get("allow"), allowed);
  }
});

test("the production catalogue refuses test prices and calls no payment provider", async () => {
  const fixture = { fetcher: () => assert.fail("production must reject the test key locally") };
  const response = await call("catalogue", fixture, { env: { ...environment, VERCEL_ENV: "production" } });
  assert.equal(response.status, 200);
  const menu = await response.json();
  assert.equal(menu.checkoutAvailable, false);
  assert.deepEqual(menu.items, []);
});

test("missing payment reconciliation keeps prices visible but checkout closed", async () => {
  const fixture = stripeFixture();
  const env = { ...environment, STRIPE_WEBHOOK_SECRET: undefined };
  const response = await call("catalogue", fixture, { env });
  const menu = await response.json();
  assert.equal(menu.mode, "test");
  assert.equal(menu.items.length, 1);
  assert.equal(menu.checkoutAvailable, false);
  const quote = await currentQuote(fixture, 2, env);
  assert.equal((await beginCheckout(fixture, quote.quoteId, {}, env)).status, 503);
  assert.equal(fixture.state.created.length, 0);
});

test("checkout refreshes merchant pricing before accepting the displayed quote", async () => {
  const fixture = stripeFixture();
  const quote = await currentQuote(fixture);
  fixture.state.price = 620;
  const res = await beginCheckout(fixture, quote.quoteId);
  assert.equal(res.status, 409);
  assert.equal(fixture.state.created.length, 0);
  assert.equal((await currentQuote(fixture)).subtotal, 1240);
});

test("checkout validates the acknowledgement before opening hosted payment", async () => {
  const fixture = stripeFixture();
  const quote = await currentQuote(fixture);
  const res = await beginCheckout(fixture, quote.quoteId, { safetyAck: false });
  assert.ok(res.status >= 400 && res.status < 500);
  assert.equal(fixture.state.created.length, 0);
});

test("the active shop pickup tax rate is verified and applied to the agreed quote", async () => {
  const fixture = stripeFixture();
  const env = { ...environment, ATELIER_PICKUP_TAX_RATE_ID: "txr_StorePickup" };
  const original = await currentQuote(fixture);
  const taxed = await currentQuote(fixture, 2, env);
  assert.notEqual(original.quoteId, taxed.quoteId);
  assert.equal((await beginCheckout(fixture, original.quoteId, {}, env)).status, 409);
  fixture.state.taxActive = false;
  assert.equal((await beginCheckout(fixture, taxed.quoteId, {}, env)).status, 503);
  assert.equal(fixture.state.created.length, 0);
  fixture.state.taxActive = true;
  const checkout = await beginCheckout(fixture, taxed.quoteId, {}, env);
  assert.equal(checkout.status, 200);
  const [form] = fixture.state.created;
  assert.equal(form.get("automatic_tax[enabled]"), "false");
  assert.equal(form.get("line_items[0][tax_rates][0]"), "txr_StorePickup");
});

test("checkout keeps the receipt cookie and Stripe return on the same host", async () => {
  const fixture = stripeFixture();
  const quote = await currentQuote(fixture);
  const res = await call("checkout", fixture, {
    body: { recipe, quantity: 2, safetyAck: true, quoteId: quote.quoteId },
    headers: { "idempotency-key": "atelier-alias-demo-0883562" },
    env: { ...environment, ATELIER_PUBLIC_URL: "https://another.example" },
  });
  assert.equal(res.status, 409);
  assert.equal(fixture.state.created.length, 0);
});

test("an expired earlier attempt returns a recoverable outcome", async () => {
  const fixture = stripeFixture();
  const quote = await currentQuote(fixture);
  // The original create response can still say open for an expired idempotent attempt.
  fixture.state.latestStatus = "expired";
  const res = await beginCheckout(fixture, quote.quoteId);
  assert.equal(res.status, 409);
  assert.equal((await res.json()).code, "checkout_closed");
});

test("the receipt belongs to the checkout browser and reflects the provider's payment state", async () => {
  const fixture = stripeFixture();
  const quote = await currentQuote(fixture);
  const checkout = await beginCheckout(fixture, quote.quoteId);
  assert.equal(checkout.status, 200);
  const lookupsAtCreation = fixture.state.lookups;
  const [sessionForm] = fixture.state.created;
  assert.equal(sessionForm.get("line_items[0][price]"), "price_house");
  assert.equal(sessionForm.get("line_items[0][quantity]"), "2");
  assert.equal(sessionForm.get("adaptive_pricing[enabled]"), "false");
  for (const prefix of ["metadata", "payment_intent_data[metadata]"]) {
    assert.equal(sessionForm.get(`${prefix}[recipe_drink]`), recipe.drink);
    assert.equal(sessionForm.get(`${prefix}[recipe_origin]`), recipe.origin);
    assert.equal(sessionForm.get(`${prefix}[quantity]`), "2");
    assert.equal(sessionForm.get(`${prefix}[pickup_address]`), environment.ATELIER_PICKUP_ADDRESS);
  }
  const setCookie = checkout.headers.get("set-cookie");
  assert.match(setCookie, /HttpOnly/i);
  assert.match(setCookie, /Secure/i);
  const headers = { cookie: setCookie.split(";")[0] };
  const query = "?session_id=" + sessionId;
  const unattributed = await call("session", fixture, { query });
  assert.ok(unattributed.status >= 400);
  const otherSession = await call("session", fixture, { query: "?session_id=cs_test_" + "b".repeat(56), headers });
  assert.ok(otherSession.status >= 400);
  assert.equal(fixture.state.lookups, lookupsAtCreation);

  const lookup = async () => {
    const res = await call("session", fixture, { query, headers });
    assert.equal(res.status, 200);
    assert.match(res.headers.get("cache-control") || "", /no-store/i);
    return res.json();
  };
  assert.equal((await lookup()).status, "open");
  fixture.state.payment.status = "complete";
  assert.equal((await lookup()).status, "pending");
  fixture.state.payment.payment_status = "paid";
  fixture.state.payment.amount_total = 1265;
  fixture.state.payment.total_details = { amount_tax: 165, amount_discount: 0, amount_shipping: 0 };
  const paid = await lookup();
  assert.equal(paid.status, "paid");
  assert.equal(paid.amountTotal, 1265, "the receipt should include the tax from Stripe");
  assert.equal(paid.currency, "cad");
  assert.equal(paid.reference, fixture.state.payment.client_reference_id);
  fixture.state.payment.amount_subtotal = 1200;
  const mismatch = await call("session", fixture, { query, headers });
  assert.equal(mismatch.status, 409);
  assert.equal((await mismatch.json()).status, undefined);
});
