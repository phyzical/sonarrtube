// eslint-disable-next-line max-len
// eslint-disable-next-line @typescript-eslint/no-require-imports, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
const DefaultSequencer = require('@jest/test-sequencer').default;

class CustomSequencer extends DefaultSequencer {
    // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
    sort(tests) {
        const lastTestFile = 'tests/__tests__/helpers/Cache.spec.ts';

        // eslint-disable-next-line max-len
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-return
        const lastTests = tests.filter(test => test.path.includes(lastTestFile));
        // eslint-disable-next-line max-len
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
        const allTests = tests.filter(test => !test.path.includes(lastTestFile));

        // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-assignment
        return [...allTests, ...lastTests];
    }
}

module.exports = CustomSequencer;