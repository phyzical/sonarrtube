import { EpisodeInterface } from "../EpisodeInterface.js";

interface GenericSubmitterInterface {
  doLogin(): Promise<void>;
  openSeriesSeasonPage(series: string, season: string): Promise<void>;
  addEpisode(
    episode: EpisodeInterface,
    series: string,
    season: string
  ): Promise<void>;
  getEpisodeIdentifier(episodeTitle: string): Promise<string>;
}

export { GenericSubmitterInterface };
