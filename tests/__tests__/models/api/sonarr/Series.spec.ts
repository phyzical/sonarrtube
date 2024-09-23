

import { seriesFactory } from 'tests/__mocks__/factories/models/api/sonarr/Series';

import { Series } from '@sonarrTube/models/api/sonarr/Series';

describe('Series', () => {
    describe('constructor', () => {
        it('should create an instance of Episode', () => {
            expect(seriesFactory()).toBeInstanceOf(Series);
        });
    });

    // describe('tvdbCacheKey', () => {
    //     it('returns a valid cache key', () => {
    //         const series = seriesFactory();
    //         const result = series.tvdbCacheKey();
    //         expect(result).toBe(`/${Constants.CACHE_FOLDERS.TVDB}/${series.tvdbId}.json`);
    //     });
    // });
});