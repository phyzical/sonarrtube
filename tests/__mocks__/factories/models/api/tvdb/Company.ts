import { faker } from '@faker-js/faker';

import { generateRandomArray } from '@sonarrTube/factories/RandomArray';
import { Alias } from '@sonarrTube/types/tvdb/Alias';
import { Company } from '@sonarrTube/types/tvdb/Company';
import { Tag } from '@sonarrTube/types/tvdb/Tag';
import { aliasFactory } from '@sonarrTube/factories/models/api/tvdb/Alias';
import { parentCompanyFactory } from '@sonarrTube/factories/models/api/tvdb/ParentCompany';
import { tagFactory } from '@sonarrTube/factories/models/api/tvdb/Tag';

export const companyFactory = (): Company => (
    {
        activeDate: faker.lorem.words(),
        aliases: generateRandomArray(() => aliasFactory()) as Alias[],
        country: faker.lorem.words(),
        id: faker.number.int(),
        inactiveDate: faker.lorem.words(),
        name: faker.lorem.words(),
        nameTranslations: generateRandomArray(() => faker.lorem.words()) as string[],
        overviewTranslations: generateRandomArray(() => faker.lorem.words()) as string[],
        primaryCompanyType: faker.number.int(),
        slug: faker.lorem.words(),
        parentCompany: parentCompanyFactory(),
        tagOptions: generateRandomArray(() => tagFactory()) as Tag[],
    }
);