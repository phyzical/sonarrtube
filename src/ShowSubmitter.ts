import { TvdbSubmitter } from './models/submitter/TvdbSubmitter.js';
import { log } from './helpers/Log.js';
import { series as getSonarrSeries } from './api/Sonarr.js';
import { series as getTvdbSeries } from './api/Tvdb.js';
import { channels as getYoutubeChannels } from './api/Youtube.js';
import { config } from './helpers/Config.js';
import { Config } from './types/config/Config.js';
import { downloadVideos } from './api/Ytdlp.js';
import { ActionableVideo } from './models/api/ActionableVideo.js';
import { cachePath } from './helpers/Cache.js';
import { ActionableSeries } from './models/api/ActionableSeries.js';
import { Constants } from './types/config/Constants.js';

declare global {
  interface Window {
    cropper: {
      cropper: {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        getImageData: () => any; // Adjust the return type according to the actual structure
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        getCanvasData: () => any; // Adjust the return type according to the actual structure
        // eslint-disable-next-line no-unused-vars
        setCropBoxData: (data: { left: number; top: number; width: number; height: number }) => void;
      };
    };
  }
}

export class ShowSubmitter {
  static folder: string = cachePath(`${Constants.CACHE_FOLDERS.SCREENSHOTS}/`);

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
    const preview = this.config.preview || backfillOnly;
    for (const video of videos) {
      if (!preview) {
        this.submitter.video = video;
        try {
          await this.submitter.addEpisode();
          await video.generateSonarrEpisode(await this.submitter.verifyAddedEpisode());
        } catch (e) {
          await this.error(e);
        }
      }
      let updateText = '';
      if (preview) {
        updateText = `${this.config.preview ? 'Preview' : 'BackfillOnly'} mode on, Would have added:\n`;
      }
      this.submitter.updates.push(
        `${updateText}${video.summary()}`
      );
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

  private async backfillEpisodeProductionCode(video: ActionableVideo): Promise<void> {
    log(
      'found a backfill match, Attempting production code backfill! ' +
      `youtube: ${video.youtubeVideo.title()} -> tvdb: ${video.tvdbEpisode.name}`
    );
    this.submitter.video = video;
    await this.submitter.backfillEpisodeProductionCode()
      .then(_ => this.submitter.updates.push(`Backfilled Production Code\n${video.summary()}`))
      .catch(e => this.error(e));
    video.clearCache();
  }

  private async backfillEpisodeImage(video: ActionableVideo): Promise<void> {
    log(
      `Attempting backfill of image for tvdb: ${video.tvdbEpisode.name}`
    );
    this.submitter.video = video;
    await this.submitter.backfillEpisodeImage()
      .then(_ => this.submitter.updates.push(`Backfilled Image\n${video.summary()}`))
      .catch(e => this.error(e));

  }

  private async generateActionableSeries(): Promise<ActionableSeries[]> {
    const sonarrSerieses = await getSonarrSeries();
    const tvdbSerieses = await getTvdbSeries(sonarrSerieses);
    const youtubeChannels = await getYoutubeChannels(tvdbSerieses);

    const actionableSerieses = [];

    for (const tvdbSeries of tvdbSerieses) {
      const sonarrSeries = sonarrSerieses
        .find(series => series.tvdbId === tvdbSeries.id);
      const youtubeChannel = youtubeChannels.find(channel => channel.tvdbId == tvdbSeries.id);

      if (!youtubeChannel) {
        continue;
      }

      const actionableSeries = new ActionableSeries({ sonarrSeries, tvdbSeries, youtubeContext: youtubeChannel });

      const nonYearSeason = sonarrSeries
        .episodes
        .map(episode => episode.seasonNumber)
        .filter(seasonNumber => seasonNumber < 100);

      if (nonYearSeason.length > 0) {
        log(
          `Only downloading/backfilling videos for ${tvdbSeries.name} as it has a season number in a non year format`
        );
        actionableSeries.backfillDownloadOnly = true;
      }

      actionableSerieses.push(actionableSeries);
    }

    return actionableSerieses;
  }

  async start(): Promise<void> {
    await this.initSubmitter();
    const actionableSerieses = await this.generateActionableSeries();

    for (const actionableSeries of actionableSerieses) {
      for (const episode of actionableSeries.backfillableProductionCodeVideos(this.config.downloadOnly)) {
        await this.backfillEpisodeProductionCode(episode);
      }

      for (const episode of actionableSeries.backfillableImageVideos(this.config.downloadOnly)) {
        await this.backfillEpisodeImage(episode);
      }

      if (!this.config.downloadOnly && !actionableSeries.backfillDownloadOnly) {
        await this.addEpisodes(
          actionableSeries
            .missingFromTvdbVideos()
            .filter(video => !actionableSeries
              .backfillableProductionCodeVideos()
              .find(backfillVideo => video.youtubeVideo.id === backfillVideo.youtubeVideo.id)
            ),
          actionableSeries.hasMissing()
        );
      }

      this.submitter.downloads.concat(
        downloadVideos(actionableSeries.unDownloadedVideos())
      );
      await this.submitter.handleReports(actionableSeries);
    }

    await this.submitter.finish(false);
  }
}
