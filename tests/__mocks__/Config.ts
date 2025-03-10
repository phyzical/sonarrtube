import { config } from '@sonarrTube/helpers/Config';
import { Config } from '@sonarrTube/types/config/Config';

const initialProcessEnv = process.env;

let configMock: jest.SpyInstance;
export const testConfig = {
    cacheDir: 'tmp/cache',
    verbose: true,
    isDocker: true,
    preview: false,
    downloadOnly: false,
    sonarr: { host: 'http://sonarr', apiKey: '12345' },
};

export const mockConfig = (configData = {} as Partial<Config>): jest.SpyInstance => {
    const originalConfig = config();

    configMock?.mockReset();

    // eslint-disable-next-line @typescript-eslint/no-require-imports
    return configMock = jest.spyOn(require('@sonarrTube/helpers/Config'), 'config').mockImplementation(() => ({
        ...originalConfig,
        ...testConfig,
        ...configData
    }));
};

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