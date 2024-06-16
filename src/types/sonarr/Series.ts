import { AlternateTitle } from './AlternateTitle.js';
import { Episode } from './Episode.js';
import { Image } from './Image.js';
import { Language } from './Language.js';
import { Season } from './Season.js';
import { Statistics } from './Statistics.js';
import { Rating } from './Rating.js';

export type Series = {
    episodes: Episode[],
    title: string
    alternateTitles: AlternateTitle[]
    sortTitle: string
    status: string
    ended: boolean,
    overview: string
    previousAiring: string
    network: string
    airTime: string
    images: Image[]
    originalLanguage: Language,
    seasons: Season[]
    year: number
    path: string
    qualityProfileId: number
    seasonFolder: boolean,
    monitored: boolean,
    monitorNewItems: string
    useSceneNumbering: boolean
    runtime: number
    tvdbId: string
    tvRageId: number
    tvMazeId: number
    firstAired: string
    lastAired: string
    seriesType: string
    cleanTitle: string
    imdbId: string
    titleSlug: string
    rootFolderPath: string
    certification: string
    genres: string[]
    tags: string[]
    added: string
    ratings: Rating
    statistics: Statistics
    languageProfileId: number
    id: number
}