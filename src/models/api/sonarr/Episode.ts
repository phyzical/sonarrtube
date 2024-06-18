import { Episode as EpisodeType } from './../../../types/sonarr/Episode.js';
import { Series } from './Series.js';

export class Episode {
    seriesId?: number;
    tvdbId?: string;
    seasonNumber: number;
    episodeNumber: number;
    title?: string;
    airDate?: string;
    airDateUtc?: string;
    runtime?: number;
    overview?: string;
    hasFile: boolean;
    monitored?: boolean;
    id?: number;
    series: Series;
    constructor(payload: EpisodeType, series: Series) {
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

    tvdbCacheKey(): string {
        return `/tvdb/${this.series.tvdbId}/${this.tvdbId}.json`;
    }
}