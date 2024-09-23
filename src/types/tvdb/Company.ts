import { Alias } from '@sonarrTube/types/tvdb/Alias.js';
import { Tag } from '@sonarrTube/types/tvdb/Tag.js';

type Relation = {
    id: number
    typeName: string
}
type ParentCompany = {
    id: number
    name: string
    relation: Relation
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
