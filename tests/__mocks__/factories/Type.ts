import { readFileSync } from 'fs';

import { mock } from 'intermock';

// eslint-disable-next-line max-len
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type, @typescript-eslint/explicit-module-boundary-types
export const typeFactory = (typeFilePath: string, optional: boolean = true) => {
    typeFilePath = `${process.cwd()}/src/types/${typeFilePath}.ts`;
    const contents = readFileSync(typeFilePath, 'utf8').split('\n')
        .filter(line => !line.includes('() =>'))
        .join('\n');

    const mockedObject = mock({
        files: [[
            typeFilePath,
            contents
        ]],
        isOptionalAlwaysEnabled: optional
    });

    return mockedObject[Object.keys(mockedObject)[0]];
};