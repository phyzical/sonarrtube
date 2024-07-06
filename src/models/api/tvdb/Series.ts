import { Constants } from './../../../types/config/Constants.js';
import { config } from '../../../helpers/Config.js';
import { log } from '../../../helpers/Log.js';
import { RemoteID } from '../../../types/tvdb/RemoteID.js';
import { Season } from '../../../types/tvdb/Season.js';
import { SeasonType } from '../../../types/tvdb/SeasonType.js';
import { Series as SeriesType } from './../../../types/tvdb/Series.js';
import { Episode } from './Episode.js';

export class Series {
    defaultSeasonType: number;
    episodes: Episode[] = [];
    id: string;
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

    filterEpisodes(): Episode[] {
        return this
            .episodes
            .filter(video => (!config()
                .tvdb
                .skippedEpisodeIds
                .find(id => {
                    const found = id && id == video.id;
                    if (found) {
                        log('Skipping');
                        video.overviewLog();
                    }

                    return found;
                }) && video.productionCode != Constants.YOUTUBE.VIDEO_REMOVED_FLAG)
            );
    }
}