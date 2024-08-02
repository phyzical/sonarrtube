import { setTimeout } from 'node:timers/promises';
import { unlinkSync } from 'node:fs';

import { ElementHandle } from 'puppeteer';

import { log } from '@sonarrTube/helpers/Log.js';
import { cleanTextContainsXpath, delay } from '@sonarrTube/helpers/Puppeteer.js';
import { processThumbnail } from '@sonarrTube/helpers/Thumbnails.js';
import { Constants } from '@sonarrTube/types/config/Constants.js';
import { BaseSubmitter } from '@sonarrTube/models/submitter/BaseSubmitter.js';

export class TvdbSubmitter extends BaseSubmitter {
  imageUploadsDisabled: boolean = false;

  getEpisodeXpath = (episodeTitle: string): string => `xpath///tr[.//a[${cleanTextContainsXpath(episodeTitle)}]]/td`;

  getSeriesXpath = (seriesTitle: string): string => `xpath///*[${cleanTextContainsXpath(seriesTitle)}]`;

  getEpisodeNumber = async (): Promise<string> => {
    const video = this.video().youtubeVideo;
    if (!video) {
      throw new Error('Missing youtubeVideo this shouldn\'t happen!');
    }
    const episodeTitle = video.title();
    let episodeNumber;
    try {
      episodeNumber = (await this.page().$eval(
        this.getEpisodeXpath(episodeTitle), element => element.textContent)
      )?.split('E')[1];
      if (!episodeNumber) {
        throw new Error('No episode number found');
      }
      log(`Found episode for ${episodeTitle} (${episodeNumber})`, true);
    } catch (_e) {
      log(`Didn't find episode for ${episodeTitle}`, true);
    }

    return episodeNumber;
  };

  doLogin = async (): Promise<void> => {
    log('starting login', true);
    await this.goto([Constants.TVDB.HOST, 'auth', 'login'].join('/'));
    const loginFormSelector = 'form[action="/auth/login"]';
    await this.find(loginFormSelector);
    await this.type('[name="email"]', this.email);
    await this.type('[name="password"]', this.password);
    await this.submitForm(loginFormSelector);
    await this.goto([Constants.TVDB.HOST, 'dashboard'].join('/'));
    await this.find(`xpath///*[contains(text(),"${this.email}")]`);
    await this.goto([Constants.TVDB.HOST].join('/'));
    log('finishing login', true);
  };

  openSeriesSeasonPage = async (): Promise<void> => {
    const season = this.video().season();
    if (!season) {
      throw new Error('Missing season this shouldn\'t happen!');
    }
    const series = this.video().tvdbSeries.slug;
    const showSeasonURL = [Constants.TVDB.HOST, 'series', series, 'seasons', 'official', season].join('/');
    await this.goto(showSeasonURL);
    let seasonSelector = `xpath///*[contains(text(), "Season ${season}")]`;
    if (season == 0) { seasonSelector = 'xpath///*[contains(text(), "Specials")]'; }

    await this.find(seasonSelector);
    log(`opened ${showSeasonURL}`, true);
  };

  addSeriesSeason = async (): Promise<void> => {
    const season = this.video().season();
    if (!season) {
      throw new Error('Missing season this shouldn\'t happen!');
    }
    const series = this.video().tvdbSeries.slug;
    log(`Adding ${series} - ${season}`, true);
    await this.openSeriesPage();
    await this.click('xpath///a[text()="Seasons"]');
    await delay(1500);
    await this.click('xpath///button[@title="Add Season"]');
    await this.type('[name="season_number"]', season.toString());
    await this.click('xpath///button[text()="Add Season"]');
    await this.find(`xpath///*[contains(text(), "Season ${season}")]`);
    log(`Added ${series} - ${season}`, true);
  };

  openSeriesPage = async (): Promise<void> => {
    const series = this.video().tvdbSeries.slug;
    const showSeriesURL = [Constants.TVDB.HOST, 'series', series].join('/');
    await this.goto(showSeriesURL);
    await this.find(this.getSeriesXpath(series));
    log(`opened ${showSeriesURL}`, true);
  };

  openEpisodePage = async (edit: boolean = true): Promise<void> => {
    const youtubeVideo = this.video().youtubeVideo;
    const tvdbEpisode = this.video().tvdbEpisode;

    if (!youtubeVideo) {
      throw new Error('Missing youtubeVideo this shouldn\'t happen!');
    }
    if (!tvdbEpisode) {
      throw new Error('Missing tvdbEpisode this shouldn\'t happen!');
    }
    const episodeTitle = youtubeVideo.title();
    const series = this.video().tvdbSeries.slug;
    const editEpisodeXpath = 'xpath///*[contains(text(),"Edit Episode")]';
    if (!this.video().missingFromTvdb()) {
      const showSeriesURL = [
        Constants.TVDB.HOST, 'series', series, 'episodes', tvdbEpisode.id,
      ].concat(edit ? ['0', 'edit'] : []).join('/');
      await this.goto(showSeriesURL);

      if (edit) {
        await this.find(`xpath///*[contains(text(), "Episode ${tvdbEpisode.number}")]`);
      } else {
        await this.find(editEpisodeXpath);
      }

      await this.find(`xpath///*[contains(text(), "Season ${tvdbEpisode.seasonNumber}")]`);

    } else {
      await delay(500);
      await this.openSeriesSeasonPage();
      await this.click(this.getEpisodeXpath(episodeTitle));
      await this.click(editEpisodeXpath);
    }
    log(`opened EpisodePage ${episodeTitle}`, true);
  };

  verifyAddedEpisode = async (): Promise<string> => {
    const youtubeVideo = this.video().youtubeVideo;

    if (!youtubeVideo) {
      throw new Error('Missing youtubeVideo this shouldn\'t happen!');
    }
    await this.openSeriesSeasonPage();
    const episodeTextIdentifier = await this.getEpisodeNumber();
    // if we cant find it on a source something went wrong
    if (episodeTextIdentifier.length == 0) {
      throw new Error(`Didnt add episode for ${youtubeVideo.title()} something went horribly wrong!`);
    }

    return episodeTextIdentifier;
  };

  private openAddEpisodePage = async (): Promise<void> => {
    await this.openSeriesSeasonPage();
    await this.click('xpath///*[contains(text(),"Add Episode")]');
    log('opened addEpisodePage', true);
  };

  private addInitialEpisode = async (): Promise<void> => {
    const youtubeVideo = this.video().youtubeVideo;

    if (!youtubeVideo) {
      throw new Error('Missing youtubeVideo this shouldn\'t happen!');
    }
    log('starting adding', true);
    await this.find('xpath///h3[text()=\'Episodes\']/ancestor::form');
    await delay(500);
    await this.type('[name="name[]"]', youtubeVideo.title());
    await this.type('[name="overview[]"]', youtubeVideo.description());
    await this.type('[name="runtime[]"]', youtubeVideo.runTime());
    await this.type('[name="date[]"]', youtubeVideo.airedDate(), false);
    await delay(500);
    await this.click('xpath///button[text()=\'Add Episodes\']');
    log('finished adding', true);
  };

  private updateEpisode = async (): Promise<void> => {
    const youtubeVideo = this.video().youtubeVideo;

    if (!youtubeVideo) {
      throw new Error('Missing youtubeVideo this shouldn\'t happen!');
    }
    log('updating episode', true);
    await this.find('form.episode-edit-form');
    await delay(500);
    await this.type('[name="productioncode"]', youtubeVideo.id);
    await delay(500);
    await this.click('xpath///button[text()=\'Save\']');
    await this.checkForEpisode();
    log('updated episode', true);
  };

  private checkForEpisode = async (): Promise<void> => {
    const youtubeVideo = this.video().youtubeVideo;
    const tvdbEpisode = this.video().tvdbEpisode;

    if (!youtubeVideo) {
      throw new Error('Missing youtubeVideo this shouldn\'t happen!');
    }
    if (!tvdbEpisode) {
      throw new Error('Missing tvdbEpisode this shouldn\'t happen!');
    }

    try {
      await this.find(`xpath///*[contains(text(),"${youtubeVideo.title()}")]`);
    } catch (e) {
      //  fall back to tvdb title if it exists
      if (tvdbEpisode.name) {
        await this.find(`xpath///*[contains(text(),"${tvdbEpisode.name}")]`);
      } else {
        throw e;
      }
    }

  };

  private checkForUploadBan = async (): Promise<void> => {
    if (this.imageUploadsDisabled == null) {
      try {
        if (await this.find(
          'xpath///*[contains(text(), "your account has been temporarily restricted from uploading")]'
        )) {
          this.imageUploadsDisabled = true;
        }
        // eslint-disable-next-line no-empty
      } catch (_e) { }
    }
  };

  private handleCropperTool = async (): Promise<void> => {
    await this.page().evaluate(() => {
      const cropperInstance = window.cropper.cropper;
      const imageData = cropperInstance.getImageData();
      const canvasData = cropperInstance.getCanvasData();

      cropperInstance.setCropBoxData({
        left: canvasData.left,
        top: canvasData.top,
        width: imageData.naturalWidth,
        height: imageData.naturalHeight
      });
    });
  };

  private uploadEpisodeThumbnail = async (count: number = 0): Promise<string> => {
    if (this.imageUploadsDisabled == true) {
      log('Image uploads disabled, skipping');

      return Constants.THUMBNAIL.FAILED_TEXT;
    }
    const youtubeVideo = this.video().youtubeVideo;

    if (!youtubeVideo) {
      throw new Error('Missing youtubeVideo this shouldn\'t happen!');
    }

    log(`Starting image upload attempt ${count + 1}`, true);
    const thumbnailUrl = youtubeVideo.thumbnail;

    let thumbnailPath;

    try {
      await this.click('xpath///a[text()=\'Add Artwork\']');

      await this.checkForUploadBan();
      if (this.imageUploadsDisabled) {
        log('Image uploads disabled, skipping');

        return Constants.THUMBNAIL.FAILED_TEXT;
      }

      try {
        thumbnailPath = await processThumbnail(thumbnailUrl, youtubeVideo.id, count);
      } catch (_e) {
        try {
          log('Trying again...');
          thumbnailPath = await processThumbnail(thumbnailUrl, youtubeVideo.id, count);
        } catch (__e) {
          log('Trying one more time...');
          thumbnailPath = await processThumbnail(thumbnailUrl, youtubeVideo.id, count);
        }
      }

      if (thumbnailPath) {
        const elementHandle = await this.find('input[name=\'file\']') as ElementHandle<HTMLInputElement>;
        await elementHandle.uploadFile(thumbnailPath);
        await setTimeout(3000);
        await this.click('xpath///button[text()=\'Continue\']');
        await this.loaded();
        await this.handleCropperTool();
        await this.click('xpath///button[text()=\'Finish\']');
        await this.loaded();
        unlinkSync(thumbnailPath);
        await this.find(`xpath///*[contains(text(),"${youtubeVideo.title()}")]`);
        log('Successfully uploaded image');
      }

      return thumbnailPath;
    } catch (e) {
      log((e as Error).toString());
      await this.takeScreenshot();
      log('Failed image upload');

      return Constants.THUMBNAIL.FAILED_TEXT;
    }
  };

  addEpisode = async (): Promise<void> => {
    try {
      await this.openSeriesSeasonPage();
    } catch (_e) {
      await this.addSeriesSeason();
      await this.openSeriesSeasonPage();
    }

    if ((await this.getEpisodeNumber()).length == 0) {
      await delay(500);
      const youtubeVideo = this.video().youtubeVideo;

      if (!youtubeVideo) {
        throw new Error('Missing youtubeVideo this shouldn\'t happen!');
      }
      log('Starting adding of');
      await this.openAddEpisodePage();
      await this.addInitialEpisode();
      try {
        const addEpisodeSelector = 'xpath///*[contains(text(),"Whoops, looks like something went wrong")]';
        await this.find(addEpisodeSelector);
        try {
          await this.openEpisodePage(true);
        } catch (e) {
          log((e as Error).toString());
        }
        // eslint-disable-next-line no-empty
      } catch (_e) { }
      await this.updateEpisode();

      try {
        await this.uploadEpisodeThumbnail();
      } catch (e) {
        log(`sigh looks like they blocked images for ${this.video().tvdbSeries.name} for your user (${e})`);
      }

      log(`Finished adding of ${youtubeVideo.title()}`);
    }
  };

  backfillEpisodeProductionCode = async (): Promise<void> => {
    await this.openEpisodePage(true);
    await this.updateEpisode();
  };

  backfillEpisodeImage = async (): Promise<void> => {
    const backfillAttempts = this.video().thumbnailUploadAttemptCount();
    // then two contrasts attempting to remove text
    // then once more setting no max length of text to 1
    // finally if all else fails just use raw
    if (this.video().thumbnailUploadAttemptCount() < Constants.THUMBNAIL.MAX_ATTEMPTS) {
      await this.openEpisodePage(false);
      const res = await this.uploadEpisodeThumbnail(backfillAttempts);
      if (res != Constants.THUMBNAIL.FAILED_TEXT) {
        this.video().addThumbnailUploadAttempt();
        this.video().clearCache();
      }
    } else {
      log('Skipping image backlog exceeding all automatic text removal attempts');
    }
  };
}

