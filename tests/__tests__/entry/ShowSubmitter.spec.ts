import { ShowSubmitter } from '@sonarrTube/entry/ShowSubmitter';
describe('ShowSubmitter', () => {
  it('constructor', () => {
    const showSubmitter = new ShowSubmitter();
    expect(showSubmitter).toBeDefined();
  });
  it('start', () => {
    const showSubmitter = new ShowSubmitter();
    expect(() => showSubmitter.start()).not.toThrow('Cache key not found this shouldn\'t ever happen!');
  });
});