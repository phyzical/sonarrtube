import { config } from '../../helpers/Config.js';
import { log } from '../../helpers/Log.js';
import { Episode } from '../../types/sonarr/Episode.js';
import { Series } from '../../types/sonarr/Series.js';

export const youtubeChannels = async (): Promise<Series[]> => {
    const { sonarr: {
        apiKey,
        host
    } } = config();

    log(`Fetching Youtube Channel Ids from ${host}`);

    const url = `${host}/api/v3/series`;

    const seriesResponse = await fetch(url, {
        method: 'GET',
        headers: {
            'accept': 'application/json,text/json',
            'content-type': 'application/json',
            'x-api-key': apiKey,
        }
    });

    const youtubeSeries = ((await seriesResponse.json()) as Series[]).filter(x => x.network == 'YouTube');

    log(`Found: ${youtubeSeries.map(x => x.title).join(', ')}`);

    for (const series of youtubeSeries) {
        log(`Fetching Episodes for ${series.title}`);
        const episodeResponse = await fetch(`${host}/api/v3/episode?seriesId=${series.id}`, {
            method: 'GET',
            headers: {
                'accept': 'application/json,text/json',
                'content-type': 'application/json',
                'x-api-key': apiKey
            }
        });
        series.episodes = (await episodeResponse.json()) as Episode[];
    }

    return youtubeSeries;
};
