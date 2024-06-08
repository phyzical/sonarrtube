import { log } from '../../helpers/Log.js';
import { Series } from '../../types/tvdb/Series.js';
import { Channel } from '../../types/youtube/Channel.js';
import { getChannelVideoInfos, getVideoInfos } from './Ytdlp.js';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const channels = async (tvdbSeries: Series[]): Promise<any[]> => {

    const channels = [];

    for (const series of tvdbSeries) {
        log(`Fetching Episodes from youtube for ${series.name}`);
        const channel = { tvdbId: series.id } as Channel;

        //search for a youtube link containing /videos or /playlist first
        channel.videos = getVideoInfos(
            series.name,
            series.remoteIds.find(remote => remote.id.match(/youtube.com.*(playlist|videos).*/))?.id
        );

        // Then look for channel url
        const remoteId = series.remoteIds.find(remote => remote.id.match(/youtube.com\/c(hannel)*\//));

        if (remoteId) {
            const splits = remoteId.id.split('/');
            channel.id = splits[splits.length - 1];
        }

        // then fallback to looking for a source name with youtube for a channel id lookup
        if (!channel.id) {
            channel.id = series.remoteIds.find(remote => remote.sourceName.toLowerCase() == 'youtube')?.id;
        }

        if (channel.id && !channel.videos) {
            channel.videos = getChannelVideoInfos(series.name, channel.id);
        }

        if (!channel.id) {
            log(`Warning Could not get youtube channel id for ${series.name}, Skipping`);
            continue;
        }

        if (!channel.videos) {
            log(`Warning videos could not be found from youtube for ${series.name}, Skipping`);
            continue;
        }

        channels.push(channel);
    }

    return channels;
};
