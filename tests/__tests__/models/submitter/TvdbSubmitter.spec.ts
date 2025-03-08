import { ElementHandle } from 'puppeteer';

import { actionableVideoFactory } from '@sonarrTube/factories/models/api/ActionableVideo';
import { consoleSpy } from '@sonarrTube/mocks/Spies';
import { TvdbSubmitter } from '@sonarrTube/models/submitter/TvdbSubmitter';
import { TVDBConfig } from '@sonarrTube/types/config/TVDBConfig';
import { mockPage } from '@sonarrTube/mocks/Puppeteer';
import { Constants } from '@sonarrTube/types/config/Constants';

describe('TvdbSubmitter', () => {
  let tvdbSubmitter = {} as TvdbSubmitter;
  const season = 2023;
  const series = 'adam-savages-one-day-builds';

  beforeEach(async () => {
    tvdbSubmitter = new TvdbSubmitter({
      username: 'username',
      password: 'password',
      email: 'email',
    } as TVDBConfig);
    await tvdbSubmitter.init();
    await mockPage(tvdbSubmitter);
    tvdbSubmitter.videoObj = actionableVideoFactory();
  });

  const mockEpisode = (episodeTitle?: string, episodeSeason: number = season): void => {
    if (tvdbSubmitter.videoObj) {
      if (tvdbSubmitter.videoObj.tvdbSeries) {
        jest.spyOn(tvdbSubmitter.videoObj, 'season').mockImplementation(() => episodeSeason);
        tvdbSubmitter.videoObj.tvdbSeries.slug = series;
      }
      if (tvdbSubmitter.videoObj.tvdbEpisode) {
        tvdbSubmitter.videoObj.tvdbEpisode.number = 1;
        tvdbSubmitter.videoObj.tvdbEpisode.id = 9760537;
        tvdbSubmitter.videoObj.tvdbEpisode.seasonNumber = episodeSeason;
      }
      if (tvdbSubmitter.videoObj.youtubeVideo && episodeTitle) {
        tvdbSubmitter.videoObj.youtubeVideo.fulltitle = episodeTitle;
      }
    }
  };

  const saveFailure = true;

  afterEach(async () => {
    await tvdbSubmitter.finish(saveFailure);
  });

  it('doLogin', async () => {
    await tvdbSubmitter.doLogin();
    expect(consoleSpy).toHaveBeenCalledWith(
      'finishing login'
    );
  });

  describe('verifyAddedEpisode', () => {
    it('verifyAddedEpisode', async () => {
      const episodeTitle = 'Hasbro Proton Pack Upgrades';
      mockEpisode(episodeTitle);
      expect(await tvdbSubmitter.verifyAddedEpisode()).toBe('01');
    });

    it('throws if it fails to detect the episode', async () => {
      const episodeTitle = 'axds aasd sad';
      mockEpisode(episodeTitle);
      await expect(tvdbSubmitter.verifyAddedEpisode()).rejects
        .toThrow(`Didnt add episode for ${episodeTitle} something went horribly wrong!`);
    });
  });

  describe('uploadEpisodeImage', () => {
    it('if at max attempts', async () => {
      if (tvdbSubmitter.videoObj) {
        jest.spyOn(tvdbSubmitter.videoObj, 'thumbnailUploadAttemptCount')
          .mockImplementation(() => Constants.THUMBNAIL.MAX_ATTEMPTS + 1);
      }
      await tvdbSubmitter.uploadEpisodeImage();
      expect(consoleSpy).toHaveBeenCalledWith(
        `Skipping image exceeding ${Constants.THUMBNAIL.MAX_ATTEMPTS} attempts`
      );
    });

    it('if its successful', async () => {
      jest.spyOn(tvdbSubmitter, '_uploadEpisodeThumbnail')
        .mockImplementation(async (_x: number | undefined) => 'asdsda');
      const episodeTitle = 'Hasbro Proton Pack Upgrades';
      mockEpisode(episodeTitle);
      await tvdbSubmitter.uploadEpisodeImage();
      expect(tvdbSubmitter.videoObj?.thumbnailUploadAttemptCount()).toBe(1);
      expect(consoleSpy).not.toHaveBeenCalledWith(
        `Skipping image exceeding ${Constants.THUMBNAIL.MAX_ATTEMPTS} attempts`
      );
    });

    it('if its successful', async () => {
      jest.spyOn(tvdbSubmitter, '_uploadEpisodeThumbnail')
        .mockImplementation(async (_x: number | undefined) => Constants.THUMBNAIL.FAILED_TEXT);
      const episodeTitle = 'Hasbro Proton Pack Upgrades';
      mockEpisode(episodeTitle);
      await tvdbSubmitter.uploadEpisodeImage();
      expect(tvdbSubmitter.videoObj?.thumbnailUploadAttemptCount()).toBe(0);
      expect(consoleSpy).not.toHaveBeenCalledWith(
        'Skipping image backlog exceeding all automatic text removal attempts'
      );
    });
  });

  xdescribe('addEpisode', () => {
    it('if episode exists does nothing', async () => {
      const episodeTitle = 'Hasbro Proton Pack Upgrades';
      mockEpisode(episodeTitle);
      await tvdbSubmitter.addEpisode();
      expect(consoleSpy).not.toHaveBeenCalledWith(
        `Finished adding of ${episodeTitle}`
      );
    });

    describe('new episode', () => {
      it('adds', async () => {
        const episodeTitle = 'Super duper soaker';
        mockEpisode(episodeTitle);
        await tvdbSubmitter.addEpisode();
        expect(consoleSpy).toHaveBeenCalledWith(
          `Finished adding of ${episodeTitle}`
        );
      }, 50000);

      it('if Whoops is thrown adds', async () => {
        const originalFind = tvdbSubmitter._find;
        jest.spyOn(tvdbSubmitter, '_find')
          .mockImplementation(async (selector: string): Promise<ElementHandle<Element> | null> => {
            if (selector === tvdbSubmitter.selectors.whoops) {
              throw new Error('Whoops');
            }

            return await originalFind(selector);
          });

        const episodeTitle = 'Super duper soaker';
        mockEpisode(episodeTitle);
        await tvdbSubmitter.addEpisode();
        expect(consoleSpy).toHaveBeenCalledWith(
          `Finished adding of ${episodeTitle}`
        );
      });

      it('if season is missing adds', async () => {
        const episodeTitle = 'Super duper soaker';
        const season = 2999;
        mockEpisode(episodeTitle, season);
        await tvdbSubmitter.addEpisode();
        expect(consoleSpy).toHaveBeenCalledWith(
          `Added ${series} - ${season}`,
          `Finished adding of ${episodeTitle}`
        );
      });
    });

    xdescribe('backfillEpisodeProductionCode', () => {
      it('doesn\'t error', async () => {
        const episodeTitle = 'Hasbro Proton Pack Upgrades';
        mockEpisode(episodeTitle);
        await tvdbSubmitter.backfillEpisodeProductionCode();
      });
    });
  });
});