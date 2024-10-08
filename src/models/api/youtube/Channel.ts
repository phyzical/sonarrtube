import { Channel as ChannelType } from '@sonarrTube/types/youtube/Channel.js';
import { Video } from '@sonarrTube/models/api/youtube/Video.js';
export class Channel implements ChannelType {
    constructor(payload: ChannelType) {
        this.tvdbId = payload.tvdbId;
        this.videos = [];
    }
    videos: Video[];
    id?: string | undefined;
    tvdbId: number;
    url?: string | undefined;
}