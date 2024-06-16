import { Alias } from './Alias.js';
import { Character } from './Character.js';
import { ContentRating } from './ContentRating.js';
import { Episode } from './Episode.js';
import { Season } from './Season.js';
import { Tag } from './Tag.js';
import { Trailer } from './Trailer.js';
import { Translations } from './Translations.js';
import { Company } from './Company.js';
import { Artwork } from './Artwork.js';
import { List } from './List.js';
import { Genre } from './Genre.js';
import { RemoteID } from './RemoteID.js';
import { SeasonType } from './SeasonType.js';

export type Series = {
    abbreviation: string
    airsDays: {
        friday: boolean
        monday: boolean
        saturday: boolean
        sunday: boolean
        thursday: boolean
        tuesday: boolean
        wednesday: boolean
    }
    airsTime: string
    aliases: Alias[]
    artworks: Artwork[]
    averageRuntime: number
    characters: Character[]
    contentRatings: ContentRating[]
    country: string
    defaultSeasonType: number
    episodes: Episode[]
    firstAired: string
    lists: List[]
    genres: Genre[]
    id: string
    image: string
    isOrderRandomized: true
    lastAired: string
    lastUpdated: string
    name: string
    nameTranslations: string[]
    companies: Company[]
    nextAired: string
    originalCountry: string
    originalLanguage: string
    originalNetwork: Company
    overview: string
    latestNetwork: Company
    overviewTranslations: string[]
    remoteIds: RemoteID[]
    score: number
    seasons: Season[]
    seasonTypes: SeasonType[]
    slug: string
    status: {
        id: number
        keepUpdated: true
        name: string
        recordType: string
    }
    tags: Tag[]
    trailers: Trailer[]
    translations: Translations
    year: string
}