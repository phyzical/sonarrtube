import { channelFactory } from '@sonarrTube/factories/models/api/youtube/Channel';
import { videoFactory } from '@sonarrTube/factories/models/api/youtube/Video';
import { seriesFactory as sonarrSeriesFactory } from '@sonarrTube/factories/models/api/sonarr/Series';
import { seriesFactory as tvdbSeriesFactory } from '@sonarrTube/factories/models/api/tvdb/Series';
import { ActionableSeries } from '@sonarrTube/models/api/ActionableSeries.js';
import { ActionableSeries as ActionableSeriesType } from '@sonarrTube/types/ActionableSeries.js';
import { generateRandomArray } from '@sonarrTube/factories/RandomArray';
import { ActionableVideo } from '@sonarrTube/models/api/ActionableVideo';

export const actionableSeriesFactory = (params: object = {}): ActionableSeries => {
    const series = new ActionableSeries(
        {
            sonarrSeries: sonarrSeriesFactory(),
            tvdbSeries: tvdbSeriesFactory(),
            youtubeContext: channelFactory(),
            ...params,
        } as ActionableSeriesType
    );

    series.videos = generateRandomArray(() => videoFactory()) as ActionableVideo[];

    return series;
};