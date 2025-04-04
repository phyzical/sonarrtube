import { config } from '@sonarrTube/helpers/Config.js';
import { log } from '@sonarrTube/helpers/Log.js';
import { doRequest } from '@sonarrTube/helpers/Requests.js';
import { Episode } from '@sonarrTube/models/api/sonarr/Episode.js';
import { Series } from '@sonarrTube/models/api/sonarr/Series.js';
import { Constants } from '@sonarrTube/types/config/Constants.js';
import { Episode as EpisodeType } from '@sonarrTube/types/sonarr/Episode.js';
import { Series as SeriesType } from '@sonarrTube/types/sonarr/Series.js';

export const series = async (): Promise<Series[]> => {
    const {
        sonarr: {
            apiKey,
            host
        },
        tvdb: {
            skipSeriesIds,
            matchSeriesIds
        },
    } = config();

    log(`Fetching Youtube Channel Ids from ${host} (sonarr)`);

    const youtubeSeries = (await doRequest(`${host}/${Constants.SONARR.SERIES_ENDPOINT}`,
        Constants.REQUESTS.GET,
        { ...Constants.SONARR.HEADERS, 'x-api-key': apiKey }
    ) as SeriesType[])
        .map((series: SeriesType) => new Series(series))
        .filter((series: Series) => series.network == 'YouTube' &&
            (skipSeriesIds.length == 0 || !skipSeriesIds.includes(series.tvdbId)) &&
            (matchSeriesIds.length == 0 || matchSeriesIds.includes(series.tvdbId))
        );

    log(`Found: ${youtubeSeries.map(x => x.title).join(', ')}`);

    for (const series of youtubeSeries) {
        log(`Fetching Episodes for ${series.title} from sonarr`, true);
        series.episodes = (await doRequest(`${host}/${Constants.SONARR.EPISODE_BY_SERIES_ENDPOINT}${series.id}`,
            Constants.REQUESTS.GET,
            { ...Constants.SONARR.HEADERS, 'x-api-key': apiKey }
        ) as EpisodeType[])
            .map((episode: EpisodeType) => new Episode(episode, series))
            .filter((episode: Episode) => episode.seasonNumber != 0);
    }

    return youtubeSeries;
};
