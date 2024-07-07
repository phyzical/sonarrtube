import { Video } from '@sonarrTube/types/youtube/Video.js';

export type Channel = {
    videos?: Video[]
    id?: string
    tvdbId: string
}