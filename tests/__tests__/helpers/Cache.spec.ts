import { randomUUID } from 'crypto';
import { join } from 'path';


import { cachePath, clearCache, getCache, resetCache, setCache } from '@sonarrTube/helpers/Cache';
import { config } from '@sonarrTube/helpers/Config';
import { consoleSpy } from '@sonarrTube/mocks/Spies';

describe('Cache', () => {
    describe('getCache', () => {
        it('should return undefined if no cache key is provided', () => {
            expect(getCache()).toBeUndefined();
        });

        it('should return undefined if the cache key is not found', () => {
            expect(getCache(randomUUID())).toBeUndefined();
        });

        it('should return the cached data if the cache key is found', () => {
            const key = randomUUID();
            const result = 'test data';
            setCache(key, result);
            expect(getCache(key)).toBe('test data');
            expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining(key));
        });

        it('should return the cached data as json when saved as json if the cache key is found', () => {
            const key = randomUUID();
            const result = { test: 'data' };
            const cacheData = JSON.stringify(result);
            setCache(key, cacheData);
            expect(getCache(key)).toStrictEqual(result);
            expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining(key));
        });
    });

    describe('setCache', () => {
        it('should not set cache if no cache key is provided', () => {
            setCache();
            expect(getCache()).toBeUndefined();
        });

        it('should not set cache if no data is provided', () => {
            const key = randomUUID();
            setCache(key);
            expect(getCache(key)).toBeUndefined();
        });

        it('should set cache if cache key and data are provided', () => {
            const key = randomUUID();
            const result = '{"data": "test data"}';
            setCache(key, result);
            expect((getCache(key) as { data: string }).data).toBe('test data');
        });

    });
    describe('clearCache', () => {
        it('should not clear cache if no cache key is provided', () => {
            const key = randomUUID();
            const result = 'test data';
            clearCache('');
            setCache(key, result);
            expect(getCache(key)).toBe(result);
        });

        it('should clear cache if cache key is provided', () => {
            const key = randomUUID();
            const result = '{data: "test data"}';
            setCache(key, result);
            expect(getCache(key)).toBe(result);
            clearCache(key);
            expect(getCache(key)).toBeUndefined();
        });
    });

    describe('cachePath', () => {
        it('should return a path to the cache key', () => {
            const key = 'zXxczczxcxz/dcsasdasd.txt';
            expect(cachePath(key)).toContain(key);
        });

        it('should throw if nothing was provided', () => {
            const key = '';
            expect(() => cachePath(key)).toThrow('Cache key not found this shouldn\'t ever happen!');
        });
    });

    describe('resetCache', () => {
        it('should not error if cache dir does not exist', () => {
            expect(resetCache(randomUUID())).toBeUndefined();
        });

        it('should not error if cache dir is empty', () => {
            const key = randomUUID();
            resetCache(config().cacheDir);
            expect(getCache(key)).toBeUndefined();
        });

        it('should reset cache if cache dir exists', () => {
            const cacheDirFolder = randomUUID();
            const key = join(cacheDirFolder, randomUUID());
            const result = '{data: "test data"}';
            setCache(key, result);
            expect(getCache(key)).toBe(result);
            resetCache(config().cacheDir);
            expect(getCache(key)).toBeFalsy();
        });

        it('should reset cache if cache file provided exists', () => {
            const key = randomUUID();
            const result = '{data: "test data"}';
            setCache(key, result);
            expect(getCache(key)).toBe(result);
            resetCache(config().cacheDir);
            expect(getCache(key)).toBeFalsy();
        });
    });

    describe('getCache', () => {
        it('should return undefined if no cache key is provided', () => {
            expect(getCache()).toBeUndefined();
        });

        it('should return undefined if the cache key is not found', () => {
            expect(getCache(randomUUID())).toBeUndefined();
        });

        it('should return the cached data if the cache key is found', () => {
            const key = randomUUID();
            const result = '{data: "test data"}';
            setCache(key, result);
            expect(getCache(key)).toBe(result);
        });
    });
});

