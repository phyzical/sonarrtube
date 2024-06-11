import { mkdirSync, readFileSync, unlinkSync, writeFileSync } from 'fs';
import { config } from './Config.js';
import path from 'path';
import { log } from './Log.js';

const { cacheDir } = config();

export const getCache = (cacheKey: string): string | void => {
    if (!cacheKey) {
        return;
    }
    let json;
    try {
        json = JSON.parse(readFileSync(cachePath(cacheKey), 'utf8'));
        // eslint-disable-next-line no-empty
    } catch (e) { }
    if (json) {
        log(`Found ${cacheKey} in cache. Returning cached data.`, true);
    }

    return json;
};

export const setCache = (cacheKey: string, data: string): void => {
    if (!cacheKey) {
        return;
    }
    writeFileSync(cachePath(cacheKey), data);

    return;
};

export const clearCache = (cacheKey: string): void => {
    if (!cacheKey) {
        return;
    }
    unlinkSync(cachePath(cacheKey));

    return;
};

export const cachePath = (cacheKey: string): string => {
    const cacheKeySplits = cacheKey.split(path.sep);
    const cacheKeyFile = cacheKeySplits.pop();
    const dir = path.join(process.cwd(), cacheDir, ...cacheKeySplits);

    mkdirSync(dir, { recursive: true });

    return path.join(dir, cacheKeyFile);
};