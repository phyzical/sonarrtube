
import { faker } from '@faker-js/faker';

import { Channel as ChannelType } from '@sonarrTube/types/youtube/Channel';
import { Channel } from '@sonarrTube/models/api/youtube/Channel';
import { generateRandomArray } from '@sonarrTube/factories/RandomArray';
import { Video } from '@sonarrTube/models/api/youtube/Video';
import { videoFactory } from '@sonarrTube/factories/models/api/youtube/Video';

export const channelFactory = (params: object = {}, videoCount: undefined | number = undefined): Channel => {
    const channel = new Channel({ tvdbId: faker.number.int(), ...params } as ChannelType);
    channel.videos = generateRandomArray(() => videoFactory(), videoCount, videoCount) as Video[];

    return channel;
};