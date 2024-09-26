
import { consoleSpy, mockConfig } from 'tests/config/jest.setup';

import { seriesFactory } from '@sonarrTube/factories/models/api/tvdb/Series';
import { Series } from '@sonarrTube/models/api/tvdb/Series';
import { Constants } from '@sonarrTube/types/config/Constants';
import { config } from '@sonarrTube/helpers/Config';

describe('Series', () => {
    describe('constructor', () => {
        it('should create an instance of Series', () => {
            expect(seriesFactory()).toBeInstanceOf(Series);
        });
    });

    describe('filterEpisodes', () => {
        it('should return an array of episodes', () => {
            const series = seriesFactory();
            const result = series.filterEpisodes();
            expect(result).toEqual(expect.arrayContaining(series.episodes));
            expect(result).toBeArrayOfSize(series.episodes.length);
        });

        it('should return an array of episodes excluding removed ones', () => {
            const series = seriesFactory();
            series.episodes[0].productionCode = Constants.YOUTUBE.VIDEO_REMOVED_FLAG;

            const result = series.filterEpisodes();

            const episodes = series.episodes;
            episodes.shift();
            expect(result).toEqual(expect.arrayContaining(episodes));
            expect(result).toBeArrayOfSize(episodes.length);
        });

        describe('when skipped', () => {
            const skippedID = 12345;

            beforeEach(() => {
                mockConfig({
                    tvdb: {
                        ...config().tvdb,
                        skippedEpisodeIds: [skippedID],
                    }
                });
            });
            it('should return correct array of episodes', () => {
                const series = seriesFactory();
                series.episodes[0].id = skippedID;

                const result = series.filterEpisodes();

                const episodes = series.episodes;
                const skippedEpisode = episodes.shift();
                expect(result).toEqual(expect.arrayContaining(episodes));
                expect(result).toBeArrayOfSize(episodes.length);
                expect(consoleSpy).toHaveBeenCalledWith(
                    expect.toIncludeMultiple(
                        [
                            skippedEpisode?.youtubeURL() || '',
                            skippedEpisode?.editURL() || '',
                            skippedEpisode?.aired || '',
                            skippedEpisode?.name || '',
                            skippedEpisode?.seasonNumber.toString() || '',
                        ]
                    )
                );
            });
        });

    });
});