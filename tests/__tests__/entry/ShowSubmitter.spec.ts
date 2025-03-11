import { ShowSubmitter } from '@sonarrTube/entry/ShowSubmitter';
describe('ShowSubmitter', () => {
  it('start', () => {
    const showSubmitter = new ShowSubmitter();
    expect(async () => await showSubmitter.start()).rejects.toThrow('Cache key not found this shouldn\'t ever happen!');
  });
});