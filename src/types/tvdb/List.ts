import { Alias } from './Alias.js';
import { RemoteID } from './RemoteID.js';
import { Tag } from './Tag.js';

export type List = {
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