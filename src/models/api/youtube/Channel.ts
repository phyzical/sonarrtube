import { Channel as ChannelType } from './../../../types/youtube/Channel.js';
import { Video } from './Video.js';
export class Channel {
    videos: Video[] = [];
    id?: string;
    tvdbId: string;
    url?: string;
    constructor(payload: ChannelType) {
        this.tvdbId = payload.tvdbId;
    }
}