import { faker } from '@faker-js/faker';

import { ParentCompany } from '@sonarrTube/types/tvdb/ParentCompany';
import { relationFactory } from '@sonarrTube/factories/models/api/tvdb/Relation';

export const parentCompanyFactory = (): ParentCompany => (
    {
        id: faker.number.int(),
        name: faker.lorem.words(),
        relation: relationFactory(),
    }
);