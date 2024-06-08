import { Alias } from './Alias.js';
import { Character } from './Character.js';
import { ContentRating } from './ContentRating.js';
import { Episode } from './Episode.js';
import { Season } from './Season.js';
import { Tag } from './Tag.js';
import { Trailer } from './Trailer.js';
import { Translations } from './Translations.js';
import { Company } from './Company.js';

type Genre = {
    id: number
    name: string
    slug: string
}

type Artwork = {
    episodeId: number
    height: number
    id: number
    image: string
    includesText: true
    language: string
    movieId: number
    networkId: number
    peopleId: number
    score: number
    seasonId: number
    seriesId: number
    seriesPeopleId: number
    status: {
        id: number
        name: string
    }
    tagOptions: Tag[]
    thumbnail: string
    thumbnailHeight: number
    thumbnailWidth: number
    type: number
    updatedAt: number
    width: number
}


type SeasonType = {
    alternateName: string
    id: number
    name: string
    type: string
}


type RemoteID = {
    id: string
    type: number
    sourceName: string
}

type List = {
    aliases: Alias[]
    id: number
    image: string
    imageIsFallback: true
    isOfficial: true
    name: string
    nameTranslations: string[]
    overview: string
    overviewTranslations: string[]
    remoteIds: RemoteID[]
    tags: Tag[]
    score: number
    url: string
}




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
    id: number
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