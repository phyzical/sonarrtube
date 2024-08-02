import { Company } from '@sonarrTube/types/tvdb/Company.js';

type Type = {
    alternateName: string
    id: number
    name: string
    type: string
}

type Companies = {
    studio: Company[]
    network: Company[]
    production: Company[]
    distributor: Company[]
    special_effects: Company[]
}

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