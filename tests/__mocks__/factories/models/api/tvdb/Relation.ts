import { faker } from '@faker-js/faker';

import { Relation } from '@sonarrTube/types/tvdb/Relation';

export const relationFactory = (): Relation => (
    {
        id: faker.number.int(),
        typeName: faker.lorem.words(),
    }
);