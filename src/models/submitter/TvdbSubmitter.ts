import { setHtmlInput, submitHtmlForm, clickHtmlElement, delay } from '../../helpers/Puppeteer.js';
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
    const episodeTextElement = await this.page.waitForSelector(this.getEpisodeXpath(episodeTitle));
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

    const loginURL = [this.#baseURL, 'auth', 'login'].join('/');
    await this.page.goto(loginURL);
    const loginFormSelector = 'form[action="/auth/login"]';
    await this.page.waitForSelector(loginFormSelector);
    await this.page.type('[name="email"]', this.email);
    await this.page.type('[name="password"]', this.password);
    await this.page.$eval(loginFormSelector, (form: Element) => (<HTMLFormElement>form).submit());

    const didLogInSelector = 'xpath///*[contains(text(),"Logout")]';
    await this.page.waitForSelector(didLogInSelector);
    log('finishing login', true);
  }

  async openSeriesSeasonPage(): Promise<void> {
    const season = this.video.season();
    const series = this.video.tvdbSeries.slug;
    const showSeasonURL = [this.#baseURL, 'series', series, 'seasons', 'official', season].join('/');
    log(`opening ${showSeasonURL}`, true);
    await this.page.goto(showSeasonURL);
    let seasonSelector = `xpath///*[contains(text(), "Season ${season}")]`;
    if (season == 0) { seasonSelector = 'xpath///*[contains(text(), "Specials")]'; }

    await this.page.waitForSelector(seasonSelector);
    log(`opened ${showSeasonURL}`, true);
  }

  async addSeriesSeason(): Promise<void> {
    const season = this.video.season();
    const series = this.video.tvdbSeries.slug;
    log(`Adding ${series} - ${season}`, true);

    await this.openSeriesPage();

    const openSeasonsButton = await this.page.waitForSelector('xpath///a[text()="Seasons"]');
    await openSeasonsButton[0].click();

    await delay(1500);
    const addSeasonButton = await this.page.waitForSelector('xpath///button[@title="Add Season"]');
    await addSeasonButton[0].click();

    await this.page.$eval('[name="season_number"]', setHtmlInput, season);

    const saveSeasonsButton = await this.page.waitForSelector('xpath///button[text()="Add Season"]');
    await saveSeasonsButton[0].click();

    await this.page.waitForSelector(`xpath///*[contains(text(), "Season ${season}")]`);

    log(`Added ${series} - ${season}`, true);
  }

  async openSeriesPage(): Promise<void> {
    const series = this.video.tvdbSeries.slug;

    const showSeriesURL = [this.#baseURL, 'series', series].join('/');
    log(`opening ${showSeriesURL}`, true);
    await this.page.goto(showSeriesURL);
    await this.page.waitForSelector(this.getSeriesXpath(series));
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
      await this.page.goto(showSeriesURL);
      await this.page.waitForSelector(this.getSeriesXpath(series));
    } else {
      await delay(500);
      await this.openSeriesSeasonPage();
      const episodeLink = await this.page.waitForSelector(this.getEpisodeXpath(episodeTitle));
      await episodeLink[0].click();
      const editEpisodeButtonSelector = 'xpath///*[contains(text(),"Edit Episode")]';
      const editEpisodeButton = await this.page.waitForSelector(editEpisodeButtonSelector);
      await editEpisodeButton[0].click();
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
    const addEpisodeSelector = 'xpath///*[contains(text(),"Add Episode")]';
    await this.page.waitForSelector(addEpisodeSelector, { visible: true });
    const addEpisodeButton = await this.page.waitForSelector(addEpisodeSelector);
    await addEpisodeButton[0].click();
    log('opened addEpisodePage', true);
  }

  private async addInitialEpisode(): Promise<void> {
    const episode = this.video.youtubeVideo;
    log('starting adding', true);
    const addEpisodeFormSelector = 'xpath///h3[text()=\'Episodes\']/ancestor::form';
    await this.page.waitForSelector(addEpisodeFormSelector);
    await delay(500);
    await this.page.$eval('[name="name[]"]', setHtmlInput, episode.title());
    await this.page.$eval('[name="overview[]"]', setHtmlInput, episode.description());
    await this.page.$eval('[name="runtime[]"]', setHtmlInput, episode.runTime());
    await this.page.$eval('[name="date[]"]', setHtmlInput, episode.airedDate());
    await delay(500);
    const addEpisodeFormElement = await this.page.waitForSelector(addEpisodeFormSelector);
    await this.page.evaluate(submitHtmlForm, addEpisodeFormElement[0]);
    log('finished adding', true);
  }

  private async updateEpisode(): Promise<void> {
    const episode = this.video.youtubeVideo;
    log('updating episode', true);
    const editEpisodeFormSelector = 'form.episode-edit-form';
    await this.page.waitForSelector(editEpisodeFormSelector);
    await delay(500);
    await this.page.$eval('[name=productioncode]', setHtmlInput, episode.id);
    await delay(500);
    const saveButtonSelector = 'xpath///button[text()=\'Save\']';
    await this.page.waitForSelector(saveButtonSelector);
    const saveButton = await this.page.waitForSelector(saveButtonSelector);
    await this.page.evaluate(clickHtmlElement, saveButton[0]);

    const episodeAddedSuccessfully = `xpath///*[contains(text(),"${episode.title()}")]`;
    await this.page.waitForSelector(episodeAddedSuccessfully);
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

    const addArtworkSelector = 'xpath///a[text()=\'Add Artwork\']';
    await this.page.waitForSelector(addArtworkSelector);
    const addArtworkButton = await this.page.waitForSelector(addArtworkSelector);
    await this.page.evaluate(clickHtmlElement, addArtworkButton[0]);
    try {
      const fileSelector = 'input[name=\'file\']';
      await this.page.waitForSelector(fileSelector);
      const elementHandle = await this.page.$(fileSelector);
      await elementHandle.uploadFile(thumbnailPath);
      const continueButtonSelector = 'xpath///button[text()=\'Continue\']';
      await this.page.waitForSelector(continueButtonSelector);
      await setTimeout(3000);
      const continueButton = await this.page.waitForSelector(continueButtonSelector);
      await this.page.evaluate(clickHtmlElement, continueButton[0]);

      const thumbnailAddedSelector = `xpath///*[contains(text(),"${episode.title()}")]`;
      await this.page.waitForSelector(thumbnailAddedSelector);
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
        await this.page.waitForSelector(addEpisodeSelector);
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

