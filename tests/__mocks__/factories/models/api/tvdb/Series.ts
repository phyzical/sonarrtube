import { episodeFactory } from 'tests/__mocks__/factories/models/api/tvdb/Episode';
import { typeFactory } from 'tests/__mocks__/factories/Type';

import { Series as SeriesType } from '@sonarrTube/types/tvdb/Series';
import { Series } from '@sonarrTube/models/api/tvdb/Series';
import { generateRandomArray } from '@sonarrTube/factories/RandomArray';

export const seriesFactory = (params: object = {}): Series => {
    const series = new Series(
        { ...typeFactory('tvdb/Series'), ...params } as SeriesType,
    );

    series.translations = typeFactory('tvdb/Translations');
    series.airsDays = typeFactory('tvdb/Days');
    series.originalNetwork = typeFactory('tvdb/Company');
    series.latestNetwork = typeFactory('tvdb/Company');
    series.status = typeFactory('tvdb/Status');
    series.aliases = generateRandomArray().map(_ => typeFactory('tvdb/Alias'));
    series.artworks = generateRandomArray().map(_ => typeFactory('tvdb/Artwork'));
    series.characters = generateRandomArray().map(_ => typeFactory('tvdb/Character'));
    series.contentRatings = generateRandomArray().map(_ => typeFactory('tvdb/ContentRating'));
    series.episodes = generateRandomArray().map(_ => episodeFactory({}, series));
    series.lists = generateRandomArray().map(_ => typeFactory('tvdb/List'));
    series.genres = generateRandomArray().map(_ => typeFactory('tvdb/Genre'));
    series.companies = generateRandomArray().map(_ => typeFactory('tvdb/Company'));
    series.remoteIds = generateRandomArray().map(_ => typeFactory('tvdb/RemoteID'));
    series.seasons = generateRandomArray().map(_ => typeFactory('tvdb/Season'));
    series.seasonTypes = generateRandomArray().map(_ => typeFactory('tvdb/SeasonType'));
    series.tags = generateRandomArray().map(_ => typeFactory('tvdb/Tag'));
    series.trailers = generateRandomArray().map(_ => typeFactory('tvdb/Trailer'));

    return series;
};