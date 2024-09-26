import { TvdbSubmitter } from '@sonarrTube/models/submitter/TvdbSubmitter';
import { TVDBConfig } from '@sonarrTube/types/config/TVDBConfig';

describe('TvdbSubmitter', () => {
  it('constructor', () => {
    new TvdbSubmitter({
      username: '',
      password: '',
      email: '',
    } as TVDBConfig);
  });
  it('getEpisodeXpath', () => {
    const tvdbSubmitter = new TvdbSubmitter({
      username: '',
      password: '',
      email: '',
    } as TVDBConfig);
    expect(tvdbSubmitter.getEpisodeXpath('')).toBe('');
  });
  it('getSeriesXpath', () => {
    const tvdbSubmitter = new TvdbSubmitter({
      username: '',
      password: '',
      email: '',
    } as TVDBConfig);
    expect(tvdbSubmitter.getSeriesXpath('')).toBe('');
  });
  it('getEpisodeNumber', () => {
    const tvdbSubmitter = new TvdbSubmitter({
      username: '',
      password: '',
      email: '',
    } as TVDBConfig);
    expect(tvdbSubmitter.getEpisodeNumber('')).toBe('');
  });
  it('doLogin', () => {
    const tvdbSubmitter = new TvdbSubmitter({
      username: '',
      password: '',
      email: '',
    } as TVDBConfig);
    expect(tvdbSubmitter.doLogin()).toBe('');
  });
  it('openSeriesSeasonPage', () => {
    const tvdbSubmitter = new TvdbSubmitter({
      username: '',
      password: '',
      email: '',
    } as TVDBConfig);
    expect(tvdbSubmitter.openSeriesSeasonPage('')).toBe('');
  });
  it('addSeriesSeason', () => {
    const tvdbSubmitter = new TvdbSubmitter({
      username: '',
      password: '',
      email: '',
    } as TVDBConfig);
    expect(tvdbSubmitter.addSeriesSeason('')).toBe('');
  });
  it('openSeriesPage', () => {
    const tvdbSubmitter = new TvdbSubmitter({
      username: '',
      password: '',
      email: '',
    } as TVDBConfig);
    expect(tvdbSubmitter.openSeriesPage('')).toBe('');
  });
  it('openEpisodePage', () => {
    const tvdbSubmitter = new TvdbSubmitter({
      username: '',
      password: '',
      email: '',
    } as TVDBConfig);
    expect(tvdbSubmitter.openEpisodePage('')).toBe('');
  });
  it('verifyAddedEpisode', () => {
    const tvdbSubmitter = new TvdbSubmitter({
      username: '',
      password: '',
      email: '',
    } as TVDBConfig);
    expect(tvdbSubmitter.verifyAddedEpisode('')).toBe('');
  });
  it('addEpisode', () => {
    const tvdbSubmitter = new TvdbSubmitter({
      username: '',
      password: '',
      email: '',
    } as TVDBConfig);
    expect(tvdbSubmitter.addEpisode('')).toBe('');
  });
  it('backfillEpisodeProductionCode', () => {
    const tvdbSubmitter = new TvdbSubmitter({
      username: '',
      password: '',
      email: '',
    } as TVDBConfig);
    expect(tvdbSubmitter.backfillEpisodeProductionCode('')).toBe('');
  });
  it('backfillEpisodeImage', () => {
    const tvdbSubmitter = new TvdbSubmitter({
      username: '',
      password: '',
      email: '',
    } as TVDBConfig);
    expect(tvdbSubmitter.backfillEpisodeImage('')).toBe('');
  });
});