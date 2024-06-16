import { cleanTextContainsXpath, delay } from '../../helpers/Puppeteer.js';
import { log } from '../../helpers/Log.js';
import { setTimeout } from 'node:timers/promises';
import { createWriteStream } from 'node:fs';
import fetch from 'node-fetch';
import { cachePath } from '../../helpers/Cache.js';
import { BaseSubmitter } from './BaseSubmitter.js';

export class TvdbSubmitter extends BaseSubmitter {
  #baseURL = 'https://thetvdb.com';

  getEpisodeXpath(episodeTitle: string): string {
    return `xpath///tr[.//a[${cleanTextContainsXpath(episodeTitle)}]]/td`;
  }

  getSeriesXpath(seriesTitle: string): string {
    return `xpath///*[${cleanTextContainsXpath(seriesTitle)}]`;
  }

  async getEpisodeIdentifier(): Promise<string> {
    const episodeTitle = this.video.youtubeVideo.title();
    log(`Looking for episode for ${episodeTitle}`, true);
    const episodeTextElement = await this.find(this.getEpisodeXpath(episodeTitle));
    let episodeIdentifier = '';
    try {
      episodeIdentifier = await this.page.evaluate((element: Element) => element.textContent, episodeTextElement[0]);
      log(`Found episode for ${episodeTitle}`, true);
    } catch (e) {
      log(`Didnt find episode for ${episodeTitle}`, true);
    }

    return episodeIdentifier;
  }

  async doLogin(): Promise<void> {
    log('starting login', true);
    await this.goto([this.#baseURL, 'auth', 'login'].join('/'));
    const loginFormSelector = 'form[action="/auth/login"]';
    await this.find(loginFormSelector);
    await this.type('[name="email"]', this.email);
    await this.type('[name="password"]', this.password);
    await this.submitForm(loginFormSelector);
    await this.goto([this.#baseURL, 'dashboard'].join('/'));
    await this.find(`xpath///*[contains(text(),"${this.email}")]`);
    await this.goto([this.#baseURL].join('/'));
    log('finishing login', true);
  }

  async openSeriesSeasonPage(): Promise<void> {
    const season = this.video.season();
    const series = this.video.tvdbSeries.slug;
    const showSeasonURL = [this.#baseURL, 'series', series, 'seasons', 'official', season].join('/');
    await this.goto(showSeasonURL);
    let seasonSelector = `xpath///*[contains(text(), "Season ${season}")]`;
    if (season == 0) { seasonSelector = 'xpath///*[contains(text(), "Specials")]'; }

    await this.find(seasonSelector);
    log(`opened ${showSeasonURL}`, true);
  }

  async addSeriesSeason(): Promise<void> {
    const season = this.video.season();
    const series = this.video.tvdbSeries.slug;
    log(`Adding ${series} - ${season}`, true);
    await this.openSeriesPage();
    await this.click('xpath///a[text()="Seasons"]');
    await delay(1500);
    await this.click('xpath///button[@title="Add Season"]');
    await this.type('[name="season_number"]', season.toString());
    await this.click('xpath///button[text()="Add Season"]');
    await this.find(`xpath///*[contains(text(), "Season ${season}")]`);
    log(`Added ${series} - ${season}`, true);
  }

  async openSeriesPage(): Promise<void> {
    const series = this.video.tvdbSeries.slug;
    const showSeriesURL = [this.#baseURL, 'series', series].join('/');
    await this.goto(showSeriesURL);
    await this.find(this.getSeriesXpath(series));
    log(`opened ${showSeriesURL}`, true);
  }

  async openEditEpisodePage(): Promise<void> {
    const episodeTitle = this.video.youtubeVideo.title();
    const series = this.video.tvdbSeries.slug;
    if (!this.video.missingFromTvdb()) {
      const showSeriesURL = [
        this.#baseURL, 'series', series, 'episodes', this.video.tvdbEpisode.id, '0', 'edit'
      ].join('/');
      await this.goto(showSeriesURL);
      await this.find(`xpath///*[contains(text(), "Episode ${this.video.tvdbEpisode.number}")]`);
      await this.find(`xpath///*[contains(text(), "Season ${this.video.tvdbEpisode.seasonNumber}")]`);
    } else {
      await delay(500);
      await this.openSeriesSeasonPage();
      await this.click(this.getEpisodeXpath(episodeTitle));
      await this.click('xpath///*[contains(text(),"Edit Episode")]');
    }
    log(`opened editEpisodePage ${episodeTitle}`, true);
  }

  async verifyAddedEpisode(): Promise<string> {
    let episodeTextIdentifier = '';
    try {
      await this.openSeriesSeasonPage();
      episodeTextIdentifier = await this.getEpisodeIdentifier();
      // if we cant find it on a source something went wrong
      if (episodeTextIdentifier.length == 0) { throw new Error(); }
    } catch (e) {
      log(`Didnt add episode for ${this.video.youtubeVideo.title} something went horribly wrong!`);
    }

    return episodeTextIdentifier;
  }

  private async openAddEpisodePage(): Promise<void> {
    await this.openSeriesSeasonPage();
    await this.click('xpath///*[contains(text(),"Add Episode")]');
    log('opened addEpisodePage', true);
  }

  private async addInitialEpisode(): Promise<void> {
    const episode = this.video.youtubeVideo;
    log('starting adding', true);
    const addEpisodeFormSelector = 'xpath///h3[text()=\'Episodes\']/ancestor::form';
    await this.find(addEpisodeFormSelector);
    await delay(500);
    await this.type('[name="name"]', episode.title());
    await this.type('[name="overview"]', episode.description());
    await this.type('[name="runtime"]', episode.runTime());
    await this.type('[name="date"]', episode.airedDate());
    await delay(500);
    await this.click(addEpisodeFormSelector);
    log('finished adding', true);
  }

  private async updateEpisode(): Promise<void> {
    const video = this.video.youtubeVideo;
    log('updating episode', true);
    await this.find('form.episode-edit-form');
    await delay(500);
    await this.type('[name="productioncode"]', video.id);
    await delay(500);
    await this.click('xpath///button[text()=\'Save\']');
    await this.checkForEpisode();
    log('updated episode', true);
  }

  private async checkForEpisode(): Promise<void> {
    const episode = this.video.tvdbEpisode;
    const video = this.video.youtubeVideo;

    try {
      await this.find(`xpath///*[contains(text(),"${video.title()}")]`);
    } catch (e) {
      //  fall back to tvdb title if it exists
      if (episode.name) {
        await this.find(`xpath///*[contains(text(),"${episode.name}")]`);
      } else {
        throw e;
      }
    }

  }

  private async uploadEpisodeThumbnail(): Promise<void> {
    const episode = this.video.youtubeVideo;
    log('Starting image upload', true);
    const thumbnailUrl = episode.thumbnail;
    const thumbnailPath = `${cachePath('thumbnails/')}/${episode.id}.jpg`;
    await fetch(thumbnailUrl).then((res) =>
      res.body.pipe(createWriteStream(thumbnailPath))
    );

    await this.click('xpath///a[text()=\'Add Artwork\']');
    try {
      const fileSelector = 'input[name=\'file\']';
      const elementHandle = await this.find(fileSelector);
      await elementHandle[0].uploadFile(thumbnailPath);
      await setTimeout(3000);
      await this.click('xpath///button[text()=\'Continue\']');
      await this.find(`xpath///*[contains(text(),"${episode.title()}")]`);
      log('Successfully uploaded image', true);
    } catch (e) {
      log(e);
      // await this.takeScreenshot();
      log('Failed image upload');
    }
  }

  async addEpisode(): Promise<void> {
    try {
      await this.openSeriesSeasonPage();
    } catch (_e) {
      await this.addSeriesSeason();
      await this.openSeriesSeasonPage();
    }
    const episodeTextIdentifier = await this.getEpisodeIdentifier();
    if (episodeTextIdentifier.length == 0) {
      await delay(500);
      const episode = this.video.youtubeVideo;
      log(`Starting adding of ${episode.title()}`);
      await this.openAddEpisodePage();
      await this.addInitialEpisode();
      try {
        const addEpisodeSelector = 'xpath///*[contains(text(),"Whoops, looks like something went wrong")]';
        await this.find(addEpisodeSelector);
        try {
          await this.openEditEpisodePage();
        } catch (e) {
          log(e);
        }
        // eslint-disable-next-line no-empty
      } catch (_e) { }
      await this.updateEpisode();

      try {
        await this.uploadEpisodeThumbnail();
      } catch (e) {
        log(`sigh looks like they blocked images for ${this.video.tvdbSeries.name} (${e})`);
      }
      log(`Finished adding of ${episode.title()}`);
    }
  }

  async backfillEpisode(): Promise<void> {
    await this.openEditEpisodePage();
    await this.updateEpisode();
  }
}

