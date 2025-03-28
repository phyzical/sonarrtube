import { faker } from '@faker-js/faker';

import { Generic } from '@sonarrTube/types/tvdb/Generic';

export const genericFactory = (): Generic => (
    {
        image: faker.internet.url(),
        name: faker.lorem.words(),
        year: faker.number.int().toString(),
    }
);