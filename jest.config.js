module.exports = {
  preset: '@react-native/jest-preset',
  transformIgnorePatterns: [
    'node_modules/(?!(react-native|@react-native|@react-navigation)(-.*)?/)',
  ],
  moduleNameMapper: {
    '^@react-native-community/netinfo$':
      '@react-native-community/netinfo/jest/netinfo-mock',
  },
};
