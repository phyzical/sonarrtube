import { typeFactory } from 'tests/__mocks__/factories/Type';

import { Video as VideoType } from '@sonarrTube/types/youtube/Video';
import { Video } from '@sonarrTube/models/api/youtube/Video';


export const videoFactory = (): Video => new Video(
    typeFactory('youtube/Video') as VideoType,
);