import { channels } from '@sonarrTube/api/Youtube';
import { seriesFactory } from '@sonarrTube/factories/models/api/tvdb/Series';

xdescribe('Youtube', () => {
    describe('channels', () => {
        describe('When matching by id youtube url', () => {
            describe('When playlist', () => {

                it('should return a list of channels', async () => {

                    const result = await channels([seriesFactory({
                        id: '373426', remoteIds: [
                            {
                                id: 'https://www.youtube.com/playlist?list=PLJtitKU0CAej22ZWBqrimPkn0Bbo6ci-r',
                                type: 4,
                                sourceName: 'Official Website'
                            },
                        ],
                    })]);
                    expect(result).toBeDefined();
                });
            });
            describe('When channel', () => {
            });
        });


        describe('When source is youtube', () => {
            it('should return a list of channels', async () => {

                const result = await channels([seriesFactory({
                    id: '373426', remoteIds: [

                        {
                            id: 'UCiDJtJKMICpb9B1qf7qjEOA',
                            type: 11,
                            sourceName: 'Youtube'
                        }
                    ],
                })]);
                expect(result).toBeDefined();
            });
        });

        describe('When fails to find a youtube id', () => {
        });

        describe('When fails to find a videos given a id', () => {
        });
    });
});