import test from "node:test";
import assert from "node:assert/strict";
import { normalizeServiceRequest } from "../lib/service-requests.ts";

const baseSelection = {
  origin: "Ethiopia",
  roast: "medium",
  drink: "Flat White",
  drinkMenu: "classics",
  milk: "Oat (barista)",
  extraShots: 0,
  temperature: "Hot",
  extraction: "Espresso machine",
  caffeine: "Regular",
  boosters: [],
  syrups: [],
  sweetener: "None",
  sweetLevel: 1,
  toppings: [],
  size: "bloom",
  cup: "For here · ceramic",
  cupName: "Mobile guest",
};

function request(selection = baseSelection) {
  return normalizeServiceRequest({
    type: "origin_bar_request",
    source: "origin-bar-mobile-test",
    idempotencyKey: "origin-bar-mobile-1234567890",
    customer: { name: "Mobile guest" },
    payload: {
      schemaVersion: 1,
      catalogueVersion: "origin-bar-concept-v1",
      safetyAcknowledged: true,
      selection,
    },
  });
}

test("accepts a drink from its matching Origin Bar menu", () => {
  const result = request();
  assert.equal(result.ok, true);
  if (!result.ok) return;
  assert.equal(result.value.initialStatus, "submitted_for_staff_review");
  assert.equal(result.value.estimatedSubtotalCents, null);
});

test("rejects stale drink selections after switching menus", () => {
  assert.equal(request({ ...baseSelection, drinkMenu: "signatures" }).ok, false);
  assert.equal(request({ ...baseSelection, drink: "Lavender Cloud", drinkMenu: "classics" }).ok, false);
  assert.equal(request({ ...baseSelection, drink: "Lavender Cloud", drinkMenu: "signatures" }).ok, true);
});
