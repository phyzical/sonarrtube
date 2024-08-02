import { Episode as SonarrEpisode } from '@sonarrTube/models/api/sonarr/Episode.js';
import { Series as SonarrSeries } from '@sonarrTube/models/api/sonarr/Series.js';
import { config } from '@sonarrTube/helpers/Config.js';
import { log } from '@sonarrTube/helpers/Log.js';
import { doRequest } from '@sonarrTube/helpers/Requests.js';
import { Episode } from '@sonarrTube/models/api/tvdb/Episode.js';
import { Series } from '@sonarrTube/models/api/tvdb/Series.js';
import { Constants } from '@sonarrTube/types/config/Constants.js';

const {
    tvdb: {
        apiKey,
    }
} = config();

let token = '';

const login = async (apiKey: string): Promise<string> => {
    if (token) {
        return token;
    }

    log('Logging into tvdb', true);
    const responseData = (
        await doRequest(
            `${Constants.TVDB.API_HOST}/${Constants.TVDB.LOGIN_ENDPOINT}`,
            Constants.REQUESTS.POST,
            Constants.TVDB.HEADERS,
            undefined,
            JSON.stringify({ apiKey })
        )
    ).data;
    log('Logged in');

    token = responseData.token;

    return token;
};


export const series = async (sonarrSeries: SonarrSeries[]): Promise<Series[]> => {
    const token = await login(apiKey);
    const serieses: Series[] = [];

    for (const series of sonarrSeries) {
        log(`Fetching Series ${series.title} (${series.tvdbId}) from tvdb`);

        const tvdbSeries = new Series(
            (await doRequest(
                `${Constants.TVDB.API_HOST}/${Constants.TVDB.SERIES_ENDPOINT}/${series.tvdbId}/extended`,
                Constants.REQUESTS.GET,
                { ...Constants.TVDB.HEADERS, 'Authorization': `Bearer ${token}` },
                series.tvdbCacheKey())
            ).data
        );

        tvdbSeries.episodes = await episodes(series.episodes, tvdbSeries);

        serieses.push(tvdbSeries);
    }


    return serieses;
};

const episodes = async (sonarrEpisodes: SonarrEpisode[], series: Series): Promise<Episode[]> => {
    const token = await login(apiKey);
    const episodes: Episode[] = [];

    for (const episode of sonarrEpisodes) {
        log(`Fetching Episode ${episode.tvdbId} from tvdb`, true);
        episodes.push(
            new Episode(
                (await doRequest(
                    `${Constants.TVDB.API_HOST}/${Constants.TVDB.EPISODES_ENDPOINT}/${episode.tvdbId}/extended`,
                    Constants.REQUESTS.GET,
                    { ...Constants.TVDB.HEADERS, 'Authorization': `Bearer ${token}` },
                    episode.tvdbCacheKey())
                ).data,
                series
            )
        );
    }

    return episodes;
};
