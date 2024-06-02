import { google } from 'googleapis';
import { config } from '../../helpers/Config.js';
import { Series } from '../../types/tvdb/Series.js';
import { log } from '../../helpers/Log.js';

export const channels = async (sonarrSeries: Series[]): Promise<[]> => {
    const { youtube: { apiKey } } = config();

    const youtube = google.youtube({
        version: 'v3',
        auth: apiKey
    });

    for (const series of sonarrSeries) {
        log(`Fetching Episodes from youtube for ${series.name}`);
        const response = await youtube.search.list({
            channelId: series.id.toString(),
            maxResults: 50,
        });

        //  TODO: pagination
        console.log(response);

        return [];
    }
};

