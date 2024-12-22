import { BaseSubmitter } from '@sonarrTube/models/submitter/BaseSubmitter';
import { TVDBConfig } from '@sonarrTube/types/config/TVDBConfig';
import { actionableVideoFactory } from '@sonarrTube/factories/models/api/ActionableVideo';
import { actionableSeriesFactory } from '@sonarrTube/factories/models/api/ActionableSeries';
import { consoleSpy } from '@sonarrTube/mocks/Spies';

describe('BaseSubmitter', () => {
  let baseSubmitter = {} as BaseSubmitter;
  beforeEach(() => {
    baseSubmitter = new BaseSubmitter({
      username: 'username',
      password: 'password',
      email: 'email',
    } as TVDBConfig);
  });

  it('constructor', () => {
    expect(baseSubmitter.username).toEqual('username');
    expect(baseSubmitter.password).toEqual('password');
    expect(baseSubmitter.email).toEqual('email');
    expect(baseSubmitter.updates).toEqual([]);
    expect(baseSubmitter.downloads).toEqual([]);
    expect(baseSubmitter.warnings).toEqual([]);
    expect(baseSubmitter.errors).toEqual([]);
    expect(baseSubmitter.folder).toContain('/cache/screenshots');
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

  describe('browser', () => {
    it('throws', () => {
      expect(() => baseSubmitter.browser()).toThrow('Browser not initialized');
    });

    it('doesn\'t throw once init is called', async () => {
      await baseSubmitter.init();
      expect(() => baseSubmitter.browser()).not.toThrow('Browser not initialized');
    });
  });
  describe('video', () => {
    it('video', () => {
      expect(() => baseSubmitter.video()).toThrow('Video not initialized');
    });

    it('doesn\'t throw once init is called', async () => {
      baseSubmitter.videoObj = actionableVideoFactory();
      expect(() => baseSubmitter.browser()).not.toThrow('Video not initialized');
    });
  });

  describe('with init', () => {
    beforeEach(async () => {
      await baseSubmitter.init();
    });

    it('type', async () => {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const type = jest.spyOn(require('@sonarrTube/helpers/Puppeteer'), 'type')
        .mockImplementation(() => Promise.resolve());
      await baseSubmitter.type('selector', 'value');
      expect(type).toHaveBeenCalledWith(baseSubmitter.page(), 'selector', 'value', true);
      await baseSubmitter.type('selector', 'value', false);
      expect(type).toHaveBeenCalledWith(baseSubmitter.page(), 'selector', 'value', false);
    });

    it('find', async () => {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const type = jest.spyOn(require('@sonarrTube/helpers/Puppeteer'), 'find')
        .mockImplementation(() => Promise.resolve());
      await baseSubmitter.find('selector');
      expect(type).toHaveBeenCalledWith(baseSubmitter.page(), 'selector');
    });

    it('click', async () => {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const type = jest.spyOn(require('@sonarrTube/helpers/Puppeteer'), 'click')
        .mockImplementation(() => Promise.resolve());
      await baseSubmitter.click('selector');
      expect(type).toHaveBeenCalledWith(baseSubmitter.page(), 'selector');
    });

    it('loaded', async () => {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const type = jest.spyOn(require('@sonarrTube/helpers/Puppeteer'), 'loaded')
        .mockImplementation(() => Promise.resolve());
      await baseSubmitter.loaded();
      expect(type).toHaveBeenCalledWith(baseSubmitter.page());
    });

    it('goto', async () => {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const type = jest.spyOn(require('@sonarrTube/helpers/Puppeteer'), 'goto')
        .mockImplementation(() => Promise.resolve());
      await baseSubmitter.goto('url');
      expect(type).toHaveBeenCalledWith(baseSubmitter.page(), 'url');
    });

    it('submitForm', async () => {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const type = jest.spyOn(require('@sonarrTube/helpers/Puppeteer'), 'submitForm')
        .mockImplementation(() => Promise.resolve());
      await baseSubmitter.submitForm('url');
      expect(type).toHaveBeenCalledWith(baseSubmitter.page(), 'url');
    });

    describe('finish', () => {
      it('when error saves html and screenshot', async () => {
        const takeScreenshot = jest.spyOn(baseSubmitter, 'takeScreenshot').mockImplementation(() => Promise.resolve());
        const saveHtml = jest.spyOn(baseSubmitter, 'saveHtml').mockImplementation(() => Promise.resolve());
        const close = jest.spyOn(baseSubmitter.browser(), 'close').mockImplementation(() => Promise.resolve());
        await baseSubmitter.finish(true);
        expect(takeScreenshot).toHaveBeenCalled();
        expect(saveHtml).toHaveBeenCalled();
        expect(close).not.toHaveBeenCalled();
      });

      it('when error saves html and screenshot', async () => {
        const takeScreenshot = jest.spyOn(baseSubmitter, 'takeScreenshot').mockImplementation(() => Promise.resolve());
        const saveHtml = jest.spyOn(baseSubmitter, 'saveHtml').mockImplementation(() => Promise.resolve());
        const close = jest.spyOn(baseSubmitter.browser(), 'close').mockImplementation(() => Promise.resolve());
        await baseSubmitter.finish(false);
        expect(takeScreenshot).not.toHaveBeenCalled();
        expect(saveHtml).not.toHaveBeenCalled();
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

    describe('saveHtml', () => {
      it('saveHtml', async () => {
        jest.spyOn(baseSubmitter.page(), 'content').mockImplementation(async () => 'content');
        // eslint-disable-next-line @typescript-eslint/no-require-imports
        const writeFileSync = jest.spyOn(require('fs'), 'writeFileSync').mockImplementation(() => 'content');
        await baseSubmitter.saveHtml();
        expect(writeFileSync).toHaveBeenCalled();
        expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('html can be found at'));
      });

      it('When error', async () => {
        jest.spyOn(baseSubmitter.page(), 'content').mockImplementation(async () => { throw new Error('error'); });
        // eslint-disable-next-line @typescript-eslint/no-require-imports
        const writeFileSync = jest.spyOn(require('fs'), 'writeFileSync').mockImplementation(() => 'content');
        await baseSubmitter.saveHtml();
        expect(writeFileSync).not.toHaveBeenCalled();
        expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('failed to save html'));
      });
    });

    describe('takeScreenshot', () => {
      it('takeScreenshot', async () => {
        jest.spyOn(baseSubmitter.page(), 'screenshot').mockImplementation(async () => new Buffer('asdsad'));
        await baseSubmitter.takeScreenshot();
        expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('screen shot can be found at'));
      });

      it('When error', async () => {
        jest.spyOn(baseSubmitter.page(), 'screenshot').mockImplementation(async () => { throw new Error('error'); });
        await baseSubmitter.takeScreenshot();
        expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('failed to save screenshot'));
      });
    });
  });
});