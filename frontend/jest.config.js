/** @type {import('jest').Config} */
module.exports = {
  preset: 'jest-expo',
  setupFilesAfterEnv: ['<rootDir>/jest-setup.ts'],
  // Monorepo: react lives in frontend/node_modules while some deps hoist to the
  // repo root — let root-hoisted packages resolve modules from both trees.
  moduleDirectories: ['node_modules', '<rootDir>/node_modules'],
  // Shared, non-test helpers colocated in __tests__ (e.g. DTO fixtures) are not suites.
  testPathIgnorePatterns: ['/node_modules/', '<rootDir>/src/.*/__tests__/fixtures\\.ts$'],
  // Transpile RN/Expo and our native community deps (they ship untranspiled ESM).
  transformIgnorePatterns: [
    'node_modules/(?!((jest-)?react-native|@react-native(-community)?|expo(nent)?|@expo(nent)?/.*|@expo-google-fonts/.*|react-navigation|@react-navigation/.*|@sentry/react-native|native-base|react-native-svg|react-native-nfc-manager|@react-native-google-signin/.*))',
  ],
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/**/__tests__/**',
    '!src/**/*.test.{ts,tsx}',
  ],
  coverageReporters: ['text-summary', 'lcov'],
};
