import { faker } from '@faker-js/faker';

import { channels } from '@sonarrTube/api/Youtube';
import { seriesFactory } from '@sonarrTube/factories/models/api/tvdb/Series';
import { consoleSpy } from '@sonarrTube/mocks/Spies';

describe('Youtube', () => {
    describe('channels', () => {
        describe('When matching by id youtube url', () => {
            describe('When playlist', () => {

                it('should return a list of channels', async () => {

                    const result = await channels([seriesFactory({
                        name: 'Adam Savage’s Tested',
                        id: '373426', remoteIds: [
                            {
                                id: 'https://www.youtube.com/playlist?list=PLJtitKU0CAej22ZWBqrimPkn0Bbo6ci-r',
                                type: 4,
                                sourceName: 'Official Website'
                            },
                            {
                                'id': 'UCiDJtJKMICpb9B1qf7qjEOA',
                                'type': 11,
                                'sourceName': 'Youtube'
                            }
                        ],
                    })]);
                    expect(result).toBeArrayOfSize(1);
                    expect(result[0].id).toBe('UCiDJtJKMICpb9B1qf7qjEOA');
                    expect(result[0].videos).toBeArrayOfSize(2);
                });
            });
            describe('When channel', () => {
                it('should return a list of channels', async () => {

                    const result = await channels([seriesFactory({
                        name: 'Adam Savage’s Tested',
                        id: '373426', remoteIds: [
                            {
                                id: 'https://www.youtube.com/channel/UCiDJtJKMICpb9B1qf7qjEOA',
                                type: 4,
                                sourceName: 'Official Website'
                            }
                        ],
                    })]);
                    expect(result).toBeArrayOfSize(1);
                    expect(result[0].id).toBe('UCiDJtJKMICpb9B1qf7qjEOA');
                    expect(result[0].videos).toBeArrayOfSize(2);
                });
            });
        });


        describe('When fails to find a youtube id', () => {
            it('should return an empty array', async () => {

                const result = await channels([seriesFactory({
                    name: 'Adam Savage’s Tested',
                    id: '373426', remoteIds: [
                        {
                            id: faker.internet.url(),
                            type: 4,
                            sourceName: 'Official Website'
                        }
                    ],
                })]);
                expect(consoleSpy).toHaveBeenCalledWith(
                    'Warning Could not get youtube channel id for Adam Savage’s Tested, Skipping'
                );
                expect(result).toBeArrayOfSize(0);
            });
        });

        describe('When fails to find a videos given a id', () => {

            it('should return an empty array', async () => {

                const result = await channels([seriesFactory({
                    name: 'Adam Savage’s Tested',
                    id: '373426', remoteIds: [
                        {
                            id: 'https://www.youtube.com/playlist?list=PLJtitKU0CAej22ZWBqrimPkn0Bbo6ci-rs',
                            type: 4,
                            sourceName: 'Official Website'
                        }
                    ],
                })]);
                expect(consoleSpy).toHaveBeenCalledWith(
                    'Warning Could not get youtube channel id for Adam Savage’s Tested, Skipping'
                );
                expect(result).toBeArrayOfSize(0);
            });
        });
    });
});