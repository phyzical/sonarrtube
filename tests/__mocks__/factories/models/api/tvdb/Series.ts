import { faker } from '@faker-js/faker';

import { episodeFactory } from '@sonarrTube/factories/models/api/tvdb/Episode';
import { Series as SeriesType } from '@sonarrTube/types/tvdb/Series';
import { Series } from '@sonarrTube/models/api/tvdb/Series';
import { generateRandomArray } from '@sonarrTube/factories/RandomArray';
import { Episode } from '@sonarrTube/models/api/tvdb/Episode';
import { RemoteID } from '@sonarrTube/types/tvdb/RemoteID';
import { Season } from '@sonarrTube/types/tvdb/Season';
import { SeasonType } from '@sonarrTube/types/tvdb/SeasonType';
import { remoteIDFactory } from '@sonarrTube/factories/models/api/tvdb/RemoteID';
import { seasonFactory } from '@sonarrTube/factories/models/api/tvdb/Season';
import { seasonTypeFactory } from '@sonarrTube/factories/models/api/tvdb/SeasonType';

export const seriesFactory = (params: object = {}): Series => {
    const series = new Series(
        {
            defaultSeasonType: faker.number.int(),
            id: faker.number.int(),
            image: faker.lorem.words(),
            name: faker.lorem.words(),
            overview: faker.lorem.words(),
            remoteIds: generateRandomArray(() => remoteIDFactory()) as RemoteID[],
            seasons: generateRandomArray(() => seasonFactory()) as Season[],
            seasonTypes: generateRandomArray(() => seasonTypeFactory()) as SeasonType[],
            slug: faker.lorem.words(),
            year: faker.lorem.words(),
            ...params
        } as SeriesType,
    );

    series.episodes = generateRandomArray(() => episodeFactory({}, series)) as Episode[];

    return series;
};