import { log } from '@sonarrTube/helpers/Log.js';
import { Constants } from '@sonarrTube/types/config/Constants.js';
import { Season } from '@sonarrTube/types/tvdb/Season.js';
import { Episode as EpisodeType } from '@sonarrTube/types/tvdb/Episode.js';
import { Character } from '@sonarrTube/types/tvdb/Character';
import { Company } from '@sonarrTube/types/tvdb/Company';
import { ContentRating } from '@sonarrTube/types/tvdb/ContentRating';
import { Tag } from '@sonarrTube/types/tvdb/Tag';
import { Trailer } from '@sonarrTube/types/tvdb/Trailer';
import { Translations } from '@sonarrTube/types/tvdb/Translations';
import { Series } from '@sonarrTube/types/tvdb/Series';

export class Episode implements EpisodeType {
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
    series: Series;
    absoluteNumber?: number | undefined;
    aired: string;
    airsAfterSeason?: number | undefined;
    airsBeforeEpisode?: number | undefined;
    airsBeforeSeason?: number | undefined;
    finaleType?: string | undefined;
    id?: number | undefined;
    image: string;
    imageType?: number | undefined;
    isMovie?: number | undefined;
    productionCode: string;
    lastUpdated?: string | undefined;
    linkedMovie?: number | undefined;
    name: string;
    nameTranslations?: string[] | undefined;
    number?: number | undefined;
    overview: string;
    overviewTranslations?: string[] | undefined;
    runtime: number;
    seasonNumber: number;
    seasons?: Season[] | undefined;
    seriesId?: number | undefined;
    seasonName?: string | undefined;
    year?: string | undefined;
    characters?: Character[] | undefined;
    companies?: Company[] | undefined;
    contentRatings?: ContentRating[] | undefined;
    networks?: Company[] | undefined;
    studios?: Company[] | undefined;
    tagOptions?: Tag[] | undefined;
    trailers?: Trailer[] | undefined;
    translations?: Translations | undefined;

    cacheKey = (): string => `/${Constants.CACHE_FOLDERS.TVDB}/${this.seriesId}/${this.id}.json`;

    editURL = (): string =>
        `${Constants.TVDB.HOST}/series/${encodeURIComponent(this.series.slug)}/episodes/${this.id}/0/edit`;

    overviewLog = (): boolean => {
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

        return true;
    };

    youtubeURL = (): string => {
        if (!this.productionCode) {
            return '';
        }

        return `${Constants.YOUTUBE.HOST}/watch?v=${this.productionCode}`;
    };

}