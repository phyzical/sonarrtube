import { faker } from '@faker-js/faker';

import { Generic } from '@sonarrTube/types/tvdb/Generic';

export const genericFactory = (): Generic => (
    {
        image: faker.lorem.words(),
        name: faker.lorem.words(),
        year: faker.lorem.words(),
    }
);