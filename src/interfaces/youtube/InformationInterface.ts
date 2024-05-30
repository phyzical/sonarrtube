import { ThumbnailInterface } from "./ThumbnailInterface.js";
import { VideoFormatInterface } from "./VideoFormatInterface.js";

interface InformationInterface {
  upload_date: string;
  vcodec: string;
  subscriber_count: number;
  extractor: string;
  height: number;
  like_count: number;
  duration: number;
  fulltitle: string;
  id: string;
  view_count: number;
  playlist: string;
  title: string;
  _filename: string;
  playlist_index: number;
  dislike_count: number;
  playlist_id: string;
  abr: number;
  tags: Array<string>;
  uploader_url: string;
  fps: number;
  webpage_url_basename: string;
  acodec: string;
  display_id: string;
  description: string;
  format: string;
  average_rating: number;
  uploader: string;
  format_id: string;
  uploader_id: string;
  categories: Array<string>;
  thumbnails: Array<ThumbnailInterface>;
  extractor_key: string;
  channel_id: string;
  thumbnail: string;
  ext: string;
  webpage_url: string;
  formats: Array<VideoFormatInterface>;
  channel_url: string;
  width: number;
  n_entries: number;
  age_limit: number;
}

export { InformationInterface };
