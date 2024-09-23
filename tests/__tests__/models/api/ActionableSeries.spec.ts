import { actionableSeriesFactory } from 'tests/__mocks__/factories/models/api/ActionableSeries';

import { ActionableSeries } from '@sonarrTube/models/api/ActionableSeries';

describe('ActionableSeries', () => {
    describe('constructor', () => {
        it('should create an instance of ActionableSeries', () => {
            expect(actionableSeriesFactory()).toBeInstanceOf(ActionableSeries);
        });
    });
});