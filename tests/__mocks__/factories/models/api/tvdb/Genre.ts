import { faker } from '@faker-js/faker';

import { Genre } from '@sonarrTube/types/tvdb/Genre';

export const genreFactory = (): Genre => (
    {
        id: faker.number.int(),
        name: faker.lorem.words(),
        slug: faker.lorem.slug(),
    }
);