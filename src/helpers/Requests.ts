import { getCache, setCache } from '@sonarrTube/helpers/Cache.js';

export const doRequest = async (
    url: string, method: string, headers = {}, cacheKey?: string, body?: string

): Promise<object | undefined> => {
    let json = getCache(cacheKey) as object | undefined;

    if (!json) {
        await fetch(url, {
            method,
            headers,
            body
        })
            .then(async response => {
                if (response?.body) {
                    json = (await response.json()) as object;
                    setCache(cacheKey, JSON.stringify(json));
                }
            })
            .catch(e => {
                throw e;
            });
    }

    return json;
};
