import { ActionableVideo } from '@sonarrTube/models/api/ActionableVideo.js';
import { ActionableVideo as ActionableVideoType } from '@sonarrTube/types/ActionableVideo.js';
import { seriesFactory as TvdbSeriesFactory } from '@sonarrTube/factories/models/api/tvdb/Series';
import { seriesFactory as SonarrSeriesFactory } from '@sonarrTube/factories/models/api/sonarr/Series';
import { channelFactory } from '@sonarrTube/factories/models/api/youtube/Channel';

export const actionableVideoFactory = (videoIndex: number = 0, params: object = {}): ActionableVideo => {
    const video = new ActionableVideo(
        {
            tvdbSeries: TvdbSeriesFactory(),
            sonarrSeries: SonarrSeriesFactory(),
            youtubeContext: channelFactory(),
            ...params
        } as ActionableVideoType,
    );

    video.tvdbEpisode ||= video.tvdbSeries.episodes[videoIndex];
    video.youtubeVideo ||= video.youtubeContext.videos[videoIndex];
    video.sonarrEpisode ||= video.sonarrSeries.episodes[videoIndex];

    return video;
};