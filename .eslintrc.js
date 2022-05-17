// eslint-disable-next-line node/no-unpublished-require
require("@rushstack/eslint-patch/modern-module-resolution");

module.exports = {
  extends: ["@sparticuz/eslint-config"],
  rules: {
    "no-console": "off",
  },
};
