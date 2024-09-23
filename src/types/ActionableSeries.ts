import { Series as TvdbSeries } from '@sonarrTube/models/api/tvdb/Series.js';
import { Series as SonarrSeries } from '@sonarrTube/models/api/sonarr/Series.js';
import { Channel } from '@sonarrTube/models/api/youtube/Channel';
import { ActionableVideo } from '@sonarrTube/models/api/ActionableVideo';

export type ActionableSeries = {
    videos?: ActionableVideo[],
    sonarrSeries: SonarrSeries,
    tvdbSeries: TvdbSeries,
    youtubeContext: Channel
}
