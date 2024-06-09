import { Episode as TvdbEpisode } from './models/api/tvdb/Episode.js';
import { TvdbSubmitter } from './models/submitter/TvdbSubmitter.js';
import { BaseSubmitter } from './models/submitter/BaseSubmitter.js';
import { Episode } from './models/Episode.js';
import { FileHandler } from './models/file/FileHandler.js';
import { log } from './helpers/Log.js';
import { delay } from './helpers/Puppeteer.js';
import { series as getSonarrSeries } from './api/Sonarr.js';
import { series as getTvdbSeries } from './api/Tvdb.js';
import { Episode as SonarrEpisode } from './models/api/sonarr/Episode.js';
import { channels as getYoutubeChannels } from './api/Youtube.js';
import { Video as YoutubeVideo } from './models/api/youtube/Video.js';
import { config } from './helpers/Config.js';
import { Config } from './types/config/Config.js';
import { downloadVideos } from './api/Ytdlp.js';
import { DownloadableVideo } from './models/api/DownloadableVideo.js';

class ShowSubmitter {
  static folder: string = '/tmp/episodes';

  email: string;
  username: string;
  password: string;
  config: Config;
  renameOnly: boolean;
  submitters: Array<BaseSubmitter>;

  constructor() {
    this.config = config();
    this.renameOnly = false;
    this.submitters = [];
  }

  private parseArguments(): void {
    const inputs = process.argv.slice(2);
    for (let i = 0; i < inputs.length; i++) {
      const inputSplit = inputs[i].split('=');
      switch (inputSplit[0]) {
        case 'email':
          this.email = inputSplit[1];
          break;
        case 'password':
          this.password = inputSplit[1];
          break;
        case 'username':
          this.username = inputSplit[1];
          break;
        case 'renameOnly':
          this.renameOnly = inputSplit[1] == 'true';
          break;
      }
    }
  }

  private async initSubmitters(): Promise<void> {
    this.submitters.push(new TvdbSubmitter(this.username, this.password, this.email));
    for (const submitter of this.submitters) {
      await submitter.init();
      await submitter.doLogin();
    }
  }

  private async finishSubmitters(saveScreenshot: boolean = false): Promise<void> {
    for (const submitter of this.submitters) { await submitter.finish(saveScreenshot); }
  }

  private async addEpisode(fileToRename: string, series: string, season: string, episode: Episode): Promise<void> {
    for (const submitter of this.submitters) {
      try {
        await submitter.openSeriesSeasonPage(series, season);
      } catch (_e) {
        await submitter.addSeriesSeason(series, season);
        await submitter.openSeriesSeasonPage(series, season);
      }
      const episodeTextIdentifier = await submitter.getEpisodeIdentifier(fileToRename);
      if (!this.renameOnly && episodeTextIdentifier.length == 0) {
        await delay(500);
        await submitter.addEpisode(episode, series, season);
      }
    }
  }

  private async verifyAddedEpisode(fileToRename: string, series: string, season: string): Promise<string> {
    let episodeTextIdentifier = '';
    try {
      for (const submitter of this.submitters) {
        await submitter.openSeriesSeasonPage(series, season);
        episodeTextIdentifier = await submitter.getEpisodeIdentifier(fileToRename);
        // if we cant find it on a source something went wrong
        if (episodeTextIdentifier.length == 0) { throw new Error(); }
      }
    } catch (e) {
      log(`Didnt add episode for ${fileToRename} something went horribly wrong!`);
    }

    return episodeTextIdentifier;
  }

  private async addEpisodes(): Promise<void> {
    this.parseArguments();
    await this.initSubmitters();
    const fileHandler = new FileHandler(ShowSubmitter.folder);
    const shows = fileHandler.getFilesToProcess();
    for (const [series, seasons] of Object.entries(shows)) {
      for (const [season, episodes] of Object.entries(seasons)) {
        log(`Starting ${series} - ${season}`);
        log(`Processing ${episodes.length} episodes`);
        for (const episode of episodes) {
          const fileToRename = episode.title();
          await this.addEpisode(fileToRename, series, season, episode);
          const finalFilename = await this.verifyAddedEpisode(fileToRename, series, season);
          await fileHandler.renameEpisodeFiles(fileToRename, finalFilename, series, season);
        }
        log(`Finished ${series} - ${season}`);
      }
    }

    await this.finishSubmitters(false);
  }

  async start(): Promise<void> {
    const sonarrSerieses = [(await getSonarrSeries())[0]];
    const tvdbSerieses = await getTvdbSeries(sonarrSerieses);
    const youtubeChannels = await getYoutubeChannels(tvdbSerieses);

    for (const tvdbSeries of tvdbSerieses) {
      const sonarrSeries = sonarrSerieses
        .find(series => series.tvdbId === tvdbSeries.id);
      const youtubeChannel = youtubeChannels.find(channel => channel.tvdbId == tvdbSeries.id);

      if (sonarrSeries.episodes.length != tvdbSeries.episodes.length) {
        log('Warning there is a mismatch between tvdb and sonarr episodes! ' +
          `${sonarrSeries.episodes.length} vs ${tvdbSeries.episodes.length}`);
      }

      const sonarrUnDownloaded = sonarrSeries
        .episodes
        .filter((episode: SonarrEpisode) => !episode.hasFile);

      let missingProductionCodesCount = 0;

      const episodesForDownload = tvdbSeries
        .episodes.map((tvdbEpisode: TvdbEpisode) => {
          if (!tvdbEpisode.productionCode) {
            // log(
            //   `Warning! ${tvdbEpisode.name} ` +
            //   `${this.config.cacheDir}/tvdb/${tvdbEpisode.seriesId}/${tvdbEpisode.id}.json ` +
            //   `releaseDate: ${tvdbEpisode.aired} is missing production code ` +
            //   '(will attempt to match based on youtube title if you see this again you will have to fix manually)'
            // );
            missingProductionCodesCount++;

            return null;
          }

          const youtubeVideo = youtubeChannel
            .videos
            .find(
              (video: YoutubeVideo) => tvdbEpisode.productionCode == video.id
            );

          if (!youtubeVideo) {
            log(
              [
                '',
                `Warning! Could not find episode on youtube for ${tvdbEpisode.name}`,
                'this means an invalid production code or the video is no longer in the context',
                // eslint-disable-next-line max-len
                `https://www.thetvdb.com/series/${encodeURIComponent(tvdbSeries.slug)}/episodes/${tvdbEpisode.id}/0/edit`
              ].join('\n') + '\n'
            );

            return null;
          }

          const sonarrEpisode = sonarrUnDownloaded.find((sonarrEpisode) => tvdbEpisode.id == sonarrEpisode.tvdbId);

          if (!sonarrEpisode) {
            return null;
          }

          return new DownloadableVideo(
            youtubeVideo,
            sonarrEpisode,
            tvdbEpisode,
          );
        }).filter(Boolean);

      if (episodesForDownload.length != sonarrUnDownloaded.length) {
        log(
          'Warning! the amount to download doesn\'t match the expected amount for download! ' +
          `${episodesForDownload.length} vs ${sonarrUnDownloaded.length}\n`
        );
      }

      downloadVideos(episodesForDownload);

      const missingFromTvdbVideos = youtubeChannel
        .videos
        .filter(
          (video: YoutubeVideo) => tvdbSeries.episodes.find(
            (episodes: TvdbEpisode) => episodes.productionCode == video.id) == null
        );

      const futureTotal = (tvdbSeries.episodes.length + missingFromTvdbVideos.length - missingProductionCodesCount);

      if (futureTotal != youtubeChannel.videos.length) {
        log('\nWarning: (tvdb count + to be added + missing production code) != current youtube list ' +
          `${futureTotal} vs ${youtubeChannel.videos.length}\n`);
      }
      // if missingProductionCodesCount > 0 edit_only mode
    }



    // TODO: add on tvdb  missingFromTvdbVideos
    // TODO: add logic to first search for it by title and update production code

    // this.addEpisodes().catch(async (e) => {
    //   log(e);
    //   await this.finishSubmitters(true).catch((e2) => {
    //     log(e2);
    //   });
    //   throw e;
    // });
  }
}

export { ShowSubmitter };
