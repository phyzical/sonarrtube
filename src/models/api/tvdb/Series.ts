import { Constants } from '@sonarrTube/types/config/Constants.js';
import { config } from '@sonarrTube/helpers/Config.js';
import { log } from '@sonarrTube/helpers/Log.js';
import { RemoteID } from '@sonarrTube/types/tvdb/RemoteID.js';
import { Season } from '@sonarrTube/types/tvdb/Season.js';
import { SeasonType } from '@sonarrTube/types/tvdb/SeasonType.js';
import { Series as SeriesType } from '@sonarrTube/types/tvdb/Series.js';
import { Episode } from '@sonarrTube/models/api/tvdb/Episode.js';
import { Alias } from '@sonarrTube/types/tvdb/Alias';
import { Artwork } from '@sonarrTube/types/tvdb/Artwork';
import { Character } from '@sonarrTube/types/tvdb/Character';
import { Company } from '@sonarrTube/types/tvdb/Company';
import { ContentRating } from '@sonarrTube/types/tvdb/ContentRating';
import { Genre } from '@sonarrTube/types/tvdb/Genre';
import { List } from '@sonarrTube/types/tvdb/List';
import { Tag } from '@sonarrTube/types/tvdb/Tag';
import { Trailer } from '@sonarrTube/types/tvdb/Trailer';
import { Translations } from '@sonarrTube/types/tvdb/Translations';

export class Series implements SeriesType {
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
        this.episodes = [];
    }
    abbreviation?: string | undefined;
    airsDays?: {
        friday: boolean; monday: boolean; saturday: boolean;
        sunday: boolean; thursday: boolean; tuesday: boolean; wednesday: boolean;
    } | undefined;
    airsTime?: string | undefined;
    aliases?: Alias[] | undefined;
    artworks?: Artwork[] | undefined;
    averageRuntime?: number | undefined;
    characters?: Character[] | undefined;
    contentRatings?: ContentRating[] | undefined;
    country?: string | undefined;
    defaultSeasonType: number;
    episodes: Episode[];
    firstAired?: string | undefined;
    lists?: List[] | undefined;
    genres?: Genre[] | undefined;
    id: number;
    image: string;
    isOrderRandomized?: true | undefined;
    lastAired?: string | undefined;
    lastUpdated?: string | undefined;
    name: string;
    nameTranslations?: string[] | undefined;
    companies?: Company[] | undefined;
    nextAired?: string | undefined;
    originalCountry?: string | undefined;
    originalLanguage?: string | undefined;
    originalNetwork?: Company | undefined;
    overview: string;
    latestNetwork?: Company | undefined;
    overviewTranslations?: string[] | undefined;
    remoteIds: RemoteID[];
    score?: number | undefined;
    seasons: Season[];
    seasonTypes: SeasonType[];
    slug: string;
    status?: { id: number; keepUpdated: true; name: string; recordType: string; } | undefined;
    tags?: Tag[] | undefined;
    trailers?: Trailer[] | undefined;
    translations?: Translations | undefined;
    year: string;


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