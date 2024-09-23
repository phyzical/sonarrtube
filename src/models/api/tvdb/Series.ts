import { Constants } from '@sonarrTube/types/config/Constants.js';
import { config } from '@sonarrTube/helpers/Config.js';
import { log } from '@sonarrTube/helpers/Log.js';
import { RemoteID } from '@sonarrTube/types/tvdb/RemoteID.js';
import { Season } from '@sonarrTube/types/tvdb/Season.js';
import { SeasonType } from '@sonarrTube/types/tvdb/SeasonType.js';
import { Series as SeriesType } from '@sonarrTube/types/tvdb/Series.js';
import { Episode } from '@sonarrTube/models/api/tvdb/Episode.js';

export class Series {
    defaultSeasonType: number;
    episodes: Episode[] = [];
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

    filterEpisodes = (): Episode[] => this
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