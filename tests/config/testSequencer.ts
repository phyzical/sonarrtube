const DefaultSequencer = require('@jest/test-sequencer').default;

class CustomSequencer extends DefaultSequencer {
    sort(tests) {
        const lastTestFile = 'tests/__tests__/helpers/Cache.spec.ts';

        const lastTests = tests.filter(test => test.path.includes(lastTestFile));
        const allTests = tests.filter(test => !test.path.includes(lastTestFile));

        return [...allTests, ...lastTests];
    }
}

module.exports = CustomSequencer;