import { Video } from '../types/youtube/Video.js';

class EpisodeInformation {
  video: Video;

  constructor(video: Video) {
    this.video = video;
  }

  description(): string {
    let description = this.video.description;
    const crappyDescriptionRegex = new RegExp(/(sponsor)+|(download)+/i);

    if (!description || description.length > 100 || crappyDescriptionRegex.test(description)) {
      description = this.title();
    }

    return description;
  }

  title(): string {
    return this.video.fulltitle;
  }

  url(): string {
    return this.video.id;
  }

  runTime(): string {
    const runtime = Math.floor(this.video.duration / 60);

    return runtime > 1 ? runtime.toString() : '1';
  }

  airedDate(): string {
    const airDate = this.video.upload_date; //'01/02/2020'

    return airDate.slice(0, 4) + '-' + airDate.slice(4, 6) + '-' + airDate.slice(6, 8);
  }
}

export { EpisodeInformation };
