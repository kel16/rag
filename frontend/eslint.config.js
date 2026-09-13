import js from "@eslint/js";
import eslintConfigPrettier from "eslint-config-prettier";
import react from "eslint-plugin-react";
import reactHooks from "eslint-plugin-react-hooks";
import simpleImportSort from "eslint-plugin-simple-import-sort";
import tseslint from "typescript-eslint";

export default [
  {
    ignores: ["dist", "node_modules"],
  },

  js.configs.recommended,

  ...tseslint.configs.recommended,

  react.configs.flat.recommended,
  react.configs.flat["jsx-runtime"],

  reactHooks.configs.flat.recommended,

  {
    plugins: {
      react: react,
      "react-hooks": reactHooks,
      "simple-import-sort": simpleImportSort,
    },

    settings: {
      react: {
        version: "18.3.1",
      },
    },

    rules: {
      "simple-import-sort/imports": [
        "error",
        {
          groups: [
            // External packages
            ["^@?\\w"],

            // Absolute imports from @/
            ["^@/"],

            // Relative imports
            ["^\\."],
          ],
        },
      ],

      "simple-import-sort/exports": "error",
    },
  },

  eslintConfigPrettier,
];
