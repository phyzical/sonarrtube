import { config } from '@sonarrTube/helpers/Config';
import { Constants } from '@sonarrTube/types/config/Constants';
import { resetCache } from '@sonarrTube/helpers/Cache';

const initialProcessEnv = process.env;
export let consoleSpy: jest.SpyInstance;
export let doRequestSpy: jest.SpyInstance;
export let processSpy: jest.SpyInstance;

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

global.fetch = jest.fn<Promise<Response>, [URL | RequestInfo, RequestInit?]>(() =>
    Promise.resolve<Response>(new Response(JSON.stringify({}), {
        headers: new Headers(),
        status: 200,
        statusText: 'OK',
        // add other properties of Response if needed
    }))
);

beforeEach(() => {
    consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => null);
    processSpy = jest.spyOn(process, 'exit').mockImplementation(() => null as never);
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    doRequestSpy = jest.spyOn(require('@sonarrTube/helpers/Requests'), 'doRequest').mockImplementation(() => null);
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
    resetCache(testConfig.cacheDir);
    resetConfig();
});