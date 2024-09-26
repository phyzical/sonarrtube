import { faker } from '@faker-js/faker';

import { seriesFactory } from '@sonarrTube/factories/models/api/tvdb/Series';
import { Episode as EpisodeType } from '@sonarrTube/types/tvdb/Episode';
import { Episode } from '@sonarrTube/models/api/tvdb/Episode';
import { Series } from '@sonarrTube/types/tvdb/Series';


export const episodeFactory = (params: object = {}, series: Series | undefined = undefined): Episode => new Episode(
    {
        aired: faker.lorem.words(),
        image: faker.lorem.words(),
        productionCode: faker.lorem.words(),
        name: faker.lorem.words(),
        overview: faker.lorem.words(),
        runtime: faker.number.float(),
        seasonNumber: faker.number.int(),
        ...params
    } as EpisodeType,
    series || seriesFactory()
);
