import { TvdbSubmitter } from '@sonarrTube/models/submitter/TvdbSubmitter.js';
import { log } from '@sonarrTube/helpers/Log.js';
import { series as getSonarrSeries } from '@sonarrTube/api/Sonarr.js';
import { series as getTvdbSeries } from '@sonarrTube/api/Tvdb.js';
import { channels as getYoutubeChannels } from '@sonarrTube/api/Youtube.js';
import { config } from '@sonarrTube/helpers/Config.js';
import { Config } from '@sonarrTube/types/config/Config.js';
import { downloadVideos } from '@sonarrTube/api/Ytdlp.js';
import { ActionableVideo } from '@sonarrTube/models/api/ActionableVideo.js';
import { ActionableSeries } from '@sonarrTube/models/api/ActionableSeries.js';

declare global {
  interface Window {
    cropper: {
      cropper: {
        // Adjust the return type according to the actual structure
        getImageData: () => { naturalWidth: number, naturalHeight: number };
        getCanvasData: () => { left: number, top: number }; // Adjust the return type according to the actual structure
        // eslint-disable-next-line no-unused-vars
        setCropBoxData: (data: { left: number; top: number; width: number; height: number }) => void;
      };
    };
  }
}

export class ShowSubmitter {
  config: Config;
  submitter: TvdbSubmitter;

  constructor() {
    this.config = config();
    this.submitter = new TvdbSubmitter(this.config.tvdb);
  }

  private initSubmitter = async (): Promise<void> => {
    if (this.config.downloadOnly) {
      return;
    }
    await this.submitter.init();
    await this.submitter.doLogin().catch(e => this.error(e, ''));
  };

  private addEpisodes = async (videos: ActionableVideo[], backfillOnly: boolean): Promise<void> => {
    if (!videos[0].youtubeVideo) {
      throw new Error('Missing youtubeVideo aborting addEpisodes');
    }
    const seriesName = videos[0].youtubeVideo.channel;
    log(`Updating ${seriesName}`);
    log(`Processing ${videos.length} episodes`);
    const preview = this.config.preview || backfillOnly;
    for (const video of videos) {
      const updateText = `${this.previewText(backfillOnly)} Adding:\n  ${video.summary()}`;
      this.submitter.videoObj = video;
      try {
        if (!preview) {
          await this.submitter.addEpisode();
          video.generateSonarrEpisode(await this.submitter.verifyAddedEpisode());
        }

        this.submitter.updates.push(updateText);
      } catch (e) {
        await this.error(e, updateText);
      }
    }
    log(`Finished ${seriesName}`);
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private error = async (e: any, summary: string): Promise<void> => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    this.submitter.errors.push(`Error:\n${e.message}\n${summary}`);
    await this.submitter.finish(true).catch((e2) => {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      log(e2);
    });
    throw e;
  };

  private previewText = (backFillMode: boolean = false): string => {
    const { preview } = this.config;

    return preview || backFillMode ? 'Preview Mode on Would have:\n' : '';
  };


  private backfillEpisodeProductionCode = async (video: ActionableVideo): Promise<void> => {
    if (!video.tvdbEpisode) {
      throw new Error('Missing tvdbEpisode aborting backfillProductionCode');
    }
    if (!video.youtubeVideo) {
      throw new Error('Missing youtubeVideo aborting backfillProductionCode');
    }
    log(
      `${this.previewText()} found a backfill match, Attempting production code backfill! ` +
      `youtube: ${video.youtubeVideo.cleanTitle()} -> tvdb: ${video.tvdbEpisode.name}`
    );
    this.submitter.videoObj = video;
    const message = `${this.previewText()} Backfilled Production Code\n${video.summary()}`;
    try {
      if (!this.config.preview) {
        await this.submitter.backfillEpisodeProductionCode();
        video.clearCache();
      }
      this.submitter.updates.push(message);
    } catch (e) {
      await this.error(e, message);
      video.clearCache();
    }
  };

  private backfillEpisodeImage = async (video: ActionableVideo): Promise<void> => {
    if (!video.tvdbEpisode) {
      throw new Error('Missing tvdbEpisode aborting backfillEpisode');
    }
    log(
      `${this.previewText()} Attempting backfill of image for tvdb: ${video.tvdbEpisode.name}`
    );
    this.submitter.videoObj = video;
    const message = `${this.previewText()} Backfilled Image\n${video.summary()}`;
    try {
      if (!this.config.preview) {
        await this.submitter.uploadEpisodeImage();
        video.clearCache();
      }
      this.submitter.updates.push(message);
    } catch (e) {
      await this.error(e, message);
      video.clearCache();
    }
  };

  private generateActionableSeries = async (): Promise<ActionableSeries[]> => {
    const sonarrSerieses = await getSonarrSeries();
    const tvdbSerieses = await getTvdbSeries(sonarrSerieses);
    const youtubeChannels = getYoutubeChannels(tvdbSerieses);

    const actionableSerieses = [] as ActionableSeries[];

    for (const tvdbSeries of tvdbSerieses) {
      log(`Starting Processing of ${tvdbSeries.name}`);
      const sonarrSeries = sonarrSerieses
        .find(series => series.tvdbId === tvdbSeries.id);

      if (!sonarrSeries) {
        log('Could not find sonarr series, this should never happen!');
        continue;
      }

      const youtubeChannel = youtubeChannels.find(channel => channel.tvdbId == tvdbSeries.id);

      if (!youtubeChannel) {
        log('Could not find youtube series, this should never happen!');
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
  };

  start = async (): Promise<void> => {
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
              .find(backfillVideo => video.youtubeVideo?.id &&
                (video.youtubeVideo?.id === backfillVideo.youtubeVideo?.id)
              )
            ),
          actionableSeries.hasMissing()
        );
      }

      this.submitter.downloads = downloadVideos(actionableSeries.unDownloadedVideos());
      await this.submitter.handleReports(actionableSeries);
    }

    await this.submitter.finish(false);
  };
}
