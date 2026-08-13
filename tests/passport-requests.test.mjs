import test from "node:test";
import assert from "node:assert/strict";
import { normalizeServiceRequest, publicStatusMessage } from "../lib/service-requests.ts";

const base = {
  source: "passport-test",
  idempotencyKey: "passport-test-1234567890",
  customer: { name: "Test guest", email: "test@example.com" },
};

test("normalizes the three Passport request workflows", () => {
  const requests = [
    { type: "subscription_plan", payload: { plan: "Explorer", format: "Whole bean", cadence: "Every 4 weeks", brewMethod: "Pour-over", quantity: 2, selectionMode: "Taste Graph chooses" } },
    { type: "gift_build", payload: { giftType: "Origin journey", occasion: "Birthday", deliveryWindow: "Within 2 weeks", recipientMode: "Let recipient take the Taste Graph", budget: 75, message: "Enjoy the journey" } },
    { type: "workplace_program", payload: { programme: "Office coffee", serviceCadence: "Every 2 weeks", brewSetup: "We need equipment", headcount: 25, city: "St. John’s", notes: "Two floors" } },
  ];

  for (const request of requests) {
    const result = normalizeServiceRequest({ ...base, ...request, estimatedSubtotalCents: 999999 });
    assert.equal(result.ok, true, request.type);
    if (!result.ok) continue;
    assert.equal(result.value.estimatedSubtotalCents, null);
    assert.equal(result.value.initialStatus, "submitted_for_review");
    assert.equal("unexpected" in result.value.payload, false);
  }
});

test("rejects out-of-range or unrecognized Passport fields", () => {
  const invalid = [
    { type: "subscription_plan", payload: { plan: "Unlimited", format: "Whole bean", cadence: "Every 4 weeks", brewMethod: "Pour-over", quantity: 2, selectionMode: "Taste Graph chooses" } },
    { type: "gift_build", payload: { giftType: "Origin journey", occasion: "Birthday", deliveryWindow: "Within 2 weeks", recipientMode: "I will choose for them", budget: 10 } },
    { type: "workplace_program", payload: { programme: "Office coffee", serviceCadence: "Weekly", brewSetup: "Batch brewer", headcount: 0, city: "St. John’s" } },
  ];

  for (const request of invalid) assert.equal(normalizeServiceRequest({ ...base, ...request }).ok, false, request.type);
});

test("uses non-transactional status language", () => {
  assert.match(publicStatusMessage("submitted_for_review", "subscription_plan"), /No billing or shipment has started/);
  assert.match(publicStatusMessage("submitted_for_review", "gift_build"), /Nothing has been charged or sent/);
  assert.match(publicStatusMessage("submitted_for_review", "workplace_program"), /Availability, scope and pricing are still pending/);
});
