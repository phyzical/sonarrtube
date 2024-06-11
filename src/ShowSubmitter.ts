import { Episode as TvdbEpisode } from './models/api/tvdb/Episode.js';
import { TvdbSubmitter } from './models/submitter/TvdbSubmitter.js';
import { log } from './helpers/Log.js';
import { series as getSonarrSeries } from './api/Sonarr.js';
import { series as getTvdbSeries } from './api/Tvdb.js';
import { Episode as SonarrEpisode } from './models/api/sonarr/Episode.js';
import { channels as getYoutubeChannels } from './api/Youtube.js';
import { config } from './helpers/Config.js';
import { Config } from './types/config/Config.js';
import { downloadVideos } from './api/Ytdlp.js';
import { ActionableVideo } from './models/api/ActionableVideo.js';
import { Video } from './models/api/youtube/Video.js';
import { cachePath, clearCache } from './helpers/Cache.js';

export class ShowSubmitter {
  static folder: string = cachePath('screenshots/');

  config: Config;
  submitter: TvdbSubmitter;

  constructor() {
    this.config = config();
    this.submitter;
  }

  private async initSubmitter(): Promise<void> {
    //  TODO: rework to need to init less
    // TODO: add alias functions to remove the need to pass this.page everywhere
    this.submitter = new TvdbSubmitter(this.config.tvdb);
    await this.submitter.init();
    await this.submitter.doLogin().catch(e => this.error(e));
  }

  private async addEpisodes(videos: ActionableVideo[]): Promise<void> {
    await this.initSubmitter();
    const seriesName = videos[0].youtubeVideo.channel;
    log(`Updating ${seriesName}`);
    log(`Processing ${videos.length} episodes`);
    for (const video of videos) {
      this.submitter.video = video;
      await this.submitter.addEpisode().catch(e => this.error(e));
      await this.submitter.verifyAddedEpisode().catch(e => this.error(e));
    }
    log(`Finished ${seriesName}`);

    this.submitter.finish(false);
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private async error(e: any): Promise<void> {
    await this.submitter.finish(true).catch((e2) => {
      log(e2);
    });
    throw e;
  }

  private async backfillEpisode(video: ActionableVideo): Promise<void> {
    await this.initSubmitter();
    this.submitter.video = video;
    await this.submitter.backfillEpisode().catch(e => this.error(e));
    this.submitter.finish(false);
    clearCache(video.sonarrEpisode.tvdbCacheKey());
  }

  async start(): Promise<void> {
    const sonarrSerieses = [(await getSonarrSeries())[0]];
    const tvdbSerieses = await getTvdbSeries(sonarrSerieses);
    const youtubeChannels = await getYoutubeChannels(tvdbSerieses);

    for (const tvdbSeries of tvdbSerieses) {
      let updateOnly = false;

      const sonarrSeries = sonarrSerieses
        .find(series => series.tvdbId === tvdbSeries.id);
      const youtubeChannel = youtubeChannels.find(channel => channel.tvdbId == tvdbSeries.id);

      if (sonarrSeries.episodes.length != tvdbSeries.episodes.length) {
        log('Warning there is a mismatch between tvdb and sonarr episodes! ' +
          `${sonarrSeries.episodes.length} vs ${tvdbSeries.episodes.length}`);
      }

      const actionableVideos = [] as ActionableVideo[];

      // find eps missing from tvdb, and where they line up
      for (const video of youtubeChannel.videos) {
        const tvdbEpisode = tvdbSeries.episodes.find((episode: TvdbEpisode) => episode.productionCode == video.id);
        const sonarrEpisode = sonarrSeries.episodes.find((episode: SonarrEpisode) => episode.tvdbId == tvdbEpisode?.id);
        actionableVideos.push(
          new ActionableVideo({ youtubeVideo: video, sonarrEpisode, tvdbEpisode, tvdbSeries, sonarrSeries })
        );
      }

      // find eps with missing prod codes
      for (const tvdbEpisode of tvdbSeries.episodes.filter(episode => !episode.productionCode)) {
        const sonarrEpisode = sonarrSeries.episodes.find((episode: SonarrEpisode) => episode.tvdbId == tvdbEpisode?.id);

        actionableVideos.push(
          new ActionableVideo({ youtubeVideo: null, sonarrEpisode, tvdbEpisode, tvdbSeries, sonarrSeries })
        );
      }

      const sonarrUnDownloaded = actionableVideos.filter(actionableVideo => actionableVideo.unDownloaded());

      const missingProductionCodeTvdbEpisodes = actionableVideos
        .filter(actionableVideo => actionableVideo.missingProductionCode());

      downloadVideos(sonarrUnDownloaded);

      const missingFromTvdbVideos = actionableVideos.filter(actionableVideo => actionableVideo.missingFromTvdb());

      if (missingProductionCodeTvdbEpisodes.length > 0 && !this.config.downloadOnly) {
        updateOnly = true;

        for (const episode of missingProductionCodeTvdbEpisodes) {
          episode.youtubeVideo = youtubeChannel
            .videos
            .find(
              (video: Video) => video.title().includes(episode.tvdbEpisode.name) ||
                episode.tvdbEpisode.name.includes(video.title())
            );
          if (episode.youtubeVideo) {
            log(
              'found a backfill match, Attempting backfill! ' +
              `youtube: ${episode.youtubeVideo.title()} -> tvdb: ${episode.tvdbEpisode.name}`
            );
            await this.backfillEpisode(episode);
          }
        }
      }

      const futureTotal = tvdbSeries.episodes.length +
        missingFromTvdbVideos.length -
        missingProductionCodeTvdbEpisodes.length;

      if (futureTotal != youtubeChannel.videos.length) {
        log('\nWarning: (tvdb count + to be added + missing production code) != current youtube list ' +
          `${futureTotal} vs ${youtubeChannel.videos.length}\n`);
      }

      if (!this.config.downloadOnly && !updateOnly) {
        // await this.addEpisodes(missingFromTvdbVideos);
      }
    }
  }
}
