import { Series as SonarrSeries } from './../../types/sonarr/Series';
import { config } from '../../helpers/Config.js';
import { log } from '../../helpers/Log.js';
import { Series } from '../../types/tvdb/Series';

const host = 'https://api4.thetvdb.com/v4';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const doReq = async (url: string, method: string, body = '', headers = {}): Promise<any> => {
    const request = await fetch(url, {
        method,
        headers,
        body
    });

    return (await request.json()).data;
};


const login = async (apiKey: string): Promise<string> => {
    log('Logging into tvdb');
    const responseData = await doReq(`${host}/login`, 'POST', JSON.stringify({ apiKey }), {
        'Content-Type': 'application/json',
    });
    log('Logged in');

    return responseData.token;
};

export const youtubeChannels = async (sonarrSeries: SonarrSeries[]): Promise<Series[]> => {
    const {
        tvdb: {
            apiKey,
        }
    } = config();

    const token = await login(apiKey);
    const total = [];

    for (const show of sonarrSeries) {
        total.push((await series(token, show)) as Series);
    }

    return total;
};

const series = async (token: string, show: SonarrSeries): Promise<Series> => {
    log(`Fetching tvdb info for ${show.title}`);

    const seriesUrl = `${host}/series/${show.tvdbId}/extended?meta=episodes&short=true`;

    const seriesResponse = await doReq(seriesUrl, 'GET', null, {
        'accept': 'application/json,text/json',
        'content-type': 'application/json',
        'Authorization': `Bearer ${token}`,
    });
    const newEpisodes = [];
    for (const episode of seriesResponse.episodes) {
        const episodeUrl = `${host}/episodes/${episode.id}/extended`;

        const episodeResponse = await doReq(episodeUrl, 'GET', null, {
            'accept': 'application/json,text/json',
            'content-type': 'application/json',
            'Authorization': `Bearer ${token}`,
        });
        newEpisodes.push(episodeResponse);
    }
    seriesResponse.episodes = newEpisodes;

    return seriesResponse;
};