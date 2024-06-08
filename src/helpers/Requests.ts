import { getCache, setCache } from './Cache.js';

export const doRequest = async (
    url: string, method: string, headers = {}, cacheKey: string = null, body: string = null
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
                json = (await response.json());
                setCache(cacheKey, JSON.stringify(json));
            })
            .catch(e => {
                throw e;
            });
    }

    return json;
};
