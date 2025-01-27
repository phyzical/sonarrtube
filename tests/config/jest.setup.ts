import * as matchers from 'jest-extended';

import { Constants } from '@sonarrTube/types/config/Constants';
import { resetCache } from '@sonarrTube/helpers/Cache';
import { mockConfig, resetConfig, testConfig } from '@sonarrTube/mocks/Config';
import '@sonarrTube/mocks/Fetch';
import '@sonarrTube/mocks/Spies';

expect.extend(matchers);
// jest.retryTimes(3);
beforeEach(() => {
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