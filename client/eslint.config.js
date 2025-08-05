import js from "@eslint/js";
import globals from "globals";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import tseslint from "typescript-eslint";
import fsdFlugin from "eslint-plugin-fsd-lint";
import jsxA11y from "eslint-plugin-jsx-a11y";
import importPlugin from "eslint-plugin-import";

export default tseslint.config(
  { ignores: ["dist"] },
  {
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    files: ["**/*.{ts,tsx}"],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
    settings: {
      "import/resolver": {
        typescript: {
          alwaysTryTypes: true,
          project: "./tsconfig.json",
        },
      },
    },
    plugins: {
      "react-hooks": reactHooks,
      "react-refresh": reactRefresh,
      fsd: fsdFlugin,
      "jsx-a11y": jsxA11y,
      import: importPlugin,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      "react-refresh/only-export-components": ["warn", { allowConstantExport: true }],

      // FSD Architecture rules
      "fsd/forbidden-imports": [
        "error",
        {
          alias: {
            value: "@",
            withSlash: false,
          },
        },
      ],
      "fsd/no-relative-imports": [
        "error",
        {
          allowSameSlice: true,
          allowTypeImports: true,
          testFilesPatterns: ["test", "spec", "__tests__"],
          ignoreImportPatterns: ["\\.(test|spec)\\.(ts|tsx)$"],
        },
      ],
      "fsd/no-public-api-sidestep": "error",
      "fsd/no-cross-slice-dependency": "error",
      "fsd/no-ui-in-business-logic": "error",
      "fsd/no-global-store-imports": "error",

      // Accessibility rules
      "jsx-a11y/alt-text": "error",
      "jsx-a11y/anchor-has-content": "error",
      "jsx-a11y/anchor-is-valid": "error",
      "jsx-a11y/aria-props": "error",
      "jsx-a11y/aria-proptypes": "error",
      "jsx-a11y/aria-unsupported-elements": "error",
      "jsx-a11y/click-events-have-key-events": "warn",
      "jsx-a11y/heading-has-content": "error",
      "jsx-a11y/img-redundant-alt": "error",
      "jsx-a11y/no-redundant-roles": "error",
      "jsx-a11y/role-has-required-aria-props": "error",
      "jsx-a11y/role-supports-aria-props": "error",

      // Import order rules - FSD Bottom-up approach
      "import/order": [
        "error",
        {
          groups: [
            "builtin",           // Node.js built-ins
            "external",          // External libraries
            "internal",          // Internal @/* imports (will be further refined by pathGroups)
            "parent",            // ../
            "sibling",           // ./
            "index"              // ./index
          ],
          "newlines-between": "never",
          pathGroups: [
            // React should come first among externals
            {
              pattern: "react",
              group: "external",
              position: "before"
            },
            {
              pattern: "react-*",
              group: "external", 
              position: "before"
            },
            // FSD Layers in bottom-up order
            {
              pattern: "@/shared/**",
              group: "internal",
              position: "before"
            },
            {
              pattern: "@/entities/**", 
              group: "internal",
              position: "before"
            },
            {
              pattern: "@/features/**",
              group: "internal", 
              position: "before"
            },
            {
              pattern: "@/widgets/**",
              group: "internal",
              position: "before" 
            },
            {
              pattern: "@/pages/**",
              group: "internal",
              position: "before"
            },
            {
              pattern: "@/app/**",
              group: "internal",
              position: "before"
            }
          ],
          pathGroupsExcludedImportTypes: ["react"],
          alphabetize: {
            order: "asc",
            caseInsensitive: true,
          },
        },
      ],
      "import/first": "error",
      "import/no-duplicates": "error",
    },
  }
);
