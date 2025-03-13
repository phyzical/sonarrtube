import { channelFactory } from '@sonarrTube/factories/models/api/youtube/Channel';
import { seriesFactory as sonarrSeriesFactory } from '@sonarrTube/factories/models/api/sonarr/Series';
import { seriesFactory as tvdbSeriesFactory } from '@sonarrTube/factories/models/api/tvdb/Series';
import { ActionableSeries } from '@sonarrTube/models/api/ActionableSeries.js';
import { ActionableSeries as ActionableSeriesType } from '@sonarrTube/types/ActionableSeries';
import { generateRandomArray } from '@sonarrTube/factories/RandomArray';
import { ActionableVideo } from '@sonarrTube/models/api/ActionableVideo';
import { actionableVideoFactory } from '@sonarrTube/factories/models/api/ActionableVideo';
import { ActionableVideo as ActionableVideoType } from '@sonarrTube/types/ActionableVideo';

export const actionableSeriesFactory = (params: object = {}): ActionableSeries => {
    const videoCount = Math.floor(Math.random() * 100);
    const sonarrSeries = sonarrSeriesFactory({}, videoCount);
    const tvdbSeries = tvdbSeriesFactory({}, videoCount);
    const youtubeContext = channelFactory({}, videoCount);
    const series = new ActionableSeries(
        {
            sonarrSeries,
            tvdbSeries,
            youtubeContext,
            ...params,
        } as ActionableSeriesType
    );

    series.videos = generateRandomArray((i: number) => actionableVideoFactory(i, {
        sonarrSeries, tvdbSeries, youtubeContext
    } as ActionableVideoType)) as ActionableVideo[];

    return series;
};