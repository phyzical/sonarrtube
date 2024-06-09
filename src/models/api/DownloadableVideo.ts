import { Episode as SonarrEpisode } from './sonarr/Episode.js';
import { Episode as TvdbEpisode } from './tvdb/Episode.js';
import { Video } from './youtube/Video.js';

export class DownloadableVideo {
    youtubeVideo: Video;
    sonarrEpisode: SonarrEpisode;
    tvdbEpisode: TvdbEpisode;
    constructor(youtubeVideo: Video, sonarrEpisode: SonarrEpisode, tvdbEpisode: TvdbEpisode) {
        this.youtubeVideo = youtubeVideo;
        this.sonarrEpisode = sonarrEpisode;
        this.tvdbEpisode = tvdbEpisode;
    }
}