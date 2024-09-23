import { Series as TvdbSeries } from '@sonarrTube/models/api/tvdb/Series.js';
import { Series as SonarrSeries } from '@sonarrTube/models/api/sonarr/Series.js';
import { Channel as YoutubeContext } from '@sonarrTube/models/api/youtube/Channel.js';
import { ActionableVideo } from '@sonarrTube/models/api/ActionableVideo.js';

export type ActionableSeries = {
    videos?: ActionableVideo[],
    sonarrSeries: SonarrSeries,
    tvdbSeries: TvdbSeries,
    youtubeContext: YoutubeContext
}
