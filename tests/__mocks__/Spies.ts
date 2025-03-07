export let consoleSpy: jest.SpyInstance;
export let doRequestSpy: jest.SpyInstance;
export let processSpy: jest.SpyInstance;
export let setCacheSpy: jest.SpyInstance;
export let getCacheSpy: jest.SpyInstance;
export let execSyncSpy: jest.SpyInstance;

beforeEach(() => {
    consoleSpy = jest.spyOn(console, 'log');
    processSpy = jest.spyOn(process, 'exit').mockImplementation(() => null as never);

    // eslint-disable-next-line @typescript-eslint/no-require-imports
    doRequestSpy = jest.spyOn(require('@sonarrTube/helpers/Requests'), 'doRequest');

    // eslint-disable-next-line @typescript-eslint/no-require-imports
    setCacheSpy = jest.spyOn(require('@sonarrTube/helpers/Cache'), 'setCache');

    // eslint-disable-next-line @typescript-eslint/no-require-imports
    getCacheSpy = jest.spyOn(require('@sonarrTube/helpers/Cache'), 'getCache');

    // eslint-disable-next-line @typescript-eslint/no-require-imports
    execSyncSpy = jest.spyOn(require('child_process'), 'execSync');
    execSyncSpy.mockImplementation(() => ({}));
});
