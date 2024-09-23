import { typeFactory } from 'tests/__mocks__/factories/Type';

import { ActionableVideo } from '@sonarrTube/models/api/ActionableVideo.js';
import { ActionableVideo as ActionableVideoType } from '@sonarrTube/types/ActionableVideo.js';

export const actionableVideoFactory = (): ActionableVideo => new ActionableVideo(
    typeFactory('ActionableVideo.ts') as ActionableVideoType
);