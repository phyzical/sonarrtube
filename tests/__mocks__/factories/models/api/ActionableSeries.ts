import { channelFactory } from 'tests/__mocks__/factories/models/api/youtube/Channel';
import { seriesFactory as sonarrSeriesFactory } from 'tests/__mocks__/factories/models/api/sonarr/Series';
import { seriesFactory as tvdbSeriesFactory } from 'tests/__mocks__/factories/models/api/tvdb/Series';
import { typeFactory } from 'tests/__mocks__/factories/Type';

import { ActionableSeries } from '@sonarrTube/models/api/ActionableSeries.js';
import { ActionableSeries as ActionableSeriesType } from '@sonarrTube/types/ActionableSeries.js';

export const actionableSeriesFactory = (): ActionableSeries => {
    const sonarrSeries = sonarrSeriesFactory();
    const tvdbSeries = tvdbSeriesFactory();
    const youtubeContext = channelFactory();

    const series = new ActionableSeries(
        {
            ...typeFactory('ActionableSeries'),
            sonarrSeries,
            tvdbSeries,
            youtubeContext,
        } as ActionableSeriesType
    );

    series.videos.map(_ => typeFactory('ActionableVideo'));

    return series;
};