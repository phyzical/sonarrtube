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

  //  Need to work out an efficent way to auto mock goto's at the puppeteer level
  doLogin = async (): Promise<void> => {
    log('starting login', true);
    await this._goto([Constants.TVDB.HOST, 'auth', 'login'].join('/'));
    const loginFormSelector = 'form[action="/auth/login"]';
    await this._find(loginFormSelector);
    await this._type('[name="email"]', this.email);
    await this._type('[name="password"]', this.password);
    await this._submitForm(loginFormSelector);
    await this._goto([Constants.TVDB.HOST, 'dashboard'].join('/'));
    await this._find(`xpath///*[contains(text(),"${this.email}")]`);
    await this._goto([Constants.TVDB.HOST].join('/'));
    log('finishing login', true);
  };

  verifyAddedEpisode = async (): Promise<string> => {
    const youtubeVideo = this._currentYoutubeVideo();
    await this._openSeriesSeasonPage();
    const episodeTextIdentifier = await this._getEpisodeNumber();
    // if we cant find it on a source something went wrong
    if (episodeTextIdentifier.length == 0) {
      throw new Error(`Didnt add episode for ${youtubeVideo.cleanTitle()} something went horribly wrong!`);
    }

    return episodeTextIdentifier;
  };

  addEpisode = async (): Promise<void> => {
    try {
      await this._openSeriesSeasonPage();
    } catch (_e) {
      await this._addSeriesSeason();
      await this._openSeriesSeasonPage();
    }

    if ((await this._getEpisodeNumber()).length == 0) {
      await delay(500);
      const youtubeVideo = this._currentYoutubeVideo();
      log('Starting adding of');
      await this._openAddEpisodePage();
      await this._addInitialEpisode();
      try {
        const addEpisodeSelector = 'xpath///*[contains(text(),"Whoops, looks like something went wrong")]';
        await this._find(addEpisodeSelector);
        try {
          await this._openEpisodePage(true);
        } catch (e) {
          log((e as Error).toString());
        }
        // eslint-disable-next-line no-empty
      } catch (_e) { }
      await this._updateEpisode();

      try {
        await this._uploadEpisodeThumbnail();
      } catch (e) {
        log(`sigh looks like they blocked images for ${this._video().tvdbSeries.name} for your user (${e})`);
      }

      log(`Finished adding of ${youtubeVideo.cleanTitle()}`);
    }
  };

  backfillEpisodeProductionCode = async (): Promise<void> => {
    await this._openEpisodePage(true);
    await this._updateEpisode();
  };

  backfillEpisodeImage = async (): Promise<void> => {
    const backfillAttempts = this._video().thumbnailUploadAttemptCount();
    // then two contrasts attempting to remove text
    // then once more setting no max length of text to 1
    // finally if all else fails just use raw
    if (backfillAttempts < Constants.THUMBNAIL.MAX_ATTEMPTS) {
      await this._openEpisodePage(false);
      const res = await this._uploadEpisodeThumbnail(backfillAttempts);
      if (res != Constants.THUMBNAIL.FAILED_TEXT) {
        this._video().addThumbnailUploadAttempt();
        this._video().clearCache();
      }
    } else {
      log('Skipping image backlog exceeding all automatic text removal attempts');
    }
  };

  // PROTECTED/PRIVATE

  _openSeriesSeasonPage = async (): Promise<void> => {
    const season = this._currentSeason();
    const series = this._video().tvdbSeries.slug;
    const showSeasonURL = [Constants.TVDB.HOST, 'series', series, 'seasons', 'official', season].join('/');
    await this._goto(showSeasonURL);
    let seasonSelector = `xpath///*[contains(text(), "Season ${season}")]`;
    if (season == 0) { seasonSelector = 'xpath///*[contains(text(), "Specials")]'; }

    await this._find(seasonSelector);
    log(`opened ${showSeasonURL}`, true);
  };

  _addSeriesSeason = async (): Promise<void> => {
    const season = this._currentSeason();
    const series = this._video().tvdbSeries.slug;
    log(`Adding ${series} - ${season}`, true);
    await this._openSeriesPage();
    await this._click('xpath///a[text()="Seasons"]');
    await delay(1500);
    await this._click('xpath///button[@title="Add Season"]');
    await this._type('[name="season_number"]', season.toString());
    await this._click('xpath///button[text()="Add Season"]');
    await this._find(`xpath///*[contains(text(), "Season ${season}")]`);
    log(`Added ${series} - ${season}`, true);
  };

  _openSeriesPage = async (): Promise<void> => {
    const series = this._video().tvdbSeries.slug;
    const showSeriesURL = [Constants.TVDB.HOST, 'series', series].join('/');
    await this._goto(showSeriesURL);
    await this._find(`xpath///*[${cleanTextContainsXpath(series)}]`);
    log(`opened ${showSeriesURL}`, true);
  };

  _openEpisodePage = async (edit: boolean = true): Promise<void> => {
    const youtubeVideo = this._currentYoutubeVideo();
    const tvdbEpisode = this._currentTvdbEpisode();
    const episodeTitle = youtubeVideo.cleanTitle();
    const series = this._video().tvdbSeries.slug;
    const toolbarMenuButtonXpath = 'xpath///i[contains(@class,"fa-cog")]/..';
    const editEpisodeXpath = 'xpath///*[contains(text(),"Edit Episode")]';
    const openEpisodeXpath = `xpath///a[${cleanTextContainsXpath(episodeTitle)}]`;
    if (this._video().missingFromTvdb()) {
      await delay(500);
      await this._openSeriesSeasonPage();
      await this._click(openEpisodeXpath);
      await this._loaded();
      await this._click(toolbarMenuButtonXpath);
      await this._click(editEpisodeXpath);
      await this._loaded();
    } else {
      const showSeriesURL = [
        Constants.TVDB.HOST, 'series', series, 'episodes', tvdbEpisode.id,
      ].concat(edit ? ['0', 'edit'] : []).join('/');
      await this._goto(showSeriesURL);

      if (edit) {
        await this._find(`xpath///*[contains(text(), "Episode ${tvdbEpisode.number}")]`);
      } else {
        await this._find(editEpisodeXpath);
      }

      await this._find(`xpath///*[contains(text(), "Season ${tvdbEpisode.seasonNumber}")]`);
    }
    log(`opened EpisodePage ${episodeTitle}`, true);
  };

  _openAddEpisodePage = async (): Promise<void> => {
    await this._openSeriesSeasonPage();
    await this._click('xpath///*[contains(text(),"Add Episode")]');
    log('opened addEpisodePage', true);
  };

  _addInitialEpisode = async (): Promise<void> => {
    const youtubeVideo = this._currentYoutubeVideo();
    log('starting adding', true);
    await this._find('xpath///h3[text()=\'Episodes\']/ancestor::form');
    await delay(500);
    await this._type('[name="name[]"]', youtubeVideo.cleanTitle());
    await this._type('[name="overview[]"]', youtubeVideo.cleanDescription());
    await this._type('[name="runtime[]"]', youtubeVideo.runTime());
    await this._type('[name="date[]"]', youtubeVideo.airedDate(), false);
    await delay(500);
    await this._click('xpath///button[text()=\'Add Episodes\']');
    log('finished adding', true);
  };

  _updateEpisode = async (): Promise<void> => {
    const youtubeVideo = this._currentYoutubeVideo();
    log('updating episode', true);
    await this._find('form.episode-edit-form');
    await delay(500);
    await this._type('[name="productioncode"]', youtubeVideo.id);
    await delay(500);
    await this._click('xpath///button[text()=\'Save\']');
    await this._checkForEpisode();
    log('updated episode', true);
  };

  _checkForEpisode = async (): Promise<void> => {
    const youtubeVideo = this._currentYoutubeVideo();
    const tvdbEpisode = this._currentTvdbEpisode();

    try {
      await this._find(`xpath///*[contains(text(),"${youtubeVideo.cleanTitle()}")]`);
    } catch (e) {
      //  fall back to tvdb title if it exists
      if (tvdbEpisode.name) {
        await this._find(`xpath///*[contains(text(),"${tvdbEpisode.name}")]`);
      } else {
        throw e;
      }
    }

  };

  _handleCropperTool = async (): Promise<void> => {
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

  _checkForUploadBan = async (): Promise<void> => {
    if (this.imageUploadsDisabled == null) {
      try {
        if (await this._find(
          'xpath///*[contains(text(), "your account has been temporarily restricted from uploading")]'
        )) {
          this.imageUploadsDisabled = true;
        }
        // eslint-disable-next-line no-empty
      } catch (_e) { }
    }
  };

  _uploadEpisodeThumbnail = async (count: number = 0): Promise<string> => {
    if (this.imageUploadsDisabled == true) {
      log('Image uploads disabled, skipping');

      return Constants.THUMBNAIL.FAILED_TEXT;
    }

    const youtubeVideo = this._currentYoutubeVideo();

    log(`Starting image upload attempt ${count + 1}`, true);
    const thumbnailUrl = youtubeVideo.thumbnail;

    let thumbnailPath;

    try {
      await this._click('xpath///a[text()=\'Add Artwork\']');

      await this._checkForUploadBan();
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
        const elementHandle = await this._find('input[name=\'file\']') as ElementHandle<HTMLInputElement>;
        await elementHandle.uploadFile(thumbnailPath);
        await setTimeout(3000);
        await this._click('xpath///button[text()=\'Continue\']');
        await this._loaded();
        await this._handleCropperTool();
        await this._click('xpath///button[text()=\'Finish\']');
        await this._loaded();
        unlinkSync(thumbnailPath);
        await this._find(`xpath///*[contains(text(),"${youtubeVideo.cleanTitle()}")]`);
        log('Successfully uploaded image');
      }

      return thumbnailPath;
    } catch (e) {
      log((e as Error).toString());
      await this._takeScreenshot();
      log('Failed image upload');

      return Constants.THUMBNAIL.FAILED_TEXT;
    }
  };

  _getEpisodeNumber = async (): Promise<string> => {
    const video = this._currentYoutubeVideo();
    const episodeTitle = video.cleanTitle();
    let episodeNumber;
    try {
      episodeNumber = (
        await this._getValue(`xpath///tr[.//a[${cleanTextContainsXpath(episodeTitle)}]]/td`)
      )?.split('E')[1];
      if (!episodeNumber) {
        throw new Error('No episode number found');
      }
      log(`Found episode for ${episodeTitle} (${episodeNumber})`, true);
    } catch (_e) {
      log(`Didn't find episode for ${episodeTitle}`, true);
      episodeNumber = '';
    }

    return episodeNumber;
  };
}

