import { Alias } from '@sonarrTube/types/tvdb/Alias.js';
import { RemoteID } from '@sonarrTube/types/tvdb/RemoteID.js';
import { Tag } from '@sonarrTube/types/tvdb/Tag.js';

export type List = {
    aliases: Alias[]
    id: number
    image: string
    imageIsFallback: boolean
    isOfficial: boolean
    name: string
    nameTranslations: string[]
    overview: string
    overviewTranslations: string[]
    remoteIds: RemoteID[]
    tags: Tag[]
    score: number
    url: string
}