export default {
    // Other Jest configuration options here
    collectCoverage: true, // Enable coverage collection
    coverageDirectory: 'coverage', // Directory where coverage reports will be saved
    coverageThreshold: {
        global: { // You can set global thresholds or per-file
            branches: 100, // Percentage of branch coverage
            functions: 100, // Percentage of function coverage
            lines: 100, // Percentage of line coverage
            statements: 100, // Percentage of statement coverage
        },
    },
    preset: 'ts-jest',
    testEnvironment: 'node',
};