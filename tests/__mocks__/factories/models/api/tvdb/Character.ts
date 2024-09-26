import { faker } from '@faker-js/faker';

import { generateRandomArray } from '@sonarrTube/factories/RandomArray';
import { aliasFactory } from '@sonarrTube/factories/models/api/tvdb/Alias';
import { genericFactory } from '@sonarrTube/factories/models/api/tvdb/Generic';
import { tagFactory } from '@sonarrTube/factories/models/api/tvdb/Tag';
import { Character } from '@sonarrTube/types/tvdb/Character';
import { Alias } from '@sonarrTube/types/tvdb/Alias';
import { Tag } from '@sonarrTube/types/tvdb/Tag';

export const characterFactory = (): Character => (
    {
        aliases: generateRandomArray(() => aliasFactory()) as Alias[],
        episode: genericFactory(),
        episodeId: faker.number.int(),
        id: faker.number.int(),
        image: faker.lorem.words(),
        isFeatured: faker.datatype.boolean(),
        movieId: faker.number.int(),
        movie: genericFactory(),
        name: faker.lorem.words(),
        nameTranslations: generateRandomArray(() => faker.lorem.words()) as string[],
        overviewTranslations: generateRandomArray(() => faker.lorem.words()) as string[],
        peopleId: faker.number.int(),
        personImgURL: faker.lorem.words(),
        peopleType: faker.lorem.words(),
        seriesId: faker.number.int(),
        series: genericFactory(),
        sort: faker.number.int(),
        tagOptions: generateRandomArray(() => tagFactory()) as Tag[],
        type: faker.number.int(),
        url: faker.lorem.words(),
        personName: faker.lorem.words(),
    }
);