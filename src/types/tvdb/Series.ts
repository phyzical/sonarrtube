import { Alias } from '@sonarrTube/types/tvdb/Alias.js';
import { Character } from '@sonarrTube/types/tvdb/Character.js';
import { ContentRating } from '@sonarrTube/types/tvdb/ContentRating.js';
import { Episode } from '@sonarrTube/types/tvdb/Episode.js';
import { Season } from '@sonarrTube/types/tvdb/Season.js';
import { Tag } from '@sonarrTube/types/tvdb/Tag.js';
import { Trailer } from '@sonarrTube/types/tvdb/Trailer.js';
import { Translations } from '@sonarrTube/types/tvdb/Translations.js';
import { Company } from '@sonarrTube/types/tvdb/Company.js';
import { Artwork } from '@sonarrTube/types/tvdb/Artwork.js';
import { List } from '@sonarrTube/types/tvdb/List.js';
import { Genre } from '@sonarrTube/types/tvdb/Genre.js';
import { RemoteID } from '@sonarrTube/types/tvdb/RemoteID.js';
import { SeasonType } from '@sonarrTube/types/tvdb/SeasonType.js';

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