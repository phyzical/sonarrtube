import { Series as SonarrSeries } from '@sonarrTube/models/api/sonarr/Series.js';
import { Series as TvdbSeries } from '@sonarrTube/models/api/tvdb/Series.js';
import { Episode as SonarrEpisode } from '@sonarrTube/models/api/sonarr/Episode.js';
import { Episode as TvdbEpisode } from '@sonarrTube/models/api/tvdb/Episode.js';
import { Video } from '@sonarrTube/models/api/youtube/Video';
import { Channel } from '@sonarrTube/models/api/youtube/Channel';

export type ActionableVideo = {
    youtubeVideo?: Video,
    sonarrEpisode?: SonarrEpisode,
    tvdbEpisode: TvdbEpisode,
    tvdbSeries: TvdbSeries,
    sonarrSeries: SonarrSeries,
    youtubeContext: Channel;
    tvdbEpisodeFromContext?: TvdbEpisode;
    id?: string
}