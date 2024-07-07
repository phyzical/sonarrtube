import { Channel as ChannelType } from '@sonarrTube/types/youtube/Channel.js';
import { Video } from '@sonarrTube/models/api/youtube/Video.js';
export class Channel {
    videos: Video[] = [];
    id?: string;
    tvdbId: string;
    url?: string;
    constructor(payload: ChannelType) {
        this.tvdbId = payload.tvdbId;
    }
}