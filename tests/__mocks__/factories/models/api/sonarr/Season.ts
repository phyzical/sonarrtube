import { faker } from '@faker-js/faker';

import { generateRandomArray } from '@sonarrTube/factories/RandomArray';
import { statisticsFactory } from '@sonarrTube/factories/models/api/sonarr/Statistics';
import { Season } from '@sonarrTube/types/sonarr/Season';
import { Statistics } from '@sonarrTube/types/sonarr/Statistics';

export const seasonFactory = (): Season => (
    {
        seasonNumber: faker.number.int(),
        monitored: faker.datatype.boolean(),
        statistics: generateRandomArray(() => statisticsFactory()) as Statistics[]
    }
);