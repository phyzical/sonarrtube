
type Translation = {
    aliases: string[]
    isAlias: true
    isPrimary: true
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