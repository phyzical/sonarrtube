import { faker } from '@faker-js/faker';

import { Type } from '@sonarrTube/types/tvdb/Type';

export const typeFactory = (): Type => (
    {
        alternateName: faker.lorem.words(),
        id: faker.number.int(),
        name: faker.lorem.words(),
        type: faker.lorem.words(),
    }
);