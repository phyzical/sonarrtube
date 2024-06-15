import { log } from '../../helpers/Log.js';
import { Episode as SonarrEpisode } from './sonarr/Episode.js';
import { Episode as TvdbEpisode } from './tvdb/Episode.js';
import { Series as TvdbSeries } from './tvdb/Series.js';
import { Series as SonarrSeries } from './sonarr/Series.js';
import { Video } from './youtube/Video.js';

type ActionableVideoType = {
    youtubeVideo: Video,
    sonarrEpisode: SonarrEpisode,
    tvdbEpisode: TvdbEpisode,
    tvdbSeries: TvdbSeries,
    sonarrSeries: SonarrSeries
}

export class ActionableVideo {
    youtubeVideo?: Video;
    sonarrEpisode?: SonarrEpisode;
    tvdbEpisode?: TvdbEpisode;
    tvdbEpisodeFromContext: TvdbEpisode;
    tvdbSeries: TvdbSeries;
    sonarrSeries: SonarrSeries;

    constructor({ youtubeVideo, sonarrEpisode, tvdbEpisode, tvdbSeries, sonarrSeries }: ActionableVideoType) {
        this.youtubeVideo = youtubeVideo;
        this.sonarrEpisode = sonarrEpisode;
        this.tvdbEpisode = tvdbEpisode;
        this.tvdbSeries = tvdbSeries;
        this.sonarrSeries = sonarrSeries;
        this.tvdbEpisodeFromContext = !this.tvdbEpisode ? this.tvdbContextFromYoutube() : null;
    }

    unDownloaded(): boolean {
        if (!this.sonarrEpisode || !this.youtubeVideo) {
            return false;
        }

        return !this.sonarrEpisode.hasFile;
    }

    missingFromTvdb(): boolean {
        if (this.tvdbEpisode) {
            return false;
        }

        return true;
    }

    missingYoutube(): boolean {
        if (this.youtubeVideo) {
            return false;
        }

        return true;
    }

    missingProductionCode(): boolean {
        if (!this.tvdbEpisode) {
            return false;
        }

        const res = !this.tvdbEpisode.productionCode;
        if (res) {
            log(
                [
                    '',
                    // eslint-disable-next-line max-len
                    `Warning! Could not find episode on youtube for ${this.tvdbEpisode.name} in season ${this.tvdbEpisode.seasonNumber}`,
                    'this means an invalid production code or the video is no longer in the context',
                    `${this.tvdbEditUrl()}`
                ].join('\n') + '\n'
            );
        }

        return res;
    }

    tvdbEditUrl(): string {
        // eslint-disable-next-line max-len
        return `https://www.thetvdb.com/series/${encodeURIComponent(this.tvdbEpisode.series.slug)}/episodes/${this.tvdbEpisode.id}/0/edit`;
    }

    tvdbContextFromYoutube(): TvdbEpisode {
        return new TvdbEpisode({
            image: this.youtubeVideo.thumbnail,
            productionCode: this.youtubeVideo.id,
            name: this.youtubeVideo.title(),
            overview: this.youtubeVideo.description(),
            runtime: this.youtubeVideo.duration,
            seasonNumber: this.youtubeVideo.season(),
            aired: this.youtubeVideo.airedDate(),
        }, this.tvdbSeries);
    }

    season(): number {
        return this.tvdbEpisode?.seasonNumber || this.tvdbEpisodeFromContext.seasonNumber;
    }

    aired(): string {
        return this.tvdbEpisode?.aired || this.youtubeVideo.airedDate();
    }

    youtubeURL(): string {
        const productionCode = this.tvdbEpisode?.productionCode ||
            this.youtubeVideo?.id ||
            this.tvdbEpisodeFromContext?.productionCode;

        return `https://youtube.com/watch?v=${productionCode}`;
    }
}