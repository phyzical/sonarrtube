
import { series } from '@sonarrTube/api/Sonarr';
import { mockConfig } from '@sonarrTube/mocks/Config';
describe('Sonarr', () => {
    beforeEach(() => {
        mockConfig({});
    });
    describe('series', () => {
        it('it filters out non youtube series, returns the right episodes', async () => {
            const youtubeSeries = await series();
            expect(youtubeSeries).toBeArrayOfSize(2);
            expect(youtubeSeries[0].episodes).toBeArrayOfSize(2);
        });

        describe('filtering Series', () => {
            beforeEach(() => {
                mockConfig({
                    tvdb: {
                        username: '',
                        password: '',
                        email: '',
                        apiKey: '',
                        skippedEpisodeIds: [],
                        matchSeriesIds: [],
                        skipSeriesIds: [373426]
                    }
                });
            });

            it('it filters out ', async () => {


                const youtubeSeries = await series();
                expect(youtubeSeries).toBeArrayOfSize(1);
                expect(youtubeSeries[0].episodes).toBeArrayOfSize(2);
                expect(youtubeSeries[0].id).toBe(8);
            });
        });

        describe('Matching season ', () => {
            beforeEach(() => {
                mockConfig({
                    tvdb: {
                        username: '',
                        password: '',
                        email: '',
                        apiKey: '',
                        skippedEpisodeIds: [],
                        matchSeriesIds: [373426],
                        skipSeriesIds: []
                    }
                });
            });

            it('it filters out ', async () => {
                const youtubeSeries = await series();
                expect(youtubeSeries).toBeArrayOfSize(1);
                expect(youtubeSeries[0].episodes).toBeArrayOfSize(2);
                expect(youtubeSeries[0].id).toBe(2);
            });
        });

    });
});