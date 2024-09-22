import { existsSync, readFileSync } from 'fs';
import { btoa } from 'buffer';
import { join } from 'path';

import { config } from '@sonarrTube/helpers/Config';
import { Constants } from '@sonarrTube/types/config/Constants';
import { resetCache } from '@sonarrTube/helpers/Cache';

const initialProcessEnv = process.env;
export let consoleSpy: jest.SpyInstance;
export let doRequestSpy: jest.SpyInstance;
export let processSpy: jest.SpyInstance;
export let setCacheSpy: jest.SpyInstance;
export let getCacheSpy: jest.SpyInstance;

let configMock: jest.SpyInstance;
const testConfig = {
    cacheDir: 'tmp/cache',
    verbose: true,
};

export const mockConfig = (configData = {}): jest.SpyInstance => {
    const originalConfig = config();

    configMock?.mockReset();

    // eslint-disable-next-line @typescript-eslint/no-var-requires
    return configMock = jest.spyOn(require('@sonarrTube/helpers/Config'), 'config').mockImplementation(() => ({
        ...originalConfig,
        ...testConfig,
        ...configData
    }));
};

global.fetch = jest.fn((url, _options) => {
    url = url.toString();
    const isImage = /png|jp(e)*g|webp/g.test(url);
    const uuid = btoa(url);
    let fileName = join(__dirname, '..', '__mocks__', 'requests', `${uuid}.json`);

    if (isImage) {
        fileName = join(__dirname, '..', '__mocks__', 'images', url.split('/').pop());
    }

    if (!existsSync(fileName)) {
        throw new Error(`Payload not found for ${url}, please save as ${fileName}`);
    }

    const bodyBuffer = readFileSync(fileName);
    const body = bodyBuffer.toString();

    const result = {
        body,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any;

    if (/png|jp(e)*g|webp/g.test(url)) {
        result.arrayBuffer = (): Promise<Buffer> => Promise.resolve(bodyBuffer);
    } else {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        result.json = (): Promise<any> => JSON.parse(body);
    }

    return Promise.resolve(result);
}) as jest.Mock;

beforeEach(() => {
    consoleSpy = jest.spyOn(console, 'log');
    processSpy = jest.spyOn(process, 'exit').mockImplementation(() => null as never);
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    doRequestSpy = jest.spyOn(require('@sonarrTube/helpers/Requests'), 'doRequest');
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    setCacheSpy = jest.spyOn(require('@sonarrTube/helpers/Cache'), 'setCache');
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    getCacheSpy = jest.spyOn(require('@sonarrTube/helpers/Cache'), 'getCache');
    Constants.ENVIRONMENT.ENV_FILE = '';
    mockConfig();
});

export const resetConfig = (): void => {
    global.cachedConfig = {};
    // Clear environment variables set by dotenv
    // eslint-disable-next-line no-restricted-syntax
    for (const key in process.env) {
        // eslint-disable-next-line no-prototype-builtins
        if (process.env.hasOwnProperty(key) && !initialProcessEnv.hasOwnProperty(key)) {
            delete process.env[key];
        }
    }

    // Restore initial environment variables
    process.env = { ...initialProcessEnv };
};

afterEach(() => {
    jest.restoreAllMocks();
    jest.clearAllMocks();
    resetConfig();
});

afterAll(() => {
    resetCache(testConfig.cacheDir);
});