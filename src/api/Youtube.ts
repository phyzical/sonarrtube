import { Channel as ChannelType } from '@sonarrTube/types/youtube/Channel.js';
import { Channel } from '@sonarrTube/models/api/youtube/Channel.js';
import { log } from '@sonarrTube/helpers/Log.js';
import { Series } from '@sonarrTube/models/api/tvdb/Series.js';
import { getVideoInfos } from '@sonarrTube/api/Ytdlp.js';
import { Constants } from '@sonarrTube/types/config/Constants.js';

export const channels = async (tvdbSeries: Series[]): Promise<Channel[]> => {

    const channels: Channel[] = [];

    for (const series of tvdbSeries) {
        log(`Fetching Episodes from youtube for ${series.name}`);
        const channel = new Channel({ tvdbId: series.id } as ChannelType);

        //search for a youtube link containing /videos or /playlist first
        const url = series.remoteIds.find(remote => remote.id.match(/youtube.com.*(playlist|videos).*/))?.id;
        if (url) {
            channel.url = url;
            channel.videos = getVideoInfos(
                series.name,
                channel.url
            );
            if (channel.videos.length > 0) {
                channel.id = channel.videos[0].channel_id;
            }
        }

        if (!channel.id) {
            // Then look for channel url
            const remoteId = series.remoteIds.find(remote => remote.id.match(/youtube.com\/c(hannel)*\//));

            if (remoteId) {
                const splits = remoteId.id.split('/');
                channel.id = splits[splits.length - 1];
            } else {
                // then fallback to looking for a source name with youtube for a channel id lookup
                channel.id = series.remoteIds.find(remote => remote.sourceName.toLowerCase() == 'youtube')?.id;
            }
        }

        if (channel.id && channel.videos.length == 0) {
            channel.url = `${Constants.YOUTUBE.HOST}/channel/${channel.id}/videos`;
            channel.videos = getVideoInfos(series.name, channel.url);
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
