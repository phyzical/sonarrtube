import { randomUUID } from 'crypto';
import { existsSync, readFileSync, writeFileSync } from 'fs';

import { ActionableVideo as ActionableVideoType } from '@sonarrTube/types/ActionableVideo.js';
import { Episode as SonarrEpisode } from '@sonarrTube/models/api/sonarr/Episode.js';
import { Episode as TvdbEpisode } from '@sonarrTube/models/api/tvdb/Episode.js';
import { Series as TvdbSeries } from '@sonarrTube/models/api/tvdb/Series.js';
import { Video } from '@sonarrTube/models/api/youtube/Video.js';
import { cachePath, clearCache } from '@sonarrTube/helpers/Cache.js';
import { Channel } from '@sonarrTube/models/api/youtube/Channel.js';
import { Constants } from '@sonarrTube/types/config/Constants.js';
import { Series as SonarrSeries } from '@sonarrTube/models/api/sonarr/Series.js';

export class ActionableVideo {
    id: string;
    youtubeVideo?: Video;
    sonarrEpisode?: SonarrEpisode;
    tvdbEpisode?: TvdbEpisode;
    tvdbEpisodeFromContext?: TvdbEpisode;
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
        this.tvdbEpisodeFromContext = !this.tvdbEpisode ? this.tvdbContextFromYoutube() : undefined;
        this.id = randomUUID();
    }

    unDownloaded = (): boolean => {
        if (!this.sonarrEpisode || !this.youtubeVideo) {
            return false;
        }

        return !this.sonarrEpisode.hasFile;
    };

    missingFromTvdb = (): boolean => {
        if (this.tvdbEpisode) {
            return false;
        }

        return true;
    };

    missingYoutube = (): boolean => {
        if (this.youtubeVideo) {
            return false;
        }

        return true;
    };

    missingProductionCode = (): boolean => {
        if (!this.tvdbEpisode) {
            return false;
        }

        return !this.tvdbEpisode.productionCode;
    };

    tvdbEditUrl = (): string | undefined => {
        if (!this.tvdbEpisode) {
            return;
        }

        return this.tvdbEpisode.editURL();
    };

    tvdbInfoCache = (): string | undefined => {
        if (!this.tvdbEpisode) {
            return;
        }

        return cachePath(this.tvdbEpisode.cacheKey());
    };

    thumbnailCacheFile = (): string => {
        if (!this.tvdbEpisode) {
            throw new Error('Episode not found this shouldn\'t happen!');
        }

        return cachePath(`/${Constants.CACHE_FOLDERS.TVDB}/${this.tvdbEpisode.seriesId}/thumbnails.txt`);
    };

    thumbnailUploadAttemptCount = (): number => {
        const cachePath = this.thumbnailCacheFile();
        if (!existsSync(cachePath)) {
            return 0;
        }

        const episode = this.tvdbEpisode;

        if (!episode) {
            throw new Error('Episode not found this shouldn\'t happen!');
        }

        return readFileSync(cachePath).toString()
            .split('\n')
            .filter(x => parseInt(x) == episode.id).length;
    };

    addThumbnailUploadAttempt = (): void => {
        const episode = this.tvdbEpisode;

        if (!episode) {
            throw new Error('Episode not found this shouldn\'t happen!');
        }

        writeFileSync(this.thumbnailCacheFile(), `${episode.id}\n`, { flag: 'a' });
    };

    season = (): number | undefined => (this.tvdbEpisode || this.tvdbEpisodeFromContext)?.seasonNumber;

    aired = (): string | undefined => this.tvdbEpisode?.aired || this.youtubeVideo?.airedDate();

    youtubeURL = (): string | undefined => this.tvdbEpisode?.youtubeURL() ||
        this.youtubeVideo?.url() ||
        this.tvdbEpisodeFromContext?.youtubeURL();

    summary = (): string => [
        `Title: ${this.name()}`,
        `Aired date: ${this.aired()}`,
        `Season: ${this.season()}`,
        this.youtubeURL() ?
            `Youtube url: ${this.youtubeURL()}` :
            `Search url: ${this.youtubeSearchURL()}\n  Search url: ${this.youtubeChannelSearchURL()}`,
        this.tvdbEditUrl() ? `Tvdb url: ${this.tvdbEditUrl()}` : '',
        this.tvdbInfoCache() ? `Tvdb cache: ${this.tvdbInfoCache()}` : '',
    ].filter(Boolean).join('\n  ');

    youtubeSearchURL = (): string =>
        `${Constants.YOUTUBE.HOST}/results?search_query=${encodeURI(`${this.seriesName()} ${this.name()}`)}`;

    youtubeChannelSearchURL = (): string => `${this.youtubeContext.url}?query=${encodeURI(this.name())}`;

    seriesName = (): string => this.youtubeVideo?.channel || this.tvdbSeries?.name;

    name = (): string => this.tvdbEpisode?.name ||
        this.youtubeVideo?.cleanTitle() ||
        this.tvdbEpisodeFromContext?.name ||
        '';

    tvdbContextFromYoutube = (): TvdbEpisode | undefined => {
        if (!this.youtubeVideo) {
            return;
        }

        return new TvdbEpisode({
            image: this.youtubeVideo.thumbnail,
            productionCode: this.youtubeVideo.id,
            name: this.youtubeVideo.cleanTitle(),
            overview: this.youtubeVideo.cleanDescription(),
            runtime: this.youtubeVideo.duration,
            seasonNumber: this.youtubeVideo.season(),
            aired: this.youtubeVideo.airedDate(),
        }, this.tvdbSeries);
    };

    clearCache = (): void => {
        const episode = this.tvdbEpisode;

        if (!episode) {
            throw new Error('Episode not found this shouldn\'t happen!');
        }
        clearCache(episode.cacheKey());
    };

    generateSonarrEpisode = (episodeNumber: string): SonarrEpisode => {
        const seasonNumber = this.season();
        if (!seasonNumber) {
            throw new Error('season not found this shouldn\'t happen!');
        }

        return this.sonarrEpisode = new SonarrEpisode({
            seasonNumber,
            episodeNumber: parseInt(episodeNumber),
            hasFile: false,
        }, this.sonarrSeries);
    };
}