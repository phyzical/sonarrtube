import { config } from './Config.js';

export const currentFileTimestamp = (): string =>
  new Date().toJSON()
    .replace(/T/g, '-')
    .replace(/Z/g, '')
    .replace(/:/g, '_')
    .split('.')[0];

export const getYoutubeDelayString = (): string => {
  const date = (new Date);
  date.setMonth(date.getMonth() - config().youtube.downloadDelayMonths);

  return date.toISOString()
    .slice(0, 10)
    .replace(/-/g, '');
};