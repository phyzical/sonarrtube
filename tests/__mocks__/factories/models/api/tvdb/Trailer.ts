import { faker } from '@faker-js/faker';

import { Trailer } from '@sonarrTube/types/tvdb/Trailer';

export const trailerFactory = (): Trailer => (
    {
        id: faker.number.int(),
        language: faker.location.country(),
        name: faker.lorem.words(),
        url: faker.internet.url(),
        runtime: faker.number.float(),
    }
);