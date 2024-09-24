import { Companies } from '@sonarrTube/types/tvdb/Companies.js';
import { Type } from '@sonarrTube/types/tvdb/Type.js';

export type Season = {
    id: number
    image: string
    imageType: number
    lastUpdated: string
    name: string
    nameTranslations: string[]
    number: number
    overviewTranslations: string[]
    companies: Companies
    seriesId: number
    type: Type
    year: string
}