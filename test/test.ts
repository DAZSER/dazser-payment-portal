import test from "ava";
import fee from "../typescript/fee";

test("should return 0's for everything", (t) => {
  const results = fee(0);
  t.is(results.total, "0");
});

test("should return fee amounts", (t) => {
  const results = fee(100);
  t.is(results.total, "10330");
  t.is(results.fee, "330");
});
