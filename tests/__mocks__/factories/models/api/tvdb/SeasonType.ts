import { faker } from '@faker-js/faker';

import { SeasonType } from '@sonarrTube/types/tvdb/SeasonType';

export const seasonTypeFactory = (): SeasonType => (
    {
        alternateName: faker.lorem.words(),
        id: faker.number.int(),
        name: faker.lorem.words(),
        type: faker.lorem.words(),
    }
);