import { ActionableVideo } from '@sonarrTube/models/api/ActionableVideo.js';
import { ActionableVideo as ActionableVideoType } from '@sonarrTube/types/ActionableVideo.js';
import { episodeFactory as TvdbEpisodeFactory } from '@sonarrTube/factories/models/api/tvdb/Episode';
import { seriesFactory as TvdbSeriesFactory } from '@sonarrTube/factories/models/api/tvdb/Series';
import { seriesFactory as SonarrSeriesFactory } from '@sonarrTube/factories/models/api/sonarr/Series';
import { channelFactory } from '@sonarrTube/factories/models/api/youtube/Channel';

export const actionableVideoFactory = (params: object = {}): ActionableVideo => {
    const tvdbSeries = TvdbSeriesFactory();
    const video = new ActionableVideo(
        {
            tvdbEpisode: TvdbEpisodeFactory({}, tvdbSeries),
            tvdbSeries,
            sonarrSeries: SonarrSeriesFactory(),
            youtubeContext: channelFactory(),
            ...params
        } as ActionableVideoType,
    );

    return video;
};