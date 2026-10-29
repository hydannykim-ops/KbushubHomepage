import assert from "node:assert/strict";
import test from "node:test";
import { contactTelHref, formatContactPhone } from "../src/lib/domain/phone-display";

test("formats Korean domestic and international phone numbers", () => {
  assert.equal(formatContactPhone("+82 10 3452 1321", "domestic"), "010-3452-1321");
  assert.equal(formatContactPhone("821034521321", "international"), "+82 10 3452 1321");
  assert.equal(contactTelHref("+82 10 3452 1321"), "tel:+821034521321");
});
