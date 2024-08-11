const initialProcessEnv = process.env;

beforeEach(() => { });

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
