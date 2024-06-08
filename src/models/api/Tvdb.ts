import { Episode as SonarrEpisode } from './../../types/sonarr/Episode.js';
import { Series as SonarrSeries } from './../../types/sonarr/Series.js';
import { config } from '../../helpers/Config.js';
import { log } from '../../helpers/Log.js';
import { Episode } from '../../types/tvdb/Episode.js';
import { doRequest } from '../../helpers/Requests.js';
import { Series } from '../../types/tvdb/Series.js';

const host = 'https://api4.thetvdb.com/v4';

let token = '';

const login = async (apiKey: string): Promise<string> => {
    if (token) {
        return token;
    }

    log('Logging into tvdb');
    const responseData = (
        await doRequest(`${host}/login`, 'POST', {
            'Content-Type': 'application/json',
        }, null, JSON.stringify({ apiKey }))
    ).data;
    log('Logged in');

    token = responseData.token;

    return token;
};


export const series = async (sonarrSeries: SonarrSeries[]): Promise<Series[]> => {
    const {
        tvdb: {
            apiKey,
        }
    } = config();

    const token = await login(apiKey);
    const serieses = [];

    for (const series of sonarrSeries) {
        log(`Fetching Series ${series.title} (${series.tvdbId}) from tvdb`);

        const tvdbSeries = (await doRequest(`${host}/series/${series.tvdbId}/extended`, 'GET', {
            'accept': 'application/json,text/json',
            'content-type': 'application/json',
            'Authorization': `Bearer ${token}`,
        }, `/tvdb/${series.tvdbId}.json`)).data;

        tvdbSeries.episodes = await episodes(series.tvdbId, series.episodes);

        serieses.push(tvdbSeries);
    }


    return serieses;
};

const episodes = async (seriesTvdbId: number, sonarrEpisodes: SonarrEpisode[]): Promise<Episode[]> => {
    const {
        tvdb: {
            apiKey,
        }
    } = config();

    const token = await login(apiKey);
    const episodes = [];

    for (const episode of sonarrEpisodes) {
        log(`Fetching Episode ${episode.tvdbId} from tvdb`, true);
        episodes.push((await doRequest(`${host}/episodes/${episode.tvdbId}/extended`, 'GET', {
            'accept': 'application/json,text/json',
            'content-type': 'application/json',
            'Authorization': `Bearer ${token}`,
        }, `/tvdb/${seriesTvdbId}/${episode.tvdbId}.json`)).data);
    }

    return episodes;
};
