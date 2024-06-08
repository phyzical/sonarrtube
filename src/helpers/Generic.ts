export const currentFileTimestamp = (): string =>
  new Date().toJSON()
    .replace(/T/g, '-')
    .replace(/Z/g, '')
    .replace(/:/g, '_')
    .split('.')[0];

