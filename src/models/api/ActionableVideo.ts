import { log } from '../../helpers/Log.js';
import { Episode as SonarrEpisode } from './sonarr/Episode.js';
import { Episode as TvdbEpisode } from './tvdb/Episode.js';
import { Series as TvdbSeries } from './tvdb/Series.js';
import { Video } from './youtube/Video.js';
import { cachePath } from '../../helpers/Cache.js';
import { Series as SonarrSeries } from './sonarr/Series.js';

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

        return !this.tvdbEpisode.productionCode;
    }

    tvdbEditUrl(): string {
        if (!this.tvdbEpisode) {
            return '';
        }

        return this.tvdbEpisode.editURL();
    }

    tvdbInfoCache(): string {
        if (!this.tvdbEpisode) {
            return '';
        }

        return cachePath(this.tvdbEpisode.cacheKey());
    }

    season(): number {
        return this.tvdbEpisode?.seasonNumber || this.tvdbEpisodeFromContext.seasonNumber;
    }

    aired(): string {
        return this.tvdbEpisode?.aired || this.youtubeVideo.airedDate();
    }

    youtubeURL(): string {
        return this.tvdbEpisode?.youtubeURL() ||
            this.youtubeVideo?.url() ||
            this.tvdbEpisodeFromContext?.youtubeURL();
    }

    overviewLog(): void {
        log(
            'Overview:' +
            [
                '',
                `Youtube url: ${this.youtubeURL()}`,
                `Tvdb url: ${this.tvdbEditUrl()}`,
                `Tvdb cache: ${this.tvdbInfoCache()}`,
                `Aired date: ${this.aired()}`,
                `Title: ${this.name()}`,
                `Season: ${this.season()}`,
            ].join('\n  ')
        );
    }

    name(): string {
        return this.tvdbEpisode?.name || this.youtubeVideo?.title() || this.tvdbEpisodeFromContext?.name || '';
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

    generateSonarrEpisode(episodeNumber: string): void {
        this.sonarrEpisode = new SonarrEpisode({
            seasonNumber: this.season(),
            episodeNumber: parseInt(episodeNumber),
            hasFile: false,
        }, this.sonarrSeries);
    }
}