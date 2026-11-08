import test from "node:test";
import assert from "node:assert/strict";
import { lookupPublishedRate, buildInquiry } from "../src/data/prices.js";

test("published rate lookup respects vehicle, diameter boundaries and explicit source units", () => {
  const first = lookupPublishedRate({
    serviceId: "seasonal_replacement",
    vehicle: "sedan",
    diameter: 16,
  });
  assert.ok(first, "the source contains a sedan R16 rate");
  assert.equal(first.price_rub, 3000);
  assert.equal(
    lookupPublishedRate({
      serviceId: "seasonal_replacement",
      vehicle: "sedan",
      diameter: 17,
    }).price_rub,
    3200,
  );
  assert.equal(
    lookupPublishedRate({
      serviceId: "seasonal_replacement",
      vehicle: "jeep",
      diameter: 24,
    }).price_rub,
    7500,
  );
  assert.equal(
    lookupPublishedRate({
      serviceId: "balancing",
      vehicle: "crossover",
      diameter: 18,
    }).price_rub,
    1800,
  );
  assert.equal(
    lookupPublishedRate({
      serviceId: "balancing",
      vehicle: "crossover",
      diameter: 18,
    }).quantity,
    4,
  );
  assert.equal(
    lookupPublishedRate({
      serviceId: "seasonal_replacement",
      vehicle: "sedan",
      diameter: 16,
    }).quantity,
    null,
  );
});
test("unknown and unpublished combinations never become invented rates", () => {
  for (const parameters of [
    { serviceId: "seasonal_replacement", vehicle: "sedan", diameter: 22 },
    { serviceId: "seasonal_replacement", vehicle: "crossover", diameter: 13 },
    {
      serviceId: "seasonal_replacement",
      vehicle: "sedan",
      diameter: "unknown",
    },
    { serviceId: "bad", vehicle: "sedan", diameter: 16 },
    { serviceId: "balancing", vehicle: "truck", diameter: 18 },
    { serviceId: "balancing", vehicle: "sedan", diameter: 16.5 },
  ])
    assert.equal(lookupPublishedRate(parameters), null);
});
test("inquiry is a request to confirm conditions and does not claim a booking or current quotation", () => {
  const text = buildInquiry({
    serviceId: "seasonal_replacement",
    vehicle: "sedan",
    diameter: 16,
  });
  assert.match(text, /R16/);
  assert.match(text, /седан/);
  assert.match(text, /подтвердить/);
  assert.doesNotMatch(text, /4 колеса|Итого|записан/);
  assert.match(
    buildInquiry({
      serviceId: "balancing",
      vehicle: "jeep",
      diameter: "unknown",
    }),
    /размер уточню/,
  );
});
