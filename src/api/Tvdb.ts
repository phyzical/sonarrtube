import { Episode as SonarrEpisode } from '../models/api/sonarr/Episode.js';
import { Series as SonarrSeries } from '../models/api/sonarr/Series.js';
import { config } from '../helpers/Config.js';
import { log } from '../helpers/Log.js';
import { doRequest } from '../helpers/Requests.js';
import { Episode } from '../models/api/tvdb/Episode.js';
import { Series } from '../models/api/tvdb/Series.js';

const {
    tvdb: {
        apiKey,
    }
} = config();

const host = 'https://api4.thetvdb.com/v4';

let token = '';

const login = async (apiKey: string): Promise<string> => {
    if (token) {
        return token;
    }

    log('Logging into tvdb', true);
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
    const token = await login(apiKey);
    const serieses = [];

    for (const series of sonarrSeries) {
        log(`Fetching Series ${series.title} (${series.tvdbId}) from tvdb`);

        const tvdbSeries = new Series(
            (await doRequest(`${host}/series/${series.tvdbId}/extended`, 'GET', {
                'accept': 'application/json,text/json',
                'content-type': 'application/json',
                'Authorization': `Bearer ${token}`,
            }, series.tvdbCacheKey())).data
        );

        tvdbSeries.episodes = await episodes(series.episodes, tvdbSeries);

        serieses.push(tvdbSeries);
    }


    return serieses;
};

const episodes = async (sonarrEpisodes: SonarrEpisode[], series: Series): Promise<Episode[]> => {
    const token = await login(apiKey);
    const episodes = [];

    for (const episode of sonarrEpisodes) {
        log(`Fetching Episode ${episode.tvdbId} from tvdb`, true);
        episodes.push(
            new Episode(
                (await doRequest(`${host}/episodes/${episode.tvdbId}/extended`, 'GET', {
                    'accept': 'application/json,text/json',
                    'content-type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                }, episode.tvdbCacheKey())).data,
                series
            )
        );
    }

    return episodes;
};
