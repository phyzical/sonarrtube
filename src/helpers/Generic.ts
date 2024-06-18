import { createWriteStream, unlinkSync } from 'fs';
import { config } from './Config.js';
import fetch from 'node-fetch';
import webp from 'webp-converter';
import { delay } from './Puppeteer.js';

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

export const processThumbnail = async (thumbnailUrl: string, thumbnailPath: string): Promise<void> => {
  const res = await fetch(thumbnailUrl);
  await res.body.pipe(createWriteStream(`${thumbnailPath}.webp`));
  await delay(3000);
  await webp.dwebp(`${thumbnailPath}.webp`, `${thumbnailPath}.png`, '-o');
  unlinkSync(`${thumbnailPath}.webp`);
};

