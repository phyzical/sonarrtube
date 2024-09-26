import { BaseSubmitter } from '@sonarrTube/models/submitter/BaseSubmitter';
import { TVDBConfig } from '@sonarrTube/types/config/TVDBConfig';

describe('BaseSubmitter', () => {
  it('constructor', () => {
    new BaseSubmitter({
      username: '',
      password: '',
      email: '',
    } as TVDBConfig);
  });
  it('page', () => {
    const baseSubmitter = new BaseSubmitter({
      username: '',
      password: '',
      email: '',
    } as TVDBConfig);
    expect(() => baseSubmitter.page()).toThrow('Page not initialized');
  });
  it('browser', () => {
    const baseSubmitter = new BaseSubmitter({
      username: '',
      password: '',
      email: '',
    } as TVDBConfig);
    expect(() => baseSubmitter.browser()).toThrow('Browser not initialized');
  });
  it('video', () => {
    const baseSubmitter = new BaseSubmitter({
      username: '',
      password: '',
      email: '',
    } as TVDBConfig);
    expect(() => baseSubmitter.video()).toThrow('Video not initialized');
  });
  it('type', () => {
    const baseSubmitter = new BaseSubmitter({
      username: '',
      password: '',
      email: '',
    } as TVDBConfig);
    expect(() => baseSubmitter.type('')).toThrow('Page not initialized');
  });


  it('find', () => {
    const baseSubmitter = new BaseSubmitter({
      username: '',
      password: '',
      email: '',
    } as TVDBConfig);
    expect(() => baseSubmitter.find('')).toThrow('Page not initialized');
  });





  it('click', () => {
    const baseSubmitter = new BaseSubmitter({
      username: '',
      password: '',
      email: '',
    } as TVDBConfig);
    expect(() => baseSubmitter.click('')).toThrow('Page not initialized');
  });
  it('loaded', () => {
    const baseSubmitter = new BaseSubmitter({
      username: '',
      password: '',
      email: '',
    } as TVDBConfig);
    expect(() => baseSubmitter.loaded()).toThrow('Page not initialized');
  });



  it('goto', () => {
    const baseSubmitter = new BaseSubmitter({
      username: '',
      password: '',
      email: '',
    } as TVDBConfig);
    expect(() => baseSubmitter.goto('')).toThrow('Page not initialized');
  });
  it('submitForm', () => {
    const baseSubmitter = new BaseSubmitter({
      username: '',
      password: '',
      email: '',
    } as TVDBConfig);
    expect(() => baseSubmitter.submitForm('')).toThrow('Page not initialized');
  });
  it('init', () => {
    const baseSubmitter = new BaseSubmitter({
      username: '',
      password: '',
      email: '',
    } as TVDBConfig);
    expect(() => baseSubmitter.init()).toThrow('Browser not initialized');
  });
  it('finish', () => {
    const baseSubmitter = new BaseSubmitter({
      username: '',
      password: '',
      email: '',
    } as TVDBConfig);
    expect(() => baseSubmitter.finish()).toThrow('Browser not initialized');
  });
  it('handleReports', () => {
    const baseSubmitter = new BaseSubmitter({
      username: '',
      password: '',
      email: '',
    } as TVDBConfig);
    expect(() => baseSubmitter.handleReports()).toThrow('Page not initialized');
  });
  it('saveHtml', () => {
    const baseSubmitter = new BaseSubmitter({
      username: '',
      password: '',
      email: '',
    } as TVDBConfig);
    expect(() => baseSubmitter.saveHtml('')).toThrow('Page not initialized');
  });
  it('takeScreenshot', () => {
    const baseSubmitter = new BaseSubmitter({
      username: '',
      password: '',
      email: '',
    } as TVDBConfig);
    expect(() => baseSubmitter.takeScreenshot('')).toThrow('Page not initialized');
  });

});