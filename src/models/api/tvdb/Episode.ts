import { log } from '../../../helpers/Log.js';
import { Constants } from '../../../types/config/Constants.js';
import { Season } from '../../../types/tvdb/Season.js';
import { Episode as EpisodeType } from './../../../types/tvdb/Episode.js';
import { Series } from './Series.js';

export class Episode {
    absoluteNumber?: number;
    id?: string;
    image: string;
    imageType?: number;
    productionCode: string;
    lastUpdated?: string;
    name: string;
    number?: number;
    overview: string;
    runtime: number;
    seasonNumber: number;
    seasons?: Season[];
    seriesId?: number;
    seasonName?: string;
    year?: string;
    series: Series;
    aired: string;
    constructor(payload: EpisodeType, series: Series) {
        this.absoluteNumber = payload.absoluteNumber;
        this.id = payload.id;
        this.image = payload.image;
        this.imageType = payload.imageType;
        this.productionCode = payload.productionCode;
        this.lastUpdated = payload.lastUpdated;
        this.name = payload.name;
        this.number = payload.number;
        this.overview = payload.overview;
        this.runtime = payload.runtime;
        this.seasonNumber = payload.seasonNumber;
        this.seasons = payload.seasons;
        this.seriesId = payload.seriesId;
        this.seasonName = payload.seasonName;
        this.year = payload.year;
        this.series = series;
        this.aired = payload.aired;
    }

    cacheKey = (): string => `/${Constants.CACHE_FOLDERS.TVDB}/${this.seriesId}/${this.id}.json`;

    editURL = (): string =>
        `${Constants.TVDB.HOST}/series/${encodeURIComponent(this.series.slug)}/episodes/${this.id}/0/edit`;

    overviewLog = (): void => {
        log(
            'Overview:' +
            [
                '',
                `Youtube url: ${this.youtubeURL()}`,
                `Tvdb url: ${this.editURL()}`,
                `Aired date: ${this.aired}`,
                `Title: ${this.name}`,
                `Season: ${this.seasonNumber}`,
            ].join('\n  ')
        );
    };

    youtubeURL = (): string => {
        if (!this.productionCode) {
            return '';
        }

        return `${Constants.YOUTUBE.HOST}/watch?v=${this.productionCode}`;
    };

}