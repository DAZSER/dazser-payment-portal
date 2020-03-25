const expect = require("chai").expect;

const fee = require("../dist/fee").default;

describe("fee.ts", function () {
  describe("default()", function () {
    it("should return 0's for everything", function () {
      const results = fee("0");
      expect(results.total).to.eq("0");
    });
    it("should return fee amounts", function () {
      const results = fee("100");
      expect(results.total).to.eq("10330");
      expect(results.fee).to.eq("330");
    });
  });
});
