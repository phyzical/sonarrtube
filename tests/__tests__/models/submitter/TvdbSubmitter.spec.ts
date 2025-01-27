import { delay } from '@sonarrTube/helpers/Puppeteer.js';
import { actionableVideoFactory } from '@sonarrTube/factories/models/api/ActionableVideo';
import { consoleSpy } from '@sonarrTube/mocks/Spies';
import { TvdbSubmitter } from '@sonarrTube/models/submitter/TvdbSubmitter';
import { TVDBConfig } from '@sonarrTube/types/config/TVDBConfig';
import { mockPage } from '@sonarrTube/mocks/Puppeteer';

describe('TvdbSubmitter', () => {
  const tvdbSubmitter = new TvdbSubmitter({
    username: 'username',
    password: 'password',
    email: 'email',
  } as TVDBConfig);
  let season = 2023;
  const series = 'adam-savages-one-day-builds';
  const tvdbSeriesURL = `https://www.thetvdb.com/series/${series}`;
  const tvdbSeasonURL = `${tvdbSeriesURL}/seasons/official/${season}`;

  beforeEach(async () => {
    await tvdbSubmitter.init();
    await mockPage(tvdbSubmitter);
    tvdbSubmitter.videoObj = actionableVideoFactory();
  });

  const saveFailure = false;

  afterEach(async () => {
    await tvdbSubmitter.finish(saveFailure);
  });

  describe('getEpisodeNumber', () => {
    it('when xpath returns no episode number', async () => {
      await tvdbSubmitter.page().goto(tvdbSeasonURL, { waitUntil: 'networkidle0' });
      expect(await tvdbSubmitter.getEpisodeNumber()).toBe(undefined);
      expect(consoleSpy).toHaveBeenCalledTimes(2);
      expect(consoleSpy).toHaveBeenCalledWith(
        `Didn't find episode for ${tvdbSubmitter.video()?.youtubeVideo?.cleanTitle()}`
      );
    });

    it('returns episode number', async () => {
      await tvdbSubmitter.page().goto(tvdbSeasonURL, { waitUntil: 'networkidle0' });
      const title = 'Hasbro Proton Pack Upgrades';
      const episodeNumber = '01';
      if (tvdbSubmitter.videoObj && tvdbSubmitter.videoObj.youtubeVideo) {
        tvdbSubmitter.videoObj.youtubeVideo.fulltitle = title;
      }

      expect(await tvdbSubmitter.getEpisodeNumber()).toBe(episodeNumber);
      expect(consoleSpy).toHaveBeenCalledTimes(2);
      expect(consoleSpy).toHaveBeenCalledWith(
        `Found episode for ${title} (${episodeNumber})`
      );
    });
  });

  it('doLogin', async () => {
    tvdbSubmitter.doLogin();
    expect(consoleSpy).toHaveBeenCalledWith(
      'finishing login'
    );
  });

  describe('openSeriesSeasonPage', () => {
    it('works for a normal season', async () => {
      if (tvdbSubmitter.videoObj && tvdbSubmitter.videoObj.tvdbSeries) {
        jest.spyOn(tvdbSubmitter.videoObj, 'season').mockImplementation(() => season);
        tvdbSubmitter.videoObj.tvdbSeries.slug = series;
      }
      await tvdbSubmitter.openSeriesSeasonPage();
      expect(consoleSpy).toHaveBeenCalledWith(
        `opened ${tvdbSeasonURL}`
      );
    });

    it('works for specials', async () => {
      if (tvdbSubmitter.videoObj && tvdbSubmitter.videoObj.tvdbSeries) {
        jest.spyOn(tvdbSubmitter.videoObj, 'season').mockImplementation(() => season);
        tvdbSubmitter.videoObj.tvdbSeries.slug = series;
      }
      await tvdbSubmitter.openSeriesSeasonPage();
      expect(consoleSpy).toHaveBeenCalledWith(
        `opened ${tvdbSeasonURL}`
      );
    });
  });

  describe('addSeriesSeason', () => {
    it('works for a normal season', async () => {
      season = 2030;
      if (tvdbSubmitter.videoObj && tvdbSubmitter.videoObj.tvdbSeries) {
        jest.spyOn(tvdbSubmitter.videoObj, 'season').mockImplementation(() => season);
        tvdbSubmitter.videoObj.tvdbSeries.slug = series;
      }
      const originalFind = tvdbSubmitter.find;
      // Mock detection of added season as we cant actually add
      jest.spyOn(tvdbSubmitter, 'find').mockImplementation(async (selector: string) => {
        if (selector === `xpath///*[contains(text(), "Season ${season}")]`) {
          return null; // Mock the return value for the specific input
        }

        return originalFind(selector);
      });

      await tvdbSubmitter.addSeriesSeason();
      expect(consoleSpy).toHaveBeenCalledWith(
        `Added ${series} - ${season}`
      );
      await delay(1000);
    });
  });

  it('openSeriesPage', async () => {
    if (tvdbSubmitter.videoObj && tvdbSubmitter.videoObj.tvdbSeries) {
      tvdbSubmitter.videoObj.tvdbSeries.slug = series;
    }
    await tvdbSubmitter.openSeriesPage();
    expect(consoleSpy).toHaveBeenCalledWith(
      `opened ${tvdbSeriesURL}`
    );
  });

  describe('openEpisodePage', () => {
    describe('When missing from tvdb', () => {
      it('opensEpisodePage', async () => {
        const episodeTitle = 'Hasbro Proton Pack Upgrades';
        if (tvdbSubmitter.videoObj) {
          jest.spyOn(tvdbSubmitter.videoObj, 'missingFromTvdb').mockImplementation(() => true);
          if (tvdbSubmitter.videoObj.tvdbSeries) {
            jest.spyOn(tvdbSubmitter.videoObj, 'season').mockImplementation(() => season);
            tvdbSubmitter.videoObj.tvdbSeries.slug = series;
          }
          if (tvdbSubmitter.videoObj.youtubeVideo) {
            tvdbSubmitter.videoObj.youtubeVideo.fulltitle = episodeTitle;
          }
        }
        await tvdbSubmitter.openEpisodePage();
        await delay(1000);
        expect(consoleSpy).toHaveBeenCalledWith(
          `opened EpisodePage ${episodeTitle}`
        );
      });
    });

    describe('When not missing from tvdb', () => {
      it('opensEpisodePage', async () => {
        const episodeTitle = 'Hasbro Proton Pack Upgrades';
        if (tvdbSubmitter.videoObj) {
          if (tvdbSubmitter.videoObj.tvdbSeries) {
            jest.spyOn(tvdbSubmitter.videoObj, 'season').mockImplementation(() => season);
            tvdbSubmitter.videoObj.tvdbSeries.slug = series;
          }
          if (tvdbSubmitter.videoObj.tvdbEpisode) {
            tvdbSubmitter.videoObj.tvdbEpisode.id = 9760537;
            tvdbSubmitter.videoObj.tvdbEpisode.seasonNumber = season;
          }
          if (tvdbSubmitter.videoObj.youtubeVideo) {
            tvdbSubmitter.videoObj.youtubeVideo.fulltitle = episodeTitle;
          }
        }
        await tvdbSubmitter.openEpisodePage(false);
        expect(consoleSpy).toHaveBeenCalledWith(
          `opened EpisodePage ${episodeTitle}`
        );
      });

      it('opensEpisodePage edit form', async () => {
        const episodeTitle = 'Hasbro Proton Pack Upgrades';
        if (tvdbSubmitter.videoObj) {
          if (tvdbSubmitter.videoObj.tvdbSeries) {
            jest.spyOn(tvdbSubmitter.videoObj, 'season').mockImplementation(() => season);
            tvdbSubmitter.videoObj.tvdbSeries.slug = series;
          }
          if (tvdbSubmitter.videoObj.tvdbEpisode) {
            tvdbSubmitter.videoObj.tvdbEpisode.id = 9760537;
            tvdbSubmitter.videoObj.tvdbEpisode.number = 1;
            tvdbSubmitter.videoObj.tvdbEpisode.seasonNumber = season;
          }
          if (tvdbSubmitter.videoObj.youtubeVideo) {
            tvdbSubmitter.videoObj.youtubeVideo.fulltitle = episodeTitle;
          }
        }
        await tvdbSubmitter.openEpisodePage();
        expect(consoleSpy).toHaveBeenCalledWith(
          `opened EpisodePage ${episodeTitle}`
        );
      });
    });

  });

  describe('verifyAddedEpisode', () => {
    it('verifyAddedEpisode', async () => {
      const episodeTitle = 'Hasbro Proton Pack Upgrades';
      if (tvdbSubmitter.videoObj) {
        if (tvdbSubmitter.videoObj.tvdbSeries) {
          jest.spyOn(tvdbSubmitter.videoObj, 'season').mockImplementation(() => season);
          tvdbSubmitter.videoObj.tvdbSeries.slug = series;
        }
        if (tvdbSubmitter.videoObj.youtubeVideo) {
          tvdbSubmitter.videoObj.youtubeVideo.fulltitle = episodeTitle;
        }
      }

      expect(await tvdbSubmitter.verifyAddedEpisode()).toBe('01');
    });

    it('throws if it fails to detect the episode', async () => {
      const episodeTitle = 'saxds aasd sad';
      if (tvdbSubmitter.videoObj) {
        if (tvdbSubmitter.videoObj.tvdbSeries) {
          jest.spyOn(tvdbSubmitter.videoObj, 'season').mockImplementation(() => season);
          tvdbSubmitter.videoObj.tvdbSeries.slug = series;
        }
        if (tvdbSubmitter.videoObj.youtubeVideo) {
          tvdbSubmitter.videoObj.youtubeVideo.fulltitle = episodeTitle;
        }
      }
      await expect(tvdbSubmitter.verifyAddedEpisode()).rejects
        .toThrow(`Didnt add episode for ${episodeTitle} something went horribly wrong!`);
    });
  });

  //  TODO: up to here
  describe('backfillEpisodeImage', () => {
    it('backfillEpisodeImage', () => {
      expect(tvdbSubmitter.backfillEpisodeImage()).toBe('');
    });
  });

  describe('backfillEpisodeProductionCode', () => {
    it('backfillEpisodeProductionCode', () => {
      expect(tvdbSubmitter.backfillEpisodeProductionCode()).toBe('');
    });
  });

  describe('addEpisode', () => {
    it('addEpisode', async () => {
      const episodeTitle = 'Hasbro Proton Pack Upgrades';
      if (tvdbSubmitter.videoObj) {
        if (tvdbSubmitter.videoObj.tvdbSeries) {
          jest.spyOn(tvdbSubmitter.videoObj, 'season').mockImplementation(() => season);
          tvdbSubmitter.videoObj.tvdbSeries.slug = series;
        }
        if (tvdbSubmitter.videoObj.youtubeVideo) {
          tvdbSubmitter.videoObj.youtubeVideo.fulltitle = episodeTitle;
        }
      }
      await tvdbSubmitter.addEpisode();
      expect(consoleSpy).toHaveBeenCalledWith(
        `Added ${episodeTitle} - 01`
      );
    });
  });

  describe('uploadEpisodeThumbnail', () => {
    it('uploadEpisodeThumbnail', async () => {
      const episodeTitle = 'Hasbro Proton Pack Upgrades';
      if (tvdbSubmitter.videoObj) {
        if (tvdbSubmitter.videoObj.tvdbSeries) {
          jest.spyOn(tvdbSubmitter.videoObj, 'season').mockImplementation(() => season);
          tvdbSubmitter.videoObj.tvdbSeries.slug = series;
        }
        if (tvdbSubmitter.videoObj.youtubeVideo) {
          tvdbSubmitter.videoObj.youtubeVideo.fulltitle = episodeTitle;
        }
      }
      await tvdbSubmitter.uploadEpisodeThumbnail();
      expect(consoleSpy).toHaveBeenCalledWith(
        `Uploaded thumbnail for ${episodeTitle}`
      );
    });
  });

  describe('handleCropperTool', () => {
    it('handleCropperTool', async () => {
      const episodeTitle = 'Hasbro Proton Pack Upgrades';
      if (tvdbSubmitter.videoObj) {
        if (tvdbSubmitter.videoObj.tvdbSeries) {
          jest.spyOn(tvdbSubmitter.videoObj, 'season').mockImplementation(() => season);
          tvdbSubmitter.videoObj.tvdbSeries.slug = series;
        }
        if (tvdbSubmitter.videoObj.youtubeVideo) {
          tvdbSubmitter.videoObj.youtubeVideo.fulltitle = episodeTitle;
        }
      }
      await tvdbSubmitter.handleCropperTool();
      expect(consoleSpy).toHaveBeenCalledWith(
        `Handled cropper tool for ${episodeTitle}`
      );
    });
  });

  describe('checkForUploadBan', () => {
    it('checkForUploadBan', async () => {
      await tvdbSubmitter.checkForUploadBan();
      expect(consoleSpy).toHaveBeenCalledWith(
        'No upload ban detected'
      );
    });
  });

  describe('checkForEpisode', () => {
    it('checkForEpisode', async () => {
      const episodeTitle = 'Hasbro Proton Pack Upgrades';
      if (tvdbSubmitter.videoObj) {
        if (tvdbSubmitter.videoObj.tvdbSeries) {
          jest.spyOn(tvdbSubmitter.videoObj, 'season').mockImplementation(() => season);
          tvdbSubmitter.videoObj.tvdbSeries.slug = series;
        }
        if (tvdbSubmitter.videoObj.youtubeVideo) {
          tvdbSubmitter.videoObj.youtubeVideo.fulltitle = episodeTitle;
        }
      }
      await tvdbSubmitter.checkForEpisode();
      expect(consoleSpy).toHaveBeenCalledWith(
        `Checked for episode ${episodeTitle}`
      );
    });
  });

  describe('updateEpisode', () => {
    it('updateEpisode', async () => {
      const episodeTitle = 'Hasbro Proton Pack Upgrades';
      if (tvdbSubmitter.videoObj) {
        if (tvdbSubmitter.videoObj.tvdbSeries) {
          jest.spyOn(tvdbSubmitter.videoObj, 'season').mockImplementation(() => season);
          tvdbSubmitter.videoObj.tvdbSeries.slug = series;
        }
        if (tvdbSubmitter.videoObj.tvdbEpisode) {
          tvdbSubmitter.videoObj.tvdbEpisode.id = 9760537;
          tvdbSubmitter.videoObj.tvdbEpisode.number = 1;
          tvdbSubmitter.videoObj.tvdbEpisode.seasonNumber = season;
        }
        if (tvdbSubmitter.videoObj.youtubeVideo) {
          tvdbSubmitter.videoObj.youtubeVideo.fulltitle = episodeTitle;
        }
      }
      await tvdbSubmitter.updateEpisode();
      expect(consoleSpy).toHaveBeenCalledWith(
        `Updated ${episodeTitle} - 01`
      );
    });
  });

  describe('addInitialEpisode', () => {
    it('addInitialEpisode', async () => {
      const episodeTitle = 'Hasbro Proton Pack Upgrades';
      if (tvdbSubmitter.videoObj) {
        if (tvdbSubmitter.videoObj.tvdbSeries) {
          jest.spyOn(tvdbSubmitter.videoObj, 'season').mockImplementation(() => season);
          tvdbSubmitter.videoObj.tvdbSeries.slug = series;
        }
        if (tvdbSubmitter.videoObj.youtubeVideo) {
          tvdbSubmitter.videoObj.youtubeVideo.fulltitle = episodeTitle;
        }
      }
      await tvdbSubmitter.addInitialEpisode();
      expect(consoleSpy).toHaveBeenCalledWith(
        `Added ${episodeTitle} - 01`
      );
    });
  });

  describe('openAddEpisodePage', () => {
    it('openAddEpisodePage', async () => {
      const episodeTitle = 'Hasbro Proton Pack Upgrades';
      if (tvdbSubmitter.videoObj) {
        if (tvdbSubmitter.videoObj.tvdbSeries) {
          jest.spyOn(tvdbSubmitter.videoObj, 'season').mockImplementation(() => season);
          tvdbSubmitter.videoObj.tvdbSeries.slug = series;
        }
        if (tvdbSubmitter.videoObj.youtubeVideo) {
          tvdbSubmitter.videoObj.youtubeVideo.fulltitle = episodeTitle;
        }
      }
      await tvdbSubmitter.openAddEpisodePage();
      expect(consoleSpy).toHaveBeenCalledWith(
        `opened AddEpisodePage ${episodeTitle}`
      );
    });
  });



});