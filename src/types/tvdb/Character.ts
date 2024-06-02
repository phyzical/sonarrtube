import { Alias } from './Alias.js';
import { Tag } from './Tag.js';

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
    isFeatured: true
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