import { Browser } from 'puppeteer';

import { BaseSubmitter } from '@sonarrTube/models/submitter/BaseSubmitter';
import { TVDBConfig } from '@sonarrTube/types/config/TVDBConfig';
import { actionableVideoFactory } from '@sonarrTube/factories/models/api/ActionableVideo';
import { actionableSeriesFactory } from '@sonarrTube/factories/models/api/ActionableSeries';
import { consoleSpy } from '@sonarrTube/mocks/Spies';

describe('BaseSubmitter', () => {
  let baseSubmitter = {} as BaseSubmitter;
  beforeEach(async () => {
    baseSubmitter = new BaseSubmitter({
      username: 'username',
      password: 'password',
      email: 'email',
    } as TVDBConfig);

    baseSubmitter.videoObj = actionableVideoFactory();
  });

  const saveFailure = false;

  afterEach(async () => {
    await baseSubmitter.finish(saveFailure);
  });

  it('constructor', () => {
    expect(baseSubmitter.username).toEqual('username');
    expect(baseSubmitter.password).toEqual('password');
    expect(baseSubmitter.email).toEqual('email');
    expect(baseSubmitter.updates).toEqual([]);
    expect(baseSubmitter.downloads).toEqual([]);
    expect(baseSubmitter.warnings).toEqual([]);
    expect(baseSubmitter.errors).toEqual([]);
    expect(baseSubmitter.errorFolder).toContain('/tmp/screenshots');
  });


  it('init', async () => {
    expect(baseSubmitter.pageObj).toBeUndefined();
    expect(baseSubmitter.browserObj).toBeUndefined();
    await baseSubmitter.init();
    expect(baseSubmitter.pageObj).not.toBeUndefined();
    expect(baseSubmitter.browserObj).not.toBeUndefined();
  });

  describe('page', () => {
    it('throws', () => {
      expect(() => baseSubmitter.page()).toThrow('Page not initialized');
    });

    it('doesn\'t throw once init is called', async () => {
      await baseSubmitter.init();
      expect(() => baseSubmitter.page()).not.toThrow('Page not initialized');
    });
  });

  describe('_browser', () => {
    it('throws', () => {
      expect(() => baseSubmitter._browser()).toThrow('Browser not initialized');
    });

    it('doesn\'t throw once init is called', async () => {
      await baseSubmitter.init();
      expect(() => baseSubmitter._browser()).not.toThrow('Browser not initialized');
    });
  });

  describe('_video', () => {
    it('throws', () => {
      baseSubmitter.videoObj = undefined;
      expect(() => baseSubmitter._video()).toThrow('Video not initialized');
    });

    it('doesn\'t throw once init is called', async () => {
      await baseSubmitter.init();
      expect(() => baseSubmitter._video()).not.toThrow('Video not initialized');
    });
  });

  describe('finish', () => {
    it('does not error if no browser', async () => {
      await baseSubmitter.finish();
    });
  });

  describe('with init', () => {
    beforeEach(async () => {
      await baseSubmitter.init();
    });

    describe('finish', () => {
      it('when error saves html and screenshot', async () => {
        const takeScreenshot = jest.spyOn(baseSubmitter, '_takeScreenshot');
        // const saveHtml = jest.spyOn(baseSubmitter, '_saveHtml');
        const close = jest.spyOn(baseSubmitter._browser(), 'close');
        await baseSubmitter.finish(true);
        expect(takeScreenshot).toHaveBeenCalled();
        // expect(saveHtml).toHaveBeenCalled();
        expect(close).toHaveBeenCalled();
      });

      it('when error saves html and screenshot', async () => {
        const takeScreenshot = jest.spyOn(baseSubmitter, '_takeScreenshot');
        // const saveHtml = jest.spyOn(baseSubmitter, '_saveHtml');
        const close = jest.spyOn(baseSubmitter._browser(), 'close');
        await baseSubmitter.finish(false);
        expect(takeScreenshot).not.toHaveBeenCalled();
        // expect(saveHtml).not.toHaveBeenCalled();
        expect(close).toHaveBeenCalled();
      });
    });

    describe('handleReports', () => {
      it('doesn\'t notify if no updates', async () => {
        const series = actionableSeriesFactory();
        // eslint-disable-next-line @typescript-eslint/no-require-imports
        const notify = jest.spyOn(require('@sonarrTube/helpers/Notifications'), 'notify')
          .mockImplementation(() => Promise.resolve());
        baseSubmitter.updates = [];
        baseSubmitter.downloads = [];
        baseSubmitter.warnings = [];
        baseSubmitter.errors = [];
        baseSubmitter.videoObj = series.videos[0];
        consoleSpy.mockClear();
        await baseSubmitter.handleReports(series);
        expect(consoleSpy).toHaveBeenCalledTimes(1);
        expect(notify).toHaveBeenCalledOnce();
        expect(baseSubmitter.updates).toBeEmpty();
        expect(baseSubmitter.downloads).toBeEmpty();
        expect(baseSubmitter.warnings).toBeEmpty();
        expect(baseSubmitter.errors).toBeEmpty();
      });

      it('notifies and restarts  updates', async () => {
        const series = actionableSeriesFactory();
        // eslint-disable-next-line @typescript-eslint/no-require-imports
        const notify = jest.spyOn(require('@sonarrTube/helpers/Notifications'), 'notify')
          .mockImplementation(() => Promise.resolve());
        baseSubmitter.updates = ['asd', 'dsasd'];
        baseSubmitter.downloads = ['asdas'];
        baseSubmitter.warnings = ['asdas'];
        baseSubmitter.errors = ['asdasd'];
        baseSubmitter.videoObj = series.videos[0];
        consoleSpy.mockClear();

        await baseSubmitter.handleReports(series);
        expect(consoleSpy).toHaveBeenCalledTimes(5);
        expect(notify).toHaveBeenCalledTimes(5);
        expect(baseSubmitter.updates).toBeEmpty();
        expect(baseSubmitter.downloads).toBeEmpty();
        expect(baseSubmitter.warnings).toBeEmpty();
        expect(baseSubmitter.errors).toBeEmpty();
      });
    });

    describe('currentYoutubeVideo', () => {
      it('throws when no youtubeVideo', async () => {
        if (baseSubmitter.videoObj) {
          baseSubmitter.videoObj.youtubeVideo = undefined;
        }
        await expect(async () => baseSubmitter._currentYoutubeVideo()).rejects
          .toThrow('Missing youtubeVideo this shouldn\'t happen!');
      });

      it('returns youtubeVideo', () => {
        const youtubeVideo = baseSubmitter.videoObj?.youtubeVideo;
        const res = baseSubmitter._currentYoutubeVideo();
        expect(res).toBeTruthy();
        expect(res).toBe(youtubeVideo);
      });
    });

    describe('currentTvdbEpisode', () => {
      it('throws when no tvdbEpisode', async () => {
        if (baseSubmitter.videoObj) {
          baseSubmitter.videoObj.tvdbEpisode = undefined;
        }
        await expect(async () => baseSubmitter._currentTvdbEpisode()).rejects
          .toThrow('Missing tvdbEpisode this shouldn\'t happen!');
      });

      it('returns tvdbEpisode', () => {
        const tvdbEpisode = baseSubmitter.videoObj?.tvdbEpisode;
        const res = baseSubmitter._currentTvdbEpisode();
        expect(res).toBeTruthy();
        expect(res).toBe(tvdbEpisode);
      });
    });

    describe('currentSeason', () => {
      it('throws when no season', async () => {
        if (baseSubmitter.videoObj) {
          jest.spyOn(baseSubmitter.videoObj, 'season').mockImplementation(() => undefined);
        }
        await expect(async () => baseSubmitter._currentSeason()).rejects
          .toThrow('Missing season this shouldn\'t happen!');
      });

      it('returns tvdbEpisode', () => {
        if (baseSubmitter.videoObj) {
          jest.spyOn(baseSubmitter.videoObj, 'season').mockImplementation(() => 2023);
        }
        const res = baseSubmitter._currentSeason();
        expect(res).toBeTruthy();
        expect(res).toBe(2023);
      });
    });
  });
});