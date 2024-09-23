
import { seriesFactory } from 'tests/__mocks__/factories/models/api/tvdb/Series';

import { Series } from '@sonarrTube/models/api/tvdb/Series';

describe('Series', () => {
    describe('constructor', () => {
        it('should create an instance of Series', () => {
            expect(seriesFactory()).toBeInstanceOf(Series);
        });
    });
});