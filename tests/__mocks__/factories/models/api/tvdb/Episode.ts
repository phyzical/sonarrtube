import { faker } from '@faker-js/faker';

import { seriesFactory } from '@sonarrTube/factories/models/api/tvdb/Series';
import { Episode as EpisodeType } from '@sonarrTube/types/tvdb/Episode';
import { Episode } from '@sonarrTube/models/api/tvdb/Episode';
import { Series } from '@sonarrTube/types/tvdb/Series';


export const episodeFactory = (
    params: object = {},
    series: Series = seriesFactory()
): Episode => new Episode(
    {
        aired: faker.date.anytime().toString(),
        image: faker.internet.url(),
        productionCode: faker.lorem.words(),
        name: faker.lorem.words(),
        overview: faker.lorem.words(),
        runtime: faker.number.float(),
        seasonNumber: faker.number.int(),
        ...params
    } as EpisodeType,
    series
);
