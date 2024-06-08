import { config } from '../../helpers/Config.js';
import { log } from '../../helpers/Log.js';
import { doRequest } from '../../helpers/Requests.js';
import { Episode } from '../../types/sonarr/Episode.js';
import { Series } from '../../types/sonarr/Series.js';

export const series = async (): Promise<Series[]> => {
    const { sonarr: {
        apiKey,
        host
    } } = config();

    log(`Fetching Youtube Channel Ids from ${host} (sonarr)`);

    //  TODO: add cache
    // expire on env default to a day?

    const seriesResponseData = await doRequest(`${host}/api/v3/series`,
        'GET',
        {
            'accept': 'application/json,text/json',
            'content-type': 'application/json',
            'x-api-key': apiKey,
        }
    );

    const youtubeSeries = (seriesResponseData as Series[]).filter(x => x.network == 'YouTube');

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
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
        )).map((episode: Episode) => {
            // TODO: add flag to allow special season? 
            if (episode.seasonNumber == 0) {
                return null;
            }
            episode.seriesPath = series.path.replace(series.rootFolderPath, '');
            episode.seriesTitle = series.title;

            return episode;
        }).filter(Boolean);
    }

    return youtubeSeries;
};
