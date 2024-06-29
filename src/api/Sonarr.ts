import { config } from '../helpers/Config.js';
import { log } from '../helpers/Log.js';
import { doRequest } from '../helpers/Requests.js';
import { Episode } from '../models/api/sonarr/Episode.js';
import { Series } from '../models/api/sonarr/Series.js';
import { Episode as EpisodeType } from '../types/sonarr/Episode.js';
import { Series as SeriesType } from '../types/sonarr/Series.js';

const { sonarr: {
    apiKey,
    host
} } = config();

export const series = async (): Promise<Series[]> => {
    log(`Fetching Youtube Channel Ids from ${host} (sonarr)`);

    const youtubeSeries = (await doRequest(`${host}/api/v3/series`,
        'GET',
        {
            'accept': 'application/json,text/json',
            'content-type': 'application/json',
            'x-api-key': apiKey,
        }
    ))
        .map((series: SeriesType) => new Series(series))
        .filter(x => x.network == 'YouTube');

    log(`Found: ${youtubeSeries.map(x => x.title).join(', ')}`);

    for (const series of youtubeSeries) {
        log(`Fetching Episodes for ${series.title} from sonarr`, true);
        series.episodes = (await doRequest(`${host}/api/v3/episode?seriesId=${series.id}`,
            'GET',
            {
                'accept': 'application/json,text/json',
                'content-type': 'application/json',
                'x-api-key': apiKey
            }
        ))
            .map((episode: EpisodeType) => new Episode(episode, series))
            .filter((episode: Episode) => episode.seasonNumber != 0);
    }

    return youtubeSeries;
};
