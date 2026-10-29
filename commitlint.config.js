/** @type {import('@commitlint/types').UserConfig} */
const Configuration = {
  extends: ["@commitlint/config-conventional"],
  rules: {
    "scope-enum": [
      2,
      "always",
      ["frontend", "backend", "api", "web", "shared", "root", "docs", "ci"],
    ],
    "scope-case": [2, "always", "lower-case"],
    "scope-empty": [2, "never"],
  },
};

module.exports = Configuration;

