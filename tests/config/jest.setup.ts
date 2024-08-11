import { Constants } from '@sonarrTube/types/config/Constants';

const initialProcessEnv = process.env;

global.fetch = jest.fn<Promise<Response>, [URL | RequestInfo, RequestInit?]>(() =>
    Promise.resolve<Response>(new Response(JSON.stringify({}), {
        headers: new Headers(),
        status: 200,
        statusText: 'OK',
        // add other properties of Response if needed
    }))
);

beforeEach(() => {
    Constants.ENVIRONMENT.ENV_FILE = '';
});

afterEach(() => {
    jest.restoreAllMocks();
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
});