import { ShowSubmitter } from '../../src/ShowSubmitter';
import * as ConfigHelper from '../../src/helpers/Config';
import * as CacheHelper from '../../src/helpers/Cache';
import { Constants } from '../../src/types/config/Constants';

// Mock external dependencies
jest.mock('../../src/helpers/Config', () => ({
    config: jest.fn().mockReturnValue({ /* Mocked config object */ }),
}));


describe('ShowSubmitter', () => {
    beforeEach(() => {
        // Reset mocks before each test
        jest.clearAllMocks();
    });

    describe('constructor', () => {
        it('should initialize config', () => {
            const showSubmitter = new ShowSubmitter();
            expect(ConfigHelper.config).toHaveBeenCalled();
            expect(showSubmitter.config).toBeDefined();
        });

        it('should set the correct folder path', () => {
            const showSubmitter = new ShowSubmitter();
            expect(CacheHelper.cachePath).toHaveBeenCalledWith(`${Constants.CACHE_FOLDERS.SCREENSHOTS}/`);
            expect(ShowSubmitter.folder).toEqual('/mocked/cache/path/mocked_screenshots/');
        });
    });

    describe('initSubmitter', () => {
        it('should initialize submitter without throwing', async () => {
            const showSubmitter = new ShowSubmitter();
            await expect(showSubmitter['initSubmitter']()).resolves.not.toThrow();
        });
    });
});