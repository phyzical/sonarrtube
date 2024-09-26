import { seriesFactory } from '@sonarrTube/factories/models/api/sonarr/Series';
import { faker } from '@faker-js/faker';

import { Episode as EpisodeType } from '@sonarrTube/types/sonarr/Episode';
import { Episode } from '@sonarrTube/models/api/sonarr/Episode';
import { Series } from '@sonarrTube/types/sonarr/Series';


export const episodeFactory = (params: object = {}, series: Series | undefined = undefined): Episode => new Episode(
    {
        seasonNumber: faker.number.int(),
        episodeNumber: faker.number.int(),
        hasFile: faker.datatype.boolean(),
        ...params
    } as EpisodeType,
    series || seriesFactory()
);