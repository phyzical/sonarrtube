import { typeFactory } from 'tests/__mocks__/factories/Type';
import { seriesFactory } from 'tests/__mocks__/factories/models/api/sonarr/Series';

import { Episode as EpisodeType } from '@sonarrTube/types/sonarr/Episode';
import { Episode } from '@sonarrTube/models/api/sonarr/Episode';
import { Series } from '@sonarrTube/types/sonarr/Series';


export const episodeFactory = (params: object = {}, series: Series | undefined = undefined): Episode => new Episode(
    { ...typeFactory('sonarr/Episode'), ...params } as EpisodeType,
    series || seriesFactory()
);