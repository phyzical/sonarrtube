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

  const saveFailure = false;

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

  describe('backfillEpisodeImage', () => {
    it('if at max attempts', async () => {
      if (tvdbSubmitter.videoObj) {
        jest.spyOn(tvdbSubmitter.videoObj, 'thumbnailUploadAttemptCount')
          .mockImplementation(() => Constants.THUMBNAIL.MAX_ATTEMPTS);
      }
      await tvdbSubmitter.backfillEpisodeImage();
      expect(consoleSpy).toHaveBeenCalledWith(
        'Skipping image backlog exceeding all automatic text removal attempts'
      );
    });

    it('if its successful', async () => {
      jest.spyOn(tvdbSubmitter, '_uploadEpisodeThumbnail')
        .mockImplementation(async (_x: number | undefined) => 'asdsda');
      const episodeTitle = 'Hasbro Proton Pack Upgrades';
      mockEpisode(episodeTitle);
      await tvdbSubmitter.backfillEpisodeImage();
      expect(tvdbSubmitter.videoObj?.thumbnailUploadAttemptCount()).toBe(1);
      expect(consoleSpy).not.toHaveBeenCalledWith(
        'Skipping image backlog exceeding all automatic text removal attempts'
      );
    });

    it('if its successful', async () => {
      jest.spyOn(tvdbSubmitter, '_uploadEpisodeThumbnail')
        .mockImplementation(async (_x: number | undefined) => Constants.THUMBNAIL.FAILED_TEXT);
      const episodeTitle = 'Hasbro Proton Pack Upgrades';
      mockEpisode(episodeTitle);
      await tvdbSubmitter.backfillEpisodeImage();
      expect(tvdbSubmitter.videoObj?.thumbnailUploadAttemptCount()).toBe(0);
      expect(consoleSpy).not.toHaveBeenCalledWith(
        'Skipping image backlog exceeding all automatic text removal attempts'
      );
    });
  });

  xdescribe('addEpisode', () => {
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

  xdescribe('backfillEpisodeProductionCode', () => {
    it('doesn\'t error', async () => {
      const episodeTitle = 'Hasbro Proton Pack Upgrades';
      mockEpisode(episodeTitle);
      await tvdbSubmitter.backfillEpisodeProductionCode();
    });
  });
});