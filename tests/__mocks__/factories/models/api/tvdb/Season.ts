import { faker } from '@faker-js/faker';

import { generateRandomArray } from '@sonarrTube/factories/RandomArray';
import { Season } from '@sonarrTube/types/tvdb/Season';
import { companiesFactory } from '@sonarrTube/factories/models/api/tvdb/Companies';
import { typeFactory } from '@sonarrTube/factories/models/api/tvdb/Type';

export const seasonFactory = (): Season => (
    {
        id: faker.number.int(),
        image: faker.internet.url(),
        imageType: faker.number.int(),
        lastUpdated: faker.date.anytime().toString(),
        name: faker.lorem.words(),
        nameTranslations: generateRandomArray(() => faker.lorem.words()) as string[],
        number: faker.number.int(),
        overviewTranslations: generateRandomArray(() => faker.lorem.words()) as string[],
        companies: companiesFactory(),
        seriesId: faker.number.int(),
        type: typeFactory(),
        year: faker.number.int().toString(),
    }
);