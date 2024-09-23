// eslint-disable-next-line @typescript-eslint/no-require-imports
const DefaultSequencer = require('@jest/test-sequencer').default;

class CustomSequencer extends DefaultSequencer {
    // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
    async sort(tests) {
        const lastTestFile = 'tests/__tests__/helpers/Cache.spec.ts';

        const lastTests = tests.filter(test => test.path.includes(lastTestFile));
        const allTests = tests.filter(test => !test.path.includes(lastTestFile));

        return [...allTests, ...lastTests];
    }
}

module.exports = CustomSequencer;