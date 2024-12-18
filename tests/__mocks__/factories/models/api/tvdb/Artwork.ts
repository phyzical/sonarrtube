import { faker } from '@faker-js/faker';

import { generateRandomArray } from '@sonarrTube/factories/RandomArray';
import { tagFactory } from '@sonarrTube/factories/models/api/tvdb/Tag';
import { statusFactory } from '@sonarrTube/factories/models/api/tvdb/Status';
import { Artwork } from '@sonarrTube/types/tvdb/Artwork';
import { Tag } from '@sonarrTube/types/tvdb/Tag';

export const artworkFactory = (): Artwork => (
    {
        episodeId: faker.number.int(),
        height: faker.number.float(),
        id: faker.number.int(),
        image: faker.lorem.words(),
        includesText: faker.datatype.boolean(),
        language: faker.location.country(),
        movieId: faker.number.int(),
        networkId: faker.number.int(),
        peopleId: faker.number.int(),
        score: faker.number.float(),
        seasonId: faker.number.int(),
        seriesId: faker.number.int(),
        seriesPeopleId: faker.number.int(),
        status: statusFactory(),
        tagOptions: generateRandomArray(() => tagFactory()) as Tag[],
        thumbnail: faker.internet.url(),
        thumbnailHeight: faker.number.float(),
        thumbnailWidth: faker.number.float(),
        type: faker.number.int(),
        updatedAt: faker.number.int(),
        width: faker.number.float(),
    }
);