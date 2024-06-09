import { RemoteID } from '../../../types/tvdb/RemoteID.js';
import { Season } from '../../../types/tvdb/Season.js';
import { SeasonType } from '../../../types/tvdb/SeasonType.js';
import { Series as SeriesType } from './../../../types/tvdb/Series.js';
import { Episode } from './Episode.js';


export class Series {
    defaultSeasonType: number;
    episodes: Episode[];
    id: number;
    image: string;
    name: string;
    overview: string;
    remoteIds: RemoteID[];
    seasons: Season[];
    seasonTypes: SeasonType[];
    slug: string;
    year: string;
    constructor(payload: SeriesType) {
        this.defaultSeasonType = payload.defaultSeasonType;
        this.id = payload.id;
        this.image = payload.image;
        this.name = payload.name;
        this.overview = payload.overview;
        this.remoteIds = payload.remoteIds;
        this.seasons = payload.seasons;
        this.seasonTypes = payload.seasonTypes;
        this.slug = payload.slug;
        this.year = payload.year;
    }
}