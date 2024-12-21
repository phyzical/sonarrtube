import { Series as SonarrSeries } from '@sonarrTube/types/sonarr/Series.js';
import { Series as TvdbSeries } from '@sonarrTube/types/tvdb/Series.js';
import { Episode as SonarrEpisode } from '@sonarrTube/types/sonarr/Episode.js';
import { Episode as TvdbEpisode } from '@sonarrTube/types/tvdb/Episode.js';
import { Video } from '@sonarrTube/types/youtube/Video';
import { Channel } from '@sonarrTube/types/youtube/Channel';

export type ActionableVideo = {
    youtubeVideo?: Video,
    sonarrEpisode?: SonarrEpisode,
    tvdbEpisode?: TvdbEpisode,
    tvdbSeries: TvdbSeries,
    sonarrSeries: SonarrSeries,
    youtubeContext: Channel;
    tvdbEpisodeFromContext?: TvdbEpisode;
    id?: string
}