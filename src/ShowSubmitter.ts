import { TvdbSubmitter } from './models/submitter/TvdbSubmitter.js';
import { log } from './helpers/Log.js';
import { series as getSonarrSeries } from './api/Sonarr.js';
import { series as getTvdbSeries } from './api/Tvdb.js';
import { channels as getYoutubeChannels } from './api/Youtube.js';
import { config } from './helpers/Config.js';
import { Config } from './types/config/Config.js';
import { downloadVideos } from './api/Ytdlp.js';
import { ActionableVideo } from './models/api/ActionableVideo.js';
import { cachePath, clearCache } from './helpers/Cache.js';
import { ActionableSeries } from './models/api/ActionableSeries.js';

export class ShowSubmitter {
  static folder: string = cachePath('screenshots/');

  config: Config;
  submitter: TvdbSubmitter;

  constructor() {
    this.config = config();
  }

  private async initSubmitter(): Promise<void> {
    if (this.config.downloadOnly) {
      return null;
    }
    this.submitter = new TvdbSubmitter(this.config.tvdb);
    await this.submitter.init();
    await this.submitter.doLogin().catch(e => this.error(e));
  }

  private async addEpisodes(videos: ActionableVideo[], backfillOnly: boolean): Promise<void> {
    const seriesName = videos[0].youtubeVideo.channel;
    log(`Updating ${seriesName}`);
    log(`Processing ${videos.length} episodes`);
    for (const video of videos) {
      if (this.config.preview || backfillOnly) {
        log(
          `\n ${this.config.preview ? 'Preview' : 'BackfillOnly'} mode on, Would have added ` +
          `(${video.youtubeURL()}) ` +
          `(${video.youtubeVideo.airedDate()}) ` +
          `${video.tvdbEpisodeFromContext.name} to season ${video.season()}`
        );
      } else {
        this.submitter.video = video;
        await this.submitter.addEpisode().catch(e => this.error(e));
        await this.submitter.verifyAddedEpisode().catch(e => this.error(e));
      }

    }
    log(`Finished ${seriesName}`);
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private async error(e: any): Promise<void> {
    await this.submitter.finish(true).catch((e2) => {
      log(e2);
    });
    throw e;
  }

  private async backfillEpisode(video: ActionableVideo): Promise<void> {
    log(
      'found a backfill match, Attempting backfill! ' +
      `youtube: ${video.youtubeVideo.title()} -> tvdb: ${video.tvdbEpisode.name}`
    );
    this.submitter.video = video;
    await this.submitter.backfillEpisode().catch(e => this.error(e));
    clearCache(video.tvdbEpisode.cacheKey());
  }


  private async generateActionableSeries(): Promise<ActionableSeries[]> {
    // TODO: we gotta remove the [0] once were happy
    const sonarrSerieses = [(await getSonarrSeries())[0]];
    const tvdbSerieses = await getTvdbSeries(sonarrSerieses);
    const youtubeChannels = await getYoutubeChannels(tvdbSerieses);

    const actionableSeries = [];

    for (const tvdbSeries of tvdbSerieses) {
      const sonarrSeries = sonarrSerieses
        .find(series => series.tvdbId === tvdbSeries.id);
      const youtubeChannel = youtubeChannels.find(channel => channel.tvdbId == tvdbSeries.id);

      actionableSeries.push(new ActionableSeries({ sonarrSeries, tvdbSeries, youtubeContext: youtubeChannel }));
    }

    return actionableSeries;
  }

  async start(): Promise<void> {
    await this.initSubmitter();
    const actionableSerieses = await this.generateActionableSeries();

    for (const actionableSeries of actionableSerieses) {
      downloadVideos(actionableSeries.unDownloadedVideos());

      for (const episode of actionableSeries.backfillableVideos(this.config.downloadOnly)) {
        await this.backfillEpisode(episode);
      }

      if (!this.config.downloadOnly) {
        await this.addEpisodes(actionableSeries.missingFromTvdbVideos(), actionableSeries.hasMissing());
      }
    }

    await this.submitter.finish(false);
  }
}
