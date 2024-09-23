import { typeFactory } from 'tests/__mocks__/factories/Type';
import { seriesFactory } from 'tests/__mocks__/factories/models/api/sonarr/Series';

import { Episode as EpisodeType } from '@sonarrTube/types/sonarr/Episode';
import { Episode } from '@sonarrTube/models/api/sonarr/Episode';


export const episodeFactory = (): Episode => new Episode(
    typeFactory('sonarr/Episode') as EpisodeType,
    seriesFactory()
);