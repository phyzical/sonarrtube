import { config } from '@sonarrTube/helpers/Config.js';

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

export const handleSignal = (signal: string): void => {
  console.log(`Received ${signal}. Graceful shutdown...`);
  process.exit(0); // Exit the process
};
