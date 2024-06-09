import { Season } from '../../../types/tvdb/Season.js';
import { Episode as EpisodeType } from './../../../types/tvdb/Episode.js';
import { Series } from './Series.js';

export class Episode {
    absoluteNumber: number;
    id: number;
    image: string;
    imageType: number;
    productionCode: string;
    lastUpdated: string;
    name: string;
    number: number;
    overview: string;
    runtime: number;
    seasonNumber: number;
    seasons: Season[];
    seriesId: number;
    seasonName: string;
    year: string;
    series: Series;
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
    }
}