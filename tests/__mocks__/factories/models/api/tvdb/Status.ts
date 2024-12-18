import { faker } from '@faker-js/faker';

import { Status } from '@sonarrTube/types/tvdb/Status';

export const statusFactory = (): Status => (
    {
        id: faker.number.int(),
        keepUpdated: faker.datatype.boolean(),
        name: faker.lorem.words(),
        recordType: faker.lorem.words(),
    }
);