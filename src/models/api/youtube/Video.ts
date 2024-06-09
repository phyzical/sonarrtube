import { Video as VideoType } from './../../../types/youtube/Video';
export class Video {
    title: string;
    fulltitle: string;
    thumbnail: string;
    description: string;
    channel_id: string;
    channel_url: string;
    channel: string;
    duration: number;
    view_count: number;
    webpage_url: string;
    id: string;
    timestamp: number;
    upload_date: string;
    constructor(payload: VideoType) {
        this.title = payload.title;
        this.fulltitle = payload.fulltitle;
        this.thumbnail = payload.thumbnail;
        this.description = payload.description;
        this.channel_id = payload.channel_id;
        this.channel_url = payload.channel_url;
        this.channel = payload.channel;
        this.duration = payload.duration;
        this.view_count = payload.view_count;
        this.webpage_url = payload.webpage_url;
        this.timestamp = payload.timestamp;
        this.upload_date = payload.upload_date;
        this.id = payload.id;
    }
}