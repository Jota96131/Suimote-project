export default {
  testEnvironment: "jsdom",
  testMatch: ["<rootDir>/src/**/*.spec.tsx", "<rootDir>/src/**/*.spec.ts", "<rootDir>/src/**/*.test.tsx", "<rootDir>/src/**/*.test.ts"],
  transform: {
    "^.+\\.tsx?$": ["ts-jest", {
      diagnostics: false,
    }],
  },
  moduleNameMapper: {
    "^../../supabase$": "<rootDir>/src/__mocks__/supabase.ts",
    "^../supabase$": "<rootDir>/src/__mocks__/supabase.ts",
  },
  setupFilesAfterEnv: ["./jest.setup.ts"],
};
