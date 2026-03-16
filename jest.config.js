module.exports = {
  preset: 'jest-expo',
  transformIgnorePatterns: [
    'node_modules/(?!((jest-)?react-native|@react-native(-community)?)|expo(nent)?|@expo(nent)?/.*|@expo-google-fonts/.*|react-navigation|@react-navigation/.*|@sentry/react-native|native-base|react-native-svg)',
  ],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
    '^@/src/(.*)$': '<rootDir>/src/$1',
  },
  collectCoverageFrom: [
    'hooks/**/*.ts',
    'hooks/**/*.tsx',
    'services/**/*.ts',
    'components/**/*.tsx',
    'utils/**/*.ts',
    'src/lib/**/*.ts',
    '!**/__tests__/**',
    '!**/*.d.ts',
  ],
  coverageThreshold: {
    global: { lines: 75 },
  },
};
