
import { channelFactory } from '@sonarrTube/factories/models/api/youtube/Channel';
import { Channel } from '@sonarrTube/models/api/youtube/Channel';

describe('Channel', () => {
    describe('constructor', () => {
        it('should create an instance of Channel', () => {
            expect(channelFactory()).toBeInstanceOf(Channel);
        });
    });
});