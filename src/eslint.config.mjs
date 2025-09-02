import js from "@eslint/js";
import globals from "globals";
import tseslint from "typescript-eslint";
import { defineConfig } from "eslint/config";

export default defineConfig([
  { files: ["**/*.{js,mjs,cjs,ts,mts,cts}"], plugins: { js }, extends: [
    "js/recommended",
    tseslint.configs.recommended,
    {
      rules: {
        /* ---- Style Rules ---- */

        // Require semicolons (C++-style discipline)
        "semi": ["error", "always"],

        // Use double quotes for strings, but allow single quotes if it avoids escaping
        "quotes": [
          "error",
          "double",
          {
            "avoidEscape": true,
            "allowTemplateLiterals": true,
          }],

        // Disallow `var`, always use let/const
        "no-var": "error",

        // Disable unused var checks, handled by tsserver
        "no-unused-vars": "off",
        "no-unused-private-class-members": "off",
        "@typescript-eslint/no-unused-vars": "off",

        // Indentation: 2 spaces (change to 4 if you prefer C++ style)
        "indent": ["error", 2, { "SwitchCase": 1 }],

        // Require a space after keywords like if/for/while
        "keyword-spacing": ["error", { "before": true, "after": true }],

        // Require a space after commas
        "comma-spacing": ["error", { "before": false, "after": true }],

        // Require spaces around operators (e.g. a + b, not a+b)
        "space-infix-ops": "error",

        // No trailing spaces at the end of lines
        "no-trailing-spaces": "error",

        // Enforce a space after colons in object literals
        "key-spacing": ["error", { "beforeColon": false, "afterColon": true }],

        // Disallow multiple empty lines
        "no-multiple-empty-lines": ["error", { "max": 2 }],

        /* ---- Safety / Bug Prevention ---- */

        // Require === and !== (avoid type-coercion bugs)
        "eqeqeq": ["error", "always"],

        // Force const if a variable is never reassigned
        "prefer-const": "error",

        // Prevent accidental fallthrough in switch/case
        // Requires explicit `break` or a `// falls through` comment
        "no-fallthrough": "error",

        // Disallow code that can never run (after return/throw/etc.)
        "no-unreachable": "error",

        // Encourage a default case in switch statements
        "default-case": "warn",

        // Disallow variable shadowing (redeclaring an identifier in inner scope)
        "no-shadow": "error"
      }
    }
  ], languageOptions: { globals: globals.browser } },
]);
