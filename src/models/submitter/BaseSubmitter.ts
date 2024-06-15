import { click, find, type, loaded, goto, submitForm } from '../../helpers/Puppeteer.js';
import { log } from '../../helpers/Log.js';
import { ActionableVideo } from '../api/ActionableVideo.js';
import puppeteer, { Browser, ElementHandle, Page } from 'puppeteer';
import { TVDBConfig } from '../../types/config/TVDBConfig.js';
import { ShowSubmitter } from '../../ShowSubmitter.js';
import { currentFileTimestamp } from '../../helpers/Generic.js';
import { writeFileSync } from 'fs';

export class BaseSubmitter {
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




  async type(selector: string, value: string, clearText: boolean = true): Promise<void> {
    return await type(this.page, selector, value, clearText);
  }

  async find(selector: string): Promise<ElementHandle<Element>> {
    return await find(this.page, selector);
  }

  async click(selector: string, options = {}): Promise<void> {
    return await click(this.page, selector, options);
  }

  async loaded(): Promise<void> {
    await loaded(this.page);
  }

  async goto(url: string): Promise<void> {
    await goto(this.page, url);
  }

  async submitForm(selector: string): Promise<void> {
    await submitForm(this.page, selector);
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

