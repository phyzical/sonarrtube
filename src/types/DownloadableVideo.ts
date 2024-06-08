import { Episode as TvdbEpisode } from './tvdb/Episode.js';
import { Episode as SonarrEpisode } from './sonarr/Episode.js';
import { Video } from './youtube/Video.js';

export type DownloadableVideo = {
    youtubeVideo: Video
    sonarrEpisode: SonarrEpisode
    tvdbEpisode: TvdbEpisode
}