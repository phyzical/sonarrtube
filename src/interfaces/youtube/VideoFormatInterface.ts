interface VideoFormatInterface {
  asr: number;
  tbr: number;
  protocol: string;
  format: string;
  url: string;
  vcodec: string;
  format_note: string;
  abr: number;
  player_url: string;
  downloader_options: {
    http_chunk_size: number;
  };
  width: number;
  ext: string;
  filesize: number;
  fps: number;
  format_id: string;
  height: number;
  http_headers: {
    "Accept-Charset": string;
    "Accept-Language": string;
    "Accept-Encoding": string;
    Accept: string;
    "User-Agent": string;
  };
  acodec: string;
}

export { VideoFormatInterface };
