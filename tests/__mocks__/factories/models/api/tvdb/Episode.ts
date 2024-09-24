import { seriesFactory } from 'tests/__mocks__/factories/models/api/tvdb/Series';
import { typeFactory } from 'tests/__mocks__/factories/Type';

import { Episode as EpisodeType } from '@sonarrTube/types/tvdb/Episode';
import { Episode } from '@sonarrTube/models/api/tvdb/Episode';


export const episodeFactory = (): Episode => {
    const episode = new Episode(
        typeFactory('tvdb/Episode') as EpisodeType,
        seriesFactory()
    );
    episode.seasons?.map(_ => typeFactory('tvdb/Season'));
    episode.characters?.map(_ => typeFactory('tvdb/Character'));
    episode.companies?.map(_ => typeFactory('tvdb/Company'));
    episode.contentRatings?.map(_ => typeFactory('tvdb/ContentRating'));
    episode.networks?.map(_ => typeFactory('tvdb/Company'));
    episode.studios?.map(_ => typeFactory('tvdb/Company'));
    episode.tagOptions?.map(_ => typeFactory('tvdb/Tag'));
    episode.trailers?.map(_ => typeFactory('tvdb/Trailer'));
    episode.translations = typeFactory('tvdb/Translations');

    return episode;
};
