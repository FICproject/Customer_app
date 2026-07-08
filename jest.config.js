module.exports = {
  preset: '@react-native/jest-preset',
  setupFiles: [
    './jest-setup.js',
  ],
  transformIgnorePatterns: [
    'node_modules/(?!(jest-)?react-native|@react-native|react-native-css-interop|nativewind|react-native-gesture-handler|react-native-reanimated|react-native-worklets)/',
  ],
  moduleNameMapper: {
    '^react-native($|/.*)': '<rootDir>/node_modules/react-native$1',
  },
};
