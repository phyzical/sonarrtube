import { Series as SeriesType } from '../../../types/sonarr/Series.js';
import { Season } from '../../../types/sonarr/Season.js';
import { Episode } from './Episode.js';

export class Series {
    episodes: Episode[];
    title: string;
    status: string;
    overview: string;
    network: string;
    seasons: Season[];
    year: number;
    path: string;
    seasonFolder: boolean;
    monitored: boolean;
    tvdbId: number;
    titleSlug: string;
    rootFolderPath: string;
    id: number;
    constructor(payload: SeriesType) {
        this.title = payload.title;
        this.status = payload.status;
        this.overview = payload.overview;
        this.network = payload.network;
        this.seasons = payload.seasons;
        this.year = payload.year;
        this.path = payload.path.replace(payload.rootFolderPath, '');
        this.seasonFolder = payload.seasonFolder;
        this.monitored = payload.monitored;
        this.tvdbId = payload.tvdbId;
        this.titleSlug = payload.titleSlug;
        this.rootFolderPath = payload.rootFolderPath;
        this.id = payload.id;
    }
}