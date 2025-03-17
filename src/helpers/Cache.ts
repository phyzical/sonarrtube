import { existsSync, mkdirSync, readFileSync, readdirSync, rmSync, statSync, unlinkSync, writeFileSync } from 'fs';
import path, { join } from 'path';

import { config } from '@sonarrTube/helpers/Config.js';
import { log } from '@sonarrTube/helpers/Log.js';
import { Constants } from '@sonarrTube/types/config/Constants.js';


export const getCache = (cacheKey?: string): object | string | undefined => {
    if (!cacheKey || !existsSync(cachePath(cacheKey))) {
        return;
    }
    // We get cache as string
    let json = readFileSync(cachePath(cacheKey), Constants.FILES.ENCODING) as string | object;
    try {
        // We  try decoding it, if it fails it cant be json so we keep it as string
        json = JSON.parse(json as string) as object;
        // eslint-disable-next-line no-empty
    } catch (_e) { }
    if (json) {
        log(`Found ${cacheKey} in cache. Returning cached data.`, true);
    }

    return json;
};

export const setCache = (cacheKey?: string, data?: string): void => {
    if (!cacheKey || !data) {
        return;
    }
    const cache = cachePath(cacheKey);

    log(`Caching to ${cache}`, true);
    writeFileSync(cache, data);

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
    const { cacheDir } = config();

    const cacheKeySplits = cacheKey.split(path.sep);
    const cacheKeyFile = cacheKeySplits.pop();
    if (!cacheKeyFile) {
        throw new Error('Cache key not found this shouldn\'t ever happen!');
    }

    const paths = [
        cacheDir, ...cacheKeySplits
    ];

    if (!cacheDir.startsWith(path.sep)) {
        paths.unshift(process.cwd());
    }

    const dir = path.join(...paths);

    mkdirSync(dir, { recursive: true });

    return path.join(dir, cacheKeyFile);
};

export const resetCache = (cacheDir: string): void => {
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