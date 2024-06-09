import { BaseSubmitter } from './BaseSubmitter.js';
import { Episode } from '../Episode.js';
import { setHtmlInput, submitHtmlForm, clickHtmlElement, delay } from '../../helpers/Puppeteer.js';
import { log } from '../../helpers/Log.js';
import { setTimeout } from 'node:timers/promises';

class TvdbSubmitter extends BaseSubmitter {
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

  async getEpisodeIdentifier(episodeTitle: string): Promise<string> {
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

  async openSeriesSeasonPage(series: string, season: string): Promise<void> {
    const seasonClean = season.split(' ')[1];
    const showSeasonURL = [this.#baseURL, 'series', series, 'seasons', 'official', seasonClean].join('/');
    log(`opening ${showSeasonURL}`, true);
    await this.page.goto(showSeasonURL);
    let seasonSelector = `xpath///*[contains(text(), "Season ${seasonClean}")]`;
    if (seasonClean == '0') { seasonSelector = 'xpath///*[contains(text(), "Specials")]'; }

    await this.page.waitForSelector(seasonSelector);
    log(`opened ${showSeasonURL}`, true);
  }

  async addSeriesSeason(series: string, season: string): Promise<void> {
    const seasonClean = season.split(' ')[1];
    log(`Adding ${series} - ${seasonClean}`, true);

    await this.openSeriesPage(series);

    const openSeasonsButton = await this.page.waitForSelector('xpath///a[text()="Seasons"]');
    await openSeasonsButton[0].click();

    await delay(1500);
    const addSeasonButton = await this.page.waitForSelector('xpath///button[@title="Add Season"]');
    await addSeasonButton[0].click();

    await this.page.$eval('[name="season_number"]', setHtmlInput, seasonClean);

    const saveSeasonsButton = await this.page.waitForSelector('xpath///button[text()="Add Season"]');
    await saveSeasonsButton[0].click();

    await this.page.waitForSelector(`xpath///*[contains(text(), "Season ${seasonClean}")]`);

    log(`Added ${series} - ${seasonClean}`, true);
  }

  async openSeriesPage(series: string): Promise<void> {
    const showSeriesURL = [this.#baseURL, 'series', series].join('/');
    log(`opening ${showSeriesURL}`, true);
    await this.page.goto(showSeriesURL);
    await this.page.waitForSelector(this.getSeriesXpath(series));
    log(`opened ${showSeriesURL}`, true);
  }

  private async openAddEpisodePage(series: string, season: string): Promise<void> {
    log('opening addEpisodePage', true);
    await this.openSeriesSeasonPage(series, season);
    const addEpisodeSelector = 'xpath///*[contains(text(),"Add Episode")]';
    await this.page.waitForSelector(addEpisodeSelector, { visible: true });
    const addEpisodeButton = await this.page.waitForSelector(addEpisodeSelector);
    await addEpisodeButton[0].click();
    log('opened addEpisodePage', true);
  }

  private async openEditEpisodePage(series: string, season: string, episode: Episode): Promise<void> {
    const episodeTitle = episode.title();
    log(`opening editEpisodePage ${episodeTitle}`, true);
    await delay(500);
    await this.openSeriesSeasonPage(series, season);
    const episodeLink = await this.page.waitForSelector(this.getEpisodeXpath(episode.title()));
    await episodeLink[0].click();
    const editEpisodeButtonSelector = 'xpath///*[contains(text(),"Edit Episode")]';
    const editEpisodeButton = await this.page.waitForSelector(editEpisodeButtonSelector);
    await editEpisodeButton[0].click();
    log(`opened editEpisodePage ${episodeTitle}`, true);
  }

  private async addInitialEpisode(episode: Episode): Promise<void> {
    const infoJson = episode.information();
    log('starting adding', true);
    const addEpisodeFormSelector = 'xpath///h3[text()=\'Episodes\']/ancestor::form';
    await this.page.waitForSelector(addEpisodeFormSelector);
    await delay(500);
    await this.page.$eval('[name="name[]"]', setHtmlInput, episode.title());
    await this.page.$eval('[name="overview[]"]', setHtmlInput, infoJson.description());
    await this.page.$eval('[name="runtime[]"]', setHtmlInput, infoJson.runTime());
    await this.page.$eval('[name="date[]"]', setHtmlInput, infoJson.airedDate());
    await delay(500);
    const addEpisodeFormElement = await this.page.waitForSelector(addEpisodeFormSelector);
    await this.page.evaluate(submitHtmlForm, addEpisodeFormElement[0]);
    log('finished adding', true);
  }

  private async updateEpisode(episode: Episode): Promise<void> {
    const infoJson = episode.information();
    log('updating episode', true);
    const editEpisodeFormSelector = 'form.episode-edit-form';
    await this.page.waitForSelector(editEpisodeFormSelector);
    await delay(500);
    await this.page.$eval('[name=productioncode]', setHtmlInput, infoJson.url());
    await delay(500);
    const saveButtonSelector = 'xpath///button[text()=\'Save\']';
    await this.page.waitForSelector(saveButtonSelector);
    const saveButton = await this.page.waitForSelector(saveButtonSelector);
    await this.page.evaluate(clickHtmlElement, saveButton[0]);

    const episodeAddedSuccessfully = `xpath///*[contains(text(),"${episode.title()}")]`;
    await this.page.waitForSelector(episodeAddedSuccessfully);
    log('updated episode', true);
  }

  private async uploadEpisodeThumbnail(episode: Episode): Promise<void> {
    log('Starting image upload', true);
    const thumbnailPath = episode.thumbnailFilePath();
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

  async addEpisode(episode: Episode, series: string, season: string): Promise<void> {
    log(`Starting adding of ${episode.name}`);
    await this.openAddEpisodePage(series, season);
    await this.addInitialEpisode(episode);
    try {
      const addEpisodeSelector = 'xpath///*[contains(text(),"Whoops, looks like something went wrong")]';
      await this.page.waitForSelector(addEpisodeSelector);
      try {
        await this.openEditEpisodePage(series, season, episode);
      } catch (e) {
        log(e);
      }
      // eslint-disable-next-line no-empty
    } catch (_e) { }
    await this.updateEpisode(episode);

    try {
      await this.uploadEpisodeThumbnail(episode);
    } catch (e) {
      log(`sigh looks like they blocked images for ${series} (${e})`);
    }
    log(`Finished adding of ${episode.name}`);
  }
}

export { TvdbSubmitter };
