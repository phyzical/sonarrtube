
import { Episode as SonarrEpisode } from '@sonarrTube/models/api/sonarr/Episode.js';
import { Episode as TvdbEpisode } from '@sonarrTube/models/api/tvdb/Episode.js';
import { Series as TvdbSeries } from '@sonarrTube/models/api/tvdb/Series.js';
import { Video } from '@sonarrTube/models/api/youtube/Video.js';
import { Channel } from '@sonarrTube/models/api/youtube/Channel.js';
import { Series as SonarrSeries } from '@sonarrTube/models/api/sonarr/Series.js';

export type ActionableVideo = {
    youtubeVideo?: Video,
    sonarrEpisode?: SonarrEpisode,
    tvdbEpisode: TvdbEpisode,
    tvdbSeries: TvdbSeries,
    sonarrSeries: SonarrSeries,
    youtubeContext: Channel;
}