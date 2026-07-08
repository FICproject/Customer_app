import 'react-native-gesture-handler/jestSetup';

jest.mock('react-native-worklets', () => require('react-native-worklets/src/mock'));

jest.mock('react-native-reanimated', () => {
  const Reanimated = require('react-native-reanimated/mock');
  return Reanimated;
});

// Silence the warning: "useAnimatedStyle" was used when the library is not enabled
jest.mock('react-native/src/private/animated/NativeAnimatedHelper');
