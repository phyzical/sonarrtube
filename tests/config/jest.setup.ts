import * as matchers from 'jest-extended';

import { resetCache } from '@sonarrTube/helpers/Cache';
import { mockConfig, resetConfig, testConfig } from '@sonarrTube/mocks/Config';
import '@sonarrTube/mocks/Fetch';
import '@sonarrTube/mocks/Spies';
import '@sonarrTube/mocks/execSync';
import { Constants } from '@sonarrTube/types/config/Constants';

expect.extend(matchers);

beforeEach(() => {
    jest.retryTimes(2);
    Constants.ENVIRONMENT.ENV_FILE = '';
    mockConfig();
});

afterEach(() => {
    jest.restoreAllMocks();
    jest.clearAllMocks();
    resetConfig();
});

afterAll(() => {
    resetCache(testConfig.cacheDir);
});