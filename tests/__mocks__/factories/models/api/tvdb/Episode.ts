import { seriesFactory } from 'tests/__mocks__/factories/models/api/tvdb/Series';
import { typeFactory } from 'tests/__mocks__/factories/Type';

import { Episode as EpisodeType } from '@sonarrTube/types/tvdb/Episode';
import { Episode } from '@sonarrTube/models/api/tvdb/Episode';


export const episodeFactory = (): Episode => new Episode(
    typeFactory('tvdb/Episode') as EpisodeType,
    seriesFactory()
);