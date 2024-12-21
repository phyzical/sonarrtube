import { randomUUID } from 'crypto';

import { setCache } from '@sonarrTube/helpers/Cache';
import { doRequest } from '@sonarrTube/helpers/Requests';
import { doRequestSpy, getCacheSpy, setCacheSpy } from '@sonarrTube/mocks/Spies';

describe('Requests', () => {
    beforeEach(() => {
        doRequestSpy.mockRestore();
    });
    describe('doRequest', () => {
        it('should return a json object', async () => {
            const result = await doRequest('https://jsonplaceholder.typicode.com/todos/1', 'GET');
            expect(result).toEqual({ test: 'data' });
        });

        it('should rethrow if errors', async () => {
            await expect(doRequest('https://INVALIDJSON.com', 'GET')).rejects.toThrow();
        });


        it('should return a cached result if called twice', async () => {
            const key = randomUUID();
            const expected = { test: 'data' };
            expect(await doRequest('https://jsonplaceholder.typicode.com/todos/1', 'GET', {}, key)).toEqual(expected);
            expect(setCacheSpy).toHaveBeenCalledWith(key, JSON.stringify(expected));
            expect(getCacheSpy).toHaveReturnedWith(undefined);
            setCacheSpy.mockClear();
            getCacheSpy.mockClear();
            expect(await doRequest('https://jsonplaceholder.typicode.com/todos/1', 'GET', {}, key)).toEqual(expected);
            expect(setCacheSpy).toHaveBeenCalledTimes(0);
            expect(getCacheSpy).toHaveReturnedWith(expected);
        });

        it('should return a cached result if exists', async () => {
            const key = randomUUID();
            const expected = { test: 'data' };
            const cacheData = JSON.stringify(expected);
            setCache(key, cacheData);
            const result = await doRequest('https://jsonplaceholder.typicode.com/todos/1', 'GET', {}, key);
            expect(result).toEqual(expected);
        });
    });
});