import { channelFactory } from 'tests/__mocks__/factories/models/api/youtube/Channel';
import { seriesFactory as sonarrSeriesFactory } from 'tests/__mocks__/factories/models/api/sonarr/Series';
import { seriesFactory as tvdbSeriesFactory } from 'tests/__mocks__/factories/models/api/tvdb/Series';
import { typeFactory } from 'tests/__mocks__/factories/Type';

import { ActionableSeries } from '@sonarrTube/models/api/ActionableSeries.js';
import { ActionableSeries as ActionableSeriesType } from '@sonarrTube/types/ActionableSeries.js';
import { generateRandomArray } from '@sonarrTube/factories/RandomArray';

export const actionableSeriesFactory = (params: object = {}): ActionableSeries => {
    const sonarrSeries = sonarrSeriesFactory();
    const tvdbSeries = tvdbSeriesFactory();
    const youtubeContext = channelFactory();

    const series = new ActionableSeries(
        {
            ...typeFactory('ActionableSeries'),
            ...params,
            sonarrSeries,
            tvdbSeries,
            youtubeContext,
        } as ActionableSeriesType
    );

    series.videos = generateRandomArray().map(_ => typeFactory('ActionableVideo'));

    return series;
};