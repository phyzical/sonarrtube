import { pathsToModuleNameMapper, JestConfigWithTsJest } from 'ts-jest';

// eslint-disable-next-line no-restricted-imports
import { compilerOptions } from './tsconfig.json';

const jestConfig: JestConfigWithTsJest = {
    preset: 'ts-jest',
    testEnvironment: 'node',
    transform: { '^.+\\.ts?$': 'ts-jest' },
    moduleFileExtensions: ['ts', 'js'],
    extensionsToTreatAsEsm: ['.ts'],
    testMatch: [
        '<rootDir>/tests/**/*.spec.ts',
    ],
    moduleDirectories: ['node_modules', '<rootDir>'],
    moduleNameMapper: {
        ...pathsToModuleNameMapper(compilerOptions.paths, { prefix: '<rootDir>', useESM: true }),
    },
    modulePathIgnorePatterns: ['<rootDir>/build'],
    collectCoverage: true,
    coverageDirectory: 'coverage',
    coverageThreshold: {
        global: {
            statements: 86,
            branches: 88,
            functions: 90,
            lines: 85,
        }
    },
    verbose: true,
    setupFilesAfterEnv: ['./tests/config/jest.setup.ts'],
    globalSetup: './tests/config/jest.global.setup.ts',
    globalTeardown: './tests/config/jest.global.teardown.ts',
    resolver: 'jest-ts-webcompat-resolver',
    testSequencer: './tests/config/testSequencer.ts',
};

export default jestConfig;