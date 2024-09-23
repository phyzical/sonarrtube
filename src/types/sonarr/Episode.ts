import { Series } from '@sonarrTube/models/api/sonarr/Series.js';
export type Episode = {
    seriesId?: number
    tvdbId?: number
    episodeFileId?: number
    seasonNumber: number
    episodeNumber: number
    title?: string
    airDate?: string
    airDateUtc?: string
    runtime?: number
    overview?: string
    hasFile: boolean
    monitored?: boolean
    unverifiedSceneNumbering?: boolean
    grabbed?: boolean
    id?: number
    series: Series;
}
