module.exports = {
  transform: {'^.+\\.ts?$': 'ts-jest'},
  testEnvironment: 'node',
  testRegex: '/tests/.*\\.(test|spec)?\\.(ts|tsx)$',
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  verbose: true,
  setupFilesAfterEnv: ['./config/jest.setup.js'],
  globalSetup: './config/jest.global.setup.js',
  globalTeardown: './config/jest.global.teardown.js',
};
