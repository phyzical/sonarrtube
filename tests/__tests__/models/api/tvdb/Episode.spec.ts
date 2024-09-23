
import { episodeFactory } from 'tests/__mocks__/factories/models/api/tvdb/Episode';

import { Episode } from '@sonarrTube/models/api/tvdb/Episode';

describe('Episode', () => {
    describe('constructor', () => {
        it('should create an instance of Episode', () => {
            expect(episodeFactory()).toBeInstanceOf(Episode);
        });
    });
});