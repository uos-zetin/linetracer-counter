import { createDefaultPreset } from "ts-jest";
import type { Config } from "jest";

const tsJestTransformCfg = createDefaultPreset().transform;
const config: Config = {
  transform: {
    ...tsJestTransformCfg,
  },
  testEnvironment: "node",
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/src/$1",
    "^@tests/(.*)$": "<rootDir>/tests/$1",
  },
};

export default config;
