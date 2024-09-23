import { Series as SeriesType } from '@sonarrTube/types/sonarr/Series.js';
import { Season } from '@sonarrTube/types/sonarr/Season.js';
import { Episode } from '@sonarrTube/models/api/sonarr/Episode.js';
import { Constants } from '@sonarrTube/types/config/Constants.js';
import { AlternateTitle } from '@sonarrTube/types/sonarr/AlternateTitle';
import { Image } from '@sonarrTube/types/sonarr/Image';
import { Language } from '@sonarrTube/types/sonarr/Language';
import { Rating } from '@sonarrTube/types/sonarr/Rating';
import { Statistics } from '@sonarrTube/types/sonarr/Statistics';

export class Series implements SeriesType {
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
        this.episodes = [];
    }
    episodes: Episode[];
    title: string;
    alternateTitles?: AlternateTitle[] | undefined;
    sortTitle?: string | undefined;
    status: string;
    ended?: boolean | undefined;
    overview: string;
    previousAiring?: string | undefined;
    network: string;
    airTime?: string | undefined;
    images?: Image[] | undefined;
    originalLanguage?: Language | undefined;
    seasons: Season[];
    year: number;
    path: string;
    qualityProfileId?: number | undefined;
    seasonFolder: boolean;
    monitored: boolean;
    monitorNewItems?: string | undefined;
    useSceneNumbering?: boolean | undefined;
    runtime?: number | undefined;
    tvdbId: number;
    tvRageId?: number | undefined;
    tvMazeId?: number | undefined;
    firstAired?: string | undefined;
    lastAired?: string | undefined;
    seriesType?: string | undefined;
    cleanTitle?: string | undefined;
    imdbId?: number | undefined;
    titleSlug: string;
    rootFolderPath: string;
    certification?: string | undefined;
    genres?: string[] | undefined;
    tags?: string[] | undefined;
    added?: string | undefined;
    ratings?: Rating | undefined;
    statistics?: Statistics | undefined;
    languageProfileId?: number | undefined;
    id: number;


    tvdbCacheKey = (): string => `/${Constants.CACHE_FOLDERS.TVDB}/${this.tvdbId}.json`;
}