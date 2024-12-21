
import { faker } from '@faker-js/faker';

import { Tag } from '@sonarrTube/types/tvdb/Tag';


export const tagFactory = (): Tag => (
    {
        helpText: faker.lorem.words(),
        id: faker.number.int(),
        name: faker.lorem.words(),
        tag: faker.number.int(),
        tagName: faker.lorem.words(),
    }
);