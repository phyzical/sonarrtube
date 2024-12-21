import { series } from '@sonarrTube/api/Tvdb';
import { seriesFactory } from '@sonarrTube/factories/models/api/sonarr/Series';
describe.skip('Tvdb', () => {
    describe('series', () => {
        it('should return a list of series', async () => {
            const serieses = await series([seriesFactory()]);
            expect(serieses).toBeDefined();
        });
    });
});