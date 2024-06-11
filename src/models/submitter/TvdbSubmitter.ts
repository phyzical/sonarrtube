import { delay, click, find, type, loaded, goto, submitForm } from '../../helpers/Puppeteer.js';
import { log } from '../../helpers/Log.js';
import { setTimeout } from 'node:timers/promises';
import { createWriteStream, writeFileSync } from 'node:fs';
import fetch from 'node-fetch';
import { cachePath } from '../../helpers/Cache.js';
import { ActionableVideo } from '../api/ActionableVideo.js';
import puppeteer, { Browser, Page } from 'puppeteer';
import { TVDBConfig } from '../../types/config/TVDBConfig.js';
import { ShowSubmitter } from '../../ShowSubmitter.js';
import { currentFileTimestamp } from '../../helpers/Generic.js';

export class TvdbSubmitter {
  browser: Browser;
  page: Page;
  username: string;
  email: string;
  password: string;
  video: ActionableVideo;

  constructor(tvdbConfig: TVDBConfig) {
    this.username = tvdbConfig.username;
    this.password = tvdbConfig.password;
    this.email = tvdbConfig.email;
  }

  #baseURL = 'https://thetvdb.com';
  capitalChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZÀÁÂÃÄÇÈÉÊËÌÍÎÏÑÒÓÔÕÖŠÚÛÜÙÝŸŽ';

  cleanTextContainsXpath(text: string): string {
    // Remove following chars from filename and document contexts ?'/|-*: \ And lowercase all chars to increase matching
    return 'contains(translate(translate(translate(text(),\'\\`~!@#$%^&*()-_=+[]{}|;:<>",./?, \',\'\'), "\'", \'\'),' +
      `'${this.capitalChars}', '${this.capitalChars.toLowerCase()}') , '${this.cleanText(text)}')`;
  }

  cleanText(text: string): string {
    // eslint-disable-next-line no-useless-escape
    return text.toLowerCase().replace(/[- '`~!@#$%^&*()_|+=?;:'",\.<>\{\}\[\]\\\/]/gi, '');
  }

  getEpisodeXpath(episodeTitle: string): string {
    return `xpath///tr[.//a[${this.cleanTextContainsXpath(episodeTitle)}]]/td`;
  }

  getSeriesXpath(seriesTitle: string): string {
    return `xpath///*[${this.cleanTextContainsXpath(seriesTitle)}]`;
  }

  async getEpisodeIdentifier(): Promise<string> {
    const episodeTitle = this.video.youtubeVideo.title();
    log(`Looking for episode for ${episodeTitle}`, true);
    const episodeTextElement = await find(this.page, this.getEpisodeXpath(episodeTitle));
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
    await goto(this.page, [this.#baseURL, 'auth', 'login'].join('/'));
    const loginFormSelector = 'form[action="/auth/login"]';
    await find(this.page, loginFormSelector);
    await type(this.page, '[name="email"]', this.email);
    await type(this.page, '[name="password"]', this.password);
    await submitForm(this.page, loginFormSelector);
    await loaded(this.page);
    await goto(this.page, [this.#baseURL, 'dashboard'].join('/'));
    await find(this.page, `xpath///*[contains(text(),"${this.email}")]`);
    await goto(this.page, [this.#baseURL].join('/'));
    log('finishing login', true);
  }

  async openSeriesSeasonPage(): Promise<void> {
    const season = this.video.season();
    const series = this.video.tvdbSeries.slug;
    const showSeasonURL = [this.#baseURL, 'series', series, 'seasons', 'official', season].join('/');
    log(`opening ${showSeasonURL}`, true);
    await goto(this.page, showSeasonURL);
    let seasonSelector = `xpath///*[contains(text(), "Season ${season}")]`;
    if (season == 0) { seasonSelector = 'xpath///*[contains(text(), "Specials")]'; }

    await find(this.page, seasonSelector);
    log(`opened ${showSeasonURL}`, true);
  }

  async addSeriesSeason(): Promise<void> {
    const season = this.video.season();
    const series = this.video.tvdbSeries.slug;
    log(`Adding ${series} - ${season}`, true);
    await this.openSeriesPage();
    await click(this.page, 'xpath///a[text()="Seasons"]');
    await delay(1500);
    await click(this.page, 'xpath///button[@title="Add Season"]');
    await type(this.page, '[name="season_number"]', season.toString());
    await click(this.page, 'xpath///button[text()="Add Season"]');
    await find(this.page, `xpath///*[contains(text(), "Season ${season}")]`);
    log(`Added ${series} - ${season}`, true);
  }

  async openSeriesPage(): Promise<void> {
    const series = this.video.tvdbSeries.slug;
    const showSeriesURL = [this.#baseURL, 'series', series].join('/');
    log(`opening ${showSeriesURL}`, true);
    await goto(this.page, showSeriesURL);
    await find(this.page, this.getSeriesXpath(series));
    log(`opened ${showSeriesURL}`, true);
  }

  async openEditEpisodePage(): Promise<void> {
    const episodeTitle = this.video.youtubeVideo.title();
    const series = this.video.tvdbSeries.slug;
    log(`opening editEpisodePage ${episodeTitle}`, true);
    if (!this.video.missingFromTvdb()) {
      const showSeriesURL = [
        this.#baseURL, 'series', series, 'episodes', this.video.tvdbEpisode.id, '0', 'edit'
      ].join('/');
      log(`opening ${showSeriesURL}`, true);
      await goto(this.page, showSeriesURL);
      await find(this.page, `xpath///*[contains(text(), "Episode ${this.video.tvdbEpisode.number}")]`);
      await find(this.page, `xpath///*[contains(text(), "Season ${this.video.tvdbEpisode.seasonNumber}")]`);
    } else {
      await delay(500);
      await this.openSeriesSeasonPage();
      await click(this.page, this.getEpisodeXpath(episodeTitle));
      await click(this.page, 'xpath///*[contains(text(),"Edit Episode")]');
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
    log('opening addEpisodePage', true);
    await this.openSeriesSeasonPage();
    await click(this.page, 'xpath///*[contains(text(),"Add Episode")]');
    log('opened addEpisodePage', true);
  }

  private async addInitialEpisode(): Promise<void> {
    const episode = this.video.youtubeVideo;
    log('starting adding', true);
    const addEpisodeFormSelector = 'xpath///h3[text()=\'Episodes\']/ancestor::form';
    await find(this.page, addEpisodeFormSelector);
    await delay(500);
    await type(this.page, '[name="name"]', episode.title());
    await type(this.page, '[name="overview"]', episode.description());
    await type(this.page, '[name="runtime"]', episode.runTime());
    await type(this.page, '[name="date"]', episode.airedDate());
    await delay(500);
    await click(this.page, addEpisodeFormSelector);
    log('finished adding', true);
  }

  private async updateEpisode(): Promise<void> {
    const video = this.video.youtubeVideo;
    const episode = this.video.tvdbEpisode;
    log('updating episode', true);
    await find(this.page, 'form.episode-edit-form');
    await delay(500);
    await type(this.page, '[name="productioncode"]', video.id);
    await delay(500);
    await click(this.page, 'xpath///button[text()=\'Save\']');
    try {
      await find(this.page, `xpath///*[contains(text(),"${video.title()}")]`);
    } catch (e) {
      //  fall back to tvdb title if it exists
      if (episode.name) {
        await find(this.page, `xpath///*[contains(text(),"${episode.name}")]`);
      } else {
        throw e;
      }
    }
    log('updated episode', true);
  }

  private async uploadEpisodeThumbnail(): Promise<void> {
    const episode = this.video.youtubeVideo;
    log('Starting image upload', true);
    const thumbnailUrl = episode.thumbnail;
    const thumbnailPath = `${cachePath('thumbnails/')}/${episode.id}.jpg`;
    await fetch(thumbnailUrl).then((res) =>
      res.body.pipe(createWriteStream(thumbnailPath))
    );

    await click(this.page, 'xpath///a[text()=\'Add Artwork\']');
    try {
      const fileSelector = 'input[name=\'file\']';
      const elementHandle = await find(this.page, fileSelector);
      await elementHandle[0].uploadFile(thumbnailPath);
      await setTimeout(3000);
      await click(this.page, 'xpath///button[text()=\'Continue\']');
      await find(this.page, `xpath///*[contains(text(),"${episode.title()}")]`);
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
        await find(this.page, addEpisodeSelector);
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

  async init(): Promise<void> {
    this.browser = await puppeteer.launch({
      args: [
        // Required for Docker version of Puppeteer
        '--no-sandbox',
        '--disable-setuid-sandbox',
        // This will write shared memory files into /tmp instead of /dev/shm,
        // because Docker’s default for /dev/shm is 64MB
        '--disable-dev-shm-usage',
      ],
    });

    const browserVersion = await this.browser.version();
    log(`Started ${browserVersion}`);
    this.page = await this.browser.newPage();
  }

  async finish(saveScreenshot: boolean = false): Promise<void> {
    if (saveScreenshot) {
      await this.takeScreenshot();
      await this.saveHtml();
    }
    await this.browser.close();
  }

  async saveHtml(): Promise<void> {
    try {
      const html = await this.page.content();
      const filename = `${ShowSubmitter.folder}/html-${currentFileTimestamp()}-${this.constructor.name}`;
      const htmlPath = `${filename}.html`;
      writeFileSync(htmlPath, html);
      log(`html can be found at ${htmlPath}`);
    } catch (e) {
      log(`failed to save html: ${e}`);
    }
  }

  async takeScreenshot(): Promise<void> {
    const filename = `${ShowSubmitter.folder}/screen-${currentFileTimestamp()}-${this.constructor.name}`;
    const screenshotPath = `${filename}.png`;
    try {
      await this.page.screenshot({
        path: screenshotPath,
        fullPage: true,
      });
      log(`screen shot can be found at ${screenshotPath}`);
    } catch (e) {
      log(`failed to save screenshot: ${e}`);
    }
  }
}

