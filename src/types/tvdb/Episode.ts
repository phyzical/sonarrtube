import { Character } from './Character.js';
import { ContentRating } from './ContentRating.js';
import { Season } from './Season.js';
import { Tag } from './Tag.js';
import { Trailer } from './Trailer.js';
import { Translations } from './Translations.js';
import { Company } from './Company.js';

export type Episode = {
    absoluteNumber?: number
    aired: string
    airsAfterSeason?: number
    airsBeforeEpisode?: number
    airsBeforeSeason?: number
    finaleType?: string
    id?: string
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
}
