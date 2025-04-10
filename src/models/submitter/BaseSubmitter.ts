import { mkdirSync } from 'fs';
import path from 'path';

import puppeteer from 'puppeteer-extra';
import AdblockerPlugin from 'puppeteer-extra-plugin-adblocker';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';
import { Browser, ElementHandle, Page } from 'puppeteer';

import { click, find, type, loaded, goto, submitForm, getValue } from '@sonarrTube/helpers/Puppeteer.js';
import { log } from '@sonarrTube/helpers/Log.js';
import { ActionableVideo } from '@sonarrTube/models/api/ActionableVideo.js';
import { TVDBConfig } from '@sonarrTube/types/config/TVDBConfig.js';
import { currentFileTimestamp } from '@sonarrTube/helpers/Generic.js';
import { Constants } from '@sonarrTube/types/config/Constants.js';
import { notify } from '@sonarrTube/helpers/Notifications.js';
import { ActionableSeries } from '@sonarrTube/models/api/ActionableSeries.js';
import { Video } from '@sonarrTube/types/youtube/Video';
import { Episode as TvdbEpisodeType } from '@sonarrTube/types/tvdb/Episode.js';

puppeteer.use(AdblockerPlugin()).use(StealthPlugin());

export class BaseSubmitter {
  browserObj: Browser | undefined;
  pageObj: Page | undefined;
  username: string;
  email: string;
  password: string;
  videoObj: ActionableVideo | undefined;
  updates: string[];
  downloads: string[];
  warnings: string[];
  errors: string[];
  errorFolder: string;

  constructor(tvdbConfig: TVDBConfig) {
    this.username = tvdbConfig.username;
    this.password = tvdbConfig.password;
    this.email = tvdbConfig.email;
    this.updates = [];
    this.downloads = [];
    this.warnings = [];
    this.errors = [];
    this.errorFolder = path.join(process.cwd(), 'tmp', 'screenshots');
    mkdirSync(this.errorFolder, { recursive: true });
  }

  page = (): Page => {
    if (!this.pageObj) {
      throw new Error('Page not initialized');
    }

    return this.pageObj;
  };


  init = async (): Promise<void> => {
    this.browserObj ||= await puppeteer.launch({
      headless: true,
      args: [
        // Required for Docker version of Puppeteer
        '--no-sandbox',
        '--disable-setuid-sandbox',
        // This will write shared memory files into /tmp instead of /dev/shm,
        // because Docker’s default for /dev/shm is 64MB
        '--disable-dev-shm-usage',
      ],
    });

    const browserVersion = await this._browser().version();
    log(`Started ${browserVersion}`);
    this.pageObj ||= await this._browser().newPage();
  };


  finish = async (isError: boolean = false): Promise<void> => {
    if (!this.browserObj) {
      return;
    }
    if (isError) {
      await this._takeScreenshot();
      // await this._saveHtml();
    }
    await this._browser().close();
    log('Finished');
  };

  handleReports = async (actionableSeries: ActionableSeries): Promise<void> => {
    await notify(`Summary for ${actionableSeries.videos[0].seriesName()};`);

    if (this.downloads.length > 0) {
      log(Constants.SEPARATOR);
      //  TODO: maybe we just make these the fancy ones?
      await notify(`Downloads:\n${this.downloads.join('\n')}`);
    }

    if (this.updates.length > 0) {
      log(Constants.SEPARATOR);
      await notify(`Updates:\n${this.updates.join('\n')}`);
    }

    const warnings = actionableSeries.warnings.concat(this.warnings);
    if (warnings.length > 0) {
      log(Constants.SEPARATOR);
      await notify(`Warnings:\n${warnings.join('\n')}`);
    }

    if (this.errors.length > 0) {
      log(Constants.SEPARATOR);
      await notify(`Errors:\n${this.errors.join('\n')}`);
    }

    log(Constants.SEPARATOR);

    this.updates = [];
    this.downloads = [];
    this.warnings = [];
    this.errors = [];
  };

  // PROTECTED/PRIVATE
  _browser = (): Browser => {
    if (!this.browserObj) {
      throw new Error('Browser not initialized');
    }

    return this.browserObj;
  };

  _video = (): ActionableVideo => {
    if (!this.videoObj) {
      throw new Error('Video not initialized');
    }

    return this.videoObj;
  };

  _currentSeason = (): number => {
    const season = this._video().season();
    if (typeof season !== 'number') {
      throw new Error('Missing season this shouldn\'t happen!');
    }

    return season;
  };

  _currentYoutubeVideo = (): Video => {
    const youtubeVideo = this._video().youtubeVideo;

    if (!youtubeVideo) {
      throw new Error('Missing youtubeVideo this shouldn\'t happen!');
    }

    return youtubeVideo;
  };

  _currentTvdbEpisode = (): TvdbEpisodeType => {
    const tvdbEpisode = this._video().tvdbEpisode;

    if (!tvdbEpisode) {
      throw new Error('Missing tvdbEpisode this shouldn\'t happen!');
    }

    return tvdbEpisode;
  };

  // _saveHtml = async (): Promise<void> => {
  //   try {
  //     const html = await this.page().content();
  //     const filename = `${this.errorFolder}/html-${currentFileTimestamp()}-${this.constructor.name}`;
  //     const htmlPath = `${filename}.html`;
  //     writeFileSync(htmlPath, html);
  //     log(`html can be found at ${htmlPath}`);
  //   } catch (e) {
  //     log(`failed to save html: ${e}`);
  //   }
  // };

  _takeScreenshot = async (): Promise<void> => {
    const filename = `${this.errorFolder}/screen-${currentFileTimestamp()}-${this.constructor.name}`;
    const screenshotPath = `${filename}.png`;
    try {
      await this.page().screenshot({
        path: screenshotPath,
        fullPage: true,
      });
      log(`screen shot can be found at ${screenshotPath}`);
    } catch (e) {
      /* istanbul ignore next */
      // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
      log(`failed to save screenshot: ${e}`);
    }
  };

  _submitForm = async (selector: string): Promise<void> => {
    await submitForm(this.page(), selector);
  };

  _getValue = async (
    selector: string
  ): Promise<string> => await getValue(this.page(), selector);

  _type = async (
    selector: string, value: string, simulate: boolean = true
  ): Promise<void> => await type(this.page(), selector, value, simulate);

  _find = async (selector: string): Promise<ElementHandle<Element> | null> =>
    await find(this.page(), selector);

  _click = async (selector: string): Promise<void> => await click(this.page(), selector);

  _loaded = async (): Promise<void> => {
    await loaded(this.page());
  };

  _goto = async (url: string): Promise<void> => {
    await goto(this.page(), url);
  };
}

