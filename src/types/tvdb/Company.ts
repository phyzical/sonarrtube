import { Alias } from './Alias.js';
import { Tag } from './Tag.js';

type ParentCompany = {
    id: number
    name: string
    relation: {
        id: number
        typeName: string
    }
}

export type Company = {
    activeDate: string
    aliases: Alias[]
    country: string
    id: number
    inactiveDate: string
    name: string
    nameTranslations: string[]
    overviewTranslations: string[]
    primaryCompanyType: number
    slug: string
    parentCompany: ParentCompany
    tagOptions: Tag[]
}
