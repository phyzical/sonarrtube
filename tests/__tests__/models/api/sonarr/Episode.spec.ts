import { episodeFactory } from 'tests/__mocks__/factories/models/api/sonarr/Episode';

import { Episode } from '@sonarrTube/models/api/sonarr/Episode';
import { Constants } from '@sonarrTube/types/config/Constants';


describe('Episode', () => {
    describe('constructor', () => {
        it('should create an instance of Episode', () => {
            expect(episodeFactory()).toBeInstanceOf(Episode);
        });
    });

    describe('tvdbCacheKey', () => {
        it('returns a valid cache key', () => {
            const episode = episodeFactory();
            const result = episode.tvdbCacheKey();
            expect(result).toBe(`/${Constants.CACHE_FOLDERS.TVDB}/${episode.series.tvdbId}/${episode.tvdbId}.json`);
        });
    });
});