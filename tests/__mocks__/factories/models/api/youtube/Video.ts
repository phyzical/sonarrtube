import { typeFactory } from 'tests/__mocks__/factories/Type';

import { Video as VideoType } from '@sonarrTube/types/youtube/Video';
import { Video } from '@sonarrTube/models/api/youtube/Video';


export const episodeFactory = (): Video => new Video(
    typeFactory('youtube/Video.ts') as VideoType,
);