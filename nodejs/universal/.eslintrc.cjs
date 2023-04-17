const path = require("path");

module.exports = {
  extends: "../.eslintrc.cjs",
  parserOptions: {
    parser: "@typescript-eslint/parser",
    ecmaVersion: "latest",
    project: path.resolve(__dirname, "tsconfig.json"),
  },
  ignorePatterns: [".eslintrc.cjs"],
  overrides: [
    {
      files: ["*.ts", "*.tsx"],
      parser: "@typescript-eslint/parser",
      rules: {
        // additional rules can go here
      },
    },
  ],
};
