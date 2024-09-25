import { typeFactory } from 'tests/__mocks__/factories/Type';

import { Video as VideoType } from '@sonarrTube/types/youtube/Video';
import { Video } from '@sonarrTube/models/api/youtube/Video';


export const videoFactory = (params: object = {}): Video => new Video(
    { ...typeFactory('youtube/Video'), ...params } as VideoType,
);