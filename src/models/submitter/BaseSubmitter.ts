import fs from "fs";
import puppeteer, { Browser, Page } from "puppeteer";

import { Episode } from "../Episode.js";
import { GenericSubmitterInterface } from "../../interfaces/submitter/GenericSubmitterInterface.js";
import { ShowSubmitter } from "../../ShowSubmitter.js";
import { log } from "../../helpers/LogHelper.js";
import { currentFileTimestamp } from "../../helpers/GenericHelper.js";

class BaseSubmitter implements GenericSubmitterInterface {
  browser: Browser;
  page: Page;
  username: string;
  email: string;
  password: string;

  constructor(username: string, password: string, email: string) {
    this.username = username;
    this.password = password;
    this.email = email;
  }

  doLogin(): Promise<void> {
    throw new Error("Method not implemented.");
  }

  openSeriesSeasonPage(series: string, season: string): Promise<void> {
    throw new Error("Method not implemented.");
  }

  addSeriesSeason(series: string, season: string): Promise<void> {
    throw new Error("Method not implemented.");
  }

  openSeriesPage(series: string): Promise<void> {
    throw new Error("Method not implemented.");
  }

  addEpisode(episode: Episode, series: string, season: string): Promise<void> {
    throw new Error("Method not implemented.");
  }

  getEpisodeIdentifier(episodeTitle: string): Promise<string> {
    throw new Error("Method not implemented.");
  }

  async init(): Promise<void> {
    this.browser = await puppeteer.launch({
      args: [
        // Required for Docker version of Puppeteer
        "--no-sandbox",
        "--disable-setuid-sandbox",
        // This will write shared memory files into /tmp instead of /dev/shm,
        // because Docker’s default for /dev/shm is 64MB
        "--disable-dev-shm-usage",
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
      const filename = `${
        ShowSubmitter.folder
      }/html-${currentFileTimestamp()}-${this.constructor.name}`;
      const htmlPath = `${filename}.html`;
      fs.writeFileSync(htmlPath, html);
      log(`html can be found at ${htmlPath}`);
    } catch (e) {
      log(`failed to save html: ${e}`);
    }
  }

  async takeScreenshot(): Promise<void> {
    const filename = `${
      ShowSubmitter.folder
    }/screen-${currentFileTimestamp()}-${this.constructor.name}`;
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

export { BaseSubmitter };
