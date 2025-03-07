import { series } from '@sonarrTube/api/Tvdb';
import { seriesFactory } from '@sonarrTube/factories/models/api/sonarr/Series';
import { episodeFactory } from '@sonarrTube/factories/models/api/sonarr/Episode';
import { consoleSpy } from '@sonarrTube/mocks/Spies';
describe('Tvdb', () => {
    describe('series', () => {
        it('should return a list of series, should cache request and return same results', async () => {
            const payload = [
                seriesFactory(
                    {
                        tvdbId: 373426,
                        episodes: [episodeFactory({ tvdbId: 7546778 }), episodeFactory({ tvdbId: 7546771 })]
                    }
                ),
                seriesFactory(
                    {
                        tvdbId: 373427,
                        episodes: [episodeFactory({ tvdbId: 7546779 }), episodeFactory({ tvdbId: 7546772 })]
                    }
                )
            ];
            let serieses = await series(payload);
            expect(consoleSpy).toHaveBeenCalledWith('Logging into tvdb');
            expect(serieses).toBeArrayOfSize(2);
            expect(serieses[0].id).toBe(373426);
            expect(serieses[0].episodes).toBeArrayOfSize(2);
            expect(serieses[0].episodes[0].id).toBe(7546778);


            consoleSpy.mockReset();
            serieses = await series(payload);
            expect(consoleSpy).not.toHaveBeenCalledWith('Logging into tvdb');
            expect(consoleSpy).toHaveBeenCalledWith('Found /tvdb/373426.json in cache. Returning cached data.');
            expect(serieses).toBeArrayOfSize(2);
            expect(serieses[0].id).toBe(373426);
            expect(serieses[0].episodes).toBeArrayOfSize(2);
            expect(serieses[0].episodes[0].id).toBe(7546778);
        });
    });
});