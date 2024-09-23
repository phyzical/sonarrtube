
import { videoFactory } from 'tests/__mocks__/factories/models/api/youtube/Video';

import { Video } from '@sonarrTube/models/api/youtube/Video';

describe('Video', () => {
    describe('constructor', () => {
        it('should create an instance of Video', () => {
            expect(videoFactory()).toBeInstanceOf(Video);
        });
    });
});