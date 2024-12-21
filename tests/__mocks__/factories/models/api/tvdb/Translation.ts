import { faker } from '@faker-js/faker';

import { generateRandomArray } from '@sonarrTube/factories/RandomArray';
import { Translation } from '@sonarrTube/types/tvdb/Translation';

export const translationFactory = (): Translation => (
    {
        aliases: generateRandomArray(() => faker.lorem.words()) as string[],
        isAlias: faker.datatype.boolean(),
        isPrimary: faker.datatype.boolean(),
        language: faker.location.country(),
        name: faker.lorem.words(),
        overview: faker.lorem.words(),
        tagline: faker.lorem.words(),
    }
);