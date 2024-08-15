import { getCache, setCache } from '@sonarrTube/helpers/Cache.js';

export const doRequest = async (
    url: string, method: string, headers = {}, cacheKey?: string, body?: string
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
): Promise<any> => {
    let json = getCache(cacheKey);

    if (!json) {
        await fetch(url, {
            method,
            headers,
            body
        })
            .then(async response => {
                if (response?.body) {
                    json = (await response.json());
                    setCache(cacheKey, JSON.stringify(json));
                }
            })
            .catch(e => {
                throw e;
            });
    }

    return json;
};
