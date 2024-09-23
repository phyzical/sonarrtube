import { Alias } from '@sonarrTube/types/tvdb/Alias.js';
import { Tag } from '@sonarrTube/types/tvdb/Tag.js';

type Generic = {
    image: string
    name: string
    year: string
}

export type Character = {
    aliases: Alias[]
    episode: Generic
    episodeId: number
    id: number
    image: string
    isFeatured: boolean
    movieId: number
    movie: Generic
    name: string
    nameTranslations: string[]
    overviewTranslations: string[]
    peopleId: number
    personImgURL: string
    peopleType: string
    seriesId: number
    series: Generic
    sort: number
    tagOptions: Tag[]
    type: number
    url: string
    personName: string
}