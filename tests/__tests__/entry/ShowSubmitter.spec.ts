import { ShowSubmitter } from '@sonarrTube/entry/ShowSubmitter';
import { mockPage } from '@sonarrTube/mocks/Puppeteer';
describe('ShowSubmitter', () => {
  it('start', async () => {
    const showSubmitter = new ShowSubmitter();
    const submitter = showSubmitter.submitter;
    jest.spyOn(submitter, 'doLogin').mockImplementation(async () => Promise.resolve());
    jest.spyOn(submitter, 'addEpisode').mockImplementation(async () => Promise.resolve());
    jest.spyOn(submitter, 'verifyAddedEpisode').mockImplementation(async () => '213');
    jest.spyOn(submitter, 'backfillEpisodeProductionCode').mockImplementation(async () => Promise.resolve());
    jest.spyOn(submitter, 'uploadEpisodeImage').mockImplementation(async () => Promise.resolve());
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    jest.spyOn(require('@sonarrTube/api/Ytdlp'), 'downloadVideos').mockImplementation(async () => Promise.resolve());
    await submitter.init();
    await mockPage(submitter);
    await showSubmitter.start();
  }, 15000);
});