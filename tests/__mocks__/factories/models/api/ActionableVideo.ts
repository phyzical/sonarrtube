import { typeFactory } from 'tests/__mocks__/factories/Type';

import { ActionableVideo } from '@sonarrTube/models/api/ActionableVideo.js';
import { ActionableVideo as ActionableVideoType } from '@sonarrTube/types/ActionableVideo.js';

export const actionableVideoFactory = (): ActionableVideo => {
    const video = new ActionableVideo(
        typeFactory('ActionableVideo') as ActionableVideoType
    );

    video.youtubeVideo = typeFactory('youtube/Video');
    video.sonarrEpisode = typeFactory('sonarr/Episode');
    video.tvdbEpisode = typeFactory('tvdb/Episode');
    video.tvdbSeries = typeFactory('tvdb/Series');
    video.sonarrSeries = typeFactory('sonarr/Series');
    video.youtubeContext = typeFactory('youtube/Channel');
    video.tvdbEpisodeFromContext = typeFactory('tvdb/Episode');

    return video;
};