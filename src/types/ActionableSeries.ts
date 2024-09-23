import { Series as TvdbSeries } from '@sonarrTube/types/tvdb/Series.js';
import { Series as SonarrSeries } from '@sonarrTube/types/sonarr/Series.js';
import { Channel } from '@sonarrTube/types/youtube/Channel';
import { ActionableVideo } from '@sonarrTube/types/ActionableVideo';

export type ActionableSeries = {
    videos?: ActionableVideo[],
    sonarrSeries: SonarrSeries,
    tvdbSeries: TvdbSeries,
    youtubeContext: Channel
}
