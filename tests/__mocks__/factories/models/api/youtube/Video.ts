import { faker } from '@faker-js/faker';

import { Video as VideoType } from '@sonarrTube/types/youtube/Video';
import { Video } from '@sonarrTube/models/api/youtube/Video';


export const videoFactory = (params: object = {}): Video => new Video(
    {
        title: faker.lorem.words(),
        fulltitle: faker.lorem.words(),
        thumbnail: faker.lorem.words(),
        description: faker.lorem.words(),
        channel_id: faker.lorem.words(),
        channel_url: faker.lorem.words(),
        channel: faker.lorem.words(),
        duration: faker.number.float(),
        view_count: faker.number.int(),
        webpage_url: faker.lorem.words(),
        id: faker.lorem.words(),
        timestamp: faker.number.float(),
        upload_date: faker.lorem.words(),
        ...params
    } as VideoType,
);