import { AlternateTitle } from '@sonarrTube/types/sonarr/AlternateTitle.js';
import { Episode } from '@sonarrTube/types/sonarr/Episode.js';
import { Image } from '@sonarrTube/types/sonarr/Image.js';
import { Language } from '@sonarrTube/types/sonarr/Language.js';
import { Season } from '@sonarrTube/types/sonarr/Season.js';
import { Statistics } from '@sonarrTube/types/sonarr/Statistics.js';
import { Rating } from '@sonarrTube/types/sonarr/Rating.js';

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
    tvdbId: number
    tvRageId: number
    tvMazeId: number
    firstAired: string
    lastAired: string
    seriesType: string
    cleanTitle: string
    imdbId: number
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