import { faker } from '@faker-js/faker';

import { generateRandomArray } from '@sonarrTube/factories/RandomArray';
import { Statistics } from '@sonarrTube/types/sonarr/Statistics';


export const statisticsFactory = (): Statistics => (
    {
        seasonCount: faker.number.int(),
        episodeFileCount: faker.number.int(),
        episodeCount: faker.number.int(),
        totalEpisodeCount: faker.number.int(),
        sizeOnDisk: faker.number.float(),
        releaseGroups: generateRandomArray(() => faker.lorem.word()) as string[],
        percentOfEpisodes: faker.number.float()
    }
);