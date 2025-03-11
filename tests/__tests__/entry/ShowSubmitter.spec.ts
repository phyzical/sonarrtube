import { ShowSubmitter } from '@sonarrTube/entry/ShowSubmitter';
import { mockPage } from '@sonarrTube/mocks/Puppeteer';
describe('ShowSubmitter', () => {
  it('start', async () => {
    const showSubmitter = new ShowSubmitter();
    await showSubmitter.submitter.init();
    await mockPage(showSubmitter.submitter);
    expect(async () => await showSubmitter.start()).rejects.toThrow('Cache key not found this shouldn\'t ever happen!');
  });
});