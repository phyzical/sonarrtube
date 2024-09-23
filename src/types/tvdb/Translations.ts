
type Translation = {
    aliases: string[]
    isAlias: boolean
    isPrimary: boolean
    language: string
    name: string
    overview: string
    tagline: string
}
export type Translations = {
    nameTranslations: Translation[]
    overviewTranslations: Translation[]
    alias: string[]
}