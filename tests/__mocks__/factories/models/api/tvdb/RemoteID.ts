import { faker } from '@faker-js/faker';

import { RemoteID } from '@sonarrTube/types/tvdb/RemoteID';

export const remoteIDFactory = (): RemoteID => (
    {
        id: faker.lorem.words(),
        type: faker.number.int(),
        sourceName: faker.lorem.words(),
    }
);