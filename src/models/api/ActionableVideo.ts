import { log } from '../../helpers/Log.js';
import { Episode as SonarrEpisode } from './sonarr/Episode.js';
import { Episode as TvdbEpisode } from './tvdb/Episode.js';
import { Series as TvdbSeries } from './tvdb/Series.js';
import { Video } from './youtube/Video.js';
import { cachePath, clearCache } from '../../helpers/Cache.js';
import { Channel } from './youtube/Channel.js';
import { randomUUID } from 'crypto';
import { existsSync, readFileSync, writeFileSync } from 'fs';
import { Constants } from '../../types/config/Constants.js';
import { Series as SonarrSeries } from './sonarr/Series.js';

type ActionableVideoType = {
    youtubeVideo: Video,
    sonarrEpisode: SonarrEpisode,
    tvdbEpisode: TvdbEpisode,
    tvdbSeries: TvdbSeries,
    sonarrSeries: SonarrSeries,
    youtubeContext: Channel;
}

export class ActionableVideo {
    id: string;
    youtubeVideo?: Video;
    sonarrEpisode?: SonarrEpisode;
    tvdbEpisode?: TvdbEpisode;
    tvdbEpisodeFromContext: TvdbEpisode;
    tvdbSeries: TvdbSeries;
    sonarrSeries: SonarrSeries;
    youtubeContext: Channel;

    constructor(
        {
            youtubeVideo, sonarrEpisode, tvdbEpisode,
            tvdbSeries, sonarrSeries, youtubeContext
        }: ActionableVideoType) {
        this.youtubeVideo = youtubeVideo;
        this.sonarrEpisode = sonarrEpisode;
        this.tvdbEpisode = tvdbEpisode;
        this.tvdbSeries = tvdbSeries;
        this.sonarrSeries = sonarrSeries;
        this.youtubeContext = youtubeContext;
        this.tvdbEpisodeFromContext = !this.tvdbEpisode ? this.tvdbContextFromYoutube() : null;
        this.id = randomUUID();
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

    thumbnailCacheFile(): string {
        return cachePath(`/${Constants.CACHE_FOLDERS.TVDB}/${this.tvdbEpisode.seriesId}/thumbnails.txt`);
    }

    thumbnailUploadAttemptCount(): number {
        if (!existsSync(this.thumbnailCacheFile())) {
            return 0;
        }

        return readFileSync(this.thumbnailCacheFile()).toString()
            .split('\n')
            .filter(x => x == this.tvdbEpisode.id).length;
    }

    addThumbnailUploadAttempt(): void {
        writeFileSync(this.thumbnailCacheFile(), `${this.tvdbEpisode.id}\n`, { flag: 'a' });
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
            'Overview:\n  ' +
            [
                `Title: ${this.name()}`,
                `Aired date: ${this.aired()}`,
                `Season: ${this.season()}`,
                this.youtubeURL() ?
                    `Youtube url: ${this.youtubeURL()}` :
                    `Search url: ${this.youtubeSearchURL()}\n  Search url: ${this.youtubeChannelSearchURL()}`,
                this.tvdbEditUrl() ? `Tvdb url: ${this.tvdbEditUrl()}` : '',
                this.tvdbInfoCache() ? `Tvdb cache: ${this.tvdbInfoCache()}` : '',
            ].filter(Boolean).join('\n  ')
        );
    }

    youtubeSearchURL(): string {
        return `${Constants.YOUTUBE.HOST}/results?search_query=${encodeURI(`${this.seriesName()} ${this.name()}`)}`;
    }

    youtubeChannelSearchURL(): string {
        return `${this.youtubeContext.url}?query=${encodeURI(this.name())}`;
    }

    seriesName(): string {
        return this.youtubeVideo?.channel || this.tvdbSeries?.name;
    }

    name(): string {
        return this.tvdbEpisode?.name || this.youtubeVideo?.title() || this.tvdbEpisodeFromContext?.name || '';
    }

    tvdbContextFromYoutube(): TvdbEpisode {
        if (!this.youtubeVideo) {
            return null;
        }

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

    clearCache(): void {
        clearCache(this.tvdbEpisode.cacheKey());
    }

    generateSonarrEpisode(episodeNumber: string): void {
        this.sonarrEpisode = new SonarrEpisode({
            seasonNumber: this.season(),
            episodeNumber: parseInt(episodeNumber),
            hasFile: false,
        }, this.sonarrSeries);
    }
}