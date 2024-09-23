import { Series } from '@sonarrTube/types/tvdb/Series.js';
import { Character } from '@sonarrTube/types/tvdb/Character.js';
import { ContentRating } from '@sonarrTube/types/tvdb/ContentRating.js';
import { Season } from '@sonarrTube/types/tvdb/Season.js';
import { Tag } from '@sonarrTube/types/tvdb/Tag.js';
import { Trailer } from '@sonarrTube/types/tvdb/Trailer.js';
import { Translations } from '@sonarrTube/types/tvdb/Translations.js';
import { Company } from '@sonarrTube/types/tvdb/Company.js';

export interface Episode {
    absoluteNumber?: number
    aired: string
    airsAfterSeason?: number
    airsBeforeEpisode?: number
    airsBeforeSeason?: number
    finaleType?: string
    id?: number
    image: string
    imageType?: number
    isMovie?: number
    productionCode: string
    lastUpdated?: string
    linkedMovie?: number
    name: string
    nameTranslations?: string[]
    number?: number
    overview: string
    overviewTranslations?: string[]
    runtime: number
    seasonNumber: number
    seasons?: Season[]
    seriesId?: number
    seasonName?: string
    year?: string
    characters?: Character[]
    companies?: Company[]
    contentRatings?: ContentRating[]
    networks?: Company[]
    studios?: Company[]
    tagOptions?: Tag[]
    trailers?: Trailer[]
    translations?: Translations
    series: Series

    cacheKey: () => string
    editURL: () => string
    overviewLog: () => boolean
    youtubeURL: () => string
}
