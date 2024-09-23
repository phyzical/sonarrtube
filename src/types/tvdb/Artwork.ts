import { Tag } from '@sonarrTube/types/tvdb/Tag.js';


export type Artwork = {
    episodeId: number
    height: number
    id: number
    image: string
    includesText: boolean
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