import { faker } from '@faker-js/faker';

import { Alias } from '@sonarrTube/types/tvdb/Alias';

export const aliasFactory = (): Alias => (
    {
        language: faker.location.country(),
        name: faker.lorem.words(),
    }
);