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

  selectors = {
    addEpisodeButton: '::-p-xpath(//*[@id="episodes"]/ul/li/a)',
    addInitialEpisode: {
      addEpisodes: '::-p-xpath(//button[text()=\'Add Episodes\'])',
      date: '[name="date[]"]',
      form: '::-p-xpath(//h3[text()=\'Episodes\']/ancestor::form)',
      name: '[name="name[]"]',
      overview: '[name="overview[]"]',
      runtime: '[name="runtime[]"]',
    },
    addSeries: {
      addSeasonButton: '::-p-xpath(//button[@title="Add Season"])',
      addSeasonButtonByText: '::-p-xpath(//button[text()="Add Season"])',
      seasonNumberInput: '[name="season_number"]',
      seasonsButton: '::-p-xpath(//a[text()="Seasons"])',
    },
    editEpisodeButton: '::-p-xpath(//*[contains(text(),"Edit Episode")])',
    login: {
      email: '[name="email"]',
      form: 'form[action="/auth/login"]',
      password: '[name="password"]',
    },
    specials: '::-p-xpath(//*[contains(text(), "Specials")])',
    toolbarMenuButton: '::-p-xpath(//i[contains(@class,"fa-cog")]/..)',
    updateEpisode: {
      form: 'form.episode-edit-form',
      productionCode: '[name="productioncode"]',
      saveButton: '::-p-xpath(//button[text()=\'Save\'])',
    },
    uploadRestricted: '::-p-xpath(//*[contains(text(), ' +
      '"your account has been temporarily restricted from uploading")])',
    uploadThumbnail: {
      addArtwork: '::-p-xpath(//a[text()=\'Add Artwork\'])',
      continueButton: '::-p-xpath(//button[text()=\'Continue\'])',
      fileInput: 'input[name=\'file\']',
      finishButton: '::-p-xpath(//button[text()=\'Finish\'])',
    },
    whoops: '::-p-xpath(//*[contains(text(),"Whoops, looks like something went wrong")])',
  };

  doLogin = async (): Promise<void> => {
    log('starting login', true);
    await this._goto([Constants.TVDB.HOST, 'auth', 'login'].join('/'));
    await this._find(this.selectors.login.form);
    await this._type(this.selectors.login.email, this.email);
    await this._type(this.selectors.login.password, this.password);
    await this._submitForm(this.selectors.login.form);
    await this._goto([Constants.TVDB.HOST, 'dashboard'].join('/'));
    await this._find(`::-p-xpath(//*[contains(text(),"${this.email}")])`);
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
        await this._find(this.selectors.whoops);
        // eslint-disable-next-line no-empty
      } catch (_e) { }
      await this._openEpisodePage(true);
      await this._updateEpisode();

      await this.uploadEpisodeImage();

      log(`Finished adding of ${youtubeVideo.cleanTitle()}`);
    }
  };

  backfillEpisodeProductionCode = async (): Promise<void> => {
    await this._openEpisodePage(true);
    await this._updateEpisode();
  };

  uploadEpisodeImage = async (): Promise<void> => {
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
    let seasonSelector = `::-p-xpath(//*[contains(text(), "Season ${season}")])`;
    if (season == 0) { seasonSelector = this.selectors.specials; }
    await this._find(seasonSelector);
    log(`opened ${showSeasonURL}`, true);
  };

  _addSeriesSeason = async (): Promise<void> => {
    const season = this._currentSeason();
    const series = this._video().tvdbSeries.slug;
    log(`Adding ${series} - ${season}`, true);
    await this._openSeriesPage();
    await this._click(this.selectors.addSeries.seasonsButton);
    await delay(1500);
    await this._click(this.selectors.addSeries.addSeasonButton);
    await this._type(this.selectors.addSeries.seasonNumberInput, season.toString());
    await this._click(this.selectors.addSeries.addSeasonButtonByText);
    await this._loaded();
    await this._find(`::-p-xpath(//*[contains(text(), "Season ${season}")])`);
    log(`Added ${series} - ${season}`, true);
  };

  _openSeriesPage = async (): Promise<void> => {
    const series = this._video().tvdbSeries.slug;
    const showSeriesURL = [Constants.TVDB.HOST, 'series', series].join('/');
    await this._goto(showSeriesURL);
    await this._find(`::-p-xpath(//*[${cleanTextContainsXpath(series)}])`);
    log(`opened ${showSeriesURL}`, true);
  };

  _openEpisodePage = async (edit: boolean = true): Promise<void> => {
    const youtubeVideo = this._currentYoutubeVideo();
    const episodeTitle = youtubeVideo.cleanTitle();
    const series = this._video().tvdbSeries.slug;
    const openEpisodeXpath = `::-p-xpath(//a[${cleanTextContainsXpath(episodeTitle)}])`;
    if (this._video().missingFromTvdb()) {
      await delay(1000);
      await this._openSeriesSeasonPage();
      await this._click(openEpisodeXpath);
      await delay(1000);
      await this._click(this.selectors.toolbarMenuButton);
      await this._click(this.selectors.editEpisodeButton);
      await delay(1000);
    } else {
      const tvdbEpisode = this._currentTvdbEpisode();
      const showSeriesURL = [
        Constants.TVDB.HOST, 'series', series, 'episodes', tvdbEpisode.id,
      ].concat(edit ? ['0', 'edit'] : []).join('/');
      await this._goto(showSeriesURL);
      await delay(1000);

      if (edit) {
        await this._find(`::-p-xpath(//*[contains(text(), "Episode ${tvdbEpisode.number}")])`);
      } else {
        await this._find(this.selectors.editEpisodeButton);
      }

      await this._find(`::-p-xpath(//*[contains(text(), "Season ${tvdbEpisode.seasonNumber}")])`);
    }
    log(`opened EpisodePage ${episodeTitle}`, true);
  };

  _openAddEpisodePage = async (): Promise<void> => {
    await this._openSeriesSeasonPage();
    await delay(500);
    await this._click(this.selectors.addEpisodeButton);
    log('opened addEpisodePage', true);
  };

  _addInitialEpisode = async (): Promise<void> => {
    const youtubeVideo = this._currentYoutubeVideo();
    log('starting adding', true);
    await delay(300);
    await this._find(this.selectors.addInitialEpisode.form);
    await delay(300);
    await this._type(this.selectors.addInitialEpisode.name, youtubeVideo.cleanTitle());
    await this._type(this.selectors.addInitialEpisode.overview, youtubeVideo.cleanDescription());
    await this._type(this.selectors.addInitialEpisode.runtime, youtubeVideo.runTime());
    await this._type(this.selectors.addInitialEpisode.date, youtubeVideo.airedDate(), false);
    await delay(300);
    await this._click(this.selectors.addInitialEpisode.addEpisodes);
    log('finished adding', true);
  };

  _updateEpisode = async (): Promise<void> => {
    const youtubeVideo = this._currentYoutubeVideo();
    log('updating episode', true);
    await this._find(this.selectors.updateEpisode.form);
    await delay(300);
    await this._type(this.selectors.updateEpisode.productionCode, youtubeVideo.id);
    await delay(300);
    await this._click(this.selectors.updateEpisode.saveButton);
    await this._loaded();
    await this._checkForEpisode();
    log('updated episode', true);
  };

  _checkForEpisode = async (): Promise<void> => {
    const youtubeVideo = this._currentYoutubeVideo();
    try {
      await this._find(`::-p-xpath(//*[${cleanTextContainsXpath(youtubeVideo.cleanTitle())}])`);
    } catch (e) {
      //  fall back to tvdb title if it exists
      const tvdbEpisode = this._video().tvdbEpisode;
      if (tvdbEpisode && tvdbEpisode.name) {
        await this._find(`::-p-xpath(//*[${cleanTextContainsXpath(tvdbEpisode.name)}])`);
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
          this.selectors.uploadRestricted
        )) {
          this.imageUploadsDisabled = true;
        }
        // eslint-disable-next-line no-empty
      } catch (_e) { }
    }
  };


  _uploadEpisodeThumbnail = async (count: number = 0): Promise<string> => {
    const youtubeVideo = this._currentYoutubeVideo();

    log(`Starting image upload attempt ${count + 1}`, true);
    const thumbnailUrl = youtubeVideo.thumbnail;

    let thumbnailPath;

    try {
      await this._click(this.selectors.toolbarMenuButton);
      await this._click(this.selectors.uploadThumbnail.addArtwork);

      await this._checkForUploadBan();
      if (this.imageUploadsDisabled) {
        log('Image uploads disabled, skipping');

        return Constants.THUMBNAIL.FAILED_TEXT;
      }

      thumbnailPath = await processThumbnail(thumbnailUrl, youtubeVideo.id, count);

      if (thumbnailPath) {
        const elementHandle = await this._find(
          this.selectors.uploadThumbnail.fileInput
        ) as ElementHandle<HTMLInputElement>;
        await elementHandle.uploadFile(thumbnailPath);
        await setTimeout(3000);
        await this._click(this.selectors.uploadThumbnail.continueButton);
        await this._loaded();
        await this._handleCropperTool();
        await this._click(this.selectors.uploadThumbnail.finishButton);
        await this._loaded();
        unlinkSync(thumbnailPath);
        await this._find(`::-p-xpath(//*[contains(text(),"${youtubeVideo.cleanTitle()}")])`);
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
        await this._getValue(`::-p-xpath(//tr[.//a[${cleanTextContainsXpath(episodeTitle)}]]/td)`)
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

