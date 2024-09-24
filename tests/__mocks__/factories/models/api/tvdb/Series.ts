import { episodeFactory } from 'tests/__mocks__/factories/models/api/tvdb/Episode';
import { typeFactory } from 'tests/__mocks__/factories/Type';

import { Series as SeriesType } from '@sonarrTube/types/tvdb/Series';
import { Series } from '@sonarrTube/models/api/tvdb/Series';

export const seriesFactory = (): Series => {
    const series = new Series(
        typeFactory('tvdb/Series') as SeriesType
    );

    series.translations = typeFactory('tvdb/Translations');
    series.airsDays = typeFactory('tvdb/Days');
    series.originalNetwork = typeFactory('tvdb/Company');
    series.latestNetwork = typeFactory('tvdb/Company');
    series.status = typeFactory('tvdb/Status');
    series.aliases?.map(_ => typeFactory('tvdb/Alias'));
    series.artworks?.map(_ => typeFactory('tvdb/Artwork'));
    series.characters?.map(_ => typeFactory('tvdb/Character'));
    series.contentRatings?.map(_ => typeFactory('tvdb/ContentRating'));
    series.episodes.map(_ => episodeFactory());
    series.lists?.map(_ => typeFactory('tvdb/List'));
    series.genres?.map(_ => typeFactory('tvdb/Genre'));
    series.companies?.map(_ => typeFactory('tvdb/Company'));
    series.remoteIds.map(_ => typeFactory('tvdb/RemoteID'));
    series.seasons.map(_ => typeFactory('tvdb/Season'));
    series.seasonTypes.map(_ => typeFactory('tvdb/SeasonType'));
    series.tags?.map(_ => typeFactory('tvdb/Tag'));
    series.trailers?.map(_ => typeFactory('tvdb/Trailer'));

    return series;
};