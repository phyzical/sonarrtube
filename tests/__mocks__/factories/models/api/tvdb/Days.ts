import { faker } from '@faker-js/faker';

import { Days } from '@sonarrTube/types/tvdb/Days';

export const daysFactory = (): Days => (
    {
        friday: faker.datatype.boolean(),
        monday: faker.datatype.boolean(),
        saturday: faker.datatype.boolean(),
        sunday: faker.datatype.boolean(),
        thursday: faker.datatype.boolean(),
        tuesday: faker.datatype.boolean(),
        wednesday: faker.datatype.boolean(),
    }
);