import { faker } from '@faker-js/faker';

import { generateRandomArray } from '@sonarrTube/factories/RandomArray';
import { Alias } from '@sonarrTube/types/tvdb/Alias';
import { List } from '@sonarrTube/types/tvdb/List';
import { RemoteID } from '@sonarrTube/types/tvdb/RemoteID';
import { Tag } from '@sonarrTube/types/tvdb/Tag';
import { aliasFactory } from '@sonarrTube/factories/models/api/tvdb/Alias';
import { remoteIDFactory } from '@sonarrTube/factories/models/api/tvdb/RemoteID';
import { tagFactory } from '@sonarrTube/factories/models/api/tvdb/Tag';

export const listFactory = (): List => (
    {
        aliases: generateRandomArray(() => aliasFactory()) as Alias[],
        id: faker.number.int(),
        image: faker.lorem.words(),
        imageIsFallback: faker.datatype.boolean(),
        isOfficial: faker.datatype.boolean(),
        name: faker.lorem.words(),
        nameTranslations: generateRandomArray(() => faker.lorem.words()) as string[],
        overview: faker.lorem.words(),
        overviewTranslations: generateRandomArray(() => faker.lorem.words()) as string[],
        remoteIds: generateRandomArray(() => remoteIDFactory()) as RemoteID[],
        tags: generateRandomArray(() => tagFactory()) as Tag[],
        score: faker.number.float(),
        url: faker.internet.url(),
    }
);