
import { seriesFactory } from '@sonarrTube/factories/models/api/tvdb/Series';
import { Series } from '@sonarrTube/models/api/tvdb/Series';
import { Constants } from '@sonarrTube/types/config/Constants';

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

            expect(result).toEqual(expect.arrayContaining(series.episodes));
            expect(result).toBeArrayOfSize(series.episodes.length);
        });
    });
});