import { faker } from '@faker-js/faker';

import { ContentRating } from '@sonarrTube/types/tvdb/ContentRating';

export const contentRatingFactory = (): ContentRating => (
    {
        id: faker.number.int(),
        name: faker.lorem.words(),
        description: faker.lorem.words(),
        country: faker.lorem.words(),
        contentType: faker.lorem.words(),
        order: faker.number.int(),
        fullName: faker.lorem.words(),
    }
);