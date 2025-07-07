import js from "@eslint/js";
import globals from "globals";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import tseslint from "typescript-eslint";
import fsdFlugin from "eslint-plugin-fsd-lint";

export default tseslint.config(
  { ignores: ["dist"] },
  {
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    files: ["**/*.{ts,tsx}"],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
    plugins: {
      "react-hooks": reactHooks,
      "react-refresh": reactRefresh,
      fsd: fsdFlugin,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      "react-refresh/only-export-components": ["warn", { allowConstantExport: true }],
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
          testFilesPatterns: ["\\.test\\.", "\\.spec\\."],
          ignoreImportPatterns: [],
        },
      ],
      "fsd/no-public-api-sidestep": "error",
      "fsd/no-cross-slice-dependency": "error",
      "fsd/no-ui-in-business-logic": "error",
      "fsd/no-global-store-imports": "error",
    },
  },
);
