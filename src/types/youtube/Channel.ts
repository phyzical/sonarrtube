import { Video } from './Video.js';

export type Channel = {
    title: string
    videos: Video[]
    id: string
    tvdbId: number
}