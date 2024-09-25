import { typeFactory } from 'tests/__mocks__/factories/Type';

import { Channel as ChannelType } from '@sonarrTube/types/youtube/Channel';
import { Channel } from '@sonarrTube/models/api/youtube/Channel';
import { generateRandomArray } from '@sonarrTube/factories/RandomArray';

export const channelFactory = (params: object = {}): Channel => {
    const channel = new Channel(
        { ...typeFactory('youtube/Channel'), ...params } as ChannelType,
    );

    channel.videos = generateRandomArray().map(_ => typeFactory('youtube/Video'));

    return channel;
};