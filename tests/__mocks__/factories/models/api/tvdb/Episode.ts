import { seriesFactory } from 'tests/__mocks__/factories/models/api/tvdb/Series';
import { typeFactory } from 'tests/__mocks__/factories/Type';

import { Episode as EpisodeType } from '@sonarrTube/types/tvdb/Episode';
import { Episode } from '@sonarrTube/models/api/tvdb/Episode';
import { Series } from '@sonarrTube/types/tvdb/Series';
import { generateRandomArray } from '@sonarrTube/factories/RandomArray';


export const episodeFactory = (params: object = {}, series: Series | undefined = undefined): Episode => {
    const episode = new Episode(
        { ...typeFactory('tvdb/Episode'), ...params } as EpisodeType,
        series || seriesFactory()
    );
    episode.seasons = generateRandomArray().map(_ => typeFactory('tvdb/Season'));
    episode.characters = generateRandomArray().map(_ => typeFactory('tvdb/Character'));
    episode.companies = generateRandomArray().map(_ => typeFactory('tvdb/Company'));
    episode.contentRatings = generateRandomArray().map(_ => typeFactory('tvdb/ContentRating'));
    episode.networks = generateRandomArray().map(_ => typeFactory('tvdb/Company'));
    episode.studios = generateRandomArray().map(_ => typeFactory('tvdb/Company'));
    episode.tagOptions = generateRandomArray().map(_ => typeFactory('tvdb/Tag'));
    episode.trailers = generateRandomArray().map(_ => typeFactory('tvdb/Trailer'));
    episode.translations = typeFactory('tvdb/Translations');

    return episode;
};
