import test from "node:test";
import assert from "node:assert/strict";
import { assetUrl } from "../src/data/assets.js";

test("local assets keep the GitHub Pages repository prefix and external sources stay absolute", () => {
  assert.equal(
    assetUrl("/images/workshop-exterior.webp", "/shamshinyh-tire-demo/"),
    "/shamshinyh-tire-demo/images/workshop-exterior.webp",
  );
  assert.equal(
    assetUrl("images/price-list.webp", "/"),
    "/images/price-list.webp",
  );
  assert.equal(
    assetUrl("https://i8.photo.2gis.com/source.jpg", "/shamshinyh-tire-demo/"),
    "https://i8.photo.2gis.com/source.jpg",
  );
});
