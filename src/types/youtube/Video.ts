export type Video = {
    _type: string
    title: string
    fulltitle: string
    thumbnail: string
    description: string
    channel_id: string
    channel_url: string
    channel: string
    duration: number
    view_count: number
    webpage_url: string
    id: string
    timestamp: number
    upload_date: string

    runTime: () => string
    season: () => number
    url: () => string
    cleanDescription: () => string
    cleanTitle: () => string
    backupTitle: () => string
    airedDate: () => string
}
