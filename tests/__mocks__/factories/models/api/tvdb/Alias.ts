import { faker } from '@faker-js/faker';

import { Alias } from '@sonarrTube/types/tvdb/Alias';

export const aliasFactory = (): Alias => (
    {
        language: faker.lorem.words(),
        name: faker.lorem.words(),
    }
);