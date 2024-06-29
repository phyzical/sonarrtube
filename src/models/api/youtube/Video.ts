import { config } from '../../../helpers/Config.js';
import { Constants } from '../../../types/config/Constants.js';
import { Video as VideoType } from './../../../types/youtube/Video.js';

const { titleCleanerRegex } = config();

export class Video {
    theTitle: string;
    fulltitle: string;
    thumbnail: string;
    theDescription: string;
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
        this.theTitle = payload.title;
        this.fulltitle = payload.fulltitle;
        this.thumbnail = payload.thumbnail;
        this.theDescription = payload.description;
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

    description(): string {
        let description = this.theDescription;
        const crappyDescriptionRegex = new RegExp(/(sponsor)+|(download)+/i);

        if (!description || description.length > 100 || crappyDescriptionRegex.test(description)) {
            description = this.title();
        }

        return description;
    }

    title(): string {
        return this.fulltitle.replace(titleCleanerRegex, '');
    }

    backupTitle(): string {
        return this.theTitle.replace(titleCleanerRegex, '');
    }

    runTime(): string {
        const runtime = Math.floor(this.duration / 60);

        return runtime > 1 ? runtime.toString() : '1';
    }

    airedDate(): string {
        const airDate = this.upload_date; //'01/02/2020'

        return airDate.slice(0, 4) + '-' + airDate.slice(4, 6) + '-' + airDate.slice(6, 8);
    }

    season(): number {
        const dateSplits = this.airedDate().split('-');

        return parseInt(dateSplits[0]);
    }

    url(): string {
        return `${Constants.YOUTUBE.HOST}/watch?v=${this.id}`;
    }
}