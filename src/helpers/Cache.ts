import { existsSync, mkdirSync, readFileSync, readdirSync, rmSync, statSync, unlinkSync, writeFileSync } from 'fs';
import { config } from './Config.js';
import path, { join } from 'path';
import { log } from './Log.js';
import { Constants } from '../types/config/Constants.js';

const { cacheDir } = config();

export const getCache = (cacheKey: string): string | void => {
    if (!cacheKey) {
        return;
    }
    let json;
    try {
        json = JSON.parse(
            readFileSync(cachePath(cacheKey), Constants.FILES.ENCODING)
        );
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
    const path = cachePath(cacheKey);
    if (existsSync(path)) {
        unlinkSync(path);
    }

    return;
};

export const cachePath = (cacheKey: string): string => {
    const cacheKeySplits = cacheKey.split(path.sep);
    const cacheKeyFile = cacheKeySplits.pop();
    const dir = path.join(process.cwd(), cacheDir, ...cacheKeySplits);

    mkdirSync(dir, { recursive: true });

    return path.join(dir, cacheKeyFile);
};

export const resetCache = (): void => {
    if (existsSync(cacheDir)) {
        const items = readdirSync(cacheDir);
        for (const item of items) {
            const fullPath = join(cacheDir, item);
            const itemStats = statSync(fullPath);
            if (itemStats.isDirectory()) {
                // Recursively remove directories
                rmSync(fullPath, { recursive: true, force: true });
            } else {
                // Remove files
                rmSync(fullPath, { force: true });
            }
        }
    }
};