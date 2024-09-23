
import { EpisodeFactory } from 'tests/__mocks__/factories/models/api/sonarr/Episode';

import { Episode } from '@sonarrTube/models/api/sonarr/Episode';
import { Series } from '@sonarrTube/models/api/sonarr/Series';
import { Episode as EpisodeType } from '@sonarrTube/types/sonarr/Episode.js';
import { Series as SeriesType } from '@sonarrTube/types/sonarr/Series.js';
export const generateEpisode = (): Episode => {
    const seriesPayload = {} as SeriesType;
    const series = new Series(seriesPayload);
    const episodePayload = {} as EpisodeType;

    return new Episode(episodePayload, series);
};

describe('Episode', () => {
    describe('constructor', () => {
        it('should create an instance of Episode', () => {
            // const episode = generateEpisode();
            const x = EpisodeFactory.build();
            x.tvdbCacheKey();
            console.dir(x);
            // expect(episode).toBeInstanceOf(Episode);
        });
    });

    describe('tvdbCacheKey', () => {
        it('returns a valid cache key', () => {
            const episode = generateEpisode();
            const result = episode.tvdbCacheKey();
            expect(result).toBe('/cache/tvdb//.json');
        });
    });
});