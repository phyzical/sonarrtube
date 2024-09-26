
import { consoleSpy } from 'tests/config/jest.setup';

import { episodeFactory } from '@sonarrTube/factories/models/api/tvdb/Episode';
import { Episode } from '@sonarrTube/models/api/tvdb/Episode';
import { Constants } from '@sonarrTube/types/config/Constants';

describe('Episode', () => {
    describe('constructor', () => {
        it('should create an instance of Episode', () => {
            expect(episodeFactory()).toBeInstanceOf(Episode);
        });
    });

    describe('cacheKey', () => {
        it('returns a valid cache key', () => {
            const episode = episodeFactory();
            const result = episode.cacheKey();
            expect(result).toBe(
                `/${Constants.CACHE_FOLDERS.TVDB}/${episode.seriesId}/${episode.id}.json`
            );
        });
    });

    describe('editURL', () => {
        it('returns a valid edit URL', () => {
            const episode = episodeFactory();
            const result = episode.editURL();
            expect(result).toBe(
                `${Constants.TVDB.HOST}/series/${encodeURIComponent(episode.series.slug)}/episodes/${episode.id}/0/edit`
            );
        });
    });

    describe('overviewLog', () => {
        it('returns a valid overview log', () => {
            const episode = episodeFactory();
            episode.overviewLog();
            expect(consoleSpy).toHaveBeenCalledWith(
                expect.toIncludeMultiple(
                    [
                        episode.youtubeURL(),
                        episode.editURL(),
                        episode.aired,
                        episode.name,
                        episode.seasonNumber.toString()
                    ]
                )
            );
        });
    });

    describe('youtubeURL', () => {
        it('returns a valid youtube URL', () => {
            const episode = episodeFactory();
            const result = episode.youtubeURL();
            expect(result).toBe(`${Constants.YOUTUBE.HOST}/watch?v=${episode.productionCode}`);
        });

        it('returns empty sting when no url', () => {
            const episode = episodeFactory({ productionCode: '' });
            const result = episode.youtubeURL();
            expect(result).toBe('');
        });
    });
});