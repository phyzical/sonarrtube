import { Series as SeriesType } from '@sonarrTube/types/sonarr/Series.js';
import { Season } from '@sonarrTube/types/sonarr/Season.js';
import { Episode } from '@sonarrTube/models/api/sonarr/Episode.js';
import { Constants } from '@sonarrTube/types/config/Constants.js';

export class Series {
    episodes: Episode[] = [];
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
        console.dir(payload);
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

    tvdbCacheKey = (): string => `/${Constants.CACHE_FOLDERS.TVDB}/${this.tvdbId}.json`;
}