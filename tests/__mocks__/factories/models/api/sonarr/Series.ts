import { episodeFactory } from 'tests/__mocks__/factories/models/api/sonarr/Episode';
import { typeFactory } from 'tests/__mocks__/factories/Type';

import { Series as SeriesType } from '@sonarrTube/types/sonarr/Series';
import { Series } from '@sonarrTube/models/api/sonarr/Series';

export const seriesFactory = (): Series => {
    const series = new Series(
        typeFactory('sonarr/Series') as SeriesType
    );
    series.episodes.map(_ => episodeFactory());
    series.alternateTitles?.map(_ => typeFactory('sonarr/AlternateTitle'));
    series.images?.map(_ => typeFactory('sonarr/Image'));
    series.seasons.map(_ => typeFactory('sonarr/Season'));

    series.originalLanguage = typeFactory('sonarr/Language');
    series.ratings = typeFactory('sonarr/Rating');
    series.statistics = typeFactory('sonarr/Statistics');

    return series;
};