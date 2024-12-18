import { faker } from '@faker-js/faker';

import { episodeFactory } from '@sonarrTube/factories/models/api/sonarr/Episode';
import { seasonFactory } from '@sonarrTube/factories/models/api/sonarr/Season';
import { ratingFactory } from '@sonarrTube/factories/models/api/sonarr/Rating';
import { statisticsFactory } from '@sonarrTube/factories/models/api/sonarr/Statistics';
import { Series as SeriesType } from '@sonarrTube/types/sonarr/Series';
import { Series } from '@sonarrTube/models/api/sonarr/Series';
import { generateRandomArray } from '@sonarrTube/factories/RandomArray';
import { Episode } from '@sonarrTube/models/api/sonarr/Episode';

export const seriesFactory = (params: object = {}, videoCount: undefined | number = undefined): Series => {
    const series = new Series(
        {
            seasons: generateRandomArray(() => seasonFactory()),
            ratings: ratingFactory(),
            statistics: statisticsFactory(),
            title: faker.lorem.words(),
            status: faker.lorem.words(),
            overview: faker.lorem.words(),
            network: faker.company.name(),
            year: faker.number.int(),
            path: faker.system.filePath(),
            seasonFolder: faker.datatype.boolean(),
            monitored: faker.datatype.boolean(),
            tvdbId: faker.number.int(),
            titleSlug: faker.lorem.slug(),
            rootFolderPath: faker.system.directoryPath(),
            id: faker.number.int(),
            ...params
        } as SeriesType
    );

    // series.episodes = [1, 2, 3, 4, 5].map(() => episodeFactory({}, series)) as Episode[];


    series.episodes = generateRandomArray(() => episodeFactory({}, series), videoCount, videoCount) as Episode[];

    return series;
};