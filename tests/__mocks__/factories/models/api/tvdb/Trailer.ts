import { faker } from '@faker-js/faker';

import { Trailer } from '@sonarrTube/types/tvdb/Trailer';

export const trailerFactory = (): Trailer => (
    {
        id: faker.number.int(),
        language: faker.lorem.words(),
        name: faker.lorem.words(),
        url: faker.lorem.words(),
        runtime: faker.number.float(),
    }
);