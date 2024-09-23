import { Episode as EpisodeType } from '@sonarrTube/types/sonarr/Episode.js';
import { Constants } from '@sonarrTube/types/config/Constants.js';
import { Series as SeriesType } from '@sonarrTube/types/sonarr/Series';

export class Episode implements EpisodeType {
    constructor(payload: EpisodeType, series: SeriesType) {
        this.seriesId = payload.seriesId;
        this.tvdbId = payload.tvdbId;
        this.seasonNumber = payload.seasonNumber;
        this.episodeNumber = payload.episodeNumber;
        this.title = payload.title;
        this.airDate = payload.airDate;
        this.airDateUtc = payload.airDateUtc;
        this.runtime = payload.runtime;
        this.overview = payload.overview;
        this.hasFile = payload.hasFile;
        this.monitored = payload.monitored;
        this.id = payload.id;
        this.series = series;
    }
    series: SeriesType;
    seriesId?: number | undefined;
    tvdbId?: number | undefined;
    episodeFileId?: number | undefined;
    seasonNumber: number;
    episodeNumber: number;
    title?: string | undefined;
    airDate?: string | undefined;
    airDateUtc?: string | undefined;
    runtime?: number | undefined;
    overview?: string | undefined;
    hasFile: boolean;
    monitored?: boolean | undefined;
    unverifiedSceneNumbering?: boolean | undefined;
    grabbed?: boolean | undefined;
    id?: number | undefined;

    tvdbCacheKey = (): string => `/${Constants.CACHE_FOLDERS.TVDB}/${this.series.tvdbId}/${this.tvdbId}.json`;
}